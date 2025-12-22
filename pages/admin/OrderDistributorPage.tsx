import React, { useState, useEffect } from 'react';
import { 
    Package, User, Phone, MapPin, Clock, CheckCircle, 
    Truck, Play, List, ChevronDown, ChevronUp, RefreshCw,
    Navigation, Star, Timer, AlertCircle, Eye, Activity
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

// حالات تعيين الديليفري
const ASSIGNMENT_STATUS: { [key: string]: { label: string; color: string; icon: any } } = {
    assigned: { label: 'في انتظار القبول', color: 'bg-yellow-100 text-yellow-700', icon: Timer },
    accepted: { label: 'تم القبول - متوجه للفرع', color: 'bg-blue-100 text-blue-700', icon: Navigation },
    picked_up: { label: 'استلم الطلب - متوجه للعميل', color: 'bg-purple-100 text-purple-700', icon: Truck },
    arriving: { label: 'وصل - في انتظار العميل', color: 'bg-orange-100 text-orange-700', icon: Clock },
    delivered: { label: 'تم التوصيل', color: 'bg-green-100 text-green-700', icon: CheckCircle },
    rejected: { label: 'مرفوض', color: 'bg-red-100 text-red-700', icon: AlertCircle },
    expired: { label: 'انتهى الوقت', color: 'bg-gray-100 text-gray-600', icon: Clock },
};

const OrderDistributorPage = () => {
    const { selectedBranch } = useBranch();
    const [orders, setOrders] = useState<any[]>([]);
    const [selectedOrder, setSelectedOrder] = useState<any>(null);
    const [preparationItems, setPreparationItems] = useState<any[]>([]);
    const [availableDelivery, setAvailableDelivery] = useState<any[]>([]);
    const [loading, setLoading] = useState(false);
    const [activeTab, setActiveTab] = useState<'pending' | 'preparing' | 'ready' | 'tracking'>('pending');
    
    // Delivery tracking state
    const [activeDeliveries, setActiveDeliveries] = useState<any[]>([]);
    const [deliveryStaffList, setDeliveryStaffList] = useState<any[]>([]);
    const [selectedDeliveryStaff, setSelectedDeliveryStaff] = useState<any>(null);
    const [countdowns, setCountdowns] = useState<{ [key: number]: number }>({});
    
    // Assignment modal state
    const [showAssignModal, setShowAssignModal] = useState(false);
    const [selectedStaff, setSelectedStaff] = useState<any>(null);
    const [acceptTimeout, setAcceptTimeout] = useState(5); // دقائق
    const [expectedDeliveryTime, setExpectedDeliveryTime] = useState(30); // دقائق

    useEffect(() => {
        if (activeTab === 'tracking') {
            loadActiveDeliveries();
            loadDeliveryStaffList();
        } else {
            loadOrders();
        }
        
        // Auto-refresh every 30 seconds
        const refreshInterval = setInterval(() => {
            console.log('🔄 Auto-refreshing orders...');
            if (activeTab === 'tracking') {
                loadActiveDeliveries();
                loadDeliveryStaffList();
            } else {
                loadOrders();
            }
        }, 30000); // 30 seconds
        
        return () => clearInterval(refreshInterval);
    }, [selectedBranch, activeTab]);
    
    // Update countdowns every second
    useEffect(() => {
        const interval = setInterval(() => {
            const newCountdowns: { [key: number]: number } = {};
            activeDeliveries.forEach(delivery => {
                if (delivery.assignment_status === 'assigned' && delivery.accept_deadline) {
                    const remaining = Math.max(0, new Date(delivery.accept_deadline).getTime() - Date.now());
                    newCountdowns[delivery.order_id] = Math.floor(remaining / 1000);
                }
            });
            setCountdowns(newCountdowns);
        }, 1000);

        return () => clearInterval(interval);
    }, [activeDeliveries]);

    const loadOrders = async () => {
        setLoading(true);
        try {
            const statusMap: { [key: string]: string } = {
                pending: 'pending',
                preparing: 'preparing',
                ready: 'ready',
                tracking: 'out_for_delivery'
            };
            console.log('📦 Loading orders for tab:', activeTab, 'status:', statusMap[activeTab], 'branch:', selectedBranch?.id);
            
            let ordersData: any[] = [];
            
            // Use admin API that doesn't require auth
            try {
                const res = await api.orders.getAllAdmin(statusMap[activeTab], selectedBranch?.id);
                console.log('📦 Admin Orders API response:', res);
                const data = res?.data ?? res;
                ordersData = Array.isArray(data) ? data : [];
                console.log('📦 Loaded', ordersData.length, 'orders for status:', statusMap[activeTab]);
            } catch (err) {
                console.error('❌ Admin Orders API failed:', err);
                // Fallback to regular orders API
                try {
                    const res = await api.orders.getAll();
                    const allOrders = Array.isArray(res?.data) ? res.data : (Array.isArray(res) ? res : []);
                    ordersData = allOrders.filter((o: any) => o.status === statusMap[activeTab]);
                    if (selectedBranch?.id) {
                        ordersData = ordersData.filter((o: any) => o.branch_id === selectedBranch.id || !o.branch_id);
                    }
                } catch (fallbackErr) {
                    console.error('❌ Fallback also failed:', fallbackErr);
                }
            }
            
            setOrders(ordersData);
        } catch (err) {
            console.error('Failed to load orders:', err);
        }
        setLoading(false);
    };
    
    // Load all active deliveries with their current status
    const loadActiveDeliveries = async () => {
        setLoading(true);
        try {
            const res = await api.distribution.getActiveDeliveries(selectedBranch?.id);
            setActiveDeliveries(res.data || []);
        } catch (err) {
            console.error('Failed to load active deliveries:', err);
        }
        setLoading(false);
    };
    
    // Load all delivery staff with their stats
    const loadDeliveryStaffList = async () => {
        try {
            const res = await api.distribution.getAllDeliveryStaff(selectedBranch?.id);
            setDeliveryStaffList(res.data || []);
        } catch (err) {
            console.error('Failed to load delivery staff:', err);
        }
    };
    
    // Format countdown
    const formatCountdown = (seconds: number) => {
        const mins = Math.floor(seconds / 60);
        const secs = seconds % 60;
        return `${mins}:${secs.toString().padStart(2, '0')}`;
    };
    
    // Format time difference
    const formatTimeDiff = (date: string) => {
        const diff = Math.floor((Date.now() - new Date(date).getTime()) / 1000 / 60);
        if (diff < 1) return 'الآن';
        if (diff < 60) return `منذ ${diff} دقيقة`;
        return `منذ ${Math.floor(diff / 60)} ساعة`;
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

    // تأكيد الطلب (من pending إلى confirmed)
    const handleConfirmOrder = async (orderId: number) => {
        try {
            await api.orders.updateStatus(orderId.toString(), 'confirmed');
            await loadOrders();
            if (selectedOrder?.id === orderId) {
                setSelectedOrder((prev: any) => prev ? { ...prev, status: 'confirmed' } : null);
            }
        } catch (err) {
            console.error('Failed to confirm order:', err);
            alert('فشل تأكيد الطلب');
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

    const openAssignModal = (staff: any) => {
        setSelectedStaff(staff);
        setShowAssignModal(true);
    };

    const handleAssignDelivery = async () => {
        if (!selectedOrder || !selectedStaff) return;
        
        try {
            await api.distribution.assignDelivery(
                selectedOrder.id, 
                selectedStaff.id,
                acceptTimeout,
                expectedDeliveryTime
            );
            await loadOrders();
            setSelectedOrder(null);
            setShowAssignModal(false);
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
                    <button
                        onClick={() => setActiveTab('tracking')}
                        className={`px-4 py-2 rounded-lg font-medium transition flex items-center gap-2 ${
                            activeTab === 'tracking' 
                                ? 'bg-indigo-600 text-white' 
                                : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                        }`}
                    >
                        <Activity size={16} />
                        تتبع الديليفري
                        {activeDeliveries.length > 0 && (
                            <span className="px-1.5 py-0.5 bg-white/20 rounded-full text-xs">
                                {activeDeliveries.length}
                            </span>
                        )}
                    </button>
                </div>
            </div>

            {/* Tracking Tab Content */}
            {activeTab === 'tracking' ? (
                <div className="flex">
                    {/* Delivery Staff List */}
                    <div className="w-1/3 border-l bg-white min-h-[calc(100vh-140px)] overflow-y-auto">
                        <div className="p-4 border-b bg-gray-50">
                            <h3 className="font-bold text-gray-900">موظفي التوصيل</h3>
                            <p className="text-xs text-gray-500">{deliveryStaffList.length} موظف</p>
                        </div>
                        
                        {loading ? (
                            <div className="flex items-center justify-center py-20">
                                <RefreshCw className="animate-spin text-gray-400" size={32} />
                            </div>
                        ) : deliveryStaffList.length === 0 ? (
                            <div className="text-center py-20 text-gray-500">
                                <Truck size={48} className="mx-auto mb-4 opacity-50" />
                                <p>لا يوجد موظفي توصيل</p>
                            </div>
                        ) : (
                            <div className="divide-y">
                                {deliveryStaffList.map(staff => {
                                    const activeOrders = activeDeliveries.filter(d => d.delivery_staff_id === staff.id);
                                    return (
                                        <div
                                            key={staff.id}
                                            onClick={() => setSelectedDeliveryStaff(staff)}
                                            className={`p-4 cursor-pointer hover:bg-gray-50 transition ${
                                                selectedDeliveryStaff?.id === staff.id ? 'bg-indigo-50 border-r-4 border-indigo-500' : ''
                                            }`}
                                        >
                                            <div className="flex items-center justify-between mb-2">
                                                <div className="flex items-center gap-2">
                                                    <div className={`w-3 h-3 rounded-full ${staff.is_available ? 'bg-green-500' : 'bg-gray-400'}`} />
                                                    <span className="font-bold">{staff.name}</span>
                                                </div>
                                                {staff.average_rating > 0 && (
                                                    <div className="flex items-center gap-1 text-yellow-500">
                                                        <Star size={14} className="fill-current" />
                                                        <span className="text-sm">{parseFloat(staff.average_rating).toFixed(1)}</span>
                                                    </div>
                                                )}
                                            </div>
                                            <div className="text-sm text-gray-500 space-y-1">
                                                <p>{staff.phone}</p>
                                                <div className="flex items-center gap-4">
                                                    <span className="flex items-center gap-1">
                                                        <Package size={12} />
                                                        {activeOrders.length} طلب نشط
                                                    </span>
                                                    <span className="flex items-center gap-1">
                                                        <CheckCircle size={12} />
                                                        {staff.total_deliveries || 0} إجمالي
                                                    </span>
                                                </div>
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>
                        )}
                    </div>

                    {/* Active Deliveries Panel */}
                    <div className="flex-1 p-6 overflow-y-auto max-h-[calc(100vh-140px)]">
                        <div className="flex items-center justify-between mb-6">
                            <h2 className="text-xl font-bold">
                                {selectedDeliveryStaff ? `طلبات ${selectedDeliveryStaff.name}` : 'جميع الطلبات النشطة'}
                            </h2>
                            <button
                                onClick={() => { loadActiveDeliveries(); loadDeliveryStaffList(); }}
                                className="flex items-center gap-2 px-4 py-2 bg-indigo-100 text-indigo-700 rounded-lg hover:bg-indigo-200"
                            >
                                <RefreshCw size={16} className={loading ? 'animate-spin' : ''} />
                                تحديث
                            </button>
                        </div>

                        {/* Filter by staff if selected */}
                        {(() => {
                            const filteredDeliveries = selectedDeliveryStaff
                                ? activeDeliveries.filter(d => d.delivery_staff_id === selectedDeliveryStaff.id)
                                : activeDeliveries;

                            if (filteredDeliveries.length === 0) {
                                return (
                                    <div className="text-center py-20 text-gray-500">
                                        <Truck size={64} className="mx-auto mb-4 opacity-30" />
                                        <p>لا توجد طلبات نشطة</p>
                                    </div>
                                );
                            }

                            return (
                                <div className="grid gap-4">
                                    {filteredDeliveries.map(delivery => {
                                        const status = ASSIGNMENT_STATUS[delivery.assignment_status] || ASSIGNMENT_STATUS.assigned;
                                        const StatusIcon = status.icon;
                                        const countdown = countdowns[delivery.order_id];
                                        const shipping = delivery.shipping_info 
                                            ? (typeof delivery.shipping_info === 'string' ? JSON.parse(delivery.shipping_info) : delivery.shipping_info)
                                            : null;

                                        return (
                                            <div key={delivery.id} className="bg-white rounded-xl p-5 shadow-sm border">
                                                {/* Header */}
                                                <div className="flex items-start justify-between mb-4">
                                                    <div>
                                                        <div className="flex items-center gap-3">
                                                            <span className="text-lg font-bold">طلب #{delivery.order_id}</span>
                                                            <span className={`px-3 py-1 rounded-full text-xs font-medium flex items-center gap-1 ${status.color}`}>
                                                                <StatusIcon size={14} />
                                                                {status.label}
                                                            </span>
                                                        </div>
                                                        <p className="text-sm text-gray-500 mt-1">
                                                            الديليفري: <span className="font-medium">{delivery.staff_name}</span>
                                                        </p>
                                                    </div>
                                                    <span className="text-xl font-bold text-green-600">
                                                        {Number(delivery.total || 0).toFixed(0)} ج.م
                                                    </span>
                                                </div>

                                                {/* Countdown for pending acceptance */}
                                                {delivery.assignment_status === 'assigned' && countdown !== undefined && (
                                                    <div className="mb-4 p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
                                                        <div className="flex items-center justify-between">
                                                            <div className="flex items-center gap-2 text-yellow-700">
                                                                <Timer size={18} />
                                                                <span className="font-medium">في انتظار قبول الديليفري</span>
                                                            </div>
                                                            <span className={`text-xl font-bold ${countdown < 60 ? 'text-red-600 animate-pulse' : 'text-yellow-700'}`}>
                                                                {formatCountdown(countdown)}
                                                            </span>
                                                        </div>
                                                        <div className="h-2 bg-yellow-100 rounded-full mt-2 overflow-hidden">
                                                            <div 
                                                                className={`h-full transition-all duration-1000 ${countdown < 60 ? 'bg-red-500' : 'bg-yellow-500'}`}
                                                                style={{ width: `${Math.min(100, (countdown / 300) * 100)}%` }}
                                                            />
                                                        </div>
                                                    </div>
                                                )}

                                                {/* Timeline */}
                                                <div className="mb-4 p-3 bg-gray-50 rounded-lg">
                                                    <div className="grid grid-cols-4 gap-2 text-center text-xs">
                                                        <div className={delivery.accepted_at ? 'text-green-600' : 'text-gray-400'}>
                                                            <CheckCircle size={16} className="mx-auto mb-1" />
                                                            <span>قبول</span>
                                                            {delivery.accepted_at && (
                                                                <p className="text-[10px]">{formatTimeDiff(delivery.accepted_at)}</p>
                                                            )}
                                                        </div>
                                                        <div className={delivery.picked_up_at ? 'text-green-600' : 'text-gray-400'}>
                                                            <Package size={16} className="mx-auto mb-1" />
                                                            <span>استلام</span>
                                                            {delivery.picked_up_at && (
                                                                <p className="text-[10px]">{formatTimeDiff(delivery.picked_up_at)}</p>
                                                            )}
                                                        </div>
                                                        <div className={delivery.customer_arrived_at ? 'text-green-600' : 'text-gray-400'}>
                                                            <Navigation size={16} className="mx-auto mb-1" />
                                                            <span>وصول</span>
                                                            {delivery.customer_arrived_at && (
                                                                <p className="text-[10px]">{formatTimeDiff(delivery.customer_arrived_at)}</p>
                                                            )}
                                                        </div>
                                                        <div className={delivery.delivered_at ? 'text-green-600' : 'text-gray-400'}>
                                                            <CheckCircle size={16} className="mx-auto mb-1" />
                                                            <span>تسليم</span>
                                                            {delivery.delivered_at && (
                                                                <p className="text-[10px]">{formatTimeDiff(delivery.delivered_at)}</p>
                                                            )}
                                                        </div>
                                                    </div>
                                                </div>

                                                {/* Customer Info */}
                                                {shipping && (
                                                    <div className="flex items-center justify-between text-sm">
                                                        <div className="flex items-center gap-4">
                                                            <span className="flex items-center gap-1 text-gray-600">
                                                                <User size={14} />
                                                                {shipping.firstName} {shipping.lastName}
                                                            </span>
                                                            <a href={`tel:${shipping.phone}`} className="flex items-center gap-1 text-blue-600">
                                                                <Phone size={14} />
                                                                {shipping.phone}
                                                            </a>
                                                        </div>
                                                        {shipping.coordinates && (
                                                            <a
                                                                href={`https://maps.google.com/?q=${shipping.coordinates.lat},${shipping.coordinates.lng}`}
                                                                target="_blank"
                                                                rel="noopener noreferrer"
                                                                className="flex items-center gap-1 text-indigo-600 hover:underline"
                                                            >
                                                                <MapPin size={14} />
                                                                الموقع
                                                            </a>
                                                        )}
                                                    </div>
                                                )}

                                                {/* Time stats for delivered */}
                                                {delivery.assignment_status === 'delivered' && delivery.total_delivery_time && (
                                                    <div className="mt-3 pt-3 border-t flex items-center gap-4 text-sm text-gray-600">
                                                        <span>⏱️ وقت التوصيل: {delivery.total_delivery_time} دقيقة</span>
                                                        {delivery.delivery_rating && (
                                                            <span className="flex items-center gap-1 text-yellow-600">
                                                                <Star size={14} className="fill-current" />
                                                                {delivery.delivery_rating}
                                                            </span>
                                                        )}
                                                    </div>
                                                )}
                                            </div>
                                        );
                                    })}
                                </div>
                            );
                        })()}
                    </div>
                </div>
            ) : (
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
                            {selectedOrder.status === 'pending' && (
                                <button
                                    onClick={() => handleConfirmOrder(selectedOrder.id)}
                                    className="w-full py-4 bg-green-600 text-white rounded-xl font-bold flex items-center justify-center gap-2 hover:bg-green-700 transition"
                                >
                                    <CheckCircle size={20} />
                                    تأكيد الطلب
                                </button>
                            )}

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
                                                        onClick={() => openAssignModal(staff)}
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
            )}
            
            {/* Assignment Time Modal */}
            {showAssignModal && selectedStaff && (
                <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
                    <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full p-6">
                        <div className="flex items-center justify-between mb-6">
                            <h3 className="text-xl font-bold">تعيين موظف توصيل</h3>
                            <button
                                onClick={() => setShowAssignModal(false)}
                                className="text-gray-400 hover:text-gray-600"
                            >
                                ✕
                            </button>
                        </div>
                        
                        {/* Staff Info */}
                        <div className="bg-indigo-50 rounded-xl p-4 mb-6">
                            <div className="flex items-center gap-3 mb-2">
                                <User className="text-indigo-600" size={20} />
                                <span className="font-bold text-lg">{selectedStaff.name}</span>
                            </div>
                            <div className="flex items-center gap-3 text-sm text-gray-600">
                                <Phone size={16} />
                                <span>{selectedStaff.phone}</span>
                            </div>
                            <div className="mt-2 text-sm text-gray-600">
                                الطلبات الحالية: {selectedStaff.current_orders}/{selectedStaff.max_orders}
                            </div>
                        </div>

                        {/* Accept Timeout */}
                        <div className="mb-6">
                            <label className="flex items-center gap-2 text-sm font-medium text-gray-700 mb-3">
                                <Timer size={18} className="text-orange-600" />
                                مهلة قبول الطلب (دقائق)
                            </label>
                            <div className="flex items-center gap-3">
                                <button
                                    onClick={() => setAcceptTimeout(Math.max(1, acceptTimeout - 1))}
                                    className="w-10 h-10 rounded-lg bg-gray-100 hover:bg-gray-200 font-bold"
                                >
                                    −
                                </button>
                                <div className="flex-1 text-center">
                                    <div className="text-3xl font-bold text-orange-600">{acceptTimeout}</div>
                                    <div className="text-xs text-gray-500">دقيقة</div>
                                </div>
                                <button
                                    onClick={() => setAcceptTimeout(Math.min(30, acceptTimeout + 1))}
                                    className="w-10 h-10 rounded-lg bg-gray-100 hover:bg-gray-200 font-bold"
                                >
                                    +
                                </button>
                            </div>
                            <div className="mt-2 text-xs text-gray-500 text-center">
                                الموظف لديه {acceptTimeout} دقائق لقبول الطلب
                            </div>
                        </div>

                        {/* Expected Delivery Time */}
                        <div className="mb-6">
                            <label className="flex items-center gap-2 text-sm font-medium text-gray-700 mb-3">
                                <Truck size={18} className="text-green-600" />
                                الوقت المتوقع للتوصيل (دقائق)
                            </label>
                            <div className="flex items-center gap-3">
                                <button
                                    onClick={() => setExpectedDeliveryTime(Math.max(10, expectedDeliveryTime - 5))}
                                    className="w-10 h-10 rounded-lg bg-gray-100 hover:bg-gray-200 font-bold"
                                >
                                    −
                                </button>
                                <div className="flex-1 text-center">
                                    <div className="text-3xl font-bold text-green-600">{expectedDeliveryTime}</div>
                                    <div className="text-xs text-gray-500">دقيقة</div>
                                </div>
                                <button
                                    onClick={() => setExpectedDeliveryTime(Math.min(120, expectedDeliveryTime + 5))}
                                    className="w-10 h-10 rounded-lg bg-gray-100 hover:bg-gray-200 font-bold"
                                >
                                    +
                                </button>
                            </div>
                            <div className="mt-2 text-xs text-gray-500 text-center">
                                الوقت المتوقع لوصول الطلب للعميل
                            </div>
                        </div>

                        {/* Summary */}
                        <div className="bg-blue-50 rounded-xl p-4 mb-6">
                            <div className="text-sm space-y-2">
                                <div className="flex justify-between">
                                    <span className="text-gray-600">مهلة القبول:</span>
                                    <span className="font-bold">{acceptTimeout} دقائق</span>
                                </div>
                                <div className="flex justify-between">
                                    <span className="text-gray-600">وقت التوصيل:</span>
                                    <span className="font-bold">{expectedDeliveryTime} دقيقة</span>
                                </div>
                                <div className="flex justify-between border-t pt-2">
                                    <span className="text-gray-600">الوقت الإجمالي:</span>
                                    <span className="font-bold text-blue-600">{acceptTimeout + expectedDeliveryTime} دقيقة</span>
                                </div>
                            </div>
                        </div>

                        {/* Action Buttons */}
                        <div className="flex gap-3">
                            <button
                                onClick={() => setShowAssignModal(false)}
                                className="flex-1 px-6 py-3 border border-gray-300 rounded-xl font-medium hover:bg-gray-50 transition"
                            >
                                إلغاء
                            </button>
                            <button
                                onClick={handleAssignDelivery}
                                className="flex-1 px-6 py-3 bg-indigo-600 text-white rounded-xl font-bold hover:bg-indigo-700 transition flex items-center justify-center gap-2"
                            >
                                <CheckCircle size={20} />
                                تأكيد التعيين
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default OrderDistributorPage;
