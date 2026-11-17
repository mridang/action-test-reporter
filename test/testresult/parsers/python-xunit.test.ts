/**
 * @file Tests the Python xUnit test result parser against its fixtures.
 */

import { mkdir, readFile, writeFile } from 'node:fs/promises';
import path from 'node:path';
import { beforeAll, describe, expect, test } from '@jest/globals';

import { PythonXunitParser } from '../../../src/testresult/parsers/python-xunit/python-xunit-parser.js';
import {
  DEFAULT_OPTIONS,
  getReport,
} from '../../../src/testresult/formatter/summary-formatter.js';
import { normalizeFilePath } from '../../../src/testresult/utils/path-utilities.js';
import { getDirname } from '../helpers/dir.js';
import type { ParseOptions } from '../../../src/testresult/test-parser.js';

const TESTS_FAILED_BADGE = /^!\[Tests failed\]/u;
const CUSTOM_TITLE_HEADING = /^# My Custom Title\n/u;

const testDir = getDirname(import.meta.url);

const defaultOpts: ParseOptions = {
  parseErrors: true,
  trackedFiles: [],
};

describe('python-xunit unittest report', () => {
  const fixturePath = path.join(
    testDir,
    '..',
    '__fixtures__',
    'python-xunit-unittest.xml',
  );
  const filePath = normalizeFilePath(
    path.relative(path.join(testDir, '..'), fixturePath),
  );
  let fileContent = '';

  beforeAll(async () => {
    fileContent = await readFile(fixturePath, { encoding: 'utf8' });
  });
  const outputPath = path.join(
    testDir,
    '..',
    '__outputs__',
    'python-xunit-unittest.md',
  );

  test('report from python test results matches snapshot', async () => {
    const trackedFiles = ['tests/test_lib.py'];
    const opts: ParseOptions = {
      ...defaultOpts,
      trackedFiles,
    };

    const parser = new PythonXunitParser(opts);
    const result = await parser.parse(filePath, fileContent);
    expect(result).toMatchSnapshot();

    const report = getReport([result]);
    await mkdir(path.dirname(outputPath), { recursive: true });
    await writeFile(outputPath, report);
  });

  test('report does not include a title by default', async () => {
    const parser = new PythonXunitParser(defaultOpts);
    const result = await parser.parse(filePath, fileContent);
    const report = getReport([result]);
    expect(report).toMatch(TESTS_FAILED_BADGE);
  });

  test.each([
    ['empty string', ''],
    ['space', ' '],
    ['tab', '\t'],
    ['newline', '\n'],
  ])(
    'report does not include a title when configured value is %s',
    async (_, reportTitle) => {
      const parser = new PythonXunitParser(defaultOpts);
      const result = await parser.parse(filePath, fileContent);
      const report = getReport([result], {
        ...DEFAULT_OPTIONS,
        reportTitle,
      });
      expect(report).toMatch(TESTS_FAILED_BADGE);
    },
  );

  test('report includes a custom report title', async () => {
    const parser = new PythonXunitParser(defaultOpts);
    const result = await parser.parse(filePath, fileContent);
    const report = getReport([result], {
      ...DEFAULT_OPTIONS,
      reportTitle: 'My Custom Title',
    });
    expect(report).toMatch(CUSTOM_TITLE_HEADING);
  });
});

describe('python-xunit pytest report', () => {
  const fixturePath = path.join(
    testDir,
    '..',
    '__fixtures__',
    'python-xunit-pytest.xml',
  );
  const filePath = normalizeFilePath(
    path.relative(path.join(testDir, '..'), fixturePath),
  );
  let fileContent = '';

  beforeAll(async () => {
    fileContent = await readFile(fixturePath, { encoding: 'utf8' });
  });
  const outputPath = path.join(
    testDir,
    '..',
    '__outputs__',
    'python-xunit-pytest.md',
  );

  test('report from python test results matches snapshot', async () => {
    const trackedFiles = ['tests/test_lib.py'];
    const opts: ParseOptions = {
      ...defaultOpts,
      trackedFiles,
    };

    const parser = new PythonXunitParser(opts);
    const result = await parser.parse(filePath, fileContent);
    expect(result).toMatchSnapshot();

    const report = getReport([result]);
    await mkdir(path.dirname(outputPath), { recursive: true });
    await writeFile(outputPath, report);
  });
});
