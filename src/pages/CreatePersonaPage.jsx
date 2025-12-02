import { useNavigate } from 'react-router-dom';
import { Loader2 } from 'lucide-react';
import ModeSelector from '../components/upload/ModeSelector';
import FileUpload from '../components/upload/FileUpload';
import { useUploadStore } from '../store/uploadStore';

export default function CreatePersonaPage() {
  const navigate = useNavigate();
  const {
    file,
    personaName,
    setPersonaName,
    isUploading,
    uploadProgress,
    progressMessage,
    error,
    uploadAndAnalyze,
    resetForm,
  } = useUploadStore();

  // Debug: Log state changes
  console.log('CreatePersonaPage state:', { file: file?.name, personaName, isUploading });

  const handleSubmit = async (e) => {
    e.preventDefault();

    console.log('Form submitted with:', { file: file?.name, personaName });

    const results = await uploadAndAnalyze();

    if (results && results.persona_id) {
      // Navigate to results page
      navigate(`/persona/${results.persona_id}/results`);
    }
  };

  const handleCancel = () => {
    resetForm();
    navigate('/personas');
  };

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      {/* Hero Section */}
      <div className="text-center mb-12">
        <h1 className="text-4xl font-bold text-gray-900 mb-4">
          Create Your Digital Thought Partner
        </h1>
        <p className="text-lg text-gray-600">
          Upload a transcript to extract personality and create an AI persona
        </p>
      </div>

      {/* Upload Form */}
      <form onSubmit={handleSubmit} className="space-y-8">
        {/* Mode Selector */}
        <ModeSelector />

        {/* File Upload */}
        <FileUpload />

        {/* Persona Name Input */}
        <div className="space-y-4">
          <h3 className="text-lg font-semibold text-gray-900">Persona Name</h3>
          <input
            type="text"
            value={personaName}
            onChange={(e) => {
              console.log('Persona name changed to:', e.target.value);
              setPersonaName(e.target.value);
            }}
            placeholder="Enter the speaker's name (e.g., Elon Musk, Naval)"
            className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:border-primary-500 focus:ring-2 focus:ring-primary-200 outline-none transition-all"
            disabled={isUploading}
          />
          <p className="text-sm text-gray-600">
            This should match the speaker name in the transcript
          </p>
        </div>

        {/* DEBUG: Form State Viewer */}
        <div className="bg-yellow-50 border-2 border-yellow-300 rounded-lg p-4">
          <h4 className="font-bold text-yellow-900 mb-2">DEBUG: Form State</h4>
          <div className="space-y-1 text-sm text-yellow-800 font-mono">
            <p>File Selected: {file ? `✅ ${file.name}` : '❌ No file'}</p>
            <p>Persona Name: {personaName ? `✅ "${personaName}"` : '❌ Empty'}</p>
            <p>Name Valid (trimmed): {personaName.trim() ? '✅ Yes' : '❌ No'}</p>
            <p>Is Uploading: {isUploading ? '⏳ Yes' : '✅ No'}</p>
            <p className="pt-2 font-bold">
              Button Enabled: {!file || !personaName.trim() || isUploading ? '❌ DISABLED' : '✅ ENABLED'}
            </p>
          </div>
        </div>

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
                {progressMessage || 'Analyzing transcript...'}
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

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-end gap-4 pt-6">
          <button
            type="button"
            onClick={handleCancel}
            disabled={isUploading}
            className="w-full sm:w-auto px-6 py-3 border-2 border-gray-300 rounded-lg font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={!file || !personaName.trim() || isUploading}
            className="w-full sm:w-auto px-6 py-3 bg-primary-600 text-white rounded-lg font-medium hover:bg-primary-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors flex items-center justify-center space-x-2"
          >
            {isUploading ? (
              <>
                <Loader2 className="w-5 h-5 animate-spin" />
                <span>Analyzing...</span>
              </>
            ) : (
              <span>Generate Personality Blueprint</span>
            )}
          </button>
        </div>
      </form>
    </div>
  );
}
