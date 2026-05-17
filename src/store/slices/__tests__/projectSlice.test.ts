import { describe, it, expect, vi, beforeEach } from 'vitest';
import { createProjectSlice } from '../projectSlice';
import { create } from 'zustand';

// Mock dependencies
vi.mock('../../../lib/firebase', () => ({
  db: {},
  OperationType: {
    CREATE: 'create',
    UPDATE: 'update',
    DELETE: 'delete',
  },
  handleFirestoreError: vi.fn(),
}));

// We need updateDoc and other firestore methods mocked properly
const mockUpdateDoc: any = vi.fn();
const mockDeleteDoc: any = vi.fn();
const mockAddDoc: any = vi.fn(() => Promise.resolve({ id: 'new-project-id' }));

vi.mock('firebase/firestore', () => ({
  doc: vi.fn(() => ({ id: 'mock-doc-ref' })),
  updateDoc: vi.fn((...args: any[]) => mockUpdateDoc(...args)),
  deleteDoc: vi.fn((...args: any[]) => mockDeleteDoc(...args)),
  addDoc: vi.fn((...args: any[]) => mockAddDoc(...args)),
  collection: vi.fn(() => ({ id: 'mock-collection-ref' })),
}));

vi.mock('../../../services/gemini', () => ({
  suggestTasks: vi.fn(() => Promise.resolve([{ title: 'Task 1' }])),
  specializeAgents: vi.fn(() => Promise.resolve({
    architect: { specialty: 'Systems' },
    coder: { specialty: 'Frontend' },
    marketer: { specialty: 'Growth' }
  }))
}));

// Create a mock store for testing
const useTestStore = create<any>((set, get, api) => ({
  ...createProjectSlice(set, get, api),
  // Add required state from other slices for testing
  currentUser: { uid: 'user-123' },
  refinedTemplates: [],
  handleGenerateRefinedTemplates: vi.fn(),
  showOnboarding: false,
  activeTab: 'dashboard',
}));

