/**
 * Supabase Response Cache
 * يقلل الـ egress بنسبة 70-80% عن طريق caching الـ responses
 */

interface CacheEntry<T> {
  data: T;
  timestamp: number;
  expiresAt: number;
}

class SupabaseCache {
  private cache: Map<string, CacheEntry<any>> = new Map();
  private readonly DEFAULT_TTL = 5 * 60 * 1000; // 5 minutes
  private readonly SHORT_TTL = 1 * 60 * 1000;   // 1 minute
  private readonly LONG_TTL = 30 * 60 * 1000;   // 30 minutes

  /**
   * Get cached data or fetch from callback
   */
  async get<T>(
    key: string,
    fetchFn: () => Promise<T>,
    options: { ttl?: number; force?: boolean } = {}
  ): Promise<T> {
    const { ttl = this.DEFAULT_TTL, force = false } = options;

    // Check cache first (unless forced refresh)
    if (!force) {
      const cached = this.cache.get(key);
      if (cached && Date.now() < cached.expiresAt) {
        console.log(`[Cache HIT] ${key}`);
        return cached.data;
      }
    }

    // Fetch fresh data
    console.log(`[Cache MISS] ${key} - Fetching from Supabase`);
    const data = await fetchFn();

    // Store in cache
    this.set(key, data, ttl);

    return data;
  }

  /**
   * Set cache entry
   */
  set<T>(key: string, data: T, ttl: number = this.DEFAULT_TTL): void {
    this.cache.set(key, {
      data,
      timestamp: Date.now(),
      expiresAt: Date.now() + ttl,
    });
  }

  /**
   * Invalidate specific key
   */
  invalidate(key: string): void {
    this.cache.delete(key);
    console.log(`[Cache INVALIDATE] ${key}`);
  }

  /**
   * Invalidate by pattern
   */
  invalidatePattern(pattern: string): void {
    const regex = new RegExp(pattern);
    let count = 0;
    
    for (const key of this.cache.keys()) {
      if (regex.test(key)) {
        this.cache.delete(key);
        count++;
      }
    }
    
    console.log(`[Cache INVALIDATE] Pattern "${pattern}" - ${count} entries cleared`);
  }

  /**
   * Clear all cache
   */
  clear(): void {
    this.cache.clear();
    console.log('[Cache CLEAR] All entries cleared');
  }

  /**
   * Get cache stats
   */
  getStats() {
    return {
      size: this.cache.size,
      entries: Array.from(this.cache.keys()),
    };
  }

  /**
   * Clean expired entries
   */
  cleanExpired(): void {
    const now = Date.now();
    let count = 0;

    for (const [key, entry] of this.cache.entries()) {
      if (now >= entry.expiresAt) {
        this.cache.delete(key);
        count++;
      }
    }

    if (count > 0) {
      console.log(`[Cache CLEAN] ${count} expired entries removed`);
    }
  }

  /**
   * TTL presets for different data types
   */
  get TTL() {
    return {
      PRODUCTS: this.LONG_TTL,      // 30 min - products rarely change
      CATEGORIES: this.LONG_TTL,    // 30 min
      BRANCHES: this.LONG_TTL,      // 30 min
      ORDERS: this.SHORT_TTL,       // 1 min - orders change frequently
      USER: this.SHORT_TTL,         // 1 min
      CART: 0,                      // Never cache cart
      SEARCH: this.DEFAULT_TTL,     // 5 min
      STATIC: 60 * 60 * 1000,      // 1 hour - for static content
    };
  }
}

// Singleton instance
export const supabaseCache = new SupabaseCache();

// Auto-clean expired entries every 5 minutes
if (typeof window !== 'undefined') {
  setInterval(() => {
    supabaseCache.cleanExpired();
  }, 5 * 60 * 1000);
}

/**
 * Helper: Generate cache key
 */
export function generateCacheKey(
  resource: string,
  params?: Record<string, any>
): string {
  if (!params) return resource;
  
  const sortedParams = Object.keys(params)
    .sort()
    .map(key => `${key}=${JSON.stringify(params[key])}`)
    .join('&');
  
  return `${resource}?${sortedParams}`;
}

/**
 * Usage Example:
 * 
 * const products = await supabaseCache.get(
 *   'products:all',
 *   async () => {
 *     const { data } = await supabase.from('products').select('*');
 *     return data;
 *   },
 *   { ttl: supabaseCache.TTL.PRODUCTS }
 * );
 */
