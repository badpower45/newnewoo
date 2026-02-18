import React, { useState, useEffect, useCallback, useRef } from 'react';
import { 
    Package, User, Phone, MapPin, Clock, CheckCircle, 
    Truck, Navigation, Copy, X, AlertCircle, Home,
    Building, FileText, DollarSign, RefreshCw, Timer,
    Star, TrendingUp, Award, ChevronRight, Bell, MapPinned,
    Sun, SunDim
} from 'lucide-react';
import { api } from '../services/api';
import { useAuth } from '../context/AuthContext';
import { socketService } from '../services/socketService';

// حالات الطلب للديليفري
const ORDER_STATUS: { [key: string]: { label: string; color: string; icon: any } } = {
    assigned: { label: 'طلب جديد - قبول؟', color: 'bg-yellow-100 text-yellow-700', icon: AlertCircle },
    accepted: { label: 'تم القبول - توجه للفرع', color: 'bg-blue-100 text-blue-700', icon: Truck },
    picked_up: { label: 'تم الاستلام - توجه للعميل', color: 'bg-purple-100 text-purple-700', icon: Package },
    arriving: { label: 'في انتظار العميل', color: 'bg-orange-100 text-orange-700', icon: Clock },
    delivered: { label: 'تم التوصيل', color: 'bg-green-100 text-green-700', icon: CheckCircle },
    rejected: { label: 'مرفوض', color: 'bg-red-100 text-red-700', icon: X },
};

