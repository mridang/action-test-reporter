import * as fs from 'fs';
import * as path from 'path';

import { SummaryFormatter } from '../../../src/coverage/formatter/summary-formatter.js';
import { GcovParser } from '../../../src/coverage/parsers/gcov/gcov-parser.js';
import { getDirname } from '../helpers/dir.js';

const __dirname = getDirname(import.meta.url);
const outputDir = path.join(__dirname, '..', '__outputs__');

describe('gcov parser', () => {
  test('parses gcov text content', async () => {
    const fixturePath = path.join(__dirname, '..', '__fixtures__', 'gcov.out');
    const content = fs.readFileSync(fixturePath, 'utf8');

    const parser = new GcovParser();
    const data = await parser.parse(content);

    expect(data).toMatchSnapshot();

    const formatter = new SummaryFormatter();
    const summary = formatter.format(data, {
      repoUrl: 'https://example.com/repo',
      sha: 'abc123',
    });

    fs.mkdirSync(outputDir, { recursive: true });
    const outputPath = path.join(outputDir, 'gcov.md');
    fs.writeFileSync(outputPath, summary, 'utf8');
  });
});
