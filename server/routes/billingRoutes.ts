import { Router } from 'express';
import { db } from '../db';
import { invoices, payments, subscriptions, commissionRecords, partners } from '../../shared/schema';
import { eq, and, gte, lte, desc } from 'drizzle-orm';
import billingService from '../services/billingService';
import emailService from '../services/emailService';

const router = Router();

// ==================== INVOICES ====================

// Get all invoices (admin)
router.get('/admin/invoices', async (req, res) => {
  try {
    const allInvoices = await db.query.invoices.findMany({
      orderBy: [desc(invoices.createdAt)],
      with: {
        partner: {
          columns: {
            id: true,
            businessName: true,
            fullName: true,
            email: true,
          },
        },
      },
    });

    res.json(allInvoices);
  } catch (error) {
    console.error('Error fetching invoices:', error);
    res.status(500).json({ error: 'Failed to fetch invoices' });
  }
});

// Get partner invoices
router.get('/partner/invoices', async (req, res) => {
  try {
    const partnerId = req.user?.id;
    if (!partnerId) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    const partnerInvoices = await db.query.invoices.findMany({
      where: eq(invoices.partnerId, partnerId),
      orderBy: [desc(invoices.createdAt)],
    });

    res.json(partnerInvoices);
  } catch (error) {
    console.error('Error fetching partner invoices:', error);
    res.status(500).json({ error: 'Failed to fetch invoices' });
  }
});

// Get invoice by ID
router.get('/invoices/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const invoice = await db.query.invoices.findFirst({
      where: eq(invoices.id, id),
      with: {
        partner: {
          columns: {
            id: true,
            businessName: true,
            fullName: true,
            email: true,
          },
        },
      },
    });

    if (!invoice) {
      return res.status(404).json({ error: 'Invoice not found' });
    }

    // Check authorization
    if (req.user?.role !== 'admin' && invoice.partnerId !== req.user?.id) {
      return res.status(403).json({ error: 'Forbidden' });
    }

    res.json(invoice);
  } catch (error) {
    console.error('Error fetching invoice:', error);
    res.status(500).json({ error: 'Failed to fetch invoice' });
  }
});

// ==================== PAYMENTS ====================

// Get all payments (admin)
router.get('/admin/payments', async (req, res) => {
  try {
    const allPayments = await db.query.payments.findMany({
      orderBy: [desc(payments.createdAt)],
      with: {
        partner: {
          columns: {
            id: true,
            businessName: true,
            fullName: true,
            email: true,
          },
        },
        invoice: true,
      },
    });

    res.json(allPayments);
  } catch (error) {
    console.error('Error fetching payments:', error);
    res.status(500).json({ error: 'Failed to fetch payments' });
  }
});

// Get partner payments
router.get('/partner/payments', async (req, res) => {
  try {
    const partnerId = req.user?.id;
    if (!partnerId) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    const partnerPayments = await db.query.payments.findMany({
      where: eq(payments.partnerId, partnerId),
      orderBy: [desc(payments.createdAt)],
      with: {
        invoice: true,
      },
    });

    res.json(partnerPayments);
  } catch (error) {
    console.error('Error fetching partner payments:', error);
    res.status(500).json({ error: 'Failed to fetch payments' });
  }
});

