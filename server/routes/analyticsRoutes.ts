// Advanced Analytics Routes
import express, { Request, Response } from 'express';
import { asyncHandler } from '../errorHandler';
import advancedAnalyticsService from '../services/advancedAnalyticsService';

const router = express.Router();

// Sales forecast
router.get('/forecast', asyncHandler(async (req: Request, res: Response) => {
  const partner = (req as any).partner;
  const { period } = req.query;
  
  if (!partner) {
    return res.status(401).json({ error: 'Unauthorized' });
  }

  const forecast = await advancedAnalyticsService.forecastSales(
    partner.id,
    (period as any) || '30days'
  );
  res.json(forecast);
}));

// Customer behavior analysis
router.get('/customer-behavior', asyncHandler(async (req: Request, res: Response) => {
  const partner = (req as any).partner;
  
  if (!partner) {
    return res.status(401).json({ error: 'Unauthorized' });
  }

  const behaviors = await advancedAnalyticsService.analyzeCustomerBehavior(partner.id);
  res.json({ behaviors });
}));

// Predict trends
router.get('/predict-trends', asyncHandler(async (req: Request, res: Response) => {
  const partner = (req as any).partner;
  const { category } = req.query;
  
  if (!partner) {
    return res.status(401).json({ error: 'Unauthorized' });
  }

  const prediction = await advancedAnalyticsService.predictTrends(partner.id, category as string);
  res.json(prediction);
}));

export default router;

