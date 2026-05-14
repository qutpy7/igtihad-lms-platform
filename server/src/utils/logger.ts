/* ═══════════════════════════════════════════════════
   Winston Logger — Structured Logging for LMS
   ═══════════════════════════════════════════════════
   
   Replaces raw console.log/console.error with structured,
   level-based logging that writes to both console and files.
   
   Log files:
     logs/error.log   — errors only (kept for debugging)
     logs/combined.log — everything (info, warn, error)
   
   Usage:
     import { logger } from '../utils/logger';
     logger.info('User logged in', { userId: '123' });
     logger.error('DB query failed', { error, query });
     logger.warn('Rate limit hit', { ip: req.ip });
   ═══════════════════════════════════════════════════ */

import winston from 'winston';
import path from 'path';
import { Request, Response, NextFunction } from 'express';

const isDev = process.env.NODE_ENV !== 'production';

// Custom format: timestamp + level + message + metadata
const logFormat = winston.format.combine(
    winston.format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),
    winston.format.errors({ stack: true }),
    winston.format.printf(({ timestamp, level, message, stack, ...meta }) => {
        const metaStr = Object.keys(meta).length ? ` ${JSON.stringify(meta)}` : '';
        const stackStr = stack ? `\n${stack}` : '';
        return `[${timestamp}] ${level.toUpperCase()}: ${message}${metaStr}${stackStr}`;
    })
);

// Console format with colors (dev only)
const consoleFormat = winston.format.combine(
    winston.format.colorize(),
    winston.format.timestamp({ format: 'HH:mm:ss' }),
    winston.format.printf(({ timestamp, level, message, ...meta }) => {
        const metaStr = Object.keys(meta).length && !meta.stack ? ` ${JSON.stringify(meta)}` : '';
        return `[${timestamp}] ${level}: ${message}${metaStr}`;
    })
);

const logsDir = path.join(process.cwd(), 'logs');

export const logger = winston.createLogger({
    level: isDev ? 'debug' : 'info',
    format: logFormat,
    defaultMeta: { service: 'igtihad-api' },
    transports: [
        // Write errors to error.log
        new winston.transports.File({
            filename: path.join(logsDir, 'error.log'),
            level: 'error',
            maxsize: 5 * 1024 * 1024, // 5MB
            maxFiles: 5,
        }),
        // Write everything to combined.log
        new winston.transports.File({
            filename: path.join(logsDir, 'combined.log'),
            maxsize: 10 * 1024 * 1024, // 10MB
            maxFiles: 3,
        }),
    ],
});

// In development, also log to console with colors
if (isDev) {
    logger.add(new winston.transports.Console({
        format: consoleFormat,
    }));
}

// HTTP request logger middleware for Express
export function httpLogger(req: Request, res: Response, next: NextFunction) {
    const start = Date.now();
    
    res.on('finish', () => {
        const duration = Date.now() - start;
        const meta = {
            method: req.method,
            url: req.originalUrl,
            status: res.statusCode,
            duration: `${duration}ms`,
        };

        if (res.statusCode >= 500) {
            logger.error(`${req.method} ${req.originalUrl}`, meta);
        } else if (res.statusCode >= 400) {
            logger.warn(`${req.method} ${req.originalUrl}`, meta);
        } else {
            logger.info(`${req.method} ${req.originalUrl}`, meta);
        }
    });
    
    next();
}
