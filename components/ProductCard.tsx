import React, { useState } from 'react';
import { Plus, Heart, Check, Minus, ShoppingCart, Star } from 'lucide-react';
import { useNavigate, Link } from 'react-router-dom';
import { useCart } from '../context/CartContext';
import { useFavorites } from '../context/FavoritesContext';
import { useLanguage } from '../context/LanguageContext';
import { useLocalization } from '../utils/localization';

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
  const { t } = useLanguage();
  const { getProductName, formatPrice } = useLocalization();
  const [isAdding, setIsAdding] = useState(false);

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
  const frameOverlayUrl = (product as any).fo || (product as any).frame_overlay_url; // API returns 'fo' (shortened)
  const frameEnabledValue = (product as any).frame_enabled;
  const isFrameEnabled = Boolean(frameOverlayUrl) && (
    frameEnabledValue === true ||
    frameEnabledValue === 'true' ||
    frameEnabledValue === 't' ||
    frameEnabledValue === 1 ||
    frameEnabledValue === '1'
  );

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
        className="flex items-center p-3 bg-white rounded-xl shadow-sm hover:shadow-md transition-shadow border border-gray-100 space-x-3 cursor-pointer"
      >
        <div className="w-20 h-20 flex-shrink-0 bg-white rounded-lg p-2 relative shadow-sm">
          {hasDiscount && (
            <span className="absolute -top-1 -right-1 text-[10px] bg-red-500 text-white px-1.5 py-0.5 rounded-full font-bold z-10">
              -{discountPercent}%
            </span>
          )}
          <img
            src={image || "https://placehold.co/100x100?text=Product"}
            alt={title}
            loading="lazy"
            decoding="async"
            className="w-full h-full object-contain mix-blend-multiply"
          />
          {isFrameEnabled && (
            <img
              src={frameOverlayUrl}
              alt=""
              aria-hidden="true"
              className="absolute inset-0 w-full h-full object-contain pointer-events-none"
            />
          )}
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
      {/* Image Container - Square with white background and shadow */}
      <div className="relative w-full aspect-square bg-white rounded-xl overflow-hidden mb-1.5 shadow-sm hover:shadow-md transition-shadow">
        {/* Favorite Button */}
        <button
          onClick={handleToggleFavorite}
          className={`absolute top-1.5 right-1.5 z-10 p-1 rounded-full transition-colors ${isFav ? 'text-red-500 bg-white shadow-sm' : 'text-gray-400 bg-white/80 hover:text-red-500'}`}
        >
          <Heart size={14} fill={isFav ? "currentColor" : "none"} />
        </button>

        {/* Discount Badge */}
        {hasDiscount && (
          <span className="absolute top-1.5 left-1.5 z-10 text-[9px] bg-red-500 text-white px-1 py-0.5 rounded-md font-bold">
            -{discountPercent}%
          </span>
        )}

        {/* Out of Stock Badge */}
        {!available && (
          <div className="absolute inset-0 bg-black/40 flex items-center justify-center z-10">
            <span className="text-xs bg-white text-gray-700 px-3 py-1 rounded-full font-medium">{t('product.outOfStock')}</span>
          </div>
        )}

        {/* Product Image - Lazy Loaded */}
        <div className="relative w-full h-full p-2 flex items-center justify-center">
          <img
            src={image || "https://placehold.co/150x150?text=Product"}
            alt={title}
            loading="lazy"
            decoding="async"
            className="w-full h-full object-contain group-hover:scale-105 transition-transform duration-300"
          />
          {isFrameEnabled && (
            <img
              src={frameOverlayUrl}
              alt=""
              aria-hidden="true"
              className="absolute inset-0 w-full h-full object-contain pointer-events-none"
            />
          )}
        </div>

        {/* Quick Add Button */}
        {available && quantityInCart === 0 && (
          <button
            onClick={handleAddToCart}
            className={`absolute bottom-1.5 right-1.5 w-7 h-7 rounded-full flex items-center justify-center shadow-md transition-all z-10 ${isAdding
                ? 'bg-green-500 text-white scale-110'
                : 'bg-orange-500 text-white hover:bg-orange-600'
              }`}
          >
            {isAdding ? <Check size={14} /> : <Plus size={16} strokeWidth={2.5} />}
          </button>
        )}

        {/* Quantity Controls */}
        {available && quantityInCart > 0 && (
          <div className="absolute bottom-1.5 right-1.5 flex items-center bg-white rounded-full shadow-md z-10">
            <button
              onClick={handleDecrement}
              className="w-6 h-6 flex items-center justify-center text-orange-500 hover:bg-gray-50 rounded-full transition-colors"
            >
              <Minus size={12} />
            </button>
            <span className="w-5 text-center font-bold text-gray-900 text-[10px]">{quantityInCart}</span>
            <button
              onClick={handleIncrement}
              className="w-6 h-6 flex items-center justify-center text-white bg-orange-500 hover:bg-orange-600 rounded-full transition-colors"
            >
              <Plus size={12} />
            </button>
          </div>
        )}
      </div>

      {/* Product Info */}
      <div className="px-1 py-1.5">
        {/* البراند - tag صغير */}
        {((product as any).brand_name || (product as any).brand_name_ar) && (
          <Link
            to={`/brands/${(product as any).brand_id}`}
            onClick={(e) => e.stopPropagation()}
            className="inline-block mb-1"
          >
            <span className="text-[10px] bg-orange-100 text-orange-700 px-2 py-0.5 rounded-full font-medium hover:bg-orange-200 transition-colors">
              🏷️ {(product as any).brand_name || (product as any).brand_name_ar}
            </span>
          </Link>
        )}

        {/* اسم المنتج - واضح وبارز */}
        <h4 className="text-sm font-bold text-gray-900 line-clamp-2 mb-1.5 leading-snug min-h-[2.5rem]">
          {getProductName(product)}
        </h4>

        {/* الوزن/الحجم */}
        {weight && (
          <p className="text-xs text-gray-500 mb-1">{weight}</p>
        )}

        {/* التقييم - إذا كان موجوداً */}
        {product.rating > 0 && (
          <div className="flex items-center gap-1 mb-1.5">
            <div className="flex items-center">
              <Star size={12} className="text-yellow-400 fill-yellow-400" />
              <span className="text-xs font-medium text-gray-700 ml-0.5">{product.rating.toFixed(1)}</span>
            </div>
            {product.reviews > 0 && (
              <span className="text-[10px] text-gray-500">({product.reviews})</span>
            )}
          </div>
        )}

        {/* الموقع */}
        {product.shelf_location && (
          <p className="text-[10px] text-orange-500 mb-1.5 flex items-center gap-0.5">
            📍 {product.shelf_location}
          </p>
        )}

        {/* السعر */}
        <div className="mt-auto">
          <div className="flex items-center gap-1.5 flex-wrap">
            <span className="font-bold text-base text-gray-900">{currentPrice.toFixed(2)}</span>
            <span className="text-xs text-gray-500">{t('common.currency')}</span>
            <span className="text-[10px] text-gray-600 bg-gray-100 px-2 py-0.5 rounded-full">{t('product.vatIncluded')}</span>
            {hasDiscount && (
              <span className="text-xs text-gray-400 line-through">{priceBeforeDiscount.toFixed(2)}</span>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProductCard;
