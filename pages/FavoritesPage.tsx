import React from 'react';
import { useFavorites } from '../context/FavoritesContext';
import ProductCard from '../components/ProductCard';
import Footer from '../components/Footer';
import { ChevronLeft, Heart } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const FavoritesPage = () => {
    const { favorites } = useFavorites();
    const navigate = useNavigate();

    return (
        <div className="bg-gray-50 min-h-screen pb-24 md:pb-8">
            {/* Header */}
            <div className="bg-white p-4 sticky top-0 z-40 shadow-sm flex items-center relative md:hidden">
                <button onClick={() => navigate(-1)} className="p-2 -ml-2 text-primary absolute left-4">
                    <ChevronLeft size={28} />
                </button>
                <h1 className="text-xl font-bold text-gray-900 w-full text-center">My Favorites</h1>
            </div>

            <div className="max-w-7xl mx-auto md:p-6">
                <h1 className="hidden md:block text-3xl font-bold text-gray-900 mb-6">My Favorites</h1>

                {favorites.length === 0 ? (
                    <div className="flex flex-col items-center justify-center py-20 text-center">
                        <div className="w-24 h-24 bg-red-50 rounded-full flex items-center justify-center mb-6">
                            <Heart size={40} className="text-red-500" />
                        </div>
                        <h2 className="text-2xl font-bold text-gray-900 mb-2">No favorites yet</h2>
                        <p className="text-gray-500 mb-8">Start adding products you love!</p>
                        <button
                            onClick={() => navigate('/products')}
                            className="bg-primary text-white px-8 py-3 rounded-xl font-bold shadow-lg hover:bg-primary-dark transition-colors"
                        >
                            Explore Products
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
