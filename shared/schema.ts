// Complete SQLite Schema for BiznesYordam - Professional Platform
import { sql, relations } from 'drizzle-orm';
import { sqliteTable, text, integer, real } from 'drizzle-orm/sqlite-core';
import { createInsertSchema, createSelectSchema } from 'drizzle-zod';
import { z } from 'zod';

// ==================== CORE TABLES ====================

// Users
export const users = sqliteTable('users', {
  id: text('id').primaryKey(),
  username: text('username').notNull().unique(),
  email: text('email').unique(),
  password: text('password').notNull(),
  firstName: text('first_name'),
  lastName: text('last_name'),
  phone: text('phone'),
  role: text('role').notNull().default('customer'),
  isActive: integer('is_active', { mode: 'boolean' }).notNull().default(true),
  createdAt: integer('created_at', { mode: 'timestamp' }).notNull().default(sql`(unixepoch())`),
  updatedAt: integer('updated_at', { mode: 'timestamp' }).default(sql`(unixepoch())`),
});

// Partners
export const partners = sqliteTable('partners', {
  id: text('id').primaryKey(),
  userId: text('user_id').notNull().unique().references(() => users.id),
  businessName: text('business_name').notNull(),
  businessAddress: text('business_address'),
  businessCategory: text('business_category'),
  inn: text('inn').unique(),
  phone: text('phone').notNull(),
  website: text('website'),
  monthlyRevenue: text('monthly_revenue'),
  approved: integer('approved', { mode: 'boolean' }).default(false),
  pricingTier: text('pricing_tier').default('free_starter'), // Updated to SaaS model
  monthlyFee: integer('monthly_fee'),
  profitSharePercent: integer('profit_share_percent'),
  aiEnabled: integer('ai_enabled', { mode: 'boolean' }).default(false),
  aiCardsUsed: integer('ai_cards_used').default(0),
  aiCardsLimit: integer('ai_cards_limit').default(50),
  warehouseSpaceKg: integer('warehouse_space_kg'),
  anydeskId: text('anydesk_id'),
  anydeskPassword: text('anydesk_password'),
  referralCode: text('referral_code'),
  notes: text('notes'),
  createdAt: integer('created_at', { mode: 'timestamp' }).notNull().default(sql`(unixepoch())`),
  lastActivityAt: integer('last_activity_at', { mode: 'timestamp' }),
});

// Products
export const products = sqliteTable('products', {
  id: text('id').primaryKey(),
  partnerId: text('partner_id').notNull().references(() => partners.id),
  name: text('name').notNull(),
  sku: text('sku').unique(),
  barcode: text('barcode'),
  description: text('description'),
  category: text('category'),
  brand: text('brand'),
  price: real('price').notNull(),
  costPrice: real('cost_price'),
  weight: text('weight'),
  stockQuantity: integer('stock_quantity').default(0),
  lowStockThreshold: integer('low_stock_threshold').default(10),
  optimizedTitle: text('optimized_title'),
  isActive: integer('is_active', { mode: 'boolean' }).default(true),
  createdAt: integer('created_at', { mode: 'timestamp' }).notNull().default(sql`(unixepoch())`),
  updatedAt: integer('updated_at', { mode: 'timestamp' }),
});

// Orders
export const orders = sqliteTable('orders', {
  id: text('id').primaryKey(),
  partnerId: text('partner_id').notNull().references(() => partners.id),
  orderNumber: text('order_number').unique().notNull(),
  customerName: text('customer_name').notNull(),
  customerEmail: text('customer_email'),
  customerPhone: text('customer_phone'),
  marketplace: text('marketplace'),
  status: text('status').default('pending'),
  totalAmount: real('total_amount').notNull(),
  shippingAddress: text('shipping_address'),
  trackingNumber: text('tracking_number'),
  createdAt: integer('created_at', { mode: 'timestamp' }).notNull().default(sql`(unixepoch())`),
  updatedAt: integer('updated_at', { mode: 'timestamp' }),
});

export const orderItems = sqliteTable('order_items', {
  id: text('id').primaryKey(),
  orderId: text('order_id').notNull().references(() => orders.id),
  productId: text('product_id').notNull().references(() => products.id),
  quantity: integer('quantity').notNull(),
  price: real('price').notNull(),
  createdAt: integer('created_at', { mode: 'timestamp' }).notNull().default(sql`(unixepoch())`),
});

// ==================== MARKETPLACE & INTEGRATIONS ====================

export const marketplaceIntegrations = sqliteTable('marketplace_integrations', {
  id: text('id').primaryKey(),
  partnerId: text('partner_id').notNull().references(() => partners.id),
  marketplace: text('marketplace').notNull(),
  apiKey: text('api_key'),
  apiSecret: text('api_secret'),
  active: integer('active', { mode: 'boolean' }).default(false),
  lastSyncAt: integer('last_sync_at', { mode: 'timestamp' }),
  createdAt: integer('created_at', { mode: 'timestamp' }).notNull().default(sql`(unixepoch())`),
});

