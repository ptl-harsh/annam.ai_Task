import React, { useState, useCallback } from 'react';
import { useDropzone } from 'react-dropzone';
import { Upload, X, FileVideo, AlertCircle } from 'lucide-react';
import { Button } from './ui/button';
import { formatFileSize } from '@/lib/utils';
import { useToast } from '@/hooks/use-toast';

interface VideoUploadProps {
  onUpload: (file: File) => void;
  isUploading: boolean;
}

const VideoUpload: React.FC<VideoUploadProps> = ({ onUpload, isUploading }) => {
  const [file, setFile] = useState<File | null>(null);
  const { toast } = useToast();

  const onDrop = useCallback((acceptedFiles: File[]) => {
    const selectedFile = acceptedFiles[0];
    
    // Validate file type
    if (!selectedFile.type.includes('video/mp4')) {
      toast({
        variant: "destructive",
        title: "Invalid file type",
        description: "Please upload an MP4 video file.",
      });
      return;
    }
    
    // Validate file size (100MB max)
    if (selectedFile.size > 100 * 1024 * 1024) {
      toast({
        variant: "destructive",
        title: "File too large",
        description: "Maximum file size is 100MB.",
      });
      return;
    }
    
    setFile(selectedFile);
  }, [toast]);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'video/mp4': ['.mp4']
    },
    maxFiles: 1,
    disabled: isUploading
  });

  const handleClearFile = (e: React.MouseEvent) => {
    e.stopPropagation();
    setFile(null);
  };

  const handleUpload = () => {
    if (file) {
      onUpload(file);
    }
  };

  return (
    <div className="w-full">
      <div
        {...getRootProps()}
        className={`border-2 border-dashed rounded-lg p-8 transition-colors duration-200 ease-in-out flex flex-col items-center justify-center cursor-pointer ${
          isDragActive
            ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20'
            : 'border-gray-300 hover:border-blue-400 dark:border-gray-700 dark:hover:border-blue-600'
        } ${isUploading ? 'opacity-75 pointer-events-none' : ''}`}
      >
        <input {...getInputProps()} />
        
        {file ? (
          <div className="w-full">
            <div className="flex items-center justify-between bg-gray-100 dark:bg-gray-800 p-3 rounded-md">
              <div className="flex items-center">
                <FileVideo className="h-6 w-6 text-blue-600 mr-2" />
                <div>
                  <p className="text-sm font-medium truncate max-w-[250px] sm:max-w-sm">{file.name}</p>
                  <p className="text-xs text-gray-500 dark:text-gray-400">{formatFileSize(file.size)}</p>
                </div>
              </div>
              <button
                type="button"
                onClick={handleClearFile}
                className="text-gray-500 hover:text-gray-700 dark:hover:text-gray-300"
                disabled={isUploading}
              >
                <X className="h-5 w-5" />
              </button>
            </div>
          </div>
        ) : (
          <>
            <div className="mb-4 rounded-full bg-blue-100 p-3 dark:bg-blue-900/30">
              <Upload className="h-6 w-6 text-blue-600 dark:text-blue-400" />
            </div>
            <p className="mb-1 text-base font-medium">Upload a video lecture</p>
            <p className="text-sm text-gray-500 dark:text-gray-400 text-center mb-2">
              Drag and drop an MP4 file here, or click to select
            </p>
            <p className="text-xs text-gray-400 dark:text-gray-500 flex items-center">
              <AlertCircle className="h-3 w-3 mr-1" />
              MP4 format only, max 100MB
            </p>
          </>
        )}
      </div>

      {file && (
        <div className="mt-4 flex justify-end">
          <Button
            onClick={handleUpload}
            disabled={isUploading}
            className="transition-all duration-200"
          >
            {isUploading ? 'Uploading...' : 'Process Video'}
          </Button>
        </div>
      )}
    </div>
  );
};

export default VideoUpload;