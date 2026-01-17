import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import {
    ArrowLeft, Percent, ShoppingBag,
    Gift, Heart, Share2,
    Award, Zap, Flame,
    BadgePercent
} from 'lucide-react';
import ProductCard from '../components/ProductCard';
import { api } from '../services/api';
import { useBranch } from '../context/BranchContext';
import { useCart } from '../context/CartContext';
import Seo, { getSiteUrl } from '../components/Seo';

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

const FAVORITE_BRANDS_KEY = 'favorite_brands';

const getStoredFavoriteBrands = () => {
    try {
        const saved = localStorage.getItem(FAVORITE_BRANDS_KEY);
        return saved ? JSON.parse(saved) : [];
    } catch (e) {
        console.error('Failed to parse favorite brands', e);
        return [];
    }
};

const BrandPage = () => {
    const { brandName } = useParams<{ brandName: string }>();
    const { selectedBranch } = useBranch();
    const [brand, setBrand] = useState<any>(null);
    const [products, setProducts] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [activeTab, setActiveTab] = useState<'all' | 'offers'>('all');
    const [otherBrands, setOtherBrands] = useState<any[]>([]);
    const [isFavorite, setIsFavorite] = useState(false);
    const [magazineOffers, setMagazineOffers] = useState<any[]>([]);
    const [loadingMagazine, setLoadingMagazine] = useState(false);
    const [addingOfferId, setAddingOfferId] = useState<number | null>(null);
    const [brandHotDeals, setBrandHotDeals] = useState<any[]>([]);
    const [loadingHotDeals, setLoadingHotDeals] = useState(false);
    const { addToCart } = useCart();
    const siteUrl = getSiteUrl();
    const canonicalUrl = `${siteUrl}/brand/${encodeURIComponent(brandName || '')}`;
    const brandData = brand as any;
    const brandDisplayName = brandData?.name || brandData?.name_ar || brandData?.name_en || brandData?.nameEn || brandName || 'البراند';
    const brandDescription = brandData?.description || brandData?.description_ar || brandData?.description_en || brandData?.tagline || 'اكتشف منتجات البراند المميزة من علوش ماركت.';
    const brandImage = brandData?.banner || brandData?.banner_url || brandData?.logo || brandData?.logo_url || brandData?.bannerImage;
    const brandKeywords = [
        brandData?.name,
        brandData?.name_ar,
        brandData?.name_en,
        brandData?.tagline,
        ...(brandData?.keywords || [])
    ].filter(Boolean) as string[];
    const brandStructuredData = brand
        ? {
            '@context': 'https://schema.org',
            '@type': 'Brand',
            name: brandDisplayName,
            description: brandDescription,
            url: canonicalUrl,
            logo: brandImage,
            image: brandImage,
            slogan: brandData?.tagline,
            hasOfferCatalog: products.slice(0, 8).map((p, index) => ({
                '@type': 'Offer',
                itemOffered: {
                    '@type': 'Product',
                    name: p.name,
                    image: p.image
                },
                priceCurrency: 'EGP',
                price: Number(p.price) || undefined,
                position: index + 1,
                url: `${siteUrl}/product/${p.id}`
            }))
        }
        : undefined;

    // Handle Favorite Toggle
    const handleFavoriteToggle = () => {
        if (!brand) return;

        const current = getStoredFavoriteBrands();
        const key = String(brand.id || brand.name_en || brand.name);
        const exists = current.some((b: any) => String(b.id || b.name_en || b.name) === key);

        let updated;
        if (exists) {
            updated = current.filter((b: any) => String(b.id || b.name_en || b.name) !== key);
        } else {
            updated = [
                ...current,
                {
                    id: brand.id || brand.name_en || brand.name,
                    name_ar: brand.name || brand.name_ar,
                    name_en: brand.name_en || brand.nameEn || brand.name,
                    logo_url: brand.logo || brand.logo_url || brand.banner || ''
                }
            ];
        }

        localStorage.setItem(FAVORITE_BRANDS_KEY, JSON.stringify(updated));
        setIsFavorite(!exists);

        const message = !exists ? 'تم إضافة البراند للمفضلة! ❤️' : 'تم إزالة البراند من المفضلة';
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
            loadOtherBrands();
        }
    }, [brandName, selectedBranch]);

    const loadOtherBrands = async () => {
        try {
            const response = await api.brands.getAll();
            const allBrands = Array.isArray(response) ? response : response.data || [];
            // Filter out current brand and get random 6 brands
            const filtered = allBrands.filter((b: any) => {
                const slug = slugify(brandName || '');
                return slugify(b.name_en) !== slug && slugify(b.name_ar) !== slug;
            });
            setOtherBrands(filtered.slice(0, 6));
        } catch (error) {
            console.error('Error loading other brands:', error);
        }
    };

    useEffect(() => {
        if (!brand) return;
        const current = getStoredFavoriteBrands();
        const key = String(brand.id || brand.name_en || brand.name);
        const exists = current.some((b: any) => String(b.id || b.name_en || b.name) === key);
        setIsFavorite(exists);
    }, [brand]);

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
                    description: foundBrand.description_ar || foundBrand.description_en || foundBrand.description,
                    tagline: foundBrand.slogan_ar || foundBrand.slogan_en || foundBrand.tagline_ar || foundBrand.tagline,
                    offerBadge: foundBrand.offer_badge || foundBrand.offerBadge,
                    primaryColor: foundBrand.primary_color || '#F97316',
                    secondaryColor: foundBrand.secondary_color || '#EA580C',
                    gradientFrom: foundBrand.primary_color || '#F97316',
                    gradientTo: foundBrand.secondary_color || '#EA580C'
                });
                await loadBrandProducts(foundBrand);
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
            // ✅ دائماً استخدم branch filter (توفير البيانات)
            const branchId = selectedBranch?.id || 1; // Default branch
            const res = await api.products.getAllByBranch(branchId, { includeMagazine: true });
            
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
            await loadBrandMagazineOffers(brandInfo);
            await loadBrandHotDeals(brandInfo);
        } catch (err) {
            console.error('Failed to load brand products:', err);
        }
    };

    const loadBrandMagazineOffers = async (brandInfo: any) => {
        if (!brandInfo?.id) {
            setMagazineOffers([]);
            return;
        }
        setLoadingMagazine(true);
        try {
            const res = await api.magazine.getAll(undefined, brandInfo.id);
            const data = Array.isArray(res) ? res : res?.data || [];
            setMagazineOffers(data);
        } catch (err) {
            console.error('Failed to load brand magazine offers:', err);
            setMagazineOffers([]);
        } finally {
            setLoadingMagazine(false);
        }
    };

    const loadBrandHotDeals = async (brandInfo: any) => {
        if (!brandInfo?.id) {
            setBrandHotDeals([]);
            return;
        }
        setLoadingHotDeals(true);
        try {
            const res = await api.hotDeals.getAll(brandInfo.id);
            const data = Array.isArray(res) ? res : res?.data || [];
            setBrandHotDeals(data);
        } catch (err) {
            console.error('Failed to load brand hot deals:', err);
            setBrandHotDeals([]);
        } finally {
            setLoadingHotDeals(false);
        }
    };

    const handleAddMagazineOffer = async (offer: any) => {
        setAddingOfferId(offer.id);
        try {
            let normalizedProduct: any = {
                id: `mag-${offer.id}`,
                name: offer.name,
                price: Number(offer.price ?? 0),
                image: offer.image || '',
                category: offer.category || 'عروض المجلة',
                weight: offer.unit || 'وحدة',
                stock_quantity: 1000
            };

            if (offer.product_id) {
                const productResponse = await api.products.getOne(String(offer.product_id), selectedBranch?.id);
                const productData = (productResponse as any)?.data || productResponse || {};
                normalizedProduct = {
                    ...productData,
                    id: String(productData.id ?? offer.product_id),
                    name: productData.name || offer.name,
                    price: Number(productData.price ?? offer.price ?? 0),
                    image: productData.image || productData.image_url || offer.image || '',
                    category: productData.category || offer.category || 'عروض المجلة',
                    stock_quantity: productData.stock_quantity ?? productData.stockQuantity ?? 1000,
                    reserved_quantity: productData.reserved_quantity ?? productData.reservedQuantity
                };
            }

            await addToCart(normalizedProduct, 1);
        } catch (err) {
            console.error('Failed to add magazine offer to cart:', err);
            alert('تعذر إضافة العرض للسلة حالياً.');
        } finally {
            setAddingOfferId(null);
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
            <>
                <Seo
                    title={brandDisplayName}
                    description={brandDescription}
                    url={canonicalUrl}
                    image={brandImage}
                    keywords={brandKeywords}
                />
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
            </>
        );
    }

    return (
        <>
            <Seo
                title={`${brandDisplayName} - عروض ${brandDisplayName}`}
                description={brandDescription}
                url={canonicalUrl}
                image={brandImage || brand.banner}
                keywords={brandKeywords}
                structuredData={brandStructuredData}
            />
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
                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 text-center">
                        <div className="text-center">
                            <div className="flex items-center justify-center gap-1 text-2xl font-bold" style={{ color: brand.primaryColor }}>
                                <ShoppingBag size={20} />
                                {products.length}
                            </div>
                            <p className="text-xs text-gray-500">منتج</p>
                        </div>
                        <div className="text-center">
                            <div className="flex items-center justify-center gap-1 text-2xl font-bold text-green-500">
                                <Percent size={20} />
                                {products.filter(p => p.discount_price && p.discount_price > p.price).length}
                            </div>
                            <p className="text-xs text-gray-500">عرض</p>
                        </div>
                        <div className="text-center sm:block hidden">
                            <div className="flex items-center justify-center gap-1 text-2xl font-bold text-orange-500">
                                <BadgePercent size={20} />
                                {magazineOffers.length + brandHotDeals.length}
                            </div>
                            <p className="text-xs text-gray-500">عروض إضافية</p>
                        </div>
                    </div>
                </div>
            </div>

            {/* Description */}
            <div className="max-w-7xl mx-auto px-4 py-4">
                <div className="bg-white rounded-2xl p-6 shadow-sm border">
                    <p className="text-gray-600 text-center">{brand.description}</p>
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
                        
                    </div>
                </div>
            </div>

            {/* Products Grid */}
            <div className="max-w-7xl mx-auto px-4 py-6">
                {activeTab === 'offers' && (
                    <div className="space-y-8 mb-6">
                        <div>
                            <div className="flex items-center justify-between mb-3">
                                <h3 className="text-lg font-bold text-gray-900 flex items-center gap-2">
                                    <BadgePercent size={18} className="text-orange-500" />
                                    عروض المجلة للبراند
                                </h3>
                                {loadingMagazine && <span className="text-xs text-gray-500">...تحميل</span>}
                            </div>
                            {loadingMagazine ? (
                                <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                                    {[...Array(3)].map((_, i) => (
                                        <div key={i} className="bg-white border rounded-xl p-3 animate-pulse">
                                            <div className="aspect-square bg-gray-100 rounded-lg mb-2" />
                                            <div className="h-3 bg-gray-100 rounded mb-1" />
                                            <div className="h-3 bg-gray-100 rounded w-1/2" />
                                        </div>
                                    ))}
                                </div>
                            ) : magazineOffers.length === 0 ? (
                                <p className="text-sm text-gray-500">لا توجد عروض مجلة لهذا البراند حالياً.</p>
                            ) : (
                                <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                                    {magazineOffers.map((offer: any) => (
                                        <div key={offer.id} className="bg-white border rounded-xl p-3 shadow-sm flex flex-col">
                                            <div className="aspect-square bg-gray-50 rounded-lg flex items-center justify-center mb-2 overflow-hidden">
                                                <img
                                                    src={offer.image || 'https://placehold.co/200x200?text=Offer'}
                                                    alt={offer.name}
                                                    className="w-full h-full object-contain"
                                                    onError={(e) => {
                                                        (e.target as HTMLImageElement).src = 'https://placehold.co/200x200?text=Offer';
                                                    }}
                                                />
                                            </div>
                                            <div className="space-y-1">
                                                <p className="text-xs text-gray-500">{offer.category || 'عرض'}</p>
                                                <h4 className="text-sm font-bold text-gray-900 line-clamp-2">{offer.name}</h4>
                                                <div className="flex items-baseline gap-1">
                                                    <span className="text-lg font-bold text-orange-600">{Number(offer.price || 0).toFixed(2)}</span>
                                                    <span className="text-xs text-gray-500">جنيه</span>
                                                    {offer.old_price && (
                                                        <span className="text-xs text-gray-400 line-through ml-auto">
                                                            {Number(offer.old_price).toFixed(2)}
                                                        </span>
                                                    )}
                                                </div>
                                            </div>
                                            <button
                                                onClick={() => handleAddMagazineOffer(offer)}
                                                disabled={addingOfferId === offer.id}
                                                className="mt-3 w-full py-2 rounded-lg text-sm font-bold text-white bg-orange-500 hover:bg-orange-600 transition disabled:opacity-60 disabled:cursor-not-allowed"
                                            >
                                                {addingOfferId === offer.id ? '...جاري الإضافة' : 'أضف للسلة'}
                                            </button>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>

                        <div>
                            <div className="flex items-center justify-between mb-3">
                                <h3 className="text-lg font-bold text-gray-900 flex items-center gap-2">
                                    <Flame size={18} className="text-red-500" />
                                    العروض الساخنة للبراند
                                </h3>
                                {loadingHotDeals && <span className="text-xs text-gray-500">...تحميل</span>}
                            </div>
                            {loadingHotDeals ? (
                                <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                                    {[...Array(3)].map((_, i) => (
                                        <div key={i} className="bg-white border rounded-xl p-3 animate-pulse">
                                            <div className="aspect-square bg-gray-100 rounded-lg mb-2" />
                                            <div className="h-3 bg-gray-100 rounded mb-1" />
                                            <div className="h-3 bg-gray-100 rounded w-1/2" />
                                        </div>
                                    ))}
                                </div>
                            ) : brandHotDeals.length === 0 ? (
                                <p className="text-sm text-gray-500">لا توجد عروض ساخنة لهذا البراند حالياً.</p>
                            ) : (
                                <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                                    {brandHotDeals.map((deal: any) => (
                                        <div key={deal.id} className="bg-white border rounded-xl p-3 shadow-sm flex flex-col">
                                            <div className="aspect-square bg-gray-50 rounded-lg flex items-center justify-center mb-2 overflow-hidden">
                                                <img
                                                    src={deal.image || 'https://placehold.co/200x200?text=Deal'}
                                                    alt={deal.name}
                                                    className="w-full h-full object-contain"
                                                    onError={(e) => {
                                                        (e.target as HTMLImageElement).src = 'https://placehold.co/200x200?text=Deal';
                                                    }}
                                                />
                                            </div>
                                            <div className="space-y-1">
                                                <h4 className="text-sm font-bold text-gray-900 line-clamp-2">{deal.name}</h4>
                                                <div className="flex items-baseline gap-1">
                                                    <span className="text-lg font-bold text-red-600">{Number(deal.price || 0).toFixed(2)}</span>
                                                    <span className="text-xs text-gray-500">جنيه</span>
                                                    {deal.old_price && (
                                                        <span className="text-xs text-gray-400 line-through ml-auto">
                                                            {Number(deal.old_price).toFixed(2)}
                                                        </span>
                                                    )}
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                    </div>
                )}

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
                            {activeTab === 'offers' ? 'لا توجد عروض حالياً' : 'لا توجد منتجات'}
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
                    {otherBrands.map((b: any) => {
                        const brandSlug = slugify(b.name_en || b.name_ar || b.name);
                        return (
                            <Link
                                key={b.id}
                                to={`/brand/${brandSlug}`}
                                className="flex-shrink-0 w-32 bg-white rounded-xl p-3 border border-gray-100 hover:shadow-md transition-all duration-200 hover:-translate-y-1"
                            >
                                <div className="aspect-square bg-gradient-to-br from-gray-50 to-gray-100 rounded-lg mb-2 flex items-center justify-center overflow-hidden">
                                    {b.logo_url || b.logo ? (
                                        <img src={b.logo_url || b.logo} alt={b.name_ar || b.name} className="w-full h-full object-contain" />
                                    ) : (
                                        <span className="text-2xl font-bold text-gray-400">
                                            {(b.name_ar || b.name || '').charAt(0)}
                                        </span>
                                    )}
                                </div>
                                <h4 className="text-xs font-semibold text-gray-800 text-center truncate">
                                    {b.name_ar || b.name}
                                </h4>
                            </Link>
                        );
                    })}
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
        </>
    );
};

export default BrandPage;