export const marketplaceApiConfigs = sqliteTable('marketplace_api_configs', {
  id: text('id').primaryKey(),
  marketplace: text('marketplace').notNull().unique(),
  apiEndpoint: text('api_endpoint').notNull(),
  authType: text('auth_type').notNull(),
  rateLimit: integer('rate_limit'),
  documentation: text('documentation'),
  createdAt: integer('created_at', { mode: 'timestamp' }).notNull().default(sql`(unixepoch())`),
});

// ==================== BILLING & PAYMENTS ====================

// Subscriptions - Partner obunalari
export const subscriptions = sqliteTable('subscriptions', {
  id: text('id').primaryKey(),
  partnerId: text('partner_id').notNull().references(() => partners.id),
  tierId: text('tier_id').notNull(), // free_starter, basic, starter, professional
  status: text('status').notNull().default('active'), // active, cancelled, expired, suspended
  startDate: integer('start_date', { mode: 'timestamp' }).notNull(),
  endDate: integer('end_date', { mode: 'timestamp' }),
  autoRenew: integer('auto_renew', { mode: 'boolean' }).default(true),
  createdAt: integer('created_at', { mode: 'timestamp' }).notNull().default(sql`(unixepoch())`),
  updatedAt: integer('updated_at', { mode: 'timestamp' }),
});

// Invoices - Hisob-fakturalar
export const invoices = sqliteTable('invoices', {
  id: text('id').primaryKey(),
  partnerId: text('partner_id').notNull().references(() => partners.id),
  subscriptionId: text('subscription_id').references(() => subscriptions.id),
  amount: real('amount').notNull(),
  currency: text('currency').default('USD'),
  status: text('status').notNull().default('pending'), // pending, paid, failed, refunded
  dueDate: integer('due_date', { mode: 'timestamp' }).notNull(),
  paidAt: integer('paid_at', { mode: 'timestamp' }),
  paymentMethod: text('payment_method'), // click, payme, uzcard, manual
  metadata: text('metadata'), // JSON
  createdAt: integer('created_at', { mode: 'timestamp' }).notNull().default(sql`(unixepoch())`),
});

// Payments - To'lovlar
export const payments = sqliteTable('payments', {
  id: text('id').primaryKey(),
  invoiceId: text('invoice_id').notNull().references(() => invoices.id),
  partnerId: text('partner_id').notNull().references(() => partners.id),
  amount: real('amount').notNull(),
  currency: text('currency').default('USD'),
  paymentMethod: text('payment_method').notNull(), // click, payme, uzcard, manual
  transactionId: text('transaction_id'), // Gateway transaction ID
  status: text('status').notNull().default('pending'), // pending, completed, failed, refunded
  metadata: text('metadata'), // JSON: gateway response
  createdAt: integer('created_at', { mode: 'timestamp' }).notNull().default(sql`(unixepoch())`),
  completedAt: integer('completed_at', { mode: 'timestamp' }),
});

// Commission Records - Komissiya yozuvlari
export const commissionRecords = sqliteTable('commission_records', {
  id: text('id').primaryKey(),
  partnerId: text('partner_id').notNull().references(() => partners.id),
  orderId: text('order_id'),
  saleAmount: real('sale_amount').notNull(),
  commissionRate: real('commission_rate').notNull(),
  commissionAmount: real('commission_amount').notNull(),
  status: text('status').notNull().default('pending'), // pending, paid, cancelled
  periodStart: integer('period_start', { mode: 'timestamp' }).notNull(),
  periodEnd: integer('period_end', { mode: 'timestamp' }).notNull(),
  paidAt: integer('paid_at', { mode: 'timestamp' }),
  createdAt: integer('created_at', { mode: 'timestamp' }).notNull().default(sql`(unixepoch())`),
});

// Sales Limits - Savdo limitlari tracking
export const salesLimits = sqliteTable('sales_limits', {
  id: text('id').primaryKey(),
  partnerId: text('partner_id').notNull().references(() => partners.id),
  tierId: text('tier_id').notNull(),
  month: integer('month').notNull(), // YYYYMM format
  totalSales: real('total_sales').default(0),
  salesLimit: real('sales_limit').notNull(),
  skuCount: integer('sku_count').default(0),
  skuLimit: integer('sku_limit').notNull(),
  status: text('status').notNull().default('ok'), // ok, warning, exceeded
  createdAt: integer('created_at', { mode: 'timestamp' }).notNull().default(sql`(unixepoch())`),
  updatedAt: integer('updated_at', { mode: 'timestamp' }),
});

// ==================== FULFILLMENT ====================
// FUTURE FEATURE: Fulfillment services (warehousing, logistics)
// Currently hidden for SaaS-only mode
// Uncomment when fulfillment services are ready to launch

