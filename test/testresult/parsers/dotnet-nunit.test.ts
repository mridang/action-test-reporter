/**
 * @file Tests the NUnit test result parser against its fixtures.
 */

import { mkdir, readFile, writeFile } from 'node:fs/promises';
import path from 'node:path';
import { describe, expect, test } from '@jest/globals';

import { DotnetNunitParser } from '../../../src/testresult/parsers/dotnet-nunit/dotnet-nunit-parser.js';
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

describe('dotnet-nunit tests', () => {
  test('report from ./reports/dotnet test results matches snapshot', async () => {
    const fixturePath = path.join(
      testDir,
      '../__fixtures__',
      'dotnet-nunit.xml',
    );
    const outputPath = path.join(testDir, '../__outputs__', 'dotnet-nunit.md');
    const filePath = normalizeFilePath(
      path.relative(path.join(testDir, '..'), fixturePath),
    );
    const fileContent = await readFile(fixturePath, { encoding: 'utf8' });

    const opts: ParseOptions = {
      parseErrors: true,
      trackedFiles: [
        'DotnetTests.Unit/Calculator.cs',
        'DotnetTests.NUnitV3Tests/CalculatorTests.cs',
      ],
    };

    const parser = new DotnetNunitParser(opts);
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
      'dotnet-nunit.xml',
    );
    const filePath = normalizeFilePath(
      path.relative(path.join(testDir, '..'), fixturePath),
    );
    const fileContent = await readFile(fixturePath, { encoding: 'utf8' });

    const opts: ParseOptions = {
      parseErrors: true,
      trackedFiles: [],
    };

    const parser = new DotnetNunitParser(opts);
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
        'dotnet-nunit.xml',
      );
      const filePath = normalizeFilePath(
        path.relative(path.join(testDir, '..'), fixturePath),
      );
      const fileContent = await readFile(fixturePath, { encoding: 'utf8' });

      const opts: ParseOptions = {
        parseErrors: true,
        trackedFiles: [],
      };

      const parser = new DotnetNunitParser(opts);
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
      'dotnet-nunit.xml',
    );
    const filePath = normalizeFilePath(
      path.relative(path.join(testDir, '..'), fixturePath),
    );
    const fileContent = await readFile(fixturePath, { encoding: 'utf8' });

    const opts: ParseOptions = {
      parseErrors: true,
      trackedFiles: [],
    };

    const parser = new DotnetNunitParser(opts);
    const result = await parser.parse(filePath, fileContent);
    const report = getReport([result], {
      ...DEFAULT_OPTIONS,
      reportTitle: 'My Custom Title',
    });
    expect(report).toMatch(CUSTOM_TITLE_HEADING);
  });
});
