import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { cn } from '@/lib/utils';
import { ElectricityTracer } from './ElectricityTracer';

export function StatCard({ title, value, trend, icon, withBeam, beamColor }: { title: string, value: string, trend: string, icon: React.ReactNode, withBeam?: boolean, beamColor?: string }) {
  return (
    <Card className="aetheris-card relative overflow-hidden group">
      {withBeam && <ElectricityTracer color={beamColor as any} duration={4} />}
      <CardContent className="p-6">
        <div className="flex justify-between items-start mb-4">
          <div className="p-2 rounded-lg bg-secondary/50 text-primary">
            {icon}
          </div>
          <span className={cn(
            "text-xs font-bold px-2 py-1 rounded-full",
            trend.startsWith('+') ? "bg-primary/10 text-primary" : "bg-accent/10 text-accent"
          )}>
            {trend}
          </span>
        </div>
        <div>
          <p className="text-xs font-bold uppercase tracking-widest text-muted-foreground mb-1">{title}</p>
          <p className="text-3xl font-bold font-display">{value}</p>
        </div>
      </CardContent>
    </Card>
  );
}
