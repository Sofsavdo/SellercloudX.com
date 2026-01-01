import { Router } from 'express';
import { whatsappService } from '../services/whatsappService';
import { requireAuth, requireAdmin } from '../middleware/auth';

const router = Router();

/**
 * Send WhatsApp notification
 */
router.post('/send', requireAuth, async (req, res) => {
  try {
    const { phone, type, data } = req.body;

    if (!phone || !type || !data) {
      return res.status(400).json({
        success: false,
        error: 'Missing required fields'
      });
    }

    const notification = {
      partnerId: req.user!.id,
      phone,
      type,
      data
    };

    await whatsappService.sendNotification(notification);

    res.json({ success: true });
  } catch (error: any) {
    console.error('WhatsApp send error:', error);
    res.status(500).json({
      success: false,
      error: error.message || 'Failed to send notification'
    });
  }
});

/**
 * Send bulk notifications (admin only)
 */
router.post('/send-bulk', requireAdmin, async (req, res) => {
  try {
    const { notifications } = req.body;

    if (!notifications || !Array.isArray(notifications)) {
      return res.status(400).json({
        success: false,
        error: 'Invalid notifications array'
      });
    }

    const results = await whatsappService.sendBulkNotifications(notifications);

    res.json({
      success: true,
      results
    });
  } catch (error: any) {
    console.error('WhatsApp bulk send error:', error);
    res.status(500).json({
      success: false,
      error: error.message || 'Failed to send bulk notifications'
    });
  }
});

/**
 * WhatsApp webhook verification
 */
router.get('/webhook', (req, res) => {
  const mode = req.query['hub.mode'];
  const token = req.query['hub.verify_token'];
  const challenge = req.query['hub.challenge'];

  const verifyToken = process.env.WHATSAPP_VERIFY_TOKEN || 'sellercloudx_verify_token';

  if (mode === 'subscribe' && token === verifyToken) {
    console.log('WhatsApp webhook verified');
    res.status(200).send(challenge);
  } else {
    res.sendStatus(403);
  }
});

/**
 * WhatsApp webhook handler
 */
router.post('/webhook', async (req, res) => {
  try {
    const signature = req.headers['x-hub-signature-256'] as string;
    const body = JSON.stringify(req.body);

    // Verify signature
    if (signature && !whatsappService.verifyWebhookSignature(signature, body)) {
      return res.sendStatus(403);
    }

    // Process webhook
    await whatsappService.handleWebhook(req.body);

    res.sendStatus(200);
  } catch (error) {
    console.error('WhatsApp webhook error:', error);
    res.sendStatus(500);
  }
});

/**
 * Check WhatsApp service status
 */
router.get('/status', requireAuth, (req, res) => {
  res.json({
    enabled: whatsappService.isEnabled()
  });
});

export default router;
