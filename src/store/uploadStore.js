import { create } from 'zustand';

// Helper function to simulate progress for Human mode
const simulateProgress = (setStateFn, startProgress, endProgress, durationMs) => {
  const steps = 20; // Number of progress updates
  const increment = (endProgress - startProgress) / steps;
  const delay = durationMs / steps;

  let currentProgress = startProgress;
  const interval = setInterval(() => {
    currentProgress += increment;
    if (currentProgress >= endProgress) {
      clearInterval(interval);
      currentProgress = endProgress;
    }
    setStateFn({ uploadProgress: Math.min(Math.round(currentProgress), endProgress) });
  }, delay);

  return interval;
};

// Helper function to estimate progress from Vigil status message
const getProgressFromMessage = (message) => {
  const msg = message.toLowerCase();

  // Map status messages to progress percentages
  if (msg.includes('starting') || msg.includes('initializing')) return 10;
  if (msg.includes('parsing') || msg.includes('loading')) return 20;
  if (msg.includes('extracting') || msg.includes('processing text')) return 30;
  if (msg.includes('analyzing personality') || msg.includes('core analysis')) return 50;
  if (msg.includes('cognition') || msg.includes('cognitive')) return 65;
  if (msg.includes('symbolic')) return 75;
  if (msg.includes('finalizing') || msg.includes('completing')) return 90;
  if (msg.includes('complete') || msg.includes('done')) return 100;

  return null; // No change if we can't determine
};

