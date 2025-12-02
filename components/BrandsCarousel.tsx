import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Crown, Sparkles, ArrowLeft, Star, Verified, TrendingUp, Gift, Zap } from 'lucide-react';

// 3 براندات مميزة فقط - شركاء مدفوعين
const PREMIUM_BRANDS = [
    {
        id: 'pepsi',
        name: 'بيبسي',
        nameEn: 'PepsiCo',
        slogan: 'عيش اللحظة مع بيبسي',
        description: 'مشروبات غازية منعشة وطاقة لا تنتهي',
        logo: 'https://upload.wikimedia.org/wikipedia/commons/thumb/0/0f/Pepsi_logo_2014.svg/800px-Pepsi_logo_2014.svg.png',
        coverImage: 'https://images.unsplash.com/photo-1629203851122-3726ecdf080e?w=800',
        primaryColor: '#004B93',
        secondaryColor: '#C9002B',
        accentColor: '#00A0DC',
        gradient: 'from-[#004B93] via-[#0066CC] to-[#00A0DC]',
        offer: 'خصم 30% على الكل',
        badge: 'الأكثر مبيعاً',
        rating: 4.9,
        reviews: '12.5K',
        productsCount: 45,
        isVerified: true,
        isFeatured: true
    },
    {
        id: 'nescafe',
        name: 'نسكافيه',
        nameEn: 'NESCAFÉ',
        slogan: 'ابدأ يومك بنسكافيه',
        description: 'قهوة فاخرة من أجود أنواع البن العالمي',
        logo: 'https://upload.wikimedia.org/wikipedia/commons/thumb/e/e2/Nescafe_logo.svg/800px-Nescafe_logo.svg.png',
        coverImage: 'https://images.unsplash.com/photo-1495474472287-4d71bcdd2085?w=800',
        primaryColor: '#8B4513',
        secondaryColor: '#D4A574',
        accentColor: '#FFD700',
        gradient: 'from-[#3D1C02] via-[#8B4513] to-[#D4A574]',
        offer: 'اشتري 2 واحصل على 1 مجاناً',
        badge: 'جديد',
        rating: 4.8,
        reviews: '8.2K',
        productsCount: 32,
        isVerified: true,
        isFeatured: true
    },
    {
        id: 'juhayna',
        name: 'جهينة',
        nameEn: 'Juhayna',
        slogan: 'طبيعي وطازج كل يوم',
        description: 'منتجات ألبان طازجة وعصائر طبيعية',
        logo: 'https://www.juhayna.com/images/logo.png',
        coverImage: 'https://images.unsplash.com/photo-1550583724-b2692b85b150?w=800',
        primaryColor: '#0072CE',
        secondaryColor: '#00A3E0',
        accentColor: '#87CEEB',
        gradient: 'from-[#0072CE] via-[#00A3E0] to-[#87CEEB]',
        offer: 'عروض العائلة - خصم 25%',
        badge: 'موثوق',
        rating: 4.7,
        reviews: '15.3K',
        productsCount: 58,
        isVerified: true,
        isFeatured: false
    }
];

interface BrandsCarouselProps {
    title?: string;
}

