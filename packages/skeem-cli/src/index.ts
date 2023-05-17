#!/usr/bin/env node
import { handleError } from './logger';
import { CommandFactory } from 'nest-commander';
import { CliModule } from './cli.module.js';

const bootstrap = async () => {
  try {
    await CommandFactory.run(CliModule, {
      usePlugins: true,
      cliName: 'skeem',
      logger: (process.env['DEBUG'] === 'true' ? undefined : false) as false,
    });
  } catch (err) {
    handleError(err);
  }
};

bootstrap();
