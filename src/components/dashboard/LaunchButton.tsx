"use client";

import { useState } from 'react';
import { Play, Loader2 } from 'lucide-react';
import { useRouter } from 'next/navigation';

interface LaunchButtonProps {
    courseId: string;
    purchaseId: string; // Unique purchase identifier
    launchCount?: number;
    maxLaunches?: number;
}

export function LaunchButton({ courseId, purchaseId, launchCount = 0, maxLaunches = 10 }: LaunchButtonProps) {
    const router = useRouter();
    const [loading, setLoading] = useState(false);

    const limitReached = launchCount >= maxLaunches;

    const handleLaunch = async () => {
        if (limitReached) {
            alert(`Launch limit reached (${maxLaunches}/${maxLaunches}). This lab has been deactivated.`);
            return;
        }

        setLoading(true);
        try {
            const res = await fetch('/api/labs/launch', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ courseId, purchaseId }),
            });

            const data = await res.json();

            if (!res.ok) {
                // Handle specific error cases
                if (data.limitReached) {
                    alert(data.message || 'Launch limit reached. Lab has been deactivated.');
                    router.refresh(); // Refresh to update UI
                } else if (data.expired) {
                    alert(data.message || 'Lab access has expired.');
                    router.refresh();
                } else {
                    alert(data.message || 'Failed to launch lab. Please try again.');
                }
                return;
            }

            console.log('Lab Provisioning Started:', data);

            // Navigate to the lab page with purchaseId
            router.push(`/lab/${purchaseId}/connect`);

        } catch (error) {
            console.error('Launch error:', error);
            alert('Error launching lab. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <button
            onClick={handleLaunch}
            disabled={loading || limitReached}
            className={`font-medium py-2 px-4 rounded-lg flex items-center gap-2 transition-colors disabled:opacity-70 disabled:cursor-not-allowed ${limitReached
                ? 'bg-gray-400 text-white cursor-not-allowed'
                : 'bg-blue-600 hover:bg-blue-700 text-white'
                }`}
            title={limitReached ? `Launch limit reached (${maxLaunches}/${maxLaunches})` : ''}
        >
            {loading ? (
                <>
                    <Loader2 className="h-4 w-4 animate-spin" />
                    Provisioning...
                </>
            ) : limitReached ? (
                <>
                    Limit Reached
                </>
            ) : (
                <>
                    <Play className="h-4 w-4" />
                    Launch Lab
                </>
            )}
        </button>
    );
}
