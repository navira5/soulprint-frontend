import { create } from 'zustand';
import { initChatSession, sendChatMessage } from '../api/endpoints';

export const useChatStore = create((set, get) => ({
  sessionId: null,
  personaInfo: null,
  messages: [],
  isLoading: false,
  error: null,

  initSession: async (personaId) => {
    set({ isLoading: true, error: null });
    try {
      const response = await initChatSession(personaId);
      set({
        sessionId: response.session_id,
        personaInfo: response.persona_info,
        messages: [],
        isLoading: false,
      });
    } catch (error) {
      set({ error: error.message, isLoading: false });
    }
  },

  sendMessage: async (message) => {
    const { sessionId, messages } = get();
    if (!sessionId) return;

    const userMessage = { role: 'user', content: message, timestamp: new Date() };
    set({ messages: [...messages, userMessage], isLoading: true });

    try {
      const response = await sendChatMessage(sessionId, message);
      const assistantMessage = {
        role: 'assistant',
        content: response.response,
        validation: response.validation,
        context: response.context,
        timestamp: new Date(),
      };
      set((state) => ({
        messages: [...state.messages, assistantMessage],
        isLoading: false
      }));
    } catch (error) {
      set({ error: error.message, isLoading: false });
    }
  },

  clearSession: () => {
    set({ sessionId: null, personaInfo: null, messages: [], error: null });
  },
}));
