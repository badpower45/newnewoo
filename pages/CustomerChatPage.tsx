import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { socketService } from '../services/socketService';
import { api } from '../services/api';
import { ArrowRight, Send, Phone, Plus, MessageCircle } from 'lucide-react';

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
        <div className="h-screen flex flex-col bg-[#FAFAFA] max-w-md mx-auto">
            {/* Header */}
            <div className="bg-[#23110C] text-white p-4 shadow-lg">
                <div className="flex items-center gap-3">
                    <button
                        onClick={() => navigate(-1)}
                        className="w-10 h-10 flex items-center justify-center"
                    >
                        <ArrowRight className="w-6 h-6" />
                    </button>

                    <div className="flex items-center gap-3 flex-1">
                        {/* Agent Avatar */}
                        <div className="relative">
                            <div className="w-10 h-10 rounded-full bg-gradient-to-br from-[#F97316] to-[#ea580c] flex items-center justify-center text-white">
                                👤
                            </div>
                            <div className={`absolute bottom-0 left-0 w-3 h-3 ${isConnected ? 'bg-[#10B981]' : 'bg-gray-400'} border-2 border-[#23110C] rounded-full`} />
                        </div>

                        <div className="flex-1">
                            <h3 className="text-white text-lg font-semibold">دعم علوش</h3>
                            <p className="text-[#9CA3AF] text-sm">
                                {isConnected ? 'متصل • يرد عادة خلال دقيقتين' : 'غير متصل'}
                            </p>
                        </div>
                    </div>

                    <button className="w-10 h-10 flex items-center justify-center text-white hover:bg-white/10 rounded-full transition-colors">
                        <Phone className="w-5 h-5" />
                    </button>
                </div>
            </div>

            {/* Chat Area */}
            <div
                className="flex-1 overflow-y-auto p-4"
                style={{
                    backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23F97316' fill-opacity='0.03'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
                }}
            >
                {isLoading ? (
                    <div className="flex items-center justify-center h-64">
                        <div className="text-center">
                            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#F97316] mx-auto mb-4"></div>
                            <p className="text-[#6B7280]">جاري التحميل...</p>
                        </div>
                    </div>
                ) : messages.length === 0 ? (
                    <div className="flex items-center justify-center h-64">
                        <div className="text-center">
                            <div className="bg-gradient-to-br from-[#F97316] to-[#ea580c] p-6 rounded-full w-24 h-24 mx-auto mb-4 flex items-center justify-center shadow-xl">
                                <MessageCircle size={48} className="text-white" />
                            </div>
                            <h2 className="text-xl font-bold text-[#23110C] mb-2">مرحباً {user?.name}! 🍊</h2>
                            <p className="text-[#6B7280]">ابدأ محادثة مع خدمة العملاء</p>
                            <p className="text-sm text-[#9CA3AF] mt-2">نحن هنا لمساعدتك في أي استفسار</p>
                        </div>
                    </div>
                ) : (
                    <>
                        {/* Date Separator */}
                        <div className="flex justify-center mb-4">
                            <div className="bg-white/80 backdrop-blur-sm px-4 py-1.5 rounded-full shadow-sm">
                                <span className="text-[#6B7280] text-sm">اليوم</span>
                            </div>
                        </div>

                        {/* Messages */}
                        <div className="space-y-4">
                            {messages.map((msg) => (
                                <div
                                    key={msg.id}
                                    className={`flex ${msg.senderType === 'customer' ? 'justify-start' : 'justify-end'}`}
                                >
                                    <div
                                        className={`max-w-[75%] p-3 rounded-2xl shadow-sm ${
                                            msg.senderType === 'customer'
                                                ? 'bg-[#F97316] text-white rounded-br-sm'
                                                : 'bg-white text-[#23110C] rounded-bl-sm'
                                        }`}
                                    >
                                        <p className="mb-1 leading-relaxed whitespace-pre-wrap">{msg.message}</p>
                                        <span
                                            className={`text-xs ${
                                                msg.senderType === 'customer' ? 'text-white/70' : 'text-[#9CA3AF]'
                                            }`}
                                        >
                                            {new Date(msg.timestamp).toLocaleTimeString('ar-EG', {
                                                hour: '2-digit',
                                                minute: '2-digit'
                                            })}
                                        </span>
                                    </div>
                                </div>
                            ))}
                        </div>

                        {/* Typing Indicator */}
                        {isTyping && (
                            <div className="flex justify-end mt-4">
                                <div className="bg-white rounded-2xl rounded-bl-sm px-4 py-3 shadow-sm">
                                    <div className="flex items-center gap-1">
                                        <div className="w-2 h-2 bg-[#F97316] rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></div>
                                        <div className="w-2 h-2 bg-[#F97316] rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></div>
                                        <div className="w-2 h-2 bg-[#F97316] rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></div>
                                    </div>
                                </div>
                            </div>
                        )}
                    </>
                )}
                <div ref={messagesEndRef} />
            </div>

            {/* Input Area */}
            <div className="bg-white border-t border-[#E5E7EB] p-4 shadow-[0_-2px_8px_rgba(0,0,0,0.05)]">
                <div className="flex items-center gap-2">
                    <button className="w-10 h-10 flex items-center justify-center text-[#9CA3AF] hover:text-[#F97316] transition-colors">
                        <Plus className="w-6 h-6" />
                    </button>

                    <div className="flex-1 relative">
                        <input
                            type="text"
                            value={message}
                            onChange={(e) => {
                                setMessage(e.target.value);
                                handleTyping();
                            }}
                            onKeyDown={handleKeyDown}
                            placeholder="اكتب رسالة..."
                            dir="rtl"
                            className="w-full bg-[#F3F4F6] rounded-full px-4 py-2.5 text-[#23110C] placeholder:text-[#9CA3AF] focus:outline-none focus:ring-2 focus:ring-[#F97316]/20"
                        />
                    </div>

                    <button
                        onClick={handleSendMessage}
                        disabled={!message.trim()}
                        className="w-10 h-10 bg-[#F97316] rounded-full flex items-center justify-center shadow-lg hover:bg-[#ea580c] transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        <Send className="w-5 h-5 text-white" />
                    </button>
                </div>
            </div>
        </div>
    );
};

export default CustomerChatPage;
