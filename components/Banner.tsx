import React from 'react';

interface BannerProps {
    type: 'login' | 'promo';
    title?: string;
    subtitle?: string;
    buttonText?: string;
    image?: string;
    bgColor?: string;
}

const Banner: React.FC<BannerProps> = ({ type, title, subtitle, buttonText, image, bgColor }) => {
    if (type === 'login') {
        return (
            <div className="bg-gradient-to-r from-orange-50 to-orange-100 rounded-2xl p-4 flex justify-between items-center relative overflow-hidden">
                <div className="z-10 max-w-[60%]">
                    <h3 className="font-bold text-lg text-gray-900 mb-1">Log in, Order & Win</h3>
                    <p className="text-xs text-gray-600 mb-0">Win points each time you make an order.</p>
                </div>
                <button className="bg-white text-gray-900 px-4 py-2 rounded-lg text-sm font-bold shadow-sm z-10 flex items-center space-x-1">
                    <span className="text-red-500">///</span>
                    <span>Log in</span>
                </button>
                {/* Decorative circle */}
                <div className="absolute -right-4 -top-4 w-24 h-24 bg-primary rounded-full opacity-20"></div>
            </div>
        );
    }

    return (
        <div className="relative rounded-2xl overflow-hidden shadow-sm h-36 w-full">
            <img src={image || "https://placehold.co/600x200/orange/white?text=Yellow+Friday"} alt="Banner" className="w-full h-full object-cover" />
            <div className="absolute inset-0 bg-gradient-to-r from-black/10 to-transparent"></div>
        </div>
    );
};

export default Banner;
