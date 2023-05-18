import { Inject } from '@nestjs/common';
import { Command, CommandRunner } from 'nest-commander';
import { LogService } from '../logger/index.js';
import commandExists from 'command-exists';
import { execa } from 'execa';
import semver from 'semver';

const REQUIRED_NPM_VERSION = '7.0.0';

@Command({
  name: 'doctor',
  description: 'check dependency presence',
})
export class DoctorCommand extends CommandRunner {
  constructor(@Inject(LogService) private readonly logger: LogService) {
    super();
  }

  async run() {
    let dependenciesInstalled = false;
    try {
      if (
        (await commandExists('npm')) &&
        semver.gt(
          (await execa('npm', ['--version'])).stdout,
          REQUIRED_NPM_VERSION
        )
      ) {
        dependenciesInstalled = true;
      }
    } catch (err) {
      if (err instanceof Error) {
        this.logger.debug(err.stack ?? 'Error checking npm version');
      }
    }

    if (!dependenciesInstalled) {
      this.logger.error(`npm v${REQUIRED_NPM_VERSION}+ required for skeem.`);
    }

    this.logger.success('All prerequisite commands were found.');
  }
}
