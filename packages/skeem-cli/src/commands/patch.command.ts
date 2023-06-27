import { Command, CommandRunner, Option } from 'nest-commander';
import { LogService } from '../logger/index.js';
import { Inject } from '@nestjs/common';
import { TemplateService } from '../services/TemplateService.js';
import { ConfigService } from '../services/ConfigService.js';

type PatchOptions = {
  version: string;
  localPath: boolean;
  dryRun: boolean;
  schematicOptions?: Record<string, any>;
};

@Command({
  name: 'patch',
  description: 'apply a schematic as a one-off patch',
  arguments: '<schematic>',
  argsDescription: {
    schematic: 'name of skeem schematic package',
  },
})
export class PatchCommand extends CommandRunner {
  public constructor(
    @Inject(LogService) private readonly logger: LogService,
    @Inject(ConfigService) private readonly config: ConfigService,
    @Inject(TemplateService) private readonly template: TemplateService
  ) {
    super();
  }

  async run(args: [schematic: string], options: PatchOptions): Promise<void> {
    const config = await this.config.get();

    this.logger.info(`args: ${JSON.stringify(args)}`);
    this.logger.info(`options: ${JSON.stringify(options)}`);
    this.logger.info(`config: ${JSON.stringify(config)}`);

    const [schematic] = args;

    await this.template.patch(schematic, options, config);

    await this.config.updateConfigFile({
      ...config,
      history: [
        ...(config?.history ?? []),
        {
          type: 'patch',
          schematic,
          version: options.version,
        },
      ],
    });
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
