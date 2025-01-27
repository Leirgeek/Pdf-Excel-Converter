'use client';

import { useCallback, useState } from 'react';
import { useDropzone } from 'react-dropzone';
import { Upload, File, X, Play, Download } from 'lucide-react';
import type { DocumentData } from '@/lib/schema';
import { Toast, useToast } from './Toast';

interface UploadedFile {
  file: File;
  preview: string;
  text?: string;
  loading?: boolean;
  error?: string;
  processed?: boolean;
}

export function FileUpload() {
  const [uploadedFiles, setUploadedFiles] = useState<UploadedFile[]>([]);
  const [previewText, setPreviewText] = useState<string | null>(null);
  const [processing, setProcessing] = useState(false);
  const [processedData, setProcessedData] = useState<DocumentData[] | null>(null);
  const [downloading, setDownloading] = useState(false);
  const { toasts, showToast, removeToast } = useToast();

  const extractText = async (file: File, index: number) => {
    try {
      setUploadedFiles(prev => {
        const newFiles = [...prev];
        newFiles[index] = { ...newFiles[index], loading: true };
        return newFiles;
      });

      const formData = new FormData();
      formData.append('file', file);

      const response = await fetch('/api/extract', {
        method: 'POST',
        body: formData,
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to extract text');
      }

      setUploadedFiles(prev => {
        const newFiles = [...prev];
        newFiles[index] = {
          ...newFiles[index],
          text: data.text,
          loading: false,
        };
        return newFiles;
      });

      showToast('Text extracted successfully', 'success');
    } catch (error) {
      console.error('Error extracting text:', error);
      const errorMessage = error instanceof Error ? error.message : 'Failed to extract text';
      
      setUploadedFiles(prev => {
        const newFiles = [...prev];
        newFiles[index] = {
          ...newFiles[index],
          error: errorMessage,
          loading: false,
        };
        return newFiles;
      });

      showToast(errorMessage, 'error');
    }
  };

  const onDrop = useCallback((acceptedFiles: File[]) => {
    if (acceptedFiles.length === 0) {
      showToast('Please upload PDF files only', 'error');
      return;
    }

    const newFiles = acceptedFiles.map(file => ({
      file,
      preview: URL.createObjectURL(file)
    }));
    
    setUploadedFiles(prev => [...prev, ...newFiles]);
    
    // Extract text from each file immediately after upload
    acceptedFiles.forEach((_, index) => {
      const fileIndex = uploadedFiles.length + index;
      extractText(acceptedFiles[index], fileIndex);
    });
  }, [uploadedFiles.length]);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'application/pdf': ['.pdf']
    },
    multiple: true
  });

  const removeFile = (index: number) => {
    setUploadedFiles(prev => {
      const newFiles = [...prev];
      URL.revokeObjectURL(newFiles[index].preview);
      newFiles.splice(index, 1);
      return newFiles;
    });
  };

  const startExtraction = async () => {
    try {
      setProcessing(true);
      
      // Get all successfully extracted texts
      const texts = uploadedFiles
        .filter(file => file.text && !file.error)
        .map(file => file.text);

      if (texts.length === 0) {
        throw new Error('No valid texts to process');
      }

      const response = await fetch('/api/process', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ texts }),
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || 'Failed to process documents');
      }

      const result = await response.json();
      setProcessedData(result.data);

      // Mark files as processed
      setUploadedFiles(prev => 
        prev.map(file => ({
          ...file,
          processed: true,
        }))
      );

      showToast('Documents processed successfully', 'success');
    } catch (error) {
      console.error('Error processing documents:', error);
      const errorMessage = error instanceof Error ? error.message : 'Failed to process documents';
      showToast(errorMessage, 'error');
    } finally {
      setProcessing(false);
    }
  };

  const downloadExcel = async () => {
    if (!processedData) return;

    try {
      setDownloading(true);
      const response = await fetch('/api/download', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ data: processedData }),
      });

      if (!response.ok) {
        throw new Error('Failed to generate Excel file');
      }

      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', 'extracted_data.xlsx');
      document.body.appendChild(link);
      link.click();
      link.parentNode?.removeChild(link);
      window.URL.revokeObjectURL(url);

      showToast('Excel file downloaded successfully', 'success');
    } catch (error) {
      console.error('Error downloading Excel:', error);
      const errorMessage = error instanceof Error ? error.message : 'Failed to download Excel file';
      showToast(errorMessage, 'error');
    } finally {
      setDownloading(false);
    }
  };

  return (
    <div className="w-full space-y-4">
      <div
        {...getRootProps()}
        className={`border-2 border-dashed rounded-lg p-8 text-center cursor-pointer transition-colors
          ${isDragActive ? 'border-blue-500 bg-blue-50' : 'border-gray-300 hover:border-blue-500'}`}
      >
        <input {...getInputProps()} />
        <Upload className="mx-auto h-12 w-12 text-gray-400" />
        <p className="mt-2 text-sm text-gray-600">
          Drag & drop PDF files here, or click to select files
        </p>
      </div>

      {uploadedFiles.length > 0 && (
        <div className="space-y-4">
          <div className="flex justify-between items-center">
            <h3 className="font-semibold">Uploaded Files:</h3>
            <div className="flex space-x-2">
              <button
                onClick={startExtraction}
                disabled={processing || uploadedFiles.every(f => f.processed)}
                className={`flex items-center space-x-2 px-4 py-2 rounded-lg text-white ${
                  processing || uploadedFiles.every(f => f.processed)
                    ? 'bg-gray-400 cursor-not-allowed'
                    : 'bg-blue-500 hover:bg-blue-600'
                }`}
              >
                <Play className="h-4 w-4" />
                <span>{processing ? 'Processing...' : 'Start Extraction'}</span>
              </button>
              {processedData && (
                <button
                  onClick={downloadExcel}
                  disabled={downloading}
                  className={`flex items-center space-x-2 px-4 py-2 rounded-lg text-white ${
                    downloading
                      ? 'bg-gray-400 cursor-not-allowed'
                      : 'bg-green-500 hover:bg-green-600'
                  }`}
                >
                  <Download className="h-4 w-4" />
                  <span>{downloading ? 'Downloading...' : 'Download Excel'}</span>
                </button>
              )}
            </div>
          </div>

          <div className="space-y-2">
            {uploadedFiles.map((file, index) => (
              <div
                key={file.preview}
                className="flex items-center justify-between p-3 bg-white rounded-lg border"
              >
                <div className="flex items-center space-x-3">
                  <File className="h-5 w-5 text-blue-500" />
                  <span className="text-sm">{file.file.name}</span>
                  {file.processed && (
                    <span className="text-sm text-green-500">✓ Processed</span>
                  )}
                </div>
                <div className="flex items-center space-x-2">
                  {file.loading ? (
                    <div className="text-sm text-gray-500">Extracting text...</div>
                  ) : file.error ? (
                    <div className="text-sm text-red-500">{file.error}</div>
                  ) : file.text ? (
                    <button
                      onClick={() => setPreviewText(file.text)}
                      className="px-3 py-1 text-sm text-blue-600 hover:text-blue-700"
                    >
                      Preview Text
                    </button>
                  ) : null}
                  <button
                    onClick={() => removeFile(index)}
                    className="p-1 hover:bg-gray-100 rounded"
                  >
                    <X className="h-4 w-4 text-gray-500" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {previewText && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-lg max-w-2xl w-full max-h-[80vh] overflow-auto p-6">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-semibold">Extracted Text</h3>
              <button
                onClick={() => setPreviewText(null)}
                className="p-1 hover:bg-gray-100 rounded"
              >
                <X className="h-5 w-5" />
              </button>
            </div>
            <pre className="whitespace-pre-wrap text-sm">{previewText}</pre>
          </div>
        </div>
      )}

      {processedData && (
        <div className="mt-8">
          <h3 className="font-semibold mb-4">Processed Data:</h3>
          <pre className="bg-gray-50 p-4 rounded-lg overflow-auto max-h-[400px]">
            {JSON.stringify(processedData, null, 2)}
          </pre>
        </div>
      )}

      {toasts.map((toast) => (
        <Toast
          key={toast.id}
          message={toast.message}
          type={toast.type}
          onClose={() => removeToast(toast.id)}
        />
      ))}
    </div>
  );
}
