'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuthStore, useVideoStore } from '@/lib/store';
import { videoAPI } from '@/lib/api';
import VideoUpload from '@/components/VideoUpload';
import VideoList from '@/components/VideoList';

export default function DashboardPage() {
  const router = useRouter();
  const { user, token, logout } = useAuthStore();
  const { videos, setVideos } = useVideoStore();
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!token) {
      router.push('/auth/login');
      return;
    }

    loadVideos();
  }, [token, router]);

  const loadVideos = async () => {
    try {
      const data = await videoAPI.getAll();
      setVideos(data);
    } catch (error) {
      console.error('Failed to load videos:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = () => {
    logout();
    router.push('/');
  };

  if (!user) {
    return null;
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-slate-900">
      <nav className="bg-white dark:bg-slate-800 border-b border-gray-200 dark:border-slate-700">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16">
            <div className="flex items-center">
              <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
                AI Video Platform
              </h1>
            </div>
            <div className="flex items-center gap-4">
              <span className="text-gray-700 dark:text-gray-300">
                {user.name || user.email}
              </span>
              <button
                onClick={handleLogout}
                className="text-gray-600 hover:text-gray-900 dark:text-gray-400 dark:hover:text-white"
              >
                Sign out
              </button>
            </div>
          </div>
        </div>
      </nav>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
            Your Video Demos
          </h2>
          <p className="text-gray-600 dark:text-gray-400">
            Upload screen share sales demos and transform them into professional
            product videos
          </p>
        </div>

        <VideoUpload onUploadComplete={loadVideos} />

        {loading ? (
          <div className="text-center py-12">
            <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
            <p className="mt-4 text-gray-600 dark:text-gray-400">
              Loading videos...
            </p>
          </div>
        ) : (
          <VideoList videos={videos} onDelete={loadVideos} />
        )}
      </main>
    </div>
  );
}
