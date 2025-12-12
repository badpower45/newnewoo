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
    const [products, setProducts] = useState<Product[]>([]);
    const [categories, setCategories] = useState<Category[]>([]);
    const [branchMap, setBranchMap] = useState<Record<string | number, { price?: number; stockQuantity?: number; reservedQuantity?: number }>>({});
    const [loading, setLoading] = useState(true);
    const [categoriesLoading, setCategoriesLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const { isAuthenticated } = useAuth();
    const { selectedBranch } = useBranch();

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

    const fetchProducts = async () => {
        setLoading(true);
        setError(null);
        try {
            const branchId = selectedBranch?.id || DEFAULT_BRANCH_ID;
            // Get products from API (now returns array directly)
            let list = await api.products.getAllByBranch(branchId);

            // Fallback if empty
            if (!list || list.length === 0) {
                try {
                    list = await api.products.getAll();
                } catch (fallbackErr) {
                    console.error('Fallback getAll failed', fallbackErr);
                    list = [];
                }
            }

            setProducts(Array.isArray(list) ? list : []);
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

                {/* Hero Offers Carousel - Main Banner */}
                <HeroCarousel />

                {/* Featured Brands Carousel */}
                <BrandsCarousel title="براندات مميزة" />

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

                {/* قسم الحلويات */}
                <section className="space-y-4">
                    <div className="flex items-center justify-between">
                        <h2 className="text-xl font-bold text-gray-900">حلويات</h2>
                        <Link to="/products?category=حلويات" className="text-[#FF4500] text-sm font-semibold flex items-center gap-1 hover:gap-2 transition-all">
                            عرض المزيد <ChevronRight className="w-4 h-4" />
                        </Link>
                    </div>
                    <div className="relative rounded-2xl overflow-hidden h-40 bg-gradient-to-br from-pink-100 via-pink-200 to-rose-200">
                        <img src="https://images.unsplash.com/photo-1581798459219-785eb0842e5e?w=1200" alt="حلويات" className="w-full h-full object-cover opacity-90" />
                        <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent" />
                        <div className="absolute bottom-4 right-4 text-white">
                            <h3 className="text-2xl font-bold">حلويات شهية</h3>
                            <p className="text-sm">أجود أنواع الحلويات والشوكولاتة</p>
                        </div>
                    </div>
                    {/* Horizontal scroll on mobile, grid on desktop */}
                    <div className="flex md:grid md:grid-cols-4 gap-3 overflow-x-auto pb-2 scrollbar-hide md:overflow-visible">
                        {products.filter(p => p.category === 'حلويات').slice(0, 8).map(product => (
                            <div key={product.id} className="flex-shrink-0 w-40 md:w-auto">
                                <ProductCard product={product} />
                            </div>
                        ))}
                    </div>
                </section>

                {/* قسم الألبان */}
                <section className="space-y-4">
                    <div className="flex items-center justify-between">
                        <h2 className="text-xl font-bold text-gray-900">ألبان</h2>
                        <Link to="/products?category=ألبان" className="text-[#FF4500] text-sm font-semibold flex items-center gap-1 hover:gap-2 transition-all">
                            عرض المزيد <ChevronRight className="w-4 h-4" />
                        </Link>
                    </div>
                    <div className="relative rounded-2xl overflow-hidden h-40 bg-gradient-to-br from-blue-100 via-blue-200 to-sky-200">
                        <img src="https://images.unsplash.com/photo-1550583724-b2692b85b150?w=1200" alt="ألبان" className="w-full h-full object-cover opacity-90" />
                        <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent" />
                        <div className="absolute bottom-4 right-4 text-white">
                            <h3 className="text-2xl font-bold">منتجات الألبان</h3>
                            <p className="text-sm">حليب وأجبان طازجة يومياً</p>
                        </div>
                    </div>
                    <div className="flex md:grid md:grid-cols-4 gap-3 overflow-x-auto pb-2 scrollbar-hide md:overflow-visible">
                        {products.filter(p => p.category === 'ألبان').slice(0, 8).map(product => (
                            <div key={product.id} className="flex-shrink-0 w-40 md:w-auto">
                                <ProductCard product={product} />
                            </div>
                        ))}
                    </div>
                </section>

                {/* قسم Healthy */}
                <section className="space-y-4">
                    <div className="flex items-center justify-between">
                        <h2 className="text-xl font-bold text-gray-900">منتجات صحية</h2>
                        <Link to="/products?category=صحي" className="text-[#FF4500] text-sm font-semibold flex items-center gap-1 hover:gap-2 transition-all">
                            عرض المزيد <ChevronRight className="w-4 h-4" />
                        </Link>
                    </div>
                    <div className="relative rounded-2xl overflow-hidden h-40 bg-gradient-to-br from-green-100 via-green-200 to-emerald-200">
                        <img src="https://images.unsplash.com/photo-1490818387583-1baba5e638af?w=1200" alt="صحي" className="w-full h-full object-cover opacity-90" />
                        <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent" />
                        <div className="absolute bottom-4 right-4 text-white">
                            <h3 className="text-2xl font-bold">Healthy</h3>
                            <p className="text-sm">منتجات صحية ومغذية</p>
                        </div>
                    </div>
                    <div className="flex md:grid md:grid-cols-4 gap-3 overflow-x-auto pb-2 scrollbar-hide md:overflow-visible">
                        {products.filter(p => p.category === 'صحي').slice(0, 8).map(product => (
                            <div key={product.id} className="flex-shrink-0 w-40 md:w-auto">
                                <ProductCard product={product} />
                            </div>
                        ))}
                    </div>
                </section>

                {/* قسم مستحضرات التجميل */}
                <section className="space-y-4">
                    <div className="flex items-center justify-between">
                        <h2 className="text-xl font-bold text-gray-900">مستحضرات تجميل</h2>
                        <Link to="/products?category=تجميل" className="text-[#FF4500] text-sm font-semibold flex items-center gap-1 hover:gap-2 transition-all">
                            عرض المزيد <ChevronRight className="w-4 h-4" />
                        </Link>
                    </div>
                    <div className="relative rounded-2xl overflow-hidden h-40 bg-gradient-to-br from-purple-100 via-purple-200 to-pink-200">
                        <img src="https://images.unsplash.com/photo-1596462502278-27bfdc403348?w=1200" alt="تجميل" className="w-full h-full object-cover opacity-90" />
                        <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent" />
                        <div className="absolute bottom-4 right-4 text-white">
                            <h3 className="text-2xl font-bold">Cosmetics</h3>
                            <p className="text-sm">منتجات العناية والجمال</p>
                        </div>
                    </div>
                    <div className="flex md:grid md:grid-cols-4 gap-3 overflow-x-auto pb-2 scrollbar-hide md:overflow-visible">
                        {products.filter(p => p.category === 'تجميل').slice(0, 8).map(product => (
                            <div key={product.id} className="flex-shrink-0 w-40 md:w-auto">
                                <ProductCard product={product} />
                            </div>
                        ))}
                    </div>
                </section>

                {/* قسم الجبن */}
                <section className="space-y-4">
                    <div className="flex items-center justify-between">
                        <h2 className="text-xl font-bold text-gray-900">جبن</h2>
                        <Link to="/products?category=جبن" className="text-[#FF4500] text-sm font-semibold flex items-center gap-1 hover:gap-2 transition-all">
                            عرض المزيد <ChevronRight className="w-4 h-4" />
                        </Link>
                    </div>
                    <div className="relative rounded-2xl overflow-hidden h-40 bg-gradient-to-br from-yellow-100 via-yellow-200 to-amber-200">
                        <img src="https://images.unsplash.com/photo-1452195100486-9cc805987862?w=1200" alt="جبن" className="w-full h-full object-cover opacity-90" />
                        <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent" />
                        <div className="absolute bottom-4 right-4 text-white">
                            <h3 className="text-2xl font-bold">أنواع الجبن</h3>
                            <p className="text-sm">جبن محلي ومستورد</p>
                        </div>
                    </div>
                    <div className="flex md:grid md:grid-cols-4 gap-3 overflow-x-auto pb-2 scrollbar-hide md:overflow-visible">
                        {products.filter(p => p.category === 'جبن').slice(0, 8).map(product => (
                            <div key={product.id} className="flex-shrink-0 w-40 md:w-auto">
                                <ProductCard product={product} />
                            </div>
                        ))}
                    </div>
                </section>

                {/* قسم الكاندي */}
                <section className="space-y-4">
                    <div className="flex items-center justify-between">
                        <h2 className="text-xl font-bold text-gray-900">كاندي</h2>
                        <Link to="/products?category=كاندي" className="text-[#FF4500] text-sm font-semibold flex items-center gap-1 hover:gap-2 transition-all">
                            عرض المزيد <ChevronRight className="w-4 h-4" />
                        </Link>
                    </div>
                    <div className="relative rounded-2xl overflow-hidden h-40 bg-gradient-to-br from-fuchsia-100 via-fuchsia-200 to-pink-200">
                        <img src="https://images.unsplash.com/photo-1582058091505-f87a2e55a40f?w=1200" alt="كاندي" className="w-full h-full object-cover opacity-90" />
                        <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent" />
                        <div className="absolute bottom-4 right-4 text-white">
                            <h3 className="text-2xl font-bold">Candy</h3>
                            <p className="text-sm">حلوى ملونة ولذيذة</p>
                        </div>
                    </div>
                    <div className="flex md:grid md:grid-cols-4 gap-3 overflow-x-auto pb-2 scrollbar-hide md:overflow-visible">
                        {products.filter(p => p.category === 'كاندي').slice(0, 8).map(product => (
                            <div key={product.id} className="flex-shrink-0 w-40 md:w-auto">
                                <ProductCard product={product} />
                            </div>
                        ))}
                    </div>
                </section>

                {/* قسم المشروبات */}
                <section className="space-y-4">
                    <div className="flex items-center justify-between">
                        <h2 className="text-xl font-bold text-gray-900">مشروبات</h2>
                        <Link to="/products?category=مشروبات" className="text-[#FF4500] text-sm font-semibold flex items-center gap-1 hover:gap-2 transition-all">
                            عرض المزيد <ChevronRight className="w-4 h-4" />
                        </Link>
                    </div>
                    <div className="relative rounded-2xl overflow-hidden h-40 bg-gradient-to-br from-cyan-100 via-cyan-200 to-blue-200">
                        <img src="https://images.unsplash.com/photo-1437418747212-8d9709afab22?w=1200" alt="مشروبات" className="w-full h-full object-cover opacity-90" />
                        <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent" />
                        <div className="absolute bottom-4 right-4 text-white">
                            <h3 className="text-2xl font-bold">Beverages</h3>
                            <p className="text-sm">مشروبات باردة ومنعشة</p>
                        </div>
                    </div>
                    <div className="flex md:grid md:grid-cols-4 gap-3 overflow-x-auto pb-2 scrollbar-hide md:overflow-visible">
                        {products.filter(p => p.category === 'مشروبات').slice(0, 8).map(product => (
                            <div key={product.id} className="flex-shrink-0 w-40 md:w-auto">
                                <ProductCard product={product} />
                            </div>
                        ))}
                    </div>
                </section>

                {/* قسم المجمدات */}
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

                {/* Facebook Reels Section */}
                <FacebookReelsGrid pageUsername="Alloshchocolates" pageName="Allosh Chocolates" />
            </div>
        </div>
    );
};

export default HomePage;
