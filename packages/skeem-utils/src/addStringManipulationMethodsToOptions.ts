import { strings } from '@angular-devkit/core';
import type { SchematicOptions } from './interfaces/SchematicOptions.js';
import { stringify } from './stringify.js';

type FullSchematicOptions<T extends SchematicOptions> = T &
  typeof strings & { stringify: typeof stringify };

/**
 * Returns the provided schematic options with the Schematic's strings functions
 * and our `stringify` function included.
 *
 * Intended to prepare options for being interpolated into templated files.
 */
export const addStringManipulationMethodsToOptions = <
  T extends SchematicOptions
>(
  options: T
): FullSchematicOptions<T> => ({
  ...strings,
  stringify,
  ...options,
});
