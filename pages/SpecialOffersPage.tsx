import React, { useState, useEffect } from 'react';
import { ArrowRight, Loader, Sparkles, Tag } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { api } from '../services/api';
import ProductCard from '../components/ProductCard';
import { Product } from '../types';

const SpecialOffersPage: React.FC = () => {
    const navigate = useNavigate();
    const [products, setProducts] = useState<Product[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        loadSpecialOffers();
    }, []);

    const loadSpecialOffers = async () => {
        try {
            setLoading(true);
            // Load products with special offers (has discount)
            const response = await api.products.getAll();
            const allProducts = response.data || response || [];
            
            // Filter products that have special offers
            const specialOffers = allProducts.filter((p: Product) => 
                p.discount_price && p.discount_price < p.price
            );
            
            setProducts(specialOffers);
        } catch (error) {
            console.error('Failed to load special offers:', error);
        } finally {
            setLoading(false);
        }
    };

    if (loading) {
        return (
            <div className="min-h-screen bg-gray-50 flex items-center justify-center">
                <Loader className="w-12 h-12 text-orange-500 animate-spin" />
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-50 pb-24">
            {/* Header */}
            <div className="bg-gradient-to-r from-orange-500 to-orange-600 text-white px-4 py-6 sticky top-0 z-10 shadow-md">
                <div className="flex items-center justify-between max-w-7xl mx-auto">
                    <button 
                        onClick={() => navigate(-1)}
                        className="w-10 h-10 bg-white/20 backdrop-blur-sm rounded-full flex items-center justify-center hover:bg-white/30 transition"
                    >
                        <ArrowRight size={20} />
                    </button>
                    <div className="text-center flex-1">
                        <h1 className="text-2xl font-bold flex items-center justify-center gap-2">
                            <Sparkles size={24} />
                            مجلة العروض
                        </h1>
                        <p className="text-sm text-white/90 mt-1">عروض خاصة ومميزة</p>
                    </div>
                    <div className="w-10" /> {/* Spacer */}
                </div>
            </div>

            {/* Products Grid */}
            <div className="px-4 py-6 max-w-7xl mx-auto">
                {products.length === 0 ? (
                    <div className="text-center py-20">
                        <Tag size={64} className="mx-auto text-gray-300 mb-4" />
                        <h2 className="text-xl font-bold text-gray-800 mb-2">لا توجد عروض حالياً</h2>
                        <p className="text-gray-500">تابعنا لمعرفة العروض الجديدة</p>
                    </div>
                ) : (
                    <>
                        <div className="mb-4">
                            <p className="text-gray-600">
                                <span className="font-bold text-orange-600">{products.length}</span> عرض متاح
                            </p>
                        </div>
                        
                        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-3 md:gap-4">
                            {products.map((product) => (
                                <ProductCard key={product.id} product={product} />
                            ))}
                        </div>
                    </>
                )}
            </div>
        </div>
    );
};

export default SpecialOffersPage;
