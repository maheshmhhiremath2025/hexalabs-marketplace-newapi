import { NextRequest } from 'next/server';
import { withAuth } from '@/lib/with-auth';
import { createApiResponse } from '@/lib/api-response';
import { Errors } from '@/lib/api-errors';
import dbConnect from '@/lib/db';
import { search } from '@/lib/search';

/**
 * GET /api/v1/search
 * Universal search endpoint
 */
export const GET = withAuth(
    async (request: NextRequest, auth) => {
        await dbConnect();

        const { searchParams } = new URL(request.url);

        const query = searchParams.get('q') || searchParams.get('query');
        const types = searchParams.get('types')?.split(',') as any;
        const limit = parseInt(searchParams.get('limit') || '10');

        if (!query) {
            throw Errors.validationError('Search query is required', { field: 'q' });
        }

        if (query.length < 2) {
            throw Errors.validationError('Search query must be at least 2 characters', { field: 'q' });
        }

        try {
            const results = await search({
                query,
                types,
                limit: Math.min(limit, 50),
            });

            return createApiResponse(results);
        } catch (error: any) {
            if (error.name === 'ApiError') {
                throw error;
            }
            console.error('[Search API] Error:', error);
            throw Errors.databaseError('Search failed');
        }
    },
    { requiredScope: 'read' }
);
