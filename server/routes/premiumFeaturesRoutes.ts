import { Router } from 'express';
import { requireAuth } from '../middleware/auth';
import { videoGenerationService } from '../services/videoGenerationService';
import { competitorIntelligence } from '../services/competitorIntelligence';
import { smsService } from '../services/smsService';

const router = Router();

// ==================== VIDEO GENERATION ====================

/**
 * Generate product video
 */
router.post('/video/generate', requireAuth, async (req, res) => {
  try {
    const { productName, description, images, duration } = req.body;

    const result = await videoGenerationService.generateProductVideo({
      productName,
      description,
      images,
      duration
    });

    res.json(result);
  } catch (error: any) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

/**
 * Check video generation status
 */
router.get('/video/status/:taskId', requireAuth, async (req, res) => {
  try {
    const { taskId } = req.params;
    const status = await videoGenerationService.checkVideoStatus(taskId);
    res.json(status);
  } catch (error: any) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

/**
 * Generate social media video
 */
router.post('/video/social', requireAuth, async (req, res) => {
  try {
    const { productName, images, style } = req.body;

    const result = await videoGenerationService.generateSocialVideo({
      productName,
      images,
      style
    });

    res.json(result);
  } catch (error: any) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

// ==================== COMPETITOR INTELLIGENCE ====================

/**
 * Analyze competitors
 */
router.post('/competitor/analyze', requireAuth, async (req, res) => {
  try {
    const { productName, marketplaces } = req.body;

    const analysis = await competitorIntelligence.analyzeCompetitors(
      productName,
      marketplaces
    );

    res.json({
      success: true,
      data: analysis
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

/**
 * Monitor price changes
 */
router.post('/competitor/monitor-price', requireAuth, async (req, res) => {
  try {
    const { productName, currentPrice } = req.body;

    const result = await competitorIntelligence.monitorPriceChanges(
      productName,
      currentPrice
    );

    res.json({
      success: true,
      data: result
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

/**
 * Get trending products
 */
router.get('/competitor/trending/:marketplace', requireAuth, async (req, res) => {
  try {
    const { marketplace } = req.params;

    const trending = await competitorIntelligence.getTrendingProducts(marketplace);

    res.json({
      success: true,
      data: trending
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

/**
 * Analyze keywords
 */
router.post('/competitor/keywords', requireAuth, async (req, res) => {
  try {
    const { productName } = req.body;

    const analysis = await competitorIntelligence.analyzeKeywords(productName);

    res.json({
      success: true,
      data: analysis
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

// ==================== SMS NOTIFICATIONS ====================

/**
 * Send SMS
 */
router.post('/sms/send', requireAuth, async (req, res) => {
  try {
    const { phone, message, provider } = req.body;

    const result = await smsService.sendSMS(phone, message, provider);

    res.json(result);
  } catch (error: any) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

/**
 * Send OTP
 */
router.post('/sms/send-otp', requireAuth, async (req, res) => {
  try {
    const { phone, code } = req.body;

    const result = await smsService.sendOTP(phone, code);

    res.json(result);
  } catch (error: any) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

export default router;
