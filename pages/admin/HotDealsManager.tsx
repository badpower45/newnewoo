import React, { useState, useEffect } from 'react';
import { Plus, Edit2, Trash2, Loader, Flame, Search, Clock, Bell, AlertCircle } from 'lucide-react';
import { api } from '../../services/api';
import { pushNotificationService } from '../../services/pushNotifications';
import { TableSkeleton } from '../../components/Skeleton';

interface HotDeal {
    id: number;
    name: string;
    name_en?: string;
    price: number;
    old_price: number;
    discount_percentage: number;
    image?: string;
    sold_percentage: number;
    total_quantity: number;
    sold_quantity: number;
    end_time: string;
    is_flash_deal: boolean;
    is_active: boolean;
}

const HotDealsManager = () => {
    const [deals, setDeals] = useState<HotDeal[]>([]);
    const [loading, setLoading] = useState(true);
    const [showModal, setShowModal] = useState(false);
    const [editingDeal, setEditingDeal] = useState<HotDeal | null>(null);
    const [searchTerm, setSearchTerm] = useState('');
    const [saving, setSaving] = useState(false);
    const [sendPush, setSendPush] = useState(false);
    const [error, setError] = useState('');

    const [formData, setFormData] = useState({
        name: '',
        name_en: '',
        price: '',
        old_price: '',
        discount_percentage: '',
        image: '',
        total_quantity: '100',
        end_time: '',
        is_flash_deal: false,
        is_active: true
    });

    useEffect(() => {
        loadDeals();
    }, []);

    const loadDeals = async () => {
        setLoading(true);
        setError('');
        try {
            const res = await api.hotDeals.getAll();
            const payload = res?.data ?? res;
            setDeals(Array.isArray(payload) ? payload : Array.isArray(payload?.data) ? payload.data : []);
        } catch (err) {
            console.error('Failed to load hot deals:', err);
            setError('فشل تحميل العروض الساخنة');
        } finally {
            setLoading(false);
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setSaving(true);
        setError('');

        try {
            const data = {
                ...formData,
                price: parseFloat(formData.price),
                old_price: parseFloat(formData.old_price),
                discount_percentage: parseInt(formData.discount_percentage),
                total_quantity: parseInt(formData.total_quantity)
            };

            const op = editingDeal ? api.hotDeals.update(editingDeal.id, data) : api.hotDeals.create(data);
            const created = await op;

            if (sendPush) {
                await pushNotificationService.notifyNewOffer({
                    title: data.name,
                    discount: data.discount_percentage,
                    image: data.image,
                    productId: created?.data?.product_id || created?.product_id || undefined
                });
            }

            setShowModal(false);
            resetForm();
            loadDeals();
        } catch (err) {
            console.error('Failed to save deal:', err);
            setError('فشل حفظ العرض');
        } finally {
            setSaving(false);
        }
    };

    const handleEdit = (deal: HotDeal) => {
        setEditingDeal(deal);
        const endDate = new Date(deal.end_time);
        const formattedDate = endDate.toISOString().slice(0, 16);
        
        setFormData({
            name: deal.name,
            name_en: deal.name_en || '',
            price: String(deal.price),
            old_price: String(deal.old_price),
            discount_percentage: String(deal.discount_percentage),
            image: deal.image || '',
            total_quantity: String(deal.total_quantity),
            end_time: formattedDate,
            is_flash_deal: deal.is_flash_deal,
            is_active: deal.is_active
        });
        setSendPush(false);
        setShowModal(true);
    };

    const handleDelete = async (id: number) => {
        if (!confirm('هل أنت متأكد من حذف هذا العرض؟')) return;

        try {
            await api.hotDeals.delete(id);
            loadDeals();
        } catch (err) {
            console.error('Failed to delete deal:', err);
            alert('فشل حذف العرض');
        }
    };

    const resetForm = () => {
        setEditingDeal(null);
        setSendPush(false);
        setFormData({
            name: '',
            name_en: '',
            price: '',
            old_price: '',
            discount_percentage: '',
            image: '',
            total_quantity: '100',
            end_time: '',
            is_flash_deal: false,
            is_active: true
        });
    };

    const filteredDeals = deals.filter(deal =>
        deal.name.toLowerCase().includes(searchTerm.toLowerCase())
    );

    const getTimeRemaining = (endTime: string) => {
        const diff = new Date(endTime).getTime() - Date.now();
        if (diff <= 0) return 'انتهى';

        const hours = Math.floor(diff / (1000 * 60 * 60));
        const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));

        if (hours > 24) {
            const days = Math.floor(hours / 24);
            return `${days} يوم`;
        }
        return `${hours}س ${minutes}د`;
    };

    return (
        <div className="p-6">
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
                <div className="flex items-center gap-3">
                    <div className="w-12 h-12 bg-gradient-to-br from-[#EF4444] to-[#dc2626] rounded-xl flex items-center justify-center">
                        <Flame className="w-6 h-6 text-white" />
                    </div>
                    <div>
                        <h1 className="text-2xl font-bold text-gray-900">إدارة العروض الساخنة</h1>
                        <p className="text-gray-500 text-sm">عروض محدودة الوقت مع عداد تنازلي</p>
                    </div>
                </div>
                <button
                    onClick={() => { resetForm(); setShowModal(true); }}
                    className="flex items-center gap-2 bg-[#EF4444] text-white px-4 py-2 rounded-xl hover:bg-[#dc2626] transition-colors"
                >
                    <Plus className="w-5 h-5" />
                    <span>إضافة عرض</span>
                </button>
            </div>

            {/* Search */}
            <div className="bg-white rounded-xl shadow-sm p-4 mb-6">
                <div className="relative max-w-md">
                    <Search className="absolute right-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                    <input
                        type="text"
                        placeholder="بحث عن عرض..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="w-full pr-10 pl-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#EF4444]/20"
                    />
                </div>
                {error && (
                    <div className="flex items-center gap-2 mt-3 text-red-700 bg-red-50 border border-red-100 px-3 py-2 rounded-lg text-sm">
                        <AlertCircle size={16} />
                        {error}
                    </div>
                )}
            </div>

            {/* Table */}
            <div className="bg-white rounded-xl shadow-sm overflow-hidden">
                {loading ? (
                    <div className="p-4">
                        <TableSkeleton rows={5} columns={7} />
                    </div>
                ) : filteredDeals.length === 0 ? (
                    <div className="text-center py-12">
                        <Flame className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                        <p className="text-gray-500">لا توجد عروض ساخنة</p>
                    </div>
                ) : (
                    <div className="overflow-x-auto">
                        <table className="w-full">
                            <thead className="bg-gray-50">
                                <tr>
                                    <th className="px-4 py-3 text-right text-sm font-medium text-gray-600">المنتج</th>
                                    <th className="px-4 py-3 text-right text-sm font-medium text-gray-600">السعر</th>
                                    <th className="px-4 py-3 text-right text-sm font-medium text-gray-600">الخصم</th>
                                    <th className="px-4 py-3 text-right text-sm font-medium text-gray-600">المبيعات</th>
                                    <th className="px-4 py-3 text-right text-sm font-medium text-gray-600">الوقت المتبقي</th>
                                    <th className="px-4 py-3 text-right text-sm font-medium text-gray-600">النوع</th>
                                    <th className="px-4 py-3 text-right text-sm font-medium text-gray-600">إجراءات</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-100">
                                {filteredDeals.map(deal => (
                                    <tr key={deal.id} className="hover:bg-gray-50">
                                        <td className="px-4 py-3">
                                            <div className="flex items-center gap-3">
                                                {deal.image ? (
                                                    <img
                                                        src={deal.image}
                                                        alt={deal.name}
                                                        className="w-12 h-12 rounded-lg object-cover"
                                                    />
                                                ) : (
                                                    <div className="w-12 h-12 bg-gray-100 rounded-lg flex items-center justify-center">
                                                        <Flame className="w-6 h-6 text-gray-400" />
                                                    </div>
                                                )}
                                                <p className="font-medium text-gray-900">{deal.name}</p>
                                            </div>
                                        </td>
                                        <td className="px-4 py-3">
                                            <div>
                                                <p className="font-bold text-[#EF4444]">{deal.price} جنيه</p>
                                                <p className="text-sm text-gray-400 line-through">{deal.old_price} جنيه</p>
                                            </div>
                                        </td>
                                        <td className="px-4 py-3">
                                            <span className="px-2 py-1 bg-red-100 text-red-600 rounded-full text-sm font-medium">
                                                -{deal.discount_percentage}%
                                            </span>
                                        </td>
                                        <td className="px-4 py-3">
                                            <div className="w-24">
                                                <div className="flex justify-between text-xs mb-1">
                                                    <span>{deal.sold_quantity}</span>
                                                    <span>{deal.total_quantity}</span>
                                                </div>
                                                <div className="w-full bg-gray-200 rounded-full h-2">
                                                    <div
                                                        className={`h-2 rounded-full ${
                                                            deal.sold_percentage > 80 ? 'bg-red-500' : 'bg-orange-500'
                                                        }`}
                                                        style={{ width: `${deal.sold_percentage}%` }}
                                                    />
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-4 py-3">
                                            <div className="flex items-center gap-1 text-gray-600">
                                                <Clock className="w-4 h-4" />
                                                <span>{getTimeRemaining(deal.end_time)}</span>
                                            </div>
                                        </td>
                                        <td className="px-4 py-3">
                                            {deal.is_flash_deal ? (
                                                <span className="flex items-center gap-1 px-2 py-1 bg-yellow-100 text-yellow-700 rounded-full text-sm">
                                                    <Flame className="w-3 h-3" />
                                                    فلاش
                                                </span>
                                            ) : (
                                                <span className="px-2 py-1 bg-gray-100 text-gray-600 rounded-full text-sm">
                                                    عادي
                                                </span>
                                            )}
                                        </td>
                                        <td className="px-4 py-3">
                                            <div className="flex items-center gap-2">
                                                <button
                                                    onClick={() => handleEdit(deal)}
                                                    className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                                                >
                                                    <Edit2 className="w-4 h-4" />
                                                </button>
                                                <button
                                                    onClick={() => handleDelete(deal.id)}
                                                    className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                                                >
                                                    <Trash2 className="w-4 h-4" />
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>

            {/* Modal */}
            {showModal && (
                <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
                    <div className="bg-white rounded-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
                        <div className="p-6 border-b border-gray-100">
                            <h2 className="text-xl font-bold text-gray-900">
                                {editingDeal ? 'تعديل العرض' : 'إضافة عرض ساخن'}
                            </h2>
                        </div>

                        <form onSubmit={handleSubmit} className="p-6 space-y-4">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">
                                        اسم المنتج (عربي) *
                                    </label>
                                    <input
                                        type="text"
                                        required
                                        value={formData.name}
                                        onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                        className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#EF4444]/20"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">
                                        اسم المنتج (إنجليزي)
                                    </label>
                                    <input
                                        type="text"
                                        value={formData.name_en}
                                        onChange={(e) => setFormData({ ...formData, name_en: e.target.value })}
                                        className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#EF4444]/20"
                                    />
                                </div>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">
                                        السعر الحالي *
                                    </label>
                                    <input
                                        type="number"
                                        step="0.01"
                                        required
                                        value={formData.price}
                                        onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                                        className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#EF4444]/20"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">
                                        السعر القديم *
                                    </label>
                                    <input
                                        type="number"
                                        step="0.01"
                                        required
                                        value={formData.old_price}
                                        onChange={(e) => setFormData({ ...formData, old_price: e.target.value })}
                                        className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#EF4444]/20"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">
                                        نسبة الخصم % *
                                    </label>
                                    <input
                                        type="number"
                                        required
                                        value={formData.discount_percentage}
                                        onChange={(e) => setFormData({ ...formData, discount_percentage: e.target.value })}
                                        className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#EF4444]/20"
                                    />
                                </div>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">
                                        الكمية الإجمالية
                                    </label>
                                    <input
                                        type="number"
                                        value={formData.total_quantity}
                                        onChange={(e) => setFormData({ ...formData, total_quantity: e.target.value })}
                                        className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#EF4444]/20"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">
                                        وقت الانتهاء *
                                    </label>
                                    <input
                                        type="datetime-local"
                                        required
                                        value={formData.end_time}
                                        onChange={(e) => setFormData({ ...formData, end_time: e.target.value })}
                                        className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#EF4444]/20"
                                    />
                                </div>
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    رابط الصورة
                                </label>
                                <input
                                    type="url"
                                    value={formData.image}
                                    onChange={(e) => setFormData({ ...formData, image: e.target.value })}
                                    placeholder="https://..."
                                    className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#EF4444]/20"
                                />
                            </div>

                            <div className="flex items-center gap-6">
                                <div className="flex items-center gap-2">
                                    <input
                                        type="checkbox"
                                        id="is_flash_deal"
                                        checked={formData.is_flash_deal}
                                        onChange={(e) => setFormData({ ...formData, is_flash_deal: e.target.checked })}
                                        className="w-4 h-4 text-[#EF4444] rounded focus:ring-[#EF4444]"
                                    />
                                    <label htmlFor="is_flash_deal" className="text-sm text-gray-700 flex items-center gap-1">
                                        <Flame className="w-4 h-4 text-yellow-500" />
                                        عرض فلاش (رئيسي)
                                    </label>
                                </div>
                                <div className="flex items-center gap-2">
                                    <input
                                        type="checkbox"
                                        id="is_active"
                                        checked={formData.is_active}
                                        onChange={(e) => setFormData({ ...formData, is_active: e.target.checked })}
                                        className="w-4 h-4 text-[#EF4444] rounded focus:ring-[#EF4444]"
                                    />
                                    <label htmlFor="is_active" className="text-sm text-gray-700">
                                        العرض نشط
                                    </label>
                                </div>
                            </div>

                            <div className="flex items-center gap-2">
                                <input
                                    type="checkbox"
                                    id="send_push_deal"
                                    checked={sendPush}
                                    onChange={(e) => setSendPush(e.target.checked)}
                                    className="w-4 h-4 text-[#EF4444] rounded focus:ring-[#EF4444]"
                                />
                                <label htmlFor="send_push_deal" className="text-sm text-gray-700 flex items-center gap-1">
                                    <Bell className="w-4 h-4" />
                                    إرسال إشعار بالعروض الجديدة عند الحفظ
                                </label>
                            </div>

                            <div className="flex justify-end gap-3 pt-4 border-t border-gray-100">
                                <button
                                    type="button"
                                    onClick={() => { setShowModal(false); resetForm(); }}
                                    className="px-4 py-2 text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
                                >
                                    إلغاء
                                </button>
                                <button
                                    type="submit"
                                    disabled={saving}
                                    className="flex items-center gap-2 px-4 py-2 bg-[#EF4444] text-white rounded-lg hover:bg-[#dc2626] transition-colors disabled:opacity-50"
                                >
                                    {saving && <Loader className="w-4 h-4 animate-spin" />}
                                    {editingDeal ? 'حفظ التعديلات' : 'إضافة العرض'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};

export default HotDealsManager;
