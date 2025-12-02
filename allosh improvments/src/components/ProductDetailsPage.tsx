import { ArrowRight, Heart, Share2, Star, Plus, Minus, ShoppingCart, CheckCircle2, Clock, Truck, Shield } from 'lucide-react';
import { useState } from 'react';
import { ImageWithFallback } from './figma/ImageWithFallback';

export function ProductDetailsPage({ onBack }: { onBack: () => void }) {
  const [quantity, setQuantity] = useState(1);
  const [isFavorite, setIsFavorite] = useState(false);
  const [selectedSize, setSelectedSize] = useState('1L');

  const product = {
    name: 'المراعي حليب كامل الدسم',
    nameEn: 'Almarai Full Fat Milk',
    price: 48.95,
    oldPrice: 55.00,
    rating: 4.8,
    reviews: 120,
    inStock: true,
    tags: ['1 لتر', 'ألبان', 'طازج'],
    sizes: ['500ml', '1L', '2L'],
    description: 'حليب المراعي الطازج كامل الدسم غني بالفيتامينات والمعادن الأساسية. منتج طبيعي 100% من أجود أنواع الحليب. يحتوي على الكالسيوم والبروتين اللازم لصحة عظامك وأسنانك. مبستر ومعقم بأحدث التقنيات العالمية.'
  };

  const reviews = [
    { id: 1, name: 'أحمد محمد', rating: 5, comment: 'منتج ممتاز وطعمه رائع', date: 'منذ يومين' },
    { id: 2, name: 'فاطمة علي', rating: 4, comment: 'جودة عالية لكن السعر مرتفع قليلاً', date: 'منذ أسبوع' },
    { id: 3, name: 'محمود حسن', rating: 5, comment: 'الحليب المفضل لعائلتي', date: 'منذ أسبوعين' }
  ];

  const relatedProducts = [
    { id: 1, name: 'حليب قليل الدسم', price: '42.00', oldPrice: '50.00', image: 'https://images.unsplash.com/photo-1563636619-e9143da7973b?w=200&h=200&fit=crop', discount: 16 },
    { id: 2, name: 'لبن زبادي', price: '15.50', oldPrice: '20.00', image: 'https://images.unsplash.com/photo-1488477181946-6428a0291777?w=200&h=200&fit=crop', discount: 22 },
    { id: 3, name: 'جبنة بيضاء', price: '35.00', oldPrice: '45.00', image: 'https://images.unsplash.com/photo-1452195100486-9cc805987862?w=200&h=200&fit=crop', discount: 22 },
    { id: 4, name: 'حليب بالشوكولاتة', price: '18.00', oldPrice: '25.00', image: 'https://images.unsplash.com/photo-1563805042-7684c019e1cb?w=200&h=200&fit=crop', discount: 28 }
  ];

  const discountPercentage = Math.round(((product.oldPrice - product.price) / product.oldPrice) * 100);

  return (
    <div className="min-h-screen bg-[#FAFAFA] flex flex-col">
      {/* Top Navigation */}
      <div className="absolute top-0 left-0 right-0 z-10 flex items-center justify-between p-4">
        <button
          onClick={onBack}
          className="w-11 h-11 rounded-full bg-white/95 backdrop-blur-md shadow-lg flex items-center justify-center hover:bg-white transition-all"
        >
          <ArrowRight className="w-5 h-5 text-[#23110C]" />
        </button>
        
        <div className="flex gap-2">
          <button
            onClick={() => setIsFavorite(!isFavorite)}
            className="w-11 h-11 rounded-full bg-white/95 backdrop-blur-md shadow-lg flex items-center justify-center hover:bg-white transition-all"
          >
            <Heart
              className={`w-5 h-5 transition-all ${isFavorite ? 'fill-[#F97316] text-[#F97316] scale-110' : 'text-[#23110C]'}`}
            />
          </button>
          <button className="w-11 h-11 rounded-full bg-white/95 backdrop-blur-md shadow-lg flex items-center justify-center hover:bg-white transition-all">
            <Share2 className="w-5 h-5 text-[#23110C]" />
          </button>
        </div>
      </div>

      {/* Image Area with Gradient */}
      <div className="h-[42vh] bg-gradient-to-br from-[#FFF7ED] to-[#F3F4F6] flex items-center justify-center relative overflow-hidden">
        {/* Decorative circles */}
        <div className="absolute top-10 right-10 w-32 h-32 bg-[#F97316]/5 rounded-full blur-2xl" />
        <div className="absolute bottom-10 left-10 w-40 h-40 bg-[#F97316]/5 rounded-full blur-3xl" />
        
        <ImageWithFallback
          src="https://images.unsplash.com/photo-1563636619-e9143da7973b?w=400&h=400&fit=crop"
          alt={product.name}
          className="w-72 h-72 object-contain relative z-10 drop-shadow-2xl"
        />

        {/* Discount Badge */}
        {discountPercentage > 0 && (
          <div className="absolute top-20 left-4 bg-gradient-to-br from-[#EF4444] to-[#dc2626] text-white px-4 py-2 rounded-full shadow-xl transform -rotate-12">
            <span style={{ fontWeight: 700 }}>وفر {discountPercentage}%</span>
          </div>
        )}
      </div>

      {/* Main Content Container */}
      <div className="flex-1 bg-white rounded-t-[32px] -mt-8 relative shadow-[0_-4px_24px_rgba(0,0,0,0.1)]">
        <div className="px-6 pt-6 pb-32 overflow-y-auto max-h-[calc(100vh-42vh-80px)]">
          {/* Product Title & Stock Status */}
          <div className="mb-4">
            <div className="flex items-start justify-between mb-2">
              <h2 className="flex-1 leading-tight">{product.name}</h2>
              {product.inStock && (
                <div className="flex items-center gap-1 bg-[#10B981]/10 px-3 py-1 rounded-full">
                  <CheckCircle2 className="w-4 h-4 text-[#10B981]" />
                  <span className="text-[#10B981] text-sm" style={{ fontWeight: 600 }}>متوفر</span>
                </div>
              )}
            </div>
            <p className="text-[#9CA3AF] text-sm">{product.nameEn}</p>
          </div>

          {/* Price Section */}
          <div className="bg-gradient-to-br from-[#FFF7ED] to-[#FEE2E2] rounded-2xl p-4 mb-6">
            <div className="flex items-end justify-between">
              <div>
                <p className="text-[#6B7280] text-sm mb-1">السعر</p>
                <div className="flex items-center gap-3">
                  <span className="text-[40px] text-[#F97316] leading-none" style={{ fontWeight: 700 }}>
                    {product.price}
                  </span>
                  <div className="flex flex-col">
                    <span className="text-[#9CA3AF] line-through text-lg">
                      {product.oldPrice}
                    </span>
                    <span className="text-[#23110C]">جنيه</span>
                  </div>
                </div>
              </div>
              <div className="text-left">
                <div className="bg-white rounded-xl px-3 py-2 shadow-sm">
                  <p className="text-[#10B981] text-sm" style={{ fontWeight: 600 }}>توفر</p>
                  <p className="text-[#10B981] text-xl" style={{ fontWeight: 700 }}>
                    {(product.oldPrice - product.price).toFixed(2)} جنيه
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Size Selection */}
          <div className="mb-6">
            <h4 className="mb-3">اختر الحجم</h4>
            <div className="flex gap-2">
              {product.sizes.map((size) => (
                <button
                  key={size}
                  onClick={() => setSelectedSize(size)}
                  className={`flex-1 py-3 px-4 rounded-xl border-2 transition-all ${
                    selectedSize === size
                      ? 'border-[#F97316] bg-[#FFF7ED] text-[#F97316]'
                      : 'border-[#E5E7EB] bg-white text-[#6B7280] hover:border-[#F97316]/30'
                  }`}
                  style={{ fontWeight: selectedSize === size ? 600 : 400 }}
                >
                  {size}
                </button>
              ))}
            </div>
          </div>

          {/* Tags */}
          <div className="flex gap-2 mb-6 flex-wrap">
            {product.tags.map((tag, index) => (
              <span
                key={index}
                className="px-4 py-2 bg-gradient-to-r from-[#FFF7ED] to-[#FEF3C7] text-[#F97316] rounded-full text-sm border border-[#F97316]/20"
                style={{ fontWeight: 600 }}
              >
                {tag}
              </span>
            ))}
          </div>

          {/* Rating & Reviews */}
          <div className="bg-[#F9FAFB] rounded-2xl p-4 mb-6">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                <div className="flex items-center gap-1">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <Star
                      key={star}
                      className={`w-5 h-5 ${
                        star <= Math.floor(product.rating)
                          ? 'fill-[#FFC107] text-[#FFC107]'
                          : 'fill-[#E5E7EB] text-[#E5E7EB]'
                      }`}
                    />
                  ))}
                </div>
                <span className="text-[#23110C] text-xl" style={{ fontWeight: 700 }}>
                  {product.rating}
                </span>
              </div>
              <span className="text-[#6B7280]">
                ({product.reviews} تقييم)
              </span>
            </div>
            <div className="space-y-2">
              {[5, 4, 3, 2, 1].map((stars) => {
                const percentage = stars === 5 ? 75 : stars === 4 ? 20 : 5;
                return (
                  <div key={stars} className="flex items-center gap-2">
                    <span className="text-[#6B7280] text-sm w-3">{stars}</span>
                    <Star className="w-3 h-3 fill-[#FFC107] text-[#FFC107]" />
                    <div className="flex-1 bg-[#E5E7EB] rounded-full h-2 overflow-hidden">
                      <div
                        className="bg-[#FFC107] h-full rounded-full transition-all"
                        style={{ width: `${percentage}%` }}
                      />
                    </div>
                    <span className="text-[#6B7280] text-sm w-8 text-left">{percentage}%</span>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Delivery Info */}
          <div className="grid grid-cols-3 gap-3 mb-6">
            <div className="bg-gradient-to-br from-[#10B981]/10 to-[#10B981]/5 rounded-xl p-3 text-center">
              <Truck className="w-6 h-6 text-[#10B981] mx-auto mb-2" />
              <p className="text-[#23110C] text-xs" style={{ fontWeight: 600 }}>توصيل سريع</p>
              <p className="text-[#6B7280] text-xs">خلال ساعة</p>
            </div>
            <div className="bg-gradient-to-br from-[#3B82F6]/10 to-[#3B82F6]/5 rounded-xl p-3 text-center">
              <Shield className="w-6 h-6 text-[#3B82F6] mx-auto mb-2" />
              <p className="text-[#23110C] text-xs" style={{ fontWeight: 600 }}>ضمان الجودة</p>
              <p className="text-[#6B7280] text-xs">منتج أصلي</p>
            </div>
            <div className="bg-gradient-to-br from-[#F97316]/10 to-[#F97316]/5 rounded-xl p-3 text-center">
              <Clock className="w-6 h-6 text-[#F97316] mx-auto mb-2" />
              <p className="text-[#23110C] text-xs" style={{ fontWeight: 600 }}>طازج دائماً</p>
              <p className="text-[#6B7280] text-xs">يومياً</p>
            </div>
          </div>

          {/* Description */}
          <div className="mb-6">
            <h4 className="mb-3">وصف المنتج</h4>
            <p className="text-[#6B7280] leading-relaxed">
              {product.description}
            </p>
          </div>

          {/* Customer Reviews */}
          <div className="mb-6">
            <div className="flex items-center justify-between mb-3">
              <h4>آراء العملاء</h4>
              <button className="text-[#F97316] text-sm" style={{ fontWeight: 600 }}>
                عرض الكل
              </button>
            </div>
            <div className="space-y-3">
              {reviews.map((review) => (
                <div key={review.id} className="bg-white border border-[#E5E7EB] rounded-xl p-4">
                  <div className="flex items-start justify-between mb-2">
                    <div className="flex items-center gap-2">
                      <div className="w-10 h-10 rounded-full bg-gradient-to-br from-[#F97316] to-[#ea580c] flex items-center justify-center text-white" style={{ fontWeight: 700 }}>
                        {review.name.charAt(0)}
                      </div>
                      <div>
                        <p className="text-[#23110C]" style={{ fontWeight: 600 }}>
                          {review.name}
                        </p>
                        <p className="text-[#9CA3AF] text-xs">{review.date}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-1">
                      {[...Array(review.rating)].map((_, i) => (
                        <Star key={i} className="w-4 h-4 fill-[#FFC107] text-[#FFC107]" />
                      ))}
                    </div>
                  </div>
                  <p className="text-[#6B7280] text-sm">{review.comment}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Related Products */}
          <div className="mb-6">
            <h4 className="mb-4">منتجات مشابهة</h4>
            <div className="grid grid-cols-2 gap-3">
              {relatedProducts.map((item) => (
                <div
                  key={item.id}
                  className="bg-white border border-[#E5E7EB] rounded-2xl overflow-hidden hover:shadow-lg transition-all cursor-pointer relative"
                >
                  {/* Discount Badge */}
                  {item.discount && (
                    <div className="absolute top-2 right-2 z-10">
                      <div className="bg-[#EF4444] text-white px-2 py-1 rounded-full text-xs shadow-lg" style={{ fontWeight: 700 }}>
                        -{item.discount}%
                      </div>
                    </div>
                  )}
                  
                  <div className="bg-[#F9FAFB] p-4">
                    <ImageWithFallback
                      src={item.image}
                      alt={item.name}
                      className="w-full h-28 object-contain"
                    />
                  </div>
                  
                  <div className="p-3">
                    <p className="text-[#23110C] text-sm mb-2 line-clamp-2 min-h-[2.5rem]" style={{ fontWeight: 600 }}>
                      {item.name}
                    </p>
                    
                    <div className="flex items-center justify-between mb-2">
                      <div>
                        <p className="text-[#F97316] text-lg" style={{ fontWeight: 700 }}>
                          {item.price}
                        </p>
                        {item.oldPrice && (
                          <p className="text-[#9CA3AF] line-through text-xs">
                            {item.oldPrice} جنيه
                          </p>
                        )}
                      </div>
                      
                      <button className="w-8 h-8 bg-[#F97316] rounded-full flex items-center justify-center shadow-md hover:bg-[#ea580c] transition-all">
                        <Plus className="w-4 h-4 text-white" />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Bottom Sticky Bar - Enhanced */}
      <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-[#E5E7EB] shadow-[0_-4px_16px_rgba(0,0,0,0.1)]">
        <div className="p-4 max-w-md mx-auto">
          {/* Quantity & Price Row */}
          <div className="flex items-center gap-3 mb-3">
            {/* Quantity Selector */}
            <div className="flex items-center gap-2 bg-[#F3F4F6] rounded-full px-3 py-2 border border-[#E5E7EB]">
              <button
                onClick={() => setQuantity(Math.max(1, quantity - 1))}
                className="w-8 h-8 flex items-center justify-center text-[#23110C] hover:bg-white rounded-full transition-all"
              >
                <Minus className="w-4 h-4" />
              </button>
              <span className="w-10 text-center" style={{ fontWeight: 700 }}>
                {quantity}
              </span>
              <button
                onClick={() => setQuantity(quantity + 1)}
                className="w-8 h-8 flex items-center justify-center text-[#23110C] hover:bg-white rounded-full transition-all"
              >
                <Plus className="w-4 h-4" />
              </button>
            </div>

            {/* Total Price Display */}
            <div className="flex-1 bg-gradient-to-br from-[#FFF7ED] to-[#FEF3C7] rounded-2xl px-4 py-2 border border-[#F97316]/20">
              <p className="text-[#6B7280] text-xs">الإجمالي</p>
              <p className="text-[#F97316] text-xl" style={{ fontWeight: 700 }}>
                {(product.price * quantity).toFixed(2)} جنيه
              </p>
            </div>
          </div>

          {/* Add to Cart Button */}
          <button className="w-full bg-gradient-to-r from-[#F97316] to-[#ea580c] text-white py-4 px-6 rounded-2xl flex items-center justify-center gap-3 shadow-xl hover:shadow-2xl hover:scale-[1.02] active:scale-[0.98] transition-all">
            <ShoppingCart className="w-6 h-6" />
            <span className="text-lg" style={{ fontWeight: 700 }}>أضف للسلة</span>
          </button>
        </div>
      </div>
    </div>
  );
}