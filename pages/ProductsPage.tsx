import React, { useState, useEffect, useMemo, useCallback } from 'react';
import BarcodeScanner from '../components/BarcodeScanner';
import ProductModal from '../components/ProductModal';
import CategoryBanner from '../components/CategoryBanner';
import { ProductGridSkeleton } from '../components/Skeleton';
import {
    Barcode, Search, X,
    SlidersHorizontal, Sparkles,
    TrendingUp, Clock, Tag, ArrowUpDown,
    Grid3X3, Check
} from 'lucide-react';
import { api } from '../services/api';
import { Product } from '../types';
import { Link, useNavigate, useSearchParams, useLocation } from 'react-router-dom';
import { useBranch } from '../context/BranchContext';
import Seo, { getSiteUrl } from '../components/Seo';
import { useCart } from '../context/CartContext';
import { useProducts } from '../src/hooks/useProducts';
import { staticData } from '../utils/staticDataClient';

const SORT_OPTIONS = [
    { id: 'newest', name: 'الأحدث', icon: Clock },
    { id: 'popular', name: 'الأكثر مبيعاً', icon: TrendingUp },
    { id: 'price-asc', name: 'السعر: الأقل', icon: ArrowUpDown },
    { id: 'price-desc', name: 'السعر: الأعلى', icon: ArrowUpDown },
    { id: 'discount', name: 'أعلى خصم', icon: Tag },
];

const ITEMS_PER_PAGE = 20;

// Category normalization function - same as backend
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

const categoryMapping: Record<string, string> = {
    // Chocolate variants
    Chocolate: 'شيكولاتة',
    Chocolates: 'شيكولاتة',
    شوكولاتة: 'شيكولاتة',
    شيكولاتة: 'شيكولاتة',
    // Dairy variants
    Dairy: 'ألبان',
    Milk: 'ألبان',
    ألبان: 'ألبان',
    البان: 'ألبان',
    // Cheese
    Cheese: 'جبن',
    جبن: 'جبن',
    جبنة: 'جبن',
    // Snacks
    Snacks: 'سناكس',
    سناكس: 'سناكس',
    // Candy
    Candy: 'كاندي',
    كاندي: 'كاندي',
    // Sweets/Desserts
    حلويات: 'حلويات',
    Desserts: 'حلويات',
    Sweets: 'حلويات',
    // Beverages/Drinks
    Beverages: 'مشروبات',
    Drinks: 'مشروبات',
    drinks: 'مشروبات',
    مشروبات: 'مشروبات',
    // Bakery
    Bakery: 'مخبوزات',
    بيكري: 'مخبوزات',
    مخبوزات: 'مخبوزات',
    // Vegetables
    Vegetables: 'خضروات',
    Vegetable: 'خضروات',
    خضروات: 'خضروات',
    خضار: 'خضروات',
    // Fruits
    Fruits: 'فواكه',
    Fruit: 'فواكه',
    فواكه: 'فواكه',
    فاكهة: 'فواكه',
    // Biscuit
    Biscuit: 'بسكويت',
    Biscuits: 'بسكويت',
    biscuit: 'بسكويت',
    biscuits: 'بسكويت',
    بسكويت: 'بسكويت',
    // Grains
    Grains: 'حبوب',
    حبوب: 'حبوب',
    // Frozen
    Frozen: 'مجمدات',
    مجمدات: 'مجمدات',
    // Beauty/Cosmetics
    Cosmetics: 'تجميل',
    Beauty: 'تجميل',
    تجميل: 'تجميل',
    // Canned food
    Cannedfood: 'معلبات',
    // Legumes
    Legumes: 'بقوليات',
    بقوليات: 'بقوليات',
    // Grocery/Pantry
    Grocery: 'بقالة',
    بقالة: 'بقالة',
    // Healthy products
    healthy: 'منتجات صحيه',
    صحي: 'منتجات صحيه',
    'منتجات صحيه': 'منتجات صحيه',
    // Dates
    Dates: 'تمور',
    تمور: 'تمور',
    // Oils
    Oils: 'زيوت',
    Oil: 'زيوت',
    زيوت: 'زيوت',
    زيت: 'زيوت',
    // Cleaning
    Cleaning: 'منظفات',
    منظفات: 'منظفات',
    // Personal Care
    'Personal Care': 'عناية شخصية',
    'عناية شخصية': 'عناية شخصية',
    // Others
    الورقيات: 'الورقيات',
    المساحيق: 'المساحيق',
    لحوم: 'لحوم',
    Meat: 'لحوم',
    meat: 'لحوم',
    'فواكه وخضار': 'فواكه وخضار',
    // Canned/Preserved
    معلبات: 'معلبات',
    معلب: 'معلبات',
    Canned: 'معلبات',
    canned: 'معلبات',
    // Preserved
    محفوظات: 'محفوظات',
    preserved: 'محفوظات'
};

