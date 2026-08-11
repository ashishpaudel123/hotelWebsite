"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.createRateLimiter = exports.paymentLimiter = exports.authLimiter = exports.apiLimiter = void 0;
const express_rate_limit_1 = __importDefault(require("express-rate-limit"));
const logger_1 = require("../utils/logger");
const logger = new logger_1.Logger('RateLimitMiddleware');
// General API rate limiter
exports.apiLimiter = (0, express_rate_limit_1.default)({
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
exports.authLimiter = (0, express_rate_limit_1.default)({
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
exports.paymentLimiter = (0, express_rate_limit_1.default)({
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
const createRateLimiter = (windowMs, max, messageCode, message) => {
    return (0, express_rate_limit_1.default)({
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
exports.createRateLimiter = createRateLimiter;
//# sourceMappingURL=rateLimit.middleware.js.map