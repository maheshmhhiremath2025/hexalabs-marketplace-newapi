'use client';

import { useState } from 'react';
import { Terminal, Clock, ChevronLeft, ChevronRight } from 'lucide-react';
import LabConsole from './LabConsole';
import LabInstructions from './LabInstructions';
import UsageTracker from './UsageTracker';

interface LabConnectClientProps {
    purchaseId: string;
    courseId: string;
    status: string;
    vmPublicIP?: string;
    requiresAzurePortal?: boolean; // NEW: Flag from course data
    sessionData: {
        id: string;
        startTime: Date;
        expiresAt: Date;
        guacamoleConnectionId?: string;
        guacamoleUsername?: string;
        guacamolePassword?: string;
        guacamoleAuthToken?: string;
        azureUsername?: string;
        azurePassword?: string;
        azureResourceGroup?: string;
        launchCount?: number;
        maxLaunches?: number;
    };
}

export default function LabConnectClient({ purchaseId, courseId, status, vmPublicIP, requiresAzurePortal, sessionData }: LabConnectClientProps) {
    const [showInstructions, setShowInstructions] = useState(true);

    return (
        <div className="fixed inset-0 bg-slate-950 text-white font-mono flex flex-col">
            {/* Compact Header */}
            <div className="border-b border-slate-800 bg-slate-900 px-4 py-2 flex items-center justify-between flex-shrink-0">
                <div className="flex items-center gap-3">
                    <Terminal className="h-5 w-5 text-green-400" />
                    <h1 className="font-bold text-sm">Hexalabs Lab</h1>
                    <span className="bg-slate-800 px-2 py-0.5 rounded text-xs text-slate-400">LAB-{courseId.toUpperCase()}</span>
                </div>
                <div className="flex items-center gap-2">
                    <div className={`w-2 h-2 rounded-full ${status === 'running' ? 'bg-green-500 animate-pulse' : 'bg-yellow-500'}`} />
                    <span className="uppercase tracking-wider text-slate-400 text-xs">{status}</span>
                </div>
            </div>

            {/* Main Content - Full Height */}
            <div className="flex flex-1 overflow-hidden relative">

                {/* Left Panel: Lab Instructions with Credentials */}
                {showInstructions && (
                    <div className="w-80 h-full border-r border-slate-200 bg-white flex-shrink-0 overflow-hidden">
                        <LabInstructions
                            purchaseId={purchaseId}
                            courseId={courseId}
                            vmPublicIP={vmPublicIP}
                            labId={sessionData.id}
                            launchCount={sessionData.launchCount}
                            maxLaunches={sessionData.maxLaunches}
                            sessionExpiresAt={sessionData.expiresAt}
                            azureUsername={sessionData.azureUsername}
                            azurePassword={sessionData.azurePassword}
                            azureResourceGroup={sessionData.azureResourceGroup}
                            requiresAzurePortal={requiresAzurePortal}
                        />
                    </div>
                )}

                {/* Toggle Button for Instructions */}
                <button
                    onClick={() => setShowInstructions(!showInstructions)}
                    className="absolute left-0 top-1/2 -translate-y-1/2 z-10 bg-slate-800 hover:bg-slate-700 text-white p-2 rounded-r-lg shadow-lg transition-all"
                    style={{ left: showInstructions ? '320px' : '0' }}
                    title={showInstructions ? 'Hide Instructions' : 'Show Instructions'}
                >
                    {showInstructions ? (
                        <ChevronLeft className="w-4 h-4" />
                    ) : (
                        <ChevronRight className="w-4 h-4" />
                    )}
                </button>

                {/* Right Panel: Maximized Console */}
                <div className="flex-1 h-full bg-slate-900 relative">
                    <LabConsole
                        initialStatus={status}
                        labId={sessionData.id}
                        guacamoleConnectionId={sessionData.guacamoleConnectionId}
                        guacamoleUsername={sessionData.guacamoleUsername}
                        guacamolePassword={sessionData.guacamolePassword}
                        guacamoleAuthToken={sessionData.guacamoleAuthToken}
                    />

                    {/* Floating Usage Timer - Bottom Right */}
                    <div className="absolute bottom-4 right-4 bg-slate-900/95 backdrop-blur border border-slate-700 rounded-lg px-4 py-2 shadow-xl">
                        <div className="flex items-center gap-2 text-sm">
                            <Clock className="h-4 w-4 text-green-400" />
                            <UsageTracker
                                startTime={sessionData.startTime}
                                expiresAt={sessionData.expiresAt}
                            />
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
