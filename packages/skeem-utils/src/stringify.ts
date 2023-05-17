/**
 * Convert common types to their string equivalent.
 */
export const stringify = (input: unknown): string => {
  switch (typeof input) {
    case 'string':
      return input;
    case 'number':
    case 'bigint':
      return input.toString(10);
    case 'boolean':
      return input ? 'true' : 'false';
    default:
      throw new Error(`Unable to stringify ${typeof input}`);
  }
};
