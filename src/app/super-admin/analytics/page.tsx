import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { redirect } from 'next/navigation';
import dbConnect from '@/lib/db';
import User from '@/models/User';
import SuperAdminAnalyticsClient from './AnalyticsClient';

export default async function SuperAdminAnalyticsPage() {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
        redirect('/auth/signin');
    }

    await dbConnect();
    // @ts-ignore
    const user = await User.findById(session.user.id);

    if (user?.role !== 'super_admin') {
        redirect('/dashboard');
    }

    // Fetch analytics data
    const response = await fetch(`${process.env.NEXTAUTH_URL}/api/super-admin/analytics`, {
        headers: {
            cookie: `next-auth.session-token=${session}`,
        },
        cache: 'no-store',
    });

    let analyticsData;
    if (response.ok) {
        analyticsData = await response.json();
    } else {
        // Fallback data
        analyticsData = {
            metrics: {
                totalUsers: 0,
                totalOrganizations: 0,
                totalCourseAssignments: 0,
                licenseUtilization: '0',
                userGrowthPercent: 0,
                orgGrowthPercent: 0,
            },
            userGrowth: [],
            orgGrowth: [],
            courseDistribution: [],
            topOrganizations: [],
        };
    }

    return (
        <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100">
            <div className="container mx-auto px-4 py-8">
                {/* Header */}
                <div className="mb-8">
                    <h1 className="text-3xl font-bold text-slate-900 mb-2">Platform Analytics</h1>
                    <p className="text-slate-600">Comprehensive insights into platform performance and usage</p>
                </div>

                <SuperAdminAnalyticsClient initialData={analyticsData} />
            </div>
        </div>
    );
}
