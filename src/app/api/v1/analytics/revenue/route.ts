import { NextRequest } from 'next/server';
import { withAuth } from '@/lib/with-auth';
import { createApiResponse } from '@/lib/api-response';
import { Errors } from '@/lib/api-errors';
import dbConnect from '@/lib/db';
import Order from '@/models/Order';
import Organization from '@/models/Organization';

/**
 * GET /api/v1/analytics/revenue
 * Get revenue analytics (admin only)
 */
export const GET = withAuth(
    async (request: NextRequest, auth) => {
        await dbConnect();

        const { searchParams } = new URL(request.url);

        // Admin only
        if (!auth?.scopes?.includes('admin:all')) {
            throw Errors.forbidden('Admin access required for revenue analytics');
        }

        // Optional date range
        const startDate = searchParams.get('startDate');
        const endDate = searchParams.get('endDate');

        try {
            // Build query
            const query: any = { status: 'completed' };

            if (startDate || endDate) {
                query.createdAt = {};
                if (startDate) query.createdAt.$gte = new Date(startDate);
                if (endDate) query.createdAt.$lte = new Date(endDate);
            }

            // Get all completed orders
            const orders = await Order.find(query).populate('userId', 'organizationId');

            // Calculate totals
            let totalRevenue = 0;
            let totalOrders = orders.length;
            const revenueByMonth: any = {};
            const revenueByLab: any = {};
            let organizationRevenue = 0;
            let individualRevenue = 0;

            orders.forEach((order: any) => {
                const revenue = order.totals.total || 0;
                totalRevenue += revenue;

                // By month
                const month = new Date(order.createdAt).toISOString().substring(0, 7);
                if (!revenueByMonth[month]) {
                    revenueByMonth[month] = { month, revenue: 0, orders: 0 };
                }
                revenueByMonth[month].revenue += revenue;
                revenueByMonth[month].orders++;

                // By lab
                order.items.forEach((item: any) => {
                    const labCode = item.labCode;
                    if (!revenueByLab[labCode]) {
                        revenueByLab[labCode] = {
                            labCode,
                            labTitle: item.labTitle,
                            revenue: 0,
                            quantity: 0,
                        };
                    }
                    revenueByLab[labCode].revenue += item.priceUSD * item.quantity;
                    revenueByLab[labCode].quantity += item.quantity;
                });

                // Organization vs Individual
                if (order.userId?.organizationId) {
                    organizationRevenue += revenue;
                } else {
                    individualRevenue += revenue;
                }
            });

            // Format monthly revenue
            const monthlyRevenue = Object.values(revenueByMonth)
                .sort((a: any, b: any) => a.month.localeCompare(b.month))
                .map((item: any) => ({
                    month: item.month,
                    revenue: Math.round(item.revenue * 100) / 100,
                    orders: item.orders,
                    averageOrderValue: Math.round((item.revenue / item.orders) * 100) / 100,
                }));

            // Format lab revenue
            const labRevenue = Object.values(revenueByLab)
                .sort((a: any, b: any) => b.revenue - a.revenue)
                .map((item: any) => ({
                    labCode: item.labCode,
                    labTitle: item.labTitle,
                    revenue: Math.round(item.revenue * 100) / 100,
                    quantity: item.quantity,
                    averagePrice: Math.round((item.revenue / item.quantity) * 100) / 100,
                }));

            // Get organization revenue breakdown
            const organizations = await Organization.find({}).lean();
            const orgRevenueBreakdown = await Promise.all(
                organizations.map(async (org: any) => {
                    const orgOrders = orders.filter((order: any) =>
                        order.userId?.organizationId?.toString() === org._id.toString()
                    );

                    const orgTotal = orgOrders.reduce((sum, order: any) =>
                        sum + (order.totals.total || 0), 0
                    );

                    return {
                        organizationId: org._id,
                        organizationName: org.name,
                        revenue: Math.round(orgTotal * 100) / 100,
                        orders: orgOrders.length,
                    };
                })
            );

            const topOrganizations = orgRevenueBreakdown
                .filter(org => org.revenue > 0)
                .sort((a, b) => b.revenue - a.revenue)
                .slice(0, 10);

            const analytics = {
                summary: {
                    totalRevenue: Math.round(totalRevenue * 100) / 100,
                    totalOrders,
                    averageOrderValue: totalOrders > 0
                        ? Math.round((totalRevenue / totalOrders) * 100) / 100
                        : 0,
                    organizationRevenue: Math.round(organizationRevenue * 100) / 100,
                    individualRevenue: Math.round(individualRevenue * 100) / 100,
                    organizationPercentage: totalRevenue > 0
                        ? Math.round((organizationRevenue / totalRevenue) * 100)
                        : 0,
                    currency: 'USD',
                },
                monthly: monthlyRevenue,
                topLabs: labRevenue.slice(0, 10),
                topOrganizations,
                allLabs: labRevenue,
            };

            return createApiResponse(analytics);
        } catch (error: any) {
            if (error.name === 'ApiError') {
                throw error;
            }
            console.error('[Analytics API] Revenue error:', error);
            throw Errors.databaseError('Failed to fetch revenue analytics');
        }
    },
    { requiredScope: 'admin:all' }
);
