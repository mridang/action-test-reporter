/**
 * @file Parses JUnit XML test results produced by Java test runners.
 */

import path from 'node:path';
import { parseStringPromise } from 'xml2js';
import { isRecord } from '../../../record-guard.js';
import { normalizeFilePath } from '../../utils/path-utilities.js';
import {
  TestCaseResult,
  TestGroupResult,
  TestRunResult,
  TestSuiteResult,
} from '../../test-results.js';
import { parseStackTraceElement } from './java-stack-trace-element-parser.js';
import type { ParseOptions, TestParser } from '../../test-parser.js';

import type {
  JunitReport,
  SingleSuiteReport,
  TestCase,
  TestSuite,
} from './java-junit-types.js';

import type { TestCaseError, TestExecutionResult } from '../../test-results.js';

const LINE_BREAK_PATTERN = /\r?\n/u;

/**
 * Tells whether a parsed value has the root structure of a JUnit report with a testsuites root.
 * @param value - The parsed value.
 * @returns True when the value has the expected root.
 * @example
 * const supported = isJunitReport(parsed);
 */
function isJunitReport(value: unknown): value is JunitReport {
  return isRecord(value) && value.testsuites !== undefined;
}

/**
 * Tells whether a parsed value has the root structure of a JUnit report with a single testsuite root.
 * @param value - The parsed value.
 * @returns True when the value has the expected root.
 * @example
 * const supported = isSingleSuiteReport(parsed);
 */
function isSingleSuiteReport(value: unknown): value is SingleSuiteReport {
  return isRecord(value) && isRecord(value.testsuite);
}

/**
 * Parser for JUnit-style XML reports commonly produced by Java test frameworks.
 */
export class JavaJunitParser implements TestParser {
  readonly trackedFiles: { [fileName: string]: string[] };

  constructor(readonly options: ParseOptions) {
    this.trackedFiles = Object.fromEntries(
      options.trackedFiles.reduce((byName, filePath) => {
        const fileName = path.basename(filePath);
        // eslint-disable-next-line functional/immutable-data -- builds the lookup in a single pass; copying the map for every file would be quadratic
        return byName.set(fileName, [
          ...(byName.get(fileName) ?? []),
          normalizeFilePath(filePath),
        ]);
      }, new Map<string, string[]>()),
    );
  }

  async parse(filePath: string, content: string): Promise<TestRunResult> {
    const reportOrSuite = await this.getJunitReport(filePath, content);
    const ju: JunitReport = isJunitReport(reportOrSuite)
      ? reportOrSuite
      : {
          testsuites: {
            $: { time: reportOrSuite.testsuite.$.time },
            testsuite: [reportOrSuite.testsuite],
          },
        };

    return this.getTestRunResult(filePath, ju);
  }

  private async getJunitReport(
    filePath: string,
    content: string,
  ): Promise<JunitReport | SingleSuiteReport> {
    try {
      const report: unknown = await parseStringPromise(content);
      if (!isJunitReport(report) && !isSingleSuiteReport(report)) {
        throw new TypeError('The XML content is not a JUnit report');
      }
      return report;
    } catch (error) {
      throw new Error(`Invalid XML at ${filePath}\n\n${String(error)}`, {
        cause: error,
      });
    }
  }

  private getTestRunResult(
    filePath: string,
    junit: JunitReport,
  ): TestRunResult {
    const suites = junit.testsuites.testsuite
      ? this.flattenSuites(junit.testsuites.testsuite, filePath)
      : [];

    const seconds = Number.parseFloat(junit.testsuites.$?.time ?? '');
    const time = Number.isNaN(seconds) ? undefined : seconds * 1000;
    return new TestRunResult(filePath, suites, time);
  }

