/**
 * @file Tests the gcov coverage parser and its summary output.
 */

import { mkdir, readFile, writeFile } from 'node:fs/promises';
import path from 'node:path';

import { SummaryFormatter } from '../../../src/coverage/formatter/summary-formatter.js';
import { GcovParser } from '../../../src/coverage/parsers/gcov/gcov-parser.js';
import { getDirname } from '../helpers/dir.js';

const testDir = getDirname(import.meta.url);
const outputDir = path.join(testDir, '..', '__outputs__');

describe('gcov parser', () => {
  test('parses gcov text content', async () => {
    const fixturePath = path.join(testDir, '..', '__fixtures__', 'gcov.out');
    const content = await readFile(fixturePath, 'utf8');

    const parser = new GcovParser();
    const data = await parser.parse(content);

    expect(data).toMatchSnapshot();

    const formatter = new SummaryFormatter();
    const summary = formatter.format(data, {
      repoUrl: 'https://example.com/repo',
      sha: 'abc123',
    });

    await mkdir(outputDir, { recursive: true });
    const outputPath = path.join(outputDir, 'gcov.md');
    await writeFile(outputPath, summary, 'utf8');
  });
});
