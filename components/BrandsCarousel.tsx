import React from 'react';
import { Link } from 'react-router-dom';
import { ChevronLeft, Sparkles } from 'lucide-react';

// البراندات المميزة
const FEATURED_BRANDS = [
    {
        id: 'pepsi',
        name: 'بيبسي',
        logo: 'https://upload.wikimedia.org/wikipedia/commons/thumb/0/0f/Pepsi_logo_2014.svg/800px-Pepsi_logo_2014.svg.png',
        color: '#004B93',
        offer: 'خصم 30%'
    },
    {
        id: 'cocacola',
        name: 'كوكاكولا',
        logo: 'https://upload.wikimedia.org/wikipedia/commons/thumb/c/ce/Coca-Cola_logo.svg/800px-Coca-Cola_logo.svg.png',
        color: '#F40009',
        offer: '2+1 مجاناً'
    },
    {
        id: 'nestle',
        name: 'نستله',
        logo: 'https://upload.wikimedia.org/wikipedia/commons/thumb/8/8e/Nestl%C3%A9.svg/800px-Nestl%C3%A9.svg.png',
        color: '#7B7979',
        offer: 'عروض العائلة'
    },
    {
        id: 'juhayna',
        name: 'جهينة',
        logo: 'https://i.imgur.com/placeholder.png',
        color: '#0072CE',
        offer: 'خصم 20%'
    },
    {
        id: 'chipsy',
        name: 'شيبسي',
        logo: 'https://i.imgur.com/placeholder.png',
        color: '#FF6B00',
        offer: '3 بسعر 2'
    }
];

interface BrandsCarouselProps {
    title?: string;
}

const BrandsCarousel: React.FC<BrandsCarouselProps> = ({ title = "براندات مميزة" }) => {
    return (
        <section className="py-6">
            {/* Header */}
            <div className="flex items-center justify-between px-4 mb-4">
                <div className="flex items-center gap-2">
                    <Sparkles className="text-yellow-500" size={20} />
                    <h2 className="text-lg font-bold text-gray-900">{title}</h2>
                </div>
                <Link 
                    to="/brands" 
                    className="text-sm text-blue-600 font-medium flex items-center gap-1 hover:underline"
                >
                    عرض الكل
                    <ChevronLeft size={16} />
                </Link>
            </div>

            {/* Brands Scroll */}
            <div className="flex gap-4 overflow-x-auto px-4 pb-2 no-scrollbar">
                {FEATURED_BRANDS.map((brand) => (
                    <Link
                        key={brand.id}
                        to={`/brand/${brand.id}`}
                        className="flex-shrink-0 group"
                    >
                        <div className="w-24 h-24 md:w-28 md:h-28 bg-white rounded-2xl shadow-md border border-gray-100 p-3 flex items-center justify-center relative overflow-hidden group-hover:shadow-lg transition-shadow">
                            {/* Background gradient on hover */}
                            <div 
                                className="absolute inset-0 opacity-0 group-hover:opacity-10 transition-opacity"
                                style={{ backgroundColor: brand.color }}
                            />
                            
                            <img 
                                src={brand.logo}
                                alt={brand.name}
                                className="max-w-full max-h-full object-contain transition-transform group-hover:scale-110"
                                onError={(e) => {
                                    (e.target as HTMLImageElement).src = `https://ui-avatars.com/api/?name=${brand.name}&size=100&background=${brand.color.replace('#', '')}&color=fff`;
                                }}
                            />
                            
                            {/* Offer Badge */}
                            {brand.offer && (
                                <div 
                                    className="absolute -top-1 -right-1 text-[10px] text-white px-2 py-0.5 rounded-full font-bold"
                                    style={{ backgroundColor: brand.color }}
                                >
                                    {brand.offer}
                                </div>
                            )}
                        </div>
                        <p className="text-center text-sm font-medium text-gray-700 mt-2">{brand.name}</p>
                    </Link>
                ))}
            </div>

            <style>{`
                .no-scrollbar::-webkit-scrollbar {
                    display: none;
                }
                .no-scrollbar {
                    -ms-overflow-style: none;
                    scrollbar-width: none;
                }
            `}</style>
        </section>
    );
};

export default BrandsCarousel;
