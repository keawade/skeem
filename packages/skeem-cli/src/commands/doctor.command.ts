import { Inject } from '@nestjs/common';
import { Command, CommandRunner } from 'nest-commander';
import { LogService } from '../logger/index.js';
import { gt } from 'semver';
import { NpmService } from '../services/NpmService.js';

@Command({
  name: 'doctor',
  description: 'check dependency presence',
})
export class DoctorCommand extends CommandRunner {
  private readonly REQUIRED_NPM_VERSION = '7.0.0';

  public constructor(
    @Inject(LogService) private readonly logger: LogService,
    @Inject(NpmService) private readonly npm: NpmService
  ) {
    super();
  }

  async run() {
    let dependenciesInstalled = gt(
      await this.npm.getInstalledVersion(),
      this.REQUIRED_NPM_VERSION
    );

    if (!dependenciesInstalled) {
      throw new Error(`npm v${this.REQUIRED_NPM_VERSION}+ required for Skeem.`);
    }

    this.logger.success('All prerequisite commands were found.');
  }
}
