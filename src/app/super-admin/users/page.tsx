import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { redirect } from 'next/navigation';
import dbConnect from '@/lib/db';
import User from '@/models/User';
import Organization from '@/models/Organization';
import ManagementTabs from '@/components/super-admin/ManagementTabs';

export default async function AllUsersPage() {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
        redirect('/auth/signin');
    }

    await dbConnect();
    // @ts-ignore
    const currentUser = await User.findById(session.user.id);

    if (currentUser?.role !== 'super_admin') {
        redirect('/dashboard');
    }

    // Get all users with their organizations
    const allUsersRaw = await User.find().select('-password').sort({ createdAt: -1 }).lean();

    // Get all organizations
    const organizationsRaw = await Organization.find().lean();
    const orgMap = new Map(organizationsRaw.map(org => [org._id.toString(), org]));

    // Serialize users data properly
    const usersWithOrgs = JSON.parse(JSON.stringify(allUsersRaw.map(user => ({
        _id: user._id.toString(),
        name: user.name,
        email: user.email,
        role: user.role,
        organizationId: user.organizationId?.toString(),
        organizationName: user.organizationId ? orgMap.get(user.organizationId.toString())?.name : undefined,
        purchasedLabs: user.purchasedLabs || [],
        createdAt: user.createdAt,
    }))));

    // Prepare organizations data
    const orgsData = await Promise.all(organizationsRaw.map(async (org) => {
        const teamMembers = await User.countDocuments({ organizationId: org._id, role: 'user' });
        return {
            _id: org._id.toString(),
            name: org.name,
            contactEmail: org.contactEmail,
            isActive: org.isActive,
            teamMembersCount: teamMembers,
            licensesCount: org.labLicenses?.length || 0,
            createdAt: org.createdAt.toISOString(),
        };
    }));

    return (
        <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100">
            <div className="container mx-auto px-4 py-8">
                {/* Header */}
                <div className="mb-8">
                    <h1 className="text-3xl font-bold text-slate-900 mb-2">Platform Management</h1>
                    <p className="text-slate-600">Manage all users, admins, and organizations</p>
                </div>

                <ManagementTabs users={usersWithOrgs} organizations={orgsData} />
            </div>
        </div>
    );
}
