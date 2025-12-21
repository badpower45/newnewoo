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
