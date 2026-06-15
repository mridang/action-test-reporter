import * as path from 'path';
import { ParseOptions, TestParser } from '../../test-parser.js';
import { parseStringPromise } from 'xml2js';

import {
  JunitReport,
  SingleSuiteReport,
  TestCase,
  TestSuite,
} from './java-junit-types.js';
import { parseStackTraceElement } from './java-stack-trace-element-parser.js';
import { normalizeFilePath } from '../../utils/path-utils.js';

import {
  TestCaseError,
  TestCaseResult,
  TestExecutionResult,
  TestGroupResult,
  TestRunResult,
  TestSuiteResult,
} from '../../test-results.js';

/**
 * Parser for JUnit-style XML reports commonly produced by Java test frameworks.
 */
export class JavaJunitParser implements TestParser {
  readonly trackedFiles: { [fileName: string]: string[] };

  constructor(readonly options: ParseOptions) {
    this.trackedFiles = {};
    for (const filePath of options.trackedFiles) {
      const fileName = path.basename(filePath);
      const files =
        this.trackedFiles[fileName] ?? (this.trackedFiles[fileName] = []);
      files.push(normalizeFilePath(filePath));
    }
  }

  async parse(filePath: string, content: string): Promise<TestRunResult> {
    const reportOrSuite = await this.getJunitReport(filePath, content);
    const isReport = (reportOrSuite as JunitReport).testsuites !== undefined;

    let ju: JunitReport;
    if (isReport) {
      ju = reportOrSuite as JunitReport;
    } else {
      const suite = (reportOrSuite as SingleSuiteReport).testsuite;
      ju = {
        testsuites: {
          $: { time: suite.$.time },
          testsuite: [suite],
        },
      };
    }

    return this.getTestRunResult(filePath, ju);
  }

  private async getJunitReport(
    filePath: string,
    content: string,
  ): Promise<JunitReport | SingleSuiteReport> {
    try {
      return await parseStringPromise(content);
    } catch (e) {
      throw new Error(`Invalid XML at ${filePath}\n\n${e}`);
    }
  }

  private getTestRunResult(
    filePath: string,
    junit: JunitReport,
  ): TestRunResult {
    const suites = junit.testsuites.testsuite
      ? this.flattenSuites(junit.testsuites.testsuite, filePath)
      : [];

    const seconds = parseFloat(junit.testsuites.$?.time);
    const time = isNaN(seconds) ? undefined : seconds * 1000;
    return new TestRunResult(filePath, suites, time);
  }

  private flattenSuites(
    suites: TestSuite[],
    filePath: string,
  ): TestSuiteResult[] {
    const results: TestSuiteResult[] = [];
    for (const suite of suites) {
      if (suite.testsuite && suite.testsuite.length > 0) {
        results.push(...this.flattenSuites(suite.testsuite, filePath));
      }
      if (suite.testcase !== undefined && suite.testcase.length > 0) {
        const rawName = suite.$.name?.trim() ?? '';
        const name =
          rawName === '' || rawName === 'undefined'
            ? path.basename(filePath)
            : rawName;
        const time = parseFloat(suite.$.time) * 1000;
        results.push(new TestSuiteResult(name, this.getGroups(suite), time));
      }
    }
    return results;
  }

  private getGroups(suite: TestSuite): TestGroupResult[] {
    if (suite.testcase === undefined) {
      return [];
    }

    const groups: { name: string; tests: TestCase[] }[] = [];
    for (const tc of suite.testcase) {
      const className = tc.$.classname === suite.$.name ? '' : tc.$.classname;
      let grp = groups.find((g) => g.name === className);
      if (grp === undefined) {
        grp = { name: className, tests: [] };
        groups.push(grp);
      }
      grp.tests.push(tc);
    }

    return groups.map((grp) => {
      const tests = grp.tests.map((tc) => {
        const name = tc.$.name.trim();
        const result = this.getTestCaseResult(tc);
        const time = parseFloat(tc.$.time) * 1000;
        const error = this.getTestCaseError(tc);
        return new TestCaseResult(name, result, time, error);
      });
      return new TestGroupResult(grp.name, tests);
    });
  }

  private getTestCaseResult(test: TestCase): TestExecutionResult {
    if (test.failure || test.error) return 'failed';
    if (test.skipped) return 'skipped';
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
    let filePath;
    let line;

    if (details != null) {
      const src = this.exceptionThrowSource(details);
      if (src) {
        filePath = src.filePath;
        line = src.line;
      }
    }

    let message;
    if (typeof failure === 'object') {
      message = failure.$.message;
      if (failure.$?.type) {
        message = failure.$.type + ': ' + message;
      }
    }
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
    const lines = stackTrace.split(/\r?\n/);

    for (const str of lines) {
      const stackTraceElement = parseStackTraceElement(str);
      if (stackTraceElement) {
        const { tracePath, fileName, lineStr } = stackTraceElement;
        const filePath = this.getFilePath(tracePath, fileName);
        if (filePath !== undefined) {
          const line = parseInt(lineStr);
          return { filePath, line };
        }
      }
    }
  }

  private getFilePath(tracePath: string, fileName: string): string | undefined {
    const files = this.trackedFiles[fileName];
    if (files === undefined) {
      return undefined;
    }

    const packageParts = tracePath.split(/\./g);
    const packageIndex = packageParts.findIndex((part) => part[0] <= 'Z');
    if (packageIndex !== -1) {
      packageParts.splice(packageIndex, packageParts.length - packageIndex);
    }

    if (packageParts.length === 0) {
      return undefined;
    }

    for (const filePath of files) {
      const dirs = path.dirname(filePath).split(/\//g);
      if (packageParts.length > dirs.length) {
        continue;
      }
      if (dirs.length > packageParts.length) {
        dirs.splice(0, dirs.length - packageParts.length);
      }
      const isMatch = packageParts.every((part, i) => part === dirs[i]);
      if (isMatch) {
        return filePath;
      }
    }

    return undefined;
  }
}
