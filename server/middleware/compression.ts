// Compression middleware - disabled until compression package is properly installed
import { Request, Response, NextFunction } from 'express';

// Stub compression middleware (no-op)
export const compressionMiddleware = (req: Request, res: Response, next: NextFunction) => {
  // Pass through without compression
  next();
};
