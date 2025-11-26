/**
 * Core types for AI video generation
 */

export type AIProviderName = 'google_veo' | 'openai_sora' | 'runway_ml' | 'replicate' | 'auto';

export type GenerationType =
  | 'text-to-video'
  | 'image-to-video'
  | 'video-editing'
  | 'video-enhancement';

export type VideoStatus =
  | 'pending'
  | 'queued'
  | 'processing'
  | 'completed'
  | 'failed'
  | 'cancelled';

export type AICapability =
  | 'text-to-video'
  | 'image-to-video'
  | 'video-editing'
  | 'video-enhancement'
  | 'style-transfer'
  | 'upscaling';

/**
 * Standard video generation parameters
 */
export interface VideoGenerationParams {
  // Core params
  type: GenerationType;
  prompt?: string;
  negativePrompt?: string;

  // Source media
  sourceImage?: string;  // URL or base64
  sourceVideo?: string;  // URL or base64

  // Video specs
  duration?: number;     // Seconds
  resolution?: string;   // "1920x1080", "1280x720", etc.
  fps?: number;         // Frames per second
  aspectRatio?: string; // "16:9", "9:16", "1:1", etc.

  // Style and creativity
  style?: string;
  seed?: number;
  guidanceScale?: number;  // How closely to follow prompt (CFG scale)

  // Provider-specific options
  options?: Record<string, any>;
}

/**
 * Video generation result
 */
export interface VideoResult {
  success: boolean;
  jobId: string;
  status: VideoStatus;
  videoUrl?: string;
  thumbnailUrl?: string;
  duration?: number;
  resolution?: string;
  metadata?: Record<string, any>;
  error?: string;
  estimatedTimeSeconds?: number;
}

/**
 * Job status response
 */
export interface JobStatus {
  jobId: string;
  status: VideoStatus;
  progress?: number;  // 0-100
  videoUrl?: string;
  thumbnailUrl?: string;
  error?: string;
  metadata?: Record<string, any>;
  estimatedTimeRemaining?: number; // Seconds
}

/**
 * Provider configuration
 */
export interface ProviderConfig {
  name: AIProviderName;
  enabled: boolean;
  apiKey?: string;
  apiSecret?: string;
  webhookSecret?: string;
  baseUrl?: string;
  timeout?: number;
  maxRetries?: number;
}

/**
 * Base interface that all AI providers must implement
 */
export interface AIProvider {
  readonly name: AIProviderName;
  readonly capabilities: AICapability[];
  readonly maxDuration: number;  // Max video duration in seconds
  readonly costPerSecond: number; // Estimated cost per second of video

  /**
   * Generate a video
   */
  generateVideo(params: VideoGenerationParams): Promise<VideoResult>;

  /**
   * Check the status of a generation job
   */
  checkStatus(jobId: string): Promise<JobStatus>;

  /**
   * Cancel a running job
   */
  cancelJob(jobId: string): Promise<void>;

  /**
   * Check if provider supports a capability
   */
  supports(capability: AICapability): boolean;

  /**
   * Estimate cost for generation
   */
  estimateCost(params: VideoGenerationParams): Promise<number>;

  /**
   * Validate parameters for this provider
   */
  validateParams(params: VideoGenerationParams): Promise<{ valid: boolean; errors?: string[] }>;
}

/**
 * Webhook payload from AI providers
 */
export interface WebhookPayload {
  provider: AIProviderName;
  jobId: string;
  status: VideoStatus;
  videoUrl?: string;
  error?: string;
  metadata?: Record<string, any>;
  timestamp: string;
}
