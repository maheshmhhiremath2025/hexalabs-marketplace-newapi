'use client';

import { useState } from 'react';
import { useCart } from '@/lib/store/cart';
import { convertPrice, EXCHANGE_RATES } from '@/lib/currency';
import { CreditCard, Wallet, Building2, Smartphone } from 'lucide-react';

interface PaymentStepProps {
    data: {
        method: string;
        poNumber?: string;
    };
    onUpdate: (data: any) => void;
    onNext: () => void;
    onBack: () => void;
}

export function PaymentStep({ data, onUpdate, onNext, onBack }: PaymentStepProps) {
    const { items } = useCart();
    const [isProcessing, setIsProcessing] = useState(false);

    // Calculate pricing using proper currency conversion
    const subtotalUSD = items.reduce((sum, item) => sum + (item.price * item.quantity), 0);
    const subtotalINR = Math.round(convertPrice(subtotalUSD, 'INR')); // Use conversion function
    const tax = Math.round(subtotalINR * 0.18); // 18% GST
    const total = subtotalINR + tax;

    const handleRazorpayPayment = async () => {
        try {
            setIsProcessing(true);

            // Create Razorpay order
            const orderResponse = await fetch('/api/payment/create-order', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    items: items.map(item => ({
                        priceUSD: item.price,
                        quantity: item.quantity,
                    })),
                }),
            });

            if (!orderResponse.ok) {
                throw new Error('Failed to create payment order');
            }

            const { orderId, amount, breakdown } = await orderResponse.json();

            // Load Razorpay script
            const script = document.createElement('script');
            script.src = 'https://checkout.razorpay.com/v1/checkout.js';
            script.async = true;
            document.body.appendChild(script);

            script.onload = () => {
                const options = {
                    key: 'rzp_test_S5MyGzMGCVaygJ',
                    amount: amount,
                    currency: 'INR',
                    name: 'Hexalabs',
                    description: 'Lab License Purchase',
                    image: `${window.location.origin}/hexalabs-logo.png`,
                    order_id: orderId,
                    handler: async function (response: any) {
                        try {
                            // Get checkout data from parent
                            const checkoutDataStr = sessionStorage.getItem('checkoutData');
                            const checkoutData = checkoutDataStr ? JSON.parse(checkoutDataStr) : {};

                            // Verify payment
                            const verifyResponse = await fetch('/api/payment/verify', {
                                method: 'POST',
                                headers: { 'Content-Type': 'application/json' },
                                body: JSON.stringify({
                                    razorpayOrderId: response.razorpay_order_id,
                                    razorpayPaymentId: response.razorpay_payment_id,
                                    razorpaySignature: response.razorpay_signature,
                                    items: items.map(item => ({
                                        labId: item.id,
                                        labCode: item.code,
                                        labTitle: item.title,
                                        quantity: item.quantity,
                                        priceUSD: item.price,
                                    })),
                                    customerInfo: checkoutData.customerInfo,
                                    billingAddress: checkoutData.billingAddress,
                                    breakdown,
                                }),
                            });

                            if (!verifyResponse.ok) {
                                throw new Error('Payment verification failed');
                            }

                            const result = await verifyResponse.json();

                            // Clear cart
                            const { useCart: getCart } = await import('@/lib/store/cart');
                            getCart.getState().clearCart();

                            // Redirect to success page
                            window.location.href = `/order-confirmation/${result.orderNumber}`;
                        } catch (error) {
                            console.error('Payment verification error:', error);
                            alert('Payment verification failed. Please contact support.');
                        }
                    },
                    prefill: {
                        name: '',
                        email: '',
                        contact: '',
                    },
                    theme: {
                        color: '#3b82f6',
                    },
                    modal: {
                        ondismiss: function () {
                            setIsProcessing(false);
                        },
                    },
                };

                const razorpay = new (window as any).Razorpay(options);
                razorpay.open();
            };
        } catch (error) {
            console.error('Payment error:', error);
            alert('Failed to initiate payment. Please try again.');
            setIsProcessing(false);
        }
    };

    return (
        <div className="max-w-2xl mx-auto">
            <div className="bg-white rounded-lg shadow-sm p-8">
                <h2 className="text-2xl font-bold mb-6">Payment</h2>

                {/* Price Breakdown */}
                <div className="mb-8 p-6 bg-gradient-to-br from-blue-50 to-indigo-50 rounded-lg border border-blue-100">
                    <h3 className="font-semibold text-lg mb-4 text-gray-900">Order Summary</h3>

                    <div className="space-y-3">
                        <div className="flex justify-between text-gray-700">
                            <span>Subtotal (USD)</span>
                            <span className="font-medium">${subtotalUSD.toFixed(2)}</span>
                        </div>

                        <div className="flex justify-between text-gray-700">
                            <span>Subtotal (INR)</span>
                            <span className="font-medium">₹{subtotalINR.toLocaleString('en-IN')}</span>
                        </div>

                        <div className="flex justify-between text-gray-700">
                            <span>GST (18%)</span>
                            <span className="font-medium">₹{tax.toLocaleString('en-IN')}</span>
                        </div>

                        <div className="border-t border-blue-200 pt-3 mt-3">
                            <div className="flex justify-between text-xl font-bold text-gray-900">
                                <span>Total</span>
                                <span className="text-blue-600">₹{total.toLocaleString('en-IN')}</span>
                            </div>
                            <p className="text-sm text-gray-600 mt-1 text-right">
                                (approx ${(total / 83).toFixed(2)} USD)
                            </p>
                        </div>
                    </div>
                </div>

                {/* Payment Method */}
                <div className="mb-8">
                    <h3 className="font-semibold text-lg mb-4">Payment Method</h3>

                    <div className="border-2 border-blue-500 rounded-lg p-6 bg-blue-50">
                        <div className="flex items-center gap-3 mb-4">
                            <div className="p-2 bg-blue-100 rounded">
                                <Wallet className="w-6 h-6 text-blue-600" />
                            </div>
                            <div>
                                <h4 className="font-semibold text-gray-900">Razorpay</h4>
                                <p className="text-sm text-gray-600">Secure payment gateway</p>
                            </div>
                        </div>

                        <div className="grid grid-cols-2 gap-3 mb-4">
                            <div className="flex items-center gap-2 text-sm text-gray-700">
                                <CreditCard className="w-4 h-4" />
                                <span>Cards</span>
                            </div>
                            <div className="flex items-center gap-2 text-sm text-gray-700">
                                <Smartphone className="w-4 h-4" />
                                <span>UPI</span>
                            </div>
                            <div className="flex items-center gap-2 text-sm text-gray-700">
                                <Building2 className="w-4 h-4" />
                                <span>Net Banking</span>
                            </div>
                            <div className="flex items-center gap-2 text-sm text-gray-700">
                                <Wallet className="w-4 h-4" />
                                <span>Wallets</span>
                            </div>
                        </div>

                        <p className="text-xs text-gray-600">
                            🔒 Your payment information is encrypted and secure
                        </p>
                    </div>
                </div>

                {/* Action Buttons */}
                <div className="flex gap-4">
                    <button
                        onClick={onBack}
                        className="flex-1 px-6 py-3 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors font-medium"
                        disabled={isProcessing}
                    >
                        Back
                    </button>
                    <button
                        onClick={handleRazorpayPayment}
                        disabled={isProcessing}
                        className="flex-1 px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        {isProcessing ? 'Processing...' : `Pay ₹${total.toLocaleString('en-IN')}`}
                    </button>
                </div>
            </div>
        </div>
    );
}
