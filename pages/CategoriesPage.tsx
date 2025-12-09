import React, { useState, useEffect } from 'react';
import { ChevronLeft, Search, Loader2, Grid3X3, LayoutList, Mic } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import CategoryCard from '../components/CategoryCard';
import { api } from '../services/api';

interface Category {
    id?: number;
    name: string;
    name_ar?: string;
    image?: string;
    icon?: string;
    bg_color?: string;
    products_count?: number;
}

const CategoriesPage = () => {
    const navigate = useNavigate();
    const [categories, setCategories] = useState<Category[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
    const [isListening, setIsListening] = useState(false);

    useEffect(() => {
        loadCategories();
    }, []);

    const loadCategories = async () => {
        setLoading(true);
        try {
            const res = await api.categories.getAll();
            const list = res.data || res || [];
            if (Array.isArray(list)) {
                setCategories(list);
            }
        } catch (err) {
            console.error('Failed to load categories:', err);
        } finally {
            setLoading(false);
        }
    };

    const handleVoiceSearch = () => {
        if (!('webkitSpeechRecognition' in window) && !('SpeechRecognition' in window)) {
            alert('متصفحك لا يدعم البحث الصوتي');
            return;
        }

        const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
        const recognition = new SpeechRecognition();
        
        recognition.lang = 'ar-SA';
        recognition.continuous = false;
        recognition.interimResults = false;

        recognition.onstart = () => {
            setIsListening(true);
        };

        recognition.onresult = (event: any) => {
            const transcript = event.results[0][0].transcript;
            setSearchTerm(transcript);
            setIsListening(false);
        };

        recognition.onerror = (event: any) => {
            console.error('Speech recognition error:', event.error);
            setIsListening(false);
            alert('حدث خطأ في البحث الصوتي');
        };

        recognition.onend = () => {
            setIsListening(false);
        };

        recognition.start();
    };

    const filteredCategories = categories.filter(cat => {
        const nameAr = cat.name_ar || '';
        const nameEn = cat.name || '';
        const term = searchTerm.toLowerCase();
        return nameEn.toLowerCase().includes(term) || nameAr.toLowerCase().includes(term);
    });

    return (
        <div className="bg-gray-50 min-h-screen pb-24 md:pb-8">
            {/* Fixed Mobile Header - Removed sticky */}
            <div className="bg-white p-4 shadow-sm flex items-center justify-between md:hidden">
                <button onClick={() => navigate(-1)} className="p-2 -ml-2 text-gray-700">
                    <ChevronLeft size={28} />
                </button>
                <h1 className="text-xl font-bold text-gray-900">التصنيفات</h1>
                <div className="w-10" />
            </div>

            {/* Desktop Header */}
            <div className="hidden md:block bg-gradient-to-r from-orange-500 to-orange-600 p-8 mb-6">
                <div className="max-w-7xl mx-auto">
                    <h1 className="text-3xl font-bold text-white">تصفح التصنيفات</h1>
                    <p className="text-orange-100 mt-2">اختر القسم المناسب لك</p>
                </div>
            </div>

            {/* Search & View Toggle - Sticky on scroll */}
            <div className="p-4 max-w-7xl mx-auto sticky top-0 bg-gray-50 z-30 pb-2">
                <div className="flex gap-3 mb-4">
                    <div className="relative flex-1">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
                        <input
                            type="text"
                            placeholder="ابحث عن تصنيف..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="w-full pl-10 pr-12 py-3 bg-white border border-gray-200 rounded-2xl focus:outline-none focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500 shadow-sm"
                            dir="rtl"
                        />
                        {/* Voice Search Button */}
                        <button
                            onClick={handleVoiceSearch}
                            className={`absolute right-3 top-1/2 -translate-y-1/2 p-1.5 rounded-full transition-all ${
                                isListening 
                                    ? 'bg-red-500 text-white animate-pulse' 
                                    : 'text-gray-400 hover:text-orange-500 hover:bg-orange-50'
                            }`}
                            title="البحث الصوتي"
                        >
                            <Mic size={18} />
                        </button>
                    </div>
                    {/* View Toggle */}
                    <div className="flex bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden">
                        <button
                            onClick={() => setViewMode('grid')}
                            className={`p-3 transition-colors ${viewMode === 'grid' ? 'bg-orange-500 text-white' : 'text-gray-500 hover:bg-gray-50'}`}
                        >
                            <Grid3X3 size={20} />
                        </button>
                        <button
                            onClick={() => setViewMode('list')}
                            className={`p-3 transition-colors ${viewMode === 'list' ? 'bg-orange-500 text-white' : 'text-gray-500 hover:bg-gray-50'}`}
                        >
                            <LayoutList size={20} />
                        </button>
                    </div>
                </div>

                {/* Categories Count */}
                {!loading && filteredCategories.length > 0 && (
                    <p className="text-sm text-gray-500 mb-4">{filteredCategories.length} تصنيف</p>
                )}

                {/* Loading */}
                {loading ? (
                    <div className="flex flex-col items-center justify-center py-20">
                        <Loader2 className="w-10 h-10 text-orange-500 animate-spin mb-4" />
                        <p className="text-gray-500">جاري تحميل التصنيفات...</p>
                    </div>
                ) : viewMode === 'grid' ? (
                    /* Grid View */
                    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4">
                        {filteredCategories.map((cat, idx) => (
                            <CategoryCard 
                                key={cat.id || idx} 
                                name={cat.name_ar || cat.name}
                                nameEn={cat.name}
                                image={cat.image}
                                icon={cat.icon}
                                bgColor={cat.bg_color || 'bg-gradient-to-br from-orange-50 to-orange-100'}
                                productsCount={cat.products_count}
                                variant="default"
                            />
                        ))}
                    </div>
                ) : (
                    /* List View */
                    <div className="space-y-3">
                        {filteredCategories.map((cat, idx) => (
                            <CategoryCard 
                                key={cat.id || idx} 
                                name={cat.name_ar || cat.name}
                                nameEn={cat.name}
                                image={cat.image}
                                icon={cat.icon}
                                bgColor={cat.bg_color || 'bg-gradient-to-br from-orange-50 to-orange-100'}
                                productsCount={cat.products_count}
                                variant="horizontal"
                            />
                        ))}
                    </div>
                )}

                {/* Empty State */}
                {!loading && filteredCategories.length === 0 && (
                    <div className="text-center py-16">
                        <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                            <Search className="w-8 h-8 text-gray-400" />
                        </div>
                        <p className="text-gray-500 text-lg">لا توجد تصنيفات مطابقة للبحث</p>
                        <button 
                            onClick={() => setSearchTerm('')}
                            className="mt-4 text-orange-500 font-medium hover:underline"
                        >
                            مسح البحث
                        </button>
                    </div>
                )}
            </div>
        </div>
    );
};

export default CategoriesPage;
