'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Upload, Download, CheckCircle, XCircle, AlertCircle, Users } from 'lucide-react';
import { generateCSVTemplate } from '@/lib/csv-parser';

export default function BulkImportPage() {
    const router = useRouter();
    const [file, setFile] = useState<File | null>(null);
    const [uploading, setUploading] = useState(false);
    const [results, setResults] = useState<any>(null);
    const [error, setError] = useState<string>('');

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files[0]) {
            setFile(e.target.files[0]);
            setResults(null);
            setError('');
        }
    };

    const handleDownloadTemplate = () => {
        const template = generateCSVTemplate();
        const blob = new Blob([template], { type: 'text/csv' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = 'hexalabs_user_import_template.csv';
        a.click();
        URL.revokeObjectURL(url);
    };

    const handleUpload = async () => {
        if (!file) return;

        setUploading(true);
        setError('');
        const formData = new FormData();
        formData.append('file', file);

        try {
            const response = await fetch('/api/admin/bulk-import', {
                method: 'POST',
                body: formData,
            });

            const data = await response.json();

            if (!response.ok) {
                // Handle duplicate users error
                if (data.error === 'DUPLICATE_USERS') {
                    setError(`Cannot import: The following users already exist in the system:\n${data.duplicates.join(', ')}`);
                } else {
                    setError(data.message || 'Failed to import users');
                }
                setResults(null);
            } else {
                setResults(data);
            }
        } catch (error) {
            console.error('Upload error:', error);
            setError('Failed to upload file. Please try again.');
        } finally {
            setUploading(false);
        }
    };

    return (
        <div className="flex-1 bg-gray-50">
            <div className="bg-white border-b border-gray-200 py-4">
                <div className="container">
                    <h1 className="text-2xl font-bold">Bulk Import Users</h1>
                    <p className="text-gray-600 mt-1">Upload a CSV file to import multiple users at once</p>
                </div>
            </div>

            <div className="container py-12">
                <div className="max-w-3xl mx-auto">
                    {/* Instructions */}
                    <div className="bg-blue-50 border border-blue-200 rounded-lg p-6 mb-6">
                        <h3 className="font-semibold text-blue-900 mb-2 flex items-center gap-2">
                            <Users className="h-5 w-5" />
                            How to Import Users
                        </h3>
                        <ol className="text-sm text-blue-800 space-y-1 ml-6 list-decimal">
                            <li>Download the CSV template below</li>
                            <li>Fill in user details (name, email, role)</li>
                            <li>Upload the completed CSV file</li>
                            <li>Users will receive welcome emails with temporary passwords</li>
                        </ol>
                        <p className="text-xs text-blue-700 mt-3">
                            <strong>Note:</strong> The system will reject the entire file if any user already exists.
                        </p>
                    </div>

                    {/* Upload Section */}
                    {!results && (
                        <div className="bg-white rounded-lg shadow-lg p-8">
                            <div className="mb-6">
                                <button
                                    onClick={handleDownloadTemplate}
                                    className="inline-flex items-center gap-2 bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition-colors"
                                >
                                    <Download className="h-4 w-4" />
                                    Download CSV Template
                                </button>
                            </div>

                            {error && (
                                <div className="mb-6 bg-red-50 border border-red-200 rounded-lg p-4">
                                    <div className="flex items-start gap-2">
                                        <XCircle className="h-5 w-5 text-red-600 flex-shrink-0 mt-0.5" />
                                        <div>
                                            <h4 className="font-semibold text-red-900">Import Failed</h4>
                                            <p className="text-sm text-red-800 mt-1 whitespace-pre-line">{error}</p>
                                        </div>
                                    </div>
                                </div>
                            )}

                            <div className="border-2 border-dashed border-gray-300 rounded-lg p-12 text-center hover:border-blue-400 transition-colors">
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
                                <p className="text-sm text-gray-500 mt-2">or drag and drop</p>
                                {file && (
                                    <div className="mt-4 inline-flex items-center gap-2 bg-blue-50 px-4 py-2 rounded-lg">
                                        <CheckCircle className="h-4 w-4 text-blue-600" />
                                        <span className="text-sm text-blue-900 font-medium">{file.name}</span>
                                    </div>
                                )}
                            </div>

                            {file && (
                                <div className="mt-6">
                                    <button
                                        onClick={handleUpload}
                                        disabled={uploading}
                                        className="w-full bg-blue-600 text-white px-6 py-3 rounded-lg font-semibold hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                                    >
                                        {uploading ? (
                                            <span className="flex items-center justify-center gap-2">
                                                <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                                                Importing Users...
                                            </span>
                                        ) : (
                                            'Import Users'
                                        )}
                                    </button>
                                </div>
                            )}
                        </div>
                    )}

                    {/* Results Section */}
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
                                        <p className="text-xs text-green-700 mt-1">Users created & emails sent</p>
                                    </div>

                                    <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                                        <div className="flex items-center gap-2 text-red-700">
                                            <XCircle className="h-5 w-5" />
                                            <span className="font-semibold">Failed</span>
                                        </div>
                                        <p className="text-2xl font-bold text-red-900 mt-2">
                                            {results.results?.failed?.length || 0}
                                        </p>
                                        <p className="text-xs text-red-700 mt-1">Errors during import</p>
                                    </div>
                                </div>

                                {/* Successful Imports */}
                                {results.results?.success?.length > 0 && (
                                    <div className="mb-6">
                                        <h3 className="font-semibold text-green-700 mb-2">
                                            ✓ Successfully Imported ({results.results.success.length})
                                        </h3>
                                        <div className="bg-green-50 rounded-lg p-4 max-h-48 overflow-y-auto">
                                            {results.results.success.map((email: string, i: number) => (
                                                <div key={i} className="text-sm text-green-800 py-1 flex items-center gap-2">
                                                    <CheckCircle className="h-3 w-3" />
                                                    {email}
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                )}

                                {/* Failed Imports */}
                                {results.results?.failed?.length > 0 && (
                                    <div className="mb-6">
                                        <h3 className="font-semibold text-red-700 mb-2">
                                            ✗ Failed Imports ({results.results.failed.length})
                                        </h3>
                                        <div className="bg-red-50 rounded-lg p-4 max-h-48 overflow-y-auto">
                                            {results.results.failed.map((item: any, i: number) => (
                                                <div key={i} className="text-sm text-red-800 py-1">
                                                    <strong>{item.email}:</strong> {item.error}
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                )}

                                {/* Validation Errors */}
                                {results.validationErrors?.length > 0 && (
                                    <div>
                                        <h3 className="font-semibold text-yellow-700 mb-2 flex items-center gap-2">
                                            <AlertCircle className="h-5 w-5" />
                                            Validation Errors ({results.validationErrors.length})
                                        </h3>
                                        <div className="bg-yellow-50 rounded-lg p-4 max-h-48 overflow-y-auto">
                                            {results.validationErrors.map((error: any, i: number) => (
                                                <div key={i} className="text-sm text-yellow-800 py-1">
                                                    <strong>Row {error.row}:</strong> {error.error} ({error.email})
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
