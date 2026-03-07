import React, { useEffect, useState } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { api } from '../services/api';
import LoadingSpinner from '../components/LoadingSpinner';
import ErrorMessage from '../components/ErrorMessage';
import { Copy, Check, Package, Truck, CheckCircle } from 'lucide-react';

const OrderConfirmationPage: React.FC = () => {
  const { orderId } = useParams();
  const navigate = useNavigate();
  const [order, setOrder] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    const fetchOrder = async () => {
      if (!orderId) return;
      setLoading(true);
      setError(null);
      try {
        const data = await api.orders.getOne(orderId);
        const orderData = data.data || data;
        console.log('📦 Order loaded:', orderData);
        setOrder(orderData);
      } catch (err) {
        console.error('❌ Failed to load order:', err);
        setError('تعذر تحميل تفاصيل الطلب');
      } finally {
        setLoading(false);
      }
    };
    fetchOrder();
  }, [orderId]);

  const copyOrderCode = () => {
    if (order?.order_code) {
      navigator.clipboard.writeText(order.order_code);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  if (loading) return <LoadingSpinner fullScreen message="جاري تحميل تفاصيل الطلب..." />;
  if (error) return <ErrorMessage fullScreen message={error} onRetry={() => navigate('/')} />;

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-orange-50">
      <div className="max-w-3xl mx-auto p-6 pt-10">
        <div className="bg-white rounded-3xl shadow-xl border p-8 text-center">
          {/* Success Icon */}
          <div className="w-20 h-20 mx-auto rounded-full bg-green-100 flex items-center justify-center mb-6 animate-bounce">
            <svg className="w-10 h-10 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
          </div>
          
          <h1 className="text-3xl font-bold text-gray-900 mb-2">شكراً لك! 🎉</h1>
          <p className="text-gray-600 mb-6">تم استلام طلبك بنجاح</p>

          {/* Order Code - Highlighted */}
          <div className="bg-gradient-to-r from-brand-orange/10 to-brand-brown/10 rounded-2xl p-6 mb-6 border-2 border-dashed border-brand-orange/30">
            <p className="text-sm text-gray-600 mb-2">كود تتبع الطلب</p>
            <div className="flex items-center justify-center gap-3">
              <span className="text-3xl font-bold text-brand-brown tracking-wider font-mono">
                {order?.order_code || `#${order?.id}`}
              </span>
              <button 
                onClick={copyOrderCode}
                className="p-2 rounded-lg bg-white hover:bg-gray-100 transition-colors border shadow-sm"
                title="نسخ الكود"
              >
                {copied ? (
                  <Check size={20} className="text-green-600" />
                ) : (
                  <Copy size={20} className="text-gray-500" />
                )}
              </button>
            </div>
            <p className="text-xs text-gray-500 mt-3">
              📝 احتفظ بهذا الكود لتتبع طلبك
            </p>
          </div>

          {/* Order Summary */}
          <div className="text-right bg-gray-50 rounded-xl p-4 mb-6">
            <h3 className="font-semibold mb-3 flex items-center gap-2">
              <Package size={18} className="text-brand-orange" />
              ملخص الطلب
            </h3>
            <ul className="space-y-2 text-sm">
              {(order?.items || []).map((it: any, idx: number) => (
                <li key={idx} className="flex justify-between py-1 border-b border-gray-100 last:border-0">
                  <span className="text-gray-700">{it.name || it.product_name || `منتج #${it.product_id || it.id}`}</span>
                  <span className="text-gray-900 font-medium">x{it.quantity}</span>
                </li>
              ))}
            </ul>
            <div className="flex justify-between mt-4 pt-3 border-t border-gray-200 font-bold">
              <span>الإجمالي</span>
              <span className="text-brand-orange">{order?.total} ج.م</span>
            </div>
          </div>

          {/* Status */}
          <div className="bg-yellow-50 rounded-xl p-4 mb-6 flex items-center justify-center gap-3">
            <div className="w-3 h-3 bg-yellow-500 rounded-full animate-pulse"></div>
            <span className="text-yellow-800 font-medium">الحالة: في انتظار التأكيد</span>
          </div>

          {/* Actions */}
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            {order?.id && (
              <Link 
                to={`/order-invoice/${order.id}`}
                className="px-6 py-3 bg-green-600 text-white rounded-xl hover:bg-green-700 transition-colors font-medium flex items-center justify-center gap-2"
              >
                <CheckCircle size={18} />
                عرض الفاتورة
              </Link>
            )}
            <Link 
              to={`/track-order`}
              state={{ orderCode: order?.order_code }}
              className="px-6 py-3 bg-brand-orange text-white rounded-xl hover:bg-orange-600 transition-colors font-medium flex items-center justify-center gap-2"
            >
              <Truck size={18} />
              تتبع الطلب
            </Link>
            <Link to="/products" className="px-6 py-3 bg-gray-100 text-gray-700 rounded-xl hover:bg-gray-200 transition-colors font-medium">
              متابعة التسوق
            </Link>
          </div>
        </div>

      </div>
    </div>
  );
};

export default OrderConfirmationPage;
