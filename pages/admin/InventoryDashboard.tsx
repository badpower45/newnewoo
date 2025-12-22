import React, { useState, useEffect } from 'react';
import { Package, AlertTriangle, TrendingDown, TrendingUp, Calendar, MapPin, Archive, CheckCircle, XCircle } from 'lucide-react';
import { api } from '../../services/api';

interface InventoryBatch {
    id: number;
    product_id: string;
    product_name: string;
    location_id: number;
    location_name: string;
    batch_number: string;
    quantity_received: number;
    quantity_remaining: number;
    unit_cost: number;
    expiry_date: string | null;
    received_date: string;
}

interface InventoryAlert {
    id: number;
    product_id: string;
    product_name: string;
    location_name: string;
    alert_type: string;
    severity: string;
    message: string;
    is_resolved: boolean;
    created_at: string;
}

interface InventoryTransaction {
    id: number;
    product_name: string;
    location_name: string;
    transaction_type: string;
    quantity: number;
    unit_cost: number;
    reference_type: string;
    reference_id: number;
    created_at: string;
}

const InventoryDashboard = () => {
    const [batches, setBatches] = useState<InventoryBatch[]>([]);
    const [alerts, setAlerts] = useState<InventoryAlert[]>([]);
    const [transactions, setTransactions] = useState<InventoryTransaction[]>([]);
    const [loading, setLoading] = useState(true);
    const [activeTab, setActiveTab] = useState<'batches' | 'alerts' | 'transactions'>('batches');
    const [stats, setStats] = useState({
        totalBatches: 0,
        activeAlerts: 0,
        lowStockItems: 0,
        expiringItems: 0
    });

    useEffect(() => {
        loadData();
    }, []);

    const loadData = async () => {
        setLoading(true);
        try {
            const [batchesRes, alertsRes, transactionsRes] = await Promise.all([
                api.get('/inventory/batches'),
                api.get('/inventory/alerts'),
                api.get('/inventory/transactions')
            ]);

            const batchesData = batchesRes.data || [];
            const alertsData = alertsRes.data || [];
            const transactionsData = transactionsRes.data || [];

            setBatches(batchesData);
            setAlerts(alertsData);
            setTransactions(transactionsData);

            // Calculate stats
            const activeAlertsCount = alertsData.filter((a: InventoryAlert) => !a.is_resolved).length;
            const lowStockCount = alertsData.filter((a: InventoryAlert) => 
                a.alert_type === 'LOW_STOCK' && !a.is_resolved
            ).length;
            const expiringCount = alertsData.filter((a: InventoryAlert) => 
                (a.alert_type === 'EXPIRING_SOON' || a.alert_type === 'EXPIRED') && !a.is_resolved
            ).length;

            setStats({
                totalBatches: batchesData.length,
                activeAlerts: activeAlertsCount,
                lowStockItems: lowStockCount,
                expiringItems: expiringCount
            });
        } catch (error) {
            console.error('Failed to load inventory data:', error);
        } finally {
            setLoading(false);
        }
    };

    const resolveAlert = async (alertId: number) => {
        try {
            await api.put(`/inventory/alerts/${alertId}/resolve`);
            loadData(); // Reload data
        } catch (error) {
            console.error('Failed to resolve alert:', error);
        }
    };

    const getAlertColor = (severity: string) => {
        switch (severity) {
            case 'critical': return 'bg-red-100 text-red-800 border-red-300';
            case 'high': return 'bg-orange-100 text-orange-800 border-orange-300';
            case 'medium': return 'bg-yellow-100 text-yellow-800 border-yellow-300';
            default: return 'bg-blue-100 text-blue-800 border-blue-300';
        }
    };

    const getTransactionColor = (type: string) => {
        switch (type) {
            case 'IN': return 'text-green-600';
            case 'OUT': return 'text-red-600';
            case 'RETURN': return 'text-blue-600';
            case 'ADJUSTMENT': return 'text-purple-600';
            default: return 'text-gray-600';
        }
    };

    const getTransactionIcon = (type: string) => {
        switch (type) {
            case 'IN': return <TrendingUp size={16} />;
            case 'OUT': return <TrendingDown size={16} />;
            case 'RETURN': return <Archive size={16} />;
            default: return <Package size={16} />;
        }
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center h-96">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-brand-orange"></div>
            </div>
        );
    }

    return (
        <div className="p-6 space-y-6">
            {/* Header */}
            <div>
                <h1 className="text-3xl font-bold text-gray-900">إدارة المخزون</h1>
                <p className="text-gray-600 mt-2">نظام المخزون الدائم مع تتبع FIFO</p>
            </div>

            {/* Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-200">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-gray-600 text-sm">إجمالي البتشات</p>
                            <h3 className="text-3xl font-bold text-gray-900 mt-1">{stats.totalBatches}</h3>
                        </div>
                        <div className="w-12 h-12 bg-blue-100 text-blue-600 rounded-xl flex items-center justify-center">
                            <Package size={24} />
                        </div>
                    </div>
                </div>

                <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-200">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-gray-600 text-sm">تنبيهات نشطة</p>
                            <h3 className="text-3xl font-bold text-orange-600 mt-1">{stats.activeAlerts}</h3>
                        </div>
                        <div className="w-12 h-12 bg-orange-100 text-orange-600 rounded-xl flex items-center justify-center">
                            <AlertTriangle size={24} />
                        </div>
                    </div>
                </div>

                <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-200">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-gray-600 text-sm">مخزون منخفض</p>
                            <h3 className="text-3xl font-bold text-red-600 mt-1">{stats.lowStockItems}</h3>
                        </div>
                        <div className="w-12 h-12 bg-red-100 text-red-600 rounded-xl flex items-center justify-center">
                            <TrendingDown size={24} />
                        </div>
                    </div>
                </div>

                <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-200">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-gray-600 text-sm">منتهية الصلاحية قريباً</p>
                            <h3 className="text-3xl font-bold text-yellow-600 mt-1">{stats.expiringItems}</h3>
                        </div>
                        <div className="w-12 h-12 bg-yellow-100 text-yellow-600 rounded-xl flex items-center justify-center">
                            <Calendar size={24} />
                        </div>
                    </div>
                </div>
            </div>

            {/* Tabs */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200">
                <div className="border-b border-gray-200">
                    <div className="flex gap-4 p-4">
                        <button
                            onClick={() => setActiveTab('batches')}
                            className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                                activeTab === 'batches'
                                    ? 'bg-brand-orange text-white'
                                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                            }`}
                        >
                            البتشات ({batches.length})
                        </button>
                        <button
                            onClick={() => setActiveTab('alerts')}
                            className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                                activeTab === 'alerts'
                                    ? 'bg-brand-orange text-white'
                                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                            }`}
                        >
                            التنبيهات ({alerts.filter(a => !a.is_resolved).length})
                        </button>
                        <button
                            onClick={() => setActiveTab('transactions')}
                            className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                                activeTab === 'transactions'
                                    ? 'bg-brand-orange text-white'
                                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                            }`}
                        >
                            المعاملات ({transactions.length})
                        </button>
                    </div>
                </div>

                <div className="p-6">
                    {/* Batches Tab */}
                    {activeTab === 'batches' && (
                        <div className="space-y-4">
                            {batches.length === 0 ? (
                                <div className="text-center py-12 text-gray-500">
                                    <Package size={48} className="mx-auto mb-4 text-gray-300" />
                                    <p>لا توجد بتشات حالياً</p>
                                </div>
                            ) : (
                                <div className="overflow-x-auto">
                                    <table className="w-full">
                                        <thead className="bg-gray-50">
                                            <tr>
                                                <th className="px-4 py-3 text-right text-sm font-semibold text-gray-700">رقم البتش</th>
                                                <th className="px-4 py-3 text-right text-sm font-semibold text-gray-700">المنتج</th>
                                                <th className="px-4 py-3 text-right text-sm font-semibold text-gray-700">الموقع</th>
                                                <th className="px-4 py-3 text-right text-sm font-semibold text-gray-700">الكمية المستلمة</th>
                                                <th className="px-4 py-3 text-right text-sm font-semibold text-gray-700">الكمية المتبقية</th>
                                                <th className="px-4 py-3 text-right text-sm font-semibold text-gray-700">تاريخ الانتهاء</th>
                                                <th className="px-4 py-3 text-right text-sm font-semibold text-gray-700">تاريخ الاستلام</th>
                                            </tr>
                                        </thead>
                                        <tbody className="divide-y divide-gray-200">
                                            {batches.map((batch) => (
                                                <tr key={batch.id} className="hover:bg-gray-50">
                                                    <td className="px-4 py-3 text-sm font-mono">{batch.batch_number}</td>
                                                    <td className="px-4 py-3 text-sm font-medium">{batch.product_name}</td>
                                                    <td className="px-4 py-3 text-sm text-gray-600">
                                                        <div className="flex items-center gap-1">
                                                            <MapPin size={14} />
                                                            {batch.location_name}
                                                        </div>
                                                    </td>
                                                    <td className="px-4 py-3 text-sm">{batch.quantity_received}</td>
                                                    <td className="px-4 py-3 text-sm">
                                                        <span className={`font-semibold ${
                                                            batch.quantity_remaining === 0 
                                                                ? 'text-red-600' 
                                                                : batch.quantity_remaining < batch.quantity_received * 0.2
                                                                ? 'text-orange-600'
                                                                : 'text-green-600'
                                                        }`}>
                                                            {batch.quantity_remaining}
                                                        </span>
                                                    </td>
                                                    <td className="px-4 py-3 text-sm">
                                                        {batch.expiry_date ? (
                                                            <span className={`${
                                                                new Date(batch.expiry_date) < new Date()
                                                                    ? 'text-red-600 font-semibold'
                                                                    : new Date(batch.expiry_date) < new Date(Date.now() + 7 * 24 * 60 * 60 * 1000)
                                                                    ? 'text-orange-600'
                                                                    : 'text-gray-600'
                                                            }`}>
                                                                {new Date(batch.expiry_date).toLocaleDateString('ar-EG')}
                                                            </span>
                                                        ) : (
                                                            <span className="text-gray-400">-</span>
                                                        )}
                                                    </td>
                                                    <td className="px-4 py-3 text-sm text-gray-600">
                                                        {new Date(batch.received_date).toLocaleDateString('ar-EG')}
                                                    </td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>
                            )}
                        </div>
                    )}

                    {/* Alerts Tab */}
                    {activeTab === 'alerts' && (
                        <div className="space-y-3">
                            {alerts.filter(a => !a.is_resolved).length === 0 ? (
                                <div className="text-center py-12 text-gray-500">
                                    <CheckCircle size={48} className="mx-auto mb-4 text-green-300" />
                                    <p>لا توجد تنبيهات نشطة! 🎉</p>
                                </div>
                            ) : (
                                alerts.filter(a => !a.is_resolved).map((alert) => (
                                    <div
                                        key={alert.id}
                                        className={`p-4 rounded-xl border ${getAlertColor(alert.severity)}`}
                                    >
                                        <div className="flex items-start justify-between">
                                            <div className="flex items-start gap-3">
                                                <AlertTriangle size={20} className="flex-shrink-0 mt-0.5" />
                                                <div>
                                                    <h4 className="font-semibold mb-1">{alert.message}</h4>
                                                    <p className="text-sm opacity-80">
                                                        {alert.product_name} - {alert.location_name}
                                                    </p>
                                                    <p className="text-xs mt-1 opacity-60">
                                                        {new Date(alert.created_at).toLocaleString('ar-EG')}
                                                    </p>
                                                </div>
                                            </div>
                                            <button
                                                onClick={() => resolveAlert(alert.id)}
                                                className="bg-white px-3 py-1 rounded-lg text-sm font-medium hover:bg-gray-50 transition-colors"
                                            >
                                                حل
                                            </button>
                                        </div>
                                    </div>
                                ))
                            )}
                        </div>
                    )}

                    {/* Transactions Tab */}
                    {activeTab === 'transactions' && (
                        <div className="space-y-4">
                            {transactions.length === 0 ? (
                                <div className="text-center py-12 text-gray-500">
                                    <Archive size={48} className="mx-auto mb-4 text-gray-300" />
                                    <p>لا توجد معاملات</p>
                                </div>
                            ) : (
                                <div className="overflow-x-auto">
                                    <table className="w-full">
                                        <thead className="bg-gray-50">
                                            <tr>
                                                <th className="px-4 py-3 text-right text-sm font-semibold text-gray-700">النوع</th>
                                                <th className="px-4 py-3 text-right text-sm font-semibold text-gray-700">المنتج</th>
                                                <th className="px-4 py-3 text-right text-sm font-semibold text-gray-700">الموقع</th>
                                                <th className="px-4 py-3 text-right text-sm font-semibold text-gray-700">الكمية</th>
                                                <th className="px-4 py-3 text-right text-sm font-semibold text-gray-700">التكلفة</th>
                                                <th className="px-4 py-3 text-right text-sm font-semibold text-gray-700">المرجع</th>
                                                <th className="px-4 py-3 text-right text-sm font-semibold text-gray-700">التاريخ</th>
                                            </tr>
                                        </thead>
                                        <tbody className="divide-y divide-gray-200">
                                            {transactions.map((transaction) => (
                                                <tr key={transaction.id} className="hover:bg-gray-50">
                                                    <td className="px-4 py-3">
                                                        <div className={`flex items-center gap-2 ${getTransactionColor(transaction.transaction_type)}`}>
                                                            {getTransactionIcon(transaction.transaction_type)}
                                                            <span className="text-sm font-medium">{transaction.transaction_type}</span>
                                                        </div>
                                                    </td>
                                                    <td className="px-4 py-3 text-sm font-medium">{transaction.product_name}</td>
                                                    <td className="px-4 py-3 text-sm text-gray-600">{transaction.location_name}</td>
                                                    <td className="px-4 py-3">
                                                        <span className={`text-sm font-semibold ${
                                                            transaction.quantity > 0 ? 'text-green-600' : 'text-red-600'
                                                        }`}>
                                                            {transaction.quantity > 0 ? '+' : ''}{transaction.quantity}
                                                        </span>
                                                    </td>
                                                    <td className="px-4 py-3 text-sm text-gray-600">
                                                        {transaction.unit_cost ? `${transaction.unit_cost.toFixed(2)} جنيه` : '-'}
                                                    </td>
                                                    <td className="px-4 py-3 text-sm text-gray-500">
                                                        {transaction.reference_type} #{transaction.reference_id}
                                                    </td>
                                                    <td className="px-4 py-3 text-sm text-gray-600">
                                                        {new Date(transaction.created_at).toLocaleString('ar-EG')}
                                                    </td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>
                            )}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default InventoryDashboard;
