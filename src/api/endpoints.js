import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5001';

const apiClient = axios.create({
  baseURL: `${API_BASE_URL}/api`,
  timeout: 600000, // 10 minutes for long-running personality analysis
});

apiClient.interceptors.response.use(
  (response) => response.data,
  (error) => {
    const errorMessage = error.response?.data?.error || error.message || 'Network error';
    return Promise.reject(new Error(errorMessage));
  }
);

export const getPersonas = async () => {
  const response = await apiClient.get('/personas');
  console.log('🟡 [endpoints] Raw API response:', response);
  console.log('🟡 [endpoints] Extracting personas array:', response.personas);
  return response.personas || [];  // Extract the personas array from the response object
};

export const getPersonaSoulSeed = async (personaId) => {
  return apiClient.get('/persona/soulseed/latest', {
    params: { persona_id: personaId },
  });
};

export const initChatSession = async (personaId) => {
  return apiClient.post('/persona/chat/init', { persona_id: personaId });
};

export const sendChatMessage = async (sessionId, message) => {
  return apiClient.post('/persona/chat', { session_id: sessionId, message });
};

export const applyFeedback = async (personaId, feedbackText) => {
  return apiClient.post('/persona/feedback', {
    persona_id: personaId,
    feedback_text: feedbackText,
  });
};

export const analyzeTranscript = async (file, personaName) => {
  const formData = new FormData();
  formData.append('file', file);
  formData.append('persona_name', personaName);

  return apiClient.post('/analyze/transcript', formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
    timeout: 600000, // 10 minutes for personality analysis
  });
};

export default apiClient;
