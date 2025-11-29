import { Video, VideoStatus, VideoView } from '@prisma/client';
import prisma from '../lib/prisma';
import logger from '../lib/logger';
import * as fs from 'fs/promises';
import * as path from 'path';
import { config } from '../config';

export interface VideoUploadData {
  userId: string;
  title: string;
  description?: string;
  filePath: string;
  thumbnailPath?: string;
  duration: number;
  fileSize: number;
  mimeType: string;
  aiGeneratedMetadata?: any;
}

export interface VideoViewData {
  videoId: string;
  ipAddress?: string;
  userAgent?: string;
  country?: string;
  city?: string;
  referrer?: string;
  watchDuration?: number;
  completionRate?: number;
}

export class VideoHostingService {
  async createVideo(data: VideoUploadData): Promise<Video> {
    try {
      const video = await prisma.video.create({
        data: {
          userId: data.userId,
          title: data.title,
          description: data.description,
          filePath: data.filePath,
          thumbnailPath: data.thumbnailPath,
          duration: data.duration,
          fileSize: BigInt(data.fileSize),
          mimeType: data.mimeType,
          status: VideoStatus.ACTIVE,
          aiGeneratedMetadata: data.aiGeneratedMetadata || {},
        },
      });

      logger.info('Video created successfully', { videoId: video.id, userId: data.userId });
      return video;
    } catch (error) {
      logger.error('Error creating video', { error, data });
      throw error;
    }
  }

  async trackView(data: VideoViewData): Promise<VideoView> {
    try {
      const view = await prisma.videoView.create({
        data: {
          videoId: data.videoId,
          ipAddress: data.ipAddress,
          userAgent: data.userAgent,
          country: data.country,
          city: data.city,
          referrer: data.referrer,
          watchDuration: data.watchDuration,
          completionRate: data.completionRate,
        },
      });

      logger.debug('Video view tracked', { videoId: data.videoId, viewId: view.id });
      return view;
    } catch (error) {
      logger.error('Error tracking video view', { error, data });
      throw error;
    }
  }

  async getVideoById(videoId: string): Promise<Video | null> {
    return prisma.video.findUnique({
      where: { id: videoId },
      include: {
        views: true,
        socialMediaPosts: true,
        engagementMetrics: true,
        viralityScore: true,
      },
    });
  }

  async getVideosByUser(userId: string, skip = 0, take = 20): Promise<Video[]> {
    return prisma.video.findMany({
      where: { userId },
      skip,
      take,
      orderBy: { createdAt: 'desc' },
      include: {
        views: true,
        socialMediaPosts: true,
        engagementMetrics: true,
        viralityScore: true,
      },
    });
  }

  async getVideoViewCount(videoId: string): Promise<number> {
    return prisma.videoView.count({
      where: { videoId },
    });
  }

  async getVideoViewAnalytics(videoId: string): Promise<{
    totalViews: number;
    uniqueViews: number;
    averageWatchDuration: number;
    averageCompletionRate: number;
    viewsByCountry: Record<string, number>;
    viewsByReferrer: Record<string, number>;
    viewsOverTime: Array<{ date: string; count: number }>;
  }> {
    const views = await prisma.videoView.findMany({
      where: { videoId },
    });

    const totalViews = views.length;
    const uniqueIPs = new Set(views.filter(v => v.ipAddress).map(v => v.ipAddress)).size;

    const averageWatchDuration = views.length > 0
      ? views.reduce((sum, v) => sum + (v.watchDuration || 0), 0) / views.length
      : 0;

    const averageCompletionRate = views.length > 0
      ? views.reduce((sum, v) => sum + (v.completionRate || 0), 0) / views.length
      : 0;

    const viewsByCountry: Record<string, number> = {};
    views.forEach(v => {
      if (v.country) {
        viewsByCountry[v.country] = (viewsByCountry[v.country] || 0) + 1;
      }
    });

    const viewsByReferrer: Record<string, number> = {};
    views.forEach(v => {
      if (v.referrer) {
        viewsByReferrer[v.referrer] = (viewsByReferrer[v.referrer] || 0) + 1;
      }
    });

    const viewsOverTime: Array<{ date: string; count: number }> = [];
    const viewsByDate: Record<string, number> = {};
    views.forEach(v => {
      const date = v.viewedAt.toISOString().split('T')[0];
      viewsByDate[date] = (viewsByDate[date] || 0) + 1;
    });
    Object.entries(viewsByDate).forEach(([date, count]) => {
      viewsOverTime.push({ date, count });
    });
    viewsOverTime.sort((a, b) => a.date.localeCompare(b.date));

    return {
      totalViews,
      uniqueViews: uniqueIPs,
      averageWatchDuration,
      averageCompletionRate,
      viewsByCountry,
      viewsByReferrer,
      viewsOverTime,
    };
  }

  async deleteVideo(videoId: string): Promise<void> {
    try {
      const video = await this.getVideoById(videoId);
      if (!video) {
        throw new Error('Video not found');
      }

      if (video.filePath) {
        await fs.unlink(video.filePath).catch(err => {
          logger.warn('Failed to delete video file', { error: err, filePath: video.filePath });
        });
      }

      if (video.thumbnailPath) {
        await fs.unlink(video.thumbnailPath).catch(err => {
          logger.warn('Failed to delete thumbnail', { error: err, filePath: video.thumbnailPath });
        });
      }

      await prisma.video.delete({
        where: { id: videoId },
      });

      logger.info('Video deleted successfully', { videoId });
    } catch (error) {
      logger.error('Error deleting video', { error, videoId });
      throw error;
    }
  }

  async updateVideoStatus(videoId: string, status: VideoStatus): Promise<Video> {
    return prisma.video.update({
      where: { id: videoId },
      data: { status },
    });
  }
}
