'use client';

import { useState, useEffect } from 'react';
import { CheckCircle2, Edit2, X } from 'lucide-react';
import { useSession } from 'next-auth/react';

interface BillingAddressStepProps {
    data: {
        street: string;
        city: string;
        state: string;
        zipCode: string;
        country: string;
    };
    onUpdate: (data: any) => void;
    onNext: () => void;
    onBack: () => void;
}

const COUNTRIES = [
    'India', 'United States', 'Canada', 'United Kingdom', 'Australia', 'Germany',
    'France', 'Japan', 'Singapore', 'Other'
];

const US_STATES = [
    'AL', 'AK', 'AZ', 'AR', 'CA', 'CO', 'CT', 'DE', 'FL', 'GA',
    'HI', 'ID', 'IL', 'IN', 'IA', 'KS', 'KY', 'LA', 'ME', 'MD',
    'MA', 'MI', 'MN', 'MS', 'MO', 'MT', 'NE', 'NV', 'NH', 'NJ',
    'NM', 'NY', 'NC', 'ND', 'OH', 'OK', 'OR', 'PA', 'RI', 'SC',
    'SD', 'TN', 'TX', 'UT', 'VT', 'VA', 'WA', 'WV', 'WI', 'WY'
];

const INDIAN_STATES = [
    'Andhra Pradesh', 'Arunachal Pradesh', 'Assam', 'Bihar', 'Chhattisgarh',
    'Goa', 'Gujarat', 'Haryana', 'Himachal Pradesh', 'Jharkhand',
    'Karnataka', 'Kerala', 'Madhya Pradesh', 'Maharashtra', 'Manipur',
    'Meghalaya', 'Mizoram', 'Nagaland', 'Odisha', 'Punjab',
    'Rajasthan', 'Sikkim', 'Tamil Nadu', 'Telangana', 'Tripura',
    'Uttar Pradesh', 'Uttarakhand', 'West Bengal',
    'Andaman and Nicobar Islands', 'Chandigarh', 'Dadra and Nagar Haveli and Daman and Diu',
    'Delhi', 'Jammu and Kashmir', 'Ladakh', 'Lakshadweep', 'Puducherry'
];

