import React from 'react';
import { motion } from 'motion/react';
import { Zap, Terminal, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import { LoadingIndicator } from '../LoadingIndicator';
import { ExpandableIdeaCard } from '../ExpandableIdeaCard';
import { useStore } from '../../store/useStore';
import { cn } from '@/lib/utils';
import { BusinessIdea } from '../../types';

interface IdeaLabViewProps {
  setActiveTab: (tab: string) => void;
}

export default function IdeaLabView({ setActiveTab }: IdeaLabViewProps) {
  const { 
    ideas, 
    refinedTemplates, 
    isGenerating, 
    isTemplatesGenerating, 
    handleGenerateIdeas,
    handleGenerateRefinedTemplates,
    startProject
  } = useStore();
  const [showTemplates, setShowTemplates] = React.useState(false);

  return (
    <motion.div
      key="idea-lab"
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.95 }}
      className="max-w-6xl mx-auto space-y-12 pb-20"
    >
      <div className="text-center space-y-4">
        <h1 className="text-4xl font-bold font-display text-foreground tracking-tight">Venture Architect</h1>
        <p className="text-muted-foreground text-lg max-w-2xl mx-auto">Generate and refine novel, 0-capital business models optimized for autonomous AI implementation.</p>
      </div>

      <div className="flex flex-col items-center gap-8">
        <div className="flex flex-wrap justify-center gap-4">
          <Button 
            variant="secondary"
            size="lg" 
            className="electric-glow px-8 min-w-[240px]" 
            onClick={handleGenerateIdeas}
            disabled={isGenerating}
          >
            {isGenerating ? <LoadingIndicator icon={Zap} size={18} className="mr-2" /> : <Zap className="mr-2" size={18} />}
            {isGenerating ? 'Architecting...' : 'Generate New Ventures'}
          </Button>

          <button 
            className={cn(
              "px-8 py-3 rounded-xl font-bold transition-all border-2 flex items-center gap-2",
              showTemplates 
                ? "bg-primary text-primary-foreground border-primary" 
                : "bg-background text-foreground border-border hover:border-primary/50"
            )}
            onClick={() => {
              if (!showTemplates && refinedTemplates.length === 0) {
                handleGenerateRefinedTemplates(2);
              }
              setShowTemplates(!showTemplates);
            }}
          >
            <Terminal size={18} />
            {showTemplates ? 'Hide Refined Blueprints' : 'View Refined Blueprints'}
          </button>
        </div>

        {showTemplates && (
          <motion.div 
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="w-full space-y-6"
          >
            <div className="text-center max-w-xl mx-auto mb-8">
              <Badge variant="outline" className="mb-2 border-primary/30 text-primary">Advanced AI Templates</Badge>
              <h3 className="text-xl font-bold">Refined Blueprint Templates</h3>
              <p className="text-sm text-muted-foreground mt-2">
                These ventures have been pre-processed by the Aetheris Architect with original brand names, mission statements, and visual identities specifically designed for their niche. 
                <span className="block mt-1 font-semibold text-foreground/80">Each blueprint is unique and legally distinct for your region.</span>
              </p>
            </div>

            {isTemplatesGenerating && refinedTemplates.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-12 gap-4">
                <LoadingIndicator icon={Loader2} size={32} className="text-primary animate-spin" />
                <p className="text-sm text-muted-foreground animate-pulse">Initializing refined blueprint ecosystem...</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {refinedTemplates.map((idea) => (
                  <ExpandableIdeaCard key={idea.id} idea={idea} onInitiate={async (i) => {
                  await startProject(i);
                  setActiveTab('dashboard');
                }} />
                ))}
                {isTemplatesGenerating && (
                  <div className="p-12 border-2 border-dashed border-border/50 rounded-2xl flex items-center justify-center flex-col gap-3">
                    <LoadingIndicator icon={Loader2} size={20} className="text-primary animate-spin" />
                    <p className="text-[10px] text-muted-foreground">Architecting replacement blueprint...</p>
                  </div>
                )}
              </div>
            )}
          </motion.div>
        )}
      </div>

      <div className="space-y-6">
        <h2 className="text-2xl font-bold font-display px-2">Fresh Discoveries</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {ideas.map((idea, idx) => (
            <ExpandableIdeaCard key={`idea-${idx}`} idea={idea} onInitiate={async (i) => {
              await startProject(i);
              setActiveTab('dashboard');
            }} />
          ))}
          {isGenerating && (
            <div className="p-12 border-2 border-dashed border-border/50 rounded-2xl flex items-center justify-center flex-col gap-3">
              <LoadingIndicator icon={Loader2} size={20} className="text-primary animate-spin" />
              <p className="text-[10px] text-muted-foreground">Drafting new venture concepts...</p>
            </div>
          )}
        </div>
      </div>

      {ideas.length === 0 && !isGenerating && !showTemplates && (
        <div className="text-center py-20 bg-accent/5 rounded-3xl border border-dashed border-accent/20">
          <Zap size={48} className="mx-auto text-accent mb-4 opacity-50" />
          <h3 className="text-lg font-bold">Start your architectural journey</h3>
          <p className="text-sm text-muted-foreground mt-1">Generate raw ideas or explore refined blueprints above.</p>
        </div>
      )}

      {ideas.length > 0 && (
        <Card className="aetheris-card bg-accent/5 border-none">
          <CardContent className="p-6 flex items-center gap-6">
            <div className="w-12 h-12 rounded-full bg-accent/20 flex items-center justify-center shrink-0">
              <Terminal className="text-accent" />
            </div>
            <div>
              <h4 className="font-bold text-accent">Guru Tip: Prompt Injection Prevention</h4>
              <p className="text-sm text-muted-foreground">All generated prompts use delimited instructions to ensure the AI agents remain focused on the business logic and avoid hallucination during the autonomous build phase.</p>
            </div>
          </CardContent>
        </Card>
      )}
    </motion.div>
  );
}
