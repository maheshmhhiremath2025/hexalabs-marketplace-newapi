"use client";

import Link from 'next/link';
import { ShoppingBag } from 'lucide-react';
import { useCart } from '@/lib/store/cart';
import { CartItem } from '@/components/cart/CartItem';
import { CartSummary } from '@/components/cart/CartSummary';
import { useState, useEffect } from 'react';

export default function CartPage() {
    const { items } = useCart();
    const [mounted, setMounted] = useState(false);

    // Prevent hydration mismatch
    useEffect(() => {
        setMounted(true);
    }, []);

    if (!mounted) {
        return <div className="container py-12 text-center">Loading...</div>;
    }

    return (
        <div className="flex-1">
            {/* Breadcrumb */}
            <div className="bg-white border-b border-gray-200 py-4 animate-fade-in">
                <div className="container">
                    <nav className="text-sm text-gray-600">
                        <Link href="/" className="hover:text-blue-600">Home</Link>
                        <span className="mx-2">/</span>
                        <span className="text-gray-900 font-medium">Shopping Cart</span>
                    </nav>
                </div>
            </div>

            <div className="container py-12">
                <h1 className="text-3xl font-bold mb-8 animate-slide-up">Shopping Cart</h1>

                {items.length === 0 ? (
                    /* Empty Cart State */
                    <div className="text-center py-16 animate-fade-in">
                        <ShoppingBag className="h-24 w-24 text-gray-300 mx-auto mb-4" />
                        <h2 className="text-2xl font-semibold text-gray-900 mb-2">
                            Your cart is empty
                        </h2>
                        <p className="text-gray-600 mb-6">
                            Start adding some labs to your cart!
                        </p>
                        <Link
                            href="/catalog"
                            className="inline-block bg-blue-600 text-white px-6 py-3 rounded-lg font-semibold hover:bg-blue-700 transition-colors"
                        >
                            Browse Catalog
                        </Link>
                    </div>
                ) : (
                    /* Cart with Items */
                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                        {/* Cart Items */}
                        <div className="lg:col-span-2">
                            <div className="bg-white rounded-lg border border-gray-200 p-6">
                                <div className="text-sm text-gray-600 mb-4">
                                    {items.length} {items.length === 1 ? 'item' : 'items'} in cart
                                </div>
                                {items.map((item) => (
                                    <CartItem key={item.id} item={item} />
                                ))}
                            </div>

                            {/* Continue Shopping */}
                            <Link
                                href="/catalog"
                                className="inline-block mt-4 text-blue-600 hover:text-blue-700 font-medium"
                            >
                                ← Continue Shopping
                            </Link>
                        </div>

                        {/* Cart Summary */}
                        <div className="lg:col-span-1">
                            <CartSummary />
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}
