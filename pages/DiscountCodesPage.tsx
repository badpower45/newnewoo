import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowRight, Tag, Copy, CheckCircle, Clock, Percent, Gift, RefreshCw, Flame, Users } from 'lucide-react';
import { api } from '../services/api';
import Footer from '../components/Footer';

interface Coupon {
    code: string;
    description: string | null;
    discount_type: 'percentage' | 'fixed';
    discount_value: number;
    min_order_value: number;
    max_discount: number | null;
    valid_until: string | null;
    usage_limit: number | null;
    used_count: number;
}

const DiscountCodesPage = () => {
    const navigate = useNavigate();
    const [coupons, setCoupons] = useState<Coupon[]>([]);
    const [loading, setLoading] = useState(true);
    const [copiedCode, setCopiedCode] = useState<string | null>(null);

    useEffect(() => {
        loadCoupons();
    }, []);

    const loadCoupons = async () => {
        setLoading(true);
        try {
            const res = await api.coupons.getAvailable();
            setCoupons(res.data || []);
        } catch (error) {
            console.error('Error loading coupons:', error);
        }
        setLoading(false);
    };

    const handleCopy = (code: string) => {
        navigator.clipboard.writeText(code);
        setCopiedCode(code);
        setTimeout(() => setCopiedCode(null), 2000);
    };

    const getDaysRemaining = (validUntil: string | null) => {
        if (!validUntil) return null;
        const now = new Date();
        const end = new Date(validUntil);
        const diff = Math.ceil((end.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
        return diff;
    };

    const getRemaining = (coupon: Coupon) => {
        if (coupon.usage_limit === null) return null;
        return coupon.usage_limit - coupon.used_count;
    };

    return (
        <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white pb-20">
            {/* Header */}
            <div className="bg-gradient-to-r from-green-500 to-emerald-600 text-white p-6">
                <div className="flex items-center justify-between mb-4">
                    <button
                        onClick={() => navigate(-1)}
                        className="w-10 h-10 rounded-full bg-white/20 flex items-center justify-center hover:bg-white/30 transition"
                    >
                        <ArrowRight size={20} />
                    </button>
                    <h1 className="text-xl font-bold">كل أكواد الخصم</h1>
                    <div className="w-10" />
                </div>

                <div className="bg-white/10 backdrop-blur-sm rounded-xl p-3 flex items-start gap-2">
                    <Gift className="text-yellow-300 flex-shrink-0 mt-0.5" size={18} />
                    <p className="text-sm text-white/90">
                        <strong>وفّر مع أكواد الخصم!</strong> انسخ الكود واستخدمه عند إتمام الطلب للحصول على خصم فوري
                    </p>
                </div>
            </div>

            {/* Coupons List */}
            <div className="p-4">
                {loading ? (
                    <div className="text-center py-12">
                        <RefreshCw className="animate-spin text-gray-400 mx-auto mb-2" size={32} />
                        <p className="text-gray-500">جاري التحميل...</p>
                    </div>
                ) : coupons.length === 0 ? (
                    <div className="text-center py-12 bg-white rounded-2xl border border-gray-200">
                        <Tag className="text-gray-300 mx-auto mb-3" size={48} />
                        <p className="text-gray-600 font-medium mb-1">لا توجد أكواد خصم متاحة حالياً</p>
                        <p className="text-gray-400 text-sm">تابعنا لمعرفة أحدث العروض!</p>
                    </div>
                ) : (
                    <div className="space-y-3">
                        {coupons.map((coupon) => {
                            const daysRemaining = getDaysRemaining(coupon.valid_until);
                            const remaining = getRemaining(coupon);
                            const isCopied = copiedCode === coupon.code;
                            const isLowStock = remaining !== null && remaining <= 5;
                            const isExpiringSoon = daysRemaining !== null && daysRemaining <= 3;

                            return (
                                <div
                                    key={coupon.code}
                                    className="bg-white rounded-2xl border border-gray-200 overflow-hidden shadow-sm"
                                >
                                    {/* Card Header */}
                                    <div className="bg-gradient-to-r from-green-50 to-emerald-50 p-4 border-b border-dashed border-green-300">
                                        <div className="flex items-center justify-between mb-3">
                                            {/* Discount value */}
                                            <div className="flex items-center gap-2">
                                                <div className="w-10 h-10 rounded-full bg-green-100 flex items-center justify-center flex-shrink-0">
                                                    {coupon.discount_type === 'percentage' ? (
                                                        <Percent className="text-green-600" size={20} />
                                                    ) : (
                                                        <Tag className="text-green-600" size={20} />
                                                    )}
                                                </div>
                                                <div>
                                                    <p className="text-2xl font-black text-green-700 leading-tight">
                                                        {coupon.discount_type === 'percentage'
                                                            ? `${coupon.discount_value}%`
                                                            : `${coupon.discount_value} جنيه`}
                                                    </p>
                                                    <p className="text-xs text-green-600 font-medium">
                                                        {coupon.discount_type === 'percentage' ? 'خصم نسبي' : 'خصم ثابت'}
                                                    </p>
                                                </div>
                                            </div>

                                            {/* Badges — remaining + expiry */}
                                            <div className="flex flex-col items-end gap-1">
                                                {remaining !== null && (
                                                    <div className={`flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-bold ${
                                                        isLowStock
                                                            ? 'bg-red-100 text-red-700'
                                                            : 'bg-green-100 text-green-700'
                                                    }`}>
                                                        {isLowStock ? <Flame size={11} /> : <Users size={11} />}
                                                        متبقي {remaining}
                                                    </div>
                                                )}
                                                {remaining === null && (
                                                    <div className="flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-bold bg-emerald-100 text-emerald-700">
                                                        <Flame size={11} />
                                                        عرض محدود!
                                                    </div>
                                                )}
                                                {daysRemaining !== null && (
                                                    <div className={`flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-bold ${
                                                        isExpiringSoon ? 'bg-red-100 text-red-700' : 'bg-green-100 text-green-700'
                                                    }`}>
                                                        <Clock size={11} />
                                                        {daysRemaining <= 0 ? 'ينتهي اليوم' : `${daysRemaining} يوم`}
                                                    </div>
                                                )}
                                            </div>
                                        </div>

                                        {coupon.description && (
                                            <p className="text-gray-700 text-sm mb-3 leading-relaxed">{coupon.description}</p>
                                        )}
                                    </div>

                                    {/* Code + Copy */}
                                    <div className="p-4 space-y-3">
                                        <div className="flex items-center gap-2">
                                            <div className="flex-1 bg-gray-50 border-2 border-dashed border-gray-300 rounded-xl px-4 py-3 text-center">
                                                <p className="text-xs text-gray-500 mb-1">الكود</p>
                                                <p className="text-lg font-black text-gray-900 font-mono tracking-widest">
                                                    {coupon.code}
                                                </p>
                                            </div>
                                            <button
                                                onClick={() => handleCopy(coupon.code)}
                                                className={`px-4 py-3 rounded-xl font-bold flex items-center gap-2 transition min-w-[90px] justify-center ${
                                                    isCopied
                                                        ? 'bg-green-100 text-green-700 border border-green-300'
                                                        : 'bg-green-600 text-white hover:bg-green-700'
                                                }`}
                                            >
                                                {isCopied ? (
                                                    <>
                                                        <CheckCircle size={18} />
                                                        <span className="text-sm">تم!</span>
                                                    </>
                                                ) : (
                                                    <>
                                                        <Copy size={18} />
                                                        <span className="text-sm">نسخ</span>
                                                    </>
                                                )}
                                            </button>
                                        </div>

                                        {/* Conditions row */}
                                        <div className="flex flex-wrap gap-2">
                                            {coupon.min_order_value > 0 && (
                                                <span className="bg-gray-100 text-gray-600 text-xs px-3 py-1 rounded-full">
                                                    الحد الأدنى: {coupon.min_order_value} جنيه
                                                </span>
                                            )}
                                            {coupon.max_discount && coupon.discount_type === 'percentage' && (
                                                <span className="bg-gray-100 text-gray-600 text-xs px-3 py-1 rounded-full">
                                                    أقصى خصم: {coupon.max_discount} جنيه
                                                </span>
                                            )}
                                            {coupon.valid_until && (
                                                <span className={`text-xs px-3 py-1 rounded-full ${
                                                    isExpiringSoon ? 'bg-red-100 text-red-600' : 'bg-gray-100 text-gray-600'
                                                }`}>
                                                    حتى: {new Date(coupon.valid_until).toLocaleDateString('ar-EG')}
                                                </span>
                                            )}
                                        </div>
                                    </div>
                                </div>
                        );
                    })}
                    </div>
                )}
            </div>

            <Footer />
        </div>
    );
};

export default DiscountCodesPage;
