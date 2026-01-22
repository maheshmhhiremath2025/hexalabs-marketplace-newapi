import { NextRequest } from 'next/server';
import { withAuth } from '@/lib/with-auth';
import { createPaginatedResponse } from '@/lib/api-response';
import { Errors } from '@/lib/api-errors';
import dbConnect from '@/lib/db';
import Order from '@/models/Order';

/**
 * GET /api/v1/users/:userId/orders
 * Get user's orders
 * Requires authentication
 */
export const GET = withAuth(
    async (request: NextRequest, auth) => {
        await dbConnect();

        // Extract userId from URL path
        const url = new URL(request.url);
        const pathParts = url.pathname.split('/');
        const userId = pathParts[pathParts.length - 1];
        const { searchParams } = new URL(request.url);

        if (!userId) {
            throw Errors.badRequest('User ID is required');
        }

        // Verify user can access this data
        const requestingUserId = auth?.userId;
        const isAdmin = auth?.scopes?.includes('admin:all');

        if (userId !== requestingUserId && !isAdmin) {
            throw Errors.forbidden('You can only view your own orders');
        }

        // Pagination
        const page = parseInt(searchParams.get('page') || '1');
        const limit = Math.min(parseInt(searchParams.get('limit') || '20'), 100);
        const skip = (page - 1) * limit;

        // Filters
        const status = searchParams.get('status'); // pending, processing, completed, cancelled
        const sortBy = searchParams.get('sortBy') || 'createdAt';
        const order = searchParams.get('order') === 'asc' ? 1 : -1;

        // Build query
        const query: any = { userId };

        if (status) {
            query.status = status;
        }

        try {
            // Get total count
            const total = await Order.countDocuments(query);

            // Get orders
            const orders = await Order.find(query)
                .sort({ [sortBy]: order })
                .skip(skip)
                .limit(limit)
                .lean();

            // Format response
            const formattedOrders = orders.map((order: any) => ({
                id: order._id,
                orderNumber: order.orderNumber,
                status: order.status,
                items: order.items.map((item: any) => ({
                    labCode: item.labCode,
                    labTitle: item.labTitle,
                    quantity: item.quantity,
                    price: item.priceUSD,
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
                customerInfo: {
                    fullName: order.customerInfo.fullName,
                    email: order.customerInfo.email,
                    company: order.customerInfo.company,
                },
                zohoInvoice: order.zohoInvoiceNumber ? {
                    invoiceNumber: order.zohoInvoiceNumber,
                    invoiceUrl: order.zohoInvoiceUrl,
                } : null,
                createdAt: order.createdAt,
                updatedAt: order.updatedAt,
            }));

            return createPaginatedResponse(formattedOrders, page, limit, total);
        } catch (error: any) {
            if (error.name === 'ApiError') {
                throw error;
            }
            console.error('[Users API] Get orders error:', error);
            throw Errors.databaseError('Failed to fetch user orders');
        }
    },
    { requiredScope: 'users:read' }
);
