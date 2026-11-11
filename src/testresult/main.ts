/**
 * @file Runs the test result reporter end to end, from reading inputs to writing the summary.
 */

import {
  endGroup,
  error as coreError,
  getInput,
  info,
  setFailed,
  setOutput,
  startGroup,
  summary as coreSummary,
  warning,
} from '@actions/core';

import { LocalFileProvider } from './input-providers/local-file-provider.js';
import { FileContent } from './input-providers/input-provider.js';
import { detectTestFormat } from './parsers/index.js';
import { SummaryFormatter } from './formatter/summary-formatter.js';
import { ParseOptions } from './test-parser.js';
import { TestRunResult } from './test-results.js';
import { normalizeDirPath, normalizeFilePath } from './utils/path-utils.js';

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

    const results: TestRunResult[] = [];
    const summaries: string[] = [];
    const shortSummaries: string[] = [];
    const input = await inputProvider.load();
    for (const [reportName, files] of Object.entries(input)) {
      try {
        startGroup(`Creating test report ${reportName}`);
        const reportOutput = await this.createReport(
          reportName,
          files,
          options,
          writeSummary,
        );
        results.push(...reportOutput.results);
        if (reportOutput.summary) {
          summaries.push(reportOutput.summary);
        }
        if (reportOutput.shortSummary) {
          shortSummaries.push(reportOutput.shortSummary);
        }
      } finally {
        endGroup();
      }
    }

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

    const summary = summaries.join('\n\n');
    const shortSummary = shortSummaries.join(' ');

    if (this.failOnError && isFailed) {
      setFailed(
        `Failed tests were found and 'fail-on-error' option is set to ${this.failOnError}`,
      );
      return { results, summary, shortSummary };
    }

    if (results.length === 0 && this.failOnEmpty) {
      setFailed(`No test report files were found`);
      return { results, summary, shortSummary };
    }

    return { results, summary, shortSummary };
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
    const results: TestRunResult[] = [];

    // Detect format from first file
    const firstFile = files[0];
    const {
      parser,
      result: firstResult,
      format,
    } = await detectTestFormat(firstFile.file, firstFile.content, options);
    info(`Auto-detected test result format: ${format}`);
    results.push(firstResult);

    // Parse remaining files with the same parser
    for (const { file, content } of files.slice(1)) {
      try {
        const tr = await parser.parse(file, content);
        results.push(tr);
      } catch (error) {
        coreError(`Processing test results from ${file} failed`);
        throw error;
      }
    }

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
    const summary = summaryFormatter.format(
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
    info(summary);
    if (writeSummary) {
      await coreSummary.addRaw(summary).write();
    }

    return { results, summary, shortSummary };
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
  } catch (error) {
    if (error instanceof Error) {
      setFailed(error);
    } else {
      setFailed(JSON.stringify(error));
    }
  }
  return undefined;
}
