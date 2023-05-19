import { Command, CommandRunner, Option } from 'nest-commander';
import { LogService } from '../logger/index.js';
import { Inject } from '@nestjs/common';

type Options = {};

@Command({
  name: 'update',
  description: 'update a scaffolded project',
})
export class UpdateCommand extends CommandRunner {
  public constructor(@Inject(LogService) private readonly logger: LogService) {
    super();
  }

  async run(_inputs: string[], options: Options): Promise<any> {
    this.logger.info('update');
  }
}
