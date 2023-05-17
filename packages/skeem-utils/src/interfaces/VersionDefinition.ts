import type { Rule } from '@angular-devkit/schematics';
import type { SchematicOptions } from './SchematicOptions.js';

export type VersionDefinition<T extends SchematicOptions> = (
  options: T
) => Rule;
