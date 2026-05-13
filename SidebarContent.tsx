import React from 'react';
import { 
  Lightbulb, 
  Palette, 
  LayoutDashboard, 
  TrendingUp, 
  Users, 
  Building2,
  FileText,
  BookOpen,
  Scale,
  Trash2,
  Settings,
  X 
} from 'lucide-react';
import { User } from 'firebase/auth';
import { 
  Dialog, 
  DialogContent, 
  DialogDescription, 
  DialogHeader, 
  DialogTitle, 
  DialogTrigger, 
  DialogClose 
} from "@/components/ui/dialog";
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Separator } from '@/components/ui/separator';
import { Input } from '@/components/ui/input';
import { Switch } from '@/components/ui/switch';
import { Button, buttonVariants } from '@/components/ui/button';
import { NavItem } from './NavItem';
import { MonolithLogo, AetherisLogo } from '../logos/LogoComponents';
import { Project } from '../../types';
import { cn } from '@/lib/utils';

interface SidebarContentProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
  projects: Project[];
  selectedProject: Project | null;
  setSelectedProject: (project: Project | null) => void;
  currentUser: User | null;
  handleLogout: () => void;
  handleLogin: () => void;
  deleteProject: (id: string, e?: React.MouseEvent) => void;
  resetAccount: () => void;
  setIsResetConfirmOpen: (open: boolean) => void;
  isUserSettingsOpen: boolean;
  setIsUserSettingsOpen: (open: boolean) => void;
}

import { DeleteVentureButton } from '../DeleteVentureButton';

/**
 * Render the application sidebar with navigation, active projects list, and user controls.
 *
 * Renders:
 * - Top logo that navigates to the landing tab
 * - Optional selected project badge with branding
 * - Navigation items that set the active tab (some disabled when no project is selected)
 * - Scrollable "Active Projects" list with per-project selection and delete controls
 * - Bottom user panel showing sign-in or account settings (including reset and sign out)
 *
 * @param props.activeTab - Currently selected tab identifier
 * @param props.setActiveTab - Callback to change the active tab
 * @param props.projects - List of projects to display in the Active Projects section
 * @param props.selectedProject - Currently selected project or `null`
 * @param props.setSelectedProject - Callback to select a project (or `null`)
 * @param props.currentUser - Authenticated user info or `null`
 * @param props.handleLogout - Callback to sign the current user out
 * @param props.handleLogin - Callback to initiate sign-in (Google)
 * @param props.deleteProject - Callback invoked to delete a project; receives `id` and optional mouse event
 * @param props.resetAccount - Callback to perform account reset (clear all)
 * @param props.setIsResetConfirmOpen - Callback to open/close the reset confirmation dialog
 * @param props.isUserSettingsOpen - Whether the user settings dialog is open
 * @param props.setIsUserSettingsOpen - Callback to open/close the user settings dialog
 * @returns The sidebar JSX element
 */
