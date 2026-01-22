import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import dbConnect from '@/lib/db';
import User from '@/models/User';
import Organization from '@/models/Organization';

// PATCH - Update organization (Super Admin only)
export async function PATCH(
    request: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
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

        const { id: orgId } = await params;
        const body = await request.json();
        const { name, contactEmail, isActive } = body;

        if (!name || !contactEmail) {
            return NextResponse.json({
                error: 'Name and contact email are required'
            }, { status: 400 });
        }

        // Find and update the organization
        const organization = await Organization.findById(orgId);
        if (!organization) {
            return NextResponse.json({ error: 'Organization not found' }, { status: 404 });
        }

        organization.name = name;
        organization.contactEmail = contactEmail;
        organization.isActive = isActive !== undefined ? isActive : organization.isActive;

        await organization.save();

        console.log(`[Super Admin] Updated organization ${organization.name} by ${admin.email}`);

        return NextResponse.json({
            success: true,
            message: `Organization ${organization.name} updated successfully`,
            organization: {
                _id: organization._id,
                name: organization.name,
                contactEmail: organization.contactEmail,
                isActive: organization.isActive,
            }
        });
    } catch (error: any) {
        console.error('[Super Admin] Update organization error:', error);
        return NextResponse.json({ error: 'Failed to update organization' }, { status: 500 });
    }
}

// DELETE - Delete organization (Super Admin only)
export async function DELETE(
    request: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
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

        const { id: orgId } = await params;

        // Find the organization
        const organization = await Organization.findById(orgId);
        if (!organization) {
            return NextResponse.json({ error: 'Organization not found' }, { status: 404 });
        }

        // Delete all users in this organization (cascading delete)
        const deletedUsers = await User.deleteMany({ organizationId: orgId });

        // Delete the organization
        await Organization.findByIdAndDelete(orgId);

        console.log(`[Super Admin] Deleted organization ${organization.name} and ${deletedUsers.deletedCount} users by ${admin.email}`);

        return NextResponse.json({
            success: true,
            message: `Organization ${organization.name} and ${deletedUsers.deletedCount} users deleted successfully`,
            deletedUsers: deletedUsers.deletedCount,
        });
    } catch (error: any) {
        console.error('[Super Admin] Delete organization error:', error);
        return NextResponse.json({ error: 'Failed to delete organization' }, { status: 500 });
    }
}
