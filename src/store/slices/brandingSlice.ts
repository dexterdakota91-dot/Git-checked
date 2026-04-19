import { StateCreator } from 'zustand';
import { AppState } from '../useStore';
import { db } from '../../lib/firebase';
import { doc, updateDoc } from 'firebase/firestore';
import { generateBranding, generateMissionStatements, generatePalettes } from '../../services/gemini';

export interface BrandingSlice {
  activeLabTab: string;
  setActiveLabTab: (tab: string) => void;
  onboardingStep: number;
  setOnboardingStep: (step: number) => void;
  isBrandingGenerating: boolean;
  setIsBrandingGenerating: (isGenerating: boolean) => void;
  isMissionGenerating: boolean;
  setIsMissionGenerating: (isGenerating: boolean) => void;
  isPaletteGenerating: boolean;
  setIsPaletteGenerating: (isGenerating: boolean) => void;
  customPalette: string[];
  setCustomPalette: (palette: string[]) => void;
  brandColors: string[];
  setBrandColors: (colors: string[]) => void;
  
  editedVentureName: string;
  setEditedVentureName: (name: string) => void;
  editedVentureDescription: string;
  setEditedVentureDescription: (desc: string) => void;
  committedVentureName: string;
  setCommittedVentureName: (name: string) => void;
  committedVentureDescription: string;
  setCommittedVentureDescription: (desc: string) => void;
  isBrandingConfirmOpen: boolean;
  setIsBrandingConfirmOpen: (isOpen: boolean) => void;
  pendingBrandingUpdate: { type: 'logo' | 'name' | 'palette' | 'mission'; value: any; } | null;
  setPendingBrandingUpdate: (update: { type: 'logo' | 'name' | 'palette' | 'mission'; value: any; } | null) => void;

  handleGenerateBranding: () => Promise<void>;
  handleGenerateMissionStatements: () => Promise<void>;
  handleGeneratePalettes: () => Promise<void>;
}

export const createBrandingSlice: StateCreator<AppState, [], [], BrandingSlice> = (set, get) => ({
  activeLabTab: 'brand',
  setActiveLabTab: (tab) => set({ activeLabTab: tab }),
  onboardingStep: 0,
  setOnboardingStep: (step) => set({ onboardingStep: step }),
  isBrandingGenerating: false,
  setIsBrandingGenerating: (isGenerating) => set({ isBrandingGenerating: isGenerating }),
  isMissionGenerating: false,
  setIsMissionGenerating: (isGenerating) => set({ isMissionGenerating: isGenerating }),
  isPaletteGenerating: false,
  setIsPaletteGenerating: (isGenerating) => set({ isPaletteGenerating: isGenerating }),
  customPalette: ['#3b82f6', '#0066FF', '#f59e0b'],
  setCustomPalette: (palette) => set({ customPalette: palette }),
  brandColors: ['#3b82f6', '#0066FF', '#f59e0b'],
  setBrandColors: (colors) => set({ brandColors: colors }),
  
  editedVentureName: '',
  setEditedVentureName: (name) => set({ editedVentureName: name }),
  editedVentureDescription: '',
  setEditedVentureDescription: (desc) => set({ editedVentureDescription: desc }),
  committedVentureName: '',
  setCommittedVentureName: (name) => set({ committedVentureName: name }),
  committedVentureDescription: '',
  setCommittedVentureDescription: (desc) => set({ committedVentureDescription: desc }),
  isBrandingConfirmOpen: false,
  setIsBrandingConfirmOpen: (isOpen) => set({ isBrandingConfirmOpen: isOpen }),
  pendingBrandingUpdate: null,
  setPendingBrandingUpdate: (update) => set({ pendingBrandingUpdate: update }),

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
});
