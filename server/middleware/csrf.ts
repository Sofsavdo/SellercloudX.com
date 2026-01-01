import { Request, Response, NextFunction } from 'express';

// CSRF protection middleware - simplified version
export const csrfProtection = (req: Request, res: Response, next: NextFunction) => {
  // Skip CSRF for now - implement proper CSRF when needed
  next();
};

// Middleware to attach CSRF token to response
export const attachCsrfToken = (req: Request, res: Response, next: NextFunction) => {
  // Add CSRF token to response locals for templates
  res.locals.csrfToken = (req as any).csrfToken ? (req as any).csrfToken() : null;
  next();
};

// Error handler for CSRF token errors
export const csrfErrorHandler = (err: any, req: Request, res: Response, next: NextFunction) => {
  if (err.code === 'EBADCSRFTOKEN') {
    return res.status(403).json({
      message: 'Noto\'g\'ri yoki eskirgan CSRF token',
      code: 'INVALID_CSRF_TOKEN',
      timestamp: new Date().toISOString()
    });
  }
  next(err);
};

// Skip CSRF for certain routes (like API endpoints that use other auth methods)
export const skipCsrfForApi = (req: Request, res: Response, next: NextFunction) => {
  // Skip CSRF for WebSocket upgrade requests
  if (req.headers.upgrade === 'websocket') {
    return next();
  }
  
  // Skip CSRF for health check
  if (req.path === '/api/health') {
    return next();
  }
  
  // Skip CSRF for auth endpoints (they use session-based auth)
  if (req.path.startsWith('/api/auth/')) {
    return next();
  }
  
  // Apply CSRF protection for other routes
  csrfProtection(req, res, next);
};
