import React from 'react';
import { cn } from '@/lib/utils';

/**
 * Render a navigation button with an icon and label that reflects active and disabled states.
 *
 * @param icon - Icon element displayed before the label
 * @param label - Text label for the navigation item
 * @param active - When true, applies active styling, shows a left indicator bar and a pulsing dot
 * @param onClick - Click handler invoked when the button is pressed
 * @param disabled - When true, disables interaction and applies disabled styling
 * @returns The rendered button element representing a navigation item
 */
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
