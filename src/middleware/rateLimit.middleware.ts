import rateLimit from 'express-rate-limit';
import { Logger } from '../utils/logger';

const logger = new Logger('RateLimitMiddleware');

// General API rate limiter
export const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // Limit each IP to 100 requests per windowMs
  message: {
    success: false,
    error: {
      code: 'RATE_001',
      message: 'Too many requests, please try again later.',
    },
    timestamp: new Date().toISOString(),
  },
  standardHeaders: true,
  legacyHeaders: false,
  handler: (req, res) => {
    logger.warn('Rate limit exceeded', { 
      ip: req.ip, 
      path: req.path, 
      method: req.method 
    });
    res.status(429).json({
      success: false,
      error: {
        code: 'RATE_001',
        message: 'Too many requests, please try again later.',
      },
      timestamp: new Date().toISOString(),
    });
  },
});

// Strict rate limiter for auth endpoints
export const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 5, // Limit each IP to 5 requests per windowMs
  message: {
    success: false,
    error: {
      code: 'RATE_002',
      message: 'Too many authentication attempts, please try again later.',
    },
    timestamp: new Date().toISOString(),
  },
  standardHeaders: true,
  legacyHeaders: false,
  skipSuccessfulRequests: true, // Only count failed attempts
  handler: (req, res) => {
    logger.warn('Auth rate limit exceeded', { 
      ip: req.ip, 
      path: req.path,
      email: req.body?.email 
    });
    res.status(429).json({
      success: false,
      error: {
        code: 'RATE_002',
        message: 'Too many authentication attempts, please try again later.',
      },
      timestamp: new Date().toISOString(),
    });
  },
});

// Rate limiter for payment endpoints
export const paymentLimiter = rateLimit({
  windowMs: 60 * 60 * 1000, // 1 hour
  max: 20, // Limit each IP to 20 payment requests per hour
  message: {
    success: false,
    error: {
      code: 'RATE_003',
      message: 'Too many payment requests, please try again later.',
    },
    timestamp: new Date().toISOString(),
  },
  standardHeaders: true,
  legacyHeaders: false,
  handler: (req, res) => {
    logger.warn('Payment rate limit exceeded', { 
      ip: req.ip, 
      path: req.path,
      bookingId: req.body?.bookingId 
    });
    res.status(429).json({
      success: false,
      error: {
        code: 'RATE_003',
        message: 'Too many payment requests, please try again later.',
      },
      timestamp: new Date().toISOString(),
    });
  },
});

// Custom rate limiter factory
export const createRateLimiter = (
  windowMs: number,
  max: number,
  messageCode: string,
  message: string
) => {
  return rateLimit({
    windowMs,
    max,
    message: {
      success: false,
      error: {
        code: messageCode,
        message,
      },
      timestamp: new Date().toISOString(),
    },
    standardHeaders: true,
    legacyHeaders: false,
    handler: (req, res) => {
      logger.warn('Custom rate limit exceeded', { 
        ip: req.ip, 
        path: req.path,
        code: messageCode 
      });
      res.status(429).json({
        success: false,
        error: {
          code: messageCode,
          message,
        },
        timestamp: new Date().toISOString(),
      });
    },
  });
};
