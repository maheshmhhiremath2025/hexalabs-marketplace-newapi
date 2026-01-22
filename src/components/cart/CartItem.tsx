'use client';

import { useCart } from '@/lib/store/cart';
import { useCurrency } from '@/contexts/CurrencyContext';
import { convertPrice, formatPrice } from '@/lib/currency';
import { Trash2, Plus, Minus } from 'lucide-react';

interface CartItemProps {
    item: {
        id: string;
        code: string;
        title: string;
        price: number;
        quantity: number;
        category: string;
    };
}

export function CartItem({ item }: CartItemProps) {
    const { selectedCurrency } = useCurrency();
    const { updateQuantity, removeFromCart } = useCart();

    const convertedPrice = convertPrice(item.price, selectedCurrency);
    const formattedPrice = formatPrice(convertedPrice, selectedCurrency);
    const lineTotal = formatPrice(convertedPrice * item.quantity, selectedCurrency);

    // Get category color
    const getCategoryColor = (category: string) => {
        const colors: Record<string, string> = {
            'Azure': 'from-blue-500 to-blue-600',
            'Data Analytics': 'from-purple-500 to-purple-600',
            'Windows': 'from-green-500 to-green-600',
            'Dynamics': 'from-orange-500 to-orange-600',
            'Microsoft 365': 'from-indigo-500 to-indigo-600',
        };
        return colors[category] || 'from-gray-500 to-gray-600';
    };

    return (
        <div className="flex items-center gap-4 py-4 border-b border-gray-200 animate-fade-in">
            {/* Product Image Placeholder */}
            <div className={`w-20 h-20 bg-gradient-to-br ${getCategoryColor(item.category)} rounded-lg flex items-center justify-center text-white font-bold text-sm`}>
                {item.code}
            </div>

            {/* Product Info */}
            <div className="flex-1">
                <div className="text-sm text-gray-500">{item.code}</div>
                <div className="font-semibold text-gray-900">{item.title}</div>
                <div className="text-sm text-gray-600">{item.category}</div>
                <div className="text-blue-600 font-semibold mt-1">{formattedPrice}</div>
            </div>

            {/* Quantity Controls */}
            <div className="flex items-center gap-2">
                <button
                    onClick={() => updateQuantity(item.id, item.quantity - 1)}
                    className="w-8 h-8 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors flex items-center justify-center"
                    aria-label="Decrease quantity"
                >
                    <Minus className="h-4 w-4" />
                </button>
                <span className="w-12 text-center font-medium">{item.quantity}</span>
                <button
                    onClick={() => updateQuantity(item.id, item.quantity + 1)}
                    className="w-8 h-8 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors flex items-center justify-center"
                    aria-label="Increase quantity"
                >
                    <Plus className="h-4 w-4" />
                </button>
            </div>

            {/* Line Total */}
            <div className="w-24 text-right font-bold text-gray-900">
                {lineTotal}
            </div>

            {/* Remove Button */}
            <button
                onClick={() => {
                    if (confirm('Remove this item from cart?')) {
                        removeFromCart(item.id);
                    }
                }}
                className="text-red-600 hover:text-red-700 transition-colors p-2"
                aria-label="Remove item"
            >
                <Trash2 className="h-5 w-5" />
            </button>
        </div>
    );
}
