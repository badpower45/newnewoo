import React, { useState, useEffect, useRef } from 'react';
import { ChevronLeft, ChevronRight, ShoppingBag } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { api } from '../services/api';

interface HeroSection {
    id: number;
    title_ar: string;
    subtitle_ar: string;
    description_ar: string;
    image_url: string;
    mobile_image_url?: string;
    image_alt_ar?: string;
    button1_text_ar?: string;
    button1_link?: string;
    button1_color?: string;
    button1_enabled: boolean;
    button2_text_ar?: string;
    button2_link?: string;
    button2_color?: string;
    button2_enabled: boolean;
    background_color: string;
    text_color: string;
}

const HeroCarousel: React.FC = () => {
    const [heroSections, setHeroSections] = useState<HeroSection[]>([]);
    const [currentIndex, setCurrentIndex] = useState(0);
    const [isAutoPlaying, setIsAutoPlaying] = useState(true);
    const [loading, setLoading] = useState(true);
    const touchStartX = useRef<number>(0);
    const touchEndX = useRef<number>(0);
    const navigate = useNavigate();

    useEffect(() => {
        const fetchHeroSections = async () => {
            try {
                console.log('🎬 Fetching hero sections...');
                const response = await api.get('/hero-sections');
                if (response.data.success && response.data.data) {
                    const active = response.data.data.filter((s: HeroSection) => s.is_active);
                    setHeroSections(active);
                    console.log('✅ Loaded', active.length, 'hero sections');
                }
            } catch (error) {
                console.error('❌ Error:', error);
            } finally {
                setLoading(false);
            }
        };
        fetchHeroSections();
    }, []);

    useEffect(() => {
        if (!isAutoPlaying || heroSections.length === 0) return;
        const interval = setInterval(() => {
            setCurrentIndex((prev) => (prev + 1) % heroSections.length);
        }, 5000);
        return () => clearInterval(interval);
    }, [isAutoPlaying, heroSections.length]);

    const goToSlide = (index: number) => {
        setCurrentIndex(index);
        setIsAutoPlaying(false);
        setTimeout(() => setIsAutoPlaying(true), 10000);
    };

    const goNext = () => goToSlide((currentIndex + 1) % heroSections.length);
    const goPrev = () => goToSlide((currentIndex - 1 + heroSections.length) % heroSections.length);

    const handleTouchStart = (e: React.TouchEvent) => {
        touchStartX.current = e.touches[0].clientX;
    };

    const handleTouchMove = (e: React.TouchEvent) => {
        touchEndX.current = e.touches[0].clientX;
    };

    const handleTouchEnd = () => {
        const diff = touchStartX.current - touchEndX.current;
        if (Math.abs(diff) > 50) {
            if (diff > 0) goPrev();
            else goNext();
        }
    };

    if (loading) {
        return <div className="w-full rounded-2xl h-32 sm:h-40 md:h-48 lg:h-56 bg-gray-200 animate-pulse" />;
    }

    if (heroSections.length === 0) return null;

    const current = heroSections[currentIndex];

    return (
        <div className="relative overflow-hidden rounded-2xl shadow-lg">
            <div
                className="relative h-[140px] sm:h-[160px] md:h-[200px] lg:h-[250px]"
                onTouchStart={handleTouchStart}
                onTouchMove={handleTouchMove}
                onTouchEnd={handleTouchEnd}
                onMouseEnter={() => setIsAutoPlaying(false)}
                onMouseLeave={() => setIsAutoPlaying(true)}
            >
                <div className="absolute inset-0" style={{ backgroundColor: current.background_color || '#F97316' }}>
                    {current.image_url && (
                        <img src={current.image_url} alt={current.image_alt_ar || current.title_ar} className="w-full h-full object-cover" />
                    )}
                </div>

                <div className="absolute inset-0 overflow-hidden">
                    <div className="absolute top-0 left-0 w-20 sm:w-24 md:w-32 h-20 sm:h-24 md:h-32 bg-white/10 rounded-full -translate-x-1/2 -translate-y-1/2" />
                    <div className="absolute bottom-0 right-0 w-28 sm:w-36 md:w-48 h-28 sm:h-36 md:h-48 bg-white/5 rounded-full translate-x-1/4 translate-y-1/4" />
                </div>

                <div className="relative h-full flex items-center px-3 sm:px-4 md:px-6 lg:px-8">
                    {current.mobile_image_url && (
                        <div className="w-20 sm:w-24 md:w-36 lg:w-44 h-16 sm:h-20 md:h-28 lg:h-36 flex-shrink-0 ml-2 sm:ml-3 md:ml-4">
                            <img src={current.mobile_image_url} alt={current.title_ar} className="w-full h-full object-cover rounded-lg sm:rounded-xl md:rounded-2xl shadow-lg" />
                        </div>
                    )}

                    <div className="flex-1 text-right z-10 pr-1 sm:pr-2">
                        {current.description_ar && (
                            <div className="inline-block bg-white/20 backdrop-blur-sm px-2 sm:px-3 py-0.5 sm:py-1 rounded-full text-[9px] sm:text-[10px] md:text-xs lg:text-sm font-bold mb-1 sm:mb-2" style={{ color: current.text_color || '#fff' }}>
                                🔥 {current.description_ar}
                            </div>
                        )}

                        <h2 className="text-base sm:text-lg md:text-2xl lg:text-3xl font-bold mb-0.5 sm:mb-1 md:mb-2 drop-shadow-lg leading-tight" style={{ color: current.text_color || '#fff' }}>
                            {current.title_ar}
                        </h2>

                        <p className="text-[9px] sm:text-[10px] md:text-xs lg:text-sm mb-1.5 sm:mb-2 md:mb-3 line-clamp-2 leading-snug" style={{ color: current.text_color || '#fff', opacity: 0.9 }}>
                            {current.subtitle_ar}
                        </p>

                        <div className="flex gap-2 items-center mr-auto">
                            {current.button1_enabled && current.button1_link && (
                                <button onClick={() => navigate(current.button1_link!)} className="px-2 sm:px-3 md:px-4 py-1 sm:py-1.5 md:py-2 rounded-full font-bold text-[9px] sm:text-[10px] md:text-xs lg:text-sm flex items-center gap-1 sm:gap-1.5 hover:scale-105 transition-transform shadow-md" style={{ backgroundColor: current.button1_color || '#fff', color: '#000' }}>
                                    <ShoppingBag className="w-2.5 h-2.5 sm:w-3 sm:h-3 md:w-4 md:h-4" />
                                    {current.button1_text_ar}
                                </button>
                            )}
                            {current.button2_enabled && current.button2_link && (
                                <button onClick={() => navigate(current.button2_link!)} className="px-2 sm:px-3 md:px-4 py-1 sm:py-1.5 md:py-2 rounded-full font-bold text-[9px] sm:text-[10px] md:text-xs lg:text-sm hover:scale-105 transition-transform shadow-md" style={{ backgroundColor: current.button2_color || '#4ECDC4', color: '#fff' }}>
                                    {current.button2_text_ar}
                                </button>
                            )}
                        </div>
                    </div>
                </div>

                <button onClick={goNext} className="absolute right-1 sm:right-2 top-1/2 -translate-y-1/2 w-6 h-6 sm:w-7 sm:h-7 md:w-8 md:h-8 bg-white/20 backdrop-blur-sm rounded-full flex items-center justify-center text-white hover:bg-white/40 transition-colors z-20">
                    <ChevronRight className="w-3.5 h-3.5 sm:w-4 sm:h-4 md:w-5 md:h-5" />
                </button>
                <button onClick={goPrev} className="absolute left-1 sm:left-2 top-1/2 -translate-y-1/2 w-6 h-6 sm:w-7 sm:h-7 md:w-8 md:h-8 bg-white/20 backdrop-blur-sm rounded-full flex items-center justify-center text-white hover:bg-white/40 transition-colors z-20">
                    <ChevronLeft className="w-3.5 h-3.5 sm:w-4 sm:h-4 md:w-5 md:h-5" />
                </button>
            </div>

            <div className="absolute bottom-2 sm:bottom-3 left-1/2 -translate-x-1/2 flex gap-1 sm:gap-1.5 z-20">
                {heroSections.map((_, index) => (
                    <button key={index} onClick={() => goToSlide(index)} className={`h-1.5 sm:h-2 rounded-full transition-all duration-300 ${index === currentIndex ? 'w-4 sm:w-6 bg-white' : 'w-1.5 sm:w-2 bg-white/50 hover:bg-white/70'}`} />
                ))}
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
