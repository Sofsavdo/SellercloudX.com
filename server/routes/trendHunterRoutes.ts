// Trend Hunter API Routes
// Find profitable product opportunities from global markets

import { Router } from 'express';
import { realTrendHunterService } from '../services/realTrendHunter';

const router = Router();

/**
 * GET /api/trends/opportunities
 * Get top profitable opportunities
 */
router.get('/opportunities', async (req, res) => {
  try {
    const {
      category,
      minProfitMargin,
      maxCompetitors,
      limit,
    } = req.query;
    
    const opportunities = await realTrendHunterService.findProfitableOpportunities({
      category: category as string,
      minProfitMargin: minProfitMargin ? parseInt(minProfitMargin as string) : 30,
      maxCompetitors: maxCompetitors ? parseInt(maxCompetitors as string) : 50,
      limit: limit ? parseInt(limit as string) : 20,
    });
    
    return res.status(200).json({
      success: true,
      count: opportunities.length,
      data: opportunities,
    });
  } catch (error: any) {
    console.error('Trend opportunities error:', error);
    return res.status(500).json({
      success: false,
      error: error.message,
    });
  }
});

/**
 * GET /api/trends/category/:category
 * Get trends by specific category
 */
router.get('/category/:category', async (req, res) => {
  try {
    const { category } = req.params;
    
    const trends = await realTrendHunterService.findProfitableOpportunities({
      category,
      limit: 10,
    });
    
    return res.status(200).json({
      success: true,
      category,
      count: trends.length,
      data: trends,
    });
  } catch (error: any) {
    console.error('Category trends error:', error);
    return res.status(500).json({
      success: false,
      error: error.message,
    });
  }
});

/**
 * GET /api/trends/top
 * Get top opportunities (highest profit potential)
 */
router.get('/top', async (req, res) => {
  try {
    const { limit } = req.query;
    
    const topOpportunities = await realTrendHunterService.findProfitableOpportunities({
      limit: limit ? parseInt(limit as string) : 10,
    });
    
    return res.status(200).json({
      success: true,
      count: topOpportunities.length,
      data: topOpportunities,
    });
  } catch (error: any) {
    console.error('Top opportunities error:', error);
    return res.status(500).json({
      success: false,
      error: error.message,
    });
  }
});

/**
 * GET /api/trends/saved
 * Get previously analyzed trends from database
 */
router.get('/saved', async (req, res) => {
  try {
    const { limit } = req.query;
    
    const savedTrends = await realTrendHunterService.getSavedTrends(
      limit ? parseInt(limit as string) : 50
    );
    
    return res.status(200).json({
      success: true,
      count: savedTrends.length,
      data: savedTrends,
    });
  } catch (error: any) {
    console.error('Saved trends error:', error);
    return res.status(500).json({
      success: false,
      error: error.message,
    });
  }
});

export default router;
