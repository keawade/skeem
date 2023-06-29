import { type Rule, chain } from '@angular-devkit/schematics';
import { strings } from '@angular-devkit/core';
import {
  addInstallTask,
  applyPrettier,
  applyVersions,
  bumpSchematicVersion,
  filterVersionsToApply,
  logger,
} from 'skeem-utils';
import { versions } from './versions';
import {
  type ExpressSchematicOptions,
  expressSchematicOptionsSchema,
} from './ExpressSchematicOptions.js';

export const main = (options: ExpressSchematicOptions): Rule => {
  const collectedOptions = collectOptions(options);

  const versionsToApply = filterVersionsToApply(
    versions,
    options.fromVersion,
    options.toVersion
  );

  // TODO: Check for no layers to apply _but_ npm package version suggests there should be a layer and warn the user

  return chain([
    // These first two rules are necessary for the version layering to work.
    applyVersions(versionsToApply, collectedOptions),
    bumpSchematicVersion(versionsToApply.map(([version]) => version)),
    // All the other rules are optional. You can also create your own custom
    // rules and add them here if you want them run after all version layers
    // have been applied.
    addInstallTask(),
    applyPrettier,
  ]);
};

/**
 * Returns updated options object.
 */
const collectOptions = (
  options: Partial<ExpressSchematicOptions>
): ExpressSchematicOptions => {
  const target: any = { ...options };

  // Configure path and prerequisites
  target.name = strings.camelize(target.name);

  logger.debug(`Options:\n${JSON.stringify(target, null, 2)}`);

  return expressSchematicOptionsSchema.parse(target);
};
