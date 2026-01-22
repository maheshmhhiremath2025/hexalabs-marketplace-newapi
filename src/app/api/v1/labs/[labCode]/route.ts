import { NextRequest } from 'next/server';
import { withPublic } from '@/lib/with-auth';
import { createApiResponse } from '@/lib/api-response';
import { Errors } from '@/lib/api-errors';
import dbConnect from '@/lib/db';
import Lab from '@/models/Lab';
import { withCache, generateCacheKey, CachePrefix, CacheTTL } from '@/lib/cache';

/**
 * GET /api/v1/labs/:labCode
 * Get lab details by code
 * Public endpoint
 */
export const GET = withPublic(
    async (request: NextRequest) => {
        await dbConnect();

        // Extract labCode from URL path
        const url = new URL(request.url);
        const pathParts = url.pathname.split('/');
        const labCode = pathParts[pathParts.length - 1];

        if (!labCode) {
            throw Errors.badRequest('Lab code is required');
        }

        try {
            const cacheKey = generateCacheKey(CachePrefix.LAB, labCode);

            const lab = await withCache(cacheKey, CacheTTL.LONG, async () => {
                return await Lab.findOne({ code: labCode }).lean();
            });

            if (!lab) {
                throw Errors.notFound(`Lab with code '${labCode}' not found`);
            }

            return createApiResponse(lab);
        } catch (error: any) {
            if (error.name === 'ApiError') {
                throw error;
            }
            console.error('[Labs API] Get lab error:', error);
            throw Errors.databaseError('Failed to fetch lab details');
        }
    }
);
