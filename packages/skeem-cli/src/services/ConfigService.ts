import { Inject, Injectable } from '@nestjs/common';
import { cosmiconfig, type PublicExplorer } from 'cosmiconfig';
import { LogService } from '../logger/index.js';
import { z } from 'zod';
import { writeFile } from 'fs/promises';
import { join as pathJoin } from 'path';

const SkeemHistorySchema = z.object({
  type: z.union([z.literal('create'), z.literal('update'), z.literal('patch')]),
  schematic: z.string().optional(),
  version: z.string(), // TODO: Make sure we put `toVersion` here and not the library version
});

const SkeemConfigSchema = z.object({
  schematicPackage: z.string(),
  currentVersion: z.string(),
  history: z.array(SkeemHistorySchema),
});

export type SkeemConfig = z.infer<typeof SkeemConfigSchema>;

@Injectable()
export class ConfigService {
  private explorer: PublicExplorer;

  public constructor(@Inject(LogService) private readonly logger: LogService) {
    this.explorer = cosmiconfig('skeem');
  }

  public async get(): Promise<SkeemConfig | null> {
    const searchResult = await this.explorer.search();
    if (searchResult) {
      this.logger.debug(`Found config at '${searchResult.filepath}'.`);

      return SkeemConfigSchema.parse(searchResult.config);
    }

    return null;
  }

  public async getPath(): Promise<string | null> {
    const searchResult = await this.explorer.search();
    if (searchResult) {
      return searchResult.filepath;
    }

    return null;
  }

  public async updateConfigFile(
    config: Partial<SkeemConfig>,
    dir = '.'
  ): Promise<void> {
    await writeFile(pathJoin(dir, '.skeemrc'), JSON.stringify(config, null, 2));
  }
}
