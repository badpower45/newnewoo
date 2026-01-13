import React, { useState, useEffect } from 'react';
import { Plus, Edit2, Trash2, GripVertical, Image, Save, X, Eye, EyeOff, FolderTree, Search, Upload, Loader } from 'lucide-react';
import { api } from '../../services/api';
import { API_URL } from '../../src/config';

interface Category {
    id: number;
    name: string;
    name_ar: string;
    image: string | null;
    icon: string | null;
    bg_color: string;
    description: string | null;
    parent_id: number | null;
    display_order: number;
    is_active: boolean;
    products_count?: number;
    created_at: string;
}

const normalizeCategoryKey = (cat: Category) => {
    const label = (cat.name_ar || cat.name || '').trim().toLowerCase();
    const parentKey = cat.parent_id ?? 0;
    return `${parentKey}:${label}`;
};

const scoreCategory = (cat: Category) => {
    let score = 0;
    if (cat.image) score += 4;
    if (cat.icon) score += 2;
    if (cat.description) score += 1;
    if (cat.is_active) score += 1;
    return score;
};

const mergeDuplicateCategories = (items: Category[]) => {
    const map = new Map<string, Category>();
    items.forEach(cat => {
        const key = normalizeCategoryKey(cat);
        const normalizedCount = Number(cat.products_count || 0);
        const existing = map.get(key);
        if (!existing) {
            map.set(key, { ...cat, products_count: normalizedCount });
            return;
        }

        const preferred = scoreCategory(cat) > scoreCategory(existing) ? cat : existing;
        map.set(key, {
            ...preferred,
            products_count: Math.max(Number(existing.products_count || 0), normalizedCount),
            display_order: Math.min(existing.display_order ?? 0, cat.display_order ?? 0),
            is_active: existing.is_active || cat.is_active
        });
    });
    return Array.from(map.values());
};

const emptyCategory = {
    name: '',
    name_ar: '',
    image: '',
    icon: '',
    bg_color: 'bg-orange-50',
    description: '',
    parent_id: null as number | null, // تلقائيًا = تصنيف أب
    display_order: 0,
    is_active: true
};

const bgColorOptions = [
    { value: 'bg-orange-50', label: 'برتقالي فاتح', preview: 'bg-orange-100' },
    { value: 'bg-blue-50', label: 'أزرق فاتح', preview: 'bg-blue-100' },
    { value: 'bg-green-50', label: 'أخضر فاتح', preview: 'bg-green-100' },
    { value: 'bg-red-50', label: 'أحمر فاتح', preview: 'bg-red-100' },
    { value: 'bg-purple-50', label: 'بنفسجي فاتح', preview: 'bg-purple-100' },
    { value: 'bg-yellow-50', label: 'أصفر فاتح', preview: 'bg-yellow-100' },
    { value: 'bg-pink-50', label: 'وردي فاتح', preview: 'bg-pink-100' },
    { value: 'bg-indigo-50', label: 'نيلي فاتح', preview: 'bg-indigo-100' },
    { value: 'bg-teal-50', label: 'تركوازي فاتح', preview: 'bg-teal-100' },
    { value: 'bg-gray-50', label: 'رمادي فاتح', preview: 'bg-gray-100' },
];

