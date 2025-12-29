// Payment Integration Routes - Click, Payme, Uzcard
import { Router } from 'express';
import crypto from 'crypto';
import { db } from '../db';
import { payments, invoices, subscriptions } from '../../shared/schema';
import { eq, and } from 'drizzle-orm';

const router = Router();

// ==================== CLICK INTEGRATION ====================

// Click configuration
const CLICK_CONFIG = {
  merchantId: process.env.CLICK_MERCHANT_ID || '',
  serviceId: process.env.CLICK_SERVICE_ID || '',
  secretKey: process.env.CLICK_SECRET_KEY || '',
};

// Click signature verification
function verifyClickSignature(params: any): boolean {
  const {
    click_trans_id,
    service_id,
    merchant_trans_id,
    amount,
    action,
    sign_time,
    sign_string,
  } = params;

  const signString = `${click_trans_id}${service_id}${CLICK_CONFIG.secretKey}${merchant_trans_id}${amount}${action}${sign_time}`;
  const hash = crypto.createHash('md5').update(signString).digest('hex');

  return hash === sign_string;
}

// Click Prepare - Step 1
router.post('/click/prepare', async (req, res) => {
  try {
    const {
      click_trans_id,
      service_id,
      merchant_trans_id,
      amount,
      action,
      sign_time,
      sign_string,
    } = req.body;

    console.log('Click Prepare:', req.body);

    // Verify signature
    if (!verifyClickSignature(req.body)) {
      return res.json({
        error: -1,
        error_note: 'Invalid signature',
      });
    }

    // Check if invoice exists
    const invoice = await db.query.invoices.findFirst({
      where: eq(invoices.id, merchant_trans_id),
    });

    if (!invoice) {
      return res.json({
        error: -5,
        error_note: 'Invoice not found',
      });
    }

    // Check if already paid
    // Import referral first purchase service
    const { checkAndProcessFirstPurchase } = await import('../services/referralFirstPurchaseService');
    
    if (invoice.status === 'paid') {
      // Check and process referral first purchase
      try {
        await checkAndProcessFirstPurchase(
          invoice.partnerId,
          invoice.subscriptionId || undefined,
          invoice.id,
          payment.id
        );
      } catch (refError) {
        console.error('Referral first purchase processing error:', refError);
        // Don't fail payment if referral processing fails
      }
      return res.json({
        error: -4,
        error_note: 'Already paid',
      });
    }

    // Check amount
    if (parseFloat(amount) !== invoice.amount) {
      return res.json({
        error: -2,
        error_note: 'Invalid amount',
      });
    }

    // Create payment record
    const paymentId = `pay_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    
    await db.insert(payments).values({
      id: paymentId,
      invoiceId: invoice.id,
      partnerId: invoice.partnerId,
      amount: invoice.amount,
      currency: invoice.currency || 'USD',
      paymentMethod: 'click',
      transactionId: click_trans_id.toString(),
      status: 'pending',
      metadata: JSON.stringify(req.body),
      createdAt: new Date(),
    });

    return res.json({
      click_trans_id,
      merchant_trans_id,
      merchant_prepare_id: paymentId,
      error: 0,
      error_note: 'Success',
    });
  } catch (error) {
    console.error('Click Prepare Error:', error);
    return res.json({
      error: -9,
      error_note: 'System error',
    });
  }
});

// Click Complete - Step 2
router.post('/click/complete', async (req, res) => {
  try {
    const {
      click_trans_id,
      service_id,
      merchant_trans_id,
      merchant_prepare_id,
      amount,
      action,
      error: click_error,
      sign_time,
      sign_string,
    } = req.body;

    console.log('Click Complete:', req.body);

    // Verify signature
    if (!verifyClickSignature(req.body)) {
      return res.json({
        error: -1,
        error_note: 'Invalid signature',
      });
    }

    // Find payment
    const payment = await db.query.payments.findFirst({
      where: eq(payments.id, merchant_prepare_id),
    });

    if (!payment) {
      return res.json({
        error: -6,
        error_note: 'Payment not found',
      });
    }

    // If Click returned error
    if (click_error !== 0) {
      await db.update(payments)
        .set({
          status: 'failed',
          metadata: JSON.stringify({ ...req.body, failed_at: new Date() }),
        })
        .where(eq(payments.id, payment.id));

      return res.json({
        error: -9,
        error_note: 'Payment failed',
      });
    }

    // Update payment status
    await db.update(payments)
      .set({
        status: 'completed',
        completedAt: new Date(),
        metadata: JSON.stringify(req.body),
      })
      .where(eq(payments.id, payment.id));

    // Update invoice status
    await db.update(invoices)
      .set({
        status: 'paid',
        paidAt: new Date(),
        paymentMethod: 'click',
      })
      .where(eq(invoices.id, payment.invoiceId));

    // Update subscription if exists
    const invoice = await db.query.invoices.findFirst({
      where: eq(invoices.id, payment.invoiceId),
    });

    if (invoice?.subscriptionId) {
      await db.update(subscriptions)
        .set({
          status: 'active',
          updatedAt: new Date(),
        })
        .where(eq(subscriptions.id, invoice.subscriptionId));
    }

    return res.json({
      click_trans_id,
      merchant_trans_id,
      merchant_confirm_id: payment.id,
      error: 0,
      error_note: 'Success',
    });
  } catch (error) {
    console.error('Click Complete Error:', error);
    return res.json({
      error: -9,
      error_note: 'System error',
    });
  }
});

// ==================== PAYME INTEGRATION ====================

// Payme configuration
const PAYME_CONFIG = {
  merchantId: process.env.PAYME_MERCHANT_ID || '',
  secretKey: process.env.PAYME_SECRET_KEY || '',
};

// Payme authorization check
function verifyPaymeAuth(req: any): boolean {
  const auth = req.headers.authorization;
  if (!auth || !auth.startsWith('Basic ')) return false;

  const credentials = Buffer.from(auth.slice(6), 'base64').toString();
  const [username, password] = credentials.split(':');

  return username === 'Paycom' && password === PAYME_CONFIG.secretKey;
}

// Payme endpoint
router.post('/payme', async (req, res) => {
  try {
    // Verify authorization
    if (!verifyPaymeAuth(req)) {
      return res.json({
        error: {
          code: -32504,
          message: 'Insufficient privilege',
        },
      });
    }

    const { method, params, id } = req.body;

    console.log('Payme Request:', { method, params });

    switch (method) {
      case 'CheckPerformTransaction':
        return await handlePaymeCheckPerformTransaction(params, id, res);
      
      case 'CreateTransaction':
        return await handlePaymeCreateTransaction(params, id, res);
      
      case 'PerformTransaction':
        return await handlePaymePerformTransaction(params, id, res);
      
      case 'CancelTransaction':
        return await handlePaymeCancelTransaction(params, id, res);
      
      case 'CheckTransaction':
        return await handlePaymeCheckTransaction(params, id, res);
      
      default:
        return res.json({
          error: {
            code: -32601,
            message: 'Method not found',
          },
          id,
        });
    }
  } catch (error) {
    console.error('Payme Error:', error);
    return res.json({
      error: {
        code: -32400,
        message: 'System error',
      },
    });
  }
});

async function handlePaymeCheckPerformTransaction(params: any, id: any, res: any) {
  const { account } = params;
  const invoiceId = account.invoice_id;

  const invoice = await db.query.invoices.findFirst({
    where: eq(invoices.id, invoiceId),
  });

  if (!invoice) {
    return res.json({
      error: {
        code: -31050,
        message: 'Invoice not found',
      },
      id,
    });
  }

  if (invoice.status === 'paid') {
    return res.json({
      error: {
        code: -31051,
        message: 'Already paid',
      },
      id,
    });
  }

  return res.json({
    result: {
      allow: true,
    },
    id,
  });
}

async function handlePaymeCreateTransaction(params: any, id: any, res: any) {
  const { account, amount, time } = params;
  const invoiceId = account.invoice_id;

  const invoice = await db.query.invoices.findFirst({
    where: eq(invoices.id, invoiceId),
  });

  if (!invoice) {
    return res.json({
      error: {
        code: -31050,
        message: 'Invoice not found',
      },
      id,
    });
  }

  // Check amount (Payme sends in tiyin, 1 USD = 12000 tiyin)
  const expectedAmount = Math.round(invoice.amount * 12000 * 100); // Convert to tiyin
  if (amount !== expectedAmount) {
    return res.json({
      error: {
        code: -31001,
        message: 'Invalid amount',
      },
      id,
    });
  }

  // Create payment
  const paymentId = `pay_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  
  await db.insert(payments).values({
    id: paymentId,
    invoiceId: invoice.id,
    partnerId: invoice.partnerId,
    amount: invoice.amount,
    currency: invoice.currency || 'USD',
    paymentMethod: 'payme',
    transactionId: params.id,
    status: 'pending',
    metadata: JSON.stringify(params),
    createdAt: new Date(time),
  });

  return res.json({
    result: {
      create_time: time,
      transaction: paymentId,
      state: 1,
    },
    id,
  });
}

async function handlePaymePerformTransaction(params: any, id: any, res: any) {
  const paymentId = params.id;

  const payment = await db.query.payments.findFirst({
    where: eq(payments.transactionId, paymentId),
  });

  if (!payment) {
    return res.json({
      error: {
        code: -31003,
        message: 'Transaction not found',
      },
      id,
    });
  }

  // Update payment
  await db.update(payments)
    .set({
      status: 'completed',
      completedAt: new Date(),
    })
    .where(eq(payments.id, payment.id));

  // Update invoice
  await db.update(invoices)
    .set({
      status: 'paid',
      paidAt: new Date(),
      paymentMethod: 'payme',
    })
    .where(eq(invoices.id, payment.invoiceId));

  return res.json({
    result: {
      transaction: payment.id,
      perform_time: Date.now(),
      state: 2,
    },
    id,
  });
}

async function handlePaymeCancelTransaction(params: any, id: any, res: any) {
  const paymentId = params.id;

  const payment = await db.query.payments.findFirst({
    where: eq(payments.transactionId, paymentId),
  });

  if (!payment) {
    return res.json({
      error: {
        code: -31003,
        message: 'Transaction not found',
      },
      id,
    });
  }

  await db.update(payments)
    .set({
      status: 'cancelled',
    })
    .where(eq(payments.id, payment.id));

  return res.json({
    result: {
      transaction: payment.id,
      cancel_time: Date.now(),
      state: -1,
    },
    id,
  });
}

async function handlePaymeCheckTransaction(params: any, id: any, res: any) {
  const paymentId = params.id;

  const payment = await db.query.payments.findFirst({
    where: eq(payments.transactionId, paymentId),
  });

  if (!payment) {
    return res.json({
      error: {
        code: -31003,
        message: 'Transaction not found',
      },
      id,
    });
  }

  const stateMap: any = {
    pending: 1,
    completed: 2,
    cancelled: -1,
    failed: -2,
  };

  return res.json({
    result: {
      transaction: payment.id,
      state: stateMap[payment.status] || 0,
      create_time: payment.createdAt?.getTime(),
      perform_time: payment.completedAt?.getTime(),
    },
    id,
  });
}

// ==================== MANUAL PAYMENT (Admin) ====================

router.post('/manual', async (req, res) => {
  try {
    const { invoiceId, amount, paymentMethod, notes } = req.body;

    // Verify admin
    if (!req.user || req.user.role !== 'admin') {
      return res.status(403).json({ error: 'Unauthorized' });
    }

    const invoice = await db.query.invoices.findFirst({
      where: eq(invoices.id, invoiceId),
    });

    if (!invoice) {
      return res.status(404).json({ error: 'Invoice not found' });
    }

    const paymentId = `pay_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

    await db.insert(payments).values({
      id: paymentId,
      invoiceId: invoice.id,
      partnerId: invoice.partnerId,
      amount: amount || invoice.amount,
      currency: invoice.currency || 'USD',
      paymentMethod: paymentMethod || 'manual',
      status: 'completed',
      metadata: JSON.stringify({ notes, recorded_by: req.user.id }),
      createdAt: new Date(),
      completedAt: new Date(),
    });

    await db.update(invoices)
      .set({
        status: 'paid',
        paidAt: new Date(),
        paymentMethod: paymentMethod || 'manual',
      })
      .where(eq(invoices.id, invoice.id));

    res.json({ success: true, paymentId });
  } catch (error) {
    console.error('Manual Payment Error:', error);
    res.status(500).json({ error: 'Failed to record payment' });
  }
});

export default router;
