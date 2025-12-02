import React from 'react';
import { User, Settings, MapPin, CreditCard, HelpCircle, LogOut, ChevronRight } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import Footer from '../components/Footer';

const MorePage = () => {
    const navigate = useNavigate();
    const menuItems = [
        { icon: User, label: 'My Profile' },
        { icon: MapPin, label: 'Addresses' },
        { icon: CreditCard, label: 'Payment Methods' },
        { icon: Settings, label: 'Settings' },
        { icon: HelpCircle, label: 'Help & Support' },
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
                            onClick={() => {
                                if (item.label === 'My Profile') navigate('/profile');
                            }}
                            className="w-full flex items-center justify-between p-4 hover:bg-gray-50 border-b border-gray-100 last:border-0 transition-colors"
                        >
                            <div className="flex items-center space-x-3">
                                <div className="bg-orange-50 p-2 rounded-lg text-primary">
                                    <item.icon size={20} />
                                </div>
                                <span className="font-medium text-gray-900">{item.label}</span>
                            </div>
                            <ChevronRight size={20} className="text-gray-400" />
                        </button>
                    ))}

                    <button className="w-full flex items-center justify-between p-4 hover:bg-red-50 transition-colors text-red-600">
                        <div className="flex items-center space-x-3">
                            <div className="bg-red-50 p-2 rounded-lg">
                                <LogOut size={20} />
                            </div>
                            <span className="font-medium">Log Out</span>
                        </div>
                    </button>
                </div>
            </div>
            <Footer />
        </div>
    );
};

export default MorePage;
