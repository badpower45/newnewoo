import React, { useState, useEffect } from 'react';
import {
    Plus,
    Edit2,
    Trash2,
    Eye,
    EyeOff,
    Save,
    X,
    Image as ImageIcon,
    Link as LinkIcon,
    Monitor,
    Smartphone,
    ArrowUp,
    ArrowDown,
    BarChart,
    Upload,
    Palette
} from 'lucide-react';
import AdminLayout from './AdminLayout';

interface HeroButton {
    text_en: string;
    text_ar: string;
    link: string;
    color: string;
    enabled: boolean;
}

interface HeroSection {
    id?: number;
    title_en: string;
    title_ar: string;
    subtitle_en: string;
    subtitle_ar: string;
    description_en: string;
    description_ar: string;
    image_url: string;
    mobile_image_url?: string;
    image_alt_en: string;
    image_alt_ar: string;
    button1_text_en?: string;
    button1_text_ar?: string;
    button1_link?: string;
    button1_color?: string;
    button1_enabled: boolean;
    button2_text_en?: string;
    button2_text_ar?: string;
    button2_link?: string;
    button2_color?: string;
    button2_enabled: boolean;
    display_order: number;
    is_active: boolean;
    show_on_mobile: boolean;
    show_on_desktop: boolean;
    background_color: string;
    text_color: string;
    overlay_opacity: number;
    animation_type: string;
    animation_duration: number;
    click_count?: number;
    view_count?: number;
}

const defaultHeroSection: HeroSection = {
    title_en: '',
    title_ar: '',
    subtitle_en: '',
    subtitle_ar: '',
    description_en: '',
    description_ar: '',
    image_url: '',
    mobile_image_url: '',
    image_alt_en: '',
    image_alt_ar: '',
    button1_enabled: false,
    button2_enabled: false,
    display_order: 0,
    is_active: true,
    show_on_mobile: true,
    show_on_desktop: true,
    background_color: '#FFFFFF',
    text_color: '#000000',
    overlay_opacity: 0,
    animation_type: 'fade',
    animation_duration: 5000
};

