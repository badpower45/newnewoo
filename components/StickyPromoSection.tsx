
import React, { useRef } from 'react';
import { motion } from 'framer-motion';
import { MAGAZINE_OFFERS } from '../constants';
import { ArrowLeft, ArrowRight, Sparkles, Bookmark, ShoppingCart } from 'lucide-react';

export default function StickyPromoSection() {
  const scrollRef = useRef<HTMLDivElement>(null);

  const scroll = (direction: 'left' | 'right') => {
    if (scrollRef.current) {
      const scrollAmount = direction === 'left' ? -350 : 350;
      scrollRef.current.scrollBy({ left: scrollAmount, behavior: 'smooth' });
    }
  };

  return (
    <div className="relative py-4 md:py-12 bg-gradient-to-b from-transparent to-slate-50/50 rounded-3xl my-4 md:my-8">
        {/* Section Header */}
        <div className="flex items-center justify-between mb-6 md:mb-8 px-2 md:px-4">
            <div className="flex flex-col">
                <h2 className="text-2xl md:text-4xl font-extrabold text-brand-brown font-header flex items-center gap-3">
                    📰 مجلة عروض عيد الميلاد
                    <span className="text-sm font-body font-normal text-white bg-red-600 px-3 py-1 rounded-full animate-pulse hidden md:inline-block">
                        فرع الماظة
                    </span>
                </h2>
                <p className="text-slate-500 text-sm mt-2 font-medium">تصفح أقوى عروض الأسبوع وكأنك في الفرع</p>
            </div>
            
            {/* Desktop Navigation Buttons */}
            <div className="hidden md:flex items-center gap-2">
                <button onClick={() => scroll('right')} className="w-10 h-10 rounded-full border border-slate-200 flex items-center justify-center text-slate-600 hover:bg-brand-orange hover:text-white hover:border-brand-orange transition-all">
                    <ArrowRight size={20} />
                </button>
                <button onClick={() => scroll('left')} className="w-10 h-10 rounded-full border border-slate-200 flex items-center justify-center text-slate-600 hover:bg-brand-orange hover:text-white hover:border-brand-orange transition-all">
                    <ArrowLeft size={20} />
                </button>
            </div>
        </div>

        {/* Magazine Slider Container */}
        <div 
            ref={scrollRef}
            className="flex overflow-x-auto snap-x snap-mandatory gap-4 pb-12 px-2 md:px-4 no-scrollbar"
            style={{ scrollBehavior: 'smooth' }}
        >
            {MAGAZINE_OFFERS.map((offer, index) => (
                <motion.div 
                    key={offer.id}
                    className="flex-shrink-0 snap-center relative w-[90vw] md:w-[450px] lg:w-[500px] h-[75vh] md:h-[650px] group"
                    initial={{ opacity: 0, scale: 0.95 }}
                    whileInView={{ opacity: 1, scale: 1 }}
                    transition={{ duration: 0.5, delay: index * 0.1 }}
                >
                    {/* Card Container */}
                    <div className="w-full h-full rounded-[2.5rem] overflow-hidden shadow-2xl relative bg-white border border-slate-100 transform transition-transform duration-500 group-hover:-translate-y-2">
                        
                        {/* Full Background Image */}
                        <img 
                            src={offer.image} 
                            alt={offer.title} 
                            className="absolute inset-0 w-full h-full object-cover transition-transform duration-1000 group-hover:scale-110" 
                        />

                        {/* Cinematic Gradient Overlay - Cleaner, Bottom Focused */}
                        <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-transparent to-transparent opacity-100"></div>

                        {/* Top Badges */}
                        <div className="absolute top-6 right-6 left-6 flex justify-between items-start z-20">
                            <div className={`px-4 py-1.5 rounded-full text-white text-xs md:text-sm font-bold shadow-lg backdrop-blur-md border border-white/20 ${offer.color}`}>
                                {offer.edition}
                            </div>
                            <button className="w-10 h-10 rounded-full bg-black/20 backdrop-blur-md border border-white/20 flex items-center justify-center text-white hover:bg-white hover:text-brand-orange transition-colors">
                                <Bookmark size={18} />
                            </button>
                        </div>

                        {/* Bottom Content - Floating Card Style */}
                        <div className="absolute bottom-0 left-0 w-full p-6 md:p-8 z-20 text-right">
                            <div className="mb-4 transform transition-all duration-300 translate-y-2 group-hover:translate-y-0">
                                <h3 className="text-3xl md:text-5xl font-black text-white mb-2 font-header drop-shadow-lg leading-tight">
                                    {offer.mainOffer}
                                </h3>
                                <p className="text-slate-200 text-sm md:text-lg font-medium flex items-center gap-2 mb-2">
                                    <Sparkles size={16} className="text-yellow-400" /> {offer.subtitle}
                                </p>
                            </div>

                            {/* Action Bar */}
                            <div className="flex items-center justify-between pt-4 border-t border-white/20">
                                <div className="flex flex-col">
                                    <span className="text-[10px] text-slate-400 uppercase tracking-wider mb-1">تفاصيل العرض</span>
                                    <span className="text-xs font-bold text-white bg-white/10 px-2 py-1 rounded w-fit">{offer.date}</span>
                                </div>
                                
                                <button className="bg-brand-orange text-white px-6 py-3 rounded-xl font-bold flex items-center gap-2 hover:bg-white hover:text-brand-orange transition-all shadow-lg hover:shadow-orange-500/30 transform active:scale-95">
                                    <ShoppingCart size={18} /> اطلب العرض
                                </button>
                            </div>
                        </div>
                    </div>
                </motion.div>
            ))}
        </div>
    </div>
  );
}
