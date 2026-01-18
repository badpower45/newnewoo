import React, { useEffect, useState } from 'react';
import { X } from 'lucide-react';
import { api } from '../services/api';

interface PopupData {
    id: number;
    title: string;
    title_ar: string;
    description?: string;
    description_ar?: string;
    image_url: string;
    link_url?: string;
    button_text?: string;
    button_text_ar?: string;
}

interface AnnouncementPopupProps {
    page?: 'homepage' | 'products';
}

const AnnouncementPopup: React.FC<AnnouncementPopupProps> = ({ page = 'homepage' }) => {
    const [popup, setPopup] = useState<PopupData | null>(null);
    const [isVisible, setIsVisible] = useState(false);
    const [isClosing, setIsClosing] = useState(false);

    useEffect(() => {
        fetchPopup();
    }, [page]);

    const fetchPopup = async () => {
        try {
            console.log('🎯 Fetching popups for page:', page);
            
            const response = await api.popups.getAll();
            const popups = response.data || response || [];
            
            console.log('📦 Popups received:', popups.length);
            
            // Filter active popups based on page and date
            const activePopup = popups.find((p: any) => {
                const isActive = p.is_active;
                const showOnPage = page === 'homepage' ? p.show_on_homepage : p.show_on_products;
                const now = new Date();
                const startDate = p.start_date ? new Date(p.start_date) : null;
                const endDate = p.end_date ? new Date(p.end_date) : null;
                
                const isInDateRange = (!startDate || now >= startDate) && (!endDate || now <= endDate);
                
                console.log('🔍 Checking popup:', {
                    id: p.id,
                    title: p.title_ar,
                    isActive,
                    showOnPage,
                    isInDateRange,
                    startDate,
                    endDate
                });
                
                return isActive && showOnPage && isInDateRange;
            });
            
            console.log('✅ Active popup found:', activePopup ? activePopup.id : 'none');
            
            if (activePopup) {
                console.log('🎉 Showing popup:', activePopup.id);
                setPopup(activePopup);
                // Show popup after a short delay for better UX
                setTimeout(() => setIsVisible(true), 800);
            }
        } catch (error) {
            console.error('❌ Error fetching popup:', error);
        }
    };

    const handleClose = () => {
        setIsClosing(true);
        
        setTimeout(() => {
            setIsVisible(false);
            setPopup(null);
            setIsClosing(false);
        }, 300);
    };

    const handleClickPopup = () => {
        if (popup?.link_url) {
            window.location.href = popup.link_url;
            handleClose();
        }
    };

    if (!popup || !isVisible) return null;

    return (
        <div className="popup-container" style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, zIndex: 99999 }}>
            {/* Backdrop */}
            <div 
                className={`fixed inset-0 bg-black/60 backdrop-blur-sm transition-opacity duration-300 ${
                    isClosing ? 'opacity-0' : 'opacity-100'
                }`}
                onClick={handleClose}
                style={{ zIndex: 99998 }}
            />

            {/* Popup Container */}
            <div 
                className="fixed inset-0 flex items-center justify-center p-3 sm:p-4 md:p-6"
                style={{ zIndex: 99999 }}
            >
                <div 
                    className={`relative w-full max-w-[90vw] sm:max-w-md md:max-w-xl transform transition-all duration-300 ${
                        isClosing ? 'scale-90 opacity-0' : 'scale-100 opacity-100'
                    }`}
                >
                    {/* Close Button */}
                    <button
                        onClick={handleClose}
                        className="absolute -top-2 -right-2 sm:top-2 sm:right-2 z-[100000] bg-white rounded-full p-2.5 shadow-xl hover:bg-gray-100 active:scale-95 transition-transform"
                        aria-label="إغلاق"
                        type="button"
                    >
                        <X size={22} className="text-gray-800" strokeWidth={2.5} />
                    </button>

                    {/* Image - Full with rounded corners */}
                    <div 
                        className={`relative ${popup.link_url && !popup.button_text_ar ? 'cursor-pointer active:scale-[0.98]' : ''} transition-transform`}
                        onClick={popup.link_url && !popup.button_text_ar ? handleClickPopup : undefined}
                    >
                        <img 
                            src={popup.image_url} 
                            alt={popup.title_ar || popup.title}
                            className="w-full h-auto object-contain rounded-xl sm:rounded-2xl shadow-2xl"
                            style={{ maxHeight: '75vh', minHeight: '200px' }}
                            loading="eager"
                        />
                    </div>

                    {/* Button below image (if exists) */}
                    {popup.button_text_ar && popup.link_url && (
                        <button
                            onClick={handleClickPopup}
                            className="mt-3 sm:mt-4 w-full bg-white text-primary py-3 px-6 rounded-xl font-bold hover:bg-gray-50 active:scale-95 transition-all shadow-lg border-2 border-primary text-base sm:text-lg"
                            type="button"
                        >
                            {popup.button_text_ar}
                        </button>
                    )}
                </div>
            </div>
        </div>
    );
};

export default AnnouncementPopup;
