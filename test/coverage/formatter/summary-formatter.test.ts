/**
 * @file Tests the Markdown coverage summary formatter against the expected output.
 */

import { mkdir, readFile, writeFile } from 'node:fs/promises';
import path from 'node:path';

import { SummaryFormatter } from '../../../src/coverage/formatter/summary-formatter.js';
import { detectCoverage } from '../../../src/coverage/parsers/index.js';
import { getDirname } from '../helpers/dir.js';

const testDir = getDirname(import.meta.url);
const outputDir = path.join(testDir, '..', '__outputs__');

describe('coverage summary formatter', () => {
  test('renders coverage table from fixture', async () => {
    const fixturePath = path.join(
      process.cwd(),
      'test',
      '__fixtures__',
      'main',
      'coverage.lcov',
    );
    const content = await readFile(fixturePath, 'utf8');
    const { data } = await detectCoverage(content);

    const formatter = new SummaryFormatter();
    const summary = formatter.format(data, {
      repoUrl: 'https://example.com/repo',
      sha: 'abc123',
      rootDir: process.cwd(),
    });

    await mkdir(outputDir, { recursive: true });
    const outputPath = path.join(outputDir, 'summary-formatter.md');
    await writeFile(outputPath, summary, 'utf8');

    expect(summary).toMatchSnapshot();
  });
});
