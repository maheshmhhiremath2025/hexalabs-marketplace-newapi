import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import dbConnect from '@/lib/db';
import User from '@/models/User';
import { labManager } from '@/lib/azure/lab-manager';

export async function POST(request: NextRequest) {
    try {
        const session = await getServerSession(authOptions);
        if (!session?.user) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const { courseId } = await request.json();

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

        const resourceGroupName = labEntry.activeSession.id;

        // Restart the VM
        console.log(`[RESTART VM] Restarting VM in resource group: ${resourceGroupName}`);

        try {
            await labManager.restartVM(resourceGroupName);

            // Update session status
            labEntry.activeSession.status = 'restarting';
            await user.save();

            return NextResponse.json({
                success: true,
                message: 'VM restart initiated',
                status: 'restarting'
            }, { status: 200 });

        } catch (error) {
            console.error('[RESTART VM] Failed to restart VM:', error);
            return NextResponse.json({
                error: 'Failed to restart VM',
                details: error instanceof Error ? error.message : 'Unknown error'
            }, { status: 500 });
        }

    } catch (error) {
        console.error('VM restart error:', error);
        return NextResponse.json({ error: 'Failed to restart VM' }, { status: 500 });
    }
}
