import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { ChevronLeft, ChevronRight, Star, Sparkles, Percent, Gift } from 'lucide-react';
import { api } from '../services/api';

interface BrandOffer {
    id: number;
    title: string;
    title_ar: string;
    subtitle?: string;
    subtitle_ar?: string;
    discount_text?: string;
    discount_text_ar?: string;
    background_type: string;
    background_value: string;
    text_color: string;
    badge_color: string;
    badge_text_color: string;
    image_url?: string;
    brand_logo_url?: string;
    linked_product_id?: number;
    linked_brand_id?: number;
    link_type: string;
    custom_link?: string;
    is_active: boolean;
    display_order: number;
}

// Fallback static offers in case API fails
const staticBrandOffers: BrandOffer[] = [
    {
        id: 1,
        title: 'Galaxy Chocolate',
        title_ar: 'شوكولاتة جالاكسي',
        subtitle: 'Exclusive offers on all Galaxy products',
        subtitle_ar: 'عروض حصرية على كل منتجات جالاكسي',
        discount_text: 'Up to 30% OFF',
        discount_text_ar: 'خصم يصل إلى 30%',
        background_type: 'gradient',
        background_value: 'linear-gradient(135deg, #8B4513 0%, #5D3A1A 50%, #3D2610 100%)',
        text_color: '#FEF3C7',
        badge_color: '#EF4444',
        badge_text_color: '#FFFFFF',
        image_url: 'https://images.unsplash.com/photo-1606312619070-d48b4c652a52?w=400&h=300&fit=crop',
        link_type: 'brand',
        is_active: true,
        display_order: 1
    },
    {
        id: 2,
        title: 'Cadbury Dairy Milk',
        title_ar: 'كادبوري ديري ميلك',
        subtitle: 'Buy 2 Get 1 Free',
        subtitle_ar: 'اشتري 2 واحصل على 1 مجاناً',
        discount_text: '2+1 Offer',
        discount_text_ar: 'عرض 2+1',
        background_type: 'gradient',
        background_value: 'linear-gradient(135deg, #4B0082 0%, #6B238E 50%, #8B008B 100%)',
        text_color: '#E9D5FF',
        badge_color: '#EF4444',
        badge_text_color: '#FFFFFF',
        image_url: 'https://images.unsplash.com/photo-1587132137056-bfbf0166836e?w=400&h=300&fit=crop',
        link_type: 'brand',
        is_active: true,
        display_order: 2
    },
    {
        id: 3,
        title: 'Pepsi Drinks',
        title_ar: 'مشروبات بيبسي',
        subtitle: 'Ramadan offers on all Pepsi drinks',
        subtitle_ar: 'عروض رمضان على كل مشروبات بيبسي',
        discount_text: '25% OFF',
        discount_text_ar: 'خصم 25%',
        background_type: 'gradient',
        background_value: 'linear-gradient(135deg, #001F5C 0%, #003087 50%, #0056B3 100%)',
        text_color: '#BFDBFE',
        badge_color: '#EF4444',
        badge_text_color: '#FFFFFF',
        image_url: 'https://images.unsplash.com/photo-1629203851122-3726ecdf080e?w=400&h=300&fit=crop',
        link_type: 'brand',
        is_active: true,
        display_order: 3
    }
];

interface BrandOfferCardProps {
    offer: BrandOffer;
    index: number;
}

