import * as core from '@actions/core';

import { run as runTestReporter } from './testresult/main.js';
import { run as runCoverageReporter } from './coverage/main.js';

export async function run(): Promise<void> {
  const resultsPath = core.getInput('results-path', { required: false }).trim();
  const coveragePath = core
    .getInput('coverage-path', { required: false })
    .trim();
  const hasResults = resultsPath.length > 0;
  const hasCoverage = coveragePath.length > 0;

  if (!hasResults && !hasCoverage) {
    core.setFailed(
      "Either 'results-path' or 'coverage-path' must be provided to generate a report.",
    );
    return;
  }

  if (hasResults && hasCoverage) {
    const sections: string[] = [];
    const testRun = await runTestReporter(false);
    if (testRun?.summary) {
      sections.push(testRun.summary);
    }

    const coverageRun = await runCoverageReporter(false);
    if (coverageRun.summaries.length > 0) {
      sections.push(...coverageRun.summaries);
    }

    if (sections.length > 0) {
      await (await core.summary.clear()).addRaw(sections.join('\n\n')).write();
    }
    return;
  }

  if (hasResults) {
    await runTestReporter(true);
    return;
  }

  await runCoverageReporter(true);
}
