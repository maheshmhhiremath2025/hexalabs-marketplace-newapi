import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '@/lib/db';
import { validateApiKey, hasScope } from '@/lib/api-keys';

export interface ApiAuthResult {
    authenticated: boolean;
    userId?: string;
    organizationId?: string;
    scopes?: string[];
    tier?: string;
    rateLimit?: {
        requestsPerHour: number;
        requestsPerDay: number;
    };
    error?: string;
}

/**
 * Middleware to validate API key authentication
 * Use this in API routes that require API key authentication
 */
export async function validateApiKeyAuth(request: NextRequest): Promise<ApiAuthResult> {
    try {
        await dbConnect();

        // Get API key from headers
        const apiKey = request.headers.get('x-api-key');
        const apiSecret = request.headers.get('x-api-secret');

        // Also check Authorization header (Bearer token format)
        const authHeader = request.headers.get('authorization');
        let bearerApiKey: string | null = null;
        let bearerApiSecret: string | null = null;

        if (authHeader && authHeader.startsWith('Bearer ')) {
            // Format: Bearer apiKey:apiSecret
            const token = authHeader.substring(7);
            const [key, secret] = token.split(':');
            bearerApiKey = key;
            bearerApiSecret = secret;
        }

        // Use either header format
        const finalApiKey = apiKey || bearerApiKey;
        const finalApiSecret = apiSecret || bearerApiSecret;

        if (!finalApiKey || !finalApiSecret) {
            return {
                authenticated: false,
                error: 'Missing API credentials. Provide x-api-key and x-api-secret headers, or Authorization: Bearer apiKey:apiSecret',
            };
        }

        // Validate the API key
        const validation = await validateApiKey(finalApiKey, finalApiSecret);

        if (!validation.valid) {
            return {
                authenticated: false,
                error: validation.error,
            };
        }

        return {
            authenticated: true,
            userId: validation.userId?.toString(),
            organizationId: validation.organizationId?.toString(),
            scopes: validation.scopes,
            tier: validation.tier,
            rateLimit: validation.rateLimit,
        };
    } catch (error: any) {
        console.error('[API Auth] Validation error:', error);
        return {
            authenticated: false,
            error: 'Authentication failed',
        };
    }
}

/**
 * Check if authenticated user has required scope
 */
export function checkScope(authResult: ApiAuthResult, requiredScope: string): boolean {
    if (!authResult.authenticated || !authResult.scopes) {
        return false;
    }

    return hasScope(authResult.scopes, requiredScope);
}

/**
 * Create an unauthorized response
 */
export function unauthorizedResponse(message: string = 'Unauthorized') {
    return NextResponse.json(
        {
            error: message,
            code: 'UNAUTHORIZED',
        },
        {
            status: 401,
            headers: {
                'WWW-Authenticate': 'API-Key realm="Hexalabs API"',
            },
        }
    );
}

/**
 * Create a forbidden response
 */
export function forbiddenResponse(message: string = 'Insufficient permissions') {
    return NextResponse.json(
        {
            error: message,
            code: 'FORBIDDEN',
        },
        { status: 403 }
    );
}

/**
 * Helper function to wrap API routes with authentication
 */
export function withApiAuth(
    handler: (request: NextRequest, auth: ApiAuthResult, ...args: any[]) => Promise<NextResponse>,
    requiredScope?: string
) {
    return async (request: NextRequest, ...args: any[]) => {
        // Validate API key
        const auth = await validateApiKeyAuth(request);

        if (!auth.authenticated) {
            return unauthorizedResponse(auth.error);
        }

        // Check scope if required
        if (requiredScope && !checkScope(auth, requiredScope)) {
            return forbiddenResponse(`Missing required scope: ${requiredScope}`);
        }

        // Call the actual handler
        return handler(request, auth, ...args);
    };
}
