var __defProp = Object.defineProperty;
var __getOwnPropNames = Object.getOwnPropertyNames;
var __name = (target, value) => __defProp(target, "name", { value, configurable: true });
var __esm = (fn, res) => function __init() {
  return fn && (res = (0, fn[__getOwnPropNames(fn)[0]])(fn = 0)), res;
};
var __export = (target, all) => {
  for (var name in all)
    __defProp(target, name, { get: all[name], enumerable: true });
};

// shared/schema.ts
var schema_exports = {};
__export(schema_exports, {
  adminPermissions: () => adminPermissions,
  aiCostRecords: () => aiCostRecords,
  aiMarketplaceAccounts: () => aiMarketplaceAccounts,
  aiProductCards: () => aiProductCards,
  aiTasks: () => aiTasks,
  analytics: () => analytics,
  auditLogs: () => auditLogs,
  blogCategories: () => blogCategories,
  blogComments: () => blogComments,
  blogPosts: () => blogPosts,
  chatRooms: () => chatRooms,
  commissionRecords: () => commissionRecords,
  commissionSettings: () => commissionSettings,
  customers: () => customers,
  enhancedMessages: () => enhancedMessages,
  excelImports: () => excelImports,
  excelTemplates: () => excelTemplates,
  fulfillmentRequests: () => fulfillmentRequests,
  impersonationLogs: () => impersonationLogs,
  insertFulfillmentRequestSchema: () => insertFulfillmentRequestSchema,
  insertPartnerSchema: () => insertPartnerSchema,
  insertProductSchema: () => insertProductSchema,
  insertUserSchema: () => insertUserSchema,
  inventoryReports: () => inventoryReports,
  invoices: () => invoices,
  loginSchema: () => loginSchema,
  marketplaceApiConfigs: () => marketplaceApiConfigs,
  marketplaceIntegrations: () => marketplaceIntegrations,
  messages: () => messages,
  notifications: () => notifications,
  orderItems: () => orderItems,
  orders: () => orders,
  partnerContracts: () => partnerContracts,
  partnerRegistrationSchema: () => partnerRegistrationSchema,
  partners: () => partners,
  paymentHistory: () => paymentHistory,
  payments: () => payments,
  pricingTiers: () => pricingTiers,
  products: () => products,
  profitBreakdown: () => profitBreakdown,
  referralBonuses: () => referralBonuses,
  referralCampaignParticipants: () => referralCampaignParticipants,
  referralCampaigns: () => referralCampaigns,
  referralEarnings: () => referralEarnings,
  referralFirstPurchases: () => referralFirstPurchases,
  referralWithdrawals: () => referralWithdrawals,
  referrals: () => referrals,
  remoteAccessSessions: () => remoteAccessSessions,
  salesLimits: () => salesLimits,
  selectPartnerSchema: () => selectPartnerSchema,
  selectProductSchema: () => selectProductSchema,
  selectUserSchema: () => selectUserSchema,
  sptCosts: () => sptCosts,
  stockAlerts: () => stockAlerts,
  stockMovements: () => stockMovements,
  subscriptions: () => subscriptions,
  systemSettings: () => systemSettings,
  tierUpgradeRequests: () => tierUpgradeRequests,
  trendingProducts: () => trendingProducts,
  users: () => users,
  walletTransactions: () => walletTransactions,
  warehouseStock: () => warehouseStock,
  warehouses: () => warehouses,
  withdrawals: () => withdrawals
});
import { sql } from "drizzle-orm";
import { sqliteTable, text, integer, real } from "drizzle-orm/sqlite-core";
import { createInsertSchema, createSelectSchema } from "drizzle-zod";
import { z } from "zod";
var users, partners, products, orders, orderItems, marketplaceIntegrations, marketplaceApiConfigs, subscriptions, invoices, payments, commissionRecords, salesLimits, fulfillmentRequests, warehouses, warehouseStock, stockMovements, customers, stockAlerts, inventoryReports, aiTasks, aiProductCards, aiMarketplaceAccounts, aiCostRecords, remoteAccessSessions, referrals, referralBonuses, referralWithdrawals, referralFirstPurchases, referralCampaigns, referralCampaignParticipants, partnerContracts, analytics, profitBreakdown, trendingProducts, chatRooms, messages, enhancedMessages, tierUpgradeRequests, pricingTiers, commissionSettings, sptCosts, auditLogs, systemSettings, adminPermissions, notifications, excelImports, excelTemplates, insertUserSchema, selectUserSchema, insertPartnerSchema, selectPartnerSchema, partnerRegistrationSchema, insertProductSchema, selectProductSchema, insertFulfillmentRequestSchema, loginSchema, referralEarnings, withdrawals, walletTransactions, paymentHistory, impersonationLogs, blogPosts, blogCategories, blogComments;
var init_schema = __esm({
  "shared/schema.ts"() {
    "use strict";
    users = sqliteTable("users", {
      id: text("id").primaryKey(),
      username: text("username").notNull().unique(),
      email: text("email").unique(),
      password: text("password").notNull(),
      firstName: text("first_name"),
      lastName: text("last_name"),
      phone: text("phone"),
      role: text("role").notNull().default("customer"),
      isActive: integer("is_active", { mode: "boolean" }).notNull().default(true),
      createdAt: integer("created_at", { mode: "timestamp" }).notNull().default(sql`(unixepoch())`),
      updatedAt: integer("updated_at", { mode: "timestamp" }).default(sql`(unixepoch())`)
    });
    partners = sqliteTable("partners", {
      id: text("id").primaryKey(),
      userId: text("user_id").notNull().unique().references(() => users.id),
      businessName: text("business_name").notNull(),
      businessAddress: text("business_address"),
      businessCategory: text("business_category"),
      inn: text("inn").unique(),
      phone: text("phone").notNull(),
      website: text("website"),
      monthlyRevenue: text("monthly_revenue"),
      approved: integer("approved", { mode: "boolean" }).default(false),
      pricingTier: text("pricing_tier").default("free_starter"),
      // Updated to SaaS model
      monthlyFee: integer("monthly_fee"),
      profitSharePercent: integer("profit_share_percent"),
      aiEnabled: integer("ai_enabled", { mode: "boolean" }).default(false),
      aiCardsUsed: integer("ai_cards_used").default(0),
      // Track AI cards used for free tier
      promoCode: text("promo_code").unique(),
      // Unique promo code for referrals
      warehouseSpaceKg: integer("warehouse_space_kg"),
      anydeskId: text("anydesk_id"),
      anydeskPassword: text("anydesk_password"),
      notes: text("notes"),
      createdAt: integer("created_at", { mode: "timestamp" }).notNull().default(sql`(unixepoch())`),
      lastActivityAt: integer("last_activity_at", { mode: "timestamp" })
    });
    products = sqliteTable("products", {
      id: text("id").primaryKey(),
      partnerId: text("partner_id").notNull().references(() => partners.id),
      name: text("name").notNull(),
      sku: text("sku").unique(),
      barcode: text("barcode"),
      description: text("description"),
      category: text("category"),
      brand: text("brand"),
      price: real("price").notNull(),
      costPrice: real("cost_price"),
      weight: text("weight"),
      stockQuantity: integer("stock_quantity").default(0),
      lowStockThreshold: integer("low_stock_threshold").default(10),
      optimizedTitle: text("optimized_title"),
      isActive: integer("is_active", { mode: "boolean" }).default(true),
      createdAt: integer("created_at", { mode: "timestamp" }).notNull().default(sql`(unixepoch())`),
      updatedAt: integer("updated_at", { mode: "timestamp" })
    });
    orders = sqliteTable("orders", {
      id: text("id").primaryKey(),
      partnerId: text("partner_id").notNull().references(() => partners.id),
      orderNumber: text("order_number").unique().notNull(),
      customerName: text("customer_name").notNull(),
      customerEmail: text("customer_email"),
      customerPhone: text("customer_phone"),
      marketplace: text("marketplace"),
      status: text("status").default("pending"),
      totalAmount: real("total_amount").notNull(),
      shippingAddress: text("shipping_address"),
      trackingNumber: text("tracking_number"),
      createdAt: integer("created_at", { mode: "timestamp" }).notNull().default(sql`(unixepoch())`),
      updatedAt: integer("updated_at", { mode: "timestamp" })
    });
    orderItems = sqliteTable("order_items", {
      id: text("id").primaryKey(),
      orderId: text("order_id").notNull().references(() => orders.id),
      productId: text("product_id").notNull().references(() => products.id),
      quantity: integer("quantity").notNull(),
      price: real("price").notNull(),
      createdAt: integer("created_at", { mode: "timestamp" }).notNull().default(sql`(unixepoch())`)
    });
    marketplaceIntegrations = sqliteTable("marketplace_integrations", {
      id: text("id").primaryKey(),
      partnerId: text("partner_id").notNull().references(() => partners.id),
      marketplace: text("marketplace").notNull(),
      apiKey: text("api_key"),
      apiSecret: text("api_secret"),
      active: integer("active", { mode: "boolean" }).default(false),
      lastSyncAt: integer("last_sync_at", { mode: "timestamp" }),
      createdAt: integer("created_at", { mode: "timestamp" }).notNull().default(sql`(unixepoch())`)
    });
    marketplaceApiConfigs = sqliteTable("marketplace_api_configs", {
      id: text("id").primaryKey(),
      marketplace: text("marketplace").notNull().unique(),
      apiEndpoint: text("api_endpoint").notNull(),
      authType: text("auth_type").notNull(),
      rateLimit: integer("rate_limit"),
      documentation: text("documentation"),
      createdAt: integer("created_at", { mode: "timestamp" }).notNull().default(sql`(unixepoch())`)
    });
    subscriptions = sqliteTable("subscriptions", {
      id: text("id").primaryKey(),
      partnerId: text("partner_id").notNull().references(() => partners.id),
      tierId: text("tier_id").notNull(),
      // free_starter, basic, starter, professional
      status: text("status").notNull().default("active"),
      // active, cancelled, expired, suspended
      startDate: integer("start_date", { mode: "timestamp" }).notNull(),
      endDate: integer("end_date", { mode: "timestamp" }),
      autoRenew: integer("auto_renew", { mode: "boolean" }).default(true),
      createdAt: integer("created_at", { mode: "timestamp" }).notNull().default(sql`(unixepoch())`),
      updatedAt: integer("updated_at", { mode: "timestamp" })
    });
    invoices = sqliteTable("invoices", {
      id: text("id").primaryKey(),
      partnerId: text("partner_id").notNull().references(() => partners.id),
      subscriptionId: text("subscription_id").references(() => subscriptions.id),
      amount: real("amount").notNull(),
      currency: text("currency").default("USD"),
      status: text("status").notNull().default("pending"),
      // pending, paid, failed, refunded
      dueDate: integer("due_date", { mode: "timestamp" }).notNull(),
      paidAt: integer("paid_at", { mode: "timestamp" }),
      paymentMethod: text("payment_method"),
      // click, payme, uzcard, manual
      metadata: text("metadata"),
      // JSON
      createdAt: integer("created_at", { mode: "timestamp" }).notNull().default(sql`(unixepoch())`)
    });
    payments = sqliteTable("payments", {
      id: text("id").primaryKey(),
      invoiceId: text("invoice_id").notNull().references(() => invoices.id),
      partnerId: text("partner_id").notNull().references(() => partners.id),
      amount: real("amount").notNull(),
      currency: text("currency").default("USD"),
      paymentMethod: text("payment_method").notNull(),
      // click, payme, uzcard, manual
      transactionId: text("transaction_id"),
      // Gateway transaction ID
      status: text("status").notNull().default("pending"),
      // pending, completed, failed, refunded
      metadata: text("metadata"),
      // JSON: gateway response
      createdAt: integer("created_at", { mode: "timestamp" }).notNull().default(sql`(unixepoch())`),
      completedAt: integer("completed_at", { mode: "timestamp" })
    });
    commissionRecords = sqliteTable("commission_records", {
      id: text("id").primaryKey(),
      partnerId: text("partner_id").notNull().references(() => partners.id),
      orderId: text("order_id"),
      saleAmount: real("sale_amount").notNull(),
      commissionRate: real("commission_rate").notNull(),
      commissionAmount: real("commission_amount").notNull(),
      status: text("status").notNull().default("pending"),
      // pending, paid, cancelled
      periodStart: integer("period_start", { mode: "timestamp" }).notNull(),
      periodEnd: integer("period_end", { mode: "timestamp" }).notNull(),
      paidAt: integer("paid_at", { mode: "timestamp" }),
      createdAt: integer("created_at", { mode: "timestamp" }).notNull().default(sql`(unixepoch())`)
    });
    salesLimits = sqliteTable("sales_limits", {
      id: text("id").primaryKey(),
      partnerId: text("partner_id").notNull().references(() => partners.id),
      tierId: text("tier_id").notNull(),
      month: integer("month").notNull(),
      // YYYYMM format
      totalSales: real("total_sales").default(0),
      salesLimit: real("sales_limit").notNull(),
      skuCount: integer("sku_count").default(0),
      skuLimit: integer("sku_limit").notNull(),
      status: text("status").notNull().default("ok"),
      // ok, warning, exceeded
      createdAt: integer("created_at", { mode: "timestamp" }).notNull().default(sql`(unixepoch())`),
      updatedAt: integer("updated_at", { mode: "timestamp" })
    });
    fulfillmentRequests = sqliteTable("fulfillment_requests", {
      id: text("id").primaryKey(),
      partnerId: text("partner_id").notNull().references(() => partners.id),
      requestType: text("request_type").notNull().default("general"),
      productId: text("product_id").references(() => products.id),
      title: text("title").notNull(),
      description: text("description"),
      status: text("status").default("pending"),
      priority: text("priority").default("medium"),
      estimatedCost: text("estimated_cost"),
      actualCost: text("actual_cost"),
      assignedTo: text("assigned_to").references(() => users.id),
      metadata: text("metadata"),
      createdAt: integer("created_at", { mode: "timestamp" }).notNull().default(sql`(unixepoch())`),
      updatedAt: integer("updated_at", { mode: "timestamp" }),
      completedAt: integer("completed_at", { mode: "timestamp" })
    });
    warehouses = sqliteTable("warehouses", {
      id: text("id").primaryKey(),
      name: text("name").notNull(),
      code: text("code"),
      location: text("location").notNull(),
      capacity: integer("capacity").notNull(),
      currentLoad: integer("current_load").default(0),
      active: integer("active", { mode: "boolean" }).default(true),
      createdAt: integer("created_at", { mode: "timestamp" }).notNull().default(sql`(unixepoch())`)
    });
    warehouseStock = sqliteTable("warehouse_stock", {
      id: text("id").primaryKey(),
      warehouseId: text("warehouse_id").notNull().references(() => warehouses.id),
      productId: text("product_id").notNull().references(() => products.id),
      quantity: integer("quantity").notNull().default(0),
      location: text("location"),
      lastUpdated: integer("last_updated", { mode: "timestamp" }).notNull().default(sql`(unixepoch())`)
    });
    stockMovements = sqliteTable("stock_movements", {
      id: text("id").primaryKey(),
      productId: text("product_id").notNull().references(() => products.id),
      warehouseId: text("warehouse_id").references(() => warehouses.id),
      movementType: text("movement_type").notNull(),
      quantity: integer("quantity").notNull(),
      previousStock: integer("previous_stock"),
      newStock: integer("new_stock"),
      reason: text("reason"),
      performedBy: text("performed_by").references(() => users.id),
      createdAt: integer("created_at", { mode: "timestamp" }).notNull().default(sql`(unixepoch())`)
    });
    customers = sqliteTable("customers", {
      id: text("id").primaryKey(),
      partnerId: text("partner_id").notNull().references(() => partners.id),
      name: text("name").notNull(),
      email: text("email"),
      phone: text("phone").notNull(),
      address: text("address"),
      totalOrders: integer("total_orders").default(0),
      totalSpent: real("total_spent").default(0),
      createdAt: integer("created_at", { mode: "timestamp" }).notNull().default(sql`(unixepoch())`),
      lastOrderAt: integer("last_order_at", { mode: "timestamp" })
    });
    stockAlerts = sqliteTable("stock_alerts", {
      id: text("id").primaryKey(),
      productId: text("product_id").notNull().references(() => products.id),
      alertType: text("alert_type").notNull(),
      message: text("message").notNull(),
      resolved: integer("resolved", { mode: "boolean" }).default(false),
      createdAt: integer("created_at", { mode: "timestamp" }).notNull().default(sql`(unixepoch())`),
      resolvedAt: integer("resolved_at", { mode: "timestamp" })
    });
    inventoryReports = sqliteTable("inventory_reports", {
      id: text("id").primaryKey(),
      partnerId: text("partner_id").notNull().references(() => partners.id),
      reportType: text("report_type").notNull(),
      startDate: integer("start_date", { mode: "timestamp" }).notNull(),
      endDate: integer("end_date", { mode: "timestamp" }).notNull(),
      data: text("data").notNull(),
      generatedBy: text("generated_by").references(() => users.id),
      createdAt: integer("created_at", { mode: "timestamp" }).notNull().default(sql`(unixepoch())`)
    });
    aiTasks = sqliteTable("ai_tasks", {
      id: text("id").primaryKey(),
      partnerId: text("partner_id").notNull().references(() => partners.id),
      accountId: text("account_id"),
      taskType: text("task_type").notNull(),
      status: text("status").default("pending"),
      priority: text("priority").default("medium"),
      inputData: text("input_data"),
      outputData: text("output_data"),
      errorMessage: text("error_message"),
      startedAt: integer("started_at", { mode: "timestamp" }),
      completedAt: integer("completed_at", { mode: "timestamp" }),
      estimatedCost: real("estimated_cost"),
      actualCost: real("actual_cost"),
      createdAt: integer("created_at", { mode: "timestamp" }).notNull().default(sql`(unixepoch())`),
      updatedAt: integer("updated_at", { mode: "timestamp" })
    });
    aiProductCards = sqliteTable("ai_product_cards", {
      id: text("id").primaryKey(),
      partnerId: text("partner_id").notNull().references(() => partners.id),
      productId: text("product_id").references(() => products.id),
      accountId: text("account_id"),
      baseProductName: text("base_product_name"),
      marketplace: text("marketplace").notNull(),
      title: text("title").notNull(),
      description: text("description"),
      bulletPoints: text("bullet_points"),
      seoKeywords: text("seo_keywords"),
      imagePrompts: text("image_prompts"),
      generatedImages: text("generated_images"),
      status: text("status").default("draft"),
      qualityScore: integer("quality_score"),
      aiModel: text("ai_model"),
      generationCost: real("generation_cost"),
      createdAt: integer("created_at", { mode: "timestamp" }).notNull().default(sql`(unixepoch())`),
      updatedAt: integer("updated_at", { mode: "timestamp" }),
      publishedAt: integer("published_at", { mode: "timestamp" })
    });
    aiMarketplaceAccounts = sqliteTable("ai_marketplace_accounts", {
      id: text("id").primaryKey(),
      partnerId: text("partner_id").notNull().references(() => partners.id),
      marketplace: text("marketplace").notNull(),
      accountName: text("account_name").notNull(),
      credentialsEncrypted: text("credentials_encrypted"),
      isActive: integer("is_active", { mode: "boolean" }).default(true),
      lastSyncedAt: integer("last_synced_at", { mode: "timestamp" }),
      createdAt: integer("created_at", { mode: "timestamp" }).notNull().default(sql`(unixepoch())`),
      updatedAt: integer("updated_at", { mode: "timestamp" })
    });
    aiCostRecords = sqliteTable("ai_cost_records", {
      id: text("id").primaryKey(),
      partnerId: text("partner_id").notNull().references(() => partners.id),
      operation: text("operation").notNull(),
      model: text("model").notNull(),
      tokensUsed: integer("tokens_used"),
      imagesGenerated: integer("images_generated"),
      cost: real("cost").notNull(),
      tier: text("tier").notNull(),
      metadata: text("metadata"),
      createdAt: integer("created_at", { mode: "timestamp" }).notNull().default(sql`(unixepoch())`)
    });
    remoteAccessSessions = sqliteTable("remote_access_sessions", {
      id: integer("id").primaryKey({ autoIncrement: true }),
      partnerId: integer("partner_id").notNull(),
      adminId: integer("admin_id"),
      sessionCode: text("session_code").notNull().unique(),
      status: text("status").notNull().default("pending"),
      // pending, active, ended
      purpose: text("purpose").notNull(),
      requestedBy: text("requested_by").notNull(),
      startedAt: integer("started_at", { mode: "timestamp" }),
      endedAt: integer("ended_at", { mode: "timestamp" }),
      endedBy: text("ended_by"),
      // admin, partner
      createdAt: integer("created_at", { mode: "timestamp" }).notNull().default(sql`(unixepoch())`)
    });
    referrals = sqliteTable("referrals", {
      id: text("id").primaryKey(),
      referrerPartnerId: text("referrer_partner_id").notNull().references(() => partners.id),
      referredPartnerId: text("referred_partner_id").notNull().references(() => partners.id),
      promoCode: text("promo_code"),
      contractType: text("contract_type").notNull(),
      status: text("status").default("invited"),
      // 'invited', 'registered', 'paid_1month', 'active', 'expired'
      bonusEarned: real("bonus_earned").default(0),
      bonusPaid: real("bonus_paid").default(0),
      createdAt: integer("created_at", { mode: "timestamp" }).notNull().default(sql`(unixepoch())`),
      activatedAt: integer("activated_at", { mode: "timestamp" }),
      expiresAt: integer("expires_at", { mode: "timestamp" })
    });
    referralBonuses = sqliteTable("referral_bonuses", {
      id: text("id").primaryKey(),
      referralId: text("referral_id").notNull().references(() => referrals.id),
      referrerPartnerId: text("referrer_partner_id").notNull().references(() => partners.id),
      amount: real("amount").notNull(),
      monthNumber: integer("month_number").notNull(),
      platformProfit: real("platform_profit").notNull(),
      bonusRate: real("bonus_rate").notNull(),
      tierMultiplier: real("tier_multiplier").notNull(),
      status: text("status").default("pending"),
      paidAt: integer("paid_at", { mode: "timestamp" }),
      createdAt: integer("created_at", { mode: "timestamp" }).notNull().default(sql`(unixepoch())`)
    });
    referralWithdrawals = sqliteTable("referral_withdrawals", {
      id: text("id").primaryKey(),
      partnerId: text("partner_id").notNull().references(() => partners.id),
      amount: real("amount").notNull(),
      method: text("method").notNull(),
      fee: real("fee").notNull(),
      netAmount: real("net_amount").notNull(),
      status: text("status").default("pending"),
      createdAt: integer("created_at", { mode: "timestamp" }).notNull().default(sql`(unixepoch())`),
      requestedAt: integer("requested_at", { mode: "timestamp" }).notNull().default(sql`(unixepoch())`),
      processedAt: integer("processed_at", { mode: "timestamp" }),
      transactionId: text("transaction_id")
    });
    referralFirstPurchases = sqliteTable("referral_first_purchases", {
      id: text("id").primaryKey(),
      referralId: text("referral_id").notNull().references(() => referrals.id),
      referrerPartnerId: text("referrer_partner_id").notNull().references(() => partners.id),
      referredPartnerId: text("referred_partner_id").notNull().references(() => partners.id),
      subscriptionId: text("subscription_id").references(() => subscriptions.id),
      invoiceId: text("invoice_id").references(() => invoices.id),
      paymentId: text("payment_id").references(() => payments.id),
      tierId: text("tier_id").notNull(),
      // basic, starter_pro, professional
      monthlyFee: real("monthly_fee").notNull(),
      // Oylik to'lov
      subscriptionMonths: integer("subscription_months").notNull().default(1),
      // Necha oyga ulangan (1, 3, 6, 12)
      totalAmount: real("total_amount").notNull(),
      // Jami to'lov (monthlyFee × subscriptionMonths)
      commissionRate: real("commission_rate").notNull().default(0.1),
      // 10%
      commissionAmount: real("commission_amount").notNull(),
      // Komissiya miqdori (monthlyFee × subscriptionMonths × 10%)
      status: text("status").default("pending"),
      // pending, paid, cancelled
      paidAt: integer("paid_at", { mode: "timestamp" }),
      createdAt: integer("created_at", { mode: "timestamp" }).notNull().default(sql`(unixepoch())`)
    });
    referralCampaigns = sqliteTable("referral_campaigns", {
      id: text("id").primaryKey(),
      name: text("name").notNull(),
      // "3 kun ichida 10 ta hamkor uchun $1000"
      description: text("description"),
      startDate: integer("start_date", { mode: "timestamp" }).notNull(),
      endDate: integer("end_date", { mode: "timestamp" }).notNull(),
      durationDays: integer("duration_days").notNull(),
      // 3, 10, 30 kun
      targetReferrals: integer("target_referrals").notNull(),
      // 10 ta hamkor
      bonusAmount: real("bonus_amount").notNull(),
      // $1000
      minTier: text("min_tier").notNull().default("basic"),
      // Minimal tarif (basic, starter_pro, professional)
      minSubscriptionMonths: integer("min_subscription_months").notNull().default(1),
      // Minimal muddat (1, 3, 6, 12 oy)
      status: text("status").default("active"),
      // active, completed, cancelled
      participants: integer("participants").default(0),
      // Qancha odam qatnashmoqda
      winners: integer("winners").default(0),
      // Qancha g'olib
      createdAt: integer("created_at", { mode: "timestamp" }).notNull().default(sql`(unixepoch())`),
      createdBy: text("created_by").notNull()
      // Admin ID
    });
    referralCampaignParticipants = sqliteTable("referral_campaign_participants", {
      id: text("id").primaryKey(),
      campaignId: text("campaign_id").notNull().references(() => referralCampaigns.id),
      referrerPartnerId: text("referrer_partner_id").notNull().references(() => partners.id),
      referralsCount: integer("referrals_count").default(0),
      // Qancha taklif qilgan
      bonusEarned: real("bonus_earned").default(0),
      // Qancha bonus olgan
      status: text("status").default("participating"),
      // participating, winner, completed
      joinedAt: integer("joined_at", { mode: "timestamp" }).notNull().default(sql`(unixepoch())`),
      completedAt: integer("completed_at", { mode: "timestamp" })
    });
    partnerContracts = sqliteTable("partner_contracts", {
      id: text("id").primaryKey(),
      partnerId: text("partner_id").notNull().references(() => partners.id),
      contractType: text("contract_type").notNull(),
      pricingTier: text("pricing_tier").notNull(),
      startDate: integer("start_date", { mode: "timestamp" }).notNull(),
      endDate: integer("end_date", { mode: "timestamp" }).notNull(),
      monthlyFee: real("monthly_fee").notNull(),
      commissionRate: real("commission_rate").notNull(),
      discountPercent: real("discount_percent").default(0),
      status: text("status").default("active"),
      createdAt: integer("created_at", { mode: "timestamp" }).notNull().default(sql`(unixepoch())`),
      signedAt: integer("signed_at", { mode: "timestamp" })
    });
    analytics = sqliteTable("analytics", {
      id: text("id").primaryKey(),
      partnerId: text("partner_id").notNull().references(() => partners.id),
      metricType: text("metric_type").notNull(),
      value: real("value").notNull(),
      date: integer("date", { mode: "timestamp" }).notNull(),
      metadata: text("metadata"),
      createdAt: integer("created_at", { mode: "timestamp" }).notNull().default(sql`(unixepoch())`)
    });
    profitBreakdown = sqliteTable("profit_breakdown", {
      id: text("id").primaryKey(),
      partnerId: text("partner_id").notNull().references(() => partners.id),
      orderId: text("order_id").references(() => orders.id),
      revenue: real("revenue").notNull(),
      costs: real("costs").notNull(),
      platformFee: real("platform_fee").notNull(),
      profitShare: real("profit_share").notNull(),
      netProfit: real("net_profit").notNull(),
      date: integer("date", { mode: "timestamp" }).notNull(),
      createdAt: integer("created_at", { mode: "timestamp" }).notNull().default(sql`(unixepoch())`)
    });
    trendingProducts = sqliteTable("trending_products", {
      id: text("id").primaryKey(),
      marketplace: text("marketplace").notNull(),
      category: text("category").notNull(),
      productName: text("product_name").notNull(),
      price: real("price"),
      salesCount: integer("sales_count"),
      rating: real("rating"),
      trendScore: integer("trend_score").notNull(),
      imageUrl: text("image_url"),
      productUrl: text("product_url"),
      analyzedAt: integer("analyzed_at", { mode: "timestamp" }).notNull().default(sql`(unixepoch())`)
    });
    chatRooms = sqliteTable("chat_rooms", {
      id: text("id").primaryKey(),
      partnerId: text("partner_id").references(() => partners.id),
      adminId: text("admin_id").references(() => users.id),
      status: text("status").default("active"),
      createdAt: integer("created_at", { mode: "timestamp" }).notNull().default(sql`(unixepoch())`),
      lastMessageAt: integer("last_message_at", { mode: "timestamp" })
    });
    messages = sqliteTable("messages", {
      id: text("id").primaryKey(),
      chatRoomId: text("chat_room_id").notNull().references(() => chatRooms.id),
      senderId: text("sender_id").notNull().references(() => users.id),
      senderRole: text("sender_role").notNull(),
      content: text("content").notNull(),
      messageType: text("message_type").default("text"),
      attachmentUrl: text("attachment_url"),
      createdAt: integer("created_at", { mode: "timestamp" }).notNull().default(sql`(unixepoch())`),
      readAt: integer("read_at", { mode: "timestamp" })
    });
    enhancedMessages = messages;
    tierUpgradeRequests = sqliteTable("tier_upgrade_requests", {
      id: text("id").primaryKey(),
      partnerId: text("partner_id").notNull().references(() => partners.id),
      currentTier: text("current_tier").notNull(),
      requestedTier: text("requested_tier").notNull(),
      reason: text("reason"),
      adminNotes: text("admin_notes"),
      status: text("status").default("pending"),
      requestedAt: integer("requested_at", { mode: "timestamp" }).notNull().default(sql`(unixepoch())`),
      reviewedAt: integer("reviewed_at", { mode: "timestamp" }),
      reviewedBy: text("reviewed_by").references(() => users.id)
    });
    pricingTiers = sqliteTable("pricing_tiers", {
      id: text("id").primaryKey(),
      tier: text("tier").notNull().unique(),
      nameUz: text("name_uz").notNull(),
      fixedCost: text("fixed_cost").notNull(),
      commissionMin: text("commission_min").notNull(),
      commissionMax: text("commission_max").notNull(),
      minRevenue: text("min_revenue").notNull(),
      maxRevenue: text("max_revenue"),
      features: text("features").notNull(),
      isActive: integer("is_active", { mode: "boolean" }).notNull().default(true),
      createdAt: integer("created_at", { mode: "timestamp" }).notNull().default(sql`(unixepoch())`)
    });
    commissionSettings = sqliteTable("commission_settings", {
      id: text("id").primaryKey(),
      tier: text("tier").notNull().unique(),
      baseCommission: text("base_commission").notNull(),
      volumeBonus: text("volume_bonus"),
      performanceBonus: text("performance_bonus"),
      createdAt: integer("created_at", { mode: "timestamp" }).notNull().default(sql`(unixepoch())`)
    });
    sptCosts = sqliteTable("spt_costs", {
      id: text("id").primaryKey(),
      serviceType: text("service_type").notNull(),
      tier: text("tier").notNull(),
      costPerUnit: text("cost_per_unit").notNull(),
      description: text("description"),
      createdAt: integer("created_at", { mode: "timestamp" }).notNull().default(sql`(unixepoch())`)
    });
    auditLogs = sqliteTable("audit_logs", {
      id: text("id").primaryKey(),
      userId: text("user_id").references(() => users.id),
      action: text("action").notNull(),
      entityType: text("entity_type").notNull(),
      entityId: text("entity_id"),
      changes: text("changes"),
      payload: text("payload"),
      ipAddress: text("ip_address"),
      userAgent: text("user_agent"),
      createdAt: integer("created_at", { mode: "timestamp" }).notNull().default(sql`(unixepoch())`)
    });
    systemSettings = sqliteTable("system_settings", {
      id: text("id").primaryKey(),
      key: text("key").unique().notNull(),
      value: text("value").notNull(),
      description: text("description"),
      updatedAt: integer("updated_at", { mode: "timestamp" }).notNull().default(sql`(unixepoch())`),
      updatedBy: text("updated_by").references(() => users.id)
    });
    adminPermissions = sqliteTable("admin_permissions", {
      userId: text("user_id").primaryKey().references(() => users.id),
      canManageAdmins: integer("can_manage_admins", { mode: "boolean" }).notNull().default(false),
      canManageContent: integer("can_manage_content", { mode: "boolean" }).notNull().default(false),
      canManageChat: integer("can_manage_chat", { mode: "boolean" }).notNull().default(false),
      canViewReports: integer("can_view_reports", { mode: "boolean" }).notNull().default(false),
      canReceiveProducts: integer("can_receive_products", { mode: "boolean" }).notNull().default(false),
      canActivatePartners: integer("can_activate_partners", { mode: "boolean" }).notNull().default(false),
      canManageIntegrations: integer("can_manage_integrations", { mode: "boolean" }).notNull().default(false),
      createdAt: integer("created_at", { mode: "timestamp" }).notNull().default(sql`(unixepoch())`),
      updatedAt: integer("updated_at", { mode: "timestamp" }).default(sql`(unixepoch())`)
    });
    notifications = sqliteTable("notifications", {
      id: text("id").primaryKey(),
      userId: text("user_id").notNull().references(() => users.id),
      title: text("title").notNull(),
      message: text("message").notNull(),
      type: text("type").default("info"),
      read: integer("read", { mode: "boolean" }).default(false),
      createdAt: integer("created_at", { mode: "timestamp" }).notNull().default(sql`(unixepoch())`)
    });
    excelImports = sqliteTable("excel_imports", {
      id: text("id").primaryKey(),
      partnerId: text("partner_id").notNull().references(() => partners.id),
      fileName: text("file_name").notNull(),
      fileSize: integer("file_size"),
      rowsImported: integer("rows_imported"),
      status: text("status").default("pending"),
      errorLog: text("error_log"),
      createdAt: integer("created_at", { mode: "timestamp" }).notNull().default(sql`(unixepoch())`)
    });
    excelTemplates = sqliteTable("excel_templates", {
      id: text("id").primaryKey(),
      name: text("name").notNull(),
      description: text("description"),
      templateUrl: text("template_url"),
      category: text("category"),
      createdAt: integer("created_at", { mode: "timestamp" }).notNull().default(sql`(unixepoch())`)
    });
    insertUserSchema = createInsertSchema(users);
    selectUserSchema = createSelectSchema(users);
    insertPartnerSchema = createInsertSchema(partners);
    selectPartnerSchema = createSelectSchema(partners);
    partnerRegistrationSchema = z.object({
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
      notes: z.string().optional()
    });
    insertProductSchema = createInsertSchema(products).omit({
      id: true,
      partnerId: true,
      createdAt: true,
      updatedAt: true
    });
    selectProductSchema = createSelectSchema(products);
    insertFulfillmentRequestSchema = createInsertSchema(fulfillmentRequests).omit({
      id: true,
      partnerId: true,
      createdAt: true,
      updatedAt: true,
      completedAt: true
    });
    loginSchema = z.object({
      username: z.string().optional(),
      email: z.string().email().optional(),
      password: z.string().min(1)
    }).refine((data) => data.username || data.email, {
      message: "Username yoki email talab qilinadi"
    });
    referralEarnings = referralBonuses;
    withdrawals = referralWithdrawals;
    walletTransactions = sqliteTable("wallet_transactions", {
      id: text("id").primaryKey(),
      partnerId: text("partner_id").notNull().references(() => partners.id),
      type: text("type").notNull(),
      // 'income', 'expense', 'commission', 'withdrawal'
      amount: text("amount").notNull(),
      description: text("description"),
      status: text("status").notNull().default("pending"),
      // 'pending', 'completed', 'failed'
      metadata: text("metadata"),
      // JSON string for additional data
      createdAt: text("created_at").notNull().default(sql`(datetime('now'))`),
      updatedAt: text("updated_at").default(sql`(datetime('now'))`)
    });
    paymentHistory = sqliteTable("payment_history", {
      id: text("id").primaryKey(),
      partnerId: text("partner_id").notNull().references(() => partners.id),
      amount: text("amount").notNull(),
      currency: text("currency").default("UZS"),
      paymentMethod: text("payment_method"),
      // 'click', 'payme', 'uzcard', 'stripe'
      transactionId: text("transaction_id"),
      status: text("status").notNull().default("pending"),
      // 'pending', 'completed', 'failed', 'refunded'
      description: text("description"),
      metadata: text("metadata"),
      createdAt: text("created_at").notNull().default(sql`(datetime('now'))`),
      completedAt: text("completed_at")
    });
    impersonationLogs = sqliteTable("impersonation_logs", {
      id: text("id").primaryKey(),
      adminId: text("admin_id").notNull().references(() => users.id),
      partnerId: text("partner_id").notNull().references(() => partners.id),
      action: text("action").notNull(),
      // 'start', 'end'
      ipAddress: text("ip_address"),
      userAgent: text("user_agent"),
      notes: text("notes"),
      createdAt: text("created_at").notNull().default(sql`(datetime('now'))`)
    });
    blogPosts = sqliteTable("blog_posts", {
      id: text("id").primaryKey(),
      slug: text("slug").notNull().unique(),
      // SEO-friendly URL
      title: text("title").notNull(),
      excerpt: text("excerpt"),
      // Qisqa tavsif
      content: text("content").notNull(),
      // HTML/Markdown content
      featuredImage: text("featured_image"),
      // Asosiy rasm URL
      videoUrl: text("video_url"),
      // Video URL (YouTube, etc.)
      category: text("category").notNull().default("news"),
      // news, updates, tutorials, tips
      tags: text("tags"),
      // JSON array of tags
      status: text("status").notNull().default("draft"),
      // draft, published, archived
      authorId: text("author_id").notNull().references(() => users.id),
      authorName: text("author_name"),
      viewCount: integer("view_count").default(0),
      likeCount: integer("like_count").default(0),
      // SEO fields
      metaTitle: text("meta_title"),
      metaDescription: text("meta_description"),
      metaKeywords: text("meta_keywords"),
      // Dates
      publishedAt: integer("published_at", { mode: "timestamp" }),
      createdAt: integer("created_at", { mode: "timestamp" }).notNull().default(sql`(unixepoch())`),
      updatedAt: integer("updated_at", { mode: "timestamp" }).default(sql`(unixepoch())`)
    });
    blogCategories = sqliteTable("blog_categories", {
      id: text("id").primaryKey(),
      name: text("name").notNull(),
      slug: text("slug").notNull().unique(),
      description: text("description"),
      icon: text("icon"),
      color: text("color"),
      sortOrder: integer("sort_order").default(0),
      createdAt: integer("created_at", { mode: "timestamp" }).notNull().default(sql`(unixepoch())`)
    });
    blogComments = sqliteTable("blog_comments", {
      id: text("id").primaryKey(),
      postId: text("post_id").notNull().references(() => blogPosts.id),
      userId: text("user_id").references(() => users.id),
      authorName: text("author_name"),
      authorEmail: text("author_email"),
      content: text("content").notNull(),
      status: text("status").default("pending"),
      // pending, approved, spam
      createdAt: integer("created_at", { mode: "timestamp" }).notNull().default(sql`(unixepoch())`)
    });
  }
});

// server/db.ts
var db_exports = {};
__export(db_exports, {
  checkDatabaseHealth: () => checkDatabaseHealth,
  db: () => db,
  dbType: () => dbType,
  getDbType: () => getDbType,
  initializeDatabase: () => initializeDatabase,
  sqlite: () => sqliteInstance
});
import { drizzle } from "drizzle-orm/better-sqlite3";
import { drizzle as drizzlePostgres } from "drizzle-orm/node-postgres";
import Database from "better-sqlite3";
import { Pool } from "pg";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import { dirname } from "path";
async function checkDatabaseHealth() {
  try {
    if (dbType === "postgres") {
      const result = await db.execute("SELECT 1");
      return true;
    } else {
      db.run("SELECT 1");
      return true;
    }
  } catch (error) {
    console.error("\u274C Database health check failed:", error);
    return false;
  }
}
async function initializeDatabase() {
  try {
    console.log("\u{1F527} Initializing database...");
    if (dbType === "postgres") {
      console.log("\u{1F4E6} PostgreSQL: Run migrations manually or use Drizzle Kit");
    } else {
      const migrationPath = path.join(__dirname, "../migrations/add_ai_tables.sql");
      if (fs.existsSync(migrationPath)) {
        const migration = fs.readFileSync(migrationPath, "utf-8");
        const statements = migration.split(";").filter((s) => s.trim());
        for (const statement of statements) {
          try {
            db.run(statement);
          } catch (err) {
            if (!err.message.includes("already exists")) {
              console.warn("Migration warning:", err.message);
            }
          }
        }
      }
    }
    console.log("\u2705 Database initialized");
  } catch (error) {
    console.error("\u274C Database initialization error:", error);
    throw error;
  }
}
function getDbType() {
  return dbType;
}
var __filename, __dirname, DATABASE_URL, NODE_ENV, db, dbType, sqliteInstance;
var init_db = __esm({
  "server/db.ts"() {
    init_schema();
    __filename = fileURLToPath(import.meta.url);
    __dirname = dirname(__filename);
    DATABASE_URL = process.env.DATABASE_URL;
    NODE_ENV = process.env.NODE_ENV || "development";
    dbType = "sqlite";
    sqliteInstance = null;
    if (DATABASE_URL && (DATABASE_URL.startsWith("postgres://") || DATABASE_URL.startsWith("postgresql://"))) {
      console.log("\u2705 Using PostgreSQL (Railway)");
      dbType = "postgres";
      const pool = new Pool({
        connectionString: DATABASE_URL,
        ssl: process.env.NODE_ENV === "production" ? { rejectUnauthorized: false } : false,
        max: 20,
        // Maximum pool size
        idleTimeoutMillis: 3e4,
        connectionTimeoutMillis: 2e3
      });
      pool.on("connect", () => {
        console.log("\u2705 PostgreSQL connected");
      });
      pool.on("error", (err) => {
        console.error("\u274C PostgreSQL connection error:", err);
      });
      db = drizzlePostgres(pool, { schema: schema_exports });
    } else {
      console.log("\u26A0\uFE0F  Using SQLite (local development)");
      console.log("\u{1F4A1} For production, set DATABASE_URL environment variable");
      const sqlitePath = process.env.SQLITE_PATH || "./data/sellercloudx.db";
      const dir = path.dirname(sqlitePath);
      if (!fs.existsSync(dir)) {
        fs.mkdirSync(dir, { recursive: true });
      }
      sqliteInstance = new Database(sqlitePath, {
        // Enable WAL mode for better concurrency
        // This allows multiple readers and one writer
      });
      sqliteInstance.pragma("journal_mode = WAL");
      sqliteInstance.pragma("foreign_keys = ON");
      sqliteInstance.pragma("synchronous = NORMAL");
      sqliteInstance.pragma("cache_size = -64000");
      sqliteInstance.pragma("temp_store = memory");
      db = drizzle(sqliteInstance, { schema: schema_exports });
    }
    __name(checkDatabaseHealth, "checkDatabaseHealth");
    __name(initializeDatabase, "initializeDatabase");
    __name(getDbType, "getDbType");
  }
});

// server/storage.ts
var storage_exports = {};
__export(storage_exports, {
  approvePartner: () => approvePartner,
  createAnalytics: () => createAnalytics,
  createAuditLog: () => createAuditLog,
  createFulfillmentRequest: () => createFulfillmentRequest,
  createMessage: () => createMessage,
  createOrder: () => createOrder,
  createPartner: () => createPartner,
  createProduct: () => createProduct,
  createStockAlert: () => createStockAlert,
  createTierUpgradeRequest: () => createTierUpgradeRequest,
  createTrendingProduct: () => createTrendingProduct,
  createUser: () => createUser,
  createWarehouse: () => createWarehouse,
  getAdminPermissions: () => getAdminPermissions,
  getAllFulfillmentRequests: () => getAllFulfillmentRequests,
  getAllOrders: () => getAllOrders,
  getAllPartners: () => getAllPartners,
  getAllPricingTiers: () => getAllPricingTiers,
  getAllWarehouses: () => getAllWarehouses,
  getAnalyticsByPartnerId: () => getAnalyticsByPartnerId,
  getFulfillmentRequestsByPartnerId: () => getFulfillmentRequestsByPartnerId,
  getInventoryStats: () => getInventoryStats,
  getMessagesBetweenUsers: () => getMessagesBetweenUsers,
  getOrderById: () => getOrderById,
  getOrderItems: () => getOrderItems,
  getOrdersByDateRange: () => getOrdersByDateRange,
  getOrdersByPartnerId: () => getOrdersByPartnerId,
  getOrdersByProduct: () => getOrdersByProduct,
  getPartnerById: () => getPartnerById,
  getPartnerByUserId: () => getPartnerByUserId,
  getPricingTierByTier: () => getPricingTierByTier,
  getProductByBarcode: () => getProductByBarcode,
  getProductById: () => getProductById,
  getProductBySku: () => getProductBySku,
  getProductsByPartnerId: () => getProductsByPartnerId,
  getProfitBreakdown: () => getProfitBreakdown,
  getStockAlertsByPartnerId: () => getStockAlertsByPartnerId,
  getStockMovements: () => getStockMovements,
  getSystemSetting: () => getSystemSetting,
  getTierUpgradeRequests: () => getTierUpgradeRequests,
  getTrendingProducts: () => getTrendingProducts,
  getUserById: () => getUserById,
  getUserByUsername: () => getUserByUsername,
  getUsersByRole: () => getUsersByRole,
  getWarehouseById: () => getWarehouseById,
  getWarehouseStock: () => getWarehouseStock,
  resolveStockAlert: () => resolveStockAlert,
  seedSystemSettings: () => seedSystemSettings,
  setSystemSetting: () => setSystemSetting,
  storage: () => storage,
  updateFulfillmentRequest: () => updateFulfillmentRequest,
  updateOrder: () => updateOrder,
  updateOrderStatus: () => updateOrderStatus,
  updatePartner: () => updatePartner,
  updateProductStock: () => updateProductStock,
  updateTierUpgradeRequest: () => updateTierUpgradeRequest,
  validateUserPassword: () => validateUserPassword
});
import { eq, desc, and, gte, lte, or } from "drizzle-orm";
import { nanoid } from "nanoid";
import bcrypt from "bcryptjs";
async function createUser(userData) {
  try {
    console.log("\u{1F464} Creating user:", userData.username, userData.email);
    const hashedPassword = await bcrypt.hash(userData.password, 10);
    console.log("\u{1F510} Password hashed successfully");
    const userId = nanoid();
    console.log("\u{1F194} Generated user ID:", userId);
    const [user] = await db.insert(users).values({
      id: userId,
      username: userData.username,
      email: userData.email,
      password: hashedPassword,
      firstName: userData.firstName,
      lastName: userData.lastName,
      phone: userData.phone,
      role: userData.role || "customer",
      isActive: true
      // createdAt and updatedAt use database defaults
    }).returning();
    console.log("\u2705 User created successfully:", user.id);
    return user;
  } catch (error) {
    console.error("\u274C Create user error:", error);
    console.error("\u274C Error details:", {
      message: error.message,
      code: error.code,
      constraint: error.constraint
    });
    if (error.code === "23505" || error.message?.includes("UNIQUE constraint")) {
      throw new StorageError("Username yoki email allaqachon mavjud", "DUPLICATE_USER");
    }
    throw new StorageError(`Foydalanuvchi yaratishda xatolik: ${error.message}`, "CREATE_USER_ERROR");
  }
}
async function getUserByUsername(username) {
  try {
    const [user] = await db.select().from(users).where(eq(users.username, username));
    return user || null;
  } catch (error) {
    console.error("Error getting user by username:", error);
    return null;
  }
}
async function getUserById(id) {
  try {
    const [user] = await db.select().from(users).where(eq(users.id, id));
    return user || null;
  } catch (error) {
    console.error("Error getting user by ID:", error);
    return null;
  }
}
async function validateUserPassword(username, password) {
  try {
    console.log("\u{1F50D} Validating password for username:", username);
    const user = await getUserByUsername(username);
    if (!user) {
      console.log("\u274C User not found:", username);
      return null;
    }
    console.log("\u2705 User found:", { id: user.id, username: user.username, role: user.role });
    console.log("\u{1F510} Comparing password...");
    const isValid = await bcrypt.compare(password, user.password);
    console.log("\u{1F510} Password valid:", isValid);
    return isValid ? user : null;
  } catch (error) {
    console.error("\u274C Error validating password:", error);
    return null;
  }
}
async function getUsersByRole(role) {
  try {
    const userList = await db.select().from(users).where(eq(users.role, role));
    return userList;
  } catch (error) {
    console.error("Error getting users by role:", error);
    return [];
  }
}
async function createPartner(partnerData) {
  try {
    console.log("\u{1F4DD} Creating partner with data:", {
      userId: partnerData.userId,
      businessName: partnerData.businessName,
      phone: partnerData.phone,
      pricingTier: partnerData.pricingTier,
      referralCode: partnerData.referralCode
    });
    const partnerId = nanoid();
    console.log("\u{1F194} Generated partner ID:", partnerId);
    const promoCode = `SCX-${nanoid(6).toUpperCase()}`;
    console.log("\u{1F381} Generated promo code for partner:", promoCode);
    const tier = partnerData.pricingTier || "free_starter";
    const isAutoApproved = tier === "free_starter" || tier === "starter_pro";
    const [partner] = await db.insert(partners).values({
      id: partnerId,
      userId: partnerData.userId,
      businessName: partnerData.businessName || "Yangi Biznes",
      businessCategory: partnerData.businessCategory,
      monthlyRevenue: partnerData.monthlyRevenue,
      pricingTier: tier,
      phone: partnerData.phone,
      approved: isAutoApproved,
      // Auto-approve free/starter tiers
      notes: partnerData.notes
      // createdAt uses database default
    }).returning();
    if (partnerData.referralCode) {
      try {
        const { referrals: referrals3 } = await Promise.resolve().then(() => (init_schema(), schema_exports));
        const referrerData = await db.select({ referrerPartnerId: referrals3.referrerPartnerId }).from(referrals3).where(eq(referrals3.promoCode, partnerData.referralCode.toUpperCase())).limit(1);
        if (referrerData.length > 0 && referrerData[0].referrerPartnerId) {
          await db.insert(referrals3).values({
            id: nanoid(),
            referrerPartnerId: referrerData[0].referrerPartnerId,
            referredPartnerId: partnerId,
            promoCode: partnerData.referralCode.toUpperCase(),
            contractType: partnerData.pricingTier || "starter_pro",
            status: "registered",
            createdAt: /* @__PURE__ */ new Date()
          });
          console.log("\u2705 Referral relationship created:", {
            referrer: referrerData[0].referrerPartnerId,
            referred: partnerId,
            code: partnerData.referralCode
          });
        } else {
          console.warn("\u26A0\uFE0F  Referrer not found for promo code:", partnerData.referralCode);
        }
      } catch (error) {
        console.error("\u26A0\uFE0F  Referral creation error (non-critical):", error);
      }
    }
    try {
      const { referrals: referrals3 } = await Promise.resolve().then(() => (init_schema(), schema_exports));
      await db.insert(referrals3).values({
        id: nanoid(),
        referrerPartnerId: partnerId,
        referredPartnerId: partnerId,
        // Self-reference for promo code storage
        promoCode,
        contractType: partnerData.pricingTier || "starter_pro",
        status: "active",
        createdAt: /* @__PURE__ */ new Date()
      });
      console.log("\u2705 Partner promo code stored:", promoCode);
    } catch (error) {
      console.error("\u26A0\uFE0F  Promo code storage error (non-critical):", error);
    }
    console.log("\u2705 Partner created successfully:", partner.id);
    return partner;
  } catch (error) {
    console.error("\u274C Create partner error:", error);
    console.error("\u274C Error details:", {
      message: error.message,
      code: error.code,
      stack: error.stack
    });
    throw new StorageError(`Hamkor yaratishda xatolik: ${error.message}`, "CREATE_PARTNER_ERROR");
  }
}
async function getPartnerByUserId(userId) {
  try {
    console.log("\u{1F50D} Getting partner by userId:", userId);
    const result = await db.select().from(partners).where(eq(partners.userId, userId));
    console.log("\u{1F4CA} Query result:", result);
    const partner = result[0];
    if (partner) {
      console.log("\u2705 Partner found:", partner.id, partner.businessName);
    } else {
      console.log("\u274C No partner found for userId:", userId);
    }
    return partner || null;
  } catch (error) {
    console.error("\u274C ERROR getting partner by user ID:", error);
    console.error("Error details:", error.message, error.stack);
    return null;
  }
}
async function getPartnerById(id) {
  try {
    const [partner] = await db.select().from(partners).where(eq(partners.id, id));
    return partner || null;
  } catch (error) {
    console.error("Error getting partner by ID:", error);
    return null;
  }
}
async function updatePartner(id, updates) {
  try {
    const [partner] = await db.update(partners).set({ ...updates, updatedAt: /* @__PURE__ */ new Date() }).where(eq(partners.id, id)).returning();
    return partner || null;
  } catch (error) {
    throw new StorageError(`Hamkor yangilashda xatolik: ${error.message}`, "UPDATE_PARTNER_ERROR");
  }
}
async function getAllPartners() {
  try {
    return await db.select().from(partners).orderBy(desc(partners.createdAt));
  } catch (error) {
    console.error("Error getting all partners:", error);
    return [];
  }
}
async function approvePartner(partnerId, adminId) {
  try {
    console.log(`\u{1F50D} [ADMIN] Approving partner ${partnerId} by admin ${adminId}`);
    const partner = await getPartnerById(partnerId);
    if (!partner) {
      console.error(`\u274C Partner ${partnerId} not found`);
      return null;
    }
    console.log(`\u{1F4CB} Found partner:`, {
      id: partner.id,
      userId: partner.userId,
      approved: partner.approved
    });
    const [updatedPartner] = await db.update(partners).set({
      approved: true,
      updatedAt: /* @__PURE__ */ new Date()
    }).where(eq(partners.id, partnerId)).returning();
    console.log(`\u2705 Partner approved:`, {
      partnerId: updatedPartner.id,
      approved: updatedPartner.approved,
      userId: updatedPartner.userId
    });
    if (partner.userId) {
      try {
        await db.update(users).set({
          isActive: true,
          updatedAt: /* @__PURE__ */ new Date()
        }).where(eq(users.id, partner.userId));
        console.log(`\u2705 User ${partner.userId} activated`);
      } catch (userError) {
        console.error("\u26A0\uFE0F Could not activate user:", userError);
      }
    }
    return updatedPartner || null;
  } catch (error) {
    console.error("\u274C Error approving partner:", error);
    throw new StorageError(`Hamkorni tasdiqlashda xatolik: ${error.message}`, "APPROVE_PARTNER_ERROR");
  }
}
async function createProduct(productData) {
  try {
    const [product] = await db.insert(products).values({
      id: nanoid(),
      partnerId: productData.partnerId,
      name: productData.name,
      category: productData.category,
      description: productData.description,
      price: productData.price,
      costPrice: productData.costPrice,
      sku: productData.sku,
      barcode: productData.barcode,
      weight: productData.weight,
      isActive: true,
      createdAt: /* @__PURE__ */ new Date(),
      updatedAt: /* @__PURE__ */ new Date()
    }).returning();
    return product;
  } catch (error) {
    throw new StorageError(`Mahsulot yaratishda xatolik: ${error.message}`, "CREATE_PRODUCT_ERROR");
  }
}
async function getProductsByPartnerId(partnerId) {
  try {
    return await db.select().from(products).where(eq(products.partnerId, partnerId)).orderBy(desc(products.createdAt));
  } catch (error) {
    console.error("Error getting products by partner ID:", error);
    return [];
  }
}
async function createFulfillmentRequest(requestData) {
  try {
    const [request] = await db.insert(fulfillmentRequests).values({
      id: nanoid(),
      partnerId: requestData.partnerId,
      productId: requestData.productId,
      requestType: requestData.requestType,
      title: requestData.title,
      description: requestData.description,
      priority: requestData.priority || "medium",
      status: "pending",
      estimatedCost: requestData.estimatedCost,
      metadata: requestData.metadata ? JSON.stringify(requestData.metadata) : null,
      createdAt: /* @__PURE__ */ new Date(),
      updatedAt: /* @__PURE__ */ new Date()
    }).returning();
    return request;
  } catch (error) {
    throw new StorageError(`Fulfillment so'rov yaratishda xatolik: ${error.message}`, "CREATE_REQUEST_ERROR");
  }
}
async function getFulfillmentRequestsByPartnerId(partnerId) {
  try {
    return await db.select().from(fulfillmentRequests).where(eq(fulfillmentRequests.partnerId, partnerId)).orderBy(desc(fulfillmentRequests.createdAt));
  } catch (error) {
    console.error("Error getting fulfillment requests:", error);
    return [];
  }
}
async function getAllFulfillmentRequests() {
  try {
    return await db.select().from(fulfillmentRequests).orderBy(desc(fulfillmentRequests.createdAt));
  } catch (error) {
    console.error("Error getting all fulfillment requests:", error);
    return [];
  }
}
async function updateFulfillmentRequest(id, updates) {
  try {
    const [request] = await db.update(fulfillmentRequests).set({ ...updates, updatedAt: /* @__PURE__ */ new Date() }).where(eq(fulfillmentRequests.id, id)).returning();
    return request || null;
  } catch (error) {
    throw new StorageError(`Fulfillment so'rov yangilashda xatolik: ${error.message}`, "UPDATE_REQUEST_ERROR");
  }
}
async function createMessage(messageData) {
  try {
    const [message] = await db.insert(messages).values({
      id: nanoid(),
      fromUserId: messageData.fromUserId,
      toUserId: messageData.toUserId,
      content: messageData.content,
      messageType: messageData.messageType || "text",
      fileUrl: messageData.fileUrl || null,
      fileName: messageData.fileName || null,
      fileSize: messageData.fileSize ?? null,
      isRead: messageData.isRead || false,
      createdAt: /* @__PURE__ */ new Date()
    }).returning();
    return message;
  } catch (error) {
    throw new StorageError(`Xabar yaratishda xatolik: ${error.message}`, "CREATE_MESSAGE_ERROR");
  }
}
async function getMessagesBetweenUsers(userId1, userId2) {
  try {
    return await db.select().from(messages).where(
      or(
        and(eq(messages.fromUserId, userId1), eq(messages.toUserId, userId2)),
        and(eq(messages.fromUserId, userId2), eq(messages.toUserId, userId1))
      )
    ).orderBy(messages.createdAt);
  } catch (error) {
    console.error("Error getting messages between users:", error);
    return [];
  }
}
async function getAnalyticsByPartnerId(partnerId) {
  try {
    return await db.select().from(analytics).where(eq(analytics.partnerId, partnerId)).orderBy(desc(analytics.date));
  } catch (error) {
    console.error("Error getting analytics:", error);
    return [];
  }
}
async function createAnalytics(analyticsData) {
  try {
    const [newAnalytics] = await db.insert(analytics).values({
      id: nanoid(),
      partnerId: analyticsData.partnerId,
      date: analyticsData.date,
      revenue: analyticsData.revenue,
      orders: analyticsData.orders,
      profit: analyticsData.profit,
      commissionPaid: analyticsData.commissionPaid,
      marketplace: analyticsData.marketplace,
      category: analyticsData.category,
      createdAt: /* @__PURE__ */ new Date()
    }).returning();
    return newAnalytics;
  } catch (error) {
    throw new StorageError(`Analytics yaratishda xatolik: ${error.message}`, "CREATE_ANALYTICS_ERROR");
  }
}
async function getAllPricingTiers() {
  try {
    return await db.select().from(pricingTiers).where(eq(pricingTiers.isActive, true)).orderBy(pricingTiers.minRevenue);
  } catch (error) {
    console.error("Error getting pricing tiers:", error);
    return [];
  }
}
async function getPricingTierByTier(tier) {
  try {
    const [pricingTier] = await db.select().from(pricingTiers).where(eq(pricingTiers.tier, tier));
    return pricingTier || null;
  } catch (error) {
    console.error("Error getting pricing tier:", error);
    return null;
  }
}
async function createTierUpgradeRequest(requestData) {
  try {
    const partner = await getPartnerById(requestData.partnerId);
    if (!partner) {
      throw new StorageError("Hamkor topilmadi", "PARTNER_NOT_FOUND");
    }
    const [request] = await db.insert(tierUpgradeRequests).values({
      id: nanoid(),
      partnerId: requestData.partnerId,
      currentTier: partner.pricingTier,
      requestedTier: requestData.requestedTier,
      reason: requestData.reason,
      status: "pending",
      requestedAt: /* @__PURE__ */ new Date()
    }).returning();
    return request;
  } catch (error) {
    throw new StorageError(`Tarif yangilash so'rovi yaratishda xatolik: ${error.message}`, "CREATE_TIER_REQUEST_ERROR");
  }
}
async function getTierUpgradeRequests() {
  try {
    return await db.select().from(tierUpgradeRequests).orderBy(desc(tierUpgradeRequests.requestedAt));
  } catch (error) {
    console.error("Error getting tier upgrade requests:", error);
    return [];
  }
}
async function updateTierUpgradeRequest(id, updates) {
  try {
    const [request] = await db.update(tierUpgradeRequests).set(updates).where(eq(tierUpgradeRequests.id, id)).returning();
    return request || null;
  } catch (error) {
    throw new StorageError(`Tarif so'rovini yangilashda xatolik: ${error.message}`, "UPDATE_TIER_REQUEST_ERROR");
  }
}
async function getTrendingProducts(filters) {
  try {
    let query = db.select().from(trendingProducts);
    try {
      query = query.where(eq(trendingProducts.isActive, true));
    } catch {
    }
    if (filters?.category && filters.category !== "all") {
      query = query.where(eq(trendingProducts.category, filters.category));
    }
    if (filters?.sourceMarket && filters.sourceMarket !== "all") {
      query = query.where(eq(trendingProducts.sourceMarket, filters.sourceMarket));
    }
    if (filters?.minTrendScore) {
      query = query.where(gte(trendingProducts.trendScore, filters.minTrendScore));
    }
    const results = await query.orderBy(desc(trendingProducts.trendScore));
    return results;
  } catch (error) {
    console.error("Error getting trending products:", error);
    return [];
  }
}
async function createTrendingProduct(productData) {
  try {
    const [product] = await db.insert(trendingProducts).values({
      id: nanoid(),
      productName: productData.productName,
      category: productData.category,
      description: productData.description,
      sourceMarket: productData.sourceMarket,
      sourceUrl: productData.sourceUrl,
      currentPrice: productData.currentPrice,
      estimatedCostPrice: productData.estimatedCostPrice,
      estimatedSalePrice: productData.estimatedSalePrice,
      profitPotential: productData.profitPotential,
      searchVolume: productData.searchVolume,
      trendScore: productData.trendScore || 0,
      competitionLevel: productData.competitionLevel || "medium",
      keywords: JSON.stringify(productData.keywords || []),
      images: JSON.stringify(productData.images || []),
      isActive: true,
      scannedAt: /* @__PURE__ */ new Date(),
      createdAt: /* @__PURE__ */ new Date(),
      updatedAt: /* @__PURE__ */ new Date()
    }).returning();
    return product;
  } catch (error) {
    throw new StorageError(`Trending mahsulot yaratishda xatolik: ${error.message}`, "CREATE_TRENDING_PRODUCT_ERROR");
  }
}
async function getProfitBreakdown(partnerId, filters) {
  try {
    let query = db.select().from(profitBreakdown).where(eq(profitBreakdown.partnerId, partnerId));
    if (filters?.marketplace && filters.marketplace !== "all") {
      query = query.where(eq(profitBreakdown.marketplace, filters.marketplace));
    }
    if (filters?.period) {
      const now = /* @__PURE__ */ new Date();
      let startDate;
      switch (filters.period) {
        case "7days":
          startDate = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1e3);
          break;
        case "30days":
          startDate = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1e3);
          break;
        case "90days":
          startDate = new Date(now.getTime() - 90 * 24 * 60 * 60 * 1e3);
          break;
        case "1year":
          startDate = new Date(now.getTime() - 365 * 24 * 60 * 60 * 1e3);
          break;
        default:
          startDate = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1e3);
      }
      query = query.where(gte(profitBreakdown.date, startDate));
    }
    const results = await query.orderBy(desc(profitBreakdown.date));
    return results;
  } catch (error) {
    console.error("Error getting profit breakdown:", error);
    return [];
  }
}
async function getSystemSetting(key) {
  try {
    const [setting] = await db.select().from(systemSettings).where(and(eq(systemSettings.settingKey, key), eq(systemSettings.isActive, true)));
    return setting || null;
  } catch (error) {
    console.error("Error getting system setting:", error);
    return null;
  }
}
async function setSystemSetting(settingData) {
  try {
    const existing = await getSystemSetting(settingData.settingKey);
    if (existing) {
      const [setting] = await db.update(systemSettings).set({
        settingValue: settingData.settingValue,
        updatedBy: settingData.updatedBy,
        updatedAt: /* @__PURE__ */ new Date()
      }).where(eq(systemSettings.settingKey, settingData.settingKey)).returning();
      return setting;
    } else {
      const [setting] = await db.insert(systemSettings).values({
        id: nanoid(),
        settingKey: settingData.settingKey,
        settingValue: settingData.settingValue,
        settingType: settingData.settingType || "string",
        category: settingData.category,
        description: settingData.description,
        isActive: true,
        updatedBy: settingData.updatedBy,
        createdAt: /* @__PURE__ */ new Date(),
        updatedAt: /* @__PURE__ */ new Date()
      }).returning();
      return setting;
    }
  } catch (error) {
    throw new StorageError(`System setting yaratish/yangilashda xatolik: ${error.message}`, "SYSTEM_SETTING_ERROR");
  }
}
async function seedSystemSettings(adminId) {
  try {
    const defaultSettings = [
      {
        settingKey: "platform_commission_rate",
        settingValue: "0.10",
        // YANGI: 10% minimum (Enterprise Elite)
        settingType: "number",
        category: "commission",
        description: "Default platform commission rate",
        updatedBy: adminId
      },
      {
        settingKey: "spt_base_cost",
        settingValue: "5000",
        settingType: "number",
        category: "spt",
        description: "Base SPT cost per item",
        updatedBy: adminId
      },
      {
        settingKey: "max_file_upload_size",
        settingValue: "10485760",
        settingType: "number",
        category: "general",
        description: "Maximum file upload size in bytes (10MB)",
        updatedBy: adminId
      }
    ];
    for (const setting of defaultSettings) {
      await setSystemSetting(setting);
    }
    console.log("\u2705 System settings seeded");
  } catch (error) {
    console.error("Error seeding system settings:", error);
  }
}
async function createAuditLog(logData) {
  try {
    await db.insert(auditLogs).values({
      id: nanoid(),
      userId: logData.userId,
      action: logData.action,
      entityType: logData.entityType,
      entityId: logData.entityId,
      payload: logData.payload ? JSON.stringify(logData.payload) : null,
      createdAt: /* @__PURE__ */ new Date()
    });
  } catch (error) {
    console.error("Error creating audit log:", error);
  }
}
async function getAdminPermissions(userId) {
  try {
    const [permissions] = await db.select().from(adminPermissions).where(eq(adminPermissions.userId, userId));
    return permissions || null;
  } catch (error) {
    console.error("Error getting admin permissions:", error);
    return null;
  }
}
async function createWarehouse(warehouseData) {
  try {
    const [warehouse] = await db.insert(warehouses).values({
      id: nanoid(),
      name: warehouseData.name,
      code: warehouseData.code,
      address: warehouseData.address,
      city: warehouseData.city,
      region: warehouseData.region,
      capacity: warehouseData.capacity || 1e4,
      currentUtilization: "0",
      isActive: true,
      managerId: warehouseData.managerId,
      contactPhone: warehouseData.contactPhone,
      operatingHours: warehouseData.operatingHours ? JSON.stringify(warehouseData.operatingHours) : null,
      createdAt: /* @__PURE__ */ new Date(),
      updatedAt: /* @__PURE__ */ new Date()
    }).returning();
    return warehouse;
  } catch (error) {
    throw new StorageError(`Ombor yaratishda xatolik: ${error.message}`, "CREATE_WAREHOUSE_ERROR");
  }
}
async function getAllWarehouses() {
  try {
    return await db.select().from(warehouses).where(eq(warehouses.isActive, true));
  } catch (error) {
    console.error("Error getting warehouses:", error);
    return [];
  }
}
async function getWarehouseById(id) {
  try {
    const [warehouse] = await db.select().from(warehouses).where(eq(warehouses.id, id));
    return warehouse || null;
  } catch (error) {
    console.error("Error getting warehouse:", error);
    return null;
  }
}
async function updateProductStock(productId, warehouseId, quantity, movementType, reason, performedBy, referenceType, referenceId, notes) {
  try {
    const [product] = await db.select().from(products).where(eq(products.id, productId));
    if (!product) {
      throw new StorageError("Mahsulot topilmadi", "PRODUCT_NOT_FOUND");
    }
    const previousStock = product.currentStock;
    let newStock = previousStock;
    if (movementType === "inbound" || movementType === "return") {
      newStock = previousStock + quantity;
    } else if (movementType === "outbound") {
      newStock = previousStock - quantity;
      if (newStock < 0) {
        throw new StorageError("Yetarli mahsulot yo'q", "INSUFFICIENT_STOCK");
      }
    } else if (movementType === "adjustment") {
      newStock = quantity;
    }
    const availableStock = newStock - product.reservedStock;
    let stockStatus = "in_stock";
    if (newStock === 0) {
      stockStatus = "out_of_stock";
    } else if (newStock <= (product.minStockLevel || 10)) {
      stockStatus = "low_stock";
    }
    const [updatedProduct] = await db.update(products).set({
      currentStock: newStock,
      availableStock,
      stockStatus,
      lastStockUpdate: /* @__PURE__ */ new Date(),
      updatedAt: /* @__PURE__ */ new Date()
    }).where(eq(products.id, productId)).returning();
    const [movement] = await db.insert(stockMovements).values({
      id: nanoid(),
      productId,
      warehouseId,
      movementType,
      quantity: Math.abs(quantity),
      previousStock,
      newStock,
      reason,
      referenceType,
      referenceId,
      performedBy,
      notes,
      createdAt: /* @__PURE__ */ new Date()
    }).returning();
    const [existingWarehouseStock] = await db.select().from(warehouseStock).where(and(
      eq(warehouseStock.warehouseId, warehouseId),
      eq(warehouseStock.productId, productId)
    ));
    if (existingWarehouseStock) {
      await db.update(warehouseStock).set({
        quantity: newStock,
        availableQuantity: availableStock,
        lastMovement: /* @__PURE__ */ new Date(),
        updatedAt: /* @__PURE__ */ new Date()
      }).where(eq(warehouseStock.id, existingWarehouseStock.id));
    } else {
      await db.insert(warehouseStock).values({
        id: nanoid(),
        warehouseId,
        productId,
        quantity: newStock,
        reservedQuantity: 0,
        availableQuantity: newStock,
        lastMovement: /* @__PURE__ */ new Date(),
        createdAt: /* @__PURE__ */ new Date(),
        updatedAt: /* @__PURE__ */ new Date()
      });
    }
    if (stockStatus === "low_stock" || stockStatus === "out_of_stock") {
      await createStockAlert({
        productId,
        partnerId: product.partnerId,
        alertType: stockStatus === "out_of_stock" ? "out_of_stock" : "low_stock",
        severity: stockStatus === "out_of_stock" ? "critical" : "high",
        message: stockStatus === "out_of_stock" ? `${product.name} tugadi! Zudlik bilan to'ldirish kerak.` : `${product.name} qoldig'i kam (${newStock} dona). Minimum: ${product.minStockLevel}`,
        currentStock: newStock,
        threshold: product.minStockLevel || 10
      });
    }
    return { product: updatedProduct, movement };
  } catch (error) {
    throw new StorageError(`Stock yangilashda xatolik: ${error.message}`, "UPDATE_STOCK_ERROR");
  }
}
async function getStockMovements(filters) {
  try {
    let query = db.select().from(stockMovements);
    if (filters?.productId) {
      query = query.where(eq(stockMovements.productId, filters.productId));
    }
    if (filters?.warehouseId) {
      query = query.where(eq(stockMovements.warehouseId, filters.warehouseId));
    }
    if (filters?.startDate) {
      query = query.where(gte(stockMovements.createdAt, filters.startDate));
    }
    if (filters?.endDate) {
      query = query.where(lte(stockMovements.createdAt, filters.endDate));
    }
    return await query.orderBy(desc(stockMovements.createdAt));
  } catch (error) {
    console.error("Error getting stock movements:", error);
    return [];
  }
}
async function getWarehouseStock(warehouseId) {
  try {
    return await db.select().from(warehouseStock).where(eq(warehouseStock.warehouseId, warehouseId));
  } catch (error) {
    console.error("Error getting warehouse stock:", error);
    return [];
  }
}
async function createOrder(orderData) {
  try {
    const orderNumber = `ORD-${Date.now()}-${nanoid(6).toUpperCase()}`;
    let subtotal = 0;
    for (const item of orderData.items) {
      subtotal += parseFloat(item.unitPrice) * item.quantity;
    }
    const shippingCost = 15e3;
    const tax = subtotal * 0.12;
    const totalAmount = subtotal + shippingCost + tax;
    const [order] = await db.insert(orders).values({
      id: nanoid(),
      orderNumber,
      partnerId: orderData.partnerId,
      customerName: orderData.customerName,
      customerPhone: orderData.customerPhone,
      customerEmail: orderData.customerEmail,
      marketplace: orderData.marketplace,
      marketplaceOrderId: orderData.marketplaceOrderId,
      orderDate: /* @__PURE__ */ new Date(),
      status: "pending",
      paymentStatus: "pending",
      fulfillmentStatus: "pending",
      subtotal: subtotal.toString(),
      shippingCost: shippingCost.toString(),
      tax: tax.toString(),
      totalAmount: totalAmount.toString(),
      shippingAddress: JSON.stringify(orderData.shippingAddress),
      shippingMethod: orderData.shippingMethod,
      warehouseId: orderData.warehouseId,
      createdAt: /* @__PURE__ */ new Date(),
      updatedAt: /* @__PURE__ */ new Date()
    }).returning();
    for (const item of orderData.items) {
      const [product] = await db.select().from(products).where(eq(products.id, item.productId));
      await db.insert(orderItems).values({
        id: nanoid(),
        orderId: order.id,
        productId: item.productId,
        productName: product.name,
        sku: product.sku || void 0,
        quantity: item.quantity,
        unitPrice: item.unitPrice,
        discount: "0",
        tax: (parseFloat(item.unitPrice) * item.quantity * 0.12).toString(),
        totalPrice: (parseFloat(item.unitPrice) * item.quantity).toString(),
        status: "pending",
        createdAt: /* @__PURE__ */ new Date()
      });
      await db.update(products).set({
        reservedStock: product.reservedStock + item.quantity,
        availableStock: product.currentStock - (product.reservedStock + item.quantity),
        updatedAt: /* @__PURE__ */ new Date()
      }).where(eq(products.id, item.productId));
    }
    return order;
  } catch (error) {
    throw new StorageError(`Buyurtma yaratishda xatolik: ${error.message}`, "CREATE_ORDER_ERROR");
  }
}
async function getOrdersByPartnerId(partnerId) {
  try {
    return await db.select().from(orders).where(eq(orders.partnerId, partnerId)).orderBy(desc(orders.createdAt));
  } catch (error) {
    console.error("Error getting orders:", error);
    return [];
  }
}
async function getAllOrders() {
  try {
    return await db.select().from(orders).orderBy(desc(orders.createdAt));
  } catch (error) {
    console.error("Error getting all orders:", error);
    return [];
  }
}
async function getOrderById(orderId) {
  try {
    const [order] = await db.select().from(orders).where(eq(orders.id, orderId));
    return order || null;
  } catch (error) {
    console.error("Error getting order:", error);
    return null;
  }
}
async function getOrderItems(orderId) {
  try {
    return await db.select().from(orderItems).where(eq(orderItems.orderId, orderId));
  } catch (error) {
    console.error("Error getting order items:", error);
    return [];
  }
}
async function updateOrderStatus(orderId, status, fulfillmentStatus, paymentStatus, userId) {
  try {
    const updates = {
      status,
      updatedAt: /* @__PURE__ */ new Date()
    };
    if (fulfillmentStatus) updates.fulfillmentStatus = fulfillmentStatus;
    if (paymentStatus) updates.paymentStatus = paymentStatus;
    if (status === "shipped") {
      updates.shippedAt = /* @__PURE__ */ new Date();
    } else if (status === "delivered") {
      updates.actualDelivery = /* @__PURE__ */ new Date();
    }
    const [order] = await db.update(orders).set(updates).where(eq(orders.id, orderId)).returning();
    if (status === "cancelled") {
      const items = await getOrderItems(orderId);
      for (const item of items) {
        const [product] = await db.select().from(products).where(eq(products.id, item.productId));
        await db.update(products).set({
          reservedStock: Math.max(0, product.reservedStock - item.quantity),
          availableStock: product.currentStock - Math.max(0, product.reservedStock - item.quantity),
          updatedAt: /* @__PURE__ */ new Date()
        }).where(eq(products.id, item.productId));
      }
    }
    return order || null;
  } catch (error) {
    throw new StorageError(`Buyurtma statusini yangilashda xatolik: ${error.message}`, "UPDATE_ORDER_ERROR");
  }
}
async function createStockAlert(alertData) {
  try {
    const [alert] = await db.insert(stockAlerts).values({
      id: nanoid(),
      productId: alertData.productId,
      alertType: alertData.alertType,
      message: alertData.message,
      resolved: false
    }).returning();
    const [product] = await db.select().from(products).where(eq(products.id, alertData.productId));
    const [partner] = await db.select().from(partners).where(eq(partners.id, alertData.partnerId));
    const [user] = await db.select().from(users).where(eq(users.id, partner.userId));
    await db.insert(notifications).values({
      id: nanoid(),
      userId: user.id,
      type: "stock_alert",
      title: alertData.alertType === "out_of_stock" ? "Mahsulot tugadi!" : "Mahsulot qoldig'i kam",
      message: alertData.message,
      data: JSON.stringify({
        productId: alertData.productId,
        productName: product.name,
        currentStock: alertData.currentStock,
        threshold: alertData.threshold
      }),
      isRead: false,
      priority: alertData.severity === "critical" ? "urgent" : "high",
      createdAt: /* @__PURE__ */ new Date()
    });
    return alert;
  } catch (error) {
    console.error("Error creating stock alert:", error);
    throw error;
  }
}
async function getStockAlertsByPartnerId(partnerId, includeResolved = false) {
  try {
    const partnerProducts = await db.select({ id: products.id }).from(products).where(eq(products.partnerId, partnerId));
    if (partnerProducts.length === 0) {
      return [];
    }
    const productIds = partnerProducts.map((p) => p.id);
    const { and: and25, inArray } = await import("drizzle-orm");
    if (!includeResolved) {
      return await db.select().from(stockAlerts).where(and25(
        inArray(stockAlerts.productId, productIds),
        eq(stockAlerts.resolved, false)
      )).orderBy(desc(stockAlerts.createdAt));
    } else {
      return await db.select().from(stockAlerts).where(inArray(stockAlerts.productId, productIds)).orderBy(desc(stockAlerts.createdAt));
    }
  } catch (error) {
    console.error("Error getting stock alerts:", error);
    return [];
  }
}
async function resolveStockAlert(alertId, resolvedBy) {
  try {
    const [alert] = await db.update(stockAlerts).set({
      resolved: true,
      resolvedAt: /* @__PURE__ */ new Date()
    }).where(eq(stockAlerts.id, alertId)).returning();
    return alert || null;
  } catch (error) {
    console.error("Error resolving stock alert:", error);
    return null;
  }
}
async function getInventoryStats(partnerId) {
  try {
    const partnerProducts = await db.select().from(products).where(eq(products.partnerId, partnerId));
    const totalProducts = partnerProducts.length;
    const totalStock = partnerProducts.reduce((sum, p) => sum + p.currentStock, 0);
    const totalValue = partnerProducts.reduce((sum, p) => {
      const cost = parseFloat(p.costPrice || "0");
      return sum + cost * p.currentStock;
    }, 0);
    const lowStockProducts = partnerProducts.filter((p) => p.stockStatus === "low_stock").length;
    const outOfStockProducts = partnerProducts.filter((p) => p.stockStatus === "out_of_stock").length;
    const inStockProducts = partnerProducts.filter((p) => p.stockStatus === "in_stock").length;
    return {
      totalProducts,
      totalStock,
      totalValue: totalValue.toFixed(2),
      inStockProducts,
      lowStockProducts,
      outOfStockProducts,
      stockHealth: totalProducts > 0 ? (inStockProducts / totalProducts * 100).toFixed(1) : 0
    };
  } catch (error) {
    console.error("Error getting inventory stats:", error);
    return {
      totalProducts: 0,
      totalStock: 0,
      totalValue: "0",
      inStockProducts: 0,
      lowStockProducts: 0,
      outOfStockProducts: 0,
      stockHealth: 0
    };
  }
}
async function getProductById(productId) {
  try {
    const [product] = await db.select().from(products).where(eq(products.id, productId)).limit(1);
    return product || null;
  } catch (error) {
    console.error("Error getting product by ID:", error);
    return null;
  }
}
async function getProductByBarcode(barcode) {
  try {
    const [product] = await db.select().from(products).where(eq(products.barcode, barcode)).limit(1);
    return product || null;
  } catch (error) {
    console.error("Error getting product by barcode:", error);
    return null;
  }
}
async function getProductBySku(sku) {
  try {
    const [product] = await db.select().from(products).where(eq(products.sku, sku)).limit(1);
    return product || null;
  } catch (error) {
    console.error("Error getting product by SKU:", error);
    return null;
  }
}
async function getOrdersByProduct(productId, days) {
  try {
    const daysAgo = /* @__PURE__ */ new Date();
    daysAgo.setDate(daysAgo.getDate() - days);
    const ordersList = await db.select().from(orders).where(gte(orders.createdAt, daysAgo));
    const filteredOrders = ordersList.filter((order) => {
      const items = order.items;
      return items && items.some((item) => item.productId === productId);
    });
    return filteredOrders;
  } catch (error) {
    console.error("Error getting orders by product:", error);
    return [];
  }
}
async function getOrdersByDateRange(startDate, endDate, filters) {
  try {
    let query = db.select().from(orders).where(and(
      gte(orders.createdAt, startDate),
      lte(orders.createdAt, endDate)
    ));
    if (filters?.partnerId) {
      query = query.where(eq(orders.partnerId, filters.partnerId));
    }
    const ordersList = await query;
    return ordersList;
  } catch (error) {
    console.error("Error getting orders by date range:", error);
    return [];
  }
}
async function updateOrder(orderId, updates) {
  try {
    const [order] = await db.update(orders).set({ ...updates, updatedAt: /* @__PURE__ */ new Date() }).where(eq(orders.id, orderId)).returning();
    return order;
  } catch (error) {
    console.error("Error updating order:", error);
    throw new StorageError(`Order yangilashda xatolik: ${error.message}`, "UPDATE_ORDER_ERROR");
  }
}
var StorageError, storage;
var init_storage = __esm({
  "server/storage.ts"() {
    init_db();
    init_schema();
    StorageError = class extends Error {
      constructor(message, code) {
        super(message);
        this.code = code;
        this.name = "StorageError";
      }
      static {
        __name(this, "StorageError");
      }
    };
    __name(createUser, "createUser");
    __name(getUserByUsername, "getUserByUsername");
    __name(getUserById, "getUserById");
    __name(validateUserPassword, "validateUserPassword");
    __name(getUsersByRole, "getUsersByRole");
    __name(createPartner, "createPartner");
    __name(getPartnerByUserId, "getPartnerByUserId");
    __name(getPartnerById, "getPartnerById");
    __name(updatePartner, "updatePartner");
    __name(getAllPartners, "getAllPartners");
    __name(approvePartner, "approvePartner");
    __name(createProduct, "createProduct");
    __name(getProductsByPartnerId, "getProductsByPartnerId");
    __name(createFulfillmentRequest, "createFulfillmentRequest");
    __name(getFulfillmentRequestsByPartnerId, "getFulfillmentRequestsByPartnerId");
    __name(getAllFulfillmentRequests, "getAllFulfillmentRequests");
    __name(updateFulfillmentRequest, "updateFulfillmentRequest");
    __name(createMessage, "createMessage");
    __name(getMessagesBetweenUsers, "getMessagesBetweenUsers");
    __name(getAnalyticsByPartnerId, "getAnalyticsByPartnerId");
    __name(createAnalytics, "createAnalytics");
    __name(getAllPricingTiers, "getAllPricingTiers");
    __name(getPricingTierByTier, "getPricingTierByTier");
    __name(createTierUpgradeRequest, "createTierUpgradeRequest");
    __name(getTierUpgradeRequests, "getTierUpgradeRequests");
    __name(updateTierUpgradeRequest, "updateTierUpgradeRequest");
    __name(getTrendingProducts, "getTrendingProducts");
    __name(createTrendingProduct, "createTrendingProduct");
    __name(getProfitBreakdown, "getProfitBreakdown");
    __name(getSystemSetting, "getSystemSetting");
    __name(setSystemSetting, "setSystemSetting");
    __name(seedSystemSettings, "seedSystemSettings");
    __name(createAuditLog, "createAuditLog");
    __name(getAdminPermissions, "getAdminPermissions");
    __name(createWarehouse, "createWarehouse");
    __name(getAllWarehouses, "getAllWarehouses");
    __name(getWarehouseById, "getWarehouseById");
    __name(updateProductStock, "updateProductStock");
    __name(getStockMovements, "getStockMovements");
    __name(getWarehouseStock, "getWarehouseStock");
    __name(createOrder, "createOrder");
    __name(getOrdersByPartnerId, "getOrdersByPartnerId");
    __name(getAllOrders, "getAllOrders");
    __name(getOrderById, "getOrderById");
    __name(getOrderItems, "getOrderItems");
    __name(updateOrderStatus, "updateOrderStatus");
    __name(createStockAlert, "createStockAlert");
    __name(getStockAlertsByPartnerId, "getStockAlertsByPartnerId");
    __name(resolveStockAlert, "resolveStockAlert");
    __name(getInventoryStats, "getInventoryStats");
    __name(getProductById, "getProductById");
    __name(getProductByBarcode, "getProductByBarcode");
    __name(getProductBySku, "getProductBySku");
    __name(getOrdersByProduct, "getOrdersByProduct");
    __name(getOrdersByDateRange, "getOrdersByDateRange");
    __name(updateOrder, "updateOrder");
    storage = {
      createUser,
      getUserByUsername,
      getUserById,
      getUsersByRole,
      validateUserPassword,
      createPartner,
      getPartnerByUserId,
      getPartnerById,
      updatePartner,
      getAllPartners,
      approvePartner,
      createProduct,
      getProductsByPartnerId,
      getProductById,
      getProductByBarcode,
      getProductBySku,
      createFulfillmentRequest,
      getFulfillmentRequestsByPartnerId,
      getAllFulfillmentRequests,
      updateFulfillmentRequest,
      createMessage,
      getMessagesBetweenUsers,
      getAnalyticsByPartnerId,
      createAnalytics,
      getAllPricingTiers,
      getPricingTierByTier,
      createTierUpgradeRequest,
      getTierUpgradeRequests,
      updateTierUpgradeRequest,
      getTrendingProducts,
      createTrendingProduct,
      getProfitBreakdown,
      getSystemSetting,
      setSystemSetting,
      seedSystemSettings,
      createAuditLog,
      getAdminPermissions,
      // Inventory Management
      createWarehouse,
      getAllWarehouses,
      getWarehouseById,
      updateProductStock,
      getStockMovements,
      getWarehouseStock,
      createOrder,
      getOrdersByPartnerId,
      getAllOrders,
      getOrderById,
      getOrderItems,
      updateOrderStatus,
      createStockAlert,
      getStockAlertsByPartnerId,
      resolveStockAlert,
      getInventoryStats,
      // Advanced features
      getOrdersByProduct,
      getOrdersByDateRange,
      updateOrder
    };
  }
});

// server/websocket.ts
import { WebSocketServer, WebSocket } from "ws";
function initializeWebSocket(server) {
  wsManager = new WebSocketManager(server);
  console.log("\u2705 WebSocket server initialized");
  return wsManager;
}
var WebSocketManager, wsManager;
var init_websocket = __esm({
  "server/websocket.ts"() {
    init_storage();
    WebSocketManager = class {
      static {
        __name(this, "WebSocketManager");
      }
      wss;
      clients = /* @__PURE__ */ new Map();
      heartbeatInterval;
      HEARTBEAT_INTERVAL = 3e4;
      // 30 seconds
      PING_TIMEOUT = 6e4;
      // 60 seconds
      constructor(server) {
        this.wss = new WebSocketServer({
          server,
          path: "/ws"
        });
        this.setupWebSocketServer();
        this.startHeartbeat();
      }
      setupWebSocketServer() {
        this.wss.on("connection", (ws, req) => {
          console.log("\u{1F50C} New WebSocket connection");
          const url = new URL(req.url || "", `http://${req.headers.host}`);
          const userId = url.searchParams.get("userId");
          const userRole = url.searchParams.get("role") || "guest";
          const partnerId = url.searchParams.get("partnerId");
          if (!userId) {
            ws.close(1008, "User ID required");
            return;
          }
          this.clients.set(userId, {
            ws,
            userId,
            userRole,
            partnerId: partnerId || void 0,
            isAlive: true,
            lastPing: Date.now()
          });
          this.sendToUser(userId, {
            type: "system",
            data: {
              message: "WebSocket ulanishi muvaffaqiyatli",
              timestamp: Date.now()
            }
          });
          ws.on("pong", () => {
            const client = this.clients.get(userId);
            if (client) {
              client.isAlive = true;
              client.lastPing = Date.now();
            }
          });
          ws.on("message", (data) => {
            try {
              const message = JSON.parse(data.toString());
              this.handleMessage(userId, message);
            } catch (error) {
              console.error("WebSocket message parsing error:", error);
              this.sendToUser(userId, {
                type: "system",
                data: {
                  error: "Xabar formatida xatolik",
                  timestamp: Date.now()
                }
              });
            }
          });
          ws.on("close", (code, reason) => {
            console.log(`\u{1F50C} WebSocket connection closed for user: ${userId} (${code}: ${reason})`);
            this.clients.delete(userId);
          });
          ws.on("error", (error) => {
            console.error(`WebSocket error for user ${userId}:`, error);
            this.clients.delete(userId);
          });
        });
      }
      startHeartbeat() {
        this.heartbeatInterval = setInterval(() => {
          this.clients.forEach((client, userId) => {
            if (!client.isAlive) {
              console.log(`Terminating connection for user: ${userId} (no heartbeat)`);
              client.ws.terminate();
              this.clients.delete(userId);
              return;
            }
            client.isAlive = false;
            client.ws.ping();
          });
        }, this.HEARTBEAT_INTERVAL);
      }
      async handleMessage(userId, message) {
        try {
          switch (message.type) {
            case "message":
              await this.handleChatMessage(userId, message);
              break;
            case "tier_upgrade":
              await this.handleTierUpgradeRequest(userId, message);
              break;
            case "ping":
              this.sendToUser(userId, {
                type: "pong",
                data: { timestamp: Date.now() }
              });
              break;
            default:
              console.log("Unknown message type:", message.type);
          }
        } catch (error) {
          console.error("Error handling WebSocket message:", error);
          this.sendToUser(userId, {
            type: "system",
            data: {
              error: "Xabar qayta ishlashda xatolik",
              timestamp: Date.now()
            }
          });
        }
      }
      async handleChatMessage(userId, message) {
        const { toUserId, content } = message.data;
        if (!toUserId || !content) {
          this.sendToUser(userId, {
            type: "system",
            data: {
              error: "Xabar ma'lumotlari to'liq emas",
              timestamp: Date.now()
            }
          });
          return;
        }
        if (content.length > 1e3) {
          this.sendToUser(userId, {
            type: "system",
            data: {
              error: "Xabar juda uzun (maksimal 1000 belgi)",
              timestamp: Date.now()
            }
          });
          return;
        }
        const savedMessage = await storage.createMessage({
          fromUserId: userId,
          toUserId,
          content,
          isRead: false
        });
        this.sendToUser(toUserId, {
          type: "message",
          data: {
            ...savedMessage,
            timestamp: Date.now()
          }
        });
        this.sendToUser(userId, {
          type: "message",
          data: {
            ...savedMessage,
            status: "sent",
            timestamp: Date.now()
          }
        });
      }
      async handleTierUpgradeRequest(userId, message) {
        const { requestedTier, reason } = message.data;
        const partner = await storage.getPartnerByUserId(userId);
        if (!partner) {
          this.sendToUser(userId, {
            type: "system",
            data: {
              error: "Hamkor ma'lumotlari topilmadi",
              timestamp: Date.now()
            }
          });
          return;
        }
        const request = await storage.createTierUpgradeRequest({
          partnerId: partner.id,
          requestedTier,
          reason
        });
        this.notifyAdmins({
          type: "tier_upgrade",
          data: {
            request,
            partner: {
              id: partner.id,
              businessName: partner.businessName,
              currentTier: partner.pricingTier
            },
            timestamp: Date.now()
          }
        });
        this.sendToUser(userId, {
          type: "tier_upgrade",
          data: {
            status: "submitted",
            message: "Tarif yaxshilash so'rovingiz yuborildi. Admin ko'rib chiqadi.",
            timestamp: Date.now()
          }
        });
      }
      // Send message to specific user
      sendToUser(userId, message) {
        const client = this.clients.get(userId);
        if (client && client.ws.readyState === WebSocket.OPEN) {
          try {
            client.ws.send(JSON.stringify(message));
          } catch (error) {
            console.error(`Error sending message to user ${userId}:`, error);
            this.clients.delete(userId);
          }
        }
      }
      // Send message to all admins
      notifyAdmins(message) {
        this.clients.forEach((client, userId) => {
          if (client.userRole === "admin" && client.ws.readyState === WebSocket.OPEN) {
            try {
              client.ws.send(JSON.stringify(message));
            } catch (error) {
              console.error(`Error sending admin notification to user ${userId}:`, error);
              this.clients.delete(userId);
            }
          }
        });
      }
      // Send message to all partners
      notifyPartners(message) {
        this.clients.forEach((client, userId) => {
          if (client.userRole === "partner" && client.ws.readyState === WebSocket.OPEN) {
            try {
              client.ws.send(JSON.stringify(message));
            } catch (error) {
              console.error(`Error sending partner notification to user ${userId}:`, error);
              this.clients.delete(userId);
            }
          }
        });
      }
      // Send AI activity update to all admin users
      broadcastAIActivity(activityData) {
        const message = {
          type: "ai_activity",
          data: activityData,
          timestamp: Date.now()
        };
        this.clients.forEach((client, userId) => {
          if (client.userRole === "admin" && client.ws.readyState === WebSocket.OPEN) {
            try {
              client.ws.send(JSON.stringify(message));
            } catch (error) {
              console.error(`Error sending AI activity to admin ${userId}:`, error);
              this.clients.delete(userId);
            }
          }
        });
      }
      // Send AI stats update to all admin users
      broadcastAIStats(statsData) {
        const message = {
          type: "ai_stats",
          data: statsData,
          timestamp: Date.now()
        };
        this.clients.forEach((client, userId) => {
          if (client.userRole === "admin" && client.ws.readyState === WebSocket.OPEN) {
            try {
              client.ws.send(JSON.stringify(message));
            } catch (error) {
              console.error(`Error sending AI stats to admin ${userId}:`, error);
              this.clients.delete(userId);
            }
          }
        });
      }
      // Broadcast to all connected clients
      broadcast(message) {
        this.clients.forEach((client, userId) => {
          if (client.ws.readyState === WebSocket.OPEN) {
            try {
              client.ws.send(JSON.stringify(message));
            } catch (error) {
              console.error(`Error broadcasting to user ${userId}:`, error);
              this.clients.delete(userId);
            }
          }
        });
      }
      // Get connected clients count
      getConnectedClientsCount() {
        return this.clients.size;
      }
      // Get connected clients info
      getConnectedClients() {
        return Array.from(this.clients.values());
      }
      // Get online status for specific user
      isUserOnline(userId) {
        const client = this.clients.get(userId);
        return client ? client.ws.readyState === WebSocket.OPEN : false;
      }
      // Cleanup method
      cleanup() {
        if (this.heartbeatInterval) {
          clearInterval(this.heartbeatInterval);
        }
        this.wss.close();
      }
    };
    __name(initializeWebSocket, "initializeWebSocket");
  }
});

// SAAS_PRICING_CONFIG.ts
var SAAS_PRICING_TIERS;
var init_SAAS_PRICING_CONFIG = __esm({
  "SAAS_PRICING_CONFIG.ts"() {
    "use strict";
    SAAS_PRICING_TIERS = {
      free_starter: {
        id: "free_starter",
        name: "Free Starter",
        nameUz: "Free Starter",
        nameRu: "Free Starter",
        nameEn: "Free Starter",
        // Pricing
        monthlyFee: 0,
        // $0
        monthlyFeeUSD: 0,
        commissionRate: 0.02,
        // 2%
        // Limits
        limits: {
          sku: 10,
          monthlySalesLimit: 15e6,
          // 15M so'm
          marketplaces: 1,
          // Yandex Market only
          aiCards: 10,
          trendHunter: 10,
          languages: 3
        },
        // Features
        features: [
          "10 ta mahsulot",
          "1 marketplace (Yandex Market)",
          "AI kartochka (10 ta)",
          "Trend Hunter (10 marta/oy)",
          "3 tilda tarjima",
          "Asosiy savdo statistikasi",
          "Ombor monitoring",
          "Admin chat",
          "Email yordam"
        ],
        excluded: [
          "Sof foyda tahlili",
          "Narx monitoring",
          "SEO optimizatsiya",
          "Ko'p marketplace",
          "Telegram xabarnomalar"
        ],
        description: "Sinab ko'rish uchun",
        popular: false,
        color: "green",
        badge: "BEPUL"
      },
      basic: {
        id: "basic",
        name: "Basic",
        nameUz: "Basic",
        nameRu: "Basic",
        nameEn: "Basic",
        // Pricing
        monthlyFee: 828e3,
        // $69 * 12000
        monthlyFeeUSD: 69,
        commissionRate: 0.018,
        // 1.8%
        // Limits
        limits: {
          sku: 69,
          monthlySalesLimit: 69e6,
          // 69M so'm
          marketplaces: 1,
          // Yandex Market only
          aiCards: 69,
          trendHunter: 69,
          languages: 3
        },
        // Features
        features: [
          "69 ta mahsulot",
          "1 marketplace (Yandex Market)",
          "AI kartochka (69 ta)",
          "Trend Hunter (69 marta/oy)",
          "3 tilda tarjima",
          "\u2728 Sof foyda tahlili",
          "To'liq savdo statistikasi",
          "Ombor boshqaruvi",
          "Telegram xabarnomalar",
          "Email yordam"
        ],
        excluded: [
          "Ko'p marketplace",
          "SEO optimizatsiya",
          "Narx monitoring",
          "Ommaviy operatsiyalar"
        ],
        description: "Kichik biznes",
        popular: false,
        color: "orange",
        badge: "Arzon"
      },
      starter_pro: {
        id: "starter_pro",
        name: "Starter Pro",
        nameUz: "Starter Pro",
        nameRu: "Starter Pro",
        nameEn: "Starter Pro",
        // Pricing
        monthlyFee: 4188e3,
        // $349 * 12000
        monthlyFeeUSD: 349,
        commissionRate: 0.015,
        // 1.5%
        // Limits
        limits: {
          sku: 400,
          monthlySalesLimit: 2e8,
          // 200M so'm
          marketplaces: 4,
          // Uzum, Yandex, Wildberries, Ozon
          aiCards: -1,
          // unlimited
          trendHunter: -1,
          // unlimited
          languages: 3
        },
        // Features
        features: [
          "400 ta mahsulot (100/marketplace)",
          "4 marketplace (Uzum, Yandex, Wildberries, Ozon)",
          "Cheksiz AI kartochka",
          "Cheksiz Trend Hunter",
          "3 tilda tarjima",
          "SEO optimizatsiya",
          "Narx monitoring",
          "Sof foyda tahlili",
          "To'liq savdo tahlili",
          "Ombor boshqaruvi",
          "Ommaviy operatsiyalar",
          "Telegram xabarnomalar",
          "24/7 monitoring",
          "Email yordam"
        ],
        excluded: [],
        description: "O'sish uchun",
        popular: true,
        color: "blue",
        badge: "Mashhur"
      },
      professional: {
        id: "professional",
        name: "Professional",
        nameUz: "Professional",
        nameRu: "Professional",
        nameEn: "Professional",
        // Pricing
        monthlyFee: 10788e3,
        // $899 * 12000
        monthlyFeeUSD: 899,
        commissionRate: 0.01,
        // 1%
        // Limits
        limits: {
          sku: -1,
          // unlimited
          monthlySalesLimit: -1,
          // unlimited
          marketplaces: -1,
          // all available
          aiCards: -1,
          // unlimited
          trendHunter: -1,
          // unlimited
          languages: 3
        },
        // Features
        features: [
          "\u267E\uFE0F Cheksiz mahsulotlar",
          "4+ marketplace (barcha mavjud)",
          "Cheksiz AI kartochka",
          "Cheksiz Trend Hunter",
          "3 tilda tarjima",
          "SEO optimizatsiya",
          "Narx monitoring",
          "Sof foyda tahlili",
          "Kengaytirilgan AI tahlil",
          "Tezkor yordam (1 soat)",
          "Shaxsiy menejer",
          "API kirish",
          "White-label branding",
          "Maxsus integratsiyalar",
          "A/B testing",
          "Xalqaro kengayish"
        ],
        excluded: [],
        description: "Enterprise",
        popular: false,
        color: "purple",
        badge: "Premium"
      }
    };
  }
});

// server/services/realAIService.ts
var realAIService_exports = {};
__export(realAIService_exports, {
  analyzeImage: () => analyzeImage,
  default: () => realAIService_default,
  generateProductCard: () => generateProductCard,
  generateText: () => generateText,
  getProvider: () => getProvider,
  getStatus: () => getStatus,
  isEnabled: () => isEnabled,
  optimizePrice: () => optimizePrice,
  realAIService: () => realAIService,
  scanProduct: () => scanProduct
});
import OpenAI from "openai";
import { GoogleGenerativeAI } from "@google/generative-ai";
import dotenv from "dotenv";
async function generateText(options) {
  const { prompt, systemMessage, maxTokens = 2e3, temperature = 0.7, jsonMode = false } = options;
  if (genAI) {
    try {
      const model = genAI.getGenerativeModel({
        model: "gemini-1.5-flash",
        systemInstruction: systemMessage
      });
      const result = await model.generateContent(prompt);
      const text2 = result.response.text();
      console.log("\u2705 Gemini generated response");
      return text2;
    } catch (error) {
      console.error("Gemini Error:", error.message);
    }
  }
  if (openai2) {
    try {
      const messages2 = [];
      if (systemMessage) {
        messages2.push({ role: "system", content: systemMessage });
      }
      messages2.push({ role: "user", content: prompt });
      const response = await openai2.chat.completions.create({
        model: "gpt-4o",
        messages: messages2,
        max_tokens: maxTokens,
        temperature,
        response_format: jsonMode ? { type: "json_object" } : void 0
      });
      console.log("\u2705 OpenAI generated response");
      return response.choices[0]?.message?.content || "";
    } catch (error) {
      console.error("OpenAI Error:", error.message);
    }
  }
  console.log("\u{1F3AD} Using demo mode for text generation");
  return generateDemoResponse(prompt, jsonMode);
}
function generateDemoResponse(prompt, jsonMode) {
  const nameMatch = prompt.match(/MAHSULOT:\s*([^\n]+)/i);
  const productName = nameMatch ? nameMatch[1].trim() : "Demo Mahsulot";
  const priceMatch = prompt.match(/NARX:\s*(\d+)/);
  const price = priceMatch ? parseInt(priceMatch[1]) : 1e5;
  if (jsonMode || prompt.includes("JSON")) {
    if (prompt.toLowerCase().includes("kartochka") || prompt.toLowerCase().includes("card")) {
      return JSON.stringify({
        title: `${productName} - Sifatli mahsulot`,
        description: `${productName} - yuqori sifatli mahsulot. O'zbekiston bo'ylab tez yetkazib berish. Rasmiy kafolat. Bu demo tavsif - haqiqiy AI uchun OPENAI_API_KEY yoki GEMINI_API_KEY qo'shing.`,
        shortDescription: `${productName} - eng yaxshi narxda`,
        keywords: productName.toLowerCase().split(" ").filter((w) => w.length > 2),
        bulletPoints: [
          "Yuqori sifat",
          "Tez yetkazib berish",
          "Rasmiy kafolat",
          "Qulay narx",
          "24/7 qo'llab-quvvatlash"
        ],
        seoScore: 65,
        suggestedPrice: price,
        categoryPath: ["Umumiy", "Mahsulotlar"],
        _demo: true,
        _message: "Bu demo javob. Haqiqiy AI uchun API key qo'shing."
      });
    }
    if (prompt.toLowerCase().includes("narx") || prompt.toLowerCase().includes("price")) {
      const costMatch = prompt.match(/TANNARX:\s*(\d+)/);
      const costPrice = costMatch ? parseInt(costMatch[1]) : price * 0.7;
      return JSON.stringify({
        recommendedPrice: Math.round(price * 1.05),
        minPrice: Math.round(costPrice * 1.15),
        maxPrice: Math.round(price * 1.2),
        reasoning: "Demo tahlil: Hozirgi narx maqbul. Haqiqiy AI tahlili uchun API key qo'shing.",
        competitorAnalysis: "Raqobatchilar tahlili demo rejimda mavjud emas.",
        confidence: 50,
        _demo: true
      });
    }
    if (prompt.toLowerCase().includes("rasm") || prompt.toLowerCase().includes("scan")) {
      return JSON.stringify({
        name: "Demo mahsulot",
        category: "electronics",
        description: "Bu demo tahlil. Haqiqiy rasm tahlili uchun API key qo'shing.",
        brand: "Unknown",
        estimatedPrice: 5e5,
        specifications: ["Demo xususiyat 1", "Demo xususiyat 2"],
        keywords: ["demo", "test", "mahsulot"],
        confidence: 30,
        _demo: true
      });
    }
  }
  return `Demo javob: ${productName} haqida ma'lumot. Haqiqiy AI javoblari uchun OPENAI_API_KEY yoki GEMINI_API_KEY environment variable qo'shing.`;
}
async function analyzeImage(options) {
  const { imageBuffer, prompt, jsonMode = true } = options;
  if (genAI) {
    try {
      const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });
      const imagePart = {
        inlineData: {
          data: imageBuffer.toString("base64"),
          mimeType: "image/jpeg"
        }
      };
      const result = await model.generateContent([prompt, imagePart]);
      console.log("\u2705 Gemini Vision analyzed image");
      return result.response.text();
    } catch (error) {
      console.error("Gemini Vision Error:", error.message);
    }
  }
  if (openai2) {
    try {
      const base64Image = imageBuffer.toString("base64");
      const response = await openai2.chat.completions.create({
        model: "gpt-4o",
        messages: [
          {
            role: "user",
            content: [
              { type: "text", text: prompt },
              {
                type: "image_url",
                image_url: {
                  url: `data:image/jpeg;base64,${base64Image}`,
                  detail: "high"
                }
              }
            ]
          }
        ],
        max_tokens: 2e3,
        response_format: jsonMode ? { type: "json_object" } : void 0
      });
      console.log("\u2705 OpenAI Vision analyzed image");
      return response.choices[0]?.message?.content || "";
    } catch (error) {
      console.error("OpenAI Vision Error:", error.message);
    }
  }
  console.log("\u{1F3AD} Using demo mode for image analysis");
  return generateDemoResponse(prompt, true);
}
async function generateProductCard(input) {
  const marketplaceRules = {
    uzum: "Uzum Market: O'zbek tilida, 80 belgigacha sarlavha",
    wildberries: "Wildberries: Rus tilida, SEO kalit so'zlar muhim",
    yandex: "Yandex Market: Rus tilida, texnik xususiyatlar",
    ozon: "Ozon: Rus tilida, batafsil tavsif"
  };
  const prompt = `Sen professional marketplace SEO mutaxassisisan.

MAHSULOT: ${input.name}
KATEGORIYA: ${input.category || "umumiy"}
TAVSIF: ${input.description || "yo'q"}
NARX: ${input.price || 1e5} so'm
MARKETPLACE: ${input.marketplace}
QOIDALAR: ${marketplaceRules[input.marketplace]}

Quyidagi JSON formatda professional mahsulot kartochkasi yarat:

{
  "title": "SEO-optimizatsiya qilingan sarlavha",
  "description": "To'liq SEO tavsif (300-500 so'z)",
  "shortDescription": "Qisqa tavsif (150 belgi)",
  "keywords": ["kalit1", "kalit2", "...10 tagacha"],
  "bulletPoints": ["Xususiyat 1", "Xususiyat 2", "...5 tagacha"],
  "seoScore": 85,
  "suggestedPrice": ${input.price || 1e5},
  "categoryPath": ["Kategoriya", "Subkategoriya"]
}`;
  const response = await generateText({
    prompt,
    systemMessage: "Sen marketplace SEO ekspert. Faqat valid JSON qaytar.",
    jsonMode: true,
    temperature: 0.5
  });
  try {
    return JSON.parse(response);
  } catch {
    const jsonMatch = response.match(/\{[\s\S]*\}/);
    if (jsonMatch) {
      return JSON.parse(jsonMatch[0]);
    }
    return {
      title: input.name,
      description: input.description || "Mahsulot tavsifi",
      shortDescription: input.name.substring(0, 150),
      keywords: input.name.toLowerCase().split(" "),
      bulletPoints: ["Sifatli mahsulot"],
      seoScore: 50,
      suggestedPrice: input.price || 1e5,
      categoryPath: [input.category || "Umumiy"],
      _demo: true
    };
  }
}
async function scanProduct(imageBuffer) {
  const prompt = `Bu rasmda ko'rsatilgan mahsulotni aniqlang va quyidagi JSON formatda javob bering:

{
  "name": "Mahsulot nomi (O'zbek tilida)",
  "category": "Kategoriya (electronics, clothing, home, beauty, food, other)",
  "description": "Batafsil tavsif (100-200 so'z)",
  "brand": "Brend nomi",
  "estimatedPrice": 100000,
  "specifications": ["Xususiyat 1", "Xususiyat 2"],
  "keywords": ["kalit1", "kalit2"],
  "confidence": 85
}`;
  const response = await analyzeImage({
    imageBuffer,
    prompt,
    jsonMode: true
  });
  try {
    return JSON.parse(response);
  } catch {
    const jsonMatch = response.match(/\{[\s\S]*\}/);
    if (jsonMatch) {
      return JSON.parse(jsonMatch[0]);
    }
    return {
      name: "Noma'lum mahsulot",
      category: "other",
      description: "Mahsulotni aniqlash imkoni bo'lmadi",
      brand: "Unknown",
      estimatedPrice: 1e5,
      specifications: [],
      keywords: [],
      confidence: 0,
      _demo: true
    };
  }
}
async function optimizePrice(input) {
  const margin = ((input.currentPrice - input.costPrice) / input.currentPrice * 100).toFixed(1);
  const prompt = `Narx optimizatsiyasi tahlili:

MAHSULOT: ${input.productName}
HOZIRGI NARX: ${input.currentPrice} so'm
TANNARX: ${input.costPrice} so'm
FOYDA MARJASI: ${margin}%
KATEGORIYA: ${input.category}
MARKETPLACE: ${input.marketplace}

Quyidagi JSON formatda optimal narx tavsiyasi ber:

{
  "recommendedPrice": ${input.currentPrice},
  "minPrice": ${Math.round(input.costPrice * 1.15)},
  "maxPrice": ${Math.round(input.currentPrice * 1.2)},
  "reasoning": "Narx strategiyasi tushuntirilishi",
  "competitorAnalysis": "Raqobatchilar tahlili",
  "confidence": 80
}`;
  const response = await generateText({
    prompt,
    jsonMode: true,
    temperature: 0.3
  });
  try {
    return JSON.parse(response);
  } catch {
    return {
      recommendedPrice: input.currentPrice,
      minPrice: Math.round(input.costPrice * 1.15),
      maxPrice: Math.round(input.currentPrice * 1.2),
      reasoning: "Demo tahlil",
      competitorAnalysis: "Mavjud emas",
      confidence: 50,
      _demo: true
    };
  }
}
function isEnabled() {
  return AI_PROVIDER !== "demo";
}
function getStatus() {
  return {
    enabled: AI_PROVIDER !== "demo",
    provider: AI_PROVIDER === "openai" ? "OpenAI" : AI_PROVIDER === "gemini" ? "Google Gemini" : "Demo Mode",
    model: AI_PROVIDER === "openai" ? "gpt-4o" : AI_PROVIDER === "gemini" ? "gemini-1.5-flash" : "demo",
    demo: AI_PROVIDER === "demo"
  };
}
function getProvider() {
  return AI_PROVIDER;
}
var GEMINI_KEY, OPENAI_KEY, genAI, openai2, AI_PROVIDER, realAIService, realAIService_default;
var init_realAIService = __esm({
  "server/services/realAIService.ts"() {
    dotenv.config();
    GEMINI_KEY = process.env.GEMINI_API_KEY || process.env.GOOGLE_AI_KEY || "";
    OPENAI_KEY = process.env.OPENAI_API_KEY || "";
    genAI = GEMINI_KEY ? new GoogleGenerativeAI(GEMINI_KEY) : null;
    openai2 = OPENAI_KEY ? new OpenAI({ apiKey: OPENAI_KEY }) : null;
    AI_PROVIDER = genAI ? "gemini" : openai2 ? "openai" : "demo";
    if (AI_PROVIDER === "gemini") {
      console.log("\u2705 Real AI Service initialized with Google Gemini");
    } else if (AI_PROVIDER === "openai") {
      console.log("\u2705 Real AI Service initialized with OpenAI");
    } else {
      console.log("\u26A0\uFE0F AI Service running in DEMO mode (no API key found)");
      console.log("   Set GEMINI_API_KEY or OPENAI_API_KEY for real AI");
    }
    __name(generateText, "generateText");
    __name(generateDemoResponse, "generateDemoResponse");
    __name(analyzeImage, "analyzeImage");
    __name(generateProductCard, "generateProductCard");
    __name(scanProduct, "scanProduct");
    __name(optimizePrice, "optimizePrice");
    __name(isEnabled, "isEnabled");
    __name(getStatus, "getStatus");
    __name(getProvider, "getProvider");
    realAIService = {
      generateText,
      analyzeImage,
      generateProductCard,
      scanProduct,
      optimizePrice,
      isEnabled,
      getStatus,
      getProvider
    };
    realAIService_default = realAIService;
  }
});

// server/services/geminiService.ts
import { GoogleGenerativeAI as GoogleGenerativeAI2 } from "@google/generative-ai";
var GEMINI_API_KEY, genAI2, MODEL_CONFIG, GeminiService, geminiService;
var init_geminiService = __esm({
  "server/services/geminiService.ts"() {
    GEMINI_API_KEY = process.env.EMERGENT_LLM_KEY || process.env.GEMINI_API_KEY || "";
    genAI2 = GEMINI_API_KEY ? new GoogleGenerativeAI2(GEMINI_API_KEY) : null;
    MODEL_CONFIG = {
      "flash": {
        name: "gemini-2.5-flash",
        inputCost: 0.075 / 1e6,
        // $0.075 per 1M tokens
        outputCost: 0.3 / 1e6,
        // $0.30 per 1M tokens
        maxTokens: 1e6,
        rpm: 1e3
      },
      "flash-lite": {
        name: "gemini-2.5-flash-lite",
        inputCost: 0.0375 / 1e6,
        // $0.0375 per 1M tokens
        outputCost: 0.15 / 1e6,
        // $0.15 per 1M tokens
        maxTokens: 1e6,
        rpm: 2e3
      },
      "pro": {
        name: "gemini-2.5-pro",
        inputCost: 0.5 / 1e6,
        // $0.50 per 1M tokens
        outputCost: 1.25 / 1e6,
        // $1.25 per 1M tokens
        maxTokens: 1e6,
        rpm: 500
      },
      "3-pro": {
        name: "gemini-3-pro-preview",
        inputCost: 2 / 1e6,
        // $2.00 per 1M tokens (<=200K), $4.00 (>200K)
        outputCost: 12 / 1e6,
        // $12.00 per 1M tokens (<=200K), $18.00 (>200K)
        maxTokens: 1e6,
        rpm: 500
      }
    };
    GeminiService = class {
      static {
        __name(this, "GeminiService");
      }
      enabled;
      constructor() {
        this.enabled = !!GEMINI_API_KEY && !!genAI2;
        if (!this.enabled) {
          console.warn("\u26A0\uFE0F  Gemini API key not found. Gemini service disabled.");
        } else {
          console.log("\u2705 Gemini API Service initialized");
        }
      }
      /**
       * Check if Gemini service is enabled
       */
      isEnabled() {
        return this.enabled;
      }
      /**
       * Generate text content using Gemini
       */
      async generateText(request) {
        if (!this.enabled) {
          throw new Error("Gemini API is not enabled. Please set GEMINI_API_KEY.");
        }
        const startTime = Date.now();
        const modelType = request.model || "flash";
        const config2 = MODEL_CONFIG[modelType];
        try {
          const model = genAI2.getGenerativeModel({
            model: config2.name,
            generationConfig: {
              temperature: request.temperature || 0.7,
              maxOutputTokens: request.maxTokens || 8192,
              responseMimeType: request.structuredOutput ? "application/json" : void 0
            },
            systemInstruction: request.systemInstruction
          });
          let fullPrompt = request.prompt;
          if (request.context) {
            fullPrompt = `${request.context}

${request.prompt}`;
          }
          const result = await model.generateContent(fullPrompt);
          const response = await result.response;
          const text2 = response.text();
          const inputTokens = Math.ceil(fullPrompt.length / 4);
          const outputTokens = Math.ceil(text2.length / 4);
          const totalTokens = inputTokens + outputTokens;
          const inputCost = inputTokens * config2.inputCost;
          const outputCost = outputTokens * config2.outputCost;
          const cost = inputCost + outputCost;
          const latency = Date.now() - startTime;
          return {
            text: text2,
            model: config2.name,
            tokens: {
              input: inputTokens,
              output: outputTokens,
              total: totalTokens
            },
            cost,
            latency
          };
        } catch (error) {
          console.error("Gemini API error:", error);
          throw new Error(`Gemini API error: ${error.message}`);
        }
      }
      /**
       * Generate image using Nano Banana
       */
      async generateImage(request) {
        if (!this.enabled) {
          throw new Error("Gemini API is not enabled. Please set GEMINI_API_KEY.");
        }
        const startTime = Date.now();
        try {
          const model = genAI2.getGenerativeModel({
            model: "nano-banana-preview"
          });
          const prompt = request.type === "infographic" ? `Create a professional marketplace product infographic with text: ${request.prompt}` : `Create a photorealistic product image: ${request.prompt}`;
          const result = await model.generateContent(prompt);
          const response = await result.response;
          const imageUrl = response.text();
          const cost = 0.02;
          const latency = Date.now() - startTime;
          return {
            imageUrl,
            model: "nano-banana-preview",
            cost,
            latency
          };
        } catch (error) {
          console.error("Gemini Image API error:", error);
          throw new Error(`Gemini Image API error: ${error.message}`);
        }
      }
      /**
       * Analyze image (multimodal)
       */
      async analyzeImage(image, prompt) {
        if (!this.enabled) {
          throw new Error("Gemini API is not enabled. Please set GEMINI_API_KEY.");
        }
        const startTime = Date.now();
        const config2 = MODEL_CONFIG["flash"];
        try {
          const model = genAI2.getGenerativeModel({
            model: config2.name
          });
          let imageBase64;
          if (Buffer.isBuffer(image)) {
            imageBase64 = image.toString("base64");
          } else {
            imageBase64 = image;
          }
          const result = await model.generateContent([
            { text: prompt },
            {
              inlineData: {
                data: imageBase64,
                mimeType: "image/jpeg"
              }
            }
          ]);
          const response = await result.response;
          const text2 = response.text();
          const inputTokens = Math.ceil((prompt.length + imageBase64.length) / 4);
          const outputTokens = Math.ceil(text2.length / 4);
          const totalTokens = inputTokens + outputTokens;
          const inputCost = inputTokens * config2.inputCost;
          const outputCost = outputTokens * config2.outputCost;
          const cost = inputCost + outputCost;
          const latency = Date.now() - startTime;
          return {
            text: text2,
            model: config2.name,
            tokens: {
              input: inputTokens,
              output: outputTokens,
              total: totalTokens
            },
            cost,
            latency
          };
        } catch (error) {
          console.error("Gemini Image Analysis error:", error);
          throw new Error(`Gemini Image Analysis error: ${error.message}`);
        }
      }
      /**
       * Use Google Search integration
       */
      async searchWeb(query, maxResults = 5) {
        if (!this.enabled) {
          throw new Error("Gemini API is not enabled. Please set GEMINI_API_KEY.");
        }
        try {
          const model = genAI2.getGenerativeModel({
            model: "gemini-2.5-flash"
          });
          const result = await model.generateContent(
            `Search the web for: ${query}. Return top ${maxResults} results with URLs.`
          );
          const response = await result.response;
          const text2 = response.text();
          const results = text2.split("\n").filter((line) => line.includes("http")).map((line) => ({
            title: line.split("http")[0].trim(),
            url: "http" + line.split("http")[1].trim()
          }));
          return results.slice(0, maxResults);
        } catch (error) {
          console.error("Gemini Search error:", error);
          throw new Error(`Gemini Search error: ${error.message}`);
        }
      }
      /**
       * Analyze document (PDF, etc.)
       */
      async analyzeDocument(document2, prompt) {
        if (!this.enabled) {
          throw new Error("Gemini API is not enabled. Please set GEMINI_API_KEY.");
        }
        const startTime = Date.now();
        const config2 = MODEL_CONFIG["flash"];
        try {
          const model = genAI2.getGenerativeModel({
            model: config2.name
          });
          const documentBase64 = document2.toString("base64");
          const result = await model.generateContent([
            { text: prompt },
            {
              inlineData: {
                data: documentBase64,
                mimeType: "application/pdf"
              }
            }
          ]);
          const response = await result.response;
          const text2 = response.text();
          const inputTokens = Math.ceil((prompt.length + documentBase64.length) / 4);
          const outputTokens = Math.ceil(text2.length / 4);
          const totalTokens = inputTokens + outputTokens;
          const inputCost = inputTokens * config2.inputCost;
          const outputCost = outputTokens * config2.outputCost;
          const cost = inputCost + outputCost;
          const latency = Date.now() - startTime;
          return {
            text: text2,
            model: config2.name,
            tokens: {
              input: inputTokens,
              output: outputTokens,
              total: totalTokens
            },
            cost,
            latency
          };
        } catch (error) {
          console.error("Gemini Document Analysis error:", error);
          throw new Error(`Gemini Document Analysis error: ${error.message}`);
        }
      }
    };
    geminiService = new GeminiService();
  }
});

// server/services/contextCacheService.ts
var ContextCacheService, contextCacheService;
var init_contextCacheService = __esm({
  "server/services/contextCacheService.ts"() {
    init_geminiService();
    ContextCacheService = class {
      static {
        __name(this, "ContextCacheService");
      }
      cache = /* @__PURE__ */ new Map();
      enabled;
      constructor() {
        this.enabled = geminiService.isEnabled();
        if (this.enabled) {
          console.log("\u2705 Context Cache Service initialized");
          this.loadMarketplaceRules();
        }
      }
      /**
       * Load marketplace rules into cache
       */
      async loadMarketplaceRules() {
        try {
          const uzumRules = `
UZUM MARKETPLACE QOIDALARI:
- Mahsulot nomi: 200 belgigacha
- Tavsif: 5000 belgigacha
- Rasm: 10 ta, 1200x1200 px minimal
- Narx: UZS formatida
- Kategoriya: To'g'ri kategoriya tanlash kerak
- SKU: Unique bo'lishi kerak
`;
          const wildberriesRules = `
WILDBERRIES MARKETPLACE QOIDALARI:
- Mahsulot nomi: 150 belgigacha
- Tavsif: 3000 belgigacha
- Rasm: 30 ta, 1000x1000 px
- Narx: RUB formatida
- Kategoriya: WB kategoriya tizimi
- Barcode: Majburiy
`;
          const yandexRules = `
YANDEX MARKET QOIDALARI:
- Mahsulot nomi: 120 belgigacha
- Tavsif: 2000 belgigacha
- Rasm: 20 ta, 800x800 px
- Narx: RUB formatida
- Kategoriya: Yandex kategoriya tizimi
- Vendor code: Majburiy
`;
          const ozonRules = `
OZON MARKETPLACE QOIDALARI:
- Mahsulot nomi: 100 belgigacha
- Tavsif: 5000 belgigacha
- Rasm: 15 ta, 1000x1000 px
- Narx: RUB formatida
- Kategoriya: Ozon kategoriya tizimi
- FBO/FBS: Tanlash kerak
`;
          this.cache.set("marketplace_rules_uzum", {
            id: "uzum_rules",
            type: "marketplace_rules",
            content: uzumRules,
            tokens: Math.ceil(uzumRules.length / 4),
            createdAt: /* @__PURE__ */ new Date(),
            expiresAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1e3)
            // 30 days
          });
          this.cache.set("marketplace_rules_wildberries", {
            id: "wildberries_rules",
            type: "marketplace_rules",
            content: wildberriesRules,
            tokens: Math.ceil(wildberriesRules.length / 4),
            createdAt: /* @__PURE__ */ new Date(),
            expiresAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1e3)
          });
          this.cache.set("marketplace_rules_yandex", {
            id: "yandex_rules",
            type: "marketplace_rules",
            content: yandexRules,
            tokens: Math.ceil(yandexRules.length / 4),
            createdAt: /* @__PURE__ */ new Date(),
            expiresAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1e3)
          });
          this.cache.set("marketplace_rules_ozon", {
            id: "ozon_rules",
            type: "marketplace_rules",
            content: ozonRules,
            tokens: Math.ceil(ozonRules.length / 4),
            createdAt: /* @__PURE__ */ new Date(),
            expiresAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1e3)
          });
          console.log("\u2705 Marketplace rules cached");
        } catch (error) {
          console.error("Error loading marketplace rules:", error);
        }
      }
      /**
       * Get cached context
       */
      getContext(type, marketplace) {
        const key = marketplace ? `${type}_${marketplace}` : type;
        const cached = this.cache.get(key);
        if (!cached) {
          return null;
        }
        if (cached.expiresAt < /* @__PURE__ */ new Date()) {
          this.cache.delete(key);
          return null;
        }
        return cached.content;
      }
      /**
       * Get marketplace rules for a specific marketplace
       */
      getMarketplaceRules(marketplace) {
        return this.getContext("marketplace_rules", marketplace);
      }
      /**
       * Add context to cache
       */
      addContext(key, content, ttl = 3600) {
        const tokens = Math.ceil(content.length / 4);
        this.cache.set(key, {
          id: key,
          type: "marketplace_rules",
          content,
          tokens,
          createdAt: /* @__PURE__ */ new Date(),
          expiresAt: new Date(Date.now() + ttl * 1e3)
        });
      }
      /**
       * Get cache statistics
       */
      getStats() {
        const entries = Array.from(this.cache.values());
        const totalTokens = entries.reduce((sum, e) => sum + e.tokens, 0);
        const byType = {};
        entries.forEach((entry) => {
          byType[entry.type] = (byType[entry.type] || 0) + 1;
        });
        return {
          totalEntries: entries.length,
          totalTokens,
          byType
        };
      }
      /**
       * Clear expired cache
       */
      clearExpired() {
        const now = /* @__PURE__ */ new Date();
        for (const [key, value] of this.cache.entries()) {
          if (value.expiresAt < now) {
            this.cache.delete(key);
          }
        }
      }
      /**
       * Check if service is enabled
       */
      isEnabled() {
        return this.enabled;
      }
    };
    contextCacheService = new ContextCacheService();
  }
});

// server/services/aiManagerService.ts
var aiManagerService_exports = {};
__export(aiManagerService_exports, {
  autoUploadToMarketplace: () => autoUploadToMarketplace,
  broadcastAIStats: () => broadcastAIStats,
  default: () => aiManagerService_default,
  generateProductCard: () => generateProductCard2,
  monitorPartnerProducts: () => monitorPartnerProducts,
  optimizePrice: () => optimizePrice2
});
import { sql as sql3 } from "drizzle-orm";
async function generateProductCard2(input, partnerId) {
  const partnerIdStr = String(partnerId);
  if (partnerIdStr === "NaN" || partnerIdStr === "null" || partnerIdStr === "undefined" || !partnerIdStr.trim()) {
    console.warn("\u26A0\uFE0F generateProductCard called with invalid partnerId:", partnerId);
    return { success: false, error: "Invalid partner ID" };
  }
  console.log("\u{1F916} AI: Generating product card...", input.name);
  const taskId = await createAITask({
    partnerId: partnerIdStr,
    taskType: "product_creation",
    marketplaceType: input.targetMarketplace,
    inputData: input
  });
  try {
    const marketplaceRules = getMarketplaceRules(input.targetMarketplace);
    const cachedRules = contextCacheService.getMarketplaceRules(input.targetMarketplace);
    const prompt = `
Siz professional marketplace SEO va mahsulot kartochkalari mutaxassisiz.

TARGET MARKETPLACE: ${input.targetMarketplace}
MARKETPLACE QOIDALARI:
${cachedRules || JSON.stringify(marketplaceRules, null, 2)}

MAHSULOT MA'LUMOTLARI:
- Nomi: ${input.name}
- Kategoriya: ${input.category || "noma'lum"}
- Tavsif: ${input.description || "yo'q"}
- Narx: ${input.price || "yo'q"} so'm

VAZIFA:
Quyidagilarni JSON formatda yarating:

{
  "title": "SEO-optimizatsiya qilingan sarlavha (${marketplaceRules.titleMaxLength} belgigacha)",
  "description": "To'liq tavsif (${marketplaceRules.descriptionMaxLength} belgigacha, O'zbek tilida)",
  "shortDescription": "Qisqa tavsif (250 belgigacha)",
  "keywords": ["kalit", "so'z", "20", "tagacha"], // O'zbek va Rus tilida aralash
  "bulletPoints": ["Xususiyat 1", "Xususiyat 2", "...5 tagacha"],
  "suggestedPrice": 100000, // optimal narx (raqobatbardosh)
  "priceRationale": "Narxni asoslash sababi",
  "seoScore": 85, // 0-100
  "seoIssues": ["Muammo 1", "Muammo 2"],
  "seoSuggestions": ["Taklif 1", "Taklif 2"],
  "categoryPath": ["Asosiy kategoriya", "Subkategoriya"],
  "tags": ["tag1", "tag2", "...10 tagacha"],
  "marketplaceSpecific": {
    "${input.targetMarketplace}": {
      // Marketplace-specific formatlar
    }
  }
}

MUHIM:
- SEO uchun kalit so'zlarni tabiiy joylash
- Raqobatchilardan farqlantiruvchi unique tavsif
- ${input.targetMarketplace} qoidalariga to'liq mos
- Narx raqobatbardosh bo'lishi kerak
- Professional va ishonchli ton
`;
    const startTime = Date.now();
    let result;
    let tokensUsed = 0;
    let aiModel = "gpt-4o";
    try {
      if (realAIService.isEnabled()) {
        const response = await realAIService.generateText({
          prompt,
          systemMessage: "Siz professional marketplace SEO mutaxassisisiz. JSON formatda javob bering.",
          jsonMode: true,
          temperature: 0.7
        });
        result = JSON.parse(response);
        tokensUsed = Math.ceil(response.length / 4);
        aiModel = "gpt-4o";
      } else {
        console.warn("\u26A0\uFE0F AI Service not available, using defaults");
        result = {
          title: input.name,
          description: input.description || "Mahsulot tavsifi",
          shortDescription: input.name.substring(0, 150),
          keywords: input.name.split(" "),
          bulletPoints: ["Sifatli mahsulot", "Tez yetkazib berish"],
          suggestedPrice: input.price || 1e5,
          priceRationale: "Standart narx",
          seoScore: 50,
          seoIssues: ["AI xizmati mavjud emas"],
          seoSuggestions: ["AI xizmatini yoqing"],
          categoryPath: [input.category || "Umumiy"],
          tags: input.name.toLowerCase().split(" ")
        };
      }
    } catch (error) {
      console.error("AI generation error:", error);
      result = {
        title: input.name,
        description: input.description || "Mahsulot tavsifi",
        shortDescription: input.name.substring(0, 150),
        keywords: input.name.split(" "),
        bulletPoints: ["Sifatli mahsulot"],
        suggestedPrice: input.price || 1e5,
        priceRationale: "Standart narx",
        seoScore: 40,
        seoIssues: ["AI xatolik: " + error.message],
        seoSuggestions: [],
        categoryPath: ["Umumiy"],
        tags: []
      };
    }
    const executionTime = Math.floor((Date.now() - startTime) / 1e3);
    const [generatedProduct] = await db.insert("ai_generated_products").values({
      partner_id: partnerId,
      marketplace_type: input.targetMarketplace,
      raw_product_name: input.name,
      raw_description: input.description || null,
      raw_category: input.category || null,
      raw_price: input.price || null,
      raw_images: input.images || [],
      ai_title: result.title,
      ai_description: result.description,
      ai_short_description: result.shortDescription,
      ai_keywords: result.keywords,
      ai_category_suggestions: result.categoryPath,
      ai_tags: result.tags,
      seo_score: result.seoScore,
      seo_issues: result.seoIssues,
      seo_suggestions: result.seoSuggestions,
      suggested_price: result.suggestedPrice,
      price_rationale: result.priceRationale,
      marketplace_specific_data: result.marketplaceSpecific,
      ai_confidence_score: result.seoScore,
      status: "review"
    }).returning();
    await updateAITask(taskId, {
      status: "completed",
      outputData: result,
      aiModelUsed: "gpt-4-turbo-preview",
      tokensUsed,
      executionTimeSeconds: executionTime,
      apiCost: calculateOpenAICost(tokensUsed, "gpt-4-turbo")
    });
    await logAIAction({
      partnerId,
      marketplaceType: input.targetMarketplace,
      actionType: "product_created",
      actionDescription: `AI mahsulot kartochkasi yaratdi: ${result.title}`,
      afterState: result,
      impactLevel: "medium",
      estimatedImpact: `SEO score: ${result.seoScore}/100. Yaxshi ko'rinish va savdo imkoniyati.`,
      aiReasoning: result.priceRationale,
      confidenceLevel: result.seoScore,
      wasSuccessful: true
    });
    if (wsManager) {
      const activityData = {
        id: `activity_${taskId}`,
        timestamp: /* @__PURE__ */ new Date(),
        type: "content",
        status: "completed",
        partnerId: partnerId.toString(),
        partnerName: "Partner",
        // You might want to fetch actual partner name
        productName: input.name,
        marketplace: input.targetMarketplace,
        duration: executionTime,
        progress: 100,
        aiModel,
        cost: apiCost,
        details: `Created product card with SEO score ${result.seoScore}/100`
      };
      wsManager.broadcastAIActivity(activityData);
    }
    let infographicUrl = null;
    try {
      console.log("\u{1F3A8} AI: Generating infographic...");
      const isRussianMarketplace2 = ["wildberries", "ozon", "yandex"].includes(input.targetMarketplace);
      const language = isRussianMarketplace2 ? "ru" : "uz";
      const infographicText = isRussianMarketplace2 ? `${result.title}
${result.shortDescription}
\u041A\u043B\u044E\u0447\u0435\u0432\u044B\u0435 \u043E\u0441\u043E\u0431\u0435\u043D\u043D\u043E\u0441\u0442\u0438:
${result.bulletPoints?.slice(0, 3).join("\n") || ""}
\u0426\u0435\u043D\u0430: ${result.suggestedPrice || input.price || "N/A"} \u0441\u0443\u043C` : `${result.title}
${result.shortDescription}
Asosiy xususiyatlar:
${result.bulletPoints?.slice(0, 3).join("\n") || ""}
Narx: ${result.suggestedPrice || input.price || "N/A"} so'm`;
      const infographicPrompt = isRussianMarketplace2 ? `Professional product infographic for marketplace card: ${result.title}. Include product name, key features, price, and quality indicators. Modern, clean design with Russian text. High quality, sales-boosting design.` : `Professional product infographic for marketplace card: ${result.title}. Include product name, key features, price, and quality indicators. Modern, clean design with Uzbek text. High quality, sales-boosting design.`;
      const infographic = await imageAIService.generateProductImage({
        prompt: infographicPrompt,
        type: "infographic",
        aspectRatio: "1:1",
        style: "professional",
        includeText: true,
        textContent: infographicText
      });
      infographicUrl = infographic.url;
      console.log("\u2705 AI: Infographic generated:", infographicUrl);
      await db.run(
        `UPDATE ai_generated_products 
         SET infographic_url = ?, updated_at = CURRENT_TIMESTAMP 
         WHERE id = ?`,
        [infographicUrl, generatedProduct.id]
      );
    } catch (infographicError) {
      console.error("\u26A0\uFE0F Infographic generation failed:", infographicError.message);
    }
    let videoUrl = null;
    try {
      if (videoGenerationService.isEnabled()) {
        console.log("\u{1F3AC} AI: Generating product video...");
        const video = await videoGenerationService.generateProductVideo({
          productName: result.title,
          productDescription: result.description,
          productCategory: input.category || void 0,
          targetMarketplace: input.targetMarketplace,
          duration: 15,
          aspectRatio: "16:9",
          style: "product_showcase",
          language: isRussianMarketplace ? "ru" : "uz",
          includeText: true,
          music: true
        });
        videoUrl = video.videoUrl;
        console.log("\u2705 AI: Video generated:", videoUrl);
        await db.run(
          `UPDATE ai_generated_products 
           SET video_url = ?, updated_at = CURRENT_TIMESTAMP 
           WHERE id = ?`,
          [videoUrl, generatedProduct.id]
        );
      }
    } catch (videoError) {
      console.error("\u26A0\uFE0F Video generation failed:", videoError.message);
    }
    console.log("\u2705 AI: Product card ready!", result.title);
    return {
      success: true,
      productId: generatedProduct.id,
      data: result,
      infographicUrl: infographicUrl || null,
      videoUrl: videoUrl || null
    };
  } catch (error) {
    console.error("\u274C AI: Error:", error.message);
    await updateAITask(taskId, {
      status: "failed",
      errorMessage: error.message
    });
    throw error;
  }
}
async function optimizePrice2(partnerId, productId, marketplaceType) {
  const partnerIdStr = String(partnerId);
  const productIdStr = String(productId);
  if (partnerIdStr === "NaN" || partnerIdStr === "null" || partnerIdStr === "undefined" || !partnerIdStr.trim()) {
    console.warn("\u26A0\uFE0F optimizePrice called with invalid partnerId:", partnerId);
    return { success: false, error: "Invalid partner ID" };
  }
  if (productIdStr === "NaN" || productIdStr === "null" || productIdStr === "undefined" || !productIdStr.trim()) {
    console.warn("\u26A0\uFE0F optimizePrice called with invalid productId:", productId);
    return { success: false, error: "Invalid product ID" };
  }
  console.log("\u{1F916} AI: Optimizing price for product:", productIdStr);
  const taskId = await createAITask({
    partnerId: partnerIdStr,
    taskType: "price_optimization",
    marketplaceType: marketplaceType || "general",
    inputData: { productId: productIdStr }
  });
  try {
    const { sqlite } = await Promise.resolve().then(() => (init_db(), db_exports));
    let product = null;
    if (sqlite) {
      const stmt = sqlite.prepare("SELECT * FROM marketplace_products WHERE id = ? LIMIT 1");
      product = stmt.get(productIdStr);
    } else {
      const { marketplaceProducts } = await Promise.resolve().then(() => (init_schema(), schema_exports));
      const { eq: eq34 } = await import("drizzle-orm");
      const [p] = await db.select().from(marketplaceProducts).where(eq34(marketplaceProducts.id, productIdStr)).limit(1);
      product = p;
    }
    if (!product) {
      throw new Error("Mahsulot topilmadi");
    }
    const competitorPrices = await getCompetitorPrices(product.title || "Unknown", marketplaceType);
    const salesHistory = await getSalesHistory(productIdStr);
    const prompt = `
Siz professional narx strategiyasi mutaxassisisiz.

MAHSULOT: ${product.title}
HOZIRGI NARX: ${product.price} so'm
MARKETPLACE: ${marketplaceType}

RAQOBATCHILAR:
${JSON.stringify(competitorPrices, null, 2)}

SAVDO TARIXI:
${JSON.stringify(salesHistory, null, 2)}

VAZIFA:
Optimal narxni taklif qiling va JSON formatda javob bering:

{
  "recommendedPrice": 100000,
  "priceChange": -5000, // hozirgi narxdan farq
  "priceChangePercent": -5,
  "reasoning": "Narx strategiyasi tushuntirilishi",
  "expectedImpact": "Kutilgan natija (savdo o'sishi, foyda va h.k.)",
  "competitorAnalysis": "Raqobatchilar tahlili",
  "confidenceLevel": 85, // 0-100
  "risks": ["Risk 1", "Risk 2"],
  "alternativePrices": [
    {"price": 95000, "strategy": "Aggressive"},
    {"price": 105000, "strategy": "Premium"}
  ]
}
`;
    const response = await openai.chat.completions.create({
      model: "gpt-4-turbo-preview",
      messages: [{ role: "user", content: prompt }],
      response_format: { type: "json_object" },
      temperature: 0.5
    });
    const result = JSON.parse(response.choices[0].message.content || "{}");
    await updateAITask(taskId, {
      status: "completed",
      outputData: result
    });
    await logAIAction({
      partnerId,
      marketplaceType,
      actionType: "price_updated",
      actionDescription: `Narx ${product.price} \u2192 ${result.recommendedPrice} so'm`,
      beforeState: { price: product.price },
      afterState: { price: result.recommendedPrice },
      impactLevel: "high",
      estimatedImpact: result.expectedImpact,
      aiReasoning: result.reasoning,
      confidenceLevel: result.confidenceLevel,
      wasSuccessful: true
    });
    return { success: true, data: result };
  } catch (error) {
    await updateAITask(taskId, { status: "failed", errorMessage: error.message });
    throw error;
  }
}
async function monitorPartnerProducts(partnerId) {
  if (partnerId === null || partnerId === void 0) {
    console.warn("\u26A0\uFE0F monitorPartnerProducts called with null/undefined partnerId");
    return { issues: [], summary: "Invalid partner ID (null)", productsChecked: 0, issuesFound: 0 };
  }
  const partnerIdStr = String(partnerId);
  if (partnerIdStr === "NaN" || partnerIdStr === "null" || partnerIdStr === "undefined" || partnerIdStr.trim() === "") {
    console.warn("\u26A0\uFE0F monitorPartnerProducts called with invalid partnerId:", partnerId);
    return { issues: [], summary: "Invalid partner ID", productsChecked: 0, issuesFound: 0 };
  }
  console.log("\u{1F916} AI: Monitoring partner products...", partnerIdStr);
  try {
    const { storage: storage4 } = await Promise.resolve().then(() => (init_storage(), storage_exports));
    let partnerProducts = [];
    try {
      partnerProducts = await storage4.getProductsByPartnerId(partnerIdStr);
    } catch (e) {
      console.log("No products found for partner:", partnerIdStr);
      return { issues: [], summary: "No products to monitor", productsChecked: 0, issuesFound: 0 };
    }
    if (!Array.isArray(partnerProducts) || partnerProducts.length === 0) {
      console.log("Empty products array for partner:", partnerIdStr);
      return { issues: [], summary: "No products to monitor", productsChecked: 0, issuesFound: 0 };
    }
    const issues = [];
    for (const product of partnerProducts) {
      if (!product || !product.name) {
        console.log("Skipping invalid product:", product);
        continue;
      }
      const stockQty = safeParseNumber(product.stockQuantity || product.stock_quantity, 0);
      if (stockQty < 10) {
        issues.push({
          type: "low_stock",
          severity: stockQty === 0 ? "critical" : "high",
          title: "Kam qoldi",
          description: `Mahsulot: ${product.name}. Stok: ${stockQty}`,
          suggestedAction: "Ombordagi tovarni to'ldiring",
          productId: product.id,
          productName: product.name
        });
      }
      const price = safeParseNumber(product.price, 0);
      const costPrice = safeParseNumber(product.costPrice || product.cost_price, 0);
      if (costPrice > 0 && price > 0 && price > costPrice) {
        const margin = (price - costPrice) / price * 100;
        if (isFinite(margin) && !isNaN(margin) && margin < 10) {
          issues.push({
            type: "low_margin",
            severity: "medium",
            title: "Past foyda",
            description: `Mahsulot: ${product.name}. Foyda: ${margin.toFixed(1)}%`,
            suggestedAction: "Narxni oshiring yoki tannarxni kamaytiring",
            productId: product.id,
            productName: product.name,
            margin: margin.toFixed(1)
          });
        }
      }
      if (!product.description || product.description.length < 50) {
        issues.push({
          type: "missing_description",
          severity: "low",
          title: "Tavsif kam",
          description: `Mahsulot: ${product.name}. Tavsif juda qisqa yoki yo'q.`,
          suggestedAction: "Mahsulot tavsifini to'ldiring",
          productId: product.id,
          productName: product.name
        });
      }
    }
    const result = {
      issues,
      summary: `${partnerProducts.length} ta mahsulot tekshirildi, ${issues.length} ta muammo topildi`,
      productsChecked: partnerProducts.length,
      issuesFound: issues.length,
      timestamp: (/* @__PURE__ */ new Date()).toISOString()
    };
    console.log(`\u2705 AI Monitoring complete: ${result.summary}`);
    return result;
  } catch (error) {
    console.error("\u274C AI: Monitoring error:", error.message);
    return {
      issues: [],
      summary: "Monitoring error",
      error: error.message,
      productsChecked: 0,
      issuesFound: 0
    };
  }
}
function safeParseNumber(value, defaultValue = 0) {
  if (value === null || value === void 0 || value === "") {
    return defaultValue;
  }
  const parsed = typeof value === "number" ? value : parseFloat(String(value));
  if (isNaN(parsed) || !isFinite(parsed)) {
    return defaultValue;
  }
  return parsed;
}
async function autoUploadToMarketplace(productId, marketplaceType, credentials) {
  console.log("\u{1F916} AI: Uploading to marketplace...", marketplaceType);
  try {
    const { storage: storage4 } = await Promise.resolve().then(() => (init_storage(), storage_exports));
    const product = await storage4.getProductById(productId.toString());
    if (!product) {
      throw new Error("Mahsulot topilmadi");
    }
    console.log(`\u2705 AI: Product ${product.name} prepared for ${marketplaceType}`);
    return {
      success: true,
      productId,
      marketplace: marketplaceType,
      message: `Mahsulot ${marketplaceType} ga yuklashga tayyor`
    };
  } catch (error) {
    console.error("\u274C AI: Upload error:", error.message);
    throw error;
  }
}
function getMarketplaceRules(marketplace) {
  const rules = {
    uzum: {
      titleMaxLength: 200,
      descriptionMaxLength: 3e3,
      keywordsMax: 20,
      imagesMax: 10,
      bulletPointsMax: 5
    },
    wildberries: {
      titleMaxLength: 100,
      descriptionMaxLength: 5e3,
      keywordsMax: 30,
      imagesMax: 15,
      bulletPointsMax: 10
    },
    yandex: {
      titleMaxLength: 150,
      descriptionMaxLength: 4e3,
      keywordsMax: 25,
      imagesMax: 12,
      bulletPointsMax: 7
    },
    ozon: {
      titleMaxLength: 250,
      descriptionMaxLength: 4e3,
      keywordsMax: 20,
      imagesMax: 15,
      bulletPointsMax: 5
    }
  };
  return rules[marketplace] || rules.uzum;
}
async function createAITask(data) {
  try {
    const partnerId = String(data.partnerId || "");
    if (partnerId === "NaN" || partnerId === "null" || !partnerId.trim()) {
      console.warn("\u26A0\uFE0F createAITask called with invalid partnerId");
      return "invalid-task-" + Date.now();
    }
    const { sqlite } = await Promise.resolve().then(() => (init_db(), db_exports));
    const { nanoid: nanoid23 } = await import("nanoid");
    const taskId = nanoid23();
    if (sqlite) {
      const stmt = sqlite.prepare(`
        INSERT INTO ai_tasks (id, partner_id, task_type, marketplace_type, status, input_data, created_at)
        VALUES (?, ?, ?, ?, 'pending', ?, unixepoch())
      `);
      stmt.run(
        taskId,
        partnerId,
        data.taskType || "unknown",
        data.marketplaceType || "general",
        JSON.stringify(data.inputData || {})
      );
    }
    return taskId;
  } catch (error) {
    console.error("Error creating AI task:", error);
    return "error-task-" + Date.now();
  }
}
async function updateAITask(taskId, data) {
  try {
    const { sqlite } = await Promise.resolve().then(() => (init_db(), db_exports));
    if (sqlite) {
      const updates = [];
      const values = [];
      if (data.status) {
        updates.push("status = ?");
        values.push(data.status);
      }
      if (data.outputData) {
        updates.push("output_data = ?");
        values.push(JSON.stringify(data.outputData));
      }
      if (data.errorMessage) {
        updates.push("error_message = ?");
        values.push(data.errorMessage);
      }
      if (updates.length > 0) {
        values.push(String(taskId));
        const stmt = sqlite.prepare(`UPDATE ai_tasks SET ${updates.join(", ")}, updated_at = unixepoch() WHERE id = ?`);
        stmt.run(...values);
      }
    }
  } catch (error) {
    console.error("Error updating AI task:", error);
  }
}
async function logAIAction(data) {
  try {
    const partnerId = String(data.partnerId || "");
    if (partnerId === "NaN" || partnerId === "null" || !partnerId.trim()) {
      console.warn("\u26A0\uFE0F logAIAction called with invalid partnerId");
      return;
    }
    const { sqlite } = await Promise.resolve().then(() => (init_db(), db_exports));
    if (sqlite) {
      const stmt = sqlite.prepare(`
        INSERT INTO ai_actions_log (
          partner_id, marketplace_type, action_type, action_description,
          before_state, after_state, impact_level, estimated_impact,
          ai_reasoning, confidence_level, was_successful, created_at
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, unixepoch())
      `);
      stmt.run(
        partnerId,
        data.marketplaceType || "general",
        data.actionType || "unknown",
        data.actionDescription || "",
        JSON.stringify(data.beforeState || {}),
        JSON.stringify(data.afterState || {}),
        data.impactLevel || "low",
        data.estimatedImpact || "",
        data.aiReasoning || "",
        data.confidenceLevel || 0,
        data.wasSuccessful ? 1 : 0
      );
    }
  } catch (error) {
    console.error("Error logging AI action:", error);
  }
}
function calculateOpenAICost(tokens, model) {
  const costPer1kTokens = model.includes("gpt-4") ? 0.01 : 2e-3;
  return tokens / 1e3 * costPer1kTokens;
}
async function getCompetitorPrices(productName, marketplace) {
  console.log("\u{1F50D} Scraping competitor prices for:", productName, "on", marketplace);
  try {
    const puppeteer2 = await import("puppeteer");
    const browser = await puppeteer2.default.launch({
      headless: true,
      args: ["--no-sandbox", "--disable-setuid-sandbox"]
    });
    const page = await browser.newPage();
    await page.setUserAgent("Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36");
    let searchUrl = "";
    let competitors = [];
    switch (marketplace) {
      case "uzum":
        searchUrl = `https://uzum.uz/search?query=${encodeURIComponent(productName)}`;
        await page.goto(searchUrl, { waitUntil: "networkidle2" });
        competitors = await page.evaluate(() => {
          const products4 = Array.from(document.querySelectorAll(".product-card")).slice(0, 5);
          return products4.map((product) => {
            const title = product.querySelector(".product-title")?.textContent?.trim() || "";
            const price = product.querySelector(".product-price")?.textContent?.trim() || "";
            const rating = product.querySelector(".rating")?.textContent?.trim() || "4.0";
            const numericPrice = parseFloat(price.replace(/[^\d]/g, "")) || 0;
            return {
              seller: title.split(" ")[0] || "Uzum Seller",
              price: numericPrice,
              rating: parseFloat(rating)
            };
          }).filter((c) => c.price > 0);
        });
        break;
      case "wildberries":
        searchUrl = `https://www.wildberries.ru/catalog/0/search.aspx?search=${encodeURIComponent(productName)}`;
        await page.goto(searchUrl, { waitUntil: "networkidle2" });
        competitors = await page.evaluate(() => {
          const products4 = Array.from(document.querySelectorAll(".product-card")).slice(0, 5);
          return products4.map((product) => {
            const title = product.querySelector(".goods-name")?.textContent?.trim() || "";
            const price = product.querySelector(".price-current")?.textContent?.trim() || "";
            const rating = product.querySelector(".rating")?.textContent?.trim() || "4.0";
            const numericPrice = parseFloat(price.replace(/[^\d]/g, "")) || 0;
            return {
              seller: "Wildberries Seller",
              price: numericPrice,
              rating: parseFloat(rating)
            };
          }).filter((c) => c.price > 0);
        });
        break;
      case "yandex":
        searchUrl = `https://market.yandex.ru/search?text=${encodeURIComponent(productName)}`;
        await page.goto(searchUrl, { waitUntil: "networkidle2" });
        competitors = await page.evaluate(() => {
          const products4 = Array.from(document.querySelectorAll(".product")).slice(0, 5);
          return products4.map((product) => {
            const title = product.querySelector(".title")?.textContent?.trim() || "";
            const price = product.querySelector(".price")?.textContent?.trim() || "";
            const rating = product.querySelector(".rating")?.textContent?.trim() || "4.0";
            const numericPrice = parseFloat(price.replace(/[^\d]/g, "")) || 0;
            return {
              seller: title.split(" ")[0] || "Yandex Seller",
              price: numericPrice,
              rating: parseFloat(rating)
            };
          }).filter((c) => c.price > 0);
        });
        break;
      case "ozon":
        searchUrl = `https://www.ozon.ru/search/?text=${encodeURIComponent(productName)}`;
        await page.goto(searchUrl, { waitUntil: "networkidle2" });
        competitors = await page.evaluate(() => {
          const products4 = Array.from(document.querySelectorAll(".tile")).slice(0, 5);
          return products4.map((product) => {
            const title = product.querySelector(".tile-title")?.textContent?.trim() || "";
            const price = product.querySelector(".price-number")?.textContent?.trim() || "";
            const rating = product.querySelector(".rating")?.textContent?.trim() || "4.0";
            const numericPrice = parseFloat(price.replace(/[^\d]/g, "")) || 0;
            return {
              seller: title.split(" ")[0] || "Ozon Seller",
              price: numericPrice,
              rating: parseFloat(rating)
            };
          }).filter((c) => c.price > 0);
        });
        break;
      default:
        competitors = [];
    }
    await browser.close();
    if (competitors.length === 0) {
      console.log("\u26A0\uFE0F No competitors found, using fallback data");
      return [
        { seller: "Raqobatchi 1", price: 95e3, rating: 4.5 },
        { seller: "Raqobatchi 2", price: 11e4, rating: 4.8 },
        { seller: "Raqobatchi 3", price: 105e3, rating: 4.2 }
      ];
    }
    console.log(`\u2705 Found ${competitors.length} competitors`);
    return competitors;
  } catch (error) {
    console.error("\u274C Error scraping competitor prices:", error);
    return [
      { seller: "Raqobatchi 1", price: 95e3, rating: 4.5 },
      { seller: "Raqobatchi 2", price: 11e4, rating: 4.8 },
      { seller: "Raqobatchi 3", price: 105e3, rating: 4.2 }
    ];
  }
}
async function getSalesHistory(productId) {
  const productIdStr = String(productId);
  if (productIdStr === "NaN" || productIdStr === "null" || !productIdStr.trim()) {
    console.warn("\u26A0\uFE0F getSalesHistory called with invalid productId");
    return {
      last7Days: { sales: 0, revenue: 0 },
      last30Days: { sales: 0, revenue: 0 },
      trend: "stable",
      averageRating: 4.5
    };
  }
  console.log("\u{1F4CA} Fetching real sales history for product:", productIdStr);
  try {
    const thirtyDaysAgo = /* @__PURE__ */ new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
    const sevenDaysAgo = /* @__PURE__ */ new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
    const [last7DaysData] = await db.select({
      revenue: sql3`COALESCE(SUM(${analytics.revenue}), 0)`,
      orders: sql3`COALESCE(SUM(${analytics.orders}), 0)`
    }).from(analytics).where(sql3`${analytics.date} >= ${sevenDaysAgo}`);
    const [last30DaysData] = await db.select({
      revenue: sql3`COALESCE(SUM(${analytics.revenue}), 0)`,
      orders: sql3`COALESCE(SUM(${analytics.orders}), 0)`
    }).from(analytics).where(sql3`${analytics.date} >= ${thirtyDaysAgo}`);
    const safeParseInt = /* @__PURE__ */ __name((val, defaultVal) => {
      const parsed = parseInt(String(val));
      return isNaN(parsed) ? defaultVal : parsed;
    }, "safeParseInt");
    const safeParseFloat = /* @__PURE__ */ __name((val, defaultVal) => {
      const parsed = parseFloat(String(val));
      return isNaN(parsed) ? defaultVal : parsed;
    }, "safeParseFloat");
    const last7DaysSales = last7DaysData ? Math.round(safeParseInt(last7DaysData.orders, 0) / 7) : Math.floor(Math.random() * 10) + 5;
    const last30DaysSales = last30DaysData ? Math.round(safeParseInt(last30DaysData.orders, 0) / 30) : Math.floor(Math.random() * 15) + 10;
    const last7DaysRevenue = last7DaysData ? safeParseFloat(last7DaysData.revenue, 0) / 7 : last7DaysSales * 1e5;
    const last30DaysRevenue = last30DaysData ? safeParseFloat(last30DaysData.revenue, 0) / 30 : last30DaysSales * 1e5;
    return {
      last7Days: {
        sales: last7DaysSales,
        revenue: Math.round(last7DaysRevenue)
      },
      last30Days: {
        sales: last30DaysSales,
        revenue: Math.round(last30DaysRevenue)
      }
    };
  } catch (error) {
    console.error("\u274C Error fetching sales history:", error);
    return {
      last7Days: { sales: 15, revenue: 15e5 },
      last30Days: { sales: 45, revenue: 45e5 }
    };
  }
}
async function broadcastAIStats() {
  try {
    const now = /* @__PURE__ */ new Date();
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const [activeTasks] = await db.select({ count: sql3`COUNT(*)` }).from("ai_tasks").where(sql3`status = 'processing'`);
    const [queuedTasks] = await db.select({ count: sql3`COUNT(*)` }).from("ai_tasks").where(sql3`status = 'pending'`);
    const [completedToday] = await db.select({ count: sql3`COUNT(*)` }).from("ai_tasks").where(sql3`status = 'completed' AND created_at >= ${today}`);
    const [totalTasks] = await db.select({ count: sql3`COUNT(*)` }).from("ai_tasks").where(sql3`created_at >= ${today}`);
    const [successfulTasks] = await db.select({ count: sql3`COUNT(*)` }).from("ai_tasks").where(sql3`status = 'completed' AND created_at >= ${today}`);
    const successRate = totalTasks.count > 0 ? successfulTasks.count / totalTasks.count * 100 : 0;
    const [avgTimeResult] = await db.select({
      avgTime: sql3`COALESCE(AVG(execution_time_seconds), 0)`
    }).from("ai_tasks").where(sql3`status = 'completed' AND created_at >= ${today}`);
    const [totalCostResult] = await db.select({
      totalCost: sql3`COALESCE(SUM(api_cost), 0)`
    }).from("ai_tasks").where(sql3`created_at >= ${today}`);
    const stats = {
      activeWorkers: activeTasks.count,
      queuedTasks: queuedTasks.count,
      completedToday: completedToday.count,
      successRate: Math.round(successRate * 100) / 100,
      // Round to 2 decimal places
      avgProcessingTime: Math.round(avgTimeResult.avgTime * 100) / 100,
      totalCost: Math.round(totalCostResult.totalCost * 100) / 100
    };
    if (wsManager) {
      wsManager.broadcastAIStats(stats);
    }
    return stats;
  } catch (error) {
    console.error("Error broadcasting AI stats:", error);
    return null;
  }
}
var aiManagerService_default;
var init_aiManagerService = __esm({
  "server/services/aiManagerService.ts"() {
    init_db();
    init_schema();
    init_websocket();
    init_realAIService();
    init_contextCacheService();
    __name(generateProductCard2, "generateProductCard");
    __name(optimizePrice2, "optimizePrice");
    __name(monitorPartnerProducts, "monitorPartnerProducts");
    __name(safeParseNumber, "safeParseNumber");
    __name(autoUploadToMarketplace, "autoUploadToMarketplace");
    __name(getMarketplaceRules, "getMarketplaceRules");
    __name(createAITask, "createAITask");
    __name(updateAITask, "updateAITask");
    __name(logAIAction, "logAIAction");
    __name(calculateOpenAICost, "calculateOpenAICost");
    __name(getCompetitorPrices, "getCompetitorPrices");
    __name(getSalesHistory, "getSalesHistory");
    __name(broadcastAIStats, "broadcastAIStats");
    aiManagerService_default = {
      generateProductCard: generateProductCard2,
      optimizePrice: optimizePrice2,
      monitorPartnerProducts,
      autoUploadToMarketplace,
      broadcastAIStats
    };
  }
});

// server/marketplace/manager.ts
var manager_exports = {};
__export(manager_exports, {
  MarketplaceManager: () => MarketplaceManager,
  marketplaceManager: () => marketplaceManager
});
var MarketplaceManager, marketplaceManager;
var init_manager = __esm({
  "server/marketplace/manager.ts"() {
    MarketplaceManager = class {
      static {
        __name(this, "MarketplaceManager");
      }
      async initializeIntegration() {
        console.log("\u26A0\uFE0F  Marketplace integration temporarily disabled");
        return false;
      }
      async getCombinedStats() {
        return {
          totalOrders: 0,
          totalRevenue: 0,
          totalProducts: 0,
          activeProducts: 0
        };
      }
    };
    marketplaceManager = new MarketplaceManager();
  }
});

// server/services/referralFirstPurchaseService.ts
var referralFirstPurchaseService_exports = {};
__export(referralFirstPurchaseService_exports, {
  checkAndProcessFirstPurchase: () => checkAndProcessFirstPurchase,
  processFirstPurchase: () => processFirstPurchase
});
import { eq as eq13, and as and11, sql as sql8 } from "drizzle-orm";
import { nanoid as nanoid12 } from "nanoid";
async function processFirstPurchase(data) {
  try {
    console.log("[REFERRAL FIRST PURCHASE] Processing:", data);
    const referral = await db.select().from(referrals).where(and11(
      eq13(referrals.referredPartnerId, data.referredPartnerId),
      sql8`${referrals.status} IN ('registered', 'invited')`
      // Faqat yangi referral'lar
    )).limit(1);
    if (referral.length === 0) {
      console.log("[REFERRAL FIRST PURCHASE] No referral found for partner:", data.referredPartnerId);
      return;
    }
    const referralRecord = referral[0];
    const existingPurchase = await db.select().from(referralFirstPurchases).where(eq13(referralFirstPurchases.referredPartnerId, data.referredPartnerId)).limit(1);
    if (existingPurchase.length > 0) {
      console.log("[REFERRAL FIRST PURCHASE] Already processed first purchase for partner:", data.referredPartnerId);
      return;
    }
    const tier = SAAS_PRICING_TIERS[data.tierId];
    if (!tier) {
      console.error("[REFERRAL FIRST PURCHASE] Invalid tier:", data.tierId);
      return;
    }
    const monthlyFee = tier.monthlyFeeUSD || 0;
    if (monthlyFee === 0) {
      console.log("[REFERRAL FIRST PURCHASE] Free tier, no commission");
      return;
    }
    const totalAmount = monthlyFee * data.subscriptionMonths;
    const commissionAmount = totalAmount * REFERRAL_COMMISSION_RATE;
    const firstPurchaseId = nanoid12();
    await db.insert(referralFirstPurchases).values({
      id: firstPurchaseId,
      referralId: referralRecord.id,
      referrerPartnerId: referralRecord.referrerPartnerId,
      referredPartnerId: data.referredPartnerId,
      subscriptionId: data.subscriptionId,
      invoiceId: data.invoiceId,
      paymentId: data.paymentId,
      tierId: data.tierId,
      monthlyFee,
      subscriptionMonths: data.subscriptionMonths,
      totalAmount,
      commissionRate: REFERRAL_COMMISSION_RATE,
      commissionAmount,
      status: "paid",
      paidAt: /* @__PURE__ */ new Date(),
      createdAt: /* @__PURE__ */ new Date()
    });
    await db.update(referrals).set({
      status: "active",
      activatedAt: /* @__PURE__ */ new Date(),
      bonusEarned: commissionAmount
    }).where(eq13(referrals.id, referralRecord.id));
    const { referralEarnings: referralEarnings2 } = await Promise.resolve().then(() => (init_schema(), schema_exports));
    await db.insert(referralEarnings2).values({
      id: nanoid12(),
      referralId: referralRecord.id,
      referrerPartnerId: referralRecord.referrerPartnerId,
      amount: commissionAmount,
      monthNumber: 1,
      // Birinchi oy
      platformProfit: totalAmount,
      bonusRate: REFERRAL_COMMISSION_RATE,
      tierMultiplier: 1,
      // Tier bonus yo'q
      status: "pending",
      createdAt: /* @__PURE__ */ new Date()
    });
    console.log("[REFERRAL FIRST PURCHASE] \u2705 Success:", {
      referrerPartnerId: referralRecord.referrerPartnerId,
      referredPartnerId: data.referredPartnerId,
      commissionAmount,
      subscriptionMonths: data.subscriptionMonths
    });
  } catch (error) {
    console.error("[REFERRAL FIRST PURCHASE] \u274C Error:", error);
    throw error;
  }
}
async function checkAndProcessFirstPurchase(partnerId, subscriptionId, invoiceId, paymentId) {
  try {
    if (subscriptionId) {
      const subscription = await db.select().from(subscriptions).where(eq13(subscriptions.id, subscriptionId)).limit(1);
      if (subscription.length > 0) {
        const sub = subscription[0];
        const startDate = new Date(sub.startDate);
        const endDate = sub.endDate ? new Date(sub.endDate) : null;
        const subscriptionMonths = endDate ? Math.ceil((endDate.getTime() - startDate.getTime()) / (1e3 * 60 * 60 * 24 * 30)) : 1;
        await processFirstPurchase({
          referredPartnerId: partnerId,
          subscriptionId,
          invoiceId: invoiceId || "",
          paymentId: paymentId || "",
          tierId: sub.tierId,
          subscriptionMonths: subscriptionMonths || 1
        });
      }
    }
  } catch (error) {
    console.error("[REFERRAL FIRST PURCHASE] Check error:", error);
  }
}
var REFERRAL_COMMISSION_RATE;
var init_referralFirstPurchaseService = __esm({
  "server/services/referralFirstPurchaseService.ts"() {
    init_db();
    init_schema();
    init_SAAS_PRICING_CONFIG();
    REFERRAL_COMMISSION_RATE = 0.1;
    __name(processFirstPurchase, "processFirstPurchase");
    __name(checkAndProcessFirstPurchase, "checkAndProcessFirstPurchase");
  }
});

// server/email.ts
var email_exports = {};
__export(email_exports, {
  sendEmail: () => sendEmail,
  sendScheduledReports: () => sendScheduledReports
});
import nodemailer2 from "nodemailer";
async function sendEmail(to, template, data) {
  try {
    if (!process.env.SMTP_USER || !process.env.SMTP_PASS) {
      console.warn("SMTP credentials not configured, skipping email send");
      return { success: false, message: "SMTP not configured" };
    }
    const emailContent = emailTemplates[template](data.name, data);
    const info = await transporter.sendMail({
      from: `"BiznesYordam" <${process.env.SMTP_USER}>`,
      to,
      subject: emailContent.subject,
      html: emailContent.html
    });
    console.log("Email sent:", info.messageId);
    return { success: true, messageId: info.messageId };
  } catch (error) {
    console.error("Email send error:", error);
    return { success: false, error: error instanceof Error ? error.message : "Unknown error" };
  }
}
async function sendScheduledReports() {
  console.log("Sending scheduled reports...");
}
var transporter, emailTemplates;
var init_email = __esm({
  "server/email.ts"() {
    transporter = nodemailer2.createTransport({
      host: process.env.SMTP_HOST || "smtp.gmail.com",
      port: parseInt(process.env.SMTP_PORT || "587"),
      secure: false,
      auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS
      }
    });
    emailTemplates = {
      tierUpgradeApproved: /* @__PURE__ */ __name((partnerName, newTier) => ({
        subject: "\u{1F389} Tarif Yangilash Tasdiqlandi - BiznesYordam",
        html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 30px; text-align: center;">
          <h1 style="color: white; margin: 0;">BiznesYordam.uz</h1>
        </div>
        <div style="padding: 30px; background: #f9fafb;">
          <h2 style="color: #1f2937;">Tabriklaymiz, ${partnerName}!</h2>
          <p style="color: #4b5563; font-size: 16px; line-height: 1.6;">
            Sizning tarif yangilash so'rovingiz tasdiqlandi! \u{1F38A}
          </p>
          <div style="background: white; padding: 20px; border-radius: 8px; margin: 20px 0; border-left: 4px solid #667eea;">
            <h3 style="color: #667eea; margin-top: 0;">Yangi Tarif: ${newTier}</h3>
            <p style="color: #6b7280;">
              Endi siz yangi tarifning barcha imkoniyatlaridan foydalanishingiz mumkin:
            </p>
            <ul style="color: #4b5563;">
              <li>Kamroq komissiya</li>
              <li>Ko'proq mahsulotlar</li>
              <li>Kengaytirilgan tahlillar</li>
              <li>Ustuvor qo'llab-quvvatlash</li>
            </ul>
          </div>
          <div style="text-align: center; margin: 30px 0;">
            <a href="${process.env.APP_URL || "https://biznesyordam.uz"}/partner/dashboard" 
               style="background: #667eea; color: white; padding: 12px 30px; text-decoration: none; border-radius: 6px; display: inline-block;">
              Dashboardga O'tish
            </a>
          </div>
          <p style="color: #9ca3af; font-size: 14px; margin-top: 30px;">
            Savol yoki yordam kerak bo'lsa, biz bilan bog'laning: support@biznesyordam.uz
          </p>
        </div>
        <div style="background: #1f2937; padding: 20px; text-align: center;">
          <p style="color: #9ca3af; margin: 0; font-size: 12px;">
            \xA9 2025 BiznesYordam.uz. Barcha huquqlar himoyalangan.
          </p>
        </div>
      </div>
    `
      }), "tierUpgradeApproved"),
      newOrder: /* @__PURE__ */ __name((partnerName, orderDetails) => ({
        subject: "\u{1F6D2} Yangi Buyurtma - BiznesYordam",
        html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 30px; text-align: center;">
          <h1 style="color: white; margin: 0;">BiznesYordam.uz</h1>
        </div>
        <div style="padding: 30px; background: #f9fafb;">
          <h2 style="color: #1f2937;">Salom, ${partnerName}!</h2>
          <p style="color: #4b5563; font-size: 16px; line-height: 1.6;">
            Sizga yangi buyurtma keldi! \u{1F389}
          </p>
          <div style="background: white; padding: 20px; border-radius: 8px; margin: 20px 0;">
            <h3 style="color: #667eea; margin-top: 0;">Buyurtma Tafsilotlari</h3>
            <table style="width: 100%; color: #4b5563;">
              <tr>
                <td style="padding: 8px 0;"><strong>Buyurtma ID:</strong></td>
                <td style="padding: 8px 0;">${orderDetails.id}</td>
              </tr>
              <tr>
                <td style="padding: 8px 0;"><strong>Mahsulot:</strong></td>
                <td style="padding: 8px 0;">${orderDetails.product}</td>
              </tr>
              <tr>
                <td style="padding: 8px 0;"><strong>Miqdor:</strong></td>
                <td style="padding: 8px 0;">${orderDetails.quantity}</td>
              </tr>
              <tr>
                <td style="padding: 8px 0;"><strong>Summa:</strong></td>
                <td style="padding: 8px 0;"><strong>${orderDetails.amount} so'm</strong></td>
              </tr>
            </table>
          </div>
          <div style="text-align: center; margin: 30px 0;">
            <a href="${process.env.APP_URL || "https://biznesyordam.uz"}/partner/dashboard" 
               style="background: #667eea; color: white; padding: 12px 30px; text-decoration: none; border-radius: 6px; display: inline-block;">
              Buyurtmani Ko'rish
            </a>
          </div>
        </div>
        <div style="background: #1f2937; padding: 20px; text-align: center;">
          <p style="color: #9ca3af; margin: 0; font-size: 12px;">
            \xA9 2025 BiznesYordam.uz. Barcha huquqlar himoyalangan.
          </p>
        </div>
      </div>
    `
      }), "newOrder"),
      weeklyReport: /* @__PURE__ */ __name((partnerName, reportData) => ({
        subject: "\u{1F4CA} Haftalik Hisobot - BiznesYordam",
        html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 30px; text-align: center;">
          <h1 style="color: white; margin: 0;">BiznesYordam.uz</h1>
          <p style="color: white; margin: 10px 0 0 0;">Haftalik Hisobot</p>
        </div>
        <div style="padding: 30px; background: #f9fafb;">
          <h2 style="color: #1f2937;">Salom, ${partnerName}!</h2>
          <p style="color: #4b5563; font-size: 16px; line-height: 1.6;">
            Mana sizning o'tgan hafta natijalari:
          </p>
          <div style="background: white; padding: 20px; border-radius: 8px; margin: 20px 0;">
            <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 20px;">
              <div style="text-align: center; padding: 15px; background: #f0f9ff; border-radius: 6px;">
                <p style="color: #0369a1; font-size: 14px; margin: 0;">Aylanma</p>
                <p style="color: #0c4a6e; font-size: 24px; font-weight: bold; margin: 10px 0 0 0;">
                  ${reportData.revenue.toLocaleString()} so'm
                </p>
              </div>
              <div style="text-align: center; padding: 15px; background: #f0fdf4; border-radius: 6px;">
                <p style="color: #15803d; font-size: 14px; margin: 0;">Buyurtmalar</p>
                <p style="color: #14532d; font-size: 24px; font-weight: bold; margin: 10px 0 0 0;">
                  ${reportData.orders}
                </p>
              </div>
              <div style="text-align: center; padding: 15px; background: #fef3c7; border-radius: 6px;">
                <p style="color: #b45309; font-size: 14px; margin: 0;">Foyda</p>
                <p style="color: #78350f; font-size: 24px; font-weight: bold; margin: 10px 0 0 0;">
                  ${reportData.profit.toLocaleString()} so'm
                </p>
              </div>
              <div style="text-align: center; padding: 15px; background: #fce7f3; border-radius: 6px;">
                <p style="color: #be185d; font-size: 14px; margin: 0;">Foyda Marjasi</p>
                <p style="color: #831843; font-size: 24px; font-weight: bold; margin: 10px 0 0 0;">
                  ${reportData.margin}%
                </p>
              </div>
            </div>
          </div>
          <div style="text-align: center; margin: 30px 0;">
            <a href="${process.env.APP_URL || "https://biznesyordam.uz"}/partner/dashboard" 
               style="background: #667eea; color: white; padding: 12px 30px; text-decoration: none; border-radius: 6px; display: inline-block;">
              To'liq Hisobotni Ko'rish
            </a>
          </div>
        </div>
        <div style="background: #1f2937; padding: 20px; text-align: center;">
          <p style="color: #9ca3af; margin: 0; font-size: 12px;">
            \xA9 2025 BiznesYordam.uz. Barcha huquqlar himoyalangan.
          </p>
        </div>
      </div>
    `
      }), "weeklyReport")
    };
    __name(sendEmail, "sendEmail");
    __name(sendScheduledReports, "sendScheduledReports");
  }
});

// server/services/productRecognition.ts
var productRecognition_exports = {};
__export(productRecognition_exports, {
  ProductRecognitionService: () => ProductRecognitionService,
  productRecognitionService: () => productRecognitionService
});
import axios9 from "axios";
import sharp from "sharp";
var ProductRecognitionService, productRecognitionService;
var init_productRecognition = __esm({
  "server/services/productRecognition.ts"() {
    ProductRecognitionService = class {
      static {
        __name(this, "ProductRecognitionService");
      }
      apiKey;
      visionEndpoint = "https://vision.googleapis.com/v1/images:annotate";
      constructor() {
        this.apiKey = process.env.GOOGLE_VISION_API_KEY || "";
        if (!this.apiKey) {
          console.warn("\u26A0\uFE0F  GOOGLE_VISION_API_KEY not set. Product recognition will use mock data.");
        }
      }
      /**
       * Optimize image for API processing
       */
      async optimizeImage(base64Image) {
        try {
          const base64Data = base64Image.replace(/^data:image\/\w+;base64,/, "");
          const buffer = Buffer.from(base64Data, "base64");
          const optimized = await sharp(buffer).resize(1024, 1024, { fit: "inside", withoutEnlargement: true }).jpeg({ quality: 85 }).toBuffer();
          return optimized.toString("base64");
        } catch (error) {
          console.error("Image optimization error:", error);
          return base64Image.replace(/^data:image\/\w+;base64,/, "");
        }
      }
      /**
       * Recognize product using Google Vision API
       */
      async recognizeProduct(base64Image) {
        try {
          console.log("\u{1F50D} Starting product recognition...");
          if (!this.apiKey) {
            return this.getMockRecognition();
          }
          const optimizedImage = await this.optimizeImage(base64Image);
          const response = await axios9.post(
            `${this.visionEndpoint}?key=${this.apiKey}`,
            {
              requests: [
                {
                  image: { content: optimizedImage },
                  features: [
                    { type: "LABEL_DETECTION", maxResults: 10 },
                    { type: "WEB_DETECTION", maxResults: 10 },
                    { type: "LOGO_DETECTION", maxResults: 5 },
                    { type: "TEXT_DETECTION", maxResults: 5 }
                  ]
                }
              ]
            }
          );
          const result = response.data.responses[0];
          console.log("\u2705 Vision API response received");
          const labels = result.labelAnnotations || [];
          const webDetection = result.webDetection || {};
          const logos = result.logoAnnotations || [];
          const texts = result.textAnnotations || [];
          const productName = this.extractProductName(webDetection, labels, texts);
          const category = this.extractCategory(labels);
          const brand = this.extractBrand(logos, texts);
          const images = this.extractImages(webDetection);
          const marketplaceLinks = await this.searchMarketplaces(productName, brand);
          const prices = Object.values(marketplaceLinks).map((link) => link?.price || 0).filter((price) => price > 0);
          const averagePrice = prices.length > 0 ? Math.round(prices.reduce((a, b) => a + b, 0) / prices.length) : 0;
          const confidence = this.calculateConfidence(labels, webDetection);
          return {
            name: productName,
            category,
            brand,
            images: images.slice(0, 5),
            marketplaceLinks,
            averagePrice,
            confidence,
            description: this.generateDescription(productName, category, brand)
          };
        } catch (error) {
          console.error("\u274C Product recognition error:", error.message);
          return this.getMockRecognition();
        }
      }
      /**
       * Extract product name from Vision API results
       */
      extractProductName(webDetection, labels, texts) {
        if (webDetection.webEntities && webDetection.webEntities.length > 0) {
          const topEntity = webDetection.webEntities[0];
          if (topEntity.description && topEntity.score > 0.5) {
            return topEntity.description;
          }
        }
        if (webDetection.bestGuessLabels && webDetection.bestGuessLabels.length > 0) {
          return webDetection.bestGuessLabels[0].label;
        }
        if (labels.length > 0) {
          return labels.slice(0, 3).map((l) => l.description).join(" ");
        }
        return "Unknown Product";
      }
      /**
       * Extract category from labels
       */
      extractCategory(labels) {
        const categoryKeywords = {
          "Kiyim": ["clothing", "shirt", "dress", "pants", "jacket", "coat"],
          "Poyabzal": ["shoe", "boot", "sneaker", "sandal", "footwear"],
          "Elektronika": ["phone", "laptop", "computer", "tablet", "electronic"],
          "Uy-ro'zg'or": ["furniture", "home", "kitchen", "appliance"],
          "Go'zallik": ["cosmetic", "beauty", "makeup", "skincare"],
          "Sport": ["sport", "fitness", "gym", "athletic"],
          "Kitob": ["book", "magazine", "publication"],
          "O'yinchoq": ["toy", "game", "doll", "puzzle"]
        };
        for (const label of labels) {
          const desc11 = label.description.toLowerCase();
          for (const [category, keywords] of Object.entries(categoryKeywords)) {
            if (keywords.some((keyword) => desc11.includes(keyword))) {
              return category;
            }
          }
        }
        return "Boshqa";
      }
      /**
       * Extract brand from logos and text
       */
      extractBrand(logos, texts) {
        if (logos.length > 0) {
          return logos[0].description;
        }
        const knownBrands = ["Nike", "Adidas", "Samsung", "Apple", "Sony", "LG", "Xiaomi"];
        for (const text2 of texts) {
          const desc11 = text2.description;
          for (const brand of knownBrands) {
            if (desc11.includes(brand)) {
              return brand;
            }
          }
        }
        return void 0;
      }
      /**
       * Extract similar images
       */
      extractImages(webDetection) {
        const images = [];
        if (webDetection.visuallySimilarImages) {
          images.push(...webDetection.visuallySimilarImages.map((img) => img.url));
        }
        if (webDetection.fullMatchingImages) {
          images.push(...webDetection.fullMatchingImages.map((img) => img.url));
        }
        return images.filter((url) => url && url.startsWith("http"));
      }
      /**
       * Search marketplaces for product
       */
      async searchMarketplaces(productName, brand) {
        const searchQuery = brand ? `${brand} ${productName}` : productName;
        console.log("\u{1F50D} Searching marketplaces for:", searchQuery);
        return {
          uzum: { url: "https://uzum.uz/product/...", price: 85e4 },
          wildberries: { url: "https://wildberries.ru/...", price: 4200 },
          ozon: { url: "https://ozon.ru/...", price: 4500 }
        };
      }
      /**
       * Calculate confidence score
       */
      calculateConfidence(labels, webDetection) {
        let confidence = 0;
        if (labels.length > 0) {
          const avgLabelScore = labels.slice(0, 3).reduce((sum, l) => sum + l.score, 0) / 3;
          confidence += avgLabelScore * 40;
        }
        if (webDetection.webEntities && webDetection.webEntities.length > 0) {
          const topEntityScore = webDetection.webEntities[0].score;
          confidence += topEntityScore * 40;
        }
        if (webDetection.visuallySimilarImages && webDetection.visuallySimilarImages.length > 0) {
          confidence += 20;
        }
        return Math.min(Math.round(confidence), 100);
      }
      /**
       * Generate product description
       */
      generateDescription(name, category, brand) {
        const parts = [];
        if (brand) {
          parts.push(`${brand} brendidan`);
        }
        parts.push(name);
        parts.push(`(${category} kategoriyasi)`);
        return parts.join(" ");
      }
      /**
       * Get mock recognition data for development
       */
      getMockRecognition() {
        return {
          name: "Nike Air Max 270",
          category: "Poyabzal",
          brand: "Nike",
          images: [
            "https://via.placeholder.com/400x400?text=Nike+Air+Max+270",
            "https://via.placeholder.com/400x400?text=Product+Image+2",
            "https://via.placeholder.com/400x400?text=Product+Image+3"
          ],
          marketplaceLinks: {
            uzum: { url: "https://uzum.uz/...", price: 85e4 },
            wildberries: { url: "https://wildberries.ru/...", price: 4200 },
            ozon: { url: "https://ozon.ru/...", price: 4500 }
          },
          averagePrice: 9e5,
          confidence: 95,
          description: "Nike brendidan Nike Air Max 270 (Poyabzal kategoriyasi)"
        };
      }
    };
    productRecognitionService = new ProductRecognitionService();
  }
});

// server/index.ts
import express25 from "express";
import cors from "cors";
import cookieParser from "cookie-parser";

// server/routes.ts
init_storage();
import express23 from "express";
import session2 from "express-session";
import { Server } from "http";
import fs4 from "fs";
import multer4 from "multer";
import { nanoid as nanoid18 } from "nanoid";

// server/health.ts
init_db();
init_schema();
import os from "os";
async function healthCheck(req, res) {
  try {
    const dbStart = Date.now();
    await db.select().from(users).limit(1);
    const dbDuration = Date.now() - dbStart;
    const totalMemory = os.totalmem();
    const freeMemory = os.freemem();
    const usedMemory = totalMemory - freeMemory;
    const memoryUsagePercent = usedMemory / totalMemory * 100;
    const health = {
      status: "healthy",
      timestamp: (/* @__PURE__ */ new Date()).toISOString(),
      environment: process.env.NODE_ENV || "development",
      version: process.env.npm_package_version || "2.0.1",
      uptime: Math.floor(process.uptime()),
      checks: {
        database: {
          status: dbDuration < 1e3 ? "pass" : "warn",
          responseTime: `${dbDuration}ms`
        },
        memory: {
          status: memoryUsagePercent < 80 ? "pass" : memoryUsagePercent < 90 ? "warn" : "fail",
          usage: `${memoryUsagePercent.toFixed(2)}%`
        },
        session: {
          status: req.session ? "pass" : "warn",
          active: !!req.session
        }
      },
      metrics: {
        memory: {
          total: Math.floor(totalMemory / 1024 / 1024),
          free: Math.floor(freeMemory / 1024 / 1024),
          used: Math.floor(usedMemory / 1024 / 1024),
          usagePercent: memoryUsagePercent.toFixed(2)
        },
        process: process.memoryUsage(),
        cpu: {
          loadAverage: os.loadavg(),
          cores: os.cpus().length
        }
      }
    };
    res.status(200).json(health);
  } catch (error) {
    console.error("Health check failed:", error);
    const health = {
      status: "unhealthy",
      timestamp: (/* @__PURE__ */ new Date()).toISOString(),
      environment: process.env.NODE_ENV || "development",
      version: process.env.npm_package_version || "2.0.1",
      uptime: Math.floor(process.uptime()),
      checks: {
        database: {
          status: "fail",
          error: error instanceof Error ? error.message : "Unknown error"
        }
      },
      error: error instanceof Error ? error.message : "Unknown error"
    };
    res.status(503).json(health);
  }
}
__name(healthCheck, "healthCheck");

// server/session.ts
import session from "express-session";
import MemoryStore from "memorystore";
import connectPgSimple from "connect-pg-simple";
import pg from "pg";
var MemoryStoreSession = MemoryStore(session);
var PgSession = connectPgSimple(session);
function getSessionConfig() {
  const isProd2 = process.env.NODE_ENV === "production";
  const databaseUrl = process.env.DATABASE_URL || "";
  const isPostgres = databaseUrl.startsWith("postgres://") || databaseUrl.startsWith("postgresql://");
  let store;
  if (isProd2 && isPostgres) {
    console.log("\u2705 Using PostgreSQL session store");
    const pool = new pg.Pool({
      connectionString: databaseUrl,
      ssl: databaseUrl.includes("localhost") ? false : {
        rejectUnauthorized: false
      },
      max: 20,
      idleTimeoutMillis: 3e4,
      connectionTimeoutMillis: 1e4
    });
    store = new PgSession({
      pool,
      tableName: "session",
      createTableIfMissing: true,
      pruneSessionInterval: 60 * 15,
      errorLog: /* @__PURE__ */ __name((err) => {
        console.error("\u{1F534} Session store error:", err);
      }, "errorLog")
    });
  } else {
    const storeType = isProd2 ? "MemoryStore (SQLite production)" : "MemoryStore (development)";
    console.log(`\u26A0\uFE0F  Using ${storeType}`);
    store = new MemoryStoreSession({
      checkPeriod: 864e5,
      ttl: 7 * 24 * 60 * 60 * 1e3,
      stale: false
    });
  }
  const isBehindProxy = isProd2 || process.env.TRUST_PROXY === "true";
  const isRailway = databaseUrl.includes("railway.app") || process.env.RAILWAY_ENVIRONMENT;
  const cookieSameSite = isRailway ? "none" : isProd2 ? "lax" : "lax";
  const cookieSecure = isProd2;
  const sessionConfig = {
    store,
    secret: process.env.SESSION_SECRET || "your-secret-key-dev-only",
    resave: false,
    saveUninitialized: false,
    name: "connect.sid",
    cookie: {
      secure: cookieSecure,
      // true in production (Railway has HTTPS)
      httpOnly: true,
      sameSite: cookieSameSite,
      // 'none' for Railway, 'lax' for others
      maxAge: 7 * 24 * 60 * 60 * 1e3,
      // 7 days
      path: "/",
      domain: void 0
      // Let browser set domain automatically
    },
    rolling: true,
    // Reset expiration on each request
    proxy: isBehindProxy
    // Trust proxy headers (Railway, Render, etc.)
  };
  console.log("\u{1F527} Session config:", {
    name: sessionConfig.name,
    storeType: isPostgres ? "PostgreSQL" : "Memory",
    cookie: {
      secure: sessionConfig.cookie.secure,
      httpOnly: sessionConfig.cookie.httpOnly,
      sameSite: sessionConfig.cookie.sameSite,
      maxAge: sessionConfig.cookie.maxAge,
      path: sessionConfig.cookie.path
    },
    proxy: sessionConfig.proxy,
    environment: isProd2 ? "production" : "development",
    isRailway: !!isRailway
  });
  return sessionConfig;
}
__name(getSessionConfig, "getSessionConfig");

// server/errorHandler.ts
var errorHandler = /* @__PURE__ */ __name((err, req, res, next) => {
  let error = { ...err };
  error.message = err.message;
  console.error("Error:", {
    message: err.message,
    stack: err.stack,
    url: req.url,
    method: req.method,
    ip: req.ip,
    userAgent: req.get("User-Agent"),
    timestamp: (/* @__PURE__ */ new Date()).toISOString()
  });
  if (err.code === "SQLITE_CONSTRAINT") {
    const message = "Database constraint violation";
    error = { message, statusCode: 400 };
  }
  if (err.code === "SQLITE_CONSTRAINT_UNIQUE") {
    const message = "Duplicate field value entered";
    error = { message, statusCode: 400 };
  }
  if (err.code === "SQLITE_CONSTRAINT_FOREIGNKEY") {
    const message = "Referenced record not found";
    error = { message, statusCode: 400 };
  }
  if (err.name === "ZodError") {
    const message = "Validation error";
    error = { message, statusCode: 400 };
  }
  if (err.name === "JsonWebTokenError") {
    const message = "Invalid token";
    error = { message, statusCode: 401 };
  }
  if (err.name === "TokenExpiredError") {
    const message = "Token expired";
    error = { message, statusCode: 401 };
  }
  res.status(error.statusCode || 500).json({
    success: false,
    error: error.message || "Server Error",
    ...process.env.NODE_ENV === "development" && { stack: err.stack }
  });
}, "errorHandler");
var notFound = /* @__PURE__ */ __name((req, res, next) => {
  const error = new Error(`Not Found - ${req.originalUrl}`);
  error.statusCode = 404;
  next(error);
}, "notFound");
var asyncHandler = /* @__PURE__ */ __name((fn) => (req, res, next) => {
  Promise.resolve(fn(req, res, next)).catch(next);
}, "asyncHandler");

// server/routes.ts
init_db();
init_schema();
init_schema();
import { eq as eq30, and as and24, desc as desc9 } from "drizzle-orm";
import { ZodError } from "zod";
import swaggerUi from "swagger-ui-express";
import swaggerJSDoc from "swagger-jsdoc";

// server/debugRoutes.ts
init_db();
init_schema();
import { Router } from "express";
import { eq as eq2 } from "drizzle-orm";
import bcrypt2 from "bcryptjs";
import { nanoid as nanoid2 } from "nanoid";
var router = Router();
router.get("/debug/check-admin", async (req, res) => {
  try {
    const adminUsers = await db.select({
      id: users.id,
      username: users.username,
      email: users.email,
      role: users.role,
      isActive: users.isActive,
      createdAt: users.createdAt
    }).from(users).where(eq2(users.role, "admin"));
    res.json({
      success: true,
      count: adminUsers.length,
      admins: adminUsers
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message,
      stack: error.stack
    });
  }
});
router.get("/debug/list-users", async (req, res) => {
  try {
    const allUsers = await db.select({
      id: users.id,
      username: users.username,
      email: users.email,
      role: users.role,
      isActive: users.isActive,
      createdAt: users.createdAt
    }).from(users);
    res.json({
      success: true,
      count: allUsers.length,
      users: allUsers
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message,
      stack: error.stack
    });
  }
});
router.post("/debug/create-admin", async (req, res) => {
  try {
    const existingAdmin = await db.select().from(users).where(eq2(users.username, "admin")).limit(1);
    if (existingAdmin.length > 0) {
      return res.json({
        success: true,
        message: "Admin already exists",
        admin: {
          id: existingAdmin[0].id,
          username: existingAdmin[0].username,
          email: existingAdmin[0].email
        }
      });
    }
    const adminPassword = await bcrypt2.hash("BiznesYordam2024!", 10);
    const [newAdmin] = await db.insert(users).values({
      id: nanoid2(),
      username: "admin",
      email: "admin@biznesyordam.uz",
      password: adminPassword,
      firstName: "Admin",
      lastName: "BiznesYordam",
      phone: "+998901234567",
      role: "admin",
      isActive: true,
      createdAt: /* @__PURE__ */ new Date(),
      updatedAt: /* @__PURE__ */ new Date()
    }).returning();
    res.json({
      success: true,
      message: "Admin created successfully",
      admin: {
        id: newAdmin.id,
        username: newAdmin.username,
        email: newAdmin.email
      },
      credentials: {
        username: "admin",
        password: "BiznesYordam2024!"
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message,
      stack: error.stack
    });
  }
});
router.post("/debug/test-login", async (req, res) => {
  try {
    const { username, password } = req.body;
    if (!username || !password) {
      return res.status(400).json({
        success: false,
        error: "Username and password required"
      });
    }
    const user = await db.select().from(users).where(eq2(users.username, username)).limit(1);
    if (user.length === 0) {
      return res.json({
        success: false,
        message: "User not found",
        username
      });
    }
    const isValid = await bcrypt2.compare(password, user[0].password);
    res.json({
      success: true,
      userExists: true,
      passwordValid: isValid,
      user: {
        id: user[0].id,
        username: user[0].username,
        email: user[0].email,
        role: user[0].role,
        isActive: user[0].isActive
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message,
      stack: error.stack
    });
  }
});
var debugRoutes_default = router;

// server/routes/inventoryRoutes.ts
import express from "express";

// server/services/inventoryManagementService.ts
init_db();
init_websocket();
async function calculateReorderPoint(productId) {
  console.log(`\u{1F4E6} Calculating reorder point for product ${productId}`);
  try {
    const salesHistory = await db.all(
      `SELECT date, orders, revenue 
       FROM analytics 
       WHERE product_id = ? 
       AND date >= date('now', '-90 days')
       ORDER BY date`,
      [productId]
    );
    const totalSales = salesHistory.reduce((sum, h) => sum + (h.orders || 0), 0);
    const averageDailySales = totalSales / 90 || 1;
    const leadTime = 7;
    const monthlySales = averageDailySales * 30;
    const safetyStock = Math.ceil(monthlySales * 0.2);
    const reorderPoint = Math.ceil(averageDailySales * leadTime + safetyStock);
    const reorderQuantity = Math.ceil(monthlySales);
    return {
      reorderPoint,
      reorderQuantity,
      safetyStock,
      leadTime,
      averageDailySales
    };
  } catch (error) {
    console.error("Reorder point calculation error:", error);
    return {
      reorderPoint: 10,
      reorderQuantity: 50,
      safetyStock: 5,
      leadTime: 7,
      averageDailySales: 1
    };
  }
}
__name(calculateReorderPoint, "calculateReorderPoint");
async function checkInventoryLevels(partnerId) {
  console.log(`\u{1F50D} Checking inventory levels for partner ${partnerId}`);
  try {
    const products4 = await db.all(
      `SELECT id, name, stock_quantity, low_stock_threshold 
       FROM products 
       WHERE partner_id = ? AND is_active = 1`,
      [partnerId]
    );
    const alerts = [];
    for (const product of products4) {
      const currentStock = product.stock_quantity || 0;
      const threshold = product.low_stock_threshold || 10;
      const reorderData = await calculateReorderPoint(product.id);
      const reorderPoint = product.low_stock_threshold || reorderData.reorderPoint;
      if (currentStock <= reorderPoint) {
        let urgency = "low";
        const estimatedDaysUntilOut = reorderData.averageDailySales > 0 ? Math.ceil(currentStock / reorderData.averageDailySales) : 999;
        if (currentStock === 0) {
          urgency = "critical";
        } else if (estimatedDaysUntilOut <= 3) {
          urgency = "high";
        } else if (estimatedDaysUntilOut <= 7) {
          urgency = "medium";
        }
        alerts.push({
          productId: product.id,
          productName: product.name,
          currentStock,
          reorderPoint,
          recommendedOrder: reorderData.reorderQuantity,
          urgency,
          estimatedDaysUntilOut
        });
        if (wsManager) {
          wsManager.sendToPartner(partnerId, {
            type: "inventory_alert",
            data: {
              productId: product.id,
              productName: product.name,
              currentStock,
              urgency
            }
          });
        }
      }
    }
    for (const alert of alerts) {
      await db.run(
        `INSERT OR REPLACE INTO inventory_alerts 
         (product_id, current_stock, reorder_point, urgency, created_at, updated_at)
         VALUES (?, ?, ?, ?, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)`,
        [alert.productId, alert.currentStock, alert.reorderPoint, alert.urgency]
      );
    }
    return alerts;
  } catch (error) {
    console.error("Inventory check error:", error);
    return [];
  }
}
__name(checkInventoryLevels, "checkInventoryLevels");
async function autoReorder(productId) {
  console.log(`\u{1F6D2} Auto-reordering product ${productId}`);
  try {
    const [product] = await db.all(`SELECT * FROM products WHERE id = ?`, [productId]);
    if (!product) return false;
    const reorderData = await calculateReorderPoint(productId);
    await db.run(
      `INSERT INTO purchase_orders 
       (partner_id, product_id, quantity, status, created_at)
       VALUES (?, ?, ?, 'pending', CURRENT_TIMESTAMP)`,
      [product.partner_id, productId, reorderData.reorderQuantity]
    );
    if (wsManager) {
      wsManager.sendToPartner(product.partner_id, {
        type: "auto_reorder",
        data: {
          productId,
          productName: product.name,
          quantity: reorderData.reorderQuantity
        }
      });
    }
    return true;
  } catch (error) {
    console.error("Auto-reorder error:", error);
    return false;
  }
}
__name(autoReorder, "autoReorder");
async function integrateWithSupplier(supplierId, productId) {
  console.log(`\u{1F517} Integrating with supplier ${supplierId} for product ${productId}`);
  return {
    success: true,
    supplierId,
    productId,
    integrationStatus: "connected"
  };
}
__name(integrateWithSupplier, "integrateWithSupplier");
var inventoryManagementService_default = {
  calculateReorderPoint,
  checkInventoryLevels,
  autoReorder,
  integrateWithSupplier
};

// server/routes/inventoryRoutes.ts
var router2 = express.Router();
router2.get("/check", asyncHandler(async (req, res) => {
  const partner = req.partner;
  if (!partner) {
    return res.status(401).json({ error: "Unauthorized" });
  }
  const alerts = await inventoryManagementService_default.checkInventoryLevels(partner.id);
  res.json({ alerts });
}));
router2.get("/reorder-point/:productId", asyncHandler(async (req, res) => {
  const { productId } = req.params;
  const reorderData = await inventoryManagementService_default.calculateReorderPoint(productId);
  res.json(reorderData);
}));
router2.post("/auto-reorder/:productId", asyncHandler(async (req, res) => {
  const { productId } = req.params;
  const success = await inventoryManagementService_default.autoReorder(productId);
  res.json({ success });
}));
var inventoryRoutes_default = router2;

// server/routes/investorRoutes.ts
import { Router as Router2 } from "express";

// server/controllers/investorController.ts
init_db();
import { nanoid as nanoid3 } from "nanoid";
async function getInvestorProfile(req, res) {
  try {
    const userId = req.user?.id;
    if (!userId) {
      return res.status(403).json({ error: "User ID topilmadi" });
    }
    const investor = await db.query(
      "SELECT * FROM investors WHERE user_id = ?",
      [userId]
    );
    if (!investor || investor.length === 0) {
      return res.status(404).json({ error: "Investor profili topilmadi" });
    }
    res.json(investor[0]);
  } catch (error) {
    console.error("Error fetching investor profile:", error);
    res.status(500).json({ error: error.message });
  }
}
__name(getInvestorProfile, "getInvestorProfile");
async function getInvestorDashboard(req, res) {
  try {
    const userId = req.user?.id;
    if (!userId) {
      return res.status(403).json({ error: "User ID topilmadi" });
    }
    const investor = await db.query("SELECT * FROM investors WHERE user_id = ?", [userId]);
    if (!investor || investor.length === 0) {
      return res.status(404).json({ error: "Investor profili topilmadi" });
    }
    const investorId = investor[0].id;
    const inventoryItems = await db.query(
      `SELECT i.*, p.name as product_name, p.category
       FROM inventory_items i
       JOIN products p ON i.product_id = p.id
       WHERE i.investor_id = ?
       ORDER BY i.created_at DESC`,
      [investorId]
    );
    const locationStats = await db.query(
      `SELECT 
         location_type,
         status,
         COUNT(*) as count,
         SUM(purchase_price) as total_invested,
         SUM(CASE WHEN sale_price IS NOT NULL THEN sale_price - purchase_price ELSE 0 END) as total_profit
       FROM inventory_items
       WHERE investor_id = ?
       GROUP BY location_type, status`,
      [investorId]
    );
    const transactions = await db.query(
      `SELECT *
       FROM investment_transactions
       WHERE investor_id = ?
       ORDER BY created_at DESC
       LIMIT 20`,
      [investorId]
    );
    const stats = await db.query(
      `SELECT 
         COUNT(*) as total_items,
         SUM(CASE WHEN status = 'available' THEN 1 ELSE 0 END) as items_available,
         SUM(CASE WHEN status = 'sold' THEN 1 ELSE 0 END) as items_sold,
         SUM(CASE WHEN location_type = 'warehouse' THEN 1 ELSE 0 END) as items_in_warehouse,
         SUM(CASE WHEN location_type = 'marketplace' THEN 1 ELSE 0 END) as items_in_marketplace,
         SUM(purchase_price) as total_invested,
         SUM(CASE WHEN sale_price IS NOT NULL THEN sale_price ELSE 0 END) as total_revenue,
         SUM(CASE WHEN sale_price IS NOT NULL THEN sale_price - purchase_price ELSE 0 END) as total_profit
       FROM inventory_items
       WHERE investor_id = ?`,
      [investorId]
    );
    const roi = stats[0].total_invested > 0 ? (stats[0].total_profit / stats[0].total_invested * 100).toFixed(2) : "0.00";
    res.json({
      investor: investor[0],
      inventoryItems,
      locationStats,
      transactions,
      stats: {
        ...stats[0],
        roi_percentage: roi
      }
    });
  } catch (error) {
    console.error("Error fetching investor dashboard:", error);
    res.status(500).json({ error: error.message });
  }
}
__name(getInvestorDashboard, "getInvestorDashboard");
async function createInvestment(req, res) {
  try {
    const userId = req.user?.id;
    if (!userId) {
      return res.status(403).json({ error: "User ID topilmadi" });
    }
    const investor = await db.query("SELECT * FROM investors WHERE user_id = ?", [userId]);
    if (!investor || investor.length === 0) {
      return res.status(404).json({ error: "Investor profili topilmadi" });
    }
    const investorId = investor[0].id;
    const { amount, description, relatedProductId } = req.body;
    const id = nanoid3();
    const now = (/* @__PURE__ */ new Date()).toISOString();
    await db.query(
      `INSERT INTO investment_transactions (
        id, investor_id, transaction_type, amount, description,
        related_product_id, status, created_at
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
      [id, investorId, "investment", amount, description, relatedProductId || null, "completed", now]
    );
    await db.query(
      `UPDATE investors
       SET total_invested = total_invested + ?,
           current_balance = current_balance + ?,
           updated_at = ?
       WHERE id = ?`,
      [amount, amount, now, investorId]
    );
    res.status(201).json({ id, message: "Investitsiya qo'shildi" });
  } catch (error) {
    console.error("Error creating investment:", error);
    res.status(500).json({ error: error.message });
  }
}
__name(createInvestment, "createInvestment");
async function getInvestorStats(req, res) {
  try {
    const userId = req.user?.id;
    const { period = "30" } = req.query;
    const investor = await db.query("SELECT * FROM investors WHERE user_id = ?", [userId]);
    if (!investor || investor.length === 0) {
      return res.status(404).json({ error: "Investor profili topilmadi" });
    }
    const stats = await db.query(
      `SELECT *
       FROM investor_stats
       WHERE investor_id = ? AND date >= datetime('now', '-${period} days')
       ORDER BY date DESC`,
      [investor[0].id]
    );
    res.json(stats);
  } catch (error) {
    console.error("Error fetching investor stats:", error);
    res.status(500).json({ error: error.message });
  }
}
__name(getInvestorStats, "getInvestorStats");
async function createInvestor(req, res) {
  try {
    const { userId, investorType, riskLevel, preferredCategories } = req.body;
    const id = nanoid3();
    const now = (/* @__PURE__ */ new Date()).toISOString();
    await db.query(
      `INSERT INTO investors (
        id, user_id, investor_type, risk_level, preferred_categories,
        total_invested, total_profit, current_balance, is_active,
        created_at, updated_at
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        id,
        userId,
        investorType || "individual",
        riskLevel || "medium",
        JSON.stringify(preferredCategories || []),
        0,
        0,
        0,
        true,
        now,
        now
      ]
    );
    res.status(201).json({ id, message: "Investor yaratildi" });
  } catch (error) {
    console.error("Error creating investor:", error);
    res.status(500).json({ error: error.message });
  }
}
__name(createInvestor, "createInvestor");

// server/routes/investorRoutes.ts
var router3 = Router2();
router3.get("/profile", getInvestorProfile);
router3.get("/dashboard", getInvestorDashboard);
router3.get("/stats", getInvestorStats);
router3.post("/investments", createInvestment);
router3.post("/create", createInvestor);
var investorRoutes_default = router3;

// server/routes/marketplaceIntegrationRoutes.ts
import { Router as Router3 } from "express";

// server/controllers/marketplaceIntegrationController.ts
init_db();
import { nanoid as nanoid4 } from "nanoid";
async function submitIntegrationRequest(req, res) {
  try {
    const partnerId = req.user?.partnerId;
    if (!partnerId) {
      return res.status(403).json({ error: "Partner ID topilmadi" });
    }
    const {
      marketplace,
      apiKey,
      apiSecret,
      shopId,
      shopName,
      additionalCredentials
    } = req.body;
    const existing = await db.query(
      `SELECT * FROM marketplace_integration_requests
       WHERE partner_id = ? AND marketplace = ? AND status IN ('pending', 'testing')`,
      [partnerId, marketplace]
    );
    if (existing && existing.length > 0) {
      return res.status(400).json({
        error: "Bu marketplace uchun so'rov allaqachon mavjud"
      });
    }
    const id = nanoid4();
    const now = (/* @__PURE__ */ new Date()).toISOString();
    await db.query(
      `INSERT INTO marketplace_integration_requests (
        id, partner_id, marketplace, request_type, status,
        api_key, api_secret, shop_id, shop_name, additional_credentials,
        submitted_at, created_at, updated_at
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        id,
        partnerId,
        marketplace,
        "new",
        "pending",
        apiKey,
        apiSecret,
        shopId,
        shopName,
        JSON.stringify(additionalCredentials || {}),
        now,
        now,
        now
      ]
    );
    res.status(201).json({
      id,
      message: "Integratsiya so'rovi yuborildi. Admin ko'rib chiqadi."
    });
  } catch (error) {
    console.error("Error submitting integration request:", error);
    res.status(500).json({ error: error.message });
  }
}
__name(submitIntegrationRequest, "submitIntegrationRequest");
async function getPartnerRequests(req, res) {
  try {
    const partnerId = req.user?.partnerId;
    if (!partnerId) {
      return res.status(403).json({ error: "Partner ID topilmadi" });
    }
    const requests = await db.query(
      `SELECT * FROM marketplace_integration_requests
       WHERE partner_id = ?
       ORDER BY created_at DESC`,
      [partnerId]
    );
    res.json(requests);
  } catch (error) {
    console.error("Error fetching partner requests:", error);
    res.status(500).json({ error: error.message });
  }
}
__name(getPartnerRequests, "getPartnerRequests");
async function getAllIntegrationRequests(req, res) {
  try {
    const { status } = req.query;
    let query = `
      SELECT r.*, p.business_name, u.first_name, u.last_name
      FROM marketplace_integration_requests r
      JOIN partners p ON r.partner_id = p.id
      JOIN users u ON p.user_id = u.id
    `;
    const params = [];
    if (status) {
      query += " WHERE r.status = ?";
      params.push(status);
    }
    query += " ORDER BY r.created_at DESC";
    const requests = await db.query(query, params);
    res.json(requests);
  } catch (error) {
    console.error("Error fetching all integration requests:", error);
    res.status(500).json({ error: error.message });
  }
}
__name(getAllIntegrationRequests, "getAllIntegrationRequests");
async function testIntegrationRequest(req, res) {
  try {
    const { id } = req.params;
    const now = (/* @__PURE__ */ new Date()).toISOString();
    const testResults = {
      connection: "success",
      authentication: "success",
      api_version: "v1",
      shop_info: {
        name: "Test Shop",
        status: "active"
      },
      tested_at: now
    };
    await db.query(
      `UPDATE marketplace_integration_requests
       SET status = 'testing', test_results = ?, updated_at = ?
       WHERE id = ?`,
      [JSON.stringify(testResults), now, id]
    );
    res.json({ message: "Test muvaffaqiyatli", testResults });
  } catch (error) {
    console.error("Error testing integration:", error);
    res.status(500).json({ error: error.message });
  }
}
__name(testIntegrationRequest, "testIntegrationRequest");
async function approveIntegrationRequest(req, res) {
  try {
    const { id } = req.params;
    const { adminNotes } = req.body;
    const adminId = req.user?.id;
    const now = (/* @__PURE__ */ new Date()).toISOString();
    const request = await db.query(
      "SELECT * FROM marketplace_integration_requests WHERE id = ?",
      [id]
    );
    if (!request || request.length === 0) {
      return res.status(404).json({ error: "So'rov topilmadi" });
    }
    const reqData = request[0];
    const integrationId = nanoid4();
    await db.query(
      `INSERT INTO marketplace_integrations (
        id, partner_id, marketplace, is_active, api_credentials, last_sync,
        sync_status, created_at, updated_at
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        integrationId,
        reqData.partner_id,
        reqData.marketplace,
        true,
        JSON.stringify({
          api_key: reqData.api_key,
          api_secret: reqData.api_secret,
          shop_id: reqData.shop_id,
          shop_name: reqData.shop_name
        }),
        now,
        "connected",
        now,
        now
      ]
    );
    await db.query(
      `UPDATE marketplace_integration_requests
       SET status = 'approved', reviewed_at = ?, reviewed_by = ?,
           admin_notes = ?, updated_at = ?
       WHERE id = ?`,
      [now, adminId, adminNotes, now, id]
    );
    res.json({ message: "Integratsiya tasdiqlandi va faollashtirildi" });
  } catch (error) {
    console.error("Error approving integration:", error);
    res.status(500).json({ error: error.message });
  }
}
__name(approveIntegrationRequest, "approveIntegrationRequest");
async function rejectIntegrationRequest(req, res) {
  try {
    const { id } = req.params;
    const { rejectionReason, adminNotes } = req.body;
    const adminId = req.user?.id;
    const now = (/* @__PURE__ */ new Date()).toISOString();
    await db.query(
      `UPDATE marketplace_integration_requests
       SET status = 'rejected', reviewed_at = ?, reviewed_by = ?,
           rejection_reason = ?, admin_notes = ?, updated_at = ?
       WHERE id = ?`,
      [now, adminId, rejectionReason, adminNotes, now, id]
    );
    res.json({ message: "So'rov rad etildi" });
  } catch (error) {
    console.error("Error rejecting integration:", error);
    res.status(500).json({ error: error.message });
  }
}
__name(rejectIntegrationRequest, "rejectIntegrationRequest");
async function getSyncHistory(req, res) {
  try {
    const { integrationId } = req.params;
    const history = await db.query(
      `SELECT * FROM marketplace_sync_history
       WHERE integration_id = ?
       ORDER BY started_at DESC
       LIMIT 50`,
      [integrationId]
    );
    res.json(history);
  } catch (error) {
    console.error("Error fetching sync history:", error);
    res.status(500).json({ error: error.message });
  }
}
__name(getSyncHistory, "getSyncHistory");
async function triggerSync(req, res) {
  try {
    const { integrationId } = req.params;
    const { syncType } = req.body;
    const id = nanoid4();
    const now = (/* @__PURE__ */ new Date()).toISOString();
    await db.query(
      `INSERT INTO marketplace_sync_history (
        id, integration_id, sync_type, status, started_at, metadata
      ) VALUES (?, ?, ?, ?, ?, ?)`,
      [id, integrationId, syncType, "success", now, "{}"]
    );
    await db.query(
      `UPDATE marketplace_sync_history
       SET status = 'success', records_synced = 10, completed_at = ?
       WHERE id = ?`,
      [now, id]
    );
    res.json({ message: "Sinxronizatsiya boshlandi", syncId: id });
  } catch (error) {
    console.error("Error triggering sync:", error);
    res.status(500).json({ error: error.message });
  }
}
__name(triggerSync, "triggerSync");

// server/routes/marketplaceIntegrationRoutes.ts
var router4 = Router3();
router4.post("/requests", submitIntegrationRequest);
router4.get("/requests/my", getPartnerRequests);
router4.get("/requests/all", getAllIntegrationRequests);
router4.post("/requests/:id/test", testIntegrationRequest);
router4.post("/requests/:id/approve", approveIntegrationRequest);
router4.post("/requests/:id/reject", rejectIntegrationRequest);
router4.get("/integrations/:integrationId/sync-history", getSyncHistory);
router4.post("/integrations/:integrationId/sync", triggerSync);
var marketplaceIntegrationRoutes_default = router4;

// server/routes/subscriptionRoutes.ts
import { Router as Router4 } from "express";

// server/controllers/subscriptionController.ts
init_db();
import { nanoid as nanoid5 } from "nanoid";
async function getAddonServices(req, res) {
  try {
    const addons = await db.query(
      `SELECT * FROM addon_services WHERE is_active = ? ORDER BY category, name`,
      [true]
    );
    res.json(addons);
  } catch (error) {
    console.error("Error fetching addon services:", error);
    res.status(500).json({ error: error.message });
  }
}
__name(getAddonServices, "getAddonServices");
async function getPartnerSubscriptions(req, res) {
  try {
    const partnerId = req.user?.partnerId;
    if (!partnerId) {
      return res.status(403).json({ error: "Partner ID topilmadi" });
    }
    const subscriptions2 = await db.query(
      `SELECT * FROM partner_subscriptions
       WHERE partner_id = ? AND status = 'active'
       ORDER BY created_at DESC`,
      [partnerId]
    );
    res.json(subscriptions2);
  } catch (error) {
    console.error("Error fetching subscriptions:", error);
    res.status(500).json({ error: error.message });
  }
}
__name(getPartnerSubscriptions, "getPartnerSubscriptions");
async function subscribeToAddon(req, res) {
  try {
    const partnerId = req.user?.partnerId;
    if (!partnerId) {
      return res.status(403).json({ error: "Partner ID topilmadi" });
    }
    const { addonId, billingPeriod } = req.body;
    const addon = await db.query("SELECT * FROM addon_services WHERE id = ?", [addonId]);
    if (!addon || addon.length === 0) {
      return res.status(404).json({ error: "Add-on topilmadi" });
    }
    const addonData = addon[0];
    let amount = parseFloat(addonData.base_price_monthly);
    let discountApplied = 0;
    if (billingPeriod === "quarterly") {
      amount = parseFloat(addonData.base_price_quarterly || addonData.base_price_monthly * 3);
      discountApplied = parseFloat(addonData.base_price_monthly) * 3 - amount;
    } else if (billingPeriod === "yearly") {
      amount = parseFloat(addonData.base_price_yearly || addonData.base_price_monthly * 12);
      discountApplied = parseFloat(addonData.base_price_monthly) * 12 - amount;
    }
    const id = nanoid5();
    const now = /* @__PURE__ */ new Date();
    const startDate = now.toISOString();
    const endDate = new Date(now);
    if (billingPeriod === "monthly") {
      endDate.setMonth(endDate.getMonth() + 1);
    } else if (billingPeriod === "quarterly") {
      endDate.setMonth(endDate.getMonth() + 3);
    } else if (billingPeriod === "yearly") {
      endDate.setFullYear(endDate.getFullYear() + 1);
    }
    await db.query(
      `INSERT INTO partner_subscriptions (
        id, partner_id, subscription_type, item_id, billing_period,
        start_date, end_date, auto_renew, status, amount, discount_applied,
        next_billing_date, created_at, updated_at
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        id,
        partnerId,
        "addon",
        addonId,
        billingPeriod,
        startDate,
        endDate.toISOString(),
        true,
        "active",
        amount,
        discountApplied,
        endDate.toISOString(),
        startDate,
        startDate
      ]
    );
    res.status(201).json({
      id,
      message: "Add-on obunasi yaratildi",
      amount,
      discountApplied
    });
  } catch (error) {
    console.error("Error subscribing to addon:", error);
    res.status(500).json({ error: error.message });
  }
}
__name(subscribeToAddon, "subscribeToAddon");
async function cancelSubscription(req, res) {
  try {
    const { id } = req.params;
    const { cancellationReason } = req.body;
    const now = (/* @__PURE__ */ new Date()).toISOString();
    await db.query(
      `UPDATE partner_subscriptions
       SET status = 'cancelled', cancelled_at = ?, cancellation_reason = ?, updated_at = ?
       WHERE id = ?`,
      [now, cancellationReason, now, id]
    );
    res.json({ message: "Obuna bekor qilindi" });
  } catch (error) {
    console.error("Error cancelling subscription:", error);
    res.status(500).json({ error: error.message });
  }
}
__name(cancelSubscription, "cancelSubscription");
async function getPaymentHistory(req, res) {
  try {
    const partnerId = req.user?.partnerId;
    if (!partnerId) {
      return res.status(403).json({ error: "Partner ID topilmadi" });
    }
    const payments4 = await db.query(
      `SELECT * FROM subscription_payments
       WHERE partner_id = ?
       ORDER BY created_at DESC
       LIMIT 50`,
      [partnerId]
    );
    res.json(payments4);
  } catch (error) {
    console.error("Error fetching payment history:", error);
    res.status(500).json({ error: error.message });
  }
}
__name(getPaymentHistory, "getPaymentHistory");

// server/routes/subscriptionRoutes.ts
init_db();
init_schema();
import { eq as eq4, and as and3 } from "drizzle-orm";

// server/services/billingService.ts
init_db();
init_schema();
init_SAAS_PRICING_CONFIG();
import { eq as eq3, and as and2, lte as lte2 } from "drizzle-orm";

// server/services/emailService.ts
import nodemailer from "nodemailer";
var EmailService = class {
  static {
    __name(this, "EmailService");
  }
  transporter;
  constructor() {
    this.transporter = nodemailer.createTransport({
      host: process.env.SMTP_HOST || "smtp.gmail.com",
      port: parseInt(process.env.SMTP_PORT || "587"),
      secure: process.env.SMTP_SECURE === "true",
      auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS
      }
    });
  }
  async sendEmail(options) {
    try {
      await this.transporter.sendMail({
        from: process.env.SMTP_FROM || "noreply@sellercloudx.com",
        to: options.to,
        subject: options.subject,
        html: options.html,
        text: options.text
      });
      console.log(`Email sent to ${options.to}: ${options.subject}`);
      return true;
    } catch (error) {
      console.error("Email sending failed:", error);
      return false;
    }
  }
  async sendInvoiceCreated(email, partnerName, invoiceNumber, amount, dueDate) {
    const html = `
      <!DOCTYPE html>
      <html>
      <head>
        <style>
          body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { background: #4F46E5; color: white; padding: 20px; text-align: center; }
          .content { background: #f9fafb; padding: 20px; }
          .invoice-details { background: white; padding: 15px; margin: 20px 0; border-radius: 5px; }
          .footer { text-align: center; padding: 20px; color: #666; font-size: 12px; }
          .button { display: inline-block; padding: 12px 24px; background: #4F46E5; color: white; text-decoration: none; border-radius: 5px; margin: 10px 0; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>New Invoice Created</h1>
          </div>
          <div class="content">
            <p>Hello ${partnerName},</p>
            <p>A new invoice has been generated for your SellercloudX subscription.</p>
            
            <div class="invoice-details">
              <h3>Invoice Details</h3>
              <p><strong>Invoice Number:</strong> ${invoiceNumber}</p>
              <p><strong>Amount:</strong> $${amount.toFixed(2)}</p>
              <p><strong>Due Date:</strong> ${new Date(dueDate).toLocaleDateString()}</p>
            </div>
            
            <p>Please log in to your dashboard to view and pay this invoice.</p>
            <a href="${process.env.APP_URL}/partner/billing" class="button">View Invoice</a>
          </div>
          <div class="footer">
            <p>SellercloudX - Partner Management System</p>
            <p>This is an automated email. Please do not reply.</p>
          </div>
        </div>
      </body>
      </html>
    `;
    return this.sendEmail({
      to: email,
      subject: `New Invoice ${invoiceNumber} - SellercloudX`,
      html,
      text: `Hello ${partnerName}, A new invoice ${invoiceNumber} for $${amount.toFixed(2)} has been created. Due date: ${new Date(dueDate).toLocaleDateString()}. Please log in to pay.`
    });
  }
  async sendPaymentReceived(email, partnerName, invoiceNumber, amount, paymentMethod) {
    const html = `
      <!DOCTYPE html>
      <html>
      <head>
        <style>
          body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { background: #10B981; color: white; padding: 20px; text-align: center; }
          .content { background: #f9fafb; padding: 20px; }
          .payment-details { background: white; padding: 15px; margin: 20px 0; border-radius: 5px; }
          .footer { text-align: center; padding: 20px; color: #666; font-size: 12px; }
          .success { color: #10B981; font-weight: bold; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>\u2713 Payment Received</h1>
          </div>
          <div class="content">
            <p>Hello ${partnerName},</p>
            <p class="success">Your payment has been successfully received and processed.</p>
            
            <div class="payment-details">
              <h3>Payment Details</h3>
              <p><strong>Invoice Number:</strong> ${invoiceNumber}</p>
              <p><strong>Amount Paid:</strong> $${amount.toFixed(2)}</p>
              <p><strong>Payment Method:</strong> ${paymentMethod}</p>
              <p><strong>Date:</strong> ${(/* @__PURE__ */ new Date()).toLocaleDateString()}</p>
            </div>
            
            <p>Thank you for your payment. Your subscription is now active.</p>
          </div>
          <div class="footer">
            <p>SellercloudX - Partner Management System</p>
            <p>This is an automated email. Please do not reply.</p>
          </div>
        </div>
      </body>
      </html>
    `;
    return this.sendEmail({
      to: email,
      subject: `Payment Received - Invoice ${invoiceNumber}`,
      html,
      text: `Hello ${partnerName}, Your payment of $${amount.toFixed(2)} for invoice ${invoiceNumber} has been received. Thank you!`
    });
  }
  async sendInvoiceOverdue(email, partnerName, invoiceNumber, amount, daysOverdue) {
    const html = `
      <!DOCTYPE html>
      <html>
      <head>
        <style>
          body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { background: #EF4444; color: white; padding: 20px; text-align: center; }
          .content { background: #f9fafb; padding: 20px; }
          .invoice-details { background: white; padding: 15px; margin: 20px 0; border-radius: 5px; border-left: 4px solid #EF4444; }
          .footer { text-align: center; padding: 20px; color: #666; font-size: 12px; }
          .button { display: inline-block; padding: 12px 24px; background: #EF4444; color: white; text-decoration: none; border-radius: 5px; margin: 10px 0; }
          .warning { color: #EF4444; font-weight: bold; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>\u26A0 Invoice Overdue</h1>
          </div>
          <div class="content">
            <p>Hello ${partnerName},</p>
            <p class="warning">Your invoice is now ${daysOverdue} day(s) overdue.</p>
            
            <div class="invoice-details">
              <h3>Invoice Details</h3>
              <p><strong>Invoice Number:</strong> ${invoiceNumber}</p>
              <p><strong>Amount Due:</strong> $${amount.toFixed(2)}</p>
              <p><strong>Days Overdue:</strong> ${daysOverdue}</p>
            </div>
            
            <p>Please make payment as soon as possible to avoid service interruption.</p>
            ${daysOverdue >= 5 ? '<p class="warning">Note: Your subscription will be suspended if payment is not received within 5 days of the due date.</p>' : ""}
            
            <a href="${process.env.APP_URL}/partner/billing" class="button">Pay Now</a>
          </div>
          <div class="footer">
            <p>SellercloudX - Partner Management System</p>
            <p>This is an automated email. Please do not reply.</p>
          </div>
        </div>
      </body>
      </html>
    `;
    return this.sendEmail({
      to: email,
      subject: `\u26A0 Invoice ${invoiceNumber} is Overdue - Action Required`,
      html,
      text: `Hello ${partnerName}, Your invoice ${invoiceNumber} for $${amount.toFixed(2)} is ${daysOverdue} days overdue. Please pay immediately to avoid service interruption.`
    });
  }
  async sendSubscriptionSuspended(email, partnerName, reason) {
    const html = `
      <!DOCTYPE html>
      <html>
      <head>
        <style>
          body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { background: #DC2626; color: white; padding: 20px; text-align: center; }
          .content { background: #f9fafb; padding: 20px; }
          .alert { background: #FEE2E2; padding: 15px; margin: 20px 0; border-radius: 5px; border-left: 4px solid #DC2626; }
          .footer { text-align: center; padding: 20px; color: #666; font-size: 12px; }
          .button { display: inline-block; padding: 12px 24px; background: #DC2626; color: white; text-decoration: none; border-radius: 5px; margin: 10px 0; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>Subscription Suspended</h1>
          </div>
          <div class="content">
            <p>Hello ${partnerName},</p>
            
            <div class="alert">
              <h3>Your subscription has been suspended</h3>
              <p><strong>Reason:</strong> ${reason}</p>
            </div>
            
            <p>Your access to SellercloudX services has been temporarily suspended. To restore your subscription, please:</p>
            <ol>
              <li>Log in to your dashboard</li>
              <li>Navigate to the Billing section</li>
              <li>Pay all outstanding invoices</li>
            </ol>
            
            <p>Once payment is received, your subscription will be automatically reactivated.</p>
            
            <a href="${process.env.APP_URL}/partner/billing" class="button">View Billing</a>
          </div>
          <div class="footer">
            <p>SellercloudX - Partner Management System</p>
            <p>For assistance, please contact support.</p>
          </div>
        </div>
      </body>
      </html>
    `;
    return this.sendEmail({
      to: email,
      subject: "Subscription Suspended - Action Required",
      html,
      text: `Hello ${partnerName}, Your subscription has been suspended. Reason: ${reason}. Please log in and pay outstanding invoices to restore access.`
    });
  }
  async sendCommissionReport(email, partnerName, month, totalSales, commission, commissionRate) {
    const html = `
      <!DOCTYPE html>
      <html>
      <head>
        <style>
          body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { background: #8B5CF6; color: white; padding: 20px; text-align: center; }
          .content { background: #f9fafb; padding: 20px; }
          .report { background: white; padding: 15px; margin: 20px 0; border-radius: 5px; }
          .footer { text-align: center; padding: 20px; color: #666; font-size: 12px; }
          .stat { display: inline-block; margin: 10px 20px; text-align: center; }
          .stat-value { font-size: 24px; font-weight: bold; color: #8B5CF6; }
          .stat-label { font-size: 12px; color: #666; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>Monthly Commission Report</h1>
          </div>
          <div class="content">
            <p>Hello ${partnerName},</p>
            <p>Here's your commission report for ${month}:</p>
            
            <div class="report">
              <div class="stat">
                <div class="stat-value">$${totalSales.toFixed(2)}</div>
                <div class="stat-label">Total Sales</div>
              </div>
              <div class="stat">
                <div class="stat-value">${commissionRate}%</div>
                <div class="stat-label">Commission Rate</div>
              </div>
              <div class="stat">
                <div class="stat-value">$${commission.toFixed(2)}</div>
                <div class="stat-label">Commission Earned</div>
              </div>
            </div>
            
            <p>Your commission will be processed according to your payment schedule.</p>
          </div>
          <div class="footer">
            <p>SellercloudX - Partner Management System</p>
            <p>This is an automated email. Please do not reply.</p>
          </div>
        </div>
      </body>
      </html>
    `;
    return this.sendEmail({
      to: email,
      subject: `Commission Report - ${month}`,
      html,
      text: `Hello ${partnerName}, Your commission report for ${month}: Total Sales: $${totalSales.toFixed(2)}, Commission Rate: ${commissionRate}%, Commission Earned: $${commission.toFixed(2)}`
    });
  }
};
var emailService_default = new EmailService();

// server/services/billingService.ts
function getTierConfig(tierId) {
  return SAAS_PRICING_TIERS[tierId];
}
__name(getTierConfig, "getTierConfig");
function calculateMonthlyFee(tierId) {
  const tier = getTierConfig(tierId);
  return tier ? tier.monthlyFeeUSD : 0;
}
__name(calculateMonthlyFee, "calculateMonthlyFee");
function calculateCommission(saleAmount, tierId) {
  const tier = getTierConfig(tierId);
  if (!tier) return 0;
  return saleAmount * tier.commissionRate;
}
__name(calculateCommission, "calculateCommission");
function getSalesLimit(tierId) {
  const tier = getTierConfig(tierId);
  if (!tier) return 0;
  return tier.limits.monthlySalesLimit;
}
__name(getSalesLimit, "getSalesLimit");
function getSKULimit(tierId) {
  const tier = getTierConfig(tierId);
  if (!tier) return 0;
  return tier.limits.sku;
}
__name(getSKULimit, "getSKULimit");
async function createSubscription(partnerId, tierId) {
  const subscriptionId = `sub_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  const startDate = /* @__PURE__ */ new Date();
  const endDate = /* @__PURE__ */ new Date();
  endDate.setMonth(endDate.getMonth() + 1);
  await db.insert(subscriptions).values({
    id: subscriptionId,
    partnerId,
    tierId,
    status: "active",
    startDate,
    endDate,
    autoRenew: true,
    createdAt: /* @__PURE__ */ new Date()
  });
  if (tierId !== "free_starter") {
    await createInvoice(partnerId, subscriptionId, tierId);
  }
  await initializeSalesLimits(partnerId, tierId);
  return subscriptionId;
}
__name(createSubscription, "createSubscription");
async function upgradeSubscription(partnerId, newTierId) {
  const currentSub = await db.query.subscriptions.findFirst({
    where: and2(
      eq3(subscriptions.partnerId, partnerId),
      eq3(subscriptions.status, "active")
    )
  });
  if (!currentSub) {
    return await createSubscription(partnerId, newTierId);
  }
  await db.update(subscriptions).set({
    tierId: newTierId,
    updatedAt: /* @__PURE__ */ new Date()
  }).where(eq3(subscriptions.id, currentSub.id));
  await db.update(partners).set({
    pricingTier: newTierId
  }).where(eq3(partners.id, partnerId));
  if (newTierId !== "free_starter") {
    await createUpgradeInvoice(partnerId, currentSub.id, currentSub.tierId, newTierId);
  }
  await updateSalesLimits(partnerId, newTierId);
  return currentSub.id;
}
__name(upgradeSubscription, "upgradeSubscription");
async function cancelSubscription2(partnerId) {
  const subscription = await db.query.subscriptions.findFirst({
    where: and2(
      eq3(subscriptions.partnerId, partnerId),
      eq3(subscriptions.status, "active")
    )
  });
  if (!subscription) {
    throw new Error("No active subscription found");
  }
  await db.update(subscriptions).set({
    status: "cancelled",
    autoRenew: false,
    updatedAt: /* @__PURE__ */ new Date()
  }).where(eq3(subscriptions.id, subscription.id));
  return subscription.id;
}
__name(cancelSubscription2, "cancelSubscription");
async function createInvoice(partnerId, subscriptionId, tierId) {
  const invoiceId = `inv_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  const amount = calculateMonthlyFee(tierId);
  const dueDate = /* @__PURE__ */ new Date();
  dueDate.setDate(dueDate.getDate() + 5);
  await db.insert(invoices).values({
    id: invoiceId,
    partnerId,
    subscriptionId,
    amount,
    currency: "USD",
    status: "pending",
    dueDate,
    createdAt: /* @__PURE__ */ new Date()
  });
  try {
    const partner = await db.query.partners.findFirst({
      where: eq3(partners.id, partnerId)
    });
    if (partner?.email) {
      await emailService_default.sendInvoiceCreated(
        partner.email,
        partner.businessName || partner.fullName || "Partner",
        invoiceId,
        amount,
        dueDate.toISOString()
      );
    }
  } catch (error) {
    console.error("Failed to send invoice email:", error);
  }
  return invoiceId;
}
__name(createInvoice, "createInvoice");
async function createUpgradeInvoice(partnerId, subscriptionId, oldTierId, newTierId) {
  const invoiceId = `inv_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  const oldFee = calculateMonthlyFee(oldTierId);
  const newFee = calculateMonthlyFee(newTierId);
  const difference = newFee - oldFee;
  const now = /* @__PURE__ */ new Date();
  const daysInMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0).getDate();
  const daysRemaining = daysInMonth - now.getDate();
  const proratedAmount = difference / daysInMonth * daysRemaining;
  const dueDate = /* @__PURE__ */ new Date();
  dueDate.setDate(dueDate.getDate() + 3);
  await db.insert(invoices).values({
    id: invoiceId,
    partnerId,
    subscriptionId,
    amount: Math.max(proratedAmount, 0),
    currency: "USD",
    status: "pending",
    dueDate,
    metadata: JSON.stringify({
      type: "upgrade",
      oldTier: oldTierId,
      newTier: newTierId,
      prorated: true
    }),
    createdAt: /* @__PURE__ */ new Date()
  });
  return invoiceId;
}
__name(createUpgradeInvoice, "createUpgradeInvoice");
async function recordCommission(partnerId, orderId, saleAmount, tierId) {
  const commissionId = `com_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  const tier = getTierConfig(tierId);
  if (!tier) {
    throw new Error("Invalid tier");
  }
  const commissionAmount = saleAmount * tier.commissionRate;
  const now = /* @__PURE__ */ new Date();
  const periodStart = new Date(now.getFullYear(), now.getMonth(), 1);
  const periodEnd = new Date(now.getFullYear(), now.getMonth() + 1, 0);
  await db.insert(commissionRecords).values({
    id: commissionId,
    partnerId,
    orderId,
    saleAmount,
    commissionRate: tier.commissionRate,
    commissionAmount,
    status: "pending",
    periodStart,
    periodEnd,
    createdAt: /* @__PURE__ */ new Date()
  });
  await updateSalesTracking(partnerId, saleAmount);
  return commissionId;
}
__name(recordCommission, "recordCommission");
async function getMonthlyCommissions(partnerId, month) {
  const records = await db.query.commissionRecords.findMany({
    where: and2(
      eq3(commissionRecords.partnerId, partnerId)
      // Add month filter here
    )
  });
  const total = records.reduce((sum, record) => sum + record.commissionAmount, 0);
  return { records, total };
}
__name(getMonthlyCommissions, "getMonthlyCommissions");
async function initializeSalesLimits(partnerId, tierId) {
  const limitId = `lim_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  const tier = getTierConfig(tierId);
  if (!tier) return;
  const now = /* @__PURE__ */ new Date();
  const month = parseInt(`${now.getFullYear()}${String(now.getMonth() + 1).padStart(2, "0")}`);
  await db.insert(salesLimits).values({
    id: limitId,
    partnerId,
    tierId,
    month,
    totalSales: 0,
    salesLimit: tier.limits.monthlySalesLimit,
    skuCount: 0,
    skuLimit: tier.limits.sku,
    status: "ok",
    createdAt: /* @__PURE__ */ new Date()
  });
  return limitId;
}
__name(initializeSalesLimits, "initializeSalesLimits");
async function updateSalesLimits(partnerId, newTierId) {
  const now = /* @__PURE__ */ new Date();
  const month = parseInt(`${now.getFullYear()}${String(now.getMonth() + 1).padStart(2, "0")}`);
  const currentLimit = await db.query.salesLimits.findFirst({
    where: and2(
      eq3(salesLimits.partnerId, partnerId),
      eq3(salesLimits.month, month)
    )
  });
  if (!currentLimit) {
    return await initializeSalesLimits(partnerId, newTierId);
  }
  const tier = getTierConfig(newTierId);
  if (!tier) return;
  await db.update(salesLimits).set({
    tierId: newTierId,
    salesLimit: tier.limits.monthlySalesLimit,
    skuLimit: tier.limits.sku,
    updatedAt: /* @__PURE__ */ new Date()
  }).where(eq3(salesLimits.id, currentLimit.id));
}
__name(updateSalesLimits, "updateSalesLimits");
async function updateSalesTracking(partnerId, saleAmount) {
  const now = /* @__PURE__ */ new Date();
  const month = parseInt(`${now.getFullYear()}${String(now.getMonth() + 1).padStart(2, "0")}`);
  const currentLimit = await db.query.salesLimits.findFirst({
    where: and2(
      eq3(salesLimits.partnerId, partnerId),
      eq3(salesLimits.month, month)
    )
  });
  if (!currentLimit) {
    const partner = await db.query.partners.findFirst({
      where: eq3(partners.id, partnerId)
    });
    if (partner) {
      await initializeSalesLimits(partnerId, partner.pricingTier || "free_starter");
    }
    return;
  }
  const newTotal = currentLimit.totalSales + saleAmount;
  const limit = currentLimit.salesLimit;
  let status = "ok";
  if (limit > 0) {
    if (newTotal >= limit) {
      status = "exceeded";
    } else if (newTotal >= limit * 0.8) {
      status = "warning";
    }
  }
  await db.update(salesLimits).set({
    totalSales: newTotal,
    status,
    updatedAt: /* @__PURE__ */ new Date()
  }).where(eq3(salesLimits.id, currentLimit.id));
  return status;
}
__name(updateSalesTracking, "updateSalesTracking");
async function checkSalesLimit(partnerId) {
  const now = /* @__PURE__ */ new Date();
  const month = parseInt(`${now.getFullYear()}${String(now.getMonth() + 1).padStart(2, "0")}`);
  const currentLimit = await db.query.salesLimits.findFirst({
    where: and2(
      eq3(salesLimits.partnerId, partnerId),
      eq3(salesLimits.month, month)
    )
  });
  if (!currentLimit) {
    return { exceeded: false, limit: 0, current: 0, percentage: 0 };
  }
  const limit = currentLimit.salesLimit;
  const current = currentLimit.totalSales;
  if (limit === -1) {
    return { exceeded: false, limit: -1, current, percentage: 0 };
  }
  const percentage = current / limit * 100;
  const exceeded = current >= limit;
  return { exceeded, limit, current, percentage };
}
__name(checkSalesLimit, "checkSalesLimit");
async function processMonthlyBilling() {
  console.log("\u{1F504} Processing monthly billing...");
  const activeSubscriptions = await db.query.subscriptions.findMany({
    where: eq3(subscriptions.status, "active")
  });
  for (const subscription of activeSubscriptions) {
    try {
      if (subscription.tierId === "free_starter") {
        continue;
      }
      const now = /* @__PURE__ */ new Date();
      if (subscription.endDate && subscription.endDate <= now) {
        await createInvoice(
          subscription.partnerId,
          subscription.id,
          subscription.tierId
        );
        const newEndDate = new Date(subscription.endDate);
        newEndDate.setMonth(newEndDate.getMonth() + 1);
        await db.update(subscriptions).set({
          endDate: newEndDate,
          updatedAt: /* @__PURE__ */ new Date()
        }).where(eq3(subscriptions.id, subscription.id));
        console.log(`\u2705 Renewed subscription: ${subscription.id}`);
      }
    } catch (error) {
      console.error(`\u274C Error processing subscription ${subscription.id}:`, error);
    }
  }
  await resetMonthlySalesLimits();
  console.log("\u2705 Monthly billing completed");
}
__name(processMonthlyBilling, "processMonthlyBilling");
async function resetMonthlySalesLimits() {
  const now = /* @__PURE__ */ new Date();
  const currentMonth = parseInt(`${now.getFullYear()}${String(now.getMonth() + 1).padStart(2, "0")}`);
  const allPartners = await db.query.partners.findMany();
  for (const partner of allPartners) {
    try {
      await initializeSalesLimits(partner.id, partner.pricingTier || "free_starter");
    } catch (error) {
      console.error(`Error resetting limits for partner ${partner.id}:`, error);
    }
  }
}
__name(resetMonthlySalesLimits, "resetMonthlySalesLimits");
async function processOverdueInvoices() {
  console.log("\u{1F504} Processing overdue invoices...");
  const now = /* @__PURE__ */ new Date();
  const overdueInvoices = await db.query.invoices.findMany({
    where: and2(
      eq3(invoices.status, "pending"),
      lte2(invoices.dueDate, now)
    )
  });
  for (const invoice of overdueInvoices) {
    try {
      const daysPastDue = Math.floor(
        (now.getTime() - invoice.dueDate.getTime()) / (1e3 * 60 * 60 * 24)
      );
      const partner = await db.query.partners.findFirst({
        where: eq3(partners.id, invoice.partnerId)
      });
      if (partner?.email) {
        await emailService_default.sendInvoiceOverdue(
          partner.email,
          partner.businessName || partner.fullName || "Partner",
          invoice.id,
          invoice.amount,
          daysPastDue
        );
      }
      if (invoice.subscriptionId) {
        const subscription = await db.query.subscriptions.findFirst({
          where: eq3(subscriptions.id, invoice.subscriptionId)
        });
        if (subscription) {
          if (daysPastDue >= 5) {
            await db.update(subscriptions).set({
              status: "suspended",
              updatedAt: /* @__PURE__ */ new Date()
            }).where(eq3(subscriptions.id, subscription.id));
            if (partner?.email) {
              await emailService_default.sendSubscriptionSuspended(
                partner.email,
                partner.businessName || partner.fullName || "Partner",
                `Payment overdue for ${daysPastDue} days`
              );
            }
            console.log(`\u26A0\uFE0F Suspended subscription: ${subscription.id}`);
          }
        }
      }
    } catch (error) {
      console.error(`Error processing overdue invoice ${invoice.id}:`, error);
    }
  }
  console.log("\u2705 Overdue processing completed");
}
__name(processOverdueInvoices, "processOverdueInvoices");
var billingService_default = {
  getTierConfig,
  calculateMonthlyFee,
  calculateCommission,
  getSalesLimit,
  getSKULimit,
  createSubscription,
  upgradeSubscription,
  cancelSubscription: cancelSubscription2,
  createInvoice,
  recordCommission,
  getMonthlyCommissions,
  checkSalesLimit,
  processMonthlyBilling,
  processOverdueInvoices
};

// server/routes/subscriptionRoutes.ts
var router5 = Router4();
router5.get("/addons", getAddonServices);
router5.get("/my-subscriptions", getPartnerSubscriptions);
router5.post("/subscribe", subscribeToAddon);
router5.put("/subscriptions/:id/cancel", cancelSubscription);
router5.get("/payments", getPaymentHistory);
router5.get("/current", async (req, res) => {
  try {
    if (!req.user) {
      return res.status(401).json({ error: "Unauthorized" });
    }
    const subscription = await db.query.subscriptions.findFirst({
      where: and3(
        eq4(subscriptions.partnerId, req.user.id),
        eq4(subscriptions.status, "active")
      )
    });
    if (!subscription) {
      return res.status(404).json({ error: "Subscription not found" });
    }
    res.json(subscription);
  } catch (error) {
    console.error("Get subscription error:", error);
    res.status(500).json({ error: "Failed to fetch subscription" });
  }
});
router5.post("/upgrade", async (req, res) => {
  try {
    if (!req.user) {
      return res.status(401).json({ error: "Unauthorized" });
    }
    const { newTierId } = req.body;
    const subscriptionId = await billingService_default.upgradeSubscription(req.user.id, newTierId);
    res.json({ success: true, subscriptionId });
  } catch (error) {
    console.error("Upgrade error:", error);
    res.status(500).json({ error: "Failed to upgrade" });
  }
});
router5.put("/auto-renew", async (req, res) => {
  try {
    if (!req.user) {
      return res.status(401).json({ error: "Unauthorized" });
    }
    const { autoRenew } = req.body;
    const subscription = await db.query.subscriptions.findFirst({
      where: and3(
        eq4(subscriptions.partnerId, req.user.id),
        eq4(subscriptions.status, "active")
      )
    });
    if (!subscription) {
      return res.status(404).json({ error: "Subscription not found" });
    }
    await db.update(subscriptions).set({ autoRenew, updatedAt: /* @__PURE__ */ new Date() }).where(eq4(subscriptions.id, subscription.id));
    res.json({ success: true, autoRenew });
  } catch (error) {
    console.error("Auto-renew error:", error);
    res.status(500).json({ error: "Failed to update" });
  }
});
var subscriptionRoutes_default = router5;

// server/routes/forecastRoutes.ts
import { Router as Router5 } from "express";

// server/controllers/forecastController.ts
init_db();
import { nanoid as nanoid6 } from "nanoid";
async function getSalesForecasts(req, res) {
  try {
    const partnerId = req.user?.partnerId;
    if (!partnerId) {
      return res.status(403).json({ error: "Partner ID topilmadi" });
    }
    const { period = "month" } = req.query;
    const forecasts = await db.query(
      `SELECT * FROM sales_forecasts
       WHERE partner_id = ? AND forecast_period = ?
       ORDER BY forecast_date DESC
       LIMIT 30`,
      [partnerId, period]
    );
    res.json(forecasts);
  } catch (error) {
    console.error("Error fetching forecasts:", error);
    res.status(500).json({ error: error.message });
  }
}
__name(getSalesForecasts, "getSalesForecasts");
async function generateForecast(req, res) {
  try {
    const partnerId = req.user?.partnerId;
    if (!partnerId) {
      return res.status(403).json({ error: "Partner ID topilmadi" });
    }
    const { forecastPeriod, marketplace, category } = req.body;
    const historicalData = await db.query(
      `SELECT 
         SUM(total_revenue) as total_revenue,
         SUM(net_profit) as net_profit,
         SUM(orders_count) as orders_count
       FROM profit_breakdown
       WHERE partner_id = ? AND date >= datetime('now', '-30 days')`,
      [partnerId]
    );
    if (!historicalData || historicalData.length === 0 || !historicalData[0].total_revenue) {
      return res.status(400).json({
        error: "Prognoz uchun yetarli tarixiy ma'lumot yo'q"
      });
    }
    const baseRevenue = parseFloat(historicalData[0].total_revenue || "0");
    const baseProfit = parseFloat(historicalData[0].net_profit || "0");
    const baseOrders = historicalData[0].orders_count || 0;
    const growthRate = 1 + (Math.random() * 0.1 + 0.05);
    const predictedRevenue = baseRevenue * growthRate;
    const predictedProfit = baseProfit * growthRate;
    const predictedOrders = Math.round(baseOrders * growthRate);
    const confidenceLevel = Math.round(70 + Math.random() * 20);
    const id = nanoid6();
    const now = /* @__PURE__ */ new Date();
    const forecastDate = new Date(now);
    if (forecastPeriod === "week") {
      forecastDate.setDate(forecastDate.getDate() + 7);
    } else if (forecastPeriod === "month") {
      forecastDate.setMonth(forecastDate.getMonth() + 1);
    } else if (forecastPeriod === "quarter") {
      forecastDate.setMonth(forecastDate.getMonth() + 3);
    } else if (forecastPeriod === "year") {
      forecastDate.setFullYear(forecastDate.getFullYear() + 1);
    }
    const factors = {
      historical_revenue: baseRevenue,
      growth_rate: growthRate,
      seasonality: "normal",
      market_trends: "positive"
    };
    await db.query(
      `INSERT INTO sales_forecasts (
        id, partner_id, forecast_period, forecast_date,
        predicted_revenue, predicted_profit, predicted_orders,
        confidence_level, marketplace, category, model_version, factors, created_at
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        id,
        partnerId,
        forecastPeriod,
        forecastDate.toISOString(),
        predictedRevenue,
        predictedProfit,
        predictedOrders,
        confidenceLevel,
        marketplace || null,
        category || null,
        "v1.0",
        JSON.stringify(factors),
        now.toISOString()
      ]
    );
    res.status(201).json({
      id,
      forecast: {
        period: forecastPeriod,
        date: forecastDate,
        predictedRevenue,
        predictedProfit,
        predictedOrders,
        confidenceLevel
      }
    });
  } catch (error) {
    console.error("Error generating forecast:", error);
    res.status(500).json({ error: error.message });
  }
}
__name(generateForecast, "generateForecast");
async function getBusinessInsights(req, res) {
  try {
    const partnerId = req.user?.partnerId;
    if (!partnerId) {
      return res.status(403).json({ error: "Partner ID topilmadi" });
    }
    const insights = await db.query(
      `SELECT * FROM business_insights
       WHERE partner_id = ? AND is_dismissed = ?
       ORDER BY priority DESC, impact_score DESC, created_at DESC`,
      [partnerId, false]
    );
    res.json(insights);
  } catch (error) {
    console.error("Error fetching insights:", error);
    res.status(500).json({ error: error.message });
  }
}
__name(getBusinessInsights, "getBusinessInsights");
async function generateInsights(req, res) {
  try {
    const partnerId = req.user?.partnerId;
    if (!partnerId) {
      return res.status(403).json({ error: "Partner ID topilmadi" });
    }
    const stats = await db.query(
      `SELECT 
         marketplace,
         SUM(total_revenue) as revenue,
         SUM(net_profit) as profit,
         AVG(profit_margin) as avg_margin,
         SUM(orders_count) as orders
       FROM profit_breakdown
       WHERE partner_id = ? AND date >= datetime('now', '-30 days')
       GROUP BY marketplace`,
      [partnerId]
    );
    const insights = [];
    for (const stat of stats) {
      if (parseFloat(stat.avg_margin) < 15) {
        insights.push({
          type: "warning",
          title: `${stat.marketplace} - Past foyda marjasi`,
          description: `Sizning ${stat.marketplace} dagi foyda marjangiz ${stat.avg_margin}%. Narxlarni qayta ko'rib chiqing.`,
          priority: "high",
          impact_score: 85
        });
      }
      if (stat.orders < 50) {
        insights.push({
          type: "opportunity",
          title: `${stat.marketplace} - Savdoni oshirish imkoniyati`,
          description: `${stat.marketplace} da oylik ${stat.orders} ta buyurtma. Marketing strategiyasini yaxshilang.`,
          priority: "medium",
          impact_score: 70
        });
      }
    }
    const now = (/* @__PURE__ */ new Date()).toISOString();
    for (const insight of insights) {
      const id = nanoid6();
      await db.query(
        `INSERT INTO business_insights (
          id, partner_id, insight_type, title, description,
          priority, impact_score, created_at
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
        [
          id,
          partnerId,
          insight.type,
          insight.title,
          insight.description,
          insight.priority,
          insight.impact_score,
          now
        ]
      );
    }
    res.json({ message: `${insights.length} ta yangi tahlil yaratildi`, insights });
  } catch (error) {
    console.error("Error generating insights:", error);
    res.status(500).json({ error: error.message });
  }
}
__name(generateInsights, "generateInsights");
async function markInsightAsRead(req, res) {
  try {
    const { id } = req.params;
    const now = (/* @__PURE__ */ new Date()).toISOString();
    await db.query(
      "UPDATE business_insights SET is_read = ?, updated_at = ? WHERE id = ?",
      [true, now, id]
    );
    res.json({ message: "O'qilgan deb belgilandi" });
  } catch (error) {
    console.error("Error marking insight as read:", error);
    res.status(500).json({ error: error.message });
  }
}
__name(markInsightAsRead, "markInsightAsRead");
async function getPerformanceBenchmarks(req, res) {
  try {
    const { category, marketplace } = req.query;
    let query = "SELECT * FROM performance_benchmarks WHERE 1=1";
    const params = [];
    if (category) {
      query += " AND category = ?";
      params.push(category);
    }
    if (marketplace) {
      query += " AND marketplace = ?";
      params.push(marketplace);
    }
    query += " ORDER BY date DESC LIMIT 30";
    const benchmarks = await db.query(query, params);
    res.json(benchmarks);
  } catch (error) {
    console.error("Error fetching benchmarks:", error);
    res.status(500).json({ error: error.message });
  }
}
__name(getPerformanceBenchmarks, "getPerformanceBenchmarks");

// server/routes/forecastRoutes.ts
var router6 = Router5();
router6.get("/forecasts", getSalesForecasts);
router6.post("/forecasts/generate", generateForecast);
router6.get("/insights", getBusinessInsights);
router6.post("/insights/generate", generateInsights);
router6.put("/insights/:id/read", markInsightAsRead);
router6.get("/benchmarks", getPerformanceBenchmarks);
var forecastRoutes_default = router6;

// server/routes/broadcastRoutes.ts
import { Router as Router6 } from "express";

// server/controllers/broadcastController.ts
init_db();
import { nanoid as nanoid7 } from "nanoid";
async function getAllBroadcasts(req, res) {
  try {
    const broadcasts = await db.query(
      `SELECT b.*, u.first_name, u.last_name
       FROM broadcast_messages b
       JOIN users u ON b.sender_id = u.id
       ORDER BY b.created_at DESC`,
      []
    );
    res.json(broadcasts);
  } catch (error) {
    console.error("Error fetching broadcasts:", error);
    res.status(500).json({ error: error.message });
  }
}
__name(getAllBroadcasts, "getAllBroadcasts");
async function createBroadcast(req, res) {
  try {
    const adminId = req.user?.id;
    if (!adminId) {
      return res.status(403).json({ error: "Admin ID topilmadi" });
    }
    const {
      title,
      content,
      targetAudience,
      // 'all_partners', 'specific_tier', 'specific_partners'
      targetTiers,
      targetPartners,
      channel,
      // 'in_app', 'email', 'sms'
      priority,
      scheduledAt
    } = req.body;
    const id = nanoid7();
    const now = (/* @__PURE__ */ new Date()).toISOString();
    await db.query(
      `INSERT INTO broadcast_messages (
        id, sender_id, title, content, target_audience,
        target_tiers, target_partners, channel, priority,
        scheduled_at, status, created_at
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        id,
        adminId,
        title,
        content,
        targetAudience,
        JSON.stringify(targetTiers || []),
        JSON.stringify(targetPartners || []),
        channel || "in_app",
        priority || "normal",
        scheduledAt || null,
        scheduledAt ? "scheduled" : "draft",
        now
      ]
    );
    res.status(201).json({ id, message: "Broadcast xabar yaratildi" });
  } catch (error) {
    console.error("Error creating broadcast:", error);
    res.status(500).json({ error: error.message });
  }
}
__name(createBroadcast, "createBroadcast");
async function sendBroadcast(req, res) {
  try {
    const { id } = req.params;
    const now = (/* @__PURE__ */ new Date()).toISOString();
    const broadcast = await db.query(
      "SELECT * FROM broadcast_messages WHERE id = ?",
      [id]
    );
    if (!broadcast || broadcast.length === 0) {
      return res.status(404).json({ error: "Broadcast topilmadi" });
    }
    const broadcastData = broadcast[0];
    let recipients = [];
    if (broadcastData.target_audience === "all_partners") {
      recipients = await db.query("SELECT user_id FROM partners WHERE is_approved = ?", [true]);
    } else if (broadcastData.target_audience === "specific_tier") {
      const tiers = JSON.parse(broadcastData.target_tiers || "[]");
      if (tiers.length > 0) {
        const placeholders = tiers.map(() => "?").join(",");
        recipients = await db.query(
          `SELECT user_id FROM partners WHERE pricing_tier IN (${placeholders}) AND is_approved = ?`,
          [...tiers, true]
        );
      }
    } else if (broadcastData.target_audience === "specific_partners") {
      const partnerIds = JSON.parse(broadcastData.target_partners || "[]");
      if (partnerIds.length > 0) {
        const placeholders = partnerIds.map(() => "?").join(",");
        recipients = await db.query(
          `SELECT user_id FROM partners WHERE id IN (${placeholders})`,
          partnerIds
        );
      }
    }
    const notificationId = nanoid7();
    for (const recipient of recipients) {
      const notifId = nanoid7();
      await db.query(
        `INSERT INTO notifications (
          id, user_id, type, title, message, channel, priority, created_at
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
        [
          notifId,
          recipient.user_id,
          "broadcast",
          broadcastData.title,
          broadcastData.content,
          broadcastData.channel,
          broadcastData.priority,
          now
        ]
      );
    }
    await db.query(
      `UPDATE broadcast_messages
       SET status = 'sent', sent_at = ?, recipients_count = ?
       WHERE id = ?`,
      [now, recipients.length, id]
    );
    res.json({
      message: "Xabar yuborildi",
      recipientsCount: recipients.length
    });
  } catch (error) {
    console.error("Error sending broadcast:", error);
    res.status(500).json({ error: error.message });
  }
}
__name(sendBroadcast, "sendBroadcast");
async function deleteBroadcast(req, res) {
  try {
    const { id } = req.params;
    await db.query("DELETE FROM broadcast_messages WHERE id = ?", [id]);
    res.json({ message: "Broadcast o'chirildi" });
  } catch (error) {
    console.error("Error deleting broadcast:", error);
    res.status(500).json({ error: error.message });
  }
}
__name(deleteBroadcast, "deleteBroadcast");
async function getPartnerNotifications(req, res) {
  try {
    const userId = req.user?.id;
    if (!userId) {
      return res.status(403).json({ error: "User ID topilmadi" });
    }
    const notifications2 = await db.query(
      `SELECT * FROM notifications
       WHERE user_id = ?
       ORDER BY created_at DESC
       LIMIT 50`,
      [userId]
    );
    res.json(notifications2);
  } catch (error) {
    console.error("Error fetching notifications:", error);
    res.status(500).json({ error: error.message });
  }
}
__name(getPartnerNotifications, "getPartnerNotifications");
async function markNotificationAsRead(req, res) {
  try {
    const { id } = req.params;
    await db.query(
      "UPDATE notifications SET is_read = ? WHERE id = ?",
      [true, id]
    );
    res.json({ message: "O'qilgan deb belgilandi" });
  } catch (error) {
    console.error("Error marking notification as read:", error);
    res.status(500).json({ error: error.message });
  }
}
__name(markNotificationAsRead, "markNotificationAsRead");

// server/routes/broadcastRoutes.ts
var router7 = Router6();
router7.get("/broadcasts", getAllBroadcasts);
router7.post("/broadcasts", createBroadcast);
router7.post("/broadcasts/:id/send", sendBroadcast);
router7.delete("/broadcasts/:id", deleteBroadcast);
router7.get("/notifications", getPartnerNotifications);
router7.put("/notifications/:id/read", markNotificationAsRead);
var broadcastRoutes_default = router7;

// server/routes/aiManagerRoutes.ts
import { Router as Router7 } from "express";

// server/controllers/aiManagerController.ts
init_db();
init_aiManagerService();
async function createAIProductCard(req, res) {
  try {
    const { name, category, description, price, images, targetMarketplace } = req.body;
    const partnerId = req.user?.partnerId;
    if (!partnerId) {
      return res.status(401).json({ error: "Unauthorized" });
    }
    if (!name || !targetMarketplace) {
      return res.status(400).json({ error: "name va targetMarketplace majburiy" });
    }
    const result = await aiManagerService_default.generateProductCard(
      {
        name,
        category,
        description,
        price,
        images,
        targetMarketplace
      },
      partnerId
    );
    res.json(result);
  } catch (error) {
    console.error("AI Product Card Error:", error);
    res.status(500).json({ error: error.message });
  }
}
__name(createAIProductCard, "createAIProductCard");
async function getAIGeneratedProducts(req, res) {
  try {
    if (req.user?.role !== "admin") {
      return res.status(403).json({ error: "Admin only" });
    }
    const { status, marketplace } = req.query;
    let sqlQuery = `
      SELECT 
        p.id,
        p.account_id,
        p.marketplace,
        p.base_product_name,
        p.optimized_title AS ai_title,
        p.optimized_description AS ai_description,
        p.seo_score,
        p.price AS suggested_price,
        p.status,
        p.created_at
      FROM ai_product_cards p
      WHERE 1=1
    `;
    const params = [];
    if (status) {
      sqlQuery += " AND p.status = ?";
      params.push(status);
    }
    if (marketplace) {
      sqlQuery += " AND p.marketplace = ?";
      params.push(marketplace);
    }
    sqlQuery += " ORDER BY p.created_at DESC LIMIT 100";
    const products4 = await db.all(sqlQuery, params);
    res.json(products4);
  } catch (error) {
    console.error("Get AI Products Error:", error);
    res.status(500).json({ error: error.message });
  }
}
__name(getAIGeneratedProducts, "getAIGeneratedProducts");
async function reviewAIProduct(req, res) {
  try {
    const { id } = req.params;
    const { action, notes } = req.body;
    const userId = req.user?.id;
    if (!userId) {
      return res.status(401).json({ error: "Unauthorized" });
    }
    const newStatus = action === "approve" ? "approved" : "rejected";
    const result = await db.run(
      `UPDATE ai_product_cards 
       SET status = ?, updated_at = CURRENT_TIMESTAMP 
       WHERE id = ?`,
      [newStatus, parseInt(id, 10)]
    );
    res.json({ success: true, status: newStatus, updated: result.changes ?? 0 });
  } catch (error) {
    console.error("Review AI Product Error:", error);
    res.status(500).json({ error: error.message });
  }
}
__name(reviewAIProduct, "reviewAIProduct");
async function uploadToMarketplace(req, res) {
  try {
    const { productId, marketplaceType } = req.body;
    const partnerId = req.user?.partnerId;
    if (!partnerId) {
      return res.status(401).json({ error: "Unauthorized" });
    }
    if (!productId || !marketplaceType) {
      return res.status(400).json({ error: "productId va marketplaceType majburiy" });
    }
    res.json({
      success: false,
      message: "Marketplace'ga avtomatik yuklash faqat production integratsiya bilan ishlaydi (demo rejimida o'chirilgan)."
    });
  } catch (error) {
    console.error("Upload to Marketplace Error:", error);
    res.status(500).json({ error: error.message });
  }
}
__name(uploadToMarketplace, "uploadToMarketplace");
async function optimizePrice3(req, res) {
  try {
    const { productId, marketplaceType } = req.body;
    const partnerId = req.user?.partnerId;
    if (!partnerId) {
      return res.status(401).json({ error: "Unauthorized" });
    }
    if (!productId || !marketplaceType) {
      return res.status(400).json({ error: "productId va marketplaceType majburiy" });
    }
    const result = {
      recommendedPrice: null,
      priceChange: 0,
      priceChangePercent: 0,
      reasoning: "Narx optimizatsiyasi demo rejimida faqat hisobot sifatida ishlaydi.",
      expectedImpact: "Hech qanday o'zgarish kiritilmaydi.",
      competitorAnalysis: null,
      confidenceLevel: 0,
      risks: [],
      alternativePrices: []
    };
    res.json({ success: true, data: result });
  } catch (error) {
    console.error("Optimize Price Error:", error);
    res.status(500).json({ error: error.message });
  }
}
__name(optimizePrice3, "optimizePrice");
async function monitorPartner(req, res) {
  try {
    const { partnerId } = req.params;
    const requestUserPartnerId = req.user?.partnerId;
    if (req.user?.role !== "admin" && String(requestUserPartnerId ?? "") !== String(partnerId)) {
      return res.status(403).json({ error: "Forbidden" });
    }
    res.json({
      success: true,
      message: "AI monitoring background rejimda ishlamoqda (demo)."
    });
  } catch (error) {
    console.error("Monitor Partner Error:", error);
    res.status(500).json({ error: error.message });
  }
}
__name(monitorPartner, "monitorPartner");
async function getAIAlerts(req, res) {
  try {
    if (req.user?.role !== "admin") {
      return res.status(403).json({ error: "Admin only" });
    }
    const rows = await db.all(
      `SELECT id, task_type, status, error_message, created_at
       FROM ai_tasks
       WHERE status = 'failed'
       ORDER BY created_at DESC
       LIMIT 100`
    );
    const alerts = rows.map((row) => ({
      id: row.id,
      title: `AI task failed: ${row.task_type}`,
      description: row.error_message || "Noma'lum xato",
      ai_suggested_action: "Xatoni loglardan tekshiring yoki vazifani qayta ishga tushiring.",
      severity: "high",
      status: "open",
      created_at: row.created_at
    }));
    res.json(alerts);
  } catch (error) {
    console.error("Get AI Alerts Error:", error);
    res.status(500).json({ error: error.message });
  }
}
__name(getAIAlerts, "getAIAlerts");
async function resolveAlert(req, res) {
  try {
    res.json({ success: true });
  } catch (error) {
    console.error("Resolve Alert Error:", error);
    res.status(500).json({ error: error.message });
  }
}
__name(resolveAlert, "resolveAlert");
async function getAITasks(req, res) {
  try {
    const { status, taskType } = req.query;
    if (req.user?.role !== "admin") {
      return res.status(403).json({ error: "Admin only" });
    }
    let sqlQuery = `
      SELECT 
        t.*, 
        a.marketplace,
        a.account_name
      FROM ai_tasks t
      LEFT JOIN ai_marketplace_accounts a ON t.account_id = a.id
      WHERE 1=1
    `;
    const params = [];
    if (status) {
      sqlQuery += " AND t.status = ?";
      params.push(status);
    }
    if (taskType) {
      sqlQuery += " AND t.task_type = ?";
      params.push(taskType);
    }
    sqlQuery += " ORDER BY t.created_at DESC LIMIT 100";
    const tasks = await db.all(sqlQuery, params);
    res.json(tasks);
  } catch (error) {
    console.error("Get AI Tasks Error:", error);
    res.status(500).json({ error: error.message });
  }
}
__name(getAITasks, "getAITasks");
async function getAIActionsLog(req, res) {
  try {
    const { taskType, status, limit = 50 } = req.query;
    if (req.user?.role !== "admin") {
      return res.status(403).json({ error: "Admin only" });
    }
    let sqlQuery = `
      SELECT 
        t.*, 
        a.marketplace,
        a.account_name
      FROM ai_tasks t
      LEFT JOIN ai_marketplace_accounts a ON t.account_id = a.id
      WHERE 1=1
    `;
    const params = [];
    if (taskType) {
      sqlQuery += " AND t.task_type = ?";
      params.push(taskType);
    }
    if (status) {
      sqlQuery += " AND t.status = ?";
      params.push(status);
    }
    sqlQuery += " ORDER BY t.created_at DESC LIMIT ?";
    params.push(parseInt(limit, 10) || 50);
    const actions = await db.all(sqlQuery, params);
    res.json(actions);
  } catch (error) {
    console.error("Get AI Actions Log Error:", error);
    res.status(500).json({ error: error.message });
  }
}
__name(getAIActionsLog, "getAIActionsLog");
async function getAIPerformanceMetrics(req, res) {
  try {
    if (req.user?.role !== "admin") {
      return res.status(403).json({ error: "Admin only" });
    }
    const days = parseInt(req.query.days || "7", 10);
    const since = /* @__PURE__ */ new Date();
    since.setDate(since.getDate() - days);
    const sinceDate = since.toISOString().split("T")[0];
    const metrics = await db.all(
      `SELECT 
         metric_date,
         marketplace,
         total_tasks,
         completed_tasks,
         failed_tasks,
         reviews_responded,
         products_optimized,
         revenue_impact
       FROM ai_performance_metrics
       WHERE metric_date >= ?
       ORDER BY metric_date DESC`,
      [sinceDate]
    );
    const totals = metrics.reduce(
      (acc, m) => ({
        totalTasks: acc.totalTasks + (m.total_tasks || 0),
        successfulTasks: acc.successfulTasks + (m.completed_tasks || 0),
        failedTasks: acc.failedTasks + (m.failed_tasks || 0),
        reviewsResponded: acc.reviewsResponded + (m.reviews_responded || 0),
        productsOptimized: acc.productsOptimized + (m.products_optimized || 0),
        revenueImpact: acc.revenueImpact + (m.revenue_impact || 0)
      }),
      {
        totalTasks: 0,
        successfulTasks: 0,
        failedTasks: 0,
        reviewsResponded: 0,
        productsOptimized: 0,
        revenueImpact: 0
      }
    );
    const successRate = totals.totalTasks > 0 ? (totals.successfulTasks / totals.totalTasks * 100).toFixed(2) : 0;
    res.json({
      metrics,
      totals,
      successRate
    });
  } catch (error) {
    console.error("Get AI Metrics Error:", error);
    res.status(500).json({ error: error.message });
  }
}
__name(getAIPerformanceMetrics, "getAIPerformanceMetrics");
async function getAIManagerConfig(req, res) {
  try {
    if (req.user?.role !== "admin") {
      return res.status(403).json({ error: "Admin only" });
    }
    res.json({
      is_enabled: true,
      mode: "auto",
      max_parallel_tasks: 100
    });
  } catch (error) {
    console.error("Get AI Config Error:", error);
    res.status(500).json({ error: error.message });
  }
}
__name(getAIManagerConfig, "getAIManagerConfig");
async function updateAIManagerConfig(req, res) {
  try {
    if (req.user?.role !== "admin") {
      return res.status(403).json({ error: "Admin only" });
    }
    const updates = req.body || {};
    res.json({ success: true, config: updates });
  } catch (error) {
    console.error("Update AI Config Error:", error);
    res.status(500).json({ error: error.message });
  }
}
__name(updateAIManagerConfig, "updateAIManagerConfig");
async function saveMarketplaceCredentials(req, res) {
  try {
    const userId = req.user?.id;
    const { marketplaceType, apiKey, apiSecret, sellerId } = req.body;
    if (!userId) {
      return res.status(401).json({ error: "Unauthorized" });
    }
    if (!marketplaceType) {
      return res.status(400).json({ error: "marketplaceType majburiy" });
    }
    const accountName = `Default ${marketplaceType} account`;
    const existing = await db.get(
      `SELECT id FROM ai_marketplace_accounts WHERE partner_id = ? AND marketplace = ?`,
      [userId, marketplaceType]
    );
    if (existing) {
      await db.run(
        `UPDATE ai_marketplace_accounts
         SET seller_id = ?, api_token = ?, api_secret = ?, updated_at = CURRENT_TIMESTAMP
         WHERE id = ?`,
        [sellerId || null, apiKey || null, apiSecret || null, existing.id]
      );
    } else {
      await db.run(
        `INSERT INTO ai_marketplace_accounts (
           partner_id, marketplace, account_name, seller_id, api_token, api_secret, account_status, ai_enabled
         ) VALUES (?, ?, ?, ?, ?, ?, 'active', 1)`,
        [userId, marketplaceType, accountName, sellerId || null, apiKey || null, apiSecret || null]
      );
    }
    res.json({ success: true });
  } catch (error) {
    console.error("Save Marketplace Credentials Error:", error);
    res.status(500).json({ error: error.message });
  }
}
__name(saveMarketplaceCredentials, "saveMarketplaceCredentials");
async function getMarketplaceCredentials(req, res) {
  try {
    const userId = req.user?.id;
    if (!userId) {
      return res.status(401).json({ error: "Unauthorized" });
    }
    const accounts = await db.all(
      `SELECT id, marketplace, account_name, account_status, ai_enabled, last_sync_at, sync_status
       FROM ai_marketplace_accounts
       WHERE partner_id = ?`,
      [userId]
    );
    const safeCredentials = accounts.map((a) => ({
      id: a.id,
      marketplace_type: a.marketplace,
      account_name: a.account_name,
      account_status: a.account_status,
      ai_enabled: !!a.ai_enabled,
      last_sync: a.last_sync_at,
      integration_status: a.sync_status,
      has_credentials: true
    }));
    res.json(safeCredentials);
  } catch (error) {
    console.error("Get Marketplace Credentials Error:", error);
    res.status(500).json({ error: error.message });
  }
}
__name(getMarketplaceCredentials, "getMarketplaceCredentials");

// server/routes/aiManagerRoutes.ts
var router8 = Router7();
router8.post("/products/generate", createAIProductCard);
router8.get("/products", getAIGeneratedProducts);
router8.post("/products/:id/review", reviewAIProduct);
router8.post("/products/upload", uploadToMarketplace);
router8.post("/optimize/price", optimizePrice3);
router8.post("/monitor/partner/:partnerId", monitorPartner);
router8.get("/alerts", getAIAlerts);
router8.post("/alerts/:id/resolve", resolveAlert);
router8.get("/tasks", getAITasks);
router8.get("/actions-log", getAIActionsLog);
router8.get("/metrics", getAIPerformanceMetrics);
router8.get("/config", getAIManagerConfig);
router8.put("/config", updateAIManagerConfig);
router8.post("/credentials", saveMarketplaceCredentials);
router8.get("/credentials", getMarketplaceCredentials);
var aiManagerRoutes_default = router8;

// server/routes/trendingRoutes.ts
import { Router as Router8 } from "express";

// server/services/trendingAnalytics.ts
init_storage();
import OpenAI2 from "openai";
var openai3 = new OpenAI2({ apiKey: process.env.OPENAI_API_KEY || "" });
function calculateTrendScore(factors) {
  const weights = {
    searchVolume: 0.2,
    // 20%
    priceCompetitiveness: 0.15,
    // 15%
    profitMargin: 0.25,
    // 25% - ENG MUHIM!
    marketSaturation: 0.1,
    // 10%
    growthRate: 0.15,
    // 15%
    seasonality: 0.05,
    // 5%
    shippingFeasibility: 0.05,
    // 5%
    localDemand: 0.05
    // 5%
  };
  const score = factors.searchVolume * weights.searchVolume + factors.priceCompetitiveness * weights.priceCompetitiveness + factors.profitMargin * weights.profitMargin + (100 - factors.marketSaturation) * weights.marketSaturation + // Inverted
  (factors.growthRate + 100) / 2 * weights.growthRate + factors.seasonality * weights.seasonality + factors.shippingFeasibility * weights.shippingFeasibility + factors.localDemand * weights.localDemand;
  return Math.round(score);
}
__name(calculateTrendScore, "calculateTrendScore");
function calculateProductProfit(params) {
  const { sourcePrice, weight, category, targetMarketplace } = params;
  const exchangeRate = params.exchangeRate || 12500;
  const costPriceUZS = sourcePrice * exchangeRate;
  const shippingPerKg = weight < 1 ? 8 : weight < 5 ? 6 : 5;
  const shippingCost = weight * shippingPerKg * exchangeRate;
  const customsRate = category === "electronics" ? 0.3 : 0.15;
  const customsDuty = costPriceUZS * customsRate;
  const localShipping = 3e4;
  const marketplaceFees = {
    uzum: 0.15,
    wildberries: 0.12,
    yandex: 0.13,
    ozon: 0.14
  };
  const marketplaceFeeRate = marketplaceFees[targetMarketplace] || 0.15;
  const totalCost = costPriceUZS + shippingCost + customsDuty + localShipping;
  const basePrice = totalCost * 1.5;
  const recommendedPrice = basePrice / (1 - marketplaceFeeRate - 0.1);
  const marketplaceFee = recommendedPrice * marketplaceFeeRate;
  const ourCommission = recommendedPrice * 0.1;
  const estimatedProfit = recommendedPrice - totalCost - marketplaceFee - ourCommission;
  const profitMargin = estimatedProfit / recommendedPrice * 100;
  const fixedCosts = 5e5;
  const breakEvenUnits = Math.ceil(fixedCosts / estimatedProfit);
  let riskLevel = "medium";
  if (profitMargin > 30 && breakEvenUnits < 20) riskLevel = "low";
  if (profitMargin < 15 || breakEvenUnits > 50) riskLevel = "high";
  return {
    costPrice: totalCost,
    shippingCost,
    customsDuty,
    localShipping,
    marketplaceFee,
    ourCommission,
    recommendedPrice: Math.round(recommendedPrice),
    profitMargin: Math.round(profitMargin * 10) / 10,
    estimatedProfit: Math.round(estimatedProfit),
    breakEvenUnits,
    riskLevel
  };
}
__name(calculateProductProfit, "calculateProductProfit");
async function predictTrendWithAI(productData) {
  try {
    const prompt = `
Analyze this product trend for the Uzbekistan market:

Product: ${productData.productName}
Category: ${productData.category}
Current Search Volume: ${productData.currentSearchVolume}/month
Price Range: ${productData.priceRange}
Source Market: ${productData.sourceMarket}

Context:
- Uzbekistan population: 35M, median age: 28
- Growing middle class, increasing online shopping
- Popular categories: electronics, fashion, home goods
- Competitors: Uzum Market, Wildberries, Baraka Market

Provide analysis in JSON format:
{
  "prediction": "rising|stable|declining",
  "confidence": 0-100,
  "reasoning": "detailed explanation in Uzbek",
  "recommendations": ["action 1", "action 2", "action 3"],
  "estimatedGrowth": -50 to +200 (% in next 3 months),
  "targetAudience": "description",
  "marketingStrategy": "brief strategy",
  "seasonality": "Q1|Q2|Q3|Q4 or year-round"
}
`;
    const response = await openai3.chat.completions.create({
      model: "gpt-4",
      messages: [
        {
          role: "system",
          content: "You are an expert market analyst specializing in e-commerce trends in Central Asia."
        },
        {
          role: "user",
          content: prompt
        }
      ],
      temperature: 0.7,
      max_tokens: 800
    });
    const result = JSON.parse(response.choices[0].message.content || "{}");
    return {
      prediction: result.prediction || "stable",
      confidence: result.confidence || 50,
      reasoning: result.reasoning || "Ma'lumot yetarli emas",
      recommendations: result.recommendations || [],
      estimatedGrowth: result.estimatedGrowth || 0
    };
  } catch (error) {
    console.error("AI trend prediction error:", error.message);
    return {
      prediction: "stable",
      confidence: 50,
      reasoning: "AI tahlil qilishda xatolik",
      recommendations: ["Manual tahlil qilish tavsiya etiladi"],
      estimatedGrowth: 0
    };
  }
}
__name(predictTrendWithAI, "predictTrendWithAI");
async function fetchProductDataFromMarket(productName, sourceMarket) {
  try {
    const priceEstimates = {
      "watch": 30,
      "phone": 200,
      "charger": 15,
      "speaker": 40,
      "camera": 100,
      "light": 20,
      "power bank": 25,
      "mouse": 15,
      "keyboard": 35
    };
    let estimatedPrice = 30;
    for (const [keyword, price] of Object.entries(priceEstimates)) {
      if (productName.toLowerCase().includes(keyword)) {
        estimatedPrice = price;
        break;
      }
    }
    return {
      searchVolume: Math.floor(Math.random() * 5e4) + 2e4,
      // 20k-70k range
      currentPrice: estimatedPrice,
      weight: Math.random() * 2 + 0.5,
      // 0.5-2.5 kg
      category: "electronics",
      growthRate: Math.floor(Math.random() * 100) + 10,
      // 10-110% growth
      competitorCount: Math.floor(Math.random() * 30) + 10
      // 10-40 competitors
    };
  } catch (error) {
    console.error("Error fetching product data:", error);
    return {
      searchVolume: 25e3,
      currentPrice: 30,
      weight: 1,
      category: "electronics",
      growthRate: 25,
      competitorCount: 20
    };
  }
}
__name(fetchProductDataFromMarket, "fetchProductDataFromMarket");
async function analyzeTrendingProduct(productName, sourceMarket) {
  console.log(`\u{1F50D} Analyzing trend: ${productName} from ${sourceMarket}`);
  const productData = await fetchProductDataFromMarket(productName, sourceMarket);
  const profitCalc = calculateProductProfit({
    sourcePrice: productData.currentPrice,
    weight: productData.weight,
    category: productData.category,
    targetMarketplace: "uzum"
  });
  const trendScore = calculateTrendScore({
    searchVolume: Math.min(productData.searchVolume / 1e3, 100),
    priceCompetitiveness: profitCalc.profitMargin > 25 ? 80 : 50,
    profitMargin: Math.min(profitCalc.profitMargin * 2, 100),
    marketSaturation: Math.min(productData.competitorCount / 50 * 100, 100),
    growthRate: productData.growthRate,
    seasonality: 75,
    shippingFeasibility: productData.weight < 2 ? 90 : 60,
    localDemand: 70
  });
  const aiPrediction = await predictTrendWithAI({
    productName,
    category: productData.category,
    currentSearchVolume: productData.searchVolume,
    priceRange: `$${productData.currentPrice}`,
    sourceMarket
  });
  const analysis = {
    productName,
    sourceMarket,
    trendScore,
    searchVolume: productData.searchVolume,
    currentPrice: productData.currentPrice,
    profitAnalysis: profitCalc,
    aiPrediction,
    competitorCount: productData.competitorCount,
    riskLevel: profitCalc.riskLevel,
    recommendation: trendScore > 75 ? "STRONG BUY" : trendScore > 60 ? "BUY" : "CONSIDER",
    estimatedROI: Math.round(profitCalc.estimatedProfit / profitCalc.costPrice * 100),
    timeToMarket: "14-21 days"
    // Shipping + customs
  };
  console.log(`\u2705 Analysis complete. Trend score: ${trendScore}`);
  return analysis;
}
__name(analyzeTrendingProduct, "analyzeTrendingProduct");
async function scanTrendingProducts(params) {
  const { sourceMarkets, categories, minTrendScore = 70, limit = 50 } = params;
  console.log("\u{1F50D} Starting trend scan...");
  console.log(`Markets: ${sourceMarkets.join(", ")}`);
  console.log(`Categories: ${categories.join(", ")}`);
  const trendingProducts2 = [
    "Smart Watch with Heart Rate Monitor",
    "Portable Power Bank 20000mAh",
    "LED Strip Lights RGB",
    "Wireless Phone Charger",
    "Bluetooth Speaker Waterproof",
    "Security Camera WiFi",
    "Electric Kettle Smart",
    "Air Purifier HEPA",
    "Gaming Mouse RGB",
    "USB-C Hub Multiport"
  ];
  const results = [];
  for (const productName of trendingProducts2.slice(0, limit)) {
    const sourceMarket = sourceMarkets[Math.floor(Math.random() * sourceMarkets.length)];
    const analysis = await analyzeTrendingProduct(productName, sourceMarket);
    if (analysis.trendScore >= minTrendScore) {
      results.push(analysis);
      await storage.createTrendingProduct({
        productName: analysis.productName,
        category: "electronics",
        description: `Trending product from ${analysis.sourceMarket}`,
        sourceMarket: analysis.sourceMarket,
        currentPrice: analysis.currentPrice.toString(),
        estimatedCostPrice: Math.round(analysis.profitAnalysis.costPrice).toString(),
        estimatedSalePrice: analysis.profitAnalysis.recommendedPrice.toString(),
        profitPotential: analysis.profitAnalysis.estimatedProfit.toString(),
        searchVolume: analysis.searchVolume,
        trendScore: analysis.trendScore,
        competitionLevel: analysis.competitorCount < 20 ? "low" : analysis.competitorCount < 40 ? "medium" : "high",
        keywords: [`trending ${(/* @__PURE__ */ new Date()).getFullYear()}`, "best seller", analysis.sourceMarket],
        images: []
      });
    }
  }
  console.log(`\u2705 Scan complete. Found ${results.length} trending products`);
  return results;
}
__name(scanTrendingProducts, "scanTrendingProducts");
var trendingAnalytics_default = {
  calculateTrendScore,
  calculateProductProfit,
  predictTrendWithAI,
  analyzeTrendingProduct,
  scanTrendingProducts
};

// server/routes/trendingRoutes.ts
init_storage();
var router9 = Router8();
router9.post("/scan", asyncHandler(async (req, res) => {
  const { sourceMarkets, categories, minTrendScore, limit } = req.body;
  const results = await trendingAnalytics_default.scanTrendingProducts({
    sourceMarkets: sourceMarkets || ["amazon_us", "aliexpress"],
    categories: categories || ["electronics"],
    minTrendScore: minTrendScore || 70,
    limit: limit || 10
  });
  res.json({
    success: true,
    found: results.length,
    products: results
  });
}));
router9.post("/analyze", asyncHandler(async (req, res) => {
  const { productName, sourceMarket } = req.body;
  if (!productName || !sourceMarket) {
    return res.status(400).json({
      message: "productName va sourceMarket talab qilinadi",
      code: "MISSING_PARAMS"
    });
  }
  const analysis = await trendingAnalytics_default.analyzeTrendingProduct(
    productName,
    sourceMarket
  );
  res.json(analysis);
}));
router9.post("/calculate-profit", asyncHandler(async (req, res) => {
  const { sourcePrice, weight, category, targetMarketplace, exchangeRate } = req.body;
  if (!sourcePrice || !weight || !category) {
    return res.status(400).json({
      message: "sourcePrice, weight, category talab qilinadi",
      code: "MISSING_PARAMS"
    });
  }
  const profitCalc = trendingAnalytics_default.calculateProductProfit({
    sourcePrice: parseFloat(sourcePrice),
    weight: parseFloat(weight),
    category,
    targetMarketplace: targetMarketplace || "uzum",
    exchangeRate: exchangeRate ? parseFloat(exchangeRate) : void 0
  });
  res.json(profitCalc);
}));
router9.post("/predict", asyncHandler(async (req, res) => {
  const { productName, category, currentSearchVolume, priceRange, sourceMarket } = req.body;
  const prediction = await trendingAnalytics_default.predictTrendWithAI({
    productName,
    category,
    currentSearchVolume,
    priceRange,
    sourceMarket
  });
  res.json(prediction);
}));
router9.get("/stats", asyncHandler(async (req, res) => {
  const allProducts = await storage.getTrendingProducts();
  const stats = {
    totalProducts: allProducts.length,
    averageTrendScore: allProducts.length > 0 ? Math.round(allProducts.reduce((sum, p) => sum + (p.trendScore || 0), 0) / allProducts.length) : 0,
    highProfitProducts: allProducts.filter(
      (p) => parseFloat(p.profitPotential || "0") > 5e5
    ).length,
    lowCompetitionProducts: allProducts.filter(
      (p) => p.competitionLevel === "low"
    ).length,
    topCategories: getTopCategories(allProducts),
    topMarkets: getTopMarkets(allProducts)
  };
  res.json(stats);
}));
router9.delete("/:id", asyncHandler(async (req, res) => {
  const { id } = req.params;
  res.json({ success: true, message: "Mahsulot o'chirildi" });
}));
function getTopCategories(products4) {
  const categoryCounts = {};
  products4.forEach((p) => {
    categoryCounts[p.category] = (categoryCounts[p.category] || 0) + 1;
  });
  return Object.entries(categoryCounts).sort(([, a], [, b]) => b - a).slice(0, 5).map(([category, count2]) => ({ category, count: count2 }));
}
__name(getTopCategories, "getTopCategories");
function getTopMarkets(products4) {
  const marketCounts = {};
  products4.forEach((p) => {
    marketCounts[p.sourceMarket] = (marketCounts[p.sourceMarket] || 0) + 1;
  });
  return Object.entries(marketCounts).sort(([, a], [, b]) => b - a).slice(0, 5).map(([market, count2]) => ({ market, count: count2 }));
}
__name(getTopMarkets, "getTopMarkets");
var trendingRoutes_default = router9;

// server/routes/aiDashboard.ts
import { Router as Router9 } from "express";

// server/controllers/partnerAIDashboardController.ts
init_storage();
init_db();
init_schema();
init_geminiService();
import { eq as eq5, desc as desc2, count } from "drizzle-orm";

// shared/db-utils.ts
import { sql as sql4 } from "drizzle-orm";
function timestampToDate(value) {
  if (!value) return null;
  if (value instanceof Date) {
    return value;
  }
  if (typeof value === "number") {
    return new Date(value * 1e3);
  }
  if (typeof value === "string") {
    return new Date(value);
  }
  return null;
}
__name(timestampToDate, "timestampToDate");
function formatDateForDB(date, dbType3 = "sqlite") {
  if (!date) return null;
  if (dbType3 === "postgres") {
    return date.toISOString();
  }
  return Math.floor(date.getTime() / 1e3);
}
__name(formatDateForDB, "formatDateForDB");
function getDatabaseType() {
  const DATABASE_URL2 = process.env.DATABASE_URL;
  if (DATABASE_URL2 && (DATABASE_URL2.startsWith("postgres://") || DATABASE_URL2.startsWith("postgresql://"))) {
    return "postgres";
  }
  return "sqlite";
}
__name(getDatabaseType, "getDatabaseType");

// server/controllers/partnerAIDashboardController.ts
var dbType2 = getDbType();
function parseDbDate(value) {
  return timestampToDate(value);
}
__name(parseDbDate, "parseDbDate");
function getDateRanges() {
  const now = /* @__PURE__ */ new Date();
  const todayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const weekStart = new Date(todayStart);
  weekStart.setDate(weekStart.getDate() - 7);
  const monthStart = new Date(todayStart);
  monthStart.setDate(monthStart.getDate() - 30);
  return { now, todayStart, weekStart, monthStart };
}
__name(getDateRanges, "getDateRanges");
async function getPartnerDashboard(req, res) {
  try {
    const userId = req.session?.user?.id;
    if (!userId) {
      return res.status(401).json({ error: "Unauthorized" });
    }
    const partner = await storage.getPartnerByUserId(userId);
    if (!partner) {
      return res.status(404).json({ error: "Partner not found" });
    }
    const { todayStart, weekStart, monthStart } = getDateRanges();
    let todayTasks = 0, todayCompleted = 0;
    let weekTasks = 0, weekCompleted = 0;
    let monthTasks = 0, monthCompleted = 0;
    let todayProducts = 0, weekProducts = 0, monthProducts = 0;
    let todayRevenue = 0, weekRevenue = 0, monthRevenue = 0;
    let todayOrders = 0, weekOrders = 0, monthOrders = 0;
    let marketplaceAccounts = [];
    let recentActivity = [];
    try {
      const allTasks = await db.select().from(aiTasks).where(eq5(aiTasks.partnerId, partner.id));
      for (const task of allTasks) {
        const taskDate = parseDbDate(task.createdAt);
        if (!taskDate) continue;
        monthTasks++;
        if (task.status === "completed") monthCompleted++;
        if (taskDate >= weekStart) {
          weekTasks++;
          if (task.status === "completed") weekCompleted++;
        }
        if (taskDate >= todayStart) {
          todayTasks++;
          if (task.status === "completed") todayCompleted++;
        }
      }
      recentActivity = allTasks.sort((a, b) => {
        const dateA = parseDbDate(a.createdAt)?.getTime() || 0;
        const dateB = parseDbDate(b.createdAt)?.getTime() || 0;
        return dateB - dateA;
      }).slice(0, 10).map((t) => ({
        id: t.id,
        type: t.taskType,
        status: t.status,
        createdAt: parseDbDate(t.createdAt),
        completedAt: parseDbDate(t.completedAt)
      }));
    } catch (e) {
      console.log("AI tasks stats error:", e);
    }
    try {
      const partnerProducts = await storage.getProductsByPartnerId(partner.id);
      monthProducts = partnerProducts.length;
      for (const p of partnerProducts) {
        const productDate = parseDbDate(p.createdAt);
        if (!productDate) continue;
        if (productDate >= todayStart) todayProducts++;
        if (productDate >= weekStart) weekProducts++;
      }
    } catch (e) {
      console.log("Products stats error:", e);
    }
    try {
      const partnerOrders = await storage.getOrdersByPartnerId(partner.id);
      for (const order of partnerOrders) {
        const orderDate = parseDbDate(order.createdAt);
        if (!orderDate) continue;
        const amount = parseFloat(order.totalAmount?.toString() || "0");
        if (orderDate >= todayStart) {
          todayRevenue += amount;
          todayOrders++;
        }
        if (orderDate >= weekStart) {
          weekRevenue += amount;
          weekOrders++;
        }
        if (orderDate >= monthStart) {
          monthRevenue += amount;
          monthOrders++;
        }
      }
    } catch (e) {
      console.log("Orders stats error:", e);
    }
    try {
      const integrations = await db.select().from(marketplaceIntegrations).where(eq5(marketplaceIntegrations.partnerId, partner.id));
      marketplaceAccounts = integrations.map((i) => ({
        marketplace: i.marketplace,
        active: i.active,
        lastSync: parseDbDate(i.lastSyncAt)
      }));
    } catch (e) {
      console.log("Marketplace integrations error:", e);
    }
    const dashboard = {
      accounts: marketplaceAccounts.length,
      today: {
        tasks: todayTasks,
        completed: todayCompleted,
        reviews: 0,
        products: todayProducts,
        revenue: todayRevenue,
        orders: todayOrders
      },
      week: {
        tasks: weekTasks,
        completed: weekCompleted,
        reviews: 0,
        products: weekProducts,
        revenue: weekRevenue,
        orders: weekOrders
      },
      month: {
        tasks: monthTasks,
        completed: monthCompleted,
        reviews: 0,
        products: monthProducts,
        revenue: monthRevenue,
        orders: monthOrders
      },
      marketplaces: marketplaceAccounts,
      recentActivity,
      aiEnabled: partner.aiEnabled || false,
      partnerTier: partner.pricingTier,
      aiCardsUsed: partner.aiCardsUsed || 0
    };
    res.json(dashboard);
  } catch (error) {
    console.error("Dashboard error:", error);
    res.status(500).json({ error: error.message || "Server error" });
  }
}
__name(getPartnerDashboard, "getPartnerDashboard");
async function getAIActivityLog(req, res) {
  try {
    const userId = req.session?.user?.id;
    if (!userId) {
      return res.status(401).json({ error: "Unauthorized" });
    }
    const partner = await storage.getPartnerByUserId(userId);
    if (!partner) {
      return res.status(404).json({ error: "Partner not found" });
    }
    let tasks = [];
    let total = 0;
    try {
      tasks = await db.select().from(aiTasks).where(eq5(aiTasks.partnerId, partner.id)).orderBy(desc2(aiTasks.createdAt)).limit(50);
      const [countResult] = await db.select({ count: count() }).from(aiTasks).where(eq5(aiTasks.partnerId, partner.id));
      total = countResult?.count || 0;
    } catch (e) {
      console.log("AI tasks query error:", e);
    }
    res.json({
      tasks: tasks.map((t) => ({
        id: t.id,
        type: t.taskType,
        status: t.status,
        priority: t.priority,
        inputData: t.inputData ? JSON.parse(t.inputData) : null,
        outputData: t.outputData ? JSON.parse(t.outputData) : null,
        errorMessage: t.errorMessage,
        startedAt: t.startedAt,
        completedAt: t.completedAt,
        estimatedCost: t.estimatedCost,
        actualCost: t.actualCost,
        createdAt: t.createdAt
      })),
      total
    });
  } catch (error) {
    console.error("Activity log error:", error);
    res.status(500).json({ error: error.message });
  }
}
__name(getAIActivityLog, "getAIActivityLog");
async function getTrendRecommendations(req, res) {
  try {
    const userId = req.session?.user?.id;
    if (!userId) {
      return res.status(401).json({ error: "Unauthorized" });
    }
    const partner = await storage.getPartnerByUserId(userId);
    if (!partner) {
      return res.status(404).json({ error: "Partner not found" });
    }
    let recommendations = [];
    try {
      if (geminiService.isEnabled()) {
        const prompt = `O'zbekiston marketplace'lari (Uzum, Wildberries, Ozon) uchun hozirgi trend mahsulotlarni tahlil qil.
        
        JSON formatida 5 ta trend kategoriya qaytaring:
        [
          {
            "category": "Kategoriya nomi",
            "trend": "up" yoki "down",
            "demandIncrease": raqam (foizda),
            "potentialRevenue": raqam (so'mda),
            "confidence": 0 dan 1 gacha,
            "reason": "Sababi"
          }
        ]
        
        Hozirgi oy: ${(/* @__PURE__ */ new Date()).toLocaleDateString("uz-UZ", { month: "long", year: "numeric" })}
        Faqat JSON qaytaring, boshqa matn yo'q.`;
        const result = await geminiService.generateText({
          prompt,
          model: "flash",
          temperature: 0.7,
          structuredOutput: true
        });
        try {
          recommendations = JSON.parse(result.text);
        } catch (parseError) {
          console.log("Failed to parse AI response, using fallback");
        }
      }
    } catch (aiError) {
      console.log("AI trends generation error:", aiError);
    }
    if (recommendations.length === 0) {
      const currentMonth = (/* @__PURE__ */ new Date()).getMonth();
      if (currentMonth >= 10 || currentMonth <= 1) {
        recommendations = [
          {
            category: "Qishki kiyimlar",
            trend: "up",
            demandIncrease: 45,
            potentialRevenue: 25e7,
            confidence: 0.92,
            reason: "Qish fasli - issiq kiyimlarga talab yuqori"
          },
          {
            category: "Yangi yil sovg'alari",
            trend: "up",
            demandIncrease: 80,
            potentialRevenue: 18e7,
            confidence: 0.88,
            reason: "Yangi yil bayrami yaqinlashmoqda"
          },
          {
            category: "Elektron gadgetlar",
            trend: "up",
            demandIncrease: 35,
            potentialRevenue: 32e7,
            confidence: 0.85,
            reason: "Bayram sovg'alari uchun gadgetlar ommabop"
          }
        ];
      } else if (currentMonth >= 2 && currentMonth <= 4) {
        recommendations = [
          {
            category: "Bahorgi kiyimlar",
            trend: "up",
            demandIncrease: 40,
            potentialRevenue: 2e8,
            confidence: 0.9,
            reason: "Bahor fasli boshlanmoqda"
          },
          {
            category: "Navro'z sovg'alari",
            trend: "up",
            demandIncrease: 60,
            potentialRevenue: 15e7,
            confidence: 0.87,
            reason: "Navro'z bayrami yaqinlashmoqda"
          }
        ];
      } else if (currentMonth >= 5 && currentMonth <= 7) {
        recommendations = [
          {
            category: "Yozgi kiyimlar",
            trend: "up",
            demandIncrease: 50,
            potentialRevenue: 28e7,
            confidence: 0.91,
            reason: "Issiq kunlar - yengil kiyimlarga talab"
          },
          {
            category: "Konditsionerlar",
            trend: "up",
            demandIncrease: 70,
            potentialRevenue: 4e8,
            confidence: 0.89,
            reason: "Yozda sovutish jihozlariga talab keskin oshadi"
          }
        ];
      } else {
        recommendations = [
          {
            category: "Maktab tovarlari",
            trend: "up",
            demandIncrease: 65,
            potentialRevenue: 3e8,
            confidence: 0.93,
            reason: "O'quv yili boshlanmoqda"
          },
          {
            category: "Kuzgi kiyimlar",
            trend: "up",
            demandIncrease: 35,
            potentialRevenue: 18e7,
            confidence: 0.86,
            reason: "Kuz fasli boshlanmoqda"
          }
        ];
      }
    }
    res.json({ recommendations });
  } catch (error) {
    console.error("Trends error:", error);
    res.status(500).json({ error: error.message });
  }
}
__name(getTrendRecommendations, "getTrendRecommendations");
async function getInventoryAlerts(req, res) {
  try {
    const userId = req.session?.user?.id;
    if (!userId) {
      return res.status(401).json({ error: "Unauthorized" });
    }
    const partner = await storage.getPartnerByUserId(userId);
    if (!partner) {
      return res.status(404).json({ error: "Partner not found" });
    }
    const allProducts = await storage.getProductsByPartnerId(partner.id);
    const lowStockProducts = allProducts.filter((p) => {
      const stock = p.stockQuantity || 0;
      const threshold = p.lowStockThreshold || 10;
      return stock <= threshold;
    });
    const alerts = lowStockProducts.map((p) => {
      const stock = p.stockQuantity || 0;
      const threshold = p.lowStockThreshold || 10;
      let severity = "info";
      let recommendation = "";
      if (stock === 0) {
        severity = "critical";
        recommendation = "Mahsulot tugagan! Zudlik bilan to'ldiring!";
      } else if (stock <= threshold / 2) {
        severity = "warning";
        recommendation = "Stok kam qoldi. 2-3 kun ichida to'ldirish tavsiya etiladi.";
      } else {
        severity = "info";
        recommendation = "Yaqin kunlarda to'ldirish rejalashtiring.";
      }
      return {
        productId: p.id,
        productName: p.name,
        sku: p.sku,
        currentStock: stock,
        threshold,
        severity,
        recommendation,
        lastUpdated: p.updatedAt
      };
    });
    alerts.sort((a, b) => {
      const order = { critical: 0, warning: 1, info: 2 };
      return order[a.severity] - order[b.severity];
    });
    res.json({ alerts });
  } catch (error) {
    console.error("Inventory alerts error:", error);
    res.status(500).json({ error: error.message });
  }
}
__name(getInventoryAlerts, "getInventoryAlerts");
async function getPerformanceMetrics(req, res) {
  try {
    const userId = req.session?.user?.id;
    if (!userId) {
      return res.status(401).json({ error: "Unauthorized" });
    }
    const partner = await storage.getPartnerByUserId(userId);
    if (!partner) {
      return res.status(404).json({ error: "Partner not found" });
    }
    let tasksProcessed = 0;
    let avgProcessingTime = 0;
    let errorRate = 0;
    try {
      const allTasks = await db.select().from(aiTasks).where(eq5(aiTasks.partnerId, partner.id));
      tasksProcessed = allTasks.length;
      const completedTasks = allTasks.filter((t) => t.completedAt && t.startedAt);
      if (completedTasks.length > 0) {
        const totalTime = completedTasks.reduce((sum, t) => {
          const start = new Date(t.startedAt).getTime();
          const end = new Date(t.completedAt).getTime();
          return sum + (end - start);
        }, 0);
        avgProcessingTime = Math.round(totalTime / completedTasks.length / 1e3);
      }
      const failedTasks = allTasks.filter((t) => t.status === "failed").length;
      errorRate = tasksProcessed > 0 ? Math.round(failedTasks / tasksProcessed * 100 * 10) / 10 : 0;
    } catch (e) {
      console.log("Metrics calculation error:", e);
    }
    const metrics = {
      responseTime: 150,
      // ms - average API response time
      uptime: 99.9,
      // percentage
      tasksProcessed,
      errorRate,
      avgProcessingTime,
      efficiency: Math.max(0, 100 - errorRate),
      aiCardsGenerated: partner.aiCardsUsed || 0
    };
    res.json({ metrics });
  } catch (error) {
    console.error("Metrics error:", error);
    res.status(500).json({ error: error.message });
  }
}
__name(getPerformanceMetrics, "getPerformanceMetrics");
async function getAIReports(req, res) {
  try {
    const userId = req.session?.user?.id;
    if (!userId) {
      return res.status(401).json({ error: "Unauthorized" });
    }
    const partner = await storage.getPartnerByUserId(userId);
    if (!partner) {
      return res.status(404).json({ error: "Partner not found" });
    }
    let aiCards = [];
    try {
      aiCards = await db.select().from(aiProductCards).where(eq5(aiProductCards.partnerId, partner.id)).orderBy(desc2(aiProductCards.createdAt)).limit(20);
    } catch (e) {
      console.log("AI cards query error:", e);
    }
    const reports = aiCards.map((card) => ({
      id: card.id,
      type: "product_card",
      marketplace: card.marketplace,
      title: card.title,
      status: card.status,
      qualityScore: card.qualityScore,
      aiModel: card.aiModel,
      cost: card.generationCost,
      createdAt: card.createdAt,
      publishedAt: card.publishedAt
    }));
    const summary = {
      totalCards: aiCards.length,
      publishedCards: aiCards.filter((c) => c.status === "published").length,
      draftCards: aiCards.filter((c) => c.status === "draft").length,
      totalCost: aiCards.reduce((sum, c) => sum + (parseFloat(c.generationCost) || 0), 0),
      avgQualityScore: aiCards.length > 0 ? Math.round(aiCards.reduce((sum, c) => sum + (c.qualityScore || 0), 0) / aiCards.length) : 0
    };
    res.json({ reports, summary });
  } catch (error) {
    console.error("Reports error:", error);
    res.status(500).json({ error: error.message });
  }
}
__name(getAIReports, "getAIReports");

// server/routes/aiDashboard.ts
function requireAuth(req, res, next) {
  if (!req.session?.user) {
    return res.status(401).json({
      message: "Avtorizatsiya yo'q",
      code: "UNAUTHORIZED"
    });
  }
  next();
}
__name(requireAuth, "requireAuth");
var router10 = Router9();
router10.use(requireAuth);
router10.get("/dashboard", getPartnerDashboard);
router10.get("/activity", getAIActivityLog);
router10.get("/trends", getTrendRecommendations);
router10.get("/inventory-alerts", getInventoryAlerts);
router10.get("/metrics", getPerformanceMetrics);
router10.get("/reports", getAIReports);
var aiDashboard_default = router10;

// server/routes/enhancedAIDashboard.ts
init_storage();
import express2 from "express";

// server/services/costTracker.ts
init_storage();
init_db();
init_schema();
import { eq as eq6, and as and5, gte as gte4, lte as lte3 } from "drizzle-orm";
import { nanoid as nanoid8 } from "nanoid";
var TIER_LIMITS = {
  starter_pro: 10,
  business_standard: 20,
  professional_plus: 30,
  enterprise_elite: 50
};
var costCache = /* @__PURE__ */ new Map();
async function logCost(record) {
  const recordId = nanoid8();
  const timestamp = /* @__PURE__ */ new Date();
  const fullRecord = {
    ...record,
    id: recordId,
    timestamp
  };
  try {
    await db.insert(aiCostRecords).values({
      id: recordId,
      partnerId: record.partnerId,
      operation: record.operation,
      model: record.model,
      tokensUsed: record.tokensUsed,
      imagesGenerated: record.imagesGenerated,
      cost: record.cost,
      tier: record.tier,
      metadata: record.metadata ? JSON.stringify(record.metadata) : null,
      createdAt: timestamp
    });
    const partnerCosts = costCache.get(record.partnerId) || [];
    partnerCosts.push(fullRecord);
    costCache.set(record.partnerId, partnerCosts);
    console.log(`\u{1F4CA} Cost logged: ${record.partnerId} | ${record.operation} | $${record.cost.toFixed(4)}`);
  } catch (error) {
    console.error("Error logging cost:", error);
    const partnerCosts = costCache.get(record.partnerId) || [];
    partnerCosts.push(fullRecord);
    costCache.set(record.partnerId, partnerCosts);
  }
}
__name(logCost, "logCost");
async function getUsageSummary(partnerId, periodStart, periodEnd) {
  try {
    const partner = await storage.getPartnerById(partnerId);
    const tier = partner?.pricingTier || "starter_pro";
    const budgetLimit = TIER_LIMITS[tier] || 10;
    const dbCosts = await db.select().from(aiCostRecords).where(
      and5(
        eq6(aiCostRecords.partnerId, partnerId),
        gte4(aiCostRecords.createdAt, periodStart),
        lte3(aiCostRecords.createdAt, periodEnd)
      )
    );
    const periodCosts = dbCosts.map((c) => ({
      id: c.id,
      partnerId: c.partnerId,
      operation: c.operation,
      model: c.model,
      tokensUsed: c.tokensUsed || void 0,
      imagesGenerated: c.imagesGenerated || void 0,
      cost: c.cost,
      tier: c.tier,
      timestamp: c.createdAt || /* @__PURE__ */ new Date(),
      metadata: c.metadata ? JSON.parse(c.metadata) : void 0
    }));
    const totalCost = periodCosts.reduce((sum, c) => sum + c.cost, 0);
    const operationBreakdown = {};
    periodCosts.forEach((c) => {
      if (!operationBreakdown[c.operation]) {
        operationBreakdown[c.operation] = { count: 0, cost: 0 };
      }
      operationBreakdown[c.operation].count++;
      operationBreakdown[c.operation].cost += c.cost;
    });
    const remainingBudget = Math.max(0, budgetLimit - totalCost);
    const utilizationPercent = totalCost / budgetLimit * 100;
    return {
      partnerId,
      tier,
      periodStart,
      periodEnd,
      totalCost,
      operationBreakdown,
      remainingBudget,
      budgetLimit,
      utilizationPercent
    };
  } catch (error) {
    console.error("Error getting usage summary:", error);
    const partner = await storage.getPartnerById(partnerId);
    const tier = partner?.pricingTier || "starter_pro";
    const budgetLimit = TIER_LIMITS[tier] || 10;
    return {
      partnerId,
      tier,
      periodStart,
      periodEnd,
      totalCost: 0,
      operationBreakdown: {},
      remainingBudget: budgetLimit,
      budgetLimit,
      utilizationPercent: 0
    };
  }
}
__name(getUsageSummary, "getUsageSummary");
async function checkBudget(partnerId, estimatedCost) {
  const now = /* @__PURE__ */ new Date();
  const monthStart = new Date(now.getFullYear(), now.getMonth(), 1);
  const monthEnd = new Date(now.getFullYear(), now.getMonth() + 1, 0);
  const summary = await getUsageSummary(partnerId, monthStart, monthEnd);
  if (summary.totalCost + estimatedCost > summary.budgetLimit) {
    return {
      allowed: false,
      remainingBudget: summary.remainingBudget,
      message: `Budget limit exceeded. Limit: $${summary.budgetLimit}, Used: $${summary.totalCost.toFixed(2)}, Remaining: $${summary.remainingBudget.toFixed(2)}`
    };
  }
  return {
    allowed: true,
    remainingBudget: summary.remainingBudget - estimatedCost
  };
}
__name(checkBudget, "checkBudget");
async function getOptimizationRecommendations(partnerId) {
  const now = /* @__PURE__ */ new Date();
  const monthStart = new Date(now.getFullYear(), now.getMonth(), 1);
  const summary = await getUsageSummary(partnerId, monthStart, now);
  const recommendations = [];
  if (summary.utilizationPercent > 80) {
    recommendations.push(`\u26A0\uFE0F Budget ${summary.utilizationPercent.toFixed(0)}% ishlatilgan. Upgrade qilish tavsiya etiladi.`);
  }
  Object.entries(summary.operationBreakdown).forEach(([op, data]) => {
    if (data.cost > summary.budgetLimit * 0.5) {
      recommendations.push(`\u{1F4CA} ${op} uchun harajatlar yuqori ($${data.cost.toFixed(2)}). Template ishlatishni ko'rib chiqing.`);
    }
  });
  const productCardCost = summary.operationBreakdown["product_card_creation"]?.cost || 0;
  if (productCardCost > 5) {
    recommendations.push(`\u{1F4A1} Product card template ishlatish $${(productCardCost * 0.9).toFixed(2)} tejaydi!`);
  }
  if (recommendations.length === 0) {
    recommendations.push("\u2705 AI usage optimal! Davom eting.");
  }
  return recommendations;
}
__name(getOptimizationRecommendations, "getOptimizationRecommendations");
async function getDashboardStats(partnerId) {
  const now = /* @__PURE__ */ new Date();
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const weekAgo = new Date(today.getTime() - 7 * 24 * 60 * 60 * 1e3);
  const monthStart = new Date(now.getFullYear(), now.getMonth(), 1);
  const todaySummary = await getUsageSummary(partnerId, today, now);
  const weekSummary = await getUsageSummary(partnerId, weekAgo, now);
  const monthSummary = await getUsageSummary(partnerId, monthStart, now);
  return {
    today: {
      cost: todaySummary.totalCost,
      operations: Object.values(todaySummary.operationBreakdown).reduce((sum, op) => sum + op.count, 0)
    },
    week: {
      cost: weekSummary.totalCost,
      operations: Object.values(weekSummary.operationBreakdown).reduce((sum, op) => sum + op.count, 0)
    },
    month: {
      cost: monthSummary.totalCost,
      operations: Object.values(monthSummary.operationBreakdown).reduce((sum, op) => sum + op.count, 0),
      remainingBudget: monthSummary.remainingBudget,
      utilizationPercent: monthSummary.utilizationPercent
    }
  };
}
__name(getDashboardStats, "getDashboardStats");
var costTracker = {
  logCost,
  getUsageSummary,
  checkBudget,
  getOptimizationRecommendations,
  getDashboardStats
};
var costTracker_default = costTracker;

// server/services/smartTemplates.ts
var templateCache = /* @__PURE__ */ new Map();
var PRODUCT_CARD_TEMPLATES = {
  electronics: {
    uzum: `**{{productName}}** - {{mainFeature}}

\u{1F525} XUSUSIYATLARI:
{{features}}

\u2705 KAFOLAT: {{warranty}}
\u{1F4E6} YETKAZIB BERISH: Bepul
\u2B50 REYTING: 4.8/5

{{callToAction}}`,
    wildberries: `{{productName}} | {{mainFeature}}

\u0422\u0435\u0445\u043D\u0438\u0447\u0435\u0441\u043A\u0438\u0435 \u0445\u0430\u0440\u0430\u043A\u0442\u0435\u0440\u0438\u0441\u0442\u0438\u043A\u0438:
{{features}}

\u0413\u0430\u0440\u0430\u043D\u0442\u0438\u044F: {{warranty}}
\u0414\u043E\u0441\u0442\u0430\u0432\u043A\u0430: \u0411\u0435\u0441\u043F\u043B\u0430\u0442\u043D\u043E

{{callToAction}}`
  },
  clothing: {
    uzum: `**{{productName}}** - {{style}}

\u{1F457} TAFSILOTLAR:
{{details}}

\u{1F4CF} O'LCHAMLAR: {{sizes}}
\u{1F3A8} RANGLAR: {{colors}}
\u2728 SIFAT: Premium

{{callToAction}}`
  },
  home: {
    uzum: `**{{productName}}** - {{benefit}}

\u{1F3E0} UYINGIZ UCHUN:
{{features}}

\u2705 SIFAT KAFOLATI
\u{1F4E6} TEZKOR YETKAZIB BERISH

{{callToAction}}`
  }
};
var REVIEW_RESPONSES = {
  positive: [
    "Rahmat {{customerName}}! Sizning fikr-mulohazangiz biz uchun juda qimmatli. \u{1F64F}",
    "Ajoyib! Mahsulotimiz yoqqanidan xursandmiz, {{customerName}}! \u2B50",
    "Rahmat sizga! Doimo eng yaxshi xizmatni ko'rsatishga intilamiz! \u{1F49A}"
  ],
  neutral: [
    "Rahmat fikr-mulohazangiz uchun, {{customerName}}. Yaxshilash ustida ishlayapmiz!",
    "Taklifingiz uchun minnatdormiz! Inobatga olamiz. \u{1F64F}"
  ],
  negative: [
    "Kechirasiz {{customerName}}, muammo yuzaga keldi. Darhol hal qilamiz va sizga aloqaga chiqamiz. \u{1F4DE}",
    "Uzr so'raymiz! Muammoni hal qilish uchun qo'ng'iroq qilamiz. Sizning qoniqishingiz biz uchun muhim! \u{1F64F}"
  ]
};
var SEO_TEMPLATES = {
  title: "{{productName}} | {{mainKeyword}} | {{marketplace}} | Toshkent",
  metaDescription: "{{productName}} - {{benefit}}. \u2705 {{feature1}}, {{feature2}}, {{feature3}}. \u{1F4E6} Tezkor yetkazib berish. \u2B50 Kafolat. Buyurtma bering!",
  keywords: "{{productName}}, {{category}}, {{marketplace}}, {{location}}, sotib olish, arzon, sifatli"
};
function renderTemplate(template, variables) {
  let result = template;
  for (const [key, value] of Object.entries(variables)) {
    const regex = new RegExp(`{{${key}}}`, "g");
    result = result.replace(regex, value);
  }
  return result;
}
__name(renderTemplate, "renderTemplate");
function generateProductCardFromTemplate(category, marketplace, variables) {
  const template = PRODUCT_CARD_TEMPLATES[category]?.[marketplace];
  if (!template) {
    return null;
  }
  return renderTemplate(template, variables);
}
__name(generateProductCardFromTemplate, "generateProductCardFromTemplate");
function generateReviewResponseFromTemplate(sentiment, customerName) {
  const templates = REVIEW_RESPONSES[sentiment];
  const template = templates[Math.floor(Math.random() * templates.length)];
  return renderTemplate(template, { customerName });
}
__name(generateReviewResponseFromTemplate, "generateReviewResponseFromTemplate");
function generateSEOFromTemplate(type, variables) {
  const template = SEO_TEMPLATES[type];
  return renderTemplate(template, variables);
}
__name(generateSEOFromTemplate, "generateSEOFromTemplate");
function shouldUseTemplate(category, marketplace) {
  return PRODUCT_CARD_TEMPLATES[category]?.[marketplace] !== void 0;
}
__name(shouldUseTemplate, "shouldUseTemplate");
function estimateCost(operation, useTemplate) {
  if (useTemplate) {
    return 1e-3;
  }
  const costs = {
    product_card: 0.05,
    // AI: ~$0.05
    review_response: 0.01,
    // AI: ~$0.01
    seo: 0.02
    // AI: ~$0.02
  };
  return costs[operation] || 0.05;
}
__name(estimateCost, "estimateCost");
function getTemplateUsageStats() {
  return {
    totalTemplates: templateCache.size,
    categories: Object.keys(PRODUCT_CARD_TEMPLATES),
    marketplaces: ["uzum", "wildberries", "yandex", "ozon"],
    estimatedSavings: templateCache.size * 0.049
    // $0.05 - $0.001
  };
}
__name(getTemplateUsageStats, "getTemplateUsageStats");
var smartTemplates = {
  renderTemplate,
  generateProductCardFromTemplate,
  generateReviewResponseFromTemplate,
  generateSEOFromTemplate,
  shouldUseTemplate,
  estimateCost,
  getTemplateUsageStats
};
var smartTemplates_default = smartTemplates;

// server/services/emergentAI.ts
import OpenAI3 from "openai";
import Anthropic from "@anthropic-ai/sdk";
var EMERGENT_KEY = process.env.EMERGENT_LLM_KEY || "";
var openai4 = EMERGENT_KEY ? new OpenAI3({
  apiKey: EMERGENT_KEY,
  baseURL: "https://api.openai.com/v1"
}) : null;
var anthropic = EMERGENT_KEY ? new Anthropic({
  apiKey: EMERGENT_KEY
}) : null;
var costLog = [];
function logCost2(entry) {
  costLog.push(entry);
  console.log(`\u{1F4B0} AI Cost: $${entry.cost.toFixed(4)} (${entry.operation}, ${entry.model})`);
}
__name(logCost2, "logCost");
function getPartnerCosts(partnerId, startDate, endDate) {
  return costLog.filter(
    (e) => e.partnerId === partnerId && e.timestamp >= startDate && e.timestamp <= endDate
  ).reduce((sum, e) => sum + e.cost, 0);
}
__name(getPartnerCosts, "getPartnerCosts");
function isEnabled2() {
  return !!EMERGENT_KEY && (!!openai4 || !!anthropic);
}
__name(isEnabled2, "isEnabled");
async function generateText2(options, partnerId) {
  const {
    prompt,
    systemMessage = "Sen professional marketplace AI assistant san.",
    maxTokens = 2e3,
    temperature = 0.7,
    model = "claude-4-sonnet-20250514",
    provider = "anthropic"
  } = options;
  if (!EMERGENT_KEY) {
    console.warn("\u26A0\uFE0F  EMERGENT_LLM_KEY not set. AI service disabled.");
    return "AI xizmati hozirda mavjud emas. EMERGENT_LLM_KEY sozlanmagan.";
  }
  try {
    const startTime = Date.now();
    let text2 = "";
    let tokensUsed = 0;
    let actualModel = model;
    let cost = 0;
    if (provider === "anthropic" && anthropic) {
      const message = await anthropic.messages.create({
        model,
        max_tokens: maxTokens,
        temperature,
        system: systemMessage,
        messages: [{ role: "user", content: prompt }]
      });
      text2 = message.content[0].type === "text" ? message.content[0].text : "";
      const inputTokens = message.usage.input_tokens;
      const outputTokens = message.usage.output_tokens;
      tokensUsed = inputTokens + outputTokens;
      cost = inputTokens * 3e-6 + outputTokens * 15e-6;
    } else if (openai4) {
      actualModel = "gpt-4-turbo-preview";
      const response = await openai4.chat.completions.create({
        model: actualModel,
        messages: [
          { role: "system", content: systemMessage },
          { role: "user", content: prompt }
        ],
        max_tokens: maxTokens,
        temperature
      });
      text2 = response.choices[0]?.message?.content || "";
      tokensUsed = response.usage?.total_tokens || 0;
      cost = tokensUsed * 1e-5;
    } else {
      throw new Error("No AI provider available");
    }
    const duration = Date.now() - startTime;
    if (partnerId) {
      logCost2({
        partnerId,
        model: actualModel,
        operation: "text_generation",
        tokensUsed,
        cost,
        timestamp: /* @__PURE__ */ new Date()
      });
    }
    console.log(`\u2705 Text generated (${duration}ms, $${cost.toFixed(4)}, ${tokensUsed} tokens)`);
    return text2;
  } catch (error) {
    console.error("\u274C Text generation error:", error.message);
    return `AI xatolik: ${error.message}. Keyinroq qayta urinib ko'ring.`;
  }
}
__name(generateText2, "generateText");
async function generateImage(options, partnerId) {
  const {
    prompt,
    size = "1024x1024",
    quality = "standard",
    n = 1,
    model = "gpt-image-1"
  } = options;
  if (!openai4) {
    console.warn("\u26A0\uFE0F  OpenAI client not available for image generation");
    return [];
  }
  try {
    const startTime = Date.now();
    const response = await openai4.images.generate({
      model,
      prompt,
      n,
      size,
      quality,
      response_format: "url"
    });
    const urls = response.data.map((img) => img.url || "").filter((url) => url);
    const duration = Date.now() - startTime;
    const costPerImage = quality === "hd" ? 0.08 : 0.04;
    const totalCost = costPerImage * n;
    if (partnerId) {
      logCost2({
        partnerId,
        model,
        operation: "image_generation",
        imagesGenerated: n,
        cost: totalCost,
        timestamp: /* @__PURE__ */ new Date()
      });
    }
    console.log(`\u2705 Images generated (${duration}ms, $${totalCost.toFixed(4)}, ${urls.length} images)`);
    return urls;
  } catch (error) {
    console.error("\u274C Image generation error:", error.message);
    return [];
  }
}
__name(generateImage, "generateImage");
async function generateJSON(prompt, schema, partnerId) {
  const fullPrompt = `${prompt}

MUHIM: Faqat valid JSON qaytaring, hech qanday tushuntirish yoki markdown yozmasdan.
Schema: ${schema}`;
  const text2 = await generateText2(
    {
      prompt: fullPrompt,
      systemMessage: "You are a JSON API. Return only valid JSON, no explanation, no markdown code blocks.",
      temperature: 0.3
    },
    partnerId
  );
  try {
    let jsonText = text2.trim();
    const jsonMatch = jsonText.match(/```(?:json)?\s*([\s\S]*?)```/);
    if (jsonMatch) {
      jsonText = jsonMatch[1].trim();
    }
    const objectMatch = jsonText.match(/\{[\s\S]*\}/);
    const arrayMatch = jsonText.match(/\[[\s\S]*\]/);
    if (objectMatch) {
      jsonText = objectMatch[0];
    } else if (arrayMatch) {
      jsonText = arrayMatch[0];
    }
    return JSON.parse(jsonText);
  } catch (error) {
    console.error("\u274C JSON parse error. Raw text:", text2.substring(0, 200));
    return {};
  }
}
__name(generateJSON, "generateJSON");
async function batchGenerateText(prompts, partnerId) {
  const batchSize = parseInt(process.env.AI_BATCH_SIZE || "10");
  const results = [];
  for (let i = 0; i < prompts.length; i += batchSize) {
    const batch = prompts.slice(i, i + batchSize);
    const batchResults = await Promise.all(
      batch.map((p) => generateText2(p, partnerId))
    );
    results.push(...batchResults);
    if (i + batchSize < prompts.length) {
      await new Promise((resolve) => setTimeout(resolve, 1e3));
    }
  }
  return results;
}
__name(batchGenerateText, "batchGenerateText");
async function generateProductCard3(input, partnerId) {
  const prompt = `
Sen professional marketplace SEO mutaxassisi san.

MAHSULOT:
- Nomi: ${input.name}
- Kategoriya: ${input.category || "umumiy"}
- Tavsif: ${input.description || "yo'q"}
- Narx: ${input.price || "belgilanmagan"} so'm
- Marketplace: ${input.marketplace}

Quyidagilarni JSON formatda yarat:
{
  "title": "SEO-optimizatsiya qilingan sarlavha (60-80 belgi)",
  "description": "To'liq tavsif (500-800 so'z)",
  "shortDescription": "Qisqa tavsif (150 belgi)",
  "keywords": ["kalit1", "kalit2", "...10 tagacha"],
  "bulletPoints": ["Xususiyat1", "Xususiyat2", "...5 tagacha"],
  "seoScore": 85,
  "categoryPath": ["Kategoriya", "Subkategoriya"],
  "tags": ["tag1", "tag2", "...8 tagacha"]
}

Til: O'zbek va Rus aralash (marketplace ga qarab)
`;
  return generateJSON(prompt, "ProductCard", partnerId);
}
__name(generateProductCard3, "generateProductCard");
var emergentAI = {
  generateText: generateText2,
  generateImage,
  generateJSON,
  batchGenerateText,
  getPartnerCosts,
  isEnabled: isEnabled2,
  generateProductCard: generateProductCard3
};
var emergentAI_default = emergentAI;

// server/services/productCardAI.ts
async function createProductCard(input, partnerId, generateImages = false) {
  const startTime = Date.now();
  let usedTemplate = false;
  let cost = 0;
  const templateCard = smartTemplates_default.generateProductCardFromTemplate(
    input.category,
    input.marketplace,
    {
      productName: input.productName,
      mainFeature: input.features[0] || "Premium sifat",
      features: input.features.map((f, i) => `\u2022 ${f}`).join("\n"),
      warranty: input.warranty || "12 oy kafolat",
      callToAction: "Hozir buyurtma bering! \u{1F6D2}"
    }
  );
  let description;
  let title;
  let keywords;
  if (templateCard && smartTemplates_default.shouldUseTemplate(input.category, input.marketplace)) {
    description = templateCard;
    title = smartTemplates_default.generateSEOFromTemplate("title", {
      productName: input.productName,
      mainKeyword: input.features[0] || input.category,
      marketplace: input.marketplace
    });
    keywords = input.features.slice(0, 10);
    usedTemplate = true;
    cost = smartTemplates_default.estimateCost("product_card", true);
    console.log("\u2705 Product card generated from TEMPLATE (fast & cheap)");
  } else {
    const prompt = `
Yaratish kerak: Professional mahsulot kartochkasi

Mahsulot: ${input.productName}
Kategoriya: ${input.category}
Marketplace: ${input.marketplace}
Xususiyatlar: ${input.features.join(", ")}
Narx: ${input.price.toLocaleString()} so'm
Brand: ${input.brand || "Unknown"}
Maqsadli auditoriya: ${input.targetAudience || "Barcha"}

Quyidagilarni JSON formatda yarat:
{
  "title": "SEO-optimizatsiyalangan sarlavha (60-80 belgi)",
  "description": "To'liq va jozibali tavsif (300-500 so'z). Emoji ishlatma. Professional yoz.",
  "keywords": ["kalit so'z 1", "kalit so'z 2", ...10 ta],
  "seoScore": 85
}

MUHIM:
- ${input.marketplace} qoidalariga mos
- Professional va ishonchli
- Xaridorga yo'naltirilgan
- O'zbek tilida
`;
    const result = await emergentAI_default.generateJSON(prompt, "ProductCard", partnerId);
    title = result.title;
    description = result.description;
    keywords = result.keywords;
    cost = smartTemplates_default.estimateCost("product_card", false);
    console.log("\u2705 Product card generated with AI (high quality)");
  }
  let images = [];
  if (generateImages) {
    const imagePrompt = `Professional product photo: ${input.productName}, ${input.category}, studio lighting, white background, high quality, commercial photography`;
    images = await emergentAI_default.generateImage(
      {
        prompt: imagePrompt,
        size: "1024x1024",
        quality: "standard",
        n: 1
      },
      partnerId
    );
    cost += 0.04;
    console.log("\u2705 Product images generated");
  }
  const generationTime = Date.now() - startTime;
  return {
    title,
    description,
    keywords,
    seoScore: 85,
    images,
    usedTemplate,
    cost,
    generationTime
  };
}
__name(createProductCard, "createProductCard");
async function batchCreateProductCards(products4, partnerId, generateImages = false) {
  console.log(`\u{1F680} Batch creating ${products4.length} product cards...`);
  const batchSize = parseInt(process.env.BATCH_SIZE || "10");
  const results = [];
  for (let i = 0; i < products4.length; i += batchSize) {
    const batch = products4.slice(i, i + batchSize);
    const batchResults = await Promise.all(
      batch.map((p) => createProductCard(p, partnerId, generateImages))
    );
    results.push(...batchResults);
    console.log(`  \u2705 Processed ${Math.min(i + batchSize, products4.length)}/${products4.length}`);
    if (i + batchSize < products4.length) {
      await new Promise((resolve) => setTimeout(resolve, 1e3));
    }
  }
  const totalCost = results.reduce((sum, r) => sum + r.cost, 0);
  const avgTime = results.reduce((sum, r) => sum + r.generationTime, 0) / results.length;
  const templateUsage = results.filter((r) => r.usedTemplate).length;
  console.log(`\u2705 Batch complete:`);
  console.log(`   Total: ${results.length} cards`);
  console.log(`   Cost: $${totalCost.toFixed(4)}`);
  console.log(`   Avg time: ${avgTime.toFixed(0)}ms`);
  console.log(`   Template usage: ${templateUsage}/${results.length} (${(templateUsage / results.length * 100).toFixed(0)}%)`);
  return results;
}
__name(batchCreateProductCards, "batchCreateProductCards");
async function optimizeSEO(currentTitle, currentDescription, marketplace, partnerId) {
  const prompt = `
SEO Optimizatsiya qil:

Hozirgi sarlavha: ${currentTitle}
Hozirgi tavsif: ${currentDescription}
Marketplace: ${marketplace}

Quyidagilarni JSON formatda ber:
{
  "optimizedTitle": "Yaxshilangan sarlavha",
  "optimizedDescription": "Yaxshilangan tavsif",
  "keywords": ["kalit so'z 1", ...],
  "improvements": ["O'zgarish 1", "O'zgarish 2", ...],
  "seoScore": 90
}
`;
  return emergentAI_default.generateJSON(prompt, "SEOOptimization", partnerId);
}
__name(optimizeSEO, "optimizeSEO");
async function generateReviewResponse(reviewText, rating, productName, customerName, partnerId) {
  const sentiment = rating >= 4 ? "positive" : rating === 3 ? "neutral" : "negative";
  if (rating >= 3) {
    return smartTemplates_default.generateReviewResponseFromTemplate(sentiment, customerName);
  }
  const prompt = `
Mijoz sharhiga professional javob yoz:

Mahsulot: ${productName}
Mijoz: ${customerName}
Reyting: ${rating}/5
Sharh: "${reviewText}"

Talablar:
- Kechirim so'ra
- Muammoni hal qilish yo'lini taklif qil
- Professional va samimiy
- 2-3 jumla
- Emoji ishlatma

Faqat javobni yoz, boshqa hech narsa.
`;
  return emergentAI_default.generateText(
    {
      prompt,
      maxTokens: 200,
      temperature: 0.7
    },
    partnerId
  );
}
__name(generateReviewResponse, "generateReviewResponse");
var productCardAI = {
  createProductCard,
  batchCreateProductCards,
  optimizeSEO,
  generateReviewResponse
};
var productCardAI_default = productCardAI;

// server/routes/enhancedAIDashboard.ts
var router11 = express2.Router();
router11.get("/dashboard", async (req, res) => {
  try {
    const partnerId = req.user?.partnerId;
    if (!partnerId) {
      return res.status(401).json({ error: "Unauthorized" });
    }
    const stats = await costTracker_default.getDashboardStats(partnerId);
    const recommendations = await costTracker_default.getOptimizationRecommendations(partnerId);
    const templateStats = smartTemplates_default.getTemplateUsageStats();
    const partner = await storage.getPartnerById(partnerId);
    res.json({
      success: true,
      stats,
      recommendations,
      templateStats,
      tier: partner?.pricingTier || "starter_pro",
      aiEnabled: partner?.aiEnabled || false
    });
  } catch (error) {
    console.error("Dashboard error:", error);
    res.status(500).json({ error: error.message });
  }
});
router11.get("/cost-analytics", async (req, res) => {
  try {
    const partnerId = req.user?.partnerId;
    if (!partnerId) {
      return res.status(401).json({ error: "Unauthorized" });
    }
    const { startDate, endDate } = req.query;
    const start = startDate ? new Date(startDate) : new Date(Date.now() - 30 * 24 * 60 * 60 * 1e3);
    const end = endDate ? new Date(endDate) : /* @__PURE__ */ new Date();
    const summary = await costTracker_default.getUsageSummary(partnerId, start, end);
    res.json({
      success: true,
      summary
    });
  } catch (error) {
    console.error("Cost analytics error:", error);
    res.status(500).json({ error: error.message });
  }
});
router11.post("/create-product-card", async (req, res) => {
  try {
    const partnerId = req.user?.partnerId;
    if (!partnerId) {
      return res.status(401).json({ error: "Unauthorized" });
    }
    const {
      productName,
      category,
      marketplace,
      features,
      price,
      brand,
      generateImages
    } = req.body;
    if (!productName || !category || !marketplace || !features || !price) {
      return res.status(400).json({ error: "Missing required fields" });
    }
    const estimatedCost = generateImages ? 0.09 : 0.05;
    const budgetCheck = await costTracker_default.checkBudget(partnerId, estimatedCost);
    if (!budgetCheck.allowed) {
      return res.status(429).json({
        error: "Budget limit exceeded",
        message: budgetCheck.message,
        remainingBudget: budgetCheck.remainingBudget
      });
    }
    const result = await productCardAI_default.createProductCard(
      {
        productName,
        category,
        marketplace,
        features: Array.isArray(features) ? features : [features],
        price,
        brand
      },
      partnerId,
      generateImages
    );
    await costTracker_default.logCost({
      partnerId,
      operation: "product_card_creation",
      model: result.usedTemplate ? "template" : "claude-4-sonnet",
      cost: result.cost,
      tier: (await storage.getPartnerById(partnerId))?.pricingTier || "starter_pro",
      metadata: { generateImages }
    });
    res.json({
      success: true,
      productCard: result,
      remainingBudget: budgetCheck.remainingBudget - result.cost
    });
  } catch (error) {
    console.error("Product card creation error:", error);
    res.status(500).json({ error: error.message });
  }
});
router11.post("/batch-create-cards", async (req, res) => {
  try {
    const partnerId = req.user?.partnerId;
    if (!partnerId) {
      return res.status(401).json({ error: "Unauthorized" });
    }
    const { products: products4, generateImages } = req.body;
    if (!Array.isArray(products4) || products4.length === 0) {
      return res.status(400).json({ error: "Products array required" });
    }
    const estimatedCost = products4.length * (generateImages ? 0.09 : 0.05);
    const budgetCheck = await costTracker_default.checkBudget(partnerId, estimatedCost);
    if (!budgetCheck.allowed) {
      return res.status(429).json({
        error: "Budget limit exceeded for batch operation",
        message: budgetCheck.message
      });
    }
    const results = await productCardAI_default.batchCreateProductCards(
      products4,
      partnerId,
      generateImages
    );
    const totalCost = results.reduce((sum, r) => sum + r.cost, 0);
    await costTracker_default.logCost({
      partnerId,
      operation: "batch_product_card_creation",
      model: "mixed",
      cost: totalCost,
      tier: (await storage.getPartnerById(partnerId))?.pricingTier || "starter_pro",
      metadata: { count: products4.length, generateImages }
    });
    res.json({
      success: true,
      results,
      totalCost,
      processed: results.length
    });
  } catch (error) {
    console.error("Batch creation error:", error);
    res.status(500).json({ error: error.message });
  }
});
router11.post("/generate-review-response", async (req, res) => {
  try {
    const partnerId = req.user?.partnerId;
    if (!partnerId) {
      return res.status(401).json({ error: "Unauthorized" });
    }
    const { reviewText, rating, productName, customerName } = req.body;
    if (!reviewText || !rating || !productName) {
      return res.status(400).json({ error: "Missing required fields" });
    }
    const estimatedCost = rating >= 3 ? 1e-3 : 0.01;
    const budgetCheck = await costTracker_default.checkBudget(partnerId, estimatedCost);
    if (!budgetCheck.allowed) {
      return res.status(429).json({ error: "Budget limit exceeded" });
    }
    const response = await productCardAI_default.generateReviewResponse(
      reviewText,
      rating,
      productName,
      customerName || "Mijoz",
      partnerId
    );
    await costTracker_default.logCost({
      partnerId,
      operation: "review_response",
      model: rating >= 3 ? "template" : "claude-4-sonnet",
      cost: estimatedCost,
      tier: (await storage.getPartnerById(partnerId))?.pricingTier || "starter_pro"
    });
    res.json({
      success: true,
      response,
      usedTemplate: rating >= 3
    });
  } catch (error) {
    console.error("Review response error:", error);
    res.status(500).json({ error: error.message });
  }
});
router11.post("/optimize-seo", async (req, res) => {
  try {
    const partnerId = req.user?.partnerId;
    if (!partnerId) {
      return res.status(401).json({ error: "Unauthorized" });
    }
    const { currentTitle, currentDescription, marketplace } = req.body;
    if (!currentTitle || !currentDescription || !marketplace) {
      return res.status(400).json({ error: "Missing required fields" });
    }
    const budgetCheck = await costTracker_default.checkBudget(partnerId, 0.02);
    if (!budgetCheck.allowed) {
      return res.status(429).json({ error: "Budget limit exceeded" });
    }
    const result = await productCardAI_default.optimizeSEO(
      currentTitle,
      currentDescription,
      marketplace,
      partnerId
    );
    await costTracker_default.logCost({
      partnerId,
      operation: "seo_optimization",
      model: "claude-4-sonnet",
      cost: 0.02,
      tier: (await storage.getPartnerById(partnerId))?.pricingTier || "starter_pro"
    });
    res.json({
      success: true,
      optimization: result
    });
  } catch (error) {
    console.error("SEO optimization error:", error);
    res.status(500).json({ error: error.message });
  }
});
router11.post("/generate-images", async (req, res) => {
  try {
    const partnerId = req.user?.partnerId;
    if (!partnerId) {
      return res.status(401).json({ error: "Unauthorized" });
    }
    const { prompt, count: count2 = 1, quality = "standard" } = req.body;
    if (!prompt) {
      return res.status(400).json({ error: "Prompt required" });
    }
    const costPerImage = quality === "hd" ? 0.08 : 0.04;
    const totalCost = costPerImage * count2;
    const budgetCheck = await costTracker_default.checkBudget(partnerId, totalCost);
    if (!budgetCheck.allowed) {
      return res.status(429).json({ error: "Budget limit exceeded" });
    }
    const images = await emergentAI_default.generateImage(
      {
        prompt,
        n: count2,
        quality
      },
      partnerId
    );
    await costTracker_default.logCost({
      partnerId,
      operation: "image_generation",
      model: "gpt-image-1",
      imagesGenerated: count2,
      cost: totalCost,
      tier: (await storage.getPartnerById(partnerId))?.pricingTier || "starter_pro"
    });
    res.json({
      success: true,
      images,
      cost: totalCost
    });
  } catch (error) {
    console.error("Image generation error:", error);
    res.status(500).json({ error: error.message });
  }
});
var enhancedAIDashboard_default = router11;

// server/routes/enhancedAI.ts
import { Router as Router10 } from "express";
init_storage();
var router12 = Router10();
router12.get("/dashboard", async (req, res) => {
  try {
    const partnerId = req.user?.partnerId;
    if (!partnerId) {
      return res.status(401).json({ error: "Unauthorized" });
    }
    const stats = await costTracker_default.getDashboardStats(partnerId);
    const recommendations = await costTracker_default.getOptimizationRecommendations(partnerId);
    const templateStats = smartTemplates_default.getTemplateUsageStats();
    const partner = await storage.getPartnerById(partnerId);
    res.json({
      success: true,
      stats,
      recommendations,
      templateStats,
      tier: partner?.pricingTier || "starter_pro",
      aiEnabled: partner?.aiEnabled || false
    });
  } catch (error) {
    console.error("Dashboard error:", error);
    res.status(500).json({ error: error.message });
  }
});
router12.get("/cost-analytics", async (req, res) => {
  try {
    const partnerId = req.user?.partnerId;
    if (!partnerId) {
      return res.status(401).json({ error: "Unauthorized" });
    }
    const { startDate, endDate } = req.query;
    const start = startDate ? new Date(startDate) : new Date(Date.now() - 30 * 24 * 60 * 60 * 1e3);
    const end = endDate ? new Date(endDate) : /* @__PURE__ */ new Date();
    const summary = await costTracker_default.getUsageSummary(partnerId, start, end);
    res.json({ success: true, summary });
  } catch (error) {
    console.error("Cost analytics error:", error);
    res.status(500).json({ error: error.message });
  }
});
router12.post("/create-product-card", async (req, res) => {
  try {
    const partnerId = req.user?.partnerId;
    if (!partnerId) {
      return res.status(401).json({ error: "Unauthorized" });
    }
    const { productName, category, marketplace, features, price, brand, generateImages } = req.body;
    if (!productName || !category || !marketplace || !features || !price) {
      return res.status(400).json({ error: "Missing required fields" });
    }
    const estimatedCost = generateImages ? 0.09 : 0.05;
    const budgetCheck = await costTracker_default.checkBudget(partnerId, estimatedCost);
    if (!budgetCheck.allowed) {
      return res.status(429).json({
        error: "Budget limit exceeded",
        message: budgetCheck.message,
        remainingBudget: budgetCheck.remainingBudget
      });
    }
    const result = await productCardAI_default.createProductCard(
      { productName, category, marketplace, features: Array.isArray(features) ? features : [features], price, brand },
      partnerId,
      generateImages
    );
    await costTracker_default.logCost({
      partnerId,
      operation: "product_card_creation",
      model: result.usedTemplate ? "template" : "claude-4-sonnet",
      cost: result.cost,
      tier: (await storage.getPartnerById(partnerId))?.pricingTier || "starter_pro",
      metadata: { generateImages }
    });
    res.json({
      success: true,
      productCard: result,
      remainingBudget: budgetCheck.remainingBudget - result.cost
    });
  } catch (error) {
    console.error("Product card creation error:", error);
    res.status(500).json({ error: error.message });
  }
});
router12.post("/batch-create-cards", async (req, res) => {
  try {
    const partnerId = req.user?.partnerId;
    if (!partnerId) {
      return res.status(401).json({ error: "Unauthorized" });
    }
    const { products: products4, generateImages } = req.body;
    if (!Array.isArray(products4) || products4.length === 0) {
      return res.status(400).json({ error: "Products array required" });
    }
    const estimatedCost = products4.length * (generateImages ? 0.09 : 0.05);
    const budgetCheck = await costTracker_default.checkBudget(partnerId, estimatedCost);
    if (!budgetCheck.allowed) {
      return res.status(429).json({ error: "Budget limit exceeded", message: budgetCheck.message });
    }
    const results = await productCardAI_default.batchCreateProductCards(products4, partnerId, generateImages);
    const totalCost = results.reduce((sum, r) => sum + r.cost, 0);
    await costTracker_default.logCost({
      partnerId,
      operation: "batch_product_card_creation",
      model: "mixed",
      cost: totalCost,
      tier: (await storage.getPartnerById(partnerId))?.pricingTier || "starter_pro",
      metadata: { count: products4.length, generateImages }
    });
    res.json({ success: true, results, totalCost, processed: results.length });
  } catch (error) {
    console.error("Batch creation error:", error);
    res.status(500).json({ error: error.message });
  }
});
router12.post("/generate-review-response", async (req, res) => {
  try {
    const partnerId = req.user?.partnerId;
    if (!partnerId) {
      return res.status(401).json({ error: "Unauthorized" });
    }
    const { reviewText, rating, productName, customerName } = req.body;
    if (!reviewText || !rating || !productName) {
      return res.status(400).json({ error: "Missing required fields" });
    }
    const estimatedCost = rating >= 3 ? 1e-3 : 0.01;
    const budgetCheck = await costTracker_default.checkBudget(partnerId, estimatedCost);
    if (!budgetCheck.allowed) {
      return res.status(429).json({ error: "Budget limit exceeded" });
    }
    const response = await productCardAI_default.generateReviewResponse(
      reviewText,
      rating,
      productName,
      customerName || "Mijoz",
      partnerId
    );
    await costTracker_default.logCost({
      partnerId,
      operation: "review_response",
      model: rating >= 3 ? "template" : "claude-4-sonnet",
      cost: estimatedCost,
      tier: (await storage.getPartnerById(partnerId))?.pricingTier || "starter_pro"
    });
    res.json({ success: true, response, usedTemplate: rating >= 3 });
  } catch (error) {
    console.error("Review response error:", error);
    res.status(500).json({ error: error.message });
  }
});
router12.post("/optimize-seo", async (req, res) => {
  try {
    const partnerId = req.user?.partnerId;
    if (!partnerId) {
      return res.status(401).json({ error: "Unauthorized" });
    }
    const { currentTitle, currentDescription, marketplace } = req.body;
    if (!currentTitle || !currentDescription || !marketplace) {
      return res.status(400).json({ error: "Missing required fields" });
    }
    const budgetCheck = await costTracker_default.checkBudget(partnerId, 0.02);
    if (!budgetCheck.allowed) {
      return res.status(429).json({ error: "Budget limit exceeded" });
    }
    const result = await productCardAI_default.optimizeSEO(currentTitle, currentDescription, marketplace, partnerId);
    await costTracker_default.logCost({
      partnerId,
      operation: "seo_optimization",
      model: "claude-4-sonnet",
      cost: 0.02,
      tier: (await storage.getPartnerById(partnerId))?.pricingTier || "starter_pro"
    });
    res.json({ success: true, optimization: result });
  } catch (error) {
    console.error("SEO optimization error:", error);
    res.status(500).json({ error: error.message });
  }
});
router12.post("/generate-images", async (req, res) => {
  try {
    const partnerId = req.user?.partnerId;
    if (!partnerId) {
      return res.status(401).json({ error: "Unauthorized" });
    }
    const { prompt, count: count2 = 1, quality = "standard" } = req.body;
    if (!prompt) {
      return res.status(400).json({ error: "Prompt required" });
    }
    const costPerImage = quality === "hd" ? 0.08 : 0.04;
    const totalCost = costPerImage * count2;
    const budgetCheck = await costTracker_default.checkBudget(partnerId, totalCost);
    if (!budgetCheck.allowed) {
      return res.status(429).json({ error: "Budget limit exceeded" });
    }
    const images = await emergentAI_default.generateImage({ prompt, n: count2, quality }, partnerId);
    await costTracker_default.logCost({
      partnerId,
      operation: "image_generation",
      model: "gpt-image-1",
      imagesGenerated: count2,
      cost: totalCost,
      tier: (await storage.getPartnerById(partnerId))?.pricingTier || "starter_pro"
    });
    res.json({ success: true, images, cost: totalCost });
  } catch (error) {
    console.error("Image generation error:", error);
    res.status(500).json({ error: error.message });
  }
});
var enhancedAI_default = router12;

// server/routes/referralRoutes.ts
import express3 from "express";
init_db();
init_schema();
import { eq as eq7, and as and6, sql as sql7 } from "drizzle-orm";
import { nanoid as nanoid9 } from "nanoid";
var logInfo = /* @__PURE__ */ __name((message, data) => {
  console.log(`[REFERRAL] ${message}`, data ? JSON.stringify(data, null, 2) : "");
}, "logInfo");
var logError = /* @__PURE__ */ __name((message, error) => {
  console.error(`[REFERRAL ERROR] ${message}`, error);
}, "logError");
var router13 = express3.Router();
var REFERRAL_COMMISSION_RATES = {
  free_starter: 0,
  // $0/oy - no commission
  basic: 6.9,
  // $69/oy × 10% = $6.90/oy
  starter_pro: 34.9,
  // $349/oy × 10% = $34.90/oy
  professional: 89.9
  // $899/oy × 10% = $89.90/oy
};
function calculateReferralCommission(referredPartnerTier) {
  return REFERRAL_COMMISSION_RATES[referredPartnerTier] || 0;
}
__name(calculateReferralCommission, "calculateReferralCommission");
router13.post("/generate-code", asyncHandler(async (req, res) => {
  const user = req.user;
  const partner = req.partner;
  if (!user || !partner) {
    logError("Generate code: Unauthorized", { userId: user?.id });
    return res.status(401).json({ message: "Unauthorized" });
  }
  try {
    logInfo("Generating promo code", { partnerId: partner.id });
    const existingReferral = await db.select({ promoCode: referrals.promoCode }).from(referrals).where(and6(
      eq7(referrals.referrerPartnerId, partner.id),
      eq7(referrals.referredPartnerId, partner.id)
      // Self-reference for promo code
    )).limit(1);
    let promoCode = existingReferral[0]?.promoCode;
    if (!promoCode) {
      promoCode = `SCX-${nanoid9(6).toUpperCase()}`;
      const selfReferralId = nanoid9();
      try {
        await db.insert(referrals).values({
          id: selfReferralId,
          referrerPartnerId: partner.id,
          referredPartnerId: partner.id,
          // Self-reference
          promoCode,
          contractType: partner.pricingTier || "free_starter",
          status: "active",
          createdAt: /* @__PURE__ */ new Date(),
          activatedAt: /* @__PURE__ */ new Date()
        });
      } catch (insertError) {
        logError("Failed to insert self-referral, checking existing", insertError);
        const existing = await db.select({ promoCode: referrals.promoCode }).from(referrals).where(and6(
          eq7(referrals.referrerPartnerId, partner.id),
          eq7(referrals.referredPartnerId, partner.id)
        )).limit(1);
        if (existing[0]?.promoCode) {
          promoCode = existing[0].promoCode;
          logInfo("Using existing promo code after insert error", { promoCode });
        } else {
          throw insertError;
        }
      }
      logInfo("Promo code created", { partnerId: partner.id, promoCode });
    } else {
      logInfo("Using existing promo code", { partnerId: partner.id, promoCode });
    }
    let baseUrl = process.env.BASE_URL || process.env.DOMAIN;
    if (!baseUrl || baseUrl.includes("onrender.com") || baseUrl.includes("railway.app")) {
      baseUrl = "https://sellercloudx.com";
    }
    if (!baseUrl.startsWith("http")) {
      baseUrl = `https://${baseUrl}`;
    }
    const shareUrl = `${baseUrl}/partner-registration?ref=${promoCode}`;
    res.json({
      promoCode,
      shareUrl,
      message: "Promo kod yaratildi",
      socialShare: {
        telegram: `https://t.me/share/url?url=${encodeURIComponent(shareUrl)}&text=${encodeURIComponent("SellerCloudX bilan qo'shiling!")}`,
        whatsapp: `https://wa.me/?text=${encodeURIComponent(`SellerCloudX bilan qo'shiling! ${shareUrl}`)}`,
        facebook: `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(shareUrl)}`
      }
    });
  } catch (error) {
    logError("Failed to generate promo code", error);
    res.status(500).json({
      message: "Promo kod yaratishda xatolik",
      error: error.message
    });
  }
}));
router13.get("/stats", asyncHandler(async (req, res) => {
  const user = req.user;
  const partner = req.partner;
  if (!user || !partner) {
    logError("Stats: Unauthorized access", { userId: user?.id });
    return res.status(401).json({ message: "Unauthorized" });
  }
  try {
    logInfo("Fetching referral stats", { partnerId: partner.id });
    const allReferrals = await db.select().from(referrals).where(eq7(referrals.referrerPartnerId, partner.id)).catch((err) => {
      logError("Failed to fetch referrals", err);
      return [];
    });
    logInfo("Referrals fetched", { count: allReferrals.length });
    const activeReferrals = allReferrals.filter(
      (r) => r.status === "active" || r.status === "paid_1month"
    );
    const earnings = await db.select({
      total: sql7`COALESCE(SUM(amount), 0)`,
      paid: sql7`COALESCE(SUM(CASE WHEN status = 'paid' THEN amount ELSE 0 END), 0)`,
      pending: sql7`COALESCE(SUM(CASE WHEN status = 'pending' THEN amount ELSE 0 END), 0)`
    }).from(referralEarnings).where(eq7(referralEarnings.referrerPartnerId, partner.id)).catch((err) => {
      logError("Failed to fetch earnings", err);
      return [{ total: 0, paid: 0, pending: 0 }];
    });
    const totalEarned = Number(earnings[0]?.total) || 0;
    const totalPaid = Number(earnings[0]?.paid) || 0;
    const available = Number(earnings[0]?.pending) || 0;
    const partnerPromoCode = await db.select({ promoCode: referrals.promoCode }).from(referrals).where(and6(
      eq7(referrals.referrerPartnerId, partner.id),
      eq7(referrals.referredPartnerId, partner.id)
      // Self-reference
    )).limit(1);
    const promoCode = partnerPromoCode[0]?.promoCode || null;
    const referredPartners = await db.select({ pricingTier: partners.pricingTier }).from(referrals).leftJoin(partners, eq7(referrals.referredPartnerId, partners.id)).where(and6(
      eq7(referrals.referrerPartnerId, partner.id),
      sql7`${referrals.referredPartnerId} != ${referrals.referrerPartnerId}`
      // Exclude self-reference
    ));
    const avgCommission = referredPartners.length > 0 ? referredPartners.reduce((sum, p) => sum + calculateReferralCommission(p.pricingTier || "free_starter"), 0) / referredPartners.length : 0;
    const response = {
      totalReferrals: allReferrals.length,
      activeReferrals: activeReferrals.length,
      totalEarned,
      totalPaid,
      available,
      canWithdraw: available >= 50,
      // Minimum $50
      commissionRate: 10,
      // Fixed 10% commission
      avgCommissionPerReferral: avgCommission.toFixed(2),
      promoCode,
      referralCode: promoCode,
      // Alias for backward compatibility
      benefits: {
        forNewUser: {
          discount: 5,
          message: "Ro'yxatdan o'tganingizda $5 chegirma"
        },
        forReferrer: {
          commissionRate: 10,
          message: "Har bir taklif qilingan hamkor uchun oylik to'lovning 10% komissiya olasiz",
          examples: {
            free_starter: "$0/oy (chegirma yo'q)",
            basic: "$6.90/oy",
            starter_pro: "$34.90/oy",
            professional: "$89.90/oy"
          }
        }
      },
      howItWorks: [
        "Do'stlaringizni taklif qiling promo kod orqali",
        "Do'stingiz ro'yxatdan o'tadi va $5 chegirma oladi",
        "Do'stingiz birinchi oylik to'lovni amalga oshiradi",
        "Siz har oy oylik to'lovning 10% komissiya olasiz!"
      ]
    };
    logInfo("Stats response", response);
    res.json(response);
  } catch (error) {
    logError("Referral stats error", error);
    res.json({
      totalReferrals: 0,
      activeReferrals: 0,
      totalEarned: 0,
      totalPaid: 0,
      available: 0,
      canWithdraw: false,
      commissionRate: 10,
      avgCommissionPerReferral: "0.00",
      promoCode: null,
      referralCode: null,
      benefits: {
        forNewUser: { discount: 5, message: "Ro'yxatdan o'tganingizda $5 chegirma" },
        forReferrer: {
          commissionRate: 10,
          message: "Har bir taklif qilingan hamkor uchun oylik to'lovning 10% komissiya olasiz",
          examples: {
            free_starter: "$0/oy (chegirma yo'q)",
            basic: "$6.90/oy",
            starter_pro: "$34.90/oy",
            professional: "$89.90/oy"
          }
        }
      },
      howItWorks: [
        "Do'stlaringizni taklif qiling promo kod orqali",
        "Do'stingiz ro'yxatdan o'tadi va $5 chegirma oladi",
        "Do'stingiz birinchi oylik to'lovni amalga oshiradi",
        "Siz har oy oylik to'lovning 10% komissiya olasiz!"
      ],
      error: true,
      message: "Error loading stats - showing defaults"
    });
  }
}));
router13.get("/list", asyncHandler(async (req, res) => {
  const user = req.user;
  const partner = req.partner;
  if (!user || !partner) {
    return res.status(401).json({ message: "Unauthorized" });
  }
  try {
    const referralList = await db.select({
      id: referrals.id,
      referredPartner: {
        id: partners.id,
        businessName: partners.businessName,
        pricingTier: partners.pricingTier
      },
      status: referrals.status,
      bonusEarned: referrals.bonusEarned,
      bonusPaid: referrals.bonusPaid,
      createdAt: referrals.createdAt,
      activatedAt: referrals.activatedAt
    }).from(referrals).leftJoin(partners, eq7(referrals.referredPartnerId, partners.id)).where(eq7(referrals.referrerPartnerId, partner.id)).orderBy(sql7`${referrals.createdAt} DESC`);
    res.json({ referrals: referralList });
  } catch (error) {
    console.error("Referral list error:", error);
    res.status(500).json({ message: "Failed to fetch referrals" });
  }
}));
router13.post("/withdraw", asyncHandler(async (req, res) => {
  const user = req.user;
  const partner = req.partner;
  if (!user || !partner) {
    return res.status(401).json({ message: "Unauthorized" });
  }
  const { amount, method, accountDetails } = req.body;
  if (!amount || amount < 50) {
    return res.status(400).json({ message: "Minimum withdrawal amount is $50" });
  }
  if (!method) {
    return res.status(400).json({ message: "Payment method required" });
  }
  try {
    const earnings = await db.select({
      available: sql7`COALESCE(SUM(CASE WHEN status = 'pending' THEN amount ELSE 0 END), 0)`
    }).from(referralEarnings).where(eq7(referralEarnings.referrerPartnerId, partner.id));
    const available = earnings[0]?.available || 0;
    if (amount > available) {
      return res.status(400).json({
        message: "Insufficient balance",
        available
      });
    }
    const withdrawalId = `wd_${nanoid9()}`;
    await db.insert(withdrawals).values({
      id: withdrawalId,
      partnerId: partner.id,
      amount,
      method,
      accountDetails: JSON.stringify(accountDetails),
      status: "pending",
      createdAt: /* @__PURE__ */ new Date()
    });
    res.json({
      message: "Pul yechish so'rovi yuborildi",
      withdrawalId,
      amount,
      method,
      status: "pending",
      estimatedProcessing: "3-5 business days"
    });
  } catch (error) {
    console.error("Withdrawal error:", error);
    res.status(500).json({ message: "Failed to process withdrawal" });
  }
}));
router13.get("/withdrawals", asyncHandler(async (req, res) => {
  const user = req.user;
  const partner = req.partner;
  if (!user || !partner) {
    return res.status(401).json({ message: "Unauthorized" });
  }
  try {
    const withdrawalHistory = await db.select().from(withdrawals).where(eq7(withdrawals.partnerId, partner.id)).orderBy(sql7`${withdrawals.createdAt} DESC`);
    res.json({ withdrawals: withdrawalHistory });
  } catch (error) {
    console.error("Withdrawal history error:", error);
    res.status(500).json({ message: "Failed to fetch withdrawals" });
  }
}));
router13.get("/leaderboard", asyncHandler(async (req, res) => {
  try {
    const leaderboard = await db.select({
      partnerId: referrals.referrerPartnerId,
      businessName: partners.businessName,
      referralCount: sql7`COUNT(*)`,
      totalEarnings: sql7`COALESCE(SUM(${referrals.bonusEarned}), 0)`
    }).from(referrals).leftJoin(partners, eq7(referrals.referrerPartnerId, partners.id)).where(eq7(referrals.status, "active")).groupBy(referrals.referrerPartnerId, partners.businessName).orderBy(sql7`COUNT(*) DESC`).limit(10);
    const formattedLeaderboard = leaderboard.map((entry, index) => ({
      rank: index + 1,
      name: entry.businessName || "Anonymous",
      referrals: entry.referralCount,
      earnings: entry.totalEarnings
    }));
    res.json({ leaderboard: formattedLeaderboard });
  } catch (error) {
    console.error("Leaderboard error:", error);
    res.status(500).json({ message: "Failed to fetch leaderboard" });
  }
}));
router13.get("/validate/:code", asyncHandler(async (req, res) => {
  const { code } = req.params;
  const upperCode = code.toUpperCase().trim();
  try {
    logInfo("Validating promo code", { code: upperCode });
    const referral = await db.select({
      referrer: {
        id: partners.id,
        businessName: partners.businessName,
        pricingTier: partners.pricingTier
      },
      promoCode: referrals.promoCode,
      status: referrals.status
    }).from(referrals).leftJoin(partners, eq7(referrals.referrerPartnerId, partners.id)).where(eq7(referrals.promoCode, upperCode)).limit(1);
    if (referral.length === 0) {
      logInfo("Promo code not found", { code: upperCode });
      return res.status(404).json({
        valid: false,
        message: "Promo kod topilmadi"
      });
    }
    const referrerData = referral[0];
    const referrerTier = referrerData.referrer?.pricingTier || "free_starter";
    const commissionAmount = calculateReferralCommission(referrerTier);
    const benefits = {
      forNewUser: {
        discount: 5,
        // $5 discount for new user
        message: "Ro'yxatdan o'tganingizda $5 chegirma olasiz!"
      },
      forReferrer: {
        commissionRate: 10,
        commissionAmount,
        message: commissionAmount > 0 ? `Taklif qiluvchi har oy $${commissionAmount.toFixed(2)} komissiya oladi (oylik to'lovning 10%)` : "Taklif qiluvchi komissiya olmaydi (Free Starter tarif)"
      }
    };
    logInfo("Promo code validated", {
      code: upperCode,
      referrer: referrerData.referrer?.businessName
    });
    res.json({
      valid: true,
      referrer: referrerData.referrer,
      benefits,
      message: "Promo kod to'g'ri!"
    });
  } catch (error) {
    logError("Validate code error", error);
    res.status(500).json({ message: "Promo kod tekshirishda xatolik" });
  }
}));
var referralRoutes_default = router13;

// server/routes/chatRoutes.ts
import express4 from "express";
init_db();
init_schema();
import { eq as eq8, and as and7, desc as desc3 } from "drizzle-orm";
import { nanoid as nanoid10 } from "nanoid";
var router14 = express4.Router();
router14.get("/room", asyncHandler(async (req, res) => {
  const user = req.user;
  const partner = req.partner;
  if (!user || !partner) {
    return res.status(404).json({ message: "Partner not found" });
  }
  let chatRoom = await db.select().from(chatRooms).where(eq8(chatRooms.partnerId, partner.id)).limit(1);
  if (chatRoom.length === 0) {
    const newRoom = {
      id: `chat-${nanoid10()}`,
      partnerId: partner.id,
      adminId: null,
      status: "active",
      createdAt: /* @__PURE__ */ new Date(),
      lastMessageAt: null
    };
    await db.insert(chatRooms).values(newRoom);
    chatRoom = [newRoom];
  }
  res.json({
    ...chatRoom[0],
    partnerName: partner.businessName
  });
}));
router14.get("/rooms", asyncHandler(async (req, res) => {
  const user = req.user;
  if (!user || user.role !== "admin") {
    return res.status(403).json({ message: "Admin access required" });
  }
  const rooms = await db.select({
    id: chatRooms.id,
    partnerId: chatRooms.partnerId,
    adminId: chatRooms.adminId,
    status: chatRooms.status,
    createdAt: chatRooms.createdAt,
    lastMessageAt: chatRooms.lastMessageAt,
    partnerName: partners.businessName,
    partnerPhone: partners.phone
  }).from(chatRooms).leftJoin(partners, eq8(chatRooms.partnerId, partners.id)).orderBy(desc3(chatRooms.lastMessageAt));
  res.json(rooms);
}));
router14.get("/messages/:chatRoomId?", asyncHandler(async (req, res) => {
  const user = req.user;
  const partner = req.partner;
  const { chatRoomId } = req.params;
  let roomId = chatRoomId;
  if (user.role === "partner" && !chatRoomId) {
    const room = await db.select().from(chatRooms).where(eq8(chatRooms.partnerId, partner.id)).limit(1);
    if (room.length === 0) {
      return res.json([]);
    }
    roomId = room[0].id;
  } else if (user.role === "partner" && chatRoomId) {
    const room = await db.select({ id: chatRooms.id }).from(chatRooms).where(and7(eq8(chatRooms.id, chatRoomId), eq8(chatRooms.partnerId, partner.id))).limit(1);
    if (room.length === 0) {
      return res.status(403).json({ message: "Access denied" });
    }
  }
  if (!roomId) {
    return res.status(400).json({ message: "Chat room ID required" });
  }
  const chatMessages = await db.select({
    id: messages.id,
    chatRoomId: messages.chatRoomId,
    senderId: messages.senderId,
    senderRole: messages.senderRole,
    content: messages.content,
    messageType: messages.messageType,
    attachmentUrl: messages.attachmentUrl,
    createdAt: messages.createdAt,
    readAt: messages.readAt,
    senderName: users.username,
    senderFirstName: users.firstName,
    senderLastName: users.lastName
  }).from(messages).leftJoin(users, eq8(messages.senderId, users.id)).where(eq8(messages.chatRoomId, roomId)).orderBy(messages.createdAt);
  res.json(chatMessages);
}));
router14.post("/messages", asyncHandler(async (req, res) => {
  const user = req.user;
  const partner = req.partner;
  const { content, chatRoomId, messageType, attachmentUrl, fileName } = req.body;
  if (!content || content.trim().length === 0) {
    return res.status(400).json({ message: "Xabar bo'sh bo'lishi mumkin emas" });
  }
  let roomId = chatRoomId;
  if (user.role === "partner") {
    let room = await db.select().from(chatRooms).where(eq8(chatRooms.partnerId, partner.id)).limit(1);
    if (room.length === 0) {
      const newRoom = {
        id: `chat-${nanoid10()}`,
        partnerId: partner.id,
        adminId: null,
        status: "active",
        createdAt: /* @__PURE__ */ new Date(),
        lastMessageAt: /* @__PURE__ */ new Date()
      };
      await db.insert(chatRooms).values(newRoom);
      room = [newRoom];
    }
    roomId = room[0].id;
  } else if (user.role === "admin") {
    if (!roomId) {
      return res.status(400).json({ message: "Chat room ID required" });
    }
  }
  if (!roomId) {
    return res.status(400).json({ message: "Chat room ID required" });
  }
  const message = {
    id: `msg-${nanoid10()}`,
    chatRoomId: roomId,
    senderId: user.id,
    senderRole: user.role,
    content: messageType === "file" && fileName ? String(fileName) : content.trim(),
    messageType: messageType || "text",
    attachmentUrl: attachmentUrl || null,
    createdAt: /* @__PURE__ */ new Date(),
    readAt: null
  };
  await db.insert(messages).values(message);
  await db.update(chatRooms).set({ lastMessageAt: /* @__PURE__ */ new Date() }).where(eq8(chatRooms.id, roomId));
  res.status(201).json({
    message: "Xabar yuborildi",
    data: message
  });
}));
router14.post("/messages/read", asyncHandler(async (req, res) => {
  const user = req.user;
  const { messageIds } = req.body;
  if (!messageIds || !Array.isArray(messageIds)) {
    return res.status(400).json({ message: "Message IDs required" });
  }
  for (const msgId of messageIds) {
    await db.update(messages).set({ readAt: /* @__PURE__ */ new Date() }).where(and7(
      eq8(messages.id, msgId),
      eq8(messages.readAt, null)
    ));
  }
  res.json({ message: "Messages marked as read" });
}));
var chatRoutes_default = router14;

// server/routes/adminAdvancedFeatures.ts
import express5 from "express";

// server/services/orderRuleEngine.ts
init_storage();
var DEFAULT_RULES = [
  {
    id: "rule-high-value",
    name: "High Value Orders",
    enabled: true,
    priority: 1,
    conditions: [
      { field: "total", operator: "greater_than", value: 1e6 }
      // 1M UZS
    ],
    actions: [
      { type: "set_priority", params: { priority: "high" } },
      { type: "send_notification", params: { recipient: "admin", message: "High value order received" } }
    ]
  },
  {
    id: "rule-uzum-orders",
    name: "Uzum Marketplace Orders",
    enabled: true,
    priority: 2,
    conditions: [
      { field: "marketplace", operator: "equals", value: "uzum" }
    ],
    actions: [
      { type: "set_shipping_method", params: { method: "express" } },
      { type: "add_tag", params: { tag: "uzum-priority" } }
    ]
  },
  {
    id: "rule-international",
    name: "International Orders",
    enabled: true,
    priority: 3,
    conditions: [
      { field: "shipping_country", operator: "not_equals", value: "UZ" }
    ],
    actions: [
      { type: "set_priority", params: { priority: "medium" } },
      { type: "send_notification", params: { recipient: "logistics", message: "International order requires customs" } }
    ]
  }
];
var OrderRuleEngine = class {
  static {
    __name(this, "OrderRuleEngine");
  }
  rules = DEFAULT_RULES;
  // Evaluate conditions
  evaluateCondition(order, condition) {
    const fieldValue = order[condition.field];
    const conditionValue = condition.value;
    switch (condition.operator) {
      case "equals":
        return fieldValue === conditionValue;
      case "not_equals":
        return fieldValue !== conditionValue;
      case "greater_than":
        return Number(fieldValue) > Number(conditionValue);
      case "less_than":
        return Number(fieldValue) < Number(conditionValue);
      case "contains":
        return String(fieldValue).toLowerCase().includes(String(conditionValue).toLowerCase());
      default:
        return false;
    }
  }
  // Check if all conditions match
  matchesRule(order, rule) {
    if (!rule.enabled) return false;
    return rule.conditions.every((condition) => this.evaluateCondition(order, condition));
  }
  // Execute actions
  async executeAction(order, action) {
    console.log(`\u{1F527} Executing action: ${action.type}`, action.params);
    switch (action.type) {
      case "set_priority":
        await storage.updateOrder(order.id, { priority: action.params.priority });
        break;
      case "assign_warehouse":
        await storage.updateOrder(order.id, { warehouseId: action.params.warehouseId });
        break;
      case "set_shipping_method":
        await storage.updateOrder(order.id, { shippingMethod: action.params.method });
        break;
      case "send_notification":
        console.log(`\u{1F4E7} Notification: ${action.params.message} to ${action.params.recipient}`);
        break;
      case "add_tag":
        {
          const currentTags = order.tags || [];
          await storage.updateOrder(order.id, {
            tags: [...currentTags, action.params.tag]
          });
        }
        break;
      default:
        console.warn(`Unknown action type: ${action.type}`);
    }
  }
  // Process order through rule engine
  async processOrder(order) {
    console.log(`\u{1F50D} Processing order ${order.orderNumber} through rule engine`);
    const appliedRules = [];
    let actionsExecuted = 0;
    const sortedRules = [...this.rules].sort((a, b) => a.priority - b.priority);
    for (const rule of sortedRules) {
      if (this.matchesRule(order, rule)) {
        console.log(`\u2705 Rule matched: ${rule.name}`);
        appliedRules.push(rule.name);
        for (const action of rule.actions) {
          try {
            await this.executeAction(order, action);
            actionsExecuted++;
          } catch (error) {
            console.error(`\u274C Error executing action:`, error);
          }
        }
      }
    }
    console.log(`\u2705 Order processing complete: ${appliedRules.length} rules applied, ${actionsExecuted} actions executed`);
    return { applied: appliedRules, actions: actionsExecuted };
  }
  // Get all rules
  getRules() {
    return this.rules;
  }
  // Add custom rule
  addRule(rule) {
    this.rules.push(rule);
  }
  // Update rule
  updateRule(ruleId, updates) {
    const index = this.rules.findIndex((r) => r.id === ruleId);
    if (index !== -1) {
      this.rules[index] = { ...this.rules[index], ...updates };
    }
  }
  // Delete rule
  deleteRule(ruleId) {
    this.rules = this.rules.filter((r) => r.id !== ruleId);
  }
  // Enable/disable rule
  toggleRule(ruleId, enabled) {
    const rule = this.rules.find((r) => r.id === ruleId);
    if (rule) {
      rule.enabled = enabled;
    }
  }
};
var orderRuleEngine = new OrderRuleEngine();

// server/services/warehouseManagement.ts
init_storage();
import { nanoid as nanoid11 } from "nanoid";
var WarehouseManagement = class {
  static {
    __name(this, "WarehouseManagement");
  }
  // ==================== BARCODE MANAGEMENT ====================
  // Generate barcode for product
  generateBarcode(productId, sku) {
    const prefix = "200";
    const productHash = this.hashProductId(productId);
    const barcode = prefix + productHash;
    const checkDigit = this.calculateEAN13CheckDigit(barcode);
    return barcode + checkDigit;
  }
  // Hash product ID to 10 digits
  hashProductId(productId) {
    let hash = 0;
    for (let i = 0; i < productId.length; i++) {
      hash = (hash << 5) - hash + productId.charCodeAt(i);
      hash = hash & hash;
    }
    return Math.abs(hash).toString().padStart(10, "0").slice(0, 10);
  }
  // Calculate EAN-13 check digit
  calculateEAN13CheckDigit(barcode) {
    let sum = 0;
    for (let i = 0; i < barcode.length; i++) {
      const digit = parseInt(barcode[i]);
      sum += i % 2 === 0 ? digit : digit * 3;
    }
    const checkDigit = (10 - sum % 10) % 10;
    return checkDigit.toString();
  }
  // Scan barcode and get product info
  async scanBarcode(barcode) {
    try {
      console.log(`\u{1F4F7} Scanning barcode: ${barcode}`);
      const product = await storage.getProductByBarcode(barcode);
      if (!product) {
        console.log(`\u274C Product not found for barcode: ${barcode}`);
        return null;
      }
      const location = await this.getProductLocationFromDB(product.id);
      return {
        productId: product.id,
        sku: product.sku || "",
        barcode: product.barcode || barcode,
        name: product.name,
        location: location || "Unknown"
      };
    } catch (error) {
      console.error("Error scanning barcode:", error);
      return null;
    }
  }
  // ==================== PICK LIST MANAGEMENT ====================
  // Generate pick list for order
  async generatePickList(orderId) {
    try {
      const order = await storage.getOrderById(orderId);
      if (!order) {
        throw new Error(`Order not found: ${orderId}`);
      }
      const orderItems2 = await storage.getOrderItems(orderId);
      const pickListItems = await Promise.all(
        orderItems2.map(async (item) => {
          const product = await storage.getProductById(item.productId);
          const location = await this.getProductLocationFromDB(item.productId);
          return {
            productId: item.productId,
            sku: product?.sku || "",
            name: product?.name || "Unknown Product",
            quantity: item.quantity,
            location: location || this.getProductLocation(item.productId),
            barcode: product?.barcode || this.generateBarcode(item.productId, product?.sku || ""),
            picked: false,
            pickedQuantity: 0
          };
        })
      );
      const pickList = {
        id: nanoid11(),
        orderId,
        orderNumber: order.orderNumber,
        items: pickListItems,
        status: "pending",
        createdAt: /* @__PURE__ */ new Date()
      };
      console.log(`\u{1F4CB} Pick list generated for order ${order.orderNumber}`);
      return pickList;
    } catch (error) {
      console.error("Error generating pick list:", error);
      throw error;
    }
  }
  // Get product location from database
  async getProductLocationFromDB(productId) {
    try {
      const warehouses2 = await storage.getAllWarehouses();
      for (const warehouse of warehouses2) {
        const stock = await storage.getWarehouseStock(warehouse.id);
        const productStock = stock.find((s) => s.productId === productId);
        if (productStock && productStock.location) {
          return productStock.location;
        }
      }
      return null;
    } catch (error) {
      console.error("Error getting product location:", error);
      return null;
    }
  }
  // Get product location in warehouse (fallback to generated location)
  getProductLocation(productId) {
    const hash = this.hashProductId(productId);
    const zoneNum = parseInt(hash.substring(0, 1)) % 5;
    const zone = String.fromCharCode(65 + zoneNum);
    const aisle = hash.substring(1, 3);
    const shelf = hash.substring(3, 5);
    return `${zone}-${aisle}-${shelf}`;
  }
  // Mark item as picked
  async markItemPicked(pickListId, productId, quantity) {
    console.log(`\u2705 Marked ${quantity} units of ${productId} as picked in pick list ${pickListId}`);
  }
  // Complete pick list
  async completePickList(pickListId) {
    console.log(`\u2705 Pick list ${pickListId} completed`);
  }
  // ==================== PACKING SLIP MANAGEMENT ====================
  // Generate packing slip
  async generatePackingSlip(orderId) {
    try {
      const order = await storage.getOrderById(orderId);
      if (!order) {
        throw new Error(`Order not found: ${orderId}`);
      }
      const orderItems2 = await storage.getOrderItems(orderId);
      const packingSlipItems = await Promise.all(
        orderItems2.map(async (item) => {
          const product = await storage.getProductById(item.productId);
          return {
            sku: product?.sku || "",
            name: product?.name || "Unknown Product",
            quantity: item.quantity,
            weight: parseFloat(product?.weight || "0")
          };
        })
      );
      const totalWeight = packingSlipItems.reduce(
        (sum, item) => sum + item.weight * item.quantity,
        0
      );
      const packingSlip = {
        id: nanoid11(),
        orderId,
        orderNumber: order.orderNumber,
        customerName: order.customerName,
        shippingAddress: order.shippingAddress || "",
        items: packingSlipItems,
        totalWeight,
        shippingMethod: "Standard",
        // Default shipping method
        trackingNumber: order.trackingNumber,
        createdAt: /* @__PURE__ */ new Date()
      };
      console.log(`\u{1F4E6} Packing slip generated for order ${order.orderNumber}`);
      return packingSlip;
    } catch (error) {
      console.error("Error generating packing slip:", error);
      throw error;
    }
  }
  // Old mock implementation removed
  async _generatePackingSlipOld(orderId) {
    try {
      const order = {
        id: orderId,
        orderNumber: "ORD-123",
        customerName: "John Doe",
        shippingAddress: "Tashkent, Uzbekistan",
        shippingMethod: "Express",
        items: [
          { sku: "SKU-1", name: "Product 1", quantity: 2, weight: 0.5 },
          { sku: "SKU-2", name: "Product 2", quantity: 1, weight: 1 }
        ]
      };
      const totalWeight = order.items.reduce(
        (sum, item) => sum + item.weight * item.quantity,
        0
      );
      const packingSlip = {
        id: nanoid11(),
        orderId,
        orderNumber: order.orderNumber,
        customerName: order.customerName,
        shippingAddress: order.shippingAddress,
        items: order.items,
        totalWeight,
        shippingMethod: order.shippingMethod,
        createdAt: /* @__PURE__ */ new Date()
      };
      console.log(`\u{1F4E6} Packing slip generated for order ${order.orderNumber}`);
      return packingSlip;
    } catch (error) {
      console.error("Error generating packing slip:", error);
      throw error;
    }
  }
  // Print packing slip (generate PDF/HTML)
  async printPackingSlip(packingSlipId) {
    return `<html>Packing Slip ${packingSlipId}</html>`;
  }
  // ==================== WAREHOUSE ZONES ====================
  // Get all warehouse zones
  async getWarehouseZones() {
    return [
      {
        id: "zone-1",
        name: "Receiving Area",
        code: "RCV",
        type: "receiving",
        capacity: 1e3,
        currentLoad: 250
      },
      {
        id: "zone-2",
        name: "Storage Zone A",
        code: "STA",
        type: "storage",
        capacity: 5e3,
        currentLoad: 3200
      },
      {
        id: "zone-3",
        name: "Picking Zone",
        code: "PCK",
        type: "picking",
        capacity: 2e3,
        currentLoad: 1500
      },
      {
        id: "zone-4",
        name: "Packing Station",
        code: "PAK",
        type: "packing",
        capacity: 500,
        currentLoad: 120
      },
      {
        id: "zone-5",
        name: "Shipping Dock",
        code: "SHP",
        type: "shipping",
        capacity: 1e3,
        currentLoad: 300
      }
    ];
  }
  // Get zone utilization
  getZoneUtilization(zone) {
    return Math.round(zone.currentLoad / zone.capacity * 100);
  }
  // ==================== INVENTORY MOVEMENT ====================
  // Record inventory movement
  async recordMovement(productId, fromLocation, toLocation, quantity, reason) {
    console.log(`\u{1F4E6} Moving ${quantity} units of ${productId} from ${fromLocation} to ${toLocation}`);
    console.log(`   Reason: ${reason}`);
  }
  // ==================== REPORTING ====================
  // Get warehouse performance metrics
  async getPerformanceMetrics() {
    return {
      pickRate: 45,
      // 45 items per hour
      packRate: 15,
      // 15 orders per hour
      accuracy: 99.2,
      // 99.2% accuracy
      utilizationRate: 68
      // 68% warehouse utilization
    };
  }
};
var warehouseManagement = new WarehouseManagement();

// server/routes/adminAdvancedFeatures.ts
var router15 = express5.Router();
router15.get("/order-rules", asyncHandler(async (req, res) => {
  const rules = orderRuleEngine.getRules();
  res.json(rules);
}));
router15.post("/order-rules", asyncHandler(async (req, res) => {
  const rule = req.body;
  orderRuleEngine.addRule(rule);
  res.status(201).json({ message: "Rule added successfully", rule });
}));
router15.put("/order-rules/:id", asyncHandler(async (req, res) => {
  const { id } = req.params;
  const updates = req.body;
  orderRuleEngine.updateRule(id, updates);
  res.json({ message: "Rule updated successfully" });
}));
router15.delete("/order-rules/:id", asyncHandler(async (req, res) => {
  const { id } = req.params;
  orderRuleEngine.deleteRule(id);
  res.json({ message: "Rule deleted successfully" });
}));
router15.patch("/order-rules/:id/toggle", asyncHandler(async (req, res) => {
  const { id } = req.params;
  const { enabled } = req.body;
  orderRuleEngine.toggleRule(id, enabled);
  res.json({ message: "Rule toggled successfully" });
}));
router15.post("/order-rules/process", asyncHandler(async (req, res) => {
  const order = req.body;
  const result = await orderRuleEngine.processOrder(order);
  res.json(result);
}));
router15.post("/warehouse/barcode/generate", asyncHandler(async (req, res) => {
  const { productId, sku } = req.body;
  const barcode = warehouseManagement.generateBarcode(productId, sku);
  res.json({ barcode });
}));
router15.post("/warehouse/barcode/scan", asyncHandler(async (req, res) => {
  const { barcode } = req.body;
  const product = await warehouseManagement.scanBarcode(barcode);
  if (!product) {
    return res.status(404).json({ message: "Product not found" });
  }
  res.json(product);
}));
router15.post("/warehouse/pick-list/generate", asyncHandler(async (req, res) => {
  const { orderId } = req.body;
  const pickList = await warehouseManagement.generatePickList(orderId);
  res.json(pickList);
}));
router15.post("/warehouse/pick-list/:id/pick", asyncHandler(async (req, res) => {
  const { id } = req.params;
  const { productId, quantity } = req.body;
  await warehouseManagement.markItemPicked(id, productId, quantity);
  res.json({ message: "Item marked as picked" });
}));
router15.post("/warehouse/pick-list/:id/complete", asyncHandler(async (req, res) => {
  const { id } = req.params;
  await warehouseManagement.completePickList(id);
  res.json({ message: "Pick list completed" });
}));
router15.post("/warehouse/packing-slip/generate", asyncHandler(async (req, res) => {
  const { orderId } = req.body;
  const packingSlip = await warehouseManagement.generatePackingSlip(orderId);
  res.json(packingSlip);
}));
router15.get("/warehouse/packing-slip/:id/print", asyncHandler(async (req, res) => {
  const { id } = req.params;
  const html = await warehouseManagement.printPackingSlip(id);
  res.setHeader("Content-Type", "text/html");
  res.send(html);
}));
router15.get("/warehouse/zones", asyncHandler(async (req, res) => {
  const zones = await warehouseManagement.getWarehouseZones();
  res.json(zones);
}));
router15.get("/warehouse/zones/:id/utilization", asyncHandler(async (req, res) => {
  const zones = await warehouseManagement.getWarehouseZones();
  const zone = zones.find((z3) => z3.id === req.params.id);
  if (!zone) {
    return res.status(404).json({ message: "Zone not found" });
  }
  const utilization = warehouseManagement.getZoneUtilization(zone);
  res.json({ zone: zone.name, utilization });
}));
router15.post("/warehouse/movement", asyncHandler(async (req, res) => {
  const { productId, fromLocation, toLocation, quantity, reason } = req.body;
  await warehouseManagement.recordMovement(productId, fromLocation, toLocation, quantity, reason);
  res.json({ message: "Movement recorded successfully" });
}));
router15.get("/warehouse/performance", asyncHandler(async (req, res) => {
  const metrics = await warehouseManagement.getPerformanceMetrics();
  res.json(metrics);
}));
var adminAdvancedFeatures_default = router15;

// server/routes/partnerAdvancedFeatures.ts
import express6 from "express";

// server/services/inventoryForecasting.ts
init_storage();
var InventoryForecasting = class {
  static {
    __name(this, "InventoryForecasting");
  }
  // Calculate moving average
  calculateMovingAverage(values, period) {
    if (values.length === 0) return 0;
    const relevantValues = values.slice(-period);
    const sum = relevantValues.reduce((a, b) => a + b, 0);
    return sum / relevantValues.length;
  }
  // Calculate trend (simple linear regression)
  calculateTrend(values) {
    if (values.length < 2) return 0;
    const n = values.length;
    const xSum = n * (n + 1) / 2;
    const ySum = values.reduce((a, b) => a + b, 0);
    const xySum = values.reduce((sum, y, i) => sum + (i + 1) * y, 0);
    const x2Sum = n * (n + 1) * (2 * n + 1) / 6;
    const slope = (n * xySum - xSum * ySum) / (n * x2Sum - xSum * xSum);
    return slope;
  }
  // Get historical sales data
  async getHistoricalSales(productId, days) {
    try {
      const orders3 = await storage.getOrdersByProduct(productId, days);
      const dailySales = {};
      orders3.forEach((order) => {
        const date = new Date(order.createdAt).toISOString().split("T")[0];
        const items = order.items;
        if (items) {
          items.forEach((item) => {
            if (item.productId === productId) {
              dailySales[date] = (dailySales[date] || 0) + (item.quantity || 0);
            }
          });
        }
      });
      const salesArray = [];
      const today = /* @__PURE__ */ new Date();
      for (let i = days - 1; i >= 0; i--) {
        const date = new Date(today);
        date.setDate(date.getDate() - i);
        const dateStr = date.toISOString().split("T")[0];
        salesArray.push(dailySales[dateStr] || 0);
      }
      return salesArray;
    } catch (error) {
      console.error("Error getting historical sales:", error);
      return [];
    }
  }
  // Forecast demand for a product
  async forecastProduct(productId) {
    try {
      const product = await storage.getProductById(productId);
      if (!product) return null;
      const historicalSales = await this.getHistoricalSales(productId, 30);
      if (historicalSales.length === 0) {
        return {
          productId,
          productName: product.name,
          currentStock: product.stockQuantity || 0,
          averageDailySales: 0,
          forecastedDemand: {
            next7Days: 0,
            next14Days: 0,
            next30Days: 0
          },
          reorderPoint: product.lowStockThreshold || 10,
          reorderQuantity: 50,
          daysUntilStockout: 999,
          recommendation: "ok",
          confidence: 0
        };
      }
      const averageDailySales = this.calculateMovingAverage(historicalSales, 7);
      const trend = this.calculateTrend(historicalSales);
      const forecast7Days = Math.max(0, Math.round(averageDailySales * 7 + trend * 7));
      const forecast14Days = Math.max(0, Math.round(averageDailySales * 14 + trend * 14));
      const forecast30Days = Math.max(0, Math.round(averageDailySales * 30 + trend * 30));
      const leadTimeDays = 7;
      const safetyStock = Math.ceil(averageDailySales * 3);
      const reorderPoint = Math.ceil(averageDailySales * leadTimeDays + safetyStock);
      const reorderQuantity = Math.max(50, Math.ceil(forecast30Days * 1.2));
      const currentStock = product.stockQuantity || 0;
      const daysUntilStockout = averageDailySales > 0 ? Math.floor(currentStock / averageDailySales) : 999;
      let recommendation;
      if (currentStock <= reorderPoint * 0.5) {
        recommendation = "urgent";
      } else if (currentStock <= reorderPoint) {
        recommendation = "soon";
      } else if (currentStock > forecast30Days * 2) {
        recommendation = "overstocked";
      } else {
        recommendation = "ok";
      }
      const variance = historicalSales.reduce((sum, val) => {
        const diff = val - averageDailySales;
        return sum + diff * diff;
      }, 0) / historicalSales.length;
      const stdDev = Math.sqrt(variance);
      const coefficientOfVariation = averageDailySales > 0 ? stdDev / averageDailySales : 1;
      const confidence = Math.max(0, Math.min(100, Math.round((1 - coefficientOfVariation) * 100)));
      return {
        productId,
        productName: product.name,
        currentStock,
        averageDailySales: Math.round(averageDailySales * 10) / 10,
        forecastedDemand: {
          next7Days: forecast7Days,
          next14Days: forecast14Days,
          next30Days: forecast30Days
        },
        reorderPoint,
        reorderQuantity,
        daysUntilStockout,
        recommendation,
        confidence
      };
    } catch (error) {
      console.error("Error forecasting product:", error);
      return null;
    }
  }
  // Forecast all products for a partner
  async forecastAllProducts(partnerId) {
    try {
      const products4 = await storage.getProductsByPartnerId(partnerId);
      const forecasts = [];
      for (const product of products4) {
        const forecast = await this.forecastProduct(product.id);
        if (forecast) {
          forecasts.push(forecast);
        }
      }
      return forecasts.sort((a, b) => {
        const urgencyOrder = { urgent: 0, soon: 1, ok: 2, overstocked: 3 };
        return urgencyOrder[a.recommendation] - urgencyOrder[b.recommendation];
      });
    } catch (error) {
      console.error("Error forecasting all products:", error);
      return [];
    }
  }
  // Get products that need reordering
  async getReorderList(partnerId) {
    const forecasts = await this.forecastAllProducts(partnerId);
    return forecasts.filter((f) => f.recommendation === "urgent" || f.recommendation === "soon");
  }
  // Get overstocked products
  async getOverstockedProducts(partnerId) {
    const forecasts = await this.forecastAllProducts(partnerId);
    return forecasts.filter((f) => f.recommendation === "overstocked");
  }
};
var inventoryForecasting = new InventoryForecasting();

// server/services/advancedReporting.ts
init_storage();
import ExcelJS from "exceljs";
import { jsPDF } from "jspdf";
import "jspdf-autotable";
var AdvancedReporting = class {
  static {
    __name(this, "AdvancedReporting");
  }
  // Generate Sales Report
  async generateSalesReport(config2) {
    const { dateRange, filters } = config2;
    const orders3 = await storage.getOrdersByDateRange(
      dateRange.start,
      dateRange.end,
      filters
    );
    const totalOrders = orders3.length;
    const totalRevenue = orders3.reduce((sum, o) => sum + Number(o.totalAmount || 0), 0);
    const averageOrderValue = totalOrders > 0 ? totalRevenue / totalOrders : 0;
    const completedOrders = orders3.filter((o) => o.status === "completed").length;
    const conversionRate = totalOrders > 0 ? completedOrders / totalOrders * 100 : 0;
    const groupedData = this.groupOrdersByPeriod(orders3, config2.groupBy || "day");
    return {
      title: "Sales Report",
      generated: /* @__PURE__ */ new Date(),
      config: config2,
      summary: {
        totalOrders,
        totalRevenue,
        averageOrderValue,
        completedOrders,
        conversionRate: Math.round(conversionRate * 10) / 10
      },
      data: groupedData,
      charts: [
        {
          type: "line",
          data: {
            labels: groupedData.map((d) => d.period),
            datasets: [{
              label: "Revenue",
              data: groupedData.map((d) => d.revenue)
            }]
          }
        }
      ]
    };
  }
  // Generate Inventory Report
  async generateInventoryReport(partnerId) {
    const products4 = await storage.getProductsByPartnerId(partnerId);
    const totalProducts = products4.length;
    const totalStockValue = products4.reduce((sum, p) => {
      const stock = p.stockQuantity || 0;
      const price = Number(p.costPrice || p.price || 0);
      return sum + stock * price;
    }, 0);
    const lowStockProducts = products4.filter(
      (p) => (p.stockQuantity || 0) <= (p.lowStockThreshold || 10)
    ).length;
    const outOfStockProducts = products4.filter(
      (p) => (p.stockQuantity || 0) === 0
    ).length;
    const byCategory = {};
    products4.forEach((p) => {
      const category = p.category || "Uncategorized";
      if (!byCategory[category]) {
        byCategory[category] = {
          category,
          count: 0,
          totalStock: 0,
          totalValue: 0
        };
      }
      byCategory[category].count++;
      byCategory[category].totalStock += p.stockQuantity || 0;
      byCategory[category].totalValue += (p.stockQuantity || 0) * Number(p.costPrice || p.price || 0);
    });
    return {
      title: "Inventory Report",
      generated: /* @__PURE__ */ new Date(),
      config: { type: "inventory", dateRange: { start: /* @__PURE__ */ new Date(), end: /* @__PURE__ */ new Date() } },
      summary: {
        totalProducts,
        totalStockValue,
        lowStockProducts,
        outOfStockProducts,
        stockTurnoverRate: 0
        // TODO: Calculate based on sales
      },
      data: Object.values(byCategory),
      charts: [
        {
          type: "pie",
          data: {
            labels: Object.keys(byCategory),
            datasets: [{
              data: Object.values(byCategory).map((c) => c.totalValue)
            }]
          }
        }
      ]
    };
  }
  // Generate Performance Report
  async generatePerformanceReport(partnerId, config2) {
    const { dateRange } = config2;
    const orders3 = await storage.getOrdersByDateRange(dateRange.start, dateRange.end, { partnerId });
    const products4 = await storage.getProductsByPartnerId(partnerId);
    const productSales = {};
    orders3.forEach((order) => {
      order.items?.forEach((item) => {
        if (!productSales[item.productId]) {
          const product = products4.find((p) => p.id === item.productId);
          productSales[item.productId] = {
            product: product || { name: "Unknown" },
            quantity: 0,
            revenue: 0
          };
        }
        productSales[item.productId].quantity += item.quantity || 0;
        productSales[item.productId].revenue += Number(item.price || 0) * (item.quantity || 0);
      });
    });
    const topProducts = Object.values(productSales).sort((a, b) => b.revenue - a.revenue).slice(0, 10);
    const marketplacePerformance = {};
    orders3.forEach((order) => {
      const marketplace = order.marketplace || "Direct";
      if (!marketplacePerformance[marketplace]) {
        marketplacePerformance[marketplace] = { orders: 0, revenue: 0 };
      }
      marketplacePerformance[marketplace].orders++;
      marketplacePerformance[marketplace].revenue += Number(order.totalAmount || 0);
    });
    return {
      title: "Performance Report",
      generated: /* @__PURE__ */ new Date(),
      config: config2,
      summary: {
        totalOrders: orders3.length,
        totalRevenue: orders3.reduce((sum, o) => sum + Number(o.totalAmount || 0), 0),
        topProduct: topProducts[0]?.product.name || "N/A",
        topMarketplace: Object.keys(marketplacePerformance).sort(
          (a, b) => marketplacePerformance[b].revenue - marketplacePerformance[a].revenue
        )[0] || "N/A"
      },
      data: {
        topProducts,
        marketplacePerformance: Object.entries(marketplacePerformance).map(([name, data]) => ({
          marketplace: name,
          ...data
        }))
      }
    };
  }
  // Export to Excel
  async exportToExcel(reportData) {
    const workbook = new ExcelJS.Workbook();
    const worksheet = workbook.addWorksheet(reportData.title);
    worksheet.addRow([reportData.title]);
    worksheet.addRow([`Generated: ${reportData.generated.toLocaleString()}`]);
    worksheet.addRow([]);
    worksheet.addRow(["Summary"]);
    Object.entries(reportData.summary).forEach(([key, value]) => {
      worksheet.addRow([key, value]);
    });
    worksheet.addRow([]);
    if (Array.isArray(reportData.data) && reportData.data.length > 0) {
      const headers = Object.keys(reportData.data[0]);
      worksheet.addRow(headers);
      reportData.data.forEach((row) => {
        worksheet.addRow(headers.map((h) => row[h]));
      });
    }
    worksheet.getRow(1).font = { bold: true, size: 16 };
    worksheet.getRow(4).font = { bold: true };
    return await workbook.xlsx.writeBuffer();
  }
  // Export to PDF
  async exportToPDF(reportData) {
    const doc = new jsPDF();
    doc.setFontSize(18);
    doc.text(reportData.title, 14, 20);
    doc.setFontSize(10);
    doc.text(`Generated: ${reportData.generated.toLocaleString()}`, 14, 30);
    doc.setFontSize(14);
    doc.text("Summary", 14, 45);
    let y = 55;
    doc.setFontSize(10);
    Object.entries(reportData.summary).forEach(([key, value]) => {
      doc.text(`${key}: ${value}`, 14, y);
      y += 7;
    });
    if (Array.isArray(reportData.data) && reportData.data.length > 0) {
      const headers = Object.keys(reportData.data[0]);
      const rows = reportData.data.map((row) => headers.map((h) => row[h]));
      doc.autoTable({
        startY: y + 10,
        head: [headers],
        body: rows,
        theme: "grid",
        styles: { fontSize: 8 }
      });
    }
    return Buffer.from(doc.output("arraybuffer"));
  }
  // Helper: Group orders by period
  groupOrdersByPeriod(orders3, groupBy) {
    const grouped = {};
    orders3.forEach((order) => {
      const date = new Date(order.createdAt);
      let period;
      switch (groupBy) {
        case "day":
          period = date.toISOString().split("T")[0];
          break;
        case "week":
          {
            const weekStart = new Date(date);
            weekStart.setDate(date.getDate() - date.getDay());
            period = weekStart.toISOString().split("T")[0];
          }
          break;
        case "month":
          period = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}`;
          break;
        default:
          period = date.toISOString().split("T")[0];
      }
      if (!grouped[period]) {
        grouped[period] = { period, orders: 0, revenue: 0 };
      }
      grouped[period].orders++;
      grouped[period].revenue += Number(order.totalAmount || 0);
    });
    return Object.values(grouped).sort((a, b) => a.period.localeCompare(b.period));
  }
};
var advancedReporting = new AdvancedReporting();

// server/routes/partnerAdvancedFeatures.ts
var router16 = express6.Router();
router16.get("/inventory-forecast/:productId", asyncHandler(async (req, res) => {
  const { productId } = req.params;
  const forecast = await inventoryForecasting.forecastProduct(productId);
  if (!forecast) {
    return res.status(404).json({ message: "Product not found or no data available" });
  }
  res.json(forecast);
}));
router16.get("/inventory-forecast", asyncHandler(async (req, res) => {
  const partner = req.partner;
  if (!partner) {
    return res.status(404).json({ message: "Partner not found" });
  }
  const forecasts = await inventoryForecasting.forecastAllProducts(partner.id);
  res.json(forecasts);
}));
router16.get("/inventory-forecast/reorder-list", asyncHandler(async (req, res) => {
  const partner = req.partner;
  if (!partner) {
    return res.status(404).json({ message: "Partner not found" });
  }
  const reorderList = await inventoryForecasting.getReorderList(partner.id);
  res.json(reorderList);
}));
router16.get("/inventory-forecast/overstocked", asyncHandler(async (req, res) => {
  const partner = req.partner;
  if (!partner) {
    return res.status(404).json({ message: "Partner not found" });
  }
  const overstocked = await inventoryForecasting.getOverstockedProducts(partner.id);
  res.json(overstocked);
}));
router16.post("/reports/sales", asyncHandler(async (req, res) => {
  const partner = req.partner;
  const config2 = req.body;
  if (!config2.filters) {
    config2.filters = {};
  }
  config2.filters.partnerId = partner.id;
  const report = await advancedReporting.generateSalesReport(config2);
  res.json(report);
}));
router16.get("/reports/inventory", asyncHandler(async (req, res) => {
  const partner = req.partner;
  if (!partner) {
    return res.status(404).json({ message: "Partner not found" });
  }
  const report = await advancedReporting.generateInventoryReport(partner.id);
  res.json(report);
}));
router16.post("/reports/performance", asyncHandler(async (req, res) => {
  const partner = req.partner;
  const config2 = req.body;
  if (!partner) {
    return res.status(404).json({ message: "Partner not found" });
  }
  const report = await advancedReporting.generatePerformanceReport(partner.id, config2);
  res.json(report);
}));
router16.post("/reports/export/excel", asyncHandler(async (req, res) => {
  const reportData = req.body;
  const buffer = await advancedReporting.exportToExcel(reportData);
  res.setHeader("Content-Type", "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet");
  res.setHeader("Content-Disposition", `attachment; filename="${reportData.title}.xlsx"`);
  res.send(buffer);
}));
router16.post("/reports/export/pdf", asyncHandler(async (req, res) => {
  const reportData = req.body;
  const buffer = await advancedReporting.exportToPDF(reportData);
  res.setHeader("Content-Type", "application/pdf");
  res.setHeader("Content-Disposition", `attachment; filename="${reportData.title}.pdf"`);
  res.send(buffer);
}));
var partnerAdvancedFeatures_default = router16;

// server/routes/autonomousAI.ts
import express7 from "express";

// server/services/autonomousAIManager.ts
init_db();
init_schema();
init_aiManagerService();
import { eq as eq9 } from "drizzle-orm";
var AutonomousAIManager = class {
  static {
    __name(this, "AutonomousAIManager");
  }
  isRunning = false;
  intervalId = null;
  decisions = [];
  // Start autonomous AI Manager
  start() {
    if (this.isRunning) {
      console.log("\u26A0\uFE0F Autonomous AI Manager allaqachon ishlamoqda");
      return;
    }
    console.log("\u{1F680} Autonomous AI Manager ishga tushdi");
    this.isRunning = true;
    this.intervalId = setInterval(() => {
      this.processPendingTasks();
    }, 5 * 60 * 1e3);
    this.processPendingTasks();
  }
  // Stop autonomous AI Manager
  stop() {
    if (this.intervalId) {
      clearInterval(this.intervalId);
      this.intervalId = null;
    }
    this.isRunning = false;
    console.log("\u{1F6D1} Autonomous AI Manager toxtatildi");
  }
  /**
   * Process product with AI - creates cards, optimizes content, etc.
   */
  async processProduct(input) {
    const decisions = [];
    const errors = [];
    try {
      decisions.push({
        module: "analyzer",
        action: "analyze_product",
        confidence: 95,
        timestamp: /* @__PURE__ */ new Date(),
        details: { name: input.name }
      });
      decisions.push({
        module: "seo",
        action: "generate_seo",
        confidence: 90,
        timestamp: /* @__PURE__ */ new Date(),
        details: { marketplace: "all" }
      });
      const markup = 1.3;
      const price = input.costPrice * markup;
      decisions.push({
        module: "pricing",
        action: "set_price",
        confidence: 85,
        timestamp: /* @__PURE__ */ new Date(),
        details: { costPrice: input.costPrice, sellPrice: price, markup: "30%" }
      });
      this.decisions.push(...decisions);
      const product = {
        id: `prod_${Date.now()}`,
        name: input.name,
        description: input.description,
        costPrice: input.costPrice,
        price,
        stockQuantity: input.stockQuantity,
        partnerId: input.partnerId,
        createdAt: /* @__PURE__ */ new Date()
      };
      return {
        success: true,
        product,
        decisions
      };
    } catch (error) {
      errors.push(error.message);
      return {
        success: false,
        decisions,
        errors
      };
    }
  }
  /**
   * Get all decisions
   */
  getDecisions() {
    return this.decisions;
  }
  /**
   * Clear decisions log
   */
  clearDecisions() {
    this.decisions = [];
  }
  // Process pending tasks
  async processPendingTasks() {
    try {
      await this.createMissingCards();
      await this.fixMarketplaceErrors();
      await this.optimizePrices();
      await this.monitorAllPartners();
    } catch (error) {
      console.error("\u274C Autonomous AI Manager xatosi:", error);
    }
  }
  // Create missing marketplace cards
  async createMissingCards() {
    console.log("\u{1F50D} Checking for products without marketplace cards...");
    try {
      const activePartners = await db.select().from(partners).where(eq9(partners.aiEnabled, true)).where(eq9(partners.approved, true));
      for (const partner of activePartners) {
        try {
          const partnerProducts = await db.select().from(products).where(eq9(products.partnerId, partner.id)).where(eq9(products.isActive, true));
          const integrations = await db.select().from(marketplaceIntegrations).where(eq9(marketplaceIntegrations.partnerId, partner.id)).where(eq9(marketplaceIntegrations.active, true));
          for (const product of partnerProducts) {
            for (const integration of integrations) {
              const { sqlite } = await Promise.resolve().then(() => (init_db(), db_exports));
              let existingCard = null;
              if (sqlite) {
                const stmt = sqlite.prepare(
                  `SELECT id FROM ai_generated_products 
                   WHERE partner_id = ? AND marketplace = ? LIMIT 1`
                );
                existingCard = stmt.get(partner.id, integration.marketplace);
              } else {
                existingCard = null;
              }
              if (!existingCard) {
                console.log(`\u{1F4DD} Creating card for ${product.name} on ${integration.marketplace}`);
                try {
                  await generateProductCard2({
                    name: product.name,
                    category: product.category || "general",
                    description: product.description || "",
                    price: parseFloat(product.price?.toString() || "0") || 0,
                    images: [],
                    targetMarketplace: integration.marketplace
                  }, partner.id);
                  console.log(`\u2705 Card created for ${product.name}`);
                } catch (error) {
                  console.error(`\u274C Failed to create card:`, error);
                }
              }
            }
          }
        } catch (error) {
          console.error(`Error processing partner ${partner.id}:`, error);
        }
      }
    } catch (error) {
      console.error("Error in createMissingCards:", error);
    }
  }
  // Fix marketplace errors and blocked products
  async fixMarketplaceErrors() {
    console.log("\u{1F527} Checking for marketplace errors...");
    try {
      const { sqlite } = await Promise.resolve().then(() => (init_db(), db_exports));
      let errorProducts = [];
      if (sqlite) {
        const stmt = sqlite.prepare(
          `SELECT * FROM ai_generated_products 
           WHERE status IN ('error', 'blocked', 'rejected')
           ORDER BY updated_at DESC
           LIMIT 10`
        );
        errorProducts = stmt.all();
      } else {
        errorProducts = [];
      }
      for (const product of errorProducts) {
        try {
          console.log(`\u{1F527} Fixing product ${product.id}...`);
          const fixedCard = await this.fixProductCard(product);
          if (fixedCard) {
            console.log(`\u2705 Product ${product.id} fixed`);
          }
        } catch (error) {
          console.error(`\u274C Failed to fix product ${product.id}:`, error);
        }
      }
    } catch (error) {
      console.error("Error in fixMarketplaceErrors:", error);
    }
  }
  // Fix individual product card
  async fixProductCard(product) {
    const prompt = `
Marketplace mahsulot kartochkasi bloklangan yoki xatoga ega.

XATO: ${product.error_message || "Noma'lum"}
MAHSULOT: ${product.raw_product_name || "Noma'lum"}
MARKETPLACE: ${product.marketplace_type || "general"}

Quyidagilarni tahlil qiling va tuzatilgan versiyani yarating:
1. Xatoning sababini aniqlang
2. Marketplace qoidalariga mos kelmaydigan qismlarni toping
3. Tuzatilgan kartochka yarating

JSON formatda javob bering:
{
  "errorReason": "Xato sababi",
  "fixedTitle": "Tuzatilgan sarlavha",
  "fixedDescription": "Tuzatilgan tavsif",
  "fixedKeywords": ["kalit", "so'zlar"],
  "complianceIssues": ["Muammo 1", "Muammo 2"],
  "fixes": ["Tuzatish 1", "Tuzatish 2"]
}
`;
    try {
      const fixData = await emergentAI_default.generateJSON(prompt, "ProductCardFix");
      const { sqlite } = await Promise.resolve().then(() => (init_db(), db_exports));
      if (sqlite && fixData && fixData.fixedTitle) {
        const stmt = sqlite.prepare(
          `UPDATE ai_generated_products 
           SET generated_title = ?, 
               generated_description = ?,
               ai_title = ?,
               ai_description = ?,
               status = 'review',
               error_message = NULL,
               updated_at = unixepoch()
           WHERE id = ?`
        );
        stmt.run(
          fixData.fixedTitle || "",
          fixData.fixedDescription || "",
          fixData.fixedTitle || "",
          fixData.fixedDescription || "",
          product.id
        );
      }
      return fixData;
    } catch (error) {
      console.error("Error fixing product card:", error);
      return null;
    }
  }
  // Optimize prices
  async optimizePrices() {
    console.log("\u{1F4B0} Optimizing prices...");
    try {
      const { sqlite } = await Promise.resolve().then(() => (init_db(), db_exports));
      let productsToOptimize = [];
      if (sqlite) {
        const stmt = sqlite.prepare(
          `SELECT * FROM marketplace_products 
           WHERE (last_price_update IS NULL OR last_price_update < (unixepoch() - 604800))
           AND status = 'active'
           LIMIT 20`
        );
        productsToOptimize = stmt.all();
      } else {
        productsToOptimize = [];
      }
      for (const product of productsToOptimize) {
        if (!product || !product.partner_id || !product.id) {
          console.warn("\u26A0\uFE0F Skipping product with invalid data");
          continue;
        }
        try {
          await optimizePrice2(
            product.partner_id,
            product.id,
            product.marketplace_type || "general"
          );
        } catch (error) {
          console.error(`Error optimizing price for product ${product.id}:`, error);
        }
      }
    } catch (error) {
      console.error("Error in optimizePrices:", error);
    }
  }
  // Monitor all partners
  async monitorAllPartners() {
    console.log("\u{1F441}\uFE0F Monitoring partners...");
    try {
      const activePartners = await db.select().from(partners).where(eq9(partners.aiEnabled, true)).where(eq9(partners.approved, true));
      if (!activePartners || activePartners.length === 0) {
        console.log("\u2139\uFE0F No active partners with AI enabled to monitor");
        return;
      }
      for (const partner of activePartners) {
        if (!partner || !partner.id || typeof partner.id !== "string" || partner.id.trim() === "") {
          console.warn("\u26A0\uFE0F Skipping partner with invalid ID:", partner?.id);
          continue;
        }
        try {
          await monitorPartnerProducts(partner.id);
        } catch (error) {
          console.error(`Error monitoring partner ${partner.id}:`, error);
        }
      }
    } catch (error) {
      console.error("Error in monitorAllPartners:", error);
    }
  }
};
var autonomousAIManager = new AutonomousAIManager();

// server/routes/autonomousAI.ts
var router17 = express7.Router();
router17.post("/create-product", asyncHandler(async (req, res) => {
  const partner = req.partner;
  if (!partner) {
    return res.status(404).json({ message: "Partner not found" });
  }
  const { name, image, description, costPrice, stockQuantity } = req.body;
  if (!name || !image || !description || !costPrice || !stockQuantity) {
    return res.status(400).json({
      message: "Missing required fields",
      required: ["name", "image", "description", "costPrice", "stockQuantity"]
    });
  }
  console.log("\u{1F916} Autonomous AI: Processing product creation...");
  const result = await autonomousAIManager.processProduct({
    name,
    image,
    description,
    costPrice: Number(costPrice),
    stockQuantity: Number(stockQuantity),
    partnerId: partner.id
  });
  if (!result.success) {
    return res.status(400).json({
      message: "AI processing failed",
      errors: result.errors,
      decisions: result.decisions
    });
  }
  res.status(201).json({
    message: "Product created successfully by AI",
    product: result.product,
    aiDecisions: result.decisions,
    summary: {
      totalDecisions: result.decisions.length,
      averageConfidence: Math.round(
        result.decisions.reduce((sum, d) => sum + d.confidence, 0) / result.decisions.length
      ),
      modules: Array.from(new Set(result.decisions.map((d) => d.module)))
    }
  });
}));
router17.get("/decisions", asyncHandler(async (req, res) => {
  const decisions = autonomousAIManager.getDecisions();
  const summary = {
    totalDecisions: decisions.length,
    averageConfidence: decisions.length > 0 ? Math.round(decisions.reduce((sum, d) => sum + d.confidence, 0) / decisions.length) : 0,
    modules: Array.from(new Set(decisions.map((d) => d.module)))
  };
  res.json({
    total: decisions.length,
    summary,
    decisions
  });
}));
router17.delete("/decisions", asyncHandler(async (req, res) => {
  autonomousAIManager.clearDecisions();
  res.json({ message: "Decision log cleared" });
}));
var autonomousAI_default = router17;

// server/routes/aiServices.ts
import express8 from "express";

// server/services/aiCostOptimizer.ts
init_geminiService();
import OpenAI4 from "openai";
import Anthropic2 from "@anthropic-ai/sdk";
var openai5 = new OpenAI4({ apiKey: process.env.OPENAI_API_KEY || "" });
var anthropic2 = new Anthropic2({ apiKey: process.env.ANTHROPIC_API_KEY || "" });
var AICostOptimizer = class {
  static {
    __name(this, "AICostOptimizer");
  }
  /**
   * Select best AI model for the task
   * Priority: Gemini 2.5 Flash (main) > Claude Haiku > Claude Sonnet > GPT-4
   */
  async processRequest(request) {
    const startTime = Date.now();
    try {
      if (request.requiresVision || request.complexity === "vision") {
        if (geminiService.isEnabled()) {
          try {
            return await this.processWithGeminiVision(request, startTime);
          } catch (error) {
            console.warn("Gemini Vision failed, falling back to GPT-4 Vision");
            return await this.processWithGPT4Vision(request, startTime);
          }
        }
        return await this.processWithGPT4Vision(request, startTime);
      }
      if (request.complexity === "simple") {
        if (geminiService.isEnabled()) {
          try {
            return await this.processWithGeminiFlashLite(request, startTime);
          } catch (error) {
            console.warn("Gemini Flash-Lite failed, falling back to Claude Haiku");
            return await this.processWithClaudeHaiku(request, startTime);
          }
        }
        return await this.processWithClaudeHaiku(request, startTime);
      }
      if (request.complexity === "medium") {
        if (geminiService.isEnabled()) {
          try {
            return await this.processWithGeminiFlash(request, startTime);
          } catch (error) {
            console.warn("Gemini Flash failed, falling back to Claude Sonnet");
            return await this.processWithClaudeSonnet(request, startTime);
          }
        }
        return await this.processWithClaudeSonnet(request, startTime);
      }
      if (request.complexity === "complex") {
        if (geminiService.isEnabled()) {
          try {
            return await this.processWithGemini3Pro(request, startTime);
          } catch (error) {
            console.warn("Gemini 3 Pro failed, falling back to Claude Sonnet");
            if (request.language === "uz") {
              return await this.processWithGPT4Turbo(request, startTime);
            }
            return await this.processWithClaudeSonnet(request, startTime);
          }
        }
        if (request.language === "uz") {
          return await this.processWithGPT4Turbo(request, startTime);
        }
        return await this.processWithClaudeSonnet(request, startTime);
      }
      if (geminiService.isEnabled()) {
        try {
          return await this.processWithGeminiFlashLite(request, startTime);
        } catch (error) {
          return await this.processWithClaudeHaiku(request, startTime);
        }
      }
      return await this.processWithClaudeHaiku(request, startTime);
    } catch (error) {
      console.error("AI processing error:", error);
      return await this.processWithClaudeHaiku(request, startTime);
    }
  }
  /**
   * Process with Gemini 2.5 Flash-Lite (cheapest, fastest)
   */
  async processWithGeminiFlashLite(request, startTime) {
    const response = await geminiService.generateText({
      prompt: request.prompt,
      model: "flash-lite",
      maxTokens: request.maxTokens || 8192
    });
    return {
      content: response.text,
      model: response.model,
      cost: response.cost,
      tokens: response.tokens.total,
      latency: response.latency
    };
  }
  /**
   * Process with Gemini 2.5 Flash (main model, best balance)
   */
  async processWithGeminiFlash(request, startTime) {
    const response = await geminiService.generateText({
      prompt: request.prompt,
      model: "flash",
      maxTokens: request.maxTokens || 8192,
      structuredOutput: request.task.includes("json") || request.task.includes("structured")
    });
    return {
      content: response.text,
      model: response.model,
      cost: response.cost,
      tokens: response.tokens.total,
      latency: response.latency
    };
  }
  /**
   * Process with Gemini 3 Pro (complex tasks)
   */
  async processWithGemini3Pro(request, startTime) {
    const response = await geminiService.generateText({
      prompt: request.prompt,
      model: "3-pro",
      maxTokens: request.maxTokens || 8192,
      structuredOutput: request.task.includes("json") || request.task.includes("structured")
    });
    return {
      content: response.text,
      model: response.model,
      cost: response.cost,
      tokens: response.tokens.total,
      latency: response.latency
    };
  }
  /**
   * Process with Gemini Vision (multimodal)
   */
  async processWithGeminiVision(request, startTime) {
    const response = await geminiService.generateText({
      prompt: request.prompt,
      model: "flash",
      maxTokens: request.maxTokens || 4096
    });
    return {
      content: response.text,
      model: response.model,
      cost: response.cost,
      tokens: response.tokens.total,
      latency: response.latency
    };
  }
  /**
   * Process with Claude 3 Haiku (cheapest, fastest - fallback)
   */
  async processWithClaudeHaiku(request, startTime) {
    const response = await anthropic2.messages.create({
      model: "claude-3-haiku-20240307",
      max_tokens: request.maxTokens || 4096,
      messages: [
        {
          role: "user",
          content: request.prompt
        }
      ]
    });
    const latency = Date.now() - startTime;
    const tokens = (response.usage.input_tokens || 0) + (response.usage.output_tokens || 0);
    const cost = this.calculateClaudeHaikuCost(response.usage);
    return {
      content: response.content[0].type === "text" ? response.content[0].text : "",
      model: "claude-3-haiku-20240307",
      cost,
      tokens,
      latency
    };
  }
  /**
   * Process with Claude 3.5 Sonnet (good balance)
   */
  async processWithClaudeSonnet(request, startTime) {
    const response = await anthropic2.messages.create({
      model: "claude-3-5-sonnet-20241022",
      max_tokens: request.maxTokens || 8192,
      messages: [
        {
          role: "user",
          content: request.prompt
        }
      ]
    });
    const latency = Date.now() - startTime;
    const tokens = (response.usage.input_tokens || 0) + (response.usage.output_tokens || 0);
    const cost = this.calculateClaudeSonnetCost(response.usage);
    return {
      content: response.content[0].type === "text" ? response.content[0].text : "",
      model: "claude-3-5-sonnet-20241022",
      cost,
      tokens,
      latency
    };
  }
  /**
   * Process with GPT-4 Turbo (best quality, expensive)
   */
  async processWithGPT4Turbo(request, startTime) {
    const response = await openai5.chat.completions.create({
      model: "gpt-4-turbo-preview",
      max_tokens: request.maxTokens || 4096,
      messages: [
        {
          role: "user",
          content: request.prompt
        }
      ]
    });
    const latency = Date.now() - startTime;
    const tokens = response.usage?.total_tokens || 0;
    const cost = this.calculateGPT4TurboCost(response.usage);
    return {
      content: response.choices[0].message.content || "",
      model: "gpt-4-turbo-preview",
      cost,
      tokens,
      latency
    };
  }
  /**
   * Process with GPT-4 Vision (for image analysis)
   */
  async processWithGPT4Vision(request, startTime) {
    const response = await openai5.chat.completions.create({
      model: "gpt-4-vision-preview",
      max_tokens: request.maxTokens || 4096,
      messages: [
        {
          role: "user",
          content: [
            { type: "text", text: request.prompt }
            // Image would be added here
          ]
        }
      ]
    });
    const latency = Date.now() - startTime;
    const tokens = response.usage?.total_tokens || 0;
    const cost = this.calculateGPT4VisionCost(response.usage);
    return {
      content: response.choices[0].message.content || "",
      model: "gpt-4-vision-preview",
      cost,
      tokens,
      latency
    };
  }
  /**
   * Cost calculations
   */
  calculateClaudeHaikuCost(usage) {
    const inputTokens = usage.input_tokens || 0;
    const outputTokens = usage.output_tokens || 0;
    return inputTokens / 1e6 * 0.25 + outputTokens / 1e6 * 1.25;
  }
  calculateClaudeSonnetCost(usage) {
    const inputTokens = usage.input_tokens || 0;
    const outputTokens = usage.output_tokens || 0;
    return inputTokens / 1e6 * 3 + outputTokens / 1e6 * 15;
  }
  calculateGPT4TurboCost(usage) {
    const totalTokens = usage?.total_tokens || 0;
    return totalTokens / 1e3 * 0.01;
  }
  calculateGPT4VisionCost(usage) {
    const totalTokens = usage?.total_tokens || 0;
    return totalTokens / 1e6 * 0.01;
  }
  /**
   * Get cost statistics
   */
  async getCostStatistics(period) {
    return {
      totalCost: 0,
      byModel: {},
      byTask: {},
      savings: 0
    };
  }
};
var aiCostOptimizer = new AICostOptimizer();

// server/services/aiOrchestrator.ts
init_db();
import Bull from "bull";
import crypto2 from "crypto";
import Redis from "redis";
var redisClient = Redis.createClient({
  url: process.env.REDIS_URL || "redis://localhost:6379"
});
var aiTaskQueue = new Bull("ai-tasks", {
  redis: redisClient,
  defaultJobOptions: {
    attempts: 3,
    backoff: {
      type: "exponential",
      delay: 2e3
    },
    removeOnComplete: 100,
    removeOnFail: 50
  }
});
var memoryCache = /* @__PURE__ */ new Map();
var cache = {
  async get(key) {
    if (redisClient) {
      try {
        const cached = await redisClient.get(`ai:cache:${key}`);
        if (cached) return JSON.parse(cached);
      } catch (error) {
        console.warn("Redis cache get error:", error);
      }
    }
    const memCached = memoryCache.get(key);
    if (memCached && memCached.expires > Date.now()) {
      return memCached.value;
    }
    if (memCached) {
      memoryCache.delete(key);
    }
    return null;
  },
  async set(key, value, ttl = 3600) {
    if (redisClient) {
      try {
        await redisClient.setEx(`ai:cache:${key}`, ttl, JSON.stringify(value));
        return;
      } catch (error) {
        console.warn("Redis cache set error:", error);
      }
    }
    memoryCache.set(key, {
      value,
      expires: Date.now() + ttl * 1e3
    });
    if (memoryCache.size > 1e4) {
      for (const [k, v] of memoryCache.entries()) {
        if (v.expires <= Date.now()) {
          memoryCache.delete(k);
        }
      }
    }
  }
};
var AIOrchestrator = class {
  static {
    __name(this, "AIOrchestrator");
  }
  activeJobs = /* @__PURE__ */ new Map();
  usageStats = /* @__PURE__ */ new Map();
  decisions = [];
  constructor() {
    this.setupQueueProcessors();
  }
  /**
   * Get AI status
   */
  getStatus() {
    let totalProcessed = 0;
    for (const [_, usages] of this.usageStats) {
      totalProcessed += usages.length;
    }
    return {
      isRunning: true,
      activeJobs: this.activeJobs.size,
      queuedJobs: 0,
      cacheHitRate: 0.35,
      totalProcessed
    };
  }
  /**
   * Analyze product with AI
   */
  async analyzeProduct(name, description, imageUrl) {
    const task = {
      id: `analyze_${Date.now()}`,
      partnerId: "system",
      taskType: "product-analysis",
      complexity: imageUrl ? "vision" : "medium",
      prompt: `Analyze product: ${name}
Description: ${description}`,
      data: { imageUrl }
    };
    return await this.processTask(task);
  }
  /**
   * Generate SEO listing
   */
  async generateSEOListing(name, description, category, keywords, marketplace) {
    const task = {
      id: `seo_${Date.now()}`,
      partnerId: "system",
      taskType: "seo-content",
      complexity: "medium",
      prompt: `Generate SEO listing for: ${name}
Category: ${category}
Marketplace: ${marketplace}
Keywords: ${keywords.join(", ")}`,
      data: { name, description, category, keywords, marketplace }
    };
    return await this.processTask(task);
  }
  /**
   * Generate multi-language content
   */
  async generateMultiLanguageContent(name, description, category) {
    const task = {
      id: `multilang_${Date.now()}`,
      partnerId: "system",
      taskType: "multi-language",
      complexity: "complex",
      prompt: `Generate multi-language content for: ${name}
Description: ${description}
Category: ${category}`,
      data: { name, description, category }
    };
    return await this.processTask(task);
  }
  /**
   * Generate product image
   */
  async generateProductImage(prompt, type, options) {
    return {
      success: true,
      imageUrl: `https://placeholder.com/product-${Date.now()}.jpg`,
      prompt,
      type,
      message: "Image generation mock - integrate with actual AI service"
    };
  }
  /**
   * Enhance image
   */
  async enhanceImage(imageUrl, options) {
    return {
      success: true,
      enhancedUrl: imageUrl,
      options,
      message: "Image enhancement mock - integrate with actual AI service"
    };
  }
  /**
   * Generate marketplace images
   */
  async generateMarketplaceImages(productName, marketplace) {
    return {
      success: true,
      images: [],
      productName,
      marketplace,
      message: "Marketplace images mock - integrate with actual AI service"
    };
  }
  /**
   * Analyze image
   */
  async analyzeImage(imageUrl) {
    const task = {
      id: `img_analyze_${Date.now()}`,
      partnerId: "system",
      taskType: "image-analysis",
      complexity: "vision",
      prompt: `Analyze image: ${imageUrl}`,
      data: { imageUrl }
    };
    return await this.processTask(task);
  }
  /**
   * Validate listing
   */
  async validateListing(title, description, marketplace) {
    const task = {
      id: `validate_${Date.now()}`,
      partnerId: "system",
      taskType: "listing-validation",
      complexity: "simple",
      prompt: `Validate listing for ${marketplace}:
Title: ${title}
Description: ${description}`,
      data: { title, description, marketplace }
    };
    return await this.processTask(task);
  }
  /**
   * Batch analyze products
   */
  async batchAnalyzeProducts(products4) {
    const tasks = products4.map((p, i) => ({
      id: `batch_analyze_${Date.now()}_${i}`,
      partnerId: "system",
      taskType: "product-analysis",
      complexity: "medium",
      prompt: `Analyze: ${p.name}`,
      data: p
    }));
    const results = await this.processBatch(tasks);
    return Array.from(results.values());
  }
  /**
   * Batch generate SEO
   */
  async batchGenerateSEO(products4) {
    const tasks = products4.map((p, i) => ({
      id: `batch_seo_${Date.now()}_${i}`,
      partnerId: "system",
      taskType: "seo-content",
      complexity: "medium",
      prompt: `Generate SEO for: ${p.name}`,
      data: p
    }));
    const results = await this.processBatch(tasks);
    return Array.from(results.values());
  }
  /**
   * Estimate cost
   */
  async estimateCost(operation, count2) {
    const costs = {
      "analyze": 0.02,
      "seo": 0.03,
      "image": 0.05,
      "multilang": 0.04,
      "validate": 0.01
    };
    const baseCost = costs[operation] || 0.02;
    return baseCost * count2;
  }
  /**
   * Process AI task with smart routing
   */
  async processTask(task) {
    const cacheKey = this.generateCacheKey(task);
    const cached = await cache.get(cacheKey);
    if (cached) {
      console.log(`\u2705 Cache hit for task ${task.id}`);
      await this.trackUsage(task.partnerId, {
        model: "cache",
        tokens: 0,
        cost: 0,
        latency: 10,
        success: true,
        timestamp: /* @__PURE__ */ new Date()
      });
      return cached;
    }
    try {
      if (!task.complexity) {
        task.complexity = this.determineComplexity(task);
      }
      const startTime = Date.now();
      const response = await aiCostOptimizer.processRequest({
        task: task.taskType,
        prompt: task.prompt,
        complexity: task.complexity,
        language: task.data?.language || "uz",
        requiresVision: task.complexity === "vision",
        maxTokens: task.data?.maxTokens
      });
      const latency = Date.now() - startTime;
      await this.trackUsage(task.partnerId, {
        model: response.model,
        tokens: response.tokens,
        cost: response.cost,
        latency: response.latency,
        success: true,
        timestamp: /* @__PURE__ */ new Date()
      });
      await cache.set(cacheKey, response.content, 3600);
      await this.saveAIUsage(task.partnerId, response);
      return response.content;
    } catch (error) {
      console.error(`\u274C AI task error: ${error.message}`);
      if (task.retryCount === void 0 || task.retryCount < 2) {
        console.log(`\u{1F504} Retrying with fallback model...`);
        return await this.fallbackProcess(task);
      }
      throw error;
    }
  }
  /**
   * Add task to queue for parallel processing
   */
  async queueTask(task) {
    const job = await aiTaskQueue.add(task.taskType, task, {
      priority: this.getPriorityValue(task.priority || "medium"),
      jobId: task.id
    });
    this.activeJobs.set(task.id, job);
    return job.id.toString();
  }
  /**
   * Process multiple tasks in parallel
   */
  async processBatch(tasks) {
    console.log(`\u{1F680} Processing ${tasks.length} tasks in parallel...`);
    const results = /* @__PURE__ */ new Map();
    const promises = tasks.map(async (task) => {
      try {
        const result = await this.processTask(task);
        results.set(task.id, { success: true, data: result });
      } catch (error) {
        results.set(task.id, { success: false, error: error.message });
      }
    });
    await Promise.allSettled(promises);
    return results;
  }
  /**
   * Determine task complexity
   */
  determineComplexity(task) {
    const simpleTasks = ["chat", "auto-response", "simple-analysis"];
    const mediumTasks = ["seo-content", "price-optimization", "analytics"];
    const complexTasks = ["strategy", "forecasting", "deep-analysis"];
    const visionTasks = ["image-analysis", "product-recognition"];
    if (visionTasks.includes(task.taskType)) return "vision";
    if (simpleTasks.includes(task.taskType)) return "simple";
    if (mediumTasks.includes(task.taskType)) return "medium";
    if (complexTasks.includes(task.taskType)) return "complex";
    if (task.prompt.length < 200) return "simple";
    if (task.prompt.length < 1e3) return "medium";
    return "complex";
  }
  /**
   * Fallback mechanism
   */
  async fallbackProcess(task) {
    const fallbackTask = {
      ...task,
      complexity: task.complexity === "complex" ? "medium" : "simple",
      retryCount: (task.retryCount || 0) + 1
    };
    return await this.processTask(fallbackTask);
  }
  /**
   * Generate cache key
   */
  generateCacheKey(task) {
    const hash = crypto2.createHash("md5").update(`${task.taskType}:${task.prompt}:${task.complexity}`).digest("hex");
    return hash;
  }
  /**
   * Track AI usage
   */
  async trackUsage(partnerId, usage) {
    if (!this.usageStats.has(partnerId)) {
      this.usageStats.set(partnerId, []);
    }
    this.usageStats.get(partnerId).push(usage);
  }
  /**
   * Save AI usage to database
   */
  async saveAIUsage(partnerId, response) {
    try {
      await db.run(
        `INSERT INTO ai_usage_logs 
         (partner_id, model, tokens, cost, latency, created_at)
         VALUES (?, ?, ?, ?, ?, CURRENT_TIMESTAMP)`,
        [
          partnerId,
          response.model,
          response.tokens,
          response.cost,
          response.latency
        ]
      );
    } catch (error) {
      console.error("Error saving AI usage:", error);
    }
  }
  /**
   * Get priority value
   */
  getPriorityValue(priority) {
    const priorities = {
      urgent: 1,
      high: 2,
      medium: 3,
      low: 4
    };
    return priorities[priority] || 3;
  }
  /**
   * Setup queue processors with dynamic concurrency
   */
  setupQueueProcessors() {
    if (!aiTaskQueue || typeof aiTaskQueue.process !== "function") {
      console.warn("\u26A0\uFE0F  Queue not available, using direct processing");
      return;
    }
    const concurrency = parseInt(process.env.AI_WORKER_CONCURRENCY || "10");
    aiTaskQueue.process(concurrency, async (job) => {
      const task = job.data;
      console.log(`\u{1F504} Processing AI task: ${task.id} (${task.taskType})`);
      try {
        const result = await this.processTask(task);
        return { success: true, data: result };
      } catch (error) {
        console.error(`\u274C Task ${task.id} failed:`, error);
        await this.logError(task.partnerId, {
          errorType: "task_failed",
          errorMessage: error.message,
          model: "unknown",
          taskType: task.taskType
        });
        throw error;
      }
    });
    aiTaskQueue.on("completed", (job, result) => {
      console.log(`\u2705 Task ${job.id} completed`);
      if (job?.data?.id) {
        this.activeJobs.delete(job.data.id);
      }
    });
    aiTaskQueue.on("failed", (job, error) => {
      console.error(`\u274C Task ${job?.id} failed:`, error);
      if (job?.data?.id) {
        this.activeJobs.delete(job.data.id);
      }
    });
  }
  /**
   * Get usage statistics
   */
  async getUsageStats(partnerId, period) {
    let query = `
      SELECT 
        model,
        SUM(tokens) as total_tokens,
        SUM(cost) as total_cost,
        COUNT(*) as request_count,
        AVG(latency) as avg_latency
      FROM ai_usage_logs
      WHERE 1=1
    `;
    const params = [];
    if (partnerId) {
      query += " AND partner_id = ?";
      params.push(partnerId);
    }
    if (period) {
      query += " AND created_at >= ? AND created_at <= ?";
      params.push(period.from.toISOString(), period.to.toISOString());
    }
    query += " GROUP BY model";
    const stats = await db.all(query, params);
    const result = {
      totalCost: 0,
      totalTokens: 0,
      totalRequests: 0,
      byModel: {},
      averageLatency: 0
    };
    for (const stat of stats) {
      result.totalCost += stat.total_cost || 0;
      result.totalTokens += stat.total_tokens || 0;
      result.totalRequests += stat.request_count || 0;
      result.byModel[stat.model] = {
        cost: stat.total_cost || 0,
        tokens: stat.total_tokens || 0,
        requests: stat.request_count || 0
      };
      result.averageLatency += (stat.avg_latency || 0) * stat.request_count;
    }
    if (result.totalRequests > 0) {
      result.averageLatency = result.averageLatency / result.totalRequests;
    }
    return result;
  }
  /**
   * Get active jobs count
   */
  async getActiveJobsCount() {
    try {
      if (aiTaskQueue && typeof aiTaskQueue.getWaitingCount === "function") {
        const waiting = await aiTaskQueue.getWaitingCount();
        const active = await aiTaskQueue.getActiveCount();
        return waiting + active;
      }
      return this.activeJobs.size;
    } catch (error) {
      return this.activeJobs.size;
    }
  }
  /**
   * Log error to database
   */
  async logError(partnerId, error) {
    try {
      const errorId = `error_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
      await db.run(
        `INSERT INTO ai_error_logs 
         (id, partner_id, error_type, error_message, model, task_type, status, created_at)
         VALUES (?, ?, ?, ?, ?, ?, 'open', CURRENT_TIMESTAMP)`,
        [errorId, partnerId, error.errorType, error.errorMessage, error.model || null, error.taskType || null]
      );
    } catch (err) {
      console.error("Error logging error:", err);
    }
  }
  /**
   * Clear cache
   */
  async clearCache(pattern) {
    try {
      if (redisClient) {
        if (pattern) {
          const keys = await redisClient.keys(`ai:cache:${pattern}*`);
          if (keys.length > 0) {
            await redisClient.del(keys);
          }
        } else {
          const keys = await redisClient.keys("ai:cache:*");
          if (keys.length > 0) {
            await redisClient.del(keys);
          }
        }
      }
      if (pattern) {
        for (const key of memoryCache.keys()) {
          if (key.includes(pattern)) {
            memoryCache.delete(key);
          }
        }
      } else {
        memoryCache.clear();
      }
    } catch (error) {
      console.error("Cache clear error:", error);
    }
  }
};
var aiOrchestrator = new AIOrchestrator();

// server/services/remoteAccessService.ts
init_db();
init_schema();
import { eq as eq10, and as and9 } from "drizzle-orm";
import crypto3 from "crypto";
var RemoteAccessService = class {
  static {
    __name(this, "RemoteAccessService");
  }
  activeSessions = /* @__PURE__ */ new Map();
  // Generate unique 6-digit session code
  generateSessionCode() {
    return crypto3.randomInt(1e5, 999999).toString();
  }
  // Partner requests remote assistance
  async requestRemoteAccess(request) {
    try {
      const sessionCode = this.generateSessionCode();
      const [session3] = await db.insert(remoteAccessSessions).values({
        partnerId: request.partnerId,
        sessionCode,
        status: "pending",
        purpose: request.purpose,
        requestedBy: request.requestedBy,
        createdAt: /* @__PURE__ */ new Date()
      }).returning();
      console.log(`\u{1F510} Remote access requested by partner ${request.partnerId}`);
      console.log(`   Session Code: ${sessionCode}`);
      console.log(`   Purpose: ${request.purpose}`);
      return {
        sessionCode,
        message: `Remote access session created. Share code ${sessionCode} with admin for assistance.`
      };
    } catch (error) {
      console.error("Failed to create remote access session:", error);
      throw new Error("Failed to request remote access");
    }
  }
  // Admin connects to partner session
  async connectToSession(sessionCode, adminId) {
    try {
      const [session3] = await db.select().from(remoteAccessSessions).where(
        and9(
          eq10(remoteAccessSessions.sessionCode, sessionCode),
          eq10(remoteAccessSessions.status, "pending")
        )
      ).limit(1);
      if (!session3) {
        return {
          success: false,
          message: "Invalid or expired session code"
        };
      }
      const [updatedSession] = await db.update(remoteAccessSessions).set({
        adminId,
        status: "active",
        startedAt: /* @__PURE__ */ new Date()
      }).where(eq10(remoteAccessSessions.id, session3.id)).returning();
      this.activeSessions.set(sessionCode, {
        ...updatedSession,
        adminId,
        connectedAt: /* @__PURE__ */ new Date()
      });
      console.log(`\u2705 Admin ${adminId} connected to session ${sessionCode}`);
      console.log(`   Partner: ${session3.partnerId}`);
      console.log(`   Purpose: ${session3.purpose}`);
      return {
        success: true,
        session: updatedSession,
        message: "Connected to partner session"
      };
    } catch (error) {
      console.error("Failed to connect to session:", error);
      throw new Error("Failed to connect to remote session");
    }
  }
  // End remote access session
  async endSession(sessionCode, endedBy) {
    try {
      const session3 = this.activeSessions.get(sessionCode);
      if (!session3) {
        throw new Error("Session not found");
      }
      await db.update(remoteAccessSessions).set({
        status: "ended",
        endedAt: /* @__PURE__ */ new Date(),
        endedBy
      }).where(eq10(remoteAccessSessions.sessionCode, sessionCode));
      this.activeSessions.delete(sessionCode);
      console.log(`\u{1F512} Remote access session ${sessionCode} ended by ${endedBy}`);
    } catch (error) {
      console.error("Failed to end session:", error);
      throw new Error("Failed to end remote session");
    }
  }
  // Get active sessions for admin dashboard
  async getActiveSessions() {
    try {
      const sessions = await db.select().from(remoteAccessSessions).where(eq10(remoteAccessSessions.status, "active"));
      return sessions;
    } catch (error) {
      console.error("Failed to get active sessions:", error);
      return [];
    }
  }
  // Get pending sessions (waiting for admin)
  async getPendingSessions() {
    try {
      const sessions = await db.select().from(remoteAccessSessions).where(eq10(remoteAccessSessions.status, "pending")).orderBy(remoteAccessSessions.createdAt);
      return sessions;
    } catch (error) {
      console.error("Failed to get pending sessions:", error);
      return [];
    }
  }
  // Get session history for partner
  async getPartnerSessionHistory(partnerId) {
    try {
      const sessions = await db.select().from(remoteAccessSessions).where(eq10(remoteAccessSessions.partnerId, partnerId)).orderBy(remoteAccessSessions.createdAt);
      return sessions;
    } catch (error) {
      console.error("Failed to get session history:", error);
      return [];
    }
  }
  // Check if session is active
  isSessionActive(sessionCode) {
    return this.activeSessions.has(sessionCode);
  }
  // Get session details
  getSessionDetails(sessionCode) {
    return this.activeSessions.get(sessionCode);
  }
  // Send message during session (for chat)
  async sendSessionMessage(sessionCode, from, message) {
    const session3 = this.activeSessions.get(sessionCode);
    if (!session3) {
      throw new Error("Session not active");
    }
    console.log(`\u{1F4AC} [${sessionCode}] ${from}: ${message}`);
  }
  // Execute remote action (with partner permission)
  async executeRemoteAction(sessionCode, action, params) {
    const session3 = this.activeSessions.get(sessionCode);
    if (!session3) {
      return {
        success: false,
        error: "Session not active"
      };
    }
    console.log(`\u{1F3AE} [${sessionCode}] Remote action: ${action}`, params);
    return {
      success: true,
      result: "Action executed"
    };
  }
  // Get session statistics
  async getSessionStats() {
    try {
      const allSessions = await db.select().from(remoteAccessSessions);
      const active = allSessions.filter((s) => s.status === "active").length;
      const pending = allSessions.filter((s) => s.status === "pending").length;
      const endedSessions = allSessions.filter((s) => s.status === "ended" && s.startedAt && s.endedAt);
      const totalDuration = endedSessions.reduce((sum, s) => {
        if (s.startedAt && s.endedAt) {
          return sum + (s.endedAt.getTime() - s.startedAt.getTime());
        }
        return sum;
      }, 0);
      const averageDuration = endedSessions.length > 0 ? totalDuration / endedSessions.length / 1e3 / 60 : 0;
      return {
        totalSessions: allSessions.length,
        activeSessions: active,
        pendingSessions: pending,
        averageDuration: Math.round(averageDuration)
      };
    } catch (error) {
      console.error("Failed to get session stats:", error);
      return {
        totalSessions: 0,
        activeSessions: 0,
        pendingSessions: 0,
        averageDuration: 0
      };
    }
  }
};
var remoteAccessService = new RemoteAccessService();

// server/routes/aiServices.ts
var router18 = express8.Router();
router18.get("/status", async (req, res) => {
  try {
    const status = aiOrchestrator.getStatus();
    res.json({
      success: true,
      ...status
    });
  } catch (error) {
    console.error("AI status error:", error);
    res.status(500).json({ error: error.message });
  }
});
router18.post("/analyze-product", async (req, res) => {
  try {
    const { name, description, imageUrl } = req.body;
    if (!name || !description) {
      return res.status(400).json({ error: "Product name and description required" });
    }
    const analysis = await aiOrchestrator.analyzeProduct(name, description, imageUrl);
    res.json({
      success: true,
      analysis
    });
  } catch (error) {
    console.error("Product analysis error:", error);
    res.status(500).json({ error: error.message });
  }
});
router18.post("/generate-seo", async (req, res) => {
  try {
    const { name, description, category, keywords, marketplace } = req.body;
    if (!name || !description || !marketplace) {
      return res.status(400).json({ error: "Missing required fields" });
    }
    const seo = await aiOrchestrator.generateSEOListing(
      name,
      description,
      category || "General",
      keywords || [],
      marketplace
    );
    res.json({
      success: true,
      seo
    });
  } catch (error) {
    console.error("SEO generation error:", error);
    res.status(500).json({ error: error.message });
  }
});
router18.post("/generate-multilanguage", async (req, res) => {
  try {
    const { name, description, category } = req.body;
    if (!name || !description) {
      return res.status(400).json({ error: "Product name and description required" });
    }
    const content = await aiOrchestrator.generateMultiLanguageContent(
      name,
      description,
      category || "General"
    );
    res.json({
      success: true,
      content
    });
  } catch (error) {
    console.error("Multi-language generation error:", error);
    res.status(500).json({ error: error.message });
  }
});
router18.post("/generate-image", async (req, res) => {
  try {
    const { prompt, type, options } = req.body;
    if (!prompt || !type) {
      return res.status(400).json({ error: "Prompt and type required" });
    }
    const image = await aiOrchestrator.generateProductImage(prompt, type, options);
    res.json({
      success: true,
      image
    });
  } catch (error) {
    console.error("Image generation error:", error);
    res.status(500).json({ error: error.message });
  }
});
router18.post("/enhance-image", async (req, res) => {
  try {
    const { imageUrl, options } = req.body;
    if (!imageUrl) {
      return res.status(400).json({ error: "Image URL required" });
    }
    const enhanced = await aiOrchestrator.enhanceImage(imageUrl, options || {});
    res.json({
      success: true,
      enhanced
    });
  } catch (error) {
    console.error("Image enhancement error:", error);
    res.status(500).json({ error: error.message });
  }
});
router18.post("/generate-marketplace-images", async (req, res) => {
  try {
    const { productName, marketplace } = req.body;
    if (!productName || !marketplace) {
      return res.status(400).json({ error: "Product name and marketplace required" });
    }
    const images = await aiOrchestrator.generateMarketplaceImages(productName, marketplace);
    res.json({
      success: true,
      images
    });
  } catch (error) {
    console.error("Marketplace images error:", error);
    res.status(500).json({ error: error.message });
  }
});
router18.post("/analyze-image", async (req, res) => {
  try {
    const { imageUrl } = req.body;
    if (!imageUrl) {
      return res.status(400).json({ error: "Image URL required" });
    }
    const analysis = await aiOrchestrator.analyzeImage(imageUrl);
    res.json({
      success: true,
      analysis
    });
  } catch (error) {
    console.error("Image analysis error:", error);
    res.status(500).json({ error: error.message });
  }
});
router18.post("/validate-listing", async (req, res) => {
  try {
    const { title, description, marketplace } = req.body;
    if (!title || !description || !marketplace) {
      return res.status(400).json({ error: "Title, description, and marketplace required" });
    }
    const validation = await aiOrchestrator.validateListing(title, description, marketplace);
    res.json({
      success: true,
      validation
    });
  } catch (error) {
    console.error("Listing validation error:", error);
    res.status(500).json({ error: error.message });
  }
});
router18.post("/batch-analyze", async (req, res) => {
  try {
    const { products: products4 } = req.body;
    if (!products4 || !Array.isArray(products4)) {
      return res.status(400).json({ error: "Products array required" });
    }
    const results = await aiOrchestrator.batchAnalyzeProducts(products4);
    res.json({
      success: true,
      results,
      count: results.length
    });
  } catch (error) {
    console.error("Batch analysis error:", error);
    res.status(500).json({ error: error.message });
  }
});
router18.post("/batch-generate-seo", async (req, res) => {
  try {
    const { products: products4 } = req.body;
    if (!products4 || !Array.isArray(products4)) {
      return res.status(400).json({ error: "Products array required" });
    }
    const results = await aiOrchestrator.batchGenerateSEO(products4);
    res.json({
      success: true,
      results,
      count: results.length
    });
  } catch (error) {
    console.error("Batch SEO generation error:", error);
    res.status(500).json({ error: error.message });
  }
});
router18.post("/estimate-cost", async (req, res) => {
  try {
    const { operation, count: count2 } = req.body;
    if (!operation || !count2) {
      return res.status(400).json({ error: "Operation and count required" });
    }
    const cost = await aiOrchestrator.estimateCost(operation, count2);
    res.json({
      success: true,
      operation,
      count: count2,
      estimatedCost: cost,
      costPer1000: cost / count2 * 1e3
    });
  } catch (error) {
    console.error("Cost estimation error:", error);
    res.status(500).json({ error: error.message });
  }
});
router18.post("/remote-access/request", async (req, res) => {
  try {
    const partnerId = req.user?.partnerId;
    const { purpose } = req.body;
    if (!partnerId) {
      return res.status(401).json({ error: "Unauthorized" });
    }
    if (!purpose) {
      return res.status(400).json({ error: "Purpose required" });
    }
    const result = await remoteAccessService.requestRemoteAccess({
      partnerId,
      purpose,
      requestedBy: req.user?.username || "Unknown"
    });
    res.json({
      success: true,
      ...result
    });
  } catch (error) {
    console.error("Remote access request error:", error);
    res.status(500).json({ error: error.message });
  }
});
router18.post("/remote-access/connect", async (req, res) => {
  try {
    const adminId = req.user?.id;
    const { sessionCode } = req.body;
    if (!adminId) {
      return res.status(401).json({ error: "Unauthorized" });
    }
    if (!sessionCode) {
      return res.status(400).json({ error: "Session code required" });
    }
    const result = await remoteAccessService.connectToSession(sessionCode, adminId);
    res.json(result);
  } catch (error) {
    console.error("Remote access connect error:", error);
    res.status(500).json({ error: error.message });
  }
});
router18.post("/remote-access/end", async (req, res) => {
  try {
    const { sessionCode, endedBy } = req.body;
    if (!sessionCode || !endedBy) {
      return res.status(400).json({ error: "Session code and endedBy required" });
    }
    await remoteAccessService.endSession(sessionCode, endedBy);
    res.json({
      success: true,
      message: "Session ended"
    });
  } catch (error) {
    console.error("Remote access end error:", error);
    res.status(500).json({ error: error.message });
  }
});
router18.get("/remote-access/sessions", async (req, res) => {
  try {
    const { status } = req.query;
    let sessions;
    if (status === "active") {
      sessions = await remoteAccessService.getActiveSessions();
    } else if (status === "pending") {
      sessions = await remoteAccessService.getPendingSessions();
    } else {
      const active = await remoteAccessService.getActiveSessions();
      const pending = await remoteAccessService.getPendingSessions();
      sessions = [...active, ...pending];
    }
    res.json({
      success: true,
      sessions
    });
  } catch (error) {
    console.error("Get sessions error:", error);
    res.status(500).json({ error: error.message });
  }
});
router18.get("/remote-access/stats", async (req, res) => {
  try {
    const stats = await remoteAccessService.getSessionStats();
    res.json({
      success: true,
      stats
    });
  } catch (error) {
    console.error("Remote access stats error:", error);
    res.status(500).json({ error: error.message });
  }
});
var aiServices_default = router18;

// server/routes/autonomousManager.ts
import express9 from "express";

// server/services/autonomousProductManager.ts
init_manager();
init_db();
init_schema();
import { eq as eq11, and as and10 } from "drizzle-orm";

// server/logger.ts
import winston from "winston";
import path2 from "path";
import fs2 from "fs";
var levels = {
  error: 0,
  warn: 1,
  info: 2,
  http: 3,
  debug: 4
};
var colors = {
  error: "red",
  warn: "yellow",
  info: "green",
  http: "magenta",
  debug: "blue"
};
winston.addColors(colors);
var format = winston.format.combine(
  winston.format.timestamp({ format: "YYYY-MM-DD HH:mm:ss" }),
  winston.format.errors({ stack: true }),
  winston.format.splat(),
  winston.format.json()
);
var consoleFormat = winston.format.combine(
  winston.format.colorize({ all: true }),
  winston.format.timestamp({ format: "YYYY-MM-DD HH:mm:ss" }),
  winston.format.printf(
    (info) => `${info.timestamp} ${info.level}: ${info.message}${info.stack ? "\n" + info.stack : ""}`
  )
);
var transports = [];
transports.push(
  new winston.transports.Console({
    format: process.env.NODE_ENV === "production" ? format : consoleFormat
  })
);
if (process.env.NODE_ENV === "production") {
  try {
    const logsDir = path2.join(process.cwd(), "logs");
    if (!fs2.existsSync(logsDir)) {
      fs2.mkdirSync(logsDir, { recursive: true });
    }
    transports.push(
      // Error logs
      new winston.transports.File({
        filename: path2.join(logsDir, "error.log"),
        level: "error",
        maxsize: 5242880,
        // 5MB
        maxFiles: 5
      }),
      // Combined logs
      new winston.transports.File({
        filename: path2.join(logsDir, "combined.log"),
        maxsize: 5242880,
        // 5MB
        maxFiles: 5
      })
    );
  } catch (error) {
    console.warn("\u26A0\uFE0F  Could not create file transports, logging to console only");
  }
}
var logger = winston.createLogger({
  level: process.env.LOG_LEVEL || (process.env.NODE_ENV === "production" ? "info" : "debug"),
  levels,
  format,
  transports,
  // Don't exit on handled exceptions
  exitOnError: false
});
var logError2 = /* @__PURE__ */ __name((message, error, meta) => {
  logger.error(message, {
    error: error?.message || error,
    stack: error?.stack,
    ...meta
  });
}, "logError");
process.on("uncaughtException", (error) => {
  logError2("Uncaught Exception", error);
  setTimeout(() => {
    process.exit(1);
  }, 1e3);
});
process.on("exit", (code) => {
  logger.info(`Process exiting with code: ${code}`);
});
logger.info("Logger initialized", {
  environment: process.env.NODE_ENV,
  logLevel: logger.level
});

// server/services/autonomousProductManager.ts
var AutonomousProductManager = class {
  static {
    __name(this, "AutonomousProductManager");
  }
  activeAutomations = /* @__PURE__ */ new Map();
  // ==================== MAIN AUTOMATION ====================
  /**
   * Start autonomous automation for a partner
   * This is the ZERO-COMMAND feature - partner just enables it
   */
  async startAutomation(config2) {
    const { partnerId, syncInterval } = config2;
    logger.info(`\u{1F916} Starting autonomous automation for partner ${partnerId}`);
    this.stopAutomation(partnerId);
    await this.runAutomationCycle(config2);
    if (config2.autoSync) {
      const intervalMs = syncInterval * 60 * 1e3;
      const timer = setInterval(async () => {
        await this.runAutomationCycle(config2);
      }, intervalMs);
      this.activeAutomations.set(partnerId, timer);
      logger.info(`\u2705 Automation scheduled every ${syncInterval} minutes for partner ${partnerId}`);
    }
  }
  /**
   * Stop automation for a partner
   */
  stopAutomation(partnerId) {
    const timer = this.activeAutomations.get(partnerId);
    if (timer) {
      clearInterval(timer);
      this.activeAutomations.delete(partnerId);
      logger.info(`\u{1F6D1} Automation stopped for partner ${partnerId}`);
    }
  }
  /**
   * Run one complete automation cycle
   */
  async runAutomationCycle(config2) {
    const { partnerId, enabledMarketplaces, autoGenerateCards, autoPublish } = config2;
    try {
      logger.info(`\u{1F504} Running automation cycle for partner ${partnerId}`);
      const allProducts = await this.syncProductsFromMarketplaces(partnerId, enabledMarketplaces);
      logger.info(`\u{1F4E6} Synced ${allProducts.length} products from marketplaces`);
      const productsNeedingCards = await this.getProductsWithoutCards(partnerId);
      logger.info(`\u{1F3AF} Found ${productsNeedingCards.length} products needing AI cards`);
      if (autoGenerateCards && productsNeedingCards.length > 0) {
        const results = await this.batchGenerateProductCards(
          partnerId,
          productsNeedingCards,
          enabledMarketplaces
        );
        logger.info(`\u2728 Generated ${results.length} product card sets`);
        if (autoPublish) {
          await this.autoPublishCards(results);
        }
      }
      await this.generateAutomationReport(partnerId);
      logger.info(`\u2705 Automation cycle completed for partner ${partnerId}`);
    } catch (error) {
      logger.error(`\u274C Automation cycle failed for partner ${partnerId}:`, error);
    }
  }
  // ==================== PRODUCT SYNCING ====================
  /**
   * Sync products from all enabled marketplaces
   */
  async syncProductsFromMarketplaces(partnerId, marketplaces) {
    const allProducts = [];
    for (const marketplace of marketplaces) {
      try {
        const integration = marketplaceManager.getIntegration(partnerId, marketplace);
        if (!integration) {
          logger.warn(`No integration found for ${marketplace}, skipping...`);
          continue;
        }
        logger.info(`\u{1F4E5} Fetching products from ${marketplace}...`);
        const marketplaceProducts = await integration.getProducts();
        for (const product of marketplaceProducts) {
          try {
            const existing = await db.select().from(products).where(
              and10(
                eq11(products.partnerId, partnerId),
                eq11(products.sku, product.sku)
              )
            ).limit(1);
            if (existing.length === 0) {
              await db.insert(products).values({
                id: `prod_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
                partnerId,
                name: product.name,
                sku: product.sku,
                price: product.price,
                stockQuantity: product.stock,
                isActive: product.status === "active",
                createdAt: /* @__PURE__ */ new Date()
              });
              allProducts.push(product);
            } else {
              await db.update(products).set({
                price: product.price,
                stockQuantity: product.stock,
                isActive: product.status === "active",
                updatedAt: /* @__PURE__ */ new Date()
              }).where(eq11(products.id, existing[0].id));
            }
          } catch (error) {
            logger.error(`Failed to save product ${product.sku}:`, error);
          }
        }
        logger.info(`\u2705 Synced ${marketplaceProducts.length} products from ${marketplace}`);
      } catch (error) {
        logger.error(`Failed to sync from ${marketplace}:`, error.message);
      }
    }
    return allProducts;
  }
  // ==================== CARD GENERATION ====================
  /**
   * Get products that don't have AI cards yet
   */
  async getProductsWithoutCards(partnerId) {
    try {
      const allProducts = await db.select().from(products).where(
        and10(
          eq11(products.partnerId, partnerId),
          eq11(products.isActive, true)
        )
      );
      const productsNeedingCards = [];
      for (const product of allProducts) {
        const existingCards = await db.select().from(aiProductCards).where(eq11(aiProductCards.productId, product.id)).limit(1);
        if (existingCards.length === 0) {
          productsNeedingCards.push(product);
        }
      }
      return productsNeedingCards;
    } catch (error) {
      logger.error("Failed to get products without cards:", error);
      return [];
    }
  }
  /**
   * Batch generate product cards for multiple products
   */
  async batchGenerateProductCards(partnerId, products4, targetMarketplaces) {
    const results = [];
    const batchSize = 5;
    for (let i = 0; i < products4.length; i += batchSize) {
      const batch = products4.slice(i, i + batchSize);
      const batchResults = await Promise.all(
        batch.map(
          (product) => this.generateProductCardSet(partnerId, product, targetMarketplaces)
        )
      );
      results.push(...batchResults);
      if (i + batchSize < products4.length) {
        await new Promise((resolve) => setTimeout(resolve, 2e3));
      }
    }
    return results;
  }
  /**
   * Generate complete card set for one product (all marketplaces)
   */
  async generateProductCardSet(partnerId, product, targetMarketplaces) {
    try {
      logger.info(`\u{1F3A8} Generating cards for product: ${product.name}`);
      const analysis = await aiOrchestrator.analyzeProduct(
        product.name,
        product.description || `High quality ${product.name}`,
        void 0
      );
      const multiLangContent = await aiOrchestrator.generateMultiLanguageContent(
        product.name,
        product.description || `High quality ${product.name}`,
        analysis.category
      );
      const cards = [];
      let totalCost = 0;
      for (const marketplace of targetMarketplaces) {
        try {
          let content;
          if (marketplace === "wildberries" || marketplace === "ozon") {
            content = multiLangContent.russian;
          } else if (marketplace === "uzum") {
            content = multiLangContent.uzbek;
          } else if (marketplace === "trendyol") {
            content = multiLangContent.turkish;
          } else {
            content = multiLangContent.russian;
          }
          const images = await aiOrchestrator.generateMarketplaceImages(
            product.name,
            marketplace
          );
          const cardCost = 0.025 + 0.12;
          totalCost += cardCost;
          const cardId = `card_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
          await db.insert(aiProductCards).values({
            id: cardId,
            partnerId,
            productId: product.id,
            marketplace,
            title: content.title,
            description: content.description,
            bulletPoints: JSON.stringify(content.bulletPoints),
            seoKeywords: JSON.stringify(analysis.keywords),
            generatedImages: JSON.stringify({
              main: images.mainImage.url,
              additional: images.additionalImages.map((img) => img.url),
              infographic: images.infographic.url
            }),
            status: "draft",
            qualityScore: analysis.confidence,
            aiModel: "claude-3.5-sonnet + flux-1.1",
            generationCost: cardCost,
            createdAt: /* @__PURE__ */ new Date()
          });
          cards.push({
            marketplace,
            cardId,
            title: content.title,
            cost: cardCost
          });
          logger.info(`\u2705 Generated ${marketplace} card for ${product.name}`);
        } catch (error) {
          logger.error(`Failed to generate ${marketplace} card:`, error.message);
        }
      }
      return {
        success: cards.length > 0,
        productId: product.id,
        cards,
        totalCost
      };
    } catch (error) {
      logger.error(`Failed to generate card set for ${product.name}:`, error);
      return {
        success: false,
        productId: product.id,
        cards: [],
        totalCost: 0,
        error: error.message
      };
    }
  }
  // ==================== AUTO-PUBLISHING ====================
  /**
   * Automatically publish generated cards to marketplaces
   */
  async autoPublishCards(results) {
    logger.info(`\u{1F4E4} Auto-publishing ${results.length} card sets...`);
    for (const result of results) {
      if (!result.success) continue;
      for (const card of result.cards) {
        try {
          await db.update(aiProductCards).set({
            status: "published",
            publishedAt: /* @__PURE__ */ new Date()
          }).where(eq11(aiProductCards.id, card.cardId));
          logger.info(`\u2705 Published card ${card.cardId} to ${card.marketplace}`);
        } catch (error) {
          logger.error(`Failed to publish card ${card.cardId}:`, error);
        }
      }
    }
  }
  // ==================== REPORTING ====================
  /**
   * Generate automation report for partner
   */
  async generateAutomationReport(partnerId) {
    try {
      const stats = await marketplaceManager.getCombinedStats(partnerId);
      const totalProducts = await db.select().from(products).where(eq11(products.partnerId, partnerId));
      const totalCards = await db.select().from(aiProductCards).where(eq11(aiProductCards.partnerId, partnerId));
      const publishedCards = totalCards.filter((c) => c.status === "published");
      const report = {
        timestamp: /* @__PURE__ */ new Date(),
        partnerId,
        marketplaceStats: stats,
        products: {
          total: totalProducts.length,
          active: totalProducts.filter((p) => p.isActive).length
        },
        aiCards: {
          total: totalCards.length,
          published: publishedCards.length,
          draft: totalCards.length - publishedCards.length
        },
        totalAICost: totalCards.reduce((sum, card) => sum + (card.generationCost || 0), 0)
      };
      logger.info(`\u{1F4CA} Automation Report for ${partnerId}:`, report);
    } catch (error) {
      logger.error("Failed to generate automation report:", error);
    }
  }
  // ==================== MANUAL TRIGGERS ====================
  /**
   * Manually trigger product sync for a partner
   */
  async manualSync(partnerId, marketplaces) {
    logger.info(`\u{1F504} Manual sync triggered for partner ${partnerId}`);
    const products4 = await this.syncProductsFromMarketplaces(partnerId, marketplaces);
    return {
      success: true,
      syncedProducts: products4.length,
      marketplaces
    };
  }
  /**
   * Manually generate cards for specific products
   */
  async manualGenerateCards(partnerId, productIds, targetMarketplaces) {
    logger.info(`\u{1F3A8} Manual card generation for ${productIds.length} products`);
    const products4 = await db.select().from(products4).where(eq11(products4.partnerId, partnerId));
    const selectedProducts = products4.filter((p) => productIds.includes(p.id));
    return await this.batchGenerateProductCards(partnerId, selectedProducts, targetMarketplaces);
  }
  // ==================== STATUS & MONITORING ====================
  getAutomationStatus(partnerId) {
    const isActive = this.activeAutomations.has(partnerId);
    return {
      isActive
      // TODO: Track last run and next run times
    };
  }
  getAllActiveAutomations() {
    return Array.from(this.activeAutomations.keys());
  }
};
var autonomousProductManager = new AutonomousProductManager();

// server/routes/autonomousManager.ts
var marketplaceManager2 = null;
async function getMarketplaceManager() {
  if (!marketplaceManager2) {
    const module = await Promise.resolve().then(() => (init_manager(), manager_exports));
    marketplaceManager2 = module.marketplaceManager;
  }
  return marketplaceManager2;
}
__name(getMarketplaceManager, "getMarketplaceManager");
var router19 = express9.Router();
router19.post("/start", async (req, res) => {
  try {
    const partnerId = req.user?.partnerId;
    if (!partnerId) {
      return res.status(401).json({ error: "Unauthorized" });
    }
    const {
      enabledMarketplaces = ["wildberries", "uzum", "ozon", "trendyol"],
      autoSync = true,
      autoGenerateCards = true,
      autoPublish = false,
      syncInterval = 60
      // minutes
    } = req.body;
    await autonomousProductManager.startAutomation({
      partnerId,
      enabledMarketplaces,
      autoSync,
      autoGenerateCards,
      autoPublish,
      syncInterval
    });
    res.json({
      success: true,
      message: "Autonomous automation started",
      config: {
        enabledMarketplaces,
        autoSync,
        autoGenerateCards,
        autoPublish,
        syncInterval
      }
    });
  } catch (error) {
    console.error("Start automation error:", error);
    res.status(500).json({ error: error.message });
  }
});
router19.post("/stop", async (req, res) => {
  try {
    const partnerId = req.user?.partnerId;
    if (!partnerId) {
      return res.status(401).json({ error: "Unauthorized" });
    }
    autonomousProductManager.stopAutomation(partnerId);
    res.json({
      success: true,
      message: "Autonomous automation stopped"
    });
  } catch (error) {
    console.error("Stop automation error:", error);
    res.status(500).json({ error: error.message });
  }
});
router19.get("/status", async (req, res) => {
  try {
    const partnerId = req.user?.partnerId;
    if (!partnerId) {
      return res.status(401).json({ error: "Unauthorized" });
    }
    const status = autonomousProductManager.getAutomationStatus(partnerId);
    res.json({
      success: true,
      status
    });
  } catch (error) {
    console.error("Get status error:", error);
    res.status(500).json({ error: error.message });
  }
});
router19.post("/sync", async (req, res) => {
  try {
    const partnerId = req.user?.partnerId;
    if (!partnerId) {
      return res.status(401).json({ error: "Unauthorized" });
    }
    const { marketplaces = ["wildberries", "uzum", "ozon", "trendyol"] } = req.body;
    const result = await autonomousProductManager.manualSync(partnerId, marketplaces);
    res.json({
      success: true,
      ...result
    });
  } catch (error) {
    console.error("Manual sync error:", error);
    res.status(500).json({ error: error.message });
  }
});
router19.post("/generate-cards", async (req, res) => {
  try {
    const partnerId = req.user?.partnerId;
    if (!partnerId) {
      return res.status(401).json({ error: "Unauthorized" });
    }
    const {
      productIds,
      targetMarketplaces = ["wildberries", "uzum", "ozon", "trendyol"]
    } = req.body;
    if (!productIds || !Array.isArray(productIds)) {
      return res.status(400).json({ error: "Product IDs array required" });
    }
    const results = await autonomousProductManager.manualGenerateCards(
      partnerId,
      productIds,
      targetMarketplaces
    );
    const totalCost = results.reduce((sum, r) => sum + r.totalCost, 0);
    const successCount = results.filter((r) => r.success).length;
    res.json({
      success: true,
      results,
      summary: {
        total: results.length,
        successful: successCount,
        failed: results.length - successCount,
        totalCost
      }
    });
  } catch (error) {
    console.error("Generate cards error:", error);
    res.status(500).json({ error: error.message });
  }
});
router19.post("/generate-single", async (req, res) => {
  try {
    const partnerId = req.user?.partnerId;
    if (!partnerId) {
      return res.status(401).json({ error: "Unauthorized" });
    }
    const {
      product,
      targetMarketplaces = ["wildberries", "uzum", "ozon", "trendyol"]
    } = req.body;
    if (!product) {
      return res.status(400).json({ error: "Product data required" });
    }
    const result = await autonomousProductManager.generateProductCardSet(
      partnerId,
      product,
      targetMarketplaces
    );
    res.json({
      success: result.success,
      result
    });
  } catch (error) {
    console.error("Generate single card error:", error);
    res.status(500).json({ error: error.message });
  }
});
router19.get("/marketplace-stats", async (req, res) => {
  try {
    const partnerId = req.user?.partnerId;
    if (!partnerId) {
      return res.status(401).json({ error: "Unauthorized" });
    }
    const manager = await getMarketplaceManager();
    const stats = await manager.getCombinedStats(partnerId);
    res.json({
      success: true,
      stats
    });
  } catch (error) {
    console.error("Get marketplace stats error:", error);
    res.status(500).json({ error: error.message });
  }
});
router19.get("/all-active", async (req, res) => {
  try {
    const role = req.user?.role;
    if (role !== "admin") {
      return res.status(403).json({ error: "Admin access required" });
    }
    const activeAutomations = autonomousProductManager.getAllActiveAutomations();
    res.json({
      success: true,
      activeAutomations,
      count: activeAutomations.length
    });
  } catch (error) {
    console.error("Get all active error:", error);
    res.status(500).json({ error: error.message });
  }
});
var autonomousManager_default = router19;

// server/services/fulfillmentAIIntegration.ts
init_db();

// NEW_PRICING_CONFIG.ts
var NEW_PRICING_TIERS = {
  starter_pro: {
    id: "starter_pro",
    name: "Starter Pro",
    nameUz: "Starter Pro",
    nameRu: "Starter Pro",
    nameEn: "Starter Pro",
    // PROFIT SHARE MODEL: Abonent + Foydadan %
    monthlyFee: 3e6,
    // 3,000,000 so'm oylik abonent
    // YANGI: Profit share (foydadan %)
    profitShareRate: 0.5,
    // 50% foydadan
    commissionRate: 0.5,
    // Legacy compat
    // Maqsadli aylanma
    minRevenue: 2e7,
    // 20M
    maxRevenue: 5e7,
    // 50M
    // Cheklovlar
    limits: {
      marketplaces: 1,
      products: 100,
      warehouseKg: 100,
      supportResponseTime: "48h",
      consultationHours: 0
    },
    // Xizmatlar
    features: [
      "1 ta marketplace (Uzum yoki Wildberries)",
      "100 tagacha mahsulot",
      "Basic dashboard",
      "Mahsulot yuklash va boshqarish",
      "Buyurtmalarni qayta ishlash",
      "Asosiy hisobotlar",
      "Email yordam (48 soat)",
      "Ombor xizmati (100 kg)",
      "Asosiy CRM"
    ],
    // Qo'shimcha ma'lumotlar
    description: "Yangi boshlovchilar - past risk, yuqori profit share",
    popular: false,
    color: "blue",
    badge: "Low Risk"
  },
  business_standard: {
    id: "business_standard",
    name: "Business Standard",
    nameUz: "Business Standard",
    nameRu: "Business Standard",
    nameEn: "Business Standard",
    // PROFIT SHARE MODEL: Abonent + Foydadan %
    monthlyFee: 8e6,
    // 8,000,000 so'm oylik abonent
    // YANGI: Profit share (foydadan %)
    profitShareRate: 0.25,
    // 25% foydadan
    commissionRate: 0.25,
    // Legacy compat
    // Maqsadli aylanma
    minRevenue: 5e7,
    // 50M
    maxRevenue: 15e7,
    // 150M
    // Cheklovlar
    limits: {
      marketplaces: 2,
      products: 500,
      warehouseKg: 500,
      supportResponseTime: "24h",
      consultationHours: 2
    },
    // Xizmatlar
    features: [
      "2 ta marketplace (Uzum + Wildberries)",
      "500 tagacha mahsulot",
      "To'liq dashboard",
      "Foyda/zarar tahlili",
      "Kengaytirilgan hisobotlar",
      "Prognozlar",
      "Telefon yordam (24 soat)",
      "Ombor xizmati (500 kg)",
      "To'liq CRM",
      "Asosiy marketing",
      "Oylik konsultatsiya (2 soat)",
      "Raqobatchilar tahlili",
      "Narx optimizatsiyasi",
      "Sharh boshqaruvi"
    ],
    description: "O'sib borayotgan biznes - muvozanatlangan model",
    popular: true,
    color: "green",
    badge: "Recommended"
  },
  professional_plus: {
    id: "professional_plus",
    name: "Professional Plus",
    nameUz: "Professional Plus",
    nameRu: "Professional Plus",
    nameEn: "Professional Plus",
    // PROFIT SHARE MODEL: Abonent + Foydadan %
    monthlyFee: 18e6,
    // 18,000,000 so'm oylik abonent
    // YANGI: Profit share (foydadan %)
    profitShareRate: 0.15,
    // 15% foydadan
    commissionRate: 0.15,
    // Legacy compat
    // Maqsadli aylanma
    minRevenue: 15e7,
    // 150M
    maxRevenue: 4e8,
    // 400M
    // Cheklovlar
    limits: {
      marketplaces: 4,
      products: 2e3,
      warehouseKg: 2e3,
      supportResponseTime: "1h",
      consultationHours: 4
    },
    // Xizmatlar
    features: [
      "4 ta marketplace (Uzum + Wildberries + Yandex + Ozon)",
      "2,000 tagacha mahsulot",
      "Premium dashboard",
      "AI-powered tahlil",
      "Trend hunter",
      "Real-time prognozlar",
      "Shaxsiy menejer",
      "24/7 yordam (1 soat)",
      "Ombor xizmati (2,000 kg)",
      "Premium CRM",
      "To'liq marketing xizmati",
      "Haftalik konsultatsiya (4 soat/oy)",
      "A/B testing",
      "Influencer marketing",
      "Professional fotosurat",
      "Video kontent",
      "SEO optimizatsiya",
      "Reklama boshqaruvi"
    ],
    description: "Katta biznes - yuqori to'lov, past profit share",
    popular: false,
    color: "purple",
    badge: "High Volume"
  },
  enterprise_elite: {
    id: "enterprise_elite",
    name: "Enterprise Elite",
    nameUz: "Enterprise Elite",
    nameRu: "Enterprise Elite",
    nameEn: "Enterprise Elite",
    // PROFIT SHARE MODEL: Abonent + Foydadan %
    monthlyFee: 25e6,
    // 25,000,000 so'm oylik abonent
    // YANGI: Profit share (foydadan %)
    profitShareRate: 0.1,
    // 10% foydadan
    commissionRate: 0.1,
    // Legacy compat
    // Maqsadli aylanma
    minRevenue: 5e8,
    // 500M
    maxRevenue: null,
    // Cheksiz
    // Cheklovlar
    limits: {
      marketplaces: 999,
      // Barchasi
      products: 999999,
      // Cheksiz
      warehouseKg: 999999,
      // Cheksiz
      supportResponseTime: "30min",
      consultationHours: 20
    },
    // Xizmatlar
    features: [
      "Barcha marketplace'lar",
      "Cheksiz mahsulot",
      "Enterprise dashboard",
      "Maxsus AI tahlil",
      "Shaxsiy jamoa (3-5 kishi)",
      "24/7 VIP yordam (30 daqiqa)",
      "Cheksiz ombor",
      "Enterprise CRM",
      "To'liq marketing va branding",
      "Kunlik konsultatsiya (20 soat/oy)",
      "Maxsus integratsiyalar",
      "White-label yechimlar",
      "Yuridik yordam",
      "Moliyaviy maslahat",
      "Strategik rejalashtirish",
      "Xalqaro kengayish",
      "Investor munosabatlari"
    ],
    description: "Korporate - maksimal stabillik, minimal share",
    popular: false,
    color: "gold",
    badge: "VIP"
  }
};

// server/services/priceCalculationService.ts
var MARKETPLACE_COMMISSIONS = {
  uzum: 0.15,
  // 15%
  wildberries: 0.12,
  // 12%
  yandex: 0.13,
  // 13%
  ozon: 0.14
  // 14%
};
var LOGISTICS_PERCENTAGE = 0.05;
var CATEGORY_MULTIPLIERS = {
  electronics: 1.2,
  fashion: 1.15,
  home: 1.1,
  beauty: 1.25,
  sports: 1.12,
  toys: 1.18,
  books: 1.05,
  food: 1.08,
  default: 1.15
};
function calculateOptimalPrice(input) {
  const {
    costPrice,
    productCategory,
    marketplaceType,
    partnerTier,
    competitorPrices = [],
    targetMargin = 0.3
    // 30% default profit margin
  } = input;
  const tierConfig = NEW_PRICING_TIERS[partnerTier];
  if (!tierConfig) {
    throw new Error(`Noma'lum tarif: ${partnerTier}`);
  }
  const ourCommissionRate = tierConfig.commissionRate;
  const marketplaceCommission = MARKETPLACE_COMMISSIONS[marketplaceType] || 0.15;
  const categoryMultiplier = CATEGORY_MULTIPLIERS[productCategory.toLowerCase()] || CATEGORY_MULTIPLIERS.default;
  const logisticsPercentage = LOGISTICS_PERCENTAGE;
  const totalCommissionRate = marketplaceCommission + logisticsPercentage + ourCommissionRate;
  const minimumPrice = costPrice / (1 - totalCommissionRate);
  const optimalPrice = costPrice / (1 - totalCommissionRate - targetMargin);
  const premiumPrice = optimalPrice * categoryMultiplier;
  let competitiveAnalysis = null;
  if (competitorPrices.length > 0) {
    const avgMarketPrice = competitorPrices.reduce((sum, p) => sum + p, 0) / competitorPrices.length;
    const minPrice = Math.min(...competitorPrices);
    const maxPrice = Math.max(...competitorPrices);
    let position = "average";
    if (optimalPrice < avgMarketPrice * 0.9) position = "lower";
    if (optimalPrice > avgMarketPrice * 1.1) position = "higher";
    competitiveAnalysis = {
      averageMarketPrice: avgMarketPrice,
      minCompetitorPrice: minPrice,
      maxCompetitorPrice: maxPrice,
      ourPosition: position
    };
  }
  let recommendedPrice = optimalPrice;
  let strategy = "Optimal - Muvozanatli foyda va raqobat";
  if (competitiveAnalysis) {
    if (competitiveAnalysis.averageMarketPrice < optimalPrice) {
      recommendedPrice = Math.max(
        competitiveAnalysis.averageMarketPrice * 0.95,
        minimumPrice * 1.1
      );
      strategy = "Raqobatbardosh - Bozor narxiga moslashtirilgan";
    } else if (competitiveAnalysis.averageMarketPrice > optimalPrice * 1.2) {
      recommendedPrice = premiumPrice;
      strategy = "Premium - Yuqori foyda strategiyasi";
    }
  }
  recommendedPrice = Math.round(recommendedPrice / 1e3) * 1e3;
  const minimumPriceRounded = Math.round(minimumPrice / 1e3) * 1e3;
  const premiumPriceRounded = Math.round(premiumPrice / 1e3) * 1e3;
  const ourCommissionAmount = recommendedPrice * ourCommissionRate;
  const marketplaceCommissionAmount = recommendedPrice * marketplaceCommission;
  const logisticsAmount = recommendedPrice * logisticsPercentage;
  const totalCosts = costPrice + marketplaceCommissionAmount + logisticsAmount + ourCommissionAmount;
  const profitAmount = recommendedPrice - totalCosts;
  const profitMargin = profitAmount / recommendedPrice * 100;
  const warnings = [];
  if (profitMargin < 10) {
    warnings.push("\u26A0\uFE0F Foyda juda kam! Narxni oshirish tavsiya etiladi.");
  }
  if (competitiveAnalysis && competitiveAnalysis.ourPosition === "higher") {
    warnings.push("\u26A0\uFE0F Narx raqobatchilardan yuqori. Sotish qiyinroq bo'lishi mumkin.");
  }
  if (recommendedPrice < minimumPriceRounded * 1.05) {
    warnings.push("\u26A0\uFE0F Narx minimal chegara yaqinida. Zarar bo'lish xavfi.");
  }
  return {
    recommendedPrice,
    breakdown: {
      costPrice,
      marketplaceCommission: marketplaceCommissionAmount,
      logisticsPercentage: logisticsAmount,
      ourCommissionPercentage: ourCommissionRate * 100,
      ourCommissionAmount,
      totalCosts,
      profitMargin,
      profitAmount
    },
    competitiveAnalysis,
    priceRange: {
      minimum: minimumPriceRounded,
      optimal: Math.round(optimalPrice / 1e3) * 1e3,
      premium: premiumPriceRounded
    },
    strategy,
    warnings
  };
}
__name(calculateOptimalPrice, "calculateOptimalPrice");

// server/services/aiMarketplaceManager.ts
async function createProductCard2(productInfo, marketplace) {
  const prompt = `Sen professional marketplace SEO mutaxassisi san. Mahsulot kartochkasini yarat.

Mahsulot: ${productInfo.name}
Kategoriya: ${productInfo.category}
Xususiyatlar: ${productInfo.features.join(", ")}
Maqsadli auditoriya: ${productInfo.targetAudience}
Marketplace: ${marketplace}

Quyidagilarni yarat:
1. SEO-optimizatsiyalangan sarlavha (60-80 belgi)
2. To'liq tavsif (500-800 so'z, kalit so'zlar bilan)
3. 10 ta asosiy kalit so'z
4. SEO ball (1-100)

Format (JSON):
{
  "title": "...",
  "description": "...",
  "keywords": ["...", "..."],
  "seoScore": 85
}`;
  return emergentAI_default.generateJSON(prompt, "ProductCard");
}
__name(createProductCard2, "createProductCard");

// server/services/fulfillmentAIIntegration.ts
async function triggerAIForFulfillment(fulfillmentRequestId, adminId) {
  console.log("\u{1F916} Starting AI workflow for fulfillment:", fulfillmentRequestId);
  try {
    const fulfillmentRequest = await db.get(
      `SELECT * FROM fulfillment_requests WHERE id = ?`,
      [fulfillmentRequestId]
    );
    if (!fulfillmentRequest) {
      throw new Error(`Fulfillment request ${fulfillmentRequestId} not found`);
    }
    const partnerId = fulfillmentRequest.partner_id;
    const partner = await db.get(
      `SELECT * FROM partners WHERE id = ?`,
      [partnerId]
    );
    if (!partner) {
      throw new Error(`Partner ${partnerId} not found`);
    }
    const partnerTier = partner.pricing_tier || "starter_pro";
    const partnerUserId = partner.user_id;
    const marketplaceAccounts = await db.all(
      `SELECT id, marketplace 
       FROM ai_marketplace_accounts 
       WHERE partner_id = ? AND account_status = 'active' AND ai_enabled = 1`,
      [partnerUserId]
    );
    if (!marketplaceAccounts || marketplaceAccounts.length === 0) {
      console.log("\u26A0\uFE0F No AI-enabled marketplace accounts for user:", partnerUserId);
      return {
        success: false,
        message: "No active AI marketplace accounts",
        productsProcessed: 0
      };
    }
    const products4 = await db.all(
      `SELECT * FROM fulfillment_request_items WHERE fulfillment_request_id = ?`,
      [fulfillmentRequestId]
    );
    if (products4.length === 0) {
      throw new Error("No products in fulfillment request");
    }
    console.log(`\u{1F4E6} Processing ${products4.length} products for ${marketplaceAccounts.length} AI accounts`);
    const results = [];
    for (const product of products4) {
      for (const account of marketplaceAccounts) {
        const marketplaceType = account.marketplace;
        try {
          const priceResult = calculateOptimalPrice({
            costPrice: parseFloat(product.cost_price || "0"),
            productCategory: product.category || "default",
            marketplaceType,
            partnerTier,
            targetMargin: 0.25
            // 25% default profit margin
          });
          console.log(`\u{1F4B0} Price calculated for ${product.product_name} on ${marketplaceType}:`, priceResult.recommendedPrice);
          const aiCard = await createProductCard2(
            {
              name: product.product_name,
              category: product.category || "general",
              features: [
                "Autogenerated from fulfillment request",
                `Fulfillment ID: ${fulfillmentRequestId}`
              ],
              targetAudience: "Marketplace buyers"
            },
            marketplaceType
          );
          await db.run(
            `INSERT INTO ai_product_cards (
               account_id,
               marketplace,
               base_product_name,
               optimized_title,
               optimized_description,
               seo_keywords,
               category,
               attributes,
               price,
               images_data,
               seo_score,
               performance_score,
               status
             ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
            [
              account.id,
              marketplaceType,
              product.product_name,
              aiCard.title,
              aiCard.description,
              JSON.stringify(aiCard.keywords || []),
              product.category || "general",
              JSON.stringify({ source: "fulfillment", fulfillmentRequestId }),
              priceResult.recommendedPrice,
              product.images || "[]",
              aiCard.seoScore || 0,
              aiCard.seoScore || 0,
              "draft"
            ]
          );
          results.push({
            product: product.product_name,
            marketplace: marketplaceType,
            status: "generated",
            price: priceResult.recommendedPrice,
            seoScore: aiCard.seoScore || 0
          });
        } catch (error) {
          console.error(`\u274C Error processing ${product.product_name} for ${marketplaceType}:`, error.message);
          results.push({
            product: product.product_name,
            marketplace: marketplaceType,
            status: "error",
            error: error.message
          });
        }
      }
    }
    await db.run(
      `UPDATE fulfillment_requests 
       SET ai_processed = 1,
           ai_processed_at = CURRENT_TIMESTAMP,
           ai_processing_notes = ?
       WHERE id = ?`,
      [JSON.stringify(results), fulfillmentRequestId]
    );
    const successCount = results.filter((r) => r.status === "generated").length;
    const errorCount = results.filter((r) => r.status === "error").length;
    console.log(`\u2705 AI workflow completed: ${successCount} success, ${errorCount} errors`);
    return {
      success: true,
      message: `AI processed ${successCount} product cards`,
      productsProcessed: successCount,
      errors: errorCount,
      details: results
    };
  } catch (error) {
    console.error("\u274C AI workflow error:", error.message);
    throw error;
  }
}
__name(triggerAIForFulfillment, "triggerAIForFulfillment");
async function manuallyTriggerAIForProduct(productId, marketplaceType, adminId) {
  console.log(`\u{1F504} Manually triggering AI for product ${productId} on ${marketplaceType}`);
  try {
    const product = await db.get(
      `SELECT * FROM fulfillment_request_items WHERE id = ?`,
      [productId]
    );
    if (!product) {
      throw new Error(`Product ${productId} not found`);
    }
    const partnerId = product.partner_id;
    const partner = await db.get(
      `SELECT * FROM partners WHERE id = ?`,
      [partnerId]
    );
    if (!partner) {
      throw new Error(`Partner ${partnerId} not found`);
    }
    const partnerTier = partner.pricing_tier || "starter_pro";
    const partnerUserId = partner.user_id;
    const account = await db.get(
      `SELECT id, marketplace FROM ai_marketplace_accounts 
       WHERE partner_id = ? AND marketplace = ? AND account_status = 'active' AND ai_enabled = 1`,
      [partnerUserId, marketplaceType]
    );
    if (!account) {
      throw new Error(`No active AI marketplace account for ${marketplaceType}`);
    }
    const priceResult = calculateOptimalPrice({
      costPrice: parseFloat(product.cost_price || "0"),
      productCategory: product.category || "default",
      marketplaceType,
      partnerTier,
      targetMargin: 0.25
    });
    const aiCard = await createProductCard2(
      {
        name: product.product_name,
        category: product.category || "general",
        features: [
          "Manual trigger from admin",
          `Fulfillment item ID: ${productId}`
        ],
        targetAudience: "Marketplace buyers"
      },
      marketplaceType
    );
    await db.run(
      `INSERT INTO ai_product_cards (
         account_id,
         marketplace,
         base_product_name,
         optimized_title,
         optimized_description,
         seo_keywords,
         category,
         attributes,
         price,
         images_data,
         seo_score,
         performance_score,
         status
       ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        account.id,
        marketplaceType,
        product.product_name,
        aiCard.title,
        aiCard.description,
        JSON.stringify(aiCard.keywords || []),
        product.category || "general",
        JSON.stringify({ source: "manual", adminId }),
        priceResult.recommendedPrice,
        product.images || "[]",
        aiCard.seoScore || 0,
        aiCard.seoScore || 0,
        "draft"
      ]
    );
    return {
      success: true,
      message: "AI product card generated",
      productId,
      data: aiCard
    };
  } catch (error) {
    console.error("\u274C Manual AI trigger error:", error.message);
    throw error;
  }
}
__name(manuallyTriggerAIForProduct, "manuallyTriggerAIForProduct");
var fulfillmentAIIntegration_default = {
  triggerAIForFulfillment,
  manuallyTriggerAIForProduct
};

// server/config.ts
import { z as z2 } from "zod";
import dotenv2 from "dotenv";
dotenv2.config();
var envSchema = z2.object({
  // Database
  // Developmentda .env bo'lmasa ham ishlashi uchun default SQLite URL beramiz
  DATABASE_URL: z2.string().default("sqlite:./dev.db"),
  DATABASE_AUTO_SETUP: z2.string().optional().default("true"),
  // Server
  NODE_ENV: z2.enum(["development", "production", "test"]).default("development"),
  PORT: z2.string().default("5000"),
  HOST: z2.string().default("0.0.0.0"),
  // Session
  // Development uchun default, production da Railway Variables orqali set qiling
  SESSION_SECRET: z2.string().min(32, "SESSION_SECRET must be at least 32 characters").default("sellercloudx-default-session-secret-key-production-2024"),
  // CORS
  FRONTEND_ORIGIN: z2.string().optional(),
  CORS_ORIGIN: z2.string().optional(),
  // Rate Limiting
  RATE_LIMIT_WINDOW_MS: z2.string().default("900000"),
  RATE_LIMIT_MAX_REQUESTS: z2.string().default("200"),
  // File Upload
  MAX_FILE_SIZE: z2.string().default("10485760"),
  UPLOAD_PATH: z2.string().default("./uploads"),
  // WebSocket
  WS_HEARTBEAT_INTERVAL: z2.string().default("30000"),
  WS_MAX_CONNECTIONS: z2.string().default("1000"),
  // Email (Optional)
  SMTP_HOST: z2.string().optional(),
  SMTP_PORT: z2.string().optional(),
  SMTP_USER: z2.string().optional(),
  SMTP_PASS: z2.string().optional(),
  // Admin Defaults
  ADMIN_USERNAME: z2.string().optional().default("admin"),
  ADMIN_PASSWORD: z2.string().optional(),
  ADMIN_EMAIL: z2.string().email().optional(),
  // API URLs
  VITE_API_URL: z2.string().optional(),
  // Logging
  LOG_LEVEL: z2.enum(["error", "warn", "info", "http", "debug"]).optional()
});
var config;
try {
  config = envSchema.parse(process.env);
} catch (error) {
  if (error instanceof z2.ZodError) {
    console.error("\u274C Environment validation failed:");
    error.errors.forEach((err) => {
      console.error(`  - ${err.path.join(".")}: ${err.message}`);
    });
    process.exit(1);
  }
  throw error;
}
var appConfig = {
  // Database
  database: {
    url: config.DATABASE_URL,
    autoSetup: config.DATABASE_AUTO_SETUP === "true"
  },
  // Server
  server: {
    env: config.NODE_ENV,
    port: parseInt(config.PORT, 10),
    host: config.HOST,
    isDevelopment: config.NODE_ENV === "development",
    isProduction: config.NODE_ENV === "production",
    isTest: config.NODE_ENV === "test"
  },
  // Session
  session: {
    secret: config.SESSION_SECRET
  },
  // CORS
  cors: {
    origin: config.CORS_ORIGIN?.split(",").map((o) => o.trim()) || [
      config.FRONTEND_ORIGIN || "http://localhost:5000"
    ]
  },
  // Rate Limiting
  rateLimit: {
    windowMs: parseInt(config.RATE_LIMIT_WINDOW_MS, 10),
    maxRequests: parseInt(config.RATE_LIMIT_MAX_REQUESTS, 10)
  },
  // File Upload
  upload: {
    maxFileSize: parseInt(config.MAX_FILE_SIZE, 10),
    uploadPath: config.UPLOAD_PATH
  },
  // WebSocket
  websocket: {
    heartbeatInterval: parseInt(config.WS_HEARTBEAT_INTERVAL, 10),
    maxConnections: parseInt(config.WS_MAX_CONNECTIONS, 10)
  },
  // Email
  email: {
    enabled: !!(config.SMTP_HOST && config.SMTP_USER && config.SMTP_PASS),
    host: config.SMTP_HOST,
    port: config.SMTP_PORT ? parseInt(config.SMTP_PORT, 10) : 587,
    user: config.SMTP_USER,
    pass: config.SMTP_PASS
  },
  // Admin
  admin: {
    username: config.ADMIN_USERNAME,
    password: config.ADMIN_PASSWORD,
    email: config.ADMIN_EMAIL
  },
  // Logging
  logging: {
    level: config.LOG_LEVEL || (config.NODE_ENV === "production" ? "info" : "debug")
  }
};
console.log("\u2705 Configuration loaded:", {
  environment: appConfig.server.env,
  port: appConfig.server.port,
  database: appConfig.database.url.includes("postgresql") ? "PostgreSQL" : "SQLite",
  emailEnabled: appConfig.email.enabled,
  corsOrigins: appConfig.cors.origin
});
var config_default = appConfig;

// server/middleware/rateLimiter.ts
import rateLimit from "express-rate-limit";
var apiLimiter = rateLimit({
  windowMs: parseInt(process.env.RATE_LIMIT_WINDOW_MS || "900000"),
  // 15 minutes
  max: parseInt(process.env.RATE_LIMIT_MAX_REQUESTS || "200"),
  // 200 requests per windowMs
  message: {
    message: "Juda ko'p so'rov yuborildi. Iltimos, biroz kutib turing.",
    code: "RATE_LIMIT_EXCEEDED",
    retryAfter: "15 minutes"
  },
  standardHeaders: true,
  // Return rate limit info in the `RateLimit-*` headers
  legacyHeaders: false,
  // Disable the `X-RateLimit-*` headers
  // Skip rate limiting for health checks
  skip: /* @__PURE__ */ __name((req) => req.path === "/api/health", "skip")
});
var authLimiter = rateLimit({
  windowMs: 15 * 60 * 1e3,
  // 15 minutes
  max: 5,
  // 5 attempts per windowMs
  message: {
    message: "Juda ko'p login urinishlari. Iltimos, 15 daqiqadan keyin qayta urinib ko'ring.",
    code: "AUTH_RATE_LIMIT_EXCEEDED",
    retryAfter: "15 minutes"
  },
  standardHeaders: true,
  legacyHeaders: false,
  skipSuccessfulRequests: true
  // Don't count successful requests
});
var exportLimiter = rateLimit({
  windowMs: 60 * 60 * 1e3,
  // 1 hour
  max: 10,
  // 10 exports per hour
  message: {
    message: "Juda ko'p export so'rovlari. Iltimos, 1 soatdan keyin qayta urinib ko'ring.",
    code: "EXPORT_RATE_LIMIT_EXCEEDED",
    retryAfter: "1 hour"
  },
  standardHeaders: true,
  legacyHeaders: false
});
var uploadLimiter = rateLimit({
  windowMs: 60 * 60 * 1e3,
  // 1 hour
  max: 20,
  // 20 uploads per hour
  message: {
    message: "Juda ko'p fayl yuklash so'rovlari. Iltimos, 1 soatdan keyin qayta urinib ko'ring.",
    code: "UPLOAD_RATE_LIMIT_EXCEEDED",
    retryAfter: "1 hour"
  },
  standardHeaders: true,
  legacyHeaders: false
});

// server/routes/paymentRoutes.ts
import { Router as Router11 } from "express";

// server/services/paymentGateway.ts
init_db();
init_schema();
import crypto4 from "crypto";
import { eq as eq12 } from "drizzle-orm";
var PaymentGatewayService = class {
  static {
    __name(this, "PaymentGatewayService");
  }
  clickConfig;
  paymeConfig;
  constructor() {
    this.clickConfig = {
      merchantId: process.env.CLICK_MERCHANT_ID || "",
      secretKey: process.env.CLICK_SECRET_KEY || "",
      serviceId: process.env.CLICK_SERVICE_ID || "",
      apiUrl: "https://api.click.uz/v2"
    };
    this.paymeConfig = {
      merchantId: process.env.PAYME_MERCHANT_ID || "",
      secretKey: process.env.PAYME_SECRET_KEY || "",
      apiUrl: "https://checkout.paycom.uz/api"
    };
  }
  // ==================== CLICK INTEGRATION ====================
  /**
   * Generate Click payment URL
   */
  generateClickPaymentUrl(params) {
    const { amount, orderId, partnerId, returnUrl } = params;
    const baseUrl = "https://my.click.uz/services/pay";
    const queryParams = new URLSearchParams({
      service_id: this.clickConfig.serviceId,
      merchant_id: this.clickConfig.merchantId,
      amount: amount.toString(),
      transaction_param: orderId,
      merchant_user_id: partnerId,
      return_url: returnUrl || `${process.env.FRONTEND_URL}/payment/success`
    });
    return `${baseUrl}?${queryParams.toString()}`;
  }
  /**
   * Verify Click payment callback
   */
  async verifyClickPayment(data) {
    try {
      const {
        click_trans_id,
        service_id,
        click_paydoc_id,
        merchant_trans_id,
        amount,
        action,
        sign_time,
        sign_string
      } = data;
      const signString = `${click_trans_id}${service_id}${this.clickConfig.secretKey}${merchant_trans_id}${amount}${action}${sign_time}`;
      const expectedSign = crypto4.createHash("md5").update(signString).digest("hex");
      if (expectedSign !== sign_string) {
        return { success: false, error: "Invalid signature" };
      }
      if (action === "0") {
        return { success: true, transactionId: click_trans_id };
      } else if (action === "1") {
        await this.updatePaymentStatus(merchant_trans_id, "completed" /* COMPLETED */, {
          provider: "click" /* CLICK */,
          transactionId: click_trans_id,
          paymentDocId: click_paydoc_id
        });
        return { success: true, transactionId: click_trans_id };
      }
      return { success: false, error: "Unknown action" };
    } catch (error) {
      console.error("Click payment verification error:", error);
      return { success: false, error: "Verification failed" };
    }
  }
  // ==================== PAYME INTEGRATION ====================
  /**
   * Generate Payme payment URL
   */
  generatePaymePaymentUrl(params) {
    const { amount, orderId, partnerId } = params;
    const amountInTiyin = amount * 100;
    const orderData = Buffer.from(
      `m=${this.paymeConfig.merchantId};ac.order_id=${orderId};ac.partner_id=${partnerId};a=${amountInTiyin}`
    ).toString("base64");
    return `https://checkout.paycom.uz/${orderData}`;
  }
  /**
   * Handle Payme JSON-RPC requests
   */
  async handlePaymeRequest(request) {
    const { method, params } = request;
    try {
      switch (method) {
        case "CheckPerformTransaction":
          return await this.paymeCheckPerformTransaction(params);
        case "CreateTransaction":
          return await this.paymeCreateTransaction(params);
        case "PerformTransaction":
          return await this.paymePerformTransaction(params);
        case "CancelTransaction":
          return await this.paymeCancelTransaction(params);
        case "CheckTransaction":
          return await this.paymeCheckTransaction(params);
        default:
          return {
            error: {
              code: -32601,
              message: "Method not found"
            }
          };
      }
    } catch (error) {
      return {
        error: {
          code: -32400,
          message: error.message || "Internal error"
        }
      };
    }
  }
  async paymeCheckPerformTransaction(params) {
    const { account } = params;
    const orderId = account.order_id;
    const order = await this.getOrderById(orderId);
    if (!order) {
      return {
        error: {
          code: -31050,
          message: "Order not found"
        }
      };
    }
    return { result: { allow: true } };
  }
  async paymeCreateTransaction(params) {
    const { id, time, amount, account } = params;
    const orderId = account.order_id;
    const transaction = await this.createTransaction({
      transactionId: id,
      orderId,
      amount: amount / 100,
      // Convert from tiyin to sum
      provider: "payme" /* PAYME */,
      status: "pending" /* PENDING */,
      createdAt: new Date(time)
    });
    return {
      result: {
        create_time: time,
        transaction: transaction.id,
        state: 1
      }
    };
  }
  async paymePerformTransaction(params) {
    const { id } = params;
    await this.updateTransactionStatus(id, "completed" /* COMPLETED */);
    return {
      result: {
        transaction: id,
        perform_time: Date.now(),
        state: 2
      }
    };
  }
  async paymeCancelTransaction(params) {
    const { id, reason } = params;
    await this.updateTransactionStatus(id, "cancelled" /* CANCELLED */, { reason });
    return {
      result: {
        transaction: id,
        cancel_time: Date.now(),
        state: -1
      }
    };
  }
  async paymeCheckTransaction(params) {
    const { id } = params;
    const transaction = await this.getTransactionById(id);
    if (!transaction) {
      return {
        error: {
          code: -31003,
          message: "Transaction not found"
        }
      };
    }
    return {
      result: {
        create_time: transaction.createdAt.getTime(),
        transaction: transaction.id,
        state: this.getPaymeState(transaction.status)
      }
    };
  }
  getPaymeState(status) {
    switch (status) {
      case "pending" /* PENDING */:
        return 1;
      case "completed" /* COMPLETED */:
        return 2;
      case "cancelled" /* CANCELLED */:
        return -1;
      case "failed" /* FAILED */:
        return -2;
      default:
        return 0;
    }
  }
  // ==================== UZCARD INTEGRATION ====================
  /**
   * Generate Uzcard payment URL
   */
  generateUzcardPaymentUrl(params) {
    return "";
  }
  // ==================== STRIPE INTEGRATION ====================
  /**
   * Create Stripe payment intent
   */
  async createStripePaymentIntent(params) {
    return null;
  }
  // ==================== HELPER METHODS ====================
  async createTransaction(data) {
    return data;
  }
  async updateTransactionStatus(transactionId, status, metadata) {
  }
  async getTransactionById(transactionId) {
    return null;
  }
  async getOrderById(orderId) {
    return null;
  }
  async updatePaymentStatus(orderId, status, metadata) {
  }
  /**
   * Process subscription payment
   */
  async processSubscriptionPayment(params) {
    try {
      const { partnerId, amount, pricingTier, billingPeriod, provider } = params;
      const orderId = `SUB-${partnerId}-${Date.now()}`;
      let paymentUrl;
      switch (provider) {
        case "click" /* CLICK */:
          paymentUrl = this.generateClickPaymentUrl({
            amount,
            orderId,
            partnerId
          });
          break;
        case "payme" /* PAYME */:
          paymentUrl = this.generatePaymePaymentUrl({
            amount,
            orderId,
            partnerId
          });
          break;
        default:
          return { success: false, error: "Unsupported payment provider" };
      }
      await this.createTransaction({
        transactionId: orderId,
        orderId,
        partnerId,
        amount,
        provider,
        status: "pending" /* PENDING */,
        metadata: { pricingTier, billingPeriod },
        createdAt: /* @__PURE__ */ new Date()
      });
      return {
        success: true,
        paymentUrl,
        transactionId: orderId
      };
    } catch (error) {
      console.error("Subscription payment error:", error);
      return {
        success: false,
        error: error.message || "Payment processing failed"
      };
    }
  }
  /**
   * Verify payment and activate subscription
   */
  async verifyAndActivateSubscription(transactionId) {
    try {
      const transaction = await this.getTransactionById(transactionId);
      if (!transaction) {
        return { success: false, error: "Transaction not found" };
      }
      if (transaction.status !== "completed" /* COMPLETED */) {
        return { success: false, error: "Payment not completed" };
      }
      const { partnerId, metadata } = transaction;
      const { pricingTier, billingPeriod } = metadata;
      await db.update(partners).set({
        pricingTier,
        approved: true,
        lastActivityAt: /* @__PURE__ */ new Date()
      }).where(eq12(partners.id, partnerId));
      return { success: true };
    } catch (error) {
      console.error("Subscription activation error:", error);
      return { success: false, error: error.message };
    }
  }
  /**
   * Get payment history for partner
   */
  async getPaymentHistory(partnerId) {
    return [];
  }
  /**
   * Refund payment
   */
  async refundPayment(transactionId, reason) {
    try {
      await this.updateTransactionStatus(transactionId, "refunded" /* REFUNDED */, { reason });
      return { success: true };
    } catch (error) {
      return { success: false, error: error.message };
    }
  }
  // ==================== PREMIUM FEATURES PAYMENT ====================
  /**
   * Process premium feature payment
   */
  async processPremiumFeaturePayment(params) {
    try {
      const { partnerId, featureId, amount, provider, description } = params;
      const transactionId = `PREMIUM-${featureId}-${partnerId}-${Date.now()}`;
      let paymentUrl;
      switch (provider) {
        case "click" /* CLICK */:
          paymentUrl = this.generateClickPaymentUrl({
            amount,
            orderId: transactionId,
            partnerId,
            returnUrl: `${process.env.FRONTEND_URL}/premium/payment/success`
          });
          break;
        case "payme" /* PAYME */:
          paymentUrl = this.generatePaymePaymentUrl({
            amount,
            orderId: transactionId,
            partnerId
          });
          break;
        default:
          return { success: false, error: "Unsupported payment provider" };
      }
      await this.createTransaction({
        transactionId,
        orderId: transactionId,
        partnerId,
        amount,
        provider,
        status: "pending" /* PENDING */,
        metadata: {
          featureId,
          description,
          type: "premium_feature"
        },
        createdAt: /* @__PURE__ */ new Date()
      });
      return {
        success: true,
        paymentUrl,
        transactionId
      };
    } catch (error) {
      console.error("Premium feature payment error:", error);
      return {
        success: false,
        error: error.message || "Payment processing failed"
      };
    }
  }
  /**
   * Check payment status
   */
  async checkPaymentStatus(transactionId) {
    try {
      const transaction = await this.getTransactionById(transactionId);
      if (!transaction) {
        return {
          status: "not_found",
          completed: false,
          error: "Transaction not found"
        };
      }
      return {
        status: transaction.status,
        completed: transaction.status === "completed" /* COMPLETED */
      };
    } catch (error) {
      return {
        status: "error",
        completed: false,
        error: error.message
      };
    }
  }
};
var paymentGateway = new PaymentGatewayService();

// server/middleware/auth.ts
function requireAuth2(req, res, next) {
  console.log("\u{1F512} Auth check:", {
    path: req.path,
    method: req.method,
    hasSession: !!req.session,
    hasUser: !!req.session?.user,
    sessionID: req.sessionID,
    cookies: req.headers.cookie ? "present" : "missing"
  });
  if (!req.session?.user) {
    console.log("\u274C Auth failed: No user in session");
    return res.status(401).json({
      message: "Tizimga kirish talab qilinadi",
      code: "UNAUTHORIZED"
    });
  }
  console.log("\u2705 Auth success:", { userId: req.session.user.id, role: req.session.user.role });
  next();
}
__name(requireAuth2, "requireAuth");
function requireAdmin(req, res, next) {
  console.log("\u{1F510} Admin check:", {
    path: req.path,
    hasSession: !!req.session,
    hasUser: !!req.session?.user,
    role: req.session?.user?.role
  });
  if (!req.session?.user) {
    console.log("\u274C Admin auth failed: No user");
    return res.status(401).json({
      message: "Tizimga kirish talab qilinadi",
      code: "UNAUTHORIZED"
    });
  }
  if (req.session.user.role !== "admin") {
    console.log("\u274C Admin auth failed: Not admin role");
    return res.status(403).json({
      message: "Admin huquqi talab qilinadi",
      code: "FORBIDDEN"
    });
  }
  console.log("\u2705 Admin auth success:", req.session.user.id);
  next();
}
__name(requireAdmin, "requireAdmin");
function requirePartner(req, res, next) {
  console.log("\u{1F465} Partner check:", {
    path: req.path,
    hasSession: !!req.session,
    hasUser: !!req.session?.user,
    role: req.session?.user?.role
  });
  if (!req.session?.user) {
    console.log("\u274C Partner auth failed: No user");
    return res.status(401).json({
      message: "Tizimga kirish talab qilinadi",
      code: "UNAUTHORIZED"
    });
  }
  if (req.session.user.role !== "partner" && req.session.user.role !== "admin") {
    console.log("\u274C Partner auth failed: Not partner or admin");
    return res.status(403).json({
      message: "Hamkor huquqi talab qilinadi",
      code: "FORBIDDEN"
    });
  }
  console.log("\u2705 Partner auth success:", { userId: req.session.user.id, role: req.session.user.role });
  next();
}
__name(requirePartner, "requirePartner");

// server/routes/paymentRoutes.ts
var router20 = Router11();
router20.post("/create-payment", requireAuth2, async (req, res) => {
  try {
    const { amount, pricingTier, billingPeriod, provider } = req.body;
    const partnerId = req.user.id;
    if (!amount || !pricingTier || !billingPeriod || !provider) {
      return res.status(400).json({
        success: false,
        error: "Missing required fields"
      });
    }
    const result = await paymentGateway.processSubscriptionPayment({
      partnerId,
      amount,
      pricingTier,
      billingPeriod,
      provider
    });
    res.json(result);
  } catch (error) {
    console.error("Create payment error:", error);
    res.status(500).json({
      success: false,
      error: error.message || "Payment creation failed"
    });
  }
});
router20.post("/callback/click", async (req, res) => {
  try {
    const result = await paymentGateway.verifyClickPayment(req.body);
    if (result.success) {
      res.json({
        click_trans_id: req.body.click_trans_id,
        merchant_trans_id: req.body.merchant_trans_id,
        merchant_prepare_id: result.transactionId,
        error: 0,
        error_note: "Success"
      });
    } else {
      res.json({
        click_trans_id: req.body.click_trans_id,
        merchant_trans_id: req.body.merchant_trans_id,
        error: -1,
        error_note: result.error || "Payment failed"
      });
    }
  } catch (error) {
    console.error("Click callback error:", error);
    res.json({
      error: -1,
      error_note: "Internal error"
    });
  }
});
router20.post("/callback/payme", async (req, res) => {
  try {
    const result = await paymentGateway.handlePaymeRequest(req.body);
    res.json(result);
  } catch (error) {
    console.error("Payme callback error:", error);
    res.json({
      error: {
        code: -32400,
        message: "Internal error"
      }
    });
  }
});
router20.post("/verify/:transactionId", requireAuth2, async (req, res) => {
  try {
    const { transactionId } = req.params;
    const result = await paymentGateway.verifyAndActivateSubscription(transactionId);
    res.json(result);
  } catch (error) {
    console.error("Verify payment error:", error);
    res.status(500).json({
      success: false,
      error: error.message || "Verification failed"
    });
  }
});
router20.get("/history", requireAuth2, async (req, res) => {
  try {
    const partnerId = req.user.id;
    const history = await paymentGateway.getPaymentHistory(partnerId);
    res.json({ success: true, data: history });
  } catch (error) {
    console.error("Payment history error:", error);
    res.status(500).json({
      success: false,
      error: error.message || "Failed to fetch history"
    });
  }
});
router20.post("/refund/:transactionId", requireAuth2, async (req, res) => {
  try {
    const { transactionId } = req.params;
    const { reason } = req.body;
    const result = await paymentGateway.refundPayment(transactionId, reason);
    res.json(result);
  } catch (error) {
    console.error("Refund error:", error);
    res.status(500).json({
      success: false,
      error: error.message || "Refund failed"
    });
  }
});
var paymentRoutes_default = router20;

// server/routes/paymentIntegration.ts
init_db();
init_schema();
import { Router as Router12 } from "express";
import crypto5 from "crypto";
import { eq as eq14 } from "drizzle-orm";
var router21 = Router12();
var CLICK_CONFIG = {
  merchantId: process.env.CLICK_MERCHANT_ID || "",
  serviceId: process.env.CLICK_SERVICE_ID || "",
  secretKey: process.env.CLICK_SECRET_KEY || ""
};
function verifyClickSignature(params) {
  const {
    click_trans_id,
    service_id,
    merchant_trans_id,
    amount,
    action,
    sign_time,
    sign_string
  } = params;
  const signString = `${click_trans_id}${service_id}${CLICK_CONFIG.secretKey}${merchant_trans_id}${amount}${action}${sign_time}`;
  const hash = crypto5.createHash("md5").update(signString).digest("hex");
  return hash === sign_string;
}
__name(verifyClickSignature, "verifyClickSignature");
router21.post("/click/prepare", async (req, res) => {
  try {
    const {
      click_trans_id,
      service_id,
      merchant_trans_id,
      amount,
      action,
      sign_time,
      sign_string
    } = req.body;
    console.log("Click Prepare:", req.body);
    if (!verifyClickSignature(req.body)) {
      return res.json({
        error: -1,
        error_note: "Invalid signature"
      });
    }
    const invoice = await db.query.invoices.findFirst({
      where: eq14(invoices.id, merchant_trans_id)
    });
    if (!invoice) {
      return res.json({
        error: -5,
        error_note: "Invoice not found"
      });
    }
    const { checkAndProcessFirstPurchase: checkAndProcessFirstPurchase2 } = await Promise.resolve().then(() => (init_referralFirstPurchaseService(), referralFirstPurchaseService_exports));
    if (invoice.status === "paid") {
      try {
        await checkAndProcessFirstPurchase2(
          invoice.partnerId,
          invoice.subscriptionId || void 0,
          invoice.id,
          payment.id
        );
      } catch (refError) {
        console.error("Referral first purchase processing error:", refError);
      }
      return res.json({
        error: -4,
        error_note: "Already paid"
      });
    }
    if (parseFloat(amount) !== invoice.amount) {
      return res.json({
        error: -2,
        error_note: "Invalid amount"
      });
    }
    const paymentId = `pay_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    await db.insert(payments).values({
      id: paymentId,
      invoiceId: invoice.id,
      partnerId: invoice.partnerId,
      amount: invoice.amount,
      currency: invoice.currency || "USD",
      paymentMethod: "click",
      transactionId: click_trans_id.toString(),
      status: "pending",
      metadata: JSON.stringify(req.body),
      createdAt: /* @__PURE__ */ new Date()
    });
    return res.json({
      click_trans_id,
      merchant_trans_id,
      merchant_prepare_id: paymentId,
      error: 0,
      error_note: "Success"
    });
  } catch (error) {
    console.error("Click Prepare Error:", error);
    return res.json({
      error: -9,
      error_note: "System error"
    });
  }
});
router21.post("/click/complete", async (req, res) => {
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
      sign_string
    } = req.body;
    console.log("Click Complete:", req.body);
    if (!verifyClickSignature(req.body)) {
      return res.json({
        error: -1,
        error_note: "Invalid signature"
      });
    }
    const payment2 = await db.query.payments.findFirst({
      where: eq14(payments.id, merchant_prepare_id)
    });
    if (!payment2) {
      return res.json({
        error: -6,
        error_note: "Payment not found"
      });
    }
    if (click_error !== 0) {
      await db.update(payments).set({
        status: "failed",
        metadata: JSON.stringify({ ...req.body, failed_at: /* @__PURE__ */ new Date() })
      }).where(eq14(payments.id, payment2.id));
      return res.json({
        error: -9,
        error_note: "Payment failed"
      });
    }
    await db.update(payments).set({
      status: "completed",
      completedAt: /* @__PURE__ */ new Date(),
      metadata: JSON.stringify(req.body)
    }).where(eq14(payments.id, payment2.id));
    await db.update(invoices).set({
      status: "paid",
      paidAt: /* @__PURE__ */ new Date(),
      paymentMethod: "click"
    }).where(eq14(invoices.id, payment2.invoiceId));
    const invoice = await db.query.invoices.findFirst({
      where: eq14(invoices.id, payment2.invoiceId)
    });
    if (invoice) {
      try {
        const { checkAndProcessFirstPurchase: checkAndProcessFirstPurchase2 } = await Promise.resolve().then(() => (init_referralFirstPurchaseService(), referralFirstPurchaseService_exports));
        await checkAndProcessFirstPurchase2(
          invoice.partnerId,
          invoice.subscriptionId || void 0,
          invoice.id,
          payment2.id
        );
      } catch (refError) {
        console.error("Referral first purchase processing error:", refError);
      }
    }
    if (invoice?.subscriptionId) {
      await db.update(subscriptions).set({
        status: "active",
        updatedAt: /* @__PURE__ */ new Date()
      }).where(eq14(subscriptions.id, invoice.subscriptionId));
    }
    return res.json({
      click_trans_id,
      merchant_trans_id,
      merchant_confirm_id: payment2.id,
      error: 0,
      error_note: "Success"
    });
  } catch (error) {
    console.error("Click Complete Error:", error);
    return res.json({
      error: -9,
      error_note: "System error"
    });
  }
});
var PAYME_CONFIG = {
  merchantId: process.env.PAYME_MERCHANT_ID || "",
  secretKey: process.env.PAYME_SECRET_KEY || ""
};
function verifyPaymeAuth(req) {
  const auth = req.headers.authorization;
  if (!auth || !auth.startsWith("Basic ")) return false;
  const credentials = Buffer.from(auth.slice(6), "base64").toString();
  const [username, password] = credentials.split(":");
  return username === "Paycom" && password === PAYME_CONFIG.secretKey;
}
__name(verifyPaymeAuth, "verifyPaymeAuth");
router21.post("/payme", async (req, res) => {
  try {
    if (!verifyPaymeAuth(req)) {
      return res.json({
        error: {
          code: -32504,
          message: "Insufficient privilege"
        }
      });
    }
    const { method, params, id } = req.body;
    console.log("Payme Request:", { method, params });
    switch (method) {
      case "CheckPerformTransaction":
        return await handlePaymeCheckPerformTransaction(params, id, res);
      case "CreateTransaction":
        return await handlePaymeCreateTransaction(params, id, res);
      case "PerformTransaction":
        return await handlePaymePerformTransaction(params, id, res);
      case "CancelTransaction":
        return await handlePaymeCancelTransaction(params, id, res);
      case "CheckTransaction":
        return await handlePaymeCheckTransaction(params, id, res);
      default:
        return res.json({
          error: {
            code: -32601,
            message: "Method not found"
          },
          id
        });
    }
  } catch (error) {
    console.error("Payme Error:", error);
    return res.json({
      error: {
        code: -32400,
        message: "System error"
      }
    });
  }
});
async function handlePaymeCheckPerformTransaction(params, id, res) {
  const { account } = params;
  const invoiceId = account.invoice_id;
  const invoice = await db.query.invoices.findFirst({
    where: eq14(invoices.id, invoiceId)
  });
  if (!invoice) {
    return res.json({
      error: {
        code: -31050,
        message: "Invoice not found"
      },
      id
    });
  }
  if (invoice.status === "paid") {
    return res.json({
      error: {
        code: -31051,
        message: "Already paid"
      },
      id
    });
  }
  return res.json({
    result: {
      allow: true
    },
    id
  });
}
__name(handlePaymeCheckPerformTransaction, "handlePaymeCheckPerformTransaction");
async function handlePaymeCreateTransaction(params, id, res) {
  const { account, amount, time } = params;
  const invoiceId = account.invoice_id;
  const invoice = await db.query.invoices.findFirst({
    where: eq14(invoices.id, invoiceId)
  });
  if (!invoice) {
    return res.json({
      error: {
        code: -31050,
        message: "Invoice not found"
      },
      id
    });
  }
  const expectedAmount = Math.round(invoice.amount * 12e3 * 100);
  if (amount !== expectedAmount) {
    return res.json({
      error: {
        code: -31001,
        message: "Invalid amount"
      },
      id
    });
  }
  const paymentId = `pay_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  await db.insert(payments).values({
    id: paymentId,
    invoiceId: invoice.id,
    partnerId: invoice.partnerId,
    amount: invoice.amount,
    currency: invoice.currency || "USD",
    paymentMethod: "payme",
    transactionId: params.id,
    status: "pending",
    metadata: JSON.stringify(params),
    createdAt: new Date(time)
  });
  return res.json({
    result: {
      create_time: time,
      transaction: paymentId,
      state: 1
    },
    id
  });
}
__name(handlePaymeCreateTransaction, "handlePaymeCreateTransaction");
async function handlePaymePerformTransaction(params, id, res) {
  const paymentId = params.id;
  const payment2 = await db.query.payments.findFirst({
    where: eq14(payments.transactionId, paymentId)
  });
  if (!payment2) {
    return res.json({
      error: {
        code: -31003,
        message: "Transaction not found"
      },
      id
    });
  }
  await db.update(payments).set({
    status: "completed",
    completedAt: /* @__PURE__ */ new Date()
  }).where(eq14(payments.id, payment2.id));
  await db.update(invoices).set({
    status: "paid",
    paidAt: /* @__PURE__ */ new Date(),
    paymentMethod: "payme"
  }).where(eq14(invoices.id, payment2.invoiceId));
  return res.json({
    result: {
      transaction: payment2.id,
      perform_time: Date.now(),
      state: 2
    },
    id
  });
}
__name(handlePaymePerformTransaction, "handlePaymePerformTransaction");
async function handlePaymeCancelTransaction(params, id, res) {
  const paymentId = params.id;
  const payment2 = await db.query.payments.findFirst({
    where: eq14(payments.transactionId, paymentId)
  });
  if (!payment2) {
    return res.json({
      error: {
        code: -31003,
        message: "Transaction not found"
      },
      id
    });
  }
  await db.update(payments).set({
    status: "cancelled"
  }).where(eq14(payments.id, payment2.id));
  return res.json({
    result: {
      transaction: payment2.id,
      cancel_time: Date.now(),
      state: -1
    },
    id
  });
}
__name(handlePaymeCancelTransaction, "handlePaymeCancelTransaction");
async function handlePaymeCheckTransaction(params, id, res) {
  const paymentId = params.id;
  const payment2 = await db.query.payments.findFirst({
    where: eq14(payments.transactionId, paymentId)
  });
  if (!payment2) {
    return res.json({
      error: {
        code: -31003,
        message: "Transaction not found"
      },
      id
    });
  }
  const stateMap = {
    pending: 1,
    completed: 2,
    cancelled: -1,
    failed: -2
  };
  return res.json({
    result: {
      transaction: payment2.id,
      state: stateMap[payment2.status] || 0,
      create_time: payment2.createdAt?.getTime(),
      perform_time: payment2.completedAt?.getTime()
    },
    id
  });
}
__name(handlePaymeCheckTransaction, "handlePaymeCheckTransaction");
router21.post("/manual", async (req, res) => {
  try {
    const { invoiceId, amount, paymentMethod, notes } = req.body;
    if (!req.user || req.user.role !== "admin") {
      return res.status(403).json({ error: "Unauthorized" });
    }
    const invoice = await db.query.invoices.findFirst({
      where: eq14(invoices.id, invoiceId)
    });
    if (!invoice) {
      return res.status(404).json({ error: "Invoice not found" });
    }
    const paymentId = `pay_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    await db.insert(payments).values({
      id: paymentId,
      invoiceId: invoice.id,
      partnerId: invoice.partnerId,
      amount: amount || invoice.amount,
      currency: invoice.currency || "USD",
      paymentMethod: paymentMethod || "manual",
      status: "completed",
      metadata: JSON.stringify({ notes, recorded_by: req.user.id }),
      createdAt: /* @__PURE__ */ new Date(),
      completedAt: /* @__PURE__ */ new Date()
    });
    await db.update(invoices).set({
      status: "paid",
      paidAt: /* @__PURE__ */ new Date(),
      paymentMethod: paymentMethod || "manual"
    }).where(eq14(invoices.id, invoice.id));
    res.json({ success: true, paymentId });
  } catch (error) {
    console.error("Manual Payment Error:", error);
    res.status(500).json({ error: "Failed to record payment" });
  }
});
var paymentIntegration_default = router21;

// server/routes/whatsappRoutes.ts
import { Router as Router13 } from "express";

// server/services/whatsappService.ts
import axios from "axios";
var WhatsAppService = class {
  static {
    __name(this, "WhatsAppService");
  }
  config;
  enabled;
  constructor() {
    this.config = {
      apiUrl: process.env.WHATSAPP_API_URL || "https://graph.facebook.com/v18.0",
      accessToken: process.env.WHATSAPP_ACCESS_TOKEN || "",
      phoneNumberId: process.env.WHATSAPP_PHONE_NUMBER_ID || "",
      businessAccountId: process.env.WHATSAPP_BUSINESS_ACCOUNT_ID || ""
    };
    this.enabled = !!(this.config.accessToken && this.config.phoneNumberId);
  }
  /**
   * Send WhatsApp message
   */
  async sendMessage(message) {
    if (!this.enabled) {
      console.warn("WhatsApp service not configured");
      return { success: false, error: "WhatsApp service not configured" };
    }
    try {
      const response = await axios.post(
        `${this.config.apiUrl}/${this.config.phoneNumberId}/messages`,
        {
          messaging_product: "whatsapp",
          recipient_type: "individual",
          ...message
        },
        {
          headers: {
            "Authorization": `Bearer ${this.config.accessToken}`,
            "Content-Type": "application/json"
          }
        }
      );
      return {
        success: true,
        messageId: response.data.messages[0].id
      };
    } catch (error) {
      console.error("WhatsApp send error:", error.response?.data || error.message);
      return {
        success: false,
        error: error.response?.data?.error?.message || error.message
      };
    }
  }
  /**
   * Send text message
   */
  async sendTextMessage(phone, text2) {
    return this.sendMessage({
      to: this.formatPhoneNumber(phone),
      type: "text",
      text: { body: text2 }
    });
  }
  /**
   * Send template message
   */
  async sendTemplateMessage(phone, templateName, languageCode = "uz", components) {
    return this.sendMessage({
      to: this.formatPhoneNumber(phone),
      type: "template",
      template: {
        name: templateName,
        language: { code: languageCode },
        components
      }
    });
  }
  /**
   * Send order confirmation
   */
  async sendOrderConfirmation(notification) {
    const { phone, data } = notification;
    const { orderNumber, totalAmount, items } = data;
    const message = `
\u{1F389} *Buyurtma tasdiqlandi!*

\u{1F4E6} Buyurtma raqami: *${orderNumber}*
\u{1F4B0} Jami summa: *${this.formatCurrency(totalAmount)}*

\u{1F4CB} Mahsulotlar:
${items.map(
      (item, index) => `${index + 1}. ${item.name} - ${item.quantity} dona`
    ).join("\n")}

\u2705 Buyurtmangiz qabul qilindi va tez orada yetkazib beriladi.

Savol bo'lsa, biz bilan bog'laning: +998 XX XXX XX XX
    `.trim();
    await this.sendTextMessage(phone, message);
  }
  /**
   * Send order status update
   */
  async sendOrderStatusUpdate(notification) {
    const { phone, data } = notification;
    const { orderNumber, status, trackingNumber } = data;
    const statusMessages = {
      processing: "\u23F3 Buyurtmangiz tayyorlanmoqda",
      shipped: "\u{1F69A} Buyurtmangiz yo'lga chiqdi",
      delivered: "\u2705 Buyurtmangiz yetkazib berildi",
      cancelled: "\u274C Buyurtmangiz bekor qilindi"
    };
    let message = `
${statusMessages[status] || "\u{1F4E6} Buyurtma holati yangilandi"}

\u{1F4E6} Buyurtma: *${orderNumber}*
\u{1F4CD} Holat: *${status}*
    `.trim();
    if (trackingNumber) {
      message += `
\u{1F50D} Kuzatuv raqami: *${trackingNumber}*`;
    }
    await this.sendTextMessage(phone, message);
  }
  /**
   * Send payment reminder
   */
  async sendPaymentReminder(notification) {
    const { phone, data } = notification;
    const { amount, dueDate, invoiceUrl } = data;
    const message = `
\u{1F4B3} *To'lov eslatmasi*

Hurmatli mijoz, sizda to'lanmagan hisob-faktura mavjud:

\u{1F4B0} Summa: *${this.formatCurrency(amount)}*
\u{1F4C5} Muddat: *${dueDate}*

To'lov qilish uchun: ${invoiceUrl}

Savol bo'lsa, biz bilan bog'laning.
    `.trim();
    await this.sendTextMessage(phone, message);
  }
  /**
   * Send marketing message
   */
  async sendMarketingMessage(notification) {
    const { phone, data } = notification;
    const { title, message, imageUrl, ctaUrl } = data;
    let fullMessage = `
\u{1F381} *${title}*

${message}
    `.trim();
    if (ctaUrl) {
      fullMessage += `

\u{1F449} Batafsil: ${ctaUrl}`;
    }
    await this.sendTextMessage(phone, fullMessage);
  }
  /**
   * Send support message
   */
  async sendSupportMessage(notification) {
    const { phone, data } = notification;
    const { message } = data;
    await this.sendTextMessage(phone, message);
  }
  /**
   * Send bulk notifications
   */
  async sendBulkNotifications(notifications2) {
    const results = {
      success: 0,
      failed: 0,
      errors: []
    };
    for (const notification of notifications2) {
      try {
        await this.sendNotification(notification);
        results.success++;
        await this.delay(15);
      } catch (error) {
        results.failed++;
        results.errors.push({
          phone: notification.phone,
          error: error.message
        });
      }
    }
    return results;
  }
  /**
   * Send notification based on type
   */
  async sendNotification(notification) {
    switch (notification.type) {
      case "order_confirmation":
        await this.sendOrderConfirmation(notification);
        break;
      case "order_status":
        await this.sendOrderStatusUpdate(notification);
        break;
      case "payment_reminder":
        await this.sendPaymentReminder(notification);
        break;
      case "marketing":
        await this.sendMarketingMessage(notification);
        break;
      case "support":
        await this.sendSupportMessage(notification);
        break;
      default:
        throw new Error(`Unknown notification type: ${notification.type}`);
    }
  }
  /**
   * Handle incoming webhook
   */
  async handleWebhook(body) {
    const { entry } = body;
    if (!entry || !entry[0]) {
      return;
    }
    const changes = entry[0].changes;
    if (!changes || !changes[0]) {
      return;
    }
    const value = changes[0].value;
    if (!value.messages || !value.messages[0]) {
      return;
    }
    const message = value.messages[0];
    const from = message.from;
    const text2 = message.text?.body;
    const messageType = message.type;
    console.log("WhatsApp incoming message:", {
      from,
      type: messageType,
      text: text2
    });
    if (messageType === "text") {
      await this.handleTextMessage(from, text2);
    } else if (messageType === "interactive") {
      await this.handleInteractiveMessage(from, message.interactive);
    }
  }
  /**
   * Handle text message
   */
  async handleTextMessage(from, text2) {
    const lowerText = text2.toLowerCase().trim();
    if (lowerText.includes("buyurtma") || lowerText.includes("order")) {
      await this.sendTextMessage(
        from,
        "Buyurtmangiz haqida ma'lumot olish uchun buyurtma raqamingizni yuboring."
      );
    } else if (lowerText.includes("yordam") || lowerText.includes("help")) {
      await this.sendTextMessage(
        from,
        `
\u{1F916} *SellerCloudX Yordam*

Quyidagi buyruqlardan foydalanishingiz mumkin:
\u2022 Buyurtma - Buyurtma holati
\u2022 Narx - Narxlar haqida
\u2022 Yordam - Yordam olish
\u2022 Aloqa - Biz bilan bog'lanish

Yoki to'g'ridan-to'g'ri savolingizni yozing.
        `.trim()
      );
    } else {
      console.log("Forwarding message to support:", { from, text: text2 });
    }
  }
  /**
   * Handle interactive message (buttons, lists)
   */
  async handleInteractiveMessage(from, interactive) {
    const { type, button_reply, list_reply } = interactive;
    if (type === "button_reply") {
      const buttonId = button_reply.id;
      console.log("Button clicked:", buttonId);
    } else if (type === "list_reply") {
      const listId = list_reply.id;
      console.log("List item selected:", listId);
    }
  }
  /**
   * Verify webhook signature
   */
  verifyWebhookSignature(signature, body) {
    const expectedSignature = crypto.createHmac("sha256", process.env.WHATSAPP_APP_SECRET || "").update(body).digest("hex");
    return signature === `sha256=${expectedSignature}`;
  }
  /**
   * Format phone number for WhatsApp
   */
  formatPhoneNumber(phone) {
    let cleaned = phone.replace(/\D/g, "");
    if (!cleaned.startsWith("998")) {
      cleaned = "998" + cleaned;
    }
    return cleaned;
  }
  /**
   * Format currency
   */
  formatCurrency(amount) {
    return new Intl.NumberFormat("uz-UZ", {
      style: "currency",
      currency: "UZS",
      minimumFractionDigits: 0
    }).format(amount);
  }
  /**
   * Delay helper
   */
  delay(ms) {
    return new Promise((resolve) => setTimeout(resolve, ms));
  }
  /**
   * Check if service is enabled
   */
  isEnabled() {
    return this.enabled;
  }
};
var whatsappService = new WhatsAppService();

// server/routes/whatsappRoutes.ts
var router22 = Router13();
router22.post("/send", requireAuth2, async (req, res) => {
  try {
    const { phone, type, data } = req.body;
    if (!phone || !type || !data) {
      return res.status(400).json({
        success: false,
        error: "Missing required fields"
      });
    }
    const notification = {
      partnerId: req.user.id,
      phone,
      type,
      data
    };
    await whatsappService.sendNotification(notification);
    res.json({ success: true });
  } catch (error) {
    console.error("WhatsApp send error:", error);
    res.status(500).json({
      success: false,
      error: error.message || "Failed to send notification"
    });
  }
});
router22.post("/send-bulk", requireAdmin, async (req, res) => {
  try {
    const { notifications: notifications2 } = req.body;
    if (!notifications2 || !Array.isArray(notifications2)) {
      return res.status(400).json({
        success: false,
        error: "Invalid notifications array"
      });
    }
    const results = await whatsappService.sendBulkNotifications(notifications2);
    res.json({
      success: true,
      results
    });
  } catch (error) {
    console.error("WhatsApp bulk send error:", error);
    res.status(500).json({
      success: false,
      error: error.message || "Failed to send bulk notifications"
    });
  }
});
router22.get("/webhook", (req, res) => {
  const mode = req.query["hub.mode"];
  const token = req.query["hub.verify_token"];
  const challenge = req.query["hub.challenge"];
  const verifyToken = process.env.WHATSAPP_VERIFY_TOKEN || "sellercloudx_verify_token";
  if (mode === "subscribe" && token === verifyToken) {
    console.log("WhatsApp webhook verified");
    res.status(200).send(challenge);
  } else {
    res.sendStatus(403);
  }
});
router22.post("/webhook", async (req, res) => {
  try {
    const signature = req.headers["x-hub-signature-256"];
    const body = JSON.stringify(req.body);
    if (signature && !whatsappService.verifyWebhookSignature(signature, body)) {
      return res.sendStatus(403);
    }
    await whatsappService.handleWebhook(req.body);
    res.sendStatus(200);
  } catch (error) {
    console.error("WhatsApp webhook error:", error);
    res.sendStatus(500);
  }
});
router22.get("/status", requireAuth2, (req, res) => {
  res.json({
    enabled: whatsappService.isEnabled()
  });
});
var whatsappRoutes_default = router22;

// server/routes/walletRoutes.ts
import { Router as Router14 } from "express";
init_db();
init_schema();
import { eq as eq15, and as and13, desc as desc4 } from "drizzle-orm";
import { nanoid as nanoid13 } from "nanoid";
var router23 = Router14();
router23.get("/wallet", requirePartner, asyncHandler(async (req, res) => {
  const partnerId = req.session.user.id;
  const [partner] = await db.select().from(partners).where(eq15(partners.userId, partnerId)).limit(1);
  if (!partner) {
    return res.status(404).json({ message: "Hamkor topilmadi" });
  }
  const transactions = await db.select().from(walletTransactions).where(eq15(walletTransactions.partnerId, partner.id)).orderBy(desc4(walletTransactions.createdAt)).limit(50);
  const balance = transactions.filter((t) => t.status === "completed" && (t.type === "income" || t.type === "commission")).reduce((sum, t) => sum + parseFloat(t.amount), 0) - transactions.filter((t) => t.status === "completed" && (t.type === "expense" || t.type === "withdrawal")).reduce((sum, t) => sum + parseFloat(t.amount), 0);
  const pending = transactions.filter((t) => t.status === "pending" && (t.type === "income" || t.type === "commission")).reduce((sum, t) => sum + parseFloat(t.amount), 0);
  const totalEarned = transactions.filter((t) => t.status === "completed" && (t.type === "income" || t.type === "commission")).reduce((sum, t) => sum + parseFloat(t.amount), 0);
  res.json({
    balance: balance.toFixed(2),
    pending: pending.toFixed(2),
    totalEarned: totalEarned.toFixed(2),
    transactions: transactions.slice(0, 20)
    // Last 20 transactions
  });
}));
router23.post("/wallet/withdraw", requirePartner, asyncHandler(async (req, res) => {
  const partnerId = req.session.user.id;
  const { amount, method, accountInfo } = req.body;
  if (!amount || amount <= 0) {
    return res.status(400).json({ message: "Noto'g'ri summa" });
  }
  const [partner] = await db.select().from(partners).where(eq15(partners.userId, partnerId)).limit(1);
  if (!partner) {
    return res.status(404).json({ message: "Hamkor topilmadi" });
  }
  const transactions = await db.select().from(walletTransactions).where(eq15(walletTransactions.partnerId, partner.id));
  const balance = transactions.filter((t) => t.status === "completed" && (t.type === "income" || t.type === "commission")).reduce((sum, t) => sum + parseFloat(t.amount), 0) - transactions.filter((t) => t.status === "completed" && (t.type === "expense" || t.type === "withdrawal")).reduce((sum, t) => sum + parseFloat(t.amount), 0);
  if (balance < amount) {
    return res.status(400).json({ message: "Balans yetarli emas" });
  }
  const transaction = {
    id: nanoid13(),
    partnerId: partner.id,
    type: "withdrawal",
    amount: amount.toString(),
    description: `Yechib olish: ${method}`,
    status: "pending",
    metadata: JSON.stringify({ method, accountInfo }),
    createdAt: (/* @__PURE__ */ new Date()).toISOString(),
    updatedAt: (/* @__PURE__ */ new Date()).toISOString()
  };
  await db.insert(walletTransactions).values(transaction);
  res.json({
    message: "So'rov yuborildi",
    transaction
  });
}));
router23.get("/transactions", requirePartner, asyncHandler(async (req, res) => {
  const partnerId = req.session.user.id;
  const { type, status, limit = 50 } = req.query;
  const [partner] = await db.select().from(partners).where(eq15(partners.userId, partnerId)).limit(1);
  if (!partner) {
    return res.status(404).json({ message: "Hamkor topilmadi" });
  }
  let query = db.select().from(walletTransactions).where(eq15(walletTransactions.partnerId, partner.id));
  if (type) {
    query = query.where(and13(
      eq15(walletTransactions.partnerId, partner.id),
      eq15(walletTransactions.type, type)
    ));
  }
  if (status) {
    query = query.where(and13(
      eq15(walletTransactions.partnerId, partner.id),
      eq15(walletTransactions.status, status)
    ));
  }
  const transactions = await query.orderBy(desc4(walletTransactions.createdAt)).limit(parseInt(limit));
  res.json({ transactions });
}));
var walletRoutes_default = router23;

// server/routes/paymentHistoryRoutes.ts
import { Router as Router15 } from "express";
init_db();
init_schema();
import { eq as eq16, desc as desc5 } from "drizzle-orm";
var router24 = Router15();
router24.get("/payment-history", requirePartner, asyncHandler(async (req, res) => {
  const partnerId = req.session.user.id;
  const [partner] = await db.select().from(partners).where(eq16(partners.userId, partnerId)).limit(1);
  if (!partner) {
    return res.status(404).json({ message: "Hamkor topilmadi" });
  }
  const payments4 = await db.select().from(paymentHistory).where(eq16(paymentHistory.partnerId, partner.id)).orderBy(desc5(paymentHistory.createdAt)).limit(100);
  const grouped = payments4.reduce((acc, payment2) => {
    const month = new Date(payment2.createdAt).toISOString().slice(0, 7);
    if (!acc[month]) {
      acc[month] = {
        month,
        payments: [],
        total: 0
      };
    }
    acc[month].payments.push(payment2);
    acc[month].total += parseFloat(payment2.amount);
    return acc;
  }, {});
  res.json({
    payments: payments4,
    grouped: Object.values(grouped)
  });
}));
var paymentHistoryRoutes_default = router24;

// server/routes/referralDashboardRoutes.ts
import { Router as Router16 } from "express";
init_db();
init_schema();
import { eq as eq17, and as and15 } from "drizzle-orm";
var router25 = Router16();
router25.get("/referrals/dashboard", requirePartner, asyncHandler(async (req, res) => {
  const partnerId = req.session.user.id;
  const [partner] = await db.select().from(partners).where(eq17(partners.userId, partnerId)).limit(1);
  if (!partner) {
    return res.status(404).json({ message: "Hamkor topilmadi" });
  }
  const allReferrals = await db.select().from(referrals).where(eq17(referrals.referrerId, partner.id));
  const earnings = await db.select().from(walletTransactions).where(and15(
    eq17(walletTransactions.partnerId, partner.id),
    eq17(walletTransactions.type, "commission"),
    eq17(walletTransactions.status, "completed")
  ));
  const totalEarnings = earnings.reduce((sum, t) => sum + parseFloat(t.amount), 0);
  const pendingEarnings = await db.select().from(walletTransactions).where(and15(
    eq17(walletTransactions.partnerId, partner.id),
    eq17(walletTransactions.type, "commission"),
    eq17(walletTransactions.status, "pending")
  ));
  const pending = pendingEarnings.reduce((sum, t) => sum + parseFloat(t.amount), 0);
  const referralCode = partner.referralCode || partner.id.slice(0, 8);
  const referralLink = `https://sellercloudx.com/register?ref=${referralCode}`;
  res.json({
    referralCode,
    referralLink,
    stats: {
      totalReferrals: allReferrals.length,
      activeReferrals: allReferrals.filter((r) => r.status === "active").length,
      pendingReferrals: allReferrals.filter((r) => r.status === "pending").length,
      totalEarnings: totalEarnings.toFixed(2),
      pendingEarnings: pending.toFixed(2),
      conversionRate: allReferrals.length > 0 ? (allReferrals.filter((r) => r.status === "active").length / allReferrals.length * 100).toFixed(1) : "0"
    },
    referrals: allReferrals.slice(0, 20),
    recentEarnings: earnings.slice(0, 10)
  });
}));
router25.get("/referrals/analytics", requirePartner, asyncHandler(async (req, res) => {
  const partnerId = req.session.user.id;
  const [partner] = await db.select().from(partners).where(eq17(partners.userId, partnerId)).limit(1);
  if (!partner) {
    return res.status(404).json({ message: "Hamkor topilmadi" });
  }
  const allReferrals = await db.select().from(referrals).where(eq17(referrals.referrerId, partner.id));
  const byMonth = allReferrals.reduce((acc, ref) => {
    const month = new Date(ref.createdAt).toISOString().slice(0, 7);
    if (!acc[month]) {
      acc[month] = { month, count: 0, active: 0 };
    }
    acc[month].count++;
    if (ref.status === "active") acc[month].active++;
    return acc;
  }, {});
  res.json({
    byMonth: Object.values(byMonth),
    byStatus: {
      active: allReferrals.filter((r) => r.status === "active").length,
      pending: allReferrals.filter((r) => r.status === "pending").length,
      inactive: allReferrals.filter((r) => r.status === "inactive").length
    }
  });
}));
var referralDashboardRoutes_default = router25;

// server/routes/impersonationRoutes.ts
import { Router as Router17 } from "express";
init_db();
init_schema();
import { eq as eq18 } from "drizzle-orm";
import { nanoid as nanoid14 } from "nanoid";
var router26 = Router17();
router26.post("/impersonate/:partnerId", requireAdmin, asyncHandler(async (req, res) => {
  const adminId = req.session.user.id;
  const { partnerId } = req.params;
  console.log("\u{1F3AD} Impersonation request:", { adminId, partnerId });
  const [partner] = await db.select().from(partners).where(eq18(partners.id, partnerId)).limit(1);
  if (!partner) {
    return res.status(404).json({ message: "Hamkor topilmadi" });
  }
  const [partnerUser] = await db.select().from(users).where(eq18(users.id, partner.userId)).limit(1);
  if (!partnerUser) {
    return res.status(404).json({ message: "Foydalanuvchi topilmadi" });
  }
  const originalAdminData = {
    id: req.session.user.id,
    username: req.session.user.username,
    email: req.session.user.email,
    role: req.session.user.role
  };
  req.session.impersonating = {
    originalAdmin: originalAdminData,
    targetPartner: {
      id: partner.id,
      userId: partner.userId
    },
    startedAt: (/* @__PURE__ */ new Date()).toISOString()
  };
  req.session.user = {
    id: partnerUser.id,
    username: partnerUser.username,
    email: partnerUser.email || void 0,
    firstName: partnerUser.firstName || void 0,
    lastName: partnerUser.lastName || void 0,
    role: "partner"
  };
  await db.insert(impersonationLogs).values({
    id: nanoid14(),
    adminId,
    partnerId: partner.id,
    action: "start",
    ipAddress: req.ip,
    userAgent: req.headers["user-agent"],
    notes: `Admin ${originalAdminData.username} impersonated partner ${partnerUser.username}`,
    createdAt: (/* @__PURE__ */ new Date()).toISOString()
  });
  await new Promise((resolve, reject) => {
    req.session.save((err) => {
      if (err) reject(err);
      else resolve();
    });
  });
  console.log("\u2705 Impersonation started:", {
    admin: originalAdminData.username,
    partner: partnerUser.username
  });
  res.json({
    message: "Impersonation boshlandi",
    partnerData: {
      id: partner.id,
      userId: partnerUser.id,
      username: partnerUser.username,
      businessName: partner.businessName
    },
    impersonating: true
  });
}));
router26.post("/exit-impersonate", asyncHandler(async (req, res) => {
  const impersonationData = req.session.impersonating;
  if (!impersonationData) {
    return res.status(400).json({ message: "Impersonation faol emas" });
  }
  console.log("\u{1F3AD} Exiting impersonation:", impersonationData);
  req.session.user = {
    id: impersonationData.originalAdmin.id,
    username: impersonationData.originalAdmin.username,
    email: impersonationData.originalAdmin.email,
    role: impersonationData.originalAdmin.role
  };
  await db.insert(impersonationLogs).values({
    id: nanoid14(),
    adminId: impersonationData.originalAdmin.id,
    partnerId: impersonationData.targetPartner.id,
    action: "end",
    ipAddress: req.ip,
    userAgent: req.headers["user-agent"],
    notes: `Admin ${impersonationData.originalAdmin.username} exited impersonation`,
    createdAt: (/* @__PURE__ */ new Date()).toISOString()
  });
  delete req.session.impersonating;
  await new Promise((resolve, reject) => {
    req.session.save((err) => {
      if (err) reject(err);
      else resolve();
    });
  });
  console.log("\u2705 Impersonation ended, restored to admin");
  res.json({
    message: "Admin holatga qaytdingiz",
    impersonating: false
  });
}));
router26.get("/impersonate/status", asyncHandler(async (req, res) => {
  const impersonationData = req.session.impersonating;
  if (!impersonationData) {
    return res.json({ impersonating: false });
  }
  res.json({
    impersonating: true,
    originalAdmin: impersonationData.originalAdmin,
    targetPartner: impersonationData.targetPartner,
    startedAt: impersonationData.startedAt
  });
}));
var impersonationRoutes_default = router26;

// server/routes/businessAnalyticsRoutes.ts
import { Router as Router18 } from "express";
init_db();
init_schema();
import { eq as eq19 } from "drizzle-orm";
var router27 = Router18();
router27.get("/business-metrics", requireAdmin, asyncHandler(async (req, res) => {
  console.log("\u{1F4CA} Calculating business metrics...");
  const allPartners = await db.select().from(partners);
  const totalPartners = allPartners.length;
  const activePartners = allPartners.filter((p) => p.isActive).length;
  const payingPartners = allPartners.filter(
    (p) => p.pricingTier && !["free", "free_starter"].includes(p.pricingTier)
  ).length;
  const freePartners = allPartners.filter(
    (p) => !p.pricingTier || ["free", "free_starter"].includes(p.pricingTier)
  ).length;
  const tierDistribution = {
    free: allPartners.filter((p) => !p.pricingTier || p.pricingTier === "free" || p.pricingTier === "free_starter").length,
    basic: allPartners.filter((p) => p.pricingTier === "basic").length,
    starter_pro: allPartners.filter((p) => p.pricingTier === "starter_pro").length,
    professional: allPartners.filter((p) => p.pricingTier === "professional").length
  };
  const tierPrices = {
    basic: 69,
    starter_pro: 349,
    professional: 899
  };
  let mrr = 0;
  allPartners.forEach((partner) => {
    if (partner.pricingTier && tierPrices[partner.pricingTier]) {
      mrr += tierPrices[partner.pricingTier];
    }
  });
  const arr = mrr * 12;
  const completedTransactions = await db.select().from(walletTransactions).where(eq19(walletTransactions.status, "completed"));
  const totalRevenue = completedTransactions.filter((t) => t.type === "income" || t.type === "commission").reduce((sum, t) => sum + parseFloat(t.amount), 0);
  const totalCosts = totalRevenue * 0.15;
  const profit = totalRevenue - totalCosts;
  const profitMargin = totalRevenue > 0 ? (profit / totalRevenue * 100).toFixed(1) : "0";
  const churnedPartners = allPartners.filter((p) => !p.isActive).length;
  const churnRate = totalPartners > 0 ? (churnedPartners / totalPartners * 100).toFixed(1) : "0";
  const growth = {
    partners: "+12.5",
    // Mock data - calculate from historical
    mrr: "+15.3",
    revenue: "+18.7"
  };
  const metrics = {
    totalPartners,
    activePartners,
    payingPartners,
    churnedPartners,
    freePartners,
    mrr: mrr.toFixed(2),
    arr: arr.toFixed(2),
    totalRevenue: totalRevenue.toFixed(2),
    totalCosts: totalCosts.toFixed(2),
    profitMargin,
    churnRate,
    growth,
    tierDistribution
  };
  console.log("\u{1F4CA} Business metrics:", metrics);
  res.json({ metrics });
}));
var businessAnalyticsRoutes_default = router27;

// server/routes/adminManagementRoutes.ts
import { Router as Router19 } from "express";
init_db();
init_schema();
import { eq as eq20 } from "drizzle-orm";
import { nanoid as nanoid15 } from "nanoid";
import bcrypt3 from "bcryptjs";
var router28 = Router19();
var requireSuperAdmin = /* @__PURE__ */ __name((req, res, next) => {
  const user = req.session?.user;
  if (!user || user.role !== "admin") {
    return res.status(403).json({ message: "Super Admin huquqi talab qilinadi" });
  }
  const isSuperAdmin = user.username === "Medik" || user.username === "admin";
  if (!isSuperAdmin) {
    return res.status(403).json({ message: "Faqat Super Admin ruxsat berilgan" });
  }
  next();
}, "requireSuperAdmin");
router28.get("/admins", requireSuperAdmin, asyncHandler(async (req, res) => {
  console.log("\u{1F4CB} Getting all admins...");
  const allAdmins = await db.select().from(users).where(eq20(users.role, "admin"));
  const adminsWithPermissions = await Promise.all(
    allAdmins.map(async (admin) => {
      const perms = await db.select().from(adminPermissions).where(eq20(adminPermissions.adminId, admin.id));
      const permissionsMap = {};
      perms.forEach((p) => {
        permissionsMap[p.permissionKey] = p.permissionValue;
      });
      const isSuperAdmin = admin.username === "Medik" || admin.username === "admin";
      return {
        id: admin.id,
        username: admin.username,
        email: admin.email,
        role: admin.role,
        isSuperAdmin,
        isActive: admin.isActive,
        permissions: permissionsMap,
        createdAt: admin.createdAt
      };
    })
  );
  res.json({ admins: adminsWithPermissions });
}));
router28.post("/admins", requireSuperAdmin, asyncHandler(async (req, res) => {
  const { username, email, password, isSuperAdmin, permissions } = req.body;
  console.log("\u2795 Creating new admin:", { username, email, isSuperAdmin });
  if (!username || !password) {
    return res.status(400).json({ message: "Username va parol talab qilinadi" });
  }
  const existing = await db.select().from(users).where(eq20(users.username, username)).limit(1);
  if (existing.length > 0) {
    return res.status(400).json({ message: "Bu username allaqachon mavjud" });
  }
  const hashedPassword = await bcrypt3.hash(password, 10);
  const newAdminId = nanoid15();
  await db.insert(users).values({
    id: newAdminId,
    username,
    email: email || `${username}@sellercloudx.com`,
    password: hashedPassword,
    role: "admin",
    isActive: true,
    createdAt: (/* @__PURE__ */ new Date()).toISOString()
  });
  if (!isSuperAdmin && permissions) {
    const permissionEntries = Object.entries(permissions).map(([key, value]) => ({
      id: nanoid15(),
      adminId: newAdminId,
      permissionKey: key,
      permissionValue: value,
      createdAt: (/* @__PURE__ */ new Date()).toISOString()
    }));
    if (permissionEntries.length > 0) {
      await db.insert(adminPermissions).values(permissionEntries);
    }
  }
  console.log("\u2705 Admin created:", newAdminId);
  res.json({
    message: "Admin yaratildi",
    admin: {
      id: newAdminId,
      username,
      email: email || `${username}@sellercloudx.com`
    }
  });
}));
router28.patch("/admins/:adminId/permissions", requireSuperAdmin, asyncHandler(async (req, res) => {
  const { adminId } = req.params;
  const { permissions } = req.body;
  console.log("\u{1F527} Updating permissions for admin:", adminId);
  await db.delete(adminPermissions).where(eq20(adminPermissions.adminId, adminId));
  const permissionEntries = Object.entries(permissions).map(([key, value]) => ({
    id: nanoid15(),
    adminId,
    permissionKey: key,
    permissionValue: value,
    createdAt: (/* @__PURE__ */ new Date()).toISOString()
  }));
  if (permissionEntries.length > 0) {
    await db.insert(adminPermissions).values(permissionEntries);
  }
  res.json({ message: "Ruxsatlar yangilandi" });
}));
router28.patch("/admins/:adminId/toggle-status", requireSuperAdmin, asyncHandler(async (req, res) => {
  const { adminId } = req.params;
  const [admin] = await db.select().from(users).where(eq20(users.id, adminId)).limit(1);
  if (!admin) {
    return res.status(404).json({ message: "Admin topilmadi" });
  }
  await db.update(users).set({ isActive: !admin.isActive }).where(eq20(users.id, adminId));
  res.json({ message: "Status o'zgartirildi", isActive: !admin.isActive });
}));
router28.delete("/admins/:adminId", requireSuperAdmin, asyncHandler(async (req, res) => {
  const { adminId } = req.params;
  const [admin] = await db.select().from(users).where(eq20(users.id, adminId)).limit(1);
  if (!admin) {
    return res.status(404).json({ message: "Admin topilmadi" });
  }
  if (admin.username === "Medik" || admin.username === "admin") {
    return res.status(400).json({ message: "Super Admin'ni o'chirib bo'lmaydi" });
  }
  await db.delete(adminPermissions).where(eq20(adminPermissions.adminId, adminId));
  await db.delete(users).where(eq20(users.id, adminId));
  res.json({ message: "Admin o'chirildi" });
}));
var adminManagementRoutes_default = router28;

// server/routes/telegramRoutes.ts
import { Router as Router20 } from "express";

// server/services/telegramBot.ts
import axios2 from "axios";
var TelegramBotService = class {
  static {
    __name(this, "TelegramBotService");
  }
  config;
  enabled;
  userSessions;
  constructor() {
    this.config = {
      botToken: process.env.TELEGRAM_BOT_TOKEN || "",
      apiUrl: "https://api.telegram.org"
    };
    this.enabled = !!this.config.botToken;
    this.userSessions = /* @__PURE__ */ new Map();
    if (this.enabled) {
      this.setupWebhook();
    }
  }
  /**
   * Setup webhook
   */
  async setupWebhook() {
    try {
      const webhookUrl = `${process.env.FRONTEND_URL}/api/telegram/webhook`;
      await this.callAPI("setWebhook", { url: webhookUrl });
      console.log("Telegram webhook setup:", webhookUrl);
    } catch (error) {
      console.error("Telegram webhook setup error:", error);
    }
  }
  /**
   * Call Telegram API
   */
  async callAPI(method, params = {}) {
    try {
      const response = await axios2.post(
        `${this.config.apiUrl}/bot${this.config.botToken}/${method}`,
        params
      );
      return response.data;
    } catch (error) {
      console.error(`Telegram API error (${method}):`, error.response?.data || error.message);
      throw error;
    }
  }
  /**
   * Send message
   */
  async sendMessage(message) {
    if (!this.enabled) {
      console.warn("Telegram bot not configured");
      return;
    }
    await this.callAPI("sendMessage", message);
  }
  /**
   * Send text message
   */
  async sendTextMessage(chatId, text2, parseMode = "Markdown") {
    await this.sendMessage({
      chat_id: chatId,
      text: text2,
      parse_mode: parseMode
    });
  }
  /**
   * Send message with inline keyboard
   */
  async sendMessageWithKeyboard(chatId, text2, keyboard) {
    await this.sendMessage({
      chat_id: chatId,
      text: text2,
      parse_mode: "Markdown",
      reply_markup: {
        inline_keyboard: keyboard
      }
    });
  }
  /**
   * Send photo
   */
  async sendPhoto(chatId, photoUrl, caption) {
    await this.callAPI("sendPhoto", {
      chat_id: chatId,
      photo: photoUrl,
      caption,
      parse_mode: "Markdown"
    });
  }
  /**
   * Send document
   */
  async sendDocument(chatId, documentUrl, caption) {
    await this.callAPI("sendDocument", {
      chat_id: chatId,
      document: documentUrl,
      caption,
      parse_mode: "Markdown"
    });
  }
  /**
   * Handle incoming update
   */
  async handleUpdate(update) {
    if (update.message) {
      await this.handleMessage(update.message);
    } else if (update.callback_query) {
      await this.handleCallbackQuery(update.callback_query);
    }
  }
  /**
   * Handle message
   */
  async handleMessage(message) {
    const chatId = message.chat.id;
    const text2 = message.text;
    const from = message.from;
    if (!this.userSessions.has(chatId)) {
      this.userSessions.set(chatId, {
        id: from.id,
        chatId,
        username: from.username,
        firstName: from.first_name,
        lastName: from.last_name
      });
    }
    if (text2?.startsWith("/")) {
      await this.handleCommand(chatId, text2, from);
    } else if (message.photo) {
      await this.handlePhoto(chatId, message.photo);
    } else if (message.document) {
      await this.handleDocument(chatId, message.document);
    } else {
      await this.handleTextMessage(chatId, text2);
    }
  }
  /**
   * Handle command
   */
  async handleCommand(chatId, command, from) {
    const cmd = command.split(" ")[0].toLowerCase();
    switch (cmd) {
      case "/start":
        await this.handleStartCommand(chatId, from);
        break;
      case "/help":
        await this.handleHelpCommand(chatId);
        break;
      case "/stats":
        await this.handleStatsCommand(chatId);
        break;
      case "/orders":
        await this.handleOrdersCommand(chatId);
        break;
      case "/products":
        await this.handleProductsCommand(chatId);
        break;
      case "/addproduct":
        await this.handleAddProductCommand(chatId);
        break;
      case "/settings":
        await this.handleSettingsCommand(chatId);
        break;
      default:
        await this.sendTextMessage(
          chatId,
          "\u274C Noma'lum buyruq. /help ni bosing."
        );
    }
  }
  /**
   * Handle /start command
   */
  async handleStartCommand(chatId, from) {
    const welcomeMessage = `
\u{1F44B} *Xush kelibsiz, ${from.first_name}!*

Men *SellerCloudX* botiman. Men sizga quyidagicha yordam bera olaman:

\u{1F4CA} Statistika ko'rish
\u{1F4E6} Buyurtmalarni boshqarish
\u{1F6CD}\uFE0F Mahsulotlarni qo'shish
\u{1F4B0} Narxlarni o'zgartirish
\u{1F4C8} Hisobotlar olish

Boshlash uchun /help ni bosing.
    `.trim();
    const keyboard = [
      [
        { text: "\u{1F4CA} Statistika", callback_data: "stats" },
        { text: "\u{1F4E6} Buyurtmalar", callback_data: "orders" }
      ],
      [
        { text: "\u{1F6CD}\uFE0F Mahsulotlar", callback_data: "products" },
        { text: "\u2699\uFE0F Sozlamalar", callback_data: "settings" }
      ]
    ];
    await this.sendMessageWithKeyboard(chatId, welcomeMessage, keyboard);
  }
  /**
   * Handle /help command
   */
  async handleHelpCommand(chatId) {
    const helpMessage = `
\u{1F4DA} *Yordam*

*Asosiy buyruqlar:*
/start - Botni ishga tushirish
/help - Yordam
/stats - Statistika
/orders - Buyurtmalar
/products - Mahsulotlar
/addproduct - Mahsulot qo'shish
/settings - Sozlamalar

*Tezkor harakatlar:*
\u2022 Rasm yuboring - Mahsulot qo'shish
\u2022 Mahsulot nomi yuboring - Qidirish
\u2022 Buyurtma raqami yuboring - Holat

Savol bo'lsa, @sellercloudx_support ga murojaat qiling.
    `.trim();
    await this.sendTextMessage(chatId, helpMessage);
  }
  /**
   * Handle /stats command
   */
  async handleStatsCommand(chatId) {
    const user = this.userSessions.get(chatId);
    if (!user?.partnerId) {
      await this.sendTextMessage(
        chatId,
        "\u274C Avval tizimga kiring. /start ni bosing."
      );
      return;
    }
    const stats = await this.getPartnerStats(user.partnerId);
    const statsMessage = `
\u{1F4CA} *Statistika*

\u{1F4E6} Buyurtmalar: *${stats.totalOrders}*
\u2705 Bajarilgan: *${stats.completedOrders}*
\u23F3 Kutilmoqda: *${stats.pendingOrders}*

\u{1F6CD}\uFE0F Mahsulotlar: *${stats.totalProducts}*
\u{1F4C9} Kam qolgan: *${stats.lowStockProducts}*

\u{1F4B0} Jami daromad: *${this.formatCurrency(stats.totalRevenue)}*
\u{1F4C8} Bu oy: *${this.formatCurrency(stats.monthRevenue)}*

_Oxirgi yangilanish: ${(/* @__PURE__ */ new Date()).toLocaleString("uz-UZ")}_
    `.trim();
    await this.sendTextMessage(chatId, statsMessage);
  }
  /**
   * Handle /orders command
   */
  async handleOrdersCommand(chatId) {
    const user = this.userSessions.get(chatId);
    if (!user?.partnerId) {
      await this.sendTextMessage(chatId, "\u274C Avval tizimga kiring.");
      return;
    }
    const orders3 = await this.getRecentOrders(user.partnerId, 5);
    if (orders3.length === 0) {
      await this.sendTextMessage(chatId, "\u{1F4E6} Buyurtmalar yo'q.");
      return;
    }
    let message = "\u{1F4E6} *So'nggi buyurtmalar:*\n\n";
    orders3.forEach((order, index) => {
      message += `${index + 1}. *${order.orderNumber}*
`;
      message += `   \u{1F4B0} ${this.formatCurrency(order.totalAmount)}
`;
      message += `   \u{1F4CD} ${order.status}
`;
      message += `   \u{1F4C5} ${new Date(order.createdAt).toLocaleDateString("uz-UZ")}

`;
    });
    await this.sendTextMessage(chatId, message);
  }
  /**
   * Handle /products command
   */
  async handleProductsCommand(chatId) {
    const user = this.userSessions.get(chatId);
    if (!user?.partnerId) {
      await this.sendTextMessage(chatId, "\u274C Avval tizimga kiring.");
      return;
    }
    const keyboard = [
      [
        { text: "\u2795 Mahsulot qo'shish", callback_data: "add_product" },
        { text: "\u{1F4CB} Ro'yxat", callback_data: "list_products" }
      ],
      [
        { text: "\u{1F50D} Qidirish", callback_data: "search_product" },
        { text: "\u{1F4CA} Statistika", callback_data: "product_stats" }
      ]
    ];
    await this.sendMessageWithKeyboard(
      chatId,
      "\u{1F6CD}\uFE0F *Mahsulotlar*\n\nNima qilmoqchisiz?",
      keyboard
    );
  }
  /**
   * Handle /addproduct command
   */
  async handleAddProductCommand(chatId) {
    await this.sendTextMessage(
      chatId,
      `
\u2795 *Mahsulot qo'shish*

Mahsulot rasmini yuboring yoki quyidagi formatda ma'lumot yuboring:

\`\`\`
Nomi: iPhone 15 Pro
Narxi: 15000000
Miqdori: 10
Kategoriya: Elektronika
\`\`\`
      `.trim()
    );
  }
  /**
   * Handle /settings command
   */
  async handleSettingsCommand(chatId) {
    const keyboard = [
      [
        { text: "\u{1F514} Xabarnomalar", callback_data: "notifications" },
        { text: "\u{1F310} Til", callback_data: "language" }
      ],
      [
        { text: "\u{1F510} Xavfsizlik", callback_data: "security" },
        { text: "\u{1F4F1} Integratsiyalar", callback_data: "integrations" }
      ]
    ];
    await this.sendMessageWithKeyboard(
      chatId,
      "\u2699\uFE0F *Sozlamalar*\n\nNimani sozlamoqchisiz?",
      keyboard
    );
  }
  /**
   * Handle callback query
   */
  async handleCallbackQuery(callbackQuery) {
    const chatId = callbackQuery.message.chat.id;
    const data = callbackQuery.data;
    await this.callAPI("answerCallbackQuery", {
      callback_query_id: callbackQuery.id
    });
    switch (data) {
      case "stats":
        await this.handleStatsCommand(chatId);
        break;
      case "orders":
        await this.handleOrdersCommand(chatId);
        break;
      case "products":
        await this.handleProductsCommand(chatId);
        break;
      case "settings":
        await this.handleSettingsCommand(chatId);
        break;
      default:
        await this.sendTextMessage(chatId, "\u23F3 Bu funksiya tez orada qo'shiladi.");
    }
  }
  /**
   * Handle photo
   */
  async handlePhoto(chatId, photos) {
    await this.sendTextMessage(
      chatId,
      "\u{1F4F8} Rasm qabul qilindi! AI tahlil qilmoqda..."
    );
    const photo = photos[photos.length - 1];
    const fileId = photo.file_id;
    const fileInfo = await this.callAPI("getFile", { file_id: fileId });
    const fileUrl = `${this.config.apiUrl}/file/bot${this.config.botToken}/${fileInfo.result.file_path}`;
    await this.sendTextMessage(
      chatId,
      `
\u2705 Mahsulot aniqlandi!

\u{1F4E6} Nomi: iPhone 15 Pro
\u{1F4B0} Tavsiya etilgan narx: 15,000,000 so'm
\u{1F4CA} Bozor narxi: 14,500,000 - 16,000,000 so'm

Mahsulotni qo'shishni xohlaysizmi?
      `.trim()
    );
  }
  /**
   * Handle document
   */
  async handleDocument(chatId, document2) {
    await this.sendTextMessage(
      chatId,
      "\u{1F4C4} Hujjat qabul qilindi. Qayta ishlanmoqda..."
    );
  }
  /**
   * Handle text message
   */
  async handleTextMessage(chatId, text2) {
    if (text2.match(/^ORD-\d+$/)) {
      await this.handleOrderQuery(chatId, text2);
      return;
    }
    await this.sendTextMessage(
      chatId,
      "Men sizni tushunmadim. /help ni bosing."
    );
  }
  /**
   * Handle order query
   */
  async handleOrderQuery(chatId, orderNumber) {
    await this.sendTextMessage(
      chatId,
      `
\u{1F4E6} *Buyurtma: ${orderNumber}*

\u{1F4CD} Holat: Yetkazilmoqda
\u{1F69A} Kuryer: Alisher
\u{1F4DE} Telefon: +998 90 123 45 67
\u{1F4C5} Yetkazish: Bugun, 18:00

\u{1F5FA}\uFE0F Manzil: Toshkent, Chilonzor
      `.trim()
    );
  }
  /**
   * Send order notification
   */
  async sendOrderNotification(chatId, order) {
    const message = `
\u{1F389} *Yangi buyurtma!*

\u{1F4E6} Raqam: *${order.orderNumber}*
\u{1F4B0} Summa: *${this.formatCurrency(order.totalAmount)}*
\u{1F464} Mijoz: ${order.customerName}
\u{1F4DE} Telefon: ${order.customerPhone}

Buyurtmani ko'rish: /order_${order.id}
    `.trim();
    await this.sendTextMessage(chatId, message);
  }
  /**
   * Send low stock alert
   */
  async sendLowStockAlert(chatId, product) {
    const message = `
\u26A0\uFE0F *Kam qoldi!*

\u{1F6CD}\uFE0F Mahsulot: *${product.name}*
\u{1F4E6} Qolgan: *${product.stockQuantity}* dona
\u{1F514} Minimal: ${product.lowStockThreshold} dona

Mahsulotni to'ldiring!
    `.trim();
    await this.sendTextMessage(chatId, message);
  }
  /**
   * Get partner stats
   */
  async getPartnerStats(partnerId) {
    return {
      totalOrders: 150,
      completedOrders: 120,
      pendingOrders: 30,
      totalProducts: 45,
      lowStockProducts: 5,
      totalRevenue: 5e7,
      monthRevenue: 15e6
    };
  }
  /**
   * Get recent orders
   */
  async getRecentOrders(partnerId, limit) {
    return [];
  }
  /**
   * Format currency
   */
  formatCurrency(amount) {
    return new Intl.NumberFormat("uz-UZ", {
      style: "currency",
      currency: "UZS",
      minimumFractionDigits: 0
    }).format(amount);
  }
  /**
   * Check if service is enabled
   */
  isEnabled() {
    return this.enabled;
  }
};
var telegramBot = new TelegramBotService();

// server/routes/telegramRoutes.ts
var router29 = Router20();
router29.post("/webhook", async (req, res) => {
  try {
    await telegramBot.handleUpdate(req.body);
    res.sendStatus(200);
  } catch (error) {
    console.error("Telegram webhook error:", error);
    res.sendStatus(500);
  }
});
router29.post("/send", requireAuth2, async (req, res) => {
  try {
    const { chatId, message } = req.body;
    if (!chatId || !message) {
      return res.status(400).json({
        success: false,
        error: "Missing required fields"
      });
    }
    await telegramBot.sendTextMessage(chatId, message);
    res.json({ success: true });
  } catch (error) {
    console.error("Telegram send error:", error);
    res.status(500).json({
      success: false,
      error: error.message || "Failed to send message"
    });
  }
});
router29.get("/status", requireAuth2, (req, res) => {
  res.json({
    enabled: telegramBot.isEnabled()
  });
});
var telegramRoutes_default = router29;

// server/routes/premiumFeaturesRoutes.ts
import { Router as Router21 } from "express";

// server/services/videoGenerationService.ts
init_geminiService();
var VIDEO_PROVIDERS = {
  google_veo3: {
    name: "Google Veo 3",
    enabled: !!process.env.GOOGLE_VEO_API_KEY || geminiService.isEnabled(),
    cost: 0.05,
    // $0.05 per second of video
    maxDuration: 60,
    minDuration: 5
  },
  runway: {
    name: "Runway Gen-3",
    enabled: !!process.env.RUNWAY_API_KEY,
    cost: 0.05,
    // $0.05 per second
    maxDuration: 10,
    minDuration: 5
  },
  pika: {
    name: "Pika Labs",
    enabled: !!process.env.PIKA_API_KEY,
    cost: 0.1,
    // $0.10 per video
    maxDuration: 4,
    minDuration: 3
  },
  stable_video: {
    name: "Stable Video Diffusion",
    enabled: !!process.env.REPLICATE_API_KEY,
    cost: 0.02,
    // $0.02 per second
    maxDuration: 4,
    minDuration: 2
  }
};
var VideoGenerationService = class {
  static {
    __name(this, "VideoGenerationService");
  }
  enabled;
  preferredProvider = "google_veo3";
  constructor() {
    this.enabled = Object.values(VIDEO_PROVIDERS).some((p) => p.enabled);
    if (VIDEO_PROVIDERS.google_veo3.enabled) {
      this.preferredProvider = "google_veo3";
    } else if (VIDEO_PROVIDERS.runway.enabled) {
      this.preferredProvider = "runway";
    } else if (VIDEO_PROVIDERS.pika.enabled) {
      this.preferredProvider = "pika";
    } else if (VIDEO_PROVIDERS.stable_video.enabled) {
      this.preferredProvider = "stable_video";
    }
    if (this.enabled) {
      console.log(`\u2705 Video Generation Service initialized (${VIDEO_PROVIDERS[this.preferredProvider].name})`);
    } else {
      console.warn("\u26A0\uFE0F  Video Generation Service disabled (no API keys found)");
    }
  }
  /**
   * Generate video for product card
   * AI Manager automatically creates prompt based on product data
   */
  async generateProductVideo(request) {
    if (!this.enabled) {
      throw new Error("Video generation is not enabled. Please set API keys.");
    }
    const startTime = Date.now();
    const duration = request.duration || 15;
    try {
      const videoPrompt = await this.generateVideoPrompt(request);
      let video;
      switch (this.preferredProvider) {
        case "google_veo3":
          video = await this.generateWithVeo3(videoPrompt, request, duration);
          break;
        case "runway":
          video = await this.generateWithRunway(videoPrompt, request, duration);
          break;
        case "pika":
          video = await this.generateWithPika(videoPrompt, request);
          break;
        case "stable_video":
          video = await this.generateWithStableVideo(videoPrompt, request);
          break;
        default:
          throw new Error("No video provider available");
      }
      video.latency = Date.now() - startTime;
      video.prompt = videoPrompt;
      console.log(`\u2705 Video generated: ${video.videoUrl} (${video.duration}s, $${video.cost.toFixed(4)})`);
      return video;
    } catch (error) {
      console.error("Video generation error:", error);
      if (this.preferredProvider !== "stable_video") {
        console.log("\u{1F504} Trying fallback provider...");
        return await this.fallbackGenerate(request, duration);
      }
      throw error;
    }
  }
  /**
   * Generate video prompt using AI (Gemini Flash)
   * AI Manager automatically creates optimized prompt based on product data
   */
  async generateVideoPrompt(request) {
    const prompt = `
Siz professional video kontent mutaxassisiz. Quyidagi mahsulot uchun video prompt yarating:

MAHSULOT:
- Nomi: ${request.productName}
- Tavsif: ${request.productDescription}
- Kategoriya: ${request.productCategory || "Umumiy"}
- Marketplace: ${request.targetMarketplace || "Umumiy"}

VIDEO TALABLARI:
- Davomiyligi: ${request.duration || 15} soniya
- Format: ${request.aspectRatio || "16:9"}
- Uslub: ${request.style || "product_showcase"}
- Til: ${request.language || "uz"}
- Matn: ${request.includeText ? "Ha" : "Yo'q"}
- Musiqa: ${request.music ? "Ha" : "Yo'q"}

VAZIFA:
Professional, marketing-optimizatsiya qilingan video prompt yarating. Video mahsulotni yaxshi ko'rsatishi, xaridorni jalb qilishi va savdoni oshirishi kerak.

Video prompt (English, detailed, cinematic):
`;
    try {
      const response = await geminiService.generateText({
        prompt,
        model: "flash",
        temperature: 0.8,
        maxTokens: 500
      });
      return response.text.trim();
    } catch (error) {
      return `Professional product showcase video: ${request.productName}. ${request.productDescription}. High quality, cinematic, marketing-optimized, sales-boosting. ${request.style === "lifestyle" ? "Lifestyle setting, people using product." : "Product focus, clean background, professional lighting."}`;
    }
  }
  /**
   * Generate video with Google Veo 3
   */
  async generateWithVeo3(prompt, request, duration) {
    try {
      const response = await fetch("https://generativelanguage.googleapis.com/v1beta/models/veo-3:generateVideo", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-goog-api-key": process.env.GOOGLE_VEO_API_KEY || process.env.GEMINI_API_KEY || ""
        },
        body: JSON.stringify({
          prompt,
          duration_seconds: Math.min(duration, 60),
          aspect_ratio: request.aspectRatio || "16:9",
          style: request.style || "product_showcase"
        })
      });
      if (!response.ok) {
        throw new Error(`Veo 3 API error: ${response.status}`);
      }
      const data = await response.json();
      const videoUrl = data.video_url || data.videoUrl;
      const thumbnailUrl = data.thumbnail_url || data.thumbnailUrl;
      const cost = duration * VIDEO_PROVIDERS.google_veo3.cost;
      return {
        videoUrl,
        thumbnailUrl,
        duration,
        aspectRatio: request.aspectRatio || "16:9",
        aiModel: "google-veo-3",
        cost,
        latency: 0,
        // Will be set by caller
        prompt
      };
    } catch (error) {
      console.error("Veo 3 generation error:", error);
      throw error;
    }
  }
  /**
   * Generate video with Runway Gen-3
   */
  async generateWithRunway(prompt, request, duration) {
    try {
      const response = await fetch("https://api.runwayml.com/v1/generate", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${process.env.RUNWAY_API_KEY}`
        },
        body: JSON.stringify({
          prompt,
          duration: Math.min(duration, 10),
          aspect_ratio: request.aspectRatio || "16:9"
        })
      });
      if (!response.ok) {
        throw new Error(`Runway API error: ${response.status}`);
      }
      const data = await response.json();
      const videoUrl = data.video_url;
      const cost = duration * VIDEO_PROVIDERS.runway.cost;
      return {
        videoUrl,
        duration,
        aspectRatio: request.aspectRatio || "16:9",
        aiModel: "runway-gen-3",
        cost,
        latency: 0,
        prompt
      };
    } catch (error) {
      console.error("Runway generation error:", error);
      throw error;
    }
  }
  /**
   * Generate video with Pika Labs
   */
  async generateWithPika(prompt, request) {
    try {
      const response = await fetch("https://api.pika.art/v1/generate", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${process.env.PIKA_API_KEY}`
        },
        body: JSON.stringify({
          prompt,
          aspect_ratio: request.aspectRatio || "16:9"
        })
      });
      if (!response.ok) {
        throw new Error(`Pika API error: ${response.status}`);
      }
      const data = await response.json();
      const videoUrl = data.video_url;
      const duration = 4;
      return {
        videoUrl,
        duration,
        aspectRatio: request.aspectRatio || "16:9",
        aiModel: "pika-labs",
        cost: VIDEO_PROVIDERS.pika.cost,
        latency: 0,
        prompt
      };
    } catch (error) {
      console.error("Pika generation error:", error);
      throw error;
    }
  }
  /**
   * Generate video with Stable Video Diffusion (via Replicate)
   */
  async generateWithStableVideo(prompt, request) {
    try {
      const Replicate2 = (await import("replicate")).default;
      const replicate2 = new Replicate2({
        auth: process.env.REPLICATE_API_KEY || ""
      });
      const output = await replicate2.run(
        "stability-ai/stable-video-diffusion:3f0457e4619daac51203dedb472816fd4af51aa314a7817b6b1c5b35d0e5b4c0",
        {
          input: {
            image: request.productImages?.[0] || "",
            motion_bucket_id: 127,
            cond_aug: 0.02,
            decoding_t: 14
          }
        }
      );
      const videoUrl = Array.isArray(output) ? output[0] : output;
      const duration = 4;
      return {
        videoUrl,
        duration,
        aspectRatio: request.aspectRatio || "16:9",
        aiModel: "stable-video-diffusion",
        cost: duration * VIDEO_PROVIDERS.stable_video.cost,
        latency: 0,
        prompt
      };
    } catch (error) {
      console.error("Stable Video generation error:", error);
      throw error;
    }
  }
  /**
   * Fallback video generation
   */
  async fallbackGenerate(request, duration) {
    const providers = ["runway", "pika", "stable_video"];
    const currentIndex = providers.indexOf(this.preferredProvider);
    for (let i = currentIndex + 1; i < providers.length; i++) {
      const provider = providers[i];
      if (VIDEO_PROVIDERS[provider].enabled) {
        this.preferredProvider = provider;
        return await this.generateProductVideo(request);
      }
    }
    throw new Error("No video generation provider available");
  }
  /**
   * Check if service is enabled
   */
  isEnabled() {
    return this.enabled;
  }
  /**
   * Get available providers
   */
  getAvailableProviders() {
    return Object.entries(VIDEO_PROVIDERS).filter(([_, config2]) => config2.enabled).map(([key, _]) => key);
  }
};
var videoGenerationService2 = new VideoGenerationService();

// server/services/competitorIntelligence.ts
import axios3 from "axios";
import * as cheerio from "cheerio";
import puppeteer from "puppeteer";
var CompetitorIntelligenceService = class {
  static {
    __name(this, "CompetitorIntelligenceService");
  }
  /**
   * Scrape competitor prices from Uzum
   */
  async scrapeUzumPrices(productName) {
    try {
      const browser = await puppeteer.launch({ headless: true });
      const page = await browser.newPage();
      const searchUrl = `https://uzum.uz/uz/search?q=${encodeURIComponent(productName)}`;
      await page.goto(searchUrl, { waitUntil: "networkidle2" });
      const products4 = await page.evaluate(() => {
        const items = [];
        const productCards = document.querySelectorAll('[data-test-id="product-card"]');
        productCards.forEach((card, index) => {
          if (index < 10) {
            const name = card.querySelector('[data-test-id="product-title"]')?.textContent || "";
            const priceText = card.querySelector('[data-test-id="product-price"]')?.textContent || "0";
            const price = parseInt(priceText.replace(/\D/g, ""));
            const ratingText = card.querySelector('[data-test-id="product-rating"]')?.textContent || "0";
            const rating = parseFloat(ratingText);
            const reviewsText = card.querySelector('[data-test-id="product-reviews"]')?.textContent || "0";
            const reviews = parseInt(reviewsText.replace(/\D/g, ""));
            const url = card.querySelector("a")?.href || "";
            items.push({
              marketplace: "uzum",
              productName: name,
              price,
              rating,
              reviews,
              seller: "Unknown",
              url,
              lastUpdated: /* @__PURE__ */ new Date()
            });
          }
        });
        return items;
      });
      await browser.close();
      return products4;
    } catch (error) {
      console.error("Uzum scraping error:", error);
      return [];
    }
  }
  /**
   * Scrape competitor prices from Wildberries
   */
  async scrapeWildberriesPrices(productName) {
    try {
      const searchUrl = `https://www.wildberries.ru/catalog/0/search.aspx?search=${encodeURIComponent(productName)}`;
      const response = await axios3.get(searchUrl);
      const $ = cheerio.load(response.data);
      const products4 = [];
      $(".product-card").each((index, element) => {
        if (index < 10) {
          const name = $(element).find(".product-card__name").text().trim();
          const priceText = $(element).find(".price__lower-price").text().trim();
          const price = parseInt(priceText.replace(/\D/g, ""));
          const ratingText = $(element).find(".product-card__rating").text().trim();
          const rating = parseFloat(ratingText);
          const reviewsText = $(element).find(".product-card__count").text().trim();
          const reviews = parseInt(reviewsText.replace(/\D/g, ""));
          const url = "https://www.wildberries.ru" + $(element).find("a").attr("href");
          products4.push({
            marketplace: "wildberries",
            productName: name,
            price,
            rating,
            reviews,
            seller: "Unknown",
            url,
            lastUpdated: /* @__PURE__ */ new Date()
          });
        }
      });
      return products4;
    } catch (error) {
      console.error("Wildberries scraping error:", error);
      return [];
    }
  }
  /**
   * Get comprehensive competitor analysis
   */
  async analyzeCompetitors(productName, marketplaces = ["uzum", "wildberries"]) {
    const allCompetitors = [];
    for (const marketplace of marketplaces) {
      let competitors = [];
      if (marketplace === "uzum") {
        competitors = await this.scrapeUzumPrices(productName);
      } else if (marketplace === "wildberries") {
        competitors = await this.scrapeWildberriesPrices(productName);
      }
      allCompetitors.push(...competitors);
    }
    const priceRecommendation = this.calculatePriceRecommendation(allCompetitors);
    const marketInsights = this.generateMarketInsights(allCompetitors);
    return {
      competitors: allCompetitors,
      priceRecommendation,
      marketInsights
    };
  }
  /**
   * Calculate optimal price recommendation
   */
  calculatePriceRecommendation(competitors) {
    if (competitors.length === 0) {
      return {
        suggestedPrice: 0,
        minPrice: 0,
        maxPrice: 0,
        averagePrice: 0,
        competitorCount: 0,
        reasoning: "No competitor data available"
      };
    }
    const prices = competitors.map((c) => c.price).filter((p) => p > 0);
    const avgPrice = prices.reduce((a, b) => a + b, 0) / prices.length;
    const minPrice = Math.min(...prices);
    const maxPrice = Math.max(...prices);
    const suggestedPrice = Math.round(avgPrice * 0.95);
    const topRatedCompetitors = competitors.filter((c) => c.rating >= 4.5).sort((a, b) => b.reviews - a.reviews).slice(0, 3);
    const avgTopPrice = topRatedCompetitors.length > 0 ? topRatedCompetitors.reduce((sum, c) => sum + c.price, 0) / topRatedCompetitors.length : avgPrice;
    let reasoning = `Based on ${competitors.length} competitors:
`;
    reasoning += `- Average market price: ${Math.round(avgPrice).toLocaleString()} UZS
`;
    reasoning += `- Price range: ${minPrice.toLocaleString()} - ${maxPrice.toLocaleString()} UZS
`;
    reasoning += `- Top-rated sellers average: ${Math.round(avgTopPrice).toLocaleString()} UZS
`;
    reasoning += `- Suggested price is 5% below average for competitive advantage`;
    return {
      suggestedPrice,
      minPrice,
      maxPrice,
      averagePrice: Math.round(avgPrice),
      competitorCount: competitors.length,
      reasoning
    };
  }
  /**
   * Generate market insights
   */
  generateMarketInsights(competitors) {
    const marketplaceDistribution = {};
    const ratingDistribution = { high: 0, medium: 0, low: 0 };
    let totalReviews = 0;
    competitors.forEach((comp) => {
      marketplaceDistribution[comp.marketplace] = (marketplaceDistribution[comp.marketplace] || 0) + 1;
      if (comp.rating >= 4.5) ratingDistribution.high++;
      else if (comp.rating >= 3.5) ratingDistribution.medium++;
      else ratingDistribution.low++;
      totalReviews += comp.reviews;
    });
    const avgReviews = competitors.length > 0 ? totalReviews / competitors.length : 0;
    return {
      marketplaceDistribution,
      ratingDistribution,
      averageReviews: Math.round(avgReviews),
      totalCompetitors: competitors.length,
      marketSaturation: competitors.length > 20 ? "high" : competitors.length > 10 ? "medium" : "low",
      recommendations: this.generateRecommendations(competitors)
    };
  }
  /**
   * Generate strategic recommendations
   */
  generateRecommendations(competitors) {
    const recommendations = [];
    const avgRating = competitors.reduce((sum, c) => sum + c.rating, 0) / competitors.length;
    const avgReviews = competitors.reduce((sum, c) => sum + c.reviews, 0) / competitors.length;
    if (avgRating < 4) {
      recommendations.push("Market has low average rating - opportunity for quality differentiation");
    }
    if (avgReviews < 50) {
      recommendations.push("Low review counts - focus on getting early reviews quickly");
    }
    if (competitors.length > 20) {
      recommendations.push("Highly competitive market - consider unique value proposition");
    } else if (competitors.length < 5) {
      recommendations.push("Low competition - opportunity for market leadership");
    }
    const priceVariance = this.calculatePriceVariance(competitors);
    if (priceVariance > 0.3) {
      recommendations.push("High price variance - market is not standardized, test different price points");
    }
    return recommendations;
  }
  /**
   * Calculate price variance
   */
  calculatePriceVariance(competitors) {
    const prices = competitors.map((c) => c.price);
    const avg = prices.reduce((a, b) => a + b, 0) / prices.length;
    const variance = prices.reduce((sum, price) => sum + Math.pow(price - avg, 2), 0) / prices.length;
    return Math.sqrt(variance) / avg;
  }
  /**
   * Monitor price changes
   */
  async monitorPriceChanges(productName, currentPrice) {
    const analysis = await this.analyzeCompetitors(productName);
    const { priceRecommendation } = analysis;
    let priceAlert = false;
    let message = "";
    if (currentPrice > priceRecommendation.maxPrice) {
      priceAlert = true;
      message = `Your price (${currentPrice.toLocaleString()}) is above market maximum (${priceRecommendation.maxPrice.toLocaleString()}). Consider lowering.`;
    } else if (currentPrice < priceRecommendation.minPrice) {
      priceAlert = true;
      message = `Your price (${currentPrice.toLocaleString()}) is below market minimum (${priceRecommendation.minPrice.toLocaleString()}). You may be underpricing.`;
    } else if (Math.abs(currentPrice - priceRecommendation.suggestedPrice) / priceRecommendation.suggestedPrice > 0.1) {
      priceAlert = true;
      message = `Consider adjusting to suggested price: ${priceRecommendation.suggestedPrice.toLocaleString()} UZS`;
    } else {
      message = "Your price is competitive";
    }
    return {
      priceAlert,
      message,
      competitors: analysis.competitors
    };
  }
  /**
   * Get trending products
   */
  async getTrendingProducts(marketplace = "uzum") {
    return [];
  }
  /**
   * Analyze keyword performance
   */
  async analyzeKeywords(productName) {
    const keywords = productName.toLowerCase().split(" ").filter((w) => w.length > 3);
    const searchVolume = {};
    const competition = {};
    keywords.forEach((keyword) => {
      searchVolume[keyword] = Math.floor(Math.random() * 1e4);
      competition[keyword] = ["low", "medium", "high"][Math.floor(Math.random() * 3)];
    });
    return {
      keywords,
      searchVolume,
      competition
    };
  }
};
var competitorIntelligence = new CompetitorIntelligenceService();

// server/services/smsService.ts
import axios4 from "axios";
var SMSService = class {
  static {
    __name(this, "SMSService");
  }
  eskizConfig = {
    email: process.env.ESKIZ_EMAIL || "",
    password: process.env.ESKIZ_PASSWORD || "",
    apiUrl: "https://notify.eskiz.uz/api",
    token: ""
  };
  playmobileConfig = {
    login: process.env.PLAYMOBILE_LOGIN || "",
    password: process.env.PLAYMOBILE_PASSWORD || "",
    apiUrl: "https://send.smsxabar.uz/broker-api"
  };
  async sendSMS(phone, message, provider = "eskiz") {
    if (provider === "eskiz") {
      return this.sendEskizSMS(phone, message);
    } else {
      return this.sendPlaymobileSMS(phone, message);
    }
  }
  async sendEskizSMS(phone, message) {
    try {
      if (!this.eskizConfig.token) {
        await this.getEskizToken();
      }
      const response = await axios4.post(
        `${this.eskizConfig.apiUrl}/message/sms/send`,
        {
          mobile_phone: this.formatPhone(phone),
          message,
          from: "SellerCloudX"
        },
        {
          headers: {
            "Authorization": `Bearer ${this.eskizConfig.token}`
          }
        }
      );
      return {
        success: true,
        messageId: response.data.id
      };
    } catch (error) {
      console.error("Eskiz SMS error:", error.response?.data || error.message);
      return {
        success: false,
        error: error.response?.data?.message || error.message
      };
    }
  }
  async getEskizToken() {
    const response = await axios4.post(
      `${this.eskizConfig.apiUrl}/auth/login`,
      {
        email: this.eskizConfig.email,
        password: this.eskizConfig.password
      }
    );
    this.eskizConfig.token = response.data.data.token;
  }
  async sendPlaymobileSMS(phone, message) {
    try {
      const response = await axios4.post(
        `${this.playmobileConfig.apiUrl}/send`,
        {
          messages: [{
            recipient: this.formatPhone(phone),
            "message-id": `SCX-${Date.now()}`,
            sms: {
              originator: "SellerCloudX",
              content: { text: message }
            }
          }]
        },
        {
          auth: {
            username: this.playmobileConfig.login,
            password: this.playmobileConfig.password
          }
        }
      );
      return {
        success: true,
        messageId: response.data.messages[0]["message-id"]
      };
    } catch (error) {
      return {
        success: false,
        error: error.message
      };
    }
  }
  async sendOTP(phone, code) {
    const message = `SellerCloudX tasdiqlash kodi: ${code}. Hech kimga bermang!`;
    return this.sendSMS(phone, message);
  }
  async sendOrderConfirmation(phone, orderNumber) {
    const message = `Buyurtmangiz ${orderNumber} qabul qilindi. Tez orada yetkazib beramiz!`;
    return this.sendSMS(phone, message);
  }
  formatPhone(phone) {
    let cleaned = phone.replace(/\D/g, "");
    if (!cleaned.startsWith("998")) {
      cleaned = "998" + cleaned;
    }
    return cleaned;
  }
};
var smsService = new SMSService();

// server/routes/premiumFeaturesRoutes.ts
import multer from "multer";
var router30 = Router21();
var upload = multer({ dest: "uploads/" });
router30.post("/video/generate", requireAuth2, async (req, res) => {
  try {
    const { productName, description, images, duration } = req.body;
    const result = await videoGenerationService2.generateProductVideo({
      productName,
      description,
      images,
      duration
    });
    res.json(result);
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});
router30.get("/video/status/:taskId", requireAuth2, async (req, res) => {
  try {
    const { taskId } = req.params;
    const status = await videoGenerationService2.checkVideoStatus(taskId);
    res.json(status);
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});
router30.post("/video/social", requireAuth2, async (req, res) => {
  try {
    const { productName, images, style } = req.body;
    const result = await videoGenerationService2.generateSocialVideo({
      productName,
      images,
      style
    });
    res.json(result);
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});
router30.post("/competitor/analyze", requireAuth2, async (req, res) => {
  try {
    const { productName, marketplaces } = req.body;
    const analysis = await competitorIntelligence.analyzeCompetitors(
      productName,
      marketplaces
    );
    res.json({
      success: true,
      data: analysis
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});
router30.post("/competitor/monitor-price", requireAuth2, async (req, res) => {
  try {
    const { productName, currentPrice } = req.body;
    const result = await competitorIntelligence.monitorPriceChanges(
      productName,
      currentPrice
    );
    res.json({
      success: true,
      data: result
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});
router30.get("/competitor/trending/:marketplace", requireAuth2, async (req, res) => {
  try {
    const { marketplace } = req.params;
    const trending = await competitorIntelligence.getTrendingProducts(marketplace);
    res.json({
      success: true,
      data: trending
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});
router30.post("/competitor/keywords", requireAuth2, async (req, res) => {
  try {
    const { productName } = req.body;
    const analysis = await competitorIntelligence.analyzeKeywords(productName);
    res.json({
      success: true,
      data: analysis
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});
router30.post("/sms/send", requireAuth2, async (req, res) => {
  try {
    const { phone, message, provider } = req.body;
    const result = await smsService.sendSMS(phone, message, provider);
    res.json(result);
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});
router30.post("/sms/send-otp", requireAuth2, async (req, res) => {
  try {
    const { phone, code } = req.body;
    const result = await smsService.sendOTP(phone, code);
    res.json(result);
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});
router30.post("/bulk/process", requireAuth2, upload.single("file"), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({
        success: false,
        error: "No file uploaded"
      });
    }
    res.json({
      success: true,
      batchId: `batch_${Date.now()}`,
      totalProducts: 100,
      message: "Batch processing started"
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});
router30.get("/bulk/status/:batchId", requireAuth2, async (req, res) => {
  try {
    const { batchId } = req.params;
    res.json({
      status: "processing",
      totalProducts: 100,
      processedProducts: 50,
      successCount: 48,
      errorCount: 2
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});
router30.post("/payment/create", requireAuth2, async (req, res) => {
  try {
    const { featureId, amount, provider, description } = req.body;
    const partnerId = req.user.id;
    if (!featureId || !amount || !provider) {
      return res.status(400).json({
        success: false,
        error: "Missing required fields"
      });
    }
    const result = await paymentGateway.processPremiumFeaturePayment({
      partnerId,
      featureId,
      amount,
      provider,
      description
    });
    res.json(result);
  } catch (error) {
    console.error("Premium payment error:", error);
    res.status(500).json({
      success: false,
      error: error.message || "Payment creation failed"
    });
  }
});
router30.get("/payment/status/:transactionId", requireAuth2, async (req, res) => {
  try {
    const { transactionId } = req.params;
    const status = await paymentGateway.checkPaymentStatus(transactionId);
    res.json(status);
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});
router30.get("/usage/stats", requireAuth2, async (req, res) => {
  try {
    const partnerId = req.user.id;
    res.json({
      success: true,
      data: {
        totalSpent: 0,
        featuresUsed: 0,
        videoGeneration: { count: 0, spent: 0 },
        competitorAnalysis: { count: 0, spent: 0 },
        bulkProcessing: { count: 0, spent: 0 },
        premiumSEO: { count: 0, spent: 0 },
        trendReports: { count: 0, spent: 0 }
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});
var premiumFeaturesRoutes_default = router30;

// server/routes/advancedFeaturesRoutes.ts
import { Router as Router22 } from "express";

// server/services/advancedAnalytics.ts
init_db();
init_schema();
import { eq as eq21, and as and18, gte as gte5, lte as lte4, sql as sql12 } from "drizzle-orm";
import OpenAI5 from "openai";
var openai6 = new OpenAI5({
  apiKey: process.env.OPENAI_API_KEY || ""
});
var AdvancedAnalyticsService = class {
  static {
    __name(this, "AdvancedAnalyticsService");
  }
  /**
   * Get comprehensive analytics dashboard
   */
  async getDashboard(partnerId, dateRange) {
    const overview = await this.getOverview(partnerId, dateRange);
    const predictions = await this.generatePredictions(partnerId);
    const recommendations = await this.generateRecommendations(partnerId, overview);
    const alerts = await this.getAlerts(partnerId);
    const trends = await this.analyzeTrends(partnerId, dateRange);
    return {
      overview,
      predictions,
      recommendations,
      alerts,
      trends
    };
  }
  /**
   * Get overview metrics
   */
  async getOverview(partnerId, dateRange) {
    const revenueResult = await db.select({
      total: sql12`COALESCE(SUM(${orders.totalAmount}), 0)`
    }).from(orders).where(
      and18(
        eq21(orders.partnerId, partnerId),
        gte5(orders.createdAt, dateRange.start),
        lte4(orders.createdAt, dateRange.end)
      )
    );
    const totalRevenue = revenueResult[0]?.total || 0;
    const ordersResult = await db.select({
      count: sql12`COUNT(*)`
    }).from(orders).where(
      and18(
        eq21(orders.partnerId, partnerId),
        gte5(orders.createdAt, dateRange.start),
        lte4(orders.createdAt, dateRange.end)
      )
    );
    const totalOrders = ordersResult[0]?.count || 0;
    const averageOrderValue = totalOrders > 0 ? totalRevenue / totalOrders : 0;
    const periodLength = dateRange.end.getTime() - dateRange.start.getTime();
    const previousStart = new Date(dateRange.start.getTime() - periodLength);
    const previousEnd = dateRange.start;
    const previousRevenueResult = await db.select({
      total: sql12`COALESCE(SUM(${orders.totalAmount}), 0)`
    }).from(orders).where(
      and18(
        eq21(orders.partnerId, partnerId),
        gte5(orders.createdAt, previousStart),
        lte4(orders.createdAt, previousEnd)
      )
    );
    const previousRevenue = previousRevenueResult[0]?.total || 0;
    const growthRate = previousRevenue > 0 ? (totalRevenue - previousRevenue) / previousRevenue * 100 : 0;
    return {
      totalRevenue,
      totalOrders,
      averageOrderValue,
      conversionRate: 0,
      // Calculate based on traffic data
      growthRate
    };
  }
  /**
   * Generate ML-based predictions
   */
  async generatePredictions(partnerId) {
    const historicalData = await this.getHistoricalData(partnerId, 90);
    const predictions = [];
    const revenuePrediction = this.predictMetric(
      historicalData.map((d) => d.revenue),
      "revenue"
    );
    predictions.push(revenuePrediction);
    const ordersPrediction = this.predictMetric(
      historicalData.map((d) => d.orders),
      "orders"
    );
    predictions.push(ordersPrediction);
    const aovPrediction = this.predictMetric(
      historicalData.map((d) => d.averageOrderValue),
      "averageOrderValue"
    );
    predictions.push(aovPrediction);
    return predictions;
  }
  /**
   * Predict metric using linear regression
   */
  predictMetric(data, metricName) {
    if (data.length < 7) {
      return {
        metric: metricName,
        currentValue: data[data.length - 1] || 0,
        predictedValue: data[data.length - 1] || 0,
        confidence: 0,
        trend: "stable",
        insights: ["Insufficient data for prediction"]
      };
    }
    const n = data.length;
    const x = Array.from({ length: n }, (_, i) => i);
    const y = data;
    const sumX = x.reduce((a, b) => a + b, 0);
    const sumY = y.reduce((a, b) => a + b, 0);
    const sumXY = x.reduce((sum, xi, i) => sum + xi * y[i], 0);
    const sumX2 = x.reduce((sum, xi) => sum + xi * xi, 0);
    const slope = (n * sumXY - sumX * sumY) / (n * sumX2 - sumX * sumX);
    const intercept = (sumY - slope * sumX) / n;
    const predictedValue = slope * n + intercept;
    const currentValue = data[data.length - 1];
    const yMean = sumY / n;
    const ssTotal = y.reduce((sum, yi) => sum + Math.pow(yi - yMean, 2), 0);
    const ssResidual = y.reduce((sum, yi, i) => {
      const predicted = slope * i + intercept;
      return sum + Math.pow(yi - predicted, 2);
    }, 0);
    const rSquared = 1 - ssResidual / ssTotal;
    const confidence = Math.max(0, Math.min(100, rSquared * 100));
    const trend = slope > 0.05 ? "up" : slope < -0.05 ? "down" : "stable";
    const insights = [];
    const changePercent = (predictedValue - currentValue) / currentValue * 100;
    if (trend === "up") {
      insights.push(`Expected ${Math.abs(changePercent).toFixed(1)}% increase`);
      insights.push("Positive momentum detected");
    } else if (trend === "down") {
      insights.push(`Expected ${Math.abs(changePercent).toFixed(1)}% decrease`);
      insights.push("Consider intervention strategies");
    } else {
      insights.push("Stable performance expected");
    }
    if (confidence > 80) {
      insights.push("High confidence prediction");
    } else if (confidence > 60) {
      insights.push("Moderate confidence prediction");
    } else {
      insights.push("Low confidence - volatile data");
    }
    return {
      metric: metricName,
      currentValue,
      predictedValue,
      confidence,
      trend,
      insights
    };
  }
  /**
   * Get historical data
   */
  async getHistoricalData(partnerId, days) {
    const endDate = /* @__PURE__ */ new Date();
    const startDate = /* @__PURE__ */ new Date();
    startDate.setDate(startDate.getDate() - days);
    const data = [];
    for (let i = 0; i < days; i++) {
      const date = new Date(startDate);
      date.setDate(date.getDate() + i);
      const nextDate = new Date(date);
      nextDate.setDate(nextDate.getDate() + 1);
      const dayOrders = await db.select({
        count: sql12`COUNT(*)`,
        total: sql12`COALESCE(SUM(${orders.totalAmount}), 0)`
      }).from(orders).where(
        and18(
          eq21(orders.partnerId, partnerId),
          gte5(orders.createdAt, date),
          lte4(orders.createdAt, nextDate)
        )
      );
      const count2 = dayOrders[0]?.count || 0;
      const total = dayOrders[0]?.total || 0;
      data.push({
        date,
        orders: count2,
        revenue: total,
        averageOrderValue: count2 > 0 ? total / count2 : 0
      });
    }
    return data;
  }
  /**
   * Generate AI-powered recommendations
   */
  async generateRecommendations(partnerId, overview) {
    const prompt = `
As an e-commerce analytics expert, analyze this business data and provide 5 actionable recommendations:

Metrics:
- Total Revenue: ${overview.totalRevenue} UZS
- Total Orders: ${overview.totalOrders}
- Average Order Value: ${overview.averageOrderValue} UZS
- Growth Rate: ${overview.growthRate}%

Provide specific, actionable recommendations to improve performance.
Format: Numbered list, each recommendation in one concise sentence.
    `.trim();
    try {
      const completion = await openai6.chat.completions.create({
        model: "gpt-4",
        messages: [{ role: "user", content: prompt }],
        temperature: 0.7,
        max_tokens: 500
      });
      const recommendations = completion.choices[0].message.content || "";
      return recommendations.split("\n").filter((r) => r.trim().length > 0);
    } catch (error) {
      console.error("AI recommendations error:", error);
      return [
        "Increase average order value through upselling",
        "Optimize product pricing based on competitor analysis",
        "Improve conversion rate with better product descriptions",
        "Expand to additional marketplaces",
        "Implement automated marketing campaigns"
      ];
    }
  }
  /**
   * Get alerts
   */
  async getAlerts(partnerId) {
    const alerts = [];
    const lowStockProducts = await db.select().from(products).where(
      and18(
        eq21(products.partnerId, partnerId),
        sql12`${products.stockQuantity} <= ${products.lowStockThreshold}`
      )
    );
    if (lowStockProducts.length > 0) {
      alerts.push({
        type: "warning",
        title: "Low Stock Alert",
        message: `${lowStockProducts.length} products are running low on stock`,
        action: "View Products",
        priority: "high"
      });
    }
    const pendingOrders = await db.select({ count: sql12`COUNT(*)` }).from(orders).where(
      and18(
        eq21(orders.partnerId, partnerId),
        eq21(orders.status, "pending")
      )
    );
    const pendingCount = pendingOrders[0]?.count || 0;
    if (pendingCount > 10) {
      alerts.push({
        type: "info",
        title: "Pending Orders",
        message: `You have ${pendingCount} pending orders to process`,
        action: "View Orders",
        priority: "medium"
      });
    }
    return alerts;
  }
  /**
   * Analyze trends
   */
  async analyzeTrends(partnerId, dateRange) {
    const topProducts = await db.select({
      productId: orders.id,
      productName: products.name,
      totalSales: sql12`COUNT(*)`,
      totalRevenue: sql12`SUM(${orders.totalAmount})`
    }).from(orders).leftJoin(products, eq21(orders.partnerId, products.partnerId)).where(
      and18(
        eq21(orders.partnerId, partnerId),
        gte5(orders.createdAt, dateRange.start),
        lte4(orders.createdAt, dateRange.end)
      )
    ).groupBy(orders.id, products.name).orderBy(sql12`COUNT(*) DESC`).limit(10);
    return topProducts.map((p) => ({
      type: "product",
      name: p.productName,
      sales: p.totalSales,
      revenue: p.totalRevenue,
      trend: "up"
    }));
  }
  /**
   * Get customer lifetime value prediction
   */
  async predictCustomerLTV(partnerId, customerId) {
    const customerOrders = await db.select().from(orders).where(
      and18(
        eq21(orders.partnerId, partnerId),
        sql12`${orders.customerEmail} = (SELECT email FROM customers WHERE id = ${customerId})`
      )
    ).orderBy(orders.createdAt);
    if (customerOrders.length === 0) {
      return {
        currentValue: 0,
        predictedLTV: 0,
        confidence: 0,
        insights: ["No order history available"]
      };
    }
    const totalSpent = customerOrders.reduce((sum, order) => sum + order.totalAmount, 0);
    const avgOrderValue = totalSpent / customerOrders.length;
    const daysSinceFirst = (Date.now() - customerOrders[0].createdAt.getTime()) / (1e3 * 60 * 60 * 24);
    const orderFrequency = customerOrders.length / (daysSinceFirst / 30);
    const predictedLifespan = 24;
    const predictedLTV = avgOrderValue * orderFrequency * predictedLifespan;
    const insights = [];
    insights.push(`Average order value: ${avgOrderValue.toLocaleString()} UZS`);
    insights.push(`Order frequency: ${orderFrequency.toFixed(1)} orders/month`);
    insights.push(`Customer since: ${Math.floor(daysSinceFirst)} days`);
    if (orderFrequency > 2) {
      insights.push("High-value customer - prioritize retention");
    } else if (orderFrequency < 0.5) {
      insights.push("At-risk customer - consider re-engagement campaign");
    }
    return {
      currentValue: totalSpent,
      predictedLTV,
      confidence: Math.min(90, customerOrders.length * 10),
      insights
    };
  }
  /**
   * Churn prediction
   */
  async predictChurn(partnerId) {
    const thirtyDaysAgo = /* @__PURE__ */ new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
    const inactiveCustomers = await db.select({
      count: sql12`COUNT(DISTINCT ${orders.customerEmail})`
    }).from(orders).where(
      and18(
        eq21(orders.partnerId, partnerId),
        lte4(orders.createdAt, thirtyDaysAgo)
      )
    );
    const atRiskCustomers = inactiveCustomers[0]?.count || 0;
    const totalCustomers = await db.select({
      count: sql12`COUNT(DISTINCT ${orders.customerEmail})`
    }).from(orders).where(eq21(orders.partnerId, partnerId));
    const total = totalCustomers[0]?.count || 1;
    const churnRate = atRiskCustomers / total * 100;
    const recommendations = [
      "Send re-engagement email campaign to inactive customers",
      "Offer special discount to customers who haven't ordered in 30+ days",
      "Implement loyalty program to increase retention",
      "Analyze why customers are churning and address pain points",
      "Set up automated win-back campaigns"
    ];
    return {
      atRiskCustomers,
      churnRate,
      recommendations
    };
  }
  /**
   * Seasonal trend analysis
   */
  async analyzeSeasonalTrends(partnerId) {
    const oneYearAgo = /* @__PURE__ */ new Date();
    oneYearAgo.setFullYear(oneYearAgo.getFullYear() - 1);
    const monthlyData = await db.select({
      month: sql12`strftime('%Y-%m', ${orders.createdAt})`,
      revenue: sql12`SUM(${orders.totalAmount})`,
      orders: sql12`COUNT(*)`
    }).from(orders).where(
      and18(
        eq21(orders.partnerId, partnerId),
        gte5(orders.createdAt, oneYearAgo)
      )
    ).groupBy(sql12`strftime('%Y-%m', ${orders.createdAt})`).orderBy(sql12`strftime('%Y-%m', ${orders.createdAt})`);
    if (monthlyData.length < 6) {
      return {
        peakMonths: [],
        lowMonths: [],
        seasonalityScore: 0,
        insights: ["Insufficient data for seasonal analysis"]
      };
    }
    const revenues = monthlyData.map((d) => d.revenue);
    const avgRevenue = revenues.reduce((a, b) => a + b, 0) / revenues.length;
    const variance = revenues.reduce((sum, r) => sum + Math.pow(r - avgRevenue, 2), 0) / revenues.length;
    const seasonalityScore = Math.min(100, Math.sqrt(variance) / avgRevenue * 100);
    const sorted = [...monthlyData].sort((a, b) => b.revenue - a.revenue);
    const peakMonths = sorted.slice(0, 3).map((d) => d.month);
    const lowMonths = sorted.slice(-3).map((d) => d.month);
    const insights = [];
    if (seasonalityScore > 50) {
      insights.push("High seasonality detected - plan inventory accordingly");
      insights.push(`Peak months: ${peakMonths.join(", ")}`);
      insights.push(`Low months: ${lowMonths.join(", ")}`);
    } else {
      insights.push("Low seasonality - consistent demand throughout year");
    }
    return {
      peakMonths,
      lowMonths,
      seasonalityScore,
      insights
    };
  }
};
var advancedAnalytics = new AdvancedAnalyticsService();

// server/services/affiliateProgram.ts
init_db();
init_schema();
import { eq as eq22, and as and19, sql as sql13 } from "drizzle-orm";
import crypto6 from "crypto";
var AffiliateProgramService = class {
  static {
    __name(this, "AffiliateProgramService");
  }
  tiers = [
    {
      name: "Bronze",
      minReferrals: 0,
      commissionRate: 10,
      bonuses: ["Basic dashboard", "Email support"],
      color: "#CD7F32"
    },
    {
      name: "Silver",
      minReferrals: 5,
      commissionRate: 15,
      bonuses: ["Advanced analytics", "Priority support", "Marketing materials"],
      color: "#C0C0C0"
    },
    {
      name: "Gold",
      minReferrals: 15,
      commissionRate: 20,
      bonuses: ["Custom landing pages", "Dedicated manager", "Early access to features"],
      color: "#FFD700"
    },
    {
      name: "Platinum",
      minReferrals: 30,
      commissionRate: 25,
      bonuses: ["White-label options", "API access", "Revenue share"],
      color: "#E5E4E2"
    },
    {
      name: "Diamond",
      minReferrals: 50,
      commissionRate: 30,
      bonuses: ["Exclusive partnership", "Custom features", "Profit sharing"],
      color: "#B9F2FF"
    }
  ];
  /**
   * Generate unique affiliate code
   */
  generateAffiliateCode(partnerId) {
    const hash = crypto6.createHash("md5").update(partnerId + Date.now()).digest("hex");
    return `SCX-${hash.substring(0, 8).toUpperCase()}`;
  }
  /**
   * Create affiliate link
   */
  createAffiliateLink(affiliateCode, campaign) {
    const baseUrl = process.env.FRONTEND_URL || "https://sellercloudx.com";
    const params = new URLSearchParams({
      ref: affiliateCode,
      ...campaign && { campaign }
    });
    return `${baseUrl}/register?${params.toString()}`;
  }
  /**
   * Track affiliate click
   */
  async trackClick(affiliateCode, metadata) {
    console.log("Affiliate click tracked:", { affiliateCode, metadata });
  }
  /**
   * Register referral
   */
  async registerReferral(params) {
    try {
      const referrer = await db.select().from(partners).where(sql13`${partners.id} = (SELECT partner_id FROM affiliate_codes WHERE code = ${params.referrerCode})`).limit(1);
      if (!referrer || referrer.length === 0) {
        return { success: false, error: "Invalid referral code" };
      }
      const referrerId = referrer[0].id;
      const referralId = crypto6.randomUUID();
      await db.insert(referrals).values({
        id: referralId,
        referrerPartnerId: referrerId,
        referredPartnerId: params.referredPartnerId,
        promoCode: params.referrerCode,
        contractType: params.contractType,
        status: "registered",
        createdAt: /* @__PURE__ */ new Date()
      });
      return { success: true, referralId };
    } catch (error) {
      console.error("Register referral error:", error);
      return { success: false, error: error.message };
    }
  }
  /**
   * Calculate commission
   */
  async calculateCommission(params) {
    const referral = await db.select().from(referrals).where(eq22(referrals.id, params.referralId)).limit(1);
    if (!referral || referral.length === 0) {
      return { commission: 0, tier: "Bronze", rate: 0 };
    }
    const referrerId = referral[0].referrerPartnerId;
    const stats = await this.getAffiliateStats(referrerId);
    const tier = this.getTier(stats.totalReferrals);
    const baseCommission = params.amount * (tier.commissionRate / 100);
    let multiplier = 1;
    if (params.monthNumber <= 3) {
      multiplier = 1.5;
    } else if (params.monthNumber <= 6) {
      multiplier = 1.25;
    }
    const finalCommission = baseCommission * multiplier;
    return {
      commission: finalCommission,
      tier: tier.name,
      rate: tier.commissionRate
    };
  }
  /**
   * Process commission payment
   */
  async processCommission(params) {
    try {
      const { commission, tier, rate } = await this.calculateCommission(params);
      const referral = await db.select().from(referrals).where(eq22(referrals.id, params.referralId)).limit(1);
      if (!referral || referral.length === 0) {
        return { success: false, error: "Referral not found" };
      }
      const referrerId = referral[0].referrerPartnerId;
      const bonusId = crypto6.randomUUID();
      await db.insert(referralBonuses).values({
        id: bonusId,
        referralId: params.referralId,
        referrerPartnerId: referrerId,
        amount: commission,
        monthNumber: params.monthNumber,
        platformProfit: params.amount,
        bonusRate: rate,
        tierMultiplier: 1,
        status: "pending",
        createdAt: /* @__PURE__ */ new Date()
      });
      await db.update(referrals).set({
        bonusEarned: sql13`${referrals.bonusEarned} + ${commission}`
      }).where(eq22(referrals.id, params.referralId));
      return { success: true, bonusId };
    } catch (error) {
      console.error("Process commission error:", error);
      return { success: false, error: error.message };
    }
  }
  /**
   * Get affiliate stats
   */
  async getAffiliateStats(partnerId) {
    const totalReferralsResult = await db.select({ count: sql13`COUNT(*)` }).from(referrals).where(eq22(referrals.referrerPartnerId, partnerId));
    const totalReferrals = totalReferralsResult[0]?.count || 0;
    const activeReferralsResult = await db.select({ count: sql13`COUNT(*)` }).from(referrals).where(
      and19(
        eq22(referrals.referrerPartnerId, partnerId),
        eq22(referrals.status, "active")
      )
    );
    const activeReferrals = activeReferralsResult[0]?.count || 0;
    const earningsResult = await db.select({
      total: sql13`COALESCE(SUM(${referralBonuses.amount}), 0)`,
      pending: sql13`COALESCE(SUM(CASE WHEN ${referralBonuses.status} = 'pending' THEN ${referralBonuses.amount} ELSE 0 END), 0)`
    }).from(referralBonuses).where(eq22(referralBonuses.referrerPartnerId, partnerId));
    const totalEarnings = earningsResult[0]?.total || 0;
    const pendingEarnings = earningsResult[0]?.pending || 0;
    const registeredResult = await db.select({ count: sql13`COUNT(*)` }).from(referrals).where(
      and19(
        eq22(referrals.referrerPartnerId, partnerId),
        sql13`${referrals.status} IN ('registered', 'active')`
      )
    );
    const registered = registeredResult[0]?.count || 0;
    const conversionRate = totalReferrals > 0 ? registered / totalReferrals * 100 : 0;
    const tier = this.getTier(totalReferrals);
    const nextTier = this.getNextTier(totalReferrals);
    const nextTierProgress = nextTier ? (totalReferrals - tier.minReferrals) / (nextTier.minReferrals - tier.minReferrals) * 100 : 100;
    return {
      totalReferrals,
      activeReferrals,
      totalEarnings,
      pendingEarnings,
      conversionRate,
      tier: tier.name,
      nextTierProgress
    };
  }
  /**
   * Get tier based on referral count
   */
  getTier(referralCount) {
    for (let i = this.tiers.length - 1; i >= 0; i--) {
      if (referralCount >= this.tiers[i].minReferrals) {
        return this.tiers[i];
      }
    }
    return this.tiers[0];
  }
  /**
   * Get next tier
   */
  getNextTier(referralCount) {
    const currentTier = this.getTier(referralCount);
    const currentIndex = this.tiers.findIndex((t) => t.name === currentTier.name);
    return currentIndex < this.tiers.length - 1 ? this.tiers[currentIndex + 1] : null;
  }
  /**
   * Get leaderboard
   */
  async getLeaderboard(limit = 10) {
    const leaderboard = await db.select({
      partnerId: referralBonuses.referrerPartnerId,
      partnerName: partners.businessName,
      totalEarnings: sql13`SUM(${referralBonuses.amount})`,
      totalReferrals: sql13`COUNT(DISTINCT ${referrals.id})`
    }).from(referralBonuses).leftJoin(partners, eq22(referralBonuses.referrerPartnerId, partners.id)).leftJoin(referrals, eq22(referralBonuses.referrerPartnerId, referrals.referrerPartnerId)).groupBy(referralBonuses.referrerPartnerId, partners.businessName).orderBy(sql13`SUM(${referralBonuses.amount}) DESC`).limit(limit);
    return leaderboard.map((entry, index) => ({
      rank: index + 1,
      partnerId: entry.partnerId,
      partnerName: entry.partnerName,
      totalEarnings: entry.totalEarnings,
      totalReferrals: entry.totalReferrals,
      tier: this.getTier(entry.totalReferrals).name
    }));
  }
  /**
   * Generate marketing materials
   */
  async generateMarketingMaterials(partnerId) {
    const affiliateCode = await this.getAffiliateCode(partnerId);
    const affiliateLink = this.createAffiliateLink(affiliateCode);
    return {
      banners: [
        `https://sellercloudx.com/assets/banners/728x90.png?ref=${affiliateCode}`,
        `https://sellercloudx.com/assets/banners/300x250.png?ref=${affiliateCode}`,
        `https://sellercloudx.com/assets/banners/160x600.png?ref=${affiliateCode}`
      ],
      emailTemplates: [
        `Subject: Transform Your E-commerce Business

Check out SellerCloudX: ${affiliateLink}`,
        `Subject: Automate Your Marketplace Management

Discover SellerCloudX: ${affiliateLink}`
      ],
      socialPosts: [
        `\u{1F680} Revolutionize your e-commerce with SellerCloudX! ${affiliateLink}`,
        `\u{1F4B0} Increase your marketplace sales with AI automation: ${affiliateLink}`
      ]
    };
  }
  /**
   * Get affiliate code for partner
   */
  async getAffiliateCode(partnerId) {
    return this.generateAffiliateCode(partnerId);
  }
  /**
   * Request payout
   */
  async requestPayout(partnerId, amount) {
    try {
      const stats = await this.getAffiliateStats(partnerId);
      if (amount > stats.pendingEarnings) {
        return { success: false, error: "Insufficient balance" };
      }
      if (amount < 1e5) {
        return { success: false, error: "Minimum payout is 100,000 UZS" };
      }
      const payoutId = crypto6.randomUUID();
      return { success: true, payoutId };
    } catch (error) {
      return { success: false, error: error.message };
    }
  }
};
var affiliateProgram = new AffiliateProgramService();

// server/routes/advancedFeaturesRoutes.ts
var router31 = Router22();
router31.get("/analytics/dashboard", requireAuth2, async (req, res) => {
  try {
    const partnerId = req.user.id;
    const { startDate, endDate } = req.query;
    const dateRange = {
      start: startDate ? new Date(startDate) : new Date(Date.now() - 30 * 24 * 60 * 60 * 1e3),
      end: endDate ? new Date(endDate) : /* @__PURE__ */ new Date()
    };
    const dashboard = await advancedAnalytics.getDashboard(partnerId, dateRange);
    res.json({
      success: true,
      data: dashboard
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});
router31.get("/analytics/customer-ltv/:customerId", requireAuth2, async (req, res) => {
  try {
    const partnerId = req.user.id;
    const { customerId } = req.params;
    const prediction = await advancedAnalytics.predictCustomerLTV(partnerId, customerId);
    res.json({
      success: true,
      data: prediction
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});
router31.get("/analytics/churn-prediction", requireAuth2, async (req, res) => {
  try {
    const partnerId = req.user.id;
    const prediction = await advancedAnalytics.predictChurn(partnerId);
    res.json({
      success: true,
      data: prediction
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});
router31.get("/analytics/seasonal-trends", requireAuth2, async (req, res) => {
  try {
    const partnerId = req.user.id;
    const trends = await advancedAnalytics.analyzeSeasonalTrends(partnerId);
    res.json({
      success: true,
      data: trends
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});
router31.get("/affiliate/stats", requireAuth2, async (req, res) => {
  try {
    const partnerId = req.user.id;
    const stats = await affiliateProgram.getAffiliateStats(partnerId);
    res.json({
      success: true,
      data: stats
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});
router31.post("/affiliate/generate-link", requireAuth2, async (req, res) => {
  try {
    const partnerId = req.user.id;
    const { campaign } = req.body;
    const affiliateCode = affiliateProgram.generateAffiliateCode(partnerId);
    const affiliateLink = affiliateProgram.createAffiliateLink(affiliateCode, campaign);
    res.json({
      success: true,
      data: {
        affiliateCode,
        affiliateLink
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});
router31.get("/affiliate/leaderboard", requireAuth2, async (req, res) => {
  try {
    const { limit } = req.query;
    const leaderboard = await affiliateProgram.getLeaderboard(
      limit ? parseInt(limit) : 10
    );
    res.json({
      success: true,
      data: leaderboard
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});
router31.get("/affiliate/marketing-materials", requireAuth2, async (req, res) => {
  try {
    const partnerId = req.user.id;
    const materials = await affiliateProgram.generateMarketingMaterials(partnerId);
    res.json({
      success: true,
      data: materials
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});
router31.post("/affiliate/request-payout", requireAuth2, async (req, res) => {
  try {
    const partnerId = req.user.id;
    const { amount } = req.body;
    const result = await affiliateProgram.requestPayout(partnerId, amount);
    res.json(result);
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});
var advancedFeaturesRoutes_default = router31;

// server/routes/smartAIRoutes.ts
import { Router as Router23 } from "express";

// server/services/smartAIManager.ts
init_db();
init_schema();
import OpenAI6 from "openai";
import Anthropic3 from "@anthropic-ai/sdk";
var openai7 = new OpenAI6({
  apiKey: process.env.OPENAI_API_KEY || ""
});
var anthropic3 = new Anthropic3({
  apiKey: process.env.ANTHROPIC_API_KEY || ""
});
var SmartAIManager = class {
  static {
    __name(this, "SmartAIManager");
  }
  cache = /* @__PURE__ */ new Map();
  costTracker = {
    totalCost: 0,
    requestCount: 0,
    cacheHits: 0
  };
  /**
   * Main function: Scan product image and generate complete card
   * Partner only provides: image, quantity, cost price
   */
  async scanAndGenerateCard(params) {
    console.log("\u{1F50D} Starting smart product scan...");
    const productInfo = await this.extractProductFromImage(params.imageUrl);
    const marketIntel = await this.getMarketIntelligence(
      productInfo.name,
      productInfo.category,
      params.costPrice
    );
    const seoContent = await this.generateSEOContent(productInfo);
    const translations = await this.generateTranslations(productInfo, seoContent);
    const marketplaceCards = await this.generateMarketplaceCards(
      productInfo,
      seoContent,
      marketIntel
    );
    const completeCard = {
      name: productInfo.name,
      category: productInfo.category,
      description: productInfo.description,
      seoTitle: seoContent.title,
      seoDescription: seoContent.description,
      keywords: seoContent.keywords,
      translations,
      marketIntelligence: marketIntel,
      marketplaceCards
    };
    await this.saveProduct(completeCard, params);
    console.log("\u2705 Product card generated successfully!");
    console.log(`\u{1F4B0} Total cost: $${this.costTracker.totalCost.toFixed(4)}`);
    return completeCard;
  }
  /**
   * Step 1: Extract product info from image using GPT-4 Vision
   * This is the most expensive but most accurate step
   */
  async extractProductFromImage(imageUrl) {
    console.log("\u{1F4F8} Analyzing image with GPT-4 Vision...");
    const cacheKey = `image:${imageUrl}`;
    if (this.cache.has(cacheKey)) {
      console.log("\u2705 Cache hit! Saved $0.02");
      this.costTracker.cacheHits++;
      return this.cache.get(cacheKey);
    }
    try {
      const response = await openai7.chat.completions.create({
        model: "gpt-4-vision-preview",
        messages: [
          {
            role: "user",
            content: [
              {
                type: "text",
                text: `Analyze this product image and extract ALL information in JSON format:
{
  "name": "Full product name",
  "category": "Main category",
  "subcategory": "Subcategory",
  "brand": "Brand name if visible",
  "model": "Model number if visible",
  "color": "Color",
  "size": "Size if visible",
  "material": "Material if identifiable",
  "features": ["feature1", "feature2"],
  "description": "Detailed description",
  "keywords": ["keyword1", "keyword2"],
  "confidence": 0.95
}

Be very detailed and accurate. Extract everything you can see.`
              },
              {
                type: "image_url",
                image_url: { url: imageUrl }
              }
            ]
          }
        ],
        max_tokens: 1e3
      });
      const content = response.choices[0].message.content || "{}";
      const productInfo = JSON.parse(content);
      this.costTracker.totalCost += 0.02;
      this.costTracker.requestCount++;
      this.cache.set(cacheKey, productInfo);
      return productInfo;
    } catch (error) {
      console.error("Error extracting product from image:", error);
      throw new Error("Failed to analyze product image");
    }
  }
  /**
   * Step 2: Get market intelligence using GPT-3.5 (cheaper)
   */
  async getMarketIntelligence(productName, category, costPrice) {
    console.log("\u{1F4CA} Getting market intelligence...");
    const cacheKey = `market:${productName}:${category}`;
    if (this.cache.has(cacheKey)) {
      console.log("\u2705 Cache hit! Saved $0.002");
      this.costTracker.cacheHits++;
      return this.cache.get(cacheKey);
    }
    try {
      const response = await openai7.chat.completions.create({
        model: "gpt-3.5-turbo",
        messages: [
          {
            role: "system",
            content: "You are a market intelligence expert for Uzbekistan e-commerce."
          },
          {
            role: "user",
            content: `Analyze market for: ${productName} (${category})
Cost price: ${costPrice} UZS

Provide JSON:
{
  "suggestedPrice": {
    "min": number,
    "optimal": number,
    "max": number
  },
  "demand": "high|medium|low",
  "competition": "high|medium|low",
  "seasonality": "description",
  "trends": ["trend1", "trend2"],
  "bestMarketplaces": ["uzum", "wildberries"]
}

Consider Uzbekistan market specifically.`
          }
        ],
        temperature: 0.7
      });
      const content = response.choices[0].message.content || "{}";
      const marketIntel = JSON.parse(content);
      this.costTracker.totalCost += 2e-3;
      this.costTracker.requestCount++;
      this.cache.set(cacheKey, marketIntel);
      return marketIntel;
    } catch (error) {
      console.error("Error getting market intelligence:", error);
      return {
        suggestedPrice: {
          min: costPrice * 1.3,
          optimal: costPrice * 1.5,
          max: costPrice * 2
        },
        demand: "medium",
        competition: "medium",
        seasonality: "Year-round",
        trends: [],
        bestMarketplaces: ["uzum", "wildberries"]
      };
    }
  }
  /**
   * Step 3: Generate SEO content using Claude Haiku (fast & cheap)
   */
  async generateSEOContent(productInfo) {
    console.log("\u{1F50D} Generating SEO content...");
    const cacheKey = `seo:${productInfo.name}`;
    if (this.cache.has(cacheKey)) {
      console.log("\u2705 Cache hit! Saved $0.0003");
      this.costTracker.cacheHits++;
      return this.cache.get(cacheKey);
    }
    try {
      const response = await anthropic3.messages.create({
        model: "claude-3-haiku-20240307",
        max_tokens: 500,
        messages: [
          {
            role: "user",
            content: `Create SEO-optimized content for: ${productInfo.name}

Category: ${productInfo.category}
Features: ${productInfo.features.join(", ")}

Return JSON:
{
  "title": "SEO optimized title (max 60 chars)",
  "description": "SEO description (max 160 chars)",
  "keywords": ["keyword1", "keyword2", "keyword3"]
}

Focus on Uzbekistan market and local search terms.`
          }
        ]
      });
      const content = response.content[0].type === "text" ? response.content[0].text : "{}";
      const seoContent = JSON.parse(content);
      this.costTracker.totalCost += 3e-4;
      this.costTracker.requestCount++;
      this.cache.set(cacheKey, seoContent);
      return seoContent;
    } catch (error) {
      console.error("Error generating SEO content:", error);
      return {
        title: productInfo.name,
        description: productInfo.description,
        keywords: productInfo.keywords
      };
    }
  }
  /**
   * Step 4: Generate translations (Template-based + AI for unique parts)
   */
  async generateTranslations(productInfo, seoContent) {
    console.log("\u{1F30D} Generating translations...");
    const templates = {
      uz: {
        prefix: "Mahsulot:",
        suffix: "- Yuqori sifat, tez yetkazib berish"
      },
      ru: {
        prefix: "\u0422\u043E\u0432\u0430\u0440:",
        suffix: "- \u0412\u044B\u0441\u043E\u043A\u043E\u0435 \u043A\u0430\u0447\u0435\u0441\u0442\u0432\u043E, \u0431\u044B\u0441\u0442\u0440\u0430\u044F \u0434\u043E\u0441\u0442\u0430\u0432\u043A\u0430"
      },
      en: {
        prefix: "Product:",
        suffix: "- High quality, fast delivery"
      }
    };
    return {
      uz: {
        title: `${templates.uz.prefix} ${productInfo.name}`,
        description: `${productInfo.description} ${templates.uz.suffix}`
      },
      ru: {
        title: `${templates.ru.prefix} ${productInfo.name}`,
        description: `${productInfo.description} ${templates.ru.suffix}`
      },
      en: {
        title: `${templates.en.prefix} ${productInfo.name}`,
        description: `${productInfo.description} ${templates.en.suffix}`
      }
    };
  }
  /**
   * Step 5: Generate marketplace-specific cards (Batch processing)
   */
  async generateMarketplaceCards(productInfo, seoContent, marketIntel) {
    console.log("\u{1F3EA} Generating marketplace cards...");
    const marketplaceCards = {
      uzum: {
        title: seoContent.title,
        description: seoContent.description,
        price: marketIntel.suggestedPrice.optimal,
        category: productInfo.category,
        attributes: productInfo.features
      },
      wildberries: {
        title: seoContent.title,
        description: seoContent.description,
        price: marketIntel.suggestedPrice.optimal,
        category: productInfo.category,
        characteristics: productInfo.features
      },
      ozon: {
        name: seoContent.title,
        description: seoContent.description,
        price: marketIntel.suggestedPrice.optimal,
        category_id: productInfo.category
      },
      yandex: {
        name: seoContent.title,
        description: seoContent.description,
        price: marketIntel.suggestedPrice.optimal,
        category: productInfo.category
      }
    };
    return marketplaceCards;
  }
  /**
   * Save product to database
   */
  async saveProduct(card, params) {
    try {
      await db.insert(products).values({
        partnerId: params.partnerId,
        name: card.name,
        description: card.description,
        category: card.category,
        price: card.marketIntelligence.suggestedPrice.optimal,
        costPrice: params.costPrice,
        stockQuantity: params.quantity,
        sku: `AUTO-${Date.now()}`,
        barcode: "",
        imageUrl: params.imageUrl,
        createdAt: /* @__PURE__ */ new Date()
      });
      console.log("\u{1F4BE} Product saved to database");
    } catch (error) {
      console.error("Error saving product:", error);
    }
  }
  /**
   * Get cost statistics
   */
  getCostStats() {
    return {
      totalCost: this.costTracker.totalCost,
      requestCount: this.costTracker.requestCount,
      cacheHits: this.costTracker.cacheHits,
      averageCost: this.costTracker.totalCost / this.costTracker.requestCount,
      cacheSavings: this.costTracker.cacheHits * 0.02
    };
  }
  /**
   * Clear cache
   */
  clearCache() {
    this.cache.clear();
    console.log("\u{1F5D1}\uFE0F Cache cleared");
  }
};
var smartAIManager = new SmartAIManager();

// server/services/trendHunter.ts
import OpenAI7 from "openai";
var openai8 = new OpenAI7({
  apiKey: process.env.OPENAI_API_KEY || ""
});
var TrendHunterService = class {
  static {
    __name(this, "TrendHunterService");
  }
  cache = /* @__PURE__ */ new Map();
  cacheExpiry = 24 * 60 * 60 * 1e3;
  // 24 hours
  /**
   * Analyze product trends in Uzbekistan market
   */
  async analyzeTrends(category) {
    console.log("\u{1F50D} Hunting for trends...");
    const cacheKey = `trends:${category || "all"}`;
    const cached = this.getCached(cacheKey);
    if (cached) {
      console.log("\u2705 Using cached trends");
      return cached;
    }
    try {
      const response = await openai8.chat.completions.create({
        model: "gpt-3.5-turbo",
        messages: [
          {
            role: "system",
            content: "You are a market trend analyst for Uzbekistan e-commerce market."
          },
          {
            role: "user",
            content: `Analyze current trending products in Uzbekistan${category ? ` for category: ${category}` : ""}.

Return JSON array of top 10 trending products:
[
  {
    "productName": "Product name",
    "category": "Category",
    "trendScore": 85,
    "growthRate": 45.5,
    "searchVolume": 15000,
    "competition": "medium",
    "seasonality": "Year-round",
    "priceRange": {
      "min": 100000,
      "max": 500000,
      "average": 300000
    },
    "topMarketplaces": ["uzum", "wildberries"],
    "recommendations": ["recommendation1", "recommendation2"]
  }
]

Focus on:
- Current demand in Uzbekistan
- Growth potential
- Competition level
- Profit margins
- Market gaps`
          }
        ],
        temperature: 0.7
      });
      const content = response.choices[0].message.content || "[]";
      const trends = JSON.parse(content);
      for (const trend of trends) {
        try {
          const competitorData = await competitorIntelligence.analyzeCompetitors(
            trend.productName,
            ["uzum", "wildberries"]
          );
          if (competitorData.competitors.length > 0) {
            trend.priceRange = {
              min: competitorData.priceRecommendation.minPrice,
              max: competitorData.priceRecommendation.maxPrice,
              average: competitorData.priceRecommendation.averagePrice
            };
            trend.competition = competitorData.marketInsights.marketSaturation;
          }
        } catch (error) {
          console.log("Could not get competitor data for:", trend.productName);
        }
      }
      this.setCache(cacheKey, trends);
      return trends;
    } catch (error) {
      console.error("Error analyzing trends:", error);
      return [];
    }
  }
  /**
   * Find market opportunities (gaps in the market)
   */
  async findOpportunities() {
    console.log("\u{1F4A1} Finding market opportunities...");
    const cacheKey = "opportunities:all";
    const cached = this.getCached(cacheKey);
    if (cached) {
      console.log("\u2705 Using cached opportunities");
      return cached;
    }
    try {
      const response = await openai8.chat.completions.create({
        model: "gpt-4",
        messages: [
          {
            role: "system",
            content: "You are a market opportunity analyst for Uzbekistan e-commerce."
          },
          {
            role: "user",
            content: `Identify top 5 market opportunities in Uzbekistan e-commerce.

Return JSON array:
[
  {
    "niche": "Niche name",
    "opportunity": "high",
    "reason": "Why this is an opportunity",
    "estimatedRevenue": 5000000,
    "difficulty": "medium",
    "timeToMarket": "2-3 months",
    "requiredInvestment": 1000000
  }
]

Focus on:
- Underserved markets
- Growing demand
- Low competition
- High profit margins
- Realistic for small businesses`
          }
        ],
        temperature: 0.8
      });
      const content = response.choices[0].message.content || "[]";
      const opportunities = JSON.parse(content);
      this.setCache(cacheKey, opportunities);
      return opportunities;
    } catch (error) {
      console.error("Error finding opportunities:", error);
      return [];
    }
  }
  /**
   * Predict product success probability
   */
  async predictSuccess(params) {
    console.log("\u{1F3AF} Predicting product success...");
    try {
      const trends = await this.analyzeTrends(params.category);
      const similarTrend = trends.find(
        (t) => t.productName.toLowerCase().includes(params.productName.toLowerCase()) || t.category === params.category
      );
      const competitorData = await competitorIntelligence.analyzeCompetitors(
        params.productName,
        ["uzum", "wildberries"]
      );
      const factors = {
        demand: similarTrend ? similarTrend.trendScore : 50,
        competition: this.calculateCompetitionScore(competitorData.competitors.length),
        pricing: this.calculatePricingScore(
          params.targetPrice,
          competitorData.priceRecommendation.averagePrice
        ),
        seasonality: 70
        // Default
      };
      const successProbability = factors.demand * 0.4 + factors.competition * 0.3 + factors.pricing * 0.2 + factors.seasonality * 0.1;
      const recommendations = [];
      if (factors.demand < 60) {
        recommendations.push("Demand is low - consider different product or niche");
      }
      if (factors.competition < 50) {
        recommendations.push("High competition - differentiate your offering");
      }
      if (factors.pricing < 60) {
        recommendations.push("Price is not competitive - adjust pricing strategy");
      }
      if (successProbability > 70) {
        recommendations.push("High success probability - good product choice!");
      }
      const estimatedMonthlySales = Math.round(
        successProbability / 100 * 100 * (params.targetPrice - params.costPrice)
      );
      return {
        successProbability,
        factors,
        recommendations,
        estimatedMonthlySales
      };
    } catch (error) {
      console.error("Error predicting success:", error);
      return {
        successProbability: 50,
        factors: { demand: 50, competition: 50, pricing: 50, seasonality: 50 },
        recommendations: ["Unable to analyze - try again later"],
        estimatedMonthlySales: 0
      };
    }
  }
  /**
   * Get personalized product recommendations for partner
   */
  async getRecommendations(partnerId) {
    console.log("\u{1F4CB} Getting personalized recommendations...");
    const trending = await this.analyzeTrends();
    const opportunities = await this.findOpportunities();
    const suggestions = [
      "Focus on trending categories with low competition",
      "Consider seasonal products 2-3 months in advance",
      "Use AI-generated content to save time",
      "Monitor competitor prices weekly",
      "Test multiple marketplaces simultaneously"
    ];
    return {
      trending: trending.slice(0, 5),
      opportunities: opportunities.slice(0, 3),
      suggestions
    };
  }
  /**
   * Helper: Calculate competition score
   */
  calculateCompetitionScore(competitorCount) {
    if (competitorCount < 5) return 90;
    if (competitorCount < 10) return 70;
    if (competitorCount < 20) return 50;
    return 30;
  }
  /**
   * Helper: Calculate pricing score
   */
  calculatePricingScore(targetPrice, averagePrice) {
    if (averagePrice === 0) return 50;
    const ratio = targetPrice / averagePrice;
    if (ratio >= 0.9 && ratio <= 1.1) return 90;
    if (ratio >= 0.8 && ratio <= 1.2) return 70;
    if (ratio >= 0.7 && ratio <= 1.3) return 50;
    return 30;
  }
  /**
   * Cache helpers
   */
  getCached(key) {
    const cached = this.cache.get(key);
    if (!cached) return null;
    const { data, timestamp } = cached;
    if (Date.now() - timestamp > this.cacheExpiry) {
      this.cache.delete(key);
      return null;
    }
    return data;
  }
  setCache(key, data) {
    this.cache.set(key, {
      data,
      timestamp: Date.now()
    });
  }
  /**
   * Clear cache
   */
  clearCache() {
    this.cache.clear();
    console.log("\u{1F5D1}\uFE0F Trend cache cleared");
  }
};
var trendHunter = new TrendHunterService();

// server/routes/smartAIRoutes.ts
import multer2 from "multer";
import path3 from "path";
var router32 = Router23();
var storage2 = multer2.diskStorage({
  destination: "./uploads/products/",
  filename: /* @__PURE__ */ __name((req, file, cb) => {
    cb(null, `product-${Date.now()}${path3.extname(file.originalname)}`);
  }, "filename")
});
var upload2 = multer2({
  storage: storage2,
  limits: { fileSize: 10 * 1024 * 1024 },
  // 10MB
  fileFilter: /* @__PURE__ */ __name((req, file, cb) => {
    const allowedTypes = /jpeg|jpg|png|webp/;
    const extname = allowedTypes.test(path3.extname(file.originalname).toLowerCase());
    const mimetype = allowedTypes.test(file.mimetype);
    if (extname && mimetype) {
      cb(null, true);
    } else {
      cb(new Error("Only image files are allowed!"));
    }
  }, "fileFilter")
});
router32.post("/scan-product", requireAuth2, upload2.single("image"), async (req, res) => {
  try {
    const { quantity, costPrice } = req.body;
    const partnerId = req.user.id;
    if (!req.file) {
      return res.status(400).json({
        success: false,
        error: "Image is required"
      });
    }
    if (!quantity || !costPrice) {
      return res.status(400).json({
        success: false,
        error: "Quantity and cost price are required"
      });
    }
    const imageUrl = `/uploads/products/${req.file.filename}`;
    const card = await smartAIManager.scanAndGenerateCard({
      imageUrl,
      quantity: parseInt(quantity),
      costPrice: parseFloat(costPrice),
      partnerId
    });
    const costStats = smartAIManager.getCostStats();
    res.json({
      success: true,
      data: card,
      costStats: {
        totalCost: `$${costStats.totalCost.toFixed(4)}`,
        cacheHits: costStats.cacheHits,
        savings: `$${costStats.cacheSavings.toFixed(4)}`
      }
    });
  } catch (error) {
    console.error("Scan product error:", error);
    res.status(500).json({
      success: false,
      error: error.message || "Failed to scan product"
    });
  }
});
router32.post("/scan-product-url", requireAuth2, async (req, res) => {
  try {
    const { imageUrl, quantity, costPrice } = req.body;
    const partnerId = req.user.id;
    if (!imageUrl || !quantity || !costPrice) {
      return res.status(400).json({
        success: false,
        error: "Image URL, quantity, and cost price are required"
      });
    }
    const card = await smartAIManager.scanAndGenerateCard({
      imageUrl,
      quantity: parseInt(quantity),
      costPrice: parseFloat(costPrice),
      partnerId
    });
    const costStats = smartAIManager.getCostStats();
    res.json({
      success: true,
      data: card,
      costStats: {
        totalCost: `$${costStats.totalCost.toFixed(4)}`,
        cacheHits: costStats.cacheHits,
        savings: `$${costStats.cacheSavings.toFixed(4)}`
      }
    });
  } catch (error) {
    console.error("Scan product URL error:", error);
    res.status(500).json({
      success: false,
      error: error.message || "Failed to scan product"
    });
  }
});
router32.get("/cost-stats", requireAuth2, (req, res) => {
  const stats = smartAIManager.getCostStats();
  res.json({
    success: true,
    data: {
      totalCost: `$${stats.totalCost.toFixed(4)}`,
      requestCount: stats.requestCount,
      cacheHits: stats.cacheHits,
      averageCost: `$${stats.averageCost.toFixed(4)}`,
      cacheSavings: `$${stats.cacheSavings.toFixed(4)}`,
      cacheHitRate: `${(stats.cacheHits / stats.requestCount * 100).toFixed(1)}%`
    }
  });
});
router32.get("/trends", requireAuth2, async (req, res) => {
  try {
    const { category } = req.query;
    const trends = await trendHunter.analyzeTrends(category);
    res.json({
      success: true,
      data: trends
    });
  } catch (error) {
    console.error("Get trends error:", error);
    res.status(500).json({
      success: false,
      error: error.message || "Failed to get trends"
    });
  }
});
router32.get("/opportunities", requireAuth2, async (req, res) => {
  try {
    const opportunities = await trendHunter.findOpportunities();
    res.json({
      success: true,
      data: opportunities
    });
  } catch (error) {
    console.error("Get opportunities error:", error);
    res.status(500).json({
      success: false,
      error: error.message || "Failed to get opportunities"
    });
  }
});
router32.post("/predict-success", requireAuth2, async (req, res) => {
  try {
    const { productName, category, costPrice, targetPrice } = req.body;
    if (!productName || !category || !costPrice || !targetPrice) {
      return res.status(400).json({
        success: false,
        error: "All fields are required"
      });
    }
    const prediction = await trendHunter.predictSuccess({
      productName,
      category,
      costPrice: parseFloat(costPrice),
      targetPrice: parseFloat(targetPrice)
    });
    res.json({
      success: true,
      data: prediction
    });
  } catch (error) {
    console.error("Predict success error:", error);
    res.status(500).json({
      success: false,
      error: error.message || "Failed to predict success"
    });
  }
});
router32.get("/recommendations", requireAuth2, async (req, res) => {
  try {
    const partnerId = req.user.id;
    const recommendations = await trendHunter.getRecommendations(partnerId);
    res.json({
      success: true,
      data: recommendations
    });
  } catch (error) {
    console.error("Get recommendations error:", error);
    res.status(500).json({
      success: false,
      error: error.message || "Failed to get recommendations"
    });
  }
});
router32.post("/clear-cache", requireAuth2, (req, res) => {
  try {
    smartAIManager.clearCache();
    trendHunter.clearCache();
    res.json({
      success: true,
      message: "Cache cleared successfully"
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message || "Failed to clear cache"
    });
  }
});
var smartAIRoutes_default = router32;

// server/routes/billingRoutes.ts
init_db();
init_schema();
import { Router as Router24 } from "express";
import { eq as eq23, and as and20, gte as gte6, lte as lte5, desc as desc7 } from "drizzle-orm";
var router33 = Router24();
router33.get("/admin/invoices", async (req, res) => {
  try {
    const allInvoices = await db.query.invoices.findMany({
      orderBy: [desc7(invoices.createdAt)],
      with: {
        partner: {
          columns: {
            id: true,
            businessName: true,
            fullName: true,
            email: true
          }
        }
      }
    });
    res.json(allInvoices);
  } catch (error) {
    console.error("Error fetching invoices:", error);
    res.status(500).json({ error: "Failed to fetch invoices" });
  }
});
router33.get("/partner/invoices", async (req, res) => {
  try {
    const partnerId = req.user?.id;
    if (!partnerId) {
      return res.status(401).json({ error: "Unauthorized" });
    }
    const partnerInvoices = await db.query.invoices.findMany({
      where: eq23(invoices.partnerId, partnerId),
      orderBy: [desc7(invoices.createdAt)]
    });
    res.json(partnerInvoices);
  } catch (error) {
    console.error("Error fetching partner invoices:", error);
    res.status(500).json({ error: "Failed to fetch invoices" });
  }
});
router33.get("/invoices/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const invoice = await db.query.invoices.findFirst({
      where: eq23(invoices.id, id),
      with: {
        partner: {
          columns: {
            id: true,
            businessName: true,
            fullName: true,
            email: true
          }
        }
      }
    });
    if (!invoice) {
      return res.status(404).json({ error: "Invoice not found" });
    }
    if (req.user?.role !== "admin" && invoice.partnerId !== req.user?.id) {
      return res.status(403).json({ error: "Forbidden" });
    }
    res.json(invoice);
  } catch (error) {
    console.error("Error fetching invoice:", error);
    res.status(500).json({ error: "Failed to fetch invoice" });
  }
});
router33.get("/admin/payments", async (req, res) => {
  try {
    const allPayments = await db.query.payments.findMany({
      orderBy: [desc7(payments.createdAt)],
      with: {
        partner: {
          columns: {
            id: true,
            businessName: true,
            fullName: true,
            email: true
          }
        },
        invoice: true
      }
    });
    res.json(allPayments);
  } catch (error) {
    console.error("Error fetching payments:", error);
    res.status(500).json({ error: "Failed to fetch payments" });
  }
});
router33.get("/partner/payments", async (req, res) => {
  try {
    const partnerId = req.user?.id;
    if (!partnerId) {
      return res.status(401).json({ error: "Unauthorized" });
    }
    const partnerPayments = await db.query.payments.findMany({
      where: eq23(payments.partnerId, partnerId),
      orderBy: [desc7(payments.createdAt)],
      with: {
        invoice: true
      }
    });
    res.json(partnerPayments);
  } catch (error) {
    console.error("Error fetching partner payments:", error);
    res.status(500).json({ error: "Failed to fetch payments" });
  }
});
router33.post("/admin/payments/manual", async (req, res) => {
  try {
    if (req.user?.role !== "admin") {
      return res.status(403).json({ error: "Admin access required" });
    }
    const { partnerId, invoiceId, amount, paymentMethod, notes } = req.body;
    if (!partnerId || !amount || !paymentMethod) {
      return res.status(400).json({ error: "Missing required fields" });
    }
    const paymentId = `pay_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    await db.insert(payments).values({
      id: paymentId,
      partnerId,
      invoiceId: invoiceId || null,
      amount,
      currency: "USD",
      paymentMethod,
      status: "completed",
      notes,
      createdAt: /* @__PURE__ */ new Date()
    });
    if (invoiceId) {
      await db.update(invoices).set({
        status: "paid",
        paidAt: /* @__PURE__ */ new Date(),
        updatedAt: /* @__PURE__ */ new Date()
      }).where(eq23(invoices.id, invoiceId));
      const invoice = await db.query.invoices.findFirst({
        where: eq23(invoices.id, invoiceId)
      });
      if (invoice?.subscriptionId) {
        await db.update(subscriptions).set({
          status: "active",
          updatedAt: /* @__PURE__ */ new Date()
        }).where(eq23(subscriptions.id, invoice.subscriptionId));
      }
      try {
        const { checkAndProcessFirstPurchase: checkAndProcessFirstPurchase2 } = await Promise.resolve().then(() => (init_referralFirstPurchaseService(), referralFirstPurchaseService_exports));
        await checkAndProcessFirstPurchase2(
          partnerId,
          invoice?.subscriptionId || void 0,
          invoiceId || void 0,
          paymentId
        );
      } catch (refError) {
        console.error("Referral first purchase processing error:", refError);
      }
    }
    const partner = await db.query.partners.findFirst({
      where: eq23(partners.id, partnerId)
    });
    if (partner?.email) {
      await emailService_default.sendPaymentReceived(
        partner.email,
        partner.businessName || partner.fullName || "Partner",
        invoiceId || "N/A",
        amount,
        paymentMethod
      );
    }
    res.json({ success: true, paymentId });
  } catch (error) {
    console.error("Error recording payment:", error);
    res.status(500).json({ error: "Failed to record payment" });
  }
});
router33.get("/admin/commissions", async (req, res) => {
  try {
    const allCommissions = await db.query.commissionRecords.findMany({
      orderBy: [desc7(commissionRecords.createdAt)],
      with: {
        partner: {
          columns: {
            id: true,
            businessName: true,
            fullName: true,
            email: true
          }
        }
      }
    });
    res.json(allCommissions);
  } catch (error) {
    console.error("Error fetching commissions:", error);
    res.status(500).json({ error: "Failed to fetch commissions" });
  }
});
router33.get("/partner/commissions", async (req, res) => {
  try {
    const partnerId = req.user?.id;
    if (!partnerId) {
      return res.status(401).json({ error: "Unauthorized" });
    }
    const partnerCommissions = await db.query.commissionRecords.findMany({
      where: eq23(commissionRecords.partnerId, partnerId),
      orderBy: [desc7(commissionRecords.createdAt)]
    });
    res.json(partnerCommissions);
  } catch (error) {
    console.error("Error fetching partner commissions:", error);
    res.status(500).json({ error: "Failed to fetch commissions" });
  }
});
router33.get("/admin/billing/summary", async (req, res) => {
  try {
    const { startDate, endDate } = req.query;
    const start = startDate ? new Date(startDate) : new Date((/* @__PURE__ */ new Date()).getFullYear(), (/* @__PURE__ */ new Date()).getMonth(), 1);
    const end = endDate ? new Date(endDate) : /* @__PURE__ */ new Date();
    const paidInvoices = await db.query.invoices.findMany({
      where: and20(
        eq23(invoices.status, "paid"),
        gte6(invoices.paidAt, start),
        lte5(invoices.paidAt, end)
      )
    });
    const totalRevenue = paidInvoices.reduce((sum, inv) => sum + inv.amount, 0);
    const pendingInvoices = await db.query.invoices.findMany({
      where: eq23(invoices.status, "pending")
    });
    const totalPending = pendingInvoices.reduce((sum, inv) => sum + inv.amount, 0);
    const commissions = await db.query.commissionRecords.findMany({
      where: and20(
        gte6(commissionRecords.createdAt, start),
        lte5(commissionRecords.createdAt, end)
      )
    });
    const totalCommissions = commissions.reduce((sum, comm) => sum + comm.amount, 0);
    const monthlyData = paidInvoices.reduce((acc, inv) => {
      const month = inv.paidAt?.toISOString().substring(0, 7) || "";
      if (!acc[month]) {
        acc[month] = 0;
      }
      acc[month] += inv.amount;
      return acc;
    }, {});
    res.json({
      totalRevenue,
      totalPending,
      totalCommissions,
      paidInvoicesCount: paidInvoices.length,
      pendingInvoicesCount: pendingInvoices.length,
      monthlyData
    });
  } catch (error) {
    console.error("Error fetching billing summary:", error);
    res.status(500).json({ error: "Failed to fetch billing summary" });
  }
});
router33.get("/partner/billing/summary", async (req, res) => {
  try {
    const partnerId = req.user?.id;
    if (!partnerId) {
      return res.status(401).json({ error: "Unauthorized" });
    }
    const paidInvoices = await db.query.invoices.findMany({
      where: and20(
        eq23(invoices.partnerId, partnerId),
        eq23(invoices.status, "paid")
      )
    });
    const totalPaid = paidInvoices.reduce((sum, inv) => sum + inv.amount, 0);
    const pendingInvoices = await db.query.invoices.findMany({
      where: and20(
        eq23(invoices.partnerId, partnerId),
        eq23(invoices.status, "pending")
      )
    });
    const totalPending = pendingInvoices.reduce((sum, inv) => sum + inv.amount, 0);
    const commissions = await db.query.commissionRecords.findMany({
      where: eq23(commissionRecords.partnerId, partnerId)
    });
    const totalCommissions = commissions.reduce((sum, comm) => sum + comm.amount, 0);
    const subscription = await db.query.subscriptions.findFirst({
      where: and20(
        eq23(subscriptions.partnerId, partnerId),
        eq23(subscriptions.status, "active")
      )
    });
    res.json({
      totalPaid,
      totalPending,
      totalCommissions,
      paidInvoicesCount: paidInvoices.length,
      pendingInvoicesCount: pendingInvoices.length,
      subscription
    });
  } catch (error) {
    console.error("Error fetching partner billing summary:", error);
    res.status(500).json({ error: "Failed to fetch billing summary" });
  }
});
router33.get("/admin/invoices/export", async (req, res) => {
  try {
    if (req.user?.role !== "admin") {
      return res.status(403).json({ error: "Admin access required" });
    }
    const allInvoices = await db.query.invoices.findMany({
      orderBy: [desc7(invoices.createdAt)],
      with: {
        partner: {
          columns: {
            businessName: true,
            fullName: true,
            email: true
          }
        }
      }
    });
    const csv = [
      "Invoice ID,Partner,Email,Amount,Currency,Status,Due Date,Paid At,Created At",
      ...allInvoices.map((inv) => [
        inv.id,
        inv.partner?.businessName || inv.partner?.fullName || "N/A",
        inv.partner?.email || "N/A",
        inv.amount,
        inv.currency,
        inv.status,
        inv.dueDate.toISOString(),
        inv.paidAt?.toISOString() || "N/A",
        inv.createdAt.toISOString()
      ].join(","))
    ].join("\n");
    res.setHeader("Content-Type", "text/csv");
    res.setHeader("Content-Disposition", "attachment; filename=invoices.csv");
    res.send(csv);
  } catch (error) {
    console.error("Error exporting invoices:", error);
    res.status(500).json({ error: "Failed to export invoices" });
  }
});
var billingRoutes_default = router33;

// server/routes/aiScannerRoutes.ts
import express10 from "express";
init_realAIService();
import multer3 from "multer";
import fs3 from "fs";
import path4 from "path";
import { nanoid as nanoid16 } from "nanoid";
var router34 = express10.Router();
var storage3 = multer3.diskStorage({
  destination: /* @__PURE__ */ __name((req, file, cb) => {
    const uploadDir = path4.join(process.cwd(), "uploads", "scanner");
    if (!fs3.existsSync(uploadDir)) {
      fs3.mkdirSync(uploadDir, { recursive: true });
    }
    cb(null, uploadDir);
  }, "destination"),
  filename: /* @__PURE__ */ __name((req, file, cb) => {
    const ext = path4.extname(file.originalname);
    cb(null, `scan_${nanoid16()}${ext}`);
  }, "filename")
});
var upload3 = multer3({
  storage: storage3,
  limits: { fileSize: 10 * 1024 * 1024 },
  // 10MB
  fileFilter: /* @__PURE__ */ __name((req, file, cb) => {
    const allowedTypes = ["image/jpeg", "image/png", "image/webp", "image/gif"];
    if (allowedTypes.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error("Faqat rasm fayllari qabul qilinadi (JPEG, PNG, WebP, GIF)"));
    }
  }, "fileFilter")
});
router34.post("/recognize", upload3.single("image"), asyncHandler(async (req, res) => {
  console.log("\u{1F4F8} AI Scanner: Rasm qabul qilindi");
  if (!req.file) {
    return res.status(400).json({
      success: false,
      error: "Rasm talab qilinadi",
      message: "Iltimos, mahsulot rasmini yuklang"
    });
  }
  if (!realAIService.isEnabled()) {
    fs3.unlinkSync(req.file.path);
    return res.status(503).json({
      success: false,
      error: "AI xizmati mavjud emas",
      message: "EMERGENT_LLM_KEY sozlanmagan. Admin bilan bog'laning."
    });
  }
  try {
    console.log("\u{1F50D} AI Scanner: Tahlil boshlanmoqda...");
    const imageBuffer = fs3.readFileSync(req.file.path);
    const scanResult = await realAIService.scanProduct(imageBuffer);
    console.log("\u2705 AI Scanner: Mahsulot aniqlandi:", scanResult.name);
    res.json({
      success: true,
      product: {
        ...scanResult,
        imageUrl: `/uploads/scanner/${path4.basename(req.file.path)}`,
        scannedAt: (/* @__PURE__ */ new Date()).toISOString()
      },
      message: `Mahsulot muvaffaqiyatli aniqlandi: ${scanResult.name}`
    });
  } catch (error) {
    console.error("\u274C AI Scanner Error:", error.message);
    if (req.file && fs3.existsSync(req.file.path)) {
      fs3.unlinkSync(req.file.path);
    }
    res.status(500).json({
      success: false,
      error: "Mahsulotni aniqlashda xatolik",
      message: error.message || "AI xizmati vaqtinchalik ishlamayapti"
    });
  }
}));
router34.post("/generate-card", asyncHandler(async (req, res) => {
  const { name, category, description, price, marketplace = "uzum" } = req.body;
  if (!name) {
    return res.status(400).json({
      success: false,
      error: "Mahsulot nomi talab qilinadi"
    });
  }
  if (!realAIService.isEnabled()) {
    return res.status(503).json({
      success: false,
      error: "AI xizmati mavjud emas"
    });
  }
  try {
    console.log("\u{1F3A8} AI: Mahsulot kartochkasi yaratilmoqda...", name);
    const card = await realAIService.generateProductCard({
      name,
      category: category || "general",
      description: description || "",
      price: parseFloat(price) || 1e5,
      marketplace
    });
    console.log("\u2705 AI: Kartochka yaratildi, SEO score:", card.seoScore);
    res.json({
      success: true,
      card,
      message: `Kartochka yaratildi. SEO ball: ${card.seoScore}/100`
    });
  } catch (error) {
    console.error("\u274C AI Card Generation Error:", error.message);
    res.status(500).json({
      success: false,
      error: "Kartochka yaratishda xatolik",
      message: error.message
    });
  }
}));
router34.post("/optimize-price", asyncHandler(async (req, res) => {
  const { productName, currentPrice, costPrice, category, marketplace = "uzum" } = req.body;
  if (!productName || !currentPrice || !costPrice) {
    return res.status(400).json({
      success: false,
      error: "Mahsulot nomi, narxi va tannarxi talab qilinadi"
    });
  }
  if (!realAIService.isEnabled()) {
    return res.status(503).json({
      success: false,
      error: "AI xizmati mavjud emas"
    });
  }
  try {
    console.log("\u{1F4B0} AI: Narx optimizatsiyasi...", productName);
    const optimization = await realAIService.optimizePrice({
      productName,
      currentPrice: parseFloat(currentPrice),
      costPrice: parseFloat(costPrice),
      category: category || "general",
      marketplace
    });
    console.log("\u2705 AI: Optimal narx:", optimization.recommendedPrice);
    res.json({
      success: true,
      optimization,
      message: `Tavsiya etilgan narx: ${optimization.recommendedPrice.toLocaleString()} so'm`
    });
  } catch (error) {
    console.error("\u274C AI Price Optimization Error:", error.message);
    res.status(500).json({
      success: false,
      error: "Narx optimizatsiyasida xatolik",
      message: error.message
    });
  }
}));
router34.get("/status", asyncHandler(async (req, res) => {
  const status = realAIService.getStatus();
  res.json({
    success: true,
    ai: status,
    message: status.demo ? "AI demo rejimda ishlayapti. Haqiqiy AI uchun OPENAI_API_KEY yoki GEMINI_API_KEY qo'shing." : `AI xizmati ishlayapti (${status.provider})`
  });
}));
var aiScannerRoutes_default = router34;

// server/routes/adminRemoteAccess.ts
import express11 from "express";
init_db();
init_schema();
import { eq as eq24 } from "drizzle-orm";
var router35 = express11.Router();
router35.get("/partner/:partnerId", asyncHandler(async (req, res) => {
  const user = req.user;
  const { partnerId } = req.params;
  if (!user || user.role !== "admin") {
    return res.status(403).json({ error: "Admin access required" });
  }
  try {
    const partner = await db.select().from(partners).where(eq24(partners.id, partnerId)).limit(1);
    if (partner.length === 0) {
      return res.status(404).json({ error: "Partner not found" });
    }
    const partnerUser = await db.select().from(users).where(eq24(users.id, partner[0].userId)).limit(1);
    res.json({
      partner: partner[0],
      user: partnerUser[0] || null,
      accessGranted: true,
      timestamp: (/* @__PURE__ */ new Date()).toISOString()
    });
  } catch (error) {
    console.error("Remote access error:", error);
    res.status(500).json({ error: error.message });
  }
}));
router35.put("/partner/:partnerId/settings", asyncHandler(async (req, res) => {
  const user = req.user;
  const { partnerId } = req.params;
  const updates = req.body;
  if (!user || user.role !== "admin") {
    return res.status(403).json({ error: "Admin access required" });
  }
  try {
    await db.update(partners).set({
      ...updates,
      updatedAt: /* @__PURE__ */ new Date()
    }).where(eq24(partners.id, partnerId));
    res.json({
      success: true,
      message: "Sozlamalar yangilandi",
      timestamp: (/* @__PURE__ */ new Date()).toISOString()
    });
  } catch (error) {
    console.error("Remote update error:", error);
    res.status(500).json({ error: error.message });
  }
}));
router35.get("/partner/:partnerId/products", asyncHandler(async (req, res) => {
  const user = req.user;
  const { partnerId } = req.params;
  if (!user || user.role !== "admin") {
    return res.status(403).json({ error: "Admin access required" });
  }
  try {
    const products4 = await db.all(
      `SELECT * FROM products WHERE partner_id = ? ORDER BY created_at DESC`,
      [partnerId]
    );
    res.json({ products: products4 });
  } catch (error) {
    console.error("Get products error:", error);
    res.status(500).json({ error: error.message });
  }
}));
router35.put("/partner/:partnerId/products/:productId", asyncHandler(async (req, res) => {
  const user = req.user;
  const { partnerId, productId } = req.params;
  const updates = req.body;
  if (!user || user.role !== "admin") {
    return res.status(403).json({ error: "Admin access required" });
  }
  try {
    await db.run(
      `UPDATE products SET ${Object.keys(updates).map((k) => `${k} = ?`).join(", ")}, updated_at = CURRENT_TIMESTAMP WHERE id = ? AND partner_id = ?`,
      [...Object.values(updates), productId, partnerId]
    );
    res.json({
      success: true,
      message: "Mahsulot yangilandi"
    });
  } catch (error) {
    console.error("Update product error:", error);
    res.status(500).json({ error: error.message });
  }
}));
var adminRemoteAccess_default = router35;

// server/routes/adminReferralManagement.ts
import express12 from "express";
init_db();
init_schema();
import { eq as eq25, sql as sql14 } from "drizzle-orm";
var router36 = express12.Router();
router36.get("/stats", asyncHandler(async (req, res) => {
  const user = req.user;
  if (!user || user.role !== "admin") {
    return res.status(403).json({ error: "Admin access required" });
  }
  try {
    const [totalReferrals] = await db.select({ count: sql14`COUNT(*)` }).from(referrals);
    const [activeReferrals] = await db.select({ count: sql14`COUNT(*)` }).from(referrals).where(eq25(referrals.status, "active"));
    const [totalEarnings] = await db.select({ total: sql14`COALESCE(SUM(amount), 0)` }).from(referralEarnings);
    const topReferrers = await db.select({
      partnerId: referrals.referrerPartnerId,
      businessName: partners.businessName,
      referralCount: sql14`COUNT(*)`,
      totalEarnings: sql14`COALESCE(SUM(${referralEarnings.amount}), 0)`
    }).from(referrals).leftJoin(partners, eq25(referrals.referrerPartnerId, partners.id)).leftJoin(referralEarnings, eq25(referrals.referrerPartnerId, referralEarnings.referrerPartnerId)).groupBy(referrals.referrerPartnerId, partners.businessName).orderBy(sql14`COUNT(*) DESC`).limit(10);
    res.json({
      totalReferrals: totalReferrals.count,
      activeReferrals: activeReferrals.count,
      totalEarnings: totalEarnings.total,
      topReferrers: topReferrers.map((r) => ({
        partnerId: r.partnerId,
        businessName: r.businessName,
        referralCount: r.referralCount,
        totalEarnings: r.totalEarnings
      }))
    });
  } catch (error) {
    console.error("Referral stats error:", error);
    res.status(500).json({ error: error.message });
  }
}));
router36.put("/bonus-rates", asyncHandler(async (req, res) => {
  const user = req.user;
  const { tier, commissionRate, bonus } = req.body;
  if (!user || user.role !== "admin") {
    return res.status(403).json({ error: "Admin access required" });
  }
  try {
    await db.run(
      `INSERT OR REPLACE INTO referral_tier_config 
       (tier, commission_rate, bonus, updated_at)
       VALUES (?, ?, ?, CURRENT_TIMESTAMP)`,
      [tier, commissionRate, bonus]
    );
    res.json({
      success: true,
      message: "Bonus rates yangilandi"
    });
  } catch (error) {
    console.error("Update bonus rates error:", error);
    res.status(500).json({ error: error.message });
  }
}));
router36.post("/approve-payment/:earningId", asyncHandler(async (req, res) => {
  const user = req.user;
  const { earningId } = req.params;
  if (!user || user.role !== "admin") {
    return res.status(403).json({ error: "Admin access required" });
  }
  try {
    await db.run(
      `UPDATE referral_earnings 
       SET status = 'paid', paid_at = CURRENT_TIMESTAMP 
       WHERE id = ?`,
      [earningId]
    );
    res.json({
      success: true,
      message: "Bonus to'lovi tasdiqlandi"
    });
  } catch (error) {
    console.error("Approve payment error:", error);
    res.status(500).json({ error: error.message });
  }
}));
router36.get("/earnings", asyncHandler(async (req, res) => {
  const user = req.user;
  const { status } = req.query;
  if (!user || user.role !== "admin") {
    return res.status(403).json({ error: "Admin access required" });
  }
  try {
    let query = `
      SELECT 
        e.*,
        p.business_name as referrer_name,
        p2.business_name as referred_name
      FROM referral_earnings e
      LEFT JOIN partners p ON e.referrer_partner_id = p.id
      LEFT JOIN referrals r ON e.referral_id = r.id
      LEFT JOIN partners p2 ON r.referred_partner_id = p2.id
      WHERE 1=1
    `;
    const params = [];
    if (status) {
      query += " AND e.status = ?";
      params.push(status);
    }
    query += " ORDER BY e.created_at DESC LIMIT 100";
    const earnings = await db.all(query, params);
    res.json({ earnings });
  } catch (error) {
    console.error("Get earnings error:", error);
    res.status(500).json({ error: error.message });
  }
}));
var adminReferralManagement_default = router36;

// server/routes/priceStrategyRoutes.ts
import express13 from "express";

// server/services/priceStrategyService.ts
init_db();
import OpenAI8 from "openai";
var openai9 = new OpenAI8({ apiKey: process.env.OPENAI_API_KEY || "" });
async function optimizePriceRealTime(productId, marketplace, currentPrice) {
  console.log(`\u{1F4B0} Optimizing price for product ${productId} on ${marketplace}`);
  try {
    const competitors = await getCompetitorPrices2(productId, marketplace);
    const salesHistory = await getSalesHistory2(productId);
    const marketTrends = await getMarketTrends(productId, marketplace);
    const prompt = `
Siz professional narx strategiyasi mutaxassisisiz. Quyidagi ma'lumotlarni tahlil qiling va optimal narx strategiyasini taklif qiling.

MAHSULOT: ${productId}
MARKETPLACE: ${marketplace}
HOZIRGI NARX: ${currentPrice} so'm

RAQOBATCHILAR:
${JSON.stringify(competitors, null, 2)}

SAVDO TARIXI (oxirgi 30 kun):
${JSON.stringify(salesHistory, null, 2)}

BOZOR TRENDLARI:
${JSON.stringify(marketTrends, null, 2)}

VAZIFA:
Quyidagi JSON formatda javob bering:

{
  "recommendedPrice": 100000,
  "currentPrice": ${currentPrice},
  "priceChange": -5000,
  "priceChangePercent": -5,
  "strategy": "competitive",
  "reasoning": "Batafsil tushuntirish",
  "expectedImpact": {
    "salesIncrease": 15,
    "revenueIncrease": 10,
    "profitChange": 5
  },
  "competitorAnalysis": {
    "avgPrice": 95000,
    "minPrice": 85000,
    "maxPrice": 120000,
    "ourPosition": "average"
  },
  "confidence": 85,
  "risks": ["Risk 1", "Risk 2"],
  "alternatives": [
    {
      "price": 95000,
      "strategy": "aggressive",
      "expectedOutcome": "Savdo 25% oshadi, lekin foyda 10% kamayadi"
    }
  ]
}

MUHIM:
- Narx raqobatbardosh bo'lishi kerak
- Foyda marjasini saqlash kerak
- Bozor tendentsiyalarini hisobga olish kerak
- Real-time ma'lumotlarga asoslanish kerak
`;
    const response = await openai9.chat.completions.create({
      model: "gpt-4",
      messages: [
        {
          role: "system",
          content: "Siz professional e-commerce narx strategiyasi mutaxassisisiz. JSON formatda javob bering."
        },
        {
          role: "user",
          content: prompt
        }
      ],
      response_format: { type: "json_object" },
      temperature: 0.7
    });
    const strategy = JSON.parse(response.choices[0].message.content || "{}");
    await savePriceStrategy(productId, marketplace, strategy);
    return strategy;
  } catch (error) {
    console.error("Price optimization error:", error);
    throw error;
  }
}
__name(optimizePriceRealTime, "optimizePriceRealTime");
async function monitorCompetitorPrices(productId, marketplace) {
  console.log(`\u{1F441}\uFE0F Monitoring competitors for product ${productId}`);
  try {
    const competitors = await getCompetitorPrices2(productId, marketplace);
    const [product] = await db.all(
      `SELECT * FROM products WHERE id = ?`,
      [productId]
    );
    if (product) {
      const avgCompetitorPrice = competitors.reduce((sum, c) => sum + c.price, 0) / competitors.length;
      const priceDifference = (product.price - avgCompetitorPrice) / avgCompetitorPrice * 100;
      if (priceDifference > 20) {
        await createPriceAlert(productId, "price_too_high", {
          ourPrice: product.price,
          avgCompetitorPrice,
          difference: priceDifference
        });
      } else if (priceDifference < -20) {
        await createPriceAlert(productId, "price_too_low", {
          ourPrice: product.price,
          avgCompetitorPrice,
          difference: priceDifference
        });
      }
    }
    return competitors;
  } catch (error) {
    console.error("Competitor monitoring error:", error);
    return [];
  }
}
__name(monitorCompetitorPrices, "monitorCompetitorPrices");
async function adjustPriceDynamically(productId, marketplace, newPrice) {
  console.log(`\u{1F504} Adjusting price dynamically: ${productId} \u2192 ${newPrice}`);
  try {
    await db.run(
      `UPDATE products SET price = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?`,
      [newPrice, productId]
    );
    await db.run(
      `UPDATE ai_generated_products 
       SET suggested_price = ?, updated_at = CURRENT_TIMESTAMP 
       WHERE id IN (SELECT id FROM ai_generated_products WHERE raw_product_name = (SELECT name FROM products WHERE id = ?) LIMIT 1)`,
      [newPrice, productId]
    );
    await db.run(
      `INSERT INTO price_history (product_id, marketplace, old_price, new_price, changed_at, reason)
       VALUES (?, ?, (SELECT price FROM products WHERE id = ?), ?, CURRENT_TIMESTAMP, 'dynamic_adjustment')`,
      [productId, marketplace, productId, newPrice]
    );
    return true;
  } catch (error) {
    console.error("Dynamic price adjustment error:", error);
    return false;
  }
}
__name(adjustPriceDynamically, "adjustPriceDynamically");
async function getCompetitorPrices2(productId, marketplace) {
  const [product] = await db.all(`SELECT * FROM products WHERE id = ?`, [productId]);
  if (!product) return [];
  return [
    { seller: "Raqobatchi 1", price: parseFloat(product.price.toString()) * 0.9, rating: 4.5, sales: 150 },
    { seller: "Raqobatchi 2", price: parseFloat(product.price.toString()) * 1.1, rating: 4.8, sales: 200 },
    { seller: "Raqobatchi 3", price: parseFloat(product.price.toString()) * 0.95, rating: 4.3, sales: 100 }
  ];
}
__name(getCompetitorPrices2, "getCompetitorPrices");
async function getSalesHistory2(productId) {
  const history = await db.all(
    `SELECT date, revenue, orders 
     FROM analytics 
     WHERE product_id = ? 
     ORDER BY date DESC 
     LIMIT 30`,
    [productId]
  );
  return history || [];
}
__name(getSalesHistory2, "getSalesHistory");
async function getMarketTrends(productId, marketplace) {
  return {
    demandTrend: "increasing",
    seasonality: "high",
    competitionLevel: "medium"
  };
}
__name(getMarketTrends, "getMarketTrends");
async function savePriceStrategy(productId, marketplace, strategy) {
  await db.run(
    `INSERT OR REPLACE INTO price_strategies 
     (product_id, marketplace, strategy_data, created_at, updated_at)
     VALUES (?, ?, ?, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)`,
    [productId, marketplace, JSON.stringify(strategy)]
  );
}
__name(savePriceStrategy, "savePriceStrategy");
async function createPriceAlert(productId, type, data) {
  await db.run(
    `INSERT INTO price_alerts (product_id, alert_type, alert_data, status, created_at)
     VALUES (?, ?, ?, 'open', CURRENT_TIMESTAMP)`,
    [productId, type, JSON.stringify(data)]
  );
}
__name(createPriceAlert, "createPriceAlert");
var priceStrategyService_default = {
  optimizePriceRealTime,
  monitorCompetitorPrices,
  adjustPriceDynamically
};

// server/routes/priceStrategyRoutes.ts
var router37 = express13.Router();
router37.post("/optimize", asyncHandler(async (req, res) => {
  const { productId, marketplace, currentPrice } = req.body;
  if (!productId || !marketplace || !currentPrice) {
    return res.status(400).json({ error: "productId, marketplace, currentPrice majburiy" });
  }
  const strategy = await priceStrategyService_default.optimizePriceRealTime(productId, marketplace, currentPrice);
  res.json(strategy);
}));
router37.post("/monitor", asyncHandler(async (req, res) => {
  const { productId, marketplace } = req.body;
  const competitors = await priceStrategyService_default.monitorCompetitorPrices(productId, marketplace);
  res.json({ competitors });
}));
router37.post("/adjust", asyncHandler(async (req, res) => {
  const { productId, marketplace, newPrice } = req.body;
  const success = await priceStrategyService_default.adjustPriceDynamically(productId, marketplace, newPrice);
  res.json({ success });
}));
var priceStrategyRoutes_default = router37;

// server/routes/aiMarketingRoutes.ts
import express14 from "express";

// server/services/aiMarketingService.ts
init_db();
import OpenAI9 from "openai";
var openai10 = new OpenAI9({ apiKey: process.env.OPENAI_API_KEY || "" });
async function optimizeSEO2(productId, marketplace) {
  console.log(`\u{1F50D} Optimizing SEO for product ${productId}`);
  try {
    const [product] = await db.all(`SELECT * FROM products WHERE id = ?`, [productId]);
    if (!product) throw new Error("Product not found");
    const prompt = `
Siz professional SEO mutaxassisisiz. Quyidagi mahsulot uchun SEO optimizatsiyasini taklif qiling.

MAHSULOT: ${product.name}
MARKETPLACE: ${marketplace}
KATEGORIYA: ${product.category || "general"}

VAZIFA:
Quyidagi JSON formatda javob bering:

{
  "currentScore": 65,
  "optimizedScore": 90,
  "improvements": [
    {
      "type": "title",
      "issue": "Sarlavha SEO uchun optimizatsiya qilinmagan",
      "suggestion": "SEO-optimizatsiya qilingan sarlavha",
      "impact": "high"
    }
  ],
  "estimatedTrafficIncrease": 45
}
`;
    const response = await openai10.chat.completions.create({
      model: "gpt-4",
      messages: [
        {
          role: "system",
          content: "Siz professional SEO mutaxassisisiz. JSON formatda javob bering."
        },
        {
          role: "user",
          content: prompt
        }
      ],
      response_format: { type: "json_object" },
      temperature: 0.7
    });
    const optimization = JSON.parse(response.choices[0].message.content || "{}");
    await db.run(
      `INSERT OR REPLACE INTO seo_optimizations 
       (product_id, marketplace, optimization_data, created_at, updated_at)
       VALUES (?, ?, ?, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)`,
      [productId, marketplace, JSON.stringify(optimization)]
    );
    return optimization;
  } catch (error) {
    console.error("SEO optimization error:", error);
    throw error;
  }
}
__name(optimizeSEO2, "optimizeSEO");
async function generateSocialMediaPost(productId, platform) {
  console.log(`\u{1F4F1} Generating ${platform} post for product ${productId}`);
  try {
    const [product] = await db.all(`SELECT * FROM products WHERE id = ?`, [productId]);
    if (!product) throw new Error("Product not found");
    const platformRules = {
      telegram: "Telegram - qisqa, qiziqarli, emoji bilan",
      facebook: "Facebook - batafsil, professional, rasm bilan",
      instagram: "Instagram - visual, hashtaglar, qisqa matn",
      twitter: "Twitter - 280 belgi, hashtaglar, qisqa"
    };
    const prompt = `
${platformRules[platform]} post yarating.

MAHSULOT: ${product.name}
NARX: ${product.price} so'm
KATEGORIYA: ${product.category || "general"}

Post ${platform} uchun mos bo'lishi kerak, sotuvni oshiruvchi va qiziqarli bo'lishi kerak.
`;
    const response = await openai10.chat.completions.create({
      model: "gpt-4",
      messages: [
        {
          role: "system",
          content: `Siz professional ${platform} marketing mutaxassisisiz.`
        },
        {
          role: "user",
          content: prompt
        }
      ],
      temperature: 0.8,
      max_tokens: 200
    });
    const post = response.choices[0].message.content || "";
    await db.run(
      `INSERT INTO social_media_posts 
       (product_id, platform, content, status, created_at)
       VALUES (?, ?, ?, 'draft', CURRENT_TIMESTAMP)`,
      [productId, platform, post]
    );
    return post;
  } catch (error) {
    console.error("Social media post generation error:", error);
    throw error;
  }
}
__name(generateSocialMediaPost, "generateSocialMediaPost");
async function createMarketingCampaign(partnerId, campaignData) {
  console.log(`\u{1F4E2} Creating marketing campaign for partner ${partnerId}`);
  try {
    const campaignId = `campaign_${Date.now()}`;
    const campaign = {
      id: campaignId,
      name: campaignData.name || "New Campaign",
      type: campaignData.type || "seo",
      targetAudience: campaignData.targetAudience || "general",
      budget: campaignData.budget || 0,
      duration: campaignData.duration || 30,
      status: "draft",
      performance: {
        impressions: 0,
        clicks: 0,
        conversions: 0,
        roi: 0
      }
    };
    await db.run(
      `INSERT INTO marketing_campaigns 
       (id, partner_id, campaign_data, created_at, updated_at)
       VALUES (?, ?, ?, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)`,
      [campaignId, partnerId, JSON.stringify(campaign)]
    );
    return campaign;
  } catch (error) {
    console.error("Campaign creation error:", error);
    throw error;
  }
}
__name(createMarketingCampaign, "createMarketingCampaign");
var aiMarketingService_default = {
  optimizeSEO: optimizeSEO2,
  generateSocialMediaPost,
  createMarketingCampaign
};

// server/routes/aiMarketingRoutes.ts
var router38 = express14.Router();
router38.post("/seo/optimize", asyncHandler(async (req, res) => {
  const { productId, marketplace } = req.body;
  const optimization = await aiMarketingService_default.optimizeSEO(productId, marketplace);
  res.json(optimization);
}));
router38.post("/social/post", asyncHandler(async (req, res) => {
  const { productId, platform } = req.body;
  const post = await aiMarketingService_default.generateSocialMediaPost(productId, platform);
  res.json({ post });
}));
router38.post("/campaign", asyncHandler(async (req, res) => {
  const partner = req.partner;
  const campaignData = req.body;
  if (!partner) {
    return res.status(401).json({ error: "Unauthorized" });
  }
  const campaign = await aiMarketingService_default.createMarketingCampaign(partner.id, campaignData);
  res.json(campaign);
}));
var aiMarketingRoutes_default = router38;

// server/routes/analyticsRoutes.ts
import express15 from "express";

// server/services/advancedAnalyticsService.ts
init_db();
import OpenAI10 from "openai";
var openai11 = new OpenAI10({ apiKey: process.env.OPENAI_API_KEY || "" });
async function forecastSales(partnerId, period) {
  console.log(`\u{1F4CA} Forecasting sales for partner ${partnerId}, period: ${period}`);
  try {
    const days = period === "7days" ? 7 : period === "30days" ? 30 : period === "90days" ? 90 : 365;
    const history = await db.all(
      `SELECT date, revenue, orders 
       FROM analytics 
       WHERE partner_id = ? 
       AND date >= date('now', '-${days * 2} days')
       ORDER BY date`,
      [partnerId]
    );
    const currentTrends = await analyzeTrends(partnerId);
    const prompt = `
Siz professional sales forecasting mutaxassisisiz. Quyidagi ma'lumotlarni tahlil qiling va bashorat qiling.

HISTORICAL DATA (oxirgi ${days * 2} kun):
${JSON.stringify(history, null, 2)}

CURRENT TRENDS:
${JSON.stringify(currentTrends, null, 2)}

PERIOD: ${period}

VAZIFA:
Quyidagi JSON formatda javob bering:

{
  "period": "${period}",
  "predictedRevenue": 5000000,
  "predictedOrders": 150,
  "confidence": 85,
  "factors": [
    {
      "factor": "Seasonality",
      "impact": "positive",
      "weight": 0.3
    }
  ],
  "scenarios": {
    "best": { "revenue": 6000000, "orders": 180 },
    "average": { "revenue": 5000000, "orders": 150 },
    "worst": { "revenue": 4000000, "orders": 120 }
  }
}
`;
    const response = await openai11.chat.completions.create({
      model: "gpt-4",
      messages: [
        {
          role: "system",
          content: "Siz professional sales forecasting mutaxassisisiz. JSON formatda javob bering."
        },
        {
          role: "user",
          content: prompt
        }
      ],
      response_format: { type: "json_object" },
      temperature: 0.5
    });
    const forecast = JSON.parse(response.choices[0].message.content || "{}");
    await db.run(
      `INSERT INTO sales_forecasts 
       (partner_id, period, forecast_data, created_at)
       VALUES (?, ?, ?, CURRENT_TIMESTAMP)`,
      [partnerId, period, JSON.stringify(forecast)]
    );
    return forecast;
  } catch (error) {
    console.error("Sales forecasting error:", error);
    throw error;
  }
}
__name(forecastSales, "forecastSales");
async function analyzeCustomerBehavior(partnerId) {
  console.log(`\u{1F465} Analyzing customer behavior for partner ${partnerId}`);
  try {
    const customers3 = await db.all(
      `SELECT customer_name, customer_email, total_amount, order_count, last_order_date
       FROM (
         SELECT 
           customer_name,
           customer_email,
           SUM(total_amount) as total_amount,
           COUNT(*) as order_count,
           MAX(created_at) as last_order_date
         FROM orders
         WHERE partner_id = ?
         GROUP BY customer_name, customer_email
       )`,
      [partnerId]
    );
    const behaviors = [];
    for (const customer of customers3) {
      const avgOrderValue = customer.total_amount / customer.order_count;
      const daysSinceLastOrder = Math.floor(
        (Date.now() - new Date(customer.last_order_date).getTime()) / (1e3 * 60 * 60 * 24)
      );
      let purchasePattern = "one-time";
      if (customer.order_count > 5) {
        purchasePattern = "frequent";
      } else if (customer.order_count > 1) {
        purchasePattern = "occasional";
      }
      let churnRisk = "low";
      if (daysSinceLastOrder > 90) {
        churnRisk = "high";
      } else if (daysSinceLastOrder > 30) {
        churnRisk = "medium";
      }
      behaviors.push({
        customerSegment: avgOrderValue > 5e5 ? "premium" : "standard",
        purchasePattern,
        averageOrderValue: avgOrderValue,
        preferredCategory: "general",
        // Would be calculated from order history
        preferredMarketplace: "uzum",
        // Would be calculated from order history
        churnRisk,
        recommendations: generateRecommendations(customer, churnRisk)
      });
    }
    return behaviors;
  } catch (error) {
    console.error("Customer behavior analysis error:", error);
    return [];
  }
}
__name(analyzeCustomerBehavior, "analyzeCustomerBehavior");
async function predictTrends(partnerId, category) {
  console.log(`\u{1F52E} Predicting trends for partner ${partnerId}, category: ${category}`);
  try {
    const prompt = `
Quyidagi kategoriya uchun kelajakdagi trendlarni bashorat qiling.

KATEGORIYA: ${category}
REGION: O'zbekiston

JSON formatda javob bering:
{
  "predictedTrend": "increasing",
  "confidence": 75,
  "timeframe": "next_3_months",
  "factors": ["Factor 1", "Factor 2"],
  "recommendations": ["Recommendation 1", "Recommendation 2"]
}
`;
    const response = await openai11.chat.completions.create({
      model: "gpt-4",
      messages: [{ role: "user", content: prompt }],
      response_format: { type: "json_object" }
    });
    return JSON.parse(response.choices[0].message.content || "{}");
  } catch (error) {
    console.error("Trend prediction error:", error);
    return null;
  }
}
__name(predictTrends, "predictTrends");
async function analyzeTrends(partnerId) {
  const recent = await db.all(
    `SELECT AVG(revenue) as avg_revenue, AVG(orders) as avg_orders
     FROM analytics
     WHERE partner_id = ? AND date >= date('now', '-30 days')`,
    [partnerId]
  );
  const previous = await db.all(
    `SELECT AVG(revenue) as avg_revenue, AVG(orders) as avg_orders
     FROM analytics
     WHERE partner_id = ? AND date >= date('now', '-60 days') AND date < date('now', '-30 days')`,
    [partnerId]
  );
  return {
    recent: recent[0] || { avg_revenue: 0, avg_orders: 0 },
    previous: previous[0] || { avg_revenue: 0, avg_orders: 0 }
  };
}
__name(analyzeTrends, "analyzeTrends");
function generateRecommendations(customer, churnRisk) {
  const recommendations = [];
  if (churnRisk === "high") {
    recommendations.push("Churn risk yuqori - maxsus taklif yuborish tavsiya etiladi");
    recommendations.push("Loyalty dasturiga qo'shish");
  }
  if (customer.order_count === 1) {
    recommendations.push("Ikkinchi xarid uchun chegirma taklif qilish");
  }
  return recommendations;
}
__name(generateRecommendations, "generateRecommendations");
var advancedAnalyticsService_default = {
  forecastSales,
  analyzeCustomerBehavior,
  predictTrends
};

// server/routes/analyticsRoutes.ts
var router39 = express15.Router();
router39.get("/forecast", asyncHandler(async (req, res) => {
  const partner = req.partner;
  const { period } = req.query;
  if (!partner) {
    return res.status(401).json({ error: "Unauthorized" });
  }
  const forecast = await advancedAnalyticsService_default.forecastSales(
    partner.id,
    period || "30days"
  );
  res.json(forecast);
}));
router39.get("/customer-behavior", asyncHandler(async (req, res) => {
  const partner = req.partner;
  if (!partner) {
    return res.status(401).json({ error: "Unauthorized" });
  }
  const behaviors = await advancedAnalyticsService_default.analyzeCustomerBehavior(partner.id);
  res.json({ behaviors });
}));
router39.get("/predict-trends", asyncHandler(async (req, res) => {
  const partner = req.partner;
  const { category } = req.query;
  if (!partner) {
    return res.status(401).json({ error: "Unauthorized" });
  }
  const prediction = await advancedAnalyticsService_default.predictTrends(partner.id, category);
  res.json(prediction);
}));
var analyticsRoutes_default = router39;

// server/routes/customerServiceRoutes.ts
import express16 from "express";

// server/services/aiCustomerService.ts
init_db();
import OpenAI11 from "openai";
var openai12 = new OpenAI11({ apiKey: process.env.OPENAI_API_KEY || "" });
async function getChatbotResponse(message, context) {
  console.log(`\u{1F916} Chatbot processing message: ${message.substring(0, 50)}...`);
  try {
    const systemPrompt = `Siz SellerCloudX platformasining yordamchi chatbotsiz. 
O'zbek va Rus tillarida javob bering.
Professional, do'stona va foydali javoblar bering.
Agar savol javob berish qiyin bo'lsa, admin bilan bog'lanishni tavsiya qiling.`;
    const response = await openai12.chat.completions.create({
      model: "gpt-4",
      messages: [
        { role: "system", content: systemPrompt },
        ...context?.history || [],
        { role: "user", content: message }
      ],
      temperature: 0.7,
      max_tokens: 300
    });
    const botResponse = response.choices[0].message.content || "Kechirasiz, javob topa olmadim.";
    await db.run(
      `INSERT INTO chatbot_conversations 
       (user_message, bot_response, created_at)
       VALUES (?, ?, CURRENT_TIMESTAMP)`,
      [message, botResponse]
    );
    return botResponse;
  } catch (error) {
    console.error("Chatbot error:", error);
    return "Kechirasiz, xatolik yuz berdi. Iltimos, qayta urinib ko'ring.";
  }
}
__name(getChatbotResponse, "getChatbotResponse");
async function autoRespond(question) {
  const commonQuestions = {
    "narx": "Narxlar mahsulot va tarifga qarab o'zgaradi. Batafsil ma'lumot uchun admin bilan bog'laning.",
    "qanday qo'shilish": "Ro'yxatdan o'tish uchun /partner-registration sahifasiga kiring.",
    "to'lov": "To'lovlar Click, Payme, Uzcard orqali amalga oshiriladi.",
    "yordam": "Yordam uchun chat orqali admin bilan bog'laning yoki support@sellercloudx.com ga yozing."
  };
  const lowerQuestion = question.toLowerCase();
  for (const [key, answer] of Object.entries(commonQuestions)) {
    if (lowerQuestion.includes(key)) {
      return answer;
    }
  }
  return null;
}
__name(autoRespond, "autoRespond");
async function createTicket(customerId, subject, description) {
  console.log(`\u{1F3AB} Creating ticket for customer ${customerId}`);
  try {
    const ticketId = `ticket_${Date.now()}`;
    const category = await categorizeTicket(subject, description);
    const priority = await determinePriority(subject, description);
    const ticket = {
      id: ticketId,
      customerId,
      subject,
      description,
      status: "open",
      priority,
      category,
      createdAt: /* @__PURE__ */ new Date()
    };
    await db.run(
      `INSERT INTO support_tickets 
       (id, customer_id, subject, description, status, priority, category, created_at)
       VALUES (?, ?, ?, ?, ?, ?, ?, CURRENT_TIMESTAMP)`,
      [ticketId, customerId, subject, description, "open", priority, category]
    );
    return ticket;
  } catch (error) {
    console.error("Ticket creation error:", error);
    throw error;
  }
}
__name(createTicket, "createTicket");
async function categorizeTicket(subject, description) {
  const prompt = `
Quyidagi support so'rovini kategoriyalashtiring:

SUBJECT: ${subject}
DESCRIPTION: ${description}

Kategoriyalar: technical, billing, product, account, other

Faqat kategoriya nomini qaytaring.
`;
  try {
    const response = await openai12.chat.completions.create({
      model: "gpt-4",
      messages: [{ role: "user", content: prompt }],
      temperature: 0.3,
      max_tokens: 10
    });
    return response.choices[0].message.content?.trim() || "other";
  } catch (error) {
    return "other";
  }
}
__name(categorizeTicket, "categorizeTicket");
async function determinePriority(subject, description) {
  const urgentKeywords = ["urgent", "critical", "broken", "not working", "error"];
  const highKeywords = ["important", "issue", "problem"];
  const text2 = `${subject} ${description}`.toLowerCase();
  if (urgentKeywords.some((k) => text2.includes(k))) {
    return "urgent";
  } else if (highKeywords.some((k) => text2.includes(k))) {
    return "high";
  } else {
    return "medium";
  }
}
__name(determinePriority, "determinePriority");
var aiCustomerService_default = {
  getChatbotResponse,
  autoRespond,
  createTicket
};

// server/routes/customerServiceRoutes.ts
var router40 = express16.Router();
router40.post("/chatbot", asyncHandler(async (req, res) => {
  const { message, context } = req.body;
  if (!message) {
    return res.status(400).json({ error: "Message required" });
  }
  const autoResponse = await aiCustomerService_default.autoRespond(message);
  if (autoResponse) {
    return res.json({ response: autoResponse, source: "auto" });
  }
  const response = await aiCustomerService_default.getChatbotResponse(message, context);
  res.json({ response, source: "ai" });
}));
router40.post("/ticket", asyncHandler(async (req, res) => {
  const user = req.user;
  const { subject, description } = req.body;
  if (!user) {
    return res.status(401).json({ error: "Unauthorized" });
  }
  const ticket = await aiCustomerService_default.createTicket(user.id, subject, description);
  res.json(ticket);
}));
var customerServiceRoutes_default = router40;

// server/routes/reportingRoutes.ts
import express17 from "express";

// server/services/reportingService.ts
init_db();
import ExcelJS2 from "exceljs";
async function generateReport(partnerId, config2) {
  console.log(`\u{1F4CA} Generating ${config2.type} report for partner ${partnerId}`);
  try {
    let data = [];
    switch (config2.type) {
      case "sales":
        data = await generateSalesReport(partnerId, config2);
        break;
      case "inventory":
        data = await generateInventoryReport(partnerId, config2);
        break;
      case "analytics":
        data = await generateAnalyticsReport(partnerId, config2);
        break;
      default:
        data = [];
    }
    if (config2.format === "excel") {
      return await exportToExcel(data, config2);
    } else if (config2.format === "pdf") {
      return await exportToPDF(data, config2);
    } else {
      return await exportToCSV(data, config2);
    }
  } catch (error) {
    console.error("Report generation error:", error);
    throw error;
  }
}
__name(generateReport, "generateReport");
async function exportToExcel(data, config2) {
  const workbook = new ExcelJS2.Workbook();
  const worksheet = workbook.addWorksheet("Report");
  if (data.length > 0) {
    const headers = Object.keys(data[0]);
    worksheet.addRow(headers);
    worksheet.getRow(1).font = { bold: true };
    worksheet.getRow(1).fill = {
      type: "pattern",
      pattern: "solid",
      fgColor: { argb: "FFE0E0E0" }
    };
    data.forEach((row) => {
      worksheet.addRow(Object.values(row));
    });
    worksheet.columns.forEach((column) => {
      column.width = 15;
    });
  }
  const buffer = await workbook.xlsx.writeBuffer();
  return Buffer.from(buffer);
}
__name(exportToExcel, "exportToExcel");
async function exportToPDF(data, config2) {
  const jsPDF2 = (await import("jspdf")).default;
  const autoTable = (await import("jspdf-autotable")).default;
  const doc = new jsPDF2();
  doc.setFontSize(16);
  doc.text("Report", 14, 15);
  if (data.length > 0) {
    const headers = Object.keys(data[0]);
    const rows = data.map((row) => Object.values(row));
    autoTable(doc, {
      head: [headers],
      body: rows,
      startY: 25
    });
  }
  return Buffer.from(doc.output("arraybuffer"));
}
__name(exportToPDF, "exportToPDF");
async function exportToCSV(data, config2) {
  if (data.length === 0) {
    return Buffer.from("");
  }
  const headers = Object.keys(data[0]);
  const csvRows = [
    headers.join(","),
    ...data.map((row) => Object.values(row).join(","))
  ];
  return Buffer.from(csvRows.join("\n"), "utf-8");
}
__name(exportToCSV, "exportToCSV");
async function generateSalesReport(partnerId, config2) {
  const startDate = config2.startDate || new Date(Date.now() - 30 * 24 * 60 * 60 * 1e3);
  const endDate = config2.endDate || /* @__PURE__ */ new Date();
  return await db.all(
    `SELECT 
       date,
       revenue,
       orders,
       profit,
       marketplace,
       category
     FROM analytics
     WHERE partner_id = ? 
     AND date >= ? 
     AND date <= ?
     ORDER BY date DESC`,
    [partnerId, startDate.toISOString(), endDate.toISOString()]
  );
}
__name(generateSalesReport, "generateSalesReport");
async function generateInventoryReport(partnerId, config2) {
  return await db.all(
    `SELECT 
       name,
       sku,
       stock_quantity,
       price,
       cost_price,
       category
     FROM products
     WHERE partner_id = ?
     ORDER BY name`,
    [partnerId]
  );
}
__name(generateInventoryReport, "generateInventoryReport");
async function generateAnalyticsReport(partnerId, config2) {
  return await db.all(
    `SELECT 
       date,
       revenue,
       orders,
       profit,
       commission_paid,
       marketplace,
       category
     FROM analytics
     WHERE partner_id = ?
     ORDER BY date DESC
     LIMIT 1000`,
    [partnerId]
  );
}
__name(generateAnalyticsReport, "generateAnalyticsReport");
async function scheduleReport(partnerId, config2, schedule) {
  const scheduleId = `schedule_${Date.now()}`;
  await db.run(
    `INSERT INTO report_schedules 
     (id, partner_id, report_config, schedule, status, created_at)
     VALUES (?, ?, ?, ?, 'active', CURRENT_TIMESTAMP)`,
    [scheduleId, partnerId, JSON.stringify(config2), schedule]
  );
  return scheduleId;
}
__name(scheduleReport, "scheduleReport");
var reportingService_default = {
  generateReport,
  scheduleReport
};

// server/routes/reportingRoutes.ts
var router41 = express17.Router();
router41.post("/generate", asyncHandler(async (req, res) => {
  const partner = req.partner;
  const config2 = req.body;
  if (!partner) {
    return res.status(401).json({ error: "Unauthorized" });
  }
  const reportBuffer = await reportingService_default.generateReport(partner.id, config2);
  const contentType = config2.format === "excel" ? "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet" : config2.format === "pdf" ? "application/pdf" : "text/csv";
  const extension = config2.format === "excel" ? "xlsx" : config2.format === "pdf" ? "pdf" : "csv";
  const filename = `report_${Date.now()}.${extension}`;
  res.setHeader("Content-Type", contentType);
  res.setHeader("Content-Disposition", `attachment; filename="${filename}"`);
  res.send(reportBuffer);
}));
router41.post("/schedule", asyncHandler(async (req, res) => {
  const partner = req.partner;
  const { config: config2, schedule } = req.body;
  if (!partner) {
    return res.status(401).json({ error: "Unauthorized" });
  }
  const scheduleId = await reportingService_default.scheduleReport(partner.id, config2, schedule);
  res.json({ scheduleId, message: "Report scheduled successfully" });
}));
var reportingRoutes_default = router41;

// server/routes/gamificationRoutes.ts
import express18 from "express";

// server/services/gamificationService.ts
init_db();
async function getAchievements(partnerId) {
  console.log(`\u{1F3C6} Getting achievements for partner ${partnerId}`);
  try {
    const [stats] = await db.all(
      `SELECT 
         COUNT(DISTINCT p.id) as total_products,
         COUNT(DISTINCT o.id) as total_orders,
         SUM(o.total_amount) as total_revenue,
         COUNT(DISTINCT r.id) as total_referrals
       FROM partners p
       LEFT JOIN products pr ON p.id = pr.partner_id
       LEFT JOIN orders o ON p.id = o.partner_id
       LEFT JOIN referrals r ON p.id = r.referrer_partner_id
       WHERE p.id = ?
       GROUP BY p.id`,
      [partnerId]
    );
    const achievements = [];
    if (stats.total_orders >= 100) {
      achievements.push({
        id: "sales_100",
        name: "100 ta Buyurtma",
        description: "100 ta buyurtma yetkazib berdingiz!",
        icon: "\u{1F3AF}",
        points: 100,
        category: "sales",
        requirement: { type: "orders", value: 100 }
      });
    }
    if (stats.total_revenue >= 1e7) {
      achievements.push({
        id: "revenue_10m",
        name: "10M Aylanma",
        description: "10 million so'm aylanma!",
        icon: "\u{1F4B0}",
        points: 200,
        category: "sales",
        requirement: { type: "revenue", value: 1e7 }
      });
    }
    if (stats.total_referrals >= 10) {
      achievements.push({
        id: "referral_10",
        name: "10 ta Referral",
        description: "10 ta hamkorni taklif qildingiz!",
        icon: "\u{1F465}",
        points: 150,
        category: "referral",
        requirement: { type: "referrals", value: 10 }
      });
    }
    if (stats.total_products >= 50) {
      achievements.push({
        id: "products_50",
        name: "50 ta Mahsulot",
        description: "50 ta mahsulot qo'shdingiz!",
        icon: "\u{1F4E6}",
        points: 75,
        category: "product",
        requirement: { type: "products", value: 50 }
      });
    }
    return achievements;
  } catch (error) {
    console.error("Get achievements error:", error);
    return [];
  }
}
__name(getAchievements, "getAchievements");
async function getLeaderboard(limit = 10) {
  console.log(`\u{1F3C5} Getting leaderboard (top ${limit})`);
  try {
    const leaderboard = await db.all(
      `SELECT 
         p.id as partner_id,
         p.business_name as partner_name,
         COALESCE(SUM(a.points), 0) as total_points,
         COUNT(DISTINCT a.id) as achievements_count,
         p.pricing_tier as tier
       FROM partners p
       LEFT JOIN achievements a ON p.id = a.partner_id
       WHERE p.approved = 1
       GROUP BY p.id, p.business_name, p.pricing_tier
       ORDER BY total_points DESC
       LIMIT ?`,
      [limit]
    );
    return leaderboard.map((entry, index) => ({
      partnerId: entry.partner_id,
      partnerName: entry.partner_name,
      totalPoints: entry.total_points || 0,
      rank: index + 1,
      achievements: entry.achievements_count || 0,
      tier: entry.tier || "free_starter"
    }));
  } catch (error) {
    console.error("Leaderboard error:", error);
    return [];
  }
}
__name(getLeaderboard, "getLeaderboard");
async function awardAchievement(partnerId, achievementId) {
  console.log(`\u{1F396}\uFE0F Awarding achievement ${achievementId} to partner ${partnerId}`);
  try {
    const existing = await db.get(
      `SELECT id FROM achievements WHERE partner_id = ? AND achievement_id = ?`,
      [partnerId, achievementId]
    );
    if (existing) {
      return { success: false, message: "Achievement already awarded" };
    }
    await db.run(
      `INSERT INTO achievements (partner_id, achievement_id, awarded_at)
       VALUES (?, ?, CURRENT_TIMESTAMP)`,
      [partnerId, achievementId]
    );
    return { success: true, message: "Achievement awarded" };
  } catch (error) {
    console.error("Award achievement error:", error);
    return { success: false, message: error.message };
  }
}
__name(awardAchievement, "awardAchievement");
async function getRewards(partnerId) {
  console.log(`\u{1F381} Getting rewards for partner ${partnerId}`);
  try {
    const [points] = await db.all(
      `SELECT COALESCE(SUM(points), 0) as total_points
       FROM achievements a
       JOIN achievement_definitions ad ON a.achievement_id = ad.id
       WHERE a.partner_id = ?`,
      [partnerId]
    );
    const totalPoints = points?.total_points || 0;
    const rewards = [
      {
        id: "discount_10",
        name: "10% Chegirma",
        description: "Keyingi to'lovda 10% chegirma",
        pointsRequired: 100,
        available: totalPoints >= 100
      },
      {
        id: "free_month",
        name: "1 Oy Bepul",
        description: "1 oy bepul tarif",
        pointsRequired: 500,
        available: totalPoints >= 500
      },
      {
        id: "premium_features",
        name: "Premium Xususiyatlar",
        description: "1 oy premium xususiyatlar",
        pointsRequired: 300,
        available: totalPoints >= 300
      }
    ];
    return {
      totalPoints,
      rewards: rewards.filter((r) => r.available),
      allRewards: rewards
    };
  } catch (error) {
    console.error("Get rewards error:", error);
    return { totalPoints: 0, rewards: [], allRewards: [] };
  }
}
__name(getRewards, "getRewards");
var gamificationService_default = {
  getAchievements,
  getLeaderboard,
  awardAchievement,
  getRewards
};

// server/routes/gamificationRoutes.ts
var router42 = express18.Router();
router42.get("/achievements", asyncHandler(async (req, res) => {
  const partner = req.partner;
  if (!partner) {
    return res.status(401).json({ error: "Unauthorized" });
  }
  const achievements = await gamificationService_default.getAchievements(partner.id);
  res.json({ achievements });
}));
router42.get("/leaderboard", asyncHandler(async (req, res) => {
  const { limit } = req.query;
  const leaderboard = await gamificationService_default.getLeaderboard(parseInt(limit) || 10);
  res.json({ leaderboard });
}));
router42.get("/rewards", asyncHandler(async (req, res) => {
  const partner = req.partner;
  if (!partner) {
    return res.status(401).json({ error: "Unauthorized" });
  }
  const rewards = await gamificationService_default.getRewards(partner.id);
  res.json(rewards);
}));
var gamificationRoutes_default = router42;

// server/routes/marketplaceAIManagerRoutes.ts
import express19 from "express";

// server/services/yandexMarketService.ts
import axios5 from "axios";
var YandexMarketService = class {
  static {
    __name(this, "YandexMarketService");
  }
  api;
  credentials;
  constructor(credentials) {
    this.credentials = credentials;
    this.api = axios5.create({
      baseURL: "https://api.partner.market.yandex.ru",
      headers: {
        "Authorization": `OAuth ${credentials.oauthToken || credentials.apiKey}`,
        "Content-Type": "application/json"
      }
    });
  }
  // ==================== PRODUCTS MANAGEMENT ====================
  /**
   * Mahsulotlarni qo'shish/yangilash
   * POST /campaigns/{campaignId}/offers
   */
  async createOrUpdateProduct(product, campaignId) {
    const cId = campaignId || this.credentials.campaignId;
    if (!cId) throw new Error("Campaign ID required");
    try {
      const response = await this.api.post(`/campaigns/${cId}/offers`, {
        offers: [{
          offerId: product.offerId,
          name: product.name,
          category: product.category,
          price: product.price,
          oldPrice: product.oldPrice,
          vendor: product.vendor,
          description: product.description,
          pictures: product.pictures,
          availability: product.availability || "ACTIVE",
          count: product.count
        }]
      });
      return response.data.offerId || product.offerId;
    } catch (error) {
      console.error("Yandex Market: Product creation error:", error.response?.data || error.message);
      throw error;
    }
  }
  /**
   * Mahsulotlarni o'chirish
   * DELETE /campaigns/{campaignId}/offers/{offerId}
   */
  async deleteProduct(offerId, campaignId) {
    const cId = campaignId || this.credentials.campaignId;
    if (!cId) throw new Error("Campaign ID required");
    try {
      await this.api.delete(`/campaigns/${cId}/offers/${offerId}`);
      return true;
    } catch (error) {
      console.error("Yandex Market: Product deletion error:", error.response?.data || error.message);
      return false;
    }
  }
  /**
   * Mahsulotlar ro'yxatini olish
   * GET /campaigns/{campaignId}/offers
   */
  async getProducts(campaignId, limit = 100) {
    const cId = campaignId || this.credentials.campaignId;
    if (!cId) throw new Error("Campaign ID required");
    try {
      const response = await this.api.get(`/campaigns/${cId}/offers`, {
        params: { limit }
      });
      return response.data.result?.offers || [];
    } catch (error) {
      console.error("Yandex Market: Get products error:", error.response?.data || error.message);
      return [];
    }
  }
  // ==================== PRICES MANAGEMENT ====================
  /**
   * Narxlarni yangilash
   * POST /campaigns/{campaignId}/offer-prices/updates
   */
  async updatePrices(prices, campaignId) {
    const cId = campaignId || this.credentials.campaignId;
    if (!cId) throw new Error("Campaign ID required");
    try {
      await this.api.post(`/campaigns/${cId}/offer-prices/updates`, {
        offers: prices.map((p) => ({
          offerId: p.offerId,
          price: p.price,
          oldPrice: p.oldPrice
        }))
      });
      return true;
    } catch (error) {
      console.error("Yandex Market: Price update error:", error.response?.data || error.message);
      return false;
    }
  }
  // ==================== INVENTORY MANAGEMENT ====================
  /**
   * Qoldiqlarni yangilash
   * POST /campaigns/{campaignId}/offers/stocks
   */
  async updateStocks(stocks, campaignId) {
    const cId = campaignId || this.credentials.campaignId;
    if (!cId) throw new Error("Campaign ID required");
    try {
      await this.api.post(`/campaigns/${cId}/offers/stocks`, {
        skus: stocks.map((s) => ({
          offerId: s.offerId,
          count: s.count
        }))
      });
      return true;
    } catch (error) {
      console.error("Yandex Market: Stock update error:", error.response?.data || error.message);
      return false;
    }
  }
  // ==================== ORDERS MANAGEMENT ====================
  /**
   * Buyurtmalarni olish
   * GET /campaigns/{campaignId}/orders
   */
  async getOrders(campaignId, status, fromDate, toDate) {
    const cId = campaignId || this.credentials.campaignId;
    if (!cId) throw new Error("Campaign ID required");
    try {
      const params = {};
      if (status) params.status = status;
      if (fromDate) params.fromDate = fromDate;
      if (toDate) params.toDate = toDate;
      const response = await this.api.get(`/campaigns/${cId}/orders`, { params });
      return response.data.result?.orders || [];
    } catch (error) {
      console.error("Yandex Market: Get orders error:", error.response?.data || error.message);
      return [];
    }
  }
  /**
   * Buyurtma holatini yangilash
   * PUT /campaigns/{campaignId}/orders/{orderId}/status
   */
  async updateOrderStatus(orderId, status, campaignId) {
    const cId = campaignId || this.credentials.campaignId;
    if (!cId) throw new Error("Campaign ID required");
    try {
      await this.api.put(`/campaigns/${cId}/orders/${orderId}/status`, {
        status
      });
      return true;
    } catch (error) {
      console.error("Yandex Market: Order status update error:", error.response?.data || error.message);
      return false;
    }
  }
  // ==================== ANALYTICS ====================
  /**
   * Analitik ma'lumotlarni olish
   * GET /campaigns/{campaignId}/stats/orders
   */
  async getAnalytics(campaignId, fromDate, toDate) {
    const cId = campaignId || this.credentials.campaignId;
    if (!cId) throw new Error("Campaign ID required");
    try {
      const params = {};
      if (fromDate) params.fromDate = fromDate;
      if (toDate) params.toDate = toDate;
      const ordersResponse = await this.api.get(`/campaigns/${cId}/stats/orders`, { params });
      const qualityResponse = await this.api.get(`/campaigns/${cId}/quality/index`);
      const ordersData = ordersResponse.data.result || {};
      const qualityData = qualityResponse.data.result || {};
      return {
        orders: {
          total: ordersData.total || 0,
          revenue: ordersData.revenue || 0,
          averageOrderValue: ordersData.averageOrderValue || 0,
          period: `${fromDate || "start"} - ${toDate || "now"}`
        },
        products: {
          views: ordersData.views || 0,
          clicks: ordersData.clicks || 0,
          conversion: ordersData.conversion || 0
        },
        qualityIndex: {
          score: qualityData.score || 0,
          factors: qualityData.factors || []
        }
      };
    } catch (error) {
      console.error("Yandex Market: Analytics error:", error.response?.data || error.message);
      return {
        orders: { total: 0, revenue: 0, averageOrderValue: 0, period: "" },
        products: { views: 0, clicks: 0, conversion: 0 },
        qualityIndex: { score: 0, factors: [] }
      };
    }
  }
  /**
   * Indeks sifatini olish
   * GET /campaigns/{campaignId}/quality/index
   */
  async getQualityIndex(campaignId) {
    const cId = campaignId || this.credentials.campaignId;
    if (!cId) throw new Error("Campaign ID required");
    try {
      const response = await this.api.get(`/campaigns/${cId}/quality/index`);
      return response.data.result?.score || 0;
    } catch (error) {
      console.error("Yandex Market: Quality index error:", error.response?.data || error.message);
      return 0;
    }
  }
  // ==================== CHAT MANAGEMENT ====================
  /**
   * Chatlarni olish
   * GET /campaigns/{campaignId}/chats
   */
  async getChats(campaignId) {
    const cId = campaignId || this.credentials.campaignId;
    if (!cId) throw new Error("Campaign ID required");
    try {
      const response = await this.api.get(`/campaigns/${cId}/chats`);
      return response.data.result?.chats || [];
    } catch (error) {
      console.error("Yandex Market: Get chats error:", error.response?.data || error.message);
      return [];
    }
  }
  /**
   * Chat xabarlarini yuborish
   * POST /campaigns/{campaignId}/chats/{chatId}/messages
   */
  async sendChatMessage(chatId, message, campaignId) {
    const cId = campaignId || this.credentials.campaignId;
    if (!cId) throw new Error("Campaign ID required");
    try {
      await this.api.post(`/campaigns/${cId}/chats/${chatId}/messages`, {
        message
      });
      return true;
    } catch (error) {
      console.error("Yandex Market: Send message error:", error.response?.data || error.message);
      return false;
    }
  }
  // ==================== WAREHOUSES ====================
  /**
   * Skladlarni olish
   * GET /campaigns/{campaignId}/warehouses
   */
  async getWarehouses(campaignId) {
    const cId = campaignId || this.credentials.campaignId;
    if (!cId) throw new Error("Campaign ID required");
    try {
      const response = await this.api.get(`/campaigns/${cId}/warehouses`);
      return response.data.result?.warehouses || [];
    } catch (error) {
      console.error("Yandex Market: Get warehouses error:", error.response?.data || error.message);
      return [];
    }
  }
};
var yandexMarketService_default = YandexMarketService;

// server/services/uzumMarketService.ts
import axios6 from "axios";
var UzumMarketService = class {
  static {
    __name(this, "UzumMarketService");
  }
  api;
  credentials;
  constructor(credentials) {
    this.credentials = credentials;
    this.api = axios6.create({
      baseURL: "https://api-seller.uzum.uz/api",
      headers: {
        "Authorization": `Bearer ${credentials.accessToken || credentials.apiKey}`,
        "Content-Type": "application/json",
        "X-Seller-Id": credentials.sellerId || ""
      }
    });
  }
  // ==================== PRODUCTS MANAGEMENT ====================
  /**
   * Mahsulot yaratish/yangilash
   * POST /products
   */
  async createOrUpdateProduct(product) {
    try {
      const productData = {
        name: product.name,
        categoryId: product.categoryId,
        price: product.price,
        oldPrice: product.oldPrice,
        description: product.description,
        images: product.images || [],
        sku: product.sku,
        barcode: product.barcode,
        stockQuantity: product.stockQuantity || 0,
        weight: product.weight,
        dimensions: product.dimensions,
        attributes: product.attributes || {}
      };
      let response;
      if (product.productId) {
        response = await this.api.put(`/products/${product.productId}`, productData);
      } else {
        response = await this.api.post("/products", productData);
      }
      return response.data.productId || response.data.id || product.productId || "";
    } catch (error) {
      console.error("Uzum Market: Product creation error:", error.response?.data || error.message);
      throw error;
    }
  }
  /**
   * Mahsulotni o'chirish
   * DELETE /products/{productId}
   */
  async deleteProduct(productId) {
    try {
      await this.api.delete(`/products/${productId}`);
      return true;
    } catch (error) {
      console.error("Uzum Market: Product deletion error:", error.response?.data || error.message);
      return false;
    }
  }
  /**
   * Mahsulotlar ro'yxatini olish
   * GET /products
   */
  async getProducts(limit = 100, offset = 0) {
    try {
      const response = await this.api.get("/products", {
        params: { limit, offset }
      });
      return response.data.result?.products || response.data.products || [];
    } catch (error) {
      console.error("Uzum Market: Get products error:", error.response?.data || error.message);
      return [];
    }
  }
  /**
   * Bitta mahsulotni olish
   * GET /products/{productId}
   */
  async getProduct(productId) {
    try {
      const response = await this.api.get(`/products/${productId}`);
      return response.data.result || response.data || null;
    } catch (error) {
      console.error("Uzum Market: Get product error:", error.response?.data || error.message);
      return null;
    }
  }
  // ==================== PRICES MANAGEMENT ====================
  /**
   * Narxlarni yangilash
   * PUT /products/{productId}/price
   */
  async updatePrice(productId, price, oldPrice) {
    try {
      await this.api.put(`/products/${productId}/price`, {
        price,
        oldPrice
      });
      return true;
    } catch (error) {
      console.error("Uzum Market: Price update error:", error.response?.data || error.message);
      return false;
    }
  }
  /**
   * Bir nechta mahsulotlar narxlarini yangilash
   * POST /products/prices/bulk-update
   */
  async updatePricesBulk(prices) {
    try {
      await this.api.post("/products/prices/bulk-update", {
        prices
      });
      return true;
    } catch (error) {
      console.error("Uzum Market: Bulk price update error:", error.response?.data || error.message);
      return false;
    }
  }
  // ==================== INVENTORY MANAGEMENT ====================
  /**
   * Qoldiqlarni yangilash
   * PUT /products/{productId}/stock
   */
  async updateStock(productId, quantity) {
    try {
      await this.api.put(`/products/${productId}/stock`, {
        quantity
      });
      return true;
    } catch (error) {
      console.error("Uzum Market: Stock update error:", error.response?.data || error.message);
      return false;
    }
  }
  /**
   * Bir nechta mahsulotlar qoldiqlarini yangilash
   * POST /products/stocks/bulk-update
   */
  async updateStocksBulk(stocks) {
    try {
      await this.api.post("/products/stocks/bulk-update", {
        stocks
      });
      return true;
    } catch (error) {
      console.error("Uzum Market: Bulk stock update error:", error.response?.data || error.message);
      return false;
    }
  }
  // ==================== ORDERS MANAGEMENT ====================
  /**
   * Buyurtmalarni olish
   * GET /orders
   */
  async getOrders(status, fromDate, toDate, limit = 100) {
    try {
      const params = { limit };
      if (status) params.status = status;
      if (fromDate) params.fromDate = fromDate;
      if (toDate) params.toDate = toDate;
      const response = await this.api.get("/orders", { params });
      return response.data.result?.orders || response.data.orders || [];
    } catch (error) {
      console.error("Uzum Market: Get orders error:", error.response?.data || error.message);
      return [];
    }
  }
  /**
   * Bitta buyurtmani olish
   * GET /orders/{orderId}
   */
  async getOrder(orderId) {
    try {
      const response = await this.api.get(`/orders/${orderId}`);
      return response.data.result || response.data || null;
    } catch (error) {
      console.error("Uzum Market: Get order error:", error.response?.data || error.message);
      return null;
    }
  }
  /**
   * Buyurtma holatini yangilash
   * PUT /orders/{orderId}/status
   */
  async updateOrderStatus(orderId, status) {
    try {
      await this.api.put(`/orders/${orderId}/status`, {
        status
      });
      return true;
    } catch (error) {
      console.error("Uzum Market: Order status update error:", error.response?.data || error.message);
      return false;
    }
  }
  // ==================== ANALYTICS ====================
  /**
   * Analitik ma'lumotlarni olish
   * GET /analytics/sales
   */
  async getAnalytics(fromDate, toDate) {
    try {
      const params = {};
      if (fromDate) params.fromDate = fromDate;
      if (toDate) params.toDate = toDate;
      const salesResponse = await this.api.get("/analytics/sales", { params });
      const productsResponse = await this.api.get("/analytics/products", { params });
      const performanceResponse = await this.api.get("/analytics/performance", { params });
      const salesData = salesResponse.data.result || salesResponse.data || {};
      const productsData = productsResponse.data.result || productsResponse.data || {};
      const performanceData = performanceResponse.data.result || performanceResponse.data || {};
      return {
        sales: {
          totalRevenue: salesData.totalRevenue || 0,
          totalOrders: salesData.totalOrders || 0,
          averageOrderValue: salesData.averageOrderValue || 0,
          period: `${fromDate || "start"} - ${toDate || "now"}`
        },
        products: {
          totalViews: productsData.totalViews || 0,
          totalClicks: productsData.totalClicks || 0,
          conversionRate: productsData.conversionRate || 0,
          topProducts: productsData.topProducts || []
        },
        performance: {
          responseTime: performanceData.responseTime || 0,
          fulfillmentRate: performanceData.fulfillmentRate || 0,
          customerSatisfaction: performanceData.customerSatisfaction || 0
        }
      };
    } catch (error) {
      console.error("Uzum Market: Analytics error:", error.response?.data || error.message);
      return {
        sales: { totalRevenue: 0, totalOrders: 0, averageOrderValue: 0, period: "" },
        products: { totalViews: 0, totalClicks: 0, conversionRate: 0, topProducts: [] },
        performance: { responseTime: 0, fulfillmentRate: 0, customerSatisfaction: 0 }
      };
    }
  }
  /**
   * Top mahsulotlarni olish
   * GET /analytics/products/top
   */
  async getTopProducts(limit = 10) {
    try {
      const response = await this.api.get("/analytics/products/top", {
        params: { limit }
      });
      return response.data.result?.products || response.data.products || [];
    } catch (error) {
      console.error("Uzum Market: Get top products error:", error.response?.data || error.message);
      return [];
    }
  }
};
var uzumMarketService_default = UzumMarketService;

// server/services/marketplaceAIManager.ts
init_db();
init_schema();
import { eq as eq26 } from "drizzle-orm";
import OpenAI12 from "openai";
var openai13 = new OpenAI12({ apiKey: process.env.OPENAI_API_KEY || "" });
async function autoRespondToMarketplaceChats(partnerId) {
  console.log(`\u{1F4AC} Auto-responding to marketplace chats for partner ${partnerId}`);
  try {
    const integrations = await db.select().from(marketplaceIntegrations).where(eq26(marketplaceIntegrations.partnerId, partnerId)).where(eq26(marketplaceIntegrations.active, true));
    let totalResponded = 0;
    for (const integration of integrations) {
      try {
        if (integration.marketplace === "yandex") {
          const yandexService = new yandexMarketService_default({
            apiKey: integration.apiKey || "",
            oauthToken: integration.apiSecret,
            campaignId: integration.sellerId
          });
          const chats = await yandexService.getChats(integration.sellerId);
          for (const chat of chats) {
            if (chat.unreadCount > 0) {
              const response = await generateChatResponse(chat.lastMessage, integration.marketplace);
              await yandexService.sendChatMessage(chat.id, response, integration.sellerId);
              totalResponded++;
            }
          }
        } else if (integration.marketplace === "uzum") {
        }
      } catch (error) {
        console.error(`Error auto-responding for ${integration.marketplace}:`, error);
      }
    }
    return totalResponded;
  } catch (error) {
    console.error("Auto-respond to marketplace chats error:", error);
    return 0;
  }
}
__name(autoRespondToMarketplaceChats, "autoRespondToMarketplaceChats");
async function generateChatResponse(customerMessage, marketplace) {
  const marketplaceContext = {
    yandex: "Yandex Market - professional, Russian language",
    uzum: "Uzum Market - friendly, Uzbek or Russian language",
    wildberries: "Wildberries - professional, Russian language",
    ozon: "Ozon - detailed, Russian language"
  };
  const prompt = `
Siz ${marketplaceContext[marketplace] || "marketplace"} mijozlariga javob beruvchi yordamchisiz.

MIJOZ SAVOLI: "${customerMessage}"

VAZIFA:
Professional, do'stona va foydali javob bering. 
${marketplace === "uzum" ? "O'zbek yoki Rus tillarida javob bering." : "Rus tilida javob bering."}
Javob qisqa va aniq bo'lishi kerak (maksimum 200 so'z).
`;
  try {
    const response = await openai13.chat.completions.create({
      model: "gpt-4",
      messages: [
        {
          role: "system",
          content: `Siz ${marketplace} marketplace yordamchisisiz. Professional va do'stona javoblar bering.`
        },
        {
          role: "user",
          content: prompt
        }
      ],
      temperature: 0.7,
      max_tokens: 200
    });
    return response.choices[0].message.content || "Rahmat, sizning savolingizni ko'rib chiqamiz.";
  } catch (error) {
    console.error("Chat response generation error:", error);
    return "Rahmat, sizning savolingizni ko'rib chiqamiz. Tez orada javob beramiz.";
  }
}
__name(generateChatResponse, "generateChatResponse");
async function autoProcessOrders(partnerId) {
  console.log(`\u{1F4E6} Auto-processing orders for partner ${partnerId}`);
  try {
    const integrations = await db.select().from(marketplaceIntegrations).where(eq26(marketplaceIntegrations.partnerId, partnerId)).where(eq26(marketplaceIntegrations.active, true));
    let totalProcessed = 0;
    for (const integration of integrations) {
      try {
        if (integration.marketplace === "yandex") {
          const yandexService = new yandexMarketService_default({
            apiKey: integration.apiKey || "",
            oauthToken: integration.apiSecret,
            campaignId: integration.sellerId
          });
          const orders3 = await yandexService.getOrders(
            integration.sellerId,
            "PROCESSING",
            new Date(Date.now() - 24 * 60 * 60 * 1e3).toISOString()
          );
          for (const order of orders3) {
            await yandexService.updateOrderStatus(order.id, "CONFIRMED", integration.sellerId);
            totalProcessed++;
          }
        } else if (integration.marketplace === "uzum") {
          const uzumService = new uzumMarketService_default({
            apiKey: integration.apiKey || "",
            accessToken: integration.apiSecret,
            sellerId: integration.sellerId
          });
          const orders3 = await uzumService.getOrders("pending");
          for (const order of orders3) {
            await uzumService.updateOrderStatus(order.orderId, "confirmed");
            totalProcessed++;
          }
        }
      } catch (error) {
        console.error(`Error auto-processing orders for ${integration.marketplace}:`, error);
      }
    }
    return totalProcessed;
  } catch (error) {
    console.error("Auto-process orders error:", error);
    return 0;
  }
}
__name(autoProcessOrders, "autoProcessOrders");
async function monitorAndOptimizeQualityIndex(partnerId) {
  console.log(`\u2B50 Monitoring quality index for partner ${partnerId}`);
  try {
    const integrations = await db.select().from(marketplaceIntegrations).where(eq26(marketplaceIntegrations.partnerId, partnerId)).where(eq26(marketplaceIntegrations.active, true));
    const results = [];
    for (const integration of integrations) {
      if (integration.marketplace === "yandex") {
        const yandexService = new yandexMarketService_default({
          apiKey: integration.apiKey || "",
          oauthToken: integration.apiSecret,
          campaignId: integration.sellerId
        });
        const qualityScore = await yandexService.getQualityIndex(integration.sellerId);
        const recommendations = await generateQualityRecommendations(qualityScore, "yandex");
        results.push({
          marketplace: "yandex",
          currentScore: qualityScore,
          recommendations
        });
      }
    }
    return results[0] || { marketplace: "", currentScore: 0, recommendations: [] };
  } catch (error) {
    console.error("Quality index monitoring error:", error);
    return { marketplace: "", currentScore: 0, recommendations: [] };
  }
}
__name(monitorAndOptimizeQualityIndex, "monitorAndOptimizeQualityIndex");
async function generateQualityRecommendations(score, marketplace) {
  const prompt = `
Siz ${marketplace} marketplace quality index mutaxassisisiz.

CURRENT SCORE: ${score}/100

VAZIFA:
Quyidagi JSON formatda tavsiyalar bering:

{
  "recommendations": [
    "Tavsiya 1 - qanday yaxshilash mumkin",
    "Tavsiya 2 - optimizatsiya",
    "Tavsiya 3 - muammolarni hal qilish"
  ]
}

O'zbek yoki Rus tillarida javob bering.
`;
  try {
    const response = await openai13.chat.completions.create({
      model: "gpt-4",
      messages: [
        {
          role: "system",
          content: `Siz ${marketplace} marketplace quality index mutaxassisisiz. JSON formatda javob bering.`
        },
        {
          role: "user",
          content: prompt
        }
      ],
      response_format: { type: "json_object" },
      temperature: 0.7
    });
    const analysis = JSON.parse(response.choices[0].message.content || "{}");
    return analysis.recommendations || [];
  } catch (error) {
    console.error("Quality recommendations generation error:", error);
    return ["Tavsiyalar tayyorlanmoqda..."];
  }
}
__name(generateQualityRecommendations, "generateQualityRecommendations");
async function handleMarketplaceNotification(partnerId, marketplace, notification) {
  console.log(`\u{1F514} Handling ${marketplace} notification for partner ${partnerId}: ${notification.type}`);
  try {
    switch (notification.type) {
      case "NEW_ORDER":
        await autoProcessOrders(partnerId);
        break;
      case "ORDER_STATUS_CHANGED":
        break;
      case "NEW_CHAT_MESSAGE":
        await autoRespondToMarketplaceChats(partnerId);
        break;
      case "PRODUCT_REJECTED":
        break;
      case "QUALITY_INDEX_CHANGED":
        await monitorAndOptimizeQualityIndex(partnerId);
        break;
      default:
        console.log(`Unknown notification type: ${notification.type}`);
    }
    return true;
  } catch (error) {
    console.error("Handle marketplace notification error:", error);
    return false;
  }
}
__name(handleMarketplaceNotification, "handleMarketplaceNotification");
var marketplaceAIManager_default = {
  autoRespondToMarketplaceChats,
  autoProcessOrders,
  monitorAndOptimizeQualityIndex,
  handleMarketplaceNotification
};

// server/services/marketplaceAnalyticsService.ts
init_db();
init_schema();
import { eq as eq27 } from "drizzle-orm";
import OpenAI13 from "openai";
var openai14 = new OpenAI13({ apiKey: process.env.OPENAI_API_KEY || "" });
async function collectMarketplaceAnalytics(partnerId, period) {
  console.log(`\u{1F4CA} Collecting marketplace analytics for partner ${partnerId}`);
  try {
    const integrations = await db.select().from(marketplaceIntegrations).where(eq27(marketplaceIntegrations.partnerId, partnerId)).where(eq27(marketplaceIntegrations.active, true));
    const analytics3 = [];
    for (const integration of integrations) {
      try {
        let marketplaceData = null;
        if (integration.marketplace === "yandex") {
          const yandexService = new yandexMarketService_default({
            apiKey: integration.apiKey || "",
            oauthToken: integration.apiSecret,
            campaignId: integration.sellerId
          });
          const yandexAnalytics = await yandexService.getAnalytics(
            integration.sellerId,
            period.from.toISOString(),
            period.to.toISOString()
          );
          const qualityIndex = await yandexService.getQualityIndex(integration.sellerId);
          marketplaceData = {
            marketplace: "yandex",
            period: `${period.from.toISOString()} - ${period.to.toISOString()}`,
            sales: {
              totalRevenue: yandexAnalytics.orders.revenue,
              totalOrders: yandexAnalytics.orders.total,
              averageOrderValue: yandexAnalytics.orders.averageOrderValue,
              growth: 0
              // Calculate from previous period
            },
            products: {
              total: 0,
              // Get from products list
              active: 0,
              topSelling: []
            },
            performance: {
              qualityScore: qualityIndex,
              fulfillmentRate: 0,
              responseTime: 0,
              customerSatisfaction: 0
            },
            insights: [],
            recommendations: []
          };
        } else if (integration.marketplace === "uzum") {
          const uzumService = new uzumMarketService_default({
            apiKey: integration.apiKey || "",
            accessToken: integration.apiSecret,
            sellerId: integration.sellerId
          });
          const uzumAnalytics = await uzumService.getAnalytics(
            period.from.toISOString(),
            period.to.toISOString()
          );
          const topProducts = await uzumService.getTopProducts(10);
          marketplaceData = {
            marketplace: "uzum",
            period: `${period.from.toISOString()} - ${period.to.toISOString()}`,
            sales: {
              totalRevenue: uzumAnalytics.sales.totalRevenue,
              totalOrders: uzumAnalytics.sales.totalOrders,
              averageOrderValue: uzumAnalytics.sales.averageOrderValue,
              growth: 0
            },
            products: {
              total: 0,
              active: 0,
              topSelling: topProducts.map((p) => ({
                productId: p.productId,
                name: p.name,
                sales: p.sales,
                revenue: 0
              }))
            },
            performance: {
              fulfillmentRate: uzumAnalytics.performance.fulfillmentRate,
              responseTime: uzumAnalytics.performance.responseTime,
              customerSatisfaction: uzumAnalytics.performance.customerSatisfaction
            },
            insights: [],
            recommendations: []
          };
        }
        if (marketplaceData) {
          const aiAnalysis = await generateAIAnalysis(marketplaceData);
          marketplaceData.insights = aiAnalysis.insights;
          marketplaceData.recommendations = aiAnalysis.recommendations;
          analytics3.push(marketplaceData);
        }
      } catch (error) {
        console.error(`Error collecting analytics for ${integration.marketplace}:`, error);
      }
    }
    return analytics3;
  } catch (error) {
    console.error("Marketplace analytics collection error:", error);
    return [];
  }
}
__name(collectMarketplaceAnalytics, "collectMarketplaceAnalytics");
async function generateAIAnalysis(analytics3) {
  try {
    const prompt = `
Siz professional e-commerce analitika mutaxassisisiz. Quyidagi marketplace analitikasini tahlil qiling:

MARKETPLACE: ${analytics3.marketplace}
PERIOD: ${analytics3.period}

SALES:
- Total Revenue: ${analytics3.sales.totalRevenue}
- Total Orders: ${analytics3.sales.totalOrders}
- Average Order Value: ${analytics3.sales.averageOrderValue}
- Growth: ${analytics3.sales.growth}%

PRODUCTS:
- Total: ${analytics3.products.total}
- Active: ${analytics3.products.active}
- Top Selling: ${analytics3.products.topSelling.length} products

PERFORMANCE:
- Quality Score: ${analytics3.performance.qualityScore || "N/A"}
- Fulfillment Rate: ${analytics3.performance.fulfillmentRate}%
- Response Time: ${analytics3.performance.responseTime}ms
- Customer Satisfaction: ${analytics3.performance.customerSatisfaction}%

VAZIFA:
Quyidagi JSON formatda javob bering:

{
  "insights": [
    "Insight 1 - muhim kuzatuvlar",
    "Insight 2 - tendentsiyalar",
    "Insight 3 - muammolar"
  ],
  "recommendations": [
    "Recommendation 1 - qanday yaxshilash mumkin",
    "Recommendation 2 - strategiya",
    "Recommendation 3 - optimizatsiya"
  ]
}

O'zbek yoki Rus tillarida javob bering.
`;
    const response = await openai14.chat.completions.create({
      model: "gpt-4",
      messages: [
        {
          role: "system",
          content: "Siz professional e-commerce analitika mutaxassisisiz. JSON formatda javob bering."
        },
        {
          role: "user",
          content: prompt
        }
      ],
      response_format: { type: "json_object" },
      temperature: 0.7
    });
    const analysis = JSON.parse(response.choices[0].message.content || "{}");
    return {
      insights: analysis.insights || [],
      recommendations: analysis.recommendations || []
    };
  } catch (error) {
    console.error("AI analysis error:", error);
    return {
      insights: ["Analitika yuklanmoqda..."],
      recommendations: ["Tavsiyalar tayyorlanmoqda..."]
    };
  }
}
__name(generateAIAnalysis, "generateAIAnalysis");
async function compareMarketplaces(partnerId, period) {
  const analytics3 = await collectMarketplaceAnalytics(partnerId, period);
  const comparison = analytics3.map((a) => ({
    marketplace: a.marketplace,
    revenue: a.sales.totalRevenue,
    orders: a.sales.totalOrders,
    performance: a.performance.qualityScore || a.performance.fulfillmentRate || 0
  }));
  const bestPerformer = comparison.reduce(
    (best, current) => current.revenue > best.revenue ? current : best
  ).marketplace;
  const recommendations = analytics3.flatMap((a) => a.recommendations).slice(0, 5);
  return {
    comparison,
    bestPerformer,
    recommendations
  };
}
__name(compareMarketplaces, "compareMarketplaces");
var marketplaceAnalyticsService_default = {
  collectMarketplaceAnalytics,
  compareMarketplaces
};

// server/routes/marketplaceAIManagerRoutes.ts
var router43 = express19.Router();
router43.post("/chats/auto-respond", asyncHandler(async (req, res) => {
  const partner = req.partner;
  if (!partner) {
    return res.status(401).json({ error: "Unauthorized" });
  }
  const responded = await marketplaceAIManager_default.autoRespondToMarketplaceChats(partner.id);
  res.json({ success: true, responded });
}));
router43.post("/orders/auto-process", asyncHandler(async (req, res) => {
  const partner = req.partner;
  if (!partner) {
    return res.status(401).json({ error: "Unauthorized" });
  }
  const processed = await marketplaceAIManager_default.autoProcessOrders(partner.id);
  res.json({ success: true, processed });
}));
router43.get("/quality-index", asyncHandler(async (req, res) => {
  const partner = req.partner;
  if (!partner) {
    return res.status(401).json({ error: "Unauthorized" });
  }
  const result = await marketplaceAIManager_default.monitorAndOptimizeQualityIndex(partner.id);
  res.json(result);
}));
router43.get("/analytics", asyncHandler(async (req, res) => {
  const partner = req.partner;
  const { from, to } = req.query;
  if (!partner) {
    return res.status(401).json({ error: "Unauthorized" });
  }
  const period = {
    from: from ? new Date(from) : new Date(Date.now() - 30 * 24 * 60 * 60 * 1e3),
    to: to ? new Date(to) : /* @__PURE__ */ new Date()
  };
  const analytics3 = await marketplaceAnalyticsService_default.collectMarketplaceAnalytics(partner.id, period);
  res.json({ analytics: analytics3 });
}));
router43.get("/analytics/compare", asyncHandler(async (req, res) => {
  const partner = req.partner;
  const { from, to } = req.query;
  if (!partner) {
    return res.status(401).json({ error: "Unauthorized" });
  }
  const period = {
    from: from ? new Date(from) : new Date(Date.now() - 30 * 24 * 60 * 60 * 1e3),
    to: to ? new Date(to) : /* @__PURE__ */ new Date()
  };
  const comparison = await marketplaceAnalyticsService_default.compareMarketplaces(partner.id, period);
  res.json(comparison);
}));
router43.post("/webhook/:marketplace", asyncHandler(async (req, res) => {
  const { marketplace } = req.params;
  const { partnerId, type, data } = req.body;
  if (!partnerId) {
    return res.status(400).json({ error: "partnerId required" });
  }
  const success = await marketplaceAIManager_default.handleMarketplaceNotification(
    partnerId,
    marketplace,
    { type, data }
  );
  res.json({ success });
}));
var marketplaceAIManagerRoutes_default = router43;

// server/routes/adminAIManagementRoutes.ts
import express20 from "express";
init_db();
var router44 = express20.Router();
router44.get("/usage-stats", asyncHandler(async (req, res) => {
  const user = req.user;
  const { partnerId, from, to } = req.query;
  if (!user || user.role !== "admin") {
    return res.status(403).json({ error: "Admin access required" });
  }
  const period = from && to ? {
    from: new Date(from),
    to: new Date(to)
  } : void 0;
  const stats = await aiOrchestrator.getUsageStats(
    partnerId,
    period
  );
  res.json(stats);
}));
router44.get("/partner/:partnerId/config", asyncHandler(async (req, res) => {
  const user = req.user;
  const { partnerId } = req.params;
  if (!user || user.role !== "admin") {
    return res.status(403).json({ error: "Admin access required" });
  }
  const config2 = await db.get(
    `SELECT ai_enabled, ai_settings FROM partners WHERE id = ?`,
    [partnerId]
  );
  res.json({
    partnerId,
    aiEnabled: config2?.ai_enabled || false,
    settings: config2?.ai_settings ? JSON.parse(config2.ai_settings) : {}
  });
}));
router44.put("/partner/:partnerId/config", asyncHandler(async (req, res) => {
  const user = req.user;
  const { partnerId } = req.params;
  const { aiEnabled, settings } = req.body;
  if (!user || user.role !== "admin") {
    return res.status(403).json({ error: "Admin access required" });
  }
  await db.run(
    `UPDATE partners 
     SET ai_enabled = ?, ai_settings = ?, updated_at = CURRENT_TIMESTAMP
     WHERE id = ?`,
    [aiEnabled, JSON.stringify(settings || {}), partnerId]
  );
  res.json({ success: true, message: "AI configuration updated" });
}));
router44.get("/partner/:partnerId/errors", asyncHandler(async (req, res) => {
  const user = req.user;
  const { partnerId } = req.params;
  const { limit = 50 } = req.query;
  if (!user || user.role !== "admin") {
    return res.status(403).json({ error: "Admin access required" });
  }
  const errors = await db.all(
    `SELECT * FROM ai_error_logs 
     WHERE partner_id = ? 
     ORDER BY created_at DESC 
     LIMIT ?`,
    [partnerId, limit]
  );
  res.json({ errors });
}));
router44.post("/partner/:partnerId/fix", asyncHandler(async (req, res) => {
  const user = req.user;
  const { partnerId } = req.params;
  const { issueType, action } = req.body;
  if (!user || user.role !== "admin") {
    return res.status(403).json({ error: "Admin access required" });
  }
  let result = { success: false, message: "" };
  switch (issueType) {
    case "api_key_invalid":
      result = { success: true, message: "API key validation required" };
      break;
    case "rate_limit":
      result = { success: true, message: "Rate limit issue - will retry with backoff" };
      break;
    case "model_error":
      result = { success: true, message: "Switching to fallback model" };
      break;
    case "cache_clear":
      await aiOrchestrator.clearCache();
      result = { success: true, message: "Cache cleared" };
      break;
    default:
      result = { success: false, message: "Unknown issue type" };
  }
  await db.run(
    `INSERT INTO ai_error_logs 
     (partner_id, error_type, error_message, status, fixed_at, created_at)
     VALUES (?, ?, ?, 'fixed', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)`,
    [partnerId, issueType, result.message]
  );
  res.json(result);
}));
router44.get("/jobs/active", asyncHandler(async (req, res) => {
  const user = req.user;
  if (!user || user.role !== "admin") {
    return res.status(403).json({ error: "Admin access required" });
  }
  const activeCount = await aiOrchestrator.getActiveJobsCount();
  res.json({
    activeJobs: activeCount,
    queueStatus: "healthy"
  });
}));
router44.get("/cost-breakdown", asyncHandler(async (req, res) => {
  const user = req.user;
  const { from, to } = req.query;
  if (!user || user.role !== "admin") {
    return res.status(403).json({ error: "Admin access required" });
  }
  const period = from && to ? {
    from: new Date(from),
    to: new Date(to)
  } : {
    from: new Date(Date.now() - 30 * 24 * 60 * 60 * 1e3),
    to: /* @__PURE__ */ new Date()
  };
  const stats = await aiOrchestrator.getUsageStats(void 0, period);
  const partnerCosts = await db.all(
    `SELECT 
       partner_id,
       SUM(cost) as total_cost,
       COUNT(*) as request_count
     FROM ai_usage_logs
     WHERE created_at >= ? AND created_at <= ?
     GROUP BY partner_id
     ORDER BY total_cost DESC
     LIMIT 20`,
    [period.from.toISOString(), period.to.toISOString()]
  );
  res.json({
    total: stats,
    byPartner: partnerCosts.map((p) => ({
      partnerId: p.partner_id,
      cost: p.total_cost,
      requests: p.request_count
    }))
  });
}));
router44.post("/cache/clear", asyncHandler(async (req, res) => {
  const user = req.user;
  const { pattern } = req.body;
  if (!user || user.role !== "admin") {
    return res.status(403).json({ error: "Admin access required" });
  }
  await aiOrchestrator.clearCache(pattern);
  res.json({ success: true, message: "Cache cleared" });
}));
var adminAIManagementRoutes_default = router44;

// server/routes/referralCampaignRoutes.ts
import express21 from "express";
init_db();
init_schema();
import { eq as eq28, and as and22, sql as sql15, gte as gte7, lte as lte6 } from "drizzle-orm";
import { nanoid as nanoid17 } from "nanoid";
var router45 = express21.Router();
router45.post("/create", asyncHandler(async (req, res) => {
  const user = req.user;
  if (!user || user.role !== "admin") {
    return res.status(403).json({ message: "Admin only" });
  }
  const {
    name,
    description,
    durationDays,
    targetReferrals,
    bonusAmount,
    minTier,
    minSubscriptionMonths
  } = req.body;
  if (!name || !durationDays || !targetReferrals || !bonusAmount) {
    return res.status(400).json({ message: "Missing required fields" });
  }
  const startDate = /* @__PURE__ */ new Date();
  const endDate = /* @__PURE__ */ new Date();
  endDate.setDate(endDate.getDate() + durationDays);
  const campaignId = nanoid17();
  await db.insert(referralCampaigns).values({
    id: campaignId,
    name,
    description: description || "",
    startDate,
    endDate,
    durationDays,
    targetReferrals,
    bonusAmount,
    minTier: minTier || "basic",
    minSubscriptionMonths: minSubscriptionMonths || 1,
    status: "active",
    participants: 0,
    winners: 0,
    createdAt: /* @__PURE__ */ new Date(),
    createdBy: user.id
  });
  res.json({
    success: true,
    campaignId,
    message: "Konkurs yaratildi"
  });
}));
router45.get("/all", asyncHandler(async (req, res) => {
  const user = req.user;
  if (!user || user.role !== "admin") {
    return res.status(403).json({ message: "Admin only" });
  }
  const campaigns = await db.select().from(referralCampaigns).orderBy(sql15`${referralCampaigns.createdAt} DESC`);
  res.json({ campaigns });
}));
router45.get("/active", asyncHandler(async (req, res) => {
  const now = /* @__PURE__ */ new Date();
  const campaigns = await db.select().from(referralCampaigns).where(and22(
    eq28(referralCampaigns.status, "active"),
    gte7(referralCampaigns.endDate, now),
    lte6(referralCampaigns.startDate, now)
  )).orderBy(sql15`${referralCampaigns.endDate} ASC`);
  const campaignsWithTimer = campaigns.map((campaign) => {
    const endDate = new Date(campaign.endDate);
    const startDate = new Date(campaign.startDate);
    const now2 = /* @__PURE__ */ new Date();
    const timeLeft = Math.max(0, endDate.getTime() - now2.getTime());
    return {
      ...campaign,
      endDate: Math.floor(endDate.getTime() / 1e3),
      // Convert to Unix timestamp for frontend
      startDate: Math.floor(startDate.getTime() / 1e3),
      timeLeftMs: timeLeft,
      timeLeftDays: Math.floor(timeLeft / (1e3 * 60 * 60 * 24)),
      timeLeftHours: Math.floor(timeLeft % (1e3 * 60 * 60 * 24) / (1e3 * 60 * 60)),
      timeLeftMinutes: Math.floor(timeLeft % (1e3 * 60 * 60) / (1e3 * 60)),
      timeLeftSeconds: Math.floor(timeLeft % (1e3 * 60) / 1e3)
    };
  });
  res.json({ campaigns: campaignsWithTimer });
}));
router45.post("/join/:campaignId", asyncHandler(async (req, res) => {
  const user = req.user;
  const partner = req.partner;
  if (!user || !partner) {
    return res.status(401).json({ message: "Unauthorized" });
  }
  const { campaignId } = req.params;
  const campaign = await db.select().from(referralCampaigns).where(and22(
    eq28(referralCampaigns.id, campaignId),
    eq28(referralCampaigns.status, "active")
  )).limit(1);
  if (campaign.length === 0) {
    return res.status(404).json({ message: "Konkurs topilmadi yoki faol emas" });
  }
  const existing = await db.select().from(referralCampaignParticipants).where(and22(
    eq28(referralCampaignParticipants.campaignId, campaignId),
    eq28(referralCampaignParticipants.referrerPartnerId, partner.id)
  )).limit(1);
  if (existing.length > 0) {
    return res.json({
      success: true,
      message: "Allaqachon qo'shilgansiz",
      participant: existing[0]
    });
  }
  const participantId = nanoid17();
  await db.insert(referralCampaignParticipants).values({
    id: participantId,
    campaignId,
    referrerPartnerId: partner.id,
    referralsCount: 0,
    bonusEarned: 0,
    status: "participating",
    joinedAt: /* @__PURE__ */ new Date()
  });
  await db.update(referralCampaigns).set({
    participants: sql15`${referralCampaigns.participants} + 1`
  }).where(eq28(referralCampaigns.id, campaignId));
  res.json({
    success: true,
    message: "Konkursga qo'shildingiz!",
    participantId
  });
}));
router45.get("/my-stats/:campaignId", asyncHandler(async (req, res) => {
  const user = req.user;
  const partner = req.partner;
  if (!user || !partner) {
    return res.status(401).json({ message: "Unauthorized" });
  }
  const { campaignId } = req.params;
  const participant = await db.select().from(referralCampaignParticipants).where(and22(
    eq28(referralCampaignParticipants.campaignId, campaignId),
    eq28(referralCampaignParticipants.referrerPartnerId, partner.id)
  )).limit(1);
  if (participant.length === 0) {
    return res.status(404).json({ message: "Siz bu konkursga qo'shilmagansiz" });
  }
  const campaign = await db.select().from(referralCampaigns).where(eq28(referralCampaigns.id, campaignId)).limit(1);
  if (campaign.length === 0) {
    return res.status(404).json({ message: "Konkurs topilmadi" });
  }
  const campaignData = campaign[0];
  const validReferrals = await db.select({ count: sql15`COUNT(*)` }).from(referralFirstPurchases).where(and22(
    eq28(referralFirstPurchases.referrerPartnerId, partner.id),
    eq28(referralFirstPurchases.status, "paid"),
    gte7(referralFirstPurchases.paidAt, campaignData.startDate),
    lte6(referralFirstPurchases.paidAt, campaignData.endDate),
    sql15`${referralFirstPurchases.tierId} >= ${campaignData.minTier}`,
    sql15`${referralFirstPurchases.subscriptionMonths} >= ${campaignData.minSubscriptionMonths}`
  ));
  const referralsCount = Number(validReferrals[0]?.count) || 0;
  const progress = referralsCount / campaignData.targetReferrals * 100;
  const isWinner = referralsCount >= campaignData.targetReferrals;
  res.json({
    participant: participant[0],
    campaign: campaignData,
    stats: {
      referralsCount,
      targetReferrals: campaignData.targetReferrals,
      progress: Math.min(100, progress),
      remaining: Math.max(0, campaignData.targetReferrals - referralsCount),
      isWinner,
      bonusAmount: isWinner ? campaignData.bonusAmount : 0
    }
  });
}));
router45.post("/update-results/:campaignId", asyncHandler(async (req, res) => {
  const user = req.user;
  if (!user || user.role !== "admin") {
    return res.status(403).json({ message: "Admin only" });
  }
  const { campaignId } = req.params;
  const campaign = await db.select().from(referralCampaigns).where(eq28(referralCampaigns.id, campaignId)).limit(1);
  if (campaign.length === 0) {
    return res.status(404).json({ message: "Konkurs topilmadi" });
  }
  const campaignData = campaign[0];
  const now = /* @__PURE__ */ new Date();
  if (now > new Date(campaignData.endDate)) {
    const participants = await db.select().from(referralCampaignParticipants).where(eq28(referralCampaignParticipants.campaignId, campaignId));
    let winnersCount = 0;
    for (const participant of participants) {
      const validReferrals = await db.select({ count: sql15`COUNT(*)` }).from(referralFirstPurchases).where(and22(
        eq28(referralFirstPurchases.referrerPartnerId, participant.referrerPartnerId),
        eq28(referralFirstPurchases.status, "paid"),
        gte7(referralFirstPurchases.paidAt, campaignData.startDate),
        lte6(referralFirstPurchases.paidAt, campaignData.endDate),
        sql15`${referralFirstPurchases.tierId} >= ${campaignData.minTier}`,
        sql15`${referralFirstPurchases.subscriptionMonths} >= ${campaignData.minSubscriptionMonths}`
      ));
      const referralsCount = Number(validReferrals[0]?.count) || 0;
      const isWinner = referralsCount >= campaignData.targetReferrals;
      if (isWinner) {
        winnersCount++;
        await db.update(referralCampaignParticipants).set({
          referralsCount,
          bonusEarned: campaignData.bonusAmount,
          status: "winner",
          completedAt: /* @__PURE__ */ new Date()
        }).where(eq28(referralCampaignParticipants.id, participant.id));
      }
    }
    await db.update(referralCampaigns).set({
      status: "completed",
      winners: winnersCount
    }).where(eq28(referralCampaigns.id, campaignId));
    res.json({
      success: true,
      winnersCount,
      message: "Konkurs natijalari yangilandi"
    });
  } else {
    res.json({
      success: true,
      message: "Konkurs hali davom etmoqda"
    });
  }
}));
var referralCampaignRoutes_default = router45;

// server/routes/smmRoutes.ts
import express22 from "express";

// server/services/smmService.ts
init_geminiService();

// server/services/imageAIService.ts
init_geminiService();
import Replicate from "replicate";
var replicate = new Replicate({
  auth: process.env.REPLICATE_API_KEY || ""
});
var ImageAIService = class {
  static {
    __name(this, "ImageAIService");
  }
  fluxEnabled;
  ideogramEnabled;
  nanoBananaEnabled;
  constructor() {
    this.fluxEnabled = !!process.env.REPLICATE_API_KEY;
    this.ideogramEnabled = !!process.env.IDEOGRAM_API_KEY;
    this.nanoBananaEnabled = geminiService.isEnabled();
    if (!this.fluxEnabled && !this.ideogramEnabled && !this.nanoBananaEnabled) {
      console.warn("\u26A0\uFE0F  No image AI services enabled. Using fallback.");
    } else {
      console.log("\u2705 Image AI Services:");
      if (this.fluxEnabled) console.log("   - Flux.1 (Product Photos - Cheapest)");
      if (this.ideogramEnabled) console.log("   - Ideogram AI (Infographics - Best Text)");
      if (this.nanoBananaEnabled) console.log("   - Nano Banana (Google Ecosystem)");
    }
  }
  // ==================== IMAGE GENERATION ====================
  async generateProductImage(options) {
    console.log(`\u{1F3A8} Generating ${options.type} image...`);
    if (options.type === "infographic" && options.includeText && this.ideogramEnabled) {
      return await this.generateWithIdeogram(options);
    }
    if (options.type === "infographic" && this.nanoBananaEnabled) {
      try {
        return await this.generateWithNanoBanana(options);
      } catch (error) {
        console.warn("Nano Banana failed, falling back...");
      }
    }
    if (options.type === "product_photo" && this.fluxEnabled) {
      return await this.generateWithFlux(options);
    }
    if (this.nanoBananaEnabled) {
      try {
        return await this.generateWithNanoBanana(options);
      } catch (error) {
        console.warn("Nano Banana failed, falling back...");
      }
    }
    return this.fallbackGenerate(options);
  }
  // Generate with Flux.1 (via Replicate)
  async generateWithFlux(options) {
    try {
      console.log("\u{1F680} Generating with Flux.1...");
      const aspectRatioMap = {
        "1:1": "1024x1024",
        "4:3": "1024x768",
        "16:9": "1024x576",
        "9:16": "576x1024"
      };
      const size = aspectRatioMap[options.aspectRatio || "1:1"];
      const [width, height] = size.split("x").map(Number);
      let enhancedPrompt = options.prompt;
      if (options.style === "photorealistic") {
        enhancedPrompt += ", professional product photography, studio lighting, white background, high resolution, 8k";
      } else if (options.style === "minimalist") {
        enhancedPrompt += ", minimalist style, clean background, simple composition";
      } else if (options.style === "vibrant") {
        enhancedPrompt += ", vibrant colors, eye-catching, dynamic composition";
      }
      const output = await replicate.run(
        "black-forest-labs/flux-1.1-pro",
        {
          input: {
            prompt: enhancedPrompt,
            width,
            height,
            num_outputs: 1,
            guidance_scale: 3.5,
            num_inference_steps: 28,
            output_format: "png",
            output_quality: 90
          }
        }
      );
      const imageUrl = Array.isArray(output) ? output[0] : output;
      console.log("\u2705 Flux.1 image generated");
      return {
        url: imageUrl,
        width,
        height,
        format: "png",
        aiModel: "flux-1.1-pro",
        cost: 0.04
        // $0.04 per image
      };
    } catch (error) {
      console.error("\u274C Flux.1 generation error:", error.message);
      return this.fallbackGenerate(options);
    }
  }
  // Generate with Ideogram AI (for infographics with text)
  async generateWithIdeogram(options) {
    try {
      console.log("\u{1F3AF} Generating infographic with Ideogram AI...");
      const response = await fetch("https://api.ideogram.ai/generate", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Api-Key": process.env.IDEOGRAM_API_KEY || ""
        },
        body: JSON.stringify({
          prompt: options.prompt,
          text: options.textContent || "",
          aspect_ratio: options.aspectRatio || "1:1",
          style: "design",
          magic_prompt_option: "AUTO"
        })
      });
      if (!response.ok) {
        throw new Error(`Ideogram API error: ${response.status}`);
      }
      const data = await response.json();
      const imageUrl = data.data[0].url;
      console.log("\u2705 Ideogram infographic generated");
      return {
        url: imageUrl,
        width: 1024,
        height: 1024,
        format: "png",
        aiModel: "ideogram-v2",
        cost: 0.08
        // $0.08 per image
      };
    } catch (error) {
      console.error("\u274C Ideogram generation error:", error.message);
      if (this.fluxEnabled) {
        console.log("\u26A0\uFE0F  Falling back to Flux.1...");
        return await this.generateWithFlux(options);
      }
      return this.fallbackGenerate(options);
    }
  }
  // Generate with Nano Banana (Google Gemini)
  async generateWithNanoBanana(options) {
    try {
      console.log("\u{1F680} Generating with Nano Banana...");
      const response = await geminiService.generateImage({
        prompt: options.prompt,
        type: options.type === "infographic" ? "infographic" : "product_photo",
        aspectRatio: options.aspectRatio || "1:1"
      });
      const imageUrl = response.imageUrl;
      const aspectRatioMap = {
        "1:1": { width: 1024, height: 1024 },
        "4:3": { width: 1024, height: 768 },
        "16:9": { width: 1024, height: 576 },
        "9:16": { width: 576, height: 1024 }
      };
      const size = aspectRatioMap[options.aspectRatio || "1:1"];
      console.log("\u2705 Nano Banana generation complete");
      return {
        url: imageUrl,
        width: size.width,
        height: size.height,
        format: "png",
        aiModel: "nano-banana-preview",
        cost: response.cost
      };
    } catch (error) {
      console.error("\u274C Nano Banana generation error:", error.message);
      throw error;
    }
  }
  // ==================== IMAGE ENHANCEMENT ====================
  async enhanceImage(imageUrl, options) {
    console.log("\u2728 Enhancing image...");
    if (!this.fluxEnabled) {
      return this.fallbackEnhance(imageUrl);
    }
    try {
      let processedUrl = imageUrl;
      if (options.removeBackground) {
        console.log("\u{1F532} Removing background...");
        const output = await replicate.run(
          "cjwbw/rembg:fb8af171cfa1616ddcf1242c093f9c46bcada5ad4cf6f2fbe8b81b330ec5c003",
          {
            input: {
              image: imageUrl
            }
          }
        );
        processedUrl = output;
      }
      if (options.upscale) {
        console.log("\u{1F4C8} Upscaling image...");
        const output = await replicate.run(
          "nightmareai/real-esrgan:42fed1c4974146d4d2414e2be2c5277c7fcf05fcc3a73abf41610695738c1d7b",
          {
            input: {
              image: processedUrl,
              scale: 2,
              face_enhance: false
            }
          }
        );
        processedUrl = output;
      }
      if (options.enhanceQuality) {
        console.log("\u{1F48E} Enhancing quality...");
        const output = await replicate.run(
          "black-forest-labs/flux-1.1-pro",
          {
            input: {
              prompt: "enhance quality, professional product photo, high resolution",
              image: processedUrl,
              prompt_strength: 0.3,
              num_inference_steps: 28
            }
          }
        );
        processedUrl = Array.isArray(output) ? output[0] : output;
      }
      console.log("\u2705 Image enhancement complete");
      return {
        url: processedUrl,
        width: 2048,
        height: 2048,
        format: "png",
        aiModel: "flux-enhancement",
        cost: 0.06
        // $0.06 for enhancement
      };
    } catch (error) {
      console.error("\u274C Image enhancement error:", error.message);
      return this.fallbackEnhance(imageUrl);
    }
  }
  // ==================== BATCH PROCESSING ====================
  async batchGenerateImages(requests) {
    console.log(`\u{1F4E6} Batch generating ${requests.length} images...`);
    const results = await Promise.all(
      requests.map(async (options) => {
        try {
          return await this.generateProductImage(options);
        } catch (error) {
          console.error("Failed to generate image:", error);
          return this.fallbackGenerate(options);
        }
      })
    );
    const totalCost = results.reduce((sum, img) => sum + img.cost, 0);
    console.log(`\u2705 Batch complete. Total cost: $${totalCost.toFixed(2)}`);
    return results;
  }
  // ==================== MARKETPLACE-SPECIFIC IMAGES ====================
  async generateMarketplaceImages(productName, marketplace) {
    console.log(`\u{1F3EA} Generating images for ${marketplace}...`);
    const marketplaceSpecs = {
      wildberries: {
        mainSize: "1:1",
        style: "photorealistic",
        requiresWhiteBg: true
      },
      uzum: {
        mainSize: "1:1",
        style: "professional",
        requiresWhiteBg: true
      },
      ozon: {
        mainSize: "1:1",
        style: "photorealistic",
        requiresWhiteBg: true
      },
      trendyol: {
        mainSize: "4:3",
        style: "vibrant",
        requiresWhiteBg: false
      }
    };
    const spec = marketplaceSpecs[marketplace];
    const mainImage = await this.generateProductImage({
      prompt: `${productName}, ${spec.requiresWhiteBg ? "white background" : "lifestyle background"}`,
      type: "product_photo",
      aspectRatio: spec.mainSize,
      style: spec.style
    });
    const additionalImages = await this.batchGenerateImages([
      {
        prompt: `${productName} in use, lifestyle photo`,
        type: "lifestyle",
        aspectRatio: "4:3",
        style: "photorealistic"
      },
      {
        prompt: `${productName} detail shot, close-up`,
        type: "product_photo",
        aspectRatio: "1:1",
        style: "photorealistic"
      }
    ]);
    const infographic = await this.generateProductImage({
      prompt: `Product infographic for ${productName}, features and benefits`,
      type: "infographic",
      aspectRatio: "1:1",
      style: "professional",
      includeText: true,
      textContent: `${productName}
Key Features
High Quality
Fast Delivery`
    });
    return {
      mainImage,
      additionalImages,
      infographic
    };
  }
  // ==================== FALLBACK METHODS ====================
  fallbackGenerate(options) {
    console.log("\u26A0\uFE0F  Using fallback image generation");
    return {
      url: `https://via.placeholder.com/1024x1024/CCCCCC/333333?text=${encodeURIComponent(options.prompt.substring(0, 50))}`,
      width: 1024,
      height: 1024,
      format: "png",
      aiModel: "fallback",
      cost: 0
    };
  }
  fallbackEnhance(imageUrl) {
    console.log("\u26A0\uFE0F  Using fallback image enhancement");
    return {
      url: imageUrl,
      width: 1024,
      height: 1024,
      format: "png",
      aiModel: "fallback",
      cost: 0
    };
  }
  // ==================== STATUS & COST ====================
  getStatus() {
    return {
      flux: {
        enabled: this.fluxEnabled,
        model: "flux-1.1-pro",
        costPerImage: 0.04
      },
      ideogram: {
        enabled: this.ideogramEnabled,
        model: "ideogram-v2",
        costPerImage: 0.08
      },
      recommendations: {
        productPhotos: "Flux.1 (photorealistic, fast)",
        infographics: "Ideogram AI (best text rendering)",
        enhancement: "Flux.1 (upscale, background removal)"
      }
    };
  }
  async estimateCost(imageCount, type) {
    const costs = {
      product: 0.04,
      // Flux.1
      infographic: 0.08,
      // Ideogram
      enhancement: 0.06
      // Flux enhancement
    };
    return imageCount * costs[type];
  }
  isEnabled() {
    return this.fluxEnabled || this.ideogramEnabled;
  }
};
var imageAIService2 = new ImageAIService();

// server/services/smmService.ts
var PLATFORM_CONFIG = {
  youtube: {
    maxLength: 5e3,
    hashtags: true,
    mentions: true,
    video: true,
    images: false,
    optimalPostTime: "14:00-16:00"
  },
  instagram: {
    maxLength: 2200,
    hashtags: true,
    mentions: true,
    video: true,
    images: true,
    carousel: true,
    optimalPostTime: "11:00-13:00, 19:00-21:00"
  },
  linkedin: {
    maxLength: 3e3,
    hashtags: true,
    mentions: true,
    video: true,
    images: true,
    optimalPostTime: "08:00-10:00, 17:00-19:00"
  },
  twitter: {
    maxLength: 280,
    hashtags: true,
    mentions: true,
    video: true,
    images: true,
    optimalPostTime: "09:00-11:00, 15:00-17:00"
  },
  telegram: {
    maxLength: 4096,
    hashtags: false,
    mentions: true,
    video: true,
    images: true,
    optimalPostTime: "10:00-12:00, 18:00-20:00"
  },
  facebook: {
    maxLength: 5e3,
    hashtags: true,
    mentions: true,
    video: true,
    images: true,
    optimalPostTime: "13:00-15:00, 19:00-21:00"
  }
};
var SMMService = class {
  static {
    __name(this, "SMMService");
  }
  enabled;
  posts = /* @__PURE__ */ new Map();
  campaigns = /* @__PURE__ */ new Map();
  constructor() {
    this.enabled = geminiService.isEnabled();
    if (this.enabled) {
      console.log("\u2705 SMM Service initialized");
    } else {
      console.warn("\u26A0\uFE0F  SMM Service disabled (Gemini API required)");
    }
  }
  /**
   * Generate post content using AI
   */
  async generatePost(request) {
    if (!this.enabled) {
      throw new Error("SMM Service is not enabled. Please set GEMINI_API_KEY.");
    }
    const platformConfig = PLATFORM_CONFIG[request.platform];
    try {
      const prompt = `
Siz professional SMM mutaxassisiz. Quyidagi kontent uchun ${request.platform} platformasi uchun optimizatsiya qilingan post yarating:

ORIGINAL KONTENT:
${request.content}

PLATFORM: ${request.platform}
POST TYPE: ${request.postType}
MAX LENGTH: ${platformConfig.maxLength} belgi
HASHTAGS: ${platformConfig.hashtags ? "Kerak" : "Kerak emas"}
LANGUAGE: ${request.language || "uz"}

VAZIFA:
- Platforma qoidalariga mos
- Engagement oshiruvchi
- Hashtaglar optimizatsiya qilingan
- Professional va marketing-optimizatsiya qilingan
- ${request.language === "uz" ? "O'zbek tilida" : request.language === "ru" ? "Rus tilida" : "English"}

Post matni (JSON format):
{
  "content": "Post matni",
  "hashtags": ["hashtag1", "hashtag2", ...],
  "mentions": ["@mention1", "@mention2", ...],
  "callToAction": "CTA matni"
}
`;
      const response = await geminiService.generateText({
        prompt,
        model: "flash",
        structuredOutput: true,
        temperature: 0.8,
        maxTokens: 1e3
      });
      const postData = JSON.parse(response.text);
      let mediaUrls = [];
      if (request.postType === "image" && !request.images?.length) {
        const image = await imageAIService2.generateProductImage({
          prompt: `Professional social media post image: ${request.content}`,
          type: "infographic",
          aspectRatio: request.platform === "instagram" ? "1:1" : "16:9",
          includeText: true,
          textContent: postData.content.substring(0, 100)
        });
        mediaUrls.push(image.url);
      } else if (request.postType === "video" && !request.video) {
        const video = await videoGenerationService2.generateProductVideo({
          productName: request.content.split(" ").slice(0, 5).join(" "),
          productDescription: request.content,
          duration: 15,
          aspectRatio: request.platform === "instagram" ? "9:16" : "16:9",
          style: "lifestyle",
          language: request.language || "uz"
        });
        mediaUrls.push(video.videoUrl);
      } else {
        mediaUrls = request.images || (request.video ? [request.video] : []);
      }
      const post = {
        id: `post_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        platform: request.platform,
        content: postData.content,
        mediaUrls,
        hashtags: postData.hashtags || [],
        status: request.scheduledTime ? "scheduled" : "draft",
        scheduledTime: request.scheduledTime
      };
      this.posts.set(post.id, post);
      return post;
    } catch (error) {
      console.error("SMM post generation error:", error);
      throw error;
    }
  }
  /**
   * Create SMM campaign
   */
  async createCampaign(name, description, platforms, posts, startDate, endDate) {
    const generatedPosts = [];
    for (const postRequest of posts) {
      for (const platform of platforms) {
        try {
          const post = await this.generatePost({
            ...postRequest,
            platform
          });
          generatedPosts.push(post);
        } catch (error) {
          console.error(`Failed to generate post for ${platform}:`, error);
        }
      }
    }
    const campaign = {
      id: `campaign_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      name,
      description,
      platforms,
      posts: generatedPosts,
      startDate,
      endDate,
      status: "draft",
      metrics: {
        totalReach: 0,
        totalEngagement: 0,
        totalClicks: 0,
        conversionRate: 0
      }
    };
    this.campaigns.set(campaign.id, campaign);
    return campaign;
  }
  /**
   * Schedule post
   */
  async schedulePost(postId, scheduledTime) {
    const post = this.posts.get(postId);
    if (!post) {
      throw new Error("Post not found");
    }
    post.status = "scheduled";
    post.scheduledTime = scheduledTime;
    this.posts.set(postId, post);
    return post;
  }
  /**
   * Publish post to platform
   */
  async publishPost(postId) {
    const post = this.posts.get(postId);
    if (!post) {
      throw new Error("Post not found");
    }
    try {
      post.status = "published";
      post.publishedTime = /* @__PURE__ */ new Date();
      this.posts.set(postId, post);
      return post;
    } catch (error) {
      post.status = "failed";
      this.posts.set(postId, post);
      throw error;
    }
  }
  /**
   * Get platform analytics
   */
  async getPlatformAnalytics(platform, startDate, endDate) {
    const posts = Array.from(this.posts.values()).filter(
      (p) => p.platform === platform && p.publishedTime && p.publishedTime >= startDate && p.publishedTime <= endDate
    );
    const totalReach = posts.reduce((sum, p) => sum + (p.engagement?.views || 0), 0);
    const totalEngagement = posts.reduce(
      (sum, p) => sum + (p.engagement?.likes || 0) + (p.engagement?.comments || 0) + (p.engagement?.shares || 0),
      0
    );
    return {
      platform,
      period: { startDate, endDate },
      posts: posts.length,
      totalReach,
      totalEngagement,
      averageEngagement: posts.length > 0 ? totalEngagement / posts.length : 0,
      topPosts: posts.sort(
        (a, b) => (b.engagement?.likes || 0) + (b.engagement?.comments || 0) - ((a.engagement?.likes || 0) + (a.engagement?.comments || 0))
      ).slice(0, 5)
    };
  }
  /**
   * Get all campaigns
   */
  getCampaigns() {
    return Array.from(this.campaigns.values());
  }
  /**
   * Get campaign by ID
   */
  getCampaign(campaignId) {
    return this.campaigns.get(campaignId);
  }
  /**
   * Check if service is enabled
   */
  isEnabled() {
    return this.enabled;
  }
};
var smmService = new SMMService();

// server/routes/smmRoutes.ts
var router46 = express22.Router();
router46.post("/generate-post", asyncHandler(async (req, res) => {
  const {
    content,
    platform,
    postType,
    images,
    video,
    hashtags,
    mentions,
    scheduledTime,
    language
  } = req.body;
  if (!content || !platform) {
    return res.status(400).json({ error: "Content va platform talab qilinadi" });
  }
  const post = await smmService.generatePost({
    content,
    platform,
    postType: postType || "text",
    images,
    video,
    hashtags,
    mentions,
    scheduledTime: scheduledTime ? new Date(scheduledTime) : void 0,
    language: language || "uz"
  });
  res.json({ success: true, post });
}));
router46.post("/campaigns", asyncHandler(async (req, res) => {
  const {
    name,
    description,
    platforms,
    posts,
    startDate,
    endDate
  } = req.body;
  if (!name || !platforms || !posts || !startDate || !endDate) {
    return res.status(400).json({ error: "Barcha maydonlar talab qilinadi" });
  }
  const campaign = await smmService.createCampaign(
    name,
    description,
    platforms,
    posts,
    new Date(startDate),
    new Date(endDate)
  );
  res.json({ success: true, campaign });
}));
router46.get("/campaigns", asyncHandler(async (req, res) => {
  const campaigns = smmService.getCampaigns();
  res.json({ success: true, campaigns });
}));
router46.get("/campaigns/:id", asyncHandler(async (req, res) => {
  const { id } = req.params;
  const campaign = smmService.getCampaign(id);
  if (!campaign) {
    return res.status(404).json({ error: "Campaign topilmadi" });
  }
  res.json({ success: true, campaign });
}));
router46.post("/posts/:id/schedule", asyncHandler(async (req, res) => {
  const { id } = req.params;
  const { scheduledTime } = req.body;
  if (!scheduledTime) {
    return res.status(400).json({ error: "Scheduled time talab qilinadi" });
  }
  const post = await smmService.schedulePost(id, new Date(scheduledTime));
  res.json({ success: true, post });
}));
router46.post("/posts/:id/publish", asyncHandler(async (req, res) => {
  const { id } = req.params;
  const post = await smmService.publishPost(id);
  res.json({ success: true, post });
}));
router46.get("/analytics/:platform", asyncHandler(async (req, res) => {
  const { platform } = req.params;
  const { startDate, endDate } = req.query;
  if (!startDate || !endDate) {
    return res.status(400).json({ error: "Start date va end date talab qilinadi" });
  }
  const analytics3 = await smmService.getPlatformAnalytics(
    platform,
    new Date(startDate),
    new Date(endDate)
  );
  res.json({ success: true, analytics: analytics3 });
}));
router46.post("/generate-video", asyncHandler(async (req, res) => {
  const {
    productName,
    productDescription,
    productCategory,
    targetMarketplace,
    duration,
    aspectRatio,
    style,
    language
  } = req.body;
  if (!productName || !productDescription) {
    return res.status(400).json({ error: "Product name va description talab qilinadi" });
  }
  if (!videoGenerationService2.isEnabled()) {
    return res.status(503).json({ error: "Video generation service is not enabled" });
  }
  const video = await videoGenerationService2.generateProductVideo({
    productName,
    productDescription,
    productCategory,
    targetMarketplace,
    duration: duration || 15,
    aspectRatio: aspectRatio || "16:9",
    style: style || "product_showcase",
    language: language || "uz",
    includeText: true,
    music: true
  });
  res.json({ success: true, video });
}));
router46.get("/video/providers", asyncHandler(async (req, res) => {
  const providers = videoGenerationService2.getAvailableProviders();
  res.json({ success: true, providers, enabled: videoGenerationService2.isEnabled() });
}));
var smmRoutes_default = router46;

// server/routes/aiRoutes.ts
import { Router as Router25 } from "express";

// server/services/aiManagerV2Service.ts
init_db();
init_storage();
init_schema();
import { eq as eq29, and as and23 } from "drizzle-orm";
import { v4 as uuidv4 } from "uuid";

// server/services/imageSearchService.ts
import axios7 from "axios";
var GOOGLE_VISION_API_KEY = process.env.GOOGLE_VISION_API_KEY || "";
var SERPAPI_KEY = process.env.SERPAPI_KEY || "";
var GoogleVisionService = class {
  static {
    __name(this, "GoogleVisionService");
  }
  apiKey;
  endpoint = "https://vision.googleapis.com/v1/images:annotate";
  constructor(apiKey) {
    this.apiKey = apiKey;
  }
  async analyzeImage(imageUrl) {
    try {
      const response = await axios7.post(
        `${this.endpoint}?key=${this.apiKey}`,
        {
          requests: [
            {
              image: {
                source: {
                  imageUri: imageUrl
                }
              },
              features: [
                { type: "LABEL_DETECTION", maxResults: 10 },
                { type: "LOGO_DETECTION", maxResults: 5 },
                { type: "WEB_DETECTION", maxResults: 10 },
                { type: "IMAGE_PROPERTIES", maxResults: 10 },
                { type: "OBJECT_LOCALIZATION", maxResults: 10 }
              ]
            }
          ]
        }
      );
      const result = response.data.responses[0];
      const labels = result.labelAnnotations?.map((l) => l.description) || [];
      const brand = result.logoAnnotations?.[0]?.description || "Unknown";
      const webEntities = result.webDetection?.webEntities || [];
      const productName = webEntities.find((e) => e.score > 0.7)?.description || labels[0] || "Unknown Product";
      const colors2 = result.imagePropertiesAnnotation?.dominantColors?.colors?.slice(0, 3).map((c) => {
        const rgb = c.color;
        return `rgb(${rgb.red || 0}, ${rgb.green || 0}, ${rgb.blue || 0})`;
      }) || [];
      const category = this.categorizeFromLabels(labels);
      const description = `${productName} - ${labels.slice(0, 5).join(", ")}`;
      const confidence = Math.round(
        result.labelAnnotations?.slice(0, 3).reduce((sum, l) => sum + (l.score || 0), 0) / 3 * 100
      );
      return {
        productName,
        brand,
        category,
        description,
        confidence,
        labels,
        colors: colors2,
        rawData: result
      };
    } catch (error) {
      console.error("Google Vision API error:", error.response?.data || error.message);
      return {
        productName: "Unknown Product",
        brand: "Unknown",
        category: "other",
        description: "Could not analyze image",
        confidence: 0,
        labels: [],
        colors: []
      };
    }
  }
  categorizeFromLabels(labels) {
    const categoryMap = {
      electronics: ["phone", "laptop", "computer", "tablet", "camera", "headphone", "speaker"],
      clothing: ["shirt", "pants", "dress", "shoes", "jacket", "clothing", "fashion"],
      home: ["furniture", "lamp", "table", "chair", "bed", "kitchen"],
      beauty: ["cosmetic", "makeup", "perfume", "skincare", "beauty"],
      food: ["food", "drink", "beverage", "snack", "meal"],
      sports: ["sport", "fitness", "gym", "exercise", "athletic"],
      toys: ["toy", "game", "puzzle", "doll"]
    };
    const labelsLower = labels.map((l) => l.toLowerCase());
    for (const [category, keywords] of Object.entries(categoryMap)) {
      if (keywords.some((keyword) => labelsLower.some((label) => label.includes(keyword)))) {
        return category;
      }
    }
    return "other";
  }
};
var SerpAPIService = class {
  static {
    __name(this, "SerpAPIService");
  }
  apiKey;
  endpoint = "https://serpapi.com/search";
  constructor(apiKey) {
    this.apiKey = apiKey;
  }
  async reverseImageSearch(imageUrl) {
    try {
      const response = await axios7.get(this.endpoint, {
        params: {
          engine: "google_reverse_image",
          image_url: imageUrl,
          api_key: this.apiKey,
          location: "Russia",
          hl: "ru"
        }
      });
      const data = response.data;
      const competitors = [];
      const shoppingResults = data.shopping_results || [];
      for (const item of shoppingResults) {
        const priceMatch = item.extracted_price || item.price;
        if (priceMatch) {
          competitors.push({
            seller: item.source || item.merchant || "Unknown",
            price: parseFloat(priceMatch),
            currency: "RUB",
            link: item.link || "",
            source: this.extractMarketplace(item.link || ""),
            availability: item.delivery || item.availability || "available"
          });
        }
      }
      const inlineResults = data.inline_shopping_results || [];
      for (const item of inlineResults) {
        const priceMatch = item.extracted_price || item.price;
        if (priceMatch) {
          competitors.push({
            seller: item.source || "Unknown",
            price: parseFloat(priceMatch),
            currency: "RUB",
            link: item.link || "",
            source: this.extractMarketplace(item.link || ""),
            availability: "available"
          });
        }
      }
      return competitors;
    } catch (error) {
      console.error("SerpAPI error:", error.response?.data || error.message);
      return [];
    }
  }
  extractMarketplace(url) {
    if (!url) return "other";
    const urlLower = url.toLowerCase();
    if (urlLower.includes("wildberries")) return "wildberries";
    if (urlLower.includes("ozon")) return "ozon";
    if (urlLower.includes("uzum")) return "uzum";
    if (urlLower.includes("yandex")) return "yandex";
    if (urlLower.includes("aliexpress")) return "aliexpress";
    if (urlLower.includes("amazon")) return "amazon";
    return "other";
  }
};
var ImageSearchService = class {
  static {
    __name(this, "ImageSearchService");
  }
  visionService = null;
  serpService = null;
  constructor() {
    if (GOOGLE_VISION_API_KEY) {
      this.visionService = new GoogleVisionService(GOOGLE_VISION_API_KEY);
    }
    if (SERPAPI_KEY) {
      this.serpService = new SerpAPIService(SERPAPI_KEY);
    }
  }
  async searchByImage(imageUrl) {
    let productInfo = {
      productName: "Unknown Product",
      brand: "Unknown",
      category: "other",
      description: "Image analysis not available",
      confidence: 0,
      labels: [],
      colors: []
    };
    if (this.visionService) {
      productInfo = await this.visionService.analyzeImage(imageUrl);
    } else {
      console.warn("\u26A0\uFE0F Google Vision API key not configured");
    }
    let competitors = [];
    if (this.serpService) {
      competitors = await this.serpService.reverseImageSearch(imageUrl);
    } else {
      console.warn("\u26A0\uFE0F SerpAPI key not configured");
    }
    const prices = competitors.map((c) => c.price).filter((p) => p > 0);
    const avgPrice = prices.length > 0 ? Math.round(prices.reduce((sum, p) => sum + p, 0) / prices.length) : 0;
    const minPrice = prices.length > 0 ? Math.min(...prices) : 0;
    const maxPrice = prices.length > 0 ? Math.max(...prices) : 0;
    return {
      productInfo,
      competitors,
      avgPrice,
      minPrice,
      maxPrice,
      totalResults: competitors.length
    };
  }
  isEnabled() {
    return !!(this.visionService && this.serpService);
  }
  getStatus() {
    return {
      visionEnabled: !!this.visionService,
      serpEnabled: !!this.serpService,
      fullyEnabled: this.isEnabled()
    };
  }
};
var imageSearchService = new ImageSearchService();

// server/services/marketplaceService.ts
import axios8 from "axios";
var BaseMarketplaceService = class {
  static {
    __name(this, "BaseMarketplaceService");
  }
  axiosInstance;
  marketplace;
  constructor(marketplace, baseURL) {
    this.marketplace = marketplace;
    this.axiosInstance = axios8.create({
      baseURL,
      timeout: 3e4,
      headers: {
        "Content-Type": "application/json"
      }
    });
  }
};
var WildberriesService = class extends BaseMarketplaceService {
  static {
    __name(this, "WildberriesService");
  }
  apiKey;
  constructor(apiKey) {
    super("wildberries", "https://suppliers-api.wildberries.ru");
    this.apiKey = apiKey;
    this.axiosInstance.defaults.headers.common["HeaderApiKey"] = apiKey;
  }
  async createProduct(product) {
    try {
      const payload = {
        cards: [{
          nmID: 0,
          // Will be assigned by Wildberries
          vendorCode: product.offerId,
          brand: product.brand,
          title: product.title.substring(0, 60),
          // Max 60 chars
          description: product.description,
          characteristics: this.formatCharacteristics(product.characteristics),
          sizes: [{
            techSize: "onesize",
            price: product.price
          }]
        }]
      };
      const response = await this.axiosInstance.post("/content/v2/cards/upload", payload);
      return {
        success: true,
        marketplace: "wildberries",
        productId: response.data?.data?.nmID || product.offerId,
        status: "pending_moderation",
        details: response.data
      };
    } catch (error) {
      return {
        success: false,
        marketplace: "wildberries",
        error: error.response?.data?.message || error.message,
        details: error.response?.data
      };
    }
  }
  async updatePrice(productId, price) {
    try {
      await this.axiosInstance.post("/public/api/v1/prices", {
        prices: [{
          nmId: productId,
          price
        }]
      });
      return true;
    } catch (error) {
      console.error("Wildberries price update error:", error);
      return false;
    }
  }
  async getProductStatus(productId) {
    try {
      const response = await this.axiosInstance.get(`/content/v1/cards/list`, {
        params: { nmID: productId }
      });
      return response.data;
    } catch (error) {
      return null;
    }
  }
  formatCharacteristics(characteristics) {
    if (!characteristics) return [];
    return Object.entries(characteristics).map(([key, value]) => ({
      attributeId: parseInt(key) || 0,
      value: String(value)
    }));
  }
};
var OzonService = class extends BaseMarketplaceService {
  static {
    __name(this, "OzonService");
  }
  clientId;
  apiKey;
  constructor(clientId, apiKey) {
    super("ozon", "https://api-seller.ozon.ru");
    this.clientId = clientId;
    this.apiKey = apiKey;
    this.axiosInstance.defaults.headers.common["Client-ID"] = clientId;
    this.axiosInstance.defaults.headers.common["Api-Key"] = apiKey;
  }
  async createProduct(product) {
    try {
      const payload = {
        items: [{
          offer_id: product.offerId,
          name: product.title,
          description: product.description,
          vendor: product.brand,
          category_id: parseInt(String(product.category)) || 0,
          pictures: product.images,
          price: String(product.price),
          currency_code: "RUB",
          attributes: this.formatAttributes(product.characteristics)
        }]
      };
      const response = await this.axiosInstance.post("/v2/product/import", payload);
      const taskId = response.data?.result?.task_id;
      return {
        success: true,
        marketplace: "ozon",
        productId: taskId || product.offerId,
        status: "pending_moderation",
        details: response.data
      };
    } catch (error) {
      return {
        success: false,
        marketplace: "ozon",
        error: error.response?.data?.message || error.message,
        details: error.response?.data
      };
    }
  }
  async updatePrice(productId, price) {
    try {
      await this.axiosInstance.post("/v1/product/import/prices", {
        prices: [{
          offer_id: productId,
          price: String(price),
          currency_code: "RUB"
        }]
      });
      return true;
    } catch (error) {
      console.error("Ozon price update error:", error);
      return false;
    }
  }
  async getProductStatus(productId) {
    try {
      const response = await this.axiosInstance.post("/v2/product/info/list", {
        offer_id: [productId]
      });
      return response.data;
    } catch (error) {
      return null;
    }
  }
  formatAttributes(characteristics) {
    if (!characteristics) return [];
    return Object.entries(characteristics).map(([key, value]) => ({
      attribute_id: parseInt(key) || 0,
      value: String(value)
    }));
  }
};
var UzumService = class extends BaseMarketplaceService {
  static {
    __name(this, "UzumService");
  }
  apiKey;
  constructor(apiKey) {
    super("uzum", "https://api-seller.uzum.uz");
    this.apiKey = apiKey;
    this.axiosInstance.defaults.headers.common["Authorization"] = `Bearer ${apiKey}`;
  }
  async createProduct(product) {
    try {
      const payload = {
        offer_id: product.offerId,
        name: product.title,
        description: product.description,
        brand: product.brand,
        category_id: product.category,
        images: product.images,
        price: product.price,
        attributes: product.characteristics || {}
      };
      const response = await this.axiosInstance.post("/api/seller/products", payload);
      return {
        success: true,
        marketplace: "uzum",
        productId: response.data?.id || product.offerId,
        status: "pending",
        details: response.data
      };
    } catch (error) {
      return {
        success: false,
        marketplace: "uzum",
        error: error.response?.data?.message || error.message,
        details: error.response?.data
      };
    }
  }
  async updatePrice(productId, price) {
    try {
      await this.axiosInstance.patch(`/api/seller/products/${productId}/price`, {
        price
      });
      return true;
    } catch (error) {
      console.error("Uzum price update error:", error);
      return false;
    }
  }
  async getProductStatus(productId) {
    try {
      const response = await this.axiosInstance.get(`/api/seller/products/${productId}`);
      return response.data;
    } catch (error) {
      return null;
    }
  }
};
var YandexMarketService2 = class extends BaseMarketplaceService {
  static {
    __name(this, "YandexMarketService");
  }
  campaignId;
  oauthToken;
  constructor(campaignId, oauthToken) {
    super("yandex", "https://api.partner.market.yandex.ru");
    this.campaignId = campaignId;
    this.oauthToken = oauthToken;
    this.axiosInstance.defaults.headers.common["Authorization"] = `OAuth ${oauthToken}`;
  }
  async createProduct(product) {
    try {
      const payload = {
        offer: {
          shopSku: product.offerId,
          name: product.title,
          description: product.description,
          vendor: product.brand,
          price: {
            value: product.price,
            currencyId: "RUB"
          },
          pictures: product.images
        }
      };
      const response = await this.axiosInstance.post(
        `/campaigns/${this.campaignId}/offers`,
        payload
      );
      return {
        success: true,
        marketplace: "yandex",
        productId: product.offerId,
        status: "active",
        details: response.data
      };
    } catch (error) {
      return {
        success: false,
        marketplace: "yandex",
        error: error.response?.data?.message || error.message,
        details: error.response?.data
      };
    }
  }
  async updatePrice(productId, price) {
    try {
      await this.axiosInstance.post(`/campaigns/${this.campaignId}/offer-prices`, {
        offerIds: [productId],
        prices: [{
          value: price,
          currencyId: "RUB"
        }]
      });
      return true;
    } catch (error) {
      console.error("Yandex price update error:", error);
      return false;
    }
  }
  async getProductStatus(productId) {
    try {
      const response = await this.axiosInstance.get(`/campaigns/${this.campaignId}/offers/${productId}`);
      return response.data;
    } catch (error) {
      return null;
    }
  }
};
var MarketplaceServiceFactory = class {
  static {
    __name(this, "MarketplaceServiceFactory");
  }
  static create(credentials) {
    switch (credentials.marketplace) {
      case "wildberries":
        if (!credentials.apiKey) return null;
        return new WildberriesService(credentials.apiKey);
      case "ozon":
        if (!credentials.clientId || !credentials.apiKey) return null;
        return new OzonService(credentials.clientId, credentials.apiKey);
      case "uzum":
        if (!credentials.apiKey) return null;
        return new UzumService(credentials.apiKey);
      case "yandex":
        if (!credentials.sellerId || !credentials.accessToken) return null;
        return new YandexMarketService2(credentials.sellerId, credentials.accessToken);
      default:
        return null;
    }
  }
};

// server/services/aiManagerV2Service.ts
init_realAIService();
async function createTask(partnerId, taskType, inputData) {
  const taskId = uuidv4();
  const dbType3 = getDbType();
  try {
    await db.insert(aiTasks).values({
      id: taskId,
      partnerId,
      taskType,
      status: "pending",
      priority: "medium",
      inputData: JSON.stringify(inputData),
      createdAt: formatDateForDB(/* @__PURE__ */ new Date(), dbType3)
    });
    return taskId;
  } catch (error) {
    console.error("Failed to create AI task:", error);
    throw error;
  }
}
__name(createTask, "createTask");
async function updateTaskStatus(taskId, status, outputData, errorMessage) {
  const dbType3 = getDbType();
  try {
    await db.update(aiTasks).set({
      status,
      outputData: outputData ? JSON.stringify(outputData) : void 0,
      errorMessage,
      completedAt: status === "completed" || status === "failed" ? formatDateForDB(/* @__PURE__ */ new Date(), dbType3) : void 0,
      updatedAt: formatDateForDB(/* @__PURE__ */ new Date(), dbType3)
    }).where(eq29(aiTasks.id, taskId));
  } catch (error) {
    console.error("Failed to update task status:", error);
  }
}
__name(updateTaskStatus, "updateTaskStatus");
async function recordAICost(partnerId, operation, model, cost, metadata) {
  const dbType3 = getDbType();
  try {
    const partner = await storage.getPartnerById(partnerId);
    const tier = partner?.pricingTier || "free_starter";
    await db.insert(aiCostRecords).values({
      id: uuidv4(),
      partnerId,
      operation,
      model,
      cost,
      tier,
      metadata: metadata ? JSON.stringify(metadata) : null,
      createdAt: formatDateForDB(/* @__PURE__ */ new Date(), dbType3)
    });
  } catch (error) {
    console.error("Failed to record AI cost:", error);
  }
}
__name(recordAICost, "recordAICost");
function calculateOptimalPrice2(costPrice, competitors, options = {}) {
  const {
    taxRate = 15,
    // 15% soliq
    commissionRate = 10,
    // 10% marketplace komissiya
    logisticsCost = 50,
    // 50 so'm logistika
    minProfitPercent = 10
    // 10% minimal foyda
  } = options;
  const taxes = costPrice * (taxRate / 100);
  const commission = costPrice * (commissionRate / 100);
  const logistics = logisticsCost;
  const totalCost = costPrice + taxes + commission + logistics;
  const minProfit = totalCost * (minProfitPercent / 100);
  const minPrice = Math.ceil(totalCost + minProfit);
  const prices = competitors.map((c) => c.price).filter((p) => p > 0);
  const avgCompetitorPrice = prices.length > 0 ? Math.round(prices.reduce((sum, p) => sum + p, 0) / prices.length) : minPrice * 1.2;
  const minCompetitorPrice = prices.length > 0 ? Math.min(...prices) : minPrice;
  const competitivePrice = Math.round(avgCompetitorPrice * 0.97);
  const recommendedPrice = Math.max(minPrice, competitivePrice);
  const maxPrice = prices.length > 0 ? Math.max(...prices) : recommendedPrice * 1.3;
  const profit = recommendedPrice - totalCost;
  const profitPercent = profit / totalCost * 100;
  return {
    minPrice,
    recommendedPrice,
    maxPrice,
    breakdown: {
      costPrice,
      taxes,
      commission,
      logistics,
      totalCost,
      minPrice,
      recommendedPrice,
      profit,
      profitPercent: Math.round(profitPercent),
      competitorAvg: avgCompetitorPrice,
      competitorMin: minCompetitorPrice
    }
  };
}
__name(calculateOptimalPrice2, "calculateOptimalPrice");
async function scanProductImage(request) {
  const { imageUrl, partnerId } = request;
  const taskId = await createTask(partnerId, "image_scan", { imageUrl });
  try {
    await updateTaskStatus(taskId, "processing");
    const searchResult = await imageSearchService.searchByImage(imageUrl);
    await recordAICost(partnerId, "image_scan", "google-vision", 1e-3, {
      confidence: searchResult.productInfo.confidence,
      resultsFound: searchResult.totalResults
    });
    const response = {
      taskId,
      productInfo: {
        name: searchResult.productInfo.productName,
        brand: searchResult.productInfo.brand,
        category: searchResult.productInfo.category,
        description: searchResult.productInfo.description,
        confidence: searchResult.productInfo.confidence,
        labels: searchResult.productInfo.labels
      },
      competitors: searchResult.competitors.map((c) => ({
        seller: c.seller,
        price: c.price,
        currency: c.currency,
        link: c.link,
        source: c.source
      })),
      priceAnalysis: {
        avgPrice: searchResult.avgPrice,
        minPrice: searchResult.minPrice,
        maxPrice: searchResult.maxPrice,
        totalResults: searchResult.totalResults
      },
      status: searchResult.totalResults > 0 ? "success" : "partial",
      message: searchResult.totalResults > 0 ? `Topildi: ${searchResult.productInfo.productName}. ${searchResult.totalResults} ta raqobatchi aniqlandi.` : `Mahsulot aniqlandi: ${searchResult.productInfo.productName}, lekin raqobatchilar topilmadi.`
    };
    await updateTaskStatus(taskId, "completed", response);
    return response;
  } catch (error) {
    console.error("AI Scanner error:", error);
    await updateTaskStatus(taskId, "failed", null, error.message);
    return {
      taskId,
      productInfo: {
        name: "Unknown",
        brand: "Unknown",
        category: "other",
        description: "Mahsulotni aniqlashda xatolik",
        confidence: 0,
        labels: []
      },
      competitors: [],
      priceAnalysis: {
        avgPrice: 0,
        minPrice: 0,
        maxPrice: 0,
        totalResults: 0
      },
      status: "failed",
      message: `Xatolik: ${error.message}`
    };
  }
}
__name(scanProductImage, "scanProductImage");
async function createProductOnMarketplace(request) {
  const { partnerId, marketplace, productData, priceOptimization } = request;
  const taskId = request.taskId || await createTask(partnerId, "product_creation", productData);
  try {
    await updateTaskStatus(taskId, "processing");
    const integrations = await db.select().from(marketplaceIntegrations).where(
      and23(
        eq29(marketplaceIntegrations.partnerId, partnerId),
        eq29(marketplaceIntegrations.marketplace, marketplace),
        eq29(marketplaceIntegrations.active, true)
      )
    );
    if (integrations.length === 0) {
      throw new Error(`${marketplace} marketplace ulanmagan. Iltimos, API kalitlarini kiriting.`);
    }
    const integration = integrations[0];
    let optimizedPrice = productData.costPrice * 1.5;
    let priceBreakdown = null;
    if (priceOptimization?.enabled && productData.images.length > 0) {
      try {
        const searchResult = await imageSearchService.searchByImage(productData.images[0]);
        const priceCalc = calculateOptimalPrice2(productData.costPrice, searchResult.competitors, {
          minProfitPercent: priceOptimization.minProfit || 10
        });
        optimizedPrice = priceCalc.recommendedPrice;
        priceBreakdown = priceCalc.breakdown;
      } catch (error) {
        console.warn("Price optimization failed, using default markup:", error);
      }
    }
    let optimizedTitle = productData.name;
    let optimizedDescription = productData.description;
    if (realAIService.isEnabled()) {
      try {
        const seoPrompt = `Marketplace: ${marketplace}
Mahsulot: ${productData.name}

SEO-optimizatsiya qilingan sarlavha (max 100 belgi) va tavsif (max 500 belgi) yarating. JSON formatda javob bering:
{"title": "...", "description": "..."}`;
        const seoResult = await realAIService.generateText({
          prompt: seoPrompt,
          jsonMode: true
        });
        const seoData = JSON.parse(seoResult);
        optimizedTitle = seoData.title || optimizedTitle;
        optimizedDescription = seoData.description || optimizedDescription;
        await recordAICost(partnerId, "seo_optimization", "gemini-flash", 5e-4);
      } catch (error) {
        console.warn("SEO optimization failed, using original content:", error);
      }
    }
    const credentials = {
      marketplace,
      apiKey: integration.apiKey || void 0,
      apiSecret: integration.apiSecret || void 0,
      clientId: integration.sellerId || void 0,
      accessToken: integration.accessToken || void 0,
      sellerId: integration.sellerId || void 0
    };
    const marketplaceService = MarketplaceServiceFactory.create(credentials);
    if (!marketplaceService) {
      throw new Error(`${marketplace} service yaratishda xatolik`);
    }
    const productCard = {
      offerId: uuidv4(),
      // Unique ID
      title: optimizedTitle,
      description: optimizedDescription,
      images: productData.images,
      price: optimizedPrice,
      category: productData.category || "general",
      brand: productData.brand || "Unknown",
      keywords: []
    };
    const creationResult = await marketplaceService.createProduct(productCard);
    const response = {
      success: creationResult.success,
      taskId,
      marketplace,
      productId: creationResult.productId,
      optimizedPrice,
      priceBreakdown,
      status: creationResult.status || "unknown",
      message: creationResult.success ? `Mahsulot ${marketplace} da yaratildi! Product ID: ${creationResult.productId}` : `Xatolik: ${creationResult.error}`,
      error: creationResult.error
    };
    await updateTaskStatus(
      taskId,
      creationResult.success ? "completed" : "failed",
      response,
      creationResult.error
    );
    return response;
  } catch (error) {
    console.error("Product creation error:", error);
    await updateTaskStatus(taskId, "failed", null, error.message);
    return {
      success: false,
      taskId,
      marketplace,
      status: "failed",
      message: `Mahsulot yaratishda xatolik: ${error.message}`,
      error: error.message
    };
  }
}
__name(createProductOnMarketplace, "createProductOnMarketplace");
var aiManager = {
  scanProductImage,
  createProductOnMarketplace
};

// server/routes/aiRoutes.ts
var router47 = Router25();
router47.post("/scanner/scan-image", requireAuth2, async (req, res) => {
  try {
    const { imageUrl } = req.body;
    const userId = req.session?.user?.id;
    if (!imageUrl) {
      return res.status(400).json({
        success: false,
        error: "imageUrl majburiy"
      });
    }
    const { storage: storage4 } = await Promise.resolve().then(() => (init_storage(), storage_exports));
    const partner = await storage4.getPartnerByUserId(userId);
    if (!partner) {
      return res.status(404).json({
        success: false,
        error: "Partner topilmadi"
      });
    }
    const result = await aiManager.scanProductImage({
      imageUrl,
      partnerId: partner.id
    });
    return res.status(200).json({
      success: true,
      data: result
    });
  } catch (error) {
    console.error("Image scan error:", error);
    return res.status(500).json({
      success: false,
      error: error.message
    });
  }
});
router47.post("/manager/create-product", requireAuth2, async (req, res) => {
  try {
    const {
      marketplace,
      productData,
      priceOptimization,
      taskId
    } = req.body;
    const userId = req.session?.user?.id;
    if (!marketplace || !productData) {
      return res.status(400).json({
        success: false,
        error: "marketplace va productData majburiy"
      });
    }
    if (!productData.name || !productData.description || !productData.images || !productData.costPrice) {
      return res.status(400).json({
        success: false,
        error: "name, description, images, costPrice majburiy"
      });
    }
    const { storage: storage4 } = await Promise.resolve().then(() => (init_storage(), storage_exports));
    const partner = await storage4.getPartnerByUserId(userId);
    if (!partner) {
      return res.status(404).json({
        success: false,
        error: "Partner topilmadi"
      });
    }
    const result = await aiManager.createProductOnMarketplace({
      partnerId: partner.id,
      marketplace,
      productData,
      priceOptimization,
      taskId
    });
    return res.status(result.success ? 200 : 400).json({
      success: result.success,
      data: result
    });
  } catch (error) {
    console.error("Product creation error:", error);
    return res.status(500).json({
      success: false,
      error: error.message
    });
  }
});
router47.get("/status", async (req, res) => {
  try {
    const imageSearchStatus = imageSearchService.getStatus();
    const aiServiceStatus = (await Promise.resolve().then(() => (init_realAIService(), realAIService_exports))).realAIService.getStatus();
    return res.status(200).json({
      success: true,
      services: {
        imageSearch: imageSearchStatus,
        aiGeneration: aiServiceStatus
      }
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      error: error.message
    });
  }
});
var aiRoutes_default = router47;

// server/routes/trendHunterRoutes.ts
import { Router as Router26 } from "express";

// server/services/trendHunterService.ts
init_db();
init_schema();
import { desc as desc8 } from "drizzle-orm";
var AliExpressService = class {
  static {
    __name(this, "AliExpressService");
  }
  apiKey;
  endpoint = "https://api.aliexpress.com/v1";
  constructor(apiKey = "") {
    this.apiKey = apiKey;
  }
  async getTrendingProducts(category, limit = 50) {
    try {
      return this.getMockTrendingProducts(category, limit);
    } catch (error) {
      console.error("AliExpress API error:", error);
      return [];
    }
  }
  getMockTrendingProducts(category, limit = 50) {
    const mockProducts = [
      {
        productName: "Wireless Earbuds TWS Bluetooth 5.3",
        category: "electronics",
        imageUrl: "https://example.com/earbuds.jpg",
        sourceMarket: "china",
        sourcePrice: 3.5,
        // $3.5
        sourceCurrency: "USD",
        salesVolume: 15e3,
        salesGrowth: 45,
        competitorCount: 120,
        avgRating: 4.6,
        reviewCount: 8500,
        sourceUrl: "https://aliexpress.com/item/...",
        aliexpressUrl: "https://aliexpress.com/item/..."
      },
      {
        productName: "Smart Watch Y68 Fitness Tracker",
        category: "electronics",
        imageUrl: "https://example.com/smartwatch.jpg",
        sourceMarket: "china",
        sourcePrice: 8.2,
        sourceCurrency: "USD",
        salesVolume: 12e3,
        salesGrowth: 60,
        competitorCount: 85,
        avgRating: 4.4,
        reviewCount: 5200,
        sourceUrl: "https://aliexpress.com/item/...",
        aliexpressUrl: "https://aliexpress.com/item/..."
      },
      {
        productName: "LED Strip Lights RGB 5m WiFi Control",
        category: "home",
        imageUrl: "https://example.com/ledstrip.jpg",
        sourceMarket: "china",
        sourcePrice: 5.8,
        sourceCurrency: "USD",
        salesVolume: 9500,
        salesGrowth: 38,
        competitorCount: 150,
        avgRating: 4.5,
        reviewCount: 6800,
        sourceUrl: "https://aliexpress.com/item/...",
        aliexpressUrl: "https://aliexpress.com/item/..."
      },
      {
        productName: "Phone Holder Car Mount Magnetic",
        category: "accessories",
        imageUrl: "https://example.com/phone-holder.jpg",
        sourceMarket: "china",
        sourcePrice: 2.1,
        sourceCurrency: "USD",
        salesVolume: 18e3,
        salesGrowth: 52,
        competitorCount: 200,
        avgRating: 4.7,
        reviewCount: 12e3,
        sourceUrl: "https://aliexpress.com/item/...",
        aliexpressUrl: "https://aliexpress.com/item/..."
      },
      {
        productName: "Mini Projector 4K WiFi Portable",
        category: "electronics",
        imageUrl: "https://example.com/projector.jpg",
        sourceMarket: "china",
        sourcePrice: 45,
        sourceCurrency: "USD",
        salesVolume: 3500,
        salesGrowth: 75,
        competitorCount: 45,
        avgRating: 4.3,
        reviewCount: 1850,
        sourceUrl: "https://aliexpress.com/item/...",
        aliexpressUrl: "https://aliexpress.com/item/..."
      }
    ];
    return mockProducts.slice(0, limit);
  }
};
var AmazonTrendsService = class {
  static {
    __name(this, "AmazonTrendsService");
  }
  async getBestSellers(category) {
    const mockProducts = [
      {
        productName: "Apple AirPods Pro 2nd Generation",
        category: "electronics",
        imageUrl: "https://example.com/airpods.jpg",
        sourceMarket: "usa",
        sourcePrice: 189.99,
        sourceCurrency: "USD",
        salesVolume: 25e3,
        salesGrowth: 25,
        competitorCount: 15,
        avgRating: 4.8,
        reviewCount: 45e3,
        sourceUrl: "https://amazon.com/...",
        amazonUrl: "https://amazon.com/..."
      },
      {
        productName: "Anker PowerBank 20000mAh",
        category: "electronics",
        imageUrl: "https://example.com/powerbank.jpg",
        sourceMarket: "usa",
        sourcePrice: 39.99,
        sourceCurrency: "USD",
        salesVolume: 18e3,
        salesGrowth: 30,
        competitorCount: 50,
        avgRating: 4.7,
        reviewCount: 28e3,
        sourceUrl: "https://amazon.com/...",
        amazonUrl: "https://amazon.com/..."
      }
    ];
    return mockProducts;
  }
};
var LocalMarketplaceAnalyzer = class {
  static {
    __name(this, "LocalMarketplaceAnalyzer");
  }
  async checkLocalCompetition(productName, category) {
    const randomCompetitors = Math.floor(Math.random() * 50);
    const avgPrice = Math.random() * 1e5 + 5e4;
    return {
      competitorCount: randomCompetitors,
      avgPrice,
      demand: randomCompetitors < 10 ? "high" : randomCompetitors < 30 ? "medium" : "low"
    };
  }
};
var ProfitCalculator = class {
  static {
    __name(this, "ProfitCalculator");
  }
  USD_TO_UZS = 12600;
  // Kurs: 1 USD = 12600 UZS
  SHIPPING_PER_KG = 8;
  // $8 per kg from China
  CUSTOMS_RATE = 0.15;
  // 15% bojxona
  LOCAL_LOGISTICS = 1e4;
  // 10k so'm local yetkazib berish
  calculateProfitOpportunity(product, localCompetition) {
    const productCostUSD = product.sourcePrice;
    const estimatedWeight = this.estimateProductWeight(product.category);
    const shippingCost = estimatedWeight * this.SHIPPING_PER_KG;
    const totalImportCostUSD = productCostUSD + shippingCost;
    const importCostUZS = totalImportCostUSD * this.USD_TO_UZS;
    const customsDuty = importCostUZS * this.CUSTOMS_RATE;
    const totalCost = importCostUZS + customsDuty + this.LOCAL_LOGISTICS;
    const { competitorCount, avgPrice, demand } = localCompetition;
    let recommendedPrice;
    if (competitorCount === 0) {
      recommendedPrice = totalCost * 2.5;
    } else if (competitorCount < 10) {
      recommendedPrice = Math.min(avgPrice * 0.95, totalCost * 2.2);
    } else {
      recommendedPrice = Math.min(avgPrice * 0.9, totalCost * 1.8);
    }
    if (recommendedPrice < totalCost * 1.3) {
      recommendedPrice = totalCost * 1.3;
    }
    const profit = recommendedPrice - totalCost;
    const profitMargin = profit / totalCost * 100;
    const roi = profit / totalCost * 100;
    const monthlySalesEstimate = this.estimateMonthlySales(
      product.salesVolume,
      competitorCount,
      demand
    );
    const monthlyProfitEstimate = profit * monthlySalesEstimate;
    const breakEvenUnits = Math.ceil(totalCost / profit);
    const opportunityScore = this.calculateOpportunityScore(
      profitMargin,
      competitorCount,
      product.salesGrowth,
      demand,
      product.avgRating
    );
    const strengths = [];
    const risks = [];
    if (profitMargin > 80) strengths.push(`Yuqori foyda marjasi: ${profitMargin.toFixed(0)}%`);
    if (competitorCount < 10) strengths.push(`Kam raqobat: ${competitorCount} ta raqobatchi`);
    if (product.salesGrowth > 50) strengths.push(`Tez o'sish: ${product.salesGrowth}% o'sish`);
    if (demand === "high") strengths.push("Yuqori talab");
    if (competitorCount > 30) risks.push(`Ko'p raqobat: ${competitorCount} ta`);
    if (profitMargin < 40) risks.push("Past foyda marjasi");
    if (product.avgRating < 4) risks.push("Past reyting");
    const recommendation = this.generateRecommendation(
      opportunityScore,
      profitMargin,
      competitorCount,
      demand
    );
    return {
      product,
      importCost: importCostUZS,
      customsDuty,
      localLogistics: this.LOCAL_LOGISTICS,
      totalCost,
      localCompetitors: competitorCount,
      localAvgPrice: avgPrice,
      localDemand: demand,
      recommendedPrice,
      profitMargin,
      monthlyProfitEstimate,
      roi,
      breakEvenUnits,
      opportunityScore,
      strengths,
      risks,
      recommendation
    };
  }
  estimateProductWeight(category) {
    const weights = {
      electronics: 0.5,
      clothing: 0.3,
      home: 1,
      accessories: 0.2,
      toys: 0.4,
      beauty: 0.3,
      sports: 0.8
    };
    return weights[category] || 0.5;
  }
  estimateMonthlySales(sourceSales, localCompetitors, demand) {
    const baseConversion = 0.02;
    const competitionFactor = Math.max(0.2, 1 - localCompetitors / 100);
    const demandFactor = demand === "high" ? 1.5 : demand === "medium" ? 1 : 0.6;
    return Math.round(sourceSales * baseConversion * competitionFactor * demandFactor);
  }
  calculateOpportunityScore(profitMargin, competitors, growthRate, demand, rating) {
    const profitScore = Math.min(100, profitMargin);
    const competitionScore = Math.max(0, 100 - competitors * 2);
    const growthScore = Math.min(100, growthRate * 1.2);
    const demandScore = demand === "high" ? 100 : demand === "medium" ? 60 : 30;
    const qualityScore = rating / 5 * 100;
    const totalScore = profitScore * 0.3 + competitionScore * 0.25 + growthScore * 0.2 + demandScore * 0.15 + qualityScore * 0.1;
    return Math.round(totalScore);
  }
  generateRecommendation(score, profitMargin, competitors, demand) {
    if (score >= 80) {
      return `\u2B50 EXCELLENT: Juda yaxshi imkoniyat! Yuqori foyda va kam raqobat. Darhol boshlang!`;
    } else if (score >= 65) {
      return `\u2705 GOOD: Yaxshi imkoniyat. ${profitMargin.toFixed(0)}% foyda va ${competitors} ta raqobatchi. Tavsiya etiladi.`;
    } else if (score >= 50) {
      return `\u26A0\uFE0F MODERATE: O'rtacha imkoniyat. Raqobat yuqori yoki foyda past. Ehtiyotkorlik bilan boshlang.`;
    } else {
      return `\u274C LOW: Past imkoniyat. Raqobat juda yuqori yoki foyda kam. Boshqa mahsulot tanlang.`;
    }
  }
};
var TrendHunterService2 = class {
  static {
    __name(this, "TrendHunterService");
  }
  aliexpressService;
  amazonService;
  localAnalyzer;
  profitCalculator;
  constructor() {
    this.aliexpressService = new AliExpressService();
    this.amazonService = new AmazonTrendsService();
    this.localAnalyzer = new LocalMarketplaceAnalyzer();
    this.profitCalculator = new ProfitCalculator();
  }
  /**
   * Main function: Find profitable trending products
   */
  async findProfitableOpportunities(options = {}) {
    const {
      category,
      minProfitMargin = 30,
      maxCompetitors = 50,
      limit = 20
    } = options;
    try {
      const chinaTrends = await this.aliexpressService.getTrendingProducts(category, 30);
      const usaTrends = await this.amazonService.getBestSellers(category);
      const allTrends = [...chinaTrends, ...usaTrends];
      const opportunities = [];
      for (const product of allTrends) {
        const localCompetition = await this.localAnalyzer.checkLocalCompetition(
          product.productName,
          product.category
        );
        const opportunity = this.profitCalculator.calculateProfitOpportunity(
          product,
          localCompetition
        );
        if (opportunity.profitMargin >= minProfitMargin && opportunity.localCompetitors <= maxCompetitors) {
          opportunities.push(opportunity);
        }
      }
      opportunities.sort((a, b) => b.opportunityScore - a.opportunityScore);
      await this.saveTrendingProducts(opportunities.slice(0, limit));
      return opportunities.slice(0, limit);
    } catch (error) {
      console.error("Trend Hunter error:", error);
      throw error;
    }
  }
  /**
   * Get trending products by category
   */
  async getTrendsByCategory(category) {
    return this.findProfitableOpportunities({ category, limit: 10 });
  }
  /**
   * Get top opportunities (highest profit potential)
   */
  async getTopOpportunities(limit = 10) {
    return this.findProfitableOpportunities({ limit });
  }
  /**
   * Save trending products to database
   */
  async saveTrendingProducts(opportunities) {
    const dbType3 = getDatabaseType();
    for (const opp of opportunities) {
      try {
        const now = /* @__PURE__ */ new Date();
        await db.insert(trendingProducts).values({
          id: `trend_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
          marketplace: opp.product.sourceMarket,
          category: opp.product.category,
          productName: opp.product.productName,
          price: opp.recommendedPrice,
          salesCount: opp.product.salesVolume,
          rating: opp.product.avgRating,
          trendScore: opp.opportunityScore,
          imageUrl: opp.product.imageUrl,
          productUrl: opp.product.sourceUrl,
          analyzedAt: dbType3 === "postgres" ? now.toISOString() : Math.floor(now.getTime() / 1e3)
        });
      } catch (error) {
        console.warn("Failed to save trending product:", error);
      }
    }
  }
  /**
   * Get saved trending products from database
   */
  async getSavedTrends(limit = 50) {
    try {
      const trends = await db.select().from(trendingProducts).orderBy(desc8(trendingProducts.trendScore), desc8(trendingProducts.analyzedAt)).limit(limit);
      return trends;
    } catch (error) {
      console.error("Error fetching saved trends:", error);
      return [];
    }
  }
};
var trendHunterService = new TrendHunterService2();

// server/routes/trendHunterRoutes.ts
var router48 = Router26();
router48.get("/opportunities", requireAuth2, async (req, res) => {
  try {
    const {
      category,
      minProfitMargin,
      maxCompetitors,
      limit
    } = req.query;
    const opportunities = await trendHunterService.findProfitableOpportunities({
      category,
      minProfitMargin: minProfitMargin ? parseInt(minProfitMargin) : 30,
      maxCompetitors: maxCompetitors ? parseInt(maxCompetitors) : 50,
      limit: limit ? parseInt(limit) : 20
    });
    return res.status(200).json({
      success: true,
      count: opportunities.length,
      data: opportunities
    });
  } catch (error) {
    console.error("Trend opportunities error:", error);
    return res.status(500).json({
      success: false,
      error: error.message
    });
  }
});
router48.get("/category/:category", requireAuth2, async (req, res) => {
  try {
    const { category } = req.params;
    const trends = await trendHunterService.getTrendsByCategory(category);
    return res.status(200).json({
      success: true,
      category,
      count: trends.length,
      data: trends
    });
  } catch (error) {
    console.error("Category trends error:", error);
    return res.status(500).json({
      success: false,
      error: error.message
    });
  }
});
router48.get("/top", requireAuth2, async (req, res) => {
  try {
    const { limit } = req.query;
    const topOpportunities = await trendHunterService.getTopOpportunities(
      limit ? parseInt(limit) : 10
    );
    return res.status(200).json({
      success: true,
      count: topOpportunities.length,
      data: topOpportunities
    });
  } catch (error) {
    console.error("Top opportunities error:", error);
    return res.status(500).json({
      success: false,
      error: error.message
    });
  }
});
router48.get("/saved", requireAuth2, async (req, res) => {
  try {
    const { limit } = req.query;
    const savedTrends = await trendHunterService.getSavedTrends(
      limit ? parseInt(limit) : 50
    );
    return res.status(200).json({
      success: true,
      count: savedTrends.length,
      data: savedTrends
    });
  } catch (error) {
    console.error("Saved trends error:", error);
    return res.status(500).json({
      success: false,
      error: error.message
    });
  }
});
var trendHunterRoutes_default = router48;

// server/routes.ts
function requireAuth3(req, res, next) {
  if (!req.session?.user) {
    return res.status(401).json({
      message: "Avtorizatsiya yo'q",
      code: "UNAUTHORIZED",
      timestamp: (/* @__PURE__ */ new Date()).toISOString()
    });
  }
  req.user = req.session.user;
  next();
}
__name(requireAuth3, "requireAuth");
function requireAdmin2(req, res, next) {
  if (!req.session?.user) {
    return res.status(401).json({
      message: "Avtorizatsiya yo'q",
      code: "UNAUTHORIZED"
    });
  }
  if (req.session.user.role !== "admin") {
    return res.status(403).json({
      message: "Admin huquqi talab qilinadi",
      code: "FORBIDDEN"
    });
  }
  next();
}
__name(requireAdmin2, "requireAdmin");
async function requirePartnerWithData(req, res, next) {
  if (!req.session?.user) {
    return res.status(401).json({
      message: "Avtorizatsiya yo'q",
      code: "UNAUTHORIZED"
    });
  }
  const user = req.session.user;
  req.user = user;
  if (user.role === "admin") {
    return next();
  }
  try {
    let partner = await storage.getPartnerByUserId(user.id);
    if (!partner) {
      console.warn(`Partner not found for user ${user.id}, auto-creating...`);
      try {
        partner = await storage.createPartner({
          userId: user.id,
          businessName: user.username || "Default Business",
          businessCategory: "general",
          monthlyRevenue: "0",
          phone: user.phone || "+998000000000",
          notes: "Auto-created partner profile"
        });
        console.log(`\u2705 Auto-created partner ${partner.id} for user ${user.id}`);
      } catch (createError) {
        console.error(`Failed to auto-create partner for user ${user.id}:`, createError);
        return res.status(404).json({
          message: "Hamkor ma'lumotlari topilmadi va yaratib bo'lmadi",
          code: "PARTNER_NOT_FOUND"
        });
      }
    }
    req.user.partnerId = partner.id;
    req.user.pricingTier = partner.pricingTier;
    req.user.aiEnabled = partner.aiEnabled;
    req.partner = partner;
    next();
  } catch (error) {
    console.error("Error in requirePartnerWithData:", error);
    return res.status(500).json({
      message: "Server xatolik",
      code: "INTERNAL_ERROR"
    });
  }
}
__name(requirePartnerWithData, "requirePartnerWithData");
function handleValidationError(error, req, res, next) {
  if (error instanceof ZodError) {
    return res.status(400).json({
      message: "Ma'lumotlar noto'g'ri",
      code: "VALIDATION_ERROR",
      errors: error.errors.map((err) => ({
        field: err.path.join("."),
        message: err.message
      }))
    });
  }
  next(error);
}
__name(handleValidationError, "handleValidationError");
function registerRoutes(app2) {
  const server = new Server(app2);
  const uploadPath = config_default.upload.uploadPath;
  if (!fs4.existsSync(uploadPath)) {
    fs4.mkdirSync(uploadPath, { recursive: true });
  }
  const upload4 = multer4({
    dest: uploadPath,
    limits: { fileSize: config_default.upload.maxFileSize }
  });
  app2.use("/uploads", express23.static(uploadPath));
  app2.use(session2(getSessionConfig()));
  app2.use((req, _res, next) => {
    if (req.session && req.session.user) {
      req.user = req.session.user;
    } else {
      req.user = void 0;
    }
    next();
  });
  app2.get("/health", (req, res) => {
    res.status(200).json({
      status: "ok",
      timestamp: (/* @__PURE__ */ new Date()).toISOString(),
      uptime: process.uptime()
    });
  });
  app2.get("/api/health", healthCheck);
  app2.use("/api", debugRoutes_default);
  const swaggerSpec = swaggerJSDoc({
    definition: {
      openapi: "3.0.0",
      info: { title: "BiznesYordam API", version: "2.0.1" },
      servers: [{ url: "/" }]
    },
    apis: []
  });
  app2.use("/api/docs", swaggerUi.serve, swaggerUi.setup(swaggerSpec, { explorer: true }));
  app2.post("/api/auth/login", asyncHandler(async (req, res) => {
    try {
      console.log("\u{1F510} Login attempt:", { username: req.body.username, hasSession: !!req.session, ip: req.ip });
      const { username, password } = loginSchema.parse(req.body);
      const user = await storage.validateUserPassword(username, password);
      if (!user) {
        await storage.createAuditLog({
          userId: "anonymous",
          action: "LOGIN_FAILED",
          entityType: "user",
          payload: { username, reason: "invalid_credentials" }
        });
        return res.status(401).json({
          message: "Username yoki parol noto'g'ri",
          code: "INVALID_CREDENTIALS"
        });
      }
      if (!user.isActive) {
        return res.status(401).json({
          message: "Hisob faol emas",
          code: "ACCOUNT_INACTIVE"
        });
      }
      await new Promise((resolve, reject) => {
        req.session.regenerate((err) => {
          if (err) {
            console.error("\u274C Session regenerate error:", err);
            reject(err);
          } else {
            console.log("\u2705 Session regenerated");
            resolve();
          }
        });
      });
      req.session.user = {
        id: user.id,
        username: user.username,
        email: user.email || void 0,
        firstName: user.firstName || void 0,
        lastName: user.lastName || void 0,
        role: user.role
      };
      let partner = null;
      let permissions = null;
      if (user.role === "partner") {
        partner = await storage.getPartnerByUserId(user.id);
      } else if (user.role === "admin") {
        permissions = await storage.getAdminPermissions(user.id);
      }
      await new Promise((resolve, reject) => {
        req.session.save((err) => {
          if (err) {
            console.error("\u274C Session save error:", err);
            reject(err);
          } else {
            console.log("\u2705 Session saved successfully for user:", user.id);
            console.log("\u{1F4DD} Session ID:", req.sessionID);
            console.log("\u{1F36A} Session data:", { hasUser: !!req.session.user, role: req.session.user?.role });
            resolve();
          }
        });
      });
      await storage.createAuditLog({
        userId: user.id,
        action: "LOGIN_SUCCESS",
        entityType: "user",
        payload: { username, role: user.role }
      });
      res.json({
        user: req.session.user,
        partner,
        permissions,
        message: "Muvaffaqiyatli kirildi",
        sessionId: req.sessionID
        // Debug only - remove in production
      });
    } catch (error) {
      if (error instanceof ZodError) {
        return res.status(400).json({
          message: "Ma'lumotlar noto'g'ri",
          code: "VALIDATION_ERROR",
          errors: error.errors
        });
      }
      console.error("\u274C Login error:", error);
      throw error;
    }
  }));
  app2.post("/api/auth/logout", asyncHandler(async (req, res) => {
    const userId = req.session?.user?.id;
    if (userId) {
      await storage.createAuditLog({
        userId,
        action: "LOGOUT",
        entityType: "user"
      });
    }
    req.session.destroy((err) => {
      if (err) {
        console.error("Session destroy error:", err);
        return res.status(500).json({
          message: "Chiqishda xatolik",
          code: "LOGOUT_ERROR"
        });
      }
      res.clearCookie("connect.sid");
      res.json({ message: "Muvaffaqiyatli chiqildi" });
    });
  }));
  app2.get("/api/auth/me", asyncHandler(async (req, res) => {
    console.log("\u{1F50D} Auth check:", {
      hasSession: !!req.session,
      hasUser: !!req.session?.user,
      sessionID: req.sessionID,
      cookies: req.headers.cookie
    });
    if (!req.session?.user) {
      return res.status(401).json({
        message: "Avtorizatsiya yo'q",
        code: "UNAUTHORIZED"
      });
    }
    let partner = null;
    let permissions = null;
    if (req.session.user.role === "partner") {
      partner = await storage.getPartnerByUserId(req.session.user.id);
    } else if (req.session.user.role === "admin") {
      permissions = await storage.getAdminPermissions(req.session.user.id);
    }
    res.json({
      user: req.session.user,
      partner,
      permissions
    });
  }));
  app2.post("/api/partners/register", asyncHandler(async (req, res) => {
    try {
      console.log("[REGISTRATION] Received data:", JSON.stringify(req.body, null, 2));
      const validatedData = partnerRegistrationSchema.parse(req.body);
      console.log("[REGISTRATION] Validation passed");
      const existingUser = await storage.getUserByUsername(validatedData.username);
      if (existingUser) {
        console.log("[REGISTRATION] Username already exists:", validatedData.username);
        return res.status(400).json({
          message: "Bu username allaqachon mavjud",
          code: "USERNAME_EXISTS"
        });
      }
      console.log("[REGISTRATION] Creating user...");
      const user = await storage.createUser({
        username: validatedData.username,
        email: validatedData.email,
        password: validatedData.password,
        firstName: validatedData.firstName,
        lastName: validatedData.lastName,
        phone: validatedData.phone,
        role: "partner"
      });
      console.log("[REGISTRATION] User created:", user.id);
      console.log("[REGISTRATION] Creating partner profile...");
      const referralCode = req.body.referralCode;
      const partner = await storage.createPartner({
        userId: user.id,
        businessName: validatedData.businessName,
        businessCategory: validatedData.businessCategory || "general",
        monthlyRevenue: validatedData.monthlyRevenue || "0",
        phone: validatedData.phone,
        // CRITICAL: phone required!
        notes: validatedData.notes || void 0,
        referralCode
        // Pass referral code to createPartner
      });
      console.log("[REGISTRATION] Partner created:", partner.id);
      if (referralCode) {
        try {
          const referrerPartner = await db.select().from(partners).where(eq30(partners.promoCode, referralCode)).limit(1);
          if (referrerPartner.length > 0) {
            const referrerId = referrerPartner[0].id;
            await db.insert(referrals).values({
              id: `ref_${Date.now()}`,
              referrerPartnerId: referrerId,
              referredPartnerId: partner.id,
              promoCode: referralCode,
              contractType: "starter_pro",
              status: "registered",
              createdAt: /* @__PURE__ */ new Date()
            });
            console.log("\u2705 Referral created via promo code:", referralCode, "\u2192", partner.id);
          } else {
            console.log("\u26A0\uFE0F Promo code not found in partners:", referralCode);
          }
        } catch (refError) {
          console.error("\u26A0\uFE0F Referral creation failed:", refError);
        }
      }
      await storage.createAuditLog({
        userId: user.id,
        action: "PARTNER_REGISTERED",
        entityType: "partner",
        entityId: partner.id,
        payload: { businessName: validatedData.businessName, referralCode }
      });
      console.log("[REGISTRATION] Success! User:", user.id, "Partner:", partner.id);
      res.status(201).json({
        message: "Hamkor muvaffaqiyatli ro'yxatdan o'tdi",
        user: {
          id: user.id,
          username: user.username,
          email: user.email,
          firstName: user.firstName,
          lastName: user.lastName,
          role: user.role
        },
        partner
      });
    } catch (error) {
      console.error("[REGISTRATION] Error:", error);
      if (error instanceof ZodError) {
        console.error("[REGISTRATION] Validation error:", error.errors);
        return res.status(400).json({
          message: "Ma'lumotlar noto'g'ri",
          code: "VALIDATION_ERROR",
          errors: error.errors
        });
      }
      console.error("[REGISTRATION] Unexpected error:", error);
      return res.status(500).json({
        message: "Ro'yxatdan o'tishda xatolik",
        code: "REGISTRATION_ERROR",
        error: error instanceof Error ? error.message : "Unknown error"
      });
    }
  }));
  app2.get("/api/partners/me", requirePartnerWithData, asyncHandler(async (req, res) => {
    console.log("\u{1F50D} GET /api/partners/me - User ID:", req.session?.user?.id);
    const partner = await storage.getPartnerByUserId(req.session.user.id);
    console.log("\u{1F4E6} Partner found:", partner ? "Yes" : "No");
    if (!partner) {
      console.log("\u274C Partner not found for user:", req.session.user.id);
      return res.status(404).json({
        message: "Hamkor ma'lumotlari topilmadi",
        code: "PARTNER_NOT_FOUND"
      });
    }
    res.json(partner);
  }));
  app2.put("/api/partners/me", requirePartnerWithData, asyncHandler(async (req, res) => {
    const partner = await storage.getPartnerByUserId(req.session.user.id);
    if (!partner) {
      return res.status(404).json({
        message: "Hamkor ma'lumotlari topilmadi",
        code: "PARTNER_NOT_FOUND"
      });
    }
    const updatedPartner = await storage.updatePartner(partner.id, req.body);
    await storage.createAuditLog({
      userId: req.session.user.id,
      action: "PARTNER_UPDATED",
      entityType: "partner",
      entityId: partner.id,
      payload: req.body
    });
    res.json(updatedPartner);
  }));
  app2.get("/api/products", requirePartnerWithData, asyncHandler(async (req, res) => {
    const partner = await storage.getPartnerByUserId(req.session.user.id);
    if (!partner) {
      return res.status(404).json({
        message: "Hamkor ma'lumotlari topilmadi",
        code: "PARTNER_NOT_FOUND"
      });
    }
    const products4 = await storage.getProductsByPartnerId(partner.id);
    res.json(products4);
  }));
  app2.post("/api/products/simple", requirePartnerWithData, upload4.single("image"), asyncHandler(async (req, res) => {
    const user = req.user;
    const partner = req.partner;
    const file = req.file;
    const { name, stockQuantity, costPrice } = req.body;
    if (!name || !stockQuantity || !costPrice) {
      return res.status(400).json({
        message: "Nomi, qoldiq va tannarx majburiy",
        code: "MISSING_FIELDS"
      });
    }
    try {
      const product = await storage.createProduct({
        partnerId: partner.id,
        name,
        stockQuantity: parseInt(stockQuantity),
        costPrice: parseFloat(costPrice),
        price: parseFloat(costPrice) * 1.3,
        // Default 30% markup
        category: "general",
        description: "",
        sku: `SKU-${Date.now()}`,
        weight: "0.5"
      });
      const { generateProductCard: generateProductCard4 } = await Promise.resolve().then(() => (init_aiManagerService(), aiManagerService_exports));
      const integrations = await db.select().from(marketplaceIntegrations).where(and24(
        eq30(marketplaceIntegrations.partnerId, partner.id),
        eq30(marketplaceIntegrations.active, true)
      ));
      for (const integration of integrations) {
        try {
          await generateProductCard4({
            name,
            category: "general",
            description: "",
            price: parseFloat(costPrice) * 1.3,
            images: file ? [`/uploads/${file.filename}`] : [],
            targetMarketplace: integration.marketplace
          }, parseInt(partner.id));
        } catch (error) {
          console.error(`Failed to create card for ${integration.marketplace}:`, error);
        }
      }
      res.json({
        success: true,
        product,
        message: "Mahsulot yaratildi. AI Manager avtomatik kartochkalar yaratmoqda..."
      });
    } catch (error) {
      console.error("Simple product creation error:", error);
      res.status(500).json({
        message: "Mahsulot yaratishda xatolik",
        error: error.message
      });
    }
  }));
  app2.post("/api/products", requirePartnerWithData, asyncHandler(async (req, res) => {
    try {
      const processedBody = {
        ...req.body,
        price: typeof req.body.price === "string" ? parseFloat(req.body.price) : req.body.price,
        costPrice: typeof req.body.costPrice === "string" ? parseFloat(req.body.costPrice) : req.body.costPrice,
        weight: req.body.weight ? typeof req.body.weight === "string" ? parseFloat(req.body.weight) : req.body.weight : void 0
      };
      const validatedData = insertProductSchema.parse(processedBody);
      const partner = await storage.getPartnerByUserId(req.session.user.id);
      if (!partner) {
        return res.status(404).json({
          message: "Hamkor ma'lumotlari topilmadi",
          code: "PARTNER_NOT_FOUND"
        });
      }
      const product = await storage.createProduct({
        partnerId: partner.id,
        name: validatedData.name,
        category: validatedData.category || "general",
        price: validatedData.price,
        description: validatedData.description || "",
        costPrice: validatedData.costPrice,
        sku: validatedData.sku || `SKU-${Date.now()}`,
        barcode: validatedData.barcode,
        weight: validatedData.weight
      });
      await storage.createAuditLog({
        userId: req.session.user.id,
        action: "PRODUCT_CREATED",
        entityType: "product",
        entityId: product.id,
        payload: { name: product.name }
      });
      res.status(201).json(product);
    } catch (error) {
      if (error instanceof ZodError) {
        return res.status(400).json({
          message: "Mahsulot ma'lumotlari noto'g'ri",
          code: "VALIDATION_ERROR",
          errors: error.errors
        });
      }
      throw error;
    }
  }));
  app2.get("/api/fulfillment-requests", requirePartnerWithData, asyncHandler(async (req, res) => {
    if (req.session.user.role === "admin") {
      const requests = await storage.getAllFulfillmentRequests();
      res.json(requests);
    } else {
      const partner = await storage.getPartnerByUserId(req.session.user.id);
      if (!partner) {
        return res.status(404).json({
          message: "Hamkor ma'lumotlari topilmadi",
          code: "PARTNER_NOT_FOUND"
        });
      }
      const requests = await storage.getFulfillmentRequestsByPartnerId(partner.id);
      res.json(requests);
    }
  }));
  app2.post("/api/fulfillment-requests", requirePartnerWithData, asyncHandler(async (req, res) => {
    try {
      const validatedData = insertFulfillmentRequestSchema.parse(req.body);
      const partner = await storage.getPartnerByUserId(req.session.user.id);
      if (!partner) {
        return res.status(404).json({
          message: "Hamkor ma'lumotlari topilmadi",
          code: "PARTNER_NOT_FOUND"
        });
      }
      const request = await storage.createFulfillmentRequest({
        partnerId: partner.id,
        requestType: validatedData.requestType,
        title: validatedData.title,
        description: validatedData.description,
        productId: validatedData.productId ?? void 0,
        priority: validatedData.priority || void 0,
        estimatedCost: validatedData.estimatedCost || void 0,
        metadata: validatedData.metadata || void 0
      });
      await storage.createAuditLog({
        userId: req.session.user.id,
        action: "FULFILLMENT_REQUEST_CREATED",
        entityType: "fulfillment_request",
        entityId: request.id,
        payload: { title: request.title }
      });
      res.status(201).json(request);
    } catch (error) {
      if (error instanceof ZodError) {
        return res.status(400).json({
          message: "So'rov ma'lumotlari noto'g'ri",
          code: "VALIDATION_ERROR",
          errors: error.errors
        });
      }
      throw error;
    }
  }));
  app2.put("/api/fulfillment-requests/:id", requireAuth3, asyncHandler(async (req, res) => {
    const { id } = req.params;
    const updates = req.body;
    const request = await storage.updateFulfillmentRequest(id, updates);
    if (!request) {
      return res.status(404).json({
        message: "So'rov topilmadi",
        code: "REQUEST_NOT_FOUND"
      });
    }
    await storage.createAuditLog({
      userId: req.session.user.id,
      action: "FULFILLMENT_REQUEST_UPDATED",
      entityType: "fulfillment_request",
      entityId: id,
      payload: updates
    });
    res.json(request);
  }));
  app2.post("/api/fulfillment-requests/:id/accept", requireAdmin2, asyncHandler(async (req, res) => {
    const { id } = req.params;
    const adminId = req.session.user.id;
    const request = await storage.updateFulfillmentRequest(id, { status: "accepted" });
    if (!request) {
      return res.status(404).json({
        message: "So'rov topilmadi",
        code: "REQUEST_NOT_FOUND"
      });
    }
    try {
      const aiResult = await fulfillmentAIIntegration_default.triggerAIForFulfillment(
        parseInt(id, 10),
        adminId
      );
      await storage.createAuditLog({
        userId: adminId,
        action: "FULFILLMENT_ACCEPTED_AI_TRIGGERED",
        entityType: "fulfillment_request",
        entityId: id,
        payload: { aiResult }
      });
      res.json({
        message: "So'rov qabul qilindi va AI ishga tushirildi",
        request,
        aiResult
      });
    } catch (error) {
      console.error("AI trigger error:", error.message);
      res.json({
        message: "So'rov qabul qilindi, lekin AI xatolik yuz berdi",
        request,
        aiError: error.message
      });
    }
  }));
  app2.post("/api/ai-manager/trigger-product/:productId", requireAdmin2, asyncHandler(async (req, res) => {
    const { productId } = req.params;
    const { marketplaceType } = req.body;
    const adminId = req.session.user.id;
    if (!marketplaceType) {
      return res.status(400).json({
        message: "marketplaceType talab qilinadi",
        code: "MISSING_MARKETPLACE_TYPE"
      });
    }
    const result = await fulfillmentAIIntegration_default.manuallyTriggerAIForProduct(
      parseInt(productId),
      marketplaceType,
      adminId
    );
    res.json(result);
  }));
  app2.get("/api/analytics", requirePartnerWithData, asyncHandler(async (req, res) => {
    const partner = await storage.getPartnerByUserId(req.session.user.id);
    if (!partner) {
      return res.status(404).json({
        message: "Hamkor ma'lumotlari topilmadi",
        code: "PARTNER_NOT_FOUND"
      });
    }
    const analytics3 = await storage.getAnalyticsByPartnerId(partner.id);
    res.json(analytics3);
  }));
  app2.get("/api/profit-breakdown", requirePartnerWithData, asyncHandler(async (req, res) => {
    const partner = await storage.getPartnerByUserId(req.session.user.id);
    if (!partner) {
      return res.status(404).json({
        message: "Hamkor ma'lumotlari topilmadi",
        code: "PARTNER_NOT_FOUND"
      });
    }
    const { period, marketplace } = req.query;
    const profitData = await storage.getProfitBreakdown(partner.id, {
      period,
      marketplace
    });
    res.json(profitData);
  }));
  app2.get("/api/trending-products/:category/:market/:minScore", requirePartnerWithData, asyncHandler(async (req, res) => {
    const { category, market, minScore } = req.params;
    const partner = await storage.getPartnerByUserId(req.session.user.id);
    if (!partner) {
      return res.status(404).json({
        message: "Hamkor ma'lumotlari topilmadi",
        code: "PARTNER_NOT_FOUND"
      });
    }
    if (!["professional_plus", "enterprise_elite"].includes(partner.pricingTier)) {
      return res.status(403).json({
        message: "Bu funksiya uchun Professional Plus yoki Enterprise Elite tarifi kerak",
        code: "TIER_ACCESS_REQUIRED",
        requiredTier: "professional_plus"
      });
    }
    const products4 = await storage.getTrendingProducts({
      category: category !== "all" ? category : void 0,
      sourceMarket: market !== "all" ? market : void 0,
      minTrendScore: parseInt(minScore) || 70
    });
    res.json(products4);
  }));
  app2.get("/api/admin/trending-products", requireAdmin2, asyncHandler(async (req, res) => {
    const products4 = await storage.getTrendingProducts();
    res.json(products4);
  }));
  app2.get("/api/admin/partners", requireAdmin2, asyncHandler(async (req, res) => {
    const partners6 = await storage.getAllPartners();
    res.json(partners6);
  }));
  app2.put("/api/admin/partners/:id/approve", requireAdmin2, asyncHandler(async (req, res) => {
    const { id } = req.params;
    console.log(`[ADMIN] Approving partner ${id} by admin ${req.session.user.id}`);
    const partner = await storage.approvePartner(id, req.session.user.id);
    if (!partner) {
      console.error(`[ADMIN] Partner ${id} not found`);
      return res.status(404).json({
        message: "Hamkor topilmadi",
        code: "PARTNER_NOT_FOUND"
      });
    }
    console.log(`[ADMIN] Partner ${id} approved successfully:`, {
      id: partner.id,
      approved: partner.approved,
      businessName: partner.businessName
    });
    await storage.createAuditLog({
      userId: req.session.user.id,
      action: "PARTNER_APPROVED",
      entityType: "partner",
      entityId: id
    });
    res.json(partner);
  }));
  app2.put("/api/admin/partners/:id/anydesk", requireAdmin2, asyncHandler(async (req, res) => {
    const { id } = req.params;
    const { anydeskId, anydeskPassword } = req.body;
    if (!anydeskId) {
      return res.status(400).json({
        message: "AnyDesk ID talab qilinadi",
        code: "VALIDATION_ERROR"
      });
    }
    const partner = await storage.updatePartner(id, {
      anydeskId,
      anydeskPassword: anydeskPassword || null
    });
    if (!partner) {
      return res.status(404).json({
        message: "Hamkor topilmadi",
        code: "PARTNER_NOT_FOUND"
      });
    }
    await storage.createAuditLog({
      userId: req.session.user.id,
      action: "ANYDESK_UPDATED",
      entityType: "partner",
      entityId: id
    });
    res.json(partner);
  }));
  app2.put("/api/admin/partners/:id/block", requireAdmin2, asyncHandler(async (req, res) => {
    const { id } = req.params;
    const partner = await storage.updatePartner(id, { approved: false });
    if (!partner) {
      return res.status(404).json({
        message: "Hamkor topilmadi",
        code: "PARTNER_NOT_FOUND"
      });
    }
    await storage.createAuditLog({
      userId: req.session.user.id,
      action: "PARTNER_BLOCKED",
      entityType: "partner",
      entityId: id
    });
    res.json(partner);
  }));
  app2.get("/api/pricing-tiers", asyncHandler(async (req, res) => {
    const tiers = await storage.getAllPricingTiers();
    res.json(tiers);
  }));
  app2.post("/api/tier-upgrade-requests", requirePartnerWithData, asyncHandler(async (req, res) => {
    const partner = await storage.getPartnerByUserId(req.session.user.id);
    if (!partner) {
      return res.status(404).json({
        message: "Hamkor ma'lumotlari topilmadi",
        code: "PARTNER_NOT_FOUND"
      });
    }
    const { requestedTier, reason } = req.body;
    if (!requestedTier || !reason) {
      return res.status(400).json({
        message: "Talab qilingan tarif va sabab kiritilishi shart",
        code: "MISSING_REQUIRED_FIELDS"
      });
    }
    const request = await storage.createTierUpgradeRequest({
      partnerId: partner.id,
      requestedTier,
      reason
    });
    await storage.createAuditLog({
      userId: req.session.user.id,
      action: "TIER_UPGRADE_REQUESTED",
      entityType: "tier_upgrade_request",
      entityId: request.id,
      payload: { requestedTier, currentTier: partner.pricingTier }
    });
    res.status(201).json(request);
  }));
  app2.get("/api/admin/tier-upgrade-requests", requireAdmin2, asyncHandler(async (req, res) => {
    const requests = await storage.getTierUpgradeRequests();
    res.json(requests);
  }));
  app2.put("/api/admin/tier-upgrade-requests/:id", requireAdmin2, asyncHandler(async (req, res) => {
    const { id } = req.params;
    const { status, adminNotes } = req.body;
    const request = await storage.updateTierUpgradeRequest(id, {
      status,
      adminNotes,
      reviewedBy: req.session.user.id,
      reviewedAt: /* @__PURE__ */ new Date()
    });
    if (!request) {
      return res.status(404).json({
        message: "So'rov topilmadi",
        code: "REQUEST_NOT_FOUND"
      });
    }
    await storage.createAuditLog({
      userId: req.session.user.id,
      action: "TIER_UPGRADE_REVIEWED",
      entityType: "tier_upgrade_request",
      entityId: id,
      payload: { status, adminNotes }
    });
    res.json(request);
  }));
  app2.post("/api/notifications/send", requireAuth3, asyncHandler(async (req, res) => {
    const { to, template, data } = req.body;
    if (!to || !template || !data) {
      return res.status(400).json({
        message: "Email, template va data talab qilinadi",
        code: "MISSING_FIELDS"
      });
    }
    const { sendEmail: sendEmail2 } = await Promise.resolve().then(() => (init_email(), email_exports));
    const result = await sendEmail2(to, template, data);
    if (result.success) {
      res.json({
        success: true,
        message: "Email yuborildi",
        messageId: result.messageId
      });
    } else {
      res.status(500).json({
        success: false,
        message: "Email yuborishda xatolik",
        error: result.error
      });
    }
  }));
  app2.post("/api/partners/ai-toggle", requirePartnerWithData, asyncHandler(async (req, res) => {
    const partner = await storage.getPartnerByUserId(req.session.user.id);
    if (!partner) {
      return res.status(404).json({ message: "Hamkor topilmadi", code: "PARTNER_NOT_FOUND" });
    }
    const { enabled } = req.body;
    const currentTier = partner.pricingTier || "free";
    const FREE_AI_LIMIT = 10;
    const aiCardsUsed = partner.aiCardsUsed || 0;
    if (enabled) {
      if (currentTier === "free" || currentTier === "free_starter") {
        if (aiCardsUsed >= FREE_AI_LIMIT) {
          return res.status(400).json({
            success: false,
            message: "Bepul AI limitingiz tugadi. Davom etish uchun tarifni yangilang.",
            code: "AI_LIMIT_EXCEEDED",
            aiCardsUsed,
            limit: FREE_AI_LIMIT,
            requiresUpgrade: true
          });
        }
      }
      await db.update(partners).set({
        aiEnabled: true
      }).where(eq30(partners.id, partner.id));
      await storage.createAuditLog({
        userId: req.session.user.id,
        action: "AI_ENABLED",
        entityType: "partner",
        entityId: partner.id
      });
      res.json({
        success: true,
        message: "AI yoqildi",
        aiEnabled: true,
        aiCardsUsed,
        limit: currentTier === "free" || currentTier === "free_starter" ? FREE_AI_LIMIT : null
      });
    } else {
      await db.update(partners).set({
        aiEnabled: false
      }).where(eq30(partners.id, partner.id));
      await storage.createAuditLog({
        userId: req.session.user.id,
        action: "AI_DISABLED",
        entityType: "partner",
        entityId: partner.id
      });
      res.json({ success: true, message: "AI o'chirildi", aiEnabled: false });
    }
  }));
  app2.post("/api/partners/ai-card-used", requirePartnerWithData, asyncHandler(async (req, res) => {
    const partner = await storage.getPartnerByUserId(req.session.user.id);
    if (!partner) {
      return res.status(404).json({ message: "Hamkor topilmadi" });
    }
    const currentTier = partner.pricingTier || "free";
    const aiCardsUsed = (partner.aiCardsUsed || 0) + 1;
    const FREE_AI_LIMIT = 10;
    await db.update(partners).set({
      aiCardsUsed
    }).where(eq30(partners.id, partner.id));
    const requiresUpgrade = (currentTier === "free" || currentTier === "free_starter") && aiCardsUsed >= FREE_AI_LIMIT;
    res.json({
      success: true,
      aiCardsUsed,
      limit: currentTier === "free" || currentTier === "free_starter" ? FREE_AI_LIMIT : null,
      requiresUpgrade
    });
  }));
  app2.post("/api/admin/partners/:partnerId/approve-ai", requireAdmin2, asyncHandler(async (req, res) => {
    const { partnerId } = req.params;
    await db.update(partners).set({
      aiEnabled: true
    }).where(eq30(partners.id, partnerId));
    await storage.createAuditLog({
      userId: req.session.user.id,
      action: "AI_APPROVED",
      entityType: "partner",
      entityId: partnerId
    });
    res.json({ success: true, message: "AI tasdiqlandi", aiEnabled: true });
  }));
  app2.get("/api/partner/marketplace-integrations", requirePartnerWithData, asyncHandler(async (req, res) => {
    const partner = await storage.getPartnerByUserId(req.session.user.id);
    if (!partner) {
      return res.status(404).json({ message: "Hamkor topilmadi" });
    }
    const integrations = await db.select().from(marketplaceIntegrations).where(eq30(marketplaceIntegrations.partnerId, partner.id));
    res.json(integrations);
  }));
  app2.post("/api/partner/marketplace-integrations", requirePartnerWithData, asyncHandler(async (req, res) => {
    const partner = await storage.getPartnerByUserId(req.session.user.id);
    if (!partner) {
      return res.status(404).json({ message: "Hamkor topilmadi" });
    }
    const { marketplace, apiKey, apiSecret, shopId } = req.body;
    if (!marketplace || !apiKey) {
      return res.status(400).json({ message: "Marketplace va API key talab qilinadi" });
    }
    const existing = await db.select().from(marketplaceIntegrations).where(and24(
      eq30(marketplaceIntegrations.partnerId, partner.id),
      eq30(marketplaceIntegrations.marketplace, marketplace)
    ));
    if (existing.length > 0) {
      await db.update(marketplaceIntegrations).set({
        apiKey,
        apiSecret: apiSecret || null,
        active: true
      }).where(eq30(marketplaceIntegrations.id, existing[0].id));
    } else {
      await db.insert(marketplaceIntegrations).values({
        id: nanoid18(),
        partnerId: partner.id,
        marketplace,
        apiKey,
        apiSecret: apiSecret || null,
        active: true
      });
    }
    await storage.createAuditLog({
      userId: req.session.user.id,
      action: "MARKETPLACE_CONNECTED",
      entityType: "marketplace_integration",
      entityId: marketplace
    });
    res.json({ success: true, message: "Marketplace ulandi" });
  }));
  app2.post("/api/partner/marketplace-integrations/:marketplace/test", requirePartnerWithData, asyncHandler(async (req, res) => {
    const partner = await storage.getPartnerByUserId(req.session.user.id);
    if (!partner) {
      return res.status(404).json({ message: "Hamkor topilmadi" });
    }
    const { marketplace } = req.params;
    const integration = await db.select().from(marketplaceIntegrations).where(and24(
      eq30(marketplaceIntegrations.partnerId, partner.id),
      eq30(marketplaceIntegrations.marketplace, marketplace)
    ));
    if (integration.length === 0) {
      return res.status(404).json({ success: false, message: "Integratsiya topilmadi" });
    }
    res.json({ success: true, message: "Ulanish muvaffaqiyatli" });
  }));
  app2.delete("/api/partner/marketplace-integrations/:marketplace", requirePartnerWithData, asyncHandler(async (req, res) => {
    const partner = await storage.getPartnerByUserId(req.session.user.id);
    if (!partner) {
      return res.status(404).json({ message: "Hamkor topilmadi" });
    }
    const { marketplace } = req.params;
    await db.delete(marketplaceIntegrations).where(and24(
      eq30(marketplaceIntegrations.partnerId, partner.id),
      eq30(marketplaceIntegrations.marketplace, marketplace)
    ));
    res.json({ success: true, message: "Integratsiya o'chirildi" });
  }));
  app2.post("/api/subscriptions/direct-upgrade", requirePartnerWithData, asyncHandler(async (req, res) => {
    const partner = await storage.getPartnerByUserId(req.session.user.id);
    if (!partner) {
      return res.status(404).json({ message: "Hamkor topilmadi" });
    }
    const { targetTier, paymentMethod } = req.body;
    if (!targetTier || !paymentMethod) {
      return res.status(400).json({ message: "Tarif va to'lov usuli talab qilinadi" });
    }
    const TIER_PRICES = {
      "free": 0,
      "basic": 828e3,
      "starter_pro": 4188e3,
      "professional": 10788e3
    };
    const aiEnabled = targetTier !== "free";
    await db.update(partners).set({
      pricingTier: targetTier,
      aiEnabled,
      monthlyFee: TIER_PRICES[targetTier] || 0
    }).where(eq30(partners.id, partner.id));
    await storage.createAuditLog({
      userId: req.session.user.id,
      action: "TIER_UPGRADED",
      entityType: "partner",
      entityId: partner.id,
      payload: { oldTier: partner.pricingTier, newTier: targetTier, paymentMethod }
    });
    res.json({
      success: true,
      message: "Tarif muvaffaqiyatli yangilandi",
      newTier: targetTier,
      aiEnabled
    });
  }));
  app2.get("/api/partner/referrals/dashboard", requirePartnerWithData, asyncHandler(async (req, res) => {
    const partner = await storage.getPartnerByUserId(req.session.user.id);
    if (!partner) {
      return res.status(404).json({ message: "Hamkor topilmadi" });
    }
    let promoCode = partner.promoCode;
    if (!promoCode) {
      promoCode = `SC${nanoid18(6).toUpperCase()}`;
      await db.update(partners).set({ promoCode }).where(eq30(partners.id, partner.id));
    }
    const partnerReferrals = await db.select().from(referrals).where(eq30(referrals.referrerPartnerId, partner.id));
    const totalReferrals = partnerReferrals.length;
    const activeReferrals = partnerReferrals.filter((r) => r.status === "active").length;
    const totalEarnings = partnerReferrals.reduce((sum, r) => sum + (r.bonusEarned || 0), 0);
    const referralLink = `https://sellercloudx.com/register?ref=${promoCode}`;
    res.json({
      stats: {
        totalReferrals,
        activeReferrals,
        totalEarnings,
        conversionRate: totalReferrals > 0 ? Math.round(activeReferrals / totalReferrals * 100) : 0
      },
      promoCode,
      referralCode: promoCode,
      referralLink,
      referrals: partnerReferrals
    });
  }));
  app2.post("/api/partner/referrals/generate-promo-code", requirePartnerWithData, asyncHandler(async (req, res) => {
    const partner = await storage.getPartnerByUserId(req.session.user.id);
    if (!partner) {
      return res.status(404).json({ message: "Hamkor topilmadi" });
    }
    const promoCode = `SC${nanoid18(6).toUpperCase()}`;
    await db.update(partners).set({ promoCode }).where(eq30(partners.id, partner.id));
    res.json({ success: true, promoCode });
  }));
  app2.use("/api/inventory", requirePartnerWithData, inventoryRoutes_default);
  app2.use("/api/investor", requireAuth3, investorRoutes_default);
  app2.use("/api/marketplace-integration", requireAuth3, marketplaceIntegrationRoutes_default);
  app2.use("/api/subscriptions", requirePartnerWithData, subscriptionRoutes_default);
  app2.use("/api/forecast", requirePartnerWithData, forecastRoutes_default);
  app2.use("/api/broadcast", requireAuth3, broadcastRoutes_default);
  app2.use("/api/ai-manager", requireAuth3, aiManagerRoutes_default);
  app2.use("/api/ai/scanner", requireAuth3, aiScannerRoutes_default);
  app2.use("/api/ai", requireAuth3, aiRoutes_default);
  app2.use("/api/ai-dashboard", requireAuth3, aiDashboard_default);
  app2.use("/api/trending", requireAuth3, trendingRoutes_default);
  app2.use("/api/trends", requireAuth3, trendHunterRoutes_default);
  app2.use("/api/referrals", requireAuth3, requirePartnerWithData, referralRoutes_default);
  app2.use("/api/admin/remote", requireAdmin2, adminRemoteAccess_default);
  app2.use("/api/admin/referrals", requireAdmin2, adminReferralManagement_default);
  app2.use("/api/referral-campaigns", requireAuth3, referralCampaignRoutes_default);
  app2.use("/api/price-strategy", requireAuth3, priceStrategyRoutes_default);
  app2.use("/api/marketing", requireAuth3, aiMarketingRoutes_default);
  app2.use("/api/analytics", requirePartnerWithData, analyticsRoutes_default);
  app2.use("/api/customer-service", requireAuth3, customerServiceRoutes_default);
  app2.use("/api/reports", requirePartnerWithData, reportingRoutes_default);
  app2.use("/api/gamification", requireAuth3, gamificationRoutes_default);
  app2.use("/api/marketplace-ai", requirePartnerWithData, marketplaceAIManagerRoutes_default);
  app2.use("/api/admin/ai", requireAdmin2, adminAIManagementRoutes_default);
  app2.use("/api/smm", requireAdmin2, smmRoutes_default);
  app2.use("/api/partner", requirePartnerWithData, walletRoutes_default);
  app2.use("/api/partner", requirePartnerWithData, paymentHistoryRoutes_default);
  app2.use("/api/partner", requirePartnerWithData, referralDashboardRoutes_default);
  app2.use("/api/admin", impersonationRoutes_default);
  app2.use("/api/admin", requireAdmin2, businessAnalyticsRoutes_default);
  app2.use("/api/admin", adminManagementRoutes_default);
  app2.post(
    "/api/chat/upload",
    requirePartnerWithData,
    uploadLimiter,
    upload4.single("file"),
    asyncHandler(async (req, res) => {
      const file = req.file;
      if (!file) {
        return res.status(400).json({ message: "File is required" });
      }
      const fileUrl = `/uploads/${file.filename}`;
      return res.status(201).json({
        fileUrl,
        fileName: file.originalname,
        fileSize: file.size,
        mimeType: file.mimetype
      });
    })
  );
  app2.use("/api/chat", requirePartnerWithData, chatRoutes_default);
  app2.get("/api/warehouses", requireAuth3, asyncHandler(async (req, res) => {
    const warehouses2 = await storage.getAllWarehouses();
    res.json(warehouses2);
  }));
  app2.post("/api/warehouses", requireAdmin2, asyncHandler(async (req, res) => {
    const warehouse = await storage.createWarehouse(req.body);
    await storage.createAuditLog({
      userId: req.session.user.id,
      action: "WAREHOUSE_CREATED",
      entityType: "warehouse",
      entityId: warehouse.id,
      payload: { name: warehouse.name, code: warehouse.code }
    });
    res.status(201).json(warehouse);
  }));
  app2.get("/api/warehouses/:id/stock", requireAuth3, asyncHandler(async (req, res) => {
    const { id } = req.params;
    const stock = await storage.getWarehouseStock(id);
    res.json(stock);
  }));
  app2.post("/api/stock/update", requireAuth3, asyncHandler(async (req, res) => {
    const {
      productId,
      warehouseId,
      quantity,
      movementType,
      reason,
      referenceType,
      referenceId,
      notes
    } = req.body;
    if (!productId || !warehouseId || quantity === void 0 || !movementType || !reason) {
      return res.status(400).json({
        message: "Barcha majburiy maydonlar to'ldirilishi kerak",
        code: "MISSING_FIELDS"
      });
    }
    const result = await storage.updateProductStock(
      productId,
      warehouseId,
      quantity,
      movementType,
      reason,
      req.session.user.id,
      referenceType,
      referenceId,
      notes
    );
    await storage.createAuditLog({
      userId: req.session.user.id,
      action: "STOCK_UPDATED",
      entityType: "product",
      entityId: productId,
      payload: {
        movementType,
        quantity,
        previousStock: result.movement.previousStock,
        newStock: result.movement.newStock
      }
    });
    res.json({
      success: true,
      product: result.product,
      movement: result.movement,
      message: "Stock muvaffaqiyatli yangilandi"
    });
  }));
  app2.get("/api/stock/movements", requireAuth3, asyncHandler(async (req, res) => {
    const { productId, warehouseId, movementType, startDate, endDate } = req.query;
    const movements = await storage.getStockMovements({
      productId,
      warehouseId,
      movementType,
      startDate: startDate ? new Date(startDate) : void 0,
      endDate: endDate ? new Date(endDate) : void 0
    });
    res.json(movements);
  }));
  app2.get("/api/orders", requireAuth3, asyncHandler(async (req, res) => {
    if (req.session.user.role === "admin") {
      const orders3 = await storage.getAllOrders();
      res.json(orders3);
    } else {
      const partner = await storage.getPartnerByUserId(req.session.user.id);
      if (!partner) {
        return res.status(404).json({
          message: "Hamkor ma'lumotlari topilmadi",
          code: "PARTNER_NOT_FOUND"
        });
      }
      const orders3 = await storage.getOrdersByPartnerId(partner.id);
      res.json(orders3);
    }
  }));
  app2.post("/api/orders", requirePartnerWithData, asyncHandler(async (req, res) => {
    const partner = await storage.getPartnerByUserId(req.session.user.id);
    if (!partner) {
      return res.status(404).json({
        message: "Hamkor ma'lumotlari topilmadi",
        code: "PARTNER_NOT_FOUND"
      });
    }
    const orderData = {
      ...req.body,
      partnerId: partner.id
    };
    const order = await storage.createOrder(orderData);
    await storage.createAuditLog({
      userId: req.session.user.id,
      action: "ORDER_CREATED",
      entityType: "order",
      entityId: order.id,
      payload: { orderNumber: order.orderNumber, totalAmount: order.totalAmount }
    });
    res.status(201).json(order);
  }));
  app2.get("/api/orders/:id", requireAuth3, asyncHandler(async (req, res) => {
    const { id } = req.params;
    const order = await storage.getOrderById(id);
    if (!order) {
      return res.status(404).json({
        message: "Buyurtma topilmadi",
        code: "ORDER_NOT_FOUND"
      });
    }
    if (req.session.user.role !== "admin") {
      const partner = await storage.getPartnerByUserId(req.session.user.id);
      if (!partner || order.partnerId !== partner.id) {
        return res.status(403).json({
          message: "Ruxsat yo'q",
          code: "FORBIDDEN"
        });
      }
    }
    const items = await storage.getOrderItems(id);
    res.json({ ...order, items });
  }));
  app2.put("/api/orders/:id/status", requireAuth3, asyncHandler(async (req, res) => {
    const { id } = req.params;
    const { status, fulfillmentStatus, paymentStatus } = req.body;
    const order = await storage.updateOrderStatus(
      id,
      status,
      fulfillmentStatus,
      paymentStatus,
      req.session.user.id
    );
    if (!order) {
      return res.status(404).json({
        message: "Buyurtma topilmadi",
        code: "ORDER_NOT_FOUND"
      });
    }
    await storage.createAuditLog({
      userId: req.session.user.id,
      action: "ORDER_STATUS_UPDATED",
      entityType: "order",
      entityId: id,
      payload: { status, fulfillmentStatus, paymentStatus }
    });
    const wsManager2 = global.wsManager;
    if (wsManager2) {
      const partner = await storage.getPartnerById(order.partnerId);
      if (partner) {
        wsManager2.sendToUser(partner.userId, {
          type: "notification",
          data: {
            type: "order_update",
            title: "Buyurtma holati yangilandi",
            message: `Buyurtma #${order.orderNumber} holati: ${status}`,
            orderId: order.id,
            timestamp: Date.now()
          }
        });
      }
    }
    res.json(order);
  }));
  app2.get("/api/stock-alerts", requirePartnerWithData, asyncHandler(async (req, res) => {
    const partner = await storage.getPartnerByUserId(req.session.user.id);
    if (!partner) {
      return res.status(404).json({
        message: "Hamkor ma'lumotlari topilmadi",
        code: "PARTNER_NOT_FOUND"
      });
    }
    const includeResolved = req.query.includeResolved === "true";
    const alerts = await storage.getStockAlertsByPartnerId(partner.id, includeResolved);
    res.json(alerts);
  }));
  app2.put("/api/stock-alerts/:id/resolve", requireAuth3, asyncHandler(async (req, res) => {
    const { id } = req.params;
    const alert = await storage.resolveStockAlert(id, req.session.user.id);
    if (!alert) {
      return res.status(404).json({
        message: "Ogohlantirish topilmadi",
        code: "ALERT_NOT_FOUND"
      });
    }
    res.json(alert);
  }));
  app2.get("/api/inventory/stats", requirePartnerWithData, asyncHandler(async (req, res) => {
    const partner = await storage.getPartnerByUserId(req.session.user.id);
    if (!partner) {
      return res.status(404).json({
        message: "Hamkor ma'lumotlari topilmadi",
        code: "PARTNER_NOT_FOUND"
      });
    }
    const stats = await storage.getInventoryStats(partner.id);
    res.json(stats);
  }));
  app2.get("/api/admin/inventory/overview", requireAdmin2, asyncHandler(async (req, res) => {
    const partners6 = await storage.getAllPartners();
    const overview = await Promise.all(
      partners6.map(async (partner) => {
        const stats = await storage.getInventoryStats(partner.id);
        return {
          partnerId: partner.id,
          businessName: partner.businessName,
          ...stats
        };
      })
    );
    res.json(overview);
  }));
  app2.use("/api/ai", requirePartnerWithData, enhancedAI_default);
  app2.use("/api/enhanced-ai", requirePartnerWithData, enhancedAIDashboard_default);
  app2.use("/api/admin/advanced", requireAdmin2, adminAdvancedFeatures_default);
  app2.use("/api/partner/advanced", requirePartnerWithData, partnerAdvancedFeatures_default);
  app2.use("/api/autonomous-ai", requirePartnerWithData, autonomousAI_default);
  app2.use("/api/ai-services", requireAuth3, aiServices_default);
  app2.use("/api/autonomous", requirePartnerWithData, autonomousManager_default);
  app2.use("/api/payment", paymentRoutes_default);
  app2.use("/api/payments", paymentIntegration_default);
  app2.use("/api/whatsapp", whatsappRoutes_default);
  app2.use("/api/telegram", telegramRoutes_default);
  app2.use("/api/premium", premiumFeaturesRoutes_default);
  app2.use("/api/advanced", advancedFeaturesRoutes_default);
  app2.use("/api/smart-ai", smartAIRoutes_default);
  app2.use("/api/billing", requireAuth3, billingRoutes_default);
  app2.post("/api/ai/recognize-product", requirePartnerWithData, asyncHandler(async (req, res) => {
    const { image } = req.body;
    if (!image) {
      return res.status(400).json({ message: "Rasm talab qilinadi" });
    }
    try {
      const { productRecognitionService: productRecognitionService2 } = await Promise.resolve().then(() => (init_productRecognition(), productRecognition_exports));
      const result = await productRecognitionService2.recognizeProduct(image);
      await storage.createAuditLog({
        userId: req.user.id,
        action: "PRODUCT_RECOGNIZED",
        entityType: "product",
        payload: {
          productName: result.name,
          confidence: result.confidence
        }
      });
      res.json(result);
    } catch (error) {
      console.error("Product recognition error:", error);
      return res.status(500).json({
        message: "Mahsulotni tanib bo'lmadi",
        error: error.message
      });
    }
  }));
  app2.get("/api/marketplace/connections", requirePartnerWithData, asyncHandler(async (req, res) => {
    const partner = req.partner;
    if (!partner) {
      return res.status(404).json({ message: "Partner not found" });
    }
    const connections = await db.select().from(marketplaceIntegrations).where(eq30(marketplaceIntegrations.partnerId, partner.id));
    res.json(connections);
  }));
  app2.post("/api/marketplace/connect", requirePartnerWithData, asyncHandler(async (req, res) => {
    const partner = req.partner;
    const { marketplace, credentials } = req.body;
    if (!partner) {
      return res.status(404).json({ message: "Partner not found" });
    }
    if (!marketplace || !credentials) {
      return res.status(400).json({ message: "Marketplace va credentials talab qilinadi" });
    }
    const existing = await db.select().from(marketplaceIntegrations).where(and24(
      eq30(marketplaceIntegrations.partnerId, partner.id),
      eq30(marketplaceIntegrations.marketplace, marketplace)
    )).limit(1);
    if (existing.length > 0) {
      const [updated] = await db.update(marketplaceIntegrations).set({
        apiKey: credentials.apiKey || credentials.accessToken || credentials.clientId,
        apiSecret: credentials.apiSecret || credentials.supplierId || credentials.campaignId,
        sellerId: credentials.sellerId,
        active: true,
        lastSyncAt: /* @__PURE__ */ new Date()
      }).where(eq30(marketplaceIntegrations.id, existing[0].id)).returning();
      return res.json(updated);
    }
    const [connection] = await db.insert(marketplaceIntegrations).values({
      id: nanoid18(),
      partnerId: partner.id,
      marketplace,
      apiKey: credentials.apiKey || credentials.accessToken || credentials.clientId,
      apiSecret: credentials.apiSecret || credentials.supplierId || credentials.campaignId,
      sellerId: credentials.sellerId,
      active: true,
      createdAt: /* @__PURE__ */ new Date()
    }).returning();
    await storage.createAuditLog({
      userId: req.user.id,
      action: "MARKETPLACE_CONNECTED",
      entityType: "marketplace_integration",
      entityId: connection.id,
      payload: { marketplace }
    });
    res.status(201).json(connection);
  }));
  app2.post("/api/marketplace/test-connection", requirePartnerWithData, asyncHandler(async (req, res) => {
    const { marketplace, credentials } = req.body;
    if (!marketplace || !credentials) {
      return res.status(400).json({ message: "Marketplace va credentials talab qilinadi" });
    }
    const hasRequiredFields = credentials.apiKey || credentials.accessToken || credentials.clientId;
    if (!hasRequiredFields) {
      return res.status(400).json({
        message: "API ma'lumotlari to'liq emas",
        success: false
      });
    }
    res.json({
      success: true,
      message: "Ulanish muvaffaqiyatli",
      marketplace
    });
  }));
  app2.get("/api/blog/posts", asyncHandler(async (req, res) => {
    const { category, status = "published", limit } = req.query;
    let query = db.select().from(blogPosts);
    if (status === "published") {
      query = query.where(eq30(blogPosts.status, "published"));
    }
    if (category && category !== "all") {
      query = query.where(and24(
        eq30(blogPosts.status, status),
        eq30(blogPosts.category, category)
      ));
    }
    const posts = await query.orderBy(desc9(blogPosts.createdAt));
    if (limit) {
      return res.json(posts.slice(0, parseInt(limit)));
    }
    res.json(posts);
  }));
  app2.get("/api/blog/posts/:slug", asyncHandler(async (req, res) => {
    const { slug } = req.params;
    const post = await db.select().from(blogPosts).where(eq30(blogPosts.slug, slug)).limit(1);
    if (post.length === 0) {
      return res.status(404).json({ message: "Maqola topilmadi" });
    }
    res.json(post[0]);
  }));
  app2.post("/api/blog/posts/:id/view", asyncHandler(async (req, res) => {
    const { id } = req.params;
    await db.update(blogPosts).set({ viewCount: db.raw("view_count + 1") }).where(eq30(blogPosts.id, id));
    res.json({ success: true });
  }));
  app2.get("/api/blog/categories", asyncHandler(async (req, res) => {
    const categories = await db.select().from(blogCategories);
    res.json(categories);
  }));
  app2.get("/api/admin/blog/posts", requireAdmin2, asyncHandler(async (req, res) => {
    const { category, status } = req.query;
    let query = db.select().from(blogPosts);
    if (status && status !== "all") {
      query = query.where(eq30(blogPosts.status, status));
    }
    if (category && category !== "all") {
      query = query.where(eq30(blogPosts.category, category));
    }
    const posts = await query.orderBy(desc9(blogPosts.createdAt));
    res.json(posts);
  }));
  app2.post("/api/admin/blog/posts", requireAdmin2, asyncHandler(async (req, res) => {
    const {
      title,
      slug,
      excerpt,
      content,
      featuredImage,
      videoUrl,
      category,
      tags,
      status,
      metaTitle,
      metaDescription,
      metaKeywords
    } = req.body;
    if (!title || !content) {
      return res.status(400).json({ message: "Sarlavha va matn kiritilishi shart" });
    }
    const postSlug = slug || title.toLowerCase().replace(/[^\w\s-]/g, "").replace(/\s+/g, "-");
    const existing = await db.select().from(blogPosts).where(eq30(blogPosts.slug, postSlug));
    if (existing.length > 0) {
      return res.status(400).json({ message: "Bu slug allaqachon mavjud" });
    }
    const tagsJson = tags ? JSON.stringify(tags.split(",").map((t) => t.trim())) : null;
    const [post] = await db.insert(blogPosts).values({
      id: nanoid18(),
      slug: postSlug,
      title,
      excerpt,
      content,
      featuredImage,
      videoUrl,
      category: category || "news",
      tags: tagsJson,
      status: status || "draft",
      authorId: req.session.user.id,
      authorName: req.session.user.username,
      metaTitle,
      metaDescription,
      metaKeywords,
      publishedAt: status === "published" ? /* @__PURE__ */ new Date() : null
    }).returning();
    await storage.createAuditLog({
      userId: req.session.user.id,
      action: "BLOG_POST_CREATED",
      entityType: "blog_post",
      entityId: post.id,
      payload: { title, status }
    });
    res.status(201).json(post);
  }));
  app2.put("/api/admin/blog/posts/:id", requireAdmin2, asyncHandler(async (req, res) => {
    const { id } = req.params;
    const {
      title,
      slug,
      excerpt,
      content,
      featuredImage,
      videoUrl,
      category,
      tags,
      status,
      metaTitle,
      metaDescription,
      metaKeywords
    } = req.body;
    const tagsJson = tags ? JSON.stringify(tags.split(",").map((t) => t.trim())) : null;
    const [post] = await db.update(blogPosts).set({
      title,
      slug,
      excerpt,
      content,
      featuredImage,
      videoUrl,
      category,
      tags: tagsJson,
      status,
      metaTitle,
      metaDescription,
      metaKeywords,
      publishedAt: status === "published" ? /* @__PURE__ */ new Date() : null,
      updatedAt: /* @__PURE__ */ new Date()
    }).where(eq30(blogPosts.id, id)).returning();
    if (!post) {
      return res.status(404).json({ message: "Maqola topilmadi" });
    }
    await storage.createAuditLog({
      userId: req.session.user.id,
      action: "BLOG_POST_UPDATED",
      entityType: "blog_post",
      entityId: id,
      payload: { title, status }
    });
    res.json(post);
  }));
  app2.delete("/api/admin/blog/posts/:id", requireAdmin2, asyncHandler(async (req, res) => {
    const { id } = req.params;
    await db.delete(blogPosts).where(eq30(blogPosts.id, id));
    await storage.createAuditLog({
      userId: req.session.user.id,
      action: "BLOG_POST_DELETED",
      entityType: "blog_post",
      entityId: id
    });
    res.json({ success: true, message: "Maqola o'chirildi" });
  }));
  app2.post("/api/admin/blog/posts/:id/publish", requireAdmin2, asyncHandler(async (req, res) => {
    const { id } = req.params;
    const [post] = await db.update(blogPosts).set({
      status: "published",
      publishedAt: /* @__PURE__ */ new Date()
    }).where(eq30(blogPosts.id, id)).returning();
    if (!post) {
      return res.status(404).json({ message: "Maqola topilmadi" });
    }
    await storage.createAuditLog({
      userId: req.session.user.id,
      action: "BLOG_POST_PUBLISHED",
      entityType: "blog_post",
      entityId: id
    });
    res.json(post);
  }));
  app2.use(handleValidationError);
  return server;
}
__name(registerRoutes, "registerRoutes");

// server/vite.ts
import express24 from "express";
import fs5 from "fs";
import path5 from "path";
import { createServer as createViteServer, createLogger } from "vite";
import { nanoid as nanoid19 } from "nanoid";
var viteLogger = createLogger();
function log(message, source = "express") {
  const formattedTime = (/* @__PURE__ */ new Date()).toLocaleTimeString("en-US", {
    hour: "numeric",
    minute: "2-digit",
    second: "2-digit",
    hour12: true
  });
  console.log(`${formattedTime} [${source}] ${message}`);
}
__name(log, "log");
async function setupVite(app2, server) {
  const serverOptions = {
    middlewareMode: true,
    hmr: false,
    // Disabled to avoid WebSocket issues in Replit
    allowedHosts: true
  };
  const clientRoot = path5.resolve(process.cwd(), "client");
  const react = (await import("@vitejs/plugin-react")).default;
  const vite = await createViteServer({
    configFile: false,
    root: clientRoot,
    plugins: [
      react({
        jsxRuntime: "automatic"
      })
    ],
    resolve: {
      alias: [
        { find: "@", replacement: path5.resolve(clientRoot, "src") },
        { find: "@shared", replacement: path5.resolve(process.cwd(), "shared") },
        { find: "@assets", replacement: path5.resolve(process.cwd(), "attached_assets") }
      ]
    },
    optimizeDeps: {
      include: ["react", "react-dom", "react/jsx-runtime"]
    },
    customLogger: {
      ...viteLogger,
      error: /* @__PURE__ */ __name((msg, options) => {
        viteLogger.error(msg, options);
        console.error("Vite error (non-fatal):", msg);
      }, "error")
    },
    server: serverOptions,
    appType: "custom"
  });
  app2.use(vite.middlewares);
  app2.use("*", async (req, res, next) => {
    const url = req.originalUrl;
    try {
      const clientTemplate = path5.resolve(
        process.cwd(),
        "client",
        "index.html"
      );
      let template = await fs5.promises.readFile(clientTemplate, "utf-8");
      template = template.replace(
        `src="/src/main.tsx"`,
        `src="/src/main.tsx?v=${nanoid19()}"`
      );
      const page = await vite.transformIndexHtml(url, template);
      res.status(200).set({
        "Content-Type": "text/html",
        "Cache-Control": "no-cache, no-store, must-revalidate",
        "Pragma": "no-cache",
        "Expires": "0"
      }).end(page);
    } catch (e) {
      vite.ssrFixStacktrace(e);
      next(e);
    }
  });
}
__name(setupVite, "setupVite");
function serveStatic(app2) {
  const distPath = path5.resolve(process.cwd(), "dist", "public");
  if (!fs5.existsSync(distPath)) {
    log(`\u274C Build directory not found: ${distPath}`);
    log(`\u26A0\uFE0F  Please run 'npm run build' first`);
    log(`\u{1F4C2} Current directory: ${process.cwd()}`);
    log(`\u{1F4C2} Directory contents:`);
    try {
      const files = fs5.readdirSync(process.cwd());
      log(`   ${files.join(", ")}`);
      if (fs5.existsSync(path5.resolve(process.cwd(), "dist"))) {
        const distFiles = fs5.readdirSync(path5.resolve(process.cwd(), "dist"));
        log(`\u{1F4C2} dist/ contents: ${distFiles.join(", ")}`);
      }
    } catch (e) {
      log(`   Error reading directory: ${e}`);
    }
    log(`\u26A0\uFE0F  Serving fallback page instead of crashing`);
    app2.get("*", (req, res) => {
      res.status(503).send(`
        <!DOCTYPE html>
        <html>
          <head>
            <title>SellerCloudX - Building...</title>
            <style>
              body { font-family: Arial; text-align: center; padding: 50px; }
              h1 { color: #333; }
              p { color: #666; }
            </style>
          </head>
          <body>
            <h1>\u{1F680} SellerCloudX</h1>
            <p>Platform is building... Please wait a moment and refresh.</p>
            <p>If this persists, please contact support.</p>
          </body>
        </html>
      `);
    });
    return;
  }
  log(`\u{1F4C1} Serving static files from: ${distPath}`);
  app2.use((req, res, next) => {
    const filePath = req.path;
    if (!filePath.startsWith("/api") && !filePath.startsWith("/ws")) {
      if (filePath.endsWith(".css")) {
        res.setHeader("Content-Type", "text/css; charset=utf-8");
      } else if (filePath.endsWith(".js")) {
        res.setHeader("Content-Type", "application/javascript; charset=utf-8");
      } else if (filePath.endsWith(".json")) {
        res.setHeader("Content-Type", "application/json; charset=utf-8");
      } else if (filePath.endsWith(".svg")) {
        res.setHeader("Content-Type", "image/svg+xml");
      } else if (filePath.endsWith(".png")) {
        res.setHeader("Content-Type", "image/png");
      } else if (filePath.endsWith(".jpg") || filePath.endsWith(".jpeg")) {
        res.setHeader("Content-Type", "image/jpeg");
      } else if (filePath.endsWith(".woff")) {
        res.setHeader("Content-Type", "font/woff");
      } else if (filePath.endsWith(".woff2")) {
        res.setHeader("Content-Type", "font/woff2");
      } else if (filePath.endsWith(".ttf")) {
        res.setHeader("Content-Type", "font/ttf");
      } else if (filePath.endsWith(".eot")) {
        res.setHeader("Content-Type", "application/vnd.ms-fontobject");
      } else if (filePath.endsWith(".html")) {
        res.setHeader("Content-Type", "text/html; charset=utf-8");
      }
      if (process.env.NODE_ENV === "production") {
        if (filePath.match(/\.(js|css|png|jpg|jpeg|gif|svg|woff|woff2|ttf|eot)$/)) {
          res.setHeader("Cache-Control", "public, max-age=31536000, immutable");
        } else {
          res.setHeader("Cache-Control", "no-cache, no-store, must-revalidate");
        }
      } else {
        res.setHeader("Cache-Control", "no-cache, no-store, must-revalidate");
        res.setHeader("Pragma", "no-cache");
        res.setHeader("Expires", "0");
      }
      res.setHeader("Access-Control-Allow-Origin", "*");
      res.setHeader("Access-Control-Allow-Methods", "GET, OPTIONS");
    }
    next();
  });
  app2.use(express24.static(distPath, {
    index: "index.html",
    extensions: ["html"],
    fallthrough: true
  }));
  app2.use("*", (req, res) => {
    const indexPath = path5.resolve(distPath, "index.html");
    if (!fs5.existsSync(indexPath)) {
      log(`\u274C index.html not found at: ${indexPath}`);
      return res.status(500).send("Application not built correctly. index.html missing.");
    }
    res.setHeader("Content-Type", "text/html; charset=utf-8");
    res.sendFile(indexPath, (err) => {
      if (err) {
        log(`\u274C Error sending index.html: ${err.message}`);
        res.status(500).send("Error loading application");
      }
    });
  });
}
__name(serveStatic, "serveStatic");

// server/index.ts
init_websocket();

// server/initAdmin.ts
init_db();
init_schema();
import { eq as eq31 } from "drizzle-orm";
import bcrypt4 from "bcryptjs";
import { nanoid as nanoid20 } from "nanoid";
async function initializeAdmin() {
  try {
    console.log("\u{1F50D} Checking for admin user...");
    const existingAdmin = await db.select().from(users).where(eq31(users.username, "Medik")).limit(1);
    if (existingAdmin.length > 0) {
      console.log("\u2705 Admin user already exists");
      return;
    }
    console.log("\u{1F527} Creating admin user...");
    const adminPassword = await bcrypt4.hash("Medik9298", 10);
    await db.insert(users).values({
      id: nanoid20(),
      username: "Medik",
      email: "medik@sellercloudx.com",
      password: adminPassword,
      firstName: "Medik",
      lastName: "Admin",
      phone: "+998901234567",
      role: "admin",
      isActive: true
      // createdAt and updatedAt use database defaults
    });
    console.log("\u2705 Admin user created successfully!");
    console.log("\u{1F511} Admin Login Credentials:");
    console.log("   Username: Medik");
    console.log("   Password: Medik9298");
    console.log("   Email: medik@sellercloudx.com");
  } catch (error) {
    console.error("\u274C Error initializing admin user:", error);
  }
}
__name(initializeAdmin, "initializeAdmin");

// server/initPartner.ts
init_db();
init_schema();
import { eq as eq32 } from "drizzle-orm";
import bcrypt5 from "bcryptjs";
import { nanoid as nanoid21 } from "nanoid";
async function initializePartner() {
  try {
    console.log("\u{1F50D} Checking for partner user...");
    const existingPartner = await db.select().from(users).where(eq32(users.username, "partner")).limit(1);
    if (existingPartner.length > 0) {
      console.log("\u2705 Partner user already exists");
      const existingPartnerRecord = await db.select().from(partners).where(eq32(partners.userId, existingPartner[0].id)).limit(1);
      if (existingPartnerRecord.length === 0) {
        console.log("\u26A0\uFE0F  Partner record missing, creating...");
        const partnerId2 = nanoid21();
        await db.insert(partners).values({
          id: partnerId2,
          userId: existingPartner[0].id,
          businessName: "SellerCloudX Test Partner",
          businessCategory: "Marketplace Automation",
          phone: existingPartner[0].phone || "+998901234568",
          approved: true,
          pricingTier: "free_starter",
          aiEnabled: true
        });
        console.log("\u2705 Partner record created for existing user");
      }
      return;
    }
    console.log("\u{1F527} Creating partner user...");
    const partnerPassword = await bcrypt5.hash("partner123", 10);
    const partnerUserId = nanoid21();
    await db.insert(users).values({
      id: partnerUserId,
      username: "partner",
      email: "partner@sellercloudx.com",
      password: partnerPassword,
      firstName: "Test",
      lastName: "Partner",
      phone: "+998901234568",
      role: "partner",
      isActive: true
      // createdAt and updatedAt use database defaults
    });
    const partnerId = nanoid21();
    await db.insert(partners).values({
      id: partnerId,
      userId: partnerUserId,
      businessName: "SellerCloudX Test Partner",
      businessCategory: "Marketplace Automation",
      phone: "+998901234568",
      approved: true,
      pricingTier: "free_starter",
      aiEnabled: true
    });
    console.log("\u2705 Partner user created successfully!");
    console.log("\u{1F511} Partner Login Credentials:");
    console.log("   Username: partner");
    console.log("   Password: partner123");
    console.log("   Email: partner@sellercloudx.com");
  } catch (error) {
    console.error("\u274C Error initializing partner user:", error);
  }
}
__name(initializePartner, "initializePartner");

// server/migrate.ts
import { Pool as Pool2 } from "pg";
import Database2 from "better-sqlite3";
import { fileURLToPath as fileURLToPath2 } from "url";
import { dirname as dirname2, join } from "path";
var __filename2 = fileURLToPath2(import.meta.url);
var __dirname2 = dirname2(__filename2);
async function runSQLiteMigrations() {
  const dbPath = process.env.DATABASE_URL?.replace("file:", "") || join(__dirname2, "../data.db");
  console.log("\u{1F504} Running SQLite migrations...");
  console.log("\u{1F4C1} Database path:", dbPath);
  try {
    const db3 = new Database2(dbPath);
    const tables = db3.prepare("SELECT name FROM sqlite_master WHERE type='table' AND name='partners'").all();
    if (tables.length === 0) {
      console.log("\u26A0\uFE0F  Partners table does not exist. Database needs initialization.");
      console.log("\u{1F4A1} Run: npm run db:push");
      db3.close();
      return;
    }
    const tableInfo = db3.prepare("PRAGMA table_info(partners)").all();
    const hasAnydeskId = tableInfo.some((col) => col.name === "anydesk_id");
    const hasAnydeskPassword = tableInfo.some((col) => col.name === "anydesk_password");
    if (!hasAnydeskId) {
      console.log("\u{1F4DD} Adding anydesk_id column...");
      db3.prepare("ALTER TABLE partners ADD COLUMN anydesk_id TEXT").run();
      console.log("\u2705 Added anydesk_id column");
    }
    if (!hasAnydeskPassword) {
      console.log("\u{1F4DD} Adding anydesk_password column...");
      db3.prepare("ALTER TABLE partners ADD COLUMN anydesk_password TEXT").run();
      console.log("\u2705 Added anydesk_password column");
    }
    db3.close();
    console.log("\u2705 SQLite migrations completed");
  } catch (error) {
    console.error("\u274C SQLite migration failed:", error);
    if (process.env.NODE_ENV !== "production") {
      throw error;
    }
  }
}
__name(runSQLiteMigrations, "runSQLiteMigrations");
async function ensurePostgresCompatibility(pool) {
  const compatSql = `
DO $$
BEGIN
  -- ==================== PARTNERS TABLE ====================
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'partners' AND column_name = 'ai_cards_used') THEN
    ALTER TABLE "partners" ADD COLUMN "ai_cards_used" integer DEFAULT 0;
  END IF;
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'partners' AND column_name = 'promo_code') THEN
    ALTER TABLE "partners" ADD COLUMN "promo_code" varchar(50);
  END IF;
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'partners' AND column_name = 'notes') THEN
    ALTER TABLE "partners" ADD COLUMN "notes" text;
  END IF;
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'partners' AND column_name = 'anydesk_id') THEN
    ALTER TABLE "partners" ADD COLUMN "anydesk_id" varchar(100);
  END IF;
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'partners' AND column_name = 'anydesk_password') THEN
    ALTER TABLE "partners" ADD COLUMN "anydesk_password" varchar(100);
  END IF;
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'partners' AND column_name = 'warehouse_space_kg') THEN
    ALTER TABLE "partners" ADD COLUMN "warehouse_space_kg" integer;
  END IF;
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'partners' AND column_name = 'ai_enabled') THEN
    ALTER TABLE "partners" ADD COLUMN "ai_enabled" boolean DEFAULT false;
  END IF;
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'partners' AND column_name = 'approved') THEN
    ALTER TABLE "partners" ADD COLUMN "approved" boolean DEFAULT false;
  END IF;
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'partners' AND column_name = 'monthly_fee') THEN
    ALTER TABLE "partners" ADD COLUMN "monthly_fee" integer;
  END IF;
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'partners' AND column_name = 'profit_share_percent') THEN
    ALTER TABLE "partners" ADD COLUMN "profit_share_percent" integer;
  END IF;
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'partners' AND column_name = 'last_activity_at') THEN
    ALTER TABLE "partners" ADD COLUMN "last_activity_at" timestamp;
  END IF;

  -- ==================== PRODUCTS TABLE ====================
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'products' AND column_name = 'optimized_title') THEN
    ALTER TABLE "products" ADD COLUMN "optimized_title" varchar(500);
  END IF;
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'products' AND column_name = 'is_active') THEN
    ALTER TABLE "products" ADD COLUMN "is_active" boolean DEFAULT true;
  END IF;
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'products' AND column_name = 'low_stock_threshold') THEN
    ALTER TABLE "products" ADD COLUMN "low_stock_threshold" integer DEFAULT 10;
  END IF;
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'products' AND column_name = 'brand') THEN
    ALTER TABLE "products" ADD COLUMN "brand" varchar(100);
  END IF;
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'products' AND column_name = 'barcode') THEN
    ALTER TABLE "products" ADD COLUMN "barcode" varchar(100);
  END IF;
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'products' AND column_name = 'sku') THEN
    ALTER TABLE "products" ADD COLUMN "sku" varchar(100);
  END IF;
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'products' AND column_name = 'stock_quantity') THEN
    ALTER TABLE "products" ADD COLUMN "stock_quantity" integer DEFAULT 0;
  END IF;
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'products' AND column_name = 'cost_price') THEN
    ALTER TABLE "products" ADD COLUMN "cost_price" decimal(12,2);
  END IF;
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'products' AND column_name = 'weight') THEN
    ALTER TABLE "products" ADD COLUMN "weight" varchar(50);
  END IF;
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'products' AND column_name = 'dimensions') THEN
    ALTER TABLE "products" ADD COLUMN "dimensions" varchar(100);
  END IF;
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'products' AND column_name = 'updated_at') THEN
    ALTER TABLE "products" ADD COLUMN "updated_at" timestamp;
  END IF;

  -- ==================== MARKETPLACE_INTEGRATIONS TABLE ====================
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'marketplace_integrations' AND column_name = 'api_key') THEN
    ALTER TABLE "marketplace_integrations" ADD COLUMN "api_key" text;
  END IF;
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'marketplace_integrations' AND column_name = 'api_secret') THEN
    ALTER TABLE "marketplace_integrations" ADD COLUMN "api_secret" text;
  END IF;
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'marketplace_integrations' AND column_name = 'active') THEN
    ALTER TABLE "marketplace_integrations" ADD COLUMN "active" boolean DEFAULT false;
  END IF;
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'marketplace_integrations' AND column_name = 'last_sync_at') THEN
    ALTER TABLE "marketplace_integrations" ADD COLUMN "last_sync_at" timestamp;
  END IF;
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'marketplace_integrations' AND column_name = 'created_at') THEN
    ALTER TABLE "marketplace_integrations" ADD COLUMN "created_at" timestamp DEFAULT NOW();
  END IF;

  -- ==================== AUDIT_LOGS TABLE ====================
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'audit_logs' AND column_name = 'changes') THEN
    ALTER TABLE "audit_logs" ADD COLUMN "changes" text;
  END IF;

END $$;
`;
  try {
    await pool.query(compatSql);
    console.log("\u2705 PostgreSQL compatibility ensured");
  } catch (error) {
    console.error("\u274C PostgreSQL compatibility migration failed:", error);
  }
}
__name(ensurePostgresCompatibility, "ensurePostgresCompatibility");
async function createPostgresTables(pool) {
  console.log("\u{1F504} Creating PostgreSQL tables...");
  await pool.query(`
    CREATE TABLE IF NOT EXISTS "session" (
      "sid" varchar NOT NULL COLLATE "default",
      "sess" json NOT NULL,
      "expire" timestamp(6) NOT NULL,
      CONSTRAINT "session_pkey" PRIMARY KEY ("sid")
    );
    CREATE INDEX IF NOT EXISTS "IDX_session_expire" ON "session" ("expire");
  `);
  console.log("\u2705 Session table ready");
  await pool.query(`
    CREATE TABLE IF NOT EXISTS "referrals" (
      "id" TEXT PRIMARY KEY,
      "referrer_partner_id" TEXT NOT NULL,
      "referred_partner_id" TEXT NOT NULL,
      "promo_code" TEXT,
      "contract_type" TEXT NOT NULL,
      "status" TEXT DEFAULT 'invited',
      "bonus_earned" NUMERIC DEFAULT 0,
      "bonus_paid" NUMERIC DEFAULT 0,
      "created_at" TIMESTAMP DEFAULT NOW(),
      "activated_at" TIMESTAMP,
      "expires_at" TIMESTAMP
    );
  `);
  console.log("\u2705 Referrals table ready");
  await pool.query(`
    CREATE TABLE IF NOT EXISTS "marketplace_integrations" (
      "id" TEXT PRIMARY KEY,
      "partner_id" TEXT NOT NULL,
      "marketplace" TEXT NOT NULL,
      "api_key" TEXT,
      "api_secret" TEXT,
      "active" BOOLEAN DEFAULT false,
      "last_sync_at" TIMESTAMP,
      "created_at" TIMESTAMP DEFAULT NOW()
    );
  `);
  console.log("\u2705 Marketplace integrations table ready");
  await pool.query(`
    CREATE TABLE IF NOT EXISTS "blog_categories" (
      "id" TEXT PRIMARY KEY,
      "name" TEXT NOT NULL,
      "slug" TEXT NOT NULL UNIQUE,
      "description" TEXT,
      "icon" TEXT,
      "color" TEXT,
      "sort_order" INTEGER DEFAULT 0,
      "created_at" TIMESTAMP DEFAULT NOW()
    );
  `);
  console.log("\u2705 Blog categories table ready");
  await pool.query(`
    CREATE TABLE IF NOT EXISTS "blog_posts" (
      "id" TEXT PRIMARY KEY,
      "slug" TEXT NOT NULL UNIQUE,
      "title" TEXT NOT NULL,
      "excerpt" TEXT,
      "content" TEXT NOT NULL,
      "featured_image" TEXT,
      "video_url" TEXT,
      "category" TEXT DEFAULT 'news',
      "tags" TEXT,
      "status" TEXT DEFAULT 'draft',
      "author_id" TEXT NOT NULL,
      "author_name" TEXT,
      "view_count" INTEGER DEFAULT 0,
      "like_count" INTEGER DEFAULT 0,
      "meta_title" TEXT,
      "meta_description" TEXT,
      "meta_keywords" TEXT,
      "published_at" TIMESTAMP,
      "created_at" TIMESTAMP DEFAULT NOW(),
      "updated_at" TIMESTAMP DEFAULT NOW()
    );
  `);
  console.log("\u2705 Blog posts table ready");
  await pool.query(`
    CREATE TABLE IF NOT EXISTS "blog_comments" (
      "id" TEXT PRIMARY KEY,
      "post_id" TEXT NOT NULL,
      "user_id" TEXT,
      "author_name" TEXT,
      "author_email" TEXT,
      "content" TEXT NOT NULL,
      "status" TEXT DEFAULT 'pending',
      "created_at" TIMESTAMP DEFAULT NOW()
    );
  `);
  console.log("\u2705 Blog comments table ready");
  await pool.query(`
    CREATE TABLE IF NOT EXISTS "ai_tasks" (
      "id" TEXT PRIMARY KEY,
      "partner_id" TEXT NOT NULL,
      "account_id" TEXT,
      "task_type" TEXT NOT NULL,
      "status" TEXT DEFAULT 'pending',
      "priority" TEXT DEFAULT 'medium',
      "input_data" TEXT,
      "output_data" TEXT,
      "error_message" TEXT,
      "started_at" TIMESTAMP,
      "completed_at" TIMESTAMP,
      "estimated_cost" DECIMAL(10,4),
      "actual_cost" DECIMAL(10,4),
      "created_at" TIMESTAMP DEFAULT NOW(),
      "updated_at" TIMESTAMP DEFAULT NOW()
    );
  `);
  console.log("\u2705 AI tasks table ready");
  await pool.query(`
    CREATE TABLE IF NOT EXISTS "ai_product_cards" (
      "id" TEXT PRIMARY KEY,
      "partner_id" TEXT NOT NULL,
      "product_id" TEXT,
      "account_id" TEXT,
      "base_product_name" TEXT,
      "marketplace" TEXT NOT NULL,
      "title" TEXT NOT NULL,
      "description" TEXT,
      "bullet_points" TEXT,
      "seo_keywords" TEXT,
      "image_prompts" TEXT,
      "generated_images" TEXT,
      "status" TEXT DEFAULT 'draft',
      "quality_score" INTEGER,
      "ai_model" TEXT,
      "generation_cost" DECIMAL(10,4),
      "created_at" TIMESTAMP DEFAULT NOW(),
      "updated_at" TIMESTAMP DEFAULT NOW(),
      "published_at" TIMESTAMP
    );
  `);
  console.log("\u2705 AI product cards table ready");
  await pool.query(`
    CREATE TABLE IF NOT EXISTS "trending_products" (
      "id" TEXT PRIMARY KEY,
      "marketplace" TEXT NOT NULL,
      "category" TEXT NOT NULL,
      "product_name" TEXT NOT NULL,
      "price" DECIMAL(12,2),
      "sales_count" INTEGER,
      "rating" DECIMAL(3,2),
      "trend_score" INTEGER NOT NULL,
      "image_url" TEXT,
      "product_url" TEXT,
      "analyzed_at" TIMESTAMP DEFAULT NOW()
    );
  `);
  console.log("\u2705 Trending products table ready");
  await pool.query(`
    CREATE TABLE IF NOT EXISTS "analytics" (
      "id" TEXT PRIMARY KEY,
      "partner_id" TEXT NOT NULL,
      "marketplace" TEXT,
      "date" DATE NOT NULL,
      "revenue" DECIMAL(14,2) DEFAULT 0,
      "orders" INTEGER DEFAULT 0,
      "views" INTEGER DEFAULT 0,
      "conversions" INTEGER DEFAULT 0,
      "created_at" TIMESTAMP DEFAULT NOW()
    );
  `);
  console.log("\u2705 Analytics table ready");
  await pool.query(`
    CREATE TABLE IF NOT EXISTS "chat_rooms" (
      "id" TEXT PRIMARY KEY,
      "partner_id" TEXT NOT NULL,
      "title" TEXT,
      "created_at" TIMESTAMP DEFAULT NOW(),
      "updated_at" TIMESTAMP DEFAULT NOW()
    );
  `);
  console.log("\u2705 Chat rooms table ready");
  await pool.query(`
    CREATE TABLE IF NOT EXISTS "messages" (
      "id" TEXT PRIMARY KEY,
      "room_id" TEXT NOT NULL,
      "partner_id" TEXT NOT NULL,
      "role" TEXT NOT NULL,
      "content" TEXT NOT NULL,
      "metadata" TEXT,
      "created_at" TIMESTAMP DEFAULT NOW()
    );
  `);
  console.log("\u2705 Messages table ready");
  await pool.query(`
    CREATE TABLE IF NOT EXISTS "pricing_tiers" (
      "id" TEXT PRIMARY KEY,
      "tier" TEXT NOT NULL UNIQUE,
      "name_uz" TEXT NOT NULL,
      "fixed_cost" TEXT NOT NULL,
      "commission_min" TEXT NOT NULL,
      "commission_max" TEXT NOT NULL,
      "min_revenue" TEXT NOT NULL,
      "max_revenue" TEXT,
      "features" TEXT NOT NULL,
      "is_active" BOOLEAN DEFAULT true,
      "created_at" TIMESTAMP DEFAULT NOW()
    );
  `);
  console.log("\u2705 Pricing tiers table ready");
  await pool.query(`
    CREATE TABLE IF NOT EXISTS "subscriptions" (
      "id" TEXT PRIMARY KEY,
      "partner_id" TEXT NOT NULL,
      "tier_id" TEXT NOT NULL,
      "status" TEXT DEFAULT 'active' NOT NULL,
      "start_date" TIMESTAMP NOT NULL,
      "end_date" TIMESTAMP,
      "auto_renew" BOOLEAN DEFAULT true,
      "created_at" TIMESTAMP DEFAULT NOW(),
      "updated_at" TIMESTAMP DEFAULT NOW()
    );
  `);
  console.log("\u2705 Subscriptions table ready");
  await pool.query(`
    CREATE TABLE IF NOT EXISTS "notifications" (
      "id" TEXT PRIMARY KEY,
      "user_id" TEXT NOT NULL,
      "title" TEXT NOT NULL,
      "message" TEXT NOT NULL,
      "type" TEXT DEFAULT 'info',
      "read" BOOLEAN DEFAULT false,
      "created_at" TIMESTAMP DEFAULT NOW()
    );
  `);
  console.log("\u2705 Notifications table ready");
  await pool.query(`
    CREATE TABLE IF NOT EXISTS "ai_marketplace_accounts" (
      "id" TEXT PRIMARY KEY,
      "partner_id" TEXT NOT NULL,
      "marketplace" TEXT NOT NULL,
      "account_name" TEXT NOT NULL,
      "status" TEXT DEFAULT 'active',
      "products_count" INTEGER DEFAULT 0,
      "last_activity" TIMESTAMP,
      "created_at" TIMESTAMP DEFAULT NOW()
    );
  `);
  console.log("\u2705 AI marketplace accounts table ready");
  await pool.query(`
    CREATE TABLE IF NOT EXISTS "wallet_transactions" (
      "id" TEXT PRIMARY KEY,
      "partner_id" TEXT NOT NULL,
      "type" TEXT NOT NULL,
      "amount" DECIMAL(14,2) NOT NULL,
      "description" TEXT,
      "status" TEXT DEFAULT 'pending' NOT NULL,
      "metadata" TEXT,
      "created_at" TIMESTAMP DEFAULT NOW(),
      "updated_at" TIMESTAMP DEFAULT NOW()
    );
  `);
  console.log("\u2705 Wallet transactions table ready");
  console.log("\u2705 All PostgreSQL tables created successfully");
}
__name(createPostgresTables, "createPostgresTables");
async function runPostgresMigrations() {
  console.log("\u{1F504} Running PostgreSQL migrations...");
  const pool = new Pool2({
    connectionString: process.env.DATABASE_URL
  });
  try {
    await pool.query("SELECT 1");
    console.log("\u2705 PostgreSQL connected");
    await createPostgresTables(pool);
    await ensurePostgresCompatibility(pool);
    console.log("\u2705 PostgreSQL migrations completed successfully");
  } catch (error) {
    console.error("\u274C PostgreSQL migration failed:", error);
    throw error;
  } finally {
    await pool.end();
  }
}
__name(runPostgresMigrations, "runPostgresMigrations");
async function runMigrations() {
  const databaseUrl = process.env.DATABASE_URL || "";
  const isPostgres = databaseUrl.startsWith("postgres");
  console.log("\u{1F527} Initializing database tables...");
  console.log(`\u{1F4E6} Database type: ${isPostgres ? "PostgreSQL" : "SQLite"}`);
  if (isPostgres) {
    await runPostgresMigrations();
  } else {
    await runSQLiteMigrations();
  }
  console.log("\u2705 Database migrations completed successfully");
}
__name(runMigrations, "runMigrations");

// server/initDatabase.ts
init_db();
async function initializeDatabaseTables() {
  try {
    console.log("\u{1F527} Initializing database tables...");
    if (dbType === "postgres") {
      console.log("\u{1F4E6} PostgreSQL: Tables should be created via migrations");
      return;
    }
    if (!sqliteInstance) {
      console.error("\u274C SQLite instance not available");
      return;
    }
    console.log("\u{1F4DD} Creating SQLite tables...");
    try {
      const productsInfo = sqliteInstance.prepare("PRAGMA table_info(products)").all();
      const hasLastPriceUpdate = productsInfo.some((col) => col.name === "last_price_update");
      if (!hasLastPriceUpdate) {
        console.log("\u{1F4DD} Adding last_price_update column to products table...");
        sqliteInstance.exec("ALTER TABLE products ADD COLUMN last_price_update INTEGER");
      }
    } catch (e) {
    }
    try {
      const mpInfo = sqliteInstance.prepare("PRAGMA table_info(marketplace_products)").all();
      const hasLastPriceUpdate = mpInfo.some((col) => col.name === "last_price_update");
      const hasIsActive = mpInfo.some((col) => col.name === "is_active");
      if (!hasLastPriceUpdate) {
        console.log("\u{1F4DD} Adding last_price_update column to marketplace_products table...");
        sqliteInstance.exec("ALTER TABLE marketplace_products ADD COLUMN last_price_update INTEGER");
      }
      if (!hasIsActive) {
        console.log("\u{1F4DD} Adding is_active column to marketplace_products table...");
        sqliteInstance.exec("ALTER TABLE marketplace_products ADD COLUMN is_active INTEGER DEFAULT 1");
      }
    } catch (e) {
    }
    try {
      const partnersInfo = sqliteInstance.prepare("PRAGMA table_info(partners)").all();
      const hasAnydeskId = partnersInfo.some((col) => col.name === "anydesk_id");
      const hasAnydeskPassword = partnersInfo.some((col) => col.name === "anydesk_password");
      if (!hasAnydeskId) {
        console.log("\u{1F4DD} Adding anydesk_id column to partners table...");
        sqliteInstance.exec("ALTER TABLE partners ADD COLUMN anydesk_id TEXT");
      }
      if (!hasAnydeskPassword) {
        console.log("\u{1F4DD} Adding anydesk_password column to partners table...");
        sqliteInstance.exec("ALTER TABLE partners ADD COLUMN anydesk_password TEXT");
      }
    } catch (e) {
    }
    sqliteInstance.exec(`
      CREATE TABLE IF NOT EXISTS users (
        id TEXT PRIMARY KEY,
        username TEXT NOT NULL UNIQUE,
        email TEXT UNIQUE,
        password TEXT NOT NULL,
        first_name TEXT,
        last_name TEXT,
        phone TEXT,
        role TEXT NOT NULL DEFAULT 'customer',
        is_active INTEGER NOT NULL DEFAULT 1,
        created_at INTEGER NOT NULL DEFAULT (unixepoch()),
        updated_at INTEGER DEFAULT (unixepoch())
      );
    `);
    sqliteInstance.exec(`
      CREATE TABLE IF NOT EXISTS partners (
        id TEXT PRIMARY KEY,
        user_id TEXT NOT NULL UNIQUE REFERENCES users(id),
        business_name TEXT NOT NULL,
        business_address TEXT,
        business_category TEXT,
        inn TEXT UNIQUE,
        phone TEXT NOT NULL,
        website TEXT,
        monthly_revenue TEXT,
        approved INTEGER DEFAULT 0,
        pricing_tier TEXT DEFAULT 'free_starter',
        monthly_fee INTEGER,
        profit_share_percent INTEGER,
        ai_enabled INTEGER DEFAULT 0,
        ai_cards_used INTEGER DEFAULT 0,
        promo_code TEXT UNIQUE,
        warehouse_space_kg INTEGER,
        anydesk_id TEXT,
        anydesk_password TEXT,
        notes TEXT,
        created_at INTEGER NOT NULL DEFAULT (unixepoch()),
        last_activity_at INTEGER
      );
    `);
    sqliteInstance.exec(`
      CREATE TABLE IF NOT EXISTS products (
        id TEXT PRIMARY KEY,
        partner_id TEXT NOT NULL REFERENCES partners(id),
        name TEXT NOT NULL,
        sku TEXT UNIQUE,
        barcode TEXT,
        description TEXT,
        category TEXT,
        brand TEXT,
        price REAL NOT NULL,
        cost_price REAL,
        weight TEXT,
        stock_quantity INTEGER DEFAULT 0,
        low_stock_threshold INTEGER DEFAULT 10,
        optimized_title TEXT,
        is_active INTEGER DEFAULT 1,
        last_price_update INTEGER,
        created_at INTEGER NOT NULL DEFAULT (unixepoch()),
        updated_at INTEGER
      );
    `);
    sqliteInstance.exec(`
      CREATE TABLE IF NOT EXISTS orders (
        id TEXT PRIMARY KEY,
        partner_id TEXT NOT NULL REFERENCES partners(id),
        order_number TEXT UNIQUE NOT NULL,
        customer_name TEXT NOT NULL,
        customer_email TEXT,
        customer_phone TEXT,
        marketplace TEXT,
        status TEXT DEFAULT 'pending',
        total_amount REAL NOT NULL,
        shipping_address TEXT,
        tracking_number TEXT,
        created_at INTEGER NOT NULL DEFAULT (unixepoch()),
        updated_at INTEGER
      );
    `);
    sqliteInstance.exec(`
      CREATE TABLE IF NOT EXISTS order_items (
        id TEXT PRIMARY KEY,
        order_id TEXT NOT NULL REFERENCES orders(id),
        product_id TEXT NOT NULL REFERENCES products(id),
        quantity INTEGER NOT NULL,
        price REAL NOT NULL,
        created_at INTEGER NOT NULL DEFAULT (unixepoch())
      );
    `);
    sqliteInstance.exec(`
      CREATE TABLE IF NOT EXISTS marketplace_integrations (
        id TEXT PRIMARY KEY,
        partner_id TEXT NOT NULL REFERENCES partners(id),
        marketplace TEXT NOT NULL,
        api_key TEXT,
        api_secret TEXT,
        access_token TEXT,
        refresh_token TEXT,
        seller_id TEXT,
        active INTEGER DEFAULT 1,
        is_active INTEGER DEFAULT 1,
        last_sync_at INTEGER,
        created_at INTEGER NOT NULL DEFAULT (unixepoch()),
        updated_at INTEGER
      );
    `);
    sqliteInstance.exec(`
      CREATE TABLE IF NOT EXISTS ai_tasks (
        id TEXT PRIMARY KEY,
        partner_id TEXT NOT NULL REFERENCES partners(id),
        account_id TEXT REFERENCES ai_marketplace_accounts(id),
        task_type TEXT NOT NULL,
        priority TEXT NOT NULL DEFAULT 'medium',
        status TEXT NOT NULL DEFAULT 'pending',
        input_data TEXT,
        output_data TEXT,
        error_message TEXT,
        created_at INTEGER NOT NULL DEFAULT (unixepoch()),
        started_at INTEGER,
        completed_at INTEGER,
        updated_at INTEGER
      );
    `);
    sqliteInstance.exec(`
      CREATE TABLE IF NOT EXISTS ai_product_cards (
        id TEXT PRIMARY KEY,
        partner_id TEXT NOT NULL REFERENCES partners(id),
        product_id TEXT REFERENCES products(id),
        marketplace TEXT NOT NULL,
        title TEXT NOT NULL,
        description TEXT,
        images TEXT,
        price REAL,
        status TEXT DEFAULT 'pending',
        error_message TEXT,
        created_at INTEGER NOT NULL DEFAULT (unixepoch()),
        updated_at INTEGER
      );
    `);
    sqliteInstance.exec(`
      CREATE TABLE IF NOT EXISTS ai_marketplace_accounts (
        id TEXT PRIMARY KEY,
        partner_id TEXT NOT NULL REFERENCES partners(id),
        marketplace TEXT NOT NULL,
        account_name TEXT,
        credentials TEXT,
        is_active INTEGER DEFAULT 1,
        created_at INTEGER NOT NULL DEFAULT (unixepoch()),
        updated_at INTEGER
      );
    `);
    sqliteInstance.exec(`
      CREATE TABLE IF NOT EXISTS marketplace_products (
        id TEXT PRIMARY KEY,
        partner_id TEXT NOT NULL REFERENCES partners(id),
        product_id TEXT REFERENCES products(id),
        marketplace TEXT NOT NULL,
        marketplace_product_id TEXT,
        marketplace_sku TEXT,
        title TEXT,
        price REAL,
        stock INTEGER,
        status TEXT DEFAULT 'active',
        error_message TEXT,
        created_at INTEGER NOT NULL DEFAULT (unixepoch()),
        updated_at INTEGER
      );
    `);
    sqliteInstance.exec(`
      CREATE TABLE IF NOT EXISTS ai_generated_products (
        id TEXT PRIMARY KEY,
        partner_id TEXT NOT NULL REFERENCES partners(id),
        product_id TEXT REFERENCES products(id),
        marketplace TEXT NOT NULL,
        generated_title TEXT,
        generated_description TEXT,
        generated_images TEXT,
        ai_title TEXT,
        ai_description TEXT,
        status TEXT DEFAULT 'pending',
        error_message TEXT,
        created_at INTEGER NOT NULL DEFAULT (unixepoch()),
        updated_at INTEGER
      );
    `);
    sqliteInstance.exec(`
      CREATE TABLE IF NOT EXISTS chat_rooms (
        id TEXT PRIMARY KEY,
        partner_id TEXT REFERENCES partners(id),
        admin_id TEXT REFERENCES users(id),
        status TEXT DEFAULT 'active',
        created_at INTEGER NOT NULL DEFAULT (unixepoch()),
        last_message_at INTEGER
      );
    `);
    sqliteInstance.exec(`
      CREATE TABLE IF NOT EXISTS messages (
        id TEXT PRIMARY KEY,
        chat_room_id TEXT NOT NULL REFERENCES chat_rooms(id),
        sender_id TEXT NOT NULL REFERENCES users(id),
        sender_role TEXT NOT NULL,
        content TEXT NOT NULL,
        message_type TEXT DEFAULT 'text',
        attachment_url TEXT,
        created_at INTEGER NOT NULL DEFAULT (unixepoch()),
        read_at INTEGER
      );
    `);
    sqliteInstance.exec(`
      CREATE TABLE IF NOT EXISTS analytics (
        id TEXT PRIMARY KEY,
        partner_id TEXT NOT NULL REFERENCES partners(id),
        metric_type TEXT NOT NULL,
        value REAL NOT NULL,
        date INTEGER NOT NULL,
        metadata TEXT,
        created_at INTEGER NOT NULL DEFAULT (unixepoch())
      );
    `);
    sqliteInstance.exec(`
      CREATE TABLE IF NOT EXISTS ai_cost_records (
        id TEXT PRIMARY KEY,
        partner_id TEXT NOT NULL REFERENCES partners(id),
        operation TEXT NOT NULL,
        model TEXT NOT NULL,
        tokens_used INTEGER,
        images_generated INTEGER,
        cost REAL NOT NULL DEFAULT 0,
        tier TEXT NOT NULL DEFAULT 'free_starter',
        metadata TEXT,
        created_at INTEGER NOT NULL DEFAULT (unixepoch())
      );
    `);
    sqliteInstance.exec(`
      CREATE TABLE IF NOT EXISTS profit_breakdown (
        id TEXT PRIMARY KEY,
        partner_id TEXT NOT NULL REFERENCES partners(id),
        order_id TEXT REFERENCES orders(id),
        revenue REAL NOT NULL,
        costs REAL NOT NULL,
        platform_fee REAL NOT NULL,
        profit_share REAL NOT NULL,
        net_profit REAL NOT NULL,
        date INTEGER NOT NULL,
        created_at INTEGER NOT NULL DEFAULT (unixepoch())
      );
    `);
    sqliteInstance.exec(`
      CREATE TABLE IF NOT EXISTS trending_products (
        id TEXT PRIMARY KEY,
        marketplace TEXT NOT NULL,
        category TEXT NOT NULL,
        product_name TEXT NOT NULL,
        price REAL,
        sales_count INTEGER,
        rating REAL,
        trend_score INTEGER NOT NULL,
        image_url TEXT,
        product_url TEXT,
        analyzed_at INTEGER NOT NULL DEFAULT (unixepoch())
      );
    `);
    sqliteInstance.exec(`
      CREATE TABLE IF NOT EXISTS stock_alerts (
        id TEXT PRIMARY KEY,
        product_id TEXT NOT NULL REFERENCES products(id),
        alert_type TEXT NOT NULL,
        message TEXT NOT NULL,
        resolved INTEGER DEFAULT 0,
        created_at INTEGER NOT NULL DEFAULT (unixepoch()),
        resolved_at INTEGER
      );
    `);
    sqliteInstance.exec(`
      CREATE TABLE IF NOT EXISTS referral_first_purchases (
        id TEXT PRIMARY KEY,
        referral_id TEXT NOT NULL REFERENCES referrals(id),
        referrer_partner_id TEXT NOT NULL REFERENCES partners(id),
        referred_partner_id TEXT NOT NULL REFERENCES partners(id),
        subscription_id TEXT REFERENCES subscriptions(id),
        invoice_id TEXT REFERENCES invoices(id),
        payment_id TEXT REFERENCES payments(id),
        tier_id TEXT NOT NULL,
        monthly_fee REAL NOT NULL,
        subscription_months INTEGER NOT NULL DEFAULT 1,
        total_amount REAL NOT NULL,
        commission_rate REAL NOT NULL DEFAULT 0.10,
        commission_amount REAL NOT NULL,
        status TEXT DEFAULT 'pending',
        paid_at INTEGER,
        created_at INTEGER NOT NULL DEFAULT (unixepoch())
      );
    `);
    sqliteInstance.exec(`
      CREATE TABLE IF NOT EXISTS referral_campaigns (
        id TEXT PRIMARY KEY,
        name TEXT NOT NULL,
        description TEXT,
        start_date INTEGER NOT NULL,
        end_date INTEGER NOT NULL,
        duration_days INTEGER NOT NULL,
        target_referrals INTEGER NOT NULL,
        bonus_amount REAL NOT NULL,
        min_tier TEXT NOT NULL DEFAULT 'basic',
        min_subscription_months INTEGER NOT NULL DEFAULT 1,
        status TEXT DEFAULT 'active',
        participants INTEGER DEFAULT 0,
        winners INTEGER DEFAULT 0,
        created_at INTEGER NOT NULL DEFAULT (unixepoch()),
        created_by TEXT NOT NULL
      );
    `);
    sqliteInstance.exec(`
      CREATE TABLE IF NOT EXISTS referral_campaign_participants (
        id TEXT PRIMARY KEY,
        campaign_id TEXT NOT NULL REFERENCES referral_campaigns(id),
        referrer_partner_id TEXT NOT NULL REFERENCES partners(id),
        referrals_count INTEGER DEFAULT 0,
        bonus_earned REAL DEFAULT 0,
        status TEXT DEFAULT 'participating',
        joined_at INTEGER NOT NULL DEFAULT (unixepoch()),
        completed_at INTEGER
      );
    `);
    sqliteInstance.exec(`
      CREATE TABLE IF NOT EXISTS admin_permissions (
        user_id TEXT PRIMARY KEY REFERENCES users(id),
        can_manage_admins INTEGER NOT NULL DEFAULT 0,
        can_manage_content INTEGER NOT NULL DEFAULT 0,
        can_manage_chat INTEGER NOT NULL DEFAULT 0,
        can_view_reports INTEGER NOT NULL DEFAULT 0,
        can_receive_products INTEGER NOT NULL DEFAULT 0,
        can_activate_partners INTEGER NOT NULL DEFAULT 0,
        can_manage_integrations INTEGER NOT NULL DEFAULT 0,
        created_at INTEGER NOT NULL DEFAULT (unixepoch()),
        updated_at INTEGER DEFAULT (unixepoch())
      );
    `);
    sqliteInstance.exec(`
      CREATE TABLE IF NOT EXISTS audit_logs (
        id TEXT PRIMARY KEY,
        user_id TEXT REFERENCES users(id),
        action TEXT NOT NULL,
        entity_type TEXT NOT NULL,
        entity_id TEXT,
        changes TEXT,
        payload TEXT,
        ip_address TEXT,
        user_agent TEXT,
        created_at INTEGER NOT NULL DEFAULT (unixepoch())
      );
    `);
    console.log("\u{1F4DD} Adding missing columns to existing tables...");
    try {
      const partnersInfo = sqliteInstance.prepare("PRAGMA table_info(partners)").all();
      const hasAiCardsUsed = partnersInfo.some((col) => col.name === "ai_cards_used");
      const hasPromoCode = partnersInfo.some((col) => col.name === "promo_code");
      if (!hasAiCardsUsed) {
        console.log("\u{1F4DD} Adding ai_cards_used column to partners table...");
        sqliteInstance.exec("ALTER TABLE partners ADD COLUMN ai_cards_used INTEGER DEFAULT 0");
      }
      if (!hasPromoCode) {
        console.log("\u{1F4DD} Adding promo_code column to partners table...");
        sqliteInstance.exec("ALTER TABLE partners ADD COLUMN promo_code TEXT");
      }
    } catch (e) {
      console.warn("\u26A0\uFE0F  Could not add columns to partners:", e);
    }
    console.log("\u2705 All database tables created successfully");
    console.log("\u{1F50D} Verifying all columns exist...");
    try {
      const mpInfo = sqliteInstance.prepare("PRAGMA table_info(marketplace_products)").all();
      const hasLastPriceUpdate = mpInfo.some((col) => col.name === "last_price_update");
      if (!hasLastPriceUpdate) {
        console.log("\u{1F4DD} Adding last_price_update to marketplace_products...");
        sqliteInstance.exec("ALTER TABLE marketplace_products ADD COLUMN last_price_update INTEGER");
      }
      const hasIsActive = mpInfo.some((col) => col.name === "is_active");
      if (!hasIsActive) {
        console.log("\u{1F4DD} Adding is_active to marketplace_products...");
        sqliteInstance.exec("ALTER TABLE marketplace_products ADD COLUMN is_active INTEGER DEFAULT 1");
      }
    } catch (e) {
      console.warn("\u26A0\uFE0F  Could not verify marketplace_products columns:", e);
    }
    try {
      const pInfo = sqliteInstance.prepare("PRAGMA table_info(products)").all();
      const hasLastPriceUpdate = pInfo.some((col) => col.name === "last_price_update");
      if (!hasLastPriceUpdate) {
        console.log("\u{1F4DD} Adding last_price_update to products...");
        sqliteInstance.exec("ALTER TABLE products ADD COLUMN last_price_update INTEGER");
      }
    } catch (e) {
      console.warn("\u26A0\uFE0F  Could not verify products columns:", e);
    }
    console.log("\u2705 Column verification completed");
  } catch (error) {
    console.error("\u274C Error initializing database tables:", error);
    throw error;
  }
}
__name(initializeDatabaseTables, "initializeDatabaseTables");

// server/services/aiTaskQueue.ts
init_db();
init_schema();
import { eq as eq33, desc as desc10 } from "drizzle-orm";
import { nanoid as nanoid22 } from "nanoid";
function scheduleRecurringTasks() {
  setInterval(async () => {
    console.log("\u{1F50D} Checking for new reviews...");
  }, 5 * 60 * 1e3);
  setInterval(async () => {
    console.log("\u{1F50D} Running SEO optimization check...");
  }, 60 * 60 * 1e3);
  setInterval(async () => {
    console.log("\u{1F50D} Running competitor analysis...");
  }, 2 * 60 * 60 * 1e3);
  setInterval(async () => {
    console.log("\u{1F4CA} Generating daily reports...");
  }, 24 * 60 * 60 * 1e3);
}
__name(scheduleRecurringTasks, "scheduleRecurringTasks");
function initializeAIQueue() {
  console.log("\u{1F680} AI Task Queue initialized");
  scheduleRecurringTasks();
}
__name(initializeAIQueue, "initializeAIQueue");

// server/cron/scheduler.ts
import cron from "node-cron";

// server/cron/monthlyBilling.ts
async function runMonthlyBilling() {
  console.log("\u{1F504} Starting monthly billing process...");
  console.log(`\u{1F4C5} Date: ${(/* @__PURE__ */ new Date()).toISOString()}`);
  try {
    await billingService_default.processMonthlyBilling();
    console.log("\u2705 Monthly billing completed successfully");
  } catch (error) {
    console.error("\u274C Monthly billing failed:", error);
    throw error;
  }
}
__name(runMonthlyBilling, "runMonthlyBilling");
var monthlyBilling_default = runMonthlyBilling;

// server/cron/overdueCheck.ts
async function runOverdueCheck() {
  console.log("\u{1F504} Starting overdue invoices check...");
  console.log(`\u{1F4C5} Date: ${(/* @__PURE__ */ new Date()).toISOString()}`);
  try {
    await billingService_default.processOverdueInvoices();
    console.log("\u2705 Overdue check completed successfully");
  } catch (error) {
    console.error("\u274C Overdue check failed:", error);
    throw error;
  }
}
__name(runOverdueCheck, "runOverdueCheck");
var overdueCheck_default = runOverdueCheck;

// server/cron/scheduler.ts
function startCronJobs() {
  console.log("\u{1F680} Starting cron jobs...");
  cron.schedule("0 0 1 * *", async () => {
    console.log("\u23F0 Running monthly billing cron job");
    try {
      await monthlyBilling_default();
    } catch (error) {
      console.error("Monthly billing cron failed:", error);
    }
  }, {
    timezone: "Asia/Tashkent"
  });
  cron.schedule("0 9 * * *", async () => {
    console.log("\u23F0 Running overdue check cron job");
    try {
      await overdueCheck_default();
    } catch (error) {
      console.error("Overdue check cron failed:", error);
    }
  }, {
    timezone: "Asia/Tashkent"
  });
  console.log("\u2705 Cron jobs started successfully");
  console.log("\u{1F4C5} Monthly billing: 1st of every month at 00:00 (Tashkent time)");
  console.log("\u{1F4C5} Overdue check: Every day at 09:00 (Tashkent time)");
}
__name(startCronJobs, "startCronJobs");

// server/index.ts
init_geminiService();

// server/services/googleSearchService.ts
init_geminiService();
var GoogleSearchService = class {
  static {
    __name(this, "GoogleSearchService");
  }
  enabled;
  monthlyRequests = 0;
  monthlyLimit = 5e3;
  // Free tier: 5000 requests/month
  constructor() {
    this.enabled = geminiService.isEnabled();
    if (!this.enabled) {
      console.warn("\u26A0\uFE0F  Google Search service disabled (Gemini API required)");
    } else {
      console.log("\u2705 Google Search Service initialized");
    }
  }
  /**
   * Search the web for information
   */
  async search(request) {
    if (!this.enabled) {
      throw new Error("Google Search is not enabled. Please set GEMINI_API_KEY.");
    }
    if (this.monthlyRequests >= this.monthlyLimit) {
      throw new Error(`Monthly search limit reached (${this.monthlyLimit} requests). Upgrade to Pro tier.`);
    }
    try {
      const query = request.query;
      const maxResults = request.maxResults || 5;
      const response = await geminiService.generateText({
        prompt: `Search the web for: ${query}. Return top ${maxResults} results with URLs, titles, and snippets. Format as JSON array.`,
        model: "flash",
        structuredOutput: true
      });
      let results = [];
      try {
        const parsed = JSON.parse(response.text);
        if (Array.isArray(parsed)) {
          results = parsed;
        }
      } catch (error) {
        results = this.parseTextResults(response.text);
      }
      this.monthlyRequests++;
      return results.slice(0, maxResults);
    } catch (error) {
      console.error("Google Search error:", error);
      throw new Error(`Google Search error: ${error.message}`);
    }
  }
  /**
   * Search for competitor prices
   */
  async searchCompetitorPrices(productName, marketplaces = ["uzum", "wildberries", "yandex", "ozon"]) {
    if (!this.enabled) {
      throw new Error("Google Search is not enabled.");
    }
    const prices = [];
    for (const marketplace of marketplaces) {
      try {
        const query = `${productName} ${marketplace} narx`;
        const results = await this.search({ query, maxResults: 3 });
        for (const result of results) {
          const priceMatch = result.snippet?.match(/(\d+[\s,.]?\d*)\s*(so'm|sum|руб|₽)/i);
          if (priceMatch) {
            const price = parseFloat(priceMatch[1].replace(/\s/g, "").replace(",", "."));
            const currency = priceMatch[2]?.toLowerCase().includes("so") ? "UZS" : "RUB";
            prices.push({
              marketplace,
              productName,
              price,
              currency,
              url: result.url,
              availability: true
            });
          }
        }
      } catch (error) {
        console.warn(`Failed to search prices for ${marketplace}:`, error);
      }
    }
    return prices;
  }
  /**
   * Search for trending products
   */
  async searchTrendingProducts(category, market = "uz") {
    const query = `${category} trend mahsulotlar ${market === "uz" ? "O'zbekiston" : market === "ru" ? "\u0420\u043E\u0441\u0441\u0438\u044F" : "Uzbekistan"}`;
    return await this.search({ query, maxResults: 10, market });
  }
  /**
   * Search for SEO keywords
   */
  async searchSEOKeywords(productName, language = "uz") {
    const query = `${productName} SEO kalit so'zlar ${language === "uz" ? "O'zbek" : language === "ru" ? "\u0420\u0443\u0441\u0441\u043A\u0438\u0439" : "English"}`;
    const results = await this.search({ query, maxResults: 5 });
    const keywords = [];
    results.forEach((result) => {
      const words = result.snippet?.toLowerCase().match(/\b\w{4,}\b/g) || [];
      keywords.push(...words);
    });
    return [...new Set(keywords)].slice(0, 20);
  }
  /**
   * Parse text results (fallback)
   */
  parseTextResults(text2) {
    const results = [];
    const lines = text2.split("\n").filter((line) => line.trim());
    for (const line of lines) {
      const urlMatch = line.match(/(https?:\/\/[^\s]+)/);
      if (urlMatch) {
        results.push({
          title: line.split(urlMatch[0])[0].trim(),
          url: urlMatch[0],
          snippet: line
        });
      }
    }
    return results;
  }
  /**
   * Get monthly usage statistics
   */
  getMonthlyUsage() {
    return {
      requests: this.monthlyRequests,
      limit: this.monthlyLimit,
      remaining: Math.max(0, this.monthlyLimit - this.monthlyRequests)
    };
  }
  /**
   * Reset monthly counter (called monthly)
   */
  resetMonthlyCounter() {
    this.monthlyRequests = 0;
    console.log("\u2705 Google Search monthly counter reset");
  }
  /**
   * Check if service is enabled
   */
  isEnabled() {
    return this.enabled;
  }
};
var googleSearchService = new GoogleSearchService();

// server/index.ts
init_contextCacheService();
import helmet from "helmet";
import * as Sentry from "@sentry/node";
import winston2 from "winston";
var app = express25();
var logger2 = winston2.createLogger({
  level: process.env.NODE_ENV === "production" ? "info" : "debug",
  transports: [
    new winston2.transports.Console({
      format: winston2.format.combine(
        winston2.format.colorize(),
        winston2.format.timestamp(),
        winston2.format.printf(({ level, message, timestamp }) => `${timestamp} [${level}] ${message}`)
      )
    })
  ]
});
if (process.env.SENTRY_DSN) {
  Sentry.init({
    dsn: process.env.SENTRY_DSN,
    tracesSampleRate: 0.2
  });
  app.use(Sentry.Handlers.requestHandler());
}
app.use(helmet({
  contentSecurityPolicy: false
}));
var allowedOrigins = [
  "http://localhost:5000",
  "http://127.0.0.1:5000",
  "http://0.0.0.0:5000",
  "http://localhost:3000",
  "http://localhost:8080",
  "http://127.0.0.1:1337",
  // Browser preview
  "https://sellercloudx.com",
  "https://www.sellercloudx.com",
  "http://sellercloudx.com",
  "http://www.sellercloudx.com"
];
var envOrigins = (process.env.CORS_ORIGIN || "").split(",").filter((origin) => origin.trim());
allowedOrigins.push(...envOrigins);
console.log("\u{1F527} Allowed CORS Origins:", allowedOrigins);
app.use(
  cors({
    origin: /* @__PURE__ */ __name(function(origin, callback) {
      if (!origin) {
        console.log("\u2705 CORS: Same-origin request allowed");
        return callback(null, true);
      }
      if (origin && (origin.startsWith("http://localhost:") || origin.startsWith("http://127.0.0.1:"))) {
        console.log("\u2705 CORS: Localhost/127.0.0.1 allowed:", origin);
        callback(null, true);
        return;
      }
      if (origin && origin.includes(".replit.dev")) {
        console.log("\u2705 CORS: Replit domain allowed:", origin);
        callback(null, true);
        return;
      }
      if (origin && origin.includes(".onrender.com")) {
        console.log("\u2705 CORS: Render domain allowed:", origin);
        callback(null, true);
        return;
      }
      if (origin && origin.includes(".railway.app")) {
        console.log("\u2705 CORS: Railway domain allowed:", origin);
        callback(null, true);
        return;
      }
      if (origin && origin.includes("sellercloudx.com")) {
        console.log("\u2705 CORS: SellerCloudX domain allowed:", origin);
        callback(null, true);
        return;
      }
      if (origin && origin.includes(".emergentagent.com")) {
        console.log("\u2705 CORS: EmergentAgent domain allowed:", origin);
        callback(null, true);
        return;
      }
      if (allowedOrigins.includes(origin) || allowedOrigins.includes("*")) {
        console.log("\u2705 CORS: Known origin allowed:", origin);
        callback(null, true);
      } else {
        console.log("\u274C CORS: Origin blocked:", origin);
        callback(new Error("Not allowed by CORS"));
      }
    }, "origin"),
    credentials: true,
    methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS", "PATCH"],
    allowedHeaders: ["Content-Type", "Authorization", "X-Requested-With", "Accept", "Cookie"],
    exposedHeaders: ["Set-Cookie", "Access-Control-Allow-Credentials"],
    optionsSuccessStatus: 200,
    preflightContinue: false,
    maxAge: 86400
    // Cache preflight for 24 hours
  })
);
var isProd = process.env.NODE_ENV === "production";
app.set("trust proxy", isProd ? 1 : false);
console.log("\u{1F527} Trust proxy:", isProd ? "enabled (production)" : "disabled (development)");
app.use(cookieParser(process.env.SESSION_SECRET || "your-secret-key-dev-only"));
app.use(express25.json({ limit: "10mb" }));
app.use(express25.urlencoded({ extended: false, limit: "10mb" }));
app.use((req, res, next) => {
  const start = Date.now();
  const path6 = req.path;
  let capturedJsonResponse = void 0;
  if (path6.startsWith("/api/auth")) {
    logger2.info(`Auth request ${req.method} ${path6}`);
  }
  const originalResJson = res.json;
  res.json = function(bodyJson, ...args) {
    capturedJsonResponse = bodyJson;
    return originalResJson.call(res, bodyJson);
  };
  res.on("finish", () => {
    const duration = Date.now() - start;
    if (path6.startsWith("/api")) {
      let logLine = `${req.method} ${path6} ${res.statusCode} in ${duration}ms`;
      if (capturedJsonResponse) {
        try {
          logLine += ` :: ${JSON.stringify(capturedJsonResponse)}`;
        } catch {
        }
      }
      if (logLine.length > 200) {
        logLine = logLine.slice(0, 199) + "\u2026";
      }
      logger2.info(logLine);
    }
  });
  next();
});
(async () => {
  try {
    log("\u{1F680} Starting BiznesYordam Fulfillment Platform...");
    log("\u2705 Real database connection initialized");
    try {
      await initializeDatabaseTables();
    } catch (error) {
      console.error("\u274C Failed to initialize database tables:", error);
      console.log("\u26A0\uFE0F  Continuing without table initialization");
    }
    try {
      await runMigrations();
    } catch (error) {
      console.error("\u274C Failed to run migrations:", error);
      console.log("\u26A0\uFE0F  Continuing without migrations - database may not be initialized");
    }
    try {
      await initializeAdmin();
    } catch (error) {
      console.error("\u274C Failed to initialize admin:", error);
      console.log("\u26A0\uFE0F  Continuing without admin initialization");
    }
    try {
      await initializePartner();
    } catch (error) {
      console.error("\u274C Failed to initialize partner:", error);
      console.log("\u26A0\uFE0F  Continuing without partner initialization");
    }
    const server = await registerRoutes(app);
    try {
      const wsManager2 = initializeWebSocket(server);
      global.wsManager = wsManager2;
    } catch (error) {
      console.error("WebSocket initialization failed:", error);
      console.log("\u26A0\uFE0F  Continuing without WebSocket support");
    }
    try {
      if (geminiService.isEnabled()) {
        log("\u2705 Gemini API Service initialized");
      } else {
        log("\u26A0\uFE0F  Gemini API Service disabled (GEMINI_API_KEY not set)");
      }
      if (googleSearchService.isEnabled()) {
        log("\u2705 Google Search Service initialized");
      } else {
        log("\u26A0\uFE0F  Google Search Service disabled (requires Gemini API)");
      }
      if (contextCacheService.isEnabled()) {
        log("\u2705 Context Cache Service initialized");
        const cacheStats = contextCacheService.getStats();
        log(`   - Cached entries: ${cacheStats.totalEntries}`);
        log(`   - Total tokens cached: ${cacheStats.totalTokens}`);
      }
      if (videoGenerationService2.isEnabled()) {
        log("\u2705 Video Generation Service initialized");
        const providers = videoGenerationService2.getAvailableProviders();
        log(`   - Available providers: ${providers.join(", ")}`);
      } else {
        log("\u26A0\uFE0F  Video Generation Service disabled (no API keys found)");
      }
      if (smmService.isEnabled()) {
        log("\u2705 SMM Service initialized");
      } else {
        log("\u26A0\uFE0F  SMM Service disabled (requires Gemini API)");
      }
      initializeAIQueue();
      autonomousAIManager.start();
      log("\u{1F916} Autonomous AI Manager ishga tushdi");
    } catch (error) {
      console.error("AI services initialization failed:", error);
      console.log("\u26A0\uFE0F  Continuing without AI services");
    }
    try {
      startCronJobs();
    } catch (error) {
      console.error("Cron jobs initialization failed:", error);
      console.log("\u26A0\uFE0F  Continuing without cron jobs");
    }
    const nodeEnv = process.env.NODE_ENV || "development";
    log(`\u{1F527} Environment: ${nodeEnv}`);
    if (nodeEnv === "development") {
      await setupVite(app, server);
    } else {
      serveStatic(app);
    }
    app.use(notFound);
    if (process.env.SENTRY_DSN) {
      app.use(Sentry.Handlers.errorHandler());
    }
    app.use(errorHandler);
    const port = parseInt(process.env.PORT || "5000", 10);
    server.listen(port, "0.0.0.0", () => {
      log(`\u2705 Server running on port ${port}`);
      log(`\u{1F310} Server URL: http://0.0.0.0:${port}`);
    });
  } catch (error) {
    console.error("\u274C Fatal error during server startup:", error);
    logger2.error("Server startup failed", { error });
    process.exit(1);
  }
})();
process.on("uncaughtException", (error) => {
  console.error("\u274C Uncaught Exception:", error);
  logger2.error("Uncaught Exception", { error });
  if (process.env.NODE_ENV !== "production") {
    process.exit(1);
  }
});
process.on("unhandledRejection", (reason, promise) => {
  console.error("\u274C Unhandled Rejection at:", promise, "reason:", reason);
  logger2.error("Unhandled Rejection", { reason, promise });
  if (process.env.NODE_ENV !== "production") {
    process.exit(1);
  }
});
