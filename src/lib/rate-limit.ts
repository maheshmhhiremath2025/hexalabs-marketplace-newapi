import { NextRequest, NextResponse } from 'next/server';
import { incrementRateLimit, isRedisAvailable } from './redis';

// Rate limit tiers (requests per hour and per day)
export const RATE_LIMITS = {
    free: {
        requestsPerHour: 100,
        requestsPerDay: 1000,
    },
    basic: {
        requestsPerHour: 1000,
        requestsPerDay: 10000,
    },
    premium: {
        requestsPerHour: 10000,
        requestsPerDay: 100000,
    },
    enterprise: {
        requestsPerHour: 100000,
        requestsPerDay: 1000000,
    },
};

export interface RateLimitResult {
    allowed: boolean;
    limit: number;
    remaining: number;
    reset: number; // Unix timestamp
    retryAfter?: number; // Seconds until reset
}

/**
 * Check rate limit for a user/API key
 */
export async function checkRateLimit(
    identifier: string, // userId or apiKey
    tier: string = 'free',
    customLimit?: { requestsPerHour: number; requestsPerDay: number }
): Promise<RateLimitResult> {
    // Get tier limits
    const tierLimits = customLimit || RATE_LIMITS[tier as keyof typeof RATE_LIMITS] || RATE_LIMITS.free;

    // Check if Redis is available
    const redisAvailable = await isRedisAvailable();

    if (!redisAvailable) {
        // Redis not available, allow all requests
        console.warn('[Rate Limit] Redis unavailable, allowing request');
        return {
            allowed: true,
            limit: tierLimits.requestsPerHour,
            remaining: tierLimits.requestsPerHour - 1,
            reset: Date.now() + 3600 * 1000,
        };
    }

    // Check hourly limit
    const hourlyKey = `ratelimit:${identifier}:hour:${getCurrentHour()}`;
    const hourlyResult = await incrementRateLimit(hourlyKey, 3600); // 1 hour

    if (hourlyResult.count > tierLimits.requestsPerHour) {
        return {
            allowed: false,
            limit: tierLimits.requestsPerHour,
            remaining: 0,
            reset: Date.now() + hourlyResult.ttl * 1000,
            retryAfter: hourlyResult.ttl,
        };
    }

    // Check daily limit
    const dailyKey = `ratelimit:${identifier}:day:${getCurrentDay()}`;
    const dailyResult = await incrementRateLimit(dailyKey, 86400); // 24 hours

    if (dailyResult.count > tierLimits.requestsPerDay) {
        return {
            allowed: false,
            limit: tierLimits.requestsPerDay,
            remaining: 0,
            reset: Date.now() + dailyResult.ttl * 1000,
            retryAfter: dailyResult.ttl,
        };
    }

    // Calculate remaining (use the more restrictive limit)
    const hourlyRemaining = tierLimits.requestsPerHour - hourlyResult.count;
    const dailyRemaining = tierLimits.requestsPerDay - dailyResult.count;
    const remaining = Math.min(hourlyRemaining, dailyRemaining);

    return {
        allowed: true,
        limit: tierLimits.requestsPerHour,
        remaining: Math.max(0, remaining),
        reset: Date.now() + hourlyResult.ttl * 1000,
    };
}

/**
 * Rate limit middleware for API routes
 */
export async function rateLimitMiddleware(
    request: NextRequest,
    identifier: string,
    tier: string = 'free',
    customLimit?: { requestsPerHour: number; requestsPerDay: number }
): Promise<NextResponse | null> {
    const result = await checkRateLimit(identifier, tier, customLimit);

    // Add rate limit headers
    const headers = {
        'X-RateLimit-Limit': result.limit.toString(),
        'X-RateLimit-Remaining': result.remaining.toString(),
        'X-RateLimit-Reset': result.reset.toString(),
    };

    if (!result.allowed) {
        // Rate limit exceeded
        return NextResponse.json(
            {
                error: 'Rate limit exceeded',
                message: `You have exceeded your ${tier} tier rate limit`,
                limit: result.limit,
                remaining: 0,
                reset: result.reset,
                retryAfter: result.retryAfter,
            },
            {
                status: 429,
                headers: {
                    ...headers,
                    'Retry-After': result.retryAfter?.toString() || '3600',
                },
            }
        );
    }

    // Request allowed, return null (no error response)
    // Caller should add headers to their response
    return null;
}

/**
 * Add rate limit headers to a response
 */
export function addRateLimitHeaders(
    response: NextResponse,
    result: RateLimitResult
): NextResponse {
    response.headers.set('X-RateLimit-Limit', result.limit.toString());
    response.headers.set('X-RateLimit-Remaining', result.remaining.toString());
    response.headers.set('X-RateLimit-Reset', result.reset.toString());

    if (!result.allowed && result.retryAfter) {
        response.headers.set('Retry-After', result.retryAfter.toString());
    }

    return response;
}

/**
 * Helper to get current hour key
 */
function getCurrentHour(): string {
    const now = new Date();
    return `${now.getUTCFullYear()}-${pad(now.getUTCMonth() + 1)}-${pad(now.getUTCDate())}-${pad(now.getUTCHours())}`;
}

/**
 * Helper to get current day key
 */
function getCurrentDay(): string {
    const now = new Date();
    return `${now.getUTCFullYear()}-${pad(now.getUTCMonth() + 1)}-${pad(now.getUTCDate())}`;
}

/**
 * Pad number with leading zero
 */
function pad(num: number): string {
    return num.toString().padStart(2, '0');
}

/**
 * Get rate limit info without incrementing
 */
export async function getRateLimitInfo(
    identifier: string,
    tier: string = 'free'
): Promise<RateLimitResult> {
    const tierLimits = RATE_LIMITS[tier as keyof typeof RATE_LIMITS] || RATE_LIMITS.free;

    // This is a simplified version - in production you'd query Redis
    return {
        allowed: true,
        limit: tierLimits.requestsPerHour,
        remaining: tierLimits.requestsPerHour,
        reset: Date.now() + 3600 * 1000,
    };
}
