/**
 * AI Service Orchestrator
 *
 * Main entry point for AI video generation
 * Manages provider selection, job tracking, and video generation
 */
import {
  AIProviderName,
  AICapability,
  VideoGenerationParams,
  VideoResult,
  JobStatus,
} from '@/types/ai';
import { createProvider, getAllProviders } from './providers';
import prisma from '@/lib/db';
import { VideoProject, AIProvider as PrismaAIProvider, VideoStatus } from '@prisma/client';

export class AIService {
  /**
   * Generate video with automatic or specified provider
   */
  async generateVideo(
    params: VideoGenerationParams & { userId: string; title?: string },
    providerName?: AIProviderName
  ): Promise<{ project: VideoProject; result: VideoResult }> {
    try {
      // Select provider
      const selectedProvider = providerName === 'auto' || !providerName
        ? await this.selectBestProvider(params)
        : providerName;

      console.log(`[AI Service] Selected provider: ${selectedProvider}`);

      // Get provider instance
      const provider = createProvider(selectedProvider);

      // Estimate cost
      const estimatedCost = await provider.estimateCost(params);

      // Create database record
      const project = await prisma.videoProject.create({
        data: {
          userId: params.userId,
          title: params.title || this.generateTitle(params),
          description: params.prompt,
          type: this.mapGenerationType(params.type),
          prompt: params.prompt,
          sourceUrl: params.sourceImage || params.sourceVideo,
          duration: params.duration,
          resolution: params.resolution,
          style: params.style,
          options: params.options as any,
          status: 'PENDING',
          provider: selectedProvider.toUpperCase().replace('_', '_') as PrismaAIProvider,
          estimatedCost,
        },
      });

      console.log(`[AI Service] Created project: ${project.id}`);

      // Update status to queued
      await prisma.videoProject.update({
        where: { id: project.id },
        data: { status: 'QUEUED' },
      });

      // Generate video
      const result = await provider.generateVideo(params);

      // Update project with job ID
      await prisma.videoProject.update({
        where: { id: project.id },
        data: {
          providerJobId: result.jobId,
          status: this.mapVideoStatus(result.status),
        },
      });

      // Log the job
      await this.logJob(project.id, selectedProvider, 'generate', 'success', params, result);

      return { project, result };
    } catch (error: any) {
      console.error('[AI Service] Generation failed:', error);
      throw error;
    }
  }

  /**
   * Check video generation status
   */
  async checkStatus(projectId: string): Promise<JobStatus> {
    const project = await prisma.videoProject.findUnique({
      where: { id: projectId },
    });

    if (!project) {
      throw new Error(`Project ${projectId} not found`);
    }

    if (!project.provider || !project.providerJobId) {
      throw new Error('Project does not have a provider or job ID');
    }

    const providerName = project.provider.toLowerCase().replace('_', '_') as AIProviderName;
    const provider = createProvider(providerName);

    const status = await provider.checkStatus(project.providerJobId);

    // Update project status
    await prisma.videoProject.update({
      where: { id: projectId },
      data: {
        status: this.mapVideoStatus(status.status),
        resultUrl: status.videoUrl || project.resultUrl,
        thumbnailUrl: status.thumbnailUrl || project.thumbnailUrl,
        errorMessage: status.error || project.errorMessage,
        completedAt: status.status === 'completed' ? new Date() : project.completedAt,
      },
    });

    return status;
  }

  /**
   * Cancel video generation
   */
  async cancelGeneration(projectId: string): Promise<void> {
    const project = await prisma.videoProject.findUnique({
      where: { id: projectId },
    });

    if (!project) {
      throw new Error(`Project ${projectId} not found`);
    }

    if (!project.provider || !project.providerJobId) {
      throw new Error('Project does not have a provider or job ID');
    }

    const providerName = project.provider.toLowerCase().replace('_', '_') as AIProviderName;
    const provider = createProvider(providerName);

    await provider.cancelJob(project.providerJobId);

    await prisma.videoProject.update({
      where: { id: projectId },
      data: { status: 'CANCELLED' },
    });
  }

  /**
   * Select the best provider for the job
   */
  private async selectBestProvider(params: VideoGenerationParams): Promise<AIProviderName> {
    const providers = getAllProviders();

    if (providers.length === 0) {
      throw new Error('No AI providers are enabled. Please configure at least one provider.');
    }

    // Filter providers that support the required capability
    const capableProviders = providers.filter((p) =>
      p.supports(params.type as AICapability)
    );

    if (capableProviders.length === 0) {
      throw new Error(`No provider supports ${params.type}`);
    }

    // Priority order (can be made more sophisticated)
    const priorityOrder: AIProviderName[] = [
      'google_veo',    // Best quality
      'openai_sora',   // High quality
      'runway_ml',     // Fast and reliable
      'replicate',     // Flexible and cost-effective
    ];

    for (const providerName of priorityOrder) {
      const provider = capableProviders.find((p) => p.name === providerName);
      if (provider) {
        return provider.name;
      }
    }

    // Fallback to first capable provider
    return capableProviders[0].name;
  }

  /**
   * Generate a title from params
   */
  private generateTitle(params: VideoGenerationParams): string {
    if (params.prompt) {
      return params.prompt.substring(0, 50) + (params.prompt.length > 50 ? '...' : '');
    }
    return `${params.type} - ${new Date().toISOString()}`;
  }

  /**
   * Map generation type to Prisma enum
   */
  private mapGenerationType(type: string): any {
    const typeMap: Record<string, string> = {
      'text-to-video': 'TEXT_TO_VIDEO',
      'image-to-video': 'IMAGE_TO_VIDEO',
      'video-editing': 'VIDEO_EDITING',
      'video-enhancement': 'VIDEO_ENHANCEMENT',
    };
    return typeMap[type] || 'TEXT_TO_VIDEO';
  }

  /**
   * Map video status to Prisma enum
   */
  private mapVideoStatus(status: string): VideoStatus {
    const statusMap: Record<string, VideoStatus> = {
      'pending': 'PENDING',
      'queued': 'QUEUED',
      'processing': 'PROCESSING',
      'completed': 'COMPLETED',
      'failed': 'FAILED',
      'cancelled': 'CANCELLED',
    };
    return statusMap[status] || 'PENDING';
  }

  /**
   * Log job activity
   */
  private async logJob(
    projectId: string,
    provider: string,
    action: string,
    status: string,
    request?: any,
    response?: any
  ): Promise<void> {
    try {
      await prisma.jobLog.create({
        data: {
          projectId,
          provider: provider.toUpperCase().replace('_', '_') as PrismaAIProvider,
          action,
          status,
          request: request as any,
          response: response as any,
        },
      });
    } catch (error) {
      console.error('[AI Service] Failed to log job:', error);
    }
  }

  /**
   * Get list of enabled providers
   */
  getEnabledProviders(): string[] {
    return getAllProviders().map((p) => p.name);
  }
}

// Export singleton instance
export const aiService = new AIService();
