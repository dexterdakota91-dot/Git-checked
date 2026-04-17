import React from 'react';
import { motion } from 'motion/react';
import { Settings, ArrowUpRight, CreditCard, Zap, TrendingUp } from 'lucide-react';
import { Button, buttonVariants } from '@/components/ui/button';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogTrigger, DialogFooter, DialogClose } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Separator } from '@/components/ui/separator';
import { ScrollArea } from '@/components/ui/scroll-area';
import { cn } from '@/lib/utils';
import { useStore } from '../../store/useStore';
import { Project } from '../../types';

// Components
import { MonolithLogo, OrbitLogo, PrismLogo } from '../logos/LogoComponents';
import { AgentCard } from '../AgentCard';
import { ExpandableVentureDescription } from '../ExpandableVentureDescription';
import { TaskManagement } from '../TaskManagement';
import { ElectricityTracer } from '../ElectricityTracer';
import { DeleteVentureButton } from '../DeleteVentureButton';

interface ProjectDetailViewProps {
  selectedProject: Project;
  setActiveTab: (tab: string) => void;
  projects: Project[];
  setProjects: (projects: Project[]) => void;
  deleteProject: (id: string) => void;
  addStripeIntegration: (id: string) => void;
  handleUpdateTasks: (projectId: string, updatedTasks: any[]) => void;
}

