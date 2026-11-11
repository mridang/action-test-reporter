/**
 * @file Parses the JSON event stream written by the Dart test runner.
 */

import { ParseOptions, TestParser } from '../../test-parser.js';

import { getBasePath, normalizeFilePath } from '../../utils/path-utils.js';

import {
  ReportEvent,
  Suite,
  Group,
  TestStartEvent,
  TestDoneEvent,
  ErrorEvent,
  isSuiteEvent,
  isGroupEvent,
  isTestStartEvent,
  isTestDoneEvent,
  isErrorEvent,
  isDoneEvent,
  isMessageEvent,
  MessageEvent,
} from './dart-json-types.js';

import {
  TestExecutionResult,
  TestRunResult,
  TestSuiteResult,
  TestGroupResult,
  TestCaseResult,
  TestCaseError,
} from '../../test-results.js';

/**
 * Captures the exception text of a Flutter test print. A single whitespace character separates the text from its
 * surroundings in the pattern, which keeps the scan linear, so callers trim the leading whitespace of the capture.
 */
export const FLUTTER_EXCEPTION_PRINT =
  /^══╡ EXCEPTION CAUGHT BY FLUTTER TEST FRAMEWORK ╞═+\s(.*)\sWhen the exception was thrown, this was the stack:/ms;

/**
 * Extracts the file path and line number from a Dart stack trace line such as
 * `lib/main.dart 12:5  main`. A single whitespace character must precede the line number, because the greedy
 * path group already absorbs any further whitespace and the scan then stays linear.
 * @param line - A single line of the stack trace.
 * @returns The file path and the line number text, or undefined when the line is not a project frame.
 * @example
 * const match = matchDartFrame('test/a_test.dart 12:5  main');
 */
export function matchDartFrame(
  line: string,
): [path: string, line: string] | undefined {
  const match = /^(?!package:)(.*)\s(\d+):\d+\s/.exec(line);
  return match === null ? undefined : [match[1], match[2]];
}

/**
 * Extracts the file path and line number from a Flutter stack trace line such as
 * `#0      main (file:///work/test/a_test.dart:12:5)`. The text between the frame number and the location is
 * matched once, and the opening parenthesis in front of the path is then found from the right, skipping the ones
 * that start a package location.
 * @param line - A single line of the stack trace.
 * @returns The file path and the line number text, or undefined when the line is not a project frame.
 * @example
 * const match = matchFlutterFrame('#0 main (file:///work/test/a_test.dart:12:5)');
 */
