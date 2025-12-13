import React, { useState } from 'react';
import { X, Plus, Minus, ShoppingCart, Star, Package, Tag, Clock } from 'lucide-react';
import { Product } from '../types';
import { useCart } from '../context/CartContext';

interface ProductModalProps {
    product: Product;
    onClose: () => void;
}

const ProductModal: React.FC<ProductModalProps> = ({ product, onClose }) => {
    const [quantity, setQuantity] = useState(1);
    const [isAdding, setIsAdding] = useState(false);
    const { addToCart } = useCart();

    const handleAddToCart = async () => {
        setIsAdding(true);
        try {
            await addToCart(product, quantity);
            // Show success animation
            setTimeout(() => {
                onClose();
            }, 800);
        } catch (error) {
            console.error('Error adding to cart:', error);
            alert('حدث خطأ في إضافة المنتج');
        } finally {
            setIsAdding(false);
        }
    };

    const incrementQuantity = () => setQuantity(q => q + 1);
    const decrementQuantity = () => setQuantity(q => (q > 1 ? q - 1 : 1));

    const hasDiscount = product.discount_price && product.discount_price < product.price;
    const finalPrice = hasDiscount ? product.discount_price : product.price;
    const discountPercent = hasDiscount 
        ? Math.round(((product.price - product.discount_price!) / product.price) * 100)
        : 0;

    return (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4 animate-fadeIn">
            <div className="bg-white rounded-3xl shadow-2xl max-w-lg w-full max-h-[90vh] overflow-y-auto animate-slideUp">
                {/* Header */}
                <div className="relative">
                    <button
                        onClick={onClose}
                        className="absolute top-4 right-4 z-10 p-2 bg-white/90 backdrop-blur-sm hover:bg-white rounded-full shadow-lg transition-all hover:scale-110"
                    >
                        <X size={24} className="text-gray-700" />
                    </button>

                    {/* Product Image */}
                    <div className="relative h-64 bg-gradient-to-br from-gray-100 to-gray-200">
                        <img
                            src={product.image}
                            alt={product.name}
                            className="w-full h-full object-contain p-4"
                            onError={(e) => {
                                e.currentTarget.src = 'https://placehold.co/400x400?text=No+Image';
                            }}
                        />
                        {hasDiscount && (
                            <div className="absolute top-4 left-4 bg-red-500 text-white px-3 py-1 rounded-full font-bold text-sm shadow-lg">
                                خصم {discountPercent}%
                            </div>
                        )}
                        {product.is_new && (
                            <div className="absolute top-4 left-4 bg-green-500 text-white px-3 py-1 rounded-full font-bold text-sm shadow-lg">
                                🎉 جديد
                            </div>
                        )}
                    </div>
                </div>

                {/* Content */}
                <div className="p-6 space-y-4">
                    {/* Product Name */}
                    <div>
                        <h2 className="text-2xl font-bold text-gray-900 mb-2">{product.name}</h2>
                        {product.category && (
                            <div className="flex items-center gap-2 text-sm text-gray-600">
                                <Tag size={16} />
                                <span>{product.category}</span>
                                {product.subcategory && (
                                    <>
                                        <span>•</span>
                                        <span>{product.subcategory}</span>
                                    </>
                                )}
                            </div>
                        )}
                    </div>

                    {/* Rating */}
                    {product.rating > 0 && (
                        <div className="flex items-center gap-2">
                            <div className="flex">
                                {[...Array(5)].map((_, i) => (
                                    <Star
                                        key={i}
                                        size={18}
                                        className={i < Math.floor(product.rating) ? 'fill-yellow-400 text-yellow-400' : 'text-gray-300'}
                                    />
                                ))}
                            </div>
                            <span className="text-sm text-gray-600">
                                {product.rating.toFixed(1)} ({product.reviews || 0} تقييم)
                            </span>
                        </div>
                    )}

                    {/* Product Info */}
                    <div className="grid grid-cols-2 gap-3">
                        {product.weight && (
                            <div className="bg-gray-50 rounded-xl p-3">
                                <div className="flex items-center gap-2 text-gray-600 mb-1">
                                    <Package size={16} />
                                    <span className="text-xs font-medium">الحجم</span>
                                </div>
                                <p className="text-sm font-bold text-gray-900">{product.weight}</p>
                            </div>
                        )}
                        {product.barcode && (
                            <div className="bg-gray-50 rounded-xl p-3">
                                <div className="flex items-center gap-2 text-gray-600 mb-1">
                                    <Tag size={16} />
                                    <span className="text-xs font-medium">الباركود</span>
                                </div>
                                <p className="text-xs font-mono font-bold text-gray-900">{product.barcode}</p>
                            </div>
                        )}
                        {product.expiry_date && (
                            <div className="bg-gray-50 rounded-xl p-3 col-span-2">
                                <div className="flex items-center gap-2 text-gray-600 mb-1">
                                    <Clock size={16} />
                                    <span className="text-xs font-medium">تاريخ الانتهاء</span>
                                </div>
                                <p className="text-sm font-bold text-gray-900">
                                    {new Date(product.expiry_date).toLocaleDateString('ar-EG')}
                                </p>
                            </div>
                        )}
                    </div>

                    {/* Stock Status */}
                    <div className={`p-3 rounded-xl ${product.stock_quantity > 10 ? 'bg-green-50' : product.stock_quantity > 0 ? 'bg-yellow-50' : 'bg-red-50'}`}>
                        <p className={`text-sm font-medium ${product.stock_quantity > 10 ? 'text-green-700' : product.stock_quantity > 0 ? 'text-yellow-700' : 'text-red-700'}`}>
                            {product.stock_quantity > 10 
                                ? '✅ متوفر' 
                                : product.stock_quantity > 0 
                                    ? `⚠️ متبقي ${product.stock_quantity} فقط` 
                                    : '❌ غير متوفر'}
                        </p>
                    </div>

                    {/* Price */}
                    <div className="bg-gradient-to-r from-brand-orange/10 to-orange-100 rounded-2xl p-4">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm text-gray-600 mb-1">السعر</p>
                                <div className="flex items-baseline gap-2">
                                    <span className="text-3xl font-bold text-brand-orange">
                                        {finalPrice.toFixed(2)} جنيه
                                    </span>
                                    {hasDiscount && (
                                        <span className="text-lg text-gray-500 line-through">
                                            {product.price.toFixed(2)}
                                        </span>
                                    )}
                                </div>
                            </div>
                            {hasDiscount && (
                                <div className="bg-red-500 text-white px-3 py-2 rounded-xl">
                                    <p className="text-xs">توفر</p>
                                    <p className="text-lg font-bold">
                                        {(product.price - product.discount_price!).toFixed(2)} جنيه
                                    </p>
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Quantity Selector */}
                    <div className="flex items-center justify-between bg-gray-50 rounded-2xl p-4">
                        <span className="text-gray-700 font-medium">الكمية</span>
                        <div className="flex items-center gap-4">
                            <button
                                onClick={decrementQuantity}
                                className="w-10 h-10 rounded-full bg-white shadow-md hover:shadow-lg transition-all flex items-center justify-center text-gray-700 hover:text-brand-orange disabled:opacity-50"
                                disabled={quantity <= 1}
                            >
                                <Minus size={20} />
                            </button>
                            <span className="text-2xl font-bold text-gray-900 w-12 text-center">
                                {quantity}
                            </span>
                            <button
                                onClick={incrementQuantity}
                                className="w-10 h-10 rounded-full bg-white shadow-md hover:shadow-lg transition-all flex items-center justify-center text-gray-700 hover:text-brand-orange disabled:opacity-50"
                                disabled={quantity >= (product.stock_quantity || 0)}
                            >
                                <Plus size={20} />
                            </button>
                        </div>
                    </div>

                    {/* Total */}
                    <div className="bg-gray-900 text-white rounded-2xl p-4">
                        <div className="flex items-center justify-between">
                            <span className="text-lg">الإجمالي</span>
                            <span className="text-2xl font-bold">
                                {(finalPrice * quantity).toFixed(2)} جنيه
                            </span>
                        </div>
                    </div>

                    {/* Add to Cart Button */}
                    <button
                        onClick={handleAddToCart}
                        disabled={isAdding || product.stock_quantity <= 0}
                        className={`w-full py-4 rounded-2xl font-bold text-lg transition-all flex items-center justify-center gap-3 ${
                            isAdding
                                ? 'bg-green-500 text-white'
                                : product.stock_quantity <= 0
                                    ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                                    : 'bg-gradient-to-r from-brand-orange to-orange-600 hover:from-orange-600 hover:to-brand-orange text-white shadow-lg hover:shadow-xl'
                        }`}
                    >
                        {isAdding ? (
                            <>
                                <div className="animate-spin rounded-full h-6 w-6 border-2 border-white border-t-transparent"></div>
                                <span>جاري الإضافة...</span>
                            </>
                        ) : product.stock_quantity <= 0 ? (
                            <span>غير متوفر</span>
                        ) : (
                            <>
                                <ShoppingCart size={24} />
                                <span>أضف إلى السلة</span>
                            </>
                        )}
                    </button>
                </div>
            </div>
        </div>
    );
};

export default ProductModal;
