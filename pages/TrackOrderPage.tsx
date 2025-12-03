import React, { useState } from 'react';
import { Search, Package, Truck, CheckCircle, Clock, MapPin, Phone, ArrowLeft } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import TopBar from '../components/TopBar';
import Footer from '../components/Footer';
import { api } from '../services/api';

// حالات الطلب مع التفاصيل
const ORDER_STATUSES: { [key: string]: { label: string; color: string; bgColor: string; icon: any; step: number } } = {
    pending: { label: 'في الانتظار', color: 'text-yellow-600', bgColor: 'bg-yellow-100', icon: Clock, step: 1 },
    confirmed: { label: 'تم التأكيد', color: 'text-blue-600', bgColor: 'bg-blue-100', icon: CheckCircle, step: 2 },
    preparing: { label: 'جاري التحضير', color: 'text-orange-600', bgColor: 'bg-orange-100', icon: Package, step: 3 },
    ready: { label: 'جاهز للتوصيل', color: 'text-purple-600', bgColor: 'bg-purple-100', icon: Package, step: 4 },
    out_for_delivery: { label: 'في الطريق إليك', color: 'text-indigo-600', bgColor: 'bg-indigo-100', icon: Truck, step: 5 },
    delivered: { label: 'تم التوصيل', color: 'text-green-600', bgColor: 'bg-green-100', icon: CheckCircle, step: 6 },
    cancelled: { label: 'ملغي', color: 'text-red-600', bgColor: 'bg-red-100', icon: Clock, step: 0 }
};

