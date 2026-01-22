import { NextRequest } from 'next/server';
import { withAuth } from '@/lib/with-auth';
import { createApiResponse } from '@/lib/api-response';
import { Errors } from '@/lib/api-errors';
import dbConnect from '@/lib/db';
import Order from '@/models/Order';

/**
 * GET /api/v1/orders/:orderId
 * Get order details
 */
export const GET = withAuth(
    async (request: NextRequest, auth) => {
        await dbConnect();

        // Extract orderId from URL path
        const url = new URL(request.url);
        const pathParts = url.pathname.split('/');
        const orderId = pathParts[pathParts.length - 1];

        if (!orderId) {
            throw Errors.badRequest('Order ID is required');
        }

        try {
            const order = await Order.findById(orderId)
                .populate('userId', 'name email role organizationId')
                .lean();

            if (!order) {
                throw Errors.notFound('Order not found');
            }

            // Permission check
            const requestingUserId = auth?.userId;
            const isAdmin = auth?.scopes?.includes('admin:all');

            if (!isAdmin && order.userId._id.toString() !== requestingUserId) {
                throw Errors.forbidden('You can only view your own orders');
            }

            // Format response
            const formattedOrder = {
                id: order._id,
                orderNumber: order.orderNumber,
                status: order.status,
                user: {
                    id: order.userId._id,
                    name: order.userId.name,
                    email: order.userId.email,
                    role: order.userId.role,
                },
                items: order.items.map((item: any) => ({
                    labId: item.labId,
                    labCode: item.labCode,
                    labTitle: item.labTitle,
                    quantity: item.quantity,
                    price: item.priceUSD,
                    total: item.priceUSD * item.quantity,
                })),
                customerInfo: order.customerInfo,
                billingAddress: order.billingAddress,
                payment: {
                    method: order.payment.method,
                    status: order.payment.status,
                    poNumber: order.payment.poNumber,
                    razorpayOrderId: order.payment.razorpayOrderId,
                    razorpayPaymentId: order.payment.razorpayPaymentId,
                },
                totals: order.totals,
                zohoInvoice: order.zohoInvoiceNumber ? {
                    invoiceId: order.zohoInvoiceId,
                    invoiceNumber: order.zohoInvoiceNumber,
                    invoiceUrl: order.zohoInvoiceUrl,
                } : null,
                createdAt: order.createdAt,
                updatedAt: order.updatedAt,
            };

            return createApiResponse(formattedOrder);
        } catch (error: any) {
            if (error.name === 'ApiError') {
                throw error;
            }
            console.error('[Orders API] Get order error:', error);
            throw Errors.databaseError('Failed to fetch order details');
        }
    },
    { requiredScope: 'orders:read' }
);

/**
 * PATCH /api/v1/orders/:orderId
 * Update order status
 * Admin only
 */
export const PATCH = withAuth(
    async (request: NextRequest, auth) => {
        await dbConnect();

        // Extract orderId from URL path
        const url = new URL(request.url);
        const pathParts = url.pathname.split('/');
        const orderId = pathParts[pathParts.length - 1];

        if (!orderId) {
            throw Errors.badRequest('Order ID is required');
        }

        // Admin only
        if (!auth?.scopes?.includes('admin:all')) {
            throw Errors.forbidden('Admin access required to update orders');
        }

        const body = await request.json();
        const { status, paymentStatus, zohoInvoiceId, zohoInvoiceNumber, zohoInvoiceUrl } = body;

        // Build update object
        const updates: any = {};

        if (status) {
            const validStatuses = ['pending', 'processing', 'completed', 'cancelled'];
            if (!validStatuses.includes(status)) {
                throw Errors.validationError('Invalid status', {
                    field: 'status',
                    validValues: validStatuses,
                });
            }
            updates.status = status;
        }

        if (paymentStatus) {
            const validPaymentStatuses = ['pending', 'completed', 'failed'];
            if (!validPaymentStatuses.includes(paymentStatus)) {
                throw Errors.validationError('Invalid payment status', {
                    field: 'paymentStatus',
                    validValues: validPaymentStatuses,
                });
            }
            updates['payment.status'] = paymentStatus;
        }

        if (zohoInvoiceId) updates.zohoInvoiceId = zohoInvoiceId;
        if (zohoInvoiceNumber) updates.zohoInvoiceNumber = zohoInvoiceNumber;
        if (zohoInvoiceUrl) updates.zohoInvoiceUrl = zohoInvoiceUrl;

        if (Object.keys(updates).length === 0) {
            throw Errors.validationError('No valid fields to update');
        }

        try {
            const order = await Order.findByIdAndUpdate(
                orderId,
                { $set: updates },
                { new: true, runValidators: true }
            ).lean();

            if (!order) {
                throw Errors.notFound('Order not found');
            }

            return createApiResponse(
                {
                    id: order._id,
                    orderNumber: order.orderNumber,
                    status: order.status,
                    payment: {
                        status: order.payment.status,
                    },
                    zohoInvoice: order.zohoInvoiceNumber ? {
                        invoiceNumber: order.zohoInvoiceNumber,
                        invoiceUrl: order.zohoInvoiceUrl,
                    } : null,
                    updatedAt: order.updatedAt,
                },
                200,
                'Order updated successfully'
            );
        } catch (error: any) {
            if (error.name === 'ApiError') {
                throw error;
            }
            console.error('[Orders API] Update order error:', error);
            throw Errors.databaseError('Failed to update order');
        }
    },
    { requiredScope: 'admin:all' }
);
