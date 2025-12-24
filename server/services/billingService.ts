// Billing Service - Automated billing, invoicing, and subscription management
import { db } from '../db';
import { 
  subscriptions, 
  invoices, 
  payments, 
  commissionRecords,
  salesLimits,
  partners 
} from '../../shared/schema';
import { eq, and, gte, lte } from 'drizzle-orm';
import { SAAS_PRICING_TIERS } from '../../SAAS_PRICING_CONFIG';

// ==================== TIER MANAGEMENT ====================

export function getTierConfig(tierId: string) {
  return SAAS_PRICING_TIERS[tierId as keyof typeof SAAS_PRICING_TIERS];
}

export function calculateMonthlyFee(tierId: string): number {
  const tier = getTierConfig(tierId);
  return tier ? tier.monthlyFeeUSD : 0;
}

export function calculateCommission(saleAmount: number, tierId: string): number {
  const tier = getTierConfig(tierId);
  if (!tier) return 0;
  return saleAmount * tier.commissionRate;
}

export function getSalesLimit(tierId: string): number {
  const tier = getTierConfig(tierId);
  if (!tier) return 0;
  return tier.limits.monthlySalesLimit;
}

export function getSKULimit(tierId: string): number {
  const tier = getTierConfig(tierId);
  if (!tier) return 0;
  return tier.limits.sku;
}

// ==================== SUBSCRIPTION MANAGEMENT ====================

export async function createSubscription(partnerId: string, tierId: string) {
  const subscriptionId = `sub_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  
  const startDate = new Date();
  const endDate = new Date();
  endDate.setMonth(endDate.getMonth() + 1);

  await db.insert(subscriptions).values({
    id: subscriptionId,
    partnerId,
    tierId,
    status: 'active',
    startDate,
    endDate,
    autoRenew: true,
    createdAt: new Date(),
  });

  // Create first invoice if not free tier
  if (tierId !== 'free_starter') {
    await createInvoice(partnerId, subscriptionId, tierId);
  }

  // Initialize sales limits
  await initializeSalesLimits(partnerId, tierId);

  return subscriptionId;
}

export async function upgradeSubscription(partnerId: string, newTierId: string) {
  // Get current subscription
  const currentSub = await db.query.subscriptions.findFirst({
    where: and(
      eq(subscriptions.partnerId, partnerId),
      eq(subscriptions.status, 'active')
    ),
  });

  if (!currentSub) {
    // No subscription, create new one
    return await createSubscription(partnerId, newTierId);
  }

  // Update subscription
  await db.update(subscriptions)
    .set({
      tierId: newTierId,
      updatedAt: new Date(),
    })
    .where(eq(subscriptions.id, currentSub.id));

  // Update partner tier
  await db.update(partners)
    .set({
      pricingTier: newTierId,
    })
    .where(eq(partners.id, partnerId));

  // Create prorated invoice for upgrade
  if (newTierId !== 'free_starter') {
    await createUpgradeInvoice(partnerId, currentSub.id, currentSub.tierId, newTierId);
  }

  // Update sales limits
  await updateSalesLimits(partnerId, newTierId);

  return currentSub.id;
}

export async function cancelSubscription(partnerId: string) {
  const subscription = await db.query.subscriptions.findFirst({
    where: and(
      eq(subscriptions.partnerId, partnerId),
      eq(subscriptions.status, 'active')
    ),
  });

  if (!subscription) {
    throw new Error('No active subscription found');
  }

  await db.update(subscriptions)
    .set({
      status: 'cancelled',
      autoRenew: false,
      updatedAt: new Date(),
    })
    .where(eq(subscriptions.id, subscription.id));

  return subscription.id;
}

// ==================== INVOICE MANAGEMENT ====================

export async function createInvoice(
  partnerId: string, 
  subscriptionId: string, 
  tierId: string
) {
  const invoiceId = `inv_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  const amount = calculateMonthlyFee(tierId);
  
  const dueDate = new Date();
  dueDate.setDate(dueDate.getDate() + 5); // 5 days grace period

  await db.insert(invoices).values({
    id: invoiceId,
    partnerId,
    subscriptionId,
    amount,
    currency: 'USD',
    status: 'pending',
    dueDate,
    createdAt: new Date(),
  });

  return invoiceId;
}

