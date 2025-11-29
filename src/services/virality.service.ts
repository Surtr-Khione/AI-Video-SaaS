import { ViralityLevel, ViralityScore } from '@prisma/client';
import prisma from '../lib/prisma';
import logger from '../lib/logger';
import { config } from '../config';

export interface ViralityFactors {
  viewVelocity: number;
  shareVelocity: number;
  commentVelocity: number;
  growthAcceleration: number;
  engagementIntensity: number;
  crossPlatformReach: number;
  timeToThreshold: number;
}

export class ViralityService {
  async calculateViralityScore(videoId: string): Promise<ViralityScore | null> {
    try {
      const video = await prisma.video.findUnique({
        where: { id: videoId },
        include: {
          engagementMetrics: true,
          socialMediaPosts: {
            include: {
              analytics: {
                orderBy: { snapshotAt: 'asc' },
              },
            },
          },
        },
      });

      if (!video) {
        logger.warn('Video not found for virality calculation', { videoId });
        return null;
      }

      const now = new Date();
      const videoAge = (now.getTime() - video.createdAt.getTime()) / (1000 * 60 * 60 * 24);

      if (videoAge < 1) {
        logger.info('Video too new for virality analysis', { videoId, ageInDays: videoAge });
        return null;
      }

      const allAnalytics = video.socialMediaPosts.flatMap(p => p.analytics);

      if (allAnalytics.length === 0) {
        logger.warn('No analytics data for virality calculation', { videoId });
        return null;
      }

      const views24h = await this.getViewsInTimeWindow(videoId, 24);
      const views7d = await this.getViewsInTimeWindow(videoId, 168);

      const velocityMetrics = this.calculateVelocityMetrics(allAnalytics, videoAge);
      const growthRate = this.calculateGrowthRate(allAnalytics);
      const factors = this.analyzeViralityFactors(video, allAnalytics, velocityMetrics, growthRate);

      const viralityScore = this.computeViralityScore(factors);
      const viralityLevel = this.determineViralityLevel(viralityScore, views24h, views7d);
      const isViral = viralityLevel === ViralityLevel.VIRAL || viralityLevel === ViralityLevel.SUPER_VIRAL;

      const viralStartDate = isViral ? this.detectViralStartDate(allAnalytics) : null;
      const predictedReach = this.predictReach(allAnalytics, growthRate, videoAge);

      const result = await prisma.viralityScore.upsert({
        where: { videoId },
        create: {
          videoId,
          viralityLevel,
          viralityScore,
          velocityScore: velocityMetrics.overallVelocity,
          peakViews24h: BigInt(views24h),
          peakViews7d: BigInt(views7d),
          shareVelocity: velocityMetrics.shareVelocity,
          commentVelocity: velocityMetrics.commentVelocity,
          growthRate,
          isViral,
          viralStartDate,
          predictedReach: predictedReach ? BigInt(predictedReach) : null,
          factors: factors as any,
        },
        update: {
          viralityLevel,
          viralityScore,
          velocityScore: velocityMetrics.overallVelocity,
          peakViews24h: BigInt(views24h),
          peakViews7d: BigInt(views7d),
          shareVelocity: velocityMetrics.shareVelocity,
          commentVelocity: velocityMetrics.commentVelocity,
          growthRate,
          isViral,
          viralStartDate,
          predictedReach: predictedReach ? BigInt(predictedReach) : null,
          factors: factors as any,
          calculatedAt: new Date(),
        },
      });

      logger.info('Virality score calculated', {
        videoId,
        viralityLevel,
        viralityScore,
        isViral,
      });

      return result;
    } catch (error) {
      logger.error('Error calculating virality score', { error, videoId });
      throw error;
    }
  }

  private async getViewsInTimeWindow(videoId: string, hours: number): Promise<number> {
    const cutoffTime = new Date(Date.now() - hours * 60 * 60 * 1000);

    const analytics = await prisma.socialMediaAnalytics.findMany({
      where: {
        socialMediaPost: {
          videoId,
        },
        snapshotAt: {
          gte: cutoffTime,
        },
      },
      orderBy: {
        snapshotAt: 'desc',
      },
    });

    const latestByPost = new Map<string, bigint>();
    for (const a of analytics) {
      if (!latestByPost.has(a.socialMediaPostId)) {
        latestByPost.set(a.socialMediaPostId, a.views);
      }
    }

    return Array.from(latestByPost.values()).reduce(
      (sum, views) => sum + Number(views),
      0
    );
  }

