import type { JsonValue } from '@angular-devkit/core';
import type { Node } from 'yaml';
import {
  isMap,
  isSeq,
  parseDocument,
  Document,
  Scalar,
  YAMLMap,
  YAMLSeq,
} from 'yaml';
import type { AstPath } from '../File.js';
import { File } from '../File.js';

type InsertionIndex = (properties: string[]) => number;

type ModifyOptions = {
  insertInOrder?: InsertionIndex;
  scalarType?:
    | 'BLOCK_FOLDED'
    | 'BLOCK_LITERAL'
    | 'PLAIN'
    | 'QUOTE_DOUBLE'
    | 'QUOTE_SINGLE';
};

type InsertOptions = {
  spaceBefore?: boolean;
  commentBefore?: string;
};

export class YamlFile extends File<Document.Parsed> {
  public get Ast(): Document.Parsed {
    // Reuse cached document if we're still in the middle of an operation.
    if (this._ast) {
      return this._ast;
    }

    const buffer = this.tree.read(this.path);

    if (!buffer) {
      throw new Error(`Could not read '${this.path}'`);
    }

    // Parse cached content.
    this._ast = parseDocument(buffer.toString('utf-8'));

    // Cache parsed document for use throughout this operation.
    return this._ast;
  }

  public save(): void {
    this.tree.overwrite(this.path, this.Ast.toString());
    this._ast = undefined;
  }

  public get<Return = unknown>(yamlPath: AstPath): Return | undefined {
    return (
      this.Ast.getIn(yamlPath, true) as Scalar | YAMLMap | YAMLSeq | undefined
    )?.toJSON();
  }

  public modify<Value extends JsonValue | undefined>(
    yamlPath: AstPath,
    value: Value,
    options: ModifyOptions = {}
  ): Value {
    const parent = this.Ast.getIn(yamlPath.slice(0, -1), true);

    let massagedValue: Value | Scalar = value;
    if (typeof massagedValue === 'string' && options.scalarType) {
      massagedValue = new Scalar(value);
      massagedValue.type = options.scalarType;
    } else if (options.scalarType) {
      console.warn(`Option 'scalarType' was ignored for non-string value`);
    }

    if (options.insertInOrder && isMap(parent)) {
      // Add property at specified position in map
      const key = yamlPath.slice(-1)[0];

      parent.deleteIn([key]);

      const properties = parent.items.map((item) =>
        (item.key as Node).toJSON()
      );
      const index = options.insertInOrder(properties);

      parent.items.splice(index, 0, this.Ast.createPair(key, massagedValue));
    } else {
      // Use default behavior
      this.Ast.setIn(yamlPath, massagedValue);
    }

    this.save();

    if (massagedValue instanceof Scalar) {
      return massagedValue.toJSON();
    }

    return massagedValue;
  }

  /**
   * Insert a node into a sequence
   * @param yamlPath Insertion path, including the index at which to insert value
   * @param value
   * @param options
   * @returns value
   */
  public insert<Value extends JsonValue | undefined>(
    yamlPath: AstPath,
    value: Value,
    options: InsertOptions = {}
  ): Value {
    if (yamlPath.length === 0) {
      throw new Error(
        `Can't insert at document root. Specify an index or use modify instead.`
      );
    }

    const parent = this.Ast.getIn(yamlPath.slice(0, -1), true);
    const index = yamlPath.slice(-1)[0];

    if (parent !== undefined && !isSeq(parent)) {
      throw new Error(`Can't insert into non-sequence node.`);
    }

    if (typeof index !== 'number') {
      throw new RangeError(`Can't insert at non-numeric index '${index}'.`);
    }

    if (index < 0) {
      throw new RangeError(`Index ${index} out of bounds.`);
    }

    // Prepare node with options
    const node = this.Ast.createNode(value);
    node.spaceBefore = options.spaceBefore;
    node.commentBefore = options.commentBefore;

    if (parent === undefined || index >= parent.items.length) {
      // Not inserting in middle of sequence. No special handling required.
      this.Ast.setIn(yamlPath, node);
    } else {
      parent.items.splice(index, 0, node);
    }

    this.save();

    return value;
  }

  public remove(yamlPath: AstPath): void {
    const deleted = this.Ast.deleteIn(yamlPath);

    if (!deleted) {
      // Don't need to save if nothing was changed.
      return;
    }

    this.save();
  }
}
