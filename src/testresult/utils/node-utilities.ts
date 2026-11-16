/**
 * @file Provides helpers that read exception details and locale settings from Node-based results.
 */

import { normalizeFilePath } from './path-utilities.js';

const LINE_BREAK_PATTERN = /\r?\n/;
const STACK_FRAME_PATTERN = /^[^(]*\((.*):(\d+):\d+\)$/;

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
  getRelativePath: (line: string) => string,
): { path: string; line: number } | undefined {
  const lines = stackTrace.split(LINE_BREAK_PATTERN);

  for (const line of lines) {
    const frame = getTrackedFrame(line, trackedFiles, getRelativePath);
    if (frame) {
      return frame;
    }
  }
  return undefined;
}

/**
 * Extracts the file path and line number from the parenthesized location at the end of a stack trace line.
 * The pattern is anchored at the start and skips to the first opening parenthesis with a negated class, so the
 * scan stays linear on long lines.
 * @param text - A single line of the stack trace.
 * @returns The file path and the line number text, or undefined when the line has no location.
 * @example
 * const match = matchStackFrame('at run (/work/src/index.ts:10:5)');
 */
export function matchStackFrame(
  text: string,
): [path: string, line: string] | undefined {
  const match = STACK_FRAME_PATTERN.exec(text);
  return match === null ? undefined : [match[1], match[2]];
}

/**
 * Parses one stack trace line and returns it when it points to a tracked project file.
 * @param text - A single line of the stack trace.
 * @param trackedFiles - The files tracked by Git.
 * @param getRelativePath - Converts a frame path into a path relative to the repository.
 * @returns The relative path and line of the frame, or undefined when the line does not match.
 * @example
 * const frame = getTrackedFrame('at run (/work/src/index.ts:10:5)', files, (p) => p);
 */
function getTrackedFrame(
  text: string,
  trackedFiles: string[],
  getRelativePath: (line: string) => string,
): { path: string; line: number } | undefined {
  const match = matchStackFrame(text);
  if (match === undefined) {
    return undefined;
  }
  const [fileString, lineString] = match;
  const filePath = normalizeFilePath(fileString);
  if (filePath.startsWith('internal/') || filePath.includes('/node_modules/')) {
    return undefined;
  }
  const path = getRelativePath(filePath);
  if (!path || !trackedFiles.includes(path)) {
    return undefined;
  }
  return { path, line: Number.parseInt(lineString) };
}
