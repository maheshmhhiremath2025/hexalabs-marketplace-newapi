import { NextRequest, NextResponse } from 'next/server';
import { extractBearerToken, validateJWT, hasJWTScope, JWTPayload } from '@/lib/jwt';

export interface JWTAuthResult {
    authenticated: boolean;
    userId?: string;
    organizationId?: string;
    scopes?: string[];
    tier?: string;
    payload?: JWTPayload;
    error?: string;
}

/**
 * Middleware to validate JWT authentication
 * Use this in API routes that accept JWT tokens
 */
export async function validateJWTAuth(request: NextRequest): Promise<JWTAuthResult> {
    try {
        // Get token from Authorization header
        const authHeader = request.headers.get('authorization');
        const token = extractBearerToken(authHeader);

        if (!token) {
            return {
                authenticated: false,
                error: 'Missing or invalid Authorization header. Use: Authorization: Bearer <token>',
            };
        }

        // Validate JWT
        const validation = validateJWT(token);

        if (!validation.valid) {
            return {
                authenticated: false,
                error: validation.error,
            };
        }

        const payload = validation.payload!;

        return {
            authenticated: true,
            userId: payload.sub,
            organizationId: payload.org,
            scopes: payload.scopes,
            tier: payload.tier,
            payload,
        };
    } catch (error: any) {
        console.error('[JWT Auth] Validation error:', error);
        return {
            authenticated: false,
            error: 'Authentication failed',
        };
    }
}

/**
 * Check if authenticated user has required scope
 */
export function checkJWTScope(authResult: JWTAuthResult, requiredScope: string): boolean {
    if (!authResult.authenticated || !authResult.payload) {
        return false;
    }

    return hasJWTScope(authResult.payload, requiredScope);
}

/**
 * Create an unauthorized response for JWT
 */
export function jwtUnauthorizedResponse(message: string = 'Unauthorized') {
    return NextResponse.json(
        {
            error: message,
            code: 'UNAUTHORIZED',
        },
        {
            status: 401,
            headers: {
                'WWW-Authenticate': 'Bearer realm="Hexalabs API"',
            },
        }
    );
}

/**
 * Create a forbidden response for JWT
 */
export function jwtForbiddenResponse(message: string = 'Insufficient permissions') {
    return NextResponse.json(
        {
            error: message,
            code: 'FORBIDDEN',
        },
        { status: 403 }
    );
}

/**
 * Helper function to wrap API routes with JWT authentication
 */
export function withJWTAuth(
    handler: (request: NextRequest, auth: JWTAuthResult, ...args: any[]) => Promise<NextResponse>,
    requiredScope?: string
) {
    return async (request: NextRequest, ...args: any[]) => {
        // Validate JWT
        const auth = await validateJWTAuth(request);

        if (!auth.authenticated) {
            return jwtUnauthorizedResponse(auth.error);
        }

        // Check scope if required
        if (requiredScope && !checkJWTScope(auth, requiredScope)) {
            return jwtForbiddenResponse(`Missing required scope: ${requiredScope}`);
        }

        // Call the actual handler
        return handler(request, auth, ...args);
    };
}
