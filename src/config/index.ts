/**
 * Application configuration
 */

export interface AppConfig {
  port: number;
  apiKey: string;
  videoStoragePath: string;
  maxVideoSize: number;
}

export const config: AppConfig = {
  port: parseInt(process.env.PORT || '3000', 10),
  apiKey: process.env.API_KEY || '',
  videoStoragePath: process.env.VIDEO_STORAGE_PATH || './videos',
  maxVideoSize: 100 * 1024 * 1024, // 100MB
};
