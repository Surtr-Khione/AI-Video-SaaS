import prisma from '../lib/prisma';
import logger from '../lib/logger';
import * as fs from 'fs/promises';
import * as path from 'path';
import { config } from '../config';

export interface TrainingDatasetExport {
  videoId: string;
  title: string;
  features: {
    duration: number;
    fileSize: number;
    platforms: string[];
    platformCount: number;
    aiMetadata: any;
  };
  performance: {
    totalViews: number;
    totalEngagements: number;
    avgEngagementRate: number;
    avgCompletionRate: number;
    avgWatchTime: number;
    topPlatform: string;
    topPlatformEngagement: number;
  };
  virality: {
    isViral: boolean;
    viralityLevel: string;
    viralityScore: number;
    peakViews24h: number;
    growthRate: number;
    shareVelocity: number;
    commentVelocity: number;
  };
  timing: {
    publishHour: number;
    publishDayOfWeek: number;
    timeToViral: number | null;
  };
  audience: {
    topCountries: string[];
    demographics: any;
    trafficSources: any;
  };
  outcome: {
    success: boolean;
    highEngagement: boolean;
    viral: boolean;
    totalReach: number;
  };
}

export class TrainingDataService {
  async generateTrainingDataPoint(videoId: string): Promise<void> {
    try {
      const video = await prisma.video.findUnique({
        where: { id: videoId },
        include: {
          engagementMetrics: true,
          viralityScore: true,
          socialMediaPosts: {
            include: {
              analytics: {
                orderBy: { snapshotAt: 'desc' },
                take: 1,
              },
            },
          },
        },
      });

      if (!video) {
        logger.warn('Video not found for training data generation', { videoId });
        return;
      }

      if (video.engagementMetrics.length === 0) {
        logger.warn('No engagement metrics for training data', { videoId });
        return;
      }

      const features = {
        duration: video.duration,
        fileSize: Number(video.fileSize),
        platforms: video.socialMediaPosts.map(p => p.platform),
        platformCount: video.socialMediaPosts.length,
        aiMetadata: video.aiGeneratedMetadata,
        publishTime: {
          hour: video.createdAt.getHours(),
          dayOfWeek: video.createdAt.getDay(),
          month: video.createdAt.getMonth(),
        },
      };

      const totalViews = video.engagementMetrics.reduce(
        (sum, m) => sum + Number(m.totalViews),
        0
      );

      const totalEngagements = video.engagementMetrics.reduce(
        (sum, m) => sum + m.totalLikes + m.totalComments + m.totalShares + m.totalSaves,
        0
      );

      const avgEngagementScore = video.engagementMetrics.reduce(
        (sum, m) => sum + m.engagementScore,
        0
      ) / video.engagementMetrics.length;

      const metrics = {
        totalViews,
        totalEngagements,
        avgEngagementScore,
        platformMetrics: video.engagementMetrics.map(m => ({
          platform: m.platform,
          views: Number(m.totalViews),
          engagementScore: m.engagementScore,
          completionRate: m.completionRate,
          watchTime: m.averageWatchTime,
        })),
      };

      const viralityOutcome = video.viralityScore?.isViral || false;
      const highEngagementPercentile = config.analytics.highEngagementPercentile;
      const engagementOutcome = video.engagementMetrics.some(
        m => (m.engagementPercentile || 0) >= highEngagementPercentile
      );

      const contentFeatures = this.extractContentFeatures(video);
      const audienceFeatures = this.extractAudienceFeatures(video);
      const timingFeatures = this.extractTimingFeatures(video);

      await prisma.trainingDataPoint.create({
        data: {
          videoId,
          features,
          metrics,
          viralityOutcome,
          engagementOutcome: avgEngagementScore,
          platformPerformance: video.engagementMetrics.map(m => ({
            platform: m.platform,
            score: m.engagementScore,
            percentile: m.engagementPercentile,
          })),
          contentFeatures,
          audienceFeatures,
          timingFeatures,
        },
      });

      logger.info('Training data point generated', { videoId, viralityOutcome, engagementOutcome });
    } catch (error) {
      logger.error('Error generating training data point', { error, videoId });
      throw error;
    }
  }

  private extractContentFeatures(video: any): any {
    return {
      title: video.title,
      titleLength: video.title.length,
      hasDescription: !!video.description,
      descriptionLength: video.description?.length || 0,
      duration: video.duration,
      fileSize: Number(video.fileSize),
      mimeType: video.mimeType,
      aiMetadata: video.aiGeneratedMetadata,
    };
  }

