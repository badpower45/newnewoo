import React, { useRef } from 'react';
import { Link } from 'react-router-dom';
import { ChevronLeft, ChevronRight, BookOpen, Sparkles } from 'lucide-react';

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
        <div className="relative -mx-4 md:mx-0">
            {/* Gradient Header - Magazine Style */}
            <div className="relative overflow-hidden bg-gradient-to-l from-[#F97316] via-[#FB923C] to-[#FDBA74] pt-4 pb-16 px-4 md:rounded-t-2xl">
                {/* Confetti Decorations */}
                <div className="absolute inset-0 overflow-hidden pointer-events-none">
                    <div className="absolute top-4 right-4 w-3 h-3 bg-yellow-300 rounded-full opacity-80 animate-bounce" style={{ animationDelay: '0s' }} />
                    <div className="absolute top-8 right-16 w-2 h-2 bg-white rounded-full opacity-60 animate-bounce" style={{ animationDelay: '0.2s' }} />
                    <div className="absolute top-6 left-8 w-2.5 h-2.5 bg-pink-300 rounded-full opacity-70 animate-bounce" style={{ animationDelay: '0.4s' }} />
                    <div className="absolute top-12 left-20 w-2 h-2 bg-yellow-200 rounded-full opacity-50 animate-bounce" style={{ animationDelay: '0.6s' }} />
                    <div className="absolute bottom-8 right-12 w-4 h-4 bg-white/30 rounded-full" />
                    <div className="absolute bottom-12 left-12 w-3 h-3 bg-purple-300/50 rounded-full" />
                    {/* Decorative shapes */}
                    <div className="absolute top-2 left-1/4 text-white/30 text-2xl">✦</div>
                    <div className="absolute top-10 right-1/4 text-yellow-200/40 text-xl">★</div>
                    <div className="absolute bottom-4 right-1/3 text-white/20 text-lg">◆</div>
                </div>

                <div className="flex items-center justify-between relative z-10">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-white/20 backdrop-blur-sm rounded-xl flex items-center justify-center">
                            <BookOpen className="w-5 h-5 text-white" />
                        </div>
                        <div>
                            <h3 className="text-white text-lg font-bold flex items-center gap-2">
                                مجلة العروض الأسبوعية
                                <Sparkles className="w-4 h-4 text-yellow-200" />
                            </h3>
                            <p className="text-white/80 text-xs">عروض حصرية {getDateRange()}</p>
                        </div>
                    </div>
                    <Link 
                        to="/magazine" 
                        className="px-4 py-2 bg-white/20 backdrop-blur-sm text-white rounded-full text-sm font-medium hover:bg-white/30 transition-colors"
                    >
                        عرض الكل
                    </Link>
                </div>
            </div>

            {/* Carousel Container */}
            <div className="bg-[#FFF7ED] -mt-10 pb-4 px-4 md:rounded-b-2xl relative">
                {/* Navigation Buttons */}
                <button
                    onClick={() => scroll('right')}
                    className="absolute right-2 top-1/2 -translate-y-1/2 z-20 w-8 h-8 bg-white shadow-lg rounded-full flex items-center justify-center hover:bg-gray-50 transition-colors md:right-0 md:-mr-4"
                >
                    <ChevronRight className="w-4 h-4 text-gray-600" />
                </button>
                <button
                    onClick={() => scroll('left')}
                    className="absolute left-2 top-1/2 -translate-y-1/2 z-20 w-8 h-8 bg-white shadow-lg rounded-full flex items-center justify-center hover:bg-gray-50 transition-colors md:left-0 md:-ml-4"
                >
                    <ChevronLeft className="w-4 h-4 text-gray-600" />
                </button>

                {/* Pages Carousel */}
                <div 
                    ref={scrollRef}
                    className="flex gap-4 overflow-x-auto pb-2 pt-2 no-scrollbar snap-x scroll-smooth"
                >
                    {pages.map((page, index) => (
                        <Link 
                            key={page.id} 
                            to="/magazine"
                            className="snap-center flex-shrink-0 group"
                        >
                            <div className="relative w-40 md:w-52">
                                {/* Page Number Badge */}
                                <div className="absolute -top-2 -right-2 z-10 w-8 h-8 bg-[#F97316] text-white rounded-full flex items-center justify-center text-sm font-bold shadow-lg">
                                    {index + 1}
                                </div>

                                {/* Magazine Page */}
                                <div className="relative rounded-xl overflow-hidden shadow-lg border-4 border-white transform group-hover:-rotate-2 group-hover:scale-105 transition-all duration-300 cursor-pointer">
                                    <img
                                        src={page.image}
                                        alt={page.title}
                                        className="w-full h-52 md:h-64 object-cover"
                                    />
                                    {/* Gradient Overlay */}
                                    <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />
                                    
                                    {/* Title */}
                                    <div className="absolute bottom-2 right-2 left-2">
                                        <p className="text-white text-sm font-medium truncate">{page.title}</p>
                                    </div>

                                    {/* Hover Effect */}
                                    <div className="absolute inset-0 bg-[#F97316]/0 group-hover:bg-[#F97316]/10 transition-colors" />
                                </div>

                                {/* Shadow/Depth Effect */}
                                <div className="absolute -bottom-2 left-2 right-2 h-4 bg-black/10 blur-md rounded-full" />
                            </div>
                        </Link>
                    ))}

                    {/* View All Card */}
                    <Link to="/magazine" className="snap-center flex-shrink-0">
                        <div className="w-40 md:w-52 h-52 md:h-64 rounded-xl border-4 border-dashed border-[#F97316]/40 flex flex-col items-center justify-center gap-3 hover:border-[#F97316] hover:bg-[#F97316]/5 transition-colors cursor-pointer">
                            <div className="w-12 h-12 bg-[#F97316]/10 rounded-full flex items-center justify-center">
                                <BookOpen className="w-6 h-6 text-[#F97316]" />
                            </div>
                            <span className="text-[#F97316] font-bold">تصفح المجلة</span>
                        </div>
                    </Link>
                </div>
            </div>
        </div>
    );
};

export default FlyerCarousel;
