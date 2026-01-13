import React, { useState, useEffect } from 'react';
import { DollarSign, ShoppingBag, Package, AlertTriangle } from 'lucide-react';
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
    const [orders, setOrders] = useState<any[]>([]);
    const [products, setProducts] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const load = async () => {
            setLoading(true);
            try {
                console.log('🔄 Loading dashboard data...');
                // Use branchId=1 for products
                const [ordersRes, productsRes] = await Promise.all([
                    api.orders.getAll().catch(err => { 
                        console.error('❌ Orders fetch failed:', err); 
                        return { data: [] }; 
                    }),
                    api.products.getAllByBranch(1).catch(err => { 
                        console.error('❌ Products fetch failed:', err); 
                        return []; 
                    })
                ]);
                
                console.log('📦 Products response:', productsRes);
                console.log('📋 Orders response:', ordersRes);
                
                const ordersArr = Array.isArray((ordersRes as any)?.data ?? ordersRes) 
                    ? ((ordersRes as any).data ?? ordersRes) 
                    : [];
                const productsArr = Array.isArray(productsRes) 
                    ? productsRes 
                    : (Array.isArray((productsRes as any)?.data) ? (productsRes as any).data : []);
                
                console.log('✅ Setting orders:', ordersArr.length);
                console.log('✅ Setting products:', productsArr.length);
                
                setOrders(ordersArr);
                setProducts(productsArr);
            } catch (e) {
                console.error('❌ Failed to load dashboard data', e);
                setOrders([]);
                setProducts([]);
            } finally {
                setLoading(false);
            }
        };
        load();
    }, []);

    const totalRevenue = Array.isArray(orders) ? orders.reduce((sum, o) => sum + (Number(o.total) || 0), 0) : 0;
    const recentOrders = Array.isArray(orders) ? orders.slice(0, 5) : [];

    const stats = [
        { label: 'Total Sales', value: `EGP ${(totalRevenue || 0).toFixed(2)}`, icon: <DollarSign size={24} />, color: 'bg-green-100 text-green-600' },
        { label: 'Total Orders', value: orders.length.toString(), icon: <ShoppingBag size={24} />, color: 'bg-blue-100 text-blue-600' },
        { label: 'Total Products', value: products.length.toString(), icon: <Package size={24} />, color: 'bg-purple-100 text-purple-600' },
        { label: 'Pending Orders', value: orders.filter(o => o.status === 'pending').length.toString(), icon: <AlertTriangle size={24} />, color: 'bg-red-100 text-red-600' },
    ];

    const getStatusColor = (status: string) => {
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
                        {recentOrders.length === 0 ? (
                            <div className="admin-empty-state py-6">
                                <p className="admin-empty-text">لا توجد طلبات حتى الآن</p>
                            </div>
                        ) : (
                            recentOrders.map((order) => (
                                <div key={order.id} className="flex items-center justify-between p-3 sm:p-4 bg-gray-50 rounded-lg sm:rounded-xl">
                                    <div className="flex-1 min-w-0">
                                        <p className="font-bold text-gray-900 text-sm sm:text-base truncate">طلب #{order.id}</p>
                                        <p className="text-xs text-gray-500 truncate">{new Date(order.date || order.created_at || Date.now()).toLocaleString('ar-EG', { dateStyle: 'short', timeStyle: 'short' })}</p>
                                    </div>
                                    <span className={`admin-badge ${getStatusColor(order.status)} mr-2`}>
                                        {ORDER_STATUS_LABELS[order.status] || order.status}
                                    </span>
                                </div>
                            ))
                        )}
                    </div>
                </div>

                {/* Top Products */}
                <div className="admin-card">
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
                </div>
            </div>
        </div>
    );
};

export default DashboardOverview;
