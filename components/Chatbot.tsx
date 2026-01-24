import React, { useState, useEffect, useRef, useCallback } from 'react';
import { MessageCircle, X, Send, Minimize2, Headset, Smile, Loader2, RefreshCw, Wifi, WifiOff, Clock, CheckCheck, Check, Phone, ShoppingBag, HelpCircle, MapPin, Tag } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { supabaseChatService, ChatMessage } from '../services/supabaseChatService';
import { useAuth } from '../context/AuthContext';

// Quick response suggestions
const QUICK_RESPONSES = [
    { id: 1, text: 'استفسار عن طلب', icon: ShoppingBag },
    { id: 2, text: 'مشكلة في التوصيل', icon: MapPin },
    { id: 3, text: 'استفسار عن عروض', icon: Tag },
    { id: 4, text: 'تواصل مع خدمة العملاء', icon: Phone },
];

// Bot auto-responses based on keywords
const BOT_RESPONSES: { keywords: string[]; response: string }[] = [
    { 
        keywords: ['طلب', 'order', 'اوردر', 'طلبي', 'طلبات'],
        response: 'لمتابعة طلبك، يمكنك الدخول على "طلباتي" من حسابك الشخصي أو إرسال رقم الطلب وسنساعدك فوراً! 📦'
    },
    {
        keywords: ['توصيل', 'delivery', 'شحن', 'متى يوصل', 'وصول'],
        response: 'التوصيل متاح يومياً من 8 صباحاً حتى 11 مساءً. عادة الطلبات توصل خلال 30-60 دقيقة من التأكيد! 🚚'
    },
    {
        keywords: ['عرض', 'خصم', 'كوبون', 'تخفيض', 'offer', 'discount'],
        response: 'تابعنا على صفحة "العروض الساخنة" للاطلاع على أحدث العروض! وممكن تستخدم كوبون ALLOSH10 للحصول على خصم 10%! 🔥'
    },
    {
        keywords: ['فرع', 'عنوان', 'فين', 'location', 'branch', 'موقع'],
        response: 'لدينا فروع متعددة! يمكنك اختيار أقرب فرع ليك من صفحة "الفروع" أو من خلال تحديد موقعك. 📍'
    },
    {
        keywords: ['مرتجع', 'استرجاع', 'return', 'رجع', 'استبدال'],
        response: 'سياسة الاسترجاع: يمكنك استرجاع أي منتج خلال 24 ساعة من الاستلام بشرط أن يكون بحالته الأصلية. تواصل معنا لترتيب الاستلام! 🔄'
    },
    {
        keywords: ['شكرا', 'شكراً', 'thanks', 'thank'],
        response: 'العفو يا فندم! سعيدين بخدمتك دايماً! هل في حاجة تانية نقدر نساعدك فيها؟ 😊'
    },
    {
        keywords: ['سعر', 'price', 'كام', 'بكام', 'تكلفة'],
        response: 'يمكنك الاطلاع على أسعار جميع المنتجات على الموقع. لو عايز تسأل عن منتج معين، اكتب اسمه وهنبحثلك! 💰'
    },
    {
        keywords: ['دفع', 'فيزا', 'كاش', 'payment', 'فودافون كاش'],
        response: 'نقبل الدفع: كاش عند الاستلام ✅ فيزا/ماستركارد ✅ فودافون كاش ✅ اختار الطريقة المناسبة ليك! 💳'
    }
];

