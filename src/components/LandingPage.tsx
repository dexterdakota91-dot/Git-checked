import React from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Lightbulb, Palette, LayoutDashboard, Bot, ChevronRight, Play } from 'lucide-react';
import { useStore } from '../store/useStore';

export function LandingPage({ setActiveTab }: { setActiveTab: (tab: string) => void }) {
  const { projects, selectedProject } = useStore();

  return (
    <div className="h-full overflow-y-auto p-6 lg:p-12 bg-background scroll-smooth">
      <div className="max-w-4xl mx-auto space-y-12 pb-20">
        {/* Hero Section */}
        <div className="text-center space-y-6">
          <h1 className="text-4xl md:text-6xl font-display font-bold tracking-tighter">
            Welcome to
            <br />
            <span className="block text-primary mt-2 animate-pulse-glow">Aetheris Ventures</span>
          </h1>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            Your AI-powered command center for brainstorming, architecting, and launching zero-capital businesses.
          </p>
          <div className="flex flex-col sm:flex-row justify-center gap-4 pt-4 min-h-[64px]">
            {projects && projects.length > 0 && (
              <button className="monolith-btn-elevated group" onClick={() => setActiveTab('dashboard')}>
                <Play className="mr-2 inline-block" size={18} /> Continue {selectedProject?.branding?.selectedName || selectedProject?.name || projects[0]?.name || 'Venture'}
              </button>
            )}
            <button className="monolith-btn-elevated group bg-secondary/80 text-foreground border border-accent/20 hover:border-primary/50" onClick={() => setActiveTab('idea-lab')}>
              Start a New Venture <ChevronRight className="ml-2 group-hover:translate-x-1 transition-transform" size={18} />
            </button>
          </div>
        </div>

        {/* Walkthrough Section */}
        <div className="space-y-8">
          <div className="text-center">
            <h2 className="text-3xl font-display font-bold">How It Works</h2>
            <p className="text-muted-foreground mt-2">The general production flow of Aetheris Ventures</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card className="aetheris-card border-none bg-secondary/20">
              <CardHeader>
                <div className="w-12 h-12 rounded-lg bg-primary/20 flex items-center justify-center mb-4 text-primary">
                  <Lightbulb size={24} />
                </div>
                <CardTitle>1. Venture Architect</CardTitle>
                <CardDescription>Brainstorm and define your business idea.</CardDescription>
              </CardHeader>
              <CardContent className="text-sm text-muted-foreground">
                Start in the Venture Architect (Idea Lab) to generate AI-driven business models. Refine your concept, target audience, and revenue strategy until you have a solid foundation.
              </CardContent>
            </Card>

            <Card className="aetheris-card border-none bg-secondary/20">
              <CardHeader>
                <div className="w-12 h-12 rounded-lg bg-primary/20 flex items-center justify-center mb-4 text-primary">
                  <Palette size={24} />
                </div>
                <CardTitle>2. Identity Lab</CardTitle>
                <CardDescription>Craft your brand identity.</CardDescription>
              </CardHeader>
              <CardContent className="text-sm text-muted-foreground">
                Once your idea is initiated, head to the Identity Lab. Here, AI helps you generate a unique brand name, mission statement, color palette, and logo style to make your venture stand out.
              </CardContent>
            </Card>

            <Card className="aetheris-card border-none bg-secondary/20">
              <CardHeader>
                <div className="w-12 h-12 rounded-lg bg-primary/20 flex items-center justify-center mb-4 text-primary">
                  <LayoutDashboard size={24} />
                </div>
                <CardTitle>3. Venture Dashboard</CardTitle>
                <CardDescription>Manage your project and tasks.</CardDescription>
              </CardHeader>
              <CardContent className="text-sm text-muted-foreground">
                The Dashboard is your central hub. View your project's progress, manage AI-generated tasks, and keep track of your venture's overall health and milestones.
              </CardContent>
            </Card>

            <Card className="aetheris-card border-none bg-secondary/20">
              <CardHeader>
                <div className="w-12 h-12 rounded-lg bg-primary/20 flex items-center justify-center mb-4 text-primary">
                  <Bot size={24} />
                </div>
                <CardTitle>4. Agentic Team</CardTitle>
                <CardDescription>Collaborate with specialized AI agents.</CardDescription>
              </CardHeader>
              <CardContent className="text-sm text-muted-foreground">
                Work with your dedicated AI team—the Architect, Coder, and Marketer. They will help you build out the technical strategy, write code, and create marketing campaigns.
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}
