export interface Product {
  id: string;
  name: string;
  barcode?: string;
  price: number;
  originalPrice?: number; // السعر قبل الخصم
  discount_price?: number; // السعر قبل (الأصلي)
  category: string;
  subcategory?: string; // التصنيف الفرعي
  rating: number;
  reviews: number;
  image: string;
  isNew?: boolean;
  isOrganic?: boolean;
  isWeighted?: boolean;
  weight: string;
  stock_quantity?: number; // عدد القطع المتوفرة
  expiry_date?: string; // تاريخ الصلاحية
  branch_id?: number; // الفرع
  shelf_location?: string; // موقع الرف (مثل: صف 3 - رف A)
}

export interface NavItem {
  label: string;
  href: string;
  subCategories?: {
    title: string;
    items: string[];
  }[];
}

export interface FilterState {
  priceRange: [number, number];
  organic: boolean;
  brands: string[];
  categories: string[];
}