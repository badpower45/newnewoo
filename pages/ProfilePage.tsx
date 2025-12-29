import React, { useState, useEffect, useRef } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import { User, Mail, LogOut, ChevronLeft, Edit2, Phone, Save, X, Camera, LayoutDashboard, Truck, ClipboardList, Headphones, Package, Gift, MapPin } from 'lucide-react';
import { api } from '../services/api';
import LoadingSpinner from '../components/LoadingSpinner';
import Footer from '../components/Footer';
import { API_URL } from '../src/config';

const ProfilePage = () => {
    const { user, logout, updateUser } = useAuth();
    const navigate = useNavigate();
    const [loading, setLoading] = useState(false);
    const [editMode, setEditMode] = useState(false);
    const [saving, setSaving] = useState(false);
    const [uploadingImage, setUploadingImage] = useState(false);
    const fileInputRef = useRef<HTMLInputElement>(null);
    const [formData, setFormData] = useState({
        name: user?.name || '',
        email: user?.email || '',
        phone: user?.phone || ''
    });

    useEffect(() => {
        if (user) {
            setFormData({
                name: user?.name || '',
                email: user?.email || '',
                phone: user?.phone || ''
            });
        }
    }, [user]);

    const handleSave = async () => {
        if (!formData.name.trim()) {
            alert('الرجاء إدخال الاسم');
            return;
        }

        setSaving(true);
        try {
            const response = await api.users.updateProfile({
                name: formData.name,
                email: formData.email,
                phone: formData.phone
            });
            
            if (response.success) {
                updateUser({ ...user, ...formData });
                setEditMode(false);
                alert('تم تحديث البيانات بنجاح');
            }
        } catch (err) {
            console.error('Failed to update profile:', err);
            alert('فشل تحديث البيانات');
        } finally {
            setSaving(false);
        }
    };

    const handleCancel = () => {
        setFormData({
            name: user?.name || '',
            email: user?.email || '',
            phone: user?.phone || ''
        });
        setEditMode(false);
    };

    const handleLogout = () => {
        logout();
        navigate('/');
    };

    const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        // Check file size (max 5MB)
        if (file.size > 5 * 1024 * 1024) {
            alert('حجم الصورة كبير جداً. الحد الأقصى 5 ميجابايت');
            return;
        }

        // Check file type
        if (!file.type.startsWith('image/')) {
            alert('الرجاء اختيار صورة');
            return;
        }

        setUploadingImage(true);
        try {
            // Use the backend upload endpoint instead of direct Cloudinary upload
            const formData = new FormData();
            formData.append('image', file);
            formData.append('productId', `user_${user?.id}_${Date.now()}`);

            const response = await fetch(`${API_URL}/upload/image`, {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${localStorage.getItem('token')}`
                },
                body: formData
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.error || 'Failed to upload image');
            }

            const data = await response.json();
            const imageUrl = data.data.url;

            // Update profile with new avatar
            const updateResponse = await api.users.updateProfile({
                avatar: imageUrl
            });

            if (updateResponse.success) {
                updateUser({ avatar: imageUrl });
                alert('تم تحديث الصورة بنجاح');
            }
        } catch (err: any) {
            console.error('Failed to upload image:', err);
            alert('فشل رفع الصورة: ' + (err.message || 'حاول مرة أخرى'));
        } finally {
            setUploadingImage(false);
        }
    };

    if (!user) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gray-50">
                <div className="text-center">
                    <h2 className="text-xl font-bold text-gray-900 mb-2">Not Logged In</h2>
                    <button
                        onClick={() => navigate('/login')}
                        className="text-primary font-bold hover:underline"
                    >
                        Go to Login
                    </button>
                </div>
            </div>
        );
    }

    if (loading) {
        return <LoadingSpinner />;
    }

    return (
        <div className="min-h-screen bg-gray-50 pb-24 md:pb-8">
            {/* Header */}
            <div className="bg-white p-4 sticky top-0 z-40 shadow-sm flex items-center relative md:hidden">
                <button onClick={() => navigate(-1)} className="p-2 -ml-2 text-primary absolute left-4">
                    <ChevronLeft size={28} />
                </button>
                <h1 className="text-xl font-bold text-gray-900 w-full text-center">Profile</h1>
            </div>

            <div className="max-w-7xl mx-auto md:p-6">
                <div className="hidden md:flex items-center justify-between mb-6">
                    <h1 className="text-3xl font-bold text-gray-900">Profile</h1>
                </div>

            {/* User Info Card */}
            <div className="bg-gradient-to-r from-orange-500 to-orange-600 text-white rounded-2xl p-6 mx-4 md:mx-0 mt-4">
                <button 
                    onClick={() => navigate(-1)} 
                    className="mb-4 p-2 -ml-2 hover:bg-white/10 rounded-xl transition-colors md:hidden"
                >
                    <ChevronLeft size={24} />
                </button>
                
                <div className="flex items-center gap-4">
                    <div className="relative">
                        {user?.avatar ? (
                            <img 
                                src={user.avatar} 
                                alt={user.name}
                                className="w-20 h-20 rounded-full object-cover border-4 border-white/30"
                            />
                        ) : (
                            <div className="w-20 h-20 bg-white/20 backdrop-blur-sm rounded-full flex items-center justify-center text-white text-3xl font-bold border-4 border-white/30">
                                {user?.name ? user.name.charAt(0).toUpperCase() : <User size={32} />}
                            </div>
                        )}
                        {editMode && (
                            <>
                                <input
                                    ref={fileInputRef}
                                    type="file"
                                    accept="image/*"
                                    onChange={handleImageUpload}
                                    className="hidden"
                                />
                                <button 
                                    onClick={() => fileInputRef.current?.click()}
                                    disabled={uploadingImage}
                                    className="absolute bottom-0 right-0 w-8 h-8 bg-white text-orange-600 rounded-full flex items-center justify-center shadow-lg hover:scale-110 transition-transform disabled:opacity-50"
                                >
                                    {uploadingImage ? (
                                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-orange-600"></div>
                                    ) : (
                                        <Camera size={16} />
                                    )}
                                </button>
                            </>
                        )}
                    </div>
                    <div className="flex-1">
                        <h1 className="text-2xl font-bold">{user?.name || 'مستخدم'}</h1>
                        <p className="text-white/80 text-sm">{user?.email || 'لا يوجد بريد إلكتروني'}</p>
                    </div>
                </div>
            </div>

            <div className="max-w-2xl mx-auto p-4 space-y-4">
                {/* Edit Profile Card */}
                <div className="bg-white rounded-2xl shadow-sm p-6">
                    <div className="flex items-center justify-between mb-6">
                        <h2 className="text-lg font-bold text-gray-900">المعلومات الشخصية</h2>
                        {!editMode ? (
                            <button
                                onClick={() => setEditMode(true)}
                                className="flex items-center gap-2 px-4 py-2 bg-orange-50 text-orange-600 rounded-xl hover:bg-orange-100 transition-colors"
                            >
                                <Edit2 size={16} />
                                <span className="text-sm font-medium">تعديل</span>
                            </button>
                        ) : (
                            <div className="flex gap-2">
                                <button
                                    onClick={handleCancel}
                                    disabled={saving}
                                    className="flex items-center gap-2 px-4 py-2 bg-gray-100 text-gray-700 rounded-xl hover:bg-gray-200 transition-colors"
                                >
                                    <X size={16} />
                                    <span className="text-sm font-medium">إلغاء</span>
                                </button>
                                <button
                                    onClick={handleSave}
                                    disabled={saving}
                                    className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-xl hover:bg-green-700 transition-colors disabled:opacity-50"
                                >
                                    <Save size={16} />
                                    <span className="text-sm font-medium">{saving ? 'جاري الحفظ...' : 'حفظ'}</span>
                                </button>
                            </div>
                        )}
                    </div>

                    <div className="space-y-4">
                        {/* Name Field */}
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">الاسم</label>
                            {editMode ? (
                                <input
                                    type="text"
                                    value={formData.name}
                                    onChange={(e) => setFormData({...formData, name: e.target.value})}
                                    className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-orange-500"
                                    placeholder="أدخل اسمك"
                                />
                            ) : (
                                <div className="flex items-center gap-3 px-4 py-3 bg-gray-50 rounded-xl">
                                    <User size={18} className="text-gray-400" />
                                    <span className="text-gray-900">{user?.name || 'غير محدد'}</span>
                                </div>
                            )}
                        </div>

                        {/* Email Field */}
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">البريد الإلكتروني</label>
                            {editMode ? (
                                <input
                                    type="email"
                                    value={formData.email}
                                    onChange={(e) => setFormData({...formData, email: e.target.value})}
                                    className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-orange-500"
                                    placeholder="example@email.com"
                                />
                            ) : (
                                <div className="flex items-center gap-3 px-4 py-3 bg-gray-50 rounded-xl">
                                    <Mail size={18} className="text-gray-400" />
                                    <span className="text-gray-900">{user?.email || 'غير محدد'}</span>
                                </div>
                            )}
                        </div>

                        {/* Phone Field */}
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">رقم الهاتف</label>
                            {editMode ? (
                                <input
                                    type="tel"
                                    value={formData.phone}
                                    onChange={(e) => setFormData({...formData, phone: e.target.value})}
                                    className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-orange-500"
                                    placeholder="01xxxxxxxxx"
                                />
                            ) : (
                                <div className="flex items-center gap-3 px-4 py-3 bg-gray-50 rounded-xl">
                                    <Phone size={18} className="text-gray-400" />
                                    <span className="text-gray-900">{user?.phone || 'غير محدد'}</span>
                                </div>
                            )}
                        </div>
                    </div>
                </div>

                {/* Role-based Quick Access */}
                {(user?.role === 'admin' || user?.role === 'manager') && (
                    <button
                        onClick={() => navigate('/admin')}
                        className="w-full bg-gradient-to-r from-purple-500 to-purple-600 text-white rounded-2xl p-5 shadow-md hover:shadow-lg transition-shadow"
                    >
                        <div className="flex items-center gap-4">
                            <div className="w-14 h-14 bg-white/20 rounded-xl flex items-center justify-center">
                                <LayoutDashboard size={28} />
                            </div>
                            <div className="text-right flex-1">
                                <h3 className="font-bold text-lg">لوحة الإدارة</h3>
                                <p className="text-white/80 text-sm">إدارة المنتجات والطلبات والفروع</p>
                            </div>
                            <ChevronLeft size={24} className="rotate-180" />
                        </div>
                    </button>
                )}

                {user?.role === 'distributor' && (
                    <button
                        onClick={() => navigate('/admin/distribution')}
                        className="w-full bg-gradient-to-r from-orange-500 to-orange-600 text-white rounded-2xl p-5 shadow-md hover:shadow-lg transition-shadow"
                    >
                        <div className="flex items-center gap-4">
                            <div className="w-14 h-14 bg-white/20 rounded-xl flex items-center justify-center">
                                <ClipboardList size={28} />
                            </div>
                            <div className="text-right flex-1">
                                <h3 className="font-bold text-lg">لوحة التوزيع</h3>
                                <p className="text-white/80 text-sm">توزيع الطلبات على عمال التوصيل</p>
                            </div>
                            <ChevronLeft size={24} className="rotate-180" />
                        </div>
                    </button>
                )}

                {user?.role === 'delivery' && (
                    <button
                        onClick={() => navigate('/delivery')}
                        className="w-full bg-gradient-to-r from-cyan-500 to-cyan-600 text-white rounded-2xl p-5 shadow-md hover:shadow-lg transition-shadow"
                    >
                        <div className="flex items-center gap-4">
                            <div className="w-14 h-14 bg-white/20 rounded-xl flex items-center justify-center">
                                <Truck size={28} />
                            </div>
                            <div className="text-right flex-1">
                                <h3 className="font-bold text-lg">صفحة التوصيل</h3>
                                <p className="text-white/80 text-sm">إدارة طلبات التوصيل الخاصة بك</p>
                            </div>
                            <ChevronLeft size={24} className="rotate-180" />
                        </div>
                    </button>
                )}

                {user?.role === 'employee' && (
                    <button
                        onClick={() => navigate('/customer-service')}
                        className="w-full bg-gradient-to-r from-green-500 to-green-600 text-white rounded-2xl p-5 shadow-md hover:shadow-lg transition-shadow"
                    >
                        <div className="flex items-center gap-4">
                            <div className="w-14 h-14 bg-white/20 rounded-xl flex items-center justify-center">
                                <Headphones size={28} />
                            </div>
                            <div className="text-right flex-1">
                                <h3 className="font-bold text-lg">خدمة العملاء</h3>
                                <p className="text-white/80 text-sm">الرد على استفسارات العملاء</p>
                            </div>
                            <ChevronLeft size={24} className="rotate-180" />
                        </div>
                    </button>
                )}

                {/* Quick Actions for all users */}
                <div className="grid grid-cols-2 gap-3">
                    <button
                        onClick={() => navigate('/my-orders')}
                        className="bg-white rounded-2xl p-4 shadow-sm hover:shadow-md transition-shadow text-center"
                    >
                        <div className="w-12 h-12 bg-blue-50 text-blue-600 rounded-xl flex items-center justify-center mx-auto mb-2">
                            <Package size={24} />
                        </div>
                        <h3 className="font-bold text-gray-900 text-sm">طلباتي</h3>
                        <p className="text-xs text-gray-500 mt-1">تتبع طلباتك</p>
                    </button>

                    <button
                        onClick={() => navigate('/loyalty')}
                        className="bg-white rounded-2xl p-4 shadow-sm hover:shadow-md transition-shadow text-center"
                    >
                        <div className="w-12 h-12 bg-orange-50 text-orange-600 rounded-xl flex items-center justify-center mx-auto mb-2">
                            <Gift size={24} />
                        </div>
                        <h3 className="font-bold text-gray-900 text-sm">نقاط الولاء</h3>
                        <p className="text-xs text-gray-500 mt-1">اجمع النقاط</p>
                    </button>

                    <button
                        onClick={() => navigate('/addresses')}
                        className="bg-white rounded-2xl p-4 shadow-sm hover:shadow-md transition-shadow text-center"
                    >
                        <div className="w-12 h-12 bg-purple-50 text-purple-600 rounded-xl flex items-center justify-center mx-auto mb-2">
                            <MapPin size={24} />
                        </div>
                        <h3 className="font-bold text-gray-900 text-sm">عناويني</h3>
                        <p className="text-xs text-gray-500 mt-1">إدارة العناوين</p>
                    </button>

                    <button
                        onClick={() => navigate('/branches')}
                        className="bg-white rounded-2xl p-4 shadow-sm hover:shadow-md transition-shadow text-center"
                    >
                        <div className="w-12 h-12 bg-green-50 text-green-600 rounded-xl flex items-center justify-center mx-auto mb-2">
                            <MapPin size={24} />
                        </div>
                        <h3 className="font-bold text-gray-900 text-sm">فروعنا</h3>
                        <p className="text-xs text-gray-500 mt-1">مواقع الفروع</p>
                    </button>
                </div>

                {/* Logout Button */}
                <button
                    onClick={handleLogout}
                    className="w-full bg-white rounded-2xl p-4 shadow-sm flex items-center justify-center gap-3 text-red-600 hover:bg-red-50 transition-colors"
                >
                    <LogOut size={20} />
                    <span className="font-bold">تسجيل الخروج</span>
                </button>
            </div>
            </div>
            <Footer />
        </div>
    );
};

export default ProfilePage;
