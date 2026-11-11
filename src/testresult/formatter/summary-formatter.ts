/**
 * @file Formats test results as a Markdown summary for the GitHub Actions job summary.
 */

import { info, warning } from '@actions/core';
import {
  TestExecutionResult,
  TestRunResult,
  TestSuiteResult,
  TestCaseError,
} from '../test-results.js';
import {
  Align,
  formatTime,
  Icon,
  link,
  table,
} from '../utils/markdown-utils.js';
import { DEFAULT_LOCALE } from '../utils/node-utils.js';
import { getFirstNonEmptyLine } from '../utils/parse-utils.js';
import { slug } from '../utils/slugger.js';

const MAX_REPORT_LENGTH = 65_535;
const MAX_ACTIONS_SUMMARY_LENGTH = 1_048_576;

interface TestResultFormatter<TOptions> {
  format(
    results: TestRunResult[],
    options: TOptions,
    shortSummary?: string,
  ): string;
}

export interface ReportOptions {
  listSuites: 'all' | 'failed' | 'none';
  listTests: 'all' | 'failed' | 'none';
  baseUrl: string;
  onlySummary: boolean;
  useActionsSummary: boolean;
  badgeTitle: string;
  reportTitle: string;
  collapsed: 'auto' | 'always' | 'never';
}

export const DEFAULT_OPTIONS: ReportOptions = {
  listSuites: 'all',
  listTests: 'all',
  baseUrl: '',
  onlySummary: false,
  useActionsSummary: true,
  badgeTitle: 'tests',
  reportTitle: '',
  collapsed: 'auto',
};

export class SummaryFormatter implements TestResultFormatter<ReportOptions> {
  public format(
    results: TestRunResult[],
    options: ReportOptions = DEFAULT_OPTIONS,
    shortSummary = '',
  ): string {
    return getReport(results, options, shortSummary);
  }
}

/**
 * Renders the test results as a Markdown report and trims it when it exceeds the GitHub size limit.
 * @param results - The test runs to include in the report.
 * @param options - The options that control the layout of the report.
 * @param shortSummary - A one-line summary shown below the report title.
 * @returns The Markdown report.
 * @example
 * const markdown = getReport(results, DEFAULT_OPTIONS, '3 passed, 1 failed');
 */
export function getReport(
  results: TestRunResult[],
  options: ReportOptions = DEFAULT_OPTIONS,
  shortSummary = '',
): string {
  applySort(results);

  const opts = { ...options };
  let view = renderReport(results, opts, shortSummary);
  let report = view.join('\n');

  if (getByteLength(report) <= getMaxReportLength(options)) {
    return report;
  }

  if (opts.listTests === 'all') {
    info("Test report summary is too big - setting 'listTests' to 'failed'");
    opts.listTests = 'failed';
    view = renderReport(results, opts, shortSummary);
    report = view.join('\n');
    if (getByteLength(report) <= getMaxReportLength(options)) {
      return report;
    }
  }

  warning(
    `Test report summary exceeded limit of ${getMaxReportLength(options)} bytes and will be trimmed`,
  );
  return trimReport(view, options);
}

/**
 * Returns the byte limit for a report, which depends on whether it is written to the job summary.
 * @param options - The options that decide where the report is written.
 * @returns The maximum number of bytes the report may take.
 * @example
 * const limit = getMaxReportLength(DEFAULT_OPTIONS);
 */
function getMaxReportLength(options: ReportOptions = DEFAULT_OPTIONS): number {
  return options.useActionsSummary
    ? MAX_ACTIONS_SUMMARY_LENGTH
    : MAX_REPORT_LENGTH;
}

/**
 * Cuts the report lines down to the byte limit and appends a notice that the report was trimmed.
 * @param lines - The report lines to trim.
 * @param options - The options that decide the byte limit.
 * @returns The trimmed report, with the notice on its last line.
 * @example
 * const report = trimReport(['# Results', '```', 'output', '```'], DEFAULT_OPTIONS);
 */
