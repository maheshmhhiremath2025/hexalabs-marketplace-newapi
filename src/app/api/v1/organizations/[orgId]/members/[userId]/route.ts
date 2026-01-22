import { NextRequest } from 'next/server';
import { withAuth } from '@/lib/with-auth';
import { createApiResponse } from '@/lib/api-response';
import { Errors } from '@/lib/api-errors';
import dbConnect from '@/lib/db';
import User from '@/models/User';

/**
 * DELETE /api/v1/organizations/:orgId/members/:userId
 * Remove member from organization (admin only)
 */
export const DELETE = withAuth(
    async (request: NextRequest, auth) => {
        await dbConnect();

        const { orgId, userId } = context.params;

        if (!orgId || !userId) {
            throw Errors.badRequest('Organization ID and User ID are required');
        }

        // Admin only
        if (!auth?.scopes?.includes('admin:all')) {
            throw Errors.forbidden('Admin access required to remove members');
        }

        try {
            const user = await User.findById(userId);

            if (!user) {
                throw Errors.notFound('User not found');
            }

            // Check if user is member of this organization
            if (user.organizationId?.toString() !== orgId) {
                throw Errors.badRequest('User is not a member of this organization');
            }

            // Remove from organization
            user.organizationId = null as any;
            user.role = 'user'; // Reset to regular user
            await user.save();

            return createApiResponse(
                {
                    id: user._id,
                    name: user.name,
                    email: user.email,
                    message: 'Member removed from organization',
                },
                200
            );
        } catch (error: any) {
            if (error.name === 'ApiError') {
                throw error;
            }
            console.error('[Organizations API] Remove member error:', error);
            throw Errors.databaseError('Failed to remove member');
        }
    },
    { requiredScope: 'admin:all' }
);
