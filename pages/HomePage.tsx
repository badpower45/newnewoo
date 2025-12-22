import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import TopBar from '../components/TopBar';
import Banner from '../components/Banner';
import CategoryCard from '../components/CategoryCard';
import ProductCard from '../components/ProductCard';
import SponsoredAds from '../components/SponsoredAds';
import FlyerCarousel from '../components/FlyerCarousel';
import ErrorMessage from '../components/ErrorMessage';
import { ProductGridSkeleton, BannerSkeleton, CategoriesGridSkeleton } from '../components/Skeleton';
import FullPageSkeleton from '../components/FullPageSkeleton';
import BrandsCarousel from '../components/BrandsCarousel';
import BrandOffersSection from '../components/BrandOffersSection';
import StoriesSection from '../components/StoriesSection';
import FacebookReelsGrid from '../components/FacebookReelsGrid';
import HeroCarousel from '../components/HeroCarousel';
import { ChevronRight, Flame, BookOpen } from 'lucide-react';
import { CATEGORIES, SPONSORED_ADS, FLYER_PAGES } from '../data/mockData';
import { api } from '../services/api';
import { Product } from '../types';
import { useAuth } from '../context/AuthContext';
import { useBranch } from '../context/BranchContext';
import { DEFAULT_BRANCH_ID } from '../src/config';

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
    const [sectionsLoading, setSectionsLoading] = useState(true);
    const [branchMap, setBranchMap] = useState<Record<string | number, { price?: number; stockQuantity?: number; reservedQuantity?: number }>>({});
    const [loading, setLoading] = useState(true);
    const [categoriesLoading, setCategoriesLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const { isAuthenticated } = useAuth();
    const { selectedBranch } = useBranch();
    const wavePalette = ['#FDF2E9', '#EEF2FF', '#ECFDF3', '#FFF7ED', '#E0F2FE'];

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
                        name_ar: translateCategoryName(name),
                        image: getCategoryImage(name),
                        icon: '📦',
                        bg_color: getCategoryColor(index),
                        products_count: 0
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

    // Helper function to get category image
    const getCategoryImage = (name: string): string => {
        const images: Record<string, string> = {
            'Bakery': 'https://images.unsplash.com/photo-1509440159596-0249088772ff?w=400',
            'Beverages': 'https://images.unsplash.com/photo-1437418747212-8d9709afab22?w=400',
            'Dairy': 'https://images.unsplash.com/photo-1563636619-e9143da7973b?w=400',
            'Grains': 'https://images.unsplash.com/photo-1586201375761-83865001e31c?w=400',
            'Snacks': 'https://images.unsplash.com/photo-1621939514649-280e2ee25f60?w=400',
            'Vegetables': 'https://images.unsplash.com/photo-1540420773420-3366772f4999?w=400',
            'Fruits': 'https://images.unsplash.com/photo-1619566636858-adf3ef46400b?w=400',
            'Meat': 'https://images.unsplash.com/photo-1603048588665-791ca8aea617?w=400',
            'Seafood': 'https://images.unsplash.com/photo-1565680018434-b513d5e5fd47?w=400',
            'Frozen': 'https://images.unsplash.com/photo-1476887334197-56adbf254e1a?w=400',
            'Cleaning': 'https://images.unsplash.com/photo-1585421514738-01798e348b17?w=400',
            'Personal Care': 'https://images.unsplash.com/photo-1556228578-dd339359d39f?w=400'
        };
        return images[name] || 'https://images.unsplash.com/photo-1543168256-418811576931?w=400';
    };

    // Helper function to get category color
    const getCategoryColor = (index: number): string => {
        const colors = [
            'bg-gradient-to-br from-orange-50 to-orange-100',
            'bg-gradient-to-br from-blue-50 to-blue-100',
            'bg-gradient-to-br from-green-50 to-green-100',
            'bg-gradient-to-br from-purple-50 to-purple-100',
            'bg-gradient-to-br from-pink-50 to-pink-100',
            'bg-gradient-to-br from-yellow-50 to-yellow-100',
            'bg-gradient-to-br from-red-50 to-red-100',
            'bg-gradient-to-br from-indigo-50 to-indigo-100'
        ];
        return colors[index % colors.length];
    };

    // Fetch home sections from API
    const fetchHomeSections = async () => {
        setSectionsLoading(true);
        try {
            const branchId = selectedBranch?.id || DEFAULT_BRANCH_ID;
            console.log('🏠 Loading home sections for branch:', selectedBranch?.name || 'Default', 'ID:', branchId);
            
            const response = await api.homeSections.get(branchId);
            const sectionsData = response?.data || response || [];
            setHomeSections(Array.isArray(sectionsData) ? sectionsData : []);
            
            console.log('✅ Home sections loaded:', sectionsData?.length || 0, 'sections');
        } catch (err) {
            console.error('Error fetching sections:', err);
            setHomeSections([]);
        } finally {
            setSectionsLoading(false);
        }
    };

    const fetchProducts = async () => {
        setLoading(true);
        setError(null);
        try {
            const branchId = selectedBranch?.id || DEFAULT_BRANCH_ID;
            console.log('🏪 Loading products for branch:', selectedBranch?.name || 'Default', 'ID:', branchId);
            
            // Get products from API (now returns array directly)
            let list = await api.products.getAllByBranch(branchId);

            // Fallback if empty
            if (!list || list.length === 0) {
                console.log('⚠️ No products found for branch, trying fallback...');
                try {
                    list = await api.products.getAll();
                } catch (fallbackErr) {
                    console.error('Fallback getAll failed', fallbackErr);
                    list = [];
                }
            }

            setProducts(Array.isArray(list) ? list : []);
            console.log('✅ Products loaded:', list?.length || 0, 'products for branch:', selectedBranch?.name);
            
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

    useEffect(() => {
        fetchProducts();
        fetchCategories();
        fetchHomeSections();
    }, [selectedBranch]);

    useEffect(() => {
        // Skip branch-products API (404 on current backend)
        setBranchMap({});
    }, [selectedBranch]);

    // Global loading state - show full page skeleton while all data is loading
    const globalLoading = loading || categoriesLoading || sectionsLoading;

    if (globalLoading) {
        return <FullPageSkeleton />;
    }

    return (
        <div className="bg-[#FAFAFA] min-h-screen pb-24 md:pb-8">
            <TopBar />

            <div className="px-4 py-3 space-y-5 max-w-7xl mx-auto">
                {/* Stories Section */}
                <StoriesSection />

                {/* Hero Offers Carousel - Main Banner with Wave */}
                <div className="mt-8">
                    <HeroCarousel />
                </div>

                {/* Featured Brands Carousel */}
                <BrandsCarousel title="براندات مميزة" />

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
                                <div className="absolute bottom-0 left-2 w-6 h-10 bg-gradient-to-t from-yellow-400 via-orange-500 to-transparent rounded-t-full opacity-80 animate-pulse" style={{animationDelay: '0s'}} />
                                <div className="absolute bottom-0 left-6 w-4 h-8 bg-gradient-to-t from-yellow-300 via-red-500 to-transparent rounded-t-full opacity-70 animate-pulse" style={{animationDelay: '0.2s'}} />
                                <div className="absolute bottom-0 left-9 w-5 h-12 bg-gradient-to-t from-orange-400 via-red-600 to-transparent rounded-t-full opacity-75 animate-pulse" style={{animationDelay: '0.4s'}} />
                                <div className="absolute bottom-0 right-4 w-5 h-9 bg-gradient-to-t from-yellow-500 via-orange-600 to-transparent rounded-t-full opacity-60 animate-pulse" style={{animationDelay: '0.3s'}} />
                                <div className="absolute bottom-0 right-10 w-4 h-7 bg-gradient-to-t from-yellow-400 via-red-500 to-transparent rounded-t-full opacity-65 animate-pulse" style={{animationDelay: '0.5s'}} />
                                {/* Sparkles */}
                                <div className="absolute top-4 right-6 w-2 h-2 bg-yellow-300 rounded-full animate-ping opacity-75" />
                                <div className="absolute top-8 right-12 w-1.5 h-1.5 bg-orange-200 rounded-full animate-ping opacity-60" style={{animationDelay: '0.3s'}} />
                                <div className="absolute top-6 left-8 w-1 h-1 bg-white rounded-full animate-ping opacity-50" style={{animationDelay: '0.6s'}} />
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
                                    <h3 className="text-white font-black text-lg leading-tight">العروض الساخنة</h3>
                                    <p className="text-white/80 text-xs">عروض نارية لفترة محدودة!</p>
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
                                    <h3 className="text-white font-black text-lg leading-tight">مجلة العروض</h3>
                                    <p className="text-white/80 text-xs">تصفح عروض هذا الأسبوع</p>
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
                        const waveColor = wavePalette[sectionIndex % wavePalette.length];

                        return (
                            <section key={section.id} className="relative mt-12">
                                <div className="rounded-[28px] overflow-hidden shadow-[0_12px_30px_rgba(0,0,0,0.06)] border border-white/60 bg-white/90 backdrop-blur-[2px]">
                                    {/* Section Banner */}
                                    {section.banner_image && (
                                        <div className="relative h-44 md:h-48 overflow-hidden">
                                            <img 
                                                src={section.banner_image} 
                                                alt={section.section_name_ar}
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
                                                to={`/products?category=${encodeURIComponent(section.category)}`}
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
                                                    if (!p.category || !section.category) return false;
                                                    const pCat = p.category.trim().toLowerCase();
                                                    const sCat = section.category.trim().toLowerCase();
                                                    return pCat === sCat || pCat.includes(sCat) || sCat.includes(pCat);
                                                }).slice(0, section.max_products || 8).length > 0 ? (
                                                    products.filter(p => {
                                                        if (!p.category || !section.category) return false;
                                                        const pCat = p.category.trim().toLowerCase();
                                                        const sCat = section.category.trim().toLowerCase();
                                                        return pCat === sCat || pCat.includes(sCat) || sCat.includes(pCat);
                                                    }).slice(0, section.max_products || 8).map(product => (
                                                        <div key={product.id} className="flex-shrink-0 w-40 md:w-auto">
                                                            <ProductCard product={product} />
                                                        </div>
                                                    ))
                                                ) : (
                                                    <div className="col-span-full text-center py-8">
                                                        <p className="text-gray-500 text-sm">
                                                            لا توجد منتجات متاحة في فئة "{section.category}" حالياً
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

                {/* قسم المجمدات (fallback if no dynamic sections) */}
                {!sectionsLoading && homeSections.length === 0 && (
                <section className="space-y-4">
                    <div className="flex items-center justify-between">
                        <h2 className="text-xl font-bold text-gray-900">مجمدات</h2>
                        <Link to="/products?category=مجمدات" className="text-[#FF4500] text-sm font-semibold flex items-center gap-1 hover:gap-2 transition-all">
                            عرض المزيد <ChevronRight className="w-4 h-4" />
                        </Link>
                    </div>
                    <div className="relative rounded-2xl overflow-hidden h-40 bg-gradient-to-br from-indigo-100 via-indigo-200 to-blue-200">
                        <img src="https://images.unsplash.com/photo-1476887334197-56adbf254e1a?w=1200" alt="مجمدات" className="w-full h-full object-cover opacity-90" />
                        <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent" />
                        <div className="absolute bottom-4 right-4 text-white">
                            <h3 className="text-2xl font-bold">Frozen</h3>
                            <p className="text-sm">أطعمة مجمدة وآيس كريم</p>
                        </div>
                    </div>
                    <div className="flex md:grid md:grid-cols-4 gap-3 overflow-x-auto pb-2 scrollbar-hide md:overflow-visible">
                        {products.filter(p => p.category === 'مجمدات').slice(0, 8).map(product => (
                            <div key={product.id} className="flex-shrink-0 w-40 md:w-auto">
                                <ProductCard product={product} />
                            </div>
                        ))}
                    </div>
                </section>
                )}

                {/* Facebook Reels Section */}
                <FacebookReelsGrid pageUsername="Alloshchocolates" pageName="Allosh Chocolates" />
            </div>
        </div>
    );
};

export default HomePage;
