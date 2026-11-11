/**
 * @file Defines the interfaces that supply test result files to the test reporter.
 */

export interface ReportInput {
  [reportName: string]: FileContent[];
}

export interface FileContent {
  file: string;
  content: string;
}

export interface InputProvider {
  load(): Promise<ReportInput>;
  listTrackedFiles(): Promise<string[]>;
}
