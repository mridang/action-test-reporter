/**
 * @file Public entry point of the coverage reporter that re-exports its parsers and types.
 */

export { parseCoverageFile, detectCoverage } from './parsers/index.js';
export type {
  CoverageData,
  CoverageMetrics,
  CoverageParser,
  FileCoverageDetails,
} from './parsers/coverage-parser.js';
