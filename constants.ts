
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
