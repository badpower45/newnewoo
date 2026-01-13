import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Search, Star } from 'lucide-react';
import { api } from '../services/api';
import Seo, { getSiteUrl } from '../components/Seo';

interface Brand {
    id: number;
    name_ar: string;
    name_en: string;
    slogan_ar?: string;
    slogan_en?: string;
    logo_url?: string;
    banner_url?: string;
    primary_color?: string;
    secondary_color?: string;
    description_ar?: string;
    description_en?: string;
    rating?: number;
    is_featured: boolean;
    products_count: number;
}

const BrandsPage: React.FC = () => {
    const [brands, setBrands] = useState<Brand[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const siteUrl = getSiteUrl();
    const canonicalUrl = `${siteUrl}/brands`;

    useEffect(() => {
        loadBrands();
    }, []);

    const loadBrands = async () => {
        try {
            setLoading(true);
            const payload = await api.brands.getAll();
            const list = Array.isArray(payload) ? payload : (payload as any)?.data || [];
            setBrands(list);
        } catch (error) {
            console.error('Error loading brands:', error);
            setBrands([]);
        } finally {
            setLoading(false);
        }
    };

    const normalize = (value: string = '') =>
        value
            .toLowerCase()
            .replace(/أ|إ|آ/g, 'ا')
            .replace(/ة/g, 'ه')
            .replace(/ى/g, 'ي')
            .replace(/\s+/g, '');

    const term = normalize(searchTerm);

    const filteredBrands = brands.filter(brand => {
        if (!term) return true;
        const fields = [
            brand.name_ar,
            brand.name_en,
            brand.slogan_ar,
            brand.slogan_en,
            (brand as any)?.tags,
        ].filter(Boolean) as string[];

        return fields.some(field => normalize(field).includes(term));
    });
    const pageDescription = filteredBrands.length
        ? `تصفح ${filteredBrands.length} براند متاح على علوش ماركت واكتشف العروض والمنتجات المميزة.`
        : 'استكشف كل البراندات المتاحة في علوش ماركت.';
    const keywordList = [
        'براندات علوش ماركت',
        'عروض براندات',
        searchTerm
    ].filter(Boolean) as string[];
    const brandsStructuredData = {
        '@context': 'https://schema.org',
        '@type': 'CollectionPage',
        name: 'جميع البراندات',
        url: canonicalUrl,
        description: pageDescription
    };

    return (
        <>
            <Seo
                title="كل البراندات - علوش ماركت"
                description={pageDescription}
                url={canonicalUrl}
                keywords={keywordList}
                structuredData={brandsStructuredData}
            />
            <div className="bg-gray-50 min-h-screen pb-24 md:pb-8">
            <div className="px-4 py-4 max-w-7xl mx-auto">
                {/* Page Header */}
                <div className="mb-6">
                    <h1 className="text-2xl font-bold text-gray-900 mb-2">جميع البراندات</h1>
                    <p className="text-gray-500 text-sm">تصفح البراندات المتاحة واختر براندك المفضل</p>
                </div>

                {/* Unified Search Bar */}
                <div className="relative mb-6">
                    <Search className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
                    <input
                        type="text"
                        placeholder="ابحث عن براند..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="w-full pr-10 pl-4 py-3 bg-white border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500"
                    />
                </div>

                {/* Loading State */}
                {loading && (
                    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
                        {[1, 2, 3, 4, 5, 6, 7, 8].map(i => (
                            <div key={i} className="bg-white rounded-2xl overflow-hidden shadow-sm animate-pulse">
                                <div className="aspect-[4/3] bg-gray-200"></div>
                                <div className="p-3 space-y-2">
                                    <div className="h-4 bg-gray-200 rounded w-3/4"></div>
                                    <div className="h-3 bg-gray-200 rounded w-1/2"></div>
                                </div>
                            </div>
                        ))}
                    </div>
                )}

                {/* Brands Grid */}
                {!loading && (
                    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
                        {filteredBrands.map(brand => (
                            <Link
                                key={brand.id}
                                to={`/brand/${brand.name_en.toLowerCase().replace(/\s+/g, '-')}`}
                                className="group"
                            >
                                <div className="bg-white rounded-2xl overflow-hidden shadow-sm hover:shadow-lg transition-all border border-gray-100">
                                    <div className="relative aspect-square bg-gradient-to-br from-gray-50 to-gray-100 flex items-center justify-center p-4">
                                        {brand.logo_url || brand.banner_url ? (
                                            <img
                                                src={brand.logo_url || brand.banner_url || 'https://images.unsplash.com/photo-1606312619070-d48b4c652a52?w=400'}
                                                alt={brand.name_ar}
                                                className="w-full h-full object-contain"
                                            />
                                        ) : (
                                            <div className="w-full h-full flex items-center justify-center text-3xl font-bold text-gray-400">
                                                {(brand.name_ar || brand.name_en || '?').charAt(0)}
                                            </div>
                                        )}
                                        {brand.is_featured && (
                                            <span className="absolute top-2 right-2 bg-orange-500 text-white text-[10px] px-2 py-1 rounded-full font-bold flex items-center gap-1">
                                                <Star size={10} fill="white" />
                                                مميز
                                            </span>
                                        )}
                                    </div>
                                    <div className="p-3 text-center">
                                        <h3 className="text-sm font-bold text-gray-900">{brand.name_ar}</h3>
                                        <p className="text-xs text-gray-500">{brand.name_en}</p>
                                    </div>
                                </div>
                            </Link>
                        ))}
                    </div>
                )}

                {/* Empty State */}
                {!loading && filteredBrands.length === 0 && (
                    <div className="text-center py-12">
                        <div className="text-gray-400 mb-4">
                            <Search size={48} className="mx-auto" />
                        </div>
                        <h3 className="text-lg font-medium text-gray-700 mb-2">لا توجد براندات</h3>
                        <p className="text-gray-500 text-sm">
                            {searchTerm ? 'جرب البحث بكلمات مختلفة' : 'لا توجد براندات متاحة حالياً'}
                        </p>
                    </div>
                )}
            </div>
        </div>
        </>
    );
};

export default BrandsPage;
