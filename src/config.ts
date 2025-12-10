/**
 * Application Configuration
 * Environment variables and constants
 * Version: 2.0 (Force Cache Bust)
 */

// HARDCODED URLs - NO MORE DYNAMIC DETECTION
const PRODUCTION_API_URL = 'https://newnewoo-server.vercel.app/api';
const PRODUCTION_SOCKET_URL = 'https://newnewoo-server.vercel.app';
const LOCAL_API_URL = 'http://localhost:3001/api';
const LOCAL_SOCKET_URL = 'http://localhost:3001';

// Determine API URL - SIMPLIFIED
const getApiUrl = () => {
    // 1. Check env variable first
    if (import.meta.env.VITE_API_URL) {
        console.log('🔧 Using VITE_API_URL:', import.meta.env.VITE_API_URL);
        return import.meta.env.VITE_API_URL;
    }
    
    // 2. Check if localhost
    const host = typeof window !== 'undefined' ? window.location.hostname : '';
    const isLocal = host === 'localhost' || host === '127.0.0.1' || host === '::1';
    
    if (isLocal) {
        console.log('🏠 Using LOCAL API:', LOCAL_API_URL);
        return LOCAL_API_URL;
    }
    
    // 3. Production - HARDCODED
    console.log('🌐 Using PRODUCTION API:', PRODUCTION_API_URL);
    return PRODUCTION_API_URL;
};

const getSocketUrl = () => {
    // 1. Check env variable first
    if (import.meta.env.VITE_SOCKET_URL) {
        console.log('🔧 Using VITE_SOCKET_URL:', import.meta.env.VITE_SOCKET_URL);
        return import.meta.env.VITE_SOCKET_URL;
    }
    
    // 2. Check if localhost
    const host = typeof window !== 'undefined' ? window.location.hostname : '';
    const isLocal = host === 'localhost' || host === '127.0.0.1' || host === '::1';
    
    if (isLocal) {
        console.log('🏠 Using LOCAL Socket:', LOCAL_SOCKET_URL);
        return LOCAL_SOCKET_URL;
    }
    
    // 3. Production - HARDCODED
    console.log('🌐 Using PRODUCTION Socket:', PRODUCTION_SOCKET_URL);
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
export const APP_NAME = 'Lumina Fresh Market';
export const DEFAULT_BRANCH_ID = 1;

// Pagination
export const ITEMS_PER_PAGE = 12;

// Cart
export const CART_STORAGE_KEY = 'lumina_cart';
export const FAVORITES_STORAGE_KEY = 'lumina_favorites';

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
  cod: 'الدفع عند الاستلام',
  fawry: 'Fawry',
  card: 'بطاقة ائتمان',
  branch_pickup: 'تحضير في الفرع (استلام ذاتي)'
};
