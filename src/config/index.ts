import dotenv from 'dotenv';

dotenv.config();

export const config = {
  port: parseInt(process.env.PORT || '3000', 10),
  nodeEnv: process.env.NODE_ENV || 'development',
  jwtSecret: process.env.JWT_SECRET || 'default-secret-change-this',

  database: {
    url: process.env.DATABASE_URL || '',
  },

  redis: {
    url: process.env.REDIS_URL || 'redis://localhost:6379',
  },

  facebook: {
    appId: process.env.FACEBOOK_APP_ID || '',
    appSecret: process.env.FACEBOOK_APP_SECRET || '',
    accessToken: process.env.FACEBOOK_ACCESS_TOKEN || '',
  },

  instagram: {
    businessAccountId: process.env.INSTAGRAM_BUSINESS_ACCOUNT_ID || '',
  },

  linkedin: {
    clientId: process.env.LINKEDIN_CLIENT_ID || '',
    clientSecret: process.env.LINKEDIN_CLIENT_SECRET || '',
    accessToken: process.env.LINKEDIN_ACCESS_TOKEN || '',
  },

  youtube: {
    apiKey: process.env.YOUTUBE_API_KEY || '',
    clientId: process.env.YOUTUBE_CLIENT_ID || '',
    clientSecret: process.env.YOUTUBE_CLIENT_SECRET || '',
    refreshToken: process.env.YOUTUBE_REFRESH_TOKEN || '',
  },

  x: {
    apiKey: process.env.X_API_KEY || '',
    apiSecret: process.env.X_API_SECRET || '',
    accessToken: process.env.X_ACCESS_TOKEN || '',
    accessSecret: process.env.X_ACCESS_SECRET || '',
    bearerToken: process.env.X_BEARER_TOKEN || '',
  },

  storage: {
    videoPath: process.env.VIDEO_STORAGE_PATH || '/var/videos',
    maxVideoSizeMB: parseInt(process.env.MAX_VIDEO_SIZE_MB || '500', 10),
  },

  analytics: {
    viralityThresholdMultiplier: parseFloat(process.env.VIRALITY_THRESHOLD_MULTIPLIER || '3.0'),
    highEngagementPercentile: parseInt(process.env.HIGH_ENGAGEMENT_PERCENTILE || '80', 10),
    syncIntervalHours: parseInt(process.env.ANALYTICS_SYNC_INTERVAL_HOURS || '1', 10),
  },

  aiTraining: {
    minVideosForTraining: parseInt(process.env.MIN_VIDEOS_FOR_TRAINING || '100', 10),
    trainingDataExportPath: process.env.TRAINING_DATA_EXPORT_PATH || '/var/training-data',
  },
};