  private flattenSuites(
    suites: TestSuite[],
    filePath: string,
  ): TestSuiteResult[] {
    return suites.flatMap((suite): TestSuiteResult[] => {
      const nested =
        suite.testsuite && suite.testsuite.length > 0
          ? this.flattenSuites(suite.testsuite, filePath)
          : [];
      if (suite.testcase === undefined || suite.testcase.length === 0) {
        return nested;
      }
      const rawName = suite.$.name?.trim() ?? '';
      const name =
        rawName === '' || rawName === 'undefined'
          ? path.basename(filePath)
          : rawName;
      const time = Number.parseFloat(suite.$.time) * 1000;
      return [
        ...nested,
        new TestSuiteResult(name, this.getGroups(suite), time),
      ];
    });
  }

  private getGroups(suite: TestSuite): TestGroupResult[] {
    if (suite.testcase === undefined) {
      return [];
    }

    const groupNameOf = (tc: TestCase): string =>
      tc.$.classname === suite.$.name ? '' : tc.$.classname;

    return Array.from(
      new Set(suite.testcase.map((tc) => groupNameOf(tc))),
      (groupName) => {
        const tests = suite
          .testcase!.filter((tc) => groupNameOf(tc) === groupName)
          .map((tc) => {
            const name = tc.$.name.trim();
            const result = this.getTestCaseResult(tc);
            const time = Number.parseFloat(tc.$.time) * 1000;
            const error = this.getTestCaseError(tc);
            return new TestCaseResult(name, result, time, error);
          });
        return new TestGroupResult(groupName, tests);
      },
    );
  }

  private getTestCaseResult(test: TestCase): TestExecutionResult {
    if (test.failure || test.error) {
      return 'failed';
    }
    if (test.skipped) {
      return 'skipped';
    }
    return 'success';
  }

  private getTestCaseError(tc: TestCase): TestCaseError | undefined {
    if (!this.options.parseErrors) {
      return undefined;
    }

    const failures = tc.failure ?? tc.error;
    if (!failures) {
      return undefined;
    }

    const failure = failures[0];
    const details = typeof failure === 'object' ? failure._ : failure;
    const src = details ? this.exceptionThrowSource(details) : undefined;
    const filePath = src?.filePath;
    const line = src?.line;

    const failureType =
      typeof failure === 'object' ? failure.$.type : undefined;
    const failureMessage =
      typeof failure === 'object' ? failure.$.message : undefined;
    const message = failureType
      ? `${failureType}: ${failureMessage}`
      : failureMessage;
    return {
      path: filePath,
      line,
      details,
      message,
    };
  }

  private exceptionThrowSource(
    stackTrace: string,
  ): { filePath: string; line: number } | undefined {
    const lines = stackTrace.split(LINE_BREAK_PATTERN);

    // eslint-disable-next-line functional/no-loop-statements -- the lines are scanned in order and the first tracked frame wins, so later lines are never evaluated
    for (const text of lines) {
      const stackTraceElement = parseStackTraceElement(text);
      if (stackTraceElement) {
        const { tracePath, fileName, lineStr } = stackTraceElement;
        const filePath = this.getFilePath(tracePath, fileName);
        if (filePath !== undefined) {
          return { filePath, line: Number.parseInt(lineStr, 10) };
        }
      }
    }
    return undefined;
  }

  private getFilePath(tracePath: string, fileName: string): string | undefined {
    const files = this.trackedFiles[fileName] as string[] | undefined;
    if (files === undefined) {
      return undefined;
    }

    const allParts = tracePath.split(/\./gu);
    const packageIndex = allParts.findIndex((part) => part[0] <= 'Z');
    const packageParts =
      packageIndex === -1 ? allParts : allParts.slice(0, packageIndex);

    if (packageParts.length === 0) {
      return undefined;
    }

    return files.find((filePath) => {
      const directories = path.dirname(filePath).split(/\//gu);
      if (packageParts.length > directories.length) {
        return false;
      }
      const trailing = directories.slice(
        directories.length - packageParts.length,
      );
      return packageParts.every((part, index) => part === trailing[index]);
    });
  }
}
