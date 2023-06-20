import { Command, CommandRunner, Option } from 'nest-commander';
import { LogService } from '../logger/index.js';
import { Inject } from '@nestjs/common';
import { ConfigService } from '../services/ConfigService.js';
import { TemplateService } from '../services/TemplateService.js';

type UpdateOptions = {
  forceToVersion?: string;
  version: string;
  localPath: boolean;
  dryRun: boolean;
  schematicOptions?: Record<string, any>;
};

@Command({
  name: 'update',
  description: 'update a scaffolded project',
})
export class UpdateCommand extends CommandRunner {
  public constructor(
    @Inject(LogService) private readonly logger: LogService,
    @Inject(ConfigService) private readonly config: ConfigService,
    @Inject(TemplateService) private readonly template: TemplateService
  ) {
    super();
  }

  async run(args: string[], options: UpdateOptions): Promise<any> {
    const config = await this.config.get();

    if (!config) {
      throw new Error('Unable to update directory without Skeem config');
    }

    this.logger.info(`args: ${JSON.stringify(args)}`);
    this.logger.info(`options: ${JSON.stringify(options)}`);
    this.logger.info(`config: ${JSON.stringify(config)}`);

    // TODO: config.schematicPackage may not be quite right
    const schematic = args[0] ?? config.schematicPackage;

    await this.template.update(options, config);

    await this.config.updateConfigFile({
      ...config,
      history: [
        ...config?.history,
        {
          type: 'patch',
          schematic,
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
