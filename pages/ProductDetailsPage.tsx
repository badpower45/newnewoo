import React from 'react';
import { ChevronLeft, Heart, Share2, Star, Minus, Plus, ShoppingCart } from 'lucide-react';
import { useNavigate, useParams } from 'react-router-dom';
import { PRODUCTS } from '../data/mockData';

const ProductDetailsPage = () => {
    const navigate = useNavigate();
    const { id } = useParams();
    const product = PRODUCTS.find(p => p.id === Number(id)) || PRODUCTS[0];

    return (
        <div className="bg-white min-h-screen pb-24 md:pb-8">
            {/* Mobile Header */}
            <div className="flex justify-between items-center p-4 sticky top-0 bg-white z-40 md:hidden">
                <button onClick={() => navigate(-1)} className="p-2 -ml-2 text-gray-800">
                    <ChevronLeft size={28} />
                </button>
                <div className="flex space-x-2">
                    <button className="p-2 text-gray-800">
                        <Share2 size={24} />
                    </button>
                    <button className="p-2 text-gray-800">
                        <Heart size={24} />
                    </button>
                </div>
            </div>

            <div className="max-w-7xl mx-auto md:py-12 md:px-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8 lg:gap-16">
                    {/* Product Image */}
                    <div className="w-full h-72 md:h-96 bg-gray-50 flex items-center justify-center p-8 rounded-3xl">
                        <img
                            src={product.image}
                            alt={product.title}
                            className="w-full h-full object-contain mix-blend-multiply"
                        />
                    </div>

                    {/* Product Info */}
                    <div className="px-4 md:px-0 flex flex-col justify-center">
                        <div className="flex justify-between items-start mb-2">
                            <h1 className="text-2xl md:text-4xl font-bold text-gray-900 leading-tight max-w-[80%]">{product.title}</h1>
                            <div className="flex flex-col items-end md:hidden">
                                <span className="text-2xl font-bold text-primary">{product.price.toFixed(2)}</span>
                                <span className="text-sm text-gray-500">EGP</span>
                            </div>
                        </div>

                        <div className="flex items-center space-x-2 mb-6">
                            <span className="bg-orange-100 text-orange-700 text-xs font-bold px-2 py-1 rounded-md">{product.weight}</span>
                            <div className="flex items-center text-yellow-500">
                                <Star size={14} fill="currentColor" />
                                <span className="text-xs text-gray-500 ml-1">4.8 (120 reviews)</span>
                            </div>
                        </div>

                        <p className="text-gray-600 text-sm md:text-base leading-relaxed mb-8">
                            Enjoy the fresh taste of {product.title}. Premium quality, perfect for your daily needs.
                            Sourced directly from the best suppliers to ensure freshness and taste.
                        </p>

                        {/* Desktop Price */}
                        <div className="hidden md:block mb-8">
                            <span className="text-4xl font-bold text-primary">{product.price.toFixed(2)} <span className="text-lg text-gray-500 font-normal">EGP</span></span>
                        </div>

                        {/* Quantity & Add to Cart */}
                        <div className="flex items-center space-x-4 mb-8">
                            <div className="flex items-center bg-gray-100 rounded-xl p-1">
                                <button className="w-10 h-10 md:w-12 md:h-12 flex items-center justify-center text-gray-600 hover:bg-white rounded-lg transition-colors">
                                    <Minus size={20} />
                                </button>
                                <span className="w-12 text-center font-bold text-gray-900">1</span>
                                <button className="w-10 h-10 md:w-12 md:h-12 flex items-center justify-center text-gray-600 hover:bg-white rounded-lg transition-colors">
                                    <Plus size={20} />
                                </button>
                            </div>
                            <button className="flex-grow bg-primary text-white font-bold py-4 rounded-xl shadow-lg hover:bg-primary-dark transition-colors flex items-center justify-center space-x-2">
                                <ShoppingCart size={20} />
                                <span>Add to Cart</span>
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ProductDetailsPage;
