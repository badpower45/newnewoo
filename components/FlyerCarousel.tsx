import React, { useRef } from 'react';
import { Link } from 'react-router-dom';
import { ChevronLeft, ChevronRight, BookOpen, Sparkles, Star, TrendingUp, ShoppingBag } from 'lucide-react';

interface FlyerPage {
    id: number;
    image: string;
    title: string;
}

interface FlyerCarouselProps {
    pages: FlyerPage[];
}

const FlyerCarousel: React.FC<FlyerCarouselProps> = ({ pages }) => {
    const scrollRef = useRef<HTMLDivElement>(null);

    const scroll = (direction: 'left' | 'right') => {
        if (scrollRef.current) {
            const scrollAmount = 280;
            scrollRef.current.scrollBy({
                left: direction === 'left' ? scrollAmount : -scrollAmount,
                behavior: 'smooth'
            });
        }
    };

    // Get current date range
    const getDateRange = () => {
        const now = new Date();
        const end = new Date(now);
        end.setDate(end.getDate() + 7);
        const formatDate = (date: Date) => `${date.getDate()}/${date.getMonth() + 1}`;
        return `${formatDate(now)} - ${formatDate(end)}`;
    };

    return (
        <div className="relative -mx-4 md:mx-0 my-8">
            {/* Modern Clean Header */}
            <div className="relative overflow-hidden bg-gradient-to-br from-brand-brown via-amber-700 to-brand-orange pt-6 pb-20 px-4 md:rounded-t-3xl shadow-xl">
                {/* Subtle Pattern Overlay */}
                <div className="absolute inset-0 opacity-10">
                    <div className="absolute inset-0" style={{
                        backgroundImage: 'radial-gradient(circle at 20px 20px, white 2px, transparent 0)',
                        backgroundSize: '40px 40px'
                    }} />
                </div>

                <div className="relative z-10 flex items-center justify-between">
                    <div className="flex items-center gap-4">
                        <div className="w-14 h-14 bg-white/90 backdrop-blur rounded-2xl flex items-center justify-center shadow-lg">
                            <ShoppingBag className="w-7 h-7 text-brand-orange" />
                        </div>
                        <div>
                            <div className="flex items-center gap-2 mb-1">
                                <h3 className="text-white text-2xl font-extrabold">مجلة العروض</h3>
                                <Sparkles className="w-5 h-5 text-yellow-300 animate-pulse" />
                            </div>
                            <p className="text-white/90 text-sm font-medium flex items-center gap-2">
                                <TrendingUp className="w-4 h-4" />
                                عروض حصرية • {getDateRange()}
                            </p>
                        </div>
                    </div>
                    <Link 
                        to="/magazine" 
                        className="hidden md:flex items-center gap-2 px-5 py-2.5 bg-white text-brand-orange rounded-full text-sm font-bold hover:bg-yellow-50 hover:shadow-lg transition-all transform hover:scale-105"
                    >
                        عرض الكل
                        <ChevronLeft className="w-4 h-4" />
                    </Link>
                </div>
            </div>

            {/* Modern Carousel Container */}
            <div className="bg-gradient-to-br from-orange-50 via-amber-50 to-yellow-50 -mt-14 pt-16 pb-6 px-4 md:rounded-b-3xl relative shadow-xl">
                {/* Navigation Buttons - Redesigned */}
                <button
                    onClick={() => scroll('right')}
                    className="absolute right-2 top-1/2 -translate-y-1/2 z-20 w-10 h-10 bg-gradient-to-br from-brand-orange to-orange-600 text-white shadow-xl rounded-xl flex items-center justify-center hover:scale-110 transition-transform md:right-0 md:-mr-5"
                >
                    <ChevronRight className="w-5 h-5" />
                </button>
                <button
                    onClick={() => scroll('left')}
                    className="absolute left-2 top-1/2 -translate-y-1/2 z-20 w-10 h-10 bg-gradient-to-br from-brand-orange to-orange-600 text-white shadow-xl rounded-xl flex items-center justify-center hover:scale-110 transition-transform md:left-0 md:-ml-5"
                >
                    <ChevronLeft className="w-5 h-5" />
                </button>

                {/* Pages Carousel - Modern Cards */}
                <div 
                    ref={scrollRef}
                    className="flex gap-5 overflow-x-auto pb-3 pt-1 no-scrollbar snap-x scroll-smooth px-1"
                >
                    {pages.map((page, index) => (
                        <Link 
                            key={page.id} 
                            to="/magazine"
                            className="snap-center flex-shrink-0 group"
                        >
                            <div className="relative w-44 md:w-60">
                                {/* Star Badge with Page Number */}
                                <div className="absolute -top-3 -right-3 z-10 w-12 h-12 bg-gradient-to-br from-yellow-400 via-yellow-500 to-amber-500 text-white rounded-2xl flex items-center justify-center shadow-lg transform rotate-3 group-hover:rotate-6 transition-transform">
                                    <div className="flex flex-col items-center">
                                        <Star className="w-4 h-4 fill-white" />
                                        <span className="text-xs font-bold">{index + 1}</span>
                                    </div>
                                </div>

                                {/* Magazine Card - Clean Modern Design */}
                                <div className="relative rounded-2xl overflow-hidden shadow-2xl bg-white transform group-hover:scale-105 group-hover:-rotate-1 transition-all duration-300 cursor-pointer border-2 border-orange-100">
                                    <img
                                        src={page.image}
                                        alt={page.title}
                                        className="w-full h-56 md:h-72 object-cover"
                                    />
                                    
                                    {/* Gradient Overlay - Softer */}
                                    <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent" />
                                    
                                    {/* Content Overlay */}
                                    <div className="absolute bottom-0 left-0 right-0 p-4">
                                        <div className="flex items-center gap-2 mb-2">
                                            <div className="w-8 h-8 bg-white/20 backdrop-blur-sm rounded-lg flex items-center justify-center">
                                                <Sparkles className="w-4 h-4 text-white" />
                                            </div>
                                            <span className="text-white/90 text-xs font-medium px-2 py-1 bg-white/10 backdrop-blur-sm rounded-full">
                                                عرض خاص
                                            </span>
                                        </div>
                                        <p className="text-white text-base font-bold line-clamp-2">{page.title}</p>
                                    </div>

                                    {/* Hover Shine Effect */}
                                    <div className="absolute inset-0 bg-gradient-to-tr from-transparent via-white/0 to-white/0 group-hover:via-white/10 transition-all duration-500" />
                                </div>

                                {/* Floating Shadow */}
                                <div className="absolute -bottom-2 left-4 right-4 h-6 bg-gradient-to-b from-black/20 to-transparent blur-xl rounded-full" />
                            </div>
                        </Link>
                    ))}

                    {/* View All Card - Redesigned */}
                    <Link to="/magazine" className="snap-center flex-shrink-0">
                        <div className="w-44 md:w-60 h-56 md:h-72 rounded-2xl bg-gradient-to-br from-orange-100 via-amber-50 to-yellow-100 border-2 border-dashed border-brand-orange/40 flex flex-col items-center justify-center gap-4 hover:border-brand-orange hover:shadow-xl transition-all cursor-pointer group">
                            <div className="w-16 h-16 bg-gradient-to-br from-brand-orange to-orange-600 rounded-2xl flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform">
                                <BookOpen className="w-8 h-8 text-white" />
                            </div>
                            <div className="text-center px-4">
                                <p className="text-brand-orange font-bold text-lg mb-1">تصفح المجلة</p>
                                <p className="text-gray-600 text-sm">شاهد جميع العروض</p>
                            </div>
                            <ChevronLeft className="w-5 h-5 text-brand-orange group-hover:translate-x-1 transition-transform" />
                        </div>
                    </Link>
                </div>
            </div>
        </div>
    );
};

export default FlyerCarousel;
