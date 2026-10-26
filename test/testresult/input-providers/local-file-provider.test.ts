import { promises as fs } from 'fs';
import path from 'path';
import { tmpdir } from 'os';
import { LocalFileProvider } from '../../../src/testresult/input-providers/local-file-provider.js';

describe('LocalFileProvider', () => {
  test('loads matching test result files', async () => {
    const dir = await fs.mkdtemp(path.join(tmpdir(), 'tr-'));
    const reportPath = path.join(dir, 'report.xml');
    await fs.writeFile(reportPath, '<testsuites />');

    const provider = new LocalFileProvider('unit', [path.join(dir, '*.xml')]);
    const files = await provider.load();

    expect(files['unit']).toHaveLength(1);
    expect(files['unit'][0].file).toBe(reportPath);
    expect(files['unit'][0].content).toContain('testsuites');
  });
});
