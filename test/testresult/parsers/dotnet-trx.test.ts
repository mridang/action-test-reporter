/**
 * @file Tests the TRX test result parser against its fixtures.
 */

import { mkdir, readFile, writeFile } from 'node:fs/promises';
import path from 'node:path';

import {
  DotnetTrxParser,
  STACK_TRACE_LINE_BREAK,
} from '../../../src/testresult/parsers/dotnet-trx/dotnet-trx-parser.js';
import { randomStrings, referencePattern } from '../helpers/fuzz.js';
import { ParseOptions } from '../../../src/testresult/test-parser.js';
import {
  DEFAULT_OPTIONS,
  getReport,
  ReportOptions,
} from '../../../src/testresult/formatter/summary-formatter.js';
import { normalizeFilePath } from '../../../src/testresult/utils/path-utils.js';
import { getDirname } from '../helpers/dir.js';

const testDir = getDirname(import.meta.url);

// eslint-disable-next-line sonarjs/max-lines-per-function -- one suite groups every fixture of this parser
describe('dotnet-trx tests', () => {
  test('produces empty test run result when there are no test cases', async () => {
    const fixturePath = path.join(
      testDir,
      '..',
      '__fixtures__',
      'empty',
      'dotnet-trx.trx',
    );
    const filePath = normalizeFilePath(
      path.relative(path.join(testDir, '..'), fixturePath),
    );
    const fileContent = await readFile(fixturePath, { encoding: 'utf8' });

    const opts: ParseOptions = {
      parseErrors: true,
      trackedFiles: [],
    };

    const parser = new DotnetTrxParser(opts);
    const result = await parser.parse(filePath, fileContent);
    expect(result.tests).toBe(0);
    expect(result.result).toBe('success');
  });

  test('produces empty test run result when TestDefinitions is empty', async () => {
    const fixturePath = path.join(
      testDir,
      '..',
      '__fixtures__',
      'empty',
      'dotnet-trx-empty-test-definitions.trx',
    );
    const filePath = normalizeFilePath(
      path.relative(path.join(testDir, '..'), fixturePath),
    );
    const fileContent = await readFile(fixturePath, { encoding: 'utf8' });

    const opts: ParseOptions = {
      parseErrors: true,
      trackedFiles: [],
    };

    const parser = new DotnetTrxParser(opts);
    const result = await parser.parse(filePath, fileContent);
    expect(result.tests).toBe(0);
    expect(result.result).toBe('success');
  });

  test.each([['dotnet-trx'], ['dotnet-xunitv3']])(
    'matches %s report snapshot',
    async (reportName) => {
      const fixturePath = path.join(
        testDir,
        '../__fixtures__',
        `${reportName}.trx`,
      );
      const outputPath = path.join(testDir, '__outputs__', `${reportName}.md`);
      const filePath = normalizeFilePath(
        path.relative(path.join(testDir, '..'), fixturePath),
      );
      const fileContent = await readFile(fixturePath, { encoding: 'utf8' });

      const opts: ParseOptions = {
        parseErrors: true,
        trackedFiles: [
          'DotnetTests.Unit/Calculator.cs',
          'DotnetTests.XUnitTests/CalculatorTests.cs',
          'DotnetTests.XUnitV3Tests/FixtureTests.cs',
        ],
      };

      const parser = new DotnetTrxParser(opts);
      const result = await parser.parse(filePath, fileContent);
      expect(result).toMatchSnapshot();

      const report = getReport([result]);
      await mkdir(path.dirname(outputPath), { recursive: true });
      await writeFile(outputPath, report);
    },
  );

  test('matches report snapshot (only failed tests)', async () => {
    const fixturePath = path.join(testDir, '../__fixtures__', 'dotnet-trx.trx');
    const outputPath = path.join(
      testDir,
      '..',
      '__outputs__',
      'dotnet-trx-only-failed.md',
    );
    const filePath = normalizeFilePath(
      path.relative(path.join(testDir, '..'), fixturePath),
    );
    const fileContent = await readFile(fixturePath, { encoding: 'utf8' });

    const opts: ParseOptions = {
      parseErrors: true,
      trackedFiles: [
        'DotnetTests.Unit/Calculator.cs',
        'DotnetTests.XUnitTests/CalculatorTests.cs',
      ],
    };

    const parser = new DotnetTrxParser(opts);
    const result = await parser.parse(filePath, fileContent);
    expect(result).toMatchSnapshot();

    const reportOptions: ReportOptions = {
      ...DEFAULT_OPTIONS,
      listSuites: 'all',
      listTests: 'failed',
    };
    const report = getReport([result], reportOptions);
    await mkdir(path.dirname(outputPath), { recursive: true });
    await writeFile(outputPath, report);
  });

  test('report from FluentValidation test results matches snapshot', async () => {
    const fixturePath = path.join(
      testDir,
      '..',
      '__fixtures__',
      'external',
      'FluentValidation.Tests.trx',
    );
    const outputPath = path.join(
      testDir,
      '..',
      '__outputs__',
      'fluent-validation-test-results.md',
    );
    const filePath = normalizeFilePath(
      path.relative(path.join(testDir, '..'), fixturePath),
    );
    const fileContent = await readFile(fixturePath, { encoding: 'utf8' });

    const opts: ParseOptions = {
      trackedFiles: [],
      parseErrors: true,
    };

    const parser = new DotnetTrxParser(opts);
    const result = await parser.parse(filePath, fileContent);
    expect(result).toMatchSnapshot();

    const report = getReport([result]);
    await mkdir(path.dirname(outputPath), { recursive: true });
    await writeFile(outputPath, report);
  });

  test('report from SilentNotes test results matches snapshot', async () => {
    const fixturePath = path.join(
      testDir,
      '..',
      '__fixtures__',
      'external',
      'SilentNotes.trx',
    );
    const outputPath = path.join(
      testDir,
      '..',
      '__outputs__',
      'silent-notes-test-results.md',
    );
    const filePath = normalizeFilePath(
      path.relative(path.join(testDir, '..'), fixturePath),
    );
    const fileContent = await readFile(fixturePath, { encoding: 'utf8' });

    const opts: ParseOptions = {
      trackedFiles: [],
      parseErrors: true,
    };

    const parser = new DotnetTrxParser(opts);
    const result = await parser.parse(filePath, fileContent);
    expect(result).toMatchSnapshot();

    const report = getReport([result]);
    await mkdir(path.dirname(outputPath), { recursive: true });
    await writeFile(outputPath, report);
  });

  test('report does not include a title by default', async () => {
    const fixturePath = path.join(testDir, '../__fixtures__', 'dotnet-trx.trx');
    const filePath = normalizeFilePath(
      path.relative(path.join(testDir, '..'), fixturePath),
    );
    const fileContent = await readFile(fixturePath, { encoding: 'utf8' });

    const opts: ParseOptions = {
      parseErrors: true,
      trackedFiles: [],
    };

    const parser = new DotnetTrxParser(opts);
    const result = await parser.parse(filePath, fileContent);
    const report = getReport([result]);
    expect(report).toMatch(/^!\[Tests failed]/);
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
        'dotnet-trx.trx',
      );
      const filePath = normalizeFilePath(
        path.relative(path.join(testDir, '..'), fixturePath),
      );
      const fileContent = await readFile(fixturePath, { encoding: 'utf8' });

      const opts: ParseOptions = {
        parseErrors: true,
        trackedFiles: [],
      };

      const parser = new DotnetTrxParser(opts);
      const result = await parser.parse(filePath, fileContent);
      const report = getReport([result], {
        ...DEFAULT_OPTIONS,
        reportTitle,
      });
      expect(report).toMatch(/^!\[Tests failed]/);
    },
  );

  test('report includes a custom report title', async () => {
    const fixturePath = path.join(testDir, '../__fixtures__', 'dotnet-trx.trx');
    const filePath = normalizeFilePath(
      path.relative(path.join(testDir, '..'), fixturePath),
    );
    const fileContent = await readFile(fixturePath, { encoding: 'utf8' });

    const opts: ParseOptions = {
      parseErrors: true,
      trackedFiles: [],
    };

    const parser = new DotnetTrxParser(opts);
    const result = await parser.parse(filePath, fileContent);
    const report = getReport([result], {
      ...DEFAULT_OPTIONS,
      reportTitle: 'My Custom Title',
    });
    expect(report).toMatch(/^# My Custom Title\n/);
  });
});

describe('stack trace line break pattern matches the original pattern', () => {
  const originalBreak = referencePattern('', String.raw`\r*`, String.raw`\n`);

  test('splits random texts the same way', () => {
    const samples = randomStrings(
      ['a', '\r', '\r', '\n', '\n', ' '],
      150_000,
      14,
    );
    for (const sample of samples) {
      expect({ sample, parts: sample.split(STACK_TRACE_LINE_BREAK) }).toEqual({
        sample,
        parts: sample.split(originalBreak),
      });
    }
  });

  test('stays fast on a long run of carriage returns', () => {
    const started = Date.now();
    const text = `${'\r'.repeat(200_000)}a`;
    expect(text.split(STACK_TRACE_LINE_BREAK)).toEqual([text]);
    expect(Date.now() - started).toBeLessThan(1000);
    const shortText = `${'\r'.repeat(3000)}a`;
    expect(shortText.split(originalBreak)).toEqual([shortText]);
  });
});
