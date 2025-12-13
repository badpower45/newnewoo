import React, { useState, useEffect } from 'react';
import { Gift, ChevronLeft, TrendingUp, Award, Clock, CheckCircle } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { api } from '../services/api';

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
        <div className="min-h-screen bg-gray-50 pb-24">
            {/* Header */}
            <div className="bg-gradient-to-br from-amber-500 to-orange-600 text-white p-6 pt-12">
                <button 
                    onClick={() => navigate(-1)} 
                    className="mb-4 p-2 -ml-2 hover:bg-white/10 rounded-xl transition-colors"
                >
                    <ChevronLeft size={24} />
                </button>
                
                <div className="flex items-center gap-3 mb-6">
                    <div className="w-16 h-16 bg-white/20 rounded-2xl flex items-center justify-center">
                        <Gift size={32} />
                    </div>
                    <div>
                        <h1 className="text-2xl font-bold">نقاط الولاء</h1>
                        <p className="text-white/80">اجمع نقاط مع كل طلب</p>
                    </div>
                </div>

                {/* Points Card */}
                <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-6 border border-white/20">
                    <div className="flex items-center justify-between mb-4">
                        <div>
                            <p className="text-white/80 text-sm mb-1">رصيدك الحالي</p>
                            <h2 className="text-4xl font-bold">{points.toLocaleString()}</h2>
                            <p className="text-white/90 text-sm mt-1">نقطة</p>
                        </div>
                        <div className="text-right">
                            <p className="text-white/80 text-sm mb-1">قيمة النقاط</p>
                            <p className="text-2xl font-bold">{getPointsValue().toLocaleString()}</p>
                            <p className="text-white/90 text-sm">جنيه</p>
                        </div>
                    </div>
                    <div className="flex items-center gap-2 text-white/90 text-sm">
                        <TrendingUp size={16} />
                        <span>نقطة واحدة = جنيه واحد</span>
                    </div>
                </div>
            </div>

            {/* How it works */}
            <div className="p-6">
                <div className="bg-white rounded-2xl p-6 shadow-sm mb-6">
                    <h3 className="font-bold text-lg mb-4 flex items-center gap-2">
                        <Award className="text-amber-500" size={20} />
                        كيف تعمل النقاط؟
                    </h3>
                    <div className="space-y-3">
                        <div className="flex items-start gap-3">
                            <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center flex-shrink-0">
                                <CheckCircle size={16} className="text-green-600" />
                            </div>
                            <div>
                                <p className="font-semibold text-gray-900">اطلب واكسب</p>
                                <p className="text-sm text-gray-600">كل طلب يتم توصيله بنجاح يضيف نقاط بقيمة إجمالي الطلب</p>
                            </div>
                        </div>
                        <div className="flex items-start gap-3">
                            <div className="w-8 h-8 bg-amber-100 rounded-full flex items-center justify-center flex-shrink-0">
                                <Gift size={16} className="text-amber-600" />
                            </div>
                            <div>
                                <p className="font-semibold text-gray-900">استخدم نقاطك</p>
                                <p className="text-sm text-gray-600">استخدم نقاطك للحصول على خصومات في طلباتك القادمة</p>
                            </div>
                        </div>
                        <div className="flex items-start gap-3">
                            <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center flex-shrink-0">
                                <TrendingUp size={16} className="text-blue-600" />
                            </div>
                            <div>
                                <p className="font-semibold text-gray-900">لا تنتهي صلاحيتها</p>
                                <p className="text-sm text-gray-600">نقاطك معك دائماً ولا تنتهي صلاحيتها</p>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Transactions History */}
                <div className="bg-white rounded-2xl shadow-sm overflow-hidden">
                    <div className="p-6 border-b">
                        <h3 className="font-bold text-lg flex items-center gap-2">
                            <Clock size={20} className="text-gray-500" />
                            سجل النقاط
                        </h3>
                    </div>
                    
                    {transactions.length === 0 ? (
                        <div className="p-8 text-center">
                            <Gift size={48} className="text-gray-300 mx-auto mb-3" />
                            <p className="text-gray-500">لا توجد معاملات حتى الآن</p>
                            <p className="text-sm text-gray-400 mt-1">ابدأ التسوق لكسب النقاط!</p>
                            <button
                                onClick={() => navigate('/')}
                                className="mt-4 px-6 py-2 bg-primary text-white rounded-xl font-semibold hover:bg-primary-dark transition-colors"
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
                                            <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
                                                tx.type === 'earned' ? 'bg-green-100' : 'bg-red-100'
                                            }`}>
                                                {tx.type === 'earned' ? (
                                                    <TrendingUp size={20} className="text-green-600" />
                                                ) : (
                                                    <Gift size={20} className="text-red-600" />
                                                )}
                                            </div>
                                            <div>
                                                <p className="font-semibold text-gray-900">{tx.description}</p>
                                                <p className="text-xs text-gray-500">
                                                    {new Date(tx.created_at).toLocaleDateString('ar-EG', {
                                                        year: 'numeric',
                                                        month: 'long',
                                                        day: 'numeric'
                                                    })}
                                                </p>
                                            </div>
                                        </div>
                                        <div className={`text-lg font-bold ${
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
    );
};

export default LoyaltyPage;
