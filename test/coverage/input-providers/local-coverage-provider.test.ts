/**
 * @file Tests that the local coverage provider finds the coverage files it is pointed at.
 */

import { promises } from 'node:fs';
import path from 'node:path';
import { tmpdir } from 'node:os';
import { describe, expect, test } from '@jest/globals';
import { LocalCoverageProvider } from '../../../src/coverage/input-providers/local-coverage-provider.js';

describe('LocalCoverageProvider', () => {
  test('loads matching coverage files', async () => {
    const dir = await promises.mkdtemp(path.join(tmpdir(), 'cov-'));
    const reportPath = path.join(dir, 'coverage.info');
    await promises.writeFile(reportPath, 'TN:\nend_of_record');

    const provider = new LocalCoverageProvider([path.join(dir, '*.info')]);
    const files = await provider.load();

    expect(files).toHaveLength(1);
    expect(files[0].file).toBe(reportPath);
    expect(files[0].content).toContain('TN:');
  });
});
