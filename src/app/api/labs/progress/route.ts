import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import dbConnect from '@/lib/db';
import User from '@/models/User';

// GET - Load progress for a purchase
export async function GET(request: NextRequest) {
    try {
        const session = await getServerSession(authOptions);
        if (!session?.user) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const { searchParams } = new URL(request.url);
        const purchaseId = searchParams.get('purchaseId');

        if (!purchaseId) {
            return NextResponse.json({ error: 'Purchase ID required' }, { status: 400 });
        }

        await dbConnect();
        // @ts-ignore
        const user = await User.findById(session.user.id);

        if (!user) {
            return NextResponse.json({ error: 'User not found' }, { status: 404 });
        }

        // Find the purchased lab
        const labEntry = user.purchasedLabs?.id(purchaseId);

        if (!labEntry) {
            return NextResponse.json({ error: 'Lab not found' }, { status: 404 });
        }

        // Return progress data
        const progress = {
            completedTasks: labEntry.taskProgress?.completedTasks || [],
            currentTaskIndex: labEntry.taskProgress?.currentTaskIndex || 0,
            lastUpdatedAt: labEntry.taskProgress?.lastUpdatedAt || null
        };

        return NextResponse.json(progress);
    } catch (error: any) {
        console.error('[Progress API] GET error:', error);
        return NextResponse.json({ error: 'Failed to load progress' }, { status: 500 });
    }
}

// POST - Save progress for a purchase
export async function POST(request: NextRequest) {
    try {
        const session = await getServerSession(authOptions);
        if (!session?.user) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const body = await request.json();
        const { purchaseId, completedTasks, currentTaskIndex } = body;

        if (!purchaseId) {
            return NextResponse.json({ error: 'Purchase ID required' }, { status: 400 });
        }

        if (!Array.isArray(completedTasks)) {
            return NextResponse.json({ error: 'completedTasks must be an array' }, { status: 400 });
        }

        if (typeof currentTaskIndex !== 'number') {
            return NextResponse.json({ error: 'currentTaskIndex must be a number' }, { status: 400 });
        }

        await dbConnect();
        // @ts-ignore
        const user = await User.findById(session.user.id);

        if (!user) {
            return NextResponse.json({ error: 'User not found' }, { status: 404 });
        }

        // Find the purchased lab
        const labEntry = user.purchasedLabs?.id(purchaseId);

        if (!labEntry) {
            return NextResponse.json({ error: 'Lab not found' }, { status: 404 });
        }

        // Update progress
        labEntry.taskProgress = {
            completedTasks,
            currentTaskIndex,
            lastUpdatedAt: new Date()
        };

        await user.save();

        console.log(`[Progress API] Saved progress for purchase ${purchaseId}: ${completedTasks.length} tasks completed`);

        return NextResponse.json({
            success: true,
            message: 'Progress saved',
            progress: {
                completedTasks,
                currentTaskIndex,
                lastUpdatedAt: labEntry.taskProgress.lastUpdatedAt
            }
        });
    } catch (error: any) {
        console.error('[Progress API] POST error:', error);
        return NextResponse.json({ error: 'Failed to save progress' }, { status: 500 });
    }
}
