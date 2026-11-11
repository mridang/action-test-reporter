/**
 * @file Runs the test result and coverage reporters together when the action is invoked with both kinds of input.
 */

import { getInput, setFailed, summary } from '@actions/core';

import { run as runTestReporter } from './testresult/main.js';
import { run as runCoverageReporter } from './coverage/main.js';

/**
 * Runs the test result and coverage reporters for the inputs given to the action and writes one combined summary.
 * @example
 * await run();
 */
export async function run(): Promise<void> {
  const resultsPath = getInput('results-path', { required: false }).trim();
  const coveragePath = getInput('coverage-path', { required: false }).trim();
  const hasResults = resultsPath.length > 0;
  const hasCoverage = coveragePath.length > 0;

  if (!hasResults && !hasCoverage) {
    setFailed(
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
      const cleared = await summary.clear();
      await cleared.addRaw(sections.join('\n\n')).write();
    }
    return;
  }

  if (hasResults) {
    await runTestReporter(true);
    return;
  }

  await runCoverageReporter(true);
}
