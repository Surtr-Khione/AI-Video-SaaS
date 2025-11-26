/**
 * AI Provider Factory
 *
 * Creates and manages AI provider instances
 */
import { AIProvider, AIProviderName } from '@/types/ai';
import { GoogleVeoProvider } from './google-veo';
import { OpenAISoraProvider } from './openai-sora';
import { RunwayMLProvider } from './runway-ml';
import { ReplicateProvider } from './replicate';
import { aiProviderConfig, isProviderEnabled } from '@/config/ai-providers';

/**
 * Provider factory cache
 */
const providerCache = new Map<AIProviderName, AIProvider>();

/**
 * Create a provider instance
 */
export function createProvider(name: AIProviderName): AIProvider {
  // Return cached instance if available
  if (providerCache.has(name)) {
    return providerCache.get(name)!;
  }

  // Check if provider is enabled
  if (!isProviderEnabled(name)) {
    throw new Error(`Provider ${name} is not enabled. Check your environment configuration.`);
  }

  const config = aiProviderConfig[name];
  if (!config) {
    throw new Error(`Unknown provider: ${name}`);
  }

  let provider: AIProvider;

  switch (name) {
    case 'google_veo':
      provider = new GoogleVeoProvider({
        apiKey: config.apiKey,
        credentialsPath: process.env.GOOGLE_APPLICATION_CREDENTIALS,
        projectId: process.env.GOOGLE_CLOUD_PROJECT_ID,
        location: process.env.GOOGLE_CLOUD_LOCATION,
      });
      break;

    case 'openai_sora':
      provider = new OpenAISoraProvider({
        apiKey: config.apiKey!,
        organizationId: process.env.OPENAI_ORG_ID,
      });
      break;

    case 'runway_ml':
      provider = new RunwayMLProvider({
        apiKey: config.apiKey!,
        apiSecret: config.apiSecret,
      });
      break;

    case 'replicate':
      provider = new ReplicateProvider({
        apiKey: config.apiKey!,
      });
      break;

    default:
      throw new Error(`Provider ${name} not implemented`);
  }

  // Cache the provider instance
  providerCache.set(name, provider);

  return provider;
}

/**
 * Get all enabled providers
 */
export function getAllProviders(): AIProvider[] {
  const providers: AIProvider[] = [];

  for (const [name, config] of Object.entries(aiProviderConfig)) {
    if (config.enabled) {
      try {
        providers.push(createProvider(name as AIProviderName));
      } catch (error) {
        console.warn(`Failed to create provider ${name}:`, error);
      }
    }
  }

  return providers;
}

/**
 * Check if any providers are available
 */
export function hasEnabledProviders(): boolean {
  return Object.values(aiProviderConfig).some((config) => config.enabled);
}

/**
 * Get provider by name
 */
export function getProvider(name: AIProviderName): AIProvider {
  return createProvider(name);
}

// Export individual providers for direct access
export { GoogleVeoProvider } from './google-veo';
export { OpenAISoraProvider } from './openai-sora';
export { RunwayMLProvider } from './runway-ml';
export { ReplicateProvider } from './replicate';
export { BaseAIProvider } from './base';
