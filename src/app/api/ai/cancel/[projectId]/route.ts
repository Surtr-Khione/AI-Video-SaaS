/**
 * API Route: Cancel Video Generation
 *
 * POST /api/ai/cancel/:projectId
 * Cancels a running video generation job
 */
import { NextRequest, NextResponse } from 'next/server';
import { aiService } from '@/services/ai';

export async function POST(
  request: NextRequest,
  { params }: { params: { projectId: string } }
) {
  try {
    const { projectId } = params;

    await aiService.cancelGeneration(projectId);

    return NextResponse.json({
      success: true,
      message: 'Video generation cancelled',
    });
  } catch (error: any) {
    console.error('[API] Cancel generation failed:', error);

    return NextResponse.json(
      {
        error: 'Failed to cancel generation',
        message: error.message,
      },
      { status: 500 }
    );
  }
}