export default function HeroSectionsManager() {
    const [heroSections, setHeroSections] = useState<HeroSection[]>([]);
    const [loading, setLoading] = useState(true);
    const [showModal, setShowModal] = useState(false);
    const [editingSection, setEditingSection] = useState<HeroSection | null>(null);
    const [formData, setFormData] = useState<HeroSection>(defaultHeroSection);
    const [imageFile, setImageFile] = useState<File | null>(null);
    const [mobileImageFile, setMobileImageFile] = useState<File | null>(null);
    const [imagePreview, setImagePreview] = useState<string>('');
    const [mobileImagePreview, setMobileImagePreview] = useState<string>('');
    const [uploading, setUploading] = useState(false);
    const [activeTab, setActiveTab] = useState<'content' | 'design' | 'buttons'>('content');

    const API_URL = 'https://bkaa.vercel.app';

    useEffect(() => {
        fetchHeroSections();
    }, []);

    const fetchHeroSections = async () => {
        try {
            const token = localStorage.getItem('token');
            console.log('🔍 Fetching hero sections from:', `${API_URL}/api/hero-sections?all=true`);
            const response = await fetch(`${API_URL}/api/hero-sections?all=true`, {
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });
            
            if (!response.ok) {
                console.error('❌ Response not OK:', response.status, response.statusText);
            }
            
            const data = await response.json();
            console.log('📦 Received data:', data);
            
            if (data.success) {
                setHeroSections(data.data || []);
                console.log('✅ Hero sections loaded:', data.data?.length || 0);
            } else {
                console.error('❌ API returned error:', data.message);
                alert('خطأ في تحميل البيانات: ' + (data.message || 'Unknown error'));
            }
        } catch (error) {
            console.error('❌ Error fetching hero sections:', error);
            alert('فشل الاتصال بالسيرفر. تحقق من اتصال الإنترنت.');
        } finally {
            setLoading(false);
        }
    };

    const handleImageSelect = (e: React.ChangeEvent<HTMLInputElement>, isMobile: boolean = false) => {
        const file = e.target.files?.[0];
        if (file) {
            if (isMobile) {
                setMobileImageFile(file);
                setMobileImagePreview(URL.createObjectURL(file));
            } else {
                setImageFile(file);
                setImagePreview(URL.createObjectURL(file));
            }
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setUploading(true);

        try {
            const token = localStorage.getItem('token');
            const formDataToSend = new FormData();

            // Add all text fields
            Object.keys(formData).forEach(key => {
                const value = formData[key as keyof HeroSection];
                if (value !== null && value !== undefined && value !== '') {
                    formDataToSend.append(key, String(value));
                }
            });

            // Add images if selected
            if (imageFile) {
                formDataToSend.append('image', imageFile);
            }
            if (mobileImageFile) {
                formDataToSend.append('mobile_image', mobileImageFile);
            }

            const url = editingSection
                ? `${API_URL}/api/hero-sections/${editingSection.id}`
                : `${API_URL}/api/hero-sections`;

            const response = await fetch(url, {
                method: editingSection ? 'PUT' : 'POST',
                headers: {
                    'Authorization': `Bearer ${token}`
                },
                body: formDataToSend
            });

            const data = await response.json();

            if (data.success) {
                alert(editingSection ? 'تم التحديث بنجاح' : 'تم الإنشاء بنجاح');
                setShowModal(false);
                resetForm();
                fetchHeroSections();
            } else {
                alert('حدث خطأ: ' + data.message);
            }
        } catch (error) {
            console.error('Error saving hero section:', error);
            alert('حدث خطأ في الحفظ');
        } finally {
            setUploading(false);
        }
    };

    const handleDelete = async (id: number) => {
        if (!confirm('هل أنت متأكد من الحذف؟')) return;

        try {
            const token = localStorage.getItem('token');
            const response = await fetch(`${API_URL}/api/hero-sections/${id}`, {
                method: 'DELETE',
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });

            const data = await response.json();
            if (data.success) {
                alert('تم الحذف بنجاح');
                fetchHeroSections();
            }
        } catch (error) {
            console.error('Error deleting hero section:', error);
            alert('حدث خطأ في الحذف');
        }
    };

    const handleEdit = (section: HeroSection) => {
        setEditingSection(section);
        setFormData(section);
        setImagePreview(section.image_url);
        setMobileImagePreview(section.mobile_image_url || '');
        setShowModal(true);
    };

    const resetForm = () => {
        setEditingSection(null);
        setFormData(defaultHeroSection);
        setImageFile(null);
        setMobileImageFile(null);
        setImagePreview('');
        setMobileImagePreview('');
    };

    const moveSection = async (id: number, direction: 'up' | 'down') => {
        const currentIndex = heroSections.findIndex(s => s.id === id);
        if (currentIndex === -1) return;
        
        const newIndex = direction === 'up' ? currentIndex - 1 : currentIndex + 1;
        if (newIndex < 0 || newIndex >= heroSections.length) return;

        const newSections = [...heroSections];
        [newSections[currentIndex], newSections[newIndex]] = [newSections[newIndex], newSections[currentIndex]];
        
        const orders = newSections.map((section, index) => ({
            id: section.id,
            display_order: index
        }));

        try {
            const token = localStorage.getItem('token');
            await fetch(`${API_URL}/api/hero-sections/reorder`, {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ orders })
            });
            
            setHeroSections(newSections);
        } catch (error) {
            console.error('Error reordering:', error);
        }
    };

    if (loading) {
        return (
            <AdminLayout>
                <div className="flex items-center justify-center h-64">
                    <div className="text-xl">جاري التحميل...</div>
                </div>
            </AdminLayout>
        );
    }

    return (
        <AdminLayout>
            <div className="p-6 max-w-7xl mx-auto" dir="rtl">
                {/* Header */}
                <div className="flex justify-between items-center mb-6">
                    <div>
                        <h1 className="text-3xl font-bold text-gray-900">إدارة Hero Sections</h1>
                        <p className="text-gray-600 mt-1">إدارة البانرات الرئيسية للصفحة الرئيسية</p>
                    </div>
                    <button
                        onClick={() => {
                            resetForm();
                            setShowModal(true);
                        }}
                        className="bg-green-600 hover:bg-green-700 text-white px-6 py-3 rounded-lg flex items-center gap-2 transition-colors"
                    >
                        <Plus size={20} />
                        <span>إضافة Hero Section جديد</span>
                    </button>
                </div>

                {/* Hero Sections List */}
                <div className="space-y-4">
                    {heroSections.length === 0 ? (
                        <div className="bg-white rounded-lg shadow p-12 text-center">
                            <ImageIcon size={64} className="mx-auto text-gray-400 mb-4" />
                            <p className="text-gray-600 text-lg">لا توجد Hero Sections حتى الآن</p>
                            <p className="text-gray-500 mt-2">ابدأ بإضافة أول Hero Section</p>
                        </div>
                    ) : (
                        heroSections.map((section, index) => (
                            <div
                                key={section.id}
                                className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow"
                            >
                                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 p-4">
                                    {/* Image Preview */}
                                    <div className="md:col-span-1">
                                        <img
                                            src={section.image_url}
                                            alt={section.image_alt_ar || section.title_ar}
                                            className="w-full h-48 object-cover rounded-lg"
                                        />
                                    </div>

                                    {/* Content */}
                                    <div className="md:col-span-2 flex flex-col justify-between">
                                        <div>
                                            <div className="flex items-start justify-between mb-2">
                                                <div className="flex-1">
                                                    <h3 className="text-xl font-bold text-gray-900">
                                                        {section.title_ar || section.title_en}
                                                    </h3>
                                                    <p className="text-gray-600">
                                                        {section.subtitle_ar || section.subtitle_en}
                                                    </p>
                                                </div>
                                                <div className="flex gap-2 mr-4">
                                                    {section.show_on_desktop && (
                                                        <Monitor size={20} className="text-blue-600" title="يظهر على سطح المكتب" />
                                                    )}
                                                    {section.show_on_mobile && (
                                                        <Smartphone size={20} className="text-green-600" title="يظهر على الموبايل" />
                                                    )}
                                                </div>
                                            </div>

                                            <p className="text-gray-500 text-sm mb-3">
                                                {section.description_ar || section.description_en}
                                            </p>

                                            {/* Buttons Preview */}
                                            <div className="flex gap-2 flex-wrap mb-3">
                                                {section.button1_enabled && section.button1_text_ar && (
                                                    <span
                                                        className="px-4 py-2 rounded text-white text-sm"
                                                        style={{ backgroundColor: section.button1_color || '#FF6B6B' }}
                                                    >
                                                        {section.button1_text_ar} →
                                                    </span>
                                                )}
                                                {section.button2_enabled && section.button2_text_ar && (
                                                    <span
                                                        className="px-4 py-2 rounded text-white text-sm"
                                                        style={{ backgroundColor: section.button2_color || '#4ECDC4' }}
                                                    >
                                                        {section.button2_text_ar} →
                                                    </span>
                                                )}
                                            </div>

                                            {/* Stats */}
                                            {(section.view_count || section.click_count) && (
                                                <div className="flex gap-4 text-sm text-gray-500">
                                                    {section.view_count > 0 && (
                                                        <span className="flex items-center gap-1">
                                                            <Eye size={16} />
                                                            {section.view_count} مشاهدة
                                                        </span>
                                                    )}
                                                    {section.click_count > 0 && (
                                                        <span className="flex items-center gap-1">
                                                            <BarChart size={16} />
                                                            {section.click_count} نقرة
                                                        </span>
                                                    )}
                                                </div>
                                            )}
                                        </div>

                                        {/* Actions */}
                                        <div className="flex gap-2 mt-4">
                                            <button
                                                onClick={() => handleEdit(section)}
                                                className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded flex items-center gap-2 transition-colors"
                                            >
                                                <Edit2 size={16} />
                                                تعديل
                                            </button>
                                            <button
                                                onClick={() => handleDelete(section.id!)}
                                                className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded flex items-center gap-2 transition-colors"
                                            >
                                                <Trash2 size={16} />
                                                حذف
                                            </button>
                                            <button
                                                onClick={() => moveSection(section.id!, 'up')}
                                                disabled={index === 0}
                                                className="bg-gray-600 hover:bg-gray-700 text-white px-3 py-2 rounded disabled:opacity-50 disabled:cursor-not-allowed"
                                            >
                                                <ArrowUp size={16} />
                                            </button>
                                            <button
                                                onClick={() => moveSection(section.id!, 'down')}
                                                disabled={index === heroSections.length - 1}
                                                className="bg-gray-600 hover:bg-gray-700 text-white px-3 py-2 rounded disabled:opacity-50 disabled:cursor-not-allowed"
                                            >
                                                <ArrowDown size={16} />
                                            </button>
                                            <div className="flex-1"></div>
                                            <span className={`px-3 py-2 rounded text-sm ${section.is_active ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'}`}>
                                                {section.is_active ? 'نشط' : 'غير نشط'}
                                            </span>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        ))
                    )}
                </div>

                {/* Modal for Add/Edit */}
                {showModal && (
                    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
                        <div className="bg-white rounded-lg max-w-4xl w-full max-h-[90vh] overflow-y-auto">
                            <div className="sticky top-0 bg-white border-b px-6 py-4 flex justify-between items-center">
                                <h2 className="text-2xl font-bold">
                                    {editingSection ? 'تعديل Hero Section' : 'إضافة Hero Section جديد'}
                                </h2>
                                <button
                                    onClick={() => {
                                        setShowModal(false);
                                        resetForm();
                                    }}
                                    className="text-gray-500 hover:text-gray-700"
                                >
                                    <X size={24} />
                                </button>
                            </div>

                            <form onSubmit={handleSubmit} className="p-6">
                                {/* Tabs */}
                                <div className="flex gap-2 mb-6 border-b">
                                    <button
                                        type="button"
                                        onClick={() => setActiveTab('content')}
                                        className={`px-4 py-2 font-medium transition-colors ${
                                            activeTab === 'content'
                                                ? 'border-b-2 border-green-600 text-green-600'
                                                : 'text-gray-600 hover:text-gray-900'
                                        }`}
                                    >
                                        المحتوى والنصوص
                                    </button>
                                    <button
                                        type="button"
                                        onClick={() => setActiveTab('design')}
                                        className={`px-4 py-2 font-medium transition-colors ${
                                            activeTab === 'design'
                                                ? 'border-b-2 border-green-600 text-green-600'
                                                : 'text-gray-600 hover:text-gray-900'
                                        }`}
                                    >
                                        التصميم والألوان
                                    </button>
                                    <button
                                        type="button"
                                        onClick={() => setActiveTab('buttons')}
                                        className={`px-4 py-2 font-medium transition-colors ${
                                            activeTab === 'buttons'
                                                ? 'border-b-2 border-green-600 text-green-600'
                                                : 'text-gray-600 hover:text-gray-900'
                                        }`}
                                    >
                                        الأزرار والروابط
                                    </button>
                                </div>

                                {/* Content Tab */}
                                {activeTab === 'content' && (
                                    <div className="space-y-4">
                                        <div className="grid grid-cols-2 gap-4">
                                            <div>
                                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                                    العنوان (عربي) *
                                                </label>
                                                <input
                                                    type="text"
                                                    value={formData.title_ar}
                                                    onChange={(e) => setFormData({ ...formData, title_ar: e.target.value })}
                                                    className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-green-500 focus:border-transparent"
                                                    required
                                                />
                                            </div>
                                            <div>
                                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                                    العنوان (English)
                                                </label>
                                                <input
                                                    type="text"
                                                    value={formData.title_en}
                                                    onChange={(e) => setFormData({ ...formData, title_en: e.target.value })}
                                                    className="w-full border border-gray-300 rounded-lg px-4 py-2"
                                                />
                                            </div>
                                        </div>

                                        <div className="grid grid-cols-2 gap-4">
                                            <div>
                                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                                    العنوان الفرعي (عربي)
                                                </label>
                                                <input
                                                    type="text"
                                                    value={formData.subtitle_ar}
                                                    onChange={(e) => setFormData({ ...formData, subtitle_ar: e.target.value })}
                                                    className="w-full border border-gray-300 rounded-lg px-4 py-2"
                                                />
                                            </div>
                                            <div>
                                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                                    العنوان الفرعي (English)
                                                </label>
                                                <input
                                                    type="text"
                                                    value={formData.subtitle_en}
                                                    onChange={(e) => setFormData({ ...formData, subtitle_en: e.target.value })}
                                                    className="w-full border border-gray-300 rounded-lg px-4 py-2"
                                                />
                                            </div>
                                        </div>

                                        <div className="grid grid-cols-2 gap-4">
                                            <div>
                                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                                    الوصف (عربي)
                                                </label>
                                                <textarea
                                                    value={formData.description_ar}
                                                    onChange={(e) => setFormData({ ...formData, description_ar: e.target.value })}
                                                    className="w-full border border-gray-300 rounded-lg px-4 py-2"
                                                    rows={3}
                                                />
                                            </div>
                                            <div>
                                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                                    الوصف (English)
                                                </label>
                                                <textarea
                                                    value={formData.description_en}
                                                    onChange={(e) => setFormData({ ...formData, description_en: e.target.value })}
                                                    className="w-full border border-gray-300 rounded-lg px-4 py-2"
                                                    rows={3}
                                                />
                                            </div>
                                        </div>

                                        {/* Image Upload */}
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                                الصورة الرئيسية *
                                            </label>
                                            <div className="flex gap-4">
                                                <div className="flex-1">
                                                    <input
                                                        type="text"
                                                        placeholder="رابط الصورة"
                                                        value={formData.image_url}
                                                        onChange={(e) => setFormData({ ...formData, image_url: e.target.value })}
                                                        className="w-full border border-gray-300 rounded-lg px-4 py-2"
                                                    />
                                                </div>
                                                <div>
                                                    <label className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg cursor-pointer flex items-center gap-2">
                                                        <Upload size={20} />
                                                        رفع صورة
                                                        <input
                                                            type="file"
                                                            accept="image/*"
                                                            onChange={(e) => handleImageSelect(e, false)}
                                                            className="hidden"
                                                        />
                                                    </label>
                                                </div>
                                            </div>
                                            {imagePreview && (
                                                <img src={imagePreview} alt="Preview" className="mt-2 h-40 w-full object-cover rounded-lg" />
                                            )}
                                        </div>

                                        {/* Mobile Image Upload */}
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                                صورة الموبايل (اختياري)
                                            </label>
                                            <div className="flex gap-4">
                                                <div className="flex-1">
                                                    <input
                                                        type="text"
                                                        placeholder="رابط صورة الموبايل"
                                                        value={formData.mobile_image_url}
                                                        onChange={(e) => setFormData({ ...formData, mobile_image_url: e.target.value })}
                                                        className="w-full border border-gray-300 rounded-lg px-4 py-2"
                                                    />
                                                </div>
                                                <div>
                                                    <label className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg cursor-pointer flex items-center gap-2">
                                                        <Upload size={20} />
                                                        رفع صورة
                                                        <input
                                                            type="file"
                                                            accept="image/*"
                                                            onChange={(e) => handleImageSelect(e, true)}
                                                            className="hidden"
                                                        />
                                                    </label>
                                                </div>
                                            </div>
                                            {mobileImagePreview && (
                                                <img src={mobileImagePreview} alt="Mobile Preview" className="mt-2 h-40 w-full object-cover rounded-lg" />
                                            )}
                                        </div>
                                    </div>
                                )}

                                {/* Design Tab */}
                                {activeTab === 'design' && (
                                    <div className="space-y-4">
                                        <div className="grid grid-cols-3 gap-4">
                                            <div>
                                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                                    لون الخلفية
                                                </label>
                                                <input
                                                    type="color"
                                                    value={formData.background_color}
                                                    onChange={(e) => setFormData({ ...formData, background_color: e.target.value })}
                                                    className="w-full h-10 border border-gray-300 rounded-lg"
                                                />
                                            </div>
                                            <div>
                                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                                    لون النص
                                                </label>
                                                <input
                                                    type="color"
                                                    value={formData.text_color}
                                                    onChange={(e) => setFormData({ ...formData, text_color: e.target.value })}
                                                    className="w-full h-10 border border-gray-300 rounded-lg"
                                                />
                                            </div>
                                            <div>
                                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                                    شفافية الخلفية (0-1)
                                                </label>
                                                <input
                                                    type="number"
                                                    step="0.1"
                                                    min="0"
                                                    max="1"
                                                    value={formData.overlay_opacity}
                                                    onChange={(e) => setFormData({ ...formData, overlay_opacity: parseFloat(e.target.value) })}
                                                    className="w-full border border-gray-300 rounded-lg px-4 py-2"
                                                />
                                            </div>
                                        </div>

                                        <div className="grid grid-cols-2 gap-4">
                                            <div>
                                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                                    نوع الأنيميشن
                                                </label>
                                                <select
                                                    value={formData.animation_type}
                                                    onChange={(e) => setFormData({ ...formData, animation_type: e.target.value })}
                                                    className="w-full border border-gray-300 rounded-lg px-4 py-2"
                                                >
                                                    <option value="fade">Fade</option>
                                                    <option value="slide">Slide</option>
                                                    <option value="zoom">Zoom</option>
                                                    <option value="none">None</option>
                                                </select>
                                            </div>
                                            <div>
                                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                                    مدة الأنيميشن (ms)
                                                </label>
                                                <input
                                                    type="number"
                                                    value={formData.animation_duration}
                                                    onChange={(e) => setFormData({ ...formData, animation_duration: parseInt(e.target.value) })}
                                                    className="w-full border border-gray-300 rounded-lg px-4 py-2"
                                                />
                                            </div>
                                        </div>

                                        <div className="flex gap-6">
                                            <label className="flex items-center gap-2">
                                                <input
                                                    type="checkbox"
                                                    checked={formData.is_active}
                                                    onChange={(e) => setFormData({ ...formData, is_active: e.target.checked })}
                                                    className="w-5 h-5"
                                                />
                                                <span>نشط</span>
                                            </label>
                                            <label className="flex items-center gap-2">
                                                <input
                                                    type="checkbox"
                                                    checked={formData.show_on_desktop}
                                                    onChange={(e) => setFormData({ ...formData, show_on_desktop: e.target.checked })}
                                                    className="w-5 h-5"
                                                />
                                                <span>عرض على سطح المكتب</span>
                                            </label>
                                            <label className="flex items-center gap-2">
                                                <input
                                                    type="checkbox"
                                                    checked={formData.show_on_mobile}
                                                    onChange={(e) => setFormData({ ...formData, show_on_mobile: e.target.checked })}
                                                    className="w-5 h-5"
                                                />
                                                <span>عرض على الموبايل</span>
                                            </label>
                                        </div>

                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                                ترتيب العرض
                                            </label>
                                            <input
                                                type="number"
                                                value={formData.display_order}
                                                onChange={(e) => setFormData({ ...formData, display_order: parseInt(e.target.value) })}
                                                className="w-full border border-gray-300 rounded-lg px-4 py-2"
                                            />
                                        </div>
                                    </div>
                                )}

                                {/* Buttons Tab */}
                                {activeTab === 'buttons' && (
                                    <div className="space-y-6">
                                        {/* Button 1 */}
                                        <div className="border border-gray-300 rounded-lg p-4">
                                            <div className="flex items-center justify-between mb-4">
                                                <h3 className="font-bold text-lg">الزر الأول</h3>
                                                <label className="flex items-center gap-2">
                                                    <input
                                                        type="checkbox"
                                                        checked={formData.button1_enabled}
                                                        onChange={(e) => setFormData({ ...formData, button1_enabled: e.target.checked })}
                                                        className="w-5 h-5"
                                                    />
                                                    <span>مفعّل</span>
                                                </label>
                                            </div>

                                            {formData.button1_enabled && (
                                                <div className="space-y-3">
                                                    <div className="grid grid-cols-2 gap-4">
                                                        <div>
                                                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                                                نص الزر (عربي)
                                                            </label>
                                                            <input
                                                                type="text"
                                                                value={formData.button1_text_ar}
                                                                onChange={(e) => setFormData({ ...formData, button1_text_ar: e.target.value })}
                                                                className="w-full border border-gray-300 rounded-lg px-4 py-2"
                                                            />
                                                        </div>
                                                        <div>
                                                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                                                نص الزر (English)
                                                            </label>
                                                            <input
                                                                type="text"
                                                                value={formData.button1_text_en}
                                                                onChange={(e) => setFormData({ ...formData, button1_text_en: e.target.value })}
                                                                className="w-full border border-gray-300 rounded-lg px-4 py-2"
                                                            />
                                                        </div>
                                                    </div>
                                                    <div className="grid grid-cols-2 gap-4">
                                                        <div>
                                                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                                                الرابط
                                                            </label>
                                                            <input
                                                                type="text"
                                                                placeholder="/products أو https://..."
                                                                value={formData.button1_link}
                                                                onChange={(e) => setFormData({ ...formData, button1_link: e.target.value })}
                                                                className="w-full border border-gray-300 rounded-lg px-4 py-2"
                                                            />
                                                        </div>
                                                        <div>
                                                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                                                لون الزر
                                                            </label>
                                                            <input
                                                                type="color"
                                                                value={formData.button1_color}
                                                                onChange={(e) => setFormData({ ...formData, button1_color: e.target.value })}
                                                                className="w-full h-10 border border-gray-300 rounded-lg"
                                                            />
                                                        </div>
                                                    </div>
                                                </div>
                                            )}
                                        </div>

                                        {/* Button 2 */}
                                        <div className="border border-gray-300 rounded-lg p-4">
                                            <div className="flex items-center justify-between mb-4">
                                                <h3 className="font-bold text-lg">الزر الثاني</h3>
                                                <label className="flex items-center gap-2">
                                                    <input
                                                        type="checkbox"
                                                        checked={formData.button2_enabled}
                                                        onChange={(e) => setFormData({ ...formData, button2_enabled: e.target.checked })}
                                                        className="w-5 h-5"
                                                    />
                                                    <span>مفعّل</span>
                                                </label>
                                            </div>

                                            {formData.button2_enabled && (
                                                <div className="space-y-3">
                                                    <div className="grid grid-cols-2 gap-4">
                                                        <div>
                                                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                                                نص الزر (عربي)
                                                            </label>
                                                            <input
                                                                type="text"
                                                                value={formData.button2_text_ar}
                                                                onChange={(e) => setFormData({ ...formData, button2_text_ar: e.target.value })}
                                                                className="w-full border border-gray-300 rounded-lg px-4 py-2"
                                                            />
                                                        </div>
                                                        <div>
                                                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                                                نص الزر (English)
                                                            </label>
                                                            <input
                                                                type="text"
                                                                value={formData.button2_text_en}
                                                                onChange={(e) => setFormData({ ...formData, button2_text_en: e.target.value })}
                                                                className="w-full border border-gray-300 rounded-lg px-4 py-2"
                                                            />
                                                        </div>
                                                    </div>
                                                    <div className="grid grid-cols-2 gap-4">
                                                        <div>
                                                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                                                الرابط
                                                            </label>
                                                            <input
                                                                type="text"
                                                                placeholder="/products أو https://..."
                                                                value={formData.button2_link}
                                                                onChange={(e) => setFormData({ ...formData, button2_link: e.target.value })}
                                                                className="w-full border border-gray-300 rounded-lg px-4 py-2"
                                                            />
                                                        </div>
                                                        <div>
                                                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                                                لون الزر
                                                            </label>
                                                            <input
                                                                type="color"
                                                                value={formData.button2_color}
                                                                onChange={(e) => setFormData({ ...formData, button2_color: e.target.value })}
                                                                className="w-full h-10 border border-gray-300 rounded-lg"
                                                            />
                                                        </div>
                                                    </div>
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                )}

                                {/* Submit Buttons */}
                                <div className="flex gap-3 mt-6 pt-6 border-t">
                                    <button
                                        type="submit"
                                        disabled={uploading}
                                        className="flex-1 bg-green-600 hover:bg-green-700 text-white px-6 py-3 rounded-lg flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                                    >
                                        {uploading ? (
                                            <>
                                                <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                                                <span>جاري الحفظ...</span>
                                            </>
                                        ) : (
                                            <>
                                                <Save size={20} />
                                                <span>{editingSection ? 'تحديث' : 'حفظ'}</span>
                                            </>
                                        )}
                                    </button>
                                    <button
                                        type="button"
                                        onClick={() => {
                                            setShowModal(false);
                                            resetForm();
                                        }}
                                        className="px-6 py-3 border border-gray-300 rounded-lg hover:bg-gray-100"
                                    >
                                        إلغاء
                                    </button>
                                </div>
                            </form>
                        </div>
                    </div>
                )}
            </div>
        </AdminLayout>
    );
}
