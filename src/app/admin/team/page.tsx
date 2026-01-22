'use client';

import { useState, useEffect } from 'react';
import { Users, Plus, Mail, Key, Loader2, UserPlus } from 'lucide-react';
import AssignLabModal from '@/components/admin/AssignLabModal';

interface TeamMember {
    _id: string;
    email: string;
    name: string;
    role: string;
    createdAt: string;
    purchasedLabs?: any[];
}

export default function TeamManagementPage() {
    const [teamMembers, setTeamMembers] = useState<TeamMember[]>([]);
    const [loading, setLoading] = useState(true);
    const [showAddModal, setShowAddModal] = useState(false);
    const [showAssignModal, setShowAssignModal] = useState(false);
    const [selectedMember, setSelectedMember] = useState<TeamMember | null>(null);

    // Form state
    const [formData, setFormData] = useState({
        email: '',
        password: '',
        name: ''
    });
    const [adding, setAdding] = useState(false);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');

    useEffect(() => {
        loadTeamMembers();
    }, []);

    const loadTeamMembers = async () => {
        try {
            const response = await fetch('/api/admin/team');
            const data = await response.json();
            setTeamMembers(data.teamMembers || []);
        } catch (error) {
            console.error('Failed to load team members:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleAddMember = async (e: React.FormEvent) => {
        e.preventDefault();
        setAdding(true);
        setError('');
        setSuccess('');

        try {
            const response = await fetch('/api/admin/team', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(formData)
            });

            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.error || 'Failed to add team member');
            }

            // Success
            setSuccess(`Team member ${formData.email} added successfully!`);
            await loadTeamMembers();
            setFormData({ email: '', password: '', name: '' });

            // Close modal after 2 seconds
            setTimeout(() => {
                setShowAddModal(false);
                setSuccess('');
            }, 2000);
        } catch (err: any) {
            setError(err.message);
        } finally {
            setAdding(false);
        }
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100">
            <div className="container mx-auto px-4 py-8">
                {/* Header */}
                <div className="flex items-center justify-between mb-8">
                    <div>
                        <h1 className="text-3xl font-bold text-slate-900 mb-2">Team Members</h1>
                        <p className="text-slate-600">Manage your organization's team</p>
                    </div>
                    <button
                        onClick={() => setShowAddModal(true)}
                        className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium transition-colors"
                    >
                        <UserPlus className="w-5 h-5" />
                        Add Team Member
                    </button>
                </div>

                {/* Team Members List */}
                <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
                    {loading ? (
                        <div className="p-8 text-center text-slate-500">
                            <Loader2 className="w-8 h-8 animate-spin mx-auto mb-2" />
                            Loading team members...
                        </div>
                    ) : teamMembers.length === 0 ? (
                        <div className="p-8 text-center text-slate-500">
                            <Users className="w-12 h-12 mx-auto mb-3 text-slate-300" />
                            <p>No team members yet</p>
                            <p className="text-sm mt-1">Add your first team member to get started</p>
                        </div>
                    ) : (
                        <div className="divide-y divide-slate-200">
                            {teamMembers.map((member) => (
                                <div key={member._id} className="p-6 hover:bg-slate-50 transition-colors">
                                    <div className="flex items-center justify-between">
                                        <div className="flex-1">
                                            <div className="flex items-center gap-3 mb-2">
                                                <div className="p-2 bg-blue-100 rounded-lg">
                                                    <Users className="w-5 h-5 text-blue-600" />
                                                </div>
                                                <div>
                                                    <h3 className="text-lg font-semibold text-slate-900">{member.name}</h3>
                                                    <p className="text-sm text-slate-500">{member.email}</p>
                                                </div>
                                            </div>
                                            <div className="flex items-center gap-4 mt-3 text-sm text-slate-600">
                                                <span>Assigned Labs: {member.purchasedLabs?.length || 0}</span>
                                                <span>•</span>
                                                <span>Added {new Date(member.createdAt).toLocaleDateString()}</span>
                                            </div>
                                        </div>
                                        <button
                                            onClick={() => {
                                                setSelectedMember(member);
                                                setShowAssignModal(true);
                                            }}
                                            className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium transition-colors"
                                        >
                                            Assign Lab
                                        </button>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>

                {/* Add Team Member Modal */}
                {showAddModal && (
                    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
                        <div className="bg-white rounded-xl shadow-xl max-w-md w-full p-6">
                            <h2 className="text-2xl font-bold text-slate-900 mb-4">Add Team Member</h2>

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

                            <form onSubmit={handleAddMember} className="space-y-4">
                                <div>
                                    <label className="block text-sm font-medium text-slate-700 mb-1">
                                        <div className="flex items-center gap-2">
                                            <Mail className="w-4 h-4" />
                                            Email Address *
                                        </div>
                                    </label>
                                    <input
                                        type="email"
                                        required
                                        value={formData.email}
                                        onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                                        className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                        placeholder="john@company.com"
                                    />
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-slate-700 mb-1">
                                        <div className="flex items-center gap-2">
                                            <Key className="w-4 h-4" />
                                            Password *
                                        </div>
                                    </label>
                                    <input
                                        type="password"
                                        required
                                        value={formData.password}
                                        onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                                        className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                        placeholder="Secure password"
                                    />
                                    <p className="text-xs text-slate-500 mt-1">
                                        User will use this password to log in
                                    </p>
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-slate-700 mb-1">
                                        Name (Optional)
                                    </label>
                                    <input
                                        type="text"
                                        value={formData.name}
                                        onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                        className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                        placeholder="John Doe"
                                    />
                                </div>

                                <div className="flex gap-3 pt-4">
                                    <button
                                        type="button"
                                        onClick={() => {
                                            setShowAddModal(false);
                                            setError('');
                                            setSuccess('');
                                            setFormData({ email: '', password: '', name: '' });
                                        }}
                                        className="flex-1 px-4 py-2 border border-slate-300 text-slate-700 rounded-lg font-medium hover:bg-slate-50 transition-colors"
                                    >
                                        Cancel
                                    </button>
                                    <button
                                        type="submit"
                                        disabled={adding}
                                        className="flex-1 px-4 py-2 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white rounded-lg font-medium transition-colors flex items-center justify-center gap-2"
                                    >
                                        {adding ? (
                                            <>
                                                <Loader2 className="w-4 h-4 animate-spin" />
                                                Adding...
                                            </>
                                        ) : (
                                            'Add Member'
                                        )}
                                    </button>
                                </div>
                            </form>
                        </div>
                    </div>
                )}

                {/* Assign Lab Modal */}
                {showAssignModal && selectedMember && (
                    <AssignLabModal
                        userId={selectedMember._id}
                        userName={selectedMember.name}
                        userEmail={selectedMember.email}
                        onClose={() => {
                            setShowAssignModal(false);
                            setSelectedMember(null);
                        }}
                        onSuccess={() => {
                            loadTeamMembers();
                        }}
                    />
                )}
            </div>
        </div>
    );
}
