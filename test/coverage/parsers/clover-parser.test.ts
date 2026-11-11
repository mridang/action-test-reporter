/**
 * @file Tests the Clover coverage parser and its summary output.
 */

import { mkdir, readFile, writeFile } from 'node:fs/promises';
import path from 'node:path';

import { SummaryFormatter } from '../../../src/coverage/formatter/summary-formatter.js';
import { CloverParser } from '../../../src/coverage/parsers/clover/clover-parser.js';
import { getDirname } from '../helpers/dir.js';

const testDir = getDirname(import.meta.url);
const outputDir = path.join(testDir, '..', '__outputs__');

describe('clover parser', () => {
  test('parses clover xml content', async () => {
    const fixturePath = path.join(testDir, '..', '__fixtures__', 'clover.xml');
    const content = await readFile(fixturePath, 'utf8');

    const parser = new CloverParser();
    const data = await parser.parse(content);

    expect(data).toMatchSnapshot();

    const formatter = new SummaryFormatter();
    const summary = formatter.format(data, {
      repoUrl: 'https://example.com/repo',
      sha: 'abc123',
      rootDir: '/tmp',
    });

    await mkdir(outputDir, { recursive: true });
    const outputPath = path.join(outputDir, 'clover.md');
    await writeFile(outputPath, summary, 'utf8');
  });
});
