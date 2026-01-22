import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import dbConnect from '@/lib/db';
import User from '@/models/User';

export async function GET(request: NextRequest) {
    try {
        const session = await getServerSession(authOptions);
        if (!session?.user) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const { searchParams } = new URL(request.url);
        const courseId = searchParams.get('courseId');

        if (!courseId) {
            return NextResponse.json({ error: 'Course ID required' }, { status: 400 });
        }

        await dbConnect();
        // @ts-ignore
        const user = await User.findById(session.user.id);

        if (!user) {
            return NextResponse.json({ error: 'User not found' }, { status: 404 });
        }

        const labEntry = user.purchasedLabs?.find((p: any) => p.courseId === courseId);

        if (!labEntry || !labEntry.activeSession) {
            return NextResponse.json({ error: 'No active session found' }, { status: 404 });
        }

        return NextResponse.json({
            guacamoleConnectionId: labEntry.activeSession.guacamoleConnectionId,
            guacamoleUsername: labEntry.activeSession.guacamoleUsername,
            guacamolePassword: labEntry.activeSession.guacamolePassword,
            vmPublicIP: labEntry.activeSession.vmPublicIP
        }, { status: 200 });

    } catch (error) {
        console.error('Guacamole info error:', error);
        return NextResponse.json({ error: 'Failed to get Guacamole info' }, { status: 500 });
    }
}
