import { CoverageData } from '../coverage/coverage-parser.js';

/**
 * Defines the contract for a coverage report formatter.
 * @export
 * @interface CoverageFormatter
 */
export interface CoverageFormatter {
  /**
   * Formats the provided coverage data into a string representation.
   * @param {CoverageData} coverageData - The processed coverage data.
   * @returns {string} The formatted output string.
   * @memberof CoverageFormatter
   */
  format(coverageData: CoverageData): string;
}
