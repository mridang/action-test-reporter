/**
 * @file Tests the RSpec JSON test result parser against its fixtures.
 */

import { describe, expect, test } from '@jest/globals';
import { mkdir, readFile, writeFile } from 'node:fs/promises';
import path from 'node:path';

import { RspecJsonParser } from '../../../src/testresult/parsers/rspec-json/rspec-json-parser.js';
import type { ParseOptions } from '../../../src/testresult/test-parser.js';
import {
  DEFAULT_OPTIONS,
  getReport,
} from '../../../src/testresult/formatter/summary-formatter.js';
import { normalizeFilePath } from '../../../src/testresult/utils/path-utilities.js';
import { getDirname } from '../helpers/dir.js';

const TESTS_FAILED_BADGE = /^!\[Tests failed]/;
const CUSTOM_TITLE_HEADING = /^# My Custom Title\n/;

const testDir = getDirname(import.meta.url);

describe('rspec-json tests', () => {
  test('produces empty test run result when there are no test cases', async () => {
    const fixturePath = path.join(
      testDir,
      '..',
      '__fixtures__',
      'empty',
      'rspec-json.json',
    );
    const filePath = normalizeFilePath(
      path.relative(path.join(testDir, '..'), fixturePath),
    );
    const fileContent = await readFile(fixturePath, { encoding: 'utf8' });

    const opts: ParseOptions = {
      parseErrors: true,
      trackedFiles: [],
    };

    const parser = new RspecJsonParser(opts);
    const result = await parser.parse(filePath, fileContent);
    expect(result.tests).toBe(0);
    expect(result.result).toBe('success');
  });

  test('report from ./reports/rspec-json test results matches snapshot', async () => {
    const fixturePath = path.join(
      testDir,
      '../__fixtures__',
      'rspec-json.json',
    );
    const outputPath = path.join(testDir, '../__outputs__', 'rspec-json.md');
    const filePath = normalizeFilePath(
      path.relative(path.join(testDir, '..'), fixturePath),
    );
    const fileContent = await readFile(fixturePath, { encoding: 'utf8' });

    const opts: ParseOptions = {
      parseErrors: true,
      trackedFiles: ['test/main.test.js', 'test/second.test.js', 'lib/main.js'],
    };

    const parser = new RspecJsonParser(opts);
    const result = await parser.parse(filePath, fileContent);
    expect(result).toMatchSnapshot();

    const report = getReport([result]);
    await mkdir(path.dirname(outputPath), { recursive: true });
    await writeFile(outputPath, report);
  });

  test('report does not include a title by default', async () => {
    const fixturePath = path.join(
      testDir,
      '../__fixtures__',
      'rspec-json.json',
    );
    const filePath = normalizeFilePath(
      path.relative(path.join(testDir, '..'), fixturePath),
    );
    const fileContent = await readFile(fixturePath, { encoding: 'utf8' });

    const opts: ParseOptions = {
      parseErrors: true,
      trackedFiles: [],
    };

    const parser = new RspecJsonParser(opts);
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
      const fixturePath = path.join(
        testDir,
        '../__fixtures__',
        'rspec-json.json',
      );
      const filePath = normalizeFilePath(
        path.relative(path.join(testDir, '..'), fixturePath),
      );
      const fileContent = await readFile(fixturePath, { encoding: 'utf8' });

      const opts: ParseOptions = {
        parseErrors: true,
        trackedFiles: [],
      };

      const parser = new RspecJsonParser(opts);
      const result = await parser.parse(filePath, fileContent);
      const report = getReport([result], {
        ...DEFAULT_OPTIONS,
        reportTitle,
      });
      expect(report).toMatch(TESTS_FAILED_BADGE);
    },
  );

  test('report includes a custom report title', async () => {
    const fixturePath = path.join(
      testDir,
      '../__fixtures__',
      'rspec-json.json',
    );
    const filePath = normalizeFilePath(
      path.relative(path.join(testDir, '..'), fixturePath),
    );
    const fileContent = await readFile(fixturePath, { encoding: 'utf8' });

    const opts: ParseOptions = {
      parseErrors: true,
      trackedFiles: [],
    };

    const parser = new RspecJsonParser(opts);
    const result = await parser.parse(filePath, fileContent);
    const report = getReport([result], {
      ...DEFAULT_OPTIONS,
      reportTitle: 'My Custom Title',
    });
    expect(report).toMatch(CUSTOM_TITLE_HEADING);
  });
});
