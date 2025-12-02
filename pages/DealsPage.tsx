import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import TopBar from '../components/TopBar';
import Footer from '../components/Footer';
import { api } from '../services/api';
import { useCart } from '../context/CartContext';
import { Flame, Plus, Clock, Loader, ChevronLeft, Percent, Zap } from 'lucide-react';

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
    is_flash_deal: boolean;
}

const DealsPage = () => {
    const { addToCart } = useCart();
    const [deals, setDeals] = useState<HotDeal[]>([]);
    const [flashDeal, setFlashDeal] = useState<HotDeal | null>(null);
    const [loading, setLoading] = useState(true);
    const [timeLeft, setTimeLeft] = useState({ hours: 0, minutes: 0, seconds: 0 });

    useEffect(() => {
        loadDeals();
    }, []);

    // Countdown timer for flash deal
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

            setTimeLeft({
                hours: Math.floor(diff / (1000 * 60 * 60)),
                minutes: Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60)),
                seconds: Math.floor((diff % (1000 * 60)) / 1000)
            });
        };

        updateTimer();
        const timer = setInterval(updateTimer, 1000);
        return () => clearInterval(timer);
    }, [flashDeal]);

    const loadDeals = async () => {
        setLoading(true);
        try {
            const res = await api.hotDeals.getAll();
            if (res.data) {
                const flash = res.data.find((d: HotDeal) => d.is_flash_deal);
                const regular = res.data.filter((d: HotDeal) => !d.is_flash_deal);
                setFlashDeal(flash || null);
                setDeals(regular);
            }
        } catch (err) {
            console.error('Failed to load hot deals:', err);
        } finally {
            setLoading(false);
        }
    };

    const handleAddToCart = (deal: HotDeal) => {
        addToCart({
            id: `deal-${deal.id}`,
            name: deal.name,
            price: deal.price,
            image: deal.image,
            category: 'عروض',
            weight: ''
        } as any, 1);
    };

    return (
        <div className="bg-[#FAFAFA] min-h-screen pb-24">
            <TopBar />

            <div className="p-4 space-y-5 max-w-7xl mx-auto">
                {/* Page Header */}
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <div className="w-11 h-11 bg-gradient-to-br from-[#EF4444] to-[#dc2626] rounded-xl flex items-center justify-center shadow-lg shadow-red-200">
                            <Flame className="w-6 h-6 text-white" />
                        </div>
                        <div>
                            <h1 className="text-xl font-bold text-[#1F2937]">العروض الساخنة 🔥</h1>
                            <p className="text-sm text-[#6B7280]">عروض محدودة لا تفوتها</p>
                        </div>
                    </div>
                    <Link to="/magazine" className="text-[#F97316] text-sm font-medium flex items-center gap-1 hover:underline">
                        المجلة <ChevronLeft className="w-4 h-4" />
                    </Link>
                </div>

                {loading ? (
                    <div className="flex items-center justify-center py-20">
                        <Loader className="w-8 h-8 text-[#F97316] animate-spin" />
                    </div>
                ) : (
                    <>
                        {/* Flash Deal Hero */}
                        {flashDeal && (
                            <div className="relative bg-gradient-to-br from-[#EF4444] via-[#dc2626] to-[#b91c1c] rounded-2xl overflow-hidden shadow-xl">
                                {/* Background Pattern */}
                                <div className="absolute inset-0 opacity-10">
                                    <div className="absolute top-4 right-4 w-32 h-32 border-4 border-white rounded-full" />
                                    <div className="absolute bottom-4 left-4 w-20 h-20 border-4 border-white rounded-full" />
                                </div>

                                <div className="relative p-5">
                                    {/* Flash Badge */}
                                    <div className="flex items-center justify-between mb-4">
                                        <div className="flex items-center gap-2 bg-yellow-400 text-yellow-900 px-3 py-1.5 rounded-full font-bold text-sm shadow-lg">
                                            <Zap className="w-4 h-4" />
                                            عرض فلاش
                                        </div>

                                        {/* Countdown */}
                                        <div className="flex items-center gap-2">
                                            <Clock className="w-4 h-4 text-white/80" />
                                            <div className="flex gap-1.5">
                                                {[
                                                    { value: timeLeft.hours, label: 'س' },
                                                    { value: timeLeft.minutes, label: 'د' },
                                                    { value: timeLeft.seconds, label: 'ث' }
                                                ].map((item, i) => (
                                                    <div key={i} className="bg-white/20 backdrop-blur-sm px-2.5 py-1 rounded-lg text-center min-w-[42px]">
                                                        <span className="text-white font-bold text-lg">{String(item.value).padStart(2, '0')}</span>
                                                        <span className="text-white/70 text-xs mr-0.5">{item.label}</span>
                                                    </div>
                                                ))}
                                            </div>
                                        </div>
                                    </div>

                                    {/* Product Info */}
                                    <div className="flex items-center gap-4">
                                        <div className="w-28 h-28 bg-white/10 rounded-2xl p-2 flex-shrink-0">
                                            <img
                                                src={flashDeal.image}
                                                alt={flashDeal.name}
                                                className="w-full h-full object-contain"
                                                onError={(e) => { (e.target as HTMLImageElement).src = 'https://placehold.co/200x200?text=Product'; }}
                                            />
                                        </div>

                                        <div className="flex-1 min-w-0">
                                            <h3 className="text-white font-bold text-lg mb-1 line-clamp-2">{flashDeal.name}</h3>

                                            <div className="flex items-baseline gap-2 mb-2">
                                                <span className="text-white text-2xl font-bold">{flashDeal.price}</span>
                                                <span className="text-white/80 text-sm">جنيه</span>
                                                <span className="text-white/60 line-through text-sm">{flashDeal.old_price}</span>
                                            </div>

                                            {/* Progress Bar */}
                                            <div className="mb-1.5">
                                                <div className="w-full bg-white/20 rounded-full h-2.5 overflow-hidden">
                                                    <div
                                                        className="bg-yellow-400 h-full rounded-full transition-all duration-500"
                                                        style={{ width: `${flashDeal.sold_percentage}%` }}
                                                    />
                                                </div>
                                            </div>
                                            <p className="text-white/80 text-xs">تم البيع {flashDeal.sold_percentage}% • باقي {100 - flashDeal.sold_percentage}%</p>
                                        </div>

                                        <button
                                            onClick={() => handleAddToCart(flashDeal)}
                                            className="w-14 h-14 bg-white rounded-xl flex items-center justify-center shadow-xl hover:scale-105 transition-transform flex-shrink-0"
                                        >
                                            <Plus className="w-7 h-7 text-[#EF4444]" />
                                        </button>
                                    </div>
                                </div>
                            </div>
                        )}

                        {/* Stats Bar */}
                        <div className="grid grid-cols-3 gap-3">
                            <div className="bg-white rounded-xl p-3 text-center shadow-sm">
                                <p className="text-2xl font-bold text-[#EF4444]">{deals.length + (flashDeal ? 1 : 0)}</p>
                                <p className="text-xs text-[#6B7280]">عرض متاح</p>
                            </div>
                            <div className="bg-white rounded-xl p-3 text-center shadow-sm">
                                <p className="text-2xl font-bold text-[#F97316]">50%</p>
                                <p className="text-xs text-[#6B7280]">أقصى خصم</p>
                            </div>
                            <div className="bg-white rounded-xl p-3 text-center shadow-sm">
                                <p className="text-2xl font-bold text-[#10B981]">24h</p>
                                <p className="text-xs text-[#6B7280]">متبقي</p>
                            </div>
                        </div>

                        {/* Section Title */}
                        <div className="flex items-center gap-2">
                            <Percent className="w-5 h-5 text-[#F97316]" />
                            <h2 className="font-bold text-[#1F2937]">المزيد من العروض</h2>
                        </div>

                        {/* Deals Grid */}
                        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
                            {deals.map((deal) => (
                                <div
                                    key={deal.id}
                                    className="bg-white rounded-2xl overflow-hidden shadow-sm hover:shadow-lg transition-all group"
                                >
                                    {/* Discount Badge */}
                                    <div className="relative">
                                        <div className="absolute top-2 right-2 z-10">
                                            <div className="bg-[#EF4444] text-white px-2.5 py-1 rounded-lg text-sm font-bold shadow-lg">
                                                -{deal.discount_percentage}%
                                            </div>
                                        </div>

                                        {/* Product Image */}
                                        <div className="bg-[#F9FAFB] p-4 group-hover:bg-[#FFF7ED] transition-colors">
                                            <img
                                                src={deal.image}
                                                alt={deal.name}
                                                className="w-full h-28 object-contain group-hover:scale-105 transition-transform"
                                                onError={(e) => { (e.target as HTMLImageElement).src = 'https://placehold.co/200x200?text=Product'; }}
                                            />
                                        </div>
                                    </div>

                                    {/* Product Info */}
                                    <div className="p-3">
                                        <p className="text-[#1F2937] font-medium text-sm mb-2 line-clamp-2 min-h-[2.5rem]">
                                            {deal.name}
                                        </p>

                                        <div className="flex items-baseline gap-1.5 mb-2">
                                            <span className="text-[#F97316] text-lg font-bold">{deal.price}</span>
                                            <span className="text-[#9CA3AF] text-xs">جنيه</span>
                                            <span className="text-[#9CA3AF] line-through text-xs mr-1">{deal.old_price}</span>
                                        </div>

                                        {/* Stock Bar */}
                                        <div className="mb-2">
                                            <div className="w-full bg-[#F3F4F6] rounded-full h-1.5 overflow-hidden">
                                                <div
                                                    className={`h-full rounded-full transition-all ${deal.sold_percentage > 80 ? 'bg-[#EF4444]' : 'bg-[#F97316]'}`}
                                                    style={{ width: `${deal.sold_percentage}%` }}
                                                />
                                            </div>
                                            <p className="text-[#9CA3AF] text-xs mt-1">تم البيع {deal.sold_percentage}%</p>
                                        </div>

                                        {/* Add Button */}
                                        <button
                                            onClick={() => handleAddToCart(deal)}
                                            className="w-full py-2 bg-[#F97316] text-white rounded-xl flex items-center justify-center gap-1.5 shadow-sm hover:bg-[#ea580c] transition-all active:scale-95 text-sm font-medium"
                                        >
                                            <Plus className="w-4 h-4" />
                                            أضف للسلة
                                        </button>
                                    </div>
                                </div>
                            ))}
                        </div>

                        {/* Empty State */}
                        {deals.length === 0 && !flashDeal && (
                            <div className="text-center py-16">
                                <div className="w-20 h-20 bg-[#FEE2E2] rounded-full flex items-center justify-center mx-auto mb-4">
                                    <Flame className="w-10 h-10 text-[#EF4444]" />
                                </div>
                                <h3 className="text-lg font-bold text-[#1F2937] mb-2">لا توجد عروض حالياً</h3>
                                <p className="text-[#6B7280] text-sm">تابعنا للحصول على أحدث العروض</p>
                            </div>
                        )}
                    </>
                )}
            </div>
            <Footer />
        </div>
    );
};

export default DealsPage;
