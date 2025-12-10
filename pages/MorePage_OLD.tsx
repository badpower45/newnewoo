import React, { useState, useEffect } from 'react';
import { User, LogOut, ChevronRight, UserPlus, Globe, MessageCircle, MapPinned, ExternalLink } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
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
    const [currentLang, setCurrentLang] = useState<'ar' | 'en'>('ar');
    const [branches, setBranches] = useState<Branch[]>([]);
    const [loadingBranches, setLoadingBranches] = useState(true);

    useEffect(() => {
        const savedLang = localStorage.getItem('language') as 'ar' | 'en';
        if (savedLang) {
            setCurrentLang(savedLang);
            document.documentElement.dir = savedLang === 'ar' ? 'rtl' : 'ltr';
            document.documentElement.lang = savedLang;
        }
        fetchBranches();
    }, []);

    const fetchBranches = async () => {
        try {
            const response = await api.branches.getAll();
            setBranches(response.data || []);
        } catch (error) {
            console.error('Failed to fetch branches:', error);
        } finally {
            setLoadingBranches(false);
        }
    };

    const handleInviteFriend = () => {
        const shareText = 'تسوق معنا في Shop Allosh واحصل على أفضل العروض! 🛒';
        const shareUrl = window.location.origin;
        
        if (navigator.share) {
            navigator.share({
                title: 'Shop Allosh',
                text: shareText,
                url: shareUrl,
            }).catch(err => console.log('Error sharing:', err));
        } else {
            navigator.clipboard.writeText(`${shareText} ${shareUrl}`);
            alert('تم نسخ رابط الدعوة!');
        }
    };

    const handleLanguageSwitch = () => {
        const newLang = currentLang === 'ar' ? 'en' : 'ar';
        setCurrentLang(newLang);
        localStorage.setItem('language', newLang);
        document.documentElement.dir = newLang === 'ar' ? 'rtl' : 'ltr';
        document.documentElement.lang = newLang;
        window.location.reload(); // Reload to apply language changes
    };

    const handleWhatsAppSupport = () => {
        window.open('https://wa.me/+201234567890', '_blank');
    };

    const handleBranchClick = (googleMapsLink?: string) => {
        if (googleMapsLink) {
            window.open(googleMapsLink, '_blank');
        }
    };

    const menuItems = [
        { icon: User, label: currentLang === 'ar' ? 'حسابي' : 'My Profile', action: () => navigate('/profile') },
        { icon: UserPlus, label: currentLang === 'ar' ? 'دعوة صديق' : 'Invite a Friend', action: handleInviteFriend, highlighted: true },
        { icon: Globe, label: currentLang === 'ar' ? 'اللغة (English)' : 'Language (عربي)', action: handleLanguageSwitch, highlighted: true },
        { icon: MessageCircle, label: currentLang === 'ar' ? 'المساعدة والدعم' : 'Help & Support', action: () => navigate('/chat') },
    ];

    return (
        <div className="bg-gray-50 min-h-screen pb-24">
            <div className="bg-primary p-6 pt-12 text-white">
                <h1 className="text-3xl font-bold mb-2">
                    {currentLang === 'ar' ? 'مرحباً، ضيف!' : 'Hello, Guest!'}
                </h1>
                <p className="opacity-90">
                    {currentLang === 'ar' 
                        ? 'سجل دخولك لعرض طلباتك ونقاطك' 
                        : 'Log in to view your orders and points.'}
                </p>
            </div>

            <div className="p-4 -mt-4 space-y-4">
                {/* Main Menu */}
                <div className="bg-white rounded-2xl shadow-sm overflow-hidden">
                    {menuItems.map((item, idx) => (
                        <button
                            key={idx}
                            onClick={item.action}
                            className="w-full flex items-center justify-between p-4 hover:bg-gray-50 border-b border-gray-100 last:border-0 transition-colors text-right"
                        >
                            <div className="flex items-center space-x-3 space-x-reverse">
                                <div className={`p-2 rounded-lg ${item.highlighted ? 'bg-green-50 text-green-600' : 'bg-orange-50 text-primary'}`}>
                                    <item.icon size={20} />
                                </div>
                                <span className="font-medium text-gray-900">{item.label}</span>
                            </div>
                            <ChevronRight size={20} className="text-gray-400 rotate-180" />
                        </button>
                    ))}

                    <button className="w-full flex items-center justify-between p-4 hover:bg-red-50 transition-colors text-red-600 text-right">
                        <div className="flex items-center space-x-3 space-x-reverse">
                            <div className="bg-red-50 p-2 rounded-lg">
                                <LogOut size={20} />
                            </div>
                            <span className="font-medium">
                                {currentLang === 'ar' ? 'تسجيل الخروج' : 'Log Out'}
                            </span>
                        </div>
                    </button>
                </div>

                {/* Branches Section */}
                <div className="bg-white rounded-2xl shadow-sm overflow-hidden p-4">
                    <div className="flex items-center gap-2 mb-4">
                        <MapPinned className="text-orange-500" size={24} />
                        <h2 className="text-lg font-bold text-gray-900">
                            {currentLang === 'ar' ? 'جميع فروعنا' : 'All Our Branches'}
                        </h2>
                    </div>
                    
                    {loadingBranches ? (
                        <div className="text-center py-4 text-gray-500">
                            {currentLang === 'ar' ? 'جاري التحميل...' : 'Loading...'}
                        </div>
                    ) : branches.length > 0 ? (
                        <div className="space-y-3">
                            {branches.map((branch) => (
                                <button
                                    key={branch.id}
                                    onClick={() => handleBranchClick(branch.google_maps_link)}
                                    className="w-full bg-gray-50 hover:bg-gray-100 rounded-xl p-4 transition-colors text-right"
                                >
                                    <div className="flex items-start justify-between gap-3">
                                        <div className="flex-1">
                                            <h3 className="font-bold text-gray-900 mb-1">
                                                {currentLang === 'ar' ? branch.name_ar || branch.name : branch.name}
                                            </h3>
                                            <p className="text-sm text-gray-600 mb-1">{branch.address}</p>
                                            {branch.phone && (
                                                <p className="text-sm text-orange-600 font-medium" dir="ltr">
                                                    📞 {branch.phone}
                                                </p>
                                            )}
                                        </div>
                                        {branch.google_maps_link && (
                                            <ExternalLink className="text-orange-500 flex-shrink-0" size={20} />
                                        )}
                                    </div>
                                </button>
                            ))}
                        </div>
                    ) : (
                        <p className="text-center py-4 text-gray-500">
                            {currentLang === 'ar' ? 'لا توجد فروع متاحة حالياً' : 'No branches available'}
                        </p>
                    )}
                </div>

                {/* WhatsApp Support Button */}
                <button
                    onClick={handleWhatsAppSupport}
                    className="w-full bg-green-500 hover:bg-green-600 text-white font-bold py-4 rounded-2xl shadow-lg flex items-center justify-center gap-3 transition-colors"
                >
                    <MessageCircle size={24} />
                    <span>{currentLang === 'ar' ? 'تواصل معنا عبر واتساب' : 'Contact us via WhatsApp'}</span>
                </button>
            </div>
            <Footer />
        </div>
    );
};

export default MorePage;
