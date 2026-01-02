/**
 * Application Configuration
 * ⚠️ CRITICAL: These URLs are HARDCODED on purpose!
 * 
 * DO NOT use environment variables from Vercel Dashboard
 * because they contain old URLs (bkaa.vercel.app, newnewoo-backend.vercel.app)
 * 
 * Version: 2.1 - Force Hardcoded URLs
 */

// 🔒 HARDCODED URLs - NEVER USE ENV VARS IN PRODUCTION
const PRODUCTION_API_URL = 'https://bkaa.vercel.app/api';
const PRODUCTION_SOCKET_URL = 'https://bkaa.vercel.app';
const LOCAL_API_URL = 'https://bkaa.vercel.app/api';
const LOCAL_SOCKET_URL = 'https://bkaa.vercel.app';

// Determine API URL - FORCE HARDCODED (ignore env vars from Vercel Dashboard)
const getApiUrl = () => {
    // Check if localhost ONLY
    const host = typeof window !== 'undefined' ? window.location.hostname : '';
    const isLocal = host === 'localhost' || host === '127.0.0.1' || host === '::1';
    
    if (isLocal) {
        console.log('🏠 LOCAL MODE - Using:', LOCAL_API_URL);
        return LOCAL_API_URL;
    }
    
    // PRODUCTION - ALWAYS use hardcoded URL (ignore env vars)
    console.log('🌐 PRODUCTION MODE - Using:', PRODUCTION_API_URL);
    console.log('⚠️ IGNORING environment variables - using hardcoded URLs only');
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
    
    // PRODUCTION - ALWAYS use hardcoded URL (ignore env vars)
    console.log('🌐 PRODUCTION MODE - Using:', PRODUCTION_SOCKET_URL);
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
