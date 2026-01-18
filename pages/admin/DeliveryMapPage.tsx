import React, { useState, useEffect } from 'react';
import { MapPin, ArrowLeft, Navigation, Truck, Package, Phone, Clock, RefreshCw } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import api from '../../services/api';

interface Branch {
    id: number;
    name: string;
    address: string;
    location_lat: number;
    location_lng: number;
    phone: string;
}

interface Delivery {
    id: number;
    order_code: string;
    status: string;
    delivery_latitude: number;
    delivery_longitude: number;
    shipping_info: any;
    total: number;
    created_at: string;
    customer_name: string;
    customer_phone: string;
    driver_name: string | null;
    driver_phone: string | null;
    branch_name: string;
}

const AdminDeliveryMapPage = () => {
    const navigate = useNavigate();
    
    const [branches, setBranches] = useState<Branch[]>([]);
    const [deliveries, setDeliveries] = useState<Delivery[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [selectedDelivery, setSelectedDelivery] = useState<Delivery | null>(null);
    const [autoRefresh, setAutoRefresh] = useState(true);

    useEffect(() => {
        fetchMapData();
        
        // Auto-refresh every 30 seconds if enabled
        const interval = autoRefresh ? setInterval(fetchMapData, 30000) : null;
        
        return () => {
            if (interval) clearInterval(interval);
        };
    }, [autoRefresh]);

    const fetchMapData = async () => {
        try {
            setLoading(true);
            const response = await api.get('/admin/delivery-map');
            const data = response.data;
            
            setBranches(data.branches || []);
            setDeliveries(data.deliveries || []);
            setError('');
        } catch (err) {
            setError('فشل في تحميل بيانات الخريطة');
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    const getStatusColor = (status: string) => {
        switch (status) {
            case 'preparing': return 'bg-yellow-500';
            case 'on_the_way': return 'bg-blue-500';
            case 'out_for_delivery': return 'bg-green-500';
            default: return 'bg-gray-500';
        }
    };

    const getStatusText = (status: string) => {
        switch (status) {
            case 'preparing': return 'جاري التحضير';
            case 'on_the_way': return 'في الطريق';
            case 'out_for_delivery': return 'خارج للتوصيل';
            default: return status;
        }
    };

    if (loading && branches.length === 0) {
        return (
            <div className="min-h-screen bg-gray-50 flex items-center justify-center">
                <div className="text-center">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
                    <p className="text-gray-600">جاري تحميل الخريطة...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-50">
            {/* Header */}
            <div className="bg-white shadow-sm sticky top-0 z-40">
                <div className="max-w-7xl mx-auto p-4">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-4">
                            <button 
                                onClick={() => navigate(-1)}
                                className="p-2 hover:bg-gray-100 rounded-lg"
                            >
                                <ArrowLeft size={24} />
                            </button>
                            <div>
                                <h1 className="text-2xl font-bold text-gray-900">خريطة التوصيل</h1>
                                <p className="text-sm text-gray-500">Delivery Tracking Map</p>
                            </div>
                        </div>
                        
                        <div className="flex items-center gap-3">
                            <button
                                onClick={fetchMapData}
                                disabled={loading}
                                className="flex items-center gap-2 px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary-dark disabled:bg-gray-300 transition-colors"
                            >
                                <RefreshCw size={18} className={loading ? 'animate-spin' : ''} />
                                <span className="hidden sm:inline">تحديث</span>
                            </button>
                            
                            <label className="flex items-center gap-2 text-sm">
                                <input
                                    type="checkbox"
                                    checked={autoRefresh}
                                    onChange={(e) => setAutoRefresh(e.target.checked)}
                                    className="rounded"
                                />
                                <span className="hidden sm:inline">تحديث تلقائي</span>
                            </label>
                        </div>
                    </div>
                </div>
            </div>

            <div className="max-w-7xl mx-auto p-4">
                {error && (
                    <div className="bg-red-50 border border-red-200 text-red-800 rounded-xl p-4 mb-4">
                        {error}
                    </div>
                )}

                {/* Stats Cards */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
                    <div className="bg-white rounded-xl shadow-sm p-6">
                        <div className="flex items-center gap-3">
                            <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                                <MapPin size={24} className="text-blue-600" />
                            </div>
                            <div>
                                <p className="text-gray-600 text-sm">الفروع النشطة</p>
                                <p className="text-2xl font-bold text-gray-900">{branches.length}</p>
                            </div>
                        </div>
                    </div>
                    
                    <div className="bg-white rounded-xl shadow-sm p-6">
                        <div className="flex items-center gap-3">
                            <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
                                <Truck size={24} className="text-green-600" />
                            </div>
                            <div>
                                <p className="text-gray-600 text-sm">طلبات قيد التوصيل</p>
                                <p className="text-2xl font-bold text-gray-900">{deliveries.length}</p>
                            </div>
                        </div>
                    </div>
                    
                    <div className="bg-white rounded-xl shadow-sm p-6">
                        <div className="flex items-center gap-3">
                            <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center">
                                <Package size={24} className="text-purple-600" />
                            </div>
                            <div>
                                <p className="text-gray-600 text-sm">إجمالي القيمة</p>
                                <p className="text-2xl font-bold text-gray-900">
                                    {deliveries.reduce((sum, d) => sum + d.total, 0).toFixed(2)} ج.م
                                </p>
                            </div>
                        </div>
                    </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    {/* Map */}
                    <div className="lg:col-span-2">
                        <div className="bg-white rounded-2xl shadow-sm overflow-hidden">
                            <div className="p-4 bg-gradient-to-r from-primary to-primary-dark text-white">
                                <h2 className="font-bold text-lg">خريطة المواقع الحية</h2>
                                <p className="text-sm opacity-90">عرض جميع الفروع والطلبات النشطة</p>
                            </div>
                            
                            {branches.length > 0 || deliveries.length > 0 ? (
                                <div className="relative">
                                    <iframe
                                        src={`https://www.google.com/maps?q=${branches[0]?.location_lat || 30.0444},${branches[0]?.location_lng || 31.2357}&output=embed&z=12`}
                                        width="100%"
                                        height="500"
                                        style={{ border: 0 }}
                                        allowFullScreen
                                        loading="lazy"
                                        referrerPolicy="no-referrer-when-downgrade"
                                        title="Delivery Map"
                                    />
                                    
                                    <div className="absolute bottom-4 left-4 bg-white rounded-lg shadow-lg p-3 text-xs">
                                        <div className="flex items-center gap-2 mb-2">
                                            <div className="w-3 h-3 bg-blue-600 rounded-full"></div>
                                            <span>الفروع</span>
                                        </div>
                                        <div className="flex items-center gap-2">
                                            <div className="w-3 h-3 bg-green-600 rounded-full"></div>
                                            <span>طلبات قيد التوصيل</span>
                                        </div>
                                    </div>
                                </div>
                            ) : (
                                <div className="h-[500px] flex items-center justify-center bg-gray-50">
                                    <div className="text-center">
                                        <MapPin size={48} className="text-gray-400 mx-auto mb-3" />
                                        <p className="text-gray-600">لا توجد بيانات خريطة متاحة</p>
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Deliveries List */}
                    <div className="space-y-4">
                        <div className="bg-white rounded-2xl shadow-sm p-4">
                            <h3 className="font-bold text-lg mb-4 flex items-center gap-2">
                                <Truck size={20} />
                                الطلبات النشطة
                            </h3>
                            
                            {deliveries.length === 0 ? (
                                <div className="text-center py-8 text-gray-500">
                                    <Package size={48} className="mx-auto mb-3 opacity-50" />
                                    <p>لا توجد طلبات قيد التوصيل حالياً</p>
                                </div>
                            ) : (
                                <div className="space-y-3 max-h-[600px] overflow-y-auto">
                                    {deliveries.map((delivery) => (
                                        <div
                                            key={delivery.id}
                                            onClick={() => setSelectedDelivery(delivery)}
                                            className="border-2 border-gray-200 rounded-xl p-3 hover:border-primary transition-colors cursor-pointer"
                                        >
                                            <div className="flex items-start justify-between mb-2">
                                                <div>
                                                    <p className="font-bold text-gray-900">#{delivery.order_code}</p>
                                                    <p className="text-sm text-gray-600">{delivery.customer_name}</p>
                                                </div>
                                                <span className={`${getStatusColor(delivery.status)} text-white text-xs px-2 py-1 rounded-full`}>
                                                    {getStatusText(delivery.status)}
                                                </span>
                                            </div>
                                            
                                            <div className="text-xs text-gray-600 space-y-1">
                                                {delivery.driver_name && (
                                                    <div className="flex items-center gap-2">
                                                        <Truck size={14} />
                                                        <span>{delivery.driver_name}</span>
                                                    </div>
                                                )}
                                                <div className="flex items-center gap-2">
                                                    <MapPin size={14} />
                                                    <span>{delivery.branch_name}</span>
                                                </div>
                                                <div className="flex items-center gap-2">
                                                    <Package size={14} />
                                                    <span className="font-bold">{delivery.total} ج.م</span>
                                                </div>
                                            </div>
                                            
                                            <button
                                                onClick={(e) => {
                                                    e.stopPropagation();
                                                    window.open(`https://www.google.com/maps?q=${delivery.delivery_latitude},${delivery.delivery_longitude}`, '_blank');
                                                }}
                                                className="mt-2 w-full text-xs bg-primary text-white py-2 rounded-lg hover:bg-primary-dark transition-colors flex items-center justify-center gap-1"
                                            >
                                                <Navigation size={14} />
                                                عرض على الخريطة
                                            </button>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                    </div>
                </div>

                {/* Branches Section */}
                {branches.length > 0 && (
                    <div className="mt-6 bg-white rounded-2xl shadow-sm p-6">
                        <h3 className="font-bold text-lg mb-4 flex items-center gap-2">
                            <MapPin size={20} />
                            الفروع ({branches.length})
                        </h3>
                        
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                            {branches.map((branch) => (
                                <div key={branch.id} className="border-2 border-gray-200 rounded-xl p-4 hover:border-primary transition-colors">
                                    <h4 className="font-bold text-gray-900 mb-2">{branch.name}</h4>
                                    <p className="text-sm text-gray-600 mb-3">{branch.address}</p>
                                    
                                    {branch.phone && (
                                        <div className="flex items-center gap-2 text-sm text-gray-700 mb-3">
                                            <Phone size={14} />
                                            <a href={`tel:${branch.phone}`} className="hover:text-primary">
                                                {branch.phone}
                                            </a>
                                        </div>
                                    )}
                                    
                                    <button
                                        onClick={() => window.open(`https://www.google.com/maps?q=${branch.location_lat},${branch.location_lng}`, '_blank')}
                                        className="w-full text-sm bg-blue-600 text-white py-2 rounded-lg hover:bg-blue-700 transition-colors flex items-center justify-center gap-2"
                                    >
                                        <MapPin size={16} />
                                        عرض الموقع
                                    </button>
                                </div>
                            ))}
                        </div>
                    </div>
                )}
            </div>

            {/* Selected Delivery Modal */}
            {selectedDelivery && (
                <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4" onClick={() => setSelectedDelivery(null)}>
                    <div className="bg-white rounded-2xl shadow-xl max-w-md w-full p-6" onClick={(e) => e.stopPropagation()}>
                        <h3 className="text-xl font-bold mb-4">تفاصيل الطلب #{selectedDelivery.order_code}</h3>
                        
                        <div className="space-y-3">
                            <div>
                                <p className="text-sm text-gray-600">العميل</p>
                                <p className="font-bold">{selectedDelivery.customer_name}</p>
                                {selectedDelivery.customer_phone && (
                                    <a href={`tel:${selectedDelivery.customer_phone}`} className="text-sm text-primary hover:underline">
                                        {selectedDelivery.customer_phone}
                                    </a>
                                )}
                            </div>
                            
                            {selectedDelivery.driver_name && (
                                <div>
                                    <p className="text-sm text-gray-600">السائق</p>
                                    <p className="font-bold">{selectedDelivery.driver_name}</p>
                                    {selectedDelivery.driver_phone && (
                                        <a href={`tel:${selectedDelivery.driver_phone}`} className="text-sm text-primary hover:underline">
                                            {selectedDelivery.driver_phone}
                                        </a>
                                    )}
                                </div>
                            )}
                            
                            <div>
                                <p className="text-sm text-gray-600">الحالة</p>
                                <span className={`inline-block ${getStatusColor(selectedDelivery.status)} text-white text-sm px-3 py-1 rounded-full mt-1`}>
                                    {getStatusText(selectedDelivery.status)}
                                </span>
                            </div>
                            
                            <div>
                                <p className="text-sm text-gray-600">المبلغ</p>
                                <p className="font-bold text-xl text-primary">{selectedDelivery.total} ج.م</p>
                            </div>
                        </div>
                        
                        <div className="mt-6 flex gap-3">
                            <button
                                onClick={() => window.open(`https://www.google.com/maps?q=${selectedDelivery.delivery_latitude},${selectedDelivery.delivery_longitude}`, '_blank')}
                                className="flex-1 bg-primary text-white py-3 rounded-xl font-bold hover:bg-primary-dark transition-colors flex items-center justify-center gap-2"
                            >
                                <Navigation size={18} />
                                عرض الموقع
                            </button>
                            <button
                                onClick={() => setSelectedDelivery(null)}
                                className="flex-1 bg-gray-200 text-gray-700 py-3 rounded-xl font-bold hover:bg-gray-300 transition-colors"
                            >
                                إغلاق
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default AdminDeliveryMapPage;
