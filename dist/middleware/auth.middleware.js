"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.optionalAuth = exports.checkRole = exports.authorize = exports.authenticate = void 0;
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const errors_1 = require("../utils/errors");
const logger_1 = require("../utils/logger");
const logger = new logger_1.Logger('AuthMiddleware');
const authenticate = (req, _res, next) => {
    try {
        const authHeader = req.headers.authorization;
        if (!authHeader || !authHeader.startsWith('Bearer ')) {
            throw new errors_1.AppError('No token provided', 401, 'AUTH_001');
        }
        const token = authHeader.split(' ')[1];
        const JWT_SECRET = process.env.JWT_SECRET;
        if (!JWT_SECRET) {
            logger.error('JWT_SECRET is not configured');
            return next(new errors_1.AppError('Server configuration error', 500, 'SYS_002'));
        }
        const decoded = jsonwebtoken_1.default.verify(token, JWT_SECRET);
        req.user = decoded;
        logger.debug('User authenticated', { userId: decoded.sub, email: decoded.email });
        next();
    }
    catch (error) {
        if (error.name === 'JsonWebTokenError') {
            logger.warn('Invalid token', { error: error.message });
            next(new errors_1.AppError('Invalid token', 401, 'AUTH_007'));
        }
        else if (error.name === 'TokenExpiredError') {
            logger.warn('Token expired', { error: error.message });
            next(new errors_1.AppError('Token expired', 401, 'AUTH_002'));
        }
        else {
            logger.error('Authentication error', { error });
            next(error);
        }
    }
};
exports.authenticate = authenticate;
const authorize = (...permissions) => {
    return (req, _res, next) => {
        try {
            if (!req.user) {
                throw new errors_1.AppError('User not authenticated', 401, 'AUTH_008');
            }
            const userPermissions = req.user.permissions || [];
            // Check if user has any of the required permissions
            const hasPermission = permissions.some(permission => userPermissions.includes(permission) ||
                userPermissions.includes('*:*') || // Super admin
                userPermissions.includes(`${permission.split(':')[0]}:manage`) // Resource manager
            );
            if (!hasPermission) {
                logger.warn('Authorization failed', {
                    userId: req.user.sub,
                    requiredPermissions: permissions,
                    userPermissions
                });
                throw new errors_1.AppError(`Insufficient permissions. Required: ${permissions.join(' or ')}`, 403, 'PERM_001');
            }
            logger.debug('Authorization successful', {
                userId: req.user.sub,
                permission: permissions[0]
            });
            next();
        }
        catch (error) {
            next(error);
        }
    };
};
exports.authorize = authorize;
const checkRole = (...roles) => {
    return (req, _res, next) => {
        try {
            if (!req.user) {
                throw new errors_1.AppError('User not authenticated', 401, 'AUTH_008');
            }
            if (!roles.includes(req.user.role)) {
                logger.warn('Role check failed', {
                    userId: req.user.sub,
                    userRole: req.user.role,
                    requiredRoles: roles
                });
                throw new errors_1.AppError('Insufficient role privileges', 403, 'PERM_002');
            }
            next();
        }
        catch (error) {
            next(error);
        }
    };
};
exports.checkRole = checkRole;
const optionalAuth = (req, _res, next) => {
    try {
        const authHeader = req.headers.authorization;
        if (authHeader && authHeader.startsWith('Bearer ')) {
            const token = authHeader.split(' ')[1];
            const JWT_SECRET = process.env.JWT_SECRET;
            if (!JWT_SECRET) {
                logger.error('JWT_SECRET is not configured');
            }
            else {
                try {
                    const decoded = jsonwebtoken_1.default.verify(token, JWT_SECRET);
                    req.user = decoded;
                    logger.debug('Optional auth: User authenticated', { userId: decoded.sub });
                }
                catch (error) {
                    logger.debug('Optional auth: Invalid token, continuing as guest');
                }
            }
        }
        next();
    }
    catch (error) {
        // Continue anyway for optional auth
        next();
    }
};
exports.optionalAuth = optionalAuth;
//# sourceMappingURL=auth.middleware.js.map