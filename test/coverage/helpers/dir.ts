/**
 * @file Provides a helper that resolves the directory of a test module from its import URL.
 */

/**
 * Resolves the directory that contains the module with the given import URL.
 * @param metaUrl - The import.meta.url of the module.
 * @returns The directory path with a trailing slash.
 * @example
 * const dir = getDirname(import.meta.url);
 */
export function getDirname(metaUrl: string): string {
  return new URL('.', metaUrl).pathname;
}
