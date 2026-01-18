import React, { useState, useEffect } from 'react';
import { RotateCcw, Search, Filter, CheckCircle, XCircle, Clock, Package, User, Phone, Mail, Calendar, DollarSign, Plus, FileText, Download } from 'lucide-react';
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

interface OrderProduct {
    id: number;
    name: string;
    price: number;
    quantity: number;
    return_quantity: number;
    image?: string;
}

interface OrderDetails {
    id: number;
    order_number: string;
    user_id: number;
    customer_name: string;
    customer_phone: string;
    customer_email: string;
    total: number;
    items: OrderProduct[];
    loyalty_points_earned?: number;
}

const ReturnsManager = () => {
    const [returns, setReturns] = useState<ReturnItem[]>([]);
    const [loading, setLoading] = useState(true);
    const [filter, setFilter] = useState<string>('all');
    const [searchTerm, setSearchTerm] = useState('');
    const [selectedReturn, setSelectedReturn] = useState<ReturnItem | null>(null);
    const [showModal, setShowModal] = useState(false);
    const [showCreateModal, setShowCreateModal] = useState(false);
    const [orderCode, setOrderCode] = useState('');
    const [returnReason, setReturnReason] = useState('');
    const [returnNotes, setReturnNotes] = useState('');
    const [creatingReturn, setCreatingReturn] = useState(false);
    const [orderDetails, setOrderDetails] = useState<OrderDetails | null>(null);
    const [returnProducts, setReturnProducts] = useState<OrderProduct[]>([]);
    const [loadingOrder, setLoadingOrder] = useState(false);
    const [step, setStep] = useState<'code' | 'review' | 'confirm'>('code');
    const [deliveredOrders, setDeliveredOrders] = useState<any[]>([]);
    const [showDeliveredOrders, setShowDeliveredOrders] = useState(false);

    const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'https://bkaa.vercel.app';

    useEffect(() => {
        fetchReturns();
        fetchDeliveredOrders();
    }, [filter]);
    
    const fetchDeliveredOrders = async () => {
        try {
            const token = localStorage.getItem('token');
            const response = await axios.get(
                `${API_BASE_URL}/api/admin-enhanced/orders-delivered`,
                { headers: { Authorization: `Bearer ${token}` } }
            );
            setDeliveredOrders(response.data.data || []);
        } catch (error) {
            console.error('Error fetching delivered orders:', error);
        }
    };

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

    const viewReturnInvoice = async (returnCode: string) => {
        try {
            const response = await axios.get(
                `${API_BASE_URL}/api/returns/invoice/${returnCode}`
            );
            
            const invoice = response.data.data;

            const returnedItems = Array.isArray(invoice.returned_items) ? invoice.returned_items : [];
            const returnedItemsHtml = returnedItems.length ? `
                <div class="section">
                    <div class="section-title">📦 المنتجات المرتجعة</div>
                    <table style="width: 100%; border-collapse: collapse; margin-top: 10px;">
                        <thead>
                            <tr>
                                <th style="text-align: right; padding: 8px; background: #fff7ed; border: 1px solid #f3e8ff;">المنتج</th>
                                <th style="text-align: center; padding: 8px; background: #fff7ed; border: 1px solid #f3e8ff;">الكمية</th>
                                <th style="text-align: right; padding: 8px; background: #fff7ed; border: 1px solid #f3e8ff;">السعر</th>
                                <th style="text-align: right; padding: 8px; background: #fff7ed; border: 1px solid #f3e8ff;">الإجمالي</th>
                            </tr>
                        </thead>
                        <tbody>
                            ${returnedItems.map((item: any) => {
                                const price = Number(item?.price || 0);
                                const quantity = Number(item?.quantity || 0);
                                const total = Number(item?.total || price * quantity);
                                return `
                                    <tr>
                                        <td style="padding: 8px; border: 1px solid #f3e8ff;">${item?.name || 'منتج'}</td>
                                        <td style="padding: 8px; border: 1px solid #f3e8ff; text-align: center;">${quantity}</td>
                                        <td style="padding: 8px; border: 1px solid #f3e8ff;">${price.toFixed(2)} جنيه</td>
                                        <td style="padding: 8px; border: 1px solid #f3e8ff; font-weight: bold;">${total.toFixed(2)} جنيه</td>
                                    </tr>
                                `;
                            }).join('')}
                        </tbody>
                    </table>
                </div>
            ` : '';
            
            // Display invoice in a beautiful modal or open in new window
            const invoiceHTML = `
                <!DOCTYPE html>
                <html dir="rtl">
                <head>
                    <meta charset="UTF-8">
                    <title>فاتورة استرجاع - ${invoice.return_code}</title>
                    <style>
                        body { font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; padding: 40px; background: #f5f5f5; }
                        .invoice { max-width: 800px; margin: 0 auto; background: white; padding: 40px; border-radius: 10px; box-shadow: 0 2px 10px rgba(0,0,0,0.1); }
                        .header { text-align: center; border-bottom: 3px solid #f97316; padding-bottom: 20px; margin-bottom: 30px; }
                        .header h1 { color: #f97316; margin: 0; font-size: 32px; }
                        .section { margin: 20px 0; }
                        .section-title { font-size: 18px; font-weight: bold; color: #333; margin-bottom: 10px; border-right: 4px solid #f97316; padding-right: 10px; }
                        .info-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 15px; }
                        .info-item { background: #f8f9fa; padding: 10px; border-radius: 5px; }
                        .info-label { font-size: 12px; color: #666; }
                        .info-value { font-size: 16px; font-weight: bold; color: #333; margin-top: 4px; }
                        .financial { background: #fff7ed; border: 2px solid #f97316; border-radius: 10px; padding: 20px; margin: 20px 0; }
                        .financial-row { display: flex; justify-content: space-between; margin: 10px 0; padding: 10px 0; border-bottom: 1px dashed #ddd; }
                        .financial-row:last-child { border-bottom: none; font-size: 20px; font-weight: bold; color: #f97316; }
                        .status-badge { display: inline-block; padding: 8px 16px; border-radius: 20px; background: #10b981; color: white; font-weight: bold; }
                        @media print { body { background: white; } .invoice { box-shadow: none; } }
                    </style>
                </head>
                <body>
                    <div class="invoice">
                        <div class="header">
                            <h1>🧾 فاتورة استرجاع</h1>
                            <p style="color: #666; margin: 10px 0;">كود الإرجاع: <strong>${invoice.return_code}</strong></p>
                            <span class="status-badge">✅ معتمد</span>
                        </div>

                        <div class="section">
                            <div class="section-title">📋 بيانات العميل</div>
                            <div class="info-grid">
                                <div class="info-item">
                                    <div class="info-label">الاسم</div>
                                    <div class="info-value">${invoice.customer.name}</div>
                                </div>
                                <div class="info-item">
                                    <div class="info-label">الهاتف</div>
                                    <div class="info-value">${invoice.customer.phone}</div>
                                </div>
                            </div>
                        </div>

                        <div class="section">
                            <div class="section-title">📍 الفرع</div>
                            <div class="info-value">${invoice.branch.name}</div>
                        </div>

                        <div class="section">
                            <div class="section-title">💰 الملخص المالي</div>
                            <div class="financial">
                                <div class="financial-row">
                                    <span>التوتال الأصلي</span>
                                    <span>${invoice.financial_summary.original_total} جنيه</span>
                                </div>
                                <div class="financial-row">
                                    <span>التوتال الجديد</span>
                                    <span>${invoice.financial_summary.new_total} جنيه</span>
                                </div>
                                <div class="financial-row">
                                    <span>المبلغ المسترجع</span>
                                    <span>${invoice.financial_summary.refund_amount} جنيه</span>
                                </div>
                            </div>
                        </div>

                        ${returnedItemsHtml}

                        <div class="section">
                            <div class="section-title">🎯 نقاط الولاء</div>
                            <div style="background: #fef3c7; padding: 15px; border-radius: 5px; border-right: 4px solid #f59e0b;">
                                <p style="margin: 0;"><strong>تم خصم ${invoice.loyalty_points.points_deducted} نقطة</strong></p>
                                <p style="margin: 5px 0 0 0; font-size: 14px; color: #92400e;">${invoice.loyalty_points.note}</p>
                            </div>
                        </div>

                        <div class="section">
                            <div class="section-title">📝 سبب الإرجاع</div>
                            <p>${invoice.return_reason}</p>
                            ${invoice.return_notes ? `<p style="color: #666;"><strong>ملاحظات:</strong> ${invoice.return_notes}</p>` : ''}
                        </div>

                        <div style="margin-top: 40px; padding-top: 20px; border-top: 2px solid #e5e7eb; text-align: center; color: #666; font-size: 14px;">
                            <p>تاريخ الاعتماد: ${new Date(invoice.approved_at).toLocaleDateString('ar-EG')}</p>
                            <p>تمت الموافقة بواسطة: ${invoice.approved_by || 'الإدارة'}</p>
                        </div>
                    </div>
                </body>
                </html>
            `;
            
            const newWindow = window.open('', '_blank');
            if (newWindow) {
                newWindow.document.write(invoiceHTML);
                newWindow.document.close();
            }
        } catch (error: any) {
            console.error('Error fetching invoice:', error);
            alert(error.response?.data?.error || 'فشل تحميل الفاتورة');
        }
    };

    const handleCreateReturn = async (e: React.FormEvent) => {
        e.preventDefault();
        
        if (!orderCode.trim()) {
            alert('من فضلك أدخل كود الطلب');
            return;
        }

        try {
            setLoadingOrder(true);
            const token = localStorage.getItem('token');
            
            console.log('🔍 Searching for order:', orderCode);
            
            // Fetch order details
            const response = await axios.get(
                `${API_BASE_URL}/api/admin-enhanced/orders/${orderCode}`,
                { headers: { Authorization: `Bearer ${token}` } }
            );
            
            console.log('📦 Order response:', response.data);
            
            const order = response.data.data;
            
            if (!order) {
                throw new Error('لم يتم العثور على الطلب');
            }
            
            // ✅ Check if order is delivered
            if (order.status !== 'delivered') {
                alert(`⚠️ لا يمكن إرجاع هذا الطلب\n\nالطلب يجب أن يكون مُسَلَّم أولاً.\nحالة الطلب الحالية: ${order.status === 'pending' ? 'بانتظار التأكيد' : order.status === 'confirmed' ? 'تم التأكيد' : order.status === 'preparing' ? 'جاري التحضير' : order.status === 'ready' ? 'جاهز للتوصيل' : order.status === 'out_for_delivery' ? 'في الطريق' : order.status}`);
                setLoadingOrder(false);
                return;
            }
            
            setOrderDetails(order);
            
            // Initialize return products with all items
            const products = Array.isArray(order.items) ? order.items : JSON.parse(order.items || '[]');
            setReturnProducts(products.map((item: any) => ({
                ...item,
                return_quantity: item.quantity // Default: return all
            })));
            
            setStep('review');
        } catch (error: any) {
            console.error('❌ Error fetching order:', error);
            console.error('❌ Error response:', error.response?.data);
            alert(error.response?.data?.message || error.message || 'لم يتم العثور على الطلب');
        } finally {
            setLoadingOrder(false);
        }
    };

    const updateReturnQuantity = (productId: number, newQuantity: number) => {
        setReturnProducts(prev => 
            prev.map(p => 
                p.id === productId 
                    ? { ...p, return_quantity: Math.max(0, Math.min(newQuantity, p.quantity)) }
                    : p
            )
        );
    };

    const removeProduct = (productId: number) => {
        setReturnProducts(prev => 
            prev.map(p => p.id === productId ? { ...p, return_quantity: 0 } : p)
        );
    };

    const calculateRefund = () => {
        return returnProducts.reduce((sum, p) => sum + (p.price * p.return_quantity), 0);
    };

    const confirmReturn = async () => {
        if (!returnReason.trim()) {
            alert('من فضلك أدخل سبب المرتجع');
            return;
        }

        const itemsToReturn = returnProducts.filter(p => p.return_quantity > 0);
        
        if (itemsToReturn.length === 0) {
            alert('من فضلك اختر منتجات للمرتجع');
            return;
        }

        try {
            setCreatingReturn(true);
            const token = localStorage.getItem('token');
            
            await axios.post(
                `${API_BASE_URL}/api/admin-enhanced/returns/create-full`,
                {
                    order_code: orderCode,
                    return_reason: returnReason,
                    return_notes: returnNotes,
                    items: itemsToReturn.map(p => ({
                        product_id: p.id,
                        name: p.name,
                        price: p.price,
                        quantity: p.return_quantity
                    })),
                    refund_amount: calculateRefund(),
                    update_inventory: true,
                    update_loyalty: true
                },
                { headers: { Authorization: `Bearer ${token}` } }
            );
            
            alert('تم إنشاء المرتجع بنجاح وتحديث المخزون ونقاط الولاء');
            resetForm();
            fetchReturns();
        } catch (error: any) {
            console.error('Error creating return:', error);
            alert(error.response?.data?.message || 'فشل إنشاء المرتجع');
        } finally {
            setCreatingReturn(false);
        }
    };

    const resetForm = () => {
        setShowCreateModal(false);
        setOrderCode('');
        setReturnReason('');
        setReturnNotes('');
        setOrderDetails(null);
        setReturnProducts([]);
        setStep('code');
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
                <button
                    onClick={() => setShowCreateModal(true)}
                    className="bg-orange-500 text-white px-6 py-3 rounded-lg hover:bg-orange-600 transition-colors font-medium flex items-center gap-2"
                >
                    <Plus size={20} />
                    إنشاء مرتجع جديد
                </button>
                <button
                    onClick={() => setShowDeliveredOrders(true)}
                    className="bg-green-500 text-white px-6 py-3 rounded-lg hover:bg-green-600 transition-colors font-medium flex items-center gap-2"
                >
                    <Package size={20} />
                    الطلبات المُسَلَّمة ({deliveredOrders.length})
                </button>
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

                            {/* Returned Items Section */}
                            {returnItem.items && returnItem.items.filter((item: any) => (item.quantity || item.return_quantity || 0) > 0).length > 0 && (
                                <div className="bg-orange-50 rounded-lg p-4 mb-4 border border-orange-200">
                                    <h4 className="font-bold text-gray-900 mb-3 flex items-center gap-2">
                                        <Package size={18} className="text-orange-600" />
                                        المنتجات المرتجعة ({returnItem.items.filter((item: any) => (item.quantity || item.return_quantity || 0) > 0).length} منتج)
                                    </h4>
                                    <div className="space-y-2">
                                        {returnItem.items
                                            .filter((item: any) => (item.quantity || item.return_quantity || 0) > 0)
                                            .map((item: any, index: number) => (
                                            <div key={index} className="bg-white rounded-lg p-3 flex items-center justify-between">
                                                <div className="flex items-center gap-3">
                                                    <div className="w-10 h-10 bg-orange-100 rounded-lg flex items-center justify-center">
                                                        <Package size={20} className="text-orange-600" />
                                                    </div>
                                                    <div>
                                                        <p className="font-semibold text-gray-900">{item.name || 'منتج'}</p>
                                                        <p className="text-sm text-gray-500">
                                                            الكمية: <span className="font-bold text-orange-600">{item.quantity || item.return_quantity || 0}</span>
                                                        </p>
                                                    </div>
                                                </div>
                                                <div className="text-left">
                                                    <p className="font-bold text-gray-900">{((item.price || 0) * (item.quantity || item.return_quantity || 0)).toFixed(2)} جنيه</p>
                                                    <p className="text-xs text-gray-500">{(item.price || 0).toFixed(2)} × {item.quantity || item.return_quantity || 0}</p>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            )}

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
                            
                            {returnItem.status === 'approved' && (
                                <div className="flex gap-2">
                                    <button
                                        onClick={() => viewReturnInvoice(returnItem.return_code)}
                                        className="flex-1 bg-orange-500 text-white px-4 py-2 rounded-lg hover:bg-orange-600 transition-colors font-medium flex items-center justify-center gap-2"
                                    >
                                        <FileText size={18} />
                                        عرض فاتورة الاسترجاع
                                    </button>
                                    <button
                                        onClick={() => {
                                            viewReturnInvoice(returnItem.return_code);
                                            setTimeout(() => window.print(), 1000);
                                        }}
                                        className="bg-blue-500 text-white px-4 py-2 rounded-lg hover:bg-blue-600 transition-colors font-medium flex items-center justify-center gap-2"
                                    >
                                        <Download size={18} />
                                        طباعة
                                    </button>
                                </div>
                            )}
                        </div>
                    ))}
                </div>
            )}

            {/* Create Return Modal */}
            {showCreateModal && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
                    <div className="bg-white rounded-2xl shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
                        <div className="p-6 border-b border-gray-200 sticky top-0 bg-white z-10">
                            <h2 className="text-2xl font-bold text-gray-900">إنشاء مرتجع جديد</h2>
                            <div className="flex gap-2 mt-4">
                                <div className={`flex-1 h-2 rounded ${step === 'code' ? 'bg-orange-500' : 'bg-gray-300'}`} />
                                <div className={`flex-1 h-2 rounded ${step === 'review' ? 'bg-orange-500' : 'bg-gray-300'}`} />
                                <div className={`flex-1 h-2 rounded ${step === 'confirm' ? 'bg-orange-500' : 'bg-gray-300'}`} />
                            </div>
                        </div>
                        
                        <div className="p-6">
                            {/* Step 1: Enter Order Code */}
                            {step === 'code' && (
                                <form onSubmit={handleCreateReturn} className="space-y-4">
                                    <div>
                                        <label className="block text-sm font-semibold text-gray-700 mb-2">
                                            كود الطلب (Order Code) *
                                        </label>
                                        <input
                                            type="text"
                                            value={orderCode}
                                            onChange={(e) => setOrderCode(e.target.value)}
                                            placeholder="مثال: ORD-123456"
                                            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent text-lg"
                                            required
                                            autoFocus
                                        />
                                        <p className="text-xs text-gray-500 mt-1">الكود الموجود في فاتورة العميل</p>
                                    </div>

                                    <div className="flex gap-3">
                                        <button
                                            type="submit"
                                            disabled={loadingOrder}
                                            className="flex-1 bg-orange-500 text-white px-6 py-3 rounded-lg hover:bg-orange-600 transition-colors font-medium disabled:opacity-50"
                                        >
                                            {loadingOrder ? 'جاري التحميل...' : 'عرض الطلب'}
                                        </button>
                                        <button
                                            type="button"
                                            onClick={resetForm}
                                            className="flex-1 bg-gray-200 text-gray-700 px-6 py-3 rounded-lg hover:bg-gray-300 transition-colors font-medium"
                                        >
                                            إلغاء
                                        </button>
                                    </div>
                                </form>
                            )}

                            {/* Step 2: Review & Edit Products */}
                            {step === 'review' && orderDetails && (
                                <div className="space-y-4">
                                    <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                                        <h3 className="font-bold text-blue-900 mb-2">معلومات الطلب</h3>
                                        <div className="grid grid-cols-2 gap-2 text-sm">
                                            <p><span className="font-semibold">رقم الطلب:</span> {orderDetails.order_number}</p>
                                            <p><span className="font-semibold">العميل:</span> {orderDetails.customer_name}</p>
                                            <p><span className="font-semibold">الهاتف:</span> {orderDetails.customer_phone}</p>
                                            <p><span className="font-semibold">الإجمالي:</span> {orderDetails.total} جنيه</p>
                                        </div>
                                    </div>

                                    <div>
                                        <h3 className="font-bold text-gray-900 mb-3">المنتجات - حدد الكميات المرتجعة</h3>
                                        <div className="space-y-3">
                                            {returnProducts.map((product) => (
                                                <div key={product.id} className="border border-gray-200 rounded-lg p-4">
                                                    <div className="flex items-center gap-4">
                                                        {product.image && (
                                                            <img src={product.image} alt={product.name} className="w-16 h-16 object-cover rounded" />
                                                        )}
                                                        <div className="flex-1">
                                                            <h4 className="font-semibold text-gray-900">{product.name}</h4>
                                                            <p className="text-sm text-gray-600">السعر: {product.price} جنيه</p>
                                                            <p className="text-sm text-gray-600">الكمية الأصلية: {product.quantity}</p>
                                                        </div>
                                                        <div className="flex items-center gap-2">
                                                            <button
                                                                onClick={() => updateReturnQuantity(product.id, product.return_quantity - 1)}
                                                                className="w-8 h-8 bg-gray-200 rounded hover:bg-gray-300 text-gray-700 font-bold"
                                                                disabled={product.return_quantity === 0}
                                                            >
                                                                -
                                                            </button>
                                                            <input
                                                                type="number"
                                                                value={product.return_quantity}
                                                                onChange={(e) => updateReturnQuantity(product.id, parseInt(e.target.value) || 0)}
                                                                className="w-16 px-2 py-1 border border-gray-300 rounded text-center"
                                                                min="0"
                                                                max={product.quantity}
                                                            />
                                                            <button
                                                                onClick={() => updateReturnQuantity(product.id, product.return_quantity + 1)}
                                                                className="w-8 h-8 bg-gray-200 rounded hover:bg-gray-300 text-gray-700 font-bold"
                                                                disabled={product.return_quantity >= product.quantity}
                                                            >
                                                                +
                                                            </button>
                                                            <button
                                                                onClick={() => removeProduct(product.id)}
                                                                className="ml-2 text-red-500 hover:text-red-700"
                                                                title="حذف من المرتجع"
                                                            >
                                                                <XCircle size={24} />
                                                            </button>
                                                        </div>
                                                    </div>
                                                    <p className="text-sm text-orange-600 font-semibold mt-2">
                                                        المبلغ المسترجع: {product.price * product.return_quantity} جنيه
                                                    </p>
                                                </div>
                                            ))}
                                        </div>
                                    </div>

                                    <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                                        <p className="text-lg font-bold text-green-900">
                                            إجمالي المبلغ المسترجع: {calculateRefund()} جنيه
                                        </p>
                                    </div>

                                    <div className="flex gap-3">
                                        <button
                                            onClick={() => setStep('confirm')}
                                            className="flex-1 bg-orange-500 text-white px-6 py-3 rounded-lg hover:bg-orange-600 transition-colors font-medium"
                                        >
                                            التالي
                                        </button>
                                        <button
                                            onClick={() => setStep('code')}
                                            className="flex-1 bg-gray-200 text-gray-700 px-6 py-3 rounded-lg hover:bg-gray-300 transition-colors font-medium"
                                        >
                                            رجوع
                                        </button>
                                    </div>
                                </div>
                            )}

                            {/* Step 3: Confirm & Submit */}
                            {step === 'confirm' && (
                                <div className="space-y-4">
                                    <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                                        <h3 className="font-bold text-yellow-900 mb-2">⚠️ تأكيد المرتجع</h3>
                                        <p className="text-sm text-yellow-800">
                                            سيتم تنفيذ التالي:
                                        </p>
                                        <ul className="list-disc list-inside text-sm text-yellow-800 mt-2">
                                            <li>إضافة المنتجات المرتجعة إلى المخزون</li>
                                            <li>تقليل نقاط الولاء من حساب العميل</li>
                                            <li>إنشاء سجل المرتجع بمبلغ {calculateRefund()} جنيه</li>
                                        </ul>
                                    </div>

                                    <div>
                                        <label className="block text-sm font-semibold text-gray-700 mb-2">
                                            سبب المرتجع *
                                        </label>
                                        <select
                                            value={returnReason}
                                            onChange={(e) => setReturnReason(e.target.value)}
                                            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500"
                                            required
                                        >
                                            <option value="">اختر السبب</option>
                                            <option value="منتج تالف">منتج تالف</option>
                                            <option value="منتج خاطئ">منتج خاطئ</option>
                                            <option value="منتج منتهي الصلاحية">منتج منتهي الصلاحية</option>
                                            <option value="غير مطابق للمواصفات">غير مطابق للمواصفات</option>
                                            <option value="العميل غير راض">العميل غير راض</option>
                                            <option value="تغيير في الطلب">تغيير في الطلب</option>
                                            <option value="أخرى">أخرى</option>
                                        </select>
                                    </div>

                                    <div>
                                        <label className="block text-sm font-semibold text-gray-700 mb-2">
                                            ملاحظات إضافية
                                        </label>
                                        <textarea
                                            value={returnNotes}
                                            onChange={(e) => setReturnNotes(e.target.value)}
                                            placeholder="تفاصيل إضافية عن المرتجع..."
                                            rows={4}
                                            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500"
                                        />
                                    </div>

                                    <div className="flex gap-3">
                                        <button
                                            onClick={confirmReturn}
                                            disabled={creatingReturn || !returnReason}
                                            className="flex-1 bg-green-500 text-white px-6 py-3 rounded-lg hover:bg-green-600 transition-colors font-medium disabled:opacity-50 flex items-center justify-center gap-2"
                                        >
                                            <CheckCircle size={20} />
                                            {creatingReturn ? 'جاري الإنشاء...' : 'تأكيد المرتجع'}
                                        </button>
                                        <button
                                            onClick={() => setStep('review')}
                                            className="flex-1 bg-gray-200 text-gray-700 px-6 py-3 rounded-lg hover:bg-gray-300 transition-colors font-medium"
                                        >
                                            رجوع
                                        </button>
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            )}
            
            {/* Delivered Orders Modal */}
            {showDeliveredOrders && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
                    <div className="bg-white rounded-2xl shadow-2xl max-w-6xl w-full max-h-[90vh] overflow-hidden">
                        <div className="bg-gradient-to-r from-green-500 to-green-600 text-white p-6">
                            <div className="flex justify-between items-center">
                                <div>
                                    <h2 className="text-2xl font-bold">الطلبات المُسَلَّمة</h2>
                                    <p className="text-green-100 mt-1">اختر طلب لإنشاء مرتجع</p>
                                </div>
                                <button
                                    onClick={() => setShowDeliveredOrders(false)}
                                    className="text-white hover:bg-green-700 p-2 rounded-lg transition-colors"
                                >
                                    <XCircle size={24} />
                                </button>
                            </div>
                        </div>
                        
                        <div className="p-6 overflow-y-auto max-h-[calc(90vh-100px)]">
                            {deliveredOrders.length === 0 ? (
                                <div className="text-center py-12">
                                    <Package size={64} className="mx-auto text-gray-300 mb-4" />
                                    <p className="text-gray-500 text-lg">لا توجد طلبات مُسَلَّمة حالياً</p>
                                </div>
                            ) : (
                                <div className="grid gap-4">
                                    {deliveredOrders.map((order) => (
                                        <div
                                            key={order.id}
                                            className="bg-white border border-gray-200 rounded-xl p-4 hover:shadow-md transition-shadow cursor-pointer"
                                            onClick={() => {
                                                setOrderCode(order.order_code);
                                                setShowDeliveredOrders(false);
                                                setShowCreateModal(true);
                                            }}
                                        >
                                            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                                                <div>
                                                    <p className="text-sm text-gray-500">كود الطلب</p>
                                                    <p className="font-bold text-orange-600">{order.order_code}</p>
                                                </div>
                                                <div>
                                                    <p className="text-sm text-gray-500">اسم العميل</p>
                                                    <p className="font-medium">{order.customer_name || 'غير متوفر'}</p>
                                                </div>
                                                <div>
                                                    <p className="text-sm text-gray-500">الإجمالي</p>
                                                    <p className="font-medium">{(Number(order.total) || 0).toFixed(2)} جنيه</p>
                                                </div>
                                                <div>
                                                    <p className="text-sm text-gray-500">تاريخ التوصيل</p>
                                                    <p className="font-medium">{new Date(order.created_at).toLocaleDateString('ar-EG')}</p>
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            )}
```
        </div>
    );
};

export default ReturnsManager;