export const fulfillmentRequests = sqliteTable('fulfillment_requests', {
  id: text('id').primaryKey(),
  partnerId: text('partner_id').notNull().references(() => partners.id),
  requestType: text('request_type').notNull().default('general'),
  productId: text('product_id').references(() => products.id),
  title: text('title').notNull(),
  description: text('description'),
  status: text('status').default('pending'),
  priority: text('priority').default('medium'),
  estimatedCost: text('estimated_cost'),
  actualCost: text('actual_cost'),
  assignedTo: text('assigned_to').references(() => users.id),
  metadata: text('metadata'),
  createdAt: integer('created_at', { mode: 'timestamp' }).notNull().default(sql`(unixepoch())`),
  updatedAt: integer('updated_at', { mode: 'timestamp' }),
  completedAt: integer('completed_at', { mode: 'timestamp' }),
});

// FUTURE FEATURE: Warehouse management
export const warehouses = sqliteTable('warehouses', {
  id: text('id').primaryKey(),
  name: text('name').notNull(),
  code: text('code'),
  location: text('location').notNull(),
  capacity: integer('capacity').notNull(),
  currentLoad: integer('current_load').default(0),
  active: integer('active', { mode: 'boolean' }).default(true),
  createdAt: integer('created_at', { mode: 'timestamp' }).notNull().default(sql`(unixepoch())`),
});

// FUTURE FEATURE: Warehouse stock tracking
export const warehouseStock = sqliteTable('warehouse_stock', {
  id: text('id').primaryKey(),
  warehouseId: text('warehouse_id').notNull().references(() => warehouses.id),
  productId: text('product_id').notNull().references(() => products.id),
  quantity: integer('quantity').notNull().default(0),
  location: text('location'),
  lastUpdated: integer('last_updated', { mode: 'timestamp' }).notNull().default(sql`(unixepoch())`),
});

export const stockMovements = sqliteTable('stock_movements', {
  id: text('id').primaryKey(),
  productId: text('product_id').notNull().references(() => products.id),
  warehouseId: text('warehouse_id').references(() => warehouses.id),
  movementType: text('movement_type').notNull(),
  quantity: integer('quantity').notNull(),
  previousStock: integer('previous_stock'),
  newStock: integer('new_stock'),
  reason: text('reason'),
  performedBy: text('performed_by').references(() => users.id),
  createdAt: integer('created_at', { mode: 'timestamp' }).notNull().default(sql`(unixepoch())`),
});

export const customers = sqliteTable('customers', {
  id: text('id').primaryKey(),
  partnerId: text('partner_id').notNull().references(() => partners.id),
  name: text('name').notNull(),
  email: text('email'),
  phone: text('phone').notNull(),
  address: text('address'),
  totalOrders: integer('total_orders').default(0),
  totalSpent: real('total_spent').default(0),
  createdAt: integer('created_at', { mode: 'timestamp' }).notNull().default(sql`(unixepoch())`),
  lastOrderAt: integer('last_order_at', { mode: 'timestamp' }),
});

export const stockAlerts = sqliteTable('stock_alerts', {
  id: text('id').primaryKey(),
  productId: text('product_id').notNull().references(() => products.id),
  alertType: text('alert_type').notNull(),
  message: text('message').notNull(),
  resolved: integer('resolved', { mode: 'boolean' }).default(false),
  createdAt: integer('created_at', { mode: 'timestamp' }).notNull().default(sql`(unixepoch())`),
  resolvedAt: integer('resolved_at', { mode: 'timestamp' }),
});

export const inventoryReports = sqliteTable('inventory_reports', {
  id: text('id').primaryKey(),
  partnerId: text('partner_id').notNull().references(() => partners.id),
  reportType: text('report_type').notNull(),
  startDate: integer('start_date', { mode: 'timestamp' }).notNull(),
  endDate: integer('end_date', { mode: 'timestamp' }).notNull(),
  data: text('data').notNull(),
  generatedBy: text('generated_by').references(() => users.id),
  createdAt: integer('created_at', { mode: 'timestamp' }).notNull().default(sql`(unixepoch())`),
});

// ==================== AI TABLES ====================

export const aiTasks = sqliteTable('ai_tasks', {
  id: text('id').primaryKey(),
  partnerId: text('partner_id').notNull().references(() => partners.id),
  accountId: text('account_id'),
  taskType: text('task_type').notNull(),
  status: text('status').default('pending'),
  priority: text('priority').default('medium'),
  inputData: text('input_data'),
  outputData: text('output_data'),
  errorMessage: text('error_message'),
  startedAt: integer('started_at', { mode: 'timestamp' }),
  completedAt: integer('completed_at', { mode: 'timestamp' }),
  estimatedCost: real('estimated_cost'),
  actualCost: real('actual_cost'),
  createdAt: integer('created_at', { mode: 'timestamp' }).notNull().default(sql`(unixepoch())`),
  updatedAt: integer('updated_at', { mode: 'timestamp' }),
});

