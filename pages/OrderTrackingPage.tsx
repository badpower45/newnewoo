import React, { useEffect, useState, useRef } from 'react';
import { useParams } from 'react-router-dom';
import { api } from '../services/api';
import { socketService } from '../services/socketService';
import { useAuth } from '../context/AuthContext';
import LoadingSpinner from '../components/LoadingSpinner';
import ErrorMessage from '../components/ErrorMessage';
import { ORDER_STATUS_LABELS } from '../src/config';
import { 
    MapPin, Phone, User, Truck, Package, Clock, 
    CheckCircle, AlertCircle, Navigation, Star 
} from 'lucide-react';

const statuses = ['pending', 'confirmed', 'preparing', 'ready', 'assigned_to_delivery', 'out_for_delivery', 'arriving', 'delivered'] as const;

const STATUS_INFO: { [key: string]: { label: string; color: string; icon: any; description: string } } = {
    pending: { label: 'بانتظار التأكيد', color: 'bg-yellow-500', icon: Clock, description: 'طلبك قيد المراجعة' },
    confirmed: { label: 'تم التأكيد', color: 'bg-blue-500', icon: CheckCircle, description: 'تم تأكيد طلبك' },
    preparing: { label: 'جاري التحضير', color: 'bg-purple-500', icon: Package, description: 'يتم تحضير طلبك الآن' },
    ready: { label: 'جاهز للتوصيل', color: 'bg-green-500', icon: CheckCircle, description: 'طلبك جاهز وبانتظار السائق' },
    assigned_to_delivery: { label: 'تم تعيين سائق', color: 'bg-indigo-500', icon: Truck, description: 'تم تعيين سائق لطلبك' },
    out_for_delivery: { label: 'في الطريق', color: 'bg-indigo-600', icon: Truck, description: 'السائق في الطريق إليك' },
    arriving: { label: 'السائق وصل', color: 'bg-orange-500', icon: MapPin, description: 'السائق وصل - في انتظارك' },
    delivered: { label: 'تم التوصيل', color: 'bg-green-600', icon: CheckCircle, description: 'تم توصيل طلبك بنجاح!' },
};

