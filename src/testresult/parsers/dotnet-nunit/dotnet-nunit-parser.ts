/**
 * @file Parses NUnit XML test results from .NET test runs.
 */

import { parseStringPromise } from 'xml2js';

import { getExceptionSource } from '../../utils/node-utilities.js';
import { getBasePath, normalizeFilePath } from '../../utils/path-utilities.js';

import {
  TestRunResult,
  TestSuiteResult,
  TestGroupResult,
  TestCaseResult,
} from '../../test-results.js';
import type { TestExecutionResult, TestCaseError } from '../../test-results.js';
import type { NunitReport, TestCase, TestSuite } from './dotnet-nunit-types.js';
import type { ParseOptions, TestParser } from '../../test-parser.js';

/**
 * Parser for NUnit XML reports produced by .NET test runners.
 */
export class DotnetNunitParser implements TestParser {
  assumedWorkDir: string | undefined;

  constructor(readonly options: ParseOptions) {}

  async parse(path: string, content: string): Promise<TestRunResult> {
    const ju = await this.getNunitReport(path, content);
    return this.getTestRunResult(path, ju);
  }

  private async getNunitReport(
    path: string,
    content: string,
  ): Promise<NunitReport> {
    try {
      return (await parseStringPromise(content)) as NunitReport;
    } catch (error) {
      throw new Error(`Invalid XML at ${path}\n\n${String(error)}`, {
        cause: error,
      });
    }
  }

  private getTestRunResult(path: string, nunit: NunitReport): TestRunResult {
    const time = Number.parseFloat(nunit['test-run'].$.duration) * 1000;

    const entries = this.collectTestCases(
      [],
      nunit['test-run']['test-suite'],
    ).map(({ suitePath, testCase }) => {
      const suitesWithoutTheories = suitePath.filter(
        (suite) => suite.$.type !== 'Theory',
      );
      return {
        suiteName: suitesWithoutTheories
          .slice(0, -1)
          .map((suite) => suite.$.name)
          .join('.'),
        groupName: suitesWithoutTheories.at(-1)!.$.name,
        result: new TestCaseResult(
          testCase.$.name,
          this.getTestExecutionResult(testCase),
          Number.parseFloat(testCase.$.duration) * 1000,
          this.getTestCaseError(testCase),
        ),
      };
    });

    const suites = Array.from(
      new Set(entries.map((entry) => entry.suiteName)),
      (suiteName) => {
        const inSuite = entries.filter(
          (entry) => entry.suiteName === suiteName,
        );
        return new TestSuiteResult(
          suiteName,
          Array.from(
            new Set(inSuite.map((entry) => entry.groupName)),
            (groupName) =>
              new TestGroupResult(
                groupName,
                inSuite
                  .filter((entry) => entry.groupName === groupName)
                  .map((entry) => entry.result),
              ),
          ),
        );
      },
    );

    return new TestRunResult(path, suites, time);
  }

  private collectTestCases(
    suitePath: TestSuite[],
    testSuites: TestSuite[] | undefined,
  ): { suitePath: TestSuite[]; testCase: TestCase }[] {
    return (testSuites ?? []).flatMap((suite) => {
      const path = [...suitePath, suite];
      return [
        ...this.collectTestCases(path, suite['test-suite']),
        ...(suite['test-case'] ?? []).map((testCase) => ({
          suitePath: path,
          testCase,
        })),
      ];
    });
  }

  private getTestExecutionResult(test: TestCase): TestExecutionResult {
    if (test.$.result === 'Failed' || test.failure) {
      return 'failed';
    }
    if (test.$.result === 'Skipped') {
      return 'skipped';
    }
    return 'success';
  }

  private getTestCaseError(tc: TestCase): TestCaseError | undefined {
    if (!this.options.parseErrors || !tc.failure || tc.failure.length === 0) {
      return undefined;
    }

    const details = tc.failure[0];
    const src =
      details['stack-trace'] !== undefined && details['stack-trace'].length > 0
        ? getExceptionSource(
            details['stack-trace'][0],
            this.options.trackedFiles,
            (file) => this.getRelativePath(file),
          )
        : undefined;
    const path = src?.path;
    const line = src?.line;

    return {
      path,
      line,
      message:
        details.message && details.message.length > 0 ? details.message[0] : '',
      details:
        details['stack-trace'] && details['stack-trace'].length > 0
          ? details['stack-trace'][0]
          : '',
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
