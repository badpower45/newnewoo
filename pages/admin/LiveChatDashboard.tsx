import React, { useState, useEffect } from 'react';
import { MessageCircle, User, Clock, Wifi, WifiOff, RefreshCw, Send, ArrowRight, ChevronRight } from 'lucide-react';
import { api } from '../../services/api';
import { socketService } from '../../services/socketService';
import { supabaseChatService, ChatConversation, ChatMessage } from '../../services/supabaseChatService';
import { useAuth } from '../../context/AuthContext';

const toNumericId = (value: unknown): number | null => {
    if (typeof value === 'number' && Number.isFinite(value)) return value;
    if (typeof value === 'string' && value.trim() !== '') {
        const parsed = Number(value);
        if (Number.isFinite(parsed)) return parsed;
    }
    return null;
};

interface Conversation {
    id: number;
    customerName: string;
    agentId: number | null;
    status: string;
    createdAt: string;
    lastMessageAt: string;
}

interface Message {
    id: number;
    conversationId: number;
    senderId: number | null;
    senderType: 'customer' | 'agent' | 'bot';
    message: string;
    timestamp: string;
}

const LiveChatDashboard = () => {
    const { user } = useAuth();
    const agentId = toNumericId(user?.id);
    const agentName = user?.name || (user as { full_name?: string })?.full_name || user?.email || 'Agent';
    const [conversations, setConversations] = useState<Conversation[]>([]);
    const [selectedConv, setSelectedConv] = useState<number | null>(null);
    const [messages, setMessages] = useState<Message[]>([]);
    const [inputMessage, setInputMessage] = useState('');
    const [filter, setFilter] = useState<'all' | 'assigned' | 'unassigned'>('all');
    const [useSupabase, setUseSupabase] = useState(false);
    const [isConnected, setIsConnected] = useState(true);
    const [mobileShowChat, setMobileShowChat] = useState(false);
    const typingTimeoutRef = React.useRef<NodeJS.Timeout>();

    const appendMessage = (incoming: Message) => {
        setMessages(prev => {
            if (prev.some(existing => existing.id === incoming.id)) return prev;
            return [...prev, incoming];
        });
    };

    // Load conversations
    useEffect(() => {
        loadConversations();

        // Connect socket as agent
        socketService.connect();
        if (agentId !== null) {
            socketService.joinAsAgent(agentId, agentName);
        }

        // Listen for new messages
        socketService.on('message:notification', ({ conversationId }: { conversationId: number }) => {
            loadConversations();
        });

        socketService.on('message:new', (message: Message) => {
            if (message.conversationId === selectedConv) {
                appendMessage(message);
            }
        });

        return () => {
            socketService.off('message:notification');
            socketService.off('message:new');
            supabaseChatService.unsubscribeFromMessages();
        };
    }, [agentId, agentName, selectedConv]);

    const loadConversations = async () => {
        try {
            // Try API first
            const response = await api.chat.getConversations('active');
            const list = Array.isArray(response?.conversations) ? response.conversations : [];
            if (list.length > 0) {
                setConversations(list);
                setIsConnected(true);
                setUseSupabase(false);
                return;
            }
        } catch (error) {
            console.warn('API failed, trying Supabase:', error);
        }

        // Fallback to Supabase
        try {
            const supabaseConvs = await supabaseChatService.getAllConversations('active');
            const formatted = supabaseConvs.map(c => ({
                id: c.id,
                customerName: c.customer_name,
                agentId: c.agent_id,
                status: c.status,
                createdAt: c.created_at,
                lastMessageAt: c.last_message_at
            }));
            setConversations(formatted);
            setUseSupabase(true);
            setIsConnected(true);
        } catch (supaError) {
            console.error('Failed to load conversations from Supabase:', supaError);
            setConversations([]);
            setIsConnected(false);
        }
    };

    const loadMessages = async (convId: number) => {
        try {
            if (useSupabase) {
                // Use Supabase
                const msgs = await supabaseChatService.getMessages(convId);
                const formatted = msgs.map(m => ({
                    id: m.id,
                    conversationId: m.conversation_id,
                    senderId: m.sender_id,
                    senderType: m.sender_type as 'customer' | 'agent' | 'bot',
                    message: m.message,
                    timestamp: m.timestamp
                }));
                setMessages(formatted);
            } else {
                // Use API
                const response = await api.chat.getConversation(convId);
                const msgs = Array.isArray(response?.messages) ? response.messages : [];
                setMessages(msgs);
                socketService.openConversation(convId);
            }

            // Subscribe to new messages (Supabase fallback)
            supabaseChatService.subscribeToMessages(convId, agentId, (newMsg) => {
                appendMessage({
                    id: newMsg.id,
                    conversationId: newMsg.conversation_id,
                    senderId: newMsg.sender_id,
                    senderType: newMsg.sender_type as 'customer' | 'agent' | 'bot',
                    message: newMsg.message,
                    timestamp: newMsg.timestamp
                });
            });
        } catch (error) {
            console.error('Failed to load messages:', error);
            setMessages([]);
        }
    };

    const handleSelectConversation = (convId: number) => {
        setSelectedConv(convId);
        setMobileShowChat(true);
        loadMessages(convId);
    };

    const handleSendMessage = async () => {
        if (!inputMessage.trim() || !selectedConv || agentId === null) return;

        const message = inputMessage.trim();
        setInputMessage('');

        const canUseSocket = socketService.isConnected() && !socketService.isDisabled();

        try {
            if (canUseSocket) {
                // Socket will handle the message and the 'message:new' event will add it to the list
                socketService.sendMessage(selectedConv, agentId, 'agent', message);
                socketService.stopTyping(selectedConv, 'agent');
            } else if (useSupabase) {
                const sentMessage = await supabaseChatService.sendMessage(selectedConv, agentId, 'agent', message);
                if (sentMessage) {
                    appendMessage({
                        id: sentMessage.id,
                        conversationId: sentMessage.conversation_id,
                        senderId: sentMessage.sender_id,
                        senderType: sentMessage.sender_type as 'customer' | 'agent' | 'bot',
                        message: sentMessage.message,
                        timestamp: sentMessage.timestamp
                    });
                }
            } else {
                await api.chat.sendMessage(selectedConv, agentId, 'agent', message);
                // Only append if API call succeeded (no socket event will trigger)
                appendMessage({
                    id: Date.now(),
                    conversationId: selectedConv,
                    senderId: agentId,
                    senderType: 'agent',
                    message,
                    timestamp: new Date().toISOString()
                });
            }
        } catch (error) {
            console.error('Failed to send message:', error);
            // Restore message on error
            setInputMessage(message);
        }
    };

    const handleInputChange = (val: string) => {
        setInputMessage(val);
        if (!selectedConv || agentId === null || useSupabase || !socketService.isConnected()) return;
        socketService.startTyping(selectedConv, 'agent', agentName);
        if (typingTimeoutRef.current) clearTimeout(typingTimeoutRef.current);
        typingTimeoutRef.current = setTimeout(() => {
            socketService.stopTyping(selectedConv!, 'agent');
        }, 2000);
    };

    const handleAssign = async (convId: number) => {
        if (agentId === null) return;
        try {
            if (useSupabase) {
                await supabaseChatService.assignConversation(convId, agentId);
            } else {
                await api.chat.assignConversation(convId, agentId);
                if (socketService.isConnected()) {
                    socketService.assignConversation(convId, agentId, agentName);
                }
            }
            loadConversations();
        } catch (error) {
            console.error('Failed to assign:', error);
        }
    };

    const filteredConversations = conversations.filter(conv => {
        if (filter === 'assigned') return agentId !== null && conv.agentId === agentId;
        if (filter === 'unassigned') return conv.agentId === null;
        return true;
    });

    const formatTime = (timestamp: string) => {
        const date = new Date(timestamp);
        return date.toLocaleTimeString('ar-EG', { hour: '2-digit', minute: '2-digit' });
    };
    const selectedConversation = conversations.find(conv => conv.id === selectedConv);

    return (
        <div className="flex flex-col md:flex-row h-[calc(100vh-64px)] md:h-[calc(100vh-120px)] bg-white rounded-xl shadow-lg overflow-hidden">
            {/* Conversations List - full width on mobile, 1/3 on desktop */}
            <div className={`${
                mobileShowChat ? 'hidden md:flex' : 'flex'
            } w-full md:w-1/3 lg:w-[320px] border-r-0 md:border-r border-gray-200 flex-col h-full`}>
                <div className="p-3 md:p-4 border-b border-gray-200">
                    <div className="flex items-center justify-between mb-2 md:mb-3">
                        <h2 className="text-lg md:text-xl font-bold text-gray-800">المحادثات</h2>
                        <div className="flex items-center gap-1.5 md:gap-2">
                            <button
                                onClick={() => loadConversations()}
                                className="p-1.5 text-gray-500 hover:text-brand-orange hover:bg-orange-50 rounded-lg transition-colors"
                                title="تحديث"
                            >
                                <RefreshCw size={16} />
                            </button>
                            <span className={`flex items-center gap-1 text-[10px] md:text-xs px-1.5 md:px-2 py-0.5 md:py-1 rounded-full ${isConnected ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                                {isConnected ? <Wifi size={12} /> : <WifiOff size={12} />}
                                {useSupabase ? 'Supabase' : 'Socket'}
                            </span>
                        </div>
                    </div>

                    {/* Filter Tabs - scrollable on mobile */}
                    <div className="flex space-x-1.5 md:space-x-2 rtl:space-x-reverse overflow-x-auto scrollbar-hide">
                        <button
                            onClick={() => setFilter('all')}
                            className={`px-2.5 md:px-3 py-1 rounded-lg text-xs md:text-sm font-medium transition-colors whitespace-nowrap ${filter === 'all' ? 'bg-brand-orange text-white' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                                }`}
                        >
                            الكل ({conversations.length})
                        </button>
                        <button
                            onClick={() => setFilter('assigned')}
                            className={`px-2.5 md:px-3 py-1 rounded-lg text-xs md:text-sm font-medium transition-colors whitespace-nowrap ${filter === 'assigned' ? 'bg-brand-orange text-white' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                                }`}
                        >
                            المخصصة لي
                        </button>
                        <button
                            onClick={() => setFilter('unassigned')}
                            className={`px-2.5 md:px-3 py-1 rounded-lg text-xs md:text-sm font-medium transition-colors whitespace-nowrap ${filter === 'unassigned' ? 'bg-brand-orange text-white' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                                }`}
                        >
                            غير مخصصة
                        </button>
                    </div>
                </div>

                {/* Conversations */}
                <div className="flex-1 overflow-y-auto">
                    {filteredConversations.length === 0 ? (
                        <div className="flex flex-col items-center justify-center h-full text-gray-400 py-12">
                            <MessageCircle size={40} className="mb-2" />
                            <p className="text-sm">لا توجد محادثات</p>
                        </div>
                    ) : (
                        filteredConversations.map(conv => (
                            <div
                                key={conv.id}
                                onClick={() => handleSelectConversation(conv.id)}
                                className={`p-3 md:p-4 border-b border-gray-100 cursor-pointer hover:bg-gray-50 transition-colors ${selectedConv === conv.id ? 'bg-orange-50 border-r-4 border-brand-orange' : ''
                                    }`}
                            >
                                <div className="flex items-center justify-between mb-1.5 md:mb-2">
                                    <div className="flex items-center space-x-2 rtl:space-x-reverse">
                                        <div className="w-8 h-8 md:w-9 md:h-9 rounded-full bg-gray-100 flex items-center justify-center">
                                            <User size={16} className="text-gray-600" />
                                        </div>
                                        <span className="font-semibold text-gray-800 text-sm md:text-base truncate max-w-[120px] md:max-w-none">{conv.customerName}</span>
                                    </div>
                                    <div className="flex items-center gap-1">
                                        {conv.agentId === null && (
                                            <button
                                                onClick={(e) => {
                                                    e.stopPropagation();
                                                    handleAssign(conv.id);
                                                }}
                                                className="text-[10px] md:text-xs bg-brand-orange text-white px-1.5 md:px-2 py-0.5 md:py-1 rounded hover:bg-orange-600"
                                            >
                                                تخصيص لي
                                            </button>
                                        )}
                                        <ChevronRight size={16} className="text-gray-400 md:hidden" />
                                    </div>
                                </div>
                                <div className="flex items-center text-[10px] md:text-xs text-gray-500 pr-10 md:pr-11">
                                    <Clock size={12} className="ml-1 rtl:mr-1" />
                                    {formatTime(conv.lastMessageAt)}
                                </div>
                            </div>
                        ))
                    )}
                </div>
            </div>

            {/* Chat Area - full width on mobile, flex-1 on desktop */}
            <div className={`${
                mobileShowChat ? 'flex' : 'hidden md:flex'
            } flex-1 flex-col h-full`}>
                {selectedConv ? (
                    <>
                        {/* Chat Header with back button on mobile */}
                        <div className="flex items-center gap-2 p-3 md:p-4 bg-white border-b border-gray-200">
                            <button
                                onClick={() => setMobileShowChat(false)}
                                className="md:hidden p-1.5 -mr-1 text-gray-600 hover:bg-gray-100 rounded-lg"
                            >
                                <ArrowRight size={22} />
                            </button>
                            <div className="w-9 h-9 rounded-full bg-gray-100 flex items-center justify-center">
                                <User size={18} className="text-gray-600" />
                            </div>
                            <div className="flex-1 min-w-0">
                                <p className="font-semibold text-gray-800 text-sm md:text-base truncate">
                                    {selectedConversation?.customerName || 'عميل'}
                                </p>
                                <p className="text-[10px] md:text-xs text-green-600">متصل الآن</p>
                            </div>
                        </div>

                        {/* Messages */}
                        <div className="flex-1 overflow-y-auto p-3 md:p-4 space-y-2 md:space-y-3 bg-gray-50">
                            {messages.map(msg => (
                                <div
                                    key={msg.id}
                                    className={`flex ${msg.senderType === 'agent' ? 'justify-end' : 'justify-start'}`}
                                >
                                    <div
                                        className={`max-w-[80%] md:max-w-[70%] rounded-2xl px-3 md:px-4 py-2 md:py-2.5 shadow-sm ${
                                            msg.senderType === 'agent'
                                                ? 'bg-green-500 text-white rounded-br-sm'
                                                : msg.senderType === 'customer'
                                                ? 'bg-white text-gray-800 border border-gray-200 rounded-bl-sm'
                                                : 'bg-blue-100 text-blue-800 border border-blue-200'
                                        }`}
                                    >
                                        {msg.senderType !== 'agent' && (
                                            <p className="text-[10px] font-semibold mb-1 opacity-70">
                                                {msg.senderType === 'customer'
                                                    ? `👤 ${selectedConversation?.customerName || 'عميل'}`
                                                    : '🤖 بوت'}
                                            </p>
                                        )}
                                        <p className="text-[13px] md:text-sm leading-relaxed">{msg.message}</p>
                                        <p className={`text-[10px] mt-1 flex items-center gap-1 ${
                                            msg.senderType === 'agent' ? 'text-white/80 justify-end' : 'text-gray-500'
                                        }`}>
                                            {formatTime(msg.timestamp)}
                                            {msg.senderType === 'agent' && <span>✓✓</span>}
                                        </p>
                                    </div>
                                </div>
                            ))}
                        </div>

                        {/* Input - larger touch targets on mobile */}
                        <div className="p-2.5 md:p-4 bg-white border-t border-gray-200">
                            <div className="flex space-x-2 rtl:space-x-reverse items-end">
                                <input
                                    type="text"
                                    value={inputMessage}
                                    onChange={(e) => handleInputChange(e.target.value)}
                                    onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
                                    placeholder="اكتب رسالتك..."
                                    className="flex-1 px-3 md:px-4 py-2.5 md:py-2 border border-gray-300 rounded-xl md:rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-orange text-sm"
                                />
                                <button
                                    onClick={handleSendMessage}
                                    disabled={!inputMessage.trim()}
                                    className="bg-brand-orange hover:bg-orange-600 disabled:bg-gray-300 text-white p-2.5 md:px-6 md:py-2 rounded-xl md:rounded-lg transition-colors flex-shrink-0"
                                >
                                    <Send size={20} className="md:hidden" />
                                    <span className="hidden md:inline">إرسال</span>
                                </button>
                            </div>
                        </div>
                    </>
                ) : (
                    <div className="flex flex-col items-center justify-center h-full text-gray-400">
                        <MessageCircle size={64} className="mb-4" />
                        <p className="text-lg">اختر محادثة للبدء</p>
                    </div>
                )}
            </div>
        </div>
    );
};

export default LiveChatDashboard;
