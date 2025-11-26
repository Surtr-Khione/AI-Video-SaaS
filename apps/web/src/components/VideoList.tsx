'use client';

import { formatDistanceToNow } from 'date-fns';
import type { VideoResponse } from '@ai-video-saas/types';
import { videoAPI } from '@/lib/api';

interface VideoListProps {
  videos: VideoResponse[];
  onDelete: () => void;
}

export default function VideoList({ videos, onDelete }: VideoListProps) {
  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this video?')) {
      return;
    }

    try {
      await videoAPI.delete(id);
      onDelete();
    } catch (error) {
      console.error('Failed to delete video:', error);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'COMPLETED':
        return 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400';
      case 'PROCESSING':
        return 'bg-blue-100 text-blue-800 dark:bg-blue-900/20 dark:text-blue-400';
      case 'FAILED':
        return 'bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-400';
      default:
        return 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300';
    }
  };

  if (videos.length === 0) {
    return (
      <div className="text-center py-12 bg-white dark:bg-slate-800 rounded-lg">
        <div className="text-6xl mb-4">📹</div>
        <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
          No videos yet
        </h3>
        <p className="text-gray-600 dark:text-gray-400">
          Upload your first screen share demo to get started
        </p>
      </div>
    );
  }

  return (
    <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
      {videos.map((video) => (
        <div
          key={video.id}
          className="bg-white dark:bg-slate-800 rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow"
        >
          <div className="p-6">
            <div className="flex justify-between items-start mb-3">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white line-clamp-2">
                {video.title}
              </h3>
              <span
                className={`px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(
                  video.status
                )}`}
              >
                {video.status}
              </span>
            </div>

            {video.description && (
              <p className="text-gray-600 dark:text-gray-400 text-sm mb-4 line-clamp-2">
                {video.description}
              </p>
            )}

            <div className="space-y-2 text-sm text-gray-500 dark:text-gray-400">
              {video.qualityScore && (
                <div className="flex items-center gap-2">
                  <span>Quality Score:</span>
                  <div className="flex-1 bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                    <div
                      className={`h-2 rounded-full ${
                        video.qualityScore >= 80
                          ? 'bg-green-500'
                          : video.qualityScore >= 60
                          ? 'bg-yellow-500'
                          : 'bg-red-500'
                      }`}
                      style={{ width: `${video.qualityScore}%` }}
                    />
                  </div>
                  <span className="font-semibold">{video.qualityScore}</span>
                </div>
              )}

              <p>
                Created {formatDistanceToNow(new Date(video.createdAt))} ago
              </p>
            </div>

            <div className="mt-4 flex gap-2">
              <button className="flex-1 bg-primary-600 hover:bg-primary-700 text-white text-sm font-semibold py-2 px-4 rounded">
                View Details
              </button>
              <button
                onClick={() => handleDelete(video.id)}
                className="bg-red-600 hover:bg-red-700 text-white text-sm font-semibold py-2 px-4 rounded"
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}
