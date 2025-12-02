import React, { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Printer, Download, CheckCircle, MapPin, Phone, User, Package, Calendar, CreditCard, Tag, Truck, ArrowLeft } from 'lucide-react';
import { api } from '../services/api';
import { useReactToPrint } from 'react-to-print';

interface Order {
    id: number;
    user_id: number;
    branch_id: number;
    total: number;
    items: any[];
    date: string;
    status: string;
    payment_method: string;
    payment_status: string;
    shipping_info: any;
    coupon_code?: string;
    coupon_discount?: number;
}

const OrderInvoice = () => {
    const { orderId } = useParams();
    const navigate = useNavigate();
    const [order, setOrder] = useState<Order | null>(null);
    const [branch, setBranch] = useState<any>(null);
    const [deliveryInfo, setDeliveryInfo] = useState<any>(null);
    const [loading, setLoading] = useState(true);
    const invoiceRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        loadOrderData();
    }, [orderId]);

    const loadOrderData = async () => {
        try {
            setLoading(true);

            // Get order details
            const ordersRes = await api.orders.getAll();
            const orderData = ordersRes.data?.find((o: any) => o.id === parseInt(orderId || '0'));

            if (orderData) {
                setOrder(orderData);

                // Get branch info
                if (orderData.branch_id) {
                    const branchRes = await api.branches.getAll();
                    const branchData = branchRes.data?.find((b: any) => b.id === orderData.branch_id);
                    setBranch(branchData);
                }

                // Get delivery assignment info
                try {
                    const deliveryRes = await api.distribution.getActiveDeliveries();
                    const delivery = deliveryRes.data?.find((d: any) => d.order_id === orderData.id);
                    setDeliveryInfo(delivery);
                } catch (err) {
                    console.log('No delivery info found');
                }
            }
        } catch (error) {
            console.error('Error loading invoice data:', error);
        } finally {
            setLoading(false);
        }
    };

    const handlePrint = useReactToPrint({
        content: () => invoiceRef.current,
        documentTitle: `Invoice-${orderId}`,
    });

    const handleDownloadPDF = () => {
        handlePrint();
    };

    if (loading) {
        return (
            <div className="min-h-screen bg-gray-50 flex items-center justify-center">
                <div className="text-center">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600 mx-auto mb-4"></div>
                    <p className="text-gray-600">جاري تحميل الفاتورة...</p>
                </div>
            </div>
        );
    }

    if (!order) {
        return (
            <div className="min-h-screen bg-gray-50 flex items-center justify-center">
                <div className="text-center">
                    <p className="text-gray-600 mb-4">الطلب غير موجود</p>
                    <button onClick={() => navigate('/orders')} className="text-green-600 hover:underline">
                        العودة للطلبات
                    </button>
                </div>
            </div>
        );
    }

    const shippingInfo = typeof order.shipping_info === 'string'
        ? JSON.parse(order.shipping_info)
        : order.shipping_info;

    const items = typeof order.items === 'string'
        ? JSON.parse(order.items)
        : order.items;

    const subtotal = items.reduce((sum: number, item: any) => sum + (item.price * item.quantity), 0);
    const deliveryFee = order.total - subtotal - (order.coupon_discount || 0);

    return (
        <div className="min-h-screen bg-gray-50 py-8">
            {/* Action Buttons - Not printed */}
            <div className="max-w-4xl mx-auto px-4 mb-6 print:hidden">
                <div className="flex items-center justify-between">
                    <button
                        onClick={() => navigate(-1)}
                        className="flex items-center gap-2 text-gray-600 hover:text-gray-900 transition-colors"
                    >
                        <ArrowLeft size={20} />
                        <span>رجوع</span>
                    </button>
                    <div className="flex gap-3">
                        <button
                            onClick={handlePrint}
                            className="flex items-center gap-2 px-6 py-3 bg-white border border-gray-300 rounded-xl hover:bg-gray-50 transition-colors font-medium"
                        >
                            <Printer size={20} />
                            طباعة
                        </button>
                        <button
                            onClick={handleDownloadPDF}
                            className="flex items-center gap-2 px-6 py-3 bg-green-600 text-white rounded-xl hover:bg-green-700 transition-colors font-medium"
                        >
                            <Download size={20} />
                            تحميل PDF
                        </button>
                    </div>
                </div>
            </div>

            {/* Invoice - Printable */}
            <div ref={invoiceRef} className="max-w-4xl mx-auto bg-white shadow-lg print:shadow-none">
                {/* Header */}
                <div className="bg-gradient-to-r from-green-600 to-green-500 text-white p-8">
                    <div className="flex justify-between items-start">
                        <div>
                            <h1 className="text-3xl font-bold mb-2">Lumina Fresh Market</h1>
                            <p className="text-green-100">فاتورة طلب</p>
                        </div>
                        <div className="text-right">
                            <div className="bg-white/20 backdrop-blur-sm px-4 py-2 rounded-lg">
                                <p className="text-sm text-green-100">رقم الطلب</p>
                                <p className="text-2xl font-bold">#{order.id}</p>
                            </div>
                        </div>
                    </div>

                    {/* Status Badge */}
                    <div className="mt-6 inline-flex items-center gap-2 bg-white/20 backdrop-blur-sm px-4 py-2 rounded-full">
                        <CheckCircle size={18} />
                        <span className="font-medium">
                            {order.status === 'delivered' ? 'تم التوصيل' :
                             order.status === 'pending' ? 'قيد المعالجة' :
                             order.status === 'confirmed' ? 'تم التأكيد' : 'جاري التوصيل'}
                        </span>
                    </div>
                </div>

                {/* Invoice Details */}
                <div className="p-8">
                    {/* Date & Payment Info */}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8 pb-8 border-b border-gray-200">
                        <div className="flex items-start gap-3">
                            <div className="p-2 bg-green-50 rounded-lg">
                                <Calendar size={20} className="text-green-600" />
                            </div>
                            <div>
                                <p className="text-sm text-gray-500">تاريخ الطلب</p>
                                <p className="font-semibold text-gray-900">
                                    {new Date(order.date).toLocaleDateString('ar-EG', {
                                        year: 'numeric',
                                        month: 'long',
                                        day: 'numeric'
                                    })}
                                </p>
                                <p className="text-sm text-gray-600">
                                    {new Date(order.date).toLocaleTimeString('ar-EG', {
                                        hour: '2-digit',
                                        minute: '2-digit'
                                    })}
                                </p>
                            </div>
                        </div>

                        <div className="flex items-start gap-3">
                            <div className="p-2 bg-blue-50 rounded-lg">
                                <CreditCard size={20} className="text-blue-600" />
                            </div>
                            <div>
                                <p className="text-sm text-gray-500">طريقة الدفع</p>
                                <p className="font-semibold text-gray-900">
                                    {order.payment_method === 'cod' ? 'الدفع عند الاستلام' :
                                     order.payment_method === 'card' ? 'بطاقة ائتمان' : 'أخرى'}
                                </p>
                                <p className="text-sm text-gray-600">
                                    {order.payment_status === 'paid' ? 'مدفوع' :
                                     order.payment_status === 'pending' ? 'قيد الانتظار' : 'غير مدفوع'}
                                </p>
                            </div>
                        </div>

                        <div className="flex items-start gap-3">
                            <div className="p-2 bg-purple-50 rounded-lg">
                                <Package size={20} className="text-purple-600" />
                            </div>
                            <div>
                                <p className="text-sm text-gray-500">عدد المنتجات</p>
                                <p className="font-semibold text-gray-900">
                                    {items.reduce((sum: number, item: any) => sum + item.quantity, 0)} منتج
                                </p>
                                <p className="text-sm text-gray-600">
                                    {items.length} صنف
                                </p>
                            </div>
                        </div>
                    </div>

                    {/* Customer & Delivery Info */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8 pb-8 border-b border-gray-200">
                        {/* Customer Info */}
                        <div>
                            <h3 className="font-bold text-gray-900 mb-4 flex items-center gap-2">
                                <User size={18} className="text-green-600" />
                                معلومات العميل
                            </h3>
                            <div className="space-y-2 text-gray-700">
                                <p className="font-medium">{shippingInfo?.firstName} {shippingInfo?.lastName}</p>
                                <div className="flex items-center gap-2 text-sm">
                                    <Phone size={16} className="text-gray-400" />
                                    <span dir="ltr">{shippingInfo?.phone}</span>
                                </div>
                                <div className="flex items-start gap-2 text-sm">
                                    <MapPin size={16} className="text-gray-400 mt-1" />
                                    <span>
                                        {shippingInfo?.building}, {shippingInfo?.street}
                                        {shippingInfo?.floor && `, الدور ${shippingInfo.floor}`}
                                        {shippingInfo?.apartment && `, شقة ${shippingInfo.apartment}`}
                                    </span>
                                </div>
                                {shippingInfo?.notes && (
                                    <p className="text-sm text-gray-600 bg-gray-50 p-2 rounded">
                                        ملاحظات: {shippingInfo.notes}
                                    </p>
                                )}
                            </div>
                        </div>

                        {/* Delivery & Branch Info */}
                        <div>
                            <h3 className="font-bold text-gray-900 mb-4 flex items-center gap-2">
                                <Truck size={18} className="text-green-600" />
                                معلومات التوصيل
                            </h3>
                            <div className="space-y-3">
                                {deliveryInfo && (
                                    <div className="bg-green-50 p-3 rounded-lg">
                                        <p className="text-sm text-gray-600">موظف التوصيل</p>
                                        <p className="font-medium text-gray-900">{deliveryInfo.delivery_name}</p>
                                        <p className="text-sm text-gray-600" dir="ltr">{deliveryInfo.delivery_phone}</p>
                                    </div>
                                )}
                                {branch && (
                                    <div className="bg-blue-50 p-3 rounded-lg">
                                        <p className="text-sm text-gray-600">الفرع</p>
                                        <p className="font-medium text-gray-900">{branch.name}</p>
                                        {branch.phone && (
                                            <p className="text-sm text-gray-600" dir="ltr">{branch.phone}</p>
                                        )}
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>

                    {/* Order Items */}
                    <div className="mb-8">
                        <h3 className="font-bold text-gray-900 mb-4">تفاصيل الطلب</h3>
                        <div className="overflow-x-auto">
                            <table className="w-full">
                                <thead>
                                    <tr className="bg-gray-50 border-b border-gray-200">
                                        <th className="text-right py-3 px-4 text-sm font-semibold text-gray-700">#</th>
                                        <th className="text-right py-3 px-4 text-sm font-semibold text-gray-700">المنتج</th>
                                        <th className="text-center py-3 px-4 text-sm font-semibold text-gray-700">الكمية</th>
                                        <th className="text-center py-3 px-4 text-sm font-semibold text-gray-700">السعر</th>
                                        <th className="text-center py-3 px-4 text-sm font-semibold text-gray-700">الإجمالي</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {items.map((item: any, index: number) => (
                                        <tr key={index} className="border-b border-gray-100">
                                            <td className="py-4 px-4 text-gray-600">{index + 1}</td>
                                            <td className="py-4 px-4">
                                                <p className="font-medium text-gray-900">{item.name}</p>
                                                {item.substitutionPreference && item.substitutionPreference !== 'none' && (
                                                    <p className="text-xs text-gray-500">
                                                        {item.substitutionPreference === 'call_me' ? 'اتصل بي إذا غير متوفر' :
                                                         item.substitutionPreference === 'similar_product' ? 'استبدال بمنتج مشابه' :
                                                         'إلغاء المنتج إذا غير متوفر'}
                                                    </p>
                                                )}
                                            </td>
                                            <td className="py-4 px-4 text-center text-gray-900">{item.quantity}</td>
                                            <td className="py-4 px-4 text-center text-gray-900">{item.price.toFixed(2)} جنيه</td>
                                            <td className="py-4 px-4 text-center font-medium text-gray-900">
                                                {(item.price * item.quantity).toFixed(2)} جنيه
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>

                    {/* Totals */}
                    <div className="bg-gray-50 rounded-xl p-6">
                        <div className="space-y-3">
                            <div className="flex justify-between items-center text-gray-700">
                                <span>الإجمالي الفرعي</span>
                                <span className="font-medium">{subtotal.toFixed(2)} جنيه</span>
                            </div>

                            <div className="flex justify-between items-center text-gray-700">
                                <span>رسوم التوصيل</span>
                                <span className="font-medium">
                                    {deliveryFee > 0 ? `${deliveryFee.toFixed(2)} جنيه` : 'مجاناً'}
                                </span>
                            </div>

                            {order.coupon_code && order.coupon_discount && order.coupon_discount > 0 && (
                                <div className="flex justify-between items-center text-green-600">
                                    <div className="flex items-center gap-2">
                                        <Tag size={16} />
                                        <span>خصم الكوبون ({order.coupon_code})</span>
                                    </div>
                                    <span className="font-medium">-{order.coupon_discount.toFixed(2)} جنيه</span>
                                </div>
                            )}

                            <div className="border-t border-gray-200 pt-3 mt-3">
                                <div className="flex justify-between items-center">
                                    <span className="text-lg font-bold text-gray-900">الإجمالي النهائي</span>
                                    <span className="text-2xl font-bold text-green-600">
                                        {order.total.toFixed(2)} جنيه
                                    </span>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Footer */}
                    <div className="mt-8 pt-6 border-t border-gray-200 text-center text-gray-500 text-sm">
                        <p className="mb-2">شكراً لتسوقك معنا! 🎉</p>
                        <p>Lumina Fresh Market - نوفر لك الأفضل دائماً</p>
                        <p className="mt-2 text-xs">
                            تم إنشاء الفاتورة في {new Date().toLocaleDateString('ar-EG')}
                        </p>
                    </div>
                </div>
            </div>

            {/* Print Styles */}
            <style>{`
                @media print {
                    @page {
                        size: A4;
                        margin: 1cm;
                    }
                    body {
                        print-color-adjust: exact;
                        -webkit-print-color-adjust: exact;
                    }
                    .print\\:hidden {
                        display: none !important;
                    }
                    .print\\:shadow-none {
                        box-shadow: none !important;
                    }
                }
            `}</style>
        </div>
    );
};

export default OrderInvoice;
