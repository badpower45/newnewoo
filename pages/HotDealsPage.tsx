import React, { useState, useEffect } from 'react';
import { ArrowRight, Filter, Flame, Plus, Loader } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { api } from '../services/api';
import { useCart } from '../context/CartContext';

interface HotDeal {
    id: number;
    name: string;
    price: number;
    old_price: number;
    discount_percentage: number;
    image: string;
    sold_percentage: number;
    total_quantity: number;
    sold_quantity: number;
    end_time: string;
    time_remaining: number;
    is_flash_deal: boolean;
    product_id?: number;
}

const HotDealsPage = () => {
    const navigate = useNavigate();
    const { addToCart } = useCart();
    const [deals, setDeals] = useState<HotDeal[]>([]);
    const [flashDeal, setFlashDeal] = useState<HotDeal | null>(null);
    const [loading, setLoading] = useState(true);
    const [timeLeft, setTimeLeft] = useState({
        hours: 0,
        minutes: 0,
        seconds: 0
    });

    useEffect(() => {
        loadData();
    }, []);

    // Countdown timer
    useEffect(() => {
        if (!flashDeal) return;

        const updateTimer = () => {
            const endTime = new Date(flashDeal.end_time).getTime();
            const now = Date.now();
            const diff = endTime - now;

            if (diff <= 0) {
                setTimeLeft({ hours: 0, minutes: 0, seconds: 0 });
                return;
            }

            const hours = Math.floor(diff / (1000 * 60 * 60));
            const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
            const seconds = Math.floor((diff % (1000 * 60)) / 1000);

            setTimeLeft({ hours, minutes, seconds });
        };

        updateTimer();
        const timer = setInterval(updateTimer, 1000);

        return () => clearInterval(timer);
    }, [flashDeal]);

    const loadData = async () => {
        setLoading(true);
        try {
            // Load all deals
            const dealsRes = await api.hotDeals.getAll();
            if (dealsRes.data) {
                // Separate flash deal from regular deals
                const flash = dealsRes.data.find((d: HotDeal) => d.is_flash_deal);
                const regular = dealsRes.data.filter((d: HotDeal) => !d.is_flash_deal);
                
                setFlashDeal(flash || null);
                setDeals(regular);
            }
        } catch (err) {
            console.error('Failed to load hot deals:', err);
        } finally {
            setLoading(false);
        }
    };

    const handleAddToCart = async (deal: HotDeal) => {
        // Check if product_id exists - if not, show alert
        if (!deal.product_id) {
            alert('هذا العرض غير مرتبط بمنتج. يرجى ربطه بمنتج من المخزون.');
            return;
        }
        
        const product = {
            id: deal.product_id,
            name: deal.name,
            price: deal.price,
            image: deal.image,
            category: 'عروض',
            weight: '',
            stock_quantity: deal.total_quantity - deal.sold_quantity
        };
        addToCart(product as any, 1);

        // Update sold quantity
        try {
            await api.hotDeals.updateSold(deal.id, 1);
        } catch (err) {
            console.error('Failed to update sold quantity:', err);
        }
        
        // Show success toast
        const toast = document.createElement('div');
        toast.className = 'fixed bottom-20 left-1/2 transform -translate-x-1/2 bg-green-500 text-white px-4 py-2 rounded-lg shadow-lg z-50 animate-bounce';
        toast.innerHTML = '<span class="font-bold">✓ تمت الإضافة للسلة</span>';
        document.body.appendChild(toast);
        setTimeout(() => toast.remove(), 2000);
    };

    return (
        <div className="min-h-screen bg-[#FAFAFA] pb-20">
            {/* Header */}
            <div className="bg-white border-b border-[#E5E7EB] p-4 sticky top-0 z-10">
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <button 
                            onClick={() => navigate(-1)} 
                            className="w-10 h-10 flex items-center justify-center"
                        >
                            <ArrowRight className="w-6 h-6 text-[#23110C]" />
                        </button>
                        <h2 className="flex items-center gap-2 text-xl font-bold text-[#23110C]">
                            <Flame className="w-6 h-6 text-[#F97316]" />
                            العروض الساخنة
                        </h2>
                    </div>
                    <button className="w-10 h-10 flex items-center justify-center">
                        <Filter className="w-5 h-5 text-[#6B7280]" />
                    </button>
                </div>
            </div>

            {loading ? (
                <div className="flex items-center justify-center py-20">
                    <Loader className="w-8 h-8 text-[#F97316] animate-spin" />
                </div>
            ) : (
                <>
                    {/* Flash Sale Banner */}
                    {flashDeal && (
                        <div className="bg-gradient-to-br from-[#EF4444] to-[#dc2626] mx-4 mt-4 rounded-2xl overflow-hidden shadow-xl">
                            <div className="p-4 relative">
                                {/* Countdown Timer */}
                                <div className="flex items-center justify-between mb-3">
                                    <div className="flex items-center gap-2">
                                        <Flame className="w-5 h-5 text-yellow-300 animate-pulse" />
                                        <span className="text-white font-bold">
                                            عرض سريع ينتهي خلال:
                                        </span>
                                    </div>
                                    <div className="flex gap-2">
                                        <div className="bg-white/20 backdrop-blur-sm px-3 py-1 rounded-lg text-center min-w-[50px]">
                                            <div className="text-white text-xl font-bold">
                                                {String(timeLeft.hours).padStart(2, '0')}
                                            </div>
                                            <div className="text-white/70 text-xs">ساعة</div>
                                        </div>
                                        <div className="text-white text-xl flex items-center">:</div>
                                        <div className="bg-white/20 backdrop-blur-sm px-3 py-1 rounded-lg text-center min-w-[50px]">
                                            <div className="text-white text-xl font-bold">
                                                {String(timeLeft.minutes).padStart(2, '0')}
                                            </div>
                                            <div className="text-white/70 text-xs">دقيقة</div>
                                        </div>
                                        <div className="text-white text-xl flex items-center">:</div>
                                        <div className="bg-white/20 backdrop-blur-sm px-3 py-1 rounded-lg text-center min-w-[50px]">
                                            <div className="text-white text-xl font-bold">
                                                {String(timeLeft.seconds).padStart(2, '0')}
                                            </div>
                                            <div className="text-white/70 text-xs">ثانية</div>
                                        </div>
                                    </div>
                                </div>

                                {/* Hero Product */}
                                <div className="flex items-center gap-4">
                                    <img
                                        src={flashDeal.image}
                                        alt={flashDeal.name}
                                        className="w-24 h-24 object-contain bg-white/10 rounded-xl p-2"
                                        onError={(e) => {
                                            (e.target as HTMLImageElement).src = 'https://placehold.co/200x200?text=Product';
                                        }}
                                    />
                                    <div className="flex-1">
                                        <h3 className="text-white font-bold mb-2">{flashDeal.name}</h3>
                                        <div className="flex items-center gap-2 mb-2">
                                            <span className="text-white text-2xl font-bold">
                                                {flashDeal.price} جنيه
                                            </span>
                                            <span className="text-white/60 line-through">
                                                {flashDeal.old_price}
                                            </span>
                                        </div>
                                        {/* Stock Progress */}
                                        <div className="mb-1">
                                            <div className="w-full bg-white/20 rounded-full h-2 overflow-hidden">
                                                <div
                                                    className="bg-yellow-300 h-full rounded-full transition-all"
                                                    style={{ width: `${flashDeal.sold_percentage}%` }}
                                                />
                                            </div>
                                        </div>
                                        <p className="text-white/80 text-sm">تم البيع: {flashDeal.sold_percentage}%</p>
                                    </div>
                                    <button
                                        onClick={() => handleAddToCart(flashDeal)}
                                        className="w-12 h-12 bg-white rounded-full flex items-center justify-center shadow-lg hover:scale-105 transition-transform"
                                    >
                                        <Plus className="w-6 h-6 text-[#EF4444]" />
                                    </button>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Deals Grid */}
                    <div className="px-4 mt-6">
                        <div className="grid grid-cols-2 gap-4">
                            {deals.map((deal) => (
                                <div
                                    key={deal.id}
                                    className="bg-white rounded-2xl overflow-hidden shadow-lg hover:shadow-xl transition-all relative"
                                >
                                    {/* Discount Badge */}
                                    <div className="absolute top-2 right-2 z-10">
                                        <div className="bg-[#EF4444] text-white px-3 py-1.5 rounded-full shadow-lg font-bold">
                                            -{deal.discount_percentage}%
                                        </div>
                                    </div>

                                    {/* Product Image */}
                                    <div className="bg-[#F9FAFB] p-4">
                                        <img
                                            src={deal.image}
                                            alt={deal.name}
                                            className="w-full h-32 object-contain"
                                            onError={(e) => {
                                                (e.target as HTMLImageElement).src = 'https://placehold.co/200x200?text=Product';
                                            }}
                                        />
                                    </div>

                                    {/* Product Info */}
                                    <div className="p-3">
                                        <p className="text-[#23110C] mb-2 min-h-[2.5rem] text-sm line-clamp-2 font-semibold">
                                            {deal.name}
                                        </p>
                                        
                                        <div className="mb-2">
                                            <div className="flex items-center gap-2">
                                                <span className="text-[#F97316] text-xl font-bold">
                                                    {deal.price}
                                                </span>
                                                <span className="text-[#9CA3AF] text-sm">جنيه</span>
                                            </div>
                                            <span className="text-[#9CA3AF] line-through text-sm">
                                                {deal.old_price} جنيه
                                            </span>
                                        </div>

                                        {/* Stock Bar */}
                                        <div className="mb-2">
                                            <div className="w-full bg-[#F3F4F6] rounded-full h-1.5 overflow-hidden">
                                                <div
                                                    className={`h-full rounded-full transition-all ${
                                                        deal.sold_percentage > 80 ? 'bg-[#EF4444]' : 'bg-[#F97316]'
                                                    }`}
                                                    style={{ width: `${deal.sold_percentage}%` }}
                                                />
                                            </div>
                                        </div>
                                        <p className="text-[#6B7280] text-xs mb-3">
                                            تم البيع: {deal.sold_percentage}%
                                        </p>

                                        {/* Add Button */}
                                        <button 
                                            onClick={() => handleAddToCart(deal)}
                                            className="w-full py-2 bg-[#F97316] text-white rounded-full flex items-center justify-center gap-2 shadow-md hover:bg-[#ea580c] transition-all active:scale-95"
                                        >
                                            <Plus className="w-4 h-4" />
                                            <span className="font-semibold">أضف للسلة</span>
                                        </button>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Empty State */}
                    {deals.length === 0 && !flashDeal && !loading && (
                        <div className="text-center py-20">
                            <Flame className="w-16 h-16 text-[#E5E7EB] mx-auto mb-4" />
                            <p className="text-[#6B7280]">لا توجد عروض ساخنة حالياً</p>
                            <p className="text-[#9CA3AF] text-sm mt-2">تابعنا للحصول على أحدث العروض</p>
                        </div>
                    )}
                </>
            )}
        </div>
    );
};

export default HotDealsPage;
