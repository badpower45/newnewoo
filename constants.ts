
import { NavItem, Product } from './types';

export const NAV_ITEMS: NavItem[] = [
  {
    label: 'الأقسام',
    href: '#',
    subCategories: [
      {
        title: 'السوق الفريش',
        items: ['خضار وفواكه', 'لحوم ودواجن', 'أسماك ومأكولات بحرية', 'تمور ومكسرات']
      },
      {
        title: 'المخبز والفطار',
        items: ['عيش طازة', 'كرواسون ومخبوزات', 'جبن وألبان', 'بيض']
      },
      {
        title: 'خزين البيت',
        items: ['رز ومكرونة', 'زيت وسمنة', 'توابل وبهارات', 'معلبات']
      },
      {
        title: 'سناكس ومشروبات',
        items: ['شيبسي ومقرمشات', 'مشروبات غازية', 'عصائر', 'شوكولاتة وحلويات']
      }
    ]
  },
  { label: 'عروض الأسبوع', href: '#deals' },
  { label: 'عروض رمضان', href: '#seasonal' },
  { label: 'طلباتي', href: '#orders' },
];

export const HERO_ITEMS = [
  {
    id: 1,
    title: "مهرجان الشوكولاتة والسعادة",
    subtitle: "أكبر تشكيلة شوكولاتة في مصر.. جلاكسي، كيت كات، فيريرو روشيه وكل اللي بتحبه بأسعار زمان.",
    cta: "اشتري السعادة",
    image: "https://images.unsplash.com/photo-1511381939415-e44015466834?q=80&w=1200&auto=format&fit=crop", 
    size: "large", 
    color: "bg-[#2A1B18]" 
  },
  {
    id: 2,
    title: "جبنة رومي وتلاجة",
    subtitle: "تشكيلة أجبان للسحور والفطار.",
    cta: "تسوق الأجبان",
    image: "https://images.unsplash.com/photo-1486297678162-eb2a19b0a32d?q=80&w=600&auto=format&fit=crop", 
    size: "small", 
    color: "bg-yellow-50"
  },
  {
    id: 3,
    title: "مولتو و باتيه",
    subtitle: "سناكس للمدرسة والشغل.",
    cta: "اطلب المخبوزات",
    image: "https://images.unsplash.com/photo-1608198093002-ad4e005484ec?q=80&w=600&auto=format&fit=crop", // Updated to Paté/Croissant image
    size: "small", 
    color: "bg-orange-50"
  }
];

export const PROMO_BANNERS = {
    ramadan: {
        title: "كرتونة الخير والبركة",
        subtitle: "كل ياميش رمضان وزيت وسكر ورز في كرتونة واحدة.. وفر وقتك وفلوسك.",
        image: "https://images.unsplash.com/photo-1615887023516-9b6c50f412da?q=80&w=1200&auto=format&fit=crop", // Updated to Ramadan/Dates vibe
        cta: "اطلب بـ 850 ج.م",
        color: "bg-brand-brown"
    },
    dairy: {
        title: "منتجات ألبان الصباح",
        subtitle: "لبن جهينة والمراعي، زبادي لاكتيل، وكل منتجات الفطار.",
        image: "https://images.unsplash.com/photo-1628088062854-d1870b4553da?q=80&w=800&auto=format&fit=crop",
        cta: "تسوق الألبان",
        color: "bg-blue-900"
    },
    snacks: {
        title: "قرمشة وسهرة الخميس",
        subtitle: "عروض خاصة على شيبسي العائلي، بيبسي، وفشار.. السهرة ماتحلاش من غيرهم!",
        image: "https://images.unsplash.com/photo-1534422298391-e4f8c172dddb?q=80&w=1000&auto=format&fit=crop", 
        cta: "شوف العروض",
        color: "bg-purple-900" 
    }
};

