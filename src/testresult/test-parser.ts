/**
 * @file Declares the options and contract that every test result parser implements.
 */

import { TestRunResult } from './test-results.js';

export interface ParseOptions {
  parseErrors: boolean;
  workDir?: string;
  trackedFiles: string[];
}

export interface TestParser {
  parse(path: string, content: string): Promise<TestRunResult>;
}
