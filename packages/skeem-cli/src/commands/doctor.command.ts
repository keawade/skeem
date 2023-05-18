import { Inject } from '@nestjs/common';
import { Command, CommandRunner } from 'nest-commander';
import { LogService } from '../logger/index.js';
import { default as commandExists } from 'command-exists';
import { execa } from 'execa';
import { gt } from 'semver';

@Command({
  name: 'doctor',
  description: 'check dependency presence',
})
export class DoctorCommand extends CommandRunner {
  private readonly REQUIRED_NPM_VERSION = '7.0.0';

  public constructor(@Inject(LogService) private readonly logger: LogService) {
    super();
  }

  async run() {
    let dependenciesInstalled = false;
    try {
      if (
        (await commandExists('npm')) &&
        gt(
          (await execa('npm', ['--version'])).stdout,
          this.REQUIRED_NPM_VERSION
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
      this.logger.error(
        `npm v${this.REQUIRED_NPM_VERSION}+ required for Skeem.`
      );
    }

    this.logger.success('All prerequisite commands were found.');
  }
}