  private extractAudienceFeatures(video: any): any {
    const allAnalytics = video.socialMediaPosts?.flatMap((p: any) => p.analytics) || [];

    const topLocations: Record<string, number> = {};
    const demographics: any[] = [];

    allAnalytics.forEach((a: any) => {
      if (a.topLocations) {
        Object.entries(a.topLocations).forEach(([location, count]) => {
          topLocations[location] = (topLocations[location] || 0) + (count as number);
        });
      }
      if (a.demographicData) {
        demographics.push(a.demographicData);
      }
    });

    return {
      topLocations,
      demographics,
      platformDistribution: video.socialMediaPosts?.map((p: any) => p.platform) || [],
    };
  }

  private extractTimingFeatures(video: any): any {
    const publishDate = video.createdAt;

    return {
      hour: publishDate.getHours(),
      dayOfWeek: publishDate.getDay(),
      dayOfMonth: publishDate.getDate(),
      month: publishDate.getMonth(),
      year: publishDate.getFullYear(),
      isWeekend: publishDate.getDay() === 0 || publishDate.getDay() === 6,
      timeToFirstViral: video.viralityScore?.viralStartDate
        ? (video.viralityScore.viralStartDate.getTime() - publishDate.getTime()) / (1000 * 60 * 60)
        : null,
    };
  }

  async exportTrainingDataset(minVideos?: number): Promise<string> {
    try {
      const minimumVideos = minVideos || config.aiTraining.minVideosForTraining;

      const trainingData = await prisma.trainingDataPoint.findMany({
        include: {
          video: {
            include: {
              engagementMetrics: true,
              viralityScore: true,
              socialMediaPosts: {
                include: {
                  analytics: {
                    orderBy: { snapshotAt: 'desc' },
                    take: 1,
                  },
                },
              },
            },
          },
        },
        orderBy: {
          createdAt: 'desc',
        },
      });

      if (trainingData.length < minimumVideos) {
        logger.warn(
          `Insufficient training data: ${trainingData.length} videos, minimum required: ${minimumVideos}`
        );
      }

      const dataset: TrainingDatasetExport[] = trainingData.map(dp => {
        const video = dp.video;
        const viralityScore = video.viralityScore;
        const engagementMetrics = video.engagementMetrics;

        const totalViews = engagementMetrics.reduce(
          (sum, m) => sum + Number(m.totalViews),
          0
        );

        const totalEngagements = engagementMetrics.reduce(
          (sum, m) => sum + m.totalLikes + m.totalComments + m.totalShares + m.totalSaves,
          0
        );

        const avgEngagementRate = engagementMetrics.length > 0
          ? engagementMetrics.reduce((sum, m) => sum + m.engagementScore, 0) / engagementMetrics.length
          : 0;

        const avgCompletionRate = engagementMetrics.length > 0
          ? engagementMetrics.reduce((sum, m) => sum + (m.completionRate || 0), 0) / engagementMetrics.length
          : 0;

        const avgWatchTime = engagementMetrics.length > 0
          ? engagementMetrics.reduce((sum, m) => sum + (m.averageWatchTime || 0), 0) / engagementMetrics.length
          : 0;

        const topPlatformMetric = engagementMetrics.sort((a, b) => b.engagementScore - a.engagementScore)[0];

        const allAnalytics = video.socialMediaPosts.flatMap(p => p.analytics);
        const topLocations = new Set<string>();
        allAnalytics.forEach(a => {
          if (a.topLocations && typeof a.topLocations === 'object') {
            Object.keys(a.topLocations).forEach(loc => topLocations.add(loc));
          }
        });

        return {
          videoId: video.id,
          title: video.title,
          features: {
            duration: video.duration,
            fileSize: Number(video.fileSize),
            platforms: video.socialMediaPosts.map(p => p.platform),
            platformCount: video.socialMediaPosts.length,
            aiMetadata: video.aiGeneratedMetadata,
          },
          performance: {
            totalViews,
            totalEngagements,
            avgEngagementRate,
            avgCompletionRate,
            avgWatchTime,
            topPlatform: topPlatformMetric?.platform || 'NONE',
            topPlatformEngagement: topPlatformMetric?.engagementScore || 0,
          },
          virality: {
            isViral: viralityScore?.isViral || false,
            viralityLevel: viralityScore?.viralityLevel || 'LOW',
            viralityScore: viralityScore?.viralityScore || 0,
            peakViews24h: viralityScore ? Number(viralityScore.peakViews24h) : 0,
            growthRate: viralityScore?.growthRate || 0,
            shareVelocity: viralityScore?.shareVelocity || 0,
            commentVelocity: viralityScore?.commentVelocity || 0,
          },
          timing: {
            publishHour: video.createdAt.getHours(),
            publishDayOfWeek: video.createdAt.getDay(),
            timeToViral: viralityScore?.viralStartDate
              ? (viralityScore.viralStartDate.getTime() - video.createdAt.getTime()) / (1000 * 60 * 60)
              : null,
          },
          audience: {
            topCountries: Array.from(topLocations),
            demographics: allAnalytics.map(a => a.demographicData).filter(Boolean),
            trafficSources: allAnalytics.map(a => a.trafficSources).filter(Boolean),
          },
          outcome: {
            success: dp.viralityOutcome || dp.engagementOutcome >= avgEngagementRate,
            highEngagement: dp.engagementOutcome >= avgEngagementRate,
            viral: dp.viralityOutcome,
            totalReach: totalViews,
          },
        };
      });

      const exportPath = path.join(
        config.aiTraining.trainingDataExportPath,
        `training-data-${Date.now()}.json`
      );

      await fs.mkdir(config.aiTraining.trainingDataExportPath, { recursive: true });
      await fs.writeFile(exportPath, JSON.stringify(dataset, null, 2), 'utf-8');

      logger.info('Training dataset exported', {
        path: exportPath,
        videoCount: dataset.length,
        viralCount: dataset.filter(d => d.outcome.viral).length,
        highEngagementCount: dataset.filter(d => d.outcome.highEngagement).length,
      });

      return exportPath;
    } catch (error) {
      logger.error('Error exporting training dataset', { error });
      throw error;
    }
  }

