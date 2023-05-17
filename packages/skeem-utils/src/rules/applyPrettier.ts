import { extname } from 'path';
import type { Rule, Tree } from '@angular-devkit/schematics';
import { default as ignore } from 'ignore';
import { format as prettierFormat } from 'prettier';
import type { Config as PrettierConfig } from 'prettier';
import { format as prettierPackageJsonFormat } from 'prettier-package-json';
import { logger } from '../logger.js';

const FORMATTED_EXTENSIONS = [
  '.tsx',
  '.ts',
  '.jsx',
  '.js',
  '.json',
  '.yml',
  '.yaml',
  '.html',
  '.md',
];

/**
 * Applies the Prettier formatter to all repository files.
 */
export const applyPrettier =
  (): Rule =>
  (tree: Tree): Tree => {
    logger.debug('Formatting files with Prettier');

    let prettierConfig: PrettierConfig;
    const configFile = tree.get('.prettierrc.json');
    if (configFile) {
      logger.debug('Using prettier config from environment.');
      prettierConfig = JSON.parse(configFile.content.toString());
    } else {
      // Use default config if not found for some reason
      logger.debug(
        'Prettier config not found in environment. Using fallback prettier config.'
      );
      prettierConfig = {
        singleQuote: true,
        printWidth: 100,
        proseWrap: 'always',
      };
    }

    // Respect prettier ignore file
    const ignoredFiles: string[] = [];

    const prettierIgnoreRaw = tree.get('.prettierignore');
    if (prettierIgnoreRaw) {
      ignoredFiles.push(
        ...prettierIgnoreRaw.content
          .toString()
          .split('\n')
          .filter((line) => !!line.trim() && !line.trim().startsWith('#'))
      );
    }

    if (ignoredFiles.length === 0) {
      const gitignoreRaw = tree.get('.gitignore');
      if (gitignoreRaw) {
        ignoredFiles.push(
          ...gitignoreRaw.content
            .toString()
            .split('\n')
            .filter((line) => !!line.trim() && !line.trim().startsWith('#'))
        );
      }
    }

    if (ignoredFiles.length === 0) {
      ignoredFiles.push('node_modules', 'coverage', 'test-reports');
    }

    const ignoreInstance = ignore();
    ignoredFiles.forEach((line) => ignoreInstance.add(line));

    logger.debug(`Prettier config: ${JSON.stringify(prettierConfig)}`);
    logger.debug(`Prettier ignore: ${JSON.stringify(ignoredFiles)}`);

    // eslint-disable-next-line complexity
    tree.visit((path) => {
      // Don't touch ignored files
      if (
        ignoreInstance.test(
          // I think it is possible for a path here to not be prepended with `/` but I don't know how to force that state for testing purposes
          /* istanbul ignore next */
          path.startsWith('/') ? path.slice(1) : path
        ).ignored
      ) {
        return;
      }

      if (FORMATTED_EXTENSIONS.includes(extname(path))) {
        const content = tree.read(path);
        if (content) {
          let formatted: string;
          if (path.endsWith('package.json')) {
            formatted = prettierPackageJsonFormat(
              JSON.parse(content.toString()),
              {
                ...prettierConfig,
                expandUsers: true,
              }
            );
          } else {
            /**
             * This workaround will suffice for our current needs.
             *
             * This could be implemented more generically but requires parsing an array of
             * Prettier's overrides which each can contain a `string | string[]` of file globs which
             * gets messy pretty quickly.
             *
             * At time of writing, I didn't consider that effort to be worth the time investment.
             *
             * Note to future devs: If you're updating this to add more items then you should be
             * handling the full implementation hinted at above.
             */
            if (path.endsWith('helmfile.yaml') || path.startsWith('/deploy/')) {
              formatted = prettierFormat(content.toString(), {
                ...prettierConfig,
                bracketSpacing: false,
                filepath: path,
              });
            } else {
              formatted = prettierFormat(content.toString(), {
                ...prettierConfig,
                filepath: path,
              });
            }
          }

          // Don't overwrite tree if there are no changes as the schematic will print that to the console as an update if we do
          if (formatted !== content.toString()) {
            tree.overwrite(path, formatted);
          }
        }
      }

      return false;
    });

    return tree;
  };
