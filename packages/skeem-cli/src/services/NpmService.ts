import { Inject, Injectable } from '@nestjs/common';
import { execa, execaSync } from 'execa';
import { eq } from 'semver';
import { LogService } from '../logger/index.js';

type NpmOutdated = {
  current: string;
  wanted: string;
  latest: string;
  dependent: string;
  location: string;
};

@Injectable()
export class NpmService {
  public constructor(@Inject(LogService) private readonly logger: LogService) {}

  public async ensureGlobalPackageInstalled(
    packageName: string,
    version = 'latest'
  ): Promise<void> {
    const targetInstalled = await this.targetInstalled(packageName);

    if (!targetInstalled) {
      this.installGlobalPackage(packageName, version);
    }
  }

  /**
   * Install a package globally
   *
   * @param packageName Name of the package to install
   * @param version Optional version of the package to install
   */
  public async installGlobalPackage(
    packageName: string,
    version = 'latest'
  ): Promise<void> {
    this.logger.debug(
      `Installing package '${packageName}@${version}' globally.`
    );
    await execa('npm', ['install', '--global', `${packageName}@${version}`]);
  }

  public async targetInstalled(
    packageName: string,
    version = 'latest'
  ): Promise<boolean> {
    const { stdout } = await execa('npm', [
      'outdated',
      '--global',
      '--depth=0',
      '--json',
    ]);
    const outdated: Record<string, NpmOutdated> = JSON.parse(stdout);

    if (!outdated[packageName]) {
      return false;
    }

    if (version === 'latest') {
      return eq(outdated[packageName].current, outdated[packageName].latest);
    }

    return eq(outdated[packageName].current, version);
  }

  public get globalRoot(): string {
    return execaSync('npm', ['root', '--global']).stdout;
  }
}
