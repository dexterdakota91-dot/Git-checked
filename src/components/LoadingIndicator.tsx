import React from 'react';
import { LucideIcon } from 'lucide-react';
import { cn } from '@/lib/utils';

interface LoadingIndicatorProps {
  icon: LucideIcon;
  size?: number;
  className?: string;
}

export function LoadingIndicator({ icon: Icon, size = 24, className }: LoadingIndicatorProps) {
  return (
    <div className={cn("relative inline-flex items-center justify-center", className)} style={{ width: size, height: size }}>
      {/* Base dim icon */}
      <Icon size={size} className="absolute text-muted-foreground/30" />
      {/* Animated bright icon filling from bottom to top */}
      <Icon size={size} className="absolute text-primary animate-fill-up" />
    </div>
  );
}
