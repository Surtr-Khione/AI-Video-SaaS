// API Request/Response Types
export interface LoginRequest {
  email: string;
  password: string;
}

export interface RegisterRequest {
  email: string;
  password: string;
  name?: string;
}

export interface AuthResponse {
  token: string;
  user: UserProfile;
}

export interface UserProfile {
  id: string;
  email: string;
  name?: string;
  createdAt: string;
}

export interface VideoUploadRequest {
  title: string;
  description?: string;
}

export interface VideoResponse {
  id: string;
  title: string;
  description?: string;
  status: VideoStatus;
  originalUrl: string;
  processedUrl?: string;
  originalDuration?: number;
  processedDuration?: number;
  transcription?: string;
  scenes?: Scene[];
  enhancements?: VideoEnhancement;
  qualityScore?: number;
  createdAt: string;
  updatedAt: string;
}

export type VideoStatus = 'UPLOADED' | 'PROCESSING' | 'COMPLETED' | 'FAILED';

export interface Scene {
  id: string;
  startTime: number;
  endTime: number;
  type: SceneType;
  description: string;
  thumbnail?: string;
  confidence: number;
}

export type SceneType =
  | 'INTRO'
  | 'FEATURE_DEMO'
  | 'TRANSITION'
  | 'CONCLUSION'
  | 'PAUSE'
  | 'ERROR';

export interface VideoEnhancement {
  audioEnhanced: boolean;
  noiseReduced: boolean;
  colorCorrected: boolean;
  stabilized: boolean;
  transitionsAdded: boolean;
  overlaysAdded: boolean;
}

export interface ProcessingJobResponse {
  id: string;
  videoId: string;
  type: JobType;
  status: JobStatus;
  progress: number;
  errorMessage?: string;
  createdAt: string;
  updatedAt: string;
}

export type JobType =
  | 'TRANSCRIPTION'
  | 'SCENE_DETECTION'
  | 'AUDIO_ENHANCEMENT'
  | 'VIDEO_ENHANCEMENT'
  | 'EXPORT';

export type JobStatus = 'PENDING' | 'RUNNING' | 'COMPLETED' | 'FAILED';

export interface VideoProcessingOptions {
  enhanceAudio?: boolean;
  removeFillerWords?: boolean;
  addTransitions?: boolean;
  addOverlays?: boolean;
  colorCorrection?: boolean;
  stabilization?: boolean;
}

export interface UploadProgress {
  loaded: number;
  total: number;
  percentage: number;
}

export interface ApiError {
  message: string;
  code: string;
  details?: Record<string, unknown>;
}
