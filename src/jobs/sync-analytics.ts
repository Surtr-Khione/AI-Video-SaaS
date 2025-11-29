import cron from 'node-cron';
import { AnalyticsService } from '../services/analytics.service';
import { ViralityService } from '../services/virality.service';
import { TrainingDataService } from '../services/training-data.service';
import prisma from '../lib/prisma';
import logger from '../lib/logger';
import { config } from '../config';

const analyticsService = new AnalyticsService();
const viralityService = new ViralityService();
const trainingDataService = new TrainingDataService();

export async function syncAllAnalytics(): Promise<void> {
  logger.info('Starting scheduled analytics sync');

  try {
    await prisma.analyticsJob.create({
      data: {
        jobType: 'FULL_SYNC',
        status: 'RUNNING',
      },
    });

    await analyticsService.syncAllPlatformAnalytics();

    const activeVideos = await prisma.video.findMany({
      where: {
        status: 'ACTIVE',
        socialMediaPosts: {
          some: {},
        },
      },
      select: { id: true },
    });

    logger.info(`Calculating virality scores for ${activeVideos.length} videos`);

    for (const video of activeVideos) {
      try {
        await viralityService.calculateViralityScore(video.id);
        await trainingDataService.generateTrainingDataPoint(video.id);
      } catch (error) {
        logger.error('Error processing video', { error, videoId: video.id });
      }
    }

    await prisma.analyticsJob.updateMany({
      where: {
        jobType: 'FULL_SYNC',
        status: 'RUNNING',
      },
      data: {
        status: 'COMPLETED',
        completedAt: new Date(),
      },
    });

    logger.info('Scheduled analytics sync completed successfully');
  } catch (error) {
    logger.error('Error in scheduled analytics sync', { error });

    await prisma.analyticsJob.updateMany({
      where: {
        jobType: 'FULL_SYNC',
        status: 'RUNNING',
      },
      data: {
        status: 'FAILED',
        completedAt: new Date(),
        errorMessage: error instanceof Error ? error.message : 'Unknown error',
      },
    });
  }
}

export async function updateSystemMetrics(): Promise<void> {
  logger.info('Updating system metrics');

  try {
    const [totalVideos, totalViews, engagementMetrics, viralVideos] = await Promise.all([
      prisma.video.count(),
      prisma.videoView.count(),
      prisma.engagementMetrics.findMany({
        select: {
          totalViews: true,
          totalLikes: true,
          totalComments: true,
          totalShares: true,
          engagementScore: true,
          platform: true,
        },
      }),
      prisma.viralityScore.count({
        where: { isViral: true },
      }),
    ]);

    const totalEngagements = engagementMetrics.reduce(
      (sum: number, m: any) => sum + m.totalLikes + m.totalComments + m.totalShares,
      0
    );

    const avgEngagementRate = engagementMetrics.length > 0
      ? engagementMetrics.reduce((sum: number, m: any) => sum + m.engagementScore, 0) / engagementMetrics.length
      : 0;

    const platformBreakdown = engagementMetrics.reduce((acc: any, m: any) => {
      if (!acc[m.platform]) {
        acc[m.platform] = {
          views: 0,
          engagements: 0,
          videos: 0,
        };
      }
      acc[m.platform].views += Number(m.totalViews);
      acc[m.platform].engagements += m.totalLikes + m.totalComments + m.totalShares;
      acc[m.platform].videos += 1;
      return acc;
    }, {} as any);

    const topPerforming = await analyticsService.getTopPerformingVideos(10);

    await prisma.systemMetrics.create({
      data: {
        totalVideos,
        totalViews: BigInt(totalViews),
        totalEngagements: BigInt(totalEngagements),
        viralVideosCount: viralVideos,
        avgEngagementRate,
        platformBreakdown,
        topPerformingVideos: topPerforming,
      },
    });

    logger.info('System metrics updated successfully');
  } catch (error) {
    logger.error('Error updating system metrics', { error });
  }
}

export function startScheduledJobs(): void {
  const syncInterval = config.analytics.syncIntervalHours;

  cron.schedule(`0 */${syncInterval} * * *`, async () => {
    logger.info('Running scheduled analytics sync job');
    await syncAllAnalytics();
  });

  cron.schedule('0 0 * * *', async () => {
    logger.info('Running scheduled system metrics update');
    await updateSystemMetrics();
  });

  logger.info(`Scheduled jobs started (sync interval: ${syncInterval} hours)`);
}

if (require.main === module) {
  syncAllAnalytics()
    .then(() => {
      logger.info('Manual analytics sync completed');
      process.exit(0);
    })
    .catch((error) => {
      logger.error('Manual analytics sync failed', { error });
      process.exit(1);
    });
}
