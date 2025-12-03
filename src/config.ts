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
    // For local development, use the same hostname as the frontend
    // This allows mobile devices on the same network to connect
    if (typeof window !== 'undefined' && window.location.hostname !== 'localhost') {
        return `http://${window.location.hostname}:3001/api`;
    }
    return 'http://localhost:3001/api';
};

const getSocketUrl = () => {
    if (import.meta.env.VITE_SOCKET_URL) {
        return import.meta.env.VITE_SOCKET_URL;
    }
    if (typeof window !== 'undefined' && window.location.hostname !== 'localhost') {
        return `http://${window.location.hostname}:3001`;
    }
    return 'http://localhost:3001';
};

export const API_URL = getApiUrl();
export const SOCKET_URL = getSocketUrl();
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
  DELIVERED: 'delivered',
  CANCELLED: 'cancelled'
} as const;

export const ORDER_STATUS_LABELS: Record<string, string> = {
  pending: 'بانتظار التأكيد',
  confirmed: 'تم التأكيد',
  preparing: 'جاري التحضير',
  out_for_delivery: 'في الطريق',
  delivered: 'تم التوصيل',
  cancelled: 'ملغي'
};

// Payment Methods
export const PAYMENT_METHODS = {
  COD: 'cod',
  FAWRY: 'fawry',
  CARD: 'card'
} as const;

export const PAYMENT_METHOD_LABELS: Record<string, string> = {
  cod: 'الدفع عند الاستلام',
  fawry: 'Fawry',
  card: 'بطاقة ائتمان'
};
