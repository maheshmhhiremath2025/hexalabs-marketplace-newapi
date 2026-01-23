'use client';

import { useState, useEffect } from 'react';
import { Key, Copy, Trash2, Plus, Eye, EyeOff, CheckCircle } from 'lucide-react';

interface ApiKey {
    id: string;
    name: string;
    key: string;
    createdAt: string;
    lastUsed?: string;
    expiresAt?: string;
}

export default function SettingsPage() {
    const [apiKeys, setApiKeys] = useState<ApiKey[]>([]);
    const [loading, setLoading] = useState(true);
    const [showNewKeyModal, setShowNewKeyModal] = useState(false);
    const [newKeyName, setNewKeyName] = useState('');
    const [newlyCreatedKey, setNewlyCreatedKey] = useState<string | null>(null);
    const [copiedKey, setCopiedKey] = useState<string | null>(null);
    const [visibleKeys, setVisibleKeys] = useState<Set<string>>(new Set());

    useEffect(() => {
        fetchApiKeys();
    }, []);

    const fetchApiKeys = async () => {
        try {
            const response = await fetch('/api/v1/api-keys');
            if (response.ok) {
                const data = await response.json();
                setApiKeys(data.apiKeys || []);
            }
        } catch (error) {
            console.error('Failed to fetch API keys:', error);
        } finally {
            setLoading(false);
        }
    };

    const createApiKey = async () => {
        if (!newKeyName.trim()) return;

        try {
            const response = await fetch('/api/v1/api-keys', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    name: newKeyName,
                    description: 'LMS Integration API Key',
                    scopes: ['read:courses', 'write:orders', 'read:labs', 'write:labs'],
                    tier: 'standard',
                    environment: 'production'
                })
            });

            if (response.ok) {
                const data = await response.json();
                setNewlyCreatedKey(data.apiKey?.key || data.key);
                setNewKeyName('');
                fetchApiKeys();
            } else {
                const error = await response.json();
                alert(`Failed to create API key: ${error.error || 'Unknown error'}`);
            }
        } catch (error) {
            console.error('Failed to create API key:', error);
            alert('Failed to create API key. Please try again.');
        }
    };

    const deleteApiKey = async (id: string) => {
        if (!confirm('Are you sure you want to delete this API key? This action cannot be undone.')) {
            return;
        }

        try {
            const response = await fetch(`/api/v1/api-keys/${id}`, {
                method: 'DELETE'
            });

            if (response.ok) {
                fetchApiKeys();
            }
        } catch (error) {
            console.error('Failed to delete API key:', error);
        }
    };

    const copyToClipboard = (key: string, id: string) => {
        navigator.clipboard.writeText(key);
        setCopiedKey(id);
        setTimeout(() => setCopiedKey(null), 2000);
    };

    const toggleKeyVisibility = (id: string) => {
        const newVisible = new Set(visibleKeys);
        if (newVisible.has(id)) {
            newVisible.delete(id);
        } else {
            newVisible.add(id);
        }
        setVisibleKeys(newVisible);
    };

    const maskKey = (key: string) => {
        return key.substring(0, 12) + '•'.repeat(20);
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50">
            <div className="container mx-auto px-4 py-8 max-w-6xl">
                {/* Header */}
                <div className="mb-8">
                    <h1 className="text-3xl font-bold text-gray-900 mb-2">Settings</h1>
                    <p className="text-gray-600">Manage your API keys and integration settings</p>
                </div>

                {/* API Keys Section */}
                <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                    <div className="flex items-center justify-between mb-6">
                        <div className="flex items-center gap-3">
                            <Key className="w-6 h-6 text-blue-600" />
                            <div>
                                <h2 className="text-xl font-semibold text-gray-900">API Keys</h2>
                                <p className="text-sm text-gray-600">Use API keys to integrate with LMS platforms</p>
                            </div>
                        </div>
                        <button
                            onClick={() => setShowNewKeyModal(true)}
                            className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg transition-colors"
                        >
                            <Plus className="w-4 h-4" />
                            Create New Key
                        </button>
                    </div>

                    {/* API Keys List */}
                    {loading ? (
                        <div className="text-center py-8 text-gray-500">Loading...</div>
                    ) : apiKeys.length === 0 ? (
                        <div className="text-center py-12 bg-gray-50 rounded-lg">
                            <Key className="w-12 h-12 text-gray-400 mx-auto mb-3" />
                            <p className="text-gray-600 mb-2">No API keys yet</p>
                            <p className="text-sm text-gray-500">Create your first API key to start integrating with LMS platforms</p>
                        </div>
                    ) : (
                        <div className="space-y-3">
                            {apiKeys.map((apiKey) => (
                                <div
                                    key={apiKey.id}
                                    className="border border-gray-200 rounded-lg p-4 hover:border-blue-300 transition-colors"
                                >
                                    <div className="flex items-center justify-between">
                                        <div className="flex-1">
                                            <h3 className="font-semibold text-gray-900 mb-1">{apiKey.name}</h3>
                                            <div className="flex items-center gap-2 mb-2">
                                                <code className="text-sm bg-gray-100 px-3 py-1 rounded font-mono text-gray-700">
                                                    {visibleKeys.has(apiKey.id) ? apiKey.key : maskKey(apiKey.key)}
                                                </code>
                                                <button
                                                    onClick={() => toggleKeyVisibility(apiKey.id)}
                                                    className="text-gray-500 hover:text-gray-700 p-1"
                                                    title={visibleKeys.has(apiKey.id) ? 'Hide key' : 'Show key'}
                                                >
                                                    {visibleKeys.has(apiKey.id) ? (
                                                        <EyeOff className="w-4 h-4" />
                                                    ) : (
                                                        <Eye className="w-4 h-4" />
                                                    )}
                                                </button>
                                                <button
                                                    onClick={() => copyToClipboard(apiKey.key, apiKey.id)}
                                                    className="text-gray-500 hover:text-gray-700 p-1"
                                                    title="Copy to clipboard"
                                                >
                                                    {copiedKey === apiKey.id ? (
                                                        <CheckCircle className="w-4 h-4 text-green-600" />
                                                    ) : (
                                                        <Copy className="w-4 h-4" />
                                                    )}
                                                </button>
                                            </div>
                                            <div className="flex gap-4 text-xs text-gray-500">
                                                <span>Created: {new Date(apiKey.createdAt).toLocaleDateString()}</span>
                                                {apiKey.lastUsed && (
                                                    <span>Last used: {new Date(apiKey.lastUsed).toLocaleDateString()}</span>
                                                )}
                                            </div>
                                        </div>
                                        <button
                                            onClick={() => deleteApiKey(apiKey.id)}
                                            className="text-red-600 hover:text-red-700 p-2 rounded-lg hover:bg-red-50 transition-colors"
                                            title="Delete API key"
                                        >
                                            <Trash2 className="w-5 h-5" />
                                        </button>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>

                {/* New Key Modal */}
                {showNewKeyModal && (
                    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
                        <div className="bg-white rounded-xl shadow-xl max-w-md w-full p-6">
                            <h3 className="text-xl font-semibold text-gray-900 mb-4">Create New API Key</h3>

                            {newlyCreatedKey ? (
                                <div>
                                    <div className="bg-green-50 border border-green-200 rounded-lg p-4 mb-4">
                                        <p className="text-sm text-green-800 mb-2 font-medium">
                                            ✓ API Key Created Successfully!
                                        </p>
                                        <p className="text-xs text-green-700 mb-3">
                                            Copy this key now - it won't be shown again!
                                        </p>
                                        <div className="flex items-center gap-2">
                                            <code className="flex-1 text-sm bg-white px-3 py-2 rounded border border-green-300 font-mono text-gray-900 break-all">
                                                {newlyCreatedKey}
                                            </code>
                                            <button
                                                onClick={() => copyToClipboard(newlyCreatedKey, 'new')}
                                                className="bg-green-600 hover:bg-green-700 text-white p-2 rounded transition-colors"
                                            >
                                                {copiedKey === 'new' ? (
                                                    <CheckCircle className="w-5 h-5" />
                                                ) : (
                                                    <Copy className="w-5 h-5" />
                                                )}
                                            </button>
                                        </div>
                                    </div>
                                    <button
                                        onClick={() => {
                                            setShowNewKeyModal(false);
                                            setNewlyCreatedKey(null);
                                        }}
                                        className="w-full bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg transition-colors"
                                    >
                                        Done
                                    </button>
                                </div>
                            ) : (
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        Key Name
                                    </label>
                                    <input
                                        type="text"
                                        value={newKeyName}
                                        onChange={(e) => setNewKeyName(e.target.value)}
                                        placeholder="e.g., LMS Integration - Moodle"
                                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent mb-4"
                                        autoFocus
                                    />
                                    <div className="flex gap-3">
                                        <button
                                            onClick={() => {
                                                setShowNewKeyModal(false);
                                                setNewKeyName('');
                                            }}
                                            className="flex-1 bg-gray-100 hover:bg-gray-200 text-gray-700 px-4 py-2 rounded-lg transition-colors"
                                        >
                                            Cancel
                                        </button>
                                        <button
                                            onClick={createApiKey}
                                            disabled={!newKeyName.trim()}
                                            className="flex-1 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                                        >
                                            Create Key
                                        </button>
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>
                )}

                {/* Documentation Link */}
                <div className="mt-6 bg-blue-50 border border-blue-200 rounded-lg p-4">
                    <h3 className="font-semibold text-blue-900 mb-2">📚 Integration Documentation</h3>
                    <p className="text-sm text-blue-800 mb-3">
                        Learn how to integrate Hexalabs Marketplace with your LMS platform using API keys.
                    </p>
                    <a
                        href="/docs/lms-integration"
                        className="inline-flex items-center gap-2 text-blue-600 hover:text-blue-700 font-medium text-sm"
                    >
                        View Integration Guide →
                    </a>
                </div>
            </div>
        </div>
    );
}
