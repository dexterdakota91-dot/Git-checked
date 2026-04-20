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
  updateVentureBranding: (brandingUpdates: any) => Promise<void>;
}

export const createProjectSlice: StateCreator<AppState, [], [], ProjectSlice> = (set, get) => ({
  projects: [],
  setProjects: (projects) => set((state) => ({ 
    projects: typeof projects === 'function' ? projects(state.projects) : projects 
  })),
  selectedProject: null,
  setSelectedProject: (project) => set({ selectedProject: project }),

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
    const { currentUser, projects, refinedTemplates } = get();
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
      suggestTasks(idea.title, idea.description, 'ideation').then(async (tasks) => {
        if (tasks && tasks.length > 0) {
          const projectRef = doc(db, 'projects', projectId);
          await updateDoc(projectRef, { tasks });
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
  }
});