describe('projectSlice', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    useTestStore.setState({
      projects: [],
      selectedProject: null,
      currentUser: { uid: 'user-123' },
      refinedTemplates: [],
      showOnboarding: false,
      activeTab: 'dashboard',
    });
  });

  it('should initialize with default state', () => {
    const state: any = useTestStore.getState();
    expect(state.projects).toEqual([]);
    expect(state.selectedProject).toBeNull();
  });

  it('should set projects', () => {
    const mockProjects = [{ id: '1', name: 'Project 1' }];
    useTestStore.getState().setProjects(mockProjects);
    expect(useTestStore.getState().projects).toEqual(mockProjects);
  });

  it('should set selected project', () => {
    const mockProject = { id: '1', name: 'Project 1' };
    useTestStore.getState().setSelectedProject(mockProject);
    expect(useTestStore.getState().selectedProject).toEqual(mockProject);
  });

  describe('toggleAutonomy', () => {
    it('should handle optimistic update for toggleAutonomy', async () => {
      const mockProject = { id: '1', name: 'Project 1', isAutonomous: false };
      useTestStore.setState({
        projects: [mockProject],
        selectedProject: mockProject
      });

      await useTestStore.getState().toggleAutonomy('1');

      const state: any = useTestStore.getState();
      expect(state.projects[0].isAutonomous).toBe(true);
      expect(state.selectedProject.isAutonomous).toBe(true);
      expect(mockUpdateDoc).toHaveBeenCalled();
    });

    it('should do nothing if project not found', async () => {
      await useTestStore.getState().toggleAutonomy('non-existent');
      expect(mockUpdateDoc).not.toHaveBeenCalled();
    });
  });

  describe('updateAgent', () => {
    it('should handle optimistic update for updateAgent', async () => {
      const mockAgent = { id: 'agent-1', name: 'Agent 1', status: 'idle' };
      const mockProject = { id: '1', name: 'Project 1', agents: [mockAgent] };

      useTestStore.setState({
        projects: [mockProject],
        selectedProject: mockProject
      });

      await useTestStore.getState().updateAgent('1', 'agent-1', { status: 'working' });

      const state: any = useTestStore.getState();
      expect(state.projects[0].agents[0].status).toBe('working');
      expect(state.selectedProject.agents[0].status).toBe('working');
      expect(mockUpdateDoc).toHaveBeenCalled();
    });

    it('should do nothing if project not found', async () => {
      await useTestStore.getState().updateAgent('non-existent', 'agent-1', { status: 'working' });
      expect(mockUpdateDoc).not.toHaveBeenCalled();
    });
  });

  describe('addProjectLog', () => {
    it('should add a project log and call updateDoc', async () => {
      const mockProject = { id: '1', name: 'Project 1', logs: [] };
      useTestStore.setState({ projects: [mockProject] });

      await useTestStore.getState().addProjectLog('1', 'info', 'Test message', 'Test details');

      expect(mockUpdateDoc).toHaveBeenCalled();
      const updateCall = mockUpdateDoc.mock.calls[0];
      expect(updateCall[1].logs).toHaveLength(1);
      expect(updateCall[1].logs[0].message).toBe('Test message');
      expect(updateCall[1].logs[0].type).toBe('info');
    });

    it('should handle project with no initial logs array', async () => {
      const mockProject = { id: '1', name: 'Project 1' }; // No logs array
      useTestStore.setState({ projects: [mockProject] });

      await useTestStore.getState().addProjectLog('1', 'info', 'Test message');

      expect(mockUpdateDoc).toHaveBeenCalled();
      const updateCall = mockUpdateDoc.mock.calls[0];
      expect(updateCall[1].logs).toHaveLength(1);
      expect(updateCall[1].logs[0].message).toBe('Test message');
    });

    it('should do nothing if project not found', async () => {
      await useTestStore.getState().addProjectLog('non-existent', 'info', 'Test');
      expect(mockUpdateDoc).not.toHaveBeenCalled();
    });
  });

  describe('deleteProject', () => {
    it('should call deleteDoc and clear selectedProject if it was the deleted one', async () => {
      const mockProject = { id: '1', name: 'Project 1' };
      useTestStore.setState({ selectedProject: mockProject });

      await useTestStore.getState().deleteProject('1');

      expect(mockDeleteDoc).toHaveBeenCalled();
      expect(useTestStore.getState().selectedProject).toBeNull();
      expect(useTestStore.getState().activeTab).toBe('idea-lab');
    });

    it('should not clear selectedProject if a different project is deleted', async () => {
      const mockProject = { id: '1', name: 'Project 1' };
      useTestStore.setState({ selectedProject: mockProject });

      await useTestStore.getState().deleteProject('2');

      expect(mockDeleteDoc).toHaveBeenCalled();
      expect(useTestStore.getState().selectedProject).toEqual(mockProject);
    });
  });

  describe('createAgent', () => {
    it('should append a new agent and log it', async () => {
      const mockProject = { id: '1', name: 'Project 1', agents: [] };
      useTestStore.setState({ projects: [mockProject] });

      await useTestStore.getState().createAgent('1', {
        name: 'New Agent',
        role: 'Tester',
        specialty: 'QA',
        capabilities: ['test']
      });

      expect(mockUpdateDoc).toHaveBeenCalled();
      // First updateDoc call should be for adding the agent
      const updateCall = mockUpdateDoc.mock.calls[0];
      expect(updateCall[1].agents).toHaveLength(1);
      expect(updateCall[1].agents[0].name).toBe('New Agent');
      expect(updateCall[1].agents[0].status).toBe('idle');
      expect(updateCall[1].agents[0].avatar).toContain('New Agent');

      // Because addProjectLog uses the store's get(), and the store wasn't synchronously updated with the new agent array in projects,
      // addProjectLog will be called and trigger a second updateDoc (since addProjectLog doesn't update zustand state directly)
      // the test focuses on the side effects
    });

    it('should do nothing if project not found', async () => {
      await useTestStore.getState().createAgent('non-existent', {
        name: 'New', role: 'Role', specialty: 'Spec', capabilities: []
      });
      expect(mockUpdateDoc).not.toHaveBeenCalled();
    });
  });

  describe('completeTask', () => {
    it('should update task status to completed and set progress to 100', async () => {
      const mockTask = { id: 'task-1', title: 'Test Task', status: 'pending', progress: 0 };
      const mockProject = { id: '1', name: 'Project 1', tasks: [mockTask] };
      useTestStore.setState({ projects: [mockProject] });

      await useTestStore.getState().completeTask('1', 'task-1', 'Task finished');

      expect(mockUpdateDoc).toHaveBeenCalled();
      const updateCall = mockUpdateDoc.mock.calls[0];
      expect(updateCall[1].tasks[0].status).toBe('completed');
      expect(updateCall[1].tasks[0].progress).toBe(100);
    });

    it('should not add log if logMessage is omitted', async () => {
       const mockTask = { id: 'task-1', title: 'Test Task', status: 'pending', progress: 0 };
       const mockProject = { id: '1', name: 'Project 1', tasks: [mockTask] };
       useTestStore.setState({ projects: [mockProject] });

       await useTestStore.getState().completeTask('1', 'task-1');

       // Only one updateDoc for tasks, no second one for logs
       expect(mockUpdateDoc).toHaveBeenCalledTimes(1);
    });

    it('should do nothing if project not found', async () => {
      await useTestStore.getState().completeTask('non-existent', 'task-1');
      expect(mockUpdateDoc).not.toHaveBeenCalled();
    });
  });

  describe('updateVentureBranding', () => {
    it('should update branding in selected project and store', async () => {
      const mockProject = {
        id: '1',
        name: 'Project 1',
        branding: { colors: { primary: '#000' } }
      };
      useTestStore.setState({ selectedProject: mockProject });

      await useTestStore.getState().updateVentureBranding({ colors: { primary: '#fff' }, logo: 'logo.png' });

      expect(mockUpdateDoc).toHaveBeenCalled();
      const updateCall = mockUpdateDoc.mock.calls[0];

      expect(updateCall[1].branding.colors.primary).toBe('#fff');
      expect(updateCall[1].branding.logo).toBe('logo.png');

      const state: any = useTestStore.getState();
      expect(state.selectedProject.branding.colors.primary).toBe('#fff');
      expect(state.selectedProject.branding.logo).toBe('logo.png');
    });

    it('should do nothing if no selected project', async () => {
      useTestStore.setState({ selectedProject: null });
      await useTestStore.getState().updateVentureBranding({ name: 'New Name' });
      expect(mockUpdateDoc).not.toHaveBeenCalled();
    });
  });

  describe('handleUpdateTasks', () => {
    it('should call updateDoc with new tasks', async () => {
      const newTasks = [{ id: 'task-2', title: 'New Task' }];
      await useTestStore.getState().handleUpdateTasks('1', newTasks);

      expect(mockUpdateDoc).toHaveBeenCalled();
      const updateCall = mockUpdateDoc.mock.calls[0];
      expect(updateCall[1].tasks).toEqual(newTasks);
    });
  });

  describe('startProject', () => {
      it('should create a project and dispatch generation tasks', async () => {
        const mockIdea = {
            id: 'idea-1',
            title: 'Test Idea',
            description: 'A test idea',
            tags: ['test'],
        };

        await useTestStore.getState().startProject(mockIdea);

        expect(mockAddDoc).toHaveBeenCalled();
        // Wait for asynchronous promise callbacks to resolve inside startProject
        await new Promise(process.nextTick);
        await new Promise(process.nextTick);

        // Check if updateDoc was called for tasks and agents (triggered by Gemini mocks)
        expect(mockUpdateDoc).toHaveBeenCalled();
      });

      it('should show onboarding if no current user', async () => {
          useTestStore.setState({ currentUser: null });
          await useTestStore.getState().startProject({ title: 'Test', description: 'Test' } as any);

          expect(useTestStore.getState().showOnboarding).toBe(true);
          expect(mockAddDoc).not.toHaveBeenCalled();
      });
  });
});
