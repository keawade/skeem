import type { JsonValue } from '@angular-devkit/core';
import type { Tree } from '@angular-devkit/schematics';

export type AstPath = Array<string | number>;

/**
 * Abstract class for JSON-like data structures.
 */
export abstract class File<Ast> {
  protected readonly tree: Tree;
  protected readonly path: string;

  protected _ast: Ast | undefined = undefined;
  public abstract get Ast(): Ast;
  /**
   * Saves the current AST state to the tree.
   */
  public abstract save(): void;

  public constructor(tree: Tree, path: string) {
    this.tree = tree;
    this.path = path;
  }

  public abstract get<Return = unknown>(path: AstPath): Return | undefined;
  public abstract modify<Value extends JsonValue>(
    path: AstPath,
    value: Value
  ): Value;
  public abstract remove(path: AstPath): void;
}
