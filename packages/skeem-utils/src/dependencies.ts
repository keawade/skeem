import type { Tree } from '@angular-devkit/schematics';
import { JsonFile } from './ast/JsonFile';

// Originally pulled from MIT licensed file: https://github.com/angular/angular-cli/blob/37a06a7c37f5b4286d58b475e6e12c86f00fac5b/packages/schematics/angular/utility/dependencies.ts

const PKG_JSON_PATH = '/package.json';

export enum NodeDependencyType {
  Default = 'dependencies',
  Dev = 'devDependencies',
  Peer = 'peerDependencies',
  Optional = 'optionalDependencies',
}

export interface NodeDependency {
  type: NodeDependencyType;
  name: string;
  version: string;
  overwrite?: boolean;
}

const ALL_DEPENDENCY_TYPE = [
  NodeDependencyType.Default,
  NodeDependencyType.Dev,
  NodeDependencyType.Optional,
  NodeDependencyType.Peer,
];

/**
 * Original: https://github.com/angular/angular-cli/blob/37a06a7c37f5b4286d58b475e6e12c86f00fac5b/packages/schematics/angular/utility/dependencies.ts#L34-L46
 */
export const addPackageJsonDependency = (
  tree: Tree,
  dependency: NodeDependency,
  pkgJsonPath = PKG_JSON_PATH
): void => {
  const json = new JsonFile(tree, pkgJsonPath);

  const { overwrite, type, name, version } = dependency;
  const path = [type, name];
  if (overwrite || !json.get(path)) {
    json.modify(path, version);
  }
};

/**
 * Original: https://github.com/angular/angular-cli/blob/37a06a7c37f5b4286d58b475e6e12c86f00fac5b/packages/schematics/angular/utility/dependencies.ts#L48-L58
 */
export const removePackageJsonDependency = (
  tree: Tree,
  name: string,
  pkgJsonPath = PKG_JSON_PATH
): void => {
  const json = new JsonFile(tree, pkgJsonPath);

  for (const depType of ALL_DEPENDENCY_TYPE) {
    json.remove([depType, name]);
  }
};

/**
 * Original: https://github.com/angular/angular-cli/blob/37a06a7c37f5b4286d58b475e6e12c86f00fac5b/packages/schematics/angular/utility/dependencies.ts#L60-L77
 */
export const getPackageJsonDependency = (
  tree: Tree,
  name: string,
  pkgJsonPath = PKG_JSON_PATH
): NodeDependency | null => {
  const json = new JsonFile(tree, pkgJsonPath);

  for (const depType of ALL_DEPENDENCY_TYPE) {
    const version = json.get([depType, name]);

    if (typeof version === 'string') {
      return {
        type: depType,
        name,
        version,
      };
    }
  }

  return null;
};
