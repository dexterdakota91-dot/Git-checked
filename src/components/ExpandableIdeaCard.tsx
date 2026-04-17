import React, { useState } from 'react';
import { ChevronDown, ChevronUp, ChevronRight, Cpu } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { BusinessIdea } from '../types';

export const ExpandableIdeaCard: React.FC<{ idea: BusinessIdea, onInitiate: (idea: BusinessIdea) => void | Promise<void> }> = ({ idea, onInitiate }) => {
  const [isExpanded, setIsExpanded] = useState(false);

  return (
    <Card className="aetheris-card overflow-hidden group border-none">
      <div className="h-2 bg-primary/30 w-full" />
      <CardHeader>
        <div className="flex justify-between items-start">
          <CardTitle className="text-xl text-foreground">{idea.title}</CardTitle>
          <Badge variant="secondary" className="bg-primary/20 text-primary border-primary/30 font-bold">
            {idea.potential} potential
          </Badge>
        </div>
        <CardDescription className="text-muted-foreground">{idea.description}</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2">
          <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Recommended Model</p>
          <div className="flex items-center gap-2 text-sm font-mono bg-background/50 p-2 rounded border border-accent/10">
            <Cpu size={14} className="text-primary" />
            {idea.model}
          </div>
        </div>
        
        <Button 
          variant="ghost" 
          size="sm" 
          className="h-6 px-2 text-[10px] text-primary hover:bg-primary/10 gap-1"
          onClick={() => setIsExpanded(!isExpanded)}
        >
          {isExpanded ? (
            <>Hide Details <ChevronUp size={12} /></>
          ) : (
            <>View Outlook & Strategy <ChevronDown size={12} /></>
          )}
        </Button>

        <AnimatePresence>
          {isExpanded && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              className="overflow-hidden space-y-4 pt-4 border-t border-border/30"
            >
              <div className="space-y-2">
                <h4 className="text-[10px] font-bold uppercase text-primary tracking-widest">Market Outlook</h4>
                <p className="text-xs text-muted-foreground leading-relaxed">{idea.outlook || "High-growth potential in the automated AI sector."}</p>
              </div>
              <div className="space-y-2">
                <h4 className="text-[10px] font-bold uppercase text-accent tracking-widest">Revenue Strategy</h4>
                <p className="text-xs text-muted-foreground leading-relaxed">{idea.revenueStrategy || "Self-starting capital generated via micro-services."}</p>
              </div>
              
              <div className="grid grid-cols-4 gap-2">
                {[
                  { label: 'M1', value: idea.projections?.month1 },
                  { label: 'M3', value: idea.projections?.month3 },
                  { label: 'M6', value: idea.projections?.month6 },
                  { label: 'M12', value: idea.projections?.month12 },
                ].map((p, i) => (
                  <div key={i} className="p-2 rounded-lg bg-background/50 border border-accent/5 text-center">
                    <p className="text-[8px] text-muted-foreground">{p.label}</p>
                    <p className="text-[10px] font-bold text-foreground">${p.value?.toLocaleString() || '0'}</p>
                  </div>
                ))}
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        <div className="space-y-2 pt-2">
          <div className="flex justify-between items-center">
            <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Core Prompt</p>
            <Badge variant="outline" className="text-[9px] border-primary/30 text-primary bg-primary/5">Advanced Engineering</Badge>
          </div>
          <div className="bg-background/50 p-3 rounded text-xs font-mono line-clamp-2 text-muted-foreground italic relative group/prompt">
            "{idea.prompt}"
            <div className="absolute inset-0 bg-background/90 opacity-0 group-hover/prompt:opacity-100 transition-opacity p-3 flex items-center justify-center text-center">
              <span className="text-[10px] text-primary font-bold">Uses Chain-of-Thought & Role-Based Framing</span>
            </div>
          </div>
        </div>
        <div className="flex flex-wrap gap-2">
          {(idea.tags || []).map(tag => (
            <Badge key={tag} variant="outline" className="text-[10px] border-accent/20">{tag}</Badge>
          ))}
        </div>
        <Button variant="secondary" className="w-full mt-4 group-hover:electric-glow transition-all" onClick={() => onInitiate(idea)}>
          Initiate Project <ChevronRight size={16} className="ml-2" />
        </Button>
      </CardContent>
    </Card>
  );
}
