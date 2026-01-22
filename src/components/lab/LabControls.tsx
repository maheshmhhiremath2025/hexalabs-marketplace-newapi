"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Loader2, RotateCw, X, Trash2, Clock, Download } from "lucide-react";
import ConfirmModal from './ConfirmModal';

interface LabControlsProps {
    purchaseId: string;
    courseId: string;
    launchCount?: number;
    maxLaunches?: number;
    sessionExpiresAt?: Date;
}

export default function LabControls({ purchaseId, courseId, launchCount = 0, maxLaunches = 10, sessionExpiresAt }: LabControlsProps) {
    const router = useRouter();
    const [loading, setLoading] = useState(false);
    const [restarting, setRestarting] = useState(false);
    const [closing, setClosing] = useState(false);
    const [showCloseModal, setShowCloseModal] = useState(false);
    const [showDestroyModal, setShowDestroyModal] = useState(false);
    const [timeRemaining, setTimeRemaining] = useState<string>('');
    const [showWarning, setShowWarning] = useState(false);

    const remainingLaunches = maxLaunches - launchCount;

    // Session timer and warning
    useEffect(() => {
        if (!sessionExpiresAt) return;

        const updateTimer = () => {
            const now = new Date().getTime();
            const expiry = new Date(sessionExpiresAt).getTime();
            const diff = expiry - now;

            if (diff <= 0) {
                setTimeRemaining('Session expired');
                return;
            }

            const hours = Math.floor(diff / (1000 * 60 * 60));
            const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));

            setTimeRemaining(`${hours}h ${minutes}m remaining`);

            // Show warning if less than 1 hour remaining
            if (diff <= 60 * 60 * 1000 && !showWarning) {
                setShowWarning(true);
                alert('⚠️ Session Expiring Soon!\n\nYour lab session will expire in less than 1 hour.\n\nPlease close the lab now to save your work via snapshot, then relaunch to continue.');
            }
        };

        updateTimer();
        const interval = setInterval(updateTimer, 60000); // Update every minute

        return () => clearInterval(interval);
    }, [sessionExpiresAt, showWarning]);

    const handleRestart = async () => {
        if (!confirm("Restart the VM? This will reboot the virtual machine.")) return;

        setRestarting(true);
        try {
            const res = await fetch(`/api/labs/restart`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ courseId }),
            });

            const data = await res.json();

            if (res.ok) {
                alert('VM restart initiated. Please wait a few moments for the VM to come back online.');
                router.refresh();
            } else {
                alert(data.error || 'Failed to restart VM');
            }
        } catch (error) {
            console.error("Failed to restart VM", error);
            alert('Failed to restart VM. Please try again.');
        } finally {
            setRestarting(false);
        }
    };

    const handleCloseLab = async () => {
        setShowCloseModal(true);
    };

    const confirmClose = async () => {
        setShowCloseModal(false);
        setClosing(true);

        // Redirect immediately - don't wait for snapshot/delete to complete
        router.push('/dashboard');

        // Trigger close in background (fire and forget)
        fetch(`/api/labs/close`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ purchaseId }),
        }).then(res => {
            console.log('[LabControls] Close lab response:', res.status);
            if (res.ok) {
                console.log('[LabControls] Lab closed successfully in background');
            } else {
                console.error('[LabControls] Failed to close lab in background');
            }
        }).catch(error => {
            console.error('[LabControls] Error closing lab in background:', error);
        });

        // Refresh dashboard after navigation
        setTimeout(() => {
            router.refresh();
        }, 500);
    };

    const handleDestroy = async () => {
        if (!confirm("⚠️ DESTROY LAB SESSION?\n\nThis will:\n- Delete VM and all resources\n- Delete snapshot (lose all work)\n- Clear session data\n\n⚠️ The lab will remain in your dashboard for future use\n\nAre you sure?")) return;

        setLoading(true);
        try {
            const res = await fetch(`/api/labs/delete?purchaseId=${encodeURIComponent(purchaseId)}`, {
                method: "DELETE",
            });

            const data = await res.json();

            if (res.ok) {
                alert('✅ Lab Session Destroyed!\n\n' + (data.message || 'All resources have been deleted.') + '\n\nRedirecting to dashboard...');
                router.push('/dashboard');
                router.refresh();
            } else {
                alert(data.error || 'Failed to destroy lab');
                setLoading(false);
            }
        } catch (error) {
            console.error("Failed to destroy lab", error);
            alert('Failed to destroy lab. Please try again.');
            setLoading(false);
        }
    };

    const confirmDestroy = async () => {
        setShowDestroyModal(false);
        setLoading(true);
        try {
            const res = await fetch(`/api/labs/delete?purchaseId=${encodeURIComponent(purchaseId)}`, {
                method: "DELETE",
            });

            const data = await res.json();

            if (res.ok) {
                router.push('/dashboard');
                router.refresh();
            } else {
                alert(data.error || 'Failed to destroy lab');
                setLoading(false);
            }
        } catch (error) {
            console.error("Failed to destroy lab", error);
            alert('Failed to destroy lab. Please try again.');
            setLoading(false);
        }
    };

    return (
        <>
            <div className="space-y-2">
                {/* Session Timer */}
                {sessionExpiresAt && (
                    <div className={`border rounded px-3 py-2 ${showWarning
                        ? 'bg-red-900/20 border-red-900/50'
                        : 'bg-slate-800/20 border-slate-700'
                        }`}>
                        <div className="flex items-center gap-2 text-xs">
                            <Clock className="w-3 h-3" />
                            <span className={showWarning ? 'text-red-400 font-bold' : 'text-slate-400'}>
                                {timeRemaining}
                            </span>
                        </div>
                    </div>
                )}

                {/* Launch Counter */}
                <div className="bg-blue-900/20 border border-blue-900/50 rounded px-3 py-2">
                    <div className="text-xs text-blue-300 font-medium">
                        Launches: {launchCount}/{maxLaunches}
                    </div>
                    <div className="text-xs text-blue-400 mt-0.5">
                        {remainingLaunches} remaining
                    </div>
                </div>

                {/* Restart VM Button */}
                <button
                    onClick={handleRestart}
                    disabled={restarting}
                    className="w-full bg-slate-800 hover:bg-slate-700 text-slate-300 py-2 rounded text-sm transition-colors text-left px-4 flex items-center justify-between disabled:opacity-50 disabled:cursor-not-allowed"
                >
                    <span className="flex items-center gap-2">
                        <RotateCw className={`h-4 w-4 ${restarting ? 'animate-spin' : ''}`} />
                        {restarting ? "Restarting..." : "Restart VM"}
                    </span>
                </button>

                {/* Close Lab Button */}
                <button
                    onClick={handleCloseLab}
                    disabled={closing}
                    className="w-full bg-green-900/20 hover:bg-green-900/40 text-green-400 border border-green-900/50 py-2 rounded text-sm transition-colors text-left px-4 flex items-center justify-between disabled:opacity-50 disabled:cursor-not-allowed"
                >
                    <span className="flex items-center gap-2">
                        <X className="h-4 w-4" />
                        {closing ? "Closing..." : "Close Lab (Save Work)"}
                    </span>
                    {closing && <Loader2 className="h-4 w-4 animate-spin" />}
                </button>

                {/* Destroy Lab Button */}
                <button
                    onClick={handleDestroy}
                    disabled={loading}
                    className="w-full bg-red-900/20 hover:bg-red-900/40 text-red-400 border border-red-900/50 py-2 rounded text-sm transition-colors text-left px-4 flex items-center justify-between disabled:opacity-50 disabled:cursor-not-allowed"
                >
                    <span className="flex items-center gap-2">
                        <Trash2 className="h-4 w-4" />
                        {loading ? "Destroying..." : "Destroy Session"}
                    </span>
                    {loading && <Loader2 className="h-4 w-4 animate-spin" />}
                </button>
            </div>

            {/* Close Modal */}
            <ConfirmModal
                isOpen={showCloseModal}
                onClose={() => setShowCloseModal(false)}
                onConfirm={confirmClose}
                title="Close Lab Session?"
                message="Your work will be saved via snapshot. You can resume later. VM resources will be deleted to save costs."
                confirmText="Close Lab"
                cancelText="Cancel"
                type="warning"
            />

            {/* Destroy Modal */}
            <ConfirmModal
                isOpen={showDestroyModal}
                onClose={() => setShowDestroyModal(false)}
                onConfirm={confirmDestroy}
                title="Destroy Lab Session?"
                message="This will permanently delete the VM, snapshot, and all your work. The lab will remain in your dashboard for future use."
                confirmText="Destroy"
                cancelText="Cancel"
                type="danger"
            />
        </>
    );
}
