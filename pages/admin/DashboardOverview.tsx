import React, { useState, useEffect } from 'react';
import { DollarSign, ShoppingBag, Package, AlertTriangle, Users, TrendingUp, BarChart3 } from 'lucide-react';
import { api } from '../../services/api';

// Order Status Labels
const ORDER_STATUS_LABELS: Record<string, string> = {
    pending: 'بانتظار التأكيد',
    confirmed: 'تم التأكيد',
    preparing: 'جاري التحضير',
    ready: 'تم التحضير بانتظار العميل',
    out_for_delivery: 'في الطريق',
    delivered: 'تم التوصيل',
    cancelled: 'ملغي'
};

const DashboardOverview = () => {
    const [dashboardData, setDashboardData] = useState<any>(null);
    const [loading, setLoading] = useState(true);
    const [timeRange, setTimeRange] = useState<'7days' | '30days' | '90days' | 'year'>('30days');

    useEffect(() => {
        loadDashboard();
    }, [timeRange]);

    const loadDashboard = async () => {
        setLoading(true);
        try {
            console.log('🎯 Loading unified admin dashboard data...');
            
            // 🚀 Single API call for ALL dashboard data
            const response = await api.adminDashboard.getStats({
                timeRange: timeRange,
                limit: 10
            });
            
            if (response.success && response.data) {
                console.log('✅ Dashboard data loaded:', response.meta);
                setDashboardData(response.data);
            } else {
                throw new Error('Invalid dashboard response');
            }
        } catch (error) {
            console.error('❌ Failed to load dashboard data:', error);
            setDashboardData(null);
        } finally {
            setLoading(false);
        }
    };

    const stats = dashboardData?.statistics;
    const recentOrders = dashboardData?.recentOrders || [];
    const topProducts = dashboardData?.topProducts || [];

    const statsCards = stats ? [
        { 
            label: 'إجمالي الإيرادات', 
            value: `${(stats.revenue.total || 0).toLocaleString('ar-EG')} ج.م`, 
            icon: <DollarSign size={24} />, 
            color: 'bg-green-100 text-green-600',
            subtext: `متوسط: ${(stats.revenue.average || 0).toFixed(0)} ج.م`
        },
        { 
            label: 'إجمالي الطلبات', 
            value: (stats.orders.total || 0).toString(), 
            icon: <ShoppingBag size={24} />, 
            color: 'bg-blue-100 text-blue-600',
            subtext: `تم التوصيل: ${stats.orders.delivered || 0}`
        },
        { 
            label: 'المنتجات النشطة', 
            value: (stats.products.active || 0).toString(), 
            icon: <Package size={24} />, 
            color: 'bg-purple-100 text-purple-600',
            subtext: `مخزون منخفض: ${stats.products.lowStock || 0}`
        },
        { 
            label: 'طلبات معلقة', 
            value: (stats.orders.pending || 0).toString(), 
            icon: <AlertTriangle size={24} />, 
            color: 'bg-yellow-100 text-yellow-600',
            subtext: `ملغي: ${stats.orders.cancelled || 0}`
        },
        { 
            label: 'إجمالي المستخدمين', 
            value: (stats.users.total || 0).toString(), 
            icon:div>
                    <h1 className="admin-page-title">لوحة التحكم الرئيسية 🎯</h1>
                    <p className="admin-page-subtitle">نظرة عامة على الأداء والإحصائيات - تحديث فوري</p>
                </div>
                
                {/* Time Range Selector */}
                <div className="flex gap-2 mt-4">
                    {(['7days', '30days', '90days', 'year'] as const).map((range) => (
                        <button
                            key={range}
                            onClick={() => setTimeRange(range)}
                            className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
                                timeRange === range 
                                    ? 'bg-green-600 text-white' 
                                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                            }`}
                        >
                            {range === '7days' ? '7 أيام' : range === '30days' ? '30 يوم' : range === '90days' ? '90 يوم' : 'سنة'}
                        </button>
                    ))}
                </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 mb-6">
                {statsCards.map((stat, idx) => (
                    <div key={idx} className="admin-stat-card">
                        <div className="flex items-start gap-3 sm:gap-4">
                            <div className={`w-10 h-10 sm:w-12 sm:h-12 rounded-xl flex items-center justify-center flex-shrink-0 ${stat.color}`}>
                                {stat.icon}
                            </div>
                            <div className="flex-1 min-w-0">
                                <p className="admin-stat-label">{stat.label}</p>
                                <h3 className="admin-stat-value truncate">{stat.value}</h3>
                                {stat.subtext && (
                                    <p className="text-xs text-gray-500 mt-1">{stat.subtext}</p>
                                )}
        switch (status) {
            case 'pending': return 'bg-yellow-100 text-yellow-700';
            case 'confirmed': return 'bg-blue-100 text-blue-700';
            case 'preparing': return 'bg-purple-100 text-purple-700';
            case 'out_for_delivery': return 'bg-indigo-100 text-indigo-700';
            case 'delivered': return 'bg-green-100 text-green-700';
            case 'cancelled': return 'bg-red-100 text-red-700';
            default: return 'bg-gray-100 text-gray-700';
        }
    };

    if (loading) {
        return (
            <div className="admin-page-container">
                <div className="flex items-center justify-center h-64">
                    <div className="admin-spinner"></div>
                </div>
            </div>
        );
    }

    return (
        <div className="admin-page-container">
            <div className="admin-page-header">
                <h1 className="admin-page-title">لوحة التحكم الرئيسية</h1>
                <p className="admin-page-subtitle">نظرة عامة على الأداء والإحصائيات</p>
            </div>

            <div className="admin-grid-4 mb-6">
                {stats.map((stat, idx) => (
                    <div key={idx} className="admin-stat-card">
                        <div className="flex items-center gap-3 sm:gap-4">
                            <div className={`w-10 h-10 sm:w-12 sm:h-12 rounded-xl flex items-center justify-center ${stat.color}`}>
                                {stat.icon}
                            </div>
                            <div className="flex-1 min-w-0">
                                <p className="admin-stat-label">{stat.label}</p>
                                <h3 className="admin-stat-value truncate">{stat.value}</h3>
                            </div>
                        </div>
                    </div>
                ))}
            </div>

            <div className="admin-grid-2">
                {/* Recent Orders */}
                <div className="admin-card">
                    <h2 className="admin-card-title mb-4">آخر الطلبات</h2>
                    <div className="space-y-3">
                        {recentOrders.length === 0 ? (أكثر المنتجات مبيعاً 🔥</h2>
                    <div className="space-y-3">
                        {topProducts.length === 0 ? (
                            <div className="admin-empty-state py-6">
                                <p className="admin-empty-text">لا توجد بيانات مبيعات حتى الآن</p>
                            </div>
                        ) : (
                            topProducts.map((product) => (
                                <div key={product.id} className="flex items-center justify-between gap-3 p-3 sm:p-4 bg-gray-50 rounded-lg sm:rounded-xl">
                                    <div className="flex items-center gap-3 flex-1 min-w-0">
                                        <img 
                                            src={product.image_url || 'https://placehold.co/400x400?text=Product'} 
                                            alt={product.name}
                                            className="w-10 h-10 sm:w-12 sm:h-12 rounded-lg object-cover bg-gray-200 flex-shrink-0"
                                            onError={(e) => {
                                                const target = e.target as HTMLImageElement;
                                                target.src = 'https://placehold.co/400x400?text=Product';
                                            }}
                                        />
                                        <div className="flex-1 min-w-0">
                                            <p className="font-bold text-gray-900 text-sm sm:text-base truncate">{product.name}</p>
                                            <p className="text-xs text-gray-500 truncate">{product.category} • مبيعات: {product.total_sold || 0}</p>
                                        </div>
                                    </div>
                                    <div className="text-left">
                                        <p className="font-bold text-gray-900 text-sm sm:text-base whitespace-nowrap">{(Number(product.revenue) || 0).toLocaleString('ar-EG')} ج.م</p>
                                        <p className="text-xs text-gray-500">طلبات: {product.order_count || 0}</p>
                                    </div>
                                </div>
                            ))
                        sName="admin-card">
                    <h2 className="admin-card-title mb-4">نظرة على المنتجات</h2>
                    <div className="space-y-3">
                        {products.slice(0, 5).map((product) => (
                            <div key={product.id} className="flex items-center justify-between gap-3 p-3 sm:p-4 bg-gray-50 rounded-lg sm:rounded-xl">
                                <div className="flex items-center gap-3 flex-1 min-w-0">
                                    <img 
                                        src={product.image || 'https://placehold.co/400x400?text=Product'} 
                                        alt={product.name}
                                        className="w-10 h-10 sm:w-12 sm:h-12 rounded-lg object-cover bg-gray-200 flex-shrink-0"
                                        onError={(e) => {
                                            const target = e.target as HTMLImageElement;
                                            target.src = 'https://placehold.co/400x400?text=Product';
                                        }}
                                    />
                                    <div className="flex-1 min-w-0">
                                        <p className="font-bold text-gray-900 text-sm sm:text-base truncate">{product.name}</p>
                                        <p className="text-xs text-gray-500 truncate">{product.category}</p>
                                    </div>
                                </div>
                                <span className="font-bold text-gray-900 text-sm sm:text-base whitespace-nowrap">{(Number(product.price) || 0).toFixed(2)} ج.م</span>
                            </div>
                        ))}
                    </div>
                </div>            </div>

            {/* Additional Stats - Low Stock & Users */}
            <div className="admin-grid-2 mt-6">
                {/* Low Stock Alerts */}
                {dashboardData?.lowStockProducts && dashboardData.lowStockProducts.length > 0 && (
                    <div className="admin-card">
                        <h2 className="admin-card-title mb-4 flex items-center gap-2">
                            <AlertTriangle size={20} className="text-red-500" />
                            تنبيهات المخزون المنخفض
                        </h2>
                        <div className="space-y-3">
                            {dashboardData.lowStockProducts.slice(0, 5).map((product: any) => (
                                <div key={product.id} className="flex items-center justify-between p-3 bg-red-50 rounded-lg border border-red-200">
                                    <div className="flex-1 min-w-0">
                                        <p className="font-bold text-gray-900 text-sm truncate">{product.name}</p>
                                        <p className="text-xs text-gray-500 truncate">{product.branch_name}</p>
                                    </div>
                                    <span className="text-red-600 font-bold whitespace-nowrap">
                                        {product.stock_quantity} فقط
                                    </span>
                                </div>
                            ))}
                        </div>
                    </div>
                )}

                {/* Recent Users */}
                {dashboardData?.recentUsers && dashboardData.recentUsers.length > 0 && (
                    <div className="admin-card">
                        <h2 className="admin-card-title mb-4 flex items-center gap-2">
                            <Users size={20} className="text-blue-500" />
                            آخر المستخدمين المسجلين
                        </h2>
                        <div className="space-y-3">
                            {dashboardData.recentUsers.slice(0, 5).map((user: any) => (
                                <div key={user.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                                    <div className="flex-1 min-w-0">
                                        <p className="font-bold text-gray-900 text-sm truncate">{user.full_name}</p>
                                        <p className="text-xs text-gray-500 truncate">{user.phone || user.email}</p>
                                    </div>
                                    <span className="text-xs text-gray-500 whitespace-nowrap">
                                        طلبات: {user.order_count || 0}
                                    </span>
                                </div>
                            ))}
                        </div>
                    </div>
                )}
            </div>

            {/* Performance Info */}
            {dashboardData && (
                <div className="mt-6 p-4 bg-gradient-to-r from-green-50 to-blue-50 rounded-xl border border-green-200">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
                            <BarChart3 size={20} className="text-green-600" />
                        </div>
                        <div className="flex-1">
                            <p className="font-bold text-gray-900">تم التحميل بنجاح ⚡</p>
                            <p className="text-sm text-gray-600">
                                استخدام الـ Unified API - طلب واحد فقط بدل {statsCards.length + 4} طلبات • 
                                توفير 70-80% من البيانات
                            </p>
                        </div>
                        <button
                            onClick={loadDashboard}
                            className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors text-sm font-medium"
                        >
                            تحديث
                        </button>
                    </div>
                </div>
            )}            </div>
        </div>
    );
};

export default DashboardOverview;
