import { Command, CommandRunner, Option } from 'nest-commander';
import { LogService } from '../logger';
import { Inject } from '@nestjs/common';

interface IOptions {}

@Command({
  name: 'update',
  description: 'update a scaffolded project',
})
export class UpdateCommand extends CommandRunner {
  public constructor(@Inject(LogService) private readonly logger: LogService) {
    super();
  }

  async run(_inputs: string[], options: IOptions): Promise<any> {
    this.command.help();
  }
}
