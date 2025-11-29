import axios from 'axios';
import { config } from '../../config';
import logger from '../../lib/logger';

export interface FacebookVideoAnalytics {
  views: bigint;
  likes: number;
  comments: number;
  shares: number;
  impressions: bigint;
  reach: bigint;
  engagementRate: number;
  averageWatchTime: number;
  clickThroughRate: number;
  demographicData: any;
}

export class FacebookService {
  private baseUrl = 'https://graph.facebook.com/v18.0';
  private accessToken: string;

  constructor() {
    this.accessToken = config.facebook.accessToken;
  }

  async getVideoAnalytics(videoId: string): Promise<FacebookVideoAnalytics | null> {
    try {
      const response = await axios.get(`${this.baseUrl}/${videoId}`, {
        params: {
          fields: 'id,views,likes.summary(true),comments.summary(true),shares,video_insights.metric(total_video_views,total_video_impressions,total_video_view_time,total_video_avg_time_watched)',
          access_token: this.accessToken,
        },
      });

      const data = response.data;
      const insights = data.video_insights?.data || [];

      const getInsightValue = (metric: string): number => {
        const insight = insights.find((i: any) => i.name === metric);
        return insight?.values?.[0]?.value || 0;
      };

      const totalViews = getInsightValue('total_video_views');
      const impressions = getInsightValue('total_video_impressions');
      const totalEngagements = (data.likes?.summary?.total_count || 0) +
                               (data.comments?.summary?.total_count || 0) +
                               (data.shares?.count || 0);

      return {
        views: BigInt(totalViews),
        likes: data.likes?.summary?.total_count || 0,
        comments: data.comments?.summary?.total_count || 0,
        shares: data.shares?.count || 0,
        impressions: BigInt(impressions),
        reach: BigInt(impressions),
        engagementRate: impressions > 0 ? (totalEngagements / impressions) * 100 : 0,
        averageWatchTime: getInsightValue('total_video_avg_time_watched'),
        clickThroughRate: 0,
        demographicData: {},
      };
    } catch (error) {
      logger.error('Error fetching Facebook analytics', { error, videoId });
      return null;
    }
  }

  async getInstagramVideoAnalytics(mediaId: string): Promise<FacebookVideoAnalytics | null> {
    try {
      const response = await axios.get(`${this.baseUrl}/${mediaId}`, {
        params: {
          fields: 'id,media_type,like_count,comments_count,insights.metric(impressions,reach,saved,video_views,plays,total_interactions)',
          access_token: this.accessToken,
        },
      });

      const data = response.data;
      const insights = data.insights?.data || [];

      const getInsightValue = (metric: string): number => {
        const insight = insights.find((i: any) => i.name === metric);
        return insight?.values?.[0]?.value || 0;
      };

      const views = getInsightValue('video_views') || getInsightValue('plays');
      const impressions = getInsightValue('impressions');
      const reach = getInsightValue('reach');
      const interactions = getInsightValue('total_interactions');

      return {
        views: BigInt(views),
        likes: data.like_count || 0,
        comments: data.comments_count || 0,
        shares: 0,
        impressions: BigInt(impressions),
        reach: BigInt(reach),
        engagementRate: impressions > 0 ? (interactions / impressions) * 100 : 0,
        averageWatchTime: 0,
        clickThroughRate: 0,
        demographicData: {},
      };
    } catch (error) {
      logger.error('Error fetching Instagram analytics', { error, mediaId });
      return null;
    }
  }
}
