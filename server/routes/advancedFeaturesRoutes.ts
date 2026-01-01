import { Router } from 'express';
import { requireAuth } from '../middleware/auth';
import { advancedAnalytics } from '../services/advancedAnalytics';
import { affiliateProgram } from '../services/affiliateProgram';

const router = Router();

// ==================== ADVANCED ANALYTICS ====================

/**
 * Get analytics dashboard
 */
router.get('/analytics/dashboard', requireAuth, async (req, res) => {
  try {
    const partnerId = req.user!.id;
    const { startDate, endDate } = req.query;

    const dateRange = {
      start: startDate ? new Date(startDate as string) : new Date(Date.now() - 30 * 24 * 60 * 60 * 1000),
      end: endDate ? new Date(endDate as string) : new Date()
    };

    const dashboard = await advancedAnalytics.getDashboard(partnerId, dateRange);

    res.json({
      success: true,
      data: dashboard
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

/**
 * Predict customer LTV
 */
router.get('/analytics/customer-ltv/:customerId', requireAuth, async (req, res) => {
  try {
    const partnerId = req.user!.id;
    const { customerId } = req.params;

    const prediction = await advancedAnalytics.predictCustomerLTV(partnerId, customerId);

    res.json({
      success: true,
      data: prediction
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

/**
 * Predict churn
 */
router.get('/analytics/churn-prediction', requireAuth, async (req, res) => {
  try {
    const partnerId = req.user!.id;
    const prediction = await advancedAnalytics.predictChurn(partnerId);

    res.json({
      success: true,
      data: prediction
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

/**
 * Analyze seasonal trends
 */
router.get('/analytics/seasonal-trends', requireAuth, async (req, res) => {
  try {
    const partnerId = req.user!.id;
    const trends = await advancedAnalytics.analyzeSeasonalTrends(partnerId);

    res.json({
      success: true,
      data: trends
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

// ==================== AFFILIATE PROGRAM ====================

/**
 * Get affiliate stats
 */
router.get('/affiliate/stats', requireAuth, async (req, res) => {
  try {
    const partnerId = req.user!.id;
    const stats = await affiliateProgram.getAffiliateStats(partnerId);

    res.json({
      success: true,
      data: stats
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

/**
 * Generate affiliate link
 */
router.post('/affiliate/generate-link', requireAuth, async (req, res) => {
  try {
    const partnerId = req.user!.id;
    const { campaign } = req.body;

    const affiliateCode = affiliateProgram.generateAffiliateCode(partnerId);
    const affiliateLink = affiliateProgram.createAffiliateLink(affiliateCode, campaign);

    res.json({
      success: true,
      data: {
        affiliateCode,
        affiliateLink
      }
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

/**
 * Get leaderboard
 */
router.get('/affiliate/leaderboard', requireAuth, async (req, res) => {
  try {
    const { limit } = req.query;
    const leaderboard = await affiliateProgram.getLeaderboard(
      limit ? parseInt(limit as string) : 10
    );

    res.json({
      success: true,
      data: leaderboard
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

/**
 * Get marketing materials
 */
router.get('/affiliate/marketing-materials', requireAuth, async (req, res) => {
  try {
    const partnerId = req.user!.id;
    const materials = await affiliateProgram.generateMarketingMaterials(partnerId);

    res.json({
      success: true,
      data: materials
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

/**
 * Request payout
 */
router.post('/affiliate/request-payout', requireAuth, async (req, res) => {
  try {
    const partnerId = req.user!.id;
    const { amount } = req.body;

    const result = await affiliateProgram.requestPayout(partnerId, amount);

    res.json(result);
  } catch (error: any) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

export default router;
