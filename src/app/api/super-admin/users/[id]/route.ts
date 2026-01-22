import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import dbConnect from '@/lib/db';
import User from '@/models/User';

// DELETE - Delete user (Super Admin only)
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

        const { id: userId } = await params;

        // Find the user
        const user = await User.findById(userId);
        if (!user) {
            return NextResponse.json({ error: 'User not found' }, { status: 404 });
        }

        // Prevent deleting super admins
        if (user.role === 'super_admin') {
            return NextResponse.json({
                error: 'Cannot delete super admin users'
            }, { status: 403 });
        }

        // Delete the user
        await User.findByIdAndDelete(userId);

        console.log(`[Super Admin] Deleted user ${user.email} by ${admin.email}`);

        return NextResponse.json({
            success: true,
            message: `User ${user.email} deleted successfully`,
        });
    } catch (error: any) {
        console.error('[Super Admin] Delete user error:', error);
        return NextResponse.json({ error: 'Failed to delete user' }, { status: 500 });
    }
}
