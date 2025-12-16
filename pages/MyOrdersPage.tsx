import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { 
    Package, Clock, CheckCircle, Truck, XCircle, 
    ChevronLeft, ShoppingBag, MapPin, Calendar,
    RefreshCw, Eye, Phone, Star, X, MessageSquare
} from 'lucide-react';
import Footer from '../components/Footer';
import { api } from '../services/api';
import { useAuth } from '../context/AuthContext';

// حالات الطلب مع الألوان والأيقونات
const ORDER_STATUS: { [key: string]: { label: string; color: string; bgColor: string; icon: any } } = {
    pending: { 
        label: 'في الانتظار', 
        color: 'text-yellow-600', 
        bgColor: 'bg-yellow-100',
        icon: Clock 
    },
    confirmed: { 
        label: 'تم التأكيد', 
        color: 'text-blue-600', 
        bgColor: 'bg-blue-100',
        icon: CheckCircle 
    },
    preparing: { 
        label: 'جاري التحضير', 
        color: 'text-orange-600', 
        bgColor: 'bg-orange-100',
        icon: Package 
    },
    ready: { 
        label: 'جاهز للتوصيل', 
        color: 'text-purple-600', 
        bgColor: 'bg-purple-100',
        icon: Package 
    },
    out_for_delivery: { 
        label: 'في الطريق', 
        color: 'text-indigo-600', 
        bgColor: 'bg-indigo-100',
        icon: Truck 
    },
    arriving: { 
        label: 'وصل الديليفري', 
        color: 'text-cyan-600', 
        bgColor: 'bg-cyan-100',
        icon: MapPin 
    },
    delivered: { 
        label: 'تم التوصيل', 
        color: 'text-green-600', 
        bgColor: 'bg-green-100',
        icon: CheckCircle 
    },
    cancelled: { 
        label: 'ملغي', 
        color: 'text-red-600', 
        bgColor: 'bg-red-100',
        icon: XCircle 
    }
};

