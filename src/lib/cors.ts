import { NextResponse } from 'next/server';

/**
 * CORS configuration for API routes
 */
export const CORS_CONFIG = {
    // Allowed origins (customize for your needs)
    allowedOrigins: [
        'http://localhost:3000',
        'http://localhost:3001',
        'https://hexalabs.com',
        'https://www.hexalabs.com',
        'https://hexalabs.vercel.app',
        // Add your production domains here
    ],

    // Allowed methods
    allowedMethods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],

    // Allowed headers
    allowedHeaders: [
        'Content-Type',
        'Authorization',
        'X-API-Key',
        'X-API-Secret',
        'X-Requested-With',
    ],

    // Exposed headers (visible to client)
    exposedHeaders: [
        'X-RateLimit-Limit',
        'X-RateLimit-Remaining',
        'X-RateLimit-Reset',
        'Retry-After',
    ],

    // Allow credentials (cookies, authorization headers)
    credentials: true,

    // Preflight cache duration (seconds)
    maxAge: 86400, // 24 hours
};

/**
 * Check if origin is allowed
 */
export function isOriginAllowed(origin: string | null): boolean {
    if (!origin) return true; // Allow requests with no origin (e.g., mobile apps)

    // In development, allow all localhost origins
    if (process.env.NODE_ENV === 'development' && origin.includes('localhost')) {
        return true;
    }

    // Check against allowed origins
    return CORS_CONFIG.allowedOrigins.includes(origin);
}

/**
 * Add CORS headers to response
 */
export function addCorsHeaders(
    response: NextResponse,
    origin: string | null
): NextResponse {
    // Determine allowed origin
    const allowedOrigin = isOriginAllowed(origin) ? origin || '*' : CORS_CONFIG.allowedOrigins[0];

    // Add CORS headers
    response.headers.set('Access-Control-Allow-Origin', allowedOrigin);
    response.headers.set('Access-Control-Allow-Methods', CORS_CONFIG.allowedMethods.join(', '));
    response.headers.set('Access-Control-Allow-Headers', CORS_CONFIG.allowedHeaders.join(', '));
    response.headers.set('Access-Control-Expose-Headers', CORS_CONFIG.exposedHeaders.join(', '));

    if (CORS_CONFIG.credentials) {
        response.headers.set('Access-Control-Allow-Credentials', 'true');
    }

    response.headers.set('Access-Control-Max-Age', CORS_CONFIG.maxAge.toString());

    return response;
}

/**
 * Handle OPTIONS preflight request
 */
export function handlePreflight(origin: string | null): NextResponse {
    const response = new NextResponse(null, { status: 204 });
    return addCorsHeaders(response, origin);
}

/**
 * CORS middleware for API routes
 */
export function corsMiddleware(
    handler: (request: Request) => Promise<NextResponse>
) {
    return async (request: Request) => {
        const origin = request.headers.get('origin');

        // Handle preflight request
        if (request.method === 'OPTIONS') {
            return handlePreflight(origin);
        }

        // Check if origin is allowed
        if (origin && !isOriginAllowed(origin)) {
            return new NextResponse(
                JSON.stringify({
                    error: 'CORS policy: Origin not allowed',
                    code: 'CORS_ERROR',
                }),
                {
                    status: 403,
                    headers: {
                        'Content-Type': 'application/json',
                    },
                }
            );
        }

        // Execute handler
        const response = await handler(request);

        // Add CORS headers to response
        return addCorsHeaders(response, origin);
    };
}

/**
 * Create CORS response with headers
 */
export function createCorsResponse(
    data: any,
    status: number = 200,
    origin: string | null = null
): NextResponse {
    const response = NextResponse.json(data, { status });
    return addCorsHeaders(response, origin);
}
