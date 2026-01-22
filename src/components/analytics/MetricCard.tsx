import { LucideIcon } from 'lucide-react';

interface MetricCardProps {
    title: string;
    value: number | string;
    change?: number;
    icon: LucideIcon;
    iconColor?: string;
}

export default function MetricCard({ title, value, change, icon: Icon, iconColor = 'blue' }: MetricCardProps) {
    const colorClasses = {
        blue: 'bg-blue-100 text-blue-600',
        green: 'bg-green-100 text-green-600',
        purple: 'bg-purple-100 text-purple-600',
        orange: 'bg-orange-100 text-orange-600',
        red: 'bg-red-100 text-red-600',
    };

    return (
        <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
            <div className="flex items-center justify-between mb-4">
                <div className={`p-3 rounded-lg ${colorClasses[iconColor as keyof typeof colorClasses] || colorClasses.blue}`}>
                    <Icon className="w-6 h-6" />
                </div>
                {change !== undefined && (
                    <span className={`text-sm font-medium ${change >= 0 ? 'text-green-600' : 'text-red-600'
                        }`}>
                        {change >= 0 ? '+' : ''}{change.toFixed(1)}%
                    </span>
                )}
            </div>
            <h3 className="text-2xl font-bold text-slate-900 mb-1">
                {typeof value === 'number' ? value.toLocaleString() : value}
            </h3>
            <p className="text-sm text-slate-600">{title}</p>
        </div>
    );
}
