import { ArrowRight, Plus } from 'lucide-react';
import { ImageWithFallback } from './figma/ImageWithFallback';

export function MagazinePage({ onBack }: { onBack: () => void }) {
  const categories = [
    'جميع العروض',
    'طازج',
    'مجمد',
    'مخزن',
    'لحوم',
    'ألبان',
    'مخبوزات'
  ];

  const offers = [
    {
      id: 1,
      name: 'ليمون طازج',
      price: '99',
      unit: 'كجم',
      discount: '13% خصم',
      image: 'https://images.unsplash.com/photo-1590502593747-42a996133562?w=300&h=300&fit=crop',
      bgColor: 'from-pink-500 to-pink-600'
    },
    {
      id: 2,
      name: 'طماطم',
      price: '27',
      unit: 'كجم',
      discount: '24% خصم',
      image: 'https://images.unsplash.com/photo-1546470427-227a0e3f8e6e?w=300&h=300&fit=crop',
      bgColor: 'from-red-500 to-red-600'
    },
    {
      id: 3,
      name: 'كوسة',
      price: '16',
      unit: 'كجم',
      discount: '26% خصم',
      image: 'https://images.unsplash.com/photo-1566385101042-1a0aa0c1268c?w=300&h=300&fit=crop',
      bgColor: 'from-green-600 to-green-700'
    },
    {
      id: 4,
      name: 'لحم بقري طازج',
      price: '449',
      unit: 'كجم',
      discount: '15% خصم',
      image: 'https://images.unsplash.com/photo-1603048588665-791ca8aea617?w=300&h=300&fit=crop',
      bgColor: 'from-red-600 to-red-700'
    },
    {
      id: 5,
      name: 'لحم مفروم',
      price: '389',
      unit: 'كجم',
      discount: '16% خصم',
      image: 'https://images.unsplash.com/photo-1607623814075-e51df1bdc82f?w=300&h=300&fit=crop',
      bgColor: 'from-red-700 to-red-800'
    },
    {
      id: 6,
      name: 'لحم كندوز',
      price: '324',
      unit: 'كجم',
      discount: '25% خصم',
      image: 'https://images.unsplash.com/photo-1588347818036-79a20c64ab7b?w=300&h=300&fit=crop',
      bgColor: 'from-pink-600 to-pink-700'
    }
  ];

  return (
    <div className="min-h-screen bg-[#FAFAFA] pb-20 max-w-md mx-auto">
      {/* Header */}
      <div className="bg-gradient-to-br from-[#F97316] to-[#ea580c] p-6 pb-8 relative overflow-hidden">
        {/* Confetti Background */}
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-4 right-10 w-3 h-3 bg-yellow-300 rounded-full" />
          <div className="absolute top-12 right-24 w-2 h-2 bg-white rounded-full" />
          <div className="absolute top-8 left-16 w-4 h-4 bg-red-300 rounded-full" />
          <div className="absolute bottom-4 right-32 w-3 h-3 bg-blue-300 rounded-full" />
          <div className="absolute bottom-8 left-20 w-2 h-2 bg-green-300 rounded-full" />
        </div>

        <div className="flex items-center gap-3 mb-4 relative">
          <button onClick={onBack} className="w-10 h-10 bg-white/20 backdrop-blur-sm rounded-full flex items-center justify-center">
            <ArrowRight className="w-6 h-6 text-white" />
          </button>
          <h1 className="text-white">مجلة العروض الأسبوعية</h1>
        </div>

        <p className="text-white/90 relative">
          عروض حصرية ومتنوعة من 1 لغاية 29 نوفمبر 2025
        </p>
      </div>

      {/* Categories */}
      <div className="px-4 -mt-4 mb-4 relative">
        <div className="bg-white rounded-2xl shadow-lg p-3 overflow-x-auto scrollbar-hide">
          <div className="flex gap-2">
            {categories.map((category, index) => (
              <button
                key={index}
                className={`px-4 py-2 rounded-full whitespace-nowrap transition-all ${
                  index === 0
                    ? 'bg-[#F97316] text-white shadow-md'
                    : 'bg-[#F3F4F6] text-[#6B7280] hover:bg-[#E5E7EB]'
                }`}
              >
                {category}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Offers Grid - Magazine Style */}
      <div className="px-4">
        <div className="grid grid-cols-2 gap-3">
          {offers.map((offer) => (
            <div
              key={offer.id}
              className="relative bg-white rounded-2xl overflow-hidden shadow-md hover:shadow-xl transition-all"
            >
              {/* Discount Badge */}
              <div className="absolute top-2 right-2 z-10">
                <div className="bg-[#EF4444] text-white px-3 py-1 rounded-full text-sm shadow-lg transform rotate-[-10deg]" style={{ fontWeight: 700 }}>
                  {offer.discount}
                </div>
              </div>

              {/* Explosive Background Shape */}
              <div className={`absolute inset-0 bg-gradient-to-br ${offer.bgColor} opacity-5`}>
                <svg viewBox="0 0 100 100" className="w-full h-full">
                  <polygon points="50,5 60,35 90,35 65,55 75,85 50,65 25,85 35,55 10,35 40,35" fill="currentColor" />
                </svg>
              </div>

              {/* Product Image */}
              <div className="relative pt-4 px-4">
                <ImageWithFallback
                  src={offer.image}
                  alt={offer.name}
                  className="w-full h-32 object-contain relative z-10"
                />
              </div>

              {/* Product Info */}
              <div className="p-3 relative">
                <p className="text-[#23110C] mb-2 min-h-[2.5rem] text-sm" style={{ fontWeight: 600 }}>
                  {offer.name}
                </p>
                
                {/* Price Tag - Large and Bold */}
                <div className="flex items-end justify-between mb-2">
                  <div>
                    <span className="text-[#F97316] text-3xl" style={{ fontWeight: 700 }}>
                      {offer.price}
                    </span>
                    <span className="text-[#6B7280] text-sm mr-1">
                      {offer.unit}
                    </span>
                  </div>
                  
                  {/* Quick Add Button */}
                  <button className="w-8 h-8 bg-[#F97316] rounded-full flex items-center justify-center shadow-lg hover:bg-[#ea580c] transition-all">
                    <Plus className="w-4 h-4 text-white" />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Load More */}
      <div className="px-4 mt-6">
        <button className="w-full py-3 bg-white text-[#F97316] border-2 border-[#F97316] rounded-full hover:bg-[#FFF7ED] transition-all" style={{ fontWeight: 600 }}>
          تحميل المزيد من العروض
        </button>
      </div>
    </div>
  );
}
