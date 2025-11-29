import { TwitterApi } from 'twitter-api-v2';
import { config } from '../../config';
import logger from '../../lib/logger';

export interface XVideoAnalytics {
  views: bigint;
  likes: number;
  comments: number;
  retweets: number;
  quotes: number;
  impressions: bigint;
  engagementRate: number;
}

export class XService {
  private client: TwitterApi;

  constructor() {
    this.client = new TwitterApi({
      appKey: config.x.apiKey,
      appSecret: config.x.apiSecret,
      accessToken: config.x.accessToken,
      accessSecret: config.x.accessSecret,
    });
  }

  async getVideoAnalytics(tweetId: string): Promise<XVideoAnalytics | null> {
    try {
      const tweet = await this.client.v2.singleTweet(tweetId, {
        'tweet.fields': ['public_metrics', 'non_public_metrics', 'organic_metrics'],
      });

      if (!tweet.data) {
        logger.warn(`X tweet not found: ${tweetId}`);
        return null;
      }

      const publicMetrics = tweet.data.public_metrics;
      const organicMetrics = (tweet.data as any).organic_metrics;

      const impressions = organicMetrics?.impression_count || publicMetrics?.impression_count || 0;
      const engagements =
        (publicMetrics?.like_count || 0) +
        (publicMetrics?.reply_count || 0) +
        (publicMetrics?.retweet_count || 0) +
        (publicMetrics?.quote_count || 0);

      return {
        views: BigInt(organicMetrics?.video_view_count || 0),
        likes: publicMetrics?.like_count || 0,
        comments: publicMetrics?.reply_count || 0,
        retweets: publicMetrics?.retweet_count || 0,
        quotes: publicMetrics?.quote_count || 0,
        impressions: BigInt(impressions),
        engagementRate: impressions > 0 ? (engagements / impressions) * 100 : 0,
      };
    } catch (error) {
      logger.error('Error fetching X analytics', { error, tweetId });
      return null;
    }
  }

  async getTweetMetrics(tweetId: string): Promise<any> {
    try {
      const tweet = await this.client.v2.singleTweet(tweetId, {
        'tweet.fields': ['public_metrics', 'non_public_metrics', 'organic_metrics', 'promoted_metrics'],
      });

      return tweet.data;
    } catch (error) {
      logger.error('Error fetching X tweet metrics', { error, tweetId });
      return null;
    }
  }
}