export const aiProductCards = sqliteTable('ai_product_cards', {
  id: text('id').primaryKey(),
  partnerId: text('partner_id').notNull().references(() => partners.id),
  productId: text('product_id').references(() => products.id),
  accountId: text('account_id'),
  baseProductName: text('base_product_name'),
  marketplace: text('marketplace').notNull(),
  title: text('title').notNull(),
  description: text('description'),
  bulletPoints: text('bullet_points'),
  seoKeywords: text('seo_keywords'),
  imagePrompts: text('image_prompts'),
  generatedImages: text('generated_images'),
  status: text('status').default('draft'),
  qualityScore: integer('quality_score'),
  aiModel: text('ai_model'),
  generationCost: real('generation_cost'),
  createdAt: integer('created_at', { mode: 'timestamp' }).notNull().default(sql`(unixepoch())`),
  updatedAt: integer('updated_at', { mode: 'timestamp' }),
  publishedAt: integer('published_at', { mode: 'timestamp' }),
});

export const aiMarketplaceAccounts = sqliteTable('ai_marketplace_accounts', {
  id: text('id').primaryKey(),
  partnerId: text('partner_id').notNull().references(() => partners.id),
  marketplace: text('marketplace').notNull(),
  accountName: text('account_name').notNull(),
  credentialsEncrypted: text('credentials_encrypted'),
  isActive: integer('is_active', { mode: 'boolean' }).default(true),
  lastSyncedAt: integer('last_synced_at', { mode: 'timestamp' }),
  createdAt: integer('created_at', { mode: 'timestamp' }).notNull().default(sql`(unixepoch())`),
  updatedAt: integer('updated_at', { mode: 'timestamp' }),
});

// ==================== AI COST TRACKING ====================

export const aiCostRecords = sqliteTable('ai_cost_records', {
  id: text('id').primaryKey(),
  partnerId: text('partner_id').notNull().references(() => partners.id),
  operation: text('operation').notNull(),
  model: text('model').notNull(),
  tokensUsed: integer('tokens_used'),
  imagesGenerated: integer('images_generated'),
  cost: real('cost').notNull(),
  tier: text('tier').notNull(),
  metadata: text('metadata'),
  createdAt: integer('created_at', { mode: 'timestamp' }).notNull().default(sql`(unixepoch())`),
});

// ==================== REMOTE ACCESS ====================

export const remoteAccessSessions = sqliteTable('remote_access_sessions', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  partnerId: integer('partner_id').notNull(),
  adminId: integer('admin_id'),
  sessionCode: text('session_code').notNull().unique(),
  status: text('status').notNull().default('pending'), // pending, active, ended
  purpose: text('purpose').notNull(),
  requestedBy: text('requested_by').notNull(),
  startedAt: integer('started_at', { mode: 'timestamp' }),
  endedAt: integer('ended_at', { mode: 'timestamp' }),
  endedBy: text('ended_by'), // admin, partner
  createdAt: integer('created_at', { mode: 'timestamp' }).notNull().default(sql`(unixepoch())`),
});

// ==================== REFERRAL SYSTEM ====================

export const referrals = sqliteTable('referrals', {
  id: text('id').primaryKey(),
  referrerPartnerId: text('referrer_partner_id').notNull().references(() => partners.id),
  referredPartnerId: text('referred_partner_id').notNull().references(() => partners.id),
  promoCode: text('promo_code'),
  contractType: text('contract_type').notNull(),
  status: text('status').default('invited'), // 'invited', 'registered', 'paid_1month', 'active', 'expired'
  bonusEarned: real('bonus_earned').default(0),
  bonusPaid: real('bonus_paid').default(0),
  createdAt: integer('created_at', { mode: 'timestamp' }).notNull().default(sql`(unixepoch())`),
  activatedAt: integer('activated_at', { mode: 'timestamp' }),
  expiresAt: integer('expires_at', { mode: 'timestamp' }),
});

export const referralBonuses = sqliteTable('referral_bonuses', {
  id: text('id').primaryKey(),
  referralId: text('referral_id').notNull().references(() => referrals.id),
  referrerPartnerId: text('referrer_partner_id').notNull().references(() => partners.id),
  amount: real('amount').notNull(),
  monthNumber: integer('month_number').notNull(),
  platformProfit: real('platform_profit').notNull(),
  bonusRate: real('bonus_rate').notNull(),
  tierMultiplier: real('tier_multiplier').notNull(),
  status: text('status').default('pending'),
  paidAt: integer('paid_at', { mode: 'timestamp' }),
  createdAt: integer('created_at', { mode: 'timestamp' }).notNull().default(sql`(unixepoch())`),
});

