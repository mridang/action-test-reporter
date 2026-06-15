import * as fs from 'fs';
import * as path from 'path';

import { PythonXunitParser } from '../../../src/testresult/parsers/python-xunit/python-xunit-parser.js';
import { ParseOptions } from '../../../src/testresult/test-parser.js';
import {
  DEFAULT_OPTIONS,
  getReport,
} from '../../../src/testresult/formatter/summary-formatter.js';
import { normalizeFilePath } from '../../../src/testresult/utils/path-utils.js';
import { getDirname } from '../helpers/dir.js';

const __dirname = getDirname(import.meta.url);

const defaultOpts: ParseOptions = {
  parseErrors: true,
  trackedFiles: [],
};

describe('python-xunit unittest report', () => {
  const fixturePath = path.join(
    __dirname,
    '..',
    '__fixtures__',
    'python-xunit-unittest.xml',
  );
  const filePath = normalizeFilePath(
    path.relative(path.join(__dirname, '..'), fixturePath),
  );
  const fileContent = fs.readFileSync(fixturePath, { encoding: 'utf8' });
  const outputPath = path.join(
    __dirname,
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
    fs.mkdirSync(path.dirname(outputPath), { recursive: true });
    fs.writeFileSync(outputPath, report);
  });

  test('report does not include a title by default', async () => {
    const parser = new PythonXunitParser(defaultOpts);
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
      const parser = new PythonXunitParser(defaultOpts);
      const result = await parser.parse(filePath, fileContent);
      const report = getReport([result], {
        ...DEFAULT_OPTIONS,
        reportTitle,
      });
      expect(report).toMatch(/^!\[Tests failed]/);
    },
  );

  test('report includes a custom report title', async () => {
    const parser = new PythonXunitParser(defaultOpts);
    const result = await parser.parse(filePath, fileContent);
    const report = getReport([result], {
      ...DEFAULT_OPTIONS,
      reportTitle: 'My Custom Title',
    });
    expect(report).toMatch(/^# My Custom Title\n/);
  });
});

describe('python-xunit pytest report', () => {
  const fixturePath = path.join(
    __dirname,
    '..',
    '__fixtures__',
    'python-xunit-pytest.xml',
  );
  const filePath = normalizeFilePath(
    path.relative(path.join(__dirname, '..'), fixturePath),
  );
  const fileContent = fs.readFileSync(fixturePath, { encoding: 'utf8' });
  const outputPath = path.join(
    __dirname,
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
    fs.mkdirSync(path.dirname(outputPath), { recursive: true });
    fs.writeFileSync(outputPath, report);
  });
});
