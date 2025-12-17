import { Request, Response, NextFunction } from 'express';

export interface AppError extends Error {
  statusCode?: number;
  isOperational?: boolean;
}

export const errorHandler = (
  err: AppError,
  req: Request,
  res: Response,
  next: NextFunction
) => {
  let error = { ...err };
  error.message = err.message;

  // Log error
  console.error('Error:', {
    message: err.message,
    stack: err.stack,
    url: req.url,
    method: req.method,
    ip: req.ip,
    userAgent: req.get('User-Agent'),
    timestamp: new Date().toISOString()
  });

  // SQLite/Drizzle errors
  if ((err as any).code === 'SQLITE_CONSTRAINT') {
    const message = 'Database constraint violation';
    error = { message, statusCode: 400 } as AppError;
  }

  if ((err as any).code === 'SQLITE_CONSTRAINT_UNIQUE') {
    const message = 'Duplicate field value entered';
    error = { message, statusCode: 400 } as AppError;
  }

  if ((err as any).code === 'SQLITE_CONSTRAINT_FOREIGNKEY') {
    const message = 'Referenced record not found';
    error = { message, statusCode: 400 } as AppError;
  }

  // Drizzle validation errors
  if (err.name === 'ZodError') {
    const message = 'Validation error';
    error = { message, statusCode: 400 } as AppError;
  }

  // JWT errors
  if (err.name === 'JsonWebTokenError') {
    const message = 'Invalid token';
    error = { message, statusCode: 401 } as AppError;
  }

  if (err.name === 'TokenExpiredError') {
    const message = 'Token expired';
    error = { message, statusCode: 401 } as AppError;
  }

  res.status(error.statusCode || 500).json({
    success: false,
    error: error.message || 'Server Error',
    ...(process.env.NODE_ENV === 'development' && { stack: err.stack })
  });
};

export const notFound = (req: Request, res: Response, next: NextFunction) => {
  const error = new Error(`Not Found - ${req.originalUrl}`) as AppError;
  error.statusCode = 404;
  next(error);
};

export const asyncHandler = (fn: Function) => (req: Request, res: Response, next: NextFunction) => {
  Promise.resolve(fn(req, res, next)).catch(next);
};
