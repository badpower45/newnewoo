/**
 * Application Configuration
 * Environment variables and constants
 */

// Determine API URL dynamically - for local network access
const getApiUrl = () => {
    // If explicitly set in env, use that
    if (import.meta.env.VITE_API_URL) {
        return import.meta.env.VITE_API_URL;
    }
  // Default: local dev -> localhost; hosted -> same origin /api
  const host = typeof window !== 'undefined' ? window.location.hostname : '';
  const isLocal = host === 'localhost' || host === '127.0.0.1' || host === '::1';
  if (isLocal) {
    return 'http://localhost:3001/api';
  }
  if (host) {
    return `${window.location.origin}/api`;
  }
  return 'https://bkaa.vercel.app/api';
};

const getSocketUrl = () => {
    if (import.meta.env.VITE_SOCKET_URL) {
        return import.meta.env.VITE_SOCKET_URL;
    }
  const host = typeof window !== 'undefined' ? window.location.hostname : '';
  const isLocal = host === 'localhost' || host === '127.0.0.1' || host === '::1';
  if (isLocal) {
    return 'http://localhost:3001';
  }
  if (host) {
    return window.location.origin;
  }
  return 'https://bkaa.vercel.app';
};

export const API_URL = getApiUrl();
export const SOCKET_URL = getSocketUrl();
export const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL || '';
export const SUPABASE_ANON_KEY = import.meta.env.VITE_SUPABASE_ANON_KEY || '';

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
