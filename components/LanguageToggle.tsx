import React from 'react';
import { Globe } from 'lucide-react';
import { useLanguage } from '../context/LanguageContext';

interface LanguageToggleProps {
    variant?: 'button' | 'switch' | 'minimal';
    showText?: boolean;
    className?: string;
}

const LanguageToggle: React.FC<LanguageToggleProps> = ({ 
    variant = 'button', 
    showText = true,
    className = ''
}) => {
    const { language, setLanguage } = useLanguage();

    const toggleLanguage = () => {
        const newLang = language === 'ar' ? 'en' : 'ar';
        setLanguage(newLang);
    };

    if (variant === 'switch') {
        return (
            <div className={`flex items-center gap-3 ${className}`}>
                <span className={`text-sm font-medium transition-colors ${language === 'ar' ? 'text-orange-600' : 'text-gray-400'}`}>
                    عربي
                </span>
                <button
                    onClick={toggleLanguage}
                    className="relative inline-flex h-7 w-14 items-center rounded-full bg-gray-200 transition-colors focus:outline-none focus:ring-2 focus:ring-orange-500 focus:ring-offset-2"
                    style={{ backgroundColor: language === 'en' ? '#f97316' : '#e5e7eb' }}
                >
                    <span
                        className={`inline-block h-5 w-5 transform rounded-full bg-white shadow-lg transition-transform ${
                            language === 'en' ? 'translate-x-8' : 'translate-x-1'
                        }`}
                    />
                </button>
                <span className={`text-sm font-medium transition-colors ${language === 'en' ? 'text-orange-600' : 'text-gray-400'}`}>
                    EN
                </span>
            </div>
        );
    }

    if (variant === 'minimal') {
        return (
            <button
                onClick={toggleLanguage}
                className={`flex items-center gap-2 px-3 py-2 rounded-lg hover:bg-gray-100 transition-colors ${className}`}
                title={language === 'ar' ? 'Switch to English' : 'التبديل للعربية'}
            >
                <Globe className="w-5 h-5 text-gray-600" />
                <span className="text-sm font-medium text-gray-700">
                    {language === 'ar' ? 'EN' : 'عربي'}
                </span>
            </button>
        );
    }

    // Default: button variant
    return (
        <button
            onClick={toggleLanguage}
            className={`group relative flex items-center gap-2 px-4 py-2 bg-white border-2 border-orange-500 rounded-full hover:bg-orange-50 transition-all duration-300 shadow-sm hover:shadow-md ${className}`}
            title={language === 'ar' ? 'Switch to English' : 'التبديل للعربية'}
        >
            <Globe className="w-5 h-5 text-orange-600 group-hover:rotate-12 transition-transform" />
            {showText && (
                <span className="text-sm font-semibold text-orange-600">
                    {language === 'ar' ? 'English' : 'عربي'}
                </span>
            )}
            
            {/* Animated indicator */}
            <div className="absolute -top-1 -right-1 w-3 h-3 bg-orange-500 rounded-full animate-pulse"></div>
        </button>
    );
};

export default LanguageToggle;
