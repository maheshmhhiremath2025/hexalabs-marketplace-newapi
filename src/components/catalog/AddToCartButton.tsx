"use client";

import { useCart } from '@/lib/store/cart';
import { ShoppingCart, Check } from 'lucide-react';
import { useState, useEffect } from 'react';

export function AddToCartButton({ course, variant = 'full' }: { course: any, variant?: 'full' | 'compact' }) {
    const { addToCart, items } = useCart();
    const [added, setAdded] = useState(false);

    useEffect(() => {
        setAdded(items.some(i => i.id === course.id));
    }, [items, course.id]);

    const handleAdd = () => {
        addToCart({
            id: course.id,
            code: course.code,
            title: course.title,
            price: course.price,
            category: course.category
        });
        setAdded(true);
        // Reset after 2 seconds
        setTimeout(() => setAdded(false), 2000);
    };

    const baseClasses = "rounded-lg transition-all shadow-md flex items-center justify-center gap-2 font-bold";
    const fullClasses = "w-full py-3.5 px-4";
    const compactClasses = "text-sm px-3 py-2";

    const activeClasses = added
        ? 'bg-green-600 text-white cursor-default'
        : 'bg-blue-600 hover:bg-blue-700 hover:shadow-lg text-white';

    return (
        <button
            onClick={handleAdd}
            disabled={added}
            className={`${baseClasses} ${variant === 'full' ? fullClasses : compactClasses} ${activeClasses}`}
        >
            {added ? (
                <>
                    <Check className={variant === 'full' ? "h-5 w-5" : "h-4 w-4"} /> {variant === 'full' ? 'Added to Cart!' : 'Added'}
                </>
            ) : (
                <>
                    <ShoppingCart className={variant === 'full' ? "h-5 w-5" : "h-4 w-4"} /> {variant === 'full' ? 'Add to Cart' : 'Add'}
                </>
            )}
        </button>
    );
}
