import * as fs from 'fs';
import * as path from 'path';

import { JestJunitParser } from '../../../src/testresult/parsers/jest-junit/jest-junit-parser.js';
import { ParseOptions } from '../../../src/testresult/test-parser.js';
import {
  DEFAULT_OPTIONS,
  getReport,
} from '../../../src/testresult/formatter/summary-formatter.js';
import { normalizeFilePath } from '../../../src/testresult/utils/path-utils.js';
import { getDirname } from '../helpers/dir.js';

const __dirname = getDirname(import.meta.url);

describe('jest-junit tests', () => {
  test('rejects nested junit suites (e.g. phpunit structure)', async () => {
    const fixturePath = path.join(
      __dirname,
      '..',
      '__fixtures__',
      'phpunit-nested.xml',
    );
    const filePath = normalizeFilePath(
      path.relative(path.join(__dirname, '..'), fixturePath),
    );
    const fileContent = fs.readFileSync(fixturePath, { encoding: 'utf8' });

    const opts: ParseOptions = {
      parseErrors: true,
      trackedFiles: [],
    };

    const parser = new JestJunitParser(opts);
    await expect(parser.parse(filePath, fileContent)).rejects.toThrow(
      /Not a Jest JUnit report/,
    );
  });

  test('produces empty test run result when there are no test cases in the testsuites element', async () => {
    const fixturePath = path.join(
      __dirname,
      '..',
      '__fixtures__',
      'empty',
      'jest-junit.xml',
    );
    const filePath = normalizeFilePath(
      path.relative(path.join(__dirname, '..'), fixturePath),
    );
    const fileContent = fs.readFileSync(fixturePath, { encoding: 'utf8' });

    const opts: ParseOptions = {
      parseErrors: true,
      trackedFiles: [],
    };

    const parser = new JestJunitParser(opts);
    const result = await parser.parse(filePath, fileContent);
    expect(result.tests).toBe(0);
    expect(result.result).toBe('success');
  });

  test('produces empty test run result when there are no test cases in a nested testsuite element', async () => {
    const fixturePath = path.join(
      __dirname,
      '..',
      '__fixtures__',
      'empty',
      'jest-junit-empty-testsuite.xml',
    );
    const filePath = normalizeFilePath(
      path.relative(path.join(__dirname, '..'), fixturePath),
    );
    const fileContent = fs.readFileSync(fixturePath, { encoding: 'utf8' });

    const opts: ParseOptions = {
      parseErrors: true,
      trackedFiles: [],
    };

    const parser = new JestJunitParser(opts);
    const result = await parser.parse(filePath, fileContent);
    expect(result.tests).toBe(0);
    expect(result.result).toBe('success');
  });

  test('report from ./reports/jest test results matches snapshot', async () => {
    const fixturePath = path.join(
      __dirname,
      '../__fixtures__',
      'jest-junit.xml',
    );
    const outputPath = path.join(__dirname, '../__outputs__', 'jest-junit.md');
    const filePath = normalizeFilePath(
      path.relative(path.join(__dirname, '..'), fixturePath),
    );
    const fileContent = fs.readFileSync(fixturePath, { encoding: 'utf8' });

    const opts: ParseOptions = {
      parseErrors: true,
      trackedFiles: [
        '__tests__/main.test.js',
        '__tests__/second.test.js',
        'lib/main.js',
      ],
    };

    const parser = new JestJunitParser(opts);
    const result = await parser.parse(filePath, fileContent);
    expect(result).toMatchSnapshot();

    const report = getReport([result]);
    fs.mkdirSync(path.dirname(outputPath), { recursive: true });
    fs.writeFileSync(outputPath, report);
  });

  test('report from facebook/jest test results matches snapshot', async () => {
    const fixturePath = path.join(
      __dirname,
      '..',
      '__fixtures__',
      'external',
      'jest',
      'jest-test-results.xml',
    );
    const trackedFilesPath = path.join(
      __dirname,
      '..',
      '__fixtures__',
      'external',
      'jest',
      'files.txt',
    );
    const outputPath = path.join(
      __dirname,
      '..',
      '__outputs__',
      'jest-test-results.md',
    );
    const filePath = normalizeFilePath(
      path.relative(path.join(__dirname, '..'), fixturePath),
    );
    const fileContent = fs.readFileSync(fixturePath, { encoding: 'utf8' });

    const trackedFiles = fs
      .readFileSync(trackedFilesPath, { encoding: 'utf8' })
      .split(/\n\r?/g);
    const opts: ParseOptions = {
      parseErrors: true,
      trackedFiles,
    };

    const parser = new JestJunitParser(opts);
    const result = await parser.parse(filePath, fileContent);
    expect(result).toMatchSnapshot();

    const report = getReport([result]);
    fs.mkdirSync(path.dirname(outputPath), { recursive: true });
    fs.writeFileSync(outputPath, report);
  });

  test('report from #235 testing react components named <ComponentName />', async () => {
    const fixturePath = path.join(
      __dirname,
      '..',
      '__fixtures__',
      'external',
      'jest',
      'jest-react-component-test-results.xml',
    );
    const trackedFilesPath = path.join(
      __dirname,
      '..',
      '__fixtures__',
      'external',
      'jest',
      'files.txt',
    );
    const outputPath = path.join(
      __dirname,
      '..',
      '__outputs__',
      'jest-react-component-test-results.md',
    );
    const filePath = normalizeFilePath(
      path.relative(path.join(__dirname, '..'), fixturePath),
    );
    const fileContent = fs.readFileSync(fixturePath, { encoding: 'utf8' });

    const trackedFiles = fs
      .readFileSync(trackedFilesPath, { encoding: 'utf8' })
      .split(/\n\r?/g);
    const opts: ParseOptions = {
      parseErrors: true,
      trackedFiles,
    };

    const parser = new JestJunitParser(opts);
    const result = await parser.parse(filePath, fileContent);
    expect(result).toMatchSnapshot();

    const report = getReport([result]);
    fs.mkdirSync(path.dirname(outputPath), { recursive: true });
    fs.writeFileSync(outputPath, report);
  });

  test('parsing ESLint report without timing information works - PR #134', async () => {
    const fixturePath = path.join(
      __dirname,
      '..',
      '__fixtures__',
      'jest-junit-eslint.xml',
    );
    const outputPath = path.join(
      __dirname,
      '..',
      '__outputs__',
      'jest-junit-eslint.md',
    );
    const filePath = normalizeFilePath(
      path.relative(path.join(__dirname, '..'), fixturePath),
    );
    const fileContent = fs.readFileSync(fixturePath, { encoding: 'utf8' });

    const opts: ParseOptions = {
      parseErrors: true,
      trackedFiles: ['test.js'],
    };

    const parser = new JestJunitParser(opts);
    const result = await parser.parse(filePath, fileContent);
    expect(result).toMatchSnapshot();

    const report = getReport([result]);
    fs.mkdirSync(path.dirname(outputPath), { recursive: true });
    fs.writeFileSync(outputPath, report);
  });

  test('parsing junit report with message succeeds', async () => {
    const fixturePath = path.join(
      __dirname,
      '..',
      '__fixtures__',
      'junit-with-message.xml',
    );
    const outputPath = path.join(
      __dirname,
      '..',
      '__outputs__',
      'junit-with-message.md',
    );
    const filePath = normalizeFilePath(
      path.relative(path.join(__dirname, '..'), fixturePath),
    );
    const fileContent = fs.readFileSync(fixturePath, { encoding: 'utf8' });

    const opts: ParseOptions = {
      parseErrors: true,
      trackedFiles: ['test.js'],
    };

    const parser = new JestJunitParser(opts);
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
      'jest-junit.xml',
    );
    const filePath = normalizeFilePath(
      path.relative(path.join(__dirname, '..'), fixturePath),
    );
    const fileContent = fs.readFileSync(fixturePath, { encoding: 'utf8' });

    const opts: ParseOptions = {
      parseErrors: true,
      trackedFiles: [],
    };

    const parser = new JestJunitParser(opts);
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
        'jest-junit.xml',
      );
      const filePath = normalizeFilePath(
        path.relative(path.join(__dirname, '..'), fixturePath),
      );
      const fileContent = fs.readFileSync(fixturePath, { encoding: 'utf8' });

      const opts: ParseOptions = {
        parseErrors: true,
        trackedFiles: [],
      };

      const parser = new JestJunitParser(opts);
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
      'jest-junit.xml',
    );
    const filePath = normalizeFilePath(
      path.relative(path.join(__dirname, '..'), fixturePath),
    );
    const fileContent = fs.readFileSync(fixturePath, { encoding: 'utf8' });

    const opts: ParseOptions = {
      parseErrors: true,
      trackedFiles: [],
    };

    const parser = new JestJunitParser(opts);
    const result = await parser.parse(filePath, fileContent);
    const report = getReport([result], {
      ...DEFAULT_OPTIONS,
      reportTitle: 'My Custom Title',
    });
    expect(report).toMatch(/^# My Custom Title\n/);
  });

  test('report ignores collapsed setting when configured to always', async () => {
    const fixturePath = path.join(
      __dirname,
      '../__fixtures__',
      'jest-junit.xml',
    );
    const filePath = normalizeFilePath(
      path.relative(path.join(__dirname, '..'), fixturePath),
    );
    const fileContent = fs.readFileSync(fixturePath, { encoding: 'utf8' });

    const opts: ParseOptions = {
      parseErrors: true,
      trackedFiles: [],
    };

    const parser = new JestJunitParser(opts);
    const result = await parser.parse(filePath, fileContent);
    const report = getReport([result], {
      ...DEFAULT_OPTIONS,
      collapsed: 'always',
    });
    expect(report).not.toContain(
      '<details><summary>Expand for details</summary>',
    );
    expect(report).not.toContain('</details>');
  });

  test('report is not collapsed when configured to never', async () => {
    const fixturePath = path.join(
      __dirname,
      '../__fixtures__',
      'jest-junit.xml',
    );
    const filePath = normalizeFilePath(
      path.relative(path.join(__dirname, '..'), fixturePath),
    );
    const fileContent = fs.readFileSync(fixturePath, { encoding: 'utf8' });

    const opts: ParseOptions = {
      parseErrors: true,
      trackedFiles: [],
    };

    const parser = new JestJunitParser(opts);
    const result = await parser.parse(filePath, fileContent);
    const report = getReport([result], {
      ...DEFAULT_OPTIONS,
      collapsed: 'never',
    });
    expect(report).not.toContain(
      '<details><summary>Expand for details</summary>',
    );
    expect(report).not.toContain('</details>');
  });

  test('report stays expanded when all tests pass even with auto collapse', async () => {
    const fixturePath = path.join(
      __dirname,
      '..',
      '__fixtures__',
      'jest-junit-eslint.xml',
    );
    const filePath = normalizeFilePath(
      path.relative(path.join(__dirname, '..'), fixturePath),
    );
    const fileContent = fs.readFileSync(fixturePath, { encoding: 'utf8' });

    const opts: ParseOptions = {
      parseErrors: true,
      trackedFiles: [],
    };

    const parser = new JestJunitParser(opts);
    const result = await parser.parse(filePath, fileContent);

    expect(result.failed).toBe(0);

    const report = getReport([result], {
      ...DEFAULT_OPTIONS,
      collapsed: 'auto',
    });

    expect(report).not.toContain(
      '<details><summary>Expand for details</summary>',
    );
    expect(report).not.toContain('</details>');
  });

  test('report stays expanded when tests fail even with auto collapse', async () => {
    const fixturePath = path.join(
      __dirname,
      '../__fixtures__',
      'jest-junit.xml',
    );
    const filePath = normalizeFilePath(
      path.relative(path.join(__dirname, '..'), fixturePath),
    );
    const fileContent = fs.readFileSync(fixturePath, { encoding: 'utf8' });

    const opts: ParseOptions = {
      parseErrors: true,
      trackedFiles: [],
    };

    const parser = new JestJunitParser(opts);
    const result = await parser.parse(filePath, fileContent);

    expect(result.failed).toBeGreaterThan(0);

    const report = getReport([result], {
      ...DEFAULT_OPTIONS,
      collapsed: 'auto',
    });

    expect(report).not.toContain(
      '<details><summary>Expand for details</summary>',
    );
    expect(report).not.toContain('</details>');
  });

  test('report includes the short summary', async () => {
    const fixturePath = path.join(
      __dirname,
      '../__fixtures__',
      'jest-junit.xml',
    );
    const filePath = normalizeFilePath(
      path.relative(path.join(__dirname, '..'), fixturePath),
    );
    const fileContent = fs.readFileSync(fixturePath, { encoding: 'utf8' });

    const opts: ParseOptions = {
      parseErrors: true,
      trackedFiles: [],
    };

    const parser = new JestJunitParser(opts);
    const result = await parser.parse(filePath, fileContent);
    const shortSummary = '1 passed, 4 failed and 1 skipped';
    const report = getReport([result], DEFAULT_OPTIONS, shortSummary);
    expect(report).toMatch(/^## 1 passed, 4 failed and 1 skipped\n/);
  });

  test('report includes a custom report title and short summary', async () => {
    const fixturePath = path.join(
      __dirname,
      '../__fixtures__',
      'jest-junit.xml',
    );
    const filePath = normalizeFilePath(
      path.relative(path.join(__dirname, '..'), fixturePath),
    );
    const fileContent = fs.readFileSync(fixturePath, { encoding: 'utf8' });

    const opts: ParseOptions = {
      parseErrors: true,
      trackedFiles: [],
    };

    const parser = new JestJunitParser(opts);
    const result = await parser.parse(filePath, fileContent);
    const shortSummary = '1 passed, 4 failed and 1 skipped';
    const report = getReport(
      [result],
      {
        ...DEFAULT_OPTIONS,
        reportTitle: 'My Custom Title',
      },
      shortSummary,
    );
    expect(report).toMatch(
      /^# My Custom Title\n## 1 passed, 4 failed and 1 skipped\n/,
    );
  });
});
