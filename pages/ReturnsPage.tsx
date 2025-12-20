import React, { useState } from 'react';
import { Search, Package, AlertTriangle, CheckCircle, XCircle, ArrowLeft } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { api } from '../services/api';
import { useAuth } from '../context/AuthContext';

const ReturnsPage = () => {
    const navigate = useNavigate();
    const { user } = useAuth();
    const [searchTerm, setSearchTerm] = useState('');
    const [orderData, setOrderData] = useState(null);
    const [isSearching, setIsSearching] = useState(false);
    const [isProcessing, setIsProcessing] = useState(false);
    const [error, setError] = useState('');

    // Search for order
    const handleSearch = async () => {
        if (!searchTerm.trim()) {
            setError('يرجى إدخال رقم الطلب');
            return;
        }

        setIsSearching(true);
        setError('');
        setOrderData(null);

        try {
            const response = await api.get(`/returns/admin/search-order/${searchTerm.trim()}`);
            
            if (response.data) {
                setOrderData(response.data);
            }
        } catch (err) {
            setError(err.response?.data?.error || 'فشل البحث عن الطلب');
        } finally {
            setIsSearching(false);
        }
    };

    // Process return
    const handleProcessReturn = async () => {
        if (!orderData) return;

        if (window.confirm(`هل أنت متأكد من معالجة إرجاع الطلب #${orderData.id}؟\n\nسيتم:\n✅ إرجاع المنتجات للمخزن\n✅ خصم ${orderData.points_earned_from_order} نقطة من العميل\n✅ رد مبلغ ${orderData.total} جنيه`)) {
            setIsProcessing(true);
            setError('');

            try {
                // Create return request
                const returnResponse = await api.post('/returns/create', {
                    order_id: orderData.id,
                    items: orderData.items,
                    return_reason: 'customer_request',
                    return_notes: 'Processed by returns staff'
                });

                if (returnResponse.data) {
                    const returnId = returnResponse.data.id;

                    // Approve return immediately (staff workflow)
                    await api.post(`/returns/admin/approve/${returnId}`, {
                        refund_method: 'cash',
                        notes: `Processed by ${user?.name || 'staff'}`
                    });

                    alert(`✅ تم معالجة الإرجاع بنجاح!\n\n📦 تم إرجاع المنتجات للمخزن\n💰 تم خصم ${orderData.points_earned_from_order} نقطة\n💵 يرجى رد مبلغ ${orderData.total} جنيه للعميل`);

                    // Reset
                    setSearchTerm('');
                    setOrderData(null);
                }
            } catch (err) {
                setError(err.response?.data?.error || 'فشلت معالجة الإرجاع');
            } finally {
                setIsProcessing(false);
            }
        }
    };

    return (
        <div className="min-h-screen bg-gray-50 pb-8">
            {/* Header */}
            <div className="bg-white shadow-sm sticky top-0 z-40">
                <div className="max-w-4xl mx-auto p-4 flex items-center gap-4">
                    <button 
                        onClick={() => navigate(-1)}
                        className="p-2 hover:bg-gray-100 rounded-lg"
                    >
                        <ArrowLeft size={24} />
                    </button>
                    <div>
                        <h1 className="text-2xl font-bold text-gray-900">معالجة المرتجعات</h1>
                        <p className="text-sm text-gray-500">Returns Processing Station</p>
                    </div>
                </div>
            </div>

            <div className="max-w-4xl mx-auto p-4 space-y-6">
                {/* Search Box */}
                <div className="bg-white rounded-2xl shadow-sm p-6">
                    <label className="block text-sm font-bold text-gray-700 mb-3">
                        <Search className="inline mr-2" size={18} />
                        ابحث برقم الطلب
                    </label>
                    
                    <div className="flex gap-3">
                        <input
                            type="text"
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
                            placeholder="أدخل رقم الطلب (Order ID)"
                            className="flex-1 px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-primary focus:border-primary text-lg"
                        />
                        <button
                            onClick={handleSearch}
                            disabled={isSearching}
                            className="px-8 py-3 bg-primary text-white font-bold rounded-xl hover:bg-primary-dark disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors"
                        >
                            {isSearching ? 'جاري البحث...' : 'بحث'}
                        </button>
                    </div>

                    {error && (
                        <div className="mt-4 p-4 bg-red-50 border border-red-200 rounded-xl flex items-center gap-3 text-red-800">
                            <AlertTriangle size={20} />
                            <span>{error}</span>
                        </div>
                    )}
                </div>

                {/* Order Details */}
                {orderData && (
                    <div className="space-y-4">
                        {/* Eligibility Status */}
                        {!orderData.can_be_returned && (
                            <div className="bg-amber-50 border-2 border-amber-300 rounded-2xl p-6">
                                <div className="flex items-center gap-3 mb-3">
                                    <AlertTriangle className="text-amber-600" size={24} />
                                    <h3 className="text-lg font-bold text-amber-900">تحذير - الطلب غير قابل للإرجاع</h3>
                                </div>
                                <ul className="space-y-2 text-amber-800">
                                    <li>• الحالة: {orderData.status}</li>
                                    <li>• مضى {orderData.days_since_order} يوم على الطلب</li>
                                    {orderData.already_returned && <li className="font-bold">⚠️ تم إرجاع هذا الطلب مسبقاً!</li>}
                                </ul>
                            </div>
                        )}

                        {/* Customer Info */}
                        <div className="bg-white rounded-2xl shadow-sm p-6">
                            <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
                                <Package size={20} />
                                معلومات الطلب والعميل
                            </h3>
                            
                            <div className="grid grid-cols-2 gap-4 text-sm">
                                <div>
                                    <span className="text-gray-500">رقم الطلب:</span>
                                    <p className="font-bold text-lg">#{orderData.id}</p>
                                </div>
                                <div>
                                    <span className="text-gray-500">اسم العميل:</span>
                                    <p className="font-bold">{orderData.customer_name}</p>
                                </div>
                                <div>
                                    <span className="text-gray-500">رقم الهاتف:</span>
                                    <p className="font-bold" dir="ltr">{orderData.customer_phone}</p>
                                </div>
                                <div>
                                    <span className="text-gray-500">الفرع:</span>
                                    <p className="font-bold">{orderData.branch_name || `Branch #${orderData.branch_id}`}</p>
                                </div>
                                <div>
                                    <span className="text-gray-500">تاريخ الطلب:</span>
                                    <p className="font-bold">{new Date(orderData.date).toLocaleDateString('ar-EG')}</p>
                                </div>
                                <div>
                                    <span className="text-gray-500">الحالة:</span>
                                    <p className="font-bold">{orderData.status}</p>
                                </div>
                            </div>
                        </div>

                        {/* Items List */}
                        <div className="bg-white rounded-2xl shadow-sm p-6">
                            <h3 className="text-lg font-bold text-gray-900 mb-4">المنتجات المطلوبة</h3>
                            
                            <div className="space-y-3">
                                {orderData.items?.map((item, idx) => (
                                    <div key={idx} className="flex justify-between items-center p-4 bg-gray-50 rounded-xl">
                                        <div className="flex-1">
                                            <p className="font-bold text-gray-900">{item.name || item.title}</p>
                                            <p className="text-sm text-gray-500">الكمية: {item.quantity}</p>
                                        </div>
                                        <div className="text-right">
                                            <p className="font-bold text-brand-orange">{item.price} جنيه</p>
                                            <p className="text-sm text-gray-500">الإجمالي: {(item.price * item.quantity).toFixed(2)} جنيه</p>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>

                        {/* Financial Summary */}
                        <div className="bg-gradient-to-br from-purple-50 to-pink-50 rounded-2xl shadow-sm p-6 border-2 border-purple-200">
                            <h3 className="text-lg font-bold text-purple-900 mb-4">ملخص الإرجاع المالي</h3>
                            
                            <div className="space-y-3">
                                <div className="flex justify-between items-center">
                                    <span className="text-purple-700">إجمالي الطلب:</span>
                                    <span className="text-2xl font-bold text-purple-900">{orderData.total} جنيه</span>
                                </div>
                                
                                <div className="flex justify-between items-center pt-3 border-t border-purple-200">
                                    <span className="text-purple-700">النقاط المكتسبة من هذا الطلب:</span>
                                    <span className="text-xl font-bold text-purple-900">{orderData.points_earned_from_order} نقطة</span>
                                </div>
                                
                                <div className="flex justify-between items-center">
                                    <span className="text-purple-700">رصيد العميل الحالي:</span>
                                    <span className="text-xl font-bold text-purple-900">{orderData.customer_current_points} نقطة</span>
                                </div>

                                <div className="mt-4 p-4 bg-white rounded-xl border border-purple-300">
                                    <p className="text-sm text-purple-800 font-bold mb-2">⚠️ عند معالجة الإرجاع:</p>
                                    <ul className="text-sm text-purple-700 space-y-1">
                                        <li>✅ سيتم إرجاع المنتجات للمخزن</li>
                                        <li>✅ سيتم خصم {orderData.points_earned_from_order} نقطة من العميل</li>
                                        <li>✅ يجب رد مبلغ {orderData.total} جنيه نقداً</li>
                                    </ul>
                                </div>
                            </div>
                        </div>

                        {/* Action Button */}
                        {orderData.can_be_returned && !orderData.already_returned && (
                            <button
                                onClick={handleProcessReturn}
                                disabled={isProcessing}
                                className="w-full bg-red-600 text-white font-bold py-4 rounded-xl hover:bg-red-700 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors shadow-lg flex items-center justify-center gap-2"
                            >
                                {isProcessing ? (
                                    <>جاري معالجة الإرجاع...</>
                                ) : (
                                    <>
                                        <CheckCircle size={20} />
                                        تأكيد معالجة الإرجاع
                                    </>
                                )}
                            </button>
                        )}
                    </div>
                )}

                {/* Help Text */}
                {!orderData && !isSearching && (
                    <div className="text-center py-12 text-gray-400">
                        <Package size={64} className="mx-auto mb-4 opacity-50" />
                        <p>ابحث عن طلب لبدء معالجة الإرجاع</p>
                    </div>
                )}
            </div>
        </div>
    );
};

export default ReturnsPage;
