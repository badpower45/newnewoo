import React from 'react';
import { Link } from 'react-router-dom';
import { ChevronLeft } from 'lucide-react';

// براندات مميزة - بسيط وواضح
const BRANDS = [
    {
        id: 'pepsi',
        name: 'Pepsi Offers',
        image: 'https://images.unsplash.com/photo-1629203851122-3726ecdf080e?w=400',
    },
    {
        id: 'lays',
        name: 'Lays Chips',
        image: 'https://images.unsplash.com/photo-1613919085533-0a05360b1cbe?w=400',
    },
    {
        id: 'galaxy',
        name: 'Galaxy Chocolate',
        image: 'https://images.unsplash.com/photo-1606312619070-d48b4c652a52?w=400',
    },
    {
        id: 'cadbury',
        name: 'Cadbury Dairy Milk',
        image: 'https://images.unsplash.com/photo-1548907040-4baa42d10919?w=400',
    },
    {
        id: 'nescafe',
        name: 'Nescafe Gold',
        image: 'https://images.unsplash.com/photo-1495474472287-4d71bcdd2085?w=400',
    },
    {
        id: 'juhayna',
        name: 'Juhayna Fresh',
        image: 'https://images.unsplash.com/photo-1550583724-b2692b85b150?w=400',
    }
];

interface BrandsCarouselProps {
    title?: string;
}

const BrandsCarousel: React.FC<BrandsCarouselProps> = ({ title = "Featured Brands" }) => {
    return (
        <section>
            {/* Header */}
            <div className="flex items-center justify-between mb-3">
                <h3 className="text-base font-bold text-gray-900">{title}</h3>
                <Link to="/brands" className="text-sm text-orange-500 font-medium hover:underline flex items-center gap-1">
                    عرض الكل <ChevronLeft size={16} className="rotate-180" />
                </Link>
            </div>

            {/* Brands Grid - 3 Columns Grid */}
            <div className="grid grid-cols-3 gap-2 md:gap-3">
                {BRANDS.map((brand) => (
                    <Link
                        key={brand.id}
                        to={`/brand/${brand.id}`}
                        className="group"
                    >
                        <div className="relative aspect-square rounded-xl overflow-hidden bg-gray-100 shadow-sm hover:shadow-md transition-all">
                            <img 
                                src={brand.image}
                                alt={brand.name}
                                className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
                                onError={(e) => {
                                    (e.target as HTMLImageElement).src = 'https://images.unsplash.com/photo-1606312619070-d48b4c652a52?w=400';
                                }}
                            />
                            {/* Overlay with brand name */}
                            <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/30 to-transparent" />
                            <div className="absolute bottom-0 left-0 right-0 p-2">
                                <p className="text-white text-xs md:text-sm font-bold line-clamp-1">{brand.name}</p>
                            </div>
                        </div>
                    </Link>
                ))}
            </div>
        </section>
    );
};

export default BrandsCarousel;
