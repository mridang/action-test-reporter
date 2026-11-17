/**
 * @file Finds coverage report files on the local disk using the configured glob patterns.
 */

import { readFile } from 'node:fs/promises';
// eslint-disable-next-line e18e/ban-dependencies -- tinyglobby is not a drop-in replacement for fast-glob, so the swap is deferred to keep file matching identical
import glob from 'fast-glob';
import type { CoverageFile, CoverageInputProvider } from './input-provider.js';

/**
 * Loads coverage report files from the local workspace using glob patterns.
 */
export class LocalCoverageProvider implements CoverageInputProvider {
  constructor(private readonly patterns: string[]) {}

  public async load(): Promise<CoverageFile[]> {
    const perPattern = await Promise.all(
      this.patterns.map(async (pattern) => {
        const paths = await glob(pattern, { dot: true });
        return Promise.all(
          paths.map(async (file) => ({
            file,
            content: await readFile(file, { encoding: 'utf8' }),
          })),
        );
      }),
    );
    return perPattern.flat();
  }
}
