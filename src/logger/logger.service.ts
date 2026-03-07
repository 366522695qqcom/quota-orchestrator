import { Injectable, LoggerService as NestLoggerService } from '@nestjs/common';
import * as winston from 'winston';

const isVercel = process.env.VERCEL === '1' || process.env.AWS_LAMBDA_FUNCTION_NAME !== undefined;

@Injectable()
export class LoggerService implements NestLoggerService {
  private logger: winston.Logger;

  constructor() {
    const logDir = process.env.LOG_DIR || './logs';

    if (isVercel) {
      this.logger = winston.createLogger({
        level: process.env.LOG_LEVEL || 'info',
        format: winston.format.combine(
          winston.format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),
          winston.format.errors({ stack: true }),
          winston.format.splat(),
          winston.format.json(),
        ),
        defaultMeta: { service: 'quota-orchestrator' },
        transports: [
          new winston.transports.Console({
            format: winston.format.combine(
              winston.format.colorize(),
              winston.format.printf(({ level, message, timestamp, context }) => {
                return `${timestamp} [${context}] ${level}: ${message}`;
              }),
            ),
          }),
        ],
      });
    } else {
      const DailyRotateFile = require('winston-daily-rotate-file');
      this.logger = winston.createLogger({
        level: process.env.LOG_LEVEL || 'info',
        format: winston.format.combine(
          winston.format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),
          winston.format.errors({ stack: true }),
          winston.format.splat(),
          winston.format.json(),
        ),
        defaultMeta: { service: 'quota-orchestrator' },
        transports: [
          new winston.transports.Console({
            format: winston.format.combine(
              winston.format.colorize(),
              winston.format.printf(({ level, message, timestamp, context }) => {
                return `${timestamp} [${context}] ${level}: ${message}`;
              }),
            ),
          }),
          new DailyRotateFile({
            dirname: logDir,
            filename: 'application-%DATE%.log',
            datePattern: 'YYYY-MM-DD',
            maxSize: '20m',
            maxFiles: '14d',
          }),
          new DailyRotateFile({
            dirname: logDir,
            filename: 'error-%DATE%.log',
            datePattern: 'YYYY-MM-DD',
            level: 'error',
            maxSize: '20m',
            maxFiles: '30d',
          }),
        ],
      });
    }
  }

  private sanitizeMessage(message: any): any {
    if (typeof message === 'string') {
      // 脱敏密码
      message = message.replace(/"password":\s*"[^"]*"/g, '"password":"***"');
      message = message.replace(/password=([^&]*)/g, 'password=***');
      // 脱敏令牌
      message = message.replace(/"token":\s*"[^"]*"/g, '"token":"***"');
      message = message.replace(/token=([^&]*)/g, 'token=***');
      // 脱敏邮箱
      message = message.replace(/([a-zA-Z0-9._%+-]+)@([a-zA-Z0-9.-]+\.[a-zA-Z]{2,})/g, '***@***');
      // 脱敏手机号
      message = message.replace(/1[3-9]\d{9}/g, '1***');
      // 脱敏身份证号
      message = message.replace(/[1-9]\d{5}(19|20)\d{2}(0[1-9]|1[0-2])(0[1-9]|[12]\d|3[01])\d{3}[0-9Xx]/g, '***');
      // 脱敏 API Key
      message = message.replace(/"apiKey":\s*"[^"]*"/g, '"apiKey":"***"');
      message = message.replace(/apiKey=([^&]*)/g, 'apiKey=***');
      return message;
    } else if (typeof message === 'object' && message !== null) {
      const sanitized = { ...message };
      Object.keys(sanitized).forEach(key => {
        if (typeof sanitized[key] === 'string') {
          sanitized[key] = this.sanitizeMessage(sanitized[key]);
        } else if (typeof sanitized[key] === 'object' && sanitized[key] !== null) {
          sanitized[key] = this.sanitizeMessage(sanitized[key]);
        }
      });
      return sanitized;
    }
    return message;
  }

  log(message: any, context?: string) {
    const sanitizedMessage = this.sanitizeMessage(message);
    this.logger.info(sanitizedMessage, { context });
  }

  error(message: any, trace?: string, context?: string) {
    const sanitizedMessage = this.sanitizeMessage(message);
    this.logger.error(sanitizedMessage, { trace, context });
  }

  warn(message: any, context?: string) {
    const sanitizedMessage = this.sanitizeMessage(message);
    this.logger.warn(sanitizedMessage, { context });
  }

  debug(message: any, context?: string) {
    const sanitizedMessage = this.sanitizeMessage(message);
    this.logger.debug(sanitizedMessage, { context });
  }

  verbose(message: any, context?: string) {
    const sanitizedMessage = this.sanitizeMessage(message);
    this.logger.verbose(sanitizedMessage, { context });
  }
}