const CategoriesManager: React.FC = () => {
    const [categories, setCategories] = useState<Category[]>([]);
    const [loading, setLoading] = useState(true);
    const [showModal, setShowModal] = useState(false);
    const [editing, setEditing] = useState<Category | null>(null);
    const [form, setForm] = useState(emptyCategory);
    const [saving, setSaving] = useState(false);
    const [searchTerm, setSearchTerm] = useState('');
    const [uploadingImage, setUploadingImage] = useState(false);

    useEffect(() => {
        loadCategories();
    }, []);

    const loadCategories = async () => {
        setLoading(true);
        try {
            const res = await api.categories.getAllAdmin({ includeOfferOnly: true });
            if (res.success && res.data) {
                setCategories(mergeDuplicateCategories(res.data));
            }
        } catch (err) {
            console.error('Failed to load categories:', err);
        } finally {
            setLoading(false);
        }
    };

    const openCreate = () => {
        setEditing(null);
        // تصنيف جديد = تصنيف أب تلقائيًا (parent_id = null)
        setForm({ ...emptyCategory, parent_id: null });
        setShowModal(true);
    };

    const openEdit = (cat: Category) => {
        setEditing(cat);
        setForm({
            name: cat.name,
            name_ar: cat.name_ar || cat.name,
            image: cat.image || '',
            icon: cat.icon || '',
            bg_color: cat.bg_color || 'bg-orange-50',
            description: cat.description || '',
            parent_id: cat.parent_id,
            display_order: cat.display_order,
            is_active: cat.is_active
        });
        setShowModal(true);
    };

    const handleSave = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!form.name.trim()) return;

        setSaving(true);
        try {
            if (editing) {
                await api.categories.update(editing.id, form);
            } else {
                await api.categories.create(form);
            }
            setShowModal(false);
            loadCategories();
        } catch (err) {
            console.error('Failed to save category:', err);
            alert('فشل حفظ التصنيف');
        } finally {
            setSaving(false);
        }
    };

    const handleDelete = async (id: number) => {
        if (!window.confirm('هل أنت متأكد من حذف هذا التصنيف؟')) return;

        try {
            const res = await api.categories.delete(id);
            if (res.success) {
                loadCategories();
            } else {
                alert(res.error || 'فشل حذف التصنيف');
            }
        } catch (err) {
            console.error('Failed to delete category:', err);
            alert('فشل حذف التصنيف');
        }
    };

    const toggleActive = async (cat: Category) => {
        try {
            await api.categories.update(cat.id, { is_active: !cat.is_active });
            loadCategories();
        } catch (err) {
            console.error('Failed to toggle category:', err);
        }
    };

    const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        // Validate file
        if (file.size > 5 * 1024 * 1024) {
            alert('حجم الصورة كبير جداً. الحد الأقصى 5 ميجابايت');
            return;
        }

        if (!file.type.startsWith('image/')) {
            alert('الرجاء اختيار صورة');
            return;
        }

        setUploadingImage(true);
        const originalImage = form.image;

        try {
            const formData = new FormData();
            formData.append('image', file);
            formData.append('productId', `category_${editing?.id || Date.now()}`);

            const response = await fetch(`${API_URL}/upload/image`, {
                method: 'POST',
                body: formData
            });

            const result = await response.json();

            if (result.success && result.data?.url) {
                setForm({ ...form, image: result.data.url });
                alert('✅ تم رفع الصورة بنجاح!');
            } else {
                throw new Error(result.error || 'فشل رفع الصورة');
            }
        } catch (error: any) {
            console.error('Upload error:', error);
            alert('❌ فشل رفع الصورة: ' + error.message);
            setForm({ ...form, image: originalImage });
        } finally {
            setUploadingImage(false);
        }
    };

    const filteredCategories = categories.filter(cat =>
        cat.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        cat.name_ar?.toLowerCase().includes(searchTerm.toLowerCase())
    );

    const parentCategories = categories.filter(c => !c.parent_id);

    return (
        <div>
            <div className="flex items-center justify-between mb-6">
                <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
                    <FolderTree size={24} />
                    إدارة التصنيفات
                </h1>
                <button
                    onClick={openCreate}
                    className="flex items-center gap-2 px-4 py-2 bg-brand-orange text-white rounded-xl font-bold hover:bg-orange-700 transition-colors"
                >
                    <Plus size={20} />
                    إضافة تصنيف
                </button>
            </div>

            {/* Search */}
            <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-100 mb-6">
                <div className="relative">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
                    <input
                        type="text"
                        placeholder="بحث في التصنيفات..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-orange/20"
                    />
                </div>
            </div>

            {/* Categories Grid */}
            {loading ? (
                <div className="text-center py-12 text-gray-500">جاري التحميل...</div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {filteredCategories.map((cat) => (
                        <div
                            key={cat.id}
                            className={`bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden ${!cat.is_active ? 'opacity-60' : ''}`}
                        >
                            <div className={`h-24 ${cat.bg_color} flex items-center justify-center relative`}>
                                {cat.image ? (
                                    <img src={cat.image} alt={cat.name} className="w-16 h-16 object-contain" />
                                ) : cat.icon ? (
                                    <span className="text-4xl">{cat.icon}</span>
                                ) : (
                                    <div className="w-16 h-16 bg-white/50 rounded-full flex items-center justify-center text-2xl font-bold text-gray-600">
                                        {cat.name.charAt(0)}
                                    </div>
                                )}
                                {!cat.is_active && (
                                    <span className="absolute top-2 right-2 px-2 py-0.5 bg-gray-800 text-white text-xs rounded-full">
                                        غير نشط
                                    </span>
                                )}
                            </div>
                            <div className="p-4">
                                <div className="flex items-start justify-between mb-2">
                                    <div>
                                        <h3 className="font-bold text-gray-900">{cat.name_ar || cat.name}</h3>
                                        {cat.name_ar && cat.name !== cat.name_ar && (
                                            <p className="text-xs text-gray-500">{cat.name}</p>
                                        )}
                                    </div>
                                    <span className="text-xs bg-gray-100 text-gray-600 px-2 py-1 rounded-full">
                                        {cat.products_count || 0} منتج
                                    </span>
                                </div>
                                {cat.description && (
                                    <p className="text-sm text-gray-500 mb-3 line-clamp-2">{cat.description}</p>
                                )}
                                <div className="flex items-center gap-2">
                                    <button
                                        onClick={() => openEdit(cat)}
                                        className="flex-1 flex items-center justify-center gap-1 px-3 py-2 bg-blue-50 text-blue-600 rounded-lg hover:bg-blue-100 transition-colors text-sm font-medium"
                                    >
                                        <Edit2 size={14} />
                                        تعديل
                                    </button>
                                    <button
                                        onClick={() => toggleActive(cat)}
                                        className={`p-2 rounded-lg transition-colors ${cat.is_active ? 'bg-green-50 text-green-600 hover:bg-green-100' : 'bg-gray-50 text-gray-600 hover:bg-gray-100'}`}
                                        title={cat.is_active ? 'إخفاء' : 'إظهار'}
                                    >
                                        {cat.is_active ? <Eye size={16} /> : <EyeOff size={16} />}
                                    </button>
                                    <button
                                        onClick={() => handleDelete(cat.id)}
                                        className="p-2 bg-red-50 text-red-600 rounded-lg hover:bg-red-100 transition-colors"
                                        title="حذف"
                                    >
                                        <Trash2 size={16} />
                                    </button>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            )}

            {/* Modal */}
            {showModal && (
                <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
                    <div className="bg-white rounded-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto">
                        <div className="p-6 border-b sticky top-0 bg-white z-10">
                            <div className="flex items-center justify-between">
                                <h2 className="text-xl font-bold">
                                    {editing ? 'تعديل التصنيف' : 'إضافة تصنيف جديد'}
                                </h2>
                                <button onClick={() => setShowModal(false)} className="p-2 hover:bg-gray-100 rounded-lg">
                                    <X size={20} />
                                </button>
                            </div>
                        </div>

                        <form onSubmit={handleSave} className="p-6 space-y-4">
                            {/* Preview */}
                            <div className={`h-32 ${form.bg_color} rounded-xl flex items-center justify-center`}>
                                {form.image ? (
                                    <img src={form.image} alt="Preview" className="w-20 h-20 object-contain" />
                                ) : form.icon ? (
                                    <span className="text-5xl">{form.icon}</span>
                                ) : (
                                    <div className="w-20 h-20 bg-white/50 rounded-full flex items-center justify-center text-3xl font-bold text-gray-600">
                                        {form.name.charAt(0) || '?'}
                                    </div>
                                )}
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">
                                        اسم التصنيف (إنجليزي) *
                                    </label>
                                    <input
                                        type="text"
                                        value={form.name}
                                        onChange={(e) => setForm({ ...form, name: e.target.value })}
                                        className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-orange/20"
                                        required
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">
                                        اسم التصنيف (عربي)
                                    </label>
                                    <input
                                        type="text"
                                        value={form.name_ar}
                                        onChange={(e) => setForm({ ...form, name_ar: e.target.value })}
                                        className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-orange/20"
                                        dir="rtl"
                                    />
                                </div>
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    رابط الصورة
                                </label>
                                <div className="space-y-2">
                                    <input
                                        type="url"
                                        value={form.image}
                                        onChange={(e) => setForm({ ...form, image: e.target.value })}
                                        placeholder="https://example.com/image.png"
                                        className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-orange/20"
                                    />
                                    <div className="flex items-center gap-2">
                                        <label className="flex-1 cursor-pointer">
                                            <div className={`flex items-center justify-center gap-2 px-4 py-2 rounded-lg border-2 border-dashed transition-colors ${
                                                uploadingImage 
                                                    ? 'border-gray-300 bg-gray-50' 
                                                    : 'border-brand-orange hover:border-brand-orange-dark hover:bg-orange-50'
                                            }`}>
                                                {uploadingImage ? (
                                                    <>
                                                        <Loader className="w-4 h-4 animate-spin" />
                                                        <span className="text-sm">جاري الرفع...</span>
                                                    </>
                                                ) : (
                                                    <>
                                                        <Upload className="w-4 h-4" />
                                                        <span className="text-sm font-medium">رفع صورة</span>
                                                    </>
                                                )}
                                            </div>
                                            <input
                                                type="file"
                                                accept="image/*"
                                                onChange={handleImageUpload}
                                                disabled={uploadingImage}
                                                className="hidden"
                                            />
                                        </label>
                                    </div>
                                </div>
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">
                                        أيقونة (Emoji)
                                    </label>
                                    <input
                                        type="text"
                                        value={form.icon}
                                        onChange={(e) => setForm({ ...form, icon: e.target.value })}
                                        placeholder="🛒"
                                        className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-orange/20 text-2xl text-center"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">
                                        لون الخلفية
                                    </label>
                                    <select
                                        value={form.bg_color}
                                        onChange={(e) => setForm({ ...form, bg_color: e.target.value })}
                                        className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-orange/20"
                                    >
                                        {bgColorOptions.map(opt => (
                                            <option key={opt.value} value={opt.value}>{opt.label}</option>
                                        ))}
                                    </select>
                                </div>
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    التصنيف الأب (اختياري)
                                </label>
                                <select
                                    value={form.parent_id || ''}
                                    onChange={(e) => setForm({ ...form, parent_id: e.target.value ? parseInt(e.target.value) : null })}
                                    className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-orange/20"
                                >
                                    <option value="">بدون (تصنيف رئيسي) ⭐</option>
                                    {parentCategories.filter(c => c.id !== editing?.id).map(cat => (
                                        <option key={cat.id} value={cat.id}>{cat.name_ar || cat.name}</option>
                                    ))}
                                </select>
                                {!editing && (
                                    <p className="text-xs text-green-600 mt-1">
                                        💡 التصنيف الجديد سيكون تصنيفًا رئيسيًا تلقائيًا (Parent Category)
                                    </p>
                                )}
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    الوصف
                                </label>
                                <textarea
                                    value={form.description}
                                    onChange={(e) => setForm({ ...form, description: e.target.value })}
                                    rows={2}
                                    className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-orange/20"
                                    dir="rtl"
                                />
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">
                                        ترتيب العرض
                                    </label>
                                    <input
                                        type="number"
                                        value={form.display_order}
                                        onChange={(e) => setForm({ ...form, display_order: parseInt(e.target.value) || 0 })}
                                        className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-orange/20"
                                    />
                                </div>
                                <div className="flex items-center">
                                    <label className="flex items-center gap-2 cursor-pointer">
                                        <input
                                            type="checkbox"
                                            checked={form.is_active}
                                            onChange={(e) => setForm({ ...form, is_active: e.target.checked })}
                                            className="w-5 h-5 rounded text-brand-orange focus:ring-brand-orange"
                                        />
                                        <span className="text-sm font-medium text-gray-700">نشط</span>
                                    </label>
                                </div>
                            </div>

                            <div className="flex gap-3 pt-4">
                                <button
                                    type="button"
                                    onClick={() => setShowModal(false)}
                                    className="flex-1 px-4 py-3 border border-gray-200 rounded-xl font-medium hover:bg-gray-50"
                                >
                                    إلغاء
                                </button>
                                <button
                                    type="submit"
                                    disabled={saving || !form.name.trim()}
                                    className="flex-1 flex items-center justify-center gap-2 px-4 py-3 bg-brand-orange text-white rounded-xl font-bold hover:bg-orange-700 disabled:opacity-50"
                                >
                                    {saving ? (
                                        <>جاري الحفظ...</>
                                    ) : (
                                        <>
                                            <Save size={18} />
                                            حفظ
                                        </>
                                    )}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};

export default CategoriesManager;
