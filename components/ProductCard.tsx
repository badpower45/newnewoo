
import React from 'react';
import { motion } from 'framer-motion';
import { Plus, Star, Heart } from 'lucide-react';
import { Product } from '../types';

interface ProductCardProps {
  product: Product;
}

const ProductCard: React.FC<ProductCardProps> = ({ product }) => {
  return (
    <motion.div 
      className="group relative bg-white rounded-2xl border border-slate-100 p-2 md:p-3 shadow-sm hover:shadow-xl hover:border-orange-100 transition-all duration-300 flex flex-col h-full"
      whileHover={{ y: -5 }}
    >
      {/* Badges - RTL positioned (Right side visually) */}
      <div className="absolute top-2 md:top-4 right-2 md:right-4 z-20 flex flex-col gap-2 items-end">
        {product.isOrganic && (
          <span className="bg-green-100 text-green-700 text-[8px] md:text-[10px] font-bold px-1.5 py-0.5 md:px-2 md:py-1 rounded-md uppercase tracking-wide shadow-sm">أورجانيك</span>
        )}
        {product.isNew && (
          <span className="bg-brand-orange text-white text-[8px] md:text-[10px] font-bold px-1.5 py-0.5 md:px-2 md:py-1 rounded-md uppercase tracking-wide shadow-sm">جديد</span>
        )}
      </div>

      {/* Wishlist Button - Left side visually in RTL */}
      <button className="absolute top-2 md:top-4 left-2 md:left-4 z-20 p-1.5 md:p-2 bg-white/80 backdrop-blur-sm rounded-full shadow-sm text-slate-400 hover:text-rose-500 transition-colors opacity-0 group-hover:opacity-100 translate-y-2 group-hover:translate-y-0 duration-300 hidden md:block">
        <Heart size={16} />
      </button>

      {/* Image Area */}
      <div className="relative aspect-square overflow-hidden rounded-xl bg-white mb-2 md:mb-4">
        <motion.img 
          src={product.image} 
          alt={product.name}
          className="w-full h-full object-cover"
          whileHover={{ scale: 1.1 }}
          transition={{ duration: 0.4 }}
        />
        
        {/* Quick Add Overlay Gradient */}
        <div className="absolute bottom-0 left-0 w-full h-24 bg-gradient-to-t from-black/10 to-transparent pointer-events-none opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
      </div>

      {/* Content */}
      <div className="flex-1 flex flex-col text-right">
        <div className="flex justify-between items-start mb-1">
            <p className="text-[10px] md:text-xs font-bold text-brand-orange/80 uppercase tracking-wider truncate ml-2">{product.category}</p>
            <div className="flex items-center bg-slate-50 px-1.5 py-0.5 rounded-md shrink-0">
                <span className="text-[10px] font-bold text-slate-700">{product.rating}</span>
                <Star size={8} className="text-yellow-400 fill-yellow-400 ml-0.5" />
            </div>
        </div>
        
        <h3 className="font-bold text-brand-brown text-xs md:text-sm leading-snug mb-1 md:mb-2 group-hover:text-brand-orange transition-colors line-clamp-2 min-h-[32px] md:min-h-[40px]">
            {product.name}
        </h3>
        <p className="text-[10px] md:text-xs text-slate-400 mb-2 md:mb-3 font-medium">{product.weight}</p>
        
        <div className="mt-auto flex items-center justify-between pt-2 border-t border-slate-50">
          <div className="flex flex-col items-start">
            {product.originalPrice && (
                <span className="text-[10px] text-slate-400 line-through">{product.originalPrice.toFixed(2)}</span>
            )}
            <div className="flex items-baseline">
              <span className="text-sm md:text-lg font-extrabold text-brand-orange ml-1">{product.price.toFixed(2)}</span>
              <span className="text-[10px] md:text-xs font-bold text-brand-orange">ج.م</span>
            </div>
          </div>
          <motion.button 
            whileTap={{ scale: 0.9 }}
            className="bg-brand-brown text-white p-1.5 md:p-2.5 rounded-lg md:rounded-xl hover:bg-brand-orange transition-colors shadow-md flex items-center justify-center group/btn"
          >
            <Plus size={16} className="md:w-5 md:h-5 group-hover/btn:rotate-90 transition-transform duration-300" />
          </motion.button>
        </div>
      </div>
    </motion.div>
  );
};

export default ProductCard;
