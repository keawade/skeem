import type { Rule } from '@angular-devkit/schematics';
import { getOrCreateJsonFile } from '../ast/JsonFile';

/**
 * Updates `.skeemRc.json`'s `generator.currentVersion` property to latest
 * version that was applied, if any version was applied.
 *
 * @param versionsToApply Sorted array of versions to apply
 */
export const bumpSchematicVersion =
  (versionsToApply: string[]): Rule =>
  (tree) => {
    if (versionsToApply.length === 0) {
      return tree;
    }

    const skeemRcJson = getOrCreateJsonFile(tree, '.skeemrc.json');

    // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
    const latestVersion = versionsToApply.pop()!;

    skeemRcJson.modify(['currentVersion'], latestVersion);

    return tree;
  };