const hasArabicChars = (value: string = '') => /[\u0600-\u06FF]/.test(value);

const mapCategoryLabel = (value: string = '') => {
    const trimmed = value.toString().trim();
    if (!trimmed) return '';
    const lower = trimmed.toLowerCase();
    const capitalized = lower ? `${lower.charAt(0).toUpperCase()}${lower.slice(1)}` : lower;
    return categoryMapping[trimmed] || categoryMapping[lower] || categoryMapping[capitalized] || trimmed;
};

export default function ProductsPage() {
    const [searchResults, setSearchResults] = useState<Product[] | null>(null);
    const [categories, setCategories] = useState<{ id: string, name: string, icon: string, color: string }[]>([]);
    const [brands, setBrands] = useState<{ id: string, name: string }[]>([]);
    const [loading, setLoading] = useState(false);
    const [showScanner, setShowScanner] = useState(false);
    const [searchQuery, setSearchQuery] = useState('');
    const [selectedCategory, setSelectedCategory] = useState<string>('');
    const [selectedBrand, setSelectedBrand] = useState<string>('');
    const [sortBy, setSortBy] = useState<string>('newest');
    const [currentPage, setCurrentPage] = useState(1);
    const [showFilters, setShowFilters] = useState(false);
    const [priceRange, setPriceRange] = useState<[number, number]>([0, 1000]);
    const [showOnlyOffers, setShowOnlyOffers] = useState(false);
    const [categoryBanner, setCategoryBanner] = useState<any>(null);
    const [renderError, setRenderError] = useState<Error | null>(null);

    // Error boundary
    if (renderError) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gray-50">
                <div className="bg-white p-8 rounded-2xl shadow-lg max-w-md">
                    <h2 className="text-2xl font-bold text-red-600 mb-4">حدث خطأ</h2>
                    <p className="text-gray-700 mb-4">{renderError.message}</p>
                    <button
                        onClick={() => {
                            setRenderError(null);
                            window.location.reload();
                        }}
                        className="w-full px-4 py-2 bg-brand-orange text-white rounded-lg hover:bg-brand-orange/90"
                    >
                        إعادة تحميل الصفحة
                    </button>
                </div>
            </div>
        );
    }

    const navigate = useNavigate();
    const [searchParams] = useSearchParams();
    const location = useLocation();
    const { selectedBranch } = useBranch();
    const { addToCart } = useCart();
    const branchId = selectedBranch?.id || 1;
    const isSearchActive = searchResults !== null;
    
    // Safe products query with error handling
    const productsQuery = useProducts({
        branchId,
        category: selectedCategory || '',
        page: currentPage,
        limit: ITEMS_PER_PAGE,
        enabled: !isSearchActive && !!branchId
    });
    
    const baseProducts = Array.isArray(productsQuery.data?.data) ? productsQuery.data.data : [];
    const allProducts = Array.isArray(searchResults) ? searchResults : baseProducts;
    const hasError = productsQuery.error;
    
    // Log any errors
    useEffect(() => {
        if (hasError) {
            console.error('❌ Products query error:', hasError);
        }
    }, [hasError]);
    const totalCount = isSearchActive
        ? allProducts.length
        : (productsQuery.data?.total ?? baseProducts.length);
    const totalPages = isSearchActive
        ? 1
        : Math.max(1, Math.ceil(totalCount / ITEMS_PER_PAGE));
    const listLoading = loading || productsQuery.isLoading || productsQuery.isFetching;

    // Load categories from API with branch-specific product counts
    useEffect(() => {
        const loadCategories = async () => {
            try {
                console.log('📦 Loading categories for branch:', branchId);
                
                // Always fetch from API with branchId for accurate product counts
                const response = await api.categories.getAll(branchId);
                const apiCategories = response?.data || response || [];

                if (Array.isArray(apiCategories) && apiCategories.length > 0) {
                    console.log('✅ Loaded categories from API:', apiCategories.length);
                    
                    // Transform database categories to match ProductsPage format
                    const categoriesFromDB = apiCategories
                        .filter((cat: any) => cat.is_active !== false && !cat.parent_id) // Only active parent categories
                        .sort((a: any, b: any) => (a.display_order || 0) - (b.display_order || 0))
                        .map((cat: any) => {
                            const rawName = cat.name_ar || cat.name || '';
                            const displayName = mapCategoryLabel(rawName);
                            return {
                                id: rawName,
                                name: displayName,
                                icon: cat.icon || '📦',
                                color: cat.bg_color || 'from-brand-orange to-amber-500',
                                product_count: cat.products_count || 0
                            };
                        })
                        .filter((cat: any) => cat.id && cat.product_count > 0);

                    const uniqueCategories = Array.from(
                        categoriesFromDB.reduce((acc, current) => {
                            const key = normalizeCategoryValue(current.name || current.id);
                            if (!key) return acc;
                            const existing = acc.get(key);
                            if (!existing) {
                                acc.set(key, current);
                                return acc;
                            }
                            const existingCount = existing.product_count || 0;
                            const currentCount = current.product_count || 0;
                            const existingIsArabic = hasArabicChars(existing.id || existing.name);
                            const currentIsArabic = hasArabicChars(current.id || current.name);
                            if (currentCount > existingCount) {
                                acc.set(key, current);
                                return acc;
                            }
                            if (currentCount === existingCount && currentIsArabic && !existingIsArabic) {
                                acc.set(key, current);
                                return acc;
                            }
                            if (!existing.icon && current.icon) {
                                acc.set(key, { ...existing, icon: current.icon });
                            }
                            return acc;
                        }, new Map())
                            .values()
                    );

                    console.log('✅ Processed', categoriesFromDB.length, 'categories from API');

                    setCategories([
                        { id: '', name: 'الكل', icon: '🛒', color: 'from-brand-brown to-brand-brown/80' },
                        ...uniqueCategories
                    ]);
                } else {
                    console.warn('⚠️ No categories from API');
                    setCategories([
                        { id: '', name: 'الكل', icon: '🛒', color: 'from-brand-brown to-brand-brown/80' }
                    ]);
                }
            } catch (error) {
                console.error('❌ Error loading categories:', error);
                setCategories([
                    { id: '', name: 'الكل', icon: '🛒', color: 'from-brand-brown to-brand-brown/80' }
                ]);
            }
        };

        loadCategories();
    }, [branchId]); // Reload when branch changes

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
            // 🔥 Don't show banner if no category selected OR category is "All"/"الكل"
            if (!selectedCategory || selectedCategory === '' || 
                selectedCategory === 'All' || selectedCategory === 'الكل' ||
                selectedCategory.toLowerCase() === 'all' || selectedCategory.toLowerCase() === 'الكل') {
                setCategoryBanner(null);
                return;
            }

            try {
                console.log('🎨 Fetching banner for category:', selectedCategory);
                const response = await api.categories.getByName(mapCategoryLabel(selectedCategory) || selectedCategory);
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

    // Normalize selected category on mount/change (run once after categories load)
    useEffect(() => {
        if (!selectedCategory || categories.length === 0) return;
        
        const normalizedSelected = normalizeCategoryValue(mapCategoryLabel(selectedCategory) || selectedCategory);
        const matched = categories.find((cat) => {
            return (
                normalizeCategoryValue(mapCategoryLabel(cat.id || '')) === normalizedSelected ||
                normalizeCategoryValue(mapCategoryLabel(cat.name || '')) === normalizedSelected
            );
        });
        
        // Only update if we found a match AND it's different
        if (matched && matched.id !== selectedCategory) {
            console.log('🔄 Normalizing category:', selectedCategory, '→', matched.id);
            setSelectedCategory(matched.id);
        }
    }, [categories.length]); // Only run when categories are loaded, not on every selectedCategory change


    const [scannedProduct, setScannedProduct] = useState<Product | null>(null);
    const [showProductModal, setShowProductModal] = useState(false);

    const handleBarcodeScanned = useCallback(async (barcode: string) => {
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
    }, [selectedBranch]);

    const handleSearch = useCallback(async (query: string) => {
        setSearchQuery(query);
        setCurrentPage(1);

        const trimmed = query.trim();
        const looksLikeBarcode = /^\d{6,}$/.test(trimmed);

        if (looksLikeBarcode) {
            setSearchResults(null);
            await handleBarcodeScanned(trimmed);
            return;
        }

        if (trimmed) {
            setLoading(true);
            setSearchResults([]);
            try {
                const data = await api.products.search(trimmed);
                if (data.data) {
                    setSearchResults(data.data);
                }
            } catch (err) {
                console.error('Search error:', err);
            } finally {
                setLoading(false);
            }
        } else {
            setSearchResults(null);
        }
    }, [handleBarcodeScanned]);

    useEffect(() => {
        const category = searchParams.get('category');
        const barcode = searchParams.get('barcode');
        const search = searchParams.get('search');

        if (category) {
            const mappedCategory = mapCategoryLabel(category) || category;
            console.log('🔍 Category from URL:', category, '→ Mapped to:', mappedCategory);
            setSelectedCategory(mappedCategory);
        } else {
            console.log('🔍 No category in URL, setting to empty');
            setSelectedCategory('');
        }

        // Handle barcode from URL (from TopBar navigation)
        if (barcode) {
            handleBarcodeScanned(barcode);
            return; // barcode search takes precedence
        }

        // Handle search query from URL (header search)
        if (search && search.trim() !== '') {
            setSearchQuery(search);
            handleSearch(search);
            return;
        }

        // Fetch products will be called automatically when selectedCategory changes
    }, [searchParams, handleSearch, handleBarcodeScanned]);

    // Reset to page 1 when filters change
    useEffect(() => {
        setCurrentPage(1);
    }, [selectedCategory, selectedBrand, sortBy]);

    useEffect(() => {
        setSearchResults(null);
        setCurrentPage(1);
    }, [selectedBranch?.id]);

    // Filter and sort products
    const filteredAndSortedProducts = useMemo(() => {
        let filtered = [...allProducts];

        console.log('🔧 Client-side filter - Total products:', filtered.length);
        console.log('🔧 Selected category:', selectedCategory || 'All');

        // Note: Category filtering is now done server-side via API
        // This client-side filter is only for additional filters (brand, price, etc.)

        // Filter by brand
        if (selectedBrand) {
            console.log('🔍 Filtering by brand:', selectedBrand);
            filtered = filtered.filter(p => {
                // Filter by brand_id (UUID) or brand name
                const productBrandId = p.brand_id || p.brandId;
                const productBrand = (p.brand || '').toLowerCase();
                const productName = (p.name || '').toLowerCase();
                const brandName = selectedBrand.toLowerCase();
                
                // Match by brand_id first (UUID), then fallback to brand name
                return String(productBrandId) === String(selectedBrand) || 
                       productBrand.includes(brandName) || 
                       productName.includes(brandName);
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

    // Pagination - Server-side (backend handles the pagination)
    // We show all products fetched from backend (already paginated)
    const paginatedProducts = filteredAndSortedProducts;
    
    // Total pages comes from API now (no estimation needed)
    // If API doesn't return pagination, fallback to 1 page
    
    const siteUrl = getSiteUrl();
    const canonicalUrl = `${siteUrl}${location.pathname}${location.search}`;
    const filtersLabel = [
        selectedCategory && `قسم ${selectedCategory}`,
        selectedBrand && `براند ${selectedBrand}`,
        showOnlyOffers && 'عروض وخصومات'
    ].filter(Boolean).join(' • ');
    const pageTitle = selectedCategory
        ? `منتجات ${selectedCategory}`
        : searchQuery
            ? `نتائج البحث عن "${searchQuery}"`
            : 'كل المنتجات';
    const pageDescription = filtersLabel
        ? `${filtersLabel} - تصفح ${totalCount} منتج متاح للتوصيل السريع من علوش ماركت.`
        : 'تسوق كل منتجات علوش ماركت مع عروض يومية، فلترة ذكية، وتوصيل سريع.';
    const keywordList = [
        'علوش ماركت',
        'بقالة أونلاين',
        'عروض سوبر ماركت',
        selectedCategory,
        selectedBrand,
        searchQuery
    ].filter(Boolean) as string[];
    const itemListSchema = {
        '@context': 'https://schema.org',
        '@type': 'ItemList',
        numberOfItems: totalCount,
        itemListElement: paginatedProducts.slice(0, 10).map((product, index) => ({
            '@type': 'ListItem',
            position: index + 1,
            url: `${siteUrl}/product/${product.id}`,
            name: product.name
        }))
    };

    const clearFilters = () => {
        setSelectedCategory('');
        setSelectedBrand('');
        setPriceRange([0, 1000]);
        setShowOnlyOffers(false);
        setSortBy('newest');
        setSearchQuery('');
        setSearchResults(null);
    };

    const hasActiveFilters = selectedCategory || selectedBrand || showOnlyOffers || priceRange[0] > 0 || priceRange[1] < 1000;

    const FlatProductRow = ({ product, available }: { product: Product; available: boolean }) => {
        const price = Number(product.price) || 0;
        const oldPrice = Number(product.discount_price) || Number(product.originalPrice) || 0;
        const discount = oldPrice > price ? Math.round(((oldPrice - price) / oldPrice) * 100) : 0;
        const handleQuickAdd = (e: React.MouseEvent) => {
            e.preventDefault();
            e.stopPropagation();
            if (!available) return;
            addToCart(product, 1);
        };

        return (
            <div className="flex gap-4 py-4 px-3 hover:bg-gray-50 transition rounded-2xl">
                <Link
                    to={`/product/${product.id}`}
                    className="flex items-start gap-4 flex-1"
                >
                    <div className="w-24 h-24 rounded-xl bg-gray-50 border border-gray-100 flex items-center justify-center overflow-hidden">
                        <img
                            src={product.image}
                            alt={product.name}
                            className="w-full h-full object-contain"
                            onError={(e) => {
                                (e.target as HTMLImageElement).src = 'https://placehold.co/200x200?text=Product';
                            }}
                        />
                    </div>
                    <div className="flex-1 min-w-0">
                        <p className="text-sm font-semibold text-gray-800 line-clamp-2">{product.name}</p>
                        <p className="text-xs text-gray-500 mt-1">{product.category}</p>
                        <div className="flex items-center gap-2 mt-2">
                            <span className="text-lg font-bold text-brand-orange">{price.toFixed(0)} ج.م</span>
                            {oldPrice > price && (
                                <span className="text-xs line-through text-gray-400">{oldPrice.toFixed(0)}</span>
                            )}
                            {discount > 0 && (
                                <span className="text-[11px] text-red-600 bg-red-50 px-2 py-0.5 rounded-full">
                                    -{discount}%
                                </span>
                            )}
                        </div>
                        <div className="flex items-center gap-2 mt-2">
                            <span
                                className={`text-[11px] px-2 py-1 rounded-full ${available ? 'bg-green-50 text-green-700' : 'bg-gray-100 text-gray-500'
                                    }`}
                            >
                                {available ? 'متوفر' : 'غير متوفر'}
                            </span>
                            {product.weight && (
                                <span className="text-[11px] text-gray-500">{product.weight}</span>
                            )}
                        </div>
                    </div>
                </Link>
                <button
                    onClick={handleQuickAdd}
                    disabled={!available}
                    className={`self-center w-12 h-12 rounded-xl border transition-all ${available
                            ? 'border-brand-orange text-brand-orange hover:bg-orange-50 active:scale-95'
                            : 'border-gray-200 text-gray-400 cursor-not-allowed'
                        }`}
                    title={available ? 'إضافة سريعة للسلة' : 'غير متوفر'}
                >
                    +
                </button>
            </div>
        );
    };

    return (
        <>
            <Seo
                title={pageTitle}
                description={pageDescription}
                url={canonicalUrl}
                image={paginatedProducts[0]?.image}
                keywords={keywordList}
                structuredData={itemListSchema}
            />
            <div className="min-h-screen bg-white">
                {/* Category Banner - معطل مؤقتًا */}
                {/* {selectedCategory && (
                    <div className="max-w-7xl mx-auto px-4 pt-4">
                        <CategoryBanner categoryName={selectedCategory} />
                    </div>
                )} */}
                
                <div className="sticky top-0 z-40 bg-white border-b">
                    <div className="max-w-7xl mx-auto px-4 py-3">
                        {/* Search and Filter Row - على نفس الخط */}
                        <div className="flex items-center gap-2">
                            {/* Search Bar */}
                            <div className="flex-1 flex items-center gap-2 bg-gray-50 border border-gray-200 rounded-xl px-3 py-2">
                                <Search size={16} className="text-gray-400" />
                                <input
                                    value={searchQuery}
                                    onChange={(e) => handleSearch(e.target.value)}
                                    placeholder="ابحث عن منتج أو باركود..."
                                    className="flex-1 bg-transparent outline-none text-sm text-gray-800"
                                />
                                <button
                                    type="button"
                                    onClick={() => setShowScanner(true)}
                                    className="text-gray-400 hover:text-primary hover:bg-primary/10 rounded-lg p-1.5 transition"
                                    title="مسح باركود بالكاميرا"
                                >
                                    <Barcode size={16} />
                                </button>
                                {searchQuery && (
                                    <button onClick={() => handleSearch('')} className="text-gray-400 hover:text-gray-600">
                                        <X size={16} />
                                    </button>
                                )}
                            </div>

                            {/* Filter Button - بجانب البحث على الموبايل */}
                            <button
                                onClick={() => setShowFilters(!showFilters)}
                                className="flex items-center gap-2 px-3 py-2 border border-gray-200 rounded-xl text-sm text-gray-700 bg-white hover:bg-gray-50 transition-colors whitespace-nowrap"
                            >
                                <SlidersHorizontal size={16} />
                                <span className="font-medium">فلاتر</span>
                            </button>
                        </div>

                        {/* Sort Dropdown - يظهر عند الضغط على فلاتر */}
                        {showFilters && (
                            <div className="mt-3 pt-3 border-t border-gray-100">
                                <select
                                    value={sortBy}
                                    onChange={(e) => setSortBy(e.target.value)}
                                    className="w-full px-3 py-2 border border-gray-200 rounded-xl text-sm text-gray-700 bg-white"
                                >
                                    {SORT_OPTIONS.map((option) => (
                                        <option key={option.id} value={option.id}>
                                            {option.name}
                                        </option>
                                    ))}
                                </select>
                            </div>
                        )}

                        <div className="hidden sm:flex items-center gap-2 text-gray-500 text-sm mt-2">
                            <Sparkles size={16} className="text-amber-500" />
                            <span>{totalCount} منتج</span>
                        </div>
                    </div>
                    <div className="max-w-7xl mx-auto px-4 pb-3 overflow-x-auto scrollbar-hide flex gap-2">
                        {categories.map((cat) => {
                            // Normalize both values for comparison
                            const catIdNormalized = normalizeCategoryValue(cat.id || '');
                            const selectedNormalized = normalizeCategoryValue(selectedCategory || '');
                            const isSelected = selectedCategory === cat.id ||
                                selectedCategory === cat.name ||
                                catIdNormalized === selectedNormalized ||
                                (selectedCategory === '' && cat.id === '');

                            return (
                                <button
                                    key={cat.id}
                                    onClick={() => {
                                        console.log('🎯 Selecting category:', cat.id, cat.name);
                                        // Update URL to reflect category change
                                        const params = new URLSearchParams(window.location.search);
                                        if (cat.id && cat.id !== '') {
                                            params.set('category', cat.id);
                                        } else {
                                            params.delete('category');
                                        }
                                        navigate(`/products?${params.toString()}`, { replace: true });
                                        setSelectedCategory(cat.id);
                                        setCurrentPage(1);
                                    }}
                                    className={`flex items-center gap-2 px-3 py-2 rounded-full whitespace-nowrap border text-sm transition-all ${isSelected
                                            ? 'bg-brand-orange text-white border-brand-orange shadow-md scale-105'
                                            : 'border-gray-200 text-gray-700 hover:border-brand-orange/50 hover:bg-orange-50'
                                        }`}
                                >
                                    <span className="font-medium">{cat.name}</span>
                                    {cat.product_count > 0 && (
                                        <span className={`text-xs px-1.5 py-0.5 rounded-full ${isSelected ? 'bg-white/20' : 'bg-gray-100 text-gray-600'
                                            }`}>
                                            {cat.product_count}
                                        </span>
                                    )}
                                </button>
                            );
                        })}
                    </div>
                </div>

                {categoryBanner && categoryBanner.banner_image && (
                    <div className="max-w-7xl mx-auto px-4 pt-4">
                        <div className="rounded-2xl overflow-hidden border">
                            <img
                                src={categoryBanner.banner_image}
                                alt={categoryBanner.banner_title || categoryBanner.name_ar || categoryBanner.name}
                                className="w-full h-44 object-cover"
                            />
                        </div>
                    </div>
                )}

                <div className="max-w-7xl mx-auto px-4 py-6 space-y-4">
                    {/* Filters Panel */}
                    {false && (
                        <div className="bg-white border rounded-2xl p-4 space-y-4">
                            <div className="flex flex-col sm:flex-row gap-4">
                                <div className="flex-1">
                                    <h3 className="font-semibold text-gray-800 mb-2 flex items-center gap-2">
                                        <Tag size={16} className="text-brand-orange" />
                                        نطاق السعر
                                    </h3>
                                    <div className="flex items-center gap-2">
                                        <input
                                            type="number"
                                            value={priceRange[0]}
                                            onChange={(e) => setPriceRange([Number(e.target.value), priceRange[1]])}
                                            className="w-24 px-3 py-2 border border-gray-200 rounded-lg text-center text-sm"
                                            placeholder="من"
                                        />
                                        <span className="text-gray-400">—</span>
                                        <input
                                            type="number"
                                            value={priceRange[1]}
                                            onChange={(e) => setPriceRange([priceRange[0], Number(e.target.value)])}
                                            className="w-24 px-3 py-2 border border-gray-200 rounded-lg text-center text-sm"
                                            placeholder="إلى"
                                        />
                                        <span className="text-gray-500 text-sm">جنيه</span>
                                    </div>
                                </div>

                                <div className="flex-1">
                                    <h3 className="font-semibold text-gray-800 mb-2 flex items-center gap-2">
                                        <Sparkles size={16} className="text-orange-500" />
                                        عروض
                                    </h3>
                                    <button
                                        onClick={() => setShowOnlyOffers(!showOnlyOffers)}
                                        className={`px-4 py-2 rounded-xl border text-sm w-full text-right ${showOnlyOffers ? 'border-orange-500 text-orange-700 bg-orange-50' : 'border-gray-200 text-gray-700'
                                            }`}
                                    >
                                        عرض المنتجات بخصم فقط
                                    </button>
                                </div>

                                {brands.length > 1 && (
                                    <div className="flex-1">
                                        <h3 className="font-semibold text-gray-800 mb-2 flex items-center gap-2">
                                            <Tag size={16} className="text-orange-500" />
                                            البراند
                                        </h3>
                                        <div className="space-y-2 max-h-52 overflow-y-auto pr-1">
                                            {brands.map((brand) => (
                                                <button
                                                    key={brand.id}
                                                    onClick={() => setSelectedBrand(brand.id)}
                                                    className={`w-full text-right px-4 py-2 rounded-xl border text-sm ${selectedBrand === brand.id
                                                            ? 'border-orange-500 text-orange-700 bg-orange-50'
                                                            : 'border-gray-200 text-gray-700'
                                                        }`}
                                                >
                                                    {brand.name}
                                                </button>
                                            ))}
                                        </div>
                                    </div>
                                )}
                            </div>
                        </div>
                    )}

                    {/* Active Filters */}
                    {hasActiveFilters && (
                        <div className="flex flex-wrap items-center gap-2 mb-6" />
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
                                        className={`flex items-center gap-3 px-4 py-3 rounded-xl border-2 transition-all w-full ${showOnlyOffers
                                                ? 'border-orange-500 bg-orange-50 text-orange-700'
                                                : 'border-gray-200 hover:border-orange-300'
                                            }`}
                                    >
                                        <div className={`w-5 h-5 rounded-md border-2 flex items-center justify-center ${showOnlyOffers ? 'bg-orange-500 border-orange-500' : 'border-gray-300'
                                            }`}>
                                            {showOnlyOffers && <Check size={14} className="text-white" />}
                                        </div>
                                        <span>عرض المنتجات بخصم فقط</span>
                                    </button>
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
                                                    className={`flex items-center gap-3 px-4 py-2.5 rounded-xl border-2 transition-all w-full text-right ${selectedBrand === brand.id
                                                            ? 'border-orange-500 bg-orange-50 text-orange-700'
                                                            : 'border-gray-200 hover:border-orange-300'
                                                        }`}
                                                >
                                                    <div className={`w-4 h-4 rounded-full border-2 flex items-center justify-center ${selectedBrand === brand.id ? 'bg-orange-500 border-orange-500' : 'border-gray-300'
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

                    {/* Products List */}
                    {listLoading ? (
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
                            <div className="bg-white border rounded-2xl divide-y">
                                {paginatedProducts.map((product) => {
                                    const reserved = product.reserved_quantity || 0;
                                    const stock = product.stock_quantity;
                                    const available = typeof stock === 'number' ? (stock - reserved) > 0 : true;
                                    return (
                                        <FlatProductRow
                                            key={product.id}
                                            product={product}
                                            available={available}
                                        />
                                    );
                                })}
                            </div>

                            {/* Pagination */}
                            {totalPages > 1 && (
                                <div className="space-y-4">
                                    {/* Products Count Info */}
                                    <div className="text-center text-gray-600 text-sm">
                                        عرض {((currentPage - 1) * ITEMS_PER_PAGE) + 1}-{Math.min(currentPage * ITEMS_PER_PAGE, totalCount)} من {totalCount} منتج
                                    </div>
                                    
                                    <div className="flex justify-center items-center gap-2">
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
                                                        className={`w-10 h-10 rounded-xl font-medium transition ${currentPage === pageNum
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
                                    
                                    {/* Page Info */}
                                    <div className="text-center text-gray-500 text-xs">
                                        صفحة {currentPage} من {totalPages}
                                    </div>
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
                                        <span className={`px-3 py-1 rounded-full text-sm font-medium ${scannedProduct.stock > 10
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
        </>
    );
}
