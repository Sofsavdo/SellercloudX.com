import { Router, Request, Response } from 'express';
import { requirePartner } from '../middleware/auth';
import { asyncHandler } from '../errorHandler';
import { db } from '../db';
import { paymentHistory, partners } from '@shared/schema';
import { eq, and, desc } from 'drizzle-orm';

const router = Router();

// Get payment history
router.get('/payment-history', requirePartner, asyncHandler(async (req: Request, res: Response) => {
  const partnerId = req.session.user!.id;

  const [partner] = await db
    .select()
    .from(partners)
    .where(eq(partners.userId, partnerId))
    .limit(1);

  if (!partner) {
    return res.status(404).json({ message: 'Hamkor topilmadi' });
  }

  const payments = await db
    .select()
    .from(paymentHistory)
    .where(eq(paymentHistory.partnerId, partner.id))
    .orderBy(desc(paymentHistory.createdAt))
    .limit(100);

  // Group by month
  const grouped = payments.reduce((acc: any, payment) => {
    const month = new Date(payment.createdAt).toISOString().slice(0, 7);
    if (!acc[month]) {
      acc[month] = {
        month,
        payments: [],
        total: 0
      };
    }
    acc[month].payments.push(payment);
    acc[month].total += parseFloat(payment.amount);
    return acc;
  }, {});

  res.json({
    payments,
    grouped: Object.values(grouped)
  });
}));

export default router;
