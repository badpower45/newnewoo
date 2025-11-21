import React from 'react';
import { motion } from 'framer-motion';

// We use emojis or simple shapes/images to simulate falling packs
// In a real production app, these would be transparent PNGs of the actual product bags
const FALLING_ITEMS = [
  { id: 1, type: 'image', src: 'https://cdn-icons-png.flaticon.com/512/2553/2553691.png', delay: 0 }, // Chips Red
  { id: 2, type: 'image', src: 'https://cdn-icons-png.flaticon.com/512/2553/2553646.png', delay: 1.5 }, // Chips Yellow
  { id: 3, type: 'image', src: 'https://cdn-icons-png.flaticon.com/512/3050/3050130.png', delay: 0.5 }, // Soda
  { id: 4, type: 'image', src: 'https://cdn-icons-png.flaticon.com/512/2553/2553691.png', delay: 2.5 }, // Chips Red
  { id: 5, type: 'image', src: 'https://cdn-icons-png.flaticon.com/512/2553/2553646.png', delay: 3.5 }, // Chips Yellow
  { id: 6, type: 'image', src: 'https://cdn-icons-png.flaticon.com/512/1046/1046857.png', delay: 2 }, // Chocolate
];

export default function FallingSnacks() {
  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none z-20">
      {FALLING_ITEMS.map((item, i) => (
        <motion.div
          key={i}
          initial={{ y: -100, x: Math.random() * 300 - 150, opacity: 0, rotate: 0 }}
          animate={{ 
            y: 500, 
            opacity: [0, 1, 1, 0],
            rotate: Math.random() * 360
          }}
          transition={{
            duration: 4 + Math.random() * 3,
            repeat: Infinity,
            delay: item.delay,
            ease: "linear"
          }}
          className="absolute top-0 left-1/2"
        >
            <img src={item.src} alt="falling snack" className="w-16 h-16 md:w-24 md:h-24 object-contain drop-shadow-lg" />
        </motion.div>
      ))}
    </div>
  );
}