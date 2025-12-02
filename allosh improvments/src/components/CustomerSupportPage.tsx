import { ArrowRight, Phone, Send, Plus } from 'lucide-react';
import { useState } from 'react';

export function CustomerSupportPage({ onBack }: { onBack: () => void }) {
  const [message, setMessage] = useState('');

  const messages = [
    {
      id: 1,
      type: 'agent',
      text: 'مرحباً! كيف يمكنني مساعدتك في طلبك اليوم؟ 🍊',
      time: '10:30'
    },
    {
      id: 2,
      type: 'user',
      text: 'أين طلبي رقم #452؟',
      time: '10:32'
    },
    {
      id: 3,
      type: 'agent',
      text: 'دعني أتحقق من حالة طلبك... طلبك في الطريق إليك الآن! سيصل خلال 15 دقيقة تقريباً.',
      time: '10:33'
    }
  ];

  return (
    <div className="h-screen flex flex-col bg-[#FAFAFA] max-w-md mx-auto">
      {/* Header */}
      <div className="bg-[#23110C] text-white p-4 shadow-lg">
        <div className="flex items-center gap-3">
          <button onClick={onBack} className="w-10 h-10 flex items-center justify-center">
            <ArrowRight className="w-6 h-6" />
          </button>
          
          <div className="flex items-center gap-3 flex-1">
            {/* Agent Avatar */}
            <div className="relative">
              <div className="w-10 h-10 rounded-full bg-gradient-to-br from-[#F97316] to-[#ea580c] flex items-center justify-center text-white">
                👤
              </div>
              <div className="absolute bottom-0 left-0 w-3 h-3 bg-[#10B981] border-2 border-[#23110C] rounded-full" />
            </div>
            
            <div className="flex-1">
              <h3 className="text-white text-lg">دعم علوش</h3>
              <p className="text-[#9CA3AF] text-sm">يرد عادة خلال دقيقتين</p>
            </div>
          </div>

          <button className="w-10 h-10 flex items-center justify-center">
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
        {/* Date Separator */}
        <div className="flex justify-center mb-4">
          <div className="bg-white/80 backdrop-blur-sm px-4 py-1.5 rounded-full shadow-sm">
            <span className="text-[#6B7280] text-sm">اليوم، 10:30 صباحاً</span>
          </div>
        </div>

        {/* Messages */}
        <div className="space-y-4">
          {messages.map((msg) => (
            <div
              key={msg.id}
              className={`flex ${msg.type === 'user' ? 'justify-start' : 'justify-end'}`}
            >
              <div
                className={`max-w-[75%] p-3 rounded-2xl shadow-sm ${
                  msg.type === 'user'
                    ? 'bg-[#F97316] text-white rounded-br-sm'
                    : 'bg-white text-[#23110C] rounded-bl-sm'
                }`}
              >
                <p className="mb-1">{msg.text}</p>
                <span
                  className={`text-xs ${
                    msg.type === 'user' ? 'text-white/70' : 'text-[#9CA3AF]'
                  }`}
                >
                  {msg.time}
                </span>
              </div>
            </div>
          ))}
        </div>

        {/* Typing Indicator */}
        <div className="flex justify-end mt-4">
          <div className="text-[#9CA3AF] text-sm">الموظف يكتب...</div>
        </div>
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
              onChange={(e) => setMessage(e.target.value)}
              placeholder="اكتب رسالة..."
              className="w-full bg-[#F3F4F6] rounded-full px-4 py-2.5 pr-4 text-[#23110C] placeholder:text-[#9CA3AF] focus:outline-none focus:ring-2 focus:ring-[#F97316]/20"
            />
          </div>

          <button className="w-10 h-10 bg-[#F97316] rounded-full flex items-center justify-center shadow-lg hover:bg-[#ea580c] transition-colors">
            <Send className="w-5 h-5 text-white" />
          </button>
        </div>
      </div>
    </div>
  );
}
