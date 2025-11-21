import React, { useState, useEffect, useRef } from 'react';
import { MessageCircle, X, Send, Minimize2, Headset, Smile } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

export default function Chatbot() {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<{id: number, text: string, isBot: boolean}[]>([
    { id: 1, text: "أهلاً يا فندم في علوش ماركت! 🍊\nازاي اقدر اساعدك النهاردة؟", isBot: true }
  ]);
  const [input, setInput] = useState("");
  const messagesEndRef = useRef<null | HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isOpen]);

  const handleSend = () => {
    if (!input.trim()) return;
    
    const newMsg = { id: Date.now(), text: input, isBot: false };
    setMessages(prev => [...prev, newMsg]);
    setInput("");

    // Simulate bot response
    setTimeout(() => {
        setMessages(prev => [...prev, { 
            id: Date.now() + 1, 
            text: "تمام يا فندم، جاري تحويلك لأحد ممثلي خدمة العملاء حالاً.. 🎧", 
            isBot: true 
        }]);
    }, 1500);
  };

  return (
    <>
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.95 }}
            className="fixed bottom-24 right-6 z-[100] w-[90vw] md:w-96 bg-white rounded-2xl shadow-2xl border border-slate-100 overflow-hidden font-body flex flex-col max-h-[600px]"
          >
            {/* Header */}
            <div className="bg-brand-brown p-4 flex justify-between items-center text-white shadow-md relative z-10">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 bg-white/10 rounded-full flex items-center justify-center backdrop-blur-sm border border-white/20 relative">
                    <Headset size={24} />
                    <span className="absolute bottom-0 right-0 w-3 h-3 bg-green-500 border-2 border-brand-brown rounded-full"></span>
                </div>
                <div>
                    <h3 className="font-bold text-base font-header">خدمة عملاء علوش</h3>
                    <p className="text-xs text-white/80">متاحين 24 ساعة لخدمتك</p>
                </div>
              </div>
              <button onClick={() => setIsOpen(false)} className="text-white/70 hover:text-white bg-white/10 p-1.5 rounded-lg transition-colors">
                <Minimize2 size={18} />
              </button>
            </div>

            {/* Chat Area */}
            <div className="flex-1 bg-slate-50 p-4 overflow-y-auto min-h-[300px]">
                <div className="flex flex-col gap-4">
                    <div className="text-center text-[10px] text-slate-400 my-2">اليوم {new Date().toLocaleTimeString('ar-EG', {hour: '2-digit', minute:'2-digit'})}</div>
                    
                    {messages.map((msg) => (
                        <motion.div 
                            key={msg.id}
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            className={`flex items-end gap-2 ${msg.isBot ? 'justify-start' : 'justify-end'}`}
                        >
                            {msg.isBot && (
                                <div className="w-8 h-8 bg-brand-orange rounded-full flex items-center justify-center text-white text-xs font-bold shrink-0 shadow-sm">
                                    ع
                                </div>
                            )}
                            <div className={`
                                p-3 rounded-2xl shadow-sm text-sm max-w-[80%] leading-relaxed
                                ${msg.isBot 
                                    ? 'bg-white border border-slate-100 text-slate-800 rounded-tr-none' 
                                    : 'bg-brand-orange text-white rounded-tl-none'
                                }
                            `}>
                                {msg.text}
                            </div>
                        </motion.div>
                    ))}
                    <div ref={messagesEndRef} />
                </div>
            </div>

            {/* Input Area */}
            <div className="p-3 bg-white border-t border-slate-100">
                <div className="flex gap-2 items-center">
                    <button className="text-slate-400 hover:text-brand-orange transition-colors p-2">
                        <Smile size={24} />
                    </button>
                    <input 
                        type="text" 
                        placeholder="اكتب استفسارك..."
                        value={input}
                        onChange={(e) => setInput(e.target.value)}
                        onKeyDown={(e) => e.key === 'Enter' && handleSend()}
                        className="flex-1 bg-slate-100 border-0 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-brand-orange/20 text-slate-800 placeholder:text-slate-400"
                    />
                    <button 
                        onClick={handleSend}
                        disabled={!input.trim()}
                        className="bg-brand-brown text-white p-3 rounded-xl hover:bg-brand-orange disabled:opacity-50 disabled:hover:bg-brand-brown transition-all shadow-sm transform active:scale-95"
                    >
                        <Send size={20} className={input.trim() ? 'ml-1' : ''} />
                    </button>
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
        onClick={() => setIsOpen(!isOpen)}
        className="fixed bottom-6 right-6 z-[90] w-16 h-16 bg-brand-orange text-white rounded-full shadow-xl shadow-orange-500/30 flex items-center justify-center hover:bg-orange-600 transition-colors border-4 border-white"
      >
        <AnimatePresence mode='wait'>
            {isOpen ? (
                <motion.div key="close" initial={{ rotate: -90, opacity: 0 }} animate={{ rotate: 0, opacity: 1 }} exit={{ rotate: 90, opacity: 0 }}>
                    <X size={32} />
                </motion.div>
            ) : (
                <motion.div key="chat" initial={{ scale: 0, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0, opacity: 0 }} className="relative">
                    <MessageCircle size={32} />
                    <span className="absolute top-0 right-0 w-3 h-3 bg-green-500 rounded-full border border-brand-orange"></span>
                </motion.div>
            )}
        </AnimatePresence>
      </motion.button>
    </>
  );
}