import React, { useState, useEffect, useRef, useCallback } from 'react';
import { Link } from 'react-router-dom';
import TopBar from '../components/TopBar';
import Banner from '../components/Banner';
import ProductCard from '../components/ProductCard';
import FullPageSkeleton from '../components/FullPageSkeleton';
import BrandsCarousel from '../components/BrandsCarousel';
import BrandOffersSection from '../components/BrandOffersSection';
import StoriesSection from '../components/StoriesSection';
import FacebookReelsGrid from '../components/FacebookReelsGrid';
import HeroCarousel from '../components/HeroCarousel';
import AnnouncementPopup from '../components/AnnouncementPopup';
import PerformanceMonitor from '../components/PerformanceMonitor';
import { ChevronRight, Flame, BookOpen } from 'lucide-react';
import { api } from '../services/api';
import { Product } from '../types';
import { useAuth } from '../context/AuthContext';
import { useBranch } from '../context/BranchContext';
import { useLanguage } from '../context/LanguageContext';
import { DEFAULT_BRANCH_ID } from '../src/config';
import Seo, { getSiteUrl } from '../components/Seo';

interface Category {
    id?: number;
    name: string;
    name_ar?: string;
    image?: string;
    icon?: string;
    bg_color?: string;
    products_count?: number;
}

interface HomeSection {
    id: number;
    section_name: string;
    section_name_ar: string;
    banner_image: string;
    category: string;
    display_order: number;
    max_products: number;
    is_active: boolean;
    products?: Product[];
}

