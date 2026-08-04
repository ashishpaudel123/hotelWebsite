import { errorResponse, asyncHandler } from './responseHandler.js';
import logger from './logger.js';

/**
 * 404 Not Found Handler
 */
export const notFoundHandler = (req, res, next) => {
  return errorResponse(res, 404, 'NOT_FOUND', `Route ${req.originalUrl} not found`);
};

/**
 * Global Error Handler
 * Handles all errors in the application
 */
export const errorHandler = (err, req, res, next) => {
  let error = { ...err };
  error.message = err.message;

  // Log error for debugging
  logger.error(`Error: ${error.message}`, {
    stack: error.stack,
    url: req.originalUrl,
    method: req.method,
    ip: req.ip,
  });

  // Mongoose bad ObjectId
  if (err.name === 'CastError') {
    const message = 'Resource not found';
    return errorResponse(res, 404, 'NOT_FOUND', message);
  }

  // Mongoose duplicate key
  if (err.code === 11000) {
    const field = Object.keys(err.keyValue)[0];
    const message = `Duplicate value entered for ${field} field`;
    return errorResponse(res, 409, 'CONFLICT', message);
  }

  // Mongoose validation error
  if (err.name === 'ValidationError') {
    const messages = Object.values(err.errors).map(val => val.message);
    return errorResponse(res, 400, 'VALIDATION_ERROR', 'Validation failed', 
      messages.map(msg => ({ field: 'unknown', message: msg }))
    );
  }

  // JWT errors
  if (err.name === 'JsonWebTokenError') {
    return errorResponse(res, 401, 'AUTH_ERROR', 'Invalid token');
  }

  if (err.name === 'TokenExpiredError') {
    return errorResponse(res, 401, 'AUTH_ERROR', 'Token expired');
  }

  // Custom errors with statusCode
  if (err.statusCode) {
    return errorResponse(res, err.statusCode, err.code || 'ERROR', err.message);
  }

  // Default server error
  const message = error.message || 'Internal Server Error';
  return errorResponse(res, 500, 'SERVER_ERROR', message);
};

/**
 * Async handler wrapper for route handlers
 */
export const asyncErrorHandler = asyncHandler;

export default {
  notFoundHandler,
  errorHandler,
  asyncErrorHandler,
};
