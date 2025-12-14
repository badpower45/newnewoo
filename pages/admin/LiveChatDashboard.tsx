import React, { useState, useEffect } from 'react';
import { MessageCircle, User, Clock, Wifi, WifiOff, RefreshCw, Send } from 'lucide-react';
import { api } from '../../services/api';
import { socketService } from '../../services/socketService';
import { supabaseChatService, ChatConversation, ChatMessage } from '../../services/supabaseChatService';
import { useAuth } from '../../context/AuthContext';

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
    const [conversations, setConversations] = useState<Conversation[]>([]);
    const [selectedConv, setSelectedConv] = useState<number | null>(null);
    const [messages, setMessages] = useState<Message[]>([]);
    const [inputMessage, setInputMessage] = useState('');
    const [filter, setFilter] = useState<'all' | 'assigned' | 'unassigned'>('all');
    const [useSupabase, setUseSupabase] = useState(false);
    const [isConnected, setIsConnected] = useState(true);
    const typingTimeoutRef = React.useRef<NodeJS.Timeout>();

    // Load conversations
    useEffect(() => {
        loadConversations();

        // Connect socket as agent
        socketService.connect();
        if (user) {
            socketService.joinAsAgent(user.id, user.name);
        }

        // Listen for new messages
        socketService.on('message:notification', ({ conversationId }: { conversationId: number }) => {
            loadConversations();
        });

        socketService.on('message:new', (message: Message) => {
            if (message.conversationId === selectedConv) {
                setMessages(prev => [...prev, message]);
            }
        });

        return () => {
            socketService.off('message:notification');
            socketService.off('message:new');
            supabaseChatService.unsubscribeFromMessages();
        };
    }, [user, selectedConv]);

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
                
                // Subscribe to new messages
                supabaseChatService.subscribeToMessages(convId, (newMsg) => {
                    setMessages(prev => [...prev, {
                        id: newMsg.id,
                        conversationId: newMsg.conversation_id,
                        senderId: newMsg.sender_id,
                        senderType: newMsg.sender_type as 'customer' | 'agent' | 'bot',
                        message: newMsg.message,
                        timestamp: newMsg.timestamp
                    }]);
                });
            } else {
                // Use API
                const response = await api.chat.getConversation(convId);
                const msgs = Array.isArray(response?.messages) ? response.messages : [];
                setMessages(msgs);
                socketService.openConversation(convId);
            }
        } catch (error) {
            console.error('Failed to load messages:', error);
            setMessages([]);
        }
    };

    const handleSelectConversation = (convId: number) => {
        setSelectedConv(convId);
        loadMessages(convId);
    };

    const handleSendMessage = async () => {
        if (!inputMessage.trim() || !selectedConv || !user) return;

        const message = inputMessage.trim();
        setInputMessage('');

        if (useSupabase) {
            // Use Supabase
            await supabaseChatService.sendMessage(selectedConv, user.id, 'agent', message);
        } else {
            // Use Socket
            socketService.sendMessage(selectedConv, user.id, 'agent', message);
            socketService.stopTyping(selectedConv, 'agent');
        }
    };

    const handleInputChange = (val: string) => {
        setInputMessage(val);
        if (!selectedConv || !user || useSupabase) return;
        socketService.startTyping(selectedConv, 'agent', user.name);
        if (typingTimeoutRef.current) clearTimeout(typingTimeoutRef.current);
        typingTimeoutRef.current = setTimeout(() => {
            socketService.stopTyping(selectedConv!, 'agent');
        }, 2000);
    };

    const handleAssign = async (convId: number) => {
        if (!user) return;
        try {
            if (useSupabase) {
                await supabaseChatService.assignConversation(convId, user.id);
            } else {
                await api.chat.assignConversation(convId, user.id);
                socketService.assignConversation(convId, user.id, user.name);
            }
            loadConversations();
        } catch (error) {
            console.error('Failed to assign:', error);
        }
    };

    const filteredConversations = conversations.filter(conv => {
        if (filter === 'assigned') return conv.agentId === user?.id;
        if (filter === 'unassigned') return conv.agentId === null;
        return true;
    });

    const formatTime = (timestamp: string) => {
        const date = new Date(timestamp);
        return date.toLocaleTimeString('ar-EG', { hour: '2-digit', minute: '2-digit' });
    };

    return (
        <div className="flex h-[calc(100vh-120px)] bg-white rounded-xl shadow-lg overflow-hidden">
            {/* Conversations List */}
            <div className="w-1/3 border-r border-gray-200 flex flex-col">
                <div className="p-4 border-b border-gray-200">
                    <div className="flex items-center justify-between mb-3">
                        <h2 className="text-xl font-bold text-gray-800">المحادثات المباشرة</h2>
                        <div className="flex items-center gap-2">
                            <button
                                onClick={() => loadConversations()}
                                className="p-1.5 text-gray-500 hover:text-brand-orange hover:bg-orange-50 rounded-lg transition-colors"
                                title="تحديث"
                            >
                                <RefreshCw size={16} />
                            </button>
                            <span className={`flex items-center gap-1 text-xs px-2 py-1 rounded-full ${isConnected ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                                {isConnected ? <Wifi size={12} /> : <WifiOff size={12} />}
                                {useSupabase ? 'Supabase' : 'Socket'}
                            </span>
                        </div>
                    </div>

                    {/* Filter Tabs */}
                    <div className="flex space-x-2 rtl:space-x-reverse">
                        <button
                            onClick={() => setFilter('all')}
                            className={`px-3 py-1 rounded-lg text-sm font-medium transition-colors ${filter === 'all' ? 'bg-brand-orange text-white' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                                }`}
                        >
                            الكل ({conversations.length})
                        </button>
                        <button
                            onClick={() => setFilter('assigned')}
                            className={`px-3 py-1 rounded-lg text-sm font-medium transition-colors ${filter === 'assigned' ? 'bg-brand-orange text-white' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                                }`}
                        >
                            المخصصة لي
                        </button>
                        <button
                            onClick={() => setFilter('unassigned')}
                            className={`px-3 py-1 rounded-lg text-sm font-medium transition-colors ${filter === 'unassigned' ? 'bg-brand-orange text-white' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                                }`}
                        >
                            غير مخصصة
                        </button>
                    </div>
                </div>

                {/* Conversations */}
                <div className="flex-1 overflow-y-auto">
                    {filteredConversations.length === 0 ? (
                        <div className="flex flex-col items-center justify-center h-full text-gray-400">
                            <MessageCircle size={48} className="mb-2" />
                            <p>لا توجد محادثات</p>
                        </div>
                    ) : (
                        filteredConversations.map(conv => (
                            <div
                                key={conv.id}
                                onClick={() => handleSelectConversation(conv.id)}
                                className={`p-4 border-b border-gray-100 cursor-pointer hover:bg-gray-50 transition-colors ${selectedConv === conv.id ? 'bg-orange-50 border-r-4 border-brand-orange' : ''
                                    }`}
                            >
                                <div className="flex items-center justify-between mb-2">
                                    <div className="flex items-center space-x-2 rtl:space-x-reverse">
                                        <User size={16} className="text-gray-600" />
                                        <span className="font-semibold text-gray-800">{conv.customerName}</span>
                                    </div>
                                    {conv.agentId === null && (
                                        <button
                                            onClick={(e) => {
                                                e.stopPropagation();
                                                handleAssign(conv.id);
                                            }}
                                            className="text-xs bg-brand-orange text-white px-2 py-1 rounded hover:bg-orange-600"
                                        >
                                            تخصيص لي
                                        </button>
                                    )}
                                </div>
                                <div className="flex items-center text-xs text-gray-500">
                                    <Clock size={12} className="ml-1 rtl:mr-1" />
                                    {formatTime(conv.lastMessageAt)}
                                </div>
                            </div>
                        ))
                    )}
                </div>
            </div>

            {/* Chat Area */}
            <div className="flex-1 flex flex-col">
                {selectedConv ? (
                    <>
                        {/* Messages */}
                        <div className="flex-1 overflow-y-auto p-4 space-y-3 bg-gray-50">
                            {messages.map(msg => (
                                <div
                                    key={msg.id}
                                    className={`flex ${msg.senderType === 'agent' ? 'justify-end' : 'justify-start'}`}
                                >
                                    <div
                                        className={`max-w-[70%] rounded-2xl px-4 py-2 ${msg.senderType === 'agent'
                                                ? 'bg-brand-orange text-white'
                                                : 'bg-white text-gray-800 shadow'
                                            }`}
                                    >
                                        <p className="text-sm">{msg.message}</p>
                                        <p className={`text-xs mt-1 ${msg.senderType === 'agent' ? 'text-white/70' : 'text-gray-500'}`}>
                                            {formatTime(msg.timestamp)}
                                        </p>
                                    </div>
                                </div>
                            ))}
                        </div>

                        {/* Input */}
                        <div className="p-4 bg-white border-t border-gray-200">
                            <div className="flex space-x-2 rtl:space-x-reverse">
                                <input
                                    type="text"
                                    value={inputMessage}
                                    onChange={(e) => handleInputChange(e.target.value)}
                                    onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
                                    placeholder="اكتب رسالتك..."
                                    className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-orange"
                                />
                                <button
                                    onClick={handleSendMessage}
                                    disabled={!inputMessage.trim()}
                                    className="bg-brand-orange hover:bg-orange-600 disabled:bg-gray-300 text-white px-6 py-2 rounded-lg transition-colors"
                                >
                                    إرسال
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
