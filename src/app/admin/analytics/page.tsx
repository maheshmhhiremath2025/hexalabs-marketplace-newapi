import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { redirect } from 'next/navigation';
import dbConnect from '@/lib/db';
import User from '@/models/User';
import OrgAdminAnalyticsClient from './AnalyticsClient';

export default async function OrgAdminAnalyticsPage() {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
        redirect('/auth/signin');
    }

    await dbConnect();
    // @ts-ignore
    const user = await User.findById(session.user.id);

    if (user?.role !== 'org_admin' && user?.role !== 'super_admin') {
        redirect('/dashboard');
    }

    // Fetch analytics data
    const response = await fetch(`${process.env.NEXTAUTH_URL}/api/admin/analytics`, {
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
                totalMembers: 0,
                totalLicenses: 0,
                usedLicenses: 0,
                availableLicenses: 0,
                totalLaunches: 0,
                activeUsers: 0,
                memberGrowthPercent: 0,
            },
            teamGrowth: [],
            licenseUsage: [],
            courseDistribution: [],
            topUsers: [],
            launchHistory: [],
        };
    }

    return (
        <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100">
            <div className="container mx-auto px-4 py-8">
                {/* Header */}
                <div className="mb-8">
                    <h1 className="text-3xl font-bold text-slate-900 mb-2">Team Analytics</h1>
                    <p className="text-slate-600">Insights into your team's performance and engagement</p>
                </div>

                <OrgAdminAnalyticsClient initialData={analyticsData} />
            </div>
        </div>
    );
}
