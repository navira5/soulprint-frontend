import { useNavigate } from 'react-router-dom';
import { useEffect } from 'react';
import { Loader2, ArrowRight } from 'lucide-react';
import ModeSelector from '../components/upload/ModeSelector';
import FileUpload from '../components/upload/FileUpload';
import { useUploadStore } from '../store/uploadStore';
import { usePersonaStore } from '../store/personaStore';
// Cache bust: 2025-12-04-v3

export default function HomePage() {
  const navigate = useNavigate();
  const { personas, fetchPersonas, isLoading: personasLoading } = usePersonaStore();
  const {
    selectedMode,
    file,
    personaName,
    setPersonaName,
    modeCore,
    modeCognition,
    modeSymbolic,
    toggleModeCore,
    toggleModeCognition,
    toggleModeSymbolic,
    isUploading,
    uploadProgress,
    error,
    analysisResults,
    uploadAndAnalyze,
  } = useUploadStore();

  useEffect(() => {
    fetchPersonas();
  }, [fetchPersonas]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    console.log('🔥 Form submitted!');

    console.log('🔥 Calling uploadAndAnalyze...');
    const results = await uploadAndAnalyze();
    console.log('🔥 uploadAndAnalyze returned:', results);
    // Results are now shown inline for both Human and Vigil modes
    // No auto-redirect - user can choose to start chatting via button

    // Refresh persona list after successful Human mode upload
    if (results && selectedMode === 'human') {
      await fetchPersonas();
    }
  };

  // Show download links after analysis completes (for both modes)
  const showVigilResults = selectedMode === 'vigil' && analysisResults && !isUploading;
  const showHumanResults = selectedMode === 'human' && analysisResults && !isUploading;

  // Calculate button disabled state
  const isButtonDisabled = !file || (selectedMode === 'human' && !personaName.trim()) || isUploading;

  // Debug logging
  console.log('HomePage render:', {
    selectedMode,
    file: file?.name,
    personaName,
    isUploading,
    isButtonDisabled,
    buttonShouldShow: true, // Button should always be visible
  });

  return (
    <div className="min-h-screen bg-[#0a0a0a]">
      {/* SOULHOUSE Logo - Top Left with full-width line */}
      <div className="absolute top-0 left-0 right-0">
        <div className="px-8 pt-8 pb-4 border-b border-gray-800">
          <h2 className="text-sm font-normal tracking-[0.25em] text-[#e8e8e8] uppercase" style={{ fontFamily: 'Inter, -apple-system, sans-serif' }}>SOULHOUSE</h2>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-8 pt-80 pb-40">
        {/* Hero Section */}
        <div className="text-center mb-24">
          <h1 className="text-[96px] italic text-[#e8e8e8] mb-6 leading-[1.1] tracking-normal" style={{ fontFamily: 'Cormorant Garamond', fontWeight: 400 }}>
            Conversations<br />with anyone
          </h1>
          <p className="text-xl font-light text-gray-400 tracking-wide">
            Upload their words. Build your council.
          </p>
        </div>

        {/* Mode Selector (CREATE PERSONA / YOUR COUNCIL) */}
        <ModeSelector />

        {/* Upload Form - Only show when CREATE PERSONA is selected */}
        {selectedMode === 'human' && (
          <div className="max-w-4xl mx-auto mt-32">
            <form onSubmit={handleSubmit} className="space-y-12">
              {/* Persona Name Input */}
              <div className="space-y-4">
                <input
                  type="text"
                  value={personaName}
                  onChange={(e) => setPersonaName(e.target.value)}
                  placeholder="Enter speaker name (e.g., Chamath)"
                  className="w-full px-6 py-4 bg-transparent border-2 border-gray-700 text-[#e8e8e8] text-lg font-light focus:border-gray-500 focus:outline-none transition-colors placeholder-gray-600"
                  disabled={isUploading}
                />
              </div>

              {/* File Upload */}
              <FileUpload personaName={personaName} />

              {/* Error Display */}
              {error && (
                <div className="border-2 border-red-900 bg-red-950/20 p-6 text-center">
                  <p className="text-red-400 font-light">{error}</p>
                </div>
              )}

              {/* Progress Bar */}
              {isUploading && (
                <div className="space-y-4">
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-gray-400 font-light tracking-wide">
                      Analyzing transcript...
                    </span>
                    <span className="text-gray-500">{uploadProgress}%</span>
                  </div>
                  <div className="w-full bg-gray-900 h-1 overflow-hidden">
                    <div
                      className="bg-white h-full transition-all duration-300 ease-out"
                      style={{ width: `${uploadProgress}%` }}
                    />
                  </div>
                  <p className="text-sm text-gray-600 text-center font-light">
                    This may take a few minutes depending on transcript length
                  </p>
                </div>
              )}

              {/* Human Mode: Success + Start Chatting Button */}
              {showHumanResults && (
                <div className="border-2 border-green-900 bg-green-950/20 p-8 text-center space-y-6">
                  <h3 className="text-2xl font-serif text-green-400 mb-4">
                    Persona Created Successfully
                  </h3>

                  {/* Start Chatting Button */}
                  {analysisResults.persona_id && (
                    <button
                      onClick={() => navigate(`/persona/${analysisResults.persona_id}/chat`)}
                      className="px-8 py-4 bg-white text-black font-light tracking-wide hover:bg-gray-200 transition-colors inline-flex items-center gap-3"
                    >
                      <span>Start Chatting with {analysisResults.persona_id}</span>
                      <ArrowRight className="w-5 h-5" />
                    </button>
                  )}
                </div>
              )}
              {/* Submit Button */}
              <div className="pt-8">
                <button
                  type="submit"
                  disabled={isButtonDisabled}
                  className={`w-full px-8 py-5 text-lg font-light tracking-wide transition-all inline-flex items-center justify-center gap-3 ${
                    isButtonDisabled
                      ? 'bg-gray-800 text-gray-600 cursor-not-allowed'
                      : 'bg-white text-black hover:bg-gray-200'
                  }`}
                >
                  {isUploading ? (
                    <>
                      <Loader2 className="w-5 h-5 animate-spin" />
                      <span>Processing...</span>
                    </>
                  ) : (
                    <>
                      <span>Process Document</span>
                      <ArrowRight className="w-5 h-5" />
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        )}
      </div>
    </div>
  );
}
