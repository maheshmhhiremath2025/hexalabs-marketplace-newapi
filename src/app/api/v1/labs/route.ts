import { NextRequest } from 'next/server';
import { withAuth, withPublic } from '@/lib/with-auth';
import { createApiResponse, createPaginatedResponse } from '@/lib/api-response';
import { Errors } from '@/lib/api-errors';
import dbConnect from '@/lib/db';
import Lab from '@/models/Lab';
import { withCache, generateCacheKey, CachePrefix, CacheTTL } from '@/lib/cache';

/**
 * GET /api/v1/labs
 * List all labs with filtering and pagination
 * Public endpoint (no authentication required)
 */
export const GET = withPublic(async (request: NextRequest) => {
    await dbConnect();

    const { searchParams } = new URL(request.url);

    // Pagination
    const page = parseInt(searchParams.get('page') || '1');
    const limit = Math.min(parseInt(searchParams.get('limit') || '20'), 100);
    const skip = (page - 1) * limit;

    // Filters
    const topic = searchParams.get('topic');
    const provider = searchParams.get('provider');
    const difficulty = searchParams.get('difficulty');
    const search = searchParams.get('search');
    const minPrice = searchParams.get('minPrice');
    const maxPrice = searchParams.get('maxPrice');

    // Sorting
    const sortBy = searchParams.get('sortBy') || 'createdAt';
    const order = searchParams.get('order') === 'asc' ? 1 : -1;

    // Build query
    const query: any = {};

    if (topic) {
        query.topic = topic;
    }

    if (provider) {
        query.provider = provider;
    }

    if (difficulty) {
        query.difficulty = difficulty;
    }

    if (search) {
        query.$or = [
            { title: { $regex: search, $options: 'i' } },
            { description: { $regex: search, $options: 'i' } },
            { code: { $regex: search, $options: 'i' } },
        ];
    }

    if (minPrice || maxPrice) {
        query.price = {};
        if (minPrice) query.price.$gte = parseFloat(minPrice);
        if (maxPrice) query.price.$lte = parseFloat(maxPrice);
    }

    try {
        // Generate cache key based on query parameters
        const cacheKey = generateCacheKey(
            CachePrefix.LABS_LIST,
            page,
            limit,
            topic || 'all',
            provider || 'all',
            difficulty || 'all',
            search || 'none',
            minPrice || '0',
            maxPrice || '999999',
            sortBy,
            order
        );

        // Use cache wrapper
        const result = await withCache(cacheKey, CacheTTL.MEDIUM, async () => {
            // Get total count
            const total = await Lab.countDocuments(query);

            // Get labs
            const labs = await Lab.find(query)
                .sort({ [sortBy]: order })
                .skip(skip)
                .limit(limit)
                .lean();

            return { labs, total };
        });

        return createPaginatedResponse(result.labs, page, limit, result.total);
    } catch (error: any) {
        console.error('[Labs API] List error:', error);
        throw Errors.databaseError('Failed to fetch labs');
    }
});