const DeliveryDriverPage = () => {
    const { user } = useAuth();
    const [orders, setOrders] = useState<any[]>([]);
    const [selectedOrder, setSelectedOrder] = useState<any>(null);
    const [loading, setLoading] = useState(false);
    const [showRejectModal, setShowRejectModal] = useState(false);
    const [rejectReason, setRejectReason] = useState('');
    const [copied, setCopied] = useState(false);
    const [activeTab, setActiveTab] = useState<'orders' | 'stats'>('orders');
    const [stats, setStats] = useState<any>(null);
    const [driverStaffId, setDriverStaffId] = useState<number | null>(null);
    const [isTrackingLocation, setIsTrackingLocation] = useState(false);
    const [wakeLockActive, setWakeLockActive] = useState(false);
    const [newOrderAlert, setNewOrderAlert] = useState<any>(null);
    
    // GPS tracking ref
    const locationWatchId = useRef<number | null>(null);
    // Wake Lock ref
    const wakeLockRef = useRef<any>(null);

    // Countdown timers for accept deadline
    const [countdowns, setCountdowns] = useState<{ [key: number]: number }>({});

    useEffect(() => {
        loadMyOrders();
        loadStats();
        initializeSocket();
        
        return () => {
            // Cleanup GPS tracking
            if (locationWatchId.current !== null) {
                navigator.geolocation.clearWatch(locationWatchId.current);
            }
            // Release Wake Lock
            if (wakeLockRef.current) {
                wakeLockRef.current.release().catch(() => {});
            }
        };
    }, []);
    
    // Initialize Socket connection for real-time updates
    const initializeSocket = async () => {
        socketService.connect();
        
        // Get driver staff ID
        try {
            const res = await api.distribution.getDeliveryStats();
            if (res.data?.id) {
                setDriverStaffId(res.data.id);
                socketService.joinAsDriver(res.data.id, user?.id || 0);
            }
        } catch (err) {
            console.error('Failed to get driver ID:', err);
        }
        
        // Listen for new order assignments
        socketService.on('order:assigned', (data: any) => {
            console.log('🔔 New order assigned:', data);
            setNewOrderAlert(data);
            loadMyOrders(); // Reload orders
            
            // Play notification sound
            playNotificationSound();
            
            // Clear alert after 10 seconds
            setTimeout(() => setNewOrderAlert(null), 10000);
        });
    };
    
    // Play notification sound
    const playNotificationSound = () => {
        try {
            const audio = new Audio('/notification.mp3');
            audio.play().catch(() => {
                // Fallback: vibrate if sound fails
                if (navigator.vibrate) {
                    navigator.vibrate([200, 100, 200]);
                }
            });
        } catch (err) {
            console.log('Could not play notification sound');
        }
    };
    
    // Request Wake Lock to keep screen on
    const requestWakeLock = async () => {
        if (!('wakeLock' in navigator)) return;
        try {
            wakeLockRef.current = await (navigator as any).wakeLock.request('screen');
            setWakeLockActive(true);
            console.log('📱 Wake Lock نشط - الشاشة ستظل مضيئة');
            wakeLockRef.current.addEventListener('release', () => {
                setWakeLockActive(false);
                console.log('📱 Wake Lock انتهى');
            });
        } catch (err: any) {
            console.warn('Wake Lock غير متاح:', err.message);
        }
    };

    // Re-acquire Wake Lock when page becomes visible (after screen unlock)
    useEffect(() => {
        const handleVisibilityChange = async () => {
            if (document.visibilityState === 'visible' && isTrackingLocation && !wakeLockRef.current) {
                await requestWakeLock();
            }
        };
        document.addEventListener('visibilitychange', handleVisibilityChange);
        return () => document.removeEventListener('visibilitychange', handleVisibilityChange);
    }, [isTrackingLocation]);

    // Start GPS tracking
    const startLocationTracking = async () => {
        if (!navigator.geolocation) {
            alert('GPS غير مدعوم في هذا المتصفح');
            return;
        }

        // Request Wake Lock FIRST so screen stays on
        await requestWakeLock();
        
        setIsTrackingLocation(true);
        
        locationWatchId.current = navigator.geolocation.watchPosition(
            (position) => {
                const { latitude, longitude } = position.coords;
                
                // Send location to server via socket - always, not just when there's a selected order
                if (driverStaffId) {
                    socketService.updateDriverLocation(
                        driverStaffId,
                        latitude,
                        longitude,
                        selectedOrder?.id // orderId is optional
                    );
                }
            },
            (error) => {
                console.error('GPS Error:', error);
                if (error.code === error.PERMISSION_DENIED) {
                    alert('يرجى السماح بالوصول للموقع');
                    setIsTrackingLocation(false);
                    // Release wake lock if GPS fails
                    if (wakeLockRef.current) {
                        wakeLockRef.current.release().catch(() => {});
                        wakeLockRef.current = null;
                    }
                }
            },
            {
                enableHighAccuracy: true,
                maximumAge: 5000,
                timeout: 10000
            }
        );
    };
    
    // Stop GPS tracking
    const stopLocationTracking = () => {
        if (locationWatchId.current !== null) {
            navigator.geolocation.clearWatch(locationWatchId.current);
            locationWatchId.current = null;
        }
        setIsTrackingLocation(false);
        // Release Wake Lock
        if (wakeLockRef.current) {
            wakeLockRef.current.release().catch(() => {});
            wakeLockRef.current = null;
        }
        setWakeLockActive(false);
    };

    // Update countdowns every second
    useEffect(() => {
        const interval = setInterval(() => {
            const newCountdowns: { [key: number]: number } = {};
            orders.forEach(order => {
                if (order.assignment_status === 'assigned' && order.accept_deadline) {
                    const remaining = Math.max(0, new Date(order.accept_deadline).getTime() - Date.now());
                    newCountdowns[order.id] = Math.floor(remaining / 1000);
                    
                    // Auto-expire if time is up
                    if (remaining <= 0) {
                        handleExpireOrder(order.id);
                    }
                }
            });
            setCountdowns(newCountdowns);
        }, 1000);

        return () => clearInterval(interval);
    }, [orders]);

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

    const loadStats = async () => {
        try {
            const res = await api.distribution.getDeliveryStats();
            setStats(res.data);
            if (res.data?.id) {
                setDriverStaffId(res.data.id);
            }
        } catch (err) {
            console.error('Failed to load stats:', err);
        }
    };

    // Parse shipping info
    const getShippingInfo = (order: any) => {
        if (!order?.shipping_info) return null;
        return typeof order.shipping_info === 'string' 
            ? JSON.parse(order.shipping_info) 
            : order.shipping_info;
    };

    // فتح الموقع على Google Maps
    const openInMaps = (shipping: any, isBranch = false) => {
        if (isBranch && selectedOrder?.branch_maps_link) {
            window.open(selectedOrder.branch_maps_link, '_blank');
            return;
        }
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

    // Format countdown
    const formatCountdown = (seconds: number) => {
        const mins = Math.floor(seconds / 60);
        const secs = seconds % 60;
        return `${mins}:${secs.toString().padStart(2, '0')}`;
    };

    // ============================================
    // Action Handlers
    // ============================================

    // قبول الطلب خلال 5 دقائق
    const handleAcceptOrder = async (orderId: number) => {
        try {
            await api.distribution.acceptOrder(orderId);
            await loadMyOrders();
            if (selectedOrder?.id === orderId) {
                setSelectedOrder((prev: any) => ({ ...prev, assignment_status: 'accepted' }));
            }
        } catch (err: any) {
            console.error('Failed to accept order:', err);
            alert(err.response?.data?.error || 'فشل قبول الطلب');
        }
    };

    // انتهاء وقت القبول
    const handleExpireOrder = async (orderId: number) => {
        try {
            await api.distribution.expireOrder(orderId);
            await loadMyOrders();
            if (selectedOrder?.id === orderId) {
                setSelectedOrder(null);
            }
        } catch (err) {
            console.error('Failed to expire order:', err);
        }
    };

    // استلام الطلب من الفرع
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

    // وصلت للعميل - في الانتظار
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
            const res = await api.distribution.deliverOrder(orderId);
            await loadMyOrders();
            await loadStats();
            setSelectedOrder(null);
            alert(`تم تسليم الطلب بنجاح! 🎉\nوقت التوصيل: ${res.totalDeliveryTime || 0} دقيقة`);
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
            await loadStats();
            setSelectedOrder(null);
            setShowRejectModal(false);
            setRejectReason('');
        } catch (err) {
            console.error('Failed to reject order:', err);
            alert('فشل رفض الطلب');
        }
    };

    // ============================================
    // Status Buttons
    // ============================================

    const getStatusButtons = (order: any) => {
        const status = order.assignment_status || 'assigned';
        const countdown = countdowns[order.id];
        
        switch (status) {
            case 'assigned':
                return (
                    <div className="space-y-3">
                        {/* Countdown Timer */}
                        <div className="bg-yellow-50 border border-yellow-200 rounded-xl p-4 text-center">
                            <div className="flex items-center justify-center gap-2 text-yellow-700 mb-2">
                                <Timer size={20} />
                                <span className="font-bold">وقت القبول المتبقي</span>
                            </div>
                            <div className={`text-3xl font-bold ${countdown && countdown < 60 ? 'text-red-600 animate-pulse' : 'text-yellow-700'}`}>
                                {countdown ? formatCountdown(countdown) : '00:00'}
                            </div>
                        </div>
                        
                        <button
                            onClick={() => handleAcceptOrder(order.id)}
                            className="w-full py-4 bg-green-600 text-white rounded-xl font-bold flex items-center justify-center gap-2 hover:bg-green-700 transition text-lg"
                        >
                            <CheckCircle size={24} />
                            قبول الطلب
                        </button>
                    </div>
                );
            
            case 'accepted':
                return (
                    <div className="space-y-3">
                        {/* Branch Info */}
                        {order.branch_name && (
                            <div className="bg-blue-50 border border-blue-200 rounded-xl p-4">
                                <div className="flex items-center gap-2 text-blue-700 mb-2">
                                    <Building size={18} />
                                    <span className="font-bold">توجه للفرع</span>
                                </div>
                                <p className="text-lg font-bold text-blue-800">{order.branch_name}</p>
                                {order.branch_address && (
                                    <p className="text-sm text-blue-600 mt-1">{order.branch_address}</p>
                                )}
                                {order.branch_maps_link && (
                                    <button
                                        onClick={() => openInMaps(null, true)}
                                        className="mt-3 w-full py-2 bg-blue-600 text-white rounded-lg flex items-center justify-center gap-2"
                                    >
                                        <Navigation size={16} />
                                        فتح موقع الفرع
                                    </button>
                                )}
                            </div>
                        )}
                        
                        <button
                            onClick={() => handlePickup(order.id)}
                            className="w-full py-4 bg-purple-600 text-white rounded-xl font-bold flex items-center justify-center gap-2 hover:bg-purple-700 transition"
                        >
                            <Package size={20} />
                            تم استلام الطلب من الفرع
                        </button>
                    </div>
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
                            className="w-full py-4 bg-green-600 text-white rounded-xl font-bold flex items-center justify-center gap-2 hover:bg-green-700 transition text-lg"
                        >
                            <CheckCircle size={24} />
                            تم التوصيل ✓
                        </button>
                        <button
                            onClick={() => setShowRejectModal(true)}
                            className="w-full py-3 bg-red-100 text-red-600 rounded-xl font-bold flex items-center justify-center gap-2 hover:bg-red-200 transition"
                        >
                            <X size={20} />
                            العميل لم يستلم - رفض الطلب
                        </button>
                    </div>
                );
            
            default:
                return null;
        }
    };

    // ============================================
    // Stats Tab
    // ============================================

    const renderStatsTab = () => {
        if (!stats) {
            return (
                <div className="flex items-center justify-center py-20">
                    <RefreshCw className="animate-spin text-gray-400" size={32} />
                </div>
            );
        }

        return (
            <div className="p-4 space-y-4">
                {/* Summary Cards */}
                <div className="grid grid-cols-2 gap-3">
                    <div className="bg-white rounded-xl p-4 shadow-sm text-center">
                        <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-2">
                            <Truck size={24} className="text-green-600" />
                        </div>
                        <p className="text-2xl font-bold text-gray-900">{stats.totalDeliveries || 0}</p>
                        <p className="text-xs text-gray-500">إجمالي التوصيلات</p>
                    </div>
                    
                    <div className="bg-white rounded-xl p-4 shadow-sm text-center">
                        <div className="w-12 h-12 bg-yellow-100 rounded-full flex items-center justify-center mx-auto mb-2">
                            <Star size={24} className="text-yellow-600" />
                        </div>
                        <p className="text-2xl font-bold text-gray-900">{(stats.averageRating || 0).toFixed(1)}</p>
                        <p className="text-xs text-gray-500">متوسط التقييم</p>
                    </div>
                    
                    <div className="bg-white rounded-xl p-4 shadow-sm text-center">
                        <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-2">
                            <Clock size={24} className="text-blue-600" />
                        </div>
                        <p className="text-2xl font-bold text-gray-900">{stats.averageDeliveryTime || 0}</p>
                        <p className="text-xs text-gray-500">متوسط وقت التوصيل (دقيقة)</p>
                    </div>
                    
                    <div className="bg-white rounded-xl p-4 shadow-sm text-center">
                        <div className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-2">
                            <X size={24} className="text-red-600" />
                        </div>
                        <p className="text-2xl font-bold text-gray-900">{stats.rejectedOrders || 0}</p>
                        <p className="text-xs text-gray-500">طلبات مرفوضة</p>
                    </div>
                </div>

                {/* Recent Ratings */}
                {stats.recentRatings && stats.recentRatings.length > 0 && (
                    <div className="bg-white rounded-xl p-4 shadow-sm">
                        <h3 className="font-bold text-gray-900 mb-3 flex items-center gap-2">
                            <Star size={18} className="text-yellow-500" />
                            آخر التقييمات
                        </h3>
                        <div className="space-y-3">
                            {stats.recentRatings.map((rating: any, idx: number) => (
                                <div key={idx} className="flex items-center justify-between py-2 border-b last:border-0">
                                    <div className="flex items-center gap-2">
                                        <span className="text-sm text-gray-500">طلب #{rating.order_id}</span>
                                    </div>
                                    <div className="flex items-center gap-1">
                                        {[1, 2, 3, 4, 5].map(star => (
                                            <Star
                                                key={star}
                                                size={16}
                                                className={star <= rating.delivery_rating ? 'text-yellow-500 fill-current' : 'text-gray-300'}
                                            />
                                        ))}
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                )}
            </div>
        );
    };

    return (
        <div className="min-h-screen bg-gray-100">
            {/* New Order Alert */}
            {newOrderAlert && (
                <div className="fixed top-4 left-1/2 transform -translate-x-1/2 z-50 bg-green-600 text-white px-6 py-4 rounded-2xl shadow-2xl animate-bounce max-w-sm">
                    <div className="flex items-center gap-3">
                        <Bell size={24} className="animate-pulse" />
                        <div>
                            <p className="font-bold">🔔 طلب جديد!</p>
                            <p className="text-sm opacity-90">{newOrderAlert.message}</p>
                        </div>
                    </div>
                </div>
            )}
            
            {/* Header */}
            <div className="bg-indigo-600 text-white px-4 py-6">
                <div className="flex justify-between items-center">
                    <div>
                        <h1 className="text-xl font-bold">لوحة الديليفري</h1>
                        <p className="text-indigo-200 text-sm">{user?.name || 'الديليفري'}</p>
                    </div>
                    <div className="flex items-center gap-2">
                        {/* GPS + Wake Lock Toggle Button */}
                        <button 
                            onClick={isTrackingLocation ? stopLocationTracking : startLocationTracking}
                            className={`p-2 rounded-lg flex items-center gap-1 text-sm ${
                                isTrackingLocation 
                                    ? 'bg-green-500 hover:bg-green-400' 
                                    : 'bg-indigo-500 hover:bg-indigo-400'
                            }`}
                            title={isTrackingLocation ? 'إيقاف التتبع' : 'تفعيل التتبع'}
                        >
                            <MapPinned size={18} className={isTrackingLocation ? 'animate-pulse' : ''} />
                            {isTrackingLocation ? 'GPS ✓' : 'GPS'}
                        </button>

                        {/* Wake Lock Indicator */}
                        {isTrackingLocation && (
                            <div 
                                className={`p-2 rounded-lg flex items-center gap-1 text-xs ${
                                    wakeLockActive 
                                        ? 'bg-yellow-400 text-yellow-900' 
                                        : 'bg-indigo-500 text-white opacity-60'
                                }`}
                                title={wakeLockActive ? 'الشاشة مضيئة دائماً' : 'لا يوجد Wake Lock'}
                            >
                                <Sun size={16} className={wakeLockActive ? 'animate-pulse' : ''} />
                                {wakeLockActive ? 'شاشة مضيئة' : 'لا توجد'}
                            </div>
                        )}
                        
                        <button 
                            onClick={() => { loadMyOrders(); loadStats(); }}
                            className="p-2 bg-indigo-500 rounded-lg hover:bg-indigo-400"
                        >
                            <RefreshCw size={20} className={loading ? 'animate-spin' : ''} />
                        </button>
                    </div>
                </div>
                
                {/* Stats Preview */}
                {stats && (
                    <div className="flex items-center gap-4 mt-4 text-sm">
                        <div className="flex items-center gap-1">
                            <Star size={16} className="text-yellow-400" />
                            <span>{(stats.averageRating || 0).toFixed(1)}</span>
                        </div>
                        <div className="flex items-center gap-1">
                            <Truck size={16} />
                            <span>{stats.totalDeliveries || 0} توصيلة</span>
                        </div>
                        <div className="flex items-center gap-1">
                            <Package size={16} />
                            <span>{stats.currentOrders || 0}/{stats.maxOrders || 5} حالي</span>
                        </div>
                    </div>
                )}
            </div>

            {/* Tabs */}
            <div className="bg-white border-b flex">
                <button
                    onClick={() => setActiveTab('orders')}
                    className={`flex-1 py-3 text-center font-medium transition ${
                        activeTab === 'orders' 
                            ? 'text-indigo-600 border-b-2 border-indigo-600' 
                            : 'text-gray-500'
                    }`}
                >
                    الطلبات الحالية
                    {orders.length > 0 && (
                        <span className="ml-2 px-2 py-0.5 bg-indigo-100 text-indigo-700 rounded-full text-xs">
                            {orders.length}
                        </span>
                    )}
                </button>
                <button
                    onClick={() => setActiveTab('stats')}
                    className={`flex-1 py-3 text-center font-medium transition ${
                        activeTab === 'stats' 
                            ? 'text-indigo-600 border-b-2 border-indigo-600' 
                            : 'text-gray-500'
                    }`}
                >
                    إحصائياتي
                </button>
            </div>

            {/* Content */}
            {activeTab === 'stats' ? renderStatsTab() : (
                <div className="p-4">
                    {loading ? (
                        <div className="flex items-center justify-center py-20">
                            <RefreshCw className="animate-spin text-gray-400" size={32} />
                        </div>
                    ) : orders.length === 0 ? (
                        <div className="text-center py-20 text-gray-500">
                            <Truck size={64} className="mx-auto mb-4 opacity-30" />
                            <p className="text-lg">لا توجد طلبات حالياً</p>
                            <p className="text-sm mt-2">سيتم إشعارك عند وصول طلب جديد</p>
                        </div>
                    ) : (
                        <div className="space-y-4">
                            {orders.map(order => {
                                const shipping = getShippingInfo(order);
                                const status = order.assignment_status || 'assigned';
                                const statusInfo = ORDER_STATUS[status];
                                const countdown = countdowns[order.id];
                                
                                return (
                                    <div
                                        key={order.id}
                                        onClick={() => setSelectedOrder(order)}
                                        className={`bg-white rounded-2xl p-4 shadow-sm cursor-pointer transition ${
                                            selectedOrder?.id === order.id ? 'ring-2 ring-indigo-500' : ''
                                        } ${status === 'assigned' ? 'border-2 border-yellow-400' : ''}`}
                                    >
                                        {/* Countdown bar for new orders */}
                                        {status === 'assigned' && countdown !== undefined && (
                                            <div className="mb-3">
                                                <div className="flex justify-between text-xs text-yellow-700 mb-1">
                                                    <span>وقت القبول المتبقي</span>
                                                    <span className={countdown < 60 ? 'text-red-600 font-bold' : ''}>
                                                        {formatCountdown(countdown)}
                                                    </span>
                                                </div>
                                                <div className="h-2 bg-yellow-100 rounded-full overflow-hidden">
                                                    <div 
                                                        className={`h-full transition-all duration-1000 ${
                                                            countdown < 60 ? 'bg-red-500' : 'bg-yellow-500'
                                                        }`}
                                                        style={{ width: `${Math.min(100, (countdown / 300) * 100)}%` }}
                                                    />
                                                </div>
                                            </div>
                                        )}

                                        <div className="flex justify-between items-start mb-3">
                                            <div>
                                                <span className="font-bold text-lg">طلب #{order.id}</span>
                                                <span className={`mr-2 px-2 py-1 rounded-full text-xs font-medium ${statusInfo?.color || 'bg-gray-100'}`}>
                                                    {statusInfo?.label || status}
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
                                                    <a href={`tel:${shipping.phone}`} className="text-blue-600" onClick={e => e.stopPropagation()}>
                                                        {shipping.phone}
                                                    </a>
                                                </div>
                                            </div>
                                        )}
                                        
                                        <div className="flex items-center justify-end mt-3 text-indigo-600">
                                            <span className="text-sm">عرض التفاصيل</span>
                                            <ChevronRight size={16} />
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    )}
                </div>
            )}

            {/* Order Details Modal */}
            {selectedOrder && (
                <div className="fixed inset-0 bg-black/50 z-50 flex items-end justify-center">
                    <div className="bg-white rounded-t-3xl w-full max-w-lg max-h-[90vh] overflow-y-auto animate-slide-up">
                        {/* Modal Header */}
                        <div className="sticky top-0 bg-white border-b px-4 py-4 flex justify-between items-center">
                            <div>
                                <h2 className="text-xl font-bold">طلب #{selectedOrder.id}</h2>
                                <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                                    ORDER_STATUS[selectedOrder.assignment_status]?.color || 'bg-gray-100'
                                }`}>
                                    {ORDER_STATUS[selectedOrder.assignment_status]?.label || selectedOrder.assignment_status}
                                </span>
                            </div>
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
                                <p className="text-sm text-green-600 mb-1">المبلغ المطلوب تحصيله</p>
                                <p className="text-3xl font-bold text-green-700">
                                    {Number(selectedOrder.total || 0).toFixed(2)} ج.م
                                </p>
                                <p className="text-xs text-green-500 mt-1">
                                    {selectedOrder.payment_method === 'cod' ? '💵 الدفع عند الاستلام' : selectedOrder.payment_method}
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
                        <p className="text-sm text-gray-500 mb-4">
                            الطلب سيرجع للموزع ليتم تعيينه لديليفري آخر
                        </p>
                        <textarea
                            value={rejectReason}
                            onChange={(e) => setRejectReason(e.target.value)}
                            placeholder="مثال: العميل غير متواجد، العنوان خاطئ..."
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