export const MAGAZINE_OFFERS = [
    {
        id: 1,
        title: "حلويات العيد",
        edition: "عيد ميلاد فرع الماظة",
        mainOffer: "علبة ويفر رول 59.99ج",
        subtitle: "باونتي أو تويكس (12 قطعة) - بدلاً من 144ج",
        image: "https://i.postimg.cc/7f0p5FFP/561432638-852357677118121-8045121795431786907-n.jpg", // User provided image
        color: "bg-red-700",
        date: "خصم 58%"
    },
    {
        id: 2,
        title: "تسالي ومقرمشات",
        edition: "عيد ميلاد فرع الماظة",
        mainOffer: "لب سوبر 75ج",
        subtitle: "لب سوري 58ج - سوداني مقشر 45ج (وزن 250 جرام)",
        image: "https://i.postimg.cc/xJB4C5gD/561634247-852357670451455-4415429852468347683-n.jpg", // User provided image
        color: "bg-amber-600",
        date: "ساري لفترة محدودة"
    },
    {
        id: 3,
        title: "ياميش ومكسرات",
        edition: "عيد ميلاد فرع الماظة",
        mainOffer: "بندق قلب 250ج",
        subtitle: "لوز 170ج - سوداني مدخن 55ج (وزن 250 جرام)",
        image: "https://i.postimg.cc/jwBF5cvR/564078988-852357653784790-7362469362867190563-n.jpg", // User provided image
        color: "bg-yellow-800",
        date: "أفضل جودة"
    },
    {
        id: 4,
        title: "فاخر من الآخر",
        edition: "عيد ميلاد فرع الماظة",
        mainOffer: "كاجو جامبو 200ج",
        subtitle: "فستق 220ج - عين جمل 165ج (وزن 250 جرام)",
        image: "https://i.postimg.cc/7GjW69XH/564614580-852357623784793-6747780499897368656-n.jpg", // User provided image
        color: "bg-orange-700",
        date: "تحطيم الأسعار"
    },
    {
        id: 5,
        title: "خزين البيت",
        edition: "عيد ميلاد فرع الماظة",
        mainOffer: "زيت هنادي 64.99ج",
        subtitle: "أرز الفا 24.50ج - سكر الماسة 23.50ج - دقيق الندى 18.50ج",
        image: "https://i.postimg.cc/qhNF4Scp/564714515-852357840451438-2592897648795572222-n.jpg", // User provided image
        color: "bg-blue-800",
        date: "أسعار زمان"
    }
];

export const FRESH_PRODUCTS: Product[] = [
  {
    id: '1',
    name: 'بلح سيوي فاخر',
    price: 65.00,
    originalPrice: 80.00,
    category: 'ياميش',
    rating: 4.9,
    reviews: 342,
    image: 'https://images.unsplash.com/photo-1628607270974-c06490723748?q=80&w=600&auto=format&fit=crop', // Updated to Dates image
    isOrganic: true,
    weight: '1 كجم'
  },
  {
    id: '2',
    name: 'عيش فينو طازة',
    price: 25.00,
    category: 'مخبوزات',
    rating: 4.8,
    reviews: 1500,
    image: 'https://images.unsplash.com/photo-1598373182133-52452f7691ef?q=80&w=600&auto=format&fit=crop',
    weight: '10 أرغفة'
  },
  {
    id: '3',
    name: 'طماطم بلدي صلصة',
    price: 15.00,
    originalPrice: 20.00,
    category: 'خضروات',
    rating: 4.5,
    reviews: 230,
    image: 'https://images.unsplash.com/photo-1592924357228-91a4daadcfea?q=80&w=600&auto=format&fit=crop',
    weight: '1 كجم'
  },
  {
    id: '4',
    name: 'كباب حلة بلدي',
    price: 480.00,
    category: 'جزارة',
    rating: 4.9,
    reviews: 89,
    image: 'https://images.unsplash.com/photo-1607623814075-e51df1bdc82f?q=80&w=600&auto=format&fit=crop',
    weight: '1 كجم'
  }
];

