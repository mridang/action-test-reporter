import { promises as fs } from 'fs';
import { CoverageData, CoverageParser } from './coverage-parser.js';
import { CloverParser } from './clover/clover-parser.js';
import { CoberturaParser } from './cobertura/cobertura-parser.js';
import { GcovParser } from './gcov/gcov-parser.js';
import { JacocoParser } from './jacoco/jacoco-parser.js';
import { LcovParser } from './lcov/lcov-parser.js';

/**
 * An array of all available parser instances to be tried in order.
 * The order can matter if formats are subsets of one another.
 */
const availableParsers: CoverageParser[] = [
  new JacocoParser(),
  new CoberturaParser(),
  new CloverParser(),
  new GcovParser(),
  new LcovParser(),
];

type DetectedCoverage = { parser: CoverageParser; data: CoverageData };

export async function detectCoverage(
  content: string,
): Promise<DetectedCoverage> {
  for (const parser of availableParsers) {
    try {
      const data = await parser.parse(content);
      return { parser, data };
    } catch {
      /* empty */
    }
  }

  throw new Error(
    'Could not determine coverage report type. None of the available parsers succeeded.',
  );
}

/**
 * Reads a file, detects the appropriate parser, and parses the content.
 * @param {string} filePath - The path to the coverage report file.
 * @returns {Promise<DetectedCoverage>} The detected parser and parsed data.
 */
export async function parseCoverageFile(
  filePath: string,
): Promise<DetectedCoverage> {
  const content = await fs.readFile(filePath, 'utf8');

  return detectCoverage(content);
}
