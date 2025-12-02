import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import TopBar from '../components/TopBar';
import Footer from '../components/Footer';
import Banner from '../components/Banner';
import CategoryCard from '../components/CategoryCard';
import ProductCard from '../components/ProductCard';
import CategoryFilter from '../components/CategoryFilter';
import SponsoredAds from '../components/SponsoredAds';
import FlyerCarousel from '../components/FlyerCarousel';
import ErrorMessage from '../components/ErrorMessage';
import { ProductGridSkeleton, BannerSkeleton, CategoriesGridSkeleton } from '../components/Skeleton';
import BrandsCarousel from '../components/BrandsCarousel';
import { ChevronRight, Flame, BookOpen } from 'lucide-react';
import { CATEGORIES, ALL_CATEGORIES, SPONSORED_ADS, FLYER_PAGES } from '../data/mockData';
import { api } from '../services/api';
import { Product } from '../types';
import { useAuth } from '../context/AuthContext';
import { useBranch } from '../context/BranchContext';
import { DEFAULT_BRANCH_ID } from '../src/config';

const HomePage = () => {
    const [activeCategory, setActiveCategory] = useState('All');
    const [products, setProducts] = useState<Product[]>([]);
    const [branchMap, setBranchMap] = useState<Record<string | number, { price?: number; stockQuantity?: number; reservedQuantity?: number }>>({});
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const filterCategories = ['All', 'Food', 'Vouchers', 'Beverages', 'Snacks', 'Dairy', 'Cleaning'];
    const { isAuthenticated } = useAuth();
    const { selectedBranch } = useBranch();

    const fetchProducts = async () => {
        setLoading(true);
        setError(null);
        try {
            const branchId = selectedBranch?.id || DEFAULT_BRANCH_ID;
            const data = await api.products.getAllByBranch(branchId);
            const list = Array.isArray(data?.data) ? data.data : (Array.isArray(data) ? data : []);
            setProducts(list);
        } catch (err) {
            console.error('Failed to fetch products', err);
            setProducts([]);
            setError('فشل تحميل المنتجات');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchProducts();
    }, [selectedBranch]);

    useEffect(() => {
        const loadBranch = async () => {
            if (!selectedBranch) { setBranchMap({}); return; }
            try {
                const res = await api.branchProducts.getByBranch(selectedBranch.id);
                const list = Array.isArray(res?.data) ? res.data : (Array.isArray(res) ? res : []);
                const map: Record<string | number, { price?: number; stockQuantity?: number; reservedQuantity?: number }> = {};
                for (const bp of list) {
                    const pid = bp.product_id ?? bp.productId ?? bp.id;
                    if (pid == null) continue;
                    map[pid] = {
                        price: bp.branch_price ?? bp.branchPrice ?? bp.price,
                        stockQuantity: bp.available_quantity ?? bp.stock_quantity ?? bp.stockQuantity,
                        reservedQuantity: bp.reserved_quantity ?? bp.reservedQuantity
                    };
                }
                setBranchMap(map);
            } catch (e) {
                console.error('Failed to load branch products', e);
                setBranchMap({});
            }
        };
        loadBranch();
    }, [selectedBranch]);

    return (
        <div className="bg-[#FAFAFA] min-h-screen pb-24 md:pb-8">
            <TopBar />

            <div className="px-4 py-3 space-y-5 max-w-7xl mx-auto">
                {/* Category Filter (Task Bar) */}
                <CategoryFilter
                    categories={filterCategories}
                    activeCategory={activeCategory}
                    onSelect={setActiveCategory}
                />

                {/* Desktop Grid for Banners */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    {/* Login Banner - Only show if not authenticated */}
                    {!isAuthenticated && <Banner type="login" />}
                    {/* Promo Banner */}
                    <Banner type="promo" image="https://images.unsplash.com/photo-1607082348824-0a96f2a4b9da?auto=format&fit=crop&w=800&q=80" />
                </div>

                {/* Sponsored Ads - Carousel Layout */}
                <SponsoredAds ads={SPONSORED_ADS} layout="carousel" />

                {/* Brand Banner */}
                <div className="rounded-2xl overflow-hidden shadow-sm h-28 md:h-56">
                    <img src="https://images.unsplash.com/photo-1599490659213-e2b9527bd087?auto=format&fit=crop&w=1200&q=80" alt="Chips" className="w-full h-full object-cover" />
                </div>

                {/* Weekly Flyer Magazine */}
                <FlyerCarousel pages={FLYER_PAGES} />

                {/* Quick Access - Hot Deals & Magazine */}
                <div className="grid grid-cols-2 gap-3">
                    <Link to="/deals" className="group">
                        <div className="bg-gradient-to-br from-[#EF4444] to-[#dc2626] rounded-2xl p-3.5 h-24 flex flex-col justify-between relative overflow-hidden hover:shadow-xl transition-all active:scale-[0.98]">
                            <div className="absolute top-0 right-0 w-20 h-20 bg-white/10 rounded-full -translate-y-1/2 translate-x-1/2" />
                            <Flame className="w-7 h-7 text-white" />
                            <div>
                                <h3 className="text-white font-bold text-base">العروض الساخنة</h3>
                                <p className="text-white/80 text-xs">عروض لفترة محدودة!</p>
                            </div>
                        </div>
                    </Link>
                    <Link to="/magazine" className="group">
                        <div className="bg-gradient-to-br from-[#F97316] to-[#ea580c] rounded-2xl p-3.5 h-24 flex flex-col justify-between relative overflow-hidden hover:shadow-xl transition-all active:scale-[0.98]">
                            <div className="absolute top-0 right-0 w-20 h-20 bg-white/10 rounded-full -translate-y-1/2 translate-x-1/2" />
                            <BookOpen className="w-7 h-7 text-white" />
                            <div>
                                <h3 className="text-white font-bold text-base">مجلة العروض</h3>
                                <p className="text-white/80 text-xs">عروض هذا الأسبوع</p>
                            </div>
                        </div>
                    </Link>
                </div>

                {/* Featured Brands Carousel */}
                <BrandsCarousel title="براندات مميزة" />

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
                <div>
                    <h3 className="text-base font-bold text-[#1F2937] mb-2.5">الفئات</h3>
                    <div className="grid grid-cols-3 md:grid-cols-6 gap-2.5">
                        {ALL_CATEGORIES.slice(0, 12).map((cat, idx) => (
                            <CategoryCard key={idx} name={cat} bgColor="bg-white" />
                        ))}
                    </div>
                </div>
            </div>
            <Footer />
        </div>
    );
};

export default HomePage;
