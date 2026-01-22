import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import dbConnect from '@/lib/db';
import User from '@/models/User';
import Organization from '@/models/Organization';
import { subDays, format } from 'date-fns';

// GET - Super Admin Analytics
export async function GET(request: NextRequest) {
    try {
        const session = await getServerSession(authOptions);
        if (!session?.user) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        await dbConnect();
        // @ts-ignore
        const admin = await User.findById(session.user.id);

        if (admin?.role !== 'super_admin') {
            return NextResponse.json({ error: 'Forbidden - Super Admin only' }, { status: 403 });
        }

        // Get all data
        const users = await User.find().lean();
        const organizations = await Organization.find().lean();

        // Calculate metrics
        const totalUsers = users.length;
        const totalOrganizations = organizations.length;

        // Count total course assignments
        let totalCourseAssignments = 0;
        users.forEach(user => {
            totalCourseAssignments += user.purchasedLabs?.length || 0;
        });

        // Calculate license utilization
        let totalLicenses = 0;
        let usedLicenses = 0;
        organizations.forEach(org => {
            org.labLicenses?.forEach((license: any) => {
                totalLicenses += license.totalLicenses;
                usedLicenses += license.usedLicenses;
            });
        });
        const licenseUtilization = totalLicenses > 0 ? ((usedLicenses / totalLicenses) * 100).toFixed(1) : '0';

        // User growth (last 30 days)
        const thirtyDaysAgo = subDays(new Date(), 30);
        const userGrowthMap = new Map<string, number>();

        users.forEach(user => {
            const createdDate = new Date(user.createdAt);
            if (createdDate >= thirtyDaysAgo) {
                const dateKey = format(createdDate, 'yyyy-MM-dd');
                userGrowthMap.set(dateKey, (userGrowthMap.get(dateKey) || 0) + 1);
            }
        });

        const userGrowth = Array.from(userGrowthMap.entries())
            .map(([date, count]) => ({ date, count }))
            .sort((a, b) => a.date.localeCompare(b.date));

        // Organization growth (last 6 months)
        const orgGrowthMap = new Map<string, number>();
        organizations.forEach(org => {
            const month = format(new Date(org.createdAt), 'MMM yyyy');
            orgGrowthMap.set(month, (orgGrowthMap.get(month) || 0) + 1);
        });

        const orgGrowth = Array.from(orgGrowthMap.entries())
            .map(([month, count]) => ({ month, count }))
            .slice(-6);

        // Course distribution (top 10)
        const courseCountMap = new Map<string, number>();
        users.forEach(user => {
            user.purchasedLabs?.forEach((lab: any) => {
                const courseId = lab.courseId.toUpperCase();
                courseCountMap.set(courseId, (courseCountMap.get(courseId) || 0) + 1);
            });
        });

        const courseDistribution = Array.from(courseCountMap.entries())
            .map(([courseId, count]) => ({ courseId, count }))
            .sort((a, b) => b.count - a.count)
            .slice(0, 10);

        // Top organizations
        const topOrganizations = organizations
            .map(org => {
                const userCount = users.filter(u => u.organizationId?.toString() === org._id.toString()).length;
                const licenseCount = org.labLicenses?.length || 0;
                return {
                    name: org.name,
                    users: userCount,
                    licenses: licenseCount,
                };
            })
            .sort((a, b) => b.users - a.users)
            .slice(0, 10);

        // Calculate growth percentages
        const lastWeekUsers = users.filter(u => new Date(u.createdAt) >= subDays(new Date(), 7)).length;
        const previousWeekUsers = users.filter(u => {
            const date = new Date(u.createdAt);
            return date >= subDays(new Date(), 14) && date < subDays(new Date(), 7);
        }).length;
        const userGrowthPercent = previousWeekUsers > 0
            ? ((lastWeekUsers - previousWeekUsers) / previousWeekUsers) * 100
            : 0;

        const lastWeekOrgs = organizations.filter(o => new Date(o.createdAt) >= subDays(new Date(), 7)).length;
        const previousWeekOrgs = organizations.filter(o => {
            const date = new Date(o.createdAt);
            return date >= subDays(new Date(), 14) && date < subDays(new Date(), 7);
        }).length;
        const orgGrowthPercent = previousWeekOrgs > 0
            ? ((lastWeekOrgs - previousWeekOrgs) / previousWeekOrgs) * 100
            : 0;

        return NextResponse.json({
            metrics: {
                totalUsers,
                totalOrganizations,
                totalCourseAssignments,
                licenseUtilization,
                userGrowthPercent,
                orgGrowthPercent,
            },
            userGrowth,
            orgGrowth,
            courseDistribution,
            topOrganizations,
        });
    } catch (error: any) {
        console.error('[Super Admin] Analytics error:', error);
        return NextResponse.json({ error: 'Failed to fetch analytics' }, { status: 500 });
    }
}
