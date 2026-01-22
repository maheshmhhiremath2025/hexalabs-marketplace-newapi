import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { redirect } from 'next/navigation';
import dbConnect from '@/lib/db';
import User from '@/models/User';
import Organization from '@/models/Organization';
import Link from 'next/link';
import { Users, BookOpen, Activity, Package } from 'lucide-react';

export default async function OrgAdminDashboard() {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
        redirect('/auth/signin');
    }

    await dbConnect();
    // @ts-ignore
    const admin = await User.findById(session.user.id);

    if (admin?.role !== 'org_admin' && admin?.role !== 'super_admin') {
        redirect('/dashboard');
    }

    // Get organization details
    const organization = await Organization.findById(admin.organizationId);

    // Get team members count
    const teamMembersCount = await User.countDocuments({
        organizationId: admin.organizationId,
        role: 'user'
    });

    // Calculate total and used licenses
    let totalLicenses = 0;
    let usedLicenses = 0;
    if (organization?.labLicenses) {
        organization.labLicenses.forEach((license: any) => {
            totalLicenses += license.totalLicenses;
            usedLicenses += license.usedLicenses;
        });
    }

    // Get users with active sessions
    const activeSessions = await User.countDocuments({
        organizationId: admin.organizationId,
        'purchasedLabs.activeSession': { $exists: true, $ne: null }
    });

    return (
        <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100">
            <div className="container mx-auto px-4 py-8">
                {/* Header */}
                <div className="mb-8">
                    <h1 className="text-3xl font-bold text-slate-900 mb-2">
                        {organization?.name || 'Organization'} - Admin Panel
                    </h1>
                    <p className="text-slate-600">Manage your team and lab licenses</p>
                </div>

                {/* Stats Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                    {/* Team Members */}
                    <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6 hover:shadow-md transition-shadow">
                        <div className="flex items-center justify-between mb-4">
                            <div className="p-3 bg-blue-100 rounded-lg">
                                <Users className="w-6 h-6 text-blue-600" />
                            </div>
                            <span className="text-sm text-slate-500">Total</span>
                        </div>
                        <h3 className="text-2xl font-bold text-slate-900">{teamMembersCount}</h3>
                        <p className="text-sm text-slate-600 mt-1">Team Members</p>
                    </div>

                    {/* Lab Licenses */}
                    <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6 hover:shadow-md transition-shadow">
                        <div className="flex items-center justify-between mb-4">
                            <div className="p-3 bg-green-100 rounded-lg">
                                <Package className="w-6 h-6 text-green-600" />
                            </div>
                            <span className="text-sm text-slate-500">Available</span>
                        </div>
                        <h3 className="text-2xl font-bold text-slate-900">{usedLicenses}/{totalLicenses}</h3>
                        <p className="text-sm text-slate-600 mt-1">Licenses Used</p>
                    </div>

                    {/* Active Sessions */}
                    <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6 hover:shadow-md transition-shadow">
                        <div className="flex items-center justify-between mb-4">
                            <div className="p-3 bg-purple-100 rounded-lg">
                                <Activity className="w-6 h-6 text-purple-600" />
                            </div>
                            <span className="text-sm text-slate-500">Now</span>
                        </div>
                        <h3 className="text-2xl font-bold text-slate-900">{activeSessions}</h3>
                        <p className="text-sm text-slate-600 mt-1">Active Sessions</p>
                    </div>

                    {/* Lab Types */}
                    <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6 hover:shadow-md transition-shadow">
                        <div className="flex items-center justify-between mb-4">
                            <div className="p-3 bg-orange-100 rounded-lg">
                                <BookOpen className="w-6 h-6 text-orange-600" />
                            </div>
                            <span className="text-sm text-slate-500">Types</span>
                        </div>
                        <h3 className="text-2xl font-bold text-slate-900">{organization?.labLicenses?.length || 0}</h3>
                        <p className="text-sm text-slate-600 mt-1">Lab Types</p>
                    </div>
                </div>

                {/* Quick Actions */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
                    <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
                        <h2 className="text-lg font-semibold text-slate-900 mb-4">Quick Actions</h2>
                        <div className="space-y-3">
                            <Link
                                href="/admin/team"
                                className="block w-full px-4 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium transition-colors text-center"
                            >
                                Manage Team
                            </Link>
                            <Link
                                href="/admin/licenses"
                                className="block w-full px-4 py-3 bg-green-600 hover:bg-green-700 text-white rounded-lg font-medium transition-colors text-center"
                            >
                                View Licenses
                            </Link>
                            <Link
                                href="/catalog"
                                className="block w-full px-4 py-3 bg-purple-600 hover:bg-purple-700 text-white rounded-lg font-medium transition-colors text-center"
                            >
                                Purchase Labs
                            </Link>
                            <Link
                                href="/admin/analytics"
                                className="block w-full px-4 py-3 bg-orange-600 hover:bg-orange-700 text-white rounded-lg font-medium transition-colors text-center"
                            >
                                View Analytics
                            </Link>
                        </div>
                    </div>

                    {/* Lab Licenses Overview */}
                    <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
                        <h2 className="text-lg font-semibold text-slate-900 mb-4">Your Lab Licenses</h2>
                        <div className="space-y-3">
                            {!organization?.labLicenses || organization.labLicenses.length === 0 ? (
                                <p className="text-sm text-slate-500">No licenses purchased yet</p>
                            ) : (
                                organization.labLicenses.slice(0, 3).map((license: any, index: number) => (
                                    <div key={index} className="flex items-center justify-between p-3 bg-slate-50 rounded-lg">
                                        <div>
                                            <p className="font-medium text-slate-900">{license.courseId.toUpperCase()}</p>
                                            <p className="text-xs text-slate-500">
                                                {license.usedLicenses}/{license.totalLicenses} used
                                            </p>
                                        </div>
                                        <div className="text-right">
                                            <p className="text-sm font-medium text-slate-900">
                                                {license.totalLicenses - license.usedLicenses} available
                                            </p>
                                            <p className="text-xs text-slate-500">
                                                Expires {new Date(license.expiresAt).toLocaleDateString()}
                                            </p>
                                        </div>
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
