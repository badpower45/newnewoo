import React, { useState } from 'react';
import { PackageSearch, RefreshCcw, ClipboardList, ShieldCheck, AlertCircle } from 'lucide-react';
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
    const { isAuthenticated } = useAuth();

    const handleSearch = async (e?: React.FormEvent) => {
        e?.preventDefault();
        setLoading(true);
        setError('');
        setReturnMessage('');
        try {
            const res = await api.orders.getByCode(orderCode.trim());
            const data = res.data || res;
            setOrder(data as TrackedOrder);
        } catch (err: any) {
            setOrder(null);
            setError(err?.response?.data?.message || err?.message || 'حدث خطأ في البحث عن الطلب');
        } finally {
            setLoading(false);
        }
    };

    const buildReturnItems = (items: OrderItem[]) => {
        return items.map((item) => ({
            product_id: item.product_id || item.productId || item.id,
            quantity: item.quantity,
            name: item.name,
            price: item.price
        }));
    };

    const handleCreateReturn = async () => {
        if (!order) return;
        if (!isAuthenticated) {
            setError('يجب تسجيل الدخول لإرسال طلب مرتجع');
            return;
        }
        setReturnLoading(true);
        setError('');
        setReturnMessage('');
        try {
            const payload = {
                order_id: order.id,
                items: buildReturnItems(order.items || []),
                return_reason: 'طلب مرتجع من الشاشة الذكية',
                return_notes: `طلب مرتجع تلقائي للكود ${order.order_code}`
            };
            const res = await api.returns.create(payload);
            const data: any = res.data || res;
            const returnCode = data.return_code || data?.data?.return_code;
            setReturnMessage(`تم تسجيل طلب المرتجع برقم ${returnCode || 'جديد'}`);
        } catch (err: any) {
            setError(err?.message || 'تعذر إنشاء طلب المرتجع');
        } finally {
            setReturnLoading(false);
        }
    };

    const statusChip = order ? (
        <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold bg-emerald-50 text-emerald-700 border border-emerald-100">
            {order.status}
        </span>
    ) : null;

    return (
        <div className="min-h-screen bg-gray-50 pb-12">
            <div className="max-w-2xl mx-auto px-4 pt-6">
                <div className="flex items-center justify-between mb-6">
                    <div>
                        <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
                            <PackageSearch className="text-emerald-600" />
                            شاشة المرتجعات الذكية
                        </h1>
                        <p className="text-gray-600 text-sm mt-1">ابحث برقم الطلب وتابع حالته أو قدّم طلب مرتجع.</p>
                    </div>
                    <SmartBackButton />
                </div>

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
                    {error && (
                        <p className="mt-3 text-sm text-red-600 flex items-center gap-2"><AlertCircle size={16} />{error}</p>
                    )}
                </form>

                {order && (
                    <div className="bg-white p-4 mt-4 rounded-2xl shadow-sm border border-gray-100">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm text-gray-500">رقم الطلب</p>
                                <p className="text-lg font-bold">{order.order_code}</p>
                            </div>
                            {statusChip}
                        </div>
                        <div className="mt-4 grid sm:grid-cols-2 gap-4 text-sm text-gray-700">
                            <div>
                                <p className="text-gray-500">القيمة الإجمالية</p>
                                <p className="font-semibold">{order.total} جنيه</p>
                            </div>
                            <div>
                                <p className="text-gray-500">طريقة الدفع</p>
                                <p className="font-semibold">{order.payment_method || 'غير متوفر'}</p>
                            </div>
                        </div>
                        <div className="mt-4">
                            <p className="font-semibold text-gray-800 mb-2">المنتجات</p>
                            <div className="space-y-2">
                                {order.items?.map((item, idx) => (
                                    <div key={idx} className="flex items-center justify-between border border-gray-100 rounded-lg px-3 py-2">
                                        <div>
                                            <p className="font-semibold text-gray-900">{item.name || 'منتج'}</p>
                                            <p className="text-xs text-gray-500">الكمية: {item.quantity}</p>
                                        </div>
                                        <span className="text-sm font-bold text-emerald-700">{item.price || 0} جنيه</span>
                                    </div>
                                ))}
                            </div>
                        </div>

                        <div className="mt-5 flex flex-wrap gap-3">
                            <button
                                onClick={handleCreateReturn}
                                disabled={returnLoading || order.status !== 'delivered'}
                                className="inline-flex items-center gap-2 px-4 py-3 rounded-xl bg-orange-600 text-white font-semibold hover:bg-orange-700 disabled:opacity-60"
                            >
                                <RefreshCcw size={18} />
                                {returnLoading ? 'جاري إرسال الطلب...' : 'طلب مرتجع'}
                            </button>
                            <div className="flex items-center gap-2 text-sm text-gray-600">
                                <ClipboardList size={16} />
                                متاح فقط للطلبات المستلمة
                            </div>
                        </div>

                        {returnMessage && (
                            <div className="mt-4 flex items-center gap-2 text-emerald-700 text-sm bg-emerald-50 border border-emerald-100 rounded-xl px-3 py-2">
                                <ShieldCheck size={16} />
                                {returnMessage}
                            </div>
                        )}
                    </div>
                )}
            </div>
        </div>
    );
};

export default SmartReturnsPage;
