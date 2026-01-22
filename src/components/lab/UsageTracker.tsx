"use client";

import { useEffect, useState } from 'react';
import { Clock, Zap } from 'lucide-react';

interface UsageTrackerProps {
    startTime?: Date;
    expiresAt?: Date;
}

export default function UsageTracker({ startTime, expiresAt }: UsageTrackerProps) {
    const [elapsedMinutes, setElapsedMinutes] = useState(0);
    const [remainingMinutes, setRemainingMinutes] = useState(0);

    useEffect(() => {
        if (!startTime || !expiresAt) return;

        const interval = setInterval(() => {
            const now = new Date();
            const elapsed = Math.floor((now.getTime() - new Date(startTime).getTime()) / 60000);
            const remaining = Math.floor((new Date(expiresAt).getTime() - now.getTime()) / 60000);

            setElapsedMinutes(elapsed);
            setRemainingMinutes(Math.max(0, remaining));
        }, 1000);

        return () => clearInterval(interval);
    }, [startTime, expiresAt]);

    const formatTime = (minutes: number) => {
        const hrs = Math.floor(minutes / 60);
        const mins = minutes % 60;
        return `${hrs}h ${mins}m`;
    };

    if (!startTime) return null;

    return (
        <span className="text-slate-300 font-mono text-sm">
            {formatTime(elapsedMinutes)}
            <span className="text-slate-500 mx-1">/</span>
            <span className={remainingMinutes < 30 ? 'text-yellow-400' : 'text-green-400'}>
                {formatTime(remainingMinutes)} left
            </span>
        </span>
    );
}
