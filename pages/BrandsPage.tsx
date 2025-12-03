import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Search, ChevronRight, Star, Package } from 'lucide-react';
import TopBar from '../components/TopBar';

// All available brands
const ALL_BRANDS = [
    {
        id: 'pepsi',
        name: 'بيبسي',
        nameEn: 'Pepsi',
        image: 'https://images.unsplash.com/photo-1629203851122-3726ecdf080e?w=400',
        logo: 'https://upload.wikimedia.org/wikipedia/commons/thumb/0/0f/Pepsi_logo_2014.svg/200px-Pepsi_logo_2014.svg.png',
        category: 'مشروبات',
        productsCount: 45,
        offer: 'خصم 30%'
    },
    {
        id: 'lays',
        name: 'ليز',
        nameEn: 'Lays',
        image: 'https://images.unsplash.com/photo-1613919085533-0a05360b1cbe?w=400',
        logo: 'https://upload.wikimedia.org/wikipedia/commons/thumb/7/73/Lays_brand_logo.png/200px-Lays_brand_logo.png',
        category: 'سناكس',
        productsCount: 28,
        offer: 'اشتري 3 بسعر 2'
    },
    {
        id: 'galaxy',
        name: 'جالاكسي',
        nameEn: 'Galaxy',
        image: 'https://images.unsplash.com/photo-1606312619070-d48b4c652a52?w=400',
        logo: '',
        category: 'شوكولاتة',
        productsCount: 35,
        offer: 'خصم 25%'
    },
    {
        id: 'cadbury',
        name: 'كادبوري',
        nameEn: 'Cadbury',
        image: 'https://images.unsplash.com/photo-1587132137056-bfbf0166836e?w=400',
        logo: '',
        category: 'شوكولاتة',
        productsCount: 42,
        offer: 'خصم 20%'
    },
    {
        id: 'nescafe',
        name: 'نسكافيه',
        nameEn: 'Nescafe',
        image: 'https://images.unsplash.com/photo-1495474472287-4d71bcdd2085?w=400',
        logo: '',
        category: 'مشروبات',
        productsCount: 32,
        offer: 'اشتري 2 واحصل على 1'
    },
    {
        id: 'juhayna',
        name: 'جهينة',
        nameEn: 'Juhayna',
        image: 'https://images.unsplash.com/photo-1550583724-b2692b85b150?w=400',
        logo: '',
        category: 'ألبان',
        productsCount: 58,
        offer: 'خصم 25%'
    },
    {
        id: 'cocacola',
        name: 'كوكاكولا',
        nameEn: 'Coca-Cola',
        image: 'https://images.unsplash.com/photo-1554866585-cd94860890b7?w=400',
        logo: '',
        category: 'مشروبات',
        productsCount: 38,
        offer: 'عروض خاصة'
    },
    {
        id: 'nestle',
        name: 'نستله',
        nameEn: 'Nestle',
        image: 'https://images.unsplash.com/photo-1606312619070-d48b4c652a52?w=400',
        logo: '',
        category: 'أغذية',
        productsCount: 65,
        offer: 'عروض العائلة'
    },
    {
        id: 'frito',
        name: 'فريتو',
        nameEn: 'Frito Lay',
        image: 'https://images.unsplash.com/photo-1566478989037-eec170784d0b?w=400',
        logo: '',
        category: 'سناكس',
        productsCount: 22,
        offer: 'خصم 15%'
    },
    {
        id: 'domty',
        name: 'دومتي',
        nameEn: 'Domty',
        image: 'https://images.unsplash.com/photo-1486297678162-eb2a19b0a32d?w=400',
        logo: '',
        category: 'ألبان',
        productsCount: 40,
        offer: 'خصم 20%'
    }
];

const categories = ['الكل', 'مشروبات', 'سناكس', 'شوكولاتة', 'ألبان', 'أغذية'];

