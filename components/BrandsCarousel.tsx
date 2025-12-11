import React from 'react';
import { Link } from 'react-router-dom';
import { ChevronLeft } from 'lucide-react';
import { useLanguage } from '../context/LanguageContext';

// براندات مميزة - بسيط وواضح
const BRANDS = [
    {
        id: 'pepsi',
        name: 'Pepsi Offers',
        name_ar: 'عروض بيبسي',
        image: 'https://images.unsplash.com/photo-1629203851122-3726ecdf080e?w=400',
    },
    {
        id: 'lays',
        name: 'Lays Chips',
        name_ar: 'شيبسي ليز',
        image: 'https://images.unsplash.com/photo-1613919085533-0a05360b1cbe?w=400',
    },
    {
        id: 'galaxy',
        name: 'Galaxy Chocolate',
        name_ar: 'شوكولاتة جالاكسي',
        image: 'https://images.unsplash.com/photo-1606312619070-d48b4c652a52?w=400',
    },
    {
        id: 'cadbury',
        name: 'Cadbury Dairy Milk',
        name_ar: 'كادبوري ديري ميلك',
        image: 'https://images.unsplash.com/photo-1548907040-4baa42d10919?w=400',
    },
    {
        id: 'nescafe',
        name: 'Nescafe Gold',
        name_ar: 'نسكافيه جولد',
        image: 'https://images.unsplash.com/photo-1495474472287-4d71bcdd2085?w=400',
    },
    {
        id: 'juhayna',
        name: 'Juhayna Fresh',
        name_ar: 'جهينة فريش',
        image: 'https://images.unsplash.com/photo-1550583724-b2692b85b150?w=400',
    }
];

interface BrandsCarouselProps {
    title?: string;
}

const BrandsCarousel: React.FC<BrandsCarouselProps> = ({ title = "Featured Brands" }) => {
    const { language, t, dir } = useLanguage();
    
    return (
        <section className="relative">
            {/* Header */}
            <div className="flex items-center justify-between mb-4 px-4 md:px-0">
                <div>
                    <h3 className="text-xl font-bold text-gray-900">{title}</h3>
                    <p className="text-sm text-gray-500 mt-0.5">
                        {language === 'ar' ? 'اكتشف أفضل البراندات' : 'Discover top brands'}
                    </p>
                </div>
                <Link 
                    to="/brands" 
                    className="flex items-center gap-1 text-sm text-orange-500 font-semibold hover:text-orange-600 transition-colors group"
                >
                    {t('view_all')}
                    <ChevronLeft 
                        size={16} 
                        className={`group-hover:translate-x-1 transition-transform ${
                            dir === 'rtl' ? 'rotate-180' : ''
                        }`}
                    />
                </Link>
            </div>

            {/* Brands Horizontal Scroll - Direction based on language */}
            <div 
                className="flex gap-4 overflow-x-auto pb-4 snap-x snap-mandatory scroll-smooth no-scrollbar px-4 md:px-0"
                dir={dir}
                style={{ 
                    scrollbarWidth: 'none',
                    msOverflowStyle: 'none'
                }}
            >
                {BRANDS.map((brand) => (
                    <Link
                        key={brand.id}
                        to={`/brand/${brand.id}`}
                        className="flex-shrink-0 w-[160px] md:w-[180px] group snap-center"
                    >
                        {/* Card Container */}
                        <div className="relative rounded-2xl overflow-hidden bg-white shadow-md hover:shadow-2xl transition-all duration-300 group-hover:-translate-y-2">
                            {/* Image Container with gradient overlay */}
                            <div className="relative aspect-[3/4] overflow-hidden">
                                <img 
                                    src={brand.image}
                                    alt={language === 'ar' ? brand.name_ar : brand.name}
                                    className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                                    onError={(e) => {
                                        (e.target as HTMLImageElement).src = 'https://images.unsplash.com/photo-1606312619070-d48b4c652a52?w=400';
                                    }}
                                />
                                {/* Gradient Overlay */}
                                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/30 to-transparent" />
                                
                                {/* Brand Name Badge */}
                                <div className="absolute bottom-0 left-0 right-0 p-3">
                                    <div className="bg-white/95 backdrop-blur-sm rounded-xl px-3 py-2 shadow-lg">
                                        <p className="text-gray-900 text-sm font-bold text-center truncate">
                                            {language === 'ar' ? brand.name_ar : brand.name}
                                        </p>
                                    </div>
                                </div>

                                {/* Hover Effect - Arrow Icon */}
                                <div className="absolute top-3 right-3 w-8 h-8 bg-orange-500 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity shadow-lg">
                                    <ChevronLeft 
                                        size={16} 
                                        className={`text-white ${dir === 'rtl' ? 'rotate-180' : ''}`}
                                    />
                                </div>
                            </div>
                        </div>
                    </Link>
                ))}
            </div>

            {/* Scroll Indicator (Mobile only) */}
            <div className="flex justify-center gap-1 mt-3 md:hidden">
                {BRANDS.map((_, index) => (
                    <div 
                        key={index}
                        className="w-1.5 h-1.5 rounded-full bg-gray-300"
                    />
                ))}
            </div>
        </section>
    );
};

export default BrandsCarousel;
