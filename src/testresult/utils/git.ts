/**
 * @file Lists the files tracked by Git in the working tree.
 */

import { endGroup, info, startGroup } from '@actions/core';
import { getExecOutput } from '@actions/exec';

/**
 * Lists the files that Git tracks in the working directory.
 * @returns The tracked file paths, relative to the repository root.
 * @example
 * const files = await listFiles();
 */
export async function listFiles(): Promise<string[]> {
  startGroup('Listing all files tracked by git');
  let output = '';
  try {
    const lsFiles = await getExecOutput('git', ['ls-files', '-z']);
    output = lsFiles.stdout;
  } finally {
    fixStdOutNullTermination();
    endGroup();
  }

  return output.split('\u0000').filter((s) => s.length > 0);
}

/**
 * Writes an empty informational line to the log so the grouped output ends on its own line.
 * @example
 * fixStdOutNullTermination(); // Logs an empty line after the git group.
 */
function fixStdOutNullTermination(): void {
  info('');
}
