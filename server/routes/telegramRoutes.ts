import { Router } from 'express';
import { telegramBot } from '../services/telegramBot';
import { requireAuth } from '../middleware/auth';

const router = Router();

/**
 * Telegram webhook
 */
router.post('/webhook', async (req, res) => {
  try {
    await telegramBot.handleUpdate(req.body);
    res.sendStatus(200);
  } catch (error) {
    console.error('Telegram webhook error:', error);
    res.sendStatus(500);
  }
});

/**
 * Send notification to user
 */
router.post('/send', requireAuth, async (req, res) => {
  try {
    const { chatId, message } = req.body;

    if (!chatId || !message) {
      return res.status(400).json({
        success: false,
        error: 'Missing required fields'
      });
    }

    await telegramBot.sendTextMessage(chatId, message);

    res.json({ success: true });
  } catch (error: any) {
    console.error('Telegram send error:', error);
    res.status(500).json({
      success: false,
      error: error.message || 'Failed to send message'
    });
  }
});

/**
 * Check bot status
 */
router.get('/status', requireAuth, (req, res) => {
  res.json({
    enabled: telegramBot.isEnabled()
  });
});

export default router;
