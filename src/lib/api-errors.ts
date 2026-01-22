import { NextResponse } from 'next/server';

/**
 * Standard API error codes
 */
export enum ApiErrorCode {
    // Authentication errors (401)
    UNAUTHORIZED = 'UNAUTHORIZED',
    INVALID_CREDENTIALS = 'INVALID_CREDENTIALS',
    TOKEN_EXPIRED = 'TOKEN_EXPIRED',
    INVALID_TOKEN = 'INVALID_TOKEN',

    // Authorization errors (403)
    FORBIDDEN = 'FORBIDDEN',
    INSUFFICIENT_PERMISSIONS = 'INSUFFICIENT_PERMISSIONS',
    CORS_ERROR = 'CORS_ERROR',

    // Client errors (400)
    BAD_REQUEST = 'BAD_REQUEST',
    VALIDATION_ERROR = 'VALIDATION_ERROR',
    MISSING_REQUIRED_FIELD = 'MISSING_REQUIRED_FIELD',
    INVALID_INPUT = 'INVALID_INPUT',

    // Resource errors (404)
    NOT_FOUND = 'NOT_FOUND',
    RESOURCE_NOT_FOUND = 'RESOURCE_NOT_FOUND',

    // Rate limiting (429)
    RATE_LIMIT_EXCEEDED = 'RATE_LIMIT_EXCEEDED',

    // Server errors (500)
    INTERNAL_SERVER_ERROR = 'INTERNAL_SERVER_ERROR',
    DATABASE_ERROR = 'DATABASE_ERROR',
    EXTERNAL_SERVICE_ERROR = 'EXTERNAL_SERVICE_ERROR',

    // Conflict (409)
    CONFLICT = 'CONFLICT',
    DUPLICATE_RESOURCE = 'DUPLICATE_RESOURCE',
}

/**
 * API Error class
 */
export class ApiError extends Error {
    constructor(
        public code: ApiErrorCode,
        public message: string,
        public statusCode: number = 500,
        public details?: any
    ) {
        super(message);
        this.name = 'ApiError';
    }
}

/**
 * Standard error response format
 */
export interface ErrorResponse {
    error: string;
    code: string;
    message?: string;
    details?: any;
    timestamp: string;
    path?: string;
}

/**
 * Create standardized error response
 */
export function createErrorResponse(
    error: ApiError | Error,
    path?: string
): ErrorResponse {
    if (error instanceof ApiError) {
        return {
            error: error.message,
            code: error.code,
            details: error.details,
            timestamp: new Date().toISOString(),
            path,
        };
    }

    // Generic error
    return {
        error: error.message || 'An unexpected error occurred',
        code: ApiErrorCode.INTERNAL_SERVER_ERROR,
        timestamp: new Date().toISOString(),
        path,
    };
}

/**
 * Handle API errors and return appropriate response
 */
export function handleApiError(
    error: ApiError | Error,
    path?: string
): NextResponse {
    const statusCode = error instanceof ApiError ? error.statusCode : 500;
    const errorResponse = createErrorResponse(error, path);

    // Log error (in production, send to error tracking service)
    if (statusCode >= 500) {
        console.error('[API Error]', error);
    } else {
        console.warn('[API Error]', errorResponse);
    }

    return NextResponse.json(errorResponse, { status: statusCode });
}

/**
 * Common error creators
 */
export const Errors = {
    unauthorized(message: string = 'Unauthorized'): ApiError {
        return new ApiError(ApiErrorCode.UNAUTHORIZED, message, 401);
    },

    forbidden(message: string = 'Forbidden'): ApiError {
        return new ApiError(ApiErrorCode.FORBIDDEN, message, 403);
    },

    badRequest(message: string = 'Bad request', details?: any): ApiError {
        return new ApiError(ApiErrorCode.BAD_REQUEST, message, 400, details);
    },

    validationError(message: string, details?: any): ApiError {
        return new ApiError(ApiErrorCode.VALIDATION_ERROR, message, 400, details);
    },

    notFound(message: string = 'Resource not found'): ApiError {
        return new ApiError(ApiErrorCode.NOT_FOUND, message, 404);
    },

    conflict(message: string = 'Resource conflict'): ApiError {
        return new ApiError(ApiErrorCode.CONFLICT, message, 409);
    },

    rateLimitExceeded(message: string = 'Rate limit exceeded'): ApiError {
        return new ApiError(ApiErrorCode.RATE_LIMIT_EXCEEDED, message, 429);
    },

    internalError(message: string = 'Internal server error'): ApiError {
        return new ApiError(ApiErrorCode.INTERNAL_SERVER_ERROR, message, 500);
    },

    databaseError(message: string = 'Database error'): ApiError {
        return new ApiError(ApiErrorCode.DATABASE_ERROR, message, 500);
    },
};

/**
 * Try-catch wrapper for API routes
 */
export function withErrorHandling<T extends any[], R>(
    handler: (...args: T) => Promise<R>
) {
    return async (...args: T): Promise<R | NextResponse> => {
        try {
            return await handler(...args);
        } catch (error: any) {
            return handleApiError(error);
        }
    };
}