export const referralWithdrawals = sqliteTable('referral_withdrawals', {
  id: text('id').primaryKey(),
  partnerId: text('partner_id').notNull().references(() => partners.id),
  amount: real('amount').notNull(),
  method: text('method').notNull(),
  fee: real('fee').notNull(),
  netAmount: real('net_amount').notNull(),
  status: text('status').default('pending'),
  createdAt: integer('created_at', { mode: 'timestamp' }).notNull().default(sql`(unixepoch())`),
  requestedAt: integer('requested_at', { mode: 'timestamp' }).notNull().default(sql`(unixepoch())`),
  processedAt: integer('processed_at', { mode: 'timestamp' }),
  transactionId: text('transaction_id'),
});

// Referral First Purchase - Birinchi haridani kuzatish
export const referralFirstPurchases = sqliteTable('referral_first_purchases', {
  id: text('id').primaryKey(),
  referralId: text('referral_id').notNull().references(() => referrals.id),
  referrerPartnerId: text('referrer_partner_id').notNull().references(() => partners.id),
  referredPartnerId: text('referred_partner_id').notNull().references(() => partners.id),
  subscriptionId: text('subscription_id').references(() => subscriptions.id),
  invoiceId: text('invoice_id').references(() => invoices.id),
  paymentId: text('payment_id').references(() => payments.id),
  tierId: text('tier_id').notNull(), // basic, starter_pro, professional
  monthlyFee: real('monthly_fee').notNull(), // Oylik to'lov
  subscriptionMonths: integer('subscription_months').notNull().default(1), // Necha oyga ulangan (1, 3, 6, 12)
  totalAmount: real('total_amount').notNull(), // Jami to'lov (monthlyFee × subscriptionMonths)
  commissionRate: real('commission_rate').notNull().default(0.10), // 10%
  commissionAmount: real('commission_amount').notNull(), // Komissiya miqdori (monthlyFee × subscriptionMonths × 10%)
  status: text('status').default('pending'), // pending, paid, cancelled
  paidAt: integer('paid_at', { mode: 'timestamp' }),
  createdAt: integer('created_at', { mode: 'timestamp' }).notNull().default(sql`(unixepoch())`),
});

// Referral Campaigns - Konkurslar va aksiyalar
export const referralCampaigns = sqliteTable('referral_campaigns', {
  id: text('id').primaryKey(),
  name: text('name').notNull(), // "3 kun ichida 10 ta hamkor uchun $1000"
  description: text('description'),
  startDate: integer('start_date', { mode: 'timestamp' }).notNull(),
  endDate: integer('end_date', { mode: 'timestamp' }).notNull(),
  durationDays: integer('duration_days').notNull(), // 3, 10, 30 kun
  targetReferrals: integer('target_referrals').notNull(), // 10 ta hamkor
  bonusAmount: real('bonus_amount').notNull(), // $1000
  minTier: text('min_tier').notNull().default('basic'), // Minimal tarif (basic, starter_pro, professional)
  minSubscriptionMonths: integer('min_subscription_months').notNull().default(1), // Minimal muddat (1, 3, 6, 12 oy)
  status: text('status').default('active'), // active, completed, cancelled
  participants: integer('participants').default(0), // Qancha odam qatnashmoqda
  winners: integer('winners').default(0), // Qancha g'olib
  createdAt: integer('created_at', { mode: 'timestamp' }).notNull().default(sql`(unixepoch())`),
  createdBy: text('created_by').notNull(), // Admin ID
});

// Referral Campaign Participants - Konkurs ishtirokchilari
export const referralCampaignParticipants = sqliteTable('referral_campaign_participants', {
  id: text('id').primaryKey(),
  campaignId: text('campaign_id').notNull().references(() => referralCampaigns.id),
  referrerPartnerId: text('referrer_partner_id').notNull().references(() => partners.id),
  referralsCount: integer('referrals_count').default(0), // Qancha taklif qilgan
  bonusEarned: real('bonus_earned').default(0), // Qancha bonus olgan
  status: text('status').default('participating'), // participating, winner, completed
  joinedAt: integer('joined_at', { mode: 'timestamp' }).notNull().default(sql`(unixepoch())`),
  completedAt: integer('completed_at', { mode: 'timestamp' }),
});

export const partnerContracts = sqliteTable('partner_contracts', {
  id: text('id').primaryKey(),
  partnerId: text('partner_id').notNull().references(() => partners.id),
  contractType: text('contract_type').notNull(),
  pricingTier: text('pricing_tier').notNull(),
  startDate: integer('start_date', { mode: 'timestamp' }).notNull(),
  endDate: integer('end_date', { mode: 'timestamp' }).notNull(),
  monthlyFee: real('monthly_fee').notNull(),
  commissionRate: real('commission_rate').notNull(),
  discountPercent: real('discount_percent').default(0),
  status: text('status').default('active'),
  createdAt: integer('created_at', { mode: 'timestamp' }).notNull().default(sql`(unixepoch())`),
  signedAt: integer('signed_at', { mode: 'timestamp' }),
});

export type ReferralBonus = typeof referralBonuses.$inferSelect;
export type ReferralWithdrawal = typeof referralWithdrawals.$inferSelect;
export type PartnerContract = typeof partnerContracts.$inferSelect;


