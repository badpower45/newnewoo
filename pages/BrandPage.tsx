import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { 
    ArrowLeft, Tag, Star, Percent, ShoppingBag, 
    Gift, Sparkles, ChevronRight, Heart, Share2,
    Clock, TrendingUp, Award, Zap, Timer, Flame,
    Package, Truck, BadgePercent, Crown
} from 'lucide-react';
import ProductCard from '../components/ProductCard';
import TopBar from '../components/TopBar';
import { api } from '../services/api';
import { useBranch } from '../context/BranchContext';

// بيانات البراندات - يمكن نقلها لقاعدة البيانات لاحقاً
const BRANDS_DATA: { [key: string]: BrandInfo } = {
    'pepsi': {
        id: 'pepsi',
        name: 'بيبسي',
        nameEn: 'Pepsi',
        logo: 'https://upload.wikimedia.org/wikipedia/commons/thumb/0/0f/Pepsi_logo_2014.svg/800px-Pepsi_logo_2014.svg.png',
        banner: 'https://images.unsplash.com/photo-1629203851122-3726ecdf080e?w=1200',
        description: 'استمتع بمشروبات بيبسي المنعشة! عروض حصرية على جميع منتجات بيبسي.',
        tagline: 'عيش اللحظة',
        primaryColor: '#004B93',
        secondaryColor: '#C9002B',
        gradientFrom: '#004B93',
        gradientTo: '#0066CC',
        keywords: ['pepsi', 'بيبسي', 'بيبسى', 'pepsico'],
        offerBadge: 'خصم حتى 30%',
        featured: true
    },
    'cocacola': {
        id: 'cocacola',
        name: 'كوكاكولا',
        nameEn: 'Coca-Cola',
        logo: 'https://upload.wikimedia.org/wikipedia/commons/thumb/c/ce/Coca-Cola_logo.svg/800px-Coca-Cola_logo.svg.png',
        banner: 'https://images.unsplash.com/photo-1554866585-cd94860890b7?w=1200',
        description: 'افتح فرحة مع كوكاكولا! اكتشف عروضنا المميزة.',
        tagline: 'افتح فرحة',
        primaryColor: '#F40009',
        secondaryColor: '#FFFFFF',
        gradientFrom: '#F40009',
        gradientTo: '#B8000A',
        keywords: ['coca', 'cola', 'كوكاكولا', 'كوكا كولا', 'كولا'],
        offerBadge: 'اشتري 2 واحصل على 1 مجاناً',
        featured: true
    },
    'nestle': {
        id: 'nestle',
        name: 'نستله',
        nameEn: 'Nestlé',
        logo: 'https://upload.wikimedia.org/wikipedia/commons/thumb/8/8e/Nestl%C3%A9.svg/800px-Nestl%C3%A9.svg.png',
        banner: 'https://images.unsplash.com/photo-1606312619070-d48b4c652a52?w=1200',
        description: 'جودة نستله العالمية. منتجات غذائية متنوعة للعائلة.',
        tagline: 'Good Food, Good Life',
        primaryColor: '#7B7979',
        secondaryColor: '#FFFFFF',
        gradientFrom: '#5C5C5C',
        gradientTo: '#8B8B8B',
        keywords: ['nestle', 'نستله', 'نسله'],
        offerBadge: 'عروض العائلة',
        featured: true
    },
    'nescafe': {
        id: 'nescafe',
        name: 'نسكافيه',
        nameEn: 'Nescafé',
        logo: 'https://upload.wikimedia.org/wikipedia/commons/thumb/8/8e/Nestl%C3%A9.svg/800px-Nestl%C3%A9.svg.png',
        banner: 'https://images.unsplash.com/photo-1509042239860-f550ce710b93?w=1200',
        description: 'ابدأ يومك مع نسكافيه! قهوة بنكهة لا تُنسى.',
        tagline: 'It all starts with a Nescafé',
        primaryColor: '#D32F2F',
        secondaryColor: '#000000',
        gradientFrom: '#8B0000',
        gradientTo: '#D32F2F',
        keywords: ['nescafe', 'نسكافيه', 'نسكافية', 'coffee', 'قهوة'],
        offerBadge: 'خصم 25% على القهوة',
        featured: true
    },
    'chipsy': {
        id: 'chipsy',
        name: 'شيبسي',
        nameEn: 'Chipsy',
        logo: 'https://ui-avatars.com/api/?name=Chipsy&size=128&background=FF6B00&color=fff',
        banner: 'https://images.unsplash.com/photo-1566478989037-eec170784d0b?w=1200',
        description: 'شيبسي... طعم لا يُقاوم! اكتشف نكهاتنا المتنوعة.',
        tagline: 'طعم لا يُقاوم',
        primaryColor: '#FF6B00',
        secondaryColor: '#FFD700',
        gradientFrom: '#FF6B00',
        gradientTo: '#FF8C00',
        keywords: ['chipsy', 'شيبسي', 'chips', 'شيبس'],
        offerBadge: 'عرض 3 بسعر 2',
        featured: false
    },
    'juhayna': {
        id: 'juhayna',
        name: 'جهينة',
        nameEn: 'Juhayna',
        logo: 'https://ui-avatars.com/api/?name=Juhayna&size=128&background=0072CE&color=fff',
        banner: 'https://images.unsplash.com/photo-1550583724-b2692b85b150?w=1200',
        description: 'منتجات ألبان جهينة الطازجة. جودة وطعم لا مثيل لهما.',
        tagline: 'طبيعي وطازج',
        primaryColor: '#0072CE',
        secondaryColor: '#FFFFFF',
        gradientFrom: '#0072CE',
        gradientTo: '#00A0E3',
        keywords: ['juhayna', 'جهينة', 'جهينه'],
        offerBadge: 'خصم 20% على الألبان',
        featured: true
    }
};

