import { Router, Request, Response } from 'express';
import { requirePartner } from '../middleware/auth';
import { asyncHandler } from '../errorHandler';
import { db } from '../db';
import { walletTransactions, partners } from '@shared/schema';
import { eq, and, desc, sql } from 'drizzle-orm';
import { nanoid } from 'nanoid';

const router = Router();

// Get partner wallet balance and transactions
router.get('/wallet', requirePartner, asyncHandler(async (req: Request, res: Response) => {
  const partnerId = req.session.user!.id;

  // Get partner data
  const [partner] = await db
    .select()
    .from(partners)
    .where(eq(partners.userId, partnerId))
    .limit(1);

  if (!partner) {
    return res.status(404).json({ message: 'Hamkor topilmadi' });
  }

  // Calculate balances from transactions
  const transactions = await db
    .select()
    .from(walletTransactions)
    .where(eq(walletTransactions.partnerId, partner.id))
    .orderBy(desc(walletTransactions.createdAt))
    .limit(50);

  // Calculate totals
  const balance = transactions
    .filter(t => t.status === 'completed' && (t.type === 'income' || t.type === 'commission'))
    .reduce((sum, t) => sum + parseFloat(t.amount), 0) -
    transactions
      .filter(t => t.status === 'completed' && (t.type === 'expense' || t.type === 'withdrawal'))
      .reduce((sum, t) => sum + parseFloat(t.amount), 0);

  const pending = transactions
    .filter(t => t.status === 'pending' && (t.type === 'income' || t.type === 'commission'))
    .reduce((sum, t) => sum + parseFloat(t.amount), 0);

  const totalEarned = transactions
    .filter(t => t.status === 'completed' && (t.type === 'income' || t.type === 'commission'))
    .reduce((sum, t) => sum + parseFloat(t.amount), 0);

  res.json({
    balance: balance.toFixed(2),
    pending: pending.toFixed(2),
    totalEarned: totalEarned.toFixed(2),
    transactions: transactions.slice(0, 20) // Last 20 transactions
  });
}));

// Request withdrawal
router.post('/wallet/withdraw', requirePartner, asyncHandler(async (req: Request, res: Response) => {
  const partnerId = req.session.user!.id;
  const { amount, method, accountInfo } = req.body;

  if (!amount || amount <= 0) {
    return res.status(400).json({ message: "Noto'g'ri summa" });
  }

  // Get partner
  const [partner] = await db
    .select()
    .from(partners)
    .where(eq(partners.userId, partnerId))
    .limit(1);

  if (!partner) {
    return res.status(404).json({ message: 'Hamkor topilmadi' });
  }

  // Calculate available balance
  const transactions = await db
    .select()
    .from(walletTransactions)
    .where(eq(walletTransactions.partnerId, partner.id));

  const balance = transactions
    .filter(t => t.status === 'completed' && (t.type === 'income' || t.type === 'commission'))
    .reduce((sum, t) => sum + parseFloat(t.amount), 0) -
    transactions
      .filter(t => t.status === 'completed' && (t.type === 'expense' || t.type === 'withdrawal'))
      .reduce((sum, t) => sum + parseFloat(t.amount), 0);

  if (balance < amount) {
    return res.status(400).json({ message: 'Balans yetarli emas' });
  }

  // Create withdrawal transaction
  const transaction = {
    id: nanoid(),
    partnerId: partner.id,
    type: 'withdrawal' as const,
    amount: amount.toString(),
    description: `Yechib olish: ${method}`,
    status: 'pending' as const,
    metadata: JSON.stringify({ method, accountInfo }),
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  };

  await db.insert(walletTransactions).values(transaction);

  res.json({
    message: "So'rov yuborildi",
    transaction
  });
}));

// Get transaction history with filters
router.get('/transactions', requirePartner, asyncHandler(async (req: Request, res: Response) => {
  const partnerId = req.session.user!.id;
  const { type, status, limit = 50 } = req.query;

  const [partner] = await db
    .select()
    .from(partners)
    .where(eq(partners.userId, partnerId))
    .limit(1);

  if (!partner) {
    return res.status(404).json({ message: 'Hamkor topilmadi' });
  }

  let query = db
    .select()
    .from(walletTransactions)
    .where(eq(walletTransactions.partnerId, partner.id));

  if (type) {
    query = query.where(and(
      eq(walletTransactions.partnerId, partner.id),
      eq(walletTransactions.type, type as any)
    ));
  }

  if (status) {
    query = query.where(and(
      eq(walletTransactions.partnerId, partner.id),
      eq(walletTransactions.status, status as any)
    ));
  }

  const transactions = await query
    .orderBy(desc(walletTransactions.createdAt))
    .limit(parseInt(limit as string));

  res.json({ transactions });
}));

export default router;
