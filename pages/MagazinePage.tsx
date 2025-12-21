import React, { useState, useEffect } from 'react';
import { ArrowRight, ChevronLeft, ChevronRight, ExternalLink, Loader } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { api } from '../services/api';

interface MagazinePage {
    id: number;
    page_number: number;
    image_url: string;
    title?: string;
    description?: string;
    display_order: number;
    cta_text?: string;
    cta_url?: string;
}

const MagazinePage: React.FC = () => {
    const navigate = useNavigate();
    const [pages, setPages] = useState<MagazinePage[]>([]);
    const [currentPage, setCurrentPage] = useState(0);
    const [loading, setLoading] = useState(true);
    const [touchStart, setTouchStart] = useState<number | null>(null);
    const [touchEnd, setTouchEnd] = useState<number | null>(null);

    // Minimum swipe distance (in px)
    const minSwipeDistance = 50;

    useEffect(() => {
        loadMagazinePages();
    }, []);

    const loadMagazinePages = async () => {
        try {
            // Try to load from API (if endpoint exists)
            try {
                const response = await api.get('/magazine/pages');
                if (response.data && response.data.length > 0) {
                    setPages(response.data);
                    setLoading(false);
                    return;
                }
            } catch (apiError) {
                console.log('API endpoint not available, using mock data');
            }

            // Fallback to mock data for demo
            const mockPages: MagazinePage[] = [
                {
                    id: 1,
                    page_number: 1,
                    image_url: 'https://images.unsplash.com/photo-1534723328310-e82dad3ee43f?w=1200&h=1800&fit=crop',
                    title: 'عروض الأسبوع',
                    description: 'خصومات تصل إلى 50% على جميع المنتجات',
                    display_order: 1,
                    cta_text: 'تسوق الآن',
                    cta_url: '/products'
                },
                {
                    id: 2,
                    page_number: 2,
                    image_url: 'https://images.unsplash.com/photo-1542838132-92c53300491e?w=1200&h=1800&fit=crop',
                    title: 'عروض الخضار والفواكه',
                    description: 'طازج يومياً بأفضل الأسعار',
                    display_order: 2,
                    cta_text: 'شاهد العروض',
                    cta_url: '/categories'
                },
                {
                    id: 3,
                    page_number: 3,
                    image_url: 'https://images.unsplash.com/photo-1604719312566-8912e9227c6a?w=1200&h=1800&fit=crop',
                    title: 'منتجات الألبان',
                    description: 'جودة عالية وأسعار منافسة',
                    display_order: 3,
                    cta_text: 'تصفح المنتجات',
                    cta_url: '/products'
                },
                {
                    id: 4,
                    page_number: 4,
                    image_url: 'https://images.unsplash.com/photo-1506617420156-8e4536971650?w=1200&h=1800&fit=crop',
                    title: 'المخبوزات الطازجة',
                    description: 'كل يوم عروض جديدة',
                    display_order: 4,
                    cta_text: 'اطلب الآن',
                    cta_url: '/deals'
                },
                {
                    id: 5,
                    page_number: 5,
                    image_url: 'https://images.unsplash.com/photo-1567620905732-2d1ec7ab7445?w=1200&h=1800&fit=crop',
                    title: 'وجبات جاهزة',
                    description: 'اختصر وقتك مع وجباتنا اللذيذة',
                    display_order: 5,
                    cta_text: 'اكتشف المزيد',
                    cta_url: '/hot-deals'
                },
                {
                    id: 6,
                    page_number: 6,
                    image_url: 'https://images.unsplash.com/photo-1610832958506-aa56368176cf?w=1200&h=1800&fit=crop',
                    title: 'العروض الحصرية',
                    description: 'عروض محدودة - لا تفوتها!',
                    display_order: 6,
                    cta_text: 'احصل عليها',
                    cta_url: '/magazine'
                }
            ];
            
            setPages(mockPages);
        } catch (error) {
            console.error('Failed to load magazine pages:', error);
        } finally {
            setLoading(false);
        }
    };

    const nextPage = () => {
        setCurrentPage((prev) => (prev + 1) % pages.length);
    };

    const prevPage = () => {
        setCurrentPage((prev) => (prev - 1 + pages.length) % pages.length);
    };

    const handleTouchStart = (e: React.TouchEvent) => {
        setTouchEnd(null);
        setTouchStart(e.targetTouches[0].clientX);
    };

    const handleTouchMove = (e: React.TouchEvent) => {
        setTouchEnd(e.targetTouches[0].clientX);
    };

    const handleTouchEnd = () => {
        if (!touchStart || !touchEnd) return;
        
        const distance = touchStart - touchEnd;
        const isLeftSwipe = distance > minSwipeDistance;
        const isRightSwipe = distance < -minSwipeDistance;

        if (isLeftSwipe) {
            nextPage();
        } else if (isRightSwipe) {
            prevPage();
        }
    };

    const handleCTAClick = (url?: string) => {
        if (url) {
            navigate(url);
        }
    };

    if (loading) {
        return (
            <div className="min-h-screen bg-gray-900 flex items-center justify-center">
                <Loader className="w-12 h-12 text-orange-500 animate-spin" />
            </div>
        );
    }

    if (pages.length === 0) {
        return (
            <div className="min-h-screen bg-gray-900 flex items-center justify-center">
                <div className="text-center text-white">
                    <p className="text-xl mb-4">لا توجد صفحات متاحة حالياً</p>
                    <button 
                        onClick={() => navigate(-1)}
                        className="text-orange-500 hover:underline"
                    >
                        العودة
                    </button>
                </div>
            </div>
        );
    }

    const currentPageData = pages[currentPage];

    return (
        <div className="min-h-screen bg-gray-900 relative overflow-hidden">
            {/* Header - Fixed Top */}
            <div className="fixed top-0 left-0 right-0 z-50 bg-gradient-to-b from-black/80 to-transparent p-4">
                <div className="flex items-center justify-between max-w-7xl mx-auto">
                    <button 
                        onClick={() => navigate(-1)}
                        className="w-10 h-10 bg-white/10 backdrop-blur-md rounded-full flex items-center justify-center hover:bg-white/20 transition-all"
                    >
                        <ArrowRight className="w-5 h-5 text-white" />
                    </button>
                    <h1 className="text-white text-lg font-bold">مجلة العروض</h1>
                    <div className="w-10 h-10" /> {/* Spacer for centering */}
                </div>
            </div>

            {/* Main Slideshow Container */}
            <div 
                className="h-screen w-full relative"
                onTouchStart={handleTouchStart}
                onTouchMove={handleTouchMove}
                onTouchEnd={handleTouchEnd}
            >
                {/* Magazine Page Image */}
                <div className="absolute inset-0">
                    <img 
                        src={currentPageData.image_url}
                        alt={currentPageData.title || `صفحة ${currentPageData.page_number}`}
                        className="w-full h-full object-contain bg-gray-900"
                        onError={(e) => {
                            (e.target as HTMLImageElement).src = 'https://placehold.co/1200x1800/1f2937/f97316?text=Magazine+Page';
                        }}
                    />
                    
                    {/* Gradient Overlay for better text visibility */}
                    <div className="absolute inset-0 bg-gradient-to-b from-transparent via-transparent to-black/60" />
                </div>

                {/* Page Info Overlay - Bottom */}
                {(currentPageData.title || currentPageData.description) && (
                    <div className="absolute bottom-0 left-0 right-0 p-6 pb-24 text-white">
                        <div className="max-w-2xl mx-auto text-center">
                            {currentPageData.title && (
                                <h2 className="text-3xl font-bold mb-2 drop-shadow-lg">
                                    {currentPageData.title}
                                </h2>
                            )}
                            {currentPageData.description && (
                                <p className="text-lg text-white/90 mb-4 drop-shadow-md">
                                    {currentPageData.description}
                                </p>
                            )}
                            {currentPageData.cta_text && (
                                <button
                                    onClick={() => handleCTAClick(currentPageData.cta_url)}
                                    className="bg-orange-500 hover:bg-orange-600 text-white px-8 py-3 rounded-full font-bold text-lg shadow-xl hover:shadow-2xl transition-all transform hover:scale-105 flex items-center gap-2 mx-auto"
                                >
                                    {currentPageData.cta_text}
                                    <ExternalLink size={20} />
                                </button>
                            )}
                        </div>
                    </div>
                )}

                {/* Navigation Arrows - Desktop */}
                <div className="hidden md:block">
                    <button
                        onClick={prevPage}
                        className="absolute left-4 top-1/2 -translate-y-1/2 w-14 h-14 bg-white/10 backdrop-blur-md rounded-full flex items-center justify-center hover:bg-white/20 transition-all z-40"
                    >
                        <ChevronRight className="w-8 h-8 text-white" />
                    </button>
                    <button
                        onClick={nextPage}
                        className="absolute right-4 top-1/2 -translate-y-1/2 w-14 h-14 bg-white/10 backdrop-blur-md rounded-full flex items-center justify-center hover:bg-white/20 transition-all z-40"
                    >
                        <ChevronLeft className="w-8 h-8 text-white" />
                    </button>
                </div>
            </div>

            {/* Page Indicators - Fixed Bottom */}
            <div className="fixed bottom-6 left-0 right-0 z-50">
                <div className="flex items-center justify-center gap-2">
                    {pages.map((page, index) => (
                        <button
                            key={page.id}
                            onClick={() => setCurrentPage(index)}
                            className={`transition-all ${
                                index === currentPage 
                                    ? 'w-8 h-2 bg-orange-500' 
                                    : 'w-2 h-2 bg-white/40 hover:bg-white/60'
                            } rounded-full`}
                            aria-label={`انتقل إلى الصفحة ${page.page_number}`}
                        />
                    ))}
                </div>
                <p className="text-white/70 text-center mt-2 text-sm">
                    {currentPage + 1} / {pages.length}
                </p>
            </div>

            {/* Swipe Hint - Shows on first load */}
            {currentPage === 0 && (
                <div className="fixed bottom-20 left-1/2 -translate-x-1/2 z-40 animate-bounce md:hidden">
                    <div className="bg-black/60 backdrop-blur-sm text-white px-4 py-2 rounded-full text-sm flex items-center gap-2">
                        <ChevronLeft size={16} />
                        اسحب للتصفح
                        <ChevronRight size={16} />
                    </div>
                </div>
            )}
        </div>
    );
};

