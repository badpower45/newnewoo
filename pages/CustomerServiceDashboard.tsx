import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { socketService } from '../services/socketService';
import { api } from '../services/api';
import {
    ChevronLeft,
    Send,
    MessageCircle,
    Users,
    Clock,
    CheckCheck,
    Search,
    Volume2
} from 'lucide-react';

interface Message {
    id: string;
    conversationId: string;
    senderId: string | null;
    senderType: 'customer' | 'agent';
    message: string;
    timestamp: string;
    isRead: boolean;
}

interface Conversation {
    id: string;
    customerId: string | null;
    customerName: string;
    agentId: string | null;
    status: string;
    createdAt: string;
    lastMessageAt: string;
    messages?: Message[];
    unreadCount?: number;
}

const CustomerServiceDashboard = () => {
    const { user } = useAuth();
    const navigate = useNavigate();
    const [conversations, setConversations] = useState<Conversation[]>([]);
    const [selectedConversation, setSelectedConversation] = useState<Conversation | null>(null);
    const [messages, setMessages] = useState<Message[]>([]);
    const [message, setMessage] = useState('');
    const [isTyping, setIsTyping] = useState(false);
    const [isLoading, setIsLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState('');
    const [soundEnabled, setSoundEnabled] = useState(true);
    const messagesEndRef = useRef<HTMLDivElement>(null);
    const typingTimeoutRef = useRef<NodeJS.Timeout | null>(null);
    const audioContextRef = useRef<AudioContext | null>(null);

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    };

    useEffect(() => {
        scrollToBottom();
    }, [messages]);

    // Initialize audio context
    useEffect(() => {
        audioContextRef.current = new (window.AudioContext || (window as any).webkitAudioContext)();
        return () => {
            audioContextRef.current?.close();
        };
    }, []);

    // Check if user is authorized
    useEffect(() => {
        if (!user) {
            navigate('/login');
            return;
        }

        // Check if user has customer service role (employee, manager, or admin)
        if (!['employee', 'manager', 'admin'].includes(user.role || '')) {
            navigate('/profile');
            return;
        }
    }, [user, navigate]);

    // Load conversations
    useEffect(() => {
        const loadConversations = async () => {
            if (!user) return;

            setIsLoading(true);
            try {
                // Connect to socket
                socketService.connect();
                socketService.joinAsAgent(String(user.id), user.name || 'موظف');

                // Fetch all conversations
                const data = await api.chat.getConversations();
                setConversations(data.conversations || []);
            } catch (error) {
                console.error('Error loading conversations:', error);
            } finally {
                setIsLoading(false);
            }
        };

        loadConversations();

        return () => {
            socketService.disconnect();
        };
    }, [user]);

    // Socket event listeners
    useEffect(() => {
        const handleNewMessage = (msg: Message) => {
            // Update conversations list
            setConversations((prevConvs) =>
                prevConvs.map((conv) =>
                    conv.id === msg.conversationId
                        ? {
                              ...conv,
                              lastMessageAt: msg.timestamp,
                              unreadCount: conv.id === selectedConversation?.id ? 0 : (conv.unreadCount || 0) + 1
                          }
                        : conv
                )
            );

            // Update messages if this conversation is selected
            if (selectedConversation && msg.conversationId === selectedConversation.id) {
                setMessages((prev) => [...prev, msg]);

                // Mark as read
                if (msg.senderType === 'customer') {
                    socketService.markMessagesAsRead(msg.conversationId);
                }
            }

            // Play notification sound for customer messages
            if (msg.senderType === 'customer' && soundEnabled) {
                playNotificationSound();
            }
        };

        const handleTyping = ({
            conversationId,
            userType,
            isTyping: typing
        }: {
            conversationId: string;
            userType: string;
            isTyping: boolean;
        }) => {
            if (selectedConversation?.id === conversationId && userType === 'customer') {
                setIsTyping(typing);
            }
        };

        const handleMessageNotification = (data: any) => {
            if (soundEnabled) {
                playNotificationSound();
            }
        };

        socketService.on('message:new', handleNewMessage);
        socketService.on('typing:indicator', handleTyping);
        socketService.on('message:notification', handleMessageNotification);

        return () => {
            socketService.off('message:new', handleNewMessage);
            socketService.off('typing:indicator', handleTyping);
            socketService.off('message:notification', handleMessageNotification);
        };
    }, [selectedConversation, soundEnabled]);

    const playNotificationSound = () => {
        if (!audioContextRef.current || !soundEnabled) return;

        try {
            const audioContext = audioContextRef.current;
            const oscillator = audioContext.createOscillator();
            const gainNode = audioContext.createGain();

            oscillator.connect(gainNode);
            gainNode.connect(audioContext.destination);

            // Create a pleasant notification sound
            oscillator.frequency.value = 880; // A5 note
            oscillator.type = 'sine';

            gainNode.gain.setValueAtTime(0.3, audioContext.currentTime);
            gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.3);

            oscillator.start(audioContext.currentTime);
            oscillator.stop(audioContext.currentTime + 0.3);

            // Add a second beep
            setTimeout(() => {
                const osc2 = audioContext.createOscillator();
                const gain2 = audioContext.createGain();

                osc2.connect(gain2);
                gain2.connect(audioContext.destination);

                osc2.frequency.value = 1100; // C#6 note
                osc2.type = 'sine';

                gain2.gain.setValueAtTime(0.2, audioContext.currentTime);
                gain2.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.2);

                osc2.start(audioContext.currentTime);
                osc2.stop(audioContext.currentTime + 0.2);
            }, 100);
        } catch (error) {
            console.error('Error playing notification sound:', error);
        }
    };

    const handleSelectConversation = async (conversation: Conversation) => {
        setSelectedConversation(conversation);

        try {
            // Load messages for this conversation
            const data = await api.chat.getConversation(conversation.id);
            setMessages(data.messages || []);

            // Mark messages as read
            socketService.markMessagesAsRead(conversation.id);

            // Update conversation unread count
            setConversations((prevConvs) =>
                prevConvs.map((conv) => (conv.id === conversation.id ? { ...conv, unreadCount: 0 } : conv))
            );

            // Assign conversation to this agent if not assigned
            if (!conversation.agentId && user) {
                await api.chat.assignConversation(conversation.id, String(user.id));
                socketService.assignConversation(conversation.id, String(user.id), user.name || 'موظف');
            }
        } catch (error) {
            console.error('Error loading conversation:', error);
        }
    };

    const handleSendMessage = () => {
        if (!message.trim() || !selectedConversation || !user) return;

        socketService.sendMessage(selectedConversation.id, String(user.id), 'agent', message);
        setMessage('');
        socketService.stopTyping(selectedConversation.id, 'agent');

        // Clear typing timeout
        if (typingTimeoutRef.current) {
            clearTimeout(typingTimeoutRef.current);
            typingTimeoutRef.current = null;
        }
    };

    const handleTyping = () => {
        if (!selectedConversation || !user) return;

        socketService.startTyping(selectedConversation.id, 'agent', user.name || 'موظف');

        // Clear existing timeout
        if (typingTimeoutRef.current) {
            clearTimeout(typingTimeoutRef.current);
        }

        // Set new timeout to stop typing after 2 seconds
        typingTimeoutRef.current = setTimeout(() => {
            socketService.stopTyping(selectedConversation.id, 'agent');
        }, 2000);
    };

    const handleKeyDown = (e: React.KeyboardEvent) => {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            handleSendMessage();
        }
    };

    const filteredConversations = conversations.filter((conv) =>
        conv.customerName.toLowerCase().includes(searchQuery.toLowerCase())
    );

    const totalUnread = conversations.reduce((sum, conv) => sum + (conv.unreadCount || 0), 0);

    return (
        <div className="h-[100dvh] bg-gradient-to-br from-gray-50 to-blue-50 flex flex-col overflow-hidden">
            {/* Simplified Header */}
            <div className="bg-white shadow-md sticky top-0 z-10 border-b-2 border-primary/10">
                <div className="max-w-7xl mx-auto px-4 py-4 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <button
                            onClick={() => navigate('/profile')}
                            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                        >
                            <ChevronLeft size={20} className="text-gray-600" />
                        </button>
                        <div className="flex items-center gap-3">
                            <div className="w-12 h-12 bg-gradient-to-br from-primary to-orange-500 rounded-xl flex items-center justify-center shadow-md">
                                <MessageCircle size={24} className="text-white" />
                            </div>
                            <div>
                                <h1 className="text-xl font-bold text-gray-900">خدمة العملاء</h1>
                                <p className="text-sm text-gray-500">
                                    {totalUnread > 0 ? `${totalUnread} رسالة جديدة` : 'لا توجد رسائل جديدة'}
                                </p>
                            </div>
                        </div>
                    </div>
                    <button
                        onClick={() => setSoundEnabled(!soundEnabled)}
                        className={`p-3 rounded-xl transition-all ${
                            soundEnabled 
                                ? 'bg-primary text-white shadow-md' 
                                : 'bg-gray-200 text-gray-500'
                        }`}
                        title={soundEnabled ? 'تعطيل الصوت' : 'تفعيل الصوت'}
                    >
                        <Volume2 size={18} />
                    </button>
                </div>
            </div>

            <div className="flex-1 flex overflow-hidden max-w-7xl mx-auto w-full">
                {/* Simplified Conversations List */}
                <div className={`w-full md:w-80 bg-white border-l border-gray-200 flex flex-col shadow-lg ${selectedConversation ? 'hidden md:flex' : 'flex'}`}>
                    {/* Simpler Search */}
                    <div className="p-4 bg-gray-50 border-b border-gray-200">
                        <div className="relative">
                            <Search size={16} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400" />
                            <input
                                type="text"
                                placeholder="بحث..."
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                className="w-full pr-9 pl-3 py-2.5 bg-white border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary transition-all"
                            />
                        </div>
                    </div>

                    {/* Simplified Conversations List */}
                    <div className="flex-1 overflow-y-auto">
                        {isLoading ? (
                            <div className="flex items-center justify-center h-32">
                                <div className="animate-spin rounded-full h-10 w-10 border-3 border-primary border-t-transparent"></div>
                            </div>
                        ) : filteredConversations.length === 0 ? (
                            <div className="text-center py-16 px-4">
                                <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                                    <MessageCircle size={32} className="text-gray-300" />
                                </div>
                                <p className="text-gray-400 text-sm">لا توجد محادثات</p>
                            </div>
                        ) : (
                            filteredConversations.map((conv) => (
                                <button
                                    key={conv.id}
                                    onClick={() => handleSelectConversation(conv)}
                                    className={`w-full p-4 border-b border-gray-100 hover:bg-blue-50/50 transition-all text-right ${
                                        selectedConversation?.id === conv.id 
                                            ? 'bg-gradient-to-l from-primary/10 to-blue-50 border-r-4 border-primary' 
                                            : ''
                                    }`}
                                >
                                    <div className="flex items-center justify-between gap-3">
                                        <div className="flex items-center gap-3 flex-1">
                                            <div className={`w-11 h-11 rounded-full flex items-center justify-center font-bold text-white text-sm shadow-md ${
                                                (conv.unreadCount || 0) > 0 
                                                    ? 'bg-gradient-to-br from-primary to-orange-500' 
                                                    : 'bg-gradient-to-br from-gray-400 to-gray-500'
                                            }`}>
                                                {conv.customerName.charAt(0).toUpperCase()}
                                            </div>
                                            <div className="text-right flex-1 min-w-0">
                                                <h3 className="font-bold text-gray-900 text-sm truncate">{conv.customerName}</h3>
                                                <p className="text-xs text-gray-500 flex items-center gap-1">
                                                    <Clock size={11} />
                                                    {new Date(conv.lastMessageAt).toLocaleTimeString('ar-EG', {
                                                        hour: '2-digit',
                                                        minute: '2-digit'
                                                    })}
                                                </p>
                                            </div>
                                        </div>
                                        {(conv.unreadCount || 0) > 0 && (
                                            <div className="bg-red-500 text-white text-xs font-bold px-2.5 py-1 rounded-full shadow-md">
                                                {conv.unreadCount}
                                            </div>
                                        )}
                                    </div>
                                </button>
                            ))
                        )}
                    </div>
                </div>

                {/* Simplified Chat Area */}
                <div className="flex-1 flex flex-col bg-gradient-to-br from-white to-blue-50/30 min-h-0">
                    {selectedConversation ? (
                        <>
                            {/* Cleaner Chat Header */}
                            <div className="bg-white border-b border-gray-200 p-4 shadow-sm">
                                <div className="flex items-center gap-3">
                                    <button
                                        onClick={() => setSelectedConversation(null)}
                                        className="md:hidden p-2 hover:bg-gray-100 rounded-lg transition-colors flex-shrink-0"
                                    >
                                        <ChevronLeft size={20} className="text-gray-600" />
                                    </button>
                                    <div className="w-12 h-12 bg-gradient-to-br from-primary to-orange-500 rounded-xl flex items-center justify-center text-white font-bold shadow-md flex-shrink-0">
                                        {selectedConversation.customerName.charAt(0).toUpperCase()}
                                    </div>
                                    <div>
                                        <h2 className="font-bold text-gray-900 text-lg">{selectedConversation.customerName}</h2>
                                        <div className="flex items-center gap-2 text-xs">
                                            <span className={`w-2 h-2 rounded-full ${
                                                selectedConversation.status === 'active' ? 'bg-green-500' : 'bg-gray-400'
                                            }`}></span>
                                            <span className="text-gray-500">
                                                {selectedConversation.status === 'active' ? 'نشط الآن' : 'غير متصل'}
                                            </span>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Simplified Messages */}
                            <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-3">
                                {messages.length === 0 ? (
                                    <div className="flex items-center justify-center h-full">
                                        <div className="text-center">
                                            <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-3">
                                                <MessageCircle size={28} className="text-gray-300" />
                                            </div>
                                            <p className="text-gray-400 text-sm">ابدأ المحادثة</p>
                                        </div>
                                    </div>
                                ) : (
                                    <>
                                        {messages.map((msg) => (
                                            <div
                                                key={msg.id}
                                                className={`flex ${msg.senderType === 'agent' ? 'justify-end' : 'justify-start'}`}
                                            >
                                                <div
                                                    className={`max-w-[75%] rounded-2xl px-5 py-3 shadow-sm ${
                                                        msg.senderType === 'agent'
                                                            ? 'bg-gradient-to-br from-primary to-orange-500 text-white rounded-br-md'
                                                            : 'bg-white text-gray-900 rounded-bl-md border border-gray-100'
                                                    }`}
                                                >
                                                    <p className="text-sm leading-relaxed whitespace-pre-wrap">{msg.message}</p>
                                                    <div className="flex items-center justify-between gap-2 mt-2">
                                                        <p
                                                            className={`text-xs font-medium ${
                                                                msg.senderType === 'agent' ? 'text-white/80' : 'text-gray-400'
                                                            }`}
                                                        >
                                                            {new Date(msg.timestamp).toLocaleTimeString('ar-EG', {
                                                                hour: '2-digit',
                                                                minute: '2-digit'
                                                            })}
                                                        </p>
                                                        {msg.senderType === 'agent' && msg.isRead && (
                                                            <CheckCheck size={14} className="text-white/80" />
                                                        )}
                                                    </div>
                                                </div>
                                            </div>
                                        ))}

                                        {/* Simple Typing Indicator */}
                                        {isTyping && (
                                            <div className="flex justify-start">
                                                <div className="bg-white rounded-2xl rounded-bl-md px-5 py-3 shadow-sm border border-gray-100">
                                                    <div className="flex items-center gap-1">
                                                        <div className="w-2 h-2 bg-primary rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></div>
                                                        <div className="w-2 h-2 bg-primary rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></div>
                                                        <div className="w-2 h-2 bg-primary rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></div>
                                                    </div>
                                                </div>
                                            </div>
                                        )}
                                    </>
                                )}
                                <div ref={messagesEndRef} />
                            </div>

                            {/* Simplified Input Area */}
                            <div className="bg-white border-t border-gray-200 p-3 sm:p-5 shadow-lg flex-shrink-0" style={{ paddingBottom: 'max(0.75rem, env(safe-area-inset-bottom, 0.75rem))' }}>
                                <div className="flex items-center gap-3" dir="rtl">
                                    <textarea
                                        value={message}
                                        onChange={(e) => {
                                            setMessage(e.target.value);
                                            handleTyping();
                                        }}
                                        onKeyDown={handleKeyDown}
                                        placeholder="اكتب رسالتك هنا..."
                                        rows={1}
                                        dir="rtl"
                                        className="flex-1 px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary focus:bg-white resize-none text-right text-sm transition-all"
                                        style={{
                                            minHeight: '44px',
                                            maxHeight: '120px',
                                            overflowY: 'auto'
                                        }}
                                    />
                                    <button
                                        onClick={handleSendMessage}
                                        disabled={!message.trim()}
                                        className="bg-gradient-to-br from-primary to-orange-500 text-white p-3.5 rounded-xl hover:shadow-lg disabled:opacity-40 disabled:cursor-not-allowed transition-all transform hover:scale-105 active:scale-95 flex-shrink-0"
                                        title="إرسال"
                                    >
                                        <Send size={20} />
                                    </button>
                                </div>
                            </div>
                        </>
                    ) : (
                        <div className="flex items-center justify-center h-full">
                            <div className="text-center px-8">
                                <div className="w-32 h-32 bg-gradient-to-br from-primary/10 to-blue-100 rounded-3xl mx-auto mb-6 flex items-center justify-center shadow-lg">
                                    <MessageCircle size={60} className="text-primary" />
                                </div>
                                <h2 className="text-2xl font-bold text-gray-900 mb-3">مرحباً بك</h2>
                                <p className="text-gray-500 text-base">اختر محادثة من القائمة للبدء في الرد على العملاء</p>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default CustomerServiceDashboard;