function trimReport(lines: string[], options: ReportOptions): string {
  const closingBlock = '```';
  const errorMsg = `**Report exceeded GitHub limit of ${getMaxReportLength(options)} bytes and has been trimmed**`;
  const maxErrorMsgLength = closingBlock.length + errorMsg.length + 2;
  const maxReportLength = getMaxReportLength(options) - maxErrorMsgLength;

  let reportLength = 0;
  let codeBlock = false;
  let endLineIndex: number;
  for (endLineIndex = 0; endLineIndex < lines.length; endLineIndex++) {
    const line = lines[endLineIndex];
    const lineLength = getByteLength(line);

    reportLength += lineLength + 1;
    if (reportLength > maxReportLength) {
      break;
    }

    if (line === '```') {
      codeBlock = !codeBlock;
    }
  }

  const reportLines = lines.slice(0, endLineIndex);
  if (codeBlock) {
    reportLines.push('```');
  }
  reportLines.push(errorMsg);
  return reportLines.join('\n');
}

/**
 * Sorts the test runs and their suites alphabetically by name, in place.
 * @param results - The test runs to sort, which are also sorted in place.
 * @example
 * applySort(testRuns);
 */
function applySort(results: TestRunResult[]): void {
  results.sort((a, b) => a.path.localeCompare(b.path, DEFAULT_LOCALE));
  for (const res of results) {
    res.suites.sort((a, b) => a.name.localeCompare(b.name, DEFAULT_LOCALE));
  }
}

/**
 * Returns the length of a string in UTF-8 bytes, which is the unit GitHub uses for its limits.
 * @param text - The text to measure.
 * @returns The number of UTF-8 bytes in the text.
 * @example
 * const size = getByteLength('report');
 */
function getByteLength(text: string): number {
  return Buffer.byteLength(text, 'utf8');
}

/**
 * Builds the lines of a report with its title, short summary, overall badge and per-run sections.
 * @param results - The test runs to render.
 * @param options - The options that control the layout of the report.
 * @param shortSummary - A one-line summary shown below the title.
 * @returns The lines of the report.
 * @example
 * const lines = renderReport(results, DEFAULT_OPTIONS, '');
 */
function renderReport(
  results: TestRunResult[],
  options: ReportOptions,
  shortSummary: string,
): string[] {
  const sections: string[] = [];

  const reportTitle: string = options.reportTitle.trim();
  if (reportTitle) {
    sections.push(`# ${reportTitle}`);
  }

  if (shortSummary) {
    sections.push(`## ${shortSummary}`);
  }

  const badge = getReportBadge(results, options);
  sections.push(badge, '');

  const runs = getTestRunsReport(results, options);
  sections.push(...runs);

  return sections;
}

/**
 * Creates a single badge that summarises the results of all test runs combined.
 * @param results - The test runs whose counts are added together.
 * @param options - The options that control the badge title.
 * @returns The Markdown image of the badge.
 * @example
 * const badge = getReportBadge(results, DEFAULT_OPTIONS);
 */
function getReportBadge(
  results: TestRunResult[],
  options: ReportOptions,
): string {
  const passed = results.reduce((sum, tr) => sum + tr.passed, 0);
  const skipped = results.reduce((sum, tr) => sum + tr.skipped, 0);
  const failed = results.reduce((sum, tr) => sum + tr.failed, 0);
  return getBadge(passed, failed, skipped, options);
}

/**
 * Creates a Markdown badge that summarises the passed, failed and skipped test counts.
 * @param passed - The number of passed tests.
 * @param failed - The number of failed tests.
 * @param skipped - The number of skipped tests.
 * @param options - The options that control the badge title and hint.
 * @returns The Markdown image of the badge.
 * @example
 * const badge = getBadge(10, 0, 1, DEFAULT_OPTIONS);
 */
export function getBadge(
  passed: number,
  failed: number,
  skipped: number,
  options: ReportOptions,
): string {
  const text = [];
  if (passed > 0) {
    text.push(`${passed} passed`);
  }
  if (failed > 0) {
    text.push(`${failed} failed`);
  }
  if (skipped > 0) {
    text.push(`${skipped} skipped`);
  }
  const message = text.length > 0 ? text.join(', ') : 'none';

  let color = 'success';
  if (passed === 0 && failed === 0) {
    color = 'yellow';
  }
  if (failed > 0) {
    color = 'critical';
  }
  const hint = failed > 0 ? 'Tests failed' : 'Tests passed successfully';
  const encodedBadgeTitle = encodeImgShieldsURIComponent(options.badgeTitle);
  const encodedMessage = encodeImgShieldsURIComponent(message);
  const encodedColor = encodeImgShieldsURIComponent(color);
  return `![${hint}](https://img.shields.io/badge/${encodedBadgeTitle}-${encodedMessage}-${encodedColor})`;
}

