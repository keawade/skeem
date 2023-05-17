import type { Tree } from '@angular-devkit/schematics';
import { Document as YamlDocument } from 'yaml';
import { YamlFile } from './YamlFile.js';

/**
 * Gets existing JSON file.
 *
 * @param tree Tree to find the file in
 * @param filepath Path of the file to get
 * @param initializationContent Content to create file with if creating
 * @returns YamlFile class instance
 */
export const getOrCreateYamlFile = (
  tree: Tree,
  filepath: string,
  initializationContent: any = {}
): YamlFile => {
  // eslint-disable-next-line security/detect-non-literal-fs-filename
  if (!tree.exists(filepath)) {
    tree.create(
      filepath,
      typeof initializationContent === 'string'
        ? initializationContent
        : new YamlDocument(initializationContent).toString()
    );
  }

  return new YamlFile(tree, filepath);
};
