/**
 * Replicate Provider
 *
 * Access to multiple video AI models through Replicate:
 * - Stable Video Diffusion
 * - AnimateDiff
 * - Zeroscope
 * - And more...
 *
 * Documentation: https://replicate.com/docs
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
import Replicate from 'replicate';

// Popular video models on Replicate
const VIDEO_MODELS = {
  STABLE_VIDEO_DIFFUSION: 'stability-ai/stable-video-diffusion:3f0457e4619daac51203dedb472816fd4af51f3149fa7a9e0b5ffcf1b8172438',
  ANIMATE_DIFF: 'lucataco/animate-diff:beecf59c4aee8d81bf04f0381033dfa10dc16e845b4ae00d281e2fa377e48a9f',
  ZEROSCOPE_V2: 'anotherjesse/zeroscope-v2-xl:9f747673945c62801b13b84701c783929c0ee784e4748ec062204894dda1a351',
  HOTSHOT_XL: 'lucataco/hotshot-xl:78b3a6257e16e4b241245d65c8b2b81ea2e1ff7ed4c55306b511509ddbfd327a',
};

interface ReplicateInput {
  prompt?: string;
  image?: string;
  video?: string;
  num_frames?: number;
  num_inference_steps?: number;
  fps?: number;
  motion_bucket_id?: number;
  cond_aug?: number;
  seed?: number;
  [key: string]: any;
}

interface ReplicatePrediction {
  id: string;
  status: 'starting' | 'processing' | 'succeeded' | 'failed' | 'canceled';
  output?: string | string[] | null;
  error?: string;
  logs?: string;
  metrics?: {
    predict_time?: number;
  };
  created_at: string;
  started_at?: string;
  completed_at?: string;
}

export class ReplicateProvider extends BaseAIProvider {
  readonly name: AIProviderName = 'replicate';
  readonly capabilities: AICapability[] = ['text-to-video', 'image-to-video', 'video-enhancement'];
  readonly maxDuration: number = 60;
  readonly costPerSecond: number = 0.10; // Varies by model

  private replicate: Replicate;
  private defaultModel: string = VIDEO_MODELS.STABLE_VIDEO_DIFFUSION;

  constructor(config: { apiKey: string; defaultModel?: string }) {
    super({
      apiKey: config.apiKey,
      baseUrl: 'https://api.replicate.com/v1',
      timeout: 600000,
      maxRetries: 3,
    });

    this.replicate = new Replicate({
      auth: config.apiKey,
    });

    if (config.defaultModel) {
      this.defaultModel = config.defaultModel;
    }
  }

  /**
   * Generate video using Replicate
   */
  async generateVideo(params: VideoGenerationParams): Promise<VideoResult> {
    try {
      this.log('info', 'Starting video generation with Replicate', { params });

      // Validate parameters
      const validation = await this.validateParams(params);
      if (!validation.valid) {
        throw new Error(`Invalid parameters: ${validation.errors?.join(', ')}`);
      }

      // Select model based on generation type
      const model = this.selectModel(params);

      // Prepare input
      const input = this.prepareInput(params);

      this.log('info', 'Running Replicate prediction', { model, input });

      // Create prediction
      const prediction = await this.replicate.predictions.create({
        version: model,
        input,
      });

      this.log('info', 'Replicate prediction created', { predictionId: prediction.id });

      return {
        success: true,
        jobId: prediction.id,
        status: this.mapStatus(prediction.status),
        estimatedTimeSeconds: 120, // Replicate typically takes 1-2 minutes
      };
    } catch (error: any) {
      this.log('error', 'Failed to generate video with Replicate', error);

      if (error.message?.includes('authentication')) {
        throw new Error('Invalid Replicate API token');
      } else if (error.message?.includes('billing')) {
        throw new Error('Insufficient credits. Please add credits to your Replicate account.');
      }

      throw new Error(`Replicate generation failed: ${error.message}`);
    }
  }

  /**
   * Check job status
   */
  async checkStatus(jobId: string): Promise<JobStatus> {
    try {
      const prediction = await this.replicate.predictions.get(jobId);

      return this.parseJobStatus(prediction);
    } catch (error: any) {
      this.log('error', 'Failed to check Replicate job status', error);
      throw new Error(`Failed to check job status: ${error.message}`);
    }
  }

  /**
   * Cancel job
   */
  async cancelJob(jobId: string): Promise<void> {
    try {
      await this.replicate.predictions.cancel(jobId);

      this.log('info', 'Replicate prediction cancelled', { jobId });
    } catch (error: any) {
      this.log('error', 'Failed to cancel Replicate prediction', error);
      throw new Error(`Failed to cancel job: ${error.message}`);
    }
  }

  /**
   * Select appropriate model based on generation type
   */
  private selectModel(params: VideoGenerationParams): string {
    // Allow custom model override
    if (params.options?.model) {
      return params.options.model;
    }

    // Select based on generation type
    switch (params.type) {
      case 'image-to-video':
        return VIDEO_MODELS.STABLE_VIDEO_DIFFUSION;
      case 'text-to-video':
        return VIDEO_MODELS.ZEROSCOPE_V2;
      case 'video-enhancement':
        return VIDEO_MODELS.ANIMATE_DIFF;
      default:
        return this.defaultModel;
    }
  }

  /**
   * Prepare input for Replicate model
   */
  private prepareInput(params: VideoGenerationParams): ReplicateInput {
    const input: ReplicateInput = {};

    // Common parameters
    if (params.prompt) {
      input.prompt = params.prompt;
    }

    if (params.seed) {
      input.seed = params.seed;
    }

    // Model-specific parameters
    if (params.type === 'image-to-video') {
      // Stable Video Diffusion
      if (params.sourceImage) {
        input.image = params.sourceImage;
      }
      input.num_frames = Math.min((params.duration || 3) * (params.fps || 8), 25);
      input.fps = params.fps || 8;
      input.motion_bucket_id = params.options?.motionBucketId || 127;
      input.cond_aug = params.options?.condAug || 0.02;
      input.num_inference_steps = params.options?.steps || 25;
    } else if (params.type === 'text-to-video') {
      // Zeroscope or AnimateDiff
      input.num_frames = Math.min((params.duration || 3) * (params.fps || 8), 24);
      input.fps = params.fps || 8;
      input.num_inference_steps = params.options?.steps || 50;
    }

    // Add any custom options
    if (params.options) {
      Object.assign(input, params.options);
    }

    return input;
  }

  /**
   * Parse job status from Replicate prediction
   */
  private parseJobStatus(prediction: ReplicatePrediction): JobStatus {
    const status = this.mapStatus(prediction.status);
    let videoUrl: string | undefined;

    // Handle different output formats
    if (prediction.output) {
      if (typeof prediction.output === 'string') {
        videoUrl = prediction.output;
      } else if (Array.isArray(prediction.output) && prediction.output.length > 0) {
        videoUrl = prediction.output[0];
      }
    }

    // Calculate progress
    let progress: number | undefined;
    if (prediction.status === 'succeeded') {
      progress = 100;
    } else if (prediction.status === 'processing') {
      progress = 50; // Estimate
    } else if (prediction.status === 'starting') {
      progress = 10;
    }

    return {
      jobId: prediction.id,
      status,
      progress,
      videoUrl,
      error: prediction.error,
      metadata: {
        logs: prediction.logs,
        predictTime: prediction.metrics?.predict_time,
        createdAt: prediction.created_at,
        startedAt: prediction.started_at,
        completedAt: prediction.completed_at,
      },
    };
  }

  /**
   * Map Replicate status to our standard status
   */
  private mapStatus(replicateStatus: string): VideoStatus {
    const statusMap: Record<string, VideoStatus> = {
      'starting': 'queued',
      'processing': 'processing',
      'succeeded': 'completed',
      'failed': 'failed',
      'canceled': 'cancelled',
    };

    return statusMap[replicateStatus] || 'processing';
  }

  /**
   * List available video models
   */
  getAvailableModels(): typeof VIDEO_MODELS {
    return VIDEO_MODELS;
  }

  /**
   * Validate parameters for Replicate
   */
  async validateParams(params: VideoGenerationParams): Promise<{ valid: boolean; errors?: string[] }> {
    const result = await super.validateParams(params);

    // Stable Video Diffusion specific validations
    if (params.type === 'image-to-video') {
      const maxFrames = 25;
      const requestedFrames = (params.duration || 3) * (params.fps || 8);

      if (requestedFrames > maxFrames) {
        result.errors = result.errors || [];
        result.errors.push(
          `Stable Video Diffusion supports maximum ${maxFrames} frames. ` +
          `Requested: ${requestedFrames} (${params.duration}s at ${params.fps || 8}fps)`
        );
        result.valid = false;
      }
    }

    return result;
  }
}
