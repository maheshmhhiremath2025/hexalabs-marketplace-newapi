import Redis from 'ioredis';

// Redis configuration
const REDIS_URL = process.env.REDIS_URL || 'redis://localhost:6379';
const REDIS_ENABLED = process.env.REDIS_ENABLED !== 'false'; // Enable by default

let redis: Redis | null = null;

/**
 * Get Redis client instance (singleton)
 */
export function getRedisClient(): Redis | null {
    if (!REDIS_ENABLED) {
        console.log('[Redis] Redis is disabled');
        return null;
    }

    if (redis) {
        return redis;
    }

    try {
        redis = new Redis(REDIS_URL, {
            maxRetriesPerRequest: 3,
            retryStrategy(times) {
                const delay = Math.min(times * 50, 2000);
                return delay;
            },
            reconnectOnError(err) {
                const targetError = 'READONLY';
                if (err.message.includes(targetError)) {
                    return true;
                }
                return false;
            },
        });

        redis.on('connect', () => {
            console.log('[Redis] Connected successfully');
        });

        redis.on('error', (err) => {
            console.error('[Redis] Connection error:', err.message);
        });

        redis.on('close', () => {
            console.log('[Redis] Connection closed');
        });

        return redis;
    } catch (error: any) {
        console.error('[Redis] Failed to create client:', error.message);
        return null;
    }
}

/**
 * Check if Redis is available
 */
export async function isRedisAvailable(): Promise<boolean> {
    if (!REDIS_ENABLED) {
        return false;
    }

    const client = getRedisClient();
    if (!client) {
        return false;
    }

    try {
        await client.ping();
        return true;
    } catch (error) {
        console.error('[Redis] Health check failed:', error);
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
        console.log('[Redis] Connection closed gracefully');
    }
}

/**
 * Rate limiting functions using Redis
 */

/**
 * Increment rate limit counter
 * Returns current count and TTL
 */
export async function incrementRateLimit(
    key: string,
    windowSeconds: number
): Promise<{ count: number; ttl: number; success: boolean }> {
    const client = getRedisClient();

    if (!client) {
        // Redis not available, allow request
        return { count: 1, ttl: windowSeconds, success: true };
    }

    try {
        const multi = client.multi();
        multi.incr(key);
        multi.expire(key, windowSeconds);
        multi.ttl(key);

        const results = await multi.exec();

        if (!results) {
            return { count: 1, ttl: windowSeconds, success: true };
        }

        const count = results[0][1] as number;
        const ttl = results[2][1] as number;

        return { count, ttl, success: true };
    } catch (error: any) {
        console.error('[Redis] Rate limit increment failed:', error.message);
        // On error, allow request
        return { count: 1, ttl: windowSeconds, success: false };
    }
}

/**
 * Get current rate limit count
 */
export async function getRateLimitCount(key: string): Promise<number> {
    const client = getRedisClient();

    if (!client) {
        return 0;
    }

    try {
        const count = await client.get(key);
        return count ? parseInt(count, 10) : 0;
    } catch (error) {
        console.error('[Redis] Get rate limit failed:', error);
        return 0;
    }
}

/**
 * Reset rate limit for a key
 */
export async function resetRateLimit(key: string): Promise<boolean> {
    const client = getRedisClient();

    if (!client) {
        return false;
    }

    try {
        await client.del(key);
        return true;
    } catch (error) {
        console.error('[Redis] Reset rate limit failed:', error);
        return false;
    }
}

/**
 * Get TTL for a rate limit key
 */
export async function getRateLimitTTL(key: string): Promise<number> {
    const client = getRedisClient();

    if (!client) {
        return 0;
    }

    try {
        const ttl = await client.ttl(key);
        return ttl > 0 ? ttl : 0;
    } catch (error) {
        console.error('[Redis] Get TTL failed:', error);
        return 0;
    }
}

export default getRedisClient;
