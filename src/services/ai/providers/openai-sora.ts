/**
 * OpenAI Sora Provider
 *
 * OpenAI's text-to-video generation model
 * Supports: text-to-video, image-to-video
 *
 * Documentation: https://platform.openai.com/docs/guides/video-generation
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
import OpenAI from 'openai';

interface SoraGenerationRequest {
  model: string;
  prompt: string;
  size?: string; // "1920x1080", "1080x1920", "1280x720"
  duration?: number; // Duration in seconds
  quality?: 'standard' | 'hd';
  image?: string; // For image-to-video
}

interface SoraJobResponse {
  id: string;
  status: 'queued' | 'processing' | 'succeeded' | 'failed' | 'cancelled';
  output?: {
    url: string;
    thumbnail_url?: string;
  };
  error?: {
    message: string;
  };
  progress?: number;
  created_at: number;
  completed_at?: number;
}

export class OpenAISoraProvider extends BaseAIProvider {
  readonly name: AIProviderName = 'openai_sora';
  readonly capabilities: AICapability[] = ['text-to-video', 'image-to-video'];
  readonly maxDuration: number = 60; // Sora supports up to 60 seconds
  readonly costPerSecond: number = 0.20; // Estimated cost (pricing may vary)

  private openai: OpenAI;

  constructor(config: { apiKey: string; organizationId?: string }) {
    super({
      apiKey: config.apiKey,
      baseUrl: 'https://api.openai.com/v1',
      timeout: 600000,
      maxRetries: 3,
    });

    this.openai = new OpenAI({
      apiKey: config.apiKey,
      organization: config.organizationId,
    });
  }

  /**
   * Generate video using OpenAI Sora
   */
  async generateVideo(params: VideoGenerationParams): Promise<VideoResult> {
    try {
      this.log('info', 'Starting video generation with Sora', { params });

      // Validate parameters
      const validation = await this.validateParams(params);
      if (!validation.valid) {
        throw new Error(`Invalid parameters: ${validation.errors?.join(', ')}`);
      }

      // Prepare request
      const request = this.prepareRequest(params);

      // Note: As of now, Sora API is in limited preview. The actual API endpoints may differ.
      // This is a proposed implementation based on expected OpenAI patterns.

      // Submit video generation job
      const response = await this.makeRequest<SoraJobResponse>(
        'post',
        '/video/generations',
        request,
        {
          'Authorization': `Bearer ${this.apiKey}`,
        }
      );

      this.log('info', 'Sora video generation job submitted', { jobId: response.id });

      return {
        success: true,
        jobId: response.id,
        status: this.mapStatus(response.status),
        estimatedTimeSeconds: (params.duration || 5) * 15, // Rough estimate
      };
    } catch (error: any) {
      this.log('error', 'Failed to generate video with Sora', error);

      // Handle specific OpenAI errors
      if (error.response?.status === 401) {
        throw new Error('Invalid OpenAI API key');
      } else if (error.response?.status === 403) {
        throw new Error('Sora API access not available. You may need to join the waitlist.');
      } else if (error.response?.status === 429) {
        throw new Error('Rate limit exceeded. Please try again later.');
      }

      throw new Error(`OpenAI Sora generation failed: ${error.message}`);
    }
  }

  /**
   * Check job status
   */
  async checkStatus(jobId: string): Promise<JobStatus> {
    try {
      const response = await this.makeRequest<SoraJobResponse>(
        'get',
        `/video/generations/${jobId}`,
        undefined,
        {
          'Authorization': `Bearer ${this.apiKey}`,
        }
      );

      return this.parseJobStatus(response);
    } catch (error: any) {
      this.log('error', 'Failed to check Sora job status', error);
      throw new Error(`Failed to check job status: ${error.message}`);
    }
  }

  /**
   * Cancel job
   */
  async cancelJob(jobId: string): Promise<void> {
    try {
      await this.makeRequest(
        'post',
        `/video/generations/${jobId}/cancel`,
        {},
        {
          'Authorization': `Bearer ${this.apiKey}`,
        }
      );

      this.log('info', 'Sora job cancelled', { jobId });
    } catch (error: any) {
      this.log('error', 'Failed to cancel Sora job', error);
      throw new Error(`Failed to cancel job: ${error.message}`);
    }
  }

  /**
   * Prepare generation request
   */
  private prepareRequest(params: VideoGenerationParams): SoraGenerationRequest {
    const request: SoraGenerationRequest = {
      model: 'sora-1.0', // Model name may vary
      prompt: params.prompt || '',
      duration: params.duration || 5,
      quality: 'hd',
    };

    // Map resolution
    if (params.resolution) {
      request.size = params.resolution;
    } else if (params.aspectRatio) {
      request.size = this.aspectRatioToSize(params.aspectRatio);
    }

    // Add source image for image-to-video
    if (params.type === 'image-to-video' && params.sourceImage) {
      request.image = params.sourceImage;
    }

    return request;
  }

  /**
   * Parse job status from API response
   */
  private parseJobStatus(response: SoraJobResponse): JobStatus {
    const status = this.mapStatus(response.status);

    return {
      jobId: response.id,
      status,
      progress: response.progress,
      videoUrl: response.output?.url,
      thumbnailUrl: response.output?.thumbnail_url,
      error: response.error?.message,
    };
  }

  /**
   * Map Sora status to our standard status
   */
  private mapStatus(soraStatus: string): VideoStatus {
    const statusMap: Record<string, VideoStatus> = {
      'queued': 'queued',
      'processing': 'processing',
      'succeeded': 'completed',
      'failed': 'failed',
      'cancelled': 'cancelled',
    };

    return statusMap[soraStatus] || 'processing';
  }

  /**
   * Convert aspect ratio to resolution size
   */
  private aspectRatioToSize(aspectRatio: string): string {
    const sizeMap: Record<string, string> = {
      '16:9': '1920x1080',
      '9:16': '1080x1920',
      '4:3': '1280x960',
      '1:1': '1080x1080',
    };

    return sizeMap[aspectRatio] || '1920x1080';
  }

  /**
   * Estimate cost override for Sora
   */
  async estimateCost(params: VideoGenerationParams): Promise<number> {
    const duration = params.duration || 5;
    const baseCost = duration * this.costPerSecond;

    // HD quality may cost more
    const qualityMultiplier = params.resolution?.includes('1920') ? 1.5 : 1.0;

    return baseCost * qualityMultiplier;
  }
}
