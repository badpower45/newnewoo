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

    if (!product) {
        return null;
    }

    const incrementQuantity = () => setQuantity(q => q + 1);
    const decrementQuantity = () => setQuantity(q => (q > 1 ? q - 1 : 1));

    const productPrice = Number(product.price) || 0;
    const productDiscountPrice = Number(product.discount_price) || 0;
    const hasDiscount = productDiscountPrice > 0 && productDiscountPrice < productPrice;
    const finalPrice = hasDiscount ? productDiscountPrice : productPrice;
    const discountPercent = hasDiscount
        ? Math.round(((productPrice - productDiscountPrice) / productPrice) * 100)
        : 0;
    const stockQty = Number(product.stock_quantity) || 0;

    const handleAddToCart = async () => {
        if (stockQty <= 0 || finalPrice <= 0) return;
        setIsAdding(true);
        try {
            await addToCart(product, quantity);
            onClose();
        } catch (error) {
            console.error('Error adding to cart:', error);
            alert('حدث خطأ في إضافة المنتج');
        } finally {
            setIsAdding(false);
        }
    };

    const infoChips: Array<{ label: string; icon: React.ReactNode }> = [];
    if (product.weight) infoChips.push({ label: product.weight, icon: <Package size={14} /> });
    if (product.barcode) infoChips.push({ label: product.barcode, icon: <Tag size={14} /> });
    if (product.expiry_date) infoChips.push({
        label: new Date(product.expiry_date).toLocaleDateString('ar-EG'),
        icon: <Clock size={14} />
    });
    if (product.rating > 0) infoChips.push({
        label: `${product.rating.toFixed(1)} (${product.reviews || 0})`,
        icon: <Star size={14} className="text-yellow-500 fill-yellow-500" />
    });

    return (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
            <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md overflow-hidden">
                {/* Header + Image */}
                <div className="relative h-48 bg-gray-50">
                    <button
                        onClick={onClose}
                        className="absolute top-3 right-3 z-10 p-2 bg-white/90 rounded-full shadow hover:shadow-md transition"
                    >
                        <X size={22} className="text-gray-700" />
                    </button>
                    <img
                        src={product.image}
                        alt={product.name}
                        className="w-full h-full object-contain p-6"
                        onError={(e) => {
                            e.currentTarget.src = 'https://placehold.co/400x400?text=No+Image';
                        }}
                    />
                    <div className="absolute top-3 left-3 flex gap-2">
                        {hasDiscount && (
                            <span className="px-3 py-1 rounded-full bg-red-500 text-white text-xs font-bold shadow">
                                خصم {discountPercent}%
                            </span>
                        )}
                        {product.is_new && (
                            <span className="px-3 py-1 rounded-full bg-green-500 text-white text-xs font-bold shadow">
                                جديد
                            </span>
                        )}
                    </div>
                </div>

                {/* Body */}
                <div className="p-4 space-y-4">
                    <div className="space-y-1">
                        <h2 className="text-xl font-bold text-gray-900">{product.name}</h2>
                        {(product.category || product.subcategory) && (
                            <div className="flex flex-wrap items-center gap-2 text-xs text-gray-600">
                                <Tag size={14} />
                                {product.category && <span className="px-2 py-1 rounded-full bg-gray-100 text-gray-700">{product.category}</span>}
                                {product.subcategory && <span className="px-2 py-1 rounded-full bg-gray-100 text-gray-700">{product.subcategory}</span>}
                            </div>
                        )}
                    </div>

                    {/* Price & Stock */}
                    <div className="grid grid-cols-2 gap-3">
                        <div className="border rounded-xl p-3 space-y-1">
                            <p className="text-xs text-gray-500">السعر</p>
                            {finalPrice > 0 ? (
                                <div className="flex items-baseline gap-2">
                                    <span className="text-2xl font-bold text-brand-orange">{finalPrice.toFixed(2)}</span>
                                    <span className="text-sm text-gray-500">جنيه</span>
                                    {hasDiscount && (
                                        <span className="text-xs text-gray-400 line-through">{productPrice.toFixed(2)}</span>
                                    )}
                                </div>
                            ) : (
                                <p className="text-sm text-red-600 font-semibold">غير متوفر</p>
                            )}
                        </div>
                        <div
                            className={`border rounded-xl p-3 text-sm font-semibold ${
                                stockQty > 10 ? 'text-green-700 bg-green-50' : stockQty > 0 ? 'text-yellow-700 bg-yellow-50' : 'text-red-700 bg-red-50'
                            }`}
                        >
                            {stockQty > 10 ? 'متوفر' : stockQty > 0 ? `متبقي ${stockQty}` : 'غير متوفر'}
                        </div>
                    </div>

                    {/* Info chips */}
                    {infoChips.length > 0 && (
                        <div className="flex flex-wrap gap-2">
                            {infoChips.map((chip, idx) => (
                                <span key={idx} className="px-3 py-1 rounded-full bg-gray-100 text-gray-700 text-xs flex items-center gap-1">
                                    {chip.icon} {chip.label}
                                </span>
                            ))}
                        </div>
                    )}

                    {/* Quantity */}
                    <div className="flex items-center justify-between border rounded-xl p-3">
                        <span className="text-gray-700 font-medium">الكمية</span>
                        <div className="flex items-center gap-3">
                            <button
                                onClick={decrementQuantity}
                                className="w-9 h-9 rounded-full border border-gray-200 flex items-center justify-center hover:border-brand-orange transition disabled:opacity-50"
                                disabled={quantity <= 1}
                            >
                                <Minus size={18} />
                            </button>
                            <span className="text-lg font-bold w-10 text-center">{quantity}</span>
                            <button
                                onClick={incrementQuantity}
                                className="w-9 h-9 rounded-full border border-gray-200 flex items-center justify-center hover:border-brand-orange transition disabled:opacity-50"
                                disabled={quantity >= stockQty}
                            >
                                <Plus size={18} />
                            </button>
                        </div>
                    </div>

                    {/* Total */}
                    {finalPrice > 0 && (
                        <div className="flex items-center justify-between bg-gray-900 text-white rounded-xl p-3">
                            <span className="text-base">الإجمالي</span>
                            <span className="text-2xl font-bold">{(finalPrice * quantity).toFixed(2)} جنيه</span>
                        </div>
                    )}

                    {/* Actions */}
                    <div className="flex gap-3">
                        <button
                            onClick={onClose}
                            className="flex-1 px-4 py-3 rounded-xl border border-gray-200 text-gray-700 font-semibold hover:bg-gray-50 transition"
                        >
                            إغلاق
                        </button>
                        <button
                            onClick={handleAddToCart}
                            disabled={isAdding || finalPrice === 0 || stockQty === 0}
                            className="flex-1 px-4 py-3 rounded-xl bg-brand-orange text-white font-bold hover:bg-orange-600 transition disabled:opacity-60 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                        >
                            {isAdding ? 'جارٍ الإضافة...' : (
                                <>
                                    <ShoppingCart size={18} />
                                    <span>أضف للسلة</span>
                                </>
                            )}
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ProductModal;
