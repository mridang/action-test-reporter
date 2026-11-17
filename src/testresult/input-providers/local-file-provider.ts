/**
 * @file Reads test result files from the local disk using the configured glob patterns.
 */

import { readFile } from 'node:fs/promises';
// eslint-disable-next-line e18e/ban-dependencies -- tinyglobby is not a drop-in replacement for fast-glob, so the swap is deferred to keep file matching identical
import glob from 'fast-glob';
import { listFiles } from '../utils/git.js';
import type {
  FileContent,
  InputProvider,
  ReportInput,
} from './input-provider.js';

export class LocalFileProvider implements InputProvider {
  constructor(
    readonly name: string,
    readonly pattern: string[],
  ) {}

  async load(): Promise<ReportInput> {
    const perPattern = await Promise.all(
      this.pattern.map(async (pat) => {
        const paths = await glob(pat, { dot: true });
        return Promise.all(
          paths.map(async (file): Promise<FileContent> => ({
            file,
            content: await readFile(file, { encoding: 'utf8' }),
          })),
        );
      }),
    );

    return { [this.name]: perPattern.flat() };
  }

  async listTrackedFiles(): Promise<string[]> {
    return listFiles();
  }
}