export function BillingAddressStep({ data, onUpdate, onNext, onBack }: BillingAddressStepProps) {
    const { data: session } = useSession();
    const [errors, setErrors] = useState<Record<string, string>>({});
    const [savedAddress, setSavedAddress] = useState<any>(null);
    const [isEditing, setIsEditing] = useState(true);

    // Get user-specific storage key
    const getStorageKey = () => {
        const userId = session?.user?.email || 'guest';
        return `billingAddress_${userId}`;
    };

    // Load saved address on mount (user-specific)
    useEffect(() => {
        if (session?.user?.email) {
            const storageKey = getStorageKey();
            const saved = localStorage.getItem(storageKey);
            if (saved) {
                try {
                    const parsedAddress = JSON.parse(saved);
                    setSavedAddress(parsedAddress);
                    // If current data is empty, use saved address
                    if (!data.street && !data.city) {
                        onUpdate(parsedAddress);
                        setIsEditing(false);
                    }
                } catch (e) {
                    console.error('Failed to load saved address:', e);
                }
            }
        }
    }, [session?.user?.email]);

    const validateStep = () => {
        const newErrors: Record<string, string> = {};

        if (!data.street.trim()) newErrors.street = 'Street address is required';
        if (!data.city.trim()) newErrors.city = 'City is required';
        if (!data.state.trim()) newErrors.state = 'State/Province is required';
        if (!data.zipCode.trim()) {
            newErrors.zipCode = 'Pincode is required';
        } else if (!/^\d{6}$/.test(data.zipCode)) {
            newErrors.zipCode = 'Pincode must be exactly 6 digits';
        }
        if (!data.country.trim()) newErrors.country = 'Country is required';

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleNext = () => {
        if (validateStep()) {
            // Save address to user-specific localStorage
            if (session?.user?.email) {
                const storageKey = getStorageKey();
                localStorage.setItem(storageKey, JSON.stringify(data));
            }
            onNext();
        }
    };

    const handleUseSavedAddress = () => {
        if (savedAddress) {
            onUpdate(savedAddress);
            setIsEditing(false);
        }
    };

    const handleEditAddress = () => {
        setIsEditing(true);
    };

    const isPincodeValid = /^\d{6}$/.test(data.zipCode);

    return (
        <div className="max-w-2xl mx-auto">
            <div className="flex items-center justify-between mb-6">
                <h2 className="text-2xl font-bold">Billing Address</h2>
                {savedAddress && !isEditing && (
                    <button
                        onClick={handleEditAddress}
                        className="flex items-center gap-2 text-blue-600 hover:text-blue-700 font-semibold"
                    >
                        <Edit2 className="w-4 h-4" />
                        Edit Address
                    </button>
                )}
            </div>

            {/* Saved Address Option */}
            {savedAddress && isEditing && (
                <div className="mb-6 bg-blue-50 border-2 border-blue-200 rounded-lg p-4">
                    <div className="flex items-start justify-between">
                        <div>
                            <h3 className="font-semibold text-gray-900 mb-2 flex items-center gap-2">
                                <CheckCircle2 className="w-5 h-5 text-blue-600" />
                                Your Saved Address
                            </h3>
                            <p className="text-sm text-gray-700">
                                {savedAddress.street}<br />
                                {savedAddress.city}, {savedAddress.state} {savedAddress.zipCode}<br />
                                {savedAddress.country}
                            </p>
                        </div>
                        <button
                            onClick={handleUseSavedAddress}
                            className="bg-blue-600 text-white px-4 py-2 rounded-lg font-semibold hover:bg-blue-700 transition-colors text-sm"
                        >
                            Use This Address
                        </button>
                    </div>
                </div>
            )}

            {/* Address Form */}
            {isEditing && (
                <div className="space-y-4">
                    {/* Street Address */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                            Street Address <span className="text-red-500">*</span>
                        </label>
                        <input
                            type="text"
                            value={data.street}
                            onChange={(e) => onUpdate({ ...data, street: e.target.value })}
                            className={`w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${errors.street ? 'border-red-500' : 'border-gray-300'
                                }`}
                            placeholder="123 Main Street, Apartment 4B"
                        />
                        {errors.street && (
                            <p className="text-red-500 text-sm mt-1">{errors.street}</p>
                        )}
                    </div>

                    {/* City and State */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                City <span className="text-red-500">*</span>
                            </label>
                            <input
                                type="text"
                                value={data.city}
                                onChange={(e) => onUpdate({ ...data, city: e.target.value })}
                                className={`w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${errors.city ? 'border-red-500' : 'border-gray-300'
                                    }`}
                                placeholder="Mumbai"
                            />
                            {errors.city && (
                                <p className="text-red-500 text-sm mt-1">{errors.city}</p>
                            )}
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                State/Province <span className="text-red-500">*</span>
                            </label>
                            {data.country === 'India' ? (
                                <select
                                    value={data.state}
                                    onChange={(e) => onUpdate({ ...data, state: e.target.value })}
                                    className={`w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${errors.state ? 'border-red-500' : 'border-gray-300'
                                        }`}
                                >
                                    <option value="">Select State</option>
                                    {INDIAN_STATES.map((state) => (
                                        <option key={state} value={state}>{state}</option>
                                    ))}
                                </select>
                            ) : data.country === 'United States' ? (
                                <select
                                    value={data.state}
                                    onChange={(e) => onUpdate({ ...data, state: e.target.value })}
                                    className={`w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${errors.state ? 'border-red-500' : 'border-gray-300'
                                        }`}
                                >
                                    <option value="">Select State</option>
                                    {US_STATES.map((state) => (
                                        <option key={state} value={state}>{state}</option>
                                    ))}
                                </select>
                            ) : (
                                <input
                                    type="text"
                                    value={data.state}
                                    onChange={(e) => onUpdate({ ...data, state: e.target.value })}
                                    className={`w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${errors.state ? 'border-red-500' : 'border-gray-300'
                                        }`}
                                    placeholder="State/Province"
                                />
                            )}
                            {errors.state && (
                                <p className="text-red-500 text-sm mt-1">{errors.state}</p>
                            )}
                        </div>
                    </div>

                    {/* Pincode and Country */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                Pincode (6 digits only) <span className="text-red-500">*</span>
                            </label>
                            <div className="relative">
                                <input
                                    type="text"
                                    value={data.zipCode}
                                    onChange={(e) => {
                                        // Only allow numbers, max 6 digits
                                        const value = e.target.value.replace(/\D/g, '');
                                        if (value.length <= 6) {
                                            onUpdate({ ...data, zipCode: value });
                                        }
                                    }}
                                    className={`w-full px-4 py-2 pr-12 border rounded-lg focus:outline-none focus:ring-2 ${errors.zipCode
                                            ? 'border-red-500 focus:ring-red-500'
                                            : data.zipCode.length > 0
                                                ? isPincodeValid
                                                    ? 'border-green-500 focus:ring-green-500'
                                                    : 'border-red-500 focus:ring-red-500'
                                                : 'border-gray-300 focus:ring-blue-500'
                                        }`}
                                    placeholder="400001"
                                    maxLength={6}
                                />
                                {data.zipCode.length > 0 && (
                                    <div className="absolute right-4 top-1/2 transform -translate-y-1/2">
                                        {isPincodeValid ? (
                                            <CheckCircle2 className="w-5 h-5 text-green-500" />
                                        ) : (
                                            <span className="text-sm font-medium text-gray-500">{data.zipCode.length}/6</span>
                                        )}
                                    </div>
                                )}
                            </div>
                            {errors.zipCode && (
                                <p className="text-red-500 text-sm mt-1">{errors.zipCode}</p>
                            )}
                            {data.zipCode.length > 0 && !isPincodeValid && !errors.zipCode && (
                                <p className="text-red-500 text-sm mt-1">
                                    Must be exactly 6 digits ({data.zipCode.length}/6)
                                </p>
                            )}
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                Country <span className="text-red-500">*</span>
                            </label>
                            <select
                                value={data.country}
                                onChange={(e) => {
                                    onUpdate({ ...data, country: e.target.value, state: '' });
                                }}
                                className={`w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${errors.country ? 'border-red-500' : 'border-gray-300'
                                    }`}
                            >
                                <option value="">Select Country</option>
                                {COUNTRIES.map((country) => (
                                    <option key={country} value={country}>{country}</option>
                                ))}
                            </select>
                            {errors.country && (
                                <p className="text-red-500 text-sm mt-1">{errors.country}</p>
                            )}
                        </div>
                    </div>
                </div>
            )}

            {/* Address Preview (when not editing) */}
            {!isEditing && (
                <div className="bg-gray-50 border-2 border-gray-200 rounded-lg p-6">
                    <h3 className="font-semibold text-gray-900 mb-3">Billing Address</h3>
                    <p className="text-gray-700">
                        {data.street}<br />
                        {data.city}, {data.state} {data.zipCode}<br />
                        {data.country}
                    </p>
                </div>
            )}

            {/* Navigation */}
            <div className="mt-8 flex justify-between">
                <button
                    onClick={onBack}
                    className="bg-gray-200 text-gray-700 px-8 py-3 rounded-lg font-semibold hover:bg-gray-300 transition-colors"
                >
                    Back
                </button>
                <button
                    onClick={handleNext}
                    className="bg-blue-600 text-white px-8 py-3 rounded-lg font-semibold hover:bg-blue-700 transition-colors"
                >
                    Continue to Payment
                </button>
            </div>
        </div>
    );
}
