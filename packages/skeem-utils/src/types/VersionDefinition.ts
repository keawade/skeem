import type { Rule } from '@angular-devkit/schematics';
import type { BaseSkeemSchematicOptions } from './BaseSkeemSchematicOptions.js';

export type VersionDefinition<T extends BaseSkeemSchematicOptions> = (
  options: T
) => Rule;
