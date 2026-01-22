import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import dbConnect from '@/lib/db';
import User from '@/models/User';
import Organization from '@/models/Organization';
import { subDays, format } from 'date-fns';

// GET - Org Admin Analytics
export async function GET(request: NextRequest) {
    try {
        const session = await getServerSession(authOptions);
        if (!session?.user) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        await dbConnect();
        // @ts-ignore
        const admin = await User.findById(session.user.id);

        if (admin?.role !== 'org_admin' && admin?.role !== 'super_admin') {
            return NextResponse.json({ error: 'Forbidden - Admin only' }, { status: 403 });
        }

        if (!admin.organizationId) {
            return NextResponse.json({ error: 'No organization assigned' }, { status: 400 });
        }

        // Get organization
        const organization = await Organization.findById(admin.organizationId).lean();
        if (!organization) {
            return NextResponse.json({ error: 'Organization not found' }, { status: 404 });
        }

        // Get all team members
        const teamMembers = await User.find({ organizationId: admin.organizationId }).lean();

        // Calculate metrics
        const totalMembers = teamMembers.length;

        // Calculate licenses
        let totalLicenses = 0;
        let usedLicenses = 0;
        organization.labLicenses?.forEach((license: any) => {
            totalLicenses += license.totalLicenses;
            usedLicenses += license.usedLicenses;
        });

        // Calculate total launches
        let totalLaunches = 0;
        teamMembers.forEach(member => {
            member.purchasedLabs?.forEach((lab: any) => {
                totalLaunches += lab.launchCount || 0;
            });
        });

        // Active users (launched in last 7 days)
        const sevenDaysAgo = subDays(new Date(), 7);
        const activeUsers = teamMembers.filter(member => {
            return member.purchasedLabs?.some((lab: any) => {
                return lab.launchHistory?.some((launch: any) =>
                    new Date(launch.launchedAt) >= sevenDaysAgo
                );
            });
        }).length;

        // Team growth (last 30 days)
        const thirtyDaysAgo = subDays(new Date(), 30);
        const teamGrowthMap = new Map<string, number>();

        teamMembers.forEach(member => {
            const createdDate = new Date(member.createdAt);
            if (createdDate >= thirtyDaysAgo) {
                const dateKey = format(createdDate, 'yyyy-MM-dd');
                teamGrowthMap.set(dateKey, (teamGrowthMap.get(dateKey) || 0) + 1);
            }
        });

        const teamGrowth = Array.from(teamGrowthMap.entries())
            .map(([date, count]) => ({ date, count }))
            .sort((a, b) => a.date.localeCompare(b.date));

        // License usage trend (last 30 days)
        const licenseUsage = Array.from({ length: 30 }, (_, i) => {
            const date = format(subDays(new Date(), 29 - i), 'yyyy-MM-dd');
            return { date, used: usedLicenses }; // Simplified - would need historical data
        });

        // Course distribution
        const courseCountMap = new Map<string, number>();
        teamMembers.forEach(member => {
            member.purchasedLabs?.forEach((lab: any) => {
                const courseId = lab.courseId.toUpperCase();
                courseCountMap.set(courseId, (courseCountMap.get(courseId) || 0) + 1);
            });
        });

        const courseDistribution = Array.from(courseCountMap.entries())
            .map(([courseId, count]) => ({ courseId, count }))
            .sort((a, b) => b.count - a.count);

        // Top users by launches
        const topUsers = teamMembers
            .map(member => {
                let launches = 0;
                member.purchasedLabs?.forEach((lab: any) => {
                    launches += lab.launchCount || 0;
                });
                return {
                    name: member.name,
                    email: member.email,
                    launches,
                    courses: member.purchasedLabs?.length || 0,
                };
            })
            .sort((a, b) => b.launches - a.launches)
            .slice(0, 10);

        // Launch history (last 30 days)
        const launchHistoryMap = new Map<string, number>();
        teamMembers.forEach(member => {
            member.purchasedLabs?.forEach((lab: any) => {
                lab.launchHistory?.forEach((launch: any) => {
                    const launchDate = new Date(launch.launchedAt);
                    if (launchDate >= thirtyDaysAgo) {
                        const dateKey = format(launchDate, 'yyyy-MM-dd');
                        launchHistoryMap.set(dateKey, (launchHistoryMap.get(dateKey) || 0) + 1);
                    }
                });
            });
        });

        const launchHistory = Array.from(launchHistoryMap.entries())
            .map(([date, launches]) => ({ date, launches }))
            .sort((a, b) => a.date.localeCompare(b.date));

        // Calculate growth percentages
        const lastWeekMembers = teamMembers.filter(m => new Date(m.createdAt) >= sevenDaysAgo).length;
        const previousWeekMembers = teamMembers.filter(m => {
            const date = new Date(m.createdAt);
            return date >= subDays(new Date(), 14) && date < sevenDaysAgo;
        }).length;
        const memberGrowthPercent = previousWeekMembers > 0
            ? ((lastWeekMembers - previousWeekMembers) / previousWeekMembers) * 100
            : 0;

        return NextResponse.json({
            metrics: {
                totalMembers,
                totalLicenses,
                usedLicenses,
                availableLicenses: totalLicenses - usedLicenses,
                totalLaunches,
                activeUsers,
                memberGrowthPercent,
            },
            teamGrowth,
            licenseUsage,
            courseDistribution,
            topUsers,
            launchHistory,
        });
    } catch (error: any) {
        console.error('[Org Admin] Analytics error:', error);
        return NextResponse.json({ error: 'Failed to fetch analytics' }, { status: 500 });
    }
}