const BrandsCarousel: React.FC<BrandsCarouselProps> = ({ title = "شركاؤنا المميزون" }) => {
    const [hoveredBrand, setHoveredBrand] = useState<string | null>(null);

    return (
        <section className="py-10 relative overflow-hidden">
            {/* Premium Background */}
            <div className="absolute inset-0 bg-gradient-to-br from-brand-brown/5 via-white to-brand-orange/5" />
            <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-brand-orange to-transparent opacity-30" />
            <div className="absolute bottom-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-brand-brown to-transparent opacity-30" />
            
            {/* Floating decorations */}
            <div className="absolute top-10 right-10 w-32 h-32 bg-brand-orange/5 rounded-full blur-3xl" />
            <div className="absolute bottom-10 left-10 w-40 h-40 bg-brand-brown/5 rounded-full blur-3xl" />
            
            <div className="relative max-w-7xl mx-auto px-4">
                {/* Premium Header */}
                <div className="text-center mb-10">
                    <div className="inline-flex items-center gap-2 bg-gradient-to-r from-amber-100 to-orange-100 px-4 py-1.5 rounded-full mb-4">
                        <Crown className="text-amber-500" size={16} />
                        <span className="text-sm font-bold text-amber-700">Premium Partners</span>
                        <Sparkles className="text-amber-500" size={14} />
                    </div>
                    <h2 className="text-3xl md:text-4xl font-black text-brand-brown mb-3">{title}</h2>
                    <p className="text-gray-500 max-w-md mx-auto">
                        براندات عالمية موثوقة تقدم لك أفضل المنتجات بأسعار حصرية
                    </p>
                </div>

                {/* Premium Brands Grid */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 md:gap-8">
                    {PREMIUM_BRANDS.map((brand, idx) => (
                        <Link
                            key={brand.id}
                            to={`/brand/${brand.id}`}
                            className="group relative"
                            onMouseEnter={() => setHoveredBrand(brand.id)}
                            onMouseLeave={() => setHoveredBrand(null)}
                            style={{ animationDelay: `${idx * 150}ms` }}
                        >
                            {/* Main Card */}
                            <div className="relative bg-white rounded-3xl overflow-hidden shadow-lg hover:shadow-2xl transition-all duration-500 transform hover:-translate-y-2">
                                {/* Cover Image with Gradient Overlay */}
                                <div className="relative h-44 overflow-hidden">
                                    <img 
                                        src={brand.coverImage}
                                        alt={brand.name}
                                        className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                                    />
                                    <div className={`absolute inset-0 bg-gradient-to-t ${brand.gradient} opacity-80`} />
                                    
                                    {/* Badges on Cover */}
                                    <div className="absolute top-3 right-3 flex flex-col gap-2">
                                        {brand.badge === 'الأكثر مبيعاً' && (
                                            <span className="bg-amber-500 text-white text-xs px-3 py-1 rounded-full font-bold shadow-lg flex items-center gap-1">
                                                <TrendingUp size={12} />
                                                {brand.badge}
                                            </span>
                                        )}
                                        {brand.badge === 'جديد' && (
                                            <span className="bg-green-500 text-white text-xs px-3 py-1 rounded-full font-bold shadow-lg flex items-center gap-1">
                                                <Sparkles size={12} />
                                                {brand.badge}
                                            </span>
                                        )}
                                        {brand.badge === 'موثوق' && (
                                            <span className="bg-blue-500 text-white text-xs px-3 py-1 rounded-full font-bold shadow-lg flex items-center gap-1">
                                                <Verified size={12} />
                                                {brand.badge}
                                            </span>
                                        )}
                                    </div>
                                    
                                    {/* Offer Badge */}
                                    <div className="absolute bottom-3 left-3 right-3">
                                        <div className="bg-white/95 backdrop-blur-sm rounded-xl px-3 py-2 flex items-center justify-between shadow-lg">
                                            <div className="flex items-center gap-2">
                                                <Gift className="text-brand-orange" size={18} />
                                                <span className="text-sm font-bold text-brand-brown">{brand.offer}</span>
                                            </div>
                                            <Zap className="text-amber-500" size={16} />
                                        </div>
                                    </div>
                                    
                                    {/* Logo Circle - Positioned at bottom center overlapping */}
                                    <div className="absolute -bottom-10 left-1/2 -translate-x-1/2 z-20">
                                        <div 
                                            className="w-20 h-20 bg-white rounded-2xl shadow-xl p-3 flex items-center justify-center border-4 transition-all duration-300 group-hover:scale-110 group-hover:rotate-3"
                                            style={{ borderColor: brand.primaryColor }}
                                        >
                                            <img 
                                                src={brand.logo}
                                                alt={brand.name}
                                                className="max-w-full max-h-full object-contain"
                                                onError={(e) => {
                                                    (e.target as HTMLImageElement).src = `https://ui-avatars.com/api/?name=${brand.nameEn}&size=100&background=${brand.primaryColor.replace('#', '')}&color=fff&bold=true`;
                                                }}
                                            />
                                        </div>
                                    </div>
                                </div>
                                
                                {/* Content */}
                                <div className="pt-14 pb-5 px-5 text-center">
                                    {/* Brand Name with Verified */}
                                    <div className="flex items-center justify-center gap-2 mb-1">
                                        <h3 className="text-xl font-black text-gray-900">{brand.name}</h3>
                                        {brand.isVerified && (
                                            <Verified className="text-blue-500" size={18} fill="#3B82F6" />
                                        )}
                                    </div>
                                    <p className="text-sm text-gray-400 font-medium mb-3">{brand.nameEn}</p>
                                    <p className="text-sm text-gray-600 mb-4 line-clamp-2">{brand.slogan}</p>
                                    
                                    {/* Stats Row */}
                                    <div className="flex items-center justify-center gap-4 mb-4">
                                        <div className="flex items-center gap-1">
                                            <Star className="text-amber-400" size={16} fill="#FBBF24" />
                                            <span className="font-bold text-gray-900">{brand.rating}</span>
                                            <span className="text-xs text-gray-400">({brand.reviews})</span>
                                        </div>
                                        <div className="w-px h-4 bg-gray-200" />
                                        <span className="text-sm text-gray-500">
                                            <span className="font-bold text-gray-900">{brand.productsCount}</span> منتج
                                        </span>
                                    </div>
                                    
                                    {/* CTA Button */}
                                    <div 
                                        className="py-3 px-5 rounded-xl text-white font-bold text-sm flex items-center justify-center gap-2 transition-all duration-300 group-hover:gap-4"
                                        style={{ 
                                            background: `linear-gradient(135deg, ${brand.primaryColor}, ${brand.secondaryColor})` 
                                        }}
                                    >
                                        تسوق الآن
                                        <ArrowLeft size={16} className="transition-transform group-hover:-translate-x-1" />
                                    </div>
                                </div>
                                
                                {/* Decorative gradient line */}
                                <div 
                                    className="absolute bottom-0 left-0 right-0 h-1"
                                    style={{ 
                                        background: `linear-gradient(90deg, ${brand.primaryColor}, ${brand.secondaryColor}, ${brand.accentColor})` 
                                    }}
                                />
                            </div>
                            
                            {/* Hover glow effect */}
                            <div 
                                className={`absolute inset-0 rounded-3xl transition-opacity duration-500 -z-10 blur-xl ${hoveredBrand === brand.id ? 'opacity-30' : 'opacity-0'}`}
                                style={{ 
                                    background: `linear-gradient(135deg, ${brand.primaryColor}, ${brand.secondaryColor})` 
                                }}
                            />
                        </Link>
                    ))}
                </div>
                
                {/* Call to Action for new brands */}
                <div className="mt-10 text-center">
                    <div className="inline-flex flex-col sm:flex-row items-center gap-4 bg-gradient-to-r from-gray-50 to-orange-50 border border-orange-100 rounded-2xl p-6">
                        <div className="text-center sm:text-right">
                            <h4 className="font-bold text-brand-brown mb-1">هل لديك براند؟</h4>
                            <p className="text-sm text-gray-500">انضم لشركائنا واعرض منتجاتك لملايين العملاء</p>
                        </div>
                        <Link 
                            to="/contact" 
                            className="bg-brand-orange text-white px-6 py-3 rounded-xl font-bold hover:bg-brand-brown transition-colors flex items-center gap-2 whitespace-nowrap"
                        >
                            <Crown size={18} />
                            سجل براندك الآن
                        </Link>
                    </div>
                </div>
            </div>
        </section>
    );
};

export default BrandsCarousel;
