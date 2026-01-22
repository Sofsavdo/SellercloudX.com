import { Request, Response, NextFunction } from 'express';

/**
 * Require authentication middleware with enhanced logging
 */
export function requireAuth(req: Request, res: Response, next: NextFunction) {
  console.log('🔒 Auth check:', {
    path: req.path,
    method: req.method,
    hasSession: !!req.session,
    hasUser: !!req.session?.user,
    sessionID: req.sessionID,
    cookies: req.headers.cookie ? 'present' : 'missing'
  });

  if (!req.session?.user) {
    console.log('❌ Auth failed: No user in session');
    return res.status(401).json({
      message: 'Tizimga kirish talab qilinadi',
      code: 'UNAUTHORIZED'
    });
  }
  
  console.log('✅ Auth success:', { userId: req.session.user.id, role: req.session.user.role });
  next();
}

/**
 * Require admin role middleware
 */
export function requireAdmin(req: Request, res: Response, next: NextFunction) {
  console.log('🔐 Admin check:', {
    path: req.path,
    hasSession: !!req.session,
    hasUser: !!req.session?.user,
    role: req.session?.user?.role
  });

  if (!req.session?.user) {
    console.log('❌ Admin auth failed: No user');
    return res.status(401).json({
      message: 'Tizimga kirish talab qilinadi',
      code: 'UNAUTHORIZED'
    });
  }

  if (req.session.user.role !== 'admin') {
    console.log('❌ Admin auth failed: Not admin role');
    return res.status(403).json({
      message: 'Admin huquqi talab qilinadi',
      code: 'FORBIDDEN'
    });
  }

  console.log('✅ Admin auth success:', req.session.user.id);
  next();
}

/**
 * Require partner role middleware
 */
export function requirePartner(req: Request, res: Response, next: NextFunction) {
  console.log('👥 Partner check:', {
    path: req.path,
    hasSession: !!req.session,
    hasUser: !!req.session?.user,
    role: req.session?.user?.role
  });

  if (!req.session?.user) {
    console.log('❌ Partner auth failed: No user');
    return res.status(401).json({
      message: 'Tizimga kirish talab qilinadi',
      code: 'UNAUTHORIZED'
    });
  }

  if (req.session.user.role !== 'partner' && req.session.user.role !== 'admin') {
    console.log('❌ Partner auth failed: Not partner or admin');
    return res.status(403).json({
      message: 'Hamkor huquqi talab qilinadi',
      code: 'FORBIDDEN'
    });
  }

  console.log('✅ Partner auth success:', { userId: req.session.user.id, role: req.session.user.role });
  next();
}

/**
 * Optional auth middleware - doesn't fail if not authenticated
 */
export function optionalAuth(req: Request, res: Response, next: NextFunction) {
  // Just continue, user might or might not be authenticated
  next();
}
