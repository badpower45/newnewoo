/**
 * ⚡ OPTIMIZED Supabase Client - Reduce Egress Usage
 * 
 * المشاكل المحلولة:
 * 1. إضافة caching layer
 * 2. تقليل عدد الـ queries
 * 3. استخدام pagination
 * 4. تحديد columns محددة بدل select(*)
 * 5. debouncing للـ real-time subscriptions
 */

import { createClient, SupabaseClient } from '@supabase/supabase-js';
import { SUPABASE_URL, SUPABASE_ANON_KEY } from '../src/config';

const url = SUPABASE_URL;
const anonKey = SUPABASE_ANON_KEY;
const hasSupabase = Boolean(url && anonKey);

if (!hasSupabase) {
  console.warn('Supabase URL or anon key is missing. Supabase features will be disabled.');
}

const safeUrl = hasSupabase ? url : 'http://localhost:54321';
const safeAnonKey = hasSupabase ? anonKey : 'anon-key-missing';

// ⚡ OPTIMIZED: استخدام cache للبيانات المتكررة
const queryCache = new Map<string, { data: any; timestamp: number }>();
const CACHE_DURATION = 5 * 60 * 1000; // 5 دقائق

export const supabase: SupabaseClient = createClient(safeUrl, safeAnonKey, {
  auth: {
    persistSession: true,
    autoRefreshToken: true,
    // ⚡ OPTIMIZED: تقليل عدد refresh tokens
    detectSessionInUrl: false,
    flowType: 'pkce'
  },
  // ⚡ OPTIMIZED: تحديد realtime options
  realtime: {
    params: {
      eventsPerSecond: 2 // تقليل عدد events في الثانية
    }
  },
  global: {
    headers: {
      // ⚡ OPTIMIZED: تفعيل compression
      'Accept-Encoding': 'gzip, deflate, br'
    }
  }
});

/**
 * ⚡ Helper: Query مع caching
 */
export const cachedQuery = async (
  cacheKey: string,
  queryFn: () => Promise<any>,
  cacheDuration: number = CACHE_DURATION
) => {
  const cached = queryCache.get(cacheKey);
  const now = Date.now();

  if (cached && now - cached.timestamp < cacheDuration) {
    console.log(`✅ Cache hit: ${cacheKey}`);
    return cached.data;
  }

  console.log(`🔄 Cache miss: ${cacheKey}`);
  const data = await queryFn();
  queryCache.set(cacheKey, { data, timestamp: now });
  
  return data;
};

/**
 * ⚡ Helper: Clear cache
 */
export const clearCache = (prefix?: string) => {
  if (prefix) {
    Array.from(queryCache.keys())
      .filter(key => key.startsWith(prefix))
      .forEach(key => queryCache.delete(key));
  } else {
    queryCache.clear();
  }
};

/**
 * ⚡ Helper: Debounced real-time subscription
 */
let subscriptionDebounceTimers = new Map<string, NodeJS.Timeout>();

export const debouncedSubscription = (
  channelName: string,
  callback: (payload: any) => void,
  delay: number = 500
) => {
  return (payload: any) => {
    const timer = subscriptionDebounceTimers.get(channelName);
    if (timer) clearTimeout(timer);

    subscriptionDebounceTimers.set(
      channelName,
      setTimeout(() => {
        callback(payload);
        subscriptionDebounceTimers.delete(channelName);
      }, delay)
    );
  };
};

/**
 * ⚡ Helper: Batch queries
 */
export const batchQuery = async <T>(
  queries: Array<() => Promise<T>>
): Promise<T[]> => {
  // تنفيذ الـ queries بالتوازي
  return Promise.all(queries.map(q => q()));
};

/**
 * ⚡ Helper: Paginated query
 */
export const paginatedQuery = async (
  table: string,
  page: number = 1,
  pageSize: number = 20,
  orderBy: string = 'created_at',
  ascending: boolean = false
) => {
  const from = (page - 1) * pageSize;
  const to = from + pageSize - 1;

  return supabase
    .from(table)
    .select('*', { count: 'exact' })
    .order(orderBy, { ascending })
    .range(from, to);
};

/**
 * ⚡ Optimized select - حدد الأعمدة المطلوبة فقط
 */
export const optimizedSelect = (table: string, columns: string[]) => {
  return supabase
    .from(table)
    .select(columns.join(','));
};
