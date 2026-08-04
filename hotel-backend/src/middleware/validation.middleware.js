import { validationResult } from 'express-validator';
import { validationErrorResponse } from './responseHandler.js';

/**
 * Express Validator Result Handler
 * Checks for validation errors and returns formatted response
 */
export const validate = (req, res, next) => {
  const errors = validationResult(req);
  
  if (!errors.isEmpty()) {
    const formattedErrors = errors.array().map(err => ({
      field: err.path || err.param,
      message: err.msg,
    }));
    
    return validationErrorResponse(res, formattedErrors);
  }
  
  next();
};

/**
 * Zod Validation Middleware
 * Validates request data using Zod schemas
 */
export const validateWithZod = (schema) => {
  return (req, res, next) => {
    try {
      // Determine which part of the request to validate
      let dataToValidate;
      
      if (schema.shape?.email && schema.shape?.password) {
        // Login/Register - validate body
        dataToValidate = req.body;
      } else if (schema.shape?.page || schema.shape?.limit) {
        // Query params
        dataToValidate = req.query;
      } else if (schema.shape?.id) {
        // URL params
        dataToValidate = req.params;
      } else {
        // Default to body
        dataToValidate = req.body;
      }

      const result = schema.safeParse(dataToValidate);
      
      if (!result.success) {
        const formattedErrors = result.error.errors.map(err => ({
          field: err.path.join('.'),
          message: err.message,
        }));
        
        return validationErrorResponse(res, formattedErrors);
      }

      // Attach validated data to request
      req.validatedData = result.data;
      next();
    } catch (error) {
      next(error);
    }
  };
};

export default {
  validate,
  validateWithZod,
};
