import { StateCreator } from 'zustand';
import { AppState } from '../useStore';
import { chatWithArchitect } from '../../services/gemini';

export interface ChatSlice {
  isChatLoading: boolean;
  setIsChatLoading: (isLoading: boolean) => void;
  chatMessages: { role: 'user' | 'model', text: string }[];
  setChatMessages: (messages: { role: 'user' | 'model', text: string }[] | ((prev: { role: 'user' | 'model', text: string }[]) => { role: 'user' | 'model', text: string }[])) => void;
  chatInput: string;
  setChatInput: (input: string) => void;
  isChatOpen: boolean;
  setIsChatOpen: (isOpen: boolean) => void;

  handleSendMessage: () => Promise<void>;
}

export const createChatSlice: StateCreator<AppState, [], [], ChatSlice> = (set, get) => ({
  isChatLoading: false,
  setIsChatLoading: (isLoading) => set({ isChatLoading: isLoading }),
  chatMessages: [],
  setChatMessages: (messages) => set((state) => ({
    chatMessages: typeof messages === 'function' ? messages(state.chatMessages) : messages
  })),
  chatInput: '',
  setChatInput: (input) => set({ chatInput: input }),
  isChatOpen: false,
  setIsChatOpen: (isOpen) => set({ isChatOpen: isOpen }),

  handleSendMessage: async () => {
    const { chatInput, chatMessages, selectedProject, activeTab } = get();
    if (!chatInput.trim()) return;

    const newMessage = { role: 'user' as const, text: chatInput };
    set({ 
      chatMessages: [...chatMessages, newMessage],
      chatInput: '',
      isChatLoading: true
    });

    try {
      const response = await chatWithArchitect(
        newMessage.text, 
        [...chatMessages, newMessage],
        { activeTab, project: selectedProject }
      );
      
      if (response) {
        set((state) => ({
          chatMessages: [...state.chatMessages, { role: 'model', text: response }]
        }));
      }
    } catch (error) {
      console.error("Chat error", error);
      set((state) => ({
        chatMessages: [...state.chatMessages, { role: 'model', text: 'I encountered an error processing that request. Please try again.' }]
      }));
    } finally {
      set({ isChatLoading: false });
    }
  },
});
