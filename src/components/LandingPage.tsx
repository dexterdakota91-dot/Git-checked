import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Lightbulb, Palette, LayoutDashboard, Bot, BookOpen, ChevronRight } from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter, DialogClose } from '@/components/ui/dialog';

export function LandingPage({ setActiveTab }: { setActiveTab: (tab: string) => void }) {
  const [isTermsOpen, setIsTermsOpen] = useState(false);

  return (
    <div className="h-full overflow-y-auto p-6 lg:p-12 bg-background">
      <div className="max-w-4xl mx-auto space-y-12">
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
          <div className="flex justify-center gap-4 pt-4">
            <button className="monolith-btn-elevated group" onClick={() => setActiveTab('idea-lab')}>
              Start a New Venture <ChevronRight className="ml-2 group-hover:translate-x-1 transition-transform" size={18} />
            </button>
            <Button size="lg" variant="outline" onClick={() => setIsTermsOpen(true)}>
              <BookOpen className="mr-2" size={18} /> Term Definitions
            </Button>
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

      {/* Term Definitions Dialog */}
      <Dialog open={isTermsOpen} onOpenChange={setIsTermsOpen}>
        <DialogContent className="aetheris-card border-none max-w-3xl">
          <DialogHeader>
            <DialogTitle className="text-2xl font-display">Term Definitions & AI Lingo</DialogTitle>
          </DialogHeader>
          <div className="space-y-6 mt-4">
            <div>
              <h3 className="text-lg font-bold text-primary mb-2">App Terminology</h3>
              <ul className="space-y-3 text-sm text-muted-foreground">
                <li><strong className="text-foreground">Venture:</strong> A business project or startup idea you are building within Aetheris.</li>
                <li><strong className="text-foreground">Venture Architect (Idea Lab):</strong> The workspace where you brainstorm, refine, and initiate new business concepts.</li>
                <li><strong className="text-foreground">Identity Lab:</strong> The branding suite where you generate names, logos, colors, and mission statements.</li>
                <li><strong className="text-foreground">Agentic Team:</strong> A group of specialized AI personas (Architect, Coder, Marketer) assigned to help build your venture.</li>
                <li><strong className="text-foreground">Monolith Logo:</strong> A stylized, abstract logo generated by the system, often representing the core AI or the venture itself.</li>
              </ul>
            </div>
            
            <div>
              <h3 className="text-lg font-bold text-primary mb-2">AI & Tech Lingo</h3>
              <ul className="space-y-3 text-sm text-muted-foreground">
                <li><strong className="text-foreground">Agentic AI:</strong> Artificial intelligence systems that can understand goals, make decisions, and take actions autonomously to achieve those goals.</li>
                <li><strong className="text-foreground">Zero-Capital Business:</strong> A business model designed to be launched with little to no upfront financial investment, heavily leveraging AI and automation.</li>
                <li><strong className="text-foreground">Prompt Engineering:</strong> The practice of carefully crafting the text instructions (prompts) given to an AI to get the most accurate and useful response.</li>
                <li><strong className="text-foreground">LLM (Large Language Model):</strong> The underlying AI technology (like Gemini) that understands and generates human-like text based on massive amounts of training data.</li>
                <li><strong className="text-foreground">System Instructions:</strong> The core, hidden rules given to an AI agent that define its persona, capabilities, and constraints (e.g., telling an AI it is a "Brand Strategist").</li>
              </ul>
            </div>
          </div>
          <DialogFooter showBackButton={true} />
        </DialogContent>
      </Dialog>
    </div>
  );
}
