import React, { useState, useEffect } from 'react';
import { Plus, Edit2, Trash2, Image as ImageIcon, Save, X, MoveUp, MoveDown, Upload, Loader } from 'lucide-react';
import { api } from '../../services/api';
import { API_URL } from '../../src/config';

const AdminHomeSections = () => {
    const [sections, setSections] = useState([]);
    const [categories, setCategories] = useState([]);
    const [loading, setLoading] = useState(true);
    const [editingSection, setEditingSection] = useState(null);
    const [uploadingImage, setUploadingImage] = useState(false);
    const [formData, setFormData] = useState({
        section_name: '',
        section_name_ar: '',
        banner_image: '',
        category: '',
        max_products: 8,
        is_active: true
    });

    useEffect(() => {
        console.log('🚀 AdminHomeSections mounted - starting data fetch');
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

    const normalizeCategoryValue = (value: string = '') =>
        value
            .toString()
            .trim()
            .toLowerCase()
            .replace(/أ|إ|آ/g, 'ا')
            .replace(/ة/g, 'ه')
            .replace(/ى/g, 'ي')
            .replace(/\s+/g, '')
            .replace(/[-_]/g, '');

    const hasArabicChars = (value: string = '') => /[\u0600-\u06FF]/.test(value);

    const fetchCategories = async () => {
        console.log('🔴 START: fetchCategories called');
        
        try {
            console.log('🔍 Fetching categories from API...');
            
            // Try getAllAdmin first
            let response;
            try {
                response = await api.categories.getAllAdmin({ includeOfferOnly: true });
                console.log('📦 getAllAdmin response:', response);
            } catch (adminError) {
                console.warn('⚠️ getAllAdmin failed, trying getAll:', adminError);
                response = await api.categories.getAll();
                console.log('📦 getAll response:', response);
            }
            
            // Handle different response formats
            const categoriesData = response?.data || response || [];
            console.log('📦 Categories data extracted:', categoriesData);
            
            if (Array.isArray(categoriesData) && categoriesData.length > 0) {
                // Convert categories data to format expected by the dropdown
                const formattedCategories = categoriesData
                    .filter(cat => !cat.parent_id) // Only main categories, not subcategories
                    .map(cat => {
                        const categoryName = cat.name_ar || cat.name;
                        const displayName = cat.name_ar || cat.name;
                        console.log(`🏷️ Category formatted: name="${cat.name}", name_ar="${cat.name_ar}", using="${categoryName}"`);
                        return {
                            category: displayName, // للعرض
                            categoryName: categoryName, // للحفظ في قاعدة البيانات
                            product_count: cat.products_count || 0,
                            icon: cat.icon
                        };
                    });
                
                // إزالة التصنيفات المكررة بناءً على قيمة مطبّعة
                const uniqueCategories = Array.from(
                    formattedCategories.reduce((acc, current) => {
                        const key = normalizeCategoryValue(current.categoryName || current.category);
                        if (!key) return acc;
                        const existing = acc.get(key);
                        if (!existing) {
                            acc.set(key, current);
                            return acc;
                        }
                        const existingIsArabic = hasArabicChars(existing.categoryName || existing.category);
                        const currentIsArabic = hasArabicChars(current.categoryName || current.category);
                        if (currentIsArabic && !existingIsArabic) {
                            acc.set(key, current);
                            return acc;
                        }
                        if ((current.product_count || 0) > (existing.product_count || 0)) {
                            acc.set(key, { ...existing, product_count: current.product_count });
                        } else if (!existing.icon && current.icon) {
                            acc.set(key, { ...existing, icon: current.icon });
                        }
                        return acc;
                    }, new Map())
                    .values()
                );
                
                console.log('✅ Formatted categories (' + formattedCategories.length + '):', formattedCategories);
                console.log('✅ Unique categories (' + uniqueCategories.length + '):', uniqueCategories);
                setCategories(uniqueCategories);
            } else {
                console.warn('⚠️ No categories found, using fallback');
                // Fallback categories from products
                const fallbackCategories = [
                    { category: 'بقالة', categoryName: 'بقالة', product_count: 0, icon: '🛒' },
                    { category: 'ألبان', categoryName: 'ألبان', product_count: 0, icon: '🥛' },
                    { category: 'مشروبات', categoryName: 'مشروبات', product_count: 0, icon: '🥤' },
                    { category: 'سناكس', categoryName: 'سناكس', product_count: 0, icon: '🍿' },
                    { category: 'حلويات', categoryName: 'حلويات', product_count: 0, icon: '🍫' },
                    { category: 'زيوت', categoryName: 'زيوت', product_count: 0, icon: '🫏' },
                    { category: 'منظفات', categoryName: 'منظفات', product_count: 0, icon: '🧹' },
                    { category: 'عناية شخصية', categoryName: 'عناية شخصية', product_count: 0, icon: '🧼' }
                ];
                setCategories(fallbackCategories);
            }
        } catch (error) {
            console.error('❌ Fatal error in fetchCategories:', error);
            console.error('Error stack:', error.stack);
            
            // Set fallback categories on error
            const fallbackCategories = [
                { category: 'بقالة', categoryName: 'بقالة', product_count: 0, icon: '🛒' },
                { category: 'ألبان', categoryName: 'ألبان', product_count: 0, icon: '🥛' },
                { category: 'مشروبات', categoryName: 'مشروبات', product_count: 0, icon: '🥤' },
                { category: 'سناكس', categoryName: 'سناكس', product_count: 0, icon: '🍿' },
                { category: 'حلويات', categoryName: 'حلويات', product_count: 0, icon: '🍫' },
                { category: 'زيوت', categoryName: 'زيوت', product_count: 0, icon: '🫏' },
                { category: 'منظفات', categoryName: 'منظفات', product_count: 0, icon: '🧹' },
                { category: 'عناية شخصية', categoryName: 'عناية شخصية', product_count: 0, icon: '🧼' }
            ];
            setCategories(fallbackCategories);
        } finally {
            console.log('🔴 END: fetchCategories completed');
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            console.log('💾 Saving section with category:', formData.category);
            console.log('📋 Full form data:', formData);
            
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

    const handleImageUpload = async (e) => {
        const file = e.target.files?.[0];
        if (!file) return;

        if (file.size > 5 * 1024 * 1024) {
            alert('حجم الصورة كبير جداً. الحد الأقصى 5 ميجابايت');
            return;
        }

        if (!file.type.startsWith('image/')) {
            alert('الرجاء اختيار صورة');
            return;
        }

        setUploadingImage(true);
        const originalImage = formData.banner_image;

        try {
            const uploadData = new FormData();
            uploadData.append('image', file);
            uploadData.append('productId', `home_section_${editingSection?.id || Date.now()}`);

            const response = await fetch(`${API_URL}/upload/image`, {
                method: 'POST',
                body: uploadData
            });

            const result = await response.json();

            if (result.success && result.data?.url) {
                setFormData({ ...formData, banner_image: result.data.url });
                alert('✅ تم رفع الصورة بنجاح!');
            } else {
                throw new Error(result.error || 'فشل رفع الصورة');
            }
        } catch (error) {
            console.error('Upload error:', error);
            alert('❌ فشل رفع الصورة: ' + error.message);
            setFormData({ ...formData, banner_image: originalImage });
        } finally {
            setUploadingImage(false);
        }
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

                {/* Info Banner */}
                <div className="mb-4 p-4 bg-gradient-to-r from-blue-50 to-purple-50 border border-blue-200 rounded-lg">
                    <div className="flex items-start gap-3">
                        <span className="text-2xl">ℹ️</span>
                        <div>
                            <h3 className="font-semibold text-blue-900 mb-1">كيف يعمل القسم؟</h3>
                            <p className="text-sm text-blue-800">
                                • اختر <strong>الفئة (Category)</strong> من القائمة<br />
                                • سيتم جلب المنتجات من هذه الفئة <strong>تلقائياً</strong><br />
                                • حدد عدد المنتجات التي تريد عرضها (4-20 منتج)<br />
                                • سيتم عرض أحدث المنتجات المتوفرة من الفئة المحددة
                            </p>
                        </div>
                    </div>
                </div>

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
                                <span className="text-xs text-green-600 font-normal mr-2">
                                    ✨ سيتم عرض المنتجات من هذه الفئة تلقائياً
                                </span>
                            </label>
                            <select
                                required
                                value={formData.category}
                                onChange={(e) => {
                                    const selectedValue = e.target.value;
                                    console.log('📝 Category selected:', selectedValue);
                                    setFormData({ ...formData, category: selectedValue });
                                }}
                                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                            >
                                <option value="">اختر الفئة</option>
                                {categories.length === 0 ? (
                                    <option disabled>جاري التحميل...</option>
                                ) : (
                                    categories.map((cat, index) => {
                                        // استخدم الاسم العربي أو الإنجليزي - ما يتطابق مع قاعدة البيانات
                                        const value = cat.categoryName || cat.category;
                                        return (
                                            <option key={`${value}-${index}`} value={value}>
                                                {cat.icon && `${cat.icon} `}{cat.category}
                                                {cat.product_count > 0 && ` (${cat.product_count} منتج)`}
                                            </option>
                                        );
                                    })
                                )}
                            </select>
                            <p className="mt-1 text-xs text-gray-500">
                                💡 سيتم جلب أحدث {formData.max_products} منتج من الفئة المحددة تلقائياً
                            </p>
                            {formData.category && (
                                <p className="mt-1 text-xs text-blue-600 font-medium">
                                    ✓ الفئة المحددة: "{formData.category}"
                                </p>
                            )}
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
                        <div className="space-y-2">
                            <input
                                type="url"
                                required
                                value={formData.banner_image}
                                onChange={(e) => setFormData({ ...formData, banner_image: e.target.value })}
                                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                                placeholder="https://example.com/banner.jpg"
                            />
                            <div className="flex items-center gap-2">
                                <label className="flex-1 cursor-pointer">
                                    <div className={`flex items-center justify-center gap-2 px-4 py-2 rounded-lg border-2 border-dashed transition-colors ${
                                        uploadingImage 
                                            ? 'border-gray-300 bg-gray-50' 
                                            : 'border-primary hover:border-primary hover:bg-blue-50'
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
