/**
 * @file Runs the test result reporter end to end, from reading inputs to writing the summary.
 */

import {
  endGroup,
  error,
  getInput,
  info,
  setFailed,
  setOutput,
  startGroup,
  summary,
  warning,
} from '@actions/core';

import { LocalFileProvider } from './input-providers/local-file-provider.js';
import { detectTestFormat } from './parsers/index.js';
import { SummaryFormatter } from './formatter/summary-formatter.js';
import { normalizeDirPath, normalizeFilePath } from './utils/path-utilities.js';
import type { FileContent } from './input-providers/input-provider.js';
import type { ParseOptions } from './test-parser.js';
import type { TestRunResult } from './test-results.js';

export interface TestReporterOutput {
  results: TestRunResult[];
  summary: string;
  shortSummary: string;
}

class TestReporter {
  readonly name = getInput('name', { required: false }).trim() || 'tests';
  readonly resultsPath = getInput('results-path', { required: true });
  readonly listSuites = getInput('list-suites', { required: true }) as
    'all' | 'failed' | 'none';
  readonly listTests = getInput('list-tests', { required: true }) as
    'all' | 'failed' | 'none';
  readonly maxAnnotations = Number.parseInt(
    getInput('max-annotations', { required: true }),
    10,
  );
  readonly failOnError =
    getInput('fail-on-error', { required: true }) === 'true';
  readonly failOnEmpty =
    getInput('fail-on-empty', { required: true }) === 'true';
  readonly workDirInput = getInput('working-directory', {
    required: false,
  });
  readonly onlySummary =
    getInput('only-summary', { required: false }) === 'true';
  readonly badgeTitle = getInput('badge-title', { required: false });
  readonly reportTitle = getInput('report-title', { required: false });
  readonly collapsed = getInput('collapsed', { required: false }) as
    'auto' | 'always' | 'never';

  constructor() {
    if (
      this.listSuites !== 'all' &&
      this.listSuites !== 'failed' &&
      this.listSuites !== 'none'
    ) {
      setFailed(`Input parameter 'list-suites' has invalid value`);
      return;
    }

    if (
      this.listTests !== 'all' &&
      this.listTests !== 'failed' &&
      this.listTests !== 'none'
    ) {
      setFailed(`Input parameter 'list-tests' has invalid value`);
      return;
    }

    if (
      this.collapsed !== 'auto' &&
      this.collapsed !== 'always' &&
      this.collapsed !== 'never'
    ) {
      setFailed(`Input parameter 'collapsed' has invalid value`);
      return;
    }

    if (
      Number.isNaN(this.maxAnnotations) ||
      this.maxAnnotations < 0 ||
      this.maxAnnotations > 50
    ) {
      setFailed(`Input parameter 'max-annotations' has invalid value`);
    }
  }

  async run(writeSummary = true): Promise<TestReporterOutput> {
    if (this.workDirInput) {
      info(`Changing directory to '${this.workDirInput}'`);
      process.chdir(this.workDirInput);
    }

    const pattern = this.resultsPath
      .split(',')
      .map((p) => normalizeFilePath(p));
    const inputProvider = new LocalFileProvider(this.name, pattern);

    const parseErrors = this.maxAnnotations > 0;
    const trackedFiles = parseErrors
      ? await inputProvider.listTrackedFiles()
      : [];
    const workDir = normalizeDirPath(process.cwd(), true);

    if (parseErrors) {
      info(`Found ${trackedFiles.length} files tracked by Git`);
    }

    const options: ParseOptions = {
      workDir,
      trackedFiles,
      parseErrors,
    };

    const input = await inputProvider.load();
    // Reports are created one after the other so each one gets its own log group in order.
    const reportOutputs = await Object.entries(input).reduce(
      async (previous, [reportName, files]) => {
        const outputs = await previous;
        try {
          startGroup(`Creating test report ${reportName}`);
          const reportOutput = await this.createReport(
            reportName,
            files,
            options,
            writeSummary,
          );
          return [...outputs, reportOutput];
        } finally {
          endGroup();
        }
      },
      Promise.resolve<TestReporterOutput[]>([]),
    );
    const results = reportOutputs.flatMap((output) => output.results);
    const summaries = reportOutputs
      .map((output) => output.summary)
      .filter(Boolean);
    const shortSummaries = reportOutputs
      .map((output) => output.shortSummary)
      .filter(Boolean);

    const isFailed = results.some((tr) => tr.result === 'failed');
    const conclusion = isFailed ? 'failure' : 'success';
    const passed = results.reduce((sum, tr) => sum + tr.passed, 0);
    const failed = results.reduce((sum, tr) => sum + tr.failed, 0);
    const skipped = results.reduce((sum, tr) => sum + tr.skipped, 0);
    const time = results.reduce((sum, tr) => sum + tr.time, 0);

    setOutput('conclusion', conclusion);
    setOutput('passed', passed);
    setOutput('failed', failed);
    setOutput('skipped', skipped);
    setOutput('time', time);

    const combinedSummary = summaries.join('\n\n');
    const shortSummary = shortSummaries.join(' ');

    if (this.failOnError && isFailed) {
      setFailed(
        `Failed tests were found and 'fail-on-error' option is set to ${this.failOnError}`,
      );
      return { results, summary: combinedSummary, shortSummary };
    }

    if (results.length === 0 && this.failOnEmpty) {
      setFailed(`No test report files were found`);
      return { results, summary: combinedSummary, shortSummary };
    }

    return { results, summary: combinedSummary, shortSummary };
  }