export default function Chatbot() {
    const { user } = useAuth();
    const [isOpen, setIsOpen] = useState(false);
    const [messages, setMessages] = useState<{id: number, text: string, isBot: boolean, timestamp: string, status: 'sending' | 'sent' | 'delivered'}[]>([]);
    const [input, setInput] = useState("");
    const [isLoading, setIsLoading] = useState(false);
    const [isTyping, setIsTyping] = useState(false);
    const [conversationId, setConversationId] = useState<number | null>(null);
    const [isConnected, setIsConnected] = useState(true);
    const [showQuickResponses, setShowQuickResponses] = useState(true);
    const [unreadCount, setUnreadCount] = useState(0);
    const messagesEndRef = useRef<null | HTMLDivElement>(null);

    const scrollToBottom = useCallback(() => {
        setTimeout(() => {
            messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
        }, 100);
    }, []);

    useEffect(() => {
        scrollToBottom();
    }, [messages, isOpen, scrollToBottom]);

    // Initialize conversation when chat opens
    useEffect(() => {
        if (isOpen && !conversationId) {
            initializeConversation();
        }
    }, [isOpen]);

    // Subscribe to new messages
    useEffect(() => {
        if (conversationId) {
            const subscription = supabaseChatService.subscribeToMessages(conversationId, user?.id ?? null, (newMessage) => {
                if (newMessage.sender_type !== 'customer') {
                    setMessages(prev => {
                        // Check if message already exists
                        if (prev.some(m => m.id === newMessage.id)) {
                            return prev;
                        }
                        return [...prev, {
                            id: newMessage.id,
                            text: newMessage.message,
                            isBot: true,
                            timestamp: newMessage.timestamp,
                            status: 'delivered' as const
                        }];
                    });
                    
                    if (!isOpen) {
                        setUnreadCount(prev => prev + 1);
                    }
                }
            });

            return () => {
                supabaseChatService.unsubscribeFromMessages();
            };
        }
    }, [conversationId, isOpen]);

    const initializeConversation = async () => {
        setIsLoading(true);
        try {
            const customerName = user?.name || 'زائر';
            const conversation = await supabaseChatService.getOrCreateConversation(
                user?.id || null,
                customerName
            );

            if (conversation) {
                setConversationId(conversation.id);
                setIsConnected(true);

                // Load existing messages
                const existingMessages = await supabaseChatService.getMessages(conversation.id);
                setMessages(existingMessages.map(msg => ({
                    id: msg.id,
                    text: msg.message,
                    isBot: msg.sender_type !== 'customer',
                    timestamp: msg.timestamp,
                    status: 'delivered' as const
                })));
            } else {
                // Fallback to local mode
                setIsConnected(false);
                setMessages([{
                    id: 1,
                    text: "أهلاً بك في خدمة عملاء علوش ماركت! 🍊\nازاي نقدر نساعدك النهاردة؟",
                    isBot: true,
                    timestamp: new Date().toISOString(),
                    status: 'delivered'
                }]);
            }
        } catch (error) {
            console.error('Error initializing conversation:', error);
            setIsConnected(false);
            setMessages([{
                id: 1,
                text: "أهلاً بك في خدمة عملاء علوش ماركت! 🍊\nازاي نقدر نساعدك النهاردة؟\n\n⚠️ الاتصال غير متاح حالياً، لكن يمكننا مساعدتك بالردود التلقائية.",
                isBot: true,
                timestamp: new Date().toISOString(),
                status: 'delivered'
            }]);
        } finally {
            setIsLoading(false);
        }
    };

    const getBotResponse = (userMessage: string): string | null => {
        const lowerMessage = userMessage.toLowerCase();
        for (const response of BOT_RESPONSES) {
            if (response.keywords.some(keyword => lowerMessage.includes(keyword))) {
                return response.response;
            }
        }
        return null;
    };

    const handleSend = async (quickText?: string) => {
        const messageText = quickText || input.trim();
        if (!messageText) return;

        // Clear input only if not from quick response
        if (!quickText) {
            setInput("");
        }
        setShowQuickResponses(false);

        // Add user message immediately
        const tempId = Date.now();
        const userMessage = {
            id: tempId,
            text: messageText,
            isBot: false,
            timestamp: new Date().toISOString(),
            status: 'sending' as const
        };
        setMessages(prev => [...prev, userMessage]);

        try {
            if (conversationId && isConnected) {
                // Send to Supabase
                const sentMessage = await supabaseChatService.sendMessage(
                    conversationId,
                    user?.id || null,
                    'customer',
                    messageText
                );

                if (sentMessage) {
                    // Update message status
                    setMessages(prev => prev.map(m => 
                        m.id === tempId 
                            ? { ...m, id: sentMessage.id, status: 'sent' as const }
                            : m
                    ));
                }
            } else {
                // Update to sent status for offline mode
                setMessages(prev => prev.map(m => 
                    m.id === tempId ? { ...m, status: 'sent' as const } : m
                ));
            }

            // Show typing indicator
            setIsTyping(true);

            // Check for bot response
            setTimeout(async () => {
                setIsTyping(false);
                
                const botResponse = getBotResponse(messageText);
                if (botResponse) {
                    if (conversationId && isConnected) {
                        await supabaseChatService.sendMessage(
                            conversationId,
                            null,
                            'bot',
                            botResponse
                        );
                    } else {
                        setMessages(prev => [...prev, {
                            id: Date.now(),
                            text: botResponse,
                            isBot: true,
                            timestamp: new Date().toISOString(),
                            status: 'delivered'
                        }]);
                    }
                } else {
                    // Default response
                    const defaultResponse = "تم استلام رسالتك وسيتم الرد عليك في أقرب وقت ممكن. شكراً لتواصلك معنا! 🙏";
                    if (conversationId && isConnected) {
                        await supabaseChatService.sendMessage(
                            conversationId,
                            null,
                            'bot',
                            defaultResponse
                        );
                    } else {
                        setMessages(prev => [...prev, {
                            id: Date.now(),
                            text: defaultResponse,
                            isBot: true,
                            timestamp: new Date().toISOString(),
                            status: 'delivered'
                        }]);
                    }
                }
            }, 1500);

        } catch (error) {
            console.error('Error sending message:', error);
            setMessages(prev => prev.map(m => 
                m.id === tempId ? { ...m, status: 'sent' as const } : m
            ));
        }
    };

    const handleQuickResponse = (text: string) => {
        // إرسال مباشر بدلاً من ملء حقل الإدخال
        if (!text.trim() || isLoading) return;
        
        setShowQuickResponses(false);
        setInput(''); // مسح أي نص موجود
        
        // إرسال الرسالة مباشرة
        handleSend(text);
    };

    const formatTime = (timestamp: string) => {
        return new Date(timestamp).toLocaleTimeString('ar-EG', { 
            hour: '2-digit', 
            minute: '2-digit' 
        });
    };

    const handleOpen = () => {
        setIsOpen(true);
        setUnreadCount(0);
    };

    return (
        <>
            <AnimatePresence>
                {isOpen && (
                    <motion.div
                        initial={{ opacity: 0, y: 20, scale: 0.95 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, y: 20, scale: 0.95 }}
                        transition={{ type: "spring", damping: 25, stiffness: 300 }}
                        className="fixed bottom-24 right-4 left-4 md:left-auto md:right-6 z-[100] md:w-[400px] bg-white rounded-3xl shadow-2xl border border-orange-100 overflow-hidden font-body flex flex-col max-h-[80vh] md:max-h-[600px]"
                    >
                        {/* Header - Gradient with brand colors */}
                        <div className="bg-gradient-to-l from-[#FF6B35] via-[#FF8C42] to-[#F97316] p-4 flex justify-between items-center text-white shadow-lg relative overflow-hidden">
                            {/* Decorative circles */}
                            <div className="absolute -top-4 -right-4 w-24 h-24 bg-white/10 rounded-full blur-xl" />
                            <div className="absolute -bottom-8 -left-8 w-32 h-32 bg-white/5 rounded-full blur-2xl" />
                            
                            <div className="flex items-center gap-3 relative z-10">
                                <div className="w-12 h-12 bg-white/20 backdrop-blur-sm rounded-2xl flex items-center justify-center border border-white/30 shadow-lg relative">
                                    <span className="text-2xl">🍊</span>
                                    <span className="absolute -bottom-1 -right-1 w-4 h-4 bg-green-400 border-2 border-white rounded-full shadow-sm" />
                                </div>
                                <div>
                                    <h3 className="font-bold text-lg">علوش ماركت</h3>
                                    <div className="flex items-center gap-1.5 text-xs text-white/90">
                                        {isConnected ? (
                                            <>
                                                <Wifi size={12} />
                                                <span>متصل الآن</span>
                                            </>
                                        ) : (
                                            <>
                                                <WifiOff size={12} />
                                                <span>وضع عدم الاتصال</span>
                                            </>
                                        )}
                                    </div>
                                </div>
                            </div>
                            
                            <div className="flex items-center gap-2 relative z-10">
                                <button 
                                    onClick={() => initializeConversation()}
                                    className="p-2 hover:bg-white/20 rounded-xl transition-all"
                                    title="تحديث"
                                >
                                    <RefreshCw size={18} />
                                </button>
                                <button 
                                    onClick={() => setIsOpen(false)} 
                                    className="p-2 hover:bg-white/20 rounded-xl transition-all"
                                >
                                    <Minimize2 size={18} />
                                </button>
                            </div>
                        </div>

                        {/* Chat Area */}
                        <div className="flex-1 bg-gradient-to-b from-orange-50/50 to-white p-4 overflow-y-auto min-h-[250px] relative">
                            {isLoading ? (
                                <div className="flex flex-col items-center justify-center h-full gap-3">
                                    <Loader2 className="w-8 h-8 text-orange-500 animate-spin" />
                                    <span className="text-sm text-gray-500">جاري تحميل المحادثة...</span>
                                </div>
                            ) : (
                                <div className="flex flex-col gap-4">
                                    {/* Date separator */}
                                    <div className="flex items-center justify-center">
                                        <div className="bg-white/80 backdrop-blur-sm px-4 py-1.5 rounded-full shadow-sm border border-orange-100">
                                            <span className="text-xs text-gray-500 flex items-center gap-1.5">
                                                <Clock size={12} />
                                                اليوم
                                            </span>
                                        </div>
                                    </div>
                                    
                                    {messages.map((msg, index) => (
                                        <motion.div 
                                            key={msg.id}
                                            initial={{ opacity: 0, y: 10, scale: 0.95 }}
                                            animate={{ opacity: 1, y: 0, scale: 1 }}
                                            transition={{ delay: index * 0.05 }}
                                            className={`flex items-end gap-2 ${msg.isBot ? 'justify-start' : 'justify-end'}`}
                                        >
                                            {msg.isBot && (
                                                <div className="w-8 h-8 bg-gradient-to-br from-orange-400 to-orange-600 rounded-xl flex items-center justify-center text-white text-sm font-bold shrink-0 shadow-md">
                                                    🍊
                                                </div>
                                            )}
                                            <div className={`
                                                relative max-w-[80%]
                                            `}>
                                                <div className={`
                                                    p-3 px-4 rounded-2xl text-sm leading-relaxed shadow-sm
                                                    ${msg.isBot 
                                                        ? 'bg-white border border-orange-100 text-gray-800 rounded-tl-md' 
                                                        : 'bg-gradient-to-l from-orange-500 to-orange-600 text-white rounded-tr-md'
                                                    }
                                                `}>
                                                    <p className="whitespace-pre-wrap">{msg.text}</p>
                                                </div>
                                                <div className={`flex items-center gap-1 mt-1 text-[10px] ${msg.isBot ? 'text-gray-400' : 'text-gray-400 justify-end'}`}>
                                                    <span>{formatTime(msg.timestamp)}</span>
                                                    {!msg.isBot && (
                                                        msg.status === 'sending' ? (
                                                            <Clock size={10} />
                                                        ) : msg.status === 'sent' ? (
                                                            <Check size={10} />
                                                        ) : (
                                                            <CheckCheck size={10} className="text-blue-500" />
                                                        )
                                                    )}
                                                </div>
                                            </div>
                                        </motion.div>
                                    ))}
                                    
                                    {/* Typing Indicator */}
                                    {isTyping && (
                                        <motion.div
                                            initial={{ opacity: 0, y: 10 }}
                                            animate={{ opacity: 1, y: 0 }}
                                            className="flex items-end gap-2"
                                        >
                                            <div className="w-8 h-8 bg-gradient-to-br from-orange-400 to-orange-600 rounded-xl flex items-center justify-center text-white text-sm font-bold shrink-0 shadow-md">
                                                🍊
                                            </div>
                                            <div className="bg-white border border-orange-100 rounded-2xl rounded-tl-md p-3 px-4 shadow-sm">
                                                <div className="flex items-center gap-1">
                                                    <div className="w-2 h-2 bg-orange-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                                                    <div className="w-2 h-2 bg-orange-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                                                    <div className="w-2 h-2 bg-orange-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
                                                </div>
                                            </div>
                                        </motion.div>
                                    )}
                                    
                                    <div ref={messagesEndRef} />
                                </div>
                            )}
                        </div>

                        {/* Quick Responses */}
                        {showQuickResponses && messages.length <= 2 && (
                            <div className="px-4 py-2 bg-orange-50/50 border-t border-orange-100">
                                <p className="text-xs text-gray-500 mb-2">اختر للرد السريع:</p>
                                <div className="flex flex-wrap gap-2">
                                    {QUICK_RESPONSES.map((response) => (
                                        <button
                                            key={response.id}
                                            onClick={() => handleQuickResponse(response.text)}
                                            className="flex items-center gap-1.5 px-3 py-1.5 bg-white border border-orange-200 rounded-full text-xs text-gray-700 hover:bg-orange-100 hover:border-orange-300 transition-all shadow-sm"
                                        >
                                            <response.icon size={12} className="text-orange-500" />
                                            {response.text}
                                        </button>
                                    ))}
                                </div>
                            </div>
                        )}

                        {/* Input Area */}
                        <div className="p-3 bg-white border-t border-orange-100 shadow-[0_-4px_20px_rgba(0,0,0,0.03)]">
                            <div className="flex gap-2 items-center">
                                <input 
                                    type="text" 
                                    placeholder="اكتب رسالتك هنا..."
                                    value={input}
                                    onChange={(e) => setInput(e.target.value)}
                                    onKeyDown={(e) => e.key === 'Enter' && !e.shiftKey && handleSend()}
                                    onFocus={() => setShowQuickResponses(false)}
                                    className="flex-1 bg-orange-50 border border-orange-100 rounded-2xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-orange-200 focus:border-orange-300 text-gray-800 placeholder:text-gray-400 transition-all"
                                    disabled={isLoading}
                                />
                                <button 
                                    onClick={handleSend}
                                    disabled={!input.trim() || isLoading}
                                    className="bg-gradient-to-l from-orange-500 to-orange-600 text-white p-3 rounded-2xl hover:from-orange-600 hover:to-orange-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-lg shadow-orange-200 transform active:scale-95"
                                >
                                    <Send size={20} />
                                </button>
                            </div>
                            <div className="flex items-center justify-center mt-2">
                                <span className="text-[10px] text-gray-400">مدعوم من علوش ماركت 🍊</span>
                            </div>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Floating Toggle Button */}
            <motion.button
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => isOpen ? setIsOpen(false) : handleOpen()}
                className="fixed bottom-20 md:bottom-6 right-4 md:right-6 z-[90] w-14 h-14 md:w-16 md:h-16 bg-gradient-to-br from-orange-500 via-orange-600 to-red-500 text-white rounded-2xl shadow-xl shadow-orange-500/40 flex items-center justify-center hover:shadow-orange-500/60 transition-all border-2 border-white/20"
            >
                <AnimatePresence mode='wait'>
                    {isOpen ? (
                        <motion.div 
                            key="close" 
                            initial={{ rotate: -90, opacity: 0 }} 
                            animate={{ rotate: 0, opacity: 1 }} 
                            exit={{ rotate: 90, opacity: 0 }}
                        >
                            <X size={28} />
                        </motion.div>
                    ) : (
                        <motion.div 
                            key="chat" 
                            initial={{ scale: 0, opacity: 0 }} 
                            animate={{ scale: 1, opacity: 1 }} 
                            exit={{ scale: 0, opacity: 0 }} 
                            className="relative"
                        >
                            <MessageCircle size={28} />
                            {unreadCount > 0 && (
                                <span className="absolute -top-2 -right-2 w-5 h-5 bg-red-500 text-white text-[10px] font-bold rounded-full flex items-center justify-center border-2 border-white animate-pulse">
                                    {unreadCount > 9 ? '9+' : unreadCount}
                                </span>
                            )}
                            <span className="absolute -bottom-0.5 -right-0.5 w-3 h-3 bg-green-500 rounded-full border-2 border-white" />
                        </motion.div>
                    )}
                </AnimatePresence>
            </motion.button>
        </>
    );
}
