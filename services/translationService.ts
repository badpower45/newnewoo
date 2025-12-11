/**
 * Translation Service
 * Auto-detect and translate text between Arabic and English
 */

// Cache for translations to avoid repeated API calls
const translationCache = new Map<string, string>();

/**
 * Detect if text is Arabic
 */
export const isArabic = (text: string): boolean => {
    if (!text || typeof text !== 'string') return false;
    // Arabic Unicode range: \u0600-\u06FF
    const arabicRegex = /[\u0600-\u06FF]/;
    return arabicRegex.test(text);
};

/**
 * Detect if text is English
 */
export const isEnglish = (text: string): boolean => {
    if (!text || typeof text !== 'string') return false;
    // English letters
    const englishRegex = /[a-zA-Z]/;
    return englishRegex.test(text) && !isArabic(text);
};

/**
 * Simple client-side translation (basic dictionary approach)
 * For production, use Google Translate API or similar service
 */
const translations: Record<string, Record<string, string>> = {
    // Common product terms
    'ar_to_en': {
        'حليب': 'Milk',
        'خبز': 'Bread',
        'أرز': 'Rice',
        'شاي': 'Tea',
        'قهوة': 'Coffee',
        'سكر': 'Sugar',
        'ملح': 'Salt',
        'زيت': 'Oil',
        'بيض': 'Eggs',
        'دجاج': 'Chicken',
        'لحم': 'Meat',
        'سمك': 'Fish',
        'خضار': 'Vegetables',
        'فواكه': 'Fruits',
        'عصير': 'Juice',
        'ماء': 'Water',
        'شوكولاتة': 'Chocolate',
        'بسكويت': 'Biscuits',
        'حلويات': 'Sweets',
        'مكرونة': 'Pasta',
        'جبن': 'Cheese',
        'زبادي': 'Yogurt',
        'زبدة': 'Butter',
        'كرواسون': 'Croissant',
        'بطاطس': 'Potatoes',
        'طماطم': 'Tomatoes',
        'بصل': 'Onions',
        'جزر': 'Carrots',
    },
    'en_to_ar': {
        'milk': 'حليب',
        'bread': 'خبز',
        'rice': 'أرز',
        'tea': 'شاي',
        'coffee': 'قهوة',
        'sugar': 'سكر',
        'salt': 'ملح',
        'oil': 'زيت',
        'eggs': 'بيض',
        'chicken': 'دجاج',
        'meat': 'لحم',
        'fish': 'سمك',
        'vegetables': 'خضار',
        'fruits': 'فواكه',
        'juice': 'عصير',
        'water': 'ماء',
        'chocolate': 'شوكولاتة',
        'biscuits': 'بسكويت',
        'sweets': 'حلويات',
        'pasta': 'مكرونة',
        'cheese': 'جبن',
        'yogurt': 'زبادي',
        'butter': 'زبدة',
        'croissant': 'كرواسون',
        'potatoes': 'بطاطس',
        'tomatoes': 'طماطم',
        'onions': 'بصل',
        'carrots': 'جزر',
    }
};

/**
 * Translate text using dictionary (basic)
 */
export const translateText = (text: string, targetLang: 'ar' | 'en'): string => {
    if (!text) return text;

    // Check cache first
    const cacheKey = `${text}_${targetLang}`;
    if (translationCache.has(cacheKey)) {
        return translationCache.get(cacheKey)!;
    }

    const lowerText = text.toLowerCase().trim();
    let translated = text;

    if (targetLang === 'en' && isArabic(text)) {
        // Arabic to English
        translated = translations.ar_to_en[text] || text;
    } else if (targetLang === 'ar' && isEnglish(text)) {
        // English to Arabic
        translated = translations.en_to_ar[lowerText] || text;
    }

    // Cache the result
    translationCache.set(cacheKey, translated);
    
    return translated;
};

/**
 * Auto-translate product name based on current language
 */
export const autoTranslateProduct = (product: any, targetLang: 'ar' | 'en'): any => {
    if (!product) return product;

    const name = product.name || product.title || '';
    const nameAr = product.name_ar || '';
    const nameEn = product.name_en || product.name || '';

    if (targetLang === 'en') {
        // Return English name or translate Arabic
        return {
            ...product,
            displayName: nameEn || (isArabic(name) ? translateText(name, 'en') : name)
        };
    } else {
        // Return Arabic name or keep as is
        return {
            ...product,
            displayName: nameAr || name
        };
    }
};

/**
 * Detect browser language
 */
export const detectBrowserLanguage = (): 'ar' | 'en' => {
    const browserLang = navigator.language || (navigator as any).userLanguage;
    
    // Check if Arabic
    if (browserLang.startsWith('ar')) {
        return 'ar';
    }
    
    // Default to English for other languages
    return 'en';
};

/**
 * Auto-detect and set initial language
 */
export const getInitialLanguage = (): 'ar' | 'en' => {
    // 1. Check localStorage first
    const saved = localStorage.getItem('language');
    if (saved === 'ar' || saved === 'en') {
        return saved as 'ar' | 'en';
    }

    // 2. Default to Arabic (as per requirement)
    return 'ar';
};

export default {
    isArabic,
    isEnglish,
    translateText,
    autoTranslateProduct,
    detectBrowserLanguage,
    getInitialLanguage
};