const OrderTrackingPage: React.FC = () => {
    const { orderId } = useParams();
    const { user } = useAuth();
    const [order, setOrder] = useState<any>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [driverLocation, setDriverLocation] = useState<{ lat: number; lng: number } | null>(null);
    const [statusMessage, setStatusMessage] = useState<string>('');
    const [showRatingModal, setShowRatingModal] = useState(false);
    const [rating, setRating] = useState(5);
    const [ratingComment, setRatingComment] = useState('');
    
    const mapRef = useRef<HTMLDivElement>(null);

    const fetchOrder = async () => {
        if (!orderId) return;
        setLoading(true);
        setError(null);
        try {
            const data = await api.orders.getOne(orderId);
            setOrder(data.data || data);
        } catch (err) {
            setError('تعذر تحميل تفاصيل الطلب');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchOrder();
        initializeSocket();
        
        return () => {
            // Cleanup socket listeners
            if (orderId && user?.id) {
                socketService.untrackOrder(parseInt(orderId), user.id);
            }
        };
    }, [orderId]);
    
    const initializeSocket = () => {
        socketService.connect();
        
        // Start tracking order
        if (orderId && user?.id) {
            socketService.trackOrder(parseInt(orderId), user.id);
        }
        
        // Listen for status updates
        socketService.on('order:status:update', (data: any) => {
            console.log('📦 Order status update:', data);
            if (data.orderId === parseInt(orderId || '0')) {
                setStatusMessage(data.message);
                fetchOrder(); // Reload order data
                
                // Show rating modal if delivered
                if (data.status === 'delivered') {
                    setTimeout(() => setShowRatingModal(true), 2000);
                }
            }
        });
        
        // Listen for driver location updates
        socketService.on('driver:location:update', (data: any) => {
            console.log('📍 Driver location:', data);
            setDriverLocation({ lat: data.lat, lng: data.lng });
        });
    };
    
    const submitRating = async () => {
        try {
            await api.distribution.rateDelivery(parseInt(orderId || '0'), {
                orderRating: rating,
                deliveryRating: rating,
                speedRating: rating,
                comment: ratingComment
            });
            setShowRatingModal(false);
            alert('شكراً لتقييمك! 🌟');
        } catch (err) {
            console.error('Failed to submit rating:', err);
            alert('فشل إرسال التقييم');
        }
    };

    if (loading) return <LoadingSpinner fullScreen message="جاري تحميل التتبع..." />;
    if (error) return <ErrorMessage fullScreen message={error} onRetry={fetchOrder} />;

    const currentStatus = order?.status || 'pending';
    const currentStatusIndex = statuses.indexOf(currentStatus as any);
    const statusInfo = STATUS_INFO[currentStatus] || STATUS_INFO.pending;
    const StatusIcon = statusInfo.icon;

    // Parse shipping info
    const shippingInfo = order?.shipping_info 
        ? (typeof order.shipping_info === 'string' ? JSON.parse(order.shipping_info) : order.shipping_info)
        : null;

    return (
        <div className="min-h-screen bg-gray-50 pb-20">
            {/* Status Message Toast */}
            {statusMessage && (
                <div className="fixed top-4 left-1/2 transform -translate-x-1/2 z-50 bg-indigo-600 text-white px-6 py-3 rounded-full shadow-lg animate-bounce">
                    {statusMessage}
                </div>
            )}
            
            <div className="max-w-3xl mx-auto p-4">
                {/* Current Status Card */}
                <div className={`${statusInfo.color} rounded-2xl p-6 text-white mb-6 shadow-lg`}>
                    <div className="flex items-center justify-between mb-4">
                        <div>
                            <p className="text-white/80 text-sm">طلب #{order?.id}</p>
                            <h1 className="text-2xl font-bold">{statusInfo.label}</h1>
                        </div>
                        <StatusIcon size={48} className="opacity-80" />
                    </div>
                    <p className="text-white/90">{statusInfo.description}</p>
                    
                    {/* Estimated Time */}
                    {currentStatus !== 'delivered' && order?.expected_delivery_time && (
                        <div className="mt-4 flex items-center gap-2 bg-white/20 rounded-lg px-4 py-2">
                            <Clock size={18} />
                            <span>الوقت المتوقع: {order.expected_delivery_time} دقيقة</span>
                        </div>
                    )}
                </div>
                
                {/* Driver Info (when assigned) */}
                {order?.delivery_name && ['assigned_to_delivery', 'out_for_delivery', 'arriving'].includes(currentStatus) && (
                    <div className="bg-white rounded-2xl p-6 shadow-sm border mb-6">
                        <h2 className="font-bold text-lg mb-4 flex items-center gap-2">
                            <Truck size={20} className="text-indigo-600" />
                            بيانات السائق
                        </h2>
                        <div className="flex items-center justify-between">
                            <div className="flex items-center gap-4">
                                <div className="w-14 h-14 bg-indigo-100 rounded-full flex items-center justify-center">
                                    <User size={28} className="text-indigo-600" />
                                </div>
                                <div>
                                    <p className="font-semibold text-lg">{order.delivery_name}</p>
                                    <p className="text-gray-500 text-sm">سائق التوصيل</p>
                                </div>
                            </div>
                            <a 
                                href={`tel:${order.delivery_phone}`}
                                className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center hover:bg-green-200 transition"
                            >
                                <Phone size={24} className="text-green-600" />
                            </a>
                        </div>
                        
                        {/* Live Driver Location */}
                        {driverLocation && (
                            <div className="mt-4 p-4 bg-indigo-50 rounded-xl">
                                <div className="flex items-center justify-between">
                                    <div className="flex items-center gap-2 text-indigo-700">
                                        <Navigation size={18} className="animate-pulse" />
                                        <span className="font-medium">تتبع مباشر</span>
                                    </div>
                                    <a 
                                        href={`https://www.google.com/maps?q=${driverLocation.lat},${driverLocation.lng}`}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="text-indigo-600 text-sm underline"
                                    >
                                        فتح في الخريطة
                                    </a>
                                </div>
                                {/* Map placeholder - يمكن إضافة خريطة حقيقية هنا */}
                                <div 
                                    ref={mapRef}
                                    className="mt-3 h-40 bg-gray-200 rounded-lg flex items-center justify-center"
                                >
                                    <div className="text-center text-gray-500">
                                        <MapPin size={32} className="mx-auto mb-2 text-red-500" />
                                        <p className="text-sm">موقع السائق: {driverLocation.lat.toFixed(6)}, {driverLocation.lng.toFixed(6)}</p>
                                    </div>
                                </div>
                            </div>
                        )}
                    </div>
                )}

                {/* Progress Timeline */}
                <div className="bg-white rounded-2xl shadow-sm border p-6">
                    <h2 className="font-bold text-lg mb-6">مراحل الطلب</h2>
                    
                    <div className="relative">
                        <div className="absolute right-4 top-0 bottom-0 w-1 bg-gray-200 rounded-full" />
                        <ul className="space-y-4">
                            {statuses.map((st, index) => {
                                const isActive = index <= currentStatusIndex;
                                const isCurrent = st === currentStatus;
                                const info = STATUS_INFO[st] || { label: st, color: 'bg-gray-400', icon: AlertCircle, description: '' };
                                const Icon = info.icon;
                                const description = info.description || '';
                                
                                return (
                                    <li key={st} className="relative pr-12">
                                        <div className={`absolute right-0 top-1 w-8 h-8 rounded-full flex items-center justify-center transition-all ${
                                            isCurrent ? `${info.color} text-white ring-4 ring-offset-2 ring-${info.color.replace('bg-', '')}/30` :
                                            isActive ? 'bg-green-500 text-white' : 'bg-gray-200 text-gray-400'
                                        }`}>
                                            {isActive ? <Icon size={16} /> : <span className="w-2 h-2 bg-white rounded-full" />}
                                        </div>
                                        <div className={`rounded-xl p-4 transition-all ${
                                            isCurrent ? 'bg-indigo-50 border-2 border-indigo-200' : 'bg-gray-50 border border-gray-100'
                                        }`}>
                                            <div className={`font-semibold ${isCurrent ? 'text-indigo-700' : isActive ? 'text-gray-900' : 'text-gray-400'}`}>
                                                {info.label}
                                            </div>
                                            {isCurrent && description && (
                                                <p className="text-sm text-indigo-600 mt-1">{description}</p>
                                            )}
                                        </div>
                                    </li>
                                );
                            })}
                        </ul>
                    </div>
                </div>
                
                {/* Order Summary */}
                <div className="bg-white rounded-2xl shadow-sm border p-6 mt-6">
                    <h2 className="font-bold text-lg mb-4">ملخص الطلب</h2>
                    <div className="space-y-3 text-gray-600">
                        <div className="flex justify-between">
                            <span>إجمالي الطلب</span>
                            <span className="font-bold text-green-600">{Number(order?.total || 0).toFixed(2)} جنيه</span>
                        </div>
                        <div className="flex justify-between">
                            <span>طريقة الدفع</span>
                            <span>{order?.payment_method === 'cod' ? 'الدفع عند الاستلام' : 'دفع إلكتروني'}</span>
                        </div>
                        {shippingInfo && (
                            <div className="pt-3 border-t">
                                <p className="font-medium text-gray-900 mb-1">عنوان التوصيل</p>
                                <p className="text-sm">{shippingInfo.address}</p>
                                {shippingInfo.apartment && <p className="text-sm">شقة: {shippingInfo.apartment}</p>}
                            </div>
                        )}
                    </div>
                </div>
            </div>
            
            {/* Rating Modal */}
            {showRatingModal && (
                <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
                    <div className="bg-white rounded-2xl p-6 max-w-md w-full">
                        <h2 className="text-xl font-bold text-center mb-4">كيف كانت تجربة التوصيل؟ 🌟</h2>
                        
                        {/* Star Rating */}
                        <div className="flex justify-center gap-2 mb-6">
                            {[1, 2, 3, 4, 5].map(star => (
                                <button
                                    key={star}
                                    onClick={() => setRating(star)}
                                    className="transition-transform hover:scale-110"
                                >
                                    <Star 
                                        size={40} 
                                        className={star <= rating ? 'fill-yellow-400 text-yellow-400' : 'text-gray-300'}
                                    />
                                </button>
                            ))}
                        </div>
                        
                        {/* Comment */}
                        <textarea
                            value={ratingComment}
                            onChange={(e) => setRatingComment(e.target.value)}
                            placeholder="أضف تعليق (اختياري)"
                            className="w-full border rounded-xl p-3 mb-4 resize-none"
                            rows={3}
                        />
                        
                        <div className="flex gap-3">
                            <button
                                onClick={() => setShowRatingModal(false)}
                                className="flex-1 py-3 border rounded-xl hover:bg-gray-50"
                            >
                                لاحقاً
                            </button>
                            <button
                                onClick={submitRating}
                                className="flex-1 py-3 bg-indigo-600 text-white rounded-xl hover:bg-indigo-700"
                            >
                                إرسال التقييم
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default OrderTrackingPage;
