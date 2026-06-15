import { detectCoverage } from './parsers/index.js';
import { SummaryFormatter } from './formatter/summary-formatter.js';
import { ConsoleFormatter } from './formatter/console-formatter.js';
import { LocalCoverageProvider } from './input-providers/local-coverage-provider.js';

export interface CoverageRunOptions {
  patterns: string[];
  rootDir?: string;
  repoUrl?: string;
  sha?: string;
}

/**
 * Runs the coverage flow: load files, detect parser, parse, and format.
 */
export interface CoverageRunOutput {
  summaries: string[];
  consoleOutputs: string[];
}

export async function runCoverage(
  options: CoverageRunOptions,
): Promise<CoverageRunOutput> {
  const provider = new LocalCoverageProvider(options.patterns);
  const files = await provider.load();
  if (files.length === 0) {
    throw new Error('No coverage files matched the provided patterns.');
  }

  const summaryFormatter = new SummaryFormatter();
  const consoleFormatter = new ConsoleFormatter();
  const summaries: string[] = [];
  const consoleOutputs: string[] = [];

  for (const file of files) {
    const { data } = await detectCoverage(file.content);

    const consoleOutput = consoleFormatter.format(data, {
      rootDir: options.rootDir,
    });
    consoleOutputs.push(consoleOutput);
    const summary = summaryFormatter.format(data, {
      repoUrl: options.repoUrl ?? '',
      sha: options.sha ?? '',
      rootDir: options.rootDir,
    });
    summaries.push(summary);
  }

  return { summaries, consoleOutputs };
}
