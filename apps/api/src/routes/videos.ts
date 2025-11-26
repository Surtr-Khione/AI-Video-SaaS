import { Router } from 'express';
import multer from 'multer';
import path from 'path';
import fs from 'fs/promises';
import { z } from 'zod';
import { prisma } from '@ai-video-saas/database';
import { authenticateToken, AuthRequest } from '../middleware/auth';
import { asyncHandler } from '../utils/asyncHandler';
import { AppError } from '../middleware/errorHandler';
import { videoQueue } from '../queues/videoQueue';
import { logger } from '../utils/logger';

const router = Router();

// Configure multer for video uploads
const uploadDir = process.env.UPLOAD_DIR || './uploads';
const storage = multer.diskStorage({
  destination: async (req, file, cb) => {
    await fs.mkdir(uploadDir, { recursive: true });
    cb(null, uploadDir);
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
    cb(null, `video-${uniqueSuffix}${path.extname(file.originalname)}`);
  },
});

const upload = multer({
  storage,
  limits: {
    fileSize: parseInt(process.env.MAX_FILE_SIZE || '2147483648'), // 2GB default
  },
  fileFilter: (req, file, cb) => {
    const allowedMimeTypes = [
      'video/mp4',
      'video/mpeg',
      'video/quicktime',
      'video/x-msvideo',
      'video/x-matroska',
    ];
    if (allowedMimeTypes.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new AppError(400, 'Invalid file type. Only video files are allowed.', 'INVALID_FILE_TYPE'));
    }
  },
});

const uploadMetadataSchema = z.object({
  title: z.string().min(1).max(255),
  description: z.string().max(1000).optional(),
});

// Upload video
router.post(
  '/upload',
  authenticateToken,
  upload.single('video'),
  asyncHandler(async (req: AuthRequest, res) => {
    if (!req.file) {
      throw new AppError(400, 'No video file provided', 'NO_FILE');
    }

    const { title, description } = uploadMetadataSchema.parse(req.body);

    const video = await prisma.video.create({
      data: {
        userId: req.userId!,
        title,
        description,
        originalFileName: req.file.originalname,
        originalFileSize: req.file.size,
        originalUrl: req.file.path,
        status: 'UPLOADED',
      },
    });

    // Queue video processing
    await videoQueue.add('process-video', {
      videoId: video.id,
      filePath: req.file.path,
    });

    logger.info(`Video uploaded: ${video.id}`);

    res.status(201).json({
      id: video.id,
      title: video.title,
      description: video.description,
      status: video.status,
      createdAt: video.createdAt,
    });
  })
);

// Get all videos for user
router.get(
  '/',
  authenticateToken,
  asyncHandler(async (req: AuthRequest, res) => {
    const videos = await prisma.video.findMany({
      where: { userId: req.userId },
      orderBy: { createdAt: 'desc' },
      select: {
        id: true,
        title: true,
        description: true,
        status: true,
        originalDuration: true,
        processedDuration: true,
        qualityScore: true,
        createdAt: true,
        updatedAt: true,
      },
    });

    res.json(videos);
  })
);

// Get single video
router.get(
  '/:id',
  authenticateToken,
  asyncHandler(async (req: AuthRequest, res) => {
    const video = await prisma.video.findFirst({
      where: {
        id: req.params.id,
        userId: req.userId,
      },
      include: {
        jobs: {
          orderBy: { createdAt: 'desc' },
        },
      },
    });

    if (!video) {
      throw new AppError(404, 'Video not found', 'VIDEO_NOT_FOUND');
    }

    res.json(video);
  })
);

// Delete video
router.delete(
  '/:id',
  authenticateToken,
  asyncHandler(async (req: AuthRequest, res) => {
    const video = await prisma.video.findFirst({
      where: {
        id: req.params.id,
        userId: req.userId,
      },
    });

    if (!video) {
      throw new AppError(404, 'Video not found', 'VIDEO_NOT_FOUND');
    }

    // Delete files
    try {
      await fs.unlink(video.originalUrl);
      if (video.processedUrl) {
        await fs.unlink(video.processedUrl);
      }
    } catch (error) {
      logger.error('Error deleting video files:', error);
    }

    // Delete from database
    await prisma.video.delete({
      where: { id: req.params.id },
    });

    res.status(204).send();
  })
);

export default router;
