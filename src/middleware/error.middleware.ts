import { Request, Response, NextFunction } from 'express';
import { errorHandler } from '../utils/errors';

export const errorMiddleware = (
  err: any,
  req: Request,
  res: Response,
  next: NextFunction
) => {
  // Delegate to the main error handler
  return errorHandler(err, req, res, next);
};