  async createReport(
    name: string,
    files: FileContent[],
    options: ParseOptions,
    writeSummary: boolean,
  ): Promise<{
    results: TestRunResult[];
    summary: string;
    shortSummary: string;
  }> {
    if (files.length === 0) {
      warning(`No file matches path ${this.resultsPath}`);
      return { results: [], summary: '', shortSummary: '' };
    }

    info(`Processing test results for ${name}`);
    // Detect format from first file
    const firstFile = files[0];
    const {
      parser,
      result: firstResult,
      format,
    } = await detectTestFormat(firstFile.file, firstFile.content, options);
    info(`Auto-detected test result format: ${format}`);

    // Parse remaining files with the same parser
    const remainingResults = await Promise.all(
      files.slice(1).map(async ({ file, content }) => {
        try {
          return await parser.parse(file, content);
          // eslint-disable-next-line sonarjs/variable-name -- unicorn/catch-error-name requires this name because the catch binding would otherwise shadow the imported core error
        } catch (error_) {
          error(`Processing test results from ${file} failed`);
          throw error_;
        }
      }),
    );
    const results = [firstResult, ...remainingResults];

    const {
      listSuites,
      listTests,
      onlySummary,
      badgeTitle,
      reportTitle,
      collapsed,
    } = this;

    const passed = results.reduce((sum, tr) => sum + tr.passed, 0);
    const failed = results.reduce((sum, tr) => sum + tr.failed, 0);
    const skipped = results.reduce((sum, tr) => sum + tr.skipped, 0);
    const shortSummary = `${passed} passed, ${failed} failed and ${skipped} skipped `;

    const summaryFormatter = new SummaryFormatter();
    const reportSummary = summaryFormatter.format(
      results,
      {
        listSuites,
        listTests,
        baseUrl: '',
        onlySummary,
        useActionsSummary: true,
        badgeTitle,
        reportTitle,
        collapsed,
      },
      shortSummary,
    );

    info('Summary content:');
    info(reportSummary);
    if (writeSummary) {
      await summary.addRaw(reportSummary).write();
    }

    return { results, summary: reportSummary, shortSummary };
  }
}

/**
 * Runs the test result reporter and reports any unexpected failure to the action.
 * @param writeSummary - Whether the summary is written to the job summary.
 * @returns The output of the test run, or undefined when the run failed.
 * @example
 * const output = await run(true);
 */
export async function run(
  writeSummary = true,
): Promise<TestReporterOutput | undefined> {
  try {
    const testReporter = new TestReporter();
    return await testReporter.run(writeSummary);
    // eslint-disable-next-line sonarjs/variable-name -- unicorn/catch-error-name requires this name because the catch binding would otherwise shadow the imported core error
  } catch (error_) {
    if (error_ instanceof Error) {
      setFailed(error_);
    } else {
      setFailed(JSON.stringify(error_));
    }
  }
  return undefined;
}
