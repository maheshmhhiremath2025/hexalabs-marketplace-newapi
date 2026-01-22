import { NextRequest } from 'next/server';
import { withAuth } from '@/lib/with-auth';
import { createApiResponse } from '@/lib/api-response';
import { Errors } from '@/lib/api-errors';
import dbConnect from '@/lib/db';
import User from '@/models/User';
import Order from '@/models/Order';
import Lab from '@/models/Lab';
import Organization from '@/models/Organization';

/**
 * GET /api/v1/analytics/overview
 * Get system-wide overview analytics (admin only)
 */
export const GET = withAuth(
    async (request: NextRequest, auth) => {
        await dbConnect();

        // Admin only
        if (!auth?.scopes?.includes('admin:all')) {
            throw Errors.forbidden('Admin access required for system analytics');
        }

        try {
            // User statistics
            const totalUsers = await User.countDocuments();
            const activeUsers = await User.countDocuments({
                'purchasedLabs.0': { $exists: true }
            });
            const orgUsers = await User.countDocuments({
                organizationId: { $exists: true, $ne: null }
            });

            // Organization statistics
            const totalOrganizations = await Organization.countDocuments();
            const activeOrganizations = await Organization.countDocuments({
                isActive: true
            });

            // Lab statistics
            const totalLabs = await Lab.countDocuments();
            const labsByTopic = await Lab.aggregate([
                { $group: { _id: '$topic', count: { $sum: 1 } } },
                { $sort: { count: -1 } },
                { $limit: 10 }
            ]);

            // Order statistics
            const totalOrders = await Order.countDocuments();
            const completedOrders = await Order.countDocuments({ status: 'completed' });
            const pendingOrders = await Order.countDocuments({ status: 'pending' });

            // Revenue statistics
            const revenueData = await Order.aggregate([
                { $match: { status: 'completed' } },
                {
                    $group: {
                        _id: null,
                        totalRevenue: { $sum: '$totals.total' },
                        averageOrderValue: { $avg: '$totals.total' }
                    }
                }
            ]);

            const revenue = revenueData[0] || { totalRevenue: 0, averageOrderValue: 0 };

            // Lab purchases and usage
            const allUsers = await User.find({}).select('purchasedLabs');
            let totalLabsPurchased = 0;
            let totalActiveLabs = 0;
            let totalLaunches = 0;
            let totalTimeSpent = 0;

            allUsers.forEach(user => {
                const labs = user.purchasedLabs || [];
                totalLabsPurchased += labs.length;

                labs.forEach((lab: any) => {
                    if (lab.accessExpiresAt && new Date(lab.accessExpiresAt) > new Date()) {
                        totalActiveLabs++;
                    }
                    totalLaunches += lab.launchCount || 0;
                    totalTimeSpent += lab.totalTimeSpent || 0;
                });
            });

            // Recent activity (last 30 days)
            const thirtyDaysAgo = new Date();
            thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

            const recentOrders = await Order.countDocuments({
                createdAt: { $gte: thirtyDaysAgo }
            });

            const recentUsers = await User.countDocuments({
                createdAt: { $gte: thirtyDaysAgo }
            });

            const overview = {
                users: {
                    total: totalUsers,
                    active: activeUsers,
                    organizationMembers: orgUsers,
                    recent30Days: recentUsers,
                },
                organizations: {
                    total: totalOrganizations,
                    active: activeOrganizations,
                },
                labs: {
                    totalAvailable: totalLabs,
                    totalPurchased: totalLabsPurchased,
                    active: totalActiveLabs,
                    topTopics: labsByTopic.map((item: any) => ({
                        topic: item._id,
                        count: item.count,
                    })),
                },
                orders: {
                    total: totalOrders,
                    completed: completedOrders,
                    pending: pendingOrders,
                    recent30Days: recentOrders,
                },
                revenue: {
                    total: Math.round(revenue.totalRevenue * 100) / 100,
                    averageOrderValue: Math.round(revenue.averageOrderValue * 100) / 100,
                    currency: 'USD',
                },
                usage: {
                    totalLaunches,
                    totalTimeSpent: Math.round(totalTimeSpent / 60 * 10) / 10, // hours
                    totalTimeSpentMinutes: totalTimeSpent,
                    averageLaunchesPerUser: totalUsers > 0
                        ? Math.round(totalLaunches / totalUsers * 10) / 10
                        : 0,
                },
            };

            return createApiResponse(overview);
        } catch (error: any) {
            if (error.name === 'ApiError') {
                throw error;
            }
            console.error('[Analytics API] Overview error:', error);
            throw Errors.databaseError('Failed to fetch analytics overview');
        }
    },
    { requiredScope: 'admin:all' }
);
