import React, { useState, useEffect, useRef, useCallback } from 'react';
import {
    Plus,
    Edit2,
    Trash2,
    Eye,
    EyeOff,
    Save,
    X,
    Image as ImageIcon,
    Monitor,
    Smartphone,
    ArrowUp,
    ArrowDown,
    Upload,
    RefreshCw,
    ToggleLeft,
    ToggleRight
} from 'lucide-react';
import { api } from '../../services/api';

interface HeroSection {
    id?: number;
    title_en: string;
    title_ar: string;
    subtitle_en: string;
    subtitle_ar: string;
    description_en: string;
    description_ar: string;
    image_url: string;
    mobile_image_url: string;
    image_alt_ar: string;
    button1_text_ar: string;
    button1_link: string;
    button1_color: string;
    button1_enabled: boolean;
    button2_text_ar: string;
    button2_link: string;
    button2_color: string;
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

const defaultSection = (): HeroSection => ({
    title_en: '',
    title_ar: '',
    subtitle_en: '',
    subtitle_ar: '',
    description_en: '',
    description_ar: '',
    image_url: '',
    mobile_image_url: '',
    image_alt_ar: '',
    button1_text_ar: '',
    button1_link: '',
    button1_color: '#F97316',
    button1_enabled: false,
    button2_text_ar: '',
    button2_link: '',
    button2_color: '#22C55E',
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
});

export default function HeroSectionsManager() {
    const [sections, setSections] = useState<HeroSection[]>([]);
    const [loading, setLoading] = useState(true);
    const [showModal, setShowModal] = useState(false);
    const [editingSection, setEditingSection] = useState<HeroSection | null>(null);
    const [formData, setFormData] = useState<HeroSection>(defaultSection());
    const [saving, setSaving] = useState(false);
    const [uploadingMain, setUploadingMain] = useState(false);
    const [uploadingMobile, setUploadingMobile] = useState(false);
    const [activeTab, setActiveTab] = useState<'content' | 'design' | 'buttons'>('content');
    const [error, setError] = useState('');
    const mainFileRef = useRef<HTMLInputElement>(null);
    const mobileFileRef = useRef<HTMLInputElement>(null);

    useEffect(() => { fetchSections(); }, []);

    const fetchSections = async () => {
        setLoading(true);
        setError('');
        try {
            const data = await api.heroSections.getAll({ all: true });
            const list: HeroSection[] = Array.isArray(data)
                ? data
                : Array.isArray(data?.data) ? data.data : [];
            setSections(list);
        } catch (e: any) {
            console.error('fetchSections error:', e);
            setError('فشل تحميل البانرات');
        } finally {
            setLoading(false);
        }
    };

    // ── Image upload ─────────────────────────────────────────
    const uploadImage = useCallback(async (file: File, field: 'image_url' | 'mobile_image_url') => {
        if (!file.type.startsWith('image/')) { alert('اختار صورة صحيحة'); return; }
        if (field === 'image_url') setUploadingMain(true);
        else setUploadingMobile(true);
        try {
            const url = await api.images.upload(file);
            setFormData(prev => ({ ...prev, [field]: url }));
        } catch {
            alert('فشل رفع الصورة، حاول تاني');
        } finally {
            setUploadingMain(false);
            setUploadingMobile(false);
        }
    }, []);

    const handleFilePick = (field: 'image_url' | 'mobile_image_url') =>
        (e: React.ChangeEvent<HTMLInputElement>) => {
            const file = e.target.files?.[0];
            if (file) uploadImage(file, field);
            e.target.value = '';
        };

    // ── CRUD ──────────────────────────────────────────────────
    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!formData.title_ar.trim()) { alert('العنوان بالعربي مطلوب'); return; }
        if (!formData.image_url.trim()) { alert('الصورة الرئيسية مطلوبة'); return; }

