'use client';

import { useState, useCallback } from 'react';
import { useDropzone } from 'react-dropzone';
import { videoAPI } from '@/lib/api';
import { useVideoStore } from '@/lib/store';

interface VideoUploadProps {
  onUploadComplete: () => void;
}

export default function VideoUpload({ onUploadComplete }: VideoUploadProps) {
  const addVideo = useVideoStore((state) => state.addVideo);
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [uploading, setUploading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [error, setError] = useState('');

  const onDrop = useCallback((acceptedFiles: File[]) => {
    if (acceptedFiles.length > 0) {
      setSelectedFile(acceptedFiles[0]);
      setError('');
    }
  }, []);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'video/*': ['.mp4', '.mov', '.avi', '.mkv'],
    },
    maxFiles: 1,
    maxSize: 2147483648, // 2GB
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!selectedFile || !title) {
      setError('Please select a video file and provide a title');
      return;
    }

    setUploading(true);
    setError('');

    try {
      const video = await videoAPI.upload(
        selectedFile,
        { title, description },
        setProgress
      );

      addVideo(video);
      setTitle('');
      setDescription('');
      setSelectedFile(null);
      setProgress(0);
      onUploadComplete();
    } catch (err: any) {
      setError(err.response?.data?.error?.message || 'Upload failed');
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="bg-white dark:bg-slate-800 rounded-lg shadow-md p-6 mb-8">
      <h3 className="text-xl font-semibold mb-4 text-gray-900 dark:text-white">
        Upload New Video
      </h3>

      {error && (
        <div className="mb-4 bg-red-50 dark:bg-red-900/20 border border-red-400 dark:border-red-800 text-red-700 dark:text-red-400 px-4 py-3 rounded">
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-4">
        <div
          {...getRootProps()}
          className={`border-2 border-dashed rounded-lg p-8 text-center cursor-pointer transition-colors ${
            isDragActive
              ? 'border-primary-500 bg-primary-50 dark:bg-primary-900/20'
              : 'border-gray-300 dark:border-gray-700 hover:border-primary-400'
          }`}
        >
          <input {...getInputProps()} />
          <div className="text-4xl mb-2">🎥</div>
          {selectedFile ? (
            <p className="text-gray-700 dark:text-gray-300">
              Selected: {selectedFile.name} ({Math.round(selectedFile.size / 1024 / 1024)}MB)
            </p>
          ) : (
            <>
              <p className="text-gray-700 dark:text-gray-300 mb-1">
                Drag & drop a video file here, or click to select
              </p>
              <p className="text-sm text-gray-500 dark:text-gray-400">
                Supported formats: MP4, MOV, AVI, MKV (max 2GB)
              </p>
            </>
          )}
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
            Title *
          </label>
          <input
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            required
            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-700 rounded-md focus:outline-none focus:ring-primary-500 focus:border-primary-500 dark:bg-slate-700 dark:text-white"
            placeholder="Enter video title"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
            Description
          </label>
          <textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            rows={3}
            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-700 rounded-md focus:outline-none focus:ring-primary-500 focus:border-primary-500 dark:bg-slate-700 dark:text-white"
            placeholder="Enter video description (optional)"
          />
        </div>

        {uploading && (
          <div>
            <div className="flex justify-between text-sm text-gray-600 dark:text-gray-400 mb-1">
              <span>Uploading...</span>
              <span>{progress}%</span>
            </div>
            <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
              <div
                className="bg-primary-600 h-2 rounded-full transition-all duration-300"
                style={{ width: `${progress}%` }}
              />
            </div>
          </div>
        )}

        <button
          type="submit"
          disabled={uploading || !selectedFile || !title}
          className="w-full bg-primary-600 hover:bg-primary-700 text-white font-semibold py-2 px-4 rounded-md disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {uploading ? 'Uploading...' : 'Upload and Process Video'}
        </button>
      </form>
    </div>
  );
}
