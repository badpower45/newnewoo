import React from 'react';
import { createPortal } from 'react-dom';
import { Home, Grid, ShoppingCart, Tag, MoreHorizontal } from 'lucide-react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useLanguage } from '../context/LanguageContext';
import { useCart } from '../context/CartContext';

const BottomNav = () => {
    const navigate = useNavigate();
    const location = useLocation();
    const { t } = useLanguage();
    const { totalItems } = useCart();

    const navItems = [
        { icon: Home, label: t('home'), path: '/' },
        { icon: Grid, label: t('categories'), path: '/categories' },
        { icon: ShoppingCart, label: t('cart'), path: '/cart', badge: totalItems },
        { icon: Tag, label: t('hot_deals'), path: '/deals' },
        { icon: MoreHorizontal, label: t('more'), path: '/more' },
    ];

    const content = (
        <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-100 shadow-lg z-[100] safe-bottom">
            <div className="flex justify-between items-center max-w-md mx-auto px-4 py-2 pb-safe">
                {navItems.map((item) => {
                    const isActive = location.pathname === item.path;
                    return (
                        <button
                            key={item.label}
                            onClick={() => navigate(item.path)}
                            className={`flex flex-col items-center justify-center w-full space-y-1 relative transition-colors ${isActive ? 'text-primary-dark' : 'text-gray-400'
                                }`}
                        >
                            <div className="relative">
                                <item.icon size={24} strokeWidth={isActive ? 2.5 : 2} />
                                {item.badge !== undefined && item.badge > 0 && (
                                    <span className="absolute -top-1 -right-1 w-4 h-4 bg-primary rounded-full text-[9px] flex items-center justify-center text-white font-bold">
                                        {item.badge}
                                    </span>
                                )}
                            </div>
                            <span className="text-[10px] font-medium">{item.label}</span>
                        </button>
                    );
                })}
            </div>
        </div>
    );

    if (typeof document === 'undefined') {
        return content;
    }

    return createPortal(content, document.body);
};

export default BottomNav;
