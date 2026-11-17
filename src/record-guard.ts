/**
 * @file Narrows parsed JSON and XML values before the parsers read them.
 */

/**
 * Tells whether a parsed JSON or XML value is an object whose properties can be inspected.
 * @param value - The parsed value.
 * @returns True when the value is a non-null object.
 * @example
 * isRecord({ coverage: {} }); // true
 */
export function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null;
}
