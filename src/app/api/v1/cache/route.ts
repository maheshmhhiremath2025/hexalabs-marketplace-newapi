import { NextRequest } from 'next/server';
import { withAuth } from '@/lib/with-auth';
import { createApiResponse } from '@/lib/api-response';
import { Errors } from '@/lib/api-errors';
import dbConnect from '@/lib/db';
import { getCacheStats, clearAllCache } from '@/lib/cache';

/**
 * GET /api/v1/cache/stats
 * Get cache statistics (admin only)
 */
export const GET = withAuth(
    async (request: NextRequest, auth) => {
        await dbConnect();

        // Admin only
        if (!auth?.scopes?.includes('admin:all')) {
            throw Errors.forbidden('Admin access required for cache stats');
        }

        try {
            const stats = await getCacheStats();

            if (!stats) {
                return createApiResponse({
                    enabled: false,
                    message: 'Redis caching is not enabled',
                });
            }

            return createApiResponse({
                enabled: true,
                ...stats,
            });
        } catch (error: any) {
            console.error('[Cache API] Stats error:', error);
            throw Errors.databaseError('Failed to fetch cache stats');
        }
    },
    { requiredScope: 'admin:all' }
);

/**
 * DELETE /api/v1/cache
 * Clear all cache (admin only)
 */
export const DELETE = withAuth(
    async (request: NextRequest, auth) => {
        await dbConnect();

        // Admin only
        if (!auth?.scopes?.includes('admin:all')) {
            throw Errors.forbidden('Admin access required to clear cache');
        }

        try {
            const success = await clearAllCache();

            if (!success) {
                throw Errors.internalError('Failed to clear cache');
            }

            return createApiResponse(
                { message: 'Cache cleared successfully' },
                200
            );
        } catch (error: any) {
            if (error.name === 'ApiError') {
                throw error;
            }
            console.error('[Cache API] Clear error:', error);
            throw Errors.databaseError('Failed to clear cache');
        }
    },
    { requiredScope: 'admin:all' }
);
