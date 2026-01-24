import React, { useState, useEffect, useRef } from 'react';
import { Send, ArrowLeft, Phone, Clock, MessageCircle, CheckCheck, Check, Loader2 } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { supabaseChatService, ChatConversation } from '../services/supabaseChatService';
import { socketService } from '../services/socketService';
import { api } from '../services/api';
import { useAuth } from '../context/AuthContext';

// Quick response options
const QUICK_RESPONSES = [
  { id: 1, text: 'استفسار عن طلب', icon: '📦' },
  { id: 2, text: 'مشكلة في التوصيل', icon: '🚚' },
  { id: 3, text: 'العروض والخصومات', icon: '🎉' },
  { id: 4, text: 'التحدث مع خدمة العملاء', icon: '👤' },
  { id: 5, text: 'مساعدة عامة', icon: '❓' },
];

// Bot auto-responses
const BOT_RESPONSES: { keywords: string[]; response: string }[] = [
  {
    keywords: ['طلب', 'طلبي', 'اوردر', 'order'],
    response: 'يمكنك تتبع طلبك من خلال صفحة "طلباتي" في حسابك. إذا كان لديك رقم الطلب، يمكنك إدخاله هنا وسنساعدك في متابعته. 📦'
  },
  {
    keywords: ['توصيل', 'شحن', 'delivery', 'shipping'],
    response: 'نحن نوفر خدمة التوصيل السريع خلال 24-48 ساعة. التوصيل مجاني للطلبات فوق 200 جنيه! 🚚'
  },
  {
    keywords: ['عرض', 'عروض', 'خصم', 'كوبون', 'offer', 'discount'],
    response: 'لدينا عروض رائعة! تابعنا على وسائل التواصل الاجتماعي للحصول على أحدث العروض والخصومات. استخدم كود WELCOME10 للحصول على خصم 10% على طلبك الأول! 🎉'
  },
  {
    keywords: ['سعر', 'اسعار', 'كام', 'price'],
    response: 'أسعارنا تنافسية جداً! يمكنك تصفح المنتجات ومقارنة الأسعار. نضمن لك أفضل قيمة مقابل المال. 💰'
  },
  {
    keywords: ['مرتجع', 'استرجاع', 'استبدال', 'return', 'exchange'],
    response: 'نوفر سياسة إرجاع مرنة خلال 14 يوم من تاريخ الاستلام. يجب أن يكون المنتج في حالته الأصلية. 🔄'
  },
  {
    keywords: ['دفع', 'فيزا', 'كاش', 'payment', 'visa'],
    response: 'نقبل الدفع عند الاستلام، البطاقات الائتمانية (فيزا/ماستركارد)، والمحافظ الإلكترونية. 💳'
  },
  {
    keywords: ['شكر', 'شكرا', 'thanks', 'thank'],
    response: 'شكراً لتواصلك معنا! نحن دائماً هنا لخدمتك. إذا كان لديك أي استفسار آخر، لا تتردد في السؤال! 😊'
  },
  {
    keywords: ['مساعدة', 'help', 'مشكلة', 'problem'],
    response: 'أنا هنا لمساعدتك! يرجى وصف المشكلة أو الاستفسار بالتفصيل وسأحاول مساعدتك أو توجيهك لأحد ممثلي خدمة العملاء. 🙋‍♂️'
  }
];

// Get bot response based on message content
const getBotResponse = (message: string): string | null => {
  const lowerMessage = message.toLowerCase();
  for (const item of BOT_RESPONSES) {
    if (item.keywords.some(keyword => lowerMessage.includes(keyword))) {
      return item.response;
    }
  }
  return null;
};

const toNumericId = (value: unknown): number | null => {
  if (typeof value === 'number' && Number.isFinite(value)) return value;
  if (typeof value === 'string' && value.trim() !== '') {
    const parsed = Number(value);
    if (Number.isFinite(parsed)) return parsed;
  }
  return null;
};

interface DisplayMessage {
  id: string;
  content: string;
  sender: 'user' | 'agent' | 'bot';
  timestamp: Date;
  status?: 'sending' | 'sent' | 'delivered';
}

