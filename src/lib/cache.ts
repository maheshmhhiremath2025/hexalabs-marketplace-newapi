/**
 * Redis Cache Utility
 * Provides caching functionality for API responses
 */

import Redis from 'ioredis';

// Redis client instance
let redis: Redis | null = null;

/**
 * Initialize Redis client
 */
function getRedisClient(): Redis | null {
    if (!process.env.REDIS_ENABLED || process.env.REDIS_ENABLED !== 'true') {
        return null;
    }

    if (!redis) {
        try {
            redis = new Redis(process.env.REDIS_URL || 'redis://localhost:6379', {
                maxRetriesPerRequest: 3,
                retryStrategy: (times) => {
                    if (times > 3) {
                        console.error('[Cache] Redis connection failed after 3 retries');
                        return null;
                    }
                    return Math.min(times * 100, 3000);
                },
            });

            redis.on('error', (err) => {
                console.error('[Cache] Redis error:', err);
            });

            redis.on('connect', () => {
                console.log('[Cache] Redis connected');
            });
        } catch (error) {
            console.error('[Cache] Failed to initialize Redis:', error);
            return null;
        }
    }

    return redis;
}

/**
 * Cache key prefixes
 */
export const CachePrefix = {
    LAB: 'lab',
    LABS_LIST: 'labs:list',
    USER: 'user',
    USER_LABS: 'user:labs',
    USER_ORDERS: 'user:orders',
    USER_ANALYTICS: 'user:analytics',
    ORDER: 'order',
    ORDERS_LIST: 'orders:list',
    ORGANIZATION: 'org',
    ORG_MEMBERS: 'org:members',
    ORG_ANALYTICS: 'org:analytics',
    ANALYTICS_OVERVIEW: 'analytics:overview',
    ANALYTICS_USAGE: 'analytics:usage',
    ANALYTICS_REVENUE: 'analytics:revenue',
    SEARCH: 'search',
} as const;

/**
 * Default TTL (Time To Live) in seconds
 */
export const CacheTTL = {
    SHORT: 60, // 1 minute
    MEDIUM: 300, // 5 minutes
    LONG: 900, // 15 minutes
    HOUR: 3600, // 1 hour
    DAY: 86400, // 24 hours
} as const;

/**
 * Generate cache key
 */
export function generateCacheKey(prefix: string, ...parts: (string | number)[]): string {
    return `${prefix}:${parts.join(':')}`;
}

/**
 * Get value from cache
 */
export async function getCache<T>(key: string): Promise<T | null> {
    const client = getRedisClient();
    if (!client) return null;

    try {
        const value = await client.get(key);
        if (!value) return null;

        return JSON.parse(value) as T;
    } catch (error) {
        console.error('[Cache] Get error:', error);
        return null;
    }
}

/**
 * Set value in cache
 */
export async function setCache(
    key: string,
    value: any,
    ttl: number = CacheTTL.MEDIUM
): Promise<boolean> {
    const client = getRedisClient();
    if (!client) return false;

    try {
        const serialized = JSON.stringify(value);
        await client.setex(key, ttl, serialized);
        return true;
    } catch (error) {
        console.error('[Cache] Set error:', error);
        return false;
    }
}

/**
 * Delete value from cache
 */
export async function deleteCache(key: string): Promise<boolean> {
    const client = getRedisClient();
    if (!client) return false;

    try {
        await client.del(key);
        return true;
    } catch (error) {
        console.error('[Cache] Delete error:', error);
        return false;
    }
}

/**
 * Delete multiple keys matching pattern
 */
export async function deleteCachePattern(pattern: string): Promise<boolean> {
    const client = getRedisClient();
    if (!client) return false;

    try {
        const keys = await client.keys(pattern);
        if (keys.length > 0) {
            await client.del(...keys);
        }
        return true;
    } catch (error) {
        console.error('[Cache] Delete pattern error:', error);
        return false;
    }
}

/**
 * Invalidate cache for a specific resource
 */
