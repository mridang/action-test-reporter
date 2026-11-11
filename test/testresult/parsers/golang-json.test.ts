/**
 * @file Tests the go test JSON parser against its fixtures.
 */

import { mkdir, readFile, writeFile } from 'node:fs/promises';
import path from 'node:path';

import { GolangJsonParser } from '../../../src/testresult/parsers/golang-json/golang-json-parser.js';
import { ParseOptions } from '../../../src/testresult/test-parser.js';
import { getReport } from '../../../src/testresult/formatter/summary-formatter.js';
import { normalizeFilePath } from '../../../src/testresult/utils/path-utils.js';
import { getDirname } from '../helpers/dir.js';

const testDir = getDirname(import.meta.url);

describe('golang-json tests', () => {
  test('report from ./reports/dotnet test results matches snapshot', async () => {
    const fixturePath = path.join(
      testDir,
      '../__fixtures__',
      'golang-json.json',
    );
    const outputPath = path.join(testDir, '../__outputs__', 'golang-json.md');
    const filePath = normalizeFilePath(
      path.relative(path.join(testDir, '..'), fixturePath),
    );
    const fileContent = await readFile(fixturePath, { encoding: 'utf8' });

    const opts: ParseOptions = {
      parseErrors: true,
      trackedFiles: ['calculator.go', 'calculator_test.go'],
    };

    const parser = new GolangJsonParser(opts);
    const result = await parser.parse(filePath, fileContent);
    expect(result).toMatchSnapshot();

    const report = getReport([result]);
    await mkdir(path.dirname(outputPath), { recursive: true });
    await writeFile(outputPath, report);
  });
});
