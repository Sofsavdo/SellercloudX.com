// AI Scanner and Manager API Routes
// Endpoints for image scanning and product creation

import { Router } from 'express';
import { aiManager } from '../services/aiManagerV2Service';
import { imageSearchService } from '../services/imageSearchService';
import { requireAuth } from '../middleware/auth';

const router = Router();

/**
 * POST /api/ai/scanner/scan-image
 * Scan product image and get competitor info
 */
router.post('/scanner/scan-image', requireAuth, async (req, res) => {
  try {
    const { imageUrl } = req.body;
    const userId = req.session?.user?.id;
    
    if (!imageUrl) {
      return res.status(400).json({
        success: false,
        error: 'imageUrl majburiy',
      });
    }
    
    // Get partner ID from user
    const { storage } = await import('../storage');
    const partner = await storage.getPartnerByUserId(userId);
    
    if (!partner) {
      return res.status(404).json({
        success: false,
        error: 'Partner topilmadi',
      });
    }
    
    // Scan image
    const result = await aiManager.scanProductImage({
      imageUrl,
      partnerId: partner.id,
    });
    
    return res.status(200).json({
      success: true,
      data: result,
    });
  } catch (error: any) {
    console.error('Image scan error:', error);
    return res.status(500).json({
      success: false,
      error: error.message,
    });
  }
});

/**
 * POST /api/ai/manager/create-product
 * Create product on marketplace with optimized price
 */
router.post('/manager/create-product', requireAuth, async (req, res) => {
  try {
    const {
      marketplace,
      productData,
      priceOptimization,
      taskId,
    } = req.body;
    
    const userId = req.session?.user?.id;
    
    // Validate required fields
    if (!marketplace || !productData) {
      return res.status(400).json({
        success: false,
        error: 'marketplace va productData majburiy',
      });
    }
    
    if (!productData.name || !productData.description || !productData.images || !productData.costPrice) {
      return res.status(400).json({
        success: false,
        error: 'name, description, images, costPrice majburiy',
      });
    }
    
    // Get partner ID
    const { storage } = await import('../storage');
    const partner = await storage.getPartnerByUserId(userId);
    
    if (!partner) {
      return res.status(404).json({
        success: false,
        error: 'Partner topilmadi',
      });
    }
    
    // Create product
    const result = await aiManager.createProductOnMarketplace({
      partnerId: partner.id,
      marketplace,
      productData,
      priceOptimization,
      taskId,
    });
    
    return res.status(result.success ? 200 : 400).json({
      success: result.success,
      data: result,
    });
  } catch (error: any) {
    console.error('Product creation error:', error);
    return res.status(500).json({
      success: false,
      error: error.message,
    });
  }
});

/**
 * GET /api/ai/status
 * Check AI services status
 */
router.get('/status', async (req, res) => {
  try {
    const imageSearchStatus = imageSearchService.getStatus();
    const aiServiceStatus = (await import('../services/realAIService')).realAIService.getStatus();
    
    return res.status(200).json({
      success: true,
      services: {
        imageSearch: imageSearchStatus,
        aiGeneration: aiServiceStatus,
      },
    });
  } catch (error: any) {
    return res.status(500).json({
      success: false,
      error: error.message,
    });
  }
});

export default router;
