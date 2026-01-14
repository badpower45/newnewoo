import React, { useState, useEffect } from 'react';
import { Plus, Edit2, Trash2, Save, X, ImagePlus, Loader2, ExternalLink, Eye, Upload, Loader } from 'lucide-react';
import { api } from '../../services/api';
import { pushNotificationService } from '../../services/pushNotifications';
import ErrorMessage from '../../components/ErrorMessage';
import LoadingSpinner from '../../components/LoadingSpinner';
import { API_URL } from '../../src/config';

interface Category {
    id: number;
    name: string;
    name_ar?: string;
    icon?: string;
    banner_image?: string;
    banner_title?: string;
    banner_subtitle?: string;
    bg_color?: string;
    banner_type?: 'display' | 'action';
    banner_action_url?: string;
    banner_button_text?: string;
}

const CategoryBannersManager: React.FC = () => {
    const [categories, setCategories] = useState<Category[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [editingId, setEditingId] = useState<number | null>(null);
    const [editForm, setEditForm] = useState<Partial<Category>>({});
    const [saving, setSaving] = useState(false);
    const [uploadingImage, setUploadingImage] = useState(false);

    useEffect(() => {
        fetchCategories();
    }, []);

    const fetchCategories = async () => {
        setLoading(true);
        setError(null);
        try {
            const response = await api.categories.getAll();
            setCategories(response.data || []);
        } catch (err) {
            setError('فشل تحميل التصنيفات');
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    const handleEdit = (category: Category) => {
        setEditingId(category.id);
        setEditForm({
            banner_image: category.banner_image || '',
            banner_title: category.banner_title || '',
            banner_subtitle: category.banner_subtitle || '',
            bg_color: category.bg_color || '',
            banner_type: category.banner_type || 'display',
            banner_action_url: category.banner_action_url || '',
            banner_button_text: category.banner_button_text || 'تسوق الآن',
        });
    };

    const handleSave = async (categoryId: number) => {
        setSaving(true);
        try {
            await api.categories.update(categoryId, editForm);
            await fetchCategories();
            
            // إرسال إشعار عند حفظ بانر جديد
            if (editForm.banner_title && editForm.banner_image) {
                await pushNotificationService.notifyNewBanner({
                    title: editForm.banner_title,
                    image: editForm.banner_image,
                    targetUrl: editForm.banner_action_url
                });
            }
            
            setEditingId(null);
            setEditForm({});
            alert('✅ تم حفظ البانر وإرسال إشعار للمستخدمين!');
        } catch (err) {
            alert('فشل حفظ التعديلات');
            console.error(err);
        } finally {
            setSaving(false);
        }
    };

    const handleCancel = () => {
        setEditingId(null);
        setEditForm({});
    };

    const handleRemoveBanner = async (categoryId: number) => {
        if (!confirm('هل تريد حذف البانر من هذا التصنيف؟')) return;
        
        setSaving(true);
        try {
            await api.categories.update(categoryId, {
                banner_image: null,
                banner_title: null,
                banner_subtitle: null,
            });
            await fetchCategories();
        } catch (err) {
            alert('فشل حذف البانر');
            console.error(err);
        } finally {
            setSaving(false);
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

        const hasValidMime = file.type?.startsWith('image/');
        const lowerName = file.name.toLowerCase();
        const hasValidExtension = ['.jpg', '.jpeg', '.png', '.webp', '.gif'].some((ext) =>
            lowerName.endsWith(ext)
        );
        if (!hasValidMime && !hasValidExtension) {
            alert('الرجاء اختيار صورة');
            return;
        }

        setUploadingImage(true);
        const originalImage = editForm.banner_image;

        try {
            const formData = new FormData();
            formData.append('image', file);
            formData.append('productId', `banner_${editingId || Date.now()}`);

            const response = await fetch(`${API_URL}/upload/image`, {
                method: 'POST',
                body: formData
            });

            const result = await response.json();

            if (result.success && result.data?.url) {
                setEditForm({ ...editForm, banner_image: result.data.url });
                alert('✅ تم رفع الصورة بنجاح!');
            } else {
                throw new Error(result.error || 'فشل رفع الصورة');
            }
        } catch (error: any) {
            console.error('Upload error:', error);
            alert('❌ فشل رفع الصورة: ' + error.message);
            setEditForm({ ...editForm, banner_image: originalImage });
        } finally {
            setUploadingImage(false);
        }
    };

    const colorOptions = [
        { label: 'برتقالي', value: 'from-orange-400 to-orange-600', preview: 'bg-gradient-to-r from-orange-400 to-orange-600' },
        { label: 'أزرق', value: 'from-blue-400 to-blue-600', preview: 'bg-gradient-to-r from-blue-400 to-blue-600' },
        { label: 'أخضر', value: 'from-green-400 to-green-600', preview: 'bg-gradient-to-r from-green-400 to-green-600' },
        { label: 'أحمر', value: 'from-red-400 to-red-600', preview: 'bg-gradient-to-r from-red-400 to-red-600' },
        { label: 'بنفسجي', value: 'from-purple-400 to-purple-600', preview: 'bg-gradient-to-r from-purple-400 to-purple-600' },
        { label: 'وردي', value: 'from-pink-400 to-pink-600', preview: 'bg-gradient-to-r from-pink-400 to-pink-600' },
        { label: 'أصفر', value: 'from-yellow-400 to-orange-500', preview: 'bg-gradient-to-r from-yellow-400 to-orange-500' },
        { label: 'سماوي', value: 'from-cyan-400 to-blue-500', preview: 'bg-gradient-to-r from-cyan-400 to-blue-500' },
    ];

    if (loading) return <LoadingSpinner />;
    if (error) return <ErrorMessage message={error} />;

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <div>
                    <h2 className="text-3xl font-bold text-gray-900">إدارة بانرات التصنيفات</h2>
                    <p className="text-gray-600 mt-1">قم بتخصيص البانرات لكل تصنيف</p>
                </div>
            </div>

            <div className="grid gap-6">
                {categories.map((category) => (
                    <div key={category.id} className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden">
                        {/* Category Header */}
                        <div className="p-4 bg-gray-50 border-b border-gray-200 flex items-center justify-between">
                            <div className="flex items-center gap-3">
                                <span className="text-3xl">{category.icon || '🛒'}</span>
                                <div>
                                    <h3 className="font-bold text-gray-900">{category.name_ar || category.name}</h3>
                                    <p className="text-sm text-gray-500">{category.name}</p>
                                </div>
                            </div>
                            
                            {editingId === category.id ? (
                                <div className="flex gap-2">
                                    <button
                                        onClick={() => handleSave(category.id)}
                                        disabled={saving}
                                        className="px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 flex items-center gap-2 disabled:opacity-50"
                                    >
                                        {saving ? <Loader2 className="animate-spin" size={16} /> : <Save size={16} />}
                                        حفظ
                                    </button>
                                    <button
                                        onClick={handleCancel}
                                        className="px-4 py-2 bg-gray-500 text-white rounded-lg hover:bg-gray-600 flex items-center gap-2"
                                    >
                                        <X size={16} />
                                        إلغاء
                                    </button>
                                </div>
                            ) : (
                                <div className="flex gap-2">
                                    <button
                                        onClick={() => handleEdit(category)}
                                        className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 flex items-center gap-2"
                                    >
                                        <Edit2 size={16} />
                                        تعديل
                                    </button>
                                    {category.banner_image && (
                                        <button
                                            onClick={() => handleRemoveBanner(category.id)}
                                            className="px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 flex items-center gap-2"
                                        >
                                            <Trash2 size={16} />
                                            حذف البانر
                                        </button>
                                    )}
                                </div>
                            )}
                        </div>

                        {/* Editing Form or Banner Preview */}
                        <div className="p-6">
                            {editingId === category.id ? (
                                <div className="space-y-4">
                                    {/* Banner Type Toggle */}
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-2">
                                            نوع البانر
                                        </label>
                                        <div className="flex gap-3">
                                            <button
                                                type="button"
                                                onClick={() => setEditForm({ ...editForm, banner_type: 'display' })}
                                                className={`flex-1 px-4 py-3 rounded-xl font-medium transition-all flex items-center justify-center gap-2 ${
                                                    editForm.banner_type === 'display'
                                                        ? 'bg-blue-500 text-white shadow-lg'
                                                        : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                                                }`}
                                            >
                                                <Eye size={20} />
                                                <span>عرض فقط</span>
                                            </button>
                                            <button
                                                type="button"
                                                onClick={() => setEditForm({ ...editForm, banner_type: 'action' })}
                                                className={`flex-1 px-4 py-3 rounded-xl font-medium transition-all flex items-center justify-center gap-2 ${
                                                    editForm.banner_type === 'action'
                                                        ? 'bg-brand-orange text-white shadow-lg'
                                                        : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                                                }`}
                                            >
                                                <ExternalLink size={20} />
                                                <span>بانر تفاعلي</span>
                                            </button>
                                        </div>
                                        <p className="text-xs text-gray-500 mt-2">
                                            {editForm.banner_type === 'action' 
                                                ? '✨ سيظهر زر في البانر يوجه المستخدم لصفحة معينة'
                                                : '👁️ البانر للعرض فقط بدون أي زر تفاعلي'
                                            }
                                        </p>
                                    </div>

                                    {/* Action Button Fields (only if type is action) */}
                                    {editForm.banner_type === 'action' && (
                                        <>
                                            <div>
                                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                                    رابط الزر (URL)
                                                </label>
                                                <input
                                                    type="text"
                                                    value={editForm.banner_action_url || ''}
                                                    onChange={(e) => setEditForm({ ...editForm, banner_action_url: e.target.value })}
                                                    placeholder="/product/123 أو https://example.com"
                                                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-brand-orange focus:border-transparent"
                                                    dir="ltr"
                                                />
                                                <p className="text-xs text-gray-500 mt-1">
                                                    💡 يمكنك استخدام: /product/123 أو /category/ألبان أو رابط خارجي
                                                </p>
                                            </div>

                                            <div>
                                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                                    نص الزر
                                                </label>
                                                <input
                                                    type="text"
                                                    value={editForm.banner_button_text || ''}
                                                    onChange={(e) => setEditForm({ ...editForm, banner_button_text: e.target.value })}
                                                    placeholder="تسوق الآن"
                                                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-brand-orange focus:border-transparent"
                                                    dir="rtl"
                                                />
                                            </div>
                                        </>
                                    )}

                                    {/* Banner Title */}
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-2">
                                            عنوان البانر
                                        </label>
                                        <input
                                            type="text"
                                            value={editForm.banner_title || ''}
                                            onChange={(e) => setEditForm({ ...editForm, banner_title: e.target.value })}
                                            placeholder="مثال: مستحضرات التجميل"
                                            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                            dir="rtl"
                                        />
                                    </div>

                                    {/* Banner Subtitle */}
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-2">
                                            النص الفرعي
                                        </label>
                                        <input
                                            type="text"
                                            value={editForm.banner_subtitle || ''}
                                            onChange={(e) => setEditForm({ ...editForm, banner_subtitle: e.target.value })}
                                            placeholder="مثال: أفضل العروض والمنتجات"
                                            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                            dir="rtl"
                                        />
                                    </div>

                                    {/* Banner Image URL */}
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-2">
                                            رابط صورة البانر
                                        </label>
                                        <div className="space-y-2">
                                            <input
                                                type="url"
                                                value={editForm.banner_image || ''}
                                                onChange={(e) => setEditForm({ ...editForm, banner_image: e.target.value })}
                                                placeholder="https://example.com/image.jpg"
                                                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                                dir="ltr"
                                            />
                                            <div className="flex items-center gap-2">
                                                <label className="flex-1 cursor-pointer">
                                                    <div className={`flex items-center justify-center gap-2 px-4 py-2 rounded-lg border-2 border-dashed transition-colors ${
                                                        uploadingImage 
                                                            ? 'border-gray-300 bg-gray-50' 
                                                            : 'border-blue-500 hover:border-blue-600 hover:bg-blue-50'
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

                                    {/* Background Color */}
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-2">
                                            لون الخلفية
                                        </label>
                                        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                                            {colorOptions.map((color) => (
                                                <button
                                                    key={color.value}
                                                    onClick={() => setEditForm({ ...editForm, bg_color: color.value })}
                                                    className={`h-12 rounded-lg ${color.preview} flex items-center justify-center text-white font-medium transition-all ${
                                                        editForm.bg_color === color.value ? 'ring-4 ring-blue-500 scale-105' : 'hover:scale-105'
                                                    }`}
                                                >
                                                    {color.label}
                                                </button>
                                            ))}
                                        </div>
                                    </div>

                                    {/* Preview */}
                                    {(editForm.banner_title || editForm.banner_subtitle) && (
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                                معاينة البانر
                                            </label>
                                            <div className={`relative overflow-hidden rounded-2xl h-32 shadow-lg bg-gradient-to-r ${editForm.bg_color || 'from-orange-400 to-orange-600'}`}>
                                                <div className="relative z-10 h-full flex items-center justify-between px-6">
                                                    <div className="flex items-center gap-4">
                                                        <div className="w-16 h-16 bg-white/20 backdrop-blur-sm rounded-2xl flex items-center justify-center">
                                                            <span className="text-4xl">{category.icon || '🛒'}</span>
                                                        </div>
                                                        <div>
                                                            <h2 className="text-2xl font-bold text-white mb-1">
                                                                {editForm.banner_title || category.name_ar || category.name}
                                                            </h2>
                                                            <p className="text-white/90 text-sm">
                                                                {editForm.banner_subtitle || 'أفضل العروض والمنتجات'}
                                                            </p>
                                                        </div>
                                                    </div>
                                                    {editForm.banner_type === 'action' && (
                                                        <button className="px-6 py-3 bg-white text-gray-900 font-bold rounded-xl hover:bg-gray-100 transition-colors flex items-center gap-2 shadow-lg">
                                                            <span>{editForm.banner_button_text || 'تسوق الآن'}</span>
                                                            <ExternalLink size={18} />
                                                        </button>
                                                    )}
                                                </div>
                                            </div>
                                        </div>
                                    )}
                                </div>
                            ) : (
                                // Banner Preview (when not editing)
                                category.banner_image || category.banner_title ? (
                                    <div className={`relative overflow-hidden rounded-2xl h-32 shadow-lg bg-gradient-to-r ${category.bg_color || 'from-orange-400 to-orange-600'}`}>
                                        <div className="relative z-10 h-full flex items-center justify-between px-6">
                                            <div className="flex items-center gap-4">
                                                <div className="w-16 h-16 bg-white/20 backdrop-blur-sm rounded-2xl flex items-center justify-center">
                                                    <span className="text-4xl">{category.icon || '🛒'}</span>
                                                </div>
                                                <div>
                                                    <h2 className="text-2xl font-bold text-white mb-1">
                                                        {category.banner_title || category.name_ar || category.name}
                                                    </h2>
                                                    <p className="text-white/90 text-sm">
                                                        {category.banner_subtitle || 'أفضل العروض والمنتجات'}
                                                    </p>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                ) : (
                                    <div className="text-center py-8 text-gray-500">
                                        <ImagePlus size={48} className="mx-auto mb-2 text-gray-400" />
                                        <p>لا يوجد بانر لهذا التصنيف</p>
                                        <p className="text-sm">اضغط على "تعديل" لإضافة بانر</p>
                                    </div>
                                )
                            )}
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
};

export default CategoryBannersManager;
