import { Router } from 'express';
import { requireAuth } from '../middleware/auth';
import { smartAIManager } from '../services/smartAIManager';
import { trendHunter } from '../services/trendHunter';
import multer from 'multer';
import path from 'path';

const router = Router();

// Configure multer for image uploads
const storage = multer.diskStorage({
  destination: './uploads/products/',
  filename: (req, file, cb) => {
    cb(null, `product-${Date.now()}${path.extname(file.originalname)}`);
  }
});

const upload = multer({
  storage,
  limits: { fileSize: 10 * 1024 * 1024 }, // 10MB
  fileFilter: (req, file, cb) => {
    const allowedTypes = /jpeg|jpg|png|webp/;
    const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase());
    const mimetype = allowedTypes.test(file.mimetype);

    if (extname && mimetype) {
      cb(null, true);
    } else {
      cb(new Error('Only image files are allowed!'));
    }
  }
});

// ==================== SMART AI MANAGER ====================

/**
 * Scan product image and generate complete card
 * Partner only provides: image, quantity, cost price
 */
router.post('/scan-product', requireAuth, upload.single('image'), async (req, res) => {
  try {
    const { quantity, costPrice } = req.body;
    const partnerId = req.user!.id;

    if (!req.file) {
      return res.status(400).json({
        success: false,
        error: 'Image is required'
      });
    }

    if (!quantity || !costPrice) {
      return res.status(400).json({
        success: false,
        error: 'Quantity and cost price are required'
      });
    }

    // Generate image URL
    const imageUrl = `/uploads/products/${req.file.filename}`;

    // Scan and generate complete card
    const card = await smartAIManager.scanAndGenerateCard({
      imageUrl,
      quantity: parseInt(quantity),
      costPrice: parseFloat(costPrice),
      partnerId
    });

    // Get cost stats
    const costStats = smartAIManager.getCostStats();

    res.json({
      success: true,
      data: card,
      costStats: {
        totalCost: `$${costStats.totalCost.toFixed(4)}`,
        cacheHits: costStats.cacheHits,
        savings: `$${costStats.cacheSavings.toFixed(4)}`
      }
    });
  } catch (error: any) {
    console.error('Scan product error:', error);
    res.status(500).json({
      success: false,
      error: error.message || 'Failed to scan product'
    });
  }
});

/**
 * Scan product from URL (no upload needed)
 */
router.post('/scan-product-url', requireAuth, async (req, res) => {
  try {
    const { imageUrl, quantity, costPrice } = req.body;
    const partnerId = req.user!.id;

    if (!imageUrl || !quantity || !costPrice) {
      return res.status(400).json({
        success: false,
        error: 'Image URL, quantity, and cost price are required'
      });
    }

    const card = await smartAIManager.scanAndGenerateCard({
      imageUrl,
      quantity: parseInt(quantity),
      costPrice: parseFloat(costPrice),
      partnerId
    });

    const costStats = smartAIManager.getCostStats();

    res.json({
      success: true,
      data: card,
      costStats: {
        totalCost: `$${costStats.totalCost.toFixed(4)}`,
        cacheHits: costStats.cacheHits,
        savings: `$${costStats.cacheSavings.toFixed(4)}`
      }
    });
  } catch (error: any) {
    console.error('Scan product URL error:', error);
    res.status(500).json({
      success: false,
      error: error.message || 'Failed to scan product'
    });
  }
});

/**
 * Get AI cost statistics
 */
router.get('/cost-stats', requireAuth, (req, res) => {
  const stats = smartAIManager.getCostStats();
  res.json({
    success: true,
    data: {
      totalCost: `$${stats.totalCost.toFixed(4)}`,
      requestCount: stats.requestCount,
      cacheHits: stats.cacheHits,
      averageCost: `$${stats.averageCost.toFixed(4)}`,
      cacheSavings: `$${stats.cacheSavings.toFixed(4)}`,
      cacheHitRate: `${((stats.cacheHits / stats.requestCount) * 100).toFixed(1)}%`
    }
  });
});

// ==================== TREND HUNTER ====================

/**
 * Get trending products
 */
router.get('/trends', requireAuth, async (req, res) => {
  try {
    const { category } = req.query;
    const trends = await trendHunter.analyzeTrends(category as string);

    res.json({
      success: true,
      data: trends
    });
  } catch (error: any) {
    console.error('Get trends error:', error);
    res.status(500).json({
      success: false,
      error: error.message || 'Failed to get trends'
    });
  }
});

/**
 * Find market opportunities
 */
router.get('/opportunities', requireAuth, async (req, res) => {
  try {
    const opportunities = await trendHunter.findOpportunities();

    res.json({
      success: true,
      data: opportunities
    });
  } catch (error: any) {
    console.error('Get opportunities error:', error);
    res.status(500).json({
      success: false,
      error: error.message || 'Failed to get opportunities'
    });
  }
});

/**
 * Predict product success
 */
router.post('/predict-success', requireAuth, async (req, res) => {
  try {
    const { productName, category, costPrice, targetPrice } = req.body;

    if (!productName || !category || !costPrice || !targetPrice) {
      return res.status(400).json({
        success: false,
        error: 'All fields are required'
      });
    }

    const prediction = await trendHunter.predictSuccess({
      productName,
      category,
      costPrice: parseFloat(costPrice),
      targetPrice: parseFloat(targetPrice)
    });

    res.json({
      success: true,
      data: prediction
    });
  } catch (error: any) {
    console.error('Predict success error:', error);
    res.status(500).json({
      success: false,
      error: error.message || 'Failed to predict success'
    });
  }
});

/**
 * Get personalized recommendations
 */
router.get('/recommendations', requireAuth, async (req, res) => {
  try {
    const partnerId = req.user!.id;
    const recommendations = await trendHunter.getRecommendations(partnerId);

    res.json({
      success: true,
      data: recommendations
    });
  } catch (error: any) {
    console.error('Get recommendations error:', error);
    res.status(500).json({
      success: false,
      error: error.message || 'Failed to get recommendations'
    });
  }
});

/**
 * Clear AI cache (admin only)
 */
router.post('/clear-cache', requireAuth, (req, res) => {
  try {
    smartAIManager.clearCache();
    trendHunter.clearCache();

    res.json({
      success: true,
      message: 'Cache cleared successfully'
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      error: error.message || 'Failed to clear cache'
    });
  }
});

export default router;
