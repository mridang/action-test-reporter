import { promises as fs } from 'fs';
import { CoverageParser } from './coverage-parser.js';
import { CloverParser } from './clover-parser.js';
import { CoberturaParser } from './cobertura-parser.js';
import { JacocoParser } from './jacoco-parser.js';
import { LcovParser } from './lcov-parser.js';

/**
 * An array of all available parser instances to be tried in order.
 * The order can matter if formats are subsets of one another.
 */
const availableParsers: CoverageParser[] = [
  new JacocoParser(),
  new CoberturaParser(),
  new CloverParser(),
  new LcovParser(),
];

/**
 * Reads a file and returns the correct parser by attempting to parse
 * the content with each available parser until one succeeds.
 * @export
 * @param {string} filePath - The path to the coverage report file.
 * @returns {Promise<CoverageParser>} A promise that resolves to the first
 * parser instance that successfully parses the file.
 * @throws {Error} If no parser can successfully process the file content.
 */
export async function getParserForFile(
  filePath: string,
): Promise<CoverageParser> {
  const content = await fs.readFile(filePath, 'utf8');

  for (const parser of availableParsers) {
    try {
      await parser.parse(content);
      return parser;
    } catch {
      //
    }
  }

  throw new Error(
    `Could not determine coverage report type for ${filePath}. None of the available parsers succeeded.`,
  );
}