export async function createUpgradeInvoice(
  partnerId: string,
  subscriptionId: string,
  oldTierId: string,
  newTierId: string
) {
  const invoiceId = `inv_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  
  // Calculate prorated amount
  const oldFee = calculateMonthlyFee(oldTierId);
  const newFee = calculateMonthlyFee(newTierId);
  const difference = newFee - oldFee;
  
  // Prorate based on days remaining in month
  const now = new Date();
  const daysInMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0).getDate();
  const daysRemaining = daysInMonth - now.getDate();
  const proratedAmount = (difference / daysInMonth) * daysRemaining;

  const dueDate = new Date();
  dueDate.setDate(dueDate.getDate() + 3); // 3 days for upgrade

  await db.insert(invoices).values({
    id: invoiceId,
    partnerId,
    subscriptionId,
    amount: Math.max(proratedAmount, 0),
    currency: 'USD',
    status: 'pending',
    dueDate,
    metadata: JSON.stringify({
      type: 'upgrade',
      oldTier: oldTierId,
      newTier: newTierId,
      prorated: true,
    }),
    createdAt: new Date(),
  });

  return invoiceId;
}

// ==================== COMMISSION TRACKING ====================

export async function recordCommission(
  partnerId: string,
  orderId: string,
  saleAmount: number,
  tierId: string
) {
  const commissionId = `com_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  const tier = getTierConfig(tierId);
  
  if (!tier) {
    throw new Error('Invalid tier');
  }

  const commissionAmount = saleAmount * tier.commissionRate;

  const now = new Date();
  const periodStart = new Date(now.getFullYear(), now.getMonth(), 1);
  const periodEnd = new Date(now.getFullYear(), now.getMonth() + 1, 0);

  await db.insert(commissionRecords).values({
    id: commissionId,
    partnerId,
    orderId,
    saleAmount,
    commissionRate: tier.commissionRate,
    commissionAmount,
    status: 'pending',
    periodStart,
    periodEnd,
    createdAt: new Date(),
  });

  // Update sales limits
  await updateSalesTracking(partnerId, saleAmount);

  return commissionId;
}

export async function getMonthlyCommissions(partnerId: string, month: number) {
  const records = await db.query.commissionRecords.findMany({
    where: and(
      eq(commissionRecords.partnerId, partnerId),
      // Add month filter here
    ),
  });

  const total = records.reduce((sum, record) => sum + record.commissionAmount, 0);
  return { records, total };
}

// ==================== SALES LIMITS ====================

