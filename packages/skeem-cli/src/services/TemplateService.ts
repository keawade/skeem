import { Inject, Injectable } from '@nestjs/common';
import { SchematicService } from './SchematicService.js';
import { LogService } from '../logger/index.js';
import type { SkeemConfig } from './ConfigService.js';
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

type TemplatePatchOptions = {
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
  }

  public async update(
    options: TemplateUpdateOptions,
    config: SkeemConfig
  ): Promise<void> {
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

  public async patch(
    schematic: string,
    options: TemplatePatchOptions,
    config: SkeemConfig | null
  ): Promise<void> {
    this.schematicService.setTargetCollectionAndSchematic(schematic);

    if (!options.localPath) {
      await this.npm.ensureGlobalPackageInstalled(
        this.schematicService.collectionName!,
        options.version
      );
    }

    await this.schematicService.applySchematic('.', {
      ...config,
      dryRun: options.dryRun,
    });
  }
}
