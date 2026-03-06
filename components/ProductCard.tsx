import React, { useState } from 'react';
import { Plus, Heart, Check, Minus, ShoppingCart, Star } from 'lucide-react';
import { useNavigate, Link } from 'react-router-dom';
import { useCart } from '../context/CartContext';
import { useFavorites } from '../context/FavoritesContext';
import { useLanguage } from '../context/LanguageContext';
import { useLocalization } from '../utils/localization';
import { optimizeProductCardImage, optimizeFrameImage } from '../utils/imageOptimization';
import { PRODUCT_PLACEHOLDER_BASE64, FRAME_PLACEHOLDER_BASE64 } from '../utils/inlinePlaceholders';

import { Product } from '../types';

interface ProductCardProps {
  product: Product;
  variant?: 'vertical' | 'horizontal';
  available?: boolean;
}

const ProductCard: React.FC<ProductCardProps> = ({ product, variant = 'vertical', available = true }) => {
  // Handle both full and shortened field names from API
  const { 
    id, 
    name: fullName, 
    na: shortName,
    weight, 
    price: fullPrice,
    p: shortPrice,
    image: fullImage,
    i: shortImage,
    discount_price: fullDiscountPrice,
    dp: shortDiscountPrice,
    originalPrice 
  } = product as any;
  
  // Use shortened names if full names are corrupted or empty
  const title = (fullName && !fullName.startsWith('data:image') && !fullName.startsWith('iVBORw')) 
    ? fullName 
    : (shortName && !shortName.startsWith('data:image') && !shortName.startsWith('iVBORw')) 
      ? shortName 
      : 'منتج';
  
  const productPrice = fullPrice || shortPrice || 0;
  const productImage = fullImage || shortImage;
  const productDiscountPrice = fullDiscountPrice || shortDiscountPrice;
  
  const navigate = useNavigate();
  const { addToCart, items, updateQuantity, removeFromCart } = useCart();
  const { isFavorite, toggleFavorite } = useFavorites();
  const { t } = useLanguage();
  const { getProductName, formatPrice } = useLocalization();
  const [isAdding, setIsAdding] = useState(false);

  // Get quantity in cart - safely handle undefined items
  const cartItem = items?.find(item => item.id === id);
  const quantityInCart = cartItem?.quantity || 0;

  // السعر الأصلي (قبل الخصم) = price (الأكبر)
  // السعر الحالي (بعد الخصم) = discount_price (الأصغر)
  const rawPrice = Number(productPrice) || 0;
  const rawDiscountPrice = Number(productDiscountPrice) || Number(originalPrice) || 0;
  
  // لو في discount_price وأقل من price، يبقى في خصم
  const hasDiscount = rawDiscountPrice > 0 && rawPrice > rawDiscountPrice;
  const priceBeforeDiscount = hasDiscount ? rawPrice : 0;
  const currentPrice = hasDiscount ? rawDiscountPrice : rawPrice;
  // نسبة الخصم
  const discountPercent = hasDiscount ? Math.round(((priceBeforeDiscount - currentPrice) / priceBeforeDiscount) * 100) : 0;
  const frameOverlayUrl = (product as any).fo || (product as any).frame_overlay_url; // API returns 'fo' (shortened)
  const frameEnabledValue = (product as any).frame_enabled || (product as any).fe;
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
            src={optimizeProductCardImage(productImage) || PRODUCT_PLACEHOLDER_BASE64}
            alt={title}
            loading="lazy"
            decoding="async"
            className="w-full h-full object-contain mix-blend-multiply"
          />
          {isFrameEnabled && (
            <img
              src={optimizeFrameImage(frameOverlayUrl)}
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
                <span className="text-xs text-orange-500 line-through font-medium">{priceBeforeDiscount.toFixed(2)} EGP</span>
              )}
              <span className="font-bold text-gray-900">{currentPrice.toFixed(2)} EGP</span>
            </div>
            <button
              onClick={handleAddToCart}
              className={`w-9 h-9 rounded-full flex items-center justify-center transition-all ${available ? 'bg-brand-orange text-white hover:bg-orange-600 active:scale-90 shadow-sm hover:shadow-md' : 'bg-gray-200 text-gray-300 cursor-not-allowed'}`}
              disabled={!available}
            >
              <Plus size={16} strokeWidth={2.5} />
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div
      onClick={handleCardClick}
      className="flex flex-col relative cursor-pointer group bg-white rounded-2xl overflow-hidden shadow-sm hover:shadow-md transition-shadow border border-gray-100"
    >
      {/* Image Container - Portrait Rectangle (3:4 ratio) */}
      <div className="relative w-full aspect-[3/4] bg-gray-50 overflow-hidden">
        {/* Favorite Button */}
        <button
          onClick={handleToggleFavorite}
          className={`absolute top-2 right-2 z-10 w-7 h-7 rounded-full flex items-center justify-center transition-colors shadow-sm ${isFav ? 'text-red-500 bg-white' : 'text-gray-400 bg-white/90 hover:text-red-500'}`}
        >
          <Heart size={14} fill={isFav ? "currentColor" : "none"} />
        </button>

        {/* Discount Badge */}
        {hasDiscount && (
          <span className="absolute top-2 left-2 z-10 text-[9px] bg-red-500 text-white px-1.5 py-0.5 rounded-full font-bold">
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
        <div className="relative w-full h-full p-3 flex items-center justify-center">
          <img
            src={optimizeProductCardImage(productImage) || PRODUCT_PLACEHOLDER_BASE64}
            alt={title}
            loading="lazy"
            decoding="async"
            fetchpriority="low"
            className="w-full h-full object-contain group-hover:scale-105 transition-transform duration-300"
            style={{ 
              contentVisibility: 'auto',
              backgroundColor: '#f9fafb'
            }}
          />
          {isFrameEnabled && (
            <img
              src={optimizeFrameImage(frameOverlayUrl)}
              alt=""
              aria-hidden="true"
              loading="lazy"
              decoding="async"
              fetchpriority="low"
              className="absolute inset-0 w-full h-full object-contain pointer-events-none"
            />
          )}
        </div>
      </div>

      {/* Product Info */}
      <div className="px-2.5 pt-2 pb-2.5 flex flex-col flex-1">
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
        <h4 className="text-sm font-bold text-gray-900 line-clamp-2 mb-1 leading-snug min-h-[2.5rem]">
          {getProductName(product)}
        </h4>

        {/* الوزن/الحجم */}
        {weight && (
          <p className="text-[11px] text-gray-400 mb-1">{weight}</p>
        )}

        {/* التقييم - إذا كان موجوداً */}
        {product.rating > 0 && (
          <div className="flex items-center gap-1 mb-1">
            <Star size={11} className="text-yellow-400 fill-yellow-400" />
            <span className="text-[11px] font-medium text-gray-600">{Number(product.rating).toFixed(1)}</span>
            {product.reviews > 0 && (
              <span className="text-[10px] text-gray-400">({product.reviews})</span>
            )}
          </div>
        )}

        {/* الموقع */}
        {product.shelf_location && (
          <p className="text-[10px] text-orange-500 mb-1 flex items-center gap-0.5">
            📍 {product.shelf_location}
          </p>
        )}

        {/* السعر + زر الإضافة */}
        <div className="mt-auto flex items-center justify-between gap-1 pt-1.5">
          <div className="flex flex-col">
            <div className="flex items-baseline gap-1">
              <span className="font-bold text-base text-gray-900">{currentPrice.toFixed(2)}</span>
              <span className="text-[10px] text-gray-500">{t('common.currency')}</span>
            </div>
            {hasDiscount && (
              <span className="text-[10px] text-gray-400 line-through">{priceBeforeDiscount.toFixed(2)}</span>
            )}
          </div>

          {/* زر إضافة / تحكم بالكمية */}
          {available && quantityInCart === 0 ? (
            <button
              onClick={handleAddToCart}
              className={`w-8 h-8 rounded-full flex items-center justify-center transition-all flex-shrink-0 ${isAdding
                ? 'bg-green-500 text-white scale-110 shadow-md'
                : 'bg-brand-orange text-white hover:bg-orange-600 shadow-sm hover:shadow-md active:scale-90'
                }`}
            >
              {isAdding ? <Check size={14} /> : <Plus size={16} strokeWidth={2.5} />}
            </button>
          ) : available && quantityInCart > 0 ? (
            <div className="flex items-center bg-orange-50 border border-orange-200 rounded-full flex-shrink-0">
              <button
                onClick={handleDecrement}
                className="w-6 h-6 flex items-center justify-center text-orange-500 hover:bg-orange-100 rounded-full transition-colors"
              >
                <Minus size={11} />
              </button>
              <span className="w-5 text-center font-bold text-gray-900 text-[11px]">{quantityInCart}</span>
              <button
                onClick={handleIncrement}
                className="w-6 h-6 flex items-center justify-center text-white bg-orange-500 hover:bg-orange-600 rounded-full transition-colors"
              >
                <Plus size={11} />
              </button>
            </div>
          ) : null}
        </div>
      </div>
    </div>
  );
};

export default ProductCard;