const HomePage = () => {
    const [products, setProducts] = useState<Product[]>([]);
    const [categories, setCategories] = useState<Category[]>([]);
    const [homeSections, setHomeSections] = useState<HomeSection[]>([]);
    const [brands, setBrands] = useState<any[]>([]); // Store brands from unified API
    const [sectionsLoading, setSectionsLoading] = useState(true);
    const [sectionsLoaded, setSectionsLoaded] = useState(false);
    const [sectionsPage, setSectionsPage] = useState(1);
    const [sectionsHasMore, setSectionsHasMore] = useState(true);
    const [sectionsLoadingMore, setSectionsLoadingMore] = useState(false);
    const [needsFallbackProducts, setNeedsFallbackProducts] = useState(true);
    const [fallbackRequested, setFallbackRequested] = useState(false);
    const [branchMap, setBranchMap] = useState<Record<string | number, { price?: number; stockQuantity?: number; reservedQuantity?: number }>>({});
    const [loading, setLoading] = useState(true);
    const [categoriesLoading, setCategoriesLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const { isAuthenticated } = useAuth();
    const { selectedBranch } = useBranch();
    const { t } = useLanguage();
    const loadMoreRef = useRef<HTMLDivElement | null>(null);
    const siteUrl = getSiteUrl();
    const heroImage = homeSections[0]?.banner_image || categories[0]?.image || '';
    const featuredCategories = categories.slice(0, 6).map(cat => cat.name_ar || cat.name).filter(Boolean);
    const homeStructuredData = {
        '@context': 'https://schema.org',
        '@type': 'Store',
        name: 'علوش ماركت',
        url: siteUrl,
        description: 'علوش ماركت - سوبر ماركت متكامل مع توصيل سريع خلال اليوم وخيارات دفع آمنة.',
        image: heroImage,
        areaServed: 'EG',
        brand: 'علوش ماركت',
        sameAs: ['https://www.facebook.com/alloshmarket'],
        knowsAbout: featuredCategories
    };

    // Fetch categories from API
    const fetchCategories = async () => {
        setCategoriesLoading(true);
        try {
            const res = await api.categories.getAll();
            const data = res?.data ?? res;

            // Transform data based on response type
            if (Array.isArray(data)) {
                // If backend returns array of strings, transform to objects
                if (data.length > 0 && typeof data[0] === 'string') {
                    const transformedCategories = data.map((name: string, index: number) => ({
                        id: index + 1,
                        name: name,
                        name_ar: translateCategoryName(name)
                    }));
                    setCategories(transformedCategories);
                } else {
                    // If already objects, use as is
                    setCategories(data);
                }
            } else {
                setCategories([]);
            }
        } catch (err) {
            console.error('Failed to fetch categories:', err);
            setCategories([]);
        } finally {
            setCategoriesLoading(false);
        }
    };

    // Helper function to translate category names
    const translateCategoryName = (name: string): string => {
        const translations: Record<string, string> = {
            'Bakery': 'المخبوزات',
            'Beverages': 'المشروبات',
            'Dairy': 'منتجات الألبان',
            'Grains': 'الحبوب',
            'Snacks': 'الوجبات الخفيفة',
            'Vegetables': 'الخضروات',
            'Fruits': 'الفواكه',
            'Meat': 'اللحوم',
            'Seafood': 'المأكولات البحرية',
            'Frozen': 'المجمدات',
            'Cleaning': 'منتجات التنظيف',
            'Personal Care': 'العناية الشخصية'
        };
        return translations[name] || name;
    };

    const SECTION_PAGE_SIZE = 2;

    // 🚀 Unified Home Data Fetch - ONE API call instead of 3+
    const fetchUnifiedHomeData = useCallback(async () => {
        setSectionsLoading(true);
        setSectionsLoaded(false);
        setNeedsFallbackProducts(true);
        
        try {
            const branchId = selectedBranch?.id || DEFAULT_BRANCH_ID;
            console.log('🚀 Fetching unified home data for branch:', branchId);
            
            // Single API call that gets: brands + home sections + hero sections
            const response = await api.homeData.getAll(branchId, {
                sectionsLimit: 3,
                productsPerSection: 6,
                brandsLimit: 10,
                heroLimit: 5
            });

            if (response.success && response.data) {
                // Set brands
                if (response.data.brands) {
                    setBrands(response.data.brands);
                    console.log('✅ Loaded', response.data.brands.length, 'brands');
                }

                // Set home sections
                if (response.data.homeSections) {
                    setHomeSections(response.data.homeSections);
                    console.log('✅ Loaded', response.data.homeSections.length, 'sections with', response.meta.totalProducts, 'products');
                }

                // Hero sections would go here if needed
                // setHeroSections(response.data.heroSections);

                const hasSectionProducts = response.data.homeSections?.some(
                    (section: any) => Array.isArray(section.products) && section.products.length > 0
                );

                setNeedsFallbackProducts(!hasSectionProducts);
            }
        } catch (err) {
            console.error('❌ Error fetching unified home data:', err);
            setHomeSections([]);
            setBrands([]);
            setNeedsFallbackProducts(true);
        } finally {
            setSectionsLoading(false);
            setSectionsLoaded(true);
        }
    }, [selectedBranch]);

    // Fetch home sections from API (paged) - DEPRECATED: Use fetchUnifiedHomeData instead
    const fetchHomeSections = useCallback(async (page = 1, append = false) => {
        if (append) {
            setSectionsLoadingMore(true);
        } else {
            setSectionsLoading(true);
            setSectionsLoaded(false);
            setNeedsFallbackProducts(true);
        }
        try {
            const branchId = selectedBranch?.id || DEFAULT_BRANCH_ID;
            const response = await api.homeSections.get(branchId, { page, limit: SECTION_PAGE_SIZE, productLimit: 6 });
            const sectionsData = response?.data || response || [];
            const nextSections = Array.isArray(sectionsData) ? sectionsData : [];
            setHomeSections(prev => {
                const merged = append ? [...prev, ...nextSections] : nextSections;
                const seen = new Set<number>();
                return merged.filter(section => {
                    if (!section?.id) return false;
                    if (seen.has(section.id)) return false;
                    seen.add(section.id);
                    return true;
                });
            });
            const hasMore = typeof response?.hasMore === 'boolean'
                ? response.hasMore
                : nextSections.length === SECTION_PAGE_SIZE;
            setSectionsHasMore(hasMore);
            setSectionsPage(page);
        } catch (err) {
            console.error('Error fetching sections:', err);
            if (!append) {
                setHomeSections([]);
            }
            setSectionsHasMore(false);
        } finally {
            if (append) {
                setSectionsLoadingMore(false);
            } else {
                setSectionsLoading(false);
                setSectionsLoaded(true);
            }
        }
    }, [selectedBranch]);

    const fetchProducts = async () => {
        setLoading(true);
        setError(null);
        try {
            const branchId = selectedBranch?.id || DEFAULT_BRANCH_ID;
            console.log('🏪 Loading limited products for HomePage - Branch:', selectedBranch?.name || 'Default', 'ID:', branchId);

            // ✅ جلب عدد قليل جداً للصفحة الرئيسية (8 بدل 24) - تقليل الترانسفير
            let list = await api.products.getAllByBranch(branchId, { limit: 8 });

            // Fallback if empty (مع limit)
            if (!list || list.length === 0) {
                console.log('⚠️ No products found for branch, trying paginated fallback...');
                try {
                    list = await api.products.getPaginated(1, 8, branchId);
                } catch (fallbackErr) {
                    console.error('Fallback getPaginated failed', fallbackErr);
                    list = [];
                }
            }

            setProducts(Array.isArray(list) ? list : []);
            console.log('✅ Products loaded:', list?.length || 0, 'products (limited for performance)');

            if (!list || list.length === 0) {
                setError('لا توجد منتجات متاحة حالياً لهذا الفرع');
            }
        } catch (err) {
            console.error('Failed to fetch products', err);
            setProducts([]);
            setError('فشل تحميل المنتجات من الخادم');
        } finally {
            setLoading(false);
        }
    };

    const normalizeCategoryValue = (value: string = '') =>
        value
            .toString()
            .trim()
            .toLowerCase()
            .replace(/أ|إ|آ/g, 'ا')
            .replace(/ة/g, 'ه')
            .replace(/ى/g, 'ي')
            .replace(/\s+/g, '')
            .replace(/[-_]/g, '');

    useEffect(() => {
        fetchCategories();
        // 🚀 Use unified API instead of multiple calls
        fetchUnifiedHomeData();
    }, [selectedBranch, fetchUnifiedHomeData]);

    useEffect(() => {
        if (!sectionsLoaded) return;
        const hasSectionProducts = homeSections.some(section =>
            Array.isArray(section.products) && section.products.length > 0
        );
        if (hasSectionProducts) {
            setNeedsFallbackProducts(false);
            setLoading(false);
            return;
        }
        if (!fallbackRequested && homeSections.length > 0) {
            setNeedsFallbackProducts(true);
            setFallbackRequested(true);
            fetchProducts();
            return;
        }
        if (!sectionsHasMore) {
            setNeedsFallbackProducts(true);
        }
    }, [sectionsLoaded, homeSections, sectionsHasMore, fallbackRequested]);

    useEffect(() => {
        if (!sectionsLoaded) return;
        if (needsFallbackProducts && !sectionsHasMore && !fallbackRequested) {
            setFallbackRequested(true);
            fetchProducts();
        } else if (!needsFallbackProducts) {
            setProducts([]);
            setLoading(false);
        }
    }, [sectionsLoaded, needsFallbackProducts, sectionsHasMore, selectedBranch?.id, fallbackRequested]);

    useEffect(() => {
        if (!loadMoreRef.current) return;
        if (!sectionsHasMore || sectionsLoadingMore || sectionsLoading) return;
        const observer = new IntersectionObserver(
            (entries) => {
                if (entries[0]?.isIntersecting) {
                    fetchHomeSections(sectionsPage + 1, true);
                }
            },
            { rootMargin: '300px' }
        );
        observer.observe(loadMoreRef.current);
        return () => observer.disconnect();
    }, [sectionsHasMore, sectionsLoadingMore, sectionsLoading, sectionsPage, fetchHomeSections]);

    useEffect(() => {
        // Skip branch-products API (404 on current backend)
        setBranchMap({});
    }, [selectedBranch]);

    // Global loading state - show full page skeleton while all data is loading and nothing is rendered yet
    const showFullPageSkeleton =
        (loading || categoriesLoading || sectionsLoading) &&
        products.length === 0 &&
        categories.length === 0 &&
        homeSections.length === 0;

    if (showFullPageSkeleton) {
        return <FullPageSkeleton />;
    }

    return (
        <>
            <Seo
                title="علوش ماركت - سوبر ماركت أونلاين"
                description="اطلب كل احتياجات البيت من علوش ماركت مع توصيل سريع 24/7، عروض يومية وبقالة، خضار، فاكهة، ومنتجات تكميلية."
                url={`${siteUrl}/`}
                image={heroImage}
                keywords={[
                    'علوش ماركت',
                    'سوبر ماركت أونلاين',
                    'توصيل بقالة',
                    'عروض سوبر ماركت',
                    'allosh market',
                    'بقالة 24 ساعة'
                ]}
                structuredData={homeStructuredData}
            />

            {/* Popups - الإعلانات المنبثقة */}
            <AnnouncementPopup page="homepage" />

            <div className="bg-[#FAFAFA] min-h-screen pb-24 md:pb-8">
                <TopBar />

                <div className="px-4 py-3 space-y-5 max-w-7xl mx-auto">
                    {/* Stories Section */}
                    <StoriesSection />

                    {/* Hero Offers Carousel - Main Banner with Wave */}
                    <div className="mt-8">
                        <HeroCarousel />
                    </div>

                    {/* Featured Brands Carousel - 🚀 Using brands from unified API */}
                    <BrandsCarousel title={t('home.featuredBrands')} brands={brands} />

                    {/* Brand Offers Section */}
                    <BrandOffersSection />

                    {/* Desktop Grid for Banners */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                        {/* Login Banner - Only show if not authenticated */}
                        {!isAuthenticated && <Banner type="login" />}
                    </div>

                    {/* Quick Access - Hot Deals & Magazine */}
                    <div className="grid grid-cols-2 gap-3">
                        {/* العروض الساخنة */}
                        <Link to="/deals" className="group">
                            <div className="bg-gradient-to-br from-[#FF4500] via-[#FF6B35] to-[#FF8C42] rounded-2xl p-4 h-32 relative overflow-hidden hover:shadow-xl hover:shadow-red-200 transition-all active:scale-[0.98]">
                                {/* Fire Animation Background */}
                                <div className="absolute inset-0 overflow-hidden">
                                    {/* Animated flames */}
                                    <div className="absolute bottom-0 left-2 w-6 h-10 bg-gradient-to-t from-yellow-400 via-orange-500 to-transparent rounded-t-full opacity-80 animate-pulse" style={{ animationDelay: '0s' }} />
                                    <div className="absolute bottom-0 left-6 w-4 h-8 bg-gradient-to-t from-yellow-300 via-red-500 to-transparent rounded-t-full opacity-70 animate-pulse" style={{ animationDelay: '0.2s' }} />
                                    <div className="absolute bottom-0 left-9 w-5 h-12 bg-gradient-to-t from-orange-400 via-red-600 to-transparent rounded-t-full opacity-75 animate-pulse" style={{ animationDelay: '0.4s' }} />
                                    <div className="absolute bottom-0 right-4 w-5 h-9 bg-gradient-to-t from-yellow-500 via-orange-600 to-transparent rounded-t-full opacity-60 animate-pulse" style={{ animationDelay: '0.3s' }} />
                                    <div className="absolute bottom-0 right-10 w-4 h-7 bg-gradient-to-t from-yellow-400 via-red-500 to-transparent rounded-t-full opacity-65 animate-pulse" style={{ animationDelay: '0.5s' }} />
                                    {/* Sparkles */}
                                    <div className="absolute top-4 right-6 w-2 h-2 bg-yellow-300 rounded-full animate-ping opacity-75" />
                                    <div className="absolute top-8 right-12 w-1.5 h-1.5 bg-orange-200 rounded-full animate-ping opacity-60" style={{ animationDelay: '0.3s' }} />
                                    <div className="absolute top-6 left-8 w-1 h-1 bg-white rounded-full animate-ping opacity-50" style={{ animationDelay: '0.6s' }} />
                                </div>
                                {/* Content */}
                                <div className="relative z-10 h-full flex flex-col justify-between">
                                    <div className="flex items-center gap-2">
                                        <div className="bg-white/20 backdrop-blur-sm rounded-full p-2">
                                            <Flame className="w-5 h-5 text-white" />
                                        </div>
                                        <span className="text-white/90 text-[10px] font-bold bg-red-600 px-2 py-0.5 rounded-full animate-pulse">🔥 HOT</span>
                                    </div>
                                    <div>
                                        <h3 className="text-white font-black text-lg leading-tight">{t('home.hotDeals')}</h3>
                                        <p className="text-white/80 text-xs">{t('home.hotDealsDescription')}</p>
                                    </div>
                                </div>
                            </div>
                        </Link>

                        {/* مجلة العروض */}
                        <Link to="/magazine" className="group">
                            <div className="bg-gradient-to-br from-[#F97316] via-[#FB923C] to-[#FDBA74] rounded-2xl p-4 h-32 relative overflow-hidden hover:shadow-xl hover:shadow-orange-200 transition-all active:scale-[0.98]">
                                {/* Magazine Design Background */}
                                <div className="absolute inset-0 overflow-hidden">
                                    {/* Stacked magazines effect */}
                                    <div className="absolute bottom-1 right-2 w-14 h-18 bg-white/20 rounded-lg transform rotate-[-8deg] shadow-lg" />
                                    <div className="absolute bottom-2 right-4 w-14 h-18 bg-white/30 rounded-lg transform rotate-[-4deg] shadow-lg" />
                                    <div className="absolute bottom-3 right-6 w-14 h-18 bg-white/40 rounded-lg transform rotate-[2deg] shadow-lg flex flex-col p-1.5">
                                        <div className="bg-orange-400/50 h-1.5 w-8 rounded mb-1" />
                                        <div className="bg-orange-300/40 h-1 w-6 rounded mb-2" />
                                        <div className="flex-1 bg-gradient-to-br from-orange-200/30 to-orange-400/20 rounded" />
                                    </div>
                                    {/* Decorative elements */}
                                    <div className="absolute top-3 left-3 w-8 h-8 border-2 border-white/20 rounded-lg transform rotate-12" />
                                    <div className="absolute top-6 left-8 w-4 h-4 bg-yellow-300/30 rounded-full" />
                                    {/* Stars/Sparkles */}
                                    <div className="absolute top-4 right-3">
                                        <span className="text-yellow-200 text-sm">✨</span>
                                    </div>
                                </div>
                                {/* Content */}
                                <div className="relative z-10 h-full flex flex-col justify-between">
                                    <div className="flex items-center gap-2">
                                        <div className="bg-white/20 backdrop-blur-sm rounded-full p-2">
                                            <BookOpen className="w-5 h-5 text-white" />
                                        </div>
                                        <span className="text-white/90 text-[10px] font-bold bg-orange-600 px-2 py-0.5 rounded-full">📖 جديد</span>
                                    </div>
                                    <div>
                                        <h3 className="text-white font-black text-lg leading-tight">{t('home.magazine')}</h3>
                                        <p className="text-white/80 text-xs">{t('home.magazineDescription')}</p>
                                    </div>
                                </div>
                            </div>
                        </Link>
                    </div>

                    {/* Dynamic Sections from Database */}
                    {sectionsLoading ? (
                        <div className="space-y-6">
                            {[1, 2, 3].map(i => (
                                <div key={i} className="space-y-4">
                                    <div className="h-6 bg-gray-200 rounded w-32 animate-pulse" />
                                    <div className="h-40 bg-gray-200 rounded-2xl animate-pulse" />
                                    <div className="grid grid-cols-4 gap-3">
                                        {[1, 2, 3, 4].map(j => (
                                            <div key={j} className="h-48 bg-gray-200 rounded-xl animate-pulse" />
                                        ))}
                                    </div>
                                </div>
                            ))}
                        </div>
                    ) : homeSections.length > 0 ? (
                        homeSections.map((section, sectionIndex) => {
                            const categoryCandidates = [
                                section.category,
                                section.section_name_ar,
                                section.section_name
                            ].filter(Boolean) as string[];
                            const normalizedCandidates = categoryCandidates.map(normalizeCategoryValue);
                            const matchingCategory = categories.find(cat => {
                                const normalizedName = normalizeCategoryValue(cat.name || '');
                                const normalizedNameAr = normalizeCategoryValue(cat.name_ar || '');
                                return normalizedCandidates.some(candidate =>
                                    candidate === normalizedName || candidate === normalizedNameAr
                                );
                            });
                            const categoryParam = matchingCategory?.name_ar || matchingCategory?.name || section.section_name_ar || section.category;
                            const categoryLabel = matchingCategory?.name_ar || section.section_name_ar || section.category;
                            const resolvedCategoryKey = normalizeCategoryValue(categoryParam || section.category || '');

                            return (
                                <section key={section.id} className="relative mt-12">
                                    <div className="rounded-[28px] overflow-hidden shadow-[0_12px_30px_rgba(0,0,0,0.06)] border border-white/60 bg-white/90 backdrop-blur-[2px]">
                                        {/* Section Banner */}
                                        {section.banner_image && (
                                            <div className="relative h-44 md:h-48 overflow-hidden">
                                                <img
                                                    src={section.banner_image}
                                                    alt={section.section_name_ar}
                                                    loading="lazy"
                                                    decoding="async"
                                                    className="w-full h-full object-cover"
                                                />
                                                <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/20 to-transparent" />
                                                <div className="absolute bottom-4 right-4 md:bottom-6 md:right-6 text-white">
                                                    <h2 className="text-2xl md:text-3xl font-bold drop-shadow-lg">{section.section_name_ar}</h2>
                                                    <p className="text-sm md:text-base text-white/90 mt-1">{section.section_name}</p>
                                                </div>
                                            </div>
                                        )}

                                        <div className="px-3 sm:px-4 md:px-5 pb-5 pt-4 bg-white">
                                            <div className="flex items-center justify-between mb-4">
                                                <h2 className="text-xl font-bold text-gray-900">{section.section_name_ar}</h2>
                                                <Link
                                                    to={`/products?category=${encodeURIComponent(categoryParam)}`}
                                                    className="text-[#FF4500] text-sm font-semibold flex items-center gap-1 hover:gap-2 transition-all"
                                                >
                                                    عرض المزيد <ChevronRight className="w-4 h-4" />
                                                </Link>
                                            </div>

                                            <div className="flex md:grid md:grid-cols-4 gap-3 overflow-x-auto pb-2 scrollbar-hide md:overflow-visible mt-1">
                                                {/* عرض المنتجات من الـ API أولاً، ثم fallback للمنتجات المحلية */}
                                                {section.products && section.products.length > 0 ? (
                                                    section.products.slice(0, section.max_products || 8).map(product => (
                                                        <div key={product.id} className="flex-shrink-0 w-40 md:w-auto">
                                                            <ProductCard product={product} />
                                                        </div>
                                                    ))
                                                ) : (
                                                    // Fallback: البحث في المنتجات المحلية باستخدام مطابقة أكثر مرونة
                                                    products.filter(p => {
                                                        if (!p.category || !resolvedCategoryKey) return false;
                                                        const pCat = normalizeCategoryValue(p.category);
                                                        return pCat === resolvedCategoryKey;
                                                    }).slice(0, section.max_products || 8).length > 0 ? (
                                                        products.filter(p => {
                                                            if (!p.category || !resolvedCategoryKey) return false;
                                                            const pCat = normalizeCategoryValue(p.category);
                                                            return pCat === resolvedCategoryKey;
                                                        }).slice(0, section.max_products || 8).map(product => (
                                                            <div key={product.id} className="flex-shrink-0 w-40 md:w-auto">
                                                                <ProductCard product={product} />
                                                            </div>
                                                        ))
                                                    ) : (
                                                        <div className="col-span-full text-center py-8">
                                                            <p className="text-gray-500 text-sm">
                                                                لا توجد منتجات متاحة في فئة "{categoryLabel}" حالياً
                                                            </p>
                                                        </div>
                                                    )
                                                )}
                                            </div>
                                        </div>
                                    </div>
                                </section>
                            );
                        })
                    ) : (
                        <div className="text-center py-12">
                            <p className="text-gray-500">لا توجد أقسام متاحة حالياً</p>
                        </div>
                    )}

                    {sectionsHasMore && (
                        <div className="flex items-center justify-center py-4 text-sm text-gray-500" ref={loadMoreRef}>
                            {sectionsLoadingMore ? 'جاري تحميل المزيد...' : 'تحميل المزيد عند النزول'}
                        </div>
                    )}

                    {/* Facebook Reels Section */}
                    <FacebookReelsGrid pageUsername="Alloshchocolates" pageName="Allosh Chocolates" />
                    
                    {/* Performance Monitor - للأدمن فقط */}
                    {isAuthenticated && (
                        <div className="mt-6">
                            <PerformanceMonitor endpoint="home" showDetails={true} />
                        </div>
                    )}
                </div>
            </div>
        </>
    );
};

export default HomePage;
