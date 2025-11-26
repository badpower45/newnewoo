import React, { useState } from 'react';
import { MapPin, ChevronDown, Search, ScanLine, ShoppingCart, User, Heart } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import BarcodeScanner from './BarcodeScanner';
import { api } from '../services/api';

import { useAuth } from '../context/AuthContext';

import { useFavorites } from '../context/FavoritesContext';

const TopBar = () => {
    const { user, isAuthenticated } = useAuth();
    const { favorites } = useFavorites();
    const [showScanner, setShowScanner] = useState(false);
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

    return (
        <div className="bg-white p-4 sticky top-0 z-40 shadow-sm">
            <div className="max-w-7xl mx-auto flex flex-col md:flex-row md:items-center md:justify-between md:space-x-8">

                {/* Logo & Location (Desktop) */}
                <div className="flex items-center justify-between mb-4 md:mb-0">
                    <Link to="/" className="text-2xl font-bold text-primary mr-8 hidden md:block">Aloosh</Link>

                    <div className="flex items-center space-x-2">
                        <MapPin className="text-primary w-5 h-5" />
                        <div className="flex flex-col">
                            <div className="flex items-center space-x-1">
                                <span className="text-gray-500 text-sm">Deliver To :</span>
                                <ChevronDown className="w-4 h-4 text-primary" />
                            </div>
                            <span className="text-xs text-green-600 font-medium">Arrive within 75 mins</span>
                        </div>
                    </div>
                </div>

                {/* Search Bar */}
                <div className="relative flex-grow max-w-2xl">
                    <div className="absolute inset-y-0 left-3 flex items-center pointer-events-none">
                        <Search className="h-5 w-5 text-gray-400" />
                    </div>
                    <input
                        type="text"
                        placeholder="What are you looking for?"
                        className="w-full bg-gray-50 border border-gray-100 text-gray-900 text-sm rounded-xl focus:ring-primary focus:border-primary block pl-10 p-3"
                    />
                    <div
                        onClick={() => setShowScanner(true)}
                        className="absolute inset-y-0 right-3 flex items-center cursor-pointer border-l border-gray-200 pl-3 hover:text-brand-orange transition-colors"
                    >
                        <ScanLine className="h-5 w-5 text-gray-800 hover:text-brand-orange" />
                    </div>
                </div>

                {/* Desktop Actions */}
                <div className="hidden md:flex items-center space-x-6">
                    <Link to="/favorites" className="relative text-gray-700 hover:text-primary transition-colors">
                        <Heart size={24} />
                        {favorites.length > 0 && (
                            <span className="absolute -top-1 -right-1 w-4 h-4 bg-red-500 rounded-full text-[10px] flex items-center justify-center text-white font-bold border border-white">
                                {favorites.length}
                            </span>
                        )}
                    </Link>

                    <Link to="/cart" className="flex items-center space-x-2 text-gray-700 hover:text-primary">
                        <ShoppingCart size={24} />
                        <span className="font-medium">Cart</span>
                    </Link>

                    {isAuthenticated ? (
                        <Link to="/profile" className="flex items-center space-x-2 text-gray-700 hover:text-primary">
                            <div className="w-8 h-8 bg-orange-100 rounded-full flex items-center justify-center text-primary font-bold text-sm">
                                {user?.name?.charAt(0).toUpperCase() || <User size={16} />}
                            </div>
                            <div className="flex flex-col">
                                <span className="font-medium text-sm leading-none">{user?.name?.split(' ')[0]}</span>
                                <span className="text-[10px] text-gray-500">My Profile</span>
                            </div>
                        </Link>
                    ) : (
                        <Link to="/login" className="flex items-center space-x-2 text-gray-700 hover:text-primary">
                            <User size={24} />
                            <span className="font-medium">Login</span>
                        </Link>
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
};

export default TopBar;