/**
 * Renders a section for every test run, including the suites and tests that each one contains.
 * @param testRuns - The test runs to render.
 * @param options - The options that control which tests are listed.
 * @returns The Markdown lines for all test runs.
 * @example
 * const lines = getTestRunsReport(testRuns, DEFAULT_OPTIONS);
 */
function getTestRunsReport(
  testRuns: TestRunResult[],
  options: ReportOptions,
): string[] {
  const sections: string[] = [];

  if (testRuns.length > 0 || options.onlySummary) {
    const tableData = testRuns
      .map((tr, originalIndex) => ({ tr, originalIndex }))
      .filter(({ tr }) => tr.passed > 0 || tr.failed > 0 || tr.skipped > 0)
      .map(({ tr, originalIndex }) => {
        const time = formatTime(tr.time);
        const name = tr.path;
        const addr = options.baseUrl + makeRunSlug(originalIndex, options).link;
        const nameLink = link(name, addr);
        const passed = tr.passed > 0 ? `${tr.passed} ${Icon.success}` : '';
        const failed = tr.failed > 0 ? `${tr.failed} ${Icon.fail}` : '';
        const skipped = tr.skipped > 0 ? `${tr.skipped} ${Icon.skip}` : '';
        return [nameLink, passed, failed, skipped, time];
      });

    const resultsTable = table(
      ['Report', 'Passed', 'Failed', 'Skipped', 'Time'],
      [Align.Left, Align.Right, Align.Right, Align.Right, Align.Right],
      ...tableData,
    );
    sections.push('', resultsTable);
  }

  if (!options.onlySummary) {
    const suitesReports = testRuns.flatMap((tr, i) =>
      getSuitesReport(tr, i, options),
    );
    sections.push(...suitesReports);
  }
  return sections;
}

/**
 * Renders the section for each suite of a single test run.
 * @param tr - The test run that owns the suites.
 * @param runIndex - The position of the test run in the report, used to build anchors.
 * @param options - The options that control which tests are listed.
 * @returns The Markdown lines for the suites of the test run.
 * @example
 * const lines = getSuitesReport(testRun, 0, DEFAULT_OPTIONS);
 */
function getSuitesReport(
  tr: TestRunResult,
  runIndex: number,
  options: ReportOptions,
): string[] {
  const sections: string[] = [];
  const suites =
    options.listSuites === 'failed'
      ? tr.suites.filter((suite) => suite.result === 'failed')
      : tr.suites;

  if (options.listSuites !== 'none') {
    const trSlug = makeRunSlug(runIndex, options);
    const nameLink = `<a id="${trSlug.id}" href="${options.baseUrl + trSlug.link}">${tr.path}</a>`;
    const icon = getResultIcon(tr.result);
    sections.push(`## ${icon}\u00A0${nameLink}`);

    const time = formatTime(tr.time);
    const headingLine2 =
      tr.tests > 0
        ? `**${tr.tests}** tests were completed in **${time}** with **${tr.passed}** passed, **${tr.failed}** failed and **${tr.skipped}** skipped.`
        : 'No tests found';
    sections.push(headingLine2);

    if (suites.length > 0) {
      const suitesTable = table(
        ['Test suite', 'Passed', 'Failed', 'Skipped', 'Time'],
        [Align.Left, Align.Right, Align.Right, Align.Right, Align.Right],
        ...suites.map((s: TestSuiteResult, suiteIndex: number) => {
          const tsTime = formatTime(s.time);
          const tsName = s.name;
          const skipLink =
            options.listTests === 'none' ||
            (options.listTests === 'failed' && s.result !== 'failed');
          const tsAddr =
            options.baseUrl + makeSuiteSlug(runIndex, suiteIndex, options).link;
          const tsNameLink = skipLink ? tsName : link(tsName, tsAddr);
          const passed = s.passed > 0 ? `${s.passed} ${Icon.success}` : '';
          const failed = s.failed > 0 ? `${s.failed} ${Icon.fail}` : '';
          const skipped = s.skipped > 0 ? `${s.skipped} ${Icon.skip}` : '';
          return [tsNameLink, passed, failed, skipped, tsTime];
        }),
      );
      sections.push('', suitesTable);
    }
  }

  if (options.listTests !== 'none') {
    const tests = suites.flatMap((ts: TestSuiteResult, suiteIndex: number) =>
      getTestsReport(ts, runIndex, suiteIndex, options),
    );

    if (tests.length > 1) {
      sections.push(...tests);
    }
  }

  return sections;
}

