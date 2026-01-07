import { Router, Request, Response } from 'express';
import { requireAdmin } from '../middleware/auth';
import { asyncHandler } from '../errorHandler';
import { db } from '../db';
import { users, adminPermissions } from '@shared/schema';
import { eq, and } from 'drizzle-orm';
import { nanoid } from 'nanoid';
import bcrypt from 'bcryptjs';

const router = Router();

// Middleware to check if user is super admin
const requireSuperAdmin = (req: Request, res: Response, next: Function) => {
  const user = req.session?.user;
  if (!user || user.role !== 'admin') {
    return res.status(403).json({ message: 'Super Admin huquqi talab qilinadi' });
  }
  
  // Check if user is super admin (username 'Medik' or has superadmin flag)
  // In production, you'd check a database field
  const isSuperAdmin = user.username === 'Medik' || user.username === 'admin';
  
  if (!isSuperAdmin) {
    return res.status(403).json({ message: 'Faqat Super Admin ruxsat berilgan' });
  }
  
  next();
};

// Get all admins
router.get('/admins', requireSuperAdmin, asyncHandler(async (req: Request, res: Response) => {
  console.log('📋 Getting all admins...');

  // Get all admin users
  const allAdmins = await db
    .select()
    .from(users)
    .where(eq(users.role, 'admin'));

  // Get permissions for each admin
  const adminsWithPermissions = await Promise.all(
    allAdmins.map(async (admin) => {
      const perms = await db
        .select()
        .from(adminPermissions)
        .where(eq(adminPermissions.adminId, admin.id));

      const permissionsMap: Record<string, boolean> = {};
      perms.forEach(p => {
        permissionsMap[p.permissionKey] = p.permissionValue;
      });

      // Super admin detection
      const isSuperAdmin = admin.username === 'Medik' || admin.username === 'admin';

      return {
        id: admin.id,
        username: admin.username,
        email: admin.email,
        role: admin.role,
        isSuperAdmin,
        isActive: admin.isActive,
        permissions: permissionsMap,
        createdAt: admin.createdAt,
      };
    })
  );

  res.json({ admins: adminsWithPermissions });
}));

// Create new admin
router.post('/admins', requireSuperAdmin, asyncHandler(async (req: Request, res: Response) => {
  const { username, email, password, isSuperAdmin, permissions } = req.body;

  console.log('➕ Creating new admin:', { username, email, isSuperAdmin });

  // Validate
  if (!username || !password) {
    return res.status(400).json({ message: 'Username va parol talab qilinadi' });
  }

  // Check if username exists
  const existing = await db
    .select()
    .from(users)
    .where(eq(users.username, username))
    .limit(1);

  if (existing.length > 0) {
    return res.status(400).json({ message: 'Bu username allaqachon mavjud' });
  }

  // Hash password
  const hashedPassword = await bcrypt.hash(password, 10);

  // Create admin user
  const newAdminId = nanoid();
  await db.insert(users).values({
    id: newAdminId,
    username,
    email: email || `${username}@sellercloudx.com`,
    password: hashedPassword,
    role: 'admin',
    isActive: true,
    createdAt: new Date().toISOString(),
  });

  // Set permissions (if not super admin)
  if (!isSuperAdmin && permissions) {
    const permissionEntries = Object.entries(permissions).map(([key, value]) => ({
      id: nanoid(),
      adminId: newAdminId,
      permissionKey: key,
      permissionValue: value as boolean,
      createdAt: new Date().toISOString(),
    }));

    if (permissionEntries.length > 0) {
      await db.insert(adminPermissions).values(permissionEntries);
    }
  }

  console.log('✅ Admin created:', newAdminId);

  res.json({
    message: 'Admin yaratildi',
    admin: {
      id: newAdminId,
      username,
      email: email || `${username}@sellercloudx.com`,
    },
  });
}));

// Update admin permissions
router.patch('/admins/:adminId/permissions', requireSuperAdmin, asyncHandler(async (req: Request, res: Response) => {
  const { adminId } = req.params;
  const { permissions } = req.body;

  console.log('🔧 Updating permissions for admin:', adminId);

  // Delete old permissions
  await db.delete(adminPermissions).where(eq(adminPermissions.adminId, adminId));

  // Insert new permissions
  const permissionEntries = Object.entries(permissions).map(([key, value]) => ({
    id: nanoid(),
    adminId,
    permissionKey: key,
    permissionValue: value as boolean,
    createdAt: new Date().toISOString(),
  }));

  if (permissionEntries.length > 0) {
    await db.insert(adminPermissions).values(permissionEntries);
  }

  res.json({ message: 'Ruxsatlar yangilandi' });
}));

// Toggle admin status
router.patch('/admins/:adminId/toggle-status', requireSuperAdmin, asyncHandler(async (req: Request, res: Response) => {
  const { adminId } = req.params;

  const [admin] = await db
    .select()
    .from(users)
    .where(eq(users.id, adminId))
    .limit(1);

  if (!admin) {
    return res.status(404).json({ message: 'Admin topilmadi' });
  }

  // Toggle status
  await db
    .update(users)
    .set({ isActive: !admin.isActive })
    .where(eq(users.id, adminId));

  res.json({ message: 'Status o\'zgartirildi', isActive: !admin.isActive });
}));

// Delete admin
router.delete('/admins/:adminId', requireSuperAdmin, asyncHandler(async (req: Request, res: Response) => {
  const { adminId } = req.params;

  // Don't allow deleting super admin
  const [admin] = await db
    .select()
    .from(users)
    .where(eq(users.id, adminId))
    .limit(1);

  if (!admin) {
    return res.status(404).json({ message: 'Admin topilmadi' });
  }

  if (admin.username === 'Medik' || admin.username === 'admin') {
    return res.status(400).json({ message: 'Super Admin\'ni o\'chirib bo\'lmaydi' });
  }

  // Delete permissions first
  await db.delete(adminPermissions).where(eq(adminPermissions.adminId, adminId));

  // Delete admin
  await db.delete(users).where(eq(users.id, adminId));

  res.json({ message: 'Admin o\'chirildi' });
}));

export default router;
