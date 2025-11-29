import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { socketService } from '../services/socketService';
import { api } from '../services/api';
import { ChevronLeft, Send, MessageCircle } from 'lucide-react';

interface Message {
    id: string;
    conversationId: string;
    senderId: string | null;
    senderType: 'customer' | 'agent';
    message: string;
    timestamp: string;
    isRead: boolean;
}

const CustomerChatPage = () => {
    const { user } = useAuth();
    const navigate = useNavigate();
    const [messages, setMessages] = useState<Message[]>([]);
    const [message, setMessage] = useState('');
    const [conversationId, setConversationId] = useState<string | null>(null);
    const [isTyping, setIsTyping] = useState(false);
    const [isLoading, setIsLoading] = useState(true);
    const [isConnected, setIsConnected] = useState(false);
    const messagesEndRef = useRef<HTMLDivElement>(null);
    const typingTimeoutRef = useRef<NodeJS.Timeout | null>(null);

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    };

    useEffect(() => {
        scrollToBottom();
    }, [messages]);

    // Initialize chat on component mount
    useEffect(() => {
        const initChat = async () => {
            if (!user) {
                navigate('/login');
                return;
            }

            setIsLoading(true);
            try {
                // Create or get existing conversation
                const response = await api.chat.createConversation(String(user.id), user.name || 'عميل');
                setConversationId(response.conversationId);

                // Connect to socket
                socketService.connect();
                socketService.joinAsCustomer(response.conversationId, user.name || 'عميل');
                setIsConnected(true);

                // Load existing messages
                const convData = await api.chat.getConversation(response.conversationId);
                setMessages(convData.messages || []);
            } catch (error) {
                console.error('Error initializing chat:', error);
            } finally {
                setIsLoading(false);
            }
        };

        initChat();

        return () => {
            if (conversationId) {
                socketService.stopTyping(conversationId, 'customer');
            }
            socketService.disconnect();
        };
    }, [user, navigate]);

    // Socket event listeners
    useEffect(() => {
        if (!conversationId) return;

        const handleNewMessage = (msg: Message) => {
            setMessages((prev) => [...prev, msg]);

            // Play notification sound for agent messages
            if (msg.senderType === 'agent') {
                playNotificationSound();
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
        };
    }, [conversationId]);

    const playNotificationSound = () => {
        try {
            // Create a simple beep using Web Audio API
            const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
            const oscillator = audioContext.createOscillator();
            const gainNode = audioContext.createGain();

            oscillator.connect(gainNode);
            gainNode.connect(audioContext.destination);

            oscillator.frequency.value = 800;
            oscillator.type = 'sine';

            gainNode.gain.setValueAtTime(0.3, audioContext.currentTime);
            gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.5);

            oscillator.start(audioContext.currentTime);
            oscillator.stop(audioContext.currentTime + 0.5);
        } catch (error) {
            console.error('Error playing notification sound:', error);
        }
    };

    const handleSendMessage = () => {
        if (!message.trim() || !conversationId) return;

        socketService.sendMessage(conversationId, String(user?.id), 'customer', message);
        setMessage('');
        socketService.stopTyping(conversationId, 'customer');

        // Clear typing timeout
        if (typingTimeoutRef.current) {
            clearTimeout(typingTimeoutRef.current);
            typingTimeoutRef.current = null;
        }
    };

    const handleTyping = () => {
        if (!conversationId || !user) return;

        socketService.startTyping(conversationId, 'customer', user.name || 'عميل');

        // Clear existing timeout
        if (typingTimeoutRef.current) {
            clearTimeout(typingTimeoutRef.current);
        }

        // Set new timeout to stop typing after 2 seconds
        typingTimeoutRef.current = setTimeout(() => {
            socketService.stopTyping(conversationId, 'customer');
        }, 2000);
    };

    const handleKeyDown = (e: React.KeyboardEvent) => {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            handleSendMessage();
        }
    };

    return (
        <div className="min-h-screen bg-gray-50 flex flex-col">
            {/* Header */}
            <div className="bg-white shadow-sm sticky top-0 z-10">
                <div className="max-w-4xl mx-auto px-4 py-3 flex items-center">
                    <button
                        onClick={() => navigate('/profile')}
                        className="p-2 hover:bg-gray-100 rounded-full ml-2 transition-colors"
                    >
                        <ChevronLeft size={24} className="text-gray-700" />
                    </button>
                    <div className="flex items-center flex-1">
                        <div className="bg-primary/10 p-2 rounded-full ml-3">
                            <MessageCircle size={24} className="text-primary" />
                        </div>
                        <div>
                            <h1 className="text-lg font-bold text-gray-900">خدمة العملاء</h1>
                            <p className="text-xs text-gray-500">
                                {isConnected ? 'متصل' : 'غير متصل'}
                            </p>
                        </div>
                    </div>
                </div>
            </div>

            {/* Messages Container */}
            <div className="flex-1 overflow-y-auto bg-gray-50">
                <div className="max-w-4xl mx-auto p-4 space-y-4">
                    {isLoading ? (
                        <div className="flex items-center justify-center h-64">
                            <div className="text-center">
                                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
                                <p className="text-gray-500">جاري التحميل...</p>
                            </div>
                        </div>
                    ) : messages.length === 0 ? (
                        <div className="flex items-center justify-center h-64">
                            <div className="text-center">
                                <div className="bg-primary/10 p-6 rounded-full w-24 h-24 mx-auto mb-4 flex items-center justify-center">
                                    <MessageCircle size={48} className="text-primary" />
                                </div>
                                <h2 className="text-xl font-bold text-gray-900 mb-2">مرحباً {user?.name}!</h2>
                                <p className="text-gray-500">ابدأ محادثة مع خدمة العملاء</p>
                                <p className="text-sm text-gray-400 mt-2">نحن هنا لمساعدتك في أي استفسار</p>
                            </div>
                        </div>
                    ) : (
                        <>
                            {messages.map((msg) => (
                                <div
                                    key={msg.id}
                                    className={`flex ${msg.senderType === 'customer' ? 'justify-end' : 'justify-start'}`}
                                >
                                    <div
                                        className={`max-w-[70%] rounded-2xl px-4 py-3 ${
                                            msg.senderType === 'customer'
                                                ? 'bg-primary text-white rounded-br-sm'
                                                : 'bg-white text-gray-900 shadow-sm rounded-bl-sm'
                                        }`}
                                    >
                                        <p className="text-sm leading-relaxed whitespace-pre-wrap">{msg.message}</p>
                                        <p
                                            className={`text-xs mt-1 ${
                                                msg.senderType === 'customer' ? 'text-white/70' : 'text-gray-400'
                                            }`}
                                        >
                                            {new Date(msg.timestamp).toLocaleTimeString('ar-EG', {
                                                hour: '2-digit',
                                                minute: '2-digit'
                                            })}
                                        </p>
                                    </div>
                                </div>
                            ))}

                            {/* Typing Indicator */}
                            {isTyping && (
                                <div className="flex justify-start">
                                    <div className="bg-white rounded-2xl rounded-bl-sm px-4 py-3 shadow-sm">
                                        <div className="flex items-center space-x-1">
                                            <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></div>
                                            <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></div>
                                            <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></div>
                                        </div>
                                    </div>
                                </div>
                            )}
                        </>
                    )}
                    <div ref={messagesEndRef} />
                </div>
            </div>

            {/* Input Area */}
            <div className="bg-white border-t border-gray-200 sticky bottom-0">
                <div className="max-w-4xl mx-auto p-4">
                    <div className="flex items-end gap-2" dir="rtl">
                        <div className="flex-1">
                            <textarea
                                value={message}
                                onChange={(e) => {
                                    setMessage(e.target.value);
                                    handleTyping();
                                }}
                                onKeyDown={handleKeyDown}
                                placeholder="اكتب رسالتك..."
                                rows={1}
                                dir="rtl"
                                className="w-full px-4 py-3 border border-gray-300 rounded-2xl focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary resize-none text-right"
                                style={{
                                    minHeight: '48px',
                                    maxHeight: '120px',
                                    overflowY: 'auto'
                                }}
                            />
                        </div>
                        <button
                            onClick={handleSendMessage}
                            disabled={!message.trim()}
                            className="bg-primary text-white p-3 rounded-full hover:bg-primary-dark disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex-shrink-0"
                            title="إرسال"
                        >
                            <Send size={20} />
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default CustomerChatPage;
