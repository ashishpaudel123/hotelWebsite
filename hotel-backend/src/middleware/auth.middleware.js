import jwt from 'jsonwebtoken';
import { authErrorResponse, forbiddenResponse } from './responseHandler.js';
import User from '../models/User.js';
import logger from './logger.js';

/**
 * Protect Routes - Verify JWT Token
 * Middleware to authenticate requests
 */
export const protect = async (req, res, next) => {
  try {
    let token;

    // Check for token in Authorization header or cookies
    if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
      token = req.headers.authorization.split(' ')[1];
    } else if (req.cookies && req.cookies.token) {
      token = req.cookies.token;
    }

    if (!token) {
      return authErrorResponse(res, 'Access denied. No token provided.');
    }

    // Verify token
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    // Find user and check if still exists and not deleted
    const user = await User.findById(decoded.id)
      .select('-password')
      .populate('role', 'name slug permissions');

    if (!user || user.isDeleted) {
      return authErrorResponse(res, 'User not found or has been deleted.');
    }

    // Check if user is active
    if (user.status !== 'active') {
      return authErrorResponse(res, 'Your account has been deactivated. Please contact support.');
    }

    // Check if account is locked due to failed login attempts
    if (user.isLocked) {
      return authErrorResponse(res, 'Account is temporarily locked due to multiple failed login attempts.');
    }

    // Attach user to request
    req.user = user;
    
    next();
  } catch (error) {
    if (error.name === 'JsonWebTokenError') {
      return authErrorResponse(res, 'Invalid token.');
    }
    if (error.name === 'TokenExpiredError') {
      return authErrorResponse(res, 'Token expired. Please login again.');
    }
    
    logger.error(`Authentication error: ${error.message}`);
    return authErrorResponse(res, 'Authentication failed.');
  }
};

/**
 * Authorize Roles
 * Check if user has required role(s)
 */
export const authorize = (...roles) => {
  return (req, res, next) => {
    if (!req.user) {
      return authErrorResponse(res, 'Not authenticated');
    }

    const userRole = req.user.role;
    
    // If roles array is empty, any authenticated user can access
    if (roles.length === 0) {
      return next();
    }

    // Check if user's role slug matches any of the allowed roles
    if (!roles.includes(userRole.slug)) {
      logger.warn(`Authorization failed for user ${req.user.email}. Required roles: ${roles.join(', ')}, User role: ${userRole.slug}`);
      return forbiddenResponse(res, `You do not have permission to access this resource. Required roles: ${roles.join(', ')}`);
    }

    next();
  };
};

/**
 * Check Permissions
 * Verify if user has specific permission(s)
 */
export const checkPermission = (...permissions) => {
  return (req, res, next) => {
    if (!req.user) {
      return authErrorResponse(res, 'Not authenticated');
    }

    const userPermissions = req.user.role?.permissions || [];
    const userPermissionNames = userPermissions.map(p => `${p.resource}:${p.action}`);

    // Check if user has at least one of the required permissions
    const hasPermission = permissions.some(perm => {
      // Support wildcard permissions (e.g., "booking:*" or "*:write")
      const [resource, action] = perm.split(':');
      
      if (resource === '*' || action === '*') {
        return true;
      }

      return userPermissionNames.includes(perm) || 
             userPermissionNames.includes(`${resource}:all`) ||
             userPermissionNames.includes('*:*');
    });

    if (!hasPermission) {
      logger.warn(`Permission check failed for user ${req.user.email}. Required: ${permissions.join(', ')}`);
      return forbiddenResponse(res, `You do not have permission to perform this action. Required: ${permissions.join(', ')}`);
    }

    next();
  };
};

/**
 * Optional Authentication
 * Authenticate if token is present but don't require it
 */
export const optionalAuth = async (req, res, next) => {
  try {
    let token;

    if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
      token = req.headers.authorization.split(' ')[1];
    } else if (req.cookies && req.cookies.token) {
      token = req.cookies.token;
    }

    if (!token) {
      return next();
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const user = await User.findById(decoded.id)
      .select('-password')
      .populate('role', 'name slug permissions');

    if (user && !user.isDeleted && user.status === 'active') {
      req.user = user;
    }

    next();
  } catch (error) {
    // Ignore errors for optional auth
    next();
  }
};

export default {
  protect,
  authorize,
  checkPermission,
  optionalAuth,
};
