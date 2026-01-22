import { NextRequest } from 'next/server';
import ApiLog from '@/models/ApiLog';
import dbConnect from '@/lib/db';

export interface RequestLogData {
    method: string;
    endpoint: string;
    path: string;
    userId?: string;
    apiKey?: string;
    authMethod?: 'api-key' | 'jwt' | 'none';
    ip?: string;
    userAgent?: string;
    statusCode: number;
    responseTime: number;
    error?: string;
    errorStack?: string;
    rateLimitHit?: boolean;
}

/**
 * Log API request to database
 */
export async function logRequest(data: RequestLogData): Promise<void> {
    try {
        await dbConnect();

        await ApiLog.create({
            ...data,
            timestamp: new Date(),
        });
    } catch (error: any) {
        // Don't throw error - logging should never break the app
        console.error('[Request Logger] Failed to log request:', error.message);
    }
}

/**
 * Log API request asynchronously (fire and forget)
 */
export function logRequestAsync(data: RequestLogData): void {
    // Run in background without awaiting
    logRequest(data).catch((error) => {
        console.error('[Request Logger] Async log failed:', error);
    });
}

/**
 * Extract request information for logging
 */
export function extractRequestInfo(request: NextRequest): {
    method: string;
    endpoint: string;
    path: string;
    ip: string;
    userAgent: string;
} {
    const url = new URL(request.url);

    return {
        method: request.method,
        endpoint: url.pathname,
        path: url.pathname + url.search,
        ip: request.headers.get('x-forwarded-for') ||
            request.headers.get('x-real-ip') ||
            'unknown',
        userAgent: request.headers.get('user-agent') || 'unknown',
    };
}

/**
 * Create request logger middleware
 */
export function createRequestLogger() {
    const startTimes = new Map<string, number>();

    return {
        /**
         * Start timing a request
         */
        start(requestId: string): void {
            startTimes.set(requestId, Date.now());
        },

        /**
         * End timing and log request
         */
        async end(
            requestId: string,
            request: NextRequest,
            statusCode: number,
            auth?: {
                userId?: string;
                apiKey?: string;
                authMethod?: 'api-key' | 'jwt' | 'none';
            },
            error?: Error,
            rateLimitHit?: boolean
        ): Promise<void> {
            const startTime = startTimes.get(requestId);
            const responseTime = startTime ? Date.now() - startTime : 0;

            startTimes.delete(requestId);

            const requestInfo = extractRequestInfo(request);

            await logRequest({
                ...requestInfo,
                userId: auth?.userId,
                apiKey: auth?.apiKey,
                authMethod: auth?.authMethod || 'none',
                statusCode,
                responseTime,
                error: error?.message,
                errorStack: error?.stack,
                rateLimitHit,
            });
        },

        /**
         * End timing and log request asynchronously
         */
        endAsync(
            requestId: string,
            request: NextRequest,
            statusCode: number,
            auth?: {
                userId?: string;
                apiKey?: string;
                authMethod?: 'api-key' | 'jwt' | 'none';
            },
            error?: Error,
            rateLimitHit?: boolean
        ): void {
            this.end(requestId, request, statusCode, auth, error, rateLimitHit).catch((err) => {
                console.error('[Request Logger] Failed to log:', err);
            });
        },
    };
}

/**
 * Generate unique request ID
 */
export function generateRequestId(): string {
    return `req_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
}

/**
 * Console logger for development
 */
export function logToConsole(
    method: string,
    path: string,
    statusCode: number,
    responseTime: number,
    userId?: string
): void {
    const statusColor = statusCode >= 500 ? '\x1b[31m' : // Red for 5xx
        statusCode >= 400 ? '\x1b[33m' : // Yellow for 4xx
            statusCode >= 300 ? '\x1b[36m' : // Cyan for 3xx
                '\x1b[32m'; // Green for 2xx

    const reset = '\x1b[0m';
    const gray = '\x1b[90m';

    console.log(
        `${gray}[API]${reset} ${method.padEnd(6)} ${path.padEnd(40)} ${statusColor}${statusCode}${reset} ${gray}${responseTime}ms${reset}${userId ? ` ${gray}user:${userId}${reset}` : ''}`
    );
}

export default createRequestLogger;
