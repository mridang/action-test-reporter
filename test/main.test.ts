/**
 * @file Tests the action end to end with the GitHub Actions core module mocked.
 */

import { mkdir, writeFile } from 'node:fs/promises';
import path from 'node:path';

import { jest } from '@jest/globals';

type Inputs = Record<string, string>;
const inputs: Inputs = {};
let summaryBuffer = '';
let recordedSummary = '';
let infoLogs: string[] = [];

const coreMock = {
  getInput: jest.fn((name: string) => inputs[name] ?? ''),
  setOutput: jest.fn(),
  setFailed: jest.fn(),
  startGroup: jest.fn(),
  endGroup: jest.fn(),
  info: jest.fn((message: string) => {
    infoLogs.push(message);
  }),
  warning: jest.fn(),
  error: jest.fn(),
  summary: {
    addRaw: jest.fn((raw: string) => {
      summaryBuffer = raw;
      return coreMock.summary;
    }),
    write: jest.fn(async () => {
      recordedSummary = summaryBuffer;
      return undefined;
    }),
    clear: jest.fn(() => {
      summaryBuffer = '';
      return coreMock.summary;
    }),
  },
};

jest.unstable_mockModule('@actions/core', () => coreMock);

const { run } = await import('../src/index.js');

/**
 * Replaces the mocked action inputs and clears the summary and log buffers.
 * @param map - The inputs to expose through the mocked core module.
 * @example
 * setInputs({ 'results-path': 'results.xml' });
 */
function setInputs(map: Inputs): void {
  Object.keys(inputs).forEach((key) => delete inputs[key]);
  Object.assign(inputs, map);
  summaryBuffer = '';
  recordedSummary = '';
  infoLogs = [];
}

/**
 * Creates the fixture directory used by the action tests and returns its path.
 * @returns The absolute path of the fixture directory.
 * @example
 * const dir = await ensureFixtureDir();
 */
async function ensureFixtureDir(): Promise<string> {
  const dir = path.join(process.cwd(), 'test', '__fixtures__', 'main');
  await mkdir(dir, { recursive: true });
  return dir;
}

beforeEach(() => {
  setInputs({});
  jest.clearAllMocks();
});

test('combines test and coverage reports into a single summary', async () => {
  const fixtureDir = await ensureFixtureDir();
  const junitPath = path.join(fixtureDir, 'project-junit.xml');
  const lcovPath = path.join(fixtureDir, 'coverage.lcov');

  setInputs({
    name: 'project-tests',
    'results-path': junitPath,
    'list-suites': 'all',
    'list-tests': 'all',
    'max-annotations': '0',
    'fail-on-error': 'false',
    'fail-on-empty': 'true',
    'working-directory': process.cwd(),
    'only-summary': 'false',
    'badge-title': 'tests',
    'report-title': '',
    collapsed: 'never',
    'coverage-path': lcovPath,
  });

  const originalCwd = process.cwd();
  try {
    await run();
  } finally {
    process.chdir(originalCwd);
  }

  const summaryPath = path.join(fixtureDir, 'summary.md');
  await writeFile(summaryPath, recordedSummary, 'utf8');
  console.log(`Combined summary saved to ${summaryPath}`);

  expect(coreMock.setFailed).not.toHaveBeenCalled();
  expect(coreMock.summary.addRaw).toHaveBeenCalledTimes(1);
  expect(coreMock.summary.clear).toHaveBeenCalledTimes(1);
  expect(recordedSummary).toContain('Code Coverage Report');
  expect(recordedSummary).toContain('All Files');
  expect(recordedSummary).toContain('129 passed');
  expect(infoLogs.length).toBeGreaterThan(0);
});

test('reports only coverage when results path is not provided', async () => {
  const fixtureDir = await ensureFixtureDir();
  const lcovPath = path.join(fixtureDir, 'coverage.lcov');

  setInputs({
    'coverage-path': lcovPath,
    'fail-on-empty': 'true',
    'working-directory': process.cwd(),
  });

  const originalCwd = process.cwd();
  try {
    await run();
  } finally {
    process.chdir(originalCwd);
  }

  expect(coreMock.setFailed).not.toHaveBeenCalled();
  expect(coreMock.setOutput).not.toHaveBeenCalled();
  expect(coreMock.summary.clear).not.toHaveBeenCalled();
  expect(coreMock.summary.addRaw).toHaveBeenCalledTimes(1);
  expect(recordedSummary).toContain('Code Coverage Report');
  expect(recordedSummary).not.toContain('passed,');
});

test('reports only test results when coverage path is not provided', async () => {
  const fixtureDir = await ensureFixtureDir();
  const junitPath = path.join(fixtureDir, 'project-junit.xml');

  setInputs({
    name: 'project-tests',
    'results-path': junitPath,
    'list-suites': 'all',
    'list-tests': 'all',
    'max-annotations': '0',
    'fail-on-error': 'false',
    'fail-on-empty': 'true',
    'working-directory': process.cwd(),
    'only-summary': 'false',
    'badge-title': 'tests',
    'report-title': '',
    collapsed: 'never',
  });

  const originalCwd = process.cwd();
  try {
    await run();
  } finally {
    process.chdir(originalCwd);
  }

  expect(coreMock.setFailed).not.toHaveBeenCalled();
  expect(coreMock.summary.clear).not.toHaveBeenCalled();
  expect(coreMock.summary.addRaw).toHaveBeenCalledTimes(1);
  expect(recordedSummary).toContain('129 passed');
  expect(recordedSummary).not.toContain('Code Coverage Report');
});

test('fails when neither results nor coverage paths are provided', async () => {
  await run();

  expect(coreMock.summary.addRaw).not.toHaveBeenCalled();
  expect(coreMock.setFailed).toHaveBeenCalledWith(
    "Either 'results-path' or 'coverage-path' must be provided to generate a report.",
  );
});
