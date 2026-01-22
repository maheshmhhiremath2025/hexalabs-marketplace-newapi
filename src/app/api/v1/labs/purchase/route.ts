import { NextRequest } from 'next/server';
import { withAuth } from '@/lib/with-auth';
import { createApiResponse } from '@/lib/api-response';
import { Errors } from '@/lib/api-errors';
import dbConnect from '@/lib/db';
import Lab from '@/models/Lab';
import User from '@/models/User';
import Order from '@/models/Order';
import mongoose from 'mongoose';

/**
 * POST /api/v1/labs/purchase
 * Purchase a lab and create order
 * Requires authentication with 'labs:write' scope
 */
export const POST = withAuth(
    async (request: NextRequest, auth) => {
        await dbConnect();

        const body = await request.json();

        // Validate required fields
        const { labCode, quantity = 1, customerInfo, billingAddress, paymentMethod = 'razorpay' } = body;

        if (!labCode) {
            throw Errors.validationError('Lab code is required', { field: 'labCode' });
        }

        if (!customerInfo || !customerInfo.fullName || !customerInfo.email || !customerInfo.phone) {
            throw Errors.validationError('Customer information is required', { field: 'customerInfo' });
        }

        if (!billingAddress || !billingAddress.street || !billingAddress.city || !billingAddress.state || !billingAddress.zipCode || !billingAddress.country) {
            throw Errors.validationError('Billing address is required', { field: 'billingAddress' });
        }

        try {
            // Find lab
            const lab = await Lab.findOne({ code: labCode });

            if (!lab) {
                throw Errors.notFound(`Lab with code '${labCode}' not found`);
            }

            // Get user
            const userId = auth?.userId;
            if (!userId) {
                throw Errors.unauthorized('User ID not found in authentication');
            }

            const user = await User.findById(userId);

            if (!user) {
                throw Errors.notFound('User not found');
            }

            // Calculate totals
            const subtotal = lab.price * quantity;
            const tax = 0; // Add tax calculation if needed
            const total = subtotal + tax;

            // Create order
            const order = await Order.create({
                userId: new mongoose.Types.ObjectId(userId),
                items: [{
                    labId: lab.id,
                    labCode: lab.code,
                    labTitle: lab.title,
                    quantity,
                    priceUSD: lab.price,
                }],
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

            // Add lab to user's purchasedLabs
            const accessExpiresAt = new Date();
            accessExpiresAt.setDate(accessExpiresAt.getDate() + 180); // 180 days access

            const purchasedLab = {
                courseId: lab.code,
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
            };

            user.purchasedLabs.push(purchasedLab);
            await user.save();

            // Get the purchaseId (last item in array)
            const purchaseId = user.purchasedLabs[user.purchasedLabs.length - 1]._id;

            return createApiResponse(
                {
                    orderId: order._id.toString(),
                    orderNumber: order.orderNumber,
                    purchaseId: purchaseId.toString(),
                    status: order.status,
                    total: order.totals.total,
                    currency: order.totals.currency,
                    lab: {
                        code: lab.code,
                        title: lab.title,
                        price: lab.price,
                    },
                    accessExpiresAt,
                },
                201,
                'Lab purchased successfully'
            );
        } catch (error: any) {
            if (error.name === 'ApiError') {
                throw error;
            }
            console.error('[Labs API] Purchase error:', error);
            throw Errors.databaseError('Failed to purchase lab');
        }
    },
    { requiredScope: 'labs:write' }
);
