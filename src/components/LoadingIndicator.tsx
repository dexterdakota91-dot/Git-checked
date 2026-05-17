import React from 'react';
import { LucideIcon } from 'lucide-react';
import { cn } from '@/lib/utils';

interface LoadingIndicatorProps {
  icon: LucideIcon;
  size?: number;
  className?: string;
}

/**
 * Renders a square loading indicator composed of two overlaid instances of the provided Lucide icon.
 *
 * @param icon - The Lucide icon component used for the dim base and animated overlay.
 * @param size - The width and height in pixels for the container and icons (default: `24`).
 * @param className - Additional CSS classes applied to the container.
 * @returns A React element containing the composed loading indicator.
 */
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
