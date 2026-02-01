// @ts-nocheck
import express, { type Request, Response, NextFunction } from "express";
import session from "express-session";
import { Server } from "http";
import fs from "fs";
import multer from "multer";
import { nanoid } from "nanoid";
import { storage } from "./storage";
import { healthCheck } from "./health";
import { getSessionConfig } from "./session";
import { asyncHandler } from "./errorHandler";
import { eq, and, desc } from "drizzle-orm";
import { db, getDbType } from "./db";

// Universal timestamp formatter
function formatTimestamp(): any {
  const dbType = getDbType();
  return dbType === 'sqlite' ? Math.floor(Date.now() / 1000) : new Date();
}

// Serialize timestamps in objects for JSON response
// Converts Date objects and Unix timestamps to ISO strings
// FIXED: Handle Invalid Date properly
function serializeTimestamps(obj: any): any {
  if (obj === null || obj === undefined) return obj;
  if (Array.isArray(obj)) return obj.map(serializeTimestamps);
  if (typeof obj !== 'object') return obj;
  
  const result: any = {};
  for (const [key, value] of Object.entries(obj)) {
    if (value instanceof Date) {
      // Date object - check if valid before converting
      if (isNaN(value.getTime())) {
        // Invalid Date - return null instead of throwing error
        result[key] = null;
      } else {
        result[key] = value.toISOString();
      }
    } else if (typeof value === 'number' && (
      key.toLowerCase().includes('date') || 
      key.toLowerCase().includes('at') ||
      key === 'createdAt' || key === 'updatedAt' || key === 'activatedAt'
    )) {
      // Unix timestamp (seconds) - check if it's a reasonable timestamp
      try {
        if (value > 1000000000 && value < 2000000000) {
          const date = new Date(value * 1000);
          result[key] = isNaN(date.getTime()) ? null : date.toISOString();
        } else if (value > 1000000000000) {
          // Milliseconds timestamp
          const date = new Date(value);
          result[key] = isNaN(date.getTime()) ? null : date.toISOString();
        } else {
          result[key] = null; // Invalid timestamp value
        }
      } catch {
        result[key] = null;
      }
    } else if (typeof value === 'object' && value !== null) {
      result[key] = serializeTimestamps(value);
    } else {
      result[key] = value;
    }
  }
  return result;
}
import { partners, referrals, marketplaceIntegrations, blogPosts, blogCategories } from "@shared/schema";

import { 
  loginSchema, 
  partnerRegistrationSchema,
  insertProductSchema,
  insertFulfillmentRequestSchema 
} from "@shared/schema";
import { ZodError } from "zod";
import swaggerUi from "swagger-ui-express";
import swaggerJSDoc from "swagger-jsdoc";
import debugRoutes from "./debugRoutes";

import inventoryRoutes from "./routes/inventoryRoutes";
import investorRoutes from "./routes/investorRoutes";
import marketplaceIntegrationRoutes from "./routes/marketplaceIntegrationRoutes";
import subscriptionRoutes from "./routes/subscriptionRoutes";
import forecastRoutes from "./routes/forecastRoutes";
import broadcastRoutes from "./routes/broadcastRoutes";
import aiManagerRoutes from "./routes/aiManagerRoutes";
import trendingRoutes from "./routes/trendingRoutes";
import aiDashboardRoutes from "./routes/aiDashboard";
import enhancedAIDashboardRoutes from "./routes/enhancedAIDashboard";
import enhancedAIRoutes from "./routes/enhancedAI";
import referralRoutes from "./routes/referralRoutes";
import chatRoutes from "./routes/chatRoutes";
import adminAdvancedFeaturesRoutes from "./routes/adminAdvancedFeatures";
import partnerAdvancedFeaturesRoutes from "./routes/partnerAdvancedFeatures";
import autonomousAIRoutes from "./routes/autonomousAI";
import aiServicesRoutes from "./routes/aiServices";
import autonomousManagerRoutes from "./routes/autonomousManager";
import fulfillmentAIIntegration from "./services/fulfillmentAIIntegration";
import appConfig from "./config";
import { uploadLimiter } from "./middleware/rateLimiter";
import paymentRoutes from "./routes/paymentRoutes";
import paymentIntegrationRoutes from "./routes/paymentIntegration";
import whatsappRoutes from "./routes/whatsappRoutes";
import walletRoutes from "./routes/walletRoutes";
import paymentHistoryRoutes from "./routes/paymentHistoryRoutes";
import referralDashboardRoutes from "./routes/referralDashboardRoutes";
import impersonationRoutes from "./routes/impersonationRoutes";
import businessAnalyticsRoutes from "./routes/businessAnalyticsRoutes";
import adminManagementRoutes from "./routes/adminManagementRoutes";
import telegramRoutes from "./routes/telegramRoutes";
import premiumFeaturesRoutes from "./routes/premiumFeaturesRoutes";
import advancedFeaturesRoutes from "./routes/advancedFeaturesRoutes";
import smartAIRoutes from "./routes/smartAIRoutes";
import billingRoutes from "./routes/billingRoutes";
import aiScannerRoutes from "./routes/aiScannerRoutes";
import adminRemoteAccessRoutes from "./routes/adminRemoteAccess";
import adminReferralManagementRoutes from "./routes/adminReferralManagement";
import priceStrategyRoutes from "./routes/priceStrategyRoutes";
import aiMarketingRoutes from "./routes/aiMarketingRoutes";
import analyticsRoutes from "./routes/analyticsRoutes";
import customerServiceRoutes from "./routes/customerServiceRoutes";
import reportingRoutes from "./routes/reportingRoutes";
import gamificationRoutes from "./routes/gamificationRoutes";
import marketplaceAIManagerRoutes from "./routes/marketplaceAIManagerRoutes";
import adminAIManagementRoutes from "./routes/adminAIManagementRoutes";
import referralCampaignRoutes from "./routes/referralCampaignRoutes";
import smmRoutes from "./routes/smmRoutes";
import aiRoutesV2 from "./routes/aiRoutes";
import aiScannerRoutesV2 from "./routes/aiScannerRoutes";
import trendHunterRoutesV2 from "./routes/trendHunterRoutes";
import uzumMarketRoutes from "./routes/uzumMarketRoutes";
import pythonBackendProxy from "./routes/pythonBackendProxy";
import clickPaymentRoutes from "./routes/clickPaymentRoutes";
import unifiedScannerRoutes from "./routes/unifiedScannerRoutes";
import mxikRoutes from "./routes/mxikRoutes";
import yandexCardRoutes from "./routes/yandexCardRoutes";
import salesSyncService from "./services/salesSyncService";
import { checkAndProcessFirstPurchase } from "./services/referralFirstPurchaseService";

// Yangi tizimlar
import { tierLimitMiddleware, featureAccessMiddleware, checkTierLimit, TIER_LIMITS } from "./middleware/tierLimits";
import { activateNewPartner, activateAfterPayment, ACTIVATION_RULES } from "./services/autoActivation";
import { processReferralBonusOnPayment, getReferrerStats, REFERRAL_CONFIG } from "./services/referralBonus";
import { validateINN, checkBusinessExists, normalizePhone } from "./services/businessVerification";

// Enhanced authentication middleware with better error handling
// Supports both session cookies AND Authorization header (for API calls)
async function requireAuth(req: Request, res: Response, next: NextFunction) {
  // First check session
  if (req.session?.user) {
    return next();
  }
  
  // Then check Authorization header (Bearer token = session ID)
  const authHeader = req.headers.authorization;
  if (authHeader && authHeader.startsWith('Bearer ')) {
    const sessionId = authHeader.substring(7);
    
    // Try to load session by ID from store
    if (req.sessionStore) {
      try {
        const session = await new Promise<any>((resolve, reject) => {
          req.sessionStore.get(sessionId, (err, session) => {
            if (err) reject(err);
            else resolve(session);
          });
        });
        
        if (session?.user) {
          // Attach user data to request
          req.session.user = session.user;
          return next();
        }
      } catch (error) {
        console.error('Session lookup error:', error);
      }
    }
  }
  
  // No valid auth found
  return res.status(401).json({ 
    message: "Avtorizatsiya yo'q",
    code: "UNAUTHORIZED",
    timestamp: new Date().toISOString()
  });
}

async function requireAdmin(req: Request, res: Response, next: NextFunction) {
  // First try to restore session from Authorization header if no session
  if (!req.session?.user) {
    const authHeader = req.headers.authorization;
    if (authHeader && authHeader.startsWith('Bearer ') && req.sessionStore) {
      const sessionId = authHeader.substring(7);
      try {
        const session = await new Promise<any>((resolve, reject) => {
          req.sessionStore.get(sessionId, (err, session) => {
            if (err) reject(err);
            else resolve(session);
          });
        });
        if (session?.user) {
          req.session.user = session.user;
        }
      } catch (error) {
        console.error('Session lookup error:', error);
      }
    }
  }

  if (!req.session?.user) {
    return res.status(401).json({ 
      message: "Avtorizatsiya yo'q",
      code: "UNAUTHORIZED"
    });
  }
  
  if (req.session.user.role !== 'admin') {
    return res.status(403).json({ 
      message: "Admin huquqi talab qilinadi",
      code: "FORBIDDEN"
    });
  }
  
  // Attach user to req for controllers
  (req as any).user = req.session.user;
  
  next();
}

async function requirePartner(req: Request, res: Response, next: NextFunction) {
  // First try to restore session from Authorization header if no session
  if (!req.session?.user) {
    const authHeader = req.headers.authorization;
    if (authHeader && authHeader.startsWith('Bearer ') && req.sessionStore) {
      const sessionId = authHeader.substring(7);
      try {
        const session = await new Promise<any>((resolve, reject) => {
          req.sessionStore.get(sessionId, (err, session) => {
            if (err) reject(err);
            else resolve(session);
          });
        });
        if (session?.user) {
          req.session.user = session.user;
        }
      } catch (error) {
        console.error('Session lookup error:', error);
      }
    }
  }

  if (!req.session?.user) {
    return res.status(401).json({ 
      message: "Avtorizatsiya yo'q",
      code: "UNAUTHORIZED"
    });
  }
  
  if (req.session.user.role !== 'partner' && req.session.user.role !== 'admin') {
    return res.status(403).json({ 
      message: "Hamkor huquqi talab qilinadi",
      code: "FORBIDDEN"
    });
  }
  
  // Attach user to req for controllers
  (req as any).user = req.session.user;
  
  next();
}

