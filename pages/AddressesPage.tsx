import React, { useState, useEffect } from 'react';
import { MapPin, ChevronLeft, Plus, Edit2, Trash2, Home, Building2, Briefcase } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { api } from '../services/api';

interface Address {
    id: number;
    user_id: number;
    type: 'home' | 'work' | 'other';
    address_line1: string;
    address_line2?: string;
    city: string;
    governorate: string;
    postal_code?: string;
    phone: string;
    is_default: boolean;
    created_at: string;
}

const AddressesPage = () => {
    const navigate = useNavigate();
    const { user, isAuthenticated } = useAuth();
    const [addresses, setAddresses] = useState<Address[]>([]);
    const [loading, setLoading] = useState(true);
    const [showForm, setShowForm] = useState(false);
    const [editingAddress, setEditingAddress] = useState<Address | null>(null);
    const [formData, setFormData] = useState({
        type: 'home',
        address_line1: '',
        address_line2: '',
        city: '',
        governorate: '',
        postal_code: '',
        phone: '',
        is_default: false
    });

    useEffect(() => {
        if (!isAuthenticated) {
            navigate('/login');
            return;
        }
        fetchAddresses();
    }, [isAuthenticated]);

    const fetchAddresses = async () => {
        try {
            setLoading(true);
            const response = await api.addresses.getAll(user?.id);
            setAddresses(response.data || []);
        } catch (error) {
            console.error('Error fetching addresses:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            console.log('💾 جاري حفظ العنوان:', formData);
            let response;
            if (editingAddress) {
                response = await api.addresses.update(editingAddress.id, formData);
                console.log('✅ تم تحديث العنوان:', response);
            } else {
                response = await api.addresses.create({ ...formData, user_id: user?.id });
                console.log('✅ تم إنشاء العنوان:', response);
            }
            await fetchAddresses();
            resetForm();
        } catch (error) {
            console.error('❌ فشل حفظ العنوان:', error);
            alert('فشل حفظ العنوان: ' + (error as any).message);
        }
    };

    const handleDelete = async (id: number) => {
        if (!confirm('هل تريد حذف هذا العنوان؟')) return;
        try {
            await api.addresses.delete(id);
            fetchAddresses();
        } catch (error) {
            console.error('Error deleting address:', error);
            alert('فشل حذف العنوان');
        }
    };

    const handleSetDefault = async (id: number) => {
        try {
            await api.addresses.setDefault(id);
            fetchAddresses();
        } catch (error) {
            console.error('Error setting default:', error);
        }
    };

    const resetForm = () => {
        setFormData({
            type: 'home',
            address_line1: '',
            address_line2: '',
            city: '',
            governorate: '',
            postal_code: '',
            phone: '',
            is_default: false
        });
        setEditingAddress(null);
        setShowForm(false);
    };

    const handleEdit = (address: Address) => {
        setEditingAddress(address);
        setFormData({
            type: address.type,
            address_line1: address.address_line1,
            address_line2: address.address_line2 || '',
            city: address.city,
            governorate: address.governorate,
            postal_code: address.postal_code || '',
            phone: address.phone,
            is_default: address.is_default
        });
        setShowForm(true);
    };

    const getAddressIcon = (type: string) => {
        switch (type) {
            case 'home': return <Home size={20} />;
            case 'work': return <Briefcase size={20} />;
            default: return <Building2 size={20} />;
        }
    };

    const getAddressLabel = (type: string) => {
        switch (type) {
            case 'home': return 'المنزل';
            case 'work': return 'العمل';
            default: return 'آخر';
        }
    };

    if (loading) {
        return (
            <div className="min-h-screen bg-gray-50 flex items-center justify-center">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-50 pb-24">
            {/* Header */}
            <div className="bg-white border-b sticky top-0 z-10">
                <div className="p-4 flex items-center justify-between">
                    <button onClick={() => navigate(-1)} className="p-2 -ml-2">
                        <ChevronLeft size={24} />
                    </button>
                    <h1 className="text-xl font-bold">عناويني</h1>
                    <button 
                        onClick={() => setShowForm(true)}
                        className="p-2 text-primary hover:bg-primary/10 rounded-xl transition-colors"
                    >
                        <Plus size={24} />
                    </button>
                </div>
            </div>

            {/* Form Modal */}
            {showForm && (
                <div className="fixed inset-0 bg-black/50 z-50 flex items-end md:items-center justify-center p-4">
                    <div className="bg-white rounded-t-3xl md:rounded-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto">
                        <div className="sticky top-0 bg-white border-b p-4 flex items-center justify-between">
                            <h2 className="text-lg font-bold">
                                {editingAddress ? 'تعديل العنوان' : 'إضافة عنوان جديد'}
                            </h2>
                            <button onClick={resetForm} className="p-2">
                                <ChevronLeft size={24} />
                            </button>
                        </div>
                        
                        <form onSubmit={handleSubmit} className="p-6 space-y-4">
                            <div>
                                <label className="block text-sm font-medium mb-2">نوع العنوان</label>
                                <div className="grid grid-cols-3 gap-2">
                                    {['home', 'work', 'other'].map(type => (
                                        <button
                                            key={type}
                                            type="button"
                                            onClick={() => setFormData({...formData, type: type as any})}
                                            className={`p-3 rounded-xl border-2 flex flex-col items-center gap-1 transition-all ${
                                                formData.type === type 
                                                    ? 'border-primary bg-primary/10' 
                                                    : 'border-gray-200'
                                            }`}
                                        >
                                            {getAddressIcon(type)}
                                            <span className="text-sm">{getAddressLabel(type)}</span>
                                        </button>
                                    ))}
                                </div>
                            </div>

                            <div>
                                <label className="block text-sm font-medium mb-2">العنوان</label>
                                <input
                                    type="text"
                                    required
                                    value={formData.address_line1}
                                    onChange={(e) => setFormData({...formData, address_line1: e.target.value})}
                                    className="w-full p-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none"
                                    placeholder="مثال: 15 شارع النيل"
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium mb-2">تفاصيل إضافية (اختياري)</label>
                                <input
                                    type="text"
                                    value={formData.address_line2}
                                    onChange={(e) => setFormData({...formData, address_line2: e.target.value})}
                                    className="w-full p-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none"
                                    placeholder="شقة، دور، معلم مميز"
                                />
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-medium mb-2">المدينة</label>
                                    <input
                                        type="text"
                                        required
                                        value={formData.city}
                                        onChange={(e) => setFormData({...formData, city: e.target.value})}
                                        className="w-full p-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium mb-2">المحافظة</label>
                                    <input
                                        type="text"
                                        required
                                        value={formData.governorate}
                                        onChange={(e) => setFormData({...formData, governorate: e.target.value})}
                                        className="w-full p-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none"
                                    />
                                </div>
                            </div>

                            <div>
                                <label className="block text-sm font-medium mb-2">رقم الهاتف</label>
                                <input
                                    type="tel"
                                    required
                                    value={formData.phone}
                                    onChange={(e) => setFormData({...formData, phone: e.target.value})}
                                    className="w-full p-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none"
                                    placeholder="01xxxxxxxxx"
                                />
                            </div>

                            <label className="flex items-center gap-2 cursor-pointer">
                                <input
                                    type="checkbox"
                                    checked={formData.is_default}
                                    onChange={(e) => setFormData({...formData, is_default: e.target.checked})}
                                    className="w-5 h-5 text-primary rounded"
                                />
                                <span className="text-sm">جعل هذا العنوان افتراضي</span>
                            </label>

                            <div className="flex gap-3 pt-4">
                                <button
                                    type="submit"
                                    className="flex-1 py-3 bg-primary text-white rounded-xl font-semibold hover:bg-primary-dark transition-colors"
                                >
                                    حفظ
                                </button>
                                <button
                                    type="button"
                                    onClick={resetForm}
                                    className="px-6 py-3 border-2 border-gray-200 rounded-xl font-semibold hover:bg-gray-50 transition-colors"
                                >
                                    إلغاء
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* Addresses List */}
            <div className="p-4 space-y-3">
                {addresses.length === 0 ? (
                    <div className="bg-white rounded-2xl p-12 text-center">
                        <MapPin size={64} className="text-gray-300 mx-auto mb-4" />
                        <h3 className="font-bold text-lg mb-2">لا توجد عناوين</h3>
                        <p className="text-gray-500 mb-6">أضف عنوانك الأول للتوصيل السريع</p>
                        <button
                            onClick={() => setShowForm(true)}
                            className="px-6 py-3 bg-primary text-white rounded-xl font-semibold hover:bg-primary-dark transition-colors inline-flex items-center gap-2"
                        >
                            <Plus size={20} />
                            إضافة عنوان
                        </button>
                    </div>
                ) : (
                    addresses.map(address => (
                        <div 
                            key={address.id}
                            className={`bg-white rounded-2xl p-4 border-2 transition-all ${
                                address.is_default ? 'border-primary' : 'border-transparent'
                            }`}
                        >
                            <div className="flex items-start justify-between mb-3">
                                <div className="flex items-center gap-3">
                                    <div className="w-10 h-10 bg-primary/10 rounded-xl flex items-center justify-center text-primary">
                                        {getAddressIcon(address.type)}
                                    </div>
                                    <div>
                                        <h3 className="font-bold text-gray-900">{getAddressLabel(address.type)}</h3>
                                        {address.is_default && (
                                            <span className="text-xs text-primary font-medium">العنوان الافتراضي</span>
                                        )}
                                    </div>
                                </div>
                                <div className="flex gap-1">
                                    <button
                                        onClick={() => handleEdit(address)}
                                        className="p-2 text-gray-600 hover:bg-gray-100 rounded-xl transition-colors"
                                    >
                                        <Edit2 size={18} />
                                    </button>
                                    <button
                                        onClick={() => handleDelete(address.id)}
                                        className="p-2 text-red-600 hover:bg-red-50 rounded-xl transition-colors"
                                    >
                                        <Trash2 size={18} />
                                    </button>
                                </div>
                            </div>

                            <div className="space-y-1 text-sm text-gray-600 mb-3">
                                <p>{address.address_line1}</p>
                                {address.address_line2 && <p>{address.address_line2}</p>}
                                <p>{address.city}, {address.governorate}</p>
                                <p className="font-medium text-gray-900">{address.phone}</p>
                            </div>

                            {!address.is_default && (
                                <button
                                    onClick={() => handleSetDefault(address.id)}
                                    className="text-sm text-primary font-medium hover:underline"
                                >
                                    جعله العنوان الافتراضي
                                </button>
                            )}
                        </div>
                    ))
                )}
            </div>
        </div>
    );
};

export default AddressesPage;