const BrandsPage: React.FC = () => {
    const [searchTerm, setSearchTerm] = useState('');
    const [selectedCategory, setSelectedCategory] = useState('الكل');

    const filteredBrands = ALL_BRANDS.filter(brand => {
        const matchesSearch = brand.name.includes(searchTerm) || 
                            brand.nameEn.toLowerCase().includes(searchTerm.toLowerCase());
        const matchesCategory = selectedCategory === 'الكل' || brand.category === selectedCategory;
        return matchesSearch && matchesCategory;
    });

    return (
        <div className="bg-gray-50 min-h-screen pb-24 md:pb-8">
            <TopBar />
            
            <div className="px-4 py-4 max-w-7xl mx-auto">
                {/* Page Header */}
                <div className="mb-6">
                    <h1 className="text-2xl font-bold text-gray-900 mb-2">جميع البراندات</h1>
                    <p className="text-gray-500 text-sm">اكتشف منتجات براندك المفضل</p>
                </div>

                {/* Search Bar */}
                <div className="relative mb-4">
                    <Search className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
                    <input
                        type="text"
                        placeholder="ابحث عن براند..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="w-full pr-10 pl-4 py-3 bg-white border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500"
                    />
                </div>

                {/* Category Filter */}
                <div className="flex gap-2 overflow-x-auto pb-3 mb-6 no-scrollbar">
                    {categories.map(cat => (
                        <button
                            key={cat}
                            onClick={() => setSelectedCategory(cat)}
                            className={`px-4 py-2 rounded-full text-sm font-medium whitespace-nowrap transition-colors ${
                                selectedCategory === cat
                                    ? 'bg-orange-500 text-white'
                                    : 'bg-white text-gray-600 border border-gray-200 hover:bg-gray-50'
                            }`}
                        >
                            {cat}
                        </button>
                    ))}
                </div>

                {/* Brands Grid */}
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
                    {filteredBrands.map(brand => (
                        <Link
                            key={brand.id}
                            to={`/brand/${brand.id}`}
                            className="group"
                        >
                            <div className="bg-white rounded-2xl overflow-hidden shadow-sm hover:shadow-lg transition-all">
                                {/* Brand Image */}
                                <div className="relative aspect-[4/3] overflow-hidden">
                                    <img
                                        src={brand.image}
                                        alt={brand.name}
                                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                                    />
                                    {/* Overlay */}
                                    <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent" />
                                    
                                    {/* Offer Badge */}
                                    {brand.offer && (
                                        <span className="absolute top-2 right-2 bg-red-500 text-white text-[10px] px-2 py-1 rounded-full font-bold">
                                            {brand.offer}
                                        </span>
                                    )}
                                    
                                    {/* Brand Name on Image */}
                                    <div className="absolute bottom-0 left-0 right-0 p-3">
                                        <h3 className="text-white font-bold text-lg">{brand.name}</h3>
                                        <p className="text-white/80 text-xs">{brand.nameEn}</p>
                                    </div>
                                </div>
                                
                                {/* Brand Info */}
                                <div className="p-3">
                                    <div className="flex items-center justify-between text-sm">
                                        <span className="text-gray-500 flex items-center gap-1">
                                            <Package size={14} />
                                            {brand.productsCount} منتج
                                        </span>
                                        <span className="text-orange-500 font-medium flex items-center">
                                            تسوق <ChevronRight size={16} />
                                        </span>
                                    </div>
                                </div>
                            </div>
                        </Link>
                    ))}
                </div>

                {/* Empty State */}
                {filteredBrands.length === 0 && (
                    <div className="text-center py-12">
                        <div className="text-gray-400 mb-4">
                            <Search size={48} className="mx-auto" />
                        </div>
                        <h3 className="text-lg font-medium text-gray-700 mb-2">لا توجد نتائج</h3>
                        <p className="text-gray-500 text-sm">جرب البحث بكلمات مختلفة</p>
                    </div>
                )}
            </div>
        </div>
    );
};

export default BrandsPage;
