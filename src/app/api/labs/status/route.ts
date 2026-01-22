import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import dbConnect from '@/lib/db';
import User from '@/models/User';
import { labManager } from '@/lib/azure/lab-manager';

export async function GET(request: NextRequest) {
    try {
        const session = await getServerSession(authOptions);
        if (!session?.user) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const { searchParams } = new URL(request.url);
        const labId = searchParams.get('labId');

        if (!labId) {
            return NextResponse.json({ error: 'Lab ID required' }, { status: 400 });
        }

        await dbConnect();
        // @ts-ignore
        const user = await User.findById(session.user.id);

        if (!user) {
            return NextResponse.json({ error: 'User not found' }, { status: 404 });
        }

        // Find the lab by resource group name
        const labEntry = user.purchasedLabs?.find((p: any) =>
            p.activeSession && p.activeSession.id === labId
        );

        if (!labEntry || !labEntry.activeSession) {
            return NextResponse.json({ error: 'No active session found' }, { status: 404 });
        }

        // Get real-time status from Azure
        const statusData = await labManager.getLabStatus(labEntry.activeSession.id);

        // If VM not found or resource group deleted, return 404 to stop polling
        if (statusData.status === 'not_found' || statusData.status === 'stopped') {
            return NextResponse.json({
                error: 'VM not found or being provisioned',
                status: statusData.status
            }, { status: 404 });
        }

        return NextResponse.json({
            // @ts-ignore
            status: statusData.status || labEntry.activeSession.status,
            // @ts-ignore
            vmPublicIP: statusData.vmPublicIP
        }, { status: 200 });

    } catch (error) {
        console.error('Lab status error:', error);
        return NextResponse.json({ error: 'Failed to get lab status' }, { status: 500 });
    }
}
