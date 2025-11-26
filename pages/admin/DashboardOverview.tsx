import React from 'react';
import { DollarSign, ShoppingBag, Package, AlertTriangle } from 'lucide-react';

const DashboardOverview = () => {
    // Mock Data - In real app, fetch from API
    const stats = [
        { label: 'Total Sales', value: 'EGP 125,000', icon: <DollarSign size={24} />, color: 'bg-green-100 text-green-600' },
        { label: 'Total Orders', value: '1,240', icon: <ShoppingBag size={24} />, color: 'bg-blue-100 text-blue-600' },
        { label: 'Total Products', value: '342', icon: <Package size={24} />, color: 'bg-purple-100 text-purple-600' },
        { label: 'Low Stock', value: '12', icon: <AlertTriangle size={24} />, color: 'bg-red-100 text-red-600' },
    ];

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
                        {[1, 2, 3, 4, 5].map((i) => (
                            <div key={i} className="flex items-center justify-between p-4 bg-gray-50 rounded-xl">
                                <div>
                                    <p className="font-bold text-gray-900">Order #{1000 + i}</p>
                                    <p className="text-xs text-gray-500">2 mins ago</p>
                                </div>
                                <span className="px-3 py-1 bg-yellow-100 text-yellow-700 text-xs font-bold rounded-full">Pending</span>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Top Products */}
                <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
                    <h2 className="text-lg font-bold text-gray-900 mb-4">Top Selling Products</h2>
                    <div className="space-y-4">
                        {[1, 2, 3, 4, 5].map((i) => (
                            <div key={i} className="flex items-center justify-between p-4 bg-gray-50 rounded-xl">
                                <div className="flex items-center space-x-3">
                                    <div className="w-10 h-10 bg-gray-200 rounded-lg"></div>
                                    <div>
                                        <p className="font-bold text-gray-900">Product Name {i}</p>
                                        <p className="text-xs text-gray-500">Category</p>
                                    </div>
                                </div>
                                <span className="font-bold text-gray-900">EGP 450</span>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default DashboardOverview;
