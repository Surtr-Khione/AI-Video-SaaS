import Queue from 'bull';
import Redis from 'ioredis';

const redisConfig = {
  host: process.env.REDIS_HOST || 'localhost',
  port: parseInt(process.env.REDIS_PORT || '6379'),
  password: process.env.REDIS_PASSWORD || undefined,
  maxRetriesPerRequest: null,
  enableReadyCheck: false,
};

// Create Redis clients for Bull
const createClient = (type: string) => {
  const client = new Redis(redisConfig);
  client.on('error', (error) => {
    console.error(`Redis ${type} client error:`, error);
  });
  return client;
};

export interface VideoJobData {
  jobId: string;
  projectId: string;
  data: Record<string, any>;
  templateConfig?: Record<string, any>;
}

export const videoQueue = new Queue<VideoJobData>('video-processing', {
  createClient: (type) => {
    switch (type) {
      case 'client':
        return createClient('client');
      case 'subscriber':
        return createClient('subscriber');
      case 'bclient':
        return createClient('bclient');
      default:
        return createClient('default');
    }
  },
  defaultJobOptions: {
    attempts: 3,
    backoff: {
      type: 'exponential',
      delay: 5000,
    },
    removeOnComplete: 100,
    removeOnFail: 200,
  },
});

// Queue event listeners
videoQueue.on('error', (error) => {
  console.error('Queue error:', error);
});

videoQueue.on('failed', (job, err) => {
  console.error(`Job ${job.id} failed:`, err);
});

videoQueue.on('completed', (job) => {
  console.log(`Job ${job.id} completed`);
});

export default videoQueue;
