/**
 * 🌍 Localization Helpers
 * دوال مساعدة لاستخراج البيانات حسب اللغة من Supabase
 */

type Language = 'ar' | 'en';

/**
 * استخراج النص الصحيح بناءً على اللغة الحالية
 * @param item - الكائن الذي يحتوي على الحقول متعددة اللغات
 * @param field - اسم الحقل (مثل 'name' أو 'description')
 * @param language - اللغة الحالية
 * @returns النص المترجم
 */
export function getLocalizedField<T extends Record<string, any>>(
  item: T,
  field: string,
  language: Language
): string {
  // محاولة الحصول على الحقل بناءً على اللغة (مثل: name_ar أو name_en)
  const localizedField = `${field}_${language}`;
  
  if (item[localizedField]) {
    return item[localizedField];
  }
  
  // Fallback: إذا لم يوجد، حاول البحث عن النسخة العربية كافتراضي
  if (language === 'en' && item[`${field}_ar`]) {
    return item[`${field}_ar`];
  }
  
  // Fallback: محاولة الحصول على الحقل بدون اللغة
  if (item[field]) {
    return item[field];
  }
  
  // إرجاع نص فارغ كحل أخير
  return '';
}

/**
 * استخراج اسم المنتج حسب اللغة
 */
export function getProductName(product: any, language: Language): string {
  return getLocalizedField(product, 'name', language);
}

/**
 * استخراج وصف المنتج حسب اللغة
 */
export function getProductDescription(product: any, language: Language): string {
  return getLocalizedField(product, 'description', language);
}

/**
 * استخراج اسم القسم حسب اللغة
 */
export function getCategoryName(category: any, language: Language): string {
  return getLocalizedField(category, 'name', language);
}

/**
 * استخراج اسم العلامة التجارية حسب اللغة
 */
export function getBrandName(brand: any, language: Language): string {
  return getLocalizedField(brand, 'name', language);
}

/**
 * تحويل المنتج بالكامل للغة المحددة
 * يُستخدم لتحويل جميع الحقول النصية في المنتج دفعة واحدة
 */
export function localizeProduct(product: any, language: Language) {
  return {
    ...product,
    name: getProductName(product, language),
    description: getProductDescription(product, language),
    // يمكن إضافة حقول أخرى هنا
  };
}

/**
 * تحويل قائمة منتجات للغة المحددة
 */
export function localizeProducts(products: any[], language: Language) {
  return products.map(product => localizeProduct(product, language));
}

/**
 * تحويل القسم للغة المحددة
 */
export function localizeCategory(category: any, language: Language) {
  return {
    ...category,
    name: getCategoryName(category, language),
    description: getLocalizedField(category, 'description', language),
  };
}

/**
 * تحويل قائمة أقسام للغة المحددة
 */
export function localizeCategories(categories: any[], language: Language) {
  return categories.map(category => localizeCategory(category, language));
}

/**
 * تنسيق السعر حسب اللغة
 * @param price - السعر
 * @param language - اللغة
 * @returns السعر منسق مع العملة
 */
export function formatPrice(price: number, language: Language): string {
  const formattedNumber = price.toLocaleString(language === 'ar' ? 'ar-EG' : 'en-US');
  
  if (language === 'ar') {
    return `${formattedNumber} ج.م`;
  } else {
    return `EGP ${formattedNumber}`;
  }
}

/**
 * تنسيق التاريخ حسب اللغة
 */
export function formatDate(date: Date | string, language: Language): string {
  const dateObj = typeof date === 'string' ? new Date(date) : date;
  
  return dateObj.toLocaleDateString(
    language === 'ar' ? 'ar-EG' : 'en-US',
    {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    }
  );
}

/**
 * تنسيق الأعداد حسب اللغة (للكميات مثلاً)
 */
export function formatNumber(num: number, language: Language): string {
  return num.toLocaleString(language === 'ar' ? 'ar-EG' : 'en-US');
}

/**
 * Hook مخصص للحصول على دالة localize بناءً على اللغة الحالية
 * استخدام: const { localize } = useLocalization();
 */
import { useLanguage } from '../context/LanguageContext';

export function useLocalization() {
  const { language } = useLanguage();
  
  return {
    language,
    getLocalizedField: <T extends Record<string, any>>(item: T, field: string) => 
      getLocalizedField(item, field, language),
    getProductName: (product: any) => getProductName(product, language),
    getProductDescription: (product: any) => getProductDescription(product, language),
    getCategoryName: (category: any) => getCategoryName(category, language),
    getBrandName: (brand: any) => getBrandName(brand, language),
    localizeProduct: (product: any) => localizeProduct(product, language),
    localizeProducts: (products: any[]) => localizeProducts(products, language),
    localizeCategory: (category: any) => localizeCategory(category, language),
    localizeCategories: (categories: any[]) => localizeCategories(categories, language),
    formatPrice: (price: number) => formatPrice(price, language),
    formatDate: (date: Date | string) => formatDate(date, language),
    formatNumber: (num: number) => formatNumber(num, language),
  };
}
