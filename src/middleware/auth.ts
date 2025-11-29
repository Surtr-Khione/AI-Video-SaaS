import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { config } from '../config';
import prisma from '../lib/prisma';

export interface AuthRequest extends Request {
  user?: {
    id: string;
    email: string;
  };
}

export async function authenticateToken(
  req: AuthRequest,
  res: Response,
  next: NextFunction
): Promise<void> {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) {
    res.status(401).json({ error: 'Access token required' });
    return;
  }

  try {
    const decoded = jwt.verify(token, config.jwtSecret) as any;
    req.user = { id: decoded.userId, email: decoded.email };
    next();
  } catch (error) {
    res.status(403).json({ error: 'Invalid or expired token' });
  }
}

export async function authenticateApiKey(
  req: AuthRequest,
  res: Response,
  next: NextFunction
): Promise<void> {
  const apiKey = req.headers['x-api-key'] as string;

  if (!apiKey) {
    res.status(401).json({ error: 'API key required' });
    return;
  }

  try {
    const keyRecord = await prisma.apiKey.findUnique({
      where: { key: apiKey },
      include: { user: true },
    });

    if (!keyRecord) {
      res.status(403).json({ error: 'Invalid API key' });
      return;
    }

    await prisma.apiKey.update({
      where: { id: keyRecord.id },
      data: { lastUsed: new Date() },
    });

    req.user = { id: keyRecord.userId, email: keyRecord.user.email };
    next();
  } catch (error) {
    res.status(500).json({ error: 'Authentication error' });
  }
}

export function optionalAuth(
  req: AuthRequest,
  res: Response,
  next: NextFunction
): void {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) {
    next();
    return;
  }

  try {
    const decoded = jwt.verify(token, config.jwtSecret) as any;
    req.user = { id: decoded.userId, email: decoded.email };
  } catch (error) {
  }

  next();
}
