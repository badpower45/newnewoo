import React, { useState, useEffect } from 'react';
import TopBar from '../components/TopBar';
import Banner from '../components/Banner';
import CategoryCard from '../components/CategoryCard';
import ProductCard from '../components/ProductCard';
import CategoryFilter from '../components/CategoryFilter';
import SponsoredAds from '../components/SponsoredAds';
import FlyerCarousel from '../components/FlyerCarousel';
import LoadingSpinner from '../components/LoadingSpinner';
import ErrorMessage from '../components/ErrorMessage';
import BrandsCarousel from '../components/BrandsCarousel';
import { ChevronRight } from 'lucide-react';
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
        <div className="bg-gray-50 min-h-screen pb-24 md:pb-8">
            <TopBar />

            <div className="p-4 space-y-6 max-w-7xl mx-auto">
                {/* Category Filter (Task Bar) */}
                <CategoryFilter
                    categories={filterCategories}
                    activeCategory={activeCategory}
                    onSelect={setActiveCategory}
                />

                {/* Desktop Grid for Banners */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {/* Login Banner - Only show if not authenticated */}
                    {!isAuthenticated && <Banner type="login" />}
                    {/* Promo Banner */}
                    <Banner type="promo" image="https://images.unsplash.com/photo-1607082348824-0a96f2a4b9da?auto=format&fit=crop&w=800&q=80" />
                </div>

                {/* Sponsored Ads - Carousel Layout */}
                <SponsoredAds ads={SPONSORED_ADS} layout="carousel" />

                {/* Brand Banner */}
                <div className="rounded-2xl overflow-hidden shadow-sm h-32 md:h-64">
                    <img src="https://images.unsplash.com/photo-1599490659213-e2b9527bd087?auto=format&fit=crop&w=1200&q=80" alt="Chips" className="w-full h-full object-cover" />
                </div>

                {/* Weekly Flyer Magazine */}
                <FlyerCarousel pages={FLYER_PAGES} />

                {/* Featured Brands Carousel */}
                <BrandsCarousel title="براندات مميزة" />

                {/* Sponsored Ads - Grid Layout (Scattered) */}
                <SponsoredAds ads={SPONSORED_ADS.slice(0, 2)} layout="grid" />

                {/* Special Categories */}
                <div>
                    <h3 className="text-lg font-bold text-gray-900 mb-3">Special Categories</h3>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                        {CATEGORIES.map((cat, idx) => (
                            <div key={idx} className={`flex items-center p-3 rounded-xl ${cat.color} space-x-3 hover:shadow-md transition-shadow cursor-pointer`}>
                                <div className="w-10 h-10 bg-white/50 rounded-full flex items-center justify-center text-lg">
                                    {cat.icon}
                                </div>
                                <span className="font-medium text-sm text-gray-800">{cat.name}</span>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Products You Might Like */}
                <div>
                    <div className="flex justify-between items-center mb-3">
                        <h3 className="text-lg font-bold text-gray-900">Products you might like</h3>
                        <button className="text-sm text-gray-500 hover:text-primary flex items-center">
                            View all <ChevronRight size={16} />
                        </button>
                    </div>

                    {/* Loading/Error States */}
                    {loading ? (
                        <LoadingSpinner message="جاري تحميل المنتجات..." />
                    ) : error ? (
                        <ErrorMessage message={error} onRetry={fetchProducts} />
                    ) : products.length === 0 ? (
                        <div className="text-center py-8 text-gray-500">
                            لا توجد منتجات متاحة حالياً
                        </div>
                    ) : products.length === 0 ? (
                        <div className="text-center py-8 text-gray-500">
                            لا توجد منتجات متاحة حالياً
                        </div>
                    ) : (
                        /* Mobile: Horizontal Scroll, Desktop: Grid */
                        <div className="flex space-x-4 overflow-x-auto pb-4 no-scrollbar -mx-4 px-4 md:grid md:grid-cols-4 md:space-x-0 md:gap-4 md:mx-0 md:px-0">
                            {products.slice(0, 8).map((product) => {
                                const bp = branchMap[product.id] || {};
                                const reserved = bp.reservedQuantity || 0;
                                const stock = bp.stockQuantity;
                                const available = typeof stock === 'number' ? (stock - reserved) > 0 : true;
                                const displayPrice = (bp.price ?? product.price) || 0;
                                return (
                                    <div key={product.id} className="w-40 flex-shrink-0 md:w-auto">
                                        <ProductCard product={{ ...product, price: displayPrice }} available={available} />
                                    </div>
                                );
                            })}
                        </div>
                    )}
                </div>

                {/* Categories Grid Preview */}
                <div>
                    <h3 className="text-lg font-bold text-gray-900 mb-3">Categories</h3>
                    <div className="grid grid-cols-3 md:grid-cols-6 gap-3">
                        {ALL_CATEGORIES.slice(0, 12).map((cat, idx) => (
                            <CategoryCard key={idx} name={cat} bgColor="bg-white" />
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default HomePage;
