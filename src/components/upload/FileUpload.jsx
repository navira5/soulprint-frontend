import { useState } from 'react';
import { Plus, X, FileText } from 'lucide-react';
import { useUploadStore } from '../../store/uploadStore';

export default function FileUpload({ personaName }) {
  const { file, setFile } = useUploadStore();
  const [dragActive, setDragActive] = useState(false);

  const handleDrag = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true);
    } else if (e.type === 'dragleave') {
      setDragActive(false);
    }
  };

  const validateFile = (file) => {
    const allowedTypes = ['.txt', '.pdf', '.csv', 'text/plain', 'application/pdf', 'text/csv'];
    const fileExtension = file.name.substring(file.name.lastIndexOf('.')).toLowerCase();
    const isValidType =
      allowedTypes.includes(file.type) || allowedTypes.includes(fileExtension);

    if (!isValidType) {
      alert('Please upload a .txt, .pdf, or .csv file');
      return false;
    }

    return true;
  };

  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);

    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      const droppedFile = e.dataTransfer.files[0];
      console.log('File dropped:', droppedFile.name);
      if (validateFile(droppedFile)) {
        console.log('File validated, setting file:', droppedFile.name);
        setFile(droppedFile);
      }
    }
  };

  const handleChange = (e) => {
    e.preventDefault();
    if (e.target.files && e.target.files[0]) {
      const selectedFile = e.target.files[0];
      console.log('File selected:', selectedFile.name);
      if (validateFile(selectedFile)) {
        console.log('File validated, setting file:', selectedFile.name);
        setFile(selectedFile);
      }
    }
  };

  const clearFile = () => {
    setFile(null);
  };

  return (
    <div className="space-y-6">
      {/* Title */}
      <div className="text-center">
        <p className="text-base sm:text-lg text-gray-400 font-light tracking-wide mb-6 sm:mb-8">
          Upload transcripts, interviews, or writings for {personaName || 'your persona'}
        </p>
      </div>

      {/* Upload Area */}
      {!file ? (
        <div
          className={`
            relative border-2 border-dashed py-16 px-8 sm:py-32 sm:px-24 text-center
            transition-colors cursor-pointer
            ${
              dragActive
                ? 'border-gray-500 bg-gray-900/50'
                : 'border-gray-700 bg-transparent hover:border-gray-600'
            }
          `}
          onDragEnter={handleDrag}
          onDragLeave={handleDrag}
          onDragOver={handleDrag}
          onDrop={handleDrop}
          onClick={() => document.getElementById('file-input').click()}
        >
          <input
            id="file-input"
            type="file"
            className="hidden"
            accept=".txt,.pdf,.csv"
            onChange={handleChange}
          />

          <Plus className="w-12 h-12 sm:w-20 sm:h-20 mx-auto mb-4 sm:mb-8 text-gray-500" />
          <p className="text-lg sm:text-2xl font-light text-[#e8e8e8] mb-2 sm:mb-3">
            Drop document
          </p>
          <p className="text-sm sm:text-base text-gray-500 tracking-widest">
            TXT · PDF · CSV
          </p>
        </div>
      ) : (
        <div className="border-2 border-gray-700 bg-gray-900/30 p-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <FileText className="w-8 h-8 text-gray-400 flex-shrink-0" />
              <div className="flex-1 min-w-0">
                <p className="font-light text-[#e8e8e8] truncate">{file.name}</p>
                <p className="text-sm text-gray-500">
                  {(file.size / 1024).toFixed(0)} KB
                </p>
              </div>
            </div>
            <button
              onClick={(e) => {
                e.stopPropagation();
                clearFile();
              }}
              className="p-2 text-gray-500 hover:text-gray-300 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