  private calculateVelocityMetrics(analytics: any[], videoAgeInDays: number): {
    viewVelocity: number;
    shareVelocity: number;
    commentVelocity: number;
    overallVelocity: number;
  } {
    if (analytics.length === 0 || videoAgeInDays === 0) {
      return { viewVelocity: 0, shareVelocity: 0, commentVelocity: 0, overallVelocity: 0 };
    }

    const latest = analytics[analytics.length - 1];
    const totalViews = Number(latest.views);
    const totalShares = latest.shares;
    const totalComments = latest.comments;

    const viewVelocity = totalViews / videoAgeInDays;
    const shareVelocity = totalShares / videoAgeInDays;
    const commentVelocity = totalComments / videoAgeInDays;

    const overallVelocity = Math.sqrt(
      viewVelocity * viewVelocity +
      (shareVelocity * 100) * (shareVelocity * 100) +
      (commentVelocity * 50) * (commentVelocity * 50)
    );

    return {
      viewVelocity,
      shareVelocity,
      commentVelocity,
      overallVelocity,
    };
  }

  private calculateGrowthRate(analytics: any[]): number {
    if (analytics.length < 2) return 0;

    const sorted = [...analytics].sort(
      (a, b) => a.snapshotAt.getTime() - b.snapshotAt.getTime()
    );

    const firstHalf = sorted.slice(0, Math.floor(sorted.length / 2));
    const secondHalf = sorted.slice(Math.floor(sorted.length / 2));

    const firstHalfViews = firstHalf.reduce((sum, a) => sum + Number(a.views), 0);
    const secondHalfViews = secondHalf.reduce((sum, a) => sum + Number(a.views), 0);

    if (firstHalfViews === 0) return secondHalfViews > 0 ? 999 : 0;

    return ((secondHalfViews - firstHalfViews) / firstHalfViews) * 100;
  }

  private analyzeViralityFactors(
    video: any,
    analytics: any[],
    velocityMetrics: any,
    growthRate: number
  ): ViralityFactors {
    const latest = analytics[analytics.length - 1];
    const totalViews = Number(latest?.views || 0);
    const totalShares = latest?.shares || 0;
    const totalComments = latest?.comments || 0;
    const totalLikes = latest?.likes || 0;

    const engagementIntensity = totalViews > 0
      ? ((totalLikes + totalComments * 3 + totalShares * 5) / totalViews) * 100
      : 0;

    const crossPlatformReach = video.socialMediaPosts?.length || 1;

    const acceleration = this.calculateAcceleration(analytics);

    const timeToThreshold = this.calculateTimeToThreshold(analytics, 10000);

    return {
      viewVelocity: velocityMetrics.viewVelocity,
      shareVelocity: velocityMetrics.shareVelocity,
      commentVelocity: velocityMetrics.commentVelocity,
      growthAcceleration: acceleration,
      engagementIntensity,
      crossPlatformReach,
      timeToThreshold,
    };
  }

  private calculateAcceleration(analytics: any[]): number {
    if (analytics.length < 3) return 0;

    const sorted = [...analytics].sort(
      (a, b) => a.snapshotAt.getTime() - b.snapshotAt.getTime()
    );

    const recentGrowth = this.calculateGrowthRate(sorted.slice(-3));
    const earlierGrowth = this.calculateGrowthRate(sorted.slice(0, 3));

    return recentGrowth - earlierGrowth;
  }

  private calculateTimeToThreshold(analytics: any[], threshold: number): number {
    const sorted = [...analytics].sort(
      (a, b) => a.snapshotAt.getTime() - b.snapshotAt.getTime()
    );

    const thresholdPoint = sorted.find(a => Number(a.views) >= threshold);
    if (!thresholdPoint || sorted.length === 0) return -1;

    const firstSnapshot = sorted[0];
    return (thresholdPoint.snapshotAt.getTime() - firstSnapshot.snapshotAt.getTime()) / (1000 * 60 * 60);
  }

