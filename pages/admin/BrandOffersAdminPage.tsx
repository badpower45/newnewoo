import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
    Plus, Edit, Trash2, Eye, EyeOff, GripVertical, ArrowLeft,
    Palette, Image, Link2, Tag, Calendar, Save, X, Search,
    ChevronDown, ChevronUp, Sparkles, Gift, Package
} from 'lucide-react';
import { api } from '../../services/api';
import { Product } from '../../types';

interface BrandOffer {
    id: number;
    title: string;
    title_ar: string;
    subtitle?: string;
    subtitle_ar?: string;
    discount_text?: string;
    discount_text_ar?: string;
    background_type: string;
    background_value: string;
    text_color: string;
    badge_color: string;
    badge_text_color: string;
    image_url?: string;
    brand_logo_url?: string;
    linked_product_id?: number;
    linked_brand_id?: number;
    link_type: string;
    custom_link?: string;
    is_active: boolean;
    display_order: number;
    starts_at?: string;
    expires_at?: string;
}

const defaultOffer: Partial<BrandOffer> = {
    title: '',
    title_ar: '',
    subtitle: '',
    subtitle_ar: '',
    discount_text: '',
    discount_text_ar: '',
    background_type: 'gradient',
    background_value: 'linear-gradient(135deg, #8B4513 0%, #5D3A1A 50%, #3D2610 100%)',
    text_color: '#FEF3C7',
    badge_color: '#EF4444',
    badge_text_color: '#FFFFFF',
    image_url: '',
    brand_logo_url: '',
    link_type: 'product',
    linked_product_id: undefined,
    is_active: true,
    display_order: 0
};

// Preset gradient backgrounds
const presetGradients = [
    { name: 'شوكولاتة', value: 'linear-gradient(135deg, #8B4513 0%, #5D3A1A 50%, #3D2610 100%)', textColor: '#FEF3C7' },
    { name: 'بنفسجي', value: 'linear-gradient(135deg, #4B0082 0%, #6B238E 50%, #8B008B 100%)', textColor: '#E9D5FF' },
    { name: 'أزرق', value: 'linear-gradient(135deg, #001F5C 0%, #003087 50%, #0056B3 100%)', textColor: '#BFDBFE' },
    { name: 'أحمر', value: 'linear-gradient(135deg, #C41E3A 0%, #A51C30 50%, #8B0000 100%)', textColor: '#FECACA' },
    { name: 'ذهبي', value: 'linear-gradient(135deg, #FFD700 0%, #FFA500 50%, #FF8C00 100%)', textColor: '#78350F' },
    { name: 'بني قهوة', value: 'linear-gradient(135deg, #3E2723 0%, #4E342E 50%, #5D4037 100%)', textColor: '#FEF3C7' },
    { name: 'أخضر', value: 'linear-gradient(135deg, #065F46 0%, #047857 50%, #10B981 100%)', textColor: '#D1FAE5' },
    { name: 'وردي', value: 'linear-gradient(135deg, #831843 0%, #BE185D 50%, #EC4899 100%)', textColor: '#FCE7F3' },
    { name: 'برتقالي', value: 'linear-gradient(135deg, #C2410C 0%, #EA580C 50%, #F97316 100%)', textColor: '#FED7AA' },
    { name: 'رمادي', value: 'linear-gradient(135deg, #1F2937 0%, #374151 50%, #4B5563 100%)', textColor: '#F3F4F6' },
];