// Record manual payment (admin only)
router.post('/admin/payments/manual', async (req, res) => {
  try {
    if (req.user?.role !== 'admin') {
      return res.status(403).json({ error: 'Admin access required' });
    }

    const { partnerId, invoiceId, amount, paymentMethod, notes } = req.body;

    if (!partnerId || !amount || !paymentMethod) {
      return res.status(400).json({ error: 'Missing required fields' });
    }

    const paymentId = `pay_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

    // Create payment record
    await db.insert(payments).values({
      id: paymentId,
      partnerId,
      invoiceId: invoiceId || null,
      amount,
      currency: 'USD',
      paymentMethod,
      status: 'completed',
      notes,
      createdAt: new Date(),
    });

    // Update invoice if provided
    if (invoiceId) {
      await db.update(invoices)
        .set({
          status: 'paid',
          paidAt: new Date(),
          updatedAt: new Date(),
        })
        .where(eq(invoices.id, invoiceId));

      // Reactivate subscription if suspended
      const invoice = await db.query.invoices.findFirst({
        where: eq(invoices.id, invoiceId),
      });

      if (invoice?.subscriptionId) {
        await db.update(subscriptions)
          .set({
            status: 'active',
            updatedAt: new Date(),
          })
          .where(eq(subscriptions.id, invoice.subscriptionId));
      }
    }

    // Send payment confirmation email
    const partner = await db.query.partners.findFirst({
      where: eq(partners.id, partnerId),
    });

    if (partner?.email) {
      await emailService.sendPaymentReceived(
        partner.email,
        partner.businessName || partner.fullName || 'Partner',
        invoiceId || 'N/A',
        amount,
        paymentMethod
      );
    }

    res.json({ success: true, paymentId });
  } catch (error) {
    console.error('Error recording payment:', error);
    res.status(500).json({ error: 'Failed to record payment' });
  }
});

// ==================== COMMISSIONS ====================

// Get all commissions (admin)
router.get('/admin/commissions', async (req, res) => {
  try {
    const allCommissions = await db.query.commissionRecords.findMany({
      orderBy: [desc(commissionRecords.createdAt)],
      with: {
        partner: {
          columns: {
            id: true,
            businessName: true,
            fullName: true,
            email: true,
          },
        },
      },
    });

    res.json(allCommissions);
  } catch (error) {
    console.error('Error fetching commissions:', error);
    res.status(500).json({ error: 'Failed to fetch commissions' });
  }
});

// Get partner commissions
router.get('/partner/commissions', async (req, res) => {
  try {
    const partnerId = req.user?.id;
    if (!partnerId) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    const partnerCommissions = await db.query.commissionRecords.findMany({
      where: eq(commissionRecords.partnerId, partnerId),
      orderBy: [desc(commissionRecords.createdAt)],
    });

    res.json(partnerCommissions);
  } catch (error) {
    console.error('Error fetching partner commissions:', error);
    res.status(500).json({ error: 'Failed to fetch commissions' });
  }
});

// ==================== BILLING SUMMARY ====================

// Get billing summary (admin)
router.get('/admin/billing/summary', async (req, res) => {
  try {
    const { startDate, endDate } = req.query;

    const start = startDate ? new Date(startDate as string) : new Date(new Date().getFullYear(), new Date().getMonth(), 1);
    const end = endDate ? new Date(endDate as string) : new Date();

    // Total revenue
    const paidInvoices = await db.query.invoices.findMany({
      where: and(
        eq(invoices.status, 'paid'),
        gte(invoices.paidAt, start),
        lte(invoices.paidAt, end)
      ),
    });

    const totalRevenue = paidInvoices.reduce((sum, inv) => sum + inv.amount, 0);

    // Pending invoices
    const pendingInvoices = await db.query.invoices.findMany({
      where: eq(invoices.status, 'pending'),
    });

    const totalPending = pendingInvoices.reduce((sum, inv) => sum + inv.amount, 0);

    // Total commissions
    const commissions = await db.query.commissionRecords.findMany({
      where: and(
        gte(commissionRecords.createdAt, start),
        lte(commissionRecords.createdAt, end)
      ),
    });

    const totalCommissions = commissions.reduce((sum, comm) => sum + comm.amount, 0);

    // Monthly breakdown
    const monthlyData = paidInvoices.reduce((acc, inv) => {
      const month = inv.paidAt?.toISOString().substring(0, 7) || '';
      if (!acc[month]) {
        acc[month] = 0;
      }
      acc[month] += inv.amount;
      return acc;
    }, {} as Record<string, number>);

    res.json({
      totalRevenue,
      totalPending,
      totalCommissions,
      paidInvoicesCount: paidInvoices.length,
      pendingInvoicesCount: pendingInvoices.length,
      monthlyData,
    });
  } catch (error) {
    console.error('Error fetching billing summary:', error);
    res.status(500).json({ error: 'Failed to fetch billing summary' });
  }
});

// Get partner billing summary
router.get('/partner/billing/summary', async (req, res) => {
  try {
    const partnerId = req.user?.id;
    if (!partnerId) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    // Total paid
    const paidInvoices = await db.query.invoices.findMany({
      where: and(
        eq(invoices.partnerId, partnerId),
        eq(invoices.status, 'paid')
      ),
    });

    const totalPaid = paidInvoices.reduce((sum, inv) => sum + inv.amount, 0);

    // Total pending
    const pendingInvoices = await db.query.invoices.findMany({
      where: and(
        eq(invoices.partnerId, partnerId),
        eq(invoices.status, 'pending')
      ),
    });

    const totalPending = pendingInvoices.reduce((sum, inv) => sum + inv.amount, 0);

    // Total commissions
    const commissions = await db.query.commissionRecords.findMany({
      where: eq(commissionRecords.partnerId, partnerId),
    });

    const totalCommissions = commissions.reduce((sum, comm) => sum + comm.amount, 0);

    // Current subscription
    const subscription = await db.query.subscriptions.findFirst({
      where: and(
        eq(subscriptions.partnerId, partnerId),
        eq(subscriptions.status, 'active')
      ),
    });

    res.json({
      totalPaid,
      totalPending,
      totalCommissions,
      paidInvoicesCount: paidInvoices.length,
      pendingInvoicesCount: pendingInvoices.length,
      subscription,
    });
  } catch (error) {
    console.error('Error fetching partner billing summary:', error);
    res.status(500).json({ error: 'Failed to fetch billing summary' });
  }
});

// ==================== EXPORT ====================

// Export invoices to CSV (admin)
router.get('/admin/invoices/export', async (req, res) => {
  try {
    if (req.user?.role !== 'admin') {
      return res.status(403).json({ error: 'Admin access required' });
    }

    const allInvoices = await db.query.invoices.findMany({
      orderBy: [desc(invoices.createdAt)],
      with: {
        partner: {
          columns: {
            businessName: true,
            fullName: true,
            email: true,
          },
        },
      },
    });

    // Create CSV
    const csv = [
      'Invoice ID,Partner,Email,Amount,Currency,Status,Due Date,Paid At,Created At',
      ...allInvoices.map(inv => [
        inv.id,
        inv.partner?.businessName || inv.partner?.fullName || 'N/A',
        inv.partner?.email || 'N/A',
        inv.amount,
        inv.currency,
        inv.status,
        inv.dueDate.toISOString(),
        inv.paidAt?.toISOString() || 'N/A',
        inv.createdAt.toISOString(),
      ].join(','))
    ].join('\n');

    res.setHeader('Content-Type', 'text/csv');
    res.setHeader('Content-Disposition', 'attachment; filename=invoices.csv');
    res.send(csv);
  } catch (error) {
    console.error('Error exporting invoices:', error);
    res.status(500).json({ error: 'Failed to export invoices' });
  }
});

export default router;
