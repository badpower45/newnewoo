import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { ChevronRight, Star, TrendingUp } from 'lucide-react';
import api from '../services/api';

interface Brand {
    id: string;
    name_ar: string;
    name_en: string;
    logo_url?: string;
    banner_url?: string;
    primary_color?: string;
    secondary_color?: string;
    description_ar?: string;
    is_featured: boolean;
    products_count?: number;
}

interface FeaturedBrandsProps {
    maxBrands?: number;
}

const FeaturedBrands: React.FC<FeaturedBrandsProps> = ({ maxBrands = 6 }) => {
    const [brands, setBrands] = useState<Brand[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchFeaturedBrands();
    }, []);

    const fetchFeaturedBrands = async () => {
        try {
            const response = await api.brands.getAll();
            const allBrands = response.data || [];
            
            // Filter only featured brands
            const featured = allBrands
                .filter((b: Brand) => b.is_featured)
                .slice(0, maxBrands);
            
            setBrands(featured);
        } catch (error) {
            console.error('Error fetching featured brands:', error);
        } finally {
            setLoading(false);
        }
    };

    if (loading) {
        return (
            <div className="mb-6">
                <div className="animate-pulse">
                    <div className="h-6 bg-gray-200 rounded w-32 mb-4"></div>
                    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
                        {[...Array(6)].map((_, i) => (
                            <div key={i} className="bg-gray-200 rounded-xl h-32"></div>
                        ))}
                    </div>
                </div>
            </div>
        );
    }

    if (brands.length === 0) {
        return null;
    }

    return (
        <div className="mb-6">
            {/* Header */}
            <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2">
                    <Star className="text-orange-500" size={24} fill="currentColor" />
                    <h2 className="text-xl font-bold text-gray-900">براندات مميزة</h2>
                </div>
                <Link
                    to="/brands"
                    className="flex items-center gap-1 text-orange-500 text-sm font-medium hover:text-orange-600 transition-colors"
                >
                    عرض الكل
                    <ChevronRight size={16} />
                </Link>
            </div>

            {/* Brands Grid */}
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
                {brands.map((brand) => (
                    <Link
                        key={brand.id}
                        to={`/brand/${brand.name_en?.toLowerCase().replace(/\s+/g, '-') || brand.id}`}
                        className="group relative bg-white rounded-xl overflow-hidden hover:shadow-lg transition-all duration-300 border border-gray-100 hover:border-orange-200"
                        style={{
                            background: brand.primary_color 
                                ? `linear-gradient(135deg, ${brand.primary_color}15 0%, white 100%)`
                                : 'white'
                        }}
                    >
                        {/* Badge for high product count */}
                        {brand.products_count && brand.products_count > 20 && (
                            <div className="absolute top-2 right-2 z-10">
                                <div className="bg-gradient-to-r from-orange-500 to-red-500 text-white text-xs px-2 py-1 rounded-full font-bold flex items-center gap-1 shadow-md">
                                    <TrendingUp size={10} />
                                    {brand.products_count}+
                                </div>
                            </div>
                        )}

                        {/* Brand Logo */}
                        <div className="aspect-square p-4 flex items-center justify-center">
                            {brand.logo_url ? (
                                <img
                                    src={brand.logo_url}
                                    alt={brand.name_ar}
                                    className="w-full h-full object-contain group-hover:scale-110 transition-transform duration-300"
                                />
                            ) : (
                                <div 
                                    className="w-16 h-16 rounded-full flex items-center justify-center text-2xl font-bold text-white"
                                    style={{
                                        background: brand.primary_color 
                                            ? `linear-gradient(135deg, ${brand.primary_color} 0%, ${brand.secondary_color || brand.primary_color} 100%)`
                                            : 'linear-gradient(135deg, #F97316 0%, #EA580C 100%)'
                                    }}
                                >
                                    {brand.name_ar.charAt(0)}
                                </div>
                            )}
                        </div>

                        {/* Brand Name */}
                        <div 
                            className="p-3 text-center border-t"
                            style={{
                                borderColor: brand.primary_color ? `${brand.primary_color}20` : '#e5e7eb'
                            }}
                        >
                            <h3 className="text-sm font-bold text-gray-900 truncate group-hover:text-orange-600 transition-colors">
                                {brand.name_ar}
                            </h3>
                            {brand.products_count !== undefined && (
                                <p className="text-xs text-gray-500 mt-1">
                                    {brand.products_count} منتج
                                </p>
                            )}
                        </div>

                        {/* Hover Effect Overlay */}
                        <div 
                            className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none"
                            style={{
                                background: brand.primary_color 
                                    ? `linear-gradient(180deg, transparent 0%, ${brand.primary_color}10 100%)`
                                    : 'linear-gradient(180deg, transparent 0%, rgba(249, 115, 22, 0.1) 100%)'
                            }}
                        />
                    </Link>
                ))}
            </div>
        </div>
    );
};

export default FeaturedBrands;
