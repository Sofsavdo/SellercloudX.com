// Inventory Management Routes
import express, { Request, Response } from 'express';
import { asyncHandler } from '../errorHandler';
import inventoryManagementService from '../services/inventoryManagementService';

const router = express.Router();

// Check inventory levels
router.get('/check', asyncHandler(async (req: Request, res: Response) => {
  const partner = (req as any).partner;
  
  if (!partner) {
    return res.status(401).json({ error: 'Unauthorized' });
  }

  const alerts = await inventoryManagementService.checkInventoryLevels(partner.id);
  res.json({ alerts });
}));

// Calculate reorder point
router.get('/reorder-point/:productId', asyncHandler(async (req: Request, res: Response) => {
  const { productId } = req.params;
  
  const reorderData = await inventoryManagementService.calculateReorderPoint(productId);
  res.json(reorderData);
}));

// Auto-reorder
router.post('/auto-reorder/:productId', asyncHandler(async (req: Request, res: Response) => {
  const { productId } = req.params;
  
  const success = await inventoryManagementService.autoReorder(productId);
  res.json({ success });
}));

export default router;
