import React, { useState, useEffect } from 'react';
import { 
    Package, User, Phone, MapPin, Clock, CheckCircle, 
    Truck, Navigation, Copy, X, AlertCircle, Home,
    Building, FileText, DollarSign, RefreshCw
} from 'lucide-react';
import { api } from '../services/api';
import { useAuth } from '../context/AuthContext';

// حالات الطلب للديليفري
const ORDER_STATUS = {
    assigned: { label: 'تم التعيين', color: 'bg-blue-100 text-blue-700' },
    picked_up: { label: 'تم الاستلام', color: 'bg-purple-100 text-purple-700' },
    arriving: { label: 'في انتظار العميل', color: 'bg-orange-100 text-orange-700' },
    delivered: { label: 'تم التوصيل', color: 'bg-green-100 text-green-700' },
    rejected: { label: 'مرفوض', color: 'bg-red-100 text-red-700' },
};

const DeliveryDriverPage = () => {
    const { user } = useAuth();
    const [orders, setOrders] = useState<any[]>([]);
    const [selectedOrder, setSelectedOrder] = useState<any>(null);
    const [loading, setLoading] = useState(false);
    const [showRejectModal, setShowRejectModal] = useState(false);
    const [rejectReason, setRejectReason] = useState('');
    const [copied, setCopied] = useState(false);

    useEffect(() => {
        loadMyOrders();
    }, []);

    const loadMyOrders = async () => {
        setLoading(true);
        try {
            const res = await api.distribution.getDeliveryOrders();
            setOrders(res.data || []);
        } catch (err) {
            console.error('Failed to load orders:', err);
        }
        setLoading(false);
    };

    // Parse shipping info
    const getShippingInfo = (order: any) => {
        if (!order?.shipping_info) return null;
        return typeof order.shipping_info === 'string' 
            ? JSON.parse(order.shipping_info) 
            : order.shipping_info;
    };

    // فتح الموقع على Google Maps
    const openInMaps = (shipping: any) => {
        if (shipping?.coordinates) {
            const url = `https://www.google.com/maps/dir/?api=1&destination=${shipping.coordinates.lat},${shipping.coordinates.lng}`;
            window.open(url, '_blank');
        } else if (shipping?.address) {
            const url = `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(shipping.address)}`;
            window.open(url, '_blank');
        }
    };

    // نسخ رابط الموقع
    const copyLocationLink = (shipping: any) => {
        let link = '';
        if (shipping?.coordinates) {
            link = `https://www.google.com/maps?q=${shipping.coordinates.lat},${shipping.coordinates.lng}`;
        }
        if (link) {
            navigator.clipboard.writeText(link);
            setCopied(true);
            setTimeout(() => setCopied(false), 2000);
        }
    };

    // استلام الطلب
    const handlePickup = async (orderId: number) => {
        try {
            await api.distribution.pickupOrder(orderId);
            await loadMyOrders();
            if (selectedOrder?.id === orderId) {
                setSelectedOrder((prev: any) => ({ ...prev, assignment_status: 'picked_up' }));
            }
        } catch (err) {
            console.error('Failed to pickup order:', err);
            alert('فشل استلام الطلب');
        }
    };

    // وصلت - في انتظار العميل
    const handleArriving = async (orderId: number) => {
        try {
            await api.distribution.arrivingOrder(orderId);
            await loadMyOrders();
            if (selectedOrder?.id === orderId) {
                setSelectedOrder((prev: any) => ({ ...prev, assignment_status: 'arriving' }));
            }
        } catch (err) {
            console.error('Failed to update status:', err);
            alert('فشل تحديث الحالة');
        }
    };

    // تم التوصيل
    const handleDeliver = async (orderId: number) => {
        try {
            await api.distribution.deliverOrder(orderId);
            await loadMyOrders();
            setSelectedOrder(null);
            alert('تم تسليم الطلب بنجاح! 🎉');
        } catch (err) {
            console.error('Failed to deliver order:', err);
            alert('فشل تأكيد التوصيل');
        }
    };

    // رفض الطلب
    const handleReject = async () => {
        if (!selectedOrder || !rejectReason.trim()) {
            alert('يرجى كتابة سبب الرفض');
            return;
        }
        try {
            await api.distribution.rejectOrder(selectedOrder.id, rejectReason);
            await loadMyOrders();
            setSelectedOrder(null);
            setShowRejectModal(false);
            setRejectReason('');
        } catch (err) {
            console.error('Failed to reject order:', err);
            alert('فشل رفض الطلب');
        }
    };

    const getStatusButtons = (order: any) => {
        const status = order.assignment_status || 'assigned';
        
        switch (status) {
            case 'assigned':
                return (
                    <button
                        onClick={() => handlePickup(order.id)}
                        className="w-full py-4 bg-blue-600 text-white rounded-xl font-bold flex items-center justify-center gap-2 hover:bg-blue-700 transition"
                    >
                        <Package size={20} />
                        استلام الطلب
                    </button>
                );
            case 'picked_up':
                return (
                    <button
                        onClick={() => handleArriving(order.id)}
                        className="w-full py-4 bg-orange-500 text-white rounded-xl font-bold flex items-center justify-center gap-2 hover:bg-orange-600 transition"
                    >
                        <Clock size={20} />
                        وصلت - في انتظار العميل
                    </button>
                );
            case 'arriving':
                return (
                    <div className="space-y-3">
                        <button
                            onClick={() => handleDeliver(order.id)}
                            className="w-full py-4 bg-green-600 text-white rounded-xl font-bold flex items-center justify-center gap-2 hover:bg-green-700 transition"
                        >
                            <CheckCircle size={20} />
                            تم التوصيل
                        </button>
                        <button
                            onClick={() => setShowRejectModal(true)}
                            className="w-full py-3 bg-red-100 text-red-600 rounded-xl font-bold flex items-center justify-center gap-2 hover:bg-red-200 transition"
                        >
                            <X size={20} />
                            رفض الطلب
                        </button>
                    </div>
                );
            default:
                return null;
        }
    };

    return (
        <div className="min-h-screen bg-gray-100">
            {/* Header */}
            <div className="bg-indigo-600 text-white px-4 py-6">
                <div className="flex justify-between items-center">
                    <div>
                        <h1 className="text-xl font-bold">طلباتي</h1>
                        <p className="text-indigo-200 text-sm">{user?.name || 'الديليفري'}</p>
                    </div>
                    <button 
                        onClick={loadMyOrders}
                        className="p-2 bg-indigo-500 rounded-lg hover:bg-indigo-400"
                    >
                        <RefreshCw size={20} className={loading ? 'animate-spin' : ''} />
                    </button>
                </div>
            </div>

            {/* Orders List */}
            <div className="p-4">
                {loading ? (
                    <div className="flex items-center justify-center py-20">
                        <RefreshCw className="animate-spin text-gray-400" size={32} />
                    </div>
                ) : orders.length === 0 ? (
                    <div className="text-center py-20 text-gray-500">
                        <Truck size={64} className="mx-auto mb-4 opacity-30" />
                        <p className="text-lg">لا توجد طلبات حالياً</p>
                    </div>
                ) : (
                    <div className="space-y-4">
                        {orders.map(order => {
                            const shipping = getShippingInfo(order);
                            const status = order.assignment_status || 'assigned';
                            
                            return (
                                <div
                                    key={order.id}
                                    onClick={() => setSelectedOrder(order)}
                                    className={`bg-white rounded-2xl p-4 shadow-sm cursor-pointer transition ${
                                        selectedOrder?.id === order.id ? 'ring-2 ring-indigo-500' : ''
                                    }`}
                                >
                                    <div className="flex justify-between items-start mb-3">
                                        <div>
                                            <span className="font-bold text-lg">طلب #{order.id}</span>
                                            <span className={`mr-2 px-2 py-1 rounded-full text-xs font-medium ${
                                                ORDER_STATUS[status as keyof typeof ORDER_STATUS]?.color || 'bg-gray-100'
                                            }`}>
                                                {ORDER_STATUS[status as keyof typeof ORDER_STATUS]?.label || status}
                                            </span>
                                        </div>
                                        <span className="text-xl font-bold text-green-600">
                                            {Number(order.total || 0).toFixed(0)} ج.م
                                        </span>
                                    </div>

                                    {shipping && (
                                        <div className="space-y-2 text-sm text-gray-600">
                                            <div className="flex items-center gap-2">
                                                <User size={16} className="text-gray-400" />
                                                <span>{shipping.firstName} {shipping.lastName}</span>
                                            </div>
                                            <div className="flex items-center gap-2">
                                                <Phone size={16} className="text-gray-400" />
                                                <a href={`tel:${shipping.phone}`} className="text-blue-600">
                                                    {shipping.phone}
                                                </a>
                                            </div>
                                        </div>
                                    )}
                                </div>
                            );
                        })}
                    </div>
                )}
            </div>

            {/* Order Details Modal */}
            {selectedOrder && (
                <div className="fixed inset-0 bg-black/50 z-50 flex items-end justify-center">
                    <div className="bg-white rounded-t-3xl w-full max-w-lg max-h-[90vh] overflow-y-auto animate-slide-up">
                        {/* Modal Header */}
                        <div className="sticky top-0 bg-white border-b px-4 py-4 flex justify-between items-center">
                            <h2 className="text-xl font-bold">طلب #{selectedOrder.id}</h2>
                            <button 
                                onClick={() => setSelectedOrder(null)}
                                className="p-2 hover:bg-gray-100 rounded-full"
                            >
                                <X size={24} />
                            </button>
                        </div>

                        <div className="p-4 space-y-4">
                            {/* المبلغ */}
                            <div className="bg-green-50 rounded-xl p-4 text-center">
                                <p className="text-sm text-green-600 mb-1">المبلغ المطلوب</p>
                                <p className="text-3xl font-bold text-green-700">
                                    {Number(selectedOrder.total || 0).toFixed(2)} ج.م
                                </p>
                                <p className="text-xs text-green-500 mt-1">
                                    {selectedOrder.payment_method === 'cod' ? 'الدفع عند الاستلام' : selectedOrder.payment_method}
                                </p>
                            </div>

                            {/* معلومات العميل */}
                            {(() => {
                                const shipping = getShippingInfo(selectedOrder);
                                if (!shipping) return null;
                                
                                return (
                                    <div className="bg-white rounded-xl border p-4 space-y-4">
                                        <h3 className="font-bold text-gray-900 flex items-center gap-2">
                                            <User size={18} />
                                            معلومات العميل
                                        </h3>
                                        
                                        <div className="space-y-3">
                                            {/* الاسم */}
                                            <div className="flex items-center gap-3">
                                                <div className="w-10 h-10 bg-gray-100 rounded-full flex items-center justify-center">
                                                    <User size={18} className="text-gray-500" />
                                                </div>
                                                <div>
                                                    <p className="text-xs text-gray-400">الاسم</p>
                                                    <p className="font-medium">{shipping.firstName} {shipping.lastName}</p>
                                                </div>
                                            </div>

                                            {/* الهاتف */}
                                            <div className="flex items-center gap-3">
                                                <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                                                    <Phone size={18} className="text-blue-600" />
                                                </div>
                                                <div className="flex-1">
                                                    <p className="text-xs text-gray-400">رقم الهاتف</p>
                                                    <a href={`tel:${shipping.phone}`} className="font-medium text-blue-600">
                                                        {shipping.phone}
                                                    </a>
                                                </div>
                                                <a 
                                                    href={`tel:${shipping.phone}`}
                                                    className="px-4 py-2 bg-blue-600 text-white rounded-lg text-sm"
                                                >
                                                    اتصال
                                                </a>
                                            </div>

                                            {/* العنوان */}
                                            {shipping.building && (
                                                <div className="flex items-start gap-3">
                                                    <div className="w-10 h-10 bg-gray-100 rounded-full flex items-center justify-center">
                                                        <Building size={18} className="text-gray-500" />
                                                    </div>
                                                    <div>
                                                        <p className="text-xs text-gray-400">العمارة/المبنى</p>
                                                        <p className="font-medium">{shipping.building}</p>
                                                    </div>
                                                </div>
                                            )}

                                            {shipping.street && (
                                                <div className="flex items-start gap-3">
                                                    <div className="w-10 h-10 bg-gray-100 rounded-full flex items-center justify-center">
                                                        <Home size={18} className="text-gray-500" />
                                                    </div>
                                                    <div>
                                                        <p className="text-xs text-gray-400">الشارع</p>
                                                        <p className="font-medium">{shipping.street}</p>
                                                    </div>
                                                </div>
                                            )}

                                            {shipping.floor && (
                                                <div className="flex items-center gap-3 text-sm">
                                                    <span className="text-gray-500">الدور:</span>
                                                    <span className="font-medium">{shipping.floor}</span>
                                                    {shipping.apartment && (
                                                        <>
                                                            <span className="text-gray-500 mr-4">الشقة:</span>
                                                            <span className="font-medium">{shipping.apartment}</span>
                                                        </>
                                                    )}
                                                </div>
                                            )}

                                            {/* العنوان الكامل */}
                                            <div className="flex items-start gap-3">
                                                <div className="w-10 h-10 bg-gray-100 rounded-full flex items-center justify-center">
                                                    <MapPin size={18} className="text-gray-500" />
                                                </div>
                                                <div className="flex-1">
                                                    <p className="text-xs text-gray-400">العنوان التفصيلي</p>
                                                    <p className="font-medium text-sm">{shipping.address}</p>
                                                </div>
                                            </div>

                                            {/* ملاحظات */}
                                            {shipping.notes && (
                                                <div className="flex items-start gap-3 bg-yellow-50 p-3 rounded-lg">
                                                    <FileText size={18} className="text-yellow-600 mt-0.5" />
                                                    <div>
                                                        <p className="text-xs text-yellow-600 font-medium">ملاحظات</p>
                                                        <p className="text-sm">{shipping.notes}</p>
                                                    </div>
                                                </div>
                                            )}

                                            {/* أزرار الموقع */}
                                            {shipping.coordinates && (
                                                <div className="flex gap-2 pt-2">
                                                    <button
                                                        onClick={() => openInMaps(shipping)}
                                                        className="flex-1 py-3 bg-indigo-600 text-white rounded-xl font-medium flex items-center justify-center gap-2 hover:bg-indigo-700"
                                                    >
                                                        <Navigation size={18} />
                                                        فتح في الخريطة
                                                    </button>
                                                    <button
                                                        onClick={() => copyLocationLink(shipping)}
                                                        className="px-4 py-3 bg-gray-100 text-gray-700 rounded-xl hover:bg-gray-200"
                                                    >
                                                        {copied ? <CheckCircle size={18} className="text-green-500" /> : <Copy size={18} />}
                                                    </button>
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                );
                            })()}

                            {/* Action Buttons */}
                            <div className="pt-2">
                                {getStatusButtons(selectedOrder)}
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* Reject Modal */}
            {showRejectModal && (
                <div className="fixed inset-0 bg-black/50 z-[60] flex items-center justify-center p-4">
                    <div className="bg-white rounded-2xl p-6 w-full max-w-md">
                        <div className="flex items-center gap-3 text-red-600 mb-4">
                            <AlertCircle size={24} />
                            <h3 className="text-lg font-bold">سبب رفض الطلب</h3>
                        </div>
                        <textarea
                            value={rejectReason}
                            onChange={(e) => setRejectReason(e.target.value)}
                            placeholder="اكتب سبب الرفض هنا..."
                            className="w-full px-4 py-3 border rounded-xl resize-none h-32"
                            autoFocus
                        />
                        <div className="flex gap-2 mt-4">
                            <button
                                onClick={handleReject}
                                className="flex-1 py-3 bg-red-600 text-white rounded-xl font-bold hover:bg-red-700"
                            >
                                تأكيد الرفض
                            </button>
                            <button
                                onClick={() => {
                                    setShowRejectModal(false);
                                    setRejectReason('');
                                }}
                                className="flex-1 py-3 bg-gray-200 text-gray-800 rounded-xl font-bold hover:bg-gray-300"
                            >
                                إلغاء
                            </button>
                        </div>
                    </div>
                </div>
            )}

            <style>{`
                @keyframes slide-up {
                    from { transform: translateY(100%); }
                    to { transform: translateY(0); }
                }
                .animate-slide-up {
                    animation: slide-up 0.3s ease-out;
                }
            `}</style>
        </div>
    );
};

export default DeliveryDriverPage;
