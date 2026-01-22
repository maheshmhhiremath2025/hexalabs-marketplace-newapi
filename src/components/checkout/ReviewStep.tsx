'use client';

import { useState } from 'react';
import { useCart } from '@/lib/store/cart';
import { useCurrency } from '@/contexts/CurrencyContext';
import { convertPrice, formatPrice } from '@/lib/currency';
import { Check, Loader2 } from 'lucide-react';

interface ReviewStepProps {
    customerInfo: {
        fullName: string;
        email: string;
        company: string;
        phone: string;
    };
    billingAddress: {
        street: string;
        city: string;
        state: string;
        zipCode: string;
        country: string;
    };
    payment: {
        method: 'credit_card' | 'purchase_order' | '';
        poNumber: string;
    };
    onBack: () => void;
    onSubmit: () => Promise<void>;
}

export function ReviewStep({ customerInfo, billingAddress, payment, onBack, onSubmit }: ReviewStepProps) {
    const { items, getTotal } = useCart();
    const { selectedCurrency } = useCurrency();
    const [termsAccepted, setTermsAccepted] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false);

    const subtotalUSD = getTotal();
    const taxRate = 0;
    const taxUSD = subtotalUSD * taxRate;
    const totalUSD = subtotalUSD + taxUSD;

    const subtotal = formatPrice(convertPrice(subtotalUSD, selectedCurrency), selectedCurrency);
    const tax = formatPrice(convertPrice(taxUSD, selectedCurrency), selectedCurrency);
    const total = formatPrice(convertPrice(totalUSD, selectedCurrency), selectedCurrency);

    const handleSubmit = async () => {
        if (!termsAccepted) {
            alert('Please accept the terms and conditions');
            return;
        }

        setIsSubmitting(true);
        try {
            await onSubmit();
        } catch (error) {
            console.error('Order submission error:', error);
            alert('Failed to place order. Please try again.');
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <div className="max-w-4xl mx-auto">
            <h2 className="text-2xl font-bold mb-6">Review Your Order</h2>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Order Details */}
                <div className="lg:col-span-2 space-y-6">
                    {/* Order Items */}
                    <div className="bg-white border border-gray-200 rounded-lg p-6">
                        <h3 className="font-semibold text-lg mb-4">Order Items ({items.length})</h3>
                        <div className="space-y-3">
                            {items.map((item) => {
                                const itemPrice = formatPrice(convertPrice(item.price, selectedCurrency), selectedCurrency);
                                const itemTotal = formatPrice(convertPrice(item.price * item.quantity, selectedCurrency), selectedCurrency);

                                return (
                                    <div key={item.id} className="flex justify-between items-center py-2 border-b border-gray-100 last:border-0">
                                        <div className="flex-1">
                                            <div className="font-medium">{item.title}</div>
                                            <div className="text-sm text-gray-500">{item.code}</div>
                                            <div className="text-sm text-gray-600">Qty: {item.quantity} × {itemPrice}</div>
                                        </div>
                                        <div className="font-semibold">{itemTotal}</div>
                                    </div>
                                );
                            })}
                        </div>
                    </div>

                    {/* Customer Information */}
                    <div className="bg-white border border-gray-200 rounded-lg p-6">
                        <h3 className="font-semibold text-lg mb-4">Customer Information</h3>
                        <div className="space-y-2 text-sm">
                            <div><span className="text-gray-600">Name:</span> <span className="font-medium">{customerInfo.fullName}</span></div>
                            <div><span className="text-gray-600">Email:</span> <span className="font-medium">{customerInfo.email}</span></div>
                            {customerInfo.company && (
                                <div><span className="text-gray-600">Company:</span> <span className="font-medium">{customerInfo.company}</span></div>
                            )}
                            <div><span className="text-gray-600">Phone:</span> <span className="font-medium">{customerInfo.phone}</span></div>
                        </div>
                    </div>

                    {/* Billing Address */}
                    <div className="bg-white border border-gray-200 rounded-lg p-6">
                        <h3 className="font-semibold text-lg mb-4">Billing Address</h3>
                        <div className="text-sm">
                            <div>{billingAddress.street}</div>
                            <div>{billingAddress.city}, {billingAddress.state} {billingAddress.zipCode}</div>
                            <div>{billingAddress.country}</div>
                        </div>
                    </div>

                    {/* Payment Method */}
                    <div className="bg-white border border-gray-200 rounded-lg p-6">
                        <h3 className="font-semibold text-lg mb-4">Payment Method</h3>
                        <div className="text-sm">
                            {payment.method === 'credit_card' && (
                                <div>
                                    <div className="font-medium">Credit Card</div>
                                    <div className="text-gray-600 mt-1">Payment will be processed securely</div>
                                </div>
                            )}
                            {payment.method === 'purchase_order' && (
                                <div>
                                    <div className="font-medium">Purchase Order</div>
                                    <div className="text-gray-600 mt-1">PO Number: {payment.poNumber}</div>
                                </div>
                            )}
                        </div>
                    </div>
                </div>

                {/* Order Summary */}
                <div className="lg:col-span-1">
                    <div className="bg-white border border-gray-200 rounded-lg p-6 sticky top-24">
                        <h3 className="font-semibold text-lg mb-4">Order Summary</h3>

                        <div className="space-y-2 mb-4">
                            <div className="flex justify-between text-sm">
                                <span className="text-gray-600">Subtotal</span>
                                <span className="font-medium">{subtotal}</span>
                            </div>
                            {taxRate > 0 && (
                                <div className="flex justify-between text-sm">
                                    <span className="text-gray-600">Tax ({taxRate * 100}%)</span>
                                    <span className="font-medium">{tax}</span>
                                </div>
                            )}
                            <div className="border-t border-gray-200 pt-2 mt-2">
                                <div className="flex justify-between">
                                    <span className="font-bold">Total</span>
                                    <span className="font-bold text-blue-600 text-lg">{total}</span>
                                </div>
                            </div>
                        </div>

                        {/* Terms & Conditions */}
                        <div className="mb-4">
                            <label className="flex items-start gap-2 cursor-pointer">
                                <input
                                    type="checkbox"
                                    checked={termsAccepted}
                                    onChange={(e) => setTermsAccepted(e.target.checked)}
                                    className="mt-1"
                                />
                                <span className="text-sm text-gray-700">
                                    I accept the <a href="/terms" target="_blank" className="text-blue-600 hover:underline">Terms and Conditions</a>
                                </span>
                            </label>
                        </div>

                        {/* Place Order Button */}
                        <button
                            onClick={handleSubmit}
                            disabled={!termsAccepted || isSubmitting}
                            className="w-full bg-green-600 text-white py-3 rounded-lg font-semibold hover:bg-green-700 transition-colors disabled:bg-gray-300 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                        >
                            {isSubmitting ? (
                                <>
                                    <Loader2 className="h-5 w-5 animate-spin" />
                                    Processing...
                                </>
                            ) : (
                                <>
                                    <Check className="h-5 w-5" />
                                    Place Order
                                </>
                            )}
                        </button>

                        <button
                            onClick={onBack}
                            disabled={isSubmitting}
                            className="w-full mt-3 bg-gray-200 text-gray-700 py-3 rounded-lg font-semibold hover:bg-gray-300 transition-colors disabled:opacity-50"
                        >
                            Back to Payment
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}
