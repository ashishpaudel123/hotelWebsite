"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.errorHandler = exports.AppError = void 0;
class AppError extends Error {
    statusCode;
    code;
    isOperational;
    constructor(message, statusCode = 500, code = 'SYS_001') {
        super(message);
        this.statusCode = statusCode;
        this.code = code;
        this.isOperational = true;
        Error.captureStackTrace(this, this.constructor);
    }
}
exports.AppError = AppError;
const errorHandler = (err, _req, res, _next) => {
    // Handle validation errors thrown as plain objects
    const anyErr = err;
    if (anyErr.status && anyErr.code && anyErr.message) {
        return res.status(anyErr.status).json({
            success: false,
            error: {
                code: anyErr.code,
                message: anyErr.message,
                ...(anyErr.details && { details: anyErr.details }),
            },
            timestamp: new Date().toISOString(),
        });
    }
    // If it's our custom AppError
    if (err instanceof AppError) {
        return res.status(err.statusCode).json({
            success: false,
            error: {
                code: err.code,
                message: err.message,
            },
            timestamp: new Date().toISOString(),
        });
    }
    // Mongoose validation error
    if (err.name === 'ValidationError') {
        const messages = Object.values(err.errors).map((e) => e.message);
        return res.status(400).json({
            success: false,
            error: {
                code: 'VAL_001',
                message: 'Validation failed',
                details: messages,
            },
            timestamp: new Date().toISOString(),
        });
    }
    // Mongoose duplicate key error
    if (err.code === 11000) {
        const field = Object.keys(err.keyValue)[0];
        return res.status(409).json({
            success: false,
            error: {
                code: 'RES_002',
                message: `Duplicate value for field: ${field}`,
            },
            timestamp: new Date().toISOString(),
        });
    }
    // JWT errors
    if (err.name === 'JsonWebTokenError') {
        return res.status(401).json({
            success: false,
            error: {
                code: 'AUTH_007',
                message: 'Invalid token',
            },
            timestamp: new Date().toISOString(),
        });
    }
    if (err.name === 'TokenExpiredError') {
        return res.status(401).json({
            success: false,
            error: {
                code: 'AUTH_002',
                message: 'Token expired',
            },
            timestamp: new Date().toISOString(),
        });
    }
    // Default error
    console.error('Unhandled error:', err);
    return res.status(500).json({
        success: false,
        error: {
            code: 'SYS_001',
            message: process.env.NODE_ENV === 'development' ? err.message : 'Internal server error',
        },
        timestamp: new Date().toISOString(),
    });
};
exports.errorHandler = errorHandler;
//# sourceMappingURL=errors.js.map