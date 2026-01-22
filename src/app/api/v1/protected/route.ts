import { NextRequest, NextResponse } from 'next/server';
import { withAuth, withPublic, withBasic } from '@/lib/with-auth';
import { createApiResponse, createPaginatedResponse } from '@/lib/api-response';
import { Errors } from '@/lib/api-errors';

/**
 * Protected endpoint with authentication and rate limiting
 * GET /api/v1/protected
 */
export const GET = withAuth(async (request, auth) => {
    // User is authenticated, rate limited, CORS handled, logged
    return createApiResponse({
        message: 'This is a protected endpoint',
        user: {
            id: auth?.userId,
            tier: auth?.tier,
            authMethod: auth?.authMethod,
        },
    });
});

/**
 * Protected endpoint with required scope
 * POST /api/v1/protected
 */
export const POST = withAuth(
    async (request, auth) => {
        const body = await request.json();

        // Validate input
        if (!body.name) {
            throw Errors.validationError('Name is required', {
                field: 'name',
                message: 'Name field is required',
            });
        }

        // Process request
        return createApiResponse(
            {
                id: '123',
                name: body.name,
                createdBy: auth?.userId,
            },
            201,
            'Resource created successfully'
        );
    },
    { requiredScope: 'labs:write' }
);

/**
 * Public endpoint (no authentication)
 * GET /api/v1/protected/public
 */
export async function OPTIONS(request: NextRequest) {
    // Handle CORS preflight
    return new NextResponse(null, {
        status: 204,
        headers: {
            'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
            'Access-Control-Allow-Headers': 'Content-Type, Authorization',
        },
    });
}

// Example of public endpoint
const publicHandler = withPublic(async (request) => {
    return createApiResponse({
        message: 'This is a public endpoint',
        timestamp: new Date().toISOString(),
    });
});

// Example of paginated response
const paginatedHandler = withAuth(async (request, auth) => {
    const url = new URL(request.url);
    const page = parseInt(url.searchParams.get('page') || '1');
    const limit = parseInt(url.searchParams.get('limit') || '20');

    // Fetch data (example)
    const data = Array.from({ length: limit }, (_, i) => ({
        id: i + 1,
        name: `Item ${i + 1}`,
    }));

    const total = 100; // Total count from database

    return createPaginatedResponse(data, page, limit, total);
});

// Example of error handling
const errorHandler = withAuth(async (request, auth) => {
    // Throw custom error
    throw Errors.notFound('Resource not found');
});
