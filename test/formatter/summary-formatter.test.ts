import { promises as fs } from 'fs';
import path from 'path';
import { CloverParser } from '../../src/coverage/clover-parser.js';
import { SummaryFormatter } from '../../src/formatter/summary-formatter.js';
import { JacocoParser } from '../../src/coverage/jacoco-parser.js';

describe('dafff', () => {
  it('should correctly parse a clover.xml file', async () => {
    const filePath = path.join(process.cwd(), 'test', 'res', 'jacoco.xml');
    const fileContent = await fs.readFile(filePath, 'utf8');
    const parser = new JacocoParser();
    const result = await parser.parse(fileContent);

    //console.log(JSON.stringify(result, null, 2));
    expect(result).toBeDefined();
    expect(result.overall).toBeDefined();
    expect(result.details).toBeInstanceOf(Array);

    const formatter = new SummaryFormatter();
    const formattedOutput = formatter.format(result, {
      repoUrl: '',
      sha: '03ab23e',
    });
    console.log(formattedOutput);
  });
});
