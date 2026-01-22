"use client";

import React from 'react';

interface AnalyticsCardProps {
    title: string;
    value: string | number;
    icon: React.ReactNode;
    color?: 'blue' | 'green' | 'purple' | 'orange';
    subtitle?: string;
}

export default function AnalyticsCard({
    title,
    value,
    icon,
    color = 'blue',
    subtitle
}: AnalyticsCardProps) {
    const colorClasses = {
        blue: 'from-blue-500 to-blue-600',
        green: 'from-green-500 to-green-600',
        purple: 'from-purple-500 to-purple-600',
        orange: 'from-orange-500 to-orange-600'
    };

    const bgColorClasses = {
        blue: 'bg-blue-500/10',
        green: 'bg-green-500/10',
        purple: 'bg-purple-500/10',
        orange: 'bg-orange-500/10'
    };

    return (
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 hover:shadow-lg hover:scale-105 transition-all duration-300 cursor-pointer">
            <div className="flex items-start justify-between">
                <div className="flex-1">
                    <p className="text-sm font-medium text-gray-600 mb-1">{title}</p>
                    <p className="text-3xl font-bold text-gray-900 mb-1 transition-all duration-300">{value}</p>
                    {subtitle && (
                        <p className="text-xs text-gray-500">{subtitle}</p>
                    )}
                </div>
                <div className={`p-3 rounded-lg ${bgColorClasses[color]} transition-transform duration-300 hover:rotate-12`}>
                    <div className={`text-${color}-600`}>
                        {icon}
                    </div>
                </div>
            </div>
        </div>
    );
}