const MyOrdersPage = () => {
    const { user } = useAuth();
    const [orders, setOrders] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [activeFilter, setActiveFilter] = useState<'all' | 'active' | 'completed'>('all');
    const [selectedOrder, setSelectedOrder] = useState<any>(null);
    
    // Rating modal state
    const [showRatingModal, setShowRatingModal] = useState(false);
    const [ratingOrder, setRatingOrder] = useState<any>(null);
    const [orderRating, setOrderRating] = useState(5);
    const [deliveryRating, setDeliveryRating] = useState(5);
    const [speedRating, setSpeedRating] = useState(5);
    const [ratingComment, setRatingComment] = useState('');
    const [submittingRating, setSubmittingRating] = useState(false);
    
    // Pending ratings popup
    const [pendingRatingOrder, setPendingRatingOrder] = useState<any>(null);

    useEffect(() => {
        if (user && !user.isGuest) {
            loadOrders();
            checkPendingRatings();
        } else {
            setLoading(false);
        }
    }, [user]);
    
    // Check for pending ratings (15 minutes after delivery)
    const checkPendingRatings = async () => {
        try {
            const res = await api.distribution.checkPendingRatings();
            if (res.data && res.data.length > 0) {
                // Show popup for the first pending rating
                setPendingRatingOrder(res.data[0]);
            }
        } catch (err) {
            console.error('Failed to check pending ratings:', err);
        }
    };

    const loadOrders = async () => {
        setLoading(true);
        try {
            const res = await api.orders.getAll();
            const ordersList = res.data || [];
            // Sort by date descending
            ordersList.sort((a: any, b: any) => new Date(b.date).getTime() - new Date(a.date).getTime());
            setOrders(ordersList);
        } catch (err) {
            console.error('Failed to load orders:', err);
        }
        setLoading(false);
    };
    
    // Open rating modal
    const openRatingModal = (order: any) => {
        setRatingOrder(order);
        setOrderRating(5);
        setDeliveryRating(5);
        setSpeedRating(5);
        setRatingComment('');
        setShowRatingModal(true);
    };
    
    // Submit rating
    const submitRating = async () => {
        if (!ratingOrder) return;
        
        setSubmittingRating(true);
        try {
            await api.distribution.rateDelivery(ratingOrder.id, {
                orderRating,
                deliveryRating,
                speedRating,
                comment: ratingComment
            });
            
            setShowRatingModal(false);
            setPendingRatingOrder(null);
            setRatingOrder(null);
            
            // Reload orders to update rating status
            await loadOrders();
            
            alert('شكراً لك! تم إرسال التقييم بنجاح 🎉');
        } catch (err) {
            console.error('Failed to submit rating:', err);
            alert('فشل إرسال التقييم، حاول مرة أخرى');
        }
        setSubmittingRating(false);
    };
    
    // Star rating component
    const StarRating = ({ value, onChange, label }: { value: number; onChange: (v: number) => void; label: string }) => (
        <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-2">{label}</label>
            <div className="flex gap-1">
                {[1, 2, 3, 4, 5].map(star => (
                    <button
                        key={star}
                        type="button"
                        onClick={() => onChange(star)}
                        className="p-1 transition-transform hover:scale-110"
                    >
                        <Star 
                            size={32} 
                            className={star <= value ? 'text-yellow-400 fill-current' : 'text-gray-300'}
                        />
                    </button>
                ))}
            </div>
        </div>
    );

    // فلترة الطلبات
    const filteredOrders = orders.filter(order => {
        if (activeFilter === 'active') {
            return !['delivered', 'cancelled'].includes(order.status);
        }
        if (activeFilter === 'completed') {
            return ['delivered', 'cancelled'].includes(order.status);
        }
        return true;
    });

    // Parse items
    const getOrderItems = (order: any) => {
        if (!order?.items) return [];
        return typeof order.items === 'string' ? JSON.parse(order.items) : order.items;
    };

    // Format date
    const formatDate = (dateStr: string) => {
        const date = new Date(dateStr);
        return date.toLocaleDateString('ar-EG', {
            year: 'numeric',
            month: 'short',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        });
    };

    // Get status info
    const getStatusInfo = (status: string) => {
        return ORDER_STATUS[status] || ORDER_STATUS.pending;
    };

    return (
        <div className="min-h-screen bg-gray-50 pb-24">
            {/* Header */}
            <div className="bg-white border-b sticky top-0 z-20">
                <div className="max-w-4xl mx-auto px-4 py-4">
                    <div className="flex items-center justify-between mb-4">
                        <div className="flex items-center gap-3">
                            <Link to="/profile" className="p-2 -ml-2 hover:bg-gray-100 rounded-full">
                                <ChevronLeft size={24} />
                            </Link>
                            <h1 className="text-xl font-bold text-gray-900">طلباتي</h1>
                        </div>
                        <button 
                            onClick={loadOrders}
                            className="p-2 hover:bg-gray-100 rounded-full"
                        >
                            <RefreshCw size={20} className={loading ? 'animate-spin' : ''} />
                        </button>
                    </div>

                    {/* Filters */}
                    <div className="flex gap-2">
                        <button
                            onClick={() => setActiveFilter('all')}
                            className={`px-4 py-2 rounded-full text-sm font-medium transition ${
                                activeFilter === 'all'
                                    ? 'bg-primary text-white'
                                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                            }`}
                        >
                            الكل ({orders.length})
                        </button>
                        <button
                            onClick={() => setActiveFilter('active')}
                            className={`px-4 py-2 rounded-full text-sm font-medium transition ${
                                activeFilter === 'active'
                                    ? 'bg-orange-500 text-white'
                                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                            }`}
                        >
                            نشطة ({orders.filter(o => !['delivered', 'cancelled'].includes(o.status)).length})
                        </button>
                        <button
                            onClick={() => setActiveFilter('completed')}
                            className={`px-4 py-2 rounded-full text-sm font-medium transition ${
                                activeFilter === 'completed'
                                    ? 'bg-green-500 text-white'
                                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                            }`}
                        >
                            مكتملة ({orders.filter(o => ['delivered', 'cancelled'].includes(o.status)).length})
                        </button>
                    </div>
                </div>
            </div>

            {/* Orders List */}
            <div className="max-w-4xl mx-auto px-4 py-6">
                {/* Show login prompt for guests */}
                {(!user || user.isGuest) ? (
                    <div className="text-center py-16">
                        <Package size={64} className="mx-auto text-gray-300 mb-4" />
                        <h3 className="text-lg font-medium text-gray-800 mb-2">سجل دخولك لعرض طلباتك</h3>
                        <p className="text-gray-500 mb-4">
                            لمتابعة طلباتك وتتبعها، يرجى تسجيل الدخول أولاً
                        </p>
                        <Link 
                            to="/login"
                            className="inline-flex items-center gap-2 bg-primary text-white px-6 py-3 rounded-full font-medium hover:bg-primary-dark transition"
                        >
                            تسجيل الدخول
                        </Link>
                    </div>
                ) : loading ? (
                    <div className="space-y-4">
                        {[...Array(3)].map((_, i) => (
                            <div key={i} className="bg-white rounded-2xl p-4 animate-pulse">
                                <div className="flex justify-between mb-4">
                                    <div className="h-6 bg-gray-200 rounded w-24" />
                                    <div className="h-6 bg-gray-200 rounded w-20" />
                                </div>
                                <div className="h-4 bg-gray-200 rounded w-full mb-2" />
                                <div className="h-4 bg-gray-200 rounded w-2/3" />
                            </div>
                        ))}
                    </div>
                ) : filteredOrders.length === 0 ? (
                    <div className="text-center py-16">
                        <ShoppingBag size={64} className="mx-auto text-gray-300 mb-4" />
                        <h3 className="text-lg font-medium text-gray-800 mb-2">لا توجد طلبات</h3>
                        <p className="text-gray-500 mb-4">
                            {activeFilter === 'active' ? 'لا توجد طلبات نشطة حالياً' : 
                             activeFilter === 'completed' ? 'لا توجد طلبات مكتملة' : 
                             'ابدأ التسوق الآن!'}
                        </p>
                        <Link 
                            to="/products"
                            className="inline-flex items-center gap-2 bg-primary text-white px-6 py-3 rounded-full font-medium hover:bg-primary-dark transition"
                        >
                            <ShoppingBag size={18} />
                            تسوق الآن
                        </Link>
                    </div>
                ) : (
                    <div className="space-y-4">
                        {filteredOrders.map(order => {
                            const statusInfo = getStatusInfo(order.status);
                            const StatusIcon = statusInfo.icon;
                            const items = getOrderItems(order);
                            
                            return (
                                <div 
                                    key={order.id}
                                    className="bg-white rounded-2xl shadow-sm border overflow-hidden"
                                >
                                    {/* Order Header */}
                                    <div className="p-4 border-b">
                                        <div className="flex justify-between items-start mb-3">
                                            <div>
                                                <span className="text-lg font-bold text-gray-900">
                                                    طلب #{order.id}
                                                </span>
                                                <div className="flex items-center gap-2 text-sm text-gray-500 mt-1">
                                                    <Calendar size={14} />
                                                    {formatDate(order.date)}
                                                </div>
                                            </div>
                                            <div className={`flex items-center gap-2 px-3 py-1.5 rounded-full ${statusInfo.bgColor}`}>
                                                <StatusIcon size={16} className={statusInfo.color} />
                                                <span className={`text-sm font-medium ${statusInfo.color}`}>
                                                    {statusInfo.label}
                                                </span>
                                            </div>
                                        </div>

                                        {/* Order Progress for active orders */}
                                        {!['delivered', 'cancelled'].includes(order.status) && (
                                            <div className="mt-4">
                                                <div className="flex items-center justify-between mb-2">
                                                    {['pending', 'confirmed', 'preparing', 'out_for_delivery', 'delivered'].map((step, idx) => {
                                                        const stepStatuses = ['pending', 'confirmed', 'preparing', 'out_for_delivery', 'delivered'];
                                                        const currentIdx = stepStatuses.indexOf(order.status);
                                                        const isActive = idx <= currentIdx;
                                                        const isCurrent = stepStatuses[idx] === order.status;
                                                        
                                                        return (
                                                            <div key={step} className="flex-1 flex items-center">
                                                                <div className={`w-3 h-3 rounded-full ${
                                                                    isActive ? 'bg-green-500' : 'bg-gray-200'
                                                                } ${isCurrent ? 'ring-4 ring-green-100' : ''}`} />
                                                                {idx < 4 && (
                                                                    <div className={`flex-1 h-1 ${
                                                                        isActive && idx < currentIdx ? 'bg-green-500' : 'bg-gray-200'
                                                                    }`} />
                                                                )}
                                                            </div>
                                                        );
                                                    })}
                                                </div>
                                                <div className="flex justify-between text-[10px] text-gray-500">
                                                    <span>انتظار</span>
                                                    <span>تأكيد</span>
                                                    <span>تحضير</span>
                                                    <span>توصيل</span>
                                                    <span>تم</span>
                                                </div>
                                            </div>
                                        )}
                                    </div>

                                    {/* Order Items Preview */}
                                    <div className="p-4">
                                        <div className="flex items-center gap-3 mb-3">
                                            <div className="flex -space-x-2">
                                                {items.slice(0, 4).map((item: any, idx: number) => (
                                                    <div 
                                                        key={idx}
                                                        className="w-10 h-10 rounded-lg bg-gray-100 border-2 border-white overflow-hidden"
                                                    >
                                                        <img 
                                                            src={item.image || 'https://placehold.co/40x40?text=🛒'}
                                                            alt={item.name}
                                                            className="w-full h-full object-cover"
                                                        />
                                                    </div>
                                                ))}
                                                {items.length > 4 && (
                                                    <div className="w-10 h-10 rounded-lg bg-gray-200 border-2 border-white flex items-center justify-center text-xs font-bold text-gray-600">
                                                        +{items.length - 4}
                                                    </div>
                                                )}
                                            </div>
                                            <span className="text-sm text-gray-500">
                                                {items.length} منتج
                                            </span>
                                        </div>

                                        {/* Order Total */}
                                        <div className="flex justify-between items-center pt-3 border-t">
                                            <span className="text-gray-600">الإجمالي</span>
                                            <span className="text-xl font-bold text-gray-900">
                                                {Number(order.total || 0).toFixed(2)} ج.م
                                            </span>
                                        </div>
                                    </div>

                                    {/* Actions */}
                                    <div className="px-4 pb-4 flex gap-2">
                                        <Link 
                                            to={`/orders/${order.id}`}
                                            className="flex-1 py-2.5 bg-primary text-white rounded-xl font-medium flex items-center justify-center gap-2 hover:bg-primary-dark transition"
                                        >
                                            <Eye size={18} />
                                            تفاصيل الطلب
                                        </Link>
                                        {order.status === 'delivered' && !order.rated && (
                                            <button 
                                                onClick={() => openRatingModal(order)}
                                                className="px-4 py-2.5 bg-yellow-100 text-yellow-700 rounded-xl font-medium flex items-center justify-center gap-2 hover:bg-yellow-200 transition"
                                            >
                                                <Star size={18} />
                                                تقييم
                                            </button>
                                        )}
                                        {order.status === 'delivered' && order.rated && (
                                            <div className="px-4 py-2.5 bg-green-100 text-green-700 rounded-xl font-medium flex items-center justify-center gap-2">
                                                <CheckCircle size={18} />
                                                تم التقييم
                                            </div>
                                        )}
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                )}
            </div>
            
            {/* Rating Modal */}
            {showRatingModal && ratingOrder && (
                <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
                    <div className="bg-white rounded-2xl w-full max-w-md max-h-[90vh] overflow-y-auto">
                        <div className="sticky top-0 bg-white border-b px-4 py-4 flex justify-between items-center">
                            <h2 className="text-lg font-bold">قيّم طلبك #{ratingOrder.id}</h2>
                            <button 
                                onClick={() => setShowRatingModal(false)}
                                className="p-2 hover:bg-gray-100 rounded-full"
                            >
                                <X size={20} />
                            </button>
                        </div>
                        
                        <div className="p-4 space-y-4">
                            {/* Order Rating */}
                            <StarRating 
                                value={orderRating}
                                onChange={setOrderRating}
                                label="📦 تقييم الطلب (جودة المنتجات)"
                            />
                            
                            {/* Delivery Rating */}
                            <StarRating 
                                value={deliveryRating}
                                onChange={setDeliveryRating}
                                label="🚚 تقييم خدمة التوصيل"
                            />
                            
                            {/* Speed Rating */}
                            <StarRating 
                                value={speedRating}
                                onChange={setSpeedRating}
                                label="⚡ تقييم سرعة التوصيل"
                            />
                            
                            {/* Comment */}
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    <MessageSquare size={16} className="inline ml-1" />
                                    تعليق (اختياري)
                                </label>
                                <textarea
                                    value={ratingComment}
                                    onChange={(e) => setRatingComment(e.target.value)}
                                    placeholder="شاركنا رأيك..."
                                    className="w-full px-4 py-3 border rounded-xl resize-none h-24"
                                />
                            </div>
                            
                            {/* Submit */}
                            <button
                                onClick={submitRating}
                                disabled={submittingRating}
                                className="w-full py-4 bg-primary text-white rounded-xl font-bold flex items-center justify-center gap-2 hover:bg-primary-dark transition disabled:opacity-50"
                            >
                                {submittingRating ? (
                                    <RefreshCw className="animate-spin" size={20} />
                                ) : (
                                    <Star size={20} />
                                )}
                                إرسال التقييم
                            </button>
                        </div>
                    </div>
                </div>
            )}
            
            {/* Pending Rating Popup (15 min after delivery) */}
            {pendingRatingOrder && !showRatingModal && (
                <div className="fixed inset-0 bg-black/50 z-50 flex items-end justify-center">
                    <div className="bg-white rounded-t-3xl w-full max-w-lg p-6 animate-slide-up">
                        <div className="text-center mb-6">
                            <div className="w-16 h-16 bg-yellow-100 rounded-full flex items-center justify-center mx-auto mb-4">
                                <Star size={32} className="text-yellow-500" />
                            </div>
                            <h2 className="text-xl font-bold mb-2">كيف كانت تجربتك؟</h2>
                            <p className="text-gray-500">
                                تم توصيل طلبك #{pendingRatingOrder.id}
                                <br />
                                شاركنا رأيك لتحسين خدماتنا
                            </p>
                        </div>
                        
                        <div className="flex gap-3">
                            <button
                                onClick={() => {
                                    openRatingModal(pendingRatingOrder);
                                }}
                                className="flex-1 py-4 bg-primary text-white rounded-xl font-bold flex items-center justify-center gap-2"
                            >
                                <Star size={20} />
                                قيّم الآن
                            </button>
                            <button
                                onClick={() => setPendingRatingOrder(null)}
                                className="px-6 py-4 bg-gray-100 text-gray-700 rounded-xl font-bold"
                            >
                                لاحقاً
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
            <Footer />
        </div>
    );
};

export default MyOrdersPage;
