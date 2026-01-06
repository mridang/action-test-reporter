import * as fs from 'fs';
import * as path from 'path';

import { SummaryFormatter } from '../../../src/coverage/formatter/summary-formatter.js';
import { detectCoverage } from '../../../src/coverage/parsers/index.js';
import { getDirname } from '../helpers/dir.js';

const __dirname = getDirname(import.meta.url);
const outputDir = path.join(__dirname, '..', '__outputs__');

describe('coverage summary formatter', () => {
  test('renders coverage table from fixture', async () => {
    const fixturePath = path.join(
      process.cwd(),
      'test',
      '__fixtures__',
      'main',
      'coverage.lcov',
    );
    const content = fs.readFileSync(fixturePath, 'utf8');
    const { data } = await detectCoverage(content);

    const formatter = new SummaryFormatter();
    const summary = formatter.format(data, {
      repoUrl: 'https://example.com/repo',
      sha: 'abc123',
      rootDir: process.cwd(),
    });

    fs.mkdirSync(outputDir, { recursive: true });
    const outputPath = path.join(outputDir, 'summary-formatter.md');
    fs.writeFileSync(outputPath, summary, 'utf8');

    expect(summary).toMatchSnapshot();
  });
});
