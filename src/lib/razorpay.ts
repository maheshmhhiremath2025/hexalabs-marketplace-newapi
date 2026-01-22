import Razorpay from 'razorpay';
import crypto from 'crypto';
import { getLiveExchangeRate } from './exchange-rate';

// Razorpay instance
const razorpay = new Razorpay({
    key_id: process.env.RAZORPAY_KEY_ID || 'rzp_test_S5MyGzMGCVaygJ',
    key_secret: process.env.RAZORPAY_KEY_SECRET || 'JI1GepYekJNY2PJBdJNmkE2W',
});

// Tax rate (GST)
export const TAX_RATE = 0.18; // 18%

export interface RazorpayOrderData {
    amount: number; // in INR
    currency: string;
    receipt: string;
}

export async function createRazorpayOrder(amountINR: number): Promise<any> {
    try {
        // Amount must be in paise (₹1 = 100 paise)
        const amountInPaise = Math.round(amountINR * 100);

        const order = await razorpay.orders.create({
            amount: amountInPaise,
            currency: 'INR',
            receipt: `receipt_${Date.now()}`,
            notes: {
                created_at: new Date().toISOString(),
            },
        });

        console.log('[Razorpay] Order created:', order.id);
        return order;
    } catch (error: any) {
        console.error('[Razorpay] Create order error:', error);
        throw new Error('Failed to create Razorpay order');
    }
}

export function verifyPaymentSignature(
    orderId: string,
    paymentId: string,
    signature: string
): boolean {
    try {
        const text = `${orderId}|${paymentId}`;
        const secret = process.env.RAZORPAY_KEY_SECRET || 'JI1GepYekJNY2PJBdJNmkE2W';

        const generatedSignature = crypto
            .createHmac('sha256', secret)
            .update(text)
            .digest('hex');

        const isValid = generatedSignature === signature;

        if (isValid) {
            console.log('[Razorpay] Payment signature verified');
        } else {
            console.error('[Razorpay] Invalid payment signature');
        }

        return isValid;
    } catch (error: any) {
        console.error('[Razorpay] Signature verification error:', error);
        return false;
    }
}

export async function convertUSDToINR(amountUSD: number): Promise<number> {
    const rate = await getLiveExchangeRate();
    return Math.round(amountUSD * rate);
}

export function calculateTax(subtotal: number): number {
    return Math.round(subtotal * TAX_RATE);
}

export function calculateTotal(subtotal: number): number {
    const tax = calculateTax(subtotal);
    return subtotal + tax;
}

export interface PriceBreakdown {
    subtotalUSD: number;
    subtotalINR: number;
    tax: number;
    total: number;
    currency: 'INR';
    exchangeRate: number;
}

export async function calculatePriceBreakdown(items: Array<{ priceUSD: number; quantity: number }>): Promise<PriceBreakdown> {
    // Calculate subtotal in USD
    const subtotalUSD = items.reduce((sum, item) => sum + (item.priceUSD * item.quantity), 0);

    // Get live exchange rate
    const exchangeRate = await getLiveExchangeRate();

    // Convert to INR
    const subtotalINR = Math.round(subtotalUSD * exchangeRate);

    // Calculate tax
    const tax = calculateTax(subtotalINR);

    // Calculate total
    const total = subtotalINR + tax;

    return {
        subtotalUSD,
        subtotalINR,
        tax,
        total,
        currency: 'INR',
        exchangeRate,
    };
}
