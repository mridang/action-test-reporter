import * as core from '@actions/core';

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
  readonly name = core.getInput('name', { required: false }).trim() || 'tests';
  readonly resultsPath = core.getInput('results-path', { required: true });
  readonly listSuites = core.getInput('list-suites', { required: true }) as
    | 'all'
    | 'failed'
    | 'none';
  readonly listTests = core.getInput('list-tests', { required: true }) as
    | 'all'
    | 'failed'
    | 'none';
  readonly maxAnnotations = parseInt(
    core.getInput('max-annotations', { required: true }),
  );
  readonly failOnError =
    core.getInput('fail-on-error', { required: true }) === 'true';
  readonly failOnEmpty =
    core.getInput('fail-on-empty', { required: true }) === 'true';
  readonly workDirInput = core.getInput('working-directory', {
    required: false,
  });
  readonly onlySummary =
    core.getInput('only-summary', { required: false }) === 'true';
  readonly badgeTitle = core.getInput('badge-title', { required: false });
  readonly reportTitle = core.getInput('report-title', { required: false });
  readonly collapsed = core.getInput('collapsed', { required: false }) as
    | 'auto'
    | 'always'
    | 'never';

  constructor() {
    if (
      this.listSuites !== 'all' &&
      this.listSuites !== 'failed' &&
      this.listSuites !== 'none'
    ) {
      core.setFailed(`Input parameter 'list-suites' has invalid value`);
      return;
    }

    if (
      this.listTests !== 'all' &&
      this.listTests !== 'failed' &&
      this.listTests !== 'none'
    ) {
      core.setFailed(`Input parameter 'list-tests' has invalid value`);
      return;
    }

    if (
      this.collapsed !== 'auto' &&
      this.collapsed !== 'always' &&
      this.collapsed !== 'never'
    ) {
      core.setFailed(`Input parameter 'collapsed' has invalid value`);
      return;
    }

    if (
      isNaN(this.maxAnnotations) ||
      this.maxAnnotations < 0 ||
      this.maxAnnotations > 50
    ) {
      core.setFailed(`Input parameter 'max-annotations' has invalid value`);
      return;
    }
  }

  async run(writeSummary = true): Promise<TestReporterOutput> {
    if (this.workDirInput) {
      core.info(`Changing directory to '${this.workDirInput}'`);
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
      core.info(`Found ${trackedFiles.length} files tracked by Git`);
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
        core.startGroup(`Creating test report ${reportName}`);
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
        core.endGroup();
      }
    }

    const isFailed = results.some((tr) => tr.result === 'failed');
    const conclusion = isFailed ? 'failure' : 'success';
    const passed = results.reduce((sum, tr) => sum + tr.passed, 0);
    const failed = results.reduce((sum, tr) => sum + tr.failed, 0);
    const skipped = results.reduce((sum, tr) => sum + tr.skipped, 0);
    const time = results.reduce((sum, tr) => sum + tr.time, 0);

    core.setOutput('conclusion', conclusion);
    core.setOutput('passed', passed);
    core.setOutput('failed', failed);
    core.setOutput('skipped', skipped);
    core.setOutput('time', time);

    const summary = summaries.join('\n\n');
    const shortSummary = shortSummaries.join(' ');

    if (this.failOnError && isFailed) {
      core.setFailed(
        `Failed tests were found and 'fail-on-error' option is set to ${this.failOnError}`,
      );
      return { results, summary, shortSummary };
    }

    if (results.length === 0 && this.failOnEmpty) {
      core.setFailed(`No test report files were found`);
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
      core.warning(`No file matches path ${this.resultsPath}`);
      return { results: [], summary: '', shortSummary: '' };
    }

    core.info(`Processing test results for ${name}`);
    const results: TestRunResult[] = [];

    // Detect format from first file
    const firstFile = files[0];
    const {
      parser,
      result: firstResult,
      format,
    } = await detectTestFormat(firstFile.file, firstFile.content, options);
    core.info(`Auto-detected test result format: ${format}`);
    results.push(firstResult);

    // Parse remaining files with the same parser
    for (const { file, content } of files.slice(1)) {
      try {
        const tr = await parser.parse(file, content);
        results.push(tr);
      } catch (error) {
        core.error(`Processing test results from ${file} failed`);
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

    core.info('Summary content:');
    core.info(summary);
    if (writeSummary) {
      await core.summary.addRaw(summary).write();
    }

    return { results, summary, shortSummary };
  }
}

export async function run(
  writeSummary = true,
): Promise<TestReporterOutput | undefined> {
  try {
    const testReporter = new TestReporter();
    return await testReporter.run(writeSummary);
  } catch (error) {
    if (error instanceof Error) {
      core.setFailed(error);
    } else {
      core.setFailed(JSON.stringify(error));
    }
  }
}
