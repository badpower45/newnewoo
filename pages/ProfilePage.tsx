import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import { User, Mail, LogOut, Package, ChevronLeft, Edit2, Award, Clock } from 'lucide-react';
import { api } from '../services/api';
import LoadingSpinner from '../components/LoadingSpinner';
import ErrorMessage from '../components/ErrorMessage';
import { ORDER_STATUS_LABELS } from '../src/config';

const ProfilePage = () => {
    const { user, logout } = useAuth();
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
        if (user) {
            fetchOrders();
        }
    }, [user]);

    const fetchOrders = async () => {
        if (!user) return;
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
                    <h1 className="text-xl font-bold text-gray-900">My Profile</h1>
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
                        <h3 className="text-lg font-bold mb-1">نقاط الولاء</h3>
                        <div className="text-4xl font-extrabold mb-2">{user.loyaltyPoints || 0}</div>
                        <p className="text-sm opacity-90">نقطة مكتسبة من مشترياتك</p>
                    </div>
                    <div className="absolute right-0 bottom-0 opacity-10 transform translate-x-4 translate-y-4">
                        <Package size={120} />
                    </div>
                </div>

                {/* Menu Options */}
                <div className="bg-white rounded-2xl shadow-sm overflow-hidden">
                    <div className="p-4 border-b border-gray-100 flex items-center justify-between hover:bg-gray-50 cursor-pointer transition-colors">
                        <div className="flex items-center space-x-3">
                            <div className="bg-blue-50 p-2 rounded-lg text-blue-600">
                                <Package size={20} />
                            </div>
                            <span className="font-medium text-gray-900">My Orders</span>
                        </div>
                        <span className="text-xs text-gray-400">Coming Soon</span>
                    </div>

                    <button
                        onClick={handleLogout}
                        className="w-full p-4 flex items-center space-x-3 hover:bg-red-50 text-red-600 transition-colors text-left"
                    >
                        <div className="bg-red-50 p-2 rounded-lg">
                            <LogOut size={20} />
                        </div>
                        <span className="font-medium">Log Out</span>
                    </button>
                </div>
            </div>
        </div>
    );
};

export default ProfilePage;
