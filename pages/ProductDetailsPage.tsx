import React, { useState } from 'react';
import { ChevronLeft, Heart, Share2, Star, Minus, Plus, ShoppingCart } from 'lucide-react';
import { useNavigate, useParams } from 'react-router-dom';
import { api } from '../services/api';
import { Product } from '../types';
import { useCart } from '../context/CartContext';
import { useBranch } from '../context/BranchContext';

const ProductDetailsPage = () => {
    const navigate = useNavigate();
    const { id } = useParams();
    const [product, setProduct] = useState<Product | null>(null);
    const { addToCart } = useCart();
    const [quantity, setQuantity] = useState(1);
    const { selectedBranch } = useBranch();
    const [available, setAvailable] = useState<boolean>(true);

    React.useEffect(() => {
        const load = async () => {
            if (!id) return;
            try {
                const data = await api.products.getOne(id);
                if (data.data) {
                    setProduct(data.data);
                }
            } catch (e) {
                // Backend unavailable; show fallback in UI
                setProduct({
                    id: id,
                    name: 'Product Unavailable',
                    category: 'Unknown',
                    price: 0,
                    rating: 0,
                    reviews: 0,
                    image: 'https://placehold.co/600x600?text=Product',
                    weight: 'N/A'
                });
            }
        };
        load();
    }, [id]);

    React.useEffect(() => {
        const loadBranch = async () => {
            if (!id || !selectedBranch) return;
            try {
                const res = await api.branchProducts.getByBranch(selectedBranch.id);
                const list = res.data || res || [];
                const pid = Number(id);
                const bp = list.find((x: any) => (x.product_id ?? x.productId ?? x.id) == pid);
                if (bp) {
                    const bPrice = bp.branch_price ?? bp.branchPrice;
                    if (product && typeof bPrice === 'number') {
                        setProduct({ ...product, price: bPrice });
                    }
                    const stock = bp.available_quantity ?? bp.stock_quantity ?? bp.stockQuantity;
                    const reserved = bp.reserved_quantity ?? bp.reservedQuantity ?? 0;
                    if (typeof stock === 'number') {
                        setAvailable((stock - reserved) > 0);
                    }
                } else {
                    setAvailable(true);
                }
            } catch (e) {
                console.error('Failed to load branch product', e);
            }
        };
        loadBranch();
    }, [id, selectedBranch, product?.id]);

    if (!product) return <div className="min-h-screen flex items-center justify-center">Loading...</div>;

    const handleIncrement = () => setQuantity(q => q + 1);
    const handleDecrement = () => setQuantity(q => (q > 1 ? q - 1 : 1));

    const handleAddToCart = () => {
        if (!available) return;
        addToCart(product, quantity);
        // Optional: Show feedback
    };

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
                            alt={product.name}
                            className="w-full h-full object-contain mix-blend-multiply"
                        />
                    </div>

                    {/* Product Info */}
                    <div className="px-4 md:px-0 flex flex-col justify-center">
                        <div className="flex justify-between items-start mb-2">
                            <h1 className="text-2xl md:text-4xl font-bold text-gray-900 leading-tight max-w-[80%]">{product.name}</h1>
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
                            Enjoy the fresh taste of {product.name}. Premium quality, perfect for your daily needs.
                            Sourced directly from the best suppliers to ensure freshness and taste.
                        </p>

                        {/* Desktop Price */}
                        <div className="hidden md:block mb-8">
                            <span className="text-4xl font-bold text-primary">{product.price.toFixed(2)} <span className="text-lg text-gray-500 font-normal">EGP</span></span>
                            {!available && (
                                <span className="ml-3 text-sm bg-red-100 text-red-700 px-2 py-1 rounded-md align-middle">غير متوفر</span>
                            )}
                        </div>

                        {/* Quantity & Add to Cart */}
                        <div className="flex items-center space-x-4 mb-8">
                            <div className="flex items-center bg-gray-100 rounded-xl p-1">
                                <button
                                    onClick={handleDecrement}
                                    className="w-10 h-10 md:w-12 md:h-12 flex items-center justify-center text-gray-600 hover:bg-white rounded-lg transition-colors"
                                >
                                    <Minus size={20} />
                                </button>
                                <span className="w-12 text-center font-bold text-gray-900">{quantity}</span>
                                <button
                                    onClick={handleIncrement}
                                    className="w-10 h-10 md:w-12 md:h-12 flex items-center justify-center text-gray-600 hover:bg-white rounded-lg transition-colors"
                                >
                                    <Plus size={20} />
                                </button>
                            </div>
                            <button
                                onClick={handleAddToCart}
                                disabled={!available}
                                className={`flex-grow font-bold py-4 rounded-xl shadow-lg transition-colors flex items-center justify-center space-x-2 ${available ? 'bg-primary text-gray-900 hover:bg-primary-dark' : 'bg-gray-200 text-gray-400 cursor-not-allowed'}`}
                            >
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
