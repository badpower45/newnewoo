import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { ChevronLeft } from 'lucide-react';
import { api } from '../services/api';

interface Brand {
    id: number | string;
    name_ar: string;
    name_en: string;
    logo_url?: string;
    banner_url?: string;
    primary_color?: string;
    secondary_color?: string;
    is_featured?: boolean;
}

interface BrandsCarouselProps {
    title?: string;
}

const BrandsCarousel: React.FC<BrandsCarouselProps> = ({ title = "Featured Brands" }) => {
    const [brands, setBrands] = useState<Brand[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const loadBrands = async () => {
            try {
                const response = await api.brands.getAll();
                const list = (response as any)?.data || response || [];
                const featured = list.filter((b: Brand) => b.is_featured !== false).slice(0, 6);
                setBrands(featured);
            } catch (error) {
                console.error('Failed to load brands', error);
                setBrands([]);
            } finally {
                setLoading(false);
            }
        };

        loadBrands();
    }, []);

    const fallbackImage = 'https://images.unsplash.com/photo-1606312619070-d48b4c652a52?w=400';

    return (
        <section>
            {/* Header */}
            <div className="flex items-center justify-between mb-3">
                <h3 className="text-base font-bold text-gray-900">{title}</h3>
                <Link to="/brands" className="text-sm text-orange-500 font-medium hover:underline flex items-center gap-1">
                    عرض الكل <ChevronLeft size={16} className="rotate-180" />
                </Link>
            </div>

            {loading ? (
                <div className="grid grid-cols-3 gap-2 md:gap-3">
                    {[1, 2, 3, 4, 5, 6].map((i) => (
                        <div key={i} className="aspect-square rounded-xl bg-gray-200 animate-pulse" />
                    ))}
                </div>
            ) : (
                <div className="grid grid-cols-3 gap-2 md:gap-3">
                    {brands.map((brand) => (
                        <Link
                            key={brand.id}
                            to={`/brand/${brand.name_en?.toLowerCase().replace(/\s+/g, '-') || brand.id}`}
                            className="group"
                        >
                            <div className="relative aspect-square rounded-xl overflow-hidden bg-gray-100 shadow-sm hover:shadow-md transition-all">
                                <img 
                                    src={brand.banner_url || brand.logo_url || fallbackImage}
                                    alt={brand.name_ar}
                                    className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
                                    onError={(e) => {
                                        (e.target as HTMLImageElement).src = fallbackImage;
                                    }}
                                />
                                {/* Overlay with brand name */}
                                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/30 to-transparent" />
                                <div className="absolute bottom-0 left-0 right-0 p-2">
                                    <p className="text-white text-xs md:text-sm font-bold line-clamp-1">{brand.name_ar}</p>
                                    <p className="text-white/80 text-[10px] line-clamp-1">{brand.name_en}</p>
                                </div>
                            </div>
                        </Link>
                    ))}
                </div>
            )}
        </section>
    );
};

export default BrandsCarousel;