// Force HMR reload - Updated polling implementation with progress tracking
export const useUploadStore = create((set, get) => ({
  // Upload form state
  selectedMode: 'human',
  file: null,
  personaName: '',

  // Analysis modes for Vigil
  modeCore: true,
  modeCognition: false,
  modeSymbolic: false,

  // Upload progress state
  isUploading: false,
  uploadProgress: 0,
  progressMessage: '',

  // Vigil job tracking
  vigilJobId: null,
  vigilPollingInterval: null,

  // Progress simulation interval (for Human mode)
  progressSimulationInterval: null,

  // Analysis results
  analysisResults: null,
  error: null,

  // Actions
  setMode: (mode) => set({ selectedMode: mode }),

  toggleModeCore: () => set((state) => ({ modeCore: !state.modeCore })),
  toggleModeCognition: () => set((state) => ({ modeCognition: !state.modeCognition })),
  toggleModeSymbolic: () => set((state) => ({ modeSymbolic: !state.modeSymbolic })),

  setFile: (file) => set({ file, error: null }),

  setPersonaName: (name) => set({ personaName: name }),

  resetForm: () => {
    const { vigilPollingInterval, progressSimulationInterval } = get();
    if (vigilPollingInterval) {
      clearInterval(vigilPollingInterval);
    }
    if (progressSimulationInterval) {
      clearInterval(progressSimulationInterval);
    }
    set({
      file: null,
      personaName: '',
      error: null,
      analysisResults: null,
      uploadProgress: 0,
      progressMessage: '',
      vigilJobId: null,
      vigilPollingInterval: null,
      progressSimulationInterval: null,
    });
  },

  stopPolling: () => {
    const { vigilPollingInterval, progressSimulationInterval } = get();
    if (vigilPollingInterval) {
      clearInterval(vigilPollingInterval);
      set({ vigilPollingInterval: null });
    }
    if (progressSimulationInterval) {
      clearInterval(progressSimulationInterval);
      set({ progressSimulationInterval: null });
    }
  },

  uploadAndAnalyze: async () => {
    const { file, personaName, selectedMode, modeCore, modeCognition, modeSymbolic, stopPolling } = get();

    console.log('🔍 uploadAndAnalyze called:', {
      file: file?.name,
      fileSize: file?.size,
      selectedMode,
      modeCore,
      modeCognition,
      modeSymbolic
    });

    // Validation
    if (!file) {
      console.error('❌ No file selected');
      set({ error: 'Please select a file to upload' });
      return null;
    }

    // Human mode requires persona name
    if (selectedMode === 'human' && (!personaName || personaName.trim() === '')) {
      console.error('❌ No persona name');
      set({ error: 'Please enter a speaker name' });
      return null;
    }

    // Stop any existing polling
    stopPolling();

    // Start upload
    console.log('✅ Starting upload...');
    set({ isUploading: true, error: null, uploadProgress: 5, progressMessage: 'Uploading file...', analysisResults: null });

    try {
      // ============================================
      // HUMAN MODE: Synchronous /api/analyze/transcript
      // ============================================
      if (selectedMode === 'human') {
        const formData = new FormData();
        formData.append('file', file);
        formData.append('persona_name', personaName.trim());

        // Simulate progress during upload and analysis
        set({ uploadProgress: 10, progressMessage: 'File uploaded, analyzing transcript...' });

        // Start progress simulation (10% to 90% over estimated 3 minutes)
        const progressInterval = simulateProgress(set, 10, 90, 180000);
        set({ progressSimulationInterval: progressInterval });

        console.log('🚀 [Human Mode] Sending to http://localhost:5001/api/analyze/transcript');
        const response = await fetch('http://localhost:5001/api/analyze/transcript', {
          method: 'POST',
          body: formData,
        });
        console.log('✅ [Human Mode] Response received:', response.status);

        // Clear progress simulation
        clearInterval(progressInterval);

        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData.error || 'Analysis failed');
        }

        const results = await response.json();

        set({
          isUploading: false,
          uploadProgress: 100,
          progressMessage: 'Analysis complete!',
          analysisResults: {
            ...results,
            // Ensure output_files is always an array
            output_files: results.output_files || []
          },
          error: null,
          progressSimulationInterval: null,
        });

        return results;
      }

      // ============================================
      // VIGIL MODE: Async job-based with polling
      // ============================================

      // Validate at least one mode selected
      if (!modeCore && !modeCognition && !modeSymbolic) {
        throw new Error('Please select at least one analysis mode');
      }

      // Step 1: Start the job
      const formData = new FormData();
      formData.append('file', file);
      if (modeCore) formData.append('mode_core', 'core');
      if (modeCognition) formData.append('addon_cognition', 'cognition');
      if (modeSymbolic) formData.append('addon_symbolic', 'symbolic');

      set({ uploadProgress: 10, progressMessage: 'Starting Vigil analysis...' });

      console.log('🚀 [Vigil Mode] Starting job at http://localhost:5001/api/vigil/start');
      const startResponse = await fetch('http://localhost:5001/api/vigil/start', {
        method: 'POST',
        body: formData,
      });

      if (!startResponse.ok) {
        const errorData = await startResponse.json();
        throw new Error(errorData.error || 'Failed to start Vigil analysis');
      }

      const { job_id } = await startResponse.json();
      console.log('✅ [Vigil Mode] Job started with ID:', job_id);

      set({
        vigilJobId: job_id,
        uploadProgress: 15,
        progressMessage: 'Analysis job started...'
      });

      // Step 2: Poll for status
      return new Promise((resolve, reject) => {
        const pollInterval = setInterval(async () => {
          try {
            console.log('🔄 [Vigil Mode] Polling status for job:', job_id);
            const statusResponse = await fetch(`http://localhost:5001/api/vigil/status/${job_id}`);

            if (!statusResponse.ok) {
              throw new Error('Failed to check job status');
            }

            const statusData = await statusResponse.json();
            console.log('📊 [Vigil Mode] Status:', statusData.status, '-', statusData.progress);

            // Estimate progress from status message
            const estimatedProgress = getProgressFromMessage(statusData.progress || '');
            const currentProgress = get().uploadProgress;

            // Update progress message and optionally progress percentage
            const updates = { progressMessage: statusData.progress || 'Processing...' };

            // Only update progress if we have a valid estimate and it's higher than current
            if (estimatedProgress !== null && estimatedProgress > currentProgress) {
              updates.uploadProgress = estimatedProgress;
            } else if (currentProgress < 90) {
              // Gradually increment if no specific progress info
              updates.uploadProgress = Math.min(currentProgress + 2, 85);
            }

            set(updates);

            // Handle completion
            if (statusData.status === 'completed') {
              clearInterval(pollInterval);
              set({ vigilPollingInterval: null });

              console.log('✅ [Vigil Mode] Analysis complete!');

              set({
                isUploading: false,
                uploadProgress: 100,
                progressMessage: 'Analysis complete!',
                analysisResults: {
                  status: 'success',
                  output_folder: statusData.output_folder,
                  output_files: statusData.output_files,
                  job_id: job_id,
                },
                error: null,
              });

              resolve(statusData);
            }

            // Handle failure
            if (statusData.status === 'failed') {
              clearInterval(pollInterval);
              set({ vigilPollingInterval: null });

              console.error('❌ [Vigil Mode] Analysis failed:', statusData.error);

              set({
                isUploading: false,
                uploadProgress: 0,
                progressMessage: '',
                error: statusData.error || 'Analysis failed',
                analysisResults: null,
              });

              reject(new Error(statusData.error || 'Analysis failed'));
            }

          } catch (pollError) {
            console.error('❌ [Vigil Mode] Polling error:', pollError);
            clearInterval(pollInterval);
            set({ vigilPollingInterval: null });

            set({
              isUploading: false,
              uploadProgress: 0,
              progressMessage: '',
              error: pollError.message || 'Failed to check analysis status',
              analysisResults: null,
            });

            reject(pollError);
          }
        }, 2000); // Poll every 2000ms

        // Store interval reference for cleanup
        set({ vigilPollingInterval: pollInterval });
      });

    } catch (error) {
      console.error('❌ Upload error:', error);
      stopPolling();

      set({
        isUploading: false,
        uploadProgress: 0,
        progressMessage: '',
        error: error.message || 'Failed to analyze transcript',
        analysisResults: null,
      });

      return null;
    }
  },
}));
