/**
 * LocalStorage Caching Utility
 * للـ caching الذكي للبيانات مع TTL (Time To Live)
 * 
 * التوفير المتوقع: Zero API calls للبيانات المحفوظة!
 */

interface CachedData<T> {
    data: T;
    timestamp: number;
    ttl: number; // Time to live in milliseconds
}

/**
 * حفظ البيانات في localStorage مع TTL
 */
export function cacheSet<T>(key: string, data: T, ttlMinutes: number = 30): void {
    try {
        const cached: CachedData<T> = {
            data,
            timestamp: Date.now(),
            ttl: ttlMinutes * 60 * 1000 // Convert to milliseconds
        };
        localStorage.setItem(`cache_${key}`, JSON.stringify(cached));
    } catch (error) {
        console.error(`Failed to cache ${key}:`, error);
    }
}

/**
 * استرجاع البيانات من localStorage
 * @returns البيانات المحفوظة أو null إذا انتهت صلاحيتها
 */
export function cacheGet<T>(key: string): T | null {
    try {
        const cached = localStorage.getItem(`cache_${key}`);
        if (!cached) return null;

        const parsed: CachedData<T> = JSON.parse(cached);
        const now = Date.now();

        // Check if expired
        if (now - parsed.timestamp > parsed.ttl) {
            // Expired - remove it
            localStorage.removeItem(`cache_${key}`);
            return null;
        }

        return parsed.data;
    } catch (error) {
        console.error(`Failed to get cache ${key}:`, error);
        return null;
    }
}

/**
 * مسح البيانات من localStorage
 */
export function cacheClear(key: string): void {
    try {
        localStorage.removeItem(`cache_${key}`);
    } catch (error) {
        console.error(`Failed to clear cache ${key}:`, error);
    }
}

/**
 * مسح كل الـ cache
 */
export function cacheClearAll(): void {
    try {
        const keys = Object.keys(localStorage);
        keys.forEach(key => {
            if (key.startsWith('cache_')) {
                localStorage.removeItem(key);
            }
        });
    } catch (error) {
        console.error('Failed to clear all cache:', error);
    }
}

/**
 * Fetch with cache
 * @param key - مفتاح الـ cache
 * @param fetcher - Function to fetch data
 * @param ttlMinutes - Cache duration in minutes
 * @returns Cached data or fresh data
 * 
 * @example
 * const products = await fetchWithCache(
 *   'products_branch_1',
 *   () => api.products.getAllByBranch(1),
 *   30 // 30 minutes cache
 * );
 */
export async function fetchWithCache<T>(
    key: string,
    fetcher: () => Promise<T>,
    ttlMinutes: number = 30
): Promise<T> {
    // Try to get from cache first
    const cached = cacheGet<T>(key);
    if (cached !== null) {
        console.log(`✅ Cache HIT: ${key}`);
        return cached;
    }

    // Cache miss - fetch fresh data
    console.log(`❌ Cache MISS: ${key} - Fetching...`);
    const data = await fetcher();

    // Save to cache
    cacheSet(key, data, ttlMinutes);

    return data;
}

/**
 * Get cache stats
 */
export function getCacheStats(): {
    totalItems: number;
    totalSize: number;
    items: { key: string; size: number; age: number }[];
} {
    const keys = Object.keys(localStorage);
    const cacheKeys = keys.filter(k => k.startsWith('cache_'));

    let totalSize = 0;
    const items = cacheKeys.map(key => {
        const value = localStorage.getItem(key) || '';
        const size = new Blob([value]).size;
        totalSize += size;

        try {
            const parsed: CachedData<any> = JSON.parse(value);
            const age = Date.now() - parsed.timestamp;
            return { key, size, age };
        } catch {
            return { key, size, age: 0 };
        }
    });

    return {
        totalItems: cacheKeys.length,
        totalSize,
        items
    };
}
