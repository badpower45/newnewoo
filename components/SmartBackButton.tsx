import React from 'react';
import { useNavigate } from 'react-router-dom';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { useLanguage } from '../context/LanguageContext';

interface SmartBackButtonProps {
    fallback?: string;
    label?: string;
}

const SmartBackButton: React.FC<SmartBackButtonProps> = ({ fallback = '/more', label = 'رجوع' }) => {
    const navigate = useNavigate();
    const { language } = useLanguage();
    const isRTL = language === 'ar';

    const handleBack = () => {
        // If there is no meaningful history, push fallback
        if (window.history.length <= 1) {
            navigate(fallback, { replace: true });
            return;
        }
        navigate(-1);
    };

    const Icon = isRTL ? ChevronRight : ChevronLeft;

    return (
        <button
            onClick={handleBack}
            className="inline-flex items-center gap-2 text-sm font-medium text-gray-700 hover:text-gray-900"
        >
            <Icon size={18} />
            <span>{label}</span>
        </button>
    );
};

export default SmartBackButton;
