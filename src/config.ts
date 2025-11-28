/**
 * Application Configuration
 * Environment variables and constants
 */

export const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001/api';
export const SOCKET_URL = import.meta.env.VITE_SOCKET_URL || 'http://localhost:3001';
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
