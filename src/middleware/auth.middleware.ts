import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { AppError } from '../utils/errors';
import { Logger } from '../utils/logger';

const logger = new Logger('AuthMiddleware');

interface JwtPayload {
  sub: string;
  email: string;
  role: string;
  permissions: string[];
}

declare module 'express' {
  interface Request {
    user?: JwtPayload;
  }
}

export const authenticate = (req: Request, _res: Response, next: NextFunction) => {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      throw new AppError('No token provided', 401, 'AUTH_001');
    }

    const token = authHeader.split(' ')[1];
    const JWT_SECRET = process.env.JWT_SECRET;

    if (!JWT_SECRET) {
      logger.error('JWT_SECRET is not configured');
      return next(new AppError('Server configuration error', 500, 'SYS_002'));
    }

    const decoded = jwt.verify(token, JWT_SECRET) as JwtPayload;
    req.user = decoded;

    logger.debug('User authenticated', { userId: decoded.sub, email: decoded.email });
    next();
  } catch (error: any) {
    if (error.name === 'JsonWebTokenError') {
      logger.warn('Invalid token', { error: error.message });
      next(new AppError('Invalid token', 401, 'AUTH_007'));
    } else if (error.name === 'TokenExpiredError') {
      logger.warn('Token expired', { error: error.message });
      next(new AppError('Token expired', 401, 'AUTH_002'));
    } else {
      logger.error('Authentication error', { error });
      next(error);
    }
  }
};

export const authorize = (...permissions: string[]) => {
  return (req: Request, _res: Response, next: NextFunction) => {
    try {
      if (!req.user) {
        throw new AppError('User not authenticated', 401, 'AUTH_008');
      }

      const userPermissions = req.user.permissions || [];
      
      // Check if user has any of the required permissions
      const hasPermission = permissions.some(permission => 
        userPermissions.includes(permission) || 
        userPermissions.includes('*:*') || // Super admin
        userPermissions.includes(`${permission.split(':')[0]}:manage`) // Resource manager
      );

      if (!hasPermission) {
        logger.warn('Authorization failed', { 
          userId: req.user.sub, 
          requiredPermissions: permissions,
          userPermissions 
        });
        throw new AppError(
          `Insufficient permissions. Required: ${permissions.join(' or ')}`, 
          403, 
          'PERM_001'
        );
      }

      logger.debug('Authorization successful', { 
        userId: req.user.sub, 
        permission: permissions[0] 
      });
      next();
    } catch (error) {
      next(error);
    }
  };
};

export const checkRole = (...roles: string[]) => {
  return (req: Request, _res: Response, next: NextFunction) => {
    try {
      if (!req.user) {
        throw new AppError('User not authenticated', 401, 'AUTH_008');
      }

      if (!roles.includes(req.user.role)) {
        logger.warn('Role check failed', { 
          userId: req.user.sub, 
          userRole: req.user.role,
          requiredRoles: roles 
        });
        throw new AppError('Insufficient role privileges', 403, 'PERM_002');
      }

      next();
    } catch (error) {
      next(error);
    }
  };
};

export const optionalAuth = (req: Request, _res: Response, next: NextFunction) => {
  try {
    const authHeader = req.headers.authorization;

    if (authHeader && authHeader.startsWith('Bearer ')) {
      const token = authHeader.split(' ')[1];
      const JWT_SECRET = process.env.JWT_SECRET;

      if (!JWT_SECRET) {
        logger.error('JWT_SECRET is not configured');
      } else {
        try {
          const decoded = jwt.verify(token, JWT_SECRET) as JwtPayload;
          req.user = decoded;
          logger.debug('Optional auth: User authenticated', { userId: decoded.sub });
        } catch (error) {
          logger.debug('Optional auth: Invalid token, continuing as guest');
        }
      }
    }

    next();
  } catch (error) {
    // Continue anyway for optional auth
    next();
  }
};
