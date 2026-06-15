import * as fs from 'fs';
import * as path from 'path';

import { SummaryFormatter } from '../../../src/coverage/formatter/summary-formatter.js';
import { GocoverParser } from '../../../src/coverage/parsers/gocover/gocover-parser.js';
import { getDirname } from '../helpers/dir.js';

const __dirname = getDirname(import.meta.url);
const outputDir = path.join(__dirname, '..', '__outputs__');

describe('gocover parser', () => {
  test('parses go coverage profile content', async () => {
    const fixturePath = path.join(
      __dirname,
      '..',
      '__fixtures__',
      'gocover.out',
    );
    const content = fs.readFileSync(fixturePath, 'utf8');

    const parser = new GocoverParser();
    const data = await parser.parse(content);

    expect(data).toMatchSnapshot();

    const formatter = new SummaryFormatter();
    const summary = formatter.format(data, {
      repoUrl: 'https://example.com/repo',
      sha: 'abc123',
    });

    fs.mkdirSync(outputDir, { recursive: true });
    const outputPath = path.join(outputDir, 'gocover.md');
    fs.writeFileSync(outputPath, summary, 'utf8');
  });

  test('throws on empty content', async () => {
    const parser = new GocoverParser();
    await expect(parser.parse('')).rejects.toThrow('Empty Go coverage content');
  });

  test('throws on missing mode line', async () => {
    const parser = new GocoverParser();
    const content = 'github.com/example/file.go:1.1,2.2 1 1';
    await expect(parser.parse(content)).rejects.toThrow(
      'Invalid Go coverage format: missing or invalid mode line',
    );
  });

  test('throws on invalid mode', async () => {
    const parser = new GocoverParser();
    const content = 'mode: invalid\ngithub.com/example/file.go:1.1,2.2 1 1';
    await expect(parser.parse(content)).rejects.toThrow(
      'Invalid Go coverage format: missing or invalid mode line',
    );
  });

  test('throws on invalid block line', async () => {
    const parser = new GocoverParser();
    const content = 'mode: set\ninvalid line format';
    await expect(parser.parse(content)).rejects.toThrow(
      'Invalid Go coverage format at line 2',
    );
  });

  test('throws when no coverage data after mode line', async () => {
    const parser = new GocoverParser();
    const content = 'mode: set\n';
    await expect(parser.parse(content)).rejects.toThrow(
      'No valid Go coverage data found in content',
    );
  });

  test('parses all valid modes', async () => {
    const parser = new GocoverParser();

    for (const mode of ['set', 'count', 'atomic']) {
      const content = `mode: ${mode}\ngithub.com/example/file.go:1.1,2.2 1 1`;
      const data = await parser.parse(content);
      expect(data.details).toHaveLength(1);
    }
  });

  test('correctly identifies uncovered lines', async () => {
    const parser = new GocoverParser();
    const content = `mode: set
github.com/example/file.go:1.1,3.1 2 1
github.com/example/file.go:4.1,6.1 2 0`;

    const data = await parser.parse(content);

    expect(data.details[0].uncoveredLines).toEqual([4, 5, 6]);
    expect(data.details[0].lines.covered).toBe(3);
    expect(data.details[0].lines.total).toBe(6);
  });

  test('merges overlapping blocks correctly', async () => {
    const parser = new GocoverParser();
    // Line 2 is covered by two blocks - one with count 0, one with count 1
    // The line should be marked as covered
    const content = `mode: set
github.com/example/file.go:1.1,2.1 1 0
github.com/example/file.go:2.1,3.1 1 1`;

    const data = await parser.parse(content);

    // Line 2 should be covered because the second block covers it with count > 0
    expect(data.details[0].uncoveredLines).toEqual([1]);
    expect(data.details[0].lines.covered).toBe(2);
  });
});
