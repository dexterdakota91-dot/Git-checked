import React from 'react';
import { motion } from 'motion/react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { ScrollArea } from '@/components/ui/scroll-area';
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
import { DollarSign, TrendingUp, Users } from 'lucide-react';
import { Project } from '../../types';
import { REVENUE_DATA } from '../../constants/mockData';

interface AnalyticsViewProps {
  projects: Project[];
}

export default function AnalyticsView({ projects }: AnalyticsViewProps) {
  return (
    <motion.div
      key="analytics"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      className="space-y-8"
    >
      <div className="space-y-2">
        <h2 className="text-3xl font-bold font-display">Global Analytics</h2>
        <p className="text-muted-foreground">Comprehensive performance metrics across all active ventures.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <StatCard 
          title="Total Portfolio Value" 
          value={`$${(projects.reduce((acc, p) => acc + (p.revenue || 0), 0) * 12).toLocaleString()}`} 
          trend="+18.2%" 
          icon={<DollarSign className="text-primary" />} 
          withBeam
        />
        <StatCard 
          title="Avg. Agent Efficiency" 
          value="98.4%" 
          trend="+1.2%" 
          icon={<TrendingUp className="text-primary" />} 
        />
        <StatCard 
          title="Total Active Agents" 
          value={projects.reduce((acc, p) => acc + (p.agents?.length || 0), 0).toString()} 
          trend="Running" 
          icon={<Users className="text-accent" />} 
        />
      </div>

      {/* Charts & Activity */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <Card className="lg:col-span-2 glass border-none min-w-0">
          <CardHeader>
            <CardTitle className="text-lg font-medium">Revenue Growth</CardTitle>
            <CardDescription>Daily automated revenue tracking</CardDescription>
          </CardHeader>
          <CardContent className="h-[300px] relative min-w-0">
            <div className="absolute inset-0 pb-6 pr-6 pl-2 pt-2">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={REVENUE_DATA}>
                  <defs>
                    <linearGradient id="colorValue" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#0066FF" stopOpacity={0.3}/>
                      <stop offset="95%" stopColor="#0066FF" stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="#262626" vertical={false} />
                  <XAxis dataKey="name" stroke="#525252" fontSize={12} tickLine={false} axisLine={false} />
                  <YAxis stroke="#525252" fontSize={12} tickLine={false} axisLine={false} tickFormatter={(v) => `$${v}`} />
                  <Tooltip 
                    contentStyle={{ backgroundColor: '#171717', border: 'none', borderRadius: '8px', color: '#fff' }}
                    itemStyle={{ color: '#0066FF' }}
                  />
                  <Area type="monotone" dataKey="value" stroke="#0066FF" fillOpacity={1} fill="url(#colorValue)" strokeWidth={2} />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        <Card className="glass border-none">
          <CardHeader>
            <CardTitle className="text-lg font-medium">Top Performing Ventures</CardTitle>
          </CardHeader>
          <CardContent>
            <ScrollArea className="h-[300px] pr-4">
              <div className="space-y-6">
                {projects.sort((a, b) => b.revenue - a.revenue).map((p, i) => (
                  <div key={p.id} className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                      <div className="w-8 h-8 rounded-full bg-secondary flex items-center justify-center text-xs font-bold">
                        #{i + 1}
                      </div>
                      <div>
                        <p className="font-medium">{p.name}</p>
                        <p className="text-xs text-muted-foreground">{p.agents.length} Agents</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="font-bold text-primary">${p.revenue.toLocaleString()}</p>
                      <p className="text-xs text-accent">+{p.growth}%</p>
                    </div>
                  </div>
                ))}
              </div>
            </ScrollArea>
          </CardContent>
        </Card>
      </div>
    </motion.div>
  );
}
