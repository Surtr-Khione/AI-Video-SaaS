import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import videoQueue from '@/lib/queue';
import { z } from 'zod';

const createJobsSchema = z.object({
  jobs: z.array(
    z.object({
      data: z.record(z.any()),
      priority: z.number().optional(),
    })
  ),
});

// POST /api/projects/:id/jobs - Add jobs to a project
export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const body = await request.json();
    const validatedData = createJobsSchema.parse(body);

    // Verify project exists
    const project = await prisma.videoProject.findUnique({
      where: { id: params.id },
      include: { template: true },
    });

    if (!project) {
      return NextResponse.json({ error: 'Project not found' }, { status: 404 });
    }

    // Create jobs in database
    const createdJobs = await Promise.all(
      validatedData.jobs.map((job) =>
        prisma.videoJob.create({
          data: {
            projectId: params.id,
            data: job.data,
            priority: job.priority || 0,
          },
        })
      )
    );

    // Update project total jobs count
    await prisma.videoProject.update({
      where: { id: params.id },
      data: {
        totalJobs: {
          increment: createdJobs.length,
        },
      },
    });

    // Add jobs to queue
    const queueJobs = await Promise.all(
      createdJobs.map((job) =>
        videoQueue.add(
          {
            jobId: job.id,
            projectId: params.id,
            data: job.data as Record<string, any>,
            templateConfig: project.template?.config as Record<string, any> | undefined,
          },
          {
            priority: job.priority,
            jobId: job.id,
          }
        )
      )
    );

    // Update jobs status to QUEUED
    await prisma.videoJob.updateMany({
      where: {
        id: {
          in: createdJobs.map((j) => j.id),
        },
      },
      data: {
        status: 'QUEUED',
      },
    });

    return NextResponse.json({
      success: true,
      jobs: createdJobs,
      queued: queueJobs.length,
    }, { status: 201 });
  } catch (error: any) {
    console.error('Error creating jobs:', error);
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: 'Invalid request data', details: error.errors }, { status: 400 });
    }
    return NextResponse.json({ error: 'Failed to create jobs' }, { status: 500 });
  }
}
