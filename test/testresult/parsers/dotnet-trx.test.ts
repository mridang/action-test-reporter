import * as fs from 'fs';
import * as path from 'path';

import { DotnetTrxParser } from '../../../src/testresult/parsers/dotnet-trx/dotnet-trx-parser.js';
import { ParseOptions } from '../../../src/testresult/test-parser.js';
import {
  DEFAULT_OPTIONS,
  getReport,
  ReportOptions,
} from '../../../src/testresult/formatter/summary-formatter.js';
import { normalizeFilePath } from '../../../src/testresult/utils/path-utils.js';
import { getDirname } from '../helpers/dir.js';

const __dirname = getDirname(import.meta.url);

describe('dotnet-trx tests', () => {
  test('produces empty test run result when there are no test cases', async () => {
    const fixturePath = path.join(
      __dirname,
      '..',
      '__fixtures__',
      'empty',
      'dotnet-trx.trx',
    );
    const filePath = normalizeFilePath(
      path.relative(path.join(__dirname, '..'), fixturePath),
    );
    const fileContent = fs.readFileSync(fixturePath, { encoding: 'utf8' });

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
      __dirname,
      '..',
      '__fixtures__',
      'empty',
      'dotnet-trx-empty-test-definitions.trx',
    );
    const filePath = normalizeFilePath(
      path.relative(path.join(__dirname, '..'), fixturePath),
    );
    const fileContent = fs.readFileSync(fixturePath, { encoding: 'utf8' });

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
        __dirname,
        '../__fixtures__',
        `${reportName}.trx`,
      );
      const outputPath = path.join(
        __dirname,
        '__outputs__',
        `${reportName}.md`,
      );
      const filePath = normalizeFilePath(
        path.relative(path.join(__dirname, '..'), fixturePath),
      );
      const fileContent = fs.readFileSync(fixturePath, { encoding: 'utf8' });

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
      fs.mkdirSync(path.dirname(outputPath), { recursive: true });
      fs.writeFileSync(outputPath, report);
    },
  );

  test('matches report snapshot (only failed tests)', async () => {
    const fixturePath = path.join(
      __dirname,
      '../__fixtures__',
      'dotnet-trx.trx',
    );
    const outputPath = path.join(
      __dirname,
      '..',
      '__outputs__',
      'dotnet-trx-only-failed.md',
    );
    const filePath = normalizeFilePath(
      path.relative(path.join(__dirname, '..'), fixturePath),
    );
    const fileContent = fs.readFileSync(fixturePath, { encoding: 'utf8' });

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
    fs.mkdirSync(path.dirname(outputPath), { recursive: true });
    fs.writeFileSync(outputPath, report);
  });

  test('report from FluentValidation test results matches snapshot', async () => {
    const fixturePath = path.join(
      __dirname,
      '..',
      '__fixtures__',
      'external',
      'FluentValidation.Tests.trx',
    );
    const outputPath = path.join(
      __dirname,
      '..',
      '__outputs__',
      'fluent-validation-test-results.md',
    );
    const filePath = normalizeFilePath(
      path.relative(path.join(__dirname, '..'), fixturePath),
    );
    const fileContent = fs.readFileSync(fixturePath, { encoding: 'utf8' });

    const opts: ParseOptions = {
      trackedFiles: [],
      parseErrors: true,
    };

    const parser = new DotnetTrxParser(opts);
    const result = await parser.parse(filePath, fileContent);
    expect(result).toMatchSnapshot();

    const report = getReport([result]);
    fs.mkdirSync(path.dirname(outputPath), { recursive: true });
    fs.writeFileSync(outputPath, report);
  });

  test('report from SilentNotes test results matches snapshot', async () => {
    const fixturePath = path.join(
      __dirname,
      '..',
      '__fixtures__',
      'external',
      'SilentNotes.trx',
    );
    const outputPath = path.join(
      __dirname,
      '..',
      '__outputs__',
      'silent-notes-test-results.md',
    );
    const filePath = normalizeFilePath(
      path.relative(path.join(__dirname, '..'), fixturePath),
    );
    const fileContent = fs.readFileSync(fixturePath, { encoding: 'utf8' });

    const opts: ParseOptions = {
      trackedFiles: [],
      parseErrors: true,
    };

    const parser = new DotnetTrxParser(opts);
    const result = await parser.parse(filePath, fileContent);
    expect(result).toMatchSnapshot();

    const report = getReport([result]);
    fs.mkdirSync(path.dirname(outputPath), { recursive: true });
    fs.writeFileSync(outputPath, report);
  });

  test('report does not include a title by default', async () => {
    const fixturePath = path.join(
      __dirname,
      '../__fixtures__',
      'dotnet-trx.trx',
    );
    const filePath = normalizeFilePath(
      path.relative(path.join(__dirname, '..'), fixturePath),
    );
    const fileContent = fs.readFileSync(fixturePath, { encoding: 'utf8' });

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
        __dirname,
        '../__fixtures__',
        'dotnet-trx.trx',
      );
      const filePath = normalizeFilePath(
        path.relative(path.join(__dirname, '..'), fixturePath),
      );
      const fileContent = fs.readFileSync(fixturePath, { encoding: 'utf8' });

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
    const fixturePath = path.join(
      __dirname,
      '../__fixtures__',
      'dotnet-trx.trx',
    );
    const filePath = normalizeFilePath(
      path.relative(path.join(__dirname, '..'), fixturePath),
    );
    const fileContent = fs.readFileSync(fixturePath, { encoding: 'utf8' });

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
