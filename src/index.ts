import {
  getInput,
  setFailed as actionFailed,
  info,
  startGroup,
  endGroup,
  summary,
} from '@actions/core';
import { Context } from '@actions/github/lib/context.js';
import { promises as fs } from 'fs';
import { getParserForFile } from './coverage/index.js';
import { SummaryFormatter } from './formatter/summary-formatter.js';

/**
 * Retrieves the working directory from the action's 'working-directory' input.
 *
 * @returns {string} The specified working directory or the current process's
 * working directory if the input is empty.
 */
function getWorkingDirectory(): string {
  const dir: string = getInput('working-directory').trim();
  if (dir) {
    return dir;
  } else {
    return process.cwd();
  }
}

/**
 * Retrieves the path for the coverage file or directory.
 *
 * @returns {string} The coverage file or directory path.
 * @throws {Error} if the 'coverage-file' input is empty.
 */
function getCoveragePath(): string {
  const path: string = getInput('coverage-file', { required: true }).trim();
  if (path) {
    return path;
  } else {
    throw new Error('The "coverage-file" input must not be empty.');
  }
}

/**
 * Sets the action's failure status with a given message.
 * In a JEST test environment, it throws an error instead.
 *
 * @param {string | Error} message - The error message or Error object.
 */
function setFailed(message: string | Error): void {
  if (process.env.JEST_WORKER_ID) {
    if (message instanceof Error) {
      throw message;
    } else {
      throw new Error(message);
    }
  } else {
    actionFailed(message);
  }
}

// --- Main Action Logic ---

/**
 * The main entry point for the action.
 * @param {Context} [ghCtx=new Context()] - The GitHub context object.
 */
export async function run(ghCtx: Context = new Context()): Promise<void> {
  try {
    const { sha, ref, serverUrl, repo } = ghCtx;
    if (!sha || !ref) {
      info('Skipping: Could not determine SHA or ref from context.');
      return;
    }

    const workDir: string = getWorkingDirectory();
    const coveragePath: string = getCoveragePath();

    startGroup('Parsing coverage file');
    const content: string = await fs.readFile(coveragePath, 'utf8');
    const parser = await getParserForFile(coveragePath);
    const coverageData = await parser.parse(content);
    info(`Successfully parsed ${coveragePath}.`);
    endGroup();

    startGroup('Formatting summary');
    const formatter = new SummaryFormatter();
    const report: string = formatter.format(coverageData, {
      repoUrl: `${serverUrl}/${repo.owner}/${repo.repo}`,
      sha,
      rootDir: workDir,
    });
    endGroup();

    await summary.addRaw(report).write();
    info('Successfully generated and wrote coverage summary.');
  } catch (err: unknown) {
    if (err instanceof Error) {
      setFailed(err);
    } else {
      setFailed(String(err));
    }
  }
}
