import React from 'react';
import { ChevronRight, ChevronLeft } from 'lucide-react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useLanguage } from '../context/LanguageContext';

interface BackButtonProps {
    onClick?: () => void;
    to?: string;
    className?: string;
    returnToMore?: boolean; // خاصية جديدة لتحديد العودة للمزيد
}

const BackButton: React.FC<BackButtonProps> = ({ onClick, to, className = '', returnToMore = false }) => {
    const navigate = useNavigate();
    const location = useLocation();
    const { language } = useLanguage();
    
    // Choose icon based on language direction - RTL/LTR support
    const Icon = language === 'ar' ? ChevronRight : ChevronLeft;
    
    // الصفحات التي تأتي من "المزيد"
    const morePagesRoutes = [
        '/profile',
        '/my-orders',
        '/loyalty',
        '/addresses',
        '/branches',
        '/general-faq',
        '/privacy-policy',
        '/chat'
    ];
    
    const handleClick = () => {
        if (onClick) {
            onClick();
        } else if (to) {
            navigate(to);
        } else {
            // منطق الرجوع الذكي
            const currentPath = location.pathname;
            
            // تحقق إذا كانت الصفحة الحالية من صفحات "المزيد"
            const isMorePage = morePagesRoutes.some(route => currentPath.startsWith(route));
            
            if (isMorePage || returnToMore) {
                // ارجع لصفحة المزيد
                navigate('/more');
            } else {
                // رجوع عادي
                navigate(-1);
            }
        }
    };
    
    return (
        <button
            onClick={handleClick}
            className={`p-2 hover:bg-gray-100 rounded-lg transition-colors ${className}`}
            aria-label={language === 'ar' ? 'رجوع' : 'Back'}
        >
            <Icon size={24} />
        </button>
    );
};

export default BackButton;
