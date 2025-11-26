import { Queue, Worker } from 'bullmq';
import { Redis } from 'ioredis';
import { logger } from '../utils/logger';
import { processVideo } from '../services/videoProcessor';

const connection = new Redis(process.env.REDIS_URL || 'redis://localhost:6379', {
  maxRetriesPerRequest: null,
});

export const videoQueue = new Queue('video-processing', {
  connection,
  defaultJobOptions: {
    attempts: 3,
    backoff: {
      type: 'exponential',
      delay: 2000,
    },
  },
});

// Worker to process videos
const worker = new Worker(
  'video-processing',
  async (job) => {
    logger.info(`Processing video job: ${job.id}`, job.data);

    const { videoId, filePath } = job.data;

    try {
      await processVideo(videoId, filePath, (progress) => {
        job.updateProgress(progress);
      });

      logger.info(`Video processing completed: ${videoId}`);
      return { success: true, videoId };
    } catch (error) {
      logger.error(`Video processing failed: ${videoId}`, error);
      throw error;
    }
  },
  { connection }
);

worker.on('completed', (job) => {
  logger.info(`Job ${job.id} completed successfully`);
});

worker.on('failed', (job, err) => {
  logger.error(`Job ${job?.id} failed:`, err);
});

export { worker };
