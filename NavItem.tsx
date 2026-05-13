import React from 'react';
import { cn } from '@/lib/utils';

export function NavItem({ icon, label, active, onClick, disabled }: { icon: React.ReactNode, label: string, active?: boolean, onClick: () => void, disabled?: boolean }) {
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      className={cn(
        "w-full flex items-center gap-3 px-4 py-2.5 rounded-xl text-sm font-medium transition-all relative group",
        active 
          ? "bg-primary/10 text-primary electric-glow" 
          : "text-muted-foreground hover:bg-secondary/50 hover:text-foreground",
        disabled && "opacity-30 cursor-not-allowed grayscale"
      )}
    >
      {active && (
        <div className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-6 bg-primary rounded-r-full electric-glow" />
      )}
      <span className={cn("transition-transform duration-300", active ? "scale-110" : "group-hover:scale-110")}>
        {icon}
      </span>
      <span className="font-display tracking-tight">{label}</span>
      {active && (
        <div className="ml-auto w-1.5 h-1.5 rounded-full bg-primary animate-pulse" />
      )}
    </button>
  );
}
