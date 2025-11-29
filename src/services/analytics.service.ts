import { Platform, SocialMediaAnalytics, EngagementMetrics } from '@prisma/client';
import prisma from '../lib/prisma';
import logger from '../lib/logger';
import { YouTubeService } from './platforms/youtube.service';
import { FacebookService } from './platforms/facebook.service';
import { LinkedInService } from './platforms/linkedin.service';
import { XService } from './platforms/x.service';
import { config } from '../config';

export class AnalyticsService {
  private youtubeService: YouTubeService;
  private facebookService: FacebookService;
  private linkedInService: LinkedInService;
  private xService: XService;

  constructor() {
    this.youtubeService = new YouTubeService();
    this.facebookService = new FacebookService();
    this.linkedInService = new LinkedInService();
    this.xService = new XService();
  }

  async syncAllPlatformAnalytics(videoId?: string): Promise<void> {
    try {
      const posts = await prisma.socialMediaPost.findMany({
        where: videoId ? { videoId } : {},
        include: {
          video: true,
          socialMediaAccount: true,
        },
      });

      logger.info(`Syncing analytics for ${posts.length} posts`);

      for (const post of posts) {
        await this.syncPostAnalytics(post.id);
      }

      logger.info('Analytics sync completed');
    } catch (error) {
      logger.error('Error syncing analytics', { error });
      throw error;
    }
  }

  async syncPostAnalytics(postId: string): Promise<SocialMediaAnalytics | null> {
    try {
      const post = await prisma.socialMediaPost.findUnique({
        where: { id: postId },
        include: {
          socialMediaAccount: true,
        },
      });

      if (!post) {
        logger.warn('Post not found', { postId });
        return null;
      }

      let analytics: any = null;

      switch (post.platform) {
        case Platform.YOUTUBE:
          analytics = await this.youtubeService.getVideoAnalytics(post.platformPostId);
          break;
        case Platform.FACEBOOK:
          analytics = await this.facebookService.getVideoAnalytics(post.platformPostId);
          break;
        case Platform.INSTAGRAM:
          analytics = await this.facebookService.getInstagramVideoAnalytics(post.platformPostId);
          break;
        case Platform.LINKEDIN:
          analytics = await this.linkedInService.getVideoAnalytics(post.platformPostId);
          break;
        case Platform.X_TWITTER:
          analytics = await this.xService.getVideoAnalytics(post.platformPostId);
          break;
      }

      if (!analytics) {
        logger.warn('No analytics data retrieved', { postId, platform: post.platform });
        return null;
      }

      const savedAnalytics = await prisma.socialMediaAnalytics.create({
        data: {
          socialMediaPostId: post.id,
          platform: post.platform,
          views: analytics.views || BigInt(0),
          likes: analytics.likes || 0,
          comments: analytics.comments || 0,
          shares: analytics.shares || analytics.retweets || 0,
          saves: analytics.saves || 0,
          clickThroughRate: analytics.clickThroughRate,
          averageWatchTime: analytics.averageWatchTime,
          audienceRetention: analytics.audienceRetention,
          impressions: analytics.impressions,
          reach: analytics.reach,
          engagementRate: analytics.engagementRate,
          demographicData: analytics.demographicData || {},
          topLocations: analytics.topLocations || {},
          trafficSources: analytics.trafficSources || {},
        },
      });

      await prisma.socialMediaPost.update({
        where: { id: post.id },
        data: { lastSyncedAt: new Date() },
      });

      await this.updateEngagementMetrics(post.videoId);

      logger.info('Post analytics synced', { postId, platform: post.platform });
      return savedAnalytics;
    } catch (error) {
      logger.error('Error syncing post analytics', { error, postId });
      throw error;
    }
  }

