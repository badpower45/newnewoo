import React from 'react';
import { useNavigate } from 'react-router-dom';
import { ChevronLeft } from 'lucide-react';

interface CategoryCardProps {
    name: string;
    nameEn?: string;
    image?: string;
    icon?: string;
    bgColor?: string;
    productsCount?: number;
    variant?: 'default' | 'large' | 'horizontal';
}

const CategoryCard: React.FC<CategoryCardProps> = ({ 
    name, 
    nameEn,
    image, 
    icon,
    bgColor = 'bg-gradient-to-br from-orange-50 to-orange-100',
    productsCount,
    variant = 'default'
}) => {
    const navigate = useNavigate();

    const handleClick = () => {
        const categoryName = nameEn || name;
        navigate(`/products?category=${encodeURIComponent(categoryName)}`);
    };

    // Horizontal variant - for list view
    if (variant === 'horizontal') {
        return (
            <div
                onClick={handleClick}
                className="flex items-center gap-4 p-4 bg-white rounded-2xl shadow-sm hover:shadow-lg transition-all cursor-pointer group border border-gray-100"
            >
                <div className={`w-20 h-20 ${bgColor} rounded-2xl flex items-center justify-center overflow-hidden flex-shrink-0`}>
                    {image ? (
                        <img src={image} alt={name} className="w-full h-full object-cover" />
                    ) : icon ? (
                        <span className="text-4xl">{icon}</span>
                    ) : (
                        <span className="text-3xl font-bold text-orange-500">{name.charAt(0)}</span>
                    )}
                </div>
                <div className="flex-1 min-w-0">
                    <h3 className="font-bold text-gray-900 text-lg truncate">{name}</h3>
                    {productsCount !== undefined && (
                        <p className="text-sm text-gray-500">{productsCount} منتج</p>
                    )}
                </div>
                <ChevronLeft className="w-5 h-5 text-gray-400 group-hover:text-orange-500 transition-colors" />
            </div>
        );
    }

    // Default variant - compact grid
    return (
        <div
            onClick={handleClick}
            className="flex flex-col items-center cursor-pointer group"
        >
            {/* Image/Icon Container */}
            <div className={`relative w-full aspect-square rounded-2xl ${bgColor} overflow-hidden shadow-sm group-hover:shadow-xl transition-all duration-300 group-hover:scale-105`}>
                {image ? (
                    <>
                        <img 
                            src={image} 
                            alt={name} 
                            className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" 
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-black/30 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                    </>
                ) : icon ? (
                    <div className="w-full h-full flex items-center justify-center">
                        <span className="text-5xl group-hover:scale-110 transition-transform">{icon}</span>
                    </div>
                ) : (
                    <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-orange-400 to-orange-600">
                        <span className="text-4xl font-bold text-white">{name.charAt(0)}</span>
                    </div>
                )}
                
                {productsCount !== undefined && productsCount > 0 && (
                    <div className="absolute top-2 right-2 bg-white/90 backdrop-blur-sm px-2 py-0.5 rounded-full shadow-sm">
                        <span className="text-[10px] font-semibold text-gray-700">{productsCount}</span>
                    </div>
                )}
            </div>
            
            {/* Name */}
            <p className="mt-2 text-sm font-semibold text-gray-800 text-center line-clamp-2 group-hover:text-orange-600 transition-colors">
                {name}
            </p>
        </div>
    );
};

export default CategoryCard;
