export interface Video {
  id: string
  title: string
  originalName: string
  thumbnail?: string
  duration: string
  size: string
  format: string
  transformation: string
  status: "processing" | "completed" | "failed"
  progress?: number
  createdAt: string
  updatedAt: string
  filePath?: string
  processedPath?: string
  options: ProcessingOptions
}

export interface ProcessingOptions {
  transformation: string
  quality: string
  format: string
  aspectRatio: string
  notes?: string
}

export interface UploadResponse {
  success: boolean
  video?: Video
  error?: string
}

export interface VideoListResponse {
  success: boolean
  videos: Video[]
  error?: string
}

export interface ProcessingStatusResponse {
  success: boolean
  video?: Video
  error?: string
}

export interface UserSettings {
  name: string
  email: string
  defaultQuality: string
  defaultFormat: string
  theme: string
  notifications: boolean
  autoProcess: boolean
  storageLimit: string
}
