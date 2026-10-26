import { promises as fs } from 'fs';
import path from 'path';
import { detectCoverage } from '../../../src/coverage/parsers/index.js';
import { LlvmCovParser } from '../../../src/coverage/parsers/llvm-cov/llvm-cov-parser.js';

describe('detectCoverage', () => {
  it('should detect an llvm-cov JSON export', async () => {
    const content = await fs.readFile(
      path.join(
        process.cwd(),
        'test',
        'coverage',
        '__fixtures__',
        'llvm-cov.json',
      ),
      'utf8',
    );

    const { parser } = await detectCoverage(content);

    expect(parser).toBeInstanceOf(LlvmCovParser);
  });
});
