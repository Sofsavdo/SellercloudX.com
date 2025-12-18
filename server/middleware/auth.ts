import { Request, Response, NextFunction } from 'express';

/**
 * Require authentication middleware
 */
export function requireAuth(req: Request, res: Response, next: NextFunction) {
  if (!req.session?.user) {
    return res.status(401).json({
      message: 'Tizimga kirish talab qilinadi',
      code: 'UNAUTHORIZED'
    });
  }
  next();
}

/**
 * Require admin role middleware
 */
export function requireAdmin(req: Request, res: Response, next: NextFunction) {
  if (!req.session?.user) {
    return res.status(401).json({
      message: 'Tizimga kirish talab qilinadi',
      code: 'UNAUTHORIZED'
    });
  }

  if (req.session.user.role !== 'admin') {
    return res.status(403).json({
      message: 'Admin huquqi talab qilinadi',
      code: 'FORBIDDEN'
    });
  }

  next();
}

/**
 * Require partner role middleware
 */
export function requirePartner(req: Request, res: Response, next: NextFunction) {
  if (!req.session?.user) {
    return res.status(401).json({
      message: 'Tizimga kirish talab qilinadi',
      code: 'UNAUTHORIZED'
    });
  }

  if (req.session.user.role !== 'partner' && req.session.user.role !== 'admin') {
    return res.status(403).json({
      message: 'Hamkor huquqi talab qilinadi',
      code: 'FORBIDDEN'
    });
  }

  next();
}

/**
 * Optional auth middleware - doesn't fail if not authenticated
 */
export function optionalAuth(req: Request, res: Response, next: NextFunction) {
  // Just continue, user might or might not be authenticated
  next();
}
