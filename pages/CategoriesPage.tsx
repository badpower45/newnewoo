import React from 'react';
import { ChevronLeft, Search } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import CategoryCard from '../components/CategoryCard';
import Footer from '../components/Footer';
import { ALL_CATEGORIES } from '../data/mockData';

const CategoriesPage = () => {
    const navigate = useNavigate();

    return (
        <div className="bg-gray-50 min-h-screen pb-24 md:pb-8">
            {/* Header */}
            <div className="bg-white p-4 sticky top-0 z-40 shadow-sm flex items-center justify-between md:hidden">
                <button onClick={() => navigate(-1)} className="p-2 -ml-2 text-primary">
                    <ChevronLeft size={28} />
                </button>
                <h1 className="text-xl font-bold text-gray-900">Categories</h1>
                <button className="p-2 -mr-2 text-primary">
                    <Search size={24} />
                </button>
            </div>

            {/* Desktop Header */}
            <div className="hidden md:block bg-white p-6 shadow-sm mb-6">
                <div className="max-w-7xl mx-auto">
                    <h1 className="text-3xl font-bold text-gray-900">All Categories</h1>
                </div>
            </div>

            {/* Grid */}
            <div className="p-4 max-w-7xl mx-auto">
                <div className="grid grid-cols-3 md:grid-cols-6 lg:grid-cols-8 gap-4">
                    {ALL_CATEGORIES.map((cat, idx) => (
                        <CategoryCard key={idx} name={cat} bgColor="bg-orange-50" />
                    ))}
                </div>
            </div>
            <Footer />
        </div>
    );
};

export default CategoriesPage;
