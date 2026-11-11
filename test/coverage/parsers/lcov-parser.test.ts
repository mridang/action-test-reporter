/**
 * @file Tests the LCOV coverage parser and its summary output.
 */

import { mkdir, readFile, writeFile } from 'node:fs/promises';
import path from 'node:path';

import { SummaryFormatter } from '../../../src/coverage/formatter/summary-formatter.js';
import { LcovParser } from '../../../src/coverage/parsers/lcov/lcov-parser.js';
import { getDirname } from '../helpers/dir.js';

const testDir = getDirname(import.meta.url);
const outputDir = path.join(testDir, '..', '__outputs__');

describe('lcov parser', () => {
  test('parses lcov info content', async () => {
    const fixturePath = path.join(testDir, '..', '__fixtures__', 'lcov.info');
    const content = await readFile(fixturePath, 'utf8');

    const parser = new LcovParser();
    const data = await parser.parse(content);

    expect(data).toMatchSnapshot();

    const formatter = new SummaryFormatter();
    const summary = formatter.format(data, {
      repoUrl: 'https://example.com/repo',
      sha: 'abc123',
      rootDir: '/tmp',
    });

    await mkdir(outputDir, { recursive: true });
    const outputPath = path.join(outputDir, 'lcov.md');
    await writeFile(outputPath, summary, 'utf8');
  });
});
