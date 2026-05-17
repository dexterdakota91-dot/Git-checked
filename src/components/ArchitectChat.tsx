import React, { useRef, useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Bot, ChevronRight, Zap, MessageSquare, Target, Compass, Sparkles, Wand2 } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { LoadingIndicator } from './LoadingIndicator';
import { useStore } from '../store/useStore';
import { suggestTasks, generateBranding } from '../services/gemini';

/**
 * Render the floating "Architect Live" chat panel that displays message history, an input bar, project progress, and an autonomy toggle tied to app state.
 *
 * When a selected project has autonomy enabled, model messages containing `[ACTION:TYPE:DATA]` directives are parsed and dispatched to perform project-related side effects (for example: updating mission/branding, generating roadmaps, creating agents, completing tasks, or adding logs).
 *
 * @returns The chat component's JSX element
 */
export function ArchitectChat() {
  const { 
    isChatOpen, setIsChatOpen, 
    chatMessages, 
    chatInput, setChatInput, 
    isChatLoading,
    handleSendMessage,
    selectedProject,
    activeTab,
    setProjects,
    projects,
    addProjectLog,
    createAgent,
    completeTask,
    toggleAutonomy
  } = useStore();

  const isAutonomous = selectedProject?.isAutonomous || false;
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    if (isChatOpen) {
      scrollToBottom();
    }
  }, [chatMessages, isChatLoading, isChatOpen]);

  // Autonomous Execution Trigger
  useEffect(() => {
    if (isAutonomous && chatMessages.length > 0 && !isChatLoading) {
      const lastMessage = chatMessages[chatMessages.length - 1];
      if (lastMessage.role === 'model') {
        const action = parseAction(lastMessage.text);
        if (action) {
          executeAction(action);
        }
      }
    }
  }, [chatMessages, isAutonomous, isChatLoading]);

  const parseAction = (text: string) => {
    const match = text.match(/\[ACTION:(.*?):(.*?)\]/);
    if (match) {
      try {
        const dataStr = match[2].trim();
        return {
          type: match[1],
          data: (dataStr.startsWith('{') || dataStr.startsWith('[')) ? JSON.parse(dataStr) : dataStr.replace(/^"(.*)"$/, '$1')
        };
      } catch (e) {
        console.error("Action parse error:", e);
        return null;
      }
    }
    return null;
  };

  const executeAction = async (action: { type: string, data: any }) => {
    if (!selectedProject) return;

    try {
      if (action.type === 'UPDATE_MISSION') {
        const updatedProjects = projects.map(p => 
          p.id === selectedProject.id 
            ? { ...p, branding: { ...p.branding, missionStatement: action.data } }
            : p
        );
        setProjects(updatedProjects);
        useStore.getState().setSelectedProject(updatedProjects.find(p => p.id === selectedProject.id) || null);
      } else if (action.type === 'GENERATE_ROADMAP') {
        const tasks = await suggestTasks(selectedProject.name, selectedProject.description, selectedProject.status);
        const updatedProjects = projects.map(p => 
          p.id === selectedProject.id 
            ? { ...p, tasks: tasks }
            : p
        );
        setProjects(updatedProjects);
        useStore.getState().setSelectedProject(updatedProjects.find(p => p.id === selectedProject.id) || null);
      } else if (action.type === 'REFRESH_BRANDING') {
        const branding = await generateBranding(selectedProject.name, selectedProject.description);
        const updatedProjects = projects.map(p => 
          p.id === selectedProject.id 
            ? { ...p, branding: { ...p.branding, ...branding } }
            : p
        );
        setProjects(updatedProjects);
        useStore.getState().setSelectedProject(updatedProjects.find(p => p.id === selectedProject.id) || null);
      } else if (action.type === 'CREATE_AGENT') {
        await createAgent(selectedProject.id, action.data);
      } else if (action.type === 'COMPLETE_TASK') {
        await completeTask(selectedProject.id, action.data.taskId, action.data.logMessage);
      } else if (action.type === 'ADD_LOG') {
        await addProjectLog(selectedProject.id, action.data.type, action.data.message, action.data.details);
      }
    } catch (error) {
      console.error("Action execution failed", error);
    }
  };

  const cleanText = (text: string) => {
    return text.replace(/\[ACTION:.*\]/, '').trim();
  };

  const getProgress = () => {
    if (!selectedProject) return 0;
    const completed = selectedProject.tasks?.filter(t => t.status === 'completed').length || 0;
    const total = selectedProject.tasks?.length || 1;
    return Math.round((completed / total) * 100);
  };

  return (
    <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50 w-full max-w-2xl px-4">
      <AnimatePresence mode="wait">
        {isChatOpen ? (
          <motion.div 
            key="expanded"
            initial={{ y: 20, opacity: 0, scale: 0.95 }}
            animate={{ y: 0, opacity: 1, scale: 1 }}
            exit={{ y: 20, opacity: 0, scale: 0.95 }}
            className="bg-background/80 backdrop-blur-xl border border-white/10 rounded-3xl shadow-2xl overflow-hidden flex flex-col max-h-[60vh]"
          >
            {/* Header / Journey Tracker */}
            <div className="px-6 py-4 border-b border-white/10 flex items-center justify-between bg-primary/5">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-full bg-primary/20 flex items-center justify-center animate-pulse">
                  <Bot className="text-primary" size={18} />
                </div>
                <div>
                  <span className="font-bold font-display block text-sm">Architect Live</span>
                  <div className="flex items-center gap-2">
                    <div className="h-1 w-24 bg-white/10 rounded-full overflow-hidden">
                      <motion.div 
                        initial={{ width: 0 }}
                        animate={{ width: `${getProgress()}%` }}
                        className="h-full bg-primary"
                      />
                    </div>
                    <span className="text-[8px] font-bold text-primary uppercase tracking-tighter">{getProgress()}% Venture Integrity</span>
                  </div>
                </div>
              </div>
              <div className="flex items-center gap-4">
                <div 
                  className="flex items-center gap-2 px-3 py-1 bg-white/5 rounded-full border border-white/10 group cursor-pointer transition-colors hover:bg-white/10" 
                  onClick={() => selectedProject && toggleAutonomy(selectedProject.id)}
                  title="Enable Persistent Autonomy: Agents will continue advancing the venture even when you are offline."
                >
                  <div className={cn("w-2 h-2 rounded-full transition-all shadow-[0_0_8px]", isAutonomous ? "bg-green-500 shadow-green-500" : "bg-muted shadow-transparent")} />
                  <span className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground group-hover:text-foreground">Full Autonomy</span>
                </div>
                <Button variant="ghost" size="icon" onClick={() => setIsChatOpen(false)} className="rounded-full hover:bg-white/5">
                  <ChevronRight size={20} className="rotate-90" />
                </Button>
              </div>
            </div>

            {/* Message History */}
            <div className="flex-1 min-h-0 overflow-y-auto p-6 custom-scrollbar">
              <div className="space-y-6">
                {chatMessages.length === 0 && (
                  <div className="text-center py-8 space-y-4">
                    <Compass className="mx-auto text-primary/20 animate-spin-slow" size={48} />
                    <div className="space-y-1">
                      <p className="text-sm font-bold">Awaiting Instructions</p>
                      {isAutonomous ? (
                        <p className="text-xs text-green-500 animate-pulse">Autonomous Systems Engaged. Identifying next operational directive...</p>
                      ) : (
                        <p className="text-xs text-muted-foreground">I am ready to architect your next phase. What should we focus on?</p>
                      )}
                    </div>
                  </div>
                )}
                {chatMessages.map((msg, i) => {
                  const action = parseAction(msg.text);
                  const displayMessage = cleanText(msg.text);

                  if (!displayMessage && !action) return null;

                  return (
                    <div key={i} className="space-y-3">
                      {displayMessage && (
                        <div className={cn(
                          "flex gap-3",
                          msg.role === 'user' ? "flex-row-reverse" : ""
                        )}>
                          <div className={cn(
                            "w-6 h-6 rounded-full flex items-center justify-center shrink-0 border",
                            msg.role === 'user' ? "bg-primary border-primary" : "bg-secondary border-white/10"
                          )}>
                            <span className="text-[10px] font-bold">{msg.role === 'user' ? 'F' : 'A'}</span>
                          </div>
                          <div className={cn(
                            "p-4 rounded-2xl text-xs leading-relaxed max-w-[80%]",
                            msg.role === 'user' ? "bg-primary text-primary-foreground font-medium" : "bg-white/5 border border-white/10 text-foreground"
                          )}>
                            {displayMessage}
                          </div>
                        </div>
                      )}
                      
                      {msg.role === 'model' && action && (
                        <motion.div 
                          initial={{ opacity: 0, x: -10 }}
                          animate={{ opacity: 1, x: 0 }}
                          className="ml-9 bg-primary/10 border border-primary/20 p-4 rounded-2xl relative group overflow-hidden"
                        >
                          <div className="absolute inset-0 bg-gradient-to-br from-primary/5 to-transparent pointer-events-none" />
                          <div className="relative z-10">
                            <div className="flex items-center gap-2 mb-2">
                              <Sparkles size={14} className={cn("text-primary", isAutonomous ? "animate-spin-slow" : "animate-pulse")} />
                              <span className="text-[10px] font-bold uppercase tracking-widest text-primary">
                                {isAutonomous ? 'Autonomous Strategy Executed' : 'Architectural Strategy Proposed'}
                              </span>
                            </div>
                            <p className="text-[11px] text-muted-foreground mb-4">
                              {action.type === 'UPDATE_MISSION' && `Requesting update to primary vision statement.`}
                              {action.type === 'GENERATE_ROADMAP' && `Generating specialized operational milestones.`}
                              {action.type === 'REFRESH_BRANDING' && `Synthesizing brand identity alignment.`}
                              {action.type === 'CREATE_AGENT' && `Spawning specialized unit: ${action.data.name} (${action.data.role})`}
                              {action.type === 'COMPLETE_TASK' && `Operational milestone achievement: Initiating state update.`}
                              {action.type === 'ADD_LOG' && `System intelligence log emitted.`}
                            </p>
                            {!isAutonomous && (
                              <Button 
                                className="w-full text-[10px] h-9 bg-primary hover:bg-primary/80 transition-all font-bold rounded-xl"
                                onClick={() => executeAction(action)}
                              >
                                Execute Strategy
                              </Button>
                            )}
                            {isAutonomous && (
                              <div className="w-full text-[10px] h-9 bg-green-500/20 border border-green-500/30 text-green-500 flex items-center justify-center font-bold rounded-xl gap-2">
                                <Wand2 size={12} className="animate-pulse" /> Strategy Processed
                              </div>
                            )}
                          </div>
                        </motion.div>
                      )}
                    </div>
                  );
                })}
                {isChatLoading && (
                  <div className="flex gap-3 animate-pulse">
                    <div className="w-6 h-6 rounded-full bg-secondary flex items-center justify-center shrink-0 border border-white/10">
                      <Zap size={10} className="text-primary" />
                    </div>
                    <div className="bg-white/5 border border-white/10 p-3 rounded-2xl h-10 w-32" />
                  </div>
                )}
                <div ref={messagesEndRef} />
              </div>
            </div>

            {/* Input Bar */}
            <div className="p-4 bg-black/20 border-t border-white/10">
              <div className="flex gap-3 bg-white/5 p-1 rounded-2xl border border-white/10 focus-within:border-primary/50 transition-colors">
                <Input 
                  placeholder="Collaborate with Architect..." 
                  value={chatInput}
                  onChange={(e) => setChatInput(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && handleSendMessage()}
                  className="bg-transparent border-none focus-visible:ring-0 text-xs h-10 placeholder:text-muted-foreground/50"
                  disabled={isChatLoading}
                />
                <Button 
                  disabled={isChatLoading || !chatInput.trim()}
                  onClick={handleSendMessage} 
                  className={cn(
                    "rounded-xl h-10 w-10 shrink-0 transition-all",
                    chatInput.trim() ? "bg-primary text-primary-foreground" : "bg-white/10 text-muted-foreground"
                  )}
                >
                  {isChatLoading ? <LoadingIndicator icon={Zap} size={18} /> : <Zap size={18} />}
                </Button>
              </div>
            </div>
          </motion.div>
        ) : (
          <motion.div 
            key="collapsed"
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: 20, opacity: 0 }}
            className="flex items-center justify-center"
          >
            <div 
              onClick={() => setIsChatOpen(true)}
              className="glass p-1 pl-4 flex items-center gap-4 cursor-pointer hover:bg-white/10 transition-all group border border-white/10 rounded-full pr-1 shadow-xl"
            >
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 rounded-full bg-primary animate-pulse shadow-[0_0_8px_rgba(0,102,255,0.8)]" />
                <span className="text-[10px] font-bold uppercase tracking-[0.2em] text-muted-foreground group-hover:text-primary transition-colors">Architect Link Active</span>
              </div>
              <div className="flex -space-x-2">
                 <div className="w-8 h-8 rounded-full bg-primary flex items-center justify-center text-primary-foreground border-2 border-background z-10 transition-transform group-hover:-translate-y-1">
                   <Bot size={16} />
                 </div>
                 <div className="w-8 h-8 rounded-full bg-secondary flex items-center justify-center text-muted-foreground border-2 border-background group-hover:-translate-y-1 transition-transform delay-75">
                   <Zap size={14} />
                 </div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
