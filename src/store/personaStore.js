import { create } from 'zustand';
import { getPersonas, getPersonaSoulSeed } from '../api/endpoints';

export const usePersonaStore = create((set) => ({
  personas: [],
  currentPersona: null,
  loading: false,
  error: null,

  fetchPersonas: async () => {
    console.log('🔵 [personaStore] fetchPersonas called');
    set({ loading: true, error: null });
    try {
      const personas = await getPersonas();
      console.log('🟢 [personaStore] Received personas from API:', personas);
      console.log('🟢 [personaStore] Type of personas:', typeof personas);
      console.log('🟢 [personaStore] Is array?', Array.isArray(personas));
      console.log('🟢 [personaStore] Length:', personas?.length);
      set({ personas, loading: false });
    } catch (error) {
      console.error('🔴 [personaStore] Error fetching personas:', error);
      set({ error: error.message, loading: false });
    }
  },

  fetchPersonaById: async (personaId) => {
    set({ loading: true, error: null });
    try {
      const persona = await getPersonaSoulSeed(personaId);
      set({ currentPersona: persona, loading: false });
    } catch (error) {
      set({ error: error.message, loading: false });
    }
  },
}));
