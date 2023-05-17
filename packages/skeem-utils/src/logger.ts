import type { TransformableInfo } from 'logform';
import * as winston from 'winston';

export interface ISchematicLogger extends winston.Logger {
  success: (message: string, ...meta: any[]) => ISchematicLogger;
  rule: (message: string, ...meta: any[]) => ISchematicLogger;
}

export const logFormatter = (info: TransformableInfo): string => {
  return (levelFormatters as any)[info.level](info.message);
};

export const levelFormatters = {
  error: (message: string): string => `🚫 ${message}`,
  warn: (message: string): string => `⚠️  ${message}`,
  info: (message: string): string => `ℹ️  ${message}`,
  success: (message: string): string => `✅ ${message}`,
  verbose: (message: string): string => `📝 ${message}`,
  rule: (message: string): string => `⚖️ ${message}`,
  debug: (message: string): string => `🐛 ${message}`,
  silly: (message: string): string => `💩 ${message}`,
};

// eslint-disable-next-line complexity
export const setLogLevel = (
  level: string | undefined,
  defaultLevel: string = 'info'
): string => {
  switch (level) {
    case 'error':
    case 'warn':
    case 'info':
    case 'success':
    case 'verbose':
    case 'rule':
    case 'debug':
    case 'silly':
      return level;
    default:
      return defaultLevel;
  }
};

/**
 * Singleton logger utility
 */
export const logger = winston.createLogger({
  levels: {
    error: 0,
    warn: 1,
    info: 2,
    success: 2,
    verbose: 3,
    rule: 4,
    debug: 5,
    silly: 6,
  },
  transports: [
    new winston.transports.Console({
      format: winston.format.combine(
        winston.format.splat(),
        winston.format.printf(logFormatter)
      ),
    }),
  ],
  level: setLogLevel(
    /* istanbul ignore next */
    process.env.SKEEM_LOG_LEVEL
  ),
}) as ISchematicLogger;
