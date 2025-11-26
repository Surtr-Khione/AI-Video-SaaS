/**
 * Runway ML Provider
 *
 * Runway's Gen-3 Alpha video generation model
 * Supports: text-to-video, image-to-video, video-editing
 *
 * Documentation: https://docs.runwayml.com/
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

interface RunwayGenerationRequest {
  promptText: string;
  model?: 'gen3a_turbo' | 'gen3a';
  duration?: number; // 5 or 10 seconds
  ratio?: '1280:768' | '768:1280' | '1024:1024';
  seed?: number;
  watermark?: boolean;
  // For image-to-video
  promptImage?: string;
  // For video-to-video
  promptVideo?: string;
}

interface RunwayJobResponse {
  id: string;
  status: 'PENDING' | 'RUNNING' | 'SUCCEEDED' | 'FAILED' | 'CANCELLED';
  progress?: number;
  output?: string[]; // Array of video URLs
  failure?: string;
  failureCode?: string;
  createdAt: string;
  updatedAt: string;
}

export class RunwayMLProvider extends BaseAIProvider {
  readonly name: AIProviderName = 'runway_ml';
  readonly capabilities: AICapability[] = ['text-to-video', 'image-to-video', 'video-editing'];
  readonly maxDuration: number = 10; // Gen-3 supports up to 10 seconds
  readonly costPerSecond: number = 0.50; // Gen-3 Alpha pricing

  constructor(config: { apiKey: string; apiSecret?: string }) {
    super({
      apiKey: config.apiKey,
      baseUrl: 'https://api.runwayml.com/v1',
      timeout: 600000,
      maxRetries: 3,
    });
  }

  /**
   * Generate video using Runway ML
   */
  async generateVideo(params: VideoGenerationParams): Promise<VideoResult> {
    try {
      this.log('info', 'Starting video generation with Runway ML', { params });

      // Validate parameters
      const validation = await this.validateParams(params);
      if (!validation.valid) {
        throw new Error(`Invalid parameters: ${validation.errors?.join(', ')}`);
      }

      // Prepare request
      const request = this.prepareRequest(params);

      // Submit generation job
      const response = await this.makeRequest<RunwayJobResponse>(
        'post',
        '/tasks',
        request,
        {
          'Authorization': `Bearer ${this.apiKey}`,
          'X-Runway-Version': '2024-11-06',
        }
      );

      this.log('info', 'Runway ML job submitted', { jobId: response.id });

      return {
        success: true,
        jobId: response.id,
        status: this.mapStatus(response.status),
        estimatedTimeSeconds: 60, // Gen-3 typically takes ~60 seconds
      };
    } catch (error: any) {
      this.log('error', 'Failed to generate video with Runway ML', error);

      if (error.response?.status === 401) {
        throw new Error('Invalid Runway ML API key');
      } else if (error.response?.status === 402) {
        throw new Error('Insufficient credits. Please add credits to your Runway account.');
      } else if (error.response?.status === 429) {
        throw new Error('Rate limit exceeded. Please try again later.');
      }

      throw new Error(`Runway ML generation failed: ${error.message}`);
    }
  }

  /**
   * Check job status
   */
  async checkStatus(jobId: string): Promise<JobStatus> {
    try {
      const response = await this.makeRequest<RunwayJobResponse>(
        'get',
        `/tasks/${jobId}`,
        undefined,
        {
          'Authorization': `Bearer ${this.apiKey}`,
        }
      );

      return this.parseJobStatus(response);
    } catch (error: any) {
      this.log('error', 'Failed to check Runway ML job status', error);
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
        `/tasks/${jobId}/cancel`,
        {},
        {
          'Authorization': `Bearer ${this.apiKey}`,
        }
      );

      this.log('info', 'Runway ML job cancelled', { jobId });
    } catch (error: any) {
      this.log('error', 'Failed to cancel Runway ML job', error);
      throw new Error(`Failed to cancel job: ${error.message}`);
    }
  }

  /**
   * Prepare generation request
   */
  private prepareRequest(params: VideoGenerationParams): RunwayGenerationRequest {
    const request: RunwayGenerationRequest = {
      promptText: params.prompt || '',
      model: 'gen3a_turbo', // Use turbo for faster generation
      duration: Math.min(params.duration || 5, 10), // Max 10 seconds
      watermark: false,
    };

    // Map aspect ratio
    if (params.aspectRatio) {
      request.ratio = this.mapAspectRatio(params.aspectRatio);
    }

    if (params.seed) {
      request.seed = params.seed;
    }

    // Add source media
    if (params.type === 'image-to-video' && params.sourceImage) {
      request.promptImage = params.sourceImage;
    }

    if (params.type === 'video-editing' && params.sourceVideo) {
      request.promptVideo = params.sourceVideo;
    }

    return request;
  }

  /**
   * Parse job status from API response
   */
  private parseJobStatus(response: RunwayJobResponse): JobStatus {
    const status = this.mapStatus(response.status);
    let videoUrl: string | undefined;

    // Runway returns array of URLs, take the first one
    if (response.output && response.output.length > 0) {
      videoUrl = response.output[0];
    }

    return {
      jobId: response.id,
      status,
      progress: response.progress,
      videoUrl,
      error: response.failure,
      metadata: {
        failureCode: response.failureCode,
        createdAt: response.createdAt,
        updatedAt: response.updatedAt,
      },
    };
  }

  /**
   * Map Runway status to our standard status
   */
  private mapStatus(runwayStatus: string): VideoStatus {
    const statusMap: Record<string, VideoStatus> = {
      'PENDING': 'queued',
      'RUNNING': 'processing',
      'SUCCEEDED': 'completed',
      'FAILED': 'failed',
      'CANCELLED': 'cancelled',
    };

    return statusMap[runwayStatus] || 'processing';
  }

  /**
   * Map aspect ratio to Runway format
   */
  private mapAspectRatio(aspectRatio: string): '1280:768' | '768:1280' | '1024:1024' {
    const ratioMap: Record<string, '1280:768' | '768:1280' | '1024:1024'> = {
      '16:9': '1280:768',
      '9:16': '768:1280',
      '1:1': '1024:1024',
      '4:3': '1280:768',
      '3:4': '768:1280',
    };

    return ratioMap[aspectRatio] || '1280:768';
  }

  /**
   * Validate parameters for Runway
   */
  async validateParams(params: VideoGenerationParams): Promise<{ valid: boolean; errors?: string[] }> {
    const result = await super.validateParams(params);

    // Additional Runway-specific validations
    if (params.duration && params.duration > 10) {
      result.errors = result.errors || [];
      result.errors.push('Runway ML Gen-3 supports maximum 10 seconds duration');
      result.valid = false;
    }

    return result;
  }
}