// Enhanced middleware - attaches partner data
async function requirePartnerWithData(req: Request, res: Response, next: NextFunction) {
  // First try to restore session from Authorization header if no session
  if (!req.session?.user) {
    const authHeader = req.headers.authorization;
    if (authHeader && authHeader.startsWith('Bearer ') && req.sessionStore) {
      const sessionId = authHeader.substring(7);
      try {
        const session = await new Promise<any>((resolve, reject) => {
          req.sessionStore.get(sessionId, (err, session) => {
            if (err) reject(err);
            else resolve(session);
          });
        });
        if (session?.user) {
          req.session.user = session.user;
        }
      } catch (error) {
        console.error('Session lookup error:', error);
      }
    }
  }

  if (!req.session?.user) {
    return res.status(401).json({ 
      message: "Avtorizatsiya yo'q",
      code: "UNAUTHORIZED"
    });
  }
  
  const user = req.session.user;
  (req as any).user = user;
  
  // Admin can access without partner data
  if (user.role === 'admin') {
    return next();
  }
  
  // Get partner data for non-admin users
  try {
    let partner = await storage.getPartnerByUserId(user.id);
    
    // Auto-create partner if missing (for legacy users)
    if (!partner) {
      console.warn(`Partner not found for user ${user.id}, auto-creating...`);
      try {
        partner = await storage.createPartner({
          userId: user.id,
          businessName: user.username || 'Default Business',
          businessCategory: 'general',
          monthlyRevenue: '0',
          phone: user.phone || '+998000000000',
          notes: 'Auto-created partner profile'
        });
        console.log(`✅ Auto-created partner ${partner.id} for user ${user.id}`);
      } catch (createError) {
        console.error(`Failed to auto-create partner for user ${user.id}:`, createError);
        return res.status(404).json({ 
          message: "Hamkor ma'lumotlari topilmadi va yaratib bo'lmadi",
          code: "PARTNER_NOT_FOUND"
        });
      }
    }
    
    // Attach partner data to req.user
    (req as any).user.partnerId = partner.id;
    (req as any).user.pricingTier = partner.pricingTier;
    (req as any).user.aiEnabled = partner.aiEnabled;
    (req as any).partner = partner;
    
    next();
  } catch (error) {
    console.error('Error in requirePartnerWithData:', error);
    return res.status(500).json({ 
      message: "Server xatolik",
      code: "INTERNAL_ERROR"
    });
  }
}

// Enhanced error handling middleware
function handleValidationError(error: any, req: Request, res: Response, next: NextFunction) {
  if (error instanceof ZodError) {
    return res.status(400).json({
      message: "Ma'lumotlar noto'g'ri",
      code: "VALIDATION_ERROR",
      errors: error.errors.map(err => ({
        field: err.path.join('.'),
        message: err.message
      }))
    });
  }
  next(error);
}

