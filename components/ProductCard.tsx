import React from 'react';
import { Plus, Heart } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useCart } from '../context/CartContext';
import { useFavorites } from '../context/FavoritesContext';

import { Product } from '../types';

interface ProductCardProps {
  product: Product;
  variant?: 'vertical' | 'horizontal';
  available?: boolean;
}

const ProductCard: React.FC<ProductCardProps> = ({ product, variant = 'vertical', available = true }) => {
  const { id, name: title, weight, price, image, discount_price, originalPrice } = product;
  const navigate = useNavigate();
  const { addToCart } = useCart();
  const { isFavorite, toggleFavorite } = useFavorites();

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
    addToCart(product);
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
      className="bg-white p-3 rounded-2xl shadow-sm border border-gray-50 flex flex-col relative h-full cursor-pointer hover:shadow-md transition-shadow"
    >
      <button
        onClick={handleToggleFavorite}
        className={`absolute top-3 right-3 z-10 p-1.5 rounded-full transition-colors ${isFav ? 'text-red-500 bg-red-50' : 'text-gray-400 hover:text-red-500 hover:bg-gray-50'}`}
      >
        <Heart size={18} fill={isFav ? "currentColor" : "none"} />
      </button>

      {/* Discount Badge */}
      {hasDiscount && (
        <span className="absolute top-3 left-3 z-10 text-xs bg-red-500 text-white px-2 py-1 rounded-full font-bold">
          خصم {discountPercent}%
        </span>
      )}

      <div className="w-full h-32 bg-gray-50 rounded-xl mb-3 p-4 flex items-center justify-center relative">
        {!available && (
          <span className="absolute top-2 left-2 text-xs bg-red-100 text-red-700 px-2 py-1 rounded-md">غير متوفر</span>
        )}
        <img src={image || "https://placehold.co/150x150?text=Product"} alt={title} className="w-full h-full object-contain mix-blend-multiply" />
      </div>

      <div className="flex-grow flex flex-col">
        {weight && <p className="text-xs text-gray-500 mb-1">{weight}</p>}
        <h4 className="text-sm font-medium text-gray-900 line-clamp-2 mb-2 flex-grow">{title}</h4>

        <div className="flex justify-between items-end mt-auto">
          <div className="flex flex-col">
            {hasDiscount && (
              <span className="text-xs text-gray-400 line-through">{priceBeforeDiscount.toFixed(2)} EGP</span>
            )}
            <span className="font-bold text-lg text-gray-900">{currentPrice.toFixed(2)} <span className="text-xs font-normal text-gray-500">EGP</span></span>
            {product.isWeighted && (
              <span className="text-[10px] text-orange-600 font-medium">سعر تقديري ±5%</span>
            )}
          </div>
          <button
            onClick={handleAddToCart}
            className={`w-8 h-8 rounded-full flex items-center justify-center shadow-sm transition-colors z-10 ${available ? 'bg-primary text-white hover:bg-primary-dark' : 'bg-gray-200 text-gray-400 cursor-not-allowed'}`}
            disabled={!available}
          >
            <Plus size={20} />
          </button>
        </div>
      </div>
    </div>
  );
};

export default ProductCard;
