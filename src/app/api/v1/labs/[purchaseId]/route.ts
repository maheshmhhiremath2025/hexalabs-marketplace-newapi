import { NextRequest } from 'next/server';
import { withAuth } from '@/lib/with-auth';
import { createApiResponse } from '@/lib/api-response';
import { Errors } from '@/lib/api-errors';
import dbConnect from '@/lib/db';
import User from '@/models/User';

/**
 * GET /api/v1/labs/:purchaseId
 * Get purchased lab details
 */
export const GET = withAuth(
    async (request: NextRequest, auth, context: any) => {
        await dbConnect();

        const { purchaseId } = context.params;

        if (!purchaseId) {
            throw Errors.badRequest('Purchase ID is required');
        }

        const userId = auth?.userId;
        if (!userId) {
            throw Errors.unauthorized('User ID not found in authentication');
        }

        try {
            const user = await User.findById(userId);

            if (!user) {
                throw Errors.notFound('User not found');
            }

            const purchasedLab = user.purchasedLabs.id(purchaseId);

            if (!purchasedLab) {
                throw Errors.notFound('Purchased lab not found');
            }

            return createApiResponse({
                id: purchasedLab._id,
                courseId: purchasedLab.courseId,
                purchaseDate: purchasedLab.purchaseDate,
                accessExpiresAt: purchasedLab.accessExpiresAt,
                launchCount: purchasedLab.launchCount,
                maxLaunches: purchasedLab.maxLaunches,
                remainingLaunches: purchasedLab.maxLaunches - purchasedLab.launchCount,
                sessionDurationHours: purchasedLab.sessionDurationHours,
                totalTimeSpent: purchasedLab.totalTimeSpent,
                lastAccessedAt: purchasedLab.lastAccessedAt,
                activeSession: purchasedLab.activeSession?.status === 'active' ? {
                    status: purchasedLab.activeSession.status,
                    startTime: purchasedLab.activeSession.startTime,
                    expiresAt: purchasedLab.activeSession.expiresAt,
                } : null,
                taskProgress: purchasedLab.taskProgress,
                launchHistory: purchasedLab.launchHistory,
            });
        } catch (error: any) {
            if (error.name === 'ApiError') {
                throw error;
            }
            console.error('[Labs API] Get purchased lab error:', error);
            throw Errors.databaseError('Failed to fetch purchased lab details');
        }
    },
    { requiredScope: 'labs:read' }
);

/**
 * DELETE /api/v1/labs/:purchaseId
 * Delete/remove a purchased lab (admin only)
 */
export const DELETE = withAuth(
    async (request: NextRequest, auth, context: any) => {
        await dbConnect();

        const { purchaseId } = context.params;

        if (!purchaseId) {
            throw Errors.badRequest('Purchase ID is required');
        }

        const userId = auth?.userId;
        if (!userId) {
            throw Errors.unauthorized('User ID not found in authentication');
        }

        // Check if user has admin scope
        if (!auth?.scopes?.includes('admin:all')) {
            throw Errors.forbidden('Admin access required to delete purchased labs');
        }

        try {
            const user = await User.findById(userId);

            if (!user) {
                throw Errors.notFound('User not found');
            }

            const purchasedLab = user.purchasedLabs.id(purchaseId);

            if (!purchasedLab) {
                throw Errors.notFound('Purchased lab not found');
            }

            // Terminate active session if exists
            if (purchasedLab.activeSession && purchasedLab.activeSession.status === 'active') {
                purchasedLab.activeSession.status = 'terminated';
            }

            // Remove from purchasedLabs array
            user.purchasedLabs.pull(purchaseId);
            await user.save();

            return createApiResponse(
                {
                    message: 'Purchased lab deleted successfully',
                    deletedId: purchaseId,
                },
                200
            );
        } catch (error: any) {
            if (error.name === 'ApiError') {
                throw error;
            }
            console.error('[Labs API] Delete purchased lab error:', error);
            throw Errors.databaseError('Failed to delete purchased lab');
        }
    },
    { requiredScope: 'admin:all' }
);
