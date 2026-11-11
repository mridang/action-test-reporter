/**
 * @file Runs the coverage reporter end to end, from reading inputs to writing the summary.
 */

import { getInput, info, setFailed, summary } from '@actions/core';

import { CoverageRunOutput, runCoverage } from './runner.js';

/**
 * Entrypoint for executing the coverage reporter flow from the GitHub Action.
 */
class CoverageReporter {
  readonly coverageInput = getInput('coverage-path', { required: false });
  readonly patterns = (this.coverageInput || '')
    .split(',')
    .map((p) => p.trim())
    .filter(Boolean);
  readonly workDirInput = getInput('working-directory', {
    required: false,
  });
  readonly failOnEmpty =
    getInput('fail-on-empty', { required: false }) === 'true';

  async run(writeSummary = true): Promise<CoverageRunOutput> {
    if (this.patterns.length === 0) {
      setFailed("Input parameter 'coverage-path' has invalid value");
      return { summaries: [], consoleOutputs: [] };
    }

    if (this.workDirInput) {
      info(`Changing directory to '${this.workDirInput}'`);
      process.chdir(this.workDirInput);
    }

    try {
      const repoUrl =
        process.env.GITHUB_SERVER_URL && process.env.GITHUB_REPOSITORY
          ? `${process.env.GITHUB_SERVER_URL}/${process.env.GITHUB_REPOSITORY}`
          : '';
      const sha = process.env.GITHUB_SHA ?? '';

      const output = await runCoverage({
        patterns: this.patterns,
        rootDir: process.cwd(),
        repoUrl,
        sha,
      });
      if (writeSummary && output.summaries.length > 0) {
        await summary.addRaw(output.summaries.join('\n\n')).write();
      }
      for (const message of output.consoleOutputs) {
        info(message);
      }

      return output;
    } catch (error) {
      if (
        this.failOnEmpty &&
        error instanceof Error &&
        error.message.includes('No coverage files matched')
      ) {
        setFailed(error.message);
        return { summaries: [], consoleOutputs: [] };
      }

      throw error;
    }
  }
}

/**
 * Runs the coverage reporter for the configured inputs and reports any failure to the action.
 * @param writeSummary - Whether the summary is written to the job summary.
 * @returns The output of the coverage run, including the summaries and console output.
 * @example
 * const output = await run(true);
 */
export async function run(writeSummary = true): Promise<CoverageRunOutput> {
  try {
    const coverageReporter = new CoverageReporter();
    return await coverageReporter.run(writeSummary);
  } catch (error) {
    if (error instanceof Error) {
      setFailed(error);
    } else {
      setFailed(JSON.stringify(error));
    }

    return { summaries: [], consoleOutputs: [] };
  }
}
