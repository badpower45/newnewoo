import React, { useState, useEffect } from 'react';
import { Search, Filter, Eye, X, Info } from 'lucide-react';
import { api } from '../../services/api';
import { ORDER_STATUS_LABELS } from '../../src/config';
import { TableSkeleton } from '../../components/Skeleton';

const OrdersManager = () => {
    const [orders, setOrders] = useState<any[]>([]);
    const [searchTerm, setSearchTerm] = useState('');
    const [statusFilter, setStatusFilter] = useState('all');
    const [selectedOrder, setSelectedOrder] = useState<any>(null);
    const [showModal, setShowModal] = useState(false);
    const [loading, setLoading] = useState(true);
    const [reasonModal, setReasonModal] = useState<{ orderId: string | number; reason: string } | null>(null);

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
        <div>
            <h1 className="text-2xl font-bold text-gray-900 mb-6">Orders Management</h1>

            {/* Filters */}
            <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-100 mb-6 flex flex-col md:flex-row md:items-center space-y-4 md:space-y-0 md:space-x-4">
                <div className="relative flex-1">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
                    <input
                        type="text"
                        placeholder="Search by Order ID or User ID..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-orange/20 focus:border-brand-orange"
                    />
                </div>
                <div className="flex items-center space-x-2">
                    <Filter size={20} className="text-gray-400" />
                    <select
                        value={statusFilter}
                        onChange={(e) => setStatusFilter(e.target.value)}
                        className="border border-gray-200 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-brand-orange/20 focus:border-brand-orange"
                    >
                        <option value="all">All Statuses</option>
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

            {/* Orders Table */}
            {loading ? (
                <TableSkeleton rows={6} cols={6} />
            ) : (
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
                <table className="w-full text-left">
                    <thead className="bg-gray-50 border-b border-gray-100">
                        <tr>
                            <th className="px-6 py-4 font-semibold text-gray-600">Order ID</th>
                            <th className="px-6 py-4 font-semibold text-gray-600">Date</th>
                            <th className="px-6 py-4 font-semibold text-gray-600">Customer</th>
                            <th className="px-6 py-4 font-semibold text-gray-600">Total</th>
                            <th className="px-6 py-4 font-semibold text-gray-600">Status</th>
                            <th className="px-6 py-4 font-semibold text-gray-600 text-right">Actions</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100">
                        {filteredOrders.map((order) => (
                            <tr key={order.id} className="hover:bg-gray-50 transition-colors">
                                <td className="px-6 py-4 font-medium text-gray-900">#{order.id}</td>
                                <td className="px-6 py-4 text-gray-600">{new Date(order.date || order.created_at || Date.now()).toLocaleDateString()}</td>
                                <td className="px-6 py-4 text-gray-600">User #{order.userId || order.user_id}</td>
                                <td className="px-6 py-4 font-medium text-gray-900">{(Number(order.total) || 0).toFixed(2)} EGP</td>
                                <td className="px-6 py-4">
                                    <span
                                        onClick={() => order.rejection_reason && setReasonModal({ orderId: order.id, reason: order.rejection_reason })}
                                        className={`px-2 py-1 text-xs font-bold rounded-full ${getStatusColor(order.status)} ${
                                            order.rejection_reason ? 'cursor-pointer hover:shadow' : ''
                                        }`}
                                        title={order.rejection_reason ? 'عرض سبب الإلغاء' : undefined}
                                    >
                                        {ORDER_STATUS_LABELS[order.status] || order.status}
                                        {order.rejection_reason && (
                                            <Info size={14} className="inline-block ml-1 align-middle" />
                                        )}
                                    </span>
                                </td>
                                <td className="px-6 py-4 text-right">
                                    <div className="flex items-center justify-end space-x-2">
                                        <button
                                            onClick={() => { setSelectedOrder(order); setShowModal(true); }}
                                            className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                                        >
                                            <Eye size={18} />
                                        </button>
                                        <select
                                            value={order.status}
                                            onChange={(e) => handleStatusUpdate(order.id, e.target.value)}
                                            className="text-sm border border-gray-200 rounded px-2 py-1"
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
            )}

            {/* Order Details Modal */}
            {showModal && selectedOrder && (
                <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
                    <div className="bg-white rounded-2xl w-full max-w-3xl max-h-[90vh] overflow-y-auto">
                        <div className="sticky top-0 bg-white border-b p-6 flex items-center justify-between">
                            <h2 className="text-2xl font-bold text-gray-900">Order #{selectedOrder.id}</h2>
                            <button onClick={() => setShowModal(false)} className="p-2 hover:bg-gray-100 rounded-lg">
                                <X size={24} />
                            </button>
                        </div>
                        
                        <div className="p-6 space-y-6">
                            {/* Status & Date */}
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <p className="text-sm text-gray-500 mb-1">Status</p>
                                    <span className={`inline-block px-3 py-1 text-sm font-bold rounded-full ${getStatusColor(selectedOrder.status)}`}>
                                        {ORDER_STATUS_LABELS[selectedOrder.status] || selectedOrder.status}
                                    </span>
                                </div>
                                <div>
                                    <p className="text-sm text-gray-500 mb-1">Date</p>
                                    <p className="font-medium">{new Date(selectedOrder.date || selectedOrder.created_at || Date.now()).toLocaleString()}</p>
                                </div>
                            </div>

                            {/* Customer Info */}
                            <div className="bg-gray-50 p-4 rounded-xl">
                                <h3 className="font-bold text-gray-900 mb-3">Customer Details</h3>
                                <div className="space-y-2 text-sm">
                                    <p><span className="text-gray-500">User ID:</span> <span className="font-medium">#{selectedOrder.userId}</span></p>
                                    <p><span className="text-gray-500">Address:</span> <span className="font-medium">{selectedOrder.deliveryAddress || selectedOrder.delivery_address || 'N/A'}</span></p>
                                </div>
                            </div>

                            {/* Branch & Slot */}
                            <div className="grid grid-cols-2 gap-4">
                                <div className="bg-gray-50 p-4 rounded-xl">
                                    <h3 className="font-bold text-gray-900 mb-2">Branch</h3>
                                    <p className="text-sm">Branch #{selectedOrder.branchId || selectedOrder.branch_id || 'N/A'}</p>
                                </div>
                                <div className="bg-gray-50 p-4 rounded-xl">
                                    <h3 className="font-bold text-gray-900 mb-2">Delivery Slot</h3>
                                    <p className="text-sm">Slot #{selectedOrder.deliverySlotId || selectedOrder.delivery_slot_id || 'N/A'}</p>
                                </div>
                            </div>

                            {/* Payment */}
                            <div className="bg-gray-50 p-4 rounded-xl">
                                <h3 className="font-bold text-gray-900 mb-3">Payment</h3>
                                <div className="grid grid-cols-2 gap-4 text-sm">
                                    <p><span className="text-gray-500">Method:</span> <span className="font-medium">{selectedOrder.paymentMethod || selectedOrder.payment_method || 'COD'}</span></p>
                                    <p><span className="text-gray-500">Status:</span> <span className="font-medium">{selectedOrder.paymentStatus || selectedOrder.payment_status || 'Pending'}</span></p>
                                </div>
                            </div>

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
        </div>
    );
};

export default OrdersManager;
