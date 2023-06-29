import { Command, CommandRunner, Option } from 'nest-commander';
import { LogService } from '../logger/index.js';
import { Inject } from '@nestjs/common';
import { TemplateService } from '../services/TemplateService.js';
import { ConfigService } from '../services/ConfigService.js';
import { NpmService } from '../services/NpmService.js';

type CreateOptions = {
  forceToVersion?: string;
  version: string;
  localPath: boolean;
  dryRun: boolean;
  schematicOptions?: Record<string, any>;
};

@Command({
  name: 'create',
  description: 'scaffold a project',
  arguments: '<schematic>',
  argsDescription: {
    schematic: 'name of skeem schematic package',
  },
})
export class CreateCommand extends CommandRunner {
  public constructor(
    @Inject(LogService) private readonly logger: LogService,
    @Inject(ConfigService) private readonly config: ConfigService,
    @Inject(NpmService) private readonly npm: NpmService,
    @Inject(TemplateService) private readonly template: TemplateService
  ) {
    super();
  }

  async run(args: [schematic: string], options: CreateOptions): Promise<void> {
    this.logger.info(
      `args: ${JSON.stringify(args)}, options: ${JSON.stringify(options)}`
    );
    const [schematic] = args;

    this.logger.info('Calling template.create');
    await this.template.create(schematic, options);

    this.logger.info('updating config file');
    await this.config.updateConfigFile({
      schematicPackage: schematic,
      currentVersion: await this.npm.getGlobalPackageVersion(schematic),
      history: [
        {
          type: 'create',
          version: options.version,
        },
      ],
    });
  }

  @Option({
    flags: '--force-to-version <version>',
    description: 'semver version string of target ending version to be applied',
  })
  public parseForceToVersion(value: string): string {
    return value;
  }

  @Option({
    flags: `-v, --version <version|tag>`,
    description: 'semver version string of target schematic library',
    defaultValue: 'latest',
  })
  public parseVersion(value: string): string {
    return value;
  }

  @Option({
    flags: '--local-path',
    description:
      'treat name arg as a local file path instead of npm package name',
    defaultValue: false,
  })
  public parseLocalPath(): boolean {
    return true;
  }

  @Option({
    flags: '--dry-run',
    defaultValue: false,
  })
  public parseDryRun(): boolean {
    return true;
  }

  @Option({
    flags: '--schematic-options <json-string>',
    description:
      'stringified json object of options to pass to the schematic execution',
  })
  public parseSchematicOptionsValue(value: string): Record<string, any> {
    return JSON.parse(value);
  }
}
