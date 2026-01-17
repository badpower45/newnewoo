import React, { useEffect, useState } from 'react';
import api from '../services/api';

interface CategoryBannerData {
    id: number;
    category_id: number;
    category_name: string;
    category_name_ar: string;
    image_url: string;
    mobile_image_url?: string;
    link_url?: string;
    title?: string;
    title_ar?: string;
    subtitle?: string;
    subtitle_ar?: string;
    background_color: string;
    text_color: string;
}

interface CategoryBannerProps {
    categoryId?: number;
    categoryName?: string;
}

const CategoryBanner: React.FC<CategoryBannerProps> = ({ categoryId, categoryName }) => {
    const [banner, setBanner] = useState<CategoryBannerData | null>(null);
    const [loading, setLoading] = useState(true);
    const [isMobile, setIsMobile] = useState(false);

    useEffect(() => {
        // Detect mobile
        const checkMobile = () => {
            setIsMobile(window.innerWidth < 768);
        };
        
        checkMobile();
        window.addEventListener('resize', checkMobile);
        
        return () => window.removeEventListener('resize', checkMobile);
    }, []);

    useEffect(() => {
        if (categoryId || categoryName) {
            fetchBanner();
        }
    }, [categoryId, categoryName]);

    const fetchBanner = async () => {
        try {
            setLoading(true);
            
            let url = '';
            if (categoryId) {
                url = `/category-banners/category/${categoryId}`;
            } else if (categoryName) {
                url = `/category-banners/category-name/${encodeURIComponent(categoryName)}`;
            }
            
            const response = await api.get(url);
            
            if (response.data.success && response.data.data) {
                setBanner(response.data.data);
            }
        } catch (error) {
            console.error('Error fetching category banner:', error);
        } finally {
            setLoading(false);
        }
    };

    if (loading) {
        return (
            <div className="w-full h-48 md:h-64 bg-gray-200 animate-pulse rounded-xl mb-6" />
        );
    }

    if (!banner) return null;

    const bannerImage = isMobile && banner.mobile_image_url ? banner.mobile_image_url : banner.image_url;

    const handleClick = () => {
        if (banner.link_url) {
            window.location.href = banner.link_url;
        }
    };

    return (
        <div 
            className={`relative w-full rounded-xl overflow-hidden shadow-lg mb-6 ${
                banner.link_url ? 'cursor-pointer hover:shadow-xl transition-shadow' : ''
            }`}
            style={{ backgroundColor: banner.background_color }}
            onClick={banner.link_url ? handleClick : undefined}
        >
            {/* Banner Image */}
            <div className="relative w-full h-48 md:h-64 lg:h-72">
                <img 
                    src={bannerImage}
                    alt={banner.title_ar || banner.category_name_ar}
                    className="w-full h-full object-cover"
                    loading="lazy"
                />
                
                {/* Overlay Text (إذا كان موجود) */}
                {(banner.title_ar || banner.subtitle_ar) && (
                    <div 
                        className="absolute inset-0 flex flex-col justify-center items-end p-6 md:p-8 bg-gradient-to-l from-black/40 to-transparent"
                        style={{ color: banner.text_color }}
                    >
                        {banner.title_ar && (
                            <h2 className="text-2xl md:text-4xl font-bold mb-2 text-white drop-shadow-lg text-right">
                                {banner.title_ar}
                            </h2>
                        )}
                        
                        {banner.subtitle_ar && (
                            <p className="text-sm md:text-lg text-white/90 drop-shadow-md text-right max-w-md">
                                {banner.subtitle_ar}
                            </p>
                        )}
                    </div>
                )}
            </div>

            {/* Category Label (زاوية علوية) */}
            {banner.category_name_ar && (
                <div className="absolute top-4 left-4 bg-white/95 backdrop-blur-sm px-4 py-2 rounded-full shadow-md">
                    <span className="text-sm md:text-base font-bold text-gray-800">
                        {banner.category_name_ar}
                    </span>
                </div>
            )}
        </div>
    );
};

export default CategoryBanner;
