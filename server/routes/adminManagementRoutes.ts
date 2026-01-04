import express, { Request, Response } from 'express';
import { db } from '../db';
import { users } from '@shared/schema';
import { eq, and } from 'drizzle-orm';
import bcrypt from 'bcryptjs';
import { nanoid } from 'nanoid';
import { asyncHandler } from '../errorHandler';

const router = express.Router();

// Helper to require admin
function requireAdmin(req: Request, res: Response, next: () => void) {
  const user = (req as any).user;
  if (!user || user.role !== 'admin') {
    return res.status(403).json({ message: 'Admin huquqi talab qilinadi' });
  }
  next();
}

// Get all admins
router.get('/admins', requireAdmin, asyncHandler(async (req: Request, res: Response) => {
  const admins = await db
    .select({
      id: users.id,
      username: users.username,
      email: users.email,
      firstName: users.firstName,
      lastName: users.lastName,
      role: users.role,
      roleId: users.role, // Using role as roleId for now
      isActive: users.isActive,
      lastLoginAt: null, // TODO: Add lastLoginAt to schema
      createdAt: users.createdAt,
    })
    .from(users)
    .where(eq(users.role, 'admin'));

  res.json(admins);
}));

// Get roles (simplified - can be expanded)
router.get('/roles', requireAdmin, asyncHandler(async (req: Request, res: Response) => {
  const roles = [
    {
      id: 'super_admin',
      name: 'super_admin',
      displayName: 'Super Admin',
      description: 'To\'liq boshqaruv huquqi',
    },
    {
      id: 'support_admin',
      name: 'support_admin',
      displayName: 'Support Admin',
      description: 'Support va mijozlar bilan ishlash',
    },
    {
      id: 'finance_admin',
      name: 'finance_admin',
      displayName: 'Finance Admin',
      description: 'Moliyaviy operatsiyalar',
    },
    {
      id: 'content_admin',
      name: 'content_admin',
      displayName: 'Content Admin',
      description: 'Kontent va mahsulotlar boshqaruvi',
    },
    {
      id: 'analytics_admin',
      name: 'analytics_admin',
      displayName: 'Analytics Admin',
      description: 'Statistika va tahlil',
    },
  ];

  res.json(roles);
}));

// Get role permissions
router.get('/roles/:roleId/permissions', requireAdmin, asyncHandler(async (req: Request, res: Response) => {
  const { roleId } = req.params;
  
  // Simplified permissions - can be expanded with actual permission system
  const permissions: Record<string, string[]> = {
    super_admin: ['*'],
    support_admin: ['read:partners', 'update:partners', 'read:chat', 'update:chat'],
    finance_admin: ['read:payments', 'update:payments', 'read:invoices', 'create:invoices'],
    content_admin: ['read:products', 'update:products', 'read:orders', 'update:orders'],
    analytics_admin: ['read:analytics', 'read:reports', 'export:data'],
  };

  const rolePermissions = permissions[roleId] || [];
  
  res.json(
    rolePermissions.map(perm => {
      const [action, resource] = perm.split(':');
      return {
        resource: resource || '*',
        actions: action === '*' ? ['*'] : [action],
      };
    })
  );
}));

// Create admin
router.post('/admins', requireAdmin, asyncHandler(async (req: Request, res: Response) => {
  const { username, email, password, firstName, lastName, roleId } = req.body;

  if (!username || !email || !password || !roleId) {
    return res.status(400).json({ message: 'Barcha maydonlar to\'ldirilishi kerak' });
  }

  // Check if user exists
  const existingUser = await db
    .select()
    .from(users)
    .where(eq(users.username, username))
    .limit(1);

  if (existingUser.length > 0) {
    return res.status(400).json({ message: 'Bu username allaqachon mavjud' });
  }

  // Hash password
  const hashedPassword = await bcrypt.hash(password, 10);

  // Create admin user
  const adminId = nanoid();
  await db.insert(users).values({
    id: adminId,
    username,
    email,
    password: hashedPassword,
    firstName: firstName || null,
    lastName: lastName || null,
    role: roleId, // Using roleId as role
    isActive: true,
    createdAt: new Date(),
    updatedAt: new Date(),
  });

  // Log activity (TODO: Implement activity logging)
  
  res.json({ 
    id: adminId,
    username,
    email,
    role: roleId,
    message: 'Admin muvaffaqiyatli yaratildi' 
  });
}));

// Update admin status
router.put('/admins/:adminId/status', requireAdmin, asyncHandler(async (req: Request, res: Response) => {
  const { adminId } = req.params;
  const { isActive } = req.body;

  const user = (req as any).user;
  if (user.id === adminId) {
    return res.status(400).json({ message: 'O\'zingizni statusini o\'zgartira olmaysiz' });
  }

  await db
    .update(users)
    .set({ 
      isActive: Boolean(isActive),
      updatedAt: new Date(),
    })
    .where(eq(users.id, adminId));

  // Log activity
  
  res.json({ message: 'Status o\'zgartirildi' });
}));

// Update admin role
router.put('/admins/:adminId/role', requireAdmin, asyncHandler(async (req: Request, res: Response) => {
  const { adminId } = req.params;
  const { roleId } = req.body;

  const user = (req as any).user;
  if (user.id === adminId && user.role !== 'super_admin') {
    return res.status(400).json({ message: 'O\'zingizni role\'ini o\'zgartira olmaysiz' });
  }

  await db
    .update(users)
    .set({ 
      role: roleId,
      updatedAt: new Date(),
    })
    .where(eq(users.id, adminId));

  // Log activity
  
  res.json({ message: 'Role o\'zgartirildi' });
}));

// Delete admin
router.delete('/admins/:adminId', requireAdmin, asyncHandler(async (req: Request, res: Response) => {
  const { adminId } = req.params;

  const user = (req as any).user;
  if (user.id === adminId) {
    return res.status(400).json({ message: 'O\'zingizni o\'chira olmaysiz' });
  }

  // Check if super admin
  const admin = await db
    .select()
    .from(users)
    .where(eq(users.id, adminId))
    .limit(1);

  if (admin.length === 0) {
    return res.status(404).json({ message: 'Admin topilmadi' });
  }

  if (admin[0].role === 'super_admin') {
    return res.status(400).json({ message: 'Super Admin\'ni o\'chirib bo\'lmaydi' });
  }

  await db.delete(users).where(eq(users.id, adminId));

  // Log activity
  
  res.json({ message: 'Admin o\'chirildi' });
}));

// Get activity logs (simplified - can be expanded with actual logging system)
router.get('/activity-logs', requireAdmin, asyncHandler(async (req: Request, res: Response) => {
  const { adminId, resourceType, limit = '100' } = req.query;

  // TODO: Implement actual activity logging
  // For now, return empty array
  res.json([]);
}));

export default router;

