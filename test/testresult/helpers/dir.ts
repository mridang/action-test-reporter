/**
 * @file Provides a helper that resolves the directory of a test module from its import URL.
 */

import path from 'node:path';
import { fileURLToPath } from 'node:url';

/**
 * Resolves the directory that contains the module with the given import URL.
 * @param metaUrl - The import.meta.url of the module.
 * @returns The absolute directory path of the module.
 * @example
 * const dir = getDirname(import.meta.url);
 */
export function getDirname(metaUrl: string): string {
  return path.dirname(fileURLToPath(metaUrl));
}
