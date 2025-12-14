import React, { useState, useEffect, useRef } from 'react';
import { Send, ArrowRight, Phone, Clock, MessageCircle, CheckCheck, Check, Loader2 } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { supabaseChatService, ChatMessage, ChatConversation } from '../services/supabaseChatService';
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
  const inputRef = useRef<HTMLInputElement>(null);

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
    <div className="min-h-screen bg-gray-50 flex flex-col" dir="rtl">
      {/* Header */}
      <header className="bg-gradient-to-r from-orange-500 to-orange-600 text-white sticky top-0 z-10 shadow-lg">
        <div className="max-w-4xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <button
                onClick={() => navigate(-1)}
                className="p-2 hover:bg-white/20 rounded-full transition-colors"
              >
                <ArrowRight size={24} />
              </button>
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 bg-white/20 rounded-full flex items-center justify-center">
                  <MessageCircle size={24} />
                </div>
                <div>
                  <h1 className="text-lg font-bold">خدمة العملاء</h1>
                  <div className="flex items-center gap-2 text-sm text-white/80">
                    <span className={`w-2 h-2 rounded-full ${isConnected ? 'bg-green-400' : 'bg-yellow-400'} animate-pulse`}></span>
                    <span>{isConnected ? 'متصل الآن' : 'جاري الاتصال...'}</span>
                  </div>
                </div>
              </div>
            </div>
            
            <a
              href="tel:+201234567890"
              className="flex items-center gap-2 bg-white/20 hover:bg-white/30 px-4 py-2 rounded-full transition-colors"
            >
              <Phone size={18} />
              <span className="hidden sm:inline">اتصل بنا</span>
            </a>
          </div>
        </div>
      </header>

      {/* Chat Area */}
      <div className="flex-1 max-w-4xl mx-auto w-full overflow-hidden flex flex-col">
        {/* Messages */}
        <div className="flex-1 overflow-y-auto p-4 space-y-4">
          {messages.map((message) => (
            <div
              key={message.id}
              className={`flex ${message.sender === 'user' ? 'justify-start' : 'justify-end'}`}
            >
              <div
                className={`max-w-[85%] sm:max-w-[70%] rounded-2xl px-4 py-3 shadow-sm ${
                  message.sender === 'user'
                    ? 'bg-gradient-to-br from-orange-500 to-orange-600 text-white rounded-br-none'
                    : 'bg-white text-gray-800 rounded-bl-none border border-gray-100'
                }`}
              >
                <p className="text-sm sm:text-base leading-relaxed whitespace-pre-wrap">
                  {message.content}
                </p>
                <div className={`flex items-center gap-1 mt-1 text-xs ${
                  message.sender === 'user' ? 'text-white/70' : 'text-gray-400'
                }`}>
                  <Clock size={10} />
                  <span>{formatTime(message.timestamp)}</span>
                  {message.sender === 'user' && getStatusIcon(message.status)}
                </div>
              </div>
            </div>
          ))}
          
          {/* Typing Indicator */}
          {isTyping && (
            <div className="flex justify-end">
              <div className="bg-white text-gray-800 rounded-2xl rounded-bl-none px-4 py-3 shadow-sm border border-gray-100">
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

        {/* Quick Responses */}
        {messages.length <= 1 && (
          <div className="px-4 pb-2">
            <p className="text-gray-500 text-sm mb-3 text-center">اختر موضوع للمساعدة السريعة:</p>
            <div className="flex flex-wrap gap-2 justify-center">
              {QUICK_RESPONSES.map((response) => (
                <button
                  key={response.id}
                  onClick={() => handleQuickResponse(response.text)}
                  className="flex items-center gap-2 bg-white border border-orange-200 text-orange-600 px-4 py-2 rounded-full text-sm hover:bg-orange-50 hover:border-orange-300 transition-all shadow-sm"
                >
                  <span>{response.icon}</span>
                  <span>{response.text}</span>
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Input Area */}
        <div className="border-t bg-white p-4">
          <form onSubmit={handleSubmit} className="max-w-4xl mx-auto">
            <div className="flex items-center gap-3">
              <input
                ref={inputRef}
                type="text"
                value={inputMessage}
                onChange={(e) => setInputMessage(e.target.value)}
                placeholder="اكتب رسالتك هنا..."
                className="flex-1 border border-gray-200 rounded-full px-5 py-3 focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent text-right bg-gray-50"
              />
              <button
                type="submit"
                disabled={!inputMessage.trim()}
                className="bg-gradient-to-r from-orange-500 to-orange-600 text-white p-3 rounded-full hover:from-orange-600 hover:to-orange-700 transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow-lg hover:shadow-xl"
              >
                <Send size={20} className="rotate-180" />
              </button>
            </div>
          </form>
          
          {/* Working Hours Note */}
          <p className="text-center text-gray-400 text-xs mt-3">
            ساعات العمل: السبت - الخميس، 9 صباحاً - 10 مساءً
          </p>
        </div>
      </div>
    </div>
  );
};

export default CustomerChatPage;
