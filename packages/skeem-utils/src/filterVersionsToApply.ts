import {
  compareBuild as sortBySemver,
  gt as semverGreaterThan,
  lte as semverLessThanOrEqual,
} from 'semver';
import type { SchematicOptions } from './types/SchematicOptions.js';
import type { VersionDefinition } from './types/VersionDefinition.js';

/**
 * Reads a record of version + Rules returning an array of version + Rule tuples
 * to be applied according to provided fromVersion and toVersion.
 *
 * @param allVersions All versions that could be applied
 * @param fromVersion Version to start after (non-inclusive)
 * @param toVersion Version to stop with (inclusive)
 */
export const filterVersionsToApply = <T extends SchematicOptions>(
  allVersions: Record<string, VersionDefinition<T>>,
  fromVersion: string,
  toVersion: string
): Array<[string, VersionDefinition<T>]> => {
  let versionsToApply = (
    Object.entries(allVersions) as Array<[string, VersionDefinition<T>]>
  ).sort(([a], [b]) => sortBySemver(a, b));

  versionsToApply = versionsToApply.filter(
    ([version]) =>
      semverGreaterThan(version, fromVersion) &&
      (toVersion === 'latest' || semverLessThanOrEqual(version, toVersion))
  );

  return versionsToApply;
};
