import * as fs from 'fs';
import * as path from 'path';

import { SummaryFormatter } from '../../../src/coverage/formatter/summary-formatter.js';
import { CoberturaParser } from '../../../src/coverage/parsers/cobertura/cobertura-parser.js';
import { getDirname } from '../helpers/dir.js';

const __dirname = getDirname(import.meta.url);
const outputDir = path.join(__dirname, '..', '__outputs__');

describe('cobertura parser', () => {
  test('parses cobertura xml content', async () => {
    const fixturePath = path.join(
      __dirname,
      '..',
      '__fixtures__',
      'cobertura.xml',
    );
    const content = fs.readFileSync(fixturePath, 'utf8');

    const parser = new CoberturaParser();
    const data = await parser.parse(content);

    expect(data).toMatchSnapshot();

    const formatter = new SummaryFormatter();
    const summary = formatter.format(data, {
      repoUrl: 'https://example.com/repo',
      sha: 'abc123',
      rootDir: '/tmp',
    });

    fs.mkdirSync(outputDir, { recursive: true });
    const outputPath = path.join(outputDir, 'cobertura.md');
    fs.writeFileSync(outputPath, summary, 'utf8');
  });
});
