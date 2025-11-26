/**
 * Base AI Provider class with common functionality
 */
import {
  AIProvider,
  AIProviderName,
  AICapability,
  VideoGenerationParams,
  VideoResult,
  JobStatus,
} from '@/types/ai';
import { retry } from '@/lib/utils';
import axios, { AxiosInstance } from 'axios';

export abstract class BaseAIProvider implements AIProvider {
  abstract readonly name: AIProviderName;
  abstract readonly capabilities: AICapability[];
  abstract readonly maxDuration: number;
  abstract readonly costPerSecond: number;

  protected client: AxiosInstance;
  protected apiKey: string;
  protected timeout: number;
  protected maxRetries: number;

  constructor(config: {
    apiKey: string;
    baseUrl: string;
    timeout?: number;
    maxRetries?: number;
  }) {
    this.apiKey = config.apiKey;
    this.timeout = config.timeout ?? 600000;
    this.maxRetries = config.maxRetries ?? 3;

    this.client = axios.create({
      baseURL: config.baseUrl,
      timeout: this.timeout,
      headers: {
        'Content-Type': 'application/json',
      },
    });
  }

  /**
   * Generate video - must be implemented by provider
   */
  abstract generateVideo(params: VideoGenerationParams): Promise<VideoResult>;

  /**
   * Check job status - must be implemented by provider
   */
  abstract checkStatus(jobId: string): Promise<JobStatus>;

  /**
   * Cancel job - must be implemented by provider
   */
  abstract cancelJob(jobId: string): Promise<void>;

  /**
   * Check if provider supports a capability
   */
  supports(capability: AICapability): boolean {
    return this.capabilities.includes(capability);
  }

  /**
   * Estimate cost for video generation
   */
  async estimateCost(params: VideoGenerationParams): Promise<number> {
    const duration = params.duration ?? 5; // Default 5 seconds
    return duration * this.costPerSecond;
  }

  /**
   * Validate parameters
   */
  async validateParams(params: VideoGenerationParams): Promise<{ valid: boolean; errors?: string[] }> {
    const errors: string[] = [];

    // Check capability support
    if (!this.supports(params.type as AICapability)) {
      errors.push(`Provider ${this.name} does not support ${params.type}`);
    }

    // Check duration
    if (params.duration && params.duration > this.maxDuration) {
      errors.push(`Duration ${params.duration}s exceeds maximum ${this.maxDuration}s`);
    }

    // Validate required fields based on type
    if (params.type === 'text-to-video' && !params.prompt) {
      errors.push('Prompt is required for text-to-video generation');
    }

    if (params.type === 'image-to-video' && !params.sourceImage) {
      errors.push('Source image is required for image-to-video generation');
    }

    return {
      valid: errors.length === 0,
      errors: errors.length > 0 ? errors : undefined,
    };
  }

  /**
   * Make API request with retry logic
   */
  protected async makeRequest<T>(
    method: 'get' | 'post' | 'put' | 'delete',
    url: string,
    data?: any,
    headers?: Record<string, string>
  ): Promise<T> {
    return retry(
      async () => {
        const response = await this.client.request<T>({
          method,
          url,
          data,
          headers,
        });
        return response.data;
      },
      {
        maxRetries: this.maxRetries,
        onRetry: (error, attempt) => {
          console.warn(`[${this.name}] Request failed, retry ${attempt}/${this.maxRetries}:`, error.message);
        },
      }
    );
  }

  /**
   * Poll for job completion
   */
  protected async pollUntilComplete(
    jobId: string,
    options: {
      interval?: number;
      timeout?: number;
      onProgress?: (status: JobStatus) => void;
    } = {}
  ): Promise<JobStatus> {
    const { interval = 5000, timeout = 600000, onProgress } = options;
    const startTime = Date.now();

    while (true) {
      const status = await this.checkStatus(jobId);

      if (onProgress) {
        onProgress(status);
      }

      if (status.status === 'completed' || status.status === 'failed' || status.status === 'cancelled') {
        return status;
      }

      if (Date.now() - startTime > timeout) {
        throw new Error(`Job ${jobId} timed out after ${timeout}ms`);
      }

      await new Promise((resolve) => setTimeout(resolve, interval));
    }
  }

  /**
   * Log provider activity
   */
  protected log(level: 'info' | 'warn' | 'error', message: string, data?: any) {
    const logMessage = `[${this.name.toUpperCase()}] ${message}`;

    switch (level) {
      case 'info':
        console.log(logMessage, data ?? '');
        break;
      case 'warn':
        console.warn(logMessage, data ?? '');
        break;
      case 'error':
        console.error(logMessage, data ?? '');
        break;
    }
  }
}
