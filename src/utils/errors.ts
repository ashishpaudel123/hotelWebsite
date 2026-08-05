import { Request, Response, NextFunction } from 'express';

export class AppError extends Error {
  statusCode: number;
  code: string;
  isOperational: boolean;

  constructor(message: string, statusCode: number = 500, code: string = 'SYS_001') {
    super(message);
    this.statusCode = statusCode;
    this.code = code;
    this.isOperational = true;

    Error.captureStackTrace(this, this.constructor);
  }
}

export const errorHandler = (
  err: Error | AppError,
  req: Request,
  res: Response,
  next: NextFunction
) => {
  // If it's our custom AppError
  if (err instanceof AppError) {
    return res.status(err.statusCode).json({
      success: false,
      error: {
        code: err.code,
        message: err.message,
      },
      timestamp: new Date().toISOString(),
    });
  }

  // Mongoose validation error
  if (err.name === 'ValidationError') {
    const messages = Object.values((err as any).errors).map((e: any) => e.message);
    return res.status(400).json({
      success: false,
      error: {
        code: 'VAL_001',
        message: 'Validation failed',
        details: messages,
      },
      timestamp: new Date().toISOString(),
    });
  }

  // Mongoose duplicate key error
  if ((err as any).code === 11000) {
    const field = Object.keys((err as any).keyValue)[0];
    return res.status(409).json({
      success: false,
      error: {
        code: 'RES_002',
        message: `Duplicate value for field: ${field}`,
      },
      timestamp: new Date().toISOString(),
    });
  }

  // JWT errors
  if (err.name === 'JsonWebTokenError') {
    return res.status(401).json({
      success: false,
      error: {
        code: 'AUTH_007',
        message: 'Invalid token',
      },
      timestamp: new Date().toISOString(),
    });
  }

  if (err.name === 'TokenExpiredError') {
    return res.status(401).json({
      success: false,
      error: {
        code: 'AUTH_002',
        message: 'Token expired',
      },
      timestamp: new Date().toISOString(),
    });
  }

  // Default error
  console.error('Unhandled error:', err);
  return res.status(500).json({
    success: false,
    error: {
      code: 'SYS_001',
      message: process.env.NODE_ENV === 'development' ? err.message : 'Internal server error',
    },
    timestamp: new Date().toISOString(),
  });
};
