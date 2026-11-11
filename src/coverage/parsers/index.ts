/**
 * @file Detects the coverage format of a report and dispatches it to the matching parser.
 */

import { promises as fs } from 'node:fs';
import { CoverageData, CoverageParser } from './coverage-parser.js';
import { CloverParser } from './clover/clover-parser.js';
import { CoberturaParser } from './cobertura/cobertura-parser.js';
import { GcovParser } from './gcov/gcov-parser.js';
import { GocoverParser } from './gocover/gocover-parser.js';
import { JacocoParser } from './jacoco/jacoco-parser.js';
import { LlvmCovParser } from './llvm-cov/llvm-cov-parser.js';
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
  new GocoverParser(),
  new LlvmCovParser(),
  new LcovParser(),
];

type DetectedCoverage = { parser: CoverageParser; data: CoverageData };


/**
 * Detects the format of a coverage report by trying each available parser in turn.
 * @param content - The raw text of the coverage report.
 * @returns The parser that understood the report and the parsed coverage data.
 * @rejects {Error} When none of the available parsers can read the report.
 * @example
 * const { parser, data } = await detectCoverage(lcovText);
 */
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
 * @param filePath - The path to the coverage report file.
 * @returns The detected parser and parsed data.
 * @example
 * const { data } = await parseCoverageFile('coverage/lcov.info');
 */
export async function parseCoverageFile(
  filePath: string,
): Promise<DetectedCoverage> {
  const content = await fs.readFile(filePath, 'utf8');

  return detectCoverage(content);
}
