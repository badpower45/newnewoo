import { useState, useEffect, useRef } from 'react';
import socketService from '../services/socketService';
import { api } from '../services/api';

interface Message {
    id: string;
    conversationId: string;
    senderId: string | null;
    senderType: 'customer' | 'agent';
    message: string;
    timestamp: string;
    isRead: boolean;
}

interface ChatWindowProps {
    onClose: () => void;
    user?: { id: string; name: string } | null;
    onNewMessage?: () => void;
}

const ChatWindow = ({ onClose, user, onNewMessage }: ChatWindowProps) => {
    const [messages, setMessages] = useState<Message[]>([]);
    const [message, setMessage] = useState('');
    const [conversationId, setConversationId] = useState<string | null>(null);
    const [customerName, setCustomerName] = useState('');
    const [isNameSet, setIsNameSet] = useState(false);
    const [isTyping, setIsTyping] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const messagesEndRef = useRef<HTMLDivElement>(null);
    const typingTimeoutRef = useRef<NodeJS.Timeout | null>(null);

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    };

    useEffect(() => {
        scrollToBottom();
    }, [messages]);

    useEffect(() => {
        if (isNameSet && conversationId) {
            const initChat = async () => {
                setIsLoading(true);
                try {
                    // Connect to socket
                    socketService.connect();
                    socketService.joinAsCustomer(conversationId, customerName);

                    // Load existing messages
                    const convData = await api.chat.getConversation(conversationId);
                    setMessages(convData.messages || []);
                } catch (error) {
                    console.error('Error initializing chat:', error);
                } finally {
                    setIsLoading(false);
                }
            };

            initChat();

            // Socket event listeners
            const handleNewMessage = (msg: Message) => {
                setMessages((prev) => [...prev, msg]);
                if (msg.senderType === 'agent' && onNewMessage) {
                    onNewMessage();
                }
            };

            const handleTyping = ({ userType, isTyping: typing }: { userType: string; isTyping: boolean }) => {
                if (userType === 'agent') {
                    setIsTyping(typing);
                }
            };

            socketService.on('message:new', handleNewMessage);
            socketService.on('typing:indicator', handleTyping);

            return () => {
                socketService.off('message:new', handleNewMessage);
                socketService.off('typing:indicator', handleTyping);
                socketService.stopTyping(conversationId, 'customer');
                socketService.disconnect();
            };
        }
    }, [isNameSet, conversationId, customerName, onNewMessage]);

    const handleStartChat = async () => {
        if (!customerName.trim()) return;

        try {
            setIsLoading(true);
            const response = await api.chat.createConversation(user?.id || null, customerName);
            setConversationId(response.conversationId);
            setIsNameSet(true);
        } catch (error) {
            console.error('Error creating conversation:', error);
        } finally {
            setIsLoading(false);
        }
    };

    const handleSendMessage = () => {
        if (!message.trim() || !conversationId) return;

        socketService.sendMessage(conversationId, user?.id || null, 'customer', message);
        setMessage('');
        socketService.stopTyping(conversationId, 'customer');

        // Clear typing timeout
        if (typingTimeoutRef.current) {
            clearTimeout(typingTimeoutRef.current);
            typingTimeoutRef.current = null;
        }
    };

    const handleTyping = () => {
        if (!conversationId) return;

        socketService.startTyping(conversationId, 'customer', customerName);

        // Clear existing timeout
        if (typingTimeoutRef.current) {
            clearTimeout(typingTimeoutRef.current);
        }

        // Set new timeout to stop typing after 2 seconds
        typingTimeoutRef.current = setTimeout(() => {
            socketService.stopTyping(conversationId, 'customer');
        }, 2000);
    };

    const handleKeyPress = (e: React.KeyboardEvent) => {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            handleSendMessage();
        }
    };

    if (!isNameSet) {
        return (
            <div className="chat-window">
                <div className="chat-header">
                    <h3>تواصل معنا</h3>
                    <button onClick={onClose} className="close-btn">&times;</button>
                </div>
                <div className="chat-name-form">
                    <p>مرحباً! كيف نقدر نساعدك؟</p>
                    <input
                        type="text"
                        placeholder="اسمك"
                        value={customerName}
                        onChange={(e) => setCustomerName(e.target.value)}
                        onKeyPress={(e) => e.key === 'Enter' && handleStartChat()}
                        disabled={isLoading}
                    />
                    <button onClick={handleStartChat} disabled={!customerName.trim() || isLoading}>
                        {isLoading ? 'جاري البدء...' : 'ابدأ المحادثة'}
                    </button>
                </div>
            </div>
        );
    }

    return (
        <div className="chat-window">
            <div className="chat-header">
                <h3>الدعم الفني</h3>
                <button onClick={onClose} className="close-btn">&times;</button>
            </div>

            <div className="chat-messages">
                {isLoading ? (
                    <div className="loading">جاري التحميل...</div>
                ) : messages.length === 0 ? (
                    <div className="no-messages">
                        <p>مرحباً {customerName}! كيف نقدر نساعدك؟</p>
                    </div>
                ) : (
                    messages.map((msg) => (
                        <div
                            key={msg.id}
                            className={`message ${msg.senderType === 'customer' ? 'message-customer' : 'message-agent'}`}
                        >
                            <div className="message-content">{msg.message}</div>
                            <div className="message-time">
                                {new Date(msg.timestamp).toLocaleTimeString('ar-EG', {
                                    hour: '2-digit',
                                    minute: '2-digit'
                                })}
                            </div>
                        </div>
                    ))
                )}
                {isTyping && (
                    <div className="message message-agent">
                        <div className="message-content typing-indicator">
                            <span></span>
                            <span></span>
                            <span></span>
                        </div>
                    </div>
                )}
                <div ref={messagesEndRef} />
            </div>

            <div className="chat-input">
                <input
                    type="text"
                    placeholder="اكتب رسالتك..."
                    value={message}
                    onChange={(e) => {
                        setMessage(e.target.value);
                        handleTyping();
                    }}
                    onKeyPress={handleKeyPress}
                />
                <button onClick={handleSendMessage} disabled={!message.trim()}>
                    إرسال
                </button>
            </div>
        </div>
    );
};

export default ChatWindow;
