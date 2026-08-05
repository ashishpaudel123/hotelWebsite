import { Request, Response } from 'express';

interface Meta {
  page?: number;
  limit?: number;
  total?: number;
  totalPages?: number;
  [key: string]: any;
}

export const responseHandler = {
  success(res: Response, data: any, message: string = 'Success', statusCode: number = 200, meta?: Meta) {
    return res.status(statusCode).json({
      success: true,
      message,
      data,
      ...(meta && { meta }),
      timestamp: new Date().toISOString(),
    });
  },

  created(res: Response, data: any, message: string = 'Resource created successfully', meta?: Meta) {
    return this.success(res, data, message, 201, meta);
  },

  error(res: Response, message: string, statusCode: number = 400, code: string = 'ERR_001', details?: any[]) {
    return res.status(statusCode).json({
      success: false,
      error: {
        code,
        message,
        ...(details && { details }),
      },
      timestamp: new Date().toISOString(),
    });
  },

  notFound(res: Response, resource: string = 'Resource') {
    return this.error(res, `${resource} not found`, 404, 'RES_001');
  },

  unauthorized(res: Response, message: string = 'Unauthorized') {
    return this.error(res, message, 401, 'AUTH_001');
  },

  forbidden(res: Response, message: string = 'Forbidden') {
    return this.error(res, message, 403, 'PERM_001');
  },

  validation(res: Response, details: any[]) {
    return this.error(res, 'Validation failed', 400, 'VAL_001', details);
  },

  conflict(res: Response, message: string = 'Resource already exists') {
    return this.error(res, message, 409, 'RES_002');
  },

  serverError(res: Response, message: string = 'Internal server error') {
    return this.error(res, message, 500, 'SYS_001');
  },
};
