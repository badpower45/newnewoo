import React, { useState, useEffect } from 'react';
import { ArrowLeft, ArrowRight, Loader, Percent, Tag, ShoppingBag, AlertCircle, Link2, BadgePercent } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { api } from '../services/api';

interface MagazineOffer {
    id: number;
    name: string;
    name_en?: string;
    price: number;
    old_price?: number;
    unit?: string;
    discount_percentage?: number;
    image?: string;
    category?: string;
    bg_color?: string;
    product_id?: number;
}

const MagazinePage: React.FC = () => {
    const navigate = useNavigate();
    const [offers, setOffers] = useState<MagazineOffer[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    useEffect(() => {
        loadMagazineOffers();
    }, []);

    const loadMagazineOffers = async () => {
        setLoading(true);
        setError('');
        try {
            const response = await api.magazine.getAll();
            const data = response?.data ?? response;
            const parsed = Array.isArray(data) ? data : Array.isArray(data?.data) ? data.data : [];
            setOffers(parsed);
        } catch (err) {
            console.error('Failed to load magazine offers:', err);
            setError('فشل تحميل عروض المجلة');
        } finally {
            setLoading(false);
        }
    };

    const handleOpenProduct = (offer: MagazineOffer) => {
        if (offer.product_id) {
            navigate(`/product/${offer.product_id}`);
        }
    };

    if (loading) {
        return (
            <div className="min-h-screen bg-gray-50 flex items-center justify-center">
                <Loader className="w-12 h-12 text-orange-500 animate-spin" />
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-50 pb-24">
            {/* Header */}
            <div className="bg-gradient-to-r from-orange-500 to-orange-600 text-white px-4 py-6 sticky top-0 z-10 shadow-md">
                <div className="flex items-center justify-between max-w-7xl mx-auto" dir="ltr">
                    <button 
                        onClick={() => navigate(-1)}
                        className="w-10 h-10 bg-white/20 backdrop-blur-sm rounded-full flex items-center justify-center hover:bg-white/30 transition"
                    >
                        <ArrowLeft size={20} />
                    </button>
                    <div className="text-center flex-1">
                        <h1 className="text-2xl font-bold flex items-center justify-center gap-2">
                            <ShoppingBag size={22} />
                            مجلة العروض
                        </h1>
                        <p className="text-sm text-white/90 mt-1">كل المنتجات اللي حضرتك ضايفها في المجلة</p>
                    </div>
                    <div className="w-10" />
                </div>
            </div>

            <div className="px-4 py-6 max-w-7xl mx-auto">
                {error && (
                    <div className="flex items-center gap-2 mb-4 text-red-700 bg-red-50 border border-red-100 px-3 py-2 rounded-lg text-sm">
                        <AlertCircle size={16} />
                        {error}
                    </div>
                )}

                {offers.length === 0 ? (
                    <div className="text-center py-20">
                        <Tag size={64} className="mx-auto text-gray-300 mb-4" />
                        <h2 className="text-xl font-bold text-gray-800 mb-2">لا توجد عروض حالياً</h2>
                        <p className="text-gray-500">أضف عروض جديدة من لوحة التحكم لتظهر هنا</p>
                    </div>
                ) : (
                    <>
                        <div className="flex items-center gap-2 mb-2">
                            <Percent className="w-5 h-5 text-orange-500" />
                            <p className="text-gray-700">
                                <span className="font-bold text-orange-600">{offers.length}</span> عرض في المجلة
                            </p>
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                            {offers.map((offer) => (
                                <div
                                    key={offer.id}
                                    className="bg-white rounded-2xl shadow-sm overflow-hidden border border-gray-100"
                                >
                                    <div className={`relative bg-gradient-to-br ${offer.bg_color || 'from-orange-500 to-orange-600'} p-4`}> 
                                        <div className="absolute inset-0 bg-black/5" />
                                        <div className="relative flex items-center gap-4">
                                            <div className="w-24 h-24 bg-white rounded-xl p-2 flex items-center justify-center overflow-hidden shadow-inner">
                                                <img
                                                    src={offer.image || 'https://placehold.co/200x200?text=Offer'}
                                                    alt={offer.name}
                                                    className="w-full h-full object-contain"
                                                    onError={(e) => {
                                                        (e.target as HTMLImageElement).src = 'https://placehold.co/200x200?text=Offer';
                                                    }}
                                                />
                                            </div>
                                            <div className="flex-1 min-w-0">
                                                <p className="text-xs text-white/80 mb-1">{offer.category || 'عروض'}</p>
                                                <h3 className="text-white font-bold text-lg leading-tight line-clamp-2">{offer.name}</h3>
                                                <div className="flex flex-wrap items-center gap-2 mt-2">
                                                    {offer.discount_percentage ? (
                                                        <span className="inline-flex items-center gap-1 px-2 py-1 text-xs font-bold text-orange-900 bg-white rounded-full shadow-sm">
                                                            {offer.discount_percentage}% خصم
                                                        </span>
                                                    ) : null}
                                                    <span className="inline-flex items-center gap-1 px-2 py-1 text-[11px] font-semibold text-white bg-black/25 rounded-full">
                                                        <BadgePercent size={12} /> عرض المجلة
                                                    </span>
                                                    {!offer.product_id && (
                                                        <span className="inline-flex items-center gap-1 px-2 py-1 text-[11px] font-semibold text-amber-900 bg-amber-100 rounded-full">
                                                            <Link2 size={12} /> بدون ربط منتج
                                                        </span>
                                                    )}
                                                </div>
                                            </div>
                                        </div>
                                    </div>

                                    <div className="p-4 flex items-center justify-between">
                                        <div>
                                            <div className="flex items-baseline gap-1">
                                                <span className="text-2xl font-bold text-gray-900">{offer.price}</span>
                                                <span className="text-sm text-gray-500">جنيه</span>
                                            </div>
                                            {offer.old_price ? (
                                                <p className="text-sm text-gray-400 line-through">{offer.old_price}</p>
                                            ) : null}
                                            <p className="text-xs text-gray-500 mt-1">{offer.unit || 'وحدة'}</p>
                                        </div>

                                        <button
                                            onClick={() => handleOpenProduct(offer)}
                                            disabled={!offer.product_id}
                                            className={`px-4 py-2 rounded-xl font-semibold text-sm transition-colors shadow-sm ${
                                                offer.product_id
                                                    ? 'bg-orange-500 text-white hover:bg-orange-600'
                                                    : 'bg-gray-100 text-gray-400 cursor-not-allowed'
                                            }`}
                                        >
                                            {offer.product_id ? 'عرض المنتج' : 'عرض بدون ربط'}
                                        </button>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </>
                )}
            </div>
        </div>
    );
};

export default MagazinePage;