/**
 * Renders the table of tests for a single suite, listing the tests that match the report options.
 * @param ts - The suite whose tests are rendered.
 * @param runIndex - The position of the owning test run, used to build anchors.
 * @param suiteIndex - The position of the suite within its test run, used to build anchors.
 * @param options - The options that control which tests are listed.
 * @returns The Markdown lines for the tests of the suite.
 * @example
 * const lines = getTestsReport(suite, 0, 0, DEFAULT_OPTIONS);
 */
function getTestsReport(
  ts: TestSuiteResult,
  runIndex: number,
  suiteIndex: number,
  options: ReportOptions,
): string[] {
  if (options.listTests === 'failed' && ts.result !== 'failed') {
    return [];
  }
  const groups = ts.groups;
  if (groups.length === 0) {
    return [];
  }

  const sections: string[] = [];

  const tsName = ts.name;
  const tsSlug = makeSuiteSlug(runIndex, suiteIndex, options);
  const tsNameLink = `<a id="${tsSlug.id}" href="${options.baseUrl + tsSlug.link}">${tsName}</a>`;
  const icon = getResultIcon(ts.result);
  sections.push(`### ${icon}\u00A0${tsNameLink}`, '```');
  for (const grp of groups) {
    if (grp.name) {
      sections.push(grp.name);
    }
    const space = grp.name ? '  ' : '';
    for (const tc of grp.tests) {
      if (options.listTests === 'failed' && tc.result !== 'failed') {
        continue;
      }
      const result = getResultIcon(tc.result);
      sections.push(`${space}${result} ${tc.name}`);
      if (tc.error) {
        sections.push(...formatErrorLines(tc.error));
      }
    }
  }
  sections.push('```');

  return sections;
}

/**
 * Creates the anchor identifier and link for the heading of a test run.
 * @param runIndex - The position of the test run in the report.
 * @param options - The options that control how the slug is built.
 * @returns The element id and the link that points to it.
 * @example
 * const { id, link } = makeRunSlug(0, DEFAULT_OPTIONS);
 */
function makeRunSlug(
  runIndex: number,
  options: ReportOptions,
): { id: string; link: string } {
  return slug(`r${runIndex}`, options);
}

/**
 * Creates the anchor identifier and link for the heading of a test suite.
 * @param runIndex - The position of the owning test run in the report.
 * @param suiteIndex - The position of the suite within its test run.
 * @param options - The options that control how the slug is built.
 * @returns The element id and the link that points to it.
 * @example
 * const { id, link } = makeSuiteSlug(0, 1, DEFAULT_OPTIONS);
 */
function makeSuiteSlug(
  runIndex: number,
  suiteIndex: number,
  options: ReportOptions,
): { id: string; link: string } {
  return slug(`r${runIndex}s${suiteIndex}`, options);
}

/**
 * Formats the message and details of a test error as indented Markdown lines.
 * @param error - The error recorded for a failed test.
 * @returns The lines to append to the report, each indented with a tab.
 * @example
 * const lines = formatErrorLines({ message: 'boom', details: 'stack' });
 */
function formatErrorLines(error: TestCaseError): string[] {
  const text = error.message ?? getFirstNonEmptyLine(error.details)?.trim();
  return (text?.split(/\r?\n/g) ?? []).map((l) => '\t' + l);
}

/**
 * Returns the icon that represents a test execution result.
 * @param result - The execution result of a test, suite or run.
 * @returns The icon, or an empty string when the result has no icon.
 * @example
 * const icon = getResultIcon('failed');
 */
function getResultIcon(result: TestExecutionResult): string {
  switch (result) {
    case 'success': {
      return Icon.success;
    }
    case 'skipped': {
      return Icon.skip;
    }
    case 'failed': {
      return Icon.fail;
    }
    default: {
      return '';
    }
  }
}

/**
 * Encodes a value for a shields.io badge URL, where dashes and underscores have special meaning.
 * @param component - The text to encode.
 * @returns The encoded text.
 * @example
 * const encoded = encodeImgShieldsURIComponent('2 passed');
 */
function encodeImgShieldsURIComponent(component: string): string {
  return encodeURIComponent(component)
    .replaceAll('-', '--')
    .replaceAll('_', '__');
}
