import { create } from 'zustand';
import { Project, BusinessIdea } from '../types';
import { User, signInWithPopup, signOut } from 'firebase/auth';
import { auth, googleProvider, db, OperationType, handleFirestoreError } from '../lib/firebase';
import { addDoc, collection, doc, updateDoc, deleteDoc, setDoc, getDoc } from 'firebase/firestore';
import { generateBusinessIdeas, generateRefinedTemplate, generateBranding, generateMissionStatements, generatePalettes, suggestTasks, specializeAgents, chatWithArchitect } from '../services/gemini';
import { PREDEFINED_TEMPLATES } from '../constants/templates';

interface AppState {
  // Navigation & UI State
  activeTab: string;
  setActiveTab: (tab: string) => void;
  isChatOpen: boolean;
  setIsChatOpen: (isOpen: boolean) => void;
  showOnboarding: boolean;
  setShowOnboarding: (show: boolean) => void;
  
  // Auth State
  currentUser: User | null;
  setCurrentUser: (user: User | null) => void;
  isAuthReady: boolean;
  setIsAuthReady: (isReady: boolean) => void;
  
  // Core Data
  projects: Project[];
  setProjects: (projects: Project[] | ((prev: Project[]) => Project[])) => void;
  selectedProject: Project | null;
  setSelectedProject: (project: Project | null) => void;
  
  // Idea Lab State
  ideas: BusinessIdea[];
  setIdeas: (ideas: BusinessIdea[]) => void;
  refinedTemplates: BusinessIdea[];
  setRefinedTemplates: (templates: BusinessIdea[]) => void;
  isGenerating: boolean;
  setIsGenerating: (isGenerating: boolean) => void;
  isTemplatesGenerating: boolean;
  setIsTemplatesGenerating: (isGenerating: boolean) => void;
  
  // Chat State
  isChatLoading: boolean;
  setIsChatLoading: (isLoading: boolean) => void;
  chatMessages: { role: 'user' | 'model', text: string }[];
  setChatMessages: (messages: { role: 'user' | 'model', text: string }[] | ((prev: { role: 'user' | 'model', text: string }[]) => { role: 'user' | 'model', text: string }[])) => void;
  chatInput: string;
  setChatInput: (input: string) => void;
  
  // Legal & Banking State
  userState: string;
  setUserState: (state: string) => void;
  isBankLinked: boolean;
  setIsBankLinked: (isLinked: boolean) => void;
  plaidToken: string | null;
  setPlaidToken: (token: string | null) => void;
  plaidError: string | null;
  setPlaidError: (error: string | null) => void;
  
  // Branding Lab State
  activeLabTab: string;
  setActiveLabTab: (tab: string) => void;
  isBrandingGenerating: boolean;
  setIsBrandingGenerating: (isGenerating: boolean) => void;
  isMissionGenerating: boolean;
  setIsMissionGenerating: (isGenerating: boolean) => void;
  isPaletteGenerating: boolean;
  setIsPaletteGenerating: (isGenerating: boolean) => void;
  customPalette: string[];
  setCustomPalette: (palette: string[]) => void;
  
  // Settings & Modals State
  isVentureSettingsOpen: boolean;
  setIsVentureSettingsOpen: (isOpen: boolean) => void;
  editedVentureName: string;
  setEditedVentureName: (name: string) => void;
  editedVentureDescription: string;
  setEditedVentureDescription: (desc: string) => void;
  committedVentureName: string;
  setCommittedVentureName: (name: string) => void;
  committedVentureDescription: string;
  setCommittedVentureDescription: (desc: string) => void;
  isUserSettingsOpen: boolean;
  setIsUserSettingsOpen: (isOpen: boolean) => void;
  isBrandingConfirmOpen: boolean;
  setIsBrandingConfirmOpen: (isOpen: boolean) => void;
  isResetConfirmOpen: boolean;
  setIsResetConfirmOpen: (isOpen: boolean) => void;
  pendingBrandingUpdate: { type: 'logo' | 'name' | 'palette' | 'mission'; value: any; } | null;
  setPendingBrandingUpdate: (update: { type: 'logo' | 'name' | 'palette' | 'mission'; value: any; } | null) => void;

