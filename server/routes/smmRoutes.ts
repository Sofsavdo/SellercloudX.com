// SMM (Social Media Management) Routes
// Post generation, video generation, scheduling, multi-platform posting

import express, { Request, Response } from 'express';
import { asyncHandler } from '../errorHandler';
import { smmService } from '../services/smmService';
import { videoGenerationService } from '../services/videoGenerationService';

const router = express.Router();

// Generate SMM post
router.post('/generate-post', asyncHandler(async (req: Request, res: Response) => {
  const {
    content,
    platform,
    postType,
    images,
    video,
    hashtags,
    mentions,
    scheduledTime,
    language,
  } = req.body;

  if (!content || !platform) {
    return res.status(400).json({ error: 'Content va platform talab qilinadi' });
  }

  const post = await smmService.generatePost({
    content,
    platform,
    postType: postType || 'text',
    images,
    video,
    hashtags,
    mentions,
    scheduledTime: scheduledTime ? new Date(scheduledTime) : undefined,
    language: language || 'uz',
  });

  res.json({ success: true, post });
}));

// Create SMM campaign
router.post('/campaigns', asyncHandler(async (req: Request, res: Response) => {
  const {
    name,
    description,
    platforms,
    posts,
    startDate,
    endDate,
  } = req.body;

  if (!name || !platforms || !posts || !startDate || !endDate) {
    return res.status(400).json({ error: 'Barcha maydonlar talab qilinadi' });
  }

  const campaign = await smmService.createCampaign(
    name,
    description,
    platforms,
    posts,
    new Date(startDate),
    new Date(endDate)
  );

  res.json({ success: true, campaign });
}));

// Get all campaigns
router.get('/campaigns', asyncHandler(async (req: Request, res: Response) => {
  const campaigns = smmService.getCampaigns();
  res.json({ success: true, campaigns });
}));

// Get campaign by ID
router.get('/campaigns/:id', asyncHandler(async (req: Request, res: Response) => {
  const { id } = req.params;
  const campaign = smmService.getCampaign(id);

  if (!campaign) {
    return res.status(404).json({ error: 'Campaign topilmadi' });
  }

  res.json({ success: true, campaign });
}));

// Schedule post
router.post('/posts/:id/schedule', asyncHandler(async (req: Request, res: Response) => {
  const { id } = req.params;
  const { scheduledTime } = req.body;

  if (!scheduledTime) {
    return res.status(400).json({ error: 'Scheduled time talab qilinadi' });
  }

  const post = await smmService.schedulePost(id, new Date(scheduledTime));
  res.json({ success: true, post });
}));

// Publish post
router.post('/posts/:id/publish', asyncHandler(async (req: Request, res: Response) => {
  const { id } = req.params;
  const post = await smmService.publishPost(id);
  res.json({ success: true, post });
}));

// Get platform analytics
router.get('/analytics/:platform', asyncHandler(async (req: Request, res: Response) => {
  const { platform } = req.params;
  const { startDate, endDate } = req.query;

  if (!startDate || !endDate) {
    return res.status(400).json({ error: 'Start date va end date talab qilinadi' });
  }

  const analytics = await smmService.getPlatformAnalytics(
    platform,
    new Date(startDate as string),
    new Date(endDate as string)
  );

  res.json({ success: true, analytics });
}));

// Generate video for product
router.post('/generate-video', asyncHandler(async (req: Request, res: Response) => {
  const {
    productName,
    productDescription,
    productCategory,
    targetMarketplace,
    duration,
    aspectRatio,
    style,
    language,
  } = req.body;

  if (!productName || !productDescription) {
    return res.status(400).json({ error: 'Product name va description talab qilinadi' });
  }

  if (!videoGenerationService.isEnabled()) {
    return res.status(503).json({ error: 'Video generation service is not enabled' });
  }

  const video = await videoGenerationService.generateProductVideo({
    productName,
    productDescription,
    productCategory,
    targetMarketplace,
    duration: duration || 15,
    aspectRatio: aspectRatio || '16:9',
    style: style || 'product_showcase',
    language: language || 'uz',
    includeText: true,
    music: true,
  });

  res.json({ success: true, video });
}));

// Get available video providers
router.get('/video/providers', asyncHandler(async (req: Request, res: Response) => {
  const providers = videoGenerationService.getAvailableProviders();
  res.json({ success: true, providers, enabled: videoGenerationService.isEnabled() });
}));

export default router;

