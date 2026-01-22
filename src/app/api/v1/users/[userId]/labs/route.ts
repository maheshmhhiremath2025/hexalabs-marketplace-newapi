import { NextRequest } from 'next/server';
import { withAuth } from '@/lib/with-auth';
import { createPaginatedResponse } from '@/lib/api-response';
import { Errors } from '@/lib/api-errors';
import dbConnect from '@/lib/db';
import User from '@/models/User';
import Lab from '@/models/Lab';

/**
 * GET /api/v1/users/:userId/labs
 * Get user's purchased labs
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
            throw Errors.forbidden('You can only view your own labs');
        }

        // Pagination
        const page = parseInt(searchParams.get('page') || '1');
        const limit = Math.min(parseInt(searchParams.get('limit') || '20'), 100);
        const skip = (page - 1) * limit;

        // Filter
        const status = searchParams.get('status'); // active, expired, all

        try {
            const user = await User.findById(userId);

            if (!user) {
                throw Errors.notFound('User not found');
            }

            let purchasedLabs = user.purchasedLabs || [];

            // Filter by status
            if (status === 'active') {
                purchasedLabs = purchasedLabs.filter((lab: any) =>
                    lab.accessExpiresAt && new Date(lab.accessExpiresAt) > new Date()
                );
            } else if (status === 'expired') {
                purchasedLabs = purchasedLabs.filter((lab: any) =>
                    lab.accessExpiresAt && new Date(lab.accessExpiresAt) <= new Date()
                );
            }

            const total = purchasedLabs.length;

            // Paginate
            const paginatedLabs = purchasedLabs.slice(skip, skip + limit);

            // Get lab details for each purchased lab
            const labCodes = paginatedLabs.map((lab: any) => lab.courseId);
            const labDetails = await Lab.find({ code: { $in: labCodes } }).lean();

            const labDetailsMap = new Map(labDetails.map(lab => [lab.code, lab]));

            // Format response
            const formattedLabs = paginatedLabs.map((purchasedLab: any) => {
                const labDetail = labDetailsMap.get(purchasedLab.courseId);
                const now = new Date();
                const isExpired = purchasedLab.accessExpiresAt && new Date(purchasedLab.accessExpiresAt) <= now;

                return {
                    id: purchasedLab._id,
                    courseId: purchasedLab.courseId,
                    labDetails: labDetail ? {
                        title: labDetail.title,
                        code: labDetail.code,
                        topic: labDetail.topic,
                        provider: labDetail.provider,
                        difficulty: labDetail.difficulty,
                    } : null,
                    purchaseDate: purchasedLab.purchaseDate,
                    accessExpiresAt: purchasedLab.accessExpiresAt,
                    isExpired,
                    daysRemaining: !isExpired && purchasedLab.accessExpiresAt
                        ? Math.ceil((new Date(purchasedLab.accessExpiresAt).getTime() - now.getTime()) / (1000 * 60 * 60 * 24))
                        : 0,
                    launchCount: purchasedLab.launchCount,
                    maxLaunches: purchasedLab.maxLaunches,
                    remainingLaunches: purchasedLab.maxLaunches - purchasedLab.launchCount,
                    totalTimeSpent: purchasedLab.totalTimeSpent || 0,
                    lastAccessedAt: purchasedLab.lastAccessedAt,
                    hasActiveSession: purchasedLab.activeSession?.status === 'active',
                    sessionExpiresAt: purchasedLab.activeSession?.status === 'active'
                        ? purchasedLab.activeSession.expiresAt
                        : null,
                    taskProgress: {
                        completedTasks: purchasedLab.taskProgress?.completedTasks?.length || 0,
                        currentTaskIndex: purchasedLab.taskProgress?.currentTaskIndex || 0,
                    },
                };
            });

            return createPaginatedResponse(formattedLabs, page, limit, total);
        } catch (error: any) {
            if (error.name === 'ApiError') {
                throw error;
            }
            console.error('[Users API] Get labs error:', error);
            throw Errors.databaseError('Failed to fetch user labs');
        }
    },
    { requiredScope: 'users:read' }
);
