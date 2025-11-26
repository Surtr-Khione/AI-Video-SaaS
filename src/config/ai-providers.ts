/**
 * AI Provider configuration
 */
import { ProviderConfig } from '@/types/ai';

export const aiProviderConfig: Record<string, ProviderConfig> = {
  google_veo: {
    name: 'google_veo',
    enabled: !!process.env.GOOGLE_API_KEY || !!process.env.GOOGLE_APPLICATION_CREDENTIALS,
    apiKey: process.env.GOOGLE_API_KEY,
    baseUrl: process.env.GOOGLE_CLOUD_PROJECT_ID
      ? `https://${process.env.GOOGLE_CLOUD_LOCATION}-aiplatform.googleapis.com`
      : 'https://generativelanguage.googleapis.com',
    timeout: 600000, // 10 minutes
    maxRetries: 3,
  },

  openai_sora: {
    name: 'openai_sora',
    enabled: !!process.env.OPENAI_API_KEY,
    apiKey: process.env.OPENAI_API_KEY,
    baseUrl: 'https://api.openai.com/v1',
    timeout: 600000,
    maxRetries: 3,
  },

  runway_ml: {
    name: 'runway_ml',
    enabled: !!process.env.RUNWAY_API_KEY,
    apiKey: process.env.RUNWAY_API_KEY,
    apiSecret: process.env.RUNWAY_API_SECRET,
    webhookSecret: process.env.RUNWAY_WEBHOOK_SECRET,
    baseUrl: 'https://api.runwayml.com/v1',
    timeout: 600000,
    maxRetries: 3,
  },

  replicate: {
    name: 'replicate',
    enabled: !!process.env.REPLICATE_API_TOKEN,
    apiKey: process.env.REPLICATE_API_TOKEN,
    baseUrl: 'https://api.replicate.com/v1',
    timeout: 600000,
    maxRetries: 3,
  },
};

/**
 * Get enabled providers
 */
export function getEnabledProviders(): string[] {
  return Object.entries(aiProviderConfig)
    .filter(([_, config]) => config.enabled)
    .map(([name]) => name);
}

/**
 * Check if a provider is enabled
 */
export function isProviderEnabled(provider: string): boolean {
  return aiProviderConfig[provider]?.enabled ?? false;
}

/**
 * Get provider config
 */
export function getProviderConfig(provider: string): ProviderConfig | null {
  return aiProviderConfig[provider] ?? null;
}
