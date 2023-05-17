import { LogService } from './LogService.js';

const logger = new LogService();

export const handleError = (error: string | Error | any): never => {
  if (error instanceof Error) {
    logger.error(error.message, error.stack);
    process.exit(1);
  }

  if (typeof error === 'string') {
    logger.error(error);
    process.exit(1);
  }

  logger.error(`Unknown error: ${JSON.stringify(error)}`);
  process.exit(1);
};