  async getTrainingInsights(): Promise<any> {
    const trainingData = await prisma.trainingDataPoint.findMany({
      include: {
        video: {
          include: {
            viralityScore: true,
          },
        },
      },
    });

    const viralVideos = trainingData.filter(dp => dp.viralityOutcome);
    const highEngagementVideos = trainingData.filter(
      dp => dp.engagementOutcome >= config.analytics.highEngagementPercentile
    );

    const platformPerformance: Record<string, any> = {};
    trainingData.forEach(dp => {
      const platforms = (dp.platformPerformance as any[]) || [];
      platforms.forEach((p: any) => {
        if (!platformPerformance[p.platform]) {
          platformPerformance[p.platform] = {
            totalVideos: 0,
            avgScore: 0,
            viralCount: 0,
          };
        }
        platformPerformance[p.platform].totalVideos++;
        platformPerformance[p.platform].avgScore += p.score;
        if (dp.viralityOutcome) {
          platformPerformance[p.platform].viralCount++;
        }
      });
    });

    Object.keys(platformPerformance).forEach(platform => {
      const perf = platformPerformance[platform];
      perf.avgScore = perf.avgScore / perf.totalVideos;
    });

    const timingAnalysis = this.analyzeTimingPatterns(viralVideos);
    const contentAnalysis = this.analyzeContentPatterns(viralVideos);

    return {
      totalVideos: trainingData.length,
      viralVideos: viralVideos.length,
      highEngagementVideos: highEngagementVideos.length,
      viralityRate: (viralVideos.length / trainingData.length) * 100,
      platformPerformance,
      timingAnalysis,
      contentAnalysis,
      readyForTraining: trainingData.length >= config.aiTraining.minVideosForTraining,
    };
  }

  private analyzeTimingPatterns(viralVideos: any[]): any {
    const hourDistribution: Record<number, number> = {};
    const dayDistribution: Record<number, number> = {};

    viralVideos.forEach(dp => {
      const timing = dp.timingFeatures as any;
      if (timing?.hour !== undefined) {
        hourDistribution[timing.hour] = (hourDistribution[timing.hour] || 0) + 1;
      }
      if (timing?.dayOfWeek !== undefined) {
        dayDistribution[timing.dayOfWeek] = (dayDistribution[timing.dayOfWeek] || 0) + 1;
      }
    });

    const bestHour = Object.entries(hourDistribution).sort((a, b) => b[1] - a[1])[0];
    const bestDay = Object.entries(dayDistribution).sort((a, b) => b[1] - a[1])[0];

    return {
      hourDistribution,
      dayDistribution,
      bestPublishHour: bestHour ? parseInt(bestHour[0]) : null,
      bestPublishDay: bestDay ? parseInt(bestDay[0]) : null,
    };
  }

  private analyzeContentPatterns(viralVideos: any[]): any {
    const durations = viralVideos.map(dp => (dp.contentFeatures as any)?.duration || 0);
    const avgDuration = durations.reduce((a, b) => a + b, 0) / durations.length;

    const titleLengths = viralVideos.map(dp => (dp.contentFeatures as any)?.titleLength || 0);
    const avgTitleLength = titleLengths.reduce((a, b) => a + b, 0) / titleLengths.length;

    return {
      avgDuration,
      avgTitleLength,
      totalAnalyzed: viralVideos.length,
    };
  }
}
