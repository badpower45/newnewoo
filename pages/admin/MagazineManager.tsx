import React, { useState, useEffect } from 'react';
import { Plus, Edit2, Trash2, Loader, BookOpen, Search, Filter } from 'lucide-react';
import { api } from '../../services/api';
import { TableSkeleton } from '../../components/Skeleton';

interface MagazineOffer {
    id: number;
    name: string;
    name_en?: string;
    price: number;
    old_price?: number;
    unit: string;
    discount_percentage?: number;
    image?: string;
    category: string;
    bg_color?: string;
    is_active: boolean;
    start_date?: string;
    end_date?: string;
}

const MagazineManager = () => {
    const [offers, setOffers] = useState<MagazineOffer[]>([]);
    const [loading, setLoading] = useState(true);
    const [showModal, setShowModal] = useState(false);
    const [editingOffer, setEditingOffer] = useState<MagazineOffer | null>(null);
    const [searchTerm, setSearchTerm] = useState('');
    const [filterCategory, setFilterCategory] = useState('all');
    const [saving, setSaving] = useState(false);

    const categories = ['جميع العروض', 'طازج', 'لحوم', 'ألبان', 'مشروبات', 'معلبات', 'منظفات'];

    const [formData, setFormData] = useState({
        name: '',
        name_en: '',
        price: '',
        old_price: '',
        unit: 'كجم',
        discount_percentage: '',
        image: '',
        category: 'جميع العروض',
        bg_color: 'from-orange-500 to-orange-600',
        is_active: true,
        start_date: '',
        end_date: ''
    });

    useEffect(() => {
        loadOffers();
    }, []);

    const loadOffers = async () => {
        setLoading(true);
        try {
            const res = await api.magazine.getAll();
            setOffers(res.data || []);
        } catch (err) {
            console.error('Failed to load magazine offers:', err);
        } finally {
            setLoading(false);
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setSaving(true);

        try {
            const data = {
                ...formData,
                price: parseFloat(formData.price),
                old_price: formData.old_price ? parseFloat(formData.old_price) : null,
                discount_percentage: formData.discount_percentage ? parseInt(formData.discount_percentage) : null
            };

            if (editingOffer) {
                await api.magazine.update(editingOffer.id, data);
            } else {
                await api.magazine.create(data);
            }

            setShowModal(false);
            resetForm();
            loadOffers();
        } catch (err) {
            console.error('Failed to save offer:', err);
            alert('فشل حفظ العرض');
        } finally {
            setSaving(false);
        }
    };

    const handleEdit = (offer: MagazineOffer) => {
        setEditingOffer(offer);
        setFormData({
            name: offer.name,
            name_en: offer.name_en || '',
            price: String(offer.price),
            old_price: offer.old_price ? String(offer.old_price) : '',
            unit: offer.unit || 'كجم',
            discount_percentage: offer.discount_percentage ? String(offer.discount_percentage) : '',
            image: offer.image || '',
            category: offer.category || 'جميع العروض',
            bg_color: offer.bg_color || 'from-orange-500 to-orange-600',
            is_active: offer.is_active,
            start_date: offer.start_date ? offer.start_date.split('T')[0] : '',
            end_date: offer.end_date ? offer.end_date.split('T')[0] : ''
        });
        setShowModal(true);
    };

    const handleDelete = async (id: number) => {
        if (!confirm('هل أنت متأكد من حذف هذا العرض؟')) return;

        try {
            await api.magazine.delete(id);
            loadOffers();
        } catch (err) {
            console.error('Failed to delete offer:', err);
            alert('فشل حذف العرض');
        }
    };

    const resetForm = () => {
        setEditingOffer(null);
        setFormData({
            name: '',
            name_en: '',
            price: '',
            old_price: '',
            unit: 'كجم',
            discount_percentage: '',
            image: '',
            category: 'جميع العروض',
            bg_color: 'from-orange-500 to-orange-600',
            is_active: true,
            start_date: '',
            end_date: ''
        });
    };

    const filteredOffers = offers.filter(offer => {
        const matchesSearch = offer.name.toLowerCase().includes(searchTerm.toLowerCase());
        const matchesCategory = filterCategory === 'all' || offer.category === filterCategory;
        return matchesSearch && matchesCategory;
    });

    const bgColorOptions = [
        { value: 'from-orange-500 to-orange-600', label: 'برتقالي', color: '#F97316' },
        { value: 'from-red-500 to-red-600', label: 'أحمر', color: '#EF4444' },
        { value: 'from-green-500 to-green-600', label: 'أخضر', color: '#22C55E' },
        { value: 'from-blue-500 to-blue-600', label: 'أزرق', color: '#3B82F6' },
        { value: 'from-pink-500 to-pink-600', label: 'وردي', color: '#EC4899' },
        { value: 'from-yellow-500 to-yellow-600', label: 'أصفر', color: '#EAB308' },
    ];

    return (
        <div className="p-6">
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
                <div className="flex items-center gap-3">
                    <div className="w-12 h-12 bg-gradient-to-br from-[#F97316] to-[#ea580c] rounded-xl flex items-center justify-center">
                        <BookOpen className="w-6 h-6 text-white" />
                    </div>
                    <div>
                        <h1 className="text-2xl font-bold text-gray-900">إدارة مجلة العروض</h1>
                        <p className="text-gray-500 text-sm">إضافة وتعديل عروض المجلة الأسبوعية</p>
                    </div>
                </div>
                <button
                    onClick={() => { resetForm(); setShowModal(true); }}
                    className="flex items-center gap-2 bg-[#F97316] text-white px-4 py-2 rounded-xl hover:bg-[#ea580c] transition-colors"
                >
                    <Plus className="w-5 h-5" />
                    <span>إضافة عرض</span>
                </button>
            </div>

            {/* Filters */}
            <div className="bg-white rounded-xl shadow-sm p-4 mb-6">
                <div className="flex flex-col md:flex-row gap-4">
                    <div className="flex-1 relative">
                        <Search className="absolute right-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                        <input
                            type="text"
                            placeholder="بحث عن عرض..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="w-full pr-10 pl-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#F97316]/20"
                        />
                    </div>
                    <div className="flex items-center gap-2">
                        <Filter className="w-5 h-5 text-gray-400" />
                        <select
                            value={filterCategory}
                            onChange={(e) => setFilterCategory(e.target.value)}
                            className="px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#F97316]/20"
                        >
                            <option value="all">جميع الفئات</option>
                            {categories.map(cat => (
                                <option key={cat} value={cat}>{cat}</option>
                            ))}
                        </select>
                    </div>
                </div>
            </div>

            {/* Table */}
            <div className="bg-white rounded-xl shadow-sm overflow-hidden">
                {loading ? (
                    <div className="p-4">
                        <TableSkeleton rows={5} columns={6} />
                    </div>
                ) : filteredOffers.length === 0 ? (
                    <div className="text-center py-12">
                        <BookOpen className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                        <p className="text-gray-500">لا توجد عروض</p>
                    </div>
                ) : (
                    <div className="overflow-x-auto">
                        <table className="w-full">
                            <thead className="bg-gray-50">
                                <tr>
                                    <th className="px-4 py-3 text-right text-sm font-medium text-gray-600">المنتج</th>
                                    <th className="px-4 py-3 text-right text-sm font-medium text-gray-600">السعر</th>
                                    <th className="px-4 py-3 text-right text-sm font-medium text-gray-600">الخصم</th>
                                    <th className="px-4 py-3 text-right text-sm font-medium text-gray-600">الفئة</th>
                                    <th className="px-4 py-3 text-right text-sm font-medium text-gray-600">الحالة</th>
                                    <th className="px-4 py-3 text-right text-sm font-medium text-gray-600">إجراءات</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-100">
                                {filteredOffers.map(offer => (
                                    <tr key={offer.id} className="hover:bg-gray-50">
                                        <td className="px-4 py-3">
                                            <div className="flex items-center gap-3">
                                                {offer.image ? (
                                                    <img
                                                        src={offer.image}
                                                        alt={offer.name}
                                                        className="w-12 h-12 rounded-lg object-cover"
                                                    />
                                                ) : (
                                                    <div className="w-12 h-12 bg-gray-100 rounded-lg flex items-center justify-center">
                                                        <BookOpen className="w-6 h-6 text-gray-400" />
                                                    </div>
                                                )}
                                                <div>
                                                    <p className="font-medium text-gray-900">{offer.name}</p>
                                                    <p className="text-sm text-gray-500">{offer.unit}</p>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-4 py-3">
                                            <div>
                                                <p className="font-bold text-[#F97316]">{offer.price} جنيه</p>
                                                {offer.old_price && (
                                                    <p className="text-sm text-gray-400 line-through">{offer.old_price} جنيه</p>
                                                )}
                                            </div>
                                        </td>
                                        <td className="px-4 py-3">
                                            {offer.discount_percentage ? (
                                                <span className="px-2 py-1 bg-red-100 text-red-600 rounded-full text-sm font-medium">
                                                    -{offer.discount_percentage}%
                                                </span>
                                            ) : '-'}
                                        </td>
                                        <td className="px-4 py-3">
                                            <span className="text-gray-600">{offer.category}</span>
                                        </td>
                                        <td className="px-4 py-3">
                                            <span className={`px-2 py-1 rounded-full text-sm ${
                                                offer.is_active
                                                    ? 'bg-green-100 text-green-600'
                                                    : 'bg-gray-100 text-gray-600'
                                            }`}>
                                                {offer.is_active ? 'نشط' : 'غير نشط'}
                                            </span>
                                        </td>
                                        <td className="px-4 py-3">
                                            <div className="flex items-center gap-2">
                                                <button
                                                    onClick={() => handleEdit(offer)}
                                                    className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                                                >
                                                    <Edit2 className="w-4 h-4" />
                                                </button>
                                                <button
                                                    onClick={() => handleDelete(offer.id)}
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
                                {editingOffer ? 'تعديل العرض' : 'إضافة عرض جديد'}
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
                                        className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#F97316]/20"
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
                                        className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#F97316]/20"
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
                                        className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#F97316]/20"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">
                                        السعر القديم
                                    </label>
                                    <input
                                        type="number"
                                        step="0.01"
                                        value={formData.old_price}
                                        onChange={(e) => setFormData({ ...formData, old_price: e.target.value })}
                                        className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#F97316]/20"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">
                                        نسبة الخصم %
                                    </label>
                                    <input
                                        type="number"
                                        value={formData.discount_percentage}
                                        onChange={(e) => setFormData({ ...formData, discount_percentage: e.target.value })}
                                        className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#F97316]/20"
                                    />
                                </div>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">
                                        الوحدة
                                    </label>
                                    <select
                                        value={formData.unit}
                                        onChange={(e) => setFormData({ ...formData, unit: e.target.value })}
                                        className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#F97316]/20"
                                    >
                                        <option value="كجم">كجم</option>
                                        <option value="جرام">جرام</option>
                                        <option value="لتر">لتر</option>
                                        <option value="قطعة">قطعة</option>
                                        <option value="عبوة">عبوة</option>
                                    </select>
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">
                                        الفئة
                                    </label>
                                    <select
                                        value={formData.category}
                                        onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                                        className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#F97316]/20"
                                    >
                                        {categories.map(cat => (
                                            <option key={cat} value={cat}>{cat}</option>
                                        ))}
                                    </select>
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
                                    className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#F97316]/20"
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    لون الخلفية
                                </label>
                                <div className="flex flex-wrap gap-2">
                                    {bgColorOptions.map(opt => (
                                        <button
                                            key={opt.value}
                                            type="button"
                                            onClick={() => setFormData({ ...formData, bg_color: opt.value })}
                                            className={`w-10 h-10 rounded-lg transition-all ${
                                                formData.bg_color === opt.value ? 'ring-2 ring-offset-2 ring-gray-400' : ''
                                            }`}
                                            style={{ backgroundColor: opt.color }}
                                            title={opt.label}
                                        />
                                    ))}
                                </div>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">
                                        تاريخ البداية
                                    </label>
                                    <input
                                        type="date"
                                        value={formData.start_date}
                                        onChange={(e) => setFormData({ ...formData, start_date: e.target.value })}
                                        className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#F97316]/20"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">
                                        تاريخ النهاية
                                    </label>
                                    <input
                                        type="date"
                                        value={formData.end_date}
                                        onChange={(e) => setFormData({ ...formData, end_date: e.target.value })}
                                        className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#F97316]/20"
                                    />
                                </div>
                            </div>

                            <div className="flex items-center gap-2">
                                <input
                                    type="checkbox"
                                    id="is_active"
                                    checked={formData.is_active}
                                    onChange={(e) => setFormData({ ...formData, is_active: e.target.checked })}
                                    className="w-4 h-4 text-[#F97316] rounded focus:ring-[#F97316]"
                                />
                                <label htmlFor="is_active" className="text-sm text-gray-700">
                                    العرض نشط
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
                                    className="flex items-center gap-2 px-4 py-2 bg-[#F97316] text-white rounded-lg hover:bg-[#ea580c] transition-colors disabled:opacity-50"
                                >
                                    {saving && <Loader className="w-4 h-4 animate-spin" />}
                                    {editingOffer ? 'حفظ التعديلات' : 'إضافة العرض'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};

export default MagazineManager;
