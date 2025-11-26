/**
 * API Route: Generate Video
 *
 * POST /api/ai/generate
 * Starts a video generation job
 */
import { NextRequest, NextResponse } from 'next/server';
import { aiService } from '@/services/ai';
import { enqueueVideoGeneration } from '@/services/queue/video-queue';
import { z } from 'zod';

// Request validation schema
const generateVideoSchema = z.object({
  userId: z.string().min(1),
  title: z.string().optional(),
  type: z.enum(['text-to-video', 'image-to-video', 'video-editing', 'video-enhancement']),
  prompt: z.string().optional(),
  negativePrompt: z.string().optional(),
  sourceImage: z.string().url().optional(),
  sourceVideo: z.string().url().optional(),
  duration: z.number().min(1).max(60).optional(),
  resolution: z.string().optional(),
  fps: z.number().min(8).max(60).optional(),
  aspectRatio: z.string().optional(),
  style: z.string().optional(),
  seed: z.number().optional(),
  guidanceScale: z.number().optional(),
  provider: z.enum(['google_veo', 'openai_sora', 'runway_ml', 'replicate', 'auto']).optional(),
  options: z.record(z.any()).optional(),
});

export async function POST(request: NextRequest) {
  try {
    // Parse and validate request body
    const body = await request.json();
    const validated = generateVideoSchema.parse(body);

    // Check if any providers are enabled
    const enabledProviders = aiService.getEnabledProviders();
    if (enabledProviders.length === 0) {
      return NextResponse.json(
        {
          error: 'No AI providers are configured',
          message: 'Please configure at least one AI provider in your environment variables',
        },
        { status: 503 }
      );
    }

    // Generate video
    const { project, result } = await aiService.generateVideo(
      validated,
      validated.provider
    );

    // For async processing, you can optionally enqueue the job
    // await enqueueVideoGeneration({
    //   projectId: project.id,
    //   userId: validated.userId,
    //   params: validated,
    //   provider: validated.provider,
    // });

    return NextResponse.json({
      success: true,
      project: {
        id: project.id,
        title: project.title,
        status: project.status,
        provider: project.provider,
      },
      job: {
        id: result.jobId,
        status: result.status,
        estimatedTimeSeconds: result.estimatedTimeSeconds,
      },
    });
  } catch (error: any) {
    console.error('[API] Generate video failed:', error);

    if (error.name === 'ZodError') {
      return NextResponse.json(
        {
          error: 'Invalid request',
          details: error.errors,
        },
        { status: 400 }
      );
    }

    return NextResponse.json(
      {
        error: 'Video generation failed',
        message: error.message,
      },
      { status: 500 }
    );
  }
}
