import { promises as fs } from 'fs';
import path from 'path';
import { GcovParser } from '../../src/coverage/gcov-parser.js';

describe('GcovParser', () => {
  it('should correctly parse a file', async () => {
    const filePath = path.join(process.cwd(), 'test', 'res', 'gcov.out');
    const fileContent = await fs.readFile(filePath, 'utf8');
    const parser = new GcovParser();
    const result = await parser.parse(fileContent);

    expect(result).toEqual({
      overall: {
        lines: {
          covered: 6,
          total: 8,
        },
        branches: {
          covered: 2,
          total: 2,
        },
        methods: {
          covered: 1,
          total: 1,
        },
        statements: {
          covered: 6,
          total: 8,
        },
      },
      details: [
        {
          file: 'src/example.c',
          lines: {
            covered: 6,
            total: 8,
          },
          methods: {
            covered: 1,
            total: 1,
          },
          branches: {
            covered: 2,
            total: 2,
          },
          statements: {
            covered: 6,
            total: 8,
          },
          uncoveredLines: [7, 10],
        },
      ],
    });
  });
});
