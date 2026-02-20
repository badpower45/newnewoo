import React from 'react';
import { LogOut, ChevronRight, Package, Heart, Gift, Globe, MessageSquare, MapPinned, HelpCircle, Shield, LogIn, Tag } from 'lucide-react';
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
    const { language, setLanguage, t } = useLanguage();
    const { favorites } = useFavorites();

    const handleLogout = () => {
        if (confirm(t('confirm_logout'))) {
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
            label: t('my_orders'),
            iconBg: 'bg-orange-100',
            iconColor: 'text-orange-600',
            route: '/my-orders',
            requireAuth: true
        },
        {
            icon: Heart,
            label: t('favorites'),
            iconBg: 'bg-pink-100',
            iconColor: 'text-pink-600',
            route: '/favorites',
            requireAuth: false,
            badge: favorites.length > 0 ? favorites.length : null
        },
        {
            icon: Gift,
            label: t('loyalty_points'),
            iconBg: 'bg-amber-100',
            iconColor: 'text-amber-600',
            route: '/loyalty',
            requireAuth: true
        },
        {
            icon: Tag,
            label: language === 'ar' ? 'كل أكواد الخصم' : 'All Discount Codes',
            iconBg: 'bg-green-100',
            iconColor: 'text-green-600',
            route: '/discount-codes'
        },
        {
            icon: MapPinned,
            label: t('branches'),
            iconBg: 'bg-teal-100',
            iconColor: 'text-teal-600',
            route: '/branches'
        },
        {
            icon: HelpCircle,
            label: t('faq'),
            iconBg: 'bg-yellow-100',
            iconColor: 'text-yellow-600',
            route: '/general-faq'
        },
        {
            icon: Shield,
            label: t('privacy_policy'),
            iconBg: 'bg-purple-100',
            iconColor: 'text-purple-600',
            route: '/privacy-policy'
        },
        {
            icon: Globe,
            label: t('switch_language'),
            iconBg: 'bg-gray-100',
            iconColor: 'text-gray-400',
            disabled: true,
            rightText: 'قريباً'
        },
        {
            icon: MessageSquare,
            label: t('contact_us'),
            iconBg: 'bg-indigo-100',
            iconColor: 'text-indigo-600',
            route: '/chat',
            requireAuth: true
        }
    ];

    const handleItemClick = (item: any) => {
        if (item.disabled) return;
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
                        <div className="flex-1 flex items-center justify-center">
                            <h1 className="text-2xl font-bold text-gray-900">{t('more')}</h1>
                        </div>

                        {/* Left Actions */}
                        <div className="flex items-center gap-2">
                            {/* WhatsApp Button */}
                            <a
                                href="https://wa.me/201091658495"
                                target="_blank"
                                rel="noopener noreferrer"
                                className="w-12 h-12 rounded-full bg-gray-50 border border-gray-200 flex items-center justify-center hover:bg-green-50 hover:border-green-500 transition-colors group"
                                title="تواصل معنا عبر واتساب"
                            >
                                <svg
                                    viewBox="0 0 32 32"
                                    className="w-5 h-5 text-gray-700 group-hover:text-green-600 transition-colors"
                                    fill="currentColor"
                                    aria-hidden="true"
                                >
                                    <path d="M23.328 19.177c-0.401-0.203-2.354-1.156-2.719-1.292-0.365-0.13-0.63-0.198-0.896 0.203-0.26 0.391-1.026 1.286-1.26 1.547s-0.464 0.281-0.859 0.104c-0.401-0.203-1.682-0.62-3.203-1.984-1.188-1.057-1.979-2.359-2.214-2.76-0.234-0.396-0.026-0.62 0.172-0.818 0.182-0.182 0.401-0.458 0.604-0.698 0.193-0.24 0.255-0.401 0.396-0.661 0.13-0.281 0.063-0.5-0.036-0.698s-0.896-2.161-1.229-2.943c-0.318-0.776-0.651-0.677-0.896-0.677-0.229-0.021-0.495-0.021-0.76-0.021s-0.698 0.099-1.063 0.479c-0.365 0.401-1.396 1.359-1.396 3.297 0 1.943 1.427 3.823 1.625 4.104 0.203 0.26 2.807 4.26 6.802 5.979 0.953 0.401 1.693 0.641 2.271 0.839 0.953 0.302 1.823 0.26 2.51 0.161 0.76-0.125 2.354-0.964 2.688-1.901 0.339-0.943 0.339-1.724 0.24-1.901-0.099-0.182-0.359-0.281-0.76-0.458zM16.083 29h-0.021c-2.365 0-4.703-0.641-6.745-1.839l-0.479-0.286-5 1.302 1.344-4.865-0.323-0.5c-1.318-2.099-2.021-4.521-2.021-7.010 0-7.26 5.943-13.182 13.255-13.182 3.542 0 6.865 1.38 9.365 3.88 2.5 2.479 3.88 5.802 3.88 9.323-0.010 7.255-5.948 13.177-13.25 13.177zM27.359 4.599c-3.042-2.938-7.042-4.599-11.297-4.599-8.776 0-15.922 7.115-15.927 15.859 0 2.792 0.729 5.516 2.125 7.927l-2.26 8.214 8.448-2.203c2.328 1.255 4.948 1.927 7.615 1.932h0.005c8.781 0 15.927-7.115 15.932-15.865 0-4.234-1.651-8.219-4.661-11.214z" />
                                </svg>
                            </a>
                            {/* Messages Button */}
                            <button
                                onClick={() => navigate('/chat')}
                                className="w-12 h-12 rounded-full bg-gray-50 border border-gray-200 flex items-center justify-center hover:bg-gray-100 transition-colors"
                                title="الرسائل"
                            >
                                <MessageSquare size={20} className="text-gray-700" />
                            </button>
                        </div>
                    </div>
                </div>
            </div>

            {/* Profile Section */}
            <div className="mx-4 mt-4">
                {isAuthenticated ? (
                    <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-4 flex items-center justify-between">
                        <div className="flex items-center gap-3">
                            {user?.avatar ? (
                                <img
                                    src={user.avatar}
                                    alt={user.name}
                                    className="w-12 h-12 rounded-full object-cover border border-gray-200"
                                />
                            ) : (
                                <div className="w-12 h-12 rounded-full bg-orange-100 text-orange-600 flex items-center justify-center font-bold">
                                    {user?.name?.charAt(0) || 'ع'}
                                </div>
                            )}
                            <div>
                                <p className="text-xs text-gray-500">{t('my_profile')}</p>
                                <p className="text-base font-bold text-gray-900">{user?.name || t('profile')}</p>
                                <p className="text-xs text-gray-500">{user?.phone || user?.email || ''}</p>
                            </div>
                        </div>
                        <button
                            onClick={() => navigate('/profile')}
                            className="px-4 py-2 rounded-xl bg-gray-50 text-gray-800 text-sm font-semibold hover:bg-gray-100 transition-colors"
                        >
                            {t('edit_profile')}
                        </button>
                    </div>
                ) : (
                    <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-4 flex items-center justify-between">
                        <div>
                            <p className="text-sm font-bold text-gray-900">{t('login')}</p>
                            <p className="text-xs text-gray-500">{language === 'ar' ? 'عشان تتابع طلباتك وتستخدم نقاطك' : 'Track your orders and use your points'}</p>
                        </div>
                        <button
                            onClick={() => navigate('/login')}
                            className="px-4 py-2 rounded-xl bg-brand-orange text-white text-sm font-semibold hover:bg-orange-600 transition-colors flex items-center gap-2"
                        >
                            <LogIn size={16} />
                            {t('login')}
                        </button>
                    </div>
                )}
            </div>

            {/* Menu Items */}
            <div className="bg-white mt-4 divide-y divide-gray-100">
                {menuItems.map((item, index) => (
                    <button
                        key={index}
                        onClick={() => handleItemClick(item)}
                        disabled={item.disabled}
                        className={`w-full flex items-center justify-between px-4 py-4 transition-colors ${
                            item.disabled
                                ? 'opacity-50 cursor-not-allowed'
                                : 'hover:bg-gray-50 active:bg-gray-100'
                        }`}
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
                            {item.disabled ? (
                                <span className="bg-orange-100 text-orange-500 text-xs font-bold px-2.5 py-1 rounded-full">
                                    قريباً
                                </span>
                            ) : item.rightText ? (
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
                            <span className="text-red-600 font-bold text-lg">{t('logout')}</span>
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