  private computeViralityScore(factors: ViralityFactors): number {
    const weights = {
      viewVelocity: 0.25,
      shareVelocity: 0.20,
      commentVelocity: 0.15,
      growthAcceleration: 0.15,
      engagementIntensity: 0.15,
      crossPlatformReach: 0.05,
      timeToThreshold: 0.05,
    };

    const normalizedFactors = {
      viewVelocity: Math.min(factors.viewVelocity / 10000, 1),
      shareVelocity: Math.min(factors.shareVelocity / 100, 1),
      commentVelocity: Math.min(factors.commentVelocity / 50, 1),
      growthAcceleration: Math.min(Math.max(factors.growthAcceleration / 200, 0), 1),
      engagementIntensity: Math.min(factors.engagementIntensity / 10, 1),
      crossPlatformReach: Math.min(factors.crossPlatformReach / 5, 1),
      timeToThreshold: factors.timeToThreshold > 0 ? Math.max(1 - factors.timeToThreshold / 168, 0) : 0,
    };

    const score =
      normalizedFactors.viewVelocity * weights.viewVelocity +
      normalizedFactors.shareVelocity * weights.shareVelocity +
      normalizedFactors.commentVelocity * weights.commentVelocity +
      normalizedFactors.growthAcceleration * weights.growthAcceleration +
      normalizedFactors.engagementIntensity * weights.engagementIntensity +
      normalizedFactors.crossPlatformReach * weights.crossPlatformReach +
      normalizedFactors.timeToThreshold * weights.timeToThreshold;

    return Math.round(score * 100 * 100) / 100;
  }

  private determineViralityLevel(
    score: number,
    views24h: number,
    views7d: number
  ): ViralityLevel {
    if (score >= 80 && views24h >= 1000000) return ViralityLevel.SUPER_VIRAL;
    if (score >= 60 && views24h >= 100000) return ViralityLevel.VIRAL;
    if (score >= 40 && views24h >= 10000) return ViralityLevel.HIGH;
    if (score >= 20) return ViralityLevel.MEDIUM;
    return ViralityLevel.LOW;
  }

  private detectViralStartDate(analytics: any[]): Date | null {
    if (analytics.length < 2) return null;

    const sorted = [...analytics].sort(
      (a, b) => a.snapshotAt.getTime() - b.snapshotAt.getTime()
    );

    for (let i = 1; i < sorted.length; i++) {
      const prev = Number(sorted[i - 1].views);
      const curr = Number(sorted[i].views);

      if (prev > 0 && curr / prev >= config.analytics.viralityThresholdMultiplier) {
        return sorted[i].snapshotAt;
      }
    }

    return null;
  }

  private predictReach(analytics: any[], growthRate: number, videoAgeInDays: number): number | null {
    if (analytics.length === 0 || growthRate <= 0) return null;

    const latest = analytics[analytics.length - 1];
    const currentViews = Number(latest.views);

    const daysToPredict = 7;
    const predictedGrowth = Math.pow(1 + growthRate / 100, daysToPredict / videoAgeInDays);
    const predictedReach = currentViews * predictedGrowth;

    return Math.round(predictedReach);
  }

  async getViralVideos(limit = 50): Promise<any[]> {
    const viralVideos = await prisma.viralityScore.findMany({
      where: {
        isViral: true,
      },
      orderBy: {
        viralityScore: 'desc',
      },
      take: limit,
      include: {
        video: {
          include: {
            engagementMetrics: true,
          },
        },
      },
    });

    return viralVideos.map(v => ({
      videoId: v.videoId,
      title: v.video.title,
      viralityLevel: v.viralityLevel,
      viralityScore: v.viralityScore,
      peakViews24h: Number(v.peakViews24h),
      isViral: v.isViral,
      viralStartDate: v.viralStartDate,
      predictedReach: v.predictedReach ? Number(v.predictedReach) : null,
    }));
  }
}
