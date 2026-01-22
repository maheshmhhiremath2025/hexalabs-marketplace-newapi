import { NextRequest, NextResponse } from 'next/server';
import { withAuth } from '@/lib/with-auth';

/**
 * Example protected API route with authentication and rate limiting
 * 
 * GET /api/v1/example
 */
export const GET = withAuth(
    async (request, auth) => {
        // User is authenticated and rate limit checked
        // auth contains: userId, organizationId, scopes, tier, authMethod

        return NextResponse.json({
            message: 'Hello from protected route!',
            user: {
                id: auth.userId,
                organizationId: auth.organizationId,
                tier: auth.tier,
                authMethod: auth.authMethod,
            },
            scopes: auth.scopes,
        });
    },
    {
        requiredScope: 'labs:read', // Optional: require specific scope
        skipRateLimit: false, // Optional: skip rate limiting
    }
);

/**
 * Example POST endpoint with write scope
 */
export const POST = withAuth(
    async (request, auth) => {
        const body = await request.json();

        // Process the request
        // User has 'labs:write' scope

        return NextResponse.json({
            success: true,
            message: 'Resource created',
            data: body,
        });
    },
    {
        requiredScope: 'labs:write',
    }
);
