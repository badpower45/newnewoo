import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Printer, Phone, MapPin, Package, Calendar, CreditCard, ArrowRight } from 'lucide-react';
import { api } from '../services/api';

interface OrderItem {
    id: number;
    productId?: number;
    product_id?: number;
    name: string;
    quantity: number;
    price: number;
    image?: string;
}

interface ReturnedItem {
    product_id?: number;
    name?: string;
    quantity: number;
    price?: number;
    total?: number;
}

interface Order {
    id: number;
    order_code: string;
    user_id: number;
    total: number;
    status: string;
    created_at: string;
    payment_method: string;
    delivery_address?: string;
    shipping_info?: any;
    items: OrderItem[];
    google_maps_link?: string;
    delivery_latitude?: number;
    delivery_longitude?: number;
    returned_items?: ReturnedItem[];
    returned_total?: number;
}

const OrderInvoice: React.FC = () => {
    const { orderId } = useParams<{ orderId: string }>();
    const navigate = useNavigate();
    const [order, setOrder] = useState<Order | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        loadOrder();
    }, [orderId]);

    const loadOrder = async () => {
        if (!orderId) {
            console.error('❌ No orderId provided');
            setLoading(false);
            return;
        }
        
        try {
            console.log('🔍 Loading order with ID:', orderId);
            const response = await api.orders.getOne(orderId);
            const orderData = response.data || response;
            
            console.log('📦 Order data received:', orderData);
            
            // Parse items if they're a string
            if (orderData.items && typeof orderData.items === 'string') {
                orderData.items = JSON.parse(orderData.items);
            }
            
            // Parse shipping_info if it's a string
            if (orderData.shipping_info && typeof orderData.shipping_info === 'string') {
                orderData.shipping_info = JSON.parse(orderData.shipping_info);
            }
            
            setOrder(orderData);
        } catch (error) {
            console.error('❌ Failed to load order:', error);
        } finally {
            setLoading(false);
        }
    };

    const handlePrint = () => {
        window.print();
    };

    const getStatusColor = (status: string) => {
        switch (status) {
            case 'pending': return 'bg-yellow-100 text-yellow-800';
            case 'confirmed': return 'bg-blue-100 text-blue-800';
            case 'preparing': return 'bg-purple-100 text-purple-800';
            case 'out_for_delivery': return 'bg-orange-100 text-orange-800';
            case 'delivered': return 'bg-green-100 text-green-800';
            case 'cancelled': return 'bg-red-100 text-red-800';
            default: return 'bg-gray-100 text-gray-800';
        }
    };

    const getStatusLabel = (status: string) => {
        const labels: Record<string, string> = {
            pending: 'قيد الانتظار',
            confirmed: 'تم التأكيد',
            preparing: 'جاري التحضير',
            out_for_delivery: 'في الطريق',
            delivered: 'تم التوصيل',
            cancelled: 'ملغي',
            rejected: 'مرفوض'
        };
        return labels[status] || status;
    };

    const getPaymentMethodLabel = (method: string) => {
        const labels: Record<string, string> = {
            cod: 'الدفع عند الاستلام',
            visa_on_delivery: 'فيزا عند الاستلام',
            branch_pickup: 'الدفع في الفرع',
            fawry: 'فوري'
        };
        return labels[method] || method;
    };

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gray-50">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600"></div>
            </div>
        );
    }

    if (!order) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gray-50">
                <div className="text-center">
                    <p className="text-gray-600 mb-4">لم يتم العثور على الطلب</p>
                    <button 
                        onClick={() => navigate('/profile')} 
                        className="text-green-600 hover:underline"
                    >
                        العودة للملف الشخصي
                    </button>
                </div>
            </div>
        );
    }

    const shippingInfo = order.shipping_info || {};
    const customerPhone = shippingInfo.phone || 'غير متوفر';
    const customerName = `${shippingInfo.firstName || ''} ${shippingInfo.lastName || ''}`.trim() || 'عميل';
    const returnedItems = Array.isArray(order.returned_items) ? order.returned_items : [];
    const returnedLookup = returnedItems.reduce((map, item) => {
        const key = item.product_id?.toString() || (item.name || '').trim();
        if (!key) return map;
        const existing = map.get(key) || { quantity: 0 };
        existing.quantity += Number(item.quantity || 0);
        map.set(key, existing);
        return map;
    }, new Map<string, { quantity: number }>());
    const returnedTotal = typeof order.returned_total === 'number'
        ? order.returned_total
        : returnedItems.reduce((sum, item) => {
            const price = Number(item.price || 0);
            const quantity = Number(item.quantity || 0);
            const total = Number(item.total || price * quantity);
            return sum + total;
        }, 0);

    return (
        <div className="min-h-screen bg-gray-50">
            {/* Print Button - Hidden when printing */}
            <div className="print:hidden fixed top-4 right-4 z-50 flex gap-2">
                <button
                    onClick={() => navigate(-1)}
                    className="bg-white text-gray-700 px-4 py-2 rounded-lg shadow-lg hover:shadow-xl transition-all flex items-center gap-2"
                >
                    <ArrowRight size={18} />
                    رجوع
                </button>
                <button
                    onClick={handlePrint}
                    className="bg-green-600 text-white px-6 py-2 rounded-lg shadow-lg hover:shadow-xl transition-all flex items-center gap-2"
                >
                    <Printer size={18} />
                    طباعة الفاتورة
                </button>
            </div>

            {/* Invoice Container */}
            <div className="max-w-4xl mx-auto p-6 print:p-0">
                <div className="bg-white rounded-2xl shadow-xl print:shadow-none print:rounded-none overflow-hidden">
                    {/* Header */}
                    <div className="bg-gradient-to-r from-green-600 to-green-700 text-white p-8 print:p-6">
                        <div className="flex justify-between items-start">
                            <div>
                                <h1 className="text-3xl print:text-2xl font-bold mb-2">فاتورة الطلب</h1>
                                <p className="text-green-100 text-lg">Order Invoice</p>
                            </div>
                            <div className="text-right">
                                <div className="bg-white/20 backdrop-blur-sm px-4 py-2 rounded-lg">
                                    <p className="text-sm opacity-90">رقم الطلب</p>
                                    <p className="text-2xl font-bold font-mono">{order.order_code}</p>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Customer & Delivery Info */}
                    <div className="p-8 print:p-6 border-b-2 border-dashed">
                        <div className="grid md:grid-cols-2 gap-6">
                            {/* Customer Info */}
                            <div>
                                <h3 className="font-bold text-gray-900 mb-4 flex items-center gap-2">
                                    <Package className="text-green-600" size={20} />
                                    معلومات العميل
                                </h3>
                                <div className="space-y-3 text-sm">
                                    <div className="flex items-start gap-2">
                                        <span className="text-gray-500 min-w-[80px]">الاسم:</span>
                                        <span className="font-bold text-gray-900">{customerName}</span>
                                    </div>
                                    <div className="flex items-start gap-2">
                                        <Phone size={16} className="text-green-600 mt-0.5" />
                                        <span className="text-gray-500 min-w-[80px]">الهاتف:</span>
                                        <a href={`tel:${customerPhone}`} className="font-bold text-green-600 text-xl" dir="ltr">
                                            {customerPhone}
                                        </a>
                                    </div>
                                </div>
                            </div>

                            {/* Delivery Info */}
                            <div>
                                <h3 className="font-bold text-gray-900 mb-4 flex items-center gap-2">
                                    <MapPin className="text-orange-600" size={20} />
                                    عنوان التوصيل
                                </h3>
                                <div className="space-y-2 text-sm">
                                    {shippingInfo.building && (
                                        <p className="text-gray-700">
                                            <span className="font-medium">العمارة:</span> {shippingInfo.building}
                                        </p>
                                    )}
                                    {shippingInfo.street && (
                                        <p className="text-gray-700">
                                            <span className="font-medium">الشارع:</span> {shippingInfo.street}
                                        </p>
                                    )}
                                    {shippingInfo.floor && (
                                        <p className="text-gray-700">
                                            <span className="font-medium">الدور:</span> {shippingInfo.floor} | 
                                            <span className="font-medium"> الشقة:</span> {shippingInfo.apartment}
                                        </p>
                                    )}
                                    {shippingInfo.address && (
                                        <p className="text-gray-700 bg-yellow-50 p-2 rounded border-r-4 border-yellow-400">
                                            📍 {shippingInfo.address}
                                        </p>
                                    )}
                                    {order.google_maps_link && (
                                        <a 
                                            href={order.google_maps_link} 
                                            target="_blank" 
                                            rel="noopener noreferrer"
                                            className="inline-flex items-center gap-2 text-blue-600 hover:underline font-medium print:hidden"
                                        >
                                            <MapPin size={16} />
                                            فتح الموقع في جوجل مابس
                                        </a>
                                    )}
                                    {order.delivery_latitude && order.delivery_longitude && (
                                        <p className="text-xs text-gray-500 font-mono">
                                            📍 {order.delivery_latitude.toFixed(6)}, {order.delivery_longitude.toFixed(6)}
                                        </p>
                                    )}
                                    {shippingInfo.notes && (
                                        <div className="bg-orange-50 p-3 rounded-lg border border-orange-200 mt-2">
                                            <p className="text-xs text-orange-800 font-medium mb-1">ملاحظات التوصيل:</p>
                                            <p className="text-sm text-orange-900">{shippingInfo.notes}</p>
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>

                        {/* Order Meta */}
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-6 pt-6 border-t">
                            <div className="bg-gray-50 p-3 rounded-lg">
                                <div className="flex items-center gap-2 text-gray-500 text-xs mb-1">
                                    <Calendar size={14} />
                                    التاريخ
                                </div>
                                <p className="font-bold text-gray-900 text-sm">
                                    {new Date(order.created_at).toLocaleDateString('ar-EG', {
                                        year: 'numeric',
                                        month: 'short',
                                        day: 'numeric'
                                    })}
                                </p>
                            </div>
                            <div className="bg-gray-50 p-3 rounded-lg">
                                <div className="flex items-center gap-2 text-gray-500 text-xs mb-1">
                                    <CreditCard size={14} />
                                    طريقة الدفع
                                </div>
                                <p className="font-bold text-gray-900 text-sm">
                                    {getPaymentMethodLabel(order.payment_method)}
                                </p>
                            </div>
                            <div className="bg-gray-50 p-3 rounded-lg col-span-2">
                                <p className="text-gray-500 text-xs mb-1">الحالة</p>
                                <span className={`inline-block px-3 py-1 rounded-full text-sm font-bold ${getStatusColor(order.status)}`}>
                                    {getStatusLabel(order.status)}
                                </span>
                            </div>
                        </div>
                    </div>

                    {/* Items Table */}
                    <div className="p-8 print:p-6">
                        <h3 className="font-bold text-gray-900 mb-4 text-xl">المنتجات</h3>
                        <div className="overflow-x-auto">
                            <table className="w-full">
                                <thead>
                                    <tr className="bg-gray-100 border-b-2 border-gray-300">
                                        <th className="text-right p-3 font-bold text-gray-700">#</th>
                                        <th className="text-right p-3 font-bold text-gray-700">اسم المنتج</th>
                                        <th className="text-center p-3 font-bold text-gray-700">الكمية</th>
                                        <th className="text-right p-3 font-bold text-gray-700">السعر</th>
                                        <th className="text-right p-3 font-bold text-gray-700">الإجمالي</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {order.items && order.items.length > 0 ? (
                                        order.items.map((item, index) => (
                                            <tr key={item.id || index} className="border-b hover:bg-gray-50">
                                                <td className="p-3 text-gray-600">{index + 1}</td>
                                                <td className="p-3">
                                                    <p className="font-bold text-gray-900 text-lg">{item.name}</p>
                                                    {item.image && (
                                                        <img 
                                                            src={item.image} 
                                                            alt={item.name}
                                                            className="w-12 h-12 object-cover rounded mt-1 print:hidden"
                                                        />
                                                    )}
                                                </td>
                                                <td className="p-3 text-center">
                                                    <span className="bg-green-100 text-green-800 px-3 py-1 rounded-full font-bold">
                                                        {item.quantity}
                                                    </span>
                                                    {(() => {
                                                        const key = item.productId?.toString() || item.product_id?.toString() || item.id?.toString() || item.name?.trim();
                                                        const returned = key ? returnedLookup.get(key)?.quantity : 0;
                                                        return returned ? (
                                                            <div className="text-xs text-red-600 mt-2">مرتجع: {returned}</div>
                                                        ) : null;
                                                    })()}
                                                </td>
                                                <td className="p-3 text-gray-900 font-medium">
                                                    {item.price.toFixed(2)} جنيه
                                                </td>
                                                <td className="p-3 text-gray-900 font-bold text-lg">
                                                    {(item.price * item.quantity).toFixed(2)} جنيه
                                                </td>
                                            </tr>
                                        ))
                                    ) : (
                                        <tr>
                                            <td colSpan={5} className="p-6 text-center text-gray-500">
                                                لا توجد منتجات في هذا الطلب
                                            </td>
                                        </tr>
                                    )}
                                </tbody>
                            </table>
                        </div>
                    </div>

                    {/* Returned Items */}
                    {returnedItems.length > 0 && (
                        <div className="p-8 print:p-6 border-t-2 border-dashed bg-red-50/40">
                            <h3 className="font-bold text-gray-900 mb-4 text-xl">المنتجات المرتجعة</h3>
                            <div className="overflow-x-auto">
                                <table className="w-full">
                                    <thead>
                                        <tr className="bg-red-100 border-b-2 border-red-200">
                                            <th className="text-right p-3 font-bold text-gray-700">اسم المنتج</th>
                                            <th className="text-center p-3 font-bold text-gray-700">الكمية المرتجعة</th>
                                            <th className="text-right p-3 font-bold text-gray-700">السعر</th>
                                            <th className="text-right p-3 font-bold text-gray-700">الإجمالي</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {returnedItems.map((item, index) => {
                                            const price = Number(item.price || 0);
                                            const quantity = Number(item.quantity || 0);
                                            const total = Number(item.total || price * quantity);
                                            return (
                                                <tr key={`${item.product_id || item.name || index}`} className="border-b">
                                                    <td className="p-3 font-medium text-gray-900">
                                                        {item.name || 'منتج'}
                                                    </td>
                                                    <td className="p-3 text-center">
                                                        <span className="bg-red-100 text-red-700 px-3 py-1 rounded-full font-bold">
                                                            {quantity}
                                                        </span>
                                                    </td>
                                                    <td className="p-3 text-gray-900 font-medium">
                                                        {price.toFixed(2)} جنيه
                                                    </td>
                                                    <td className="p-3 text-gray-900 font-bold">
                                                        {total.toFixed(2)} جنيه
                                                    </td>
                                                </tr>
                                            );
                                        })}
                                    </tbody>
                                </table>
                            </div>
                            <div className="mt-4 flex justify-end">
                                <div className="bg-red-600 text-white px-4 py-2 rounded-lg font-bold">
                                    إجمالي المرتجع: {returnedTotal.toFixed(2)} جنيه
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Total */}
                    <div className="p-8 print:p-6 bg-gray-50 border-t-2">
                        <div className="max-w-md mr-auto space-y-3">
                            <div className="flex justify-between items-center text-lg">
                                <span className="text-gray-600">الإجمالي الفرعي:</span>
                                <span className="font-bold text-gray-900">
                                    {(order.total - 7).toFixed(2)} جنيه
                                </span>
                            </div>
                            <div className="flex justify-between items-center text-lg border-b pb-3">
                                <span className="text-gray-600">رسوم الخدمة:</span>
                                <span className="font-bold text-gray-900">7.00 جنيه</span>
                            </div>
                            <div className="flex justify-between items-center text-2xl bg-green-600 text-white p-4 rounded-xl">
                                <span className="font-bold">الإجمالي النهائي:</span>
                                <span className="font-bold">{(Number(order.total) || 0).toFixed(2)} جنيه</span>
                            </div>
                        </div>
                    </div>

                    {/* Footer */}
                    <div className="p-6 bg-gray-100 text-center print:bg-white">
                        <p className="text-gray-600 text-sm">
                            شكراً لتسوقك معنا! في حالة وجود أي استفسار، يرجى التواصل معنا
                        </p>
                        <p className="text-green-600 font-bold mt-2" dir="ltr">
                            📞 +20 123 456 7890
                        </p>
                    </div>
                </div>
            </div>

            {/* Print Styles */}
            <style>{`
                @media print {
                    body {
                        print-color-adjust: exact;
                        -webkit-print-color-adjust: exact;
                    }
                    @page {
                        margin: 1cm;
                        size: A4;
                    }
                }
            `}</style>
        </div>
    );
};

export default OrderInvoice;
