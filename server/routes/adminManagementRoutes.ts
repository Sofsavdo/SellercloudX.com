import express, { Request, Response } from 'express';
import { db } from '../db';
import { users } from '@shared/schema';
import { eq } from 'drizzle-orm';
import bcrypt from 'bcryptjs';
import { nanoid } from 'nanoid';
import { asyncHandler } from '../errorHandler';

const router = express.Router();

// Middleware to check admin role
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
      isActive: users.isActive,
      createdAt: users.createdAt,
    })
    .from(users)
    .where(eq(users.role, 'admin'));

  res.json(admins);
}));

// Get available roles
router.get('/roles', requireAdmin, asyncHandler(async (req: Request, res: Response) => {
  const roles = [
    { id: 'admin', name: 'Admin', description: 'To\'liq huquqli admin' },
    { id: 'support_admin', name: 'Support Admin', description: 'Yordam xizmati' },
    { id: 'finance_admin', name: 'Finance Admin', description: 'Moliyaviy operatsiyalar' },
    { id: 'content_admin', name: 'Content Admin', description: 'Kontent boshqaruvi' },
  ];
  res.json(roles);
}));

// Get permissions for a role
router.get('/roles/:roleId/permissions', requireAdmin, asyncHandler(async (req: Request, res: Response) => {
  const { roleId } = req.params;
  
  const permissions: any = {
    admin: ['all'],
    support_admin: ['view_users', 'manage_tickets', 'send_messages'],
    finance_admin: ['view_transactions', 'manage_payments', 'generate_reports'],
    content_admin: ['manage_products', 'manage_categories', 'manage_content'],
  };

  res.json(permissions[roleId] || []);
}));

// Create new admin
router.post('/admins', requireAdmin, asyncHandler(async (req: Request, res: Response) => {
  const { username, email, password, roleId, firstName, lastName } = req.body;

  // Check if admin already exists
  const existing = await db
    .select()
    .from(users)
    .where(eq(users.email, email))
    .limit(1);

  if (existing.length > 0) {
    return res.status(400).json({ message: 'Bu email allaqachon mavjud' });
  }

  // Hash password
  const hashedPassword = await bcrypt.hash(password, 10);

  // Create admin
  const newAdmin = await db.insert(users).values({
    id: nanoid(),
    username,
    email,
    password: hashedPassword,
    role: roleId || 'admin',
    firstName,
    lastName,
    isActive: true,
    createdAt: new Date(),
    updatedAt: new Date(),
  }).returning();

  res.json(newAdmin[0]);
}));

// Toggle admin status
router.put('/admins/:adminId/status', requireAdmin, asyncHandler(async (req: Request, res: Response) => {
  const { adminId } = req.params;
  const { isActive } = req.body;

  await db
    .update(users)
    .set({ 
      isActive,
      updatedAt: new Date(),
    })
    .where(eq(users.id, adminId));

  res.json({ success: true });
}));

// Update admin role
router.put('/admins/:adminId/role', requireAdmin, asyncHandler(async (req: Request, res: Response) => {
  const { adminId } = req.params;
  const { roleId } = req.body;

  await db
    .update(users)
    .set({
      role: roleId,
      updatedAt: new Date(),
    })
    .where(eq(users.id, adminId));

  res.json({ success: true });
}));

// Delete admin
router.delete('/admins/:adminId', requireAdmin, asyncHandler(async (req: Request, res: Response) => {
  const { adminId } = req.params;

  await db
    .delete(users)
    .where(eq(users.id, adminId));

  res.json({ success: true });
}));

// Get activity logs
router.get('/activity-logs', requireAdmin, asyncHandler(async (req: Request, res: Response) => {
  // Mock data for now - you can implement real activity logging later
  const logs = [
    {
      id: '1',
      adminId: 'admin-1',
      adminName: 'Admin User',
      action: 'CREATE_PARTNER',
      details: 'Yangi partner yaratildi',
      timestamp: new Date().toISOString(),
      ipAddress: '127.0.0.1',
    },
  ];
  
  res.json(logs);
}));

export default router;
