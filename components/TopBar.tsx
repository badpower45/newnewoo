import React, { useState } from 'react';
import { MapPin, ChevronDown, Search, ScanLine, ShoppingCart, User, Heart, Clock, Phone } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import BarcodeScanner from './BarcodeScanner';
import BranchSelector from './BranchSelector';
import { api } from '../services/api';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';
import { useBranch } from '../context/BranchContext';
import { useFavorites } from '../context/FavoritesContext';

const TopBar = () => {
    const { user, isAuthenticated } = useAuth();
    const { favorites } = useFavorites();
    const { totalItems } = useCart();
    const { selectedBranch } = useBranch();
    const [showScanner, setShowScanner] = useState(false);
    const [showBranchSelector, setShowBranchSelector] = useState(false);
    const [searchQuery, setSearchQuery] = useState('');
    const navigate = useNavigate();

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
            console.error('Error fetching product:', error);
            alert('حدث خطأ في البحث عن المنتج');
        }
    };

    const handleSearch = (e: React.FormEvent) => {
        e.preventDefault();
        if (searchQuery.trim()) {
            navigate(`/products?search=${encodeURIComponent(searchQuery.trim())}`);
        }
    };

    return (
        <div className="bg-white sticky top-0 z-40 shadow-sm">
            {/* Top Utility Bar - Desktop */}
            <div className="hidden md:flex justify-between items-center max-w-7xl mx-auto px-4 text-xs text-gray-500 py-2 border-b border-gray-100">
                <div className="flex items-center gap-4">
                    <span className="flex items-center gap-1 text-green-600 font-medium">
                        <Clock size={12} />
                        مفتوح 24 ساعة
                    </span>
                    <span className="flex items-center gap-1">
                        <Phone size={12} />
                        الخط الساخن: 19999
                    </span>
                </div>
                <div className="flex items-center gap-4">
                    <Link to="/track-order" className="hover:text-primary cursor-pointer transition-colors">تتبع طلبك</Link>
                    <Link to="/profile?tab=rewards" className="hover:text-primary cursor-pointer transition-colors">مكافآت علوش</Link>
                </div>
            </div>

            {/* Main Header */}
            <div className="p-4 max-w-7xl mx-auto">
                <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                    {/* Logo & Location Row (Mobile) */}
                    <div className="flex items-center justify-between w-full md:w-auto">
                        {/* Logo */}
                        <Link to="/" className="flex items-center gap-2">
                            <div className="w-10 h-10 bg-gradient-to-br from-primary to-orange-600 rounded-xl flex items-center justify-center shadow-md">
                                <span className="text-white font-bold text-xl">ع</span>
                            </div>
                            <div className="flex flex-col">
                                <span className="text-xl font-bold text-gray-900 leading-none">علوش</span>
                                <span className="text-[10px] text-primary font-medium">ماركت</span>
                            </div>
                        </Link>

                        {/* Mobile Actions */}
                        <div className="flex md:hidden items-center gap-3">
                            <Link to="/favorites" className="relative p-2">
                                <Heart size={22} className="text-gray-600" />
                                {favorites.length > 0 && (
                                    <span className="absolute -top-0.5 -right-0.5 w-4 h-4 bg-red-500 rounded-full text-[10px] flex items-center justify-center text-white font-bold">
                                        {favorites.length}
                                    </span>
                                )}
                            </Link>
                            <Link to="/cart" className="relative p-2">
                                <ShoppingCart size={22} className="text-gray-600" />
                                {totalItems > 0 && (
                                    <span className="absolute -top-0.5 -right-0.5 w-4 h-4 bg-primary rounded-full text-[10px] flex items-center justify-center text-white font-bold">
                                        {totalItems}
                                    </span>
                                )}
                            </Link>
                            <Link to={isAuthenticated ? '/profile' : '/login'} className="p-2">
                                {isAuthenticated ? (
                                    <div className="w-8 h-8 bg-primary/10 rounded-full flex items-center justify-center text-primary font-bold text-sm">
                                        {user?.name?.charAt(0).toUpperCase()}
                                    </div>
                                ) : (
                                    <User size={22} className="text-gray-600" />
                                )}
                            </Link>
                        </div>
                    </div>

                    {/* Location Badge (Mobile) */}
                    <div
                        onClick={() => setShowBranchSelector(true)}
                        className="flex md:hidden items-center gap-2 bg-gray-50 rounded-xl p-2.5 cursor-pointer hover:bg-gray-100 transition-colors w-full"
                    >
                        <div className="w-8 h-8 bg-primary/10 rounded-full flex items-center justify-center">
                            <MapPin className="text-primary w-4 h-4" />
                        </div>
                        <div className="flex-1">
                            <div className="flex items-center gap-1">
                                <span className="text-gray-500 text-xs">التوصيل إلى:</span>
                                <ChevronDown className="w-3 h-3 text-primary" />
                            </div>
                            <span className="text-xs text-gray-900 font-medium">{selectedBranch?.address || 'اختر الفرع'}</span>
                        </div>
                        <div className="text-right">
                            <span className="text-[10px] text-gray-500 block">التوصيل خلال</span>
                            <span className="text-xs text-green-600 font-bold">45-75 دقيقة</span>
                        </div>
                    </div>

                    {/* Desktop: Location + Search + Actions */}
                    <div className="hidden md:flex items-center gap-4 w-full">
                        <div
                            onClick={() => setShowBranchSelector(true)}
                            className="flex items-center gap-3 cursor-pointer hover:bg-gray-50 rounded-xl p-3 transition-colors"
                        >
                            <div className="w-10 h-10 bg-primary/10 rounded-full flex items-center justify-center">
                                <MapPin className="text-primary w-5 h-5" />
                            </div>
                            <div>
                                <div className="flex items-center gap-1">
                                    <span className="text-gray-500 text-sm">التوصيل إلى:</span>
                                    <ChevronDown className="w-4 h-4 text-primary" />
                                </div>
                                <span className="text-sm text-gray-900 font-medium">{selectedBranch?.address || 'اختر الفرع'}</span>
                            </div>
                        </div>

                        {/* Search Bar */}
                        <form onSubmit={handleSearch} className="flex-1 flex items-center gap-3">
                            <div className="flex items-center gap-2 bg-gray-50 px-3 py-2 rounded-xl w-full border border-gray-100 focus-within:border-primary focus-within:ring-2 focus-within:ring-primary/20">
                                <Search size={18} className="text-gray-400" />
                                <input
                                    type="text"
                                    value={searchQuery}
                                    onChange={(e) => setSearchQuery(e.target.value)}
                                    placeholder="ابحث عن منتج أو فئة"
                                    className="w-full bg-transparent outline-none text-sm text-gray-900"
                                />
                                <button
                                    type="submit"
                                    className="text-sm text-primary font-semibold hover:text-primary/80 transition-colors"
                                >
                                    بحث
                                </button>
                            </div>
                            <button
                                type="button"
                                onClick={() => setShowScanner(true)}
                                className="flex items-center gap-2 px-3 py-2 rounded-xl border border-gray-200 text-sm text-gray-700 hover:border-primary hover:text-primary transition-colors"
                            >
                                <ScanLine size={18} />
                                مسح باركود
                            </button>
                        </form>

                        {/* Desktop Actions */}
                        <div className="flex items-center gap-3">
                            <Link to="/favorites" className="relative p-2 rounded-xl hover:bg-gray-50">
                                <Heart size={22} className="text-gray-600" />
                                {favorites.length > 0 && (
                                    <span className="absolute -top-0.5 -right-0.5 w-4 h-4 bg-red-500 rounded-full text-[10px] flex items-center justify-center text-white font-bold">
                                        {favorites.length}
                                    </span>
                                )}
                            </Link>
                            <Link to="/cart" className="relative p-2 rounded-xl hover:bg-gray-50">
                                <ShoppingCart size={22} className="text-gray-600" />
                                {totalItems > 0 && (
                                    <span className="absolute -top-0.5 -right-0.5 w-4 h-4 bg-primary rounded-full text-[10px] flex items-center justify-center text-white font-bold">
                                        {totalItems}
                                    </span>
                                )}
                            </Link>
                            <Link to={isAuthenticated ? '/profile' : '/login'} className="p-2 rounded-xl hover:bg-gray-50">
                                {isAuthenticated ? (
                                    <div className="w-10 h-10 bg-primary/10 rounded-full flex items-center justify-center text-primary font-bold text-sm">
                                        {user?.name?.charAt(0).toUpperCase()}
                                    </div>
                                ) : (
                                    <User size={22} className="text-gray-600" />
                                )}
                            </Link>
                        </div>
                    </div>
                </div>
            </div>

            {/* Modals */}
            {showScanner && (
                <BarcodeScanner onScan={handleBarcodeScanned} onClose={() => setShowScanner(false)} />
            )}
            {showBranchSelector && (
                <BranchSelector isOpen={showBranchSelector} onClose={() => setShowBranchSelector(false)} />
            )}
        </div>
    );
};

export default TopBar;
