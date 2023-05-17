import type { Rule } from '@angular-devkit/schematics';
import { NodePackageInstallTask } from '@angular-devkit/schematics/tasks';
import { logger } from '../logger.js';

/**
 * Adds a task to run npm install if we've touched package.json.
 */
export const addInstallTask = (): Rule => (tree, context) => {
  const touchedPaths: string[] = tree.actions.map((action) => action.path);

  if (touchedPaths.includes('/package.json')) {
    logger.debug('Adding npm install task');
    context.addTask(
      new NodePackageInstallTask({
        packageManager: 'npm',
        quiet: true,
        hideOutput: true,
      })
    );
  }
};
