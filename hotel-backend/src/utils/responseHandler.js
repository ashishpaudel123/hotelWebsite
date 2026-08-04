import logger from '../../utils/logger.js';

/**
 * Standard API Response Handler
 */
export const successResponse = (res, data, message = 'Success', meta = null) => {
  const response = {
    success: true,
    message,
    data,
  };

  if (meta) {
    response.meta = meta;
  }

  return res.status(200).json(response);
};

/**
 * Created Resource Response
 */
export const createdResponse = (res, data, message = 'Resource created successfully') => {
  return res.status(201).json({
    success: true,
    message,
    data,
  });
};

/**
 * No Content Response
 */
export const noContentResponse = (res, message = 'Operation successful') => {
  return res.status(204).json({
    success: true,
    message,
  });
};

/**
 * Error Response Handler
 */
export const errorResponse = (res, statusCode, code, message, details = null) => {
  const response = {
    success: false,
    error: {
      code,
      message,
    },
  };

  if (details) {
    response.error.details = details;
  }

  response.timestamp = new Date().toISOString();

  logger.error(`Error Response: ${code} - ${message}`);

  return res.status(statusCode).json(response);
};

/**
 * Validation Error Response
 */
export const validationErrorResponse = (res, errors) => {
  return errorResponse(res, 400, 'VALIDATION_ERROR', 'Validation failed for input data', errors);
};

/**
 * Authentication Error Response
 */
export const authErrorResponse = (res, message = 'Authentication failed') => {
  return errorResponse(res, 401, 'AUTH_ERROR', message);
};

/**
 * Authorization Error Response
 */
export const forbiddenResponse = (res, message = 'You do not have permission to perform this action') => {
  return errorResponse(res, 403, 'FORBIDDEN', message);
};

/**
 * Not Found Response
 */
export const notFoundResponse = (res, message = 'Resource not found') => {
  return errorResponse(res, 404, 'NOT_FOUND', message);
};

/**
 * Conflict Response
 */
export const conflictResponse = (res, message = 'Resource already exists') => {
  return errorResponse(res, 409, 'CONFLICT', message);
};

/**
 * Internal Server Error Response
 */
export const serverErrorResponse = (res, message = 'Internal server error') => {
  logger.error(`Server Error: ${message}`);
  return errorResponse(res, 500, 'SERVER_ERROR', message);
};

/**
 * Async Handler Wrapper
 * Wraps async route handlers to catch errors and pass them to Express error handler
 */
export const asyncHandler = (fn) => (req, res, next) => {
  Promise.resolve(fn(req, res, next)).catch(next);
};

export default {
  successResponse,
  createdResponse,
  noContentResponse,
  errorResponse,
  validationErrorResponse,
  authErrorResponse,
  forbiddenResponse,
  notFoundResponse,
  conflictResponse,
  serverErrorResponse,
  asyncHandler,
};
