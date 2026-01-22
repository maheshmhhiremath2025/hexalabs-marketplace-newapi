'use client';

import { useCart } from '@/lib/store/cart';
import { useCurrency } from '@/contexts/CurrencyContext';
import { convertPrice, formatPrice } from '@/lib/currency';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { Lock } from 'lucide-react';

export function CartSummary() {
    const { items, getTotal } = useCart();
    const { selectedCurrency } = useCurrency();
    const { data: session } = useSession();
    const router = useRouter();

    const subtotalUSD = getTotal();
    const taxRate = 0; // 0% tax for now
    const taxUSD = subtotalUSD * taxRate;
    const totalUSD = subtotalUSD + taxUSD;

    const subtotal = formatPrice(convertPrice(subtotalUSD, selectedCurrency), selectedCurrency);
    const tax = formatPrice(convertPrice(taxUSD, selectedCurrency), selectedCurrency);
    const total = formatPrice(convertPrice(totalUSD, selectedCurrency), selectedCurrency);

    const handleCheckout = () => {
        if (!session) {
            // Not logged in - redirect to login with return URL
            router.push('/login?redirect=/checkout');
        } else {
            // Logged in - proceed to checkout
            router.push('/checkout');
        }
    };

    return (
        <div className="bg-white border border-gray-200 rounded-lg p-6 sticky top-24">
            <h2 className="text-xl font-bold mb-4">Order Summary</h2>

            {/* Subtotal */}
            <div className="flex justify-between mb-2">
                <span className="text-gray-600">Subtotal</span>
                <span className="font-semibold">{subtotal}</span>
            </div>

            {/* Tax */}
            {taxRate > 0 && (
                <div className="flex justify-between mb-2">
                    <span className="text-gray-600">Tax ({taxRate * 100}%)</span>
                    <span className="font-semibold">{tax}</span>
                </div>
            )}

            {/* Total */}
            <div className="border-t border-gray-200 pt-4 mt-4">
                <div className="flex justify-between mb-4">
                    <span className="text-lg font-bold">Total</span>
                    <span className="text-lg font-bold text-blue-600">{total}</span>
                </div>
            </div>

            {/* Checkout Button */}
            <button
                onClick={handleCheckout}
                disabled={items.length === 0}
                className="w-full bg-blue-600 text-white py-3 rounded-lg font-semibold hover:bg-blue-700 transition-colors disabled:bg-gray-300 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
                <Lock className="h-5 w-5" />
                {session ? 'Proceed to Checkout' : 'Sign In to Checkout'}
            </button>

            {!session && (
                <p className="text-sm text-gray-600 text-center mt-3">
                    You'll be asked to sign in before checkout
                </p>
            )}

            {/* Promo Code (Disabled) */}
            <div className="mt-6">
                <input
                    type="text"
                    placeholder="Promo code (coming soon)"
                    disabled
                    className="w-full border border-gray-300 rounded-lg px-4 py-2 text-sm bg-gray-50 cursor-not-allowed"
                />
            </div>
        </div>
    );
}
