/**
 * Google Veo 3 Provider
 *
 * Google's state-of-the-art video generation model
 * Supports: text-to-video, image-to-video
 *
 * Documentation: https://ai.google.dev/gemini-api/docs/video-generation
 */
import { BaseAIProvider } from './base';
import {
  AIProviderName,
  AICapability,
  VideoGenerationParams,
  VideoResult,
  JobStatus,
  VideoStatus,
} from '@/types/ai';
import { GoogleAuth } from 'google-auth-library';

interface VeoGenerationRequest {
  prompt: string;
  negative_prompt?: string;
  aspect_ratio?: string;
  duration_seconds?: number;
  seed?: number;
  guidance_scale?: number;
  image_url?: string; // For image-to-video
}

interface VeoJobResponse {
  name: string; // Job ID in format: projects/{project}/locations/{location}/operations/{operation}
  metadata?: {
    state: string;
    progress_percentage?: number;
  };
  done?: boolean;
  response?: {
    video_uri: string;
    thumbnail_uri?: string;
  };
  error?: {
    code: number;
    message: string;
  };
}

export class GoogleVeoProvider extends BaseAIProvider {
  readonly name: AIProviderName = 'google_veo';
  readonly capabilities: AICapability[] = ['text-to-video', 'image-to-video'];
  readonly maxDuration: number = 60; // Veo supports up to 60 seconds
  readonly costPerSecond: number = 0.15; // Estimated cost

  private projectId: string;
  private location: string;
  private auth: GoogleAuth | null = null;

  constructor(config: {
    apiKey?: string;
    credentialsPath?: string;
    projectId?: string;
    location?: string;
  }) {
    const baseUrl = config.projectId
      ? `https://${config.location || 'us-central1'}-aiplatform.googleapis.com/v1`
      : 'https://generativelanguage.googleapis.com/v1beta';

    super({
      apiKey: config.apiKey || '',
      baseUrl,
      timeout: 600000,
      maxRetries: 3,
    });

    this.projectId = config.projectId || '';
    this.location = config.location || 'us-central1';

    // Initialize Google Auth if using service account
    if (config.credentialsPath) {
      this.auth = new GoogleAuth({
        keyFilename: config.credentialsPath,
        scopes: ['https://www.googleapis.com/auth/cloud-platform'],
      });
    }
  }

  /**
   * Generate video using Google Veo 3
   */
  async generateVideo(params: VideoGenerationParams): Promise<VideoResult> {
    try {
      this.log('info', 'Starting video generation', { params });

      // Validate parameters
      const validation = await this.validateParams(params);
      if (!validation.valid) {
        throw new Error(`Invalid parameters: ${validation.errors?.join(', ')}`);
      }

      // Prepare request
      const request = this.prepareRequest(params);

      // Submit generation job
      const endpoint = this.projectId
        ? `/projects/${this.projectId}/locations/${this.location}/models/veo-3:generate`
        : `/models/veo-3:generateVideo`;

      const headers = await this.getAuthHeaders();

      const response = await this.makeRequest<VeoJobResponse>('post', endpoint, request, headers);

      // Extract job ID from response name
      const jobId = this.extractJobId(response.name);

      this.log('info', 'Video generation job submitted', { jobId });

      return {
        success: true,
        jobId,
        status: 'processing',
        estimatedTimeSeconds: (params.duration || 5) * 10, // Rough estimate
      };
    } catch (error: any) {
      this.log('error', 'Failed to generate video', error);
      throw new Error(`Google Veo generation failed: ${error.message}`);
    }
  }

  /**
   * Check job status
   */
  async checkStatus(jobId: string): Promise<JobStatus> {
    try {
      const endpoint = this.projectId
        ? `/projects/${this.projectId}/locations/${this.location}/operations/${jobId}`
        : `/operations/${jobId}`;

      const headers = await this.getAuthHeaders();
      const response = await this.makeRequest<VeoJobResponse>('get', endpoint, undefined, headers);

      return this.parseJobStatus(jobId, response);
    } catch (error: any) {
      this.log('error', 'Failed to check status', error);
      throw new Error(`Failed to check job status: ${error.message}`);
    }
  }

  /**
   * Cancel job
   */
  async cancelJob(jobId: string): Promise<void> {
    try {
      const endpoint = this.projectId
        ? `/projects/${this.projectId}/locations/${this.location}/operations/${jobId}:cancel`
        : `/operations/${jobId}:cancel`;

      const headers = await this.getAuthHeaders();
      await this.makeRequest('post', endpoint, {}, headers);

      this.log('info', 'Job cancelled', { jobId });
    } catch (error: any) {
      this.log('error', 'Failed to cancel job', error);
      throw new Error(`Failed to cancel job: ${error.message}`);
    }
  }

  /**
   * Prepare generation request
   */
  private prepareRequest(params: VideoGenerationParams): VeoGenerationRequest {
    const request: VeoGenerationRequest = {
      prompt: params.prompt || '',
      duration_seconds: params.duration || 5,
      aspect_ratio: params.aspectRatio || '16:9',
    };

    if (params.negativePrompt) {
      request.negative_prompt = params.negativePrompt;
    }

    if (params.seed) {
      request.seed = params.seed;
    }

    if (params.guidanceScale) {
      request.guidance_scale = params.guidanceScale;
    }

    if (params.type === 'image-to-video' && params.sourceImage) {
      request.image_url = params.sourceImage;
    }

    return request;
  }

  /**
   * Parse job status from API response
   */
  private parseJobStatus(jobId: string, response: VeoJobResponse): JobStatus {
    let status: VideoStatus = 'processing';
    let progress: number | undefined;
    let videoUrl: string | undefined;
    let thumbnailUrl: string | undefined;
    let error: string | undefined;

    if (response.error) {
      status = 'failed';
      error = response.error.message;
    } else if (response.done) {
      status = 'completed';
      progress = 100;
      videoUrl = response.response?.video_uri;
      thumbnailUrl = response.response?.thumbnail_uri;
    } else if (response.metadata) {
      progress = response.metadata.progress_percentage;
    }

    return {
      jobId,
      status,
      progress,
      videoUrl,
      thumbnailUrl,
      error,
    };
  }

  /**
   * Extract job ID from Google's operation name
   */
  private extractJobId(name: string): string {
    // Extract operation ID from: projects/{project}/locations/{location}/operations/{operation}
    const parts = name.split('/');
    return parts[parts.length - 1];
  }

  /**
   * Get authentication headers
   */
  private async getAuthHeaders(): Promise<Record<string, string>> {
    const headers: Record<string, string> = {};

    if (this.auth) {
      // Use service account authentication
      const client = await this.auth.getClient();
      const token = await client.getAccessToken();
      if (token.token) {
        headers['Authorization'] = `Bearer ${token.token}`;
      }
    } else if (this.apiKey) {
      // Use API key authentication
      headers['x-goog-api-key'] = this.apiKey;
    }

    return headers;
  }
}
