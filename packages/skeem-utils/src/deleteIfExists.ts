import type { Tree } from '@angular-devkit/schematics';

/**
 * Delete a path from tree.
 *
 * Does not throw if path already does not exist.
 */
export const deleteIfExists = (tree: Tree, path: string): void => {
  try {
    return tree.delete(path);
  } catch {
    // Do nothing
  }
};
