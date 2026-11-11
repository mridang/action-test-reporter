/**
 * @file Defines the contract that every coverage output formatter implements.
 */

import { CoverageData } from '../parsers/coverage-parser.js';

/**
 * Defines the contract for a coverage report formatter.
 * @template T - Optional formatting options.
 * @interface CoverageFormatter
 */
export interface CoverageFormatter<T = void> {
  /**
   * Formats the provided coverage data into a string representation.
   * @memberof CoverageFormatter
   * @param coverageData - The processed coverage data.
   * @param [options] - Optional extra options for formatting.
   * @returns The formatted output string.
   */
  format(coverageData: CoverageData, options?: T): string;
}
