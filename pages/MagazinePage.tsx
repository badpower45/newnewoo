import React, { useState, useEffect } from 'react';
import { ArrowRight, Plus, Loader } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { api } from '../services/api';
import { useCart } from '../context/CartContext';

interface MagazineOffer {
    id: number;
    name: string;
    price: number;
    old_price?: number;
    unit: string;
    discount_percentage?: number;
    image: string;
    category: string;
    bg_color: string;
    product_id?: number;
}

const MagazinePage = () => {
    const navigate = useNavigate();
    const { addToCart } = useCart();
    const [offers, setOffers] = useState<MagazineOffer[]>([]);
    const [categories, setCategories] = useState<string[]>(['جميع العروض']);
    const [selectedCategory, setSelectedCategory] = useState('جميع العروض');
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        loadData();
    }, []);

    useEffect(() => {
        loadOffers();
    }, [selectedCategory]);

    const loadData = async () => {
        setLoading(true);
        try {
            // Load categories
            const catRes = await api.magazine.getCategories();
            if (catRes.data) {
                setCategories(catRes.data);
            }
            // Load offers
            await loadOffers();
        } catch (err) {
            console.error('Failed to load magazine data:', err);
        } finally {
            setLoading(false);
        }
    };

    const loadOffers = async () => {
        try {
            const category = selectedCategory !== 'جميع العروض' ? selectedCategory : undefined;
            const res = await api.magazine.getAll(category);
            if (res.data) {
                setOffers(res.data);
            }
        } catch (err) {
            console.error('Failed to load offers:', err);
        }
    };

    const handleAddToCart = (offer: MagazineOffer) => {
        // Check if product_id exists - if not, show alert
        if (!offer.product_id) {
            alert('هذا المنتج غير متوفر حالياً في المخزون. يرجى الربط بمنتج من المخزون.');
            return;
        }
        
        // Convert offer to product format
        const product = {
            id: offer.product_id,
            name: offer.name,
            price: offer.price,
            image: offer.image,
            category: offer.category,
            weight: offer.unit,
            stock_quantity: 999 // Assuming available
        };
        addToCart(product as any, 1);
        
        // Show success toast
        const toast = document.createElement('div');
        toast.className = 'fixed bottom-20 left-1/2 transform -translate-x-1/2 bg-green-500 text-white px-4 py-2 rounded-lg shadow-lg z-50 animate-bounce';
        toast.textContent = 'تمت الإضافة للسلة ✓';
        document.body.appendChild(toast);
        setTimeout(() => toast.remove(), 2000);
    };

    // Get current date for magazine header
    const getDateRange = () => {
        const now = new Date();
        const start = now.getDate();
        const end = new Date(now);
        end.setDate(end.getDate() + 28);
        const months = ['يناير', 'فبراير', 'مارس', 'أبريل', 'مايو', 'يونيو', 'يوليو', 'أغسطس', 'سبتمبر', 'أكتوبر', 'نوفمبر', 'ديسمبر'];
        return `من ${start} لغاية ${end.getDate()} ${months[end.getMonth()]} ${end.getFullYear()}`;
    };

    return (
        <div className="min-h-screen bg-[#FAFAFA] pb-20">
            {/* Header */}
            <div className="bg-gradient-to-br from-[#F97316] to-[#ea580c] p-4 pb-6 md:p-6 md:pb-8 relative overflow-hidden">
                {/* Confetti Background */}
                <div className="absolute inset-0 opacity-10">
                    <div className="absolute top-4 right-10 w-3 h-3 bg-yellow-300 rounded-full" />
                    <div className="absolute top-12 right-24 w-2 h-2 bg-white rounded-full" />
                    <div className="absolute top-8 left-16 w-4 h-4 bg-red-300 rounded-full" />
                    <div className="absolute bottom-4 right-32 w-3 h-3 bg-blue-300 rounded-full" />
                    <div className="absolute bottom-8 left-20 w-2 h-2 bg-green-300 rounded-full" />
                    <div className="absolute top-20 left-8 w-2 h-2 bg-pink-300 rounded-full" />
                    <div className="absolute bottom-12 right-12 w-4 h-4 bg-purple-300 rounded-full" />
                </div>

                <div className="flex items-center gap-2 mb-3 relative">
                    <button 
                        onClick={() => navigate(-1)} 
                        className="w-9 h-9 bg-white/20 backdrop-blur-sm rounded-full flex items-center justify-center hover:bg-white/30 transition-colors flex-shrink-0"
                    >
                        <ArrowRight className="w-5 h-5 text-white" />
                    </button>
                    <h1 className="text-white text-base md:text-xl font-bold line-clamp-1">مجلة العروض الأسبوعية</h1>
                </div>

                <p className="text-white/90 relative text-xs md:text-sm">
                    عروض حصرية ومتنوعة {getDateRange()}
                </p>
            </div>

            {/* Categories */}
            <div className="px-3 md:px-4 -mt-3 md:-mt-4 mb-3 md:mb-4 relative z-10">
                <div className="bg-white rounded-xl md:rounded-2xl shadow-lg p-2 md:p-3 overflow-x-auto scrollbar-hide">
                    <div className="flex gap-1.5 md:gap-2">
                        {categories.map((category, index) => (
                            <button
                                key={index}
                                onClick={() => setSelectedCategory(category)}
                                className={`px-3 md:px-4 py-1.5 md:py-2 rounded-full whitespace-nowrap transition-all text-xs md:text-sm font-medium ${
                                    selectedCategory === category
                                        ? 'bg-[#F97316] text-white shadow-md'
                                        : 'bg-[#F3F4F6] text-[#6B7280] hover:bg-[#E5E7EB]'
                                }`}
                            >
                                {category}
                            </button>
                        ))}
                    </div>
                </div>
            </div>

            {/* Loading State */}
            {loading ? (
                <div className="flex items-center justify-center py-20">
                    <Loader className="w-8 h-8 text-[#F97316] animate-spin" />
                </div>
            ) : (
                <>
                    {/* Offers Grid - Magazine Style */}
                    <div className="px-3 md:px-4">
                        <div className="grid grid-cols-2 gap-2 md:gap-3">
                            {offers.map((offer) => (
                                <div
                                    key={offer.id}
                                    className="relative bg-white rounded-2xl overflow-hidden shadow-md hover:shadow-xl transition-all border border-orange-100"
                                >
                                    {/* Discount Badge */}
                                    {offer.discount_percentage && offer.discount_percentage > 0 && (
                                        <div className="absolute top-1.5 right-1.5 z-10">
                                            <div className="bg-gradient-to-br from-orange-600 to-red-600 text-white px-2 py-0.5 rounded-full text-xs shadow-lg transform rotate-[-10deg] font-bold flex items-center gap-1">
                                                <span>📖</span>
                                                {offer.discount_percentage}%
                                            </div>
                                        </div>
                                    )}

                                    {/* Magazine Page Corner Fold Effect */}
                                    <div className="absolute top-0 left-0 w-0 h-0 border-t-[20px] border-t-orange-200 border-r-[20px] border-r-transparent z-10"></div>

                                    {/* Decorative Magazine Background */}
                                    <div className={`absolute inset-0 bg-gradient-to-br ${offer.bg_color || 'from-orange-50 to-yellow-50'} opacity-20`}>
                                        {/* Magazine page lines decoration */}
                                        <div className="absolute top-4 left-2 right-2 space-y-1 opacity-30">
                                            <div className="h-0.5 bg-orange-300 w-3/4"></div>
                                            <div className="h-0.5 bg-orange-300 w-1/2"></div>
                                        </div>
                                    </div>

                                    {/* Product Image */}
                                    <div className="relative pt-2 px-2 md:pt-4 md:px-4">
                                        <div className="bg-white/50 backdrop-blur-sm rounded-xl p-1">
                                            <img
                                                src={offer.image}
                                                alt={offer.name}
                                                className="w-full h-24 md:h-32 object-contain relative z-10"
                                                onError={(e) => {
                                                    (e.target as HTMLImageElement).src = 'https://placehold.co/300x300?text=Product';
                                                }}
                                            />
                                        </div>
                                    </div>

                                    {/* Product Info */}
                                    <div className="p-2 md:p-3 relative">
                                        <p className="text-[#23110C] mb-1.5 min-h-[2rem] md:min-h-[2.5rem] text-xs md:text-sm font-bold line-clamp-2">
                                            {offer.name}
                                        </p>
                                        
                                        {/* Price Tag - Large and Bold with Magazine Style */}
                                        <div className="flex items-end justify-between mb-1">
                                            <div>
                                                <div className="flex items-baseline gap-1">
                                                    <span className="text-orange-600 text-xl md:text-3xl font-black">
                                                        {offer.price}
                                                    </span>
                                                    <span className="text-gray-500 text-[10px] md:text-sm font-semibold">
                                                        {offer.unit}
                                                    </span>
                                                </div>
                                                {offer.old_price && offer.old_price > offer.price && (
                                                    <div className="flex items-center gap-1">
                                                        <span className="text-gray-400 line-through text-[10px] md:text-xs">
                                                            {offer.old_price} ج.م
                                                        </span>
                                                        <span className="text-[9px] text-green-600 font-bold bg-green-100 px-1 py-0.5 rounded">
                                                            وفر {(offer.old_price - offer.price).toFixed(0)}
                                                        </span>
                                                    </div>
                                                )}
                                            </div>
                                            
                                            {/* Quick Add Button - Magazine Style */}
                                            <button 
                                                onClick={() => handleAddToCart(offer)}
                                                className="w-7 h-7 md:w-9 md:h-9 bg-gradient-to-br from-orange-500 to-orange-600 rounded-full flex items-center justify-center shadow-lg hover:shadow-xl hover:from-orange-600 hover:to-orange-700 transition-all active:scale-95 flex-shrink-0 relative group"
                                            >
                                                <Plus className="w-3.5 h-3.5 md:w-5 md:h-5 text-white font-bold" />
                                                {/* Ripple effect */}
                                                <span className="absolute inset-0 rounded-full bg-white opacity-0 group-hover:opacity-20 transition-opacity"></span>
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Empty State */}
                    {offers.length === 0 && !loading && (
                        <div className="text-center py-20">
                            <p className="text-[#6B7280]">لا توجد عروض متاحة حالياً</p>
                        </div>
                    )}

                    {/* Load More Button */}
                    {offers.length > 0 && (
                        <div className="px-4 mt-6">
                            <button 
                                onClick={loadOffers}
                                className="w-full py-3 bg-white text-[#F97316] border-2 border-[#F97316] rounded-full hover:bg-[#FFF7ED] transition-all font-semibold"
                            >
                                تحميل المزيد من العروض
                            </button>
                        </div>
                    )}
                </>
            )}
        </div>
    );
};

export default MagazinePage;
