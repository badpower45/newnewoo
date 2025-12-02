import { Search, MapPin, ChevronDown, Play, Sparkles, ShoppingBag, MessageCircle } from 'lucide-react';
import { ImageWithFallback } from './figma/ImageWithFallback';

interface HomePageProps {
  onNavigate: (page: string) => void;
  onProductClick: () => void;
}

export function HomePage({ onNavigate, onProductClick }: HomePageProps) {
  const categories = [
    { id: 1, name: 'من محمود الفار', icon: '🎨', color: 'from-pink-500 to-rose-500' },
    { id: 2, name: 'وصلنا حديثاً', icon: '⭐', color: 'from-amber-500 to-yellow-500' },
    { id: 3, name: 'الأكثر مبيعاً', icon: '🔥', color: 'from-red-500 to-orange-500' },
    { id: 4, name: 'أساسيات الشتاء', icon: '❄️', color: 'from-blue-500 to-cyan-500' }
  ];

  const products = [
    {
      id: 1,
      name: 'شيبس محمود الفار',
      price: '8.50',
      image: 'https://images.unsplash.com/photo-1566478989037-eec170784d0b?w=400&h=400&fit=crop'
    },
    {
      id: 2,
      name: 'حليب المراعي',
      price: '18.95',
      image: 'https://images.unsplash.com/photo-1563636619-e9143da7973b?w=400&h=400&fit=crop'
    },
    {
      id: 3,
      name: 'زيت الزيتون',
      price: '125.00',
      image: 'https://images.unsplash.com/photo-1474979266404-7eaacbcd87c5?w=400&h=400&fit=crop'
    },
    {
      id: 4,
      name: 'أرز بسمتي',
      price: '45.00',
      image: 'https://images.unsplash.com/photo-1586201375761-83865001e31c?w=400&h=400&fit=crop'
    }
  ];

  return (
    <div className="min-h-screen bg-[#FAFAFA] pb-20">
      {/* Header */}
      <div className="bg-white px-4 pt-4 pb-3 sticky top-0 z-10 shadow-sm">
        {/* Delivery Info */}
        <div className="flex items-center gap-2 mb-3">
          <MapPin className="w-4 h-4 text-[#F97316]" />
          <span className="text-[#23110C] text-sm" style={{ fontWeight: 600 }}>
            التوصيل إلى:
          </span>
          <button className="flex items-center gap-1 text-[#10B981] text-sm" style={{ fontWeight: 600 }}>
            <span>خلال 75 دقيقة</span>
            <ChevronDown className="w-4 h-4" />
          </button>
        </div>

        {/* Search Bar */}
        <div className="relative">
          <Search className="absolute right-3 top-1/2 -translate-y-1/2 w-5 h-5 text-[#9CA3AF]" />
          <input
            type="text"
            placeholder="ما الذي تبحث عنه؟"
            className="w-full bg-[#F3F4F6] rounded-full pr-10 pl-4 py-2.5 text-[#23110C] placeholder:text-[#9CA3AF] focus:outline-none focus:ring-2 focus:ring-[#F97316]/20"
          />
        </div>
      </div>

      <div className="px-4">
        {/* Login Banner */}
        <div className="bg-gradient-to-l from-[#F97316] to-[#FFF7ED] rounded-2xl p-4 flex items-center justify-between mt-4 shadow-md">
          <div>
            <h3 className="text-[#23110C] mb-1">سجل دخول، اطلب واربح</h3>
            <p className="text-[#6B7280] text-sm">اكسب نقاط مع كل طلب</p>
          </div>
          <button className="bg-white text-[#F97316] px-6 py-2 rounded-full shadow-md hover:shadow-lg transition-all flex items-center gap-2" style={{ fontWeight: 600 }}>
            <Sparkles className="w-4 h-4" />
            سجل دخول
          </button>
        </div>

        {/* Yellow Friday Banner */}
        <div 
          className="mt-4 rounded-2xl overflow-hidden shadow-lg cursor-pointer hover:shadow-xl transition-all"
          onClick={() => onNavigate('magazine')}
        >
          <ImageWithFallback
            src="https://images.unsplash.com/photo-1607083206869-4c7672e72a8a?w=800&h=400&fit=crop"
            alt="Yellow Friday"
            className="w-full h-40 object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent flex items-end p-4">
            <div>
              <h3 className="text-white mb-1">الجمعة الصفراء</h3>
              <p className="text-white/90 text-sm">خصومات تصل إلى 50%</p>
            </div>
          </div>
        </div>

        {/* Chips Carousel */}
        <div 
          className="mt-4 rounded-2xl overflow-hidden shadow-lg bg-gradient-to-br from-amber-400 to-yellow-500 p-6 cursor-pointer hover:shadow-xl transition-all"
          onClick={onProductClick}
        >
          <h3 className="text-white mb-3">شيبس محمود الفار</h3>
          <div className="flex items-center gap-3 overflow-x-auto pb-2 scrollbar-hide">
            {[1, 2, 3, 4, 5].map((i) => (
              <ImageWithFallback
                key={i}
                src={`https://images.unsplash.com/photo-1566478989037-eec170784d0b?w=200&h=200&fit=crop&q=80`}
                alt={`Chips ${i}`}
                className="w-24 h-24 object-contain flex-shrink-0"
              />
            ))}
          </div>
        </div>

        {/* Special Categories */}
        <div className="mt-6">
          <h3 className="mb-4">فئات خاصة</h3>
          <div className="grid grid-cols-2 gap-3">
            {categories.map((category) => (
              <div
                key={category.id}
                className="bg-white rounded-2xl p-4 flex items-center gap-3 shadow-md hover:shadow-lg transition-all cursor-pointer"
              >
                <div className={`w-12 h-12 rounded-full bg-gradient-to-br ${category.color} flex items-center justify-center text-2xl`}>
                  {category.icon}
                </div>
                <span className="text-[#23110C]" style={{ fontWeight: 600 }}>
                  {category.name}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Products You Might Like */}
        <div className="mt-6">
          <div className="flex items-center justify-between mb-4">
            <h3>منتجات قد تعجبك</h3>
            <button className="text-[#F97316] text-sm" style={{ fontWeight: 600 }}>
              عرض الكل
            </button>
          </div>
          <div className="grid grid-cols-2 gap-3">
            {products.map((product) => (
              <div
                key={product.id}
                onClick={onProductClick}
                className="bg-white rounded-2xl overflow-hidden shadow-md hover:shadow-lg transition-all cursor-pointer"
              >
                <div className="bg-[#F9FAFB] p-4">
                  <ImageWithFallback
                    src={product.image}
                    alt={product.name}
                    className="w-full h-32 object-contain"
                  />
                </div>
                <div className="p-3">
                  <p className="text-[#23110C] mb-2 text-sm" style={{ fontWeight: 600 }}>
                    {product.name}
                  </p>
                  <div className="flex items-center justify-between">
                    <span className="text-[#F97316]" style={{ fontWeight: 700 }}>
                      {product.price} جنيه
                    </span>
                    <button className="w-8 h-8 bg-[#F97316] rounded-full flex items-center justify-center shadow-md hover:bg-[#ea580c] transition-all">
                      <span className="text-white text-xl leading-none">+</span>
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Feature Cards */}
        <div className="grid grid-cols-2 gap-3 mt-6 mb-6">
          <div
            onClick={() => onNavigate('reels')}
            className="bg-gradient-to-br from-purple-500 to-pink-500 rounded-2xl p-4 text-white shadow-lg hover:shadow-xl transition-all cursor-pointer"
          >
            <Play className="w-8 h-8 mb-2" />
            <h4 className="text-white mb-1">ريلز علوش</h4>
            <p className="text-white/90 text-sm">وصفات ومحتوى ترفيهي</p>
          </div>
          
          <div
            onClick={() => onNavigate('support')}
            className="bg-gradient-to-br from-blue-500 to-cyan-500 rounded-2xl p-4 text-white shadow-lg hover:shadow-xl transition-all cursor-pointer"
          >
            <MessageCircle className="w-8 h-8 mb-2" />
            <h4 className="text-white mb-1">خدمة العملاء</h4>
            <p className="text-white/90 text-sm">نحن هنا لمساعدتك</p>
          </div>
        </div>
      </div>
    </div>
  );
}
