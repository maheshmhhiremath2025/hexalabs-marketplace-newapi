'use client';

import { useState } from 'react';
import { Package, ShoppingCart, Calendar, DollarSign, X, Loader2 } from 'lucide-react';
import { useRouter } from 'next/navigation';

const availableLabs = [
    { id: 'sc-200t00-a', name: 'SC-200T00-A: Microsoft Security Operations Analyst', price: 90 },
    { id: 'az-104', name: 'AZ-104: Microsoft Azure Administrator', price: 85 },
    { id: 'az-500', name: 'AZ-500: Microsoft Azure Security Technologies', price: 95 },
    { id: 'az-900', name: 'AZ-900: Microsoft Azure Fundamentals', price: 50 },
    { id: 'ms-900', name: 'MS-900: Microsoft 365 Fundamentals', price: 45 },
];

const durations = [
    { days: 90, label: '90 Days', multiplier: 1.0 },
    { days: 180, label: '180 Days', multiplier: 1.8 },
    { days: 365, label: '365 Days', multiplier: 3.0 },
];

export default function PurchaseLicensesPage() {
    const router = useRouter();
    const [selectedLab, setSelectedLab] = useState('');
    const [quantity, setQuantity] = useState(10);
    const [duration, setDuration] = useState(180);
    const [purchasing, setPurchasing] = useState(false);
    const [error, setError] = useState('');
    const [showConfirmModal, setShowConfirmModal] = useState(false);

    const selectedLabInfo = availableLabs.find(lab => lab.id === selectedLab);
    const selectedDuration = durations.find(d => d.days === duration);
    const pricePerLicense = selectedLabInfo ? selectedLabInfo.price * (selectedDuration?.multiplier || 1) : 0;
    const totalPrice = pricePerLicense * quantity;

    const handlePurchase = async () => {
        if (!selectedLab || quantity < 1) {
            setError('Please select a lab and quantity');
            return;
        }

        setPurchasing(true);
        setError('');

        try {
            const response = await fetch('/api/admin/purchase-licenses', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    courseId: selectedLab,
                    quantity,
                    duration
                })
            });

            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.error || 'Failed to purchase licenses');
            }

            // Success - redirect to licenses page
            router.push('/admin/licenses');
        } catch (err: any) {
            setError(err.message);
            setPurchasing(false);
            setShowConfirmModal(false);
        }
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100">
            <div className="container mx-auto px-4 py-8">
                {/* Header */}
                <div className="mb-8">
                    <h1 className="text-3xl font-bold text-slate-900 mb-2">Purchase Lab Licenses</h1>
                    <p className="text-slate-600">Add licenses to your organization</p>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    {/* Left: Selection Form */}
                    <div className="lg:col-span-2 space-y-6">
                        {/* Select Lab */}
                        <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
                            <h2 className="text-lg font-semibold text-slate-900 mb-4 flex items-center gap-2">
                                <Package className="w-5 h-5 text-blue-600" />
                                Select Lab
                            </h2>
                            <div className="space-y-2">
                                {availableLabs.map((lab) => (
                                    <label
                                        key={lab.id}
                                        className={`flex items-center justify-between p-4 border-2 rounded-lg cursor-pointer transition-all ${selectedLab === lab.id
                                                ? 'border-blue-500 bg-blue-50'
                                                : 'border-slate-200 hover:border-slate-300'
                                            }`}
                                    >
                                        <div className="flex items-center gap-3">
                                            <input
                                                type="radio"
                                                name="lab"
                                                value={lab.id}
                                                checked={selectedLab === lab.id}
                                                onChange={(e) => setSelectedLab(e.target.value)}
                                                className="w-4 h-4 text-blue-600"
                                            />
                                            <div>
                                                <p className="font-medium text-slate-900">{lab.name}</p>
                                                <p className="text-sm text-slate-500">Base: ${lab.price}/license</p>
                                            </div>
                                        </div>
                                    </label>
                                ))}
                            </div>
                        </div>

                        {/* Quantity */}
                        <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
                            <h2 className="text-lg font-semibold text-slate-900 mb-4">Quantity</h2>
                            <div className="flex items-center gap-4">
                                <button
                                    onClick={() => setQuantity(Math.max(1, quantity - 5))}
                                    className="px-4 py-2 bg-slate-100 hover:bg-slate-200 rounded-lg font-medium transition-colors"
                                >
                                    -5
                                </button>
                                <input
                                    type="number"
                                    min="1"
                                    value={quantity}
                                    onChange={(e) => setQuantity(Math.max(1, parseInt(e.target.value) || 1))}
                                    className="w-32 px-4 py-2 border border-slate-300 rounded-lg text-center font-semibold text-lg"
                                />
                                <button
                                    onClick={() => setQuantity(quantity + 5)}
                                    className="px-4 py-2 bg-slate-100 hover:bg-slate-200 rounded-lg font-medium transition-colors"
                                >
                                    +5
                                </button>
                                <span className="text-slate-600">licenses</span>
                            </div>
                        </div>

                        {/* Duration */}
                        <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
                            <h2 className="text-lg font-semibold text-slate-900 mb-4 flex items-center gap-2">
                                <Calendar className="w-5 h-5 text-blue-600" />
                                Duration
                            </h2>
                            <div className="grid grid-cols-3 gap-3">
                                {durations.map((d) => (
                                    <label
                                        key={d.days}
                                        className={`p-4 border-2 rounded-lg cursor-pointer transition-all text-center ${duration === d.days
                                                ? 'border-blue-500 bg-blue-50'
                                                : 'border-slate-200 hover:border-slate-300'
                                            }`}
                                    >
                                        <input
                                            type="radio"
                                            name="duration"
                                            value={d.days}
                                            checked={duration === d.days}
                                            onChange={(e) => setDuration(parseInt(e.target.value))}
                                            className="sr-only"
                                        />
                                        <p className="font-semibold text-slate-900">{d.label}</p>
                                        <p className="text-sm text-slate-500 mt-1">
                                            {d.multiplier}x price
                                        </p>
                                    </label>
                                ))}
                            </div>
                        </div>
                    </div>

                    {/* Right: Order Summary */}
                    <div className="lg:col-span-1">
                        <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6 sticky top-4">
                            <h2 className="text-lg font-semibold text-slate-900 mb-4 flex items-center gap-2">
                                <ShoppingCart className="w-5 h-5 text-blue-600" />
                                Order Summary
                            </h2>

                            {error && (
                                <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm">
                                    {error}
                                </div>
                            )}

                            <div className="space-y-3 mb-6">
                                <div className="flex justify-between text-sm">
                                    <span className="text-slate-600">Lab:</span>
                                    <span className="font-medium text-slate-900">
                                        {selectedLabInfo?.name.split(':')[0] || 'Not selected'}
                                    </span>
                                </div>
                                <div className="flex justify-between text-sm">
                                    <span className="text-slate-600">Quantity:</span>
                                    <span className="font-medium text-slate-900">{quantity} licenses</span>
                                </div>
                                <div className="flex justify-between text-sm">
                                    <span className="text-slate-600">Duration:</span>
                                    <span className="font-medium text-slate-900">{duration} days</span>
                                </div>
                                <div className="flex justify-between text-sm">
                                    <span className="text-slate-600">Price per license:</span>
                                    <span className="font-medium text-slate-900">${pricePerLicense.toFixed(2)}</span>
                                </div>
                                <div className="border-t border-slate-200 pt-3 mt-3">
                                    <div className="flex justify-between">
                                        <span className="font-semibold text-slate-900">Total:</span>
                                        <span className="font-bold text-2xl text-blue-600">
                                            ${totalPrice.toFixed(2)}
                                        </span>
                                    </div>
                                </div>
                            </div>

                            <button
                                onClick={() => setShowConfirmModal(true)}
                                disabled={!selectedLab || purchasing}
                                className="w-full px-4 py-3 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white rounded-lg font-medium transition-colors flex items-center justify-center gap-2"
                            >
                                <DollarSign className="w-5 h-5" />
                                Purchase Licenses
                            </button>

                            <p className="text-xs text-slate-500 mt-3 text-center">
                                Licenses will be added to your organization immediately
                            </p>
                        </div>
                    </div>
                </div>

                {/* Confirm Modal */}
                {showConfirmModal && (
                    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
                        <div className="bg-white rounded-xl shadow-xl max-w-md w-full p-6">
                            <div className="flex items-center justify-between mb-4">
                                <h2 className="text-2xl font-bold text-slate-900">Confirm Purchase</h2>
                                <button
                                    onClick={() => setShowConfirmModal(false)}
                                    className="p-1 hover:bg-slate-100 rounded-lg transition-colors"
                                >
                                    <X className="w-5 h-5 text-slate-500" />
                                </button>
                            </div>

                            <div className="mb-6 p-4 bg-blue-50 rounded-lg">
                                <p className="text-sm text-slate-700 mb-2">You are about to purchase:</p>
                                <p className="font-semibold text-slate-900">{quantity} x {selectedLabInfo?.name}</p>
                                <p className="text-sm text-slate-600 mt-1">Duration: {duration} days</p>
                                <p className="text-2xl font-bold text-blue-600 mt-3">${totalPrice.toFixed(2)}</p>
                            </div>

                            <div className="flex gap-3">
                                <button
                                    onClick={() => setShowConfirmModal(false)}
                                    disabled={purchasing}
                                    className="flex-1 px-4 py-2 border border-slate-300 text-slate-700 rounded-lg font-medium hover:bg-slate-50 transition-colors"
                                >
                                    Cancel
                                </button>
                                <button
                                    onClick={handlePurchase}
                                    disabled={purchasing}
                                    className="flex-1 px-4 py-2 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white rounded-lg font-medium transition-colors flex items-center justify-center gap-2"
                                >
                                    {purchasing ? (
                                        <>
                                            <Loader2 className="w-4 h-4 animate-spin" />
                                            Processing...
                                        </>
                                    ) : (
                                        'Confirm Purchase'
                                    )}
                                </button>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}
