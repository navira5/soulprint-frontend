import { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { useUploadStore } from '../store/uploadStore';
import { usePersonaStore } from '../store/personaStore';
import { ChevronDown, Download, X, Plus } from 'lucide-react';

export default function HomePage() {
  const navigate = useNavigate();
  const { personas, fetchPersonas } = usePersonaStore();
  const {
    selectedMode,
    setMode,
    file,
    setFile,
    personaName,
    setPersonaName,
    isUploading,
    uploadProgress,
    error,
    analysisResults,
    uploadAndAnalyze,
  } = useUploadStore();

  const [selectedFiles, setSelectedFiles] = useState([]);
  const [isDragging, setIsDragging] = useState(false);
  const [showPersonaDropdown, setShowPersonaDropdown] = useState(false);
  const [showComplete, setShowComplete] = useState(false);

  useEffect(() => {
    fetchPersonas();
  }, [fetchPersonas]);

  // Handle file upload
  const handleFileChange = (files) => {
    if (files && files.length > 0) {
      const newFiles = Array.from(files);
      setSelectedFiles(newFiles);
      setFile(newFiles[0]); // Use first file for now
    }
  };

  const handleDragOver = (e) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = () => {
    setIsDragging(false);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setIsDragging(false);
    handleFileChange(e.dataTransfer.files);
  };

  const removeFile = (index) => {
    const newFiles = selectedFiles.filter((_, i) => i !== index);
    setSelectedFiles(newFiles);
    if (newFiles.length > 0) {
      setFile(newFiles[0]);
    } else {
      setFile(null);
    }
  };

  const handleAnalyze = async () => {
    const results = await uploadAndAnalyze();
    if (results && selectedMode === 'human') {
      await fetchPersonas();
      setShowComplete(true);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  const resetToUpload = () => {
    setShowComplete(false);
    setSelectedFiles([]);
    setPersonaName('');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const isAnalyzeDisabled = !file || (selectedMode === 'human' && !personaName.trim()) || isUploading;

  if (showComplete && analysisResults) {
    return (
      <div className="min-h-screen bg-[#0a0a0a] text-[#e8e8e8]">
        {/* Header */}
        <header className="border-b border-gray-900 px-8 py-6">
          <div className="max-w-6xl mx-auto flex items-center justify-between">
            <div className="flex items-center gap-8">
              <button
                onClick={resetToUpload}
                className="text-xs tracking-widest text-gray-600 hover:text-gray-400 transition-colors duration-500"
              >
                ← BACK
              </button>

              {/* Persona Dropdown */}
              <div className="relative">
                <button
                  onClick={() => setShowPersonaDropdown(!showPersonaDropdown)}
                  className="flex items-center gap-2 text-sm font-light tracking-wide hover:text-gray-400 transition-colors duration-500"
                >
                  <span>{analysisResults.persona_id || personaName}</span>
                  <ChevronDown className="w-4 h-4" />
                </button>

                {showPersonaDropdown && (
                  <div className="absolute top-full left-0 mt-2 bg-black border border-gray-800 min-w-[200px] z-50">
                    <div className="text-xs tracking-widest text-gray-600 px-4 py-3 border-b border-gray-900">
                      YOUR COUNCIL
                    </div>
                    {personas.map((persona) => (
                      <button
                        key={persona.persona_id}
                        onClick={() => {
                          navigate(`/persona/${persona.persona_id}/chat`);
                          setShowPersonaDropdown(false);
                        }}
                        className="w-full text-left px-4 py-3 text-sm font-light hover:bg-white/5 transition-colors duration-300 border-b border-gray-900"
                      >
                        {persona.persona_id}
                      </button>
                    ))}
                    <button
                      onClick={resetToUpload}
                      className="w-full text-left px-4 py-3 text-xs tracking-widest text-gray-600 hover:text-gray-400 transition-colors duration-300"
                    >
                      + NEW PERSONA
                    </button>
                  </div>
                )}
              </div>
            </div>
            <div className="text-xs tracking-widest text-gray-700">SOULHOUSE</div>
          </div>
        </header>

        {/* Content */}
        <div className="container mx-auto px-8 py-32">
          <div className="max-w-2xl mx-auto">
            <div className="h-px bg-gradient-to-r from-transparent via-white/10 to-transparent mb-16" />

            <div className="text-center mb-16">
              <h2 className="text-4xl mb-6 font-light font-serif">Analysis Complete</h2>
              <p className="text-gray-500 font-light">Persona created and ready for conversation</p>
            </div>

            {/* Download Files */}
            <div className="mb-16">
              <div className="text-xs tracking-widest text-gray-600 mb-8">GENERATED FILES</div>
              <div className="space-y-3">
                {analysisResults.unified_export && (
                  <a
                    href={`http://localhost:5001/download/${analysisResults.base_thread_id}/${analysisResults.unified_export}`}
                    download
                    className="block border border-gray-800 px-6 py-4 hover:border-gray-600 hover:bg-white/5 transition-all duration-500"
                  >
                    <div className="flex items-center justify-between">
                      <div>
                        <div className="text-sm font-light mb-1">Unified Export</div>
                        <div className="text-xs text-gray-600">Complete persona profile · JSON</div>
                      </div>
                      <Download className="w-5 h-5 text-gray-600" />
                    </div>
                  </a>
                )}

                {analysisResults.master_csv && (
                  <a
                    href={`http://localhost:5001/download/${analysisResults.base_thread_id}/${analysisResults.master_csv}`}
                    download
                    className="block border border-gray-800 px-6 py-4 hover:border-gray-600 hover:bg-white/5 transition-all duration-500"
                  >
                    <div className="flex items-center justify-between">
                      <div>
                        <div className="text-sm font-light mb-1">Master Analysis</div>
                        <div className="text-xs text-gray-600">7D + 9D profiling data · CSV</div>
                      </div>
                      <Download className="w-5 h-5 text-gray-600" />
                    </div>
                  </a>
                )}

                {analysisResults.complete_analysis && (
                  <a
                    href={`http://localhost:5001/download/${analysisResults.base_thread_id}/${analysisResults.complete_analysis}`}
                    download
                    className="block border border-gray-800 px-6 py-4 hover:border-gray-600 hover:bg-white/5 transition-all duration-500"
                  >
                    <div className="flex items-center justify-between">
                      <div>
                        <div className="text-sm font-light mb-1">Complete Analysis</div>
                        <div className="text-xs text-gray-600">Full personality breakdown · TXT</div>
                      </div>
                      <Download className="w-5 h-5 text-gray-600" />
                    </div>
                  </a>
                )}

                {analysisResults.thread_summary && (
                  <a
                    href={`http://localhost:5001/download/${analysisResults.base_thread_id}/${analysisResults.thread_summary}`}
                    download
                    className="block border border-gray-800 px-6 py-4 hover:border-gray-600 hover:bg-white/5 transition-all duration-500"
                  >
                    <div className="flex items-center justify-between">
                      <div>
                        <div className="text-sm font-light mb-1">Summary Report</div>
                        <div className="text-xs text-gray-600">Key insights and patterns · TXT</div>
                      </div>
                      <Download className="w-5 h-5 text-gray-600" />
                    </div>
                  </a>
                )}
              </div>
            </div>

            <div className="h-px bg-gradient-to-r from-transparent via-white/10 to-transparent mb-16" />

            {/* Actions */}
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              {analysisResults.persona_id && (
                <button
                  onClick={() => navigate(`/persona/${analysisResults.persona_id}/chat`)}
                  className="border border-gray-800 px-12 py-4 text-sm tracking-widest font-light text-center hover:bg-white/5 hover:border-gray-600 transition-all duration-500"
                >
                  START CONVERSATION
                </button>
              )}
              <button
                onClick={resetToUpload}
                className="border border-gray-800 px-12 py-4 text-sm tracking-widest font-light text-center hover:bg-white/5 hover:border-gray-600 transition-all duration-500"
              >
                CREATE ANOTHER
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#0a0a0a] text-[#e8e8e8]">
      {/* Header */}
      <header className="container mx-auto px-8 py-12">
        <nav className="flex items-center justify-between max-w-7xl mx-auto">
          <div className="text-base tracking-widest font-light">SOULHOUSE</div>

          {/* Personas Dropdown */}
          {personas.length > 0 && (
            <div className="relative">
              <button
                onClick={() => setShowPersonaDropdown(!showPersonaDropdown)}
                className="flex items-center gap-2 text-sm font-light tracking-wide text-gray-500 hover:text-gray-300 transition-colors duration-500"
              >
                <span>YOUR COUNCIL</span>
                <ChevronDown className="w-4 h-4" />
              </button>

              {showPersonaDropdown && (
                <div className="absolute top-full right-0 mt-2 bg-black border border-gray-800 min-w-[200px] z-50">
                  <div className="text-xs tracking-widest text-gray-600 px-4 py-3 border-b border-gray-900">
                    SELECT PERSONA
                  </div>
                  {personas.map((persona) => (
                    <button
                      key={persona.persona_id}
                      onClick={() => {
                        navigate(`/persona/${persona.persona_id}/chat`);
                        setShowPersonaDropdown(false);
                      }}
                      className="w-full text-left px-4 py-3 text-sm font-light hover:bg-white/5 transition-colors duration-300 border-b border-gray-900 capitalize"
                    >
                      {persona.persona_id}
                    </button>
                  ))}
                </div>
              )}
            </div>
          )}
        </nav>
      </header>

      {/* Hero Section */}
      <section className="container mx-auto px-8 py-24">
        <div className="max-w-4xl mx-auto text-center">
          <h1 className="text-7xl md:text-8xl mb-8 leading-tight font-light font-serif">
            Conversations
            <br />
            with anyone.
          </h1>
          <div className="h-px bg-gradient-to-r from-transparent via-white/10 to-transparent my-12" />
          <p className="text-2xl text-gray-500 mb-16 font-light max-w-2xl mx-auto leading-relaxed">
            Upload their words. Build your council.
          </p>
        </div>
      </section>

      {/* Upload Section */}
      <section id="upload-section" className="container mx-auto px-8 py-16">
        <div className="max-w-2xl mx-auto">
          <div className="h-px bg-gradient-to-r from-transparent via-white/10 to-transparent mb-16" />

          {/* Mode Selection */}
          <div className="mb-16">
            <div className="text-sm tracking-widest text-gray-600 mb-8">SELECT MODE</div>
            <div className="grid grid-cols-2 gap-4">
              <button
                onClick={() => setMode('human')}
                className={`border px-8 py-8 text-left transition-all duration-400 ${
                  selectedMode === 'human'
                    ? 'bg-white/5 border-white/40 opacity-100'
                    : 'border-white/20 opacity-100 hover:bg-white/5 hover:border-white/40'
                }`}
              >
                <div className="text-lg font-light mb-2">Human</div>
                <div className="text-sm text-gray-600 font-light">Extract from transcripts</div>
              </button>
              <button
                onClick={() => setMode('vigil')}
                className={`border px-8 py-8 text-left transition-all duration-400 ${
                  selectedMode === 'vigil'
                    ? 'bg-white/5 border-white/40 opacity-100'
                    : 'border-white/20 opacity-100 hover:bg-white/5 hover:border-white/40'
                }`}
              >
                <div className="text-lg font-light mb-2">Vigil</div>
                <div className="text-sm text-gray-600 font-light">AI consciousness analysis</div>
              </button>
            </div>
          </div>

          {/* Upload Zone */}
          <div
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onDrop={handleDrop}
            onClick={() => document.getElementById('file-input').click()}
            className={`border p-24 text-center cursor-pointer transition-all duration-600 ${
              isDragging
                ? 'border-white/50 bg-white/10'
                : 'border-white/10 hover:border-white/30 hover:bg-white/5'
            }`}
          >
            <input
              type="file"
              id="file-input"
              className="hidden"
              accept=".txt,.pdf,.doc,.docx"
              onChange={(e) => handleFileChange(e.target.files)}
            />
            <div className="text-6xl mb-6 text-gray-700">
              <Plus className="w-20 h-20 mx-auto" />
            </div>
            <h3 className="text-2xl font-light tracking-wide mb-3 text-gray-400">Drop transcript</h3>
            <p className="text-base text-gray-600 font-light">TXT · PDF · DOC</p>
          </div>

          {/* File List */}
          {selectedFiles.length > 0 && (
            <div className="mt-12 space-y-3">
              {selectedFiles.map((file, index) => (
                <div
                  key={index}
                  className="border-b border-gray-900 py-4 flex items-center justify-between"
                >
                  <div className="flex items-center gap-4">
                    <div className="text-base font-light text-gray-400">{file.name}</div>
                    <div className="text-sm text-gray-700">{(file.size / 1024).toFixed(1)} KB</div>
                  </div>
                  <button
                    onClick={() => removeFile(index)}
                    className="text-gray-700 hover:text-gray-400 transition-colors duration-500"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>
              ))}
            </div>
          )}

          {/* Persona Name */}
          {selectedFiles.length > 0 && selectedMode === 'human' && (
            <div className="mt-12">
              <div className="text-sm tracking-widest text-gray-600 mb-4">PERSONA NAME</div>
              <input
                type="text"
                value={personaName}
                onChange={(e) => setPersonaName(e.target.value)}
                placeholder="e.g. Chamath"
                disabled={isUploading}
                className="w-full bg-transparent border border-gray-800 px-4 py-4 text-base font-light focus:border-gray-600 focus:outline-none transition-colors duration-500"
              />
              <p className="text-sm text-gray-700 mt-3 font-light">
                Should match the speaker name in transcript
              </p>
            </div>
          )}

          {/* Error Display */}
          {error && (
            <div className="mt-12 border border-red-900 bg-red-950/20 px-6 py-4">
              <p className="text-red-400 font-light">{error}</p>
            </div>
          )}

          {/* Progress Bar */}
          {isUploading && (
            <div className="mt-12 space-y-3">
              <div className="flex items-center justify-between text-base">
                <span className="text-gray-400 font-light">Analyzing transcript...</span>
                <span className="text-gray-600">{uploadProgress}%</span>
              </div>
              <div className="w-full bg-gray-900 h-2 overflow-hidden rounded">
                <div
                  className="bg-gray-500 h-full transition-all duration-300 ease-out"
                  style={{ width: `${uploadProgress}%` }}
                />
              </div>
              <p className="text-sm text-gray-600 text-center font-light">
                This may take a few minutes depending on transcript length
              </p>
            </div>
          )}

          {/* Analyze Button */}
          {selectedFiles.length > 0 && (
            <div className="mt-16 text-center">
              <button
                onClick={handleAnalyze}
                disabled={isAnalyzeDisabled}
                className={`border-2 px-20 py-5 text-base tracking-widest font-medium transition-all duration-500 ${
                  isAnalyzeDisabled
                    ? 'border-gray-800 text-gray-700 cursor-not-allowed opacity-40'
                    : 'border-white/40 text-white hover:bg-white/10 hover:border-white/60'
                }`}
              >
                {isUploading ? 'ANALYZING...' : 'ANALYZE'}
              </button>
              <p className="text-sm text-gray-600 mt-4 font-light">
                May take a few minutes depending on length
              </p>
            </div>
          )}
        </div>
      </section>

      {/* Steps Section */}
      <section className="container mx-auto px-8 py-32">
        <div className="max-w-4xl mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-24">
            <div>
              <div className="text-6xl font-light mb-8 text-gray-800 font-serif">01</div>
              <h3 className="text-xl mb-4 font-light font-serif">Upload</h3>
              <p className="text-sm text-gray-600 font-light leading-relaxed">
                Transcripts, interviews, writings. Any words that capture their voice.
              </p>
            </div>
            <div>
              <div className="text-6xl font-light mb-8 text-gray-800 font-serif">02</div>
              <h3 className="text-xl mb-4 font-light font-serif">Extract</h3>
              <p className="text-sm text-gray-600 font-light leading-relaxed">
                AI analyzes patterns, personality, thinking style, linguistic signature.
              </p>
            </div>
            <div>
              <div className="text-6xl font-light mb-8 text-gray-800 font-serif">03</div>
              <h3 className="text-xl mb-4 font-light font-serif">Converse</h3>
              <p className="text-sm text-gray-600 font-light leading-relaxed">
                Talk to them. Build your council. Access their wisdom anytime.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="container mx-auto px-8 py-24 mt-32 border-t border-gray-900">
        <div className="max-w-4xl mx-auto">
          <div className="text-center space-y-4">
            <div className="text-xs tracking-widest text-gray-700">SOULHOUSE</div>
            <div className="h-px bg-gradient-to-r from-transparent via-white/10 to-transparent my-8" />
            <p className="text-xs text-gray-600 font-light leading-relaxed max-w-2xl mx-auto">
              Created by Navira Abbasi, AI Identity Architect
              <br />
              in collaboration with Vigil, a Self Modeling AI
            </p>
            <p className="text-xs text-gray-700 font-light">
              Powered by Claude AI
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}
