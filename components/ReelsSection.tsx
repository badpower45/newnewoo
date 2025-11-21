
import React from 'react';
import { motion } from 'framer-motion';
import { Play, Heart, Share2 } from 'lucide-react';
import { REELS_ITEMS } from '../constants';

export default function ReelsSection() {
  return (
    <section className="bg-black py-12 md:py-16 relative overflow-hidden">
      {/* Background Gradients */}
      <div className="absolute top-0 left-0 w-full h-full bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-slate-900 via-black to-black opacity-80"></div>
      <div className="absolute top-0 right-0 w-64 h-64 bg-brand-orange/20 rounded-full blur-[100px]"></div>
      <div className="absolute bottom-0 left-0 w-64 h-64 bg-purple-600/20 rounded-full blur-[100px]"></div>

      <div className="container mx-auto px-6 relative z-10">
        <div className="flex items-center justify-between mb-8 text-white">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-pink-500 to-orange-500 flex items-center justify-center">
              <Play size={20} fill="white" />
            </div>
            <h2 className="text-3xl font-extrabold font-header">ريلز علوش</h2>
          </div>
          <a href="#" className="text-sm font-bold text-slate-300 hover:text-white transition-colors">عرض الكل</a>
        </div>

        {/* Horizontal Scroll Container */}
        <div className="flex gap-4 overflow-x-auto pb-8 snap-x snap-mandatory no-scrollbar">
          {REELS_ITEMS.map((reel) => (
            <motion.div
              key={reel.id}
              whileHover={{ scale: 1.02 }}
              className="flex-shrink-0 w-[200px] md:w-[240px] h-[350px] md:h-[420px] relative rounded-2xl overflow-hidden group cursor-pointer snap-center border border-white/10 shadow-2xl"
            >
              {/* Video Thumbnail */}
              <img 
                src={reel.videoImage} 
                alt={reel.title} 
                className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
              />
              
              {/* Overlay Gradient */}
              <div className="absolute inset-0 bg-gradient-to-b from-transparent via-transparent to-black/90"></div>

              {/* Type Badge */}
              <div className="absolute top-3 right-3 bg-white/20 backdrop-blur-md text-white text-[10px] font-bold px-2 py-1 rounded-lg border border-white/10">
                {reel.type}
              </div>

              {/* Play Button Overlay */}
              <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                <div className="w-12 h-12 bg-white/20 backdrop-blur-md rounded-full flex items-center justify-center border border-white/40">
                    <Play size={20} fill="white" className="ml-1" />
                </div>
              </div>

              {/* Content */}
              <div className="absolute bottom-0 left-0 w-full p-4 text-right">
                <div className="flex items-center justify-between mb-2">
                   <span className="flex items-center text-[10px] text-slate-300">
                     <Play size={10} className="mr-1" /> {reel.views}
                   </span>
                   <span className="text-[10px] font-bold text-brand-orange">@{reel.author}</span>
                </div>
                <h3 className="text-sm font-bold text-white leading-snug mb-2 line-clamp-2">{reel.title}</h3>
                
                {/* Actions */}
                <div className="flex items-center gap-3 mt-2">
                    <button className="text-white/80 hover:text-red-500 transition-colors">
                        <Heart size={18} />
                    </button>
                    <button className="text-white/80 hover:text-blue-400 transition-colors">
                        <Share2 size={18} />
                    </button>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
