import React, { useState, useEffect, useRef } from 'react';
import { ChevronLeft, Search, Loader2, Grid3X3, LayoutList, Mic } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import CategoryCard from '../components/CategoryCard';
import { api } from '../services/api';
import { useLanguage } from '../context/LanguageContext';
import Seo, { getSiteUrl } from '../components/Seo';
import { staticData } from '../utils/staticDataClient';

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
    const { language } = useLanguage();
    const [categories, setCategories] = useState<Category[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
    const [isListening, setIsListening] = useState(false);
    const [spokenTerm, setSpokenTerm] = useState('');
    const recognitionRef = useRef<any>(null);
    const siteUrl = getSiteUrl();
    const canonicalUrl = `${siteUrl}/categories`;
    const keywordList = [
        'تصنيفات علوش ماركت',
        'تسوق حسب القسم',
        ...categories.slice(0, 6).map(cat => cat.name_ar || cat.name)
    ].filter(Boolean) as string[];
    const categoryStructuredData = {
        '@context': 'https://schema.org',
        '@type': 'CollectionPage',
        name: 'تصنيفات علوش ماركت',
        description: 'تصفح أقسام المنتجات في علوش ماركت.',
        url: canonicalUrl
    };

    useEffect(() => {
        loadCategories();
    }, []);

    const normalize = (text: string = '') =>
        text
            .toLowerCase()
            .replace(/أ|إ|آ/g, 'ا')
            .replace(/ة/g, 'ه')
            .replace(/ى/g, 'ي')
            .trim();

    const loadCategories = async () => {
        setLoading(true);
        try {
            // Try loading from static data first (instant!)
            const data = await staticData.load();
            const list = data.categories || [];
            
            if (Array.isArray(list) && list.length > 0) {
                console.log('[Categories] ✅ Loaded from static data:', list.length);
                setCategories(list);
            } else {
                // Fallback to API if static data is empty
                console.log('[Categories] ⚠️ Static data empty, falling back to API');
                const res = await api.categories.getAll();
                const apiList = res.data || res || [];
                if (Array.isArray(apiList)) {
                    setCategories(apiList);
                }
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

        // Reuse single instance to avoid "already started" errors
        if (!recognitionRef.current) {
            const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
            const recognition = new SpeechRecognition();

            recognition.lang = language === 'ar' ? 'ar-SA' : 'en-US';
            recognition.continuous = false;
            recognition.interimResults = false;

            recognition.onstart = () => {
                setIsListening(true);
                setSpokenTerm('');
            };

            recognition.onresult = (event: any) => {
                const transcript = event.results[0][0].transcript;
                setSpokenTerm(transcript);
                setSearchTerm(transcript);
            };

            recognition.onerror = (event: any) => {
                if (event.error === 'aborted') return;
                console.error('Speech recognition error:', event.error);
                setIsListening(false);
                alert('حدث خطأ في البحث الصوتي');
            };

            recognition.onend = () => {
                setIsListening(false);
                if (spokenTerm) {
                    setSearchTerm(spokenTerm);
                }
            };

            recognitionRef.current = recognition;
        }

        const recognition = recognitionRef.current;

        if (isListening) {
            recognition.stop();
            return;
        }

        try {
            recognition.start();
        } catch (e) {
            console.error('Speech recognition start error:', e);
            setIsListening(false);
        }
    };

    const filteredCategories = categories.filter(cat => {
        const nameAr = cat.name_ar || '';
        const nameEn = cat.name || '';
        const term = normalize(searchTerm);
        return normalize(nameEn).includes(term) || normalize(nameAr).includes(term);
    });
    const pageDescription = filteredCategories.length
        ? `اكتشف ${filteredCategories.length} تصنيفاً داخل علوش ماركت وحدد القسم المناسب لك.`
        : 'استكشف كل تصنيفات علوش ماركت للعروض والمنتجات المتنوعة.';

    return (
        <>
            <Seo
                title="التصنيفات - علوش ماركت"
                description={pageDescription}
                url={canonicalUrl}
                keywords={keywordList}
                structuredData={categoryStructuredData}
            />
            <div className="bg-gray-50 min-h-screen pb-24 md:pb-8">
                {/* Fixed Mobile Header - Removed sticky */}
                <div className="bg-white p-4 shadow-sm flex items-center justify-between md:hidden" dir="ltr">
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
                                className={`absolute right-3 top-1/2 -translate-y-1/2 p-1.5 rounded-full transition-all ${isListening
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
                        /* Grid View - 3 columns on mobile, more on larger screens */
                        <div className="grid grid-cols-3 sm:grid-cols-3 md:grid-cols-3 lg:grid-cols-3 xl:grid-cols-3 gap-3 md:gap-4">
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
        </>
    );
};

export default CategoriesPage;
