// AI Marketing Routes
import express, { Request, Response } from 'express';
import { asyncHandler } from '../errorHandler';
import aiMarketingService from '../services/aiMarketingService';

const router = express.Router();

// Optimize SEO
router.post('/seo/optimize', asyncHandler(async (req: Request, res: Response) => {
  const { productId, marketplace } = req.body;
  
  const optimization = await aiMarketingService.optimizeSEO(productId, marketplace);
  res.json(optimization);
}));

// Generate social media post
router.post('/social/post', asyncHandler(async (req: Request, res: Response) => {
  const { productId, platform } = req.body;
  
  const post = await aiMarketingService.generateSocialMediaPost(productId, platform);
  res.json({ post });
}));

// Create marketing campaign
router.post('/campaign', asyncHandler(async (req: Request, res: Response) => {
  const partner = (req as any).partner;
  const campaignData = req.body;
  
  if (!partner) {
    return res.status(401).json({ error: 'Unauthorized' });
  }

  const campaign = await aiMarketingService.createMarketingCampaign(partner.id, campaignData);
  res.json(campaign);
}));

export default router;

