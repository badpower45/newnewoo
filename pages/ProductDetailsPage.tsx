import React, { useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { FRESH_PRODUCTS, PANTRY_PRODUCTS, SNACK_PRODUCTS } from '../constants';
import { useCart } from '../context/CartContext';
import { Star, Minus, Plus, ShoppingCart, ArrowRight } from 'lucide-react';

export default function ProductDetailsPage() {
    const { id } = useParams<{ id: string }>();
    const { addToCart } = useCart();
    const [quantity, setQuantity] = useState(1);

    const allProducts = [...FRESH_PRODUCTS, ...PANTRY_PRODUCTS, ...SNACK_PRODUCTS];
    const product = allProducts.find(p => p.id === id);

    if (!product) {
        return (
            <div className="container mx-auto px-4 py-20 text-center">
                <h2 className="text-2xl font-bold text-slate-800 mb-4">المنتج غير موجود</h2>
                <Link to="/products" className="text-brand-orange hover:underline">العودة للمنتجات</Link>
            </div>
        );
    }

    const handleAddToCart = () => {
        addToCart(product, quantity);
    };

    return (
        <div className="container mx-auto px-4 md:px-6 py-8">
            <Link to="/products" className="inline-flex items-center text-slate-500 hover:text-brand-orange mb-6 transition-colors">
                <ArrowRight size={16} className="ml-1" /> العودة للمنتجات
            </Link>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 md:gap-12">
                {/* Image Section */}
                <div className="bg-white rounded-3xl p-8 shadow-sm border border-slate-100 flex items-center justify-center relative overflow-hidden group">
                    <div className="absolute inset-0 bg-gradient-to-tr from-orange-50 to-transparent opacity-50"></div>
                    <img
                        src={product.image}
                        alt={product.name}
                        className="w-full max-w-md object-contain drop-shadow-xl transform group-hover:scale-105 transition-transform duration-500"
                    />
                    {product.isOrganic && (
                        <span className="absolute top-4 right-4 bg-green-100 text-green-700 text-xs font-bold px-3 py-1 rounded-full">أورجانيك</span>
                    )}
                </div>

                {/* Details Section */}
                <div className="space-y-6">
                    <div>
                        <div className="flex items-center gap-2 mb-2">
                            <span className="text-xs font-bold text-brand-orange bg-orange-50 px-2 py-1 rounded">{product.category}</span>
                            <div className="flex items-center text-yellow-400 text-sm">
                                <Star size={14} fill="currentColor" />
                                <span className="text-slate-600 mr-1 font-medium">{product.rating} ({product.reviews} تقييم)</span>
                            </div>
                        </div>
                        <h1 className="text-3xl md:text-4xl font-extrabold text-brand-brown mb-2">{product.name}</h1>
                        <p className="text-slate-500 text-lg">{product.weight}</p>
                    </div>

                    <div className="flex items-baseline gap-3">
                        <span className="text-3xl font-bold text-brand-orange">{product.price} ج.م</span>
                        {product.originalPrice && (
                            <span className="text-lg text-slate-400 line-through decoration-red-400">{product.originalPrice} ج.م</span>
                        )}
                    </div>

                    <p className="text-slate-600 leading-relaxed">
                        استمتع بأفضل جودة مع {product.name}. يتم اختياره بعناية لضمان الطعم الطازج والقيمة الغذائية العالية. مثالي لوجباتك اليومية ولعائلتك.
                    </p>

                    <div className="border-t border-b border-slate-100 py-6 space-y-6">
                        <div className="flex items-center gap-4">
                            <span className="font-bold text-slate-700">الكمية:</span>
                            <div className="flex items-center bg-slate-50 rounded-full border border-slate-200 px-2">
                                <button
                                    onClick={() => setQuantity(Math.max(1, quantity - 1))}
                                    className="p-2 text-slate-500 hover:text-brand-orange transition-colors"
                                >
                                    <Minus size={18} />
                                </button>
                                <span className="w-8 text-center font-bold text-slate-800">{quantity}</span>
                                <button
                                    onClick={() => setQuantity(quantity + 1)}
                                    className="p-2 text-slate-500 hover:text-brand-orange transition-colors"
                                >
                                    <Plus size={18} />
                                </button>
                            </div>
                        </div>
                    </div>

                    <div className="flex gap-4">
                        <button
                            onClick={handleAddToCart}
                            className="flex-1 bg-brand-brown text-white font-bold py-4 rounded-xl hover:bg-brand-orange transition-colors shadow-lg shadow-orange-200 flex items-center justify-center gap-2"
                        >
                            <ShoppingCart size={20} /> أضف للسلة
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}