export const PANTRY_PRODUCTS: Product[] = [
    {
        id: '5',
        name: 'زيت كريستال عباد',
        price: 95.00,
        originalPrice: 110.00,
        category: 'زيوت',
        rating: 4.7,
        reviews: 540,
        image: 'https://images.unsplash.com/photo-1620916566398-39f1143ab7be?q=80&w=600&auto=format&fit=crop', // Updated to Sunflower Oil image
        weight: '800 مل'
    },
    {
        id: '6',
        name: 'أرز الضحى مصري',
        price: 42.00,
        category: 'أرز',
        rating: 4.8,
        reviews: 800,
        image: 'https://images.unsplash.com/photo-1586201375761-83865001e31c?q=80&w=600&auto=format&fit=crop',
        weight: '1 كجم'
    },
    {
        id: '7',
        name: 'مكرونة الملكة بنا',
        price: 15.00,
        category: 'مكرونة',
        rating: 4.6,
        reviews: 320,
        image: 'https://images.unsplash.com/photo-1612966874574-1041c94f8a55?q=80&w=600&auto=format&fit=crop',
        weight: '400 جرام'
    },
    {
        id: '8',
        name: 'شاي العروسة ناعم',
        price: 60.00,
        category: 'مشروبات ساخنة',
        rating: 4.9,
        reviews: 1200,
        image: 'https://images.unsplash.com/photo-1597318181409-cf64d0b5d8a2?q=80&w=600&auto=format&fit=crop',
        weight: '250 جرام'
    }
];

export const SNACK_PRODUCTS: Product[] = [
    {
        id: '9',
        name: 'شيبسي طماطم عائلي',
        price: 15.00,
        category: 'سناكس',
        rating: 4.8,
        reviews: 156,
        image: 'https://images.unsplash.com/photo-1613919085533-0a05360b1cbe?q=80&w=600&auto=format&fit=crop',
        weight: 'جامبو'
    },
    {
        id: '10',
        name: 'بيبسي كانز',
        price: 12.00,
        category: 'مشروبات',
        rating: 4.9,
        reviews: 2000,
        image: 'https://images.unsplash.com/photo-1629203851122-3726ecdf080e?q=80&w=600&auto=format&fit=crop',
        weight: '330 مل'
    },
    {
        id: '11',
        name: 'مولتو ماجموم شوكولاتة',
        price: 10.00,
        category: 'مخبوزات',
        rating: 4.5,
        reviews: 450,
        image: 'https://images.unsplash.com/photo-1545337706-16125eb23d15?q=80&w=600&auto=format&fit=crop',
        weight: 'قطعة'
    },
    {
        id: '12',
        name: 'شوكولاتة كيت كات 4 أصابع',
        price: 25.00,
        category: 'شوكولاتة',
        rating: 4.8,
        reviews: 600,
        image: 'https://images.unsplash.com/photo-1614066000917-5c51861e37e0?q=80&w=600&auto=format&fit=crop',
        weight: '41.5 جرام'
    }
];

export const REELS_ITEMS = [
  {
    id: 1,
    title: "طريقة عمل الكنافة بالمانجا 🥭",
    views: "1.2M",
    author: "الشيف علوش",
    videoImage: "https://images.unsplash.com/photo-1587314168485-3236d6710814?q=80&w=600&auto=format&fit=crop",
    type: "وصفة"
  },
  {
    id: 2,
    title: "تحدي الشيبسي الجديد! 🌶️",
    views: "850K",
    author: "أكيلة",
    videoImage: "https://images.unsplash.com/photo-1599490659213-e2b9527bd087?q=80&w=600&auto=format&fit=crop",
    type: "ريفيو"
  },
  {
    id: 3,
    title: "مشتريات رمضان بـ 500 جنيه بس",
    views: "2.5M",
    author: "مروة كيتشن",
    videoImage: "https://images.unsplash.com/photo-1542838132-92c53300491e?q=80&w=600&auto=format&fit=crop",
    type: "توفير"
  },
  {
    id: 4,
    title: "جربنا عصير القصب بالفراولة 🍓",
    views: "500K",
    author: "فريق علوش",
    videoImage: "https://images.unsplash.com/photo-1506802913710-40e2e66339c9?q=80&w=600&auto=format&fit=crop",
    type: "تجربة"
  },
    {
    id: 5,
    title: "أحسن نوع سمنة للكحك؟ 🤔",
    views: "900K",
    author: "ست البيت",
    videoImage: "https://images.unsplash.com/photo-1591087062080-52e97b66ce13?q=80&w=600&auto=format&fit=crop",
    type: "نصيحة"
  }
];

