import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { api } from '../services/api';
import LoadingSpinner from '../components/LoadingSpinner';
import ErrorMessage from '../components/ErrorMessage';
import { ORDER_STATUS_LABELS } from '../src/config';

const statuses = ['pending','confirmed','preparing','out_for_delivery','delivered'] as const;

const OrderTrackingPage: React.FC = () => {
  const { orderId } = useParams();
  const [order, setOrder] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

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

  useEffect(() => { fetchOrder(); }, [orderId]);

  if (loading) return <LoadingSpinner fullScreen message="جاري تحميل التتبع..." />;
  if (error) return <ErrorMessage fullScreen message={error} onRetry={fetchOrder} />;

  const currentStatus = order?.status || 'pending';

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-3xl mx-auto p-6">
        <div className="bg-white rounded-2xl shadow-sm border p-6">
          <h1 className="text-2xl font-bold text-gray-900 mb-1">تتبع الطلب #{order?.id}</h1>
          <p className="text-gray-600 mb-6">الحالة الحالية: {ORDER_STATUS_LABELS[currentStatus] || currentStatus}</p>

          <div className="relative">
            <div className="absolute left-4 top-0 bottom-0 w-1 bg-gray-200 rounded-full" />
            <ul className="space-y-6">
              {statuses.map((st) => {
                const active = statuses.indexOf(st as any) <= statuses.indexOf(currentStatus as any);
                return (
                  <li key={st} className="relative pl-10">
                    <div className={`absolute left-0 top-1 w-8 h-8 rounded-full flex items-center justify-center ${active ? 'bg-green-600 text-white' : 'bg-gray-200 text-gray-400'}`}>
                      {active ? (
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" /></svg>
                      ) : (
                        <span className="w-2 h-2 bg-white rounded-full" />
                      )}
                    </div>
                    <div className="bg-gray-50 rounded-xl p-4 border">
                      <div className="font-semibold text-gray-900">{ORDER_STATUS_LABELS[st] || st}</div>
                    </div>
                  </li>
                );
              })}
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
};

export default OrderTrackingPage;
