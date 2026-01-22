import { ReactNode } from 'react';

interface ChartCardProps {
    title: string;
    children: ReactNode;
    description?: string;
}

export default function ChartCard({ title, children, description }: ChartCardProps) {
    return (
        <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
            <div className="mb-6">
                <h3 className="text-lg font-semibold text-slate-900">{title}</h3>
                {description && (
                    <p className="text-sm text-slate-600 mt-1">{description}</p>
                )}
            </div>
            <div className="w-full overflow-x-auto">
                {children}
            </div>
        </div>
    );
}
