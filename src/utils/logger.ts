import winston from 'winston';
import path from 'path';

const logDir = path.join(process.cwd(), 'logs');

// Define log format
const logFormat = winston.format.combine(
  winston.format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),
  winston.format.errors({ stack: true }),
  winston.format.splat(),
  winston.format.json()
);

// Create logger instance
export class Logger {
  private logger: winston.Logger;

  constructor(module: string) {
    this.logger = winston.createLogger({
      level: process.env.LOG_LEVEL || 'info',
      format: winston.format.combine(
        winston.format.label({ label: module }),
        logFormat
      ),
      defaultMeta: { service: 'hotel-management-system', module },
      transports: [
        // Error logs
        new winston.transports.File({
          filename: path.join(logDir, 'error.log'),
          level: 'error',
          maxsize: 5242880, // 5MB
          maxFiles: 5,
        }),
        // Warning logs
        new winston.transports.File({
          filename: path.join(logDir, 'warn.log'),
          level: 'warn',
          maxsize: 5242880,
          maxFiles: 5,
        }),
        // Info logs
        new winston.transports.File({
          filename: path.join(logDir, 'info.log'),
          level: 'info',
          maxsize: 5242880,
          maxFiles: 5,
        }),
        // Debug logs (only in development)
        ...(process.env.NODE_ENV === 'development' ? [
          new winston.transports.File({
            filename: path.join(logDir, 'debug.log'),
            level: 'debug',
            maxsize: 5242880,
            maxFiles: 3,
          }),
        ] : []),
      ],
    });

    // Add console transport in development
    if (process.env.NODE_ENV === 'development') {
      this.logger.add(
        new winston.transports.Console({
          format: winston.format.combine(
            winston.format.colorize(),
            winston.format.simple()
          ),
        })
      );
    }
  }

  error(message: string, meta?: any) {
    this.logger.error(message, meta);
  }

  warn(message: string, meta?: any) {
    this.logger.warn(message, meta);
  }

  info(message: string, meta?: any) {
    this.logger.info(message, meta);
  }

  debug(message: string, meta?: any) {
    this.logger.debug(message, meta);
  }

  verbose(message: string, meta?: any) {
    this.logger.verbose(message, meta);
  }
}

// Export a default logger for general use
export const logger = new Logger('App');
