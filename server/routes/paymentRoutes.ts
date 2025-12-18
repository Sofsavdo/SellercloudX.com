import { Router } from 'express';
import { paymentGateway, PaymentProvider } from '../services/paymentGateway';
import { requireAuth } from '../middleware/auth';

const router = Router();

/**
 * Generate payment URL for subscription
 */
router.post('/create-payment', requireAuth, async (req, res) => {
  try {
    const { amount, pricingTier, billingPeriod, provider } = req.body;
    const partnerId = req.user!.id;

    if (!amount || !pricingTier || !billingPeriod || !provider) {
      return res.status(400).json({
        success: false,
        error: 'Missing required fields'
      });
    }

    const result = await paymentGateway.processSubscriptionPayment({
      partnerId,
      amount,
      pricingTier,
      billingPeriod,
      provider: provider as PaymentProvider
    });

    res.json(result);
  } catch (error: any) {
    console.error('Create payment error:', error);
    res.status(500).json({
      success: false,
      error: error.message || 'Payment creation failed'
    });
  }
});

/**
 * Click payment callback
 */
router.post('/callback/click', async (req, res) => {
  try {
    const result = await paymentGateway.verifyClickPayment(req.body);

    if (result.success) {
      res.json({
        click_trans_id: req.body.click_trans_id,
        merchant_trans_id: req.body.merchant_trans_id,
        merchant_prepare_id: result.transactionId,
        error: 0,
        error_note: 'Success'
      });
    } else {
      res.json({
        click_trans_id: req.body.click_trans_id,
        merchant_trans_id: req.body.merchant_trans_id,
        error: -1,
        error_note: result.error || 'Payment failed'
      });
    }
  } catch (error: any) {
    console.error('Click callback error:', error);
    res.json({
      error: -1,
      error_note: 'Internal error'
    });
  }
});

/**
 * Payme payment callback (JSON-RPC)
 */
router.post('/callback/payme', async (req, res) => {
  try {
    const result = await paymentGateway.handlePaymeRequest(req.body);
    res.json(result);
  } catch (error: any) {
    console.error('Payme callback error:', error);
    res.json({
      error: {
        code: -32400,
        message: 'Internal error'
      }
    });
  }
});

/**
 * Verify payment and activate subscription
 */
router.post('/verify/:transactionId', requireAuth, async (req, res) => {
  try {
    const { transactionId } = req.params;
    const result = await paymentGateway.verifyAndActivateSubscription(transactionId);
    res.json(result);
  } catch (error: any) {
    console.error('Verify payment error:', error);
    res.status(500).json({
      success: false,
      error: error.message || 'Verification failed'
    });
  }
});

/**
 * Get payment history
 */
router.get('/history', requireAuth, async (req, res) => {
  try {
    const partnerId = req.user!.id;
    const history = await paymentGateway.getPaymentHistory(partnerId);
    res.json({ success: true, data: history });
  } catch (error: any) {
    console.error('Payment history error:', error);
    res.status(500).json({
      success: false,
      error: error.message || 'Failed to fetch history'
    });
  }
});

/**
 * Request refund
 */
router.post('/refund/:transactionId', requireAuth, async (req, res) => {
  try {
    const { transactionId } = req.params;
    const { reason } = req.body;
    
    const result = await paymentGateway.refundPayment(transactionId, reason);
    res.json(result);
  } catch (error: any) {
    console.error('Refund error:', error);
    res.status(500).json({
      success: false,
      error: error.message || 'Refund failed'
    });
  }
});

export default router;