// ==================== ANALYTICS & REPORTS ====================

export const analytics = sqliteTable('analytics', {
  id: text('id').primaryKey(),
  partnerId: text('partner_id').notNull().references(() => partners.id),
  metricType: text('metric_type').notNull(),
  value: real('value').notNull(),
  date: integer('date', { mode: 'timestamp' }).notNull(),
  metadata: text('metadata'),
  createdAt: integer('created_at', { mode: 'timestamp' }).notNull().default(sql`(unixepoch())`),
});

export const profitBreakdown = sqliteTable('profit_breakdown', {
  id: text('id').primaryKey(),
  partnerId: text('partner_id').notNull().references(() => partners.id),
  orderId: text('order_id').references(() => orders.id),
  revenue: real('revenue').notNull(),
  costs: real('costs').notNull(),
  platformFee: real('platform_fee').notNull(),
  profitShare: real('profit_share').notNull(),
  netProfit: real('net_profit').notNull(),
  date: integer('date', { mode: 'timestamp' }).notNull(),
  createdAt: integer('created_at', { mode: 'timestamp' }).notNull().default(sql`(unixepoch())`),
});

export const trendingProducts = sqliteTable('trending_products', {
  id: text('id').primaryKey(),
  marketplace: text('marketplace').notNull(),
  category: text('category').notNull(),
  productName: text('product_name').notNull(),
  price: real('price'),
  salesCount: integer('sales_count'),
  rating: real('rating'),
  trendScore: integer('trend_score').notNull(),
  imageUrl: text('image_url'),
  productUrl: text('product_url'),
  analyzedAt: integer('analyzed_at', { mode: 'timestamp' }).notNull().default(sql`(unixepoch())`),
});

// ==================== CHAT & MESSAGING ====================

export const chatRooms = sqliteTable('chat_rooms', {
  id: text('id').primaryKey(),
  partnerId: text('partner_id').references(() => partners.id),
  adminId: text('admin_id').references(() => users.id),
  status: text('status').default('active'),
  createdAt: integer('created_at', { mode: 'timestamp' }).notNull().default(sql`(unixepoch())`),
  lastMessageAt: integer('last_message_at', { mode: 'timestamp' }),
});

export const messages = sqliteTable('messages', {
  id: text('id').primaryKey(),
  chatRoomId: text('chat_room_id').notNull().references(() => chatRooms.id),
  senderId: text('sender_id').notNull().references(() => users.id),
  senderRole: text('sender_role').notNull(),
  content: text('content').notNull(),
  messageType: text('message_type').default('text'),
  attachmentUrl: text('attachment_url'),
  createdAt: integer('created_at', { mode: 'timestamp' }).notNull().default(sql`(unixepoch())`),
  readAt: integer('read_at', { mode: 'timestamp' }),
});

// Alias for compatibility
export const enhancedMessages = messages;

// ==================== TIER & PRICING ====================

export const tierUpgradeRequests = sqliteTable('tier_upgrade_requests', {
  id: text('id').primaryKey(),
  partnerId: text('partner_id').notNull().references(() => partners.id),
  currentTier: text('current_tier').notNull(),
  requestedTier: text('requested_tier').notNull(),
  reason: text('reason'),
  adminNotes: text('admin_notes'),
  status: text('status').default('pending'),
  requestedAt: integer('requested_at', { mode: 'timestamp' }).notNull().default(sql`(unixepoch())`),
  reviewedAt: integer('reviewed_at', { mode: 'timestamp' }),
  reviewedBy: text('reviewed_by').references(() => users.id),
});

export const pricingTiers = sqliteTable('pricing_tiers', {
  id: text('id').primaryKey(),
  tier: text('tier').notNull().unique(),
  nameUz: text('name_uz').notNull(),
  fixedCost: text('fixed_cost').notNull(),
  commissionMin: text('commission_min').notNull(),
  commissionMax: text('commission_max').notNull(),
  minRevenue: text('min_revenue').notNull(),
  maxRevenue: text('max_revenue'),
  features: text('features').notNull(),
  isActive: integer('is_active', { mode: 'boolean' }).notNull().default(true),
  createdAt: integer('created_at', { mode: 'timestamp' }).notNull().default(sql`(unixepoch())`),
});

export const commissionSettings = sqliteTable('commission_settings', {
  id: text('id').primaryKey(),
  tier: text('tier').notNull().unique(),
  baseCommission: text('base_commission').notNull(),
  volumeBonus: text('volume_bonus'),
  performanceBonus: text('performance_bonus'),
  createdAt: integer('created_at', { mode: 'timestamp' }).notNull().default(sql`(unixepoch())`),
});

