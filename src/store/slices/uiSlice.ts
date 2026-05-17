import { StateCreator } from 'zustand';
import { AppState } from '../useStore';

export interface UISlice {
  activeTab: string;
  setActiveTab: (tab: string) => void;
  showOnboarding: boolean;
  setShowOnboarding: (show: boolean) => void;
  isVentureSettingsOpen: boolean;
  setIsVentureSettingsOpen: (isOpen: boolean) => void;
  isUserSettingsOpen: boolean;
  setIsUserSettingsOpen: (isOpen: boolean) => void;
  isResetConfirmOpen: boolean;
  setIsResetConfirmOpen: (isOpen: boolean) => void;
  resetUiOnLogout: () => void;
}

export const createUISlice: StateCreator<AppState, [], [], UISlice> = (set) => ({
  activeTab: 'landing',
  setActiveTab: (tab) => set({ activeTab: tab }),
  showOnboarding: false,
  setShowOnboarding: (show) => set({ showOnboarding: show }),
  isVentureSettingsOpen: false,
  setIsVentureSettingsOpen: (isOpen) => set({ isVentureSettingsOpen: isOpen }),
  isUserSettingsOpen: false,
  setIsUserSettingsOpen: (isOpen) => set({ isUserSettingsOpen: isOpen }),
  isResetConfirmOpen: false,
  setIsResetConfirmOpen: (isOpen) => set({ isResetConfirmOpen: isOpen }),
  resetUiOnLogout: () => set({ activeTab: 'landing', showOnboarding: false, isVentureSettingsOpen: false, isUserSettingsOpen: false, isResetConfirmOpen: false }),
});
