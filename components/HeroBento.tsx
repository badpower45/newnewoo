
import React from 'react';
import { motion } from 'framer-motion';
import { ArrowLeft } from 'lucide-react';
import { HERO_ITEMS } from '../constants';

export default function HeroBento() {
  const mainBanner = HERO_ITEMS[0];
  const sideOffers = HERO_ITEMS.slice(1, 3);

  return (
    <section className="pt-28 md:pt-40 pb-8 container mx-auto px-4 md:px-6">
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 md:gap-6 h-auto lg:h-[500px]">
        
        {/* Main Banner */}
        <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.6 }}
            className="lg:col-span-2 relative rounded-3xl overflow-hidden shadow-xl group cursor-pointer h-[400px] lg:h-full"
        >
            {/* Image Layer - Full Cover */}
            <div className="absolute inset-0 z-0">
                <img 
                    src={mainBanner.image} 
                    alt={mainBanner.title} 
                    className="w-full h-full object-cover transition-transform duration-1000 group-hover:scale-105"
                />
            </div>

            {/* Gradient Overlay - Bottom Up for clear text */}
            <div className="absolute inset-0 bg-gradient-to-t from-black via-black/40 to-transparent z-10 opacity-90"></div>

            {/* Content Layer - Bottom Right Aligned */}
            <div className="absolute bottom-0 right-0 w-full p-6 md:p-10 z-20 flex flex-col items-start text-right">
                <motion.span 
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.3 }}
                  className="inline-block py-1.5 px-4 rounded-full bg-brand-orange text-white text-xs md:text-sm font-bold mb-3 shadow-lg"
                >
                    وصل حديثاً
                </motion.span>
                <h2 className="text-3xl md:text-5xl font-extrabold text-white leading-tight mb-3 drop-shadow-lg">
                    {mainBanner.title}
                </h2>
                <p className="text-sm md:text-lg text-slate-100 font-medium mb-6 max-w-xl leading-relaxed drop-shadow-md">
                    {mainBanner.subtitle}
                </p>
                <button className="bg-white/10 backdrop-blur-md border border-white/30 text-white px-6 md:px-8 py-3 rounded-full font-bold flex items-center gap-2 hover:bg-white hover:text-brand-brown transition-all duration-300">
                    {mainBanner.cta} <ArrowLeft size={20} />
                </button>
            </div>
        </motion.div>

        {/* Side Column (Stacked Offers) */}
        <div className="lg:col-span-1 grid grid-cols-2 lg:grid-cols-1 lg:grid-rows-2 gap-4 md:gap-6 h-auto lg:h-full">
            {sideOffers.map((item, index) => (
                <motion.div
                    key={item.id}
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.2 + (index * 0.1), duration: 0.5 }}
                    className="relative rounded-3xl overflow-hidden shadow-lg group cursor-pointer h-[200px] lg:h-auto"
                >
                    {/* Image Layer */}
                    <div className="absolute inset-0 z-0">
                        <img 
                            src={item.image} 
                            alt={item.title} 
                            className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                        />
                    </div>

                    {/* Gradient Overlay */}
                    <div className="absolute inset-0 bg-gradient-to-t from-black via-black/50 to-transparent z-10 opacity-80 hover:opacity-90 transition-opacity"></div>

                    {/* Content */}
                    <div className="absolute bottom-0 right-0 w-full p-5 z-20">
                        <h3 className="text-lg md:text-2xl font-extrabold text-white mb-1 drop-shadow-md leading-tight">{item.title}</h3>
                        <p className="text-xs text-slate-200 font-medium mb-3 line-clamp-1">{item.subtitle}</p>
                        <span className="text-[10px] md:text-xs font-bold text-brand-orange flex items-center gap-1 group-hover:gap-2 transition-all">
                            {item.cta} <ArrowLeft size={12} />
                        </span>
                    </div>
                </motion.div>
            ))}
        </div>

      </div>
    </section>
  );
}