  async updateEngagementMetrics(videoId: string): Promise<void> {
    try {
      const posts = await prisma.socialMediaPost.findMany({
        where: { videoId },
        include: {
          analytics: {
            orderBy: { snapshotAt: 'desc' },
            take: 1,
          },
        },
      });

      const platformMetrics: Map<Platform, any> = new Map();

      for (const post of posts) {
        const latestAnalytics = post.analytics[0];
        if (!latestAnalytics) continue;

        if (!platformMetrics.has(post.platform)) {
          platformMetrics.set(post.platform, {
            totalViews: BigInt(0),
            totalLikes: 0,
            totalComments: 0,
            totalShares: 0,
            totalSaves: 0,
            totalWatchTime: 0,
            count: 0,
            clickThroughRates: [],
            completionRates: [],
          });
        }

        const metrics = platformMetrics.get(post.platform)!;
        metrics.totalViews += latestAnalytics.views;
        metrics.totalLikes += latestAnalytics.likes;
        metrics.totalComments += latestAnalytics.comments;
        metrics.totalShares += latestAnalytics.shares;
        metrics.totalSaves += latestAnalytics.saves;
        metrics.totalWatchTime += latestAnalytics.averageWatchTime || 0;
        metrics.count += 1;

        if (latestAnalytics.clickThroughRate) {
          metrics.clickThroughRates.push(latestAnalytics.clickThroughRate);
        }
        if (latestAnalytics.audienceRetention) {
          metrics.completionRates.push(latestAnalytics.audienceRetention);
        }
      }

      for (const [platform, metrics] of platformMetrics.entries()) {
        const totalEngagements =
          metrics.totalLikes + metrics.totalComments + metrics.totalShares + metrics.totalSaves;

        const engagementScore = this.calculateEngagementScore({
          views: Number(metrics.totalViews),
          likes: metrics.totalLikes,
          comments: metrics.totalComments,
          shares: metrics.totalShares,
          saves: metrics.totalSaves,
        });

        const averageWatchTime = metrics.count > 0 ? metrics.totalWatchTime / metrics.count : 0;
        const avgClickThroughRate = metrics.clickThroughRates.length > 0
          ? metrics.clickThroughRates.reduce((a: number, b: number) => a + b, 0) / metrics.clickThroughRates.length
          : null;
        const avgCompletionRate = metrics.completionRates.length > 0
          ? metrics.completionRates.reduce((a: number, b: number) => a + b, 0) / metrics.completionRates.length
          : null;

        await prisma.engagementMetrics.upsert({
          where: {
            videoId_platform: {
              videoId,
              platform,
            },
          },
          create: {
            videoId,
            platform,
            totalViews: metrics.totalViews,
            totalLikes: metrics.totalLikes,
            totalComments: metrics.totalComments,
            totalShares: metrics.totalShares,
            totalSaves: metrics.totalSaves,
            engagementScore,
            averageWatchTime,
            completionRate: avgCompletionRate,
            clickThroughRate: avgClickThroughRate,
          },
          update: {
            totalViews: metrics.totalViews,
            totalLikes: metrics.totalLikes,
            totalComments: metrics.totalComments,
            totalShares: metrics.totalShares,
            totalSaves: metrics.totalSaves,
            engagementScore,
            averageWatchTime,
            completionRate: avgCompletionRate,
            clickThroughRate: avgClickThroughRate,
            calculatedAt: new Date(),
          },
        });
      }

      const allMetrics = await prisma.engagementMetrics.findMany({
        where: { videoId },
      });

      if (allMetrics.length > 0) {
        const scores = allMetrics.map(m => m.engagementScore);
        scores.sort((a, b) => a - b);

        for (const metric of allMetrics) {
          const percentile = Math.round(
            (scores.filter(s => s <= metric.engagementScore).length / scores.length) * 100
          );

          await prisma.engagementMetrics.update({
            where: { id: metric.id },
            data: { engagementPercentile: percentile },
          });
        }
      }

      logger.info('Engagement metrics updated', { videoId });
    } catch (error) {
      logger.error('Error updating engagement metrics', { error, videoId });
      throw error;
    }
  }

  calculateEngagementScore(data: {
    views: number;
    likes: number;
    comments: number;
    shares: number;
    saves: number;
  }): number {
    const weights = {
      like: 1,
      comment: 3,
      share: 5,
      save: 4,
    };

    const totalEngagement =
      data.likes * weights.like +
      data.comments * weights.comment +
      data.shares * weights.share +
      data.saves * weights.save;

    const engagementRate = data.views > 0 ? (totalEngagement / data.views) * 100 : 0;

    return Math.round(engagementRate * 1000) / 1000;
  }

  async getVideoAnalyticsSummary(videoId: string): Promise<any> {
    const [video, engagementMetrics, views, posts] = await Promise.all([
      prisma.video.findUnique({
        where: { id: videoId },
        include: { viralityScore: true },
      }),
      prisma.engagementMetrics.findMany({
        where: { videoId },
      }),
      prisma.videoView.count({ where: { videoId } }),
      prisma.socialMediaPost.findMany({
        where: { videoId },
        include: {
          analytics: {
            orderBy: { snapshotAt: 'desc' },
            take: 1,
          },
        },
      }),
    ]);

    const platformBreakdown = engagementMetrics.map(m => ({
      platform: m.platform,
      views: Number(m.totalViews),
      likes: m.totalLikes,
      comments: m.totalComments,
      shares: m.totalShares,
      engagementScore: m.engagementScore,
      engagementPercentile: m.engagementPercentile,
    }));

    const totalSocialViews = engagementMetrics.reduce(
      (sum, m) => sum + Number(m.totalViews),
      0
    );

    return {
      video,
      hostedViews: views,
      totalSocialViews,
      totalViews: views + totalSocialViews,
      platformBreakdown,
      viralityScore: video?.viralityScore,
      posts: posts.length,
    };
  }

  async getTopPerformingVideos(limit = 10): Promise<any[]> {
    const metrics = await prisma.engagementMetrics.findMany({
      orderBy: { engagementScore: 'desc' },
      take: limit,
      include: {
        video: {
          include: {
            viralityScore: true,
          },
        },
      },
    });

    return metrics.map(m => ({
      videoId: m.videoId,
      title: m.video.title,
      platform: m.platform,
      engagementScore: m.engagementScore,
      totalViews: Number(m.totalViews),
      isViral: m.video.viralityScore?.isViral || false,
      viralityLevel: m.video.viralityScore?.viralityLevel,
    }));
  }
}
