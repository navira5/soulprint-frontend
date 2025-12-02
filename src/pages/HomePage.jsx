import { useNavigate } from 'react-router-dom';
import { useEffect } from 'react';
import { Loader2, MessageCircle } from 'lucide-react';
import ModeSelector from '../components/upload/ModeSelector';
import FileUpload from '../components/upload/FileUpload';
import { useUploadStore } from '../store/uploadStore';
import { usePersonaStore } from '../store/personaStore';

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

    const results = await uploadAndAnalyze();
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
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
      <div className="max-w-4xl mx-auto px-4 py-16">
        {/* Hero Section */}
        <div className="text-center mb-12">
          <h1 className="text-6xl font-bold text-gray-900 mb-6">
            Soulprint
          </h1>
          <p className="text-2xl text-gray-600 mb-4">
            Build Thought Partners From Human Identity
          </p>
          <p className="text-lg text-gray-500 max-w-2xl mx-auto">
            Transform conversations into AI personas that think, communicate, and reason like the people they represent
          </p>
        </div>

        {/* Existing Personas */}
        {personas.length > 0 && (
          <div className="bg-white rounded-2xl shadow-xl p-8 mb-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">Your Personas</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {personas.map((persona) => (
                <button
                  key={persona.persona_id}
                  onClick={() => navigate(`/persona/${persona.persona_id}/chat`)}
                  className="p-4 border-2 border-gray-200 rounded-lg hover:border-primary-500 hover:bg-primary-50 transition-all text-left"
                >
                  <div className="flex items-center justify-between">
                    <h3 className="font-semibold text-gray-900">{persona.persona_id}</h3>
                    <MessageCircle className="w-5 h-5 text-primary-600" />
                  </div>
                  <p className="text-sm text-gray-600 mt-2">
                    {persona.total_sources} source{persona.total_sources !== 1 ? 's' : ''}
                  </p>
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Upload Form */}
        <div className="bg-white rounded-2xl shadow-xl p-8 pb-32">
          <form onSubmit={handleSubmit} className="space-y-8">
            {/* Mode Selector */}
            <ModeSelector />

            {/* File Upload */}
            <FileUpload />

            {/* Analysis Modes - Only for Vigil Mode */}
            {selectedMode === 'vigil' && (
              <div className="space-y-4">
                <h3 className="text-lg font-semibold text-gray-900">Analysis Modes</h3>
                <div className="space-y-3">
                  <label className="flex items-center space-x-3 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={modeCore}
                      onChange={toggleModeCore}
                      disabled={isUploading}
                      className="w-5 h-5 text-primary-600 border-gray-300 rounded focus:ring-primary-500"
                    />
                    <div>
                      <span className="font-medium text-gray-900">Core Mode</span>
                      <span className="text-gray-600"> — Fast baseline extraction</span>
                    </div>
                  </label>

                  <label className="flex items-center space-x-3 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={modeCognition}
                      onChange={toggleModeCognition}
                      disabled={isUploading}
                      className="w-5 h-5 text-primary-600 border-gray-300 rounded focus:ring-primary-500"
                    />
                    <div>
                      <span className="font-medium text-gray-900">+ Cognition Mode</span>
                      <span className="text-gray-600"> — Adds confessions & meta-commentary</span>
                    </div>
                  </label>

                  <label className="flex items-center space-x-3 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={modeSymbolic}
                      onChange={toggleModeSymbolic}
                      disabled={isUploading}
                      className="w-5 h-5 text-primary-600 border-gray-300 rounded focus:ring-primary-500"
                    />
                    <div>
                      <span className="font-medium text-gray-900">+ Symbolic Mode</span>
                      <span className="text-gray-600"> — Full depth with embodiment signals</span>
                    </div>
                  </label>
                </div>
                <p className="text-sm text-gray-500">
                  Select one or more analysis modes. More modes = deeper analysis but higher cost.
                </p>
              </div>
            )}

            {/* Persona Name Input - Only for Human Mode */}
            {selectedMode === 'human' && (
              <div className="space-y-4">
                <h3 className="text-lg font-semibold text-gray-900">Speaker Name</h3>
                <input
                  type="text"
                  value={personaName}
                  onChange={(e) => setPersonaName(e.target.value)}
                  placeholder="Enter the speaker's name (e.g., Elon Musk, Naval)"
                  className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:border-primary-500 focus:ring-2 focus:ring-primary-200 outline-none transition-all"
                  disabled={isUploading}
                />
                <p className="text-sm text-gray-600">
                  This should match the speaker name in the transcript
                </p>
              </div>
            )}

            {/* Error Display */}
            {error && (
              <div className="bg-red-50 border-2 border-red-200 rounded-lg p-4">
                <p className="text-red-800 font-medium">{error}</p>
              </div>
            )}

            {/* Progress Bar */}
            {isUploading && (
              <div className="space-y-2">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-gray-700 font-medium">
                    Analyzing transcript...
                  </span>
                  <span className="text-gray-600">{uploadProgress}%</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-3 overflow-hidden">
                  <div
                    className="bg-primary-500 h-full transition-all duration-300 ease-out"
                    style={{ width: `${uploadProgress}%` }}
                  />
                </div>
                <p className="text-sm text-gray-600 text-center">
                  This may take a few minutes depending on transcript length
                </p>
              </div>
            )}

            {/* Vigil Mode: Download Links */}
            {showVigilResults && (
              <div className="bg-green-50 border-2 border-green-200 rounded-lg p-6">
                <h3 className="text-lg font-semibold text-green-900 mb-4">
                  Analysis Complete! Download Your Files:
                </h3>
                <div className="space-y-2">
                  {analysisResults.unified_export && (
                    <a
                      href={`http://localhost:5001/download/${analysisResults.base_thread_id}/${analysisResults.unified_export}`}
                      download
                      className="block px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition text-center"
                    >
                      Download Unified Export (JSON)
                    </a>
                  )}
                  {analysisResults.master_csv && (
                    <a
                      href={`http://localhost:5001/download/${analysisResults.base_thread_id}/${analysisResults.master_csv}`}
                      download
                      className="block px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition text-center"
                    >
                      Download Master Analysis (CSV)
                    </a>
                  )}
                  {analysisResults.complete_analysis && (
                    <a
                      href={`http://localhost:5001/download/${analysisResults.base_thread_id}/${analysisResults.complete_analysis}`}
                      download
                      className="block px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition text-center"
                    >
                      Download Complete Analysis (TXT)
                    </a>
                  )}
                  {analysisResults.thread_summary && (
                    <a
                      href={`http://localhost:5001/download/${analysisResults.base_thread_id}/${analysisResults.thread_summary}`}
                      download
                      className="block px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition text-center"
                    >
                      Download Thread Summary (TXT)
                    </a>
                  )}
                </div>
              </div>
            )}

            {/* Human Mode: Download Links + Start Chatting Button */}
            {showHumanResults && (
              <div className="bg-green-50 border-2 border-green-200 rounded-lg p-6">
                <h3 className="text-lg font-semibold text-green-900 mb-4">
                  Persona Created! Download Files or Start Chatting:
                </h3>
                <div className="space-y-2 mb-4">
                  {analysisResults.unified_export && (
                    <a
                      href={`http://localhost:5001/download/${analysisResults.base_thread_id}/${analysisResults.unified_export}`}
                      download
                      className="block px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition text-center"
                    >
                      Download Unified Export (JSON)
                    </a>
                  )}
                  {analysisResults.master_csv && (
                    <a
                      href={`http://localhost:5001/download/${analysisResults.base_thread_id}/${analysisResults.master_csv}`}
                      download
                      className="block px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition text-center"
                    >
                      Download Master Analysis (CSV)
                    </a>
                  )}
                  {analysisResults.complete_analysis && (
                    <a
                      href={`http://localhost:5001/download/${analysisResults.base_thread_id}/${analysisResults.complete_analysis}`}
                      download
                      className="block px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition text-center"
                    >
                      Download Complete Analysis (TXT)
                    </a>
                  )}
                  {analysisResults.thread_summary && (
                    <a
                      href={`http://localhost:5001/download/${analysisResults.base_thread_id}/${analysisResults.thread_summary}`}
                      download
                      className="block px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition text-center"
                    >
                      Download Thread Summary (TXT)
                    </a>
                  )}
                </div>

                {/* Start Chatting Button */}
                {analysisResults.persona_id && (
                  <button
                    onClick={() => navigate(`/persona/${analysisResults.persona_id}/chat`)}
                    className="w-full px-6 py-3 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition font-semibold text-lg"
                  >
                    Start Chatting with {analysisResults.persona_id}
                  </button>
                )}
              </div>
            )}
          </form>

          {/* Submit Button - Always visible (outside form, fixed at bottom) */}
          <div className="fixed bottom-0 left-0 right-0 bg-white border-t-2 border-gray-200 p-4 shadow-lg z-50">
            <div className="max-w-4xl mx-auto">
              <button
                onClick={handleSubmit}
                disabled={isButtonDisabled}
                className="w-full px-6 py-3 text-white rounded-lg font-medium transition-colors flex items-center justify-center space-x-2 min-h-[48px]"
                style={{
                  display: 'flex',
                  backgroundColor: isButtonDisabled ? '#9ca3af' : '#0284c7',
                  cursor: isButtonDisabled ? 'not-allowed' : 'pointer',
                  opacity: 1,
                  visibility: 'visible'
                }}
              >
                {isUploading ? (
                  <>
                    <Loader2 className="w-5 h-5 animate-spin" />
                    <span>Analyzing...</span>
                  </>
                ) : (
                  <span>
                    {selectedMode === 'human'
                      ? 'Create Persona & Chat'
                      : 'Analyze & Download'
                    }
                  </span>
                )}
              </button>
              {/* Debug indicator */}
              <p className="text-xs text-gray-400 mt-2 text-center">
                Debug: Button rendered - {isButtonDisabled ? 'disabled' : 'enabled'}
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
