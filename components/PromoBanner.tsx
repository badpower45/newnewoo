
import React from 'react';
import { motion } from 'framer-motion';
import { ArrowLeft, Star } from 'lucide-react';
import FallingSnacks from './FallingSnacks';

interface PromoBannerProps {
  title: string;
  subtitle: string;
  image: string;
  cta: string;
  color: string;
  align?: 'left' | 'right' | 'center';
  height?: 'small' | 'medium' | 'large';
  withAnimation?: boolean;
  theme?: 'default' | 'ramadan';
}

export default function PromoBanner({ 
  title, 
  subtitle, 
  image, 
  cta, 
  color,
  align = 'left',
  height = 'medium',
  withAnimation = false,
  theme = 'default'
}: PromoBannerProps) {
  
  const heightClasses = {
    small: 'h-[300px] md:h-[400px]',
    medium: 'h-[350px]',
    large: 'h-[450px] md:h-[500px]'
  };

  const alignClasses = {
    left: 'items-start text-right', 
    right: 'items-end text-left', 
    center: 'items-center text-center'
  };

  // Determine gradient based on props
  const isPartyVibe = color.includes('bg-purple');
  
  let overlayGradient = 'bg-gradient-to-r from-black via-black/60 to-transparent';
  if (color === 'bg-brand-brown') overlayGradient = 'bg-gradient-to-r from-[#23110C] via-[#3E2723] to-transparent';
  if (theme === 'ramadan') overlayGradient = 'bg-gradient-to-r from-[#1a100e] via-[#4a2c25] to-orange-900/40';
  if (isPartyVibe) overlayGradient = 'bg-gradient-to-t from-[#2e1065] via-[#581c87]/80 to-transparent'; // Rich Purple Gradient

  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      className={`relative w-full ${heightClasses[height]} rounded-3xl overflow-hidden group cursor-pointer shadow-xl border border-slate-100 transition-all duration-500 hover:shadow-2xl`}
    >
      {/* Falling Animation Layer */}
      {withAnimation && <FallingSnacks />}

      {/* Special Party/Neon Background Elements */}
      {isPartyVibe && (
        <>
            <div className="absolute top-0 left-0 w-full h-full mix-blend-overlay bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-pink-500/20 via-transparent to-transparent z-10"></div>
            <div className="absolute bottom-[-50px] right-[-50px] w-64 h-64 bg-blue-500/30 rounded-full blur-3xl"></div>
            <div className="absolute top-[-50px] left-[-50px] w-64 h-64 bg-pink-500/30 rounded-full blur-3xl"></div>
        </>
      )}

      {/* Ramadan Decorations */}
      {theme === 'ramadan' && (
        <>
           <div className="absolute top-0 right-10 z-20 pointer-events-none animate-pulse">
                <svg width="60" height="100" viewBox="0 0 60 100" fill="none" xmlns="http://www.w3.org/2000/svg" className="drop-shadow-[0_0_15px_rgba(255,215,0,0.6)]">
                    <line x1="30" y1="0" x2="30" y2="20" stroke="#FDBA74" strokeWidth="2"/>
                    <path d="M15 20H45L50 35H10L15 20Z" fill="#2A1B18" stroke="#FDBA74"/>
                    <rect x="10" y="35" width="40" height="40" rx="5" fill="#2A1B18" stroke="#FDBA74"/>
                    <path d="M20 45H40M20 55H40M20 65H40" stroke="#FDBA74" strokeOpacity="0.5"/>
                    <path d="M10 75L30 95L50 75" fill="#2A1B18" stroke="#FDBA74"/>
                </svg>
           </div>
           <div className="absolute inset-0 border-[8px] border-double border-orange-400/30 rounded-3xl z-20 pointer-events-none"></div>
        </>
      )}

      {/* Background Image */}
      <div className="absolute inset-0">
        <img 
          src={image} 
          alt={title} 
          className="w-full h-full object-cover transition-transform duration-1000 group-hover:scale-110"
        />
        
        {/* High Contrast Overlay */}
        <div className={`absolute inset-0 opacity-90 transition-opacity duration-500 group-hover:opacity-95 ${overlayGradient}`}></div>
        
        {/* Ramadan Pattern */}
        {theme === 'ramadan' && (
            <div className="absolute inset-0 opacity-10" style={{backgroundImage: 'radial-gradient(#FDBA74 1px, transparent 1px)', backgroundSize: '20px 20px'}}></div>
        )}
      </div>

      {/* Content */}
      <div className={`relative z-30 h-full flex flex-col justify-center p-8 md:p-12 ${alignClasses[align]} max-w-4xl mx-auto`}>
        <motion.div
          initial={{ opacity: 0, x: 20 }}
          whileInView={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.2 }}
        >
          {theme === 'ramadan' ? (
             <span className="inline-flex items-center gap-1 py-1.5 px-4 rounded-full bg-[#FDBA74] text-[#2A1B18] text-sm font-bold mb-4 shadow-lg border border-white/20 animate-pulse">
                <Star size={14} fill="#2A1B18" /> عروض الشهر الكريم
             </span>
          ) : isPartyVibe ? (
             <span className="inline-block py-1.5 px-4 rounded-full bg-pink-500 text-white text-sm font-bold mb-4 shadow-lg border border-white/20 animate-bounce">
               🍿 سهرة الخميس
             </span>
          ) : (
            <span className="inline-block py-1.5 px-4 rounded-full bg-brand-orange text-white text-sm font-bold mb-4 shadow-lg border border-white/20">
              عروض حصرية
            </span>
          )}
          
          <h3 className="text-3xl md:text-5xl font-extrabold text-white mb-4 leading-tight drop-shadow-text">
            {title}
          </h3>
          <p className="text-white text-lg md:text-xl mb-8 max-w-lg font-bold leading-relaxed drop-shadow-text opacity-100">
            {subtitle}
          </p>
          
          <button className={`
            px-8 py-3 rounded-full font-bold flex items-center gap-2 transition-all duration-300 shadow-xl group-hover:px-10 text-lg
            ${theme === 'ramadan' ? 'bg-[#FDBA74] text-[#2A1B18] hover:bg-white' : 
              isPartyVibe ? 'bg-white text-purple-900 hover:bg-pink-500 hover:text-white' :
              'bg-white text-brand-brown hover:bg-brand-orange hover:text-white hover:shadow-orange-500/40'}
          `}>
            {cta} <ArrowLeft size={18} />
          </button>
        </motion.div>
      </div>
    </motion.div>
  );
}
