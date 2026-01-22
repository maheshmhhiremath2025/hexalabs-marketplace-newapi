'use client';

import Link from 'next/link';
import { Course } from '@/lib/mock-data';
import { useCurrency } from '@/contexts/CurrencyContext';
import { convertPrice, formatPrice } from '@/lib/currency';

interface ProductCardProps {
    course: Course;
}

// Map categories to colors for the overlay
const categoryColors: Record<string, string> = {
    'Microsoft Azure': 'from-blue-500 to-blue-600',
    'Data Analytics': 'from-purple-500 to-purple-600',
    'Microsoft Windows': 'from-green-500 to-green-600',
    'Dynamics 365': 'from-orange-500 to-orange-600',
    'Microsoft Data Platform': 'from-purple-500 to-purple-600',
    'Microsoft Power Platform': 'from-indigo-500 to-indigo-600',
    'Microsoft Security': 'from-red-500 to-red-600',
    'Microsoft AI': 'from-cyan-500 to-cyan-600',
    'Microsoft 365': 'from-blue-400 to-blue-500',
    'Microsoft Dynamics 365': 'from-orange-500 to-orange-600',
    'Microsoft Training': 'from-gray-500 to-gray-600',
};

export function ProductCard({ course }: ProductCardProps) {
    const { selectedCurrency } = useCurrency();
    const gradientColor = categoryColors[course.category] || 'from-gray-500 to-gray-600';

    // Convert USD price to INR, then format
    const convertedPrice = convertPrice(course.price, selectedCurrency);
    const formattedPrice = formatPrice(convertedPrice, selectedCurrency);

    return (
        <Link href={`/catalog/${course.id}`}>
            <div className="bg-white rounded-lg border border-gray-200 shadow-sm hover:shadow-md transition-all overflow-hidden flex flex-col h-full group">
                {/* Image with Colored Overlay */}
                <div className={`aspect-video bg-gradient-to-br ${gradientColor} relative flex items-center justify-center`}>
                    {/* Category Label */}
                    <div className="absolute top-3 left-3 bg-white/90 backdrop-blur-sm px-3 py-1 rounded text-xs font-semibold text-gray-700">
                        {course.category}
                    </div>

                    {/* Product Code */}
                    <div className="text-white font-bold text-3xl tracking-tight">
                        {course.code}
                    </div>
                </div>

                {/* Card Content */}
                <div className="p-4 flex-1 flex flex-col">
                    <h3 className="font-semibold text-sm text-gray-900 mb-3 group-hover:text-blue-600 transition-colors line-clamp-2">
                        {course.title}
                    </h3>

                    <div className="mt-auto pt-3 border-t border-gray-100">
                        <span className="font-bold text-lg text-gray-900">
                            {formattedPrice}
                        </span>
                    </div>
                </div>
            </div>
        </Link>
    );
}
