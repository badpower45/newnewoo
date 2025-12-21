import React, { useState, useEffect } from 'react';
import { Users, TrendingDown, DollarSign, Star, AlertTriangle, CheckCircle, Search, Filter, Download } from 'lucide-react';
import { api } from '../../services/api';

interface CustomerAnalytics {
    id: number;
    name: string;
    email: string;
    phone: string;
    total_orders: number;
    rejected_orders: number;
    completed_orders: number;
    total_spent: number;
    average_order_value: number;
    customer_rating: 'excellent' | 'good' | 'problematic' | 'banned';
    last_order_date: string;
}

const CustomerAnalyticsPage = () => {
    const [customers, setCustomers] = useState<CustomerAnalytics[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState('');
    const [filterRating, setFilterRating] = useState<string>('all');
    const [sortBy, setSortBy] = useState<'rejected' | 'spent' | 'orders'>('rejected');

    useEffect(() => {
        fetchCustomerAnalytics();
    }, []);

    const fetchCustomerAnalytics = async () => {
        setLoading(true);
        try {
            const response = await api.get('/admin/customer-analytics');
            setCustomers(response.data || []);
        } catch (error) {
            console.error('Error fetching customer analytics:', error);
            // Mock data for development
            setCustomers(generateMockData());
        } finally {
            setLoading(false);
        }
    };

    const generateMockData = (): CustomerAnalytics[] => {
        return [
            {
                id: 1,
                name: 'أحمد محمد',
                email: 'ahmed@example.com',
                phone: '01012345678',
                total_orders: 45,
                rejected_orders: 12,
                completed_orders: 33,
                total_spent: 15420,
                average_order_value: 467,
                customer_rating: 'problematic',
                last_order_date: '2025-12-19'
            },
            {
                id: 2,
                name: 'فاطمة علي',
                email: 'fatima@example.com',
                phone: '01123456789',
                total_orders: 67,
                rejected_orders: 2,
                completed_orders: 65,
                total_spent: 32100,
                average_order_value: 494,
                customer_rating: 'excellent',
                last_order_date: '2025-12-20'
            },
            {
                id: 3,
                name: 'محمود حسن',
                email: 'mahmoud@example.com',
                phone: '01234567890',
                total_orders: 23,
                rejected_orders: 8,
                completed_orders: 15,
                total_spent: 7200,
                average_order_value: 480,
                customer_rating: 'problematic',
                last_order_date: '2025-12-18'
            },
            {
                id: 4,
                name: 'مريم أحمد',
                email: 'mariam@example.com',
                phone: '01098765432',
                total_orders: 89,
                rejected_orders: 1,
                completed_orders: 88,
                total_spent: 45600,
                average_order_value: 518,
                customer_rating: 'excellent',
                last_order_date: '2025-12-20'
            },
            {
                id: 5,
                name: 'عمر خالد',
                email: 'omar@example.com',
                phone: '01156789012',
                total_orders: 34,
                rejected_orders: 5,
                completed_orders: 29,
                total_spent: 16800,
                average_order_value: 579,
                customer_rating: 'good',
                last_order_date: '2025-12-19'
            }
        ];
    };

    const getRatingBadge = (rating: string) => {
        switch (rating) {
            case 'excellent':
                return <span className="px-3 py-1 bg-green-100 text-green-700 rounded-full text-xs font-bold flex items-center gap-1">
                    <Star size={14} fill="currentColor" /> عميل ممتاز
                </span>;
            case 'good':
                return <span className="px-3 py-1 bg-blue-100 text-blue-700 rounded-full text-xs font-bold flex items-center gap-1">
                    <CheckCircle size={14} /> عميل جيد
                </span>;
            case 'problematic':
                return <span className="px-3 py-1 bg-red-100 text-red-700 rounded-full text-xs font-bold flex items-center gap-1">
                    <AlertTriangle size={14} /> عميل مشاغب
                </span>;
            case 'banned':
                return <span className="px-3 py-1 bg-gray-900 text-white rounded-full text-xs font-bold">
                    محظور
                </span>;
            default:
                return <span className="px-3 py-1 bg-gray-100 text-gray-700 rounded-full text-xs font-bold">
                    جديد
                </span>;
        }
    };

    const filteredCustomers = customers
        .filter(c => {
            const matchesSearch = c.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                                c.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
                                c.phone.includes(searchQuery);
            const matchesFilter = filterRating === 'all' || c.customer_rating === filterRating;
            return matchesSearch && matchesFilter;
        })
        .sort((a, b) => {
            switch (sortBy) {
                case 'rejected':
                    return b.rejected_orders - a.rejected_orders;
                case 'spent':
                    return b.total_spent - a.total_spent;
                case 'orders':
                    return b.total_orders - a.total_orders;
                default:
                    return 0;
            }
        });

    const stats = {
        totalCustomers: customers.length,
        problematicCustomers: customers.filter(c => c.customer_rating === 'problematic').length,
        excellentCustomers: customers.filter(c => c.customer_rating === 'excellent').length,
        totalRejectedOrders: customers.reduce((sum, c) => sum + c.rejected_orders, 0),
    };

    const exportToCSV = () => {
        const headers = ['الاسم', 'البريد', 'الهاتف', 'إجمالي الطلبات', 'الطلبات المرفوضة', 'إجمالي المشتريات', 'التقييم'];
        const rows = filteredCustomers.map(c => [
            c.name,
            c.email,
            c.phone,
            c.total_orders,
            c.rejected_orders,
            c.total_spent,
            c.customer_rating
        ]);
        
        const csvContent = [headers, ...rows].map(row => row.join(',')).join('\n');
        const blob = new Blob(['\ufeff' + csvContent], { type: 'text/csv;charset=utf-8;' });
        const link = document.createElement('a');
        link.href = URL.createObjectURL(blob);
        link.download = `customer-analytics-${new Date().toISOString().split('T')[0]}.csv`;
        link.click();
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center h-64">
                <div className="animate-spin rounded-full h-12 w-12 border-4 border-brand-orange border-t-transparent"></div>
            </div>
        );
    }

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-3">
                        <Users className="text-brand-orange" size={36} />
                        تحليلات العملاء
                    </h1>
                    <p className="text-gray-600 mt-1">راقب سلوك العملاء وحدد "المشاغبين"</p>
                </div>
                <button
                    onClick={exportToCSV}
                    className="px-4 py-2 bg-green-600 text-white rounded-xl font-medium hover:bg-green-700 transition-colors flex items-center gap-2"
                >
                    <Download size={20} />
                    تصدير Excel
                </button>
            </div>

            {/* Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-sm text-gray-500 font-medium">إجمالي العملاء</p>
                            <h3 className="text-3xl font-bold text-gray-900 mt-1">{stats.totalCustomers}</h3>
                        </div>
                        <div className="w-12 h-12 bg-blue-100 text-blue-600 rounded-xl flex items-center justify-center">
                            <Users size={24} />
                        </div>
                    </div>
                </div>

                <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-sm text-gray-500 font-medium">عملاء مشاغبين</p>
                            <h3 className="text-3xl font-bold text-red-600 mt-1">{stats.problematicCustomers}</h3>
                        </div>
                        <div className="w-12 h-12 bg-red-100 text-red-600 rounded-xl flex items-center justify-center">
                            <AlertTriangle size={24} />
                        </div>
                    </div>
                </div>

                <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-sm text-gray-500 font-medium">عملاء ممتازين</p>
                            <h3 className="text-3xl font-bold text-green-600 mt-1">{stats.excellentCustomers}</h3>
                        </div>
                        <div className="w-12 h-12 bg-green-100 text-green-600 rounded-xl flex items-center justify-center">
                            <Star size={24} />
                        </div>
                    </div>
                </div>

                <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-sm text-gray-500 font-medium">طلبات مرفوضة</p>
                            <h3 className="text-3xl font-bold text-orange-600 mt-1">{stats.totalRejectedOrders}</h3>
                        </div>
                        <div className="w-12 h-12 bg-orange-100 text-orange-600 rounded-xl flex items-center justify-center">
                            <TrendingDown size={24} />
                        </div>
                    </div>
                </div>
            </div>

            {/* Filters and Search */}
            <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
                <div className="flex flex-col md:flex-row gap-4">
                    {/* Search */}
                    <div className="flex-1 relative">
                        <Search className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
                        <input
                            type="text"
                            placeholder="ابحث بالاسم، البريد أو الهاتف..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="w-full pr-10 pl-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-brand-orange focus:border-transparent"
                        />
                    </div>

                    {/* Filter by Rating */}
                    <select
                        value={filterRating}
                        onChange={(e) => setFilterRating(e.target.value)}
                        className="px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-brand-orange focus:border-transparent"
                    >
                        <option value="all">كل التقييمات</option>
                        <option value="excellent">ممتاز</option>
                        <option value="good">جيد</option>
                        <option value="problematic">مشاغب</option>
                        <option value="banned">محظور</option>
                    </select>

                    {/* Sort By */}
                    <select
                        value={sortBy}
                        onChange={(e) => setSortBy(e.target.value as any)}
                        className="px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-brand-orange focus:border-transparent"
                    >
                        <option value="rejected">الطلبات المرفوضة</option>
                        <option value="spent">إجمالي المشتريات</option>
                        <option value="orders">عدد الطلبات</option>
                    </select>
                </div>
            </div>

            {/* Customers Table */}
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full">
                        <thead className="bg-gray-50 border-b border-gray-200">
                            <tr>
                                <th className="px-6 py-4 text-right text-xs font-bold text-gray-700 uppercase">العميل</th>
                                <th className="px-6 py-4 text-right text-xs font-bold text-gray-700 uppercase">التواصل</th>
                                <th className="px-6 py-4 text-center text-xs font-bold text-gray-700 uppercase">إجمالي الطلبات</th>
                                <th className="px-6 py-4 text-center text-xs font-bold text-gray-700 uppercase">طلبات مرفوضة</th>
                                <th className="px-6 py-4 text-center text-xs font-bold text-gray-700 uppercase">طلبات مكتملة</th>
                                <th className="px-6 py-4 text-center text-xs font-bold text-gray-700 uppercase">إجمالي المشتريات</th>
                                <th className="px-6 py-4 text-center text-xs font-bold text-gray-700 uppercase">متوسط الطلب</th>
                                <th className="px-6 py-4 text-center text-xs font-bold text-gray-700 uppercase">التقييم</th>
                                <th className="px-6 py-4 text-center text-xs font-bold text-gray-700 uppercase">آخر طلب</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-200">
                            {filteredCustomers.map((customer) => (
                                <tr key={customer.id} className="hover:bg-gray-50 transition-colors">
                                    <td className="px-6 py-4">
                                        <div className="flex items-center gap-3">
                                            <div className="w-10 h-10 bg-gradient-to-br from-brand-orange to-orange-600 rounded-full flex items-center justify-center text-white font-bold">
                                                {customer.name.charAt(0)}
                                            </div>
                                            <div>
                                                <p className="font-bold text-gray-900">{customer.name}</p>
                                                <p className="text-xs text-gray-500">ID: {customer.id}</p>
                                            </div>
                                        </div>
                                    </td>
                                    <td className="px-6 py-4">
                                        <p className="text-sm text-gray-900">{customer.email}</p>
                                        <p className="text-xs text-gray-500" dir="ltr">{customer.phone}</p>
                                    </td>
                                    <td className="px-6 py-4 text-center">
                                        <span className="text-lg font-bold text-gray-900">{customer.total_orders}</span>
                                    </td>
                                    <td className="px-6 py-4 text-center">
                                        <span className={`text-lg font-bold ${customer.rejected_orders > 5 ? 'text-red-600' : 'text-gray-900'}`}>
                                            {customer.rejected_orders}
                                        </span>
                                        {customer.rejected_orders > 5 && (
                                            <p className="text-xs text-red-500 mt-1">⚠️ نسبة عالية</p>
                                        )}
                                    </td>
                                    <td className="px-6 py-4 text-center">
                                        <span className="text-lg font-bold text-green-600">{customer.completed_orders}</span>
                                    </td>
                                    <td className="px-6 py-4 text-center">
                                        <span className="text-lg font-bold text-brand-orange">{customer.total_spent.toLocaleString()}</span>
                                        <p className="text-xs text-gray-500">جنيه</p>
                                    </td>
                                    <td className="px-6 py-4 text-center">
                                        <span className="text-sm font-medium text-gray-700">{customer.average_order_value.toLocaleString()}</span>
                                        <p className="text-xs text-gray-500">جنيه</p>
                                    </td>
                                    <td className="px-6 py-4 text-center">
                                        {getRatingBadge(customer.customer_rating)}
                                    </td>
                                    <td className="px-6 py-4 text-center">
                                        <span className="text-sm text-gray-700">{new Date(customer.last_order_date).toLocaleDateString('ar-EG')}</span>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>

                {filteredCustomers.length === 0 && (
                    <div className="text-center py-12">
                        <Users className="mx-auto text-gray-300 mb-3" size={64} />
                        <p className="text-gray-500">لا توجد نتائج</p>
                    </div>
                )}
            </div>
        </div>
    );
};

export default CustomerAnalyticsPage;
