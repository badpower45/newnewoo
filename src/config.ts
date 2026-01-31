/**
 * Application Configuration
 * ✅ Use env URLs when present (and not legacy),
 * otherwise fall back to the hardcoded production URLs.
 */

// 🔒 Fallback URLs (update when production backend moves)
const PRODUCTION_API_URL = 'https://bodeelezaby-backend-test.hf.space/api';
const PRODUCTION_SOCKET_URL = 'https://bodeelezaby-backend-test.hf.space';
const LOCAL_API_URL = 'http://localhost:3001/api'; // Local backend للتطوير
const LOCAL_SOCKET_URL = 'http://localhost:3001';

const ENV_API_URL = import.meta.env.VITE_API_URL;
const ENV_SOCKET_URL = import.meta.env.VITE_SOCKET_URL;
const LEGACY_HOSTS = [
  'bodeelezaby-backend-test.hf.space',
  'newnewoo-backend.vercel.app'
];

const isLegacyUrl = (url: string | undefined) => {
  if (!url) return false;
  return LEGACY_HOSTS.some((host) => url.includes(host));
};

const stripTrailingSlashes = (url: string) => url.replace(/\/+$/, '');

const normalizeApiUrl = (url: string) => {
  const clean = stripTrailingSlashes(url);
  return clean.endsWith('/api') ? clean : `${clean}/api`;
};

const normalizeSocketUrl = (url: string) => {
  const clean = stripTrailingSlashes(url);
  return clean.endsWith('/api') ? clean.slice(0, -4) : clean;
};

// Determine API URL - prefer env if it's not legacy
const getApiUrl = () => {
    // Check if localhost ONLY
    const host = typeof window !== 'undefined' ? window.location.hostname : '';
    const isLocal = host === 'localhost' || host === '127.0.0.1' || host === '::1';
    
    if (isLocal) {
        console.log('🏠 LOCAL MODE - Using:', LOCAL_API_URL);
        return LOCAL_API_URL;
    }
    
    if (ENV_API_URL && !isLegacyUrl(ENV_API_URL)) {
        const normalized = normalizeApiUrl(ENV_API_URL);
        console.log('🌐 PRODUCTION MODE - Using ENV API URL:', normalized);
        return normalized;
    }

    // PRODUCTION - fallback to hardcoded URL
    console.log('🌐 PRODUCTION MODE - Using fallback API URL:', PRODUCTION_API_URL);
    return PRODUCTION_API_URL;
};

const getSocketUrl = () => {
    // Check if localhost ONLY
    const host = typeof window !== 'undefined' ? window.location.hostname : '';
    const isLocal = host === 'localhost' || host === '127.0.0.1' || host === '::1';
    
    if (isLocal) {
        console.log('🏠 LOCAL MODE - Using:', LOCAL_SOCKET_URL);
        return LOCAL_SOCKET_URL;
    }
    
    if (ENV_SOCKET_URL && !isLegacyUrl(ENV_SOCKET_URL)) {
        const normalized = normalizeSocketUrl(ENV_SOCKET_URL);
        console.log('🌐 PRODUCTION MODE - Using ENV SOCKET URL:', normalized);
        return normalized;
    }

    if (ENV_API_URL && !isLegacyUrl(ENV_API_URL)) {
        const normalizedFromApi = normalizeSocketUrl(ENV_API_URL);
        console.log('🌐 PRODUCTION MODE - Derived SOCKET URL from API URL:', normalizedFromApi);
        return normalizedFromApi;
    }

    // PRODUCTION - fallback to hardcoded URL
    console.log('🌐 PRODUCTION MODE - Using fallback SOCKET URL:', PRODUCTION_SOCKET_URL);
    return PRODUCTION_SOCKET_URL;
};

export const API_URL = getApiUrl();
export const SOCKET_URL = getSocketUrl();
export const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL || '';
export const SUPABASE_ANON_KEY = import.meta.env.VITE_SUPABASE_ANON_KEY || '';

// Log config on load for debugging
console.log('📋 Config Loaded:', {
    API_URL,
    SOCKET_URL,
    timestamp: new Date().toISOString()
});

// App Constants
export const APP_NAME = 'علوش سوبر ماركت';
export const DEFAULT_BRANCH_ID = 1;

// Pagination
export const ITEMS_PER_PAGE = 12;

// Cart
export const CART_STORAGE_KEY = 'allosh_cart';
export const FAVORITES_STORAGE_KEY = 'allosh_favorites';

// Substitution Preferences
export const SUBSTITUTION_OPTIONS = [
  { value: 'none', label: 'اتصل بي أولاً' },
  { value: 'similar', label: 'استبدل بمنتج مشابه' },
  { value: 'cancel', label: 'الغِ هذا المنتج' }
] as const;

export type SubstitutionPreference = typeof SUBSTITUTION_OPTIONS[number]['value'];

// Order Status
export const ORDER_STATUS = {
  PENDING: 'pending',
  CONFIRMED: 'confirmed',
  PREPARING: 'preparing',
  OUT_FOR_DELIVERY: 'out_for_delivery',
  READY: 'ready',
  DELIVERED: 'delivered',
  CANCELLED: 'cancelled'
} as const;

export const ORDER_STATUS_LABELS: Record<string, string> = {
  pending: 'بانتظار التأكيد',
  confirmed: 'تم التأكيد',
  preparing: 'جاري التحضير',
  ready: 'تم التحضير بانتظار العميل',
  out_for_delivery: 'في الطريق',
  delivered: 'تم التوصيل',
  cancelled: 'ملغي'
};

// Payment Methods
export const PAYMENT_METHODS = {
  COD: 'cod',
  FAWRY: 'fawry',
  CARD: 'card',
  BRANCH_PICKUP: 'branch_pickup'
} as const;

export const PAYMENT_METHOD_LABELS: Record<string, string> = {
  cod: 'الدفع عند الاستلام (كاش)',
  visa: 'الدفع بالفيزا عند التوصيل',
  fawry: 'Fawry',
  card: 'بطاقة ائتمان',
  branch_pickup: 'تحضير في الفرع (استلام ذاتي)'
};

// Cloudinary Configuration
export const CLOUDINARY_CONFIG = {
  cloudName: 'dwnaacuih',
  uploadPreset: 'ml_default'
};
