import { NextResponse } from 'next/server';

/**
 * Standard API response format
 */
export interface ApiResponse<T = any> {
    success: boolean;
    data?: T;
    error?: string;
    message?: string;
    meta?: {
        page?: number;
        limit?: number;
        total?: number;
        pages?: number;
    };
    timestamp: string;
}

/**
 * Create success response
 */
export function successResponse<T>(
    data: T,
    message?: string,
    meta?: ApiResponse['meta']
): ApiResponse<T> {
    return {
        success: true,
        data,
        message,
        meta,
        timestamp: new Date().toISOString(),
    };
}

/**
 * Create error response
 */
export function errorResponse(
    error: string,
    message?: string
): ApiResponse {
    return {
        success: false,
        error,
        message,
        timestamp: new Date().toISOString(),
    };
}

/**
 * Create paginated response
 */
export function paginatedResponse<T>(
    data: T[],
    page: number,
    limit: number,
    total: number
): ApiResponse<T[]> {
    return {
        success: true,
        data,
        meta: {
            page,
            limit,
            total,
            pages: Math.ceil(total / limit),
        },
        timestamp: new Date().toISOString(),
    };
}

/**
 * Create NextResponse with standard format
 */
export function createApiResponse<T>(
    data: T,
    status: number = 200,
    message?: string,
    meta?: ApiResponse['meta']
): NextResponse {
    return NextResponse.json(
        successResponse(data, message, meta),
        { status }
    );
}

/**
 * Create error NextResponse
 */
export function createErrorResponse(
    error: string,
    status: number = 500,
    message?: string
): NextResponse {
    return NextResponse.json(
        errorResponse(error, message),
        { status }
    );
}

/**
 * Create paginated NextResponse
 */
export function createPaginatedResponse<T>(
    data: T[],
    page: number,
    limit: number,
    total: number,
    status: number = 200
): NextResponse {
    return NextResponse.json(
        paginatedResponse(data, page, limit, total),
        { status }
    );
}
