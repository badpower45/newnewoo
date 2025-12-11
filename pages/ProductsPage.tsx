import React, { useState, useEffect, useMemo, useCallback } from 'react';
import ProductCard from '../components/ProductCard';
import BarcodeScanner from '../components/BarcodeScanner';
import { ProductGridSkeleton } from '../components/Skeleton';
import TopBar from '../components/TopBar';
import { 
    Filter, Scan, Search, X, Grid3X3, LayoutList, 
    SlidersHorizontal, ChevronDown, ChevronUp, Sparkles,
    TrendingUp, Clock, Tag, Check, ArrowUpDown
} from 'lucide-react';
import { api } from '../services/api';
import { Product } from '../types';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useBranch } from '../context/BranchContext';

// Categories with icons and colors - using brand colors
const CATEGORIES = [
    { id: '', name: 'الكل', icon: '🛒', color: 'from-brand-brown to-brand-brown/80' },
    { id: 'Dairy', name: 'الألبان', icon: '🥛', color: 'from-brand-orange to-amber-500' },
    { id: 'Cheese', name: 'الجبن', icon: '🧀', color: 'from-yellow-500 to-amber-500' },
    { id: 'Meat', name: 'اللحوم', icon: '🥩', color: 'from-red-500 to-rose-600' },
    { id: 'Vegetables', name: 'الخضروات', icon: '🥬', color: 'from-green-500 to-emerald-600' },
    { id: 'Fruits', name: 'الفواكه', icon: '🍎', color: 'from-pink-500 to-rose-500' },
    { id: 'Bakery', name: 'المخبوزات', icon: '🍞', color: 'from-amber-500 to-orange-500' },
    { id: 'Beverages', name: 'المشروبات', icon: '🥤', color: 'from-cyan-500 to-blue-500' },
    { id: 'Snacks', name: 'سناكس', icon: '🍿', color: 'from-brand-orange to-red-500' },
    { id: 'Frozen', name: 'مجمدات', icon: '🧊', color: 'from-sky-400 to-blue-500' },
    { id: 'Cleaning', name: 'تنظيف', icon: '🧹', color: 'from-purple-500 to-violet-600' },
    { id: 'Personal Care', name: 'عناية شخصية', icon: '🧴', color: 'from-rose-400 to-pink-500' },
];

const SORT_OPTIONS = [
    { id: 'newest', name: 'الأحدث', icon: Clock },
    { id: 'popular', name: 'الأكثر مبيعاً', icon: TrendingUp },
    { id: 'price-asc', name: 'السعر: الأقل', icon: ArrowUpDown },
    { id: 'price-desc', name: 'السعر: الأعلى', icon: ArrowUpDown },
    { id: 'discount', name: 'أعلى خصم', icon: Tag },
];

const ITEMS_PER_PAGE = 20;