export async function invalidateCache(prefix: string, id?: string): Promise<boolean> {
    const client = getRedisClient();
    if (!client) return false;

    try {
        if (id) {
            // Invalidate specific resource
            await deleteCache(generateCacheKey(prefix, id));
        }

        // Invalidate list caches
        await deleteCachePattern(`${prefix}:list:*`);

        return true;
    } catch (error) {
        console.error('[Cache] Invalidate error:', error);
        return false;
    }
}

/**
 * Invalidate related caches when data changes
 */
export async function invalidateRelatedCaches(resource: string, id?: string): Promise<void> {
    switch (resource) {
        case 'lab':
            await invalidateCache(CachePrefix.LAB, id);
            await deleteCachePattern(`${CachePrefix.LABS_LIST}:*`);
            await deleteCachePattern(`${CachePrefix.ANALYTICS_USAGE}:*`);
            break;

        case 'user':
            await invalidateCache(CachePrefix.USER, id);
            if (id) {
                await deleteCachePattern(`${CachePrefix.USER_LABS}:${id}:*`);
                await deleteCachePattern(`${CachePrefix.USER_ORDERS}:${id}:*`);
                await deleteCachePattern(`${CachePrefix.USER_ANALYTICS}:${id}:*`);
            }
            await deleteCachePattern(`${CachePrefix.ANALYTICS_OVERVIEW}:*`);
            break;

        case 'order':
            await invalidateCache(CachePrefix.ORDER, id);
            await deleteCachePattern(`${CachePrefix.ORDERS_LIST}:*`);
            await deleteCachePattern(`${CachePrefix.ANALYTICS_REVENUE}:*`);
            await deleteCachePattern(`${CachePrefix.ANALYTICS_OVERVIEW}:*`);
            break;

        case 'organization':
            await invalidateCache(CachePrefix.ORGANIZATION, id);
            if (id) {
                await deleteCachePattern(`${CachePrefix.ORG_MEMBERS}:${id}:*`);
                await deleteCachePattern(`${CachePrefix.ORG_ANALYTICS}:${id}:*`);
            }
            await deleteCachePattern(`${CachePrefix.ANALYTICS_OVERVIEW}:*`);
            break;

        case 'analytics':
            await deleteCachePattern(`${CachePrefix.ANALYTICS_OVERVIEW}:*`);
            await deleteCachePattern(`${CachePrefix.ANALYTICS_USAGE}:*`);
            await deleteCachePattern(`${CachePrefix.ANALYTICS_REVENUE}:*`);
            break;
    }
}

/**
 * Cache wrapper for async functions
 */
export async function withCache<T>(
    key: string,
    ttl: number,
    fetchFn: () => Promise<T>
): Promise<T> {
    // Try to get from cache
    const cached = await getCache<T>(key);
    if (cached !== null) {
        console.log(`[Cache] HIT: ${key}`);
        return cached;
    }

    console.log(`[Cache] MISS: ${key}`);

    // Fetch fresh data
    const data = await fetchFn();

    // Store in cache
    await setCache(key, data, ttl);

    return data;
}

/**
 * Get cache statistics
 */
export async function getCacheStats(): Promise<{
    connected: boolean;
    keys: number;
    memory: string;
} | null> {
    const client = getRedisClient();
    if (!client) return null;

    try {
        const info = await client.info('stats');
        const memory = await client.info('memory');
        const dbsize = await client.dbsize();

        return {
            connected: true,
            keys: dbsize,
            memory: memory.match(/used_memory_human:(.+)/)?.[1]?.trim() || 'unknown',
        };
    } catch (error) {
        console.error('[Cache] Stats error:', error);
        return null;
    }
}

/**
 * Clear all cache
 */
export async function clearAllCache(): Promise<boolean> {
    const client = getRedisClient();
    if (!client) return false;

    try {
        await client.flushdb();
        console.log('[Cache] All cache cleared');
        return true;
    } catch (error) {
        console.error('[Cache] Clear all error:', error);
        return false;
    }
}

/**
 * Close Redis connection
 */
export async function closeRedis(): Promise<void> {
    if (redis) {
        await redis.quit();
        redis = null;
    }
}
