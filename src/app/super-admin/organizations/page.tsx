'use client';

import { useState, useEffect } from 'react';
import { Building2, Plus, Search, Users, Calendar } from 'lucide-react';
import Link from 'next/link';

interface Organization {
    _id: string;
    name: string;
    slug: string;
    contactEmail: string;
    isActive: boolean;
    createdAt: string;
    labLicenses: any[];
}

export default function OrganizationsPage() {
    const [organizations, setOrganizations] = useState<Organization[]>([]);
    const [loading, setLoading] = useState(true);
    const [showCreateModal, setShowCreateModal] = useState(false);
    const [searchTerm, setSearchTerm] = useState('');

    // Form state
    const [formData, setFormData] = useState({
        name: '',
        adminEmail: '',
        adminName: '',
        adminPassword: ''
    });
    const [creating, setCreating] = useState(false);
    const [error, setError] = useState('');

    useEffect(() => {
        loadOrganizations();
    }, []);

    const loadOrganizations = async () => {
        try {
            const response = await fetch('/api/super-admin/organizations');
            const data = await response.json();
            setOrganizations(data.organizations || []);
        } catch (error) {
            console.error('Failed to load organizations:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleCreateOrganization = async (e: React.FormEvent) => {
        e.preventDefault();
        setCreating(true);
        setError('');

        try {
            const response = await fetch('/api/super-admin/organizations', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(formData)
            });

            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.error || 'Failed to create organization');
            }

            // Success - reload organizations and close modal
            await loadOrganizations();
            setShowCreateModal(false);
            setFormData({ name: '', adminEmail: '', adminName: '', adminPassword: '' });
        } catch (err: any) {
            setError(err.message);
        } finally {
            setCreating(false);
        }
    };

    const filteredOrgs = organizations.filter(org =>
        org.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        org.contactEmail.toLowerCase().includes(searchTerm.toLowerCase())
    );

    return (
        <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100">
            <div className="container mx-auto px-4 py-8">
                {/* Header */}
                <div className="flex items-center justify-between mb-8">
                    <div>
                        <h1 className="text-3xl font-bold text-slate-900 mb-2">Organizations</h1>
                        <p className="text-slate-600">Manage all organizations on the platform</p>
                    </div>
                    <button
                        onClick={() => setShowCreateModal(true)}
                        className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium transition-colors"
                    >
                        <Plus className="w-5 h-5" />
                        Create Organization
                    </button>
                </div>

                {/* Search */}
                <div className="mb-6">
                    <div className="relative">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                        <input
                            type="text"
                            placeholder="Search organizations..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="w-full pl-10 pr-4 py-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        />
                    </div>
                </div>

                {/* Organizations List */}
                <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
                    {loading ? (
                        <div className="p-8 text-center text-slate-500">Loading...</div>
                    ) : filteredOrgs.length === 0 ? (
                        <div className="p-8 text-center text-slate-500">
                            {searchTerm ? 'No organizations found' : 'No organizations yet'}
                        </div>
                    ) : (
                        <div className="divide-y divide-slate-200">
                            {filteredOrgs.map((org) => (
                                <div key={org._id} className="p-6 hover:bg-slate-50 transition-colors">
                                    <div className="flex items-center justify-between">
                                        <div className="flex-1">
                                            <div className="flex items-center gap-3 mb-2">
                                                <div className="p-2 bg-blue-100 rounded-lg">
                                                    <Building2 className="w-5 h-5 text-blue-600" />
                                                </div>
                                                <div>
                                                    <h3 className="text-lg font-semibold text-slate-900">{org.name}</h3>
                                                    <p className="text-sm text-slate-500">{org.contactEmail}</p>
                                                </div>
                                            </div>
                                            <div className="flex items-center gap-4 mt-3 text-sm text-slate-600">
                                                <div className="flex items-center gap-1">
                                                    <Users className="w-4 h-4" />
                                                    <span>{org.labLicenses?.length || 0} licenses</span>
                                                </div>
                                                <div className="flex items-center gap-1">
                                                    <Calendar className="w-4 h-4" />
                                                    <span>Created {new Date(org.createdAt).toLocaleDateString()}</span>
                                                </div>
                                                <span className={`px-2 py-1 rounded-full text-xs font-medium ${org.isActive
                                                    ? 'bg-green-100 text-green-700'
                                                    : 'bg-red-100 text-red-700'
                                                    }`}>
                                                    {org.isActive ? 'Active' : 'Inactive'}
                                                </span>
                                            </div>
                                        </div>
                                        <Link
                                            href={`/super-admin/organizations/${org._id}`}
                                            className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg font-medium transition-colors"
                                        >
                                            View Details
                                        </Link>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>

                {/* Create Organization Modal */}
                {showCreateModal && (
                    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
                        <div className="bg-white rounded-xl shadow-xl max-w-md w-full p-6">
                            <h2 className="text-2xl font-bold text-slate-900 mb-4">Create New Organization</h2>

                            {error && (
                                <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm">
                                    {error}
                                </div>
                            )}

                            <form onSubmit={handleCreateOrganization} className="space-y-4">
                                <div>
                                    <label className="block text-sm font-medium text-slate-700 mb-1">
                                        Organization Name *
                                    </label>
                                    <input
                                        type="text"
                                        required
                                        value={formData.name}
                                        onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                        className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                        placeholder="Acme Corp"
                                    />
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-slate-700 mb-1">
                                        Admin Email *
                                    </label>
                                    <input
                                        type="email"
                                        required
                                        value={formData.adminEmail}
                                        onChange={(e) => setFormData({ ...formData, adminEmail: e.target.value })}
                                        className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                        placeholder="admin@acme.com"
                                    />
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-slate-700 mb-1">
                                        Admin Name
                                    </label>
                                    <input
                                        type="text"
                                        value={formData.adminName}
                                        onChange={(e) => setFormData({ ...formData, adminName: e.target.value })}
                                        className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                        placeholder="John Admin"
                                    />
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-slate-700 mb-1">
                                        Admin Password *
                                    </label>
                                    <input
                                        type="password"
                                        required
                                        value={formData.adminPassword}
                                        onChange={(e) => setFormData({ ...formData, adminPassword: e.target.value })}
                                        className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                        placeholder="Secure password"
                                    />
                                </div>

                                <div className="flex gap-3 pt-4">
                                    <button
                                        type="button"
                                        onClick={() => {
                                            setShowCreateModal(false);
                                            setError('');
                                            setFormData({ name: '', adminEmail: '', adminName: '', adminPassword: '' });
                                        }}
                                        className="flex-1 px-4 py-2 border border-slate-300 text-slate-700 rounded-lg font-medium hover:bg-slate-50 transition-colors"
                                    >
                                        Cancel
                                    </button>
                                    <button
                                        type="submit"
                                        disabled={creating}
                                        className="flex-1 px-4 py-2 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white rounded-lg font-medium transition-colors"
                                    >
                                        {creating ? 'Creating...' : 'Create Organization'}
                                    </button>
                                </div>
                            </form>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}
