import React, { useState, useEffect, useRef } from 'react';
import { ChevronLeft, ChevronRight, ShoppingBag } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

interface Offer {
    id: number;
    title: string;
    subtitle: string;
    discount?: string;
    buttonText: string;
    link: string;
    image: string;
    bgGradient: string;
}

const offers: Offer[] = [
    {
        id: 1,
        title: 'عروض حصرية',
        subtitle: 'على جميع منتجات الشوكولاتة والحلويات',
        discount: 'خصم يصل إلى 50%',
        buttonText: 'تسوق الآن',
        link: '/products?category=شوكولاتة',
        image: 'https://images.unsplash.com/photo-1606312619070-d48b4c652a52?w=600',
        bgGradient: 'from-[#8B4513] via-[#A0522D] to-[#D2691E]'
    },
    {
        id: 2,
        title: 'منتجات طازجة يومياً',
        subtitle: 'ألبان وأجبان طازجة من أفضل المزارع',
        discount: 'خصم 30%',
        buttonText: 'اكتشف المنتجات',
        link: '/products?category=ألبان',
        image: 'https://images.unsplash.com/photo-1563636619-e9143da7973b?w=600',
        bgGradient: 'from-[#0EA5E9] via-[#0284C7] to-[#0369A1]'
    },
    {
        id: 3,
        title: 'عروض رمضان',
        subtitle: 'تجهيزات شهر الخير بأفضل الأسعار',
        discount: 'عروض مميزة',
        buttonText: 'شاهد العروض',
        link: '/deals',
        image: 'https://images.unsplash.com/photo-1542838132-92c53300491e?w=600',
        bgGradient: 'from-[#F97316] via-[#EA580C] to-[#C2410C]'
    },
    {
        id: 4,
        title: 'مشروبات منعشة',
        subtitle: 'عصائر ومشروبات غازية بأسعار لا تُقاوم',
        discount: 'اشترِ 2 واحصل على 1 مجاناً',
        buttonText: 'تسوق الآن',
        link: '/products?category=مشروبات',
        image: 'https://images.unsplash.com/photo-1534353473418-4cfa6c56fd38?w=600',
        bgGradient: 'from-[#10B981] via-[#059669] to-[#047857]'
    }
];

