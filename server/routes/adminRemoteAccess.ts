// Admin Remote Access Routes - Admin hamkor kabinetini ochib sozlamalarni amalga oshirish
import express, { Request, Response } from 'express';
import { asyncHandler } from '../errorHandler';
import { db } from '../db';
import { partners, users } from '@shared/schema';
import { eq } from 'drizzle-orm';

const router = express.Router();

// Get partner data for remote access (Admin only)
router.get('/partner/:partnerId', asyncHandler(async (req: Request, res: Response) => {
  const user = (req as any).user;
  const { partnerId } = req.params;
  
  if (!user || user.role !== 'admin') {
    return res.status(403).json({ error: 'Admin access required' });
  }

  try {
    const partner = await db.select()
      .from(partners)
      .where(eq(partners.id, partnerId))
      .limit(1);

    if (partner.length === 0) {
      return res.status(404).json({ error: 'Partner not found' });
    }

    const partnerUser = await db.select()
      .from(users)
      .where(eq(users.id, partner[0].userId))
      .limit(1);

    res.json({
      partner: partner[0],
      user: partnerUser[0] || null,
      accessGranted: true,
      timestamp: new Date().toISOString()
    });
  } catch (error: any) {
    console.error('Remote access error:', error);
    res.status(500).json({ error: error.message });
  }
}));

// Update partner settings remotely (Admin only)
router.put('/partner/:partnerId/settings', asyncHandler(async (req: Request, res: Response) => {
  const user = (req as any).user;
  const { partnerId } = req.params;
  const updates = req.body;
  
  if (!user || user.role !== 'admin') {
    return res.status(403).json({ error: 'Admin access required' });
  }

  try {
    await db.update(partners)
      .set({
        ...updates,
        updatedAt: new Date()
      })
      .where(eq(partners.id, partnerId));

    res.json({
      success: true,
      message: 'Sozlamalar yangilandi',
      timestamp: new Date().toISOString()
    });
  } catch (error: any) {
    console.error('Remote update error:', error);
    res.status(500).json({ error: error.message });
  }
}));

// Get partner products for remote management
router.get('/partner/:partnerId/products', asyncHandler(async (req: Request, res: Response) => {
  const user = (req as any).user;
  const { partnerId } = req.params;
  
  if (!user || user.role !== 'admin') {
    return res.status(403).json({ error: 'Admin access required' });
  }

  try {
    const products = await db.all(
      `SELECT * FROM products WHERE partner_id = ? ORDER BY created_at DESC`,
      [partnerId]
    );

    res.json({ products });
  } catch (error: any) {
    console.error('Get products error:', error);
    res.status(500).json({ error: error.message });
  }
}));

// Update product remotely
router.put('/partner/:partnerId/products/:productId', asyncHandler(async (req: Request, res: Response) => {
  const user = (req as any).user;
  const { partnerId, productId } = req.params;
  const updates = req.body;
  
  if (!user || user.role !== 'admin') {
    return res.status(403).json({ error: 'Admin access required' });
  }

  try {
    await db.run(
      `UPDATE products SET ${Object.keys(updates).map(k => `${k} = ?`).join(', ')}, updated_at = CURRENT_TIMESTAMP WHERE id = ? AND partner_id = ?`,
      [...Object.values(updates), productId, partnerId]
    );

    res.json({
      success: true,
      message: 'Mahsulot yangilandi'
    });
  } catch (error: any) {
    console.error('Update product error:', error);
    res.status(500).json({ error: error.message });
  }
}));

export default router;

