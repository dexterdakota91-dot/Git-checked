import React, { useState } from 'react';
import { ChevronDown, ChevronUp, ChevronRight, Cpu } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { BusinessIdea } from '../types';

export const ExpandableIdeaCard: React.FC<{ idea: BusinessIdea, onInitiate: (idea: BusinessIdea) => void | Promise<void> }> = ({ idea, onInitiate }) => {
  const [isExpanded, setIsExpanded] = useState(false);
  const title = idea.branding?.selectedName || idea.title;

  return (
    <Card className="aetheris-card overflow-hidden group border-none">
      <div 
        className="h-2 w-full transition-colors duration-500" 
        style={{ backgroundColor: idea.branding?.selectedPalette?.[0] || 'var(--primary)' }} 
      />
      <CardHeader>
        <div className="flex justify-between items-start">
          <CardTitle className="text-xl text-foreground">
            {title}
            {idea.branding?.selectedName && (
              <span className="block text-[10px] text-muted-foreground font-normal mt-1 italic tracking-wide">
                Blueprint: {idea.title}
              </span>
            )}
          </CardTitle>
          <Badge variant="secondary" className="bg-primary/20 text-primary border-primary/30 font-bold">
            {idea.potential} potential
          </Badge>
        </div>
        <CardDescription className="text-muted-foreground line-clamp-2">{idea.description}</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {idea.branding && (
          <div className="p-3 rounded-xl bg-secondary/20 border border-primary/10 space-y-3">
             <div className="flex items-center justify-between">
                <p className="text-[10px] font-bold uppercase text-muted-foreground tracking-widest">Brand Identity</p>
                <div className="flex gap-1">
                  {idea.branding.selectedPalette?.map((c, i) => (
                    <div key={i} className="w-2 h-2 rounded-full shadow-sm" style={{ backgroundColor: c }} />
                  ))}
                </div>
             </div>
             <p className="text-xs italic text-foreground/80 leading-snug">"{idea.branding.missionStatement}"</p>
             <div className="flex gap-4">
                <div>
                   <p className="text-[8px] uppercase text-muted-foreground font-bold">Audience</p>
                   <p className="text-[10px] font-medium">{idea.branding.targetAudience}</p>
                </div>
                <div>
                   <p className="text-[8px] uppercase text-muted-foreground font-bold">Tone</p>
                   <p className="text-[10px] font-medium">{idea.branding.tone}</p>
                </div>
             </div>
          </div>
        )}

        <Button 
          variant="ghost" 
          size="sm" 
          className="h-6 px-2 text-[10px] text-primary hover:bg-primary/10 gap-1"
          onClick={() => setIsExpanded(!isExpanded)}
        >
          {isExpanded ? (
            <>Hide Growth Data <ChevronUp size={12} /></>
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

        <div className="flex flex-wrap gap-2 pt-2">
          {(idea.tags || []).map(tag => (
            <Badge key={tag} variant="outline" className="text-[10px] border-accent/20">{tag}</Badge>
          ))}
        </div>
        
        <button 
          className="monolith-btn-elevated w-full mt-4 flex items-center justify-center py-2 px-4 rounded-xl font-bold transition-all" 
          onClick={() => onInitiate(idea)}
        >
          Initiate Project <ChevronRight size={16} className="ml-2" />
        </button>
      </CardContent>
    </Card>
  );
};
