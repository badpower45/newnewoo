import React, { useState } from 'react';
import { ChevronDown, ChevronUp, Filter } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const FILTER_SECTIONS = [
  { id: 'category', name: 'القسم', options: ['خضار وفاكهة', 'لحوم ودواجن', 'مخبوزات', 'ألبان', 'خزين البيت'] },
  { id: 'dietary', name: 'نظام غذائي', options: ['حلال', 'أورجانيك', 'خالي من الجلوتين', 'دايت', 'كيتو'] },
  { id: 'brand', name: 'ماركات', options: ['مزارع علوش', 'مزارع دينا', 'المراعي', 'جهينة', 'نستله'] },
];

export default function SidebarFilter() {
  const [openSections, setOpenSections] = useState<Record<string, boolean>>({
    category: true,
    dietary: true,
    brand: false
  });

  const toggleSection = (id: string) => {
    setOpenSections(prev => ({ ...prev, [id]: !prev[id] }));
  };

  return (
    <aside className="w-full lg:w-64 flex-shrink-0 pl-8 hidden lg:block">
      <div className="sticky top-32">
        <div className="flex items-center justify-between mb-6">
          <h3 className="font-bold text-brand-brown flex items-center gap-2">
            <Filter size={18} className="text-brand-orange" /> فلتر البحث
          </h3>
          <button className="text-xs text-brand-orange font-semibold hover:text-orange-700 hover:underline">مسح الكل</button>
        </div>

        <div className="space-y-6 bg-white p-4 rounded-2xl shadow-sm border border-slate-100">
            {/* Price Range Slider (Visual Mock) */}
            <div className="border-b border-slate-100 pb-6">
                <h4 className="text-sm font-bold text-slate-800 mb-4">نطاق السعر</h4>
                <div className="h-2 bg-slate-100 rounded-full relative mb-4">
                    <div className="absolute right-0 top-0 h-full bg-brand-orange w-[60%] rounded-full"></div>
                    <div className="absolute right-[60%] top-1/2 -translate-y-1/2 w-4 h-4 bg-white border-2 border-brand-orange rounded-full shadow cursor-pointer hover:scale-110 transition-transform"></div>
                </div>
                <div className="flex justify-between text-xs text-slate-500 font-medium">
                    <span>0</span>
                    <span>+500</span>
                </div>
            </div>

            {FILTER_SECTIONS.map((section) => (
                <div key={section.id} className="border-b border-slate-100 pb-6 last:border-0 last:pb-0">
                    <button 
                        onClick={() => toggleSection(section.id)}
                        className="w-full flex items-center justify-between mb-3 group"
                    >
                        <h4 className="text-sm font-bold text-slate-800 group-hover:text-brand-orange transition-colors">{section.name}</h4>
                        {openSections[section.id] ? <ChevronUp size={16} className="text-slate-400"/> : <ChevronDown size={16} className="text-slate-400" />}
                    </button>
                    <AnimatePresence>
                        {openSections[section.id] && (
                            <motion.div 
                                initial={{ height: 0, opacity: 0 }}
                                animate={{ height: 'auto', opacity: 1 }}
                                exit={{ height: 0, opacity: 0 }}
                                className="overflow-hidden"
                            >
                                <div className="space-y-2">
                                    {section.options.map((opt, idx) => (
                                        <label key={idx} className="flex items-center space-x-3 space-x-reverse cursor-pointer group">
                                            <div className="relative flex items-center">
                                                <input type="checkbox" className="peer h-4 w-4 border-slate-300 rounded text-brand-orange focus:ring-brand-orange checked:bg-brand-orange" />
                                            </div>
                                            <span className="text-sm text-slate-600 group-hover:text-brand-brown font-medium">{opt}</span>
                                        </label>
                                    ))}
                                </div>
                            </motion.div>
                        )}
                    </AnimatePresence>
                </div>
            ))}
        </div>
      </div>
    </aside>
  );
}