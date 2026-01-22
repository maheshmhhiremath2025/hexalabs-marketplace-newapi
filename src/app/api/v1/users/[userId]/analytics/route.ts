import { NextRequest } from 'next/server';
import { withAuth } from '@/lib/with-auth';
import { createApiResponse } from '@/lib/api-response';
import { Errors } from '@/lib/api-errors';
import dbConnect from '@/lib/db';
import User from '@/models/User';
import Order from '@/models/Order';

/**
 * GET /api/v1/users/:userId/analytics
 * Get user analytics and statistics
 * Requires authentication
 */
export const GET = withAuth(
    async (request: NextRequest, auth) => {
        await dbConnect();

        // Extract userId from URL path
        const url = new URL(request.url);
        const pathParts = url.pathname.split('/');
        const userId = pathParts[pathParts.length - 1];

        if (!userId) {
            throw Errors.badRequest('User ID is required');
        }

        // Verify user can access this data
        const requestingUserId = auth?.userId;
        const isAdmin = auth?.scopes?.includes('admin:all');

        if (userId !== requestingUserId && !isAdmin) {
            throw Errors.forbidden('You can only view your own analytics');
        }

        try {
            const user = await User.findById(userId);

            if (!user) {
                throw Errors.notFound('User not found');
            }

            const purchasedLabs = user.purchasedLabs || [];
            const now = new Date();

            // Calculate statistics
            const totalLabsPurchased = purchasedLabs.length;

            const activeLabs = purchasedLabs.filter((lab: any) =>
                lab.accessExpiresAt && new Date(lab.accessExpiresAt) > now
            ).length;

            const expiredLabs = purchasedLabs.filter((lab: any) =>
                lab.accessExpiresAt && new Date(lab.accessExpiresAt) <= now
            ).length;

            const totalLaunches = purchasedLabs.reduce((sum: number, lab: any) =>
                sum + (lab.launchCount || 0), 0
            );

            const totalTimeSpent = purchasedLabs.reduce((sum: number, lab: any) =>
                sum + (lab.totalTimeSpent || 0), 0
            );

            const totalTimeSpentHours = Math.round(totalTimeSpent / 60 * 10) / 10;

            const activeSessionsCount = purchasedLabs.filter((lab: any) =>
                lab.activeSession?.status === 'active'
            ).length;

            // Get recent activity (last 10 launches)
            const recentActivity: any[] = [];
            purchasedLabs.forEach((lab: any) => {
                if (lab.launchHistory && lab.launchHistory.length > 0) {
                    lab.launchHistory.forEach((launch: any) => {
                        recentActivity.push({
                            courseId: lab.courseId,
                            launchedAt: launch.launchedAt,
                            closedAt: launch.closedAt,
                            duration: launch.duration,
                        });
                    });
                }
            });

            // Sort by launchedAt and take last 10
            recentActivity.sort((a, b) =>
                new Date(b.launchedAt).getTime() - new Date(a.launchedAt).getTime()
            );
            const recentLaunches = recentActivity.slice(0, 10);

            // Get orders statistics
            const orders = await Order.find({ userId }).lean();

            const totalOrders = orders.length;
            const completedOrders = orders.filter((order: any) => order.status === 'completed').length;
            const totalSpent = orders
                .filter((order: any) => order.status === 'completed')
                .reduce((sum: number, order: any) => sum + (order.totals.total || 0), 0);

            // Most used labs (by launch count)
            const labUsage = purchasedLabs
                .map((lab: any) => ({
                    courseId: lab.courseId,
                    launchCount: lab.launchCount || 0,
                    totalTimeSpent: lab.totalTimeSpent || 0,
                    lastAccessedAt: lab.lastAccessedAt,
                }))
                .sort((a: any, b: any) => b.launchCount - a.launchCount)
                .slice(0, 5);

            // Response
            const analytics = {
                overview: {
                    totalLabsPurchased,
                    activeLabs,
                    expiredLabs,
                    totalLaunches,
                    totalTimeSpent: totalTimeSpentHours,
                    totalTimeSpentMinutes: totalTimeSpent,
                    activeSessionsCount,
                },
                orders: {
                    totalOrders,
                    completedOrders,
                    pendingOrders: orders.filter((o: any) => o.status === 'pending').length,
                    totalSpent,
                    averageOrderValue: totalOrders > 0 ? Math.round(totalSpent / totalOrders * 100) / 100 : 0,
                },
                usage: {
                    averageLaunchesPerLab: totalLabsPurchased > 0
                        ? Math.round(totalLaunches / totalLabsPurchased * 10) / 10
                        : 0,
                    averageTimePerLab: totalLabsPurchased > 0
                        ? Math.round(totalTimeSpent / totalLabsPurchased)
                        : 0,
                    mostUsedLabs: labUsage,
                },
                recentActivity: recentLaunches.map(launch => ({
                    courseId: launch.courseId,
                    launchedAt: launch.launchedAt,
                    closedAt: launch.closedAt,
                    duration: launch.duration,
                    durationFormatted: launch.duration
                        ? `${Math.floor(launch.duration / 60)}h ${launch.duration % 60}m`
                        : 'In progress',
                })),
                membership: {
                    memberSince: user.createdAt,
                    role: user.role,
                    organizationId: user.organizationId,
                },
            };

            return createApiResponse(analytics);
        } catch (error: any) {
            if (error.name === 'ApiError') {
                throw error;
            }
            console.error('[Users API] Get analytics error:', error);
            throw Errors.databaseError('Failed to fetch user analytics');
        }
    },
    { requiredScope: 'users:read' }
);
