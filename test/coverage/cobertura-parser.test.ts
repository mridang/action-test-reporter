import { promises as fs } from 'fs';
import path from 'path';
import { CoberturaParser } from '../../src/coverage/cobertura-parser.js';
import { JestFormatter } from '../../src/formatter/jest-formatter.js';

describe('CoberturaParser', () => {
  it('should correctly parse a clover.xml file', async () => {
    const filePath = path.join(process.cwd(), 'test', 'res', 'cobertura.xml');
    const fileContent = await fs.readFile(filePath, 'utf8');
    const parser = new CoberturaParser();
    const result = await parser.parse(fileContent);

    //console.log(JSON.stringify(result, null, 2));
    expect(result).toBeDefined();
    expect(result.overall).toBeDefined();
    expect(result.details).toBeInstanceOf(Array);

    const formatter = new JestFormatter();
    const formattedOutput = formatter.format(result, {
      rootDir: '/Users/mridang/Code/zitadel/client-php/',
    });
    console.log(formattedOutput);
  });
});
