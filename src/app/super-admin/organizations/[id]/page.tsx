import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { redirect } from 'next/navigation';
import dbConnect from '@/lib/db';
import User from '@/models/User';
import Organization from '@/models/Organization';
import Link from 'next/link';
import { ArrowLeft, Building2, Users, Package, Calendar, Mail, CheckCircle, XCircle, BookOpen, Award } from 'lucide-react';
import OrgActions from './OrgActions';

export default async function OrganizationDetailsPage({ params }: { params: Promise<{ id: string }> }) {
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

    const { id } = await params;

    // Get organization details
    const organization = await Organization.findById(id).lean();
    if (!organization) {
        redirect('/super-admin/organizations');
    }

    // Get organization users
    const orgUsers = await User.find({ organizationId: id }).select('-password').lean();
    const orgAdmin = orgUsers.find(u => u.role === 'org_admin');
    const teamMembers = orgUsers.filter(u => u.role === 'user');

    // Calculate license stats
    let totalLicenses = 0;
    let usedLicenses = 0;
    organization.labLicenses?.forEach((license: any) => {
        totalLicenses += license.totalLicenses;
        usedLicenses += license.usedLicenses;
    });

    // Create course-to-users mapping
    const courseUserMap = new Map<string, Array<{ name: string; email: string; launchCount: number; maxLaunches: number }>>();

    orgUsers.forEach(user => {
        user.purchasedLabs?.forEach((lab: any) => {
            const courseId = lab.courseId.toUpperCase();
            if (!courseUserMap.has(courseId)) {
                courseUserMap.set(courseId, []);
            }
            courseUserMap.get(courseId)!.push({
                name: user.name,
                email: user.email,
                launchCount: lab.launchCount || 0,
                maxLaunches: lab.maxLaunches || 10,
            });
        });
    });

    // Serialize organization for client component
    const serializedOrg = {
        _id: organization._id.toString(),
        name: organization.name,
        contactEmail: organization.contactEmail,
        isActive: organization.isActive,
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100">
            <div className="container mx-auto px-4 py-8">
                {/* Back Button */}
                <Link
                    href="/super-admin/organizations"
                    className="inline-flex items-center gap-2 text-slate-600 hover:text-slate-900 mb-6 transition-colors"
                >
                    <ArrowLeft className="w-4 h-4" />
                    Back to Organizations
                </Link>

                {/* Header */}
                <div className="mb-8">
                    <div className="flex items-start justify-between mb-4">
                        <div className="flex items-center gap-3">
                            <div className="p-3 bg-blue-100 rounded-lg">
                                <Building2 className="w-8 h-8 text-blue-600" />
                            </div>
                            <div>
                                <h1 className="text-3xl font-bold text-slate-900">{organization.name}</h1>
                                <p className="text-slate-600">{organization.contactEmail}</p>
                            </div>
                        </div>
                        <OrgActions organization={serializedOrg} />
                    </div>
                    <div className="flex items-center gap-2">
                        <span className={`px-3 py-1 rounded-full text-sm font-medium ${organization.isActive
                            ? 'bg-green-100 text-green-700'
                            : 'bg-red-100 text-red-700'
                            }`}>
                            {organization.isActive ? (
                                <span className="flex items-center gap-1">
                                    <CheckCircle className="w-4 h-4" />
                                    Active
                                </span>
                            ) : (
                                <span className="flex items-center gap-1">
                                    <XCircle className="w-4 h-4" />
                                    Inactive
                                </span>
                            )}
                        </span>
                        <span className="text-sm text-slate-500">
                            Created {new Date(organization.createdAt).toLocaleDateString()}
                        </span>
                    </div>
                </div>

                {/* Stats Grid */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                    <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
                        <div className="flex items-center justify-between mb-2">
                            <Users className="w-6 h-6 text-blue-600" />
                        </div>
                        <h3 className="text-2xl font-bold text-slate-900">{teamMembers.length}</h3>
                        <p className="text-sm text-slate-600">Team Members</p>
                    </div>

                    <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
                        <div className="flex items-center justify-between mb-2">
                            <Package className="w-6 h-6 text-green-600" />
                        </div>
                        <h3 className="text-2xl font-bold text-slate-900">{usedLicenses}/{totalLicenses}</h3>
                        <p className="text-sm text-slate-600">Licenses Used</p>
                    </div>

                    <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
                        <div className="flex items-center justify-between mb-2">
                            <BookOpen className="w-6 h-6 text-purple-600" />
                        </div>
                        <h3 className="text-2xl font-bold text-slate-900">{organization.labLicenses?.length || 0}</h3>
                        <p className="text-sm text-slate-600">Lab Types</p>
                    </div>
                </div>

                {/* Organization Admin */}
                <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6 mb-6">
                    <h2 className="text-lg font-semibold text-slate-900 mb-4">Organization Admin</h2>
                    {orgAdmin ? (
                        <div className="flex items-center gap-3 p-4 bg-slate-50 rounded-lg">
                            <div className="p-2 bg-blue-100 rounded-lg">
                                <Users className="w-5 h-5 text-blue-600" />
                            </div>
                            <div>
                                <p className="font-medium text-slate-900">{orgAdmin.name}</p>
                                <p className="text-sm text-slate-500">{orgAdmin.email}</p>
                            </div>
                        </div>
                    ) : (
                        <p className="text-slate-500">No admin assigned</p>
                    )}
                </div>

                {/* Lab Licenses */}
                <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6 mb-6">
                    <h2 className="text-lg font-semibold text-slate-900 mb-4">Lab Licenses</h2>
                    {!organization.labLicenses || organization.labLicenses.length === 0 ? (
                        <p className="text-slate-500">No licenses purchased yet</p>
                    ) : (
                        <div className="space-y-3">
                            {organization.labLicenses.map((license: any, index: number) => (
                                <div key={index} className="flex items-center justify-between p-4 bg-slate-50 rounded-lg">
                                    <div className="flex-1">
                                        <p className="font-medium text-slate-900">{license.courseId.toUpperCase()}</p>
                                        <p className="text-sm text-slate-500">
                                            {license.usedLicenses}/{license.totalLicenses} used •
                                            Expires {new Date(license.expiresAt).toLocaleDateString()}
                                        </p>
                                    </div>
                                    <div className="text-right">
                                        <p className="text-lg font-bold text-blue-600">
                                            {license.totalLicenses - license.usedLicenses}
                                        </p>
                                        <p className="text-xs text-slate-500">available</p>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>

                {/* Course Assignments - Who has which course */}
                <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6 mb-6">
                    <h2 className="text-lg font-semibold text-slate-900 mb-4">
                        <div className="flex items-center gap-2">
                            <Award className="w-5 h-5 text-purple-600" />
                            Course Assignments
                        </div>
                    </h2>
                    {courseUserMap.size === 0 ? (
                        <p className="text-slate-500">No courses assigned yet</p>
                    ) : (
                        <div className="space-y-6">
                            {Array.from(courseUserMap.entries()).map(([courseId, users]) => (
                                <div key={courseId} className="border border-slate-200 rounded-lg p-4">
                                    <div className="flex items-center justify-between mb-3">
                                        <h3 className="font-semibold text-slate-900 flex items-center gap-2">
                                            <BookOpen className="w-4 h-4 text-blue-600" />
                                            {courseId}
                                        </h3>
                                        <span className="px-2 py-1 bg-blue-100 text-blue-700 rounded text-sm font-medium">
                                            {users.length} {users.length === 1 ? 'user' : 'users'}
                                        </span>
                                    </div>
                                    <div className="space-y-2">
                                        {users.map((user, idx) => (
                                            <div key={idx} className="flex items-center justify-between p-3 bg-slate-50 rounded">
                                                <div>
                                                    <p className="text-sm font-medium text-slate-900">{user.name}</p>
                                                    <p className="text-xs text-slate-500">{user.email}</p>
                                                </div>
                                                <div className="text-right">
                                                    <p className="text-sm text-slate-700">
                                                        {user.launchCount}/{user.maxLaunches} launches
                                                    </p>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>

                {/* All Team Members */}
                <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
                    <h2 className="text-lg font-semibold text-slate-900 mb-4">
                        All Team Members ({teamMembers.length})
                    </h2>
                    {teamMembers.length === 0 ? (
                        <p className="text-slate-500">No team members yet</p>
                    ) : (
                        <div className="overflow-x-auto">
                            <table className="w-full">
                                <thead>
                                    <tr className="border-b border-slate-200">
                                        <th className="text-left py-3 px-4 font-semibold text-slate-700">Name</th>
                                        <th className="text-left py-3 px-4 font-semibold text-slate-700">Email</th>
                                        <th className="text-left py-3 px-4 font-semibold text-slate-700">Courses</th>
                                        <th className="text-left py-3 px-4 font-semibold text-slate-700">Total Launches</th>
                                        <th className="text-left py-3 px-4 font-semibold text-slate-700">Joined</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {teamMembers.map((member: any) => {
                                        const totalLaunches = member.purchasedLabs?.reduce((sum: number, lab: any) => sum + (lab.launchCount || 0), 0) || 0;
                                        return (
                                            <tr key={member._id.toString()} className="border-b border-slate-100 hover:bg-slate-50">
                                                <td className="py-3 px-4">
                                                    <p className="font-medium text-slate-900">{member.name}</p>
                                                </td>
                                                <td className="py-3 px-4">
                                                    <p className="text-sm text-slate-600">{member.email}</p>
                                                </td>
                                                <td className="py-3 px-4">
                                                    <span className="px-2 py-1 bg-blue-100 text-blue-700 rounded text-sm">
                                                        {member.purchasedLabs?.length || 0}
                                                    </span>
                                                </td>
                                                <td className="py-3 px-4">
                                                    <span className="px-2 py-1 bg-green-100 text-green-700 rounded text-sm">
                                                        {totalLaunches}
                                                    </span>
                                                </td>
                                                <td className="py-3 px-4">
                                                    <p className="text-sm text-slate-600">
                                                        {new Date(member.createdAt).toLocaleDateString()}
                                                    </p>
                                                </td>
                                            </tr>
                                        );
                                    })}
                                </tbody>
                            </table>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
