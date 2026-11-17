/**
 * @file Parses the JSON report written by Mocha.
 */

import {
  TestCaseResult,
  TestGroupResult,
  TestRunResult,
  TestSuiteResult,
} from '../../test-results.js';
import { getExceptionSource } from '../../utils/node-utilities.js';
import { getBasePath, normalizeFilePath } from '../../utils/path-utilities.js';
import { isRecord } from '../../../record-guard.js';
import type { TestCaseError, TestExecutionResult } from '../../test-results.js';
import type { ParseOptions, TestParser } from '../../test-parser.js';
import type { MochaJson, MochaJsonTest } from './mocha-json-types.js';

/**
 * Tells whether a parsed value has the root structure of a Mocha JSON report.
 * @param value - The parsed value.
 * @returns True when the value has the expected root.
 * @example
 * const supported = isMochaJson(parsed);
 */
function isMochaJson(value: unknown): value is MochaJson {
  return (
    isRecord(value) &&
    isRecord(value.stats) &&
    Array.isArray(value.passes) &&
    Array.isArray(value.failures)
  );
}

/**
 * Parser for JSON reports produced by Mocha's built-in JSON reporter.
 */
export class MochaJsonParser implements TestParser {
  assumedWorkDir: string | undefined;

  constructor(readonly options: ParseOptions) {}

  async parse(path: string, content: string): Promise<TestRunResult> {
    const mocha = this.getMochaJson(path, content);
    const result = this.getTestRunResult(path, mocha);
    result.sort(true);
    return result;
  }

  private getMochaJson(path: string, content: string): MochaJson {
    try {
      const report: unknown = JSON.parse(content);
      if (!isMochaJson(report)) {
        throw new TypeError('The content is not a Mocha JSON report');
      }
      return report;
    } catch (error) {
      throw new Error(`Invalid JSON at ${path}\n\n${String(error)}`, {
        cause: error,
      });
    }
  }

  private getTestRunResult(
    resultsPath: string,
    mocha: MochaJson,
  ): TestRunResult {
    const tests: [MochaJsonTest, TestExecutionResult][] = [
      ...mocha.passes.map((test): [MochaJsonTest, TestExecutionResult] => [
        test,
        'success',
      ]),
      ...mocha.failures.map((test): [MochaJsonTest, TestExecutionResult] => [
        test,
        'failed',
      ]),
      ...mocha.pending.map((test): [MochaJsonTest, TestExecutionResult] => [
        test,
        'skipped',
      ]),
    ];

    const entries = tests.map(([test, result]) => {
      const path = this.getRelativePath(test.file);
      return { path, ...this.processTest(test, result) };
    });

    const suites = Array.from(
      new Set(entries.map((entry) => entry.path)),
      (path) => {
        const inSuite = entries.filter((entry) => entry.path === path);
        return new TestSuiteResult(
          path,
          Array.from(
            new Set(inSuite.map((entry) => entry.groupName)),
            (groupName) =>
              new TestGroupResult(
                groupName,
                inSuite.flatMap((entry) =>
                  entry.groupName === groupName ? [entry.testCase] : [],
                ),
              ),
          ),
        );
      },
    );
    return new TestRunResult(resultsPath, suites, mocha.stats.duration);
  }

  private processTest(test: MochaJsonTest, result: TestExecutionResult) {
    const groupName =
      test.fullTitle === test.title
        ? null
        : test.fullTitle
            .slice(0, test.fullTitle.length - test.title.length)
            .trimEnd();

    const error = this.getTestCaseError(test);
    const testCase = new TestCaseResult(
      test.title,
      result,
      test.duration ?? 0,
      error,
    );
    return { groupName, testCase };
  }

  private getTestCaseError(test: MochaJsonTest): TestCaseError | undefined {
    const details = test.err.stack;
    const message = test.err.message;
    if (details === undefined) {
      return undefined;
    }

    const src = getExceptionSource(details, this.options.trackedFiles, (file) =>
      this.getRelativePath(file),
    );
    const path = src?.path;
    const line = src?.line;

    return {
      path,
      line,
      message,
      details,
    };
  }

  private getRelativePath(path: string): string {
    const normalized = normalizeFilePath(path);
    const workDir = this.getWorkDir(normalized);
    return workDir !== undefined && normalized.startsWith(workDir)
      ? normalized.slice(workDir.length)
      : normalized;
  }

  private getWorkDir(path: string): string | undefined {
    return (
      this.options.workDir ??
      this.assumedWorkDir ??
      (this.assumedWorkDir = getBasePath(path, this.options.trackedFiles))
    );
  }
}
