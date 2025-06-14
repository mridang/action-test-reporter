/* eslint-disable testing-library/no-debugging-utils */
import {
  getInput,
  setFailed as actionFailed,
  info,
  startGroup,
  endGroup,
  summary,
  debug,
} from '@actions/core';
import { Context } from '@actions/github/lib/context.js';
import { promises as fs } from 'fs';
import { getParserForFile } from './coverage/index.js';
import { SummaryFormatter } from './formatter/summary-formatter.js';
import { execSync } from 'node:child_process';
import { DefaultArtifactClient } from '@actions/artifact';
import { ConsoleFormatter } from './formatter/console-formatter.js';

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
 * Retrieves the boolean value for the 'upload-coverage-report' input.
 *
 * @returns `true` if 'upload-coverage-report' is 'true' or empty, `false` if 'false'.
 * @throws {Error} if the 'upload-coverage-report' input is an invalid value.
 */
function getUploadCoverageReport(): boolean {
  const raw = getInput('upload-coverage-report').trim().toLowerCase();
  if (raw === 'true' || raw === '') {
    return true;
  } else if (raw === 'false') {
    return false;
  } else {
    throw new Error(
      'Invalid value for "upload-coverage-report". Use "true" or "false".',
    );
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

const artifactClient = new DefaultArtifactClient();
const summaryFormatter = new SummaryFormatter();
const consoleFormatter = new ConsoleFormatter();

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

    try {
      await fs.stat(coveragePath);
    } catch (error: unknown) {
      if (
        error instanceof Error &&
        'code' in error &&
        (error as { code?: string }).code === 'ENOENT'
      ) {
        debug(`Coverage file not found at path: ${coveragePath}`);
        debug('Listing files in the current directory for debugging:');
        try {
          const findOutput = execSync('find . -maxdepth 3', {
            encoding: 'utf8',
          });
          debug(findOutput);
        } catch (execError: unknown) {
          if (execError instanceof Error) {
            debug(`'find' command failed: ${execError.message}`);
          } else {
            debug(`'find' command failed with an unknown error.`);
          }
        }
        setFailed(`Coverage file not found: ${coveragePath}`);
        return;
      } else {
        // noinspection ExceptionCaughtLocallyJS
        throw error;
      }
    }

    startGroup('Parsing coverage file');
    const content: string = await fs.readFile(coveragePath, 'utf8');
    const parser = await getParserForFile(coveragePath);
    const coverageData = await parser.parse(content);
    info(`Successfully parsed ${coveragePath}.`);
    endGroup();

    startGroup('Formatting summary');
    consoleFormatter.format(coverageData, {
      rootDir: workDir,
    });
    const report: string = summaryFormatter.format(coverageData, {
      repoUrl: `${serverUrl}/${repo.owner}/${repo.repo}`,
      sha,
      rootDir: workDir,
    });
    endGroup();

    await summary.addRaw(report).write();
    info('Successfully generated and wrote coverage summary.');

    if (getUploadCoverageReport()) {
      const { id, size } = await artifactClient.uploadArtifact(
        'test-coverage',
        [coveragePath],
        workDir,
        {
          retentionDays: 90,
          compressionLevel: 9,
        },
      );
      info(`Uploaded ${size}B of coverage to artifact ${id}.`);
    } else {
      info(`Skipping artifact upload since it isn't required.`);
    }
  } catch (err: unknown) {
    if (err instanceof Error) {
      setFailed(err);
    } else {
      setFailed(String(err));
    }
  }
}