export default function ProjectDetailView({ 
  selectedProject, 
  setActiveTab, 
  projects, 
  setProjects, 
  deleteProject,
  addStripeIntegration,
  handleUpdateTasks
}: ProjectDetailViewProps) {
  const { 
    isVentureSettingsOpen, 
    setIsVentureSettingsOpen,
    setActiveLabTab
  } = useStore();

  const handleStripeCheckout = async (amount: number, projectName: string) => {
    try {
      const response = await fetch('/api/stripe/create-checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ amount, projectName }),
      });
      
      const contentType = response.headers.get("content-type");
      if (!contentType || !contentType.includes("application/json")) {
        throw new Error("Received non-JSON response from server");
      }

      const data = await response.json();
      if (data.url) {
        window.location.href = data.url;
      }
    } catch (error) {
      console.error("Stripe Checkout Error:", error);
    }
  };

  const [editedVentureName, setEditedVentureName] = React.useState(selectedProject.name);
  const [editedVentureDescription, setEditedVentureDescription] = React.useState(selectedProject.description);
  const [committedVentureName, setCommittedVentureName] = React.useState(selectedProject.name);
  const [committedVentureDescription, setCommittedVentureDescription] = React.useState(selectedProject.description);

  const goToLab = (tab: 'brand' | 'naming' | 'market') => {
    setActiveLabTab(tab);
    setActiveTab('branding');
    setIsVentureSettingsOpen(false);
  };

  const selectLogoType = (type: 'monolith' | 'orbit' | 'prism') => {
    // This should ideally be handled via a store action or passed prop
    // For now, we'll just log it or handle it if we add the function
    console.log('Selected logo type:', type);
  };

  const saveVentureDetails = () => {
    // Implement save logic here
    setIsVentureSettingsOpen(false);
  };

  return (
    <motion.div
      key="project-detail"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      className="space-y-8"
    >
      <div className="flex items-center justify-between">
        <div className="space-y-1">
          <div className="flex items-center gap-3">
            <h1 className="text-3xl font-bold font-display">{selectedProject.name}</h1>
            <div className="w-48 space-y-1">
              <div className="flex justify-between text-[10px] text-muted-foreground uppercase tracking-wider">
                <span>Progress</span>
                <span>{Math.round((selectedProject.tasks.filter(t => t.status === 'completed').length / (selectedProject.tasks.length || 1)) * 100)}%</span>
              </div>
              <div className="h-1.5 w-full bg-accent/20 rounded-full overflow-hidden">
                <div 
                  className="h-full bg-primary transition-all duration-500" 
                  style={{ width: `${(selectedProject.tasks.filter(t => t.status === 'completed').length / (selectedProject.tasks.length || 1)) * 100}%` }} 
                />
              </div>
            </div>
            <Dialog 
              open={isVentureSettingsOpen} 
              onOpenChange={(open) => {
                setIsVentureSettingsOpen(open);
                if (open && selectedProject) {
                  setEditedVentureName(selectedProject.name);
                  setEditedVentureDescription(selectedProject.description);
                  setCommittedVentureName(selectedProject.name);
                  setCommittedVentureDescription(selectedProject.description);
                }
              }}
            >
              <DialogTrigger nativeButton={true} render={
                <button className={cn(buttonVariants({ variant: 'ghost', size: 'icon' }), "text-muted-foreground hover:text-primary")}>
                  <Settings size={20} />
                </button>
              } />
              <DialogContent className="aetheris-card max-w-2xl border-none">
                <DialogHeader>
                  <DialogTitle>Venture Settings: {selectedProject.name}</DialogTitle>
                  <DialogDescription>Manually override AI-generated venture parameters</DialogDescription>
                </DialogHeader>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 py-4">
                  <div className="space-y-4">
                    <div className="space-y-2">
                      <div className="flex items-center justify-between">
                        <label className="text-xs font-bold uppercase text-muted-foreground">Venture Name</label>
                        <Button 
                          variant="ghost" 
                          size="xs" 
                          className="text-[10px] h-6 text-primary hover:bg-primary/10"
                          onClick={() => goToLab('naming')}
                        >
                          <ArrowUpRight size={12} className="mr-1" /> Go to Lab
                        </Button>
                      </div>
                      <Input 
                        value={editedVentureName} 
                        onChange={(e) => setEditedVentureName(e.target.value)}
                        onBlur={() => setCommittedVentureName(editedVentureName)}
                        className="bg-background/50 border-accent/20"
                      />
                    </div>
                    <div className="space-y-2">
                      <div className="flex items-center justify-between">
                        <label className="text-xs font-bold uppercase text-muted-foreground">Description</label>
                        <Button 
                          variant="ghost" 
                          size="xs" 
                          className="text-[10px] h-6 text-primary hover:bg-primary/10"
                          onClick={() => goToLab('brand')}
                        >
                          <ArrowUpRight size={12} className="mr-1" /> Go to Lab
                        </Button>
                      </div>
                      <textarea 
                        className="w-full bg-background/50 border border-accent/20 rounded-md p-3 text-sm h-24"
                        value={editedVentureDescription}
                        onChange={(e) => setEditedVentureDescription(e.target.value)}
                        onBlur={() => setCommittedVentureDescription(editedVentureDescription)}
                      />
                    </div>
                  </div>
                  <div className="space-y-4">
                    <div className="space-y-2">
                      <label className="text-xs font-bold uppercase text-muted-foreground">Banking (Plaid)</label>
                      <div className="p-4 rounded-xl bg-background/30 border border-accent/10 space-y-3">
                        <p className="text-xs text-muted-foreground">Connect a specific account for this venture's revenue stream.</p>
                        <Button variant="outline" className="w-full border-primary/30 text-primary hover:bg-primary/10 h-8 text-xs">
                          Link Venture Bank
                        </Button>
                      </div>
                    </div>
                    <div className="space-y-2">
                      <div className="flex items-center justify-between">
                        <label className="text-xs font-bold uppercase text-muted-foreground">Logo Type</label>
                        <Button 
                          variant="ghost" 
                          size="xs" 
                          className="text-[10px] h-6 text-primary hover:bg-primary/10"
                          onClick={() => goToLab('brand')}
                        >
                          <ArrowUpRight size={12} className="mr-1" /> Go to Lab
                        </Button>
                      </div>
                      <div className="flex gap-2">
                        {['monolith', 'orbit', 'prism'].map((type: any) => (
                          <Button 
                            key={type}
                            variant={selectedProject.branding?.logoType === type ? 'default' : 'outline'}
                            size="sm"
                            className="flex-1 capitalize"
                            onClick={() => selectLogoType(type)}
                          >
                            {type}
                          </Button>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
                <DialogFooter className="border-t border-accent/10 pt-4 flex justify-between items-center w-full">
                  <div className="flex-1">
                    <DeleteVentureButton 
                      projectId={selectedProject.id} 
                      onDelete={(id) => {
                        deleteProject(id);
                        setIsVentureSettingsOpen(false);
                      }} 
                    />
                  </div>
                  <div className="flex gap-2">
                    <DialogClose className={buttonVariants({ variant: 'outline' })}>Cancel</DialogClose>
                    <Button variant="secondary" onClick={saveVentureDetails} className="electric-glow">Save Changes</Button>
                  </div>
                </DialogFooter>
              </DialogContent>
            </Dialog>
          </div>
          <ExpandableVentureDescription project={selectedProject} />
        </div>
        <div className="flex items-center gap-4 p-4 rounded-2xl bg-secondary/30 border border-border/50 aetheris-card">
          <div className="text-right">
            <p className="text-[10px] uppercase text-muted-foreground tracking-widest">Agent Stack</p>
            <p className="text-xs font-medium text-primary">Live Monitoring</p>
          </div>
          <MonolithLogo size={50} agents={selectedProject.agents} logoType={selectedProject.branding?.logoType} />
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left Column: Agents & Tasks */}
        <div className="lg:col-span-2 space-y-8">
          {/* Agents Grid */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {selectedProject.agents.map(agent => (
              <AgentCard 
                key={agent.id} 
                agent={agent} 
                projectId={selectedProject.id} 
                projects={projects} 
                setProjects={setProjects} 
              />
            ))}
          </div>

          {/* Task Management System */}
          <TaskManagement 
            project={selectedProject} 
            onUpdateTasks={(updatedTasks) => handleUpdateTasks(selectedProject.id, updatedTasks)} 
          />
        </div>

        {/* Right Column: Logs & Metrics */}
        <div className="space-y-8">
          <Card className="aetheris-card relative">
            <ElectricityTracer color="red" duration={12} />
            <CardHeader>
              <CardTitle className="text-lg">Live Console</CardTitle>
              <CardDescription>Real-time agentic event stream</CardDescription>
            </CardHeader>
            <CardContent>
              <ScrollArea className="h-[400px] pr-4">
                <div className="space-y-4 font-mono text-[11px]">
                  {selectedProject.logs.map(log => {
                    const agent = selectedProject.agents.find(a => a.id === log.agentId);
                    if ((log.type === 'thought' || log.type === 'decision') && !agent?.debugMode) return null;
                    
                    return (
                      <div key={log.id} className="flex gap-3 animate-in fade-in slide-in-from-left-1">
                        <span className="text-muted-foreground shrink-0">[{new Date(log.timestamp).toLocaleTimeString()}]</span>
                        <div className="flex flex-col gap-1">
                          <span className={cn(
                            "font-bold uppercase text-[9px]",
                            log.type === 'success' ? "text-primary" : 
                            log.type === 'error' ? "text-destructive" : 
                            log.type === 'thought' ? "text-accent" :
                            log.type === 'decision' ? "text-blue-400" : "text-muted-foreground"
                          )}>
                            {log.type} {agent ? `(${agent.name})` : ''}
                          </span>
                          <span className={cn(
                            log.type === 'error' ? "text-destructive" : "text-foreground"
                          )}>
                            {log.message}
                          </span>
                          {log.details && (
                            <div className="p-2 rounded bg-black/20 text-[10px] text-muted-foreground border-l-2 border-muted">
                              {log.details}
                            </div>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </ScrollArea>
            </CardContent>
          </Card>

          <Card className="aetheris-card bg-primary/5 overflow-hidden relative">
            <div className="absolute top-0 right-0 p-4 opacity-10">
              <TrendingUp size={64} className="text-primary" />
            </div>
            <CardHeader>
              <CardTitle className="text-lg">Project Health</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Automation Level</span>
                  <span className="font-bold text-primary">98%</span>
                </div>
                <Progress value={98} className="h-1.5 bg-primary/10" />
              </div>
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Revenue Efficiency</span>
                  <span className="font-bold text-primary">84%</span>
                </div>
                <Progress value={84} className="h-1.5 bg-primary/10" />
              </div>
              <Separator className="bg-primary/10" />
              <div className="flex justify-between items-end">
                <div>
                  <p className="text-xs text-muted-foreground uppercase tracking-wider">Projected ARR</p>
                  <p className="text-2xl font-bold text-primary">${(selectedProject.revenue * 12).toLocaleString()}</p>
                </div>
                <div className="flex flex-col gap-2 items-end">
                  <Badge className="bg-primary text-primary-foreground electric-glow">Scalable</Badge>
                  <div className="flex gap-2">
                    {!selectedProject.tasks.find(t => t.title === 'Stripe Integration') && (
                      <Button size="xs" variant="outline" className="text-[10px] h-7 border-accent/30 text-accent hover:bg-accent/10" onClick={() => addStripeIntegration(selectedProject.id)}>
                        <CreditCard size={12} className="mr-1" /> Add Stripe
                      </Button>
                    )}
                    <Button 
                      size="xs" 
                      className="text-[10px] h-7 bg-blue-600 hover:bg-blue-700 text-white" 
                      onClick={() => handleStripeCheckout(50000, selectedProject.name)}
                    >
                      <Zap size={12} className="mr-1" /> Fund Venture ($500)
                    </Button>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </motion.div>
  );
}
