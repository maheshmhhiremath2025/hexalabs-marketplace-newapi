'use client';

import { useState } from 'react';
import { Copy, Check, ExternalLink, Loader2, Cloud } from 'lucide-react';

interface AzurePortalAccessProps {
    courseId: string;
    azureUsername?: string;
    azurePassword?: string;
    azureResourceGroup?: string;
}

interface AzureCredentials {
    username: string;
    password: string;
    resourceGroup: string;
    portalUrl: string;
}

export default function AzurePortalAccess({ courseId, azureUsername, azurePassword, azureResourceGroup }: AzurePortalAccessProps) {
    const [credentials, setCredentials] = useState<AzureCredentials | null>(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [copiedField, setCopiedField] = useState<string | null>(null);

    // If credentials are provided via props, use them
    const activeCredentials = (azureUsername && azurePassword && azureResourceGroup) ? {
        username: azureUsername,
        password: azurePassword,
        resourceGroup: azureResourceGroup,
        portalUrl: 'https://portal.azure.com'
    } : credentials;

    const createAzureAccount = async () => {
        setLoading(true);
        setError(null);

        try {
            const response = await fetch('/api/labs/create-azure-account', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ courseId })
            });

            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.message || 'Failed to create Azure account');
            }

            setCredentials(data.azurePortalAccess);
        } catch (err: any) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    const copyToClipboard = async (text: string, field: string) => {
        try {
            await navigator.clipboard.writeText(text);
            setCopiedField(field);
            setTimeout(() => setCopiedField(null), 2000);
        } catch (err) {
            console.error('Failed to copy:', err);
        }
    };

    const openAzurePortal = () => {
        if (activeCredentials) {
            window.open(activeCredentials.portalUrl, '_blank');
        }
    };

    if (!activeCredentials) {
        return (
            <div className="space-y-2">
                <button
                    onClick={createAzureAccount}
                    disabled={loading}
                    className="w-full flex items-center justify-center gap-2 px-3 py-2 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white rounded text-xs font-medium transition-colors"
                >
                    {loading ? (
                        <>
                            <Loader2 className="w-3 h-3 animate-spin" />
                            Creating...
                        </>
                    ) : (
                        <>
                            <Cloud className="w-3 h-3" />
                            Create Azure Account
                        </>
                    )}
                </button>
                {error && (
                    <p className="text-xs text-red-600">⚠️ {error}</p>
                )}
            </div>
        );
    }

    return (
        <div className="space-y-2">
            <div className="flex items-center justify-between gap-2 p-2 bg-green-50 rounded border border-green-200">
                <div className="flex items-center gap-2">
                    <Check className="w-3 h-3 text-green-600" />
                    <span className="text-xs font-medium text-green-800">Azure Account Active</span>
                </div>
                <button
                    onClick={openAzurePortal}
                    className="flex items-center gap-1 px-2 py-1 bg-blue-600 hover:bg-blue-700 text-white rounded text-xs transition-colors"
                >
                    <ExternalLink className="w-3 h-3" />
                    Open Portal
                </button>
            </div>

            <div className="space-y-1.5 text-xs">
                {/* Username */}
                <div className="flex items-center justify-between gap-2 p-2 bg-slate-50 rounded border border-slate-200">
                    <div className="flex-1 min-w-0">
                        <div className="text-[10px] text-slate-500 mb-0.5">Username</div>
                        <code className="text-[11px] font-mono text-slate-900 break-all">{activeCredentials.username}</code>
                    </div>
                    <button
                        onClick={() => copyToClipboard(activeCredentials.username, 'username')}
                        className="flex-shrink-0 p-1 hover:bg-slate-200 rounded"
                    >
                        {copiedField === 'username' ? (
                            <Check className="w-3 h-3 text-green-600" />
                        ) : (
                            <Copy className="w-3 h-3 text-slate-600" />
                        )}
                    </button>
                </div>

                {/* Password */}
                <div className="flex items-center justify-between gap-2 p-2 bg-slate-50 rounded border border-slate-200">
                    <div className="flex-1 min-w-0">
                        <div className="text-[10px] text-slate-500 mb-0.5">Password</div>
                        <code className="text-[11px] font-mono text-slate-900 break-all">{activeCredentials.password}</code>
                    </div>
                    <button
                        onClick={() => copyToClipboard(activeCredentials.password, 'password')}
                        className="flex-shrink-0 p-1 hover:bg-slate-200 rounded"
                    >
                        {copiedField === 'password' ? (
                            <Check className="w-3 h-3 text-green-600" />
                        ) : (
                            <Copy className="w-3 h-3 text-slate-600" />
                        )}
                    </button>
                </div>

                {/* Resource Group */}
                <div className="flex items-center justify-between gap-2 p-2 bg-slate-50 rounded border border-slate-200">
                    <div className="flex-1 min-w-0">
                        <div className="text-[10px] text-slate-500 mb-0.5">Resource Group</div>
                        <code className="text-[11px] font-mono text-slate-900 break-all">{activeCredentials.resourceGroup}</code>
                    </div>
                    <button
                        onClick={() => copyToClipboard(activeCredentials.resourceGroup, 'rg')}
                        className="flex-shrink-0 p-1 hover:bg-slate-200 rounded"
                    >
                        {copiedField === 'rg' ? (
                            <Check className="w-3 h-3 text-green-600" />
                        ) : (
                            <Copy className="w-3 h-3 text-slate-600" />
                        )}
                    </button>
                </div>
            </div>

            <p className="text-[10px] text-blue-700 bg-blue-50 p-2 rounded border border-blue-200">
                ℹ️ Use these credentials to login to Azure Portal
            </p>
        </div >
    );
}
