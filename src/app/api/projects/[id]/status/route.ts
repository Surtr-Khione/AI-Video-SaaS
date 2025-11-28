import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

// GET /api/projects/:id/status - Get project status with job details
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const project = await prisma.videoProject.findUnique({
      where: { id: params.id },
      include: {
        jobs: {
          select: {
            id: true,
            status: true,
            progress: true,
            error: true,
            outputUrl: true,
            createdAt: true,
            startedAt: true,
            completedAt: true,
          },
          orderBy: { createdAt: 'asc' },
        },
      },
    });

    if (!project) {
      return NextResponse.json({ error: 'Project not found' }, { status: 404 });
    }

    // Calculate overall progress
    const totalJobs = project.jobs.length;
    const completedJobs = project.jobs.filter((j) => j.status === 'COMPLETED').length;
    const failedJobs = project.jobs.filter((j) => j.status === 'FAILED').length;
    const processingJobs = project.jobs.filter((j) => j.status === 'PROCESSING').length;
    const pendingJobs = project.jobs.filter((j) => j.status === 'PENDING' || j.status === 'QUEUED').length;

    const totalProgress = project.jobs.reduce((sum, job) => {
      if (job.status === 'COMPLETED') return sum + 100;
      if (job.status === 'PROCESSING') return sum + job.progress;
      return sum;
    }, 0);

    const overallProgress = totalJobs > 0 ? totalProgress / totalJobs : 0;

    return NextResponse.json({
      project: {
        id: project.id,
        name: project.name,
        status: project.status,
      },
      stats: {
        totalJobs,
        completedJobs,
        failedJobs,
        processingJobs,
        pendingJobs,
        overallProgress: Math.round(overallProgress * 100) / 100,
      },
      jobs: project.jobs,
    });
  } catch (error: any) {
    console.error('Error fetching project status:', error);
    return NextResponse.json({ error: 'Failed to fetch project status' }, { status: 500 });
  }
}
