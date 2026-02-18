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
    const [imageLoaded, setImageLoaded] = useState(false);
    const [imageError, setImageError] = useState(false);
    const shownKey = 'popup_shown_this_view'; // sessionStorage - يظهر كل ريفرش

    const getDismissedPopups = (): number[] => {
        // No permanent dismissal - popup shows every refresh
        return [];
    };

    const markPopupDismissed = (_popupId: number) => {
        // Mark shown in sessionStorage so it doesn't show twice in same page view
        try {
            sessionStorage.setItem(shownKey, 'true');
        } catch {
            // Ignore storage issues
        }
    };

    // تحقق إذا الـ popup ظهر في هذه الجلسة الحالية فقط
    const hasShownBefore = () => {
        try {
            return sessionStorage.getItem(shownKey) === 'true';
        } catch {
            return false;
        }
    };

    // تسجيل أن الـ popup ظهر في هذه الجلسة
    const markShown = () => {
        try {
            sessionStorage.setItem(shownKey, 'true');
        } catch {
            // Ignore storage issues
        }
    };

    useEffect(() => {
        fetchPopup();
    }, [page]);

    const fetchPopup = async () => {
        try {
            console.log('🎉 Fetching popup for page:', page);

            // Check if popup was already shown or dismissed - permanent check
            if (hasShownBefore()) {
                console.log('⏭️ Popup already shown/dismissed permanently');
                return;
            }

            const res = await api.popups.getActive(page);
            console.log('📦 Popup API response:', res);

            const payload = res?.data ?? res?.popup ?? res;
            const popupData = Array.isArray(payload) ? payload[0] : payload;

            if (!popupData?.id) {
                console.log('❌ No popup data found');
                return;
            }

            console.log('✅ Popup data:', popupData);

            const dismissed = getDismissedPopups();
            if (dismissed.includes(popupData.id)) {
                console.log('⏭️ Popup already dismissed:', popupData.id);
                markShown(); // ensure shown flag is set
                return;
            }

            setPopup(popupData);
            setIsVisible(true);
            setImageLoaded(false);
            setImageError(false);
            markShown();
            console.log('🎉 Popup displayed!');
        } catch (error) {
            console.error('❌ Error fetching popup:', error);
        }
    };

    const handleClose = () => {
        if (popup?.id) {
            markPopupDismissed(popup.id);
        }
        setIsClosing(true);

        setTimeout(() => {
            setIsVisible(false);
            setPopup(null);
            setIsClosing(false);
        }, 300);
    };

    const handleClickPopup = () => {
        if (popup?.link_url) {
            if (popup?.id) {
                markPopupDismissed(popup.id);
            }
            window.location.href = popup.link_url;
            handleClose();
        }
    };

    if (!popup || !isVisible) return null;

    return (
        <div className="popup-container" style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, zIndex: 99999 }}>
            {/* Backdrop */}
            <div
                className={`fixed inset-0 bg-black/60 backdrop-blur-sm transition-opacity duration-300 ${isClosing ? 'opacity-0' : 'opacity-100'
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
                    className={`relative w-full max-w-[94vw] sm:max-w-md md:max-w-xl transform transition-all duration-300 ${isClosing ? 'scale-90 opacity-0' : 'scale-100 opacity-100'
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
                        {!imageLoaded && !imageError && (
                            <div className="w-full h-64 bg-gray-200 rounded-xl animate-pulse flex items-center justify-center">
                                <span className="text-gray-500">جاري التحميل...</span>
                            </div>
                        )}
                        {imageError && (
                            <div className="w-full h-64 bg-gray-100 rounded-xl flex flex-col items-center justify-center p-4">
                                <span className="text-gray-600 text-lg font-bold mb-2">{popup.title_ar || popup.title}</span>
                                <span className="text-gray-500 text-sm text-center">{popup.description_ar || popup.description}</span>
                            </div>
                        )}
                        <img
                            src={popup.image_url}
                            alt={popup.title_ar || popup.title}
                            className={`w-full h-auto object-contain rounded-xl sm:rounded-2xl shadow-2xl max-h-[85vh] sm:max-h-[75vh] min-h-[200px] ${!imageLoaded ? 'hidden' : ''}`}
                            loading="eager"
                            onLoad={() => {
                                console.log('✅ Popup image loaded');
                                setImageLoaded(true);
                            }}
                            onError={() => {
                                console.error('❌ Popup image failed to load:', popup.image_url);
                                setImageError(true);
                            }}
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
