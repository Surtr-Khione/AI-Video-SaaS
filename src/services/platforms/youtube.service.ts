import { google, youtube_v3 } from 'googleapis';
import { config } from '../../config';
import logger from '../../lib/logger';

export interface YouTubeVideoAnalytics {
  views: bigint;
  likes: number;
  comments: number;
  shares: number;
  averageWatchTime: number;
  impressions: bigint;
  clickThroughRate: number;
  audienceRetention: number;
  demographicData: any;
  topLocations: any;
  trafficSources: any;
}

export class YouTubeService {
  private youtube: youtube_v3.Youtube;
  private oauth2Client: any;

  constructor() {
    this.oauth2Client = new google.auth.OAuth2(
      config.youtube.clientId,
      config.youtube.clientSecret
    );

    this.oauth2Client.setCredentials({
      refresh_token: config.youtube.refreshToken,
    });

    this.youtube = google.youtube({
      version: 'v3',
      auth: this.oauth2Client,
    });
  }

  async getVideoAnalytics(videoId: string): Promise<YouTubeVideoAnalytics | null> {
    try {
      const videoResponse = await this.youtube.videos.list({
        part: ['statistics', 'contentDetails'],
        id: [videoId],
      });

      if (!videoResponse.data.items || videoResponse.data.items.length === 0) {
        logger.warn(`YouTube video not found: ${videoId}`);
        return null;
      }

      const video = videoResponse.data.items[0];
      const stats = video.statistics;

      const analyticsResponse = await this.youtube.reports.query({
        ids: `channel==MINE`,
        startDate: '2020-01-01',
        endDate: new Date().toISOString().split('T')[0],
        metrics: 'views,likes,comments,shares,estimatedMinutesWatched,averageViewDuration,impressions,impressionClickThroughRate',
        dimensions: 'video',
        filters: `video==${videoId}`,
      } as any);

      const analyticsData = analyticsResponse.data.rows?.[0] || [];

      return {
        views: BigInt(stats?.viewCount || 0),
        likes: parseInt(stats?.likeCount || '0', 10),
        comments: parseInt(stats?.commentCount || '0', 10),
        shares: 0,
        averageWatchTime: parseInt(analyticsData[6] || '0', 10),
        impressions: BigInt(analyticsData[7] || 0),
        clickThroughRate: parseFloat(analyticsData[8] || '0'),
        audienceRetention: 0,
        demographicData: {},
        topLocations: {},
        trafficSources: {},
      };
    } catch (error) {
      logger.error('Error fetching YouTube analytics', { error, videoId });
      throw error;
    }
  }

  async getVideoDemographics(videoId: string): Promise<any> {
    try {
      const response = await this.youtube.reports.query({
        ids: 'channel==MINE',
        startDate: '2020-01-01',
        endDate: new Date().toISOString().split('T')[0],
        metrics: 'viewerPercentage',
        dimensions: 'ageGroup,gender',
        filters: `video==${videoId}`,
      } as any);

      return response.data.rows || [];
    } catch (error) {
      logger.error('Error fetching YouTube demographics', { error, videoId });
      return [];
    }
  }

  async getTopLocations(videoId: string): Promise<any> {
    try {
      const response = await this.youtube.reports.query({
        ids: 'channel==MINE',
        startDate: '2020-01-01',
        endDate: new Date().toISOString().split('T')[0],
        metrics: 'views',
        dimensions: 'country',
        filters: `video==${videoId}`,
        sort: '-views',
        maxResults: 10,
      } as any);

      return response.data.rows || [];
    } catch (error) {
      logger.error('Error fetching YouTube top locations', { error, videoId });
      return [];
    }
  }
}
