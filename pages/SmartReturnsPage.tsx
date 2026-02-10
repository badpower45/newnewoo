import React, { useState } from 'react';
import { PackageSearch, RefreshCcw, ClipboardList, ShieldCheck, AlertCircle, Minus, Plus, XCircle } from 'lucide-react';
import { api } from '../services/api';
import { useAuth } from '../context/AuthContext';
import SmartBackButton from '../components/SmartBackButton';

interface OrderItem {
    id?: number;
    productId?: number;
    product_id?: number;
    name?: string;
    quantity: number;
    price?: number;
    return_quantity?: number;
}

interface TrackedOrder {
    id: number;
    order_code: string;
    status: string;
    total: number;
    date?: string;
    payment_method?: string;
    items: OrderItem[];
}

const SmartReturnsPage: React.FC = () => {
    const [orderCode, setOrderCode] = useState('');
    const [order, setOrder] = useState<TrackedOrder | null>(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [returnMessage, setReturnMessage] = useState('');
    const [returnLoading, setReturnLoading] = useState(false);
    const [returnItems, setReturnItems] = useState<OrderItem[]>([]);
    const [returnReason, setReturnReason] = useState('');
    const [step, setStep] = useState<'search' | 'select' | 'confirm'>('search');
    const { isAuthenticated } = useAuth();

    const handleSearch = async (e?: React.FormEvent) => {
        e?.preventDefault();
        setLoading(true);
        setError('');
        setReturnMessage('');
        try {
            const res = await api.orders.getByCode(orderCode.trim());
            const data = res.data || res;
            const orderData = data as TrackedOrder;
            setOrder(orderData);

            if (orderData.status === 'delivered') {
                // Initialize return items with 0 return quantity
                const items = (orderData.items || []).map((item: OrderItem) => ({
                    ...item,
                    return_quantity: 0
                }));
                setReturnItems(items);
                setStep('select');
            }
        } catch (err: any) {
            setOrder(null);
            setError(err?.response?.data?.message || err?.response?.data?.error || err?.message || 'حدث خطأ في البحث عن الطلب');
        } finally {
            setLoading(false);
        }
    };

    const updateReturnQty = (index: number, delta: number) => {
        setReturnItems(prev => prev.map((item, i) => {
            if (i !== index) return item;
            const newQty = Math.max(0, Math.min((item.return_quantity || 0) + delta, item.quantity));
            return { ...item, return_quantity: newQty };
        }));
    };

    const calculateRefund = () => {
        return returnItems.reduce((sum, item) => sum + ((item.price || 0) * (item.return_quantity || 0)), 0);
    };

    const totalReturnItems = returnItems.filter(i => (i.return_quantity || 0) > 0).length;

    const handleCreateReturn = async () => {
        if (!order) return;
        if (!isAuthenticated) {
            setError('يجب تسجيل الدخول لإرسال طلب مرتجع');
            return;
        }
        if (totalReturnItems === 0) {
            setError('اختر منتج واحد على الأقل للمرتجع');
            return;
        }
        if (!returnReason) {
            setError('اختر سبب المرتجع');
            return;
        }

        setReturnLoading(true);
        setError('');
        setReturnMessage('');
        try {
            const itemsToReturn = returnItems
                .filter(i => (i.return_quantity || 0) > 0)
                .map(item => ({
                    product_id: item.product_id || item.productId || item.id,
                    quantity: item.return_quantity,
                    name: item.name,
                    price: item.price
                }));

            const res = await api.returns.create({
                order_code: order.order_code,
                items: itemsToReturn,
                return_reason: returnReason,
                return_notes: `طلب مرتجع من العميل — ${order.order_code}`,
                refund_amount: calculateRefund()
            });
            const data: any = res.data || res;
            const returnCode = data.return_code || data?.data?.return_code;
            setReturnMessage(`✅ تم تسجيل طلب المرتجع برقم ${returnCode || 'جديد'}\n💰 مبلغ الاسترجاع: ${calculateRefund()} جنيه`);
            setStep('search');
            setOrder(null);
            setReturnItems([]);
            setReturnReason('');
        } catch (err: any) {
            const errMsg = err?.message || 'تعذر إنشاء طلب المرتجع';
            setError(errMsg);
        } finally {
            setReturnLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-gray-50 pb-12">
            <div className="max-w-2xl mx-auto px-4 pt-6">
                <div className="flex items-center justify-between mb-6">
                    <div>
                        <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
                            <PackageSearch className="text-emerald-600" />
                            شاشة المرتجعات الذكية
                        </h1>
                        <p className="text-gray-600 text-sm mt-1">ابحث برقم الطلب واختر المنتجات المراد إرجاعها.</p>
                    </div>
                    <SmartBackButton />
                </div>

                {/* Step 1: Search */}
                <form onSubmit={handleSearch} className="bg-white p-4 rounded-2xl shadow-sm border border-gray-100">
                    <label className="block text-sm font-medium text-gray-700 mb-2">كود الأوردر</label>
                    <div className="flex gap-3 flex-col sm:flex-row">
                        <input
                            value={orderCode}
                            onChange={(e) => setOrderCode(e.target.value)}
                            placeholder="ORD-XXXXXX"
                            className="flex-1 border border-gray-200 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                        />
                        <button
                            type="submit"
                            disabled={!orderCode || loading}
                            className="px-5 py-3 bg-emerald-600 text-white rounded-xl font-semibold hover:bg-emerald-700 transition disabled:opacity-60"
                        >
                            {loading ? 'جاري البحث...' : 'بحث'}
                        </button>
                    </div>
                </form>

                {error && (
                    <div className="mt-3 bg-red-50 border border-red-200 rounded-xl px-4 py-3 text-sm text-red-700 flex items-center gap-2">
                        <AlertCircle size={16} />
                        {error}
                    </div>
                )}

                {returnMessage && (
                    <div className="mt-4 flex items-center gap-2 text-emerald-700 text-sm bg-emerald-50 border border-emerald-100 rounded-xl px-4 py-3">
                        <ShieldCheck size={16} />
                        <span className="whitespace-pre-line">{returnMessage}</span>
                    </div>
                )}

                {/* Order found but not delivered */}
                {order && order.status !== 'delivered' && (
                    <div className="bg-yellow-50 border border-yellow-200 rounded-2xl p-4 mt-4">
                        <p className="text-yellow-800 font-semibold">⚠️ لا يمكن إرجاع هذا الطلب</p>
                        <p className="text-yellow-700 text-sm mt-1">يجب أن يكون الطلب مُسَلَّم أولاً. حالة الطلب: <strong>{order.status}</strong></p>
                    </div>
                )}

                {/* Step 2: Select items to return */}
                {step === 'select' && order && order.status === 'delivered' && (
                    <div className="bg-white p-4 mt-4 rounded-2xl shadow-sm border border-gray-100">
                        <div className="flex items-center justify-between mb-4">
                            <div>
                                <p className="text-sm text-gray-500">رقم الطلب</p>
                                <p className="text-lg font-bold">{order.order_code}</p>
                            </div>
                            <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold bg-emerald-50 text-emerald-700 border border-emerald-100">
                                مُسلَّم ✓
                            </span>
                        </div>

                        <div className="mb-3">
                            <p className="font-semibold text-gray-800 mb-1">القيمة الإجمالية: {order.total} جنيه</p>
                        </div>

                        <h3 className="font-bold text-gray-900 mb-3 text-sm">اختر المنتجات وكمية الإرجاع:</h3>
                        <div className="space-y-3">
                            {returnItems.map((item, idx) => (
                                <div key={idx} className="border border-gray-100 rounded-xl p-3">
                                    <div className="flex items-center justify-between">
                                        <div className="flex-1">
                                            <p className="font-semibold text-gray-900">{item.name || 'منتج'}</p>
                                            <p className="text-xs text-gray-500">الكمية الأصلية: {item.quantity} | السعر: {item.price || 0} جنيه</p>
                                        </div>
                                        <div className="flex items-center gap-2">
                                            <button
                                                type="button"
                                                onClick={() => updateReturnQty(idx, -1)}
                                                disabled={(item.return_quantity || 0) <= 0}
                                                className="w-8 h-8 bg-gray-200 rounded-lg flex items-center justify-center hover:bg-gray-300 disabled:opacity-40"
                                            >
                                                <Minus size={14} />
                                            </button>
                                            <span className="w-8 text-center font-bold text-orange-600">{item.return_quantity || 0}</span>
                                            <button
                                                type="button"
                                                onClick={() => updateReturnQty(idx, 1)}
                                                disabled={(item.return_quantity || 0) >= item.quantity}
                                                className="w-8 h-8 bg-gray-200 rounded-lg flex items-center justify-center hover:bg-gray-300 disabled:opacity-40"
                                            >
                                                <Plus size={14} />
                                            </button>
                                        </div>
                                    </div>
                                    {(item.return_quantity || 0) > 0 && (
                                        <p className="text-xs text-orange-600 font-semibold mt-1">
                                            مبلغ الاسترجاع: {((item.price || 0) * (item.return_quantity || 0)).toFixed(2)} جنيه
                                        </p>
                                    )}
                                </div>
                            ))}
                        </div>

                        {totalReturnItems > 0 && (
                            <div className="bg-orange-50 border border-orange-200 rounded-xl p-3 mt-4">
                                <p className="font-bold text-orange-900">
                                    إجمالي الاسترجاع: {calculateRefund().toFixed(2)} جنيه ({totalReturnItems} منتج)
                                </p>
                                <p className="text-xs text-orange-700 mt-1">
                                    ⚠️ سيتم خصم {Math.floor(calculateRefund())} نقطة ولاء من حسابك
                                </p>
                            </div>
                        )}

                        <button
                            type="button"
                            onClick={() => { setError(''); setStep('confirm'); }}
                            disabled={totalReturnItems === 0}
                            className="w-full mt-4 px-5 py-3 bg-orange-600 text-white rounded-xl font-semibold hover:bg-orange-700 transition disabled:opacity-50"
                        >
                            التالي — تأكيد المرتجع
                        </button>
                    </div>
                )}

                {/* Step 3: Confirm */}
                {step === 'confirm' && order && (
                    <div className="bg-white p-4 mt-4 rounded-2xl shadow-sm border border-gray-100">
                        <h3 className="font-bold text-gray-900 mb-4">تأكيد طلب المرتجع</h3>
                        
                        <div className="bg-yellow-50 border border-yellow-200 rounded-xl p-3 mb-4">
                            <p className="text-sm text-yellow-800 font-semibold">⚠️ تنبيه مهم</p>
                            <ul className="text-xs text-yellow-700 mt-1 list-disc list-inside space-y-1">
                                <li>سيتم خصم <strong>{Math.floor(calculateRefund())} نقطة ولاء</strong> من حسابك</li>
                                <li>إذا لم يكن لديك نقاط كافية، لن يتم عمل المرتجع</li>
                                <li>المبلغ المسترجع: <strong>{calculateRefund().toFixed(2)} جنيه</strong></li>
                            </ul>
                        </div>

                        <div className="mb-4">
                            <label className="block text-sm font-semibold text-gray-700 mb-2">سبب المرتجع *</label>
                            <select
                                value={returnReason}
                                onChange={(e) => setReturnReason(e.target.value)}
                                className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-orange-500"
                            >
                                <option value="">اختر السبب</option>
                                <option value="منتج تالف">منتج تالف</option>
                                <option value="منتج خاطئ">منتج خاطئ</option>
                                <option value="منتج منتهي الصلاحية">منتج منتهي الصلاحية</option>
                                <option value="غير مطابق للمواصفات">غير مطابق للمواصفات</option>
                                <option value="العميل غير راض">العميل غير راض</option>
                                <option value="أخرى">أخرى</option>
                            </select>
                        </div>

                        <div className="flex gap-3">
                            <button
                                onClick={handleCreateReturn}
                                disabled={returnLoading || !returnReason}
                                className="flex-1 inline-flex items-center justify-center gap-2 px-4 py-3 rounded-xl bg-orange-600 text-white font-semibold hover:bg-orange-700 disabled:opacity-60"
                            >
                                <RefreshCcw size={18} />
                                {returnLoading ? 'جاري الإرسال...' : 'تأكيد المرتجع'}
                            </button>
                            <button
                                onClick={() => setStep('select')}
                                className="flex-1 px-4 py-3 rounded-xl bg-gray-200 text-gray-700 font-semibold hover:bg-gray-300"
                            >
                                رجوع
                            </button>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default SmartReturnsPage;
