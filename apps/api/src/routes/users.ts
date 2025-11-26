import { Router } from 'express';
import { prisma } from '@ai-video-saas/database';
import { authenticateToken, AuthRequest } from '../middleware/auth';
import { asyncHandler } from '../utils/asyncHandler';

const router = Router();

router.get(
  '/me',
  authenticateToken,
  asyncHandler(async (req: AuthRequest, res) => {
    const user = await prisma.user.findUnique({
      where: { id: req.userId },
      select: {
        id: true,
        email: true,
        name: true,
        createdAt: true,
        updatedAt: true,
      },
    });

    res.json(user);
  })
);

export default router;
