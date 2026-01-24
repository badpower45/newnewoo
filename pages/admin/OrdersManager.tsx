import React, { useState, useEffect } from 'react';
import { Search, Filter, Eye, X, Info } from 'lucide-react';
import { api } from '../../services/api';
import { ORDER_STATUS_LABELS } from '../../src/config';
import { TableSkeleton } from '../../components/Skeleton';
import '../../styles/admin-responsive.css';

const OrdersManager = () => {
    const [orders, setOrders] = useState<any[]>([]);
    const [searchTerm, setSearchTerm] = useState('');
    const [statusFilter, setStatusFilter] = useState('all');
    const [selectedOrder, setSelectedOrder] = useState<any>(null);
    const [showModal, setShowModal] = useState(false);
    const [loading, setLoading] = useState(true);
    const [reasonModal, setReasonModal] = useState<{ orderId: string | number; reason: string } | null>(null);
    const contactMethodLabels: Record<string, string> = {
        phone: 'اتصال هاتفي',
        whatsapp: 'واتساب',
        sms: 'رسالة SMS',
        any: 'أي وسيلة متاحة'
    };
    const getUnavailableContactMethod = (order: any) =>
        order?.unavailable_contact_method || order?.unavailableContactMethod || '';

    useEffect(() => {
        loadOrders();
    }, []);

    const loadOrders = async () => {
        setLoading(true);
        try {
            // Use getAllAdmin to get all orders for admin
            const data = await api.orders.getAllAdmin();
            console.log('Orders loaded:', data);
            if (data.data) {
                setOrders(data.data);
            } else if (Array.isArray(data)) {
                setOrders(data);
            }
        } catch (error) {
            console.error('Failed to load orders:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleStatusUpdate = async (id: string, newStatus: string) => {
        try {
            await api.orders.updateStatus(id, newStatus);
            loadOrders();
        } catch (err) {
            console.error("Failed to update status", err);
        }
    };

    const getStatusColor = (status: string) => {
        switch (status) {
            case 'pending': return 'bg-yellow-100 text-yellow-700';
            case 'confirmed': return 'bg-blue-100 text-blue-700';
            case 'preparing': return 'bg-purple-100 text-purple-700';
            case 'ready': return 'bg-teal-100 text-teal-700';
            case 'out_for_delivery': return 'bg-indigo-100 text-indigo-700';
            case 'delivered': return 'bg-green-100 text-green-700';
            case 'cancelled': return 'bg-red-100 text-red-700';
            default: return 'bg-gray-100 text-gray-700';
        }
    };

    const filteredOrders = orders.filter(order => {
        const matchesSearch = order.id?.toString().includes(searchTerm) || (order.userId || order.user_id || '').toString().includes(searchTerm);
        const matchesStatus = statusFilter === 'all' || order.status === statusFilter;
        return matchesSearch && matchesStatus;
    });

    return (
        <div className="admin-page-container">
            <div className="admin-page-header">
                <h1 className="admin-page-title">إدارة الطلبات</h1>
                <p className="admin-page-subtitle">عرض وإدارة جميع الطلبات</p>
            </div>

            {/* Filters */}
            <div className="admin-card mb-4 sm:mb-6">
                <div className="flex flex-col sm:flex-row gap-3 sm:gap-4">
                    <div className="relative flex-1">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                        <input
                            type="text"
                            placeholder="بحث برقم الطلب..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="admin-form-input pl-10"
                        />
                    </div>
                    <div className="flex items-center gap-2">
                        <Filter size={18} className="text-gray-400 hidden sm:block" />
                        <select
                            value={statusFilter}
                            onChange={(e) => setStatusFilter(e.target.value)}
                            className="admin-form-select flex-1 sm:flex-initial min-w-[150px]"
                        >
                        <option value="all">جميع الحالات</option>
                        <option value="pending">بانتظار التأكيد</option>
                        <option value="confirmed">تم التأكيد</option>
                        <option value="preparing">جاري التحضير</option>
                        <option value="ready">جاهز للتوصيل</option>
                        <option value="out_for_delivery">في الطريق</option>
                        <option value="delivered">تم التوصيل</option>
                        <option value="cancelled">ملغي</option>
                    </select>
                </div>
            </div>
            </div>

            {/* Orders List/Table */}
            {loading ? (
                <TableSkeleton rows={6} cols={6} />
            ) : (
                <>
                    {/* Mobile Cards */}
                    <div className="sm:hidden space-y-3">
                        {filteredOrders.map((order) => (
                            <div key={order.id} className="bg-white border border-gray-100 rounded-2xl p-3 shadow-sm">
                                <div className="flex items-center justify-between">
                                    <div className="font-bold text-gray-900 text-sm">طلب #{order.id}</div>
                                    <button
                                        onClick={() => order.rejection_reason && setReasonModal({ orderId: order.id, reason: order.rejection_reason })}
                                        className={`px-2 py-1 text-xs font-bold rounded-full ${getStatusColor(order.status)} ${
                                            order.rejection_reason ? 'cursor-pointer' : ''
                                        }`}
                                        title={order.rejection_reason ? 'عرض سبب الإلغاء' : undefined}
                                    >
                                        {ORDER_STATUS_LABELS[order.status] || order.status}
                                        {order.rejection_reason && (
                                            <Info size={12} className="inline-block ml-1 align-middle" />
                                        )}
                                    </button>
                                </div>
                                <div className="mt-2 text-xs text-gray-500 flex flex-wrap gap-2">
                                    <span>
                                        {new Date(order.date || order.created_at || Date.now()).toLocaleDateString('ar-EG')}
                                    </span>
                                    <span className="text-gray-300">•</span>
                                    <span>عميل: {order.userId || order.user_id || '-'}</span>
                                </div>
                                <div className="mt-3 flex items-center justify-between gap-3">
                                    <div className="text-sm font-semibold text-gray-900">
                                        {(Number(order.total) || 0).toFixed(0)} ج
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <button
                                            onClick={() => { setSelectedOrder(order); setShowModal(true); }}
                                            className="px-3 py-1.5 text-xs font-semibold text-blue-600 bg-blue-50 rounded-lg"
                                        >
                                            عرض
                                        </button>
                                        <select
                                            value={order.status}
                                            onChange={(e) => handleStatusUpdate(order.id, e.target.value)}
                                            className="text-xs border border-gray-200 rounded px-2 py-1"
                                        >
                                            <option value="pending">بانتظار التأكيد</option>
                                            <option value="confirmed">تم التأكيد</option>
                                            <option value="preparing">جاري التحضير</option>
                                            <option value="ready">جاهز للتوصيل</option>
                                            <option value="out_for_delivery">في الطريق</option>
                                            <option value="delivered">تم التوصيل</option>
                                            <option value="cancelled">ملغي</option>
                                        </select>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>

                    {/* Desktop Table */}
                    <div className="hidden sm:block admin-table-container">
                        <div className="overflow-x-auto">
                            <table className="admin-table min-w-[700px]">
                                <thead>
                                    <tr>
                                        <th className="px-3 sm:px-6 py-3 sm:py-4">رقم الطلب</th>
                                        <th className="px-3 sm:px-6 py-3 sm:py-4 hidden sm:table-cell">التاريخ</th>
                                        <th className="px-3 sm:px-6 py-3 sm:py-4 hidden md:table-cell">العميل</th>
                                        <th className="px-3 sm:px-6 py-3 sm:py-4">الإجمالي</th>
                                        <th className="px-3 sm:px-6 py-3 sm:py-4">الحالة</th>
                                        <th className="px-3 sm:px-6 py-3 sm:py-4 text-right">إجراءات</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {filteredOrders.map((order) => (
                                        <tr key={order.id}>
                                            <td className="px-3 sm:px-6 py-3 sm:py-4 font-medium text-xs sm:text-sm">#{order.id}</td>
                                            <td className="px-3 sm:px-6 py-3 sm:py-4 text-xs sm:text-sm hidden sm:table-cell">
                                                {new Date(order.date || order.created_at || Date.now()).toLocaleDateString('ar-EG')}
                                            </td>
                                            <td className="px-3 sm:px-6 py-3 sm:py-4 text-xs sm:text-sm hidden md:table-cell">
                                                {order.userId || order.user_id}
                                            </td>
                                            <td className="px-3 sm:px-6 py-3 sm:py-4 font-medium text-xs sm:text-sm">
                                                {(Number(order.total) || 0).toFixed(0)} ج
                                            </td>
                                            <td className="px-3 sm:px-6 py-3 sm:py-4">
                                                <span
                                                    onClick={() => order.rejection_reason && setReasonModal({ orderId: order.id, reason: order.rejection_reason })}
                                                    className={`px-2 py-1 text-xs font-bold rounded-full ${getStatusColor(order.status)} ${
                                                        order.rejection_reason ? 'cursor-pointer hover:shadow' : ''
                                                    }`}
                                                    title={order.rejection_reason ? 'عرض سبب الإلغاء' : undefined}
                                                >
                                                    <span className="hidden sm:inline">
                                                        {ORDER_STATUS_LABELS[order.status] || order.status}
                                                    </span>
                                                    <span className="sm:hidden">
                                                        {order.status === 'pending' ? '⏳' : 
                                                        order.status === 'confirmed' ? '✓' :
                                                        order.status === 'delivered' ? '✅' :
                                                        order.status === 'cancelled' ? '❌' : '📦'}
                                                    </span>
                                                    {order.rejection_reason && (
                                                        <Info size={12} className="inline-block ml-1 align-middle" />
                                                    )}
                                                </span>
                                            </td>
                                            <td className="px-3 sm:px-6 py-3 sm:py-4 text-right">
                                                <div className="flex items-center justify-end gap-1 sm:gap-2">
                                                    <button
                                                        onClick={() => { setSelectedOrder(order); setShowModal(true); }}
                                                        className="p-1.5 sm:p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                                                    >
                                                        <Eye size={16} className="sm:w-5 sm:h-5" />
                                                    </button>
                                                    <select
                                                        value={order.status}
                                                        onChange={(e) => handleStatusUpdate(order.id, e.target.value)}
                                                        className="text-xs sm:text-sm border border-gray-200 rounded px-1 sm:px-2 py-1"
                                                    >
                                                        <option value="pending">بانتظار التأكيد</option>
                                                        <option value="confirmed">تم التأكيد</option>
                                                        <option value="preparing">جاري التحضير</option>
                                                        <option value="ready">جاهز للتوصيل</option>
                                                        <option value="out_for_delivery">في الطريق</option>
                                                        <option value="delivered">تم التوصيل</option>
                                                        <option value="cancelled">ملغي</option>
                                                    </select>
                                                </div>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>
                </>
            )}

            {/* Order Details Modal */}
            {showModal && selectedOrder && (
                <div className="admin-modal-overlay">
                    <div className="admin-modal-container">
                        <div className="admin-modal-header">
                            <h2 className="admin-modal-title">طلب #{selectedOrder.id}</h2>
                            <button onClick={() => setShowModal(false)} className="admin-modal-close">
                                <X className="w-5 h-5 sm:w-6 sm:h-6" />
                            </button>
                        </div>
                        
                        <div className="admin-modal-body">
                            {/* Status & Date */}
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
                                <div>
                                    <p className="text-xs sm:text-sm text-gray-500 mb-1">الحالة</p>
                                    <span className={`inline-block px-2 sm:px-3 py-1 text-xs sm:text-sm font-bold rounded-full ${getStatusColor(selectedOrder.status)}`}>
                                        {ORDER_STATUS_LABELS[selectedOrder.status] || selectedOrder.status}
                                    </span>
                                </div>
                                <div>
                                    <p className="text-xs sm:text-sm text-gray-500 mb-1">التاريخ</p>
                                    <p className="font-medium text-xs sm:text-sm">{new Date(selectedOrder.date || selectedOrder.created_at || Date.now()).toLocaleDateString('ar-EG')}</p>
                                </div>
                            </div>

                            {/* Customer Info */}
                            <div className="bg-gray-50 p-3 sm:p-4 rounded-lg sm:rounded-xl">
                                <h3 className="font-bold text-gray-900 mb-2 sm:mb-3 text-sm sm:text-base">تفاصيل العميل</h3>
                                <div className="space-y-2 text-xs sm:text-sm">
                                    <p><span className="text-gray-500">رقم العميل:</span> <span className="font-medium">#{selectedOrder.userId}</span></p>
                                    <p className="break-words"><span className="text-gray-500">العنوان:</span> <span className="font-medium">{selectedOrder.deliveryAddress || selectedOrder.delivery_address || 'غير محدد'}</span></p>
                                </div>
                            </div>

                            {/* Branch & Slot */}
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
                                <div className="bg-gray-50 p-3 sm:p-4 rounded-lg sm:rounded-xl">
                                    <h3 className="font-bold text-gray-900 mb-2 text-sm sm:text-base">الفرع</h3>
                                    <p className="text-xs sm:text-sm">#{selectedOrder.branchId || selectedOrder.branch_id || 'غير محدد'}</p>
                                </div>
                                <div className="bg-gray-50 p-3 sm:p-4 rounded-lg sm:rounded-xl">
                                    <h3 className="font-bold text-gray-900 mb-2 text-sm sm:text-base">وقت التوصيل</h3>
                                    <p className="text-xs sm:text-sm">#{selectedOrder.deliverySlotId || selectedOrder.delivery_slot_id || 'غير محدد'}</p>
                                </div>
                            </div>

                            {/* Payment */}
                            <div className="bg-gray-50 p-3 sm:p-4 rounded-lg sm:rounded-xl">
                                <h3 className="font-bold text-gray-900 mb-2 sm:mb-3 text-sm sm:text-base">الدفع</h3>
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 sm:gap-4 text-xs sm:text-sm">
                                    <p><span className="text-gray-500">الطريقة:</span> <span className="font-medium">{selectedOrder.paymentMethod || selectedOrder.payment_method || 'كاش'}</span></p>
                                    <p><span className="text-gray-500">الحالة:</span> <span className="font-medium">{selectedOrder.paymentStatus || selectedOrder.payment_status || 'معلق'}</span></p>
                                </div>
                            </div>

                            {getUnavailableContactMethod(selectedOrder) && (
                                <div className="bg-gray-50 p-3 sm:p-4 rounded-lg sm:rounded-xl">
                                    <h3 className="font-bold text-gray-900 mb-2 sm:mb-3 text-sm sm:text-base">التواصل عند عدم التوفر</h3>
                                    <p className="text-xs sm:text-sm text-gray-700">
                                        {contactMethodLabels[getUnavailableContactMethod(selectedOrder)] || getUnavailableContactMethod(selectedOrder)}
                                    </p>
                                </div>
                            )}

                            {/* Order Items */}
                            <div>
                                <h3 className="font-bold text-gray-900 mb-3">Order Items</h3>
                                <div className="border rounded-xl overflow-hidden">
                                    <table className="w-full text-sm">
                                        <thead className="bg-gray-50">
                                            <tr>
                                                <th className="px-4 py-3 text-left">Product</th>
                                                <th className="px-4 py-3 text-right">Qty</th>
                                                <th className="px-4 py-3 text-right">Price</th>
                                                <th className="px-4 py-3 text-right">Total</th>
                                                <th className="px-4 py-3 text-right">If Unavailable</th>
                                            </tr>
                                        </thead>
                                        <tbody className="divide-y">
                                            {(selectedOrder.items || []).map((item: any, idx: number) => {
                                                const subPref = item.substitutionPreference || item.substitution_preference || 'call_me';
                                                const subLabels: Record<string, string> = {
                                                    call_me: '📞 اتصل بي',
                                                    similar_product: '🔄 استبدل',
                                                    cancel_item: '❌ الغِ'
                                                };
                                                return (
                                                    <tr key={idx}>
                                                        <td className="px-4 py-3">{item.product_name || item.productName || item.name || `Product #${item.product_id || item.productId || item.id}`}</td>
                                                        <td className="px-4 py-3 text-right">{item.quantity}</td>
                                                        <td className="px-4 py-3 text-right">{(item.price || 0).toFixed(2)} EGP</td>
                                                        <td className="px-4 py-3 text-right font-medium">{((item.price || 0) * item.quantity).toFixed(2)} EGP</td>
                                                        <td className="px-4 py-3 text-right text-xs">
                                                            <span className={`px-2 py-1 rounded-full ${
                                                                subPref === 'call_me' ? 'bg-blue-100 text-blue-700' :
                                                                subPref === 'similar_product' ? 'bg-green-100 text-green-700' :
                                                                'bg-red-100 text-red-700'
                                                            }`}>
                                                                {subLabels[subPref] || subPref}
                                                            </span>
                                                        </td>
                                                    </tr>
                                                );
                                            })}
                                        </tbody>
                                        <tfoot className="bg-gray-50 font-bold">
                                            <tr>
                                                <td colSpan={4} className="px-4 py-3 text-right">Total</td>
                                                <td className="px-4 py-3 text-right text-lg">{(Number(selectedOrder.total) || 0).toFixed(2)} EGP</td>
                                            </tr>
                                        </tfoot>
                                    </table>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* سبب الإلغاء / الرفض */}
            {reasonModal && (
                <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
                    <div className="bg-white rounded-xl shadow-lg p-5 w-full max-w-sm text-right">
                        <div className="flex items-start justify-between mb-3">
                            <div>
                                <p className="text-xs text-gray-500">سبب الإلغاء</p>
                                <p className="text-lg font-bold text-gray-900">طلب #{reasonModal.orderId}</p>
                            </div>
                            <button
                                onClick={() => setReasonModal(null)}
                                className="p-2 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-full"
                            >
                                <X size={18} />
                            </button>
                        </div>
                        <p className="text-gray-800 leading-relaxed whitespace-pre-wrap">
                            {reasonModal.reason || 'لا يوجد سبب مسجل'}
                        </p>
                    </div>
                </div>
            )}
        </div>
    );
};

export default OrdersManager;
