import React, { useState, useEffect } from 'react';
import { ArrowLeft, Loader, Percent, Tag, ShoppingBag, AlertCircle, Link2, BadgePercent } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { api } from '../services/api';
import { useCart } from '../context/CartContext';
import { useBranch } from '../context/BranchContext';

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
    const { addToCart } = useCart();
    const { selectedBranch } = useBranch();
    const [offers, setOffers] = useState<MagazineOffer[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [addingOfferId, setAddingOfferId] = useState<number | null>(null);

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

    const handleAddToCart = async (offer: MagazineOffer) => {
        setAddingOfferId(offer.id);
        try {
            let normalizedProduct: any = {
                id: `mag-${offer.id}`,
                name: offer.name,
                price: Number(offer.price ?? 0),
                image: offer.image || '',
                category: offer.category || 'عروض المجلة',
                weight: '',
                stock_quantity: 1000
            };

            // إن وجد product_id نجلب بيانات المنتج الحقيقية لنفس سلوك المنتجات
            if (offer.product_id) {
                const productResponse = await api.products.getOne(String(offer.product_id), selectedBranch?.id);
                const productData = (productResponse as any)?.data || productResponse || {};
                normalizedProduct = {
                    ...productData,
                    id: String(productData.id ?? offer.product_id),
                    name: productData.name || offer.name,
                    price: Number(productData.price ?? offer.price ?? 0),
                    image: productData.image || productData.image_url || offer.image || '',
                    category: productData.category || offer.category || 'عروض المجلة',
                    stock_quantity: productData.stock_quantity ?? productData.stockQuantity ?? 1000,
                    reserved_quantity: productData.reserved_quantity ?? productData.reservedQuantity
                };
            }

            addToCart(normalizedProduct, 1);
        } catch (err) {
            console.error('Failed to add magazine offer to cart:', err);
            alert('تعذر إضافة المنتج للسلة حالياً. حاول مرة أخرى.');
        } finally {
            setAddingOfferId(null);
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
                            {offers.map((offer) => {
                                const hasDiscount = offer.discount_percentage && offer.discount_percentage > 0;
                                return (
                                    <div key={offer.id} className="bg-white rounded-xl border border-gray-100 shadow-sm p-4 flex flex-col gap-3">
                                        <div className="relative w-full aspect-square bg-gray-50 rounded-lg flex items-center justify-center overflow-hidden">
                                            <img
                                                src={offer.image || 'https://placehold.co/200x200?text=Offer'}
                                                alt={offer.name}
                                                className="w-full h-full object-contain"
                                                onError={(e) => {
                                                    (e.target as HTMLImageElement).src = 'https://placehold.co/200x200?text=Offer';
                                                }}
                                            />
                                            <div className="absolute top-2 left-2 flex gap-2">
                                                <span className="px-2 py-1 text-[11px] font-bold bg-orange-500 text-white rounded-full flex items-center gap-1">
                                                    <BadgePercent size={12} /> عرض المجلة
                                                </span>
                                                {hasDiscount && (
                                                    <span className="px-2 py-1 text-[11px] font-bold bg-red-100 text-red-700 rounded-full">
                                                        -{offer.discount_percentage}%
                                                    </span>
                                                )}
                                            </div>
                                        </div>
                                        <div className="space-y-1">
                                            <p className="text-xs text-gray-500">{offer.category || 'عرض'}</p>
                                            <h3 className="text-base font-bold text-gray-900 line-clamp-2">{offer.name}</h3>
                                        </div>
                                        <div className="flex items-center justify-between">
                                            <div>
                                                <div className="flex items-baseline gap-1">
                                                    <span className="text-xl font-bold text-orange-600">{Number(offer.price || 0).toFixed(2)}</span>
                                                    <span className="text-xs text-gray-500">جنيه</span>
                                                </div>
                                                {offer.old_price ? (
                                                    <p className="text-sm text-gray-400 line-through">{Number(offer.old_price).toFixed(2)}</p>
                                                ) : null}
                                            </div>
                                            <button
                                                onClick={() => handleAddToCart(offer)}
                                                disabled={addingOfferId === offer.id}
                                                className="px-3 py-2 rounded-lg bg-orange-500 text-white text-sm font-bold hover:bg-orange-600 transition disabled:opacity-50"
                                            >
                                                {addingOfferId === offer.id ? '...' : 'أضف'}
                                            </button>
                                        </div>
                                        <div className="text-xs text-gray-500 flex justify-between">
                                            <span>{offer.unit || 'وحدة'}</span>
                                            {offer.discount_percentage && (
                                                <span className="text-red-600 font-bold">-{offer.discount_percentage}%</span>
                                            )}
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    </>
                )}
            </div>
        </div>
    );
};

export default MagazinePage;
