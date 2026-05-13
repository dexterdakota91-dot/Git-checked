import React from 'react';
import { Card, CardContent } from '@/components/ui/card';

export const LegalCard = React.forwardRef<HTMLDivElement, { icon: React.ReactNode, title: string, description: string } & React.ComponentProps<typeof Card>>(
  ({ icon, title, description, ...props }, ref) => {
    return (
      <Card ref={ref} className="glass border-none hover:bg-secondary/20 transition-all cursor-pointer" {...props}>
        <CardContent className="p-6 space-y-3">
          <div className="p-2 w-fit rounded-lg bg-secondary/50">
            {icon}
          </div>
          <h4 className="font-bold">{title}</h4>
          <p className="text-xs text-muted-foreground">{description}</p>
        </CardContent>
      </Card>
    );
  }
);
LegalCard.displayName = 'LegalCard';
