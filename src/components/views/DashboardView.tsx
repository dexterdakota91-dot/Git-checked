import React from 'react';
import { motion } from 'motion/react';
import { 
  LayoutDashboard, 
  TrendingUp, 
  Lightbulb, 
  DollarSign, 
  Users,
  ChevronRight
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { ScrollArea } from '@/components/ui/scroll-area';
import { cn } from '@/lib/utils';
import { 
  AreaChart, 
  Area, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer 
} from 'recharts';
import { StatCard } from '../StatCard';
import { Project } from '../../types';
import { REVENUE_DATA } from '../../constants/mockData';

interface DashboardViewProps {
  projects: Project[];
  selectedProject: Project | null;
  setActiveTab: (tab: string) => void;
  setSelectedProject: (project: Project | null) => void;
}

export default function DashboardView({ projects, selectedProject, setActiveTab, setSelectedProject }: DashboardViewProps) {
  return (
    <motion.div
      key="dashboard"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      className="space-y-12"
    >
      {/* Dashboard Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
        <div className="space-y-2">
          <h1 className="text-4xl font-bold font-display tracking-tight text-foreground">Mission Control</h1>
          <p className="text-muted-foreground text-lg">Autonomous venture oversight & agentic coordination.</p>
        </div>
        <div className="flex items-center gap-3">
          {selectedProject && selectedProject.branding?.selectedName && (
            <Button variant="secondary" className="electric-glow" onClick={() => setActiveTab('venture-dashboard')}>
              <LayoutDashboard size={18} className="mr-2" /> 
              Venture Dashboard
            </Button>
          )}
          <Button variant="outline" className="aetheris-card border-none" onClick={() => setActiveTab('analytics')}>
            <TrendingUp size={18} className="mr-2 text-primary" /> 
            View Detailed Analytics <ChevronRight size={14} className="ml-1" />
          </Button>
        </div>
      </div>

      {projects.length === 0 ? (
        <div className="h-[60vh] flex flex-col items-center justify-center text-center space-y-6">
          <div className="w-20 h-20 rounded-3xl bg-primary/10 flex items-center justify-center electric-glow">
            <Lightbulb size={40} className="text-primary" />
          </div>
          <div className="space-y-2 max-w-md">
            <h2 className="text-2xl font-bold font-display">No Active Ventures</h2>
            <p className="text-muted-foreground">Your dashboard will populate once you've initiated a project from the Idea Lab.</p>
          </div>
          <Button variant="secondary" size="lg" className="electric-glow" onClick={() => setActiveTab('idea-lab')}>
            Go to Idea Lab
          </Button>
        </div>
      ) : (
        <>
          {/* High Level Summary */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <StatCard 
              title="Total Revenue" 
              value={`${projects.reduce((acc, p) => acc + (p.revenue || 0), 0).toLocaleString()}`} 
              trend="+12.5%" 
              icon={<DollarSign className="text-primary" />} 
              withBeam
            />
            <StatCard 
              title="Active Agents" 
              value={projects.reduce((acc, p) => acc + (p.agents?.length || 0), 0).toString()} 
              trend="Running" 
              icon={<Users className="text-accent" />} 
            />
            <StatCard 
              title="Success Rate" 
              value="94%" 
              trend="+2.1%" 
              icon={<TrendingUp className="text-primary" />} 
            />
          </div>

          {/* Charts & Activity */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <Card className="lg:col-span-2 aetheris-card min-w-0">
              <CardHeader className="pb-2">
                <CardTitle className="text-lg font-medium">Revenue Growth</CardTitle>
              </CardHeader>
              <CardContent className="h-[200px] relative min-w-0">
                <div className="absolute inset-0 pb-6 pr-6 pl-2 pt-2">
                  <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={REVENUE_DATA}>
                    <defs>
                      <linearGradient id="colorValueDash" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#0066FF" stopOpacity={0.3}/>
                        <stop offset="95%" stopColor="#0066FF" stopOpacity={0}/>
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" stroke="#262626" vertical={false} />
                    <XAxis dataKey="name" stroke="#525252" fontSize={10} tickLine={false} axisLine={false} />
                    <YAxis stroke="#525252" fontSize={10} tickLine={false} axisLine={false} tickFormatter={(v) => `${v}`} />
                    <Tooltip 
                      contentStyle={{ backgroundColor: '#171717', border: 'none', borderRadius: '8px', color: '#fff', fontSize: '10px' }}
                      itemStyle={{ color: '#0066FF' }}
                    />
                    <Area type="monotone" dataKey="value" stroke="#0066FF" fillOpacity={1} fill="url(#colorValueDash)" strokeWidth={2} />
                  </AreaChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>

            <Card className="aetheris-card">
              <CardHeader className="pb-2">
                <CardTitle className="text-lg font-medium">Recent Events</CardTitle>
              </CardHeader>
              <CardContent>
                <ScrollArea className="h-[200px] pr-4">
                  <div className="space-y-4">
                    {projects.flatMap(p => p.logs.slice(0, 3).map(l => ({ ...l, projectName: p.name, projectId: p.id }))).sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()).slice(0, 5).map(log => (
                      <div key={`${log.projectId}-${log.id}`} className="flex gap-3">
                        <div className={cn(
                          "w-1 h-8 rounded-full",
                          log.type === 'success' ? "bg-primary" : "bg-muted"
                        )} />
                        <div className="flex-1">
                          <p className="text-[10px] text-muted-foreground">{new Date(log.timestamp).toLocaleTimeString()}</p>
                          <p className="text-xs font-medium truncate">{log.projectName}</p>
                          <p className="text-[10px] text-muted-foreground line-clamp-1">{log.message}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </ScrollArea>
              </CardContent>
            </Card>
          </div>

          {/* Project List */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-xl font-bold font-display">Active Ventures</h3>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {projects.map(p => (
                <Card 
                  key={p.id} 
                  className="aetheris-card hover:scale-[1.01] transition-all cursor-pointer group"
                  onClick={() => {
                    setSelectedProject(p);
                    setActiveTab('project-detail');
                  }}
                >
                  <CardContent className="p-6">
                    <div className="flex justify-between items-start mb-4">
                      <div>
                        <h4 className="text-lg font-bold group-hover:text-primary transition-colors">{p.name}</h4>
                        <p className="text-sm text-muted-foreground line-clamp-1">{p.description}</p>
                      </div>
                      <Badge className={cn(
                        p.status === 'scaling' ? "bg-primary/20 text-primary" : "bg-accent/20 text-accent"
                      )}>
                        {p.status}
                      </Badge>
                    </div>
                    <div className="flex items-center gap-6">
                      <div>
                        <p className="text-xs text-muted-foreground uppercase tracking-wider">Revenue</p>
                        <p className="text-lg font-bold text-primary">${p.revenue.toLocaleString()}</p>
                      </div>
                      <div>
                        <p className="text-xs text-muted-foreground uppercase tracking-wider">Growth</p>
                        <p className="text-lg font-bold">+{p.growth}%</p>
                      </div>
                      <div className="flex -space-x-2 ml-auto">
                        {p.agents.map(a => (
                          <Avatar key={a.id} className="w-8 h-8 border-2 border-background">
                            <AvatarFallback className="bg-secondary text-[10px]">{a.name[0]}</AvatarFallback>
                          </Avatar>
                        ))}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </>
      )}
    </motion.div>
  );
}