        setSaving(true);
        try {
            const payload = { ...formData };
            // Remove id from payload if creating
            if (!editingSection) delete payload.id;

            let result;
            if (editingSection?.id) {
                result = await api.heroSections.update(editingSection.id, payload);
            } else {
                result = await api.heroSections.create(payload);
            }

            if (result?.success === false) {
                throw new Error(result?.error || result?.message || 'حدث خطأ في الحفظ');
            }

            setShowModal(false);
            resetForm();
            fetchSections();
        } catch (err: any) {
            console.error('Save error:', err);
            alert('فشل في الحفظ: ' + (err?.message || 'خطأ غير معروف'));
        } finally {
            setSaving(false);
        }
    };

    const handleDelete = async (id: number) => {
        if (!confirm('هل أنت متأكد من حذف هذا البانر؟')) return;
        try {
            await api.heroSections.delete(id);
            setSections(prev => prev.filter(s => s.id !== id));
        } catch {
            alert('فشل في الحذف');
        }
    };

    const handleToggleActive = async (section: HeroSection) => {
        try {
            await api.heroSections.update(section.id!, { is_active: !section.is_active });
            setSections(prev => prev.map(s => s.id === section.id ? { ...s, is_active: !s.is_active } : s));
        } catch {
            alert('فشل تغيير الحالة');
        }
    };

    const handleEdit = (section: HeroSection) => {
        setEditingSection(section);
        setFormData({ ...defaultSection(), ...section });
        setActiveTab('content');
        setShowModal(true);
    };

    const resetForm = () => {
        setEditingSection(null);
        setFormData(defaultSection());
        setActiveTab('content');
    };

    const moveSection = async (id: number, direction: 'up' | 'down') => {
        const idx = sections.findIndex(s => s.id === id);
        if (idx === -1) return;
        const newIdx = direction === 'up' ? idx - 1 : idx + 1;
        if (newIdx < 0 || newIdx >= sections.length) return;

        const updated = [...sections];
        [updated[idx], updated[newIdx]] = [updated[newIdx], updated[idx]];

        const orders = updated.map((s, i) => ({ id: s.id!, display_order: i }));
        setSections(updated);
        try {
            await api.heroSections.reorder(orders);
        } catch {
            fetchSections(); // revert on fail
        }
    };

    const set = (field: keyof HeroSection, value: any) =>
        setFormData(prev => ({ ...prev, [field]: value }));

    // ── Upload Zone ───────────────────────────────────────────
    const ImageUploadZone = ({ field, uploading }: { field: 'image_url' | 'mobile_image_url'; uploading: boolean }) => {
        const ref = field === 'image_url' ? mainFileRef : mobileFileRef;
        const url = formData[field];
        return (
            <div
                onClick={() => ref.current?.click()}
                className={`relative flex flex-col items-center justify-center w-full h-36 border-2 border-dashed rounded-xl cursor-pointer transition-colors ${
                    url ? 'border-transparent' : 'border-gray-300 hover:border-[#F97316] hover:bg-orange-50/40'
                }`}
            >
                <input ref={ref} type="file" accept="image/*" className="hidden" onChange={handleFilePick(field)} />
                {uploading ? (
                    <div className="flex flex-col items-center gap-2 text-[#F97316]">
                        <RefreshCw className="w-6 h-6 animate-spin" />
                        <span className="text-sm">جاري الرفع...</span>
                    </div>
                ) : url ? (
                    <div className="relative w-full h-full">
                        <img src={url} alt="preview" className="w-full h-full object-cover rounded-xl" />
                        <div className="absolute inset-0 bg-black/40 opacity-0 hover:opacity-100 transition-opacity flex items-center justify-center rounded-xl">
                            <span className="text-white text-sm font-medium flex items-center gap-1"><Upload className="w-4 h-4" /> تغيير</span>
                        </div>
                    </div>
                ) : (
                    <div className="flex flex-col items-center gap-2 text-gray-400">
                        <Upload className="w-6 h-6" />
                        <span className="text-sm text-gray-600">اسحب صورة أو اضغط للرفع</span>
                        <span className="text-xs">JPG · PNG · WebP</span>
                    </div>
                )}
            </div>
        );
    };

    // ── Render ────────────────────────────────────────────────
    if (loading) return (
        <div className="flex items-center justify-center h-64">
            <RefreshCw className="w-8 h-8 animate-spin text-[#F97316]" />
        </div>
    );

    return (
        <div className="p-6 max-w-5xl mx-auto" dir="rtl">
            {/* Header */}
            <div className="flex justify-between items-center mb-6">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900">إدارة الهيرو بانرز</h1>
                    <p className="text-gray-500 mt-1">البانرات الرئيسية في الصفحة الرئيسية</p>
                </div>
                <div className="flex gap-2">
                    <button onClick={fetchSections} className="p-2 text-gray-600 hover:bg-gray-100 rounded-lg" title="تحديث">
                        <RefreshCw className="w-5 h-5" />
                    </button>
                    <button
                        onClick={() => { resetForm(); setShowModal(true); }}
                        className="flex items-center gap-2 px-4 py-2 bg-[#F97316] text-white rounded-lg hover:bg-[#EA580C] transition-colors"
                    >
                        <Plus className="w-5 h-5" />
                        إضافة بانر
                    </button>
                </div>
            </div>

            {error && <p className="text-red-600 bg-red-50 rounded-lg p-3 mb-4">{error}</p>}

            {/* List */}
            {sections.length === 0 ? (
                <div className="bg-white rounded-xl p-16 text-center shadow-sm">
                    <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                        <ImageIcon className="w-8 h-8 text-gray-400" />
                    </div>
                    <p className="text-gray-600 text-lg font-medium mb-1">لا توجد بانرات</p>
                    <p className="text-gray-400 text-sm mb-4">ابدأ بإضافة أول بانر للصفحة الرئيسية</p>
                    <button
                        onClick={() => { resetForm(); setShowModal(true); }}
                        className="inline-flex items-center gap-2 px-4 py-2 bg-[#F97316] text-white rounded-lg hover:bg-[#EA580C] transition-colors"
                    >
                        <Plus className="w-5 h-5" />
                        إضافة بانر
                    </button>
                </div>
            ) : (
                <div className="space-y-4">
                    {sections.map((section, index) => (
                        <div
                            key={section.id}
                            className={`bg-white rounded-xl shadow-sm overflow-hidden hover:shadow-md transition-shadow ${!section.is_active ? 'opacity-60' : ''}`}
                        >
                            <div className="flex gap-4 p-4">
                                {/* Thumbnail */}
                                <div className="shrink-0 w-40 h-24 rounded-lg overflow-hidden bg-gray-100">
                                    {section.image_url ? (
                                        <img src={section.image_url} alt={section.title_ar} className="w-full h-full object-cover" />
                                    ) : (
                                        <div className="w-full h-full flex items-center justify-center text-gray-400">
                                            <ImageIcon className="w-8 h-8" />
                                        </div>
                                    )}
                                </div>

                                {/* Info */}
                                <div className="flex-1 min-w-0">
                                    <div className="flex items-start justify-between gap-2 mb-1">
                                        <div>
                                            <h3 className="font-bold text-gray-900 text-lg leading-tight">{section.title_ar || section.title_en || 'بدون عنوان'}</h3>
                                            {section.subtitle_ar && <p className="text-gray-500 text-sm">{section.subtitle_ar}</p>}
                                        </div>
                                        <div className="flex items-center gap-1.5 shrink-0">
                                            {section.show_on_desktop && <Monitor className="w-4 h-4 text-blue-500" title="يظهر على الكمبيوتر" />}
                                            {section.show_on_mobile && <Smartphone className="w-4 h-4 text-green-500" title="يظهر على الموبايل" />}
                                            <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${section.is_active ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-600'}`}>
                                                {section.is_active ? 'نشط' : 'معطل'}
                                            </span>
                                        </div>
                                    </div>

                                    {/* Buttons preview */}
                                    {(section.button1_enabled || section.button2_enabled) && (
                                        <div className="flex gap-2 mt-2 mb-3">
                                            {section.button1_enabled && section.button1_text_ar && (
                                                <span className="px-3 py-1 rounded text-white text-xs" style={{ backgroundColor: section.button1_color || '#F97316' }}>
                                                    {section.button1_text_ar}
                                                </span>
                                            )}
                                            {section.button2_enabled && section.button2_text_ar && (
                                                <span className="px-3 py-1 rounded text-white text-xs" style={{ backgroundColor: section.button2_color || '#22C55E' }}>
                                                    {section.button2_text_ar}
                                                </span>
                                            )}
                                        </div>
                                    )}

                                    {/* Actions */}
                                    <div className="flex gap-2 flex-wrap">
                                        <button
                                            onClick={() => handleEdit(section)}
                                            className="flex items-center gap-1.5 px-3 py-1.5 bg-blue-50 text-blue-700 rounded-lg text-sm hover:bg-blue-100 transition-colors"
                                        >
                                            <Edit2 className="w-3.5 h-3.5" /> تعديل
                                        </button>
                                        <button
                                            onClick={() => handleToggleActive(section)}
                                            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm transition-colors ${
                                                section.is_active ? 'bg-red-50 text-red-700 hover:bg-red-100' : 'bg-green-50 text-green-700 hover:bg-green-100'
                                            }`}
                                        >
                                            {section.is_active ? <><EyeOff className="w-3.5 h-3.5" /> تعطيل</> : <><Eye className="w-3.5 h-3.5" /> تفعيل</>}
                                        </button>
                                        <button
                                            onClick={() => handleDelete(section.id!)}
                                            className="flex items-center gap-1.5 px-3 py-1.5 bg-gray-50 text-gray-700 rounded-lg text-sm hover:bg-red-50 hover:text-red-700 transition-colors"
                                        >
                                            <Trash2 className="w-3.5 h-3.5" /> حذف
                                        </button>
                                        <button
                                            onClick={() => moveSection(section.id!, 'up')}
                                            disabled={index === 0}
                                            className="p-1.5 bg-gray-50 text-gray-600 rounded-lg hover:bg-gray-100 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
                                        >
                                            <ArrowUp className="w-4 h-4" />
                                        </button>
                                        <button
                                            onClick={() => moveSection(section.id!, 'down')}
                                            disabled={index === sections.length - 1}
                                            className="p-1.5 bg-gray-50 text-gray-600 rounded-lg hover:bg-gray-100 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
                                        >
                                            <ArrowDown className="w-4 h-4" />
                                        </button>
                                    </div>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            )}

            {/* Modal */}
            {showModal && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50">
                    <div className="bg-white rounded-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto shadow-xl">
                        {/* Modal Header */}
                        <div className="sticky top-0 bg-white border-b px-5 py-4 flex justify-between items-center rounded-t-2xl z-10">
                            <h2 className="text-lg font-bold text-gray-900">
                                {editingSection ? 'تعديل البانر' : 'إضافة بانر جديد'}
                            </h2>
                            <button onClick={() => { setShowModal(false); resetForm(); }} className="p-2 hover:bg-gray-100 rounded-lg">
                                <X className="w-5 h-5" />
                            </button>
                        </div>

                        {/* Tabs */}
                        <div className="flex border-b px-5">
                            {(['content', 'design', 'buttons'] as const).map(tab => (
                                <button
                                    key={tab}
                                    type="button"
                                    onClick={() => setActiveTab(tab)}
                                    className={`px-4 py-3 text-sm font-medium transition-colors border-b-2 -mb-px ${
                                        activeTab === tab ? 'border-[#F97316] text-[#F97316]' : 'border-transparent text-gray-500 hover:text-gray-800'
                                    }`}
                                >
                                    {tab === 'content' ? 'المحتوى' : tab === 'design' ? 'التصميم' : 'الأزرار'}
                                </button>
                            ))}
                        </div>

                        <form onSubmit={handleSubmit} className="p-5 space-y-4">
                            {/* ── Content Tab ── */}
                            {activeTab === 'content' && (
                                <div className="space-y-4">
                                    <div className="grid grid-cols-1 gap-3">
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-1">العنوان بالعربي *</label>
                                            <input
                                                type="text"
                                                value={formData.title_ar}
                                                onChange={e => set('title_ar', e.target.value)}
                                                className="w-full p-3 border rounded-lg focus:ring-2 focus:ring-[#F97316] focus:border-transparent"
                                                placeholder="مثلاً: عروض رمضان"
                                                required
                                            />
                                        </div>
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-1">العنوان الفرعي (اختياري)</label>
                                            <input
                                                type="text"
                                                value={formData.subtitle_ar}
                                                onChange={e => set('subtitle_ar', e.target.value)}
                                                className="w-full p-3 border rounded-lg focus:ring-2 focus:ring-[#F97316] focus:border-transparent"
                                                placeholder="وصف قصير"
                                            />
                                        </div>
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-1">الوصف (اختياري)</label>
                                            <textarea
                                                value={formData.description_ar}
                                                onChange={e => set('description_ar', e.target.value)}
                                                className="w-full p-3 border rounded-lg focus:ring-2 focus:ring-[#F97316] focus:border-transparent"
                                                rows={2}
                                                placeholder="وصف تفصيلي للبانر"
                                            />
                                        </div>
                                    </div>

                                    {/* Main Image */}
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-2">الصورة الرئيسية *</label>
                                        <ImageUploadZone field="image_url" uploading={uploadingMain} />
                                        <div className="mt-2 flex items-center gap-2">
                                            <div className="flex-1 h-px bg-gray-200" />
                                            <span className="text-xs text-gray-400">أو الصق رابط</span>
                                            <div className="flex-1 h-px bg-gray-200" />
                                        </div>
                                        <input
                                            type="url"
                                            value={formData.image_url}
                                            onChange={e => set('image_url', e.target.value)}
                                            className="mt-2 w-full p-2.5 border rounded-lg text-sm focus:ring-2 focus:ring-[#F97316] focus:border-transparent"
                                            placeholder="https://..."
                                        />
                                    </div>

                                    {/* Mobile Image */}
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-2">
                                            صورة الموبايل <span className="text-gray-400 font-normal">(اختياري — لو مش موجودة هتظهر الصورة الرئيسية)</span>
                                        </label>
                                        <ImageUploadZone field="mobile_image_url" uploading={uploadingMobile} />
                                        <input
                                            type="url"
                                            value={formData.mobile_image_url}
                                            onChange={e => set('mobile_image_url', e.target.value)}
                                            className="mt-2 w-full p-2.5 border rounded-lg text-sm focus:ring-2 focus:ring-[#F97316] focus:border-transparent"
                                            placeholder="https://..."
                                        />
                                    </div>
                                </div>
                            )}

                            {/* ── Design Tab ── */}
                            {activeTab === 'design' && (
                                <div className="space-y-4">
                                    <div className="grid grid-cols-3 gap-4">
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-1">لون الخلفية</label>
                                            <input type="color" value={formData.background_color} onChange={e => set('background_color', e.target.value)} className="w-full h-10 rounded-lg border cursor-pointer" />
                                        </div>
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-1">لون النص</label>
                                            <input type="color" value={formData.text_color} onChange={e => set('text_color', e.target.value)} className="w-full h-10 rounded-lg border cursor-pointer" />
                                        </div>
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-1">شفافية (0-1)</label>
                                            <input type="number" step="0.1" min="0" max="1" value={formData.overlay_opacity} onChange={e => set('overlay_opacity', parseFloat(e.target.value))} className="w-full p-2.5 border rounded-lg text-sm" />
                                        </div>
                                    </div>

                                    <div className="grid grid-cols-2 gap-4">
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-1">نوع الأنيميشن</label>
                                            <select value={formData.animation_type} onChange={e => set('animation_type', e.target.value)} className="w-full p-2.5 border rounded-lg text-sm">
                                                <option value="fade">Fade</option>
                                                <option value="slide">Slide</option>
                                                <option value="zoom">Zoom</option>
                                                <option value="none">بدون</option>
                                            </select>
                                        </div>
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-1">مدة الأنيميشن (ms)</label>
                                            <input type="number" value={formData.animation_duration} onChange={e => set('animation_duration', parseInt(e.target.value))} className="w-full p-2.5 border rounded-lg text-sm" />
                                        </div>
                                    </div>

                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">ترتيب العرض</label>
                                        <input type="number" value={formData.display_order} onChange={e => set('display_order', parseInt(e.target.value) || 0)} className="w-full p-2.5 border rounded-lg text-sm" />
                                        <p className="text-xs text-gray-400 mt-1">كلما قل الرقم ظهر أول</p>
                                    </div>

                                    <div className="grid grid-cols-3 gap-3">
                                        {[
                                            { label: 'نشط', field: 'is_active' },
                                            { label: 'يظهر على الكمبيوتر', field: 'show_on_desktop' },
                                            { label: 'يظهر على الموبايل', field: 'show_on_mobile' }
                                        ].map(({ label, field }) => (
                                            <label key={field} className="flex items-center gap-2 cursor-pointer select-none">
                                                <div
                                                    onClick={() => set(field as keyof HeroSection, !formData[field as keyof HeroSection])}
                                                    className={`w-11 h-6 rounded-full transition-colors relative ${(formData as any)[field] ? 'bg-[#F97316]' : 'bg-gray-300'}`}
                                                >
                                                    <span className={`absolute top-0.5 w-5 h-5 bg-white rounded-full shadow transition-transform ${(formData as any)[field] ? 'translate-x-5' : 'translate-x-0.5'}`} />
                                                </div>
                                                <span className="text-sm text-gray-700">{label}</span>
                                            </label>
                                        ))}
                                    </div>
                                </div>
                            )}

                            {/* ── Buttons Tab ── */}
                            {activeTab === 'buttons' && (
                                <div className="space-y-4">
                                    {/* Button 1 */}
                                    <div className="border rounded-xl p-4 space-y-3">
                                        <div className="flex items-center justify-between">
                                            <h3 className="font-semibold text-gray-800">الزر الأول</h3>
                                            <label className="flex items-center gap-2 cursor-pointer">
                                                <div
                                                    onClick={() => set('button1_enabled', !formData.button1_enabled)}
                                                    className={`w-10 h-5.5 rounded-full transition-colors relative ${formData.button1_enabled ? 'bg-[#F97316]' : 'bg-gray-300'}`}
                                                    style={{ height: '1.375rem' }}
                                                >
                                                    <span className={`absolute top-0.5 w-4 h-4 bg-white rounded-full shadow transition-transform ${formData.button1_enabled ? 'translate-x-5' : 'translate-x-0.5'}`} />
                                                </div>
                                                <span className="text-sm text-gray-600">مفعّل</span>
                                            </label>
                                        </div>
                                        {formData.button1_enabled && (
                                            <div className="grid grid-cols-2 gap-3">
                                                <div>
                                                    <label className="block text-xs font-medium text-gray-600 mb-1">نص الزر</label>
                                                    <input type="text" value={formData.button1_text_ar} onChange={e => set('button1_text_ar', e.target.value)} className="w-full p-2.5 border rounded-lg text-sm" placeholder="مثلاً: تسوق الآن" />
                                                </div>
                                                <div>
                                                    <label className="block text-xs font-medium text-gray-600 mb-1">الرابط</label>
                                                    <input type="text" value={formData.button1_link} onChange={e => set('button1_link', e.target.value)} className="w-full p-2.5 border rounded-lg text-sm" placeholder="/products" />
                                                </div>
                                                <div>
                                                    <label className="block text-xs font-medium text-gray-600 mb-1">لون الزر</label>
                                                    <input type="color" value={formData.button1_color} onChange={e => set('button1_color', e.target.value)} className="w-full h-9 rounded-lg border cursor-pointer" />
                                                </div>
                                                <div className="flex items-end">
                                                    <span className="px-4 py-2 rounded text-white text-sm w-full text-center" style={{ backgroundColor: formData.button1_color || '#F97316' }}>
                                                        {formData.button1_text_ar || 'معاينة'}
                                                    </span>
                                                </div>
                                            </div>
                                        )}
                                    </div>

                                    {/* Button 2 */}
                                    <div className="border rounded-xl p-4 space-y-3">
                                        <div className="flex items-center justify-between">
                                            <h3 className="font-semibold text-gray-800">الزر الثاني</h3>
                                            <label className="flex items-center gap-2 cursor-pointer">
                                                <div
                                                    onClick={() => set('button2_enabled', !formData.button2_enabled)}
                                                    className={`w-10 rounded-full transition-colors relative ${formData.button2_enabled ? 'bg-[#F97316]' : 'bg-gray-300'}`}
                                                    style={{ height: '1.375rem' }}
                                                >
                                                    <span className={`absolute top-0.5 w-4 h-4 bg-white rounded-full shadow transition-transform ${formData.button2_enabled ? 'translate-x-5' : 'translate-x-0.5'}`} />
                                                </div>
                                                <span className="text-sm text-gray-600">مفعّل</span>
                                            </label>
                                        </div>
                                        {formData.button2_enabled && (
                                            <div className="grid grid-cols-2 gap-3">
                                                <div>
                                                    <label className="block text-xs font-medium text-gray-600 mb-1">نص الزر</label>
                                                    <input type="text" value={formData.button2_text_ar} onChange={e => set('button2_text_ar', e.target.value)} className="w-full p-2.5 border rounded-lg text-sm" placeholder="مثلاً: اعرف أكتر" />
                                                </div>
                                                <div>
                                                    <label className="block text-xs font-medium text-gray-600 mb-1">الرابط</label>
                                                    <input type="text" value={formData.button2_link} onChange={e => set('button2_link', e.target.value)} className="w-full p-2.5 border rounded-lg text-sm" placeholder="/about" />
                                                </div>
                                                <div>
                                                    <label className="block text-xs font-medium text-gray-600 mb-1">لون الزر</label>
                                                    <input type="color" value={formData.button2_color} onChange={e => set('button2_color', e.target.value)} className="w-full h-9 rounded-lg border cursor-pointer" />
                                                </div>
                                                <div className="flex items-end">
                                                    <span className="px-4 py-2 rounded text-white text-sm w-full text-center" style={{ backgroundColor: formData.button2_color || '#22C55E' }}>
                                                        {formData.button2_text_ar || 'معاينة'}
                                                    </span>
                                                </div>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            )}

                            {/* Submit */}
                            <div className="flex gap-3 pt-2 border-t">
                                <button
                                    type="button"
                                    onClick={() => { setShowModal(false); resetForm(); }}
                                    className="flex-1 py-3 border rounded-lg font-medium hover:bg-gray-50 transition-colors"
                                >
                                    إلغاء
                                </button>
                                <button
                                    type="submit"
                                    disabled={saving || uploadingMain || uploadingMobile}
                                    className="flex-1 py-3 bg-[#F97316] text-white rounded-lg font-medium hover:bg-[#EA580C] transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
                                >
                                    {saving ? (
                                        <><RefreshCw className="w-5 h-5 animate-spin" /> جاري الحفظ...</>
                                    ) : (
                                        <><Save className="w-5 h-5" />{editingSection ? 'تحديث' : 'حفظ'}</>
                                    )}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
}
