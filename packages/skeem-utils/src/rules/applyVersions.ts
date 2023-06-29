import type { Rule, SchematicContext } from '@angular-devkit/schematics';
import { chain, Tree, callRule } from '@angular-devkit/schematics';
import type { Observable } from 'rxjs';
import type { VersionDefinition } from '../types/VersionDefinition.js';
import type { BaseSkeemSchematicOptions } from '../types/BaseSkeemSchematicOptions.js';
import { logger } from '../logger.js';

const wrapRuleWithLogs =
  (identifier: string, rule: Rule): Rule =>
  (tree: Tree, context: SchematicContext): Observable<Tree> => {
    logger.verbose(`Applying ${identifier}`);

    return callRule(rule, tree, context);
  };

/**
 * Applies all version rules in provided order as needed.
 */
export const applyVersions = <T extends BaseSkeemSchematicOptions>(
  /**
   * Sorted array of versions
   */
  versionsToApply: Array<[string, VersionDefinition<T>]>,
  options: T
): Rule => {
  if (versionsToApply.length === 0) {
    logger.success('Already up to date!');
  } else {
    if (options.fromVersion !== '0.0.0') {
      logger.info(
        // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
        `Updating from '${options.fromVersion}' to '${
          versionsToApply.slice(-1).pop()![0]
        }'.`
      );
    } else {
      logger.info(`Creating new repo.`);
    }
  }

  logger.debug(
    `Versions to apply: [ ${versionsToApply
      .map(([version]) => version)
      .join(', ')} ]`
  );

  return chain(
    versionsToApply.map(([version, versionImplementation]) =>
      wrapRuleWithLogs(version, versionImplementation(options))
    )
  );
};
