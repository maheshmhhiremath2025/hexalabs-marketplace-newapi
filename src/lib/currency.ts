// Currency conversion utilities

export const CURRENCIES = [
    // Only INR is active for now - other currencies can be uncommented when needed
    { code: 'INR', name: 'Indian Rupee', symbol: '₹' },

    // Commented out currencies - uncomment when multi-currency support is needed
    // { code: 'USD', name: 'US Dollar', symbol: '$' },
    // { code: 'CAD', name: 'Canadian Dollar', symbol: 'CA$' },
    // { code: 'BRL', name: 'Brazilian Real', symbol: 'R$' },
    // { code: 'CHF', name: 'Swiss Franc', symbol: 'CHF' },
    // { code: 'GBP', name: 'British Pound', symbol: '£' },
    // { code: 'HKD', name: 'Hong Kong Dollar', symbol: 'HK$' },
    // { code: 'JPY', name: 'Japanese Yen', symbol: '¥' },
    // { code: 'MXN', name: 'Mexican Peso', symbol: 'MX$' },
    // { code: 'NZD', name: 'New Zealand Dollar', symbol: 'NZ$' },
    // { code: 'SGD', name: 'Singapore Dollar', symbol: 'S$' },
    // { code: 'TWD', name: 'Taiwan Dollar', symbol: 'NT$' },
    // { code: 'EUR', name: 'Euro', symbol: '€' },
    // { code: 'KRW', name: 'South Korean Won', symbol: '₩' },
    // { code: 'ZAR', name: 'South African Rand', symbol: 'R' },
    // { code: 'THB', name: 'Thai Baht', symbol: '฿' },
    // { code: 'PHP', name: 'Philippine Peso', symbol: '₱' },
    // { code: 'AUD', name: 'Australian Dollar', symbol: 'A$' },
] as const;

export type CurrencyCode = typeof CURRENCIES[number]['code'];

// Exchange rates relative to USD (as of implementation date)
// USD is kept for backend calculations (all lab prices are stored in USD)
// Only INR is visible to users in the UI
export const EXCHANGE_RATES: Record<string, number> = {
    USD: 1.00,  // Required for conversion calculations (prices stored in USD)
    INR: 83.00, // Active user-facing currency

    // Commented out - uncomment when multi-currency support is needed
    // CAD: 1.35,
    // BRL: 5.00,
    // CHF: 0.85,
    // GBP: 0.75,
    // HKD: 7.80,
    // JPY: 145.00,
    // MXN: 17.00,
    // NZD: 1.60,
    // SGD: 1.35,
    // TWD: 31.00,
    // EUR: 0.92,
    // KRW: 1300.00,
    // ZAR: 18.50,
    // THB: 35.00,
    // PHP: 56.00,
    // AUD: 1.50,
};

/**
 * Convert a USD price to the target currency
 */
export function convertPrice(usdPrice: number, targetCurrency: CurrencyCode | string): number {
    const rate = EXCHANGE_RATES[targetCurrency];
    if (!rate) {
        console.warn(`Exchange rate not found for ${targetCurrency}, using 1.0`);
        return usdPrice;
    }
    return usdPrice * rate;
}

/**
 * Format a price with the appropriate currency symbol and formatting
 * NOTE: Input price should already be in the target currency (not USD)
 */
export function formatPrice(price: number, currency: CurrencyCode | string): string {
    const currencyInfo = CURRENCIES.find(c => c.code === currency);
    if (!currencyInfo) {
        // Fallback for currencies not in CURRENCIES array (like USD for backend)
        return `₹${price.toFixed(2)}`;
    }

    // Special formatting for currencies without decimal places
    // Currently all active currencies use 2 decimals
    const decimals = 2;
    // Uncomment when JPY/KRW are re-enabled:
    // const noDecimalCurrencies: CurrencyCode[] = ['JPY', 'KRW'];
    // const decimals = noDecimalCurrencies.includes(currency) ? 0 : 2;

    const formattedNumber = price.toFixed(decimals);

    // Format with thousands separator
    const parts = formattedNumber.split('.');
    parts[0] = parts[0].replace(/\B(?=(\d{3})+(?!\d))/g, ',');
    const formatted = parts.join('.');

    return `${currencyInfo.symbol}${formatted}`;
}

/**
 * Get currency symbol for a given currency code
 */
export function getCurrencySymbol(currency: CurrencyCode | string): string {
    const currencyInfo = CURRENCIES.find(c => c.code === currency);
    return currencyInfo?.symbol || '₹';
}
