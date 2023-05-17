import type { JsonValue } from '@angular-devkit/core';
import type { Tree } from '@angular-devkit/schematics';
import type { Node, ParseError } from 'jsonc-parser';
import {
  applyEdits,
  findNodeAtLocation,
  getNodeValue,
  modify,
  parseTree,
  printParseErrorCode,
} from 'jsonc-parser';
import type { AstPath } from '../File.js';
import { File } from '../File.js';

export type InsertionIndex = (properties: string[]) => number;

/**
 * Originally pulled from this MIT licensed file: https://github.com/angular/angular-cli/blob/37a06a7c37f5b4286d58b475e6e12c86f00fac5b/packages/schematics/angular/utility/json-file.ts
 */
export class JsonFile extends File<Node> {
  /**
   * Source of truth in this class.
   */
  public content?: string;

  public get Ast(): Node {
    if (this._ast) {
      return this._ast;
    }

    this.load();

    const errors: ParseError[] = [];
    // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
    this._ast = parseTree(this.content!, errors, {
      allowTrailingComma: true,
    });

    if (errors.length) {
      const { error, offset } = errors[0];
      this._ast = undefined;
      this.content = undefined;

      throw new Error(
        `Failed to parse "${
          this.path
        }" as JSON AST Object. ${printParseErrorCode(
          error
        )} at location: ${offset}.`
      );
    }

    // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
    return this._ast!;
  }

  private load(): void {
    if (this.content === undefined) {
      const buffer = this.tree.read(this.path);
      if (!buffer) {
        throw new Error(`Could not read '${this.path}'.`);
      }

      this.content = buffer.toString('utf-8');
    }
  }

  public constructor(tree: Tree, path: string) {
    super(tree, path);

    this.load();
  }

  /**
   * Saves the current content state to the tree.
   */
  public save(): void {
    if (this.content === undefined) {
      throw new Error('Unable to save: content is undefined.');
    }

    this.tree.overwrite(this.path, this.content);
    this._ast = undefined;
  }

  public get<Return = unknown>(jsonPath: AstPath): Return | undefined {
    if (jsonPath.length === 0) {
      return getNodeValue(this.Ast);
    }

    const node = findNodeAtLocation(this.Ast, jsonPath);

    return node === undefined ? undefined : getNodeValue(node);
  }

  public modify<Value extends JsonValue | undefined>(
    jsonPath: AstPath,
    value: Value,
    insertInOrder?: InsertionIndex | false
  ): Value {
    this.load();

    let getInsertionIndex: InsertionIndex | undefined;
    if (insertInOrder === undefined) {
      const property = jsonPath.slice(-1)[0];
      getInsertionIndex = (properties) =>
        [...properties, property].sort().findIndex((p) => p === property);
    } else if (insertInOrder !== false) {
      getInsertionIndex = insertInOrder;
    }

    // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
    const edits = modify(this.content!, jsonPath, value, {
      getInsertionIndex,
      formattingOptions: {
        insertSpaces: true,
        tabSize: 2,
      },
    });

    // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
    this.content = applyEdits(this.content!, edits);

    this.save();

    return value;
  }

  public remove(jsonPath: AstPath): void {
    if (this.get(jsonPath) !== undefined) {
      this.modify(jsonPath, undefined);
    }
  }
}
