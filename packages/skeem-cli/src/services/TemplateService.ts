import { Inject, Injectable } from '@nestjs/common';
import { SchematicService } from './SchematicService.js';
import { LogService } from '../logger/index.js';
import { ConfigService } from './ConfigService.js';
import { NpmService } from './NpmService.js';

type TemplateCreateOptions = {
  dryRun: boolean;
  version: string;
  forceToVersion?: string;
  localPath: boolean;
};

type TemplateUpdateOptions = {
  dryRun?: boolean;
  schematic?: string;
  localPath: boolean;
  forceFromVersion?: string;
  forceToVersion?: string;
  version: string;
};

@Injectable()
export class TemplateService {
  public constructor(
    @Inject(LogService) private readonly logger: LogService,
    @Inject(SchematicService)
    private readonly schematicService: SchematicService,
    @Inject(ConfigService) private readonly config: ConfigService,
    @Inject(NpmService) private readonly npm: NpmService
  ) {}

  public async create(
    schematic: string,
    options: TemplateCreateOptions
  ): Promise<void> {
    if (!options.localPath) {
      await this.npm.ensureGlobalPackageInstalled(schematic, options.version);
    }

    this.schematicService.setTargetCollectionAndSchematic(`${schematic}:base`);

    const path = process.cwd();

    await this.schematicService.applySchematic(path, {
      dryRun: options.dryRun,
      fromVersion: '0.0.0',
      toVersion: options.forceToVersion ?? 'latest',
    });

    await this.config.updateConfigFile({
      schematicPackage: schematic,
      currentVersion: await this.npm.getGlobalPackageVersion(schematic),
    });
  }

  public async update(options: TemplateUpdateOptions): Promise<void> {
    const config = await this.config.get();

    if (!config) {
      throw new Error('Skeem config not found.');
    }

    this.schematicService.setTargetCollectionAndSchematic(
      options.schematic ?? config.schematicPackage
    );

    await this.schematicService.updateInstalledSchematic(options.version);

    await this.schematicService.applySchematic('.', {
      ...config,
      fromVersion: options.forceFromVersion,
      toVersion: options.forceToVersion,
      dryRun: options.dryRun,
    });
  }
}
