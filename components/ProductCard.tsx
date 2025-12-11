import React, { useState } from 'react';
import { Plus, Heart, Check, Minus, ShoppingCart } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useCart } from '../context/CartContext';
import { useFavorites } from '../context/FavoritesContext';
import { useLanguage } from '../context/LanguageContext';

import { Product } from '../types';

interface ProductCardProps {
  product: Product;
  variant?: 'vertical' | 'horizontal';
  available?: boolean;
}

const ProductCard: React.FC<ProductCardProps> = ({ product, variant = 'vertical', available = true }) => {
  const { id, name: title, weight, price, image, discount_price, originalPrice } = product;
  const navigate = useNavigate();
  const { addToCart, items, updateQuantity, removeFromCart } = useCart();
  const { isFavorite, toggleFavorite } = useFavorites();
  const { autoTranslate, language } = useLanguage();
  const [isAdding, setIsAdding] = useState(false);
  
  // Get display name based on language
  const displayName = language === 'ar' 
    ? (product.name_ar || autoTranslate(title)) 
    : (product.name_en || title);

  // Get quantity in cart - safely handle undefined items
  const cartItem = items?.find(item => item.id === id);
  const quantityInCart = cartItem?.quantity || 0;

  // السعر الأصلي (قبل الخصم) - يُخزن في discount_price أو originalPrice
  const priceBeforeDiscount = Number(discount_price) || Number(originalPrice) || 0;
  // السعر الحالي (بعد الخصم)
  const currentPrice = Number(price) || 0;
  // هل يوجد خصم؟
  const hasDiscount = priceBeforeDiscount > 0 && priceBeforeDiscount > currentPrice;
  // نسبة الخصم
  const discountPercent = hasDiscount ? Math.round(((priceBeforeDiscount - currentPrice) / priceBeforeDiscount) * 100) : 0;

  const handleCardClick = () => {
    navigate(`/product/${id}`);
  };

  const handleAddToCart = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (!available) return;
    setIsAdding(true);
    addToCart(product);
    setTimeout(() => setIsAdding(false), 500);
  };

  const handleIncrement = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (!available) return;
    updateQuantity(id, quantityInCart + 1);
  };

  const handleDecrement = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (quantityInCart > 1) {
      updateQuantity(id, quantityInCart - 1);
    } else {
      removeFromCart(id);
    }
  };

  const handleToggleFavorite = (e: React.MouseEvent) => {
    e.stopPropagation();
    toggleFavorite(product);
  };

  const isFav = isFavorite(id);

  if (variant === 'horizontal') {
    return (
      <div
        onClick={handleCardClick}
        className="flex items-center p-3 bg-white rounded-xl shadow-sm border border-gray-50 space-x-3 cursor-pointer hover:shadow-md transition-shadow"
      >
        <div className="w-20 h-20 flex-shrink-0 bg-gray-50 rounded-lg p-2 relative">
          {hasDiscount && (
            <span className="absolute -top-1 -right-1 text-[10px] bg-red-500 text-white px-1.5 py-0.5 rounded-full font-bold">
              -{discountPercent}%
            </span>
          )}
          <img src={image || "https://placehold.co/100x100?text=Product"} alt={title} className="w-full h-full object-contain mix-blend-multiply" />
        </div>
        <div className="flex-grow">
          <h4 className="text-sm font-medium text-gray-900 line-clamp-2 mb-1">{title}</h4>
          {weight && <p className="text-xs text-gray-500 mb-2">{weight}</p>}
          <div className="flex justify-between items-center">
            <div className="flex flex-col">
              {hasDiscount && (
                <span className="text-xs text-gray-400 line-through">{priceBeforeDiscount.toFixed(2)} EGP</span>
              )}
              <span className="font-bold text-gray-900">{currentPrice.toFixed(2)} EGP</span>
            </div>
            <button
              onClick={handleAddToCart}
              className={`p-1.5 rounded-full shadow-sm transition-colors ${available ? 'bg-primary text-white hover:bg-primary-dark' : 'bg-gray-200 text-gray-400 cursor-not-allowed'}`}
              disabled={!available}
            >
              <Plus size={16} />
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div
      onClick={handleCardClick}
      className="flex flex-col relative cursor-pointer group"
    >
      {/* Image Container - Square with beige background */}
      <div className="relative w-full aspect-square bg-[#f5f0e8] rounded-2xl overflow-hidden mb-2">
        {/* Favorite Button */}
        <button
          onClick={handleToggleFavorite}
          className={`absolute top-2 right-2 z-10 p-1.5 rounded-full transition-colors ${isFav ? 'text-red-500 bg-white shadow-sm' : 'text-gray-400 bg-white/80 hover:text-red-500'}`}
        >
          <Heart size={16} fill={isFav ? "currentColor" : "none"} />
        </button>

        {/* Discount Badge */}
        {hasDiscount && (
          <span className="absolute top-2 left-2 z-10 text-[10px] bg-red-500 text-white px-1.5 py-0.5 rounded-md font-bold">
            -{discountPercent}%
          </span>
        )}

        {/* Out of Stock Badge */}
        {!available && (
          <div className="absolute inset-0 bg-black/40 flex items-center justify-center z-10">
            <span className="text-xs bg-white text-gray-700 px-3 py-1 rounded-full font-medium">غير متوفر</span>
          </div>
        )}

        {/* Product Image */}
        <div className="w-full h-full p-4 flex items-center justify-center">
          <img 
            src={image || "https://placehold.co/150x150?text=Product"} 
            alt={displayName} 
            className="w-full h-full object-contain group-hover:scale-105 transition-transform duration-300" 
          />
        </div>
        
        {/* Quick Add Button */}
        {available && quantityInCart === 0 && (
          <button
            onClick={handleAddToCart}
            className={`absolute bottom-2 right-2 w-8 h-8 rounded-full flex items-center justify-center shadow-md transition-all z-10 ${
              isAdding 
                ? 'bg-green-500 text-white scale-110' 
                : 'bg-orange-500 text-white hover:bg-orange-600'
            }`}
          >
            {isAdding ? <Check size={16} /> : <Plus size={18} strokeWidth={2.5} />}
          </button>
        )}

        {/* Quantity Controls */}
        {available && quantityInCart > 0 && (
          <div className="absolute bottom-2 right-2 flex items-center bg-white rounded-full shadow-md z-10">
            <button
              onClick={handleDecrement}
              className="w-7 h-7 flex items-center justify-center text-orange-500 hover:bg-gray-50 rounded-full transition-colors"
            >
              <Minus size={14} />
            </button>
            <span className="w-6 text-center font-bold text-gray-900 text-xs">{quantityInCart}</span>
            <button
              onClick={handleIncrement}
              className="w-7 h-7 flex items-center justify-center text-white bg-orange-500 hover:bg-orange-600 rounded-full transition-colors"
            >
              <Plus size={14} />
            </button>
          </div>
        )}
      </div>

      {/* Product Info */}
      <div className="px-1">
        <h4 className="text-sm font-medium text-gray-800 line-clamp-2 mb-1 leading-tight">{displayName}</h4>
        {weight && <p className="text-xs text-gray-400 mb-0.5">{weight}</p>}
        {product.shelf_location && (
          <p className="text-[10px] text-orange-500 mb-1">
            📍 {product.shelf_location}
          </p>
        )}
        
        <div className="flex items-center gap-2">
          <span className="font-bold text-gray-900">{currentPrice.toFixed(2)}</span>
          <span className="text-xs text-gray-400">ج.م</span>
          {hasDiscount && (
            <span className="text-xs text-gray-400 line-through">{priceBeforeDiscount.toFixed(2)}</span>
          )}
        </div>
      </div>
    </div>
  );
};

export default ProductCard;
