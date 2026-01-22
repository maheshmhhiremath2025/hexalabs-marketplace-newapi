import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import dbConnect from '@/lib/db';
import User from '@/models/User';
import bcrypt from 'bcryptjs';

// POST - Reset user password (Super Admin only)
export async function POST(request: NextRequest) {
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

        const body = await request.json();
        const { userId, newPassword } = body;

        if (!userId || !newPassword) {
            return NextResponse.json({
                error: 'User ID and new password are required'
            }, { status: 400 });
        }

        if (newPassword.length < 6) {
            return NextResponse.json({
                error: 'Password must be at least 6 characters'
            }, { status: 400 });
        }

        // Find the user
        const user = await User.findById(userId);
        if (!user) {
            return NextResponse.json({ error: 'User not found' }, { status: 404 });
        }

        // Hash the new password
        const hashedPassword = await bcrypt.hash(newPassword, 10);

        // Update user password
        user.password = hashedPassword;
        await user.save();

        console.log(`[Super Admin] Password reset for user ${user.email} by ${admin.email}`);

        return NextResponse.json({
            success: true,
            message: `Password reset successfully for ${user.email}`,
        });
    } catch (error: any) {
        console.error('[Super Admin] Reset password error:', error);
        return NextResponse.json({ error: 'Failed to reset password' }, { status: 500 });
    }
}
