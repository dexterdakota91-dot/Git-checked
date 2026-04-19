import { StateCreator } from 'zustand';
import { User, signInWithPopup, signOut } from 'firebase/auth';
import { auth, googleProvider } from '../../lib/firebase';
import { AppState } from '../useStore';

export interface AuthSlice {
  currentUser: User | null;
  setCurrentUser: (user: User | null) => void;
  isAuthReady: boolean;
  setIsAuthReady: (isReady: boolean) => void;
  
  // Auth Actions
  handleLogin: () => Promise<void>;
  handleLogout: () => Promise<void>;
}

export const createAuthSlice: StateCreator<AppState, [], [], AuthSlice> = (set) => ({
  currentUser: null,
  setCurrentUser: (user) => set({ currentUser: user }),
  isAuthReady: false,
  setIsAuthReady: (isReady) => set({ isAuthReady: isReady }),

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
});