export default MagazinePage;

    return (
        <div className="min-h-screen bg-[#FAFAFA] pb-20">
            {/* Header */}
            <div className="bg-gradient-to-br from-[#F97316] to-[#ea580c] p-4 pb-6 md:p-6 md:pb-8 relative overflow-hidden">
                {/* Confetti Background */}
                <div className="absolute inset-0 opacity-10">
                    <div className="absolute top-4 right-10 w-3 h-3 bg-yellow-300 rounded-full" />
                    <div className="absolute top-12 right-24 w-2 h-2 bg-white rounded-full" />
                    <div className="absolute top-8 left-16 w-4 h-4 bg-red-300 rounded-full" />
                    <div className="absolute bottom-4 right-32 w-3 h-3 bg-blue-300 rounded-full" />
                    <div className="absolute bottom-8 left-20 w-2 h-2 bg-green-300 rounded-full" />
                    <div className="absolute top-20 left-8 w-2 h-2 bg-pink-300 rounded-full" />
                    <div className="absolute bottom-12 right-12 w-4 h-4 bg-purple-300 rounded-full" />
                </div>

                <div className="flex items-center gap-2 mb-3 relative">
                    <button 
                        onClick={() => navigate(-1)} 
                        className="w-9 h-9 bg-white/20 backdrop-blur-sm rounded-full flex items-center justify-center hover:bg-white/30 transition-colors flex-shrink-0"
                    >
                        <ArrowRight className="w-5 h-5 text-white" />
                    </button>
                    <h1 className="text-white text-base md:text-xl font-bold line-clamp-1">مجلة العروض الأسبوعية</h1>
                </div>

                <p className="text-white/90 relative text-xs md:text-sm">
                    عروض حصرية ومتنوعة {getDateRange()}
                </p>
            </div>

            {/* Categories */}
            <div className="px-3 md:px-4 -mt-3 md:-mt-4 mb-3 md:mb-4 relative z-10">
                <div className="bg-white rounded-xl md:rounded-2xl shadow-lg p-2 md:p-3 overflow-x-auto scrollbar-hide">
                    <div className="flex gap-1.5 md:gap-2">
                        {categories.map((category, index) => (
                            <button
                                key={index}
                                onClick={() => setSelectedCategory(category)}
                                className={`px-3 md:px-4 py-1.5 md:py-2 rounded-full whitespace-nowrap transition-all text-xs md:text-sm font-medium ${
                                    selectedCategory === category
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

            {/* Loading State */}
            {loading ? (
                <div className="flex items-center justify-center py-20">
                    <Loader className="w-8 h-8 text-[#F97316] animate-spin" />
                </div>
            ) : (
                <>
                    {/* Offers Grid - Magazine Style */}
                    <div className="px-3 md:px-4">
                        <div className="grid grid-cols-2 gap-2 md:gap-3">
                            {offers.map((offer) => (
                                <div
                                    key={offer.id}
                                    className="relative bg-white rounded-2xl overflow-hidden shadow-md hover:shadow-xl transition-all border border-orange-100"
                                >
                                    {/* Discount Badge */}
                                    {offer.discount_percentage && offer.discount_percentage > 0 && (
                                        <div className="absolute top-1.5 right-1.5 z-10">
                                            <div className="bg-gradient-to-br from-orange-600 to-red-600 text-white px-2 py-0.5 rounded-full text-xs shadow-lg transform rotate-[-10deg] font-bold flex items-center gap-1">
                                                <span>📖</span>
                                                {offer.discount_percentage}%
                                            </div>
                                        </div>
                                    )}

                                    {/* Magazine Page Corner Fold Effect */}
                                    <div className="absolute top-0 left-0 w-0 h-0 border-t-[20px] border-t-orange-200 border-r-[20px] border-r-transparent z-10"></div>

                                    {/* Decorative Magazine Background */}
                                    <div className={`absolute inset-0 bg-gradient-to-br ${offer.bg_color || 'from-orange-50 to-yellow-50'} opacity-20`}>
                                        {/* Magazine page lines decoration */}
                                        <div className="absolute top-4 left-2 right-2 space-y-1 opacity-30">
                                            <div className="h-0.5 bg-orange-300 w-3/4"></div>
                                            <div className="h-0.5 bg-orange-300 w-1/2"></div>
                                        </div>
                                    </div>

                                    {/* Product Image */}
                                    <div className="relative pt-2 px-2 md:pt-4 md:px-4">
                                        <div className="bg-white/50 backdrop-blur-sm rounded-xl p-1">
                                            <img
                                                src={offer.image}
                                                alt={offer.name}
                                                className="w-full h-24 md:h-32 object-contain relative z-10"
                                                onError={(e) => {
                                                    (e.target as HTMLImageElement).src = 'https://placehold.co/300x300?text=Product';
                                                }}
                                            />
                                        </div>
                                    </div>

                                    {/* Product Info */}
                                    <div className="p-2 md:p-3 relative">
                                        <p className="text-[#23110C] mb-1.5 min-h-[2rem] md:min-h-[2.5rem] text-xs md:text-sm font-bold line-clamp-2">
                                            {offer.name}
                                        </p>
                                        
                                        {/* Price Tag - Large and Bold with Magazine Style */}
                                        <div className="flex items-end justify-between mb-1">
                                            <div>
                                                <div className="flex items-baseline gap-1">
                                                    <span className="text-orange-600 text-xl md:text-3xl font-black">
                                                        {offer.price}
                                                    </span>
                                                    <span className="text-gray-500 text-[10px] md:text-sm font-semibold">
                                                        {offer.unit}
                                                    </span>
                                                </div>
                                                {offer.old_price && offer.old_price > offer.price && (
                                                    <div className="flex items-center gap-1">
                                                        <span className="text-gray-400 line-through text-[10px] md:text-xs">
                                                            {offer.old_price} ج.م
                                                        </span>
                                                        <span className="text-[9px] text-green-600 font-bold bg-green-100 px-1 py-0.5 rounded">
                                                            وفر {(offer.old_price - offer.price).toFixed(0)}
                                                        </span>
                                                    </div>
                                                )}
                                            </div>
                                            
                                            {/* Quick Add Button - Magazine Style */}
                                            <button 
                                                onClick={() => handleAddToCart(offer)}
                                                className="w-7 h-7 md:w-9 md:h-9 bg-gradient-to-br from-orange-500 to-orange-600 rounded-full flex items-center justify-center shadow-lg hover:shadow-xl hover:from-orange-600 hover:to-orange-700 transition-all active:scale-95 flex-shrink-0 relative group"
                                            >
                                                <Plus className="w-3.5 h-3.5 md:w-5 md:h-5 text-white font-bold" />
                                                {/* Ripple effect */}
                                                <span className="absolute inset-0 rounded-full bg-white opacity-0 group-hover:opacity-20 transition-opacity"></span>
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Empty State */}
                    {offers.length === 0 && !loading && (
                        <div className="text-center py-20">
                            <p className="text-[#6B7280]">لا توجد عروض متاحة حالياً</p>
                        </div>
                    )}

                    {/* Load More Button */}
                    {offers.length > 0 && (
                        <div className="px-4 mt-6">
                            <button 
                                onClick={loadOffers}
                                className="w-full py-3 bg-white text-[#F97316] border-2 border-[#F97316] rounded-full hover:bg-[#FFF7ED] transition-all font-semibold"
                            >
                                تحميل المزيد من العروض
                            </button>
                        </div>
                    )}
                </>
            )}
        </div>
    );
};

export default MagazinePage;
