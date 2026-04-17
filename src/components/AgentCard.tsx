import React, { useState } from 'react';
import { Bot, Terminal } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Switch } from '@/components/ui/switch';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogClose,
} from "@/components/ui/dialog";
import { X } from 'lucide-react';
import { Agent, Project } from '../types';
import { ARCHETYPES } from '../constants/mockData';
import { cn } from '@/lib/utils';
import { buttonVariants } from '@/components/ui/button';

export function AgentCard({ agent, projectId, projects, setProjects }: { agent: Agent, projectId: string, projects: Project[], setProjects: (p: Project[]) => void, key?: string }) {
  const [newName, setNewName] = useState(agent.name);

  const updateAgent = (updates: Partial<Agent>) => {
    const updatedProjects = projects.map(p => {
      if (p.id === projectId) {
        return {
          ...p,
          agents: p.agents.map(a => a.id === agent.id ? { ...a, ...updates } : a)
        };
      }
      return p;
    });
    setProjects(updatedProjects);
  };

  return (
    <Dialog>
      <DialogTrigger nativeButton={false} render={
        <div className="aetheris-card hover:scale-[1.02] transition-all cursor-pointer group border border-border rounded-xl">
          <CardContent className="p-4 flex items-center gap-4">
            <div className="relative">
              <Avatar className="w-12 h-12 border border-accent/30">
                <AvatarFallback className="bg-secondary text-foreground">{agent.name[0]}</AvatarFallback>
              </Avatar>
              <div className={cn(
                "absolute bottom-0 right-0 w-3 h-3 rounded-full border-2 border-background",
                agent.status === 'working' ? "bg-primary animate-pulse" : "bg-muted"
              )} />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-bold truncate group-hover:text-primary transition-colors">{agent.name}</p>
              <p className="text-[10px] text-muted-foreground truncate uppercase tracking-wider">{agent.archetype || agent.role}</p>
            </div>
          </CardContent>
          {agent.currentTask && (
            <div className="px-4 pb-4">
              <div className="text-[10px] uppercase text-muted-foreground mb-1">Current Task</div>
              <div className="text-xs truncate italic">"{agent.currentTask}"</div>
            </div>
          )}
        </div>
      } />
      <DialogContent className="aetheris-card max-w-md border-none">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-foreground">
            <Bot className="text-primary" /> Agent Configuration
          </DialogTitle>
          <DialogDescription className="text-muted-foreground">Customize agent identity and behavior</DialogDescription>
        </DialogHeader>
        <div className="space-y-6 py-4">
          <div className="space-y-2">
            <label className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Agent Name</label>
            <div className="flex gap-2">
              <Input 
                value={newName} 
                onChange={(e) => setNewName(e.target.value)}
                className="bg-background/50 border-accent/20"
              />
              <Button variant="secondary" size="sm" onClick={() => updateAgent({ name: newName })}>Save</Button>
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Specialty</label>
            <p className="text-sm font-medium text-primary">{agent.specialty || 'Generalist'}</p>
          </div>

          {agent.capabilities && agent.capabilities.length > 0 && (
            <div className="space-y-2">
              <label className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Capabilities</label>
              <div className="flex flex-wrap gap-2">
                {agent.capabilities.map((cap, i) => (
                  <span key={i} className="text-[10px] px-2 py-1 rounded-full bg-accent/10 border border-accent/20 text-muted-foreground">
                    {cap}
                  </span>
                ))}
              </div>
            </div>
          )}

          <div className="space-y-2">
            <label className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Archetype</label>
            <div className="grid grid-cols-1 gap-2 max-h-[300px] overflow-y-auto pr-2">
              {ARCHETYPES.map(arch => (
                <button
                  key={arch.id}
                  onClick={() => updateAgent({ archetype: arch.id, role: arch.role })}
                  className={cn(
                    "p-3 rounded-xl border text-left transition-all",
                    agent.archetype === arch.id ? "bg-primary/10 border-primary" : "bg-background/30 border-accent/10 hover:border-primary/50"
                  )}
                >
                  <p className="text-sm font-bold">{arch.name}</p>
                  <p className="text-[10px] text-muted-foreground">{arch.description}</p>
                </button>
              ))}
            </div>
          </div>

          <div className="flex items-center justify-between p-4 rounded-xl bg-accent/5 border border-accent/20">
            <div className="space-y-0.5">
              <p className="text-sm font-bold flex items-center gap-2">
                <Terminal size={14} className="text-accent" /> Debugging Mode
              </p>
              <p className="text-[10px] text-muted-foreground">Expose internal thought processes in Live Console</p>
            </div>
            <Switch 
              checked={agent.debugMode} 
              onCheckedChange={(checked) => updateAgent({ debugMode: checked })}
            />
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
