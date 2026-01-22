// Price Strategy Routes
import express, { Request, Response } from 'express';
import { asyncHandler } from '../errorHandler';
import priceStrategyService from '../services/priceStrategyService';

const router = express.Router();

// Optimize price
router.post('/optimize', asyncHandler(async (req: Request, res: Response) => {
  const { productId, marketplace, currentPrice } = req.body;
  
  if (!productId || !marketplace || !currentPrice) {
    return res.status(400).json({ error: 'productId, marketplace, currentPrice majburiy' });
  }

  const strategy = await priceStrategyService.optimizePriceRealTime(productId, marketplace, currentPrice);
  res.json(strategy);
}));

// Monitor competitors
router.post('/monitor', asyncHandler(async (req: Request, res: Response) => {
  const { productId, marketplace } = req.body;
  
  const competitors = await priceStrategyService.monitorCompetitorPrices(productId, marketplace);
  res.json({ competitors });
}));

// Adjust price dynamically
router.post('/adjust', asyncHandler(async (req: Request, res: Response) => {
  const { productId, marketplace, newPrice } = req.body;
  
  const success = await priceStrategyService.adjustPriceDynamically(productId, marketplace, newPrice);
  res.json({ success });
}));

export default router;

