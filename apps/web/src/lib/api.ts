import axios from 'axios';
import type {
  LoginRequest,
  RegisterRequest,
  AuthResponse,
  VideoResponse,
  VideoUploadRequest,
} from '@ai-video-saas/types';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';

const api = axios.create({
  baseURL: `${API_URL}/api`,
});

// Add auth token to requests
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Auth API
export const authAPI = {
  register: async (data: RegisterRequest): Promise<AuthResponse> => {
    const response = await api.post('/auth/register', data);
    return response.data;
  },

  login: async (data: LoginRequest): Promise<AuthResponse> => {
    const response = await api.post('/auth/login', data);
    return response.data;
  },

  getProfile: async () => {
    const response = await api.get('/users/me');
    return response.data;
  },
};

// Video API
export const videoAPI = {
  upload: async (
    file: File,
    metadata: VideoUploadRequest,
    onProgress?: (progress: number) => void
  ): Promise<VideoResponse> => {
    const formData = new FormData();
    formData.append('video', file);
    formData.append('title', metadata.title);
    if (metadata.description) {
      formData.append('description', metadata.description);
    }

    const response = await api.post('/videos/upload', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
      onUploadProgress: (progressEvent) => {
        if (onProgress && progressEvent.total) {
          const percentCompleted = Math.round(
            (progressEvent.loaded * 100) / progressEvent.total
          );
          onProgress(percentCompleted);
        }
      },
    });

    return response.data;
  },

  getAll: async (): Promise<VideoResponse[]> => {
    const response = await api.get('/videos');
    return response.data;
  },

  getById: async (id: string): Promise<VideoResponse> => {
    const response = await api.get(`/videos/${id}`);
    return response.data;
  },

  delete: async (id: string): Promise<void> => {
    await api.delete(`/videos/${id}`);
  },
};

export default api;
