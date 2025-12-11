import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { useLanguage } from '../context/LanguageContext';
import { useNavigate } from 'react-router-dom';
import { User, Mail, LogOut, Package, ChevronLeft, Edit2, Award, Clock, MessageCircle, Headphones, LayoutDashboard, Truck, ClipboardList } from 'lucide-react';
import { api } from '../services/api';
import LoadingSpinner from '../components/LoadingSpinner';
import Footer from '../components/Footer';
import ErrorMessage from '../components/ErrorMessage';
import { ORDER_STATUS_LABELS } from '../src/config';

const ProfilePage = () => {
    const { user, logout } = useAuth();
    const { t, language } = useLanguage();
    const navigate = useNavigate();
    const [orders, setOrders] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [editMode, setEditMode] = useState(false);
    const [formData, setFormData] = useState({
        name: user?.name || '',
        email: user?.email || ''
    });

    useEffect(() => {
        if (user && !user.isGuest) {
            fetchOrders();
        }
    }, [user]);

    const fetchOrders = async () => {
        if (!user || user.isGuest) return;
        setLoading(true);
        setError(null);
        try {
            const data = await api.orders.getAll(String(user.id));
            if (data.data) {
                setOrders(data.data);
            }
        } catch (err) {
            setError('فشل تحميل الطلبات');
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    const handleLogout = () => {
        logout();
        navigate('/');
    };

    const handleUpdateProfile = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!user) return;

        try {
            await api.users.update(String(user.id), formData);
            alert('تم تحديث الملف الشخصي بنجاح');
            setEditMode(false);
            window.location.reload();
        } catch (err) {
            alert('فشل تحديث الملف الشخصي');
            console.error(err);
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

    return (
        <div className="min-h-screen bg-gray-50 pb-24">
            {/* Header */}
            <div className="bg-white p-4 shadow-sm sticky top-0 z-10">
                <div className="max-w-2xl mx-auto flex items-center">
                    <button onClick={() => navigate('/')} className="p-2 hover:bg-gray-100 rounded-full mr-2">
                        <ChevronLeft size={24} className="text-gray-700" />
                    </button>
                    <h1 className="text-xl font-bold text-gray-900">{t('my_profile')}</h1>
                </div>
            </div>

            <div className="max-w-2xl mx-auto p-4 space-y-4">
                {/* User Info Card */}
                <div className="bg-white rounded-2xl p-6 shadow-sm flex items-center space-x-4">
                    <div className="w-16 h-16 bg-orange-100 rounded-full flex items-center justify-center text-primary text-2xl font-bold">
                        {user.name ? user.name.charAt(0).toUpperCase() : <User />}
                    </div>
                    <div>
                        <h2 className="text-xl font-bold text-gray-900">{user.name || 'Guest User'}</h2>
                        <div className="flex items-center text-gray-500 text-sm mt-1">
                            <Mail size={14} className="mr-1" />
                            {user.email || 'No email linked'}
                        </div>
                    </div>
                </div>


                {/* Loyalty Points Card */}
                <div className="bg-gradient-to-r from-brand-orange to-orange-400 rounded-2xl p-6 shadow-sm text-white relative overflow-hidden">
                    <div className="relative z-10">
                        <h3 className="text-lg font-bold mb-1">{t('loyalty_points')}</h3>
                        <div className="text-4xl font-extrabold mb-2">{user.loyaltyPoints || 0}</div>
                        <p className="text-sm opacity-90">نقطة مكتسبة من مشترياتك</p>
                    </div>
                    <div className="absolute right-0 bottom-0 opacity-10 transform translate-x-4 translate-y-4">
                        <Package size={120} />
                    </div>
                </div>

                {/* Menu Options */}
                <div className="bg-white rounded-2xl shadow-sm overflow-hidden">
                    {/* Admin Dashboard for Admins/Managers */}
                    {user.role && ['manager', 'admin'].includes(user.role) && (
                        <button
                            onClick={() => navigate('/admin')}
                            className="w-full p-4 border-b border-gray-100 flex items-center justify-between hover:bg-purple-50 transition-colors text-right"
                        >
                            <div className="flex items-center space-x-3 space-x-reverse">
                                <div className="bg-purple-50 p-2 rounded-lg text-purple-600">
                                    <LayoutDashboard size={20} />
                                </div>
                                <div className="text-right">
                                    <span className="font-medium text-gray-900 block">لوحة الإدارة</span>
                                    <span className="text-xs text-gray-500">إدارة المنتجات والطلبات والفروع</span>
                                </div>
                            </div>
                            <ChevronLeft size={18} className="text-gray-400 rotate-180" />
                        </button>
                    )}

                    {/* Order Distributor Dashboard */}
                    {user.role === 'distributor' && (
                        <button
                            onClick={() => navigate('/admin/distribution')}
                            className="w-full p-4 border-b border-gray-100 flex items-center justify-between hover:bg-orange-50 transition-colors text-right"
                        >
                            <div className="flex items-center space-x-3 space-x-reverse">
                                <div className="bg-orange-50 p-2 rounded-lg text-orange-600">
                                    <ClipboardList size={20} />
                                </div>
                                <div className="text-right">
                                    <span className="font-medium text-gray-900 block">لوحة توزيع الطلبات</span>
                                    <span className="text-xs text-gray-500">توزيع الطلبات على عمال التوصيل</span>
                                </div>
                            </div>
                            <ChevronLeft size={18} className="text-gray-400 rotate-180" />
                        </button>
                    )}

                    {/* Delivery Driver Page */}
                    {user.role === 'delivery' && (
                        <button
                            onClick={() => navigate('/delivery')}
                            className="w-full p-4 border-b border-gray-100 flex items-center justify-between hover:bg-cyan-50 transition-colors text-right"
                        >
                            <div className="flex items-center space-x-3 space-x-reverse">
                                <div className="bg-cyan-50 p-2 rounded-lg text-cyan-600">
                                    <Truck size={20} />
                                </div>
                                <div className="text-right">
                                    <span className="font-medium text-gray-900 block">صفحة التوصيل</span>
                                    <span className="text-xs text-gray-500">إدارة طلباتك والتوصيل</span>
                                </div>
                            </div>
                            <ChevronLeft size={18} className="text-gray-400 rotate-180" />
                        </button>
                    )}

                    {/* Customer Service Dashboard for Employees/Managers/Admins */}
                    {user.role && ['employee', 'manager', 'admin'].includes(user.role) && (
                        <button
                            onClick={() => navigate('/customer-service')}
                            className="w-full p-4 border-b border-gray-100 flex items-center justify-between hover:bg-orange-50 transition-colors text-right"
                        >
                            <div className="flex items-center space-x-3 space-x-reverse">
                                <div className="bg-orange-50 p-2 rounded-lg text-primary">
                                    <Headphones size={20} />
                                </div>
                                <div className="text-right">
                                    <span className="font-medium text-gray-900 block">لوحة خدمة العملاء</span>
                                    <span className="text-xs text-gray-500">الرد على استفسارات العملاء</span>
                                </div>
                            </div>
                            <ChevronLeft size={18} className="text-gray-400 rotate-180" />
                        </button>
                    )}

                    {/* Customer Chat for Regular Customers */}
                    {(!user.role || user.role === 'customer') && (
                        <button
                            onClick={() => navigate('/chat')}
                            className="w-full p-4 border-b border-gray-100 flex items-center justify-between hover:bg-green-50 transition-colors text-right"
                        >
                            <div className="flex items-center space-x-3 space-x-reverse">
                                <div className="bg-green-50 p-2 rounded-lg text-green-600">
                                    <MessageCircle size={20} />
                                </div>
                                <div className="text-right">
                                    <span className="font-medium text-gray-900 block">تحدث مع خدمة العملاء</span>
                                    <span className="text-xs text-gray-500">نحن هنا لمساعدتك</span>
                                </div>
                            </div>
                            <ChevronLeft size={18} className="text-gray-400 rotate-180" />
                        </button>
                    )}

                    <button
                        onClick={() => navigate('/my-orders')}
                        className="w-full p-4 border-b border-gray-100 flex items-center justify-between hover:bg-blue-50 cursor-pointer transition-colors text-right"
                    >
                        <div className="flex items-center space-x-3 space-x-reverse">
                            <div className="bg-blue-50 p-2 rounded-lg text-blue-600">
                                <Package size={20} />
                            </div>
                            <div className="text-right">
                                <span className="font-medium text-gray-900 block">{t('my_orders')}</span>
                                <span className="text-xs text-gray-500">تتبع طلباتك وحالتها</span>
                            </div>
                        </div>
                        <ChevronLeft size={18} className="text-gray-400 rotate-180" />
                    </button>

                    <button
                        onClick={handleLogout}
                        className="w-full p-4 flex items-center space-x-3 space-x-reverse hover:bg-red-50 text-red-600 transition-colors text-right"
                    >
                        <div className="bg-red-50 p-2 rounded-lg">
                            <LogOut size={20} />
                        </div>
                        <span className="font-medium">Log Out</span>
                    </button>
                </div>
            </div>
            <Footer />
        </div>
    );
};

export default ProfilePage;
