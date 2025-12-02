import { useState } from 'react';
import { Upload, X, FileText } from 'lucide-react';
import { useUploadStore } from '../../store/uploadStore';

export default function FileUpload() {
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
    const allowedTypes = ['.txt', '.pdf', 'text/plain', 'application/pdf'];
    const fileExtension = file.name.substring(file.name.lastIndexOf('.')).toLowerCase();
    const isValidType =
      allowedTypes.includes(file.type) || allowedTypes.includes(fileExtension);

    if (!isValidType) {
      alert('Please upload a .txt or .pdf file');
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
    <div className="space-y-4">
      <h3 className="text-lg font-semibold text-gray-900">Upload Transcript</h3>

      {!file ? (
        <div
          className={`
            relative border-2 border-dashed rounded-lg p-12 text-center
            transition-colors cursor-pointer
            ${
              dragActive
                ? 'border-primary-500 bg-primary-50'
                : 'border-gray-300 bg-gray-50 hover:border-primary-400'
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
            accept=".txt,.pdf"
            onChange={handleChange}
          />

          <Upload className="w-12 h-12 mx-auto mb-4 text-gray-400" />
          <p className="text-lg font-medium text-gray-700 mb-2">
            Drop your transcript here
          </p>
          <p className="text-sm text-gray-500">
            or click to browse (.txt or .pdf files)
          </p>
        </div>
      ) : (
        <div className="border-2 border-primary-500 rounded-lg p-6 bg-primary-50">
          <div className="flex items-start justify-between">
            <div className="flex items-start space-x-3">
              <FileText className="w-8 h-8 text-primary-600 flex-shrink-0 mt-1" />
              <div className="flex-1 min-w-0">
                <p className="font-medium text-gray-900 truncate">{file.name}</p>
                <p className="text-sm text-gray-600">
                  {(file.size / 1024).toFixed(2)} KB
                </p>
              </div>
            </div>
            <button
              onClick={(e) => {
                e.stopPropagation();
                clearFile();
              }}
              className="p-1 rounded-full hover:bg-primary-100 text-gray-600 hover:text-gray-900 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
