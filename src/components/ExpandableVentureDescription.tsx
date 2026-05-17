import React, { useState } from 'react';
import { ChevronDown, ChevronUp } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { Button } from '@/components/ui/button';
import { Project } from '../types';
import { cn } from '@/lib/utils';

/**
 * Render an expandable venture description panel for a Project.
 *
 * Displays the project's short description with a gradient fade and a toggle button that expands
 * an animated details panel containing Market Outlook, Revenue Strategy, Growth Projections, and
 * a Strategic Timeline. Uses safe fallbacks when project fields are missing.
 *
 * @param project - The project data used to populate description, outlook, revenue strategy,
 *   projections (month1/month3/month6/month12), and timeline entries.
 * @returns A React element representing the expandable venture description UI.
 */
export function ExpandableVentureDescription({ project }: { project: Project }) {
  const [isExpanded, setIsExpanded] = useState(false);

  return (
    <div className="space-y-4">
      <div className="relative">
        <p className={cn(
          "text-muted-foreground transition-all duration-300",
          !isExpanded && "line-clamp-2"
        )}>
          {project.description}
        </p>
        {!isExpanded && (
          <div className="absolute bottom-0 left-0 right-0 h-4 bg-gradient-to-t from-background to-transparent" />
        )}
      </div>
      
      <Button 
        variant="ghost" 
        size="sm" 
        className="h-6 px-2 text-[10px] text-primary hover:bg-primary/10 gap-1"
        onClick={() => setIsExpanded(!isExpanded)}
      >
        {isExpanded ? (
          <>Collapse Details <ChevronUp size={12} /></>
        ) : (
          <>Expand Venture Outlook <ChevronDown size={12} /></>
        )}
      </Button>

      <AnimatePresence>
        {isExpanded && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="overflow-hidden space-y-6 pt-4 border-t border-border/50"
          >
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <h4 className="text-xs font-bold uppercase text-primary tracking-widest">Market Outlook</h4>
                <p className="text-sm text-muted-foreground leading-relaxed">
                  {project.outlook || "High-growth potential in the automated AI sector with minimal competition in this specific niche."}
                </p>
              </div>
              <div className="space-y-2">
                <h4 className="text-xs font-bold uppercase text-accent tracking-widest">Revenue Strategy</h4>
                <p className="text-sm text-muted-foreground leading-relaxed">
                  {project.revenueStrategy || "Self-starting capital generated via micro-services and automated lead generation."}
                </p>
              </div>
            </div>

            <div className="space-y-4">
              <h4 className="text-xs font-bold uppercase text-muted-foreground tracking-widest">Growth Projections</h4>
              <div className="grid grid-cols-4 gap-2">
                {[
                  { label: 'M1', value: project.projections?.month1 },
                  { label: 'M3', value: project.projections?.month3 },
                  { label: 'M6', value: project.projections?.month6 },
                  { label: 'M12', value: project.projections?.month12 },
                ].map((p, i) => (
                  <div key={i} className="p-3 rounded-xl bg-secondary/30 border border-accent/10 text-center">
                    <p className="text-[10px] text-muted-foreground mb-1">{p.label}</p>
                    <p className="text-sm font-bold text-foreground">${p.value?.toLocaleString() || '0'}</p>
                  </div>
                ))}
              </div>
            </div>

            <div className="space-y-4">
              <h4 className="text-xs font-bold uppercase text-muted-foreground tracking-widest">Strategic Timeline</h4>
              <div className="space-y-3">
                {(project.timeline || []).map((t, i) => (
                  <div key={i} className="flex items-center gap-3 p-2 rounded-lg bg-background/50 border border-border/30">
                    <div className={cn(
                      "w-2 h-2 rounded-full",
                      t.status === 'completed' ? "bg-primary" : "bg-muted"
                    )} />
                    <div className="flex-1 flex justify-between items-center">
                      <span className="text-xs font-medium">{t.milestone}</span>
                      <span className="text-[10px] text-muted-foreground">{t.date}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
