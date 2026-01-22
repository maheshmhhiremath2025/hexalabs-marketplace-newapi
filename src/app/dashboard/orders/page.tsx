'use client';

import { useEffect, useState } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Package, Eye, Calendar, DollarSign } from 'lucide-react';

export default function OrdersPage() {
    const { data: session, status } = useSession();
    const router = useRouter();
    const [orders, setOrders] = useState<any[]>([]);
    const [loading, setLoading] = useState(false);

    // Redirect if not authenticated
    useEffect(() => {
        if (status === 'unauthenticated') {
            router.push('/login');
        }
    }, [status, router]);

    // Fetch orders when session is available
    useEffect(() => {
        if (!session) return;

        const fetchOrders = async () => {
            setLoading(true);
            try {
                const response = await fetch('/api/orders');
                if (response.ok) {
                    const data = await response.json();
                    setOrders(data.orders || []);
                }
            } catch (error) {
                console.error('Error fetching orders:', error);
            } finally {
                setLoading(false);
            }
        };

        fetchOrders();
    }, [session]);

    if (status === 'loading') {
        return (
            <div className="flex-1 bg-gray-50 flex items-center justify-center min-h-screen">
                <div className="text-center">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
                    <p className="text-gray-600">Loading...</p>
                </div>
            </div>
        );
    }

    if (!session) {
        return null;
    }

    const getStatusColor = (status: string) => {
        switch (status) {
            case 'completed':
                return 'bg-green-100 text-green-800';
            case 'processing':
                return 'bg-blue-100 text-blue-800';
            case 'pending':
                return 'bg-yellow-100 text-yellow-800';
            case 'cancelled':
                return 'bg-red-100 text-red-800';
            default:
                return 'bg-gray-100 text-gray-800';
        }
    };

    return (
        <div className="flex-1 bg-gray-50">
            <div className="bg-white border-b border-gray-200 py-4">
                <div className="container">
                    <nav className="text-sm text-gray-600">
                        <Link href="/" className="hover:text-blue-600">Home</Link>
                        <span className="mx-2">/</span>
                        <Link href="/dashboard" className="hover:text-blue-600">Dashboard</Link>
                        <span className="mx-2">/</span>
                        <span className="text-gray-900 font-medium">Orders</span>
                    </nav>
                </div>
            </div>

            <div className="container py-12">
                <div className="flex items-center justify-between mb-8">
                    <div>
                        <h1 className="text-3xl font-bold">My Orders</h1>
                        <p className="text-gray-600 mt-1">View and track your lab purchases</p>
                    </div>
                </div>

                {loading ? (
                    <div className="text-center py-12">
                        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
                        <p className="text-gray-600">Loading orders...</p>
                    </div>
                ) : orders.length === 0 ? (
                    <div className="bg-white rounded-lg border border-gray-200 p-12 text-center">
                        <Package className="h-16 w-16 text-gray-300 mx-auto mb-4" />
                        <h2 className="text-xl font-semibold text-gray-900 mb-2">
                            No orders yet
                        </h2>
                        <p className="text-gray-600 mb-6">
                            Start shopping to see your orders here
                        </p>
                        <Link
                            href="/catalog"
                            className="inline-block bg-blue-600 text-white px-6 py-3 rounded-lg font-semibold hover:bg-blue-700 transition-colors"
                        >
                            Browse Catalog
                        </Link>
                    </div>
                ) : (
                    <div className="space-y-4">
                        {orders.map((order) => (
                            <div
                                key={order._id}
                                className="bg-white rounded-lg border border-gray-200 p-6 hover:shadow-md transition-shadow"
                            >
                                <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                                    <div className="flex-1">
                                        <div className="flex items-center gap-3 mb-2">
                                            <h3 className="font-bold text-lg">
                                                Order #{order.orderNumber}
                                            </h3>
                                            <span className={`px-3 py-1 rounded-full text-xs font-semibold ${getStatusColor(order.status)}`}>
                                                {order.status.charAt(0).toUpperCase() + order.status.slice(1)}
                                            </span>
                                        </div>

                                        <div className="flex flex-wrap gap-4 text-sm text-gray-600">
                                            <div className="flex items-center gap-1">
                                                <Calendar className="h-4 w-4" />
                                                {new Date(order.createdAt).toLocaleDateString('en-US', {
                                                    year: 'numeric',
                                                    month: 'short',
                                                    day: 'numeric',
                                                })}
                                            </div>
                                            <div className="flex items-center gap-1">
                                                <Package className="h-4 w-4" />
                                                {order.items.length} {order.items.length === 1 ? 'item' : 'items'}
                                            </div>
                                            <div className="flex items-center gap-1">
                                                <DollarSign className="h-4 w-4" />
                                                ₹{order.totals.total.toLocaleString('en-IN')}
                                            </div>
                                        </div>

                                        <div className="mt-3">
                                            <div className="text-sm text-gray-700">
                                                {order.items.slice(0, 2).map((item: any, index: number) => (
                                                    <div key={index}>• {item.labTitle}</div>
                                                ))}
                                                {order.items.length > 2 && (
                                                    <div className="text-gray-500">
                                                        + {order.items.length - 2} more {order.items.length - 2 === 1 ? 'item' : 'items'}
                                                    </div>
                                                )}
                                            </div>
                                        </div>
                                    </div>

                                    <div className="flex gap-2">
                                        <Link
                                            href={`/order-confirmation/${order.orderNumber}`}
                                            className="inline-flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-lg font-semibold hover:bg-blue-700 transition-colors"
                                        >
                                            <Eye className="h-4 w-4" />
                                            View Details
                                        </Link>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
}
