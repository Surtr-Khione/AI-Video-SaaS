/**
 * API Route: Check Video Generation Status
 *
 * GET /api/ai/status/:projectId
 * Returns the current status of a video generation job
 */
import { NextRequest, NextResponse } from 'next/server';
import { aiService } from '@/services/ai';
import prisma from '@/lib/db';

export async function GET(
  request: NextRequest,
  { params }: { params: { projectId: string } }
) {
  try {
    const { projectId } = params;

    // Get project from database
    const project = await prisma.videoProject.findUnique({
      where: { id: projectId },
    });

    if (!project) {
      return NextResponse.json(
        { error: 'Project not found' },
        { status: 404 }
      );
    }

    // If project is already completed or failed, return stored data
    if (project.status === 'COMPLETED' || project.status === 'FAILED' || project.status === 'CANCELLED') {
      return NextResponse.json({
        project: {
          id: project.id,
          title: project.title,
          status: project.status,
          provider: project.provider,
          videoUrl: project.resultUrl,
          thumbnailUrl: project.thumbnailUrl,
          error: project.errorMessage,
          createdAt: project.createdAt,
          completedAt: project.completedAt,
        },
      });
    }

    // Check status from provider
    const status = await aiService.checkStatus(projectId);

    return NextResponse.json({
      project: {
        id: project.id,
        title: project.title,
        status: project.status,
        provider: project.provider,
      },
      job: {
        status: status.status,
        progress: status.progress,
        videoUrl: status.videoUrl,
        thumbnailUrl: status.thumbnailUrl,
        error: status.error,
      },
    });
  } catch (error: any) {
    console.error('[API] Check status failed:', error);

    return NextResponse.json(
      {
        error: 'Failed to check status',
        message: error.message,
      },
      { status: 500 }
    );
  }
}
