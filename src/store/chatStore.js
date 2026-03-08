import { create } from 'zustand';
import { initChatSession, sendChatMessage } from '../api/endpoints';

export const useChatStore = create((set, get) => ({
  sessionId: null,
  personaInfo: null,
  messages: [],
  isLoading: false,
  error: null,

  initSession: async (personaId) => {
    console.log('[chatStore] initSession called with:', personaId);
    set({ isLoading: true, error: null });
    try {
      const response = await initChatSession(personaId);
      console.log('[chatStore] initSession response:', response);
      set({
        sessionId: response.session_id,
        personaInfo: response.persona_info,
        messages: [],
        isLoading: false,
      });
      console.log('[chatStore] Session initialized, sessionId:', response.session_id);
    } catch (error) {
      console.error('[chatStore] initSession error:', error);
      set({ error: error.message, isLoading: false });
    }
  },

  sendMessage: async (message) => {
    const { sessionId, messages } = get();
    console.log('[chatStore] sendMessage called with:', { sessionId, message });
    if (!sessionId) {
      console.error('[chatStore] No sessionId, aborting');
      return;
    }

    const userMessage = { role: 'user', content: message, timestamp: new Date() };
    set({ messages: [...messages, userMessage], isLoading: true });

    try {
      console.log('[chatStore] Calling sendChatMessage...');
      const response = await sendChatMessage(sessionId, message);
      console.log('[chatStore] Response received:', response);
      console.log('[chatStore] Response type:', typeof response);
      console.log('[chatStore] Response.response:', response?.response);

      if (!response || !response.response) {
        console.error('[chatStore] Invalid response format:', response);
        set({ error: 'Invalid response from server', isLoading: false });
        return;
      }

      const assistantMessage = {
        role: 'assistant',
        content: response.response,
        validation: response.validation,
        context: response.context,
        timestamp: new Date(),
      };
      console.log('[chatStore] Adding assistant message:', assistantMessage);
      set((state) => ({
        messages: [...state.messages, assistantMessage],
        isLoading: false
      }));
    } catch (error) {
      console.error('[chatStore] Error:', error);
      console.error('[chatStore] Error stack:', error.stack);
      set({ error: error.message, isLoading: false });
    }
  },

  clearSession: () => {
    set({ sessionId: null, personaInfo: null, messages: [], error: null });
  },
}));