export function SidebarContent({ 
  activeTab, 
  setActiveTab, 
  projects, 
  selectedProject, 
  setSelectedProject, 
  currentUser, 
  handleLogout, 
  handleLogin, 
  deleteProject,
  resetAccount,
  setIsResetConfirmOpen,
  isUserSettingsOpen,
  setIsUserSettingsOpen
}: SidebarContentProps) {
  return (
    <div className="flex flex-col h-full">
      <div className="p-6 flex flex-col gap-2">
        <div className="cursor-pointer" onClick={() => setActiveTab('landing')}>
          <AetherisLogo size={32} />
        </div>
        {selectedProject && (
          <div className="flex items-center gap-2 mt-2 p-2 rounded-md bg-secondary/30 border border-border">
            <MonolithLogo 
              size={20} 
              agents={selectedProject.agents || []} 
              logoType={selectedProject.branding?.logoType} 
              primary={selectedProject.branding?.selectedPalette?.[0]}
              secondary={selectedProject.branding?.selectedPalette?.[1]}
              accent={selectedProject.branding?.selectedPalette?.[2]}
            />
            <span 
              className="text-sm font-bold truncate"
              style={{ color: selectedProject.branding?.selectedPalette?.[0] || 'inherit' }}
            >
              {selectedProject.branding?.selectedName || selectedProject.name}
            </span>
          </div>
        )}
      </div>
      
      <nav className="flex-1 px-4 space-y-2 mt-2 pt-4 pb-2 overflow-y-auto">
        <NavItem 
          icon={<Lightbulb size={20} />} 
          label="Venture Architect" 
          active={activeTab === 'idea-lab'} 
          onClick={() => setActiveTab('idea-lab')} 
        />
        <NavItem 
          icon={<Palette size={20} />} 
          label="Identity Lab" 
          active={activeTab === 'branding'} 
          onClick={() => setActiveTab('branding')} 
          disabled={!selectedProject}
        />
        <NavItem 
          icon={<LayoutDashboard size={20} />} 
          label="Mission Control" 
          active={activeTab === 'dashboard'} 
          onClick={() => setActiveTab('dashboard')} 
          disabled={!selectedProject}
        />
        <NavItem 
          icon={<TrendingUp size={20} />} 
          label="Growth Analytics" 
          active={activeTab === 'analytics'} 
          onClick={() => setActiveTab('analytics')} 
          disabled={!selectedProject}
        />
        <NavItem 
          icon={<Users size={20} />} 
          label="Agent Stack" 
          active={activeTab === 'agents'} 
          onClick={() => setActiveTab('agents')} 
        />
        <NavItem 
          icon={<Building2 size={20} />} 
          label="Bank & Tax" 
          active={activeTab === 'bank'} 
          onClick={() => setActiveTab('bank')} 
        />
        <NavItem 
          icon={<BookOpen size={20} />} 
          label="Knowledge Base" 
          active={activeTab === 'glossary'} 
          onClick={() => setActiveTab('glossary')} 
        />
        <NavItem 
          icon={<Scale size={20} />} 
          label="Legal Center" 
          active={activeTab === 'legal'} 
          onClick={() => setActiveTab('legal')} 
        />
        <Separator className="my-4 opacity-50" />
        <div className="px-4 py-2 text-xs font-semibold text-muted-foreground uppercase tracking-wider">
          Active Projects
        </div>
        <div className="space-y-1">
          {projects.length === 0 && (
            <div className="px-4 py-8 text-center">
              <p className="text-xs text-muted-foreground">No active projects</p>
            </div>
          )}
          {projects.map((p: any) => (
            <div key={p.id} className="group relative">
              <button
                onClick={() => {
                  setSelectedProject(p);
                  setActiveTab('project-detail');
                }}
                className={cn(
                  "w-full flex items-center gap-3 px-4 py-2 rounded-lg text-sm transition-colors pr-10",
                  selectedProject?.id === p.id ? "bg-primary/10 text-primary" : "hover:bg-secondary/50 text-muted-foreground"
                )}
              >
                <div className={cn("w-2 h-2 rounded-full", 
                  p.status === 'scaling' ? "bg-primary" : "bg-accent"
                )} />
                <span className="truncate">{p.name}</span>
              </button>
              <DeleteVentureButton
                projectId={p.id}
                onDelete={(id, e) => {
                  console.log("Delete button clicked for project:", id);
                  deleteProject(id, e);
                }}
                iconOnly={true}
              />
            </div>
          ))}
        </div>
      </nav>

      <div className="p-4 border-t border-border">
        {currentUser ? (
          <div className="flex items-center gap-3 p-2 rounded-xl bg-secondary/50 border border-accent/10">
            <Avatar className="w-10 h-10 border border-primary/20">
              <AvatarImage src={currentUser.photoURL || `https://picsum.photos/seed/${currentUser.uid}/100`} />
              <AvatarFallback>{currentUser.displayName?.[0] || 'U'}</AvatarFallback>
            </Avatar>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium truncate">{currentUser.displayName || 'User'}</p>
              <button onClick={handleLogout} className="text-[10px] text-muted-foreground hover:text-destructive transition-colors">Sign Out</button>
            </div>
            <Dialog open={isUserSettingsOpen} onOpenChange={setIsUserSettingsOpen}>
              <DialogTrigger nativeButton={true} render={
                <button className="p-1 rounded-md text-muted-foreground cursor-pointer hover:text-foreground transition-colors outline-none focus-visible:ring-2 focus-visible:ring-primary/50">
                  <Settings size={18} />
                </button>
              } />
              <DialogContent className="aetheris-card max-w-md border-none">
                <DialogHeader>
                  <DialogTitle>Account Settings</DialogTitle>
                  <DialogDescription>Manage your profile and preferences</DialogDescription>
                </DialogHeader>
                <div className="space-y-6 py-4">
                  <div className="space-y-2">
                    <label className="text-xs font-bold uppercase text-muted-foreground">Display Name</label>
                    <Input value={currentUser.displayName || ''} readOnly className="bg-background/50 border-accent/10" />
                  </div>
                  <div className="space-y-2">
                    <label className="text-xs font-bold uppercase text-muted-foreground">Email</label>
                    <Input value={currentUser.email || ''} readOnly className="bg-background/50 border-accent/10" />
                  </div>
                  <div className="flex items-center justify-between p-4 rounded-xl bg-primary/5 border border-primary/20">
                    <div className="space-y-0.5">
                      <p className="text-sm font-bold">Global Notifications</p>
                      <p className="text-[10px] text-muted-foreground">Receive agentic updates via browser push</p>
                    </div>
                    <Switch checked={true} />
                  </div>
                  <div className="pt-4 border-t border-accent/10 space-y-3">
                    <p className="text-[10px] text-muted-foreground uppercase tracking-widest font-bold">Danger Zone</p>
                    <Button 
                      variant="outline" 
                      className="w-full border-destructive/30 text-destructive hover:bg-destructive/10"
                      onClick={() => {
                        setIsUserSettingsOpen(false);
                        setIsResetConfirmOpen(true);
                      }}
                    >
                      <Trash2 size={16} className="mr-2" /> Reset Account (Clear All)
                    </Button>
                    <Button variant="destructive" className="w-full" onClick={handleLogout}>Sign Out</Button>
                  </div>
                </div>
              </DialogContent>
            </Dialog>
          </div>
        ) : (
          <Button variant="secondary" onClick={handleLogin} className="w-full electric-glow">
            Sign In with Google
          </Button>
        )}
      </div>
    </div>
  );
}
