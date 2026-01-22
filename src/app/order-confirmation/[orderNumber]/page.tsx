'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { CheckCircle, Package, ArrowRight, Home } from 'lucide-react';

export default function OrderConfirmationPage() {
    const params = useParams();
    const router = useRouter();
    const [order, setOrder] = useState<any>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchOrder = async () => {
            try {
                const response = await fetch(`/api/orders/${params.orderNumber}`);
                if (response.ok) {
                    const data = await response.json();
                    setOrder(data.order);
                } else {
                    console.error('Failed to fetch order');
                }
            } catch (error) {
                console.error('Error fetching order:', error);
            } finally {
                setLoading(false);
            }
        };

        if (params.orderNumber) {
            fetchOrder();
        }
    }, [params.orderNumber]);

    if (loading) {
        return (
            <div className="container py-12 text-center">
                <div className="animate-pulse">Loading order details...</div>
            </div>
        );
    }

    return (
        <div className="flex-1 bg-gray-50">
            <div className="container py-12">
                {/* Success Header */}
                <div className="max-w-2xl mx-auto text-center mb-8 animate-fade-in">
                    <div className="inline-flex items-center justify-center w-20 h-20 bg-green-100 rounded-full mb-4">
                        <CheckCircle className="h-12 w-12 text-green-600" />
                    </div>
                    <h1 className="text-3xl font-bold text-gray-900 mb-2">
                        Order Confirmed!
                    </h1>
                    <p className="text-gray-600">
                        Thank you for your purchase. Your order has been received and is being processed.
                    </p>
                </div>

                {/* Order Details */}
                <div className="max-w-4xl mx-auto">
                    <div className="bg-white rounded-lg border border-gray-200 p-8 mb-6 animate-slide-up">
                        <div className="flex items-center justify-between mb-6 pb-6 border-b border-gray-200">
                            <div>
                                <h2 className="text-xl font-bold text-gray-900">
                                    Order #{params.orderNumber}
                                </h2>
                                <p className="text-sm text-gray-500 mt-1">
                                    Confirmation email sent to {order?.customerInfo?.email || 'your email'}
                                </p>
                            </div>
                            <div className="text-right">
                                <div className="text-sm text-gray-500">Order Date</div>
                                <div className="font-medium">
                                    {new Date().toLocaleDateString('en-US', {
                                        year: 'numeric',
                                        month: 'long',
                                        day: 'numeric',
                                    })}
                                </div>
                            </div>
                        </div>

                        {/* What's Next */}
                        <div className="bg-blue-50 border border-blue-200 rounded-lg p-6 mb-6">
                            <h3 className="font-semibold text-blue-900 mb-3 flex items-center gap-2">
                                <Package className="h-5 w-5" />
                                What happens next?
                            </h3>
                            <ul className="space-y-2 text-sm text-blue-800">
                                <li className="flex items-start gap-2">
                                    <span className="text-blue-600 mt-0.5">✓</span>
                                    <span>You'll receive a confirmation email with your order details</span>
                                </li>
                                <li className="flex items-start gap-2">
                                    <span className="text-blue-600 mt-0.5">✓</span>
                                    <span>Your lab access credentials will be sent within 24 hours</span>
                                </li>
                                <li className="flex items-start gap-2">
                                    <span className="text-blue-600 mt-0.5">✓</span>
                                    <span>You can track your order status in your dashboard</span>
                                </li>
                            </ul>
                        </div>

                        {/* Order Summary */}
                        {order && (
                            <div>
                                <h3 className="font-semibold text-lg mb-4">Order Summary</h3>
                                <div className="space-y-3">
                                    {order.items?.map((item: any, index: number) => (
                                        <div key={index} className="flex justify-between items-center py-2 border-b border-gray-100 last:border-0">
                                            <div>
                                                <div className="font-medium">{item.labTitle}</div>
                                                <div className="text-sm text-gray-500">
                                                    {item.labCode} • Qty: {item.quantity}
                                                </div>
                                            </div>
                                            <div className="font-semibold">
                                                ₹{((item.priceUSD * 83) * item.quantity).toLocaleString('en-IN')}
                                            </div>
                                        </div>
                                    ))}
                                </div>
                                <div className="mt-4 pt-4 border-t border-gray-200">
                                    <div className="flex justify-between text-sm text-gray-600 mb-2">
                                        <span>Subtotal</span>
                                        <span>₹{order.totals?.subtotal?.toLocaleString('en-IN') || '0'}</span>
                                    </div>
                                    <div className="flex justify-between text-sm text-gray-600 mb-2">
                                        <span>GST (18%)</span>
                                        <span>₹{order.totals?.tax?.toLocaleString('en-IN') || '0'}</span>
                                    </div>
                                    <div className="flex justify-between text-lg font-bold">
                                        <span>Total</span>
                                        <span className="text-blue-600">
                                            ₹{order.totals?.total?.toLocaleString('en-IN') || '0'}
                                        </span>
                                    </div>
                                    <div className="text-xs text-gray-500 text-right mt-1">
                                        (approx ${((order.totals?.total || 0) / 83).toFixed(2)} USD)
                                    </div>
                                </div>
                            </div>
                        )}
                    </div>

                    {/* Actions */}
                    <div className="flex flex-col sm:flex-row gap-4 justify-center">
                        <Link
                            href="/orders"
                            className="inline-flex items-center justify-center gap-2 bg-blue-600 text-white px-6 py-3 rounded-lg font-semibold hover:bg-blue-700 transition-colors"
                        >
                            View My Orders
                            <ArrowRight className="h-4 w-4" />
                        </Link>
                        <Link
                            href="/catalog"
                            className="inline-flex items-center justify-center gap-2 bg-gray-200 text-gray-700 px-6 py-3 rounded-lg font-semibold hover:bg-gray-300 transition-colors"
                        >
                            <Home className="h-4 w-4" />
                            Continue Shopping
                        </Link>
                    </div>
                </div>
            </div>
        </div>
    );
}
