'use client';

import { useState } from 'react';
import { CheckCircle2, X } from 'lucide-react';

interface CustomerInfoStepProps {
    data: {
        fullName: string;
        email: string;
        company: string;
        phone: string;
    };
    onUpdate: (data: any) => void;
    onNext: () => void;
}

export function CustomerInfoStep({ data, onUpdate, onNext }: CustomerInfoStepProps) {
    const [errors, setErrors] = useState<Record<string, string>>({});

    // Validation helpers
    const isEmailValid = data.email.includes('@') && data.email.length > 3;
    const isPhoneValid = /^\d{10}$/.test(data.phone);

    const validateStep = () => {
        const newErrors: Record<string, string> = {};

        if (!data.fullName.trim()) {
            newErrors.fullName = 'Full name is required';
        }

        if (!data.email.trim()) {
            newErrors.email = 'Email is required';
        } else if (!isEmailValid) {
            newErrors.email = 'Email must contain @ symbol';
        }

        if (!data.phone.trim()) {
            newErrors.phone = 'Phone number is required';
        } else if (!isPhoneValid) {
            newErrors.phone = 'Phone number must be exactly 10 digits';
        }

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleNext = () => {
        if (validateStep()) {
            onNext();
        }
    };

    return (
        <div className="max-w-2xl mx-auto">
            <h2 className="text-2xl font-bold mb-6">Customer Information</h2>

            <div className="space-y-4">
                {/* Full Name */}
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                        Full Name <span className="text-red-500">*</span>
                    </label>
                    <input
                        type="text"
                        value={data.fullName}
                        onChange={(e) => onUpdate({ ...data, fullName: e.target.value })}
                        className={`w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${errors.fullName ? 'border-red-500' : 'border-gray-300'
                            }`}
                        placeholder="John Doe"
                    />
                    {errors.fullName && (
                        <p className="text-red-500 text-sm mt-1">{errors.fullName}</p>
                    )}
                </div>

                {/* Email */}
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                        Email Address <span className="text-red-500">*</span>
                    </label>
                    <div className="relative">
                        <input
                            type="email"
                            value={data.email}
                            onChange={(e) => onUpdate({ ...data, email: e.target.value })}
                            className={`w-full px-4 py-2 pr-12 border rounded-lg focus:outline-none focus:ring-2 ${errors.email
                                ? 'border-red-500 focus:ring-red-500'
                                : data.email.length > 0
                                    ? isEmailValid
                                        ? 'border-green-500 focus:ring-green-500'
                                        : 'border-red-500 focus:ring-red-500'
                                    : 'border-gray-300 focus:ring-blue-500'
                                }`}
                            placeholder="john@example.com"
                        />
                        {data.email.length > 0 && (
                            <div className="absolute right-4 top-1/2 transform -translate-y-1/2">
                                {isEmailValid ? (
                                    <CheckCircle2 className="w-5 h-5 text-green-500" />
                                ) : (
                                    <X className="w-5 h-5 text-red-500" />
                                )}
                            </div>
                        )}
                    </div>
                    {errors.email && (
                        <p className="text-red-500 text-sm mt-1">{errors.email}</p>
                    )}
                    {data.email.length > 0 && !isEmailValid && !errors.email && (
                        <p className="text-red-500 text-sm mt-1">Must contain @ symbol</p>
                    )}
                </div>

                {/* Company */}
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                        Company Name
                    </label>
                    <input
                        type="text"
                        value={data.company}
                        onChange={(e) => onUpdate({ ...data, company: e.target.value })}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                        placeholder="Acme Corporation"
                    />
                </div>

                {/* Phone */}
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                        Phone Number (10 digits) <span className="text-red-500">*</span>
                    </label>
                    <div className="relative">
                        <input
                            type="tel"
                            value={data.phone}
                            onChange={(e) => {
                                const value = e.target.value.replace(/\D/g, '');
                                if (value.length <= 10) {
                                    onUpdate({ ...data, phone: value });
                                }
                            }}
                            className={`w-full px-4 py-2 pr-12 border rounded-lg focus:outline-none focus:ring-2 ${errors.phone
                                ? 'border-red-500 focus:ring-red-500'
                                : data.phone.length > 0
                                    ? isPhoneValid
                                        ? 'border-green-500 focus:ring-green-500'
                                        : 'border-red-500 focus:ring-red-500'
                                    : 'border-gray-300 focus:ring-blue-500'
                                }`}
                            placeholder="9876543210"
                            maxLength={10}
                        />
                        {data.phone.length > 0 && (
                            <div className="absolute right-4 top-1/2 transform -translate-y-1/2">
                                {isPhoneValid ? (
                                    <CheckCircle2 className="w-5 h-5 text-green-500" />
                                ) : (
                                    <X className="w-5 h-5 text-red-500" />
                                )}
                            </div>
                        )}
                    </div>
                    {errors.phone && (
                        <p className="text-red-500 text-sm mt-1">{errors.phone}</p>
                    )}
                    {data.phone.length > 0 && !isPhoneValid && !errors.phone && (
                        <p className="text-red-500 text-sm mt-1">
                            Must be exactly 10 digits ({data.phone.length}/10)
                        </p>
                    )}
                </div>
            </div>

            {/* Navigation */}
            <div className="mt-8 flex justify-end">
                <button
                    onClick={handleNext}
                    className="bg-blue-600 text-white px-8 py-3 rounded-lg font-semibold hover:bg-blue-700 transition-colors"
                >
                    Continue to Billing Address
                </button>
            </div>
        </div>
    );
}
