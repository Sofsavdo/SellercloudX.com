// Subscription & Add-ons Routes

import { Router } from 'express';
import {
  getAddonServices,
  getPartnerSubscriptions,
  subscribeToAddon,
  cancelSubscription,
  getPaymentHistory
} from '../controllers/subscriptionController';

const router = Router();

// Add-on services
router.get('/addons', getAddonServices);

// Partner subscriptions
router.get('/my-subscriptions', getPartnerSubscriptions);
router.post('/subscribe', subscribeToAddon);
router.put('/subscriptions/:id/cancel', cancelSubscription);

// Payment history
router.get('/payments', getPaymentHistory);

// NEW: SaaS Subscription Management
import { db } from '../db';
import { subscriptions } from '../../shared/schema';
import { eq, and } from 'drizzle-orm';
import billingService from '../services/billingService';

// Get current subscription
router.get('/current', async (req, res) => {
  try {
    if (!req.user) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    const subscription = await db.query.subscriptions.findFirst({
      where: and(
        eq(subscriptions.partnerId, req.user.id),
        eq(subscriptions.status, 'active')
      ),
    });

    if (!subscription) {
      return res.status(404).json({ error: 'Subscription not found' });
    }

    res.json(subscription);
  } catch (error) {
    console.error('Get subscription error:', error);
    res.status(500).json({ error: 'Failed to fetch subscription' });
  }
});

// Upgrade subscription
router.post('/upgrade', async (req, res) => {
  try {
    if (!req.user) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    const { newTierId } = req.body;
    const subscriptionId = await billingService.upgradeSubscription(req.user.id, newTierId);

    res.json({ success: true, subscriptionId });
  } catch (error) {
    console.error('Upgrade error:', error);
    res.status(500).json({ error: 'Failed to upgrade' });
  }
});

// Toggle auto-renew
router.put('/auto-renew', async (req, res) => {
  try {
    if (!req.user) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    const { autoRenew } = req.body;
    const subscription = await db.query.subscriptions.findFirst({
      where: and(
        eq(subscriptions.partnerId, req.user.id),
        eq(subscriptions.status, 'active')
      ),
    });

    if (!subscription) {
      return res.status(404).json({ error: 'Subscription not found' });
    }

    await db.update(subscriptions)
      .set({ autoRenew, updatedAt: new Date() })
      .where(eq(subscriptions.id, subscription.id));

    res.json({ success: true, autoRenew });
  } catch (error) {
    console.error('Auto-renew error:', error);
    res.status(500).json({ error: 'Failed to update' });
  }
});

export default router;
