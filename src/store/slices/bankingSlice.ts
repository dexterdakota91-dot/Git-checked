import { StateCreator } from 'zustand';
import { AppState } from '../useStore';
import { db, OperationType, handleFirestoreError } from '../../lib/firebase';
import { doc, updateDoc } from 'firebase/firestore';

export interface BankingSlice {
  isBankLinked: boolean;
  setIsBankLinked: (isLinked: boolean) => void;
  plaidToken: string | null;
  setPlaidToken: (token: string | null) => void;
  plaidError: string | null;
  setPlaidError: (error: string | null) => void;
  
  addStripeIntegration: (projectId: string) => Promise<void>;
}

export const createBankingSlice: StateCreator<AppState, [], [], BankingSlice> = (set) => ({
  isBankLinked: false,
  setIsBankLinked: (isLinked) => set({ isBankLinked: isLinked }),
  plaidToken: null,
  setPlaidToken: (token) => set({ plaidToken: token }),
  plaidError: null,
  setPlaidError: (error) => set({ plaidError: error }),

  addStripeIntegration: async (projectId: string) => {
    try {
      const projectRef = doc(db, 'projects', projectId);
      await updateDoc(projectRef, {
        stripeEnabled: true,
        updatedAt: new Date().toISOString()
      });
    } catch (error) {
      handleFirestoreError(error, OperationType.UPDATE, `projects/${projectId}`);
    }
  },
});
