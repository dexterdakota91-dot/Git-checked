import { create } from 'zustand';
import { db, OperationType, handleFirestoreError } from '../lib/firebase';
import { doc, setDoc, writeBatch } from 'firebase/firestore';

import { AuthSlice, createAuthSlice } from './slices/authSlice';
import { ChatSlice, createChatSlice } from './slices/chatSlice';
import { BankingSlice, createBankingSlice } from './slices/bankingSlice';
import { UISlice, createUISlice } from './slices/uiSlice';
import { ProjectSlice, createProjectSlice } from './slices/projectSlice';
import { IdeaLabSlice, createIdeaLabSlice } from './slices/ideaLabSlice';
import { BrandingSlice, createBrandingSlice } from './slices/brandingSlice';

export interface AppState extends 
  AuthSlice, 
  ChatSlice, 
  BankingSlice, 
  UISlice, 
  ProjectSlice, 
  IdeaLabSlice, 
  BrandingSlice 
{
  completeOnboarding: () => Promise<void>;
  resetAccount: () => Promise<void>;
}

export const useStore = create<AppState>()((set, get, api) => ({
  ...createAuthSlice(set, get, api),
  ...createChatSlice(set, get, api),
  ...createBankingSlice(set, get, api),
  ...createUISlice(set, get, api),
  ...createProjectSlice(set, get, api),
  ...createIdeaLabSlice(set, get, api),
  ...createBrandingSlice(set, get, api),

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

  resetAccount: async () => {
    const { currentUser, projects } = get();
    if (!currentUser || projects.length === 0) return;
    try {
      const batch = writeBatch(db);
      for (const p of projects) {
        batch.delete(doc(db, 'projects', p.id));
      }
      await batch.commit();

      set({ selectedProject: null, activeTab: 'idea-lab', isUserSettingsOpen: false });
    } catch (error) {
      console.error("Account reset failed", error);
    }
  },
}));
