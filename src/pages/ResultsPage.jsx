import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Download, MessageSquare, ArrowLeft, Loader2, FileText, FileSpreadsheet } from 'lucide-react';
import SoulSeedTabs from '../components/results/SoulSeedTabs';
import { getPersonaSoulSeed } from '../api/endpoints';
import { useUploadStore } from '../store/uploadStore';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5001';

export default function ResultsPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [soulSeedData, setSoulSeedData] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const analysisResults = useUploadStore((state) => state.analysisResults);

  useEffect(() => {
    const fetchSoulSeed = async () => {
      try {
        setIsLoading(true);
        const data = await getPersonaSoulSeed(id);
        setSoulSeedData(data);
      } catch (err) {
        setError(err.message || 'Failed to load persona data');
      } finally {
        setIsLoading(false);
      }
    };

    fetchSoulSeed();
  }, [id]);

  const handleDownloadJSON = () => {
    if (!soulSeedData) return;

    const dataStr = JSON.stringify(soulSeedData, null, 2);
    const dataBlob = new Blob([dataStr], { type: 'application/json' });
    const url = URL.createObjectURL(dataBlob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `${id}_soulseed.json`;
    link.click();
    URL.revokeObjectURL(url);
  };

  const handleDownloadFile = (filepath, filename) => {
    const downloadUrl = `${API_BASE_URL}/api/download/file?filepath=${encodeURIComponent(filepath)}`;
    const link = document.createElement('a');
    link.href = downloadUrl;
    link.download = filename;
    link.click();
  };

  const formatFileSize = (bytes) => {
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  };

  const getFileIcon = (fileType) => {
    if (fileType === 'CSV') return <FileSpreadsheet className="w-5 h-5" />;
    if (fileType === 'JSON') return <Download className="w-5 h-5" />;
    return <FileText className="w-5 h-5" />;
  };

  // Get output files from analysisResults (if available from recent upload)
  const outputFiles = analysisResults?.output_files || [];

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <Loader2 className="w-12 h-12 animate-spin text-primary-600 mx-auto mb-4" />
          <p className="text-gray-600">Loading persona data...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-8">
        <div className="bg-red-50 border-2 border-red-200 rounded-lg p-6 text-center">
          <p className="text-red-800 font-medium mb-4">{error}</p>
          <button
            onClick={() => navigate('/personas')}
            className="px-6 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
          >
            Back to Personas
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto px-4 py-8">
      {/* Header */}
      <div className="mb-8">
        <button
          onClick={() => navigate('/personas')}
          className="flex items-center space-x-2 text-gray-600 hover:text-gray-900 mb-4 transition-colors"
        >
          <ArrowLeft className="w-5 h-5" />
          <span>Back to Personas</span>
        </button>

        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-4xl font-bold text-gray-900 mb-2">
              {soulSeedData?.persona_name || id}
            </h1>
            <p className="text-lg text-gray-600">Personality Blueprint Analysis</p>
          </div>

          <div className="flex items-center space-x-3">
            <button
              onClick={handleDownloadJSON}
              className="px-4 py-2 border-2 border-gray-300 rounded-lg font-medium text-gray-700 hover:bg-gray-50 transition-colors flex items-center space-x-2"
            >
              <Download className="w-5 h-5" />
              <span>Download JSON</span>
            </button>
            <button
              onClick={() => navigate(`/persona/${id}/chat`)}
              className="px-6 py-2 bg-primary-600 text-white rounded-lg font-medium hover:bg-primary-700 transition-colors flex items-center space-x-2"
            >
              <MessageSquare className="w-5 h-5" />
              <span>Start Chatting</span>
            </button>
          </div>
        </div>
      </div>

      {/* Analysis Summary */}
      {soulSeedData?.personality_synthesis && (
        <div className="bg-gradient-to-r from-primary-50 to-secondary-50 border-2 border-primary-200 rounded-lg p-6 mb-8">
          <h2 className="text-xl font-semibold text-gray-900 mb-3">
            Personality Synthesis
          </h2>
          <p className="text-gray-700 leading-relaxed">
            {soulSeedData.personality_synthesis}
          </p>
        </div>
      )}

      {/* Downloadable Files */}
      {outputFiles.length > 0 && (
        <div className="bg-white border-2 border-gray-200 rounded-lg p-6 mb-8">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">
            Generated Analysis Files
          </h2>
          <div className="space-y-3">
            {outputFiles.map((file, index) => (
              <div
                key={index}
                className="flex items-center justify-between p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
              >
                <div className="flex items-center space-x-3 flex-1 min-w-0">
                  <div className="text-gray-600">
                    {getFileIcon(file.type)}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-gray-900 truncate">
                      {file.filename}
                    </p>
                    <p className="text-sm text-gray-500">
                      {file.type} • {formatFileSize(file.size_bytes)}
                    </p>
                  </div>
                </div>
                <button
                  onClick={() => handleDownloadFile(file.filepath, file.filename)}
                  className="ml-4 px-4 py-2 bg-primary-600 text-white rounded-lg font-medium hover:bg-primary-700 transition-colors flex items-center space-x-2 flex-shrink-0"
                >
                  <Download className="w-4 h-4" />
                  <span>Download</span>
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Tabbed Analysis Results */}
      <SoulSeedTabs soulSeedData={soulSeedData} />

      {/* Bottom Actions */}
      <div className="mt-8 flex items-center justify-center">
        <button
          onClick={() => navigate(`/persona/${id}/chat`)}
          className="px-8 py-3 bg-primary-600 text-white rounded-lg font-medium hover:bg-primary-700 transition-colors flex items-center space-x-2"
        >
          <MessageSquare className="w-5 h-5" />
          <span>Start Chatting with {soulSeedData?.persona_name || id}</span>
        </button>
      </div>
    </div>
  );
}
