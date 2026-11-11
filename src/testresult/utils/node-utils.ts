/**
 * @file Provides helpers that read exception details and locale settings from Node-based results.
 */

import { normalizeFilePath } from './path-utils.js';

export const DEFAULT_LOCALE = 'en-US';

/**
 * Finds the first stack trace frame that points to a tracked project file, skipping Node internals and dependencies.
 * @param stackTrace - The stack trace text of the exception.
 * @param trackedFiles - The files tracked by Git, used to choose a frame.
 * @param getRelativePath - Converts a frame path into a path relative to the repository.
 * @returns The relative path and line of the frame, or undefined when none matches.
 * @example
 * const source = getExceptionSource(error.stack ?? '', files, (p) => p);
 */
export function getExceptionSource(
  stackTrace: string,
  trackedFiles: string[],
  getRelativePath: (str: string) => string,
): { path: string; line: number } | undefined {
  const lines = stackTrace.split(/\r?\n/);

  for (const str of lines) {
    const frame = getTrackedFrame(str, trackedFiles, getRelativePath);
    if (frame) {
      return frame;
    }
  }
  return undefined;
}

/**
 * Parses one stack trace line and returns it when it points to a tracked project file.
 * @param str - A single line of the stack trace.
 * @param trackedFiles - The files tracked by Git.
 * @param getRelativePath - Converts a frame path into a path relative to the repository.
 * @returns The relative path and line of the frame, or undefined when the line does not match.
 * @example
 * const frame = getTrackedFrame('at run (/work/src/index.ts:10:5)', files, (p) => p);
 */
function getTrackedFrame(
  str: string,
  trackedFiles: string[],
  getRelativePath: (str: string) => string,
): { path: string; line: number } | undefined {
  // eslint-disable-next-line sonarjs/super-linear-regex -- applied to a single stack trace line
  const match = /\((.*):(\d+):\d+\)$/.exec(str);
  if (match === null) {
    return undefined;
  }
  const [, fileStr, lineStr] = match;
  const filePath = normalizeFilePath(fileStr);
  if (filePath.startsWith('internal/') || filePath.includes('/node_modules/')) {
    return undefined;
  }
  const path = getRelativePath(filePath);
  if (!path || !trackedFiles.includes(path)) {
    return undefined;
  }
  return { path, line: Number.parseInt(lineStr) };
}
