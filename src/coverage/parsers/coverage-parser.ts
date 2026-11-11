/**
 * Represents coverage data for a specific metric (e.g., lines, branches).
 * @interface CoverageMetrics
 * @export
 */
export interface CoverageMetrics {
  covered: number;
  total: number;
}

/**
 * Contains detailed coverage information for a single source file.
 * @interface FileCoverageDetails
 * @export
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
 * @interface CoverageData
 * @export
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
 * @interface CoverageParser
 * @export
 */
export interface CoverageParser {
  /**
   * Parses the raw string content from a coverage report file.
   * @memberof CoverageParser
   * @param content - The raw file content to parse.
   * @returns A promise that resolves to the
   * standardized coverage data.
   */
  parse(content: string): Promise<CoverageData>;
}