export default function BrandOffersAdminPage() {
    const navigate = useNavigate();
    const [offers, setOffers] = useState<BrandOffer[]>([]);
    const [products, setProducts] = useState<Product[]>([]);
    const [brands, setBrands] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [showModal, setShowModal] = useState(false);
    const [editingOffer, setEditingOffer] = useState<Partial<BrandOffer> | null>(null);
    const [saving, setSaving] = useState(false);
    const [productSearch, setProductSearch] = useState('');
    const [showProductDropdown, setShowProductDropdown] = useState(false);
    const [brandSearch, setBrandSearch] = useState('');
    const [showBrandDropdown, setShowBrandDropdown] = useState(false);
    const [expandedSection, setExpandedSection] = useState<string>('basic');

    useEffect(() => {
        fetchOffers();
        fetchProducts();
        fetchBrands();
    }, []);

    const fetchOffers = async () => {
        try {
            const res = await api.brandOffers.getAllAdmin();
            if (res.data) {
                setOffers(res.data);
            }
        } catch (err) {
            console.error('Error fetching brand offers:', err);
        } finally {
            setLoading(false);
        }
    };

    const fetchProducts = async () => {
        try {
            const res = await api.products.getAll();
            if (res.data) {
                setProducts(res.data);
            }
        } catch (err) {
            console.error('Error fetching products:', err);
        }
    };

    const fetchBrands = async () => {
        try {
            const res = await api.brands.getAll();
            const data = res.data || res;
            if (Array.isArray(data)) {
                setBrands(data);
            } else {
                setBrands([]);
            }
        } catch (err) {
            console.error('Error fetching brands:', err);
            setBrands([]);
        }
    };

    const handleSave = async () => {
        if (!editingOffer?.title_ar) {
            alert('من فضلك أدخل عنوان العرض بالعربي');
            return;
        }

        setSaving(true);
        try {
            if (editingOffer.id) {
                await api.brandOffers.update(editingOffer.id, editingOffer as any);
            } else {
                await api.brandOffers.create(editingOffer as any);
            }
            await fetchOffers();
            setShowModal(false);
            setEditingOffer(null);
        } catch (err) {
            console.error('Error saving offer:', err);
            alert('حدث خطأ أثناء الحفظ');
        } finally {
            setSaving(false);
        }
    };

    const handleDelete = async (id: number) => {
        if (!confirm('هل أنت متأكد من حذف هذا العرض؟')) return;
        
        try {
            await api.brandOffers.delete(id);
            await fetchOffers();
        } catch (err) {
            console.error('Error deleting offer:', err);
            alert('حدث خطأ أثناء الحذف');
        }
    };

    const handleToggleActive = async (offer: BrandOffer) => {
        try {
            await api.brandOffers.update(offer.id, { is_active: !offer.is_active });
            await fetchOffers();
        } catch (err) {
            console.error('Error toggling offer:', err);
        }
    };

    const handleReorder = async (id: number, direction: 'up' | 'down') => {
        const index = offers.findIndex(o => o.id === id);
        if (index === -1) return;
        
        const newIndex = direction === 'up' ? index - 1 : index + 1;
        if (newIndex < 0 || newIndex >= offers.length) return;

        const newOffers = [...offers];
        [newOffers[index], newOffers[newIndex]] = [newOffers[newIndex], newOffers[index]];
        
        const orders = newOffers.map((o, i) => ({ id: o.id, display_order: i }));
        
        try {
            await api.brandOffers.reorder(orders);
            setOffers(newOffers);
        } catch (err) {
            console.error('Error reordering:', err);
        }
    };

    const filteredProducts = products.filter(p => 
        p.name?.toLowerCase().includes(productSearch.toLowerCase()) ||
        p.nameAr?.toLowerCase().includes(productSearch.toLowerCase())
    ).slice(0, 10);

    const filteredBrands = brands.filter((b: any) =>
        b.name_ar?.toLowerCase().includes(brandSearch.toLowerCase()) ||
        b.name_en?.toLowerCase().includes(brandSearch.toLowerCase())
    ).slice(0, 10);

    const selectedBrand = editingOffer?.linked_brand_id
        ? brands.find((b: any) => String(b.id) === String(editingOffer.linked_brand_id))
        : null;

    const renderSection = (id: string, title: string, icon: React.ReactNode, children: React.ReactNode) => (
        <div className="border border-gray-200 rounded-lg overflow-hidden">
            <button
                onClick={() => setExpandedSection(expandedSection === id ? '' : id)}
                className="w-full flex items-center justify-between p-4 bg-gray-50 hover:bg-gray-100 transition-colors"
            >
                <div className="flex items-center gap-3">
                    <span className="text-brand-orange">{icon}</span>
                    <span className="font-bold text-gray-700">{title}</span>
                </div>
                {expandedSection === id ? <ChevronUp size={20} /> : <ChevronDown size={20} />}
            </button>
            {expandedSection === id && (
                <div className="p-4 space-y-4 bg-white">
                    {children}
                </div>
            )}
        </div>
    );

    return (
        <div className="min-h-screen bg-gray-100" dir="rtl">
            {/* Header */}
            <div className="bg-white shadow-sm border-b">
                <div className="max-w-7xl mx-auto px-4 py-4">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-4">
                            <button
                                onClick={() => navigate('/admin')}
                                className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                            >
                                <ArrowLeft size={24} />
                            </button>
                            <div>
                                <h1 className="text-2xl font-bold text-gray-800 flex items-center gap-2">
                                    <Gift className="text-brand-orange" />
                                    إدارة عروض البراندات
                                </h1>
                                <p className="text-gray-500 text-sm">إنشاء وتعديل عروض البراندات المميزة</p>
                            </div>
                        </div>
                        <button
                            onClick={() => {
                                setEditingOffer({ ...defaultOffer, display_order: offers.length });
                                setShowModal(true);
                            }}
                            className="flex items-center gap-2 bg-brand-orange text-white px-4 py-2 rounded-lg hover:bg-brand-orange/90 transition-colors"
                        >
                            <Plus size={20} />
                            إضافة عرض جديد
                        </button>
                    </div>
                </div>
            </div>

            {/* Content */}
            <div className="max-w-7xl mx-auto px-4 py-6">
                {loading ? (
                    <div className="flex justify-center py-20">
                        <div className="animate-spin rounded-full h-12 w-12 border-4 border-brand-orange border-t-transparent"></div>
                    </div>
                ) : offers.length === 0 ? (
                    <div className="text-center py-20 bg-white rounded-xl shadow">
                        <Gift size={64} className="mx-auto text-gray-300 mb-4" />
                        <h3 className="text-xl font-bold text-gray-600 mb-2">لا توجد عروض حالياً</h3>
                        <p className="text-gray-400 mb-4">قم بإضافة عرض جديد للبراندات</p>
                        <button
                            onClick={() => {
                                setEditingOffer({ ...defaultOffer });
                                setShowModal(true);
                            }}
                            className="bg-brand-orange text-white px-6 py-2 rounded-lg hover:bg-brand-orange/90"
                        >
                            إضافة أول عرض
                        </button>
                    </div>
                ) : (
                    <div className="grid gap-4">
                        {offers.map((offer, index) => (
                            <div
                                key={offer.id}
                                className={`bg-white rounded-xl shadow-sm overflow-hidden border-2 transition-all ${
                                    offer.is_active ? 'border-green-200' : 'border-gray-200 opacity-60'
                                }`}
                            >
                                <div className="flex">
                                    {/* Preview */}
                                    <div 
                                        className="w-64 h-40 flex-shrink-0 relative overflow-hidden"
                                        style={{ background: offer.background_value }}
                                    >
                                        {offer.image_url && (
                                            <img 
                                                src={offer.image_url} 
                                                alt={offer.title}
                                                className="absolute left-0 bottom-0 w-24 h-24 object-cover rounded-tr-xl opacity-80"
                                            />
                                        )}
                                        <div className="absolute inset-0 p-4 flex flex-col justify-between">
                                            <div>
                                                <div className="font-bold text-lg" style={{ color: offer.text_color }}>
                                                    {offer.title_ar}
                                                </div>
                                                <div className="text-xs opacity-80" style={{ color: offer.text_color }}>
                                                    {offer.title}
                                                </div>
                                            </div>
                                            {offer.discount_text_ar && (
                                                <span 
                                                    className="self-start text-xs px-2 py-1 rounded-full font-bold"
                                                    style={{ 
                                                        backgroundColor: offer.badge_color,
                                                        color: offer.badge_text_color
                                                    }}
                                                >
                                                    {offer.discount_text_ar}
                                                </span>
                                            )}
                                        </div>
                                    </div>

                                    {/* Details */}
                                    <div className="flex-1 p-4">
                                        <div className="flex items-start justify-between">
                                            <div>
                                                {(() => {
                                                    const linkedProduct = offer.linked_product_id
                                                        ? products.find(p => p.id === offer.linked_product_id)
                                                        : null;
                                                    const linkedBrand = offer.linked_brand_id
                                                        ? brands.find((b: any) => String(b.id) === String(offer.linked_brand_id))
                                                        : null;
                                                    return (
                                                        <>
                                                <h3 className="font-bold text-lg text-gray-800">{offer.title_ar}</h3>
                                                <p className="text-gray-500 text-sm">{offer.subtitle_ar || offer.subtitle}</p>
                                                <div className="mt-2 flex items-center gap-2 text-sm">
                                                    <span className={`px-2 py-0.5 rounded-full ${offer.is_active ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-500'}`}>
                                                        {offer.is_active ? 'مفعل' : 'معطل'}
                                                    </span>
                                                    {offer.link_type === 'product' && linkedProduct && (
                                                        <>
                                                            <span className="text-gray-400">|</span>
                                                            <span className="text-gray-500">مرتبط بمنتج:</span>
                                                            <span className="text-brand-orange">
                                                                {linkedProduct.nameAr || linkedProduct.name}
                                                            </span>
                                                        </>
                                                    )}
                                                </div>
                                                        </>
                                                    );
                                                })()}
                                            </div>
                                            
                                            {/* Actions */}
                                            <div className="flex items-center gap-2">
                                                <button
                                                    onClick={() => handleReorder(offer.id, 'up')}
                                                    disabled={index === 0}
                                                    className="p-2 hover:bg-gray-100 rounded-lg disabled:opacity-30"
                                                >
                                                    <ChevronUp size={18} />
                                                </button>
                                                <button
                                                    onClick={() => handleReorder(offer.id, 'down')}
                                                    disabled={index === offers.length - 1}
                                                    className="p-2 hover:bg-gray-100 rounded-lg disabled:opacity-30"
                                                >
                                                    <ChevronDown size={18} />
                                                </button>
                                                <button
                                                    onClick={() => handleToggleActive(offer)}
                                                    className={`p-2 rounded-lg ${offer.is_active ? 'hover:bg-yellow-50 text-yellow-600' : 'hover:bg-green-50 text-green-600'}`}
                                                >
                                                    {offer.is_active ? <EyeOff size={18} /> : <Eye size={18} />}
                                                </button>
                                                <button
                                                    onClick={() => {
                                                        setEditingOffer(offer);
                                                        setShowModal(true);
                                                    }}
                                                    className="p-2 hover:bg-blue-50 text-blue-600 rounded-lg"
                                                >
                                                    <Edit size={18} />
                                                </button>
                                                <button
                                                    onClick={() => handleDelete(offer.id)}
                                                    className="p-2 hover:bg-red-50 text-red-600 rounded-lg"
                                                >
                                                    <Trash2 size={18} />
                                                </button>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>

            {/* Modal */}
            {showModal && editingOffer && (
                <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
                    <div className="bg-white rounded-2xl w-full max-w-4xl max-h-[90vh] overflow-hidden flex flex-col">
                        {/* Modal Header */}
                        <div className="flex items-center justify-between p-4 border-b bg-gray-50">
                            <h2 className="text-xl font-bold text-gray-800">
                                {editingOffer.id ? 'تعديل العرض' : 'إضافة عرض جديد'}
                            </h2>
                            <button
                                onClick={() => {
                                    setShowModal(false);
                                    setEditingOffer(null);
                                }}
                                className="p-2 hover:bg-gray-200 rounded-lg"
                            >
                                <X size={20} />
                            </button>
                        </div>

                        {/* Modal Body */}
                        <div className="flex-1 overflow-y-auto p-4 space-y-4">
                            {/* Preview */}
                            <div className="bg-gray-100 rounded-xl p-4">
                                <h3 className="text-sm font-bold text-gray-600 mb-3 flex items-center gap-2">
                                    <Sparkles size={16} />
                                    معاينة العرض
                                </h3>
                                <div 
                                    className="rounded-xl overflow-hidden h-48 relative shadow-lg"
                                    style={{ background: editingOffer.background_value }}
                                >
                                    {editingOffer.image_url && (
                                        <img 
                                            src={editingOffer.image_url} 
                                            alt="Preview"
                                            className="absolute left-0 bottom-0 w-32 h-32 object-cover rounded-tr-xl opacity-80"
                                        />
                                    )}
                                    <div className="absolute inset-0 p-5 flex flex-col justify-between">
                                        <div>
                                            <div className="font-bold text-2xl" style={{ color: editingOffer.text_color }}>
                                                {editingOffer.title_ar || 'عنوان العرض'}
                                            </div>
                                            <div className="text-sm opacity-80" style={{ color: editingOffer.text_color }}>
                                                {editingOffer.title || 'Offer Title'}
                                            </div>
                                        </div>
                                        <div>
                                            <p className="text-sm mb-2" style={{ color: editingOffer.text_color }}>
                                                {editingOffer.subtitle_ar || 'وصف العرض'}
                                            </p>
                                            {editingOffer.discount_text_ar && (
                                                <span 
                                                    className="text-sm px-3 py-1 rounded-full font-bold"
                                                    style={{ 
                                                        backgroundColor: editingOffer.badge_color,
                                                        color: editingOffer.badge_text_color
                                                    }}
                                                >
                                                    {editingOffer.discount_text_ar}
                                                </span>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Basic Info */}
                            {renderSection('basic', 'المعلومات الأساسية', <Tag size={18} />, (
                                <>
                                    <div className="grid grid-cols-2 gap-4">
                                        <div>
                                            <label className="block text-sm font-bold text-gray-700 mb-1">
                                                العنوان بالعربي *
                                            </label>
                                            <input
                                                type="text"
                                                value={editingOffer.title_ar || ''}
                                                onChange={(e) => setEditingOffer({ ...editingOffer, title_ar: e.target.value })}
                                                className="w-full border rounded-lg px-3 py-2 focus:ring-2 focus:ring-brand-orange focus:outline-none"
                                                placeholder="مثال: شوكولاتة جالاكسي"
                                            />
                                        </div>
                                        <div>
                                            <label className="block text-sm font-bold text-gray-700 mb-1">
                                                العنوان بالإنجليزي
                                            </label>
                                            <input
                                                type="text"
                                                value={editingOffer.title || ''}
                                                onChange={(e) => setEditingOffer({ ...editingOffer, title: e.target.value })}
                                                className="w-full border rounded-lg px-3 py-2 focus:ring-2 focus:ring-brand-orange focus:outline-none"
                                                placeholder="e.g. Galaxy Chocolate"
                                                dir="ltr"
                                            />
                                        </div>
                                    </div>
                                    <div className="grid grid-cols-2 gap-4">
                                        <div>
                                            <label className="block text-sm font-bold text-gray-700 mb-1">
                                                الوصف بالعربي
                                            </label>
                                            <input
                                                type="text"
                                                value={editingOffer.subtitle_ar || ''}
                                                onChange={(e) => setEditingOffer({ ...editingOffer, subtitle_ar: e.target.value })}
                                                className="w-full border rounded-lg px-3 py-2 focus:ring-2 focus:ring-brand-orange focus:outline-none"
                                                placeholder="مثال: عروض حصرية على كل المنتجات"
                                            />
                                        </div>
                                        <div>
                                            <label className="block text-sm font-bold text-gray-700 mb-1">
                                                الوصف بالإنجليزي
                                            </label>
                                            <input
                                                type="text"
                                                value={editingOffer.subtitle || ''}
                                                onChange={(e) => setEditingOffer({ ...editingOffer, subtitle: e.target.value })}
                                                className="w-full border rounded-lg px-3 py-2 focus:ring-2 focus:ring-brand-orange focus:outline-none"
                                                placeholder="e.g. Exclusive offers on all products"
                                                dir="ltr"
                                            />
                                        </div>
                                    </div>
                                    <div className="grid grid-cols-2 gap-4">
                                        <div>
                                            <label className="block text-sm font-bold text-gray-700 mb-1">
                                                نص الخصم بالعربي
                                            </label>
                                            <input
                                                type="text"
                                                value={editingOffer.discount_text_ar || ''}
                                                onChange={(e) => setEditingOffer({ ...editingOffer, discount_text_ar: e.target.value })}
                                                className="w-full border rounded-lg px-3 py-2 focus:ring-2 focus:ring-brand-orange focus:outline-none"
                                                placeholder="مثال: خصم 30%"
                                            />
                                        </div>
                                        <div>
                                            <label className="block text-sm font-bold text-gray-700 mb-1">
                                                نص الخصم بالإنجليزي
                                            </label>
                                            <input
                                                type="text"
                                                value={editingOffer.discount_text || ''}
                                                onChange={(e) => setEditingOffer({ ...editingOffer, discount_text: e.target.value })}
                                                className="w-full border rounded-lg px-3 py-2 focus:ring-2 focus:ring-brand-orange focus:outline-none"
                                                placeholder="e.g. 30% OFF"
                                                dir="ltr"
                                            />
                                        </div>
                                    </div>
                                </>
                            ))}

                            {/* Design */}
                            {renderSection('design', 'التصميم والألوان', <Palette size={18} />, (
                                <>
                                    <div>
                                        <label className="block text-sm font-bold text-gray-700 mb-2">
                                            الخلفية (اختر من القوالب الجاهزة)
                                        </label>
                                        <div className="grid grid-cols-5 gap-2">
                                            {presetGradients.map((gradient) => (
                                                <button
                                                    key={gradient.name}
                                                    onClick={() => setEditingOffer({ 
                                                        ...editingOffer, 
                                                        background_value: gradient.value,
                                                        text_color: gradient.textColor
                                                    })}
                                                    className={`h-16 rounded-lg flex items-center justify-center text-xs font-bold transition-all ${
                                                        editingOffer.background_value === gradient.value 
                                                            ? 'ring-4 ring-brand-orange ring-offset-2' 
                                                            : 'hover:scale-105'
                                                    }`}
                                                    style={{ background: gradient.value, color: gradient.textColor }}
                                                >
                                                    {gradient.name}
                                                </button>
                                            ))}
                                        </div>
                                    </div>
                                    <div>
                                        <label className="block text-sm font-bold text-gray-700 mb-1">
                                            أو أدخل CSS Gradient مخصص
                                        </label>
                                        <input
                                            type="text"
                                            value={editingOffer.background_value || ''}
                                            onChange={(e) => setEditingOffer({ ...editingOffer, background_value: e.target.value })}
                                            className="w-full border rounded-lg px-3 py-2 focus:ring-2 focus:ring-brand-orange focus:outline-none font-mono text-sm"
                                            dir="ltr"
                                            placeholder="linear-gradient(135deg, #000 0%, #333 100%)"
                                        />
                                    </div>
                                    <div className="grid grid-cols-3 gap-4">
                                        <div>
                                            <label className="block text-sm font-bold text-gray-700 mb-1">
                                                لون النص
                                            </label>
                                            <div className="flex items-center gap-2">
                                                <input
                                                    type="color"
                                                    value={editingOffer.text_color || '#FEF3C7'}
                                                    onChange={(e) => setEditingOffer({ ...editingOffer, text_color: e.target.value })}
                                                    className="w-12 h-10 rounded cursor-pointer"
                                                />
                                                <input
                                                    type="text"
                                                    value={editingOffer.text_color || ''}
                                                    onChange={(e) => setEditingOffer({ ...editingOffer, text_color: e.target.value })}
                                                    className="flex-1 border rounded-lg px-3 py-2 font-mono text-sm"
                                                    dir="ltr"
                                                />
                                            </div>
                                        </div>
                                        <div>
                                            <label className="block text-sm font-bold text-gray-700 mb-1">
                                                لون البادج
                                            </label>
                                            <div className="flex items-center gap-2">
                                                <input
                                                    type="color"
                                                    value={editingOffer.badge_color || '#EF4444'}
                                                    onChange={(e) => setEditingOffer({ ...editingOffer, badge_color: e.target.value })}
                                                    className="w-12 h-10 rounded cursor-pointer"
                                                />
                                                <input
                                                    type="text"
                                                    value={editingOffer.badge_color || ''}
                                                    onChange={(e) => setEditingOffer({ ...editingOffer, badge_color: e.target.value })}
                                                    className="flex-1 border rounded-lg px-3 py-2 font-mono text-sm"
                                                    dir="ltr"
                                                />
                                            </div>
                                        </div>
                                        <div>
                                            <label className="block text-sm font-bold text-gray-700 mb-1">
                                                لون نص البادج
                                            </label>
                                            <div className="flex items-center gap-2">
                                                <input
                                                    type="color"
                                                    value={editingOffer.badge_text_color || '#FFFFFF'}
                                                    onChange={(e) => setEditingOffer({ ...editingOffer, badge_text_color: e.target.value })}
                                                    className="w-12 h-10 rounded cursor-pointer"
                                                />
                                                <input
                                                    type="text"
                                                    value={editingOffer.badge_text_color || ''}
                                                    onChange={(e) => setEditingOffer({ ...editingOffer, badge_text_color: e.target.value })}
                                                    className="flex-1 border rounded-lg px-3 py-2 font-mono text-sm"
                                                    dir="ltr"
                                                />
                                            </div>
                                        </div>
                                    </div>
                                </>
                            ))}

                            {/* Images */}
                            {renderSection('images', 'الصور', <Image size={18} />, (
                                <>
                                    <div>
                                        <label className="block text-sm font-bold text-gray-700 mb-1">
                                            رابط صورة المنتج/العرض
                                        </label>
                                        <input
                                            type="text"
                                            value={editingOffer.image_url || ''}
                                            onChange={(e) => setEditingOffer({ ...editingOffer, image_url: e.target.value })}
                                            className="w-full border rounded-lg px-3 py-2 focus:ring-2 focus:ring-brand-orange focus:outline-none"
                                            dir="ltr"
                                            placeholder="https://example.com/image.jpg"
                                        />
                                        {editingOffer.image_url && (
                                            <img 
                                                src={editingOffer.image_url} 
                                                alt="Preview" 
                                                className="mt-2 h-20 object-cover rounded-lg"
                                            />
                                        )}
                                    </div>
                                    <div>
                                        <label className="block text-sm font-bold text-gray-700 mb-1">
                                            رابط لوجو البراند (اختياري)
                                        </label>
                                        <input
                                            type="text"
                                            value={editingOffer.brand_logo_url || ''}
                                            onChange={(e) => setEditingOffer({ ...editingOffer, brand_logo_url: e.target.value })}
                                            className="w-full border rounded-lg px-3 py-2 focus:ring-2 focus:ring-brand-orange focus:outline-none"
                                            dir="ltr"
                                            placeholder="https://example.com/logo.png"
                                        />
                                    </div>
                                </>
                            ))}

                            {/* Link */}
                            {renderSection('link', 'الربط بمنتج', <Link2 size={18} />, (
                                <>
                                    {
                                        <div className="relative">
                                            <label className="block text-sm font-bold text-gray-700 mb-1">
                                                اختر المنتج
                                            </label>
                                            <div className="relative">
                                                <input
                                                    type="text"
                                                    value={productSearch}
                                                    onChange={(e) => {
                                                        setProductSearch(e.target.value);
                                                        setShowProductDropdown(true);
                                                    }}
                                                    onFocus={() => setShowProductDropdown(true)}
                                                    className="w-full border rounded-lg px-3 py-2 pr-10 focus:ring-2 focus:ring-brand-orange focus:outline-none"
                                                    placeholder="ابحث عن منتج..."
                                                />
                                                <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                                            </div>
                                            
                                            {showProductDropdown && filteredProducts.length > 0 && (
                                                <div className="absolute z-10 w-full mt-1 bg-white border rounded-lg shadow-lg max-h-60 overflow-y-auto">
                                                    {filteredProducts.map((product) => (
                                                        <button
                                                            key={product.id}
                                                            onClick={() => {
                                                                setEditingOffer({ ...editingOffer, linked_product_id: product.id });
                                                                setProductSearch('');
                                                                setShowProductDropdown(false);
                                                            }}
                                                            className="w-full flex items-center gap-3 p-3 hover:bg-gray-50 text-right"
                                                        >
                                                            {product.image && (
                                                                <img src={product.image} alt="" className="w-10 h-10 object-cover rounded" />
                                                            )}
                                                            <div>
                                                                <div className="font-bold">{product.nameAr || product.name}</div>
                                                                <div className="text-sm text-gray-500">{product.name}</div>
                                                            </div>
                                                        </button>
                                                    ))}
                                                </div>
                                            )}

                                            {editingOffer.linked_product_id && (
                                                <div className="mt-2 flex items-center gap-2 bg-green-50 p-2 rounded-lg">
                                                    <Package size={18} className="text-green-600" />
                                                    <span className="text-green-700 font-bold">
                                                        المنتج المرتبط: {products.find(p => p.id === editingOffer.linked_product_id)?.nameAr || products.find(p => p.id === editingOffer.linked_product_id)?.name}
                                                    </span>
                                                    <button
                                                        onClick={() => setEditingOffer({ ...editingOffer, linked_product_id: undefined })}
                                                        className="mr-auto text-red-500 hover:text-red-700"
                                                    >
                                                        <X size={18} />
                                                    </button>
                                                </div>
                                            )}
                                        </div>
                                </>
                            ))}

                            {/* Schedule */}
                            {renderSection('schedule', 'الجدولة', <Calendar size={18} />, (
                                <>
                                    <div className="flex items-center gap-3 mb-4">
                                        <input
                                            type="checkbox"
                                            id="is_active"
                                            checked={editingOffer.is_active !== false}
                                            onChange={(e) => setEditingOffer({ ...editingOffer, is_active: e.target.checked })}
                                            className="w-5 h-5 rounded text-brand-orange focus:ring-brand-orange"
                                        />
                                        <label htmlFor="is_active" className="font-bold text-gray-700">
                                            العرض مفعل
                                        </label>
                                    </div>
                                    <div className="grid grid-cols-2 gap-4">
                                        <div>
                                            <label className="block text-sm font-bold text-gray-700 mb-1">
                                                تاريخ البداية (اختياري)
                                            </label>
                                            <input
                                                type="datetime-local"
                                                value={editingOffer.starts_at?.slice(0, 16) || ''}
                                                onChange={(e) => setEditingOffer({ ...editingOffer, starts_at: e.target.value })}
                                                className="w-full border rounded-lg px-3 py-2 focus:ring-2 focus:ring-brand-orange focus:outline-none"
                                            />
                                        </div>
                                        <div>
                                            <label className="block text-sm font-bold text-gray-700 mb-1">
                                                تاريخ الانتهاء (اختياري)
                                            </label>
                                            <input
                                                type="datetime-local"
                                                value={editingOffer.expires_at?.slice(0, 16) || ''}
                                                onChange={(e) => setEditingOffer({ ...editingOffer, expires_at: e.target.value })}
                                                className="w-full border rounded-lg px-3 py-2 focus:ring-2 focus:ring-brand-orange focus:outline-none"
                                            />
                                        </div>
                                    </div>
                                </>
                            ))}
                        </div>

                        {/* Modal Footer */}
                        <div className="flex items-center justify-end gap-3 p-4 border-t bg-gray-50">
                            <button
                                onClick={() => {
                                    setShowModal(false);
                                    setEditingOffer(null);
                                }}
                                className="px-4 py-2 text-gray-600 hover:bg-gray-200 rounded-lg transition-colors"
                            >
                                إلغاء
                            </button>
                            <button
                                onClick={handleSave}
                                disabled={saving}
                                className="flex items-center gap-2 bg-brand-orange text-white px-6 py-2 rounded-lg hover:bg-brand-orange/90 transition-colors disabled:opacity-50"
                            >
                                {saving ? (
                                    <div className="animate-spin rounded-full h-5 w-5 border-2 border-white border-t-transparent" />
                                ) : (
                                    <Save size={18} />
                                )}
                                حفظ العرض
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
