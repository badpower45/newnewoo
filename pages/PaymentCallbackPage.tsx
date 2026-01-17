import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, useSearchParams } from 'react-router-dom';
import { CheckCircle, XCircle, Loader, ArrowRight } from 'lucide-react';
import { api } from '../services/api';
import Footer from '../components/Footer';

/**
 * صفحة Callback للدفع الإلكتروني
 * يتم استدعاؤها بعد إتمام/فشل عملية الدفع عبر Paymob
 */
export default function PaymentCallbackPage() {
    const navigate = useNavigate();
    const [searchParams] = useSearchParams();
    const [status, setStatus] = useState<'loading' | 'success' | 'failed'>('loading');
    const [message, setMessage] = useState('جاري التحقق من عملية الدفع...');
    const [orderData, setOrderData] = useState<any>(null);

    useEffect(() => {
        verifyPayment();
    }, []);

    const verifyPayment = async () => {
        try {
            // الحصول على parameters من URL
            const success = searchParams.get('success');
            const orderId = searchParams.get('merchant_order_id') || searchParams.get('order');
            const transactionId = searchParams.get('id');
            const hmac = searchParams.get('hmac');

            console.log('🔍 Verifying payment:', { success, orderId, transactionId });

            if (!orderId) {
                setStatus('failed');
                setMessage('فشل التحقق من الطلب');
                return;
            }

            // التحقق من حالة الدفع من الـ backend
            const response = await api.get(`/payment/status/${orderId}`);
            
            if (response.data.success) {
                const transaction = response.data.transaction;
                
                if (transaction.status === 'completed' || transaction.payment_status === 'paid') {
                    setStatus('success');
                    setMessage('تم إتمام عملية الدفع بنجاح! ✅');
                    setOrderData({
                        order_id: transaction.order_id,
                        order_code: transaction.order_code,
                        amount: transaction.amount
                    });
                } else if (transaction.status === 'failed') {
                    setStatus('failed');
                    setMessage('فشلت عملية الدفع. يرجى المحاولة مرة أخرى.');
                } else {
                    setStatus('loading');
                    setMessage('جاري معالجة الدفع...');
                    // إعادة المحاولة بعد ثانيتين
                    setTimeout(() => verifyPayment(), 2000);
                }
            } else {
                setStatus('failed');
                setMessage('لم يتم العثور على معلومات الدفع');
            }

        } catch (error) {
            console.error('❌ Payment verification error:', error);
            setStatus('failed');
            setMessage('حدث خطأ أثناء التحقق من الدفع');
        }
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 flex flex-col">
            <div className="flex-1 flex items-center justify-center p-4">
                <div className="bg-white rounded-3xl shadow-2xl p-8 md:p-12 max-w-lg w-full text-center">
                    
                    {status === 'loading' && (
                        <>
                            <div className="w-24 h-24 mx-auto mb-6 relative">
                                <Loader className="w-24 h-24 text-blue-500 animate-spin" />
                            </div>
                            <h1 className="text-2xl md:text-3xl font-bold text-gray-900 mb-4">
                                جاري التحقق من الدفع
                            </h1>
                            <p className="text-gray-600 mb-6">{message}</p>
                            <div className="flex justify-center gap-2">
                                <div className="w-3 h-3 bg-blue-500 rounded-full animate-bounce" style={{animationDelay: '0ms'}}></div>
                                <div className="w-3 h-3 bg-blue-500 rounded-full animate-bounce" style={{animationDelay: '150ms'}}></div>
                                <div className="w-3 h-3 bg-blue-500 rounded-full animate-bounce" style={{animationDelay: '300ms'}}></div>
                            </div>
                        </>
                    )}

                    {status === 'success' && (
                        <>
                            <div className="w-24 h-24 mx-auto mb-6 bg-green-100 rounded-full flex items-center justify-center">
                                <CheckCircle className="w-16 h-16 text-green-600" />
                            </div>
                            <h1 className="text-2xl md:text-3xl font-bold text-gray-900 mb-4">
                                تم الدفع بنجاح! 🎉
                            </h1>
                            <p className="text-gray-600 mb-2">{message}</p>
                            
                            {orderData && (
                                <div className="bg-green-50 border border-green-200 rounded-xl p-4 my-6 text-right">
                                    <p className="text-sm text-gray-600 mb-1">رقم الطلب</p>
                                    <p className="text-xl font-bold text-gray-900 mb-3">
                                        {orderData.order_code || `#${orderData.order_id}`}
                                    </p>
                                    <p className="text-sm text-gray-600 mb-1">المبلغ المدفوع</p>
                                    <p className="text-2xl font-bold text-green-600">
                                        {orderData.amount} جنيه
                                    </p>
                                </div>
                            )}

                            <div className="flex flex-col gap-3 mt-6">
                                {orderData?.order_id && (
                                    <button
                                        onClick={() => navigate(`/order-invoice/${orderData.order_id}`)}
                                        className="w-full bg-green-600 text-white font-bold py-4 rounded-xl hover:bg-green-700 transition-colors flex items-center justify-center gap-2"
                                    >
                                        <CheckCircle size={20} />
                                        عرض الفاتورة
                                    </button>
                                )}
                                <button
                                    onClick={() => navigate('/track-order')}
                                    className="w-full bg-blue-600 text-white font-bold py-4 rounded-xl hover:bg-blue-700 transition-colors flex items-center justify-center gap-2"
                                >
                                    تتبع الطلب
                                </button>
                                <button
                                    onClick={() => navigate('/')}
                                    className="w-full bg-gray-100 text-gray-700 font-medium py-3 rounded-xl hover:bg-gray-200 transition-colors"
                                >
                                    العودة للرئيسية
                                </button>
                            </div>
                        </>
                    )}

                    {status === 'failed' && (
                        <>
                            <div className="w-24 h-24 mx-auto mb-6 bg-red-100 rounded-full flex items-center justify-center">
                                <XCircle className="w-16 h-16 text-red-600" />
                            </div>
                            <h1 className="text-2xl md:text-3xl font-bold text-gray-900 mb-4">
                                فشل الدفع ❌
                            </h1>
                            <p className="text-gray-600 mb-6">{message}</p>
                            
                            <div className="bg-red-50 border border-red-200 rounded-xl p-4 mb-6 text-right">
                                <p className="text-sm text-red-800">
                                    <strong>ماذا يمكنني فعله؟</strong>
                                </p>
                                <ul className="text-sm text-red-700 mt-2 space-y-1 list-disc list-inside">
                                    <li>تحقق من بطاقتك وحاول مرة أخرى</li>
                                    <li>استخدم بطاقة أخرى</li>
                                    <li>اختر الدفع عند الاستلام (COD)</li>
                                </ul>
                            </div>

                            <div className="flex flex-col gap-3">
                                <button
                                    onClick={() => navigate('/cart')}
                                    className="w-full bg-brand-orange text-white font-bold py-4 rounded-xl hover:bg-orange-600 transition-colors flex items-center justify-center gap-2"
                                >
                                    <ArrowRight size={20} />
                                    العودة للسلة وإعادة المحاولة
                                </button>
                                <button
                                    onClick={() => navigate('/')}
                                    className="w-full bg-gray-100 text-gray-700 font-medium py-3 rounded-xl hover:bg-gray-200 transition-colors"
                                >
                                    العودة للرئيسية
                                </button>
                            </div>
                        </>
                    )}

                </div>
            </div>
            <Footer />
        </div>
    );
}
