/**
 * MXIK Code API Routes
 * Search and validate MXIK codes for Uzbekistan tax compliance
 */

import { Router, Request, Response } from 'express';
import mxikService from '../services/mxikService';

const router = Router();

/**
 * GET /api/mxik/search?q=product_name&lang=uz
 * Search MXIK codes by product name
 */
router.get('/search', async (req: Request, res: Response) => {
  try {
    const { q, lang = 'uz' } = req.query;

    if (!q || typeof q !== 'string') {
      return res.status(400).json({
        success: false,
        error: 'Query parameter "q" is required'
      });
    }

    const results = mxikService.searchMxikCode(q, lang as 'uz' | 'ru');

    res.json({
      success: true,
      query: q,
      language: lang,
      count: results.length,
      results
    });
  } catch (error: any) {
    console.error('MXIK search error:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

/**
 * GET /api/mxik/best-match?q=product_name&category=category
 * Get best MXIK match for product
 */
router.get('/best-match', async (req: Request, res: Response) => {
  try {
    const { q, category } = req.query;

    if (!q || typeof q !== 'string') {
      return res.status(400).json({
        success: false,
        error: 'Query parameter "q" is required'
      });
    }

    const result = mxikService.getBestMxikCode(q, category as string);

    res.json({
      success: true,
      query: q,
      category: category || null,
      match: result
    });
  } catch (error: any) {
    console.error('MXIK best-match error:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

/**
 * GET /api/mxik/validate/:code
 * Validate MXIK code format and existence
 */
router.get('/validate/:code', async (req: Request, res: Response) => {
  try {
    const { code } = req.params;

    const isValidFormat = mxikService.validateMxikCode(code);
    const details = isValidFormat ? mxikService.getMxikByCode(code) : null;

    res.json({
      success: true,
      code,
      isValidFormat,
      exists: !!details,
      details
    });
  } catch (error: any) {
    console.error('MXIK validate error:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

/**
 * GET /api/mxik/code/:code
 * Get MXIK code details
 */
router.get('/code/:code', async (req: Request, res: Response) => {
  try {
    const { code } = req.params;

    const details = mxikService.getMxikByCode(code);

    if (!details) {
      return res.status(404).json({
        success: false,
        error: 'MXIK code not found'
      });
    }

    res.json({
      success: true,
      data: details
    });
  } catch (error: any) {
    console.error('MXIK code error:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

/**
 * GET /api/mxik/status
 * Get MXIK database status
 */
router.get('/status', async (req: Request, res: Response) => {
  try {
    const status = mxikService.getMxikStatus();

    res.json({
      success: true,
      ...status
    });
  } catch (error: any) {
    console.error('MXIK status error:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

/**
 * POST /api/mxik/reload
 * Reload MXIK database from file
 */
router.post('/reload', async (req: Request, res: Response) => {
  try {
    const filePath = req.body.filePath || '/app/server/data/mxik_codes.json';
    const success = await mxikService.loadMxikDatabase(filePath);
    const status = mxikService.getMxikStatus();

    res.json({
      success,
      message: success ? 'MXIK database reloaded' : 'Failed to reload',
      ...status
    });
  } catch (error: any) {
    console.error('MXIK reload error:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

export default router;