export default function ProductsPage() {
    const [allProducts, setAllProducts] = useState<Product[]>([]);
    const [loading, setLoading] = useState(true);
    const [showScanner, setShowScanner] = useState(false);
    const [searchQuery, setSearchQuery] = useState('');
    const [selectedCategory, setSelectedCategory] = useState<string>('');
    const [sortBy, setSortBy] = useState<string>('newest');
    const [currentPage, setCurrentPage] = useState(1);
    const [showFilters, setShowFilters] = useState(false);
    const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
    const [priceRange, setPriceRange] = useState<[number, number]>([0, 1000]);
    const [showOnlyOffers, setShowOnlyOffers] = useState(false);
    const [showSortDropdown, setShowSortDropdown] = useState(false);
    const [isSearchFocused, setIsSearchFocused] = useState(false);
    
    const navigate = useNavigate();
    const [searchParams] = useSearchParams();
    const { selectedBranch } = useBranch();

    useEffect(() => {
        const category = searchParams.get('category');
        if (category) {
            setSelectedCategory(category);
        }
        fetchProducts();
    }, [searchParams, selectedBranch]);

    const fetchProducts = async () => {
        setLoading(true);
        try {
            const branchId = selectedBranch?.id || 1;
            const data = await api.products.getAllByBranch(branchId);
            const list = Array.isArray(data?.data) ? data.data : (Array.isArray(data) ? data : []);
            setAllProducts(list);
        } catch (err) {
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    const handleBarcodeScanned = async (barcode: string) => {
        setShowScanner(false);
        try {
            const response = await api.products.getByBarcode(barcode);
            if (response.data) {
                navigate(`/product/${response.data.id}`);
            } else {
                alert('المنتج غير موجود');
            }
        } catch (error) {
            alert('حدث خطأ في البحث عن المنتج');
        }
    };

    const handleSearch = useCallback(async (query: string) => {
        setSearchQuery(query);
        setCurrentPage(1);
        
        if (query.trim()) {
            setLoading(true);
            try {
                const data = await api.products.search(query);
                if (data.data) {
                    setAllProducts(data.data);
                }
            } catch (err) {
                console.error('Search error:', err);
            } finally {
                setLoading(false);
            }
        } else {
            fetchProducts();
        }
    }, []);

    // Filter and sort products
    const filteredAndSortedProducts = useMemo(() => {
        let filtered = [...allProducts];

        // Filter by search query (local search)
        if (searchQuery.trim()) {
            const query = searchQuery.toLowerCase().trim();
            filtered = filtered.filter(p => {
                const name = (p.name || '').toLowerCase();
                const nameAr = (p.name_ar || '').toLowerCase();
                const category = (p.category || '').toLowerCase();
                const description = (p.description || '').toLowerCase();
                
                return name.includes(query) || 
                       nameAr.includes(query) || 
                       category.includes(query) ||
                       description.includes(query);
            });
        }

        // Filter by category
        if (selectedCategory) {
            filtered = filtered.filter(p => p.category === selectedCategory);
        }

        // Filter by price range
        filtered = filtered.filter(p => {
            const price = Number(p.price) || 0;
            return price >= priceRange[0] && price <= priceRange[1];
        });

        // Filter offers only
        if (showOnlyOffers) {
            filtered = filtered.filter(p => p.discount_price && Number(p.discount_price) > Number(p.price));
        }

        // Sort
        switch (sortBy) {
            case 'price-asc':
                filtered.sort((a, b) => (Number(a.price) || 0) - (Number(b.price) || 0));
                break;
            case 'price-desc':
                filtered.sort((a, b) => (Number(b.price) || 0) - (Number(a.price) || 0));
                break;
            case 'popular':
                filtered.sort((a, b) => (Number(b.reviews) || 0) - (Number(a.reviews) || 0));
                break;
            case 'discount':
                filtered.sort((a, b) => {
                    const discA = a.discount_price ? ((Number(a.discount_price) - Number(a.price)) / Number(a.discount_price)) * 100 : 0;
                    const discB = b.discount_price ? ((Number(b.discount_price) - Number(b.price)) / Number(b.discount_price)) * 100 : 0;
                    return discB - discA;
                });
                break;
            case 'newest':
            default:
                break;
        }

        return filtered;
    }, [allProducts, selectedCategory, sortBy, priceRange, showOnlyOffers, searchQuery]);

    // Pagination
    const totalPages = Math.ceil(filteredAndSortedProducts.length / ITEMS_PER_PAGE);
    const paginatedProducts = filteredAndSortedProducts.slice(
        (currentPage - 1) * ITEMS_PER_PAGE,
        currentPage * ITEMS_PER_PAGE
    );

    const clearFilters = () => {
        setSelectedCategory('');
        setPriceRange([0, 1000]);
        setShowOnlyOffers(false);
        setSortBy('newest');
        setSearchQuery('');
    };

    const hasActiveFilters = selectedCategory || showOnlyOffers || priceRange[0] > 0 || priceRange[1] < 1000;

    return (
        <div className="min-h-screen bg-gradient-to-b from-orange-50/30 to-white">
            <TopBar />
            
            {/* Hero Section */}
            <div className="bg-gradient-to-r from-brand-brown via-brand-brown/90 to-brand-orange pt-6 pb-8 px-4 relative overflow-hidden">
                {/* Background Pattern */}
                <div className="absolute inset-0 opacity-10">
                    <div className="absolute top-5 left-10 text-5xl">🥬</div>
                    <div className="absolute top-10 right-20 text-4xl">🍎</div>
                    <div className="absolute bottom-5 left-1/4 text-3xl">🥛</div>
                    <div className="absolute bottom-3 right-1/3 text-4xl">🧀</div>
                </div>
                
                <div className="max-w-4xl mx-auto relative z-10 text-center">
                    <h1 className="text-2xl md:text-3xl font-bold text-white mb-1">
                        اكتشف منتجاتنا الطازجة 🛒
                    </h1>
                    <p className="text-orange-100 text-sm">
                        أكثر من {allProducts.length} منتج متاح للتوصيل
                    </p>
                </div>
            </div>

            {/* Categories Slider */}
            <div className="bg-white shadow-sm sticky top-0 z-40">
                <div className="max-w-7xl mx-auto">
                    <div className="flex gap-2 py-4 px-4 overflow-x-auto scrollbar-hide">
                        {CATEGORIES.map((cat) => (
                            <button
                                key={cat.id}
                                onClick={() => {
                                    setSelectedCategory(cat.id);
                                    setCurrentPage(1);
                                }}
                                className={`flex items-center gap-2 px-4 py-2.5 rounded-full whitespace-nowrap transition-all duration-300 ${
                                    selectedCategory === cat.id
                                        ? `bg-gradient-to-r ${cat.color} text-white shadow-lg scale-105`
                                        : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                                }`}
                            >
                                <span className="text-lg">{cat.icon}</span>
                                <span className="font-medium">{cat.name}</span>
                            </button>
                        ))}
                    </div>
                </div>
            </div>

            {/* Category Banner - Modern Design */}
            {selectedCategory && selectedCategory !== '' && (
                <div className="max-w-7xl mx-auto px-4 pt-6">
                    <div className={`relative overflow-hidden rounded-3xl shadow-2xl bg-gradient-to-br ${CATEGORIES.find(c => c.id === selectedCategory)?.color || 'from-orange-500 to-orange-700'}`}>
                        {/* Animated Background Pattern */}
                        <div className="absolute inset-0 overflow-hidden">
                            {/* Floating Circles */}
                            <div className="absolute -top-20 -right-20 w-64 h-64 bg-white/10 rounded-full blur-3xl animate-pulse"></div>
                            <div className="absolute -bottom-32 -left-20 w-96 h-96 bg-white/10 rounded-full blur-3xl animate-pulse" style={{animationDelay: '1s'}}></div>
                            <div className="absolute top-1/2 right-1/3 w-40 h-40 bg-white/5 rounded-full blur-2xl animate-pulse" style={{animationDelay: '2s'}}></div>
                            
                            {/* Grid Pattern */}
                            <div className="absolute inset-0 opacity-[0.03]" style={{
                                backgroundImage: 'linear-gradient(white 1px, transparent 1px), linear-gradient(90deg, white 1px, transparent 1px)',
                                backgroundSize: '50px 50px'
                            }}></div>
                        </div>
                        
                        {/* Content Container */}
                        <div className="relative z-10 px-6 py-8 md:px-10 md:py-10">
                            <div className="flex items-center justify-between">
                                {/* Left Content */}
                                <div className="flex items-center gap-5">
                                    {/* Icon Container with Glow Effect */}
                                    <div className="relative group">
                                        <div className="absolute inset-0 bg-white/40 rounded-2xl blur-xl group-hover:blur-2xl transition-all"></div>
                                        <div className="relative w-20 h-20 md:w-24 md:h-24 bg-white/90 backdrop-blur-md rounded-2xl flex items-center justify-center shadow-xl transform group-hover:scale-110 transition-transform duration-300">
                                            <span className="text-5xl md:text-6xl drop-shadow-lg">{CATEGORIES.find(c => c.id === selectedCategory)?.icon}</span>
                                        </div>
                                    </div>
                                    
                                    {/* Text Content */}
                                    <div className="space-y-2">
                                        <div className="flex items-center gap-3">
                                            <h2 className="text-3xl md:text-4xl font-black text-white drop-shadow-lg">
                                                {CATEGORIES.find(c => c.id === selectedCategory)?.name}
                                            </h2>
                                            <div className="hidden md:flex items-center gap-1 px-3 py-1 bg-white/20 backdrop-blur-md rounded-full">
                                                <Sparkles size={16} className="text-white" />
                                                <span className="text-white text-sm font-bold">جديد</span>
                                            </div>
                                        </div>
                                        <p className="text-white/95 text-base md:text-lg font-medium drop-shadow-md flex items-center gap-2">
                                            <Tag size={18} className="text-white/80" />
                                            اكتشف منتجاتنا الطازجة - أكثر من 10 منتج متاح للتوصيل
                                        </p>
                                    </div>
                                </div>
                                
                                {/* Right Decorative Element - Large Floating Icon */}
                                <div className="hidden lg:flex items-center justify-center">
                                    <div className="relative">
                                        <div className="absolute inset-0 bg-white/20 rounded-full blur-2xl"></div>
                                        <div className="relative text-[120px] opacity-20 transform hover:scale-110 transition-transform duration-500">
                                            {CATEGORIES.find(c => c.id === selectedCategory)?.icon}
                                        </div>
                                    </div>
                                </div>
                            </div>
                            
                            {/* Bottom Stats Bar */}
                            <div className="mt-6 flex items-center gap-4 md:gap-6">
                                <div className="flex items-center gap-2 px-4 py-2 bg-white/20 backdrop-blur-md rounded-xl">
                                    <TrendingUp size={18} className="text-white" />
                                    <span className="text-white font-bold text-sm">الأكثر مبيعاً</span>
                                </div>
                                <div className="flex items-center gap-2 px-4 py-2 bg-white/20 backdrop-blur-md rounded-xl">
                                    <Tag size={18} className="text-white" />
                                    <span className="text-white font-bold text-sm">عروض حصرية</span>
                                </div>
                                <div className="hidden md:flex items-center gap-2 px-4 py-2 bg-white/20 backdrop-blur-md rounded-xl">
                                    <Sparkles size={18} className="text-white" />
                                    <span className="text-white font-bold text-sm">توصيل سريع</span>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            <div className="max-w-7xl mx-auto px-4 py-6">
                {/* Toolbar */}
                <div className="flex flex-wrap items-center justify-between gap-4 mb-6">
                    {/* Left Side */}
                    <div className="flex items-center gap-3">
                        {/* Filter Button */}
                        <button
                            onClick={() => setShowFilters(!showFilters)}
                            className={`flex items-center gap-2 px-4 py-2.5 rounded-xl transition-all ${
                                showFilters || hasActiveFilters
                                    ? 'bg-brand-brown text-white shadow-lg'
                                    : 'bg-white text-gray-700 border border-gray-200 hover:border-brand-orange'
                            }`}
                        >
                            <SlidersHorizontal size={18} />
                            <span>الفلاتر</span>
                            {hasActiveFilters && (
                                <span className="w-5 h-5 bg-white text-brand-brown rounded-full text-xs flex items-center justify-center font-bold">
                                    !
                                </span>
                            )}
                        </button>

                        {/* Sort Dropdown */}
                        <div className="relative">
                            <button
                                onClick={() => setShowSortDropdown(!showSortDropdown)}
                                className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-white border border-gray-200 hover:border-brand-orange transition-all"
                            >
                                <ArrowUpDown size={18} className="text-gray-500" />
                                <span className="text-gray-700">
                                    {SORT_OPTIONS.find(s => s.id === sortBy)?.name}
                                </span>
                                <ChevronDown size={16} className={`text-gray-400 transition-transform ${showSortDropdown ? 'rotate-180' : ''}`} />
                            </button>
                            
                            {showSortDropdown && (
                                <>
                                    <div className="fixed inset-0 z-40" onClick={() => setShowSortDropdown(false)} />
                                    <div className="absolute top-full left-0 mt-2 bg-white rounded-xl shadow-xl border border-gray-100 py-2 min-w-[200px] z-50">
                                        {SORT_OPTIONS.map((option) => (
                                            <button
                                                key={option.id}
                                                onClick={() => {
                                                    setSortBy(option.id);
                                                    setShowSortDropdown(false);
                                                }}
                                                className={`w-full flex items-center gap-3 px-4 py-3 hover:bg-gray-50 transition ${
                                                    sortBy === option.id ? 'text-brand-orange bg-orange-50' : 'text-gray-700'
                                                }`}
                                            >
                                                <option.icon size={18} />
                                                <span>{option.name}</span>
                                                {sortBy === option.id && <Check size={16} className="mr-auto" />}
                                            </button>
                                        ))}
                                    </div>
                                </>
                            )}
                        </div>

                        {/* Products Count */}
                        <div className="hidden sm:flex items-center gap-2 text-gray-500">
                            <Sparkles size={16} className="text-amber-500" />
                            <span>{filteredAndSortedProducts.length} منتج</span>
                        </div>
                    </div>

                    {/* Right Side - View Toggle */}
                    <div className="flex items-center gap-2 bg-gray-100 p-1 rounded-xl">
                        <button
                            onClick={() => setViewMode('grid')}
                            className={`p-2 rounded-lg transition ${viewMode === 'grid' ? 'bg-white shadow-sm text-brand-orange' : 'text-gray-500'}`}
                        >
                            <Grid3X3 size={20} />
                        </button>
                        <button
                            onClick={() => setViewMode('list')}
                            className={`p-2 rounded-lg transition ${viewMode === 'list' ? 'bg-white shadow-sm text-brand-orange' : 'text-gray-500'}`}
                        >
                            <LayoutList size={20} />
                        </button>
                    </div>
                </div>

                {/* Active Filters */}
                {hasActiveFilters && (
                    <div className="flex flex-wrap items-center gap-2 mb-6">
                        {selectedCategory && (
                            <span className="inline-flex items-center gap-2 px-3 py-1.5 bg-orange-100 text-brand-orange rounded-full text-sm">
                                {CATEGORIES.find(c => c.id === selectedCategory)?.icon}
                                {CATEGORIES.find(c => c.id === selectedCategory)?.name}
                                <button onClick={() => setSelectedCategory('')} className="hover:bg-orange-200 rounded-full p-0.5">
                                    <X size={14} />
                                </button>
                            </span>
                        )}
                        {showOnlyOffers && (
                            <span className="inline-flex items-center gap-2 px-3 py-1.5 bg-orange-100 text-orange-700 rounded-full text-sm">
                                <Tag size={14} />
                                عروض فقط
                                <button onClick={() => setShowOnlyOffers(false)} className="hover:bg-orange-200 rounded-full p-0.5">
                                    <X size={14} />
                                </button>
                            </span>
                        )}
                        <button
                            onClick={clearFilters}
                            className="text-gray-500 hover:text-gray-700 text-sm underline"
                        >
                            مسح الكل
                        </button>
                    </div>
                )}

                {/* Filters Panel */}
                {showFilters && (
                    <div className="bg-white rounded-2xl shadow-lg p-6 mb-6">
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                            {/* Price Range */}
                            <div>
                                <h3 className="font-bold text-gray-800 mb-3 flex items-center gap-2">
                                    <Tag size={18} className="text-brand-orange" />
                                    نطاق السعر
                                </h3>
                                <div className="flex items-center gap-3">
                                    <input
                                        type="number"
                                        value={priceRange[0]}
                                        onChange={(e) => setPriceRange([Number(e.target.value), priceRange[1]])}
                                        className="w-24 px-3 py-2 border border-gray-200 rounded-lg text-center"
                                        placeholder="من"
                                    />
                                    <span className="text-gray-400">—</span>
                                    <input
                                        type="number"
                                        value={priceRange[1]}
                                        onChange={(e) => setPriceRange([priceRange[0], Number(e.target.value)])}
                                        className="w-24 px-3 py-2 border border-gray-200 rounded-lg text-center"
                                        placeholder="إلى"
                                    />
                                    <span className="text-gray-500">جنيه</span>
                                </div>
                            </div>

                            {/* Offers Toggle */}
                            <div>
                                <h3 className="font-bold text-gray-800 mb-3 flex items-center gap-2">
                                    <Sparkles size={18} className="text-orange-500" />
                                    العروض
                                </h3>
                                <button
                                    onClick={() => setShowOnlyOffers(!showOnlyOffers)}
                                    className={`flex items-center gap-3 px-4 py-3 rounded-xl border-2 transition-all w-full ${
                                        showOnlyOffers 
                                            ? 'border-orange-500 bg-orange-50 text-orange-700' 
                                            : 'border-gray-200 hover:border-orange-300'
                                    }`}
                                >
                                    <div className={`w-5 h-5 rounded-md border-2 flex items-center justify-center ${
                                        showOnlyOffers ? 'bg-orange-500 border-orange-500' : 'border-gray-300'
                                    }`}>
                                        {showOnlyOffers && <Check size={14} className="text-white" />}
                                    </div>
                                    <span>عرض المنتجات بخصم فقط</span>
                                </button>
                            </div>

                            {/* Quick Categories */}
                            <div>
                                <h3 className="font-bold text-gray-800 mb-3 flex items-center gap-2">
                                    <Grid3X3 size={18} className="text-brand-brown" />
                                    فئة سريعة
                                </h3>
                                <div className="flex flex-wrap gap-2">
                                    {CATEGORIES.slice(1, 6).map((cat) => (
                                        <button
                                            key={cat.id}
                                            onClick={() => setSelectedCategory(cat.id)}
                                            className={`px-3 py-1.5 rounded-lg text-sm transition ${
                                                selectedCategory === cat.id
                                                    ? 'bg-brand-brown text-white'
                                                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                                            }`}
                                        >
                                            {cat.icon} {cat.name}
                                        </button>
                                    ))}
                                </div>
                            </div>
                        </div>
                    </div>
                )}

                {/* Products Grid */}
                {loading ? (
                    <ProductGridSkeleton count={12} />
                ) : paginatedProducts.length === 0 ? (
                    <div className="text-center py-20">
                        <div className="text-6xl mb-4">🔍</div>
                        <h3 className="text-xl font-bold text-gray-800 mb-2">لا توجد منتجات</h3>
                        <p className="text-gray-500 mb-4">جرب تغيير الفلاتر أو البحث بكلمات أخرى</p>
                        <button
                            onClick={clearFilters}
                            className="px-6 py-2 bg-brand-orange text-white rounded-xl hover:bg-brand-brown transition"
                        >
                            مسح الفلاتر
                        </button>
                    </div>
                ) : (
                    <>
                        <div className={`grid gap-4 ${
                            viewMode === 'grid' 
                                ? 'grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5' 
                                : 'grid-cols-1 md:grid-cols-2'
                        }`}>
                            {paginatedProducts.map((product) => {
                                const reserved = product.reserved_quantity || 0;
                                const stock = product.stock_quantity;
                                const available = typeof stock === 'number' ? (stock - reserved) > 0 : true;
                                return (
                                    <ProductCard 
                                        key={product.id}
                                        product={product} 
                                        variant={viewMode === 'list' ? 'horizontal' : 'vertical'}
                                        available={available}
                                    />
                                );
                            })}
                        </div>

                        {/* Pagination */}
                        {totalPages > 1 && (
                            <div className="flex justify-center items-center gap-2 mt-10">
                                <button
                                    onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                                    disabled={currentPage === 1}
                                    className="px-4 py-2 rounded-xl bg-white border border-gray-200 hover:border-brand-orange disabled:opacity-50 disabled:cursor-not-allowed transition"
                                >
                                    السابق
                                </button>
                                
                                <div className="flex items-center gap-1">
                                    {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                                        let pageNum;
                                        if (totalPages <= 5) {
                                            pageNum = i + 1;
                                        } else if (currentPage <= 3) {
                                            pageNum = i + 1;
                                        } else if (currentPage >= totalPages - 2) {
                                            pageNum = totalPages - 4 + i;
                                        } else {
                                            pageNum = currentPage - 2 + i;
                                        }
                                        
                                        return (
                                            <button
                                                key={pageNum}
                                                onClick={() => setCurrentPage(pageNum)}
                                                className={`w-10 h-10 rounded-xl font-medium transition ${
                                                    currentPage === pageNum
                                                        ? 'bg-brand-orange text-white shadow-lg'
                                                        : 'bg-white border border-gray-200 hover:border-brand-orange'
                                                }`}
                                            >
                                                {pageNum}
                                            </button>
                                        );
                                    })}
                                </div>

                                <button
                                    onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                                    disabled={currentPage === totalPages}
                                    className="px-4 py-2 rounded-xl bg-white border border-gray-200 hover:border-brand-orange disabled:opacity-50 disabled:cursor-not-allowed transition"
                                >
                                    التالي
                                </button>
                            </div>
                        )}
                    </>
                )}
            </div>

            {/* Barcode Scanner Modal */}
            {showScanner && (
                <BarcodeScanner
                    onScan={handleBarcodeScanned}
                    onClose={() => setShowScanner(false)}
                />
            )}
        </div>
    );
}
