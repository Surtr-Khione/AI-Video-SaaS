import { Router, Response } from 'express';
import { AuthRequest, authenticateToken } from '../middleware/auth';
import { AnalyticsService } from '../services/analytics.service';
import { ViralityService } from '../services/virality.service';
import { TrainingDataService } from '../services/training-data.service';
import logger from '../lib/logger';

const router = Router();
const analyticsService = new AnalyticsService();
const viralityService = new ViralityService();
const trainingDataService = new TrainingDataService();

router.post('/sync', authenticateToken, async (req: AuthRequest, res: Response) => {
  try {
    const { videoId } = req.body;
    await analyticsService.syncAllPlatformAnalytics(videoId);
    res.json({ message: 'Analytics sync initiated successfully' });
  } catch (error) {
    logger.error('Analytics sync error', { error });
    res.status(500).json({ error: 'Failed to sync analytics' });
  }
});

router.post('/sync/:postId', authenticateToken, async (req: AuthRequest, res: Response) => {
  try {
    const { postId } = req.params;
    const analytics = await analyticsService.syncPostAnalytics(postId);
    res.json({ message: 'Post analytics synced', analytics });
  } catch (error) {
    logger.error('Post analytics sync error', { error });
    res.status(500).json({ error: 'Failed to sync post analytics' });
  }
});

router.get('/video/:videoId', authenticateToken, async (req: AuthRequest, res: Response) => {
  try {
    const { videoId } = req.params;
    const summary = await analyticsService.getVideoAnalyticsSummary(videoId);
    res.json(summary);
  } catch (error) {
    logger.error('Get video analytics error', { error });
    res.status(500).json({ error: 'Failed to get video analytics' });
  }
});

router.get('/top-performing', authenticateToken, async (req: AuthRequest, res: Response) => {
  try {
    const limit = parseInt(req.query.limit as string) || 10;
    const topVideos = await analyticsService.getTopPerformingVideos(limit);
    res.json(topVideos);
  } catch (error) {
    logger.error('Get top performing videos error', { error });
    res.status(500).json({ error: 'Failed to get top performing videos' });
  }
});

router.post('/virality/:videoId', authenticateToken, async (req: AuthRequest, res: Response) => {
  try {
    const { videoId } = req.params;
    const viralityScore = await viralityService.calculateViralityScore(videoId);
    res.json(viralityScore);
  } catch (error) {
    logger.error('Calculate virality score error', { error });
    res.status(500).json({ error: 'Failed to calculate virality score' });
  }
});

router.get('/viral-videos', authenticateToken, async (req: AuthRequest, res: Response) => {
  try {
    const limit = parseInt(req.query.limit as string) || 50;
    const viralVideos = await viralityService.getViralVideos(limit);
    res.json(viralVideos);
  } catch (error) {
    logger.error('Get viral videos error', { error });
    res.status(500).json({ error: 'Failed to get viral videos' });
  }
});

router.post('/training/generate/:videoId', authenticateToken, async (req: AuthRequest, res: Response) => {
  try {
    const { videoId } = req.params;
    await trainingDataService.generateTrainingDataPoint(videoId);
    res.json({ message: 'Training data point generated successfully' });
  } catch (error) {
    logger.error('Generate training data error', { error });
    res.status(500).json({ error: 'Failed to generate training data' });
  }
});

router.post('/training/export', authenticateToken, async (req: AuthRequest, res: Response) => {
  try {
    const { minVideos } = req.body;
    const exportPath = await trainingDataService.exportTrainingDataset(minVideos);
    res.json({ message: 'Training dataset exported', path: exportPath });
  } catch (error) {
    logger.error('Export training dataset error', { error });
    res.status(500).json({ error: 'Failed to export training dataset' });
  }
});

router.get('/training/insights', authenticateToken, async (_req: AuthRequest, res: Response) => {
  try {
    const insights = await trainingDataService.getTrainingInsights();
    res.json(insights);
  } catch (error) {
    logger.error('Get training insights error', { error });
    res.status(500).json({ error: 'Failed to get training insights' });
  }
});

export default router;
