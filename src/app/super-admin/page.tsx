import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { redirect } from 'next/navigation';
import dbConnect from '@/lib/db';
import User from '@/models/User';
import Organization from '@/models/Organization';
import Link from 'next/link';
import { Building2, Users, DollarSign, Activity } from 'lucide-react';

export default async function SuperAdminDashboard() {
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

    // Get platform statistics
    const totalOrgs = await Organization.countDocuments();
    const totalUsers = await User.countDocuments();
    const activeOrgs = await Organization.countDocuments({ isActive: true });

    // Get all users with active sessions
    const usersWithSessions = await User.countDocuments({
        'purchasedLabs.activeSession': { $exists: true, $ne: null }
    });

    // Get recent organizations
    const recentOrgs = await Organization.find()
        .sort({ createdAt: -1 })
        .limit(5)
        .lean();

    return (
        <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100">
            <div className="container mx-auto px-4 py-8">
                {/* Header */}
                <div className="mb-8">
                    <h1 className="text-3xl font-bold text-slate-900 mb-2">Super Admin Dashboard</h1>
                    <p className="text-slate-600">Platform overview and management</p>
                </div>

                {/* Stats Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                    {/* Total Organizations */}
                    <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6 hover:shadow-md transition-shadow">
                        <div className="flex items-center justify-between mb-4">
                            <div className="p-3 bg-blue-100 rounded-lg">
                                <Building2 className="w-6 h-6 text-blue-600" />
                            </div>
                            <span className="text-sm text-slate-500">Total</span>
                        </div>
                        <h3 className="text-2xl font-bold text-slate-900">{totalOrgs}</h3>
                        <p className="text-sm text-slate-600 mt-1">Organizations</p>
                    </div>

                    {/* Total Users */}
                    <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6 hover:shadow-md transition-shadow">
                        <div className="flex items-center justify-between mb-4">
                            <div className="p-3 bg-green-100 rounded-lg">
                                <Users className="w-6 h-6 text-green-600" />
                            </div>
                            <span className="text-sm text-slate-500">Total</span>
                        </div>
                        <h3 className="text-2xl font-bold text-slate-900">{totalUsers}</h3>
                        <p className="text-sm text-slate-600 mt-1">Users</p>
                    </div>

                    {/* Active Organizations */}
                    <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6 hover:shadow-md transition-shadow">
                        <div className="flex items-center justify-between mb-4">
                            <div className="p-3 bg-purple-100 rounded-lg">
                                <Activity className="w-6 h-6 text-purple-600" />
                            </div>
                            <span className="text-sm text-slate-500">Active</span>
                        </div>
                        <h3 className="text-2xl font-bold text-slate-900">{activeOrgs}</h3>
                        <p className="text-sm text-slate-600 mt-1">Active Orgs</p>
                    </div>

                    {/* Active Sessions */}
                    <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6 hover:shadow-md transition-shadow">
                        <div className="flex items-center justify-between mb-4">
                            <div className="p-3 bg-orange-100 rounded-lg">
                                <Activity className="w-6 h-6 text-orange-600" />
                            </div>
                            <span className="text-sm text-slate-500">Now</span>
                        </div>
                        <h3 className="text-2xl font-bold text-slate-900">{usersWithSessions}</h3>
                        <p className="text-sm text-slate-600 mt-1">Active Sessions</p>
                    </div>
                </div>

                {/* Quick Actions */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
                    <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
                        <h2 className="text-lg font-semibold text-slate-900 mb-4">Quick Actions</h2>
                        <div className="space-y-3">
                            <Link
                                href="/super-admin/organizations"
                                className="block w-full px-4 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium transition-colors text-center"
                            >
                                Manage Organizations
                            </Link>
                            <Link
                                href="/super-admin/users"
                                className="block w-full px-4 py-3 bg-slate-600 hover:bg-slate-700 text-white rounded-lg font-medium transition-colors text-center"
                            >
                                View All Users
                            </Link>
                            <Link
                                href="/super-admin/analytics"
                                className="block w-full px-4 py-3 bg-purple-600 hover:bg-purple-700 text-white rounded-lg font-medium transition-colors text-center"
                            >
                                View Analytics
                            </Link>
                        </div>
                    </div>

                    {/* Recent Organizations */}
                    <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
                        <h2 className="text-lg font-semibold text-slate-900 mb-4">Recent Organizations</h2>
                        <div className="space-y-3">
                            {recentOrgs.length === 0 ? (
                                <p className="text-sm text-slate-500">No organizations yet</p>
                            ) : (
                                recentOrgs.map((org: any) => (
                                    <div key={org._id.toString()} className="flex items-center justify-between p-3 bg-slate-50 rounded-lg">
                                        <div>
                                            <p className="font-medium text-slate-900">{org.name}</p>
                                            <p className="text-xs text-slate-500">{org.contactEmail}</p>
                                        </div>
                                        <Link
                                            href={`/super-admin/organizations/${org._id}`}
                                            className="text-sm text-blue-600 hover:text-blue-700 font-medium"
                                        >
                                            View
                                        </Link>
                                    </div>
                                ))
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
