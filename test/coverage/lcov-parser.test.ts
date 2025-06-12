import { promises as fs } from 'fs';
import path from 'path';
import { LcovParser } from '../../src/coverage/lcov-parser.js';

describe('CloverParser', () => {
  it('should correctly parse a clover.xml file', async () => {
    const filePath = path.join(process.cwd(), 'test', 'res', 'lcov.info');
    const fileContent = await fs.readFile(filePath, 'utf8');
    const parser = new LcovParser();
    const result = await parser.parse(fileContent);

    console.log(JSON.stringify(result, null, 2));
    expect(result).toBeDefined();
    expect(result.overall).toBeDefined();
    expect(result.details).toBeInstanceOf(Array);
  });
});