export default function TrackOrderPage() {
    const navigate = useNavigate();
    const [orderCode, setOrderCode] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [order, setOrder] = useState<any>(null);

    const handleSearch = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!orderCode.trim()) {
            setError('من فضلك أدخل كود الطلب');
            return;
        }

        setLoading(true);
        setError('');
        setOrder(null);

        try {
            const response = await api.orders.getByCode(orderCode.trim().toUpperCase());
            console.log('Track order response:', response);
            if (response && response.data) {
                setOrder(response.data);
            } else if (response && !response.data) {
                // If response exists but no data wrapper
                setOrder(response);
            } else {
                setError('لم يتم العثور على طلب بهذا الكود');
            }
        } catch (err: any) {
            console.error('Error fetching order:', err);
            if (err.response?.data?.message) {
                setError(err.response.data.message);
            } else if (err.message) {
                setError(err.message);
            } else {
                setError('حدث خطأ أثناء البحث عن الطلب. تأكد من كود الطلب وحاول مرة أخرى.');
            }
        } finally {
            setLoading(false);
        }
    };

    const getStatusInfo = (status: string) => {
        return ORDER_STATUSES[status] || ORDER_STATUSES.pending;
    };

    const renderTimeline = () => {
        if (!order) return null;
        const currentStep = getStatusInfo(order.status).step;
        const steps = [
            { step: 1, label: 'تم الطلب', icon: Package },
            { step: 2, label: 'تم التأكيد', icon: CheckCircle },
            { step: 3, label: 'جاري التحضير', icon: Package },
            { step: 4, label: 'جاهز للتوصيل', icon: Package },
            { step: 5, label: 'في الطريق', icon: Truck },
            { step: 6, label: 'تم التوصيل', icon: CheckCircle },
        ];

        return (
            <div className="mt-8">
                <h3 className="font-bold text-brand-brown mb-4">مراحل الطلب</h3>
                <div className="relative">
                    {/* Timeline Line */}
                    <div className="absolute right-4 top-0 bottom-0 w-0.5 bg-gray-200" />
                    
                    <div className="space-y-6">
                        {steps.map((s, idx) => {
                            const isCompleted = currentStep >= s.step;
                            const isCurrent = currentStep === s.step;
                            const Icon = s.icon;
                            
                            return (
                                <div key={idx} className="flex items-center gap-4 relative">
                                    <div className={`w-8 h-8 rounded-full flex items-center justify-center z-10 transition-all ${
                                        isCompleted 
                                            ? 'bg-brand-orange text-white' 
                                            : 'bg-gray-200 text-gray-400'
                                    } ${isCurrent ? 'ring-4 ring-brand-orange/30' : ''}`}>
                                        <Icon size={16} />
                                    </div>
                                    <span className={`font-medium ${isCompleted ? 'text-brand-brown' : 'text-gray-400'}`}>
                                        {s.label}
                                    </span>
                                    {isCurrent && (
                                        <span className="bg-brand-orange text-white text-xs px-2 py-1 rounded-full animate-pulse">
                                            الآن
                                        </span>
                                    )}
                                </div>
                            );
                        })}
                    </div>
                </div>
            </div>
        );
    };

    return (
        <div className="min-h-screen bg-gray-50">
            <TopBar />
            
            {/* Hero Section */}
            <div className="bg-gradient-to-r from-brand-brown to-brand-orange py-16 px-4">
                <div className="max-w-2xl mx-auto text-center">
                    <div className="w-20 h-20 bg-white/20 rounded-full flex items-center justify-center mx-auto mb-6">
                        <Package size={40} className="text-white" />
                    </div>
                    <h1 className="text-3xl md:text-4xl font-bold text-white mb-4">
                        تتبع طلبك 📦
                    </h1>
                    <p className="text-white/80 mb-8">
                        أدخل كود الطلب لمعرفة حالة طلبك الحالية
                    </p>

                    {/* Search Form */}
                    <form onSubmit={handleSearch} className="relative max-w-md mx-auto">
                        <div className="relative">
                            <input
                                type="text"
                                value={orderCode}
                                onChange={(e) => setOrderCode(e.target.value.toUpperCase())}
                                placeholder="أدخل كود الطلب (مثال: ORD-ABC123)"
                                className="w-full px-6 py-4 pr-14 rounded-2xl text-lg text-gray-800 placeholder-gray-400 focus:outline-none focus:ring-4 focus:ring-white/30 shadow-xl"
                                dir="ltr"
                            />
                            <Search className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400" size={24} />
                        </div>
                        <button
                            type="submit"
                            disabled={loading}
                            className="mt-4 w-full bg-white text-brand-brown font-bold py-4 rounded-xl hover:bg-gray-100 transition-colors shadow-lg disabled:opacity-50"
                        >
                            {loading ? (
                                <span className="flex items-center justify-center gap-2">
                                    <span className="w-5 h-5 border-2 border-brand-brown border-t-transparent rounded-full animate-spin" />
                                    جاري البحث...
                                </span>
                            ) : (
                                'بحث عن الطلب'
                            )}
                        </button>
                    </form>
                </div>
            </div>

            {/* Results Section */}
            <div className="max-w-2xl mx-auto px-4 py-8">
                {error && (
                    <div className="bg-red-50 border border-red-200 rounded-2xl p-6 text-center">
                        <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
                            <Package size={32} className="text-red-500" />
                        </div>
                        <h3 className="text-lg font-bold text-red-700 mb-2">لم يتم العثور على الطلب</h3>
                        <p className="text-red-600">{error}</p>
                        <p className="text-gray-500 text-sm mt-4">
                            تأكد من كتابة الكود بشكل صحيح أو تواصل معنا على 19999
                        </p>
                    </div>
                )}

                {order && (
                    <div className="bg-white rounded-2xl shadow-lg overflow-hidden">
                        {/* Order Header */}
                        <div className={`p-6 ${getStatusInfo(order.status).bgColor}`}>
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-sm text-gray-600">كود الطلب</p>
                                    <p className="text-2xl font-bold text-brand-brown" dir="ltr">{order.order_code}</p>
                                </div>
                                <div className={`px-4 py-2 rounded-full ${getStatusInfo(order.status).bgColor} ${getStatusInfo(order.status).color} font-bold`}>
                                    {getStatusInfo(order.status).label}
                                </div>
                            </div>
                        </div>

                        {/* Order Details */}
                        <div className="p-6 space-y-6">
                            {/* Timeline */}
                            {renderTimeline()}

                            {/* Order Info */}
                            <div className="border-t pt-6 mt-6">
                                <h3 className="font-bold text-brand-brown mb-4">تفاصيل الطلب</h3>
                                <div className="grid grid-cols-2 gap-4 text-sm">
                                    <div>
                                        <p className="text-gray-500">تاريخ الطلب</p>
                                        <p className="font-medium">{new Date(order.date).toLocaleDateString('ar-EG', {
                                            year: 'numeric',
                                            month: 'long',
                                            day: 'numeric',
                                            hour: '2-digit',
                                            minute: '2-digit'
                                        })}</p>
                                    </div>
                                    <div>
                                        <p className="text-gray-500">إجمالي الطلب</p>
                                        <p className="font-bold text-brand-orange">{Number(order.total).toFixed(2)} جنيه</p>
                                    </div>
                                    <div>
                                        <p className="text-gray-500">طريقة الدفع</p>
                                        <p className="font-medium">{order.payment_method === 'cod' ? 'الدفع عند الاستلام' : 'دفع إلكتروني'}</p>
                                    </div>
                                    <div>
                                        <p className="text-gray-500">عدد المنتجات</p>
                                        <p className="font-medium">{order.items?.length || 0} منتج</p>
                                    </div>
                                </div>
                            </div>

                            {/* Shipping Info */}
                            {order.shipping_info && (
                                <div className="border-t pt-6">
                                    <h3 className="font-bold text-brand-brown mb-4 flex items-center gap-2">
                                        <MapPin size={18} />
                                        عنوان التوصيل
                                    </h3>
                                    <p className="text-gray-600">
                                        {order.shipping_info.address || `${order.shipping_info.street}, ${order.shipping_info.building}`}
                                    </p>
                                </div>
                            )}

                            {/* Contact Support */}
                            <div className="border-t pt-6">
                                <div className="bg-orange-50 rounded-xl p-4 flex items-center justify-between">
                                    <div>
                                        <p className="font-bold text-brand-brown">هل تحتاج مساعدة؟</p>
                                        <p className="text-sm text-gray-600">تواصل معنا على الخط الساخن</p>
                                    </div>
                                    <a href="tel:19999" className="flex items-center gap-2 bg-brand-orange text-white px-4 py-2 rounded-xl font-bold hover:bg-brand-brown transition-colors">
                                        <Phone size={18} />
                                        19999
                                    </a>
                                </div>
                            </div>
                        </div>
                    </div>
                )}

                {/* Help Section */}
                {!order && !error && (
                    <div className="text-center py-12">
                        <div className="w-24 h-24 bg-orange-100 rounded-full flex items-center justify-center mx-auto mb-6">
                            <Search size={40} className="text-brand-orange" />
                        </div>
                        <h3 className="text-xl font-bold text-gray-800 mb-2">أين أجد كود الطلب؟</h3>
                        <p className="text-gray-500 max-w-md mx-auto">
                            ستجد كود الطلب في رسالة التأكيد المرسلة إليك عبر SMS أو في صفحة تأكيد الطلب بعد إتمام عملية الشراء
                        </p>
                    </div>
                )}
            </div>

            <Footer />
        </div>
    );
}
