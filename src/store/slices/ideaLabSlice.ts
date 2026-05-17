import { StateCreator } from 'zustand';
import { AppState } from '../useStore';
import { BusinessIdea } from '../../types';
import { generateBusinessIdeas, generateRefinedTemplate } from '../../services/gemini';
import { PREDEFINED_TEMPLATES } from '../../constants/templates';


const MAX_TEMPLATES = 10;
const MAX_CONCURRENT = 3;

export interface IdeaLabSlice {
  ideas: BusinessIdea[];
  setIdeas: (ideas: BusinessIdea[]) => void;
  refinedTemplates: BusinessIdea[];
  setRefinedTemplates: (templates: BusinessIdea[]) => void;
  isGenerating: boolean;
  setIsGenerating: (isGenerating: boolean) => void;
  isTemplatesGenerating: boolean;
  setIsTemplatesGenerating: (isGenerating: boolean) => void;

  handleGenerateIdeas: () => Promise<void>;
  handleGenerateRefinedTemplates: (count?: number) => Promise<void>;
}

export const createIdeaLabSlice: StateCreator<AppState, [], [], IdeaLabSlice> = (set, get) => ({
  ideas: [],
  setIdeas: (ideas) => set({ ideas }),
  refinedTemplates: PREDEFINED_TEMPLATES,
  setRefinedTemplates: (refinedTemplates) => set({ refinedTemplates }),
  isGenerating: false,
  setIsGenerating: (isGenerating) => set({ isGenerating }),
  isTemplatesGenerating: false,
  setIsTemplatesGenerating: (isTemplatesGenerating) => set({ isTemplatesGenerating }),

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
      const validCount = Math.max(1, Math.min(MAX_TEMPLATES, Math.floor(Number(count) || 2)));
      const templates: (BusinessIdea | null)[] = [];
      for (let i = 0; i < validCount; i += MAX_CONCURRENT) {
        const batchSize = Math.min(MAX_CONCURRENT, validCount - i);
        const batchPromises = Array.from({ length: batchSize }, () => generateRefinedTemplate(userState));
        const batchResults = await Promise.all(batchPromises);
        templates.push(...batchResults);
      }

      const newTemplates: BusinessIdea[] = templates
        .map((template, i) => template ? { ...template, id: `blueprint-${Date.now()}-${i}` } : null)
        .filter((template): template is BusinessIdea => template !== null);
      set(state => ({
        refinedTemplates: [...newTemplates, ...state.refinedTemplates]
      }));
    } catch (error) {
      console.error("Template generation failed", error);
    } finally {
      set({ isTemplatesGenerating: false });
    }
  },
});
