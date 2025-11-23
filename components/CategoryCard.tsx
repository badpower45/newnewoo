import React from 'react';

interface CategoryCardProps {
    name: string;
    image?: string;
    bgColor?: string;
}

import { useNavigate } from 'react-router-dom';

const CategoryCard: React.FC<CategoryCardProps> = ({ name, image, bgColor = 'bg-orange-50' }) => {
    const navigate = useNavigate();

    return (
        <div
            onClick={() => navigate('/products')}
            className={`flex flex-col items-center justify-center p-3 rounded-2xl ${bgColor} h-28 w-full cursor-pointer hover:opacity-90 transition-opacity hover:shadow-md`}
        >
            <div className="w-12 h-12 mb-2">
                {image ? (
                    <img src={image} alt={name} className="w-full h-full object-contain" />
                ) : (
                    <div className="w-full h-full bg-orange-200 rounded-full flex items-center justify-center text-orange-600 font-bold">
                        {name.charAt(0)}
                    </div>
                )}
            </div>
            <span className="text-xs font-medium text-center text-gray-800 leading-tight line-clamp-2">
                {name}
            </span>
        </div>
    );
};

export default CategoryCard;
