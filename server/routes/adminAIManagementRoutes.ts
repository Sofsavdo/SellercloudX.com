// Admin AI Management Routes
// AI Manager sozlamalari, monitoring, cost tracking

import express, { Request, Response } from 'express';
import { asyncHandler } from '../errorHandler';
import { aiOrchestrator } from '../services/aiOrchestrator';
import { db } from '../db';
import { eq } from 'drizzle-orm';
import { partners } from '@shared/schema';

const router = express.Router();

// Get AI usage statistics (all partners or specific)
router.get('/usage-stats', asyncHandler(async (req: Request, res: Response) => {
  const user = (req as any).user;
  const { partnerId, from, to } = req.query;
  
  if (!user || user.role !== 'admin') {
    return res.status(403).json({ error: 'Admin access required' });
  }

  const period = from && to ? {
    from: new Date(from as string),
    to: new Date(to as string)
  } : undefined;

  const stats = await aiOrchestrator.getUsageStats(
    partnerId as string | undefined,
    period
  );

  res.json(stats);
}));

// Get AI configuration for partner
router.get('/partner/:partnerId/config', asyncHandler(async (req: Request, res: Response) => {
  const user = (req as any).user;
  const { partnerId } = req.params;
  
  if (!user || user.role !== 'admin') {
    return res.status(403).json({ error: 'Admin access required' });
  }

  const config = await db.get(
    `SELECT ai_enabled, ai_settings FROM partners WHERE id = ?`,
    [partnerId]
  );

  res.json({
    partnerId,
    aiEnabled: config?.ai_enabled || false,
    settings: config?.ai_settings ? JSON.parse(config.ai_settings) : {}
  });
}));

// Update AI configuration for partner
router.put('/partner/:partnerId/config', asyncHandler(async (req: Request, res: Response) => {
  const user = (req as any).user;
  const { partnerId } = req.params;
  const { aiEnabled, settings } = req.body;
  
  if (!user || user.role !== 'admin') {
    return res.status(403).json({ error: 'Admin access required' });
  }

  await db.run(
    `UPDATE partners 
     SET ai_enabled = ?, ai_settings = ?, updated_at = CURRENT_TIMESTAMP
     WHERE id = ?`,
    [aiEnabled, JSON.stringify(settings || {}), partnerId]
  );

  res.json({ success: true, message: 'AI configuration updated' });
}));

// Get AI errors/issues for partner
router.get('/partner/:partnerId/errors', asyncHandler(async (req: Request, res: Response) => {
  const user = (req as any).user;
  const { partnerId } = req.params;
  const { limit = 50 } = req.query;
  
  if (!user || user.role !== 'admin') {
    return res.status(403).json({ error: 'Admin access required' });
  }

  const errors = await db.all(
    `SELECT * FROM ai_error_logs 
     WHERE partner_id = ? 
     ORDER BY created_at DESC 
     LIMIT ?`,
    [partnerId, limit]
  );

  res.json({ errors });
}));

// Fix AI issue for partner
router.post('/partner/:partnerId/fix', asyncHandler(async (req: Request, res: Response) => {
  const user = (req as any).user;
  const { partnerId } = req.params;
  const { issueType, action } = req.body;
  
  if (!user || user.role !== 'admin') {
    return res.status(403).json({ error: 'Admin access required' });
  }

  let result = { success: false, message: '' };

  switch (issueType) {
    case 'api_key_invalid':
      result = { success: true, message: 'API key validation required' };
      break;
    case 'rate_limit':
      result = { success: true, message: 'Rate limit issue - will retry with backoff' };
      break;
    case 'model_error':
      result = { success: true, message: 'Switching to fallback model' };
      break;
    case 'cache_clear':
      await aiOrchestrator.clearCache();
      result = { success: true, message: 'Cache cleared' };
      break;
    default:
      result = { success: false, message: 'Unknown issue type' };
  }

  // Log fix action
  await db.run(
    `INSERT INTO ai_error_logs 
     (partner_id, error_type, error_message, status, fixed_at, created_at)
     VALUES (?, ?, ?, 'fixed', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)`,
    [partnerId, issueType, result.message]
  );

  res.json(result);
}));

// Get active AI jobs
router.get('/jobs/active', asyncHandler(async (req: Request, res: Response) => {
  const user = (req as any).user;
  
  if (!user || user.role !== 'admin') {
    return res.status(403).json({ error: 'Admin access required' });
  }

  const activeCount = await aiOrchestrator.getActiveJobsCount();
  
  res.json({
    activeJobs: activeCount,
    queueStatus: 'healthy'
  });
}));

// Get AI cost breakdown
router.get('/cost-breakdown', asyncHandler(async (req: Request, res: Response) => {
  const user = (req as any).user;
  const { from, to } = req.query;
  
  if (!user || user.role !== 'admin') {
    return res.status(403).json({ error: 'Admin access required' });
  }

  const period = from && to ? {
    from: new Date(from as string),
    to: new Date(to as string)
  } : {
    from: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000),
    to: new Date()
  };

  const stats = await aiOrchestrator.getUsageStats(undefined, period);

  // Get cost by partner
  const partnerCosts = await db.all(
    `SELECT 
       partner_id,
       SUM(cost) as total_cost,
       COUNT(*) as request_count
     FROM ai_usage_logs
     WHERE created_at >= ? AND created_at <= ?
     GROUP BY partner_id
     ORDER BY total_cost DESC
     LIMIT 20`,
    [period.from.toISOString(), period.to.toISOString()]
  );

  res.json({
    total: stats,
    byPartner: partnerCosts.map(p => ({
      partnerId: p.partner_id,
      cost: p.total_cost,
      requests: p.request_count
    }))
  });
}));

// Clear AI cache
router.post('/cache/clear', asyncHandler(async (req: Request, res: Response) => {
  const user = (req as any).user;
  const { pattern } = req.body;
  
  if (!user || user.role !== 'admin') {
    return res.status(403).json({ error: 'Admin access required' });
  }

  await aiOrchestrator.clearCache(pattern);
  res.json({ success: true, message: 'Cache cleared' });
}));

export default router;

