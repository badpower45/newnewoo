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
            // التحقق من localStorage إذا كان المستخدم أغلق الـ popup من قبل
            const closedPopupId = localStorage.getItem(`closed_popup_${page}`);
            
            const response = await api.popups.getAll();
            const popups = response.data || response || [];
            
            // Filter active popups based on page
            const activePopup = popups.find((p: any) => {
                const isActive = p.is_active;
                const showOnPage = page === 'homepage' ? p.show_on_homepage : p.show_on_products;
                const now = new Date();
                const startDate = p.start_date ? new Date(p.start_date) : null;
                const endDate = p.end_date ? new Date(p.end_date) : null;
                
                const isInDateRange = (!startDate || now >= startDate) && (!endDate || now <= endDate);
                
                return isActive && showOnPage && isInDateRange;
            });
            
            if (activePopup) {
                // إذا كان المستخدم أغلق هذا الـ popup من قبل، لا نظهره مرة أخرى
                if (closedPopupId === String(activePopup.id)) {
                    return;
                }
                
                setPopup(activePopup);
                // تأخير صغير لعرض الـ animation
                setTimeout(() => setIsVisible(true), 300);
            }
        } catch (error) {
            console.error('Error fetching popup:', error);
        }
    };

    const handleClose = () => {
        setIsClosing(true);
        
        // حفظ في localStorage أن المستخدم أغلق هذا الـ popup
        if (popup) {
            localStorage.setItem(`closed_popup_${page}`, String(popup.id));
        }
        
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
        <>
            {/* Backdrop */}
            <div 
                className={`fixed inset-0 bg-black transition-opacity duration-300 z-[9998] ${
                    isClosing ? 'opacity-0' : 'opacity-50'
                }`}
                onClick={handleClose}
            />

            {/* Popup Container */}
            <div className="fixed inset-0 flex items-center justify-center z-[9999] p-4">
                <div 
                    className={`relative max-w-md md:max-w-xl w-full transform transition-all duration-300 ${
                        isClosing ? 'scale-95 opacity-0' : 'scale-100 opacity-100'
                    }`}
                >
                    {/* Close Button */}
                    <button
                        onClick={handleClose}
                        className="absolute top-2 right-2 z-10 bg-white rounded-full p-2 shadow-lg hover:bg-gray-100 transition"
                        aria-label="إغلاق"
                    >
                        <X size={20} className="text-gray-700" />
                    </button>

                    {/* Image - Full with rounded corners */}
                    <div 
                        className={`relative ${popup.link_url && !popup.button_text_ar ? 'cursor-pointer' : ''}`}
                        onClick={popup.link_url && !popup.button_text_ar ? handleClickPopup : undefined}
                    >
                        <img 
                            src={popup.image_url} 
                            alt={popup.title_ar || popup.title}
                            className="w-full h-auto object-cover rounded-2xl shadow-2xl"
                            style={{ maxHeight: '80vh' }}
                        />
                    </div>

                    {/* Button below image (if exists) */}
                    {popup.button_text_ar && popup.link_url && (
                        <button
                            onClick={handleClickPopup}
                            className="mt-4 w-full bg-white text-primary py-3 px-6 rounded-xl font-bold hover:bg-gray-50 transition shadow-lg border-2 border-primary"
                        >
                            {popup.button_text_ar}
                        </button>
                    )}
                </div>
            </div>
                                )}
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </>
    );
};

export default AnnouncementPopup;
