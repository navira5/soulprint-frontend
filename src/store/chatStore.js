import { create } from 'zustand';
import { initChatSession, sendChatMessage, listChatSessions } from '../api/endpoints';

export const useChatStore = create((set, get) => ({
  sessionId: null,
  personaInfo: null,
  messages: [],
  isLoading: false,
  error: null,
  pastSessions: [],

  initSession: async (personaId, resumeSessionId = null) => {
    console.log('[chatStore] initSession called with:', personaId, resumeSessionId ? `(resuming ${resumeSessionId})` : '(new)');
    set({ isLoading: true, error: null });
    try {
      const response = await initChatSession(personaId, resumeSessionId);
      console.log('[chatStore] initSession response:', response);

      // If resuming, restore conversation history
      const messages = (response.conversation_history || []).map((msg) => ({
        role: msg.role,
        content: msg.content,
        timestamp: new Date(),
      }));

      set({
        sessionId: response.session_id,
        personaInfo: response.persona_info,
        messages,
        isLoading: false,
      });
      console.log('[chatStore] Session initialized, sessionId:', response.session_id, 'resumed:', response.resumed, 'messages:', messages.length);
    } catch (error) {
      console.error('[chatStore] initSession error:', error);
      set({ error: error.message, isLoading: false });
    }
  },

  fetchPastSessions: async (personaId) => {
    try {
      const response = await listChatSessions(personaId);
      set({ pastSessions: response.sessions || [] });
    } catch (error) {
      console.error('[chatStore] fetchPastSessions error:', error);
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
