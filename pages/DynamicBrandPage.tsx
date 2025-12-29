import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { 
    ArrowLeft, Filter, X, SlidersHorizontal, 
    ShoppingBag, Star, Heart, Share2, ChevronDown,
    Package, TrendingUp, Sparkles, Grid3x3, List
} from 'lucide-react';
import ProductCard from '../components/ProductCard';
import TopBar from '../components/TopBar';
import { api } from '../services/api';
import { useBranch } from '../context/BranchContext';

interface Category {
    id: string;
    name_ar: string;
    name_en: string;
    products_count: number;
}

interface PriceRange {
    min: number;
    max: number;
}

const DynamicBrandPage = () => {
    const { brandId } = useParams<{ brandId: string }>();
    const { selectedBranch } = useBranch();
    
    const [brand, setBrand] = useState<any>(null);
    const [products, setProducts] = useState<any[]>([]);
    const [categories, setCategories] = useState<Category[]>([]);
    const [priceRange, setPriceRange] = useState<PriceRange>({ min: 0, max: 1000 });
    
    const [loading, setLoading] = useState(true);
    const [showFilters, setShowFilters] = useState(false);
    const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
    
    // Filters
    const [selectedCategory, setSelectedCategory] = useState<string>('');
    const [minPrice, setMinPrice] = useState<number>(0);
    const [maxPrice, setMaxPrice] = useState<number>(1000);
    const [sortBy, setSortBy] = useState<string>('name_asc');
    const [showAvailableOnly, setShowAvailableOnly] = useState(true);
    
    const [currentPage, setCurrentPage] = useState(1);
    const [totalProducts, setTotalProducts] = useState(0);
    const productsPerPage = 20;

    useEffect(() => {
        if (brandId) {
            loadBrandData();
        }
    }, [brandId]);

    useEffect(() => {
        if (brand) {
            loadBrandProducts();
        }
    }, [brand, selectedCategory, minPrice, maxPrice, sortBy, showAvailableOnly, currentPage, selectedBranch]);

    const loadBrandData = async () => {
        setLoading(true);
        try {
            // Load brand details
            const brandResponse = await api.get(`/brands/${brandId}`);
            const brandData = brandResponse.data || brandResponse;
            setBrand(brandData);

            // Load categories for this brand
            const categoriesResponse = await api.get(`/brands/${brandId}/categories${selectedBranch ? `?branchId=${selectedBranch.id}` : ''}`);
            setCategories(categoriesResponse.data || []);

            // Load price range
            const priceRangeResponse = await api.get(`/brands/${brandId}/price-range${selectedBranch ? `?branchId=${selectedBranch.id}` : ''}`);
            const range = priceRangeResponse.data || { min: 0, max: 1000 };
            setPriceRange(range);
            setMinPrice(range.min);
            setMaxPrice(range.max);

        } catch (error) {
            console.error('Error loading brand data:', error);
        } finally {
            setLoading(false);
        }
    };

    const loadBrandProducts = async () => {
        if (!brand) return;
        
        try {
            const params = new URLSearchParams({
                sortBy,
                available: showAvailableOnly ? 'true' : 'false',
                limit: String(productsPerPage),
                offset: String((currentPage - 1) * productsPerPage)
            });

            if (selectedCategory) params.append('category', selectedCategory);
            if (minPrice > priceRange.min) params.append('minPrice', String(minPrice));
            if (maxPrice < priceRange.max) params.append('maxPrice', String(maxPrice));
            if (selectedBranch) params.append('branchId', String(selectedBranch.id));

            const response = await api.get(`/brands/${brandId}/products?${params.toString()}`);
            setProducts(response.data || []);
            setTotalProducts(response.total || 0);
        } catch (error) {
            console.error('Error loading brand products:', error);
        }
    };

    const resetFilters = () => {
        setSelectedCategory('');
        setMinPrice(priceRange.min);
        setMaxPrice(priceRange.max);
        setSortBy('name_asc');
        setShowAvailableOnly(true);
        setCurrentPage(1);
    };

    const sortOptions = [
        { value: 'name_asc', label: 'الاسم: أ-ي' },
        { value: 'name_desc', label: 'الاسم: ي-أ' },
        { value: 'price_asc', label: 'السعر: من الأقل للأعلى' },
        { value: 'price_desc', label: 'السعر: من الأعلى للأقل' },
        { value: 'rating', label: 'الأعلى تقييماً' },
        { value: 'popular', label: 'الأكثر شعبية' }
    ];

    if (loading || !brand) {
        return (
            <div className="min-h-screen bg-gray-50">
                {/* Header Skeleton */}
                <div className="bg-white p-4 border-b">
                    <div className="h-6 w-32 bg-gray-200 rounded animate-pulse"></div>
                </div>
                
                {/* Brand Header Skeleton */}
                <div className="bg-white border-b p-6">
                    <div className="max-w-7xl mx-auto">
                        <div className="flex items-center gap-4 mb-4">
                            <div className="w-20 h-20 bg-gray-200 rounded-xl animate-pulse"></div>
                            <div className="flex-1">
                                <div className="h-6 w-48 bg-gray-200 rounded mb-2 animate-pulse"></div>
                                <div className="h-4 w-32 bg-gray-200 rounded animate-pulse"></div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Filters Skeleton */}
                <div className="bg-white border-b p-4">
                    <div className="max-w-7xl mx-auto">
                        <div className="flex gap-3 overflow-x-auto pb-2">
                            {[1, 2, 3, 4].map(i => (
                                <div key={i} className="h-10 w-24 bg-gray-200 rounded-lg animate-pulse flex-shrink-0"></div>
                            ))}
                        </div>
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

    const totalPages = Math.ceil(totalProducts / productsPerPage);

    return (
        <div className="min-h-screen bg-gray-50 pb-20">
            <TopBar title={brand.name_ar || brand.name} showBack />

            {/* Brand Header */}
            <div 
                className="relative overflow-hidden"
                style={{
                    background: `linear-gradient(135deg, ${brand.primary_color || '#F97316'}, ${brand.secondary_color || '#EA580C'})`
                }}
            >
                <div className="relative z-10 px-4 py-8">
                    <div className="flex items-center gap-4 mb-4">
                        {brand.logo_url && (
                            <div className="w-20 h-20 bg-white rounded-xl p-2 shadow-lg">
                                <img 
                                    src={brand.logo_url} 
                                    alt={brand.name_ar}
                                    className="w-full h-full object-contain"
                                />
                            </div>
                        )}
                        <div className="flex-1 text-white">
                            <h1 className="text-2xl font-bold mb-1">{brand.name_ar}</h1>
                            {brand.slogan_ar && (
                                <p className="text-white/80 text-sm">{brand.slogan_ar}</p>
                            )}
                        </div>
                        <div className="flex gap-2">
                            <button className="w-10 h-10 bg-white/20 backdrop-blur-sm rounded-full flex items-center justify-center">
                                <Heart size={20} className="text-white" />
                            </button>
                            <button className="w-10 h-10 bg-white/20 backdrop-blur-sm rounded-full flex items-center justify-center">
                                <Share2 size={20} className="text-white" />
                            </button>
                        </div>
                    </div>

                    {/* Stats */}
                    <div className="flex items-center justify-around bg-white/10 backdrop-blur-sm rounded-xl p-3">
                        <div className="text-center">
                            <div className="text-xl font-bold text-white">{totalProducts}</div>
                            <div className="text-xs text-white/70">منتج</div>
                        </div>
                        <div className="w-px h-8 bg-white/30"></div>
                        <div className="text-center">
                            <div className="flex items-center justify-center gap-1 text-xl font-bold text-white">
                                <Star size={16} fill="white" />
                                {brand.rating || '4.5'}
                            </div>
                            <div className="text-xs text-white/70">تقييم</div>
                        </div>
                        <div className="w-px h-8 bg-white/30"></div>
                        <div className="text-center">
                            <div className="text-xl font-bold text-white">
                                {products.filter(p => p.discount_price).length}
                            </div>
                            <div className="text-xs text-white/70">عرض</div>
                        </div>
                    </div>
                </div>

                {/* Wave Bottom */}
                <svg className="absolute bottom-0 w-full" viewBox="0 0 1440 50" fill="none">
                    <path 
                        d="M0 25L48 22.9167C96 20.8333 192 16.6667 288 17.7083C384 18.75 480 25 576 27.0833C672 29.1667 768 27.0833 864 23.9583C960 20.8333 1056 16.6667 1152 17.7083C1248 18.75 1344 25 1392 28.125L1440 31.25V50H1392C1344 50 1248 50 1152 50C1056 50 960 50 864 50C768 50 672 50 576 50C480 50 384 50 288 50C192 50 96 50 48 50H0V25Z" 
                        fill="#F9FAFB"
                    />
                </svg>
            </div>

            {/* Filters Bar */}
            <div className="bg-white border-b sticky top-0 z-30">
                <div className="px-4 py-3 flex items-center gap-2 overflow-x-auto">
                    <button
                        onClick={() => setShowFilters(!showFilters)}
                        className="flex items-center gap-2 px-4 py-2 bg-orange-50 text-orange-600 rounded-lg font-medium whitespace-nowrap"
                    >
                        <SlidersHorizontal size={18} />
                        فلترة
                    </button>

                    {/* Quick Category Filters */}
                    <div className="flex gap-2">
                        <button
                            onClick={() => setSelectedCategory('')}
                            className={`px-4 py-2 rounded-lg font-medium whitespace-nowrap transition ${
                                !selectedCategory 
                                    ? 'bg-orange-500 text-white' 
                                    : 'bg-gray-100 text-gray-700'
                            }`}
                        >
                            الكل ({totalProducts})
                        </button>
                        {categories.slice(0, 3).map(cat => (
                            <button
                                key={cat.id}
                                onClick={() => setSelectedCategory(cat.id)}
                                className={`px-4 py-2 rounded-lg font-medium whitespace-nowrap transition ${
                                    selectedCategory === cat.id 
                                        ? 'bg-orange-500 text-white' 
                                        : 'bg-gray-100 text-gray-700'
                                }`}
                            >
                                {cat.name_ar} ({cat.products_count})
                            </button>
                        ))}
                    </div>

                    {/* View Mode */}
                    <div className="mr-auto flex gap-1 bg-gray-100 rounded-lg p-1">
                        <button
                            onClick={() => setViewMode('grid')}
                            className={`p-2 rounded ${viewMode === 'grid' ? 'bg-white shadow-sm' : ''}`}
                        >
                            <Grid3x3 size={18} className={viewMode === 'grid' ? 'text-orange-600' : 'text-gray-500'} />
                        </button>
                        <button
                            onClick={() => setViewMode('list')}
                            className={`p-2 rounded ${viewMode === 'list' ? 'bg-white shadow-sm' : ''}`}
                        >
                            <List size={18} className={viewMode === 'list' ? 'text-orange-600' : 'text-gray-500'} />
                        </button>
                    </div>
                </div>
            </div>

            {/* Filters Panel */}
            {showFilters && (
                <div className="bg-white border-b p-4">
                    <div className="max-w-4xl mx-auto">
                        <div className="flex items-center justify-between mb-4">
                            <h3 className="text-lg font-bold">خيارات التصفية</h3>
                            <button
                                onClick={resetFilters}
                                className="text-orange-600 text-sm font-medium"
                            >
                                إعادة تعيين
                            </button>
                        </div>

                        {/* Sort By */}
                        <div className="mb-4">
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                ترتيب حسب
                            </label>
                            <select
                                value={sortBy}
                                onChange={(e) => setSortBy(e.target.value)}
                                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                            >
                                {sortOptions.map(option => (
                                    <option key={option.value} value={option.value}>
                                        {option.label}
                                    </option>
                                ))}
                            </select>
                        </div>

                        {/* Price Range */}
                        <div className="mb-4">
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                نطاق السعر: {minPrice} - {maxPrice} جنيه
                            </label>
                            <div className="flex gap-4">
                                <input
                                    type="range"
                                    min={priceRange.min}
                                    max={priceRange.max}
                                    value={minPrice}
                                    onChange={(e) => setMinPrice(Number(e.target.value))}
                                    className="flex-1"
                                />
                                <input
                                    type="range"
                                    min={priceRange.min}
                                    max={priceRange.max}
                                    value={maxPrice}
                                    onChange={(e) => setMaxPrice(Number(e.target.value))}
                                    className="flex-1"
                                />
                            </div>
                        </div>

                        {/* All Categories */}
                        <div className="mb-4">
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                الفئة
                            </label>
                            <div className="grid grid-cols-2 gap-2">
                                {categories.map(cat => (
                                    <button
                                        key={cat.id}
                                        onClick={() => setSelectedCategory(cat.id === selectedCategory ? '' : cat.id)}
                                        className={`px-4 py-2 rounded-lg border font-medium text-sm transition ${
                                            selectedCategory === cat.id
                                                ? 'border-orange-500 bg-orange-50 text-orange-600'
                                                : 'border-gray-300 text-gray-700 hover:border-orange-300'
                                        }`}
                                    >
                                        {cat.name_ar} ({cat.products_count})
                                    </button>
                                ))}
                            </div>
                        </div>

                        {/* Availability */}
                        <div className="flex items-center gap-2">
                            <input
                                type="checkbox"
                                id="available"
                                checked={showAvailableOnly}
                                onChange={(e) => setShowAvailableOnly(e.target.checked)}
                                className="w-4 h-4 text-orange-600 rounded focus:ring-orange-500"
                            />
                            <label htmlFor="available" className="text-sm text-gray-700">
                                إظهار المنتجات المتاحة فقط
                            </label>
                        </div>
                    </div>
                </div>
            )}

            {/* Products Grid */}
            <div className="px-4 py-6">
                {products.length === 0 ? (
                    <div className="text-center py-12">
                        <Package size={64} className="mx-auto text-gray-300 mb-4" />
                        <h3 className="text-lg font-bold text-gray-800 mb-2">لا توجد منتجات</h3>
                        <p className="text-gray-500">جرب تغيير الفلاتر</p>
                    </div>
                ) : (
                    <>
                        <div className={
                            viewMode === 'grid' 
                                ? 'grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4'
                                : 'space-y-4'
                        }>
                            {products.map((product) => (
                                <ProductCard key={product.id} product={product} />
                            ))}
                        </div>

                        {/* Pagination */}
                        {totalPages > 1 && (
                            <div className="flex justify-center gap-2 mt-8">
                                <button
                                    onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                                    disabled={currentPage === 1}
                                    className="px-4 py-2 bg-white border rounded-lg disabled:opacity-50"
                                >
                                    السابق
                                </button>
                                
                                <div className="flex gap-1">
                                    {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                                        const page = i + 1;
                                        return (
                                            <button
                                                key={page}
                                                onClick={() => setCurrentPage(page)}
                                                className={`w-10 h-10 rounded-lg font-medium ${
                                                    currentPage === page
                                                        ? 'bg-orange-500 text-white'
                                                        : 'bg-white border hover:border-orange-300'
                                                }`}
                                            >
                                                {page}
                                            </button>
                                        );
                                    })}
                                </div>

                                <button
                                    onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                                    disabled={currentPage === totalPages}
                                    className="px-4 py-2 bg-white border rounded-lg disabled:opacity-50"
                                >
                                    التالي
                                </button>
                            </div>
                        )}
                    </>
                )}
            </div>
        </div>
    );
};

export default DynamicBrandPage;
