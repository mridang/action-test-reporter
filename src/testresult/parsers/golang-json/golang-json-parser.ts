/**
 * @file Parses the JSON event stream written by go test -json.
 */

import {
  TestRunResult,
  TestSuiteResult,
  TestGroupResult,
  TestCaseResult,
} from '../../test-results.js';
import type { ParseOptions, TestParser } from '../../test-parser.js';

import type { GoTestEvent } from './golang-json-types.js';

import type { TestExecutionResult, TestCaseError } from '../../test-results.js';

const GO_OUTPUT_INDENT = /^ {4}/u;

/**
 * Maps the final action of a Go test to the result that is reported for it.
 */
const RESULT_BY_ACTION = new Map<string, TestExecutionResult>([
  ['pass', 'success'],
  ['skip', 'skipped'],
]);

/**
 * Parser for Go test JSON output produced with `go test -json`.
 */
export class GolangJsonParser implements TestParser {
  constructor(readonly options: ParseOptions) {}

  async parse(path: string, content: string): Promise<TestRunResult> {
    const events = await this.getGolangTestEvents(path, content);
    return this.getTestRunResult(path, events);
  }

  private async getGolangTestEvents(
    path: string,
    content: string,
  ): Promise<GoTestEvent[]> {
    return content
      .trim()
      .split('\n')
      .map((line, index) => {
        try {
          return JSON.parse(line) as GoTestEvent;
        } catch (error) {
          throw new Error(
            `Invalid JSON at ${path} line ${index + 1}\n\n${String(error)}`,
            { cause: error },
          );
        }
      });
  }

  private getTestRunResult(path: string, events: GoTestEvent[]): TestRunResult {
    const eventGroups = events
      .filter((event) => event.Test)
      .reduce((groups, event) => {
        const key = `${event.Package}/${event.Test}`;
        // eslint-disable-next-line functional/immutable-data -- builds the lookup in a single pass; copying the map for every event would be quadratic
        return groups.set(key, [...(groups.get(key) ?? []), event]);
      }, new Map<string, GoTestEvent[]>());

    const entries = Array.from(eventGroups.values(), (eventGroup) => {
      const event = eventGroup[0];
      const [first, ...rest] = event.Test!.split('/');
      const joined = rest.join('/');
      const groupName: string | null = joined ? first : null;
      const testName = joined || first;

      const lastEvent = eventGroup.at(-1)!;

      const result: TestExecutionResult =
        RESULT_BY_ACTION.get(lastEvent.Action) ?? 'failed';
      if (lastEvent.Elapsed === undefined) {
        throw new Error('missing elapsed on final test event');
      }
      const time: number = lastEvent.Elapsed * 1000;

      const details = eventGroup
        .filter((outputEvent) => outputEvent.Action === 'output')
        .map((outputEvent) => outputEvent.Output ?? '')
        .map((o) => o.replace(GO_OUTPUT_INDENT, ''))
        .slice(1, -1)
        .join('');
      const error: TestCaseError | undefined =
        result === 'success' ? undefined : { message: details, details };

      return {
        packageName: event.Package,
        groupName,
        testCase: new TestCaseResult(testName, result, time, error),
      };
    });

    const suites = Array.from(
      new Set(entries.map((entry) => entry.packageName)),
      (packageName) => {
        const inSuite = entries.filter(
          (entry) => entry.packageName === packageName,
        );
        return new TestSuiteResult(
          packageName,
          Array.from(
            new Set(inSuite.map((entry) => entry.groupName)),
            (groupName) =>
              new TestGroupResult(
                groupName,
                inSuite
                  .filter((entry) => entry.groupName === groupName)
                  .map((entry) => entry.testCase),
              ),
          ),
        );
      },
    );

    return new TestRunResult(path, suites);
  }
}
