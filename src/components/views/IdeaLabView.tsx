import React from 'react';
import { motion } from 'motion/react';
import { Zap, Terminal } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { LoadingIndicator } from '../LoadingIndicator';
import { ExpandableIdeaCard } from '../ExpandableIdeaCard';
import { useStore } from '../../store/useStore';
import { generateBusinessIdeas } from '../../services/gemini';
import { BusinessIdea } from '../../types';

interface IdeaLabViewProps {
  startProject: (idea: BusinessIdea) => Promise<void>;
}

export default function IdeaLabView({ startProject }: IdeaLabViewProps) {
  const { ideas, setIdeas, isGenerating, setIsGenerating } = useStore();

  const handleGenerateIdeas = async () => {
    setIsGenerating(true);
    try {
      const newIdeas = await generateBusinessIdeas();
      if (newIdeas && newIdeas.length > 0) {
        setIdeas([...newIdeas, ...ideas]);
      }
    } catch (error) {
      console.error("Failed to generate ideas:", error);
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <motion.div
      key="idea-lab"
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.95 }}
      className="max-w-6xl mx-auto space-y-8"
    >
      <div className="text-center space-y-4">
        <h1 className="text-4xl font-bold font-display text-foreground">Venture Architect</h1>
        <p className="text-muted-foreground text-lg">Generate and refine novel, 0-capital business models optimized for AI automation.</p>
      </div>

      <div className="flex justify-center">
        <Button 
          variant="secondary"
          size="lg" 
          className="electric-glow px-8" 
          onClick={handleGenerateIdeas}
          disabled={isGenerating}
        >
          {isGenerating ? <LoadingIndicator icon={Zap} size={18} className="mr-2" /> : <Zap className="mr-2" size={18} />}
          {isGenerating ? 'Architecting Ideas...' : 'Generate New Ventures'}
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {ideas.map((idea, idx) => (
          <ExpandableIdeaCard key={idx} idea={idea} onInitiate={startProject} />
        ))}
      </div>

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
