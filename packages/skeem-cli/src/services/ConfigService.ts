import { Inject, Injectable } from '@nestjs/common';
import { cosmiconfig, type PublicExplorer } from 'cosmiconfig';
import { LogService } from '../logger/index.js';
import { z } from 'zod';

// const SkeemHistorySchema = z.object({
//   type: z.union([z.literal('create'), z.literal('update'), z.literal('patch')]),
//   schemaGitUrl: z.string().optional(),
//   version: z.string(),
// });

const SkeemConfigSchema = z.object({
  schematicPackage: z.string(),
  currentVersion: z.string(),
  // history: z.array(SkeemHistorySchema),
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
}