export const sptCosts = sqliteTable('spt_costs', {
  id: text('id').primaryKey(),
  serviceType: text('service_type').notNull(),
  tier: text('tier').notNull(),
  costPerUnit: text('cost_per_unit').notNull(),
  description: text('description'),
  createdAt: integer('created_at', { mode: 'timestamp' }).notNull().default(sql`(unixepoch())`),
});

// ==================== ADMIN & SYSTEM ====================

export const auditLogs = sqliteTable('audit_logs', {
  id: text('id').primaryKey(),
  userId: text('user_id').references(() => users.id),
  action: text('action').notNull(),
  entityType: text('entity_type').notNull(),
  entityId: text('entity_id'),
  changes: text('changes'),
  payload: text('payload'),
  ipAddress: text('ip_address'),
  userAgent: text('user_agent'),
  createdAt: integer('created_at', { mode: 'timestamp' }).notNull().default(sql`(unixepoch())`),
});

export const systemSettings = sqliteTable('system_settings', {
  id: text('id').primaryKey(),
  key: text('key').unique().notNull(),
  value: text('value').notNull(),
  description: text('description'),
  updatedAt: integer('updated_at', { mode: 'timestamp' }).notNull().default(sql`(unixepoch())`),
  updatedBy: text('updated_by').references(() => users.id),
});

export const adminPermissions = sqliteTable('admin_permissions', {
  userId: text('user_id').primaryKey().references(() => users.id),
  canManageAdmins: integer('can_manage_admins', { mode: 'boolean' }).notNull().default(false),
  canManageContent: integer('can_manage_content', { mode: 'boolean' }).notNull().default(false),
  canManageChat: integer('can_manage_chat', { mode: 'boolean' }).notNull().default(false),
  canViewReports: integer('can_view_reports', { mode: 'boolean' }).notNull().default(false),
  canReceiveProducts: integer('can_receive_products', { mode: 'boolean' }).notNull().default(false),
  canActivatePartners: integer('can_activate_partners', { mode: 'boolean' }).notNull().default(false),
  canManageIntegrations: integer('can_manage_integrations', { mode: 'boolean' }).notNull().default(false),
  createdAt: integer('created_at', { mode: 'timestamp' }).notNull().default(sql`(unixepoch())`),
  updatedAt: integer('updated_at', { mode: 'timestamp' }).default(sql`(unixepoch())`),
});

export const notifications = sqliteTable('notifications', {
  id: text('id').primaryKey(),
  userId: text('user_id').notNull().references(() => users.id),
  title: text('title').notNull(),
  message: text('message').notNull(),
  type: text('type').default('info'),
  read: integer('read', { mode: 'boolean' }).default(false),
  createdAt: integer('created_at', { mode: 'timestamp' }).notNull().default(sql`(unixepoch())`),
});

// ==================== EXCEL & IMPORT ====================

export const excelImports = sqliteTable('excel_imports', {
  id: text('id').primaryKey(),
  partnerId: text('partner_id').notNull().references(() => partners.id),
  fileName: text('file_name').notNull(),
  fileSize: integer('file_size'),
  rowsImported: integer('rows_imported'),
  status: text('status').default('pending'),
  errorLog: text('error_log'),
  createdAt: integer('created_at', { mode: 'timestamp' }).notNull().default(sql`(unixepoch())`),
});

export const excelTemplates = sqliteTable('excel_templates', {
  id: text('id').primaryKey(),
  name: text('name').notNull(),
  description: text('description'),
  templateUrl: text('template_url'),
  category: text('category'),
  createdAt: integer('created_at', { mode: 'timestamp' }).notNull().default(sql`(unixepoch())`),
});

// ==================== VALIDATION SCHEMAS ====================

export const insertUserSchema = createInsertSchema(users);
export const selectUserSchema = createSelectSchema(users);

export const insertPartnerSchema = createInsertSchema(partners);
export const selectPartnerSchema = createSelectSchema(partners);

// Partner Registration (userId NOT required)
export const partnerRegistrationSchema = z.object({
  username: z.string().min(3),
  email: z.string().email(),
  password: z.string().min(6),
  firstName: z.string().min(1),
  lastName: z.string().min(1),
  phone: z.string().min(9),
  businessName: z.string().min(2),
  businessCategory: z.string().optional(),
  monthlyRevenue: z.string().optional(),
  businessAddress: z.string().optional(),
  inn: z.string().optional(),
  website: z.string().optional(),
  notes: z.string().optional(),
});

// Product Creation (partnerId NOT required - from session)
export const insertProductSchema = createInsertSchema(products).omit({
  id: true,
  partnerId: true,
  createdAt: true,
  updatedAt: true,
});

export const selectProductSchema = createSelectSchema(products);

// Fulfillment Request Schema
export const insertFulfillmentRequestSchema = createInsertSchema(fulfillmentRequests).omit({
  id: true,
  partnerId: true,
  createdAt: true,
  updatedAt: true,
  completedAt: true,
});

