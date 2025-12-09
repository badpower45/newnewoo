import React from 'react';
import { User, Settings, MapPin, CreditCard, HelpCircle, LogOut, ChevronRight, UserPlus, Globe, MessageCircle } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import Footer from '../components/Footer';

const MorePage = () => {
    const navigate = useNavigate();
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
            // Fallback - copy to clipboard
            navigator.clipboard.writeText(`${shareText} ${shareUrl}`);
            alert('تم نسخ رابط الدعوة!');
        }
    };

    const handleWhatsAppSupport = () => {
        window.open('https://wa.me/your-number', '_blank');
    };

    const menuItems = [
        { icon: User, label: 'My Profile', action: () => navigate('/profile') },
        { icon: MapPin, label: 'Addresses', action: () => {} },
        { icon: CreditCard, label: 'Payment Methods', action: () => {} },
        { icon: UserPlus, label: 'دعوة صديق', labelEn: 'Invite a Friend', action: handleInviteFriend, highlighted: true },
        { icon: Globe, label: 'اللغة', labelEn: 'Language', action: () => {}, highlighted: true },
        { icon: Settings, label: 'Settings', action: () => {} },
        { icon: HelpCircle, label: 'Help & Support', action: () => {} },
    ];

    return (
        <div className="bg-gray-50 min-h-screen pb-24">
            <div className="bg-primary p-6 pt-12 text-white">
                <h1 className="text-3xl font-bold mb-2">Hello, Guest!</h1>
                <p className="opacity-90">Log in to view your orders and points.</p>
            </div>

            <div className="p-4 -mt-4">
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
                                <span className="font-medium text-gray-900">{item.labelEn || item.label}</span>
                            </div>
                            <ChevronRight size={20} className="text-gray-400 rotate-180" />
                        </button>
                    ))}

                    <button className="w-full flex items-center justify-between p-4 hover:bg-red-50 transition-colors text-red-600 text-right">
                        <div className="flex items-center space-x-3 space-x-reverse">
                            <div className="bg-red-50 p-2 rounded-lg">
                                <LogOut size={20} />
                            </div>
                            <span className="font-medium">Log Out</span>
                        </div>
                    </button>
                </div>

                {/* WhatsApp Support Button */}
                <button
                    onClick={handleWhatsAppSupport}
                    className="mt-4 w-full bg-green-500 hover:bg-green-600 text-white font-bold py-4 rounded-2xl shadow-lg flex items-center justify-center gap-3 transition-colors"
                >
                    <MessageCircle size={24} />
                    <span>تواصل معنا عبر واتساب</span>
                </button>
            </div>
            <Footer />
        </div>
    );
};

export default MorePage;
