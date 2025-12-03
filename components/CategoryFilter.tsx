import React from 'react';

interface CategoryFilterProps {
    categories: string[];
    activeCategory: string;
    onSelect: (category: string) => void;
}

const CategoryFilter: React.FC<CategoryFilterProps> = ({ categories, activeCategory, onSelect }) => {
    return (
        <div className="flex gap-2 overflow-x-auto pb-2 no-scrollbar py-2 -mx-4 px-4 md:mx-0 md:px-0">
            {categories.map((cat) => (
                <button
                    key={cat}
                    onClick={() => onSelect(cat)}
                    className={`px-4 py-2 rounded-full text-sm font-medium whitespace-nowrap transition-all duration-200 ${
                        activeCategory === cat
                            ? 'bg-orange-500 text-white shadow-md shadow-orange-200'
                            : 'bg-white text-gray-700 border border-gray-200 hover:border-orange-300 hover:text-orange-600'
                    }`}
                >
                    {cat}
                </button>
            ))}
        </div>
    );
};

export default CategoryFilter;
