import React from 'react';
import { ChevronRight, ChevronLeft } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useLanguage } from '../context/LanguageContext';

interface BackButtonProps {
    onClick?: () => void;
    to?: string;
    className?: string;
}

const BackButton: React.FC<BackButtonProps> = ({ onClick, to, className = '' }) => {
    const navigate = useNavigate();
    const { language } = useLanguage();
    
    // Choose icon based on language direction
    const Icon = language === 'ar' ? ChevronRight : ChevronLeft;
    
    const handleClick = () => {
        if (onClick) {
            onClick();
        } else if (to) {
            navigate(to);
        } else {
            navigate(-1);
        }
    };
    
    return (
        <button
            onClick={handleClick}
            className={`p-2 hover:bg-gray-100 rounded-lg transition-colors ${className}`}
            aria-label="رجوع"
        >
            <Icon size={24} />
        </button>
    );
};

export default BackButton;
