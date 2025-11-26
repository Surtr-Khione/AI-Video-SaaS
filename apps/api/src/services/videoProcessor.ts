import { prisma } from '@ai-video-saas/database';
import { logger } from '../utils/logger';
import { transcribeVideo } from './transcription';
import { detectScenes } from './sceneDetection';
import { enhanceVideo } from './videoEnhancement';
import { analyzeQuality } from './qualityAnalysis';

export async function processVideo(
  videoId: string,
  filePath: string,
  onProgress: (progress: number) => void
): Promise<void> {
  try {
    // Update status to processing
    await prisma.video.update({
      where: { id: videoId },
      data: {
        status: 'PROCESSING',
        processingStartedAt: new Date(),
      },
    });

    // Step 1: Transcribe video (25%)
    logger.info(`Transcribing video: ${videoId}`);
    const transcriptionJob = await prisma.processingJob.create({
      data: {
        videoId,
        type: 'TRANSCRIPTION',
        status: 'RUNNING',
        startedAt: new Date(),
      },
    });

    const transcription = await transcribeVideo(filePath);

    await prisma.processingJob.update({
      where: { id: transcriptionJob.id },
      data: {
        status: 'COMPLETED',
        output: { transcription },
        completedAt: new Date(),
      },
    });

    await prisma.video.update({
      where: { id: videoId },
      data: { transcription },
    });

    onProgress(25);

    // Step 2: Detect scenes (50%)
    logger.info(`Detecting scenes: ${videoId}`);
    const sceneJob = await prisma.processingJob.create({
      data: {
        videoId,
        type: 'SCENE_DETECTION',
        status: 'RUNNING',
        startedAt: new Date(),
      },
    });

    const scenes = await detectScenes(filePath, transcription);

    await prisma.processingJob.update({
      where: { id: sceneJob.id },
      data: {
        status: 'COMPLETED',
        output: { scenes },
        completedAt: new Date(),
      },
    });

    await prisma.video.update({
      where: { id: videoId },
      data: { scenes },
    });

    onProgress(50);

    // Step 3: Analyze quality (65%)
    logger.info(`Analyzing quality: ${videoId}`);
    const qualityScore = await analyzeQuality(filePath, transcription, scenes);

    await prisma.video.update({
      where: { id: videoId },
      data: { qualityScore },
    });

    onProgress(65);

    // Step 4: Enhance video (100%)
    logger.info(`Enhancing video: ${videoId}`);
    const enhancementJob = await prisma.processingJob.create({
      data: {
        videoId,
        type: 'VIDEO_ENHANCEMENT',
        status: 'RUNNING',
        startedAt: new Date(),
      },
    });

    const { outputPath, enhancements, duration } = await enhanceVideo(
      filePath,
      scenes,
      transcription
    );

    await prisma.processingJob.update({
      where: { id: enhancementJob.id },
      data: {
        status: 'COMPLETED',
        output: { outputPath, enhancements },
        completedAt: new Date(),
      },
    });

    // Update video with final results
    await prisma.video.update({
      where: { id: videoId },
      data: {
        status: 'COMPLETED',
        processedUrl: outputPath,
        processedDuration: duration,
        enhancements,
        processingCompletedAt: new Date(),
      },
    });

    onProgress(100);
    logger.info(`Video processing completed successfully: ${videoId}`);
  } catch (error) {
    logger.error(`Video processing failed: ${videoId}`, error);

    await prisma.video.update({
      where: { id: videoId },
      data: {
        status: 'FAILED',
        errorMessage: error instanceof Error ? error.message : 'Unknown error',
      },
    });

    throw error;
  }
}
