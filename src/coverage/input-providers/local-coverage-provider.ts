import * as fs from 'fs';
import glob from 'fast-glob';
import { CoverageFile, CoverageInputProvider } from './input-provider.js';

/**
 * Loads coverage report files from the local workspace using glob patterns.
 */
export class LocalCoverageProvider implements CoverageInputProvider {
  constructor(private readonly patterns: string[]) {}

  public async load(): Promise<CoverageFile[]> {
    const result: CoverageFile[] = [];
    for (const pattern of this.patterns) {
      const paths = await glob(pattern, { dot: true });
      for (const file of paths) {
        const content = await fs.promises.readFile(file, { encoding: 'utf8' });
        result.push({ file, content });
      }
    }

    return result;
  }
}