// Login Schema
export const loginSchema = z.object({
  username: z.string().optional(),
  email: z.string().email().optional(),
  password: z.string().min(1),
}).refine(data => data.username || data.email, {
  message: "Username yoki email talab qilinadi",
});

// ==================== ALIASES FOR COMPATIBILITY ====================

// Alias for referralBonuses (used as referralEarnings in routes)
export const referralEarnings = referralBonuses;

// Alias for referralWithdrawals (used as withdrawals in routes)
export const withdrawals = referralWithdrawals;

// ==================== TYPE EXPORTS ====================

export type User = typeof users.$inferSelect;
export type InsertUser = typeof users.$inferInsert;
export type Partner = typeof partners.$inferSelect;
export type InsertPartner = typeof partners.$inferInsert;
export type Product = typeof products.$inferSelect;
export type InsertProduct = z.infer<typeof insertProductSchema>;
export type Order = typeof orders.$inferSelect;
export type Analytics = typeof analytics.$inferSelect;
export type AITask = typeof aiTasks.$inferSelect;
export type AIProductCard = typeof aiProductCards.$inferSelect;
export type AICostRecord = typeof aiCostRecords.$inferSelect;
export type Referral = typeof referrals.$inferSelect;
export type ReferralEarning = typeof referralEarnings.$inferSelect;
export type Withdrawal = typeof withdrawals.$inferSelect;

// Additional type exports (used across server/services)
export type FulfillmentRequest = typeof fulfillmentRequests.$inferSelect;
export type Message = typeof messages.$inferSelect;
export type PricingTier = typeof pricingTiers.$inferSelect;
export type TierUpgradeRequest = typeof tierUpgradeRequests.$inferSelect;
export type SystemSetting = typeof systemSettings.$inferSelect;
export type SptCost = typeof sptCosts.$inferSelect;
export type CommissionSetting = typeof commissionSettings.$inferSelect;
export type MarketplaceApiConfig = typeof marketplaceApiConfigs.$inferSelect;
export type ExcelImport = typeof excelImports.$inferSelect;
export type ExcelTemplate = typeof excelTemplates.$inferSelect;
export type ProfitBreakdown = typeof profitBreakdown.$inferSelect;
export type TrendingProduct = typeof trendingProducts.$inferSelect;
export type Notification = typeof notifications.$inferSelect;
export type AuditLog = typeof auditLogs.$inferSelect;
export type AdminPermission = typeof adminPermissions.$inferSelect;
export type Warehouse = typeof warehouses.$inferSelect;
export type WarehouseStock = typeof warehouseStock.$inferSelect;
export type StockMovement = typeof stockMovements.$inferSelect;
export type OrderItem = typeof orderItems.$inferSelect;
export type Customer = typeof customers.$inferSelect;
export type StockAlert = typeof stockAlerts.$inferSelect;
export type InventoryReport = typeof inventoryReports.$inferSelect;


// ==================== WALLET & PAYMENTS ====================

// Wallet Transactions
export const walletTransactions = sqliteTable('wallet_transactions', {
  id: text('id').primaryKey(),
  partnerId: text('partner_id').notNull().references(() => partners.id),
  type: text('type').notNull(), // 'income', 'expense', 'commission', 'withdrawal'
  amount: text('amount').notNull(),
  description: text('description'),
  status: text('status').notNull().default('pending'), // 'pending', 'completed', 'failed'
  metadata: text('metadata'), // JSON string for additional data
  createdAt: text('created_at').notNull().default(sql`(datetime('now'))`),
  updatedAt: text('updated_at').default(sql`(datetime('now'))`),
});

// Payment History
export const paymentHistory = sqliteTable('payment_history', {
  id: text('id').primaryKey(),
  partnerId: text('partner_id').notNull().references(() => partners.id),
  amount: text('amount').notNull(),
  currency: text('currency').default('UZS'),
  paymentMethod: text('payment_method'), // 'click', 'payme', 'uzcard', 'stripe'
  transactionId: text('transaction_id'),
  status: text('status').notNull().default('pending'), // 'pending', 'completed', 'failed', 'refunded'
  description: text('description'),
  metadata: text('metadata'),
  createdAt: text('created_at').notNull().default(sql`(datetime('now'))`),
  completedAt: text('completed_at'),
});

// Impersonation Logs
export const impersonationLogs = sqliteTable('impersonation_logs', {
  id: text('id').primaryKey(),
  adminId: text('admin_id').notNull().references(() => users.id),
  partnerId: text('partner_id').notNull().references(() => partners.id),
  action: text('action').notNull(), // 'start', 'end'
  ipAddress: text('ip_address'),
  userAgent: text('user_agent'),
  notes: text('notes'),
  createdAt: text('created_at').notNull().default(sql`(datetime('now'))`),
});

// Type exports
export type WalletTransaction = typeof walletTransactions.$inferSelect;
export type PaymentHistory = typeof paymentHistory.$inferSelect;
export type ImpersonationLog = typeof impersonationLogs.$inferSelect;

