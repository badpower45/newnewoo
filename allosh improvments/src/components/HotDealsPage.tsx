import { ArrowRight, Filter, Flame, Plus } from 'lucide-react';
import { useState, useEffect } from 'react';
import { ImageWithFallback } from './figma/ImageWithFallback';

export function HotDealsPage({ onBack }: { onBack: () => void }) {
  const [timeLeft, setTimeLeft] = useState({
    hours: 2,
    minutes: 15,
    seconds: 45
  });

  useEffect(() => {
    const timer = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev.seconds > 0) {
          return { ...prev, seconds: prev.seconds - 1 };
        } else if (prev.minutes > 0) {
          return { ...prev, minutes: prev.minutes - 1, seconds: 59 };
        } else if (prev.hours > 0) {
          return { hours: prev.hours - 1, minutes: 59, seconds: 59 };
        }
        return prev;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  const flashDeal = {
    name: 'زيت عباد الشمس',
    image: 'https://images.unsplash.com/photo-1474979266404-7eaacbcd87c5?w=400&h=400&fit=crop',
    price: '89.99',
    oldPrice: '179.99',
    discount: 50,
    sold: 85
  };

  const deals = [
    {
      id: 1,
      name: 'أرز بسمتي هندي - 5 كجم',
      image: 'https://images.unsplash.com/photo-1586201375761-83865001e31c?w=400&h=400&fit=crop',
      price: '120.00',
      oldPrice: '180.00',
      discount: 33,
      sold: 65
    },
    {
      id: 2,
      name: 'سكر أبيض - 2 كجم',
      image: 'https://images.unsplash.com/photo-1582005450386-52b25f82d9bb?w=400&h=400&fit=crop',
      price: '35.00',
      oldPrice: '50.00',
      discount: 30,
      sold: 72
    },
    {
      id: 3,
      name: 'معكرونة إيطالية - عبوة 6',
      image: 'https://images.unsplash.com/photo-1621996346565-e3dbc646d9a9?w=400&h=400&fit=crop',
      price: '45.00',
      oldPrice: '70.00',
      discount: 35,
      sold: 58
    },
    {
      id: 4,
      name: 'زيت زيتون بكر - 1 لتر',
      image: 'https://images.unsplash.com/photo-1474979266404-7eaacbcd87c5?w=400&h=400&fit=crop',
      price: '150.00',
      oldPrice: '220.00',
      discount: 32,
      sold: 45
    },
    {
      id: 5,
      name: 'عسل نحل طبيعي - 500 جم',
      image: 'https://images.unsplash.com/photo-1587049352846-4a222e784254?w=400&h=400&fit=crop',
      price: '85.00',
      oldPrice: '130.00',
      discount: 35,
      sold: 92
    },
    {
      id: 6,
      name: 'شاي أخضر - عبوة 100',
      image: 'https://images.unsplash.com/photo-1563822249548-9a72b6744a76?w=400&h=400&fit=crop',
      price: '55.00',
      oldPrice: '85.00',
      discount: 35,
      sold: 78
    }
  ];

  return (
    <div className="min-h-screen bg-[#FAFAFA] pb-20 max-w-md mx-auto">
      {/* Header */}
      <div className="bg-white border-b border-[#E5E7EB] p-4 sticky top-0 z-10">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <button onClick={onBack} className="w-10 h-10 flex items-center justify-center">
              <ArrowRight className="w-6 h-6 text-[#23110C]" />
            </button>
            <h2 className="flex items-center gap-2">
              <Flame className="w-6 h-6 text-[#F97316]" />
              العروض الساخنة
            </h2>
          </div>
          <button className="w-10 h-10 flex items-center justify-center">
            <Filter className="w-5 h-5 text-[#6B7280]" />
          </button>
        </div>
      </div>

      {/* Flash Sale Banner */}
      <div className="bg-gradient-to-br from-[#EF4444] to-[#dc2626] mx-4 mt-4 rounded-2xl overflow-hidden shadow-xl">
        <div className="p-4 relative">
          {/* Countdown Timer */}
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <Flame className="w-5 h-5 text-yellow-300 animate-pulse" />
              <span className="text-white" style={{ fontWeight: 700 }}>
                عرض سريع ينتهي خلال:
              </span>
            </div>
            <div className="flex gap-2">
              <div className="bg-white/20 backdrop-blur-sm px-3 py-1 rounded-lg text-center">
                <div className="text-white text-xl" style={{ fontWeight: 700 }}>
                  {String(timeLeft.hours).padStart(2, '0')}
                </div>
                <div className="text-white/70 text-xs">ساعة</div>
              </div>
              <div className="text-white text-xl flex items-center">:</div>
              <div className="bg-white/20 backdrop-blur-sm px-3 py-1 rounded-lg text-center">
                <div className="text-white text-xl" style={{ fontWeight: 700 }}>
                  {String(timeLeft.minutes).padStart(2, '0')}
                </div>
                <div className="text-white/70 text-xs">دقيقة</div>
              </div>
              <div className="text-white text-xl flex items-center">:</div>
              <div className="bg-white/20 backdrop-blur-sm px-3 py-1 rounded-lg text-center">
                <div className="text-white text-xl" style={{ fontWeight: 700 }}>
                  {String(timeLeft.seconds).padStart(2, '0')}
                </div>
                <div className="text-white/70 text-xs">ثانية</div>
              </div>
            </div>
          </div>

          {/* Hero Product */}
          <div className="flex items-center gap-4">
            <ImageWithFallback
              src={flashDeal.image}
              alt={flashDeal.name}
              className="w-24 h-24 object-contain bg-white/10 rounded-xl p-2"
            />
            <div className="flex-1">
              <h3 className="text-white mb-2">{flashDeal.name}</h3>
              <div className="flex items-center gap-2 mb-2">
                <span className="text-white text-2xl" style={{ fontWeight: 700 }}>
                  {flashDeal.price} جنيه
                </span>
                <span className="text-white/60 line-through">
                  {flashDeal.oldPrice}
                </span>
              </div>
              {/* Stock Progress */}
              <div className="mb-1">
                <div className="w-full bg-white/20 rounded-full h-2 overflow-hidden">
                  <div
                    className="bg-yellow-300 h-full rounded-full transition-all"
                    style={{ width: `${flashDeal.sold}%` }}
                  />
                </div>
              </div>
              <p className="text-white/80 text-sm">تم البيع: {flashDeal.sold}%</p>
            </div>
          </div>
        </div>
      </div>

      {/* Deals Grid */}
      <div className="px-4 mt-6">
        <div className="grid grid-cols-2 gap-4">
          {deals.map((deal) => (
            <div
              key={deal.id}
              className="bg-white rounded-2xl overflow-hidden shadow-lg hover:shadow-xl transition-all relative"
            >
              {/* Discount Badge */}
              <div className="absolute top-2 right-2 z-10">
                <div className="bg-[#EF4444] text-white px-3 py-1.5 rounded-full shadow-lg" style={{ fontWeight: 700 }}>
                  -{deal.discount}%
                </div>
              </div>

              {/* Product Image */}
              <div className="bg-[#F9FAFB] p-4">
                <ImageWithFallback
                  src={deal.image}
                  alt={deal.name}
                  className="w-full h-32 object-contain"
                />
              </div>

              {/* Product Info */}
              <div className="p-3">
                <p className="text-[#23110C] mb-2 min-h-[2.5rem] text-sm line-clamp-2" style={{ fontWeight: 600 }}>
                  {deal.name}
                </p>
                
                <div className="mb-2">
                  <div className="flex items-center gap-2">
                    <span className="text-[#F97316] text-xl" style={{ fontWeight: 700 }}>
                      {deal.price}
                    </span>
                    <span className="text-[#9CA3AF] text-sm">جنيه</span>
                  </div>
                  <span className="text-[#9CA3AF] line-through text-sm">
                    {deal.oldPrice} جنيه
                  </span>
                </div>

                {/* Stock Bar */}
                <div className="mb-2">
                  <div className="w-full bg-[#F3F4F6] rounded-full h-1.5 overflow-hidden">
                    <div
                      className={`h-full rounded-full transition-all ${
                        deal.sold > 80 ? 'bg-[#EF4444]' : 'bg-[#F97316]'
                      }`}
                      style={{ width: `${deal.sold}%` }}
                    />
                  </div>
                </div>
                <p className="text-[#6B7280] text-xs mb-3">
                  تم البيع: {deal.sold}%
                </p>

                {/* Add Button */}
                <button className="w-full py-2 bg-[#F97316] text-white rounded-full flex items-center justify-center gap-2 shadow-md hover:bg-[#ea580c] transition-all">
                  <Plus className="w-4 h-4" />
                  <span style={{ fontWeight: 600 }}>أضف للسلة</span>
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
