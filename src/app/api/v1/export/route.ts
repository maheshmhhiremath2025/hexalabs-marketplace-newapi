import { NextRequest, NextResponse } from 'next/server';
import { withAuth } from '@/lib/with-auth';
import { Errors } from '@/lib/api-errors';
import dbConnect from '@/lib/db';
import Order from '@/models/Order';
import User from '@/models/User';
import Lab from '@/models/Lab';
import { exportData, getContentType, generateFilename } from '@/lib/export';

/**
 * GET /api/v1/export
 * Export data in CSV or JSON format (admin only)
 */
export const GET = withAuth(
    async (request: NextRequest, auth) => {
        await dbConnect();

        const { searchParams } = new URL(request.url);

        // Admin only
        if (!auth?.scopes?.includes('admin:all')) {
            throw Errors.forbidden('Admin access required for data export');
        }

        const type = searchParams.get('type'); // orders, users, labs
        const format = (searchParams.get('format') || 'csv') as 'csv' | 'json';
        const startDate = searchParams.get('startDate');
        const endDate = searchParams.get('endDate');

        if (!type) {
            throw Errors.validationError('Export type is required', {
                field: 'type',
                validValues: ['orders', 'users', 'labs'],
            });
        }

        if (!['csv', 'json'].includes(format)) {
            throw Errors.validationError('Invalid format', {
                field: 'format',
                validValues: ['csv', 'json'],
            });
        }

        try {
            let data: any[] = [];
            let filename = '';

            switch (type) {
                case 'orders': {
                    const query: any = {};
                    if (startDate || endDate) {
                        query.createdAt = {};
                        if (startDate) query.createdAt.$gte = new Date(startDate);
                        if (endDate) query.createdAt.$lte = new Date(endDate);
                    }

                    const orders = await Order.find(query)
                        .populate('userId', 'name email')
                        .lean();

                    data = orders.map(order => ({
                        orderNumber: order.orderNumber,
                        status: order.status,
                        customerName: order.customerInfo.fullName,
                        customerEmail: order.customerInfo.email,
                        customerCompany: order.customerInfo.company || '',
                        total: order.totals.total,
                        currency: order.totals.currency,
                        paymentMethod: order.payment.method,
                        paymentStatus: order.payment.status,
                        itemsCount: order.items.length,
                        createdAt: order.createdAt,
                    }));

                    filename = generateFilename('orders', format);
                    break;
                }

                case 'users': {
                    const users = await User.find({})
                        .select('name email role organizationId createdAt purchasedLabs')
                        .populate('organizationId', 'name')
                        .lean();

                    data = users.map(user => ({
                        name: user.name,
                        email: user.email,
                        role: user.role,
                        organization: user.organizationId ? (user.organizationId as any).name : '',
                        labsCount: user.purchasedLabs?.length || 0,
                        createdAt: user.createdAt,
                    }));

                    filename = generateFilename('users', format);
                    break;
                }

                case 'labs': {
                    const labs = await Lab.find({}).lean();

                    data = labs.map(lab => ({
                        code: lab.code,
                        title: lab.title,
                        topic: lab.topic,
                        provider: lab.provider,
                        difficulty: lab.difficulty,
                        price: lab.price,
                        duration: lab.duration,
                        createdAt: lab.createdAt,
                    }));

                    filename = generateFilename('labs', format);
                    break;
                }

                default:
                    throw Errors.validationError('Invalid export type', {
                        field: 'type',
                        validValues: ['orders', 'users', 'labs'],
                    });
            }

            // Export data
            const content = exportData(data, format, format === 'csv');
            const contentType = getContentType(format);

            // Return file download
            return new NextResponse(content, {
                status: 200,
                headers: {
                    'Content-Type': contentType,
                    'Content-Disposition': `attachment; filename="${filename}"`,
                    'Cache-Control': 'no-cache',
                },
            });
        } catch (error: any) {
            if (error.name === 'ApiError') {
                throw error;
            }
            console.error('[Export API] Error:', error);
            throw Errors.databaseError('Export failed');
        }
    },
    { requiredScope: 'admin:all' }
);
