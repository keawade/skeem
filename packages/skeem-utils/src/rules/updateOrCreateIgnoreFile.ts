import type { Rule } from '@angular-devkit/schematics';

/**
 * Update specified ignore file to use the provided list of templated ignore items.
 */
export const updateOrCreateIgnoreFile =
  (
    ignoreFile:
      | '/.gitignore'
      | '/.prettierignore'
      | '/.dockerignore'
      | '/.eslintignore',
    templatedIgnoreItems: string[]
  ): Rule =>
  (tree) => {
    const templatedIgnoreLines = [
      ...templatedIgnoreItems,
      '',
      '# Add custom items below this line',
    ];

    const existingIgnoreFile = tree.get(ignoreFile);

    if (existingIgnoreFile === null) {
      tree.create(ignoreFile, [...templatedIgnoreLines, ''].join('\n'));
    } else {
      const existingIgnoreFileLines = existingIgnoreFile.content
        .toString('utf-8')
        .split('\n');

      const updatedIgnoreLines = Array.from(
        new Set([...templatedIgnoreLines, ...existingIgnoreFileLines])
      );

      tree.overwrite(ignoreFile, [...updatedIgnoreLines, ''].join('\n'));
    }

    return tree;
  };
