import React, { useState, useEffect } from 'react';
import { RotateCcw, Search, Filter, CheckCircle, XCircle, Clock, Package, User, Phone, Mail, Calendar, DollarSign } from 'lucide-react';
import axios from 'axios';

interface ReturnItem {
    id: number;
    return_code: string;
    order_number: string;
    customer_name: string;
    customer_email: string;
    customer_phone: string;
    return_reason: string;
    return_notes: string;
    total_amount: number;
    refund_amount: number;
    status: 'pending' | 'approved' | 'rejected' | 'completed';
    created_at: string;
    items: any;
    order_id: number;
    user_id: number;
}

const ReturnsManager = () => {
    const [returns, setReturns] = useState<ReturnItem[]>([]);
    const [loading, setLoading] = useState(true);
    const [filter, setFilter] = useState<string>('all');
    const [searchTerm, setSearchTerm] = useState('');
    const [selectedReturn, setSelectedReturn] = useState<ReturnItem | null>(null);
    const [showModal, setShowModal] = useState(false);

    const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3001';

    useEffect(() => {
        fetchReturns();
    }, [filter]);

    const fetchReturns = async () => {
        try {
            setLoading(true);
            const token = localStorage.getItem('token');
            const url = filter === 'all' 
                ? `${API_BASE_URL}/api/admin-enhanced/returns`
                : `${API_BASE_URL}/api/admin-enhanced/returns?status=${filter}`;
            
            const response = await axios.get(url, {
                headers: { Authorization: `Bearer ${token}` }
            });
            
            setReturns(response.data.data || []);
        } catch (error) {
            console.error('Error fetching returns:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleApprove = async (id: number) => {
        try {
            const token = localStorage.getItem('token');
            const refundAmount = prompt('أدخل مبلغ الاسترجاع:');
            const adminNotes = prompt('ملاحظات (اختياري):');
            
            if (!refundAmount) return;

            await axios.put(
                `${API_BASE_URL}/api/admin-enhanced/returns/${id}/approve`,
                { 
                    refund_amount: parseFloat(refundAmount),
                    admin_notes: adminNotes 
                },
                { headers: { Authorization: `Bearer ${token}` } }
            );

            alert('تمت الموافقة على الطلب بنجاح');
            fetchReturns();
            setShowModal(false);
        } catch (error) {
            console.error('Error approving return:', error);
            alert('حدث خطأ في الموافقة على الطلب');
        }
    };

    const handleReject = async (id: number) => {
        try {
            const token = localStorage.getItem('token');
            const reason = prompt('سبب الرفض:');
            
            if (!reason) return;

            await axios.put(
                `${API_BASE_URL}/api/admin-enhanced/returns/${id}/reject`,
                { rejection_reason: reason },
                { headers: { Authorization: `Bearer ${token}` } }
            );

            alert('تم رفض الطلب');
            fetchReturns();
            setShowModal(false);
        } catch (error) {
            console.error('Error rejecting return:', error);
            alert('حدث خطأ في رفض الطلب');
        }
    };

    const getStatusBadge = (status: string) => {
        const badges = {
            pending: { color: 'bg-yellow-100 text-yellow-800', icon: Clock, label: 'قيد المراجعة' },
            approved: { color: 'bg-green-100 text-green-800', icon: CheckCircle, label: 'تمت الموافقة' },
            rejected: { color: 'bg-red-100 text-red-800', icon: XCircle, label: 'مرفوض' },
            completed: { color: 'bg-blue-100 text-blue-800', icon: Package, label: 'مكتمل' }
        };
        const badge = badges[status as keyof typeof badges] || badges.pending;
        const Icon = badge.icon;
        
        return (
            <span className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-sm font-medium ${badge.color}`}>
                <Icon size={16} />
                {badge.label}
            </span>
        );
    };

    const filteredReturns = returns.filter(ret => 
        ret.return_code.toLowerCase().includes(searchTerm.toLowerCase()) ||
        ret.customer_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        ret.order_number?.toLowerCase().includes(searchTerm.toLowerCase())
    );

    if (loading) {
        return (
            <div className="p-6 flex items-center justify-center h-64">
                <div className="text-center">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-brand-orange mx-auto mb-4"></div>
                    <p className="text-gray-600">جاري التحميل...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="p-6">
            <div className="flex justify-between items-center mb-6">
                <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
                    <RotateCcw className="text-brand-orange" />
                    إدارة المرتجعات الذكية
                </h1>
            </div>

            {/* Filters & Search */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4 mb-6">
                <div className="flex flex-col md:flex-row gap-4">
                    {/* Search */}
                    <div className="flex-1 relative">
                        <Search className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
                        <input
                            type="text"
                            placeholder="بحث برقم المرتجع، العميل، أو الطلب..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="w-full pr-10 pl-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-brand-orange focus:border-transparent"
                        />
                    </div>

                    {/* Status Filter */}
                    <div className="flex gap-2">
                        <button
                            onClick={() => setFilter('all')}
                            className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                                filter === 'all' ? 'bg-brand-orange text-white' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                            }`}
                        >
                            الكل ({returns.length})
                        </button>
                        <button
                            onClick={() => setFilter('pending')}
                            className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                                filter === 'pending' ? 'bg-yellow-500 text-white' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                            }`}
                        >
                            قيد المراجعة
                        </button>
                        <button
                            onClick={() => setFilter('approved')}
                            className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                                filter === 'approved' ? 'bg-green-500 text-white' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                            }`}
                        >
                            موافق عليها
                        </button>
                    </div>
                </div>
            </div>

            {/* Returns List */}
            {filteredReturns.length === 0 ? (
                <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-8 text-center">
                    <Package className="mx-auto text-gray-300 mb-4" size={64} />
                    <h3 className="text-lg font-semibold text-gray-700 mb-2">لا توجد مرتجعات</h3>
                    <p className="text-gray-500">لم يتم العثور على أي طلبات إرجاع</p>
                </div>
            ) : (
                <div className="grid gap-4">
                    {filteredReturns.map((returnItem) => (
                        <div key={returnItem.id} className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 hover:shadow-md transition-shadow">
                            <div className="flex justify-between items-start mb-4">
                                <div>
                                    <h3 className="text-lg font-bold text-gray-900 mb-1">
                                        {returnItem.return_code}
                                    </h3>
                                    <p className="text-sm text-gray-500">
                                        الطلب: {returnItem.order_number || `#${returnItem.order_id}`}
                                    </p>
                                </div>
                                {getStatusBadge(returnItem.status)}
                            </div>

                            <div className="grid md:grid-cols-2 gap-4 mb-4">
                                <div className="flex items-center gap-2 text-gray-600">
                                    <User size={18} />
                                    <span>{returnItem.customer_name || 'غير محدد'}</span>
                                </div>
                                <div className="flex items-center gap-2 text-gray-600">
                                    <Phone size={18} />
                                    <span>{returnItem.customer_phone || 'غير محدد'}</span>
                                </div>
                                <div className="flex items-center gap-2 text-gray-600">
                                    <Calendar size={18} />
                                    <span>{new Date(returnItem.created_at).toLocaleDateString('ar-EG')}</span>
                                </div>
                                <div className="flex items-center gap-2 text-gray-600">
                                    <DollarSign size={18} />
                                    <span className="font-semibold">{returnItem.refund_amount} جنيه</span>
                                </div>
                            </div>

                            <div className="bg-gray-50 rounded-lg p-3 mb-4">
                                <p className="text-sm text-gray-700">
                                    <span className="font-semibold">السبب:</span> {returnItem.return_reason}
                                </p>
                                {returnItem.return_notes && (
                                    <p className="text-sm text-gray-600 mt-1">
                                        <span className="font-semibold">ملاحظات:</span> {returnItem.return_notes}
                                    </p>
                                )}
                            </div>

                            {returnItem.status === 'pending' && (
                                <div className="flex gap-2">
                                    <button
                                        onClick={() => handleApprove(returnItem.id)}
                                        className="flex-1 bg-green-500 text-white px-4 py-2 rounded-lg hover:bg-green-600 transition-colors font-medium flex items-center justify-center gap-2"
                                    >
                                        <CheckCircle size={18} />
                                        الموافقة
                                    </button>
                                    <button
                                        onClick={() => handleReject(returnItem.id)}
                                        className="flex-1 bg-red-500 text-white px-4 py-2 rounded-lg hover:bg-red-600 transition-colors font-medium flex items-center justify-center gap-2"
                                    >
                                        <XCircle size={18} />
                                        الرفض
                                    </button>
                                </div>
                            )}
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
};

export default ReturnsManager;
