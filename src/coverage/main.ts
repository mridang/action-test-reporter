import * as core from '@actions/core';

import { CoverageRunOutput, runCoverage } from './runner.js';

/**
 * Entrypoint for executing the coverage reporter flow from the GitHub Action.
 */
class CoverageReporter {
  readonly coverageInput = core.getInput('coverage-path', { required: false });
  readonly patterns = (this.coverageInput || '')
    .split(',')
    .map((p) => p.trim())
    .filter(Boolean);
  readonly workDirInput = core.getInput('working-directory', {
    required: false,
  });
  readonly repoUrl = core.getInput('repo-url', { required: false });
  readonly sha = core.getInput('sha', { required: false });
  readonly failOnEmpty =
    core.getInput('fail-on-empty', { required: false }) === 'true';

  async run(writeSummary = true): Promise<CoverageRunOutput> {
    if (this.patterns.length === 0) {
      core.setFailed("Input parameter 'coverage-path' has invalid value");
      return { summaries: [], consoleOutputs: [] };
    }

    if (this.workDirInput) {
      core.info(`Changing directory to '${this.workDirInput}'`);
      process.chdir(this.workDirInput);
    }

    try {
      const output = await runCoverage({
        patterns: this.patterns,
        rootDir: process.cwd(),
        repoUrl: this.repoUrl,
        sha: this.sha,
      });
      if (writeSummary && output.summaries.length > 0) {
        await core.summary.addRaw(output.summaries.join('\n\n')).write();
      }
      for (const message of output.consoleOutputs) {
        core.info(message);
      }

      return output;
    } catch (error) {
      if (
        this.failOnEmpty &&
        error instanceof Error &&
        error.message.includes('No coverage files matched')
      ) {
        core.setFailed(error.message);
        return { summaries: [], consoleOutputs: [] };
      }

      throw error;
    }
  }
}

export async function run(writeSummary = true): Promise<CoverageRunOutput> {
  try {
    const coverageReporter = new CoverageReporter();
    return await coverageReporter.run(writeSummary);
  } catch (error) {
    if (error instanceof Error) {
      core.setFailed(error);
    } else {
      core.setFailed(JSON.stringify(error));
    }

    return { summaries: [], consoleOutputs: [] };
  }
}