interface BrandInfo {
    id: string;
    name: string;
    nameEn: string;
    logo: string;
    banner: string;
    description: string;
    tagline: string;
    primaryColor: string;
    secondaryColor: string;
    gradientFrom: string;
    gradientTo: string;
    keywords: string[];
    offerBadge: string;
    featured: boolean;
}

const BrandPage = () => {
    const { brandName } = useParams<{ brandName: string }>();
    const { selectedBranch } = useBranch();
    const [brand, setBrand] = useState<any>(null);
    const [products, setProducts] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [activeTab, setActiveTab] = useState<'all' | 'offers' | 'new'>('all');
    const [isFavorite, setIsFavorite] = useState(false);

    // Handle Favorite Toggle
    const handleFavoriteToggle = () => {
        setIsFavorite(!isFavorite);
        // يمكن إضافة API call هنا لحفظ في قاعدة البيانات
        const message = !isFavorite ? 'تم إضافة البراند للمفضلة! ❤️' : 'تم إزالة البراند من المفضلة';
        if (typeof window !== 'undefined' && 'toast' in window) {
            (window as any).toast?.success?.(message);
        }
    };

    // Handle Share
    const handleShare = async () => {
        const shareData = {
            title: brand.name,
            text: `${brand.name} - ${brand.tagline}\n${brand.description}`,
            url: window.location.href
        };

        try {
            if (navigator.share) {
                await navigator.share(shareData);
            } else {
                // Fallback: Copy to clipboard
                await navigator.clipboard.writeText(window.location.href);
                if (typeof window !== 'undefined' && 'toast' in window) {
                    (window as any).toast?.success?.('تم نسخ الرابط! 🔗');
                }
            }
        } catch (err) {
            console.error('Error sharing:', err);
        }
    };

    const slugify = (value: string = '') =>
        value
            .toString()
            .trim()
            .toLowerCase()
            .replace(/أ|إ|آ/g, 'ا')
            .replace(/ة/g, 'ه')
            .replace(/ى/g, 'ي')
            .replace(/\s+/g, '-');

    const normalize = (value: string = '') =>
        value
            .toString()
            .trim()
            .toLowerCase()
            .replace(/أ|إ|آ/g, 'ا')
            .replace(/ة/g, 'ه')
            .replace(/ى/g, 'ي');

    useEffect(() => {
        if (brandName) {
            loadBrandData();
        }
    }, [brandName, selectedBranch]);

    const loadBrandData = async () => {
        setLoading(true);
        try {
            // Try to load from database first
            const response = await api.brands.getAll();
            const allBrands = Array.isArray(response) ? response : response.data || [];
            
            // Find brand by name (English or Arabic)
            const foundBrand = allBrands.find((b: any) => {
                const slug = slugify(brandName || '');
                return slugify(b.name_en) === slug || slugify(b.name_ar) === slug || String(b.id) === String(brandName);
            });

            if (foundBrand) {
                // Use database brand with custom colors
                setBrand({
                    ...foundBrand,
                    name: foundBrand.name_ar || foundBrand.name,
                    nameEn: foundBrand.name_en || foundBrand.nameEn,
                    logo: foundBrand.logo_url || foundBrand.logo,
                    banner: foundBrand.banner_url || foundBrand.banner,
                    tagline: foundBrand.tagline_ar || foundBrand.tagline || foundBrand.slogan_ar || foundBrand.slogan_en,
                    offerBadge: foundBrand.offer_badge || foundBrand.offerBadge,
                    primaryColor: foundBrand.primary_color || '#F97316',
                    secondaryColor: foundBrand.secondary_color || '#EA580C',
                    gradientFrom: foundBrand.primary_color || '#F97316',
                    gradientTo: foundBrand.secondary_color || '#EA580C'
                });
                await loadBrandProducts(foundBrand.name_en || foundBrand.name_ar);
            } else {
                // Fallback to static data
                const brandKey = brandName.toLowerCase();
                const staticBrand = BRANDS_DATA[brandKey];
                if (staticBrand) {
                    setBrand(staticBrand);
                    await loadBrandProducts(staticBrand);
                } else {
                    setBrand(null);
                }
            }
        } catch (error) {
            console.error('Error loading brand:', error);
            // Fallback to static data
            const brandKey = brandName.toLowerCase();
            const staticBrand = BRANDS_DATA[brandKey];
            if (staticBrand) {
                setBrand(staticBrand);
                await loadBrandProducts(staticBrand);
            }
        }
        setLoading(false);
    };

    const loadBrandProducts = async (brandInfo: any) => {
        if (!brandInfo) return;

        try {
            const res = selectedBranch 
                ? await api.products.getAllByBranch(selectedBranch.id)
                : await api.products.getAll();
            
            const allProducts = res.data || res || [];
            const brandId = brandInfo.id;
            const keywords = brandInfo.keywords || [
                brandInfo.name_en,
                brandInfo.name_ar,
                brandInfo.nameEn,
                brandInfo.name,
                brandInfo.slogan_ar,
                brandInfo.slogan_en,
                brandInfo.tagline
            ].filter(Boolean).map((k: string) => normalize(k));
            
            const brandProducts = allProducts.filter((p: any) => {
                const productBrandId = p.brand_id ?? p.brandId;
                const matchesId = brandId && productBrandId && String(productBrandId) === String(brandId);
                const productBrandName = normalize(p.brand_name || p.brand);
                const productName = normalize(p.name);
                const productDesc = normalize(p.description);
                const productCategory = normalize(p.category);
                
                const matchesKeyword = keywords.some((keyword: string) => 
                    productName.includes(keyword) ||
                    productDesc.includes(keyword) ||
                    productCategory.includes(keyword) ||
                    productBrandName.includes(keyword)
                );
                
                return matchesId || matchesKeyword;
            });
            
            setProducts(brandProducts);
        } catch (err) {
            console.error('Failed to load brand products:', err);
        }
    };

    // فلترة المنتجات حسب التاب
    const filteredProducts = products.filter(p => {
        if (activeTab === 'offers') {
            return p.discount_price && p.discount_price > p.price;
        }
        if (activeTab === 'new') {
            return p.is_new;
        }
        return true;
    });

    // Loading skeleton while fetching brand data
    if (loading || !brand) {
        return (
            <div className="min-h-screen bg-gray-50">
                {/* Header Skeleton */}
                <div className="bg-white p-4 border-b">
                    <div className="h-6 w-32 bg-gray-200 rounded animate-pulse"></div>
                </div>
                
                {/* Hero Banner Skeleton */}
                <div className="relative h-96 bg-gradient-to-br from-gray-200 to-gray-300 animate-pulse">
                    <div className="absolute inset-0 flex items-center justify-center">
                        <div className="w-32 h-32 bg-gray-300 rounded-full animate-pulse"></div>
                    </div>
                </div>

                {/* Tabs Skeleton */}
                <div className="bg-white border-b p-4">
                    <div className="flex gap-3 justify-center">
                        {[1, 2, 3].map(i => (
                            <div key={i} className="h-10 w-24 bg-gray-200 rounded-full animate-pulse"></div>
                        ))}
                    </div>
                </div>

                {/* Products Grid Skeleton */}
                <div className="max-w-7xl mx-auto px-4 py-6">
                    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                        {[...Array(8)].map((_, i) => (
                            <div key={i} className="bg-white rounded-2xl p-4 animate-pulse">
                                <div className="aspect-square bg-gray-200 rounded-xl mb-3"></div>
                                <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
                                <div className="h-4 bg-gray-200 rounded w-1/2"></div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-50">
            {/* Hero Banner */}
            <div 
                className="relative h-[300px] md:h-[400px] overflow-hidden"
                style={{
                    background: `linear-gradient(135deg, ${brand.gradientFrom}, ${brand.gradientTo})`
                }}
            >
                {/* Background Pattern */}
                <div className="absolute inset-0 opacity-10">
                    <div className="absolute inset-0" style={{
                        backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ffffff' fill-opacity='1'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
                    }} />
                </div>

                {/* Banner Image Overlay */}
                <div 
                    className="absolute inset-0 bg-cover bg-center opacity-30"
                    style={{ backgroundImage: `url(${brand.banner})` }}
                />

                {/* Content */}
                <div className="relative z-10 h-full flex flex-col">
                    {/* Top Bar */}
                    <div className="flex items-center justify-between p-4">
                        <Link 
                            to="/brands" 
                            className="w-10 h-10 bg-white/20 backdrop-blur-sm rounded-full flex items-center justify-center text-white hover:bg-white/30 transition"
                        >
                            <ArrowLeft size={20} />
                        </Link>
                        <div className="flex gap-2">
                            <button 
                                onClick={handleFavoriteToggle}
                                className={`w-10 h-10 backdrop-blur-sm rounded-full flex items-center justify-center transition-all ${
                                    isFavorite 
                                        ? 'bg-red-500 text-white' 
                                        : 'bg-white/20 text-white hover:bg-white/30'
                                }`}
                            >
                                <Heart size={20} className={isFavorite ? 'fill-current' : ''} />
                            </button>
                            <button 
                                onClick={handleShare}
                                className="w-10 h-10 bg-white/20 backdrop-blur-sm rounded-full flex items-center justify-center text-white hover:bg-white/30 transition"
                            >
                                <Share2 size={20} />
                            </button>
                        </div>
                    </div>

                    {/* Brand Info */}
                    <div className="flex-1 flex flex-col items-center justify-center text-center px-4">
                        {/* Logo */}
                        <div className="w-24 h-24 md:w-32 md:h-32 bg-white rounded-2xl shadow-2xl p-4 mb-4 flex items-center justify-center">
                            <img 
                                src={brand.logo} 
                                alt={brand.name}
                                className="max-w-full max-h-full object-contain"
                                onError={(e) => {
                                    (e.target as HTMLImageElement).src = `https://ui-avatars.com/api/?name=${brand.nameEn}&size=128&background=random`;
                                }}
                            />
                        </div>
                        
                        <h1 className="text-3xl md:text-4xl font-bold text-white mb-2 drop-shadow-lg">
                            {brand.name}
                        </h1>
                        <p className="text-white/80 text-lg mb-4">{brand.tagline}</p>
                        
                        {/* Offer Badge */}
                        {brand.offerBadge && (
                            <div className="inline-flex items-center gap-2 bg-white/20 backdrop-blur-sm text-white px-6 py-3 rounded-full font-bold animate-pulse">
                                <Gift size={20} />
                                {brand.offerBadge}
                            </div>
                        )}
                    </div>

                    {/* Wave Bottom */}
                    <svg className="absolute bottom-0 w-full" viewBox="0 0 1440 100" fill="none">
                        <path 
                            d="M0 50L48 45.8333C96 41.6667 192 33.3333 288 35.4167C384 37.5 480 50 576 54.1667C672 58.3333 768 54.1667 864 47.9167C960 41.6667 1056 33.3333 1152 35.4167C1248 37.5 1344 50 1392 56.25L1440 62.5V100H1392C1344 100 1248 100 1152 100C1056 100 960 100 864 100C768 100 672 100 576 100C480 100 384 100 288 100C192 100 96 100 48 100H0V50Z" 
                            fill="#F9FAFB"
                        />
                    </svg>
                </div>
            </div>

            {/* Stats Bar */}
            <div className="bg-white border-b">
                <div className="max-w-7xl mx-auto px-4 py-4">
                    <div className="flex items-center justify-around">
                        <div className="text-center">
                            <div className="flex items-center justify-center gap-1 text-2xl font-bold" style={{ color: brand.primaryColor }}>
                                <ShoppingBag size={20} />
                                {products.length}
                            </div>
                            <p className="text-xs text-gray-500">منتج</p>
                        </div>
                        <div className="text-center">
                            <div className="flex items-center justify-center gap-1 text-2xl font-bold text-yellow-500">
                                <Star size={20} fill="currentColor" />
                                4.8
                            </div>
                            <p className="text-xs text-gray-500">تقييم</p>
                        </div>
                        <div className="text-center">
                            <div className="flex items-center justify-center gap-1 text-2xl font-bold text-green-500">
                                <Percent size={20} />
                                {products.filter(p => p.discount_price).length}
                            </div>
                            <p className="text-xs text-gray-500">عرض</p>
                        </div>
                    </div>
                </div>
            </div>

            {/* Flash Sale Banner */}
            <div className="max-w-7xl mx-auto px-4 py-4">
                <div 
                    className="relative rounded-2xl overflow-hidden p-6"
                    style={{ background: `linear-gradient(135deg, ${brand.gradientFrom}dd, ${brand.gradientTo}dd)` }}
                >
                    <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full -mr-16 -mt-16" />
                    <div className="absolute bottom-0 left-0 w-24 h-24 bg-white/10 rounded-full -ml-12 -mb-12" />
                    
                    <div className="relative flex items-center justify-between">
                        <div className="text-white">
                            <div className="flex items-center gap-2 mb-2">
                                <Flame className="text-yellow-300 animate-pulse" size={24} />
                                <span className="text-sm font-bold bg-white/20 px-3 py-1 rounded-full">عرض محدود</span>
                            </div>
                            <h3 className="text-xl md:text-2xl font-bold mb-1">عروض {brand.name} الحصرية!</h3>
                            <p className="text-white/80 text-sm">وفّر حتى 40% على منتجات مختارة</p>
                        </div>
                        <div className="hidden md:flex items-center gap-2 bg-white text-gray-900 px-4 py-2 rounded-full">
                            <Timer size={18} className="text-red-500" />
                            <span className="font-bold">ينتهي قريباً</span>
                        </div>
                    </div>
                </div>
            </div>

            {/* Quick Offers Grid */}
            <div className="max-w-7xl mx-auto px-4 py-2">
                <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                    <div className="bg-gradient-to-br from-red-500 to-red-600 rounded-xl p-4 text-white text-center">
                        <BadgePercent size={28} className="mx-auto mb-2" />
                        <p className="font-bold text-lg">خصم 30%</p>
                        <p className="text-xs text-white/80">على المشروبات</p>
                    </div>
                    <div className="bg-gradient-to-br from-green-500 to-green-600 rounded-xl p-4 text-white text-center">
                        <Package size={28} className="mx-auto mb-2" />
                        <p className="font-bold text-lg">2+1 مجاناً</p>
                        <p className="text-xs text-white/80">على العبوات الكبيرة</p>
                    </div>
                    <div className="bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl p-4 text-white text-center">
                        <Truck size={28} className="mx-auto mb-2" />
                        <p className="font-bold text-lg">توصيل مجاني</p>
                        <p className="text-xs text-white/80">للطلبات +200 ج.م</p>
                    </div>
                    <div className="bg-gradient-to-br from-purple-500 to-purple-600 rounded-xl p-4 text-white text-center">
                        <Crown size={28} className="mx-auto mb-2" />
                        <p className="font-bold text-lg">نقاط مضاعفة</p>
                        <p className="text-xs text-white/80">x2 نقاط ولاء</p>
                    </div>
                </div>
            </div>

            {/* Description */}
            <div className="max-w-7xl mx-auto px-4 py-4">
                <div className="bg-white rounded-2xl p-6 shadow-sm border">
                    <p className="text-gray-600 text-center">{brand.description}</p>
                </div>
            </div>

            {/* Promotional Banner */}
            <div className="max-w-7xl mx-auto px-4 py-2">
                <div className="relative h-32 md:h-40 rounded-2xl overflow-hidden bg-gradient-to-r from-gray-900 to-gray-700">
                    <img 
                        src={brand.banner} 
                        alt="Promo" 
                        className="absolute inset-0 w-full h-full object-cover opacity-40"
                    />
                    <div className="relative h-full flex items-center justify-center text-center px-4">
                        <div>
                            <p className="text-white/80 text-sm mb-1">اكتشف تشكيلتنا الجديدة</p>
                            <h3 className="text-white text-xl md:text-2xl font-bold">منتجات {brand.name} الجديدة</h3>
                        </div>
                    </div>
                </div>
            </div>

            {/* Tabs */}
            <div className="sticky top-0 z-20 bg-gray-50 border-b">
                <div className="max-w-7xl mx-auto px-4">
                    <div className="flex gap-2 py-3 overflow-x-auto no-scrollbar">
                        <button
                            onClick={() => setActiveTab('all')}
                            className={`flex items-center gap-2 px-6 py-2.5 rounded-full font-medium transition whitespace-nowrap ${
                                activeTab === 'all'
                                    ? 'text-white shadow-lg'
                                    : 'bg-white text-gray-600 hover:bg-gray-100'
                            }`}
                            style={activeTab === 'all' ? { backgroundColor: brand.primaryColor } : {}}
                        >
                            <ShoppingBag size={18} />
                            جميع المنتجات
                        </button>
                        <button
                            onClick={() => setActiveTab('offers')}
                            className={`flex items-center gap-2 px-6 py-2.5 rounded-full font-medium transition whitespace-nowrap ${
                                activeTab === 'offers'
                                    ? 'bg-red-500 text-white shadow-lg'
                                    : 'bg-white text-gray-600 hover:bg-gray-100'
                            }`}
                        >
                            <Zap size={18} />
                            العروض
                        </button>
                        <button
                            onClick={() => setActiveTab('new')}
                            className={`flex items-center gap-2 px-6 py-2.5 rounded-full font-medium transition whitespace-nowrap ${
                                activeTab === 'new'
                                    ? 'bg-green-500 text-white shadow-lg'
                                    : 'bg-white text-gray-600 hover:bg-gray-100'
                            }`}
                        >
                            <Sparkles size={18} />
                            جديد
                        </button>
                    </div>
                </div>
            </div>

            {/* Products Grid */}
            <div className="max-w-7xl mx-auto px-4 py-6">
                {loading ? (
                    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                        {[...Array(8)].map((_, i) => (
                            <div key={i} className="bg-white rounded-2xl p-4 animate-pulse">
                                <div className="aspect-square bg-gray-200 rounded-xl mb-3" />
                                <div className="h-4 bg-gray-200 rounded mb-2" />
                                <div className="h-4 bg-gray-200 rounded w-1/2" />
                            </div>
                        ))}
                    </div>
                ) : filteredProducts.length > 0 ? (
                    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                        {filteredProducts.map(product => (
                            <ProductCard 
                                key={product.id} 
                                product={product}
                            />
                        ))}
                    </div>
                ) : (
                    <div className="text-center py-16">
                        <ShoppingBag size={64} className="mx-auto text-gray-300 mb-4" />
                        <h3 className="text-lg font-medium text-gray-800 mb-2">
                            {activeTab === 'offers' ? 'لا توجد عروض حالياً' : 
                             activeTab === 'new' ? 'لا توجد منتجات جديدة' : 
                             'لا توجد منتجات'}
                        </h3>
                        <p className="text-gray-500">
                            {activeTab === 'all' 
                                ? `لم نجد منتجات لـ ${brand.name} في هذا الفرع`
                                : 'جرب تصفح جميع المنتجات'}
                        </p>
                    </div>
                )}
            </div>

            {/* Featured Brands Section */}
            <div className="max-w-7xl mx-auto px-4 py-8 border-t">
                <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
                    <Award size={20} style={{ color: brand.primaryColor }} />
                    براندات أخرى
                </h3>
                <div className="flex gap-4 overflow-x-auto no-scrollbar pb-2">
                    {Object.values(BRANDS_DATA)
                        .filter(b => b.id !== brand.id)
                        .map(b => (
                            <Link
                                key={b.id}
                                to={`/brand/${b.id}`}
                                className="flex-shrink-0 bg-white rounded-2xl p-4 shadow-sm border hover:shadow-md transition w-32"
                            >
                                <div className="w-16 h-16 mx-auto mb-2 rounded-xl overflow-hidden bg-gray-50 flex items-center justify-center p-2">
                                    <img 
                                        src={b.logo}
                                        alt={b.name}
                                        className="max-w-full max-h-full object-contain"
                                        onError={(e) => {
                                            (e.target as HTMLImageElement).src = `https://ui-avatars.com/api/?name=${b.nameEn}&size=64&background=random`;
                                        }}
                                    />
                                </div>
                                <p className="text-center text-sm font-medium text-gray-800">{b.name}</p>
                            </Link>
                        ))}
                </div>
            </div>

            <style>{`
                .no-scrollbar::-webkit-scrollbar {
                    display: none;
                }
                .no-scrollbar {
                    -ms-overflow-style: none;
                    scrollbar-width: none;
                }
            `}</style>
        </div>
    );
};

export default BrandPage;
