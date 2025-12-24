import React, { useState, useEffect, useMemo, useCallback } from 'react';
import ProductCard from '../components/ProductCard';
import BarcodeScanner from '../components/BarcodeScanner';
import ProductModal from '../components/ProductModal';
import { ProductGridSkeleton } from '../components/Skeleton';
import ProductsTopBar from '../components/ProductsTopBar';
import { 
    Filter, Scan, Search, X, Grid3X3, LayoutList, 
    SlidersHorizontal, ChevronDown, ChevronUp, Sparkles,
    TrendingUp, Clock, Tag, Check, ArrowUpDown
} from 'lucide-react';
import { api } from '../services/api';
import { Product } from '../types';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useBranch } from '../context/BranchContext';

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
    const [categories, setCategories] = useState<{id: string, name: string, icon: string, color: string}[]>([]);
    const [brands, setBrands] = useState<{id: string, name: string}[]>([]);
    const [loading, setLoading] = useState(true);
    const [showScanner, setShowScanner] = useState(false);
    const [searchQuery, setSearchQuery] = useState('');
    const [selectedCategory, setSelectedCategory] = useState<string>('');
    const [selectedBrand, setSelectedBrand] = useState<string>('');
    const [sortBy, setSortBy] = useState<string>('newest');
    const [currentPage, setCurrentPage] = useState(1);
    const [showFilters, setShowFilters] = useState(false);
    const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
    const [priceRange, setPriceRange] = useState<[number, number]>([0, 1000]);
    const [showOnlyOffers, setShowOnlyOffers] = useState(false);
    const [showSortDropdown, setShowSortDropdown] = useState(false);
    const [isSearchFocused, setIsSearchFocused] = useState(false);
    const [categoryBanner, setCategoryBanner] = useState<any>(null);
    
    const navigate = useNavigate();
    const [searchParams] = useSearchParams();
    const { selectedBranch } = useBranch();

    // Load categories from actual products (not API)
    useEffect(() => {
        const loadCategories = () => {
            // Always extract categories from actual products in database
            if (allProducts.length === 0) {
                setCategories([
                    { id: '', name: 'الكل', icon: '🛒', color: 'from-brand-brown to-brand-brown/80' }
                ]);
                return;
            }

            // Get unique categories with product count
            const categoryCount: {[key: string]: number} = {};
            allProducts.forEach(p => {
                if (p.category) {
                    categoryCount[p.category] = (categoryCount[p.category] || 0) + 1;
                }
            });

            const uniqueCategories = Object.keys(categoryCount).sort((a, b) => categoryCount[b] - categoryCount[a]);
            console.log('📦 Real categories from database:', uniqueCategories);
            
            const icons: {[key: string]: string} = {
                'ألبان': '🥛', 'Dairy': '🥛',
                'جبن': '🧀', 'Cheese': '🧀',
                'لحوم': '🥩', 'Meat': '🥩',
                'خضروات': '🥬', 'Vegetables': '🥬',
                'فواكه': '🍎', 'Fruits': '🍎',
                'مخبوزات': '🍞', 'Bakery': '🍞',
                'مشروبات': '🥤', 'Beverages': '🥤', 'drinks': '🥤',
                'سناكس': '🍿', 'Snacks': '🍿',
                'شيكولاتة': '🍫', 'Chocolate': '🍫',
                'حلويات': '🍰', 'Desserts': '🍰',
                'كاندي': '🍬', 'Candy': '🍬',
                'مجمدات': '🧊', 'Frozen': '🧊',
                'تنظيف': '🧹', 'Cleaning': '🧹',
                'تجميل': '💄', 'Cosmetics': '💄', 'Beauty': '💄',
                'عناية شخصية': '🧴', 'Personal Care': '🧴',
                'Grains': '🌾', 'حبوب': '🌾',
                'منتجات صحيه': '💪', 'healthy': '💪', 'صحي': '💪',
            };
            
            const categoriesFromProducts = uniqueCategories.map((catName) => ({
                id: catName,
                name: catName,
                icon: icons[catName] || '📦',
                color: 'from-brand-orange to-amber-500'
            }));
            
            setCategories([
                { id: '', name: 'الكل', icon: '🛒', color: 'from-brand-brown to-brand-brown/80' },
                ...categoriesFromProducts
            ]);
        };
        
        loadCategories();
    }, [allProducts]);

    // Load brands
    useEffect(() => {
        const loadBrands = async () => {
            try {
                const response = await api.brands.getAll();
                const apiBrands = response.data || [];
                setBrands([
                    { id: '', name: 'كل البراندات' },
                    ...apiBrands.map((b: any) => ({
                        id: b.id,
                        name: b.name_ar || b.name_en
                    }))
                ]);
            } catch (error) {
                console.error('Error loading brands:', error);
                setBrands([{ id: '', name: 'كل البراندات' }]);
            }
        };
        
        loadBrands();
    }, []);

    // Load category banner when category is selected
    useEffect(() => {
        const fetchCategoryBanner = async () => {
            if (!selectedCategory || selectedCategory === '') {
                setCategoryBanner(null);
                return;
            }
            
            try {
                console.log('🎨 Fetching banner for category:', selectedCategory);
                const response = await api.categories.getByName(selectedCategory);
                console.log('🎨 Category data:', response);
                
                if (response.success && response.data) {
                    const cat = response.data;
                    // Only show banner if it has banner_image
                    if (cat.banner_image || cat.banner_title) {
                        setCategoryBanner(cat);
                    } else {
                        setCategoryBanner(null);
                    }
                } else {
                    setCategoryBanner(null);
                }
            } catch (error) {
                console.error('Error fetching category banner:', error);
                setCategoryBanner(null);
            }
        };
        
        fetchCategoryBanner();
    }, [selectedCategory]);

    // Category name mapping between English and Arabic
    const categoryMapping: Record<string, string> = {
        // Chocolate variants
        'Chocolate': 'شيكولاتة',
        'Chocolates': 'شيكولاتة', 
        'شوكولاتة': 'شيكولاتة',
        // Dairy variants
        'Dairy': 'ألبان',
        'Milk': 'ألبان',
        'ألبان': 'ألبان',
        // Cheese
        'Cheese': 'جبن',
        'جبن': 'جبن',
        // Snacks
        'Snacks': 'سناكس',
        'سناكس': 'سناكس',
        // Candy
        'Candy': 'كاندي',
        'كاندي': 'كاندي',
        // Sweets/Desserts
        'حلويات': 'حلويات',
        'Desserts': 'حلويات',
        'Sweets': 'حلويات',
        // Beverages/Drinks
        'Beverages': 'مشروبات',
        'Drinks': 'مشروبات',
        'drinks': 'مشروبات',
        'مشروبات': 'مشروبات',
        // Bakery
        'Bakery': 'Bakery',
        // Vegetables
        'Vegetables': 'Vegetables',
        'Vegetable': 'Vegetables',
        // Grains
        'Grains': 'Grains',
        // Frozen
        'Frozen': 'مجمدات',
        'مجمدات': 'مجمدات',
        // Beauty/Cosmetics
        'Cosmetics': 'تجميل',
        'Beauty': 'تجميل',
        'تجميل': 'تجميل',
        // Canned food
        'Cannedfood': 'Cannedfood',
        // Legumes
        'Legumes': 'Legumes',
        // Healthy products
        'healthy': 'منتجات صحيه',
        'صحي': 'منتجات صحيه',
        'منتجات صحيه': 'منتجات صحيه',
        // Dates
        'Dates': 'Dates',
        // Oils
        'Oils': 'Oils',
        // Others
        'الورقيات': 'الورقيات',
        'المساحيق': 'المساحيق',
        'بيكري': 'بيكري',
        'لحوم': 'لحوم',
        'Meat': 'لحوم',
        'meat': 'لحوم',
        'فواكه وخضار': 'فواكه وخضار'
    };

    useEffect(() => {
        const category = searchParams.get('category');
        const barcode = searchParams.get('barcode');
        
        if (category) {
            // Map the category name to match database values
            const mappedCategory = categoryMapping[category] || category;
            console.log('🔍 Category mapping:', category, '→', mappedCategory);
            setSelectedCategory(mappedCategory);
        }
        
        // Handle barcode from URL (from TopBar navigation)
        if (barcode) {
            handleBarcodeScanned(barcode);
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

    const [scannedProduct, setScannedProduct] = useState<Product | null>(null);
    const [showProductModal, setShowProductModal] = useState(false);

    const handleBarcodeScanned = async (barcode: string) => {
        // Close scanner immediately
        setShowScanner(false);
        
        // Show loading overlay
        const loadingDiv = document.createElement('div');
        loadingDiv.id = 'barcode-loading-overlay';
        loadingDiv.className = 'fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm';
        loadingDiv.innerHTML = `
            <div class="bg-white rounded-2xl p-6 shadow-2xl flex flex-col items-center gap-4">
                <div class="animate-spin rounded-full h-12 w-12 border-4 border-brand-orange border-t-transparent"></div>
                <p class="text-gray-700 font-medium">جارٍ البحث عن المنتج...</p>
                <p class="text-gray-500 text-sm font-mono">${barcode}</p>
            </div>
        `;
        document.body.appendChild(loadingDiv);
        
        try {
            const branchId = selectedBranch?.id || 1;
            const response = await api.products.getByBarcode(barcode, branchId);
            
            // Remove loading overlay safely
            const overlay = document.getElementById('barcode-loading-overlay');
            if (overlay) {
                document.body.removeChild(overlay);
            }
            
            if (response.data && response.message === 'success') {
                setScannedProduct(response.data);
                setShowProductModal(true);
            } else {
                alert('❌ المنتج غير موجود في قاعدة البيانات\nالباركود: ' + barcode);
            }
        } catch (error) {
            // Remove loading overlay safely on error
            const overlay = document.getElementById('barcode-loading-overlay');
            if (overlay && overlay.parentNode) {
                document.body.removeChild(overlay);
            }
            console.error('Error fetching product:', error);
            alert('❌ حدث خطأ في البحث عن المنتج');
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

        // Filter by category
        if (selectedCategory) {
            filtered = filtered.filter(p => p.category === selectedCategory);
        }

        // Filter by brand
        if (selectedBrand) {
            filtered = filtered.filter(p => {
                const productBrand = (p.brand || '').toLowerCase();
                const productName = (p.name || '').toLowerCase();
                const brandName = selectedBrand.toLowerCase();
                return productBrand.includes(brandName) || productName.includes(brandName);
            });
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
    }, [allProducts, selectedCategory, selectedBrand, sortBy, priceRange, showOnlyOffers]);

    // Pagination
    const totalPages = Math.ceil(filteredAndSortedProducts.length / ITEMS_PER_PAGE);
    const paginatedProducts = filteredAndSortedProducts.slice(
        (currentPage - 1) * ITEMS_PER_PAGE,
        currentPage * ITEMS_PER_PAGE
    );

    const clearFilters = () => {
        setSelectedCategory('');
        setSelectedBrand('');
        setPriceRange([0, 1000]);
        setShowOnlyOffers(false);
        setSortBy('newest');
        setSearchQuery('');
    };

    const hasActiveFilters = selectedCategory || selectedBrand || showOnlyOffers || priceRange[0] > 0 || priceRange[1] < 1000;

    return (
        <div className="min-h-screen bg-gradient-to-b from-orange-50/30 to-white">
            {/* Categories Slider */}
            <div className="bg-white shadow-sm sticky top-0 z-40">
                <div className="max-w-7xl mx-auto">
                    <div className="flex gap-2 py-4 px-4 overflow-x-auto scrollbar-hide">
                        {categories.map((cat) => (
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

            {/* Category Banner */}
            {categoryBanner && categoryBanner.banner_image && (
                <div className="max-w-7xl mx-auto px-4 pt-4">
                    <div className="relative rounded-2xl overflow-hidden shadow-lg mb-4 group">
                        <img 
                            src={categoryBanner.banner_image} 
                            alt={categoryBanner.banner_title || categoryBanner.name_ar || categoryBanner.name}
                            className="w-full h-48 md:h-64 object-cover"
                        />
                        {categoryBanner.banner_title && (
                            <div className="absolute inset-0 bg-gradient-to-r from-black/60 via-black/40 to-transparent flex items-center">
                                <div className="px-8 max-w-2xl">
                                    <h2 className="text-white text-3xl md:text-4xl font-bold mb-2">
                                        {categoryBanner.banner_title}
                                    </h2>
                                    {categoryBanner.banner_subtitle && (
                                        <p className="text-white/90 text-lg md:text-xl">
                                            {categoryBanner.banner_subtitle}
                                        </p>
                                    )}
                                    {categoryBanner.banner_button_text && categoryBanner.banner_action_url && (
                                        <button
                                            onClick={() => {
                                                if (categoryBanner.banner_action_url) {
                                                    if (categoryBanner.banner_action_url.startsWith('http')) {
                                                        window.open(categoryBanner.banner_action_url, '_blank');
                                                    } else {
                                                        navigate(categoryBanner.banner_action_url);
                                                    }
                                                }
                                            }}
                                            className="mt-4 px-6 py-3 bg-white text-brand-orange font-bold rounded-full hover:bg-orange-50 transition-colors shadow-lg"
                                        >
                                            {categoryBanner.banner_button_text}
                                        </button>
                                    )}
                                </div>
                            </div>
                        )}
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
                                {categories.find(c => c.id === selectedCategory)?.icon}
                                {categories.find(c => c.id === selectedCategory)?.name}
                                <button onClick={() => setSelectedCategory('')} className="hover:bg-orange-200 rounded-full p-0.5">
                                    <X size={14} />
                                </button>
                            </span>
                        )}
                        {selectedBrand && (
                            <span className="inline-flex items-center gap-2 px-3 py-1.5 bg-blue-100 text-blue-700 rounded-full text-sm">
                                <Tag size={14} />
                                {brands.find(b => b.id === selectedBrand)?.name}
                                <button onClick={() => setSelectedBrand('')} className="hover:bg-blue-200 rounded-full p-0.5">
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

                            {/* Brands Filter */}
                            {brands.length > 1 && (
                                <div>
                                    <h3 className="font-bold text-gray-800 mb-3 flex items-center gap-2">
                                        <Tag size={18} className="text-orange-500" />
                                        البراند
                                    </h3>
                                    <div className="space-y-2 max-h-60 overflow-y-auto">
                                        {brands.map((brand) => (
                                            <button
                                                key={brand.id}
                                                onClick={() => setSelectedBrand(brand.id)}
                                                className={`flex items-center gap-3 px-4 py-2.5 rounded-xl border-2 transition-all w-full text-right ${
                                                    selectedBrand === brand.id
                                                        ? 'border-orange-500 bg-orange-50 text-orange-700'
                                                        : 'border-gray-200 hover:border-orange-300'
                                                }`}
                                            >
                                                <div className={`w-4 h-4 rounded-full border-2 flex items-center justify-center ${
                                                    selectedBrand === brand.id ? 'bg-orange-500 border-orange-500' : 'border-gray-300'
                                                }`}>
                                                    {selectedBrand === brand.id && <div className="w-2 h-2 bg-white rounded-full" />}
                                                </div>
                                                <span className="flex-1">{brand.name}</span>
                                            </button>
                                        ))}
                                    </div>
                                </div>
                            )}
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

            {/* Scanned Product Modal */}
            {showProductModal && scannedProduct && (
                <ProductModal
                    product={scannedProduct}
                    onClose={() => {
                        setShowProductModal(false);
                        setScannedProduct(null);
                    }}
                />
            )}

            {/* Old Modal Code - Kept for reference, can be deleted */}
            {false && showProductModal && scannedProduct && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
                    <div className="bg-white rounded-2xl shadow-2xl max-w-lg w-full max-h-[90vh] overflow-y-auto">
                        {/* Header */}
                        <div className="sticky top-0 bg-gradient-to-r from-green-500 to-emerald-600 p-6 text-white rounded-t-2xl">
                            <div className="flex items-center justify-between">
                                <div className="flex items-center gap-3">
                                    <div className="w-12 h-12 bg-white/20 rounded-full flex items-center justify-center">
                                        <Check className="w-6 h-6" />
                                    </div>
                                    <div>
                                        <h2 className="text-xl font-bold">✅ تم العثور على المنتج!</h2>
                                        <p className="text-white/90 text-sm">مسح باركود ناجح</p>
                                    </div>
                                </div>
                                <button
                                    onClick={() => {
                                        setShowProductModal(false);
                                        setScannedProduct(null);
                                    }}
                                    className="p-2 hover:bg-white/20 rounded-lg transition-colors"
                                >
                                    <X size={24} />
                                </button>
                            </div>
                        </div>

                        {/* Product Details */}
                        <div className="p-6">
                            {/* Product Image */}
                            <div className="relative mb-6">
                                <img
                                    src={scannedProduct.image_url || 'https://via.placeholder.com/400x300?text=No+Image'}
                                    alt={scannedProduct.name_ar}
                                    className="w-full h-64 object-contain rounded-xl bg-gray-50"
                                />
                                {scannedProduct.discount_percentage > 0 && (
                                    <div className="absolute top-4 right-4 bg-red-500 text-white px-3 py-1 rounded-full text-sm font-bold">
                                        خصم {scannedProduct.discount_percentage}%
                                    </div>
                                )}
                            </div>

                            {/* Product Info */}
                            <div className="space-y-4">
                                <div>
                                    <h3 className="text-2xl font-bold text-gray-900 mb-2">{scannedProduct.name_ar}</h3>
                                    <p className="text-gray-600">{scannedProduct.name_en}</p>
                                </div>

                                {scannedProduct.description_ar && (
                                    <p className="text-gray-600 text-sm">{scannedProduct.description_ar}</p>
                                )}

                                {/* Price */}
                                <div className="flex items-center gap-3">
                                    <span className="text-3xl font-bold text-brand-orange">
                                        {scannedProduct.discount_percentage > 0
                                            ? (scannedProduct.price * (1 - scannedProduct.discount_percentage / 100)).toFixed(2)
                                            : scannedProduct.price.toFixed(2)} ج.م
                                    </span>
                                    {scannedProduct.discount_percentage > 0 && (
                                        <span className="text-xl text-gray-400 line-through">
                                            {scannedProduct.price.toFixed(2)} ج.م
                                        </span>
                                    )}
                                </div>

                                {/* Stock */}
                                <div className="flex items-center gap-2">
                                    <span className={`px-3 py-1 rounded-full text-sm font-medium ${
                                        scannedProduct.stock > 10
                                            ? 'bg-green-100 text-green-700'
                                            : scannedProduct.stock > 0
                                            ? 'bg-yellow-100 text-yellow-700'
                                            : 'bg-red-100 text-red-700'
                                    }`}>
                                        {scannedProduct.stock > 10
                                            ? '✓ متوفر'
                                            : scannedProduct.stock > 0
                                            ? `متبقي ${scannedProduct.stock}`
                                            : 'غير متوفر'}
                                    </span>
                                </div>

                                {/* Actions */}
                                <div className="flex gap-3 pt-4">
                                    <button
                                        onClick={() => {
                                            navigate(`/product/${scannedProduct.id}`);
                                            setShowProductModal(false);
                                        }}
                                        className="flex-1 bg-gradient-to-r from-brand-orange to-orange-600 text-white py-3 rounded-xl font-bold hover:shadow-lg transition-all"
                                    >
                                        عرض التفاصيل
                                    </button>
                                    <button
                                        onClick={() => {
                                            setShowProductModal(false);
                                            setScannedProduct(null);
                                        }}
                                        className="px-6 py-3 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-xl font-medium transition-colors"
                                    >
                                        إغلاق
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
