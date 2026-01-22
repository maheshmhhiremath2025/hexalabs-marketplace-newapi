'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Upload, Download, CheckCircle, XCircle, AlertCircle } from 'lucide-react';
import { generateCSVTemplate } from '@/lib/csv-parser';

export default function SuperAdminBulkImportPage() {
    const router = useRouter();
    const [file, setFile] = useState<File | null>(null);
    const [organizationId, setOrganizationId] = useState('');
    const [uploading, setUploading] = useState(false);
    const [results, setResults] = useState<any>(null);

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files[0]) {
            setFile(e.target.files[0]);
            setResults(null);
        }
    };

    const handleDownloadTemplate = () => {
        const template = generateCSVTemplate();
        const blob = new Blob([template], { type: 'text/csv' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = 'user_import_template.csv';
        a.click();
        URL.revokeObjectURL(url);
    };

    const handleUpload = async () => {
        if (!file) return;

        setUploading(true);
        const formData = new FormData();
        formData.append('file', file);
        if (organizationId) {
            formData.append('organizationId', organizationId);
        }

        try {
            const response = await fetch('/api/admin/bulk-import', {
                method: 'POST',
                body: formData,
            });

            const data = await response.json();
            setResults(data);
        } catch (error) {
            console.error('Upload error:', error);
            alert('Failed to upload file');
        } finally {
            setUploading(false);
        }
    };

    return (
        <div className="flex-1 bg-gray-50">
            <div className="bg-white border-b border-gray-200 py-4">
                <div className="container">
                    <h1 className="text-2xl font-bold">Bulk Import Users (Super Admin)</h1>
                    <p className="text-gray-600 mt-1">Upload a CSV file to import multiple users to any organization</p>
                </div>
            </div>

            <div className="container py-12">
                <div className="max-w-3xl mx-auto">
                    {/* Upload Section */}
                    {!results && (
                        <div className="bg-white rounded-lg shadow-lg p-8">
                            <div className="mb-6">
                                <button
                                    onClick={handleDownloadTemplate}
                                    className="inline-flex items-center gap-2 text-blue-600 hover:text-blue-700"
                                >
                                    <Download className="h-4 w-4" />
                                    Download CSV Template
                                </button>
                            </div>

                            {/* Organization ID Input */}
                            <div className="mb-6">
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Organization ID (Optional)
                                </label>
                                <input
                                    type="text"
                                    value={organizationId}
                                    onChange={(e) => setOrganizationId(e.target.value)}
                                    placeholder="Leave empty for individual users"
                                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                />
                                <p className="text-sm text-gray-500 mt-1">
                                    Enter organization ID to assign users to an organization
                                </p>
                            </div>

                            <div className="border-2 border-dashed border-gray-300 rounded-lg p-12 text-center">
                                <Upload className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                                <label className="cursor-pointer">
                                    <span className="text-blue-600 hover:text-blue-700 font-medium">
                                        Choose a CSV file
                                    </span>
                                    <input
                                        type="file"
                                        accept=".csv"
                                        onChange={handleFileChange}
                                        className="hidden"
                                    />
                                </label>
                                {file && (
                                    <p className="mt-4 text-gray-600">
                                        Selected: <strong>{file.name}</strong>
                                    </p>
                                )}
                            </div>

                            {file && (
                                <div className="mt-6">
                                    <button
                                        onClick={handleUpload}
                                        disabled={uploading}
                                        className="w-full bg-blue-600 text-white px-6 py-3 rounded-lg font-semibold hover:bg-blue-700 transition-colors disabled:opacity-50"
                                    >
                                        {uploading ? 'Importing...' : 'Import Users'}
                                    </button>
                                </div>
                            )}
                        </div>
                    )}

                    {/* Results Section - Same as admin page */}
                    {results && (
                        <div className="space-y-6">
                            <div className="bg-white rounded-lg shadow-lg p-8">
                                <h2 className="text-xl font-bold mb-4">Import Results</h2>

                                <div className="grid grid-cols-2 gap-4 mb-6">
                                    <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                                        <div className="flex items-center gap-2 text-green-700">
                                            <CheckCircle className="h-5 w-5" />
                                            <span className="font-semibold">Success</span>
                                        </div>
                                        <p className="text-2xl font-bold text-green-900 mt-2">
                                            {results.results?.success?.length || 0}
                                        </p>
                                    </div>

                                    <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                                        <div className="flex items-center gap-2 text-red-700">
                                            <XCircle className="h-5 w-5" />
                                            <span className="font-semibold">Failed</span>
                                        </div>
                                        <p className="text-2xl font-bold text-red-900 mt-2">
                                            {results.results?.failed?.length || 0}
                                        </p>
                                    </div>
                                </div>

                                {results.results?.success?.length > 0 && (
                                    <div className="mb-6">
                                        <h3 className="font-semibold text-green-700 mb-2">
                                            Successfully Imported ({results.results.success.length})
                                        </h3>
                                        <div className="bg-green-50 rounded-lg p-4 max-h-48 overflow-y-auto">
                                            {results.results.success.map((email: string, i: number) => (
                                                <div key={i} className="text-sm text-green-800 py-1">
                                                    ✓ {email}
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                )}

                                {results.results?.failed?.length > 0 && (
                                    <div className="mb-6">
                                        <h3 className="font-semibold text-red-700 mb-2">
                                            Failed Imports ({results.results.failed.length})
                                        </h3>
                                        <div className="bg-red-50 rounded-lg p-4 max-h-48 overflow-y-auto">
                                            {results.results.failed.map((item: any, i: number) => (
                                                <div key={i} className="text-sm text-red-800 py-1">
                                                    ✗ {item.email}: {item.error}
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                )}

                                {results.validationErrors?.length > 0 && (
                                    <div>
                                        <h3 className="font-semibold text-yellow-700 mb-2 flex items-center gap-2">
                                            <AlertCircle className="h-5 w-5" />
                                            Validation Errors ({results.validationErrors.length})
                                        </h3>
                                        <div className="bg-yellow-50 rounded-lg p-4 max-h-48 overflow-y-auto">
                                            {results.validationErrors.map((error: any, i: number) => (
                                                <div key={i} className="text-sm text-yellow-800 py-1">
                                                    Row {error.row}: {error.error} ({error.email})
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                )}

                                <button
                                    onClick={() => {
                                        setResults(null);
                                        setFile(null);
                                    }}
                                    className="mt-6 w-full bg-gray-100 text-gray-700 px-6 py-3 rounded-lg font-semibold hover:bg-gray-200 transition-colors"
                                >
                                    Import Another File
                                </button>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
