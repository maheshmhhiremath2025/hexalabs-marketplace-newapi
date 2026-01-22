import jwt from 'jsonwebtoken';

// JWT configuration
const JWT_SECRET = process.env.JWT_SECRET || process.env.NEXTAUTH_SECRET || 'your-secret-key-change-in-production';
const JWT_EXPIRES_IN = '1h'; // 1 hour
const JWT_REFRESH_EXPIRES_IN = '7d'; // 7 days

export interface JWTPayload {
    sub: string; // userId
    org?: string; // organizationId
    scopes: string[];
    tier: string;
    type: 'access' | 'refresh';
    iat?: number;
    exp?: number;
}

/**
 * Generate JWT access token from API key validation
 */
export function generateAccessToken(params: {
    userId: string;
    organizationId?: string;
    scopes: string[];
    tier: string;
}): string {
    const { userId, organizationId, scopes, tier } = params;

    const payload: JWTPayload = {
        sub: userId,
        org: organizationId,
        scopes,
        tier,
        type: 'access',
    };

    return jwt.sign(payload, JWT_SECRET, {
        expiresIn: JWT_EXPIRES_IN,
        issuer: 'hexalabs-api',
        audience: 'hexalabs-api-users',
    });
}

/**
 * Generate JWT refresh token
 */
export function generateRefreshToken(params: {
    userId: string;
    organizationId?: string;
    scopes: string[];
    tier: string;
}): string {
    const { userId, organizationId, scopes, tier } = params;

    const payload: JWTPayload = {
        sub: userId,
        org: organizationId,
        scopes,
        tier,
        type: 'refresh',
    };

    return jwt.sign(payload, JWT_SECRET, {
        expiresIn: JWT_REFRESH_EXPIRES_IN,
        issuer: 'hexalabs-api',
        audience: 'hexalabs-api-users',
    });
}

/**
 * Generate both access and refresh tokens
 */
export function generateTokenPair(params: {
    userId: string;
    organizationId?: string;
    scopes: string[];
    tier: string;
}) {
    return {
        accessToken: generateAccessToken(params),
        refreshToken: generateRefreshToken(params),
        expiresIn: 3600, // 1 hour in seconds
        tokenType: 'Bearer',
    };
}

/**
 * Verify and decode JWT token
 */
export function verifyToken(token: string): JWTPayload | null {
    try {
        const decoded = jwt.verify(token, JWT_SECRET, {
            issuer: 'hexalabs-api',
            audience: 'hexalabs-api-users',
        }) as JWTPayload;

        return decoded;
    } catch (error: any) {
        console.error('[JWT] Token verification failed:', error.message);
        return null;
    }
}

/**
 * Decode JWT token without verification (for debugging)
 */
export function decodeToken(token: string): JWTPayload | null {
    try {
        return jwt.decode(token) as JWTPayload;
    } catch (error) {
        return null;
    }
}

/**
 * Check if token is expired
 */
export function isTokenExpired(token: string): boolean {
    const decoded = decodeToken(token);
    if (!decoded || !decoded.exp) return true;

    return Date.now() >= decoded.exp * 1000;
}

/**
 * Get token expiration time
 */
export function getTokenExpiration(token: string): Date | null {
    const decoded = decodeToken(token);
    if (!decoded || !decoded.exp) return null;

    return new Date(decoded.exp * 1000);
}

/**
 * Extract token from Authorization header
 */
export function extractBearerToken(authHeader: string | null): string | null {
    if (!authHeader) return null;

    const parts = authHeader.split(' ');
    if (parts.length !== 2 || parts[0] !== 'Bearer') {
        return null;
    }

    return parts[1];
}

/**
 * Validate JWT token and return payload
 */
export function validateJWT(token: string): {
    valid: boolean;
    payload?: JWTPayload;
    error?: string;
} {
    if (!token) {
        return { valid: false, error: 'No token provided' };
    }

    const payload = verifyToken(token);

    if (!payload) {
        return { valid: false, error: 'Invalid or expired token' };
    }

    // Check token type
    if (payload.type !== 'access') {
        return { valid: false, error: 'Invalid token type' };
    }

    return { valid: true, payload };
}

/**
 * Validate refresh token
 */
export function validateRefreshToken(token: string): {
    valid: boolean;
    payload?: JWTPayload;
    error?: string;
} {
    if (!token) {
        return { valid: false, error: 'No token provided' };
    }

    const payload = verifyToken(token);

    if (!payload) {
        return { valid: false, error: 'Invalid or expired refresh token' };
    }

    // Check token type
    if (payload.type !== 'refresh') {
        return { valid: false, error: 'Invalid token type' };
    }

    return { valid: true, payload };
}

/**
 * Check if user has required scope in JWT
 */
export function hasJWTScope(payload: JWTPayload, requiredScope: string): boolean {
    return payload.scopes.includes(requiredScope) || payload.scopes.includes('admin:all');
}
