import React, { useState, useEffect } from 'react';
import { User, LogOut, ChevronRight, UserPlus, Globe, MessageCircle, MapPinned, ExternalLink } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useLanguage } from '../context/LanguageContext';
import Footer from '../components/Footer';
import { api } from '../services/api';

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
    const { user, logout } = useAuth();
    const { language, setLanguage, t } = useLanguage();
    const [branches, setBranches] = useState<Branch[]>([]);
    const [loadingBranches, setLoadingBranches] = useState(true);

    useEffect(() => {
        fetchBranches();
    }, []);

    const fetchBranches = async () => {
        try {
            const response = await api.branches.getAll();
            console.log('Branches loaded:', response);
            // API returns array directly, not wrapped in .data
            setBranches(Array.isArray(response) ? response : []);
        } catch (error) {
            console.error('Failed to fetch branches:', error);
        } finally {
            setLoadingBranches(false);
        }
    };

    const handleInviteFriend = () => {
        const shareText = language === 'ar' 
            ? 'تسوق معنا في Shop Allosh واحصل على أفضل العروض! 🛒'
            : 'Shop with us at Shop Allosh and get the best offers! 🛒';
        const shareUrl = window.location.origin;
        
        if (navigator.share) {
            navigator.share({
                title: 'Shop Allosh',
                text: shareText,
                url: shareUrl,
            }).catch(err => console.log('Error sharing:', err));
        } else {
            navigator.clipboard.writeText(`${shareText}\n${shareUrl}`);
            alert(language === 'ar' ? 'تم نسخ رابط الدعوة!' : 'Invitation link copied!');
        }
    };

    const handleLanguageSwitch = () => {
        const newLang = language === 'ar' ? 'en' : 'ar';
        setLanguage(newLang);
    };

    const handleWhatsAppSupport = () => {
        // Replace with actual WhatsApp number
        window.open('https://wa.me/+201234567890', '_blank');
    };

    const handleBranchClick = (branch: Branch) => {
        if (branch.google_maps_link) {
            window.open(branch.google_maps_link, '_blank');
        } else {
            alert(language === 'ar' 
                ? 'رابط الخريطة غير متوفر لهذا الفرع'
                : 'Map link not available for this branch');
        }
    };

    const handleLogout = () => {
        if (confirm(t('confirm_logout'))) {
            logout();
            navigate('/');
        }
    };

    const menuItems = [
        { 
            icon: User, 
            label: t('my_profile'), 
            action: () => navigate('/profile'),
            show: true
        },
        { 
            icon: UserPlus, 
            label: t('invite_friend'), 
            action: handleInviteFriend, 
            highlighted: true,
            show: true
        },
        { 
            icon: Globe, 
            label: language === 'ar' ? 'اللغة (English)' : 'Language (عربي)', 
            action: handleLanguageSwitch, 
            highlighted: true,
            show: true
        },
        { 
            icon: MessageCircle, 
            label: t('customer_support'), 
            action: () => navigate('/chat'),
            show: true
        },
    ];

    return (
        <div className="bg-gray-50 min-h-screen pb-24">
            {/* Header */}
            <div className="bg-gradient-to-br from-orange-500 to-orange-600 p-6 pt-12 text-white relative overflow-hidden">
                {/* Decorative circles */}
                <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full -translate-y-1/2 translate-x-1/2"></div>
                <div className="absolute bottom-0 left-0 w-24 h-24 bg-white/10 rounded-full translate-y-1/2 -translate-x-1/2"></div>
                
                <div className="relative z-10">
                    <h1 className="text-3xl font-bold mb-2">
                        {user ? (
                            language === 'ar' 
                                ? `مرحباً، ${user.name || 'ضيف'}!` 
                                : `Hello, ${user.name || 'Guest'}!`
                        ) : (
                            language === 'ar' ? 'مرحباً، ضيف!' : 'Hello, Guest!'
                        )}
                    </h1>
                    <p className="text-white/90">
                        {language === 'ar' 
                            ? user ? 'إليك كل ما تحتاجه في مكان واحد' : 'سجل دخولك لعرض طلباتك ونقاطك' 
                            : user ? 'Everything you need in one place' : 'Log in to view your orders and points'}
                    </p>
                </div>
            </div>

            <div className="p-4 -mt-4 space-y-4">
                {/* Main Menu */}
                <div className="bg-white rounded-2xl shadow-sm overflow-hidden">
                    {menuItems.filter(item => item.show).map((item, idx) => (
                        <button
                            key={idx}
                            onClick={item.action}
                            className="w-full flex items-center justify-between p-4 hover:bg-gray-50 active:bg-gray-100 border-b border-gray-100 last:border-0 transition-colors text-right"
                        >
                            <div className="flex items-center space-x-3 space-x-reverse">
                                <div className={`p-2 rounded-lg ${item.highlighted ? 'bg-green-50 text-green-600' : 'bg-orange-50 text-orange-600'}`}>
                                    <item.icon size={20} />
                                </div>
                                <span className="font-medium text-gray-900">{item.label}</span>
                            </div>
                            <ChevronRight size={20} className="text-gray-400 rotate-180" />
                        </button>
                    ))}

                    {/* Logout Button */}
                    {user && (
                        <button 
                            onClick={handleLogout}
                            className="w-full flex items-center justify-between p-4 hover:bg-red-50 active:bg-red-100 transition-colors text-red-600 text-right"
                        >
                            <div className="flex items-center space-x-3 space-x-reverse">
                                <div className="bg-red-50 p-2 rounded-lg">
                                    <LogOut size={20} />
                                </div>
                                <span className="font-medium">
                                    {t('logout')}
                                </span>
                            </div>
                        </button>
                    )}
                </div>

                {/* Branches Section */}
                <div className="bg-white rounded-2xl shadow-sm overflow-hidden p-4">
                    <div className="flex items-center gap-2 mb-4">
                        <MapPinned className="text-orange-500" size={24} />
                        <h2 className="text-lg font-bold text-gray-900">
                            {t('branches')}
                        </h2>
                    </div>
                    
                    {loadingBranches ? (
                        <div className="text-center py-8 text-gray-500">
                            <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-orange-500 mx-auto mb-2"></div>
                            {t('loading')}
                        </div>
                    ) : branches.length > 0 ? (
                        <div className="space-y-3">
                            {branches.map((branch) => (
                                <button
                                    key={branch.id}
                                    onClick={() => handleBranchClick(branch)}
                                    className="w-full bg-gradient-to-r from-gray-50 to-gray-100 hover:from-orange-50 hover:to-orange-100 rounded-xl p-4 transition-all text-right border border-gray-200 hover:border-orange-300"
                                >
                                    <div className="flex items-start justify-between gap-3">
                                        <div className="flex-1">
                                            <h3 className="font-bold text-gray-900 mb-1 text-lg">
                                                {language === 'ar' ? branch.name_ar || branch.name : branch.name}
                                            </h3>
                                            <p className="text-sm text-gray-600 mb-2 leading-relaxed">
                                                📍 {branch.address}
                                            </p>
                                            {branch.phone && (
                                                <p className="text-sm text-orange-600 font-medium flex items-center gap-1" dir="ltr">
                                                    📞 {branch.phone}
                                                </p>
                                            )}
                                        </div>
                                        {branch.google_maps_link && (
                                            <div className="flex-shrink-0">
                                                <ExternalLink className="text-orange-500" size={20} />
                                            </div>
                                        )}
                                    </div>
                                </button>
                            ))}
                        </div>
                    ) : (
                        <div className="text-center py-8">
                            <MapPinned size={48} className="text-gray-300 mx-auto mb-2" />
                            <p className="text-gray-500">
                                {language === 'ar' ? 'لا توجد فروع متاحة حالياً' : 'No branches available'}
                            </p>
                        </div>
                    )}
                </div>

                {/* WhatsApp Support Button */}
                <button
                    onClick={handleWhatsAppSupport}
                    className="w-full bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 text-white font-bold py-4 rounded-2xl shadow-lg flex items-center justify-center gap-3 transition-all active:scale-95"
                >
                    <MessageCircle size={24} />
                    <span className="text-lg">
                        {t('whatsapp_support')}
                    </span>
                </button>

                {/* Info Text */}
                <p className="text-center text-gray-500 text-sm px-4">
                    {language === 'ar' 
                        ? 'نحن هنا لخدمتك دائماً 🛒'
                        : 'We are always here to serve you 🛒'}
                </p>
            </div>
            <Footer />
        </div>
    );
};

export default MorePage;
