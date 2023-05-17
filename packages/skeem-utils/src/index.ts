export type { SchematicOptions } from './interfaces/SchematicOptions.js';
export type { VersionDefinition } from './interfaces/VersionDefinition.js';

export * from './dependencies.js';
export * from './ast/JsonFile';
export * from './ast/YamlFile';
export * from './rules';

export { addStringManipulationMethodsToOptions } from './addStringManipulationMethodsToOptions.js';
export { deleteIfExists } from './deleteIfExists.js';
export { filterVersionsToApply } from './filterVersionsToApply.js';
export { logger } from './logger.js';
export { stringify } from './stringify.js';
