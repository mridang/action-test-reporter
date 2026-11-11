/**
 * @file Provides helpers that normalise file paths so they match Git-relative paths.
 */

/**
 * Normalises a directory path and optionally makes sure it ends with a slash.
 * @param path - The directory path to normalise.
 * @param addTrailingSlash - Whether a trailing slash should be appended when it is missing.
 * @returns The normalised directory path.
 * @example
 * const dir = normalizeDirPath('src\\utils', true); // 'src/utils/'
 */
export function normalizeDirPath(
  path: string,
  addTrailingSlash: boolean,
): string {
  if (!path) {
    return path;
  }

  path = normalizeFilePath(path);
  if (addTrailingSlash && !path.endsWith('/')) {
    path += '/';
  }
  return path;
}

/**
 * Normalises a file path by trimming it and using forward slashes as separators.
 * @param path - The file path to normalise.
 * @returns The normalised file path.
 * @example
 * const file = normalizeFilePath(' src\\index.ts ');
 */
export function normalizeFilePath(path: string): string {
  if (!path) {
    return path;
  }

  return path.trim().replaceAll('\\', '/');
}

/**
 * Finds the part of a path that comes before the longest tracked file it ends with.
 * @param path - The path reported by a tool.
 * @param trackedFiles - The files tracked by Git.
 * @returns The leading part of the path, an empty string when the path is tracked, or undefined when no file matches.
 * @example
 * const base = getBasePath('/work/app/src/index.ts', ['src/index.ts']); // '/work/app/'
 */
export function getBasePath(
  path: string,
  trackedFiles: string[],
): string | undefined {
  if (trackedFiles.includes(path)) {
    return '';
  }

  let max = '';
  for (const file of trackedFiles) {
    if (path.endsWith(file) && file.length > max.length) {
      max = file;
    }
  }

  if (max === '') {
    return undefined;
  }

  return path.slice(0, path.length - max.length);
}
