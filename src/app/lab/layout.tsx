import type { Metadata } from 'next';

export const metadata: Metadata = {
    title: 'Lab Console - Hexalabs',
    description: 'Interactive Lab Environment',
};

// Lab Layout should NOT have the main site Header/Footer as it needs full screen
export default function LabLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return (
        <div className="h-screen w-screen overflow-hidden bg-slate-950">
            {children}
        </div>
    );
}
