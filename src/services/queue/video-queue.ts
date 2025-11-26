/**
 * Video Generation Queue Service
 *
 * Handles async video generation jobs using BullMQ
 */
import { Queue, Worker, Job } from 'bullmq';
import { Redis } from 'ioredis';
import { aiService } from '../ai';
import prisma from '@/lib/db';
import { VideoGenerationParams } from '@/types/ai';

interface VideoJobData {
  projectId: string;
  userId: string;
  params: VideoGenerationParams;
  provider?: string;
}

// Redis connection
const connection = new Redis({
  host: process.env.REDIS_HOST || 'localhost',
  port: parseInt(process.env.REDIS_PORT || '6379'),
  password: process.env.REDIS_PASSWORD || undefined,
  maxRetriesPerRequest: null,
});

// Create queue
export const videoQueue = new Queue<VideoJobData>('video-generation', {
  connection,
  defaultJobOptions: {
    attempts: 3,
    backoff: {
      type: 'exponential',
      delay: 5000,
    },
    removeOnComplete: {
      count: 100, // Keep last 100 completed jobs
      age: 86400, // 24 hours
    },
    removeOnFail: {
      count: 200, // Keep last 200 failed jobs
      age: 604800, // 7 days
    },
  },
});

// Create worker
export const videoWorker = new Worker<VideoJobData>(
  'video-generation',
  async (job: Job<VideoJobData>) => {
    console.log(`[Video Queue] Processing job ${job.id} for project ${job.data.projectId}`);

    try {
      const { projectId, userId, params, provider } = job.data;

      // Update progress
      await job.updateProgress(10);

      // Generate video
      await job.updateProgress(30);
      const { result } = await aiService.generateVideo(
        { ...params, userId },
        provider as any
      );

      await job.updateProgress(50);

      // Poll for completion
      let completed = false;
      let attempts = 0;
      const maxAttempts = 120; // 10 minutes with 5s intervals

      while (!completed && attempts < maxAttempts) {
        await new Promise((resolve) => setTimeout(resolve, 5000));
        attempts++;

        const status = await aiService.checkStatus(projectId);
        const progress = 50 + (status.progress || 0) / 2; // Scale to 50-100
        await job.updateProgress(progress);

        if (status.status === 'completed') {
          completed = true;

          // Update project with final result
          await prisma.videoProject.update({
            where: { id: projectId },
            data: {
              status: 'COMPLETED',
              resultUrl: status.videoUrl,
              thumbnailUrl: status.thumbnailUrl,
              completedAt: new Date(),
            },
          });

          console.log(`[Video Queue] Job ${job.id} completed successfully`);
          return { success: true, videoUrl: status.videoUrl };
        } else if (status.status === 'failed') {
          throw new Error(status.error || 'Video generation failed');
        }
      }

      if (!completed) {
        throw new Error('Video generation timed out');
      }

      return { success: true };
    } catch (error: any) {
      console.error(`[Video Queue] Job ${job.id} failed:`, error);

      // Update project status
      await prisma.videoProject.update({
        where: { id: job.data.projectId },
        data: {
          status: 'FAILED',
          errorMessage: error.message,
        },
      });

      throw error;
    }
  },
  {
    connection,
    concurrency: parseInt(process.env.QUEUE_CONCURRENCY || '3'),
  }
);

// Worker event handlers
videoWorker.on('completed', (job) => {
  console.log(`[Video Queue] Job ${job.id} completed`);
});

videoWorker.on('failed', (job, err) => {
  console.error(`[Video Queue] Job ${job?.id} failed:`, err);
});

videoWorker.on('error', (err) => {
  console.error('[Video Queue] Worker error:', err);
});

/**
 * Add a video generation job to the queue
 */
export async function enqueueVideoGeneration(
  data: VideoJobData
): Promise<Job<VideoJobData>> {
  const job = await videoQueue.add('generate-video', data, {
    jobId: data.projectId, // Use project ID as job ID for idempotency
  });

  console.log(`[Video Queue] Enqueued job ${job.id} for project ${data.projectId}`);

  return job;
}

/**
 * Get job status
 */
export async function getJobStatus(jobId: string) {
  const job = await videoQueue.getJob(jobId);

  if (!job) {
    return null;
  }

  const state = await job.getState();
  const progress = job.progress;

  return {
    id: job.id,
    state,
    progress,
    data: job.data,
    finishedOn: job.finishedOn,
    processedOn: job.processedOn,
    failedReason: job.failedReason,
  };
}

/**
 * Clean up old jobs
 */
export async function cleanupQueue() {
  await videoQueue.clean(86400000, 100, 'completed'); // Clean completed jobs older than 24h
  await videoQueue.clean(604800000, 200, 'failed'); // Clean failed jobs older than 7 days
}
