import { create } from 'zustand';
import type { UserProfile, VideoResponse } from '@ai-video-saas/types';

interface AuthState {
  user: UserProfile | null;
  token: string | null;
  setAuth: (user: UserProfile, token: string) => void;
  logout: () => void;
}

export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  token: typeof window !== 'undefined' ? localStorage.getItem('token') : null,
  setAuth: (user, token) => {
    localStorage.setItem('token', token);
    set({ user, token });
  },
  logout: () => {
    localStorage.removeItem('token');
    set({ user: null, token: null });
  },
}));

interface VideoState {
  videos: VideoResponse[];
  selectedVideo: VideoResponse | null;
  setVideos: (videos: VideoResponse[]) => void;
  addVideo: (video: VideoResponse) => void;
  updateVideo: (id: string, video: Partial<VideoResponse>) => void;
  removeVideo: (id: string) => void;
  setSelectedVideo: (video: VideoResponse | null) => void;
}

export const useVideoStore = create<VideoState>((set) => ({
  videos: [],
  selectedVideo: null,
  setVideos: (videos) => set({ videos }),
  addVideo: (video) => set((state) => ({ videos: [video, ...state.videos] })),
  updateVideo: (id, updates) =>
    set((state) => ({
      videos: state.videos.map((v) => (v.id === id ? { ...v, ...updates } : v)),
    })),
  removeVideo: (id) =>
    set((state) => ({
      videos: state.videos.filter((v) => v.id !== id),
    })),
  setSelectedVideo: (video) => set({ selectedVideo: video }),
}));
