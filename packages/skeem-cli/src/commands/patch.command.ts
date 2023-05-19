import { Command, CommandRunner, Option } from 'nest-commander';
import { LogService } from '../logger/index.js';
import { Inject } from '@nestjs/common';

type Options = {};

@Command({
  name: 'patch',
  description: 'apply an arbitrary schematic',
})
export class PatchCommand extends CommandRunner {
  public constructor(@Inject(LogService) private readonly logger: LogService) {
    super();
  }

  async run(_inputs: string[], options: Options): Promise<any> {
    this.logger.info('patch');
  }
}
