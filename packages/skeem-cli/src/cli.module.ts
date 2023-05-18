import { LogService } from './logger/index.js';
import { Module } from '@nestjs/common';
import { CreateCommand } from './commands/create.command.js';
import { UpdateCommand } from './commands/update.command.js';
import { PatchCommand } from './commands/patch.command.js';
import { DoctorCommand } from './commands/doctor.command.js';
import { NpmService } from './services/NpmService.js';
import { ConfigService } from './services/ConfigService.js';
import { TemplateService } from './services/TemplateService.js';
import { SchematicService } from './services/SchematicService.js';

@Module({
  providers: [
    CreateCommand,
    UpdateCommand,
    PatchCommand,
    DoctorCommand,
    LogService,
    ConfigService,
    NpmService,
    TemplateService,
    SchematicService,
  ],
})
export class CliModule {}