  // Actions
  handleLogin: () => Promise<void>;
  handleLogout: () => Promise<void>;
  completeOnboarding: () => Promise<void>;
  deleteProject: (projectId: string) => Promise<void>;
  resetAccount: () => Promise<void>;
  startProject: (idea: BusinessIdea) => Promise<void>;
  handleGenerateBranding: () => Promise<void>;
  handleGenerateMissionStatements: () => Promise<void>;
  handleGeneratePalettes: () => Promise<void>;
  handleGenerateIdeas: () => Promise<void>;
  handleGenerateRefinedTemplates: (count?: number) => Promise<void>;
  handleSendMessage: () => Promise<void>;
  addStripeIntegration: (projectId: string) => Promise<void>;
  handleUpdateTasks: (projectId: string, updatedTasks: any[]) => Promise<void>;
}

export const useStore = create<AppState>((set, get) => ({
  // Navigation & UI State
  activeTab: 'landing',
  setActiveTab: (tab) => set({ activeTab: tab }),
  isChatOpen: false,
  setIsChatOpen: (isOpen) => set({ isChatOpen: isOpen }),
  showOnboarding: false,
  setShowOnboarding: (show) => set({ showOnboarding: show }),
  
  // Auth State
  currentUser: null,
  setCurrentUser: (user) => set({ currentUser: user }),
  isAuthReady: false,
  setIsAuthReady: (isReady) => set({ isAuthReady: isReady }),
  
  // Core Data
  projects: [],
  setProjects: (projects) => set((state) => ({ 
    projects: typeof projects === 'function' ? projects(state.projects) : projects 
  })),
  selectedProject: null,
  setSelectedProject: (project) => set({ selectedProject: project }),
  
  // Idea Lab State
  ideas: [],
  setIdeas: (ideas) => set({ ideas }),
  refinedTemplates: PREDEFINED_TEMPLATES,
  setRefinedTemplates: (refinedTemplates) => set({ refinedTemplates }),
  isGenerating: false,
  setIsGenerating: (isGenerating) => set({ isGenerating }),
  isTemplatesGenerating: false,
  setIsTemplatesGenerating: (isTemplatesGenerating) => set({ isTemplatesGenerating }),
  
  // Chat State
  isChatLoading: false,
  setIsChatLoading: (isLoading) => set({ isChatLoading: isLoading }),
  chatMessages: [],
  setChatMessages: (messages) => set((state) => ({
    chatMessages: typeof messages === 'function' ? messages(state.chatMessages) : messages
  })),
  chatInput: '',
  setChatInput: (input) => set({ chatInput: input }),
  
  // Legal & Banking State
  userState: '',
  setUserState: (state) => set({ userState: state }),
  isBankLinked: false,
  setIsBankLinked: (isLinked) => set({ isBankLinked: isLinked }),
  plaidToken: null,
  setPlaidToken: (token) => set({ plaidToken: token }),
  plaidError: null,
  setPlaidError: (error) => set({ plaidError: error }),
  
  // Branding Lab State
  activeLabTab: 'brand',
  setActiveLabTab: (tab) => set({ activeLabTab: tab }),
  isBrandingGenerating: false,
  setIsBrandingGenerating: (isGenerating) => set({ isBrandingGenerating: isGenerating }),
  isMissionGenerating: false,
  setIsMissionGenerating: (isGenerating) => set({ isMissionGenerating: isGenerating }),
  isPaletteGenerating: false,
  setIsPaletteGenerating: (isGenerating) => set({ isPaletteGenerating: isGenerating }),
  customPalette: ['#3b82f6', '#0066FF', '#f59e0b'],
  setCustomPalette: (palette) => set({ customPalette: palette }),
  
  // Settings & Modals State
  isVentureSettingsOpen: false,
  setIsVentureSettingsOpen: (isOpen) => set({ isVentureSettingsOpen: isOpen }),
  editedVentureName: '',
  setEditedVentureName: (name) => set({ editedVentureName: name }),
  editedVentureDescription: '',
  setEditedVentureDescription: (desc) => set({ editedVentureDescription: desc }),
  committedVentureName: '',
  setCommittedVentureName: (name) => set({ committedVentureName: name }),
  committedVentureDescription: '',
  setCommittedVentureDescription: (desc) => set({ committedVentureDescription: desc }),
  isUserSettingsOpen: false,
  setIsUserSettingsOpen: (isOpen) => set({ isUserSettingsOpen: isOpen }),
  isBrandingConfirmOpen: false,
  setIsBrandingConfirmOpen: (isOpen) => set({ isBrandingConfirmOpen: isOpen }),
  isResetConfirmOpen: false,
  setIsResetConfirmOpen: (isOpen) => set({ isResetConfirmOpen: isOpen }),
  pendingBrandingUpdate: null,
  setPendingBrandingUpdate: (update) => set({ pendingBrandingUpdate: update }),

  // Actions
  handleLogin: async () => {
    try {
      await signInWithPopup(auth, googleProvider);
    } catch (error) {
      console.error("Login failed", error);
    }
  },

  handleLogout: async () => {
    try {
      await signOut(auth);
      set({ activeTab: 'landing', selectedProject: null });
    } catch (error) {
      console.error("Logout failed", error);
    }
  },

  completeOnboarding: async () => {
    const { currentUser, userState } = get();
    if (!currentUser) return;
    try {
      await setDoc(doc(db, 'users', currentUser.uid), {
        uid: currentUser.uid,
        email: currentUser.email,
        displayName: currentUser.displayName,
        photoURL: currentUser.photoURL,
        state: userState,
        onboardingCompleted: true,
        createdAt: new Date().toISOString()
      });
      set({ showOnboarding: false });
    } catch (error) {
      handleFirestoreError(error, OperationType.CREATE, `users/${currentUser.uid}`);
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

  resetAccount: async () => {
    const { currentUser, projects } = get();
    if (!currentUser || projects.length === 0) return;
    try {
      for (const p of projects) {
        await deleteDoc(doc(db, 'projects', p.id));
      }
      set({ selectedProject: null, activeTab: 'idea-lab', isUserSettingsOpen: false });
    } catch (error) {
      console.error("Account reset failed", error);
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
      specializeAgents(idea.title, idea.description).then(async (agents) => {
        if (agents && agents.length > 0) {
          const projectRef = doc(db, 'projects', projectId);
          await updateDoc(projectRef, { agents });
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

  handleGenerateBranding: async () => {
    const { selectedProject } = get();
    if (!selectedProject) return;
    set({ isBrandingGenerating: true });
    try {
      const brandingData = await generateBranding(selectedProject.name, selectedProject.description);
      if (brandingData) {
        const projectRef = doc(db, 'projects', selectedProject.id);
        const updatedBranding = {
          ...(selectedProject.branding || {}),
          ...brandingData,
          logoType: selectedProject.branding?.logoType,
          selectedPalette: selectedProject.branding?.selectedPalette
        };
        await updateDoc(projectRef, { branding: updatedBranding });
        set({ selectedProject: { ...selectedProject, branding: updatedBranding } });
      }
    } catch (error) {
      console.error("Branding generation failed", error);
    } finally {
      set({ isBrandingGenerating: false });
    }
  },

  handleGenerateMissionStatements: async () => {
    const { selectedProject } = get();
    if (!selectedProject) return;
    set({ isMissionGenerating: true });
    try {
      const missions = await generateMissionStatements(selectedProject.name, selectedProject.description);
      if (missions) {
        const projectRef = doc(db, 'projects', selectedProject.id);
        const updatedBranding = {
          ...(selectedProject.branding || {}),
          suggestedMissionStatements: missions
        };
        await updateDoc(projectRef, { branding: updatedBranding });
        set({ selectedProject: { ...selectedProject, branding: updatedBranding } });
      }
    } catch (error) {
      console.error("Mission generation failed", error);
    } finally {
      set({ isMissionGenerating: false });
    }
  },

  handleGeneratePalettes: async () => {
    const { selectedProject } = get();
    if (!selectedProject) return;
    set({ isPaletteGenerating: true });
    try {
      const palettes = await generatePalettes(selectedProject.name, selectedProject.description);
      if (palettes) {
        const projectRef = doc(db, 'projects', selectedProject.id);
        const updatedBranding = {
          ...(selectedProject.branding || {}),
          suggestedPalettes: palettes
        };
        await updateDoc(projectRef, { branding: updatedBranding });
        set({ selectedProject: { ...selectedProject, branding: updatedBranding } });
      }
    } catch (error) {
      console.error("Palette generation failed", error);
    } finally {
      set({ isPaletteGenerating: false });
    }
  },

  handleGenerateIdeas: async () => {
    set({ isGenerating: true });
    try {
      const newIdeas = await generateBusinessIdeas();
      const { ideas } = get();
      set({ ideas: [...newIdeas, ...ideas] });
    } catch (error) {
      console.error("Idea generation failed", error);
    } finally {
      set({ isGenerating: false });
    }
  },

  handleGenerateRefinedTemplates: async (count: number = 2) => {
    const { userState } = get();
    set({ isTemplatesGenerating: true });
    try {
      const newTemplates: BusinessIdea[] = [];
      for (let i = 0; i < count; i++) {
        const template = await generateRefinedTemplate(userState);
        if (template) {
          newTemplates.push({ ...template, id: `blueprint-${Date.now()}-${i}` });
        }
      }
      set(state => ({
        refinedTemplates: [...newTemplates, ...state.refinedTemplates]
      }));
    } catch (error) {
      console.error("Template generation failed", error);
    } finally {
      set({ isTemplatesGenerating: false });
    }
  },

  handleSendMessage: async () => {
    const { chatInput, isChatLoading, chatMessages } = get();
    if (!chatInput.trim() || isChatLoading) return;
    
    const userMsg: {role: 'user' | 'model', text: string} = { role: 'user', text: chatInput };
    set({ 
      chatMessages: [...chatMessages, userMsg],
      chatInput: '',
      isChatLoading: true
    });
    
    try {
      const response = await chatWithArchitect(chatInput, chatMessages);
      const newMsg: {role: 'user' | 'model', text: string} = { role: 'model', text: response || '' };
      set((state) => ({ chatMessages: [...state.chatMessages, newMsg] }));
    } finally {
      set({ isChatLoading: false });
    }
  },

  addStripeIntegration: async (projectId: string) => {
    const { currentUser } = get();
    if (!currentUser) return;
    try {
      const projectRef = doc(db, 'projects', projectId);
      const projectSnap = await getDoc(projectRef);
      if (!projectSnap.exists()) return;

      const currentProject = projectSnap.data();
      const stripeTask = {
        id: Math.random().toString(),
        title: 'Stripe Integration',
        description: 'AI Agent adding Stripe payment gateway to the generated app',
        status: 'in-progress',
        priority: 'high',
        category: 'financial',
        progress: 10
      };
      
      const newLog = {
        id: Math.random().toString(),
        timestamp: new Date().toISOString(),
        type: 'info',
        message: 'Agent Coder initiated Stripe integration sequence'
      };

      await updateDoc(projectRef, {
        tasks: [...(currentProject.tasks || []), stripeTask],
        logs: [newLog, ...(currentProject.logs || [])].slice(0, 50)
      });

      // Simulate completion
      setTimeout(async () => {
        const updatedSnap = await getDoc(projectRef);
        if (!updatedSnap.exists()) return;
        const updatedProject = updatedSnap.data();
        
        const successLog = {
          id: Math.random().toString(),
          timestamp: new Date().toISOString(),
          type: 'success',
          message: 'Stripe integration complete. Payments are now active.'
        };

        const updatedTasks = updatedProject.tasks?.map((t: any) => 
          t.id === stripeTask.id ? { ...t, status: 'completed', progress: 100 } : t
        ) || [];

        await updateDoc(projectRef, {
          tasks: updatedTasks,
          logs: [successLog, ...(updatedProject.logs || [])].slice(0, 50)
        });
      }, 5000);
    } catch (error) {
      handleFirestoreError(error, OperationType.UPDATE, `projects/${projectId}`);
    }
  },

  handleUpdateTasks: async (projectId: string, updatedTasks: any[]) => {
    try {
      const projectRef = doc(db, 'projects', projectId);
      await updateDoc(projectRef, { tasks: updatedTasks });
    } catch (error) {
      handleFirestoreError(error, OperationType.UPDATE, `projects/${projectId}`);
    }
  }

}));
