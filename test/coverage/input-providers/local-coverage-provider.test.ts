import { promises as fs } from 'fs';
import path from 'path';
import { tmpdir } from 'os';
import { LocalCoverageProvider } from '../../../src/coverage/input-providers/local-coverage-provider.js';

describe('LocalCoverageProvider', () => {
  test('loads matching coverage files', async () => {
    const dir = await fs.mkdtemp(path.join(tmpdir(), 'cov-'));
    const reportPath = path.join(dir, 'coverage.info');
    await fs.writeFile(reportPath, 'TN:\nend_of_record');

    const provider = new LocalCoverageProvider([path.join(dir, '*.info')]);
    const files = await provider.load();

    expect(files).toHaveLength(1);
    expect(files[0].file).toBe(reportPath);
    expect(files[0].content).toContain('TN:');
  });
});
