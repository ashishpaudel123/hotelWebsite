import { Request, Response, NextFunction } from 'express';
import { ZodSchema, ZodError, z } from 'zod';
import { responseHandler } from '../utils/responseHandler';

export const validateRequest = async (req: Request, schema: ZodSchema) => {
  try {
    const shape = (schema as any).shape || {};
    let dataToValidate: any;

    if (shape.email && shape.password) {
      dataToValidate = req.body;
    } else if (shape.page || shape.limit) {
      dataToValidate = req.query;
    } else if (shape.id) {
      dataToValidate = req.params;
    } else {
      dataToValidate = req.body;
    }

    await schema.parseAsync(dataToValidate);
  } catch (error) {
    if (error instanceof ZodError) {
      const details = error.errors.map((err) => ({
        field: err.path.join('.'),
        message: err.message,
      }));
      
      throw {
        status: 400,
        code: 'VAL_001',
        message: 'Validation failed',
        details,
      };
    }
    throw error;
  }
};

export const validationMiddleware = (schema: ZodSchema) => {
  return async (req: Request, res: Response, next: NextFunction) => {
    try {
      await validateRequest(req, schema);
      return next();
    } catch (error: any) {
      if (error.status === 400 && error.details) {
        return responseHandler.validation(res, error.details);
      }
      return next(error);
    }
  };
};

// Validation helper for query parameters with pagination
export const paginateSchema = {
  page: (defaultPage: number = 1) => 
    z.coerce.number().int().min(1).default(defaultPage),
  limit: (defaultLimit: number = 20) => 
    z.coerce.number().int().min(1).max(100).default(defaultLimit),
  sortBy: (defaultSort: string = 'createdAt') => 
    z.string().default(defaultSort),
  sortOrder: () => 
    z.enum(['asc', 'desc']).default('desc'),
  search: () => 
    z.string().optional(),
  status: () => 
    z.enum(['active', 'inactive', 'deleted']).optional(),
};