export function matchFlutterFrame(
  line: string,
): [path: string, line: string] | undefined {
  const match = /^(#\d+\s)(.*):(\d+):\d+\)$/.exec(line);
  if (match === null) {
    return undefined;
  }
  const [, head, middle, lineStr] = match;
  let open = middle.lastIndexOf('(');
  while (open !== -1 && line.startsWith('package:', head.length + open + 1)) {
    open = open === 0 ? -1 : middle.lastIndexOf('(', open - 1);
  }
  return open === -1 ? undefined : [middle.slice(open + 1), lineStr];
}

class TestRun {
  constructor(
    readonly path: string,
    readonly suites: TestSuite[],
    readonly success: boolean,
    readonly time: number,
  ) {}
}

class TestSuite {
  constructor(readonly suite: Suite) {}
  readonly groups: { [id: number]: TestGroup } = {};
}

class TestGroup {
  constructor(readonly group: Group) {}
  readonly tests: TestCase[] = [];
}

class TestCase {
  constructor(readonly testStart: TestStartEvent) {
    this.groupId = testStart.test.groupIDs.at(-1)!;
  }
  readonly groupId: number;
  readonly print: MessageEvent[] = [];
  testDone?: TestDoneEvent;
  error?: ErrorEvent;

  get result(): TestExecutionResult {
    if (this.testDone?.skipped) {
      return 'skipped';
    }
    if (this.testDone?.result === 'success') {
      return 'success';
    }

    if (
      this.testDone?.result === 'error' ||
      this.testDone?.result === 'failure'
    ) {
      return 'failed';
    }

    return undefined;
  }

  get time(): number {
    return this.testDone === undefined
      ? 0
      : this.testDone.time - this.testStart.time;
  }
}

/**
 * Parser for JSON test result streams emitted by Dart and Flutter test runners.
 * Auto-detects whether the output is from Dart or Flutter based on stack trace patterns.
 */
export class DartJsonParser implements TestParser {
  assumedWorkDir: string | undefined;

  constructor(readonly options: ParseOptions) {}

  async parse(path: string, content: string): Promise<TestRunResult> {
    const tr = this.getTestRun(path, content);
    return this.getTestRunResult(tr);
  }

  private getTestRun(path: string, content: string): TestRun {
    const lines = content.split(/\n\r?/g);
    const events = lines
      .map((str, i) => {
        if (str.trim() === '') {
          return null;
        }
        try {
          return JSON.parse(str);
        } catch (error) {
          const errWithCol = error as { columnNumber?: number };
          const col =
            errWithCol.columnNumber === undefined
              ? ''
              : `:${errWithCol.columnNumber}`;
          throw new Error(`Invalid JSON at ${path}:${i + 1}${col}\n\n${error}`);
        }
      })
      .filter((evt) => evt != null) as ReportEvent[];

    let success = false;
    let totalTime = 0;
    const suites: { [id: number]: TestSuite } = {};
    const tests: { [id: number]: TestCase } = {};

    for (const evt of events) {
      if (isSuiteEvent(evt)) {
        suites[evt.suite.id] = new TestSuite(evt.suite);
      } else if (isGroupEvent(evt)) {
        suites[evt.group.suiteID].groups[evt.group.id] = new TestGroup(
          evt.group,
        );
      } else if (isTestStartEvent(evt) && evt.test.url !== null) {
        const test: TestCase = new TestCase(evt);
        const suite = suites[evt.test.suiteID];
        const groupIndex = evt.test.groupIDs.length - 1;
        const group = suite.groups[evt.test.groupIDs[groupIndex]];
        group.tests.push(test);
        tests[evt.test.id] = test;
      } else if (isTestDoneEvent(evt) && tests[evt.testID]) {
        tests[evt.testID].testDone = evt;
      } else if (isErrorEvent(evt) && tests[evt.testID]) {
        tests[evt.testID].error = evt;
      } else if (isMessageEvent(evt) && tests[evt.testID]) {
        tests[evt.testID].print.push(evt);
      } else if (isDoneEvent(evt)) {
        success = evt.success;
        totalTime = evt.time;
      } else {
        // Start, suite and group events do not contribute to the totals.
      }
    }

    return new TestRun(path, Object.values(suites), success, totalTime);
  }

  private getTestRunResult(tr: TestRun): TestRunResult {
    const suites = tr.suites.map((s) => {
      return new TestSuiteResult(
        this.getRelativePath(s.suite.path),
        this.getGroups(s),
      );
    });

    return new TestRunResult(tr.path, suites, tr.time);
  }

  private getGroups(suite: TestSuite): TestGroupResult[] {
    const groups = Object.values(suite.groups).filter(
      (grp) => grp.tests.length > 0,
    );
    groups.sort((a, b) => (a.group.line ?? 0) - (b.group.line ?? 0));

    return groups.map((group) => {
      group.tests.sort(
        (a, b) => (a.testStart.test.line ?? 0) - (b.testStart.test.line ?? 0),
      );
      const tests = group.tests
        .filter((tc) => !tc.testDone?.hidden)
        .map((tc) => {
          const error = this.getError(suite, tc);
          const testName =
            group.group.name !== undefined &&
            tc.testStart.test.name.startsWith(group.group.name)
              ? tc.testStart.test.name.slice(group.group.name.length).trim()
              : tc.testStart.test.name.trim();
          return new TestCaseResult(testName, tc.result, tc.time, error);
        });
      return new TestGroupResult(group.group.name, tests);
    });
  }

  private getError(
    testSuite: TestSuite,
    test: TestCase,
  ): TestCaseError | undefined {
    if (!this.options.parseErrors || !test.error) {
      return undefined;
    }

    const { trackedFiles } = this.options;
    const stackTrace = test.error?.stackTrace ?? '';
    const print = test.print
      .filter((p) => p.messageType === 'print')
      .map((p) => p.message)
      .join('\n');
    const details = [print, stackTrace].filter((str) => str !== '').join('\n');
    const src = this.exceptionThrowSource(details, trackedFiles);
    const message = this.getErrorMessage(test.error?.error ?? '', print);
    let path;
    let line;

    if (src === undefined) {
      const testStartPath = this.getRelativePath(testSuite.suite.path);
      if (trackedFiles.includes(testStartPath)) {
        path = testStartPath;
        line =
          test.testStart.test.root_line ??
          test.testStart.test.line ??
          undefined;
      }
    } else {
      path = src.path;
      line = src.line;
    }

    return {
      path,
      line,
      message,
      details,
    };
  }

  private getErrorMessage(message: string, print: string): string {
    // Try Flutter-specific error extraction (works for both Dart and Flutter)
    const uselessMessageRe =
      /^Test failed\. See exception logs above\.\nThe test description was:/m;
    if (uselessMessageRe.test(message)) {
      const match = FLUTTER_EXCEPTION_PRINT.exec(print);
      if (match !== null) {
        return match[1].trimStart();
      }
    }

    return message || print;
  }

  private exceptionThrowSource(
    ex: string,
    trackedFiles: string[],
  ): { path: string; line: number } | undefined {
    const lines = ex.split(/\r?\n/g);

    // Try both Dart and Flutter stack trace patterns.
    const matchers = [matchDartFrame, matchFlutterFrame];

    for (const matcher of matchers) {
      const found = this.findTrackedFrame(lines, matcher, trackedFiles);
      if (found) {
        return found;
      }
    }
  }

  /**
   * Finds the first stack trace line that matches a pattern and points to a tracked file.
   * @param lines - The lines of the stack trace.
   * @param matcher - The function that extracts the file path and the line number from a line.
   * @param trackedFiles - The files tracked by Git.
   * @returns The relative path and line of the frame, or undefined when none matches.
   * @example
   * const frame = this.findTrackedFrame(lines, matchDartFrame, trackedFiles);
   */
  private findTrackedFrame(
    lines: string[],
    matcher: (line: string) => [path: string, line: string] | undefined,
    trackedFiles: string[],
  ): { path: string; line: number } | undefined {
    for (const str of lines) {
      const match = matcher(str);
      if (match !== undefined) {
        const [pathStr, lineStr] = match;
        const path = normalizeFilePath(this.getRelativePath(pathStr));
        if (trackedFiles.includes(path)) {
          return { path, line: Number.parseInt(lineStr) };
        }
      }
    }
    return undefined;
  }

  private getRelativePath(path: string): string {
    const prefix = 'file://';
    if (path.startsWith(prefix)) {
      path = path.slice(prefix.length);
    }

    path = normalizeFilePath(path);
    const workDir = this.getWorkDir(path);
    if (workDir !== undefined && path.startsWith(workDir)) {
      path = path.slice(workDir.length);
    }
    return path;
  }

  private getWorkDir(path: string): string | undefined {
    return (
      this.options.workDir ??
      this.assumedWorkDir ??
      (this.assumedWorkDir = getBasePath(path, this.options.trackedFiles))
    );
  }
}
