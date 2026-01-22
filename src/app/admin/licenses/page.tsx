import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { redirect } from 'next/navigation';
import dbConnect from '@/lib/db';
import User from '@/models/User';
import Organization from '@/models/Organization';
import Link from 'next/link';
import { Package, Plus, Calendar, CheckCircle, AlertCircle } from 'lucide-react';

export default async function LicensesPage() {
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

    return (
        <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100">
            <div className="container mx-auto px-4 py-8">
                {/* Header */}
                <div className="flex items-center justify-between mb-8">
                    <div>
                        <h1 className="text-3xl font-bold text-slate-900 mb-2">Lab Licenses</h1>
                        <p className="text-slate-600">Manage your organization's lab licenses</p>
                    </div>
                    <Link
                        href="/admin/purchase-licenses"
                        className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium transition-colors"
                    >
                        <Plus className="w-5 h-5" />
                        Purchase Licenses
                    </Link>
                </div>

                {/* Licenses List */}
                <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
                    {!organization?.labLicenses || organization.labLicenses.length === 0 ? (
                        <div className="p-12 text-center text-slate-500">
                            <Package className="w-16 h-16 mx-auto mb-4 text-slate-300" />
                            <h3 className="text-lg font-semibold text-slate-900 mb-2">No licenses yet</h3>
                            <p className="mb-4">Purchase lab licenses to assign to your team members</p>
                            <Link
                                href="/admin/purchase-licenses"
                                className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium transition-colors"
                            >
                                <Plus className="w-5 h-5" />
                                Purchase Your First License
                            </Link>
                        </div>
                    ) : (
                        <div className="divide-y divide-slate-200">
                            {organization.labLicenses.map((license: any, index: number) => {
                                const available = license.totalLicenses - license.usedLicenses;
                                const usagePercent = (license.usedLicenses / license.totalLicenses) * 100;
                                const isExpired = new Date(license.expiresAt) < new Date();
                                const daysUntilExpiry = Math.ceil((new Date(license.expiresAt).getTime() - Date.now()) / (1000 * 60 * 60 * 24));
                                const isExpiringSoon = daysUntilExpiry <= 30 && daysUntilExpiry > 0;

                                return (
                                    <div key={index} className="p-6 hover:bg-slate-50 transition-colors">
                                        <div className="flex items-start justify-between">
                                            <div className="flex-1">
                                                <div className="flex items-center gap-3 mb-3">
                                                    <div className="p-2 bg-blue-100 rounded-lg">
                                                        <Package className="w-5 h-5 text-blue-600" />
                                                    </div>
                                                    <div>
                                                        <h3 className="text-lg font-semibold text-slate-900">
                                                            {license.courseId.toUpperCase()}
                                                        </h3>
                                                        <p className="text-sm text-slate-500">
                                                            Purchased {new Date(license.purchaseDate).toLocaleDateString()}
                                                        </p>
                                                    </div>
                                                </div>

                                                {/* Usage Bar */}
                                                <div className="mb-3">
                                                    <div className="flex items-center justify-between text-sm mb-1">
                                                        <span className="text-slate-600">License Usage</span>
                                                        <span className="font-medium text-slate-900">
                                                            {license.usedLicenses}/{license.totalLicenses} used
                                                        </span>
                                                    </div>
                                                    <div className="w-full bg-slate-200 rounded-full h-2">
                                                        <div
                                                            className={`h-2 rounded-full transition-all ${usagePercent >= 90 ? 'bg-red-500' :
                                                                    usagePercent >= 70 ? 'bg-orange-500' :
                                                                        'bg-blue-500'
                                                                }`}
                                                            style={{ width: `${usagePercent}%` }}
                                                        />
                                                    </div>
                                                </div>

                                                {/* Status Badges */}
                                                <div className="flex items-center gap-3 flex-wrap">
                                                    <div className="flex items-center gap-1 text-sm">
                                                        <Calendar className="w-4 h-4 text-slate-500" />
                                                        <span className="text-slate-600">
                                                            Expires: {new Date(license.expiresAt).toLocaleDateString()}
                                                        </span>
                                                    </div>

                                                    {isExpired && (
                                                        <span className="px-2 py-1 bg-red-100 text-red-700 rounded-full text-xs font-medium flex items-center gap-1">
                                                            <AlertCircle className="w-3 h-3" />
                                                            Expired
                                                        </span>
                                                    )}

                                                    {isExpiringSoon && (
                                                        <span className="px-2 py-1 bg-orange-100 text-orange-700 rounded-full text-xs font-medium flex items-center gap-1">
                                                            <AlertCircle className="w-3 h-3" />
                                                            Expires in {daysUntilExpiry} days
                                                        </span>
                                                    )}

                                                    {available > 0 && !isExpired && (
                                                        <span className="px-2 py-1 bg-green-100 text-green-700 rounded-full text-xs font-medium flex items-center gap-1">
                                                            <CheckCircle className="w-3 h-3" />
                                                            {available} available
                                                        </span>
                                                    )}
                                                </div>
                                            </div>

                                            <div className="text-right">
                                                <div className="text-3xl font-bold text-blue-600">
                                                    {available}
                                                </div>
                                                <div className="text-sm text-slate-500">available</div>
                                            </div>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
