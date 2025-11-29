import axios from 'axios';
import { config } from '../../config';
import logger from '../../lib/logger';

export interface LinkedInVideoAnalytics {
  views: bigint;
  likes: number;
  comments: number;
  shares: number;
  impressions: bigint;
  clickThroughRate: number;
  engagementRate: number;
}

export class LinkedInService {
  private baseUrl = 'https://api.linkedin.com/v2';
  private accessToken: string;

  constructor() {
    this.accessToken = config.linkedin.accessToken;
  }

  async getVideoAnalytics(urn: string): Promise<LinkedInVideoAnalytics | null> {
    try {
      const statsResponse = await axios.get(
        `${this.baseUrl}/socialActions/${encodeURIComponent(urn)}`,
        {
          headers: {
            Authorization: `Bearer ${this.accessToken}`,
            'X-Restli-Protocol-Version': '2.0.0',
          },
        }
      );

      const analyticsResponse = await axios.get(
        `${this.baseUrl}/organizationalEntityShareStatistics`,
        {
          params: {
            q: 'organizationalEntity',
            shares: [urn],
          },
          headers: {
            Authorization: `Bearer ${this.accessToken}`,
            'X-Restli-Protocol-Version': '2.0.0',
          },
        }
      );

      const stats = statsResponse.data;
      const analytics = analyticsResponse.data.elements?.[0] || {};

      const impressions = analytics.totalShareStatistics?.impressionCount || 0;
      const clicks = analytics.totalShareStatistics?.clickCount || 0;
      const likes = stats.likesSummary?.totalLikes || 0;
      const comments = stats.commentsSummary?.totalComments || 0;
      const shares = analytics.totalShareStatistics?.shareCount || 0;
      const engagements = likes + comments + shares;

      return {
        views: BigInt(clicks),
        likes,
        comments,
        shares,
        impressions: BigInt(impressions),
        clickThroughRate: impressions > 0 ? (clicks / impressions) * 100 : 0,
        engagementRate: impressions > 0 ? (engagements / impressions) * 100 : 0,
      };
    } catch (error) {
      logger.error('Error fetching LinkedIn analytics', { error, urn });
      return null;
    }
  }
}
