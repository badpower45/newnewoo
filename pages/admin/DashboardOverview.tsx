import React, { useState, useEffect } from 'react';
import { DollarSign, ShoppingBag, Package, AlertTriangle } from 'lucide-react';
import { api } from '../../services/api';
import { ORDER_STATUS_LABELS } from '../../src/config';

const DashboardOverview = () => {
    const [orders, setOrders] = useState<any[]>([]);
    const [products, setProducts] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const load = async () => {
            setLoading(true);
            try {
                const [ordersRes, productsRes] = await Promise.all([
                    api.orders.getAll().catch(err => { console.error('orders fetch failed', err); return []; }),
                    api.products.getAll().catch(err => { console.error('products fetch failed', err); return []; })
                ]);
                const ordersArr = Array.isArray((ordersRes as any)?.data ?? ordersRes) ? ((ordersRes as any).data ?? ordersRes) : [];
                const productsArr = Array.isArray((productsRes as any)?.data ?? productsRes) ? ((productsRes as any).data ?? productsRes) : [];
                setOrders(ordersArr);
                setProducts(productsArr);
            } catch (e) {
                console.error('Failed to load dashboard data', e);
                setOrders([]);
                setProducts([]);
            } finally {
                setLoading(false);
            }
        };
        load();
    }, []);

    const totalRevenue = Array.isArray(orders) ? orders.reduce((sum, o) => sum + (o.total || 0), 0) : 0;
    const recentOrders = Array.isArray(orders) ? orders.slice(0, 5) : [];

    const stats = [
        { label: 'Total Sales', value: `EGP ${totalRevenue.toFixed(2)}`, icon: <DollarSign size={24} />, color: 'bg-green-100 text-green-600' },
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
            <div className="flex items-center justify-center h-64">
                <div className="text-gray-500">Loading dashboard...</div>
            </div>
        );
    }

    return (
        <div>
            <h1 className="text-2xl font-bold text-gray-900 mb-8">Dashboard Overview</h1>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                {stats.map((stat, idx) => (
                    <div key={idx} className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 flex items-center space-x-4">
                        <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${stat.color}`}>
                            {stat.icon}
                        </div>
                        <div>
                            <p className="text-sm text-gray-500 font-medium">{stat.label}</p>
                            <h3 className="text-2xl font-bold text-gray-900">{stat.value}</h3>
                        </div>
                    </div>
                ))}
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                {/* Recent Orders */}
                <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
                    <h2 className="text-lg font-bold text-gray-900 mb-4">Recent Orders</h2>
                    <div className="space-y-4">
                        {recentOrders.length === 0 ? (
                            <p className="text-gray-500 text-center py-4">No orders yet</p>
                        ) : (
                            recentOrders.map((order) => (
                                <div key={order.id} className="flex items-center justify-between p-4 bg-gray-50 rounded-xl">
                                    <div>
                                        <p className="font-bold text-gray-900">Order #{order.id}</p>
                                        <p className="text-xs text-gray-500">{new Date(order.date || order.created_at || Date.now()).toLocaleString()}</p>
                                    </div>
                                    <span className={`px-3 py-1 text-xs font-bold rounded-full ${getStatusColor(order.status)}`}>
                                        {ORDER_STATUS_LABELS[order.status] || order.status}
                                    </span>
                                </div>
                            ))
                        )}
                    </div>
                </div>

                {/* Top Products */}
                <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
                    <h2 className="text-lg font-bold text-gray-900 mb-4">Products Overview</h2>
                    <div className="space-y-4">
                        {products.slice(0, 5).map((product) => (
                            <div key={product.id} className="flex items-center justify-between p-4 bg-gray-50 rounded-xl">
                                <div className="flex items-center space-x-3">
                                    <img src={product.image} alt={product.name} className="w-10 h-10 rounded-lg object-cover bg-gray-200" />
                                    <div>
                                        <p className="font-bold text-gray-900">{product.name}</p>
                                        <p className="text-xs text-gray-500">{product.category}</p>
                                    </div>
                                </div>
                                <span className="font-bold text-gray-900">{product.price.toFixed(2)} EGP</span>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default DashboardOverview;