export async function initializeSalesLimits(partnerId: string, tierId: string) {
  const limitId = `lim_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  const tier = getTierConfig(tierId);
  
  if (!tier) return;

  const now = new Date();
  const month = parseInt(`${now.getFullYear()}${String(now.getMonth() + 1).padStart(2, '0')}`);

  await db.insert(salesLimits).values({
    id: limitId,
    partnerId,
    tierId,
    month,
    totalSales: 0,
    salesLimit: tier.limits.monthlySalesLimit,
    skuCount: 0,
    skuLimit: tier.limits.sku,
    status: 'ok',
    createdAt: new Date(),
  });

  return limitId;
}

export async function updateSalesLimits(partnerId: string, newTierId: string) {
  const now = new Date();
  const month = parseInt(`${now.getFullYear()}${String(now.getMonth() + 1).padStart(2, '0')}`);

  const currentLimit = await db.query.salesLimits.findFirst({
    where: and(
      eq(salesLimits.partnerId, partnerId),
      eq(salesLimits.month, month)
    ),
  });

  if (!currentLimit) {
    return await initializeSalesLimits(partnerId, newTierId);
  }

  const tier = getTierConfig(newTierId);
  if (!tier) return;

  await db.update(salesLimits)
    .set({
      tierId: newTierId,
      salesLimit: tier.limits.monthlySalesLimit,
      skuLimit: tier.limits.sku,
      updatedAt: new Date(),
    })
    .where(eq(salesLimits.id, currentLimit.id));
}

export async function updateSalesTracking(partnerId: string, saleAmount: number) {
  const now = new Date();
  const month = parseInt(`${now.getFullYear()}${String(now.getMonth() + 1).padStart(2, '0')}`);

  const currentLimit = await db.query.salesLimits.findFirst({
    where: and(
      eq(salesLimits.partnerId, partnerId),
      eq(salesLimits.month, month)
    ),
  });

  if (!currentLimit) {
    // Initialize if not exists
    const partner = await db.query.partners.findFirst({
      where: eq(partners.id, partnerId),
    });
    if (partner) {
      await initializeSalesLimits(partnerId, partner.pricingTier || 'free_starter');
    }
    return;
  }

  const newTotal = currentLimit.totalSales + saleAmount;
  const limit = currentLimit.salesLimit;
  
  let status = 'ok';
  if (limit > 0) { // -1 means unlimited
    if (newTotal >= limit) {
      status = 'exceeded';
    } else if (newTotal >= limit * 0.8) {
      status = 'warning';
    }
  }

  await db.update(salesLimits)
    .set({
      totalSales: newTotal,
      status,
      updatedAt: new Date(),
    })
    .where(eq(salesLimits.id, currentLimit.id));

  return status;
}

export async function checkSalesLimit(partnerId: string): Promise<{
  exceeded: boolean;
  limit: number;
  current: number;
  percentage: number;
}> {
  const now = new Date();
  const month = parseInt(`${now.getFullYear()}${String(now.getMonth() + 1).padStart(2, '0')}`);

  const currentLimit = await db.query.salesLimits.findFirst({
    where: and(
      eq(salesLimits.partnerId, partnerId),
      eq(salesLimits.month, month)
    ),
  });

  if (!currentLimit) {
    return { exceeded: false, limit: 0, current: 0, percentage: 0 };
  }

  const limit = currentLimit.salesLimit;
  const current = currentLimit.totalSales;
  
  if (limit === -1) {
    return { exceeded: false, limit: -1, current, percentage: 0 };
  }

  const percentage = (current / limit) * 100;
  const exceeded = current >= limit;

  return { exceeded, limit, current, percentage };
}

// ==================== AUTOMATED BILLING (Cron Job) ====================

export async function processMonthlyBilling() {
  console.log('🔄 Processing monthly billing...');

  // Get all active subscriptions
  const activeSubscriptions = await db.query.subscriptions.findMany({
    where: eq(subscriptions.status, 'active'),
  });

  for (const subscription of activeSubscriptions) {
    try {
      // Skip free tier
      if (subscription.tierId === 'free_starter') {
        continue;
      }

      // Check if subscription needs renewal
      const now = new Date();
      if (subscription.endDate && subscription.endDate <= now) {
        // Create new invoice
        await createInvoice(
          subscription.partnerId,
          subscription.id,
          subscription.tierId
        );

        // Extend subscription
        const newEndDate = new Date(subscription.endDate);
        newEndDate.setMonth(newEndDate.getMonth() + 1);

        await db.update(subscriptions)
          .set({
            endDate: newEndDate,
            updatedAt: new Date(),
          })
          .where(eq(subscriptions.id, subscription.id));

        console.log(`✅ Renewed subscription: ${subscription.id}`);
      }
    } catch (error) {
      console.error(`❌ Error processing subscription ${subscription.id}:`, error);
    }
  }

  // Reset monthly sales limits
  await resetMonthlySalesLimits();

  console.log('✅ Monthly billing completed');
}

async function resetMonthlySalesLimits() {
  const now = new Date();
  const currentMonth = parseInt(`${now.getFullYear()}${String(now.getMonth() + 1).padStart(2, '0')}`);

  // Get all partners
  const allPartners = await db.query.partners.findMany();

  for (const partner of allPartners) {
    try {
      await initializeSalesLimits(partner.id, partner.pricingTier || 'free_starter');
    } catch (error) {
      console.error(`Error resetting limits for partner ${partner.id}:`, error);
    }
  }
}

// ==================== OVERDUE HANDLING ====================

export async function processOverdueInvoices() {
  console.log('🔄 Processing overdue invoices...');

  const now = new Date();
  
  // Get overdue invoices
  const overdueInvoices = await db.query.invoices.findMany({
    where: and(
      eq(invoices.status, 'pending'),
      lte(invoices.dueDate, now)
    ),
  });

  for (const invoice of overdueInvoices) {
    try {
      // Get subscription
      if (invoice.subscriptionId) {
        const subscription = await db.query.subscriptions.findFirst({
          where: eq(subscriptions.id, invoice.subscriptionId),
        });

        if (subscription) {
          // Suspend subscription after 5 days overdue
          const daysPastDue = Math.floor(
            (now.getTime() - invoice.dueDate.getTime()) / (1000 * 60 * 60 * 24)
          );

          if (daysPastDue >= 5) {
            await db.update(subscriptions)
              .set({
                status: 'suspended',
                updatedAt: new Date(),
              })
              .where(eq(subscriptions.id, subscription.id));

            console.log(`⚠️ Suspended subscription: ${subscription.id}`);
          }
        }
      }
    } catch (error) {
      console.error(`Error processing overdue invoice ${invoice.id}:`, error);
    }
  }

  console.log('✅ Overdue processing completed');
}

export default {
  getTierConfig,
  calculateMonthlyFee,
  calculateCommission,
  getSalesLimit,
  getSKULimit,
  createSubscription,
  upgradeSubscription,
  cancelSubscription,
  createInvoice,
  recordCommission,
  getMonthlyCommissions,
  checkSalesLimit,
  processMonthlyBilling,
  processOverdueInvoices,
};
