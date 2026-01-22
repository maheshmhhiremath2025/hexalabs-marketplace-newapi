import { NextRequest } from 'next/server';
import { withAuth } from '@/lib/with-auth';
import { createApiResponse } from '@/lib/api-response';
import { Errors } from '@/lib/api-errors';
import dbConnect from '@/lib/db';
import User from '@/models/User';
import Lab from '@/models/Lab';

/**
 * GET /api/v1/analytics/usage
 * Get detailed usage analytics (admin only)
 */
export const GET = withAuth(
    async (request: NextRequest, auth) => {
        await dbConnect();

        const { searchParams } = new URL(request.url);

        // Admin only
        if (!auth?.scopes?.includes('admin:all')) {
            throw Errors.forbidden('Admin access required for usage analytics');
        }

        // Optional date range
        const startDate = searchParams.get('startDate');
        const endDate = searchParams.get('endDate');

        try {
            // Get all users with purchased labs
            const users = await User.find({
                'purchasedLabs.0': { $exists: true }
            }).select('purchasedLabs createdAt');

            // Calculate usage statistics
            const labUsage: any = {};
            let totalLaunches = 0;
            let totalTimeSpent = 0;
            let totalActiveSessions = 0;

            users.forEach(user => {
                const labs = user.purchasedLabs || [];

                labs.forEach((lab: any) => {
                    const courseId = lab.courseId;

                    if (!labUsage[courseId]) {
                        labUsage[courseId] = {
                            courseId,
                            totalPurchases: 0,
                            totalLaunches: 0,
                            totalTimeSpent: 0,
                            activeSessions: 0,
                            uniqueUsers: new Set(),
                        };
                    }

                    labUsage[courseId].totalPurchases++;
                    labUsage[courseId].totalLaunches += lab.launchCount || 0;
                    labUsage[courseId].totalTimeSpent += lab.totalTimeSpent || 0;
                    labUsage[courseId].uniqueUsers.add(user._id.toString());

                    if (lab.activeSession?.status === 'active') {
                        labUsage[courseId].activeSessions++;
                        totalActiveSessions++;
                    }

                    totalLaunches += lab.launchCount || 0;
                    totalTimeSpent += lab.totalTimeSpent || 0;
                });
            });

            // Get lab details
            const labCodes = Object.keys(labUsage);
            const labDetails = await Lab.find({ code: { $in: labCodes } }).lean();
            const labDetailsMap = new Map(labDetails.map(lab => [lab.code, lab]));

            // Format lab usage data
            const labUsageArray = Object.values(labUsage).map((usage: any) => {
                const labDetail = labDetailsMap.get(usage.courseId);
                return {
                    courseId: usage.courseId,
                    labTitle: labDetail?.title || 'Unknown',
                    topic: labDetail?.topic || 'Unknown',
                    provider: labDetail?.provider || 'Unknown',
                    totalPurchases: usage.totalPurchases,
                    uniqueUsers: usage.uniqueUsers.size,
                    totalLaunches: usage.totalLaunches,
                    totalTimeSpent: Math.round(usage.totalTimeSpent / 60 * 10) / 10,
                    totalTimeSpentMinutes: usage.totalTimeSpent,
                    activeSessions: usage.activeSessions,
                    averageLaunchesPerUser: usage.uniqueUsers.size > 0
                        ? Math.round(usage.totalLaunches / usage.uniqueUsers.size * 10) / 10
                        : 0,
                    averageTimePerUser: usage.uniqueUsers.size > 0
                        ? Math.round(usage.totalTimeSpent / usage.uniqueUsers.size)
                        : 0,
                };
            });

            // Sort by total launches
            labUsageArray.sort((a, b) => b.totalLaunches - a.totalLaunches);

            // Calculate peak usage times (by hour)
            const hourlyUsage = new Array(24).fill(0);
            users.forEach(user => {
                const labs = user.purchasedLabs || [];
                labs.forEach((lab: any) => {
                    if (lab.launchHistory && lab.launchHistory.length > 0) {
                        lab.launchHistory.forEach((launch: any) => {
                            const hour = new Date(launch.launchedAt).getHours();
                            hourlyUsage[hour]++;
                        });
                    }
                });
            });

            const peakHours = hourlyUsage
                .map((count, hour) => ({ hour, count }))
                .sort((a, b) => b.count - a.count)
                .slice(0, 5);

            const analytics = {
                summary: {
                    totalLabs: labUsageArray.length,
                    totalLaunches,
                    totalTimeSpent: Math.round(totalTimeSpent / 60 * 10) / 10,
                    totalTimeSpentMinutes: totalTimeSpent,
                    totalActiveSessions,
                    averageTimePerLaunch: totalLaunches > 0
                        ? Math.round(totalTimeSpent / totalLaunches)
                        : 0,
                },
                topLabs: {
                    byLaunches: labUsageArray.slice(0, 10),
                    byTimeSpent: [...labUsageArray]
                        .sort((a, b) => b.totalTimeSpent - a.totalTimeSpent)
                        .slice(0, 10),
                    byUsers: [...labUsageArray]
                        .sort((a, b) => b.uniqueUsers - a.uniqueUsers)
                        .slice(0, 10),
                },
                peakUsageTimes: peakHours.map(({ hour, count }) => ({
                    hour: `${hour}:00`,
                    launches: count,
                })),
                allLabs: labUsageArray,
            };

            return createApiResponse(analytics);
        } catch (error: any) {
            if (error.name === 'ApiError') {
                throw error;
            }
            console.error('[Analytics API] Usage error:', error);
            throw Errors.databaseError('Failed to fetch usage analytics');
        }
    },
    { requiredScope: 'admin:all' }
);
