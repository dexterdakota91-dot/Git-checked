import React from 'react';
import { motion } from 'motion/react';
import { ChevronLeft, Globe, CheckCircle2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { MonolithLogo } from '../logos/LogoComponents';
import { Project } from '../../types';

interface VentureDashboardViewProps {
  selectedProject: Project;
  setActiveTab: (tab: string) => void;
}

/**
 * Render the venture dashboard for a selected project.
 *
 * Displays branding (logo, name, mission statement), a color palette, audience and tone details,
 * and a venture status card with progress indicators and next steps. Includes controls to return
 * to Mission Control and to open a preview page.
 *
 * @param selectedProject - Project whose branding, agents, and metadata populate the dashboard
 * @param setActiveTab - Callback invoked with the target tab name when navigation is requested
 * @returns A JSX element containing the venture dashboard UI
 */
export default function VentureDashboardView({ selectedProject, setActiveTab }: VentureDashboardViewProps) {
  return (
    <motion.div
      key="venture-dashboard"
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.95 }}
      className="max-w-6xl mx-auto space-y-8"
    >
      <div className="flex items-center justify-between">
        <Button variant="ghost" onClick={() => setActiveTab('dashboard')} className="text-muted-foreground hover:text-foreground">
          <ChevronLeft className="mr-2" size={16} /> Return to Mission Control
        </Button>
        <Button variant="outline" className="border-primary/20 text-primary hover:bg-primary/10" onClick={() => window.open('https://example.com/preview', '_blank')}>
          <Globe className="mr-2" size={16} /> Preview Product Landing Page
        </Button>
      </div>

      <div className="text-center space-y-4">
        <div className="flex justify-center mb-4">
          <MonolithLogo 
            size={64} 
            agents={selectedProject.agents || []} 
            logoType={selectedProject.branding?.logoType} 
            primary={selectedProject.branding?.selectedPalette?.[0]}
            secondary={selectedProject.branding?.selectedPalette?.[1]}
            accent={selectedProject.branding?.selectedPalette?.[2]}
          />
        </div>
        <h1 className="text-4xl font-bold font-display tracking-tight text-foreground" style={{ color: selectedProject.branding?.selectedPalette?.[0] || 'inherit' }}>
          {selectedProject.branding?.selectedName || selectedProject.name}
        </h1>
        <p className="text-muted-foreground text-lg max-w-2xl mx-auto italic">
          "{selectedProject.branding?.missionStatement || 'No mission statement generated yet.'}"
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card className="aetheris-card border-none">
          <CardHeader>
            <CardTitle>Brand Identity</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <p className="text-xs font-bold uppercase text-muted-foreground mb-2">Color Palette</p>
              <div className="flex h-12 rounded-lg overflow-hidden border border-accent/10">
                {selectedProject.branding?.selectedPalette?.map((color, idx) => (
                  <div key={idx} className="flex-1" style={{ backgroundColor: color }} />
                ))}
              </div>
            </div>
            <div>
              <p className="text-xs font-bold uppercase text-muted-foreground mb-1">Target Audience</p>
              <p className="text-sm">{selectedProject.branding?.targetAudience || 'Not defined'}</p>
            </div>
            <div>
              <p className="text-xs font-bold uppercase text-muted-foreground mb-1">Tone</p>
              <p className="text-sm">{selectedProject.branding?.tone || 'Not defined'}</p>
            </div>
          </CardContent>
        </Card>

        <Card className="aetheris-card border-none">
          <CardHeader>
            <CardTitle>Venture Status</CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Development Progress</span>
                <span className="font-bold text-primary">65%</span>
              </div>
              <Progress value={65} className="h-1.5 bg-primary/10" />
            </div>
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Marketing Readiness</span>
                <span className="font-bold text-primary">40%</span>
              </div>
              <Progress value={40} className="h-1.5 bg-primary/10" />
            </div>
            <div className="pt-4 border-t border-border">
              <p className="text-xs text-muted-foreground uppercase tracking-wider mb-2">Next Steps</p>
              <ul className="space-y-2 text-sm">
                <li className="flex items-center gap-2"><CheckCircle2 size={14} className="text-primary" /> Finalize landing page copy</li>
                <li className="flex items-center gap-2"><div className="w-3.5 h-3.5 rounded-full border border-muted-foreground" /> Integrate Stripe checkout</li>
                <li className="flex items-center gap-2"><div className="w-3.5 h-3.5 rounded-full border border-muted-foreground" /> Launch ad campaign</li>
              </ul>
            </div>
          </CardContent>
        </Card>
      </div>
    </motion.div>
  );
}