// ============================================
// 🌍 قاموس الترجمة الشامل
// ============================================
export const translations = {
  ar: {
    // Header
    header: {
      home: 'الرئيسية',
      categories: 'الأقسام',
      deals: 'عروض الأسبوع',
      seasonal: 'عروض رمضان',
      orders: 'طلباتي',
      cart: 'السلة',
      account: 'حسابي',
      login: 'تسجيل الدخول',
      logout: 'تسجيل الخروج',
      search: 'ابحث عن منتج أو قسم...',
      switchToEnglish: 'English',
      open24Hours: 'مفتوح 24 ساعة',
      deliveryTo: 'التوصيل إلى',
      selectBranch: 'اختر الفرع',
      hotline: 'الخط الساخن',
      rewards: 'مكافآت علوش',
      logoTitle: 'علوش',
      logoSubtitle: 'ماركت',
      searchPlaceholder: 'عايز تطبخ إيه النهاردة؟',
      clearSearch: 'مسح البحث',
      suggestions: 'مقترحات',
      searchFor: 'بحث عن',
      openSearch: 'فتح البحث',
      welcomeBack: 'أهلاً بك',
      openMenu: 'فتح القائمة',
      searchProducts: 'ابحث عن منتجات...',
      getRewards: 'احصل على نقاط ومكافآت',
      ramadan: 'رمضان كريم',
      ramadanDescription: 'اطلب كرتونة رمضان دلوقتي توصلك لحد البيت.',
      orderNow: 'اطلب الآن',
    },
    
    // Footer
    footer: {
      about: 'من نحن',
      aboutText: 'علوش سوبر ماركت - أفضل المنتجات بأسعار تنافسية',
      customerService: 'خدمة العملاء',
      contactUs: 'اتصل بنا',
      shippingInfo: 'معلومات الشحن',
      returnPolicy: 'سياسة الإرجاع',
      termsConditions: 'الشروط والأحكام',
      privacy: 'سياسة الخصوصية',
      quickLinks: 'روابط سريعة',
      allProducts: 'كل المنتجات',
      hotDeals: 'العروض الساخنة',
      newArrivals: 'أحدث المنتجات',
      followUs: 'تابعنا',
      allRightsReserved: 'جميع الحقوق محفوظة',
    },
    
    // Product Actions
    product: {
      addToCart: 'أضف للسلة',
      buyNow: 'اشتري الآن',
      outOfStock: 'نفذت الكمية',
      inStock: 'متوفر',
      price: 'السعر',
      oldPrice: 'السعر القديم',
      discount: 'خصم',
      quantity: 'الكمية',
      description: 'الوصف',
      reviews: 'التقييمات',
      specifications: 'المواصفات',
      relatedProducts: 'منتجات مشابهة',
      viewDetails: 'عرض التفاصيل',
      vatIncluded: 'شامل الضريبة',
    },
    
    // Cart
    cart: {
      title: 'سلة التسوق',
      empty: 'السلة فارغة',
      continueShopping: 'تابع التسوق',
      checkout: 'إتمام الشراء',
      subtotal: 'المجموع الفرعي',
      shipping: 'الشحن',
      total: 'المجموع الكلي',
      remove: 'حذف',
      update: 'تحديث',
      itemsInCart: 'منتج في السلة',
      freeShipping: 'شحن مجاني',
      shippingFee: 'رسوم الشحن',
    },
    
    // Checkout
    checkout: {
      title: 'إتمام الطلب',
      shippingAddress: 'عنوان التوصيل',
      paymentMethod: 'طريقة الدفع',
      orderSummary: 'ملخص الطلب',
      firstName: 'الاسم الأول',
      lastName: 'اسم العائلة',
      phone: 'رقم الهاتف',
      email: 'البريد الإلكتروني',
      address: 'العنوان',
      city: 'المدينة',
      state: 'المحافظة',
      zipCode: 'الرمز البريدي',
      cashOnDelivery: 'الدفع عند الاستلام',
      creditCard: 'بطاقة ائتمان',
      placeOrder: 'تأكيد الطلب',
      processing: 'جاري المعالجة...',
    },
    
    // User Account
    account: {
      myAccount: 'حسابي',
      profile: 'الملف الشخصي',
      orders: 'طلباتي',
      addresses: 'عناويني',
      wishlist: 'المفضلة',
      settings: 'الإعدادات',
      orderHistory: 'سجل الطلبات',
      orderNumber: 'رقم الطلب',
      orderDate: 'تاريخ الطلب',
      orderStatus: 'حالة الطلب',
      orderTotal: 'إجمالي الطلب',
      viewOrder: 'عرض الطلب',
      trackOrder: 'تتبع الطلب',
      saveChanges: 'حفظ التغييرات',
      cancel: 'إلغاء',
    },
    
    // Order Status
    orderStatus: {
      pending: 'قيد الانتظار',
      processing: 'قيد المعالجة',
      shipped: 'تم الشحن',
      delivered: 'تم التوصيل',
      cancelled: 'ملغي',
      refunded: 'مُسترجع',
    },
    
    // Messages & Alerts
    messages: {
      addedToCart: 'تمت الإضافة للسلة بنجاح',
      removedFromCart: 'تم الحذف من السلة',
      orderPlaced: 'تم تقديم طلبك بنجاح',
      orderFailed: 'فشل في تقديم الطلب',
      loginRequired: 'يجب تسجيل الدخول أولاً',
      loginSuccess: 'تم تسجيل الدخول بنجاح',
      loginFailed: 'فشل تسجيل الدخول',
      registrationSuccess: 'تم التسجيل بنجاح',
      registrationFailed: 'فشل التسجيل',
      updateSuccess: 'تم التحديث بنجاح',
      updateFailed: 'فشل التحديث',
      deleteConfirm: 'هل أنت متأكد من الحذف؟',
      yes: 'نعم',
      no: 'لا',
      confirm: 'تأكيد',
      loading: 'جاري التحميل...',
      error: 'حدث خطأ',
      success: 'تمت العملية بنجاح',
    },
    
    // Search & Filter
    filter: {
      filterBy: 'تصفية بواسطة',
      sortBy: 'ترتيب بواسطة',
      priceRange: 'نطاق السعر',
      category: 'القسم',
      brand: 'العلامة التجارية',
      rating: 'التقييم',
      availability: 'التوفر',
      applyFilters: 'تطبيق',
      clearFilters: 'مسح الكل',
      showingResults: 'عرض النتائج',
      noResults: 'لا توجد نتائج',
      searchResults: 'نتائج البحث عن',
    },
    
    // Home Page
    home: {
      heroTitle: 'مرحباً بك في علوش سوبر ماركت',
      heroSubtitle: 'أفضل المنتجات بأسعار تنافسية',
      shopNow: 'تسوق الآن',
      featuredProducts: 'منتجات مميزة',
      hotDeals: 'العروض الساخنة',
      hotDealsDescription: 'عروض نارية لفترة محدودة!',
      magazine: 'مجلة العروض',
      magazineDescription: 'تصفح عروض هذا الأسبوع',
      newArrivals: 'وصل حديثاً',
      categories: 'الأقسام',
      viewAll: 'عرض الكل',
      exploreMore: 'استكشف المزيد',
      featuredBrands: 'براندات مميزة',
    },
    
    // Common
    common: {
      save: 'حفظ',
      edit: 'تعديل',
      delete: 'حذف',
      close: 'إغلاق',
      back: 'رجوع',
      next: 'التالي',
      previous: 'السابق',
      submit: 'إرسال',
      reset: 'إعادة تعيين',
      clear: 'مسح',
      select: 'اختر',
      upload: 'رفع',
      download: 'تحميل',
      print: 'طباعة',
      share: 'مشاركة',
      copy: 'نسخ',
      copied: 'تم النسخ',
      more: 'المزيد',
      less: 'أقل',
      showMore: 'عرض المزيد',
      showLess: 'عرض أقل',
      readMore: 'اقرأ المزيد',
      required: 'مطلوب',
      optional: 'اختياري',
      egp: 'ج.م',
      currency: 'ج.م',
      piece: 'قطعة',
      kg: 'كجم',
      liter: 'لتر',
    },
  },
  
  // ============================================
  // English Translations
  // ============================================
  en: {
    // Header
    header: {
      home: 'Home',
      categories: 'Categories',
      deals: 'Weekly Deals',
      seasonal: 'Ramadan Offers',
      orders: 'My Orders',
      cart: 'Cart',
      account: 'My Account',
      login: 'Login',
      logout: 'Logout',
      search: 'Search for products or categories...',
      switchToEnglish: 'العربية',
      open24Hours: 'Open 24 Hours',
      deliveryTo: 'Delivery To',
      selectBranch: 'Select Branch',
      hotline: 'Hotline',
      rewards: 'Allosh Rewards',
      logoTitle: 'Allosh',
      logoSubtitle: 'Market',
      searchPlaceholder: 'What do you want to cook today?',
      clearSearch: 'Clear Search',
      suggestions: 'Suggestions',
      searchFor: 'Search for',
      openSearch: 'Open Search',
      welcomeBack: 'Welcome Back',
      openMenu: 'Open Menu',
      searchProducts: 'Search for products...',
      getRewards: 'Get points and rewards',
      ramadan: 'Ramadan Kareem',
      ramadanDescription: 'Order your Ramadan box now, delivered to your door.',
      orderNow: 'Order Now',
    },
    
    // Footer
    footer: {
      about: 'About Us',
      aboutText: 'Allosh Supermarket - Best Products at Competitive Prices',
      customerService: 'Customer Service',
      contactUs: 'Contact Us',
      shippingInfo: 'Shipping Information',
      returnPolicy: 'Return Policy',
      termsConditions: 'Terms & Conditions',
      privacy: 'Privacy Policy',
      quickLinks: 'Quick Links',
      allProducts: 'All Products',
      hotDeals: 'Hot Deals',
      newArrivals: 'New Arrivals',
      followUs: 'Follow Us',
      allRightsReserved: 'All Rights Reserved',
    },
    
    // Product Actions
    product: {
      addToCart: 'Add to Cart',
      buyNow: 'Buy Now',
      outOfStock: 'Out of Stock',
      inStock: 'In Stock',
      price: 'Price',
      oldPrice: 'Old Price',
      discount: 'Discount',
      quantity: 'Quantity',
      description: 'Description',
      reviews: 'Reviews',
      specifications: 'Specifications',
      relatedProducts: 'Related Products',
      viewDetails: 'View Details',
      vatIncluded: 'Tax Included',
    },
    
    // Cart
    cart: {
      title: 'Shopping Cart',
      empty: 'Your cart is empty',
      continueShopping: 'Continue Shopping',
      checkout: 'Checkout',
      subtotal: 'Subtotal',
      shipping: 'Shipping',
      total: 'Total',
      remove: 'Remove',
      update: 'Update',
      itemsInCart: 'items in cart',
      freeShipping: 'Free Shipping',
      shippingFee: 'Shipping Fee',
    },
    
    // Checkout
    checkout: {
      title: 'Checkout',
      shippingAddress: 'Shipping Address',
      paymentMethod: 'Payment Method',
      orderSummary: 'Order Summary',
      firstName: 'First Name',
      lastName: 'Last Name',
      phone: 'Phone Number',
      email: 'Email',
      address: 'Address',
      city: 'City',
      state: 'State',
      zipCode: 'Zip Code',
      cashOnDelivery: 'Cash on Delivery',
      creditCard: 'Credit Card',
      placeOrder: 'Place Order',
      processing: 'Processing...',
    },
    
    // User Account
    account: {
      myAccount: 'My Account',
      profile: 'Profile',
      orders: 'Orders',
      addresses: 'Addresses',
      wishlist: 'Wishlist',
      settings: 'Settings',
      orderHistory: 'Order History',
      orderNumber: 'Order #',
      orderDate: 'Order Date',
      orderStatus: 'Status',
      orderTotal: 'Total',
      viewOrder: 'View Order',
      trackOrder: 'Track Order',
      saveChanges: 'Save Changes',
      cancel: 'Cancel',
    },
    
    // Order Status
    orderStatus: {
      pending: 'Pending',
      processing: 'Processing',
      shipped: 'Shipped',
      delivered: 'Delivered',
      cancelled: 'Cancelled',
      refunded: 'Refunded',
    },
    
    // Messages & Alerts
    messages: {
      addedToCart: 'Added to cart successfully',
      removedFromCart: 'Removed from cart',
      orderPlaced: 'Order placed successfully',
      orderFailed: 'Failed to place order',
      loginRequired: 'Please login first',
      loginSuccess: 'Login successful',
      loginFailed: 'Login failed',
      registrationSuccess: 'Registration successful',
      registrationFailed: 'Registration failed',
      updateSuccess: 'Updated successfully',
      updateFailed: 'Update failed',
      deleteConfirm: 'Are you sure you want to delete?',
      yes: 'Yes',
      no: 'No',
      confirm: 'Confirm',
      loading: 'Loading...',
      error: 'An error occurred',
      success: 'Operation successful',
    },
    
    // Search & Filter
    filter: {
      filterBy: 'Filter By',
      sortBy: 'Sort By',
      priceRange: 'Price Range',
      category: 'Category',
      brand: 'Brand',
      rating: 'Rating',
      availability: 'Availability',
      applyFilters: 'Apply',
      clearFilters: 'Clear All',
      showingResults: 'Showing Results',
      noResults: 'No Results Found',
      searchResults: 'Search Results for',
    },
    
    // Home Page
    home: {
      heroTitle: 'Welcome to Allosh Supermarket',
      heroSubtitle: 'Best Products at Competitive Prices',
      shopNow: 'Shop Now',
      featuredProducts: 'Featured Products',
      hotDeals: 'Hot Deals',
      hotDealsDescription: 'Fire deals for a limited time!',
      magazine: 'Offers Magazine',
      magazineDescription: 'Browse this week\'s offers',
      newArrivals: 'New Arrivals',
      categories: 'Categories',
      viewAll: 'View All',
      exploreMore: 'Explore More',
      featuredBrands: 'Featured Brands',
    },
    
    // Common
    common: {
      save: 'Save',
      edit: 'Edit',
      delete: 'Delete',
      close: 'Close',
      back: 'Back',
      next: 'Next',
      previous: 'Previous',
      submit: 'Submit',
      reset: 'Reset',
      clear: 'Clear',
      select: 'Select',
      upload: 'Upload',
      download: 'Download',
      print: 'Print',
      share: 'Share',
      copy: 'Copy',
      copied: 'Copied',
      more: 'More',
      less: 'Less',
      showMore: 'Show More',
      showLess: 'Show Less',
      readMore: 'Read More',
      required: 'Required',
      optional: 'Optional',
      egp: 'EGP',
      currency: 'EGP',
      piece: 'Piece',
      kg: 'KG',
      liter: 'Liter',
    },
  },
};
