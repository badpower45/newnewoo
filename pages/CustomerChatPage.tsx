import React, { useState, useEffect, useRef } from 'react';
import { Send, ArrowLeft, Phone, Clock, MessageCircle, CheckCheck, Check, Loader2 } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { supabaseChatService, ChatConversation } from '../services/supabaseChatService';
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
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const handleBack = () => {
    if (typeof window !== 'undefined' && window.history.length > 1) {
      navigate(-1);
    } else {
      navigate('/more');
    }
  };

  // Initialize chat
  useEffect(() => {
    const initChat = async () => {
      try {
        // Get or create conversation
        const customerId = user?.id ? Number(user.id) : null;
        const customerName = user?.full_name || 'زائر';
        
        const conv = await supabaseChatService.getOrCreateConversation(customerId, customerName);
        setConversation(conv);
        setIsConnected(true);

        // Load existing messages
        if (conv) {
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
          supabaseChatService.subscribeToMessages(conv.id, (newMessage) => {
            const displayMsg: DisplayMessage = {
              id: String(newMessage.id),
              content: newMessage.message,
              sender: newMessage.sender_type === 'customer' ? 'user' : newMessage.sender_type as 'agent' | 'bot',
              timestamp: new Date(newMessage.timestamp),
              status: 'delivered'
            };
            setMessages(prev => {
              // Avoid duplicates
              if (prev.find(m => m.id === displayMsg.id)) return prev;
              return [...prev, displayMsg];
            });
          });
        }
      } catch (error) {
        console.error('Error initializing chat:', error);
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

    // Add initial welcome message
    if (messages.length === 0) {
      setMessages([{
        id: 'welcome',
        content: 'مرحباً بك في خدمة العملاء! 👋 كيف يمكنني مساعدتك اليوم؟',
        sender: 'bot',
        timestamp: new Date(),
        status: 'delivered'
      }]);
    }

    return () => {
      supabaseChatService.unsubscribeFromMessages();
    };
  }, [user]);

  // Auto scroll to bottom
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // Send message
  const sendMessage = async (content: string) => {
    if (!content.trim()) return;

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

    try {
      // Send to Supabase if connected
      if (conversation && isConnected) {
        const sentMessage = await supabaseChatService.sendMessage(
          conversation.id,
          user?.id ? Number(user.id) : null,
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
        // Mark as sent even without connection
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
          const botMessage: DisplayMessage = {
            id: `bot_${Date.now()}`,
            content: botResponse,
            sender: 'bot',
            timestamp: new Date(),
            status: 'delivered'
          };
          
          setMessages(prev => [...prev, botMessage]);

          // Save bot message to Supabase
          if (conversation && isConnected) {
            await supabaseChatService.sendMessage(
              conversation.id,
              null,
              'bot',
              botResponse
            );
          }
        } else {
          // Default response if no keyword match
          const defaultResponse: DisplayMessage = {
            id: `bot_${Date.now()}`,
            content: 'شكراً لرسالتك! سيتواصل معك أحد ممثلي خدمة العملاء قريباً. في الأثناء، هل يمكنني مساعدتك بأي شيء آخر؟',
            sender: 'bot',
            timestamp: new Date(),
            status: 'delivered'
          };
          
          setMessages(prev => [...prev, defaultResponse]);

          if (conversation && isConnected) {
            await supabaseChatService.sendMessage(
              conversation.id,
              null,
              'bot',
              defaultResponse.content
            );
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
    }
  };

  // Handle form submit
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    sendMessage(inputMessage);
  };

  // Handle quick response click
  const handleQuickResponse = (text: string) => {
    sendMessage(text);
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
    <div className="min-h-screen bg-[#F6F7FB] flex flex-col pb-3" dir="rtl">
      <header className="sticky top-0 z-20 bg-white/95 backdrop-blur border-b border-gray-200">
        <div className="max-w-3xl mx-auto px-3 py-2.5 flex items-center justify-between flex-row-reverse">
          <a
            href="tel:+201234567890"
            className="flex items-center gap-2 px-3 py-2 rounded-xl border border-gray-200 text-xs text-gray-700 hover:bg-gray-50 transition-colors"
          >
            <Phone size={14} />
            <span className="hidden sm:inline">اتصل بنا</span>
          </a>
          <div className="flex items-center gap-3">
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
            <button
              onClick={handleBack}
              className="w-9 h-9 rounded-xl border border-gray-200 flex items-center justify-center hover:bg-gray-50 transition-colors"
              aria-label="رجوع"
            >
              <ArrowLeft size={16} className="text-gray-700" />
            </button>
          </div>
        </div>
      </header>

      <main className="flex-1 w-full px-3 sm:px-4 py-3 pb-6">
        <div className="max-w-3xl mx-auto h-full flex flex-col gap-3">
          <div className="bg-white border border-gray-200 rounded-2xl shadow-sm flex-1 flex flex-col overflow-hidden">
            <div className="px-4 pt-3 pb-2 sticky top-0 bg-white/95 backdrop-blur supports-[backdrop-filter]:backdrop-blur-md border-b border-gray-100 z-10">
              <div className="flex items-center justify-between mb-2">
                <p className="text-sm font-semibold text-gray-900">ردود سريعة</p>
                <p className="text-xs text-gray-400">اختصار للردود الشائعة</p>
              </div>
              <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-hide -mx-1 px-1">
                {QUICK_RESPONSES.map((response) => (
                  <button
                    key={response.id}
                    onClick={() => handleQuickResponse(response.text)}
                    className="min-w-fit flex items-center gap-2 px-3 py-2 rounded-full border border-gray-200 bg-gray-50 text-sm text-gray-700 whitespace-nowrap hover:border-orange-300 hover:bg-orange-50 transition-all shadow-sm"
                  >
                    <span>{response.icon}</span>
                    <span>{response.text}</span>
                  </button>
                ))}
              </div>
            </div>

            <div className="flex-1 overflow-y-auto px-4 py-3 space-y-3 bg-gradient-to-b from-white to-gray-50 min-h-[50vh]">
              {messages.map((message) => (
                <div
                  key={message.id}
                  className={`flex ${message.sender === 'user' ? 'justify-start' : 'justify-end'}`}
                >
                  <div
                    className={`max-w-[85%] sm:max-w-[70%] rounded-2xl px-4 py-3 shadow-sm ${
                      message.sender === 'user'
                        ? 'bg-gradient-to-br from-orange-500 to-orange-600 text-white rounded-br-md'
                        : 'bg-white text-gray-800 rounded-bl-md border border-gray-100'
                    }`}
                  >
                    <p className="text-sm sm:text-base leading-relaxed whitespace-pre-wrap">
                      {message.content}
                    </p>
                    <div
                      className={`flex items-center gap-1 mt-2 text-xs ${
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

          <div className="sticky bottom-3">
            <form
              onSubmit={handleSubmit}
              className="bg-white border border-gray-200 rounded-2xl shadow-md px-3 py-2 flex items-center gap-2"
            >
              <input
                type="text"
                value={inputMessage}
                onChange={(e) => setInputMessage(e.target.value)}
                placeholder="اكتب رسالتك هنا..."
                className="flex-1 bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-orange-400 focus:border-transparent text-right text-sm"
              />
              <button
                type="submit"
                disabled={!inputMessage.trim()}
                className="bg-gradient-to-r from-orange-500 to-orange-600 text-white px-4 py-3 rounded-xl hover:shadow-md transition-all disabled:opacity-50 disabled:cursor-not-allowed"
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
