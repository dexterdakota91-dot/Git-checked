import React, { useState } from 'react';
import { Bot, Terminal, Coffee, Zap, MessageSquare, Brain, Search, Pencil, Settings2, Link, AlertCircle, CheckCircle2 } from 'lucide-react';
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
import { Agent } from '../types';
import { ARCHETYPES } from '../constants/mockData';
import { cn } from '@/lib/utils';
import { buttonVariants } from '@/components/ui/button';
import { useStore } from '../store/useStore';

const getAgentIcon = (archetype?: string) => {
  switch (archetype) {
    case 'architect': return <Brain className="w-6 h-6" />;
    case 'scraper': return <Search className="w-6 h-6" />;
    case 'copywriter': return <Pencil className="w-6 h-6" />;
    case 'automator': return <Link className="w-6 h-6" />;
    case 'researcher': return <Search className="w-6 h-6" />;
    case 'optimizer': return <Settings2 className="w-6 h-6" />;
    case 'growth-hacker': return <Zap className="w-6 h-6" />;
    default: return <Bot className="w-6 h-6" />;
  }
};

const getStatusIndicator = (status: Agent['status']) => {
  switch (status) {
    case 'idle':
      return <div className="flex items-center gap-1.5 text-muted-foreground"><Coffee size={12} /> Idle</div>;
    case 'working':
    case 'busy':
      return <div className="flex items-center gap-1.5 text-primary"><Zap size={12} className="animate-pulse" /> {status === 'busy' ? 'Busy' : 'Working'}</div>;
    case 'thinking':
      return <div className="flex items-center gap-1.5 text-blue-400"><Brain size={12} className="animate-pulse" /> Thinking...</div>;
    case 'waiting-for-input':
      return <div className="flex items-center gap-1.5 text-amber-500"><MessageSquare size={12} className="animate-bounce" /> Awaiting Input</div>;
    default:
      return <div className="flex items-center gap-1.5 text-muted-foreground"><div className="w-2 h-2 rounded-full bg-muted" /> <span className="capitalize">{status}</span></div>;
  }
};

/**
 * Render an interactive agent summary card that opens a configuration dialog.
 *
 * The card shows the agent's icon, status, current task, specialty, and capabilities,
 * and provides controls to edit the agent's name, select an archetype/role, toggle debug mode,
 * and resolve awaiting user input when applicable.
 *
 * @param agent - Agent data used to populate the card and configuration controls
 * @param projectId - Project identifier passed to update operations
 * @returns The rendered React element for the agent card and its configuration dialog
 */
export function AgentCard({ agent, projectId }: { agent: Agent, projectId: string }) {
  const [newName, setNewName] = useState(agent.name);
  const [isSaving, setIsSaving] = useState(false);
  const [userResponse, setUserResponse] = useState('');
  const { updateAgent } = useStore();
  
  // Extend Agent type in usage if needed, but for now map based on state
  const displayStatus = agent.status as Agent['status'] | 'waiting-for-input';
  
  const handleSaveName = () => {
    setIsSaving(true);
    updateAgent(projectId, agent.id, { name: newName });
    setTimeout(() => setIsSaving(false), 1000);
  };

  const handleResolveInput = () => {
    if (!userResponse.trim()) return;
    
    // Simulate updating the agent back to working after receiving user input
    updateAgent(projectId, agent.id, { 
      status: 'thinking', 
      currentTask: 'Processing user feedback...' 
    });
    
    setUserResponse('');

    setTimeout(() => {
      updateAgent(projectId, agent.id, { 
        status: 'working', 
        currentTask: 'Executing on user instructions' 
      });
    }, 2000);
  };
  
  const handleDebugModeChange = (checked: boolean) => {
    updateAgent(projectId, agent.id, { debugMode: checked });
  };

  const handleArchetypeChange = (id: string, role: string) => {
    updateAgent(projectId, agent.id, { archetype: id, role });
  };

  return (
    <Dialog>
      <DialogTrigger nativeButton={false} render={
        <div className="aetheris-card hover:scale-[1.02] transition-all cursor-pointer group border border-border rounded-xl mx-auto w-full">
          <CardContent className="p-4 flex items-center gap-4">
            <div className="relative">
              <Avatar className="w-12 h-12 border border-accent/30 bg-secondary flex items-center justify-center">
                <div className="text-primary">{getAgentIcon(agent.archetype)}</div>
              </Avatar>
              <div className={cn(
                "absolute bottom-0 right-0 w-3 h-3 rounded-full border-2 border-background",
                (agent.status === 'working' || agent.status === 'busy') ? "bg-primary animate-pulse" : 
                agent.status === 'thinking' ? "bg-blue-400 animate-pulse" :
                agent.status === 'waiting-for-input' ? "bg-amber-500 animate-bounce" : "bg-muted"
              )} />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-bold truncate group-hover:text-primary transition-colors">{agent.name}</p>
              <p className="text-[10px] text-muted-foreground truncate uppercase tracking-wider">{agent.archetype || agent.role}</p>
              <div className="text-[10px] mt-1">{getStatusIndicator(displayStatus)}</div>
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
            {getAgentIcon(agent.archetype)} Agent Configuration
          </DialogTitle>
          <DialogDescription className="text-muted-foreground">Customize agent identity and behavior</DialogDescription>
        </DialogHeader>
        <div className="space-y-6 py-4">
          
          {agent.status === 'waiting-for-input' && (
            <div className="p-4 rounded-xl bg-amber-500/10 border border-amber-500/20 text-amber-500 flex flex-col gap-3">
              <div className="flex gap-2 items-center font-semibold text-sm">
                <AlertCircle size={16} /> Action Required
              </div>
              <p className="text-xs">{agent.currentTask || 'This agent is blocked and waiting for your feedback.'}</p>
              
              <div className="flex gap-2 mt-2">
                <Input 
                  value={userResponse}
                  onChange={(e) => setUserResponse(e.target.value)}
                  placeholder="Enter your response..." 
                  className="bg-background/50 border-amber-500/30 focus-visible:ring-amber-500/50 text-foreground" 
                />
                <Button size="sm" onClick={handleResolveInput} className="bg-amber-500 hover:bg-amber-600 text-white">
                  Resolve
                </Button>
              </div>
            </div>
          )}

          <div className="space-y-2">
            <label className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Agent Name</label>
            <div className="flex gap-2">
              <Input 
                value={newName} 
                onChange={(e) => setNewName(e.target.value)}
                className="bg-background/50 border-accent/20"
              />
              <Button variant="secondary" size="sm" onClick={handleSaveName}>
                {isSaving ? 'Saved!' : 'Save'}
              </Button>
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
                  onClick={() => handleArchetypeChange(arch.id, arch.role)}
                  className={cn(
                    "p-3 rounded-xl border text-left transition-all",
                    agent.archetype === arch.id ? "bg-primary/10 border-primary" : "bg-background/30 border-accent/10 hover:border-primary/50"
                  )}
                >
                  <p className="text-sm font-bold flex items-center gap-2">{getAgentIcon(arch.id)} {arch.name}</p>
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
              onCheckedChange={handleDebugModeChange}
            />
          </div>
        </div>
        <div className="flex justify-end gap-2 pt-4 border-t border-accent/10">
          <DialogClose className={buttonVariants({ variant: 'outline' })}>Close</DialogClose>
        </div>
      </DialogContent>
    </Dialog>
  );
}
