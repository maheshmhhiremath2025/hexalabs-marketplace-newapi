'use client';

import { useState, useMemo } from 'react';
import { Search, Key, Building2, Users, Mail, Calendar, Shield, X, Loader2, Trash2, RotateCcw, BookOpen } from 'lucide-react';
import { useRouter } from 'next/navigation';

interface User {
    _id: string;
    name: string;
    email: string;
    role: string;
    organizationId?: string;
    organizationName?: string;
    purchasedLabs?: any[];
    createdAt: string;
}

interface Organization {
    _id: string;
    name: string;
    contactEmail: string;
    isActive: boolean;
    teamMembersCount: number;
    licensesCount: number;
    createdAt: string;
}

interface CourseAssignment {
    userId: string;
    userName: string;
    userEmail: string;
    organizationName?: string;
    courseId: string;
    launchCount: number;
    maxLaunches: number;
    accessExpiresAt?: string;
    isExpired: boolean;
}

export default function SuperAdminManagementPage({
    users,
    organizations
}: {
    users: User[],
    organizations: Organization[]
}) {
    const router = useRouter();
    const [activeTab, setActiveTab] = useState<'users' | 'admins' | 'organizations' | 'courses'>('users');
    const [searchQuery, setSearchQuery] = useState('');

    // Modals
    const [resetPasswordModal, setResetPasswordModal] = useState<{ show: boolean, user: User | null }>({ show: false, user: null });
    const [deleteModal, setDeleteModal] = useState<{ show: boolean, type: 'user' | 'admin' | 'org' | null, item: any }>({ show: false, type: null, item: null });
    const [resetLaunchModal, setResetLaunchModal] = useState<{ show: boolean, assignment: CourseAssignment | null }>({ show: false, assignment: null });

    // Form states
    const [newPassword, setNewPassword] = useState('');
    const [newLaunchCount, setNewLaunchCount] = useState('0');
    const [newMaxLaunches, setNewMaxLaunches] = useState('');
    const [deleteConfirmText, setDeleteConfirmText] = useState('');

    // Loading states
    const [resetting, setResetting] = useState(false);
    const [deleting, setDeleting] = useState(false);
    const [resetSuccess, setResetSuccess] = useState('');
    const [resetError, setResetError] = useState('');

    // Filter users by role
    const regularUsers = users.filter(u => u.role === 'user');
    const admins = users.filter(u => u.role === 'org_admin' || u.role === 'super_admin');

    // Get all course assignments
    const courseAssignments = useMemo(() => {
        const assignments: CourseAssignment[] = [];
        users.forEach(user => {
            user.purchasedLabs?.forEach((lab: any) => {
                const isExpired = lab.accessExpiresAt ? new Date(lab.accessExpiresAt) < new Date() : false;
                assignments.push({
                    userId: user._id,
                    userName: user.name,
                    userEmail: user.email,
                    organizationName: user.organizationName,
                    courseId: lab.courseId,
                    launchCount: lab.launchCount || 0,
                    maxLaunches: lab.maxLaunches || 10,
                    accessExpiresAt: lab.accessExpiresAt,
                    isExpired,
                });
            });
        });
        return assignments;
    }, [users]);

    // Search filters
    const filteredUsers = useMemo(() => {
        const query = searchQuery.toLowerCase();
        return regularUsers.filter(u =>
            u.name.toLowerCase().includes(query) ||
            u.email.toLowerCase().includes(query) ||
            u.organizationName?.toLowerCase().includes(query)
        );
    }, [regularUsers, searchQuery]);

    const filteredAdmins = useMemo(() => {
        const query = searchQuery.toLowerCase();
        return admins.filter(u =>
            u.name.toLowerCase().includes(query) ||
            u.email.toLowerCase().includes(query) ||
            u.organizationName?.toLowerCase().includes(query)
        );
    }, [admins, searchQuery]);

    const filteredOrganizations = useMemo(() => {
        const query = searchQuery.toLowerCase();
        return organizations.filter(o =>
            o.name.toLowerCase().includes(query) ||
            o.contactEmail.toLowerCase().includes(query)
        );
    }, [organizations, searchQuery]);

    const filteredCourses = useMemo(() => {
        const query = searchQuery.toLowerCase();
        return courseAssignments.filter(c =>
            c.userName.toLowerCase().includes(query) ||
            c.userEmail.toLowerCase().includes(query) ||
            c.courseId.toLowerCase().includes(query) ||
            c.organizationName?.toLowerCase().includes(query)
        );
    }, [courseAssignments, searchQuery]);

    const handleResetPassword = async () => {
        if (!resetPasswordModal.user || !newPassword) {
            setResetError('Please enter a new password');
            return;
        }

        setResetting(true);
        setResetError('');
        setResetSuccess('');

        try {
            const response = await fetch('/api/super-admin/reset-password', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    userId: resetPasswordModal.user._id,
                    newPassword
                })
            });

            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.error || 'Failed to reset password');
            }

            setResetSuccess('Password reset successfully!');
            setTimeout(() => {
                setResetPasswordModal({ show: false, user: null });
                setNewPassword('');
                setResetSuccess('');
            }, 2000);
        } catch (err: any) {
            setResetError(err.message);
        } finally {
            setResetting(false);
        }
    };

    const handleDelete = async () => {
        if (!deleteModal.item || deleteConfirmText !== 'DELETE') {
            setResetError('Please type DELETE to confirm');
            return;
        }

        setDeleting(true);
        setResetError('');

        try {
            let endpoint = '';
            if (deleteModal.type === 'user' || deleteModal.type === 'admin') {
                endpoint = `/api/super-admin/users/${deleteModal.item._id}`;
            } else if (deleteModal.type === 'org') {
                endpoint = `/api/super-admin/organizations/${deleteModal.item._id}`;
            }

            const response = await fetch(endpoint, { method: 'DELETE' });
            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.error || 'Failed to delete');
            }

            setDeleteModal({ show: false, type: null, item: null });
            setDeleteConfirmText('');
            router.refresh();
        } catch (err: any) {
            setResetError(err.message);
        } finally {
            setDeleting(false);
        }
    };

    const handleResetLaunches = async () => {
        if (!resetLaunchModal.assignment) return;

        setResetting(true);
        setResetError('');
        setResetSuccess('');

        try {
            const response = await fetch('/api/super-admin/reset-launches', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    userId: resetLaunchModal.assignment.userId,
                    courseId: resetLaunchModal.assignment.courseId,
                    newLaunchCount: parseInt(newLaunchCount) || 0,
                    newMaxLaunches: newMaxLaunches ? parseInt(newMaxLaunches) : undefined,
                })
            });

            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.error || 'Failed to reset launches');
            }

            setResetSuccess('Launches reset successfully!');
            setTimeout(() => {
                setResetLaunchModal({ show: false, assignment: null });
                setNewLaunchCount('0');
                setNewMaxLaunches('');
                setResetSuccess('');
                router.refresh();
            }, 2000);
        } catch (err: any) {
            setResetError(err.message);
        } finally {
            setResetting(false);
        }
    };

    return (
        <div className="space-y-6">
            {/* Search Bar */}
            <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-4">
                <div className="relative">
                    <input
                        type="text"
                        placeholder="Search by name, email, course, or organization..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="w-full pl-10 pr-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                    <Search className="absolute left-3 top-2.5 h-5 w-5 text-slate-400" />
                </div>
            </div>

            {/* Tabs */}
            <div className="bg-white rounded-xl shadow-sm border border-slate-200">
                <div className="border-b border-slate-200">
                    <div className="flex">
                        <button
                            onClick={() => setActiveTab('users')}
                            className={`flex-1 px-6 py-4 font-medium transition-colors ${activeTab === 'users'
                                    ? 'text-blue-600 border-b-2 border-blue-600'
                                    : 'text-slate-600 hover:text-slate-900'
                                }`}
                        >
                            <div className="flex items-center justify-center gap-2">
                                <Users className="w-5 h-5" />
                                Users ({filteredUsers.length})
                            </div>
                        </button>
                        <button
                            onClick={() => setActiveTab('admins')}
                            className={`flex-1 px-6 py-4 font-medium transition-colors ${activeTab === 'admins'
                                    ? 'text-green-600 border-b-2 border-green-600'
                                    : 'text-slate-600 hover:text-slate-900'
                                }`}
                        >
                            <div className="flex items-center justify-center gap-2">
                                <Shield className="w-5 h-5" />
                                Admins ({filteredAdmins.length})
                            </div>
                        </button>
                        <button
                            onClick={() => setActiveTab('organizations')}
                            className={`flex-1 px-6 py-4 font-medium transition-colors ${activeTab === 'organizations'
                                    ? 'text-purple-600 border-b-2 border-purple-600'
                                    : 'text-slate-600 hover:text-slate-900'
                                }`}
                        >
                            <div className="flex items-center justify-center gap-2">
                                <Building2 className="w-5 h-5" />
                                Organizations ({filteredOrganizations.length})
                            </div>
                        </button>
                        <button
                            onClick={() => setActiveTab('courses')}
                            className={`flex-1 px-6 py-4 font-medium transition-colors ${activeTab === 'courses'
                                    ? 'text-orange-600 border-b-2 border-orange-600'
                                    : 'text-slate-600 hover:text-slate-900'
                                }`}
                        >
                            <div className="flex items-center justify-center gap-2">
                                <BookOpen className="w-5 h-5" />
                                Courses ({filteredCourses.length})
                            </div>
                        </button>
                    </div>
                </div>

                <div className="p-6">
                    {/* Users Table */}
                    {activeTab === 'users' && (
                        <div className="overflow-x-auto">
                            <table className="w-full">
                                <thead>
                                    <tr className="border-b border-slate-200">
                                        <th className="text-left py-3 px-4 font-semibold text-slate-700">Name</th>
                                        <th className="text-left py-3 px-4 font-semibold text-slate-700">Email</th>
                                        <th className="text-left py-3 px-4 font-semibold text-slate-700">Organization</th>
                                        <th className="text-left py-3 px-4 font-semibold text-slate-700">Labs</th>
                                        <th className="text-left py-3 px-4 font-semibold text-slate-700">Joined</th>
                                        <th className="text-left py-3 px-4 font-semibold text-slate-700">Actions</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {filteredUsers.length === 0 ? (
                                        <tr>
                                            <td colSpan={6} className="text-center py-8 text-slate-500">
                                                No users found
                                            </td>
                                        </tr>
                                    ) : (
                                        filteredUsers.map((user) => (
                                            <tr key={user._id} className="border-b border-slate-100 hover:bg-slate-50">
                                                <td className="py-3 px-4">
                                                    <div className="font-medium text-slate-900">{user.name}</div>
                                                </td>
                                                <td className="py-3 px-4">
                                                    <div className="text-sm text-slate-600">{user.email}</div>
                                                </td>
                                                <td className="py-3 px-4">
                                                    <div className="text-sm text-slate-600">
                                                        {user.organizationName || 'Individual'}
                                                    </div>
                                                </td>
                                                <td className="py-3 px-4">
                                                    <span className="px-2 py-1 bg-blue-100 text-blue-700 rounded text-sm">
                                                        {user.purchasedLabs?.length || 0}
                                                    </span>
                                                </td>
                                                <td className="py-3 px-4">
                                                    <div className="text-sm text-slate-600">
                                                        {new Date(user.createdAt).toLocaleDateString()}
                                                    </div>
                                                </td>
                                                <td className="py-3 px-4">
                                                    <div className="flex gap-2">
                                                        <button
                                                            onClick={() => setResetPasswordModal({ show: true, user })}
                                                            className="flex items-center gap-1 px-3 py-1 text-sm bg-orange-100 text-orange-700 hover:bg-orange-200 rounded transition-colors"
                                                        >
                                                            <Key className="w-3 h-3" />
                                                            Reset
                                                        </button>
                                                        <button
                                                            onClick={() => setDeleteModal({ show: true, type: 'user', item: user })}
                                                            className="flex items-center gap-1 px-3 py-1 text-sm bg-red-100 text-red-700 hover:bg-red-200 rounded transition-colors"
                                                        >
                                                            <Trash2 className="w-3 h-3" />
                                                            Delete
                                                        </button>
                                                    </div>
                                                </td>
                                            </tr>
                                        ))
                                    )}
                                </tbody>
                            </table>
                        </div>
                    )}

                    {/* Admins Table */}
                    {activeTab === 'admins' && (
                        <div className="overflow-x-auto">
                            <table className="w-full">
                                <thead>
                                    <tr className="border-b border-slate-200">
                                        <th className="text-left py-3 px-4 font-semibold text-slate-700">Name</th>
                                        <th className="text-left py-3 px-4 font-semibold text-slate-700">Email</th>
                                        <th className="text-left py-3 px-4 font-semibold text-slate-700">Role</th>
                                        <th className="text-left py-3 px-4 font-semibold text-slate-700">Organization</th>
                                        <th className="text-left py-3 px-4 font-semibold text-slate-700">Joined</th>
                                        <th className="text-left py-3 px-4 font-semibold text-slate-700">Actions</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {filteredAdmins.length === 0 ? (
                                        <tr>
                                            <td colSpan={6} className="text-center py-8 text-slate-500">
                                                No admins found
                                            </td>
                                        </tr>
                                    ) : (
                                        filteredAdmins.map((user) => (
                                            <tr key={user._id} className="border-b border-slate-100 hover:bg-slate-50">
                                                <td className="py-3 px-4">
                                                    <div className="font-medium text-slate-900">{user.name}</div>
                                                </td>
                                                <td className="py-3 px-4">
                                                    <div className="text-sm text-slate-600">{user.email}</div>
                                                </td>
                                                <td className="py-3 px-4">
                                                    <span className={`px-2 py-1 rounded text-xs font-medium ${user.role === 'super_admin'
                                                            ? 'bg-purple-100 text-purple-700'
                                                            : 'bg-green-100 text-green-700'
                                                        }`}>
                                                        {user.role === 'super_admin' ? 'Super Admin' : 'Org Admin'}
                                                    </span>
                                                </td>
                                                <td className="py-3 px-4">
                                                    <div className="text-sm text-slate-600">
                                                        {user.organizationName || 'N/A'}
                                                    </div>
                                                </td>
                                                <td className="py-3 px-4">
                                                    <div className="text-sm text-slate-600">
                                                        {new Date(user.createdAt).toLocaleDateString()}
                                                    </div>
                                                </td>
                                                <td className="py-3 px-4">
                                                    <div className="flex gap-2">
                                                        <button
                                                            onClick={() => setResetPasswordModal({ show: true, user })}
                                                            className="flex items-center gap-1 px-3 py-1 text-sm bg-orange-100 text-orange-700 hover:bg-orange-200 rounded transition-colors"
                                                        >
                                                            <Key className="w-3 h-3" />
                                                            Reset
                                                        </button>
                                                        {user.role !== 'super_admin' && (
                                                            <button
                                                                onClick={() => setDeleteModal({ show: true, type: 'admin', item: user })}
                                                                className="flex items-center gap-1 px-3 py-1 text-sm bg-red-100 text-red-700 hover:bg-red-200 rounded transition-colors"
                                                            >
                                                                <Trash2 className="w-3 h-3" />
                                                                Delete
                                                            </button>
                                                        )}
                                                    </div>
                                                </td>
                                            </tr>
                                        ))
                                    )}
                                </tbody>
                            </table>
                        </div>
                    )}

                    {/* Organizations Table */}
                    {activeTab === 'organizations' && (
                        <div className="overflow-x-auto">
                            <table className="w-full">
                                <thead>
                                    <tr className="border-b border-slate-200">
                                        <th className="text-left py-3 px-4 font-semibold text-slate-700">Name</th>
                                        <th className="text-left py-3 px-4 font-semibold text-slate-700">Contact Email</th>
                                        <th className="text-left py-3 px-4 font-semibold text-slate-700">Team Members</th>
                                        <th className="text-left py-3 px-4 font-semibold text-slate-700">Licenses</th>
                                        <th className="text-left py-3 px-4 font-semibold text-slate-700">Status</th>
                                        <th className="text-left py-3 px-4 font-semibold text-slate-700">Created</th>
                                        <th className="text-left py-3 px-4 font-semibold text-slate-700">Actions</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {filteredOrganizations.length === 0 ? (
                                        <tr>
                                            <td colSpan={7} className="text-center py-8 text-slate-500">
                                                No organizations found
                                            </td>
                                        </tr>
                                    ) : (
                                        filteredOrganizations.map((org) => (
                                            <tr key={org._id} className="border-b border-slate-100 hover:bg-slate-50">
                                                <td className="py-3 px-4">
                                                    <div className="font-medium text-slate-900">{org.name}</div>
                                                </td>
                                                <td className="py-3 px-4">
                                                    <div className="text-sm text-slate-600">{org.contactEmail}</div>
                                                </td>
                                                <td className="py-3 px-4">
                                                    <span className="px-2 py-1 bg-blue-100 text-blue-700 rounded text-sm">
                                                        {org.teamMembersCount}
                                                    </span>
                                                </td>
                                                <td className="py-3 px-4">
                                                    <span className="px-2 py-1 bg-green-100 text-green-700 rounded text-sm">
                                                        {org.licensesCount}
                                                    </span>
                                                </td>
                                                <td className="py-3 px-4">
                                                    <span className={`px-2 py-1 rounded text-xs font-medium ${org.isActive
                                                            ? 'bg-green-100 text-green-700'
                                                            : 'bg-red-100 text-red-700'
                                                        }`}>
                                                        {org.isActive ? 'Active' : 'Inactive'}
                                                    </span>
                                                </td>
                                                <td className="py-3 px-4">
                                                    <div className="text-sm text-slate-600">
                                                        {new Date(org.createdAt).toLocaleDateString()}
                                                    </div>
                                                </td>
                                                <td className="py-3 px-4">
                                                    <button
                                                        onClick={() => setDeleteModal({ show: true, type: 'org', item: org })}
                                                        className="flex items-center gap-1 px-3 py-1 text-sm bg-red-100 text-red-700 hover:bg-red-200 rounded transition-colors"
                                                    >
                                                        <Trash2 className="w-3 h-3" />
                                                        Delete
                                                    </button>
                                                </td>
                                            </tr>
                                        ))
                                    )}
                                </tbody>
                            </table>
                        </div>
                    )}

                    {/* Courses Table */}
                    {activeTab === 'courses' && (
                        <div className="overflow-x-auto">
                            <table className="w-full">
                                <thead>
                                    <tr className="border-b border-slate-200">
                                        <th className="text-left py-3 px-4 font-semibold text-slate-700">User</th>
                                        <th className="text-left py-3 px-4 font-semibold text-slate-700">Organization</th>
                                        <th className="text-left py-3 px-4 font-semibold text-slate-700">Course</th>
                                        <th className="text-left py-3 px-4 font-semibold text-slate-700">Launches</th>
                                        <th className="text-left py-3 px-4 font-semibold text-slate-700">Expiry</th>
                                        <th className="text-left py-3 px-4 font-semibold text-slate-700">Status</th>
                                        <th className="text-left py-3 px-4 font-semibold text-slate-700">Actions</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {filteredCourses.length === 0 ? (
                                        <tr>
                                            <td colSpan={7} className="text-center py-8 text-slate-500">
                                                No course assignments found
                                            </td>
                                        </tr>
                                    ) : (
                                        filteredCourses.map((assignment, idx) => (
                                            <tr key={idx} className="border-b border-slate-100 hover:bg-slate-50">
                                                <td className="py-3 px-4">
                                                    <div className="font-medium text-slate-900">{assignment.userName}</div>
                                                    <div className="text-xs text-slate-500">{assignment.userEmail}</div>
                                                </td>
                                                <td className="py-3 px-4">
                                                    <div className="text-sm text-slate-600">
                                                        {assignment.organizationName || 'Individual'}
                                                    </div>
                                                </td>
                                                <td className="py-3 px-4">
                                                    <span className="px-2 py-1 bg-blue-100 text-blue-700 rounded text-sm font-mono">
                                                        {assignment.courseId.toUpperCase()}
                                                    </span>
                                                </td>
                                                <td className="py-3 px-4">
                                                    <div className="text-sm text-slate-900">
                                                        {assignment.launchCount}/{assignment.maxLaunches}
                                                    </div>
                                                </td>
                                                <td className="py-3 px-4">
                                                    <div className="text-sm text-slate-600">
                                                        {assignment.accessExpiresAt
                                                            ? new Date(assignment.accessExpiresAt).toLocaleDateString()
                                                            : 'N/A'}
                                                    </div>
                                                </td>
                                                <td className="py-3 px-4">
                                                    <span className={`px-2 py-1 rounded text-xs font-medium ${assignment.isExpired
                                                            ? 'bg-red-100 text-red-700'
                                                            : 'bg-green-100 text-green-700'
                                                        }`}>
                                                        {assignment.isExpired ? 'Expired' : 'Active'}
                                                    </span>
                                                </td>
                                                <td className="py-3 px-4">
                                                    <button
                                                        onClick={() => {
                                                            setResetLaunchModal({ show: true, assignment });
                                                            setNewLaunchCount('0');
                                                            setNewMaxLaunches(assignment.maxLaunches.toString());
                                                        }}
                                                        className="flex items-center gap-1 px-3 py-1 text-sm bg-orange-100 text-orange-700 hover:bg-orange-200 rounded transition-colors"
                                                    >
                                                        <RotateCcw className="w-3 h-3" />
                                                        Reset
                                                    </button>
                                                </td>
                                            </tr>
                                        ))
                                    )}
                                </tbody>
                            </table>
                        </div>
                    )}
                </div>
            </div>

            {/* Reset Password Modal */}
            {resetPasswordModal.show && resetPasswordModal.user && (
                <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
                    <div className="bg-white rounded-xl shadow-xl max-w-md w-full p-6">
                        <div className="flex items-center justify-between mb-4">
                            <h2 className="text-2xl font-bold text-slate-900">Reset Password</h2>
                            <button
                                onClick={() => {
                                    setResetPasswordModal({ show: false, user: null });
                                    setNewPassword('');
                                    setResetError('');
                                    setResetSuccess('');
                                }}
                                className="p-1 hover:bg-slate-100 rounded-lg transition-colors"
                            >
                                <X className="w-5 h-5 text-slate-500" />
                            </button>
                        </div>

                        <div className="mb-4 p-3 bg-blue-50 rounded-lg">
                            <p className="text-sm text-slate-700">
                                <strong>User:</strong> {resetPasswordModal.user.name}
                            </p>
                            <p className="text-sm text-slate-600">{resetPasswordModal.user.email}</p>
                        </div>

                        {resetError && (
                            <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm">
                                {resetError}
                            </div>
                        )}

                        {resetSuccess && (
                            <div className="mb-4 p-3 bg-green-50 border border-green-200 rounded-lg text-green-700 text-sm">
                                ✓ {resetSuccess}
                            </div>
                        )}

                        <div className="mb-6">
                            <label className="block text-sm font-medium text-slate-700 mb-2">
                                New Password
                            </label>
                            <input
                                type="password"
                                value={newPassword}
                                onChange={(e) => setNewPassword(e.target.value)}
                                className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                placeholder="Enter new password"
                            />
                        </div>

                        <div className="flex gap-3">
                            <button
                                onClick={() => {
                                    setResetPasswordModal({ show: false, user: null });
                                    setNewPassword('');
                                    setResetError('');
                                    setResetSuccess('');
                                }}
                                disabled={resetting}
                                className="flex-1 px-4 py-2 border border-slate-300 text-slate-700 rounded-lg font-medium hover:bg-slate-50 transition-colors"
                            >
                                Cancel
                            </button>
                            <button
                                onClick={handleResetPassword}
                                disabled={resetting || !newPassword}
                                className="flex-1 px-4 py-2 bg-orange-600 hover:bg-orange-700 disabled:bg-orange-400 text-white rounded-lg font-medium transition-colors flex items-center justify-center gap-2"
                            >
                                {resetting ? (
                                    <>
                                        <Loader2 className="w-4 h-4 animate-spin" />
                                        Resetting...
                                    </>
                                ) : (
                                    <>
                                        <Key className="w-4 h-4" />
                                        Reset Password
                                    </>
                                )}
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Delete Confirmation Modal */}
            {deleteModal.show && deleteModal.item && (
                <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
                    <div className="bg-white rounded-xl shadow-xl max-w-md w-full p-6">
                        <div className="flex items-center justify-between mb-4">
                            <h2 className="text-2xl font-bold text-slate-900">Confirm Delete</h2>
                            <button
                                onClick={() => {
                                    setDeleteModal({ show: false, type: null, item: null });
                                    setDeleteConfirmText('');
                                    setResetError('');
                                }}
                                className="p-1 hover:bg-slate-100 rounded-lg transition-colors"
                            >
                                <X className="w-5 h-5 text-slate-500" />
                            </button>
                        </div>

                        <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-lg">
                            <p className="text-sm text-red-800 font-semibold mb-2">⚠️ Warning: This action cannot be undone!</p>
                            {deleteModal.type === 'org' && (
                                <p className="text-sm text-red-700">
                                    This will delete the organization and ALL {deleteModal.item.teamMembersCount} team members.
                                </p>
                            )}
                            {(deleteModal.type === 'user' || deleteModal.type === 'admin') && (
                                <p className="text-sm text-red-700">
                                    This will permanently delete {deleteModal.item.name} ({deleteModal.item.email}) and all their data.
                                </p>
                            )}
                        </div>

                        {resetError && (
                            <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm">
                                {resetError}
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
                                    setDeleteModal({ show: false, type: null, item: null });
                                    setDeleteConfirmText('');
                                    setResetError('');
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

            {/* Reset Launches Modal */}
            {resetLaunchModal.show && resetLaunchModal.assignment && (
                <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
                    <div className="bg-white rounded-xl shadow-xl max-w-md w-full p-6">
                        <div className="flex items-center justify-between mb-4">
                            <h2 className="text-2xl font-bold text-slate-900">Reset Launches</h2>
                            <button
                                onClick={() => {
                                    setResetLaunchModal({ show: false, assignment: null });
                                    setNewLaunchCount('0');
                                    setNewMaxLaunches('');
                                    setResetError('');
                                    setResetSuccess('');
                                }}
                                className="p-1 hover:bg-slate-100 rounded-lg transition-colors"
                            >
                                <X className="w-5 h-5 text-slate-500" />
                            </button>
                        </div>

                        <div className="mb-4 p-3 bg-blue-50 rounded-lg">
                            <p className="text-sm text-slate-700">
                                <strong>User:</strong> {resetLaunchModal.assignment.userName}
                            </p>
                            <p className="text-sm text-slate-600">{resetLaunchModal.assignment.userEmail}</p>
                            <p className="text-sm text-slate-700 mt-1">
                                <strong>Course:</strong> {resetLaunchModal.assignment.courseId.toUpperCase()}
                            </p>
                            <p className="text-sm text-slate-600">
                                Current: {resetLaunchModal.assignment.launchCount}/{resetLaunchModal.assignment.maxLaunches} launches
                            </p>
                        </div>

                        {resetError && (
                            <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm">
                                {resetError}
                            </div>
                        )}

                        {resetSuccess && (
                            <div className="mb-4 p-3 bg-green-50 border border-green-200 rounded-lg text-green-700 text-sm">
                                ✓ {resetSuccess}
                            </div>
                        )}

                        <div className="space-y-4 mb-6">
                            <div>
                                <label className="block text-sm font-medium text-slate-700 mb-2">
                                    New Launch Count
                                </label>
                                <input
                                    type="number"
                                    min="0"
                                    value={newLaunchCount}
                                    onChange={(e) => setNewLaunchCount(e.target.value)}
                                    className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-slate-700 mb-2">
                                    Max Launches (optional)
                                </label>
                                <input
                                    type="number"
                                    min="1"
                                    value={newMaxLaunches}
                                    onChange={(e) => setNewMaxLaunches(e.target.value)}
                                    className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                    placeholder="Leave empty to keep current"
                                />
                            </div>
                        </div>

                        <div className="flex gap-3">
                            <button
                                onClick={() => {
                                    setResetLaunchModal({ show: false, assignment: null });
                                    setNewLaunchCount('0');
                                    setNewMaxLaunches('');
                                    setResetError('');
                                    setResetSuccess('');
                                }}
                                disabled={resetting}
                                className="flex-1 px-4 py-2 border border-slate-300 text-slate-700 rounded-lg font-medium hover:bg-slate-50 transition-colors"
                            >
                                Cancel
                            </button>
                            <button
                                onClick={handleResetLaunches}
                                disabled={resetting}
                                className="flex-1 px-4 py-2 bg-orange-600 hover:bg-orange-700 disabled:bg-orange-400 text-white rounded-lg font-medium transition-colors flex items-center justify-center gap-2"
                            >
                                {resetting ? (
                                    <>
                                        <Loader2 className="w-4 h-4 animate-spin" />
                                        Resetting...
                                    </>
                                ) : (
                                    <>
                                        <RotateCcw className="w-4 h-4" />
                                        Reset Launches
                                    </>
                                )}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
