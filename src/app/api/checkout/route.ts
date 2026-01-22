import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import dbConnect from '@/lib/db';
import User from '@/models/User';

export async function POST(req: Request) {
    try {
        const session = await getServerSession(authOptions);

        if (!session?.user) {
            return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
        }

        const { items } = await req.json(); // Array of { courseId: string, quantity: number }

        await dbConnect();
        // @ts-ignore
        const user = await User.findById(session.user.id);

        // Create lab entries based on quantity
        // Each quantity creates a separate lab entry (even for same courseId)
        const newLabs: any[] = [];

        items.forEach((item: any) => {
            const quantity = item.quantity || 1;

            // Create 'quantity' number of lab entries for this course
            for (let i = 0; i < quantity; i++) {
                const purchaseDate = new Date();
                const accessExpiresAt = new Date(purchaseDate);
                accessExpiresAt.setDate(accessExpiresAt.getDate() + 180); // 180 days from purchase

                newLabs.push({
                    courseId: item.courseId,
                    purchaseDate: purchaseDate,
                    accessExpiresAt: accessExpiresAt,
                    launchCount: 0,
                    maxLaunches: 10,
                    sessionDurationHours: 4,
                    resourceGroupName: undefined,
                    snapshotId: undefined,
                    snapshotName: undefined,
                    snapshotCreatedAt: undefined,
                    activeSession: null
                });
            }
        });

        if (newLabs.length > 0) {
            user.purchasedLabs.push(...newLabs);
            await user.save();
            console.log(`[Checkout] Added ${newLabs.length} new labs with proper initialization`);
        }

        return NextResponse.json({ success: true, message: 'Purchase successful' });
    } catch (error: any) {
        console.error('Checkout Error:', error);
        return NextResponse.json(
            { message: error.message || 'Payment failed' },
            { status: 500 }
        );
    }
}