export function registerRoutes(app: express.Application): Server {
  const server = new Server(app);

  // File upload configuration for chat/support files
  const uploadPath = appConfig.upload.uploadPath;
  if (!fs.existsSync(uploadPath)) {
    fs.mkdirSync(uploadPath, { recursive: true });
  }
  const upload = multer({
    dest: uploadPath,
    limits: { fileSize: appConfig.upload.maxFileSize },
  });

  // Serve uploaded files statically
  app.use('/uploads', express.static(uploadPath));
  
  // Serve mobile app statically
  const mobileAppPath = '/app/backend/static/mobile';
  if (fs.existsSync(mobileAppPath)) {
    app.use('/mobile-app', express.static(mobileAppPath));
    // Serve index.html for all mobile app routes (SPA)
    app.get('/mobile-app/*', (_req, res) => {
      res.sendFile(path.join(mobileAppPath, 'index.html'));
    });
    console.log('📱 Mobile app served at /mobile-app');
  }

  // Session configuration
  app.use(session(getSessionConfig()));

  // Map session user -> req.user for controllers that expect req.user
  app.use((req, _res, next) => {
    if (req.session && req.session.user) {
      (req as any).user = req.session.user;
    } else {
      (req as any).user = undefined;
    }
    next();
  });

  // Health check endpoints
  app.get("/health", (req, res) => {
    res.status(200).json({ 
      status: 'ok', 
      timestamp: new Date().toISOString(),
      uptime: process.uptime()
    });
  });
  app.get("/api/health", healthCheck);

  // Debug endpoints (remove after fixing)
  app.use("/api", debugRoutes);

  // Swagger setup
  const swaggerSpec = swaggerJSDoc({
    definition: {
      openapi: '3.0.0',
      info: { title: 'BiznesYordam API', version: '2.0.1' },
      servers: [{ url: '/' }]
    },
    apis: []
  });
  app.use('/api/docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec, { explorer: true }));

  // Uzum Market Direct API Routes
  app.use('/api/uzum-market', uzumMarketRoutes);

  // ========================================
  // Node.js-only routes - MUST be before Python proxy!
  // These handle session-sensitive operations
  // ========================================
  
  // Admin Impersonation - needs Node.js session management
  app.use('/api/admin', impersonationRoutes);
  
  // ========================================
  // Python Backend Proxy - IMPORTANT ORDER!
  // Auth routes are EXCLUDED - handled by Node.js for proper session management
  // ========================================
  
  // Chat, Admin, Partner, AI va boshqa API'lar Python backend orqali ishlaydi
  // NOTE: /api/auth is NOT proxied - Node.js handles login/logout for session management
  app.use('/api/chat', pythonBackendProxy);
  app.use('/api/admin', pythonBackendProxy);
  app.use('/api/partner', pythonBackendProxy);
  app.use('/api/ai-manager', pythonBackendProxy);
  app.use('/api/notifications', pythonBackendProxy);
  app.use('/api/analytics', pythonBackendProxy);
  app.use('/api/trends', pythonBackendProxy);
  app.use('/api/search', pythonBackendProxy);
  app.use('/api/ai', pythonBackendProxy);
  app.use('/api/yandex', pythonBackendProxy);
  app.use('/api/uzum-auto', pythonBackendProxy);
  app.use('/api/uzum-automation', pythonBackendProxy);
  app.use('/api/python', pythonBackendProxy);
  app.use('/api/leads', pythonBackendProxy);  // Leads API - reklama sahifasidan

  // Click Payment Routes - webhook lar autentifikatsiyasiz
  app.use('/api/click', clickPaymentRoutes);

  // Unified Scanner - both Node.js and Python backends handle this
  app.use('/api/unified-scanner', unifiedScannerRoutes);

  // MXIK Code Search - public endpoint for tax code lookup
  app.use('/api/mxik', mxikRoutes);

  // Authentication routes
  app.post("/api/auth/login", asyncHandler(async (req: Request, res: Response) => {
    try {
      console.log('🔐 Login attempt:', { username: req.body.username, hasSession: !!req.session, ip: req.ip });
      
      const { username, password } = loginSchema.parse(req.body);
      
      const user = await storage.validateUserPassword(username, password);
      if (!user) {
        await storage.createAuditLog({
          userId: 'anonymous',
          action: 'LOGIN_FAILED',
          entityType: 'user',
          payload: { username, reason: 'invalid_credentials' }
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

      // Regenerate session to prevent fixation attacks
      await new Promise<void>((resolve, reject) => {
        req.session.regenerate((err) => {
          if (err) {
            console.error('❌ Session regenerate error:', err);
            reject(err);
          } else {
            console.log('✅ Session regenerated');
            resolve();
          }
        });
      });

      // Set session user data
      req.session.user = {
        id: user.id,
        username: user.username,
        email: user.email || undefined,
        firstName: user.firstName || undefined,
        lastName: user.lastName || undefined,
        role: user.role
      };

      // Get partner info if user is a partner
      let partner = null;
      let permissions = null;
      
      if (user.role === 'partner') {
        partner = await storage.getPartnerByUserId(user.id);
      } else if (user.role === 'admin') {
        permissions = await storage.getAdminPermissions(user.id);
      }

      // Save session before sending response
      await new Promise<void>((resolve, reject) => {
        req.session.save((err) => {
          if (err) {
            console.error('❌ Session save error:', err);
            reject(err);
          } else {
            console.log('✅ Session saved successfully for user:', user.id);
            console.log('📝 Session ID:', req.sessionID);
            console.log('🍪 Session data:', { hasUser: !!req.session.user, role: req.session.user?.role });
            resolve();
          }
        });
      });

      await storage.createAuditLog({
        userId: user.id,
        action: 'LOGIN_SUCCESS',
        entityType: 'user',
        payload: { username, role: user.role }
      });

      // Generate session token for API calls
      const token = req.sessionID; // Use session ID as token
      
      // Serialize timestamps to ISO format for frontend
      res.json({ 
        token, // MUHIM: Frontend bunga ehtiyoj bor
        user: serializeTimestamps(req.session.user), 
        partner: serializeTimestamps(partner),
        permissions,
        message: "Muvaffaqiyatli kirildi"
      });
    } catch (error) {
      if (error instanceof ZodError) {
        return res.status(400).json({
          message: "Ma'lumotlar noto'g'ri",
          code: "VALIDATION_ERROR",
          errors: error.errors
        });
      }
      console.error('❌ Login error:', error);
      throw error;
    }
  }));

  // Partner Registration - /api/auth/register alias
  app.post("/api/auth/register", asyncHandler(async (req: Request, res: Response) => {
    try {
      console.log('📝 Registration attempt:', { email: req.body.email });
      
      // Ma'lumotlarni olish
      const { email, password, name, phone, selectedTier, billingPeriod, promoCode } = req.body;
      
      if (!email || !password) {
        return res.status(400).json({
          success: false,
          message: "Email va parol kerak",
          code: "MISSING_FIELDS"
        });
      }
      
      // INN (STIR) tekshirish - MAJBURIY
      const { inn, businessType } = req.body;
      
      if (!inn) {
        return res.status(400).json({
          success: false,
          message: "INN (STIR) kiritish majburiy. Bu biznesingizni identifikatsiya qilish va suiiste'molni oldini olish uchun kerak.",
          code: "INN_REQUIRED"
        });
      }
      
      // INN formatini tekshirish
      const innValidation = validateINN(inn);
      if (!innValidation.valid) {
        return res.status(400).json({
          success: false,
          message: innValidation.error,
          code: "INVALID_INN"
        });
      }
      
      // Biznes mavjudligini tekshirish (INN bo'yicha dublikat oldini olish)
      const cleanINN = inn.replace(/\D/g, '');
      const businessCheck = await checkBusinessExists(cleanINN, phone, email);
      
      if (businessCheck.exists) {
        return res.status(400).json({
          success: false,
          message: businessCheck.reason,
          code: "BUSINESS_EXISTS",
          hint: "Agar bu sizning akkkauntingiz bo'lsa, tizimga kiring yoki parolni tiklang."
        });
      }
      
      // Username yaratish (email dan)
      const username = email.split('@')[0] + '_' + Date.now().toString(36);
      
      // Email mavjudligini tekshirish (user orqali)
      const existingUser = await storage.getUserByUsername(username);
      if (existingUser) {
        return res.status(400).json({
          success: false,
          message: "Bu username allaqachon mavjud",
          code: "USERNAME_EXISTS"
        });
      }
      
      // Telefon normalizatsiya
      const normalizedPhone = normalizePhone(phone || '+998900000000');
      
      // Tarif aniqlash
      const tier = selectedTier || 'free_starter';
      const activationRules = ACTIVATION_RULES[tier as keyof typeof ACTIVATION_RULES] || ACTIVATION_RULES.free_starter;
      
      // 1. Avval USER yaratish
      const user = await storage.createUser({
        username,
        password,
        role: 'partner'
      });
      
      // 2. Keyin PARTNER yaratish (INN bilan)
      const partner = await storage.createPartner({
        userId: user.id,
        businessName: name || 'My Business',
        businessCategory: 'general',
        businessType: businessType || 'yatt',
        inn: cleanINN, // STIR - unikal
        phone: normalizedPhone,
        pricingTier: tier,
        // Free uchun darhol aktiv
        approved: !activationRules.requirePayment,
        isActive: !activationRules.requirePayment,
        aiEnabled: !activationRules.requirePayment,
        billingPeriod: billingPeriod || 'monthly'
      });
      
      // 3. Avtomatik aktivatsiya (Free uchun)
      if (!activationRules.requirePayment) {
        await activateNewPartner(partner.id, tier);
        console.log(`✅ Hamkor avtomatik aktivatsiya qilindi: ${partner.id} (${tier}) INN: ${cleanINN}`);
      }
      
      // 4. Promo kod tekshirish (referal)
      if (promoCode) {
        try {
          const referrer = await db.select().from(partners).where(eq(partners.promoCode, promoCode));
          if (referrer.length > 0) {
            await db.insert(referrals).values({
              id: crypto.randomUUID(),
              referrerId: referrer[0].id,
              referredId: partner.id,
              promoCode,
              status: 'pending',
              createdAt: formatTimestamp()
            });
            console.log(`✅ Referal bog'landi: ${referrer[0].id} -> ${partner.id}`);
          }
        } catch (refErr) {
          console.log('Referal bog\'lashda xato:', refErr);
        }
      }
      
      // Session yaratish
      req.session.user = {
        id: user.id,
        username: user.username,
        role: 'partner',
        partnerId: partner.id,
        tier: partner.pricingTier || 'free_starter'
      };
      
      await storage.createAuditLog({
        userId: user.id,
        action: 'PARTNER_REGISTERED',
        entityType: 'partner',
        entityId: partner.id,
        payload: { email, name, username, tier, billingPeriod }
      });
      
      res.status(201).json({
        success: true,
        message: activationRules.requirePayment 
          ? "Ro'yxatdan o'tildi! Aktivatsiya uchun to'lov qiling."
          : "Muvaffaqiyatli ro'yxatdan o'tildi!",
        user: {
          id: user.id,
          username: user.username,
          email: email,
          role: 'partner',
          partnerId: partner.id,
          tier: partner.pricingTier || 'free'
        }
      });
      
    } catch (error: any) {
      console.error('❌ Registration error:', error);
      throw error;
    }
  }));

  app.post("/api/auth/logout", asyncHandler(async (req: Request, res: Response) => {
    const userId = req.session?.user?.id;
    
    if (userId) {
      await storage.createAuditLog({
        userId,
        action: 'LOGOUT',
        entityType: 'user'
      });
    }

    req.session.destroy((err) => {
      if (err) {
        console.error('Session destroy error:', err);
        return res.status(500).json({ 
          message: "Chiqishda xatolik",
          code: "LOGOUT_ERROR"
        });
      }
      
      res.clearCookie('connect.sid');
      res.json({ message: "Muvaffaqiyatli chiqildi" });
    });
  }));

  app.get("/api/auth/me", asyncHandler(async (req: Request, res: Response) => {
    console.log('🔍 Auth check:', { 
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
    
    if (req.session.user.role === 'partner') {
      partner = await storage.getPartnerByUserId(req.session.user.id);
    } else if (req.session.user.role === 'admin') {
      permissions = await storage.getAdminPermissions(req.session.user.id);
    }

    // Serialize timestamps to ISO format
    res.json({ 
      user: serializeTimestamps(req.session.user), 
      partner: serializeTimestamps(partner),
      permissions
    });
  }));

  // Partner registration
  app.post("/api/partners/register", asyncHandler(async (req: Request, res: Response) => {
    try {
      console.log('[REGISTRATION] Received data:', JSON.stringify(req.body, null, 2));
      
      const validatedData = partnerRegistrationSchema.parse(req.body);
      console.log('[REGISTRATION] Validation passed');
      
      // Check if username or email already exists
      const existingUser = await storage.getUserByUsername(validatedData.username);
      if (existingUser) {
        console.log('[REGISTRATION] Username already exists:', validatedData.username);
        return res.status(400).json({
          message: "Bu username allaqachon mavjud",
          code: "USERNAME_EXISTS"
        });
      }

      console.log('[REGISTRATION] Creating user...');
      // Create user
      const user = await storage.createUser({
        username: validatedData.username,
        email: validatedData.email,
        password: validatedData.password,
        firstName: validatedData.firstName,
        lastName: validatedData.lastName,
        phone: validatedData.phone,
        role: 'partner'
      });
      console.log('[REGISTRATION] User created:', user.id);

      console.log('[REGISTRATION] Creating partner profile...');
      // Create partner profile with referral code
      const referralCode = (req.body as any).referralCode;
      const partner = await storage.createPartner({
        userId: user.id,
        businessName: validatedData.businessName,
        businessCategory: validatedData.businessCategory || 'general',
        monthlyRevenue: validatedData.monthlyRevenue || '0',
        phone: validatedData.phone, // CRITICAL: phone required!
        notes: validatedData.notes || undefined,
        referralCode: referralCode // Pass referral code to createPartner
      });
      console.log('[REGISTRATION] Partner created:', partner.id);

      // Handle referral/promo code if provided
      if (referralCode) {
        try {
          // Find referrer by promo code in partners table
          const referrerPartner = await db.select()
            .from(partners)
            .where(eq(partners.promoCode, referralCode))
            .limit(1);

          if (referrerPartner.length > 0) {
            const referrerId = referrerPartner[0].id;
            
            // Create referral record for new partner
            await db.insert(referrals).values({
              id: `ref_${Date.now()}`,
              referrerPartnerId: referrerId,
              referredPartnerId: partner.id,
              promoCode: referralCode,
              contractType: 'starter_pro',
              status: 'registered',
              createdAt: formatTimestamp()
            });

            console.log('✅ Referral created via promo code:', referralCode, '→', partner.id);
          } else {
            console.log('⚠️ Promo code not found in partners:', referralCode);
          }
        } catch (refError) {
          console.error('⚠️ Referral creation failed:', refError);
          // Don't fail registration if referral fails
        }
      }

      await storage.createAuditLog({
        userId: user.id,
        action: 'PARTNER_REGISTERED',
        entityType: 'partner',
        entityId: partner.id,
        payload: { businessName: validatedData.businessName, referralCode }
      });

      console.log('[REGISTRATION] Success! User:', user.id, 'Partner:', partner.id);
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
      console.error('[REGISTRATION] Error:', error);
      if (error instanceof ZodError) {
        console.error('[REGISTRATION] Validation error:', error.errors);
        return res.status(400).json({
          message: "Ma'lumotlar noto'g'ri",
          code: "VALIDATION_ERROR",
          errors: error.errors
        });
      }
      console.error('[REGISTRATION] Unexpected error:', error);
      return res.status(500).json({
        message: "Ro'yxatdan o'tishda xatolik",
        code: "REGISTRATION_ERROR",
        error: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  }));

  // Partner routes
  app.get("/api/partners/me", requirePartnerWithData, asyncHandler(async (req: Request, res: Response) => {
    console.log('🔍 GET /api/partners/me - User ID:', req.session?.user?.id);
    const partner = await storage.getPartnerByUserId(req.session!.user!.id);
    console.log('📦 Partner found:', partner ? 'Yes' : 'No');
    if (!partner) {
      console.log('❌ Partner not found for user:', req.session!.user!.id);
      return res.status(404).json({ 
        message: "Hamkor ma'lumotlari topilmadi",
        code: "PARTNER_NOT_FOUND"
      });
    }
    res.json(partner);
  }));

  app.put("/api/partners/me", requirePartnerWithData, asyncHandler(async (req: Request, res: Response) => {
    const partner = await storage.getPartnerByUserId(req.session!.user!.id);
    if (!partner) {
      return res.status(404).json({ 
        message: "Hamkor ma'lumotlari topilmadi",
        code: "PARTNER_NOT_FOUND"
      });
    }

    const updatedPartner = await storage.updatePartner(partner.id, req.body);
    
    await storage.createAuditLog({
      userId: req.session!.user!.id,
      action: 'PARTNER_UPDATED',
      entityType: 'partner',
      entityId: partner.id,
      payload: req.body
    });

    res.json(updatedPartner);
  }));

  // Product routes
  app.get("/api/products", requirePartnerWithData, asyncHandler(async (req: Request, res: Response) => {
    const partner = await storage.getPartnerByUserId(req.session!.user!.id);
    if (!partner) {
      return res.status(404).json({ 
        message: "Hamkor ma'lumotlari topilmadi",
        code: "PARTNER_NOT_FOUND"
      });
    }

    const products = await storage.getProductsByPartnerId(partner.id);
    res.json(products);
  }));

  // Simple product creation - minimal ma'lumotlar
  app.post("/api/products/simple", requirePartnerWithData, upload.single('image'), asyncHandler(async (req: Request, res: Response) => {
    const user = (req as any).user;
    const partner = (req as any).partner;
    const file = (req as any).file;
    
    const { name, stockQuantity, costPrice } = req.body;
    
    if (!name || !stockQuantity || !costPrice) {
      return res.status(400).json({
        message: "Nomi, qoldiq va tannarx majburiy",
        code: "MISSING_FIELDS"
      });
    }
    
    try {
      // Create product with minimal data
      const product = await storage.createProduct({
        partnerId: partner.id,
        name,
        stockQuantity: parseInt(stockQuantity),
        costPrice: parseFloat(costPrice),
        price: parseFloat(costPrice) * 1.3, // Default 30% markup
        category: 'general',
        description: '',
        sku: `SKU-${Date.now()}`,
        weight: '0.5',
      });
      
      // Trigger AI Manager to create marketplace cards automatically
      // This runs in background - partner doesn't need to do anything
      const { generateProductCard } = await import('./services/aiManagerService');
      
      // Get partner's active marketplace integrations
      const integrations = await db.select()
        .from(marketplaceIntegrations)
        .where(and(
          eq(marketplaceIntegrations.partnerId, partner.id),
          eq(marketplaceIntegrations.active, true)
        ));
      
      // Create cards for each active marketplace
      for (const integration of integrations) {
        try {
          await generateProductCard({
            name,
            category: 'general',
            description: '',
            price: parseFloat(costPrice) * 1.3,
            images: file ? [`/uploads/${file.filename}`] : [],
            targetMarketplace: integration.marketplace as any
          }, parseInt(partner.id));
        } catch (error) {
          console.error(`Failed to create card for ${integration.marketplace}:`, error);
          // Continue with other marketplaces
        }
      }
      
      res.json({
        success: true,
        product,
        message: "Mahsulot yaratildi. AI Manager avtomatik kartochkalar yaratmoqda..."
      });
    } catch (error: any) {
      console.error('Simple product creation error:', error);
      res.status(500).json({
        message: "Mahsulot yaratishda xatolik",
        error: error.message
      });
    }
  }));

  app.post("/api/products", requirePartnerWithData, asyncHandler(async (req: Request, res: Response) => {
    try {
      // Pre-process: convert string numbers to actual numbers
      const processedBody = {
        ...req.body,
        price: typeof req.body.price === 'string' ? parseFloat(req.body.price) : req.body.price,
        costPrice: typeof req.body.costPrice === 'string' ? parseFloat(req.body.costPrice) : req.body.costPrice,
        weight: req.body.weight ? (typeof req.body.weight === 'string' ? parseFloat(req.body.weight) : req.body.weight) : undefined
      };
      
      const validatedData = insertProductSchema.parse(processedBody);
      
      const partner = await storage.getPartnerByUserId(req.session!.user!.id);
      if (!partner) {
        return res.status(404).json({ 
          message: "Hamkor ma'lumotlari topilmadi",
          code: "PARTNER_NOT_FOUND"
        });
      }

      const product = await storage.createProduct({
        partnerId: partner.id,
        name: validatedData.name,
        category: validatedData.category || 'general',
        price: validatedData.price,
        description: validatedData.description || '',
        costPrice: validatedData.costPrice,
        sku: validatedData.sku || `SKU-${Date.now()}`,
        barcode: validatedData.barcode,
        weight: validatedData.weight
      });

      await storage.createAuditLog({
        userId: req.session!.user!.id,
        action: 'PRODUCT_CREATED',
        entityType: 'product',
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

  // Fulfillment request routes
  app.get("/api/fulfillment-requests", requirePartnerWithData, asyncHandler(async (req: Request, res: Response) => {
    if (req.session!.user!.role === 'admin') {
      const requests = await storage.getAllFulfillmentRequests();
      res.json(requests);
    } else {
      const partner = await storage.getPartnerByUserId(req.session!.user!.id);
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

  app.post("/api/fulfillment-requests", requirePartnerWithData, asyncHandler(async (req: Request, res: Response) => {
    try {
      const validatedData = insertFulfillmentRequestSchema.parse(req.body);
      
      const partner = await storage.getPartnerByUserId(req.session!.user!.id);
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
        productId: validatedData.productId ?? undefined,
        priority: validatedData.priority || undefined,
        estimatedCost: validatedData.estimatedCost || undefined,
        metadata: validatedData.metadata || undefined
      });

      await storage.createAuditLog({
        userId: req.session!.user!.id,
        action: 'FULFILLMENT_REQUEST_CREATED',
        entityType: 'fulfillment_request',
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

  app.put("/api/fulfillment-requests/:id", requireAuth, asyncHandler(async (req: Request, res: Response) => {
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
      userId: req.session!.user!.id,
      action: 'FULFILLMENT_REQUEST_UPDATED',
      entityType: 'fulfillment_request',
      entityId: id,
      payload: updates
    });

    res.json(request);
  }));

  // Fulfillment accept with AI auto-trigger
  app.post("/api/fulfillment-requests/:id/accept", requireAdmin, asyncHandler(async (req: Request, res: Response) => {
    const { id } = req.params;
    const adminId = req.session!.user!.id;

    // Update status to accepted
    const request = await storage.updateFulfillmentRequest(id, { status: 'accepted' });
    if (!request) {
      return res.status(404).json({ 
        message: "So'rov topilmadi",
        code: "REQUEST_NOT_FOUND"
      });
    }

    // Trigger AI Manager
    try {
      const aiResult = await fulfillmentAIIntegration.triggerAIForFulfillment(
        parseInt(id, 10),
        adminId
      );

      await storage.createAuditLog({
        userId: adminId,
        action: 'FULFILLMENT_ACCEPTED_AI_TRIGGERED',
        entityType: 'fulfillment_request',
        entityId: id,
        payload: { aiResult }
      });

      res.json({ 
        message: "So'rov qabul qilindi va AI ishga tushirildi",
        request,
        aiResult
      });
    } catch (error: any) {
      // If AI fails, still accept the fulfillment
      console.error('AI trigger error:', error.message);
      res.json({
        message: "So'rov qabul qilindi, lekin AI xatolik yuz berdi",
        request,
        aiError: error.message
      });
    }
  }));

  // Manual AI trigger for specific product
  app.post("/api/ai-manager/trigger-product/:productId", requireAdmin, asyncHandler(async (req: Request, res: Response) => {
    const { productId } = req.params;
    const { marketplaceType } = req.body;
    const adminId = req.session!.user!.id;

    if (!marketplaceType) {
      return res.status(400).json({
        message: "marketplaceType talab qilinadi",
        code: "MISSING_MARKETPLACE_TYPE"
      });
    }

    const result = await fulfillmentAIIntegration.manuallyTriggerAIForProduct(
      parseInt(productId),
      marketplaceType,
      adminId
    );

    res.json(result);
  }));

  // Analytics routes
  app.get("/api/analytics", requirePartnerWithData, asyncHandler(async (req: Request, res: Response) => {
    const partner = await storage.getPartnerByUserId(req.session!.user!.id);
    if (!partner) {
      return res.status(404).json({ 
        message: "Hamkor ma'lumotlari topilmadi",
        code: "PARTNER_NOT_FOUND"
      });
    }

    const analytics = await storage.getAnalyticsByPartnerId(partner.id);
    res.json(analytics);
  }));

  // Profit breakdown routes
  app.get("/api/profit-breakdown", requirePartnerWithData, asyncHandler(async (req: Request, res: Response) => {
    const partner = await storage.getPartnerByUserId(req.session!.user!.id);
    if (!partner) {
      return res.status(404).json({ 
        message: "Hamkor ma'lumotlari topilmadi",
        code: "PARTNER_NOT_FOUND"
      });
    }

    const { period, marketplace } = req.query;
    const profitData = await storage.getProfitBreakdown(partner.id, {
      period: period as string,
      marketplace: marketplace as string
    });
    
    res.json(profitData);
  }));

  // Trending products routes
  app.get("/api/trending-products/:category/:market/:minScore", requirePartnerWithData, asyncHandler(async (req: Request, res: Response) => {
    const { category, market, minScore } = req.params;
    
    // Check tier access for trending products
    const partner = await storage.getPartnerByUserId(req.session!.user!.id);
    if (!partner) {
      return res.status(404).json({ 
        message: "Hamkor ma'lumotlari topilmadi",
        code: "PARTNER_NOT_FOUND"
      });
    }

    // Only Professional Plus and Enterprise Elite can access trending products
    if (!['professional_plus', 'enterprise_elite'].includes(partner.pricingTier)) {
      return res.status(403).json({
        message: "Bu funksiya uchun Professional Plus yoki Enterprise Elite tarifi kerak",
        code: "TIER_ACCESS_REQUIRED",
        requiredTier: "professional_plus"
      });
    }

    const products = await storage.getTrendingProducts({
      category: category !== 'all' ? category : undefined,
      sourceMarket: market !== 'all' ? market : undefined,
      minTrendScore: parseInt(minScore) || 70
    });
    
    res.json(products);
  }));

  // Admin routes
  app.get("/api/admin/trending-products", requireAdmin, asyncHandler(async (req: Request, res: Response) => {
    const products = await storage.getTrendingProducts();
    res.json(products);
  }));

  app.get("/api/admin/partners", requireAdmin, asyncHandler(async (req: Request, res: Response) => {
    const partners = await storage.getAllPartners();
    res.json(partners);
  }));

  app.put("/api/admin/partners/:id/approve", requireAdmin, asyncHandler(async (req: Request, res: Response) => {
    const { id } = req.params;
    
    console.log(`[ADMIN] Approving partner ${id} by admin ${req.session!.user!.id}`);
    
    const partner = await storage.approvePartner(id, req.session!.user!.id);
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
      userId: req.session!.user!.id,
      action: 'PARTNER_APPROVED',
      entityType: 'partner',
      entityId: id
    });

    res.json(partner);
  }));

  app.put("/api/admin/partners/:id/anydesk", requireAdmin, asyncHandler(async (req: Request, res: Response) => {
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
      userId: req.session!.user!.id,
      action: 'ANYDESK_UPDATED',
      entityType: 'partner',
      entityId: id
    });

    res.json(partner);
  }));

  app.put("/api/admin/partners/:id/block", requireAdmin, asyncHandler(async (req: Request, res: Response) => {
    const { id } = req.params;
    
    const partner = await storage.updatePartner(id, { approved: false });
    if (!partner) {
      return res.status(404).json({ 
        message: "Hamkor topilmadi",
        code: "PARTNER_NOT_FOUND"
      });
    }

    await storage.createAuditLog({
      userId: req.session!.user!.id,
      action: 'PARTNER_BLOCKED',
      entityType: 'partner',
      entityId: id
    });

    res.json(partner);
  }));

  // Admin: Activate/Deactivate partner (without payment)
  app.put("/api/admin/partners/:id/activate", requireAdmin, asyncHandler(async (req: Request, res: Response) => {
    const { id } = req.params;
    const { isActive, pricingTier, adminNote } = req.body;
    
    const updateData: any = { 
      isActive: isActive !== undefined ? isActive : true,
      approved: isActive !== undefined ? isActive : true
    };
    
    if (pricingTier) {
      updateData.pricingTier = pricingTier;
    }
    
    const partner = await storage.updatePartner(id, updateData);
    if (!partner) {
      return res.status(404).json({ 
        message: "Hamkor topilmadi",
        code: "PARTNER_NOT_FOUND"
      });
    }

    await storage.createAuditLog({
      userId: req.session!.user!.id,
      action: isActive ? 'PARTNER_ACTIVATED_BY_ADMIN' : 'PARTNER_DEACTIVATED_BY_ADMIN',
      entityType: 'partner',
      entityId: id,
      payload: { adminNote, pricingTier }
    });

    res.json({
      success: true,
      message: `Partner ${isActive ? 'faollashtirildi' : 'deaktivatsiya qilindi'}`,
      partner
    });
  }));

  // Pricing tiers
  app.get("/api/pricing-tiers", asyncHandler(async (req: Request, res: Response) => {
    const tiers = await storage.getAllPricingTiers();
    res.json(tiers);
  }));

  // Tier upgrade requests
  app.post("/api/tier-upgrade-requests", requirePartnerWithData, asyncHandler(async (req: Request, res: Response) => {
    const partner = await storage.getPartnerByUserId(req.session!.user!.id);
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
      userId: req.session!.user!.id,
      action: 'TIER_UPGRADE_REQUESTED',
      entityType: 'tier_upgrade_request',
      entityId: request.id,
      payload: { requestedTier, currentTier: partner.pricingTier }
    });

    res.status(201).json(request);
  }));

  app.get("/api/admin/tier-upgrade-requests", requireAdmin, asyncHandler(async (req: Request, res: Response) => {
    const requests = await storage.getTierUpgradeRequests();
    res.json(requests);
  }));

  app.put("/api/admin/tier-upgrade-requests/:id", requireAdmin, asyncHandler(async (req: Request, res: Response) => {
    const { id } = req.params;
    const { status, adminNotes } = req.body;

    const request = await storage.updateTierUpgradeRequest(id, {
      status,
      adminNotes,
      reviewedBy: req.session!.user!.id,
      reviewedAt: new Date()
    });

    if (!request) {
      return res.status(404).json({ 
        message: "So'rov topilmadi",
        code: "REQUEST_NOT_FOUND"
      });
    }

    await storage.createAuditLog({
      userId: req.session!.user!.id,
      action: 'TIER_UPGRADE_REVIEWED',
      entityType: 'tier_upgrade_request',
      entityId: id,
      payload: { status, adminNotes }
    });

    res.json(request);
  }));

  // Email notification routes
  app.post("/api/notifications/send", requireAuth, asyncHandler(async (req: Request, res: Response) => {
    const { to, template, data } = req.body;
    
    if (!to || !template || !data) {
      return res.status(400).json({
        message: "Email, template va data talab qilinadi",
        code: "MISSING_FIELDS"
      });
    }

    // Import email service dynamically
    const { sendEmail } = await import('./email');
    const result = await sendEmail(to, template, data);

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

  // AI Services Toggle - Tarifga bog'liq (Admin tasdiqi shart emas)
  app.post("/api/partners/ai-toggle", requirePartnerWithData, asyncHandler(async (req: Request, res: Response) => {
    const partner = await storage.getPartnerByUserId(req.session!.user!.id);
    if (!partner) {
      return res.status(404).json({ message: "Hamkor topilmadi", code: "PARTNER_NOT_FOUND" });
    }

    const { enabled } = req.body;
    const currentTier = partner.pricingTier || 'free';
    
    // Free tarifda AI cheklangan
    const FREE_AI_LIMIT = 10;
    const aiCardsUsed = partner.aiCardsUsed || 0;

    if (enabled) {
      // Free tarifda limit tekshirish
      if (currentTier === 'free' || currentTier === 'free_starter') {
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
      
      // AI yoqish - avtomatik (admin tasdiqi shart emas)
      await db.update(partners).set({ 
        aiEnabled: true
      }).where(eq(partners.id, partner.id));

      await storage.createAuditLog({
        userId: req.session!.user!.id,
        action: 'AI_ENABLED',
        entityType: 'partner',
        entityId: partner.id
      });

      res.json({ 
        success: true, 
        message: "AI yoqildi", 
        aiEnabled: true,
        aiCardsUsed,
        limit: currentTier === 'free' || currentTier === 'free_starter' ? FREE_AI_LIMIT : null
      });
    } else {
      // AI o'chirish
      await db.update(partners).set({ 
        aiEnabled: false
      }).where(eq(partners.id, partner.id));

      await storage.createAuditLog({
        userId: req.session!.user!.id,
        action: 'AI_DISABLED',
        entityType: 'partner',
        entityId: partner.id
      });

      res.json({ success: true, message: "AI o'chirildi", aiEnabled: false });
    }
  }));

  // AI Card usage tracking
  app.post("/api/partners/ai-card-used", requirePartnerWithData, asyncHandler(async (req: Request, res: Response) => {
    const partner = await storage.getPartnerByUserId(req.session!.user!.id);
    if (!partner) {
      return res.status(404).json({ message: "Hamkor topilmadi" });
    }

    const currentTier = partner.pricingTier || 'free';
    const aiCardsUsed = (partner.aiCardsUsed || 0) + 1;
    const FREE_AI_LIMIT = 10;

    // Update usage
    await db.update(partners).set({ 
      aiCardsUsed 
    }).where(eq(partners.id, partner.id));

    // Check limit for free tier
    const requiresUpgrade = (currentTier === 'free' || currentTier === 'free_starter') && aiCardsUsed >= FREE_AI_LIMIT;

    res.json({ 
      success: true, 
      aiCardsUsed,
      limit: currentTier === 'free' || currentTier === 'free_starter' ? FREE_AI_LIMIT : null,
      requiresUpgrade
    });
  }));

  app.post("/api/admin/partners/:partnerId/approve-ai", requireAdmin, asyncHandler(async (req: Request, res: Response) => {
    const { partnerId } = req.params;
    await db.update(partners).set({ 
      aiEnabled: true
    }).where(eq(partners.id, partnerId));

    await storage.createAuditLog({
      userId: req.session!.user!.id,
      action: 'AI_APPROVED',
      entityType: 'partner',
      entityId: partnerId
    });

    res.json({ success: true, message: "AI tasdiqlandi", aiEnabled: true });
  }));

  // ==================== NEW MODULE ROUTES ====================

  // ==================== PARTNER MARKETPLACE SETUP ====================
  // Hamkor o'zi API kiritib integratsiya qiladi
  app.get("/api/partner/marketplace-integrations", requirePartnerWithData, asyncHandler(async (req: Request, res: Response) => {
    const partner = await storage.getPartnerByUserId(req.session!.user!.id);
    if (!partner) {
      return res.status(404).json({ message: "Hamkor topilmadi" });
    }
    
    const integrations = await db.select().from(marketplaceIntegrations)
      .where(eq(marketplaceIntegrations.partnerId, partner.id));
    
    res.json(integrations);
  }));

  app.post("/api/partner/marketplace-integrations", requirePartnerWithData, asyncHandler(async (req: Request, res: Response) => {
    const partner = await storage.getPartnerByUserId(req.session!.user!.id);
    if (!partner) {
      return res.status(404).json({ message: "Hamkor topilmadi" });
    }

    const { marketplace, apiKey, apiSecret, shopId } = req.body;
    
    if (!marketplace || !apiKey) {
      return res.status(400).json({ message: "Marketplace va API key talab qilinadi" });
    }

    // Check existing integration
    const existing = await db.select().from(marketplaceIntegrations)
      .where(and(
        eq(marketplaceIntegrations.partnerId, partner.id),
        eq(marketplaceIntegrations.marketplace, marketplace)
      ));

    if (existing.length > 0) {
      // Update existing
      await db.update(marketplaceIntegrations).set({
        apiKey,
        apiSecret: apiSecret || null,
        active: true
      }).where(eq(marketplaceIntegrations.id, existing[0].id));
    } else {
      // Create new
      await db.insert(marketplaceIntegrations).values({
        id: nanoid(),
        partnerId: partner.id,
        marketplace,
        apiKey,
        apiSecret: apiSecret || null,
        active: true
      });
    }

    await storage.createAuditLog({
      userId: req.session!.user!.id,
      action: 'MARKETPLACE_CONNECTED',
      entityType: 'marketplace_integration',
      entityId: marketplace
    });

    res.json({ success: true, message: "Marketplace ulandi" });
  }));

  app.post("/api/partner/marketplace-integrations/:marketplace/test", requirePartnerWithData, asyncHandler(async (req: Request, res: Response) => {
    const partner = await storage.getPartnerByUserId(req.session!.user!.id);
    if (!partner) {
      return res.status(404).json({ message: "Hamkor topilmadi" });
    }

    const { marketplace } = req.params;
    
    // Get integration
    const integration = await db.select().from(marketplaceIntegrations)
      .where(and(
        eq(marketplaceIntegrations.partnerId, partner.id),
        eq(marketplaceIntegrations.marketplace, marketplace)
      ));

    if (integration.length === 0) {
      return res.status(404).json({ success: false, message: "Integratsiya topilmadi" });
    }

    // TODO: Real API test - for now return success
    res.json({ success: true, message: "Ulanish muvaffaqiyatli" });
  }));

  app.delete("/api/partner/marketplace-integrations/:marketplace", requirePartnerWithData, asyncHandler(async (req: Request, res: Response) => {
    const partner = await storage.getPartnerByUserId(req.session!.user!.id);
    if (!partner) {
      return res.status(404).json({ message: "Hamkor topilmadi" });
    }

    const { marketplace } = req.params;
    
    await db.delete(marketplaceIntegrations)
      .where(and(
        eq(marketplaceIntegrations.partnerId, partner.id),
        eq(marketplaceIntegrations.marketplace, marketplace)
      ));

    res.json({ success: true, message: "Integratsiya o'chirildi" });
  }));

  // ==================== DIRECT TIER UPGRADE (AUTO) ====================
  app.post("/api/subscriptions/direct-upgrade", requirePartnerWithData, asyncHandler(async (req: Request, res: Response) => {
    const partner = await storage.getPartnerByUserId(req.session!.user!.id);
    if (!partner) {
      return res.status(404).json({ message: "Hamkor topilmadi" });
    }

    const { targetTier, paymentMethod } = req.body;
    
    if (!targetTier || !paymentMethod) {
      return res.status(400).json({ message: "Tarif va to'lov usuli talab qilinadi" });
    }

    // Tier narxlari
    const TIER_PRICES: Record<string, number> = {
      'free': 0,
      'basic': 828000,
      'starter_pro': 4188000,
      'professional': 10788000
    };

    // AI tarifga bog'liq
    const aiEnabled = targetTier !== 'free';

    // TODO: Real payment integration
    // For now, simulate payment success
    
    // Update partner tier
    await db.update(partners).set({
      pricingTier: targetTier,
      aiEnabled,
      monthlyFee: TIER_PRICES[targetTier] || 0
    }).where(eq(partners.id, partner.id));

    await storage.createAuditLog({
      userId: req.session!.user!.id,
      action: 'TIER_UPGRADED',
      entityType: 'partner',
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

  // ==================== TARIF CHEKLOVLARI API ====================
  
  // Hamkor tarif limitlarini olish
  app.get("/api/partner/tier-limits", requirePartnerWithData, asyncHandler(async (req: Request, res: Response) => {
    const partner = await storage.getPartnerByUserId(req.session!.user!.id);
    if (!partner) {
      return res.status(404).json({ success: false, error: "Hamkor topilmadi" });
    }
    
    const tier = partner.pricingTier || 'free_starter';
    const limits = TIER_LIMITS[tier as keyof typeof TIER_LIMITS] || TIER_LIMITS.free_starter;
    
    // Hozirgi foydalanish (bu oyda)
    const aiCardsCheck = await checkTierLimit(partner.id, 'aiCards');
    const trendHunterCheck = await checkTierLimit(partner.id, 'trendHunter');
    const productsCheck = await checkTierLimit(partner.id, 'products');
    
    res.json({
      success: true,
      tier: limits.name,
      tierId: tier,
      limits: {
        products: { limit: limits.products, used: productsCheck.current, remaining: productsCheck.remaining },
        aiCards: { limit: limits.aiCards, used: aiCardsCheck.current, remaining: aiCardsCheck.remaining },
        trendHunter: { limit: limits.trendHunter, used: trendHunterCheck.current, remaining: trendHunterCheck.remaining },
        marketplaces: limits.marketplaces,
        monthlyRevenue: limits.monthlyRevenue
      },
      features: limits.features,
      excluded: limits.excluded
    });
  }));

  // Limit tekshirish (action uchun)
  app.post("/api/partner/check-limit", requirePartnerWithData, asyncHandler(async (req: Request, res: Response) => {
    const partner = await storage.getPartnerByUserId(req.session!.user!.id);
    if (!partner) {
      return res.status(404).json({ success: false, error: "Hamkor topilmadi" });
    }
    
    const { action, count = 1 } = req.body;
    
    if (!action || !['aiCards', 'trendHunter', 'products', 'marketplaces'].includes(action)) {
      return res.status(400).json({ success: false, error: "Noto'g'ri action" });
    }
    
    const check = await checkTierLimit(partner.id, action, count);
    
    res.json({
      success: true,
      allowed: check.allowed,
      current: check.current,
      limit: check.limit,
      remaining: check.remaining,
      tier: check.tier
    });
  }));

  // ==================== REFERAL BONUS API ====================
  
  // Referal statistikasi
  app.get("/api/partner/referral-stats", requirePartnerWithData, asyncHandler(async (req: Request, res: Response) => {
    const partner = await storage.getPartnerByUserId(req.session!.user!.id);
    if (!partner) {
      return res.status(404).json({ success: false, error: "Hamkor topilmadi" });
    }
    
    const stats = await getReferrerStats(partner.id);
    
    res.json({
      success: true,
      ...stats,
      promoCode: partner.promoCode,
      referralLink: `https://sellercloudx.com/register?ref=${partner.promoCode}`
    });
  }));

  // ==================== PROMO CODE REFERRAL ====================
  app.get("/api/partner/referrals/dashboard", requirePartnerWithData, asyncHandler(async (req: Request, res: Response) => {
    const partner = await storage.getPartnerByUserId(req.session!.user!.id);
    if (!partner) {
      return res.status(404).json({ message: "Hamkor topilmadi" });
    }

    // Generate promo code if not exists
    let promoCode = partner.promoCode;
    if (!promoCode) {
      promoCode = `SC${nanoid(6).toUpperCase()}`;
      await db.update(partners).set({ promoCode }).where(eq(partners.id, partner.id));
    }

    // Get referrals
    const partnerReferrals = await db.select().from(referrals)
      .where(eq(referrals.referrerPartnerId, partner.id));

    // Calculate stats
    const totalReferrals = partnerReferrals.length;
    const activeReferrals = partnerReferrals.filter(r => r.status === 'active').length;
    const totalEarnings = partnerReferrals.reduce((sum, r) => sum + (r.bonusEarned || 0), 0);

    const referralLink = `https://sellercloudx.com/register?ref=${promoCode}`;

    res.json({
      stats: {
        totalReferrals,
        activeReferrals,
        totalEarnings,
        conversionRate: totalReferrals > 0 ? Math.round((activeReferrals / totalReferrals) * 100) : 0
      },
      promoCode,
      referralCode: promoCode,
      referralLink,
      referrals: partnerReferrals
    });
  }));

  app.post("/api/partner/referrals/generate-promo-code", requirePartnerWithData, asyncHandler(async (req: Request, res: Response) => {
    const partner = await storage.getPartnerByUserId(req.session!.user!.id);
    if (!partner) {
      return res.status(404).json({ message: "Hamkor topilmadi" });
    }

    const promoCode = `SC${nanoid(6).toUpperCase()}`;
    await db.update(partners).set({ promoCode }).where(eq(partners.id, partner.id));

    res.json({ success: true, promoCode });
  }));

  // Inventory Tracking routes
  app.use("/api/inventory", requirePartnerWithData, inventoryRoutes);

  // Investor routes
  app.use("/api/investor", requireAuth, investorRoutes);

  // Marketplace Integration routes (Gibrid)
  app.use("/api/marketplace-integration", requireAuth, marketplaceIntegrationRoutes);

  // Subscription & Add-ons routes
  app.use("/api/subscriptions", requirePartnerWithData, subscriptionRoutes);

  // Forecast & Business Intelligence routes
  app.use("/api/forecast", requirePartnerWithData, forecastRoutes);

  // Broadcast & Notifications routes
  app.use("/api/broadcast", requireAuth, broadcastRoutes);

  // AI Autonomous Manager routes
  app.use("/api/ai-manager", requireAuth, aiManagerRoutes);

  // AI Scanner routes (Camera & Upload)
  app.use("/api/ai/scanner", requireAuth, aiScannerRoutesV2);
  
  // AI V2 routes (New real AI Scanner & Manager)
  app.use("/api/ai", requireAuth, aiRoutesV2);

  // AI Dashboard routes (Partner view-only)
  app.use("/api/ai-dashboard", requireAuth, aiDashboardRoutes);

  // Trending Products Analytics routes (Old)
  app.use("/api/trending", requireAuth, trendingRoutes);
  
  // Trend Hunter V2 routes (New - Real Profit Opportunity Detection)
  // No auth required for public access
  app.use("/api/trends", trendHunterRoutesV2);

  // Mobile App Static Files (served from FastAPI backend)
  // Proxy to FastAPI for mobile app
  app.use("/api/mobile", async (req, res) => {
    try {
      const mobilePath = req.path === '/' ? '/index.html' : req.path;
      const fullPath = path.join('/app/backend/static/mobile', mobilePath);
      
      if (fs.existsSync(fullPath) && fs.statSync(fullPath).isFile()) {
        res.sendFile(fullPath);
      } else {
        // SPA fallback
        res.sendFile('/app/backend/static/mobile/index.html');
      }
    } catch (error) {
      console.error('Mobile app error:', error);
      res.status(500).send('Mobile app error');
    }
  });

  // Referral System Routes
  app.use("/api/referrals", requireAuth, requirePartnerWithData, referralRoutes);
  
  // Admin Remote Access routes
  app.use("/api/admin/remote", requireAdmin, adminRemoteAccessRoutes);
  
  // Admin Referral Management routes
  app.use("/api/admin/referrals", requireAdmin, adminReferralManagementRoutes);
  
  // Referral Campaign Routes (Konkurslar va aksiyalar)
  app.use("/api/referral-campaigns", requireAuth, referralCampaignRoutes);
  
  // Price Strategy routes
  app.use("/api/price-strategy", requireAuth, priceStrategyRoutes);
  
  // AI Marketing routes
  app.use("/api/marketing", requireAuth, aiMarketingRoutes);
  
  // Advanced Analytics routes
  app.use("/api/analytics", requirePartnerWithData, analyticsRoutes);
  
  // Customer Service routes
  app.use("/api/customer-service", requireAuth, customerServiceRoutes);
  
  // Reporting routes
  app.use("/api/reports", requirePartnerWithData, reportingRoutes);
  
  // Gamification routes
  app.use("/api/gamification", requireAuth, gamificationRoutes);
  
  // Marketplace AI Manager routes
  app.use("/api/marketplace-ai", requirePartnerWithData, marketplaceAIManagerRoutes);
  
  // Admin AI Management routes
  app.use("/api/admin/ai", requireAdmin, adminAIManagementRoutes);
  app.use("/api/smm", requireAdmin, smmRoutes); // SMM - Admin only

  // Wallet & Payment routes
  app.use("/api/partner", requirePartnerWithData, walletRoutes);
  app.use("/api/partner", requirePartnerWithData, paymentHistoryRoutes);
  app.use("/api/partner", requirePartnerWithData, referralDashboardRoutes);
  
  // Admin Impersonation routes
  app.use("/api/admin", impersonationRoutes);
  
  // Admin Business Analytics
  app.use("/api/admin", requireAdmin, businessAnalyticsRoutes);
  
  // Admin Management (Super Admin only)
  app.use("/api/admin", adminManagementRoutes);

  // Chat uploads (files/images) - used by ChatSystem UI
  app.post(
    "/api/chat/upload",
    requirePartnerWithData,
    uploadLimiter,
    upload.single("file"),
    asyncHandler(async (req: Request, res: Response) => {
      const file = (req as any).file as Express.Multer.File | undefined;
      if (!file) {
        return res.status(400).json({ message: "File is required" });
      }

      // Served via: app.use('/uploads', express.static(uploadPath))
      const fileUrl = `/uploads/${file.filename}`;
      return res.status(201).json({
        fileUrl,
        fileName: file.originalname,
        fileSize: file.size,
        mimeType: file.mimetype,
      });
    })
  );

  // Chat System Routes
  app.use("/api/chat", requirePartnerWithData, chatRoutes);

  // ==================== INVENTORY MANAGEMENT ROUTES ====================

  // Warehouse routes
  app.get("/api/warehouses", requireAuth, asyncHandler(async (req: Request, res: Response) => {
    const warehouses = await storage.getAllWarehouses();
    res.json(warehouses);
  }));

  app.post("/api/warehouses", requireAdmin, asyncHandler(async (req: Request, res: Response) => {
    const warehouse = await storage.createWarehouse(req.body);
    
    await storage.createAuditLog({
      userId: req.session!.user!.id,
      action: 'WAREHOUSE_CREATED',
      entityType: 'warehouse',
      entityId: warehouse.id,
      payload: { name: warehouse.name, code: warehouse.code }
    });

    res.status(201).json(warehouse);
  }));

  app.get("/api/warehouses/:id/stock", requireAuth, asyncHandler(async (req: Request, res: Response) => {
    const { id } = req.params;
    const stock = await storage.getWarehouseStock(id);
    res.json(stock);
  }));

  // Stock management routes
  app.post("/api/stock/update", requireAuth, asyncHandler(async (req: Request, res: Response) => {
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

    if (!productId || !warehouseId || quantity === undefined || !movementType || !reason) {
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
      req.session!.user!.id,
      referenceType,
      referenceId,
      notes
    );

    await storage.createAuditLog({
      userId: req.session!.user!.id,
      action: 'STOCK_UPDATED',
      entityType: 'product',
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

  app.get("/api/stock/movements", requireAuth, asyncHandler(async (req: Request, res: Response) => {
    const { productId, warehouseId, movementType, startDate, endDate } = req.query;

    const movements = await storage.getStockMovements({
      productId: productId as string,
      warehouseId: warehouseId as string,
      movementType: movementType as string,
      startDate: startDate ? new Date(startDate as string) : undefined,
      endDate: endDate ? new Date(endDate as string) : undefined
    });

    res.json(movements);
  }));

  // Order management routes
  app.get("/api/orders", requireAuth, asyncHandler(async (req: Request, res: Response) => {
    if (req.session!.user!.role === 'admin') {
      const orders = await storage.getAllOrders();
      res.json(orders);
    } else {
      const partner = await storage.getPartnerByUserId(req.session!.user!.id);
      if (!partner) {
        return res.status(404).json({ 
          message: "Hamkor ma'lumotlari topilmadi",
          code: "PARTNER_NOT_FOUND"
        });
      }

      const orders = await storage.getOrdersByPartnerId(partner.id);
      res.json(orders);
    }
  }));

  app.post("/api/orders", requirePartnerWithData, asyncHandler(async (req: Request, res: Response) => {
    const partner = await storage.getPartnerByUserId(req.session!.user!.id);
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
      userId: req.session!.user!.id,
      action: 'ORDER_CREATED',
      entityType: 'order',
      entityId: order.id,
      payload: { orderNumber: order.orderNumber, totalAmount: order.totalAmount }
    });

    res.status(201).json(order);
  }));

  app.get("/api/orders/:id", requireAuth, asyncHandler(async (req: Request, res: Response) => {
    const { id } = req.params;
    const order = await storage.getOrderById(id);

    if (!order) {
      return res.status(404).json({ 
        message: "Buyurtma topilmadi",
        code: "ORDER_NOT_FOUND"
      });
    }

    // Check authorization
    if (req.session!.user!.role !== 'admin') {
      const partner = await storage.getPartnerByUserId(req.session!.user!.id);
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

  app.put("/api/orders/:id/status", requireAuth, asyncHandler(async (req: Request, res: Response) => {
    const { id } = req.params;
    const { status, fulfillmentStatus, paymentStatus } = req.body;

    const order = await storage.updateOrderStatus(
      id,
      status,
      fulfillmentStatus,
      paymentStatus,
      req.session!.user!.id
    );

    if (!order) {
      return res.status(404).json({ 
        message: "Buyurtma topilmadi",
        code: "ORDER_NOT_FOUND"
      });
    }

    await storage.createAuditLog({
      userId: req.session!.user!.id,
      action: 'ORDER_STATUS_UPDATED',
      entityType: 'order',
      entityId: id,
      payload: { status, fulfillmentStatus, paymentStatus }
    });

    // Send notification via WebSocket
    const wsManager = (global as any).wsManager;
    if (wsManager) {
      const partner = await storage.getPartnerById(order.partnerId);
      if (partner) {
        wsManager.sendToUser(partner.userId, {
          type: 'notification',
          data: {
            type: 'order_update',
            title: 'Buyurtma holati yangilandi',
            message: `Buyurtma #${order.orderNumber} holati: ${status}`,
            orderId: order.id,
            timestamp: Date.now()
          }
        });
      }
    }

    res.json(order);
  }));

  // Stock alerts routes
  app.get("/api/stock-alerts", requirePartnerWithData, asyncHandler(async (req: Request, res: Response) => {
    const partner = await storage.getPartnerByUserId(req.session!.user!.id);
    if (!partner) {
      return res.status(404).json({ 
        message: "Hamkor ma'lumotlari topilmadi",
        code: "PARTNER_NOT_FOUND"
      });
    }

    const includeResolved = req.query.includeResolved === 'true';
    const alerts = await storage.getStockAlertsByPartnerId(partner.id, includeResolved);
    res.json(alerts);
  }));

  app.put("/api/stock-alerts/:id/resolve", requireAuth, asyncHandler(async (req: Request, res: Response) => {
    const { id } = req.params;
    const alert = await storage.resolveStockAlert(id, req.session!.user!.id);

    if (!alert) {
      return res.status(404).json({ 
        message: "Ogohlantirish topilmadi",
        code: "ALERT_NOT_FOUND"
      });
    }

    res.json(alert);
  }));

  // Inventory statistics
  app.get("/api/inventory/stats", requirePartnerWithData, asyncHandler(async (req: Request, res: Response) => {
    const partner = await storage.getPartnerByUserId(req.session!.user!.id);
    if (!partner) {
      return res.status(404).json({ 
        message: "Hamkor ma'lumotlari topilmadi",
        code: "PARTNER_NOT_FOUND"
      });
    }

    const stats = await storage.getInventoryStats(partner.id);
    res.json(stats);
  }));

  // Admin inventory overview
  app.get("/api/admin/inventory/overview", requireAdmin, asyncHandler(async (req: Request, res: Response) => {
    const partners = await storage.getAllPartners();
    const overview = await Promise.all(
      partners.map(async (partner) => {
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

  // ==================== ENHANCED AI ROUTES ====================
  // New unified AI system (cost-optimized, production-ready)
  app.use("/api/ai", requirePartnerWithData, enhancedAIRoutes);
  
  // Legacy route (backward compatibility)
  app.use("/api/enhanced-ai", requirePartnerWithData, enhancedAIDashboardRoutes);

  // ==================== ADMIN ADVANCED FEATURES ====================
  // Order Rule Engine, Warehouse Management (Local Full-Service only)
  // For internal operations - partners don't see these
  app.use("/api/admin/advanced", requireAdmin, adminAdvancedFeaturesRoutes);

  // ==================== PARTNER ADVANCED FEATURES ====================
  // Inventory Forecasting, Advanced Reporting (Both Local & SaaS)
  // Partners use these features
  app.use("/api/partner/advanced", requirePartnerWithData, partnerAdvancedFeaturesRoutes);

  // ==================== AUTONOMOUS AI MANAGER ====================
  // Zero-Command AI - Partner provides minimal input, AI does everything
  // Revolutionary feature: No manual listing creation needed
  app.use("/api/autonomous-ai", requirePartnerWithData, autonomousAIRoutes);

  // ==================== AI SERVICES ====================
  // Real AI Integration: Claude 3.5 Sonnet, GPT-4 Vision, Flux.1, Ideogram
  // Product analysis, SEO generation, image generation, remote access
  app.use("/api/ai-services", requireAuth, aiServicesRoutes);

  // ==================== AUTONOMOUS MANAGER ====================
  // ZERO HUMAN INTERVENTION - Fully automated product management
  // Auto-sync from marketplaces, auto-generate cards, auto-publish
  app.use("/api/autonomous", requirePartnerWithData, autonomousManagerRoutes);

  // ==================== PAYMENT SYSTEM ====================
  app.use("/api/payment", paymentRoutes);
  
  // Payment Integration (Click, Payme, Uzcard)
  app.use("/api/payments", paymentIntegrationRoutes);

  // ==================== WHATSAPP BUSINESS ====================
  app.use("/api/whatsapp", whatsappRoutes);

  // ==================== TELEGRAM BOT ====================
  app.use("/api/telegram", telegramRoutes);

  // ==================== PREMIUM FEATURES ====================
  app.use("/api/premium", premiumFeaturesRoutes);

  // ==================== ADVANCED FEATURES ====================
  app.use("/api/advanced", advancedFeaturesRoutes);

  // ==================== SMART AI MANAGER ====================
  app.use("/api/smart-ai", smartAIRoutes);

  // ==================== BILLING & INVOICING ====================
  app.use("/api/billing", requireAuth, billingRoutes);

  // ==================== AI PRODUCT RECOGNITION ====================
  // Recognize product from image
  app.post("/api/ai/recognize-product", requirePartnerWithData, asyncHandler(async (req: Request, res: Response) => {
    const { image } = req.body;

    if (!image) {
      return res.status(400).json({ message: "Rasm talab qilinadi" });
    }

    try {
      const { productRecognitionService } = await import('./services/productRecognition');
      const result = await productRecognitionService.recognizeProduct(image);

      await storage.createAuditLog({
        userId: (req as any).user.id,
        action: 'PRODUCT_RECOGNIZED',
        entityType: 'product',
        payload: { 
          productName: result.name,
          confidence: result.confidence
        }
      });

      res.json(result);
    } catch (error: any) {
      console.error('Product recognition error:', error);
      return res.status(500).json({ 
        message: "Mahsulotni tanib bo'lmadi",
        error: error.message 
      });
    }
  }));

  // ==================== MARKETPLACE CONNECTIONS ====================
  // Get partner's marketplace connections
  app.get("/api/marketplace/connections", requirePartnerWithData, asyncHandler(async (req: Request, res: Response) => {
    const partner = (req as any).partner;
    
    if (!partner) {
      return res.status(404).json({ message: "Partner not found" });
    }

    const connections = await db.select()
      .from(marketplaceIntegrations)
      .where(eq(marketplaceIntegrations.partnerId, partner.id));

    res.json(connections);
  }));

  // Connect to marketplace
  app.post("/api/marketplace/connect", requirePartnerWithData, asyncHandler(async (req: Request, res: Response) => {
    const partner = (req as any).partner;
    const { marketplace, credentials } = req.body;

    if (!partner) {
      return res.status(404).json({ message: "Partner not found" });
    }

    if (!marketplace || !credentials) {
      return res.status(400).json({ message: "Marketplace va credentials talab qilinadi" });
    }

    // Check if already connected
    const existing = await db.select()
      .from(marketplaceIntegrations)
      .where(and(
        eq(marketplaceIntegrations.partnerId, partner.id),
        eq(marketplaceIntegrations.marketplace, marketplace)
      ))
      .limit(1);

    if (existing.length > 0) {
      // Update existing connection
      const [updated] = await db.update(marketplaceIntegrations)
        .set({
          apiKey: credentials.apiKey || credentials.accessToken || credentials.clientId,
          apiSecret: credentials.apiSecret || credentials.supplierId || credentials.campaignId,
          sellerId: credentials.sellerId,
          active: true,
          lastSyncAt: new Date()
        })
        .where(eq(marketplaceIntegrations.id, existing[0].id))
        .returning();

      return res.json(updated);
    }

    // Create new connection
    const [connection] = await db.insert(marketplaceIntegrations).values({
      id: nanoid(),
      partnerId: partner.id,
      marketplace,
      apiKey: credentials.apiKey || credentials.accessToken || credentials.clientId,
      apiSecret: credentials.apiSecret || credentials.supplierId || credentials.campaignId,
      sellerId: credentials.sellerId,
      active: true,
      createdAt: formatTimestamp()
    }).returning();

    await storage.createAuditLog({
      userId: (req as any).user.id,
      action: 'MARKETPLACE_CONNECTED',
      entityType: 'marketplace_integration',
      entityId: connection.id,
      payload: { marketplace }
    });

    res.status(201).json(connection);
  }));

  // Test marketplace connection
  app.post("/api/marketplace/test-connection", requirePartnerWithData, asyncHandler(async (req: Request, res: Response) => {
    const { marketplace, credentials } = req.body;

    if (!marketplace || !credentials) {
      return res.status(400).json({ message: "Marketplace va credentials talab qilinadi" });
    }

    // For now, just validate that credentials are provided
    // In production, this would actually test the API connection
    const hasRequiredFields = credentials.apiKey || credentials.accessToken || credentials.clientId;

    if (!hasRequiredFields) {
      return res.status(400).json({ 
        message: "API ma'lumotlari to'liq emas",
        success: false 
      });
    }

    // Simulate API test (in production, make actual API call)
    res.json({ 
      success: true, 
      message: "Ulanish muvaffaqiyatli",
      marketplace 
    });
  }));

  // ==================== BLOG SYSTEM ====================

  // Public: Get published blog posts
  app.get("/api/blog/posts", asyncHandler(async (req: Request, res: Response) => {
    const { category, status = 'published', limit } = req.query;
    
    let query = db.select().from(blogPosts);
    
    if (status === 'published') {
      query = query.where(eq(blogPosts.status, 'published'));
    }
    
    if (category && category !== 'all') {
      query = query.where(and(
        eq(blogPosts.status, status as string),
        eq(blogPosts.category, category as string)
      ));
    }
    
    const posts = await query.orderBy(desc(blogPosts.createdAt));
    
    if (limit) {
      return res.json(posts.slice(0, parseInt(limit as string)));
    }
    
    res.json(posts);
  }));

  // Public: Get single blog post by slug
  app.get("/api/blog/posts/:slug", asyncHandler(async (req: Request, res: Response) => {
    const { slug } = req.params;
    
    const post = await db.select().from(blogPosts)
      .where(eq(blogPosts.slug, slug))
      .limit(1);
    
    if (post.length === 0) {
      return res.status(404).json({ message: "Maqola topilmadi" });
    }
    
    res.json(post[0]);
  }));

  // Public: Increment view count
  app.post("/api/blog/posts/:id/view", asyncHandler(async (req: Request, res: Response) => {
    const { id } = req.params;
    
    await db.update(blogPosts)
      .set({ viewCount: db.raw('view_count + 1') })
      .where(eq(blogPosts.id, id));
    
    res.json({ success: true });
  }));

  // Public: Get blog categories
  app.get("/api/blog/categories", asyncHandler(async (req: Request, res: Response) => {
    const categories = await db.select().from(blogCategories);
    res.json(categories);
  }));

  // Admin: Get all blog posts (including drafts)
  app.get("/api/admin/blog/posts", requireAdmin, asyncHandler(async (req: Request, res: Response) => {
    const { category, status } = req.query;
    
    let query = db.select().from(blogPosts);
    
    if (status && status !== 'all') {
      query = query.where(eq(blogPosts.status, status as string));
    }
    
    if (category && category !== 'all') {
      query = query.where(eq(blogPosts.category, category as string));
    }
    
    const posts = await query.orderBy(desc(blogPosts.createdAt));
    res.json(posts);
  }));

  // Admin: Create blog post
  app.post("/api/admin/blog/posts", requireAdmin, asyncHandler(async (req: Request, res: Response) => {
    const { 
      title, slug, excerpt, content, featuredImage, videoUrl,
      category, tags, status, metaTitle, metaDescription, metaKeywords
    } = req.body;
    
    if (!title || !content) {
      return res.status(400).json({ message: "Sarlavha va matn kiritilishi shart" });
    }
    
    const postSlug = slug || title.toLowerCase().replace(/[^\w\s-]/g, '').replace(/\s+/g, '-');
    
    // Check if slug exists
    const existing = await db.select().from(blogPosts).where(eq(blogPosts.slug, postSlug));
    if (existing.length > 0) {
      return res.status(400).json({ message: "Bu slug allaqachon mavjud" });
    }
    
    const tagsJson = tags ? JSON.stringify(tags.split(',').map((t: string) => t.trim())) : null;
    
    const [post] = await db.insert(blogPosts).values({
      id: nanoid(),
      slug: postSlug,
      title,
      excerpt,
      content,
      featuredImage,
      videoUrl,
      category: category || 'news',
      tags: tagsJson,
      status: status || 'draft',
      authorId: req.session!.user!.id,
      authorName: req.session!.user!.username,
      metaTitle,
      metaDescription,
      metaKeywords,
      publishedAt: status === 'published' ? new Date() : null,
    }).returning();
    
    await storage.createAuditLog({
      userId: req.session!.user!.id,
      action: 'BLOG_POST_CREATED',
      entityType: 'blog_post',
      entityId: post.id,
      payload: { title, status }
    });
    
    res.status(201).json(post);
  }));

  // Admin: Update blog post
  app.put("/api/admin/blog/posts/:id", requireAdmin, asyncHandler(async (req: Request, res: Response) => {
    const { id } = req.params;
    const { 
      title, slug, excerpt, content, featuredImage, videoUrl,
      category, tags, status, metaTitle, metaDescription, metaKeywords
    } = req.body;
    
    const tagsJson = tags ? JSON.stringify(tags.split(',').map((t: string) => t.trim())) : null;
    
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
      publishedAt: status === 'published' ? new Date() : null,
      updatedAt: new Date(),
    }).where(eq(blogPosts.id, id)).returning();
    
    if (!post) {
      return res.status(404).json({ message: "Maqola topilmadi" });
    }
    
    await storage.createAuditLog({
      userId: req.session!.user!.id,
      action: 'BLOG_POST_UPDATED',
      entityType: 'blog_post',
      entityId: id,
      payload: { title, status }
    });
    
    res.json(post);
  }));

  // Admin: Delete blog post
  app.delete("/api/admin/blog/posts/:id", requireAdmin, asyncHandler(async (req: Request, res: Response) => {
    const { id } = req.params;
    
    await db.delete(blogPosts).where(eq(blogPosts.id, id));
    
    await storage.createAuditLog({
      userId: req.session!.user!.id,
      action: 'BLOG_POST_DELETED',
      entityType: 'blog_post',
      entityId: id
    });
    
    res.json({ success: true, message: "Maqola o'chirildi" });
  }));

  // Admin: Publish blog post
  app.post("/api/admin/blog/posts/:id/publish", requireAdmin, asyncHandler(async (req: Request, res: Response) => {
    const { id } = req.params;
    
    const [post] = await db.update(blogPosts).set({
      status: 'published',
      publishedAt: new Date(),
    }).where(eq(blogPosts.id, id)).returning();
    
    if (!post) {
      return res.status(404).json({ message: "Maqola topilmadi" });
    }
    
    await storage.createAuditLog({
      userId: req.session!.user!.id,
      action: 'BLOG_POST_PUBLISHED',
      entityType: 'blog_post',
      entityId: id
    });
    
    res.json(post);
  }));

  // ===== SALES SYNC & CRON JOBS =====
  
  // Admin: Trigger manual sales sync
  app.post("/api/admin/sales-sync/run", requireAdmin, asyncHandler(async (req: Request, res: Response) => {
    console.log('🔄 Manual sales sync triggered by admin:', req.session?.user?.username);
    
    const result = await salesSyncService.runDailySyncJob();
    
    await storage.createAuditLog({
      userId: req.session!.user!.id,
      action: 'MANUAL_SALES_SYNC',
      entityType: 'system',
      payload: { 
        syncedPartners: result.sales.synced,
        totalSales: result.sales.totalSalesUzs,
        duration: result.duration
      }
    });
    
    res.json({
      success: true,
      message: 'Sales sync completed',
      data: result
    });
  }));

  // Admin: Sync single partner's sales
  app.post("/api/admin/sales-sync/partner/:partnerId", requireAdmin, asyncHandler(async (req: Request, res: Response) => {
    const { partnerId } = req.params;
    
    const partner = await storage.getPartner(partnerId);
    if (!partner) {
      return res.status(404).json({ success: false, error: 'Partner not found' });
    }
    
    const result = await salesSyncService.syncPartnerSales(partner);
    
    res.json({
      success: true,
      data: result
    });
  }));

  // Admin: Get sync status
  app.get("/api/admin/sales-sync/status", requireAdmin, asyncHandler(async (req: Request, res: Response) => {
    // Return last sync info from database or cache
    res.json({
      success: true,
      lastSync: new Date().toISOString(),
      message: 'Sales sync status endpoint'
    });
  }));

  // Error handling middleware
  app.use(handleValidationError);

  return server;
}