/**
 * Represents coverage data for a specific metric (e.g., lines, branches).
 * @export
 * @interface CoverageMetrics
 */
export interface CoverageMetrics {
  covered: number;
  total: number;
}

/**
 * Contains detailed coverage information for a single source file.
 * @export
 * @interface FileCoverageDetails
 */
export interface FileCoverageDetails {
  file: string;
  statements: CoverageMetrics;
  lines: CoverageMetrics;
  methods: CoverageMetrics;
  branches: CoverageMetrics;
  uncoveredLines: number[];
}

/**
 * Represents the complete, standardized coverage data extracted from a report,
 * including an overall summary and detailed per-file data.
 * @export
 * @interface CoverageData
 */
export interface CoverageData {
  overall: {
    statements: CoverageMetrics;
    lines: CoverageMetrics;
    methods: CoverageMetrics;
    branches: CoverageMetrics;
  };
  details: FileCoverageDetails[];
}

/**
 * Defines the contract for all coverage report parsers.
 * @export
 * @interface CoverageParser
 */
export interface CoverageParser {
  /**
   * Parses the raw string content from a coverage report file.
   * @param {string} content - The raw file content to parse.
   * @returns {Promise<CoverageData>} A promise that resolves to the
   * standardized coverage data.
   * @memberof CoverageParser
   */
  parse(content: string): Promise<CoverageData>;
}
