import { Router, Response } from 'express';
import { AuthRequest, authenticateToken } from '../middleware/auth';
import prisma from '../lib/prisma';
import { Platform } from '@prisma/client';
import logger from '../lib/logger';

const router = Router();

router.post('/accounts', authenticateToken, async (req: AuthRequest, res: Response) => {
  try {
    const {
      platform,
      accountId,
      accountName,
      accessToken,
      refreshToken,
      tokenExpiry,
      metadata,
    } = req.body;

    const account = await prisma.socialMediaAccount.create({
      data: {
        userId: req.user!.id,
        platform: platform as Platform,
        accountId,
        accountName,
        accessToken,
        refreshToken,
        tokenExpiry: tokenExpiry ? new Date(tokenExpiry) : null,
        metadata: metadata || {},
      },
    });

    res.status(201).json(account);
  } catch (error) {
    logger.error('Create social media account error', { error });
    res.status(500).json({ error: 'Failed to create social media account' });
  }
});

router.get('/accounts', authenticateToken, async (req: AuthRequest, res: Response) => {
  try {
    const accounts = await prisma.socialMediaAccount.findMany({
      where: { userId: req.user!.id },
      select: {
        id: true,
        platform: true,
        accountId: true,
        accountName: true,
        isActive: true,
        createdAt: true,
        updatedAt: true,
      },
    });

    res.json(accounts);
  } catch (error) {
    logger.error('Get social media accounts error', { error });
    res.status(500).json({ error: 'Failed to get social media accounts' });
  }
});

router.put('/accounts/:accountId', authenticateToken, async (req: AuthRequest, res: Response) => {
  try {
    const { accountId } = req.params;
    const { accessToken, refreshToken, tokenExpiry, isActive } = req.body;

    const account = await prisma.socialMediaAccount.update({
      where: { id: accountId },
      data: {
        accessToken,
        refreshToken,
        tokenExpiry: tokenExpiry ? new Date(tokenExpiry) : undefined,
        isActive,
      },
    });

    res.json(account);
  } catch (error) {
    logger.error('Update social media account error', { error });
    res.status(500).json({ error: 'Failed to update social media account' });
  }
});

router.delete('/accounts/:accountId', authenticateToken, async (req: AuthRequest, res: Response) => {
  try {
    const { accountId } = req.params;

    await prisma.socialMediaAccount.delete({
      where: { id: accountId },
    });

    res.json({ message: 'Social media account deleted successfully' });
  } catch (error) {
    logger.error('Delete social media account error', { error });
    res.status(500).json({ error: 'Failed to delete social media account' });
  }
});

router.post('/posts', authenticateToken, async (req: AuthRequest, res: Response) => {
  try {
    const {
      videoId,
      socialMediaAccountId,
      platform,
      platformPostId,
      postUrl,
      publishedAt,
    } = req.body;

    const post = await prisma.socialMediaPost.create({
      data: {
        videoId,
        socialMediaAccountId,
        platform: platform as Platform,
        platformPostId,
        postUrl,
        publishedAt: new Date(publishedAt),
      },
    });

    res.status(201).json(post);
  } catch (error) {
    logger.error('Create social media post error', { error });
    res.status(500).json({ error: 'Failed to create social media post' });
  }
});

router.get('/posts/video/:videoId', authenticateToken, async (req: AuthRequest, res: Response) => {
  try {
    const { videoId } = req.params;

    const posts = await prisma.socialMediaPost.findMany({
      where: { videoId },
      include: {
        socialMediaAccount: {
          select: {
            accountName: true,
            platform: true,
          },
        },
        analytics: {
          orderBy: { snapshotAt: 'desc' },
          take: 1,
        },
      },
    });

    res.json(posts);
  } catch (error) {
    logger.error('Get video posts error', { error });
    res.status(500).json({ error: 'Failed to get video posts' });
  }
});

export default router;
