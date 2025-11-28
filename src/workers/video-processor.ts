import { Job } from 'bull';
import videoQueue, { VideoJobData } from '../lib/queue';
import { videoProcessor } from '../lib/video-processor';
import { prisma } from '../lib/prisma';
import path from 'path';

const outputDir = process.env.OUTPUT_DIR || './output';

// Process video jobs
videoQueue.process(
  parseInt(process.env.MAX_CONCURRENT_JOBS || '3'),
  async (job: Job<VideoJobData>) => {
    const { jobId, projectId, data, templateConfig } = job.data;

    console.log(`Processing job ${jobId} for project ${projectId}`);

    try {
      // Update job status to PROCESSING
      await prisma.videoJob.update({
        where: { id: jobId },
        data: {
          status: 'PROCESSING',
          startedAt: new Date(),
        },
      });

      // Update project status if not already processing
      await prisma.videoProject.update({
        where: { id: projectId },
        data: { status: 'PROCESSING' },
      });

      // Generate output path
      const outputPath = path.join(outputDir, `${jobId}.mp4`);

      // Process video with progress tracking
      const metadata = await videoProcessor.processWithProgress(
        data,
        templateConfig || {},
        {
          outputPath,
          resolution: templateConfig?.resolution || '1920x1080',
          format: templateConfig?.format || 'mp4',
          quality: (process.env.VIDEO_QUALITY as any) || 'high',
        },
        (progress) => {
          // Update progress in database
          job.progress(progress);
          prisma.videoJob
            .update({
              where: { id: jobId },
              data: { progress },
            })
            .catch(console.error);
        }
      );

      // Update job as completed
      await prisma.videoJob.update({
        where: { id: jobId },
        data: {
          status: 'COMPLETED',
          progress: 100,
          outputPath,
          outputUrl: `/api/videos/${jobId}`,
          duration: metadata.duration,
          fileSize: metadata.fileSize,
          completedAt: new Date(),
        },
      });

      // Update project completion stats
      const project = await prisma.videoProject.findUnique({
        where: { id: projectId },
        include: {
          jobs: {
            select: { status: true },
          },
        },
      });

      if (project) {
        const completedJobs = project.jobs.filter((j) => j.status === 'COMPLETED').length;
        const failedJobs = project.jobs.filter((j) => j.status === 'FAILED').length;
        const totalJobs = project.jobs.length;

        const allCompleted = completedJobs + failedJobs === totalJobs;

        await prisma.videoProject.update({
          where: { id: projectId },
          data: {
            completedJobs,
            failedJobs,
            status: allCompleted
              ? failedJobs === totalJobs
                ? 'FAILED'
                : 'COMPLETED'
              : 'PROCESSING',
          },
        });
      }

      console.log(`Job ${jobId} completed successfully`);
      return { success: true, metadata };
    } catch (error: any) {
      console.error(`Job ${jobId} failed:`, error);

      // Update job as failed
      const updatedJob = await prisma.videoJob.update({
        where: { id: jobId },
        data: {
          status: 'FAILED',
          error: error.message,
          retries: {
            increment: 1,
          },
        },
      });

      // Update project failure count
      await prisma.videoProject.update({
        where: { id: projectId },
        data: {
          failedJobs: {
            increment: 1,
          },
        },
      });

      throw error;
    }
  }
);

console.log('Video processor worker started');
console.log(`Processing up to ${process.env.MAX_CONCURRENT_JOBS || 3} jobs concurrently`);

// Graceful shutdown
process.on('SIGTERM', async () => {
  console.log('SIGTERM received, closing queue...');
  await videoQueue.close();
  process.exit(0);
});

process.on('SIGINT', async () => {
  console.log('SIGINT received, closing queue...');
  await videoQueue.close();
  process.exit(0);
});
