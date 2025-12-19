import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Plus, Edit2, Trash2, Save, X, Upload, Image as ImageIcon, Tag, Palette } from 'lucide-react';
import AdminHeader from '../../components/AdminHeader';
import api from '../../services/api';

interface Brand {
    id: string;
    name_ar: string;
    name_en: string;
    logo_url?: string;
    banner_url?: string;
    primary_color?: string;
    secondary_color?: string;
    description_ar?: string;
    description_en?: string;
    is_featured: boolean;
    products_count?: number;
    created_at?: string;
}

const BrandsManager: React.FC = () => {
    const navigate = useNavigate();
    const [brands, setBrands] = useState<Brand[]>([]);
    const [loading, setLoading] = useState(true);
    const [editingBrand, setEditingBrand] = useState<Brand | null>(null);
    const [showAddForm, setShowAddForm] = useState(false);
    const [formData, setFormData] = useState<Partial<Brand>>({
        name_ar: '',
        name_en: '',
        description_ar: '',
        description_en: '',
        primary_color: '#F57C00',
        secondary_color: '#FF9800',
        is_featured: false
    });

    useEffect(() => {
        fetchBrands();
    }, []);

    const fetchBrands = async () => {
        try {
            setLoading(true);
            const response = await api.brands.getAll();
            setBrands(response.data || []);
        } catch (error) {
            console.error('Error fetching brands:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            if (editingBrand) {
                await api.brands.update(editingBrand.id, formData);
            } else {
                await api.brands.create(formData);
            }
            
            // Reset form
            setFormData({
                name_ar: '',
                name_en: '',
                description_ar: '',
                description_en: '',
                primary_color: '#F57C00',
                secondary_color: '#FF9800',
                is_featured: false
            });
            setEditingBrand(null);
            setShowAddForm(false);
            fetchBrands();
        } catch (error) {
            console.error('Error saving brand:', error);
            alert('حدث خطأ أثناء حفظ البراند');
        }
    };

    const handleEdit = (brand: Brand) => {
        setEditingBrand(brand);
        setFormData(brand);
        setShowAddForm(true);
    };

    const handleDelete = async (brandId: string) => {
        if (!confirm('هل أنت متأكد من حذف هذا البراند؟')) return;
        
        try {
            await api.brands.delete(brandId);
            fetchBrands();
        } catch (error) {
            console.error('Error deleting brand:', error);
            alert('حدث خطأ أثناء حذف البراند');
        }
    };

    const handleImageUpload = async (file: File, type: 'logo' | 'banner') => {
        try {
            // This would call Cloudinary upload
            const uploadedUrl = await api.images.upload(file);
            setFormData({
                ...formData,
                [type === 'logo' ? 'logo_url' : 'banner_url']: uploadedUrl
            });
        } catch (error) {
            console.error('Error uploading image:', error);
            alert('حدث خطأ أثناء رفع الصورة');
        }
    };

    const BrandForm = () => (
        <div className="bg-white rounded-lg shadow-md p-6 mb-6">
            <div className="flex justify-between items-center mb-4">
                <h3 className="text-xl font-bold text-gray-900">
                    {editingBrand ? 'تعديل البراند' : 'إضافة براند جديد'}
                </h3>
                <button
                    onClick={() => {
                        setShowAddForm(false);
                        setEditingBrand(null);
                        setFormData({
                            name_ar: '',
                            name_en: '',
                            description_ar: '',
                            description_en: '',
                            primary_color: '#F57C00',
                            secondary_color: '#FF9800',
                            is_featured: false
                        });
                    }}
                    className="text-gray-500 hover:text-gray-700"
                >
                    <X size={24} />
                </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
                <div className="grid md:grid-cols-2 gap-4">
                    {/* Arabic Name */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                            الاسم بالعربية *
                        </label>
                        <input
                            type="text"
                            value={formData.name_ar || ''}
                            onChange={(e) => setFormData({ ...formData, name_ar: e.target.value })}
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500"
                            required
                        />
                    </div>

                    {/* English Name */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                            English Name *
                        </label>
                        <input
                            type="text"
                            value={formData.name_en || ''}
                            onChange={(e) => setFormData({ ...formData, name_en: e.target.value })}
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500"
                            required
                        />
                    </div>
                </div>

                {/* Arabic Description */}
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                        الوصف بالعربية
                    </label>
                    <textarea
                        value={formData.description_ar || ''}
                        onChange={(e) => setFormData({ ...formData, description_ar: e.target.value })}
                        rows={3}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500"
                    />
                </div>

                {/* English Description */}
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                        English Description
                    </label>
                    <textarea
                        value={formData.description_en || ''}
                        onChange={(e) => setFormData({ ...formData, description_en: e.target.value })}
                        rows={3}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500"
                    />
                </div>

                {/* Colors */}
                <div className="grid md:grid-cols-2 gap-4">
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                            <Palette size={16} className="inline ml-1" />
                            اللون الأساسي
                        </label>
                        <div className="flex gap-2">
                            <input
                                type="color"
                                value={formData.primary_color || '#F57C00'}
                                onChange={(e) => setFormData({ ...formData, primary_color: e.target.value })}
                                className="h-10 w-16 border border-gray-300 rounded-lg cursor-pointer"
                            />
                            <input
                                type="text"
                                value={formData.primary_color || '#F57C00'}
                                onChange={(e) => setFormData({ ...formData, primary_color: e.target.value })}
                                className="flex-1 px-3 py-2 border border-gray-300 rounded-lg"
                                placeholder="#F57C00"
                            />
                        </div>
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                            <Palette size={16} className="inline ml-1" />
                            اللون الثانوي
                        </label>
                        <div className="flex gap-2">
                            <input
                                type="color"
                                value={formData.secondary_color || '#FF9800'}
                                onChange={(e) => setFormData({ ...formData, secondary_color: e.target.value })}
                                className="h-10 w-16 border border-gray-300 rounded-lg cursor-pointer"
                            />
                            <input
                                type="text"
                                value={formData.secondary_color || '#FF9800'}
                                onChange={(e) => setFormData({ ...formData, secondary_color: e.target.value })}
                                className="flex-1 px-3 py-2 border border-gray-300 rounded-lg"
                                placeholder="#FF9800"
                            />
                        </div>
                    </div>
                </div>

                {/* Logo Upload */}
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                        <ImageIcon size={16} className="inline ml-1" />
                        شعار البراند (Logo)
                    </label>
                    <div className="flex items-center gap-4">
                        {formData.logo_url && (
                            <img 
                                src={formData.logo_url} 
                                alt="Logo" 
                                className="w-20 h-20 object-contain border rounded-lg"
                            />
                        )}
                        <label className="flex-1 cursor-pointer">
                            <div className="border-2 border-dashed border-gray-300 rounded-lg p-4 text-center hover:border-orange-500 transition-colors">
                                <Upload size={20} className="mx-auto mb-2 text-gray-400" />
                                <span className="text-sm text-gray-600">اختر صورة الشعار</span>
                            </div>
                            <input
                                type="file"
                                accept="image/*"
                                onChange={(e) => {
                                    const file = e.target.files?.[0];
                                    if (file) handleImageUpload(file, 'logo');
                                }}
                                className="hidden"
                            />
                        </label>
                    </div>
                </div>

                {/* Banner Upload */}
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                        <ImageIcon size={16} className="inline ml-1" />
                        صورة الغلاف (Banner)
                    </label>
                    <div className="flex items-center gap-4">
                        {formData.banner_url && (
                            <img 
                                src={formData.banner_url} 
                                alt="Banner" 
                                className="w-32 h-20 object-cover border rounded-lg"
                            />
                        )}
                        <label className="flex-1 cursor-pointer">
                            <div className="border-2 border-dashed border-gray-300 rounded-lg p-4 text-center hover:border-orange-500 transition-colors">
                                <Upload size={20} className="mx-auto mb-2 text-gray-400" />
                                <span className="text-sm text-gray-600">اختر صورة الغلاف</span>
                            </div>
                            <input
                                type="file"
                                accept="image/*"
                                onChange={(e) => {
                                    const file = e.target.files?.[0];
                                    if (file) handleImageUpload(file, 'banner');
                                }}
                                className="hidden"
                            />
                        </label>
                    </div>
                </div>

                {/* Featured Toggle */}
                <div className="flex items-center gap-2">
                    <input
                        type="checkbox"
                        id="is_featured"
                        checked={formData.is_featured || false}
                        onChange={(e) => setFormData({ ...formData, is_featured: e.target.checked })}
                        className="w-4 h-4 text-orange-600 border-gray-300 rounded focus:ring-orange-500"
                    />
                    <label htmlFor="is_featured" className="text-sm font-medium text-gray-700">
                        <Tag size={16} className="inline ml-1" />
                        عرض في الصفحة الرئيسية
                    </label>
                </div>

                {/* Submit Button */}
                <div className="flex gap-3 pt-4">
                    <button
                        type="submit"
                        className="flex-1 bg-orange-500 text-white py-2 px-4 rounded-lg font-medium hover:bg-orange-600 transition-colors flex items-center justify-center gap-2"
                    >
                        <Save size={18} />
                        {editingBrand ? 'حفظ التعديلات' : 'إضافة البراند'}
                    </button>
                    <button
                        type="button"
                        onClick={() => {
                            setShowAddForm(false);
                            setEditingBrand(null);
                        }}
                        className="px-6 py-2 border border-gray-300 rounded-lg font-medium hover:bg-gray-50 transition-colors"
                    >
                        إلغاء
                    </button>
                </div>
            </form>
        </div>
    );

    return (
        <div className="min-h-screen bg-gray-50">
            <AdminHeader />
            
            <div className="max-w-7xl mx-auto px-4 py-6">
                {/* Header */}
                <div className="flex justify-between items-center mb-6">
                    <h1 className="text-2xl font-bold text-gray-900">إدارة البراندات</h1>
                    {!showAddForm && (
                        <button
                            onClick={() => setShowAddForm(true)}
                            className="bg-orange-500 text-white px-4 py-2 rounded-lg font-medium hover:bg-orange-600 transition-colors flex items-center gap-2"
                        >
                            <Plus size={20} />
                            إضافة براند جديد
                        </button>
                    )}
                </div>

                {/* Add/Edit Form */}
                {showAddForm && <BrandForm />}

                {/* Brands List */}
                {loading ? (
                    <div className="text-center py-12">
                        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-500 mx-auto"></div>
                        <p className="text-gray-600 mt-4">جاري تحميل البراندات...</p>
                    </div>
                ) : brands.length === 0 ? (
                    <div className="bg-white rounded-lg shadow-md p-12 text-center">
                        <Tag size={48} className="text-gray-300 mx-auto mb-4" />
                        <h3 className="text-xl font-bold text-gray-900 mb-2">لا توجد براندات</h3>
                        <p className="text-gray-600 mb-4">ابدأ بإضافة براند جديد</p>
                        <button
                            onClick={() => setShowAddForm(true)}
                            className="bg-orange-500 text-white px-6 py-2 rounded-lg font-medium hover:bg-orange-600 transition-colors inline-flex items-center gap-2"
                        >
                            <Plus size={20} />
                            إضافة براند
                        </button>
                    </div>
                ) : (
                    <div className="grid gap-4">
                        {brands.map((brand) => (
                            <div
                                key={brand.id}
                                className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow"
                            >
                                <div className="flex items-center p-4 gap-4">
                                    {/* Logo */}
                                    <div className="flex-shrink-0">
                                        {brand.logo_url ? (
                                            <img
                                                src={brand.logo_url}
                                                alt={brand.name_ar}
                                                className="w-16 h-16 object-contain rounded-lg border"
                                            />
                                        ) : (
                                            <div className="w-16 h-16 bg-gray-100 rounded-lg flex items-center justify-center">
                                                <Tag size={24} className="text-gray-400" />
                                            </div>
                                        )}
                                    </div>

                                    {/* Brand Info */}
                                    <div className="flex-1">
                                        <div className="flex items-center gap-2 mb-1">
                                            <h3 className="text-lg font-bold text-gray-900">{brand.name_ar}</h3>
                                            {brand.is_featured && (
                                                <span className="bg-orange-100 text-orange-600 text-xs px-2 py-1 rounded-full font-medium">
                                                    مميز
                                                </span>
                                            )}
                                        </div>
                                        <p className="text-sm text-gray-600">{brand.name_en}</p>
                                        {brand.products_count !== undefined && (
                                            <p className="text-xs text-gray-500 mt-1">
                                                {brand.products_count} منتج
                                            </p>
                                        )}
                                    </div>

                                    {/* Colors Preview */}
                                    <div className="flex gap-2">
                                        <div
                                            className="w-8 h-8 rounded-lg border shadow-sm"
                                            style={{ backgroundColor: brand.primary_color || '#F57C00' }}
                                            title="اللون الأساسي"
                                        />
                                        <div
                                            className="w-8 h-8 rounded-lg border shadow-sm"
                                            style={{ backgroundColor: brand.secondary_color || '#FF9800' }}
                                            title="اللون الثانوي"
                                        />
                                    </div>

                                    {/* Actions */}
                                    <div className="flex gap-2">
                                        <button
                                            onClick={() => handleEdit(brand)}
                                            className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                                            title="تعديل"
                                        >
                                            <Edit2 size={18} />
                                        </button>
                                        <button
                                            onClick={() => handleDelete(brand.id)}
                                            className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                                            title="حذف"
                                        >
                                            <Trash2 size={18} />
                                        </button>
                                    </div>
                                </div>

                                {/* Banner Preview */}
                                {brand.banner_url && (
                                    <div className="border-t">
                                        <img
                                            src={brand.banner_url}
                                            alt={`${brand.name_ar} banner`}
                                            className="w-full h-32 object-cover"
                                        />
                                    </div>
                                )}
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
};

export default BrandsManager;
