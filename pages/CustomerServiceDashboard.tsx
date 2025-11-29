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
        <div className="min-h-screen bg-gray-50 flex flex-col">
            {/* Header */}
            <div className="bg-white shadow-sm sticky top-0 z-10">
                <div className="px-4 py-3 flex items-center justify-between">
                    <div className="flex items-center">
                        <button
                            onClick={() => navigate('/profile')}
                            className="p-2 hover:bg-gray-100 rounded-full ml-2 transition-colors"
                        >
                            <ChevronLeft size={24} className="text-gray-700" />
                        </button>
                        <div className="flex items-center">
                            <div className="bg-primary/10 p-2 rounded-full ml-3">
                                <Users size={24} className="text-primary" />
                            </div>
                            <div>
                                <h1 className="text-lg font-bold text-gray-900">لوحة خدمة العملاء</h1>
                                <p className="text-xs text-gray-500">
                                    {conversations.length} محادثة {totalUnread > 0 && `• ${totalUnread} غير مقروءة`}
                                </p>
                            </div>
                        </div>
                    </div>
                    <button
                        onClick={() => setSoundEnabled(!soundEnabled)}
                        className={`p-2 rounded-full transition-colors ${
                            soundEnabled ? 'bg-primary/10 text-primary' : 'bg-gray-100 text-gray-400'
                        }`}
                        title={soundEnabled ? 'تعطيل الصوت' : 'تفعيل الصوت'}
                    >
                        <Volume2 size={20} />
                    </button>
                </div>
            </div>

            <div className="flex-1 flex overflow-hidden">
                {/* Conversations List */}
                <div className="w-full md:w-80 bg-white border-l border-gray-200 flex flex-col">
                    {/* Search */}
                    <div className="p-3 border-b border-gray-200">
                        <div className="relative">
                            <Search size={18} className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                            <input
                                type="text"
                                placeholder="بحث عن محادثة..."
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                className="w-full pr-10 pl-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
                            />
                        </div>
                    </div>

                    {/* Conversations */}
                    <div className="flex-1 overflow-y-auto">
                        {isLoading ? (
                            <div className="flex items-center justify-center h-32">
                                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
                            </div>
                        ) : filteredConversations.length === 0 ? (
                            <div className="text-center py-12 px-4">
                                <MessageCircle size={48} className="mx-auto text-gray-300 mb-3" />
                                <p className="text-gray-500">لا توجد محادثات</p>
                            </div>
                        ) : (
                            filteredConversations.map((conv) => (
                                <button
                                    key={conv.id}
                                    onClick={() => handleSelectConversation(conv)}
                                    className={`w-full p-4 border-b border-gray-100 hover:bg-gray-50 transition-colors text-right ${
                                        selectedConversation?.id === conv.id ? 'bg-primary/5' : ''
                                    }`}
                                >
                                    <div className="flex items-start justify-between mb-1">
                                        <div className="flex items-center">
                                            <div className="w-10 h-10 bg-primary/10 rounded-full flex items-center justify-center text-primary font-bold ml-3">
                                                {conv.customerName.charAt(0).toUpperCase()}
                                            </div>
                                            <div className="text-right">
                                                <h3 className="font-semibold text-gray-900">{conv.customerName}</h3>
                                                <p className="text-xs text-gray-500 flex items-center">
                                                    <Clock size={12} className="ml-1" />
                                                    {new Date(conv.lastMessageAt).toLocaleDateString('ar-EG', {
                                                        month: 'short',
                                                        day: 'numeric',
                                                        hour: '2-digit',
                                                        minute: '2-digit'
                                                    })}
                                                </p>
                                            </div>
                                        </div>
                                        {(conv.unreadCount || 0) > 0 && (
                                            <span className="bg-primary text-white text-xs font-bold px-2 py-1 rounded-full min-w-[20px] text-center">
                                                {conv.unreadCount}
                                            </span>
                                        )}
                                    </div>
                                </button>
                            ))
                        )}
                    </div>
                </div>

                {/* Chat Area */}
                <div className="flex-1 flex flex-col bg-gray-50">
                    {selectedConversation ? (
                        <>
                            {/* Chat Header */}
                            <div className="bg-white border-b border-gray-200 p-4">
                                <div className="flex items-center">
                                    <div className="w-10 h-10 bg-primary/10 rounded-full flex items-center justify-center text-primary font-bold ml-3">
                                        {selectedConversation.customerName.charAt(0).toUpperCase()}
                                    </div>
                                    <div>
                                        <h2 className="font-bold text-gray-900">{selectedConversation.customerName}</h2>
                                        <p className="text-xs text-gray-500">
                                            {selectedConversation.status === 'active' ? 'نشط' : 'مغلق'}
                                        </p>
                                    </div>
                                </div>
                            </div>

                            {/* Messages */}
                            <div className="flex-1 overflow-y-auto p-4 space-y-4">
                                {messages.length === 0 ? (
                                    <div className="flex items-center justify-center h-full">
                                        <p className="text-gray-500">لا توجد رسائل بعد</p>
                                    </div>
                                ) : (
                                    <>
                                        {messages.map((msg) => (
                                            <div
                                                key={msg.id}
                                                className={`flex ${msg.senderType === 'agent' ? 'justify-end' : 'justify-start'}`}
                                            >
                                                <div
                                                    className={`max-w-[70%] rounded-2xl px-4 py-3 ${
                                                        msg.senderType === 'agent'
                                                            ? 'bg-primary text-white rounded-br-sm'
                                                            : 'bg-white text-gray-900 shadow-sm rounded-bl-sm'
                                                    }`}
                                                >
                                                    <p className="text-sm leading-relaxed whitespace-pre-wrap">{msg.message}</p>
                                                    <div className="flex items-center justify-between mt-1">
                                                        <p
                                                            className={`text-xs ${
                                                                msg.senderType === 'agent' ? 'text-white/70' : 'text-gray-400'
                                                            }`}
                                                        >
                                                            {new Date(msg.timestamp).toLocaleTimeString('ar-EG', {
                                                                hour: '2-digit',
                                                                minute: '2-digit'
                                                            })}
                                                        </p>
                                                        {msg.senderType === 'agent' && msg.isRead && (
                                                            <CheckCheck size={14} className="text-white/70" />
                                                        )}
                                                    </div>
                                                </div>
                                            </div>
                                        ))}

                                        {/* Typing Indicator */}
                                        {isTyping && (
                                            <div className="flex justify-start">
                                                <div className="bg-white rounded-2xl rounded-bl-sm px-4 py-3 shadow-sm">
                                                    <div className="flex items-center space-x-1">
                                                        <div
                                                            className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"
                                                            style={{ animationDelay: '0ms' }}
                                                        ></div>
                                                        <div
                                                            className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"
                                                            style={{ animationDelay: '150ms' }}
                                                        ></div>
                                                        <div
                                                            className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"
                                                            style={{ animationDelay: '300ms' }}
                                                        ></div>
                                                    </div>
                                                </div>
                                            </div>
                                        )}
                                    </>
                                )}
                                <div ref={messagesEndRef} />
                            </div>

                            {/* Input Area */}
                            <div className="bg-white border-t border-gray-200 p-4">
                                <div className="flex items-end gap-2" dir="rtl">
                                    <div className="flex-1">
                                        <textarea
                                            value={message}
                                            onChange={(e) => {
                                                setMessage(e.target.value);
                                                handleTyping();
                                            }}
                                            onKeyDown={handleKeyDown}
                                            placeholder="اكتب ردك..."
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
                        </>
                    ) : (
                        <div className="flex items-center justify-center h-full">
                            <div className="text-center">
                                <div className="bg-primary/10 p-6 rounded-full w-24 h-24 mx-auto mb-4 flex items-center justify-center">
                                    <MessageCircle size={48} className="text-primary" />
                                </div>
                                <h2 className="text-xl font-bold text-gray-900 mb-2">اختر محادثة</h2>
                                <p className="text-gray-500">اختر محادثة من القائمة للبدء</p>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default CustomerServiceDashboard;
