import type { LoggerService } from '@nestjs/common';
import { Injectable } from '@nestjs/common';
import chalk from 'chalk';
import { default as asTable } from 'as-table';
import winston from 'winston';
import 'winston-daily-rotate-file';
import { getEnvPaths } from './getEnvPaths.js';

export const consoleFormat = (
  info: winston.Logform.TransformableInfo
): string => {
  switch (info.level) {
    case 'error':
      return `${chalk.red('✘')} ${info.message}`;
    case 'warn':
      return `${chalk.yellow('⚠')} ${info.message}`;
    case 'info':
      return `${chalk.blue('ℹ')} ${info.message}`;
    case 'success':
      return `${chalk.green('✔')} ${info.message}`;
    case 'verbose':
      return `${chalk.cyan('☰')} ${info.message}`;
    case 'debug':
      return `${chalk.gray('•')} ${info.message}`;
    case 'table':
      return asTable((info as any).tableData);
    case 'raw':
    default:
      return info.message;
  }
};

@Injectable()
export class LogService implements LoggerService {
  public constructor() {
    process.on('SIGPIPE', process.exit);
  }

  private context?: string;

  private readonly levels = {
    raw: 0,
    error: 0,
    warn: 1,
    info: 2,
    success: 2,
    table: 2,
    verbose: 2,
    debug: 3,
  };

  private getLogLevelFromEnvOrDefault() {
    return process.env?.['SKEEM_LOG_LEVEL'] || 'info';
  }

  private readonly logger = winston.createLogger({
    levels: this.levels,
    transports: [
      new winston.transports.Console({
        level: this.getLogLevelFromEnvOrDefault(),
        format: winston.format.combine(
          winston.format.splat(),
          winston.format.printf(consoleFormat)
        ),
      }),
      new winston.transports.DailyRotateFile({
        dirname: getEnvPaths().log,
        filename: 'skeem-%DATE%.log',
        format: winston.format.combine(
          winston.format.timestamp(),
          winston.format.prettyPrint(),
          winston.format.json(),
          winston.format.uncolorize()
        ),
        level: 'debug',
      }),
    ],
  });

  public setContext(context?: string): void {
    if (context) {
      this.context = context;
    }
  }

  /**
   * Prints undecorated output to the console at the highest log level so it
   * will always display.
   *
   * Can be used for printing output to be piped into other commands.
   *
   * WARNING: Do not log anything else in your command if you want to pipe
   * output this way! All output that goes to the console will be piped, not
   * just output logged with this function.
   */
  public raw(message: string, context?: string): void {
    context = context || this.context;

    this.logger.log('raw', message, { context });
    return;
  }

  public error(
    message: string | Error,
    trace?: string,
    context?: string
  ): void {
    context = context || this.context;

    if (message instanceof Error) {
      const { message: msg, name, stack, ...meta } = message;

      this.logger.error(msg, {
        context,
        stack: [trace || message.stack],
        ...meta,
      });
      return;
    }

    this.logger.error(message, { context, stack: [trace] });
    return;
  }

  public warn(message: string, context?: string): void {
    context = context || this.context;

    this.logger.warn(message, { context });
    return;
  }

  public log(message: string, context?: string): void {
    context = context || this.context;

    this.logger.info(message, { context });
    return;
  }

  public info(message: string, context?: string): void {
    context = context || this.context;

    this.logger.info(message, { context });
    return;
  }

  public success(message: string, context?: string): void {
    context = context || this.context;

    this.logger.log('success', message, { context });
    return;
  }

  public table(data: any[][], context?: string): void {
    context = context || this.context;

    this.logger.log('table', '', { tableData: data, context });
    return;
  }

  public verbose(message: string, context?: string): void {
    context = context || this.context;

    this.logger.verbose(message, { context });
    return;
  }

  public debug(message: string, context?: string): void {
    context = context || this.context;

    this.logger.debug(message, { context });
    return;
  }
}
