import React, { useState, useEffect, useMemo } from 'react';
import SidebarFilter from '../components/SidebarFilter';
import ProductCard from '../components/ProductCard';
import BarcodeScanner from '../components/BarcodeScanner';
import LoadingSpinner from '../components/LoadingSpinner';
import ErrorMessage from '../components/ErrorMessage';
import Pagination from '../components/Pagination';
import { Filter, Scan, Search, X } from 'lucide-react';
import { api } from '../services/api';
import { Product } from '../types';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { ITEMS_PER_PAGE } from '../src/config';
import { useBranch } from '../context/BranchContext';

export default function ProductsPage() {
    const [allProducts, setAllProducts] = useState<Product[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [showScanner, setShowScanner] = useState(false);
    const [searchQuery, setSearchQuery] = useState('');
    const [selectedCategory, setSelectedCategory] = useState<string>('');
    const [sortBy, setSortBy] = useState<string>('newest');
    const [currentPage, setCurrentPage] = useState(1);
    const [showFilters, setShowFilters] = useState(false);
    const navigate = useNavigate();
    const [searchParams] = useSearchParams();
    const { selectedBranch } = useBranch();

    const [branchMap, setBranchMap] = useState<Record<string | number, { price?: number; stockQuantity?: number; reservedQuantity?: number }>>({});

    useEffect(() => {
        const category = searchParams.get('category');
        if (category) {
            setSelectedCategory(category);
        }
        fetchProducts();
    }, [searchParams]);

    useEffect(() => {
        const loadBranchProducts = async () => {
            if (!selectedBranch) { setBranchMap({}); return; }
            try {
                const res = await api.branchProducts.getByBranch(selectedBranch.id);
                const list = Array.isArray(res?.data) ? res.data : (Array.isArray(res) ? res : []);
                const map: Record<string | number, { price?: number; stockQuantity?: number; reservedQuantity?: number }> = {};
                for (const bp of list) {
                    const pid = bp.product_id || bp.productId || bp.id;
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
        loadBranchProducts();
    }, [selectedBranch]);

    const fetchProducts = async () => {
        setLoading(true);
        setError(null);
        try {
            const data = await api.products.getAll();
            if (data.data) {
                setAllProducts(data.data);
            }
        } catch (err) {
            setError('فشل تحميل المنتجات');
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    const handleBarcodeScanned = async (barcode: string) => {
        console.log('Scanned barcode:', barcode);
        setShowScanner(false);

        try {
            const response = await api.products.getByBarcode(barcode);
            if (response.data) {
                navigate(`/product/${response.data.id}`);
            } else {
                alert('المنتج غير موجود');
            }
        } catch (error) {
            console.error('Error fetching product:', error);
            alert('حدث خطأ في البحث عن المنتج');
        }
    };

    const handleSearch = async (query: string) => {
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
    };

    // Filter and sort products
    const filteredAndSortedProducts = useMemo(() => {
        let filtered = [...allProducts];

        // Filter by category
        if (selectedCategory) {
            filtered = filtered.filter(p => p.category === selectedCategory);
        }

        // Sort (price-aware of branch override)
        switch (sortBy) {
            case 'price-asc':
                filtered.sort((a, b) => {
                    const pa = branchMap[a.id]?.price ?? a.price ?? 0;
                    const pb = branchMap[b.id]?.price ?? b.price ?? 0;
                    return pa - pb;
                });
                break;
            case 'price-desc':
                filtered.sort((a, b) => {
                    const pa = branchMap[a.id]?.price ?? a.price ?? 0;
                    const pb = branchMap[b.id]?.price ?? b.price ?? 0;
                    return pb - pa;
                });
                break;
            case 'name':
                filtered.sort((a, b) => a.name.localeCompare(b.name, 'ar'));
                break;
            case 'newest':
            default:
                // Keep original order (newest first from API)
                break;
        }

        return filtered;
    }, [allProducts, selectedCategory, sortBy]);

    // Pagination
    const totalPages = Math.ceil(filteredAndSortedProducts.length / ITEMS_PER_PAGE);
    const paginatedProducts = filteredAndSortedProducts.slice(
        (currentPage - 1) * ITEMS_PER_PAGE,
        currentPage * ITEMS_PER_PAGE
    );

    if (loading && allProducts.length === 0) {
        return <LoadingSpinner fullScreen message="جاري تحميل المنتجات..." />;
    }

    if (error && allProducts.length === 0) {
        return <ErrorMessage message={error} onRetry={fetchProducts} fullScreen />;
    }

    return (
        <div className="container mx-auto px-4 md:px-6 py-8">
            <div className="flex flex-col lg:flex-row gap-8">
                {/* Sidebar - Desktop */}
                <div className="hidden lg:block">
                    <SidebarFilter />
                </div>

                {/* Main Content */}
                <div className="flex-1">
                    {/* Header */}
                    <div className="flex flex-col gap-4 mb-6">
                        <div className="flex items-center justify-between">
                            <h1 className="text-2xl font-bold text-gray-900">كل المنتجات</h1>
                            <div className="flex gap-2">
                                <button
                                    onClick={() => setShowScanner(true)}
                                    className="flex items-center gap-2 bg-green-600 text-white font-bold px-4 py-2 rounded-lg hover:bg-green-700 transition-colors shadow-md"
                                >
                                    <Scan size={18} /> مسح باركود
                                </button>
                                <button 
                                    onClick={() => setShowFilters(!showFilters)}
                                    className="lg:hidden flex items-center gap-2 text-green-600 font-bold border-2 border-green-600 px-4 py-2 rounded-lg hover:bg-green-50 transition"
                                >
                                    <Filter size={18} /> تصفية
                                </button>
                            </div>
                        </div>

                        {/* Search Bar */}
                        <div className="relative">
                            <Search className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
                            <input
                                type="text"
                                placeholder="ابحث عن منتج..."
                                value={searchQuery}
                                onChange={(e) => handleSearch(e.target.value)}
                                className="w-full pr-10 pl-10 py-3 border-2 border-gray-200 rounded-lg focus:border-green-600 focus:outline-none"
                            />
                            {searchQuery && (
                                <button
                                    onClick={() => handleSearch('')}
                                    className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                                >
                                    <X size={20} />
                                </button>
                            )}
                        </div>

                        {/* Filters Bar */}
                        <div className="flex items-center gap-4 flex-wrap">
                            <select
                                value={sortBy}
                                onChange={(e) => setSortBy(e.target.value)}
                                className="px-4 py-2 border-2 border-gray-200 rounded-lg focus:border-green-600 focus:outline-none"
                            >
                                <option value="newest">الأحدث</option>
                                <option value="price-asc">السعر: من الأقل للأعلى</option>
                                <option value="price-desc">السعر: من الأعلى للأقل</option>
                                <option value="name">الاسم</option>
                            </select>

                            {selectedCategory && (
                                <button
                                    onClick={() => setSelectedCategory('')}
                                    className="flex items-center gap-2 px-4 py-2 bg-green-100 text-green-700 rounded-lg hover:bg-green-200 transition"
                                >
                                    {selectedCategory}
                                    <X size={16} />
                                </button>
                            )}

                            <span className="text-gray-600 text-sm">
                                {filteredAndSortedProducts.length} منتج
                            </span>
                        </div>
                    </div>

                    {/* Mobile Filters */}
                    {showFilters && (
                        <div className="lg:hidden mb-6 p-4 bg-gray-50 rounded-lg">
                            <SidebarFilter />
                        </div>
                    )}

                    {/* Products Grid */}
                    {loading ? (
                        <LoadingSpinner message="جاري التحميل..." />
                    ) : paginatedProducts.length === 0 ? (
                        <div className="text-center py-12">
                            <p className="text-gray-500 text-lg">لا توجد منتجات</p>
                        </div>
                    ) : (
                        <>
                            <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-4 md:gap-6">
                                {paginatedProducts.map((product) => {
                                    const bp = branchMap[product.id] || {};
                                    const reserved = bp.reservedQuantity || 0;
                                    const stock = bp.stockQuantity;
                                    const available = typeof stock === 'number' ? (stock - reserved) > 0 : true;
                                    const displayPrice = (bp.price ?? product.price) || 0;
                                    return (
                                        <ProductCard 
                                            key={product.id} 
                                            product={{ ...product, price: displayPrice }} 
                                            variant="vertical"
                                            available={available}
                                        />
                                    );
                                })}
                            </div>

                            {/* Pagination */}
                            <Pagination
                                currentPage={currentPage}
                                totalPages={totalPages}
                                onPageChange={setCurrentPage}
                            />
                        </>
                    )}
                </div>
            </div>

            {showScanner && (
                <BarcodeScanner
                    onScan={handleBarcodeScanned}
                    onClose={() => setShowScanner(false)}
                />
            )}
        </div>
    );
}