const CustomerChatPage: React.FC = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [messages, setMessages] = useState<DisplayMessage[]>([]);
  const [inputMessage, setInputMessage] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [isConnected, setIsConnected] = useState(false);
  const [conversation, setConversation] = useState<ChatConversation | null>(null);
  const [useSupabase, setUseSupabase] = useState(true);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const messagesRef = useRef<DisplayMessage[]>([]);
  const isSendingQuickRef = useRef(false);
  const lastQuickResponseRef = useRef<{ text: string; sentAt: number } | null>(null);
  const lastOutgoingRef = useRef<{ sender: DisplayMessage['sender']; content: string; sentAt: number } | null>(null);
  const pendingMessagesRef = useRef<Array<{ tempId: string; sender: DisplayMessage['sender']; content: string; createdAt: number }>>([]);
  const handleBack = () => {
    if (typeof window !== 'undefined' && window.history.length > 1) {
      navigate(-1);
    } else {
      navigate('/more');
    }
  };

  const normalizeContent = (content: string) => content.trim().replace(/\s+/g, ' ').toLowerCase();

  const isRecentOutgoingDuplicate = (sender: DisplayMessage['sender'], content: string, windowMs = 1500) => {
    const last = lastOutgoingRef.current;
    if (!last) return false;
    return (
      last.sender === sender &&
      last.content === normalizeContent(content) &&
      Date.now() - last.sentAt < windowMs
    );
  };

  const recordOutgoing = (sender: DisplayMessage['sender'], content: string) => {
    lastOutgoingRef.current = {
      sender,
      content: normalizeContent(content),
      sentAt: Date.now()
    };
  };

  const registerPendingMessage = (tempId: string, sender: DisplayMessage['sender'], content: string) => {
    pendingMessagesRef.current.push({
      tempId,
      sender,
      content: normalizeContent(content),
      createdAt: Date.now()
    });
  };

  const isRecentLocalDuplicate = (sender: DisplayMessage['sender'], content: string, windowMs = 5000) => {
    const normalized = normalizeContent(content);
    const lastMessage = messagesRef.current[messagesRef.current.length - 1];
    if (!lastMessage) return false;
    return (
      lastMessage.sender === sender &&
      normalizeContent(lastMessage.content) === normalized &&
      Date.now() - lastMessage.timestamp.getTime() < windowMs
    );
  };

  const resolvePendingMessage = (incoming: DisplayMessage) => {
    const incomingContent = normalizeContent(incoming.content);
    const index = (() => {
      for (let i = pendingMessagesRef.current.length - 1; i >= 0; i -= 1) {
        const pending = pendingMessagesRef.current[i];
        if (pending.sender === incoming.sender && pending.content === incomingContent) {
          return i;
        }
      }
      return -1;
    })();

    if (index === -1) return null;

    const [{ tempId }] = pendingMessagesRef.current.splice(index, 1);
    return tempId;
  };

  const isDuplicateMessage = (incoming: DisplayMessage, existing: DisplayMessage[]) => {
    const incomingTime = incoming.timestamp.getTime();
    const incomingContent = normalizeContent(incoming.content);
    const lastMessage = existing[existing.length - 1];
    if (
      lastMessage &&
      lastMessage.sender === incoming.sender &&
      normalizeContent(lastMessage.content) === incomingContent
    ) {
      return true;
    }
    return existing.some((message) => {
      return (
        message.sender === incoming.sender &&
        normalizeContent(message.content) === incomingContent &&
        Math.abs(message.timestamp.getTime() - incomingTime) < 8000
      );
    });
  };

  // Initialize chat
  useEffect(() => {
    const initChat = async () => {
      try {
        // Get or create conversation
        const customerId = toNumericId(user?.id);
        const customerName = user?.name || (user as { full_name?: string })?.full_name || 'زائر';
        let supabaseEnabled = true;
        let conv = await supabaseChatService.getOrCreateConversation(customerId, customerName);
        if (!conv) {
          supabaseEnabled = false;
          const response = await api.chat.createConversation(customerId, customerName);
          if (response?.conversationId) {
            const now = new Date().toISOString();
            conv = {
              id: response.conversationId,
              customer_id: customerId,
              customer_name: customerName,
              agent_id: null,
              status: 'active',
              created_at: now,
              last_message_at: now
            };
          }
        }
        setUseSupabase(supabaseEnabled);
        setConversation(conv);
        setIsConnected(Boolean(conv));

        // Load existing messages
        if (conv) {
          socketService.connect();
          socketService.joinAsCustomer(conv.id, customerName);

          if (supabaseEnabled) {
            const existingMessages = await supabaseChatService.getMessages(conv.id);
            const displayMessages: DisplayMessage[] = existingMessages.map(msg => ({
              id: String(msg.id),
              content: msg.message,
              sender: msg.sender_type === 'customer' ? 'user' : msg.sender_type as 'agent' | 'bot',
              timestamp: new Date(msg.timestamp),
              status: 'delivered' as const
            }));
            setMessages(displayMessages);

            // Subscribe to new messages
            supabaseChatService.subscribeToMessages(conv.id, customerId, (newMessage) => {
              const displayMsg: DisplayMessage = {
                id: String(newMessage.id),
                content: newMessage.message,
                sender: newMessage.sender_type === 'customer' ? 'user' : newMessage.sender_type as 'agent' | 'bot',
                timestamp: new Date(newMessage.timestamp),
                status: 'delivered'
              };
              const pendingMatchId = resolvePendingMessage(displayMsg);
              setMessages(prev => {
                // Avoid duplicates
                if (prev.find(m => m.id === displayMsg.id)) return prev;
                if (isDuplicateMessage(displayMsg, prev)) return prev;
                if (pendingMatchId) {
                  let replaced = false;
                  const updated = prev.map(msg => {
                    if (msg.id !== pendingMatchId) return msg;
                    replaced = true;
                    return { ...displayMsg, status: displayMsg.status };
                  });
                  return replaced ? updated : [...prev, displayMsg];
                }
                return [...prev, displayMsg];
              });
            });
          } else {
            const response = await api.chat.getConversation(conv.id);
            const existingMessages = Array.isArray(response?.messages) ? response.messages : [];
            const displayMessages: DisplayMessage[] = existingMessages.map((msg: any) => ({
              id: String(msg.id),
              content: msg.message,
              sender: msg.senderType === 'customer' ? 'user' : msg.senderType as 'agent' | 'bot',
              timestamp: new Date(msg.timestamp),
              status: 'delivered' as const
            }));
            setMessages(displayMessages);
          }
        }
      } catch (error) {
        console.error('Error initializing chat:', error);
        setIsConnected(false);
        // Add welcome message even if connection fails
        setMessages([{
          id: 'welcome',
          content: 'مرحباً بك في خدمة العملاء! 👋 كيف يمكنني مساعدتك اليوم؟',
          sender: 'bot',
          timestamp: new Date(),
          status: 'delivered'
        }]);
      }
    };

    initChat();

    return () => {
      supabaseChatService.unsubscribeFromMessages();
    };
  }, [user]);

  useEffect(() => {
    if (!conversation || useSupabase) return;
    socketService.connect();
    const handleSocketMessage = (message: { conversationId: number; senderType: string; message: string; timestamp: string; id: number }) => {
      if (message.conversationId !== conversation.id) return;
      const displayMsg: DisplayMessage = {
        id: String(message.id),
        content: message.message,
        sender: message.senderType === 'customer' ? 'user' : message.senderType as 'agent' | 'bot',
        timestamp: new Date(message.timestamp),
        status: 'delivered'
      };
      const pendingMatchId = resolvePendingMessage(displayMsg);
      setMessages(prev => {
        if (prev.find(m => m.id === displayMsg.id)) return prev;
        if (isDuplicateMessage(displayMsg, prev)) return prev;
        if (pendingMatchId) {
          let replaced = false;
          const updated = prev.map(msg => {
            if (msg.id !== pendingMatchId) return msg;
            replaced = true;
            return { ...displayMsg, status: displayMsg.status };
          });
          return replaced ? updated : [...prev, displayMsg];
        }
        return [...prev, displayMsg];
      });
    };

    socketService.on('message:new', handleSocketMessage);
    return () => {
      socketService.off('message:new', handleSocketMessage);
    };
  }, [conversation, useSupabase]);

  // Auto scroll to bottom
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  useEffect(() => {
    messagesRef.current = messages;
  }, [messages]);

  // Send message
  const sendMessage = async (content: string, blockIfSending = false) => {
    if (!content.trim()) return;
    if (blockIfSending && isSendingQuickRef.current) return;
    if (isRecentOutgoingDuplicate('user', content, 2000)) return;
    if (isRecentLocalDuplicate('user', content, 5000)) return;
    if (blockIfSending) isSendingQuickRef.current = true;
    recordOutgoing('user', content);

    const tempId = `temp_${Date.now()}`;
    const newMessage: DisplayMessage = {
      id: tempId,
      content: content.trim(),
      sender: 'user',
      timestamp: new Date(),
      status: 'sending'
    };

    setMessages(prev => [...prev, newMessage]);
    setInputMessage('');
    if (conversation) {
      registerPendingMessage(tempId, 'user', content);
    }

    try {
      if (conversation) {
        const senderId = toNumericId(user?.id);
        const canUseSocket = socketService.isConnected() && !socketService.isDisabled();
        if (canUseSocket) {
          socketService.sendMessage(conversation.id, senderId, 'customer', content.trim());
          setMessages(prev => prev.map(msg =>
            msg.id === tempId ? { ...msg, status: 'sent' as const } : msg
          ));
        } else if (useSupabase) {
          const sentMessage = await supabaseChatService.sendMessage(
            conversation.id,
            senderId,
            'customer',
            content.trim()
          );
          
          // Update message status
          if (sentMessage) {
            setMessages(prev => prev.map(msg => 
              msg.id === tempId 
                ? { ...msg, id: String(sentMessage.id), status: 'sent' as const }
                : msg
            ));
          }
        } else {
          const response = await api.chat.sendMessage(
            conversation.id,
            senderId,
            'customer',
            content.trim()
          );
          setMessages(prev => prev.map(msg =>
            msg.id === tempId
              ? { ...msg, id: response?.messageId ? String(response.messageId) : msg.id, status: 'sent' as const }
              : msg
          ));
        }
      } else {
        setMessages(prev => prev.map(msg => 
          msg.id === tempId 
            ? { ...msg, status: 'sent' as const }
            : msg
        ));
      }

      // Show typing indicator
      setIsTyping(true);

      // Get bot response
      setTimeout(async () => {
        setIsTyping(false);
        const botResponse = getBotResponse(content);
        
        if (botResponse) {
          const botTempId = `bot_${Date.now()}`;
          if (isRecentOutgoingDuplicate('bot', botResponse, 3000)) return;
          recordOutgoing('bot', botResponse);
          const botMessage: DisplayMessage = {
            id: botTempId,
            content: botResponse,
            sender: 'bot',
            timestamp: new Date(),
            status: 'delivered'
          };

          setMessages(prev => [...prev, botMessage]);

          // Save bot message to Supabase
          if (conversation) {
            registerPendingMessage(botTempId, 'bot', botResponse);
            if (useSupabase) {
              const sentBotMessage = await supabaseChatService.sendMessage(
                conversation.id,
                null,
                'bot',
                botResponse
              );
              if (sentBotMessage) {
                setMessages(prev => prev.map(msg =>
                  msg.id === botTempId ? { ...msg, id: String(sentBotMessage.id) } : msg
                ));
              }
            } else {
              const response = await api.chat.sendMessage(
                conversation.id,
                null,
                'bot',
                botResponse
              );
              if (response?.messageId) {
                setMessages(prev => prev.map(msg =>
                  msg.id === botTempId ? { ...msg, id: String(response.messageId) } : msg
                ));
              }
            }
          }
        } else {
          // Default response if no keyword match
          const defaultText = 'شكراً لرسالتك! سيتواصل معك أحد ممثلي خدمة العملاء قريباً. في الأثناء، هل يمكنني مساعدتك بأي شيء آخر؟';
          const botTempId = `bot_${Date.now()}`;
          if (isRecentOutgoingDuplicate('bot', defaultText, 3000)) return;
          recordOutgoing('bot', defaultText);
          const defaultResponse: DisplayMessage = {
            id: botTempId,
            content: defaultText,
            sender: 'bot',
            timestamp: new Date(),
            status: 'delivered'
          };

          setMessages(prev => [...prev, defaultResponse]);

          if (conversation) {
            registerPendingMessage(botTempId, 'bot', defaultText);
            if (useSupabase) {
              const sentBotMessage = await supabaseChatService.sendMessage(
                conversation.id,
                null,
                'bot',
                defaultText
              );
              if (sentBotMessage) {
                setMessages(prev => prev.map(msg =>
                  msg.id === botTempId ? { ...msg, id: String(sentBotMessage.id) } : msg
                ));
              }
            } else {
              const response = await api.chat.sendMessage(
                conversation.id,
                null,
                'bot',
                defaultText
              );
              if (response?.messageId) {
                setMessages(prev => prev.map(msg =>
                  msg.id === botTempId ? { ...msg, id: String(response.messageId) } : msg
                ));
              }
            }
          }
        }
      }, 1000 + Math.random() * 1000);

    } catch (error) {
      console.error('Error sending message:', error);
      setMessages(prev => prev.map(msg => 
        msg.id === tempId 
          ? { ...msg, status: 'sent' as const }
          : msg
      ));
    } finally {
      if (blockIfSending) isSendingQuickRef.current = false;
    }
  };

  // Handle form submit
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    sendMessage(inputMessage);
  };

  // Handle quick response click
  const handleQuickResponse = (text: string) => {
    // منع الإرسال المتكرر
    if (isSendingQuickRef.current) {
      console.log('⚠️ Already sending quick response, ignoring...');
      return;
    }
    const now = Date.now();
    if (lastQuickResponseRef.current?.text === text && now - lastQuickResponseRef.current.sentAt < 1200) {
      return;
    }
    lastQuickResponseRef.current = { text, sentAt: now };
    sendMessage(text, true);
  };

  // Format time
  const formatTime = (date: Date) => {
    return date.toLocaleTimeString('ar-EG', { hour: '2-digit', minute: '2-digit' });
  };

  // Get message status icon
  const getStatusIcon = (status?: string) => {
    switch (status) {
      case 'sending':
        return <Loader2 size={12} className="animate-spin text-gray-400" />;
      case 'sent':
        return <Check size={12} className="text-gray-400" />;
      case 'delivered':
        return <CheckCheck size={12} className="text-green-500" />;
      default:
        return null;
    }
  };

  return (
    <div className="min-h-[100dvh] bg-[#F6F7FB] flex flex-col" dir="rtl">
      <header className="sticky top-0 z-20 bg-white/95 backdrop-blur border-b border-gray-200">
        <div className="max-w-3xl mx-auto px-3 py-1.5 sm:py-2.5 flex items-center justify-between" dir="ltr">
          <button
            onClick={handleBack}
            className="w-9 h-9 rounded-xl border border-gray-200 flex items-center justify-center hover:bg-gray-50 transition-colors"
            aria-label="رجوع"
          >
            <ArrowLeft size={16} className="text-gray-700" />
          </button>
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-orange-500 to-orange-600 text-white flex items-center justify-center shadow-sm">
              <MessageCircle size={20} />
            </div>
            <div>
              <p className="text-[11px] text-gray-500">محادثة خدمة العملاء</p>
              <div className="flex items-center gap-2">
                <span
                  className={`w-2 h-2 rounded-full ${
                    isConnected ? 'bg-green-500' : 'bg-yellow-400'
                  } animate-pulse`}
                ></span>
                <span className="text-sm font-semibold text-gray-900">
                  {isConnected ? 'متصل الآن' : 'جاري الاتصال...'}
                </span>
              </div>
            </div>
          </div>
          <a
            href="tel:+201234567890"
            className="flex items-center gap-2 px-3 py-2 rounded-xl border border-gray-200 text-xs text-gray-700 hover:bg-gray-50 transition-colors"
          >
            <Phone size={14} />
            <span className="hidden sm:inline">اتصل بنا</span>
          </a>
        </div>
      </header>

      <main className="flex-1 w-full px-3 sm:px-4 py-1.5 sm:py-3 pb-2 min-h-0">
        <div className="max-w-3xl mx-auto h-full flex flex-col gap-3 min-h-0">
          <div className="bg-white border border-gray-200 rounded-2xl shadow-sm flex-1 flex flex-col overflow-hidden min-h-0">
            <div className="px-3 sm:px-4 pt-2 pb-2 sticky top-0 bg-white/95 backdrop-blur supports-[backdrop-filter]:backdrop-blur-md border-b border-gray-100 z-10">
              <div className="flex items-center justify-between mb-2">
                <p className="text-[13px] sm:text-sm font-semibold text-gray-900">ردود سريعة</p>
                <p className="text-[11px] sm:text-xs text-gray-400">اختصار للردود الشائعة</p>
              </div>
              <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-hide -mx-1 px-1">
                {QUICK_RESPONSES.map((response) => (
                  <button
                    key={response.id}
                    onClick={() => handleQuickResponse(response.text)}
                    className="min-w-fit flex items-center gap-2 px-2.5 py-1 rounded-full border border-gray-200 bg-gray-50 text-[11px] sm:text-sm text-gray-700 whitespace-nowrap hover:border-orange-300 hover:bg-orange-50 transition-all shadow-sm"
                  >
                    <span>{response.icon}</span>
                    <span>{response.text}</span>
                  </button>
                ))}
              </div>
            </div>

            <div className="flex-1 overflow-y-auto px-3 sm:px-4 py-3 space-y-3 bg-gradient-to-b from-white to-gray-50 min-h-0">
              {messages.map((message) => (
                <div
                  key={message.id}
                  className={`flex ${message.sender === 'user' ? 'justify-start' : 'justify-end'}`}
                >
                  <div
                    className={`max-w-[85%] sm:max-w-[70%] rounded-2xl px-3 py-2.5 sm:px-4 sm:py-3 shadow-sm ${
                      message.sender === 'user'
                        ? 'bg-gradient-to-br from-orange-500 to-orange-600 text-white rounded-br-md'
                        : 'bg-white text-gray-800 rounded-bl-md border border-gray-100'
                    }`}
                  >
                    <p className="text-[12.5px] sm:text-base leading-relaxed whitespace-pre-wrap">
                      {message.content}
                    </p>
                    <div
                      className={`flex items-center gap-1 mt-2 text-[10px] sm:text-xs ${
                        message.sender === 'user' ? 'text-white/80' : 'text-gray-500'
                      }`}
                    >
                      <Clock size={10} />
                      <span>{formatTime(message.timestamp)}</span>
                      {message.sender === 'user' && getStatusIcon(message.status)}
                    </div>
                  </div>
                </div>
              ))}

              {isTyping && (
                <div className="flex justify-end">
                  <div className="bg-white text-gray-800 rounded-2xl rounded-bl-md px-4 py-3 shadow-sm border border-gray-100">
                    <div className="flex items-center gap-1">
                      <div className="w-2 h-2 bg-orange-500 rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></div>
                      <div className="w-2 h-2 bg-orange-500 rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></div>
                      <div className="w-2 h-2 bg-orange-500 rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></div>
                    </div>
                  </div>
                </div>
              )}

              <div ref={messagesEndRef} />
            </div>
          </div>

          <div
            className="sticky bottom-0 bg-[#F6F7FB]"
            style={{ paddingBottom: 'calc(env(safe-area-inset-bottom, 0px) + 6px)' }}
          >
            <form
              onSubmit={handleSubmit}
              className="bg-white border border-gray-200 rounded-2xl shadow-md px-3 py-2 flex items-center gap-2"
            >
              <input
                type="text"
                value={inputMessage}
                onChange={(e) => setInputMessage(e.target.value)}
                placeholder="اكتب رسالتك هنا..."
                className="flex-1 bg-gray-50 border border-gray-200 rounded-xl px-3 py-2 sm:px-4 sm:py-3 focus:outline-none focus:ring-2 focus:ring-orange-400 focus:border-transparent text-right text-[13px]"
              />
              <button
                type="submit"
                disabled={!inputMessage.trim()}
                className="bg-gradient-to-r from-orange-500 to-orange-600 text-white px-4 py-2 sm:py-3 rounded-xl hover:shadow-md transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                aria-label="إرسال"
              >
                <Send size={18} />
              </button>
            </form>
            <p className="text-center text-gray-400 text-[11px] mt-2">
              ساعات العمل: السبت - الخميس، 9 صباحاً - 10 مساءً
            </p>
          </div>
        </div>
      </main>
    </div>
  );
};

export default CustomerChatPage;
