import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
    ArrowRight, Gift, Barcode, QrCode, Clock, 
    CheckCircle, XCircle, AlertTriangle, Copy,
    RefreshCw, Ticket, Award, Zap
} from 'lucide-react';
import { api } from '../services/api';
import { useAuth } from '../context/AuthContext';
import Footer from '../components/Footer';

const LoyaltyBarcodePage = () => {
    const navigate = useNavigate();
    const { user } = useAuth();
    const [barcodes, setBarcodes] = useState<any[]>([]);
    const [loading, setLoading] = useState(false);
    const [creatingBarcode, setCreatingBarcode] = useState(false);
    const [pointsToRedeem, setPointsToRedeem] = useState('1000');
    const [showCreateModal, setShowCreateModal] = useState(false);
    const [userPoints, setUserPoints] = useState(0);

    useEffect(() => {
        loadBarcodes();
        loadUserPoints();
    }, []);

    const loadUserPoints = async () => {
        try {
            const res = await api.loyalty.getPoints();
            setUserPoints(res.data?.points || 0);
        } catch (error) {
            console.error('Error loading points:', error);
        }
    };

    const loadBarcodes = async () => {
        setLoading(true);
        try {
            const res = await api.loyaltyBarcode.getMyBarcodes();
            setBarcodes(res.data || []);
        } catch (error) {
            console.error('Error loading barcodes:', error);
        }
        setLoading(false);
    };

    const handleCreateBarcode = async () => {
        const points = parseInt(pointsToRedeem);
        
        if (points < 1000) {
            alert('الحد الأدنى للاستبدال 1000 نقطة');
            return;
        }

        if (points % 1000 !== 0) {
            alert('يجب أن يكون عدد النقاط من مضاعفات 1000 (مثال: 1000، 2000، 3000)');
            return;
        }

        if (points > userPoints) {
            alert(`رصيدك الحالي ${userPoints} نقطة فقط`);
            return;
        }

        setCreatingBarcode(true);
        try {
            const result = await api.loyaltyBarcode.createRedemption(points);
            
            const monetaryValue = (points / 1000) * 35;
            alert(`✅ ${result.message}\n💰 القيمة: ${monetaryValue} جنيه\n📊 رصيدك المتبقي: ${result.remaining_points} نقطة`);
            
            setShowCreateModal(false);
            setPointsToRedeem('1000');
            
            await loadBarcodes();
            await loadUserPoints();
            
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
            await loadBarcodes();
            await loadUserPoints();
        } catch (error: any) {
            alert('❌ ' + error.message);
        }
    };

    const getStatusBadge = (status: string) => {
        const badges = {
            active: { 
                label: 'نشط', 
                color: 'bg-green-100 text-green-700',
                icon: CheckCircle
            },
            used: { 
                label: 'مستخدم', 
                color: 'bg-gray-100 text-gray-700',
                icon: CheckCircle
            },
            cancelled: { 
                label: 'ملغي', 
                color: 'bg-red-100 text-red-700',
                icon: XCircle
            },
            expired: { 
                label: 'منتهي', 
                color: 'bg-orange-100 text-orange-700',
                icon: Clock
            }
        };

        const badge = badges[status as keyof typeof badges] || badges.active;
        const Icon = badge.icon;

        return (
            <div className={`flex items-center gap-1 px-3 py-1 rounded-full ${badge.color} text-sm font-bold`}>
                <Icon size={16} />
                {badge.label}
            </div>
        );
    };

    return (
        <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white pb-20">
            {/* Header */}
            <div className="bg-gradient-to-r from-orange-500 to-orange-600 text-white p-6">
                <div className="flex items-center justify-between mb-4">
                    <button
                        onClick={() => navigate(-1)}
                        className="w-10 h-10 rounded-full bg-white/20 flex items-center justify-center hover:bg-white/30 transition"
                    >
                        <ArrowRight size={20} />
                    </button>
                    <h1 className="text-xl font-bold">باركودات الولاء</h1>
                    <div className="w-10" />
                </div>

                {/* User Points */}
                <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-4 mb-4">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                            <div className="w-12 h-12 rounded-full bg-white/20 flex items-center justify-center">
                                <Award className="text-white" size={24} />
                            </div>
                            <div>
                                <p className="text-white/80 text-sm">رصيدك الحالي</p>
                                <p className="text-2xl font-black">{userPoints.toLocaleString()} نقطة</p>
                            </div>
                        </div>
                        <button
                            onClick={() => setShowCreateModal(true)}
                            className="bg-white text-orange-600 px-4 py-2.5 rounded-xl font-bold flex items-center gap-2 hover:bg-orange-50 transition text-sm sm:text-base whitespace-nowrap min-w-fit"
                        >
                            <Gift size={18} className="flex-shrink-0" />
                            <span>استبدل الآن</span>
                        </button>
                    </div>
                </div>

                {/* Info */}
                <div className="bg-white/10 backdrop-blur-sm rounded-xl p-3 flex items-start gap-2">
                    <Zap className="text-yellow-300 flex-shrink-0 mt-0.5" size={18} />
                    <p className="text-sm text-white/90">
                        <strong>كل 1000 نقطة = 35 جنيه!</strong> حوّل نقاطك لباركود يستخدم مرة واحدة، وأعطيه لأي حد يستخدمه في الطلبات
                    </p>
                </div>
            </div>

            {/* Barcodes List */}
            <div className="p-4">
                <h2 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
                    <Ticket className="text-orange-500" />
                    باركوداتي ({barcodes.length})
                </h2>

                {loading ? (
                    <div className="text-center py-12">
                        <RefreshCw className="animate-spin text-gray-400 mx-auto mb-2" size={32} />
                        <p className="text-gray-500">جاري التحميل...</p>
                    </div>
                ) : barcodes.length === 0 ? (
                    <div className="text-center py-12 bg-white rounded-2xl border border-gray-200">
                        <QrCode className="text-gray-300 mx-auto mb-3" size={48} />
                        <p className="text-gray-600 font-medium mb-1">لا توجد باركودات حتى الآن</p>
                        <p className="text-gray-400 text-sm">ابدأ بإنشاء أول باركود!</p>
                    </div>
                ) : (
                    <div className="space-y-3">
                        {barcodes.map((barcode) => (
                            <div
                                key={barcode.id}
                                className="bg-white rounded-2xl border border-gray-200 overflow-hidden shadow-sm"
                            >
                                {/* Header */}
                                <div className="bg-gradient-to-r from-orange-50 to-orange-100 p-4 border-b border-orange-200">
                                    <div className="flex items-center justify-between mb-3">
                                        <div className="flex items-center gap-2">
                                            <Barcode className="text-orange-600" size={24} />
                                            <div>
                                                <p className="text-xs text-orange-600 font-medium">رمز الباركود</p>
                                                <p className="text-lg font-black text-gray-900 font-mono tracking-wider">
                                                    {barcode.barcode}
                                                </p>
                                            </div>
                                        </div>
                                        {getStatusBadge(barcode.status)}
                                    </div>

                                    {/* Copy Button */}
                                    <button
                                        onClick={() => handleCopyBarcode(barcode.barcode)}
                                        className="w-full bg-white border border-orange-300 text-orange-600 py-2 rounded-lg font-medium flex items-center justify-center gap-2 hover:bg-orange-50 transition"
                                    >
                                        <Copy size={16} />
                                        نسخ الباركود
                                    </button>
                                </div>

                                {/* Details */}
                                <div className="p-4 space-y-3">
                                    {/* Value */}
                                    <div className="flex items-center justify-between">
                                        <span className="text-gray-600 text-sm">القيمة</span>
                                        <div className="text-right">
                                            <p className="text-xl font-black text-orange-600">
                                                {barcode.monetary_value} جنيه
                                            </p>
                                            <p className="text-xs text-gray-500">
                                                {barcode.points_value} نقطة
                                            </p>
                                        </div>
                                    </div>

                                    {/* Expiry */}
                                    <div className="flex items-center justify-between pt-3 border-t">
                                        <span className="text-gray-600 text-sm flex items-center gap-1">
                                            <Clock size={14} />
                                            الصلاحية
                                        </span>
                                        <span className="text-gray-900 font-medium text-sm">
                                            {new Date(barcode.expires_at).toLocaleDateString('ar-EG')}
                                        </span>
                                    </div>

                                    {/* Used Info */}
                                    {barcode.status === 'used' && barcode.used_at && (
                                        <div className="bg-gray-50 rounded-lg p-3 text-sm">
                                            <p className="text-gray-600 mb-1">تم الاستخدام في:</p>
                                            <p className="text-gray-900 font-medium">
                                                {new Date(barcode.used_at).toLocaleDateString('ar-EG', {
                                                    year: 'numeric',
                                                    month: 'long',
                                                    day: 'numeric',
                                                    hour: '2-digit',
                                                    minute: '2-digit'
                                                })}
                                            </p>
                                        </div>
                                    )}

                                    {/* Cancel Button (for active only) */}
                                    {barcode.status === 'active' && (
                                        <button
                                            onClick={() => handleCancelBarcode(barcode.id)}
                                            className="w-full mt-2 py-2 border border-red-300 text-red-600 rounded-lg font-medium hover:bg-red-50 transition text-sm"
                                        >
                                            إلغاء واسترجاع النقاط
                                        </button>
                                    )}
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>

            {/* Create Modal */}
            {showCreateModal && (
                <div className="fixed inset-0 bg-black/50 z-50 flex items-end justify-center">
                    <div className="bg-white rounded-t-3xl w-full max-w-lg p-6 pb-[calc(1.5rem+env(safe-area-inset-bottom,16px))] animate-slide-up">
                        <h2 className="text-xl font-bold mb-4 text-center">إنشاء باركود جديد</h2>

                        {/* Points Input */}
                        <div className="mb-6">
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                عدد النقاط للاستبدال
                            </label>
                            <input
                                type="number"
                                value={pointsToRedeem}
                                onChange={(e) => setPointsToRedeem(e.target.value)}
                                min="1000"
                                max={userPoints}
                                step="1000"
                                className="w-full px-4 py-3 border border-gray-300 rounded-xl text-lg font-bold text-center focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
                            />
                            <div className="flex flex-col sm:flex-row items-start sm:items-center sm:justify-between mt-2 text-sm gap-1">
                                <span className="text-gray-500">الحد الأدنى: <span className="notranslate">1000</span> نقطة</span>
                                <span className="text-orange-600 font-bold">
                                    القيمة: <span className="notranslate">{(parseInt(pointsToRedeem) / 1000) * 35 || 0}</span> جنيه
                                </span>
                            </div>
                        </div>

                        {/* Info Box */}
                        <div className="bg-blue-50 border border-blue-200 rounded-xl p-4 mb-6">
                            <p className="text-sm text-blue-900 mb-2 leading-relaxed">
                                <strong>ملاحظة:</strong> الباركود يستخدم مرة واحدة فقط، ويمكن لأي شخص استخدامه. 
                                صلاحية الباركود <span className="notranslate">30</span> يوم من تاريخ الإنشاء.
                            </p>
                            <p className="text-xs text-blue-700 leading-relaxed">
                                💡 كل <span className="notranslate">1000</span> نقطة = <span className="notranslate">35</span> جنيه | يجب أن يكون العدد من مضاعفات <span className="notranslate">1000</span>
                            </p>
                        </div>

                        {/* Buttons */}
                        <div className="flex flex-col sm:flex-row gap-3">
                            <button
                                onClick={handleCreateBarcode}
                                disabled={creatingBarcode}
                                className="w-full sm:flex-1 py-4 bg-orange-500 text-white rounded-xl font-bold flex items-center justify-center gap-2 hover:bg-orange-600 transition disabled:opacity-50 text-base min-h-[52px]"
                            >
                                {creatingBarcode ? (
                                    <>
                                        <RefreshCw className="animate-spin flex-shrink-0" size={20} />
                                        <span className="whitespace-nowrap">جاري الإنشاء...</span>
                                    </>
                                ) : (
                                    <>
                                        <Gift size={20} className="flex-shrink-0" />
                                        <span className="whitespace-nowrap">إنشاء الباركود</span>
                                    </>
                                )}
                            </button>
                            <button
                                onClick={() => setShowCreateModal(false)}
                                disabled={creatingBarcode}
                                className="w-full sm:w-auto sm:px-8 py-4 bg-gray-100 text-gray-700 rounded-xl font-bold hover:bg-gray-200 transition disabled:opacity-50 text-base min-h-[52px]"
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

export default LoyaltyBarcodePage;
