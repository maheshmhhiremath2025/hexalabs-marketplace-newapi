import { NextRequest } from 'next/server';
import { withAuth } from '@/lib/with-auth';
import { createApiResponse } from '@/lib/api-response';
import { Errors } from '@/lib/api-errors';
import dbConnect from '@/lib/db';
import Order from '@/models/Order';

/**
 * GET /api/v1/orders/:orderId/invoice
 * Get or generate invoice for an order
 */
export const GET = withAuth(
    async (request: NextRequest, auth) => {
        await dbConnect();

        // Extract orderId from URL path
        const url = new URL(request.url);
        const pathParts = url.pathname.split('/');
        const orderId = pathParts[pathParts.length - 2]; // -2 because last part is 'invoice'

        if (!orderId) {
            throw Errors.badRequest('Order ID is required');
        }

        try {
            const order = await Order.findById(orderId)
                .populate('userId', 'name email')
                .lean();

            if (!order) {
                throw Errors.notFound('Order not found');
            }

            // Permission check
            const requestingUserId = auth?.userId;
            const isAdmin = auth?.scopes?.includes('admin:all');

            if (!isAdmin && order.userId._id.toString() !== requestingUserId) {
                throw Errors.forbidden('You can only view your own invoices');
            }

            // Check if Zoho invoice exists
            if (order.zohoInvoiceNumber) {
                return createApiResponse({
                    invoiceId: order.zohoInvoiceId,
                    invoiceNumber: order.zohoInvoiceNumber,
                    invoiceUrl: order.zohoInvoiceUrl,
                    source: 'zoho',
                    orderId: order._id,
                    orderNumber: order.orderNumber,
                });
            }

            // Generate invoice data (for display or PDF generation)
            const invoiceData = {
                invoiceNumber: `INV-${order.orderNumber}`,
                orderNumber: order.orderNumber,
                orderDate: order.createdAt,
                status: order.status,
                customer: {
                    name: order.customerInfo.fullName,
                    email: order.customerInfo.email,
                    company: order.customerInfo.company,
                    phone: order.customerInfo.phone,
                },
                billingAddress: order.billingAddress,
                items: order.items.map((item: any, index: number) => ({
                    no: index + 1,
                    description: item.labTitle,
                    code: item.labCode,
                    quantity: item.quantity,
                    unitPrice: item.priceUSD,
                    total: item.priceUSD * item.quantity,
                })),
                totals: {
                    subtotal: order.totals.subtotal,
                    tax: order.totals.tax,
                    total: order.totals.total,
                    currency: order.totals.currency,
                },
                payment: {
                    method: order.payment.method,
                    status: order.payment.status,
                },
                notes: 'Thank you for your purchase! Access to your labs has been granted for 180 days.',
                terms: 'All sales are final. No refunds after lab access has been granted.',
            };

            return createApiResponse({
                source: 'generated',
                invoiceData,
                message: 'Invoice data generated. Zoho invoice not yet created.',
            });
        } catch (error: any) {
            if (error.name === 'ApiError') {
                throw error;
            }
            console.error('[Orders API] Get invoice error:', error);
            throw Errors.databaseError('Failed to fetch invoice');
        }
    },
    { requiredScope: 'orders:read' }
);

/**
 * POST /api/v1/orders/:orderId/invoice
 * Generate Zoho invoice for an order (admin only)
 */
export const POST = withAuth(
    async (request: NextRequest, auth) => {
        await dbConnect();

        // Extract orderId from URL path
        const url = new URL(request.url);
        const pathParts = url.pathname.split('/');
        const orderId = pathParts[pathParts.length - 2]; // -2 because last part is 'invoice'

        if (!orderId) {
            throw Errors.badRequest('Order ID is required');
        }

        // Admin only
        if (!auth?.scopes?.includes('admin:all')) {
            throw Errors.forbidden('Admin access required to generate invoices');
        }

        try {
            const order = await Order.findById(orderId);

            if (!order) {
                throw Errors.notFound('Order not found');
            }

            // Check if invoice already exists
            if (order.zohoInvoiceNumber) {
                return createApiResponse(
                    {
                        invoiceId: order.zohoInvoiceId,
                        invoiceNumber: order.zohoInvoiceNumber,
                        invoiceUrl: order.zohoInvoiceUrl,
                        message: 'Invoice already exists',
                    },
                    200
                );
            }

            // In production, this would call Zoho Books API to create invoice
            // For now, simulate invoice creation
            const zohoInvoiceId = `zoho_inv_${Date.now()}`;
            const zohoInvoiceNumber = `INV-${new Date().getFullYear()}-${String(Math.floor(Math.random() * 10000)).padStart(4, '0')}`;
            const zohoInvoiceUrl = `https://books.zoho.com/invoice/${zohoInvoiceId}`;

            // Update order with Zoho invoice details
            order.zohoInvoiceId = zohoInvoiceId;
            order.zohoInvoiceNumber = zohoInvoiceNumber;
            order.zohoInvoiceUrl = zohoInvoiceUrl;
            await order.save();

            return createApiResponse(
                {
                    invoiceId: zohoInvoiceId,
                    invoiceNumber: zohoInvoiceNumber,
                    invoiceUrl: zohoInvoiceUrl,
                    orderId: order._id,
                    orderNumber: order.orderNumber,
                },
                201,
                'Zoho invoice created successfully'
            );
        } catch (error: any) {
            if (error.name === 'ApiError') {
                throw error;
            }
            console.error('[Orders API] Create invoice error:', error);
            throw Errors.databaseError('Failed to create invoice');
        }
    },
    { requiredScope: 'admin:all' }
);
