// Marketplace AI Manager Routes
import express, { Request, Response } from 'express';
import { asyncHandler } from '../errorHandler';
import marketplaceAIManager from '../services/marketplaceAIManager';
import marketplaceAnalyticsService from '../services/marketplaceAnalyticsService';

const router = express.Router();

// Auto-respond to marketplace chats
router.post('/chats/auto-respond', asyncHandler(async (req: Request, res: Response) => {
  const partner = (req as any).partner;
  
  if (!partner) {
    return res.status(401).json({ error: 'Unauthorized' });
  }

  const responded = await marketplaceAIManager.autoRespondToMarketplaceChats(partner.id);
  res.json({ success: true, responded });
}));

// Auto-process orders
router.post('/orders/auto-process', asyncHandler(async (req: Request, res: Response) => {
  const partner = (req as any).partner;
  
  if (!partner) {
    return res.status(401).json({ error: 'Unauthorized' });
  }

  const processed = await marketplaceAIManager.autoProcessOrders(partner.id);
  res.json({ success: true, processed });
}));

// Monitor quality index
router.get('/quality-index', asyncHandler(async (req: Request, res: Response) => {
  const partner = (req as any).partner;
  
  if (!partner) {
    return res.status(401).json({ error: 'Unauthorized' });
  }

  const result = await marketplaceAIManager.monitorAndOptimizeQualityIndex(partner.id);
  res.json(result);
}));

// Get marketplace analytics
router.get('/analytics', asyncHandler(async (req: Request, res: Response) => {
  const partner = (req as any).partner;
  const { from, to } = req.query;
  
  if (!partner) {
    return res.status(401).json({ error: 'Unauthorized' });
  }

  const period = {
    from: from ? new Date(from as string) : new Date(Date.now() - 30 * 24 * 60 * 60 * 1000),
    to: to ? new Date(to as string) : new Date(),
  };

  const analytics = await marketplaceAnalyticsService.collectMarketplaceAnalytics(partner.id, period);
  res.json({ analytics });
}));

// Compare marketplaces
router.get('/analytics/compare', asyncHandler(async (req: Request, res: Response) => {
  const partner = (req as any).partner;
  const { from, to } = req.query;
  
  if (!partner) {
    return res.status(401).json({ error: 'Unauthorized' });
  }

  const period = {
    from: from ? new Date(from as string) : new Date(Date.now() - 30 * 24 * 60 * 60 * 1000),
    to: to ? new Date(to as string) : new Date(),
  };

  const comparison = await marketplaceAnalyticsService.compareMarketplaces(partner.id, period);
  res.json(comparison);
}));

// Handle marketplace webhook/notification
router.post('/webhook/:marketplace', asyncHandler(async (req: Request, res: Response) => {
  const { marketplace } = req.params;
  const { partnerId, type, data } = req.body;
  
  if (!partnerId) {
    return res.status(400).json({ error: 'partnerId required' });
  }

  const success = await marketplaceAIManager.handleMarketplaceNotification(
    partnerId,
    marketplace,
    { type, data }
  );

  res.json({ success });
}));

export default router;

