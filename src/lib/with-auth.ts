import { NextRequest, NextResponse } from 'next/server';
import { validateAuth, UnifiedAuthResult } from './unified-auth';
import { checkRateLimit, addRateLimitHeaders } from './rate-limit';
import { addCorsHeaders } from './cors';
import { handleApiError, ApiError } from './api-errors';
import { generateRequestId, createRequestLogger, logToConsole } from './request-logger';

export interface MiddlewareOptions {
    requiredScope?: string;
    skipRateLimit?: boolean;
    skipAuth?: boolean;
    skipCors?: boolean;
    skipLogging?: boolean;
}

/**
 * Comprehensive middleware wrapper for API routes
 * Includes: Authentication, Rate Limiting, CORS, Error Handling, Logging
 */
export function withMiddleware(
    handler: (request: NextRequest, auth?: UnifiedAuthResult) => Promise<NextResponse>,
    options: MiddlewareOptions = {}
) {
    return async (request: NextRequest, ...args: any[]) => {
        const requestId = generateRequestId();
        const logger = createRequestLogger();
        const startTime = Date.now();

        let auth: UnifiedAuthResult | undefined;
        let statusCode = 200;
        let error: Error | undefined;
        let rateLimitHit = false;

        try {
            // 1. Authentication (unless skipped)
            if (!options.skipAuth) {
                auth = await validateAuth(request);

                if (!auth.authenticated) {
                    statusCode = 401;
                    throw new ApiError(
                        'UNAUTHORIZED' as any,
                        auth.error || 'Unauthorized',
                        401
                    );
                }

                // Check required scope
                if (options.requiredScope && auth.scopes) {
                    const hasScope = auth.scopes.includes(options.requiredScope) ||
                        auth.scopes.includes('admin:all');

                    if (!hasScope) {
                        statusCode = 403;
                        throw new ApiError(
                            'FORBIDDEN' as any,
                            `Missing required scope: ${options.requiredScope}`,
                            403
                        );
                    }
                }
            }

            // 2. Rate Limiting (unless skipped)
            if (!options.skipRateLimit && auth) {
                const identifier = auth.userId || 'unknown';
                const tier = auth.tier || 'free';

                const rateLimitResult = await checkRateLimit(identifier, tier);

                if (!rateLimitResult.allowed) {
                    statusCode = 429;
                    rateLimitHit = true;

                    const response = NextResponse.json(
                        {
                            error: 'Rate limit exceeded',
                            message: `You have exceeded your ${tier} tier rate limit`,
                            limit: rateLimitResult.limit,
                            remaining: 0,
                            reset: rateLimitResult.reset,
                            retryAfter: rateLimitResult.retryAfter,
                        },
                        {
                            status: 429,
                            headers: {
                                'X-RateLimit-Limit': rateLimitResult.limit.toString(),
                                'X-RateLimit-Remaining': '0',
                                'X-RateLimit-Reset': rateLimitResult.reset.toString(),
                                'Retry-After': rateLimitResult.retryAfter?.toString() || '3600',
                            },
                        }
                    );

                    // Add CORS headers
                    if (!options.skipCors) {
                        const origin = request.headers.get('origin');
                        addCorsHeaders(response, origin);
                    }

                    // Log request
                    if (!options.skipLogging) {
                        const responseTime = Date.now() - startTime;
                        logger.endAsync(requestId, request, 429, {
                            userId: auth.userId,
                            apiKey: auth.authMethod === 'api-key' ? 'hidden' : undefined,
                            authMethod: auth.authMethod,
                        }, undefined, true);
                        logToConsole(request.method, new URL(request.url).pathname, 429, responseTime, auth.userId);
                    }

                    return response;
                }

                // Store rate limit result for adding headers later
                (auth as any).rateLimit = rateLimitResult;
            }

            // 3. Execute handler
            const response = await handler(request, auth, ...args);
            statusCode = response.status;

            // 4. Add CORS headers (unless skipped)
            if (!options.skipCors) {
                const origin = request.headers.get('origin');
                addCorsHeaders(response, origin);
            }

            // 5. Add rate limit headers
            if (!options.skipRateLimit && auth && (auth as any).rateLimit) {
                addRateLimitHeaders(response, (auth as any).rateLimit);
            }

            // 6. Log request (unless skipped)
            if (!options.skipLogging) {
                const responseTime = Date.now() - startTime;
                logger.endAsync(requestId, request, statusCode, {
                    userId: auth?.userId,
                    apiKey: auth?.authMethod === 'api-key' ? 'hidden' : undefined,
                    authMethod: auth?.authMethod || 'none',
                });
                logToConsole(request.method, new URL(request.url).pathname, statusCode, responseTime, auth?.userId);
            }

            return response;

        } catch (err: any) {
            error = err;
            statusCode = err.statusCode || 500;

            // Handle error
            const errorResponse = handleApiError(err, new URL(request.url).pathname);

            // Add CORS headers
            if (!options.skipCors) {
                const origin = request.headers.get('origin');
                addCorsHeaders(errorResponse, origin);
            }

            // Log error
            if (!options.skipLogging) {
                const responseTime = Date.now() - startTime;
                logger.endAsync(requestId, request, statusCode, {
                    userId: auth?.userId,
                    apiKey: auth?.authMethod === 'api-key' ? 'hidden' : undefined,
                    authMethod: auth?.authMethod || 'none',
                }, error, rateLimitHit);
                logToConsole(request.method, new URL(request.url).pathname, statusCode, responseTime, auth?.userId);
            }

            return errorResponse;
        }
    };
}

/**
 * Alias for withMiddleware with authentication required
 */
export const withAuth = withMiddleware;

/**
 * Public endpoint (no authentication required)
 */
export function withPublic(
    handler: (request: NextRequest) => Promise<NextResponse>
) {
    return withMiddleware(handler, { skipAuth: true });
}

/**
 * Simple wrapper with just error handling and logging
 */
export function withBasic(
    handler: (request: NextRequest) => Promise<NextResponse>
) {
    return withMiddleware(handler, {
        skipAuth: true,
        skipRateLimit: true
    });
}
