import React from 'react';

interface LabConsoleProps {
    labId: string;
    initialStatus?: string;
    guacamoleConnectionId?: string;
    guacamoleUsername?: string;
    guacamolePassword?: string;
    guacamoleAuthToken?: string;
}

export default function LabConsole({
    labId,
    initialStatus = 'provisioning',
    guacamoleConnectionId,
    guacamoleUsername,
    guacamolePassword,
    guacamoleAuthToken
}: LabConsoleProps) {
    const [status, setStatus] = React.useState(initialStatus);
    const [showConsole, setShowConsole] = React.useState(false);
    const [showRefreshOverlay, setShowRefreshOverlay] = React.useState(false);

    // Debug: Log all props on mount
    console.log('[LabConsole] Component mounted with props:', {
        labId,
        initialStatus,
        hasConnectionId: !!guacamoleConnectionId,
        hasUsername: !!guacamoleUsername,
        hasPassword: !!guacamolePassword,
        hasAuthToken: !!guacamoleAuthToken,
        authTokenPreview: guacamoleAuthToken ? guacamoleAuthToken.substring(0, 20) + '...' : 'MISSING'
    });

    // If VM is already running and we have credentials, check if should show overlay
    React.useEffect(() => {
        if (initialStatus === 'running' && guacamoleConnectionId && (guacamoleAuthToken || guacamoleUsername)) {
            // Check if user already clicked refresh for this specific lab session
            const refreshKey = `lab-refreshed-${labId}`;
            const hasRefreshed = sessionStorage.getItem(refreshKey);

            if (hasRefreshed) {
                // Already refreshed, hide overlay and show console
                console.log('[LabConsole] Already refreshed this session, hiding overlay');
                setShowConsole(true);
                setShowRefreshOverlay(false);
            } else {
                // First time, show overlay
                console.log('[LabConsole] First load, showing refresh overlay');
                setShowConsole(true);
                setShowRefreshOverlay(true);
            }
        }
    }, []);


    // Poll for lab status
    React.useEffect(() => {
        if (showConsole) return; // Don't poll if console is already showing

        let isActive = true;
        let pollCount = 0;
        const MAX_POLLS = 20; // Stop after 20 polls (60 seconds)

        console.log('[LabConsole] Starting polling for lab:', labId);

        // Poll status every 3 seconds until VM is running
        const interval = setInterval(async () => {
            if (!isActive) return;

            pollCount++;
            console.log(`[LabConsole] Poll #${pollCount}/${MAX_POLLS} for ${labId}`);

            // Stop polling after max attempts
            if (pollCount >= MAX_POLLS) {
                console.log('[LabConsole] Max polls reached, stopping');
                clearInterval(interval);
                isActive = false;
                // Show console anyway if we have credentials (either token or username/password)
                if (guacamoleConnectionId && (guacamoleAuthToken || guacamoleUsername)) {
                    setShowConsole(true);
                }
                return;
            }

            try {
                const response = await fetch(`/api/labs/status?labId=${labId}`);
                if (!response.ok) {
                    console.log('[LabConsole] Lab deleted or not found, stopping polling');
                    clearInterval(interval);
                    isActive = false;
                    return;
                }

                const data = await response.json();
                console.log(`[LabConsole] Status: ${data.status}`);
                setStatus(data.status);

                // Show console when VM is running and we have Guacamole credentials (token or username/password)
                console.log('[LabConsole] Checking if should show console:', {
                    status: data.status,
                    hasConnectionId: !!guacamoleConnectionId,
                    hasAuthToken: !!guacamoleAuthToken,
                    hasUsername: !!guacamoleUsername,
                    willShow: data.status === 'running' && guacamoleConnectionId && (guacamoleAuthToken || guacamoleUsername)
                });

                if (data.status === 'running' && guacamoleConnectionId && (guacamoleAuthToken || guacamoleUsername)) {
                    console.log('[LabConsole] VM is running with Guacamole credentials, showing console and STOPPING polling');
                    setShowConsole(true);
                    clearInterval(interval);
                    isActive = false;
                } else if (data.status === 'running') {
                    // VM is running but no Guacamole credentials - stop polling but don't show console
                    console.log('[LabConsole] VM is running but no Guacamole credentials, stopping polling');
                    clearInterval(interval);
                    isActive = false;
                }
            } catch (error) {
                console.error('[LabConsole] Polling error, stopping:', error);
                clearInterval(interval);
                isActive = false;
            }
        }, 3000); // Poll every 3 seconds

        return () => {
            console.log('[LabConsole] Cleanup - stopping polling');
            isActive = false;
            clearInterval(interval);
        };
    }, [labId, guacamoleConnectionId, guacamoleAuthToken, guacamoleUsername, showConsole, initialStatus]);

    // Manual refresh handler
    const handleManualRefresh = () => {
        // Mark this lab session as refreshed (clears when browser closes)
        sessionStorage.setItem(`lab-refreshed-${labId}`, 'true');
        window.location.reload();
    };


    if (showConsole) {
        const guacamoleBaseUrl = 'http://20.193.146.110:8080/guacamole';

        // Use username/password authentication (works reliably)
        const iframeUrl = `${guacamoleBaseUrl}/#/?username=${encodeURIComponent(guacamoleUsername || '')}&password=${encodeURIComponent(guacamolePassword || '')}`;

        console.log('[LabConsole] Showing Guacamole iframe:', {
            connectionId: guacamoleConnectionId,
            username: guacamoleUsername,
            hasPassword: !!guacamolePassword,
            hasAuthToken: !!guacamoleAuthToken,
            authTokenPreview: guacamoleAuthToken ? guacamoleAuthToken.substring(0, 20) + '...' : 'MISSING',
            usingTokenAuth: !!guacamoleAuthToken,
            iframeUrl: iframeUrl
        });

        return (
            <div className="flex-1 bg-black relative w-full h-full overflow-hidden">
                <style dangerouslySetInnerHTML={{
                    __html: `
                    iframe {
                        width: 100%;
                        height: 100%;
                        border: none;
                        ${showRefreshOverlay ? 'filter: blur(10px);' : ''}
                    }
                    @keyframes spin-slow {
                        from { transform: rotate(0deg); }
                        to { transform: rotate(360deg); }
                    }
                    .spin-slow {
                        animation: spin-slow 3s linear infinite;
                    }
                `}} />
                <iframe
                    src={iframeUrl}
                    allowFullScreen
                    title="Remote Console"
                    onLoad={() => console.log('[LabConsole] Iframe loaded')}
                    onError={(e) => console.error('[LabConsole] Iframe error:', e)}
                />
                {/* Refresh overlay - shows when VM is running */}
                {showRefreshOverlay && (
                    <div className="absolute inset-0 flex items-center justify-center bg-gradient-to-br from-slate-900/95 via-slate-800/95 to-slate-900/95 backdrop-blur-md z-50">
                        <div className="text-center space-y-8 max-w-lg px-8">
                            {/* Icon */}
                            <div className="mx-auto w-24 h-24 bg-gradient-to-br from-blue-500 to-blue-600 rounded-full flex items-center justify-center shadow-2xl">
                                <svg className="w-12 h-12 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                                </svg>
                            </div>

                            {/* Title */}
                            <div className="space-y-3">
                                <h2 className="text-4xl font-bold text-white tracking-tight">
                                    Lab is Ready!
                                </h2>
                                <p className="text-xl text-slate-300">
                                    Please refresh the page to access your lab
                                </p>
                            </div>

                            {/* Info */}
                            <div className="bg-blue-500/10 border border-blue-500/30 rounded-lg p-4">
                                <p className="text-blue-300 text-sm">
                                    Your Windows Server environment is fully provisioned and ready to use
                                </p>
                            </div>

                            {/* Refresh button */}
                            <div className="pt-2">
                                <button
                                    onClick={handleManualRefresh}
                                    className="bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white font-bold text-lg py-4 px-12 rounded-xl transition-all duration-200 transform hover:scale-105 shadow-2xl flex items-center gap-3 mx-auto"
                                >
                                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                                    </svg>
                                    <span>click here</span>
                                </button>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        );
    }

    // Loading states
    console.log('[LabConsole] Rendering loading state:', {
        status,
        hasConnectionId: !!guacamoleConnectionId,
        hasUsername: !!guacamoleUsername,
        hasPassword: !!guacamolePassword,
        showConsole
    });

    return (
        <div className="flex-1 flex items-center justify-center bg-gradient-to-br from-gray-900 to-black">
            <div className="text-center space-y-6 p-8">
                <div className="relative">
                    <div className="w-24 h-24 mx-auto">
                        <div className="absolute inset-0 border-4 border-blue-500/30 rounded-full"></div>
                        <div className="absolute inset-0 border-4 border-t-blue-500 rounded-full animate-spin"></div>
                    </div>
                </div>

                <div className="space-y-2">
                    <h3 className="text-2xl font-bold text-white">
                        {status === 'provisioning' ? 'Provisioning Your Lab Environment' : 'Preparing Console'}
                    </h3>
                    <p className="text-gray-400">
                        {status === 'provisioning'
                            ? 'Setting up your virtual machine and configuring network...'
                            : 'Establishing secure connection to your lab...'}
                    </p>
                </div>

                <div className="flex items-center justify-center space-x-2 text-sm text-gray-500">
                    <div className="w-2 h-2 bg-blue-500 rounded-full animate-pulse"></div>
                    <span>This may take a few moments</span>
                </div>
            </div>
        </div>
    );
}
