import { LogService } from './logger';
import { Module } from '@nestjs/common';
import { CreateCommand } from './commands/create.command.js';
import { UpdateCommand } from './commands/update.command.js';
import { PatchCommand } from './commands/patch.command.js';

@Module({
  providers: [CreateCommand, UpdateCommand, PatchCommand, LogService],
})
export class CliModule {}
