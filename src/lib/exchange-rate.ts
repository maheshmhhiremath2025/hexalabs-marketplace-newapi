import axios from 'axios';

// Cache for exchange rate
let cachedRate: { rate: number; timestamp: number } | null = null;
const CACHE_DURATION = 3600000; // 1 hour in milliseconds

export async function getLiveExchangeRate(): Promise<number> {
    // Use static rate to match frontend (currency.ts)
    // This ensures consistent pricing between frontend display and Razorpay payment
    const STATIC_RATE = 83.00;

    console.log(`[Exchange Rate] Using static rate: 1 USD = ₹${STATIC_RATE}`);
    return STATIC_RATE;

    /* Commented out - use live rate when multi-currency support is needed
    try {
        // Check cache first
        if (cachedRate && Date.now() - cachedRate.timestamp < CACHE_DURATION) {
            return cachedRate.rate;
        }

        // Fetch live rate from exchangerate-api.com (free tier)
        const response = await axios.get('https://api.exchangerate-api.com/v4/latest/USD');
        const rate = response.data.rates.INR;

        // Cache the rate
        cachedRate = {
            rate,
            timestamp: Date.now(),
        };

        console.log(`[Exchange Rate] Updated: 1 USD = ₹${rate}`);
        return rate;
    } catch (error) {
        console.error('[Exchange Rate] Failed to fetch live rate, using fallback:', error);
        // Fallback to static rate if API fails
        return 83;
    }
    */
}

export function convertUSDToINR(amountUSD: number, rate: number): number {
    return Math.round(amountUSD * rate);
}
