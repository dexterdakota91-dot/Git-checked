import React from 'react';
import { Routes, Route, useNavigate, useLocation } from 'react-router-dom';
import { useStore } from '../../store/useStore';
import { SidebarContent } from './SidebarContent';
import { ArchitectChat } from '../ArchitectChat';
import { AIAcknowlegementFooter } from './AIAcknowlegementFooter';
import { Search, Plus, Menu } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Sheet, SheetTrigger, SheetContent } from '@/components/ui/sheet';
import { MonolithLogo, AetherisTextLogo } from '../logos/LogoComponents';

// Import Views
const DashboardView = React.lazy(() => import('../views/DashboardView'));
const AnalyticsView = React.lazy(() => import('../views/AnalyticsView'));
const AgentsView = React.lazy(() => import('../views/AgentsView'));
const IdeaLabView = React.lazy(() => import('../views/IdeaLabView'));
const BrandingView = React.lazy(() => import('../views/BrandingView'));
const GlossaryView = React.lazy(() => import('../views/GlossaryView'));
const LegalView = React.lazy(() => import('../views/LegalView'));
const BankView = React.lazy(() => import('../views/BankView'));
const VentureDashboardView = React.lazy(() => import('../views/VentureDashboardView'));
const ProjectDetailView = React.lazy(() => import('../views/ProjectDetailView'));
const ChatView = React.lazy(() => import('../views/ChatView'));
const LandingPage = React.lazy(() => import('../LandingPage').then(module => ({ default: module.LandingPage })));

