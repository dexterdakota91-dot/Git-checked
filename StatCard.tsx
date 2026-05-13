import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { cn } from '@/lib/utils';
import { ElectricityTracer } from './ElectricityTracer';

/**
 * Renders a styled statistic card displaying an icon, a trend badge, a title, and a value.
 *
 * @param title - The label shown above the value.
 * @param value - The main statistic value displayed prominently.
 * @param trend - A short trend string (e.g., "+3.4%") shown in a badge; styling indicates positive when it starts with "+".
 * @param icon - Icon node displayed in the card header.
 * @param withBeam - If true, overlays an animated beam tracer.
 * @param beamColor - Color passed to the beam tracer when `withBeam` is true.
 * @returns A JSX element rendering the statistic card.
 */
export function StatCard({ title, value, trend, icon, withBeam, beamColor }: { title: string, value: string, trend: string, icon: React.ReactNode, withBeam?: boolean, beamColor?: string }) {
  return (
    <Card className="aetheris-card relative overflow-hidden group hover:scale-[1.02] transition-transform duration-300">
      {withBeam && <ElectricityTracer color={beamColor as any} duration={4} />}
      <CardContent className="p-6">
        <div className="flex justify-between items-start mb-4">
          <div className="p-2 rounded-lg bg-secondary/50 text-primary border border-white/5">
            {icon}
          </div>
          <span className={cn(
            "text-[10px] font-bold px-2 py-0.5 rounded-full font-mono",
            trend.startsWith('+') ? "bg-primary/20 text-primary" : "bg-accent/20 text-accent"
          )}>
            {trend}
          </span>
        </div>
        <div>
          <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-muted-foreground mb-1 font-mono">
            {title}
          </p>
          <p className="text-3xl font-bold font-display tracking-tight">
            {value}
          </p>
        </div>
      </CardContent>
    </Card>
  );
}
