'use client';

import { useState, useEffect } from 'react';
import { BookOpen, X, Loader2 } from 'lucide-react';

interface AssignLabModalProps {
    userId: string;
    userName: string;
    userEmail: string;
    onClose: () => void;
    onSuccess: () => void;
}

interface License {
    courseId: string;
    totalLicenses: number;
    usedLicenses: number;
    expiresAt: string;
}

export default function AssignLabModal({ userId, userName, userEmail, onClose, onSuccess }: AssignLabModalProps) {
    const [licenses, setLicenses] = useState<License[]>([]);
    const [selectedCourse, setSelectedCourse] = useState('');
    const [loading, setLoading] = useState(true);
    const [assigning, setAssigning] = useState(false);
    const [error, setError] = useState('');

    useEffect(() => {
        loadLicenses();
    }, []);

    const loadLicenses = async () => {
        try {
            const response = await fetch('/api/admin/licenses');
            const data = await response.json();
            setLicenses(data.licenses || []);
        } catch (error) {
            console.error('Failed to load licenses:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleAssign = async () => {
        if (!selectedCourse) {
            setError('Please select a lab');
            return;
        }

        setAssigning(true);
        setError('');

        try {
            const response = await fetch('/api/admin/assign-lab', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    userId,
                    courseId: selectedCourse
                })
            });

            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.error || 'Failed to assign lab');
            }

            // Success
            onSuccess();
            onClose();
        } catch (err: any) {
            setError(err.message);
        } finally {
            setAssigning(false);
        }
    };

    const availableLicenses = licenses.filter(l => l.usedLicenses < l.totalLicenses);

    return (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-xl shadow-xl max-w-md w-full p-6">
                <div className="flex items-center justify-between mb-4">
                    <h2 className="text-2xl font-bold text-slate-900">Assign Lab</h2>
                    <button
                        onClick={onClose}
                        className="p-1 hover:bg-slate-100 rounded-lg transition-colors"
                    >
                        <X className="w-5 h-5 text-slate-500" />
                    </button>
                </div>

                <div className="mb-4 p-3 bg-blue-50 rounded-lg">
                    <p className="text-sm text-slate-700">
                        <span className="font-medium">Assigning to:</span> {userName || userEmail}
                    </p>
                    <p className="text-xs text-slate-500 mt-1">{userEmail}</p>
                </div>

                {error && (
                    <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm">
                        {error}
                    </div>
                )}

                {loading ? (
                    <div className="py-8 text-center text-slate-500">
                        <Loader2 className="w-8 h-8 animate-spin mx-auto mb-2" />
                        Loading available licenses...
                    </div>
                ) : availableLicenses.length === 0 ? (
                    <div className="py-8 text-center text-slate-500">
                        <BookOpen className="w-12 h-12 mx-auto mb-3 text-slate-300" />
                        <p>No available licenses</p>
                        <p className="text-sm mt-1">Purchase more licenses to assign labs</p>
                    </div>
                ) : (
                    <>
                        <div className="mb-6">
                            <label className="block text-sm font-medium text-slate-700 mb-2">
                                Select Lab to Assign
                            </label>
                            <div className="space-y-2">
                                {availableLicenses.map((license) => (
                                    <label
                                        key={license.courseId}
                                        className={`flex items-center justify-between p-3 border-2 rounded-lg cursor-pointer transition-all ${selectedCourse === license.courseId
                                                ? 'border-blue-500 bg-blue-50'
                                                : 'border-slate-200 hover:border-slate-300'
                                            }`}
                                    >
                                        <div className="flex items-center gap-3">
                                            <input
                                                type="radio"
                                                name="course"
                                                value={license.courseId}
                                                checked={selectedCourse === license.courseId}
                                                onChange={(e) => setSelectedCourse(e.target.value)}
                                                className="w-4 h-4 text-blue-600"
                                            />
                                            <div>
                                                <p className="font-medium text-slate-900">
                                                    {license.courseId.toUpperCase()}
                                                </p>
                                                <p className="text-xs text-slate-500">
                                                    {license.totalLicenses - license.usedLicenses} available
                                                </p>
                                            </div>
                                        </div>
                                        <div className="text-right">
                                            <p className="text-sm text-slate-600">
                                                {license.usedLicenses}/{license.totalLicenses} used
                                            </p>
                                            <p className="text-xs text-slate-500">
                                                Expires {new Date(license.expiresAt).toLocaleDateString()}
                                            </p>
                                        </div>
                                    </label>
                                ))}
                            </div>
                        </div>

                        <div className="flex gap-3">
                            <button
                                onClick={onClose}
                                className="flex-1 px-4 py-2 border border-slate-300 text-slate-700 rounded-lg font-medium hover:bg-slate-50 transition-colors"
                            >
                                Cancel
                            </button>
                            <button
                                onClick={handleAssign}
                                disabled={assigning || !selectedCourse}
                                className="flex-1 px-4 py-2 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white rounded-lg font-medium transition-colors flex items-center justify-center gap-2"
                            >
                                {assigning ? (
                                    <>
                                        <Loader2 className="w-4 h-4 animate-spin" />
                                        Assigning...
                                    </>
                                ) : (
                                    'Assign Lab'
                                )}
                            </button>
                        </div>
                    </>
                )}
            </div>
        </div>
    );
}
