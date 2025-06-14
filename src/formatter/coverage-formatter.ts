import { CoverageData } from '../coverage/coverage-parser.js';

/**
 * Defines the contract for a coverage report formatter.
 *
 * @template T - Optional formatting options.
 * @export
 * @interface CoverageFormatter
 */
export interface CoverageFormatter<T = void> {
  /**
   * Formats the provided coverage data into a string representation.
   * @param {CoverageData} coverageData - The processed coverage data.
   * @param {T} [options] - Optional extra options for formatting.
   * @returns {string} The formatted output string.
   * @memberof CoverageFormatter
   */
  format(coverageData: CoverageData, options?: T): string;
}