const HeroCarousel: React.FC = () => {
    const [currentIndex, setCurrentIndex] = useState(0);
    const [isAutoPlaying, setIsAutoPlaying] = useState(true);
    const touchStartX = useRef<number>(0);
    const touchEndX = useRef<number>(0);
    const navigate = useNavigate();

    // Auto-play
    useEffect(() => {
        if (!isAutoPlaying) return;
        
        const interval = setInterval(() => {
            setCurrentIndex((prev) => (prev + 1) % offers.length);
        }, 5000);

        return () => clearInterval(interval);
    }, [isAutoPlaying]);

    const goToSlide = (index: number) => {
        setCurrentIndex(index);
        setIsAutoPlaying(false);
        setTimeout(() => setIsAutoPlaying(true), 10000);
    };

    const goNext = () => {
        goToSlide((currentIndex + 1) % offers.length);
    };

    const goPrev = () => {
        goToSlide((currentIndex - 1 + offers.length) % offers.length);
    };

    // Touch handlers for swipe
    const handleTouchStart = (e: React.TouchEvent) => {
        touchStartX.current = e.touches[0].clientX;
    };

    const handleTouchMove = (e: React.TouchEvent) => {
        touchEndX.current = e.touches[0].clientX;
    };

    const handleTouchEnd = () => {
        const diff = touchStartX.current - touchEndX.current;
        const threshold = 50;

        if (Math.abs(diff) > threshold) {
            if (diff > 0) {
                goPrev(); // Swipe left (RTL - go to previous)
            } else {
                goNext(); // Swipe right (RTL - go to next)
            }
        }
    };

    const currentOffer = offers[currentIndex];

    return (
        <div className="relative overflow-hidden rounded-2xl shadow-lg">
            {/* Main Carousel */}
            <div
                className="relative h-[140px] sm:h-[160px] md:h-[200px] lg:h-[250px]"
                onTouchStart={handleTouchStart}
                onTouchMove={handleTouchMove}
                onTouchEnd={handleTouchEnd}
            >
                {/* Background Gradient */}
                <div className={`absolute inset-0 bg-gradient-to-l ${currentOffer.bgGradient} transition-all duration-700`} />

                {/* Decorative Elements */}
                <div className="absolute inset-0 overflow-hidden">
                    <div className="absolute top-0 left-0 w-20 sm:w-24 md:w-32 h-20 sm:h-24 md:h-32 bg-white/10 rounded-full -translate-x-1/2 -translate-y-1/2" />
                    <div className="absolute bottom-0 right-0 w-28 sm:w-36 md:w-48 h-28 sm:h-36 md:h-48 bg-white/5 rounded-full translate-x-1/4 translate-y-1/4" />
                    <div className="absolute top-1/2 left-1/4 w-2 md:w-3 h-2 md:h-3 bg-white/30 rounded-full" />
                </div>

                {/* Content */}
                <div className="relative h-full flex items-center px-3 sm:px-4 md:px-6 lg:px-8">
                    {/* Product Image - على الشمال */}
                    <div className="w-20 sm:w-24 md:w-36 lg:w-44 h-16 sm:h-20 md:h-28 lg:h-36 flex-shrink-0 ml-2 sm:ml-3 md:ml-4">
                        <img
                            src={currentOffer.image}
                            alt={currentOffer.title}
                            className="w-full h-full object-cover rounded-lg sm:rounded-xl md:rounded-2xl shadow-lg transform hover:scale-105 transition-transform"
                        />
                    </div>

                    {/* Text Content - على اليمين */}
                    <div className="flex-1 text-right z-10 pr-1 sm:pr-2">
                        {/* Discount Badge */}
                        {currentOffer.discount && (
                            <div className="inline-block bg-white/20 backdrop-blur-sm text-white px-2 sm:px-3 py-0.5 sm:py-1 rounded-full text-[9px] sm:text-[10px] md:text-xs lg:text-sm font-bold mb-1 sm:mb-2">
                                🔥 {currentOffer.discount}
                            </div>
                        )}

                        {/* Title */}
                        <h2 className="text-base sm:text-lg md:text-2xl lg:text-3xl font-bold text-white mb-0.5 sm:mb-1 md:mb-2 drop-shadow-lg leading-tight">
                            {currentOffer.title}
                        </h2>

                        {/* Subtitle */}
                        <p className="text-white/90 text-[9px] sm:text-[10px] md:text-xs lg:text-sm mb-1.5 sm:mb-2 md:mb-3 line-clamp-2 leading-snug">
                            {currentOffer.subtitle}
                        </p>

                        {/* CTA Button */}
                        <button
                            onClick={() => navigate(currentOffer.link)}
                            className="bg-white text-gray-900 px-2 sm:px-3 md:px-4 py-1 sm:py-1.5 md:py-2 rounded-full font-bold text-[9px] sm:text-[10px] md:text-xs lg:text-sm flex items-center gap-1 sm:gap-1.5 hover:scale-105 transition-transform shadow-md mr-auto"
                        >
                            <ShoppingBag className="w-2.5 h-2.5 sm:w-3 sm:h-3 md:w-4 md:h-4" />
                            {currentOffer.buttonText}
                        </button>
                    </div>
                </div>

                {/* Navigation Arrows */}
                <button
                    onClick={goNext}
                    className="absolute right-1 sm:right-2 top-1/2 -translate-y-1/2 w-6 h-6 sm:w-7 sm:h-7 md:w-8 md:h-8 bg-white/20 backdrop-blur-sm rounded-full flex items-center justify-center text-white hover:bg-white/40 transition-colors z-20"
                >
                    <ChevronRight className="w-3.5 h-3.5 sm:w-4 sm:h-4 md:w-5 md:h-5" />
                </button>
                <button
                    onClick={goPrev}
                    className="absolute left-1 sm:left-2 top-1/2 -translate-y-1/2 w-6 h-6 sm:w-7 sm:h-7 md:w-8 md:h-8 bg-white/20 backdrop-blur-sm rounded-full flex items-center justify-center text-white hover:bg-white/40 transition-colors z-20"
                >
                    <ChevronLeft className="w-3.5 h-3.5 sm:w-4 sm:h-4 md:w-5 md:h-5" />
                </button>
            </div>

            {/* Dots Indicator */}
            <div className="absolute bottom-2 sm:bottom-3 left-1/2 -translate-x-1/2 flex gap-1 sm:gap-1.5 z-20">
                {offers.map((_, index) => (
                    <button
                        key={index}
                        onClick={() => goToSlide(index)}
                        className={`h-1.5 sm:h-2 rounded-full transition-all duration-300 ${
                            index === currentIndex 
                                ? 'w-4 sm:w-6 bg-white' 
                                : 'w-1.5 sm:w-2 bg-white/50 hover:bg-white/70'
                        }`}
                    />
                ))}
            </div>

            {/* Progress Bar */}
            <div className="absolute bottom-0 left-0 right-0 h-1 bg-white/20">
                <div 
                    className="h-full bg-white transition-all duration-100"
                    style={{ 
                        width: isAutoPlaying ? '100%' : '0%',
                        animation: isAutoPlaying ? 'progress 5s linear infinite' : 'none'
                    }}
                />
            </div>

            <style>{`
                @keyframes progress {
                    from { width: 0%; }
                    to { width: 100%; }
                }
            `}</style>
        </div>
    );
};

export default HeroCarousel;
