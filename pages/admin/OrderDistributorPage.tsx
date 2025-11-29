import React, { useState, useEffect } from 'react';
import { 
    Package, User, Phone, MapPin, Clock, CheckCircle, 
    Truck, Play, List, ChevronDown, ChevronUp, RefreshCw 
} from 'lucide-react';
import { api } from '../../services/api';
import { useBranch } from '../../context/BranchContext';

// حالات الطلب
const ORDER_STATUS = {
    pending: { label: 'بانتظار التأكيد', color: 'bg-yellow-100 text-yellow-700', icon: Clock },
    confirmed: { label: 'تم التأكيد', color: 'bg-blue-100 text-blue-700', icon: CheckCircle },
    preparing: { label: 'جاري التحضير', color: 'bg-purple-100 text-purple-700', icon: Package },
    ready: { label: 'جاهز للتوصيل', color: 'bg-green-100 text-green-700', icon: CheckCircle },
    out_for_delivery: { label: 'في الطريق', color: 'bg-indigo-100 text-indigo-700', icon: Truck },
    delivered: { label: 'تم التوصيل', color: 'bg-green-100 text-green-700', icon: CheckCircle },
};

const OrderDistributorPage = () => {
    const { selectedBranch } = useBranch();
    const [orders, setOrders] = useState<any[]>([]);
    const [selectedOrder, setSelectedOrder] = useState<any>(null);
    const [preparationItems, setPreparationItems] = useState<any[]>([]);
    const [availableDelivery, setAvailableDelivery] = useState<any[]>([]);
    const [loading, setLoading] = useState(false);
    const [activeTab, setActiveTab] = useState<'pending' | 'preparing' | 'ready'>('pending');

    useEffect(() => {
        loadOrders();
    }, [selectedBranch, activeTab]);

    const loadOrders = async () => {
        setLoading(true);
        try {
            const statusMap = {
                pending: 'confirmed',
                preparing: 'preparing',
                ready: 'ready'
            };
            const res = await api.distribution.getOrdersToPrepare(selectedBranch?.id, statusMap[activeTab]);
            setOrders(res.data || []);
        } catch (err) {
            console.error('Failed to load orders:', err);
        }
        setLoading(false);
    };

    const loadPreparationItems = async (orderId: number) => {
        try {
            const res = await api.distribution.getPreparationItems(orderId);
            setPreparationItems(res.data || []);
        } catch (err) {
            console.error('Failed to load preparation items:', err);
        }
    };

    const loadAvailableDelivery = async (branchId: number) => {
        try {
            const res = await api.distribution.getAvailableDelivery(branchId);
            setAvailableDelivery(res.data || []);
        } catch (err) {
            console.error('Failed to load delivery staff:', err);
        }
    };

    const handleSelectOrder = async (order: any) => {
        setSelectedOrder(order);
        await loadPreparationItems(order.id);
        if (order.branch_id) {
            await loadAvailableDelivery(order.branch_id);
        }
    };

    const handleStartPreparation = async (orderId: number) => {
        try {
            await api.distribution.startPreparation(orderId);
            await loadOrders();
            await loadPreparationItems(orderId);
            setSelectedOrder((prev: any) => prev ? { ...prev, status: 'preparing' } : null);
        } catch (err) {
            console.error('Failed to start preparation:', err);
            alert('فشل بدء التحضير');
        }
    };

    const handleToggleItem = async (itemId: number, isPrepared: boolean) => {
        try {
            await api.distribution.updatePreparationItem(itemId, isPrepared);
            setPreparationItems(items => 
                items.map(item => 
                    item.id === itemId ? { ...item, is_prepared: isPrepared } : item
                )
            );
        } catch (err) {
            console.error('Failed to update item:', err);
        }
    };

    const handleCompletePreparation = async (orderId: number) => {
        try {
            await api.distribution.completePreparation(orderId);
            await loadOrders();
            setSelectedOrder((prev: any) => prev ? { ...prev, status: 'ready' } : null);
            alert('تم إكمال تحضير الطلب بنجاح!');
        } catch (err: any) {
            console.error('Failed to complete preparation:', err);
            alert(err.response?.data?.error || 'فشل إتمام التحضير');
        }
    };

    const handleAssignDelivery = async (orderId: number, deliveryStaffId: number) => {
        try {
            await api.distribution.assignDelivery(orderId, deliveryStaffId);
            await loadOrders();
            setSelectedOrder(null);
            alert('تم تعيين الديليفري بنجاح!');
        } catch (err) {
            console.error('Failed to assign delivery:', err);
            alert('فشل تعيين الديليفري');
        }
    };

    const allItemsPrepared = preparationItems.length > 0 && preparationItems.every(item => item.is_prepared);

    // Parse shipping info
    const getShippingInfo = (order: any) => {
        if (!order.shipping_info) return null;
        return typeof order.shipping_info === 'string' ? JSON.parse(order.shipping_info) : order.shipping_info;
    };

    // Parse items
    const getOrderItems = (order: any) => {
        if (!order.items) return [];
        return typeof order.items === 'string' ? JSON.parse(order.items) : order.items;
    };

    return (
        <div className="min-h-screen bg-gray-50">
            {/* Header */}
            <div className="bg-white border-b px-6 py-4">
                <div className="flex justify-between items-center">
                    <div>
                        <h1 className="text-2xl font-bold text-gray-900">توزيع الطلبات</h1>
                        <p className="text-sm text-gray-500">
                            {selectedBranch ? `الفرع: ${selectedBranch.name}` : 'اختر فرعاً'}
                        </p>
                    </div>
                    <button 
                        onClick={loadOrders}
                        className="flex items-center gap-2 px-4 py-2 bg-gray-100 rounded-lg hover:bg-gray-200"
                    >
                        <RefreshCw size={18} className={loading ? 'animate-spin' : ''} />
                        تحديث
                    </button>
                </div>

                {/* Tabs */}
                <div className="flex gap-2 mt-4">
                    <button
                        onClick={() => setActiveTab('pending')}
                        className={`px-4 py-2 rounded-lg font-medium transition ${
                            activeTab === 'pending' 
                                ? 'bg-blue-600 text-white' 
                                : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                        }`}
                    >
                        في الانتظار
                    </button>
                    <button
                        onClick={() => setActiveTab('preparing')}
                        className={`px-4 py-2 rounded-lg font-medium transition ${
                            activeTab === 'preparing' 
                                ? 'bg-purple-600 text-white' 
                                : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                        }`}
                    >
                        جاري التحضير
                    </button>
                    <button
                        onClick={() => setActiveTab('ready')}
                        className={`px-4 py-2 rounded-lg font-medium transition ${
                            activeTab === 'ready' 
                                ? 'bg-green-600 text-white' 
                                : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                        }`}
                    >
                        جاهز للتوصيل
                    </button>
                </div>
            </div>

            <div className="flex">
                {/* Orders List */}
                <div className="w-1/3 border-l bg-white min-h-[calc(100vh-140px)] overflow-y-auto">
                    {loading ? (
                        <div className="flex items-center justify-center py-20">
                            <RefreshCw className="animate-spin text-gray-400" size={32} />
                        </div>
                    ) : orders.length === 0 ? (
                        <div className="text-center py-20 text-gray-500">
                            <Package size={48} className="mx-auto mb-4 opacity-50" />
                            <p>لا توجد طلبات</p>
                        </div>
                    ) : (
                        <div className="divide-y">
                            {orders.map(order => (
                                <div
                                    key={order.id}
                                    onClick={() => handleSelectOrder(order)}
                                    className={`p-4 cursor-pointer hover:bg-gray-50 transition ${
                                        selectedOrder?.id === order.id ? 'bg-blue-50 border-r-4 border-blue-500' : ''
                                    }`}
                                >
                                    <div className="flex justify-between items-start mb-2">
                                        <span className="font-bold text-gray-900">طلب #{order.id}</span>
                                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                                            ORDER_STATUS[order.status as keyof typeof ORDER_STATUS]?.color || 'bg-gray-100'
                                        }`}>
                                            {ORDER_STATUS[order.status as keyof typeof ORDER_STATUS]?.label || order.status}
                                        </span>
                                    </div>
                                    <p className="text-sm text-gray-600 mb-1">
                                        {order.customer_name || 'عميل'}
                                    </p>
                                    <p className="text-xs text-gray-400">
                                        {new Date(order.date).toLocaleString('ar-EG')}
                                    </p>
                                    <p className="text-sm font-bold text-green-600 mt-2">
                                        {Number(order.total || 0).toFixed(2)} جنيه
                                    </p>
                                </div>
                            ))}
                        </div>
                    )}
                </div>

                {/* Order Details */}
                <div className="flex-1 p-6">
                    {selectedOrder ? (
                        <div className="space-y-6">
                            {/* Order Header */}
                            <div className="bg-white rounded-xl p-6 shadow-sm">
                                <div className="flex justify-between items-start mb-4">
                                    <div>
                                        <h2 className="text-xl font-bold">طلب #{selectedOrder.id}</h2>
                                        <span className={`inline-block mt-2 px-3 py-1 rounded-full text-sm font-medium ${
                                            ORDER_STATUS[selectedOrder.status as keyof typeof ORDER_STATUS]?.color
                                        }`}>
                                            {ORDER_STATUS[selectedOrder.status as keyof typeof ORDER_STATUS]?.label}
                                        </span>
                                    </div>
                                    <div className="text-left">
                                        <p className="text-2xl font-bold text-green-600">
                                            {Number(selectedOrder.total || 0).toFixed(2)} جنيه
                                        </p>
                                        <p className="text-xs text-gray-400">
                                            {new Date(selectedOrder.date).toLocaleString('ar-EG')}
                                        </p>
                                    </div>
                                </div>

                                {/* Customer Info */}
                                {(() => {
                                    const shipping = getShippingInfo(selectedOrder);
                                    return shipping && (
                                        <div className="border-t pt-4 mt-4 grid grid-cols-2 gap-4">
                                            <div className="flex items-center gap-2">
                                                <User size={18} className="text-gray-400" />
                                                <span>{shipping.firstName} {shipping.lastName}</span>
                                            </div>
                                            <div className="flex items-center gap-2">
                                                <Phone size={18} className="text-gray-400" />
                                                <a href={`tel:${shipping.phone}`} className="text-blue-600">{shipping.phone}</a>
                                            </div>
                                            <div className="col-span-2 flex items-start gap-2">
                                                <MapPin size={18} className="text-gray-400 mt-1" />
                                                <span className="text-sm">{shipping.address}</span>
                                            </div>
                                            {shipping.coordinates && (
                                                <div className="col-span-2">
                                                    <a 
                                                        href={`https://maps.google.com/?q=${shipping.coordinates.lat},${shipping.coordinates.lng}`}
                                                        target="_blank"
                                                        rel="noopener noreferrer"
                                                        className="inline-flex items-center gap-1 text-blue-600 text-sm hover:underline"
                                                    >
                                                        <MapPin size={14} />
                                                        فتح الموقع على الخريطة
                                                    </a>
                                                </div>
                                            )}
                                        </div>
                                    );
                                })()}
                            </div>

                            {/* Actions based on status */}
                            {selectedOrder.status === 'confirmed' && (
                                <button
                                    onClick={() => handleStartPreparation(selectedOrder.id)}
                                    className="w-full py-4 bg-purple-600 text-white rounded-xl font-bold flex items-center justify-center gap-2 hover:bg-purple-700 transition"
                                >
                                    <Play size={20} />
                                    بدء تحضير الطلب
                                </button>
                            )}

                            {/* Preparation Todo List */}
                            {(selectedOrder.status === 'preparing' || selectedOrder.status === 'ready') && (
                                <div className="bg-white rounded-xl p-6 shadow-sm">
                                    <h3 className="font-bold text-lg mb-4 flex items-center gap-2">
                                        <List size={20} />
                                        قائمة التحضير
                                    </h3>
                                    
                                    {preparationItems.length === 0 ? (
                                        <p className="text-gray-500 text-center py-4">جاري تحميل العناصر...</p>
                                    ) : (
                                        <div className="space-y-3">
                                            {preparationItems.map(item => (
                                                <label
                                                    key={item.id}
                                                    className={`flex items-center gap-3 p-3 rounded-lg border cursor-pointer transition ${
                                                        item.is_prepared 
                                                            ? 'bg-green-50 border-green-200' 
                                                            : 'bg-white hover:bg-gray-50'
                                                    }`}
                                                >
                                                    <input
                                                        type="checkbox"
                                                        checked={item.is_prepared}
                                                        onChange={(e) => handleToggleItem(item.id, e.target.checked)}
                                                        className="w-5 h-5 rounded border-gray-300 text-green-600 focus:ring-green-500"
                                                        disabled={selectedOrder.status === 'ready'}
                                                    />
                                                    <div className="flex-1">
                                                        <span className={item.is_prepared ? 'line-through text-gray-400' : ''}>
                                                            {item.product_name}
                                                        </span>
                                                        <span className="text-gray-500 mr-2">× {item.quantity}</span>
                                                    </div>
                                                    {item.is_prepared && (
                                                        <CheckCircle size={20} className="text-green-500" />
                                                    )}
                                                </label>
                                            ))}
                                        </div>
                                    )}

                                    {selectedOrder.status === 'preparing' && preparationItems.length > 0 && (
                                        <button
                                            onClick={() => handleCompletePreparation(selectedOrder.id)}
                                            disabled={!allItemsPrepared}
                                            className={`w-full mt-4 py-3 rounded-xl font-bold flex items-center justify-center gap-2 transition ${
                                                allItemsPrepared
                                                    ? 'bg-green-600 text-white hover:bg-green-700'
                                                    : 'bg-gray-200 text-gray-400 cursor-not-allowed'
                                            }`}
                                        >
                                            <CheckCircle size={20} />
                                            {allItemsPrepared ? 'إتمام التحضير' : `متبقي ${preparationItems.filter(i => !i.is_prepared).length} عناصر`}
                                        </button>
                                    )}
                                </div>
                            )}

                            {/* Assign Delivery (when ready) */}
                            {selectedOrder.status === 'ready' && (
                                <div className="bg-white rounded-xl p-6 shadow-sm">
                                    <h3 className="font-bold text-lg mb-4 flex items-center gap-2">
                                        <Truck size={20} />
                                        تعيين ديليفري
                                    </h3>
                                    
                                    {availableDelivery.length === 0 ? (
                                        <p className="text-gray-500 text-center py-4">
                                            لا يوجد موظفي توصيل متاحين حالياً
                                        </p>
                                    ) : (
                                        <div className="space-y-3">
                                            {availableDelivery.map(staff => (
                                                <div
                                                    key={staff.id}
                                                    className="flex items-center justify-between p-3 border rounded-lg hover:bg-gray-50"
                                                >
                                                    <div>
                                                        <p className="font-medium">{staff.name}</p>
                                                        <p className="text-sm text-gray-500">
                                                            {staff.phone} • {staff.current_orders}/{staff.max_orders} طلبات
                                                        </p>
                                                    </div>
                                                    <button
                                                        onClick={() => handleAssignDelivery(selectedOrder.id, staff.id)}
                                                        className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition"
                                                    >
                                                        تعيين
                                                    </button>
                                                </div>
                                            ))}
                                        </div>
                                    )}
                                </div>
                            )}

                            {/* Order Items Preview */}
                            <div className="bg-white rounded-xl p-6 shadow-sm">
                                <h3 className="font-bold text-lg mb-4">عناصر الطلب</h3>
                                <div className="space-y-2">
                                    {getOrderItems(selectedOrder).map((item: any, idx: number) => (
                                        <div key={idx} className="flex justify-between items-center py-2 border-b last:border-0">
                                            <div>
                                                <span>{item.name || item.title}</span>
                                                <span className="text-gray-500 mr-2">× {item.quantity}</span>
                                            </div>
                                            <span className="font-medium">
                                                {((item.price || 0) * item.quantity).toFixed(2)} جنيه
                                            </span>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </div>
                    ) : (
                        <div className="flex items-center justify-center h-full text-gray-500">
                            <div className="text-center">
                                <Package size={64} className="mx-auto mb-4 opacity-30" />
                                <p>اختر طلباً لعرض التفاصيل</p>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default OrderDistributorPage;
