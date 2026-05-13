import React from 'react';
import { motion } from 'motion/react';

export function ElectricityTracer({ color = "primary", duration = 8 }: { color?: string, duration?: number }) {
  return (
    <div className="absolute inset-0 pointer-events-none overflow-hidden rounded-xl">
      <motion.div 
        className={`absolute top-0 left-0 w-full h-[2px] bg-gradient-to-r from-transparent via-${color} to-transparent opacity-50`}
        animate={{ left: ['-100%', '100%'] }}
        transition={{ duration, repeat: Infinity, ease: "linear" }}
      />
      <motion.div 
        className={`absolute bottom-0 right-0 w-full h-[2px] bg-gradient-to-r from-transparent via-${color} to-transparent opacity-50`}
        animate={{ right: ['-100%', '100%'] }}
        transition={{ duration, repeat: Infinity, ease: "linear", delay: duration / 2 }}
      />
      <motion.div 
        className={`absolute top-0 left-0 w-[2px] h-full bg-gradient-to-b from-transparent via-${color} to-transparent opacity-50`}
        animate={{ top: ['-100%', '100%'] }}
        transition={{ duration, repeat: Infinity, ease: "linear", delay: duration / 4 }}
      />
      <motion.div 
        className={`absolute top-0 right-0 w-[2px] h-full bg-gradient-to-b from-transparent via-${color} to-transparent opacity-50`}
        animate={{ top: ['-100%', '100%'] }}
        transition={{ duration, repeat: Infinity, ease: "linear", delay: duration * 0.75 }}
      />
    </div>
  );
}
