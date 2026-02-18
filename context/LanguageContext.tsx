import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { translations as nestedTranslations } from '../constants';

type Language = 'ar' | 'en';

interface LanguageContextType {
    language: Language;
    setLanguage: (lang: Language) => void;
    t: (key: string) => string;
    dir: 'rtl' | 'ltr';
    isRTL: boolean;
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

export const useLanguage = () => {
    const context = useContext(LanguageContext);
    if (!context) {
        throw new Error('useLanguage must be used within LanguageProvider');
    }
    return context;
};

interface LanguageProviderProps {
    children: ReactNode;
}

export const LanguageProvider: React.FC<LanguageProviderProps> = ({ children }) => {
    const [language, setLanguageState] = useState<Language>(() => {
        // Check both localStorage and googtrans cookie
        try {
            const saved = localStorage.getItem('app_language');
            if (saved === 'en') return 'en';
            // Also check if googtrans cookie indicates English
            if (document.cookie.includes('googtrans=/ar/en')) return 'en';
        } catch (_) {}
        return 'ar';
    });

    useEffect(() => {
        applyLanguage(language);
        
        // If language is English, we need Google Translate active
        if (language === 'en') {
            let attempts = 0;
            const maxAttempts = 30; // Try for up to 30 seconds
            const tryTranslate = () => {
                attempts++;
                const combo = document.querySelector('.goog-te-combo') as HTMLSelectElement | null;
                if (combo) {
                    // Set the cookie first
                    document.cookie = 'googtrans=/ar/en; path=/';
                    document.cookie = 'googtrans=/ar/en; path=/; domain=' + window.location.hostname;
                    combo.value = 'en';
                    combo.dispatchEvent(new Event('change', { bubbles: true }));
                    // Hide banner
                    setTimeout(() => {
                        hideGoogleTranslateBanner();
                    }, 300);
                } else if (attempts < maxAttempts) {
                    setTimeout(tryTranslate, 1000);
                }
            };
            // Give page time to load Google Translate SDK
            setTimeout(tryTranslate, 500);
        }
    }, []);

    const hideGoogleTranslateBanner = () => {
        document.querySelectorAll('.goog-te-banner-frame, .skiptranslate, #goog-gt-tt, .goog-te-balloon-frame').forEach((el: any) => {
            el.style.cssText = 'display:none!important;visibility:hidden!important;height:0!important;';
        });
        document.body.style.top = '0px';
    };

    const applyLanguage = (lang: Language) => {
        // Always keep RTL direction – the entire layout is RTL-based.
        // Changing dir to LTR breaks Tailwind RTL classes (padding, flex, positioning).
        // Google Translate handles the text direction for English content internally.
        document.documentElement.dir = 'rtl';
        document.documentElement.lang = lang;

        // Add language class to body for CSS targeting
        document.body.classList.remove('lang-ar', 'lang-en');
        document.body.classList.add(`lang-${lang}`);
    };

    const setLanguage = (lang: Language) => {
        if (lang === language) return;

        if (lang === 'ar') {
            // Switching to Arabic: clear cookies, reset combo, then reload
            try { localStorage.setItem('app_language', 'ar'); } catch (_) {}
            
            // Clear googtrans cookies on all domain variants
            const exp = 'expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/';
            document.cookie = 'googtrans=; ' + exp + ';';
            document.cookie = 'googtrans=; ' + exp + '; domain=' + window.location.hostname + ';';
            document.cookie = 'googtrans=; ' + exp + '; domain=.' + window.location.hostname + ';';
            
            // Try to reset Google Translate combo
            try {
                const combo = document.querySelector('.goog-te-combo') as HTMLSelectElement | null;
                if (combo) {
                    combo.value = '';
                    combo.dispatchEvent(new Event('change', { bubbles: true }));
                }
            } catch (_) {}

            // Must reload to fully restore original Arabic text
            setTimeout(() => {
                window.location.href = window.location.pathname + window.location.search;
            }, 150);
            return;
        }

        // Switching to English
        try { localStorage.setItem('app_language', 'en'); } catch (_) {}
        
        // Set googtrans cookies
        document.cookie = 'googtrans=/ar/en; path=/';
        document.cookie = 'googtrans=/ar/en; path=/; domain=' + window.location.hostname;
        
        // Try to trigger Google Translate directly without reload first
        const combo = document.querySelector('.goog-te-combo') as HTMLSelectElement | null;
        if (combo) {
            combo.value = 'en';
            combo.dispatchEvent(new Event('change', { bubbles: true }));
            setTimeout(() => hideGoogleTranslateBanner(), 300);
            setLanguageState('en');
            applyLanguage('en');
        } else {
            // Combo not available yet, must reload
            setTimeout(() => {
                window.location.href = window.location.pathname + window.location.search;
            }, 150);
        }
    };

    const resolveNestedTranslation = (lang: Language, key: string) => {
        return key.split('.').reduce<any>((acc, part) => (acc && typeof acc === 'object' ? acc[part] : undefined), nestedTranslations[lang]);
    };

    const t = (key: string): string => {
        const flatValue = flatTranslations[language]?.[key];
        if (typeof flatValue === 'string') return flatValue;

        const nestedValue = resolveNestedTranslation(language, key);
        if (typeof nestedValue === 'string') return nestedValue;

        return key;
    };

    const value: LanguageContextType = {
        language,
        setLanguage,
        t,
        dir: language === 'ar' ? 'rtl' : 'ltr',
        isRTL: language === 'ar'
    };

    return (
        <LanguageContext.Provider value={value}>
            {children}
        </LanguageContext.Provider>
    );
};

// Translations Object
const flatTranslations: Record<Language, Record<string, string>> = {
    ar: {
        // Navigation & Common
        'home': 'الرئيسية',
        'categories': 'الفئات',
        'products': 'المنتجات',
        'cart': 'السلة',
        'profile': 'حسابي',
        'more': 'المزيد',
        'search': 'بحث',
        'search_placeholder': 'ابحث عن منتج أو فئة',
        'login': 'تسجيل الدخول',
        'register': 'تسجيل حساب جديد',
        'logout': 'تسجيل الخروج',
        'favorites': 'المفضلة',
        'orders': 'طلباتي',
        'my_orders': 'طلباتي',
        'track_order': 'تتبع طلبك',
        
        // Product
        'add_to_cart': 'أضف للسلة',
        'buy_now': 'اشتري الآن',
        'out_of_stock': 'غير متوفر',
        'in_stock': 'متوفر',
        'price': 'السعر',
        'quantity': 'الكمية',
        'total': 'الإجمالي',
        'discount': 'خصم',
        'original_price': 'السعر الأصلي',
        
        // Cart & Checkout
        'your_cart': 'سلة التسوق',
        'empty_cart': 'السلة فارغة',
        'continue_shopping': 'متابعة التسوق',
        'checkout': 'إتمام الطلب',
        'subtotal': 'المجموع الفرعي',
        'delivery_fee': 'رسوم التوصيل',
        'free_delivery': 'توصيل مجاني',
        'total_amount': 'المبلغ الإجمالي',
        'apply_coupon': 'تطبيق كوبون',
        'coupon_code': 'كود الكوبون',
        'remove': 'إزالة',
        
        // Checkout Page
        'delivery_details': 'تفاصيل التوصيل',
        'payment_method': 'طريقة الدفع',
        'cash_on_delivery': 'الدفع عند الاستلام',
        'first_name': 'الاسم الأول',
        'last_name': 'الاسم الأخير',
        'phone': 'رقم الهاتف',
        'address': 'العنوان',
        'building': 'اسم العمارة / المبنى',
        'street': 'اسم الشارع',
        'floor': 'الدور',
        'apartment': 'الشقة',
        'notes': 'ملاحظات',
        'delivery_notes': 'ملاحظات للتوصيل (اختياري)',
        'place_order': 'تأكيد الطلب',
        
        // Order Status
        'order_status': 'حالة الطلب',
        'pending': 'بانتظار التأكيد',
        'confirmed': 'تم التأكيد',
        'preparing': 'جاري التحضير',
        'ready': 'جاهز للتوصيل',
        'out_for_delivery': 'في الطريق',
        'delivered': 'تم التوصيل',
        'cancelled': 'ملغي',
        
        // Profile
        'my_profile': 'حسابي',
        'personal_info': 'المعلومات الشخصية',
        'edit_profile': 'تعديل الملف الشخصي',
        'change_password': 'تغيير كلمة المرور',
        'my_addresses': 'عناواني',
        'loyalty_points': 'نقاط الولاء',
        'rewards': 'المكافآت',
        'settings': 'الإعدادات',
        
        // More Page
        'language': 'اللغة',
        'switch_language': 'تبديل اللغة',
        'arabic': 'العربية',
        'english': 'English',
        'about_us': 'من نحن',
        'contact_us': 'اتصل بنا',
        'terms_conditions': 'الشروط والأحكام',
        'privacy_policy': 'سياسة الخصوصية',
        'return_policy': 'سياسة الإرجاع',
        'delivery_policy': 'سياسة التوصيل',
        'help_center': 'مركز المساعدة',
        'faq': 'الأسئلة الشائعة',
        'branches': 'الفروع',
        'invite_friend': 'ادعُ صديق',
        'customer_support': 'خدمة العملاء',
        'whatsapp_support': 'دعم واتساب',
        
        // Time & Dates
        'open_24_hours': 'مفتوح 24 ساعة',
        'hotline': 'الخط الساخن',
        'delivery_time': 'التوصيل خلال',
        'minutes': 'دقيقة',
        'hours': 'ساعة',
        
        // Buttons & Actions
        'save': 'حفظ',
        'cancel': 'إلغاء',
        'delete': 'حذف',
        'edit': 'تعديل',
        'update': 'تحديث',
        'submit': 'إرسال',
        'back': 'رجوع',
        'next': 'التالي',
        'close': 'إغلاق',
        'confirm': 'تأكيد',
        'view': 'عرض',
        'view_all': 'عرض الكل',
        'load_more': 'تحميل المزيد',
        
        // Messages
        'success': 'نجح',
        'error': 'خطأ',
        'warning': 'تحذير',
        'info': 'معلومات',
        'loading': 'جاري التحميل...',
        'no_results': 'لا توجد نتائج',
        'something_went_wrong': 'حدث خطأ ما',
        'try_again': 'حاول مرة أخرى',
        
        // Auth
        'email': 'البريد الإلكتروني',
        'password': 'كلمة المرور',
        'confirm_password': 'تأكيد كلمة المرور',
        'forgot_password': 'نسيت كلمة المرور؟',
        'remember_me': 'تذكرني',
        'dont_have_account': 'ليس لديك حساب؟',
        'already_have_account': 'لديك حساب بالفعل؟',
        'login_now': 'سجل دخول الآن',
        'register_now': 'سجل الآن',
        
        // Categories
        'all_categories': 'جميع الفئات',
        'view_category': 'عرض الفئة',
        'products_in_category': 'المنتجات في هذه الفئة',
        
        // Filters
        'filter': 'تصفية',
        'sort_by': 'ترتيب حسب',
        'price_low_high': 'السعر: من الأقل للأعلى',
        'price_high_low': 'السعر: من الأعلى للأقل',
        'newest': 'الأحدث',
        'popular': 'الأكثر شعبية',
        
        // Deals
        'hot_deals': 'عروض ساخنة',
        'flash_deal': 'عرض سريع',
        'special_offer': 'عرض خاص',
        'limited_time': 'لفترة محدودة',
        'ends_in': 'ينتهي خلال',
        
        // Footer
        'all_rights_reserved': 'جميع الحقوق محفوظة',
        'follow_us': 'تابعنا',
        
        // Voice Search
        'voice_search': 'البحث الصوتي',
        'listening': 'استمع...',
        'speak_now': 'تحدث الآن',
        
        // Barcode
        'scan_barcode': 'مسح باركود',
        'scanning': 'جاري المسح...',
        
        // Branch Selection
        'select_branch': 'اختر الفرع',
        'delivery_to': 'التوصيل إلى',
        'change_branch': 'تغيير الفرع',
        
        // Empty States
        'no_products': 'لا توجد منتجات',
        'no_orders': 'لا توجد طلبات',
        'no_favorites': 'لا توجد مفضلات',
        
        // Voice & Errors
        'voice_search_not_supported': '⚠️ البحث الصوتي غير مدعوم في متصفحك.\nيرجى استخدام متصفح Chrome أو Edge.',
        'no_speech_detected': 'لم يتم الكشف عن أي صوت. حاول مرة أخرى.',
        'microphone_permission_required': 'يرجى السماح بالوصول إلى الميكروفون من إعدادات المتصفح.',
        'network_error': 'خطأ في الاتصال بالإنترنت.',
        'confirm_logout': 'هل أنت متأكد من تسجيل الخروج؟',
    },
    en: {
        // Navigation & Common
        'home': 'Home',
        'categories': 'Categories',
        'products': 'Products',
        'cart': 'Cart',
        'profile': 'Profile',
        'more': 'More',
        'search': 'Search',
        'search_placeholder': 'Search for product or category',
        'login': 'Login',
        'register': 'Register',
        'logout': 'Logout',
        'favorites': 'Favorites',
        'orders': 'Orders',
        'my_orders': 'My Orders',
        'track_order': 'Track Order',
        
        // Product
        'add_to_cart': 'Add to Cart',
        'buy_now': 'Buy Now',
        'out_of_stock': 'Out of Stock',
        'in_stock': 'In Stock',
        'price': 'Price',
        'quantity': 'Quantity',
        'total': 'Total',
        'discount': 'Discount',
        'original_price': 'Original Price',
        
        // Cart & Checkout
        'your_cart': 'Your Cart',
        'empty_cart': 'Cart is Empty',
        'continue_shopping': 'Continue Shopping',
        'checkout': 'Checkout',
        'subtotal': 'Subtotal',
        'delivery_fee': 'Delivery Fee',
        'free_delivery': 'Free Delivery',
        'total_amount': 'Total Amount',
        'apply_coupon': 'Apply Coupon',
        'coupon_code': 'Coupon Code',
        'remove': 'Remove',
        
        // Checkout Page
        'delivery_details': 'Delivery Details',
        'payment_method': 'Payment Method',
        'cash_on_delivery': 'Cash on Delivery',
        'first_name': 'First Name',
        'last_name': 'Last Name',
        'phone': 'Phone',
        'address': 'Address',
        'building': 'Building Name',
        'street': 'Street Name',
        'floor': 'Floor',
        'apartment': 'Apartment',
        'notes': 'Notes',
        'delivery_notes': 'Delivery Notes (Optional)',
        'place_order': 'Place Order',
        
        // Order Status
        'order_status': 'Order Status',
        'pending': 'Pending',
        'confirmed': 'Confirmed',
        'preparing': 'Preparing',
        'ready': 'Ready',
        'out_for_delivery': 'Out for Delivery',
        'delivered': 'Delivered',
        'cancelled': 'Cancelled',
        
        // Profile
        'my_profile': 'My Profile',
        'personal_info': 'Personal Information',
        'edit_profile': 'Edit Profile',
        'change_password': 'Change Password',
        'my_addresses': 'My Addresses',
        'loyalty_points': 'Loyalty Points',
        'rewards': 'Rewards',
        'settings': 'Settings',
        
        // More Page
        'language': 'Language',
        'switch_language': 'Switch Language',
        'arabic': 'العربية',
        'english': 'English',
        'about_us': 'About Us',
        'contact_us': 'Contact Us',
        'terms_conditions': 'Terms & Conditions',
        'privacy_policy': 'Privacy Policy',
        'return_policy': 'Return Policy',
        'delivery_policy': 'Delivery Policy',
        'help_center': 'Help Center',
        'faq': 'FAQ',
        'branches': 'Branches',
        'invite_friend': 'Invite a Friend',
        'customer_support': 'Customer Support',
        'whatsapp_support': 'WhatsApp Support',
        
        // Time & Dates
        'open_24_hours': 'Open 24 Hours',
        'hotline': 'Hotline',
        'delivery_time': 'Delivery in',
        'minutes': 'minutes',
        'hours': 'hours',
        
        // Buttons & Actions
        'save': 'Save',
        'cancel': 'Cancel',
        'delete': 'Delete',
        'edit': 'Edit',
        'update': 'Update',
        'submit': 'Submit',
        'back': 'Back',
        'next': 'Next',
        'close': 'Close',
        'confirm': 'Confirm',
        'view': 'View',
        'view_all': 'View All',
        'load_more': 'Load More',
        
        // Messages
        'success': 'Success',
        'error': 'Error',
        'warning': 'Warning',
        'info': 'Information',
        'loading': 'Loading...',
        'no_results': 'No Results',
        'something_went_wrong': 'Something went wrong',
        'try_again': 'Try Again',
        
        // Auth
        'email': 'Email',
        'password': 'Password',
        'confirm_password': 'Confirm Password',
        'forgot_password': 'Forgot Password?',
        'remember_me': 'Remember Me',
        'dont_have_account': "Don't have an account?",
        'already_have_account': 'Already have an account?',
        'login_now': 'Login Now',
        'register_now': 'Register Now',
        
        // Categories
        'all_categories': 'All Categories',
        'view_category': 'View Category',
        'products_in_category': 'Products in this category',
        
        // Filters
        'filter': 'Filter',
        'sort_by': 'Sort By',
        'price_low_high': 'Price: Low to High',
        'price_high_low': 'Price: High to Low',
        'newest': 'Newest',
        'popular': 'Popular',
        
        // Deals
        'hot_deals': 'Hot Deals',
        'flash_deal': 'Flash Deal',
        'special_offer': 'Special Offer',
        'limited_time': 'Limited Time',
        'ends_in': 'Ends in',
        
        // Footer
        'all_rights_reserved': 'All Rights Reserved',
        'follow_us': 'Follow Us',
        
        // Voice Search
        'voice_search': 'Voice Search',
        'listening': 'Listening...',
        'speak_now': 'Speak Now',
        
        // Barcode
        'scan_barcode': 'Scan Barcode',
        'scanning': 'Scanning...',
        
        // Branch Selection
        'select_branch': 'Select Branch',
        'delivery_to': 'Delivery to',
        'change_branch': 'Change Branch',
        
        // Empty States
        'no_products': 'No Products',
        'no_orders': 'No Orders',
        'no_favorites': 'No Favorites',
        
        // Voice & Errors
        'voice_search_not_supported': '⚠️ Voice search is not supported in your browser.\nPlease use Chrome or Edge.',
        'no_speech_detected': 'No speech detected. Please try again.',
        'microphone_permission_required': 'Please allow microphone access from browser settings.',
        'network_error': 'Network error occurred.',
        'confirm_logout': 'Are you sure you want to logout?',
    }
};
