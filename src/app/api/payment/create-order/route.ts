import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { createRazorpayOrder, calculatePriceBreakdown } from '@/lib/razorpay';

export async function POST(request: NextRequest) {
    try {
        const session = await getServerSession(authOptions);
        if (!session?.user) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const body = await request.json();
        const { items } = body;

        if (!items || items.length === 0) {
            return NextResponse.json({ error: 'No items provided' }, { status: 400 });
        }

        // Calculate price breakdown (now async - fetches live exchange rate)
        const breakdown = await calculatePriceBreakdown(items);

        // Create Razorpay order
        const razorpayOrder = await createRazorpayOrder(breakdown.total);

        return NextResponse.json({
            success: true,
            orderId: razorpayOrder.id,
            amount: razorpayOrder.amount, // in paise
            currency: razorpayOrder.currency,
            breakdown,
        });
    } catch (error: any) {
        console.error('[Payment] Create order error:', error);
        return NextResponse.json(
            { error: 'Failed to create payment order' },
            { status: 500 }
        );
    }
}