const BrandOfferCard: React.FC<BrandOfferCardProps> = ({ offer, index }) => {
    const navigate = useNavigate();
    
    // Determine the link based on offer configuration
    const getOfferLink = () => {
        if (offer.link_type === 'product' && offer.linked_product_id) {
            return `/product/${offer.linked_product_id}`;
        } else if (offer.link_type === 'brand' && offer.linked_brand_id) {
            return `/brand/${offer.linked_brand_id}`;
        } else if (offer.link_type === 'custom' && offer.custom_link) {
            return offer.custom_link;
        }
        // Default fallback
        return '/products';
    };

    const handleClick = () => {
        navigate(getOfferLink());
    };

    return (
        <div 
            onClick={handleClick}
            className="group relative block overflow-hidden rounded-2xl shadow-lg hover:shadow-2xl transition-all duration-500 transform hover:scale-[1.02] min-w-[280px] sm:min-w-[320px] md:min-w-[380px] h-[200px] sm:h-[220px] md:h-[240px] flex-shrink-0 cursor-pointer"
            style={{ background: offer.background_value }}
        >
            {/* Animated Background Effects */}
            <div className="absolute inset-0 opacity-20">
                <div className="absolute top-0 left-0 w-32 h-32 bg-white rounded-full blur-3xl animate-pulse" 
                     style={{ animationDelay: `${index * 0.2}s` }} />
                <div className="absolute bottom-0 right-0 w-40 h-40 bg-white rounded-full blur-3xl animate-pulse" 
                     style={{ animationDelay: `${index * 0.3}s` }} />
            </div>
            
            {/* Floating Sparkles */}
            <div className="absolute top-4 right-4 text-white/40 animate-bounce" style={{ animationDelay: '0s' }}>
                <Sparkles size={20} />
            </div>
            <div className="absolute top-12 left-8 text-white/30 animate-bounce" style={{ animationDelay: '0.5s' }}>
                <Star size={16} />
            </div>
            
            {/* Discount Badge */}
            {(offer.discount_text_ar || offer.discount_text) && (
                <div className="absolute top-3 left-3 z-20">
                    <div 
                        className="px-3 py-1.5 rounded-full text-xs sm:text-sm font-bold shadow-lg flex items-center gap-1 animate-pulse"
                        style={{ 
                            backgroundColor: offer.badge_color || '#EF4444',
                            color: offer.badge_text_color || '#FFFFFF'
                        }}
                    >
                        <Percent size={14} />
                        {offer.discount_text_ar || offer.discount_text}
                    </div>
                </div>
            )}
            
            {/* Content */}
            <div className="absolute inset-0 p-4 sm:p-5 md:p-6 flex flex-col justify-between z-10">
                {/* Top Section - Brand Info */}
                <div className="text-right">
                    <div 
                        className="text-lg sm:text-xl md:text-2xl font-bold drop-shadow-lg mb-1"
                        style={{ color: offer.text_color }}
                    >
                        {offer.title_ar}
                    </div>
                    <div 
                        className="text-xs sm:text-sm opacity-80"
                        style={{ color: offer.text_color }}
                    >
                        {offer.title}
                    </div>
                </div>
                
                {/* Bottom Section - Subtitle & CTA */}
                <div>
                    {(offer.subtitle_ar || offer.subtitle) && (
                        <p 
                            className="text-sm sm:text-base opacity-90 mb-3 line-clamp-2"
                            style={{ color: offer.text_color }}
                        >
                            {offer.subtitle_ar || offer.subtitle}
                        </p>
                    )}
                    <div className="flex items-center justify-between">
                        <div 
                            className="flex items-center gap-2 text-sm font-medium group-hover:translate-x-1 transition-transform"
                            style={{ color: offer.text_color }}
                        >
                            <span>تسوق الآن</span>
                            <ChevronLeft size={18} className="transform group-hover:-translate-x-1 transition-transform" />
                        </div>
                        <div className="flex items-center gap-1 bg-white/20 backdrop-blur-sm px-3 py-1 rounded-full">
                            <Gift size={14} style={{ color: offer.text_color }} />
                            <span className="text-xs" style={{ color: offer.text_color }}>عرض محدود</span>
                        </div>
                    </div>
                </div>
            </div>
            
            {/* Product Image */}
            <div className="absolute left-0 bottom-0 w-32 h-32 sm:w-36 sm:h-36 md:w-44 md:h-44 pointer-events-none">
                <img 
                    src={offer.image_url} 
                    alt={offer.title}
                    className="w-full h-full object-cover rounded-tr-3xl opacity-80 group-hover:opacity-100 group-hover:scale-110 transition-all duration-500"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-transparent to-black/20" />
            </div>
            
            {/* Hover Overlay */}
            <div className="absolute inset-0 bg-white/0 group-hover:bg-white/5 transition-colors duration-300" />
        </div>
    );
};

