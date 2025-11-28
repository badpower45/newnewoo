import { useState } from 'react';
import ChatWindow from './ChatWindow';

interface ChatWidgetProps {
    user?: { id: string; name: string } | null;
}

const ChatWidget = ({ user }: ChatWidgetProps) => {
    const [isOpen, setIsOpen] = useState(false);
    const [unreadCount, setUnreadCount] = useState(0);

    const handleOpen = () => {
        setIsOpen(true);
        setUnreadCount(0); // Reset unread when opening
    };

    const handleClose = () => {
        setIsOpen(false);
    };

    const handleNewMessage = () => {
        if (!isOpen) {
            setUnreadCount((prev) => prev + 1);
        }
    };

    return (
        <>
            {isOpen && (
                <div className="chat-widget-container">
                    <ChatWindow onClose={handleClose} user={user} onNewMessage={handleNewMessage} />
                </div>
            )}

            {!isOpen && (
                <button className="chat-widget-button" onClick={handleOpen}>
                    <svg
                        width="24"
                        height="24"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                    >
                        <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
                    </svg>
                    {unreadCount > 0 && (
                        <span className="chat-widget-badge">{unreadCount > 9 ? '9+' : unreadCount}</span>
                    )}
                </button>
            )}
        </>
    );
};

export default ChatWidget;
