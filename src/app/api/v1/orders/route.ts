import { NextRequest } from 'next/server';
import { withAuth } from '@/lib/with-auth';
import { createPaginatedResponse, createApiResponse } from '@/lib/api-response';
import { Errors } from '@/lib/api-errors';
import dbConnect from '@/lib/db';
import Order from '@/models/Order';
import User from '@/models/User';
import Lab from '@/models/Lab';
import mongoose from 'mongoose';

/**
 * GET /api/v1/orders
 * List orders with filtering
 * Admin can see all orders, users see only their own
 */
export const GET = withAuth(
    async (request: NextRequest, auth) => {
        await dbConnect();

        const { searchParams } = new URL(request.url);

        // Pagination
        const page = parseInt(searchParams.get('page') || '1');
        const limit = Math.min(parseInt(searchParams.get('limit') || '20'), 100);
        const skip = (page - 1) * limit;

        // Filters
        const userId = searchParams.get('userId');
        const status = searchParams.get('status');
        const startDate = searchParams.get('startDate');
        const endDate = searchParams.get('endDate');
        const sortBy = searchParams.get('sortBy') || 'createdAt';
        const order = searchParams.get('order') === 'asc' ? 1 : -1;

        // Build query
        const query: any = {};

        // Permission check
        const requestingUserId = auth?.userId;
        const isAdmin = auth?.scopes?.includes('admin:all');

        if (!isAdmin) {
            // Non-admin users can only see their own orders
            query.userId = new mongoose.Types.ObjectId(requestingUserId);
        } else if (userId) {
            // Admin can filter by specific user
            query.userId = new mongoose.Types.ObjectId(userId);
        }

        if (status) {
            query.status = status;
        }

        if (startDate || endDate) {
            query.createdAt = {};
            if (startDate) query.createdAt.$gte = new Date(startDate);
            if (endDate) query.createdAt.$lte = new Date(endDate);
        }

        try {
            // Get total count
            const total = await Order.countDocuments(query);

            // Get orders
            const orders = await Order.find(query)
                .sort({ [sortBy]: order })
                .skip(skip)
                .limit(limit)
                .populate('userId', 'name email')
                .lean();

            // Format response
            const formattedOrders = orders.map((order: any) => ({
                id: order._id,
                orderNumber: order.orderNumber,
                status: order.status,
                user: order.userId ? {
                    id: order.userId._id,
                    name: order.userId.name,
                    email: order.userId.email,
                } : null,
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
            console.error('[Orders API] List error:', error);
            throw Errors.databaseError('Failed to fetch orders');
        }
    },
    { requiredScope: 'orders:read' }
);

/**
 * POST /api/v1/orders
 * Create a new order
 * Alternative to /labs/purchase endpoint
 */
export const POST = withAuth(
    async (request: NextRequest, auth) => {
        await dbConnect();

        const body = await request.json();
        const { items, customerInfo, billingAddress, paymentMethod = 'razorpay' } = body;

        // Validate required fields
        if (!items || !Array.isArray(items) || items.length === 0) {
            throw Errors.validationError('Order items are required', { field: 'items' });
        }

        if (!customerInfo || !customerInfo.fullName || !customerInfo.email || !customerInfo.phone) {
            throw Errors.validationError('Customer information is required', { field: 'customerInfo' });
        }

        if (!billingAddress) {
            throw Errors.validationError('Billing address is required', { field: 'billingAddress' });
        }

        const userId = auth?.userId;
        if (!userId) {
            throw Errors.unauthorized('User ID not found in authentication');
        }

        try {
            // Validate labs and calculate totals
            const orderItems = [];
            let subtotal = 0;

            for (const item of items) {
                const lab = await Lab.findOne({ code: item.labCode });

                if (!lab) {
                    throw Errors.notFound(`Lab with code '${item.labCode}' not found`);
                }

                const quantity = item.quantity || 1;
                const itemTotal = lab.price * quantity;
                subtotal += itemTotal;

                orderItems.push({
                    labId: lab.id,
                    labCode: lab.code,
                    labTitle: lab.title,
                    quantity,
                    priceUSD: lab.price,
                });
            }

            const tax = 0; // Add tax calculation if needed
            const total = subtotal + tax;

            // Create order
            const order = await Order.create({
                userId: new mongoose.Types.ObjectId(userId),
                items: orderItems,
                customerInfo,
                billingAddress,
                payment: {
                    method: paymentMethod,
                    status: 'pending',
                },
                totals: {
                    subtotal,
                    tax,
                    total,
                    currency: 'USD',
                },
                status: 'pending',
            });

            // Add labs to user's purchasedLabs
            const user = await User.findById(userId);
            if (user) {
                const accessExpiresAt = new Date();
                accessExpiresAt.setDate(accessExpiresAt.getDate() + 180);

                for (const item of orderItems) {
                    user.purchasedLabs.push({
                        courseId: item.labCode,
                        purchaseDate: new Date(),
                        accessExpiresAt,
                        launchCount: 0,
                        maxLaunches: 10,
                        sessionDurationHours: 4,
                        totalTimeSpent: 0,
                        launchHistory: [],
                        taskProgress: {
                            completedTasks: [],
                            currentTaskIndex: 0,
                        },
                    } as any);
                }

                await user.save();
            }

            return createApiResponse(
                {
                    id: order._id,
                    orderNumber: order.orderNumber,
                    status: order.status,
                    items: orderItems,
                    totals: {
                        subtotal,
                        tax,
                        total,
                        currency: 'USD',
                    },
                },
                201,
                'Order created successfully'
            );
        } catch (error: any) {
            if (error.name === 'ApiError') {
                throw error;
            }
            console.error('[Orders API] Create error:', error);
            throw Errors.databaseError('Failed to create order');
        }
    },
    { requiredScope: 'orders:write' }
);