export default function BrandOffersSection() {
    const [offers, setOffers] = useState<BrandOffer[]>([]);
    const [loading, setLoading] = useState(true);
    const [scrollPosition, setScrollPosition] = useState(0);
    const scrollContainerRef = React.useRef<HTMLDivElement>(null);

    useEffect(() => {
        fetchOffers();
    }, []);

    const fetchOffers = async () => {
        try {
            const res = await api.brandOffers.getAll();
            if (res.data && res.data.length > 0) {
                setOffers(res.data);
            } else {
                // Use static offers as fallback
                setOffers(staticBrandOffers);
            }
        } catch (err) {
            console.error('Error fetching brand offers:', err);
            // Use static offers as fallback
            setOffers(staticBrandOffers);
        } finally {
            setLoading(false);
        }
    };

    const scroll = (direction: 'left' | 'right') => {
        const container = scrollContainerRef.current;
        if (!container) return;
        
        const scrollAmount = 400;
        const newPosition = direction === 'left' 
            ? container.scrollLeft + scrollAmount 
            : container.scrollLeft - scrollAmount;
        
        container.scrollTo({ left: newPosition, behavior: 'smooth' });
    };

    const handleScroll = () => {
        if (scrollContainerRef.current) {
            setScrollPosition(scrollContainerRef.current.scrollLeft);
        }
    };

    const canScrollLeft = scrollPosition > 0;
    const canScrollRight = scrollContainerRef.current 
        ? scrollPosition < scrollContainerRef.current.scrollWidth - scrollContainerRef.current.clientWidth - 10
        : true;

    // Don't render if no offers
    if (!loading && offers.length === 0) {
        return null;
    }

    return (
        <section className="py-6 sm:py-8 bg-gradient-to-b from-gray-50 to-white">
            <div className="max-w-7xl mx-auto px-4">
                {/* Section Header */}
                <div className="flex items-center justify-between mb-6">
                    <div className="flex items-center gap-3">
                        <div className="bg-gradient-to-br from-orange-500 to-red-500 p-2.5 rounded-xl shadow-lg">
                            <Gift className="text-white" size={24} />
                        </div>
                        <div>
                            <h2 className="text-xl sm:text-2xl font-bold text-brand-brown">
                                عروض البراندات
                            </h2>
                            <p className="text-sm text-gray-500">
                                عروض حصرية من أفضل الماركات العالمية
                            </p>
                        </div>
                    </div>
                    
                    {/* Navigation Arrows - Desktop */}
                    <div className="hidden sm:flex items-center gap-2">
                        <button 
                            onClick={() => scroll('right')}
                            disabled={!canScrollRight}
                            className={`p-2 rounded-full transition-all ${
                                canScrollRight 
                                    ? 'bg-brand-orange text-white hover:bg-brand-orange/90 shadow-md' 
                                    : 'bg-gray-200 text-gray-400 cursor-not-allowed'
                            }`}
                        >
                            <ChevronRight size={20} />
                        </button>
                        <button 
                            onClick={() => scroll('left')}
                            disabled={!canScrollLeft}
                            className={`p-2 rounded-full transition-all ${
                                canScrollLeft 
                                    ? 'bg-brand-orange text-white hover:bg-brand-orange/90 shadow-md' 
                                    : 'bg-gray-200 text-gray-400 cursor-not-allowed'
                            }`}
                        >
                            <ChevronLeft size={20} />
                        </button>
                    </div>
                </div>

                {/* Offers Carousel */}
                <div className="relative">
                    <div 
                        ref={scrollContainerRef}
                        onScroll={handleScroll}
                        className="flex gap-4 overflow-x-auto scrollbar-hide pb-4 -mx-4 px-4 snap-x snap-mandatory"
                        style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
                    >
                        {offers.map((offer, index) => (
                            <div key={offer.id} className="snap-start">
                                <BrandOfferCard offer={offer} index={index} />
                            </div>
                        ))}
                    </div>
                    
                    {/* Gradient Overlays for scroll indication */}
                    {canScrollRight && (
                        <div className="absolute left-0 top-0 bottom-4 w-8 bg-gradient-to-l from-transparent to-gray-50/80 pointer-events-none hidden sm:block" />
                    )}
                    {canScrollLeft && (
                        <div className="absolute right-0 top-0 bottom-4 w-8 bg-gradient-to-r from-transparent to-gray-50/80 pointer-events-none hidden sm:block" />
                    )}
                </div>

                {/* View All Link */}
                <div className="text-center mt-4">
                    <Link 
                        to="/brands"
                        className="inline-flex items-center gap-2 text-brand-orange hover:text-brand-orange/80 font-medium transition-colors group"
                    >
                        <span>عرض كل البراندات</span>
                        <ChevronLeft size={18} className="transform group-hover:-translate-x-1 transition-transform" />
                    </Link>
                </div>
            </div>
        </section>
    );
}
