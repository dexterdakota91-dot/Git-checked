import { StateCreator } from 'zustand';
import { AppState } from '../useStore';
import { Project, BusinessIdea } from '../../types';
import { db, OperationType, handleFirestoreError } from '../../lib/firebase';
import { addDoc, collection, doc, updateDoc, deleteDoc } from 'firebase/firestore';
import { suggestTasks, specializeAgents } from '../../services/gemini';

export interface ProjectSlice {
  projects: Project[];
  setProjects: (projects: Project[] | ((prev: Project[]) => Project[])) => void;
  selectedProject: Project | null;
  setSelectedProject: (project: Project | null) => void;
  
  deleteProject: (projectId: string) => Promise<void>;
  startProject: (idea: BusinessIdea) => Promise<void>;
  handleUpdateTasks: (projectId: string, updatedTasks: any[]) => Promise<void>;
  updateAgent: (projectId: string, agentId: string, updates: Partial<any>) => Promise<void>;
  updateVentureBranding: (brandingUpdates: any) => Promise<void>;
  toggleAutonomy: (projectId: string) => Promise<void>;
  addProjectLog: (projectId: string, type: 'info' | 'success' | 'thought' | 'decision' | 'error', message: string, details?: string) => Promise<void>;
  createAgent: (projectId: string, agent: { name: string, role: string, specialty: string, capabilities: string[] }) => Promise<void>;
  completeTask: (projectId: string, taskId: string, logMessage?: string) => Promise<void>;
}

