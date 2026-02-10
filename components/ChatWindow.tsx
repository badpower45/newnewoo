import React, { useState, useEffect, useRef } from 'react';
import { X, Send, Loader } from 'lucide-react';
import { socketService } from '../services/socketService';
import { api } from '../services/api';
import { useAuth } from '../context/AuthContext';

const toNumericId = (value: unknown): number | null => {
    if (typeof value === 'number' && Number.isFinite(value)) return value;
    if (typeof value === 'string' && value.trim() !== '') {
        const parsed = Number(value);
        if (Number.isFinite(parsed)) return parsed;
    }
    return null;
};

interface Message {
    id: number;
    conversationId: number;
    senderId: number | null;
    senderType: 'customer' | 'agent';
    message: string;
    timestamp: string;
    isRead: number;
}

interface ChatWindowProps {
    onClose: () => void;
    onNewMessage: () => void;
}

const ChatWindow: React.FC<ChatWindowProps> = ({ onClose, onNewMessage }) => {
    const { user } = useAuth();
    const [messages, setMessages] = useState<Message[]>([]);
    const [inputMessage, setInputMessage] = useState('');
    const [conversationId, setConversationId] = useState<number | null>(null);
    const [isTyping, setIsTyping] = useState(false);
    const [isConnected, setIsConnected] = useState(false);
    const [isLoading, setIsLoading] = useState(true);
    const messagesEndRef = useRef<HTMLDivElement>(null);
    const typingTimeoutRef = useRef<NodeJS.Timeout>();

    // Auto-scroll to bottom
    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    };

    useEffect(() => {
        scrollToBottom();
    }, [messages]);

    // Initialize conversation and socket with localStorage persistence
    useEffect(() => {
        socketService.connect();

        const handleSocketConnect = () => setIsConnected(true);
        const handleSocketDisconnect = () => setIsConnected(false);
        socketService.on('connect', handleSocketConnect);
        socketService.on('disconnect', handleSocketDisconnect);

        const initChat = async () => {
            try {
                const stored = localStorage.getItem('lumina_chat_conv');
                let convId: number | null = null;
                let customerName = user?.name || (user as { full_name?: string })?.full_name || 'Guest';
                if (stored) {
                    try {
                        const parsed = JSON.parse(stored);
                        convId = parsed?.id || null;
                        customerName = parsed?.customerName || customerName;
                    } catch {}
                }

                if (!convId) {
                    try {
                        const customerId = toNumericId(user?.id);
                        const response = await api.chat.createConversation(customerId, customerName);
                        if (response.conversationId) {
                            convId = response.conversationId;
                            localStorage.setItem('lumina_chat_conv', JSON.stringify({ id: convId, customerName }));
                        }
                    } catch {
                        // Backend unavailable; disable chat
                        setIsLoading(false);
                        return;
                    }
                }

                if (convId) {
                    setConversationId(convId);

                    // Connect socket
                    socketService.joinAsCustomer(convId, customerName);

                    // Load existing messages
                    try {
                        const convData = await api.chat.getConversation(convId);
                        if (Array.isArray(convData.messages)) {
                            setMessages(convData.messages);
                        }
                    } catch {
                        // Messages load failed; start with empty
                    }
                }
            } catch (error) {
                // Silent failure
            } finally {
                setIsLoading(false);
            }
        };

        initChat();

        // Socket event listeners
        const handleMessage = (message: Message) => {
            setMessages(prev => {
                if (prev.some(existing => existing.id === message.id)) return prev;
                return [...prev, message];
            });
            if (message.senderType === 'agent') {
                onNewMessage();
            }
        };

        const handleTyping = ({ userType, isTyping }: { userType: string; isTyping: boolean }) => {
            if (userType === 'agent') {
                setIsTyping(isTyping);
            }
        };

        socketService.on('message:new', handleMessage);
        socketService.on('typing:indicator', handleTyping);

        return () => {
            socketService.off('connect', handleSocketConnect);
            socketService.off('disconnect', handleSocketDisconnect);
            socketService.off('message:new', handleMessage);
            socketService.off('typing:indicator', handleTyping);
        };
    }, [user, onNewMessage]);

    const handleSendMessage = async () => {
        if (!inputMessage.trim() || !conversationId) return;

        const message = inputMessage.trim();
        setInputMessage('');

        const senderId = toNumericId(user?.id);
        const canUseSocket = socketService.isConnected() && !socketService.isDisabled();

        if (canUseSocket) {
            socketService.sendMessage(conversationId, senderId, 'customer', message);
        } else {
            try {
                await api.chat.sendMessage(conversationId, senderId, 'customer', message);
                setMessages(prev => [
                    ...prev,
                    {
                        id: Date.now(),
                        conversationId,
                        senderId,
                        senderType: 'customer',
                        message,
                        timestamp: new Date().toISOString(),
                        isRead: 0
                    }
                ]);
            } catch {
                // Ignore failed fallback
            }
        }

        // Stop typing indicator
        socketService.stopTyping(conversationId, 'customer');
    };

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setInputMessage(e.target.value);

        if (!conversationId || !socketService.isConnected()) return;

        // Start typing indicator
        socketService.startTyping(conversationId, 'customer', user?.name || 'Guest');

        // Clear previous timeout
        if (typingTimeoutRef.current) {
            clearTimeout(typingTimeoutRef.current);
        }

        // Stop typing after 2 seconds of inactivity
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

    const formatTime = (timestamp: string) => {
        const date = new Date(timestamp);
        return date.toLocaleTimeString('ar-EG', { hour: '2-digit', minute: '2-digit' });
    };

    return (
        <div className="fixed inset-0 sm:inset-auto sm:bottom-6 sm:right-6 z-50 w-full sm:w-96 h-[100dvh] sm:h-[600px] bg-white sm:rounded-2xl shadow-2xl flex flex-col overflow-hidden" style={{ paddingBottom: 'env(safe-area-inset-bottom, 0px)' }}>
            {/* Header */}
            <div className="bg-gradient-to-r from-brand-orange to-orange-600 p-4 text-white flex items-center justify-between">
                <div className="flex items-center space-x-3 rtl:space-x-reverse">
                    <div className="w-10 h-10 bg-white/20 rounded-full flex items-center justify-center">
                        💬
                    </div>
                    <div>
                        <h3 className="font-bold text-lg">خدمة العملاء</h3>
                        <p className="text-xs text-white/80">
                            {isConnected ? '🟢 متصل' : '🟡 غير متصل'}
                        </p>
                    </div>
                </div>
                <button
                    onClick={onClose}
                    className="p-2 hover:bg-white/20 rounded-lg transition-colors"
                >
                    <X size={20} />
                </button>
            </div>

            {/* Messages */}
            <div className="flex-1 overflow-y-auto p-4 space-y-3 bg-gray-50">
                {isLoading ? (
                    <div className="flex items-center justify-center h-full">
                        <Loader className="animate-spin text-brand-orange" size={32} />
                    </div>
                ) : messages.length === 0 ? (
                    <div className="flex flex-col items-center justify-center h-full text-center p-4">
                        <div className="text-6xl mb-4">👋</div>
                        <h4 className="text-xl font-bold text-gray-800 mb-2">مرحباً بك!</h4>
                        <p className="text-gray-600">كيف يمكننا مساعدتك اليوم؟</p>
                    </div>
                ) : (
                    messages.map((msg) => (
                        <div
                            key={msg.id}
                            className={`flex ${msg.senderType === 'customer' ? 'justify-end' : 'justify-start'}`}
                        >
                            <div
                                className={`max-w-[75%] rounded-2xl px-4 py-2 ${msg.senderType === 'customer'
                                        ? 'bg-brand-orange text-white rounded-br-none'
                                        : 'bg-white text-gray-800 rounded-bl-none shadow'
                                    }`}
                            >
                                <p className="text-sm">{msg.message}</p>
                                <p className={`text-xs mt-1 ${msg.senderType === 'customer' ? 'text-white/70' : 'text-gray-500'}`}>
                                    {formatTime(msg.timestamp)}
                                </p>
                            </div>
                        </div>
                    ))
                )}

                {/* Typing Indicator */}
                {isTyping && (
                    <div className="flex justify-start">
                        <div className="bg-white rounded-2xl px-4 py-3 shadow">
                            <div className="flex space-x-2">
                                <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"></div>
                                <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
                                <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                            </div>
                        </div>
                    </div>
                )}

                <div ref={messagesEndRef} />
            </div>

            {/* Input */}
            <div className="p-4 bg-white border-t border-gray-200" style={{ paddingBottom: 'max(1rem, env(safe-area-inset-bottom, 1rem))' }}>
                <div className="flex space-x-2 rtl:space-x-reverse">
                    <input
                        type="text"
                        value={inputMessage}
                        onChange={handleInputChange}
                        onKeyPress={handleKeyPress}
                        placeholder="اكتب رسالتك..."
                        className="flex-1 px-4 py-2 border border-gray-300 rounded-full focus:outline-none focus:ring-2 focus:ring-brand-orange focus:border-transparent"
                        disabled={!conversationId}
                    />
                    <button
                        onClick={handleSendMessage}
                        disabled={!inputMessage.trim() || !conversationId}
                        className="bg-brand-orange hover:bg-orange-600 disabled:bg-gray-300 text-white p-3 rounded-full transition-colors shadow-md disabled:cursor-not-allowed"
                    >
                        <Send size={20} />
                    </button>
                </div>
            </div>
        </div>
    );
};

export default ChatWindow;
