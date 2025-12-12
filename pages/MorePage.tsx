import React, { useState, useEffect } from 'react';
import { User, LogOut, ChevronLeft, Package, Heart, Gift, MapPin, CreditCard, Globe, MessageSquare, MapPinned, HelpCircle } from 'lucide-react';
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
            route: '/orders',
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
            icon: User,
            label: 'الصفحة الشخصية',
            iconBg: 'bg-blue-100',
            iconColor: 'text-blue-600',
            route: '/profile',
            requireAuth: true
        },
        {
            icon: MapPin,
            label: 'العناوين',
            iconBg: 'bg-red-100',
            iconColor: 'text-red-600',
            route: '/addresses',
            requireAuth: true
        },
        {
            icon: CreditCard,
            label: 'بطاقات الدفع',
            iconBg: 'bg-purple-100',
            iconColor: 'text-purple-600',
            route: '/payment-methods',
            requireAuth: true
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
            label: 'إرسال الاقتراح',
            iconBg: 'bg-indigo-100',
            iconColor: 'text-indigo-600',
            route: '/feedback'
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
            label: 'طلب المساعدة',
            iconBg: 'bg-yellow-100',
            iconColor: 'text-yellow-600',
            route: '/help'
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
        <div className="min-h-screen bg-gray-50 pb-24">
            {/* Header */}
            <div className="bg-white px-4 py-4 text-center border-b border-gray-200">
                <h1 className="text-xl font-bold text-gray-900">المزيد</h1>
            </div>

            {/* Menu Items */}
            <div className="bg-white mt-2 divide-y divide-gray-100">
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
                                <ChevronLeft className="w-5 h-5 text-gray-400" />
                            )}
                        </div>
                    </button>
                ))}

                {/* Logout Button */}
                {isAuthenticated && (
                    <button
                        onClick={handleLogout}
                        className="w-full flex items-center justify-between px-4 py-4 hover:bg-red-50 active:bg-red-100 transition-colors"
                    >
                        <div className="flex items-center gap-4">
                            <div className="bg-red-100 text-red-600 p-2.5 rounded-xl">
                                <LogOut className="w-6 h-6" />
                            </div>
                            <span className="text-red-600 font-medium text-base">تسجيل خروج</span>
                        </div>
                        <ChevronLeft className="w-5 h-5 text-red-400" />
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
