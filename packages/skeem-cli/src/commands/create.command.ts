import { Command, CommandRunner, Option } from 'nest-commander';
import { LogService } from '../logger/index.js';
import { Inject } from '@nestjs/common';
import { TemplateService } from '../services/TemplateService.js';

interface IOptions {
  forceToVersion?: string;
  version: string;
  localPath: boolean;
  dryRun: boolean;
}

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
    @Inject(TemplateService) private readonly template: TemplateService
  ) {
    super();
  }

  async run(args: [schematic: string], options: IOptions): Promise<any> {
    this.logger.info(
      `args: ${JSON.stringify(args)}, options: ${JSON.stringify(options)}`
    );
    const [schematic] = args;

    await this.template.create(schematic, options);

    // TODO: Create/update the .skeemrc file
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
}
