import React from 'react';
import { motion } from 'motion/react';
import { Bot, Building2 } from 'lucide-react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';

const GLOSSARY_TERMS = {
  platform: [
    { term: "Venture Architect", definition: "The primary tool for ideating, structuring, and generating new business concepts based on user inputs and AI analysis." },
    { term: "Identity Lab", definition: "A workspace to define and refine the brand identity of your venture, including name, logo, and color palette creation." },
    { term: "Mission Control", definition: "The dashboard for monitoring the progress, health, and automation status of your active ventures." },
    { term: "Growth Analytics", definition: "Tools for tracking venture performance, engagement metrics, and automation milestones." },
    { term: "Agent Stack", definition: "The collection of AI-driven agents configured to automate specific tasks within your venture's operational workflow." },
    { term: "Monolith Agent", definition: "A foundational AI agent structure designed to handle specialized, repetitive tasks across the venture's lifecycle." }
  ],
  industry: [
    { term: "Agentic Workflow", definition: "The orchestration of AI agents that automatically execute sequences of tasks to achieve a specific business objective without constant human intervention." },
    { term: "Bootstrapping", definition: "Building and growing a business using only existing personal finances or the operating revenue of the company, with little to no external investment." },
    { term: "Burn Rate", definition: "The rate at which a company consumes its cash reserves to cover operating expenses before achieving positive cash flow." },
    { term: "MVP (Minimum Viable Product)", definition: "A version of a new product that allows a team to collect the maximum amount of validated learning about customers with the least effort." },
    { term: "Prompt Engineering", definition: "The practice of crafting and refining input prompts to guide AI models towards producing more accurate, relevant, or creative outputs." }
  ]
};

/**
 * Render the Knowledge Base page that displays glossary terms grouped by category.
 *
 * Renders a card for each category in the glossary, showing each term and its definition.
 *
 * @returns A React element that displays categorized glossary cards with terms and definitions.
 */
export default function GlossaryView() {
  return (
    <motion.div
      key="glossary"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="max-w-4xl mx-auto space-y-8"
    >
      <div className="space-y-4">
        <h1 className="text-3xl font-bold font-display text-foreground">Knowledge Base</h1>
        <p className="text-muted-foreground">Essential glossary for platform terms and industry jargon.</p>
      </div>

      <div className="grid grid-cols-1 gap-6">
        {Object.entries(GLOSSARY_TERMS).map(([category, terms]) => (
          <Card key={category} className="aetheris-card border-none">
            <CardHeader className="flex flex-row items-center gap-2">
              {category === 'platform' && <Bot className="text-accent" />}
              {category === 'industry' && <Building2 className="text-primary" />}
              <CardTitle className="text-foreground capitalize">{category} Terms</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {terms.map((item, idx) => (
                <div key={idx} className="p-4 rounded-lg bg-secondary/30">
                  <h4 className="font-bold text-foreground mb-1">{item.term}</h4>
                  <p className="text-sm text-muted-foreground">{item.definition}</p>
                </div>
              ))}
            </CardContent>
          </Card>
        ))}
      </div>
    </motion.div>
  );
}
