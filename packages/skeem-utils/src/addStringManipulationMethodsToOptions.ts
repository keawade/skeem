import { strings } from '@angular-devkit/core';
import type { BaseSkeemSchematicOptions } from './types/BaseSkeemSchematicOptions.js';
import { stringify } from './stringify.js';

type FullSchematicOptions<T extends BaseSkeemSchematicOptions> = T &
  typeof strings & { stringify: typeof stringify };

/**
 * Returns the provided schematic options with the Schematic's strings functions
 * and our `stringify` function included.
 *
 * Intended to prepare options for being interpolated into templated files.
 */
export const addStringManipulationMethodsToOptions = <
  T extends BaseSkeemSchematicOptions
>(
  options: T
): FullSchematicOptions<T> => ({
  ...strings,
  stringify,
  ...options,
});
