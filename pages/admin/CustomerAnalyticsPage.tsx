import React, { useState, useEffect } from 'react';
import { Users, TrendingDown, Star, AlertTriangle, CheckCircle, Search, Download, AlertCircle } from 'lucide-react';
import { api } from '../../services/api';
import { supabaseBlockingService } from '../../services/supabaseBlockingService';

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
    is_blocked?: boolean;
}

const CustomerAnalyticsPage = () => {
    const [customers, setCustomers] = useState<CustomerAnalytics[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState('');
    const [filterRating, setFilterRating] = useState<string>('all');
    const [sortBy, setSortBy] = useState<'rejected' | 'spent' | 'orders' | 'recent'>('rejected');
    const [statsFromApi, setStatsFromApi] = useState<any>(null);
    const [error, setError] = useState('');
    const [actionMessage, setActionMessage] = useState<string>('');
    const [actionEmail, setActionEmail] = useState<string | null>(null);
    const [showBlockModal, setShowBlockModal] = useState(false);
    const [selectedCustomer, setSelectedCustomer] = useState<CustomerAnalytics | null>(null);
    const [blockReason, setBlockReason] = useState('');

    useEffect(() => {
        fetchCustomerAnalytics();
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [searchQuery, filterRating, sortBy]);

    const fetchCustomerAnalytics = async () => {
        setLoading(true);
        setError('');
        try {
            const params = new URLSearchParams();
            if (searchQuery.trim()) params.append('search', searchQuery.trim());
            if (filterRating !== 'all') params.append('rating', filterRating);
            if (sortBy) params.append('sortBy', sortBy);
            params.append('limit', '200');

            const [customersRes, statsRes] = await Promise.all([
                api.get(`/admin/customer-analytics?${params.toString()}`),
                api.get('/admin/customer-analytics/stats')
            ]);

            const customersPayload = customersRes?.data ?? customersRes;
            const normalizedCustomers = (
                Array.isArray(customersPayload)
                    ? customersPayload
                    : Array.isArray(customersPayload?.data)
                        ? customersPayload.data
                        : []
            ).map((c: any) => ({
                ...c,
                customer_rating: c.is_blocked ? 'banned' : c.customer_rating
            }));

            setCustomers(normalizedCustomers);
            setStatsFromApi(statsRes?.data ?? statsRes);
        } catch (error: any) {
            console.error('Error fetching customer analytics:', error);
            setError(error?.message || 'فشل تحميل البيانات');
            setCustomers([]);
        } finally {
            setLoading(false);
        }
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

    const openBlockModal = (customer: CustomerAnalytics) => {
        setSelectedCustomer(customer);
        setBlockReason('');
        setShowBlockModal(true);
    };

    const closeBlockModal = () => {
        setShowBlockModal(false);
        setSelectedCustomer(null);
        setBlockReason('');
    };

    const confirmBlock = async () => {
        if (!selectedCustomer || !blockReason.trim()) {
            alert('الرجاء كتابة سبب الحظر');
            return;
        }

        setActionEmail(selectedCustomer.email);
        setActionMessage('');
        closeBlockModal();

        try {
            // Block in both Supabase and Backend
            const [supabaseResult, backendResult] = await Promise.allSettled([
                supabaseBlockingService.blockUser(
                    selectedCustomer.email, 
                    blockReason,
                    undefined,
                    undefined // permanent ban
                ),
                api.adminUsers.blockByEmail(selectedCustomer.email, blockReason)
            ]);
                
                // Check results
                const supabaseSuccess = supabaseResult.status === 'fulfilled' && supabaseResult.value.success;
                const backendSuccess = backendResult.status === 'fulfilled';
                
                if (!supabaseSuccess && !backendSuccess) {
                    throw new Error('فشل الحظر في كل من Supabase والباكند');
                }
                
                console.log('✅ Block results:', { supabaseSuccess, backendSuccess });
            
            setCustomers(prev => prev.map(c => c.email === selectedCustomer.email ? {
                ...c,
                customer_rating: 'banned',
                is_blocked: true
            } : c));
            setActionMessage('✅ تم حظر المستخدم بنجاح');
        } catch (err: any) {
            console.error('❌ Block error:', err);
            setActionMessage(err?.message || 'تعذر حظر المستخدم');
        } finally {
            setActionEmail(null);
        }
    };

    const handleUnblock = async (customer: CustomerAnalytics) => {
        setActionEmail(customer.email);
        setActionMessage('');
        try {
            // Unblock in both systems
            const [supabaseResult, backendResult] = await Promise.allSettled([
                supabaseBlockingService.unblockUser(customer.email),
                api.adminUsers.unblockByEmail(customer.email)
            ]);
            
            const supabaseSuccess = supabaseResult.status === 'fulfilled' && supabaseResult.value.success;
            const backendSuccess = backendResult.status === 'fulfilled';
            
            console.log('✅ Unblock results:', { supabaseSuccess, backendSuccess });
            
            setCustomers(prev => prev.map(c => c.email === customer.email ? {
                ...c,
                customer_rating: c.customer_rating === 'banned' ? 'good' : c.customer_rating,
                is_blocked: false
            } : c));
            setActionMessage('✅ تم إلغاء الحظر بنجاح');
        } catch (err: any) {
            console.error('❌ Unblock error:', err);
            setActionMessage(err?.message || 'تعذر إلغاء الحظر');
        } finally {
            setActionEmail(null);
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
        totalCustomers: statsFromApi?.total_customers ?? customers.length,
        problematicCustomers: statsFromApi?.problematic_customers ?? customers.filter(c => c.customer_rating === 'problematic').length,
        excellentCustomers: statsFromApi?.excellent_customers ?? customers.filter(c => c.customer_rating === 'excellent').length,
        totalRejectedOrders: statsFromApi?.total_rejected_orders ?? customers.reduce((sum, c) => sum + c.rejected_orders, 0),
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
                    <p className="text-gray-600 mt-1">راقب سلوك العملاء وحدد "المشاغبين" — اضغط زر الحظر الموجود تحت اسم العميل</p>
                </div>
                <div className="flex items-center gap-3">
                    {error && (
                        <div className="flex items-center gap-2 text-red-600 bg-red-50 border border-red-100 px-3 py-2 rounded-xl text-sm">
                            <AlertCircle size={18} />
                            {error}
                        </div>
                    )}
                    {actionMessage && (
                        <div className="flex items-center gap-2 text-green-700 bg-green-50 border border-green-100 px-3 py-2 rounded-xl text-sm">
                            {actionMessage}
                        </div>
                    )}
                    <button
                        onClick={exportToCSV}
                        className="px-4 py-2 bg-green-600 text-white rounded-xl font-medium hover:bg-green-700 transition-colors flex items-center gap-2"
                    >
                        <Download size={20} />
                        تصدير Excel
                    </button>
                </div>
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
                                <th className="px-6 py-4 text-center text-xs font-bold text-gray-700 uppercase">إجراءات</th>
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
                                                <button
                                                    onClick={() => {
                                                        if (customer.is_blocked || customer.customer_rating === 'banned') {
                                                            handleUnblock(customer);
                                                        } else {
                                                            openBlockModal(customer);
                                                        }
                                                    }}
                                                    disabled={actionEmail === customer.email}
                                                    className={`mt-1 px-3 py-1 rounded-lg text-xs font-bold transition ${
                                                        customer.is_blocked || customer.customer_rating === 'banned'
                                                            ? 'bg-green-100 text-green-700 hover:bg-green-200'
                                                            : 'bg-red-100 text-red-700 hover:bg-red-200'
                                                    } ${actionEmail === customer.email ? 'opacity-70 cursor-not-allowed' : ''}`}
                                                >
                                                    {actionEmail === customer.email
                                                        ? '...'
                                                        : (customer.is_blocked || customer.customer_rating === 'banned')
                                                            ? 'إلغاء الحظر'
                                                            : 'حظر العميل'}
                                                </button>
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
                                    <td className="px-6 py-4 text-center">
                                        <button
                                            onClick={() => {
                                                if (customer.is_blocked || customer.customer_rating === 'banned') {
                                                    handleUnblock(customer);
                                                } else {
                                                    openBlockModal(customer);
                                                }
                                            }}
                                            disabled={actionEmail === customer.email}
                                            className={`px-4 py-2 rounded-xl text-sm font-bold transition ${
                                                customer.is_blocked || customer.customer_rating === 'banned'
                                                    ? 'bg-green-100 text-green-700 hover:bg-green-200'
                                                    : 'bg-red-100 text-red-700 hover:bg-red-200'
                                            } ${actionEmail === customer.email ? 'opacity-70 cursor-not-allowed' : ''}`}
                                        >
                                            {actionEmail === customer.email
                                                ? '...'
                                                : (customer.is_blocked || customer.customer_rating === 'banned')
                                                    ? 'إلغاء الحظر'
                                                    : 'حظر العميل'}
                                        </button>
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

            {/* Block Modal */}
            {showBlockModal && selectedCustomer && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
                    <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full p-6 animate-fade-in">
                        <div className="flex items-center gap-3 mb-4">
                            <div className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center">
                                <AlertCircle className="text-red-600" size={24} />
                            </div>
                            <div>
                                <h3 className="text-xl font-bold text-gray-900">حظر العميل</h3>
                                <p className="text-sm text-gray-600">{selectedCustomer.name}</p>
                            </div>
                        </div>

                        <div className="mb-6">
                            <label className="block text-sm font-bold text-gray-700 mb-2">
                                سبب الحظر <span className="text-red-500">*</span>
                            </label>
                            <textarea
                                value={blockReason}
                                onChange={(e) => setBlockReason(e.target.value)}
                                placeholder="مثال: طلبات ملغاة متكررة، سلوك غير لائق، احتيال، إلخ..."
                                className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-red-500 focus:border-transparent resize-none"
                                rows={4}
                                dir="rtl"
                            />
                            <p className="text-xs text-gray-500 mt-2">
                                ⚠️ سيتم عرض السبب للعميل عند محاولة الدخول
                            </p>
                        </div>

                        <div className="flex gap-3">
                            <button
                                onClick={confirmBlock}
                                disabled={!blockReason.trim()}
                                className="flex-1 bg-red-600 text-white px-6 py-3 rounded-xl font-bold hover:bg-red-700 transition disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                                تأكيد الحظر
                            </button>
                            <button
                                onClick={closeBlockModal}
                                className="flex-1 bg-gray-100 text-gray-700 px-6 py-3 rounded-xl font-bold hover:bg-gray-200 transition"
                            >
                                إلغاء
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default CustomerAnalyticsPage;
