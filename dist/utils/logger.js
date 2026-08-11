"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.logger = exports.Logger = void 0;
const winston_1 = __importDefault(require("winston"));
const path_1 = __importDefault(require("path"));
const logDir = path_1.default.join(process.cwd(), 'logs');
// Define log format
const logFormat = winston_1.default.format.combine(winston_1.default.format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }), winston_1.default.format.errors({ stack: true }), winston_1.default.format.splat(), winston_1.default.format.json());
// Create logger instance
class Logger {
    logger;
    constructor(module) {
        this.logger = winston_1.default.createLogger({
            level: process.env.LOG_LEVEL || 'info',
            format: winston_1.default.format.combine(winston_1.default.format.label({ label: module }), logFormat),
            defaultMeta: { service: 'hotel-management-system', module },
            transports: [
                // Error logs
                new winston_1.default.transports.File({
                    filename: path_1.default.join(logDir, 'error.log'),
                    level: 'error',
                    maxsize: 5242880, // 5MB
                    maxFiles: 5,
                }),
                // Warning logs
                new winston_1.default.transports.File({
                    filename: path_1.default.join(logDir, 'warn.log'),
                    level: 'warn',
                    maxsize: 5242880,
                    maxFiles: 5,
                }),
                // Info logs
                new winston_1.default.transports.File({
                    filename: path_1.default.join(logDir, 'info.log'),
                    level: 'info',
                    maxsize: 5242880,
                    maxFiles: 5,
                }),
                // Debug logs (only in development)
                ...(process.env.NODE_ENV === 'development' ? [
                    new winston_1.default.transports.File({
                        filename: path_1.default.join(logDir, 'debug.log'),
                        level: 'debug',
                        maxsize: 5242880,
                        maxFiles: 3,
                    }),
                ] : []),
            ],
        });
        // Add console transport in development
        if (process.env.NODE_ENV === 'development') {
            this.logger.add(new winston_1.default.transports.Console({
                format: winston_1.default.format.combine(winston_1.default.format.colorize(), winston_1.default.format.simple()),
            }));
        }
    }
    error(message, meta) {
        this.logger.error(message, meta);
    }
    warn(message, meta) {
        this.logger.warn(message, meta);
    }
    info(message, meta) {
        this.logger.info(message, meta);
    }
    debug(message, meta) {
        this.logger.debug(message, meta);
    }
    verbose(message, meta) {
        this.logger.verbose(message, meta);
    }
}
exports.Logger = Logger;
// Export a default logger for general use
exports.logger = new Logger('App');
//# sourceMappingURL=logger.js.map