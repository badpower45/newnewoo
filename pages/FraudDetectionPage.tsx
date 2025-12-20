import React, { useState, useEffect } from 'react';
import { AlertTriangle, Shield, Ban, CheckCircle, TrendingUp, Users } from 'lucide-react';
import { api } from '../services/api';

const FraudDetectionPage = () => {
    const [suspiciousCustomers, setSuspiciousCustomers] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [isBlocking, setIsBlocking] = useState({});

    useEffect(() => {
        loadSuspiciousCustomers();
    }, []);

    const loadSuspiciousCustomers = async () => {
        setIsLoading(true);
        try {
            const response = await api.get('/returns/admin/suspicious-customers');
            setSuspiciousCustomers(response.data || []);
        } catch (err) {
            console.error('Failed to load suspicious customers:', err);
        } finally {
            setIsLoading(false);
        }
    };

    const handleBlockCustomer = async (customerId, currentlyBlocked) => {
        const action = currentlyBlocked ? 'unblock' : 'block';
        const reason = currentlyBlocked 
            ? null 
            : prompt('يرجى إدخال سبب الحظر:');

        if (!currentlyBlocked && !reason) return;

        setIsBlocking(prev => ({ ...prev, [customerId]: true }));

        try {
            await api.post(`/returns/admin/block-customer/${customerId}`, {
                block: !currentlyBlocked,
                reason
            });

            alert(`✅ تم ${currentlyBlocked ? 'إلغاء الحظر عن' : 'حظر'} العميل بنجاح`);
            loadSuspiciousCustomers();
        } catch (err) {
            alert('فشلت العملية: ' + (err.response?.data?.error || err.message));
        } finally {
            setIsBlocking(prev => ({ ...prev, [customerId]: false }));
        }
    };

    const getRiskColor = (level) => {
        switch (level) {
            case 'HIGH': return 'bg-red-100 text-red-800 border-red-300';
            case 'MEDIUM': return 'bg-amber-100 text-amber-800 border-amber-300';
            default: return 'bg-blue-100 text-blue-800 border-blue-300';
        }
    };

    if (isLoading) {
        return (
            <div className="min-h-screen bg-gray-50 flex items-center justify-center">
                <div className="text-center">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
                    <p className="text-gray-500">جاري التحميل...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-50 pb-8">
            {/* Header */}
            <div className="bg-gradient-to-r from-red-600 to-orange-600 text-white shadow-lg">
                <div className="max-w-7xl mx-auto p-6">
                    <div className="flex items-center gap-4 mb-4">
                        <Shield size={40} />
                        <div>
                            <h1 className="text-3xl font-bold">نظام كشف الاحتيال</h1>
                            <p className="text-red-100">Fraud Detection & Customer Monitoring</p>
                        </div>
                    </div>

                    {/* Stats */}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-6">
                        <div className="bg-white/10 backdrop-blur rounded-xl p-4">
                            <div className="flex items-center gap-3">
                                <Users className="text-white" size={24} />
                                <div>
                                    <p className="text-sm text-red-100">إجمالي العملاء المشبوهين</p>
                                    <p className="text-2xl font-bold">{suspiciousCustomers.length}</p>
                                </div>
                            </div>
                        </div>
                        <div className="bg-white/10 backdrop-blur rounded-xl p-4">
                            <div className="flex items-center gap-3">
                                <Ban className="text-white" size={24} />
                                <div>
                                    <p className="text-sm text-red-100">العملاء المحظورين</p>
                                    <p className="text-2xl font-bold">
                                        {suspiciousCustomers.filter(c => c.is_blocked).length}
                                    </p>
                                </div>
                            </div>
                        </div>
                        <div className="bg-white/10 backdrop-blur rounded-xl p-4">
                            <div className="flex items-center gap-3">
                                <AlertTriangle className="text-white" size={24} />
                                <div>
                                    <p className="text-sm text-red-100">مخاطر عالية</p>
                                    <p className="text-2xl font-bold">
                                        {suspiciousCustomers.filter(c => c.risk_level === 'HIGH').length}
                                    </p>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Customer List */}
            <div className="max-w-7xl mx-auto p-6">
                <div className="bg-white rounded-2xl shadow-lg overflow-hidden">
                    <div className="overflow-x-auto">
                        <table className="w-full">
                            <thead className="bg-gray-100 border-b-2 border-gray-200">
                                <tr>
                                    <th className="px-6 py-4 text-right text-sm font-bold text-gray-700">العميل</th>
                                    <th className="px-6 py-4 text-center text-sm font-bold text-gray-700">مستوى الخطر</th>
                                    <th className="px-6 py-4 text-center text-sm font-bold text-gray-700">درجة الاحتيال</th>
                                    <th className="px-6 py-4 text-center text-sm font-bold text-gray-700">الطلبات</th>
                                    <th className="px-6 py-4 text-center text-sm font-bold text-gray-700">الملغي/المرفوض</th>
                                    <th className="px-6 py-4 text-center text-sm font-bold text-gray-700">المرتجعات</th>
                                    <th className="px-6 py-4 text-center text-sm font-bold text-gray-700">الحالة</th>
                                    <th className="px-6 py-4 text-center text-sm font-bold text-gray-700">الإجراء</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-200">
                                {suspiciousCustomers.map((customer) => (
                                    <tr key={customer.id} className={customer.is_blocked ? 'bg-red-50' : 'hover:bg-gray-50'}>
                                        <td className="px-6 py-4">
                                            <div>
                                                <p className="font-bold text-gray-900">{customer.name}</p>
                                                <p className="text-sm text-gray-500">{customer.email}</p>
                                                <p className="text-sm text-gray-500" dir="ltr">{customer.phone}</p>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 text-center">
                                            <span className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-bold border ${getRiskColor(customer.risk_level)}`}>
                                                {customer.risk_level === 'HIGH' && <AlertTriangle size={14} />}
                                                {customer.risk_level}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 text-center">
                                            <span className="text-2xl font-bold text-red-600">{customer.fraud_score}</span>
                                        </td>
                                        <td className="px-6 py-4 text-center">
                                            <span className="font-bold text-gray-900">{customer.total_orders}</span>
                                        </td>
                                        <td className="px-6 py-4 text-center">
                                            <div className="text-sm">
                                                <p className="font-bold text-amber-600">{customer.cancelled_orders} ملغي</p>
                                                <p className="font-bold text-red-600">{customer.rejected_orders} مرفوض</p>
                                                <p className="text-xs text-gray-500">
                                                    ({customer.cancellation_rate}% / {customer.rejection_rate}%)
                                                </p>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 text-center">
                                            <div className="text-sm">
                                                <p className="font-bold text-purple-600">{customer.total_returns}</p>
                                                <p className="text-xs text-gray-500">({customer.return_rate}%)</p>
                                                <p className="text-xs font-bold text-green-600">
                                                    {customer.total_refunds.toFixed(2)} EGP
                                                </p>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 text-center">
                                            {customer.is_blocked ? (
                                                <span className="inline-flex items-center gap-1 px-3 py-1 bg-red-100 text-red-800 rounded-full text-xs font-bold">
                                                    <Ban size={14} />
                                                    محظور
                                                </span>
                                            ) : (
                                                <span className="inline-flex items-center gap-1 px-3 py-1 bg-green-100 text-green-800 rounded-full text-xs font-bold">
                                                    <CheckCircle size={14} />
                                                    نشط
                                                </span>
                                            )}
                                        </td>
                                        <td className="px-6 py-4 text-center">
                                            <button
                                                onClick={() => handleBlockCustomer(customer.id, customer.is_blocked)}
                                                disabled={isBlocking[customer.id]}
                                                className={`px-4 py-2 rounded-lg font-bold transition-colors disabled:opacity-50 disabled:cursor-not-allowed ${
                                                    customer.is_blocked
                                                        ? 'bg-green-600 text-white hover:bg-green-700'
                                                        : 'bg-red-600 text-white hover:bg-red-700'
                                                }`}
                                            >
                                                {isBlocking[customer.id] 
                                                    ? '...' 
                                                    : customer.is_blocked ? 'إلغاء الحظر' : 'حظر'}
                                            </button>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>

                    {suspiciousCustomers.length === 0 && (
                        <div className="text-center py-12 text-gray-400">
                            <Shield size={64} className="mx-auto mb-4 opacity-50" />
                            <p className="text-lg">لا يوجد عملاء مشبوهين حالياً</p>
                            <p className="text-sm">النظام يعمل بشكل طبيعي! 🎉</p>
                        </div>
                    )}
                </div>

                {/* Legend */}
                <div className="mt-6 bg-white rounded-2xl shadow-sm p-6">
                    <h3 className="font-bold text-gray-900 mb-4">📊 كيف يتم حساب درجة الاحتيال؟</h3>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                        <div className="p-4 bg-amber-50 rounded-xl border border-amber-200">
                            <p className="font-bold text-amber-900 mb-2">الطلبات الملغاة</p>
                            <p className="text-amber-700">كل طلب ملغي = <span className="font-bold">+2 نقطة</span></p>
                        </div>
                        <div className="p-4 bg-red-50 rounded-xl border border-red-200">
                            <p className="font-bold text-red-900 mb-2">الطلبات المرفوضة</p>
                            <p className="text-red-700">كل طلب مرفوض = <span className="font-bold">+3 نقاط</span></p>
                        </div>
                        <div className="p-4 bg-purple-50 rounded-xl border border-purple-200">
                            <p className="font-bold text-purple-900 mb-2">المرتجعات</p>
                            <p className="text-purple-700">كل إرجاع = <span className="font-bold">+5 نقاط</span></p>
                        </div>
                    </div>
                    <div className="mt-4 p-4 bg-gray-50 rounded-xl">
                        <p className="text-sm text-gray-700">
                            <span className="font-bold">مستويات الخطر:</span> 
                            <span className="mx-2">•</span> LOW (0-9 نقاط)
                            <span className="mx-2">•</span> MEDIUM (10-19 نقطة)
                            <span className="mx-2">•</span> HIGH (20+ نقطة)
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default FraudDetectionPage;
