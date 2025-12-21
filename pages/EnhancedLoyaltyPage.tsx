import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
    ArrowLeft, Coins, Gift, TrendingUp, History, 
    Wallet, CreditCard, Award, Sparkles, ArrowRight,
    Check, X, Info
} from 'lucide-react';
import TopBar from '../components/TopBar';
import { api } from '../services/api';
import { useAuth } from '../context/AuthContext';

interface LoyaltyTransaction {
    id: number;
    points: number;
    type: string;
    description: string;
    created_at: string;
}

const EnhancedLoyaltyPage = () => {
    const { user } = useAuth();
    const [loading, setLoading] = useState(true);
    const [loyaltyData, setLoyaltyData] = useState<any>(null);
    const [transactions, setTransactions] = useState<LoyaltyTransaction[]>([]);
    const [config, setConfig] = useState<any>(null);
    const [convertPoints, setConvertPoints] = useState('');
    const [showConvertModal, setShowConvertModal] = useState(false);
    const [converting, setConverting] = useState(false);

    useEffect(() => {
        loadLoyaltyData();
        loadConfig();
    }, []);

    const loadLoyaltyData = async () => {
        try {
            setLoading(true);
            const [balanceRes, transactionsRes] = await Promise.all([
                api.get('/loyalty-enhanced/balance'),
                api.get('/loyalty-enhanced/transactions')
            ]);

            setLoyaltyData(balanceRes.data);
            setTransactions(transactionsRes.data || []);
        } catch (error) {
            console.error('Error loading loyalty data:', error);
        } finally {
            setLoading(false);
        }
    };

    const loadConfig = async () => {
        try {
            const res = await api.get('/loyalty-enhanced/config');
            setConfig(res.data);
        } catch (error) {
            console.error('Error loading config:', error);
        }
    };

    const handleConvert = async () => {
        const points = parseInt(convertPoints);
        if (!points || points <= 0) {
            alert('الرجاء إدخال عدد صحيح من النقاط');
            return;
        }

        if (points > (loyaltyData?.points || 0)) {
            alert('لا تملك نقاط كافية');
            return;
        }

        setConverting(true);
        try {
            const res = await api.post('/loyalty-enhanced/convert', { points });
            alert(`تم تحويل ${points} نقطة إلى ${res.data.amountAdded} جنيه في محفظتك!`);
            setShowConvertModal(false);
            setConvertPoints('');
            loadLoyaltyData();
        } catch (error: any) {
            alert(error.response?.data?.error || 'فشل التحويل');
        } finally {
            setConverting(false);
        }
    };

    const getTransactionIcon = (type: string) => {
        switch (type) {
            case 'earned': return <TrendingUp className="text-green-500" />;
            case 'redeemed': return <Gift className="text-orange-500" />;
            case 'converted': return <Wallet className="text-blue-500" />;
            case 'manual_adjustment': return <Award className="text-purple-500" />;
            default: return <Coins className="text-gray-500" />;
        }
    };

    const getTransactionColor = (type: string) => {
        switch (type) {
            case 'earned': return 'text-green-600';
            case 'redeemed': return 'text-orange-600';
            case 'converted': return 'text-blue-600';
            case 'manual_adjustment': return 'text-purple-600';
            default: return 'text-gray-600';
        }
    };

    if (loading) {
        return (
            <div className="min-h-screen bg-gray-50 flex items-center justify-center">
                <div className="text-center">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-500 mx-auto mb-4"></div>
                    <p className="text-gray-600">جاري التحميل...</p>
                </div>
            </div>
        );
    }

    const conversionRate = config?.conversionRate || 35;
    const borderFee = config?.borderFee || 7;
    const freeShippingThreshold = config?.freeShippingThreshold || 600;
    const minimumOrder = config?.minimumOrder || 200;

    return (
        <div className="min-h-screen bg-gray-50 pb-20">
            <TopBar title="نقاط الولاء" showBack />

            {/* Points Balance Card */}
            <div className="p-4">
                <div className="bg-gradient-to-br from-orange-500 to-orange-600 rounded-2xl p-6 text-white shadow-xl">
                    <div className="flex items-center justify-between mb-4">
                        <div className="flex items-center gap-2">
                            <Coins size={24} />
                            <span className="text-sm opacity-90">رصيدك من النقاط</span>
                        </div>
                        <Sparkles size={20} className="opacity-80" />
                    </div>
                    
                    <div className="mb-4">
                        <div className="text-5xl font-bold mb-2">
                            {loyaltyData?.points?.toLocaleString() || 0}
                        </div>
                        <div className="text-sm opacity-90">
                            نقطة = {loyaltyData?.value?.toLocaleString() || 0} جنيه
                        </div>
                    </div>

                    <button
                        onClick={() => setShowConvertModal(true)}
                        className="w-full bg-white text-orange-600 py-3 rounded-xl font-bold flex items-center justify-center gap-2 hover:bg-orange-50 transition"
                    >
                        <Wallet size={20} />
                        تحويل إلى المحفظة
                    </button>
                </div>
            </div>

            {/* Loyalty Rules */}
            <div className="px-4 mb-6">
                <h3 className="text-lg font-bold mb-3 flex items-center gap-2">
                    <Info size={20} className="text-orange-500" />
                    كيف تربح النقاط؟
                </h3>
                <div className="bg-white rounded-xl p-4 space-y-3">
                    <div className="flex items-start gap-3">
                        <div className="w-10 h-10 bg-green-50 rounded-full flex items-center justify-center flex-shrink-0">
                            <Check className="text-green-500" size={20} />
                        </div>
                        <div className="flex-1">
                            <div className="font-medium">اربح نقاط مع كل طلب</div>
                            <div className="text-sm text-gray-500">
                                كل {conversionRate} جنيه = نقطة واحدة
                            </div>
                        </div>
                    </div>

                    <div className="flex items-start gap-3">
                        <div className="w-10 h-10 bg-blue-50 rounded-full flex items-center justify-center flex-shrink-0">
                            <Wallet className="text-blue-500" size={20} />
                        </div>
                        <div className="flex-1">
                            <div className="font-medium">حوّل نقاطك لأموال</div>
                            <div className="text-sm text-gray-500">
                                استخدمها في طلباتك القادمة
                            </div>
                        </div>
                    </div>

                    <div className="flex items-start gap-3">
                        <div className="w-10 h-10 bg-orange-50 rounded-full flex items-center justify-center flex-shrink-0">
                            <CreditCard className="text-orange-500" size={20} />
                        </div>
                        <div className="flex-1">
                            <div className="font-medium">رسوم حدية {borderFee} جنيه</div>
                            <div className="text-sm text-gray-500">
                                تضاف على كل طلب
                            </div>
                        </div>
                    </div>

                    <div className="flex items-start gap-3">
                        <div className="w-10 h-10 bg-purple-50 rounded-full flex items-center justify-center flex-shrink-0">
                            <Gift className="text-purple-500" size={20} />
                        </div>
                        <div className="flex-1">
                            <div className="font-medium">شحن مجاني</div>
                            <div className="text-sm text-gray-500">
                                على الطلبات فوق {freeShippingThreshold} جنيه
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Transaction History */}
            <div className="px-4">
                <h3 className="text-lg font-bold mb-3 flex items-center gap-2">
                    <History size={20} className="text-orange-500" />
                    سجل المعاملات
                </h3>
                
                {transactions.length === 0 ? (
                    <div className="bg-white rounded-xl p-8 text-center">
                        <Coins size={48} className="mx-auto text-gray-300 mb-3" />
                        <p className="text-gray-500">لا توجد معاملات بعد</p>
                        <p className="text-sm text-gray-400 mt-1">
                            ابدأ التسوق لتربح نقاط!
                        </p>
                    </div>
                ) : (
                    <div className="bg-white rounded-xl overflow-hidden">
                        {transactions.map((transaction) => (
                            <div
                                key={transaction.id}
                                className="border-b last:border-b-0 p-4 hover:bg-gray-50 transition"
                            >
                                <div className="flex items-start gap-3">
                                    <div className="w-10 h-10 bg-gray-50 rounded-full flex items-center justify-center flex-shrink-0">
                                        {getTransactionIcon(transaction.type)}
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <div className="font-medium text-sm mb-1">
                                            {transaction.description}
                                        </div>
                                        <div className="text-xs text-gray-500">
                                            {new Date(transaction.created_at).toLocaleDateString('ar-EG', {
                                                year: 'numeric',
                                                month: 'long',
                                                day: 'numeric',
                                                hour: '2-digit',
                                                minute: '2-digit'
                                            })}
                                        </div>
                                    </div>
                                    <div className={`font-bold text-lg ${getTransactionColor(transaction.type)}`}>
                                        {transaction.points > 0 ? '+' : ''}{transaction.points}
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>

            {/* Convert Modal */}
            {showConvertModal && (
                <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
                    <div className="bg-white rounded-2xl max-w-md w-full p-6">
                        <div className="flex items-center justify-between mb-4">
                            <h3 className="text-xl font-bold">تحويل النقاط</h3>
                            <button
                                onClick={() => setShowConvertModal(false)}
                                className="w-8 h-8 bg-gray-100 rounded-full flex items-center justify-center"
                            >
                                <X size={20} />
                            </button>
                        </div>

                        <div className="mb-4">
                            <p className="text-gray-600 mb-2">
                                لديك <span className="font-bold text-orange-600">{loyaltyData?.points || 0}</span> نقطة
                            </p>
                            <p className="text-sm text-gray-500">
                                كل {conversionRate} جنيه = نقطة واحدة
                            </p>
                        </div>

                        <div className="mb-4">
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                عدد النقاط للتحويل
                            </label>
                            <input
                                type="number"
                                value={convertPoints}
                                onChange={(e) => setConvertPoints(e.target.value)}
                                placeholder="أدخل عدد النقاط"
                                className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                                min="1"
                                max={loyaltyData?.points || 0}
                            />
                            {convertPoints && parseInt(convertPoints) > 0 && (
                                <p className="text-sm text-green-600 mt-2">
                                    سيتم إضافة {parseInt(convertPoints) * conversionRate} جنيه لمحفظتك
                                </p>
                            )}
                        </div>

                        <div className="flex gap-3">
                            <button
                                onClick={() => setShowConvertModal(false)}
                                className="flex-1 py-3 border border-gray-300 rounded-xl font-medium hover:bg-gray-50 transition"
                            >
                                إلغاء
                            </button>
                            <button
                                onClick={handleConvert}
                                disabled={converting || !convertPoints || parseInt(convertPoints) <= 0}
                                className="flex-1 py-3 bg-orange-500 text-white rounded-xl font-bold hover:bg-orange-600 transition disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                                {converting ? 'جاري التحويل...' : 'تحويل'}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default EnhancedLoyaltyPage;
