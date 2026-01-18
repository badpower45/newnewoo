import React, { useState, useEffect } from 'react';
import { Edit2, Trash2, Save, X, ImagePlus, Loader2, Upload, Loader } from 'lucide-react';
import { api } from '../../services/api';
import ErrorMessage from '../../components/ErrorMessage';
import LoadingSpinner from '../../components/LoadingSpinner';
import { API_URL } from '../../src/config';

interface Category {
    id: number;
    name: string;
    name_ar?: string;
    icon?: string;
    banner_image?: string;
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
            banner_image: category.banner_image || ''
        });
    };

    const handleSave = async (categoryId: number) => {
        setSaving(true);
        try {
            await api.categories.update(categoryId, {
                banner_image: editForm.banner_image || null,
                banner_title: null,
                banner_subtitle: null,
                banner_type: null,
                banner_action_url: null,
                banner_button_text: null
            });
            await fetchCategories();

            setEditingId(null);
            setEditForm({});
            alert('✅ تم حفظ البانر');
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
                banner_type: null,
                banner_action_url: null,
                banner_button_text: null
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
                                    {editForm.banner_image && (
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                                معاينة الصورة
                                            </label>
                                            <div className="relative overflow-hidden rounded-2xl shadow-lg border border-gray-200">
                                                <img
                                                    src={editForm.banner_image}
                                                    alt="Banner Preview"
                                                    className="w-full h-48 object-cover"
                                                />
                                            </div>
                                        </div>
                                    )}
                                </div>
                            ) : (
                                // Banner Preview (when not editing)
                                category.banner_image ? (
                                    <div className="relative overflow-hidden rounded-2xl shadow-lg border border-gray-200">
                                        <img
                                            src={category.banner_image}
                                            alt={category.name_ar || category.name}
                                            className="w-full h-48 object-cover"
                                        />
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
