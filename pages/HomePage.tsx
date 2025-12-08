import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import TopBar from '../components/TopBar';
import Banner from '../components/Banner';
import CategoryCard from '../components/CategoryCard';
import ProductCard from '../components/ProductCard';
import CategoryFilter from '../components/CategoryFilter';
import SponsoredAds from '../components/SponsoredAds';
import FlyerCarousel from '../components/FlyerCarousel';
import ErrorMessage from '../components/ErrorMessage';
import { ProductGridSkeleton, BannerSkeleton, CategoriesGridSkeleton } from '../components/Skeleton';
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

const HomePage = () => {
    const [activeCategory, setActiveCategory] = useState('All');
    const [products, setProducts] = useState<Product[]>([]);
    const [categories, setCategories] = useState<Category[]>([]);
    const [branchMap, setBranchMap] = useState<Record<string | number, { price?: number; stockQuantity?: number; reservedQuantity?: number }>>({});
    const [loading, setLoading] = useState(true);
    const [categoriesLoading, setCategoriesLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const filterCategories = ['All', 'Food', 'Vouchers', 'Beverages', 'Snacks', 'Dairy', 'Cleaning'];
    const { isAuthenticated } = useAuth();
    const { selectedBranch } = useBranch();

    // Fetch categories from API
    const fetchCategories = async () => {
        setCategoriesLoading(true);
        try {
            const res = await api.categories.getAll();
            const data = res?.data ?? res;
            if (Array.isArray(data)) {
                setCategories(data);
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

    const fetchProducts = async () => {
        setLoading(true);
        setError(null);
        try {
            const branchId = selectedBranch?.id || DEFAULT_BRANCH_ID;
            // 1) حاول بيانات الفرع
            let data = await api.products.getAllByBranch(branchId);
            let list = Array.isArray(data?.data) ? data.data : (Array.isArray(data) ? data : []);

            // 2) لو فاضي/404 جرّب كل المنتجات بدون فرع
            if (!list.length) {
                try {
                    const all = await api.products.getAll();
                    list = Array.isArray(all?.data) ? all.data : (Array.isArray(all) ? all : []);
                } catch (fallbackErr) {
                    console.error('Fallback getAll failed', fallbackErr);
                }
            }

            setProducts(list);
            if (list.length === 0) {
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
    }, [selectedBranch]);

    useEffect(() => {
        // Skip branch-products API (404 on current backend)
        setBranchMap({});
    }, [selectedBranch]);

    return (
        <div className="bg-[#FAFAFA] min-h-screen pb-24 md:pb-8">
            <TopBar />

            <div className="px-4 py-3 space-y-5 max-w-7xl mx-auto">
                {/* Stories Section */}
                <StoriesSection />

                {/* Category Filter (Task Bar) */}
                <CategoryFilter
                    categories={filterCategories}
                    activeCategory={activeCategory}
                    onSelect={setActiveCategory}
                />

                {/* Hero Offers Carousel - Main Banner */}
                <HeroCarousel />

                {/* Desktop Grid for Banners */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    {/* Login Banner - Only show if not authenticated */}
                    {!isAuthenticated && <Banner type="login" />}
                </div>

                {/* Sponsored Ads - Carousel Layout */}
                <SponsoredAds ads={SPONSORED_ADS} layout="carousel" />

                {/* Weekly Flyer Magazine */}
                <FlyerCarousel pages={FLYER_PAGES} />

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

                {/* Featured Brands Carousel */}
                <BrandsCarousel title="براندات مميزة" />

                {/* Brand offers & reels disabled: backend endpoints 404 */}

                {/* Sponsored Ads - Grid Layout (Scattered) */}
                <SponsoredAds ads={SPONSORED_ADS.slice(0, 2)} layout="grid" />

                {/* Special Categories */}
                <div>
                    <h3 className="text-base font-bold text-[#1F2937] mb-2.5">فئات مميزة</h3>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-2.5">
                        {CATEGORIES.map((cat, idx) => (
                            <div key={idx} className={`flex items-center p-2.5 rounded-xl ${cat.color} gap-2.5 hover:shadow-md transition-all cursor-pointer active:scale-[0.98]`}>
                                <div className="w-9 h-9 bg-white/50 rounded-full flex items-center justify-center text-base flex-shrink-0">
                                    {cat.icon}
                                </div>
                                <span className="font-medium text-sm text-[#1F2937]">{cat.name}</span>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Products You Might Like */}
                <div>
                    <div className="flex justify-between items-center mb-2.5">
                        <h3 className="text-base font-bold text-[#1F2937]">منتجات قد تعجبك</h3>
                        <Link to="/products" className="text-sm text-[#F97316] hover:underline flex items-center font-medium">
                            عرض الكل <ChevronRight size={16} />
                        </Link>
                    </div>

                    {/* Loading/Error States */}
                    {loading ? (
                        <ProductGridSkeleton count={8} />
                    ) : error ? (
                        <ErrorMessage message={error} onRetry={fetchProducts} />
                    ) : products.length === 0 ? (
                        <div className="text-center py-8 text-[#6B7280]">
                            لا توجد منتجات متاحة حالياً
                        </div>
                    ) : (
                        /* Mobile: Horizontal Scroll, Desktop: Grid */
                        <div className="flex gap-3 overflow-x-auto pb-3 no-scrollbar -mx-4 px-4 md:grid md:grid-cols-4 md:mx-0 md:px-0">
                            {products.slice(0, 8).map((product) => {
                                const bp = branchMap[product.id] || {};
                                const reserved = bp.reservedQuantity || 0;
                                const stock = bp.stockQuantity;
                                const available = typeof stock === 'number' ? (stock - reserved) > 0 : true;
                                const displayPrice = (bp.price ?? product.price) || 0;
                                return (
                                    <div key={product.id} className="w-36 flex-shrink-0 md:w-auto">
                                        <ProductCard product={{ ...product, price: displayPrice }} available={available} />
                                    </div>
                                );
                            })}
                        </div>
                    )}
                </div>

                {/* Categories Grid Preview */}
                {categories.length > 0 && (
                    <div>
                        <div className="flex items-center justify-between mb-4">
                            <h3 className="text-lg font-bold text-gray-900">تصفح الأقسام</h3>
                            <a href="/categories" className="text-sm text-orange-500 font-medium hover:underline">
                                عرض الكل
                            </a>
                        </div>
                        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
                            {categories.slice(0, 12).map((cat, idx) => (
                                <CategoryCard 
                                    key={cat.id || idx} 
                                    name={cat.name_ar || cat.name} 
                                    nameEn={cat.name}
                                    image={cat.image}
                                    icon={cat.icon}
                                    bgColor={cat.bg_color || 'bg-gradient-to-br from-orange-50 to-orange-100'} 
                                    productsCount={cat.products_count}
                                />
                            ))}
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default HomePage;
