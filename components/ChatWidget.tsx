import React, { useState } from 'react';
import { MessageCircle, X } from 'lucide-react';
import ChatWindow from './ChatWindow';

const ChatWidget = () => {
    const [isOpen, setIsOpen] = useState(false);
    const [unreadCount, setUnreadCount] = useState(0);

    const handleNewMessage = () => {
        if (!isOpen) {
            setUnreadCount(prev => prev + 1);
        }
    };

    const handleOpen = () => {
        setIsOpen(true);
        setUnreadCount(0);
    };

    return (
        <>
            {/* Chat Window */}
            {isOpen && (
                <ChatWindow
                    onClose={() => setIsOpen(false)}
                    onNewMessage={handleNewMessage}
                />
            )}

            {/* Floating Button */}
            {!isOpen && (
                <button
                    onClick={handleOpen}
                    className="fixed bottom-20 right-6 md:bottom-6 z-50 bg-brand-orange hover:bg-orange-600 text-white rounded-full p-4 shadow-2xl transition-all duration-300 hover:scale-110 group"
                    aria-label="Open chat"
                >
                    <MessageCircle size={28} className="group-hover:animate-pulse" />

                    {/* Unread Badge */}
                    {unreadCount > 0 && (
                        <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs font-bold rounded-full w-6 h-6 flex items-center justify-center border-2 border-white animate-bounce">
                            {unreadCount > 9 ? '9+' : unreadCount}
                        </span>
                    )}

                    {/* Pulse Animation */}
                    <span className="absolute inset-0 rounded-full bg-brand-orange animate-ping opacity-75"></span>
                </button>
            )}
        </>
    );
};

export default ChatWidget;
