import { Router, Response } from 'express';
import { AuthRequest, authenticateToken, optionalAuth } from '../middleware/auth';
import { VideoHostingService } from '../services/video-hosting.service';
import logger from '../lib/logger';
import multer from 'multer';
import * as path from 'path';
import { config } from '../config';

const router = Router();
const videoHostingService = new VideoHostingService();

const storage = multer.diskStorage({
  destination: (_req, _file, cb) => {
    cb(null, config.storage.videoPath);
  },
  filename: (_req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, 'video-' + uniqueSuffix + path.extname(file.originalname));
  },
});

const upload = multer({
  storage,
  limits: { fileSize: config.storage.maxVideoSizeMB * 1024 * 1024 },
  fileFilter: (_req, file, cb) => {
    const allowedMimeTypes = ['video/mp4', 'video/mpeg', 'video/quicktime', 'video/x-msvideo'];
    if (allowedMimeTypes.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error('Invalid file type. Only video files are allowed.'));
    }
  },
});

router.post('/upload', authenticateToken, upload.single('video'), async (req: AuthRequest, res: Response) => {
  try {
    if (!req.file) {
      res.status(400).json({ error: 'No video file provided' });
      return;
    }

    const { title, description, duration, aiGeneratedMetadata } = req.body;

    const video = await videoHostingService.createVideo({
      userId: req.user!.id,
      title,
      description,
      filePath: req.file.path,
      duration: parseInt(duration),
      fileSize: req.file.size,
      mimeType: req.file.mimetype,
      aiGeneratedMetadata: aiGeneratedMetadata ? JSON.parse(aiGeneratedMetadata) : undefined,
    });

    res.status(201).json(video);
  } catch (error) {
    logger.error('Video upload error', { error });
    res.status(500).json({ error: 'Failed to upload video' });
  }
});

router.post('/:videoId/view', optionalAuth, async (req: AuthRequest, res: Response) => {
  try {
    const { videoId } = req.params;
    const { watchDuration, completionRate } = req.body;

    const view = await videoHostingService.trackView({
      videoId,
      ipAddress: req.ip,
      userAgent: req.headers['user-agent'],
      referrer: req.headers['referer'],
      watchDuration,
      completionRate,
    });

    res.status(201).json(view);
  } catch (error) {
    logger.error('Track view error', { error });
    res.status(500).json({ error: 'Failed to track view' });
  }
});

router.get('/:videoId', authenticateToken, async (req: AuthRequest, res: Response) => {
  try {
    const { videoId } = req.params;
    const video = await videoHostingService.getVideoById(videoId);

    if (!video) {
      res.status(404).json({ error: 'Video not found' });
      return;
    }

    res.json(video);
  } catch (error) {
    logger.error('Get video error', { error });
    res.status(500).json({ error: 'Failed to get video' });
  }
});

router.get('/:videoId/analytics', authenticateToken, async (req: AuthRequest, res: Response) => {
  try {
    const { videoId } = req.params;
    const analytics = await videoHostingService.getVideoViewAnalytics(videoId);
    res.json(analytics);
  } catch (error) {
    logger.error('Get video analytics error', { error });
    res.status(500).json({ error: 'Failed to get video analytics' });
  }
});

router.get('/user/videos', authenticateToken, async (req: AuthRequest, res: Response) => {
  try {
    const skip = parseInt(req.query.skip as string) || 0;
    const take = parseInt(req.query.take as string) || 20;
    const videos = await videoHostingService.getVideosByUser(req.user!.id, skip, take);
    res.json(videos);
  } catch (error) {
    logger.error('Get user videos error', { error });
    res.status(500).json({ error: 'Failed to get videos' });
  }
});

router.delete('/:videoId', authenticateToken, async (req: AuthRequest, res: Response) => {
  try {
    const { videoId } = req.params;
    await videoHostingService.deleteVideo(videoId);
    res.json({ message: 'Video deleted successfully' });
  } catch (error) {
    logger.error('Delete video error', { error });
    res.status(500).json({ error: 'Failed to delete video' });
  }
});

export default router;
