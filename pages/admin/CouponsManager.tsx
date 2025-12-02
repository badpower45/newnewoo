import React, { useState, useEffect } from 'react';
import { Plus, Edit, Trash2, Search, Tag, X, TrendingUp, Users, Calendar, Percent } from 'lucide-react';
import { api } from '../../services/api';

interface Coupon {
    id: number;
    code: string;
    description: string;
    discount_type: 'percentage' | 'fixed';
    discount_value: number;
    min_order_value: number;
    max_discount: number | null;
    usage_limit: number | null;
    used_count: number;
    per_user_limit: number | null;
    valid_from: string;
    valid_until: string | null;
    is_active: boolean;
    created_by_name?: string;
    total_usage?: number;
    unique_users?: number;
}

const emptyCoupon = {
    code: '',
    description: '',
    discountType: 'percentage' as 'percentage' | 'fixed',
    discountValue: 0,
    minOrderValue: 0,
    maxDiscount: null as number | null,
    usageLimit: null as number | null,
    perUserLimit: 1,
    validFrom: new Date().toISOString().split('T')[0],
    validUntil: null as string | null,
    isActive: true
};

const CouponsManager = () => {
    const [coupons, setCoupons] = useState<Coupon[]>([]);
    const [searchTerm, setSearchTerm] = useState('');
    const [showModal, setShowModal] = useState(false);
    const [editing, setEditing] = useState<Coupon | null>(null);
    const [form, setForm] = useState(emptyCoupon);
    const [loading, setLoading] = useState(false);
    const [showUsageModal, setShowUsageModal] = useState(false);
    const [usageData, setUsageData] = useState<any>(null);

    useEffect(() => {
        loadCoupons();
    }, []);

    const loadCoupons = async () => {
        setLoading(true);
        try {
            const res = await api.coupons.getAll();
            if (res.data) {
                setCoupons(res.data);
            }
        } catch (err) {
            console.error('Failed to load coupons:', err);
            alert('فشل تحميل الكوبونات');
        } finally {
            setLoading(false);
        }
    };

    const handleDelete = async (id: number) => {
        if (window.confirm('هل أنت متأكد من حذف هذا الكوبون؟')) {
            try {
                await api.coupons.delete(id);
                loadCoupons();
            } catch (err) {
                console.error('Failed to delete coupon:', err);
                alert('فشل حذف الكوبون');
            }
        }
    };

    const openCreate = () => {
        setEditing(null);
        setForm(emptyCoupon);
        setShowModal(true);
    };

    const openEdit = (coupon: Coupon) => {
        setEditing(coupon);
        setForm({
            code: coupon.code,
            description: coupon.description,
            discountType: coupon.discount_type,
            discountValue: coupon.discount_value,
            minOrderValue: coupon.min_order_value,
            maxDiscount: coupon.max_discount,
            usageLimit: coupon.usage_limit,
            perUserLimit: coupon.per_user_limit,
            validFrom: coupon.valid_from ? new Date(coupon.valid_from).toISOString().split('T')[0] : '',
            validUntil: coupon.valid_until ? new Date(coupon.valid_until).toISOString().split('T')[0] : null,
            isActive: coupon.is_active
        });
        setShowModal(true);
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);

        try {
            if (editing) {
                await api.coupons.update(editing.id, form);
            } else {
                await api.coupons.create(form);
            }
            loadCoupons();
            setShowModal(false);
            setForm(emptyCoupon);
        } catch (err: any) {
            console.error('Failed to save coupon:', err);
            alert(err.response?.data?.error || 'فشل حفظ الكوبون');
        } finally {
            setLoading(false);
        }
    };

    const viewUsage = async (code: string) => {
        try {
            const res = await api.coupons.getUsage(code);
            setUsageData(res);
            setShowUsageModal(true);
        } catch (err) {
            console.error('Failed to load usage:', err);
            alert('فشل تحميل إحصائيات الاستخدام');
        }
    };

    const filtered = coupons.filter(c =>
        c.code.toLowerCase().includes(searchTerm.toLowerCase()) ||
        c.description?.toLowerCase().includes(searchTerm.toLowerCase())
    );

    return (
        <div className="p-6">
            <div className="flex justify-between items-center mb-6">
                <h1 className="text-3xl font-bold text-gray-900">إدارة الكوبونات</h1>
                <button
                    onClick={openCreate}
                    className="bg-green-600 text-white px-6 py-3 rounded-xl hover:bg-green-700 transition-colors flex items-center gap-2 font-medium shadow-lg"
                >
                    <Plus size={20} />
                    إنشاء كوبون جديد
                </button>
            </div>

            {/* Search */}
            <div className="mb-6 relative">
                <Search className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
                <input
                    type="text"
                    placeholder="ابحث عن كوبون..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full pr-12 pl-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-green-500 focus:border-green-500 outline-none"
                />
            </div>

            {/* Coupons Table */}
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full">
                        <thead className="bg-gray-50 border-b border-gray-200">
                            <tr>
                                <th className="px-6 py-4 text-right text-sm font-bold text-gray-700">الكود</th>
                                <th className="px-6 py-4 text-right text-sm font-bold text-gray-700">الوصف</th>
                                <th className="px-6 py-4 text-right text-sm font-bold text-gray-700">الخصم</th>
                                <th className="px-6 py-4 text-right text-sm font-bold text-gray-700">الحد الأدنى</th>
                                <th className="px-6 py-4 text-right text-sm font-bold text-gray-700">الاستخدام</th>
                                <th className="px-6 py-4 text-right text-sm font-bold text-gray-700">الصلاحية</th>
                                <th className="px-6 py-4 text-right text-sm font-bold text-gray-700">الحالة</th>
                                <th className="px-6 py-4 text-right text-sm font-bold text-gray-700">إجراءات</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100">
                            {loading && (
                                <tr>
                                    <td colSpan={8} className="px-6 py-8 text-center text-gray-500">
                                        جاري التحميل...
                                    </td>
                                </tr>
                            )}
                            {!loading && filtered.length === 0 && (
                                <tr>
                                    <td colSpan={8} className="px-6 py-8 text-center text-gray-500">
                                        لا توجد كوبونات
                                    </td>
                                </tr>
                            )}
                            {!loading && filtered.map((coupon) => (
                                <tr key={coupon.id} className="hover:bg-gray-50 transition-colors">
                                    <td className="px-6 py-4">
                                        <div className="flex items-center gap-2">
                                            <Tag size={16} className="text-green-600" />
                                            <span className="font-bold text-gray-900">{coupon.code}</span>
                                        </div>
                                    </td>
                                    <td className="px-6 py-4 text-sm text-gray-600 max-w-xs truncate">
                                        {coupon.description || '-'}
                                    </td>
                                    <td className="px-6 py-4">
                                        <span className="inline-flex items-center gap-1 px-3 py-1 bg-green-50 text-green-700 rounded-lg text-sm font-medium">
                                            {coupon.discount_type === 'percentage' ? (
                                                <><Percent size={14} />{coupon.discount_value}%</>
                                            ) : (
                                                <>{coupon.discount_value} جنيه</>
                                            )}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4 text-sm text-gray-600">
                                        {coupon.min_order_value > 0 ? `${coupon.min_order_value} جنيه` : '-'}
                                    </td>
                                    <td className="px-6 py-4">
                                        <button
                                            onClick={() => viewUsage(coupon.code)}
                                            className="text-sm text-blue-600 hover:text-blue-800 font-medium"
                                        >
                                            {coupon.used_count} / {coupon.usage_limit || '∞'}
                                        </button>
                                    </td>
                                    <td className="px-6 py-4 text-sm text-gray-600">
                                        {coupon.valid_until
                                            ? new Date(coupon.valid_until).toLocaleDateString('ar-EG')
                                            : 'دائم'}
                                    </td>
                                    <td className="px-6 py-4">
                                        <span className={`inline-flex px-3 py-1 rounded-full text-xs font-medium ${
                                            coupon.is_active
                                                ? 'bg-green-100 text-green-700'
                                                : 'bg-red-100 text-red-700'
                                        }`}>
                                            {coupon.is_active ? 'نشط' : 'معطل'}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4">
                                        <div className="flex items-center gap-2">
                                            <button
                                                onClick={() => openEdit(coupon)}
                                                className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                                                title="تعديل"
                                            >
                                                <Edit size={18} />
                                            </button>
                                            <button
                                                onClick={() => handleDelete(coupon.id)}
                                                className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                                                title="حذف"
                                            >
                                                <Trash2 size={18} />
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* Create/Edit Modal */}
            {showModal && (
                <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
                    <div className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
                        <div className="p-6 border-b border-gray-100 flex justify-between items-center sticky top-0 bg-white">
                            <h2 className="text-2xl font-bold text-gray-900">
                                {editing ? 'تعديل كوبون' : 'إنشاء كوبون جديد'}
                            </h2>
                            <button
                                onClick={() => setShowModal(false)}
                                className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                            >
                                <X size={24} />
                            </button>
                        </div>

                        <form onSubmit={handleSubmit} className="p-6 space-y-6">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                {/* Code */}
                                <div className="md:col-span-2">
                                    <label className="block text-sm font-bold text-gray-700 mb-2">
                                        كود الكوبون *
                                    </label>
                                    <input
                                        type="text"
                                        required
                                        value={form.code}
                                        onChange={(e) => setForm({ ...form, code: e.target.value.toUpperCase() })}
                                        className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-green-500 focus:border-green-500 outline-none"
                                        placeholder="مثال: SAVE20"
                                    />
                                </div>

                                {/* Description */}
                                <div className="md:col-span-2">
                                    <label className="block text-sm font-bold text-gray-700 mb-2">
                                        الوصف
                                    </label>
                                    <textarea
                                        value={form.description}
                                        onChange={(e) => setForm({ ...form, description: e.target.value })}
                                        className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-green-500 focus:border-green-500 outline-none"
                                        rows={2}
                                        placeholder="وصف قصير للكوبون"
                                    />
                                </div>

                                {/* Discount Type */}
                                <div>
                                    <label className="block text-sm font-bold text-gray-700 mb-2">
                                        نوع الخصم *
                                    </label>
                                    <select
                                        required
                                        value={form.discountType}
                                        onChange={(e) => setForm({ ...form, discountType: e.target.value as any })}
                                        className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-green-500 focus:border-green-500 outline-none"
                                    >
                                        <option value="percentage">نسبة مئوية (%)</option>
                                        <option value="fixed">مبلغ ثابت (جنيه)</option>
                                    </select>
                                </div>

                                {/* Discount Value */}
                                <div>
                                    <label className="block text-sm font-bold text-gray-700 mb-2">
                                        قيمة الخصم *
                                    </label>
                                    <input
                                        type="number"
                                        required
                                        min="0"
                                        step="0.01"
                                        value={form.discountValue}
                                        onChange={(e) => setForm({ ...form, discountValue: parseFloat(e.target.value) })}
                                        className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-green-500 focus:border-green-500 outline-none"
                                        placeholder={form.discountType === 'percentage' ? '10' : '50'}
                                    />
                                </div>

                                {/* Min Order Value */}
                                <div>
                                    <label className="block text-sm font-bold text-gray-700 mb-2">
                                        الحد الأدنى للطلب (جنيه)
                                    </label>
                                    <input
                                        type="number"
                                        min="0"
                                        step="0.01"
                                        value={form.minOrderValue}
                                        onChange={(e) => setForm({ ...form, minOrderValue: parseFloat(e.target.value) })}
                                        className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-green-500 focus:border-green-500 outline-none"
                                        placeholder="0"
                                    />
                                </div>

                                {/* Max Discount (for percentage) */}
                                {form.discountType === 'percentage' && (
                                    <div>
                                        <label className="block text-sm font-bold text-gray-700 mb-2">
                                            الحد الأقصى للخصم (جنيه)
                                        </label>
                                        <input
                                            type="number"
                                            min="0"
                                            step="0.01"
                                            value={form.maxDiscount || ''}
                                            onChange={(e) => setForm({ ...form, maxDiscount: e.target.value ? parseFloat(e.target.value) : null })}
                                            className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-green-500 focus:border-green-500 outline-none"
                                            placeholder="لا يوجد"
                                        />
                                    </div>
                                )}

                                {/* Usage Limit */}
                                <div>
                                    <label className="block text-sm font-bold text-gray-700 mb-2">
                                        عدد الاستخدامات الكلي
                                    </label>
                                    <input
                                        type="number"
                                        min="0"
                                        value={form.usageLimit || ''}
                                        onChange={(e) => setForm({ ...form, usageLimit: e.target.value ? parseInt(e.target.value) : null })}
                                        className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-green-500 focus:border-green-500 outline-none"
                                        placeholder="لا نهائي"
                                    />
                                    <p className="text-xs text-gray-500 mt-1">اتركه فارغاً للاستخدام اللانهائي</p>
                                </div>

                                {/* Per User Limit */}
                                <div>
                                    <label className="block text-sm font-bold text-gray-700 mb-2">
                                        عدد الاستخدامات لكل مستخدم
                                    </label>
                                    <input
                                        type="number"
                                        min="1"
                                        value={form.perUserLimit || ''}
                                        onChange={(e) => setForm({ ...form, perUserLimit: e.target.value ? parseInt(e.target.value) : null })}
                                        className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-green-500 focus:border-green-500 outline-none"
                                        placeholder="1"
                                    />
                                    <p className="text-xs text-gray-500 mt-1">اتركه فارغاً للاستخدام اللانهائي</p>
                                </div>

                                {/* Valid From */}
                                <div>
                                    <label className="block text-sm font-bold text-gray-700 mb-2">
                                        صالح من
                                    </label>
                                    <input
                                        type="date"
                                        value={form.validFrom}
                                        onChange={(e) => setForm({ ...form, validFrom: e.target.value })}
                                        className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-green-500 focus:border-green-500 outline-none"
                                    />
                                </div>

                                {/* Valid Until */}
                                <div>
                                    <label className="block text-sm font-bold text-gray-700 mb-2">
                                        صالح حتى
                                    </label>
                                    <input
                                        type="date"
                                        value={form.validUntil || ''}
                                        onChange={(e) => setForm({ ...form, validUntil: e.target.value || null })}
                                        className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-green-500 focus:border-green-500 outline-none"
                                    />
                                    <p className="text-xs text-gray-500 mt-1">اتركه فارغاً إذا كان دائماً</p>
                                </div>

                                {/* Is Active */}
                                <div className="md:col-span-2">
                                    <label className="flex items-center gap-3 cursor-pointer">
                                        <input
                                            type="checkbox"
                                            checked={form.isActive}
                                            onChange={(e) => setForm({ ...form, isActive: e.target.checked })}
                                            className="w-5 h-5 text-green-600 rounded focus:ring-2 focus:ring-green-500"
                                        />
                                        <span className="text-sm font-bold text-gray-700">تفعيل الكوبون</span>
                                    </label>
                                </div>
                            </div>

                            {/* Actions */}
                            <div className="flex gap-4 pt-4 border-t border-gray-100">
                                <button
                                    type="submit"
                                    disabled={loading}
                                    className="flex-1 bg-green-600 text-white py-3 rounded-xl hover:bg-green-700 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors font-bold"
                                >
                                    {loading ? 'جاري الحفظ...' : editing ? 'تحديث الكوبون' : 'إنشاء الكوبون'}
                                </button>
                                <button
                                    type="button"
                                    onClick={() => setShowModal(false)}
                                    className="px-6 py-3 border border-gray-200 rounded-xl hover:bg-gray-50 transition-colors font-medium"
                                >
                                    إلغاء
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* Usage Modal */}
            {showUsageModal && usageData && (
                <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
                    <div className="bg-white rounded-2xl shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
                        <div className="p-6 border-b border-gray-100 flex justify-between items-center sticky top-0 bg-white">
                            <h2 className="text-2xl font-bold text-gray-900">
                                إحصائيات الكوبون: {usageData.coupon?.code}
                            </h2>
                            <button
                                onClick={() => setShowUsageModal(false)}
                                className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                            >
                                <X size={24} />
                            </button>
                        </div>

                        <div className="p-6">
                            {/* Stats */}
                            <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
                                <div className="bg-blue-50 p-4 rounded-xl">
                                    <div className="flex items-center gap-2 mb-2">
                                        <TrendingUp size={20} className="text-blue-600" />
                                        <span className="text-sm text-blue-700 font-medium">إجمالي الاستخدامات</span>
                                    </div>
                                    <p className="text-2xl font-bold text-blue-900">{usageData.stats?.total_uses || 0}</p>
                                </div>

                                <div className="bg-green-50 p-4 rounded-xl">
                                    <div className="flex items-center gap-2 mb-2">
                                        <Users size={20} className="text-green-600" />
                                        <span className="text-sm text-green-700 font-medium">مستخدمون فريدون</span>
                                    </div>
                                    <p className="text-2xl font-bold text-green-900">{usageData.stats?.unique_users || 0}</p>
                                </div>

                                <div className="bg-purple-50 p-4 rounded-xl">
                                    <div className="flex items-center gap-2 mb-2">
                                        <Tag size={20} className="text-purple-600" />
                                        <span className="text-sm text-purple-700 font-medium">إجمالي الخصم</span>
                                    </div>
                                    <p className="text-2xl font-bold text-purple-900">
                                        {parseFloat(usageData.stats?.total_discount || 0).toFixed(2)} جنيه
                                    </p>
                                </div>

                                <div className="bg-orange-50 p-4 rounded-xl">
                                    <div className="flex items-center gap-2 mb-2">
                                        <Calendar size={20} className="text-orange-600" />
                                        <span className="text-sm text-orange-700 font-medium">متوسط الخصم</span>
                                    </div>
                                    <p className="text-2xl font-bold text-orange-900">
                                        {parseFloat(usageData.stats?.avg_discount || 0).toFixed(2)} جنيه
                                    </p>
                                </div>
                            </div>

                            {/* Usage History */}
                            <h3 className="text-lg font-bold text-gray-900 mb-4">سجل الاستخدام</h3>
                            <div className="bg-gray-50 rounded-xl overflow-hidden">
                                {usageData.usage && usageData.usage.length > 0 ? (
                                    <div className="max-h-96 overflow-y-auto">
                                        <table className="w-full">
                                            <thead className="bg-white border-b border-gray-200 sticky top-0">
                                                <tr>
                                                    <th className="px-4 py-3 text-right text-sm font-bold text-gray-700">المستخدم</th>
                                                    <th className="px-4 py-3 text-right text-sm font-bold text-gray-700">رقم الطلب</th>
                                                    <th className="px-4 py-3 text-right text-sm font-bold text-gray-700">قيمة الخصم</th>
                                                    <th className="px-4 py-3 text-right text-sm font-bold text-gray-700">التاريخ</th>
                                                </tr>
                                            </thead>
                                            <tbody className="divide-y divide-gray-200">
                                                {usageData.usage.map((u: any, idx: number) => (
                                                    <tr key={idx} className="hover:bg-white transition-colors">
                                                        <td className="px-4 py-3 text-sm text-gray-900">
                                                            {u.user_name || 'N/A'}
                                                        </td>
                                                        <td className="px-4 py-3 text-sm text-gray-600">
                                                            #{u.order_id}
                                                        </td>
                                                        <td className="px-4 py-3 text-sm font-medium text-green-600">
                                                            {parseFloat(u.discount_amount).toFixed(2)} جنيه
                                                        </td>
                                                        <td className="px-4 py-3 text-sm text-gray-600">
                                                            {new Date(u.used_at).toLocaleDateString('ar-EG')}
                                                        </td>
                                                    </tr>
                                                ))}
                                            </tbody>
                                        </table>
                                    </div>
                                ) : (
                                    <p className="text-center text-gray-500 py-8">لم يتم استخدام هذا الكوبون بعد</p>
                                )}
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default CouponsManager;
