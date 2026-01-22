import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import dbConnect from '@/lib/db';
import User from '@/models/User';

// POST - Reset launch count for a user's course (Super Admin only)
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
        const { userId, courseId, newLaunchCount, newMaxLaunches } = body;

        if (!userId || !courseId) {
            return NextResponse.json({
                error: 'User ID and Course ID are required'
            }, { status: 400 });
        }

        // Find the user
        const user = await User.findById(userId);
        if (!user) {
            return NextResponse.json({ error: 'User not found' }, { status: 404 });
        }

        // Find the course in user's purchasedLabs
        const labIndex = user.purchasedLabs.findIndex((lab: any) => lab.courseId === courseId);
        if (labIndex === -1) {
            return NextResponse.json({ error: 'Course not found for this user' }, { status: 404 });
        }

        // Update launch count
        if (newLaunchCount !== undefined) {
            user.purchasedLabs[labIndex].launchCount = newLaunchCount;
        }

        // Update max launches if provided
        if (newMaxLaunches !== undefined) {
            user.purchasedLabs[labIndex].maxLaunches = newMaxLaunches;
        }

        await user.save();

        console.log(`[Super Admin] Reset launches for ${user.email} - ${courseId} by ${admin.email}`);

        return NextResponse.json({
            success: true,
            message: 'Launch count reset successfully',
            course: {
                courseId,
                launchCount: user.purchasedLabs[labIndex].launchCount,
                maxLaunches: user.purchasedLabs[labIndex].maxLaunches,
            }
        });
    } catch (error: any) {
        console.error('[Super Admin] Reset launches error:', error);
        return NextResponse.json({ error: 'Failed to reset launches' }, { status: 500 });
    }
}
