import { Router, Request, Response } from 'express';
import { requireAdmin } from '../middleware/auth';
import { asyncHandler } from '../errorHandler';
import { db, getDbType } from '../db';
import { partners, users, impersonationLogs } from '@shared/schema';
import { eq } from 'drizzle-orm';
import { nanoid } from 'nanoid';

// Universal timestamp formatter
function formatTimestamp(): any {
  const dbType = getDbType();
  return dbType === 'sqlite' ? Math.floor(Date.now() / 1000) : new Date();
}

const router = Router();

// Start impersonation - Admin becomes partner
router.post('/impersonate/:partnerId', requireAdmin, asyncHandler(async (req: Request, res: Response) => {
  const adminId = req.session.user!.id;
  const { partnerId } = req.params;

  console.log('🎭 Impersonation request:', { adminId, partnerId });

  // Get partner data
  const [partner] = await db
    .select()
    .from(partners)
    .where(eq(partners.id, partnerId))
    .limit(1);

  if (!partner) {
    return res.status(404).json({ message: 'Hamkor topilmadi' });
  }

  // Get partner user data
  const [partnerUser] = await db
    .select()
    .from(users)
    .where(eq(users.id, partner.userId))
    .limit(1);

  if (!partnerUser) {
    return res.status(404).json({ message: 'Foydalanuvchi topilmadi' });
  }

  // Store original admin session
  const originalAdminData = {
    id: req.session.user!.id,
    username: req.session.user!.username,
    email: req.session.user!.email,
    role: req.session.user!.role,
  };

  // Save to session for later restoration
  (req.session as any).impersonating = {
    originalAdmin: originalAdminData,
    targetPartner: {
      id: partner.id,
      userId: partner.userId,
    },
    startedAt: new Date().toISOString(),
  };

  // Change session user to partner
  req.session.user = {
    id: partnerUser.id,
    username: partnerUser.username,
    email: partnerUser.email || undefined,
    firstName: partnerUser.firstName || undefined,
    lastName: partnerUser.lastName || undefined,
    role: 'partner',
  };

  // Log the impersonation
  await db.insert(impersonationLogs).values({
    id: nanoid(),
    adminId,
    partnerId: partner.id,
    action: 'start',
    ipAddress: req.ip,
    userAgent: req.headers['user-agent'],
    notes: `Admin ${originalAdminData.username} impersonated partner ${partnerUser.username}`,
    createdAt: formatTimestamp().toISOString(),
  });

  // Save session
  await new Promise<void>((resolve, reject) => {
    req.session.save((err) => {
      if (err) reject(err);
      else resolve();
    });
  });

  console.log('✅ Impersonation started:', {
    admin: originalAdminData.username,
    partner: partnerUser.username,
  });

  res.json({
    message: 'Impersonation boshlandi',
    partnerData: {
      id: partner.id,
      userId: partnerUser.id,
      username: partnerUser.username,
      businessName: partner.businessName,
    },
    impersonating: true,
  });
}));

// Exit impersonation - Return to admin
router.post('/exit-impersonate', asyncHandler(async (req: Request, res: Response) => {
  const impersonationData = (req.session as any).impersonating;

  if (!impersonationData) {
    return res.status(400).json({ message: 'Impersonation faol emas' });
  }

  console.log('🎭 Exiting impersonation:', impersonationData);

  // Restore original admin session
  req.session.user = {
    id: impersonationData.originalAdmin.id,
    username: impersonationData.originalAdmin.username,
    email: impersonationData.originalAdmin.email,
    role: impersonationData.originalAdmin.role,
  };

  // Log the exit
  await db.insert(impersonationLogs).values({
    id: nanoid(),
    adminId: impersonationData.originalAdmin.id,
    partnerId: impersonationData.targetPartner.id,
    action: 'end',
    ipAddress: req.ip,
    userAgent: req.headers['user-agent'],
    notes: `Admin ${impersonationData.originalAdmin.username} exited impersonation`,
    createdAt: formatTimestamp().toISOString(),
  });

  // Clear impersonation data
  delete (req.session as any).impersonating;

  // Save session
  await new Promise<void>((resolve, reject) => {
    req.session.save((err) => {
      if (err) reject(err);
      else resolve();
    });
  });

  console.log('✅ Impersonation ended, restored to admin');

  res.json({
    message: 'Admin holatga qaytdingiz',
    impersonating: false,
  });
}));

// Check impersonation status
router.get('/impersonate/status', asyncHandler(async (req: Request, res: Response) => {
  const impersonationData = (req.session as any).impersonating;

  if (!impersonationData) {
    return res.json({ impersonating: false });
  }

  res.json({
    impersonating: true,
    originalAdmin: impersonationData.originalAdmin,
    targetPartner: impersonationData.targetPartner,
    startedAt: impersonationData.startedAt,
  });
}));

export default router;
