import bcrypt from 'bcryptjs';
import ApiKey from '@/models/ApiKey';

/**
 * Generate a new API key and secret
 */
export async function generateApiKey(params: {
    userId: string;
    organizationId?: string;
    name: string;
    description?: string;
    scopes: string[];
    tier?: 'free' | 'basic' | 'premium' | 'enterprise';
    environment?: 'development' | 'staging' | 'production';
    expiresInDays?: number;
}) {
    const {
        userId,
        organizationId,
        name,
        description,
        scopes,
        tier = 'free',
        environment = 'production',
        expiresInDays,
    } = params;

    // Generate API key and secret
    const apiKey = ApiKey.generateKey(environment);
    const apiSecret = ApiKey.generateSecret();

    // Hash the secret
    const apiSecretHash = await bcrypt.hash(apiSecret, 10);

    // Set rate limits based on tier
    const rateLimits = {
        free: { requestsPerHour: 100, requestsPerDay: 1000 },
        basic: { requestsPerHour: 1000, requestsPerDay: 10000 },
        premium: { requestsPerHour: 10000, requestsPerDay: 100000 },
        enterprise: { requestsPerHour: 100000, requestsPerDay: 1000000 },
    };

    // Calculate expiration date
    const expiresAt = expiresInDays
        ? new Date(Date.now() + expiresInDays * 24 * 60 * 60 * 1000)
        : undefined;

    // Create API key document
    const apiKeyDoc = await ApiKey.create({
        apiKey,
        apiSecretHash,
        userId,
        organizationId,
        name,
        description,
        scopes,
        tier,
        rateLimit: rateLimits[tier],
        environment,
        expiresAt,
        status: 'active',
    });

    // Return the key and secret (secret is only shown once!)
    return {
        id: apiKeyDoc._id,
        apiKey,
        apiSecret, // IMPORTANT: Only returned here, never stored or shown again
        name,
        scopes,
        tier,
        rateLimit: rateLimits[tier],
        environment,
        expiresAt,
        createdAt: apiKeyDoc.createdAt,
    };
}

/**
 * Validate API key and secret
 */
export async function validateApiKey(apiKey: string, apiSecret: string) {
    // Find the API key
    const keyDoc = await ApiKey.findOne({ apiKey, status: 'active' });

    if (!keyDoc) {
        return { valid: false, error: 'Invalid API key' };
    }

    // Check if expired
    if (keyDoc.isExpired()) {
        return { valid: false, error: 'API key has expired' };
    }

    // Verify secret
    const secretMatch = await bcrypt.compare(apiSecret, keyDoc.apiSecretHash);

    if (!secretMatch) {
        return { valid: false, error: 'Invalid API secret' };
    }

    // Update last used timestamp
    await keyDoc.updateLastUsed();

    return {
        valid: true,
        keyDoc,
        userId: keyDoc.userId,
        organizationId: keyDoc.organizationId,
        scopes: keyDoc.scopes,
        tier: keyDoc.tier,
        rateLimit: keyDoc.rateLimit,
    };
}

/**
 * Revoke an API key
 */
export async function revokeApiKey(apiKeyId: string, userId: string) {
    const keyDoc = await ApiKey.findOne({ _id: apiKeyId, userId });

    if (!keyDoc) {
        throw new Error('API key not found');
    }

    keyDoc.status = 'revoked';
    await keyDoc.save();

    return {
        success: true,
        message: 'API key revoked successfully',
    };
}

/**
 * List user's API keys
 */
export async function listApiKeys(userId: string, organizationId?: string) {
    const query: any = { userId };

    if (organizationId) {
        query.organizationId = organizationId;
    }

    const keys = await ApiKey.find(query)
        .select('-apiSecretHash') // Never return the hashed secret
        .sort({ createdAt: -1 });

    return keys.map(key => ({
        id: key._id,
        apiKey: key.apiKey,
        name: key.name,
        description: key.description,
        scopes: key.scopes,
        tier: key.tier,
        status: key.status,
        environment: key.environment,
        lastUsedAt: key.lastUsedAt,
        totalRequests: key.totalRequests,
        expiresAt: key.expiresAt,
        createdAt: key.createdAt,
    }));
}

/**
 * Update API key
 */
export async function updateApiKey(
    apiKeyId: string,
    userId: string,
    updates: {
        name?: string;
        description?: string;
        scopes?: string[];
        allowedIPs?: string[];
    }
) {
    const keyDoc = await ApiKey.findOne({ _id: apiKeyId, userId });

    if (!keyDoc) {
        throw new Error('API key not found');
    }

    if (updates.name) keyDoc.name = updates.name;
    if (updates.description !== undefined) keyDoc.description = updates.description;
    if (updates.scopes) keyDoc.scopes = updates.scopes;
    if (updates.allowedIPs) keyDoc.allowedIPs = updates.allowedIPs;

    await keyDoc.save();

    return {
        success: true,
        apiKey: {
            id: keyDoc._id,
            apiKey: keyDoc.apiKey,
            name: keyDoc.name,
            description: keyDoc.description,
            scopes: keyDoc.scopes,
            allowedIPs: keyDoc.allowedIPs,
        },
    };
}

/**
 * Check if API key has required scope
 */
export function hasScope(scopes: string[], requiredScope: string): boolean {
    return scopes.includes(requiredScope) || scopes.includes('admin:all');
}

/**
 * Get rate limit for tier
 */
export function getRateLimit(tier: string) {
    const limits = {
        free: { requestsPerHour: 100, requestsPerDay: 1000 },
        basic: { requestsPerHour: 1000, requestsPerDay: 10000 },
        premium: { requestsPerHour: 10000, requestsPerDay: 100000 },
        enterprise: { requestsPerHour: 100000, requestsPerDay: 1000000 },
    };

    return limits[tier as keyof typeof limits] || limits.free;
}