export const createProjectSlice: StateCreator<AppState, [], [], ProjectSlice> = (set, get) => ({
  projects: [],
  setProjects: (projects) => set((state) => ({ 
    projects: typeof projects === 'function' ? projects(state.projects) : projects 
  })),
  selectedProject: null,
  setSelectedProject: (project) => set({ selectedProject: project }),

  addProjectLog: async (projectId: string, type, message, details) => {
    const { projects } = get();
    const project = projects.find(p => p.id === projectId);
    if (!project) return;

    const newLog = {
      id: Math.random().toString(36).substr(2, 9),
      timestamp: new Date().toISOString(),
      type,
      message,
      details
    };

    const updatedLogs = [...(project.logs || []), newLog];

    try {
      const projectRef = doc(db, 'projects', projectId);
      await updateDoc(projectRef, { logs: updatedLogs });
    } catch (error) {
      console.error("Failed to add log:", error);
    }
  },

  createAgent: async (projectId: string, agentData) => {
    const { projects } = get();
    const project = projects.find(p => p.id === projectId);
    if (!project) return;

    const newAgent = {
      ...agentData,
      id: `agent-${Math.random().toString(36).substr(2, 5)}`,
      status: 'idle',
      avatar: `https://api.dicebear.com/7.x/bottts/svg?seed=${agentData.name}&backgroundColor=transparent`,
    };

    const updatedAgents = [...(project.agents || []), newAgent];

    try {
      const projectRef = doc(db, 'projects', projectId);
      await updateDoc(projectRef, { agents: updatedAgents });
      get().addProjectLog(projectId, 'success', `New Agent Spawned: ${agentData.name}`, `Role: ${agentData.role} | Specialty: ${agentData.specialty}`);
    } catch (error) {
      console.error("Failed to create agent:", error);
    }
  },

  completeTask: async (projectId: string, taskId: string, logMessage) => {
    const { projects } = get();
    const project = projects.find(p => p.id === projectId);
    if (!project) return;

    const updatedTasks = (project.tasks || []).map(t => 
      t.id === taskId ? { ...t, status: 'completed', progress: 100 } : t
    );

    try {
      const projectRef = doc(db, 'projects', projectId);
      await updateDoc(projectRef, { tasks: updatedTasks });
      if (logMessage) {
        get().addProjectLog(projectId, 'success', logMessage);
      }
    } catch (error) {
      console.error("Failed to complete task:", error);
    }
  },

  updateAgent: async (projectId: string, agentId: string, updates: Partial<any>) => {
    const { projects } = get();
    const project = projects.find(p => p.id === projectId);
    if (!project) return;
    
    const updatedAgents = project.agents.map(a => a.id === agentId ? { ...a, ...updates } : a);
    
    // Optimistic update in store
    set((state) => ({
      projects: state.projects.map(p => p.id === projectId ? { ...p, agents: updatedAgents } : p),
      selectedProject: state.selectedProject?.id === projectId ? { ...state.selectedProject, agents: updatedAgents } : state.selectedProject
    }));

    // Persist to Firestore
    try {
      const projectRef = doc(db, 'projects', projectId);
      await updateDoc(projectRef, { agents: updatedAgents });
    } catch (error) {
      console.error("Failed to update agent in Firestore:", error);
      // Rollback could be implemented here if needed
    }
  },

  deleteProject: async (projectId: string) => {
    try {
      await deleteDoc(doc(db, 'projects', projectId));
      const state = get();
      if (state.selectedProject?.id === projectId) {
        set({ selectedProject: null, activeTab: 'idea-lab' });
      }
    } catch (error) {
      handleFirestoreError(error, OperationType.DELETE, `projects/${projectId}`);
    }
  },

  startProject: async (idea: BusinessIdea) => {
    const { currentUser, refinedTemplates } = get();
    if (!currentUser) {
      set({ showOnboarding: true });
      return;
    }

    try {
      const newProjectRef = collection(db, 'projects');
      const docRef = await addDoc(newProjectRef, {
        uid: currentUser.uid,
        name: idea.branding?.selectedName || idea.title,
        description: idea.description,
        tags: idea.tags,
        status: 'ideation',
        healthScore: 100,
        revenue: 0,
        growth: 0,
        createdAt: new Date().toISOString(),
        agents: [],
        tasks: [],
        branding: idea.branding || null,
        logs: [{
          id: Date.now().toString(),
          timestamp: new Date().toISOString(),
          type: 'info',
          message: `Project initialized: ${idea.branding?.selectedName || idea.title}`
        }]
      });

      const projectId = docRef.id;

      // Handle template repopulation
      const isTemplate = refinedTemplates.some(t => t.id === idea.id);
      if (isTemplate) {
        // Remove the used template
        set(state => ({
          refinedTemplates: state.refinedTemplates.filter(t => t.id !== idea.id)
        }));
        // Generate a replacement
        get().handleGenerateRefinedTemplates(1);
      }

      // Generate Tasks via Gemini
      suggestTasks(idea.title, idea.description, 'ideation').then(async (suggestedTasks) => {
        if (suggestedTasks && suggestedTasks.length > 0) {
          const tasksWithIds = suggestedTasks.map(t => ({
            ...t,
            id: Math.random().toString(36).substr(2, 9),
            status: 'pending',
            progress: 0
          }));
          const projectRef = doc(db, 'projects', projectId);
          await updateDoc(projectRef, { tasks: tasksWithIds });
        }
      });

      // Generate Agents via Gemini
      specializeAgents(idea.title, idea.description).then(async (specializations) => {
        if (specializations) {
          const agentsArray = [
            {
              id: 'architect-1',
              name: 'Aiden',
              role: 'Architect',
              status: 'idle',
              avatar: 'https://api.dicebear.com/7.x/bottts/svg?seed=Aiden&backgroundColor=transparent',
              ...specializations.architect
            },
            {
              id: 'coder-1',
              name: 'Cipher',
              role: 'Coder',
              status: 'working',
              currentTask: 'Waiting for environment setup',
              avatar: 'https://api.dicebear.com/7.x/bottts/svg?seed=Cipher&backgroundColor=transparent',
              ...specializations.coder
            },
            {
              id: 'marketer-1',
              name: 'Maya',
              role: 'Marketer',
              status: 'waiting-for-input',
              currentTask: 'Needs target audience confirmation',
              avatar: 'https://api.dicebear.com/7.x/bottts/svg?seed=Maya&backgroundColor=transparent',
              ...specializations.marketer
            }
          ];
          const projectRef = doc(db, 'projects', projectId);
          await updateDoc(projectRef, { agents: agentsArray });
        }
      });
      
      const state = get();
      const newProjectObj = state.projects.find(p => p.id === projectId);
      if (newProjectObj) {
        set({ selectedProject: newProjectObj, activeTab: 'dashboard' });
      } else {
        set({ activeTab: 'dashboard' }); // Will sync when Firebase listener runs
      }
    } catch (error) {
      handleFirestoreError(error, OperationType.CREATE, 'projects');
    }
  },

  handleUpdateTasks: async (projectId: string, updatedTasks: any[]) => {
    try {
      const projectRef = doc(db, 'projects', projectId);
      await updateDoc(projectRef, { tasks: updatedTasks });
    } catch (error) {
      handleFirestoreError(error, OperationType.UPDATE, `projects/${projectId}`);
    }
  },

  updateVentureBranding: async (brandingUpdates: any) => {
    const { selectedProject } = get();
    if (!selectedProject) return;
    try {
      const projectRef = doc(db, 'projects', selectedProject.id);
      const updatedBranding = {
        ...(selectedProject.branding || {}),
        ...brandingUpdates
      };
      await updateDoc(projectRef, { branding: updatedBranding });
      set({ selectedProject: { ...selectedProject, branding: updatedBranding } });
    } catch (error) {
      console.error("Failed to persist branding", error);
    }
  },

  toggleAutonomy: async (projectId: string) => {
    const { projects } = get();
    const project = projects.find(p => p.id === projectId);
    if (!project) return;

    const newValue = !project.isAutonomous;

    // Optimistic update
    set((state) => ({
      projects: state.projects.map(p => p.id === projectId ? { ...p, isAutonomous: newValue } : p),
      selectedProject: state.selectedProject?.id === projectId ? { ...state.selectedProject, isAutonomous: newValue } : state.selectedProject
    }));

    try {
      const projectRef = doc(db, 'projects', projectId);
      await updateDoc(projectRef, { isAutonomous: newValue });
    } catch (error) {
      console.error("Failed to toggle autonomy:", error);
    }
  }
});
