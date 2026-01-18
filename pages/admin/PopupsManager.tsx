import React, { useState, useEffect } from 'react';
import { Megaphone, Plus, Edit, Trash2, Eye, EyeOff, Calendar, Link as LinkIcon, Save, X } from 'lucide-react';
import { api } from '../../services/api';

interface Popup {
    id: number;
    title: string;
    title_ar: string;
    description?: string;
    description_ar?: string;
    image_url: string;
    link_url?: string;
    button_text?: string;
    button_text_ar?: string;
    start_date?: string;
    end_date?: string;
    is_active: boolean;
    priority: number;
    show_on_homepage: boolean;
    show_on_products: boolean;
    created_at: string;
}

export default function PopupsManager() {
    const [popups, setPopups] = useState<Popup[]>([]);
    const [loading, setLoading] = useState(true);
    const [showForm, setShowForm] = useState(false);
    const [editingPopup, setEditingPopup] = useState<Popup | null>(null);
    const [formData, setFormData] = useState({
        title: '',
        title_ar: '',
        description: '',
        description_ar: '',
        image_url: '',
        link_url: '',
        button_text: '',
        button_text_ar: '',
        start_date: '',
        end_date: '',
        is_active: true,
        priority: 0,
        show_on_homepage: true,
        show_on_products: false
    });

    useEffect(() => {
        loadPopups();
    }, []);

    const loadPopups = async () => {
        try {
            setLoading(true);
            const res = await api.popups.getAll();
            setPopups(res.data || res || []);
        } catch (err) {
            console.error('Error loading popups:', err);
            setPopups([]);
        } finally {
            setLoading(false);
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            if (editingPopup) {
                await api.popups.update(editingPopup.id, formData);
            } else {
                await api.popups.create(formData);
            }
            await loadPopups();
            resetForm();
        } catch (err) {
            console.error('Error saving popup:', err);
        }
    };

    const handleDelete = async (id: number) => {
        if (!confirm('هل أنت متأكد من حذف هذا الـ Pop-up؟')) return;

        try {
            await api.popups.delete(id);
            await loadPopups();
        } catch (err) {
            console.error('Error deleting popup:', err);
        }
    };

    const handleEdit = (popup: Popup) => {
        setEditingPopup(popup);
        setFormData({
            title: popup.title || '',
            title_ar: popup.title_ar || '',
            description: popup.description || '',
            description_ar: popup.description_ar || '',
            image_url: popup.image_url || '',
            link_url: popup.link_url || '',
            button_text: popup.button_text || '',
            button_text_ar: popup.button_text_ar || '',
            start_date: popup.start_date ? popup.start_date.slice(0, 16) : '',
            end_date: popup.end_date ? popup.end_date.slice(0, 16) : '',
            is_active: popup.is_active,
            priority: popup.priority,
            show_on_homepage: popup.show_on_homepage,
            show_on_products: popup.show_on_products
        });
        setShowForm(true);
    };

    const resetForm = () => {
        setShowForm(false);
        setEditingPopup(null);
        setFormData({
            title: '',
            title_ar: '',
            description: '',
            description_ar: '',
            image_url: '',
            link_url: '',
            button_text: '',
            button_text_ar: '',
            start_date: '',
            end_date: '',
            is_active: true,
            priority: 0,
            show_on_homepage: true,
            show_on_products: false
        });
    };

    return (
        <div className="p-6">
            <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-3">
                    <Megaphone className="text-orange-600" size={32} />
                    <div>
                        <h1 className="text-2xl font-bold text-gray-800">إدارة الإعلانات المنبثقة</h1>
                        <p className="text-gray-600">Popups Manager</p>
                    </div>
                </div>
                <button
                    onClick={() => setShowForm(!showForm)}
                    className="flex items-center gap-2 bg-orange-600 text-white px-4 py-2 rounded-lg hover:bg-orange-700"
                >
                    {showForm ? <X size={20} /> : <Plus size={20} />}
                    {showForm ? 'إلغاء' : 'إضافة إعلان جديد'}
                </button>
            </div>

            {/* Form */}
            {showForm && (
                <div className="bg-white rounded-lg shadow-md p-6 mb-6">
                    <h2 className="text-xl font-bold mb-4">
                        {editingPopup ? 'تعديل الإعلان' : 'إعلان جديد'}
                    </h2>
                    <form onSubmit={handleSubmit} className="space-y-4">
                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <label className="block text-sm font-medium mb-1">العنوان (English)</label>
                                <input
                                    type="text"
                                    value={formData.title}
                                    onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                                    className="w-full border rounded px-3 py-2"
                                    required
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium mb-1">العنوان (عربي)</label>
                                <input
                                    type="text"
                                    value={formData.title_ar}
                                    onChange={(e) => setFormData({ ...formData, title_ar: e.target.value })}
                                    className="w-full border rounded px-3 py-2"
                                />
                            </div>
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <label className="block text-sm font-medium mb-1">الوصف (English)</label>
                                <textarea
                                    value={formData.description}
                                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                                    className="w-full border rounded px-3 py-2"
                                    rows={3}
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium mb-1">الوصف (عربي)</label>
                                <textarea
                                    value={formData.description_ar}
                                    onChange={(e) => setFormData({ ...formData, description_ar: e.target.value })}
                                    className="w-full border rounded px-3 py-2"
                                    rows={3}
                                />
                            </div>
                        </div>

                        <div>
                            <label className="block text-sm font-medium mb-1">رابط الصورة</label>
                            <input
                                type="url"
                                value={formData.image_url}
                                onChange={(e) => setFormData({ ...formData, image_url: e.target.value })}
                                className="w-full border rounded px-3 py-2"
                                required
                            />
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <label className="block text-sm font-medium mb-1">رابط الانتقال (اختياري)</label>
                                <input
                                    type="url"
                                    value={formData.link_url}
                                    onChange={(e) => setFormData({ ...formData, link_url: e.target.value })}
                                    className="w-full border rounded px-3 py-2"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium mb-1">الأولوية</label>
                                <input
                                    type="number"
                                    value={formData.priority}
                                    onChange={(e) => setFormData({ ...formData, priority: parseInt(e.target.value) })}
                                    className="w-full border rounded px-3 py-2"
                                />
                            </div>
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <label className="block text-sm font-medium mb-1">نص الزر (English)</label>
                                <input
                                    type="text"
                                    value={formData.button_text}
                                    onChange={(e) => setFormData({ ...formData, button_text: e.target.value })}
                                    className="w-full border rounded px-3 py-2"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium mb-1">نص الزر (عربي)</label>
                                <input
                                    type="text"
                                    value={formData.button_text_ar}
                                    onChange={(e) => setFormData({ ...formData, button_text_ar: e.target.value })}
                                    className="w-full border rounded px-3 py-2"
                                />
                            </div>
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <label className="block text-sm font-medium mb-1">تاريخ البداية</label>
                                <input
                                    type="datetime-local"
                                    value={formData.start_date}
                                    onChange={(e) => setFormData({ ...formData, start_date: e.target.value })}
                                    className="w-full border rounded px-3 py-2"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium mb-1">تاريخ النهاية</label>
                                <input
                                    type="datetime-local"
                                    value={formData.end_date}
                                    onChange={(e) => setFormData({ ...formData, end_date: e.target.value })}
                                    className="w-full border rounded px-3 py-2"
                                />
                            </div>
                        </div>

                        <div className="flex gap-4">
                            <label className="flex items-center gap-2">
                                <input
                                    type="checkbox"
                                    checked={formData.is_active}
                                    onChange={(e) => setFormData({ ...formData, is_active: e.target.checked })}
                                />
                                نشط
                            </label>
                            <label className="flex items-center gap-2">
                                <input
                                    type="checkbox"
                                    checked={formData.show_on_homepage}
                                    onChange={(e) => setFormData({ ...formData, show_on_homepage: e.target.checked })}
                                />
                                يظهر في الصفحة الرئيسية
                            </label>
                            <label className="flex items-center gap-2">
                                <input
                                    type="checkbox"
                                    checked={formData.show_on_products}
                                    onChange={(e) => setFormData({ ...formData, show_on_products: e.target.checked })}
                                />
                                يظهر في صفحة المنتجات
                            </label>
                        </div>

                        <div className="flex gap-2 justify-end">
                            <button
                                type="button"
                                onClick={resetForm}
                                className="px-4 py-2 border rounded-lg hover:bg-gray-50"
                            >
                                إلغاء
                            </button>
                            <button
                                type="submit"
                                className="flex items-center gap-2 bg-orange-600 text-white px-4 py-2 rounded-lg hover:bg-orange-700"
                            >
                                <Save size={20} />
                                حفظ
                            </button>
                        </div>
                    </form>
                </div>
            )}

            {/* List */}
            {loading ? (
                <div className="text-center py-8">جاري التحميل...</div>
            ) : (
                <div className="grid gap-4">
                    {popups.map((popup) => (
                        <div key={popup.id} className="bg-white rounded-lg shadow-md p-4 flex gap-4">
                            <img
                                src={popup.image_url}
                                alt={popup.title_ar || popup.title}
                                className="w-32 h-32 object-cover rounded-lg"
                            />
                            <div className="flex-1">
                                <div className="flex items-start justify-between mb-2">
                                    <div>
                                        <h3 className="font-bold text-lg">{popup.title_ar || popup.title}</h3>
                                        {popup.description_ar && (
                                            <p className="text-gray-600 text-sm">{popup.description_ar}</p>
                                        )}
                                    </div>
                                    <div className="flex gap-2">
                                        {popup.is_active ? (
                                            <span className="text-green-600 flex items-center gap-1">
                                                <Eye size={16} /> نشط
                                            </span>
                                        ) : (
                                            <span className="text-gray-400 flex items-center gap-1">
                                                <EyeOff size={16} /> غير نشط
                                            </span>
                                        )}
                                    </div>
                                </div>
                                <div className="flex gap-4 text-sm text-gray-600 mb-2">
                                    <span>الأولوية: {popup.priority}</span>
                                    {popup.show_on_homepage && <span>🏠 الرئيسية</span>}
                                    {popup.show_on_products && <span>📦 المنتجات</span>}
                                    {popup.link_url && (
                                        <span className="flex items-center gap-1">
                                            <LinkIcon size={14} /> رابط
                                        </span>
                                    )}
                                </div>
                                {(popup.start_date || popup.end_date) && (
                                    <div className="flex gap-4 text-sm text-gray-600">
                                        {popup.start_date && (
                                            <span>من: {new Date(popup.start_date).toLocaleDateString('ar-EG')}</span>
                                        )}
                                        {popup.end_date && (
                                            <span>إلى: {new Date(popup.end_date).toLocaleDateString('ar-EG')}</span>
                                        )}
                                    </div>
                                )}
                            </div>
                            <div className="flex flex-col gap-2">
                                <button
                                    onClick={() => handleEdit(popup)}
                                    className="p-2 text-blue-600 hover:bg-blue-50 rounded"
                                >
                                    <Edit size={20} />
                                </button>
                                <button
                                    onClick={() => handleDelete(popup.id)}
                                    className="p-2 text-red-600 hover:bg-red-50 rounded"
                                >
                                    <Trash2 size={20} />
                                </button>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}
