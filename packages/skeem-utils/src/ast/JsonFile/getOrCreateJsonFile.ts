import type { Tree } from '@angular-devkit/schematics';
import { JsonFile } from './JsonFile.js';

/**
 * Gets existing JSON file.
 *
 * @param tree Tree to find the file in
 * @param filepath Path of the file to get
 * @param initializationContent Content to create file with if creating
 * @returns JSONFile class instance
 */
export const getOrCreateJsonFile = (
  tree: Tree,
  filepath: string,
  initializationContent: any = {}
): JsonFile => {
  // eslint-disable-next-line security/detect-non-literal-fs-filename
  if (!tree.exists(filepath)) {
    tree.create(filepath, JSON.stringify(initializationContent, null, 2));
  }

  return new JsonFile(tree, filepath);
};
