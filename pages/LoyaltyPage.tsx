import React, { useState, useEffect } from 'react';
import { Gift, ChevronLeft, TrendingUp, CheckCircle, Ticket } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { api } from '../services/api';
import Footer from '../components/Footer';

interface LoyaltyTransaction {
    id: number;
    points: number;
    type: 'earned' | 'redeemed';
    description: string;
    orderId?: number;
    created_at: string;
}

const LoyaltyPage = () => {
    const navigate = useNavigate();
    const { user, isAuthenticated } = useAuth();
    const [points, setPoints] = useState(0);
    const [transactions, setTransactions] = useState<LoyaltyTransaction[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (!isAuthenticated) {
            navigate('/login');
            return;
        }
        fetchLoyaltyData();
    }, [isAuthenticated]);

    const fetchLoyaltyData = async () => {
        try {
            setLoading(true);
            // Fetch user loyalty points
            const userData = await api.users.getProfile();
            setPoints(userData.loyalty_points || 0);

            // Fetch transactions history
            const txData = await api.loyalty.getTransactions(user?.id);
            setTransactions(txData.data || []);
        } catch (error) {
            console.error('Error fetching loyalty data:', error);
        } finally {
            setLoading(false);
        }
    };

    // New loyalty system: 1000 points = 35 EGP coupon
    const POINTS_PER_COUPON = 1000;
    const COUPON_VALUE = 35;
    
    const getAvailableCoupons = () => {
        return Math.floor(points / POINTS_PER_COUPON);
    };
    
    const getTotalCouponValue = () => {
        return getAvailableCoupons() * COUPON_VALUE;
    };

    const getPointsValue = () => {
        // 1 point = 1 EGP
        return points;
    };

    if (loading) {
        return (
            <div className="min-h-screen bg-gray-50 flex items-center justify-center">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-50 pb-24 md:pb-8">
            {/* Header */}
            <div className="bg-white p-4 sticky top-0 z-40 shadow-sm flex items-center relative md:hidden">
                <button onClick={() => navigate(-1)} className="p-2 -ml-2 text-primary absolute left-4">
                    <ChevronLeft size={28} />
                </button>
                <h1 className="text-xl font-bold text-gray-900 w-full text-center">نقاط الولاء</h1>
            </div>

            <div className="max-w-7xl mx-auto md:p-6">
                <div className="hidden md:flex items-center justify-between mb-6">
                    <h1 className="text-3xl font-bold text-gray-900">نقاط الولاء</h1>
                </div>

            <div className="p-4 md:p-0">
                {/* Enhanced Points Card */}
                <div className="bg-gradient-to-br from-orange-500 to-orange-600 rounded-2xl p-6 shadow-lg mb-4 text-white">
                    <div className="text-center">
                        <p className="text-white/90 text-sm mb-2">رصيدك الحالي</p>
                        <h2 className="text-6xl font-black mb-4">{points.toLocaleString()}</h2>
                        <p className="text-white/90 text-lg mb-4">نقطة ولاء</p>
                        
                        {/* Quick Action: Convert to Barcode */}
                        <button
                            onClick={() => navigate('/loyalty-barcode')}
                            className="w-full bg-white text-orange-600 py-3 rounded-xl font-bold flex items-center justify-center gap-2 hover:bg-orange-50 transition-all shadow-lg mb-4"
                        >
                            <Ticket size={20} />
                            حوّل نقاطك لكوبون باركود
                        </button>
                        
                        {/* Value Display */}
                        <div className="bg-white/20 backdrop-blur rounded-xl p-4">
                            <p className="text-white/90 text-sm mb-2">القيمة الإجمالية</p>
                            <div className="text-3xl font-bold">{points.toLocaleString()}</div>
                            <p className="text-white/90 text-sm">جنيه مصري</p>
                            <p className="text-white/80 text-xs mt-2">1 نقطة = 1 جنيه</p>
                        </div>
                    </div>
                </div>

                {/* How it works */}
                <div className="bg-white rounded-xl p-5 shadow-sm border mb-4">
                    <h3 className="font-bold text-lg mb-4 text-gray-900">كيف يعمل نظام النقاط؟</h3>
                    <div className="space-y-4 text-sm">
                        <div className="flex items-start gap-3 p-3 bg-green-50 rounded-lg">
                            <CheckCircle size={20} className="text-green-600 mt-0.5 flex-shrink-0" />
                            <div>
                                <p className="font-bold text-green-900 mb-1">اجمع النقاط</p>
                                <p className="text-gray-700">كل 1 جنيه تنفقه = 1 نقطة ولاء</p>
                            </div>
                        </div>
                        <div className="flex items-start gap-3 p-3 bg-orange-50 rounded-lg">
                            <Gift size={20} className="text-orange-600 mt-0.5 flex-shrink-0" />
                            <div>
                                <p className="font-bold text-orange-900 mb-1">
                                    استبدل النقاط بكوبون باركود
                                </p>
                                <p className="text-gray-700">كل 1 نقطة = 1 جنيه خصم (الحد الأدنى 50 نقطة)</p>
                                <p className="text-gray-700 text-xs mt-1">الكوبون يستخدم مرة واحدة ويمكن مشاركته مع أي شخص</p>
                            </div>
                        </div>
                        <div className="flex items-start gap-3 p-3 bg-blue-50 rounded-lg">
                            <TrendingUp size={20} className="text-blue-600 mt-0.5 flex-shrink-0" />
                            <div>
                                <p className="font-bold text-blue-900 mb-1">نقاطك لا تنتهي</p>
                                <p className="text-gray-700">نقاطك معك دائماً ولا تنتهي صلاحيتها</p>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Transactions History */}
                <div className="bg-white rounded-xl shadow-sm border overflow-hidden">
                    <div className="p-4 border-b bg-gray-50">
                        <h3 className="font-bold text-lg text-gray-900">سجل النقاط</h3>
                    </div>
                    
                    {transactions.length === 0 ? (
                        <div className="p-8 text-center">
                            <Gift size={40} className="text-gray-300 mx-auto mb-3" />
                            <p className="text-gray-600 mb-1">لا توجد معاملات حتى الآن</p>
                            <p className="text-sm text-gray-400 mb-4">ابدأ التسوق لكسب النقاط!</p>
                            <button
                                onClick={() => navigate('/')}
                                className="px-5 py-2 bg-brand-orange text-white rounded-lg font-medium hover:bg-orange-600 transition-colors"
                            >
                                ابدأ التسوق
                            </button>
                        </div>
                    ) : (
                        <div className="divide-y">
                            {transactions.map((tx) => (
                                <div key={tx.id} className="p-4 hover:bg-gray-50 transition-colors">
                                    <div className="flex items-center justify-between">
                                        <div className="flex items-center gap-3">
                                            <div className={`w-9 h-9 rounded-lg flex items-center justify-center ${
                                                tx.type === 'earned' ? 'bg-green-50' : 'bg-red-50'
                                            }`}>
                                                {tx.type === 'earned' ? (
                                                    <TrendingUp size={18} className="text-green-600" />
                                                ) : (
                                                    <Gift size={18} className="text-red-600" />
                                                )}
                                            </div>
                                            <div>
                                                <p className="font-medium text-gray-900 text-sm">{tx.description}</p>
                                                <p className="text-xs text-gray-500">
                                                    {new Date(tx.created_at).toLocaleDateString('ar-EG', {
                                                        year: 'numeric',
                                                        month: 'long',
                                                        day: 'numeric'
                                                    })}
                                                </p>
                                            </div>
                                        </div>
                                        <div className={`text-base font-bold ${
                                            tx.type === 'earned' ? 'text-green-600' : 'text-red-600'
                                        }`}>
                                            {tx.type === 'earned' ? '+' : '-'}{tx.points}
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </div>
            </div>
            <Footer />
        </div>
    );
};

export default LoyaltyPage;
