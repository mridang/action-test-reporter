/**
 * @file Tests the detection of the coverage format of a report.
 */

import { promises as fs } from 'node:fs';
import path from 'node:path';
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
