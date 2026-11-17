/**
 * @file Tests that the local file provider reads the test result files it matches.
 */

import { promises } from 'node:fs';
import path from 'node:path';
import { tmpdir } from 'node:os';
import { describe, expect, test } from '@jest/globals';
import { LocalFileProvider } from '../../../src/testresult/input-providers/local-file-provider.js';

describe('LocalFileProvider', () => {
  test('loads matching test result files', async () => {
    const dir = await promises.mkdtemp(path.join(tmpdir(), 'tr-'));
    const reportPath = path.join(dir, 'report.xml');
    await promises.writeFile(reportPath, '<testsuites />');

    const provider = new LocalFileProvider('unit', [path.join(dir, '*.xml')]);
    const files = await provider.load();

    expect(files.unit).toHaveLength(1);
    expect(files.unit[0].file).toBe(reportPath);
    expect(files.unit[0].content).toContain('testsuites');
  });
});
