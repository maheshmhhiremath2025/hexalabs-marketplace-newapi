import { NextRequest } from 'next/server';
import { validateApiKeyAuth, ApiAuthResult } from './api-auth';
import { validateJWTAuth, JWTAuthResult } from './jwt-auth';

export type UnifiedAuthResult = (ApiAuthResult | JWTAuthResult) & {
    authMethod: 'api-key' | 'jwt';
};

/**
 * Unified authentication middleware
 * Supports both API Key and JWT authentication
 * Tries JWT first (Bearer token), then falls back to API key
 */
export async function validateAuth(request: NextRequest): Promise<UnifiedAuthResult> {
    // Check for JWT token first (Authorization: Bearer <token>)
    const authHeader = request.headers.get('authorization');

    if (authHeader && authHeader.startsWith('Bearer ') && !authHeader.includes(':')) {
        // This looks like a JWT token (no colon in the token)
        const jwtAuth = await validateJWTAuth(request);
        return {
            ...jwtAuth,
            authMethod: 'jwt',
        };
    }

    // Check for API key (either headers or Bearer apiKey:apiSecret)
    const apiKeyHeader = request.headers.get('x-api-key');
    const apiSecretHeader = request.headers.get('x-api-secret');

    if (apiKeyHeader || (authHeader && authHeader.includes(':'))) {
        const apiAuth = await validateApiKeyAuth(request);
        return {
            ...apiAuth,
            authMethod: 'api-key',
        };
    }

    // No valid authentication found
    return {
        authenticated: false,
        authMethod: 'api-key',
        error: 'No authentication provided. Use either JWT (Authorization: Bearer <token>) or API Key (x-api-key + x-api-secret headers)',
    };
}

/**
 * Helper to check if user has required scope (works with both auth methods)
 */
export function hasRequiredScope(auth: UnifiedAuthResult, requiredScope: string): boolean {
    if (!auth.authenticated || !auth.scopes) {
        return false;
    }

    return auth.scopes.includes(requiredScope) || auth.scopes.includes('admin:all');
}
