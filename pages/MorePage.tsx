import React, { useState, useEffect } from 'react';
import { User, LogOut, ChevronRight, Package, Heart, Gift, MapPin, CreditCard, Globe, MessageSquare, MapPinned, HelpCircle, Shield, FileText, LogIn, ClipboardList, Phone } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useLanguage } from '../context/LanguageContext';
import { useFavorites } from '../context/FavoritesContext';

interface Branch {
    id: number;
    name: string;
    name_ar?: string;
    address: string;
    phone?: string;
    google_maps_link?: string;
}

const MorePage = () => {
    const navigate = useNavigate();
    const { user, isAuthenticated, logout } = useAuth();
    const { language, setLanguage } = useLanguage();
    const { favorites } = useFavorites();

    const handleLogout = () => {
        if (confirm('هل تريد تسجيل الخروج؟')) {
            logout();
            navigate('/');
        }
    };

    const handleLanguageSwitch = () => {
        const newLang = language === 'ar' ? 'en' : 'ar';
        setLanguage(newLang);
    };

    const menuItems = [
        {
            icon: Package,
            label: 'طلباتي',
            iconBg: 'bg-orange-100',
            iconColor: 'text-orange-600',
            route: '/my-orders',
            requireAuth: true
        },
        {
            icon: Heart,
            label: 'قائمة الرغبات',
            iconBg: 'bg-pink-100',
            iconColor: 'text-pink-600',
            route: '/favorites',
            requireAuth: false,
            badge: favorites.length > 0 ? favorites.length : null
        },
        {
            icon: Gift,
            label: 'نقاطي',
            iconBg: 'bg-amber-100',
            iconColor: 'text-amber-600',
            route: '/loyalty',
            requireAuth: true
        },
        {
            icon: MapPinned,
            label: 'فروعنا',
            iconBg: 'bg-teal-100',
            iconColor: 'text-teal-600',
            route: '/branches'
        },
        {
            icon: HelpCircle,
            label: 'الأسئلة الشائعة',
            iconBg: 'bg-yellow-100',
            iconColor: 'text-yellow-600',
            route: '/general-faq'
        },
        {
            icon: Shield,
            label: 'سياسة الخصوصية',
            iconBg: 'bg-purple-100',
            iconColor: 'text-purple-600',
            route: '/privacy-policy'
        },
        {
            icon: Globe,
            label: 'تغيير اللغة',
            iconBg: 'bg-cyan-100',
            iconColor: 'text-cyan-600',
            action: handleLanguageSwitch,
            rightText: language === 'ar' ? 'English' : 'العربية'
        },
        {
            icon: MessageSquare,
            label: 'إرسال مقترحات',
            iconBg: 'bg-indigo-100',
            iconColor: 'text-indigo-600',
            route: '/chat',
            requireAuth: true
        }
    ];

    const handleItemClick = (item: any) => {
        if (item.requireAuth && !isAuthenticated) {
            navigate('/login');
            return;
        }

        if (item.action) {
            item.action();
        } else if (item.route) {
            navigate(item.route);
        }
    };

    return (
        <div className="min-h-screen bg-gray-50">
            {/* Header - New Design matching the screenshot */}
            <div className="bg-white border-b border-gray-100">
                <div className="max-w-7xl mx-auto px-4 py-4">
                    <div className="flex items-center justify-between">
                        {/* Back Button - Right Side (RTL) */}
                        <button
                            onClick={() => navigate(-1)}
                            className="w-12 h-12 rounded-full bg-gray-50 border border-gray-200 flex items-center justify-center hover:bg-gray-100 transition-colors"
                        >
                            <ChevronRight size={20} className="text-gray-700" />
                        </button>

                        {/* Center Content */}
                        <div className="flex-1 flex items-center justify-center gap-3">
                            <button
                                onClick={() => navigate('/profile')}
                                className="w-10 h-10 rounded-full bg-orange-100 flex items-center justify-center hover:bg-orange-200 transition-colors"
                                title="الملف الشخصي"
                            >
                                <User size={20} className="text-orange-600" />
                            </button>
                            <h1 className="text-2xl font-bold text-gray-900">المزيد</h1>
                        </div>

                        {/* WhatsApp Button - Left Side (RTL) */}
                        <a
                            href="https://wa.me/201091658495"
                            target="_blank"
                            rel="noopener noreferrer"
                            className="w-12 h-12 rounded-full bg-gray-50 border border-gray-200 flex items-center justify-center hover:bg-green-50 hover:border-green-500 transition-colors group"
                            title="تواصل معنا عبر واتساب"
                        >
                            <MessageSquare size={20} className="text-gray-700 group-hover:text-green-600 transition-colors" />
                        </a>
                    </div>
                </div>
            </div>

            {/* Login Button for Guests */}
            {!isAuthenticated && (
                <div className="mx-4 mt-4">
                    <button
                        onClick={() => navigate('/login')}
                        className="w-full bg-gradient-to-r from-brand-orange to-orange-600 text-white px-6 py-4 rounded-2xl font-bold text-lg shadow-lg hover:shadow-xl transition-all flex items-center justify-center gap-3"
                    >
                        <LogIn size={24} />
                        <span>تسجيل الدخول</span>
                    </button>
                </div>
            )}

            {/* Profile Button for Authenticated Users */}
            {isAuthenticated && (
                <div className="mx-4 mt-4">
                    <button
                        onClick={() => navigate('/profile')}
                        className="w-full bg-gradient-to-r from-blue-500 to-blue-600 text-white px-6 py-4 rounded-2xl font-bold text-lg shadow-lg hover:shadow-xl transition-all flex items-center justify-center gap-3"
                    >
                        <User size={24} />
                        <span>البروفايل</span>
                    </button>
                </div>
            )}

            {/* Menu Items */}
            <div className="bg-white mt-4 divide-y divide-gray-100">
                {menuItems.map((item, index) => (
                    <button
                        key={index}
                        onClick={() => handleItemClick(item)}
                        className="w-full flex items-center justify-between px-4 py-4 hover:bg-gray-50 active:bg-gray-100 transition-colors"
                    >
                        <div className="flex items-center gap-4">
                            <div className={`${item.iconBg} ${item.iconColor} p-2.5 rounded-xl`}>
                                <item.icon className="w-6 h-6" />
                            </div>
                            <span className="text-gray-900 font-medium text-base">{item.label}</span>
                        </div>
                        <div className="flex items-center gap-2">
                            {item.badge && (
                                <span className="bg-red-500 text-white text-xs font-bold px-2 py-0.5 rounded-full">
                                    {item.badge}
                                </span>
                            )}
                            {item.rightText ? (
                                <span className="text-gray-500 text-sm">{item.rightText}</span>
                            ) : (
                                <ChevronRight className="w-5 h-5 text-gray-400" />
                            )}
                        </div>
                    </button>
                ))}

                {/* Logout Button - More prominent */}
                {isAuthenticated && (
                    <button
                        onClick={handleLogout}
                        className="w-full flex items-center justify-between px-4 py-5 hover:bg-red-50 active:bg-red-100 transition-colors border-t-2 border-red-100"
                    >
                        <div className="flex items-center gap-4">
                            <div className="bg-red-100 text-red-600 p-3 rounded-xl">
                                <LogOut className="w-6 h-6" />
                            </div>
                            <span className="text-red-600 font-bold text-lg">تسجيل خروج</span>
                        </div>
                        <ChevronRight className="w-5 h-5 text-red-400" />
                    </button>
                )}
            </div>

            {/* App Info */}
            <div className="px-4 py-6 text-center text-gray-400 text-xs space-y-1">
                <p>نسخة التطبيق 2.1.0</p>
                <p>© 2025 علوش ماركت - جميع الحقوق محفوظة</p>
            </div>
        </div>
    );
};

export default MorePage;
