'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Edit, Trash2, X, Loader2 } from 'lucide-react';

interface Organization {
    _id: string;
    name: string;
    contactEmail: string;
    isActive: boolean;
}

export default function OrgActions({ organization }: { organization: Organization }) {
    const router = useRouter();
    const [showEditModal, setShowEditModal] = useState(false);
    const [showDeleteModal, setShowDeleteModal] = useState(false);

    // Edit form state
    const [name, setName] = useState(organization.name);
    const [contactEmail, setContactEmail] = useState(organization.contactEmail);
    const [isActive, setIsActive] = useState(organization.isActive);

    // Delete confirmation
    const [deleteConfirmText, setDeleteConfirmText] = useState('');

    // Loading states
    const [saving, setSaving] = useState(false);
    const [deleting, setDeleting] = useState(false);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');

    const handleEdit = async () => {
        if (!name || !contactEmail) {
            setError('Name and email are required');
            return;
        }

        setSaving(true);
        setError('');
        setSuccess('');

        try {
            const response = await fetch(`/api/super-admin/organizations/${organization._id}`, {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ name, contactEmail, isActive }),
            });

            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.error || 'Failed to update organization');
            }

            setSuccess('Organization updated successfully!');
            setTimeout(() => {
                setShowEditModal(false);
                router.refresh();
            }, 1500);
        } catch (err: any) {
            setError(err.message);
        } finally {
            setSaving(false);
        }
    };

    const handleDelete = async () => {
        if (deleteConfirmText !== 'DELETE') {
            setError('Please type DELETE to confirm');
            return;
        }

        setDeleting(true);
        setError('');

        try {
            const response = await fetch(`/api/super-admin/organizations/${organization._id}`, {
                method: 'DELETE',
            });

            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.error || 'Failed to delete organization');
            }

            router.push('/super-admin/organizations');
        } catch (err: any) {
            setError(err.message);
        } finally {
            setDeleting(false);
        }
    };

    return (
        <>
            <div className="flex gap-3">
                <button
                    onClick={() => setShowEditModal(true)}
                    className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium transition-colors"
                >
                    <Edit className="w-4 h-4" />
                    Edit Organization
                </button>
                <button
                    onClick={() => setShowDeleteModal(true)}
                    className="flex items-center gap-2 px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg font-medium transition-colors"
                >
                    <Trash2 className="w-4 h-4" />
                    Delete Organization
                </button>
            </div>

            {/* Edit Modal */}
            {showEditModal && (
                <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
                    <div className="bg-white rounded-xl shadow-xl max-w-md w-full p-6">
                        <div className="flex items-center justify-between mb-4">
                            <h2 className="text-2xl font-bold text-slate-900">Edit Organization</h2>
                            <button
                                onClick={() => {
                                    setShowEditModal(false);
                                    setError('');
                                    setSuccess('');
                                }}
                                className="p-1 hover:bg-slate-100 rounded-lg transition-colors"
                            >
                                <X className="w-5 h-5 text-slate-500" />
                            </button>
                        </div>

                        {error && (
                            <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm">
                                {error}
                            </div>
                        )}

                        {success && (
                            <div className="mb-4 p-3 bg-green-50 border border-green-200 rounded-lg text-green-700 text-sm">
                                ✓ {success}
                            </div>
                        )}

                        <div className="space-y-4 mb-6">
                            <div>
                                <label className="block text-sm font-medium text-slate-700 mb-2">
                                    Organization Name
                                </label>
                                <input
                                    type="text"
                                    value={name}
                                    onChange={(e) => setName(e.target.value)}
                                    className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                    placeholder="Acme Corporation"
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-slate-700 mb-2">
                                    Contact Email
                                </label>
                                <input
                                    type="email"
                                    value={contactEmail}
                                    onChange={(e) => setContactEmail(e.target.value)}
                                    className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                    placeholder="admin@acme.com"
                                />
                            </div>

                            <div className="flex items-center gap-2">
                                <input
                                    type="checkbox"
                                    id="isActive"
                                    checked={isActive}
                                    onChange={(e) => setIsActive(e.target.checked)}
                                    className="w-4 h-4 text-blue-600 rounded focus:ring-2 focus:ring-blue-500"
                                />
                                <label htmlFor="isActive" className="text-sm font-medium text-slate-700">
                                    Organization is active
                                </label>
                            </div>
                        </div>

                        <div className="flex gap-3">
                            <button
                                onClick={() => {
                                    setShowEditModal(false);
                                    setError('');
                                    setSuccess('');
                                }}
                                disabled={saving}
                                className="flex-1 px-4 py-2 border border-slate-300 text-slate-700 rounded-lg font-medium hover:bg-slate-50 transition-colors"
                            >
                                Cancel
                            </button>
                            <button
                                onClick={handleEdit}
                                disabled={saving}
                                className="flex-1 px-4 py-2 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white rounded-lg font-medium transition-colors flex items-center justify-center gap-2"
                            >
                                {saving ? (
                                    <>
                                        <Loader2 className="w-4 h-4 animate-spin" />
                                        Saving...
                                    </>
                                ) : (
                                    <>
                                        <Edit className="w-4 h-4" />
                                        Save Changes
                                    </>
                                )}
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Delete Modal */}
            {showDeleteModal && (
                <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
                    <div className="bg-white rounded-xl shadow-xl max-w-md w-full p-6">
                        <div className="flex items-center justify-between mb-4">
                            <h2 className="text-2xl font-bold text-slate-900">Delete Organization</h2>
                            <button
                                onClick={() => {
                                    setShowDeleteModal(false);
                                    setDeleteConfirmText('');
                                    setError('');
                                }}
                                className="p-1 hover:bg-slate-100 rounded-lg transition-colors"
                            >
                                <X className="w-5 h-5 text-slate-500" />
                            </button>
                        </div>

                        <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-lg">
                            <p className="text-sm text-red-800 font-semibold mb-2">⚠️ Warning: This action cannot be undone!</p>
                            <p className="text-sm text-red-700">
                                This will permanently delete <strong>{organization.name}</strong> and ALL team members.
                            </p>
                        </div>

                        {error && (
                            <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm">
                                {error}
                            </div>
                        )}

                        <div className="mb-6">
                            <label className="block text-sm font-medium text-slate-700 mb-2">
                                Type <strong>DELETE</strong> to confirm
                            </label>
                            <input
                                type="text"
                                value={deleteConfirmText}
                                onChange={(e) => setDeleteConfirmText(e.target.value)}
                                className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent"
                                placeholder="DELETE"
                            />
                        </div>

                        <div className="flex gap-3">
                            <button
                                onClick={() => {
                                    setShowDeleteModal(false);
                                    setDeleteConfirmText('');
                                    setError('');
                                }}
                                disabled={deleting}
                                className="flex-1 px-4 py-2 border border-slate-300 text-slate-700 rounded-lg font-medium hover:bg-slate-50 transition-colors"
                            >
                                Cancel
                            </button>
                            <button
                                onClick={handleDelete}
                                disabled={deleting || deleteConfirmText !== 'DELETE'}
                                className="flex-1 px-4 py-2 bg-red-600 hover:bg-red-700 disabled:bg-red-400 text-white rounded-lg font-medium transition-colors flex items-center justify-center gap-2"
                            >
                                {deleting ? (
                                    <>
                                        <Loader2 className="w-4 h-4 animate-spin" />
                                        Deleting...
                                    </>
                                ) : (
                                    <>
                                        <Trash2 className="w-4 h-4" />
                                        Delete Permanently
                                    </>
                                )}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </>
    );
}
