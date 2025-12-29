import React, { useEffect } from 'react';
import { useFavorites } from '../context/FavoritesContext';
import ProductCard from '../components/ProductCard';
import Footer from '../components/Footer';
import { ChevronLeft, Heart, Loader2, RefreshCw } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const FavoritesPage = () => {
    const { favorites, loading, refreshFavorites } = useFavorites();
    const { user } = useAuth();
    const navigate = useNavigate();

    // Refresh favorites when page loads
    useEffect(() => {
        refreshFavorites();
    }, []);

    return (
        <div className="bg-gray-50 min-h-screen pb-24 md:pb-8">
            {/* Header */}
            <div className="bg-white p-4 sticky top-0 z-40 shadow-sm flex items-center relative md:hidden">
                <button onClick={() => navigate(-1)} className="p-2 -ml-2 text-primary absolute left-4">
                    <ChevronLeft size={28} />
                </button>
                <h1 className="text-xl font-bold text-gray-900 w-full text-center">المفضلة</h1>
                <button 
                    onClick={() => refreshFavorites()} 
                    className="p-2 text-primary absolute right-4"
                    disabled={loading}
                >
                    <RefreshCw size={20} className={loading ? 'animate-spin' : ''} />
                </button>
            </div>

            <div className="max-w-7xl mx-auto md:p-6">
                <div className="hidden md:flex items-center justify-between mb-6">
                    <h1 className="text-3xl font-bold text-gray-900">المفضلة</h1>
                    <button 
                        onClick={() => refreshFavorites()} 
                        className="flex items-center gap-2 text-primary hover:text-primary-dark transition-colors"
                        disabled={loading}
                    >
                        <RefreshCw size={18} className={loading ? 'animate-spin' : ''} />
                        <span>Refresh</span>
                    </button>
                </div>

                {/* Guest user notice */}
                {user?.isGuest && (
                    <div className="bg-yellow-50 border border-yellow-200 rounded-xl p-4 mx-4 md:mx-0 mb-4">
                        <p className="text-yellow-800 text-sm">
                            <strong>ملاحظة:</strong> أنت تستخدم حساب ضيف. سجل دخول لحفظ المفضلة على حسابك بشكل دائم.
                        </p>
                    </div>
                )}

                {loading ? (
                    <div className="flex flex-col items-center justify-center py-20">
                        <Loader2 size={40} className="text-primary animate-spin mb-4" />
                        <p className="text-gray-500">جاري تحميل المفضلة...</p>
                    </div>
                ) : favorites.length === 0 ? (
                    <div className="flex flex-col items-center justify-center py-20 text-center">
                        <div className="w-24 h-24 bg-red-50 rounded-full flex items-center justify-center mb-6">
                            <Heart size={40} className="text-red-500" />
                        </div>
                        <h2 className="text-2xl font-bold text-gray-900 mb-2">لا توجد مفضلة بعد</h2>
                        <p className="text-gray-500 mb-8">ابدأ بإضافة المنتجات التي تحبها</p>
                        <button
                            onClick={() => navigate('/products')}
                            className="bg-primary text-white px-8 py-3 rounded-xl font-bold shadow-lg hover:bg-primary-dark transition-colors"
                        >
                            استكشف المنتجات
                        </button>
                    </div>
                ) : (
                    <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-4 p-4 md:p-0">
                        {favorites.map((product) => (
                            <ProductCard key={product.id} product={product} />
                        ))}
                    </div>
                )}
            </div>
            <Footer />
        </div>
    );
};

export default FavoritesPage;
