import { Command, CommandRunner } from 'nest-commander';
import { LogService } from '../logger';
import { Inject } from '@nestjs/common';

interface IOptions {}

@Command({
  name: 'create',
  description: 'scaffold a project',
})
export class CreateCommand extends CommandRunner {
  public constructor(@Inject(LogService) private readonly logger: LogService) {
    super();
  }

  async run(_inputs: string[], options: IOptions): Promise<any> {
    this.command.help();
  }
}