export function AppShell() {
  const { 
    selectedProject, activeTab,
    projects, currentUser,
    isUserSettingsOpen, setIsUserSettingsOpen,
    isResetConfirmOpen, setIsResetConfirmOpen,
    handleLogin, handleLogout, deleteProject, resetAccount
  } = useStore();
  const navigate = useNavigate();
  const location = useLocation();

  const handleSetActiveTab = (tab: string) => {
    navigate(`/${tab}`);
  };

  const getActiveTabFromLocation = () => {
    const path = location.pathname.substring(1);
    return path || 'landing';
  };

  const currentTab = getActiveTabFromLocation();

  if (currentTab === 'landing') {
    return (
      <main className="h-full bg-background relative overflow-hidden flex flex-col">
        <React.Suspense fallback={<div className="flex h-screen items-center justify-center">Loading AI Studio...</div>}>
          <LandingPage setActiveTab={handleSetActiveTab} />
        </React.Suspense>
      </main>
    );
  }

  return (
    <div className="flex w-full h-full bg-background text-foreground overflow-hidden selection:bg-primary/30">
      {/* Desktop Sidebar */}
      <aside className="w-64 flex-shrink-0 border-r border-white/10 hidden lg:block custom-scrollbar bg-black/20 backdrop-blur-xl">
        <SidebarContent 
          activeTab={currentTab} 
          setActiveTab={handleSetActiveTab} 
          projects={projects} 
          selectedProject={selectedProject} 
          setSelectedProject={(p) => { useStore.getState().setSelectedProject(p); }} 
          currentUser={currentUser}
          handleLogout={handleLogout}
          handleLogin={handleLogin}
          deleteProject={deleteProject}
          resetAccount={resetAccount}
          setIsResetConfirmOpen={setIsResetConfirmOpen}
          isUserSettingsOpen={isUserSettingsOpen}
          setIsUserSettingsOpen={setIsUserSettingsOpen}
        />
      </aside>

      <main className="flex-1 min-w-0 relative overflow-hidden flex flex-col">
        {/* Header */}
        <header className="h-16 border-b border-white/10 flex items-center justify-between px-4 lg:px-8 bg-background/50 backdrop-blur-md z-10 relative">
          <div className="flex items-center gap-4">
            {/* Mobile Sidebar Trigger */}
            <div className="lg:hidden">
              <Sheet>
                <SheetTrigger render={<Button variant="ghost" className="p-0 h-auto hover:bg-transparent group bg-transparent border-none outline-none cursor-pointer" />}>
                  <div className="relative w-10 h-10 rounded-xl bg-white flex items-center justify-center shadow-lg overflow-hidden transition-transform group-active:scale-95">
                    <MonolithLogo size={32} agents={selectedProject?.agents || []} />
                  </div>
                </SheetTrigger>
                <SheetContent side="left" className="p-0 w-64 bg-background border-r border-white/10">
                  <SidebarContent 
                    activeTab={currentTab} 
                    setActiveTab={handleSetActiveTab} 
                    projects={projects} 
                    selectedProject={selectedProject} 
                    setSelectedProject={(p) => { useStore.getState().setSelectedProject(p); }} 
                    currentUser={currentUser}
                    handleLogout={handleLogout}
                    handleLogin={handleLogin}
                    deleteProject={deleteProject}
                    resetAccount={resetAccount}
                    setIsResetConfirmOpen={setIsResetConfirmOpen}
                    isUserSettingsOpen={isUserSettingsOpen}
                    setIsUserSettingsOpen={setIsUserSettingsOpen}
                  />
                </SheetContent>
              </Sheet>
            </div>
            
            <div className="flex items-center gap-2">
              <h2 className="text-lg font-semibold font-display capitalize hidden sm:block">
                {currentTab?.replace('-', ' ') || 'Unknown'}
              </h2>
            </div>
          </div>

          <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 cursor-pointer" onClick={() => handleSetActiveTab('landing')}>
            <AetherisTextLogo size={32} />
          </div>

          <div className="flex items-center gap-2 sm:gap-4">
            <div className="relative hidden md:block">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" size={16} />
              <Input 
                placeholder="Search projects..." 
                className="pl-10 w-48 lg:w-64 bg-secondary/50 border-none focus-visible:ring-primary/50 text-foreground" 
              />
            </div>
            <Button variant="secondary" size="sm" className="electric-glow" onClick={() => handleSetActiveTab('idea-lab')}>
              <Plus size={18} className="sm:mr-2" /> <span className="hidden sm:inline">New Venture</span>
            </Button>
          </div>
        </header>

        {/* Subheader for active venture context */}
        {selectedProject && (
          <div className="h-10 border-b border-white/10 bg-secondary/20 flex items-center px-4 lg:px-8 gap-3 shrink-0">
            <span className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">Active Venture</span>
            <Badge variant="outline" className="border-primary/30 text-primary truncate max-w-[200px] sm:max-w-md aetheris-card px-2 py-0.5">
              {selectedProject.name}
            </Badge>
          </div>
        )}

        {/* View Content */}
        <div className="flex-1 overflow-y-auto p-4 lg:p-8">
          <React.Suspense fallback={<div className="flex items-center justify-center h-64">Loading...</div>}>
            <Routes>
              <Route path="/idea-lab" element={<IdeaLabView setActiveTab={handleSetActiveTab} />} />
              <Route path="/dashboard" element={<DashboardView projects={projects} selectedProject={selectedProject} setActiveTab={handleSetActiveTab} setSelectedProject={(p) => useStore.getState().setSelectedProject(p)} />} />
              <Route path="/analytics" element={<AnalyticsView projects={projects} />} />
              <Route path="/agents" element={<AgentsView selectedProject={selectedProject} />} />
              <Route path="/branding" element={<BrandingView />} />
              <Route path="/glossary" element={<GlossaryView />} />
              <Route path="/legal" element={<LegalView />} />
              <Route path="/bank" element={<BankView />} />
              <Route path="/venture-dashboard" element={<VentureDashboardView selectedProject={selectedProject} setActiveTab={handleSetActiveTab} />} />
              <Route path="/project-detail" element={selectedProject ? <ProjectDetailView 
                  selectedProject={selectedProject} 
                  setActiveTab={handleSetActiveTab} 
                  projects={projects}
                  setProjects={(p) => useStore.getState().setProjects(p)}
                  deleteProject={deleteProject}
                  addStripeIntegration={(id) => useStore.getState().addStripeIntegration(id)}
                  handleUpdateTasks={(id, tasks) => useStore.getState().handleUpdateTasks(id, tasks)}
                /> : <div className="p-8 text-center text-muted-foreground">Please select a venture to view details.</div>} />
              <Route path="/chat" element={<ChatView />} />
              <Route path="/" element={<LandingPage setActiveTab={handleSetActiveTab} />} />
              <Route path="*" element={<LandingPage setActiveTab={handleSetActiveTab} />} />
            </Routes>
          </React.Suspense>
          <AIAcknowlegementFooter />
        </div>
      </main>

      {/* Architect Chat Slide-out - Contained within overflow-hidden root */}
      <ArchitectChat />
    </div>
  );
}
