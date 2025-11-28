import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { createReadStream, existsSync } from 'fs';
import { stat } from 'fs/promises';
import path from 'path';

const outputDir = process.env.OUTPUT_DIR || './output';

// GET /api/videos/:id - Download completed video
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const job = await prisma.videoJob.findUnique({
      where: { id: params.id },
    });

    if (!job) {
      return NextResponse.json({ error: 'Video not found' }, { status: 404 });
    }

    if (job.status !== 'COMPLETED' || !job.outputPath) {
      return NextResponse.json({ error: 'Video not ready' }, { status: 400 });
    }

    const videoPath = job.outputPath;

    if (!existsSync(videoPath)) {
      return NextResponse.json({ error: 'Video file not found' }, { status: 404 });
    }

    const stats = await stat(videoPath);
    const fileStream = createReadStream(videoPath);

    // Convert Node.js stream to Web Stream
    const readableStream = new ReadableStream({
      start(controller) {
        fileStream.on('data', (chunk: Buffer) => {
          controller.enqueue(new Uint8Array(chunk));
        });
        fileStream.on('end', () => {
          controller.close();
        });
        fileStream.on('error', (error: Error) => {
          controller.error(error);
        });
      },
      cancel() {
        fileStream.destroy();
      },
    });

    return new NextResponse(readableStream, {
      headers: {
        'Content-Type': 'video/mp4',
        'Content-Length': stats.size.toString(),
        'Content-Disposition': `attachment; filename="${params.id}.mp4"`,
      },
    });
  } catch (error: any) {
    console.error('Error downloading video:', error);
    return NextResponse.json({ error: 'Failed to download video' }, { status: 500 });
  }
}
