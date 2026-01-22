import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import dbConnect from '@/lib/db';
import Order from '@/models/Order';

export async function GET(
    request: NextRequest,
    { params }: { params: Promise<{ orderNumber: string }> }
) {
    try {
        // Check authentication
        const session = await getServerSession(authOptions);
        if (!session?.user) {
            return NextResponse.json(
                { error: 'Unauthorized' },
                { status: 401 }
            );
        }

        // Connect to database
        await dbConnect();

        // Get order number from params
        const { orderNumber } = await params;

        // Find order
        const order = await Order.findOne({
            orderNumber,
            userId: (session.user as any).id || (session.user as any)._id,
        });

        if (!order) {
            return NextResponse.json(
                { error: 'Order not found' },
                { status: 404 }
            );
        }

        return NextResponse.json({ order }, { status: 200 });

    } catch (error) {
        console.error('Order fetch error:', error);
        return NextResponse.json(
            { error: 'Failed to fetch order' },
            { status: 500 }
        );
    }
}
