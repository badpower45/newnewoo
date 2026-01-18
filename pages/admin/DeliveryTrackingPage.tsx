import React, { useState, useEffect } from 'react';
import { Navigation, MapPin, Phone, User, Package, Clock, Battery, Wifi, WifiOff, RefreshCw } from 'lucide-react';

interface DeliveryLocation {
    delivery_staff_id: number;
    order_id: number;
    latitude: number;
    longitude: number;
    accuracy: number;
    speed: number;
    heading: number;
    battery_level: number;
    is_online: boolean;
    last_update: string;
    seconds_since_update: number;
    order_status: string;
    customer_id: number;
    delivery_address: string;
    delivery_latitude: number;
    delivery_longitude: number;
    staff_name: string;
    staff_phone: string;
    customer_name: string;
    customer_phone: string;
}

export default function DeliveryTrackingPage() {
    const [deliveries, setDeliveries] = useState<DeliveryLocation[]>([]);
    const [loading, setLoading] = useState(true);
    const [selectedDelivery, setSelectedDelivery] = useState<DeliveryLocation | null>(null);

    useEffect(() => {
        loadDeliveries();
        const interval = setInterval(loadDeliveries, 10000); // Refresh every 10 seconds
        return () => clearInterval(interval);
    }, []);

    const loadDeliveries = async () => {
        try {
            // هذا endpoint محتاج يتعمل في الـ backend
            // للآن هنستخدم placeholder data
            setLoading(false);
            
            // Placeholder: في الإنتاج، هيكون:
            // const res = await fetch(`${API_URL}/delivery-tracking/active`);
            // const data = await res.json();
            // setDeliveries(data.data || []);
        } catch (err) {
            console.error('Error loading deliveries:', err);
            setLoading(false);
        }
    };

    const getStatusColor = (status: string) => {
        switch (status) {
            case 'out_for_delivery': return 'bg-blue-100 text-blue-800';
            case 'preparing': return 'bg-yellow-100 text-yellow-800';
            case 'delivered': return 'bg-green-100 text-green-800';
            default: return 'bg-gray-100 text-gray-800';
        }
    };

    const getStatusText = (status: string) => {
        switch (status) {
            case 'out_for_delivery': return 'في الطريق';
            case 'preparing': return 'قيد التحضير';
            case 'delivered': return 'تم التوصيل';
            default: return status;
        }
    };

    const formatTime = (seconds: number) => {
        if (seconds < 60) return `${seconds} ثانية`;
        if (seconds < 3600) return `${Math.floor(seconds / 60)} دقيقة`;
        return `${Math.floor(seconds / 3600)} ساعة`;
    };

    return (
        <div className="p-6">
            <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-3">
                    <Navigation className="text-blue-600" size={32} />
                    <div>
                        <h1 className="text-2xl font-bold text-gray-800">تتبع التوصيل المباشر</h1>
                        <p className="text-gray-600">Live Delivery Tracking</p>
                    </div>
                </div>
                <button
                    onClick={loadDeliveries}
                    className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700"
                >
                    <RefreshCw size={20} />
                    تحديث
                </button>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-4 gap-4 mb-6">
                <div className="bg-blue-50 rounded-lg p-4">
                    <div className="flex items-center gap-2 text-blue-600 mb-2">
                        <Navigation size={20} />
                        <span className="font-medium">في الطريق</span>
                    </div>
                    <div className="text-2xl font-bold text-blue-800">
                        {deliveries.filter(d => d.order_status === 'out_for_delivery').length}
                    </div>
                </div>
                <div className="bg-yellow-50 rounded-lg p-4">
                    <div className="flex items-center gap-2 text-yellow-600 mb-2">
                        <Package size={20} />
                        <span className="font-medium">قيد التحضير</span>
                    </div>
                    <div className="text-2xl font-bold text-yellow-800">
                        {deliveries.filter(d => d.order_status === 'preparing').length}
                    </div>
                </div>
                <div className="bg-green-50 rounded-lg p-4">
                    <div className="flex items-center gap-2 text-green-600 mb-2">
                        <Wifi size={20} />
                        <span className="font-medium">متصل</span>
                    </div>
                    <div className="text-2xl font-bold text-green-800">
                        {deliveries.filter(d => d.is_online).length}
                    </div>
                </div>
                <div className="bg-red-50 rounded-lg p-4">
                    <div className="flex items-center gap-2 text-red-600 mb-2">
                        <WifiOff size={20} />
                        <span className="font-medium">غير متصل</span>
                    </div>
                    <div className="text-2xl font-bold text-red-800">
                        {deliveries.filter(d => !d.is_online).length}
                    </div>
                </div>
            </div>

            {/* Content */}
            {loading ? (
                <div className="bg-white rounded-lg shadow-md p-8 text-center">
                    <RefreshCw className="animate-spin mx-auto mb-4 text-blue-600" size={32} />
                    <p className="text-gray-600">جاري تحميل البيانات...</p>
                </div>
            ) : deliveries.length === 0 ? (
                <div className="bg-white rounded-lg shadow-md p-8 text-center">
                    <Navigation className="mx-auto mb-4 text-gray-400" size={48} />
                    <h3 className="text-xl font-bold text-gray-800 mb-2">لا يوجد توصيلات نشطة حالياً</h3>
                    <p className="text-gray-600">
                        لم يتم العثور على أي طلبات قيد التوصيل في الوقت الحالي
                    </p>
                    <div className="mt-6 p-4 bg-blue-50 rounded-lg">
                        <h4 className="font-bold text-blue-800 mb-2">📌 ملاحظة:</h4>
                        <p className="text-sm text-blue-700">
                            سيستم التتبع المباشر يحتاج إلى:
                        </p>
                        <ul className="text-sm text-blue-700 text-right mt-2 space-y-1">
                            <li>• تطبيق Migration: <code className="bg-blue-100 px-2 py-1 rounded">create_delivery_tracking.sql</code></li>
                            <li>• إضافة Backend endpoints للتتبع</li>
                            <li>• تطبيق موبايل للمندوبين لإرسال الموقع</li>
                        </ul>
                    </div>
                </div>
            ) : (
                <div className="grid gap-4">
                    {deliveries.map((delivery) => (
                        <div key={delivery.order_id} className="bg-white rounded-lg shadow-md p-4">
                            <div className="flex items-start justify-between mb-3">
                                <div className="flex-1">
                                    <div className="flex items-center gap-2 mb-2">
                                        <span className={`px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(delivery.order_status)}`}>
                                            {getStatusText(delivery.order_status)}
                                        </span>
                                        {delivery.is_online ? (
                                            <span className="flex items-center gap-1 text-green-600 text-sm">
                                                <Wifi size={14} /> متصل
                                            </span>
                                        ) : (
                                            <span className="flex items-center gap-1 text-red-600 text-sm">
                                                <WifiOff size={14} /> غير متصل
                                            </span>
                                        )}
                                    </div>
                                    <h3 className="font-bold text-lg mb-1">طلب #{delivery.order_id}</h3>
                                    <p className="text-gray-600 text-sm flex items-center gap-1">
                                        <MapPin size={14} />
                                        {delivery.delivery_address}
                                    </p>
                                </div>
                                <div className="flex items-center gap-2">
                                    {delivery.battery_level && (
                                        <div className="flex items-center gap-1 text-sm">
                                            <Battery size={16} className={delivery.battery_level < 20 ? 'text-red-600' : 'text-gray-600'} />
                                            <span>{delivery.battery_level}%</span>
                                        </div>
                                    )}
                                </div>
                            </div>

                            <div className="grid grid-cols-2 gap-4 pt-3 border-t">
                                <div>
                                    <div className="flex items-center gap-2 text-gray-600 mb-2">
                                        <User size={16} />
                                        <span className="font-medium">المندوب</span>
                                    </div>
                                    <p className="font-bold">{delivery.staff_name}</p>
                                    <p className="text-sm text-gray-600 flex items-center gap-1">
                                        <Phone size={12} />
                                        {delivery.staff_phone}
                                    </p>
                                </div>
                                <div>
                                    <div className="flex items-center gap-2 text-gray-600 mb-2">
                                        <User size={16} />
                                        <span className="font-medium">العميل</span>
                                    </div>
                                    <p className="font-bold">{delivery.customer_name}</p>
                                    <p className="text-sm text-gray-600 flex items-center gap-1">
                                        <Phone size={12} />
                                        {delivery.customer_phone}
                                    </p>
                                </div>
                            </div>

                            <div className="mt-3 pt-3 border-t flex items-center justify-between text-sm">
                                <div className="flex items-center gap-4">
                                    {delivery.speed > 0 && (
                                        <span className="text-gray-600">
                                            السرعة: <span className="font-bold">{delivery.speed.toFixed(1)}</span> كم/س
                                        </span>
                                    )}
                                    <span className="text-gray-600">
                                        الدقة: <span className="font-bold">{delivery.accuracy.toFixed(0)}</span> م
                                    </span>
                                </div>
                                <div className="flex items-center gap-1 text-gray-500">
                                    <Clock size={14} />
                                    آخر تحديث منذ {formatTime(delivery.seconds_since_update)}
                                </div>
                            </div>

                            <div className="mt-3 pt-3 border-t">
                                <button
                                    onClick={() => window.open(`https://www.google.com/maps?q=${delivery.latitude},${delivery.longitude}`, '_blank')}
                                    className="w-full bg-blue-600 text-white py-2 rounded-lg hover:bg-blue-700 flex items-center justify-center gap-2"
                                >
                                    <MapPin size={18} />
                                    عرض الموقع على الخريطة
                                </button>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}
