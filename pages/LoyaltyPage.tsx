import React, { useState, useEffect } from 'react';
import { Gift, ChevronLeft, TrendingUp, CheckCircle, Ticket, Copy, RefreshCw, Barcode, Clock, XCircle } from 'lucide-react';
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

interface Barcode {
    id: number;
    barcode: string;
    points_value: number;
    monetary_value: number;
    status: string;
    expires_at: string;
    used_at?: string;
    created_at: string;
}

const LoyaltyPage = () => {
    const navigate = useNavigate();
    const { user, isAuthenticated } = useAuth();
    const [points, setPoints] = useState(0);
    const [transactions, setTransactions] = useState<LoyaltyTransaction[]>([]);
    const [barcodes, setBarcodes] = useState<Barcode[]>([]);
    const [loading, setLoading] = useState(true);
    const [showCreateModal, setShowCreateModal] = useState(false);
    const [pointsToRedeem, setPointsToRedeem] = useState('100');
    const [creatingBarcode, setCreatingBarcode] = useState(false);

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
            // Fetch user loyalty points from database
            const userData = await api.users.getProfile();
            setPoints(userData.loyalty_points || 0);

            // Fetch transactions history
            const txData = await api.loyalty.getTransactions(user?.id);
            setTransactions(txData.data || []);

            // Fetch user barcodes
            try {
                const barcodesData = await api.loyaltyBarcode.getMyBarcodes();
                setBarcodes(barcodesData.data || []);
            } catch (error) {
                console.log('Barcodes not loaded:', error);
            }
        } catch (error) {
            console.error('Error fetching loyalty data:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleCreateBarcode = async () => {
        const pointsValue = parseInt(pointsToRedeem);
        
        if (pointsValue < 50) {
            alert('الحد الأدنى للاستبدال 50 نقطة');
            return;
        }

        if (pointsValue > points) {
            alert(`رصيدك الحالي ${points} نقطة فقط`);
            return;
        }

        setCreatingBarcode(true);
        try {
            const result = await api.loyaltyBarcode.createRedemption(pointsValue);
            
            alert(`✅ ${result.message}\n💰 القيمة: ${pointsValue} جنيه\n📊 رصيدك المتبقي: ${result.remaining_points} نقطة`);
            
            setShowCreateModal(false);
            setPointsToRedeem('100');
            
            // Refresh data to show updated points and new barcode
            await fetchLoyaltyData();
            
        } catch (error: any) {
            alert('❌ ' + error.message);
        }
        setCreatingBarcode(false);
    };

    const handleCopyBarcode = (barcode: string) => {
        navigator.clipboard.writeText(barcode);
        alert('✅ تم نسخ الباركود');
    };

    const handleCancelBarcode = async (barcodeId: number) => {
        if (!confirm('هل أنت متأكد من إلغاء هذا الباركود؟ سيتم إرجاع النقاط إلى حسابك.')) {
            return;
        }

        try {
            const result = await api.loyaltyBarcode.cancel(barcodeId.toString());
            alert(`✅ ${result.message}`);
            await fetchLoyaltyData();
        } catch (error: any) {
            alert('❌ ' + error.message);
        }
    };

    const getStatusBadge = (status: string) => {
        const badges = {
            active: { label: 'نشط', color: 'bg-green-100 text-green-700', icon: CheckCircle },
            used: { label: 'مستخدم', color: 'bg-gray-100 text-gray-700', icon: CheckCircle },
            cancelled: { label: 'ملغي', color: 'bg-red-100 text-red-700', icon: XCircle },
            expired: { label: 'منتهي', color: 'bg-orange-100 text-orange-700', icon: Clock }
        };

        const badge = badges[status as keyof typeof badges] || badges.active;
        const Icon = badge.icon;

        return (
            <div className={`flex items-center gap-1 px-3 py-1 rounded-full ${badge.color} text-xs font-bold`}>
                <Icon size={14} />
                {badge.label}
            </div>
        );
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
                            onClick={() => setShowCreateModal(true)}
                            disabled={points < 50}
                            className="w-full bg-white text-orange-600 py-3 rounded-xl font-bold flex items-center justify-center gap-2 hover:bg-orange-50 transition-all shadow-lg mb-4 disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            <Ticket size={20} />
                            {points < 50 ? 'تحتاج 50 نقطة على الأقل' : 'حوّل نقاطك لكوبون باركود'}
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

                {/* My Barcodes Section */}
                {barcodes.length > 0 && (
                    <div className="mb-4">
                        <h2 className="text-lg font-bold text-gray-900 mb-3 flex items-center gap-2">
                            <Barcode className="text-orange-500" />
                            باركوداتي ({barcodes.length})
                        </h2>
                        <div className="space-y-3">
                            {barcodes.slice(0, 3).map((barcode) => (
                                <div
                                    key={barcode.id}
                                    className="bg-white rounded-xl border border-gray-200 overflow-hidden shadow-sm"
                                >
                                    <div className="bg-gradient-to-r from-orange-50 to-orange-100 p-4 border-b border-orange-200">
                                        <div className="flex items-center justify-between mb-2">
                                            <div className="flex items-center gap-2">
                                                <Barcode className="text-orange-600" size={20} />
                                                <p className="text-sm font-black text-gray-900 font-mono">
                                                    {barcode.barcode}
                                                </p>
                                            </div>
                                            {getStatusBadge(barcode.status)}
                                        </div>
                                        <button
                                            onClick={() => handleCopyBarcode(barcode.barcode)}
                                            className="w-full bg-white border border-orange-300 text-orange-600 py-2 rounded-lg text-sm font-medium flex items-center justify-center gap-2 hover:bg-orange-50 transition"
                                        >
                                            <Copy size={14} />
                                            نسخ الباركود
                                        </button>
                                    </div>
                                    <div className="p-3">
                                        <div className="flex items-center justify-between text-sm">
                                            <span className="text-gray-600">القيمة</span>
                                            <span className="text-orange-600 font-bold">{barcode.monetary_value} جنيه</span>
                                        </div>
                                        {barcode.status === 'active' && (
                                            <button
                                                onClick={() => handleCancelBarcode(barcode.id)}
                                                className="w-full mt-2 py-1.5 border border-red-300 text-red-600 rounded-lg text-xs hover:bg-red-50 transition"
                                            >
                                                إلغاء واسترجاع النقاط
                                            </button>
                                        )}
                                    </div>
                                </div>
                            ))}
                        </div>
                        {barcodes.length > 3 && (
                            <button
                                onClick={() => navigate('/loyalty-barcode')}
                                className="w-full mt-3 py-2 text-orange-600 font-medium text-sm hover:underline"
                            >
                                عرض جميع الباركودات ({barcodes.length})
                            </button>
                        )}
                    </div>
                )}

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

            {/* Create Barcode Modal */}
            {showCreateModal && (
                <div className="fixed inset-0 bg-black/50 z-50 flex items-end justify-center md:items-center">
                    <div className="bg-white rounded-t-3xl md:rounded-2xl w-full max-w-lg p-6 animate-slide-up">
                        <h2 className="text-xl font-bold mb-4 text-center">إنشاء كوبون باركود</h2>

                        {/* Points Input */}
                        <div className="mb-6">
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                عدد النقاط للاستبدال
                            </label>
                            <input
                                type="number"
                                value={pointsToRedeem}
                                onChange={(e) => setPointsToRedeem(e.target.value)}
                                min="50"
                                max={points}
                                step="10"
                                className="w-full px-4 py-3 border border-gray-300 rounded-xl text-lg font-bold text-center focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
                            />
                            <div className="flex items-center justify-between mt-2 text-sm">
                                <span className="text-gray-500">الحد الأدنى: 50 نقطة</span>
                                <span className="text-orange-600 font-bold">
                                    = {pointsToRedeem} جنيه خصم
                                </span>
                            </div>
                            <div className="mt-1 text-xs text-gray-500 text-center">
                                رصيدك الحالي: {points} نقطة
                            </div>
                        </div>

                        {/* Info Box */}
                        <div className="bg-blue-50 border border-blue-200 rounded-xl p-4 mb-6">
                            <p className="text-sm text-blue-900">
                                <strong>ملاحظة:</strong> سيتم خصم {pointsToRedeem} نقطة من رصيدك فوراً. 
                                الباركود يستخدم مرة واحدة فقط ويمكن لأي شخص استخدامه. صلاحيته 30 يوم.
                            </p>
                        </div>

                        {/* Buttons */}
                        <div className="flex gap-3">
                            <button
                                onClick={handleCreateBarcode}
                                disabled={creatingBarcode}
                                className="flex-1 py-4 bg-orange-500 text-white rounded-xl font-bold flex items-center justify-center gap-2 hover:bg-orange-600 transition disabled:opacity-50"
                            >
                                {creatingBarcode ? (
                                    <>
                                        <RefreshCw className="animate-spin" size={20} />
                                        جاري الإنشاء...
                                    </>
                                ) : (
                                    <>
                                        <Gift size={20} />
                                        إنشاء الكوبون
                                    </>
                                )}
                            </button>
                            <button
                                onClick={() => setShowCreateModal(false)}
                                disabled={creatingBarcode}
                                className="px-6 py-4 bg-gray-100 text-gray-700 rounded-xl font-bold hover:bg-gray-200 transition disabled:opacity-50"
                            >
                                إلغاء
                            </button>
                        </div>
                    </div>
                </div>
            )}

            <Footer />
        </div>
    );
};

export default LoyaltyPage;
