// Gamification Routes
import express, { Request, Response } from 'express';
import { asyncHandler } from '../errorHandler';
import gamificationService from '../services/gamificationService';

const router = express.Router();

// Get achievements
router.get('/achievements', asyncHandler(async (req: Request, res: Response) => {
  const partner = (req as any).partner;
  
  if (!partner) {
    return res.status(401).json({ error: 'Unauthorized' });
  }

  const achievements = await gamificationService.getAchievements(partner.id);
  res.json({ achievements });
}));

// Get leaderboard
router.get('/leaderboard', asyncHandler(async (req: Request, res: Response) => {
  const { limit } = req.query;
  
  const leaderboard = await gamificationService.getLeaderboard(parseInt(limit as string) || 10);
  res.json({ leaderboard });
}));

// Get rewards
router.get('/rewards', asyncHandler(async (req: Request, res: Response) => {
  const partner = (req as any).partner;
  
  if (!partner) {
    return res.status(401).json({ error: 'Unauthorized' });
  }

  const rewards = await gamificationService.getRewards(partner.id);
  res.json(rewards);
}));

export default router;

