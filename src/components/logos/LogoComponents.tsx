import React from 'react';
import { motion } from 'motion/react';
import { cn } from '@/lib/utils';
import { Agent } from '../../types';

export const OrbitLogo = React.memo(({ size = 40, primary = '#0066FF', secondary = '#D4AF37' }: { size?: number, primary?: string, secondary?: string }) => {
  return (
    <div style={{ width: size, height: size }} className="relative flex items-center justify-center">
      {/* Central Core */}
      <div 
        className="w-1/3 h-1/3 rounded-full relative z-10"
        style={{ backgroundColor: primary, boxShadow: `0 0 15px ${primary}40` }}
      >
        <div className="absolute inset-0 rounded-full bg-white/20 animate-pulse" />
      </div>
      
      {/* Orbits */}
      <motion.div 
        className="absolute inset-0 rounded-full border border-white/10"
        animate={{ rotate: 360 }}
        transition={{ duration: 8, repeat: Infinity, ease: "linear" }}
      >
        <div 
          className="absolute top-0 left-1/2 -translate-x-1/2 w-2 h-2 rounded-full"
          style={{ backgroundColor: primary, boxShadow: `0 0 10px ${primary}` }}
        />
      </motion.div>
      
      <motion.div 
        className="absolute inset-[-20%] rounded-full border border-white/5"
        animate={{ rotate: -360 }}
        transition={{ duration: 12, repeat: Infinity, ease: "linear" }}
      >
        <div 
          className="absolute bottom-0 left-1/2 -translate-x-1/2 w-2 h-2 rounded-full"
          style={{ backgroundColor: secondary, boxShadow: `0 0 10px ${secondary}` }}
        />
      </motion.div>
      
      <motion.div 
        className="absolute inset-[-40%] rounded-full border border-white/5"
        animate={{ rotate: 240 }}
        transition={{ duration: 15, repeat: Infinity, ease: "linear" }}
      >
        <div 
          className="absolute right-0 top-1/2 -translate-y-1/2 w-2 h-2 rounded-full"
          style={{ backgroundColor: primary, boxShadow: `0 0 10px ${primary}` }}
        />
      </motion.div>
    </div>
  );
});

export const PrismLogo = React.memo(({ size = 40, primary = '#0066FF', secondary = '#D4AF37' }: { size?: number, primary?: string, secondary?: string }) => {
  const gradId = React.useId();
  return (
    <div style={{ width: size, height: size }} className="relative flex items-center justify-center overflow-hidden">
      <svg viewBox="0 0 100 100" className="w-full h-full">
        <defs>
          <linearGradient id={gradId} x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor={primary} />
            <stop offset="50%" stopColor="#FFFFFF" />
            <stop offset="100%" stopColor={secondary || primary} />
          </linearGradient>
        </defs>
        <motion.path 
          d="M50 10 L90 80 L10 80 Z" 
          fill="none" 
          stroke={`url(#${gradId})`} 
          strokeWidth="2"
          animate={{ strokeDasharray: ["0, 300", "300, 0"] }}
          transition={{ duration: 4, repeat: Infinity }}
        />
        <motion.path 
          d="M50 40 L80 80 L20 80 Z" 
          fill={`url(#${gradId})`} 
          fillOpacity="0.2"
          animate={{ opacity: [0.2, 0.5, 0.2] }}
          transition={{ duration: 3, repeat: Infinity }}
        />
      </svg>
    </div>
  );
});

export const AetherisLogo = React.memo(({ size = 40, primary = '#0066FF', secondary = '#D4AF37' }: { size?: number, primary?: string, secondary?: string }) => {
  return (
    <div className="flex items-center gap-2">
      <MonolithLogo size={size} primary={primary} secondary={secondary} />
      <span className="font-display font-bold tracking-tighter bg-clip-text text-transparent bg-gradient-to-r from-white to-white/50" style={{ fontSize: size * 0.6 }}>
        AETHERIS VENTURES
      </span>
    </div>
  );
});

export const AetherisTextLogo = React.memo(({ size = 40 }: { size?: number }) => {
  return (
    <span className="font-display font-bold tracking-tighter text-white animate-pulse-glow cursor-pointer" style={{ fontSize: size * 0.6 }}>
      AETHERIS
    </span>
  );
});

export const MonolithLogo = React.memo(({ 
  size = 40, 
  agents = [], 
  logoType = 'monolith',
  primary = '#0066FF',
  secondary = '#D4AF37',
  accent = '#0066FF'
}: { 
  size?: number, 
  agents?: Agent[], 
  logoType?: 'monolith' | 'orbit' | 'prism',
  primary?: string,
  secondary?: string,
  accent?: string
}) => {
  if (logoType === 'orbit') return <OrbitLogo size={size} primary={primary} secondary={secondary} />;
  if (logoType === 'prism') return <PrismLogo size={size} primary={primary} secondary={secondary} />;

  const architectWorking = agents.find(a => a.archetype === 'architect')?.status === 'working';
  const coderWorking = agents.find(a => a.archetype === 'automator' || a.role === 'Implementation')?.status === 'working';
  const marketerWorking = agents.find(a => a.archetype === 'copywriter' || a.role === 'Growth')?.status === 'working';

  return (
    <div style={{ width: size, height: size }} className="flex flex-col gap-[2px] p-[2px]">
      {/* Top Tier: Architect */}
      <motion.div 
        className={cn(
          "w-full h-1/3 rounded-[2px] transition-all duration-500", 
          architectWorking ? "scale-105 z-10" : "bg-slate-700"
        )}
        style={architectWorking ? { backgroundColor: secondary } : {}}
        animate={architectWorking ? { 
          opacity: [0.8, 1, 0.8],
          boxShadow: [`0 0 0px ${secondary}`, `0 0 15px ${secondary}`, `0 0 0px ${secondary}`]
        } : {}}
        transition={{ duration: 2, repeat: Infinity }}
      />
      {/* Middle Tier: Coder */}
      <motion.div 
        className={cn(
          "w-full h-1/3 rounded-[2px] transition-all duration-500", 
          coderWorking ? "scale-105 z-10" : "bg-slate-600"
        )}
        style={coderWorking ? { backgroundColor: accent } : {}}
        animate={coderWorking ? { 
          opacity: [0.8, 1, 0.8],
          boxShadow: [`0 0 0px ${accent}`, `0 0 15px ${accent}`, `0 0 0px ${accent}`]
        } : {}}
        transition={{ duration: 2, repeat: Infinity }}
      />
      {/* Bottom Tier: Marketer */}
      <motion.div 
        className={cn(
          "w-full h-1/3 rounded-[2px] transition-all duration-500", 
          marketerWorking ? "scale-105 z-10" : "bg-slate-500"
        )}
        style={marketerWorking ? { backgroundColor: primary } : {}}
        animate={marketerWorking ? { 
          opacity: [0.8, 1, 0.8],
          boxShadow: [`0 0 0px ${primary}`, `0 0 15px ${primary}`, `0 0 0px ${primary}`]
        } : {}}
        transition={{ duration: 2, repeat: Infinity }}
      />
    </div>
  );
});
