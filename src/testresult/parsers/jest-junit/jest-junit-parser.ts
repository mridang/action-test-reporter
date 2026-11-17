/**
 * @file Parses JUnit XML test results produced by Jest.
 */

import { parseStringPromise } from 'xml2js';

import { getExceptionSource } from '../../utils/node-utilities.js';
import { getBasePath, normalizeFilePath } from '../../utils/path-utilities.js';

import {
  TestCaseResult,
  TestGroupResult,
  TestRunResult,
  TestSuiteResult,
} from '../../test-results.js';
import type { TestCaseError, TestExecutionResult } from '../../test-results.js';
import type { JunitReport, TestCase, TestSuite } from './jest-junit-types.js';
import type { ParseOptions, TestParser } from '../../test-parser.js';

const JEST_SUITE_NAME_PATTERN = /jest|__tests__|\.test|\.spec/iu;
const JEST_CLASS_NAME_PATTERN = /›|__tests__|\.test|\.spec|\/|\\/iu;

/**
 * Parser for JUnit XML reports emitted by Jest with the jest-junit reporter.
 */
export class JestJunitParser implements TestParser {
  assumedWorkDir: string | undefined;

  constructor(readonly options: ParseOptions) {}

  async parse(path: string, content: string): Promise<TestRunResult> {
    const ju = await this.getJunitReport(path, content);
    if (!this.isProbablyJestReport(ju)) {
      throw new Error(
        'Not a Jest JUnit report: structure or naming does not match jest-junit output.',
      );
    }
    return this.getTestRunResult(path, ju);
  }

  private async getJunitReport(
    path: string,
    content: string,
  ): Promise<JunitReport> {
    try {
      return (await parseStringPromise(content)) as JunitReport;
    } catch (error) {
      throw new Error(`Invalid XML at ${path}\n\n${String(error)}`, {
        cause: error,
      });
    }
  }

  private getTestRunResult(path: string, junit: JunitReport): TestRunResult {
    const suites =
      junit.testsuites.testsuite === undefined
        ? []
        : junit.testsuites.testsuite.map((ts) => {
            const name = this.escapeCharacters(ts.$.name.trim());
            const time = Number.parseFloat(ts.$.time) * 1000;
            return new TestSuiteResult(name, this.getGroups(ts), time);
          });

    const time =
      junit.testsuites.$ && Number.parseFloat(junit.testsuites.$.time) * 1000;
    return new TestRunResult(path, suites, time);
  }

  private isProbablyJestReport(junit: JunitReport): boolean {
    const suites = junit.testsuites.testsuite ?? [];
    const flatten = (nested: TestSuite[]): TestSuite[] =>
      nested.flatMap((suite) => [suite, ...flatten(suite.testsuite ?? [])]);
    const allSuites = flatten(suites);
    const suiteNames = allSuites.flatMap((suite) =>
      suite.$?.name ? [suite.$.name] : [],
    );
    const testcaseClassNames = allSuites
      .flatMap((suite) => suite.testcase ?? [])
      .map((tc) => tc.$?.classname as string | undefined)
      .filter((name): name is string => name !== undefined);
    const hasNestedSuites = allSuites.some(
      (suite) => suite.testsuite && suite.testsuite.length > 0,
    );

    if (hasNestedSuites) {
      return false;
    }

    const topLevelName = junit.testsuites.$?.name ?? '';
    const suiteNameHint = suiteNames.some((n) =>
      JEST_SUITE_NAME_PATTERN.test(n),
    );
    const testcaseClassHint = testcaseClassNames.some(
      (cn) => cn === '' || JEST_CLASS_NAME_PATTERN.test(cn ?? ''),
    );
    const topLevelHint = topLevelName.includes('jest');

    const hasNameHint = suiteNameHint || testcaseClassHint || topLevelHint;
    return hasNameHint || suites.length > 0 || testcaseClassNames.length > 0;
  }

  private getGroups(suite: TestSuite): TestGroupResult[] {
    if (!suite.testcase) {
      return [];
    }

    const testcases = suite.testcase;
    return Array.from(
      new Set(testcases.map((tc) => tc.$.classname)),
      (describe) => {
        const tests = testcases
          .filter((tc) => tc.$.classname === describe)
          .map((tc) => {
            const name = tc.$.name.trim();
            const result = this.getTestCaseResult(tc);
            const time = Number.parseFloat(tc.$.time) * 1000;
            const error = this.getTestCaseError(tc);
            return new TestCaseResult(name, result, time, error);
          });
        return new TestGroupResult(describe, tests);
      },
    );
  }

  private getTestCaseResult(test: TestCase): TestExecutionResult {
    if (test.failure) {
      return 'failed';
    }
    if (test.skipped) {
      return 'skipped';
    }
    return 'success';
  }

  private getTestCaseError(tc: TestCase): TestCaseError | undefined {
    if (!this.options.parseErrors || !tc.failure) {
      return undefined;
    }

    const details =
      typeof tc.failure[0] === 'string' ? tc.failure[0] : tc.failure[0]._;
    const src = getExceptionSource(details, this.options.trackedFiles, (file) =>
      this.getRelativePath(file),
    );
    const path = src?.path;
    const line = src?.line;

    return {
      path,
      line,
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

  private escapeCharacters(s: string): string {
    return s.replaceAll(/([<>])/gu, String.raw`\$1`);
  }
}
