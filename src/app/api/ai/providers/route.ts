/**
 * API Route: List AI Providers
 *
 * GET /api/ai/providers
 * Returns list of enabled AI providers and their capabilities
 */
import { NextResponse } from 'next/server';
import { getAllProviders } from '@/services/ai/providers';

export async function GET() {
  try {
    const providers = getAllProviders();

    const providerInfo = providers.map((provider) => ({
      name: provider.name,
      capabilities: provider.capabilities,
      maxDuration: provider.maxDuration,
      costPerSecond: provider.costPerSecond,
    }));

    return NextResponse.json({
      providers: providerInfo,
      count: providerInfo.length,
    });
  } catch (error: any) {
    console.error('[API] List providers failed:', error);

    return NextResponse.json(
      {
        error: 'Failed to list providers',
        message: error.message,
      },
      { status: 500 }
    );
  }
}
