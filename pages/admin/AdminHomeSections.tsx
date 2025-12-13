import React, { useState, useEffect } from 'react';
import { Plus, Edit2, Trash2, Image as ImageIcon, Save, X, MoveUp, MoveDown } from 'lucide-react';
import { api } from '../../services/api';

const AdminHomeSections = () => {
    const [sections, setSections] = useState([]);
    const [categories, setCategories] = useState([]);
    const [loading, setLoading] = useState(true);
    const [editingSection, setEditingSection] = useState(null);
    const [formData, setFormData] = useState({
        section_name: '',
        section_name_ar: '',
        banner_image: '',
        category: '',
        max_products: 8,
        is_active: true
    });

    useEffect(() => {
        fetchSections();
        fetchCategories();
    }, []);

    const fetchSections = async () => {
        try {
            const response = await api.get('/home-sections');
            setSections(response.data || []);
        } catch (error) {
            console.error('Error fetching sections:', error);
            setSections([]);
        } finally {
            setLoading(false);
        }
    };

    const fetchCategories = async () => {
        try {
            const response = await api.categories.getAll();
            if (response.success && response.data) {
                // Convert categories data to format expected by the dropdown
                const formattedCategories = response.data.map(cat => ({
                    category: cat.name_ar || cat.name,
                    product_count: cat.products_count || 0
                }));
                setCategories(formattedCategories);
            } else {
                setCategories([]);
            }
        } catch (error) {
            console.error('Error fetching categories:', error);
            setCategories([]);
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            if (editingSection) {
                await api.put(`/home-sections/${editingSection.id}`, formData);
            } else {
                await api.post('/home-sections', formData);
            }
            resetForm();
            fetchSections();
        } catch (error) {
            console.error('Error saving section:', error);
            alert('فشل حفظ القسم');
        }
    };

    const handleDelete = async (id) => {
        if (!confirm('هل تريد حذف هذا القسم؟')) return;

        try {
            await api.delete(`/home-sections/${id}`);
            fetchSections();
        } catch (error) {
            console.error('Error deleting section:', error);
            alert('فشل حذف القسم');
        }
    };

    const handleEdit = (section) => {
        setEditingSection(section);
        setFormData({
            section_name: section.section_name,
            section_name_ar: section.section_name_ar,
            banner_image: section.banner_image,
            category: section.category,
            max_products: section.max_products,
            is_active: section.is_active
        });
    };

    const resetForm = () => {
        setEditingSection(null);
        setFormData({
            section_name: '',
            section_name_ar: '',
            banner_image: '',
            category: '',
            max_products: 8,
            is_active: true
        });
    };

    const moveSection = async (index, direction) => {
        const newSections = [...sections];
        const targetIndex = direction === 'up' ? index - 1 : index + 1;

        if (targetIndex < 0 || targetIndex >= newSections.length) return;

        // Swap
        [newSections[index], newSections[targetIndex]] = [newSections[targetIndex], newSections[index]];

        // Update display_order
        const reorderedSections = newSections.map((section, idx) => ({
            id: section.id,
            display_order: idx + 1
        }));

        try {
            await api.post('/home-sections/reorder', { sections: reorderedSections });
            fetchSections();
        } catch (error) {
            console.error('Error reordering:', error);
        }
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-screen">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
            </div>
        );
    }

    return (
        <div className="max-w-7xl mx-auto p-6">
            <div className="mb-8">
                <h1 className="text-3xl font-bold text-gray-900 mb-2">إدارة أقسام الصفحة الرئيسية</h1>
                <p className="text-gray-600">أضف وعدل أقسام العرض في الصفحة الرئيسية</p>
            </div>

            {/* Form */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 mb-8">
                <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
                    {editingSection ? <Edit2 size={20} /> : <Plus size={20} />}
                    {editingSection ? 'تعديل القسم' : 'إضافة قسم جديد'}
                </h2>

                <form onSubmit={handleSubmit} className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {/* English Name */}
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                اسم القسم (English)
                            </label>
                            <input
                                type="text"
                                required
                                value={formData.section_name}
                                onChange={(e) => setFormData({ ...formData, section_name: e.target.value })}
                                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                                placeholder="Fresh Fruits"
                            />
                        </div>

                        {/* Arabic Name */}
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                اسم القسم (العربية)
                            </label>
                            <input
                                type="text"
                                required
                                value={formData.section_name_ar}
                                onChange={(e) => setFormData({ ...formData, section_name_ar: e.target.value })}
                                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                                placeholder="الفواكه الطازجة"
                            />
                        </div>

                        {/* Category */}
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                الفئة
                            </label>
                            <select
                                required
                                value={formData.category}
                                onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                            >
                                <option value="">اختر الفئة</option>
                                {categories.map((cat) => (
                                    <option key={cat.category} value={cat.category}>
                                        {cat.category}
                                        {cat.product_count > 0 && ` (${cat.product_count} منتج)`}
                                    </option>
                                ))}
                            </select>
                        </div>

                        {/* Max Products */}
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                عدد المنتجات المعروضة
                            </label>
                            <input
                                type="number"
                                min="4"
                                max="20"
                                required
                                value={formData.max_products}
                                onChange={(e) => setFormData({ ...formData, max_products: parseInt(e.target.value) })}
                                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                            />
                        </div>
                    </div>

                    {/* Banner Image */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                            <ImageIcon size={16} className="inline ml-1" />
                            رابط صورة البانر
                        </label>
                        <input
                            type="url"
                            required
                            value={formData.banner_image}
                            onChange={(e) => setFormData({ ...formData, banner_image: e.target.value })}
                            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                            placeholder="https://example.com/banner.jpg"
                        />
                        {formData.banner_image && (
                            <img
                                src={formData.banner_image}
                                alt="Preview"
                                className="mt-2 w-full h-32 object-cover rounded-lg"
                                onError={(e) => e.target.style.display = 'none'}
                            />
                        )}
                    </div>

                    {/* Active Toggle */}
                    <div className="flex items-center gap-2">
                        <input
                            type="checkbox"
                            id="is_active"
                            checked={formData.is_active}
                            onChange={(e) => setFormData({ ...formData, is_active: e.target.checked })}
                            className="w-4 h-4 text-primary border-gray-300 rounded focus:ring-primary"
                        />
                        <label htmlFor="is_active" className="text-sm font-medium text-gray-700">
                            تفعيل القسم
                        </label>
                    </div>

                    {/* Buttons */}
                    <div className="flex gap-3">
                        <button
                            type="submit"
                            className="flex items-center gap-2 px-6 py-2 bg-primary text-white rounded-lg hover:bg-primary/90 transition-colors"
                        >
                            <Save size={18} />
                            {editingSection ? 'حفظ التعديلات' : 'إضافة القسم'}
                        </button>

                        {editingSection && (
                            <button
                                type="button"
                                onClick={resetForm}
                                className="flex items-center gap-2 px-6 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors"
                            >
                                <X size={18} />
                                إلغاء
                            </button>
                        )}
                    </div>
                </form>
            </div>

            {/* Sections List */}
            <div className="space-y-4">
                <h2 className="text-xl font-semibold">الأقسام الحالية ({sections.length})</h2>

                {sections.length === 0 ? (
                    <div className="text-center py-12 bg-gray-50 rounded-xl">
                        <p className="text-gray-500">لا توجد أقسام حالياً</p>
                    </div>
                ) : (
                    sections.map((section, index) => (
                        <div
                            key={section.id}
                            className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 hover:shadow-md transition-shadow"
                        >
                            <div className="flex items-start gap-4">
                                {/* Banner Image */}
                                <img
                                    src={section.banner_image}
                                    alt={section.section_name_ar}
                                    className="w-32 h-20 object-cover rounded-lg"
                                />

                                {/* Info */}
                                <div className="flex-1">
                                    <div className="flex items-center gap-2 mb-2">
                                        <h3 className="text-lg font-semibold">{section.section_name_ar}</h3>
                                        {!section.is_active && (
                                            <span className="px-2 py-1 text-xs bg-gray-200 text-gray-600 rounded">
                                                غير مفعل
                                            </span>
                                        )}
                                    </div>
                                    <p className="text-sm text-gray-600 mb-1">{section.section_name}</p>
                                    <div className="flex items-center gap-4 text-sm text-gray-500">
                                        <span>الفئة: {section.category}</span>
                                        <span>عدد المنتجات: {section.max_products}</span>
                                        <span>الترتيب: {section.display_order}</span>
                                    </div>
                                </div>

                                {/* Actions */}
                                <div className="flex flex-col gap-2">
                                    {/* Move Buttons */}
                                    <div className="flex gap-1">
                                        <button
                                            onClick={() => moveSection(index, 'up')}
                                            disabled={index === 0}
                                            className="p-2 text-gray-600 hover:bg-gray-100 rounded-lg disabled:opacity-30 disabled:cursor-not-allowed"
                                            title="تحريك لأعلى"
                                        >
                                            <MoveUp size={18} />
                                        </button>
                                        <button
                                            onClick={() => moveSection(index, 'down')}
                                            disabled={index === sections.length - 1}
                                            className="p-2 text-gray-600 hover:bg-gray-100 rounded-lg disabled:opacity-30 disabled:cursor-not-allowed"
                                            title="تحريك لأسفل"
                                        >
                                            <MoveDown size={18} />
                                        </button>
                                    </div>

                                    {/* Edit/Delete */}
                                    <div className="flex gap-1">
                                        <button
                                            onClick={() => handleEdit(section)}
                                            className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg"
                                            title="تعديل"
                                        >
                                            <Edit2 size={18} />
                                        </button>
                                        <button
                                            onClick={() => handleDelete(section.id)}
                                            className="p-2 text-red-600 hover:bg-red-50 rounded-lg"
                                            title="حذف"
                                        >
                                            <Trash2 size={18} />
                                        </button>
                                    </div>
                                </div>
                            </div>
                        </div>
                    ))
                )}
            </div>
        </div>
    );
};

export default AdminHomeSections;
