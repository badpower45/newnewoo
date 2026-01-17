import React, { useState, useEffect } from 'react';
import { Plus, Edit2, Trash2, Eye, EyeOff, Calendar, Link as LinkIcon } from 'lucide-react';
import api from '../services/api';

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
}

const AdminPopupsPage: React.FC = () => {
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
        fetchPopups();
    }, []);

    const fetchPopups = async () => {
        try {
            setLoading(true);
            const response = await api.get('/popups');
            setPopups(response.data.data || []);
        } catch (error) {
            console.error('Error fetching popups:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            if (editingPopup) {
                await api.put(`/popups/${editingPopup.id}`, formData);
                alert('تم تحديث الإعلان بنجاح!');
            } else {
                await api.post('/popups', formData);
                alert('تم إضافة الإعلان بنجاح!');
            }
            resetForm();
            fetchPopups();
        } catch (error) {
            console.error('Error saving popup:', error);
            alert('حدث خطأ أثناء الحفظ');
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
            start_date: popup.start_date ? popup.start_date.split('T')[0] : '',
            end_date: popup.end_date ? popup.end_date.split('T')[0] : '',
            is_active: popup.is_active,
            priority: popup.priority,
            show_on_homepage: popup.show_on_homepage,
            show_on_products: popup.show_on_products
        });
        setShowForm(true);
    };

    const handleDelete = async (id: number) => {
        if (!confirm('هل أنت متأكد من حذف هذا الإعلان؟')) return;
        
        try {
            await api.delete(`/popups/${id}`);
            alert('تم الحذف بنجاح!');
            fetchPopups();
        } catch (error) {
            console.error('Error deleting popup:', error);
            alert('حدث خطأ أثناء الحذف');
        }
    };

    const resetForm = () => {
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
        setEditingPopup(null);
        setShowForm(false);
    };

    return (
        <div className="p-6 max-w-7xl mx-auto">
            <div className="flex justify-between items-center mb-6">
                <h1 className="text-3xl font-bold text-gray-900">إدارة الإعلانات المنبثقة</h1>
                <button
                    onClick={() => setShowForm(!showForm)}
                    className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 flex items-center gap-2"
                >
                    <Plus size={20} />
                    إضافة إعلان جديد
                </button>
            </div>

            {/* Form */}
            {showForm && (
                <div className="bg-white rounded-lg shadow-lg p-6 mb-6">
                    <h2 className="text-xl font-bold mb-4">
                        {editingPopup ? 'تعديل الإعلان' : 'إضافة إعلان جديد'}
                    </h2>
                    <form onSubmit={handleSubmit} className="space-y-4">
                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <label className="block font-medium mb-2">العنوان (عربي)</label>
                                <input
                                    type="text"
                                    value={formData.title_ar}
                                    onChange={(e) => setFormData({...formData, title_ar: e.target.value})}
                                    className="w-full border rounded-lg px-3 py-2"
                                    required
                                />
                            </div>
                            <div>
                                <label className="block font-medium mb-2">Title (English)</label>
                                <input
                                    type="text"
                                    value={formData.title}
                                    onChange={(e) => setFormData({...formData, title: e.target.value})}
                                    className="w-full border rounded-lg px-3 py-2"
                                />
                            </div>
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <label className="block font-medium mb-2">الوصف (عربي)</label>
                                <textarea
                                    value={formData.description_ar}
                                    onChange={(e) => setFormData({...formData, description_ar: e.target.value})}
                                    className="w-full border rounded-lg px-3 py-2"
                                    rows={3}
                                />
                            </div>
                            <div>
                                <label className="block font-medium mb-2">Description (English)</label>
                                <textarea
                                    value={formData.description}
                                    onChange={(e) => setFormData({...formData, description: e.target.value})}
                                    className="w-full border rounded-lg px-3 py-2"
                                    rows={3}
                                />
                            </div>
                        </div>

                        <div>
                            <label className="block font-medium mb-2">رابط الصورة</label>
                            <input
                                type="url"
                                value={formData.image_url}
                                onChange={(e) => setFormData({...formData, image_url: e.target.value})}
                                className="w-full border rounded-lg px-3 py-2"
                                required
                            />
                        </div>

                        <div>
                            <label className="block font-medium mb-2">رابط الانتقال (اختياري)</label>
                            <input
                                type="url"
                                value={formData.link_url}
                                onChange={(e) => setFormData({...formData, link_url: e.target.value})}
                                className="w-full border rounded-lg px-3 py-2"
                            />
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <label className="block font-medium mb-2">نص الزر (عربي)</label>
                                <input
                                    type="text"
                                    value={formData.button_text_ar}
                                    onChange={(e) => setFormData({...formData, button_text_ar: e.target.value})}
                                    className="w-full border rounded-lg px-3 py-2"
                                />
                            </div>
                            <div>
                                <label className="block font-medium mb-2">Button Text (English)</label>
                                <input
                                    type="text"
                                    value={formData.button_text}
                                    onChange={(e) => setFormData({...formData, button_text: e.target.value})}
                                    className="w-full border rounded-lg px-3 py-2"
                                />
                            </div>
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <label className="block font-medium mb-2">تاريخ البداية</label>
                                <input
                                    type="date"
                                    value={formData.start_date}
                                    onChange={(e) => setFormData({...formData, start_date: e.target.value})}
                                    className="w-full border rounded-lg px-3 py-2"
                                />
                            </div>
                            <div>
                                <label className="block font-medium mb-2">تاريخ النهاية</label>
                                <input
                                    type="date"
                                    value={formData.end_date}
                                    onChange={(e) => setFormData({...formData, end_date: e.target.value})}
                                    className="w-full border rounded-lg px-3 py-2"
                                />
                            </div>
                        </div>

                        <div className="grid grid-cols-3 gap-4">
                            <div>
                                <label className="block font-medium mb-2">الأولوية</label>
                                <input
                                    type="number"
                                    value={formData.priority}
                                    onChange={(e) => setFormData({...formData, priority: parseInt(e.target.value)})}
                                    className="w-full border rounded-lg px-3 py-2"
                                />
                            </div>
                            <div className="flex items-center gap-2">
                                <input
                                    type="checkbox"
                                    checked={formData.is_active}
                                    onChange={(e) => setFormData({...formData, is_active: e.target.checked})}
                                    className="w-5 h-5"
                                />
                                <label className="font-medium">نشط</label>
                            </div>
                            <div className="flex items-center gap-2">
                                <input
                                    type="checkbox"
                                    checked={formData.show_on_homepage}
                                    onChange={(e) => setFormData({...formData, show_on_homepage: e.target.checked})}
                                    className="w-5 h-5"
                                />
                                <label className="font-medium">الصفحة الرئيسية</label>
                            </div>
                        </div>

                        <div className="flex gap-3">
                            <button
                                type="submit"
                                className="bg-green-600 text-white px-6 py-2 rounded-lg hover:bg-green-700"
                            >
                                حفظ
                            </button>
                            <button
                                type="button"
                                onClick={resetForm}
                                className="bg-gray-500 text-white px-6 py-2 rounded-lg hover:bg-gray-600"
                            >
                                إلغاء
                            </button>
                        </div>
                    </form>
                </div>
            )}

            {/* Popups List */}
            <div className="bg-white rounded-lg shadow-lg overflow-hidden">
                {loading ? (
                    <div className="p-8 text-center">جاري التحميل...</div>
                ) : popups.length === 0 ? (
                    <div className="p-8 text-center text-gray-500">لا توجد إعلانات</div>
                ) : (
                    <div className="divide-y">
                        {popups.map((popup) => (
                            <div key={popup.id} className="p-4 hover:bg-gray-50 flex items-center gap-4">
                                <img 
                                    src={popup.image_url} 
                                    alt={popup.title_ar}
                                    className="w-32 h-20 object-cover rounded-lg"
                                />
                                <div className="flex-1">
                                    <h3 className="font-bold text-lg">{popup.title_ar}</h3>
                                    <p className="text-sm text-gray-600">{popup.description_ar}</p>
                                    <div className="flex gap-2 mt-2">
                                        {popup.is_active ? (
                                            <span className="bg-green-100 text-green-700 px-2 py-1 rounded text-xs flex items-center gap-1">
                                                <Eye size={14} /> نشط
                                            </span>
                                        ) : (
                                            <span className="bg-red-100 text-red-700 px-2 py-1 rounded text-xs flex items-center gap-1">
                                                <EyeOff size={14} /> غير نشط
                                            </span>
                                        )}
                                        <span className="bg-blue-100 text-blue-700 px-2 py-1 rounded text-xs">
                                            أولوية: {popup.priority}
                                        </span>
                                    </div>
                                </div>
                                <div className="flex gap-2">
                                    <button
                                        onClick={() => handleEdit(popup)}
                                        className="p-2 text-blue-600 hover:bg-blue-100 rounded-lg"
                                    >
                                        <Edit2 size={20} />
                                    </button>
                                    <button
                                        onClick={() => handleDelete(popup.id)}
                                        className="p-2 text-red-600 hover:bg-red-100 rounded-lg"
                                    >
                                        <Trash2 size={20} />
                                    </button>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
};

export default AdminPopupsPage;
