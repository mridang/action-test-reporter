import { promises as fs } from 'fs';
import path from 'path';
import { LlvmCovParser } from '../../../src/coverage/parsers/llvm-cov/llvm-cov-parser.js';

describe('LlvmCovParser', () => {
  it('should derive line coverage from segments and skip dependencies', async () => {
    const filePath = path.join(
      process.cwd(),
      'test',
      'coverage',
      '__fixtures__',
      'llvm-cov.json',
    );
    const content = await fs.readFile(filePath, 'utf8');
    const result = await new LlvmCovParser().parse(content);

    expect(result).toEqual({
      overall: {
        lines: { total: 9, covered: 5 },
        statements: { total: 9, covered: 5 },
        methods: { total: 2, covered: 1 },
        branches: { total: 2, covered: 1 },
      },
      details: [
        {
          file: '/work/repo/Sources/Foo/Foo.swift',
          lines: { total: 9, covered: 5 },
          statements: { total: 9, covered: 5 },
          methods: { total: 2, covered: 1 },
          branches: { total: 2, covered: 1 },
          uncoveredLines: [3, 4, 6, 7],
        },
      ],
    });
  });

  it('should reject JSON that is not an llvm-cov export', async () => {
    await expect(new LlvmCovParser().parse('{"a":1}')).rejects.toThrow(
      'Not an llvm-cov JSON export',
    );
  });

  it('should reject content that is not JSON', async () => {
    await expect(new LlvmCovParser().parse('SF:a.ts')).rejects.toThrow(
      'not valid JSON',
    );
  });
});
