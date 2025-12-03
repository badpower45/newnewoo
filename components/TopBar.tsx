import React, { useState } from 'react';
import { MapPin, ChevronDown, Search, ScanLine, ShoppingCart, User, Heart, Clock, Phone, Bell } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import BarcodeScanner from './BarcodeScanner';
import { api } from '../services/api';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';

import { useFavorites } from '../context/FavoritesContext';

const TopBar = () => {
    const { user, isAuthenticated } = useAuth();
    const { favorites } = useFavorites();
    const { totalItems, totalPrice } = useCart();
    const [showScanner, setShowScanner] = useState(false);
    const [searchQuery, setSearchQuery] = useState('');
    const navigate = useNavigate();

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
                    <span className="hover:text-primary cursor-pointer">تتبع طلبك</span>
                    <span className="hover:text-primary cursor-pointer">مكافآت علوش</span>
                </div>
            </div>

            {/* Main Header */}
            <div className="p-4 max-w-7xl mx-auto">
                <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">

                    {/* Logo & Location Row (Mobile) */}
                    <div className="flex items-center justify-between">
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
                            <Link to={isAuthenticated ? "/profile" : "/login"} className="p-2">
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
                    <div className="flex md:hidden items-center gap-2 bg-gray-50 rounded-xl p-2.5">
                        <div className="w-8 h-8 bg-primary/10 rounded-full flex items-center justify-center">
                            <MapPin className="text-primary w-4 h-4" />
                        </div>
                        <div className="flex-1">
                            <div className="flex items-center gap-1">
                                <span className="text-gray-500 text-xs">التوصيل إلى:</span>
                                <ChevronDown className="w-3 h-3 text-primary" />
                            </div>
                            <span className="text-xs text-gray-900 font-medium">وسط البلد، القاهرة</span>
                        </div>
                        <div className="text-right">
                            <span className="text-[10px] text-gray-500 block">التوصيل خلال</span>
                            <span className="text-xs text-green-600 font-bold">45-75 دقيقة</span>
                        </div>
                    </div>

                    {/* Desktop: Location */}
                    <div className="hidden md:flex items-center gap-3">
                        <div className="w-10 h-10 bg-primary/10 rounded-full flex items-center justify-center">
                            <MapPin className="text-primary w-5 h-5" />
                        </div>
                        <div>
                            <div className="flex items-center gap-1">
                                <span className="text-gray-500 text-sm">التوصيل إلى:</span>
                                <ChevronDown className="w-4 h-4 text-primary" />
                            </div>
                            <span className="text-sm text-gray-900 font-medium">وسط البلد، القاهرة</span>
                            <span className="text-xs text-green-600 font-medium block">التوصيل خلال 45-75 دقيقة</span>
                        </div>
                    </div>

                    {/* Search Bar */}
                    <form onSubmit={handleSearch} className="relative flex-grow max-w-2xl">
                        <div className="absolute inset-y-0 right-3 flex items-center pointer-events-none">
                            <Search className="h-5 w-5 text-gray-400" />
                        </div>
                        <input
                            type="text"
                            placeholder="ابحث عن منتج... رز، زيت، لبن..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="w-full bg-gray-50 border border-gray-100 text-gray-900 text-sm rounded-xl focus:ring-primary focus:border-primary block pr-10 pl-12 p-3 placeholder:text-gray-400"
                        />
                        <div
                            onClick={() => setShowScanner(true)}
                            className="absolute inset-y-0 left-3 flex items-center cursor-pointer border-r border-gray-200 pr-3 hover:text-primary transition-colors"
                        >
                            <ScanLine className="h-5 w-5 text-gray-600 hover:text-primary" />
                        </div>
                    </form>

                    {/* Desktop Actions */}
                    <div className="hidden md:flex items-center gap-6">
                        <Link to="/favorites" className="relative text-gray-700 hover:text-primary transition-colors">
                            <Heart size={24} />
                            {favorites.length > 0 && (
                                <span className="absolute -top-1 -right-1 w-4 h-4 bg-red-500 rounded-full text-[10px] flex items-center justify-center text-white font-bold border border-white">
                                    {favorites.length}
                                </span>
                            )}
                        </Link>

                        <Link to="/cart" className="flex items-center gap-2 bg-primary/10 px-4 py-2 rounded-xl hover:bg-primary/20 transition-colors">
                            <div className="relative">
                                <ShoppingCart size={22} className="text-primary" />
                                {totalItems > 0 && (
                                    <span className="absolute -top-1 -right-1 w-4 h-4 bg-primary rounded-full text-[10px] flex items-center justify-center text-white font-bold">
                                        {totalItems}
                                    </span>
                                )}
                            </div>
                            <div className="flex flex-col">
                                <span className="text-xs text-gray-500">السلة</span>
                                <span className="font-bold text-sm text-primary">{totalPrice.toFixed(2)} ج.م</span>
                            </div>
                        </Link>

                        {isAuthenticated ? (
                            <Link to="/profile" className="flex items-center gap-2 text-gray-700 hover:text-primary">
                                <div className="w-10 h-10 bg-primary/10 rounded-full flex items-center justify-center text-primary font-bold">
                                    {user?.name?.charAt(0).toUpperCase() || <User size={18} />}
                                </div>
                                <div className="flex flex-col">
                                    <span className="text-xs text-gray-500">أهلاً</span>
                                    <span className="font-medium text-sm leading-none">{user?.name?.split(' ')[0]}</span>
                                </div>
                            </Link>
                        ) : (
                            <Link to="/login" className="flex items-center gap-2 bg-primary text-white px-4 py-2.5 rounded-xl hover:bg-primary-dark transition-colors">
                                <User size={18} />
                                <span className="font-medium text-sm">تسجيل دخول</span>
                            </Link>
                        )}
                    </div>
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
};

export default TopBar;
