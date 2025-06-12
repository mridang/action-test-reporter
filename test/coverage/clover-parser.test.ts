import { promises as fs } from 'fs';
import path from 'path';
import { CloverParser } from '../../src/coverage/clover-parser.js';
import { ConsoleFormatter } from '../../src/formatter/console-formatter.js';

describe('CloverParser', () => {
  it('should correctly parse a clover.xml file', async () => {
    const filePath = path.join(process.cwd(), 'test', 'res', 'clover.xml');
    const fileContent = await fs.readFile(filePath, 'utf8');
    const parser = new CloverParser();
    const result = await parser.parse(fileContent);

    //console.log(JSON.stringify(result, null, 2));
    expect(result).toBeDefined();
    expect(result.overall).toBeDefined();
    expect(result.details).toBeInstanceOf(Array);

    const formatter = new ConsoleFormatter();
    const formattedOutput = formatter.format(result, {
      rootDir: '/Users/mridang/Code/zitadel/client-php/',
    });
    console.log(formattedOutput);
  });
});
