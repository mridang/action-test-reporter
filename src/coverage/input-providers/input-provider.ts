/**
 * @file Defines the interfaces that supply coverage report files to the coverage reporter.
 */

export interface CoverageFile {
  file: string;
  content: string;
}

export interface CoverageInputProvider {
  load(): Promise<CoverageFile[]>;
}
